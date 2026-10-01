/**
 * Procedural, seeded, cached textures. No image files.
 *
 * Pixel-field surfaces (stone, bricks, tiles, planks, metal, cloth, moss, noise, sprites) are computed in
 * JS into typed arrays, then uploaded through a canvas when a DOM exists (CanvasTexture) or as a
 * DataTexture otherwise (Node tests). Text/glyph textures (runes, letter plates, banners) are drawn with
 * canvas 2D and need a DOM.
 *
 * Albedo maps are near-greyscale on purpose: hue comes from vertex colours / material colour, so one
 * texture serves every palette and one material can batch every tint of a surface.
 * Pixel convention for field textures: row 0 is v = 0 (flipY = false), tangent-space normals are
 * OpenGL style (+G = +v).
 */
import * as THREE from 'three';

// ---------------------------------------------------------------------------------------------
// Seeded randomness and tileable noise (pure; unit-tested)
// ---------------------------------------------------------------------------------------------
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Integer lattice hash -> [0, 1). */
export function hash2(ix: number, iy: number, seed: number): number {
  let h = Math.imul(ix | 0, 374761393) ^ Math.imul(iy | 0, 668265263) ^ Math.imul(seed | 0, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

const mod = (a: number, n: number) => ((a % n) + n) % n;
const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
export const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Periodic value noise in [0,1]. `px`/`py` are the lattice periods (integers) so the result tiles. */
export function valueNoise(x: number, y: number, px: number, py: number, seed: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const u = fade(x - xi);
  const v = fade(y - yi);
  const x0 = mod(xi, px), x1 = mod(xi + 1, px), y0 = mod(yi, py), y1 = mod(yi + 1, py);
  const a = hash2(x0, y0, seed), b = hash2(x1, y0, seed), c = hash2(x0, y1, seed), d = hash2(x1, y1, seed);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

/**
 * Tileable fBm in [0,1]. (u, v) in [0,1) texture space; `period` = lattice cells across one tile at
 * the base octave (anisotropic periods allowed for grain/streaks).
 */
export function fbm(u: number, v: number, periodX: number, periodY: number, octaves: number, seed: number, gain = 0.5): number {
  let sum = 0;
  let amp = 1;
  let norm = 0;
  let f = 1;
  for (let o = 0; o < octaves; o++) {
    const px = Math.max(1, Math.round(periodX * f));
    const py = Math.max(1, Math.round(periodY * f));
    sum += amp * valueNoise(u * px, v * py, px, py, seed + o * 1013);
    norm += amp;
    amp *= gain;
    f *= 2;
  }
  return sum / norm;
}

/**
 * `fbm` evaluated at every pixel centre of a w x h tile, as a flat row-major array (index y * w + x).
 * Same values as calling fbm((x + 0.5) / w, (y + 0.5) / h, ...) per pixel, but each octave hashes its
 * lattice once and then only interpolates, so it is ~10x faster. Texture generators use this.
 */
export function fbmField(w: number, h: number, periodX: number, periodY: number, octaves: number, seed: number, gain = 0.5): Float32Array {
  const out = new Float32Array(w * h);
  const x0 = new Int32Array(w), x1 = new Int32Array(w), fx = new Float32Array(w);
  let amp = 1;
  let norm = 0;
  let f = 1;
  for (let o = 0; o < octaves; o++) {
    const px = Math.max(1, Math.round(periodX * f));
    const py = Math.max(1, Math.round(periodY * f));
    const s = seed + o * 1013;
    const lat = new Float32Array(px * py);
    for (let j = 0; j < py; j++) for (let i = 0; i < px; i++) lat[j * px + i] = hash2(i, j, s);
    for (let x = 0; x < w; x++) {
      const X = ((x + 0.5) / w) * px;
      const xi = Math.floor(X);
      fx[x] = fade(X - xi);
      x0[x] = mod(xi, px);
      x1[x] = mod(xi + 1, px);
    }
    for (let y = 0; y < h; y++) {
      const Y = ((y + 0.5) / h) * py;
      const yi = Math.floor(Y);
      const fy = fade(Y - yi);
      const r0 = mod(yi, py) * px, r1 = mod(yi + 1, py) * px;
      const row = y * w;
      for (let x = 0; x < w; x++) {
        const a = lat[r0 + x0[x]], b = lat[r0 + x1[x]], c = lat[r1 + x0[x]], d = lat[r1 + x1[x]];
        const u = fx[x];
        out[row + x] += amp * (a + (b - a) * u + (c - a) * fy + (a - b - c + d) * u * fy);
      }
    }
    norm += amp;
    amp *= gain;
    f *= 2;
  }
  for (let i = 0; i < out.length; i++) out[i] /= norm;
  return out;
}

// ---------------------------------------------------------------------------------------------
// Block layouts (pure): which masonry unit covers texture coordinate (u, v)
// ---------------------------------------------------------------------------------------------
export interface BlockHit {
  id: number;        // stable unit id (for per-unit tone)
  edge: number;      // distance to nearest unit edge, in texture units (0..0.5)
  row: number;
}

/** Running-bond bricks: `cols` bricks per row, `rows` rows per tile, odd rows offset by half a brick. */
export function brickAt(u: number, v: number, cols: number, rows: number, stagger = 0.5): BlockHit {
  const fy = mod(v, 1) * rows;
  const row = Math.floor(fy);
  const shift = (row % 2) * stagger;
  const fx = mod(mod(u, 1) * cols - shift, cols);
  const col = Math.floor(fx);
  const ex = Math.min(fx - col, col + 1 - fx) / cols;
  const ey = Math.min(fy - row, row + 1 - fy) / rows;
  // Quantised so u and u + 1 (float-noisy after mod) give identical hits.
  return { id: row * 131 + col, edge: Math.round(Math.min(ex, ey) * 1e9) / 1e9, row };
}

/** Irregular ashlar layout: per-row random heights and random block widths; tiles in u and v. */
export interface AshlarLayout { rowEdges: number[]; blockEdges: number[][]; shifts: number[] }
export function makeAshlar(seed: number, rows: number, minBlocks = 2, maxBlocks = 4): AshlarLayout {
  const r = mulberry32(seed);
  const hs = Array.from({ length: rows }, () => 0.75 + r() * 0.5);
  const hsum = hs.reduce((a, b) => a + b, 0);
  const rowEdges = [0];
  for (const h of hs) rowEdges.push(rowEdges[rowEdges.length - 1] + h / hsum);
  rowEdges[rows] = 1;
  const blockEdges: number[][] = [];
  const shifts: number[] = [];
  for (let i = 0; i < rows; i++) {
    const n = minBlocks + Math.floor(r() * (maxBlocks - minBlocks + 1));
    const ws = Array.from({ length: n }, () => 0.6 + r() * 0.8);
    const wsum = ws.reduce((a, b) => a + b, 0);
    const edges = [0];
    for (const w of ws) edges.push(edges[edges.length - 1] + w / wsum);
    edges[n] = 1;
    blockEdges.push(edges);
    shifts.push(r());
  }
  return { rowEdges, blockEdges, shifts };
}

export function ashlarAt(layout: AshlarLayout, u: number, v: number, aspect = 1): BlockHit {
  const vv = mod(v, 1);
  const re = layout.rowEdges;
  let row = 0;
  while (row < re.length - 2 && vv >= re[row + 1]) row++;
  const ey = Math.min(vv - re[row], re[row + 1] - vv);
  const uu = mod(mod(u, 1) - layout.shifts[row], 1);
  const be = layout.blockEdges[row];
  let k = 0;
  while (k < be.length - 2 && uu >= be[k + 1]) k++;
  const ex = Math.min(uu - be[k], be[k + 1] - uu) * aspect;
  return { id: row * 97 + k, edge: Math.min(ex, ey), row };
}

/** Deterministic rune glyph: strokes between points of a 3x4 grid (+ optional ring). Coordinates 0..1. */
export interface RuneGlyph { lines: [number, number, number, number][]; ring: [number, number, number] | null; dots: [number, number][] }
export function runeGlyph(seed: number): RuneGlyph {
  const r = mulberry32(seed * 7919 + 17);
  const pts: [number, number][] = [];
  for (let y = 0; y < 4; y++) for (let x = 0; x < 3; x++) pts.push([0.2 + x * 0.3, 0.12 + y * 0.253]);
  const lines: [number, number, number, number][] = [];
  // A spine keeps glyphs legible as "writing" rather than scribbles.
  const spineX = pts[Math.floor(r() * 3)][0];
  lines.push([spineX, 0.12, spineX, 0.88]);
  const n = 2 + Math.floor(r() * 3);
  for (let i = 0; i < n; i++) {
    const a = pts[Math.floor(r() * pts.length)];
    const b = pts[Math.floor(r() * pts.length)];
    if (a === b) continue;
    lines.push([a[0], a[1], b[0], b[1]]);
  }
  const ring: [number, number, number] | null = r() < 0.35 ? [0.5, 0.2 + r() * 0.6, 0.12 + r() * 0.08] : null;
  const dots: [number, number][] = r() < 0.5 ? [pts[Math.floor(r() * pts.length)]] : [];
  return { lines, ring, dots };
}

// ---------------------------------------------------------------------------------------------
// Texture plumbing
// ---------------------------------------------------------------------------------------------
export interface SurfaceTex { map: THREE.Texture; normalMap: THREE.Texture | null; roughnessMap: THREE.Texture | null }
export type SurfaceName = 'stone' | 'brick' | 'tiles' | 'planks' | 'metal' | 'cloth' | 'moss' | 'rock' | 'plaster';

/** Metres covered by one texture tile when kit geometry uses world-projected UVs. */
export const TEXTURE_METERS: Readonly<Record<SurfaceName, number>> = {
  stone: 2.4, brick: 1.6, tiles: 2.0, planks: 1.6, metal: 1.0, cloth: 0.8, moss: 1.5, rock: 3.0, plaster: 3.0,
};

const cache = new Map<string, unknown>();
const hasDom = () => typeof document !== 'undefined' && typeof document.createElement === 'function';

function cached<T>(key: string, make: () => T): T {
  let v = cache.get(key) as T | undefined;
  if (v === undefined) {
    v = make();
    cache.set(key, v);
  }
  return v;
}

/** Dispose every cached texture (call when leaving the game, not between rooms: textures are shared). */
export function disposeTextures(): void {
  for (const v of cache.values()) {
    if (v instanceof THREE.Texture) v.dispose();
    else if (v && typeof v === 'object') {
      for (const t of Object.values(v as Record<string, unknown>)) if (t instanceof THREE.Texture) t.dispose();
    }
  }
  cache.clear();
}

export function textureCacheSize(): number {
  return cache.size;
}

function upload(w: number, h: number, rgba: Uint8ClampedArray, srgb: boolean): THREE.Texture {
  let tex: THREE.Texture;
  if (hasDom()) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    if (!ctx) throw new Error('2d canvas unavailable');
    const img = ctx.createImageData(w, h);
    img.data.set(rgba);
    ctx.putImageData(img, 0, 0);
    tex = new THREE.CanvasTexture(c);
  } else {
    tex = new THREE.DataTexture(rgba, w, h, THREE.RGBAFormat);
  }
  tex.flipY = false;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.anisotropy = 8;
  tex.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/** A W x H field: height (0..1), albedo (linear-ish 0..1 rgb), roughness (0..1). */
class Field {
  readonly w: number;
  readonly h: number;
  readonly height: Float32Array;
  readonly albedo: Float32Array;
  readonly rough: Float32Array;
  constructor(w: number, h: number) {
    this.w = w;
    this.h = h;
    this.height = new Float32Array(w * h);
    this.albedo = new Float32Array(w * h * 3);
    this.rough = new Float32Array(w * h);
  }
  each(fn: (u: number, v: number, i: number) => void): void {
    const { w, h } = this;
    for (let y = 0; y < h; y++) {
      const v = (y + 0.5) / h;
      for (let x = 0; x < w; x++) fn((x + 0.5) / w, v, y * w + x);
    }
  }
  setAlbedo(i: number, r: number, g: number, b: number): void {
    this.albedo[i * 3] = r;
    this.albedo[i * 3 + 1] = g;
    this.albedo[i * 3 + 2] = b;
  }
  toSurface(normalStrength: number, withRough = true): SurfaceTex {
    const { w, h } = this;
    const n = w * h;
    const a = new Uint8ClampedArray(n * 4);
    const nm = new Uint8ClampedArray(n * 4);
    const rm = withRough ? new Uint8ClampedArray(n * 4) : null;
    for (let i = 0; i < n; i++) {
      // Albedo is authored in display space, so store it as-is in an sRGB texture.
      a[i * 4] = this.albedo[i * 3] * 255;
      a[i * 4 + 1] = this.albedo[i * 3 + 1] * 255;
      a[i * 4 + 2] = this.albedo[i * 3 + 2] * 255;
      a[i * 4 + 3] = 255;
      if (rm) {
        const r = this.rough[i] * 255;
        rm[i * 4] = r;
        rm[i * 4 + 1] = r; // three reads roughness from G
        rm[i * 4 + 2] = r;
        rm[i * 4 + 3] = 255;
      }
    }
    const H = this.height;
    for (let y = 0; y < h; y++) {
      const yu = ((y + 1) % h) * w, yd = ((y - 1 + h) % h) * w, yc = y * w;
      for (let x = 0; x < w; x++) {
        const xr = (x + 1) % w, xl = (x - 1 + w) % w;
        const dx = (H[yc + xr] - H[yc + xl]) * normalStrength;
        const dy = (H[yu + x] - H[yd + x]) * normalStrength;
        const inv = 1 / Math.sqrt(dx * dx + dy * dy + 1);
        const i = (yc + x) * 4;
        nm[i] = (-dx * inv * 0.5 + 0.5) * 255;
        nm[i + 1] = (-dy * inv * 0.5 + 0.5) * 255;
        nm[i + 2] = (inv * 0.5 + 0.5) * 255;
        nm[i + 3] = 255;
      }
    }
    return { map: upload(w, h, a, true), normalMap: upload(w, h, nm, false), roughnessMap: rm ? upload(w, h, rm, false) : null };
  }
}

// ---------------------------------------------------------------------------------------------
// Surface generators
// ---------------------------------------------------------------------------------------------
/** Irregular dressed stone blocks with chipped bevels, mortar and vertical grime streaks. */
export function stoneTexture(seed = 1, size = 512): SurfaceTex {
  return cached(`stone:${seed}:${size}`, () => {
    const f = new Field(size, size);
    const lay = makeAshlar(seed, 4, 2, 3);
    const mortar = 2.2 / size, bevel = 11 / size;
    const warpF = fbmField(size, size, 16, 16, 3, seed + 5), grainF = fbmField(size, size, 24, 24, 4, seed + 11);
    const streakF = fbmField(size, size, 10, 2, 3, seed + 23), chipF = fbmField(size, size, 12, 12, 3, seed + 31);
    f.each((u, v, i) => {
      const warp = (warpF[i] - 0.5) * 6 / size;
      const b = ashlarAt(lay, u, v);
      const d = b.edge + warp;
      const tone = 0.74 + hash2(b.id, 3, seed) * 0.24;
      const grain = grainF[i];
      const streak = streakF[i];
      const chip = smoothstep(0.62, 0.8, chipF[i]);
      if (d < mortar) {
        const m = 0.3 + grain * 0.12;
        f.setAlbedo(i, m, m * 1.02, m);
        f.height[i] = 0.05 + grain * 0.05;
        f.rough[i] = 0.97;
        return;
      }
      const t = smoothstep(mortar, mortar + bevel * (1 - 0.7 * chip), d);
      const tilt = (hash2(b.id, 7, seed) - 0.5) * 0.12 * (v * 4 - b.row - 0.5);
      f.height[i] = 0.3 + 0.55 * Math.pow(t, 0.6) + grain * 0.12 + tilt - chip * 0.08 * (1 - t);
      const grime = 0.82 + 0.18 * t;
      const s = tone * grime * (0.88 + grain * 0.2) * (0.86 + streak * 0.2);
      const warm = (hash2(b.id, 9, seed) - 0.5) * 0.05;
      f.setAlbedo(i, s * (1 + warm), s, s * (1 - warm));
      f.rough[i] = 0.72 + grain * 0.22;
    });
    return f.toSurface(5);
  });
}

/** Running-bond bricks; tiles seamlessly around cylinders (integer bricks per row). */
export function brickTexture(seed = 2, size = 512): SurfaceTex {
  return cached(`brick:${seed}:${size}`, () => {
    const f = new Field(size, size);
    const cols = 4, rows = 8;
    const mortar = 2.6 / size, bevel = 7 / size;
    const warpF = fbmField(size, size, 32, 32, 2, seed + 3), grainF = fbmField(size, size, 48, 48, 3, seed + 13);
    const blotchF = fbmField(size, size, 6, 6, 3, seed + 17);
    f.each((u, v, i) => {
      const warp = (warpF[i] - 0.5) * 3.5 / size;
      const b = brickAt(u, v, cols, rows, 0.5);
      const d = b.edge + warp;
      const grain = grainF[i];
      const blotch = blotchF[i];
      if (d < mortar) {
        const m = 0.34 + grain * 0.1;
        f.setAlbedo(i, m, m, m * 0.97);
        f.height[i] = 0.05;
        f.rough[i] = 0.98;
        return;
      }
      const t = smoothstep(mortar, mortar + bevel, d);
      const h = hash2(b.id, 1, seed);
      const burnt = h < 0.12 ? 0.62 : 1;
      const tone = (0.78 + hash2(b.id, 2, seed) * 0.2) * burnt;
      f.height[i] = 0.35 + 0.5 * Math.sqrt(t) + grain * 0.1;
      const s = tone * (0.86 + 0.14 * t) * (0.9 + grain * 0.12) * (0.9 + blotch * 0.15);
      const warm = (hash2(b.id, 5, seed) - 0.4) * 0.08;
      f.setAlbedo(i, s * (1 + warm), s * (1 + warm * 0.2), s * (1 - warm));
      f.rough[i] = 0.78 + grain * 0.18;
    });
    return f.toSurface(4);
  });
}

/** Square floor tiles with bevels, grout and the odd cracked tile. */
export function tileTexture(seed = 3, size = 512): SurfaceTex {
  return cached(`tiles:${seed}:${size}`, () => {
    const f = new Field(size, size);
    const n = 4;
    const grout = 3 / size, bevel = 9 / size;
    const grainF = fbmField(size, size, 32, 32, 4, seed + 7), cloudF = fbmField(size, size, 5, 5, 3, seed + 9);
    const crackF = fbmField(size, size, 8, 8, 3, seed + 101);
    f.each((u, v, i) => {
      const b = brickAt(u, v, n, n, 0);
      const grain = grainF[i];
      const cloud = cloudF[i];
      if (b.edge < grout) {
        const m = 0.36 + grain * 0.08;
        f.setAlbedo(i, m, m, m);
        f.height[i] = 0.05;
        f.rough[i] = 0.95;
        return;
      }
      const t = smoothstep(grout, grout + bevel, b.edge);
      const tone = 0.8 + hash2(b.id, 4, seed) * 0.18;
      // Hairline crack on ~1 in 6 tiles: a warped iso-line of low-frequency noise.
      let crack = 0;
      if (hash2(b.id, 8, seed) < 0.17) {
        // One shared noise field, shifted per tile so every crack runs differently.
        const ox = Math.floor(hash2(b.id, 12, seed) * size), oy = Math.floor(hash2(b.id, 13, seed) * size);
        const c = crackF[((Math.floor(i / size) + oy) % size) * size + ((i % size) + ox) % size];
        crack = 1 - smoothstep(0.0, 0.012, Math.abs(c - 0.5));
      }
      f.height[i] = 0.35 + 0.5 * Math.sqrt(t) + grain * 0.06 - crack * 0.25;
      const s = tone * (0.9 + 0.1 * t) * (0.93 + grain * 0.1) * (0.94 + cloud * 0.1) * (1 - crack * 0.45);
      f.setAlbedo(i, s, s, s * 0.98);
      f.rough[i] = 0.55 + grain * 0.3 + crack * 0.3;
    });
    return f.toSurface(4);
  });
}

/** Wood planks running along v, with grain, knots, end seams and nail heads. */
export function planksTexture(seed = 4, size = 512): SurfaceTex {
  return cached(`planks:${seed}:${size}`, () => {
    const f = new Field(size, size);
    const n = 4;
    const r = mulberry32(seed);
    const seams = Array.from({ length: n }, () => r());
    const knots = Array.from({ length: n }, () => ({ v: r(), x: 0.3 + r() * 0.4, on: r() < 0.6 }));
    const gap = 2.2 / size;
    const warpF = Array.from({ length: n }, (_, p) => fbmField(size, size, 8, 2, 3, seed + p * 7));
    const fineF = fbmField(size, size, 128, 6, 2, seed + 21);
    f.each((u, v, i) => {
      const pu = u * n;
      const p = Math.floor(pu);
      const fx = pu - p;
      const edgeX = Math.min(fx, 1 - fx) / n;
      const dv = Math.abs(((v - seams[p] + 1.5) % 1) - 0.5);
      const edgeY = dv;
      const edge = Math.min(edgeX, edgeY);
      const kn = knots[p];
      let kd = 1;
      if (kn.on) {
        const ddx = (fx - kn.x) * 2.2, ddy = (((v - kn.v + 1.5) % 1) - 0.5) * 6;
        kd = Math.sqrt(ddx * ddx + ddy * ddy);
      }
      const warp = warpF[p][i] * 3 + (kn.on ? 0.25 / (kd + 0.15) : 0);
      const rings = 0.5 + 0.5 * Math.sin((fx * 9 + warp) * Math.PI * 2);
      const fine = fineF[i];
      const tone = 0.72 + hash2(p, 1, seed) * 0.22;
      if (edge < gap) {
        f.setAlbedo(i, 0.18, 0.15, 0.12);
        f.height[i] = 0.0;
        f.rough[i] = 1;
        return;
      }
      const t = smoothstep(gap, gap + 5 / size, edge);
      const knot = kn.on ? 1 - smoothstep(0.05, 0.22, kd) : 0;
      let s = tone * (0.8 + rings * 0.14 + fine * 0.12) * (0.85 + 0.15 * t) * (1 - knot * 0.5);
      // Nail heads near each end seam.
      const nailV = Math.abs(dv - 0.02);
      const nd = Math.min(Math.hypot((fx - 0.22) / n, nailV), Math.hypot((fx - 0.78) / n, nailV));
      const nail = 1 - smoothstep(0.004, 0.007, nd);
      s = s * (1 - nail * 0.55);
      f.setAlbedo(i, s * 1.02, s * 0.97, s * 0.92);
      f.height[i] = 0.4 + 0.45 * t + rings * 0.05 + fine * 0.05 - knot * 0.1 + nail * 0.15;
      f.rough[i] = 0.7 + fine * 0.2 - nail * 0.4;
    });
    return f.toSurface(3);
  });
}

/** Brushed metal with tarnish blotches and scratches. */
export function metalTexture(seed = 5, size = 256): SurfaceTex {
  return cached(`metal:${seed}:${size}`, () => {
    const f = new Field(size, size);
    const brushF = fbmField(size, size, 2, 96, 3, seed), blotchF = fbmField(size, size, 5, 5, 4, seed + 3);
    f.each((_u, _v, i) => {
      const brush = brushF[i];
      const blotch = blotchF[i];
      const tarnish = smoothstep(0.52, 0.75, blotch);
      const s = (0.86 + brush * 0.12) * (1 - tarnish * 0.28);
      f.setAlbedo(i, s, s * 0.99, s * 0.96);
      f.height[i] = brush * 0.3 + tarnish * 0.2;
      f.rough[i] = 0.28 + brush * 0.12 + tarnish * 0.38;
    });
    const r = mulberry32(seed + 99);
    for (let k = 0; k < 60; k++) {
      let x = r() * size, y = r() * size;
      const a = r() * Math.PI * 2, len = 10 + r() * 60;
      for (let s = 0; s < len; s++) {
        const i = (mod(Math.floor(y), size) * size + mod(Math.floor(x), size));
        f.albedo[i * 3] = Math.min(1, f.albedo[i * 3] + 0.12);
        f.albedo[i * 3 + 1] = Math.min(1, f.albedo[i * 3 + 1] + 0.12);
        f.albedo[i * 3 + 2] = Math.min(1, f.albedo[i * 3 + 2] + 0.12);
        f.rough[i] = 0.2;
        f.height[i] -= 0.15;
        x += Math.cos(a);
        y += Math.sin(a);
      }
    }
    return f.toSurface(1.5);
  });
}

/** Woven cloth with soft stains. */
export function clothTexture(seed = 6, size = 256): SurfaceTex {
  return cached(`cloth:${seed}:${size}`, () => {
    const f = new Field(size, size);
    const threads = 64;
    const stainF = fbmField(size, size, 4, 4, 4, seed);
    f.each((u, v, i) => {
      const wx = Math.sin(u * threads * Math.PI * 2), wy = Math.sin(v * threads * Math.PI * 2);
      const over = (Math.floor(u * threads) + Math.floor(v * threads)) % 2 === 0 ? wx : wy;
      const stain = stainF[i];
      const s = (0.86 + over * 0.07) * (0.9 + stain * 0.14);
      f.setAlbedo(i, s, s, s);
      f.height[i] = 0.5 + over * 0.25;
      f.rough[i] = 0.9;
    });
    return f.toSurface(1.2, false);
  });
}

/** Moss: clumpy, bumpy, with brighter tips. */
export function mossTexture(seed = 7, size = 256): SurfaceTex {
  return cached(`moss:${seed}:${size}`, () => {
    const f = new Field(size, size);
    const clumpF = fbmField(size, size, 12, 12, 4, seed), fineF = fbmField(size, size, 64, 64, 2, seed + 5);
    f.each((_u, _v, i) => {
      const clump = clumpF[i];
      const fine = fineF[i];
      const tips = smoothstep(0.62, 0.8, fine) * clump;
      const s = 0.62 + clump * 0.3 + tips * 0.25;
      f.setAlbedo(i, s * 0.95, s, s * 0.85);
      f.height[i] = clump * 0.7 + fine * 0.3;
      f.rough[i] = 0.95;
    });
    return f.toSurface(4, false);
  });
}

/** Rough natural rock with faint strata (for flat-shaded rock geometry). */
export function rockTexture(seed = 8, size = 256): SurfaceTex {
  return cached(`rock:${seed}:${size}`, () => {
    const f = new Field(size, size);
    const nF = fbmField(size, size, 8, 8, 5, seed);
    f.each((u, v, i) => {
      const n = nF[i];
      const strata = 0.5 + 0.5 * Math.sin((v * 10 + n * 2.5) * Math.PI * 2);
      const speck = hash2(Math.floor(u * size), Math.floor(v * size), seed) > 0.985 ? 0.12 : 0;
      const s = 0.72 + n * 0.22 + strata * 0.06 + speck;
      f.setAlbedo(i, s, s * 0.99, s * 0.97);
      f.height[i] = n * 0.8 + strata * 0.15;
      f.rough[i] = 0.85 + n * 0.1;
    });
    return f.toSurface(3);
  });
}

/** Smooth plaster/marble: very low-contrast clouding with faint veins. */
export function plasterTexture(seed = 9, size = 256): SurfaceTex {
  return cached(`plaster:${seed}:${size}`, () => {
    const f = new Field(size, size);
    const cF = fbmField(size, size, 4, 4, 5, seed), veinF = fbmField(size, size, 3, 3, 4, seed + 9);
    f.each((_u, _v, i) => {
      const c = cF[i];
      const vein = 1 - smoothstep(0, 0.018, Math.abs(veinF[i] - 0.5));
      const s = 0.9 + c * 0.1 - vein * 0.12;
      f.setAlbedo(i, s, s, s);
      f.height[i] = c * 0.2;
      f.rough[i] = 0.5 + c * 0.25;
    });
    return f.toSurface(0.8);
  });
}

export function surfaceTexture(name: SurfaceName, seed?: number): SurfaceTex {
  switch (name) {
    case 'stone': return stoneTexture(seed);
    case 'brick': return brickTexture(seed);
    case 'tiles': return tileTexture(seed);
    case 'planks': return planksTexture(seed);
    case 'metal': return metalTexture(seed);
    case 'cloth': return clothTexture(seed);
    case 'moss': return mossTexture(seed);
    case 'rock': return rockTexture(seed);
    case 'plaster': return plasterTexture(seed);
  }
}

/**
 * Multi-purpose shader noise (linear data): R = fbm period 4, G = fbm period 16, B = fbm period 8
 * (other seed), A = ridged fbm. Tileable. Used by material patches (moss masks), water and FX.
 */
export function noiseTexture(seed = 11, size = 256): THREE.Texture {
  return cached(`noise:${seed}:${size}`, () => {
    const a = new Uint8ClampedArray(size * size * 4);
    const fR = fbmField(size, size, 4, 4, 5, seed), fG = fbmField(size, size, 16, 16, 3, seed + 1);
    const fB = fbmField(size, size, 8, 8, 4, seed + 2), fA = fbmField(size, size, 6, 6, 4, seed + 3);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4;
        const k = y * size + x;
        a[i] = fR[k] * 255;
        a[i + 1] = fG[k] * 255;
        a[i + 2] = fB[k] * 255;
        a[i + 3] = (1 - Math.abs(fA[k] * 2 - 1)) * 255;
      }
    }
    return upload(size, size, a, false);
  });
}

// ---------------------------------------------------------------------------------------------
// Sprites (pure pixel fields, work without a DOM)
// ---------------------------------------------------------------------------------------------
/** Four-point star with a soft core; white on black (use additive blending). */
export function starSprite(size = 64): THREE.Texture {
  return cached(`star:${size}`, () => {
    const a = new Uint8ClampedArray(size * size * 4);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = ((x + 0.5) / size) * 2 - 1, dy = ((y + 0.5) / size) * 2 - 1;
        const r2 = dx * dx + dy * dy;
        const core = Math.exp(-r2 * 60) + 0.35 * Math.exp(-r2 * 9);
        const spike = Math.exp(-Math.abs(dx) * 40) * Math.exp(-dy * dy * 3) + Math.exp(-Math.abs(dy) * 40) * Math.exp(-dx * dx * 3);
        const edge = 1 - smoothstep(0.7, 1, Math.sqrt(r2));
        const val = Math.min(1, (core + spike * 0.6) * edge);
        const i = (y * size + x) * 4;
        a[i] = a[i + 1] = a[i + 2] = val * 255;
        a[i + 3] = val * 255;
      }
    }
    const t = upload(size, size, a, true);
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    return t;
  });
}

