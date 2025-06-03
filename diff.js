#!/usr/bin/env node
import { parseArgs } from "util";
import tablemark from "tablemark";
import path from "path";
import fs from "fs";
import { createDiff, createStalledDiff } from "./lib/create-diff.js";

// Parse command line arguments using util.parseArgs
const { values: options } = parseArgs({
    options: {
        before: {
            type: 'string',
            short: 'b'
        },
        after: {
            type: 'string',
            short: 'a'
        },
        stalled: {
            type: 'boolean',
            short: 's'
        },
        help: {
            type: 'boolean',
            short: 'h'
        }
    }
});

// Display help
if (options.help) {
    console.log(`
Usage: node diff.js --before <file> --after <file> [--stalled]

Options:
  -b, --before <file>   JSON file as the previous state
  -a, --after <file>    JSON file as the current state
  -s, --stalled         Show stalled proposals
  -h, --help            Show this help

Examples:
  node diff.js --before old.json --after new.json
  node diff.js -b old.json -a new.json --stalled
`);
    process.exit(0);
}

// Validate arguments
if (!options.before || !options.after) {
    console.error('Error: Both --before and --after file paths are required');
    console.error('Usage: node diff.js --before <file> --after <file> [--stalled]');
    console.error('Help: node diff.js --help');
    process.exit(1);
}

const before = options.before;
const after = options.after;
const showStalledData = options.stalled;

// Load JSON files using ESM
let beforeData, afterData;
try {
    beforeData = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), before), 'utf8'));
    afterData = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), after), 'utf8'));
} catch (error) {
    console.error('Error reading files:', error.message);
    process.exit(1);
}
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
