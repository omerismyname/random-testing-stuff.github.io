import './App.css';
import { useState, useEffect, useLayoutEffect, useRef } from 'react';

export default function App() {
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const pixelRatio = window.devicePixelRatio;
  useEffect(() => {
    setWidth(document.body.clientWidth);
    setHeight(document.body.clientHeight);
  }, []);
  return (
    <div>
      <Canvas width={Math.floor(pixelRatio * width)} height={Math.floor(pixelRatio * height)}></Canvas>
    </div>
  );
}

function Canvas(props) {
  const canvasRef = useRef(null);
  useLayoutEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    let data = generateFibonacciImage(ctx.createImageData(props.width, props.height), props.width*props.height);
    ctx.putImageData(data, 0, 0);
  }, [props.width, props.height]);
  return (
    <canvas ref={canvasRef} width={props.width} height={props.height}></canvas>
  )
}

function generateFibonacciImage(arr, n) {
  let last = 0;
  for (let i = 1; i < n; i+=last) {
    arr.data[i*4+0] = 255;
    arr.data[i*4+1] = 255;
    arr.data[i*4+2] = 255;
    arr.data[i*4+3] = 255;
    last = i;
  }
  return arr;
}