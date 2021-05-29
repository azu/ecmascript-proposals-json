#!/usr/bin/env node
"use strict";

const meow = require("meow");
const tablemark = require("tablemark");
const path = require("path");
const { createDiff, createStalledDiff } = require("./lib/create-diff.js");
const cli = meow(
    `
	Usage
	  $ node diff --before a.json --after b.json
`,
    {
        flags: {
            before: {
                type: "string"
            },
            after: {
                type: "string"
            },
            stalled: {
                type: "boolean"
            }
        }
    }
);
const before = cli.flags.before;
const after = cli.flags.after;
const beforeData = require(path.resolve(process.cwd(), before));
const afterData = require(path.resolve(process.cwd(), after));
const showStalledData = cli.flags.stalled;
const { newItems, updatedItems, stalledItems } = showStalledData
    ? createStalledDiff(beforeData, afterData)
    : createDiff(beforeData, afterData);
if (newItems && newItems.length > 0) {
    console.log(`
## New Proposals

${tablemark(newItems)}

`);
}
if (updatedItems && updatedItems.length > 0) {
    console.log(`
## Updated Proposal

${tablemark(updatedItems)}

`);
}

if (stalledItems && stalledItems.length > 0) {
    console.log(`
## Stalled Proposals

${tablemark(stalledItems)}

`);
}
