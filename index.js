const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const gridWidth = 40;
const gridHeight = 30;
const FOOD_COUNT = 12;

let snakeBody = [{ x: 3, y: 3 }];
let currentDirection = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let foodList = [];

const endButton = document.getElementById("button");
let isHovering = false;

document.addEventListener("keydown", handleKeydown);

endButton.addEventListener("click", () => {
  location.reload(); // Restart the game
});

endButton.addEventListener("mouseover", () => {
  isHovering = true;
  endButton.textContent = "Start again!";
});

endButton.addEventListener("mouseout", () => {
  isHovering = false;
  endButton.textContent = endButton.dataset.message;
});

function showEndButton(message) {
  endButton.style.visibility = "visible";
  endButton.dataset.message = message;
  if (!isHovering) {
    endButton.textContent = message;
  }
}

drawWalls();
generateInitialFood();

setInterval(gameLoop, 500);

function drawWalls() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, gridWidth, 1);
  ctx.fillRect(0, 0, 1, gridHeight);
  ctx.fillRect(gridWidth - 1, 0, 1, gridHeight);
  ctx.fillRect(0, gridHeight - 1, gridWidth, 1);
}

function handleKeydown(e) {
  const dirMap = {
    arrowup: { x: 0, y: -1 },
    w: { x: 0, y: -1 },
    arrowdown: { x: 0, y: 1 },
    s: { x: 0, y: 1 },
    arrowleft: { x: -1, y: 0 },
    a: { x: -1, y: 0 },
    arrowright: { x: 1, y: 0 },
    d: { x: 1, y: 0 },
  };
  const newDir = dirMap[e.key.toLowerCase()];
  if (
    newDir &&
    !(newDir.x === -currentDirection.x && newDir.y === -currentDirection.y)
  ) {
    nextDirection = newDir;
  }
}

function generateInitialFood() {
  while (foodList.length < FOOD_COUNT) {
    const newFood = getValidRandomPos();
    foodList.push(newFood);
  }
}

function getValidRandomPos() {
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * (gridWidth - 2)) + 1,
      y: Math.floor(Math.random() * (gridHeight - 2)) + 1,
    };
  } while (
    snakeBody.some((part) => part.x === pos.x && part.y === pos.y) ||
    foodList.some((food) => food.x === pos.x && food.y === pos.y)
  );
  return pos;
}

function gameLoop() {
  currentDirection = nextDirection;
  const head = {
    x: snakeBody[0].x + currentDirection.x,
    y: snakeBody[0].y + currentDirection.y,
  };

  // Collisions with wall or self
  if (
    head.x <= 0 ||
    head.x >= gridWidth - 1 ||
    head.y <= 0 ||
    head.y >= gridHeight - 1 ||
    snakeBody.some((part) => part.x === head.x && part.y === head.y)
  ) {
    showEndButton("GG! You died!");
    return;
  }

  // Move snake
  snakeBody.unshift(head);

  // Eat food or move normally
  const foodIndex = foodList.findIndex((f) => f.x === head.x && f.y === head.y);
  if (foodIndex !== -1) {
    foodList.splice(foodIndex, 1);
    foodList.push(getValidRandomPos());
  } else {
    snakeBody.pop();
  }

  // Clear and redraw
  ctx.clearRect(1, 1, gridWidth - 2, gridHeight - 2);

  ctx.fillStyle = "pink";
  snakeBody.forEach((part) => ctx.fillRect(part.x, part.y, 1, 1));

  ctx.fillStyle = "aqua";
  foodList.forEach((f) => ctx.fillRect(f.x, f.y, 1, 1));

  // Check win condition
  const playableArea = (gridWidth - 2) * (gridHeight - 2);
  if (snakeBody.length >= playableArea) {
    showEndButton("Nice! You won!");
  }
}

// === Touch Gesture Controls for Mobile ===
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener("touchstart", (e) => {
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
});

document.addEventListener(
  "touchmove",
  (e) => {
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;

    // Only respond to significant movements
    if (Math.abs(dx) > Math.abs(dy)) {
      // horizontal swipe
      if (dx > 20 && currentDirection.x !== -1) {
        nextDirection = { x: 1, y: 0 }; // right
      } else if (dx < -20 && currentDirection.x !== 1) {
        nextDirection = { x: -1, y: 0 }; // left
      }
    } else {
      // vertical swipe
      if (dy > 20 && currentDirection.y !== -1) {
        nextDirection = { x: 0, y: 1 }; // down
      } else if (dy < -20 && currentDirection.y !== 1) {
        nextDirection = { x: 0, y: -1 }; // up
      }
    }

    // Prevent default scrolling behavior while swiping
    e.preventDefault();
  },
  { passive: false }
);
