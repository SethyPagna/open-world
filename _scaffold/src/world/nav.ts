/**
 * 2.5D navigation grid for AI (and the "where can I stand" queries of spawners).
 *
 * build() scans the room column by column (a downward line through every cell centre), keeps up to
 * `maxLayers` standable surfaces per column (so bridges over floors and stacked dungeon storeys work),
 * and marks a surface walkable when:
 *   - it lies inside the bounds, is not buried inside another solid, and is not water / hazard,
 *   - its slope is within `maxSlopeDeg`,
 *   - a character capsule (radius, height) standing on it is clear of solids, and of 'hazard'.
 * Neighbouring surfaces (8 directions) are linked when |dh| <= stepHeight, or when they lie on the same
 * ramp plane; diagonals need both orthogonal links (no corner cutting). A* (octile heuristic) finds a
 * node path which is then string-pulled along the grid so AI walks straight lines.
 *
 * The grid is a snapshot: rebuild after the room changes (doors, moving platforms are not tracked).
 * findPath / isWalkable / nearestWalkable do not allocate except for their returned vectors.
 */
import * as THREE from 'three';
import type { Aabb, NavGrid, RayHit, Rng } from '../core/api.ts';
import type { Physics, ShapedStatic } from './physics.ts';
import { newContact, newRaySpan, rayCylSpan, rayObbSpan, segCyl, segObb } from './collision_math.ts';
import type { Contact, RaySpan } from './collision_math.ts';

export interface NavOptions {
  /** Character capsule used for clearance (default 0.4 / 1.2, the player capsule). */
  radius?: number;
  height?: number;
  /** Max height difference between linked cells off ramps (default 0.35 = physics step height). */
  stepHeight?: number;
  /** Steeper surfaces are not walkable (default 50, the physics slope limit). */
  maxSlopeDeg?: number;
  /** Standable surfaces kept per column, highest first (default 4). */
  maxLayers?: number;
  /** findPath snaps an off-grid start / goal to the nearest walkable cell within this radius (default 2). */
  snapRadius?: number;
  /** Treat water volumes as not walkable (default true). */
  avoidWater?: boolean;
}

const SQRT2 = Math.SQRT2;
// Neighbour order: +x, -x, +z, -z, then the diagonals (+x+z, +x-z, -x+z, -x-z).
const DX = [1, -1, 0, 0, 1, 1, -1, -1];
const DZ = [0, 0, 1, -1, 1, -1, 1, -1];
const MAX_SPANS = 24;
const BURY_EPS = 0.02;
const MERGE_DY = 0.1;
const RAMP_TOL = 0.2;
const TILE = 8;
const PATH_DY_TOL = 0.25;

export class Nav implements NavGrid {
  readonly radius: number;
  readonly height: number;
  readonly stepHeight: number;
  readonly maxSlopeDeg: number;
  readonly maxLayers: number;
  snapRadius: number;
  avoidWater: boolean;

  /** Grid geometry of the last build. */
  cellSize = 0.5;
  cols = 0;
  rows = 0;
  originX = 0;
  originZ = 0;
  /** Wall-clock milliseconds of the last build(). */
  lastBuildMs = 0;

  private readonly physics: Physics;
  // Nodes (standable surfaces). Column c = iz * cols + ix owns nodes colStart[c] .. colStart[c+1]-1, highest first.
  private colStart = new Int32Array(1);
  private nodeY = new Float32Array(0);
  private nodeNx = new Float32Array(0);
  private nodeNy = new Float32Array(0);
  private nodeNz = new Float32Array(0);
  private nodeCol = new Int32Array(0);
  private links = new Int32Array(0);
  private comp = new Int32Array(0);
  private n = 0;
  private components = 0;
  // A* scratch
  private g = new Float64Array(0);
  private f = new Float64Array(0);
  private parent = new Int32Array(0);
  private seen = new Uint32Array(0);
  private closed = new Uint32Array(0);
  private heap = new Int32Array(0);
  private heapPos = new Int32Array(0);
  private heapN = 0;
  private gen = 0;
  private chain = new Int32Array(0);
  // build scratch
  private cands: ShapedStatic[] = [];
  private span: RaySpan = newRaySpan();
  private ct: Contact = newContact();
  private sTop = new Float64Array(MAX_SPANS);
  private sBot = new Float64Array(MAX_SPANS);
  private sNx = new Float64Array(MAX_SPANS);
  private sNy = new Float64Array(MAX_SPANS);
  private sNz = new Float64Array(MAX_SPANS);
  private sCand = new Int32Array(MAX_SPANS);
  private order = new Int32Array(MAX_SPANS);
  private flags = new Uint8Array(64);

