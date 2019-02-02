const fs = require("fs");
const path = require("path");
const assert = require("assert");
const fetchAll = require("../proposals").fetchAll;
const fixturesDir = path.join(__dirname, "snapshots");
const static = require("node-static");
const file = new static.Server(fixturesDir);
let server;
describe("Snapshot testing", () => {
    before(() => {
        server = require("http")
            .createServer(function(request, response) {
                request
                    .addListener("end", function() {
                        file.serve(request, response);
                    })
                    .resume();
            })
            .listen(0);
    });
    after(() => {
        if (server) {
            server.close();
        }
    });
    fs.readdirSync(fixturesDir)
        .filter(dirName => {
            const fixtureDir = path.join(fixturesDir, dirName);
            return fs.statSync(fixtureDir).isDirectory();
        })
        .map(caseName => {
            const normalizedTestName = caseName.replace(/-/g, " ");
            it(`Test ${normalizedTestName}`, function() {
                const fixtureDir = path.join(fixturesDir, caseName);
                return fetchAll(`http://localhost:${server.address().port}/${caseName}`).then(actual => {
                    const expectedFilePath = path.join(fixtureDir, "output.json");
                    // JSON.stringify remove undefined
                    const normalizedActual = JSON.parse(JSON.stringify(actual));
                    if (process.env.UPDATE_SNAPSHOT) {
                        fs.writeFileSync(expectedFilePath, JSON.stringify(normalizedActual, null, 4));
                        this.skip();
                        return;
                    }
                    const expected = JSON.parse(fs.readFileSync(expectedFilePath, "utf-8"));
                    assert.deepEqual(
                        normalizedActual,
                        expected,
                        `
${fixtureDir}
${JSON.stringify(actual)}
`
                    );
                });
            });
        });
});
