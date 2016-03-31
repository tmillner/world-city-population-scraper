'use strict';

var xray = require('x-ray')();
var Promise = require('promise');
var fs = require('fs');
var URL = "https://en.wikipedia.org/wiki/Lists_of_cities_by_country";

new Promise(function (resolve, reject) {
  xray(URL, 'ul li b a:not([class])', [{
        country: '',
        link: '@href'
  }])(function(err, countryResponse) {
    if (err) {
      reject(err);
    }
    var transformCountryOperation = countryResponse.map(function(item) {
      var country = item.country.split("in ")[1];
      var link = item.link
      // For a few exceptions, reformat the cities link to go to a page with real results
      switch (country) {
        case "the United States":
          link = "https://en.wikipedia.org/wiki/List_of_United_States_cities_by_population";
          break;
        case "Brazil":
          link = "https://en.wikipedia.org/wiki/List_of_largest_cities_in_Brazil";
          break;
      }
      return {country: country, link: link};
    });
    resolve(transformCountryOperation);
  });
}).then(function(countries) {
  var getCountriesCityLinks = countries.map(function(item) {
    function saveRecord(resultMap) {
      var cityColumnIndex = resultMap.findIndex(function(element, index, array) {
        return (element.heading.toLowerCase().search("name") !== -1 ||
          element.heading.toLowerCase().search("city") !== -1 ||
          element.heading.toLowerCase().search("cities") !== -1 ||
          element.heading.toLowerCase().search("community") !== -1 ||
          element.heading.toLowerCase().search("english") !== -1 ||
          element.heading.toLowerCase().search("town") !== -1 /* sweden */ ||
          element.heading.toLowerCase().search("commune") !== -1 /* france */ ||
          element.heading.toLowerCase().search("place") !== -1 /* morroco */ ||
          element.heading.toLowerCase().search("municipality") !== -1 /* san marino */);
      });

      var populationCensusString = resultMap.reduce(function(prev, curr, index, array) {
        var foundNew = false;
        if (curr.heading.toLowerCase().search("pop") !== -1 || 
          curr.heading.toLowerCase().search("est") !== -1 ||
          curr.heading.match(/[0-9]{4}/g)) {
          if (curr.heading.match(/[0-9]{4}/g)) {
            if (curr.heading.match(/[0-9]{4}/g)[0] > prev.year) {
              return {"year": curr.heading.match(/[0-9]{4}/g)[0], "column":index} ;
            }
          }
        }
        if (!foundNew) {
          return prev;
        }
      }, {"year":"", column:""});

      new Promise(function (resolve, reject) {
        resolve({
          country: item.country,
          link: item.link,
          cityColumnIndex: cityColumnIndex,
          populationCensusDate: populationCensusString.year,
          populationCensusDateColumnIndex: populationCensusString.column
        })
      }).then(function(preCities) {
        fs.appendFile('1-countriesCityColumnIndex.json', JSON.stringify(preCities, null, " "));
      })
    }

    xray(item.link, "table.wikitable th", [{
        heading: ''
    }])(function(err, countryPageTableHeadings) {
      if (err) {
        console.log("OH NO! " + err);
      }
      if (countryPageTableHeadings.length < 1){
        xray(item.link, "table.wikitable", [{
            row1: xray('tr:nth-of-type(1) td', [{heading:''}]),
            row2: xray('tr:nth-of-type(2) td', [{heading:''}]),
            row3: xray('tr:nth-of-type(3) td', [{heading:''}])
        }])(function(err, countryPageTableTopRows) {
          if (err) {
            console.log("Another failure >:-0! " + err);
          }
          for(var key in countryPageTableTopRows[0]) {
            var match = countryPageTableTopRows[0][key].find(function(element, index, array) {
            return (element.heading.toLowerCase().search("name") !== -1 ||
              element.heading.toLowerCase().search("city") !== -1 ||
              element.heading.toLowerCase().search("community") !== -1 ||
              element.heading.toLowerCase().search("town") !== -1 /* sweden */ ||
              element.heading.toLowerCase().search("municipality") !== -1 /* san marino */);
            })
            if ((!countryPageTableHeadings || countryPageTableHeadings.length < 1) && match){
              countryPageTableHeadings = countryPageTableTopRows[0][key];
              console.log(countryPageTableHeadings);
              saveRecord(countryPageTableHeadings); // Needed (but causes dup entry)
              return;
            }
          }
        })
      }
      else {
        saveRecord(countryPageTableHeadings);
      }
    })
  })
})