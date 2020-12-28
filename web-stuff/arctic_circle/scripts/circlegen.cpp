#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <time.h>
#include <algorithm>

using namespace std;

extern "C" {
// int* generateDiamond(int A) {
//   int arr[A*A*4];
//   for (int y = 0; y < 2*A; y++) {
//     int off = A-y-1;
//     if (off < 0) off = abs(off + 1);
//     for (int x = off; x < 2*A-off; x++) {
//       arr[2*A*y + x] = 0;
//     }
//   }
//   return arr;
// }

int fillSquare(uint8_t* ptr, int width, int isBlack) {
  //printf("b: %d\n", isBlack);
  int arr1[4] = {255, 2, 4, 255};
  int arr2[4] = {255, 1, 3, 255};
  if ((uint8_t)rand() >> 7) {
  //if (true) {
    copy(arr1, arr1 + 2, ptr);
    copy(arr1 + 2, arr1 + 4, ptr + width);
  } else {
    copy(arr2, arr2 + 2, ptr);
    copy(arr2 + 2, arr2 + 4, ptr + width);
  }
  return 1;
}

int fillNewSquares(uint8_t* buf, int A, int currentA) {
  for (int y = 0; y < 2*(currentA+1)-1; y++) {
    int off = currentA-y;
    if (off < 0) off = abs(off + 1);
    for (int x = off; x < 2*(currentA+1)-1-off; x++) {
      int count = 0;
      int bx = (A-(currentA+1))+x;
      int by = (A-(currentA+1))+y;
      for (int sy = 0; sy < 2; sy++) {
        for (int sx = 0; sx < 2; sx++) {
          count += buf[2*A*(by+sy) + bx+sx];
          //printf("%d, %d: %d\n", by+sy, bx+sx, buf[2*A*(by+sy) + bx+sx]);
        }
      }
      if (count == 0) {
        fillSquare((uint8_t*)(buf + (2*A*by + bx)), 2*A, (2*A*by + bx) % 2);
        printf("filling: %d, %d\n", bx, by);
      }
    }
  }
  return 1;
}

int moveTile(uint8_t* buf, int x, int y, int A, int direction) {
  int secondaryX[4] = {-1, 0, 1, 0}; // == targetY[]
  int secondaryY[4] = {0, 1, 0, -1}; // == targetX[]
  int d = direction - 1;
  int target1 = buf[2*A*(y+secondaryX[d]) + x+secondaryY[d]];
  int target2 = buf[2*A*(y+secondaryX[d]+secondaryY[d]) + x+secondaryX[d]+secondaryY[d]];
  int pattern[4] = {-1, -1, 1, 1};
  int possibleLocations[6] = {secondaryY[d] * 2, secondaryX[d] * 2, secondaryX[d]+secondaryY[d], pattern[d], -pattern[d], secondaryX[d]+secondaryY[d]};
  printf("looking at: %d, %d to %d, %d (%d)\n", x, y, x+secondaryY[d], y+secondaryX[d], (d+1));
  if (target1 == 0 && target2 == 0) {
    printf("moving: %d, %d to %d, %d (%d)\n", x, y, x+secondaryY[d], y+secondaryX[d], (d+1));
    buf[2*A*(y+secondaryX[d]) + x+secondaryY[d]] = d + 5;
    buf[2*A*(y+secondaryX[d]+secondaryY[d]) + x+secondaryX[d]+secondaryY[d]] = 255;
    buf[2*A*y + x] = buf[2*A*(y+secondaryY[d]) + x+secondaryX[d]] = 0;
  }
  else {
    if (target1 > 0 && target1 < 5) {
      printf("trying to move: %d, %d (%d)\n", x+secondaryY[d], y+secondaryX[d], target1);
      moveTile(buf, x+secondaryY[d], y+secondaryX[d], A, target1);
      moveTile(buf, x, y, A, direction);
    } else if (target2 > 0 && target2 < 5) {
      printf("trying to move: %d, %d (%d)\n", x+secondaryX[d]+secondaryY[d], y+secondaryY[d]+secondaryX[d], target2);
      moveTile(buf, x+secondaryX[d]+secondaryY[d], y+secondaryY[d]+secondaryX[d], A, target2);
      moveTile(buf, x, y, A, direction);
    }  
    else if (target1 == 255) {
      printf("targeting: %d, %d\n", x+secondaryY[d], y+secondaryX[d]);
      for (int i = 0; i < 6; i+=2) {
        int possibleTarget = buf[2*A*(y+possibleLocations[i+1]) + x+possibleLocations[i]];
        printf("trying: %d, %d\n", x+possibleLocations[i], y+possibleLocations[i+1]);
        if (possibleTarget > 0 && possibleTarget < 5) {
          if (abs(target1-direction) == 2) fillSquare((uint8_t*)(buf + (2*A*y + x)), 2*A, (2*A*y + x) % 2);
          else moveTile(buf, x+possibleLocations[i], y+possibleLocations[i+1], A, possibleTarget);
          moveTile(buf, x, y, A, direction);
          break;
        }
      }
    } else if (target2 == 255) {
      printf("targeting: %d, %d\n", x+secondaryX[d]+secondaryY[d], y+secondaryX[d]+secondaryY[d]);
      for (int i = 0; i < 6; i+=2) {
        int possibleTarget2 = buf[2*A*(y+secondaryY[d]+possibleLocations[i+1]) + x+secondaryX[d]+possibleLocations[i]];
        printf("trying: %d, %d\n", x+possibleLocations[i], y+possibleLocations[i+1]);
        if (possibleTarget2 > 0 && possibleTarget2 < 5) {
          moveTile(buf, x+secondaryX[d]+possibleLocations[i], y+secondaryY[d]+possibleLocations[i+1], A, possibleTarget2);
          moveTile(buf, x, y, A, direction);
          break;
        }
      }
    }
  }
  return 1;
}

int processMovement(uint8_t* buf, int A, int currentA) {
  for (int y = 0; y < 2*currentA; y++) {
    for (int x = 0; x < 2*currentA; x++) {
      int bx = (A-currentA)+x;
      int by = (A-currentA)+y;
      int d = buf[2*A*by + bx];
      //printf("bbb %d, %d: %d\n", bx, by, d);
      if (d > 0 && d < 5) {
        moveTile(buf, bx, by, A, d);
      }
    }
  }
  for (int y = 0; y < A*2; y++) {
    for (int x = 0; x < A*2; x++) {
      int d = buf[2*A*y + x];
      if (d > 0 && d < 9) {
        buf[2*A*y + x] = ((d-1) % 4) + 1;
        //printf("%d, %d: %d %d\n", y, x, d, ((d-1) % 4) + 1);
      }
    }
  }
  return 1;
}

uint8_t generateCircle(uint8_t buf[], uint8_t A, uint8_t seed = 1) {
  srand(time(NULL));
  fillSquare((uint8_t*)(buf + 2*A*(A-1) + (A-1)), 2*A, 0);
  if (A > 1) {
    for (int currentA = 1; currentA < A; currentA++) {
      
      processMovement(buf, A, currentA);
      fillNewSquares(buf, A, currentA);
    }
  }
  return 1;
}

int main(int argc, char** argv) {
  // uint8_t A = atoi(argv[1]);
  // uint8_t buf[A*A*4] = {0};
  // generateCircle(buf, A, 5);
  printf("WASM Loaded.\n");
  return 1;
}

}

//emcc scripts/circlegen.cpp -o scripts/circlegen.js -O2 -s WASM=1 -s EXPORTED_FUNCTIONS="['_main','_generateCircle','_malloc','_free']"