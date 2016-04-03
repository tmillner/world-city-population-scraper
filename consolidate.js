'use strict';

var xray = require('x-ray')();
var Promise = require('promise');
var fs = require('fs');
var OUTPUT_FILE = 'world-city-population-scraper.json';
var output=[];

 // Take the step-by-step json files and sew them together for final output
fs.readFile('1-countriesCityColumnIndex.json', function(err, data) {
  var countryFile = JSON.parse(data);
  countryFile.sort(function(a, b) {
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
  fs.readFile('3-cityPopulationPage.json', function(err, data) {
    var cityFile = JSON.parse(data);
    cityFile.sort(function(a, b) {
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

    cityFile.forEach(function(cityObject, cityIndex) {
      var country = countryFile.find(function(countryObject) {
        return countryObject.country == cityObject.country;
      })
      var existingCountry = output.findIndex(function(existingCountry) {
        return (existingCountry.country && 
          existingCountry.country == country.country);
      })
      /* country should NEVER be undefined (due to step propogation w/prepopulated values) */
      var customCountryOutput = {
        country: country.country,
        countryLink: country.link
        /* Don't worry about default population census date, city files don't override it */ 
      }
      var customCityOutput = {
        link: cityObject.cityLink,
        population: cityObject.population
      }

      if (existingCountry === -1) {
        customCountryOutput.cities = [customCityOutput];
        output.push(customCountryOutput);
      }
      else {
          output[existingCountry].cities.push(customCityOutput);
      }
      if(cityFile.length -1 === cityIndex) {
        fs.appendFile(OUTPUT_FILE, JSON.stringify(output, null, " "));
      }
    })
  });
});