// Fades a field toward zero by a per-second factor. Used on pressure between frames so stale
// pressure does not accumulate across the Jacobi iterations of the next solve.

varying vec2 vUv;
uniform sampler2D u_tTexture;
uniform float u_value;
uniform float u_dt;
void main() {
  // u_value is a per-second dissipation factor; normalize by dt (×60 baseline) so the decay is
  // refresh-rate independent (exponent is 1 at 60fps, matching the previously tuned value).
  gl_FragColor.rgb = pow(u_value, u_dt * 60.0) * texture2D(u_tTexture, vUv).rgb;
  gl_FragColor.a = 1.0;
}