/** Soft round glow; white with alpha falloff. */
export function glowSprite(size = 64): THREE.Texture {
  return cached(`glow:${size}`, () => {
    const a = new Uint8ClampedArray(size * size * 4);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = ((x + 0.5) / size) * 2 - 1, dy = ((y + 0.5) / size) * 2 - 1;
        const r = Math.sqrt(dx * dx + dy * dy);
        const val = Math.pow(Math.max(0, 1 - r), 2.2);
        const i = (y * size + x) * 4;
        a[i] = a[i + 1] = a[i + 2] = 255;
        a[i + 3] = val * 255;
      }
    }
    const t = upload(size, size, a, true);
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    return t;
  });
}

/** Planet ring bands (u = radius 0..1, alpha = density). */
export function ringBandsTexture(seed = 12, size = 256): THREE.Texture {
  return cached(`rings:${seed}:${size}`, () => {
    const a = new Uint8ClampedArray(size * 4 * 4);
    for (let x = 0; x < size; x++) {
      const u = x / (size - 1);
      const band = fbm(u, 0.5, 24, 1, 4, seed);
      const gap = smoothstep(0.42, 0.44, u) * (1 - smoothstep(0.47, 0.49, u));
      const edge = smoothstep(0.0, 0.08, u) * (1 - smoothstep(0.9, 1.0, u));
      const alpha = Math.max(0, (0.25 + band * 0.9) * edge * (1 - gap * 0.9));
      const s = 0.7 + band * 0.3;
      for (let y = 0; y < 4; y++) {
        const i = (y * size + x) * 4;
        a[i] = s * 255;
        a[i + 1] = s * 245;
        a[i + 2] = s * 235;
        a[i + 3] = Math.min(1, alpha) * 255;
      }
    }
    const t = upload(size, 4, a, true);
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    return t;
  });
}

