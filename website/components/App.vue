<template>
    <div id="app">
        <h1>ECMAScript Proposal Diff Tool</h1>
        <label for="start-date">Start Date:</label>
        <input type="date" id="start-date"
               v-model="startDate">
        <label for="end-date">End Date:</label>
        <input type="date" id="end-date"
               v-model="endDate">
        <button @click="updateDiff">Update diff</button>
        <div class="output-textarea">
            <label>
                Diff Markdown:
                <textarea cols="60">{{diffMarkdown}}</textarea>
            </label>
        </div>
        <div v-html="compiledHTML" class="markdown-body"></div>
        <p v-text="message"></p>
    </div>
</template>
<script>
    const dateToYYYYMMHH = (date) => {
        let month = "" + (date.getMonth() + 1);
        let day = "" + date.getDate();
        const year = date.getFullYear();
        if (month.length < 2) {
            month = "0" + month;
        }
        if (day.length < 2) {
            day = "0" + day;
        }
        return [year, month, day].join("-");
    };
    const beforeDayDateFromToday = (before) => {
        const d = new Date();
        d.setDate(d.getDate() - before);
        return d;
    };
    const beforeMonthDateFromToday = (before) => {
        const d = new Date();
        d.setMonth(d.getMonth() - before);
        return d;
    };
    import { createDiff } from "../../lib/create-diff.js";

    const marked = require("marked");
    const tablemark = require("tablemark");
    export default {
        data() {
            return {
                startDate: dateToYYYYMMHH(beforeMonthDateFromToday(2)),
                endDate: dateToYYYYMMHH(new Date()),
                diffMarkdown: "",
                compiledHTML: "",
                message: ""
            };
        },
        mounted() {
            this.updateDiff();
        },
        methods: {
            updateDiff: function() {
                const startDateString = this.startDate;
                const endDateString = this.endDate;
                const fetchData = (dateString) => {
                    const baseDir = "./data";
                    const apiPath = `${baseDir}/${dateString}.json`;
                    return fetch(apiPath)
                        .then(res => {
                            if (!res.ok) {
                                throw new Error(`${apiPath}: ${res.statusText}`);
                            }
                            return res;
                        }).then(res => res.json());
                };
                this.message = "Fetching...";
                this.compiledHTML = "";
                const fetchToday = () => {
                    return fetchData(endDateString).catch(() => {
                        return fetchData(dateToYYYYMMHH(beforeDayDateFromToday(1)));
                    });
                };
                Promise.all([fetchData(startDateString), fetchToday()])
                    .then(([beforeData, afterData]) => {
                        this.message = "Diff table is creating...";
                        const { newItems, updatedItems } = createDiff(beforeData, afterData);
                        console.log("Diff objects", { newItems, updatedItems });
                        const diffTable = `
## New Proposals

${newItems.length === 0 ? "No Data" : tablemark(newItems)}

## Updated Proposals

${updatedItems.length === 0 ? "No Data" : tablemark(updatedItems)}
`;
                        this.diffMarkdown = diffTable;
                        this.compiledHTML = marked(diffTable);
                        this.message = "";
                    }).catch(error => {
                    this.message = `Fail to fetch data Error: ${error.message}`;
                    console.error(error);
                });
            }
        }
    };
</script>
