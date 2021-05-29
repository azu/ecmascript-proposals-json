import fs from "fs/promises";
import path from "path";
import url from "url";

const dataDir = url.fileURLToPath(new URL("../static/data/", import.meta.url));
const dirents = await fs.readdir(dataDir, {
    withFileTypes: true
});
const items = dirents.filter(dirent => dirent.isFile() && dirent.name.endsWith(".json")).map(dirend => path.join(dataDir, dirend.name));
await Promise.all(items.map(async (filePath) => {
    const json = JSON.parse(await fs.readFile(filePath, "utf-8"));
    const fileName = path.basename(filePath, ".json");
    /**
     "titleHtml": "<code>Array.prototype.includes</code>",
     "href": "https://github.com/tc39/proposal-Array.prototype.includes",
     "stage": 4,
     "authors": [
     "Domenic Denicola"
     ],
     "champions": [
     "Domenic Denicola",
     "Rick Waldron"
     ],
     "meeting": "2015-11-01T00:00:00.000Z",
     "meetingHref": "https://github.com/tc39/notes/blob/master/meetings/2015-11/nov-17.md#arrayprototypeincludes"
     */
    /*
    to
     */

    /*
    "tags": ["ECMA-262"],
    "stage": 3,
    "name": "Temporal",
    "id": "proposal-temporal",
    "description": "Provides standard objects and functions for working with dates and times.",
    "url": "https://github.com/tc39/proposal-temporal",
    "notes": [{ "date": "2021-03-10T00:00:00.000Z", "url": "https://github.com/tc39/notes/blob/HEAD/meetings/2021-03/mar-10.md#temporal-pt-2" }],
    "has-specification": true,
    "authors": [
      "Philipp Dunkel",
      "Maggie Johnson-Pint",
      "Matt Johnson-Pint",
      "Brian Terlson",
      "Shane Carr",
      "Ujjwal Sharma",
      "Philip Chimento",
      "Jason Williams",
      "Justin Grant"
    ],
    "champions": [
      "Philipp Dunkel",
      "Maggie Johnson-Pint",
      "Matt Johnson-Pint",
      "Brian Terlson",
      "Shane Carr",
      "Ujjwal Sharma",
      "Philip Chimento",
      "Jason Williams",
      "Justin Grant"
    ],
    "pushed_at": "2021-05-29T00:42:01.000Z"
     */
    const migratedJSON = json.map(item => {
        return {
            name: item.titleHtml,
                id: item.titleHtml,
            url: item.href,
            stage: item.stage,
            authors: item.authors,
            champions: item.champions,
            notes: item.meeting ? [
            {
                data: item.meeting,
                url: item.meetingHref
            }
        ] : [],
            pushed_at: `${fileName}T00:00:00.000Z`,
            "_format": "old-2021-05-29"
        }
    });
    return fs.writeFile(filePath, JSON.stringify(migratedJSON, null, 4), "utf-8");
}));
