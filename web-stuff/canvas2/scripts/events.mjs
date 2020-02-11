export class GamePointerEvent {
  constructor(type = "", x = "", y = "") {
    this.type = type;
    this.x = x;
    this.y = y;
  }
}

export function processEvents(game) {
  for (const evt of game.events) {
    for (const eventListener of game.eventListeners) {
      if (eventListener.type === evt.type) {
        if (evt instanceof GamePointerEvent) {
          if (eventListener.srcShape === game) {
            eventListener.callback(evt);
          } else {
            for (const shape of game.shapes) {
              if (shape === eventListener.srcShape) {
                shape.getRect();
                if (
                  shape.left < evt.x &&
                  shape.right > evt.x &&
                  shape.top < evt.y &&
                  shape.bottom > evt.y
                ) {
                  eventListener.callback(evt);
                }
              }
            }
          }
        }
      }
    }
    game.events.shift();
  }
}

export function addEventListener(game, type, srcShape, callback) {
  if (type && callback) {
    game.eventListeners.push({
      type: type,
      srcShape: srcShape,
      callback: callback
    });
  }
}

export function removeEventListener(game, type, srcShape, callback) {
  for (let i = 0; i < game.eventListeners.length; i++) {
    if (
      game.eventListeners[i].type === type &&
      game.eventListeners[i].srcShape === srcShape &&
      game.eventListeners[i].callback === callback
    ) {
      game.eventListeners.splice(i, 1);
    }
  }
}

export async function calcPointerTargets(game, e, srcShape) {
  const gameTypes = await import("./gameTypes.mjs");
  for (const shape of game.shapes) {
    if (shape instanceof gameTypes.Node && shape !== srcShape) {
      shape.getRect();
      if (
        shape.left < e.x &&
        shape.right > e.x &&
        shape.top < e.y &&
        shape.bottom > e.y
      ) {
        if (game.pointer.target !== shape) {
          shape.r = shape.activeSize;
          game.pointer.target = shape;
        }
      } else {
        if (game.pointer.target === shape) {
          shape.r = shape.baseSize;
          game.pointer.target = null;
        };
      }
    }
  }
}