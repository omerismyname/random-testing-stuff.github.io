import {MovingCircle, Colour} from "./types.mjs";

let app;
export function loadCreatures(a) {
  app = a;
}

export class Dust extends MovingCircle {
  constructor(X = 0, Y = 0, dX = 0, dY = 0) {
    const edge = Math.floor(Math.random() * 4);
    const angle = (Math.random() * Math.PI) + (edge * 0.5 * Math.PI);
    const velocity = Math.random() * 2;

    const [x, y] = (X && Y) ? [X, Y] : getRandomEdgePos(edge);
    
    const dx = dX || -velocity * Math.cos(angle);
    const dy = dY || velocity * Math.sin(angle);

    const fillColor = new Colour(undefined, 80, 80).toString;

    const size = Math.floor(Math.sqrt(Math.random() * 3 + 1.5));

    super(x, y, size, fillColor, dx, dy, false);

    this.onupdate = () => {
      const newDX = ((Math.random() - 0.5) + this.dx);
      const newDY = ((Math.random() - 0.5) + this.dy);
      if (
        Math.abs(newDX) < 2 &&
        Math.abs(newDY) < 2
      ) {
        this.dx += (newDX - this.dx) / this.r;
        this.dy += (newDY - this.dy) / this.r;
      }
    }
  }
}

function getRandomEdgePos(edge) {
  let x, y;
  if (edge % 2 === 0) {
    y = (edge < 2) ? 0 : app.display.height;
    x = Math.floor(Math.random() * app.display.width);
  } else {
    y = Math.floor(Math.random() * app.display.height);
    x = (edge < 2) ? 0 : app.display.width;
  }
  return [x, y];
}