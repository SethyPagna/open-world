/**
 * Render kit: procedural, stylized environment pieces with matching physics colliders.
 *
 *   const kit = new Kit(roomRoot, paletteFor('well', 'A'), physics, { seed });
 *   kit.floor({ radius: 11, innerRadius: 4.2 });
 *   kit.roundWell({ radius: 11, height: 16, openings: [{ angle: Math.PI / 2, width: 3, height: 4.2 }] });
 *   kit.door({ at: ..., rotY: ..., label: '1A', letter: 'A' });
 *   kit.finalize();          // merge static geometry: one draw call per material
 *   kit.update(t);           // flicker, sway, shader clock
 *   kit.dispose();           // geometry, own materials, lights, colliders
 *
 * Every builder takes { at, rotY, parent } (at = base/floor point), returns a THREE.Group, and, when a
 * PhysicsWorld is given, registers colliders (kept in group.userData.colliders). Static meshes are
 * vertex-coloured (palette colour, per-piece jitter, baked base AO) over shared materials; finalize()
 * merges them per material. Pieces meant to move (door leaves, levers, plates, valves, bells, fork
 * glows) are "dynamic": never merged, exposed via group.userData.
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import type { ColliderTag, PhysicsWorld, StaticCollider } from '../core/api.ts';
import { LETTER_ACCENTS, adjustHsl, mixHex, shadeHex, type Palette, type RoomLetter } from './palettes.ts';
import { MaterialLibrary, uvMetersFor, tickMaterials, lightShaftMaterial, motesMaterial, type MaterialName } from './materials.ts';
import { mulberry32, glowSprite } from './textures.ts';
import { createWater, type WaterHandle } from './water.ts';
import { flicker } from './lighting.ts';

export type P3 = THREE.Vector3 | readonly [number, number, number];
export interface Place {
  at?: P3;
  rotY?: number;
  parent?: THREE.Object3D;
  /** Keep this piece out of finalize() merging (e.g. a platform you will move). */
  dynamic?: boolean;
}

export interface KitOptions {
  seed?: number;
  /** Share a library across kits; otherwise the kit owns one and disposes it. */
  materials?: MaterialLibrary;
  /** Max point lights the kit will create (extra lanterns stay emissive-only). */
  maxLights?: number;
  shadows?: boolean;
}

export interface KitStats {
  meshes: number; merged: number; instanced: number; dynamic: number; drawables: number;
  triangles: number; colliders: number; lights: number; materials: number;
}

// ---------------------------------------------------------------------------------------------
// Geometry helpers (pure)
// ---------------------------------------------------------------------------------------------
const TAU = Math.PI * 2;
const _v = new THREE.Vector3();
const _n = new THREE.Vector3();
const _m3 = new THREE.Matrix3();

const WHITE = new THREE.Color(1, 1, 1);
const sstep = (a: number, b: number, x: number): number => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export function toV3(p?: P3): THREE.Vector3 {
  if (!p) return new THREE.Vector3();
  return p instanceof THREE.Vector3 ? p.clone() : new THREE.Vector3(p[0], p[1], p[2]);
}

/** rotation.y that turns local +Z toward direction (dx, dz). */
export function yawToward(dx: number, dz: number): number {
  return Math.atan2(dx, dz);
}

export function rbox(w: number, h: number, d: number, r = 0.05, seg = 1): THREE.BufferGeometry {
  return new RoundedBoxGeometry(w, h, d, seg, Math.max(0.001, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001)));
}

export function hash3(x: number, y: number, z: number, seed: number): number {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(z | 0, 2147483647) ^ Math.imul(seed | 0, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

export function noise3(x: number, y: number, z: number, seed: number): number {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const s = (t: number) => t * t * (3 - 2 * t);
  const u = s(x - xi), v = s(y - yi), w = s(z - zi);
  const l = (a: number, b: number, t: number) => a + (b - a) * t;
  const h = (dx: number, dy: number, dz: number) => hash3(xi + dx, yi + dy, zi + dz, seed);
  return l(l(l(h(0, 0, 0), h(1, 0, 0), u), l(h(0, 1, 0), h(1, 1, 0), u), v), l(l(h(0, 0, 1), h(1, 0, 1), u), l(h(0, 1, 1), h(1, 1, 1), u), v), w);
}

/** Convert to non-indexed with per-face normals (faceted, stylized). */
export function flatten(g: THREE.BufferGeometry): THREE.BufferGeometry {
  const f = g.index ? g.toNonIndexed() : g;
  if (f !== g) g.dispose();
  f.deleteAttribute('normal');
  f.computeVertexNormals();
  return f;
}

/** Box-projected UVs (in metres / `meters`) using positions/normals transformed by `m`. */
export function projectUVs(g: THREE.BufferGeometry, meters: number, m?: THREE.Matrix4): void {
  const pos = g.attributes.position;
  let nor = g.attributes.normal;
  if (!nor) {
    g.computeVertexNormals();
    nor = g.attributes.normal;
  }
  const uv = new Float32Array(pos.count * 2);
  if (m) _m3.getNormalMatrix(m);
  const inv = 1 / meters;
  for (let i = 0; i < pos.count; i++) {
    _v.fromBufferAttribute(pos, i);
    _n.fromBufferAttribute(nor, i);
    if (m) {
      _v.applyMatrix4(m);
      _n.applyMatrix3(_m3);
    }
    const ax = Math.abs(_n.x), ay = Math.abs(_n.y), az = Math.abs(_n.z);
    let u: number, w: number;
    if (ay >= ax && ay >= az) { u = _v.x; w = _v.z; }
    else if (ax >= az) { u = _v.z * Math.sign(_n.x || 1); w = _v.y; }
    else { u = -_v.x * Math.sign(_n.z || 1); w = _v.y; }
    uv[i * 2] = u * inv;
    uv[i * 2 + 1] = w * inv;
  }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
}

/**
 * Vertical prism from a convex polygon in XZ, y from 0 to h, with chamfered top (and optionally bottom)
 * edges. `smooth` averages side normals (round shapes).
 */
export function prism(pts: readonly THREE.Vector2[], h: number, bevel = 0.04, o: { bottomBevel?: boolean; bottom?: boolean; smooth?: boolean } = {}): THREE.BufferGeometry {
  const n = pts.length;
  const cx = pts.reduce((s, p) => s + p.x, 0) / n, cz = pts.reduce((s, p) => s + p.y, 0) / n;
  // Outward edge normals.
  const en: THREE.Vector2[] = [];
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % n];
    const e = new THREE.Vector2(b.y - a.y, -(b.x - a.x)).normalize();
    const mid = new THREE.Vector2((a.x + b.x) / 2 - cx, (a.y + b.y) / 2 - cz);
    if (e.dot(mid) < 0) e.negate();
    en.push(e);
  }
  const inset: THREE.Vector2[] = [];
  const vn: THREE.Vector2[] = [];
  for (let i = 0; i < n; i++) {
    const n1 = en[(i - 1 + n) % n], n2 = en[i];
    const mdir = n1.clone().add(n2);
    if (mdir.lengthSq() < 1e-8) mdir.copy(n2);
    mdir.normalize();
    vn.push(mdir.clone());
    const d = bevel / Math.max(0.25, mdir.dot(n2));
    inset.push(pts[i].clone().addScaledVector(mdir, -d));
  }
  const b = Math.min(bevel, h * 0.45);
  const yTop = h, ySide1 = h - b, ySide0 = o.bottomBevel ? b : 0;
  const P: number[] = [], N: number[] = [];
  const tri = (a: THREE.Vector3, bb: THREE.Vector3, c: THREE.Vector3, na: THREE.Vector3, nb: THREE.Vector3, nc: THREE.Vector3, want: THREE.Vector3) => {
    const cr = new THREE.Vector3().subVectors(bb, a).cross(new THREE.Vector3().subVectors(c, a));
    if (cr.dot(want) < 0) {
      P.push(a.x, a.y, a.z, c.x, c.y, c.z, bb.x, bb.y, bb.z);
      N.push(na.x, na.y, na.z, nc.x, nc.y, nc.z, nb.x, nb.y, nb.z);
    } else {
      P.push(a.x, a.y, a.z, bb.x, bb.y, bb.z, c.x, c.y, c.z);
      N.push(na.x, na.y, na.z, nb.x, nb.y, nb.z, nc.x, nc.y, nc.z);
    }
  };
  const V = (p: THREE.Vector2, y: number) => new THREE.Vector3(p.x, y, p.y);
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const ni = o.smooth ? new THREE.Vector3(vn[i].x, 0, vn[i].y) : new THREE.Vector3(en[i].x, 0, en[i].y);
    const nj = o.smooth ? new THREE.Vector3(vn[j].x, 0, vn[j].y) : ni;
    const want = new THREE.Vector3(en[i].x, 0, en[i].y);
    // Side
    tri(V(pts[i], ySide0), V(pts[j], ySide0), V(pts[j], ySide1), ni, nj, nj, want);
    tri(V(pts[i], ySide0), V(pts[j], ySide1), V(pts[i], ySide1), ni, nj, ni, want);
    // Top chamfer
    if (b > 0) {
      const ci = ni.clone().setY(1).normalize(), cj = nj.clone().setY(1).normalize();
      const wc = want.clone().setY(1).normalize();
      tri(V(pts[i], ySide1), V(pts[j], ySide1), V(inset[j], yTop), ci, cj, cj, wc);
      tri(V(pts[i], ySide1), V(inset[j], yTop), V(inset[i], yTop), ci, cj, ci, wc);
      if (o.bottomBevel) {
        const di = ni.clone().setY(-1).normalize(), dj = nj.clone().setY(-1).normalize();
        const wd = want.clone().setY(-1).normalize();
        tri(V(inset[i], 0), V(inset[j], 0), V(pts[j], ySide0), di, dj, dj, wd);
        tri(V(inset[i], 0), V(pts[j], ySide0), V(pts[i], ySide0), di, dj, di, wd);
      }
    }
  }
  const up = new THREE.Vector3(0, 1, 0), down = new THREE.Vector3(0, -1, 0);
  const topPts = b > 0 ? inset : pts;
  const faces = THREE.ShapeUtils.triangulateShape(topPts.map((p) => p.clone()), []);
  for (const [a, bb, c] of faces) tri(V(topPts[a], yTop), V(topPts[bb], yTop), V(topPts[c], yTop), up, up, up, up);
  if (o.bottom || o.bottomBevel) {
    const botPts = o.bottomBevel && b > 0 ? inset : pts;
    for (const [a, bb, c] of faces) tri(V(botPts[a], 0), V(botPts[bb], 0), V(botPts[c], 0), down, down, down, down);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
  return g;
}

/** Prism from a polygon in the XY plane, extruded along Z (centred), bevelled on both faces. */
export function prismXY(pts: readonly THREE.Vector2[], depth: number, bevel = 0.04): THREE.BufferGeometry {
  const g = prism(pts.map((p) => new THREE.Vector2(p.x, -p.y)), depth, bevel, { bottomBevel: true });
  g.rotateX(Math.PI / 2);
  g.translate(0, 0, -depth / 2);
  return g;
}

export function circlePts(r: number, seg: number, a0 = 0, jitter = 0, seed = 0): THREE.Vector2[] {
  const out: THREE.Vector2[] = [];
  for (let i = 0; i < seg; i++) {
    const a = a0 + (i / seg) * TAU;
    const rr = r * (1 + (jitter ? (hash3(i, 0, 0, seed) - 0.5) * jitter : 0));
    out.push(new THREE.Vector2(Math.cos(a) * rr, Math.sin(a) * rr));
  }
  return out;
}

/** Annular sector polygon (convex enough for tiles when the arc is short). */
export function sectorPts(r0: number, r1: number, a0: number, a1: number, steps = 3): THREE.Vector2[] {
  const out: THREE.Vector2[] = [];
  for (let i = 0; i <= steps; i++) {
    const a = a0 + ((a1 - a0) * i) / steps;
    out.push(new THREE.Vector2(Math.cos(a) * r1, Math.sin(a) * r1));
  }
  for (let i = steps; i >= 0; i--) {
    const a = a0 + ((a1 - a0) * i) / steps;
    out.push(new THREE.Vector2(Math.cos(a) * r0, Math.sin(a) * r0));
  }
  return out;
}

/** Noise-displaced icosahedron, faceted. */
export function rockGeo(radius: number, seed: number, detail = 1, squash = 1, rough = 0.35): THREE.BufferGeometry {
  const g = new THREE.IcosahedronGeometry(radius, detail);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    _v.fromBufferAttribute(pos, i);
    const k = 1.6 / radius;
    const d = (noise3(_v.x * k + 11, _v.y * k, _v.z * k, seed) - 0.5) * 2 * rough + (noise3(_v.x * k * 2.3, _v.y * k * 2.3, _v.z * k * 2.3, seed + 7) - 0.5) * rough * 0.5;
    _v.multiplyScalar(1 + d);
    _v.y *= squash;
    pos.setXYZ(i, _v.x, _v.y, _v.z);
  }
  return flatten(g);
}

function ensureAttributes(g: THREE.BufferGeometry): THREE.BufferGeometry {
  if (!g.attributes.normal) g.computeVertexNormals();
  const count = g.attributes.position.count;
  if (!g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(count * 2), 2));
  if (!g.attributes.color) {
    const c = new Float32Array(count * 3).fill(1);
    g.setAttribute('color', new THREE.BufferAttribute(c, 3));
  }
  for (const name of Object.keys(g.attributes)) {
    if (name !== 'position' && name !== 'normal' && name !== 'uv' && name !== 'color') g.deleteAttribute(name);
  }
  g.morphAttributes = {};
  if (!g.index) {
    const idx = new Uint32Array(count);
    for (let i = 0; i < count; i++) idx[i] = i;
    g.setIndex(new THREE.BufferAttribute(idx, 1));
  }
  return g;
}

// ---------------------------------------------------------------------------------------------
// Part options
// ---------------------------------------------------------------------------------------------
export interface PartOpts {
  at?: P3;
  rot?: readonly [number, number, number];
  scale?: number | P3;
  color?: string;
  /** Per-piece tint jitter (0..1). */
  jitter?: number;
  /** Darken toward the base of the part (0..1). */
  ao?: number;
  aoHeight?: number;
  /** Colour at the top of the part (vertical gradient), e.g. sunlit cloud tops. */
  topColor?: string;
  uv?: 'box' | 'keep';
  uvScale?: number;
  cast?: boolean;
  receive?: boolean;
  dynamic?: boolean;
  /** Dynamic part that must stay a separate object (animated on its own); never merged. */
  keep?: boolean;
  name?: string;
}

interface FlickerEntry { light: THREE.PointLight | null; base: number; flame: THREE.Object3D | null; phase: number }

const NO_SHADOW_MATS = new Set<MaterialName>(['glow', 'glow_soft', 'glow_hot', 'rune', 'water', 'glass', 'void', 'shadow']);

// ---------------------------------------------------------------------------------------------
// Kit
// ---------------------------------------------------------------------------------------------
export class Kit {
  readonly root: THREE.Group;
  readonly palette: Palette;
  readonly physics: PhysicsWorld | null;
  readonly mats: MaterialLibrary;
  readonly colliders: StaticCollider[] = [];
  readonly lights: THREE.PointLight[] = [];
  readonly waters: WaterHandle[] = [];
  private readonly ownsMats: boolean;
  private readonly rnd: () => number;
  private readonly maxLights: number;
  private readonly shadows: boolean;
  private readonly flickers: FlickerEntry[] = [];
  private readonly swayers: { obj: THREE.Object3D; amp: number; phase: number; axis: 'x' | 'z' }[] = [];
  private readonly spinners: { obj: THREE.Object3D; speed: number }[] = [];
  private readonly extraGeos = new Set<THREE.BufferGeometry>();
  private readonly extraMats = new Set<THREE.Material>();
  private mergedGroup: THREE.Group | null = null;
  private suppressColliders = 0;
  private stats_: Omit<KitStats, 'colliders' | 'lights' | 'materials' | 'drawables' | 'triangles' | 'dynamic'> = { meshes: 0, merged: 0, instanced: 0 };

  constructor(root: THREE.Group, palette: Palette, physics?: PhysicsWorld | null, o: KitOptions = {}) {
    this.root = root;
    this.palette = palette;
    this.physics = physics ?? null;
    this.mats = o.materials ?? new MaterialLibrary(palette);
    this.ownsMats = !o.materials;
    this.rnd = mulberry32((o.seed ?? 1) * 9301 + 49297);
    this.maxLights = o.maxLights ?? 10;
    this.shadows = o.shadows ?? true;
  }

  // -------------------------------------------------------------------------------------------
  // Internals
  // -------------------------------------------------------------------------------------------
  private r(a = 0, b = 1): number {
    return a + (b - a) * this.rnd();
  }

  private group(o: Place, name: string): THREE.Group {
    const g = new THREE.Group();
    g.name = `kit:${name}`;
    g.position.copy(toV3(o.at));
    g.rotation.y = o.rotY ?? 0;
    if (o.dynamic) g.userData.kitDynamic = true;
    (o.parent ?? this.root).add(g);
    g.updateWorldMatrix(true, false);
    return g;
  }

