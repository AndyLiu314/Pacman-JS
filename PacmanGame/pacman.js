//import TileMap from "./tilemap";

// Global variables
var canvas;
var gl;

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
	vec2( -0.05, -0.05 ),
	vec2(  0.0,  0.05 ),
	vec2(  0.05, -0.05 )
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

var vertexbuffer = [
	vec2( -0.95, 0.95),
	vec2(  0.95, 0.95),
	vec2(  0.95, -0.95 ),
	vec2( -0.95, 0.95),
	vec2(  0.95, -0.95 ),
	vec2( -0.95, -0.95 )
]; 

var vertexbufferColor = vec4(0.7, 0.7, 0.7, 1.0);

var pacmanColor = vec4(1.0, 0.0, 0.0, 1.0);

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
	//document.getElementById("debug").innerHTML = height;

	drawShape(gl.TRIANGLES, vertexbuffer, 6, vertexbufferColor);
	drawShape(gl.TRIANGLES, pacman_up, 3, pacmanColor);

	
	for (let row = 0; row < tilemap.length; row++){
		for (let column = 0; column < tilemap[0].length; column++){
			let grid = tilemap[row][column];
			if (grid == 0){

			}
		}
	}
	
	window.requestAnimFrame(render);
}