import './App.css';
import { ThemeProvider, Button, Select, MenuItem, InputLabel, FormControl } from '@material-ui/core'
import { createMuiTheme } from '@material-ui/core/styles'
import { useRef, useState, useEffect } from 'react';
import FastPoissonDiskSampling from 'fast-2d-poisson-disk-sampling';

const initialWindowWidth = Math.min(512, Math.floor(window.innerWidth));
const theme = createMuiTheme({
  palette: {
    type: "dark"
  }
});
const initialGridTypes = {
  white_noise: generateWhiteNoise,
  blue_noise: generateBlueNoise,
  every_7th_pixel: generateEvery7thPixel
}
let currentGrid = null;
let currentResolution = null;

function App() {
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
  useEffect(() => {
    currentGrid = generateInitialGrid(initialGridType, resolution);
    currentResolution = resolution;
    setGrid(currentGrid);
  }, [initialGridType, resolution]);
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
            <Select color="primary" labelId="initial-grid-select-label" id="initial-grid-select" label="Starting Grid" value={initialGridType} onChange={e => {
              if (initialGridTypes[e.target.value]) setInitialGridType(e.target.value);
            }}>
              <MenuItem value={"white_noise"}>White Noise</MenuItem>
              <MenuItem value={"blue_noise"}>Blue Noise</MenuItem>
              <MenuItem value={"every_7th_pixel"}>Every 7th Pixel</MenuItem>
            </Select>
          </FormControl>
        </div>
        <Button variant="contained" color="primary" onClick={() => {
          if (running) return;
          simulate(1000/24, grid, setGrid, resolution);
          setRunning(true);
        }}>Simulate</Button>
      </div>
    </ThemeProvider>
  );
}

export default App;

function simulate(ms, initialGrid, setGrid, gridSize) {
  const start = document.timeline ? document.timeline.currentTime : performance.now();
  currentGrid = initialGrid;
  currentResolution = gridSize;
  
  function scheduleFrame(time) {
    const elapsed = time - start;
    const roundedElapsed = Math.round(elapsed / ms) * ms;
    const targetNext = start + roundedElapsed + ms;
    const delay = targetNext - performance.now();
    setTimeout(() => requestAnimationFrame(() => {
      currentGrid = iterateLife(currentGrid, currentResolution);
      setGrid(currentGrid);
      scheduleFrame(performance.now());
    }), delay);
  }

  scheduleFrame(start);
}

function generateInitialGrid(initialGridType, res) {
  return initialGridTypes[initialGridType](res);
}

function generateWhiteNoise(res) {
  let arr = Array(res*res);
  for (let y = 0; y < res; y++) {
    for (let x = 0; x < res; x++) {
      arr[y*res+x] = Math.random() < 0.07;
    }
  }
  return arr;
}

function generateEvery7thPixel(res) {
  let arr = Array(res*res);
  for (let y = 0; y < res; y++) {
    for (let x = 0; x < res; x++) {
      arr[y*res+x] = (y*res+x)%7 === 0;
    }
  }
  return arr;
}

function generateBlueNoise(res) {
  let pds = new FastPoissonDiskSampling({
    shape: [res, res],
    radius: 2,
    tries: 30
  });
  let arr = Array(res*res).fill(false);
  let points = pds.fill();
  for (let p = 0; p < points.length; p++) {
    arr[Math.floor(points[p][1])*res+Math.floor(points[p][0])] = true;
  }
  return arr;
}

function iterateLife(grid, gridSize) {
  let newGrid = Array(gridSize*gridSize);
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const sum = sumNeighbours(grid, gridSize, x, y);
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

function sumNeighbours(grid, gridSize, dx, dy) {
  let sum = 0;
  for (let y = dy-1; y < dy+2; y++) {
    for (let x = dx-1; x < dx+2; x++) {
      let cx = ((x % gridSize) + gridSize) % gridSize;
      let cy = ((y % gridSize) + gridSize) % gridSize;
      sum += grid[cy*gridSize+cx];
    }
  }
  return sum - grid[dy*gridSize+dx];
}

function gridToImageData(ctx, grid, gridSize) {
  const data = ctx.createImageData(gridSize, gridSize);
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      let i = y*gridSize+x;
      data.data[4*i+0] = grid[i]*255;
      data.data[4*i+1] = grid[i]*255;
      data.data[4*i+2] = grid[i]*255;
      data.data[4*i+3] = 255;
    }
  }
  return data;
}

// function generateBlueNoise(res) {
//   let arr = Array(res*res).fill(false);
//   const samples = 100;
//   const m = 1;
//   let x = Math.floor(Math.random() * res);
//   let y = Math.floor(Math.random() * res);
//   arr[y*res+x] = true;
//   for (let i = 0; i < samples; i++) {
//     let candidatesArr = [];
//     let distancesArr = [];
//     for (let j = 0; j < i*m+1; j++) {
//       const cx = Math.floor(Math.random() * res);
//       const cy = Math.floor(Math.random() * res);
//       const distance = toroidalDistance(x, y, cx, cy);
//       candidatesArr.push([cx, cy]);
//       distancesArr.push(distance);
//     }
//     [x, y] = candidatesArr[indexOfMax(distancesArr)];
//     arr[y*res+x] = true;
//   }
//   return arr;
// }

// function indexOfMax(arr) {
//   let maxIndex = 0, maxValue = 0;
//   for (let i = 0; i < arr.length; i++) {
//     if (arr[i] > maxValue) {
//       maxIndex = i;
//       maxValue = arr[i];
//     }
//   }
//   return maxIndex;
// }

// function toroidalDistance(x1, y1, x2, y2) {
//   let dx = Math.abs(x2 - x1);
//   let dy = Math.abs(y2 - y1);
  
//   if (dx > 0.5) dx = 1 - dx;
//   if (dy > 0.5) dy = 1 - dy;
  
//   return dx*dx + dy*dy;
// }