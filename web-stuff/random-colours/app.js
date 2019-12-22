class Colour {
  constructor(
    r = Math.floor(Math.random() * 256),
    g = Math.floor(Math.random() * 256),
    b = Math.floor(Math.random() * 256),
    inverted = new Colour(255-r, 255-g, 255-b, null)
  ) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.str = "rgb(" + r + ", " + g + ", " + b + ")";
    this.inverted = inverted;
  }
}

var colours = [new Colour(), new Colour(), new Colour(), new Colour()];

function changeBG(t, b) {
  t.style.backgroundImage = "linear-gradient(120deg, " + colours[0].inverted.str + ", " + colours[1].inverted.str + ")";
  b.style.backgroundImage = "linear-gradient(120deg, " + colours[0].str + ", " + colours[1].str + ")";
}

window.onload = () => {
  const b1 = document.body;
  const b2 = document.querySelector(".bg");
  const t1 = document.querySelector(".t1");
  const t2 = document.querySelector(".t2");
  var invis = false;
  setInterval(() => {
    if (invis) {
      requestAnimationFrame(() => {
        changeBG(t1, b1);
        t2.style.opacity = b2.style.opacity = "0";
      });
    } else {
      requestAnimationFrame(() => {
        changeBG(t2, b2);
        t2.style.opacity = b2.style.opacity = "1";
      });
    }
    invis = !invis;
    colours.shift();
    colours.push(new Colour(undefined, undefined, undefined, colours[1].inverted), new Colour());
  }, 1000);
};