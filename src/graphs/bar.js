hf.graphs = hf.graphs || {};

var Bar = function(element) {

  if (!(this instanceof Bar)) {
    return new Bar(element);
  }
  var f = {
    'w': 1000,
    'p': 30,
    'y': 3
  };

  this.create = function(set) {
    var prevSet = set.getPreviousWeekSet();
    var myData = d3.entries(set.getStats());
    myData.sort(function(d1, d2) {
      return set.sortf(d1.key, d2.key);
    });


    d3.select(element)
      .selectAll("div")
        //passing a second parameter allows the persistent
        //binding of the key (team) to the same div element
        .data(myData, function(d) {
          return d.key;
        })
      .enter().append("div")
        .style("width", function(d) {
          var s = set.getTeamStat(d.key);
          return (s < 0.0 ? 0.0 : s) * f[set.getStatKey()] + 75 + "px";
        })
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
  
};

hf.graphs.Bar = Bar;

