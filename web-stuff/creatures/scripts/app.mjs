import { load } from "./loading.mjs";
import { Dust } from "./Creatures.mjs";

const canvas = document.querySelector("canvas");

const app = {
  display: canvas,
  ctx: canvas.getContext("2d"),
  running: true,
  creatures: [],
  creatureLimit: 30,
  frame: 0
}

function init() {
  load(app);

  for (let i = 0; i < app.creatureLimit; i++) {
    app.creatures.push(new Dust(
      Math.floor(Math.random() * app.display.width),
      Math.floor(Math.random() * app.display.height),
      ((Math.random() * 40) / 10) - 2,
      ((Math.random() * 40) / 10) - 2
    ));
  }

  requestAnimationFrame(appLoop);
}

function appLoop() {
  app.ctx.clearRect(0, 0, app.display.width, app.display.height);

  processCreatures();

  for (const c of app.creatures) c.draw();

  app.frame++;
  if (app.running) requestAnimationFrame(appLoop);
}

function processCreatures() {
  while (app.creatures.length < app.creatureLimit) {
    app.creatures.push(new Dust());
  }

  for (const c of app.creatures) {
    c.update();
    if (c.onupdate) c.onupdate();
  }
}

window.onload = init;

window.onresize = () => {
  app.display.width = app.display.clientWidth;
  app.display.height = app.display.clientHeight;

  const size = Math.max(app.display.width, app.display.height);
  app.creatureLimit = size / 10;
}