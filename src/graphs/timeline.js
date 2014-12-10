hf.graphs = hf.graphs || {};

var Timeline = function(element) {

  if (!(this instanceof Timeline)) {
    return new Timeline(element);
  }

  this.create = function(set, rootPath) {
    var margin = {top: 50, right: 75, bottom: 30, left: 40},
        width = 1200 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom,
        domainmargin = 0.05,
        x = d3.scale.ordinal().domain(set.weeks()).rangeRoundBands([0, width], 2.0),
        y = d3.scale.linear().range([height, 0])
        xAxis = d3.svg.axis().scale(x).orient("bottom"),
        yAxis = d3.svg.axis().scale(y).orient("left")
        line = d3.svg.line().interpolate("basis")
                     .x(function(d) {return x(d.week);})
                     .y(function(d) {return y(set.stat(d.week, d.team));}),
        el = d3.select(element).attr("class", "timeline")
                               .attr("width", width + margin.left + margin.right)
                               .attr("height", height + margin.left + margin.right);
    
    el = el.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var array = set.teams();
    var min = d3.min(array, function(t) { return d3.min(set.weeks(), function(w) { return set.stat(w,t); }); });
    var max = d3.max(array, function(t) { return d3.max(set.weeks(), function(w) { return set.stat(w,t); }); });
    var range = max - min;
    var min = min - (domainmargin * range);
    var max = max + (domainmargin * range);
    y.domain([min, max]);

    xAxis.tickFormat(function(v) {
      if (x.domain().length > 21) {
        if (v.indexOf('01', 4) > -1) {
          return v[0] + v[1] + v[2] + v[3];
        }
        if (v.indexOf('08', 4) > -1) {
          return '8';
        }
        if (v.indexOf('17', 4) > -1) {
          return '17';
        }
      } else {
        return v[4] + v[5];
      }
    });

    //add x axis
    el.append("g")
        .attr("class", "xaxis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
      .append("text")
        .attr("x", x(x.domain()[x.domain().length -1]) + 15)
        .attr("dy", "0.5em")
        .text("Weeks")

    //add y axis
    el.append("g")
        .attr("class", "yaxis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -10)
        .attr("x", 70)
        .attr("dy", "0.5em")
        .style("text-anchor", "end")
        .text(set.statName());

    //add the lines
    var teams = el.selectAll(".team")
        .data(set.array())
      .enter().append("g").attr("class", "timelineentry");
    
    teams.append("path")
        .attr("team", function(d) { return d.team; })
        .attr("d", function(d) { return line(d.values); })
        .attr("title", function(d) { return hf.meta.shortToLong(d.team); });

    teams.append("text")
        .datum(function(d) { return {team: d.team, value: d.values[d.values.length - 1]}; })
        .attr("transform", function(d) { return "translate(" + x(d.value.week) + "," + y(set.stat(d.value.week, d.value.team)) + ")"; })
        .attr("x", 3)
        .attr("dy", ".35em")
        .text(function(d) { return d.team; });

  };
  
};

hf.graphs.Timeline = Timeline;

