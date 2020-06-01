const gyroInfo = {
  a: document.querySelector(".gyro-info > .gyro-a"),
  b: document.querySelector(".gyro-info > .gyro-b"),
  c: document.querySelector(".gyro-info > .gyro-c")
}

window.addEventListener("deviceorientation", e => {
  gyroInfo.a.innerHTML = e.alpha;
  gyroInfo.b.innerHTML = e.beta;
  gyroInfo.c.innerHTML = e.gamma;
}, true);