
const maxPointDistance = 0.5;

/** Bezier points for a seven point circle, to 3 decimal places */
// prettier-ignore
const sevenPointCircle = new Float64Array([
  -0.304, -1, 0, -1, 0.304, -1,
  0.592, -0.861, 0.782, -0.623, 0.972, -0.386,
  1.043, -0.074, 0.975, 0.223, 0.907, 0.519,
  0.708, 0.769, 0.434, 0.901, 0.16, 1.033,
  -0.16, 1.033, -0.434, 0.901, -0.708, 0.769,
  -0.907, 0.519, -0.975, 0.223, -1.043, -0.074,
  -0.972, -0.386, -0.782, -0.623, -0.592, -0.861,
]);
const entriesPerPoint = 6;

// This is reused for all blob points to reduce GC.
const blobPoints = new Float64Array(sevenPointCircle.length);

/*
// Here's how I created the above (although DOMMatrix isn't available in worklets):

function createBezierCirclePoints(points) {
  const anglePerPoint = 360 / points;
  const matrix = new DOMMatrix();
  const point = new DOMPoint();
  const controlDistance = (4 / 3) * Math.tan(Math.PI / (2 * points));
  return Array.from({ length: points }, (_, i) => {
    point.x = -controlDistance;
    point.y = -1;
    const cp1 = point.matrixTransform(matrix);
    point.x = 0;
    point.y = -1;
    const p = point.matrixTransform(matrix);
    point.x = controlDistance;
    point.y = -1;
    const cp2 = point.matrixTransform(matrix);
    const basePoint = [cp1.x, cp1.y, p.x, p.y, cp2.x, cp2.y];
    matrix.rotateSelf(0, 0, anglePerPoint);
    return basePoint;
  });
}
*/

function drawPoints(ctx) {
  ctx.beginPath();
  ctx.moveTo(blobPoints[2], blobPoints[3]);
  for (let i = 0; i < blobPoints.length; i += entriesPerPoint) {
    const nextI =
      i + entriesPerPoint === blobPoints.length ? 0 : i + entriesPerPoint;

    ctx.bezierCurveTo(
      blobPoints[i + 4],
      blobPoints[i + 5],
      blobPoints[nextI],
      blobPoints[nextI + 1],
      blobPoints[nextI + 2],
      blobPoints[nextI + 3],
    );
  }

  ctx.closePath();
}

function drawBlob(ctx, PRNGSeed, x, y, size, color) {
  // Reset points
  blobPoints.set(sevenPointCircle);
  let random = new Mulberry32(PRNGSeed);

  // Randomly shift the points a bit
  for (let i = 0; i < blobPoints.length; i += entriesPerPoint) {
    const distance = random.next() * maxPointDistance;
    const angle = random.next() * Math.PI * 2;
    const xShift = Math.sin(angle) * distance;
    const yShift = Math.cos(angle) * distance;
    blobPoints[i] += xShift;
    blobPoints[i + 1] += yShift;
    blobPoints[i + 2] += xShift;
    blobPoints[i + 3] += yShift;
    blobPoints[i + 4] += xShift;
    blobPoints[i + 5] += yShift;
  }

  ctx.fillStyle = color;
  ctx.setTransform(size, 0, 0, size, x, y);
  drawPoints(ctx);
  ctx.fill();
  ctx.resetTransform();
}

class Mulberry32 {
  constructor(seed) {
    this.state = seed;
  }

  nextInt() {
    this.state |= 0;
    this.state = (this.state + 0x6d2b79f5) | 0;
    var t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0);
  }

  next() {
    return this.nextInt() / 4294967296;
  }

  nextBetween(from, to) {
    return from + (to - from) * this.nextInt();
  }

  fork() {
    return new Mulberry32(this.nextInt());
  }
}

