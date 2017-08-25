hf.graphs = hf.graphs || {};

var Table = function(element, settype) {

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

    getColumn(settype, "s", "o", "h"),
    getColumn(settype, "s", "o", "r"),
    getColumn(settype, "s", "d", "r"),
    getColumn(settype, "s", "o", "w"),

    getColumn(settype, "s", "u", "p"),
    getColumn(settype, "s", "u", "t"),
    getColumn(settype, "s", "u", "y"),
    getColumn(settype, "s", "o", "p"),
    getColumn(settype, "s", "o", "t"),
    getColumn(settype, "s", "o", "y"),
    getColumn(settype, "s", "d", "p"),
    getColumn(settype, "s", "d", "t"),
    getColumn(settype, "s", "d", "y"),

    getColumn(settype, "o", "o", "h"),
    getColumn(settype, "o", "o", "r"),
    getColumn(settype, "o", "d", "r"),
    getColumn(settype, "o", "o", "w")
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

    row = head.append("tr");
    addRow("", "colspan", "2");
    addRow("Ratings", "colspan", "4");

    addRow("Net", "colspan", "3");
    addRow("Offense", "colspan", "3");
    addRow("Defense", "colspan", "3");

    addRow("Strenght of Schedule", "colspan", "4");

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
          } else if (d.stat == "h") {
            return "Overall [%]";
          } else if (d.stat == "r") {
            if (d.offdef == "o") {
              return "Offense [%]";
            }
            return "Defense [%]";
          } else if (d.stat == "w") {
            return "Winrate";
          } else if (d.stat == "t") {
            return "TO";
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
            if (!hf.meta.biggerIsBetter(d.offdef, d.stat)) {
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
          if (c.offdef == "u" && (c.stat == "p" || c.stat == "t")) {
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

