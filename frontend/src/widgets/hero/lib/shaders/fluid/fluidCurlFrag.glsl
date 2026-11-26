// Pipeline step 1: curl (vorticity) of the velocity field — how much each texel is rotating.
//
// A plain finite-difference of the cross terms. Stored in R for the vorticity pass to read; on
// its own it changes nothing about the flow.

uniform sampler2D u_tVelocity;

varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;

void main() {
  float L = texture2D(u_tVelocity, vL).y;
  float R = texture2D(u_tVelocity, vR).y;
  float T = texture2D(u_tVelocity, vT).x;
  float B = texture2D(u_tVelocity, vB).x;
  float vorticity = R - L - T + B;
  gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
}