  constructor(physics: Physics, opts: NavOptions = {}) {
    this.physics = physics;
    this.radius = opts.radius ?? 0.4;
    this.height = opts.height ?? 1.2;
    this.stepHeight = opts.stepHeight ?? 0.35;
    this.maxSlopeDeg = opts.maxSlopeDeg ?? 50;
    this.maxLayers = Math.max(1, Math.floor(opts.maxLayers ?? 4));
    this.snapRadius = opts.snapRadius ?? 2;
    this.avoidWater = opts.avoidWater ?? true;
  }

  /** Walkable surfaces in the last build. */
  get nodeCount(): number { return this.n; }
  /** Number of connected walkable regions (islands) in the last build. */
  get componentCount(): number { return this.components; }

  /** World position (cell centre, surface height) of node i. */
  nodePosition(i: number, out: THREE.Vector3): THREE.Vector3 {
    const c = this.nodeCol[i];
    return out.set(this.originX + ((c % this.cols) + 0.5) * this.cellSize, this.nodeY[i], this.originZ + (Math.floor(c / this.cols) + 0.5) * this.cellSize);
  }

  /** Index of the walkable node under / nearest in height to p in p's own cell, or -1. */
  nodeAt(p: THREE.Vector3, maxDy = 0.6): number {
    const col = this.columnOf(p.x, p.z);
    if (col < 0) return -1;
    let best = -1, bestS = Infinity;
    for (let i = this.colStart[col]; i < this.colStart[col + 1]; i++) {
      const dy = this.nodeY[i] - p.y;
      // Prefer the floor under p over a ceiling-side surface above it.
      const s = dy > 0 ? dy * 2 : -dy;
      if (Math.abs(dy) <= maxDy && s < bestS) { bestS = s; best = i; }
    }
    return best;
  }

  /** Connected-region id of the walkable cell at p (-1 when not walkable). */
  regionAt(p: THREE.Vector3): number {
    const i = this.nodeAt(p);
    return i < 0 ? -1 : this.comp[i];
  }

  // ---------------------------------------------------------------------------------------------
  // Build
  // ---------------------------------------------------------------------------------------------

