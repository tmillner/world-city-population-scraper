#!/bin/bash
input1="1-countriesCityColumnIndex.js"
input2="2-cityPopulationsOverview.js"
input2b="2b-nonMatchingCities.js"
input3="3-cityPopulationPage.js"
FILES=("$input1" "$input2" "$input2b" "$input3")

for input in ${FILES[@]}; do
  output="$input"on
  if [ -a "$output" ]; then
    rm "$output"
  fi
  if [ "$input" == "$input3" ]; then
    node "$input" "$input2b"on
    node "$input" "$input2"on # < May take a while
  else
    node "$input"
  fi
  # Encapsulate result in brackets, & add commas between objects -- file should be an array
  sed -i '.bak' '1s/^/[/' ./$output
  echo "]" >> ./$output
  sed -i '.bak' 's/}{/},{/g' ./$output
  echo "File $input complete."
done

# Run consolidate
finalOutput="world-city-population-scraper.json"
if [ -a "$finalOutput" ]; then
  rm "$finalOutput"
fi
node "./consolidate.js"
echo "Completed, see file: $finalOutput"