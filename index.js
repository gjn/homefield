var fs = require('fs');

var lib = {
    defs: require('./lib/defs'),
    teamstat: require('./lib/teamstat'),
    games: require('./lib/games'),
    parsers: require('./lib/parsers'),
    launcher: require('./lib/launcher')
};

module.exports = lib;

function parseFile(filename, cbobject) {
    'use strict';
    lib.parsers.pfrParser.parse(filename, cbobject.addGame.bind(cbobject), cbobject.analyse.bind(cbobject));
}

var launcher = lib.launcher();

if (process.argv[2] === null ||
    process.argv[2] === undefined ||
    fs.existsSync(process.argv[2]) === false) {
    console.log('file provided does not exists');
} else {
    parseFile(process.argv[2], launcher);
}



