#!/usr/bin/env bash

for i in {1..365}; do
  echo `gdate -I -d "2017-10-01 +$i days"`
  node ./get-proposal.js --date $(gdate -I -d "2017-10-01 +$i days");
  sleep 1
done
