var fs = require('fs');
var cmds = require('commander');
var launcher = require('./lib/launcher')()

cmds
    .version('0.0.2')
    .option('-p, --path <path>', 'Path to game files (per year)')
    .option('-s, --season <season>', 'Season to analyse')
    .parse(process.argv);

launcher.start(cmds.path, cmds.season);



