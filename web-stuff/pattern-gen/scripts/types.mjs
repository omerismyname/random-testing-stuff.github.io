let game, canvas, ctx;
export function loadTypes(g) {
  game = g;
  canvas = g.display;
  ctx = g.ctx;
}

export class Point {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
    game.shapes.push(this);
  }
}

export class Line {
  constructor(x1 = 0, y1 = 0, x2 = 0, y2 = 0, strokeColor, lineWidth = 0) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.strokeColor = strokeColor;
    this.lineWidth = lineWidth;

    this.update = () => {
      this.strokeColor = game.color;

      ctx.beginPath();
      ctx.moveTo(this.x1, this.y1);
      ctx.lineTo(this.x2, this.y2);
      ctx.lineWidth = this.lineWidth;
      ctx.strokeStyle = this.strokeColor;
      ctx.stroke();
    };
  }
}

function getPosition(alignX, alignY, width, height, x, y) {
  let newXOff = 0, newYOff = 0;
  if (alignX == "left") newXOff = x;
  if (alignX == "center") newXOff = ((canvas.width / 2) - (width / 2)) + x;
  if (alignX == "right") newXOff = (canvas.width - width) - x;

  if (alignY == "top") newYOff = y;
  if (alignY == "middle") newYOff = ((canvas.height / 2) - (height / 2)) + y;
  if (alignY == "bottom") newYOff = (canvas.height - height) - y;

  return [newXOff, newYOff];
}