'use strict';

var xray = require('x-ray')();
var Promise = require('promise');
var fs = require('fs');
var OUTPUT_FILE = '2b-nonMatchingCities.json';
var selectors = [
'div#mw-content-text > table.multicol tr td:nth-of-type(1) ul li' /* type = 1 - 3 */,
'div#mw-content-text > div.columns ul li',
'div#mw-content-text > ol li',
'div#mw-content-text > ul:nth-of-type(2) li',
'div#mw-content-text > p b',
'div#mw-content-text > ul li',
'div#mw-content-text > table td li' /* Germany */
]

fs.readFile('1-countriesCityColumnIndex.json', function(err, data) {
  var fileJson = JSON.parse(data);

  fileJson.map(function (item) {
    var countryCity = item;
    countryCity.cities=[];
    if (item.cityColumnIndex === -1) {
      selectors.forEach(function(selector, i, arr) {
        xray(item.link, selectors[i] + ' a:not([class])', [{
          cityName: "",
          cityLink: "@href"
        }])(function(err, cityMap) {

          if (err) {
            console.log("WHOOPS! Couldn't process " + item + " due to: " + err);
          }
          if (cityMap.length <= 2) {
            console.log(item.country + ' - non compatible selector using ' + selector);
          }
          else {
            countryCity.cities.push(cityMap);
          }
          if (i === selectors.length-1) {
            fs.appendFile(OUTPUT_FILE, JSON.stringify(countryCity, null, " "));
          }
        }) 
      })   
    }
  });
});


// TABLE WHICH IS HAS HEADERS NOT ON FIRST ROW 
// https://en.wikipedia.org/wiki/List_of_cities_in_Guinea
// https://en.wikipedia.org/wiki/List_of_cities_in_Tanzania
// https://en.wikipedia.org/wiki/List_of_cities_in_Tajikistan
// https://en.wikipedia.org/wiki/List_of_cities_and_towns_in_Cabo_Verde
// https://en.wikipedia.org/wiki/List_of_cities_and_towns_in_Bulgaria
// Parse first 4 rows to check for the things in 2, if match save the target and process
// SPECIAL CASES
// https://en.wikipedia.org/wiki/List_of_cities_in_the_United_States
// go to https://en.wikipedia.org/wiki/List_of_United_States_cities_by_population then do normal 2
// https://en.wikipedia.org/wiki/Municipalities_of_Brazil
// go to https://en.wikipedia.org/wiki/List_of_largest_cities_in_Brazil then do normal 2