  private mat(m: MaterialName | THREE.Material): THREE.Material {
    return typeof m === 'string' ? this.mats.get(m) : m;
  }

  /** Add a mesh part to `parent`. Geometry must be exclusively owned by this part. */
  part(parent: THREE.Object3D, geo: THREE.BufferGeometry, m: MaterialName | THREE.Material, o: PartOpts = {}): THREE.Mesh {
    const material = this.mat(m);
    const mesh = new THREE.Mesh(geo, material);
    if (o.at) mesh.position.copy(toV3(o.at));
    if (o.rot) mesh.rotation.set(o.rot[0], o.rot[1], o.rot[2]);
    if (o.scale !== undefined) {
      if (typeof o.scale === 'number') mesh.scale.setScalar(o.scale);
      else mesh.scale.copy(toV3(o.scale));
    }
    mesh.updateMatrix();
    if (!geo.attributes.normal) geo.computeVertexNormals();
    if (o.uv !== 'keep') {
      const meters = uvMetersFor(material) * (o.uvScale ?? 1);
      if (o.uv === 'box' || !scaleNativeUVs(geo, meters)) projectUVs(geo, meters, mesh.matrix);
    }
    this.paint(geo, mesh.matrix, o, typeof m === 'string' ? m : null);
    const noShadow = typeof m === 'string' ? NO_SHADOW_MATS.has(m) : (material as THREE.MeshBasicMaterial).isMeshBasicMaterial || material.transparent;
    mesh.castShadow = this.shadows && (o.cast ?? !noShadow);
    mesh.receiveShadow = o.receive ?? !noShadow;
    mesh.userData.kitStatic = !o.dynamic;
    if (o.keep) mesh.userData.kitKeep = true;
    if (o.name) mesh.name = o.name;
    parent.add(mesh);
    this.stats_.meshes++;
    return mesh;
  }

  private paint(geo: THREE.BufferGeometry, m: THREE.Matrix4, o: PartOpts, matName: MaterialName | null): void {
    const pos = geo.attributes.position;
    const count = pos.count;
    const base = new THREE.Color(o.color ?? this.defaultColor(matName));
    if (o.jitter) {
      const hex = adjustHsl('#' + base.getHexString(THREE.SRGBColorSpace), (this.rnd() - 0.5) * 0.04 * o.jitter, 1 + (this.rnd() - 0.5) * 0.3 * o.jitter, (this.rnd() - 0.5) * 0.14 * o.jitter);
      base.set(hex);
    }
    const top = o.topColor ? new THREE.Color(o.topColor) : null;
    const ao = o.ao ?? 0.3;
    const aoH = o.aoHeight ?? 1.2;
    let minY = Infinity, maxY = -Infinity;
    const ys = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      _v.fromBufferAttribute(pos, i).applyMatrix4(m);
      ys[i] = _v.y;
      if (_v.y < minY) minY = _v.y;
      if (_v.y > maxY) maxY = _v.y;
    }
    const colors = new Float32Array(count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      c.copy(base);
      if (top && maxY > minY) c.lerp(top, Math.pow((ys[i] - minY) / (maxY - minY), 1.3));
      if (ao > 0) {
        const t = Math.min(1, Math.max(0, (ys[i] - minY) / aoH));
        c.multiplyScalar(1 - ao * (1 - t * t * (3 - 2 * t)));
      }
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  }

  private defaultColor(m: MaterialName | null): string {
    const p = this.palette;
    switch (m) {
      case 'stone': case 'wet_stone': return p.stone;
      case 'brick': return p.brick;
      case 'tile': return p.tile;
      case 'plaster': return p.plaster;
      case 'rock': return p.rock;
      case 'moss': return p.moss;
      case 'grass': return p.grass;
      case 'leaf': return p.leaf;
      case 'petal': return p.petal;
      case 'wood': return p.wood;
      case 'brass': return p.brass;
      case 'gold': return p.brass;
      case 'iron': return p.iron;
      case 'paint': return p.paint;
      case 'cloth': return p.cloth;
      case 'crystal': return p.crystal;
      case 'cloud': return p.sky.cloud;
      case 'glow': case 'glow_soft': case 'glow_hot': return p.glow;
      case 'wax': return '#f3e6cf';
      default: return '#ffffff';
    }
  }

  private worldYaw(o: THREE.Object3D): number {
    o.updateWorldMatrix(true, false);
    const e = new THREE.Euler().setFromRotationMatrix(new THREE.Matrix4().extractRotation(o.matrixWorld), 'YXZ');
    return e.y;
  }

  /** Box collider in `g`-local coordinates. */
  colBox(g: THREE.Object3D, c: readonly [number, number, number], half: readonly [number, number, number], tags?: ColliderTag[], yaw = 0, tilt = 0): StaticCollider | null {
    if (!this.physics || this.suppressColliders > 0) return null;
    g.updateWorldMatrix(true, false);
    const p = new THREE.Vector3(c[0], c[1], c[2]).applyMatrix4(g.matrixWorld);
    const col = this.physics.addBox(p, new THREE.Vector3(half[0], half[1], half[2]), { rotY: this.worldYaw(g) + yaw, tilt: tilt || undefined, tags });
    this.track(g, col);
    return col;
  }

  colCyl(g: THREE.Object3D, c: readonly [number, number, number], radius: number, halfH: number, tags?: ColliderTag[]): StaticCollider | null {
    if (!this.physics || this.suppressColliders > 0) return null;
    g.updateWorldMatrix(true, false);
    const p = new THREE.Vector3(c[0], c[1], c[2]).applyMatrix4(g.matrixWorld);
    const col = this.physics.addCylinder(p, radius, halfH, { tags });
    this.track(g, col);
    return col;
  }

  private track(g: THREE.Object3D, col: StaticCollider): void {
    this.colliders.push(col);
    const list = (g.userData.colliders as StaticCollider[] | undefined) ?? [];
    list.push(col);
    g.userData.colliders = list;
  }

  private addLight(parent: THREE.Object3D, at: THREE.Vector3, color: string, intensity: number, distance: number, flame: THREE.Object3D | null, flick = 0.12): THREE.PointLight | null {
    let light: THREE.PointLight | null = null;
    if (this.suppressColliders > 0) return null;
    if (this.lights.length < this.maxLights) {
      light = new THREE.PointLight(color, intensity, distance, 2);
      light.castShadow = false;
      light.position.copy(at);
      parent.add(light);
      this.lights.push(light);
    }
    this.flickers.push({ light, base: intensity, flame, phase: this.r(0, 100) * (flick > 0 ? 1 : 0) });
    return light;
  }

  private halo(parent: THREE.Object3D, at: THREE.Vector3, color: string, size: number, opacity = 0.55): THREE.Sprite {
    const key = `halo:${color}:${opacity}`;
    let m = this.haloMats.get(key);
    if (!m) {
      m = new THREE.SpriteMaterial({ map: glowSprite(), color: new THREE.Color(color).multiplyScalar(1.6), transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, fog: true });
      this.haloMats.set(key, m);
      this.extraMats.add(m);
    }
    const s = new THREE.Sprite(m);
    s.position.copy(at);
    s.scale.setScalar(size);
    s.renderOrder = 5;
    parent.add(s);
    return s;
  }
  private readonly haloMats = new Map<string, THREE.SpriteMaterial>();

  private letterColor(letter?: RoomLetter, fallback?: string): string {
    return letter ? LETTER_ACCENTS[letter].color : (fallback ?? this.palette.accent);
  }

  // -------------------------------------------------------------------------------------------
  // Floors, walls, wells
  // -------------------------------------------------------------------------------------------
  /**
   * Tiled floor. Rectangular (w x d) or round (radius, optional innerRadius for a pool/pit). The top
   * surface is at `at.y`. Styles: 'tiles' (square bevelled tiles), 'flag' (irregular flagstones), 'planks',
   * 'grass', 'slab' (single slab; cheap).
   */
  floor(o: Place & { w?: number; d?: number; radius?: number; innerRadius?: number; style?: 'tiles' | 'flag' | 'planks' | 'grass' | 'slab'; tile?: number; thickness?: number; material?: MaterialName; color?: string; colliderTags?: ColliderTag[] } = {}): THREE.Group {
    const g = this.group(o, 'floor');
    const style = o.style ?? 'tiles';
    const th = o.thickness ?? 0.3;
    const tile = o.tile ?? 1.1;
    const matName: MaterialName = o.material ?? (style === 'planks' ? 'wood' : style === 'grass' ? 'grass' : style === 'flag' ? 'stone' : 'tile');
    const color = o.color;
    const gap = 0.035;
    const tileH = 0.14;
    if (o.radius !== undefined) {
      const R = o.radius, R0 = o.innerRadius ?? 0;
      // Mortar bed
      const bed = prism(circlePts(R, 72), th - 0.04, 0.0, { bottom: true, smooth: true });
      bed.translate(0, -th, 0);
      if (R0 > 0) this.part(g, this.annulus(R0, R, -th, -0.04, 72), matName, { color: this.palette.mortar, ao: 0 });
      else this.part(g, bed, matName, { color: this.palette.mortar, ao: 0 });
      if (R0 > 0) bed.dispose();
      if (style === 'slab' || style === 'grass') {
        const top = R0 > 0 ? this.annulus(R0, R, -0.04, 0, 72, 0.05) : prism(circlePts(R, 72), 0.06, 0.05, { smooth: true });
        if (!(R0 > 0)) top.translate(0, -0.06, 0);
        this.part(g, top, matName, { color, ao: 0, uv: 'box' });
      } else {
        let r = R0 > 0 ? R0 : 0;
        if (r === 0) {
          const disc = prism(circlePts(tile * 0.9, 24), tileH, 0.04, { smooth: true });
          disc.translate(0, -tileH + this.r(-0.01, 0.01), 0);
          this.part(g, disc, matName, { color, jitter: 0.6, ao: 0, uv: 'box' });
          r = tile * 0.9 + gap;
        }
        let ring = 0;
        while (r < R - 0.05) {
          let r1 = Math.min(R, r + tile * (0.85 + 0.2 * ((ring * 7) % 3) / 2));
          if (R - r1 < tile * 0.45) r1 = R;
          const n = Math.max(6, Math.round((TAU * (r + r1) * 0.5) / (tile * (style === 'flag' ? 1.3 : 1))));
          const off = this.r(0, TAU);
          for (let i = 0; i < n; i++) {
            const a0 = off + (i / n) * TAU + gap / r1, a1 = off + ((i + 1) / n) * TAU - gap / r1;
            const wobble = style === 'flag' ? this.r(-0.25, 0.25) * (a1 - a0) : 0;
            const pts = sectorPts(r + gap, r1 - gap, a0, a1 + wobble * 0.3, 3);
            const geo = prism(pts, tileH, 0.035);
            geo.translate(0, -tileH + this.r(-0.012, 0.008), 0);
            this.part(g, geo, matName, { color, jitter: style === 'flag' ? 1 : 0.6, ao: 0, uv: 'box' });
          }
          r = r1;
          ring++;
        }
      }
      if (R0 > 0) {
        // Floor is a ring: approximate with boxes around the annulus.
        const segs = Math.max(12, Math.round((TAU * (R + R0)) / 2 / 2));
        for (let i = 0; i < segs; i++) {
          const a = (i / segs) * TAU;
          const rm = (R + R0) / 2;
          const len = (TAU * R) / segs;
          this.colBox(g, [Math.cos(a) * rm, -th / 2, Math.sin(a) * rm], [len / 2 + 0.05, th / 2, (R - R0) / 2], o.colliderTags, yawToward(Math.cos(a), Math.sin(a)));
        }
      } else {
        this.colCyl(g, [0, -th / 2, 0], R, th / 2, o.colliderTags);
      }
      return g;
    }
    const W = o.w ?? 10, D = o.d ?? 10;
    const bed = rbox(W, th - 0.04, D, 0.04, 1);
    bed.translate(0, -th / 2 - 0.02, 0);
    this.part(g, bed, matName, { color: this.palette.mortar, ao: 0 });
    if (style === 'slab' || style === 'grass') {
      const top = rbox(W, 0.1, D, 0.05, 2);
      top.translate(0, -0.05, 0);
      this.part(g, top, matName, { color, ao: 0, uv: 'box' });
    } else if (style === 'planks') {
      const bw = 0.32;
      const n = Math.floor(W / bw);
      for (let i = 0; i < n; i++) {
        let z = -D / 2;
        while (z < D / 2 - 0.05) {
          const len = Math.min(D / 2 - z, this.r(1.6, 3.2));
          const b = rbox(bw - 0.025, 0.08, len - 0.02, 0.025, 1);
          b.translate(-W / 2 + bw * (i + 0.5), -0.04 + this.r(-0.006, 0.006), z + len / 2);
          this.part(g, b, 'wood', { color, jitter: 0.7, ao: 0, uv: 'box' });
          z += len;
        }
      }
    } else {
      const nx = Math.max(1, Math.round(W / tile)), nz = Math.max(1, Math.round(D / tile));
      const tw = W / nx, td = D / nz;
      if (nx * nz > 1400) {
        const top = rbox(W, 0.1, D, 0.04, 1);
        top.translate(0, -0.05, 0);
        this.part(g, top, matName, { color, ao: 0, uv: 'box' });
      } else if (style === 'flag') {
        // Irregular flagstones: merge random 1x1 / 2x1 / 1x2 / 2x2 cells.
        const used = new Uint8Array(nx * nz);
        for (let z = 0; z < nz; z++) {
          for (let x = 0; x < nx; x++) {
            if (used[z * nx + x]) continue;
            let sx = 1, sz = 1;
            const roll = this.rnd();
            if (roll < 0.3 && x + 1 < nx && !used[z * nx + x + 1]) sx = 2;
            else if (roll < 0.55 && z + 1 < nz) sz = 2;
            if (sx === 2 && sz === 1 && this.rnd() < 0.3 && z + 1 < nz && !used[(z + 1) * nx + x + 1]) sz = 2;
            for (let zz = z; zz < z + sz; zz++) for (let xx = x; xx < x + sx; xx++) used[zz * nx + xx] = 1;
            const b = rbox(tw * sx - gap * 2, tileH, td * sz - gap * 2, 0.045, 1);
            b.translate(-W / 2 + tw * (x + sx / 2), -tileH / 2 + this.r(-0.012, 0.01), -D / 2 + td * (z + sz / 2));
            this.part(g, b, matName, { color, jitter: 1, ao: 0, uv: 'box' });
          }
        }
      } else {
        for (let z = 0; z < nz; z++) {
          for (let x = 0; x < nx; x++) {
            const b = rbox(tw - gap * 2, tileH, td - gap * 2, 0.04, 1);
            b.translate(-W / 2 + tw * (x + 0.5), -tileH / 2 + this.r(-0.01, 0.008), -D / 2 + td * (z + 0.5));
            this.part(g, b, matName, { color, jitter: 0.6, ao: 0, uv: 'box' });
          }
        }
      }
    }
    this.colBox(g, [0, -th / 2, 0], [W / 2, th / 2, D / 2], o.colliderTags);
    return g;
  }

  private annulus(r0: number, r1: number, y0: number, y1: number, seg: number, bevel = 0): THREE.BufferGeometry {
    // Ring slab built from sector prisms (no triangulation of holes needed).
    const parts: THREE.BufferGeometry[] = [];
    for (let i = 0; i < seg; i++) {
      const a0 = (i / seg) * TAU, a1 = ((i + 1) / seg) * TAU;
      const g = prism(sectorPts(r0, r1, a0, a1, 1), y1 - y0, bevel, { bottom: true });
      g.translate(0, y0, 0);
      parts.push(g);
    }
    const merged = mergeGeometries(parts, false);
    for (const p of parts) p.dispose();
    if (!merged) throw new Error('annulus merge failed');
    return merged;
  }

