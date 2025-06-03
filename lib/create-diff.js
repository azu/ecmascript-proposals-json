// MIT © 2019 azu
"use strict";
import html2plaintext from "html2plaintext";
import toMarkdown from "to-markdown";
const memorize = fn => {
    const cacheMap = new Map();
    return function memorizedWrapper(arg) {
        const cached = cacheMap.get(arg);
        if (cached) {
            return cached;
        }
        const result = fn(arg);
        cacheMap.set(arg, result);
        return result;
    };
};
const plainTitle = memorize(title => {
    return html2plaintext(title)
        .replace(/\s/g, "")
        .toLowerCase();
});
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
 * 前後のデータから差分オブジェクトを作成します
 * @param beforeData
 * @param afterData
 * @param options
 * @returns {{newItems: {Stage, Proposal: string}[], updatedItems: {From, To, Proposal: string}[]}}
 */
export const createDiff = (
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
            const tags = afterItem.tags ?? [];
            for (const tag of tags) {
                if (tag === "inactive") {
                    return false;
                }
            }
            return tags.includes(options.filterTag);
        })
        .forEach(newItem => {
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
            Proposal: item.url ? `[${toMarkdown(item.name)}](${item.url})` : toMarkdown(item.name),
            Stage: item.stage === -1 ? "withdrawn" : item.stage
        };
    });
    const resultUpdatedItems = changedItems.map(item => {
        return {
            Proposal: item.url ? `[${toMarkdown(item.name)}](${item.url})` : toMarkdown(item.name),
            From: item.before.stage === -1 ? "withdrawn" : item.before.stage,
            To: item.stage === -1 ? "withdrawn" : item.stage
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
export const createStalledDiff = (beforeData, afterData) => {
    const changedItems = [];
    afterData.forEach(newItem => {
        const beforeItem = beforeData.find(beforeItem => {
            return equalItem(beforeItem, newItem);
        });
        if (!beforeItem) {
            return;
        }
        // Stalled Stage without Stage 4/Withdrawn
        const isFreezeStage = stage => {
            // stage 4 is finished
            if (stage === 4) {
                return true;
            }
            // stage -1 is withdrawn
            if (stage === -1) {
                return true;
            }
            return false;
        };
        if (beforeItem.stage === newItem.stage && (isFreezeStage(beforeItem.stage) || isFreezeStage(newItem.stage))) {
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
