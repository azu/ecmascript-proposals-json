// MIT © 2018 azu
"use strict";
const fs = require("fs");
const path = require("path");
const moment = require("moment");
require("./proposals")
    .fetchAll()
    .then(result => {
        const today = moment().format("YYYY-MM-DD");
        const output = path.join(__dirname, "data", `${today}.json`);
        fs.writeFileSync(output, JSON.stringify(result, null, 4), "utf-8");
    });
