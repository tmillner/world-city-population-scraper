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
      return {country: country, link: item.link};
    });
    resolve(transformCountryOperation);
  });
}).then(function(countries) {
  var getCountriesCityLinks = countries.map(function(item) {
    xray(item.link, "table.wikitable th", [{
        heading: ''
    }])(function(err, countryPageTableHeadings) {
      if (err) {
        console.log("OH NO! " + err);
      }
      var cityColumnIndex = countryPageTableHeadings.findIndex(function(element, index, array) {
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

      var populationCensusString = countryPageTableHeadings.reduce(function(prev, curr, index, array) {
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
        // For a few exceptions, reformat the cities link to go to a page with real results
        switch (item.country.toLowerCase()) {
          case ("the united states"):
            item.link = "https://en.wikipedia.org/wiki/List_of_United_States_cities_by_population";
            break;
          case ("brazil"):
            item.link = "https://en.wikipedia.org/wiki/List_of_largest_cities_in_Brazil";
            break;
        }
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
    })
  })
})