  /**
   * Straight wall from `from` to `to` (XZ, at y = at.y or 0), with plinth, cornice and pilasters.
   * Alternatively give at/rotY/length. The wall's front faces +Z of its local frame.
   */
  wall(o: Place & { from?: readonly [number, number]; to?: readonly [number, number]; length?: number; height?: number; thickness?: number; style?: 'brick' | 'stone' | 'plaster'; trim?: boolean; pilasterEvery?: number; color?: string } = {}): THREE.Group {
    let place: Place = o;
    let L = o.length ?? 6;
    if (o.from && o.to) {
      const dx = o.to[0] - o.from[0], dz = o.to[1] - o.from[1];
      L = Math.hypot(dx, dz);
      const y = o.at ? toV3(o.at).y : 0;
      place = { at: [(o.from[0] + o.to[0]) / 2, y, (o.from[1] + o.to[1]) / 2], rotY: Math.atan2(-dz, dx), parent: o.parent };
    }
    const g = this.group(place, 'wall');
    const H = o.height ?? 4, T = o.thickness ?? 0.6;
    const style = o.style ?? 'brick';
    const matName: MaterialName = style === 'plaster' ? 'plaster' : style;
    const body = rbox(L, H, T, 0.04, 1);
    body.translate(0, H / 2, 0);
    this.part(g, body, matName, { color: o.color, ao: 0.35, aoHeight: 1.6, uv: 'box' });
    if (o.trim !== false) {
      const plinth = rbox(L + 0.06, 0.42, T + 0.18, 0.05, 1);
      plinth.translate(0, 0.21, 0);
      this.part(g, plinth, 'stone', { color: this.palette.stoneDark, ao: 0.25, uv: 'box' });
      const c1 = rbox(L + 0.08, 0.16, T + 0.12, 0.04, 1);
      c1.translate(0, H - 0.3, 0);
      this.part(g, c1, 'stone', { color: this.palette.stone, ao: 0, uv: 'box' });
      const c2 = rbox(L + 0.14, 0.2, T + 0.26, 0.05, 1);
      c2.translate(0, H - 0.1, 0);
      this.part(g, c2, 'stone', { color: this.palette.stoneLight, ao: 0, uv: 'box' });
      const every = o.pilasterEvery ?? 4;
      if (every > 0) {
        const n = Math.max(1, Math.round(L / every));
        for (let i = 0; i <= n; i++) {
          const x = -L / 2 + (L * i) / n;
          const p = rbox(0.55, H - 0.4, T + 0.16, 0.05, 1);
          p.translate(Math.max(-L / 2 + 0.28, Math.min(L / 2 - 0.28, x)), (H - 0.4) / 2, 0);
          this.part(g, p, 'stone', { color: this.palette.stone, jitter: 0.3, ao: 0.3, uv: 'box' });
        }
      }
      // A few proud stones break the silhouette of long faces.
      const k = Math.floor(L / 2.5);
      for (let i = 0; i < k; i++) {
        const s = rbox(this.r(0.4, 0.8), this.r(0.22, 0.34), 0.12, 0.035, 1);
        s.translate(this.r(-L / 2 + 0.6, L / 2 - 0.6), this.r(0.7, H - 0.7), T / 2 + 0.03);
        this.part(g, s, 'stone', { color: this.palette.stone, jitter: 1, ao: 0 });
      }
    }
    this.colBox(g, [0, H / 2, 0], [L / 2, H / 2, T / 2 + 0.05], ['solid']);
    return g;
  }

