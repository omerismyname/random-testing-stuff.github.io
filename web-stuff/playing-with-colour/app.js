function randInt(max = 100) {
  return Math.floor(Math.random() * max);
}

class Colour {
  constructor(h = Math.floor(randInt(360) / 10) * 10, s = randInt(), l = randInt()) {
    this.h = h;
    this.s = s;
    this.l = l;
    this.str = "hsl(" + h + ", " + s + "%, " + l + "%)";
    this.getSecondary = () => {
      var h2 = this.h - 180;
      if (h2 < 0) {h2 += 360};
      return new Colour(h2, this.s, this.l);
    };
    this.toTertiary = (h2 = this.h, s = this.s, l = this.l) => {
      if (h2 < 0) {h2 += 360};
      if (h2 <= 120) {
        h2 *= 1.5;
      } else if (h2 <= 240) {
        h2 = ((h - 120) * 0.75) + 180;
      } else {
        h2 = ((h - 240) * 0.75) + 270;
      }
      h2 = Math.floor(h2 * 100) / 100;
      return new Colour(h2, s, l);
    };
    this.fromTertiary = (h2 = this.h, s = this.s, l = this.l) => {
      if (h2 < 0) {h2 += 360};
      if (h2 <= 180) {
        h2 /= 1.5;
      } else if (h2 <= 270) {
        h2 = ((h - 180) / 0.75) + 120;
      } else {
        h2 = ((h - 270) / 0.75) + 240;
      }
      h2 = Math.floor(h2 * 100) / 100;
      return new Colour(h2, s, l);
    };
    this.getTertiary = () => {
      var h2 = this.fromTertiary(this.toTertiary().h + 180).h;
      rbox2.firstElementChild.innerHTML = h2 + "<br />";
      return new Colour(h2, this.s, this.l);
    };
  }
}

var lbox = document.querySelector(".lbox");
var rbox = document.querySelector(".rbox");
var rbox2 = document.querySelector(".rbox:last-of-type");

var c = new Colour(undefined, 100, 79);
lbox.firstElementChild.innerHTML = lbox.style.background = c.str;
rbox.firstElementChild.innerHTML = rbox.style.background = c.getSecondary().str;
rbox2.style.background = c.getTertiary().str;
rbox2.firstElementChild.innerHTML += c.getTertiary().str;