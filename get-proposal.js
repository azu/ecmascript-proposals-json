#!/usr/bin/env node
"use strict";
const meow = require("meow");
const fs = require("fs");
const path = require("path");
const moment = require("moment");
const cli = meow(
    `
    Usage
      $ node get-proposal.js [option] 

    Options:
      --date Get proposal at specific date

    Examples
      $ node get-proposal.js --date 2018-01-01
`,
    {
        flags: {
            date: {
                type: "string"
            }
        },
        autoVersion: true,
        autoHelp: true
    }
);
const momentDate = cli.flags.date ? moment(cli.flags.date) : moment();
const ISODate = momentDate.toISOString();
require("./proposals")
    .fetchAll(`https://github.com/tc39/proposals/blob/HEAD@{${ISODate}}/`)
    .then(result => {
        const fileNameByDate = momentDate.format("YYYY-MM-DD");
        const output = path.join(__dirname, "static/data", `${fileNameByDate}.json`);
        fs.writeFileSync(output, JSON.stringify(result, null, 4), "utf-8");
    });
