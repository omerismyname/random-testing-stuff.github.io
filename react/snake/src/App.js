import './App.css';
import { useEffect, useRef } from 'react';

const gridWidth = 30;
const gridHeight = 20;
const gridSquareWidth = 25;
const gridGap = 1;
const fps = 10;
const snakeInitialLength = 3;
let snakeSegments = [];
let snakeDirection = 1;
let nextDirection = 1;
const directionToVector = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0]
];
let apples = [];
let running = false;

export default function App() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    setUpKeyboardControls(ctx);
    spawnApple();
    resetSnake(ctx);
  }, []);
  return (
    <div className="container">
      <canvas ref={canvasRef} width={gridWidth*25} height={gridHeight*25}></canvas>
    </div>
  );
}

function startGameLoop(ms, ctx) {
  const start = document.timeline ? document.timeline.currentTime : performance.now();
  
  function scheduleFrame(time) {
    const elapsed = time - start;
    const roundedElapsed = Math.round(elapsed / ms) * ms;
    const targetNext = start + roundedElapsed + ms;
    const delay = targetNext - time;
    setTimeout(() => requestAnimationFrame(() => {
      running = false;
      if (!snakeIteration(ctx)) {
        running = true;
        scheduleFrame(performance.now());
      }
    }), delay);
  }

  scheduleFrame(start);
}

function snakeIteration(ctx) {
  snakeDirection = validateDirection(nextDirection);
  nextDirection = snakeDirection;
  const currentDirection = directionToVector[snakeDirection];
  let snakeHeadPos = snakeSegments[snakeSegments.length-1];
  let appleEaten = false;
  
  // monch monch if inside apple
  for (let i = 0; i < apples.length; i++) {
    if (
      snakeHeadPos[0] === apples[i][0] &&
      snakeHeadPos[1] === apples[i][1]
    ) {
      appleEaten = true;
      apples.splice(i, 1);
      spawnApple();
    }
  }
  snakeHeadPos = moveSnake(currentDirection, appleEaten);

  // end game if snake has crashed into itself
  for (let i = 0; i < snakeSegments.length - 1; i++) {
    if (
      snakeHeadPos[0] === snakeSegments[i][0] &&
      snakeHeadPos[1] === snakeSegments[i][1]
    ) {
      console.log("game over");
      return true;
    }
  }

   // end game if snake is outside grid bounds
  if (
    snakeHeadPos[0] > gridWidth ||
    snakeHeadPos[0] < 0 ||
    snakeHeadPos[1] > gridHeight ||
    snakeHeadPos[1] < 0
  ) {
    console.log("game over");
    return true;
  };
  draw(ctx);
  return false;
}

function moveSnake(direction, extendSnake = false) {
  const snakeHeadPos = snakeSegments[snakeSegments.length-1];
  const newHeadPos = [
    snakeHeadPos[0] + direction[0],
    snakeHeadPos[1] + direction[1]
  ];
  if (!extendSnake) snakeSegments.shift();
  snakeSegments.push(newHeadPos);
  return newHeadPos;
}

function spawnApple() {
  let generatedNewApple = false;
  let newApple = [];
  while (!generatedNewApple) {
    generatedNewApple = true;
    newApple = [
      Math.floor(Math.random() * gridWidth),
      Math.floor(Math.random() * gridHeight)
    ];
    for (let i = 0; i < snakeSegments.length; i++) {
      if (
        newApple[0] === snakeSegments[i][0] &&
        newApple[1] === snakeSegments[i][1]
      ) {
        generatedNewApple = false;
      }
    }
  }
  apples.push(newApple);
}

function draw(ctx) {
  ctx.fillStyle = "#222222"; // background
  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      fillGridSquare(ctx, x, y, gridSquareWidth, gridGap);
    }
  }
  ctx.fillStyle = "#981815"; // apples
  for (let i = 0; i < apples.length; i++) {
    fillGridSquare(ctx, apples[i][0], apples[i][1], gridSquareWidth, gridGap);
  }
  // fill snake with gradient from head
  for (let i = 0; i < snakeSegments.length; i++) {
    const brightness = Math.floor(102 + (255-102) * i / (snakeSegments.length-1));
    ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;
    fillGridSquare(ctx, snakeSegments[i][0], snakeSegments[i][1], gridSquareWidth, gridGap);
  }
}

function fillGridSquare(ctx, gridX, gridY, gridSquareWidth, gap) {
  ctx.fillRect(
    gridX*gridSquareWidth+gap,
    gridY*gridSquareWidth+gap,
    gridSquareWidth-gap*2,
    gridSquareWidth-gap*2
  );
}

function setUpKeyboardControls(ctx) {
  document.onkeydown = e => {
    switch (e.code) {
      case "ArrowUp":
        nextDirection = 0;
        break;
      case "ArrowRight":
        nextDirection = 1;
        break;
      case "ArrowDown":
        nextDirection = 2;
        break;          
      case "ArrowLeft":
        nextDirection = 3;
        break;
      case "Space":
        resetSnake(ctx);
        break;
      case "Enter":
        resetSnake(ctx);
        break;
      default:
        break;
    }
  };
}

function validateDirection(direction) {
  return (snakeDirection % 2 === direction % 2) ? snakeDirection : direction;
}

function resetSnake(ctx) {
  if (!running) {
    const centreX = Math.floor(gridWidth / 2);
    const centreY = Math.floor(gridHeight / 2);
    snakeSegments = [];
    for (let i = 0; i < snakeInitialLength; i++) {
      snakeSegments.push([centreX+(i-Math.ceil(snakeInitialLength/2)), centreY]);
    }
    snakeDirection = 1;
    startGameLoop(1000/fps, ctx);
  }
}