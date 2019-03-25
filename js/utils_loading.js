function combineConnMat(edges, nNodes) {
  // edge : object from the JSON file
  // nNodes : int, total number of nodes

  // Extract the list of properties
  propertyList = Object.getOwnPropertyNames(edges[0]);

  // Create a list to store the connectivity matrices. Each entry of the list is
  // an object with Fields of this object are propertyName,
  // connectivityMatrix
  connMatList = new Array();

  for (i_property=0; i_property<propertyList.length; i_property++) {
    connMatList.push({propertyName : propertyList[i_property],
                      connMat      : createConnMat(edges, propertyList[i_property], nNodes)});
  }
  return connMatList;
}

function createConnMat(edges, property, nNodes) {
  // edge : object from the JSON file
  // property : a string with the name of the property of interest
  // nNodes : int, total number of nodes

  let connMat = [];
  for(var i=0; i<nNodes; i++) {
      connMat[i] = new Array(nNodes).fill(0);
  }
  for (i_edge=0; i_edge<edges.length; i_edge++)  {
    connMat[edges[i_edge].source-1][edges[i_edge].target-1] = numberise(edges[i_edge][property]);
  }
  return connMat;
}

function selectEdges(edgesToSelectFrom, selectedNode) {
  // Get node number
  var selectedNodeNumber = connectivityData.node.filter(obj => { return obj.dn_name === selectedNode })[0].id;

  // Get the edges linked to this node
  var selectedEdges = new Array();
  for (i_edge=0; i_edge<edgesToSelectFrom.length; i_edge++)  {
    if (edgesToSelectFrom[i_edge].target === selectedNodeNumber | edgesToSelectFrom[i_edge].source === selectedNodeNumber) {
      selectedEdges.push(edgesToSelectFrom[i_edge]);
    }
  }
  return selectedEdges;
}
