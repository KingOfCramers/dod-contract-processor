const fs = require("fs");
const path = require("path");
const util = require("util");
const json2csv = require("json2csv").Transform;
const writeFile = util.promisify(fs.writeFile);

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
        let allContracts = [];
        texts.forEach(({ content, date },uid1) => { // For every page of contracts...
            let contracts = content.split('\n');
            let agency = forWhat = fullContract = foreign = value = null;
            contracts.forEach((line, uid2) => {
                uid = "" + uid1 + uid2;
                fullContract = line = line.trim();
                if(line === "" | line === "CONTRACTS" | line.startsWith("*")){  // Eliminate duds...
                    return; 
                };

                if(isUpperCase(line)){  // Set proper agency ...
                    agency = line.trim();
                    return;
                };

                let n = line.match(/\$([0-9.,]+)/) // Find value of contract...

                if(n){   
                    n = n[1].replace(/[,.]/g, "");
                    value = parseInt(n);
                };

                if(line.includes("foreign")){
                    foreign = true;
                } else {
                    foreign = null;
                }

                let awardTypes = /( for )|(to (assure|promise|support|promote|contract))/g;
                let firstSentence = /\.(\s+)[A-Z]/.exec(line) ? line.substring(0, /\.\s/.exec(line).index + 1) : ""; // If we can find first sentence
                if(firstSentence !== "" && firstSentence.match(awardTypes)){ // And first sentence includes awarding language...
                    let result, indices = [];
                    while((result = awardTypes.exec(firstSentence))){ // Check for multiple 'fors'
                        indices.push(result.index);
                    };
                    if(!!indices.length){ // If any fors are found...
                        forWhat = firstSentence.substring(indices[0], firstSentence.length).trim();
                    }
                };

                allContracts.push({ agency, forWhat, date, value, fullContract, foreign, uid });
            });
        });
        return allContracts;
    })
    .then(async(res) => {
        res = JSON.stringify(res);
        await writeFile(path.resolve(__dirname, "contracts.json"), res);

        const fields = ['uid', 'date', 'agency', 'value', 'forWhat', 'foreign', 'fullContract'];
        const opts = { fields };
        const transformOpts = { highWaterMark: 16384, encoding: 'utf-8' };
        const input = fs.createReadStream(path.resolve(__dirname, "contracts.json"), { encoding: 'utf8' });
        const output = fs.createWriteStream(path.resolve(__dirname, "contracts.csv"), { encoding: 'utf8' });

        const newjson2csv = new json2csv(opts, transformOpts);
        const processor = input.pipe(newjson2csv).pipe(output);

    })