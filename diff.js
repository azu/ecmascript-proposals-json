#!/usr/bin/env node
"use strict";
const meow = require("meow");
const striptags = require("striptags");
const tablemark = require("tablemark");
const toMarkdown = require("to-markdown");
const path = require("path");
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
const plainTitle = title => {
    return striptags(title)
        .replace(/\s/g, "")
        .toLocaleLowerCase();
};
// same https://github.com/tc39/a === https://github.com/Foo/a
const normalizeTransfer = url => {
    if (!url) {
        return "";
    }
    return url.replace(/^https:\/\/github.com\/.*\//, "");
};

const equalItem = (aItem, bItem) => {
    if (aItem.titleHtml === bItem.titleHtml) {
        return true;
    }
    if (plainTitle(aItem.titleHtml) === plainTitle(bItem.titleHtml)) {
        return true;
    }
    if (aItem.href && bItem.href && normalizeTransfer(aItem.href) === normalizeTransfer(bItem.href)) {
        return true;
    }
    return false;
};
const newItems = [];
const changedItems = [];
afterData.forEach(newItem => {
    const beforeItem = beforeData.find(beforeItem => {
        return equalItem(beforeItem, newItem);
    });
    if (!beforeItem) {
        newItems.push(newItem);
    } else if (beforeItem.stage !== newItem.stage) {
        newItem.beforeState = beforeItem.stage;
        changedItems.push(newItem);
    }
});
// console.log("New");
// console.log(newItems);
// console.log("Changes");
// console.log(changedItems);

// table
const newTable = tablemark(
    newItems.map(item => {
        return {
            Proposal: item.href ? `[${toMarkdown(item.titleHtml)}](${item.href})` : toMarkdown(item.titleHtml),
            Stage: item.stage
        };
    })
);

const updatedTable = tablemark(
    changedItems.map(item => {
        return {
            Proposal: item.href ? `[${toMarkdown(item.titleHtml)}](${item.href})` : toMarkdown(item.titleHtml),
            From: item.beforeState,
            To: item.stage
        };
    })
);

console.log(`
## New Proposals

${newTable}

`);

console.log(`
## Updated Proposals

${updatedTable}

`);
