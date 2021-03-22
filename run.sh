#!/usr/bin/env bash
for i in {0..30}; do
  d=$(gdate -I -d "2021-02-20 +$i days");
  echo "${d}";
  node ./get-proposal.js --date "${d}";
  sleep 1;
done
