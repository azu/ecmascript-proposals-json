#!/usr/bin/env bash
for i in {0..30}; do
  echo `gdate -I -d "2020-10-19 +$i days"`
  node ./get-proposal.js --date $(gdate -I -d "2020-10-19 +$i days");
  sleep 1
done
