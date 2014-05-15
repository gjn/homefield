(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['testhandlebar.js'] = template({"compiler":[5,">= 2.0.0"],"main":function(depth0,helpers,partials,data) {
  return "var obj = {mystring: 'haha'};\n\nvar template = require('./testtemplate.js');\n\nconsole.log('HAHAHAHA');\n\nconsole.log(Handlebars.templates);\n\nvar html = Handlebars.templates['testhandlebar.js'](obj)\n\n";
  },"useData":true});
})();