  build(bounds: Aabb, cellSize = 0.5): void {
    const t0 = performance.now();
    const cs = cellSize > 0 ? cellSize : 0.5;
    this.cellSize = cs;
    this.originX = bounds.min.x;
    this.originZ = bounds.min.z;
    const cols = Math.max(1, Math.ceil((bounds.max.x - bounds.min.x) / cs - 1e-9));
    const rows = Math.max(1, Math.ceil((bounds.max.z - bounds.min.z) / cs - 1e-9));
    this.cols = cols; this.rows = rows;
    const nCols = cols * rows;
    const cap = nCols * this.maxLayers;
    if (this.nodeY.length < cap) {
      this.nodeY = new Float32Array(cap); this.nodeNx = new Float32Array(cap); this.nodeNy = new Float32Array(cap);
      this.nodeNz = new Float32Array(cap); this.nodeCol = new Int32Array(cap);
    }
    if (this.colStart.length < nCols + 1) this.colStart = new Int32Array(nCols + 1);
    const colCount = new Int32Array(nCols);
    // Temporary per-column storage (fixed stride) that is compacted afterwards.
    const tmpY = new Float32Array(cap), tmpNx = new Float32Array(cap), tmpNy = new Float32Array(cap), tmpNz = new Float32Array(cap);

    const r = this.radius, h = this.height, step = this.stepHeight;
    const cosSlope = Math.cos((this.maxSlopeDeg * Math.PI) / 180);
    const yMin = bounds.min.y, yMax = bounds.max.y;
    const rayTop = yMax + h + 0.5;
    const L = this.maxLayers;

    for (let tz = 0; tz < rows; tz += TILE) {
      for (let tx = 0; tx < cols; tx += TILE) {
        const ix1 = Math.min(cols, tx + TILE), iz1 = Math.min(rows, tz + TILE);
        const x0 = this.originX + tx * cs, x1 = this.originX + ix1 * cs;
        const z0 = this.originZ + tz * cs, z1 = this.originZ + iz1 * cs;
        const pad = r + 0.05;
        const nc = this.physics.queryStatics(x0 - pad, yMin - 1, z0 - pad, x1 + pad, rayTop, z1 + pad, this.cands);
        if (nc === 0) continue;
        if (this.flags.length < nc) this.flags = new Uint8Array(nc * 2);
        for (let k = 0; k < nc; k++) {
          const t = this.cands[k].tags;
          // bit0 water, bit1 oneway, bit2 hazard
          this.flags[k] = (t.has('water') ? 1 : 0) | (t.has('oneway') ? 2 : 0) | (t.has('hazard') ? 4 : 0);
        }
        for (let iz = tz; iz < iz1; iz++) {
          for (let ix = tx; ix < ix1; ix++) {
            const x = this.originX + (ix + 0.5) * cs, z = this.originZ + (iz + 0.5) * cs;
            const col = iz * cols + ix;
            const ns = this.columnSpans(x, z, rayTop, nc);
            if (ns === 0) continue;
            let kept = 0, lastTop = Infinity;
            for (let oi = 0; oi < ns && kept < L; oi++) {
              const s = this.order[oi];
              const top = this.sTop[s];
              if (top > yMax || top < yMin) continue;
              const fl = this.flags[this.sCand[s]];
              if (fl & 1) continue; // water surfaces are not ground
              if (this.buried(s, ns, top)) continue;
              if (lastTop - top < MERGE_DY) continue;
              lastTop = top;
              if (fl & 4) continue; // standing on a hazard
              if (this.sNy[s] < cosSlope) continue;
              if (this.blocked(x, top, z, r, h, step, nc)) continue;
              const k = col * L + kept++;
              tmpY[k] = top; tmpNx[k] = this.sNx[s]; tmpNy[k] = this.sNy[s]; tmpNz[k] = this.sNz[s];
            }
            colCount[col] = kept;
          }
        }
      }
    }

    // Compact.
    let n = 0;
    for (let c = 0; c < nCols; c++) {
      this.colStart[c] = n;
      for (let j = 0; j < colCount[c]; j++) {
        const k = c * L + j;
        this.nodeY[n] = tmpY[k]; this.nodeNx[n] = tmpNx[k]; this.nodeNy[n] = tmpNy[k]; this.nodeNz[n] = tmpNz[k];
        this.nodeCol[n] = c;
        n++;
      }
    }
    this.colStart[nCols] = n;
    this.n = n;

    if (this.links.length < n * 8) this.links = new Int32Array(Math.max(8, n * 8));
    if (this.comp.length < n) {
      const m = Math.max(1, n);
      this.comp = new Int32Array(m); this.g = new Float64Array(m); this.f = new Float64Array(m);
      this.parent = new Int32Array(m); this.seen = new Uint32Array(m); this.closed = new Uint32Array(m);
      this.heap = new Int32Array(m); this.heapPos = new Int32Array(m); this.chain = new Int32Array(m);
      this.gen = 0;
    }
    this.buildLinks(cosSlope);
    this.buildComponents();
    this.lastBuildMs = performance.now() - t0;
  }

