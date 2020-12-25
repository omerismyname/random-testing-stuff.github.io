import { load } from "./loading.js";
import { generateParticle, updateParticle, generateInitialParticles } from "./particles.js";

const canvas = document.querySelector("canvas");

const app = {
  display: canvas,
  ctx: canvas.getContext("2d"),
  running: true,
  particles: [],
  particleLimit: 30,
  frame: 0,
  mode: "creatures"
}
window.app = app;

function init() {
  load(app);
  generateInitialParticles(app);
  requestAnimationFrame(appLoop);
}

function appLoop() {
  app.ctx.clearRect(0, 0, app.display.width, app.display.height);
  addMoreParticles();

  const tempParticles = [];
  for (let i = 0; i < app.particles.length; i+=6) {
    const thingy = app.particles.slice(i, i+6);
    if (
      app.particles[i + 0] >= 0 &&
      app.particles[i + 0] <= app.display.width &&
      app.particles[i + 1] >= 0 &&
      app.particles[i + 1] <= app.display.height
    ) {
      tempParticles.push(...updateParticle(app.mode, ...thingy))
      drawCircle(...thingy)
    }
  }
  app.particles = tempParticles;

  app.frame++;
  if (app.running) requestAnimationFrame(appLoop);
}

function addMoreParticles() {
  while (app.particles.length < app.particleLimit * 6) {
    app.particles.push(...generateParticle(app.mode, app.display.width, app.display.height));
  }
}

window.onload = init;

window.onresize = () => {
  app.display.width = app.display.clientWidth;
  app.display.height = app.display.clientHeight;

  const size = Math.max(app.display.width, app.display.height);
  app.particleLimit = size / 10;
}

function drawCircle(x, y, _dx, _dy, r, hue) {
  app.ctx.beginPath();
  app.ctx.arc(x, y, r, 0, 2 * Math.PI);
  if (app.mode === "creatures") {
    app.ctx.fillStyle = `hsl(${hue},80%,80%)`;
  } else if (app.mode === "snow") {
    app.ctx.fillStyle = "hsl(196, 26%, 95%)"
  }
  app.ctx.fill();
}