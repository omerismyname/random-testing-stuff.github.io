const sections = document.querySelectorAll("section");
const bob = document.querySelector("nav ul .bob");
const gradients = {
  home: "linear-gradient(120deg, #f12711, #f5af19)",
  about: "linear-gradient(120deg, #373b44, #4286f4)",
  contact: "linear-gradient(120deg, #1f4037, #99f2c8)"
};
const anchors = {
  home: document.querySelector("nav li:nth-of-type(1) > a"),
  about: document.querySelector("nav li:nth-of-type(2) > a"),
  contact: document.querySelector("nav li:nth-of-type(3) > a")
};
let anchor = anchors["home"];

const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      bob.style.background = gradients[entry.target.id];
      anchor = anchors[entry.target.id];
      let abox = anchor.getBoundingClientRect();
      bob.style.width = abox.width + "px";
      bob.style.height = abox.height + "px";
      bob.style.left = abox.left + "px";
      bob.style.top = abox.top + "px";
      for (let i = 0; i < 3; i++) {
        bob.parentElement.children[i].firstElementChild.style.fontWeight = "";
      }
      anchor.style.fontWeight = "600";
    }
  }
}, {
  threshold: 0.7
});

for (const section of sections) {
  observer.observe(section);
}