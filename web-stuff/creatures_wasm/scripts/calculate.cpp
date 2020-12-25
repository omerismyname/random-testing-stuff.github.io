#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <math.h>
#include <string.h>
#include <stdint.h>

using namespace std;

//double data[] = {1339.1763654126953, 361.8698760144772, -0.6484321492409022, -0.5454581590967654, 2, 66.68070167221343, 1377.7199615249006, 564.5512974487926, -2.0014546438057312, 0.8600008948211727, 1, 31.254096707803882, 740.9841842291198, 557.2499443732089, 1.5226117807237078, 1.570395434351274, 1, 159.4561538414792, 930.4394651987211, 334.8419600802426, 0.9058186841164303, 2.213201888034375, 1, 138.1345025953495, 1314.329368112562, 402.7479503367284, 0.7227671733494015, -1.4968368457150694, 2, 133.52713394465434, 1472.6946280890331, 119.3934085333108, -1.9166404906852215, -1.4225152241000139, 1, 246.46316245073342, 105.16245686374317, 251.97702308308027, -1.3467119752598595, 0.11874838871013826, 1, 286.7100108888654, 1586.9431911136332, 380.7405015820028, 0.8974752925094258, -1.0697983022324236, 2, 52.48843967475642, 512.1485963028958, 80.28516649144402, -0.5830035311136033, -1.427327431342582, 1, 351.71416288021976, 395.13770309967623, 286.090007277101, 0.32478831444629164, -0.6915626905895387, 1, 318.2441483440457};


//char mode[] = "creatures";

template <typename T> int sign(T val) {
  return (T(0) < val) - (val < T(0));
}
extern "C"{

int sum(int vals[], int len) {
  int temp;
  for (int i = 0; i < len; i++) {
    temp += vals[i];
  }
  return temp;
}

double min(double a, double b) {
  return (a > b) ? b : a;
}

double randomf() {
  return ((double) rand() / (RAND_MAX));
}

int calculate(char mode[], uint8_t buf[], int len) {
  srand(time(NULL));
  for (int i = 0; i < len; i++) {
    printf("%hhu %d aa\n", buf[i], len);
  }
  for (int i = 0; i < len; i+=6) {
    double newDX, newDY;
    if (strcmp(mode, "creatures") == 0) {
      newDX = ((randomf() - 0.5) / 2) + sign(buf[i+2]) * min(fabs(buf[i+2]), 2);
      newDY = ((randomf() - 0.5) / 2) + sign(buf[i+3]) * min(fabs(buf[i+3]), 2);
    } else if (strcmp(mode, "snow") == 0) {
      newDX = sign(buf[i+2]) * min(fabs(buf[i+2] - 0.02), 0.2) + (randomf() * 0.05 - 0.025);
      newDY = buf[i+3];
    }
    buf[i+0] += newDX;
    buf[i+1] += newDY;
    buf[i+2] = newDX;
    buf[i+3] = newDX;
  }
  return 0;
}
int main() {
  printf("working?\n");
  return 1;
}
}


//em++ calculate.cpp -o calculate.js -Os -s WASM=1 -s EXPORTED_FUNCTIONS="['_main','_calculate']"
//emcc scripts/calculate.cpp -o scripts/calculate.js -O2 -s WASM=1 -s EXPORTED_FUNCTIONS="['_main','_calculate']"