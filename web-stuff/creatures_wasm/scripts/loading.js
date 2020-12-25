import { generateParticle, generateInitialParticles } from "./particles.js";

export function load(app) {
  app.display.width = app.display.clientWidth;
  app.display.height = app.display.clientHeight;

  const size = Math.max(app.display.width, app.display.height);
  app.particleLimit = size / 10;

  app.display.addEventListener("pointerdown", e => {
    if (app.mode === "creatures" && e.pointerType === "mouse") {
      const newParticleCount = Math.floor(Math.random() * 4) + 3;
      for (let i = 0; i < newParticleCount; i++) {
        app.particles.push(...generateParticle(
          app.mode,
          app.display.width,
          app.display.height,
          e.clientX,
          e.clientY
        ));
      }
    } else {
      app.mode = (app.mode === "creatures") ? "snow" : "creatures";
      app.particles = [];
      generateInitialParticles(app);
    }
  });

  app.display.addEventListener("pointermove", e => {
    const range = app.particleLimit;
    for (let i = 0; i < app.particles.length; i+=6) {
      const xDiff = (app.particles[i+0] - e.clientX);
      const yDiff = (app.particles[i+1] - e.clientY);

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
          
          app.particles[i+2] += (dx - app.particles[i+2]) / (app.particles[i+4] * 5);
          if (app.mode === "creatures") {
            app.particles[i+3] += (dy - app.particles[i+3]) / (app.particles[i+4] * 5);
          }
        }
      }
    }
  });

  document.addEventListener("keydown", e => {
    if (e.code === "Space" && app.mode === "creatures") {
      const newParticleCount = Math.floor(Math.random() * 4) + 3;
      for (let i = 0; i < newParticleCount; i++) {
        app.particles.push(...generateParticle(
          app.mode,
          app.display.width,
          app.display.height,
          app.display.width / 2,
          app.display.height / 2
        ));
      }
    } else if (e.code === "Enter") {
      app.mode = (app.mode === "creatures") ? "snow" : "creatures";
      app.particles = [];
      generateInitialParticles(app);
    }
  });
}