  /**
   * A round well shaft seen from inside: brick cylinder, protruding stone courses every `ringEvery`,
   * a base curb and a coping ring at the top. `openings` cut door holes (angle = radians around Y,
   * measured from +X toward +Z; width/height in metres). Colliders: a ring of wall boxes.
   */
  roundWell(o: Place & { radius?: number; height?: number; thickness?: number; ringEvery?: number; openings?: { angle: number; width: number; height: number }[]; segments?: number } = {}): THREE.Group {
    const g = this.group(o, 'roundWell');
    const R = o.radius ?? 8, H = o.height ?? 12, T = o.thickness ?? 0.8;
    const segs = o.segments ?? Math.max(48, Math.round((TAU * R) / 0.6));
    const openings = (o.openings ?? []).map((op) => ({ a: op.angle, half: op.width / 2 / R, h: op.height }));
    const inOpening = (a: number, pad = 0): number => {
      let h = 0;
      for (const op of openings) {
        const d = Math.abs(Math.atan2(Math.sin(a - op.a), Math.cos(a - op.a)));
        if (d < op.half + pad) h = Math.max(h, op.h);
      }
      return h;
    };
    // Shaft wall (inside faces).
    const brickM = uvMetersFor(this.mats.get('brick'));
    const uRep = Math.max(1, Math.round((TAU * R) / brickM));
    const P: number[] = [], N: number[] = [], U: number[] = [];
    for (let i = 0; i < segs; i++) {
      const a0 = (i / segs) * TAU, a1 = ((i + 1) / segs) * TAU;
      const y0 = inOpening((a0 + a1) / 2);
      if (y0 >= H) continue;
      const c0 = Math.cos(a0), s0 = Math.sin(a0), c1 = Math.cos(a1), s1 = Math.sin(a1);
      const quad = [[c0, s0, y0, a0], [c1, s1, y0, a1], [c1, s1, H, a1], [c0, s0, H, a0]] as const;
      for (const k of [0, 1, 2, 0, 2, 3]) {
        const [c, s, y, a] = quad[k];
        P.push(c * R, y, s * R);
        N.push(-c, 0, -s);
        U.push((a / TAU) * uRep, y / brickM);
      }
    }
    const shaft = new THREE.BufferGeometry();
    shaft.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
    shaft.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
    shaft.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2));
    this.part(g, shaft, 'brick', { uv: 'keep', ao: 0.45, aoHeight: 2.5 });
    // Stone courses: protruding bevelled blocks.
    const course = (y: number, depth: number, h: number, colorHex: string, gapFrac = 0.06) => {
      const n = Math.max(12, Math.round((TAU * R) / 0.95));
      for (let i = 0; i < n; i++) {
        const a = (i + 0.5) / n * TAU;
        if (inOpening(a, 0.03) > y - 0.05) continue;
        const len = (TAU * R) / n * (1 - gapFrac);
        const b = rbox(len, h * this.r(0.92, 1.04), depth, 0.05, 1);
        const rr = R - depth / 2 + 0.12;
        this.part(g, b, 'stone', {
          at: [Math.cos(a) * rr, y + h / 2, Math.sin(a) * rr], rot: [0, yawToward(-Math.cos(a), -Math.sin(a)), 0],
          color: colorHex, jitter: 1, ao: 0.15, aoHeight: h,
        });
      }
    };
    course(0, 0.5, 0.5, this.palette.stoneDark);
    const every = o.ringEvery ?? 3.2;
    for (let y = every; y < H - 1; y += every) course(y, 0.34, 0.3, this.palette.stone);
    course(H - 0.1, 0.9, 0.45, this.palette.stoneLight, 0.04);
    // Colliders
    const nc = Math.max(16, Math.round((TAU * R) / 1.4));
    for (let i = 0; i < nc; i++) {
      const a = ((i + 0.5) / nc) * TAU;
      const hOpen = inOpening(a);
      if (hOpen >= H) continue;
      const len = (TAU * (R + T / 2)) / nc;
      const y0 = hOpen;
      this.colBox(g, [Math.cos(a) * (R + T / 2), (y0 + H) / 2, Math.sin(a) * (R + T / 2)], [len / 2 + 0.06, (H - y0) / 2, T / 2], ['solid'], yawToward(-Math.cos(a), -Math.sin(a)));
    }
    g.userData.radius = R;
    g.userData.height = H;
    return g;
  }

  /** A classic wellhead seen from outside: stacked stone ring, coping, optional roof frame, crank and bucket. */
  wellhead(o: Place & { radius?: number; height?: number; roof?: boolean; shaft?: boolean } = {}): THREE.Group {
    const g = this.group(o, 'wellhead');
    const R = o.radius ?? 1.3, H = o.height ?? 0.9;
    const courses = Math.max(2, Math.round(H / 0.3));
    const ch = H / courses;
    for (let c = 0; c < courses; c++) {
      const n = Math.max(8, Math.round((TAU * R) / 0.55));
      const off = (c % 2) * 0.5;
      for (let i = 0; i < n; i++) {
        const a = ((i + off) / n) * TAU;
        const len = (TAU * R) / n - 0.03;
        const b = rbox(len, ch - 0.03, 0.34, 0.05, 1);
        this.part(g, b, 'stone', { at: [Math.cos(a) * R, c * ch + ch / 2, Math.sin(a) * R], rot: [0, yawToward(Math.cos(a), Math.sin(a)), 0], jitter: 1, ao: 0.25 });
      }
    }
    const cop = this.annulus(R - 0.28, R + 0.24, H, H + 0.16, 32, 0.04);
    this.part(g, cop, 'stone', { color: this.palette.stoneLight, ao: 0 });
    if (o.shaft !== false) {
      const dark = new THREE.CircleGeometry(R - 0.2, 32);
      dark.rotateX(-Math.PI / 2);
      dark.translate(0, H * 0.55, 0);
      this.part(g, dark, 'shadow', { ao: 0, color: '#000000', cast: false, uv: 'keep' });
    }
    if (o.roof !== false) {
      for (const s of [-1, 1]) {
        const post = rbox(0.16, 1.9, 0.16, 0.03, 1);
        post.translate(s * (R + 0.05), H + 0.95, 0);
        this.part(g, post, 'wood', { ao: 0.2 });
      }
      const beam = new THREE.CylinderGeometry(0.07, 0.07, R * 2 + 0.6, 12);
      beam.rotateZ(Math.PI / 2);
      beam.translate(0, H + 1.55, 0);
      this.part(g, beam, 'wood', { color: this.palette.woodDark });
      for (const s of [-1, 1]) {
        const roof = rbox(R * 2 + 0.9, 0.08, 1.2, 0.03, 1);
        roof.rotateX(s * 0.55);
        roof.translate(0, H + 2.15, s * 0.5);
        this.part(g, roof, 'wood', { color: this.palette.woodDark, uv: 'box' });
      }
      const rope = new THREE.CylinderGeometry(0.018, 0.018, 1.1, 6);
      rope.translate(0.3, H + 1.0, 0);
      this.part(g, rope, 'cloth', { color: '#c9b48a', ao: 0 });
      const bucket = new THREE.LatheGeometry([new THREE.Vector2(0.0, 0), new THREE.Vector2(0.17, 0), new THREE.Vector2(0.2, 0.3), new THREE.Vector2(0.18, 0.3), new THREE.Vector2(0.15, 0.03)], 12);
      bucket.translate(0.3, H + 0.2, 0);
      this.part(g, bucket, 'wood', {});
      const crank = new THREE.TorusGeometry(0.16, 0.02, 6, 16);
      crank.rotateY(Math.PI / 2);
      crank.translate(R + 0.3, H + 1.55, 0);
      this.part(g, crank, 'iron', {});
    }
    this.colCyl(g, [0, H / 2, 0], R + 0.2, H / 2, ['solid']);
    return g;
  }

  // -------------------------------------------------------------------------------------------
  // Architecture
  // -------------------------------------------------------------------------------------------
  /** Semicircular stone arch of voussoirs on quoined jambs. Opening faces +Z. */
  arch(o: Place & { width?: number; height?: number; depth?: number; keystoneColor?: string; material?: MaterialName; color?: string } = {}): THREE.Group {
    const g = this.group(o, 'arch');
    this.archFrame(g, o.width ?? 2.6, o.height ?? 3.6, o.depth ?? 0.9, o.material ?? 'stone', o.color, o.keystoneColor);
    return g;
  }

  private archFrame(g: THREE.Group, W: number, Hd: number, D: number, mat: MaterialName, color?: string, keyColor?: string): void {
    const rIn = W / 2, band = 0.55;
    const spring = Math.max(0.6, Hd - rIn);
    const p = this.palette;
    // Jambs: alternating long/short quoins.
    let y = 0, i = 0;
    while (y < spring - 0.01) {
      const h = Math.min(0.52, spring - y);
      const wide = i % 2 === 0 ? band + 0.18 : band;
      for (const s of [-1, 1]) {
        const b = rbox(wide, h - 0.03, D, 0.05, 1);
        this.part(g, b, mat, { at: [s * (rIn + wide / 2), y + h / 2, 0], color: color ?? p.stone, jitter: 0.8, ao: y < 0.1 ? 0.3 : 0.1, uv: 'box' });
      }
      y += h;
      i++;
    }
    // Voussoirs
    const n = 11;
    for (let k = 0; k < n; k++) {
      const a0 = Math.PI - (k / n) * Math.PI - 0.012, a1 = Math.PI - ((k + 1) / n) * Math.PI + 0.012;
      const isKey = k === Math.floor(n / 2);
      const rOut = rIn + band + (isKey ? 0.28 : 0);
      const pts: THREE.Vector2[] = [];
      const st = 3;
      for (let s = 0; s <= st; s++) {
        const a = a0 + ((a1 - a0) * s) / st;
        pts.push(new THREE.Vector2(Math.cos(a) * rIn, Math.sin(a) * rIn + spring));
      }
      for (let s = st; s >= 0; s--) {
        const a = a0 + ((a1 - a0) * s) / st;
        pts.push(new THREE.Vector2(Math.cos(a) * rOut, Math.sin(a) * rOut + spring));
      }
      const geo = prismXY(pts, D + (isKey ? 0.14 : 0), 0.045);
      this.part(g, geo, mat, { color: isKey ? (keyColor ?? p.stoneLight) : (color ?? p.stone), jitter: isKey ? 0 : 0.8, ao: 0, uv: 'box' });
    }
    // Colliders: jambs + lintel block.
    const jw = band + 0.1;
    for (const s of [-1, 1]) this.colBox(g, [s * (rIn + jw / 2), spring / 2, 0], [jw / 2, spring / 2, D / 2], ['solid']);
    this.colBox(g, [0, spring + rIn * 0.75 + band / 2, 0], [rIn + band, rIn * 0.35 + band / 2, D / 2], ['solid']);
  }

  /**
   * Door / star gate: arch frame, glowing letter plate ("1E"), threshold with a rune line, and either
   * wooden leaves on hinge pivots (style 'door'; userData.leaves, userData.doorCollider) or a swirling
   * void portal (style 'gate'). Opening faces +Z.
   */
  door(o: Place & { label?: string; letter?: RoomLetter; color?: string; width?: number; height?: number; depth?: number; style?: 'door' | 'gate'; open?: number; material?: MaterialName; sconces?: boolean; sconceLights?: boolean } = {}): THREE.Group {
    const g = this.group(o, 'door');
    const W = o.width ?? 2.4, Hd = o.height ?? 3.6, D = o.depth ?? 1.0;
    const col = o.color ?? this.letterColor(o.letter);
    const deep = o.letter ? LETTER_ACCENTS[o.letter].deep : shadeHex(col, -0.5);
    const mat = o.material ?? 'stone';
    this.archFrame(g, W, Hd, D, mat, undefined, mixHex(this.palette.stoneLight, col, 0.25));
    const rIn = W / 2;
    const spring = Math.max(0.6, Hd - rIn);
    // Letter plate above the keystone.
    const plateY = Hd + 0.95;
    const plate = rbox(1.25, 0.62, 0.16, 0.05, 2);
    this.part(g, plate, 'brass', { at: [0, plateY, D / 2 + 0.02], color: mixHex(this.palette.brass, deep, 0.35), ao: 0 });
    const inner = rbox(1.08, 0.46, 0.04, 0.02, 1);
    this.part(g, inner, 'iron', { at: [0, plateY, D / 2 + 0.1], color: '#15121a', ao: 0 });
    if (o.label) {
      const txt = new THREE.PlaneGeometry(1.06, 0.53);
      const tm = new THREE.Mesh(txt, this.mats.plate(o.label, col));
      tm.position.set(0, plateY, D / 2 + 0.125);
      tm.renderOrder = 4;
      g.add(tm);
      this.extraGeos.add(txt);
    }
    for (const s of [-1, 1]) {
      const stud = new THREE.SphereGeometry(0.06, 10, 8);
      this.part(g, stud, 'glow', { at: [s * 0.7, plateY, D / 2 + 0.08], color: col, ao: 0 });
    }
    // Threshold step with a rune line in the letter colour.
    const step = rbox(W + 1.4, 0.14, 1.1, 0.04, 1);
    this.part(g, step, 'stone', { at: [0, 0.07, D / 2 + 0.45], color: this.palette.stoneLight, ao: 0, uv: 'box' });
    const rl = new THREE.PlaneGeometry(W + 0.8, 0.22);
    rl.rotateX(-Math.PI / 2);
    this.part(g, rl, this.mats.runes(7, 2.2), { at: [0, 0.145, D / 2 + 0.5], color: col, ao: 0, uv: 'keep', cast: false });
    const ruv = rl.attributes.uv;
    for (let i = 0; i < ruv.count; i++) ruv.setX(i, ruv.getX(i) * ((W + 0.8) / 0.22 / 8));
    // Opening outline for leaves/portal.
    const outline: THREE.Vector2[] = [new THREE.Vector2(-rIn, 0), new THREE.Vector2(rIn, 0)];
    for (let k = 0; k <= 16; k++) {
      const a = (k / 16) * Math.PI;
      outline.push(new THREE.Vector2(Math.cos(a) * rIn, Math.sin(a) * rIn + spring));
    }
    if ((o.style ?? 'door') === 'gate') {
      const shape = new THREE.Shape(outline);
      const portal = new THREE.ShapeGeometry(shape, 16);
      const pm = new THREE.Mesh(portal, this.mats.get('void'));
      pm.position.z = 0.02;
      g.add(pm);
      this.extraGeos.add(portal);
      // Glowing rim just inside the intrados (the arc runs +X -> -X, so start at the right foot).
      const rimPts = outline.slice(2).map((p) => new THREE.Vector3(p.x * 0.97, p.y, 0.1));
      rimPts.unshift(new THREE.Vector3(rIn * 0.97, 0.05, 0.1));
      rimPts.push(new THREE.Vector3(-rIn * 0.97, 0.05, 0.1));
      const curve = new THREE.CatmullRomCurve3(rimPts);
      const rim = new THREE.TubeGeometry(curve, 48, 0.035, 6, false);
      this.part(g, rim, 'glow', { color: col, ao: 0, uv: 'keep' });
      g.userData.portal = pm;
      this.colBox(g, [0, spring / 2, 0], [rIn, spring / 2, 0.1], ['noGrab']);
    } else {
      const leaves: THREE.Object3D[] = [];
      for (const s of [-1, 1]) {
        const pivot = new THREE.Group();
        pivot.position.set(s * rIn, 0, 0.12);
        g.add(pivot);
        const pts = outline.filter((p) => (s < 0 ? p.x <= 0.001 : p.x >= -0.001)).map((p) => new THREE.Vector2(p.x - s * rIn, p.y));
        const leafPts = s < 0
          ? [new THREE.Vector2(0, 0), new THREE.Vector2(rIn - 0.02, 0), ...pts.filter((p) => p.y > 0.01).map((p) => new THREE.Vector2(Math.min(p.x, rIn - 0.02), p.y)).reverse()]
          : [new THREE.Vector2(-rIn + 0.02, 0), new THREE.Vector2(0, 0), ...pts.filter((p) => p.y > 0.01).map((p) => new THREE.Vector2(Math.max(p.x, -rIn + 0.02), p.y))];
        const hull = convexHull(leafPts);
        const leaf = prismXY(hull, 0.14, 0.03);
        this.part(pivot, leaf, 'wood', { color: this.palette.wood, dynamic: true, ao: 0.2, uv: 'box' });
        for (const yy of [0.5, spring * 0.55, spring - 0.1]) {
          const strap = rbox(rIn * 0.92, 0.1, 0.04, 0.015, 1);
          this.part(pivot, strap, 'iron', { at: [-s * rIn * 0.48, yy, 0.085], dynamic: true, ao: 0 });
        }
        const ring = new THREE.TorusGeometry(0.1, 0.022, 6, 16);
        this.part(pivot, ring, 'brass', { at: [-s * (rIn - 0.28), spring * 0.5 - 0.1, 0.12], dynamic: true, ao: 0 });
        pivot.rotation.y = -s * (o.open ?? 0) * 1.9;
        pivot.userData.side = s;
        leaves.push(pivot);
      }
      g.userData.leaves = leaves;
      g.userData.doorCollider = this.colBox(g, [0, spring / 2, 0.12], [rIn, spring / 2, 0.08], ['solid']);
    }
    if (o.sconces !== false) {
      for (const s of [-1, 1]) this.torchSconce({ parent: g, at: [s * (rIn + 0.4), spring * 0.8, D / 2], color: this.palette.lantern, light: o.sconceLights !== false });
    }
    g.userData.letterColor = col;
    return g;
  }

  /** Column: plinth, fluted shaft with entasis, capital. style 'broken' snaps the top. */
  pillar(o: Place & { height?: number; radius?: number; style?: 'round' | 'square' | 'broken'; material?: MaterialName; color?: string; capitalColor?: string } = {}): THREE.Group {
    const g = this.group(o, 'pillar');
    const H = o.height ?? 4, R = o.radius ?? 0.38;
    const mat = o.material ?? 'stone';
    const style = o.style ?? 'round';
    const p = this.palette;
    const capColor = o.capitalColor ?? p.stoneLight;
    const b1 = rbox(R * 2.9, 0.26, R * 2.9, 0.05, 1);
    this.part(g, b1, mat, { at: [0, 0.13, 0], color: o.color ?? p.stoneDark, ao: 0.2, uv: 'box' });
    const b2 = new THREE.CylinderGeometry(R * 1.28, R * 1.4, 0.2, 28);
    this.part(g, b2, mat, { at: [0, 0.36, 0], color: o.color ?? p.stone, ao: 0 });
    const torus = new THREE.TorusGeometry(R * 1.13, R * 0.13, 8, 28);
    torus.rotateX(Math.PI / 2);
    this.part(g, torus, mat, { at: [0, 0.5, 0], color: o.color ?? p.stone, ao: 0 });
    const shaftH = style === 'broken' ? H * this.r(0.45, 0.7) : H - 1.0;
    if (style === 'square') {
      const s = rbox(R * 2, shaftH, R * 2, 0.06, 1);
      s.translate(0, 0.5 + shaftH / 2, 0);
      this.part(g, s, mat, { color: o.color, ao: 0.25, uv: 'box' });
    } else {
      const radial = 40, hs = 10;
      const shaft = new THREE.CylinderGeometry(R * 0.9, R, shaftH, radial, hs, true);
      const pos = shaft.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        _v.fromBufferAttribute(pos, i);
        const a = Math.atan2(_v.z, _v.x);
        const yy = _v.y / shaftH + 0.5;
        const entasis = 1 + 0.06 * Math.sin(yy * Math.PI * 0.9);
        const flute = 1 - 0.045 * Math.pow(Math.abs(Math.cos(a * 10)), 0.7);
        let k = entasis * flute;
        if (style === 'broken' && yy > 0.99) k *= 1;
        _v.x *= k;
        _v.z *= k;
        if (style === 'broken' && yy > 0.99) _v.y += (noise3(_v.x * 4, 0, _v.z * 4, 5) - 0.5) * 0.5;
        pos.setXYZ(i, _v.x, _v.y, _v.z);
      }
      shaft.computeVertexNormals();
      shaft.translate(0, 0.5 + shaftH / 2, 0);
      this.part(g, shaft, mat, { color: o.color, ao: 0.3, aoHeight: 1.5, uv: 'box' });
      if (style === 'broken') {
        const cap = new THREE.CircleGeometry(R * 0.93, radial);
        cap.rotateX(-Math.PI / 2);
        cap.translate(0, 0.5 + shaftH, 0);
        this.part(g, cap, mat, { color: o.color, ao: 0, uv: 'box' });
        for (let k = 0; k < 3; k++) {
          const rk = rockGeo(this.r(0.15, 0.3), Math.floor(this.r(0, 1000)), 0, 0.8, 0.25);
          const a = this.r(0, TAU), d = R * 1.8 + this.r(0.2, 0.8);
          this.part(g, rk, mat, { at: [Math.cos(a) * d, 0.12, Math.sin(a) * d], color: o.color ?? p.stone, jitter: 0.5, uv: 'box' });
        }
      }
    }
    if (style !== 'broken') {
      const top = 0.5 + shaftH;
      const neck = new THREE.TorusGeometry(R * 0.98, R * 0.1, 8, 28);
      neck.rotateX(Math.PI / 2);
      this.part(g, neck, mat, { at: [0, top + 0.05, 0], color: capColor, ao: 0 });
      const echinus = new THREE.CylinderGeometry(R * 1.45, R * 0.95, 0.28, 28);
      this.part(g, echinus, mat, { at: [0, top + 0.24, 0], color: capColor, ao: 0 });
      const abacus = rbox(R * 3.1, 0.24, R * 3.1, 0.05, 1);
      this.part(g, abacus, mat, { at: [0, top + 0.5, 0], color: capColor, ao: 0, uv: 'box' });
    }
    const hh = style === 'broken' ? (0.5 + shaftH) : H;
    this.colCyl(g, [0, hh / 2, 0], R * 1.2, hh / 2, ['solid']);
    g.userData.height = hh;
    return g;
  }

  /** Straight stairs rising along +Z from at (solid masonry blocks). */
  stairs(o: Place & { width?: number; steps?: number; rise?: number; run?: number; material?: MaterialName; color?: string; solid?: boolean } = {}): THREE.Group {
    const g = this.group(o, 'stairs');
    const W = o.width ?? 2, n = o.steps ?? 8, rise = o.rise ?? 0.25, run = o.run ?? 0.42;
    const mat = o.material ?? 'stone';
    for (let i = 0; i < n; i++) {
      const top = (i + 1) * rise;
      const h = o.solid === false ? rise * 1.3 : top;
      const b = rbox(W, h, run + 0.02, 0.04, 1);
      this.part(g, b, mat, { at: [0, top - h / 2, i * run + run / 2], color: o.color, jitter: 0.6, ao: 0.2, uv: 'box' });
      const nose = rbox(W + 0.04, 0.06, 0.1, 0.025, 1);
      this.part(g, nose, mat, { at: [0, top - 0.03, i * run + 0.04], color: o.color ?? this.palette.stoneLight, ao: 0 });
      this.colBox(g, [0, top - h / 2, i * run + run / 2], [W / 2, h / 2, run / 2], ['solid']);
    }
    g.userData.topHeight = n * rise;
    g.userData.length = n * run;
    return g;
  }

  /** Cantilevered spiral stair hugging a round wall (e.g. inside roundWell). `at` = shaft centre. */
  spiralStairs(o: Place & { radius?: number; width?: number; steps?: number; rise?: number; startAngle?: number; sweep?: number; material?: MaterialName; color?: string } = {}): THREE.Group {
    const g = this.group(o, 'spiralStairs');
    const R = o.radius ?? 8, W = o.width ?? 1.6, n = o.steps ?? 24, rise = o.rise ?? 0.3;
    const start = o.startAngle ?? 0, sweep = o.sweep ?? Math.PI * 0.9;
    const mat = o.material ?? 'stone';
    const da = sweep / n;
    for (let i = 0; i < n; i++) {
      const a0 = start + i * da, a1 = a0 + da * 1.04;
      const top = (i + 1) * rise;
      const th = 0.24;
      const geo = prism(sectorPts(R - W, R + 0.25, a0, a1, 2), th, 0.035);
      geo.translate(0, top - th, 0);
      this.part(g, geo, mat, { color: o.color, jitter: 0.7, ao: 0.15, aoHeight: th, uv: 'box' });
      // Corbel under each step.
      const am = (a0 + a1) / 2;
      const cb = rbox(0.34, 0.34, 0.5, 0.05, 1);
      this.part(g, cb, mat, { at: [Math.cos(am) * (R - 0.1), top - th - 0.17, Math.sin(am) * (R - 0.1)], rot: [0, yawToward(Math.cos(am), Math.sin(am)), 0], color: this.palette.stoneDark, ao: 0 });
      const rm = R - W / 2;
      this.colBox(g, [Math.cos(am) * rm, top - th / 2, Math.sin(am) * rm], [(rm * da * 1.04) / 2 + 0.02, th / 2, W / 2], ['solid'], yawToward(-Math.cos(am), -Math.sin(am)));
    }
    g.userData.topHeight = n * rise;
    g.userData.endAngle = start + sweep;
    return g;
  }

  /** Sloped slab rising along +Z. Collider = tilted box (tilt = rotation about local X, three.js sense). */
  ramp(o: Place & { width?: number; length?: number; rise?: number; material?: MaterialName; color?: string } = {}): THREE.Group {
    const g = this.group(o, 'ramp');
    const W = o.width ?? 2, L = o.length ?? 4, rise = o.rise ?? 1.2;
    const mat = o.material ?? 'stone';
    const side = [new THREE.Vector2(0, 0), new THREE.Vector2(L, 0), new THREE.Vector2(L, rise), new THREE.Vector2(0, 0.05)];
    const wedge = prismXY(side, W, 0.04);
    wedge.rotateY(-Math.PI / 2);
    this.part(g, wedge, mat, { color: o.color, ao: 0.25, uv: 'box' });
    const slope = Math.hypot(L, rise);
    const tilt = -Math.atan2(rise, L);
    const slab = rbox(W + 0.1, 0.12, slope, 0.04, 1);
    slab.rotateX(tilt);
    slab.translate(0, rise / 2 + 0.06, L / 2);
    this.part(g, slab, mat, { color: this.palette.stoneLight, ao: 0, uv: 'box' });
    this.colBox(g, [0, rise / 2, L / 2], [W / 2, 0.1, slope / 2], ['solid'], 0, tilt);
    return g;
  }

  /** Floating island: bevelled top (grass/tiles/stone/cloud), overhanging lip and a faceted rocky underside. */
  floatingPlatform(o: Place & { radius?: number; shape?: 'round' | 'hex' | 'square'; thickness?: number; top?: 'grass' | 'tiles' | 'stone' | 'cloud' | 'none'; depth?: number; seed?: number; crystals?: number; roots?: boolean } = {}): THREE.Group {
    const g = this.group(o, 'floatingPlatform');
    const R = o.radius ?? 3, th = o.thickness ?? 0.45;
    const seed = o.seed ?? Math.floor(this.r(0, 1e6));
    const shape = o.shape ?? 'round';
    const segs = shape === 'hex' ? 6 : shape === 'square' ? 4 : 28;
    const a0 = shape === 'square' ? Math.PI / 4 : 0;
    const rr = shape === 'square' ? R * Math.SQRT2 : R;
    const topKind = o.top ?? 'grass';
    const p = this.palette;
    // Rock body (lathe cone, noise-displaced, faceted).
    const depth = o.depth ?? R * 1.35;
    const prof: THREE.Vector2[] = [];
    const steps = 7;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const r = rr * 0.98 * Math.pow(1 - t, 0.75) * (1 - 0.08 * Math.sin(t * 9));
      prof.push(new THREE.Vector2(Math.max(0.02, r), -th - t * depth));
    }
    prof.reverse();
    const body = new THREE.LatheGeometry(prof, shape === 'round' ? 14 : segs * 2, a0);
    const pos = body.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      _v.fromBufferAttribute(pos, i);
      const t = Math.min(1, -(_v.y + th) / depth);
      const k = 1 + (noise3(_v.x * 0.9, _v.y * 0.9, _v.z * 0.9, seed) - 0.5) * 0.45 * Math.sin(t * Math.PI);
      _v.x *= k;
      _v.z *= k;
      _v.y += (noise3(_v.x * 1.3, 7, _v.z * 1.3, seed + 3) - 0.5) * 0.5 * t;
      pos.setXYZ(i, _v.x, _v.y, _v.z);
    }
    const rock = flatten(body);
    this.part(g, rock, 'rock', { color: p.rock, topColor: undefined, ao: 0.55, aoHeight: depth, uv: 'box' });
    // Invert the AO: darker toward the tip (rock AO is measured from its lowest point, so re-tint).
    const rc = rock.attributes.color;
    const rp = rock.attributes.position;
    const dark = new THREE.Color(p.rockDark), light = new THREE.Color(p.rock);
    for (let i = 0; i < rc.count; i++) {
      const t = Math.min(1, Math.max(0, -(rp.getY(i) + th) / depth));
      const c = light.clone().lerp(dark, Math.pow(t, 0.7));
      rc.setXYZ(i, c.r, c.g, c.b);
    }
    // Rim band + top.
    const outline = circlePts(rr, segs, a0);
    const band = prism(outline, th, 0.06, { bottom: true, smooth: shape === 'round' });
    // Under turf the band's top hides inside the (wider) turf slab instead of z-fighting with it.
    band.translate(0, topKind === 'grass' ? -th - 0.03 : -th, 0);
    this.part(g, band, 'stone', { color: p.stone, ao: 0.2, aoHeight: th, uv: 'box' });
    if (topKind === 'grass') {
      // Top of the turf is exactly y = 0 (the walkable height), like every other top style.
      const lip = prism(circlePts(rr * 1.04, Math.max(segs, 36), a0, shape === 'round' ? 0.08 : 0, seed), 0.14, 0.07, { bottom: true, smooth: true });
      lip.translate(0, -0.14, 0);
      this.part(g, lip, 'grass', { color: p.grass, jitter: 0.2, ao: 0, uv: 'box' });
    } else if (topKind === 'tiles' || topKind === 'stone') {
      this.floor({ parent: g, radius: rr * 0.97, style: topKind === 'tiles' ? 'tiles' : 'flag', thickness: 0.05, tile: 0.95 });
    } else if (topKind === 'cloud') {
      this.cloudPuff({ parent: g, at: [0, -0.2, 0], scale: R * 0.9, seed });
    }
    // Crystals and roots under the rim.
    const nCr = o.crystals ?? 0;
    for (let i = 0; i < nCr; i++) {
      const a = this.r(0, TAU);
      const d = rr * this.r(0.35, 0.75);
      this.crystalCluster({ parent: g, at: [Math.cos(a) * d, -th - depth * this.r(0.15, 0.4), Math.sin(a) * d], count: 3, height: this.r(0.4, 0.9), hang: true, light: false });
    }
    if (o.roots !== false) {
      const nr = Math.round(R * 2);
      for (let i = 0; i < nr; i++) {
        const a = this.r(0, TAU);
        const d = rr * this.r(0.5, 0.9);
        const len = this.r(0.8, 2.2);
        const x = Math.cos(a) * d, z = Math.sin(a) * d;
        const pts = [new THREE.Vector3(x, -th * 0.5, z)];
        for (let k = 1; k <= 4; k++) pts.push(new THREE.Vector3(x + this.r(-0.15, 0.15) * k, -th - (len * k) / 4, z + this.r(-0.15, 0.15) * k));
        const tube = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 10, 0.035, 5, false);
        this.part(g, tube, 'wood', { color: shadeHex(p.woodDark, -0.2), ao: 0, uv: 'keep' });
      }
    }
    if (shape === 'round') this.colCyl(g, [0, -th / 2, 0], R, th / 2, ['solid']);
    else if (shape === 'square') this.colBox(g, [0, -th / 2, 0], [R, th / 2, R], ['solid']);
    else this.colCyl(g, [0, -th / 2, 0], R * 0.95, th / 2, ['solid']);
    return g;
  }

  /** Railing from `from` to `to` (XZ) or at/rotY/length; posts, balusters, top rail. */
  railing(o: Place & { from?: readonly [number, number]; to?: readonly [number, number]; length?: number; height?: number; style?: 'stone' | 'wood' | 'iron'; color?: string } = {}): THREE.Group {
    let place: Place = o;
    let L = o.length ?? 3;
    if (o.from && o.to) {
      const dx = o.to[0] - o.from[0], dz = o.to[1] - o.from[1];
      L = Math.hypot(dx, dz);
      const y = o.at ? toV3(o.at).y : 0;
      place = { at: [(o.from[0] + o.to[0]) / 2, y, (o.from[1] + o.to[1]) / 2], rotY: Math.atan2(-dz, dx), parent: o.parent };
    }
    const g = this.group(place, 'railing');
    const H = o.height ?? 1.0;
    const style = o.style ?? 'stone';
    const mat: MaterialName = style === 'stone' ? 'stone' : style === 'wood' ? 'wood' : 'iron';
    const posts = Math.max(1, Math.round(L / 1.6));
    for (let i = 0; i <= posts; i++) {
      const x = -L / 2 + (L * i) / posts;
      const pw = style === 'iron' ? 0.08 : 0.24;
      const post = rbox(pw, H, pw, 0.03, 1);
      this.part(g, post, mat, { at: [x, H / 2, 0], color: o.color, ao: 0.25 });
      if (style === 'stone') {
        const cap = rbox(0.32, 0.1, 0.32, 0.03, 1);
        this.part(g, cap, mat, { at: [x, H + 0.05, 0], color: o.color ?? this.palette.stoneLight, ao: 0 });
      } else if (style === 'iron') {
        const fin = new THREE.SphereGeometry(0.06, 10, 8);
        this.part(g, fin, 'brass', { at: [x, H + 0.05, 0], ao: 0 });
      }
    }
    const rail = rbox(L + 0.1, style === 'iron' ? 0.05 : 0.12, style === 'iron' ? 0.06 : 0.22, 0.03, 1);
    this.part(g, rail, mat, { at: [0, H - 0.04, 0], color: o.color ?? (style === 'stone' ? this.palette.stoneLight : undefined), ao: 0, uv: 'box' });
    const low = rbox(L, 0.08, style === 'iron' ? 0.05 : 0.18, 0.02, 1);
    this.part(g, low, mat, { at: [0, 0.12, 0], color: o.color, ao: 0, uv: 'box' });
    const nb = Math.floor(L / (style === 'iron' ? 0.16 : 0.3));
    for (let i = 1; i < nb; i++) {
      const x = -L / 2 + (L * i) / nb;
      let b: THREE.BufferGeometry;
      if (style === 'stone') {
        b = new THREE.LatheGeometry([new THREE.Vector2(0.001, 0), new THREE.Vector2(0.06, 0), new THREE.Vector2(0.05, 0.12), new THREE.Vector2(0.085, 0.4), new THREE.Vector2(0.045, 0.62), new THREE.Vector2(0.06, H - 0.26), new THREE.Vector2(0.001, H - 0.26)], 8);
        b.translate(0, 0.16, 0);
      } else if (style === 'wood') {
        b = rbox(0.06, H - 0.2, 0.06, 0.015, 1);
        b.translate(0, H / 2, 0);
      } else {
        b = new THREE.CylinderGeometry(0.015, 0.015, H - 0.12, 6);
        b.translate(0, H / 2, 0);
      }
      this.part(g, b, mat, { at: [x, 0, 0], color: o.color, ao: 0 });
    }
    this.colBox(g, [0, H / 2, 0], [L / 2, H / 2, 0.12], ['solid']);
    return g;
  }

  // -------------------------------------------------------------------------------------------
  // Lights and fire
  // -------------------------------------------------------------------------------------------
  /** Brass lantern (glass, glowing core, optional point light). hanging: chain up `chain` metres. */
  lantern(o: Place & { color?: string; light?: boolean; hanging?: boolean; chain?: number; size?: number; intensity?: number; distance?: number } = {}): THREE.Group {
    const g = this.group(o, 'lantern');
    const s = o.size ?? 0.36;
    const col = o.color ?? this.palette.lantern;
    const brass = this.palette.brass;
    const base = rbox(s, s * 0.14, s, s * 0.04, 1);
    this.part(g, base, 'brass', { at: [0, s * 0.07, 0], color: brass, ao: 0 });
    for (const [x, z] of [[-1, -1], [1, -1], [1, 1], [-1, 1]] as const) {
      const post = rbox(s * 0.09, s * 1.0, s * 0.09, s * 0.02, 1);
      this.part(g, post, 'brass', { at: [x * s * 0.44, s * 0.6, z * s * 0.44], color: brass, ao: 0 });
    }
    const glass = new THREE.BoxGeometry(s * 0.82, s * 0.92, s * 0.82);
    this.part(g, glass, 'glass', { at: [0, s * 0.6, 0], ao: 0, cast: false });
    const roof = new THREE.ConeGeometry(s * 0.72, s * 0.5, 4, 1);
    roof.rotateY(Math.PI / 4);
    this.part(g, roof, 'brass', { at: [0, s * 1.35, 0], color: brass, ao: 0 });
    const knob = new THREE.TorusGeometry(s * 0.14, s * 0.035, 6, 14);
    this.part(g, knob, 'brass', { at: [0, s * 1.72, 0], color: brass, ao: 0 });
    const core = new THREE.SphereGeometry(s * 0.2, 12, 10);
    core.scale(1, 1.4, 1);
    const flame = this.part(g, core, 'glow_hot', { at: [0, s * 0.6, 0], color: col, ao: 0, dynamic: true });
    this.halo(g, new THREE.Vector3(0, s * 0.6, 0), col, s * 4.5, 0.5);
    if (o.hanging) this.chain(g, s * 1.8, o.chain ?? 1.5);
    if (o.light !== false) this.addLight(g, new THREE.Vector3(0, s * 0.6, 0), col, o.intensity ?? 9, o.distance ?? 8, flame);
    else this.flickers.push({ light: null, base: 0, flame, phase: this.r(0, 100) });
    return g;
  }

  private chain(g: THREE.Object3D, y0: number, len: number): void {
    const n = Math.max(2, Math.round(len / 0.085));
    const parts: THREE.BufferGeometry[] = [];
    for (let i = 0; i < n; i++) {
      const link = new THREE.TorusGeometry(0.04, 0.011, 4, 10);
      link.scale(0.75, 1.25, 1);
      if (i % 2) link.rotateY(Math.PI / 2);
      link.translate(0, y0 + i * 0.085, 0);
      parts.push(link);
    }
    const merged = mergeGeometries(parts, false);
    for (const p of parts) p.dispose();
    if (merged) this.part(g, merged, 'iron', { ao: 0 });
  }

  /** Wall sconce facing +Z: iron bracket, bowl, flame (flickers), optional point light. `at` = wall point. */
  torchSconce(o: Place & { lit?: boolean; light?: boolean; color?: string; intensity?: number; distance?: number } = {}): THREE.Group {
    const g = this.group(o, 'torchSconce');
    const col = o.color ?? this.palette.lantern;
    const plate = rbox(0.22, 0.42, 0.06, 0.02, 1);
    this.part(g, plate, 'iron', { at: [0, 0, 0.03], ao: 0 });
    const arm = new THREE.CylinderGeometry(0.03, 0.03, 0.42, 8);
    arm.rotateX(Math.PI / 2 - 0.5);
    this.part(g, arm, 'iron', { at: [0, 0.06, 0.2], ao: 0 });
    const bowl = new THREE.LatheGeometry([new THREE.Vector2(0.001, 0), new THREE.Vector2(0.05, 0), new THREE.Vector2(0.15, 0.1), new THREE.Vector2(0.17, 0.16), new THREE.Vector2(0.14, 0.14), new THREE.Vector2(0.001, 0.07)], 14);
    this.part(g, bowl, 'brass', { at: [0, 0.14, 0.38], ao: 0 });
    if (o.lit !== false) {
      const fl = new THREE.LatheGeometry([new THREE.Vector2(0.001, 0), new THREE.Vector2(0.1, 0.05), new THREE.Vector2(0.09, 0.14), new THREE.Vector2(0.04, 0.28), new THREE.Vector2(0.001, 0.4)], 10);
      const flame = this.part(g, fl, 'glow_hot', { at: [0, 0.26, 0.38], color: col, ao: 0, dynamic: true });
      const inner = new THREE.SphereGeometry(0.05, 8, 6);
      inner.scale(1, 1.6, 1);
      this.part(flame, inner, 'glow_hot', { at: [0, 0.08, 0], color: '#fff6e0', ao: 0, dynamic: true });
      this.halo(g, new THREE.Vector3(0, 0.4, 0.38), col, 1.5, 0.45);
      if (o.light !== false) this.addLight(g, new THREE.Vector3(0, 0.5, 0.6), col, o.intensity ?? 7, o.distance ?? 7, flame);
      else this.flickers.push({ light: null, base: 0, flame, phase: this.r(0, 100) });
    }
    return g;
  }

  /** Additive light shaft (cone) from `at` (top) downward; for oculus/skylight beams. */
  lightShaft(o: Place & { to?: P3; length?: number; radiusTop?: number; radiusBottom?: number; color?: string; intensity?: number; tilt?: readonly [number, number] } = {}): THREE.Mesh {
    const from = toV3(o.at);
    const dir = o.to ? toV3(o.to).sub(from) : null;
    const len = dir ? dir.length() : (o.length ?? 12);
    const geo = new THREE.CylinderGeometry(o.radiusTop ?? 2, o.radiusBottom ?? 3.5, len, 48, 1, true);
    geo.translate(0, -len / 2, 0);
    const m = new THREE.Mesh(geo, lightShaftMaterial(o.color ?? this.palette.sky.sunGlow, o.intensity ?? 0.5));
    this.extraMats.add(m.material as THREE.Material);
    this.extraGeos.add(geo);
    m.position.copy(from);
    if (dir && len > 1e-4) m.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir.normalize());
    else if (o.tilt) m.rotation.set(o.tilt[0], 0, o.tilt[1]);
    m.renderOrder = 8;
    m.name = 'kit:lightShaft';
    (o.parent ?? this.root).add(m);
    return m;
  }

  /** Drifting glowing motes (single Points draw), e.g. dust in a light shaft or fireflies. */
  motes(o: Place & { radius?: number; height?: number; count?: number; color?: string; size?: number; speed?: number } = {}): THREE.Points {
    const n = o.count ?? 160, R = o.radius ?? 4, H = o.height ?? 6;
    const pos = new Float32Array(n * 3), seed = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const a = this.r(0, TAU), d = Math.sqrt(this.rnd()) * R;
      pos[i * 3] = Math.cos(a) * d;
      pos[i * 3 + 1] = this.r(0, H);
      pos[i * 3 + 2] = Math.sin(a) * d;
      seed[i] = this.rnd();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('seed', new THREE.BufferAttribute(seed, 1));
    const mat = motesMaterial(o.color ?? this.palette.glow, o.size ?? 0.08, H, o.speed ?? 0.25);
    const pts = new THREE.Points(geo, mat);
    pts.position.copy(toV3(o.at));
    pts.frustumCulled = false;
    pts.renderOrder = 9;
    pts.name = 'kit:motes';
    this.extraGeos.add(geo);
    this.extraMats.add(mat);
    (o.parent ?? this.root).add(pts);
    return pts;
  }

  // -------------------------------------------------------------------------------------------
  // Props
  // -------------------------------------------------------------------------------------------
  crate(o: Place & { size?: number; color?: string; collide?: boolean } = {}): THREE.Group {
    const g = this.group(o, 'crate');
    const s = o.size ?? 0.9;
    const col = o.color ?? this.palette.wood;
    const core = rbox(s * 0.94, s * 0.94, s * 0.94, 0.03, 1);
    this.part(g, core, 'wood', { at: [0, s / 2, 0], color: col, jitter: 0.8, ao: 0.3, aoHeight: s, uv: 'box', uvScale: 0.6 });
    const f = s * 0.12, dark = shadeHex(col, -0.25);
    for (const y of [f / 2, s - f / 2]) {
      for (const z of [-1, 1]) this.part(g, rbox(s, f, f, 0.02, 1), 'wood', { at: [0, y, z * (s / 2 - f / 2)], color: dark, ao: 0, uv: 'box' });
      for (const x of [-1, 1]) this.part(g, rbox(f, f, s - 2 * f, 0.02, 1), 'wood', { at: [x * (s / 2 - f / 2), y, 0], color: dark, ao: 0, uv: 'box' });
    }
    for (const x of [-1, 1]) for (const z of [-1, 1]) this.part(g, rbox(f, s - 2 * f, f, 0.02, 1), 'wood', { at: [x * (s / 2 - f / 2), s / 2, z * (s / 2 - f / 2)], color: dark, ao: 0.2, uv: 'box' });
    // Diagonal brace on two faces.
    const diag = Math.hypot(s - 2 * f, s - 2 * f);
    for (const z of [-1, 1]) {
      const b = rbox(diag * 0.95, f * 0.8, f * 0.5, 0.02, 1);
      b.rotateZ(Math.PI / 4 * z);
      this.part(g, b, 'wood', { at: [0, s / 2, z * (s / 2 - f * 0.1)], color: dark, ao: 0, uv: 'box' });
    }
    for (const x of [-1, 1]) for (const z of [-1, 1]) for (const y of [0, 1]) {
      this.part(g, rbox(f * 1.2, f * 1.2, f * 1.2, 0.015, 1), 'brass', { at: [x * (s / 2 - f / 2), y ? s - f / 2 : f / 2, z * (s / 2 - f / 2)], ao: 0 });
    }
    if (o.collide !== false) this.colBox(g, [0, s / 2, 0], [s / 2, s / 2, s / 2], ['solid']);
    return g;
  }

  barrel(o: Place & { radius?: number; height?: number; color?: string; collide?: boolean } = {}): THREE.Group {
    const g = this.group(o, 'barrel');
    const R = o.radius ?? 0.4, H = o.height ?? 1.0;
    const staves = 14;
    const prof: THREE.Vector2[] = [];
    for (let i = 0; i <= 8; i++) {
      const t = i / 8;
      prof.push(new THREE.Vector2(R * (0.86 + 0.14 * Math.sin(t * Math.PI)), t * H));
    }
    const body = new THREE.LatheGeometry(prof, staves);
    const bodyF = flatten(body);
    this.part(g, bodyF, 'wood', { color: o.color, ao: 0.3, aoHeight: H, uv: 'box', uvScale: 0.5 });
    // Stave tone variation (per face): tint by angle sector.
    const col = bodyF.attributes.color, pos = bodyF.attributes.position;
    for (let i = 0; i < col.count; i += 3) {
      const cx = (pos.getX(i) + pos.getX(i + 1) + pos.getX(i + 2)) / 3, cz = (pos.getZ(i) + pos.getZ(i + 1) + pos.getZ(i + 2)) / 3;
      const k = Math.floor(((Math.atan2(cz, cx) + Math.PI) / TAU) * staves);
      const f = 0.85 + hash3(k, 1, 2, 3) * 0.3;
      for (let j = 0; j < 3; j++) col.setXYZ(i + j, col.getX(i + j) * f, col.getY(i + j) * f, col.getZ(i + j) * f);
    }
    for (const t of [0.12, 0.38, 0.62, 0.88]) {
      const rr = R * (0.86 + 0.14 * Math.sin(t * Math.PI)) + 0.012;
      const hoop = new THREE.TorusGeometry(rr, 0.022, 4, 28);
      hoop.rotateX(Math.PI / 2);
      this.part(g, hoop, 'iron', { at: [0, t * H, 0], ao: 0 });
    }
    const lid = new THREE.CircleGeometry(R * 0.84, 20);
    lid.rotateX(-Math.PI / 2);
    this.part(g, lid, 'wood', { at: [0, H - 0.03, 0], color: shadeHex(o.color ?? this.palette.wood, -0.15), ao: 0, uv: 'box' });
    if (o.collide !== false) this.colCyl(g, [0, H / 2, 0], R, H / 2, ['solid']);
    return g;
  }

  /**
   * Pipe run through `points` (world-relative to at), with bends, flanges and optional valves.
   * `color` paints it (GDD: each valve's pipe is painted its own colour); otherwise brass.
   * group.userData.valves = [{ wheel, segment }] (dynamic; spin the wheel to animate).
   */
  pipes(o: Place & { points: readonly P3[]; radius?: number; color?: string; valves?: number[]; valveColor?: string; collide?: boolean }): THREE.Group {
    const g = this.group(o, 'pipes');
    const r = o.radius ?? 0.13;
    const pts = o.points.map(toV3);
    const mat: MaterialName = o.color ? 'paint' : 'brass';
    const path = new THREE.CurvePath<THREE.Vector3>();
    const bend = r * 2.5;
    let cursor = pts[0].clone();
    for (let i = 1; i < pts.length; i++) {
      const p = pts[i];
      if (i < pts.length - 1) {
        const inDir = p.clone().sub(pts[i - 1]).normalize();
        const outDir = pts[i + 1].clone().sub(p).normalize();
        const a = p.clone().addScaledVector(inDir, -bend);
        const b = p.clone().addScaledVector(outDir, bend);
        path.add(new THREE.LineCurve3(cursor, a));
        path.add(new THREE.QuadraticBezierCurve3(a, p.clone(), b));
        cursor = b;
      } else {
        path.add(new THREE.LineCurve3(cursor, p.clone()));
      }
    }
    const total = path.getLength();
    const tube = new THREE.TubeGeometry(path as unknown as THREE.Curve<THREE.Vector3>, Math.max(16, Math.round(total * 8 + pts.length * 10)), r, 14, false);
    this.part(g, tube, mat, { color: o.color, ao: 0, uv: 'keep' });
    const flange = (at: THREE.Vector3, dir: THREE.Vector3) => {
      const f = new THREE.CylinderGeometry(r * 1.45, r * 1.45, 0.08, 16);
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      f.applyQuaternion(q);
      f.translate(at.x, at.y, at.z);
      this.part(g, f, 'brass', { color: this.palette.brass, ao: 0 });
      for (let k = 0; k < 6; k++) {
        const bolt = new THREE.SphereGeometry(0.022, 6, 4);
        const ang = (k / 6) * TAU;
        const side = new THREE.Vector3(Math.cos(ang), 0, Math.sin(ang)).multiplyScalar(r * 1.25).applyQuaternion(q);
        bolt.translate(at.x + side.x, at.y + side.y, at.z + side.z);
        this.part(g, bolt, 'iron', { ao: 0 });
      }
    };
    for (let i = 0; i < pts.length; i++) {
      const dir = (i < pts.length - 1 ? pts[i + 1].clone().sub(pts[i]) : pts[i].clone().sub(pts[i - 1])).normalize();
      if (i === 0 || i === pts.length - 1) flange(pts[i].clone().addScaledVector(dir, i === 0 ? 0.04 : -0.04), dir);
      else {
        const inDir = pts[i].clone().sub(pts[i - 1]).normalize();
        flange(pts[i].clone().addScaledVector(inDir, -bend - 0.04), inDir);
        flange(pts[i].clone().addScaledVector(dir, bend + 0.04), dir);
      }
    }
    const valves: { wheel: THREE.Object3D; segment: number }[] = [];
    for (const si of o.valves ?? []) {
      if (si < 0 || si >= pts.length - 1) continue;
      const a = pts[si], b = pts[si + 1];
      const mid = a.clone().lerp(b, 0.5);
      const dir = b.clone().sub(a).normalize();
      let out = new THREE.Vector3(0, 1, 0).cross(dir);
      if (out.lengthSq() < 0.01) out = new THREE.Vector3(0, 0, 1);
      out.normalize();
      const housing = rbox(r * 2.6, r * 2.6, r * 2.6, r * 0.4, 1);
      this.part(g, housing, 'brass', { at: mid, color: this.palette.brass, ao: 0 });
      const stem = new THREE.CylinderGeometry(0.035, 0.035, 0.34, 8);
      stem.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), out));
      const sp = mid.clone().addScaledVector(out, r * 1.3 + 0.17);
      stem.translate(sp.x, sp.y, sp.z);
      this.part(g, stem, 'iron', { ao: 0 });
      const wheel = new THREE.Group();
      wheel.position.copy(mid).addScaledVector(out, r * 1.3 + 0.34);
      wheel.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), out);
      g.add(wheel);
      const rim = new THREE.TorusGeometry(0.22, 0.03, 8, 24);
      this.part(wheel, rim, 'paint', { color: o.valveColor ?? o.color ?? this.palette.paint, ao: 0, dynamic: true });
      for (let k = 0; k < 3; k++) {
        const spoke = rbox(0.44, 0.035, 0.035, 0.01, 1);
        spoke.rotateZ((k / 3) * Math.PI);
        this.part(wheel, spoke, 'paint', { color: o.valveColor ?? o.color ?? this.palette.paint, ao: 0, dynamic: true });
      }
      const hub = new THREE.SphereGeometry(0.06, 10, 8);
      this.part(wheel, hub, 'brass', { ao: 0, dynamic: true });
      valves.push({ wheel, segment: si });
    }
    g.userData.valves = valves;
    if (o.collide !== false && r >= 0.18) {
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i], b = pts[i + 1];
        const d = b.clone().sub(a);
        const mid = a.clone().lerp(b, 0.5);
        if (Math.abs(d.y) > 0.01 && (Math.abs(d.x) > 0.01 || Math.abs(d.z) > 0.01)) continue;
        const L = d.length();
        if (Math.abs(d.y) > 0.01) this.colBox(g, [mid.x, mid.y, mid.z], [r, L / 2, r], ['solid']);
        else this.colBox(g, [mid.x, mid.y, mid.z], [r, r, L / 2], ['solid'], Math.atan2(d.x, d.z));
      }
    }
    return g;
  }

  /** Hanging bronze bell (group origin = hang point). userData.swing = pivot to rotate; userData.clapper. */
  bell(o: Place & { size?: number; color?: string; yoke?: boolean; dynamic?: boolean } = {}): THREE.Group {
    const g = this.group(o, 'bell');
    const S = o.size ?? 1.2;
    const dyn = o.dynamic ?? true;
    const col = o.color ?? mixHex(this.palette.brass, '#8a5a2b', 0.35);
    const pivot = new THREE.Group();
    g.add(pivot);
    const P = [[0.0, 1.0], [0.16, 1.0], [0.23, 0.97], [0.28, 0.9], [0.3, 0.76], [0.31, 0.58], [0.34, 0.42], [0.4, 0.28], [0.47, 0.16], [0.53, 0.06], [0.55, 0.01], [0.53, 0.0], [0.47, 0.03], [0.42, 0.1], [0.34, 0.3], [0.27, 0.6], [0.24, 0.86], [0.0, 0.9]];
    const prof = P.map(([x, y]) => new THREE.Vector2(x * S, (y - 1.08) * S));
    const body = new THREE.LatheGeometry(prof, 40);
    this.part(pivot, body, 'brass', { color: col, ao: 0.2, aoHeight: S, dynamic: dyn, uv: 'box' });
    for (const t of [0.12, 0.2]) {
      const band = new THREE.TorusGeometry(S * (0.51 - t * 0.6), S * 0.012, 6, 40);
      band.rotateX(Math.PI / 2);
      this.part(pivot, band, 'gold', { at: [0, (t - 1.08) * S, 0], color: shadeHex(col, 0.25), ao: 0, dynamic: dyn });
    }
    const crown = new THREE.TorusGeometry(S * 0.09, S * 0.03, 8, 16);
    this.part(pivot, crown, 'brass', { at: [0, -0.02 * S, 0], color: col, ao: 0, dynamic: dyn });
    const clapper = new THREE.Group();
    clapper.position.y = -0.2 * S;
    pivot.add(clapper);
    const rod = new THREE.CylinderGeometry(S * 0.02, S * 0.02, S * 0.7, 8);
    this.part(clapper, rod, 'iron', { at: [0, -0.35 * S, 0], ao: 0, dynamic: true });
    const ball = new THREE.SphereGeometry(S * 0.08, 12, 10);
    this.part(clapper, ball, 'iron', { at: [0, -0.72 * S, 0], ao: 0, dynamic: true });
    if (o.yoke !== false) {
      const beam = rbox(S * 1.5, S * 0.16, S * 0.2, 0.03, 1);
      this.part(g, beam, 'wood', { at: [0, 0.06 * S, 0], color: this.palette.woodDark, ao: 0, uv: 'box' });
    }
    g.userData.swing = pivot;
    g.userData.clapper = clapper;
    return g;
  }

  /**
   * Tuning-fork pylon (GDD 1A): stone plinth, bronze stem, U tines, glowing pitch band.
   * userData.glow = mesh with its own material (flash it), userData.tines for vibration.
   */
  tuningFork(o: Place & { height?: number; color?: string; crooked?: boolean; plinth?: boolean; desaturate?: number } = {}): THREE.Group {
    const g = this.group(o, 'tuningFork');
    const H = o.height ?? 3.2;
    let col = o.color ?? this.palette.accent;
    if (o.desaturate) col = adjustHsl(col, 0, 1 - o.desaturate, 0);
    const bronze = mixHex(this.palette.brass, '#8a5a2b', 0.3);
    let y0 = 0;
    if (o.plinth !== false) {
      const pl = prism(circlePts(0.62, 8, Math.PI / 8), 0.6, 0.06, { bottom: true });
      this.part(g, pl, 'stone', { color: this.palette.stone, ao: 0.3, uv: 'box' });
      const cap = prism(circlePts(0.52, 8, Math.PI / 8), 0.08, 0.03);
      this.part(g, cap, 'brass', { at: [0, 0.6, 0], color: bronze, ao: 0 });
      y0 = 0.68;
      this.colCyl(g, [0, 0.3, 0], 0.62, 0.3, ['solid']);
    }
    const stemH = H * 0.3;
    const knob = new THREE.SphereGeometry(0.16, 16, 12);
    this.part(g, knob, 'brass', { at: [0, y0 + 0.12, 0], color: bronze, ao: 0 });
    const stem = new THREE.CylinderGeometry(0.075, 0.09, stemH, 14);
    this.part(g, stem, 'brass', { at: [0, y0 + stemH / 2, 0], color: bronze, ao: 0 });
    const w = 0.24, tineR = 0.075;
    const yb = y0 + stemH + w;
    const tines = new THREE.Group();
    g.add(tines);
    const path = new THREE.CurvePath<THREE.Vector3>();
    const top = y0 + H;
    const lean = o.crooked ? 0.22 : 0;
    path.add(new THREE.CubicBezierCurve3(new THREE.Vector3(-w - lean, top, 0), new THREE.Vector3(-w - lean * 0.5, top * 0.7 + yb * 0.3, 0), new THREE.Vector3(-w, yb + 0.3, 0), new THREE.Vector3(-w, yb, 0)));
    path.add(new THREE.QuadraticBezierCurve3(new THREE.Vector3(-w, yb, 0), new THREE.Vector3(0, yb - w * 1.9, 0), new THREE.Vector3(w, yb, 0)));
    path.add(new THREE.LineCurve3(new THREE.Vector3(w, yb, 0), new THREE.Vector3(w, top, 0)));
    const tube = new THREE.TubeGeometry(path as unknown as THREE.Curve<THREE.Vector3>, 64, tineR, 12, false);
    this.part(tines, tube, 'brass', { color: bronze, ao: 0, uv: 'keep', dynamic: true });
    for (const x of [-w - lean, w]) {
      const capG = new THREE.SphereGeometry(tineR, 12, 8);
      this.part(tines, capG, 'brass', { at: [x, top, 0], color: bronze, ao: 0, dynamic: true });
    }
    const band = new THREE.TorusGeometry(0.105, 0.035, 8, 24);
    band.rotateX(Math.PI / 2);
    const glowMat = this.mats.unique(this.mats.glow(col, 2.5));
    const glow = new THREE.Mesh(band, glowMat);
    glow.position.y = y0 + stemH * 0.7;
    g.add(glow);
    this.extraGeos.add(band);
    const gem = new THREE.OctahedronGeometry(0.1, 0);
    const gemMesh = new THREE.Mesh(gem, glowMat);
    gemMesh.position.set(0, yb - w * 0.9, 0.02);
    gemMesh.scale.set(1, 1.4, 0.6);
    g.add(gemMesh);
    this.extraGeos.add(gem);
    this.halo(g, new THREE.Vector3(0, yb - w * 0.9, 0.05), col, 1.2, 0.4);
    this.colCyl(g, [0, y0 + H / 2, 0], w + tineR, H / 2, ['solid']);
    g.userData.glow = glow;
    g.userData.glowMaterial = glowMat;
    g.userData.tines = tines;
    g.userData.color = col;
    return g;
  }

  /** Pressure plate flush with the floor; userData.plate (dynamic, press by lowering y), userData.glowMaterial. */
  pressurePlate(o: Place & { radius?: number; color?: string; letter?: RoomLetter } = {}): THREE.Group {
    const g = this.group(o, 'pressurePlate');
    const R = o.radius ?? 0.55;
    const col = o.color ?? this.letterColor(o.letter);
    const ring = this.annulus(R + 0.02, R + 0.22, -0.05, 0.03, 32, 0.02);
    this.part(g, ring, 'stone', { color: this.palette.stoneDark, ao: 0 });
    const plate = new THREE.Group();
    g.add(plate);
    const disc = prism(circlePts(R, 32), 0.08, 0.02, { smooth: true });
    this.part(plate, disc, 'brass', { at: [0, -0.03, 0], color: this.palette.brass, ao: 0, dynamic: true });
    const glowMat = this.mats.unique(this.mats.glow(col, 2.2));
    const t = new THREE.TorusGeometry(R * 0.72, 0.025, 6, 40);
    t.rotateX(Math.PI / 2);
    const tm = new THREE.Mesh(t, glowMat);
    tm.position.y = 0.055;
    plate.add(tm);
    this.extraGeos.add(t);
    const dot = new THREE.CircleGeometry(R * 0.18, 20);
    dot.rotateX(-Math.PI / 2);
    const dm = new THREE.Mesh(dot, glowMat);
    dm.position.y = 0.052;
    plate.add(dm);
    this.extraGeos.add(dot);
    this.colCyl(g, [0, -0.02, 0], R, 0.05, ['solid']);
    g.userData.plate = plate;
    g.userData.glowMaterial = glowMat;
    return g;
  }

  /** Floor lever. userData.handle = pivot (rotation.x from -0.6 to 0.6). */
  lever(o: Place & { color?: string; state?: number } = {}): THREE.Group {
    const g = this.group(o, 'lever');
    const base = rbox(0.55, 0.42, 0.42, 0.06, 2);
    this.part(g, base, 'stone', { at: [0, 0.21, 0], color: this.palette.stoneDark, ao: 0.2 });
    for (const s of [-1, 1]) this.part(g, rbox(0.08, 0.3, 0.36, 0.02, 1), 'iron', { at: [s * 0.14, 0.52, 0], ao: 0 });
    const handle = new THREE.Group();
    handle.position.set(0, 0.52, 0);
    g.add(handle);
    const axle = new THREE.CylinderGeometry(0.04, 0.04, 0.34, 10);
    axle.rotateZ(Math.PI / 2);
    this.part(handle, axle, 'brass', { ao: 0, dynamic: true });
    const shaft = new THREE.CylinderGeometry(0.035, 0.045, 0.8, 10);
    this.part(handle, shaft, 'iron', { at: [0, 0.4, 0], ao: 0, dynamic: true });
    const knob = new THREE.SphereGeometry(0.09, 14, 10);
    this.part(handle, knob, 'paint', { at: [0, 0.82, 0], color: o.color ?? this.palette.paint, ao: 0, dynamic: true });
    handle.rotation.x = -0.6 + 1.2 * (o.state ?? 0);
    this.colBox(g, [0, 0.21, 0], [0.28, 0.21, 0.21], ['solid']);
    g.userData.handle = handle;
    return g;
  }

  /** Hanging banner facing +Z (at = top-centre of the rod). Cloth sways gently (kit.update). */
  banner(o: Place & { width?: number; height?: number; color?: string; trim?: string; emblem?: string; letter?: RoomLetter } = {}): THREE.Group {
    const g = this.group(o, 'banner');
    const W = o.width ?? 1.2, H = o.height ?? 2.6;
    const color = o.color ?? this.palette.cloth;
    const trim = o.trim ?? this.palette.brass;
    const emblem = o.emblem ?? (o.letter ? (o.letter === 'CROWN' ? '♛' : o.letter) : 'rune:3');
    const rod = new THREE.CylinderGeometry(0.035, 0.035, W + 0.35, 10);
    rod.rotateZ(Math.PI / 2);
    this.part(g, rod, 'brass', { ao: 0 });
    for (const s of [-1, 1]) this.part(g, new THREE.SphereGeometry(0.07, 10, 8), 'brass', { at: [s * (W / 2 + 0.2), 0, 0], ao: 0 });
    const clothPivot = new THREE.Group();
    g.add(clothPivot);
    const cloth = new THREE.PlaneGeometry(W, H, 10, 20);
    const pos = cloth.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i);
      const t = (H / 2 - y) / H;
      pos.setZ(i, Math.sin((x / W) * Math.PI * 3 + 0.5) * 0.05 * (0.3 + t) + t * t * 0.08);
    }
    cloth.translate(0, -H / 2 - 0.03, 0.03);
    cloth.computeVertexNormals();
    const cm = new THREE.Mesh(cloth, this.mats.banner(color, trim, emblem));
    cm.castShadow = this.shadows;
    cm.receiveShadow = true;
    clothPivot.add(cm);
    this.extraGeos.add(cloth);
    this.swayers.push({ obj: clothPivot, amp: 0.04, phase: this.r(0, TAU), axis: 'x' });
    g.userData.cloth = clothPivot;
    return g;
  }

  /** Abstract statue on a stepped pedestal: 'frog' (looks up at the sky), 'hooded' (holds a glowing orb), 'totem'. */
  statue(o: Place & { kind?: 'frog' | 'hooded' | 'totem'; scale?: number; material?: MaterialName; color?: string; glow?: string } = {}): THREE.Group {
    const g = this.group(o, 'statue');
    const S = o.scale ?? 1;
    const mat = o.material ?? 'stone';
    const col = o.color ?? this.palette.stoneLight;
    const glowCol = o.glow ?? this.palette.accent2;
    const ped1 = prism(circlePts(1.15 * S, 8, Math.PI / 8), 0.3 * S, 0.05, { bottom: true });
    this.part(g, ped1, 'stone', { color: this.palette.stoneDark, ao: 0.2, uv: 'box' });
    const ped2 = prism(circlePts(0.95 * S, 8, Math.PI / 8), 0.35 * S, 0.05);
    this.part(g, ped2, 'stone', { at: [0, 0.3 * S, 0], color: this.palette.stone, ao: 0.1, uv: 'box' });
    const body = new THREE.Group();
    body.position.y = 0.65 * S;
    body.scale.setScalar(S);
    g.add(body);
    const kind = o.kind ?? 'hooded';
    if (kind === 'frog') {
      const torso = new THREE.SphereGeometry(0.72, 28, 20);
      torso.scale(1.15, 0.78, 1.0);
      this.part(body, torso, mat, { at: [0, 0.55, -0.05], color: col, ao: 0.35, uvScale: 0.5 });
      const head = new THREE.SphereGeometry(0.58, 28, 20);
      head.scale(1.25, 0.72, 1.0);
      head.rotateX(-0.45);
      this.part(body, head, mat, { at: [0, 1.02, 0.28], color: col, ao: 0, uvScale: 0.5 });
      for (const s of [-1, 1]) {
        const eye = new THREE.SphereGeometry(0.24, 20, 14);
        this.part(body, eye, mat, { at: [s * 0.4, 1.42, 0.3], color: col, ao: 0 });
        const pupil = new THREE.SphereGeometry(0.12, 14, 10);
        pupil.scale(1, 1, 0.5);
        this.part(body, pupil, 'glow', { at: [s * 0.44, 1.55, 0.43], rot: [-0.9, 0, 0], color: glowCol, ao: 0 });
        const leg = new THREE.SphereGeometry(0.34, 16, 12);
        leg.scale(0.9, 0.6, 1.4);
        this.part(body, leg, mat, { at: [s * 0.72, 0.22, -0.15], color: col, ao: 0.3 });
        const arm = rbox(0.18, 0.5, 0.2, 0.08, 2);
        arm.rotateX(0.25);
        this.part(body, arm, mat, { at: [s * 0.45, 0.25, 0.55], color: col, ao: 0.3 });
        const foot = new THREE.SphereGeometry(0.16, 12, 8);
        foot.scale(1.4, 0.4, 1.2);
        this.part(body, foot, mat, { at: [s * 0.5, 0.04, 0.72], color: col, ao: 0 });
      }
      const mouth = new THREE.TorusGeometry(0.45, 0.025, 6, 24, Math.PI * 0.7);
      mouth.rotateZ(Math.PI * 1.15);
      mouth.rotateX(-0.45);
      this.part(body, mouth, mat, { at: [0, 1.0, 0.72], color: shadeHex(col, -0.4), ao: 0 });
      this.halo(body, new THREE.Vector3(0, 1.55, 0.45), glowCol, 1.4, 0.35);
    } else if (kind === 'hooded') {
      const robe = new THREE.LatheGeometry([new THREE.Vector2(0.001, 0), new THREE.Vector2(0.72, 0), new THREE.Vector2(0.7, 0.14), new THREE.Vector2(0.58, 0.9), new THREE.Vector2(0.46, 1.6), new THREE.Vector2(0.4, 1.95), new THREE.Vector2(0.24, 2.1), new THREE.Vector2(0.001, 2.12)], 24);
      this.part(body, robe, mat, { color: col, ao: 0.3, aoHeight: 1.2, uvScale: 0.5 });
      const hood = new THREE.SphereGeometry(0.36, 22, 16, 0, TAU, 0, Math.PI * 0.62);
      hood.scale(1, 1.15, 1.05);
      this.part(body, hood, mat, { at: [0, 2.2, -0.02], color: col, ao: 0 });
      const peak = new THREE.ConeGeometry(0.2, 0.35, 16);
      peak.rotateX(-0.5);
      this.part(body, peak, mat, { at: [0, 2.58, -0.15], color: col, ao: 0 });
      const face = new THREE.CircleGeometry(0.24, 20);
      this.part(body, face, 'iron', { at: [0, 2.22, 0.3], color: '#0b0a12', ao: 0, cast: false });
      for (const s of [-1, 1]) this.part(body, new THREE.SphereGeometry(0.035, 8, 6), 'glow_hot', { at: [s * 0.08, 2.26, 0.31], color: glowCol, ao: 0 });
      for (const s of [-1, 1]) {
        const arm = new THREE.CylinderGeometry(0.1, 0.13, 0.7, 10);
        arm.rotateX(-1.1);
        arm.rotateZ(s * 0.25);
        this.part(body, arm, mat, { at: [s * 0.3, 1.45, 0.3], color: col, ao: 0 });
        this.part(body, new THREE.SphereGeometry(0.1, 10, 8), mat, { at: [s * 0.2, 1.3, 0.62], color: col, ao: 0 });
      }
      const orb = new THREE.IcosahedronGeometry(0.22, 2);
      this.part(body, orb, 'glow', { at: [0, 1.42, 0.7], color: glowCol, ao: 0 });
      this.halo(body, new THREE.Vector3(0, 1.42, 0.7), glowCol, 2.4, 0.6);
      const halo = new THREE.TorusGeometry(0.62, 0.025, 6, 48);
      this.part(body, halo, 'glow_soft', { at: [0, 2.3, -0.32], color: glowCol, ao: 0 });
    } else {
      let y = 0;
      for (let i = 0; i < 4; i++) {
        const w = 0.9 - i * 0.12, h = 0.55 - i * 0.05;
        const b = rbox(w, h, w, 0.12, 2);
        b.rotateY(i * 0.4);
        this.part(body, b, mat, { at: [0, y + h / 2, 0], color: col, jitter: 0.6, ao: 0.2 });
        y += h;
      }
      const eye = new THREE.TorusGeometry(0.13, 0.04, 8, 20);
      this.part(body, eye, 'glow', { at: [0, 1.45, 0.34], color: glowCol, ao: 0 });
      this.halo(body, new THREE.Vector3(0, 1.45, 0.4), glowCol, 1.2, 0.4);
    }
    this.colCyl(g, [0, 1.3 * S, 0], 1.0 * S, 1.3 * S, ['solid']);
    return g;
  }

  /** Faceted glowing crystals (hex prisms with points). hang = point downward (under islands). */
  crystalCluster(o: Place & { count?: number; height?: number; color?: string; color2?: string; hang?: boolean; light?: boolean; seed?: number } = {}): THREE.Group {
    const g = this.group(o, 'crystalCluster');
    const n = o.count ?? 5, H = o.height ?? 1.2;
    const c1 = o.color ?? this.palette.crystal, c2 = o.color2 ?? this.palette.crystalAlt;
    const flip = o.hang ? -1 : 1;
    for (let i = 0; i < n; i++) {
      const h = H * (i === 0 ? 1 : this.r(0.35, 0.8));
      const r = h * this.r(0.14, 0.2);
      const prof = [new THREE.Vector2(0.001, -0.1), new THREE.Vector2(r * 0.9, -0.1), new THREE.Vector2(r, h * 0.7), new THREE.Vector2(0.001, h)];
      const geo = flatten(new THREE.LatheGeometry(prof, 6, this.r(0, 1)));
      const tiltA = this.r(0, TAU), tiltR = i === 0 ? this.r(0, 0.12) : this.r(0.25, 0.7);
      geo.rotateX(Math.sin(tiltA) * tiltR);
      geo.rotateZ(Math.cos(tiltA) * tiltR);
      if (flip < 0) geo.rotateX(Math.PI);
      const off = i === 0 ? 0 : H * 0.25;
      this.part(g, geo, 'crystal', { at: [Math.cos(tiltA) * off, 0, Math.sin(tiltA) * off], color: this.rnd() < 0.7 ? c1 : c2, jitter: 0.4, ao: 0.1, aoHeight: h * 0.4, uv: 'box', cast: true });
    }
    const base = rockGeo(H * 0.3, Math.floor(this.r(0, 1e5)), 0, 0.5, 0.3);
    this.part(g, base, 'rock', { at: [0, flip * 0.02, 0], ao: 0, uv: 'box' });
    if (o.light) this.addLight(g, new THREE.Vector3(0, flip * H * 0.5, 0), c1, 5, 5, null, 0.05);
    return g;
  }

  /** Soft stylized cloud: clustered spheres, sunlit top, shaded belly. solid = walkable bouncy top. */
  cloudPuff(o: Place & { scale?: number; seed?: number; solid?: boolean; color?: string } = {}): THREE.Group {
    const g = this.group(o, 'cloudPuff');
    const S = o.scale ?? 1;
    const seed = o.seed ?? Math.floor(this.r(0, 1e6));
    const rnd = mulberry32(seed);
    const n = 6 + Math.floor(rnd() * 4);
    const parts: THREE.BufferGeometry[] = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU + rnd() * 0.6;
      const d = i === 0 ? 0 : S * (0.55 + rnd() * 0.5);
      const r = S * (i === 0 ? 0.95 : 0.45 + rnd() * 0.4);
      const sp = new THREE.IcosahedronGeometry(r, 3);
      const pos = sp.attributes.position;
      for (let k = 0; k < pos.count; k++) {
        _v.fromBufferAttribute(pos, k);
        const f = 1 + (noise3(_v.x * 1.8 / S, _v.y * 1.8 / S, _v.z * 1.8 / S, seed + i) - 0.5) * 0.18;
        _v.multiplyScalar(f);
        if (_v.y < -r * 0.25) _v.y = -r * 0.25 + (_v.y + r * 0.25) * 0.35;
        pos.setXYZ(k, _v.x, _v.y, _v.z);
      }
      sp.translate(Math.cos(a) * d, r * 0.25 + (i === 0 ? S * 0.15 : 0), Math.sin(a) * d * 0.8);
      sp.deleteAttribute('uv');
      sp.deleteAttribute('normal');
      const welded = mergeVertices(sp, 1e-4);
      sp.dispose();
      welded.computeVertexNormals();
      parts.push(welded);
    }
    const merged = mergeGeometries(parts, false);
    for (const p of parts) p.dispose();
    if (!merged) return g;
    this.part(g, merged, 'cloud', { color: o.color ?? this.palette.sky.cloudShade, topColor: this.palette.sky.cloud, ao: 0, uv: 'keep' });
    if (o.solid) this.colCyl(g, [0, S * 0.4, 0], S * 1.1, S * 0.4, ['bouncy']);
    return g;
  }

  /** Lily pad with a notch, radial veins in vertex colour; optional glowing lotus. */
  lilyPad(o: Place & { radius?: number; flower?: boolean; flowerColor?: string; collide?: boolean } = {}): THREE.Group {
    const g = this.group(o, 'lilyPad');
    const R = o.radius ?? 0.6;
    const notch = this.r(0.3, 0.5);
    const segs = 28;
    const pts: THREE.Vector2[] = [new THREE.Vector2(0, 0)];
    for (let i = 0; i <= segs; i++) {
      const a = notch / 2 + (i / segs) * (TAU - notch);
      pts.push(new THREE.Vector2(Math.cos(a) * R, Math.sin(a) * R));
    }
    const shape = new THREE.Shape(pts);
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.035, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.02, bevelSegments: 1, curveSegments: 4 });
    geo.rotateX(-Math.PI / 2);
    geo.rotateY(this.r(0, TAU));
    this.part(g, geo, 'leaf', { color: this.palette.leaf, ao: 0, uv: 'box', cast: false });
    const col = geo.attributes.color, pos = geo.attributes.position;
    const light = new THREE.Color(adjustHsl(this.palette.leaf, 0.02, 1, 0.12));
    for (let i = 0; i < col.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      const a = Math.atan2(z, x), d = Math.hypot(x, z) / R;
      const vein = Math.pow(Math.abs(Math.cos(a * 7)), 12) * d;
      const c = new THREE.Color(col.getX(i), col.getY(i), col.getZ(i)).lerp(light, Math.min(1, vein + d * 0.25));
      col.setXYZ(i, c.r, c.g, c.b);
    }
    if (o.flower) {
      const fc = o.flowerColor ?? this.palette.petal;
      for (let ring = 0; ring < 2; ring++) {
        const np = ring ? 6 : 8;
        for (let i = 0; i < np; i++) {
          const a = (i / np) * TAU + ring * 0.4;
          const petal = new THREE.SphereGeometry(0.13 * (ring ? 0.8 : 1), 10, 8);
          petal.scale(0.45, 0.25, 1.1);
          petal.translate(0, 0, 0.11);
          petal.rotateX(-(ring ? 0.9 : 0.45));
          petal.rotateY(a);
          this.part(g, petal, 'petal', { at: [0, 0.06, 0], color: ring ? mixHex(fc, '#ffffff', 0.4) : fc, ao: 0, uv: 'keep', cast: false });
        }
      }
      this.part(g, new THREE.SphereGeometry(0.05, 10, 8), 'glow', { at: [0, 0.12, 0], color: this.palette.glow, ao: 0 });
      this.halo(g, new THREE.Vector3(0, 0.15, 0), fc, 0.9, 0.4);
    }
    if (o.collide && R >= 0.5) this.colCyl(g, [0, 0, 0], R * 0.9, 0.05, ['solid']);
    return g;
  }

  /** Small world: noise-displaced faceted sphere, height-banded colours, optional ring and moon. */
  planetoid(o: Place & { radius?: number; seed?: number; ring?: boolean; color?: string; color2?: string; moon?: boolean; solid?: boolean; atmosphere?: string | false } = {}): THREE.Group {
    const g = this.group(o, 'planetoid');
    const R = o.radius ?? 2.5;
    const seed = o.seed ?? Math.floor(this.r(0, 1e6));
    // Smooth sphere with gentle terraced relief: 'seas' (color2) sit flat at the base radius, land
    // (color) rises in two soft steps toward pale peaks. Reads as a toy globe, not a crumpled rock.
    const geo = new THREE.IcosahedronGeometry(R, 5);
    geo.deleteAttribute('normal');
    geo.deleteAttribute('uv');
    const welded = mergeVertices(geo, 1e-4);
    geo.dispose();
    const pos = welded.attributes.position;
    const land = new THREE.Color(o.color ?? this.palette.rock), sea = new THREE.Color(o.color2 ?? this.palette.crystal);
    const peak = land.clone().lerp(new THREE.Color('#ffffff'), 0.55);
    const shore = land.clone().lerp(sea, 0.35);
    const colors = new Float32Array(pos.count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      _v.fromBufferAttribute(pos, i).normalize();
      const n = noise3(_v.x * 1.7 + 3, _v.y * 1.7, _v.z * 1.7, seed) * 0.7 + noise3(_v.x * 4.3, _v.y * 4.3, _v.z * 4.3, seed + 1) * 0.3;
      // Terrace: flat sea below 0.5, then two eased steps.
      const t = Math.max(0, n - 0.5) / 0.5;
      const step = Math.min(1, (Math.floor(t * 3) + sstep(0.7, 1, (t * 3) % 1)) / 3);
      const lat = Math.abs(_v.y);
      if (n < 0.5) c.copy(sea).multiplyScalar(0.85 + 0.3 * n);
      else if (step < 0.34) c.copy(shore).lerp(land, step * 3);
      else c.copy(land).lerp(peak, (step - 0.34) * 1.5);
      if (lat > 0.84) c.lerp(WHITE, sstep(0.84, 0.92, lat + (n - 0.5) * 0.08) * 0.85);
      colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
      _v.multiplyScalar(R * (1 + step * 0.045));
      pos.setXYZ(i, _v.x, _v.y, _v.z);
    }
    welded.computeVertexNormals();
    const body = this.part(g, welded, 'rock', { ao: 0, uv: 'box' });
    body.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    if (o.atmosphere !== false) {
      const atmo = new THREE.IcosahedronGeometry(R * 1.1, 4);
      const am = new THREE.Mesh(atmo, this.mats.atmosphere(o.atmosphere ?? mixHex(o.color2 ?? this.palette.crystal, '#ffffff', 0.3), 1.3));
      am.renderOrder = 6;
      g.add(am);
      this.extraGeos.add(atmo);
    }
    if (o.ring !== false) {
      const ring = new THREE.RingGeometry(R * 1.45, R * 2.3, 96, 1);
      const uv = ring.attributes.uv, rp = ring.attributes.position;
      for (let i = 0; i < uv.count; i++) {
        const d = Math.hypot(rp.getX(i), rp.getY(i));
        uv.setXY(i, (d - R * 1.45) / (R * 0.85), 0.5);
      }
      ring.rotateX(-Math.PI / 2 + 0.35);
      ring.rotateZ(0.25);
      const rm = new THREE.Mesh(ring, this.mats.rings(o.color2 ?? this.palette.crystalAlt));
      rm.receiveShadow = true;
      g.add(rm);
      this.extraGeos.add(ring);
    }
    if (o.moon) {
      const pivot = new THREE.Group();
      g.add(pivot);
      const moon = rockGeo(R * 0.18, seed + 9, 1, 1, 0.2);
      this.part(pivot, moon, 'rock', { at: [R * 2.8, R * 0.3, 0], color: this.palette.stoneLight, ao: 0, dynamic: true });
      this.spinners.push({ obj: pivot, speed: 0.15 });
    }
    if (o.solid) this.colCyl(g, [0, 0, 0], R * 0.75, R * 0.9, ['solid']);
    return g;
  }

  /** Scattered faceted rocks / pebbles in a disc (merged). */
  rocks(o: Place & { radius?: number; count?: number; size?: number; material?: MaterialName; color?: string; collide?: boolean } = {}): THREE.Group {
    const g = this.group(o, 'rocks');
    const n = o.count ?? 8, R = o.radius ?? 2, S = o.size ?? 0.35;
    for (let i = 0; i < n; i++) {
      const a = this.r(0, TAU), d = Math.sqrt(this.rnd()) * R;
      const s = S * this.r(0.4, 1.2);
      const geo = rockGeo(s, Math.floor(this.r(0, 1e6)), 0, this.r(0.5, 0.9), 0.3);
      this.part(g, geo, o.material ?? 'rock', { at: [Math.cos(a) * d, s * 0.3, Math.sin(a) * d], rot: [0, this.r(0, TAU), 0], color: o.color, jitter: 0.8, ao: 0.3, aoHeight: s, uv: 'box' });
      if (o.collide && s > 0.3) this.colCyl(g, [Math.cos(a) * d, s * 0.4, Math.sin(a) * d], s * 0.8, s * 0.4, ['solid']);
    }
    return g;
  }

  /** Floating ring / halo (glowing torus) — "layers from the centre outwards". */
  haloRing(o: Place & { radius?: number; thickness?: number; color?: string; tilt?: readonly [number, number]; spin?: number; material?: MaterialName } = {}): THREE.Group {
    const g = this.group(o, 'haloRing');
    const R = o.radius ?? 3;
    const geo = new THREE.TorusGeometry(R, o.thickness ?? 0.05, 8, Math.max(48, Math.round(R * 24)));
    geo.rotateX(Math.PI / 2);
    const pivot = new THREE.Group();
    if (o.tilt) pivot.rotation.set(o.tilt[0], 0, o.tilt[1]);
    g.add(pivot);
    const spin = o.spin ?? 0;
    this.part(pivot, geo, o.material ?? 'glow_soft', { color: o.color ?? this.palette.glow, ao: 0, uv: 'keep', dynamic: spin !== 0, cast: false });
    if (spin) this.spinners.push({ obj: pivot, speed: spin });
    return g;
  }

  /** Water surface (own material so pools of different sizes coexist). Top at at.y. */
  water(o: Place & { radius?: number; width?: number; depth?: number; shape?: 'circle' | 'rect'; sparkle?: number } = {}): WaterHandle {
    const h = createWater({
      palette: this.palette, shape: o.shape ?? (o.width ? 'rect' : 'circle'), radius: o.radius, width: o.width, depth: o.depth,
      sparkle: o.sparkle, time: undefined,
    });
    h.mesh.position.copy(toV3(o.at));
    h.mesh.rotation.y = o.rotY ?? 0;
    (o.parent ?? this.root).add(h.mesh);
    this.waters.push(h);
    if (this.physics && this.suppressColliders === 0) {
      const at = toV3(o.at);
      if (h.material.uniforms.uShape.value === 0) this.track(this.root, this.physics.addCylinder(at.clone().setY(at.y - 0.5), o.radius ?? 4, 0.5, { tags: ['water'] }));
      else this.track(this.root, this.physics.addBox(at.clone().setY(at.y - 0.5), new THREE.Vector3((o.width ?? 8) / 2, 0.5, (o.depth ?? 8) / 2), { rotY: o.rotY ?? 0, tags: ['water'] }));
    }
    return h;
  }

  /**
   * Instance a template many times. `build` receives a detached parent; its meshes become one
   * InstancedMesh per mesh (same material, one draw each). Colliders are suppressed for the template;
   * pass `collider` to register a box/cylinder per instance from the template bounds.
   */
  instanced(build: (parent: THREE.Group) => void, placements: { at: P3; rotY?: number; scale?: number }[], o: { collider?: 'box' | 'cylinder' | 'none'; tags?: ColliderTag[] } = {}): THREE.Group {
    const holder = new THREE.Group();
    holder.name = 'kit:instanced';
    this.root.add(holder);
    const template = new THREE.Group();
    this.suppressColliders++;
    try {
      build(template);
    } finally {
      this.suppressColliders--;
    }
    template.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(template);
    const mats: THREE.Matrix4[] = placements.map((p) => new THREE.Matrix4().compose(toV3(p.at), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), p.rotY ?? 0), new THREE.Vector3().setScalar(p.scale ?? 1)));
    template.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      const geo = mesh.geometry.clone();
      geo.applyMatrix4(mesh.matrixWorld);
      const im = new THREE.InstancedMesh(geo, mesh.material, mats.length);
      mats.forEach((m, i) => im.setMatrixAt(i, m));
      im.instanceMatrix.needsUpdate = true;
      im.castShadow = mesh.castShadow;
      im.receiveShadow = mesh.receiveShadow;
      im.computeBoundingSphere();
      holder.add(im);
      this.stats_.instanced++;
    });
    disposeGeometries(template);
    if (o.collider && o.collider !== 'none') {
      const size = box.getSize(new THREE.Vector3()), center = box.getCenter(new THREE.Vector3());
      placements.forEach((p) => {
        const s = p.scale ?? 1;
        const c = center.clone().multiplyScalar(s).applyAxisAngle(new THREE.Vector3(0, 1, 0), p.rotY ?? 0).add(toV3(p.at));
        if (o.collider === 'box') this.colBox(holder, [c.x, c.y, c.z], [size.x * s / 2, size.y * s / 2, size.z * s / 2], o.tags, p.rotY ?? 0);
        else this.colCyl(holder, [c.x, c.y, c.z], Math.max(size.x, size.z) * s / 2, size.y * s / 2, o.tags);
      });
    }
    return holder;
  }

  // -------------------------------------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------------------------------------
  /** Merge every static kit mesh under root into one mesh per (material, shadow flags). Idempotent-ish: call once after building. */
  finalize(): KitStats {
    this.root.updateMatrixWorld(true);
    const inv = new THREE.Matrix4().copy(this.root.matrixWorld).invert();
    const buckets = new Map<string, { mat: THREE.Material; cast: boolean; recv: boolean; order: number; geos: THREE.BufferGeometry[] }>();
    const statics: THREE.Mesh[] = [];
    const walk = (o: THREE.Object3D): void => {
      if (o.userData.kitDynamic === true || o === this.mergedGroup) return;
      const m = o as THREE.Mesh;
      if (m.isMesh && m.userData.kitStatic === true && !(m as THREE.InstancedMesh).isInstancedMesh) statics.push(m);
      for (const c of o.children) walk(c);
    };
    walk(this.root);
    const m4 = new THREE.Matrix4();
    for (const mesh of statics) {
      const mat = mesh.material as THREE.Material;
      const key = `${mat.uuid}|${mesh.castShadow ? 1 : 0}${mesh.receiveShadow ? 1 : 0}`;
      let b = buckets.get(key);
      if (!b) {
        b = { mat, cast: mesh.castShadow, recv: mesh.receiveShadow, order: mesh.renderOrder, geos: [] };
        buckets.set(key, b);
      }
      const g = mesh.geometry.clone();
      m4.multiplyMatrices(inv, mesh.matrixWorld);
      g.applyMatrix4(m4);
      b.geos.push(ensureAttributes(g));
    }
    const keep = new Set<THREE.BufferGeometry>();
    for (const mesh of statics) mesh.removeFromParent();
    this.root.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) keep.add(m.geometry);
    });
    for (const mesh of statics) if (!keep.has(mesh.geometry)) mesh.geometry.dispose();
    if (!this.mergedGroup) {
      this.mergedGroup = new THREE.Group();
      this.mergedGroup.name = 'kit:merged';
      this.root.add(this.mergedGroup);
    }
    for (const b of buckets.values()) {
      const merged = mergeGeometries(b.geos, false);
      for (const g of b.geos) g.dispose();
      if (!merged) continue;
      merged.computeBoundingSphere();
      const mesh = new THREE.Mesh(merged, b.mat);
      mesh.castShadow = b.cast;
      mesh.receiveShadow = b.recv;
      mesh.renderOrder = b.order;
      mesh.name = `kit:merged:${b.mat.name}`;
      mesh.userData.kitMerged = true;
      this.mergedGroup.add(mesh);
      this.stats_.merged++;
    }
    this.mergeDynamic();
    return this.stats();
  }

  /** Merge sibling dynamic parts (same pivot, same material) so a door leaf or a valve wheel is one draw per material. */
  private mergeDynamic(): void {
    const flames = new Set<THREE.Object3D>();
    for (const f of this.flickers) if (f.flame) flames.add(f.flame);
    const byParent = new Map<THREE.Object3D, THREE.Mesh[]>();
    this.root.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh || m.userData.kitStatic !== false || m.userData.kitKeep || flames.has(m) || m.children.length || !m.parent) return;
      if ((m as THREE.InstancedMesh).isInstancedMesh) return;
      const list = byParent.get(m.parent) ?? [];
      list.push(m);
      byParent.set(m.parent, list);
    });
    for (const [parent, meshes] of byParent) {
      const buckets = new Map<string, THREE.Mesh[]>();
      for (const m of meshes) {
        const mat = m.material as THREE.Material;
        const key = `${mat.uuid}|${m.castShadow ? 1 : 0}${m.receiveShadow ? 1 : 0}`;
        const b = buckets.get(key) ?? [];
        b.push(m);
        buckets.set(key, b);
      }
      for (const list of buckets.values()) {
        if (list.length < 2) continue;
        const geos = list.map((m) => {
          m.updateMatrix();
          const g = m.geometry.clone();
          g.applyMatrix4(m.matrix);
          return ensureAttributes(g);
        });
        const merged = mergeGeometries(geos, false);
        for (const g of geos) g.dispose();
        if (!merged) continue;
        const first = list[0];
        const mesh = new THREE.Mesh(merged, first.material);
        mesh.castShadow = first.castShadow;
        mesh.receiveShadow = first.receiveShadow;
        mesh.renderOrder = first.renderOrder;
        mesh.userData.kitStatic = false;
        mesh.name = first.name;
        for (const m of list) {
          m.removeFromParent();
          m.geometry.dispose();
        }
        parent.add(mesh);
      }
    }
  }

  /** Per-frame cosmetics: shader clock, flame/lantern flicker, banner sway, spinners. */
  update(time: number, dt = 1 / 60): void {
    tickMaterials(time);
    for (const f of this.flickers) {
      const k = flicker(time, f.phase);
      if (f.light) f.light.intensity = f.base * (1 + 0.14 * k);
      if (f.flame) {
        const s = 1 + 0.07 * k;
        f.flame.scale.set(1 / Math.sqrt(s), s, 1 / Math.sqrt(s));
      }
    }
    for (const s of this.swayers) {
      const v = Math.sin(time * 1.3 + s.phase) * s.amp + Math.sin(time * 2.9 + s.phase * 1.7) * s.amp * 0.3;
      if (s.axis === 'x') s.obj.rotation.x = v;
      else s.obj.rotation.z = v;
    }
    for (const sp of this.spinners) sp.obj.rotation.y += sp.speed * dt;
    for (const w of this.waters) w.update(time);
  }

  stats(): KitStats {
    let drawables = 0, triangles = 0, dynamic = 0;
    this.root.traverse((o) => {
      const m = o as THREE.Mesh;
      if ((m.isMesh || (o as THREE.Points).isPoints || (o as THREE.Sprite).isSprite) && o.visible) {
        drawables++;
        if (m.userData.kitStatic === false) dynamic++;
        const g = m.geometry;
        if (g && m.isMesh) {
          const tris = (g.index ? g.index.count : g.attributes.position.count) / 3;
          triangles += (m as THREE.InstancedMesh).isInstancedMesh ? tris * (m as THREE.InstancedMesh).count : tris;
        }
      }
    });
    return { ...this.stats_, dynamic, drawables, triangles: Math.round(triangles), colliders: this.colliders.length, lights: this.lights.length, materials: this.mats.all().length };
  }

  /** Remove everything this kit created (geometry, own materials, lights, colliders, water). */
  dispose(): void {
    if (this.physics) for (const c of this.colliders) this.physics.remove(c);
    this.colliders.length = 0;
    for (const w of this.waters) w.dispose();
    this.waters.length = 0;
    for (const l of this.lights) l.dispose();
    this.lights.length = 0;
    const kids = [...this.root.children];
    for (const k of kids) {
      if (k.name.startsWith('kit:')) {
        disposeGeometries(k);
        k.removeFromParent();
      }
    }
    for (const g of this.extraGeos) g.dispose();
    for (const m of this.extraMats) m.dispose();
    this.extraGeos.clear();
    this.extraMats.clear();
    if (this.ownsMats) this.mats.dispose();
    this.mergedGroup = null;
  }
}

