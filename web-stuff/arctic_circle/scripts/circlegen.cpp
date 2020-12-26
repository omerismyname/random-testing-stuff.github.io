#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <time.h>

using namespace std;

extern "C" {
uint8_t generateCircle(uint8_t buf[], uint8_t A, uint8_t seed = 1) {
  srand(seed);
  for (int y = 0; y < 2*A; y++) {
    int off = A-y-1;
    if (off < 0) off = abs(off + 1);
    for (int x = off; x < 2*A-off; x++) {
      buf[2*A*y + x + 0] = (uint8_t)((rand() % 3) + 1);
    }
  }
  return 1;
}

int main(int argc, char** argv) {
  // int A = atoi(argv[1]);
  // int buf[A*A*4];
  // printf("WASM Loaded.\n");
  // for (int y = 0; y < 2*A; y++) {
  //   int off = A-y-1;
  //   if (off < 0) off = abs(off + 1);
  //   for (int x = off; x < 2*A-off; x++) {
  //     buf[2*A*y + x] = 'A';
  //     printf("%d %d\n", y, x);
  //   }
  // }
  return 1;
}

}

//emcc scripts/circlegen.cpp -o scripts/circlegen.js -O2 -s WASM=1 -s EXPORTED_FUNCTIONS="['_main','_generateCircle','_malloc','_free']" -s EXPORTED_RUNTIME_METHODS="['ccall','cwrap']"