const checkbox = document.querySelector("#verbose");
const checkmark = document.querySelector(".checkbox");
checkmark.onclick = () => {
  checkbox.checked = !checkbox.checked;
};