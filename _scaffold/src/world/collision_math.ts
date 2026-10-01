/**
 * Allocation-free geometry kernels shared by physics, rope and nav.
 * Shapes are plain numeric structs; results go into caller-owned scratch objects.
 *
 * OBB orientation matches `mesh.rotation.set(tilt, rotY, 0, 'YXZ')`, i.e. R = Ry(rotY) * Rx(tilt).
 * A positive tilt tips the box's top face toward local +Z, so the top surface rises toward -Z.
 */

export interface ObbShape {
  cx: number; cy: number; cz: number;
  hx: number; hy: number; hz: number;
  /** Rotation matrix columns = local axes in world space: u0 = m[0..2], u1 = m[3..5], u2 = m[6..8]. */
  m: Float64Array;
}

export interface CylShape { cx: number; cy: number; cz: number; r: number; hh: number }

export interface Contact {
  /** Unit normal pointing from the static shape toward the query shape. */
  nx: number; ny: number; nz: number;
  /** Penetration depth: > 0 overlapping, < 0 separated by -depth. */
  depth: number;
  /** Closest point on the static shape's surface. */
  px: number; py: number; pz: number;
}

export interface RaySpan {
  /** Entry / exit parameters along the (not necessarily unit) direction. tin < 0 means the origin is inside. */
  tin: number; tout: number;
  /** World normal of the entry face. */
  nx: number; ny: number; nz: number;
}

export const newContact = (): Contact => ({ nx: 0, ny: 1, nz: 0, depth: -Infinity, px: 0, py: 0, pz: 0 });
export const newRaySpan = (): RaySpan => ({ tin: 0, tout: 0, nx: 0, ny: 1, nz: 0 });

export const clamp = (v: number, lo: number, hi: number): number => (v < lo ? lo : v > hi ? hi : v);

export function setBasis(m: Float64Array, yaw: number, tilt: number): void {
  const cy = Math.cos(yaw), sy = Math.sin(yaw), ct = Math.cos(tilt), st = Math.sin(tilt);
  m[0] = cy; m[1] = 0; m[2] = -sy;
  m[3] = sy * st; m[4] = ct; m[5] = cy * st;
  m[6] = sy * ct; m[7] = -st; m[8] = cy * ct;
}

/** Half extents of the world AABB enclosing an OBB. */
export function obbExtentX(o: ObbShape): number { const m = o.m; return Math.abs(m[0]) * o.hx + Math.abs(m[3]) * o.hy + Math.abs(m[6]) * o.hz; }
export function obbExtentY(o: ObbShape): number { const m = o.m; return Math.abs(m[1]) * o.hx + Math.abs(m[4]) * o.hy + Math.abs(m[7]) * o.hz; }
export function obbExtentZ(o: ObbShape): number { const m = o.m; return Math.abs(m[2]) * o.hx + Math.abs(m[5]) * o.hy + Math.abs(m[8]) * o.hz; }

const GOLD = 0.6180339887498949;

// Local-space segment endpoints of the current query (module scratch; kernels are not re-entrant).
let A0 = 0, A1 = 0, A2 = 0, E0 = 0, E1 = 0, E2 = 0, BHX = 0, BHY = 0, BHZ = 0;

function boxDistSqAt(t: number): number {
  const x = A0 + E0 * t, y = A1 + E1 * t, z = A2 + E2 * t;
  const dx = x - clamp(x, -BHX, BHX), dy = y - clamp(y, -BHY, BHY), dz = z - clamp(z, -BHZ, BHZ);
  return dx * dx + dy * dy + dz * dz;
}

/**
 * Segment (capsule core a->b with radius r) against an oriented box. Pass a == b for a sphere.
 * Always fills `out`; check `out.depth`.
 */