function disposeGeometries(root: THREE.Object3D): void {
  root.traverse((o) => {
    // Sprites share one module-level geometry inside three.js; leave it alone.
    if ((o as THREE.Sprite).isSprite) return;
    const m = o as THREE.Mesh;
    if (m.geometry) m.geometry.dispose();
    if ((o as THREE.InstancedMesh).isInstancedMesh) (o as THREE.InstancedMesh).dispose();
  });
}

/**
 * Rescale the native 0..1 UVs of curved three.js primitives so texels are ~`meters` in world size.
 * Returns false when the geometry has no usable native UVs (caller box-projects instead).
 */
export function scaleNativeUVs(g: THREE.BufferGeometry, meters: number): boolean {
  const uv = g.attributes.uv as THREE.BufferAttribute | undefined;
  if (!uv) return false;
  const prm = (g as THREE.BufferGeometry & { parameters?: Record<string, unknown> }).parameters;
  if (!prm) return false;
  const num = (k: string, d = 0) => (typeof prm[k] === 'number' ? (prm[k] as number) : d);
  const wrap = (len: number) => Math.max(1, Math.round(len / meters));
  let su = 0, sv = 0;
  switch (g.type) {
    case 'CylinderGeometry': {
      const r = Math.max(num('radiusTop'), num('radiusBottom'));
      su = wrap(TAU * r); sv = num('height') / meters;
      break;
    }
    case 'ConeGeometry': su = wrap(TAU * num('radius')); sv = num('height') / meters; break;
    case 'SphereGeometry': su = wrap(TAU * num('radius')); sv = (Math.PI * num('radius')) / meters; break;
    case 'TorusGeometry': su = wrap(TAU * num('radius')); sv = wrap(TAU * num('tube')); break;
    case 'TubeGeometry': {
      const path = prm.path as THREE.Curve<THREE.Vector3> | undefined;
      su = (path ? path.getLength() : 1) / meters; sv = wrap(TAU * num('radius'));
      break;
    }
    case 'LatheGeometry': {
      const pts = (prm.points as THREE.Vector2[] | undefined) ?? [];
      let len = 0, rmax = 0;
      for (let i = 0; i < pts.length; i++) {
        rmax = Math.max(rmax, pts[i].x);
        if (i) len += pts[i].distanceTo(pts[i - 1]);
      }
      su = wrap(TAU * rmax); sv = len / meters;
      break;
    }
    case 'CircleGeometry': su = sv = (2 * num('radius')) / meters; break;
    case 'PlaneGeometry': su = num('width') / meters; sv = num('height') / meters; break;
    default: return false;
  }
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * su, uv.getY(i) * sv);
  uv.needsUpdate = true;
  return true;
}

/** Monotone-chain convex hull (door leaf outlines). */
export function convexHull(points: readonly THREE.Vector2[]): THREE.Vector2[] {
  const pts = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
  if (pts.length < 3) return pts;
  const cross = (o: THREE.Vector2, a: THREE.Vector2, b: THREE.Vector2) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lower: THREE.Vector2[] = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper: THREE.Vector2[] = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  upper.pop();
  lower.pop();
  return lower.concat(upper);
}
