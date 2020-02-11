import {loadTypes, CanvasText} from "./types.mjs";
import {GamePointerEvent, addEventListener, removeEventListener} from "./events.mjs";
import {loadGameTypes} from "./gameTypes.mjs";

export function loadGame(game) {
  const size = Math.min(window.innerHeight, window.innerWidth);
  game.em = Math.round(size / 20);
  game.display.height = game.display.width = size;

  loadTypes(game);
  loadGameTypes(game);
  loadPointerEvents(game);

  game.addEventListener = (type, callback) => addEventListener(game, type, game, callback);
  game.removeEventListener = (type, callback) => removeEventListener(game, type, game, callback);
  game.removeShape = shape => {
    const i = game.shapes.indexOf(shape);
    if (i > -1) game.shapes.splice(i, 1);
  };

  displayTitle(game);
  
  game.ctx.clearRect(0, 0, game.display.width, game.display.height);
}

function displayTitle(game) {
  const loadingText = new CanvasText(
    game.title,
    4*game.em,
    "Odibee Sans",
    "white",
    "center"
  );
  loadingText.align("center", "middle");
  loadingText.draw();
}


function loadPointerEvents(game) {
  game.display.addEventListener("pointerdown", e => {
    document.addEventListener("pointermove", onMove);

    document.addEventListener("pointerup", onEnd);
    document.addEventListener("pointercancel", onEnd);

    onMove(e);
    game.events.push(new GamePointerEvent("pointerdown", game.pointer.x, game.pointer.y));
  });

  function onMove(e) {
    const rect = game.display.getBoundingClientRect();
    game.pointer.x = e.clientX - rect.left;
    game.pointer.y = e.clientY - rect.top;
    game.events.push(new GamePointerEvent("pointermove", game.pointer.x, game.pointer.y));
  }

  function onEnd(e) {
    document.removeEventListener("pointermove", onMove);
    document.removeEventListener("pointerup", onEnd);
    document.removeEventListener("pointercancel", onEnd);
    onMove(e);
    game.events.push(new GamePointerEvent("pointerup", game.pointer.x, game.pointer.y));
  }
}