export function segObb(
  ax: number, ay: number, az: number, bx: number, by: number, bz: number, r: number, o: ObbShape, out: Contact,
): void {
  const m = o.m;
  let dx = ax - o.cx, dy = ay - o.cy, dz = az - o.cz;
  const a0 = m[0] * dx + m[1] * dy + m[2] * dz, a1 = m[3] * dx + m[4] * dy + m[5] * dz, a2 = m[6] * dx + m[7] * dy + m[8] * dz;
  dx = bx - o.cx; dy = by - o.cy; dz = bz - o.cz;
  const b0 = m[0] * dx + m[1] * dy + m[2] * dz, b1 = m[3] * dx + m[4] * dy + m[5] * dz, b2 = m[6] * dx + m[7] * dy + m[8] * dz;
  const hx = o.hx, hy = o.hy, hz = o.hz;
  const e0 = b0 - a0, e1 = b1 - a1, e2 = b2 - a2;
  let px: number, py: number, pz: number;
  if (Math.abs(e0) < 1e-9 && Math.abs(e2) < 1e-9) {
    // Segment parallel to the box's local Y (untilted boxes, spheres): exact.
    px = a0; pz = a2;
    const y0 = a1 < b1 ? a1 : b1, y1 = a1 < b1 ? b1 : a1;
    py = y1 < -hy ? y1 : y0 > hy ? y0 : clamp(0, y0, y1);
  } else {
    // Distance to a convex set along a segment is convex in t: golden-section search.
    A0 = a0; A1 = a1; A2 = a2; E0 = e0; E1 = e1; E2 = e2; BHX = hx; BHY = hy; BHZ = hz;
    let lo = 0, hi = 1;
    let t1 = hi - GOLD * (hi - lo), t2 = lo + GOLD * (hi - lo);
    let f1 = boxDistSqAt(t1), f2 = boxDistSqAt(t2);
    for (let i = 0; i < 26; i++) {
      if (f1 <= f2) { hi = t2; t2 = t1; f2 = f1; t1 = hi - GOLD * (hi - lo); f1 = boxDistSqAt(t1); }
      else { lo = t1; t1 = t2; f1 = f2; t2 = lo + GOLD * (hi - lo); f2 = boxDistSqAt(t2); }
    }
    let t = (lo + hi) * 0.5;
    // Endpoints are frequent minimisers (feet on a ramp); snap to them when they are as good.
    const ft = boxDistSqAt(t);
    if (boxDistSqAt(0) <= ft + 1e-12) t = 0; else if (boxDistSqAt(1) <= ft + 1e-12) t = 1;
    px = a0 + e0 * t; py = a1 + e1 * t; pz = a2 + e2 * t;
  }
  let sx = clamp(px, -hx, hx), sy = clamp(py, -hy, hy), sz = clamp(pz, -hz, hz);
  let nx = px - sx, ny = py - sy, nz = pz - sz;
  const d2 = nx * nx + ny * ny + nz * nz;
  let depth: number;
  if (d2 > 1e-14) {
    const d = Math.sqrt(d2);
    nx /= d; ny /= d; nz /= d;
    depth = r - d;
  } else {
    // Core inside the box: least push that moves the whole segment out through one face.
    const mn0 = a0 < b0 ? a0 : b0, mx0 = a0 < b0 ? b0 : a0;
    const mn1 = a1 < b1 ? a1 : b1, mx1 = a1 < b1 ? b1 : a1;
    const mn2 = a2 < b2 ? a2 : b2, mx2 = a2 < b2 ? b2 : a2;
    depth = hy + r - mn1; nx = 0; ny = 1; nz = 0; // prefer up on ties
    let v = mx1 + hy + r; if (v < depth) { depth = v; nx = 0; ny = -1; nz = 0; }
    v = hx + r - mn0; if (v < depth) { depth = v; nx = 1; ny = 0; nz = 0; }
    v = mx0 + hx + r; if (v < depth) { depth = v; nx = -1; ny = 0; nz = 0; }
    v = hz + r - mn2; if (v < depth) { depth = v; nx = 0; ny = 0; nz = 1; }
    v = mx2 + hz + r; if (v < depth) { depth = v; nx = 0; ny = 0; nz = -1; }
    if (nx !== 0) sx = nx * hx; else if (ny !== 0) sy = ny * hy; else sz = nz * hz;
  }
  out.nx = m[0] * nx + m[3] * ny + m[6] * nz;
  out.ny = m[1] * nx + m[4] * ny + m[7] * nz;
  out.nz = m[2] * nx + m[5] * ny + m[8] * nz;
  out.px = o.cx + m[0] * sx + m[3] * sy + m[6] * sz;
  out.py = o.cy + m[1] * sx + m[4] * sy + m[7] * sz;
  out.pz = o.cz + m[2] * sx + m[5] * sy + m[8] * sz;
  out.depth = depth;
}

