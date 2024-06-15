
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

function drawBlob(ctx, random, x, y, size, color) {
  // Reset points
  blobPoints.set(sevenPointCircle);

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
    static inputProperties = [
      '--fleck-seed',
      '--fleck-density',
      '--fleck-size-base',
      '--fleck-colors',
    ];

    paint(ctx, size, props) {
      console.time("paint");
      const width = size.width;
      const height = size.height;
      const seed = props.get('--fleck-seed').value;
      const density = props.get('--fleck-density').value;
      const baseSize = props.get('--fleck-size-base').value;
      const colors = props.getAll('--fleck-colors').map((s) => s.toString());
      const pixelBlobChance = (density/(300*300)) * 4294967296;
      const tileSize = 8;
      let numLoops = 0;
      let numFlecks = 0;

      const random = new Mulberry32(seed);

      for (let tx = 0; tx < width; tx+=tileSize) {
        for (let ty = 0; ty < height; ty+=tileSize) {
          let tileRandom = random.fork(); 
          // console.log(`tile (${tx}, ${ty}), size: ${Math.min(width-tx, tileSize)}x${Math.min(height-ty, tileSize)}`);
          for (let x = 0; x < Math.min(width-tx, tileSize); x++) {
            for (let y = 0; y < Math.min(height-ty, tileSize); y++) {
              numLoops++;
              if (tileRandom.nextInt() > pixelBlobChance) continue;
              const trueX = tx+x;
              const trueY = ty+y;
              
              let radius = baseSize;
              if (tileRandom.nextInt() > (0.5*2**32)) radius /= 2;
              if (tileRandom.nextInt() > (0.9*2**32)) radius *= 4;
              radius = Math.max(1, Math.min(radius, 24));
              radius *= 0.7;
    
              const color = colors[Math.floor(tileRandom.next()*colors.length)];
    
              numFlecks++;
              drawBlob(
                ctx,
                tileRandom,
                trueX,
                trueY,
                radius,
                color,
              );
              // ctx.fillStyle = color;
              // ctx.fillRect(trueX, trueY, 5, 5);
            }
          }
        }
      }
      console.timeEnd("paint");
      // console.log(`${endTime-startTime}ms`)
      // if (numLoops !== Math.ceil(width)*Math.ceil(height)) console.log("ERROR");
      // console.log(`painted ${numFlecks} flecks. ${numLoops}/${Math.ceil(width)*Math.ceil(height)} pixels calculated`);
      // console.log(`height: ${height} width: ${width}`);
    }
  },
);

function pairingFunction(x, y) {
  return (1/2)*(x+y)*(x+y+1)*y;
  // return x*y*2;
}

function splitIntoTwoRandomNumbers(num) {
  let num1 = (num & 0x0f0f0f0f) / 0x0fffffff;
  let num2 = (num & 0x00f0f0f0) / 0x00ffffff;
  return [num1, num2];
}