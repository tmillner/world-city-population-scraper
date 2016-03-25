'use strict';

var xray = require('x-ray')();
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

xray(URL, 'ul li b a:not([class])', [{
    country: '',
    _link: 'a@href' /* innerText is better than title (which lies) */
}])(function(err, countryResponse) {
  var transformCountryOperation = countryResponse.map(function(item) {
    var country = item.country.split("in ")[1];
    return {country: country};
  });
  fs.writeFile('countries.json', JSON.stringify(transformCountryOperation, null, " "));

  // handle_name_city_links
  xray(countryResponse._link, "table.wikitable.sortable.jquery-tablesorter thead tr th", [{
    heading: ''
  }])(function(err, cityResponse) {
    console.log("INSIDE!");
    if (err) {
      console.log("Oh snap! It failed " + err);
    }
    cityResponse.findIndex(function(element, index, array) {
      if (element.toLowerCase().search("city") !== -1 ||
        element.toLowerCase().search("cities") !== -1 ||
        element.toLowerCase().search("name") !== -1 ||
        element.toLowerCase().search("community") !== -1 ||
        element.toLowerCase().search("english") !== -1) {
        /* TODO Error checking (index === -1) ! */
        xray(countryResponse.link, 
          "table.wikitable.sortable.jquery-tablesorter tbody tr td:nth-child(" + index + ")", [{
            city: '',
            _link: 'a@href'
          }])(function(err, specificCityResponse) {
            if (err) {
              console.log("Another failure!!");
            }
            fs.writeFile('cities.json', JSON.stringify(specificCityResponse, null, " "));
          })
      } 
    })


    // Go to this page again with the links of cities now found
    xray()
  })
});

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
