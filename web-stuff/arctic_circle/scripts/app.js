const app = new PIXI.Application({ antialias: false, resizeTo: window });
document.body.appendChild(app.view);
app.renderer.resize(window.innerWidth, window.innerHeight);

const graphics = new PIXI.Graphics();

let MAX_SIZE = Math.floor(Math.min(window.innerWidth, window.innerHeight) / 2) * 2;
const A = 5;
const seed = 77;
const gap = 0;

const coloursDict = [0,0xb01919, 0x129912, 0x1f1fd1];

setTimeout(onLoad, 200);

function onLoad() {
  let gridArr = new Uint8Array(A*A*4);
  let buf = Module._malloc(gridArr.length*gridArr.BYTES_PER_ELEMENT);
  Module.HEAPU8.set(gridArr, buf);
  Module._generateCircle(buf, A, seed);
  let circleArr = new Uint8Array(HEAPU8.subarray(buf, buf+gridArr.length*gridArr.BYTES_PER_ELEMENT));
  Module._free(buf);

  drawCircle(circleArr);

  app.stage.addChild(graphics);
  window.onresize = () => {
    app.renderer.resize(window.innerWidth, window.innerHeight);
    MAX_SIZE = Math.floor(Math.min(window.innerWidth, window.innerHeight) / 2) * 2;
    drawCircle(circleArr);
  }
}

function drawCircle(circleArr) {
  graphics.clear();
  let size = MAX_SIZE / (A*2);
  for (let y = 0; y < A*2; y++) {
    for (let x = 0; x < A*2; x++) {
      graphics.beginFill((circleArr[2*A*y + x]) ? 0xffffff : 0);
      graphics.drawRect(x * (size+gap), y * (size+gap), size, size);
      graphics.endFill();
    }
  }
}