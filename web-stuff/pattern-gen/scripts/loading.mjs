import {loadTypes} from "./types.mjs";
import {loadGameTypes} from "./gameTypes.mjs";

export function loadGame(game) {
  const size = Math.min(window.innerHeight, window.innerWidth);
  game.em = Math.round(size / 20);
  game.display.height = game.display.width = size;

  loadTypes(game);
  loadGameTypes(game);
  
  game.ctx.clearRect(0, 0, game.display.width, game.display.height);
}