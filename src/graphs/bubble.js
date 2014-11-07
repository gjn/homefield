hf.graphs = hf.graphs || {};

var Bubble = function(element) {

  if (!(this instanceof Bubble)) {
    return new Bubble(element);
  }

  this.create = function(setX, setY, setR, rootPath) {
    var margin = {top: 30, right: 30, bottom: 20, left: 30},
        bulletsize = 30,
        width = 1000 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom,
        x = d3.scale.linear().range([bulletsize, width - bulletsize]),
        y = d3.scale.linear().range([height - bulletsize, bulletsize]),
        r = d3.scale.linear().range([5,bulletsize]),
        xAxis = d3.svg.axis().scale(x).orient("bottom"),
        yAxis = d3.svg.axis().scale(y).orient("left"),
        el = d3.select(element).attr("class", "bubble")
                               .attr("width", width + margin.left + margin.right)
                               .attr("height", height + margin.left + margin.right);
    
    el.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var array = setX.array();
    x.domain([
      d3.min(array, function(t) { return setX.teamStat(t); }),
      d3.max(array, function(t) { return setX.teamStat(t); })
    ]);

    //get y domain values
    y.domain([
      d3.min(array, function(t) { return setY.teamStat(t); }),
      d3.max(array, function(t) { return setY.teamStat(t); })
    ]);
    r.domain([
      d3.min(array, function(t) { return setR.teamStat(t); }),
      d3.max(array, function(t) { return setR.teamStat(t); })
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
        .text("Away");

    //add the lines
    var teams = el.selectAll(".team")
        .data(array)
      .enter().append("g")
    
    teams.append("circle")
        .attr("team", function(d) { return d; })
        .attr("cx", function(d) { return x(setX.teamStat(d)); })
        .attr("cy", function(d) { return y(setY.teamStat(d)); })
        .attr("r", function(d) { return r(setR.teamStat(d)); })
        .attr("title", function(d) { return hf.meta.shortToLong(d); });
  };
  
};

hf.graphs.Bubble = Bubble;

