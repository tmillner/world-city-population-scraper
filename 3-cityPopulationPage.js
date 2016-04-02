'use strict';

var xray = require('x-ray')();
var Promise = require('promise');
var fs = require('fs');
var OUTPUT_FILE = '3-cityPopulationPage.json';

fs.readFile('2b-nonMatchingCities.json', function(err, data) {
  var fileJson = JSON.parse(data);

  fileJson.forEach(function (item) {
    if (item.cities) {
      function findCities(cities) {
        cities.forEach(function(city) {
          console.log(city);
          var writeCitySet = {country: item.country, cityLink: city.cityLink || ""}
          if (city.cityLink) {
            xray(city.cityLink, 'table.geography tr.mergedrow', [{
              header: 'th:nth-of-type(1)',
              data: 'td:nth-of-type(1)'
            }])(function(err, geoData) {
              if (geoData) {
                var populationRow = geoData.find(function(element, index, array) {
                  return ((element.header.toLowerCase().search("total") !== -1 ||
                    element.header.toLowerCase().search("city") !== -1 ||
                    element.header.toLowerCase().search("population") !== -1) &&
                    element.data.match(/^[0-9\s,]+$/g));
                });
                // console.log('populationRow check ' + JSON.stringify(populationRow));
                if (populationRow !== undefined) {
                  var header = populationRow.header;
                  var data = populationRow.data;
                  writeCitySet.population = data.replace(/[^0-9\s,]/, "");
                  fs.appendFile(OUTPUT_FILE, JSON.stringify(writeCitySet, null, " "));
                }
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
          }
        })
      }
      if (item.cities[0].length) {
        item.cities.forEach(function(cities) {
          findCities(cities);
        })
      }
      else {
        findCities(item.cities);
      }
    }
  });
});
