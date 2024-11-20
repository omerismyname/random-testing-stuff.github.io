// init buttons
const palette = document.querySelector(".ui");
palette.onclick = e => {
  e.preventDefault();
  const val = e.target.getAttribute("val");
  if (val && val > 0) {
    brushType = val;
  }
};

// init canvas
const canvas = document.querySelector(".main > .game > canvas");
const ctx = canvas.getContext("2d", {alpha: false});
const pixelRatio = window.devicePixelRatio || 1;
ctx.scale(pixelRatio, pixelRatio);
ctx.imageSmoothingEnabled = false;
ctx.textRendering = "optimizeLegibility";
window.debug = false;
window.verbose = false;


const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);

// tell the browser what size the canvas is? idk it just helps scaling things I think
const canvasSizePx = Math.min(window.screen.width, window.innerWidth, window.innerHeight-4*rem-5*rem);
[canvas.width, canvas.height] = [canvasSizePx*pixelRatio, canvasSizePx*pixelRatio];
canvas.style.width = canvasSizePx + 'px';
canvas.style.height = canvasSizePx + 'px';

// globals for game
const canvasSize = Math.min(canvas.clientWidth, canvas.clientHeight) * pixelRatio;
const gridSize = 20;
const cellSize = Math.floor(canvasSize / gridSize);
let grid = Array(gridSize*gridSize).fill(0);
const gridPixelSize = gridSize*cellSize;
const outerMargin = ((canvasSize - gridPixelSize) / 2)/pixelRatio; // margin width around game region of canvas
let gameOver = false;
const numMines = 64;
let firstClick = true;
let guessingMode = false;
let gameWins = 0;
let gameLosses = 0;
let highlightedCellIndex = -1;
let brushType = 1;

// init font to match cell size
ctx.font = `${cellSize}px sans-serif`;
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
      const idx = y*gridSize+x;
      
      // add background checkerboard
      ctx.fillStyle = ((y+x) % 2 === 0) ? "bisque" : "burlywood";
      if (grid[idx] > 0) {
        ctx.fillStyle = fontColoursDict[grid[idx]];
      }
      ctx.fillRect(adjX, adjY, cellSize, cellSize);
      
      
      // highlight cell if hovered over
      if (highlightedCellIndex === idx) {
        ctx.fillStyle = "grey";
      }

      ctx.fillRect(adjX, adjY, cellSize, cellSize);

      // add debug text
      ctx.fillStyle = "black";
      ctx.textAlign = "left";
      ctx.font = `${cellSize*0.4}px sans-serif`;
      // ctx.fillText(Math.round(guessingGrid[y*gridSize+x]*10)/10,adjX+2, adjY+2);
      const gridText = grid[idx];
      if (gridText > 0) ctx.fillText(grid[idx],adjX+2, adjY+2);
      ctx.font = `${cellSize}px sans-serif`;
      ctx.textAlign = "center";
    }
  }
}

function coordsToPixels(x, y) {
  return [outerMargin+x*cellSize, outerMargin+y*cellSize];
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

function isPointerInDrawArea(pointerX, pointerY) {
  const pointerScaledX = (pointerX - (canvas.clientLeft+outerMargin/pixelRatio)) / (canvas.clientWidth - outerMargin*2);
  const pointerScaledY = (pointerY - (canvas.clientTop+outerMargin/pixelRatio)) /  (canvas.clientHeight - outerMargin*2)
  return (
    ((0 < pointerScaledX) && (pointerScaledX < 1) && (0 < pointerScaledY) && (pointerScaledY < 1))
  );
}

function pointerEventToGridCoords(pointerX, pointerY) {
  const pointerGridX = Math.floor(((pointerX - (canvas.clientLeft+outerMargin/pixelRatio)) / (canvas.clientWidth - outerMargin*2)) * gridSize);
  const pointerGridY = Math.floor(((pointerY - (canvas.clientTop+outerMargin/pixelRatio)) /  (canvas.clientHeight - outerMargin*2)) * gridSize);
  if (pointerGridX < 0 || pointerGridY < 0 || pointerGridX > gridSize-1 || pointerGridY > gridSize-1) console.log("POINTER ERROR OUT OF BOUNDS, pos: ", pointerGridX, pointerGridY);
  return [pointerGridX, pointerGridY];
}

function clickHandler(x, y, buttons) {
  if (buttons === 1) grid[y*gridSize+x] = brushType;
  if (buttons === 2) grid[y*gridSize+x] = 0;
}

canvas.onclick = e => {
  e.preventDefault();
  // check the pointer coords are in the 
  if (!isPointerInDrawArea(e.offsetX, e.offsetY)) return;

  // transform pointer coords into cell coords
  const [pointerGridX, pointerGridY] = pointerEventToGridCoords(e.offsetX, e.offsetY);
  
  clickHandler(pointerGridX, pointerGridY, 1);
  requestAnimationFrame(renderGrid);
}

canvas.oncontextmenu = e => {
  e.preventDefault();

  // check the pointer coords are in the 
  if (!isPointerInDrawArea(e.offsetX, e.offsetY)) return;
  
  const [pointerGridX, pointerGridY] = pointerEventToGridCoords(e.offsetX, e.offsetY);
  clickHandler(pointerGridX, pointerGridY, 2);
  requestAnimationFrame(renderGrid);
}

canvas.onpointermove = e => {
  if (e.pointerType !== "mouse") return;
  if (gameOver) return (highlightedCellIndex = 0);
  if (isPointerInDrawArea(e.offsetX, e.offsetY)) {
    const [pointerGridX, pointerGridY] = pointerEventToGridCoords(e.offsetX, e.offsetY);
    clickHandler(pointerGridX, pointerGridY, e.buttons);
    // console.log(pointerEventToGridCoords(e.offsetX, e.offsetY))
    highlightedCellIndex = pointerGridY * gridSize + pointerGridX;
    requestAnimationFrame(renderGrid);
  } else {
    canvasLeaveHandler();
  }
};

canvas.onpointerleave = canvasLeaveHandler;

function canvasLeaveHandler() {
  highlightedCellIndex = -1;
  requestAnimationFrame(renderGrid);
}

renderGrid();