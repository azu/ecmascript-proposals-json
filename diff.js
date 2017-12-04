// MIT © 2017 azu
"use strict";

const striptags = require('striptags');
const path = require("path");
const dataDir = path.join(__dirname, "data");
const before = "371b600927600be63994047cdec832f1cf90d2dc.json";
const after = "07b3560a1d34bd966bdf45ac0d56acb30ef2f41b.json";
const beforeData = require(`${dataDir}/${before}`);
const afterData = require(`${dataDir}/${after}`);

const plainTitle = (title) => {
    return striptags(title).replace(/\s/g, "").toLocaleLowerCase();
};
const newItems = [];
const changedItems = [];
afterData.forEach(item => {
    const beforeItem = beforeData.filter(beforeItem => beforeItem.href !== undefined).find(beforeItem => {
        return beforeItem.href === item.href;
    });
    if (!beforeItem) {
        newItems.push(item);
    } else if (beforeItem.stage !== item.stage) {
        item.beforeState = beforeItem.stage;
        changedItems.push(item);
    }
});
console.log("New");
console.log(newItems);
console.log("Changes");
console.log(changedItems);
