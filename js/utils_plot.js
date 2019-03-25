
function plotChord(connectivityData) {

  // create the svg area
  var svg = d3.select("#my_dataviz")
    .append("svg")
      .attr("width", 440)
      .attr("height", 440)
    .append("g")
      .attr("transform", "translate(220,220)")

  matrix = combineConnMat(edges, nNodes);
  matrix = matrix.filter(obj => { return obj.propertyName === "FA_median" });
  matrix = matrix[0].connMat;
  /* var matrix = [
    [11975,  5871, 8916, 2868],
    [ 1951, 10048, 2060, 6171],
    [ 8010, 16145, 8090, 8045],
    [ 1013,   990,  940, 6907]
  ]; */

  // give this matrix to d3.chord(): it will calculates all the info we need to draw arc and ribbon
  var res = d3.chord()
      .padAngle(0.05)     // padding between entities (black arc)
      .sortSubgroups(d3.descending)
      (matrix)

  // add the groups on the inner part of the circle
  svg
    .datum(res)
    .append("g")
    .selectAll("g")
    .data(function(d) { return d.groups; })
    .enter()
    .append("g")
    .append("path")
      .style("fill", "grey")
      .style("stroke", "black")
      .attr("d", d3.arc()
        .innerRadius(200)
        .outerRadius(210)
      )

  // Add the links between groups
  svg
    .datum(res)
    .append("g")
    .selectAll("path")
    .data(function(d) { return d; })
    .enter()
    .append("path")
      .attr("d", d3.ribbon()
        .radius(200)
      )
      .style("fill", "#69b3a2")
      .style("stroke", "black");
}



