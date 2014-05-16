var fs = require('fs');
var util = require('util');
var Handlebars = require('handlebars');

var source = fs.readFileSync('scripts/templates/statvar.hbar', {encoding: 'utf8'});
var template = Handlebars.compile(source);

for (var i = 2; i < process.argv.length; i++) {
  var context = {};
  var jsonObj =  JSON.parse(fs.readFileSync(process.argv[i], {encoding: 'utf8'}));
  context.stat = util.inspect(jsonObj, {depth: null});
  var regexRes = process.argv[i].match(/results-(\d{4})-(\d{1,2})/);
  context.statName = '_' + regexRes[1] + '_' + regexRes[2];
  var out = template(context);
  var outName = '.artefacts/data/' + regexRes[1] + '-' + regexRes[2] + '.js';
  fs.writeFileSync(outName, out, {encoding: 'utf8'});
}

