hf.graphs = hf.graphs || {};

var Bar = function(element) {

  if (!(this instanceof Bar)) {
    return new Bar(element);
  }

  this.create = function(set, rootPath) {
    var width = 500;
    var padleft = 300;
    var barHeight = 30;
    var logowidth = 30;
    var prevSet = set.getPreviousWeekSet();
    var myData = d3.entries(set.stats());
    var ascending = true;

    var sort = function(doUpdate) {
      ascending = !ascending;
      myData.sort(function(d1, d2) {
        if (ascending) {
          return set.sortf(d2.key, d1.key);
        } else {
          return set.sortf(d1.key, d2.key);
        }
      });
      if (doUpdate) {
        update();
      }
    };

    sort();

    var x = d3.scale.linear()
            //.domain([set.teamStat(myData[0].key), set.teamStat(myData[myData.length -1].key)])
            .domain([set.teamStat(myData[myData.length -1].key), set.teamStat(myData[0].key)])
            .range([0, width])

    el = d3.select(element);

    el.attr("width", width + padleft + logowidth)
      .attr("height", barHeight * myData.length);

    var update = function() {
      //passing a second parameter allows the persistent
      //binding of the key (team) to the same div element
      var update = el.selectAll("g")
                     .data(myData, function(d) {return d.key;});
      var enter = update.enter();
      var exit = update.exit();

      //Appending to the enter selection expands the update selection.
      //Therefore, operations on the update selection apply to both
      //new and existing nodes
      enter.append("g");

      var bar = update.attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; });

      bar.append("rect")
        .attr("width", function(d) { return x(set.teamStat(d.key)) + padleft; })
        .attr("height", barHeight - 2)
        .style("fill", function(d) { return hf.meta.teamColor(d.key, 0); });

      bar.append("text")
        .attr("x", 0) //function(d) { return x(set.teamStat(d.key)) + padleft - 3;})
        .attr("y", barHeight / 2)
        .attr("dy", ".27em")
        .text(function(d, i) {
          var rank = set.teamStat(d.key, true);
          var prevRank = prevSet.teamStat(d.key, true);
          var rankString = rank + '. ';
          if (prevRank) {
            var move = prevRank - rank;
            rankString += '(' + ((move == 0) ? '-' : (move > 0) ? ('+' + move) : move)  + ') ';
          }
          return rankString + hf.meta.shortToLong(d.key) + ' [' + set.teamStat(d.key) + ']';
        })
        .style("fill", function(d) { return hf.meta.teamColor(d.key,1); });

      bar.append("svg:image")
        .attr("x", function(d) { return x(set.teamStat(d.key)) + padleft + 2;})
        .attr("height", barHeight - 2)
        .attr("width", barHeight - 2)
        .attr("xlink:href", function(d) { return rootPath + "img/" + d.key + ".svg";})
    };

    update();
/*
    setInterval(function() {
      sort(true);
    }, 1000);
    */
  };
  
};

hf.graphs.Bar = Bar;

