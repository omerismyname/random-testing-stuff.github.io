#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <time.h>
#include <algorithm>
#include <string.h>

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

int removeClashingTiles(uint8_t* buf, int A) {
  for (int y = 0; y < 2*A; y++) {
    for (int x = 0; x < 2*A; x++) {
      int direction = buf[2*A*y + x];
      if (direction > 0 && direction < 5) {
        int secondaryX[4] = {-1, 0, 1, 0}; // == targetY[]
        int secondaryY[4] = {0, 1, 0, -1}; // == targetX[]
        int d = direction - 1;
        int t2x = x+secondaryX[d]+secondaryY[d];
        int t2y = y+secondaryX[d]+secondaryY[d];
        int target2 = buf[2*A*(t2y) + t2x];
        if (target2 > 0 && target2 < 5 && abs(target2-direction) == 2) {
          printf("removed clashing tiles at %d, %d - %d, %d (%d, %d)\n", x, y, t2x, t2y, direction, target2);
          memset(buf + (2*A*y + x), 0, 2);
          memset(buf + (2*A*y + x) + 2*A, 0, 2);
        }
      }
    }
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

int calculateTileToSearchFor(int i, int d) {
  int offset = (d > 2) ? -1 : 1;
  int values[3] = {(2*(d%2)-1)+d, 2*offset*(d%2)+d, 2*offset*((d+1)%2)+d};
  return values[i];
}

// int moveTile(uint8_t* buf, int x, int y, int A, int direction, int checkFirst = 1) {
//   int sX[4] = {-1, 0, 1, 0}; // secondaryX == targetY[]
//   int sY[4] = {0, 1, 0, -1}; // secondaryY == targetX[]
//   int d = direction - 1;
//   int t1x = x+sY[d];
//   int t1y = y+sX[d];
//   int t2x = x+sX[d]+sY[d];
//   int t2y = y+sX[d]+sY[d];
//   int target1 = buf[2*A*(t1y) + t1x];
//   int target2 = buf[2*A*(t2y) + t2x];
//   int pattern[4] = {-1, -1, 1, 1};
//   int possibleLocations[6] = {sY[d] * 2, sX[d] * 2, sX[d]+sY[d], pattern[d], -pattern[d], sX[d]+sY[d]};
//   printf("looking at: %d, %d to %d, %d (%d)\n", x, y, t1x, t1y, direction);
//   if (target1 == 0 && target2 == 0) {
//     printf("moving: %d, %d to %d, %d (%d)\n", x, y, t1x, t1x, direction);
//     buf[2*A*t1y + t1x] = direction + 4;
//     buf[2*A*t2y + t2x] = 255;
//     buf[2*A*y + x] = buf[2*A*(y+sY[d]) + x+sX[d]] = 0;
//   }
//   else {
//     if (target1 > 0 && target1 < 5) {
//       printf("trying to move: %d, %d (%d) - 1\n", t1x, t1y, target1);
//       moveTile(buf, t1x, t1y, A, target1);
//       moveTile(buf, x, y, A, direction);
//     } else if (target2 > 0 && target2 < 5) {
//       printf("trying to move: %d, %d (%d) - 2\n", t2x, t2y, target2);
//       moveTile(buf, t2x, t2y, A, target2);
//       moveTile(buf, x, y, A, direction);
//     }
//     else {
//       int targetX = (target1 == 255) ? t1x : t2x;
//       int targetY = (target1 == 255) ? t1y : t2y;
//       int s = (target1 == 255) ? 0 : 1; // use secondary offset
//       printf("targeting: %d, %d as %d\n", targetX, targetY, direction);
//       for (int i = 0; i < 6; i+=2) {
//         int possibleTarget = buf[2*A*(y+s*sY[d]+possibleLocations[i+1]) + x+s*sX[d]+possibleLocations[i]];
//         printf("trying: %d, %d\n", x+s*sX[d]+possibleLocations[i], y+s*sY[d]+possibleLocations[i+1]);
//         printf("value is %d, looking for %d\n", possibleTarget, calculateTileToSearchFor(i/2, direction));
//         if (possibleTarget == calculateTileToSearchFor(i/2, direction)) {
//           moveTile(buf, x+s*sX[d]+possibleLocations[i], y+s*sY[d]+possibleLocations[i+1], A, possibleTarget);
//           moveTile(buf, x, y, A, direction);
//           return 1;
//         }
//       }
//       printf("ERROR: PLACE TO MOVE NOT FOUND\n");
//       return 0;
//     }
//     // else if (target1 == 255) {
//     //   printf("targeting: %d, %d\n", t1x, t1x);
//     //   for (int i = 0; i < 6; i+=2) {
//     //     int possibleTarget = buf[2*A*(y+possibleLocations[i+1]) + x+possibleLocations[i]];
//     //     printf("trying: %d, %d\n", x+possibleLocations[i], y+possibleLocations[i+1]);
//     //     if (possibleTarget > 0 && possibleTarget < 5) {
//     //       moveTile(buf, x+possibleLocations[i], y+possibleLocations[i+1], A, possibleTarget);
//     //       moveTile(buf, x, y, A, direction);
//     //       break;
//     //     }
//     //   }
//     // } else if (target2 == 255) {
//     //   printf("targeting: %d, %d\n", t2x, t2y);
//     //   for (int i = 0; i < 6; i+=2) {
//     //     int possibleTarget2 = buf[2*A*(y+secondaryY[d]+possibleLocations[i+1]) + x+secondaryX[d]+possibleLocations[i]];
//     //     printf("trying: %d, %d\n", x+possibleLocations[i], y+possibleLocations[i+1]);
//     //     if (possibleTarget2 > 0 && possibleTarget2 < 5) {
//     //       moveTile(buf, x+secondaryX[d]+possibleLocations[i], y+secondaryY[d]+possibleLocations[i+1], A, possibleTarget2);
//     //       moveTile(buf, x, y, A, direction);
//     //       break;
//     //     }
//     //   }
//     // }
//   }
//   return 1;
// }

int moveTile(uint8_t* buf, int x, int y, int A, int direction, int fillOldPrimary = 1, int fillOldSecondary = 1) {
  int sX[4] = {-1, 0, 1, 0}; // secondaryX == targetY[]
  int sY[4] = {0, 1, 0, -1}; // secondaryY == targetX[]
  int d = direction - 1;
  int t1x = x+sY[d];
  int t1y = y+sX[d];
  int t2x = x+sX[d]+sY[d];
  int t2y = y+sX[d]+sY[d];
  int target1 = buf[2*A*(t1y) + t1x];
  int target2 = buf[2*A*(t2y) + t2x];
  int pattern[4] = {-1, -1, 1, 1};
  int possibleLocations[6] = {sY[d] * 2, sX[d] * 2, sX[d]+sY[d], pattern[d], -pattern[d], sX[d]+sY[d]};
  printf("moving: %d, %d to %d, %d (%d)\n", x, y, t1x, t1y, direction);
  buf[2*A*t1y + t1x] = direction + 4;
  buf[2*A*t2y + t2x] = 255;
  if (fillOldPrimary == 1) printf("zeroing %d, %d\n", x, y);
  if (fillOldSecondary == 1) printf("zeroing %d, %d\n", x, y);
  if (fillOldPrimary == 1) buf[2*A*y + x] = 0;
  if (fillOldSecondary == 1) buf[2*A*(y+sY[d]) + x+sX[d]] = 0;
  int othersMoved = 0;
  if (target1 > 0 && target1 < 5) {
    printf("trying to move: %d, %d (%d) - p\n", t1x, t1y, target1);
    moveTile(buf, t1x, t1y, A, target1, 1, 0);
    othersMoved++;
  } 
  if (target2 > 0 && target2 < 5) {
    printf("trying to move: %d, %d (%d) - s\n", t2x, t2y, target2);
    moveTile(buf, t2x, t2y, A, target2, 0, 1);
    othersMoved++;
  }
  if (othersMoved == 2) return 1;
  if (target1 == 255 || target2 == 255) {
    int s = (target2 == 255); // use secondary offset
    for (int si = (target1 != 255); si < ((target1 == 255)+s); si++) {
      printf("targeting: %d, %d as %d\n", t1x, t1y, direction);
      for (int i = 0; i < 6; i+=2) {
        int possibleTarget = buf[2*A*(y+si*sY[d]+possibleLocations[i+1]) + x+si*sX[d]+possibleLocations[i]];
        printf("trying: %d, %d\n", x+si*sX[d]+possibleLocations[i], y+si*sY[d]+possibleLocations[i+1]);
        printf("value is %d, looking for %d\n", possibleTarget, calculateTileToSearchFor(i/2, direction));
        if (possibleTarget == calculateTileToSearchFor(i/2, direction)) {
          moveTile(buf, x+si*sX[d]+possibleLocations[i], y+si*sY[d]+possibleLocations[i+1], A, possibleTarget, ((1-si)+(target2 == 255))%2, ((1-si)+(target1 == 255))%2);
          return 1;
        }
      }
    }
    printf("ERROR: PLACE TO MOVE NOT FOUND\n");
    return 0;
  }
  return 1;
}

int processMovement(uint8_t* buf, int A, int currentA) {
  for (int y = 0; y < 2*currentA; y++) {
    for (int x = 0; x < 2*currentA; x++) {
      int bx = (A-currentA)+x;
      int by = (A-currentA)+y;
      int d = buf[2*A*by + bx];
      if (d > 0 && d < 5) {
        if (moveTile(buf, bx, by, A, d) == 0) {
          printf("ERROR ERROR ERROR\n");
          return 0;
        }
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
  srand(seed);
  fillSquare((uint8_t*)(buf + 2*A*(A-1) + (A-1)), 2*A, 0);
  if (A > 1) {
    for (int currentA = 1; currentA < A; currentA++) {
      removeClashingTiles(buf, A);
      if (processMovement(buf, A, currentA) == 0) {
        printf("AAAAAAAAAHHHH IT'S ALL FALLING APART - %d/%d\n", currentA, A);
        return 1;
      }
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