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
    getColumn("team", "s", "o", "w"),
    getColumn("overall", "s", "o", "w"),
    getColumn("overall", "o", "o", "w"),
    getColumn("home", "s", "o", "w"),
    getColumn("away", "s", "o", "w"),
    getColumn("overall", "s", "o", "pdiff"),
    getColumn("home", "s", "o", "pdiff"),
    getColumn("away", "s", "o", "pdiff"),
    getColumn("overall", "s", "o", "ydiff"),
    getColumn("home", "s", "o", "ydiff"),
    getColumn("away", "s", "o", "ydiff"),
    getColumn("overall", "s", "o", "p"),
    getColumn("home", "s", "o", "p"),
    getColumn("away", "s", "o", "p"),
    getColumn("overall", "s", "o", "y"),
    getColumn("home", "s", "o", "y"),
    getColumn("away", "s", "o", "y"),
    getColumn("overall", "s", "d", "p"),
    getColumn("home", "s", "d", "p"),
    getColumn("away", "s", "d", "p"),
    getColumn("overall", "s", "d", "y"),
    getColumn("home", "s", "d", "y"),
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
    addRow("", "colspan", "5");
    addRow("Differentials", "colspan", "6");
    addRow("Offense", "colspan", "6");
    addRow("Defense", "colspan", "6");

    //second header
    row = head.append("tr");
    addRow("", "colspan", "1");
    addRow("Rating", "colspan", "4");
    addRow("Points", "colspan", "3");
    addRow("Yards", "colspan", "3");
    addRow("Points", "colspan", "3");
    addRow("Yards", "colspan", "3");
    addRow("Points", "colspan", "3");
    addRow("Yards", "colspan", "3");

    //third header
    row = head.append("tr");
    row.selectAll("th")
      .data(columns).enter().append("th")
        .attr("scope", "col")
        .text(function(d) {
          if (d.type == "team") {
            return "Team";
          } else if (d.type == "overall") {
            if (d.ownopp == "s") {
              return "Overall";
            } else {
              return "Schedule";
            }
          } else if (d.type == "home") {
            return "Home";
          }
          return "Away";
        }).on("click", function(d) {
          if (d.type == "team") {
            return;
          }
          row.sort(function(t1, t2) {
            var team1 = t1;
            var team2 = t2;
            if (d.offdef == 'd') {
              team1 = t2;
              team2 = t1;
            }
            if (d.stat.indexOf('diff') > -1) {
              return (set.stat(d.type,team2,d.ownopp,'o',d.stat[0]) -
                     set.stat(d.type,team2,d.ownopp,'d',d.stat[0])) -
                     (set.stat(d.type,team1,d.ownopp,'o',d.stat[0]) -
                     set.stat(d.type,team1,d.ownopp,'d',d.stat[0]));
            }
            return set.stat(d.type,team2,d.ownopp,d.offdef,d.stat) -
                   set.stat(d.type,team1,d.ownopp,d.offdef,d.stat);
          });
        });
    
    //data rows
    row = body.selectAll("tr")
                       .data(myData, function(d) {return d;})
                       .attr("class", function(d) { return d;});
    row.enter().append("tr")
               .each(function(d) {
                  var col = d3.select(this).selectAll("td")
                                                 .data(columns);
                  col.enter().append("td");

                  col.text(function(c) {
                    if (c.type == "team") {
                      return d;
                    }
                    if (c.stat.indexOf('diff') > -1) {
                      return (set.stat(c.type, d, c.ownopp, 'o', c.stat[0]) -
                             set.stat(c.type, d, c.ownopp, 'd', c.stat[0])).toFixed(1);
                    }
                    return set.stat(c.type,d,c.ownopp,c.offdef,c.stat);
                  });
               });
  };
  
};

hf.graphs.Table = Table;

