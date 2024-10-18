import './style.css'

// init buttons
const resetButton = document.querySelector(".buttons > .reset");
resetButton.onclick = () => resetGame();
const solveButton = document.querySelector(".buttons > .solve");
solveButton.onclick = () => autoSolve();
const gameOverText = document.querySelector(".gameover");
const flagCounter = document.querySelector(".flagcounter > .counter");

// init canvas
const canvas = document.querySelector(".main > .game > canvas");
const ctx = canvas.getContext("2d", {alpha: false});
const pixelRatio = window.devicePixelRatio || 1;
ctx.scale(pixelRatio, pixelRatio);
ctx.imageSmoothingEnabled = false;
ctx.textRendering = "optimizeLegibility";

// tell the browser what size the canvas is? idk it just helps scaling things I think
const [width, height] = [canvas.clientWidth, canvas.clientHeight];
[canvas.width, canvas.height] = [width*pixelRatio, height*pixelRatio];
canvas.style.width = width + 'px';
canvas.style.height = height + 'px';

// globals for game
const canvasSize = Math.min(canvas.clientWidth, canvas.clientHeight) * pixelRatio;
const gridSize = 20;
const cellSize = Math.floor(canvasSize / gridSize);
const minesGrid = Array(gridSize*gridSize).fill(0);
const clearedGrid = Array(gridSize*gridSize).fill(false);
const flaggedGrid = Array(gridSize*gridSize).fill(false);
const gridPixelSize = gridSize*cellSize;
const outerMargin = ((canvasSize - gridPixelSize) / 2)/pixelRatio; // margin width around game region of canvas
let gameOver = false;
const numMines = 64;
let firstClick = true;

// init font to match cell size
ctx.font = `${cellSize}px sans-serif`
ctx.textBaseline = "top";
ctx.textAlign = "center";
const fontColoursDict = {
  0: "transparent",
  1: "navy",
  2: "green",
  3: "maroon",
  4: "purple",
  5: "gold",
  6: "cyan",
  7: "olive",
  8: "grey"
}

// render grid
function renderGrid() {
  // set background colour
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, canvasSize, canvasSize);

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const [adjX, adjY] = coordsToPixels(x, y);
      
      // add background checkerboard
      ctx.fillStyle = ((y+x) % 2 === 0) ? "bisque" : "burlywood";
      ctx.fillRect(adjX, adjY, cellSize, cellSize);
      
      // adding text
      if (minesGrid[y*gridSize+x] !== -1) {
        ctx.fillStyle = fontColoursDict[minesGrid[y*gridSize+x]];
        const [textOffX, textOffY] = getCentredTextOffsets(minesGrid[y*gridSize+x]);
        ctx.fillText(minesGrid[y*gridSize+x], adjX+(cellSize/2), adjY+(cellSize/2)+textOffY);
      } else {
        ctx.fillStyle = "maroon";
        ctx.fillRect(adjX, adjY, cellSize, cellSize);
      }

      // cover if not clear with foreground checkerboard
      if (!clearedGrid[y*gridSize+x]) {
        ctx.fillStyle = ((y+x) % 2 === 0) ? "limegreen" : "green";
        ctx.fillRect(adjX, adjY, cellSize, cellSize);
      }

      // add flags
      if (flaggedGrid[y*gridSize+x]) {
        ctx.fillStyle = "red";
        ctx.font = `${cellSize*0.8}px sans-serif`
        const [textOffX, textOffY] = getCentredTextOffsets(minesGrid[y*gridSize+x]);
        ctx.fillText("🚩", adjX+(cellSize/2), adjY+(cellSize/2)+textOffY);
        ctx.font = `${cellSize}px sans-serif`
      }

      flagCounter.innerHTML = numMines - flaggedGrid.reduce((sum, x) => sum + x);
    }
  }
}

function coordsToPixels(x, y) {
  return [outerMargin+x*cellSize, outerMargin+y*cellSize]
}

function gridIndexToCoords(index) {
  const x = index % gridSize;
  const y = (index-x) / gridSize;
  return [x, y];
}

function getCentredTextOffsets(text) {
  const textMetrics = ctx.measureText(text);
  const height = textMetrics.actualBoundingBoxAscent-textMetrics.actualBoundingBoxDescent;
  return [
    textMetrics.width / 2,
    height / 2
  ];
}

function initMinesGrid() {
  for (let i = 0; i < numMines; i++ ) {
    let randCell = Math.floor(Math.random()*gridSize*gridSize);
    if (minesGrid[randCell] === -1) {
      i--;
    } else {
      minesGrid[randCell] = -1;
    }
  }
  
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      if (minesGrid[y*gridSize+x] !== -1) {
        minesGrid[y*gridSize+x] = getSurroundingCellCoords(x, y).reduce((partialSum, coords) => {
          return partialSum + (minesGrid[coords[1]*gridSize+coords[0]] === -1);
        }, 0);
      }
    }
  }
}

// get array of surrounding 8 cells' coords, omitting those outside the bounds of the grid
function getSurroundingCellCoords(x, y) {
  let surroundingCells = Array(9);
  let i = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      surroundingCells[i] = [x+dx, y+dy];
      i++;
    }
  }
  surroundingCells[4] = [-1, -1]; // make sure centre cell (itself) is removed from surroundings arr
  return surroundingCells.filter(coords => {
    return (coords[0] >= 0) && (coords[1] >= 0) && (coords[0] <= gridSize-1) && (coords[1] <= gridSize-1);
  })
}

