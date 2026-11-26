// Pipeline step 5: subtract the pressure gradient from velocity.
//
// This is the step that actually enforces incompressibility: it removes exactly the component of
// the flow that was pushing texels apart, leaving the field divergence-free.

uniform sampler2D u_tPressure;
uniform sampler2D u_tVelocity;

varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;

void main() {
  // see fluidPressureFrag: ClampToEdge targets give the free-slip boundary for free
  float L = texture2D(u_tPressure, vL).x;
  float R = texture2D(u_tPressure, vR).x;
  float T = texture2D(u_tPressure, vT).x;
  float B = texture2D(u_tPressure, vB).x;
  vec2 velocity = texture2D(u_tVelocity, vUv).xy;
  velocity.xy -= vec2(R - L, T - B);
  gl_FragColor = vec4(velocity, 0.0, 1.0);
}
