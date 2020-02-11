let oldLength = undefined;

export function render(game) {
  if (game.shapes.length !== oldLength) {
    game.shapes.sort((a, b) => a.layer - b.layer);
    oldLength = game.shapes.length;
  }
  for (const shape of game.shapes) {
    if (shape.update) shape.update();
  }
}