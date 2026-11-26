// Glass G-buffer: view-space normal encoded in RGB, glass mask in A.
// Pairs with xylophoneVert.glsl (same per-instance spin/rotation), used as
// scene.overrideMaterial so the buffer matches the animated pose.
// `viewMatrix` is auto-provided by three's ShaderMaterial.

varying vec3 vNormal; // world-space normal from xylophoneVert

void main() {
  vec3 N = normalize(vNormal);

  // face the normal camera-ward on back faces (display material is DoubleSide)
  if (!gl_FrontFacing) N = -N;

  // view-space normal: xy is the screen-plane refraction direction
  vec3 viewN = normalize((viewMatrix * vec4(N, 0.0)).xyz);

  // rgb = encoded view normal, a = 1 marks glass (clear-color alpha 0 elsewhere)
  gl_FragColor = vec4(viewN * 0.5 + 0.5, 1.0);
}
