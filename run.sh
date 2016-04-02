#!/bin/bash

input1="1-countriesCityColumnIndex.js"
output1="$input1"on
if [ -a "$output1" ]; then
  rm "$output1"
fi
node "$input1"
# Encapsulate result in brackets, & add commas between objects -- file should be an array
sed -i '.test' '1s/^/[/' ./$output1
echo "]" >> ./$output1
sed -i '.bak' 's/}{/},{/g' ./$output1
echo "File $input1 complete."

input2="2-cityPopulationsOverview.js"
output2="$input2"on
if [ -a "$output2" ]; then
  rm "$output2"
fi
node "$input2"
sed -i '.test' '1s/^/[/' ./$output2
echo "]" >> ./$output2
sed -i '.bak' 's/}{/},{/g' ./$output2
echo "File $input2 complete."

input2b="2b-nonMatchingCities.js"
output2b="$input2b"on
if [ -a "$output2b" ]; then
  rm "$output2b"
fi
node "$input2b"
sed -i '.test' '1s/^/[/' ./$output2b
echo "]" >> ./$output2b
sed -i '.bak' 's/}{/},{/g' ./$output2b
echo "File $input2b complete."

# Run File 3 wait for output
# Run consolidate