function clickEventToGridCoords(clickX, clickY) {
  const pointerGridX = Math.floor(((clickX - (canvas.clientLeft+outerMargin)) / (canvas.clientWidth - outerMargin*2)) * gridSize);
  const pointerGridY = Math.floor(((clickY - (canvas.clientTop+outerMargin)) /  (canvas.clientHeight - outerMargin*2)) * gridSize);
  if (pointerGridX < 0 || pointerGridY < 0 || pointerGridX > gridSize-1 || pointerGridY > gridSize-1) console.log("POINTER ERROR OUT OF BOUNDS, pos: ", pointerGridX, pointerGridY);
  return [pointerGridX, pointerGridY];
}

canvas.onclick = e => {
  e.preventDefault();
  // transform pointer coords into cell coords

  const [pointerGridX, pointerGridY] = clickEventToGridCoords(e.offsetX, e.offsetY);
  clearCellsOnClick(pointerGridX, pointerGridY);
  renderGrid();
}

canvas.oncontextmenu = e => {
  e.preventDefault();
  
  const [pointerGridX, pointerGridY] = clickEventToGridCoords(e.offsetX, e.offsetY);
  toggleFlag(pointerGridX, pointerGridY);
  renderGrid();
}

function clearCellsOnClick(x, y) {
  if (gameOver) return;

  // checking the cell isn't flagged
  if (flaggedGrid[y*gridSize+x] === true) return;

  if (firstClick) {
    for (let i = 0; i < 1000; i++) {
      if (minesGrid[y*gridSize+x] === 0) break;
      console.log(`regen attempt #${i}.`);
      resetGame();
      if (i === 0) console.log("(just making sure you don't lose on the first turn)");
    }
    firstClick = false;
  }

  if (minesGrid[y*gridSize+x] === -1) {
    endGame();
    return;
  }
  
  // check for empty adjacent cells and recursively clear them and their neighbours
    let neighbours = new Set().add(y*gridSize+x);
    let justCleared = new Set();
    for (let neighbour of neighbours) {
      if (minesGrid[neighbour] === 0) {
        for (let nextNeighbour of getSurroundingCellCoords(...gridIndexToCoords(neighbour)).map(e => e[1]*gridSize+e[0])) {
          if ((!justCleared.has(nextNeighbour)) && (minesGrid[nextNeighbour] !== -1)) neighbours.add(nextNeighbour);
        }
      }
      justCleared.add(neighbour);
    }
    for (let neighbour of neighbours) {
      clearedGrid[neighbour] = true;
    }

  checkForWin();
}

function toggleFlag(x, y) {
  if (gameOver) return;
  // checking the cell isn't cleared
  if (clearedGrid[y*gridSize+x] === true) return;
  flaggedGrid[y*gridSize+x] = !flaggedGrid[y*gridSize+x];
  checkForWin();
}

function checkForWin() {
  let allClearedWin = true;
  let allFlaggedWin = true;
  for (let i = 0; i < minesGrid.length; i++) {
    if ((minesGrid[i] !== -1) && (clearedGrid[i] !== true)) allClearedWin = false;
  }
  for (let i = 0; i < minesGrid.length; i++) {
    if ((minesGrid[i] === -1) && (flaggedGrid[i] !== true)) allFlaggedWin = false;
  }
  allFlaggedWin = (allFlaggedWin && ((numMines - flaggedGrid.reduce((sum, x) => sum + x)) >= 0));
  const won = allClearedWin || allFlaggedWin;
  if (!won) return;
  endGame(true);
}

function endGame(won = false) {
  if (won) {
    gameOverText.innerHTML = "You Win!";
  }
  canvas.style.filter = "blur(5px)";
  gameOverText.style.display = "block";
  gameOver = true;
}

function resetGame() {
  minesGrid.fill(0);
  clearedGrid.fill(false);
  flaggedGrid.fill(false);
  initMinesGrid();
  canvas.style = "";
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  gameOverText.style = "";
  gameOverText.innerHTML = "Game Over";
  renderGrid();
  gameOver = false;
  firstClick = true;
}

function autoSolve() {
  if (firstClick) {
    clearCellsOnClick(Math.floor((gridSize-1)/2), Math.floor((gridSize-1)/2));
    renderGrid();
  }
  for (let i = 0; i < 100; i++) {
    setTimeout(() => solverIteration(), 0);
    if (gameOver) break;
  }
}

function solverIteration() {
  //set up flags
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      if ((clearedGrid[y*gridSize+x] === true) && (minesGrid[y*gridSize+x] > 0)) {
        let n = minesGrid[y*gridSize+x];
        let neighbours = getSurroundingCellCoords(x,y);
        let unclearedNeighbours = neighbours.filter(coords => (!clearedGrid[coords[1]*gridSize+coords[0]]));
        if (n === unclearedNeighbours.length) {
          for (let neighbour of unclearedNeighbours.filter(coords => (!flaggedGrid[coords[1]*gridSize+coords[0]]))) {
            toggleFlag(neighbour[0], neighbour[1]);
          }
        }
      }
    }
  }
  renderGrid();
  // clear all possible unflagged cells
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      if ((clearedGrid[y*gridSize+x] === true) && (minesGrid[y*gridSize+x] > 0)) {
        let n = minesGrid[y*gridSize+x];
        let neighbours = getSurroundingCellCoords(x,y);
        let unclearedNeighbours = neighbours.filter(coords => (!clearedGrid[coords[1]*gridSize+coords[0]]));
        let flaggedNeighbours = neighbours.filter(coords => (flaggedGrid[coords[1]*gridSize+coords[0]]));
        if (n === flaggedNeighbours.length) {
          for (let neighbour of unclearedNeighbours.filter(coords => (!flaggedGrid[coords[1]*gridSize+coords[0]]))) {
            clearCellsOnClick(neighbour[0], neighbour[1]);
          }
        }
      }
    }
  }
  renderGrid();
}

initMinesGrid(); // intermediate
renderGrid();
