let app;
export function loadTypes(a) {
  app = a;
}

export class Circle {
  constructor(x = 0, y = 0, r = 0, fillColor) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.fillColor = fillColor;

    this.getRect = () => {
      this.top = this.y - r;
      this.bottom = this.y + this.r;
      this.left = this.x - r;
      this.right = this.x + this.r;
    }

    this.draw = () => {
      app.ctx.beginPath();
      app.ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
      if (this.fillColor) {
        app.ctx.fillStyle = this.fillColor;
        app.ctx.fill();
      }
    };

    this.getRect();
  }
}

export class MovingCircle extends Circle {
  constructor(x = 0, y = 0, r = 0, fillColor, dx = 0, dy = 0, bound = false) {
    super(x, y, r, fillColor);
    this.dx = dx;
    this.dy = dy;
    this.bound = bound;

    this.update = () => {
      if (
        this.x < 0 ||
        this.x > app.display.width ||
        this.y < 0 ||
        this.y > app.display.height
      ) {
        this.remove();
      }

      if (this.dx) this.x += this.dx;
      if (this.dy) this.y += this.dy;
    }

    this.remove = () => {
      const i = app.creatures.indexOf(this);
      app.creatures.splice(i, 1);
    }
  }
}

export class Colour {
  constructor(
    h = Math.random() * 360,
    s = Math.random() * 100,
    l = Math.random() * 100,
    a
  ) {
    if (a) {
      this.toString = "hsla("  + h +", " + s +"%, " + l +"%, " + a + ")";
    } else {
      this.toString = "hsl("  + h +", " + s +"%, " + l +"%)";
    }
  }
}