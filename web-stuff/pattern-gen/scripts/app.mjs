import {loadGame} from "./loading.mjs";
import * as Patterns from "./patterns.mjs";
import {createSlider} from "./slider.mjs";

const canvas = document.querySelector(".game-display");

const game = {
  display: canvas,
  ctx: canvas.getContext("2d"),
  title: "GAME",
  running: true,
  pointer: {
    x: 0,
    y: 0,
    target: null
  },
  events: [],
  eventListeners: [],
  shapes: [],
  nodes: [],
  frame: 0,
  em: undefined,
  color: "hsl(0,60%,80%)",
  patternIndex: 0,
  pattern: Patterns.patterns[0],
  count: 2,
  lineWidth: 1
}

function init() {
  loadGame(game);
  const colorSlider = document.querySelector(".color .slider");
  const colorHandle = colorSlider.querySelector(".handle");
  const countSlider = document.querySelector(".count .slider");
  const countDisplay = document.querySelector(".count .count-display");

  createSlider(colorSlider, true, 0, 360, value => {
    colorHandle.style.setProperty("--hue", value);
    game.color = "hsl(" + value + ",60%,80%)";
    update();
  });
  
  createSlider(countSlider, false, 1, 8, value => {
    if (!value) return;
    game.count = value;
    countSlider.style.setProperty("--hue", 120 - ((120 / 8) * value));
    countDisplay.innerHTML = value;
    game.lineWidth = 1 - (Math.floor(Math.log10((game.count * 1.2)) * 10) / 10);
    game.shapes = [];
    game.nodes = [];
    game.pattern(game, canvas, game.count);
    update();
  });

  canvas.onclick = () => {
    game.patternIndex++;
    if (game.patternIndex >= Patterns.patterns.length) game.patternIndex = 0;

    game.shapes = [];
    game.nodes = [];
    game.pattern = Patterns.patterns[game.patternIndex];
    game.pattern(game, canvas, game.count);
    update();
  }

  game.pattern(game, canvas, game.count);
  update();
}

function update() {
  game.ctx.clearRect(0, 0, game.display.width, game.display.height);

  for (const shape of game.shapes) {
    if (shape.update) shape.update();
  }
}

window.onload = init;