// Cylinder golden-section scratch.
let CX = 0, CY = 0, CZ = 0, CR = 0, CH = 0, SAX = 0, SAY = 0, SAZ = 0, SEX = 0, SEY = 0, SEZ = 0;

function cylDistSqAt(t: number): number {
  const x = SAX + SEX * t, y = SAY + SEY * t, z = SAZ + SEZ * t;
  const dy = y - clamp(y, CY - CH, CY + CH);
  const rx = x - CX, rz = z - CZ;
  const hd = Math.sqrt(rx * rx + rz * rz);
  const out = hd > CR ? hd - CR : 0;
  return out * out + dy * dy;
}

/** Segment (radius r) against a vertical cylinder. Pass a == b for a sphere. */
export function segCyl(
  ax: number, ay: number, az: number, bx: number, by: number, bz: number, r: number, c: CylShape, out: Contact,
): void {
  const top = c.cy + c.hh, bot = c.cy - c.hh;
  let px: number, py: number, pz: number;
  const y0 = ay < by ? ay : by, y1 = ay < by ? by : ay;
  if (Math.abs(ax - bx) < 1e-9 && Math.abs(az - bz) < 1e-9) {
    px = ax; pz = az;
    py = y0 > top ? y0 : y1 < bot ? y1 : clamp(c.cy, y0, y1);
  } else {
    CX = c.cx; CY = c.cy; CZ = c.cz; CR = c.r; CH = c.hh;
    SAX = ax; SAY = ay; SAZ = az; SEX = bx - ax; SEY = by - ay; SEZ = bz - az;
    let lo = 0, hi = 1;
    let t1 = hi - GOLD * (hi - lo), t2 = lo + GOLD * (hi - lo);
    let f1 = cylDistSqAt(t1), f2 = cylDistSqAt(t2);
    for (let i = 0; i < 26; i++) {
      if (f1 <= f2) { hi = t2; t2 = t1; f2 = f1; t1 = hi - GOLD * (hi - lo); f1 = cylDistSqAt(t1); }
      else { lo = t1; t1 = t2; f1 = f2; t2 = lo + GOLD * (hi - lo); f2 = cylDistSqAt(t2); }
    }
    const t = (lo + hi) * 0.5;
    px = ax + SEX * t; py = ay + SEY * t; pz = az + SEZ * t;
  }
  const rx = px - c.cx, rz = pz - c.cz;
  const hd = Math.sqrt(rx * rx + rz * rz);
  let qx = px, qz = pz;
  if (hd > c.r) { qx = c.cx + (rx / hd) * c.r; qz = c.cz + (rz / hd) * c.r; }
  const qy = clamp(py, bot, top);
  let nx = px - qx, ny = py - qy, nz = pz - qz;
  const d2 = nx * nx + ny * ny + nz * nz;
  if (d2 > 1e-14) {
    const d = Math.sqrt(d2);
    out.nx = nx / d; out.ny = ny / d; out.nz = nz / d;
    out.depth = r - d;
    out.px = qx; out.py = qy; out.pz = qz;
    return;
  }
  // Core inside: least of radial / up / down push.
  const ux = hd > 1e-9 ? rx / hd : 1, uz = hd > 1e-9 ? rz / hd : 0;
  let depth = top + r - y0; nx = 0; ny = 1; nz = 0;
  let sx = px, sy = top, sz = pz;
  let v = y1 - bot + r;
  if (v < depth) { depth = v; ny = -1; sy = bot; }
  v = c.r - hd + r;
  if (v < depth) { depth = v; nx = ux; ny = 0; nz = uz; sx = c.cx + ux * c.r; sy = py; sz = c.cz + uz * c.r; }
  out.nx = nx; out.ny = ny; out.nz = nz; out.depth = depth; out.px = sx; out.py = sy; out.pz = sz;
}