  /** Vertical line through (x, z) against the tile's candidates. Fills the span arrays sorted by top (desc). */
  private columnSpans(x: number, z: number, oy: number, nc: number): number {
    let ns = 0;
    const sp = this.span;
    for (let k = 0; k < nc && ns < MAX_SPANS; k++) {
      const c = this.cands[k];
      if (x < c.minX || x > c.maxX || z < c.minZ || z > c.maxZ) continue;
      const hit = c.kind === 'box' ? rayObbSpan(x, oy, z, 0, -1, 0, c, sp) : rayCylSpan(x, oy, z, 0, -1, 0, c, sp);
      if (!hit || sp.tout < 0) continue;
      this.sTop[ns] = oy - sp.tin; this.sBot[ns] = oy - sp.tout;
      this.sNx[ns] = sp.nx; this.sNy[ns] = sp.ny; this.sNz[ns] = sp.nz;
      this.sCand[ns] = k;
      // insertion sort by top, descending (ties: candidate order, which is deterministic)
      let j = ns;
      while (j > 0 && this.sTop[this.order[j - 1]] < this.sTop[ns]) { this.order[j] = this.order[j - 1]; j--; }
      this.order[j] = ns;
      ns++;
    }
    return ns;
  }

  /** A surface is buried when another solid (not water / one-way) spans the space just above it. */
  private buried(s: number, ns: number, top: number): boolean {
    const y = top + BURY_EPS;
    for (let j = 0; j < ns; j++) {
      if (j === s || (this.flags[this.sCand[j]] & 3)) continue;
      if (this.sBot[j] < y && this.sTop[j] > y) return true;
    }
    return false;
  }

  /**
   * Capsule standing on (x, feet, z) overlaps a solid above step height (lower ones are stepped onto),
   * or touches a hazard / water volume at all.
   */
  private blocked(x: number, feet: number, z: number, r: number, h: number, step: number, nc: number): boolean {
    const ct = this.ct;
    const yTop = feet + h - r;
    const ySolid = feet + Math.min(step + r, h - r);
    const yLow = feet + Math.min(r, h - r);
    for (let k = 0; k < nc; k++) {
      const c = this.cands[k];
      const fl = this.flags[k];
      if (c.maxX < x - r || c.minX > x + r || c.maxZ < z - r || c.minZ > z + r || c.maxY <= feet + 0.001 || c.minY > feet + h) continue;
      let y0: number;
      if (fl & 4 || (fl & 1 && this.avoidWater)) y0 = yLow;
      else if (fl & 3) continue; // one-way platforms can be passed from below; water ignored
      else y0 = ySolid;
      if (c.kind === 'box') segObb(x, y0, z, x, yTop, z, r, c, ct);
      else segCyl(x, y0, z, x, yTop, z, r, c, ct);
      if (ct.depth > (y0 === yLow ? 0.002 : 0.01)) return true;
    }
    return false;
  }

