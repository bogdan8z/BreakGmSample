// Select the canvas element
const canvas = document.getElementById("gameCanvas");
// Get the 2D drawing context
const ctx = canvas.getContext("2d");

let gameRunning = false; // Game starts in a paused state
let gamePaused = false; // Tracks if the game is paused
// Paddle movement variables
let rightPressed = false;
let leftPressed = false;
// Paddle variables
const paddleWidth = 100; // Width of the paddle
const paddleHeight = 10; // Height of the paddle
let paddleX = (canvas.width - paddleWidth) / 2; // Initial horizontal position of the paddle (centered)
let ballRadius = 8; // Radius of the ball
let ballX = canvas.width / 2; // Initial X-coordinate of the ball (centered horizontally)
let ballY = canvas.height - 30; // Initial Y-coordinate of the ball (above the paddle)
let ballDX = 2; // Horizontal speed of the ball
let ballDY = -2; // Vertical speed of the ball
let score = 0;


// Event listeners for keypress
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

document.getElementById("startGameBtn").addEventListener("click", function () {
    if (!gameRunning) {
        gameRunning = true; // Set gameRunning to true
        draw(); // Start the game loop
        this.disabled = true; // Disable the button once the game starts
    }
});

const canvasOverlay = document.getElementById("canvasOverlay");
document.getElementById("pauseGameBtn").addEventListener("click", function () {
    if (gameRunning) {
        gamePaused = !gamePaused; // Toggle pause state
        if (gamePaused) {
            this.textContent = "Resume Game"; // Update button text to "Resume Game"
            canvasOverlay.style.visibility = "visible"; // Show the overlay
        } else {
            this.textContent = "Pause Game"; // Update button text to "Pause Game"
            canvasOverlay.style.visibility = "hidden"; // Hide the overlay
            draw(); // Resume the game loop
        }
    }
});

function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = true;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = false;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = false;
    }
}

// Update paddle position
function updatePaddlePosition() {
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 7; // Adjust speed as needed
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 7; // Adjust speed as needed
    }
}

// Brick variables
const brickRowCount = 5;
const brickColumnCount = 7;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = (canvas.width - (brickColumnCount * (brickWidth + brickPadding) - brickPadding)) / 2;


let bricks = [];

// Initialize the bricks array
for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 }; // "status: 1" means the brick is visible
    }
}

// Draw the bricks on the canvas
function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) { // Only draw bricks that haven't been hit
                const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;

                ctx.fillStyle = "#f00";
                ctx.fillRect(brickX, brickY, brickWidth, brickHeight);
            }
        }
    }
}


function draw() {
    if (!gameRunning || gamePaused) return; // Stop drawing if the game isn't running

    // Clear the canvas to remove previous frame visuals
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Render the game elements
    drawBricks();       // Draw the bricks
    updatePaddlePosition(); // Update and render paddle movement
    drawPaddle();       // Draw the paddle
    drawBall();         // Draw the ball
    drawScore(); // Render the score    
    collisionDetection();  // Call collision detection for bricks


    // Update the ball's position
    moveBall();

  

    
    
    // Request the next animation frame to continue the loop
    requestAnimationFrame(draw);


    //  // Add blur effect and paused message when game is paused
    //  if (gamePaused) {
    //     ctx.fillStyle = "rgba(0, 0, 0, 0.5)"; // Semi-transparent overlay
    //     ctx.fillRect(0, 0, canvas.width, canvas.height); // Cover the entire canvas

    //     ctx.font = "48px Arial"; // Style for the pause text
    //     ctx.fillStyle = "#fff"; // White color for the text
    //     ctx.textAlign = "center";
    //     ctx.fillText(pausedMessage, canvas.width / 2, canvas.height / 2); // Display "Paused" in the center
    // }
}
function moveBall() {


    
    ballX += ballDX; // Move the ball horizontally
    ballY += ballDY; // Move the ball vertically


    // Ball collision with walls
    if (ballX + ballDX > canvas.width - ballRadius || ballX + ballDX < ballRadius) {
        ballDX = -ballDX; // Reverse horizontal direction
    }
    if (ballY + ballDY < ballRadius) {
        ballDY = -ballDY; // Bounce off the top wall
    } else if (ballY + ballDY > canvas.height - ballRadius) {
        // Check if the ball hits the paddle or misses it
        if (ballX > paddleX && ballX < paddleX + paddleWidth) {
            ballDY = -ballDY; // Bounce off the paddle
        } else {

            //alert("Game Over!"); // Show a game over message
            console.log("Game Over!");
            document.location.reload(); // Reload page to restart game
        }
    }
}

function collisionDetection() {
    let bricksRemaining = 0; // Track remaining bricks
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const brick = bricks[c][r];
            if (brick.status === 1) { // Check if the brick is still visible
                bricksRemaining++; // Increment remaining bricks
                if (
                    ballX > brick.x &&
                    ballX < brick.x + brickWidth &&
                    ballY > brick.y &&
                    ballY < brick.y + brickHeight
                ) {
                    ballDY = -ballDY; // Reverse the ball's vertical direction
                    brick.status = 0; // Mark the brick as "destroyed"
                    score++; // Increment score
                }
            }
        }
    }
    
    // Check if all bricks are destroyed
    if (bricksRemaining === 0) {
        alert("Congratulations! You win!"); // Display a win message
        document.location.reload(); // Restart the game
    }
}

function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText("Score: " + score, 8, 20);
}

// Draw the paddle on the canvas
function drawPaddle() {
    ctx.fillStyle = "#0f0"; // Paddle color
    ctx.fillRect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
}

function drawBall() {
    ctx.beginPath(); // Start drawing a new shape
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2); // Create a circle (x, y, radius)
    ctx.fillStyle = "#f00"; // Set the ball color (red in this case)
    ctx.fill(); // Fill the circle with the specified color
    ctx.closePath(); // End the shape
}








draw();


//todo:     game over
//          tine bila 3 secunde la start
//          next level: higher speed