/** Segment (radius r) against a sphere. Normal points from the sphere toward the segment. */
export function segSphere(
  ax: number, ay: number, az: number, bx: number, by: number, bz: number, r: number,
  sx: number, sy: number, sz: number, sr: number, out: Contact,
): void {
  const ex = bx - ax, ey = by - ay, ez = bz - az;
  const ee = ex * ex + ey * ey + ez * ez;
  let t = ee > 1e-12 ? ((sx - ax) * ex + (sy - ay) * ey + (sz - az) * ez) / ee : 0;
  t = clamp(t, 0, 1);
  let nx = ax + ex * t - sx, ny = ay + ey * t - sy, nz = az + ez * t - sz;
  const d2 = nx * nx + ny * ny + nz * nz;
  let d = 0;
  if (d2 > 1e-14) { d = Math.sqrt(d2); nx /= d; ny /= d; nz /= d; } else { nx = 0; ny = 1; nz = 0; }
  out.nx = nx; out.ny = ny; out.nz = nz;
  out.depth = r + sr - d;
  out.px = sx + nx * sr; out.py = sy + ny * sr; out.pz = sz + nz * sr;
}

// ---- Box body (AABB) contacts ------------------------------------------------------------------

let satBest = 0, satDepth = 0, satNx = 0, satNy = 0, satNz = 0;
let satTx = 0, satTy = 0, satTz = 0, satAx = 0, satAy = 0, satAz = 0;
let satM: Float64Array = new Float64Array(9);
let satHx = 0, satHy = 0, satHz = 0;

function satAxis(lx: number, ly: number, lz: number, bias: number): boolean {
  const len2 = lx * lx + ly * ly + lz * lz;
  if (len2 < 1e-10) return true;
  const il = 1 / Math.sqrt(len2);
  lx *= il; ly *= il; lz *= il;
  const m = satM;
  const rA = satAx * Math.abs(lx) + satAy * Math.abs(ly) + satAz * Math.abs(lz);
  const rB = satHx * Math.abs(m[0] * lx + m[1] * ly + m[2] * lz)
    + satHy * Math.abs(m[3] * lx + m[4] * ly + m[5] * lz)
    + satHz * Math.abs(m[6] * lx + m[7] * ly + m[8] * lz);
  const dist = satTx * lx + satTy * ly + satTz * lz;
  const overlap = rA + rB - Math.abs(dist);
  if (overlap < 0) return false;
  if (overlap * bias < satBest) {
    satBest = overlap * bias;
    satDepth = overlap;
    const s = dist > 0 ? -1 : 1; // push A away from B
    satNx = lx * s; satNy = ly * s; satNz = lz * s;
  }
  return true;
}

/** Axis-aligned box (body) against an oriented box (static). Separating-axis MTV. Returns overlap. */
export function aabbObb(
  ax: number, ay: number, az: number, ahx: number, ahy: number, ahz: number, o: ObbShape, out: Contact,
): boolean {
  const m = o.m;
  satM = m; satHx = o.hx; satHy = o.hy; satHz = o.hz;
  satAx = ahx; satAy = ahy; satAz = ahz;
  satTx = o.cx - ax; satTy = o.cy - ay; satTz = o.cz - az;
  satBest = Infinity;
  out.depth = -1;
  // Face axes first; edge axes get a small bias so resting contacts stay on faces.
  if (!satAxis(0, 1, 0, 1) || !satAxis(1, 0, 0, 1) || !satAxis(0, 0, 1, 1)) return false;
  if (!satAxis(m[3], m[4], m[5], 1) || !satAxis(m[0], m[1], m[2], 1) || !satAxis(m[6], m[7], m[8], 1)) return false;
  for (let k = 0; k < 3; k++) {
    const ux = m[k * 3], uy = m[k * 3 + 1], uz = m[k * 3 + 2];
    // e_x cross u, e_y cross u, e_z cross u
    if (!satAxis(0, -uz, uy, 1.08)) return false;
    if (!satAxis(uz, 0, -ux, 1.08)) return false;
    if (!satAxis(-uy, ux, 0, 1.08)) return false;
  }
  out.nx = satNx; out.ny = satNy; out.nz = satNz;
  out.depth = satDepth;
  out.px = ax - satNx * (ahx * Math.abs(satNx) + ahy * Math.abs(satNy) + ahz * Math.abs(satNz));
  out.py = ay - satNy * (ahx * Math.abs(satNx) + ahy * Math.abs(satNy) + ahz * Math.abs(satNz));
  out.pz = az - satNz * (ahx * Math.abs(satNx) + ahy * Math.abs(satNy) + ahz * Math.abs(satNz));
  return true;
}

