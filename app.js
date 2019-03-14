const fs = require("fs");
const path = require("path");
const util = require("util");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const isUpperCase = require("./util/upperCase");

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

        texts.forEach(({ content, date }) => { // For every page of contracts...
            let contracts = content.split('\n');
            let agency, forWhat = null; 
            contracts.forEach((line) => {
                line = line.trim();
                if(line === "" | line === "CONTRACTS" | line.startsWith("*")){  // Eliminate duds...
                    return; 
                };

                if(isUpperCase(line)){  // Set proper agency ...
                    return;
                };

                let n = line.match(/\$([0-9.,]+)/) // Find value of contract...
                nInt = null;

                if(n){   
                    n = n[1].replace(/[,.]/g, "");
                    nInt = parseInt(n);
                };

                let forWhatIndex = line.search(' for ');
                if(forWhatIndex){
                    let forWhatLong = line.substring(forWhatIndex + 5, line.length);
                    let ending = forWhatLong.match(/\.[\s]/);
                    if(ending){
                        forWhat = forWhatLong.substring(0, ending.index);
                    }
                    console.log({ agency, forWhat, date })
                }

              //  console.log({ agency, date, nInt, forWhat })

                // let Lockheed = content.match(/Lockheed/g)
    
                // if(Lockheed){
                //     total = total + Lockheed.length;
                //     console.log(`Lockheed Contract: ${date}, ${nInt}`);
                // }


            });
        });
        // console.log(total);
    });