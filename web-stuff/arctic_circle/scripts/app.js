const canvas = document.querySelector("canvas");
const form = document.querySelector(".buttons form");
const textA = form.querySelector("#A");
const textSeed = form.querySelector("#seed");
const app = new PIXI.Application({ antialias: false, resizeTo: canvas, view: canvas, transparent: true });

const graphics = new PIXI.Graphics();
const gap = 0;
const coloursDict = [0xebcb8b, 0xbf616a, 0xb48ead, 0x81a1c1];
const rectangles = [[-1, 0, 2, 1], [0, 0, 1, 2], [0, 0, 2, 1], [0, -1, 1, 2]];

setTimeout(() => {
  generateCircle(20, Math.floor(Math.random() * Math.pow(2, 32)));
  app.stage.addChild(graphics);
}, 250);

let textA_ = textA.value;
let textSeed_ = textSeed.value;
textA.oninput = e => {
  if (e.data !== null && !/^\d+$/.test(e.data)) e.srcElement.value = textA_;
  textA_ = e.srcElement.value;
};
textSeed.oninput = e => {
  if (e.data !== null && !/^\d+$/.test(e.data)) e.srcElement.value = textSeed_;
  textSeed_ = e.srcElement.value;
};

form.onsubmit = e => {
  e.preventDefault();
  const data = new FormData(form);
  const A = parseInt(data.get("A"));
  const seed = parseInt(data.get("seed"));
  const verbose = data.get("verbose");
  if (isNaN(A)) return;
  if (isNaN(seed)) return;
  generateCircle(A, seed, (verbose === "on"));
};

function onFormSubmit() {
  generateCircle(2, 100, false);
  return false;
}

async function generateCircle(A, seed, verbose = false) {
  let buf = new Uint8Array(A*A*4);
  if (verbose) console.log(`Processing iteration 1/${A}`);
  let startArr = (Math.random() > 0.5) ? [255, 2, 4, 255] : [255, 1, 3, 255];
  for (let i = 0; i < 4; i++) {
    buf[2*A*((i>1)+A-1) + ((i%2)+A-1)] = startArr[i];
  }
  drawCircle(A, buf);
  let ptr = Module._malloc(buf.length*buf.BYTES_PER_ELEMENT);
  Module.HEAPU8.set(buf, ptr);
  let currentA = 1;
  await new Promise(res => {
    if (currentA < A) requestAnimationFrame(() => iterateCircle(buf, ptr, A, currentA, seed, verbose, res));
  });
  Module._free(ptr);
  console.log("Generation Complete!");

  window.onresize = () => {
    console.log("EEEEEEE");
    circleArr = new Uint8Array(HEAPU8.subarray(ptr, ptr+buf.length*buf.BYTES_PER_ELEMENT));
    drawCircle(A, circleArr);
  };
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

function drawCircle(A, circleArr) {
  graphics.clear();
  let size = Math.min(canvas.clientWidth, canvas.clientHeight) / (A*2);
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