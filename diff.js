#!/usr/bin/env node
"use strict";
const meow = require("meow");
const tablemark = require("tablemark");
const path = require("path");
const { createDiff } = require("./lib/create-diff.js");
const cli = meow(
    `
	Usage
	  $ diff --before a.json --after b.json
`,
    {
        flags: {
            before: {
                type: "string"
            },
            after: {
                type: "string"
            }
        }
    }
);
const before = cli.flags.before;
const after = cli.flags.after;
const beforeData = require(path.resolve(process.cwd(), before));
const afterData = require(path.resolve(process.cwd(), after));
const { newItems, updatedItems } = createDiff(beforeData, afterData);
console.log(`
## New Proposals

${tablemark(newItems)}

`);

console.log(`
## Updated Proposals

${tablemark(updatedItems)}

`);
