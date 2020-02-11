import {loadGame} from "./loading.mjs";
import "./types.mjs";
import {processEvents} from "./events.mjs";
import {Node} from "./gameTypes.mjs";
import {render} from "./rendering.mjs";

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
  frame: 0,
  em: undefined
}

function init() {
  loadGame(game);
  const count = 8;
  for (let y = canvas.width / count; y < canvas.width; y += canvas.width / count) {
    for (let x = canvas.width / count; x < canvas.width; x += canvas.width / count) {
      new Node(x, y, 0.5*game.em, 0.1 * game.em);
    }
  }

  requestAnimationFrame(gameLoop);
}

function gameLoop() {
  game.ctx.clearRect(0, 0, game.display.width, game.display.height);

  processEvents(game);
  render(game);

  game.frame++;
  if (game.running) requestAnimationFrame(gameLoop);
}

window.onload = init;