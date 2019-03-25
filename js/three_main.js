/**
 * Con-Viz - Copyleft
 */

// Scene setting
const WIDTH = window.innerWidth / 2.0;
const HEIGHT = window.innerHeight - 50;

// Set some camera attributes.
const VIEW_ANGLE = 45;
const ASPECT = WIDTH / HEIGHT;
const NEAR = 0.1;
const FAR = 10000;

// Three.js objects
var controls;
var container;
var renderer;
var scene;
var camera;
var point_light;
var projector = new THREE.Projector();
headerSize = 60;

// Data
var nodes = {};
var edges = {};

// Id to nodes
var id_to_nodes = {};

// Node objects
node_objects = {};
edge_objects = {};

// Colors
node_colors = {};

// Brain Material
brain_material = new THREE.MeshLambertMaterial({color: 0x5555ff, transparent: true, opacity: 0.2, depthWrite: false});

// Events
var onNodeSelectedFunc;

/********************************************
 * FUNCTIONS
 ********************************************/

/**
 * Load brain model
 */
function load_brain(path)
{
  // instantiate a loader
  var loader = new THREE.OBJLoader();

  // load a resource
  loader.load(
  	// resource URL
  	path,
  	// called when resource is loaded
  	function(object)
    {
      object.scale.set(60.0, 60.0, 60.0);
      object.position.y -= 40;
      object.traverse(function(child) {
          if(child instanceof THREE.Mesh)
          {
              child.material = brain_material;
              child.geometry.computeVertexNormals();
          }
      });
  		scene.add(object);
  	},
  	// called when loading is in progresses
  	function ( xhr ) {
  		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
  	},
  	// called when loading has errors
  	function ( error ) {
  		console.log( 'An error happened' );
  	}
  );
}

/**
 * Load data
 */
function load_data(surl)
{
  // Load JSON
  $.getJSON(surl, function(data)
  {
    // Nodes
    for(i=0; i<data.node.length; i++)
    {
      // Node
      node = data.node[i];

      // position
      node_x = parseFloat(node.dn_position_x.substring(1, node.dn_position_x.length-1)) - 57.75802802039638;
      node_z = parseFloat(node.dn_position_y.substring(1, node.dn_position_y.length-1)) - 55.00240079580239;
      node_y = parseFloat(node.dn_position_z.substring(1, node.dn_position_z.length-1)) - 40.10503904752529;

      // Update
      node.dn_position_x = node_x;
      node.dn_position_y = node_y;
      node.dn_position_z = node_z;

      // In dictionary
      nodes[node.id] = node;
    }

    // Edges
    for(i=0; i<data.edge.length; i++)
    {
      edge = data.edge[i];

      // In dico
      edges[i] = edge
    }

    // Init Scene
    init();

    // Update
    update();
  });
}

/**
 * Initialize the 3D scene
 */
function init()
{
  // Get the DOM element to attach to
  container = document.querySelector('#three_container');

  // Create a WebGL renderer, camera
  // and a scene
  renderer = new THREE.WebGLRenderer();

  // Background color
  renderer.setClearColor(0xffffff, 1);

  // A perspective camera
  camera = new THREE.PerspectiveCamera(
    VIEW_ANGLE,
    ASPECT,
    NEAR,
    FAR
  );

  // Scene
  scene = new THREE.Scene();

  // Orbit controls
  controls = new THREE.OrbitControls(camera, renderer.domElement);

  // x,y,z. increase the camera height on the y axis
  camera.position.set(0, 80, 80);
  controls.update();

  // looks in the center of the scene since that where we always start when creating a scene. 0,0,0
  camera.lookAt(scene.position);

  // Add the camera to the scene.
  scene.add(camera);

  // Start the renderer.
  renderer.setSize(WIDTH, HEIGHT);

  // create a point light
  var point_light1 = new THREE.DirectionalLight(0xffffff);
  point_light1.position.set(0, 1, 0).normalize();

  // Directional light 2
  var point_light2 = new THREE.DirectionalLight(0xffffff);
  point_light2.position.set(0, 0, 1).normalize();
  point_light2.intensity = 0.5;

  // Directional light 4
  var point_light3 = new THREE.DirectionalLight(0xffffff);
  point_light3.position.set(1, 0, 0).normalize();

  // Directional light 3
  var point_light4 = new THREE.DirectionalLight(0xffffff);
  point_light4.position.set(-1, 0, 0).normalize();
  point_light4.intensity = 0.5;

  // add to the scene
  scene.add(point_light2);
  scene.add(point_light1);
  scene.add(point_light3);
  scene.add(point_light4);

  // Attach the renderer-supplied
  // DOM element.
  container.appendChild(renderer.domElement);

  // Load nodes
  load_nodes();

  // Load edges
  load_edges();
}

/**
 * Load edges
 */
function load_edges()
{
  // For each edges
  for(var edge_id in edges)
  {
    // Current edges
    edge = edges[edge_id];

    // Source and target
    source_node = nodes[edge.source];
    target_node = nodes[edge.target];

    // Material
    var material = new THREE.LineBasicMaterial({
    	// color: node_colors[edge.source],
      color: 0x444444,
      transparent: true,
      opacity: 0.1
    });

    // Line
    var geometry = new THREE.Geometry();
    geometry.vertices.push(
    	new THREE.Vector3(source_node.dn_position_x, source_node.dn_position_y, source_node.dn_position_z),
    	new THREE.Vector3(target_node.dn_position_x, target_node.dn_position_y, target_node.dn_position_z)
    );
    var line = new THREE.Line(geometry, material);

    // Add to source node object
    if(source_node.edges == undefined)
    {
      source_node.edges = new Array();
    }
    source_node.edges.push(edge_id);

    // Add to scene
    scene.add(line);

    // Add to lists of edge
    edge_objects[edge_id] = line;
  }
}

