//import TileMap from "./tilemap";

// Global variables
var canvas;
var gl;
var debug
var program

// Getting the keyboard input
window.addEventListener("keydown", getKey, false);
var pressed = 0;
function getKey(key) {
	if (key.key == "ArrowUp"){
		//alert("key Up");
		pressed = 1;
	}else if (key.key == "ArrowDown"){
		//alert("key Down");
		pressed = 2;
	}else if (key.key == "ArrowLeft"){
		//alert("key Left");
		pressed = 3;
	}else if (key.key == "ArrowRight"){
		//alert("key Right");
		pressed = 4;
	}
}

// pacman movement frames
const pacman_up = [
	vec2(  -0.66,  0.67 ),
	vec2( -0.72, 0.79 ),
	vec2(  -0.78, 0.67)
];

/* DEFAULT
var pacman_up = [
	vec2(  -0.63,  0.65 ),
	vec2( -0.72, 0.81 ),
	vec2(  -0.81, 0.65)
]; */

var pacman_left = [
	vec2( -0.05, 0.0 ),
	vec2(  0.05,  0.05 ),
	vec2(  0.05, -0.05 )    
];

var pacman_right = [
	vec2(  -0.05,  0.05 ),
	vec2(  -0.05, -0.05 ),  
	vec2(   0.05, 0.0 )
];

var pacman_down = [
	vec2( -0.05, 0.05 ),
	vec2(  0.05,  0.05 ),
	vec2(  0.0, -0.05 )    
];

const pathBuffer = [
	vec2( -0.81, 0.81),
	vec2(  0.81, 0.81),
	vec2(  0.81, -0.81),
	vec2( -0.81, 0.81),
	vec2(  0.81, -0.81),
	vec2(  -0.81, -0.81),
]; 

const wall = [
	vec2( -0.81, 0.81),
	vec2(  -0.63, 0.81),
	vec2(  -0.63, 0.648),
	vec2( -0.81, 0.81),
	vec2(  -0.63, 0.648),
	vec2(  -0.81, 0.648),
];

/*
var wall2 = [
	[-0.90, 0.90],
	[-0.70, 0.90],
	[-0.70, 0.70],
	[-0.90, 0.90],
	[-0.70, 0.70],
	[-0.90, 0.70]
];*/

var pathbufferColor = vec4(0.8, 0.8, 0.8, 1.0);

var pacmanColor = vec4(0.0, 0.0, 1.0, 1.0);

var wallColor = vec4(0.0, 0.6, 0.0, 1.0);

// 0 = wall
// 1 = path
// 2 = pacman
// 3 = dot
// 4 = ghost1
// 5 = ghost2
// 6 = superdot
// might need special number just for middle 2 blocks (when ghosts leave the area is colored like path but blocked)
var tilemap = [
	[1, 1, 1, 1, 1, 1, 1, 1, 1],
	[1, 0, 0, 0, 1, 0, 0, 0, 1],
	[1, 0, 0, 0, 1, 0, 0, 0, 1],
	[1, 1, 1, 1, 1, 1, 1, 1, 1],
	[1, 0, 1, 1, 0, 1, 1, 0, 1],
	[1, 0, 1, 1, 0, 1, 1, 0, 1],
	[1, 1, 1, 1, 1, 1, 1, 1, 1],
	[1, 0, 0, 0, 1, 0, 0, 0, 1],
	[1, 0, 0, 0, 1, 0, 0, 0, 1],
	[1, 1, 1, 1, 2, 1, 1, 1, 1]
];

function drawShape(type, vertices, n, color) {
	// creates and binds buffer to store vertex information
	var vBuffer = gl.createBuffer();
    if (!vBuffer) {
		console.log('Failed to create the buffer object');
		return -1;
	}
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW ); 

	// associates shader variables with data buffer
	var vPosition = gl.getAttribLocation( program, "vPosition" );
	if (vPosition < 0) {
		console.log('Failed to get the storage location of vPosition');
		return -1;
	}
	gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPosition );   

	//get color location and then send
	var colorLoc = gl.getUniformLocation(program, "uColor");
	gl.uniform4fv(colorLoc, color);

	// draw
	gl.drawArrays(type, 0, n);
}

function translateObject(vertices, row, column, amountX, amountY) {
	var newVertices = [];
	// copy vertices into new array to prevent vertices form being modified
	// vertices is used as a default render of an object
	// the coordinates of the default render always start at the top left corner of the map 
	for (let i = 0; i < vertices.length; i++) {
		newVertices.push(vec2(vertices[i][0], vertices[i][1]));
	}

	// applies translation
	for (let i = 0; i < newVertices.length; i++){
		let vertex = newVertices[i];
		newVertices[i] = vec2(vertex[0] + column*amountX, vertex[1] - row*amountY);
		//debug = newVertices[i][0];
	}
	return newVertices;
}

function renderMap(tilemap) {
	for (let row = 0; row < tilemap.length; row++){
		for (let column = 0; column < tilemap[0].length; column++){
			let grid = tilemap[row][column];
			if (grid == 0){
				let translateWall = translateObject(wall, row, column, 0.18, 0.162);
				drawShape(gl.TRIANGLES, translateWall, 6, wallColor);
			}

			if (grid == 2){
				let translatePacman = translateObject(pacman_up, row, column, 0.18, 0.162);
				drawShape(gl.TRIANGLES, translatePacman, 3, pacmanColor);
			}
		}
	}
}

window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    	if ( !gl ) { alert( "WebGL isn't available" ); }
	gl.viewport( 0, 0, canvas.width, canvas.height );
	gl.clearColor( 0.5, 0.5, 0.5, 1.0 );

    //  Load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram( program );

	render();
}

function render() {
	gl.clear( gl.COLOR_BUFFER_BIT ); 
	
	// For debugging 
	//console.log(height);
	//document.getElementById("debug").innerHTML = debug;

	drawShape(gl.TRIANGLES, pathBuffer, 6, pathbufferColor);
	renderMap(tilemap);
	//drawShape(gl.TRIANGLES, pacman_up, 3, pacmanColor);	
	//drawShape(gl.TRIANGLES, wall, 6, wallColor);
	

	
	window.requestAnimFrame(render);
}