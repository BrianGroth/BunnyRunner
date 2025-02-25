const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Resize the canvas to fill the window and reposition the bunny
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  // Reposition bunny near the bottom center (leave room for the control bar)
  bunny.x = canvas.width / 2 - bunny.width / 2;
  bunny.y = canvas.height - bunny.height - 100;
}
window.addEventListener("resize", resizeCanvas);

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

// Load images (ensure bunny.png and rock.png are in your folder)
const bunnyImg = new Image();
bunnyImg.src = "bunny.png";
const rockImg = new Image();
rockImg.src = "rock.png";

// Player input handling via arrow keys
const keys = {};
window.addEventListener("keydown", (e) => {
  keys[e.key] = true;
});
window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

// Control input variable for touch/mouse control (-1 to 1)
let controlInput = 0;
const controlContainer = document.getElementById("controlContainer");

function updateControlInput(clientX) {
  const rect = controlContainer.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  let diff = clientX - centerX;
  // Normalize difference to range [-1, 1]
  controlInput = Math.max(-1, Math.min(1, diff / (rect.width / 2)));
  // Update the control knob's position visually
  const controlKnob = document.getElementById("controlKnob");
  controlKnob.style.left = (rect.width / 2 + diff - controlKnob.offsetWidth / 2) + "px";
}

// Touch events for mobile devices
controlContainer.addEventListener("touchstart", function(e) {
  e.preventDefault();
  updateControlInput(e.touches[0].clientX);
});
controlContainer.addEventListener("touchmove", function(e) {
  e.preventDefault();
  updateControlInput(e.touches[0].clientX);
});
controlContainer.addEventListener("touchend", function(e) {
  e.preventDefault();
  controlInput = 0;
  document.getElementById("controlKnob").style.left = "50%";
});

// Mouse events for desktop (dragging the control)
controlContainer.addEventListener("mousedown", function(e) {
  e.preventDefault();
  updateControlInput(e.clientX);
  const onMouseMove = function(e) {
    updateControlInput(e.clientX);
  };
  const onMouseUp = function(e) {
    controlInput = 0;
    document.getElementById("controlKnob").style.left = "50%";
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  };
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
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

  // Use control input for horizontal movement if no arrow key is pressed
  if (!keys["ArrowLeft"] && !keys["ArrowRight"] && controlInput !== 0) {
    bunny.x += bunny.speed * controlInput;
  }

  // Move obstacles downward
  obstacles.forEach((obstacle) => {
    obstacle.y += obstacle.speed;
  });
  obstacles = obstacles.filter((obstacle) => obstacle.y < canvas.height + obstacle.height);

  // Spawn new obstacles periodically
  obstacleTimer += deltaTime;
  if (obstacleTimer > obstacleInterval) {
    spawnObstacle();
    obstacleTimer = 0;
  }

  // Increase score (or distance traveled)
  score += deltaTime * 0.01;

  // Collision detection: adjust bunny's position if it overlaps a rock
  obstacles.forEach((obstacle) => {
    if (
      bunny.x < obstacle.x + obstacle.width &&
      bunny.x + bunny.width > obstacle.x &&
      bunny.y < obstacle.y + obstacle.height &&
      bunny.y + bunny.height > obstacle.y
    ) {
      if (keys["ArrowLeft"]) bunny.x += bunny.speed;
      if (keys["ArrowRight"]) bunny.x -= bunny.speed;
    }
  });
}

// Draw everything on the canvas
function draw() {
  // Draw a gradient background representing forest (top) to field (bottom)
  let grd = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grd.addColorStop(0, "#228B22");
  grd.addColorStop(1, "#7CFC00");
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
    ctx.drawImage(bunnyImg, bunny.x, bunny.y + bounceOffset, bunny.width, bunny.height);
  } else {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(bunny.x, bunny.y + bounceOffset, bunny.width, bunny.height);
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

// Initialize canvas size and start the game loop
resizeCanvas();
requestAnimationFrame(gameLoop);
