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
