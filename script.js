const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Resize the canvas to always fill the window
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  // Reposition bunny near bottom center (above control area)
  bunny.x = canvas.width / 2 - bunny.width / 2;
  bunny.y = canvas.height - bunny.height - 120; // leave space for controlContainer
}
window.addEventListener("resize", resizeCanvas);

// Timing variables for game loop
let lastTime = 0;
let deltaTime = 0;

// Score variable
let score = 0;

// "Ouch" timer for displaying the message when hitting a negative object
let ouchTimer = 0;

// Bunny object
let bunny = {
  x: canvas.width / 2 - 25,
  y: canvas.height - 120,
  width: 50,
  height: 50,
  speed: 5,
  bounceTime: 0,
};

// Array to hold falling objects (obstacles and pickups)
let objects = [];
let objectTimer = 0;
let objectInterval = 1500; // spawn a new object every 1.5 seconds

// Load images (ensure these PNG files are in your project)
const bunnyImg = new Image();
bunnyImg.src = "bunny.png";
const rockImg = new Image();
rockImg.src = "rock.png";
const friendImg = new Image();
friendImg.src = "friend.png";
const treeImg = new Image();
treeImg.src = "tree.png";
const carrotImg = new Image();
carrotImg.src = "carrot.png";

// Player input via arrow keys
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
  // Normalize to range [-1, 1]
  controlInput = Math.max(-1, Math.min(1, diff / (rect.width / 2)));
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

// Mouse events for desktop dragging
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

// Spawn a falling object with a random type
function spawnObject() {
  const types = ["rock", "tree", "friend", "carrot"];
  const type = types[Math.floor(Math.random() * types.length)];
  const obj = {
    type: type,
    x: Math.random() * (canvas.width - 50),
    y: -50,
    width: 50,
    height: 50,
    speed: 3 + Math.random() * 2,
  };
  objects.push(obj);
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
  
  // Use control input for horizontal movement if arrow keys are not active
  if (!keys["ArrowLeft"] && !keys["ArrowRight"] && controlInput !== 0) {
    bunny.x += bunny.speed * controlInput;
  }

  // Move falling objects downward
  objects.forEach((obj) => {
    obj.y += obj.speed;
  });
  objects = objects.filter((obj) => obj.y < canvas.height + obj.height);

  // Spawn new objects periodically
  objectTimer += deltaTime;
  if (objectTimer > objectInterval) {
    spawnObject();
    objectTimer = 0;
  }

  // Collision detection between bunny and objects
  let remainingObjects = [];
  for (let i = 0; i < objects.length; i++) {
    let obj = objects[i];
    let collided = bunny.x < obj.x + obj.width &&
                   bunny.x + bunny.width > obj.x &&
                   bunny.y < obj.y + obj.height &&
                   bunny.y + bunny.height > obj.y;
    if (collided) {
      if (obj.type === "friend" || obj.type === "carrot") {
        score += 1;
      } else if (obj.type === "rock" || obj.type === "tree") {
        score -= 1;
        ouchTimer = 1000; // display "ouch" for 1 second
      }
      // Remove object on collision
    } else {
      remainingObjects.push(obj);
    }
  }
  objects = remainingObjects;

  // Decrease ouch timer
  if (ouchTimer > 0) {
    ouchTimer -= deltaTime;
    if (ouchTimer < 0) ouchTimer = 0;
  }
  
  // Increase score gradually over time (distance traveled)
  score += deltaTime * 0.005;
}

// Draw a falling object based on its type
function drawObject(obj) {
  switch(obj.type) {
    case "rock":
      if (rockImg.complete) {
        ctx.drawImage(rockImg, obj.x, obj.y, obj.width, obj.height);
      } else {
        ctx.fillStyle = "#808080";
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
      }
      break;
    case "tree":
      if (treeImg.complete) {
        ctx.drawImage(treeImg, obj.x, obj.y, obj.width, obj.height);
      } else {
        ctx.fillStyle = "#228B22";
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
      }
      break;
    case "friend":
      if (friendImg.complete) {
        ctx.drawImage(friendImg, obj.x, obj.y, obj.width, obj.height);
      } else {
        ctx.fillStyle = "#0000ff";
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
      }
      break;
    case "carrot":
      if (carrotImg.complete) {
        ctx.drawImage(carrotImg, obj.x, obj.y, obj.width, obj.height);
      } else {
        ctx.fillStyle = "#FFA500";
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
      }
      break;
    default:
      ctx.fillStyle = "#fff";
      ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
  }
}

// Draw the game elements
function draw() {
  // Draw a gradient background (forest to field)
  let grd = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grd.addColorStop(0, "#228B22");
  grd.addColorStop(1, "#7CFC00");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw falling objects
  objects.forEach((obj) => {
    drawObject(obj);
  });

  // Draw the bunny with bounce offset
  const bounceOffset = Math.sin(bunny.bounceTime / 200) * 5;
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

  // Draw "ouch" text if a negative collision occurred
  if (ouchTimer > 0) {
    ctx.fillStyle = "#ff0000";
    ctx.font = "20px Arial";
    ctx.fillText("ouch", bunny.x + bunny.width + 5, bunny.y);
  }
}

// Main game loop
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