function plotScatterplot(connectivityData) {

  // setup

  margin_scatter = {top: 33, right: 5, bottom: 20, left: 50},
    width_scatter = 450 - margin_scatter.left - margin_scatter.right,
    height_scatter = 450 - margin_scatter.top - margin_scatter.bottom;

  svg_scatter = d3.select("#d3_plot").append("svg")
      .attr("width", width_scatter + margin_scatter.left + margin_scatter.right)
      .attr("height", height_scatter + margin_scatter.top + margin_scatter.bottom)
      .append("g")
      .attr("transform", "translate(" + margin_scatter.left + "," + margin_scatter.top + ")");

  x_scatter = d3.scaleLinear()
      .range([0,width_scatter]);

  y_scatter = d3.scaleLinear()
      .range([height_scatter,0]);

  xAxis_scatter = d3.axisBottom()
      .scale(x_scatter);

  yAxis_scatter = d3.axisLeft()
      .scale(y_scatter);

  // create the axes
  svg_scatter.append("g")
      .attr("class", "x axis")
      .attr("class", "xAxisScatter")
      .attr("transform", "translate(0," + height_scatter + ")")
      .call(xAxis_scatter);

  svg_scatter.append("g")
      .attr("class", "y axis")
      .attr("class", "yAxisScatter")
      .call(yAxis_scatter);


  // Load the JSON data
  propertyList = Object.getOwnPropertyNames(edges[0]).sort();
  selectorList = new Array();
  for (i_property=0; i_property<propertyList.length; i_property++) {
    selectorList.push({propertyName : propertyList[i_property]});
  }

  // Create the selector object
  var selector_x = d3.select("#selector_x"); // selector
  var selector_y = d3.select("#selector_y"); // selector

  selector_y
    .selectAll("option")
    .data(selectorList)
    .enter()
    .append("option")
    .text(function(d) { return d.propertyName;})
    .attr("value", function(d){ return d.propertyName;});

  selector_x
    .selectAll("option")
    .data(selectorList)
    .enter()
    .append("option")
    .text(function(d) { return d.propertyName;})
    .attr("value", function(d){ return d.propertyName;});

  // On change of selector...
  selector_y.on("change", function(){
    y_property = selector_y.property("value");
    x_property = selector_x.property("value");

    // Update axes names
    yaxistext_scatter = y_property;
    svg_scatter.selectAll(".yaxistext").remove();

    // text label for the y axis
    svg_scatter.append("text")
        .attr("class", "axistext")
        .attr("class", "yaxistext")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin_scatter.left)
        .attr("x",0 - (height_scatter/2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text(yaxistext_scatter);


    // Create the x and y arrays
    var xSeries_scatter = edges.map(function(e) { return numberise(e[x_property]); })
    var ySeries_scatter = edges.map(function(e) { return numberise(e[y_property]); })
    var rsq1 = leastSquares(xSeries_scatter,ySeries_scatter);

    // Create an array dataPlot where each object contains the coordinates x and y of the dots
    dataPlot = new Array();
    for (i_dot=0; i_dot<xSeries_scatter.length; i_dot++) {
      dataPlot.push({x : xSeries_scatter[i_dot],
                     y : ySeries_scatter[i_dot],
                     node1 : connectivityData.node[edges[i_dot].source-1].dn_name,
                     node2 : connectivityData.node[edges[i_dot].target-1].dn_name});
    }

    // update the scales
    y_scatter.domain(d3.extent(dataPlot, function(d){ return d.y}));
    x_scatter.domain(d3.extent(dataPlot, function(d){ return d.x}));
    svg_scatter.selectAll(".yAxisScatter").remove();
    svg_scatter.append("g")
        .attr("class", "y axis")
        .attr("class", "yAxisScatter")
        .call(yAxis_scatter);

    //  Remove and redraw the points
    d3.selectAll(".pointScatter").remove();
    d3.selectAll(".pointScatter_highlight").remove();
    svg_scatter.selectAll(".pointScatter")
        .data(dataPlot)
      .enter().append("circle")
        .attr("class", "point")
        .attr("class", "pointScatter")
        .attr("r", 2)
        .attr("cy", function(d){ return y_scatter(d.y); })
        .attr("cx", function(d){ return x_scatter(d.x); })
        .append("svg:title")
        .text(function(d) {str = "x : "+ d.x +"\n" + "y : "+ d.y +"\n" + "node 1 : "+ d.node1 +"\n" + "node 2 : "+ d.node2 +"\n" ; return str });

  }); // end of on.change function

  selector_x.on("change", function(){
    var y_property = selector_y.property("value");
    var x_property = selector_x.property("value");

    // Update axes names
    var xaxistext_scatter = x_property;
    svg_scatter.selectAll(".xaxistext").remove();

    // text label for the x axis
    svg_scatter.append("text")
        .attr("class", "axistext")
        .attr("class", "xaxistext")
        .attr("transform",
              "translate(" + (width_scatter/1.7 - margin_scatter.left) + " ," +
                             (width_scatter + margin_scatter.top) + ")")
        .style("text-anchor", "middle")
        .text(xaxistext_scatter);

    // Create the x and y arrays
    var xSeries_scatter = edges.map(function(e) { return numberise(e[x_property]); })
    var ySeries_scatter = edges.map(function(e) { return numberise(e[y_property]); })
    var rsq1 = leastSquares(xSeries_scatter,ySeries_scatter);

    // Create an array dataPlot where each object contains the coordinates x and y of the dots
    dataPlot = new Array();
    for (i_dot=0; i_dot<xSeries_scatter.length; i_dot++) {
      dataPlot.push({x : xSeries_scatter[i_dot],
                     y : ySeries_scatter[i_dot],
                     node1 : connectivityData.node[edges[i_dot].source-1].dn_name,
                     node2 : connectivityData.node[edges[i_dot].target-1].dn_name});
    }

    // update the scales
    x_scatter.domain(d3.extent(dataPlot, function(d){ return d.x}));
    svg_scatter.selectAll(".xAxisScatter").remove();
    svg_scatter.append("g")
        .attr("class", "x axis")
        .attr("class", "xAxisScatter")
        .attr("transform", "translate(0," + height_scatter + ")")
        .call(xAxis_scatter);

    //  Remove and redraw the points
    d3.selectAll(".pointScatter").remove();
    d3.selectAll(".pointScatter_highlight").remove();
    svg_scatter.selectAll(".pointScatter")
        .data(dataPlot)
        .enter().append("circle")
        .attr("class", "point")
        .attr("class", "pointScatter")
        .attr("r", 2)
        .attr("cy", function(d){ return y_scatter(d.y); })
        .attr("cx", function(d){ return x_scatter(d.x); })
        .append("svg:title")
        .text(function(d) {str = "x : "+ d.x +"\n" + "y : "+ d.y +"\n" + "node 1 : "+ d.node1 +"\n" + "node 2 : "+ d.node2 +"\n" ; return str });




    // First Equation - slope
    // document.getElementsByClassName("equation")[0].innerHTML = "y = " + round(rsq1[0] ,2) + "x + " + round(rsq1[1] ,2);


    // Second Equation - R2
    // document.getElementsByClassName("equation")[1].innerHTML = "R<sup>2</sup> = " + round(rsq1[2],2);


    // Add trendline
    /*ptAx1 =  d3.min(xSeries1);
    ptAy1 =  rsq1[0] *  d3.min(xSeries1) + rsq1[1];
    ptBy1 =  d3.max(ySeries1);
    ptBx1 =  (d3.max(ySeries1) - rsq1[1]) / rsq1[0];

    svg.append("line")
        .attr("class", "regression")
        .attr("x1", x(ptAx1))
        .attr("y1", y(ptAy1))
        .attr("x2", x(ptBx1))
        .attr("y2", y(ptBy1)); */


  }); // end of on.change function

}
