const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ----- Global Settings & Variables ----- //
let numLanes = 3;
let lanePositions = [];
let canvasWidth = window.innerWidth;
let canvasHeight = window.innerHeight;

// Resize the canvas to fill the window and recalc lane positions
function resizeCanvas() {
  canvasWidth = window.innerWidth;
  canvasHeight = window.innerHeight;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  
  lanePositions = [];
  for (let i = 0; i < numLanes; i++) {
    // For 3 lanes, centers at 1/4, 1/2, 3/4 of the screen width
    lanePositions.push(((i + 1) * canvasWidth) / (numLanes + 1));
  }
  bunny.targetX = lanePositions[bunny.currentLane] - bunny.width / 2;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Game state variables
let lastTime = 0;
let deltaTime = 0;
let score = 0;
let ouchTimer = 0;

// ----- Bunny Object (Lane-Based) ----- //
let bunny = {
  currentLane: 1,  // lanes: 0 = left, 1 = center, 2 = right
  x: 0,
  y: 0,
  targetX: 0,
  width: 80,  // drawn at 80x80 (from a 100x100 image)
  height: 80,
  laneSwitchSpeed: 0.2,  // smoothing factor for lane switching
  bounceTime: 0
};
// Place the bunny near the bottom of the screen (about 80% down)
bunny.y = canvasHeight * 0.8;
bunny.x = lanePositions[bunny.currentLane] - bunny.width / 2;
bunny.targetX = bunny.x;

// ----- Falling Objects Array ----- //
let objects = [];
let objectTimer = 0;
let objectInterval = 1500; // spawn a new object every 1.5 seconds

// ----- Load Images ----- //
const bunnyImg   = new Image(); bunnyImg.src   = "bunny.png";
const rockImg    = new Image(); rockImg.src    = "rock.png";
const friendImg  = new Image(); friendImg.src  = "friend.png";
const treeImg    = new Image(); treeImg.src    = "tree.png";
const carrotImg  = new Image(); carrotImg.src  = "carrot.png";

// ----- Input Handling: Touch/Swipe ----- //
let touchStartX = null;
let touchEndX = null;
const swipeThreshold = 30; // minimum swipe distance in pixels

canvas.addEventListener("touchstart", function(e) {
  touchStartX = e.changedTouches[0].clientX;
}, false);

canvas.addEventListener("touchend", function(e) {
  touchEndX = e.changedTouches[0].clientX;
  handleSwipe();
}, false);

function handleSwipe() {
  if (touchStartX === null || touchEndX === null) return;
  let diffX = touchEndX - touchStartX;
  if (Math.abs(diffX) > swipeThreshold) {
    if (diffX > 0 && bunny.currentLane < numLanes - 1) {
      // Swipe right: move to the next lane on the right
      bunny.currentLane++;
    } else if (diffX < 0 && bunny.currentLane > 0) {
      // Swipe left: move to the next lane on the left
      bunny.currentLane--;
    }
    bunny.targetX = lanePositions[bunny.currentLane] - bunny.width / 2;
  }
  touchStartX = null;
  touchEndX = null;
}

// ----- Input Handling: Arrow Keys & Mouse (Desktop) ----- //
window.addEventListener("keydown", function(e) {
  if (e.key === "ArrowLeft" && bunny.currentLane > 0) {
    bunny.currentLane--;
    bunny.targetX = lanePositions[bunny.currentLane] - bunny.width / 2;
  } else if (e.key === "ArrowRight" && bunny.currentLane < numLanes - 1) {
    bunny.currentLane++;
    bunny.targetX = lanePositions[bunny.currentLane] - bunny.width / 2;
  }
});

let mouseDownX = null;
canvas.addEventListener("mousedown", function(e) {
  mouseDownX = e.clientX;
});
canvas.addEventListener("mouseup", function(e) {
  if (mouseDownX === null) return;
  let diff = e.clientX - mouseDownX;
  if (Math.abs(diff) > swipeThreshold) {
    if (diff > 0 && bunny.currentLane < numLanes - 1) {
      bunny.currentLane++;
    } else if (diff < 0 && bunny.currentLane > 0) {
      bunny.currentLane--;
    }
    bunny.targetX = lanePositions[bunny.currentLane] - bunny.width / 2;
  }
  mouseDownX = null;
});

// ----- Spawn Falling Objects ----- //
function spawnObject() {
  const types = ["rock", "tree", "friend", "carrot"];
  let type = types[Math.floor(Math.random() * types.length)];
  let lane = Math.floor(Math.random() * numLanes);
  let obj = {
    type: type,
    lane: lane,
    x: lanePositions[lane] - 40, // default centering for an 80px-wide object
    y: -100,  // start off-screen
    width: 80,
    height: 80,
    speed: 4 + Math.random() * 2
  };
  // Adjust sizes and centering based on type
  if (type === "tree") {
    obj.width = 120;
    obj.height = 120;
    obj.x = lanePositions[lane] - 60;
  } else if (type === "carrot") {
    obj.width = 60;
    obj.height = 60;
    obj.x = lanePositions[lane] - 30;
  }
  objects.push(obj);
}

// ----- Update Game State ----- //
function update(dt) {
  bunny.bounceTime += dt;
  // Smoothly move the bunny toward the target lane position
  bunny.x += (bunny.targetX - bunny.x) * bunny.laneSwitchSpeed;

  // Update falling objects
  objects.forEach(obj => {
    obj.y += obj.speed;
  });
  // Remove objects that have fallen off-screen
  objects = objects.filter(obj => obj.y < canvasHeight + obj.height);

  // Spawn new objects periodically
  objectTimer += dt;
  if (objectTimer > objectInterval) {
    spawnObject();
    objectTimer = 0;
  }

  // Collision detection: if an object in the same lane overlaps vertically with the bunny
  let newObjects = [];
  objects.forEach(obj => {
    if (obj.lane === bunny.currentLane &&
        obj.y + obj.height >= bunny.y &&
        obj.y <= bunny.y + bunny.height) {
      // Collision occurred – adjust score based on object type
      if (obj.type === "friend" || obj.type === "carrot") {
        score += 1;
      } else if (obj.type === "rock" || obj.type === "tree") {
        score -= 1;
        ouchTimer = 1000; // show "OUCH!" for 1 second
      }
    } else {
      newObjects.push(obj);
    }
  });
  objects = newObjects;

  if (ouchTimer > 0) {
    ouchTimer -= dt;
    if (ouchTimer < 0) ouchTimer = 0;
  }

  // Increase score gradually (for distance traveled)
  score += dt * 0.005;
}

// ----- Draw Everything ----- //
function draw() {
  // Draw a gradient background: sky at the top, grass at the bottom
  let grd = ctx.createLinearGradient(0, 0, 0, canvasHeight);
  grd.addColorStop(0, "#87ceeb");    // sky blue
  grd.addColorStop(0.7, "#87ceeb");
  grd.addColorStop(1, "#7cfc00");      // lawn green
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // (Optional) Draw lane dividers for clarity (uncomment if desired)
  // ctx.strokeStyle = "rgba(255,255,255,0.3)";
  // lanePositions.forEach(pos => {
  //   ctx.beginPath();
  //   ctx.moveTo(pos, 0);
  //   ctx.lineTo(pos, canvasHeight);
  //   ctx.stroke();
  // });

  // Draw falling objects
  objects.forEach(obj => {
    switch (obj.type) {
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
    }
  });

  // Draw the bunny with a bounce effect
  const bounce = Math.sin(bunny.bounceTime / 200) * 5;
  if (bunnyImg.complete) {
    ctx.drawImage(bunnyImg, bunny.x, bunny.y + bounce, bunny.width, bunny.height);
  } else {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(bunny.x, bunny.y + bounce, bunny.width, bunny.height);
  }

  // Draw the score
  ctx.fillStyle = "#000";
  ctx.font = "24px Arial";
  ctx.fillText("Score: " + Math.floor(score), 10, 30);

  // Draw "OUCH!" next to the bunny if a negative collision occurred
  if (ouchTimer > 0) {
    ctx.fillStyle = "#ff0000";
    ctx.font = "20px Arial";
    ctx.fillText("OUCH!", bunny.x + bunny.width + 10, bunny.y + 20);
  }
}

// ----- Main Game Loop ----- //
function gameLoop(timestamp) {
  if (!lastTime) lastTime = timestamp;
  deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  update(deltaTime);
  draw();

  requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);
