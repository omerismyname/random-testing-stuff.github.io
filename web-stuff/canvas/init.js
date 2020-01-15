const canvas = document.querySelector("main canvas");
const ctx = canvas.getContext("2d");

const game = {
  running: false,
  frame: 0,
  pendingInputs: {
    up: false,
    down: false,
    left: false,
    right: false
  },
  startTime: 0,
  stage: 1
};

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