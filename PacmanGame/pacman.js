// SIMPLIFIED PACMAN USING WEBGL
// Made By: Andy Liu

// Global variables
var canvas;
var gl;
var debug
var program
var pressed = 0;
var score = 0;
var time = 60;
var timerInterval; 
var ghostInterval; 
var isGameOver = false;
var isHit = false;
var isInvincible = false;
var pacmanCoord = [9,4]; // Coordinates are written in the form [Row, Column], where row and column refer to the 2d array
var ghost1Coord = [4,4]; 
var ghost2Coord = [5,4];
var ghostMove = 0; // Tracks movement of the ghosts
var ghostMove1 = 0;

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

// Vertex attributes of all objects within the program
// Vertices are all defaulted to the top left of the screen
// Vertices are then translated based on their position within the tilemap below
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

const numSegments = 360;   // Number of segments for the circles

// Create the vertex data for the food dot
const center = vec2(-0.72, 0.729); // Center of the circle
const radius = 0.0245;            // Radius of the circle    
const foodDot = [];
foodDot.push(center);
for (let i = 0; i <= numSegments; i++) {
    const theta = (i / numSegments) * 2.0 * Math.PI;
    const x = center[0] + radius * Math.cos(theta);
    const y = center[1] + radius * Math.sin(theta);
    foodDot.push(vec2(x, y));
}

// Create vertex data for the super dot powerup
const superCenter = vec2(-0.72, 0.729); // Center of the circle
const superRadius = 0.04;            // Radius of the circle
const superDot = [];
superDot.push(superCenter);
for (let i = 0; i <= numSegments; i++) {
    const theta = (i / numSegments) * 2.0 * Math.PI;
    const x = superCenter[0] + superRadius * Math.cos(theta);
    const y = superCenter[1] + superRadius * Math.sin(theta);
    superDot.push(vec2(x, y));
}

// Colours for objects
const pathbufferColor = vec4(0.85, 0.85, 0.85, 1.0);
const pacmanColor = vec4(0.0, 0.0, 1.0, 1.0);
const wallColor = vec4(0.0, 0.6, 0.0, 1.0);
const pacfoodColor = vec4(0.55, 0.55, 0.0, 1.0);
const ghostColor = [vec4(0.85, 0.0, 0.0, 1.0), vec4(0.0, 0.85, 0.85, 1.0)]; 
const superdotColor = vec4(0.75, 0.0, 0.75, 1.0);

// 0 = wall
// 1 = path
// 2 = pacman
// 3 = foodDot
// 4 = center
// 6 = superdot
// 2D array to store the location of each object being drawn
// This way, simple and quick changes to the tilemap can lead to large changes in rendering
// Ghosts are not rendered on the tilemap to simplify their movement
// If they are rendered on the map, they risk affecting the dots
var tilemap = [
	[3, 3, 3, 3, 3, 3, 3, 3, 3],
	[3, 0, 0, 0, 3, 0, 0, 0, 3],
	[3, 0, 0, 0, 3, 0, 0, 0, 3],
	[3, 3, 3, 3, 6, 3, 3, 3, 3],
	[3, 0, 3, 3, 4, 3, 3, 0, 3],
	[3, 0, 3, 3, 4, 3, 3, 0, 3],
	[3, 3, 3, 3, 3, 3, 3, 3, 3],
	[3, 0, 0, 0, 3, 0, 0, 0, 3],
	[3, 0, 0, 0, 3, 0, 0, 0, 3],
	[3, 3, 3, 3, 2, 3, 3, 3, 3]
];

function drawShape(type, vertices, n, color) {
	// Creates and binds buffer to store vertex information
	var vBuffer = gl.createBuffer();
    if (!vBuffer) {
		console.log('Failed to create the buffer object');
		return -1;
	}
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW ); 

	// Associates shader variables with data buffer
	var vPosition = gl.getAttribLocation( program, "vPosition" );
	if (vPosition < 0) {
		console.log('Failed to get the storage location of vPosition');
		return -1;
	}
	gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPosition );   

	// Get color location and then send
	var colorLoc = gl.getUniformLocation(program, "uColor");
	gl.uniform4fv(colorLoc, color);

	// Draw
	gl.drawArrays(type, 0, n);
}

// Copy vertices into new array to prevent vertices form being modified
// The coordinates of the default render always start at the top left corner of the map 
// These coordinates are then translated based on their position in the 2d array tilemap
function translateObject(vertices, row, column, amountX, amountY) {
	const newVertices = [];
	for (let i = 0; i < vertices.length; i++) { // Copy vertices into new array
		newVertices.push(vec2(vertices[i][0], vertices[i][1]));
	}

	for (let i = 0; i < newVertices.length; i++){ // Applies translation
		let vertex = newVertices[i];
		newVertices[i] = vec2(vertex[0] + column*amountX, vertex[1] - row*amountY);
	}
	return newVertices;
}

