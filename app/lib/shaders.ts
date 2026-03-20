// Ashima Arts simplex noise (MIT) — textureless 3D
const SIMPLEX_NOISE_3D = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

  vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 105.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

const PARAMETRIC_SHAPES = /* glsl */ `
#define PI 3.14159265359
#define TAU 6.28318530718

// Torus knot centerline: (p,q) knot on a torus of radius R with amplitude a
vec3 knotCenter(float t, float p, float q, float R, float a) {
  return vec3(
    (R + a * cos(q * t)) * cos(p * t),
    (R + a * cos(q * t)) * sin(p * t),
    a * sin(q * t)
  );
}

// Torus knot with proper Frenet-frame tube sweep
vec3 torusKnotTube(vec2 uv, float p, float q, float R, float a, float tubeR) {
  float t = uv.x * TAU;
  float s = uv.y * TAU;

  // Centerline and tangent via finite difference
  float eps = 0.001;
  vec3 c = knotCenter(t, p, q, R, a);
  vec3 cNext = knotCenter(t + eps, p, q, R, a);
  vec3 cPrev = knotCenter(t - eps, p, q, R, a);

  vec3 tangent = normalize(cNext - cPrev);

  // Approximate normal: second derivative direction
  vec3 accel = cNext - 2.0 * c + cPrev;
  vec3 normal = normalize(accel - dot(accel, tangent) * tangent);

  // Binormal completes the frame
  vec3 binormal = cross(tangent, normal);

  // Sweep circle of radius tubeR around centerline
  return c + tubeR * (normal * cos(s) + binormal * sin(s));
}

vec3 torusShape(vec2 uv) {
  float u = uv.x * TAU;
  float v = uv.y * TAU;
  float R = 4.0;
  float r = 1.5;
  return vec3(
    (R + r * cos(v)) * cos(u),
    (R + r * cos(v)) * sin(u),
    r * sin(v)
  );
}

vec3 trefoilShape(vec2 uv) {
  return torusKnotTube(uv, 2.0, 3.0, 3.5, 1.8, 0.7);
}

// Enneper's minimal surface — saddle-flower with self-intersections
vec3 enneperShape(vec2 uv) {
  float u = uv.x * 4.0 - 2.0; // [-2, 2]
  float v = uv.y * 4.0 - 2.0;
  float sc = 1.2;
  return vec3(
    sc * (u - u*u*u / 3.0 + u*v*v),
    sc * (v - v*v*v / 3.0 + v*u*u),
    sc * (u*u - v*v)
  );
}

// Helpers for hyperbolic functions
float cosh_f(float x) { return (exp(x) + exp(-x)) * 0.5; }
float sinh_f(float x) { return (exp(x) - exp(-x)) * 0.5; }

// Dini's surface — twisted pseudosphere spiral
vec3 diniShape(vec2 uv) {
  float u = uv.x * 4.0 * PI; // [0, 4*PI]
  float v = uv.y * 1.8 + 0.15; // [0.15, 1.95] — avoid log singularity
  float a = 1.0;
  float b = 0.18;
  float sc = 3.0;
  return vec3(
    sc * a * cos(u) * sin(v),
    sc * a * sin(u) * sin(v),
    sc * (a * (cos(v) + log(tan(v * 0.5))) + b * u)
  );
}

// Breather surface — sine-Gordon soliton, undulating tube
vec3 breatherShape(vec2 uv) {
  float u = uv.x * 14.0 - 7.0; // [-7, 7]
  float v = uv.y * 30.0 - 15.0; // [-15, 15]
  float aa = 0.4;
  float wsqr = 1.0 - aa * aa;
  float w = sqrt(wsqr);
  float aau = aa * u;
  float wv = w * v;
  float ch = cosh_f(aau);
  float sh = sinh_f(aau);
  float t1 = w * ch;
  float t2 = aa * sin(wv);
  float denom = aa * (t1*t1 + t2*t2);
  float sc = 0.6;
  return vec3(
    sc * (-u + 2.0 * wsqr * ch * sh / denom),
    sc * (2.0 * w * ch * (-(w * cos(v) * cos(wv)) - sin(v) * sin(wv)) / denom),
    sc * (2.0 * w * ch * (-(w * sin(v) * cos(wv)) + cos(v) * sin(wv)) / denom)
  );
}

vec3 getShape(int id, vec2 uv) {
  if (id == 0) return torusShape(uv);
  if (id == 1) return trefoilShape(uv);
  if (id == 2) return enneperShape(uv);
  if (id == 3) return diniShape(uv);
  return breatherShape(uv);
}
`;

