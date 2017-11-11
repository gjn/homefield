hf.graphs = hf.graphs || {};

var Bar = function(element) {

  if (!(this instanceof Bar)) {
    return new Bar(element);
  }

  this.create = function(set, rootPath) {
    var myData = set.array();
    var width = 790;
    var barHeight = 30;
    var height = barHeight * myData.length;
    var padleft = 300; // For text
    var logowidth = 30;
    var barWidth = width - padleft - logowidth;
    var prevSet = set.previousWeek();
    var ascending = !hf.meta.biggerIsBetter(set.getOffDef(), set.getStat());

    set.sort(ascending);

    var x = d3.scale.linear();
    if (!ascending) {
      x = x.domain([set.teamStat(myData[myData.length -1]), set.teamStat(myData[0])])
    } else {
      x = x.domain([set.teamStat(myData[0]), set.teamStat(myData[myData.length - 1])])
    }
    x = x.range([0, barWidth])

    el = d3.select(element);

    el.attr("class", "bar")
      //.attr("width", width)
      //.attr("height", barHeight * myData.length)
      .attr("viewBox", '0 0 ' + width + ' ' + height)
      .attr("preserveAspectRatio", "none");

    var update = function() {
      //passing a second parameter allows the persistent
      //binding of the key (team) to the same div element
      var update = el.selectAll("g")
                     .data(myData, function(d) {return d;});
      var enter = update.enter();
      var exit = update.exit();

      //Appending to the enter selection expands the update selection.
      //Therefore, operations on the update selection apply to both
      //new and existing nodes
      enter.append("g");

      var bar = update.attr("class", function(d) { return d;})
                      .attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; });

      bar.append("rect")
        .attr("width", function(d) { return x(set.teamStat(d)) + padleft; })
        .attr("height", barHeight - 2);

      bar.append("text")
        .attr("x", 5)
        .attr("y", barHeight / 2)
        .attr("dy", ".27em")
        .text(function(d, i) {
          var rank = i + 1;
          var prevRank = prevSet ? prevSet.teamStat(d, true) : prevSet;
          var rankString = rank + '. ';
          if (prevRank && prevSet.hasRanking()) {
            var move = prevRank - rank;
            rankString += '(' + ((move == 0) ? '-' : (move > 0) ? ('+' + move) : move)  + ') ';
          }
          return rankString + hf.meta.shortToLong(d);
        });

      bar.append("text")
        .attr("x", function(d) { return x(set.teamStat(d)) + padleft - 5;})
        .attr("y", barHeight / 2)
        .attr("dy", ".27em")
        .attr("text-anchor", "end")
        .text(function(d, i) {
          var txt = '' + set.teamStat(d).toFixed(set.precision());
          txt += set.addendum();
          return '[' + txt + ']';
        });


      if (!set.isAggregate()) {
        bar.append("svg:image")
          .attr("x", function(d) { return x(set.teamStat(d)) + padleft + 2;})
          .attr("height", barHeight - 2)
          .attr("width", barHeight - 2)
          .attr("xlink:href", function(d) { return rootPath + "img/" + d + ".svg";})
      }
    };

    update();
  };
  
};

hf.graphs.Bar = Bar;

