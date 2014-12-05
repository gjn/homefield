hf.graphs = hf.graphs || {};

var Bubble = function(element) {

  if (!(this instanceof Bubble)) {
    return new Bubble(element);
  }

  this.create = function(setX, setY, setR, rootPath) {
    var margin = {top: 50, right: 75, bottom: 30, left: 40},
        bulletsize = 60,
        domainmargin = 0.05,
        width = 1000 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom,
        x = d3.scale.linear().range([0, width]),
        y = d3.scale.linear().range([height, 0]),
        r = d3.scale.linear().range([20,bulletsize]),
        xAxis = d3.svg.axis().scale(x).orient("bottom"),
        yAxis = d3.svg.axis().scale(y).orient("left").ticks(5),
        el = d3.select(element).attr("class", "bubble")
                               .attr("width", width + margin.left + margin.right)
                               .attr("height", height + margin.left + margin.right);
    
    el = el.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var array = setX.array();
    var min = d3.min(array, function(t) { return setX.teamStat(t); });
    var max = d3.max(array, function(t) { return setX.teamStat(t); });
    var range = max - min;
    var min = min - (domainmargin * range);
    var max = max + (domainmargin * range);
    x.domain([min, max]);

    min = d3.min(array, function(t) { return setY.teamStat(t); });
    max = d3.max(array, function(t) { return setY.teamStat(t); });
    range = max - min;
    min = min - (domainmargin * range);
    max = max + (domainmargin * range);
    y.domain([min, max]);

    r.domain([
      d3.min(array, function(t) { return setR ? setR.teamStat(t) : 20; }),
      d3.max(array, function(t) { return setR ? setR.teamStat(t) : 60; })
    ]);

    //add x axis
    el.append("g")
        .attr("class", "xaxis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
      .append("text")
        .attr("x", x(x.domain()[1]) + 10)
        .attr("dy", "0.5em")
        .text(setX.statName());

    //add y axis
    el.append("g")
        .attr("class", "yaxis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -10)
        .attr("x", 50)
        .attr("dy", "0.5em")
        .style("text-anchor", "end")
        .text(setY.statName());

    //add the bubbles
    var teams = el.selectAll(".team")
        .data(array)
      .enter().append("g")
 /*   
    teams.append("circle")
        .attr("team", function(d) { return d; })
        .attr("cx", function(d) { return x(setX.teamStat(d)); })
        .attr("cy", function(d) { return y(setY.teamStat(d)); })
        .attr("r", function(d) { return r(setR ? setR.teamStat(d) : bulletsize); })
        .attr("title", function(d) { return hf.meta.shortToLong(d); });
        */
    teams.append("svg:image")
        .attr("team", function(d) { return d; })
        .attr("x", function(d) { return x(setX.teamStat(d)); })
        .attr("y", function(d) { return y(setY.teamStat(d)); })
        .attr("height", function(d) { return r(setR ? setR.teamStat(d) : bulletsize); })
        .attr("width", function(d) { return r(setR ? setR.teamStat(d) : bulletsize); })
        .attr("xlink:href", function(d) { return rootPath + "img/" + d + ".svg"; })
        .attr("title", function(d) { return hf.meta.shortToLong(d); });
  };
  
};

hf.graphs.Bubble = Bubble;

