import { loadTypes } from "./types.mjs";
import { loadCreatures, Dust } from "./Creatures.mjs";

export function load(app) {
  app.display.width = app.display.clientWidth;
  app.display.height = app.display.clientHeight;

  const size = Math.max(app.display.width, app.display.height);
  app.creatureLimit = 100 * (size / 2000);

  loadTypes(app);
  loadCreatures(app);

  app.display.addEventListener("click", e => {
    const strength = Math.floor(Math.random() * 4) + 3;
    for (let i = 0; i < strength; i++) {
      app.creatures.push(new Dust(
        e.clientX,
        e.clientY,
        (((Math.random() + 0.5) * 40) / 10) - 4,
        (((Math.random() + 0.5) * 40) / 10) - 4
      ));
    }
  });
}