// ---------------------------------------------------------------------------------------------
// Canvas-drawn textures (text and glyphs)
// ---------------------------------------------------------------------------------------------
function blankTexture(): THREE.Texture {
  const t = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1, THREE.RGBAFormat);
  t.needsUpdate = true;
  return t;
}

function canvas2d(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('2d canvas unavailable');
  return [c, ctx];
}

function canvasTexture(c: HTMLCanvasElement, srgb = true): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.anisotropy = 8;
  t.needsUpdate = true;
  return t;
}

function drawGlyph(ctx: CanvasRenderingContext2D, g: RuneGlyph, x: number, y: number, w: number, h: number, lw: number): void {
  ctx.beginPath();
  for (const [x0, y0, x1, y1] of g.lines) {
    ctx.moveTo(x + x0 * w, y + y0 * h);
    ctx.lineTo(x + x1 * w, y + y1 * h);
  }
  ctx.stroke();
  if (g.ring) {
    ctx.beginPath();
    ctx.arc(x + g.ring[0] * w, y + g.ring[1] * h, g.ring[2] * Math.min(w, h) * 1.4, 0, Math.PI * 2);
    ctx.stroke();
  }
  for (const [dx, dy] of g.dots) {
    ctx.beginPath();
    ctx.arc(x + dx * w, y + dy * h, lw * 0.9, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Horizontal strip of glowing runes, white on black (additive / emissive map). u wraps seamlessly,
 * so it can run around a ring or along a trim.
 */
export function runeStripTexture(seed = 13, glyphs = 8): THREE.Texture {
  return cached(`runes:${seed}:${glyphs}`, () => {
    if (!hasDom()) return blankTexture();
    const cell = 128;
    const [c, ctx] = canvas2d(cell * glyphs, cell);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let pass = 0; pass < 2; pass++) {
      ctx.strokeStyle = pass === 0 ? 'rgba(255,255,255,0.55)' : '#ffffff';
      ctx.fillStyle = ctx.strokeStyle;
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = pass === 0 ? 22 : 6;
      ctx.lineWidth = pass === 0 ? 11 : 5;
      for (let i = 0; i < glyphs; i++) drawGlyph(ctx, runeGlyph(seed * 100 + i), i * cell + cell * 0.2, cell * 0.12, cell * 0.6, cell * 0.76, ctx.lineWidth);
    }
    // Thin guide lines above and below, like an inscription band.
    ctx.shadowBlur = 8;
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillRect(0, 4, c.width, 3);
    ctx.fillRect(0, cell - 7, c.width, 3);
    const t = canvasTexture(c);
    t.wrapS = THREE.RepeatWrapping;
    return t;
  });
}

/**
 * Door plates use the UI display face (Tektur, loaded by ui/fonts.ts) so "1E" on a door reads exactly like
 * "1E" in a System window. Load fonts before building rooms or the canvas falls back to Bahnschrift/Georgia.
 */
export const PLATE_FONT = '"Tektur", "Bahnschrift", "Cinzel", Georgia, "Times New Roman", serif';

/**
 * Door letter plate: glowing engraved text (e.g. "1E") on black, for additive/emissive use.
 * `color` tints the halo; the core stays near-white so bloom reads as the letter colour.
 */
export function letterPlateTexture(text: string, color: string): THREE.Texture {
  return cached(`plate:${text}:${color}`, () => {
    if (!hasDom()) return blankTexture();
    const [c, ctx] = canvas2d(512, 256);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 512, 256);
    let px = 190;
    ctx.font = `700 ${px}px ${PLATE_FONT}`;
    while (ctx.measureText(text).width > 440 && px > 40) {
      px -= 8;
      ctx.font = `700 ${px}px ${PLATE_FONT}`;
    }
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const y = 136;
    ctx.shadowColor = color;
    ctx.shadowBlur = 42;
    ctx.fillStyle = color;
    ctx.fillText(text, 256, y);
    ctx.shadowBlur = 16;
    ctx.fillText(text, 256, y);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.85;
    ctx.fillText(text, 256, y);
    ctx.globalAlpha = 1;
    // Frame
    ctx.strokeStyle = color;
    ctx.lineWidth = 6;
    ctx.shadowColor = color;
    ctx.shadowBlur = 18;
    ctx.strokeRect(18, 18, 476, 220);
    ctx.lineWidth = 2;
    ctx.strokeRect(32, 32, 448, 192);
    return canvasTexture(c);
  });
}

/**
 * Hanging banner cloth: base colour, woven texture, gold trim, emblem (letter or rune), swallowtail cut
 * (transparent; use alphaTest).
 */
export function bannerTexture(color: string, trim: string, emblem: string, seed = 14): THREE.Texture {
  return cached(`banner:${color}:${trim}:${emblem}:${seed}`, () => {
    if (!hasDom()) return blankTexture();
    const W = 256, H = 512;
    const [c, ctx] = canvas2d(W, H);
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(W, 0);
    ctx.lineTo(W, H);
    ctx.lineTo(W / 2, H - 70);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.clip();
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, color);
    g.addColorStop(1, color);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    // Weave + shading bands (folds are geometry; this is fibre detail).
    const img = ctx.getImageData(0, 0, W, H);
    const fibre = fbmField(W, H, 6, 12, 3, seed);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        const weave = ((x + y) % 4 < 2 ? 1 : 0.94) * (0.9 + 0.1 * fibre[y * W + x]);
        img.data[i] *= weave;
        img.data[i + 1] *= weave;
        img.data[i + 2] *= weave;
      }
    }
    ctx.putImageData(img, 0, 0);
    ctx.strokeStyle = trim;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(18, 0);
    ctx.lineTo(18, H - 40);
    ctx.moveTo(W - 18, 0);
    ctx.lineTo(W - 18, H - 40);
    ctx.stroke();
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, H - 18);
    ctx.lineTo(W / 2, H - 88);
    ctx.lineTo(W, H - 18);
    ctx.stroke();
    ctx.fillStyle = trim;
    ctx.fillRect(0, 26, W, 8);
    // Emblem medallion
    const cy = 210;
    ctx.beginPath();
    ctx.arc(W / 2, cy, 78, 0, Math.PI * 2);
    ctx.lineWidth = 7;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(W / 2, cy, 64, 0, Math.PI * 2);
    ctx.lineWidth = 2;
    ctx.stroke();
    if (emblem.startsWith('rune:')) {
      ctx.lineWidth = 9;
      ctx.lineCap = 'round';
      drawGlyph(ctx, runeGlyph(Number(emblem.slice(5)) || 1), W / 2 - 40, cy - 52, 80, 104, 9);
    } else {
      ctx.font = `700 ${emblem.length > 1 ? 70 : 96}px ${PLATE_FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(emblem, W / 2, cy + 6);
    }
    ctx.restore();
    const t = canvasTexture(c);
    return t;
  });
}