  private buildLinks(cosSlope: number): void {
    const n = this.n, cs = this.cellSize, cols = this.cols, rows = this.rows;
    const links = this.links, step = this.stepHeight + 1e-4;
    const tanSlope = Math.sqrt(1 - cosSlope * cosSlope) / Math.max(cosSlope, 1e-3);
    const needLos = cs > 1.6 * this.radius;
    links.fill(-1, 0, n * 8);
    for (let a = 0; a < n; a++) {
      const col = this.nodeCol[a], ix = col % cols, iz = (col - ix) / cols;
      const ya = this.nodeY[a];
      for (let d = 0; d < 8; d++) {
        const jx = ix + DX[d], jz = iz + DZ[d];
        if (jx < 0 || jz < 0 || jx >= cols || jz >= rows) continue;
        const c2 = jz * cols + jx;
        const sx = DX[d] * cs, sz = DZ[d] * cs;
        const dist = d < 4 ? cs : cs * SQRT2;
        const maxRise = dist * tanSlope + 0.05;
        const predA = -(this.nodeNx[a] * sx + this.nodeNz[a] * sz) / this.nodeNy[a];
        let best = -1, bestDh = Infinity;
        for (let b = this.colStart[c2]; b < this.colStart[c2 + 1]; b++) {
          const dh = this.nodeY[b] - ya, adh = Math.abs(dh);
          let ok = adh <= step;
          if (!ok && adh <= maxRise) {
            const predB = -(this.nodeNx[b] * sx + this.nodeNz[b] * sz) / this.nodeNy[b];
            ok = Math.abs(dh - predA) <= RAMP_TOL || Math.abs(dh - predB) <= RAMP_TOL;
          }
          if (ok && adh < bestDh) { bestDh = adh; best = b; }
        }
        if (best >= 0 && needLos && !this.losClear(a, best)) best = -1;
        links[a * 8 + d] = best;
      }
    }
    // No corner cutting: a diagonal needs both orthogonal moves.
    for (let a = 0; a < n; a++) {
      const o = a * 8;
      for (let d = 4; d < 8; d++) {
        if (links[o + d] < 0) continue;
        const ox = DX[d] > 0 ? 0 : 1, oz = DZ[d] > 0 ? 2 : 3;
        if (links[o + ox] < 0 || links[o + oz] < 0) links[o + d] = -1;
      }
    }
    // Symmetric graph: keep a->b only when b->a exists too.
    for (let a = 0; a < n; a++) {
      for (let d = 0; d < 8; d++) {
        const b = links[a * 8 + d];
        if (b < 0) continue;
        const back = d < 4 ? d ^ 1 : 11 - d; // +x<->-x, +z<->-z, (+x+z)<->(-x-z), (+x-z)<->(-x+z)
        if (links[b * 8 + back] !== a) links[a * 8 + d] = -1;
      }
    }
  }

  private readonly losA = new THREE.Vector3();
  private readonly losB = new THREE.Vector3();
  private readonly losHit: RayHit = { point: new THREE.Vector3(), normal: new THREE.Vector3(), distance: 0, collider: null, body: null };
  private readonly losFilter = (c: unknown): boolean => {
    const s = c as ShapedStatic;
    return s.kind !== undefined && s.tags !== undefined && !s.tags.has('water') && !s.tags.has('oneway');
  };

  /** Coarse grids only: a waist-high ray between the two cell centres must not hit a solid. */
  private losClear(a: number, b: number): boolean {
    const y = Math.max(this.nodeY[a], this.nodeY[b]) + this.stepHeight + 0.1;
    this.nodePosition(a, this.losA).y = y;
    this.nodePosition(b, this.losB).y = y;
    const d = this.losA.distanceTo(this.losB);
    this.losB.sub(this.losA);
    return !this.physics.raycastInto(this.losA, this.losB, d, this.losHit, this.losFilter);
  }

  private buildComponents(): void {
    const n = this.n, comp = this.comp, q = this.chain, links = this.links;
    comp.fill(-1, 0, n);
    let id = 0;
    for (let s = 0; s < n; s++) {
      if (comp[s] >= 0) continue;
      let head = 0, tail = 0;
      q[tail++] = s; comp[s] = id;
      while (head < tail) {
        const a = q[head++];
        for (let d = 0; d < 8; d++) {
          const b = links[a * 8 + d];
          if (b >= 0 && comp[b] < 0) { comp[b] = id; q[tail++] = b; }
        }
      }
      id++;
    }
    this.components = id;
  }

  // ---------------------------------------------------------------------------------------------
  // Queries
  // ---------------------------------------------------------------------------------------------

  private columnOf(x: number, z: number): number {
    const ix = Math.floor((x - this.originX) / this.cellSize), iz = Math.floor((z - this.originZ) / this.cellSize);
    if (ix < 0 || iz < 0 || ix >= this.cols || iz >= this.rows) return -1;
    return iz * this.cols + ix;
  }

