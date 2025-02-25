const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let numLanes = 3;
let lanePositions = [];
let canvasWidth = window.innerWidth;
let canvasHeight = window.innerHeight;

function resizeCanvas() {
  canvasWidth = window.innerWidth;
  canvasHeight = window.innerHeight;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  lanePositions = [];
  for (let i = 0; i < numLanes; i++) {
    lanePositions.push(((i + 1) * canvasWidth) / (numLanes + 1));
  }
  bunny.targetX = lanePositions[bunny.currentLane] - bunny.width / 2;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

let bunny = {
  currentLane: 1,
  x: 0,
  y: 0,
  targetX: 0,
  width: 80,
  height: 80,
  laneSwitchSpeed: 0.2
};
bunny.y = canvasHeight * 0.8;
bunny.x = lanePositions[bunny.currentLane] - bunny.width / 2;
bunny.targetX = bunny.x;

let objects = [];
let objectTimer = 0;
let objectInterval = 1500;

const bunnyImg = new Image(); bunnyImg.src = "bunny.png";
const rockImg = new Image(); rockImg.src = "rock.png";
const friendImg = new Image(); friendImg.src = "friend.png";
const treeImg = new Image(); treeImg.src = "tree.png";
const carrotImg = new Image(); carrotImg.src = "carrot.png";

let imagesLoaded = 0;
const totalImages = 5;

[bunnyImg, rockImg, friendImg, treeImg, carrotImg].forEach(img => {
  img.onload = () => {
    imagesLoaded++;
    console.log(img.src + " loaded");
    if (imagesLoaded === totalImages) {
      console.log("All images loaded, starting game loop");
      requestAnimationFrame(gameLoop);
    }
  };
  img.onerror = () => console.error("Failed to load " + img.src);
});

document.getElementById("leftBtn").addEventListener("click", () => {
  if (bunny.currentLane > 0) {
    bunny.currentLane--;
    bunny.targetX = lanePositions[bunny.currentLane] - bunny.width / 2;
  }
});

document.getElementById("rightBtn").addEventListener("click", () => {
  if (bunny.currentLane < numLanes - 1) {
    bunny.currentLane++;
    bunny.targetX = lanePositions[bunny.currentLane] - bunny.width / 2;
  }
});

window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" && bunny.currentLane > 0) {
    bunny.currentLane--;
    bunny.targetX = lanePositions[bunny.currentLane] - bunny.width / 2;
  } else if (e.key === "ArrowRight" && bunny.currentLane < numLanes - 1) {
    bunny.currentLane++;
    bunny.targetX = lanePositions[bunny.currentLane] - bunny.width / 2;
  }
});

function update(dt) {
  bunny.x += (bunny.targetX - bunny.x) * bunny.laneSwitchSpeed;
}

function draw() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  let grd = ctx.createLinearGradient(0, 0, 0, canvasHeight);
  grd.addColorStop(0, "#87ceeb");
  grd.addColorStop(1, "#7cfc00");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  console.log("Drawing bunny at", bunny.x, bunny.y);
  ctx.drawImage(bunnyImg, bunny.x, bunny.y, bunny.width, bunny.height);
}

function gameLoop(timestamp) {
  console.log("Game loop running");
  update(16);
  draw();
  requestAnimationFrame(gameLoop);
}
if (imagesLoaded === totalImages) {
  requestAnimationFrame(gameLoop);
}
