import FastPoissonDiskSampling from 'fast-2d-poisson-disk-sampling';

export const initialGridTypes = {
  white_noise: {
    generate: generateWhiteNoise,
    displayText: "White Noise"
  },
  blue_noise: {
    generate: generateBlueNoise,
    displayText: "Blue Noise"
  },
  every_7th_pixel: {
    generate: generateEvery7thPixel,
    displayText: "Every 7th Pixel"
  }
};

export function generateInitialGrid(initialGridType, res) {
  return initialGridTypes[initialGridType].generate(res);
}

function generateWhiteNoise(res) {
  let arr = Array(res*res);
  for (let y = 0; y < res; y++) {
    for (let x = 0; x < res; x++) {
      arr[y*res+x] = Math.random() < 0.07;
    }
  }
  return arr;
}

function generateEvery7thPixel(res) {
  let arr = Array(res*res);
  for (let y = 0; y < res; y++) {
    for (let x = 0; x < res; x++) {
      arr[y*res+x] = (y*res+x)%7 === 0;
    }
  }
  return arr;
}

function generateBlueNoise(res) {
  let pds = new FastPoissonDiskSampling({
    shape: [res, res],
    radius: 2,
    tries: 30
  });
  let arr = Array(res*res).fill(false);
  let points = pds.fill();
  for (let p = 0; p < points.length; p++) {
    arr[Math.floor(points[p][1])*res+Math.floor(points[p][0])] = true;
  }
  return arr;
}