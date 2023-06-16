//import TileMap from "./tilemap";

// Global variables
var canvas;
var gl;
var debug
var program
var pressed = 0;
var score = 0;
var time = 60;

// Getting the keyboard input
window.addEventListener("keydown", getKey, false);
function getKey(key) {
	if (key.key == "ArrowUp"){
		//alert("key Up");
		pressed = 1;
	} else if (key.key == "ArrowDown"){
		//alert("key Down");
		pressed = 2;
	} else if (key.key == "ArrowLeft"){
		//alert("key Left");
		pressed = 3;
	} else if (key.key == "ArrowRight"){
		//alert("key Right");
		pressed = 4;
	}
}

// pacman movement frames
var pacman = [
	vec2(  -0.66,  0.67 ),
	vec2( -0.72, 0.79 ),
	vec2(  -0.78, 0.67)
];

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

const pacman_left = [
	vec2( -0.65, 0.77  ),
	vec2(  -0.78,  0.72 ),
	vec2(  -0.65, 0.67 )    
];

const pacman_right = [
	vec2(  -0.78,  0.77 ),
	vec2(  -0.65, 0.72 ),  
	vec2(   -0.78, 0.67 )
];

const pacman_down = [
	vec2( -0.66, 0.78 ),
	vec2(  -0.72,  0.66 ),
	vec2(  -0.78, 0.78 )    
];

const ghost1 = [
	vec2( -0.76, 0.77),
	vec2(  -0.67, 0.77),
	vec2(  -0.67, 0.688),
	vec2( -0.76, 0.77),
	vec2(  -0.67, 0.688),
	vec2(  -0.76, 0.688),
];