registerPaint(
  'fleck',
  class {
    constructor() {
      this.cache = [];
      this.cachedSize = [0, 0];
      this.cachedProps = {
        seed: 0,
        density: 0,
        baseSize: 0,
        colors: []
      }
      console.log("resetting caches");
    }

    static inputProperties = [
      '--fleck-seed',
      '--fleck-density',
      '--fleck-size-base',
      '--fleck-colors',
    ];

    static cache;
    static cachedSize;
    static cachedProps;

    paint(ctx, size, props) {
      console.time("paint");
      const width = size.width;
      const height = size.height;

      const propsObj = {
        seed: props.get('--fleck-seed').value,
        density: props.get('--fleck-density').value,
        baseSize: props.get('--fleck-size-base').value,
        colors: props.getAll('--fleck-colors').map((s) => s.toString())
      }

      if (havePropsChanged(this.cachedProps, propsObj)) {
        console.log("props changed, rebuilding from scratch");
        console.log(this.cachedProps, propsObj);
        this.cache = [];
        this.cachedSize = [width, height];
        this.cachedProps = propsObj;
        this.generateNewArea(0, 0, width, height, propsObj);
      } else {
        console.log(this.cachedSize, [width, height]);
        if (hasSizeIncreased(this.cachedSize, [width, height])) { //generate extra bits to fill
          console.log("generating new area");
          this.generateNewArea(this.cachedSize[0], 0, width - this.cachedSize[0], height, propsObj); // rightmost new column
          this.generateNewArea(0, this.cachedSize[1], this.cachedSize[0], height, propsObj); //underneath area up to col
          this.cachedSize = [width, height];
        }
      }
      // otherwise cache is assumed not stale
      console.log(this.cache.length);

      for (let i = 0; i < this.cache.length; i++) {
        drawBlob(
          ctx,
          this.cache[i].PRNGSeed,
          this.cache[i].xPos,
          this.cache[i].yPos,
          this.cache[i].size,
          this.cache[i].color,
        );
      }
      console.timeEnd("paint");
      // console.log(`${endTime-startTime}ms`)
      // if (numLoops !== Math.ceil(width)*Math.ceil(height)) console.log("ERROR");
      // console.log(`painted ${numFlecks} flecks. ${numLoops}/${Math.ceil(width)*Math.ceil(height)} pixels calculated`);
      // console.log(`height: ${height} width: ${width}`);
    }

    generateNewArea(left, top, width, height, props) {
      // TODO add back in props
      const pixelBlobChance = (props.density/(300*300)) * 4294967296;
      let numLoops = 0;
      
      let random = new Mulberry32(props.seed);
      for (let x = left; x < width; x++) {
        for (let y = top; y < height; y++) {
          random.state = props.seed*((x * 2**16)+y);
          numLoops++;
          if (random.nextInt() > pixelBlobChance) continue;

          let radius = props.baseSize*0.7;
          if (random.nextInt() > (0.5*2**32)) radius /= 2;
          if (random.nextInt() > (0.9*2**32)) radius *= 4;

          this.cache.push({
            xPos: x,
            yPos: y,
            size: radius,
            color: props.colors[Math.floor(random.next()*props.colors.length)],
            PRNGSeed: props.seed*((x * 2**16)+y)
          });
        }
      }
    }
  },
);

function havePropsChanged(cachedProps, newProps) {
  for (let key of Object.keys(cachedProps)) {
    if (Array.isArray(cachedProps[key])) {
      if (cachedProps[key].length !== newProps[key].length) return true;
      for (let i = 0; i < cachedProps[key].length; i++) {
        if (!cachedProps[key].includes(newProps[key][i])) return true;
      }
    } else {
      if (cachedProps[key] !== newProps[key]) return true;
    }
  }
  return false;
}

function hasSizeIncreased(cachedSize, newSize) {
  if (newSize[0] > cachedSize[0]) return true; 
  if (newSize[1] > cachedSize[1]) return true; 
  return false;
}

function pairingFunction(x, y) {
  return (1/2)*(x+y)*(x+y+1)*y;
  // return x*y*2;
}

function splitIntoTwoRandomNumbers(num) {
  let num1 = (num & 0x0f0f0f0f) / 0x0fffffff;
  let num2 = (num & 0x00f0f0f0) / 0x00ffffff;
  return [num1, num2];
}