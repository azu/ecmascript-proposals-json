#!/usr/bin/env bash

for i in {1..30}; do
  echo `gdate -I -d "2018-11-01 +$i days"`
  node ./get-proposal.js --date $(gdate -I -d "2018-11-01 +$i days");
  sleep 1
done
