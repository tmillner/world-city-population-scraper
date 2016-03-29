'use strict';

var xray = require('x-ray')();
var Promise = require('promise');
var fs = require('fs');
var OUTPUT_FILE = '3-cityPopulationPage.json';

fs.readFile('2b-nonMatchingCities.json', function(err, data) {
  var fileJson = JSON.parse(data);

  fileJson.forEach(function (item) {
    if (item.cities) {
      item.cities.forEach(function(cities) {
        cities.forEach(function(city) {
          var writeCitySet = {country: item.country}
          if (city.cityLink) {
            xray(city.cityLink, 'table.geography tr.mergedrow', [{
              header: 'th:nth-of-type(1)',
              data: 'td:nth-of-type(1)'
            }])(function(err, geoData) {
              if (geoData) {
                console.log('Geodata for city ' + city.cityLink + ' is ' + JSON.stringify(geoData));
                var populationRow = geoData.find(function(element, index, array) {
                  return (element.header.toLowerCase().search("total") !== -1 ||
                    element.header.toLowerCase().search("city") !== -1 ||
                    element.header.toLowerCase().search("population") !== -1);
                });
                if (populationRow) {
                  var header = element.header;
                  var data = element.data;
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
      })
    }
  });
});
