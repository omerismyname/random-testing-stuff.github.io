//initial setup

var events = new Object;

if (window.PointerEvent) {
  events.type = "pointer"
  events.move = "pointermove";
  events.end = "pointerup";
  events.cancel = "pointercancel";
} else {
  events.type = "touch"
  events.move = "touchmove";
  events.end = "touchend";
  events.cancel = "touchcancel";
}

function draggable(e, callback = () => {}, bound_area, touch_action = "none") {
  if (e) {
    var initialX = 0, currentX = 0, initialY = 0, currentY = 0, offsetX = 0, offsetY = 0;
    var t_origin = [];

    function onAnimFrame() {
      offsetX = currentX - initialX;
      offsetY = currentY - initialY;
      if (bound_area) {
        applyBounds();
      }
      e.style.transform  = 'translate(' + (offsetX - t_origin[0]) + 'px, ' + (offsetY - t_origin[1]) + 'px)';
      requestAnimationFrame(callback);
    }

    function handleGestureMove(evt) {
      evt.preventDefault();
      [currentX, currentY] = getGesturePointFromEvent(evt);
      requestAnimationFrame(onAnimFrame);
    }

    function handleGestureEnd(evt) {
      evt.preventDefault();
      e.style.transition = "transform 0.3s ease-out";
      document.removeEventListener(events.move, handleGestureMove, true);
      document.removeEventListener(events.end, handleGestureEnd, true);
      document.removeEventListener(events.cancel, handleGestureEnd, true);
    }

    function handleGestureStart(evt) {
      evt.preventDefault();
      e.style.transition = "initial";
      t_origin = window.getComputedStyle(e).transformOrigin.split(" ").map(n=>parseFloat(n));
      [initialX, initialY] = getGesturePointFromEvent(evt, offsetX, offsetY);
      document.addEventListener(events.move, handleGestureMove, true);
      document.addEventListener(events.end, handleGestureEnd, true);
      document.addEventListener(events.cancel, handleGestureEnd, true);
    }

    function getGesturePointFromEvent(evt, xOffset = 0, yOffset = 0) {
      var x = 0, y = 0;
      if(evt.targetTouches) {
        x = evt.targetTouches[0].clientX;
        y = evt.targetTouches[0].clientY;
      } else {
        x = evt.clientX;
        y = evt.clientY;
      }
      return [x - xOffset, y - yOffset];
    }

    function applyBounds() {
      const barect = bound_area.getBoundingClientRect();
      const cstyle = window.getComputedStyle(e);
      const left = parseFloat(cstyle.left) + t_origin[0];
      const top = parseFloat(cstyle.top) + t_origin[1];
      const right = left - t_origin[0] * 2;
      const bottom = top - t_origin[1] * 2;
      if (offsetX + left > barect.right) {
        offsetX = barect.right - left;
      }
      if (offsetY + top > barect.bottom) {
        offsetY = barect.bottom - top;
      }
      if (offsetX + right < barect.left) {
        offsetX = barect.left - right;
      }
      if (offsetY + bottom < barect.top) {
        offsetY = barect.top - bottom;
      }
    }

    if (events.type === "pointer") {
      e.addEventListener('pointerdown', handleGestureStart, true);
    }
    else {
      e.addEventListener('touchstart', handleGestureStart, true);
      e.addEventListener('mousedown', handleGestureStart, true);
    }

    window.addEventListener("resize", () => {
      requestAnimationFrame(() => {
        applyBounds();
        e.style.transform  = 'translate(' + (offsetX - t_origin[0]) + 'px, ' + (offsetY - t_origin[1]) + 'px)';
        requestAnimationFrame(callback);
      });
    })
  }
}