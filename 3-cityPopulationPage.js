'use strict';

var xray = require('x-ray')();
var Promise = require('promise');
var fs = require('fs');
var OUTPUT_FILE = '3-cityPopulationPage.json';
var inputFile=process.argv[2] // "2b-nonMatchingCities.json"

// The input is likely very large to run on it's own,
// Break up the async queries into tasks (feedable to for loop)
fs.readFile(inputFile, function(err, data) {
  var fileJson = JSON.parse(data);

  var tasks = fileJson.map(function (item) {
    return function() {
      return new Promise(function(resolve,reject) {
        function findCities(cities, lastCity) {
          cities.forEach(function(city) {
            var writeCitySet = {country: item.country, cityLink: city.cityLink || ""}
            if (city.cityLink) {
              xray(city.cityLink, 'table.geography tr.mergedrow', [{
                header: 'th:nth-of-type(1)',
                data: 'td:nth-of-type(1)'
              }])(function(err, geoData) {
                if (geoData) {
                  geoData.reverse();
                  var populationRow = geoData.find(function(element, index, array) {
                    return ((element.header && element.data) &&
                      (element.header.toLowerCase().search("incorporat") === -1) &&
                      (element.header.toLowerCase().search("total") !== -1 ||
                      element.header.toLowerCase().search("city") !== -1 ||
                      element.header.toLowerCase().search("population") !== -1) &&
                      element.data.match(/^[0-9\s,]+(\s\(.*)?$/g));
                  });
                  console.log('populationRow check ' + JSON.stringify(populationRow));
                  if (populationRow !== undefined) {
                    var header = populationRow.header;
                    var dataArr = populationRow.data.match(/[0-9\s,]+/g);
                    writeCitySet.population = dataArr[0]; // TO FIND LARGEST POP COMPATIBLE FOR US CITIES
                    fs.appendFile(OUTPUT_FILE, JSON.stringify(writeCitySet, null, " "));
                  }
                  if (lastCity.cityLink === city.cityLink) {
                    resolve("Finished from if on " + JSON.stringify(city));
                  }
                }
                else if (lastCity.cityLink === city.cityLink) {
                    resolve("Finished from if (else if) on " + JSON.stringify(city));
                }
              })
            } else {
              if (item.populationCensusDate != "") {
                writeCitySet.populationYear = item.populationCensusDate;
              }
              if (city.cityName && city.population) {
                writeCitySet.cityName = city.cityName;
                writeCitySet.population = city.population;
                fs.appendFile(OUTPUT_FILE, JSON.stringify(writeCitySet, null, " "));
              }
              if (JSON.stringify(city) == JSON.stringify(lastCity)) {
                resolve("Finished from else on" + JSON.stringify(city));
              }
            }
          })
        }
        if (item.cities && item.cities[0].length) {
          item.cities.forEach(function(cities) {
            findCities(cities, cities[cities.length-1]);
          })
        }
        else if (item.cities) {
          findCities(item.cities, item.cities[item.cities.length-1]);
        }
        else {
          resolve("No cities key...");
        }
      })
    }
  });

  var task = tasks[0]().then(function(res){console.log(res);});
  // task.then(tasks[1]).then(function(res){console.log(res);});
  for(var i=1; i<=tasks.length-1; i++) task = task.then(tasks[i]);
});