  isWalkable(p: THREE.Vector3): boolean {
    return this.nodeAt(p, 0.5) >= 0;
  }

  /** Nearest walkable node to p (horizontal distance, height mismatch weighted x2) within maxDist, or -1. */
  nearestNode(p: THREE.Vector3, maxDist = Infinity, region = -1): number {
    if (this.n === 0) return -1;
    const cs = this.cellSize;
    const fx = (p.x - this.originX) / cs, fz = (p.z - this.originZ) / cs;
    const cx = Math.min(this.cols - 1, Math.max(0, Math.floor(fx))), cz = Math.min(this.rows - 1, Math.max(0, Math.floor(fz)));
    const maxRing = Math.max(this.cols, this.rows);
    let best = -1, bestS = maxDist * maxDist;
    for (let ring = 0; ring <= maxRing; ring++) {
      // Every cell in this ring is at least (ring - 1) cells away horizontally.
      const minD = Math.max(0, ring - 1) * cs;
      if (minD * minD > bestS) break;
      for (let jz = cz - ring; jz <= cz + ring; jz++) {
        if (jz < 0 || jz >= this.rows) continue;
        const edgeZ = jz === cz - ring || jz === cz + ring;
        for (let jx = cx - ring; jx <= cx + ring; jx += edgeZ || ring === 0 ? 1 : 2 * ring) {
          if (jx < 0 || jx >= this.cols) continue;
          const col = jz * this.cols + jx;
          const dx = this.originX + (jx + 0.5) * cs - p.x, dz = this.originZ + (jz + 0.5) * cs - p.z;
          const d2 = dx * dx + dz * dz;
          for (let i = this.colStart[col]; i < this.colStart[col + 1]; i++) {
            if (region >= 0 && this.comp[i] !== region) continue;
            const dy = (this.nodeY[i] - p.y) * 2;
            const s = d2 + dy * dy;
            if (s < bestS) { bestS = s; best = i; }
          }
        }
      }
    }
    return best;
  }

  nearestWalkable(p: THREE.Vector3): THREE.Vector3 {
    const direct = this.nodeAt(p, 0.5);
    if (direct >= 0) return new THREE.Vector3(p.x, this.nodeY[direct], p.z);
    const i = this.nearestNode(p);
    return i < 0 ? p.clone() : this.nodePosition(i, new THREE.Vector3());
  }

  /**
   * Random walkable point. With `near`, it is within `radius` (default 6) of near and in the same connected
   * region as near's nearest cell, so an AI can actually walk there. Uses only the given rng (deterministic).
   */
  randomWalkable(rng: Rng, near?: THREE.Vector3, radius = 6): THREE.Vector3 {
    const out = new THREE.Vector3();
    if (this.n === 0) return near ? near.clone() : out.set(this.originX + (this.cols * this.cellSize) / 2, 0, this.originZ + (this.rows * this.cellSize) / 2);
    if (!near) return this.nodePosition(rng.int(0, this.n - 1), out);
    const start = this.nearestNode(near);
    const region = start >= 0 ? this.comp[start] : -1;
    const tmp = this.losA;
    for (let attempt = 0; attempt < 24; attempt++) {
      const ang = rng.range(0, Math.PI * 2), dist = radius * Math.sqrt(rng.next());
      tmp.set(near.x + Math.cos(ang) * dist, near.y, near.z + Math.sin(ang) * dist);
      const col = this.columnOf(tmp.x, tmp.z);
      if (col < 0) continue;
      let best = -1, bestDy = Infinity;
      for (let i = this.colStart[col]; i < this.colStart[col + 1]; i++) {
        if (region >= 0 && this.comp[i] !== region) continue;
        const dy = Math.abs(this.nodeY[i] - near.y);
        if (dy < bestDy) { bestDy = dy; best = i; }
      }
      if (best >= 0) return this.nodePosition(best, out);
    }
    return start >= 0 ? this.nodePosition(start, out) : out.copy(near);
  }

