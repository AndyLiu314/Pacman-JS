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
	if (key.key == "ArrowDown")
		pressed = 1;
}

// pacman movement frames
var pacman_up = [
	vec2(  -0.85,  0.90 ),
	vec2( -0.80, 0.80 ),
	vec2(  -0.90, 0.80 )
];

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

var pathBuffer = [
	vec2( -0.90, 0.90),
	vec2(  0.90, 0.90),
	vec2(  0.90, -0.90),
	vec2( -0.90, 0.90),
	vec2(  0.90, -0.90),
	vec2(  -0.90, -0.90),
]; 

const wall = [
	vec2( -0.90, 0.90),
	vec2(  -0.70, 0.90),
	vec2(  -0.70, 0.70),
	vec2( -0.90, 0.90),
	vec2(  -0.70, 0.70),
	vec2(  -0.90, 0.70),
];

var wall2 = [
	[-0.90, 0.90],
	[-0.70, 0.90],
	[-0.70, 0.70],
	[-0.90, 0.90],
	[-0.70, 0.70],
	[-0.90, 0.70]
];

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
	[1, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 1],
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
	//newVertices = vertices;
	for (let i = 0; i < vertices.length; i++) {
		newVertices.push(vec2(vertices[i][0], vertices[i][1]));
	}

	for (let i = 0; i < newVertices.length; i++){
		let vertex = newVertices[i];
		newVertices[i] = vec2(vertex[0] + row*amountX, vertex[1] - column*amountY);
		//debug = newVertices[i][0];
	}

	return newVertices;
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


	newWall = translateObject(wall,1,0,0.2,0.2)
	newWall2 = translateObject(wall,2,0,0.2,0.2)
	newWall3 = translateObject(wall,3,0,0.2,0.2)
	newWall4 = translateObject(wall,4,0,0.2,0.2)
	newWall5 = translateObject(wall,5,0,0.2,0.2)
	newWall6 = translateObject(wall,6,0,0.2,0.2)
	newWall7 = translateObject(wall,7,0,0.2,0.2)
	newWall8 = translateObject(wall,8,0,0.2,0.2)
	newWall9 = translateObject(wall,9,0,0.2,0.2)
	//newWall2 = translateObject(wall,3,0,0.2,0.2)
	render();
}

function render() {
	gl.clear( gl.COLOR_BUFFER_BIT ); 
	
	// For debugging 
	//console.log(height);
	//document.getElementById("debug").innerHTML = debug;

	drawShape(gl.TRIANGLES, pathBuffer, 6, pathbufferColor);
	drawShape(gl.TRIANGLES, pacman_up, 3, pacmanColor);

	drawShape(gl.TRIANGLES, newWall, 6, wallColor);
	drawShape(gl.TRIANGLES, newWall2, 6, wallColor);

	/*
	drawShape(gl.TRIANGLES, newWall3, 6, wallColor);
	drawShape(gl.TRIANGLES, newWall4, 6, wallColor);
	drawShape(gl.TRIANGLES, newWall5, 6, wallColor);
	drawShape(gl.TRIANGLES, newWall6, 6, wallColor);
	drawShape(gl.TRIANGLES, newWall7, 6, wallColor);
	drawShape(gl.TRIANGLES, newWall8, 6, wallColor);*/ 
	
	drawShape(gl.TRIANGLES, wall, 6, wallColor);
	
	/*
	for (let row = 0; row < tilemap.length; row++){
		for (let column = 0; column < tilemap[0].length; column++){
			let grid = tilemap[row][column];
			if (grid == 0){
				//let translateWall = translateObject(wall, row, column, 0.2, 0.2);
				//drawShape(gl.TRIANGLES, translateWall, 6, wallColor);
			}
		}
	}*/
	
	window.requestAnimFrame(render);
}