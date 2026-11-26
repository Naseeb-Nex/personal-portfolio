varying vec2 v_uv;

void main() {
  v_uv = uv;

  // fullscreen quad in clip space — ignore the camera so the bg stays fixed on screen
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
