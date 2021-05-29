// MIT © 2019 azu
"use strict";
const html2plaintext = require("html2plaintext");
const toMarkdown = require("to-markdown");
const moment = require("moment");
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
    if (aItem.name === bItem.name) {
        return true;
    }
    if (plainTitle(aItem.name) === plainTitle(bItem.name)) {
        return true;
    }
    if (aItem.url && bItem.url && normalizeTransfer(aItem.url) === normalizeTransfer(bItem.url)) {
        return true;
    }
    return false;
};
/**
 * Create Diff object from before and after data.
 * @param beforeData
 * @param afterData
 * @param options
 * @returns {{newItems: {Stage, Proposal: string}[], updatedItems: {From, To, Proposal: string}[]}}
 */
module.exports.createDiff = (
    beforeData,
    afterData,
    options = {
        filterTag: "ECMA-262"
    }
) => {
    const newItems = [];
    const changedItems = [];
    afterData
        .filter(afterItem => {
            return afterItem.tags && afterItem.tags.includes(options.filterTag);
        })
        .forEach(newItem => {
            const beforeItem = beforeData.find(beforeItem => {
                return equalItem(beforeItem, newItem);
            });
            if (newItem.tags && (newItem.tags.includes("withdrawn") || newItem.tags.includes("inactive"))) {
                return;
            }
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
            Proposal: item.url ? `[${toMarkdown(item.name)}](${item.url})` : toMarkdown(item.name),
            Stage: item.stage
        };
    });
    const resultUpdatedItems = changedItems.map(item => {
        return {
            Proposal: item.url ? `[${toMarkdown(item.name)}](${item.url})` : toMarkdown(item.name),
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
    const changedItems = [];
    afterData.forEach(newItem => {
        const beforeItem = beforeData.find(beforeItem => {
            return equalItem(beforeItem, newItem);
        });
        if (!beforeItem) {
            return;
        }
        // Stalled Stage without Stage 4
        if (beforeItem.stage === newItem.stage && newItem.stage !== 4) {
            newItem.before = beforeItem;
            changedItems.push(newItem);
        }
    });
    // table
    const resultUpdatedItems = changedItems.map(item => {
        return {
            Proposal: item.url ? `[${toMarkdown(item.name)}](${item.url})` : toMarkdown(item.name),
            From: item.before.stage,
            To: item.stage,
            LastMeeting: item.notes ? JSON.stringify(item.notes) : "No Data"
        };
    });
    return {
        stalledItems: resultUpdatedItems
    };
};
