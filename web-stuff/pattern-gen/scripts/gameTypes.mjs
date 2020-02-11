import * as canvasTypes from "./types.mjs";

let game;
export function loadGameTypes(g) {
  game = g;
}

export class Node extends canvasTypes.Point {
  constructor(x = 0, y = 0) {
    super(x, y);
    this.connections = [];

    this.connectTo = target => {
      const targetIndex = this.connections.map(s => s.target).indexOf(target);
      const thisIndex = target.connections.map(s => s.target).indexOf(this);
      if (targetIndex > -1) {
        game.removeShape(this.connections[targetIndex].line);
        this.connections.splice(targetIndex, 1);
        target.connections.splice(thisIndex, 1);
      } else {
        const line = new Connection(this.x, this.y, target.x, target.y, game.lineWidth);
        game.shapes.sort((a, b) => a.layer - b.layer);
        this.connections.push({
          line: line,
          target: target
        });
        target.connections.push({
          line: line,
          target: this
        });
      }
    }

    game.nodes.push(this);
  }
}

class Connection extends canvasTypes.Line {
  constructor(x1 = 0, y1 = 0, x2 = 0, y2 = 0, lineWidth = 1) {
    super(x1, y1, x2, y2, game.color, lineWidth);

    game.shapes.push(this);
  }
}