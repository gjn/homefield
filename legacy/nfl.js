/*jslint stupid: true */

var fs = require('fs');
var nfl = require('./nfl/all.js').nfl;

function parseFile(filename, cbobject) {
    "use strict";

    nfl.parsers.parsePFRGamesFile(filename, cbobject.gameCallback, cbobject.analyse);
}

if (process.argv[2] === null ||
        process.argv[2] === undefined ||
        fs.existsSync(process.argv[2]) === false) {
    console.log("no existing file provided");
} else {
    parseFile(process.argv[2], nfl.predictors.simplePredictor);
}

