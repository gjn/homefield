hf.graphs = hf.graphs || {};

var BarSOS = function(element) {

  if (!(this instanceof BarSOS)) {
    return new BarSOS(element);
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
    var ascending = false;

    set.sort(ascending);

    var x = d3.scale.linear()
            .domain([set.teamStat(myData[myData.length -1]), set.teamStat(myData[0])])
            .range([0, barWidth])

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
          if (prevRank) {
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
          var txt = '' + set.teamStat(d);
          if (d == 'h' || d == 'r') {
            txt += '%';
          }
          return '[' + txt + ']';
        });



      bar.append("svg:image")
        .attr("x", function(d) { return x(set.teamStat(d)) + padleft + 2;})
        .attr("height", barHeight - 2)
        .attr("width", barHeight - 2)
        .attr("xlink:href", function(d) { return rootPath + "img/" + d + ".svg";})
    };

    update();
  };
  
};

hf.graphs.BarSOS = BarSOS;

