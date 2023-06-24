# A SIMPLIFIED PACMAN GAME
## Made By: Andy Liu

**Instructions To Run:** The game should work on the latest stable version of Chrome. However, if it does not run, 
try creating a localhost server and opening the HTML file through that. I ran my file by selecting "Start Server Logging" 
in the VSCode Command Palette and then copying the link provided into "Debug: Open Link" (also in the Command Palette).

**Overview of Design:** 
All steps were completed for this assignment. The overall design revolves around a 2d array called tilemap that stores 
the location of all objects that need to be rendered. These objects are essentially located on a grid with the row and
the columns of the 2d array representing x and y. Changes made to the tilemap will reflect in the rendering so the map
can be easily changed dynamically. Pacman movement and the scoring system also revolves around this design where 
direction key inputs will move Pacman's position on the tilemap respectively. For example, pressing the left key will 
move Pacman (represented as a 2 on the 2d array) tilemap[row][column-1]. Any dots in that grid will be eaten and score 
will be added. That specific dot will also no longer be rendered since it is removed from the tilemap. The controls and 
other functionalities within the game are exactly the same as stated in the pdf guidelines (this includes the functionality 
of the superdot which makes the player invincible for a single hit. This can be seen by the player turning purple after 
eating the powerup).

**General Ghost Design:** 
The ghosts were designed as seperate entities from the 2d array tilemap. This was to avoid the ghosts' movement affecting
the dot placement around the map. Global arrays stored the coordinates of moving entities like pacman and the ghosts 
(coordinates were arrays with 2 elements, the row and column like so: [row, column]). If pacman and a ghost collided, 
their coordinates would be checked and if they matched, 1000 points would be deducted. The ghosts would then be reset 
and have a delayed movement timer of 1 second to prevent them from constantly catching you if you are close to the center. 
The increase of point deduction from 500 to 1000 is to give the player less room for error. Ghosts also move at a pace of 
1 unit per 250 ms.

**Ghost Pathfinding AI:** 
The ghosts are named Robert (pronouced Row-bert) and Colin (pronouced how you would expect). They are named like so because 
their pathfinding AI either follows a predominantly Row-focused tracking (for Robert) or a Column-focused tracking (for Colin). 
Ghost movement is determined by chance where they are most likely to move in the direction closest to the player.
Robert will first try to close the gap vertically by checking the distance in rows. He will prioritize moving up or down 
depending on where the player is (so most likely down if the player is below and up if the player is above). Colin will 
do the opposite and prioritize horizontal movement between columns instead. Both of them will try to avoid walls and make
decisions based on the position of the player and the ghosts own surroundings. The reason these 2 ghosts were programmed 
specifically like this is because this allows them to encircle players. This is especially effective at the start when
there isn't enough points to survive a hit. Players have to act fast and be mindful of their movements otherwise they 
risk getting trapped. The encircling movements of the ghosts, increased point deduction, and fast movement speed have
all been done to balance this game and make it harder. It is a challenge to win with many points and dying can happen
quickly if you are careless leading to a somewhat balanced game (in my opinion).
