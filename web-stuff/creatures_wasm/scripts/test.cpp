#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <math.h>
#include <string.h>
#include <stdint.h>

extern "C" {
int main() {
  printf("hello\n");
  return 1;
}
int add(int a, int b) {
  return a + b;
}
}

//emcc test.cpp -o test.js -Os -s WASM=1 -s EXPORTED_FUNCTIONS="['_main','_add', "_printf"]"