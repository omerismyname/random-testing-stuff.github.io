const app = new PIXI.Application({ antialias: false, resizeTo: window });
document.body.appendChild(app.view);
app.renderer.resize(window.innerWidth, window.innerHeight);
//app.renderer.backgroundColor = 0x171a1e;

const graphics = new PIXI.Graphics();

let MAX_SIZE = Math.floor(Math.min(window.innerWidth, window.innerHeight) / 2) * 2;
//const seed = 3976965061;
//const seed = 3976965861;
const gap = 0;

setTimeout(onLoad, 200);

function onLoad() {
  const A = 20;
  const seed = Math.floor(Math.random() * Math.pow(2, 32));
  generateCircle(A, seed);

  app.stage.addChild(graphics);
}

async function generateCircle(A, seed, verbose = false) {
  let buf = new Uint8Array(A*A*4);
  if (verbose) console.log(`Processing iteration 1/${A}`);
  let startArr = (Math.random() > 0.5) ? [255, 2, 4, 255] : [255, 1, 3, 255];
  for (let j = 0; j < 4; j++) {
    buf[2*A*((j>1)+A-1) + ((j%2)+A-1)] = startArr[j];
  }
  drawCircle(A, buf);
  let ptr = Module._malloc(buf.length*buf.BYTES_PER_ELEMENT);
  Module.HEAPU8.set(buf, ptr);
  let circleArr;
  let currentA = 1;
  await new Promise(res => {
    if (currentA < A) requestAnimationFrame(() => iterateCircle(buf, ptr, A, currentA, seed, verbose, res));
  });
  Module._free(ptr);
  console.log("Generation Complete!");

  window.onresize = () => {
    app.renderer.resize(window.innerWidth, window.innerHeight);
    MAX_SIZE = Math.floor(Math.min(window.innerWidth, window.innerHeight) / 2) * 2;
    drawCircle(A, circleArr);
  }
}

function iterateCircle(buf, ptr, A, currentA, seed, verbose, res) {
  Module._iterateCircle(ptr, A, currentA, seed, verbose);
  circleArr = new Uint8Array(HEAPU8.subarray(ptr, ptr+buf.length*buf.BYTES_PER_ELEMENT));
  drawCircle(A, circleArr);
  currentA++;
  if (verbose) console.log(`Processing iteration ${currentA}/${A}`);
  if (currentA < A) {
    requestAnimationFrame(() => iterateCircle(buf, ptr, A, currentA, seed, verbose, res));
  } else res();
}

const coloursDict = [0xebcb8b, 0xbf616a, 0xb48ead, 0x81a1c1];
const rectangles = [[-1, 0, 2, 1], [0, 0, 1, 2], [0, 0, 2, 1], [0, -1, 1, 2]]

function drawCircle(A, circleArr) {
  graphics.clear();
  let size = MAX_SIZE / (A*2);
  for (let y = 0; y < A*2; y++) {
    for (let x = 0; x < A*2; x++) {
      const d = circleArr[2*A*y + x] - 1;
      if (d >= 0 && d < 4) {
        const colour = coloursDict[d];
        graphics.beginFill(colour);
        graphics.drawRect((rectangles[d][0]+x) * (size+gap), (rectangles[d][1]+y) * (size+gap), rectangles[d][2]*size, rectangles[d][3]*size);
        graphics.endFill();
      }
    }
  }
}