export const vertexShader = /* glsl */ `
${SIMPLEX_NOISE_3D}
${PARAMETRIC_SHAPES}

uniform float uTime;
uniform float uMorph;
uniform int uShapeA;
uniform int uShapeB;
uniform float uNoiseScale;
uniform float uDisplacement;
uniform vec3 uRayOrigin;
uniform vec3 uRayDir;
uniform float uMouseRadius;

varying vec3 vNormal;
varying vec3 vWorldPos;
varying float vDisplacement;

void main() {
  vec2 uvCoord = uv;
  float eps = 0.001;
  vec3 pos, posU, posV;

  // Early-out: skip shapeB evaluation when not morphing (~90% of runtime)
  if (uMorph < 0.001) {
    pos = getShape(uShapeA, uvCoord);
    posU = getShape(uShapeA, uvCoord + vec2(eps, 0.0));
    posV = getShape(uShapeA, uvCoord + vec2(0.0, eps));
  } else if (uMorph > 0.999) {
    pos = getShape(uShapeB, uvCoord);
    posU = getShape(uShapeB, uvCoord + vec2(eps, 0.0));
    posV = getShape(uShapeB, uvCoord + vec2(0.0, eps));
  } else {
    pos = mix(getShape(uShapeA, uvCoord), getShape(uShapeB, uvCoord), uMorph);
    posU = mix(getShape(uShapeA, uvCoord + vec2(eps, 0.0)), getShape(uShapeB, uvCoord + vec2(eps, 0.0)), uMorph);
    posV = mix(getShape(uShapeA, uvCoord + vec2(0.0, eps)), getShape(uShapeB, uvCoord + vec2(0.0, eps)), uMorph);
  }

  vec3 computedNormal = normalize(cross(posU - pos, posV - pos));

  // Noise displacement along normal
  float noise = snoise(pos * uNoiseScale + uTime * 0.25);
  float disp = noise * uDisplacement;
  pos += computedNormal * disp;

  // Mouse proximity: distance from vertex (in world space) to mouse ray
  vec3 worldPos = (modelMatrix * vec4(pos, 1.0)).xyz;
  vec3 toVertex = worldPos - uRayOrigin;
  float proj = dot(toVertex, uRayDir);
  vec3 closest = uRayOrigin + uRayDir * max(proj, 0.0);
  float rayDist = distance(worldPos, closest);
  float mouseInfluence = 1.0 - smoothstep(0.0, uMouseRadius, rayDist);
  pos += computedNormal * mouseInfluence * 0.5;

  vDisplacement = disp + mouseInfluence * 0.3;
  vNormal = normalize(normalMatrix * computedNormal);
  vWorldPos = worldPos;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

export const fragmentShader = /* glsl */ `
uniform vec3 uColor;
uniform float uTime;

varying vec3 vNormal;
varying vec3 vWorldPos;
varying float vDisplacement;

void main() {
  vec3 viewDir = normalize(cameraPosition - vWorldPos);

  // Depth-based fade: lines farther from camera dim out
  float depth = length(cameraPosition - vWorldPos);
  float depthFade = smoothstep(25.0, 8.0, depth);

  // Subtle fresnel for edge emphasis
  float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 1.8);

  vec3 color = uColor * (0.5 + depthFade * 0.5);
  color += fresnel * uColor * 0.6;

  // Slight opacity variation from displacement
  float alpha = (0.3 + depthFade * 0.7) * (0.7 + vDisplacement * 0.3);

  gl_FragColor = vec4(color, alpha);
}
`;
