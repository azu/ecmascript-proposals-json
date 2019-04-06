// MIT © 2019 azu
"use strict";
const html2plaintext = require("html2plaintext");
const toMarkdown = require("to-markdown");
const plainTitle = title => {
    return html2plaintext(title)
        .replace(/\s/g, "")
        .toLowerCase();
};
// same https://github.com/tc39/a === https://github.com/Foo/a
const normalizeTransfer = url => {
    if (!url) {
        throw new Error(`url is not found: ${url}`);
    }
    return url.replace(/^https:\/\/github.com\/.*?\//, "");
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
/**
 * Create Diff object from before and after data.
 * @param beforeData
 * @param afterData
 * @returns {{newItems: {Stage, Proposal: string}[], updatedItems: {From, To, Proposal: string}[]}}
 */
module.exports.createDiff = (beforeData, afterData) => {
    const newItems = [];
    const changedItems = [];
    afterData.forEach(newItem => {
        const beforeItem = beforeData.find(beforeItem => {
            return equalItem(beforeItem, newItem);
        });
        if (!beforeItem) {
            newItems.push(newItem);
        } else if (beforeItem.stage !== newItem.stage) {
            newItem.before = beforeItem;
            changedItems.push(newItem);
        }
    });
    // console.log("New");
    // console.log(newItems);
    // console.log("Changes");
    // console.log(changedItems);

    // table
    const resultNewItems = newItems.map(item => {
        return {
            Proposal: item.href ? `[${toMarkdown(item.titleHtml)}](${item.href})` : toMarkdown(item.titleHtml),
            Stage: item.stage
        };
    });
    const resultUpdatedItems = changedItems.map(item => {
        return {
            Proposal: item.href ? `[${toMarkdown(item.titleHtml)}](${item.href})` : toMarkdown(item.titleHtml),
            From: item.before.stage,
            To: item.stage
        };
    });
    return {
        newItems: resultNewItems,
        updatedItems: resultUpdatedItems
    };
};

/**
 * Create Stalled Diff object from before and after data.
 * @param beforeData
 * @param afterData
 * @returns {{newItems: {Stage, Proposal: string}[], updatedItems: {From, To, Proposal: string}[]}}
 */
module.exports.createStalledDiff = (beforeData, afterData) => {
    const newItems = [];
    const changedItems = [];
    afterData.forEach(newItem => {
        const beforeItem = beforeData.find(beforeItem => {
            return equalItem(beforeItem, newItem);
        });
        // Stalled Stage without Stage 4
        if (beforeItem.stage === newItem.stage && newItem.stage !== 4) {
            newItem.before = beforeItem;
            changedItems.push(newItem);
        }
    });
    // console.log("New");
    // console.log(newItems);
    // console.log("Changes");
    // console.log(changedItems);

    // table
    const resultNewItems = newItems.map(item => {
        return {
            Proposal: item.href ? `[${toMarkdown(item.titleHtml)}](${item.href})` : toMarkdown(item.titleHtml),
            Stage: item.stage
        };
    });
    const resultUpdatedItems = changedItems.map(item => {
        return {
            Proposal: item.href ? `[${toMarkdown(item.titleHtml)}](${item.href})` : toMarkdown(item.titleHtml),
            From: item.before.stage,
            To: item.stage
        };
    });
    return {
        newItems: resultNewItems,
        updatedItems: resultUpdatedItems
    };
};
