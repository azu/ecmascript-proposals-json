import fs from "fs/promises";
import path from "path";
import url from "url";

const dataDir = url.fileURLToPath(new URL("../static/data/", import.meta.url));
const dirents = await fs.readdir(dataDir, {
    withFileTypes: true
});
const items = dirents.filter(dirent => dirent.isFile() && dirent.name.endsWith(".json")).map(dirend => path.join(dataDir, dirend.name));
console.log(items);
