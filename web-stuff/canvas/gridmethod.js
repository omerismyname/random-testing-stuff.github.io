function gridMethod(actions, player, bots) {
  const h = 10, w = 10;

  // generate grid as 2d array (based on number of tiles in each axis)

  let grid = new Array(h);
  for (let i = 0; i < h; i++) {grid[i] = new Array(w).fill(0)};

  // fill grid with number of bots in each tile

  for (const bot of bots) {
    const [posX, posY] = findPos(bot, h, w);
    grid[posY][posX]+=20;
  }
  
  // generate heatmap based on current grid

  const heatmap = generateHeatmap(grid, h, w);

  // find min value in heatmap -> target tile

  const [targetTileX, targetTileY] = getTargetTile(heatmap, h, w);
  
  // get player location

  const [playerPosX, playerPosY] = findPos(player, h, w);
  

  // return inputs based on player location in reference to target tile

  if (playerPosX < targetTileX) {actions.right = true;} else {actions.left = true;}
  if (playerPosY < targetTileY) {actions.down = true;} else {actions.up = true;}

  //console.log("player: ", [playerPosX, playerPosY], "target: ", [targetTileX, targetTileY]);
}

function findPos(movingRect, h, w) {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (
        movingRect.centreX > (canvas.width / w) * x &&
        movingRect.centreX < (canvas.width / w) * (x + 1) &&
        movingRect.centreY > (canvas.height / h) * y &&
        movingRect.centreY < (canvas.height / h) * (y + 1)
        ) {return [x, y];}
    } 
  }
  return [0,0];
}

function generateHeatmap(grid, h, w) {
  let heatmap = JSON.parse(JSON.stringify(grid));
  for (let n = 0; n < 20; n++) {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (heatmap[y][x] > 0) {
          const current = heatmap[y][x];

          //horizontal
          if (x == 0) { //if left
            setIfGreaterThanCurrent(heatmap, y, x+1, current); // spread right
          } 
          else {
            setIfGreaterThanCurrent(heatmap, y, x-1, current); // spread left
            if (x < w - 1) { //if centre
              setIfGreaterThanCurrent(heatmap, y, x+1, current); // spread right too
            }
          }

          //vertical
          if (y == 0) { //if top
            setIfGreaterThanCurrent(heatmap, y+1, x, current); // spread down
          } 
          else {
            setIfGreaterThanCurrent(heatmap, y-1, x, current); // spread up
            if (y < h - 1) { //if middle
              setIfGreaterThanCurrent(heatmap, y+1, x, current); //spread down too
            }
          }
        }
      } 
    }
  }
  console.log(grid, heatmap)
  return heatmap;
}

function setIfGreaterThanCurrent(heatmap, y, x, current) {
  if (heatmap[y][x] < current) {
    heatmap[y][x] = current - 1;
  }
}


function getTargetTile(heatmap, h, w) {
  let minArray = [];
  for (const arr of heatmap) {
    minArray.push(Math.min(...arr));
  }
  const lowestVal = Math.min(...minArray);
  
  //find position of lowestVal in heatmap
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (heatmap[y][x] == lowestVal) {return [x, y]}
    }
  }
  return [0,0];
}