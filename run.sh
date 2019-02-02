#!/usr/bin/env bash
node ./get-proposal.js --date "2019-01-01"
for i in {1..30}; do
  echo `gdate -I -d "2019-01-01 +$i days"`
  node ./get-proposal.js --date $(gdate -I -d "2019-01-01 +$i days");
  sleep 1
done
