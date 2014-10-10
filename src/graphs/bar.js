hf.graphs = hf.graphs || {};

var Bar = function(element) {

  if (!(this instanceof Bar)) {
    return new Bar(element);
  }

  this.create = function(set) {
    var width = 1000;
    var padleft = 120;
    var barHeight = 20;
    var prevSet = set.getPreviousWeekSet();
    var myData = d3.entries(set.getStats());
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
            .domain([set.getTeamStat(myData[myData.length -1].key), set.getTeamStat(myData[0].key)])
            .range([0, width])

    el = d3.select(element);

    el.attr("width", width + padleft)
      .attr("height", barHeight * myData.length);

    var update = function() {
      console.log('update called', myData[0].key);
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
        .attr("width", function(d) { return x(set.getTeamStat(d.key)) + padleft; })
        .attr("height", barHeight -1);

      bar.append("text")
        .attr("x", function(d) { return x(set.getTeamStat(d.key)) + padleft - 3;})
        .attr("y", barHeight / 2)
        .attr("dy", ".27em")
        .text(function(d, i) {
          var rank = set.getTeamStat(d.key, true);
          var prevRank = prevSet.getTeamStat(d.key, true);
          var rankString = rank + '. ';
          if (prevRank) {
            var move = prevRank - rank;
            rankString += '(' + ((move == 0) ? '-' : (move > 0) ? ('+' + move) : move)  + ') ';
          }
          return rankString + d.key + ' [' + set.getTeamStat(d.key) + ']';
        });
    };

    update();
  };
  
};

hf.graphs.Bar = Bar;

