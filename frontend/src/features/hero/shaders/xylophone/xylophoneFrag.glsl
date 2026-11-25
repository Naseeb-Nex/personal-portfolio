
/* -------------------------------- uniforms -------------------------------- */
// color interaction
uniform sampler2D u_tFluid;
uniform sampler2D u_tGradient;

uniform float u_fluidStrength;
uniform float u_tintStrength;
uniform float u_tintGlow;
uniform float u_tintWrap;

// background
uniform sampler2D u_tBackdrop;
uniform float u_transmission;
uniform float u_refractStrength;
uniform float u_fresnelPower;

// iridescent
uniform float u_iridStrength;
uniform float u_iridCycles;
uniform float u_iridShift;
uniform float u_iridPower;
uniform float u_iridBody;

/* -------------------------------- varyings -------------------------------- */
varying vec3 vNormal;
varying vec3 vWorldPos;
varying vec2 vScreenUv;
varying float vTintOffset;

const float PI = 3.141592653589793;

/* -------------------------------------------------------------------------- */
/*                                    look                                    */
/* -------------------------------------------------------------------------- */
// Fixed values behind the look. Anything a reader would want to sweep live is a uniform with a
// lil-gui binding instead; these are the ones that were dialled in once and left alone.

const vec3 LIGHT_DIR = vec3(0.4, 1.0, 0.35); // key light, above and slightly camera-right
const float AMBIENT_MIX = 0.6;               // ambient vs diffuse split (diffuse takes the rest)

const float FLUID_GATE_MAX = 0.2;   // fluid speed that counts as a full-strength hover
const float TINT_OPACITY_DROP = 0.6; // tinted bars go this much less transmissive, so colour reads

const float SHEEN_MIX = 0.35; // peak sheen blend at grazing angles
const float RIM_LIFT = 0.06;  // flat brightness added at the silhouette, to separate overlaps

/* -------------------------------------------------------------------------- */
/*                                 iridescence                                */
/* -------------------------------------------------------------------------- */
vec3 iridescence(float t) {
  return 0.5 + 0.5 * cos(2.0 * PI * (t + vec3(0.0, 0.33, 0.67)));
}

/* -------------------------------------------------------------------------- */
/*                          env sampling (edge sheen)                         */
/* -------------------------------------------------------------------------- */
/**
 * Ground -> horizon -> sky ramp, used for the fresnel edge sheen.
 *
 * This stands in for an environment map. The sheen is mixed in at 0.35 * fresnel and so only
 * reads at grazing angles, where a real HDR's detail is indistinguishable from a gradient —
 * not worth a megabyte of equirect texture.
 */
vec3 proceduralEnv(vec3 dir) {
  float t = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);
  vec3 ground = vec3(0.12, 0.12, 0.14);
  vec3 horizon = vec3(0.60, 0.62, 0.68);
  vec3 sky = vec3(0.95, 0.97, 1.0);
  return t < 0.5 ? mix(ground, horizon, t * 2.0) : mix(horizon, sky, (t - 0.5) * 2.0);
}

/* -------------------------------------------------------------------------- */
/*                                    main                                    */
/* -------------------------------------------------------------------------- */
void main() {
  // get normal
  vec3 N = normalize(vNormal);
  if (!gl_FrontFacing)
    N = -N;

  vec3 V = normalize(cameraPosition - vWorldPos);

  // soft lighting
  float diffuse = max(dot(N, normalize(LIGHT_DIR)), 0.0);
  vec3 ambLo = vec3(0.45, 0.46, 0.5); // ambient floor, lifted toward white as the normal points up
  vec3 ambient = mix(ambLo, vec3(1.0), N.y * 0.5 + 0.5);
  vec3 lighting = ambient * AMBIENT_MIX + diffuse * (1.0 - AMBIENT_MIX);

  // tint reveal
  float velocity = smoothstep(0.0, FLUID_GATE_MAX, length(texture2D(u_tFluid, vScreenUv).xy));
  float reveal = clamp(velocity * u_fluidStrength, 0.0, 1.0);
  vec3 tint = texture2D(u_tGradient, vec2(fract(vTintOffset * u_tintWrap), 0.5)).rgb;

  // white body on rest
  vec3 albedo = mix(vec3(1.0), tint, reveal * u_tintStrength);
  vec3 body = lighting * albedo;

  // add transmission
  vec2 buv = vScreenUv + N.xy * u_refractStrength;
  vec3 trans = texture2D(u_tBackdrop, buv).rgb;
  trans = mix(trans, tint, reveal);

  // blend backdrop through the body (less transmissive where the tint is revealed)
  vec3 frosted = mix(body, trans, u_transmission * (1.0 - TINT_OPACITY_DROP * reveal));

  // grazing-angle term shared by sheen and iridescence
  float edge = clamp(1.0 - max(dot(N, V), 0.0), 0.0, 1.0);
  float fres = pow(edge, u_fresnelPower);

  // add sheen
  vec3 sheen = proceduralEnv(reflect(-V, N));
  vec3 color = mix(frosted, sheen, fres * SHEEN_MIX);
  color += fres * RIM_LIFT;

  // add hover color
  color += tint * reveal * u_tintGlow;

  // strong rainbow at grazing edges
  float phase = edge * u_iridCycles + N.y * 0.5 + u_iridShift;
  vec3 irid = iridescence(phase);
  color += irid * (pow(edge, u_iridPower) * u_iridStrength + u_iridBody * edge);

  // main
  gl_FragColor = vec4(color, 1.0);
}
