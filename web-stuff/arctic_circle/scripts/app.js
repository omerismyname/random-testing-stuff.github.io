const app = new PIXI.Application({ antialias: false, resizeTo: window });
document.body.appendChild(app.view);
app.renderer.resize(window.innerWidth, window.innerHeight);
//app.renderer.backgroundColor = 0x171a1e;

const graphics = new PIXI.Graphics();

let MAX_SIZE = Math.floor(Math.min(window.innerWidth, window.innerHeight) / 2) * 2;
const A = 4; // SET HIGHER AND INVESTIGATE
const seed = 3976965061;
//const seed = 3976965861;
//const seed = Math.floor(Math.random() * Math.pow(2, 32));
const gap = 0;

setTimeout(onLoad, 200);

function onLoad() {
  let gridArr = new Uint8Array(A*A*4);
  let buf = Module._malloc(gridArr.length*gridArr.BYTES_PER_ELEMENT);
  Module.HEAPU8.set(gridArr, buf);
  Module._generateCircle(buf, A, seed);
  let circleArr = new Uint8Array(HEAPU8.subarray(buf, buf+gridArr.length*gridArr.BYTES_PER_ELEMENT));
  Module._free(buf);
  console.log(circleArr)
  drawCircle(circleArr);

  app.stage.addChild(graphics);
  window.onresize = () => {
    app.renderer.resize(window.innerWidth, window.innerHeight);
    MAX_SIZE = Math.floor(Math.min(window.innerWidth, window.innerHeight) / 2) * 2;
    drawCircle(circleArr);
  }
}

const coloursDict = [0xebcb8b, 0xbf616a, 0xb48ead, 0x81a1c1];
const rectangles = [[-1, 0, 2, 1], [0, 0, 1, 2], [0, 0, 2, 1], [0, -1, 1, 2]]

function drawCircle(circleArr) {
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