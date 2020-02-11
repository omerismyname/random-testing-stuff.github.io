import {addEventListener, removeEventListener} from "./events.mjs";

let game, canvas, ctx;
export function loadTypes(g) {
  game = g;
  canvas = g.display;
  ctx = g.ctx;
}

class Shape {
  constructor() {
    this.align = (alignX, alignY) => {
      const w = this.width || 0;
      const h = this.height || 0;
      [this.x, this.y] = getPosition(alignX, alignY, w, h, 0, 0);
    };
    this.addEventListener = (type, callback) => addEventListener(game, type, this, callback);
    this.removeEventListener = (type, callback) => removeEventListener(game, type, this, callback);
    this.layer = 0;
    this.setLayer = (layer) => {this.layer = layer};
  }
}

export class CanvasText extends Shape {
  constructor(text = "", fontSize = 0, font = "sans-serif", fill = "white", textAlign = "left", x = 0, y = 0) {
    super();
    this.text = text;
    this.fontSize = (typeof fontSize === "number") ? fontSize + "px" : fontSize;
    this.font = "'" + font + "'";
    this.fill = fill;
    this.textAlign = textAlign;
    this.x = x;
    this.y = y;

    this.draw = () => {
      ctx.font = this.fontSize + this.font;
      ctx.fillStyle = this.fill;
      ctx.textAlign = this.textAlign;
      ctx.fillText(this.text, this.x, this.y);
    };
  }
}

export class Rect extends Shape {
  constructor(x = 0, y = 0, width = 0, height = 0, fillStyle, strokeStyle) {
    super();
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.fillStyle = fillStyle;
    this.strokeStyle = strokeStyle;

    this.fill = (style = this.fillStyle) => {
      ctx.fillStyle = style;
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    this.stroke = (style = this.strokeStyle) => {
      ctx.strokeStyle = style;
      ctx.strokeRect(this.x, this.y, this.width, this.height);
    }

    this.getRect = () => {
      this.top = this.y;
      this.bottom = this.y + this.height;
      this.left = this.x;
      this.right = this.x + this.width;
      this.centreX = this.x + this.width / 2;
      this.centreY = this.y + this.height / 2;
    }
    
    
    this.draw = () => {
      if (this.fillStyle) this.fill();
      if (this.strokeStyle) this.stroke();
    }
    
    this.getRect();
    game.shapes.push(this);
  }
}

export class Square extends Rect {
  constructor(x = 0, y = 0, width = 0, fillStyle, strokeStyle) {
    super(x, y, width, width, fillStyle, strokeStyle);
  }
}

export class MovingRect extends Rect {
  constructor(x = 0, y = 0, width = 0, height = 0, fillStyle, strokeStyle, dx = 0, dy = 0, bound = true) {
    super(x, y, width, height, fillStyle, strokeStyle);
    this.dx = dx;
    this.dy = dy;
    this.bound = bound;

    this.update = () => {
      if (this.dx) this.x += this.dx;
      if (this.dy) this.y += this.dy;

      this.getRect();

      if (this.bound) {
        if (this.left < 0) this.x = 0;
        if (this.right > canvas.width) this.x = canvas.width - this.width;
        if (this.top < 0) this.y = 0;
        if (this.bottom > canvas.height) this.y = canvas.height - this.height;
      }
      this.draw();
    }
  }
}

export class MovingSquare extends MovingRect {
  constructor(x = 0, y = 0, width = 0, fillStyle, strokeStyle, dx = 0, dy = 0, bound = true) {
    super(x, y, width, width, fillStyle, strokeStyle, dx, dy, bound);
  }
}

export class Circle extends Shape {
  constructor(x = 0, y = 0, r = 0, fillColor, strokeColor, strokeWidth = 1) {
    super();
    this.x = x;
    this.y = y;
    this.r = r;
    this.fillStyle = fillColor;
    this.strokeColor = strokeColor;
    this.strokeWidth = strokeWidth;

    this.getRect = () => {
      this.top = this.y - r;
      this.bottom = this.y + this.r;
      this.left = this.x - r;
      this.right = this.x + this.r;
    }

    this.draw = () => {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
      if (this.fillStyle) {
        ctx.fillStyle = this.fillStyle;
        ctx.fill();
      }
      if (this.strokeColor) {
        ctx.strokeStyle = this.strokeColor;
        ctx.lineWidth = this.strokeWidth;
        ctx.stroke();
      }
    };

    this.getRect();
    game.shapes.push(this);
  }
}

export class MovingCircle extends Circle {
  constructor(x = 0, y = 0, r = 0, fillColor, strokeColor, strokeWidth = 1, dx = 0, dy = 0, bound = true) {
    super(x, y, r, fillColor, strokeColor, strokeWidth);
    this.dx = dx;
    this.dx = dy;
    this.bound = bound;

    this.update = () => {
      if (this.dx) this.x += this.dx;
      if (this.dy) this.y += this.dy;

      this.getRect();

      if (this.bound) {
        if (this.left < 0) this.x = 0;
        if (this.right > canvas.width) this.x = canvas.width - this.width;
        if (this.top < 0) this.y = 0;
        if (this.bottom > canvas.height) this.y = canvas.height - this.height;
      }
      this.draw();
    }
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
      ctx.beginPath();
      ctx.moveTo(this.x1, this.y1);
      ctx.lineTo(this.x2, this.y2);
      ctx.lineWidth = this.lineWidth;
      ctx.stroke();
    };

    this.layer = 0;
    this.setLayer = (layer) => {this.layer = layer};
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