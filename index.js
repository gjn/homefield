var fs = require('fs');

var lib = {
    launcher: require('./lib/launcher')
};

module.exports = lib;

var launcher = lib.launcher();

if (fs.existsSync(process.argv[2]) === false) {
    console.log('No file provided or it does not exists.');
} else {
    launcher.start(process.argv[2]);
}



