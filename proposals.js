const { sortBy, flatten } = require("lodash");
const { concurrent } = require("contra");
const moment = require("moment");
const request = require("request");
const cheerio = require("cheerio");
const rchampionseparator = /,\s*|\s+(?:,\s*)?(?:and|&)\s+/;
const html2plaintext = require("html2plaintext");

function fetchAll(baseURL = "https://github.com/tc39/proposals/blob/master/") {
    return new Promise((resolve, reject) => {
        concurrent(
            {
                stage0: fetchStage0(baseURL),
                stage1: fetchStage1(baseURL),
                active: fetchActive(baseURL),
                finished: fetchFinished(baseURL)
            },
            fetchedAll((error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            })
        );
    });
}

function fetchedAll(done) {
    return (err, result) => {
        if (err) {
            done(err);
            return;
        }
        const proposals = sortProposals([...result.stage0, ...result.stage1, ...result.active, ...result.finished]);
        done(null, proposals);
    };
}

function fetchStage0(baseURL) {
    const URL = `${baseURL}/stage-0-proposals.md`;
    return done => {
        fetch(URL, parseStage0, done);
    };
}

function fetchStage1(baseURL) {
    const URL = `${baseURL}/stage-1-proposals.md`;
    return done => {
        fetch(URL, parseStage1, done);
    };
}

function fetchActive(baseURL) {
    const URL = `${baseURL}/README.md`;
    return done => {
        fetch(URL, parseActive, done);
    };
}

function fetchFinished(baseURL) {
    const URL = `${baseURL}/finished-proposals.md`;
    return done => {
        fetch(URL, parseFinished, done);
    };
}

function fetch(resource, parse, done) {
    request(resource, parseThenPoll);

    function parseThenPoll(err, res, html) {
        if (err) {
            done(err);
            return;
        }
        done(null, parse(html));
    }
}

function splitNodeBySeparator(node) {
    const rawHTML = node ? node.html() : "";
    const html = rawHTML || "";
    return html2plaintext(html.replace(/<br>/g, ", "))
        .trim()
        .split(rchampionseparator)
        .filter(item => item.length > 0);
}

function parseStageTable($, table, stage) {
    const headerList = $(table)
        .find("thead th")
        .toArray();
    const lastPresentedIndex = headerList.findIndex(element => {
        return /Presented/i.test($(element).text());
    });
    const meetingIndex = headerList.findIndex(element => {
        return /Meeting/i.test($(element).text());
    });
    const header = {
        Proposal:
            headerList.findIndex(element => {
                return /Proposal/i.test($(element).text());
            }) + 1,
        Author:
            headerList.findIndex(element => {
                return /Author/i.test($(element).text());
            }) + 1,
        Champion:
            headerList.findIndex(element => {
                return /Champion/i.test($(element).text());
            }) + 1,
        "Last Presented": lastPresentedIndex !== -1 ? lastPresentedIndex + 1 : null,
        // # Finish
        // TC39 meeting notes
        Meeting: meetingIndex !== -1 ? meetingIndex + 1 : null,
        // # Finish
        // Expected Publication Year
        Year:
            headerList.findIndex(element => {
                return /Year/i.test($(element).text());
            }) + 1
    };
    return $(table)
        .find("tbody tr")
        .toArray()
        .map(tr => {
            const $tr = $(tr);
            const $title = $tr.find(`td:nth-child(${header.Proposal})`);
            const $titleLink = $title.find("a");
            const titleHtml = ($titleLink.length ? $titleLink : $title).html().trim();
            const href = $titleLink.attr("href");
            const authors = splitNodeBySeparator($tr.find(`td:nth-child(${header.Author})`));
            const champions = splitNodeBySeparator($tr.find(`td:nth-child(${header.Champion})`));
            const { meeting, meetingHref } = (() => {
                if (header.Meeting) {
                    // Finished Proposal has Meeting
                    const meeting = moment.utc(
                        $tr
                            .find(`td:nth-child(${header.Meeting})`)
                            .text()
                            .trim(),
                        "MMMM YYYY"
                    );
                    const meetingHref = $tr.find(`td:nth-child(${header.Meeting}) a`).attr("href");
                    return {
                        meeting,
                        meetingHref
                    };
                } else if (header["Last Presented"]) {
                    // Processing Proposal has Last Presented
                    const lastPresent = moment.utc(
                        $tr
                            .find(`td:nth-child(${header["Last Presented"]})`)
                            .text()
                            .trim(),
                        "MMMM YYYY"
                    );
                    const lastPresentHref = $tr.find(`td:nth-child(${header["Last Presented"]}) a`).attr("href");
                    return {
                        meeting: lastPresent,
                        meetingHref: lastPresentHref
                    };
                } else {
                    return {
                        meeting: null,
                        meetingHref: null
                    };
                }
            })();
            const proposalMeta = {
                titleHtml,
                href,
                stage,
                authors,
                champions,
                meeting,
                meetingHref
            };
            // finished proposals only
            if (stage === 4) {
                const publicationYear = parseInt(
                    $tr
                        .find(`td:nth-child(${header.Year})`)
                        .text()
                        .trim()
                );
                proposalMeta.meeting = meeting.toISOString();
            }
            return proposalMeta;
        });
}

function parseActive(html) {
    const $ = cheerio.load(html);
    const proposals = $("#readme table")
        .toArray()
        .map((table, index) => parseStageTable($, table, 3 - index));

    return sortProposals(flatten(proposals));
}

function parseStage0(html) {
    const $ = cheerio.load(html);
    return sortProposals(parseStageTable($, $("#readme table").eq(0), 0));
}

function parseStage1(html) {
    const $ = cheerio.load(html);
    return sortProposals(parseStageTable($, $("#readme table").eq(0), 1));
}

function parseFinished(html) {
    const $ = cheerio.load(html);
    return sortProposals(parseStageTable($, $("#readme table").eq(0), 4));
}

function sortProposals(proposals) {
    return sortBy(proposals, proposal => {
        if (proposal.publicationYear) {
            return -proposal.publicationYear;
        }
        const stage = proposal.stage * 2;
        const readiness = proposal.readyToAdvance ? 1 : 0;
        const reverse = -1;
        return (stage + readiness) * reverse;
    });
}

module.exports = {
    fetchAll,
    fetchFinished,
    fetchActive,
    fetchStage0,
    fetchStage1
};
