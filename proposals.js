const { sortBy, flatten } = require("lodash");
const { concurrent } = require("contra");
const moment = require("moment");
const request = require("request");
const cheerio = require("cheerio");
const rchampionseparator = /,\s*|\s+(?:,\s*)?(?:and|&)\s+/;

function fetchAll(baseURL = "https://github.com/tc39/proposals/blob/master/") {
    return new Promise((resolve, reject) => {
        concurrent(
            {
                proposed: fetchProposed(baseURL),
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
        const proposals = sortProposals([...result.proposed, ...result.active, ...result.finished]);
        done(null, proposals);
    };
}

function fetchProposed(baseURL) {
    const URL = `${baseURL}/stage-0-proposals.md`;
    return done => {
        fetch(URL, parseProposed, done);
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

function parseStageTable($, table, stage) {
    return $(table)
        .find("tbody tr")
        .toArray()
        .map(tr => {
            const $tr = $(tr);
            const readyToAdvance =
                $tr
                    .find("td:nth-child(1)")
                    .text()
                    .trim() === "🚀";
            const $title = $tr.find("td:nth-child(2)");
            const $titleLink = $title.find("a");
            const titleHtml = ($titleLink.length ? $titleLink : $title).html().trim();
            const href = $titleLink.attr("href");
            const champions = $tr
                .find("td:nth-child(3)")
                .text()
                .trim()
                .split(rchampionseparator);
            const proposalMeta = {
                titleHtml,
                href,
                stage,
                champions,
                readyToAdvance
            };

            // finished proposals only
            if (stage === 4) {
                const $title = $tr.find("td:nth-child(1)");
                const $titleLink = $title.find("a");
                const titleHtml = ($titleLink.length ? $titleLink : $title).html().trim();
                const href = $titleLink.attr("href");
                const champions = $tr
                    .find("td:nth-child(2)")
                    .text()
                    .trim()
                    .split(rchampionseparator);
                proposalMeta.titleHtml = titleHtml;
                proposalMeta.href = href;
                proposalMeta.champions = champions;
                const meeting = moment.utc(
                    $tr
                        .find("td:nth-child(3)")
                        .text()
                        .trim(),
                    "MMMM YYYY"
                );
                const meetingHref = $tr.find("td:nth-child(3) a").attr("href");
                const publicationYear = parseInt(
                    $tr
                        .find("td:nth-child(4)")
                        .text()
                        .trim()
                );
                proposalMeta.meeting = meeting.toISOString();
                proposalMeta.meetingHref = meetingHref;
                proposalMeta.publicationYear = publicationYear;
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

function parseProposed(html) {
    const $ = cheerio.load(html);
    return sortProposals(parseStageTable($, $("#readme table").eq(0), 0));
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
    fetchProposed
};