  /**
   * Walkable path from -> to as feet positions (first = from's cell, last = to or its snapped cell), smoothed
   * to straight runs. null when either end is further than snapRadius from any walkable cell, or when the
   * goal is in a different connected region.
   */
  findPath(from: THREE.Vector3, to: THREE.Vector3): THREE.Vector3[] | null {
    if (this.n === 0) return null;
    let s = this.nodeAt(from, 0.6);
    const fromOnGrid = s >= 0;
    if (s < 0) s = this.nearestNode(from, this.snapRadius);
    if (s < 0) return null;
    let t = this.nodeAt(to, 0.6);
    const toOnGrid = t >= 0 && this.comp[t] === this.comp[s];
    if (!toOnGrid) t = this.nearestNode(to, this.snapRadius, this.comp[s]);
    if (t < 0 || this.comp[t] !== this.comp[s]) return null;

    const len = s === t ? 1 : this.astar(s, t);
    if (len <= 0) return null;
    // chain[0..len-1] = node path from s to t. String-pull greedily: from each kept node, skip ahead while the
    // straight line to the next node can still be walked along graph links.
    const chain = this.chain;
    const out: THREE.Vector3[] = [];
    out.push(fromOnGrid ? new THREE.Vector3(from.x, this.nodeY[s], from.z) : this.nodePosition(s, new THREE.Vector3()));
    let i = 0;
    while (i < len - 1) {
      let j = i + 1;
      while (j + 1 < len && this.walkLine(chain[i], chain[j + 1])) j++;
      i = j;
      if (i < len - 1) out.push(this.nodePosition(chain[i], new THREE.Vector3()));
    }
    out.push(toOnGrid ? new THREE.Vector3(to.x, this.nodeY[t], to.z) : this.nodePosition(t, new THREE.Vector3()));
    return out;
  }

  /** A* from s to t. Writes the node path into chain[0..len-1] and returns len (0 when unreachable). */
  private astar(s: number, t: number): number {
    if (++this.gen >= 0xffffffff) { this.gen = 1; this.seen.fill(0); this.closed.fill(0); }
    const gen = this.gen, cs = this.cellSize, cols = this.cols;
    const g = this.g, f = this.f, parent = this.parent, seen = this.seen, closed = this.closed, links = this.links;
    const tc = this.nodeCol[t];
    this.goalX = tc % cols; this.goalZ = (tc - this.goalX) / cols;
    this.heapN = 0;
    g[s] = 0; f[s] = this.octile(s); parent[s] = -1; seen[s] = gen;
    this.push(s);
    while (this.heapN > 0) {
      const a = this.pop();
      if (a === t) break;
      closed[a] = gen;
      const ya = this.nodeY[a];
      for (let d = 0; d < 8; d++) {
        const b = links[a * 8 + d];
        if (b < 0 || closed[b] === gen) continue;
        const ng = g[a] + (d < 4 ? cs : cs * SQRT2) + 0.5 * Math.abs(this.nodeY[b] - ya);
        if (seen[b] !== gen) {
          seen[b] = gen; g[b] = ng; f[b] = ng + this.octile(b); parent[b] = a;
          this.push(b);
        } else if (ng < g[b] - 1e-12) {
          g[b] = ng; f[b] = ng + this.octile(b); parent[b] = a;
          this.siftUp(this.heapPos[b]);
        }
      }
    }
    if (seen[t] !== gen) return 0;
    let len = 0;
    for (let a = t; a >= 0; a = parent[a]) len++;
    let k = len;
    for (let a = t; a >= 0; a = parent[a]) this.chain[--k] = a;
    return len;
  }

  private goalX = 0;
  private goalZ = 0;
  /** Admissible octile distance (horizontal) from node a to the current goal cell. */
  private octile(a: number): number {
    const c = this.nodeCol[a], ax = c % this.cols, az = (c - ax) / this.cols;
    const dx = Math.abs(ax - this.goalX), dz = Math.abs(az - this.goalZ);
    return this.cellSize * (Math.max(dx, dz) + (SQRT2 - 1) * Math.min(dx, dz));
  }