// Check what key is pressed to determine direction
// Check if the movement is allowed (key press is within bounds of tilemap)
// Change tilemap[row][column] and move pacman ('2') to another grid/position
// Change rendering position of other objects such as food dot or super dot if necessary
function movePacman(tilemap){
	let row = pacmanCoord[0];
	let col = pacmanCoord[1];
	if (pressed == 1){ // Up
		if(row > 0 && (tilemap[row-1][col] ==  1 || tilemap[row-1][col] ==  3 || tilemap[row-1][col] ==  6)){ // Check if movement is allowed in the tilemap
			if (tilemap[row-1][col] ==  3){ // Pacman moved onto a dot
				score += 100;
				document.getElementById("score").innerText =  score.toString();			
			} else if (tilemap[row-1][col] ==  6){ // Pacman moved onto a super dot powerup
				isInvincible = true;
			}		
			tilemap[row-1][col] = 2; // Elements of the tilemap are updated
			tilemap[row][col] = 1;
			pacmanCoord[0] = row - 1; // Pacman's coordinates are updated
		}
	}

	else if (pressed == 2){ // Down
		if(row < 9 && (tilemap[row+1][col] ==  1 || tilemap[row+1][col] ==  3 || tilemap[row+1][col] ==  6)){
			if (tilemap[row+1][col] ==  3){
				score += 100; 
				document.getElementById("score").innerText = score.toString();
			} else if (tilemap[row+1][col] ==  6){
				isInvincible = true;
			}		
			tilemap[row+1][col] = 2;
			tilemap[row][col] = 1;
			pacmanCoord[0] = row + 1;
		}
	}
	
	else if (pressed == 3){ // Left
		if(col > 0 && (tilemap[row][col-1] ==  1 || tilemap[row][col-1] ==  3 || tilemap[row][col-1] ==  6)){
			if (tilemap[row][col-1] ==  3){
				score += 100;
				document.getElementById("score").innerText = score.toString();				
			} else if (tilemap[row][col-1] ==  6){
				isInvincible = true;
			}		
			tilemap[row][col-1] = 2;
			tilemap[row][col] = 1;
			pacmanCoord[1] = col - 1;
		}
	}
	
	else if (pressed == 4){ // Right
		if(col < 8 && (tilemap[row][col+1] ==  1 || tilemap[row][col+1] ==  3 || tilemap[row][col+1] ==  6)){
			if (tilemap[row][col+1] ==  3){
				score += 100;
				document.getElementById("score").innerText = score.toString();					
			} else if (tilemap[row][col+1] ==  6){
				isInvincible = true;
			}
			tilemap[row][col+1] = 2;
			tilemap[row][col] = 1;
			pacmanCoord[1] = col + 1;
		}
	}
	return tilemap;
}

function generateRandomNum(tilemap, ghost1Coord, pacmanCoord) {
	let num1 = Math.floor(Math.random()*4 + 1); // random number from 1 to 4
	ghostMove = num1;

	let num2 = Math.floor(Math.random()*4 + 1); // random number from 1 to 4
	ghostMove1 = num2;
	//maybe make it so that ghosts dont run into walls
}

// Ghosts are not rendered on the map to simplify movement
// Instead, their movements are stored as coordinates in arrays to be passed to renderMap()
function moveGhost(tilemap, ghostCoord, ghostMove){
	let row = ghostCoord[0];
	let col = ghostCoord[1];

	if (ghostMove == 1){ // Up
		if(row > 0 && (tilemap[row-1][col] != 0)){		
			ghostCoord[0] = row - 1;
		}
	}	

	else if (ghostMove == 2){ // Down
		if(row < 9 && (tilemap[row+1][col] != 0)){			
			ghostCoord[0] = row + 1;
		}
	}

	else if (ghostMove == 3){ // Left
		if(col > 0 && (tilemap[row][col-1] != 0)){		
			ghostCoord[1] = col - 1;
		}
	}
	
	else if (ghostMove == 4){ // Right
		if(col < 8 && (tilemap[row][col+1] != 0)){
			ghostCoord[1] = col + 1;
		}
	}

	// Removes score when Pacman is caught by ghosts
	if (ghostCoord[0] == pacmanCoord[0] && ghostCoord[1] == pacmanCoord[1]){
		if (!isInvincible){
			score -= 500;
			isHit = true;
			if (score <= 0){
				score = 0;
				document.getElementById("score").innerText = score.toString();
				gameOver();
			}
		} else {
			isInvincible = false;
		}
	}
	return ghostCoord;
}

