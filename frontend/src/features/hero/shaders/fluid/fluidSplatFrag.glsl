// Pipeline step 0 (input): injects the pointer's motion into the velocity field.
//
// Runs only when the cursor moved, before the solve. Everything downstream just redistributes
// what this writes, so with no pointer movement the field decays to nothing.

uniform sampler2D u_tTarget;
uniform float u_aspectRatio;
uniform vec3 u_splatColor;
uniform vec2 u_splatPosition;
uniform vec2 u_prevPoint;
uniform float u_splatRadius;

varying vec2 vUv;

void main() {
  // Splat along the swipe segment (u_prevPoint -> u_splatPosition) instead of a single point, so
  // fast strokes read as a continuous brush rather than a dotted trail of gaussian blobs. A
  // zero-length segment (new stroke) collapses to a point gaussian via the length guard below.
  vec2 uv = vUv;
  vec2 a = u_prevPoint;
  vec2 b = u_splatPosition;

  // aspect-correct x so the brush stays round rather than stretched
  uv.x *= u_aspectRatio;
  a.x *= u_aspectRatio;
  b.x *= u_aspectRatio;

  // closest point on segment [a, b] to this fragment, then gaussian falloff from that distance
  vec2 ab = b - a;
  float t = clamp(dot(uv - a, ab) / max(dot(ab, ab), 1e-6), 0.0, 1.0);
  vec2 p = uv - (a + t * ab);

  vec3 splat = exp(-dot(p, p) / (u_splatRadius / 50.0)) * u_splatColor;

  vec3 base = texture2D(u_tTarget, vUv).xyz;
  vec3 result = base + splat;

  gl_FragColor = vec4(result, 1.0);
}