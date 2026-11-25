uniform vec3 u_color;
uniform float u_debugPattern;

varying vec2 v_uv;

void main() {
  // diagonal ramp, bottom-left -> top-right
  float t = smoothstep(0.0, 1.0, v_uv.y * 0.5 + (1.0 - v_uv.x) * 0.5);
  vec3 color = mix(u_color, vec3(1.0), t - 0.3);

  /* ----------------------------------- dev ---------------------------------- */
  // checkerboard — makes the frosted transmission obvious while tuning
  if (u_debugPattern > 0.5) {
    vec2 c = step(0.5, fract(v_uv * 10.0));
    color = vec3(abs(c.x - c.y));
  }

  /* ---------------------------------- main ---------------------------------- */
  gl_FragColor = vec4(color, 1.0);
}
