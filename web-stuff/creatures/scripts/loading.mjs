import { loadTypes, Colour } from "./types.mjs";
import { loadCreatures, Dust } from "./Creatures.mjs";

export function load(app) {
  app.display.width = app.display.clientWidth;
  app.display.height = app.display.clientHeight;

  const size = Math.max(app.display.width, app.display.height);
  app.creatureLimit = size / 10;

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

  app.display.addEventListener("pointermove", e => {
    const range = app.creatureLimit;
    for (const c of app.creatures) {
      const xDiff = (c.x - e.clientX);
      const yDiff = (c.y - e.clientY);

      if (
        Math.abs(xDiff) < range &&
        Math.abs(yDiff) < range
      ) {
        const distance = Math.hypot(xDiff, yDiff);

        if (distance < range) {
          const strength = (1 - (distance / range));
          const adjustedStrength = strength * strength * 2;
          
          const dx = Math.sign(xDiff) * adjustedStrength;
          const dy = Math.sign(yDiff) * adjustedStrength;
          
          c.dx += (dx - c.dx) / (c.r * 5);
          c.dy += (dy - c.dy) / (c.r * 5);
        }
      }
    }
  });

  document.addEventListener("keydown", e => {
    if (e.code !== "Space") return;
    const strength = Math.floor(Math.random() * 4) + 3;
    for (let i = 0; i < strength; i++) {
      const d = new Dust(
        app.display.width / 2,
        app.display.height / 2,
        (((Math.random() + 0.5) * 40) / 10) - 4,
        (((Math.random() + 0.5) * 40) / 10) - 4
      );
      app.creatures.push(d);
    }
  });
}