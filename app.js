const fs = require("fs");
const path = require("path");
const util = require("util");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

readDir = util.promisify(fs.readdir);
readFile = util.promisify(fs.readFile);

let allFiles = readDir(path.resolve(__dirname, "Contracts"));

allFiles
    .then(async(files) => {
        let texts = [];
        for(const file of files){
            if(file.substring(file.length - 3, file.length) == "txt"){ // If text file...
            let contents = await readFile(path.resolve(__dirname, "Contracts", file));
            texts.push({ date: file.substring(0, file.length - 4), content: contents.toString()} );
            }
        };
        return texts;
    })
    .then(async(texts) => {
        let total = 0; largest = 0; dateTotals = [];

        texts.forEach(({ content, date }) => {
            // let contracts = content.split('\n');
            let Lockheed = content.match(/BAE Systems/g)
            let n = content.match(/\$([0-9.,]+)/) // Find value of contract (must build failsafe if contract value is undefined...)
            let n2 = n[1].replace(/[,.]/g, "");
            nInt = parseInt(n2);


            if(Lockheed){
                total = total + Lockheed.length;
                console.log(nInt);
            }
        });
        // console.log(total);
    });