/** Axis-aligned box against a vertical cylinder. Returns overlap. */
export function aabbCyl(
  ax: number, ay: number, az: number, ahx: number, ahy: number, ahz: number, c: CylShape, out: Contact,
): boolean {
  const vy = Math.min(ay + ahy, c.cy + c.hh) - Math.max(ay - ahy, c.cy - c.hh);
  if (vy <= 0) return false;
  const qx = clamp(c.cx, ax - ahx, ax + ahx), qz = clamp(c.cz, az - ahz, az + ahz);
  const dx = qx - c.cx, dz = qz - c.cz;
  const hd = Math.sqrt(dx * dx + dz * dz);
  let radial: number, rnx: number, rnz: number;
  if (hd > 1e-9) {
    radial = c.r - hd;
    if (radial <= 0) return false;
    rnx = dx / hd; rnz = dz / hd;
  } else {
    // Cylinder axis inside the box footprint: slide the box off the axis through its nearest side.
    const pxPos = c.cx + c.r - (ax - ahx), pxNeg = ax + ahx - (c.cx - c.r);
    const pzPos = c.cz + c.r - (az - ahz), pzNeg = az + ahz - (c.cz - c.r);
    radial = pxPos; rnx = 1; rnz = 0;
    if (pxNeg < radial) { radial = pxNeg; rnx = -1; rnz = 0; }
    if (pzPos < radial) { radial = pzPos; rnx = 0; rnz = 1; }
    if (pzNeg < radial) { radial = pzNeg; rnx = 0; rnz = -1; }
  }
  if (vy < radial) {
    const up = ay > c.cy;
    out.nx = 0; out.ny = up ? 1 : -1; out.nz = 0; out.depth = vy;
    out.px = qx; out.py = up ? c.cy + c.hh : c.cy - c.hh; out.pz = qz;
  } else {
    out.nx = rnx; out.ny = 0; out.nz = rnz; out.depth = radial;
    out.px = c.cx + rnx * c.r; out.py = clamp(ay, c.cy - c.hh, c.cy + c.hh); out.pz = c.cz + rnz * c.r;
  }
  return true;
}

// ---- Rays -------------------------------------------------------------------------------------

/** Line vs OBB slab test. Returns false if the infinite line misses; otherwise fills tin/tout/normal. */
export function rayObbSpan(
  ox: number, oy: number, oz: number, dx: number, dy: number, dz: number, o: ObbShape, out: RaySpan,
): boolean {
  const m = o.m;
  const rx = ox - o.cx, ry = oy - o.cy, rz = oz - o.cz;
  let tin = -Infinity, tout = Infinity, axis = -1, sign = 0;
  for (let k = 0; k < 3; k++) {
    const i = k * 3;
    const lo = m[i] * rx + m[i + 1] * ry + m[i + 2] * rz;
    const ld = m[i] * dx + m[i + 1] * dy + m[i + 2] * dz;
    const h = k === 0 ? o.hx : k === 1 ? o.hy : o.hz;
    if (Math.abs(ld) < 1e-12) {
      if (lo < -h || lo > h) return false;
      continue;
    }
    const inv = 1 / ld;
    let t1 = (-h - lo) * inv, t2 = (h - lo) * inv;
    let s = -1; // entering through the -h face when moving along +axis
    if (t1 > t2) { const tt = t1; t1 = t2; t2 = tt; s = 1; }
    if (t1 > tin) { tin = t1; axis = k; sign = s; }
    if (t2 < tout) tout = t2;
    if (tin > tout) return false;
  }
  out.tin = tin; out.tout = tout;
  if (axis < 0) { out.nx = 0; out.ny = 1; out.nz = 0; }
  else { const i = axis * 3; out.nx = m[i] * sign; out.ny = m[i + 1] * sign; out.nz = m[i + 2] * sign; }
  return true;
}

