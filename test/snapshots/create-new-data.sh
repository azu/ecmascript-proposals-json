#!/usr/bin/env bash
declare baseURL="https://github.com/tc39/proposals/blob/master/"
declare today=$(date "+%Y-%m-%d")
mkdir -p ${today}
curl "${baseURL}/README.md" > "${today}/README.md"
curl "${baseURL}/finished-proposals.md" > "${today}/finished-proposals.md"
curl "${baseURL}/stage-0-proposals.md" > "${today}/stage-0-proposals.md"
