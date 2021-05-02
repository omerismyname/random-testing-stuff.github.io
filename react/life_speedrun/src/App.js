import './App.css';
import { initialGridTypes, generateInitialGrid } from './initialGrid.js';
import { ThemeProvider, Button, Select, MenuItem, InputLabel, FormControl } from '@material-ui/core';
import { createMuiTheme } from '@material-ui/core/styles';
import { useRef, useState, useEffect } from 'react';

const initialWindowWidth = Math.min(512, Math.floor(window.innerWidth));
const theme = createMuiTheme({
  palette: {
    type: "dark"
  }
});
let currentGrid = null;
let currentGridSize = null;

export default function App() {
  const [initialGridType, setInitialGridType] = useState("white_noise");
  const [resolution, setResolution] = useState(initialWindowWidth);
  const [grid, setGrid] = useState(generateInitialGrid("white_noise", resolution));
  const [running, setRunning] = useState(false);
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.putImageData(gridToImageData(ctx, grid, resolution), 0, 0);
  }, [grid, resolution]);
  useEffect(resetGrid, [initialGridType, resolution]);
  function resetGrid() {
    currentGrid = generateInitialGrid(initialGridType, resolution);
    currentGridSize = resolution;
    setGrid(currentGrid);
  }
  return (
    <ThemeProvider theme={theme}>
      <div className="container">
        <canvas ref={canvasRef} width={resolution} height={resolution}></canvas>
        <div className="controls">
        <FormControl className="select"  variant="outlined">
            <InputLabel htmlFor="resolution-select" id="resolution-select-label">Resolution</InputLabel>
            <Select color="primary" labelId="resolution-select-label" id="resolution-select" label="Resolution" value={resolution} onChange={e => {
              if (typeof e.target.value === "number") setResolution(e.target.value);
            }}>
              <MenuItem value={Math.min(512, initialWindowWidth)}>Auto ({initialWindowWidth})</MenuItem>
              <MenuItem value={64}>64</MenuItem>
              <MenuItem value={128}>128</MenuItem>
              <MenuItem value={256}>256</MenuItem>
              <MenuItem value={512}>512</MenuItem>
            </Select>
          </FormControl>
          <FormControl className="select"  variant="outlined">
            <InputLabel htmlFor="initial-grid-select" id="initial-grid-select-label">Starting Grid</InputLabel>
            <Select color="primary" labelId="initial-grid-select-label" id="initial-grid-select" label="Starting Grid" value={initialGridType}
              onChange={e => {
                if ([e.target.value]) setInitialGridType(e.target.value);
            }}>
              {
                Object.entries(initialGridTypes).map(
                  ([key, value]) => <MenuItem key={key} value={key}>{value.displayText}</MenuItem>
                )
              }
            </Select>
          </FormControl>
        </div>
        <Button variant="contained" color="primary" onClick={() => {
          if (running) return resetGrid();
          startSimulation(1000/24, grid, setGrid, resolution);
          setRunning(true);
        }}>Simulate</Button>
      </div>
    </ThemeProvider>
  );
}

function startSimulation(ms, initialGrid, setGrid, gridSize) {
  const start = document.timeline ? document.timeline.currentTime : performance.now();
  currentGrid = initialGrid;
  currentGridSize = gridSize;
  
  function scheduleFrame(time) {
    const elapsed = time - start;
    const roundedElapsed = Math.round(elapsed / ms) * ms;
    const targetNext = start + roundedElapsed + ms;
    const delay = targetNext - time;
    setTimeout(() => requestAnimationFrame(() => {
      currentGrid = iterateLife(currentGrid, currentGridSize);
      setGrid(currentGrid);
      scheduleFrame(performance.now());
    }), delay);
  }

  scheduleFrame(start);
}

function iterateLife(grid, gridSize) {
  let newGrid = Array(gridSize*gridSize);
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const sum = sumCellNeighbours(grid, gridSize, x, y);
      const cell = grid[y*gridSize+x];
      if (cell) {
        newGrid[y*gridSize+x] = (sum === 2 || sum === 3);
      } else {
        newGrid[y*gridSize+x] = (sum === 3);
      }
    }
  }
  return newGrid;
}

function sumCellNeighbours(grid, gridSize, dx, dy) {
  let sum = 0;
  for (let y = dy-1; y <= dy+1; y++) {
    for (let x = dx-1; x <= dx+1; x++) {
      let cx = ((x % gridSize) + gridSize) % gridSize;
      let cy = ((y % gridSize) + gridSize) % gridSize;
      sum += grid[cy*gridSize+cx];
    }
  }
  return sum - grid[dy*gridSize+dx];
}

// 2d boolean array to rgb image data for canvas
function gridToImageData(ctx, grid, gridSize) {
  const data = ctx.createImageData(gridSize, gridSize);
  for (let i = 0; i < gridSize*gridSize; i++) {
    data.data[4*i+0] = grid[i]*255;
    data.data[4*i+1] = grid[i]*255;
    data.data[4*i+2] = grid[i]*255;
    data.data[4*i+3] = 255;
  }
  return data;
}