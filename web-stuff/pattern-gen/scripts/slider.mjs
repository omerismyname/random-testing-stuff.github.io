let events = {
  move: "pointermove",
  end: "pointerup",
  cancel: "pointercancel"
};

if (!window.PointerEvent) {
  events.move = "touchmove";
  events.end = "touchend";
  events.cancel = "touchcancel";
}

export function createSlider(slider, continuous = true, min = 0, max = 100, callback) {
  const bar = slider.children[0];
  let startX = 0, currentX = 0, value = 0, returnValue = 0;

  function limitValue(val, low = 0, high = slider.clientWidth) {
    let v = val;
    if (val < low) {v = low;}
    if (val > high) {v = high;}
    returnValue = Math.round(min + ((v / high) * (max - min)));
    return v;
  }

  function handleMove(e) {
    e.preventDefault();
    requestAnimationFrame(() => {
      currentX = getPointerPosX(e);
      value = limitValue(currentX - startX);
      if (continuous) {
        bar.style.width = (value / slider.clientWidth) * 100 + "%";
      } else {
        const dec = (value / slider.clientWidth) * 100;
        const roundValue = 100 / (max - min);
        bar.style.width = Math.round(dec / roundValue) * roundValue + "%";
      }
      if (callback) callback(returnValue);
    });
  }

  function handleEnd(e) {
    e.preventDefault();
    requestAnimationFrame(() => {
      value = limitValue(getPointerPosX(e) - startX);
      if (callback) callback(returnValue);
    });
    document.removeEventListener(events.move, handleMove, true);
    document.removeEventListener(events.end, handleEnd, true);
    document.removeEventListener(events.cancel, handleEnd, true);
  }

  function handleDown(e) {
    e.preventDefault();
    requestAnimationFrame(() => {
      startX = slider.offsetLeft;
      if (callback) callback(returnValue);
    });
    document.addEventListener(events.move, handleMove, true);
    document.addEventListener(events.end, handleEnd, true);
    document.addEventListener(events.cancel, handleEnd, true);
  }

  if (window.PointerEvent) {
    slider.onpointerdown = handleDown;
  } else {
    slider.ontouchstart = handleDown;
    slider.onmousedown = handleDown;
  }
}

function getPointerPosX(e) {
  if (e.targetTouches) {
    return e.targetTouches[0].clientX;
  } else {
    return e.clientX
  }
}