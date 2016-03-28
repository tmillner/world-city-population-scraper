'use strict';

var xray = require('x-ray')();
var Promise = require('promise');
var fs = require('fs');
var OUTPUT_FILE = '2b-nonMatchingCities.json';

fs.readFile('countriesCityColumnIndex.json', function(err, data) {
  var fileJson = JSON.parse(data);

  fileJson.map(function (item) {
    if (item.cityColumnIndex === -1) {

      // 62 total :(
      // STORED IN ul li RESULTS
      // https://en.wikipedia.org/wiki/List_of_cities_in_the_Marshall_Islands
      // document.querySelector('ul:nth-of-type(1) li')
      // https://en.wikipedia.org/wiki/List_of_cities_in_El_Salvador
      // document.querySelector('ul:nth-of-type(2) li')
      // https://en.wikipedia.org/wiki/List_of_cities_in_Vanuatu
      // document.querySelector('ul:nth-of-type(1) li')
      // https://en.wikipedia.org/wiki/Administrative_divisions_of_the_Federated_States_of_Micronesia
      // document.querySelector('div#mw-content-text > ul li')
      // https://en.wikipedia.org/wiki/List_of_cities_and_towns_in_Brunei
      // document.querySelector('ul:nth-of-type(1) li')
      // https://en.wikipedia.org/wiki/List_of_cities_in_Ivory_Coast
      // document.querySelector('ul:nth-of-type(1) li')
      // https://en.wikipedia.org/wiki/List_of_cities_in_Antigua_and_Barbuda
      // document.querySelector('ul:nth-of-type(1) li')
      // https://en.wikipedia.org/wiki/List_of_cities_in_Nigeria
      // document.querySelector('div#mw-content-text > ul li')
      // https://en.wikipedia.org/wiki/List_of_cities_in_Somalia
      // document.querySelector('ul:nth-of-type(1) li')
      // https://en.wikipedia.org/wiki/List_of_cities_in_Kenya
      // document.querySelector('table.multicol tr td:nth-of-type(1) ul li')
      // document.querySelector('table.multicol tr td:nth-of-type(2) ul li')
      // document.querySelector('table.multicol tr td:nth-of-type(3) ul li')
      // https://en.wikipedia.org/wiki/List_of_cities_and_towns_in_Fiji
      // document.querySelector('div#mw-content-text > ul li')
      // https://en.wikipedia.org/wiki/List_of_cities_in_Uzbekistan
      // document.querySelector('ul:nth-of-type(1) li')
      // https://en.wikipedia.org/wiki/List_of_cities,_towns_and_villages_in_the_Maldives
      // document.querySelector('ul:nth-of-type(1) li')
      // https://en.wikipedia.org/wiki/List_of_cities_and_towns_in_Ethiopia
      // 
      // https://en.wikipedia.org/wiki/List_of_places_in_Singapore
      // document.querySelectorAll('div#mw-content-text > ul li')
      // https://en.wikipedia.org/wiki/List_of_cities_in_Australia
      // document.querySelectorAll('div.div-col.columns ul li')
      // https://en.wikipedia.org/wiki/List_of_towns_and_villages_in_Kiribati
      // document.querySelectorAll('ul:nth-of-type(1) li')
      // https://en.wikipedia.org/wiki/List_of_cities_in_Saint_Lucia
      // document.querySelectorAll('ul:nth-of-type(1) li')
      // https://en.wikipedia.org/wiki/List_of_cities_in_Sierra_Leone
      // document.querySelectorAll('ol:nth-of-type(1) li')
      // https://en.wikipedia.org/wiki/List_of_cities_and_towns_in_Guyana
      // document.querySelectorAll('div#mw-content-text > ul:nth-of-type(2) li')
      // https://en.wikipedia.org/wiki/List_of_cities_in_Rwanda
      // document.querySelectorAll('div#mw-content-text > ul:nth-of-type(1) li')
      // https://en.wikipedia.org/wiki/List_of_cities_in_The_Gambia
      // document.querySelectorAll('div#mw-content-text > ul:nth-of-type(1) li')
      // https://en.wikipedia.org/wiki/List_of_cities_in_the_Comoros
      // document.querySelectorAll('div#mw-content-text > p b')
      // https://en.wikipedia.org/wiki/List_of_cities_in_Bahrain
      // document.querySelectorAll('div#mw-content-text > ol:nth-of-type(1) li')
      // https://en.wikipedia.org/wiki/List_of_cities_in_Seychelles
      // document.querySelectorAll('div#mw-content-text > ul:nth-of-type(1) li')
      // https://en.wikipedia.org/wiki/List_of_cities,_towns_and_villages_in_East_Timor
      // document.querySelectorAll('div#mw-content-text > ul:nth-of-type(1) > li > a')
      // https://en.wikipedia.org/wiki/List_of_towns_and_villages_in_Dominica
      // document.querySelectorAll('div.column-count-3 > ul:nth-of-type(1) li')
      // https://en.wikipedia.org/wiki/List_of_cities_in_Malawi
      // document.querySelectorAll('div#mw-content-text > ul li')


      // TABLE WHICH IS HAS HEADERS NOT ON FIRST ROW 
      // https://en.wikipedia.org/wiki/List_of_cities_in_Guinea
      // https://en.wikipedia.org/wiki/List_of_cities_in_Tanzania
      // https://en.wikipedia.org/wiki/List_of_cities_in_Tajikistan
      // https://en.wikipedia.org/wiki/List_of_cities_and_towns_in_Cabo_Verde
      // Parse first 4 rows to check for the things in 2, if match save the target and process

      // SPECIAL CASES
      // https://en.wikipedia.org/wiki/List_of_cities_in_the_United_States
      // go to https://en.wikipedia.org/wiki/List_of_United_States_cities_by_population then do normal 2
      // https://en.wikipedia.org/wiki/Municipalities_of_Brazil
      // go to https://en.wikipedia.org/wiki/List_of_largest_cities_in_Brazil then do normal 2
      //

      xray(item.link, 'ul li b a:not([class])', [{
        cityName: "",
        cityLink: "@href"
        population: ""
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
  });
});
