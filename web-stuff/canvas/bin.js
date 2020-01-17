if (x > 0) {
  if (x < w - 1) { //centre
    heatmap[y][x+1] = val; //left
    heatmap[y][x+1] = val; //right
    if (y > 0) {
      heatmap[y-1][x] = val; //above
      if (y < h - 1) {
        heatmap[y+1][x] = val; //below
      }
    }
    else { //top right
      heatmap[y+1][x] = val; //below
    }
  }
  else { //right
    heatmap[y][x+1] = val; //left
    if (y > 0) {
      heatmap[y-1][x] = val; //above
      if (y < h - 1) {
        heatmap[y+1][x] = val; //below
      }
    }
    else { //top right
      heatmap[y+1][x] = val; //below
    }
  }
}
else { //left
  heatmap[y][x+1] = val; //right
  if (y > 0) {
    heatmap[y-1][x] = val; //above
    if (y < h - 1) {
      heatmap[y+1][x] = val; //below
    }
  }
  else { //top left
    heatmap[y+1][x] = val; //below
  }
}









//horizontal
if (x == 0) { //if left
  heatmap[y][x+1] = val; // spread right
} 
else {
  heatmap[y][x-1] = val; // spread left
  if (x < w - 1) { //if centre
    heatmap[y][x+1] = val; // spread right too
  }
}

//vertical
if (y == 0) { //if top
  heatmap[y+1][x] = val; // spread down
} 
else {
  heatmap[y-1][x] = val; // spread up
  if (y < h - 1) { //if middle
    heatmap[y+1][x] = val; //spread down too
  }
}