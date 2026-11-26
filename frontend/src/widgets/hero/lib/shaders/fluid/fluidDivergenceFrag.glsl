// Pipeline step 3: divergence — net flow in or out of each texel.
//
// Incompressible fluid must have zero divergence everywhere; advection and the splat both break
// that. This measures the error so the pressure solve can correct it.

varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D u_tVelocity;

void main() {
  float L = texture2D(u_tVelocity, vL).x;
  float R = texture2D(u_tVelocity, vR).x;
  float T = texture2D(u_tVelocity, vT).y;
  float B = texture2D(u_tVelocity, vB).y;

  float div = 0.5 * (R - L + T - B);
  gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
}