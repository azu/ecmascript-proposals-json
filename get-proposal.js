#!/usr/bin/env node
import { parseArgs } from "util";
import fs from "fs";
import path from "path";
import moment from "moment";
import { fetchTC39Proposals } from "./tc39-proposals.js";

// Parse command line arguments using util.parseArgs
const { values: options } = parseArgs({
    options: {
        date: {
            type: 'string',
            short: 'd'
        },
        help: {
            type: 'boolean',
            short: 'h'
        }
    }
});

// Show help
if (options.help) {
    console.log(`
Usage: node get-proposal.js [--date <YYYY-MM-DD>]

Options:
  -d, --date <date>     Create file with specified date (YYYY-MM-DD format)
  -h, --help            Show help

Examples:
  node get-proposal.js
  node get-proposal.js --date 2025-06-03
  node get-proposal.js -d 2025-06-03
`);
    process.exit(0);
}

// Process date
let date = moment();

if (options.date) {
    // Use specified date if --date flag is provided
    date = moment(options.date);
    if (!date.isValid()) {
        console.error(`Error: Invalid date format: ${options.date}`);
        console.error('Usage: node get-proposal.js [--date YYYY-MM-DD]');
        console.error('Help: node get-proposal.js --help');
        process.exit(1);
    }
}

fetchTC39Proposals()
    .then(result => {
        const fileNameByDate = date.format("YYYY-MM-DD");
        const output = path.join(process.cwd(), "static/data", `${fileNameByDate}.json`);
        fs.writeFileSync(output, JSON.stringify(result, null, 4), "utf-8");
        console.log(`Proposals saved to: ${output}`);
    })
    .catch(error => {
        console.error('Error fetching proposals:', error);
        process.exit(1);
    });