/**
 * Load Nodes
 */
function load_nodes()
{
  // For each nodes
  for(var node_id in nodes)
  {
    // Current node
    node = nodes[node_id];

    // Position
    node_x = node.dn_position_x;
    node_y = node.dn_position_y;
    node_z = node.dn_position_z;

    // New meshes
    var geometry = new THREE.SphereGeometry(1, 5, 5);

    // Region
    node_region = node.dn_region

    // Color
    // node_colors[node_id] = 0.0;
    node_colors[node_id] = 0xbbbbee;
    /*while(node_colors[node_id] < Number.MAX_SAFE_INTEGER / 4.0)
    {
      node_colors[node_id] = Math.random() * Number.MAX_SAFE_INTEGER;
    }*/

    // New cube
    //var geometry = new THREE.BoxGeometry(3, 3, 3);
    var material = new THREE.MeshLambertMaterial({color: node_colors[node_id], transparent: true, opacity: 1.0});
    var new_node = new THREE.Mesh(geometry, material);

    // Position
    new_node.position.x = node_x;
    new_node.position.y = node_y;
    new_node.position.z = node_z;

    // Add to scene
    scene.add(new_node);

    // Add to objects
    node_objects[node_id] = new_node;
  }
}

/**
 * Called when there is an error
 */
function error_function(jqXHR, textStatus, errorThrown)
{
	console.log("Error " + textStatus + "! Incoming text " + jqXHR.responseText);
}

/**
 * Update display
 */
function update() {
  // Draw!
  renderer.render(scene, camera);

  // required if controls.enableDamping or controls.autoRotate are set to true
  controls.update();

  // Schedule the next frame.
  requestAnimationFrame(update);
}

/**
 * Highlight region
 */
function highlightNode(dn_name)
{
  // List of nodes to display
  displayed_nodes = {};
  for(var node_id in nodes)
  {
    displayed_nodes[node_id] = false;
  }

  // All edge not visible
  for(var edge_id in edge_objects)
  {
    edge_objects[edge_id].visible = false;
  }

  // Find node
  found = false;
  for(var node_id in nodes)
  {
    if(nodes[node_id].dn_name == dn_name)
    {
      found = true;
      highlight_node_id = node_id;
    }
  }

  // Not found
  if(!found)
  {
    return;
  }

  // Highlight target node
  displayed_nodes[highlight_node_id] = true;

  // Display each edges
  for(var edge_id in edges)
  {
    if(edges[edge_id].source == highlight_node_id)
    {
      edge_objects[edge_id].visible = true;
      edge_objects[edge_id].material.opacity = 1.0;
      displayed_nodes[edges[edge_id].target] = true
    }
  }

  // Change nodes opacity
  for(var node_id in node_objects)
  {
    if(displayed_nodes[node_id])
    {
      node_objects[node_id].material.opacity = 1.0;
    }
    else
    {
      node_objects[node_id].material.opacity = 0.2;
    }
  }
}

/**
 * On node selected
 */
function onNodeSelected(event_function)
{
  onNodeSelectedFunc = event_function;
}

/**********************************************
 * EVENTS
 **********************************************/

/**
 * Handle mouse motions
 */
function mouseMove(event)
{
  // DOM domElement
  container_element = renderer.domElement;

  // Vector
	var vector = new THREE.Vector3(
		(event.clientX / container_element.offsetWidth) * 2 - 1,
		-((event.clientY-headerSize) / (window.innerHeight-headerSize)) * 2 + 1,
		0.5
	);
	// projector.unprojectVector(vector, camera);
  vector.unproject(camera);

	// Ray
	var ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

	// Intersect
	var intersects = ray.intersectObjects(Object.values(node_objects));

	// Intersect with POI objects?
	if(intersects.length > 0)
	{
		// Search the object
		for(var node_id in nodes)
		{
			// This object?
      if(node_objects[node_id] == intersects[0].object)
      {
        // Highlight node
        highlightNode(nodes[node_id].dn_name);

        // Callback
        if(onNodeSelectedFunc != undefined)
        {
          onNodeSelectedFunc(nodes[node_id].dn_name);
        }

        // Stop
        break;
      }
		}
	}
  else {
    // Each node visible (opacity 1.0)
		for(var node_id in node_objects)
		{
      node_objects[node_id].material.opacity = 1.0;
    }

    // Each edge at standard opacity (0.2)
    for(var edge_id in edge_objects)
    {
      edge_objects[edge_id].visible = true;
      edge_objects[edge_id].material.opacity = 0.1;
    }
  }
}

function node_selected(dn_name)
{
  // Options
  /*options = new Array();

  // Get options
  $('#selector_node option').each(function(){
    options.push($(this).val());
  });

  // Search
  for(i=0; i<options.length; i++)
  {
    if(options[i] == dn_name)
    {
      document.getElementById("select_node").selectedIndex = i;
    }
  }*/
  $("#selector_node").val(dn_name);
  $("#selector_node").change();
  document.getElementById("selector_node").onchange();
}

/********************************************
 * MAIN
 ********************************************/

// A $( document ).ready() block.
$(document).ready(function() {
  // Load Data
  load_data("data/dwi_scale1.json")

  // Load brain model
  load_brain("data/Brain_Model.obj");

  // Node selected
  onNodeSelected(node_selected);

  // Events
  $("#three_container").mousemove(mouseMove);
});
