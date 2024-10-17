import { Application, Graphics } from "pixi.js";

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("webgl2");

const width = canvas.width;
const height = canvas.height;

const app = new Application();
await app.init({ width: 500, height: 500 });

const graphics = new Graphics().rect(0, 0, width, height).fill(0xff0000);
app.stage.addChild(graphics);


let iterationCounter = 0;

// initialise game
const game = new Uint8ClampedArray(width*height);
for (let i = 0; i < game.length; i++) {
  game[i] = (Math.random() > 0.5);
}

function gameLoop() {
  runGameIteration();
  displayGame();

  if (iterationCounter < 10) requestAnimationFrame(gameLoop);
  console.log(iterationCounter);
  iterationCounter++;
}

function runGameIteration() {

}

function displayGame() {
  // let imageArr = new Uint8ClampedArray(game.length*4);
  // for (let i = 0; i < game.length; i++) {
  //   imageArr[i*4+0] = game[i]*255;
  //   imageArr[i*4+1] = game[i]*255;
  //   imageArr[i*4+2] = game[i]*255;
  //   imageArr[i*4+3] = 255;
  // }
  // ctx.putImageData(new ImageData(imageArr, width, height), 0, 0);

  ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT);
  ctx.drawArrays(ctx.TRIANGLE_FAN, 0, 4);
}


// initialiseCanvas();
requestAnimationFrame(gameLoop);


function compileShader(context, text, type){
  const shader = context.createShader(type);
  context.shaderSource(shader, text);
  context.compileShader(shader);

  if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) {
      throw new Error(`Failed to compile shader: ${context.getShaderInfoLog(shader)}`);
  }
  return shader;
}

function compileProgram(context, vertexShader, fragmentShader){
  const program = context.createProgram();
  context.attachShader(program, vertexShader);
  context.attachShader(program, fragmentShader);
  context.linkProgram(program);

  if (!context.getProgramParameter(program, context.LINK_STATUS)) {
      throw new Error(`Failed to compile WebGL program: ${context.getProgramInfoLog(program)}`);
  }

  return program;
}

function initialiseCanvas() {
  const vertexShader = compileShader(ctx, `#version 300 es
  precision highp float;
  in vec2 aVertexPosition;
  in vec2 aTextureCoord;
  out vec2 uv;
  void main(){
      gl_Position = vec4(aVertexPosition, 0.0, 1.0);
      uv = aTextureCoord;
  }

  in vec2 aVertexPosition;
  in vec2 aTextureCoordinate;
  in vec4 aVertexColor;
  out vec2 vTextureCoordinate;
  out vec4 vColor;

  void main(){
      gl_Position = vec4(aVertexPosition, 0.0, 1.0);
      vTextureCoordinate = aTextureCoordinate;
      vColor = aVertexColor;
  }
  `, ctx.VERTEX_SHADER);
  const fragmentShader = compileShader(ctx, `#version 300 es
precision highp float;
in vec2 uv;

out vec4 glColor;
uniform sampler2D sampler;

void main(){
    float uSize = 1.0;
    float vSize = 1.0;
    vec3 tl = texture(sampler, uv + vec2(-uSize, -vSize)).rgb;
    vec3 tm = texture(sampler, uv + vec2(0.0, -vSize)).rgb;
    vec3 tr = texture(sampler, uv + vec2(uSize, -vSize)).rgb;
    vec3 ml = texture(sampler, uv + vec2(-uSize, 0.0)).rgb;
    // middle not added
    vec3 mr = texture(sampler, uv + vec2(uSize, 0.0)).rgb;
    vec3 bl = texture(sampler, uv + vec2(-uSize, vSize)).rgb;
    vec3 bm = texture(sampler, uv + vec2(0.0, vSize)).rgb;
    vec3 br = texture(sampler, uv + vec2(uSize, vSize)).rgb;
    vec3 sum =    tl + tm + tr + ml + mr + bl + bm + br;

    glColor = vec4(sum, 1.0);
}
  `, ctx.FRAGMENT_SHADER);
  const program = compileProgram(ctx, vertexShader, fragmentShader)
  createPositions(program);
  ctx.useProgram(program);
}

function createPositions(program) {
  const positionBuffer = ctx.createBuffer();
  ctx.bindBuffer(ctx.ARRAY_BUFFER, positionBuffer);
     const positions = new Float32Array([
      -1.0, -1.0,
      1.0, -1.0,
      1.0, 1.0,
      -1.0, 1.0
  ]);
  ctx.bufferData(ctx.ARRAY_BUFFER, positions, ctx.STATIC_DRAW);
  const positionLocation = ctx.getAttribLocation(program, "aVertexPosition");
  ctx.enableVertexAttribArray(positionLocation);
  ctx.vertexAttribPointer(positionLocation, 2, ctx.FLOAT, false, 0, 0);
}