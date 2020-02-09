const btns = document.querySelectorAll(".btn-bubble");

for (const btn of btns) {
  btn.onclick = e => {
    const btnRect = btn.getBoundingClientRect();
    const bubble = document.createElement("div");
    bubble.className = "bubble";

    bubble.style.top = (((e.clientY - btnRect.top) / btnRect.height) * 100) + "%";
    bubble.style.left = (((e.clientX - btnRect.left) / btnRect.width) * 100) + "%";

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        bubble.style.transform = "translate(-50%, -50%) scale(1)";
        bubble.style.opacity = 1;
        setTimeout(() => {bubble.style.opacity = 0}, 350);
        setTimeout(() => {bubble.remove();}, 520);
      });
    });
  
    btn.append(bubble);
  }
}