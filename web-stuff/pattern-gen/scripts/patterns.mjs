import {Node} from "./gameTypes.mjs";

export const patterns = [
  squares,
  curve
];

export function squares(game, canvas, count = 1) {
  for (let y = 0; y <= canvas.width; y += canvas.width / count) {
    for (let x = 0; x <= canvas.width; x += canvas.width / count) {
      new Node(x, y, 0.5*game.em, 0.1 * game.em);
    }
  }

  for (const node of game.nodes) {
    for (const target of game.nodes) {
      if (!node.connections.map(n => n.target).includes(target)) {
        node.connectTo(target);
      }
    }
  }
}

function curve(game, canvas, count = 1) {
  let left = [], bottom = [];

  for (let y = 0; y <= canvas.width; y += canvas.width / count) {
    left.push(new Node(0, y, 0.5*game.em, 0.1 * game.em));
  }

  for (let x = 0; x <= canvas.width; x += canvas.width / count) {
    bottom.push(new Node(x, canvas.width, 0.5*game.em, 0.1 * game.em));
  }

  for (const node of left) {
    for (const target of bottom) {
      if (
        !((node.x === 0 && node.y === 0) && (target.x === canvas.width && target.y === canvas.width)) &&
        !((target.x === 0 && target.y === 0) && (node.x === canvas.width && node.y === canvas.width))
      ) {
        node.connectTo(target);
      }
    }
  }
}