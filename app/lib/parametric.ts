const PI = Math.PI;
const TAU = 2 * PI;

type Vec3 = [number, number, number];
type ShapeFn = (u: number, v: number) => Vec3;

function torusShape(u: number, v: number): Vec3 {
  const a = u * TAU;
  const b = v * TAU;
  const R = 4.0;
  const r = 1.5;
  return [
    (R + r * Math.cos(b)) * Math.cos(a),
    (R + r * Math.cos(b)) * Math.sin(a),
    r * Math.sin(b),
  ];
}

function knotCenter(t: number, p: number, q: number, R: number, a: number): Vec3 {
  return [
    (R + a * Math.cos(q * t)) * Math.cos(p * t),
    (R + a * Math.cos(q * t)) * Math.sin(p * t),
    a * Math.sin(q * t),
  ];
}

function trefoilShape(u: number, v: number): Vec3 {
  const p = 2.0;
  const q = 3.0;
  const R = 3.5;
  const a = 1.8;
  const tubeR = 0.7;

  const t = u * TAU;
  const s = v * TAU;
  const eps = 0.001;

  const c = knotCenter(t, p, q, R, a);
  const cNext = knotCenter(t + eps, p, q, R, a);
  const cPrev = knotCenter(t - eps, p, q, R, a);

  // Tangent
  const tx = cNext[0] - cPrev[0];
  const ty = cNext[1] - cPrev[1];
  const tz = cNext[2] - cPrev[2];
  const tLen = Math.sqrt(tx * tx + ty * ty + tz * tz);
  const tang = [tx / tLen, ty / tLen, tz / tLen];

  // Acceleration (second derivative approximation)
  const ax = cNext[0] - 2 * c[0] + cPrev[0];
  const ay = cNext[1] - 2 * c[1] + cPrev[1];
  const az = cNext[2] - 2 * c[2] + cPrev[2];

  // Normal: accel - dot(accel, tangent) * tangent
  const dot = ax * tang[0] + ay * tang[1] + az * tang[2];
  let nx = ax - dot * tang[0];
  let ny = ay - dot * tang[1];
  let nz = az - dot * tang[2];
  const nLen = Math.sqrt(nx * nx + ny * ny + nz * nz);
  nx /= nLen;
  ny /= nLen;
  nz /= nLen;

  // Binormal = tangent x normal
  const bx = tang[1] * nz - tang[2] * ny;
  const by = tang[2] * nx - tang[0] * nz;
  const bz = tang[0] * ny - tang[1] * nx;

  const cosS = Math.cos(s);
  const sinS = Math.sin(s);

  return [
    c[0] + tubeR * (nx * cosS + bx * sinS),
    c[1] + tubeR * (ny * cosS + by * sinS),
    c[2] + tubeR * (nz * cosS + bz * sinS),
  ];
}

function enneperShape(u: number, v: number): Vec3 {
  const uu = u * 4.0 - 2.0;
  const vv = v * 4.0 - 2.0;
  const sc = 1.2;
  return [
    sc * (uu - (uu * uu * uu) / 3.0 + uu * vv * vv),
    sc * (vv - (vv * vv * vv) / 3.0 + vv * uu * uu),
    sc * (uu * uu - vv * vv),
  ];
}

function diniShape(u: number, v: number): Vec3 {
  const uu = u * 4.0 * PI;
  const vv = v * 1.8 + 0.15;
  const a = 1.0;
  const b = 0.18;
  const sc = 3.0;
  return [
    sc * a * Math.cos(uu) * Math.sin(vv),
    sc * a * Math.sin(uu) * Math.sin(vv),
    sc * (a * (Math.cos(vv) + Math.log(Math.tan(vv * 0.5))) + b * uu),
  ];
}

function breatherShape(u: number, v: number): Vec3 {
  const uu = u * 14.0 - 7.0;
  const vv = v * 30.0 - 15.0;
  const aa = 0.4;
  const wsqr = 1.0 - aa * aa;
  const w = Math.sqrt(wsqr);
  const aau = aa * uu;
  const wv = w * vv;
  const ch = Math.cosh(aau);
  const sh = Math.sinh(aau);
  const t1 = w * ch;
  const t2 = aa * Math.sin(wv);
  const denom = aa * (t1 * t1 + t2 * t2);
  const sc = 1.0;
  return [
    sc * (-uu + (2.0 * wsqr * ch * sh) / denom),
    sc *
      ((2.0 * w * ch * (-(w * Math.cos(vv) * Math.cos(wv)) - Math.sin(vv) * Math.sin(wv))) / denom),
    sc *
      ((2.0 * w * ch * (-(w * Math.sin(vv) * Math.cos(wv)) + Math.cos(vv) * Math.sin(wv))) / denom),
  ];
}

const SHAPE_FUNCTIONS: ShapeFn[] = [
  torusShape,
  trefoilShape,
  enneperShape,
  diniShape,
  breatherShape,
];

function halton(index: number, base: number): number {
  let f = 1;
  let r = 0;
  let i = index;
  while (i > 0) {
    f /= base;
    r += f * (i % base);
    i = Math.floor(i / base);
  }
  return r;
}

export function sampleShapeTargets(shapeId: number, count: number, out: Float32Array): void {
  const shapeFn = SHAPE_FUNCTIONS[shapeId];
  for (let i = 0; i < count; i++) {
    const u = halton(i + 1, 2);
    const v = halton(i + 1, 3);
    const [x, y, z] = shapeFn(u, v);
    out[i * 3] = x;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = z;
  }
}