/** Line vs vertical cylinder. */
export function rayCylSpan(
  ox: number, oy: number, oz: number, dx: number, dy: number, dz: number, c: CylShape, out: RaySpan,
): boolean {
  let tin = -Infinity, tout = Infinity, nx = 0, ny = 1, nz = 0;
  const rx = ox - c.cx, rz = oz - c.cz;
  const a = dx * dx + dz * dz;
  if (a < 1e-14) {
    if (rx * rx + rz * rz > c.r * c.r) return false;
  } else {
    const b = rx * dx + rz * dz, cc = rx * rx + rz * rz - c.r * c.r;
    const disc = b * b - a * cc;
    if (disc < 0) return false;
    const s = Math.sqrt(disc);
    tin = (-b - s) / a; tout = (-b + s) / a;
    const hx = rx + dx * tin, hz = rz + dz * tin, hl = Math.sqrt(hx * hx + hz * hz) || 1;
    nx = hx / hl; ny = 0; nz = hz / hl;
  }
  const top = c.cy + c.hh, bot = c.cy - c.hh;
  if (Math.abs(dy) < 1e-12) {
    if (oy < bot || oy > top) return false;
  } else {
    let t1 = (bot - oy) / dy, t2 = (top - oy) / dy, s = -1;
    if (t1 > t2) { const tt = t1; t1 = t2; t2 = tt; s = 1; }
    if (t1 > tin) { tin = t1; nx = 0; ny = s; nz = 0; }
    if (t2 < tout) tout = t2;
  }
  if (tin > tout) return false;
  out.tin = tin; out.tout = tout; out.nx = nx; out.ny = ny; out.nz = nz;
  return true;
}

export function raySphereSpan(
  ox: number, oy: number, oz: number, dx: number, dy: number, dz: number,
  cx: number, cy: number, cz: number, r: number, out: RaySpan,
): boolean {
  const rx = ox - cx, ry = oy - cy, rz = oz - cz;
  const a = dx * dx + dy * dy + dz * dz;
  if (a < 1e-14) return false;
  const b = rx * dx + ry * dy + rz * dz, c = rx * rx + ry * ry + rz * rz - r * r;
  const disc = b * b - a * c;
  if (disc < 0) return false;
  const s = Math.sqrt(disc);
  const tin = (-b - s) / a;
  out.tin = tin; out.tout = (-b + s) / a;
  out.nx = (rx + dx * tin) / r; out.ny = (ry + dy * tin) / r; out.nz = (rz + dz * tin) / r;
  return true;
}

export function rayAabbSpan(
  ox: number, oy: number, oz: number, dx: number, dy: number, dz: number,
  cx: number, cy: number, cz: number, hx: number, hy: number, hz: number, out: RaySpan,
): boolean {
  let tin = -Infinity, tout = Infinity, axis = -1, sign = 0;
  for (let k = 0; k < 3; k++) {
    const lo = k === 0 ? ox - cx : k === 1 ? oy - cy : oz - cz;
    const ld = k === 0 ? dx : k === 1 ? dy : dz;
    const h = k === 0 ? hx : k === 1 ? hy : hz;
    if (Math.abs(ld) < 1e-12) {
      if (lo < -h || lo > h) return false;
      continue;
    }
    let t1 = (-h - lo) / ld, t2 = (h - lo) / ld, s = -1;
    if (t1 > t2) { const tt = t1; t1 = t2; t2 = tt; s = 1; }
    if (t1 > tin) { tin = t1; axis = k; sign = s; }
    if (t2 < tout) tout = t2;
    if (tin > tout) return false;
  }
  out.tin = tin; out.tout = tout;
  out.nx = axis === 0 ? sign : 0; out.ny = axis === 1 ? sign : axis < 0 ? 1 : 0; out.nz = axis === 2 ? sign : 0;
  return true;
}
