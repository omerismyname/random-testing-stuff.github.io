function init() {
  const player = new MovingSquare("centre", "middle", 50, "#b8f");
  const bots = [];
  const timer = new CanvasText("00:00", undefined, "lavender", "center", "centre", "top", 0, 50);

  game.pendingInputs = {
    up: false,
    down: false,
    left: false,
    right: false
  };
  game.frame = 0;
  game.startTime = new Date().getTime();
  game.stage = 2;
  game.points = 0;
  requestAnimationFrame(update);

  function update() {
    clearCanvas();

    if (game.computerState > 0) {
      game.pendingInputs = getComputerAction(player, bots);
    }

    for (const bot of bots) {
      [bot.dx, bot.dy] = getVelocity({
        up: (player.centreY < bot.centreY),
        down: (player.centreY > bot.centreY),
        left: (player.centreX < bot.centreX),
        right: (player.centreX > bot.centreX)
      });
      bot.dx += Math.min((Math.random() * 2) - 1, 2);
      bot.dy += Math.min((Math.random() * 2) - 1, 2);
    }

    [player.dx, player.dy] = getVelocity(game.pendingInputs);


    for (const shape of shapes) {shape.update();}

    const timeElapsed = new Date().getTime() - game.startTime;
    let seconds = Math.floor(timeElapsed / 1000);
    let time = new Date(seconds * 1000).toISOString().substr(11, 8);
    if (time.charAt(0) == 0 && time.charAt(1) == 0) {
      time = time.slice(-5);
    }

    timer.text = time;
    timer.update();

    if (game.frame % 400 == 0) {
      bots.push(...generateBots(player, Math.floor(game.stage / 2)));
      game.stage = Math.pow(game.stage, 1.05);
    }

    pointsDisplay.innerHTML = game.points = Math.floor(game.frame / 5);
    if (game.points > game.highScore) {
      game.highScore = game.points;
      highScoreDisplay.innerHTML = game.highScore;
    }

    game.frame++;

    if (gameLost(player, bots)) {
      endScreen();
      document.cookie = "highscore=" + game.highScore + "; path=/web-stuff/canvas/";
      game.running = false;
      shapes = [];
      document.onkeydown = null;
      document.onkeyup = null;
    }
    
    if (game.running) {requestAnimationFrame(update)}
  }

  document.onkeydown = onKeyDown;
  document.onkeyup = onKeyUp;
}

function generateBots(player, botNumber = 1, size = 10) {
  let arr = [];
  for (let i = 0; i < botNumber; i++) {
    let x = randPos(0, canvas.width - size, player.centreX);
    let y = randPos(0, canvas.height - size, player.centreY);
    arr.push(new MovingSquare("left", "top", size, "crimson", undefined, 0, 0, x, y));
  }
  return arr;
}

function randPos(min = 0, max = 100, origin) {
  let x = Math.floor(Math.random() * (max + min)) + min;
  if (x < origin - 150 || x > origin + 150) {
    return x;
  } else {
    randPos(min, max, origin);
  }
  return x;
}

function gameLost(player, bots) {
  for (const bot of bots) {
    let collisions = {
      top: (bot.bottom >= player.top && bot.top <= player.bottom),
      bottom: (bot.top <= player.bottom && bot.bottom >= player.top),
      left: (bot.right >= player.left && bot.left <= player.right),
      right: (bot.left <= player.right && bot.right >= player.left)
    }

    if (collisions.top || collisions.bottom) {
      if (collisions.left || collisions.right) {
        return true;
      }
    }
  }
  return false;
}

function endScreen() {
  const background = new Rect("centre", "middle", 0.9 * canvas.width, 0.5 * canvas.width, "rgba(255, 255, 255, 0.4)");
  background.fill();

  new CanvasText("Game over", "70px 'Roboto'", "#0d0d16", "center", "centre", "middle", 0, -20);
  new CanvasText("Press 'Start' to play again", "30px 'Roboto'", "#0d0d16", "center", "centre", "middle", 0, 50);
}