const ghost2 = [
	vec2( -0.76, 0.77),
	vec2(  -0.67, 0.77),
	vec2(  -0.67, 0.688),
	vec2( -0.76, 0.77),
	vec2(  -0.67, 0.688),
	vec2(  -0.76, 0.688),
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

// Create the vertex data for the circle
const center = vec2(-0.72, 0.729); // Center of the circle
const radius = 0.0245;            // Radius of the circle
const numSegments = 360;       // Number of segments for the circle

const foodDot = [];
foodDot.push(center);
for (let i = 0; i <= numSegments; i++) {
    const theta = (i / numSegments) * 2.0 * Math.PI;
    const x = center[0] + radius * Math.cos(theta);
    const y = center[1] + radius * Math.sin(theta);
    foodDot.push(vec2(x, y));
}

const pathbufferColor = vec4(0.85, 0.85, 0.85, 1.0);
const pacmanColor = vec4(0.0, 0.0, 1.0, 1.0);
const wallColor = vec4(0.0, 0.6, 0.0, 1.0);
const pacfoodColor = vec4(0.55, 0.55, 0.0, 1.0);
const ghostColor = [vec4(0.85, 0.0, 0.0, 1.0), vec4(0.0, 0.85, 0.85, 1.0)]; 

// 0 = wall
	// 0.1 = center wall
// 1 = path
// 2 = pacman
// 3 = foodDot
// 4 = ghost1
// 5 = ghost2
// 6 = superdot
// might need special number just for middle 2 blocks (when ghosts leave the area is colored like path but blocked)
var tilemap = [
	[3, 3, 3, 3, 3, 3, 3, 3, 3],
	[3, 0, 0, 0, 3, 0, 0, 0, 3],
	[3, 0, 0, 0, 3, 0, 0, 0, 3],
	[3, 3, 3, 3, 3, 3, 3, 3, 3],
	[3, 0, 3, 3, 4, 3, 3, 0, 3],
	[3, 0, 3, 3, 5, 3, 3, 0, 3],
	[3, 3, 3, 3, 3, 3, 3, 3, 3],
	[3, 0, 0, 0, 3, 0, 0, 0, 3],
	[3, 0, 0, 0, 3, 0, 0, 0, 3],
	[3, 3, 3, 3, 2, 3, 3, 3, 3]
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
	const newVertices = [];
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

function movePacman(tilemap){
	// first find row and column of pacman
	const search = 2;
	let row = tilemap.findIndex(row => row.includes(search));
	let col = tilemap[row].indexOf(search)

	// then check what key is pressed to determine direction
	// then check if the movement is allowed (key press is within bounds of tilemap)
	// then change tilemap[row][column] and move pacman ('2') to another grid
	if (pressed == 1){
		if(row > 0 && (tilemap[row-1][col] ==  1 || tilemap[row-1][col] ==  3)){
			if (tilemap[row-1][col] ==  3){
				score += 100;
				//console.log(score);
				document.getElementById("score").innerText =  score.toString();			
			}			
			tilemap[row-1][col] = 2;
			tilemap[row][col] = 1;
		}
	}
	else if (pressed == 2){
		if(row < 9 && (tilemap[row+1][col] ==  1 || tilemap[row+1][col] ==  3)){
			if (tilemap[row+1][col] ==  3){
				score += 100;
				//console.log(score);
				document.getElementById("score").innerText = score.toString();
			}			
			tilemap[row+1][col] = 2;
			tilemap[row][col] = 1;
		}
	}
	else if (pressed == 3){
		if(col > 0 && (tilemap[row][col-1] ==  1 || tilemap[row][col-1] ==  3)){
			if (tilemap[row][col-1] ==  3){
				score += 100;
				//console.log(score);
				document.getElementById("score").innerText = score.toString();				
			}			
			tilemap[row][col-1] = 2;
			tilemap[row][col] = 1;
		}
	}
	else if (pressed == 4){
		if(col < 8 && (tilemap[row][col+1] ==  1 || tilemap[row][col+1] ==  3)){
			if (tilemap[row][col+1] ==  3){
				score += 100;
				//console.log(score);
				document.getElementById("score").innerText = score.toString();					
			}
			tilemap[row][col+1] = 2;
			tilemap[row][col] = 1;
		}
	}
	return tilemap;
}

function renderMap(tilemap) {
	for (let row = 0; row < tilemap.length; row++){
		for (let column = 0; column < tilemap[0].length; column++){
			let grid = tilemap[row][column];
			if (grid == 0){
				let translateWall = translateObject(wall, row, column, 0.18, 0.162);
				drawShape(gl.TRIANGLES, translateWall, 6, wallColor);
			}

			else if (grid == 2){
				if (pressed == 1){
					pacman = pacman_up;
					pressed = 0;
				} else if (pressed == 2){
					pacman = pacman_down;
					pressed = 0;
				} else if (pressed == 3){
					pacman = pacman_left;
					pressed = 0;
				} else if (pressed == 4){
					pacman = pacman_right;
					pressed = 0;
				}
				let translatePacman = translateObject(pacman, row, column, 0.18, 0.162);
				drawShape(gl.TRIANGLES, translatePacman, 3, pacmanColor);
			}

			else if (grid == 3){
				let translateDot = translateObject(foodDot, row, column, 0.18, 0.162);
				drawShape(gl.TRIANGLE_FAN, translateDot, numSegments + 2, pacfoodColor);
			}

			else if (grid == 4){
				let translateGhost1 = translateObject(ghost1, row, column, 0.18, 0.162);
				drawShape(gl.TRIANGLES, translateGhost1, 6, ghostColor[0]);
			}

			else if (grid == 5){
				let translateGhost2 = translateObject(ghost2, row, column, 0.18, 0.162);
				drawShape(gl.TRIANGLES, translateGhost2, 6, ghostColor[1]);
			}
		}
	}
}

function myClock() {
	let second = time;
	document.getElementById("timer").innerText = second;
	time--;
}

setInterval(myClock, 1000);

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
	drawShape(gl.TRIANGLES, pathBuffer, 6, pathbufferColor);
	tilemap = movePacman(tilemap);
	renderMap(tilemap);
	window.requestAnimFrame(render);
}