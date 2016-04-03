Crawler on wikipedia to get all 'cities' population data. The project works based on a series of scripts feeding each other. 
Intermediate JSON files are saved for cross checking (regressions). 
- 1) In bash run `chmod +x ./run.sh`
- 2) Execute `./run.sh`


*Filtering is performed by value (possibly erroneous) preservation. Upon the last script - 3-cityPopulationPage.js - a filter is performed only based on valid population values.*

### Alternative data sets
- http://download.geonames.org/export/dump/
- https://www.maxmind.com/en/free-world-cities-database
- http://www.travelgis.com/default.asp?framesrc=/cities/
- http://www.opengeocode.org/download.php#cities
