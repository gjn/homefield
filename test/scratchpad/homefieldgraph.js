nv.addGraph(function() {
  var chart = nv.models.scatterChart()
                .showDistX(true)
                .showDistY(true)
                .transitionDuration(350)
                .color(d3.scale.category10().range());

  chart.xAxis.tickFormat(d3.format('.02f'));
  chart.yAxis.tickFormat(d3.format('.02f'));
  var myData = getGroupedFootballData();

  d3.select('#mychart')
    .datum(myData)
    .call(chart);

  nv.utils.windowResize(chart.update);
  return chart;

});

function getGroupedFootballData() {
  var data = [];
  var stats = homefield.stats.results;
  var refstats = stats.average;
  var getStatsWith = function(other, team) {
    for (var j = 0; j < other.length; j++) {
      if (team == other[j].team) {
        return other[j];
      }
    }
    return undefined;
  }
  for (var i = 0; i < refstats.length; i++) {
    var ref = refstats[i];
    var home = getStatsWith(stats.home, ref.team);
    var away = getStatsWith(stats.away, ref.team);
    data.push({
      key: ref.team,
      values: [{
        x: home.stat.off.winloss,
        y: away.stat.off.winloss,
        size: ref.stat.off.winloss
      }]
    });
  }
  return data;
}

