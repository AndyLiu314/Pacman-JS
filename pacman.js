// Global variables
var canvas;
var gl;

var program
var height = 0.0;
var vBuffer;
var vPosition
var uniformColor;
var attribPosition;
//var uniformPosition;
var heightLoc;

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

var map = [
	[0, 0, 1, 1, 0],
	[0, 1, 1, 0, 0],
	[0, 1, 0, 0, 0],
	[0, 0, 0, 0, 1],
	[1, 0, 0, 1, 1]
];

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    	if ( !gl ) { alert( "WebGL isn't available" ); }

	gl.viewport( 0, 0, canvas.width, canvas.height );


    //  Load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram( program );

	// Creating the vertex buffer


	// Binding the vertex buffer

 

	render();
}

function render() {
	gl.clearColor( 0.5, 0.5, 0.5, 1.0 );
	gl.clear( gl.COLOR_BUFFER_BIT ); 
	
	// For debugging 
	//console.log(height);
	//document.getElementById("debug").innerHTML = height;
	
	// Sending the color to the vertex shader

	
	// Clearing the buffer and drawing the square


	// background frame
	vBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferData( gl.ARRAY_BUFFER, flatten(vertexbuffer), gl.STATIC_DRAW ); 
	vPosition = gl.getAttribLocation( program, "vPosition" );
	gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPosition );   

	//get color location and then send
	colorLoc = gl.getUniformLocation(program, "uColor");
	gl.uniform4fv(colorLoc, vertexbufferColor);
	gl.drawArrays( gl.TRIANGLES, 0, 6 );

	//vPosition = gl.getAttribLocation( program, "vPosition" );
	//gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
	//gl.enableVertexAttribArray( vPosition );   




	//pacman
	vBuffer1 = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer1);
	gl.bufferData( gl.ARRAY_BUFFER, flatten(pacman_up), gl.STATIC_DRAW ); 
	vPosition = gl.getAttribLocation( program, "vPosition" );
	gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPosition );   

	//send color
	colorLoc = gl.getUniformLocation(program, "uColor");
	gl.uniform4fv(colorLoc, pacmanColor);
	gl.drawArrays( gl.TRIANGLES, 0, 6 );
	
	window.requestAnimFrame(render);
}