  // Indexed binary min-heap on f (ties broken by node index for determinism).
  private less(a: number, b: number): boolean {
    const fa = this.f[a], fb = this.f[b];
    return fa < fb || (fa === fb && a < b);
  }
  private push(a: number): void {
    const i = this.heapN++;
    this.heap[i] = a; this.heapPos[a] = i;
    this.siftUp(i);
  }
  private pop(): number {
    const top = this.heap[0];
    const last = this.heap[--this.heapN];
    if (this.heapN > 0) { this.heap[0] = last; this.heapPos[last] = 0; this.siftDown(0); }
    return top;
  }
  private siftUp(i: number): void {
    const heap = this.heap, pos = this.heapPos, a = heap[i];
    while (i > 0) {
      const p = (i - 1) >> 1, b = heap[p];
      if (!this.less(a, b)) break;
      heap[i] = b; pos[b] = i; i = p;
    }
    heap[i] = a; pos[a] = i;
  }
  private siftDown(i: number): void {
    const heap = this.heap, pos = this.heapPos, n = this.heapN, a = heap[i];
    for (;;) {
      const l = 2 * i + 1;
      if (l >= n) break;
      const r = l + 1;
      const c = r < n && this.less(heap[r], heap[l]) ? r : l;
      if (!this.less(heap[c], a)) break;
      heap[i] = heap[c]; pos[heap[c]] = i; i = c;
    }
    heap[i] = a; pos[a] = i;
  }

  /**
   * True when the straight line between the centres of nodes a and b can be walked cell by cell along
   * graph links (grid DDA; exact corner crossings use the diagonal link), and the ground under it stays
   * within PATH_DY_TOL of the straight 3D segment (so waypoints sit at the foot and top of ramps and stairs).
   */
  private walkLine(a: number, b: number): boolean {
    const cols = this.cols, links = this.links;
    const ca = this.nodeCol[a], cb = this.nodeCol[b];
    let ix = ca % cols, iz = (ca - ix) / cols;
    const ax = ix, az = iz, ya = this.nodeY[a], yb = this.nodeY[b];
    const bx = cb % cols, bz = (cb - bx) / cols;
    const dx = bx - ix, dz = bz - iz;
    const sx = dx > 0 ? 1 : dx < 0 ? -1 : 0, sz = dz > 0 ? 1 : dz < 0 ? -1 : 0;
    const adx = Math.abs(dx), adz = Math.abs(dz);
    const invLen2 = 1 / Math.max(1, dx * dx + dz * dz);
    // Parametric DDA in cell units from centre to centre: next x boundary at t = (k + 0.5) / adx.
    let kx = 0, kz = 0, cur = a;
    while (kx < adx || kz < adz) {
      const tX = kx < adx ? (kx + 0.5) / adx : Infinity;
      const tZ = kz < adz ? (kz + 0.5) / adz : Infinity;
      let d: number;
      if (Math.abs(tX - tZ) < 1e-9) {
        d = sx > 0 ? (sz > 0 ? 4 : 5) : (sz > 0 ? 6 : 7);
        kx++; kz++; ix += sx; iz += sz;
      } else if (tX < tZ) {
        d = sx > 0 ? 0 : 1; kx++; ix += sx;
      } else {
        d = sz > 0 ? 2 : 3; kz++; iz += sz;
      }
      cur = links[cur * 8 + d];
      if (cur < 0) return false;
      const t = ((ix - ax) * dx + (iz - az) * dz) * invLen2;
      const yl = ya + (yb - ya) * (t < 0 ? 0 : t > 1 ? 1 : t);
      if (Math.abs(this.nodeY[cur] - yl) > PATH_DY_TOL) return false;
    }
    return cur === b;
  }
}
