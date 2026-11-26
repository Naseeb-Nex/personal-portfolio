// Pipeline step 4: one Jacobi iteration of the pressure solve.
//
// Finds the pressure field whose gradient cancels the divergence measured in step 3. Each pass
// averages the four neighbours minus the local divergence, so pressure spreads outward one texel
// per iteration — the sim runs this repeatedly (FLUID.pressureIterations) to let it propagate.

uniform sampler2D u_tPressure;
uniform sampler2D u_tDivergence;

varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;

void main() {
  // Neighbour taps need no clamping: the targets are ClampToEdge, so sampling past an edge
  // repeats the edge texel, which is the free-slip boundary this solve wants anyway.
  float L = texture2D(u_tPressure, vL).x;
  float R = texture2D(u_tPressure, vR).x;
  float T = texture2D(u_tPressure, vT).x;
  float B = texture2D(u_tPressure, vB).x;
  float C = texture2D(u_tPressure, vUv).x;
  float divergence = texture2D(u_tDivergence, vUv).x;
  float pressure = (L + R + B + T - divergence) * 0.25;
  gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
}