'use strict';

var xray = require('x-ray')();
var Promise = require('promise');
var fs = require('fs');
var OUTPUT_FILE = '3-cityPopulationPage.json';

fs.readFile('2-cityPopulationsOverview.json', function(err, data) {
  var fileJson = JSON.parse(data);

  fileJson.map(function (item) {
    item.cities && item.cities.map(function(city) {
      var writeCitySet = {country: item.country}
      if (city.cityLink) {
        xray(item.link, 'table.geography tr', [{
          populationYear: 'th span',
          header: 'th',
          data: 'td'
        }])(function(err, geoData) {
          console.log('there is geoData ' + geoData)
          var populationRow = geoData.find(function(element, index, array) {
            return (element.populationYear.match(/[0-9]{4}/g) || 
              element.header.toLowerCase().search("total") !== -1 ||
              element.header.toLowerCase().search("city") !== -1 ||
              element.header.toLowerCase().search("total") !== -1);
          });
          if (populationRow) {
            var populationYear = element.populationYear;
            var header = element.header;
            var data = element.data;
            if (populationYear.match(/[0-9]{4}/g)) {
              writeCitySet.populationYear = populationYear.match(/[0-9]{4}/g)[0];
            }
            writeCitySet.population = data.replace(/[^0-9\s,]/, "");
            fs.appendFile(OUTPUT_FILE, JSON.stringify(writeCitySet, null, " "));
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
  });
});
