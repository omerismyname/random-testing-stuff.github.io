var boxes = document.querySelectorAll(".box");
var section = document.querySelector("section");
var avg = document.querySelector("section .boxavg")

function getAvg(...vars) {
  let x = 0;
  for (let i = 0; i < vars.length; i++) {
    x += vars[i];
  }
  return x / vars.length;
}

function average() {
  let lefts = [], tops = [];
  for (const box of boxes) {
    let bound = box.getBoundingClientRect();
    lefts.push(bound.left + bound.width / 2);
    tops.push(bound.top + bound.height / 2);
  }
  avg.style.left = getAvg(...lefts) + "px";
  avg.style.top = getAvg(...tops) + "px";
  
}


for (let box of boxes) {
  draggable(box, average, document.body);
}