import './App.css';
import { ThemeProvider, Button } from '@material-ui/core'
import { createMuiTheme } from '@material-ui/core/styles'
import { useRef, useState, useEffect } from 'react';

const resolution = 800;
const theme = createMuiTheme({
  palette: {
    type: "dark"
  }
});

function App() {
  const [grid, setGrid] = useState(generateInitialGrid);
  const [running, setRunning] = useState(false);
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.putImageData(gridToImageData(ctx, grid), 0, 0);
  }, [grid]);
  return (
    <ThemeProvider theme={theme}>
      <div className="container">
        <canvas ref={canvasRef} width={resolution} height={resolution}></canvas>
        <Button variant="contained" color="primary" onClick={_ => {
          if (running) return;
          simulate(1000/24, grid, setGrid);
          setRunning(true);
        }}>Simulate</Button>
      </div>
    </ThemeProvider>
  );
}

export default App;

function simulate(ms, grid, setGrid) {
  const start = document.timeline ? document.timeline.currentTime : performance.now();
  let currentGrid = grid;

  function scheduleFrame(time) {
    const elapsed = time - start;
    const roundedElapsed = Math.round(elapsed / ms) * ms;
    const targetNext = start + roundedElapsed + ms;
    const delay = targetNext - performance.now();
    setTimeout(() => requestAnimationFrame(() => {
      currentGrid = iterateLife(currentGrid);
      setGrid(currentGrid);
      scheduleFrame(time);
    }), delay);
  }

  scheduleFrame(start);
}

function generateInitialGrid() {
  let arr = Array(resolution*resolution);
  for (let y = 0; y < resolution; y++) {
    for (let x = 0; x < resolution; x++) {
      arr[y*resolution+x] = Math.random() < 0.5;
    }
  }
  return arr;
}

function iterateLife(grid) {
  let newGrid = Array(resolution*resolution);
  for (let y = 0; y < resolution; y++) {
    for (let x = 0; x < resolution; x++) {
      const sum = sumNeighbours(grid, x, y);
      const cell = grid[y*resolution+x];
      if (cell) {
        newGrid[y*resolution+x] = (sum === 2 || sum === 3);
      } else {
        newGrid[y*resolution+x] = (sum === 3);
      }
    }
  }
  return newGrid;
}

function sumNeighbours(grid, dx, dy) {
  let sum = 0;
  for (let y = dy-1; y < dy+2; y++) {
    for (let x = dx-1; x < dx+2; x++) {
      let cx = ((x % resolution) + resolution) % resolution;
      let cy = ((y % resolution) + resolution) % resolution;
      sum += grid[cy*resolution+cx];
    }
  }
  return sum - grid[dy*resolution+dx];
}

function gridToImageData(ctx, grid) {
  const data = ctx.createImageData(resolution, resolution);
  for (let y = 0; y < resolution; y++) {
    for (let x = 0; x < resolution; x++) {
      let i = y*resolution+x;
      data.data[4*i+0] = grid[i]*255;
      data.data[4*i+1] = grid[i]*255;
      data.data[4*i+2] = grid[i]*255;
      data.data[4*i+3] = 255;
    }
  }
  return data;
}