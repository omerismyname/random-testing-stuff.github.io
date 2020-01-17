function getComputerAction(player, bots) {
  let actions = {
    up: false,
    down: false,
    left: false,
    right: false
  };
  if (game.computerState == 1) {averageMethod(actions, player, bots);}
  if (game.computerState == 2) {gridMethod(actions, player, bots);}
  return actions;
}