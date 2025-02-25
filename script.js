const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Set canvas dimensions
canvas.width = 800;
canvas.height = 600;

// Timing variables for game loop
let lastTime = 0;
let deltaTime = 0;

// Score (or distance traveled)
let score = 0;

// Bunny object
let bunny = {
  x: canvas.width / 2 - 25,
  y: canvas.height - 100,
  width: 50,
  height: 50,
  speed: 5,
  bounceTime: 0,
};

// Array to hold obstacles (rocks)
let obstacles = [];
let obstacleTimer = 0;
let obstacleInterval = 1500; // spawn every 1.5 seconds

// Load images (place your own bunny.png and rock.png in the assets/ folder)
const bunnyImg = new Image();
bunnyImg.src = "assets/bunny.png";
const rockImg = new Image();
rockImg.src = "assets/rock.png";

// Player input handling
const keys = {};
window.addEventListener("keydown", (e) => {
  keys[e.key] = true;
});
window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

// Function to spawn a rock obstacle at a random horizontal position
function spawnObstacle() {
  const rock = {
    x: Math.random() * (canvas.width - 50),
    y: -50,
    width: 50,
    height: 50,
    speed: 3 + Math.random() * 2,
  };
  obstacles.push(rock);
}

// Update game objects
function update(deltaTime) {
  // Update bunny’s bounce (using a sine wave for a simple bounce effect)
  bunny.bounceTime += deltaTime;
  const bounceOffset = Math.sin(bunny.bounceTime / 200) * 5;

  // Process arrow key inputs for moving the bunny
  if (keys["ArrowLeft"] && bunny.x > 0) {
    bunny.x -= bunny.speed;
  }
  if (keys["ArrowRight"] && bunny.x + bunny.width < canvas.width) {
    bunny.x += bunny.speed;
  }
  if (keys["ArrowUp"] && bunny.y > 0) {
    bunny.y -= bunny.speed;
  }
  if (keys["ArrowDown"] && bunny.y + bunny.height < canvas.height) {
    bunny.y += bunny.speed;
  }

  // Move obstacles downward to simulate forward motion
  obstacles.forEach((obstacle) => {
    obstacle.y += obstacle.speed;
  });

  // Remove obstacles that have moved off screen
  obstacles = obstacles.filter((obstacle) => obstacle.y < canvas.height + obstacle.height);

  // Spawn new obstacles periodically
  obstacleTimer += deltaTime;
  if (obstacleTimer > obstacleInterval) {
    spawnObstacle();
    obstacleTimer = 0;
  }

  // Increase score (or distance traveled)
  score += deltaTime * 0.01;

  // Collision detection: if bunny overlaps a rock, adjust its position to simulate getting stuck
  obstacles.forEach((obstacle) => {
    if (
      bunny.x < obstacle.x + obstacle.width &&
      bunny.x + bunny.width > obstacle.x &&
      bunny.y < obstacle.y + obstacle.height &&
      bunny.y + bunny.height > obstacle.y
    ) {
      // Simple collision response:
      // If moving left/right, push bunny away from the rock.
      if (keys["ArrowLeft"]) bunny.x += bunny.speed;
      if (keys["ArrowRight"]) bunny.x -= bunny.speed;
    }
  });
}

// Draw everything on the canvas
function draw() {
  // Draw a gradient background representing forest (top) to field (bottom)
  let grd = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grd.addColorStop(0, "#228B22"); // forest green
  grd.addColorStop(1, "#7CFC00"); // lawn green
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw obstacles (rocks)
  obstacles.forEach((obstacle) => {
    if (rockImg.complete) {
      ctx.drawImage(rockImg, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    } else {
      ctx.fillStyle = "#808080";
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    }
  });

  // Draw the bunny with the bounce offset
  if (bunnyImg.complete) {
    ctx.drawImage(bunnyImg, bunny.x, bunny.y + Math.sin(bunny.bounceTime / 200) * 5, bunny.width, bunny.height);
  } else {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(bunny.x, bunny.y + Math.sin(bunny.bounceTime / 200) * 5, bunny.width, bunny.height);
  }

  // Draw the score
  ctx.fillStyle = "#000";
  ctx.font = "24px Arial";
  ctx.fillText("Score: " + Math.floor(score), 10, 30);
}

// Main game loop using requestAnimationFrame
function gameLoop(timestamp) {
  deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  update(deltaTime);
  draw();

  requestAnimationFrame(gameLoop);
}

// Start the game loop
requestAnimationFrame(gameLoop);
