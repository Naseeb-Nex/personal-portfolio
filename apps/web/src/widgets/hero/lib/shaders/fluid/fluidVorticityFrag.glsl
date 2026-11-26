// Pipeline step 2: vorticity confinement — pushes velocity back along the curl gradient.
//
// A coarse grid bleeds angular momentum, so eddies flatten out within a frame or two. This adds
// the lost swirl back, which is what keeps the cursor wake curling instead of just smearing.
// Purely an aesthetic term: physically the solve is complete without it.

varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;

uniform sampler2D u_tVelocity;
uniform sampler2D u_tCurl;
uniform float u_curl;
uniform float u_dt;

void main() {
  float L = texture2D(u_tCurl, vL).x;
  float R = texture2D(u_tCurl, vR).x;
  float T = texture2D(u_tCurl, vT).x;
  float B = texture2D(u_tCurl, vB).x;
  float C = texture2D(u_tCurl, vUv).x;

  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  force /= length(force) + 0.0001;
  force *= u_curl * C;
  force.y *= -1.0;

  vec2 vel = texture2D(u_tVelocity, vUv).xy;
  vel += force * u_dt;

  // Clamp so a frame hitch (large u_dt) can't spike the field into a value that overflows the
  // half-float velocity target to Inf/NaN, which would poison the sim permanently.
  vel = clamp(vel, -1000.0, 1000.0);

  gl_FragColor = vec4(vel, 0.0, 1.0);
}