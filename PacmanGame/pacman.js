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
var robertInterval; 
var colinInterval;
var isGameOver = false;
var isHit = false;
var isInvincible = false;
var isPaused = false; 
var pressedShift = false;
var pressedR = false;
var pacmanCoord = [9,4]; // Coordinates are written in the form [Row, Column], where row and column refer to the 2d array
var robertCoord = [4,4]; 
var colinCoord = [5,4];
var robertMove = 0; // Tracks movement of the ghosts
var colinMove = 0;

// Getting the keyboard input
var keyPressed = {};
window.addEventListener("keydown", getKey, false);
function getKey(key) {
	keyPressed[key.key + key.location] = true;
	if (key.key == "ArrowUp" && !isPaused){
		pressed = 1;
	} else if (key.key == "ArrowDown" && !isPaused){
		pressed = 2;
	} else if (key.key == "ArrowLeft" && !isPaused){
		pressed = 3;
	} else if (key.key == "ArrowRight" && !isPaused){
		pressed = 4;
	} else if (key.key == "p") {
		pauseGame();
	} else if (key.key == "Shift"){
		pressedShift = true;
		restartGame();
	} else if (key.key == "r") {
		pressedR = true;
		resumeGame();
	} else if (key.key == "R") {
		pressedR = true;
		restartGame();
	}
}

