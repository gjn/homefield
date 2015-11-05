hf.graphs = hf.graphs || {};

var Table = function(element) {

  if (!(this instanceof Table)) {
    return new Table(element);
  }

  var getColumn = function(type, ownopp, offdef, stat) {
    return {
      type: type,
      ownopp: ownopp,
      offdef: offdef,
      stat: stat
    };
  };

  var columns = [
    getColumn("rank", "s", "o", "w"),
    getColumn("team", "s", "o", "w"),

    getColumn("overall", "s", "o", "w"),
    getColumn("overall", "o", "o", "w"),

    getColumn("overall", "s", "u", "p"),
    getColumn("overall", "s", "u", "y"),
    getColumn("overall", "s", "o", "p"),
    getColumn("overall", "s", "o", "y"),
    getColumn("overall", "s", "d", "p"),
    getColumn("overall", "s", "d", "y"),

    getColumn("home", "s", "o", "w"),
    getColumn("home", "s", "u", "p"),
    getColumn("home", "s", "u", "y"),
    getColumn("home", "s", "o", "p"),
    getColumn("home", "s", "o", "y"),
    getColumn("home", "s", "d", "p"),
    getColumn("home", "s", "d", "y"),
    
    getColumn("away", "s", "o", "w"),
    getColumn("away", "s", "u", "p"),
    getColumn("away", "s", "u", "y"),
    getColumn("away", "s", "o", "p"),
    getColumn("away", "s", "o", "y"),
    getColumn("away", "s", "d", "p"),
    getColumn("away", "s", "d", "y")
  ];

  this.create = function(set, rootPath) {
    var ascending = false;
    var myData = set.array();
    set.sort(ascending);

    el = d3.select(element);

    el.attr("class", "table");

    var head = el.append("thead");
    var body = el.append("tbody");
    var row = head.append("tr");
    var addRow = function(header, scope, colspan) {
      row.append("th")
         .attr("colspan", colspan)
         .attr("scope", scope)
         .text(header);
    }
    //top header
    addRow("", "colspan", "4");
    addRow("Overall", "colspan", "6");
    addRow("Home", "colspan", "7");
    addRow("Away", "colspan", "7");

    //second header
    row = head.append("tr");
    addRow("", "colspan", "4");
    addRow("Net", "colspan", "2");
    addRow("Offense", "colspan", "2");
    addRow("Defense", "colspan", "2");
    addRow("", "colspan", "1");
    addRow("Net", "colspan", "2");
    addRow("Offense", "colspan", "2");
    addRow("Defense", "colspan", "2");
    addRow("", "colspan", "1");
    addRow("Net", "colspan", "2");
    addRow("Offense", "colspan", "2");
    addRow("Defense", "colspan", "2");

    //third header
    row = head.append("tr");
    row.selectAll("th")
      .data(columns).enter().append("th")
        .attr("scope", "col")
        .text(function(d) {
          if (d.type == "team") {
            return "Team";
          } else if (d.type == "rank") {
            return "Rank";
          } else if (d.stat == "w") {
            if (d.ownopp == "s") {
              return "W";
            } else {
              return "Schedule";
            }
          } else if (d.stat == "p") {
            return "Pts";
          }
          return "Yds";
        }).on("click", function(d) {
          if (d.type == "team" ||
              d.type == "rank") {
            return;
          }
          row.sort(function(t1, t2) {
            var team1 = t1;
            var team2 = t2;
            if (d.offdef == 'd') {
              team1 = t2;
              team2 = t1;
            }
            return set.stat(d.type,team2,d.ownopp,d.offdef,d.stat) -
                   set.stat(d.type,team1,d.ownopp,d.offdef,d.stat);
          });
          updateColumns(); //needed for correct ranking
        });
    
    //data rows
    row = body.selectAll("tr")
                       .data(myData, function(d) {return d;});
    row.enter().append("tr")
               .each(function(d, idx) {
                  var col = d3.select(this).selectAll("td")
                                                 .data(columns);
                  col.enter().append("td");
               });

    var updateColumns = function() {
      row.each(function(d, idx) {
        var r = d3.select(this)
               .attr("class", function(d) {
                 evenodd = 'odd ';
                 if (idx % 2 == 0) {
                   evenodd = 'even ';
                 }
                 return evenodd + d;
               })
        var col = r.selectAll("td")
                                       .data(columns);
        col.text(function(c) {
          if (c.type == "team") {
            return d;
          } else if (c.type == "rank") {
            return idx + 1 + '';
          }
          retval = set.stat(c.type,d,c.ownopp,c.offdef,c.stat);
          if (c.offdef == "u" && c.stat == "p") {
            retval = retval.toFixed(1);
          }
          return retval;
        });
      });
    };

    updateColumns();

  };
  
};

hf.graphs.Table = Table;

