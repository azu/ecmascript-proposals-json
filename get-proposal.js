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

    Examples
      $ node get-proposal.js
`,
    {
        flags: {},
        autoVersion: true,
        autoHelp: true
    }
);
require("./tc39-proposals")
    .fetchTC39Proposals()
    .then(result => {
        const fileNameByDate = moment().format("YYYY-MM-DD");
        const output = path.join(__dirname, "static/data", `${fileNameByDate}.json`);
        fs.writeFileSync(output, JSON.stringify(result, null, 4), "utf-8");
    });
