function getSecondary(h, s, l) {
  while (l < 30) {l = Math.floor(Math.random() * 100);}
  h+=s; while (h>=360.0) h-=360.0; while (h<0.0) h+=360.0; return [h, s, l];
}

class Colour {
  constructor(h = randInt(360), s = randInt(), l = randInt(), secondary = new Colour(...getSecondary(h, s, l), null)
  ) {
    this.h = h;
    this.s = s;
    this.l = l;
    this.str = "hsl(" + h + ", " + s + "%, " + l + "%)";
    this.secondary = secondary;
    this.hex = HSLToHex(h, s, l);
  }
}

const container = document.querySelector(".container");
function loadBoxes() {
  for (let i = 0; i < 10; i++) {
    const wrapper = document.createElement("div");
    const box = document.createElement("div");
    const tl = document.createElement("span");
    const br = document.createElement("span");
    wrapper.className = "wrapper";
    box.className = "box";
    let c = new Colour();

    tl.style.color = (c.l < 50) ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.4)";
    br.style.color = (c.secondary.l < 50) ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.4)";
    tl.innerHTML = c.hex;
    br.innerHTML = c.secondary.hex;
    
    requestAnimationFrame(() => {
      box.style.backgroundImage = "linear-gradient(120deg, " + c.str + ", " + c.secondary.str + ")";
      box.style.animationDelay = (i * 80) + "ms";
      box.appendChild(tl);
      box.appendChild(br);
      wrapper.appendChild(box);
      container.appendChild(wrapper);
    });
  }
}

var scrollLim = document.body.offsetHeight;
window.addEventListener('scroll', function() {
  if ((window.innerHeight + window.scrollY) >= scrollLim) {
    scrollLim += document.body.offsetHeight;
    loadBoxes();
  }
});

loadBoxes();

function avg(...values) {
  let x = 0;
  for (let v of values) {
    x += v;
  }
  return x / values.length;
}
 function randInt(max = 100) {
   return Math.floor(Math.random() * max);
 }
//code by Jon Kantner from CSS-Tricks
  // https://css-tricks.com/converting-color-spaces-in-javascript/
  // https://codepen.io/jkantner/pen/VVEMRK
function HSLToHex(h, s, l) {
  s = s / 100,
  l = l / 100;

  if (h >= 360) {
    h %= 360;
  }
    
  let c = (1 - Math.abs(2 * l - 1)) * s,
    x = c * (1 - Math.abs((h / 60) % 2 - 1)),
    m = l - c/2,
    r = 0,
    g = 0,
    b = 0;
  
  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }
  // having obtained RGB, convert channels to hex
  r = Math.round((r + m) * 255).toString(16);
  g = Math.round((g + m) * 255).toString(16);
  b = Math.round((b + m) * 255).toString(16);
  
  // prepend 0s if necessary
  if (r.length == 1)
    r = "0" + r;
  if (g.length == 1)
    g = "0" + g;
  if (b.length == 1)
    b = "0" + b;
  
  return "#" + r + g + b;
}