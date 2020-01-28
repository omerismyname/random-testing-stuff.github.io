const canvas = document.querySelector("main canvas");
const ctx = canvas.getContext("2d");
const pointsDisplay = document.querySelector(".stats .points span");
const highScoreDisplay = document.querySelector(".stats .highscore span");

const cookie = document.cookie;
let cookieHighscore = cookie.split("highscore=")[1];
if (cookieHighscore) {
  if (cookieHighscore.includes(";")) {
    cookieHighscore = cookieHighscore.split(";")[0];
  }
} else {
  cookieHighscore = 0;
}
cookieHighscore = parseInt(cookieHighscore);

const game = {
  running: false,
  frame: 0,
  points: 0,
  highScore: cookieHighscore || 0,
  pendingInputs: {
    up: false,
    down: false,
    left: false,
    right: false
  },
  startTime: 0,
  stage: 1,
  computerState: 0
};

highScoreDisplay.innerHTML = cookieHighscore;

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}


function getVelocity(pendingInputs) {
  let dx = 0, dy = 0;
  if (pendingInputs.up || pendingInputs.down) {
    if (pendingInputs.left || pendingInputs.right) {
      if (pendingInputs.down) {dy = 1;} else {dy = -1;}
      if (pendingInputs.right) {dx = 1;} else {dx = -1;}
    } else {
      if (pendingInputs.down) {dy = 2;} else {dy = -2;}
    }
  } else if (pendingInputs.left || pendingInputs.right) {
    if (pendingInputs.right) {dx = 2;} else {dx = -2;}
  }
  return [dx, dy];
}


function onKeyDown(e) {
  if (e.code == "ArrowUp") {
    game.pendingInputs.up = true;
  }
  if (e.code == "ArrowDown") {
    game.pendingInputs.down = true;
  }
  if (e.code == "ArrowLeft") {
    game.pendingInputs.left = true;
  }
  if (e.code == "ArrowRight") {
    game.pendingInputs.right = true;
  }
}

function onKeyUp(e) {
  if (e.code == "ArrowUp") {
    game.pendingInputs.up = false;
  }
  if (e.code == "ArrowDown") {
    game.pendingInputs.down = false;
  }
  if (e.code == "ArrowLeft") {
    game.pendingInputs.left = false;
  }
  if (e.code == "ArrowRight") {
    game.pendingInputs.right = false;
  }
}