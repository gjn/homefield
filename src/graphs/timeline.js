hf.graphs = hf.graphs || {};

var Timeline = function(element) {

  if (!(this instanceof Timeline)) {
    return new Timeline(element);
  }

  this.create = function(set, rootPath) {
    var margin = {top: 20, right: 20, bottom: 20, left: 20},
        width = 1000 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom,
        x = d3.scale.ordinal().domain(set.weeks()).rangeRoundBands([0, width], 0.1),
        y = d3.scale.linear().range([height, 0])
        xAxis = d3.svg.axis().scale(x).orient("bottom"),
        yAxis = d3.svg.axis().scale(y).orient("left")
        line = d3.svg.line().interpolate("basis")
                     .x(function(d) {return x(d.week);})
                     .y(function(d) {return y(set.stat(d.week, d.team));}),
        el = d3.select(element).attr("class", "timeline")
                               .attr("width", width + margin.left + margin.right)
                               .attr("height", height + margin.left + margin.right);
    
    el.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //get y domain values
    y.domain([
      d3.min(set.teams(), function(t) {return d3.min(set.weeks(), function(w) {return set.stat(w,t) ;}); }),
      d3.max(set.teams(), function(t) {return d3.max(set.weeks(), function(w) {return set.stat(w,t) ;}); })
    ]);

    //add x axis
    el.append("g")
        .attr("class", "xaxis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    //add y axis
    el.append("g")
        .attr("class", "yaxis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .style("text-anchor", "end")
        .text("Rating");

    //add the lines
    var teams = el.selectAll(".team")
        .data(set.array())
      .enter().append("g")
    
    teams.append("path")
        .attr("team", function(d) { return d.team; })
        .attr("d", function(d) { return line(d.values); })
        .attr("title", function(d) { return d.team; });

    teams.append("text")
        .datum(function(d) { return {team: d.team, value: d.values[d.values.length - 1]}; })
        .attr("transform", function(d) { return "translate(" + x(d.value.week) + "," + y(set.stat(d.value.week, d.value.team)) + ")"; })
        .attr("x", 3)
        .attr("dy", ".35em")
        .text(function(d) { return d.team; });

  };
  
};

hf.graphs.Timeline = Timeline;

