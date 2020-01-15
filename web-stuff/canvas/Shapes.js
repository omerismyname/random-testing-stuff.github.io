let shapes = [];

class Rect {
  constructor(alignX = "left", alignY = "top", width = 0, height = 0, fillStyle, strokeStyle, xOff = 0, yOff = 0) {
    this.width = width;
    this.height = height;
    this.fillStyle = fillStyle;
    this.strokeStyle = strokeStyle;
    [this.xOff, this.yOff] = getPosition(alignX, alignY, width, height, xOff, yOff);

    this.fill = (style = this.fillStyle) => {
      ctx.fillStyle = style;
      ctx.fillRect(this.xOff, this.yOff, this.width, this.height);
    }

    this.stroke = (style = this.strokeStyle) => {
      ctx.strokeStyle = style;
      ctx.strokeRect(this.xOff, this.yOff, this.width, this.height);
    }

    this.top = this.yOff;
    this.bottom = this.yOff + this.height;
    this.left = this.xOff;
    this.right = this.xOff + this.width;
    this.centreX = this.xOff + this.width / 2;
    this.centreY = this.yOff + this.height / 2;
    
    shapes.push(this);

    if (this.fillStyle) {this.fill();}
    if (this.strokeStyle) {this.stroke();}
  }
}

class Square extends Rect {
  constructor(alignX = "left", alignY = "top", width = 0, fillStyle, strokeStyle, xOff = 0, yOff = 0) {
    super(alignX, alignY, width, width, fillStyle, strokeStyle, xOff, yOff);
  }
}

class CanvasText {
  constructor(text = "", font = "48px 'Roboto'", fill = "white", textAlign = "left", alignX = "left", alignY = "top", x = 0, y = 0) {
    this.text = text;
    this.font = font;
    this.fill = fill;
    this.textAlign = textAlign;
    [this.x, this.y] = getPosition(alignX, alignY, 0, 0, x, y);

    this.update = () => {
      ctx.font = this.font;
      ctx.fillStyle = this.fill;
      ctx.textAlign = this.textAlign;
      ctx.fillText(this.text, this.x, this.y);
    };

    this.update();
  }
}

function getPosition(alignX, alignY, width, height, xOff, yOff) {
  let newXOff = 0, newYOff = 0;
  if (alignX == "left") {newXOff = xOff;}
  if (alignX == "centre") {newXOff = ((canvas.width / 2) - (width / 2)) + xOff;}
  if (alignX == "right") {newXOff = (canvas.width - width) - xOff;}

  if (alignY == "top") {newYOff = yOff;}
  if (alignY == "middle") {newYOff = ((canvas.height / 2) - (height / 2)) + yOff;}
  if (alignY == "bottom") {newYOff = (canvas.height - height) - yOff;}

  return [newXOff, newYOff];
}