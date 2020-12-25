//[x,y,dx,dy,radius,hue]
export function generateParticle(mode, MAX_X, MAX_Y, X, Y) {
  let edge, x, y, dx, dy;

  if (mode === "creatures") {
    edge = Math.floor(Math.random() * 4);
    dx = Math.random() * 4 - 2;
    dy = Math.random() * 4 - 2;

    if (edge % 2 === 0) {
      x = X || (Math.floor(Math.random() * MAX_X));
      y = Y || ((edge < 2) ? 0 : MAX_Y);
      dy = (edge < 2) ? Math.abs(dy) : -Math.abs(dy);
    } else {
      y = Y || (Math.floor(Math.random() * MAX_Y));
      x = X || ((edge < 2) ? 0 : MAX_X);
      dx = (edge < 2) ? Math.abs(dx) : -Math.abs(dx);
    }
  } else if (mode === "snow") {
    const seed = Math.floor(Math.random() * 10);
    if (seed === 0) {edge = 0;} else {edge = 1;}
    dx = Math.random() * 0.2 - 0.3;
    dy = Math.random() * 0.05 + 2;


    if (edge === 0) {
      y = Y || (Math.floor(Math.random() * MAX_Y));
      x = X || MAX_X;
    } else {
      x = X || (Math.floor(Math.random() * MAX_X));
      y = Y || 0;
    }
  }

  return [
    x,
    y,
    dx,
    dy,
    Math.floor(Math.sqrt(Math.random() * 3 + 1.5)),
    Math.random() * 360
  ];
}

export function updateParticle(mode, x, y, dx, dy, r, hue) {
  let newDX, newDY;
  if (mode === "creatures") {
    newDX = (((Math.random() - 0.5) / 2) + Math.sign(dx) * Math.min(Math.abs(dx), 2));
    newDY = (((Math.random() - 0.5) / 2) + Math.sign(dy) * Math.min(Math.abs(dy), 2));
  } else if (mode === "snow") {
    newDX = Math.sign(dx) * Math.min(Math.abs(dx - 0.02), 0.2) + (Math.random() * 0.05 - 0.025);
    newDY = dy;
  }
  return [x + newDX, y + newDY, newDX, newDY, r, hue];
}

export function generateInitialParticles(app) {
  for (let i = 0; i < app.particleLimit; i++) {
    app.particles.push(...generateParticle(
      app.mode,
      app.display.width,
      app.display.height,
      Math.random() * app.display.width,
      Math.random() * app.display.height
    ));
  }
}