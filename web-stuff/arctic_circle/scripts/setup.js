const checkbox = document.querySelector("#verbose");
const checkmark = document.querySelector(".checkbox");
checkmark.onclick = () => {
  checkbox.checked = !checkbox.checked;
};

const scripts = [
  "/scripts/circlegen.js",
  "/scripts/pixi.min.js",
  "/scripts/app.js"
];