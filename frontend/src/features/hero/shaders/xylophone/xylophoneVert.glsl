uniform float u_time;
uniform float u_spinSpeed;  // idle rotation
uniform float u_swingScale; // 0..1 global swing amount (0 under prefers-reduced-motion)
uniform vec3 u_swingAxis;   // local-space axis the strike swing rotates about

attribute vec3 aPos;
attribute vec4 aRot;
attribute float aTintOffset;
attribute float aStrikeTime; // u_time when this bar was last struck (-1e9 = never)

varying vec3 vNormal;
varying vec3 vWorldPos;
varying vec2 vScreenUv;
varying float vTintOffset;

// strike swing — damped pendulum
const float SWING_AMP = 0.58;   // peak swing angle (radians)
const float SWING_FREQ = 16.0;  // bob frequency (rad/s)
const float SWING_DECAY = 4.5;  // damping (1/s)

/* -------------------------------------------------------------------------- */
/*                                  rotation                                  */
/* -------------------------------------------------------------------------- */
vec3 rotateByQuat(vec3 v, vec4 q) {
  return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v);
}

vec4 qmul(vec4 a, vec4 b) {
  return vec4(a.w * b.xyz + b.w * a.xyz + cross(a.xyz, b.xyz), a.w * b.w - dot(a.xyz, b.xyz));
}

/* -------------------------------------------------------------------------- */
/*                                    main                                    */
/* -------------------------------------------------------------------------- */
void main() {
  // get rotation
  float a = u_time * u_spinSpeed * 0.5;
  vec4 spin = vec4(0.0, sin(a), 0.0, cos(a));
  vec4 rot = qmul(spin, aRot);

  // strike swing — damped pendulum about the bar's origin, decaying since aStrikeTime.
  // at rest (never struck) dt is huge, so env -> 0 and the pose is unchanged.
  float dt = u_time - aStrikeTime;
  float env = step(0.0, dt) * exp(-dt * SWING_DECAY);
  float ang = env * SWING_AMP * sin(dt * SWING_FREQ) * u_swingScale;
  float halfAng = ang * 0.5;
  vec4 swing = vec4(normalize(u_swingAxis) * sin(halfAng), cos(halfAng));
  rot = qmul(rot, swing);

  // update position
  vec3 transformedPos = aPos + rotateByQuat(position, rot);
  vec4 worldPos = modelMatrix * vec4(transformedPos, 1.0);

  // get normal
  vec3 rotatedNormal = rotateByQuat(normal, rot);

  // main
  gl_Position = projectionMatrix * viewMatrix * worldPos;

  // set normals
  vWorldPos = worldPos.xyz;
  vNormal = normalize(mat3(modelMatrix) * rotatedNormal);
  vScreenUv = gl_Position.xy / gl_Position.w * 0.5 + 0.5;
  vTintOffset = aTintOffset;
}
