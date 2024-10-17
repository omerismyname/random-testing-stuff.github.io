#version 300 es
precision highp float;
in vec3 aPosition;
in vec2 aUv;

out vec2 uv;
flat out vec2 imgPixelSize;
flat out vec2 kernelPixelSize;
flat out ivec2 kernelSize;
uniform sampler2D sampler;
uniform sampler2D kernel;

void main(){            
    ivec2 imgSize = textureSize(sampler, 0);
    imgPixelSize = vec2(1.0, 1.0) / vec2(imgSize);
    kernelSize = textureSize(kernel, 0);
    kernelPixelSize = vec2(1.0, 1.0) / vec2(kernelSize);
    gl_Position = vec4(aPosition, 1.0);
    uv = aUv;
}