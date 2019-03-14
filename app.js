const fs = require("fs");
const path = require("path");
const util = require("util");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

readDir = util.promisify(fs.readdir);
readFile = util.promisify(fs.readFile);

let allFiles = readDir(path.resolve(__dirname, "Contracts", "Fiscal\ 2018"));

allFiles
    .then(async(files) => {
        let texts = [];
        for(const file of files){
            let contents = await readFile(path.resolve(__dirname, "Contracts", "Fiscal\ 2018", file));
            texts.push({ date: file.substring(0, file.length - 4), content: contents.toString()} );
        };
        return texts;
    })
    .then(async(texts) => {
        let total = 0; largest = 0; dateTotals = [];

        texts.forEach(({ content, date }) => {
            // let contracts = content.split('\n');
            let Lockheed = content.match(/BAE Systems/g)
            if(Lockheed){
                total = total + Lockheed.length;
            }
        });
        console.log(total);
    });