var fs = require('fs');
var cmds = require('commander');
var launcher = require('./lib/launcher')()

cmds
    .version('0.0.1')
    .option('-f, --file <file>', 'Add the file of games to use')
    .option('-t, --type <type>', 'Type of parsing [latest, all]', 'latest')
    .parse(process.argv);

if (fs.existsSync(cmds.file) === false) {
    console.log('No file provided or it does not exists.');
} else {
    launcher.start(cmds.file, cmds.type);
}



