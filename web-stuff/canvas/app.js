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
      pointsDisplay.innerHTML = 0;
    })
    document.onkeydown = null;
    document.onkeyup = null;
  }
}

//load computer toggle
const computerToggle = document.querySelector(".stats .computer");
const computerStatus = computerToggle.querySelector("span");

const computerStates = [
  {
    text: "None",
    color: "#f05663"
  },
  {
    text: "Grid",
    color: "#56f06b"
  },
  {
    text: "Average",
    color: "#56f06b"
  }
];

computerToggle.onclick = () => {
  if (game.computerState > computerStates.length - 2) {
    game.computerState = 0;
  } else {
    game.computerState++;
  }
  computerStatus.innerHTML = computerStates[game.computerState].text;
  computerStatus.style.color = computerStates[game.computerState].color;
}