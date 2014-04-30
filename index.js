var fs = require('fs');

var lib = {
    parsers: require('./lib/parsers'),
    launcher: require('./lib/launcher')
};

module.exports = lib;

function parseFile(filename, cbobject) {
    'use strict';
    lib.parsers().parse(filename, cbobject.addGame.bind(cbobject), cbobject.analyse.bind(cbobject));
}

var launcher = lib.launcher();

if (fs.existsSync(process.argv[2]) === false) {
    console.log('No file provided or it does not exists.');
} else {
    parseFile(process.argv[2], launcher);
}



