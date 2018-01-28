// MIT © 2017 azu
"use strict";
const striptags = require("striptags");
const tablemark = require("tablemark");
const toMarkdown = require("to-markdown");
const path = require("path");
const dataDir = path.join(__dirname, "data");
const before = "2018-01-18.json";
const after = "2018-01-28.json";
const beforeData = require(`${dataDir}/${before}`);
const afterData = require(`${dataDir}/${after}`);

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
    if (aItem.href && normalizeTransfer(aItem.href) === normalizeTransfer(bItem.href)) {
        return true;
    }
    return false;
};
const newItems = [];
const changedItems = [];
afterData.forEach(item => {
    const beforeItem = beforeData.find(beforeItem => {
        return equalItem(beforeItem, item);
    });
    if (!beforeItem) {
        newItems.push(item);
    } else if (beforeItem.stage !== item.stage) {
        item.beforeState = beforeItem.stage;
        changedItems.push(item);
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
