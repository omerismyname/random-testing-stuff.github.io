import * as canvasTypes from "./types.mjs";
import {calcPointerTargets} from "./events.mjs";

let game;
export function loadGameTypes(g) {
  game = g;
}

export class Node extends canvasTypes.MovingCircle {
  constructor(x = 0, y = 0, r = 0, strokeWidth = 1) {
    super(x, y, r, "#41A82F", "#1C782B", strokeWidth, 0, 0, true);
    this.baseSize = this.r;
    this.activeSize = this.r * 1.2;
    this.connections = [];

    this.addEventListener("pointerdown", e => {
      this.r = this.activeSize;
      this.update();
      const vine = new Vine(this.x, this.y, e.x, e.y, 0.3 * game.em);
      vine.setLayer(-1);
      
      const moveVineToPointer = e => {
        vine.x2 = e.x;
        vine.y2 = e.y;
        vine.update();

        calcPointerTargets(game, e, this);
      }

      const resetGooball = () => {
        this.r = this.baseSize;
        this.update();
        game.removeShape(vine);
        if (game.pointer.target) {
          this.connectTo(game.pointer.target);
          game.pointer.target.r = game.pointer.target.baseSize;
          game.pointer.target = null;
        }
        game.removeEventListener("pointermove", moveVineToPointer);
        game.removeEventListener("pointerup", resetGooball);
      }

      game.addEventListener("pointermove", moveVineToPointer);
      game.addEventListener("pointerup", resetGooball);
    });

    this.connectTo = target => {
      const targetIndex = this.connections.map(s => s.target).indexOf(target);
      const thisIndex = target.connections.map(s => s.target).indexOf(this);
      if (targetIndex > -1) {
        game.removeShape(this.connections[targetIndex].vine);
        this.connections.splice(targetIndex, 1);
        target.connections.splice(thisIndex, 1);
      } else {
        const vine = new Vine(this.x, this.y, target.x, target.y, 0.3 * game.em);
        vine.setLayer(-2);
        game.shapes.sort((a, b) => a.layer - b.layer);
        this.connections.push({
          vine: vine,
          target: target
        });
        target.connections.push({
          vine: vine,
          target: this
        });
      }
    }
  }
}

class Vine extends canvasTypes.Line {
  constructor(x1 = 0, y1 = 0, x2 = 0, y2 = 0, lineWidth = 1) {
    super(x1, y1, x2, y2, "#41A82F", lineWidth);

    game.shapes.push(this);
  }
}