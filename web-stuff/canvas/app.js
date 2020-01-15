const startButton = document.querySelector("main .start");
const resetButton = document.querySelector("main .reset");

startButton.onclick = () => {
  if (!game.running) {
    game.running = true;
    init();
  }
}

resetButton.onclick = () => {
  if (game.running) {
    game.running = false;
    shapes = [];
    requestAnimationFrame(() => {
      clearCanvas();
    })
    document.onkeydown = null;
    document.onkeyup = null;
  }
}