'use strict';

var xray = require('x-ray')();
var Promise = require('promise');
var fs = require('fs');
var OUTPUT_FILE = '2-cityPopulationsOverview.json';

fs.readFile('1-countriesCityColumnIndex.json', function(err, data) {
  var fileJson = JSON.parse(data);
  fileJson.sort(function(a, b) {
    if (b.country > a.country) {
      return 1;
    }
    if (a.country > b.country) {
      return -1;
    }
    else {
      return 0;
    }
  })
  fileJson.map(function (item) {
    if (item.cityColumnIndex != -1) {
      xray(item.link, "table.wikitable tr", [{
        cityName: "td:nth-child(" + (item.cityColumnIndex+1) + ")",
        cityLink: "a@href",
        population: "td:nth-child(" + (item.populationCensusDateColumnIndex+1) + ")"
      }])(function(err, cityPageCities) {
        if (err) {
          console.log("WHOOPS! Couldn't process " + item + " due to: " + err);
          return;
        }
        var countryCity = item;
        countryCity.cities = cityPageCities;
        if (item.populationCensusDateColumnIndex === "") {
          countryCity.cities.forEach(function(cityPop) {
            delete cityPop.population;
          })
        }
        fs.appendFile(OUTPUT_FILE, JSON.stringify(countryCity, null, " "));
      })
    }
    else {
      // May want to get rid of this and let processing occur on smaller 
      // file (1.json) via another step)
      fs.appendFile(OUTPUT_FILE, JSON.stringify(item, null, " "));
    }
  });
});