// Loops through the tilemap and renders objects according to their position in the 2d array
// Vertex attributes are translated from their default location in the upper left corner of the canvas
function renderMap(tilemap) {
	for (let row = 0; row < tilemap.length; row++){
		for (let column = 0; column < tilemap[0].length; column++){
			let grid = tilemap[row][column];
			if (grid == 0){ // Draw wall
				let translateWall = translateObject(wall, row, column, 0.18, 0.162);
				drawShape(gl.TRIANGLES, translateWall, 6, wallColor);
			}

			else if (grid == 2){ // Draw pacman
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
				if (isInvincible){ // Render color differently based on powerup status
					drawShape(gl.TRIANGLES, translatePacman, 3, superdotColor);
				} else {
					drawShape(gl.TRIANGLES, translatePacman, 3, pacmanColor);
				}
			}

			else if (grid == 3){ // Draw dot
				let translateDot = translateObject(foodDot, row, column, 0.18, 0.162);
				drawShape(gl.TRIANGLE_FAN, translateDot, numSegments + 2, pacfoodColor);
			}

			else if (grid == 6){ // Draw super dot
				let translateSuperDot = translateObject(superDot, row, column, 0.18, 0.162);
				drawShape(gl.TRIANGLE_FAN, translateSuperDot, numSegments + 2, superdotColor);
			}
		}
	}

	// Draw ghosts
	// Resets ghosts if it caught Pacman
	let translateGhost1 = translateObject(ghost1, ghost1Coord[0], ghost1Coord[1], 0.18, 0.162);
	drawShape(gl.TRIANGLES, translateGhost1, 6, ghostColor[0]);
	if (ghost1Coord[0] == pacmanCoord[0] && ghost1Coord[1] == pacmanCoord[1] && !isGameOver){
		ghost1Coord[0] = 4;
		ghost1Coord[1] = 4;
	}
	
	let translateGhost2 = translateObject(ghost2, ghost2Coord[0], ghost2Coord[1], 0.18, 0.162);
	drawShape(gl.TRIANGLES, translateGhost2, 6, ghostColor[1]);
	if (ghost2Coord[0] == pacmanCoord[0] && ghost2Coord[1] == pacmanCoord[1] && !isGameOver){
		ghost2Coord[0] = 5;
		ghost2Coord[1] = 4;	
	}

	ghostMove = 0;
	ghostMove1 = 0; 
}

// Clock function to track time
function myClock() {
	if (time >= 0) {
		let second = time;
		document.getElementById("timer").innerText = second;
		time--;
	} else {
        gameOver();
	}
}

// Checks if all dots have been eaten
function dotsCleared(tilemap) {
	for (let i = 0; i < tilemap.length; i++) {
		for (let j = 0; j < tilemap[i].length; j++) {
			if (tilemap[i][j] === 3) {
				return; // Dots still exist, exit function
			}
		}
	}
	gameOver(); // All dots cleared, call gameOver to end the game
	return; 
}

function gameOver() {
    clearInterval(timerInterval); // Stop the timers 
	clearInterval(ghostInterval);
	isGameOver = true;
}

window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    	if ( !gl ) { alert( "WebGL isn't available" ); }
	gl.viewport( 0, 0, canvas.width, canvas.height );
	gl.clearColor( 0.5, 0.5, 0.5, 1.0 );

    // Load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram( program );

	// Initialize clocks
	timerInterval = setInterval(myClock, 1000);

	// This clock determines how fast the ghosts move
	// More numbers generated means more movement
	ghostInterval = setInterval(generateRandomNum, 250); 
	render();
}

function render() {
	// Begins each render() call by checking if the game over conditions are met
	dotsCleared(tilemap);
	if (isHit || isGameOver){
		if (isGameOver){
			if (score > 0){ // Game has finished and Pacman has won
				let finalscore = score + (time+1)*100;
				let message = "Game Completed. Final Score: " + finalscore;
				alert(message);
				return;
			} else { // Gane has finished and Pacman has died
				let message = "Game Over, Pacman Has Died. Final Score: " + score;
				alert(message);
				return;
			}
		} else if (isHit) { // Notify player that they have been hit
			let message = "HIT! Score - 500";
			alert(message);
			document.getElementById("score").innerText = score.toString();	
			isHit = false;
		}
	}

	gl.clear( gl.COLOR_BUFFER_BIT ); 
	drawShape(gl.TRIANGLES, pathBuffer, 6, pathbufferColor);
	tilemap = movePacman(tilemap);
	ghost1Coord = moveGhost(tilemap, ghost1Coord, ghostMove);
	ghost2Coord = moveGhost(tilemap, ghost2Coord, ghostMove1);
	renderMap(tilemap);
	window.requestAnimFrame(render);
}