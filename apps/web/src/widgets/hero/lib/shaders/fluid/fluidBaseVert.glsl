// Shared vertex shader for every fluid pass.
//
// Beyond the uv, it precomputes the four neighbour coordinates (left/right/top/bottom) that the
// finite-difference passes need. Doing it here rather than in each fragment shader means the
// interpolator hands them over for free instead of every fragment recomputing four offsets.

attribute vec2 position;

uniform vec2 u_texelSize;

varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;

void main() {
  vUv = position.xy * 0.5 + 0.5;
  vL = vUv - vec2(u_texelSize.x, 0.0);
  vR = vUv + vec2(u_texelSize.x, 0.0);
  vT = vUv + vec2(0.0, u_texelSize.y);
  vB = vUv - vec2(0.0, u_texelSize.y);
  gl_Position = vec4(position, 0.0, 1.0);
}