window.addEventListener("keyup", getKeyUp, false);
function getKeyUp(key) {
	if (key.key === "Shift") {
		pressedShift = false;
	} else if (key.key === "r") {
		pressedR = false;
	} else if (key.key === "R") {
		pressedR = false;
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

const robert = [
	vec2( -0.76, 0.77),
	vec2(  -0.67, 0.77),
	vec2(  -0.67, 0.688),
	vec2( -0.76, 0.77),
	vec2(  -0.67, 0.688),
	vec2(  -0.76, 0.688),
];

const colin = [
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

function RowPathfinding(tilemap, ghostCoord, pacmanCoord) {
	let g_row = ghostCoord[0];
	let g_col = ghostCoord[1];
	let p_row = pacmanCoord[0];
	let p_col = pacmanCoord[1];
	const rowDiff = p_row - g_row;
	const colDiff = p_col - g_col;
	let ranNum = Math.floor(Math.random()*100);

	if (Math.abs(rowDiff) > 0){ // If Pacman is any distance away vertically
		if (rowDiff > 0){ // If Pacman below 
			if (g_row < 9 && (tilemap[g_row+1][g_col] != 0)) { // If there are no obstacles
				robertMove = ranNum < 80 ? 2 : 1;
			} else { // If unable to move vertically, go horizontally
				if (colDiff >= 0){ 
					robertMove = ranNum < 70 ? 4 : 3;
				} else {
					robertMove = ranNum < 70 ? 3 : 4;
				}
			}

		} else { // If Pacman above
			if (g_row > 0 && (tilemap[g_row-1][g_col] != 0)) {
				robertMove = ranNum < 80 ? 1 : 2;
			} else { // If unable to move vertically, go horizontally
				if (colDiff >= 0){
					robertMove = ranNum < 70 ? 4 : 3;
				} else {
					robertMove = ranNum < 70 ? 3 : 4;
				}
			}
		}

	} else if (Math.abs(rowDiff) == 0) { // Pacman is the same vertical coordinate as the ghost
		if (colDiff > 0){ // Pacman is right
			if (g_col < 8 && (tilemap[g_row][g_col+1] != 0)) { // No obstacles
				robertMove = ranNum < 70 ? 4 : 3;
			} else { // Are obstacles
				robertMove = ranNum < 70 ? 1 : 2;
			} 
		} else { // Pacman is left
			if (g_col > 0 && (tilemap[g_row][g_col-1] != 0)) { // No obstacles
				robertMove = ranNum < 70 ? 3 : 4;
			} else { // Are obstacles
				robertMove = ranNum < 70 ? 2 : 1;
			} 
		}
	}
}

function ColumnPathfinding(tilemap, ghostCoord, pacmanCoord){
	let g_row = ghostCoord[0];
	let g_col = ghostCoord[1];
	let p_row = pacmanCoord[0];
	let p_col = pacmanCoord[1];
	const rowDiff = p_row - g_row;
	const colDiff = p_col - g_col;
	let ranNum = Math.floor(Math.random()*100);

	if (Math.abs(colDiff) > 0){ // If Pacman is any distance away horizontally
		if (colDiff > 0){ // If Pacman right
			if (g_col < 8 && (tilemap[g_row][g_col+1] != 0)) { // If there are no obstacles
				colinMove = ranNum < 80 ? 4 : 3;
			} else { // If unable to move horizontally, go vertically
				if (rowDiff >= 0){ 
					colinMove = ranNum < 70 ? 2 : 1;
				} else {
					colinMove = ranNum < 70 ? 1 : 2;
				}
			}

		} else { // If Pacman left
			if (g_col > 0 && (tilemap[g_row][g_col-1] != 0)) { // If there are no obstacles
				colinMove = ranNum < 80 ? 3 : 4;
			} else { // If unable to move horizontally, go vertically
				if (rowDiff >= 0){
					colinMove = ranNum < 70 ? 2 : 1;
				} else {
					colinMove = ranNum < 70 ? 1 : 2;
				}
			}
		}

	} else if (Math.abs(colDiff) == 0) { // Pacman is the same horizontal coordinate as the ghost
		if (rowDiff > 0){ // Pacman is below
			if (g_row < 9 && (tilemap[g_row+1][g_col] != 0)) { // No obstacles
				colinMove = ranNum < 70 ? 2 : 1;
			} else { // Are obstacles
				colinMove = ranNum < 70 ? 3 : 4;
			} 
		} else { // Pacman is above
			if (g_row > 0 && (tilemap[g_row-1][g_col] != 0)) { // No obstacles
				colinMove = ranNum < 70 ? 1 : 2;
			} else { // Are obstacles
				colinMove = ranNum < 70 ? 4 : 3;
			} 
		}
	}
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
			score -= 1000;
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
	let translateRobert = translateObject(robert, robertCoord[0], robertCoord[1], 0.18, 0.162);
	drawShape(gl.TRIANGLES, translateRobert, 6, ghostColor[0]);
	if (robertCoord[0] == pacmanCoord[0] && robertCoord[1] == pacmanCoord[1] && !isGameOver){
		robertCoord[0] = 4;
		robertCoord[1] = 4;
		clearInterval(robertInterval);
		setTimeout(resumeRobert, 1000);
	}
	
	let translateColin = translateObject(colin, colinCoord[0], colinCoord[1], 0.18, 0.162);
	drawShape(gl.TRIANGLES, translateColin, 6, ghostColor[1]);
	if (colinCoord[0] == pacmanCoord[0] && colinCoord[1] == pacmanCoord[1] && !isGameOver){
		colinCoord[0] = 5;
		colinCoord[1] = 4;	
		clearInterval(colinInterval);
		setTimeout(resumeColin, 1000);
	}

	robertMove = 0;
	colinMove = 0; 
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

function pauseGame() {
	if (!isGameOver){
		clearInterval(timerInterval);
		clearInterval(robertInterval);
		clearInterval(colinInterval);
		document.getElementById("paused").style.opacity = 1;
		isPaused = true;
	}
}

function resumeGame() {
	if (!isGameOver && isPaused) {
		timerInterval = setInterval(myClock, 1000);
		robertInterval = setInterval(function () {RowPathfinding(tilemap, robertCoord, pacmanCoord);}, 300); 
		colinInterval = setInterval(function () {ColumnPathfinding(tilemap, colinCoord, pacmanCoord);}, 300);
		document.getElementById("paused").style.opacity = 0;
	}
	document.getElementById("paused").style.opacity = 0;
	isPaused = false;
}

function restartGame() {
	if (pressedShift && pressedR) {
		clearInterval(timerInterval);
		clearInterval(robertInterval);
		clearInterval(colinInterval);
		location.reload();
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
	clearInterval(robertInterval);
	clearInterval(colinInterval);
	isGameOver = true;
}

function resumeRobert(){
	robertInterval = setInterval(function () {RowPathfinding(tilemap, robertCoord, pacmanCoord);}, 300);
}

function resumeColin(){
	colinInterval = setInterval(function () {ColumnPathfinding(tilemap, colinCoord, pacmanCoord);}, 300);
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
	robertInterval = setInterval(function () {RowPathfinding(tilemap, robertCoord, pacmanCoord);}, 300); 
	colinInterval = setInterval(function () {ColumnPathfinding(tilemap, colinCoord, pacmanCoord);}, 300);
	render();
}

function render() {
	// Begins each render() call by checking if the game over conditions are met
	dotsCleared(tilemap);
	if (isHit || isGameOver){
		if (isGameOver){
			if (score > 0){ // Game has finished and Pacman has won
				let finalscore = score + (time+1)*100;
				document.getElementById("score").innerText = finalscore.toString();
				document.getElementById("victory").style.opacity = 1;
				let message = "Game Completed. Final Score: " + finalscore;
				alert(message);
				return;
			} else { // Game has finished and Pacman has died
				document.getElementById("death").style.opacity = 1;
				let message = "Game Over, Pacman Has Died. Final Score: " + score;
				alert(message);
				return;
			}
		} else if (isHit) { // Notify player that they have been hit
			let message = "HIT! Score - 1000. Get Ready To Move!";
			alert(message);
			document.getElementById("score").innerText = score.toString();	
			isHit = false;
		}
	}

	gl.clear( gl.COLOR_BUFFER_BIT ); 
	drawShape(gl.TRIANGLES, pathBuffer, 6, pathbufferColor);
	tilemap = movePacman(tilemap);
	robertCoord = moveGhost(tilemap, robertCoord, robertMove);
	colinCoord = moveGhost(tilemap, colinCoord, colinMove);
	renderMap(tilemap);
	window.requestAnimFrame(render);
}