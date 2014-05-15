var Handlebars = require('handlebars');

var context = {
  what_is_it: 'funky'
};
var source = 'my test source is {{what_is_it}}';
var template = Handlebars.compile(source);
var out = template(context);
console.log(out);

/*
var obj = {mystring: 'haha'};

var template = require('./testtemplate.js');

console.log('HAHAHAHA');

console.log(Handlebars.templates);

var html = Handlebars.templates['testhandlebar.js'](obj)
*/
