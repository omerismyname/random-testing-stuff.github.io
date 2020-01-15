char = document.getElementById("char");
var Game = new Object;
Game.frame = 0;
player = new Object;
player.y = 0;
player.jumpPressed = false;
player.canJump = true;
var endFrame = 0;

function update() {
  if (player.jumpPressed && player.canJump) {
    player.jumpPressed = false;
    player.canJump = false;
    endFrame = Game.frame + 10;
  }
  if (!player.canJump && Game.frame < endFrame - 3) {player.y++;}
  if (!player.canJump && Game.frame > endFrame - 3) {player.y = 0;}
  if (!player.canJump && Game.frame > endFrame) {player.canJump = true;}

  char.style.bottom = player.y + "%";
}

function gameLoop(){
  setTimeout(() => {
    window.requestAnimationFrame(gameLoop);
    Game.frame++;
    update();
  }, 33);
}

document.addEventListener("click", () => player.jumpPressed = true, false);
document.addEventListener("keyup", (event) => {if (event.code === "Space") {gameLoop();}}, false);

console.clear();