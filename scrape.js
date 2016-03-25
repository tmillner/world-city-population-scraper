'use strict';

var xray = require('x-ray')();
var Promise = require('promise');
var fs = require('fs');
var URL = "https://en.wikipedia.org/wiki/Lists_of_cities_by_country";

/*
{
  city_town
  country
  population
  date_population_noted
}
*/

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
    // fs.writeFile('countries.json', JSON.stringify(transformCountryOperation, null, " "));
    resolve(transformCountryOperation);
  });
}).then(function(countries) {
  var getCountriesCityLinks = countries.map(function(item) {
    xray(item.link, "table.wikitable th", [{
        heading: ''
    }])(function(err, countryPageTableHeadings) {
      if (err) {
        console.log("OH NO!");
        reject(err);
      }
      var cityColumnIndex = countryPageTableHeadings.findIndex(function(element, index, array) {
        if (element.heading.toLowerCase().search("name") !== -1 ||
          element.heading.toLowerCase().search("city") !== -1 ||
          element.heading.toLowerCase().search("cities") !== -1 ||
          element.heading.toLowerCase().search("community") !== -1 ||
          element.heading.toLowerCase().search("english") !== -1) {
          return index;
        }
      });

      var populationCensusDate = countryPageTableHeadings.find(function(element, index, array) {
        return (element.heading.toLowerCase().search("pop") !== -1)
      });

      new Promise(function (resolve, reject) {
        resolve({
          country: item.country, 
          link: item.link, 
          cityColumnIndex: cityColumnIndex, 
          populationCensusDate: populationCensusDate 
        })
      }).then(function(preCities) {
        //fs.appendFile('countries_cityColumnIndex.json', JSON.stringify(preCities, null, " "));
        if (preCities.cityColumnIndex !== -1) {
          xray(preCities.link, "table.wikitable td:nth-child(" + preCities.cityColumnIndex + ") a:not([class])", [{
            city: '',
            link: '@href'
          }])(function(err, cities) {
            console.log(cities);
          })
        }
      })

    })
  })
})


/*
function cities_in_country_simpleList() {
  if (handle_name_city_link_1)
  # handle_name_city_link
  # 1 FROM COUNTRY PAGE (column list of names)
  # var b = document.querySelectorAll("table.wikitable.sortable.jquery-tablesorter thead tr th")
  # for(var i=0;i<b.length;i++){
  #   if(b[i].innerText.toLowerCase().search("city") || "cities" || "name" || "community" | "english") {
  #     console.log("Column index #" + i );
  #   }
  # }
  # table."wikitable sortable jquery-tablesorter"
  # tbody > tr > td[column_index]
  # 2 FROM COUNTRY PAGE (the FIRST simple list of names)
  # document.querySelector('ul').querySelectorAll('li a:not([class])')

  # handle_date_population_noted_dates
  # 1 FROM COUNTRY PAGE (last column in the list)
  # var b = document.querySelectorAll("table.wikitable.sortable.jquery-tablesorter thead tr th")
  # for(var i=b.length-1;i>=0;i--){
  #   if(b[i].innerText.toLowerCase().search("population") != -1) {
  #     console.log("Column index #" + i );
  #   }
  # }

  # 2 FROM CITY PAGE (Population (2012)[1])
  # var a = document.querySelector('table.infobox.geography.vcard .mergedtoprow th[colspan]');
  # var date_population_noted = a.innerText.match(/[0-9]+/g)[0]
}
*/
