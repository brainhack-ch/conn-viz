// create input data: a square matrix that provides flow between entities
d3.json("./data/dwi_scale1.json", function(data) {
  connectivityData = data;
  edges = connectivityData.edge;
  nNodes = connectivityData.node.length;

  nodeNames = d3.nest().key(function(d) {return d.dn_name}).entries(connectivityData.node)
  nodeNames = nodeNames.sort(dynamicSort("key"))

  /* Let go for now. This is to be used when we implement categories of nodes.
  nodeCategories = d3.nest().key(function(d) {return d.dn_region}).entries(connectivityData.node)
  nodeCategories = nodeCategories.map(function(x) {x.key = x.key.toLowerCase(); return x})
  nodeCategories = nodeCategories.sort(dynamicSort("key"))
  for (i_category=0; i_category<nodeCategories.length; i_category++) {
    nodeList.push({propertyName : propertyList[i_property],
                      connMat      : createConnMat(edges, propertyList[i_property], nNodes)});
  } */

  selector_node = d3.select("#selector_node"); // selector
  selector_node
    .selectAll("option")
    .data(nodeNames)
    .enter()
    .append("option")
    .text(function(d) { return d.key.toLowerCase();})
    .attr("value", function(d){ return d.key;});

  selector_node.on("change", function(){
    var y_property = d3.select("#selector_y").property("value");
    var x_property = d3.select("#selector_x").property("value");
    var selected_node = selector_node.property("value");

    highlightNode(selected_node);
    console.log("change");
    selectedEdges = selectEdges(edges, selected_node);

    // Create the x and y arrays
    var xSeries_scatter_highlight = selectedEdges.map(function(e) { return numberise(e[x_property]); })
    var ySeries_scatter_highlight = selectedEdges.map(function(e) { return numberise(e[y_property]); })

    // Create an array dataPlot where each object contains the coordinates x and y of the dots
    dataPlot_highlight = new Array();
    for (i_dot=0; i_dot<ySeries_scatter_highlight.length; i_dot++) {
      dataPlot_highlight.push({x : xSeries_scatter_highlight[i_dot],
                     y : ySeries_scatter_highlight[i_dot],
                     node1 : connectivityData.node[selectedEdges[i_dot].source-1].dn_name,
                     node2 : connectivityData.node[selectedEdges[i_dot].target-1].dn_name});
    }

    //  Remove and redraw the points
    d3.selectAll(".pointScatter_highlight").remove();
    svg_scatter.selectAll(".pointScatter_highlight")
        .data(dataPlot_highlight)
      .enter().append("circle")
        .attr("class", "point")
        .attr("class", "pointScatter")
        .attr("class", "pointScatter_highlight")
        .attr("r", 2)
        .attr("cy", function(d){ return y_scatter(d.y); })
        .attr("cx", function(d){ return x_scatter(d.x); })
        .attr("fill", "red")
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

  plotScatterplot(data);
});
