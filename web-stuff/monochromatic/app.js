var hue = 0;
window.onload = () => {document.body.style.background = "hsl(" + hue + ", 100%, 50%)";};
window.onkeydown = (e) => {
  console.log(e.code);
  if (e.code === "KeyW") {document.body.style.background = "#fff";} else {
    if (e.code === "KeyR") {hue = 0;}
    if (e.code === "KeyG") {hue = 120;}
    if (e.code === "KeyB") {hue = 240;}
    if (e.code === "ArrowUp" || e.code === "ArrowDown") {hue = Math.floor((hue + 1) / 10) * 10;}
    if (e.code === "ArrowUp") {hue += 10;}
    if (e.code === "ArrowDown") {hue -= 10;}
    if (e.code === "ArrowRight") {hue++;}
    if (e.code === "ArrowLeft") {hue--;}
    console.log(hue);
    document.body.style.background = "hsl(" + hue + ", 100%, 50%)";
  }
};