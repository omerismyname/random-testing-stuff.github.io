function averageMethod(actions, player, bots) {
  const botX = [];
  const botY = [];
  for (const bot of bots) {
    botX.push(bot.centreX);
    botY.push(bot.centreY);
  }

  const avgX = getAvg(...botX);
  const avgY = getAvg(...botY);

  let distanceToHorizontalWalls = (player.centreX < canvas.width / 2) ? player.centreX : canvas.width - player.centreX;
  let distanceToVerticalWalls = (player.centreY < canvas.height / 2) ? player.centreY : canvas.height - player.centreX;

  if (distanceToHorizontalWalls < Math.abs(avgX - player.centreX)) {
    if (avgY > player.centreY) {actions.up = true;} else {actions.down = true;}
  } else {
    if (distanceToVerticalWalls < Math.abs(avgY - player.centreY)) {
      if (avgX > player.centreX) {actions.left = true;} else {actions.right = true;}
    } else {
      if (avgX > player.centreX) {actions.left = true;} else {actions.right = true;}
      if (avgY > player.centreY) {actions.up = true;} else {actions.down = true;}
    }
  }

  
}

function getAvg(...values) {
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
  }
  return sum / values.length;
}