/**
 * Custom deterministic physics: static OBBs / vertical cylinders in a uniform spatial hash,
 * character capsules (collide-and-slide by iterative depenetration), simple dynamic props and triggers.
 * Hot paths (moveCapsule, step, raycastInto, visible) do not allocate.
 */
import * as THREE from 'three';
import type { Body, CapsuleState, ColliderTag, PhysicsWorld, RayHit, StaticCollider, Trigger } from '../core/api.ts';
import {
  aabbCyl, aabbObb, clamp, newContact, newRaySpan, obbExtentX, obbExtentY, obbExtentZ, rayAabbSpan, rayCylSpan,
  rayObbSpan, raySphereSpan, segCyl, segObb, segSphere, setBasis,
} from './collision_math.ts';
import type { Contact, CylShape, ObbShape } from './collision_math.ts';

/**
 * What queryStatics() actually returns: the public collider plus its cached shape and world AABB
 * (refreshed by the query itself). Lets other world modules (nav) run the collision kernels directly.
 */
export type ShapedStatic = StaticCollider & ObbShape & CylShape & {
  minX: number; minY: number; minZ: number; maxX: number; maxY: number; maxZ: number;
};

/**
 * Optional inputs / outputs a controller may put on its CapsuleState. moveCapsule reads the inputs
 * when present and always writes the outputs.
 */
export interface CapsuleExt extends CapsuleState {
  /** Gravity multiplier applied by moveCapsule (default 1). Set 0 if the controller integrates gravity itself. */
  gravityScale?: number;
  /** Mass used when shoving props (default Physics.capsuleMass = 60). */
  mass?: number;
  /** Override step height (default Physics.stepHeight = 0.35). 0 disables stepping. */
  stepHeight?: number;
  /** Output: metres climbed by step-up this move (smooth the mesh by this amount). */
  steppedUp?: number;
  /** Output: pressed against a surface too steep to stand on (sliding down it). */
  onSteep?: boolean;
  /** Output: standing on a dynamic body. */
  groundBody?: Body | null;
  /** Output: touching a collider tagged 'hazard'. */
  hazard?: StaticCollider | null;
  /** Output: overlapping a collider tagged 'water'. */
  inWater?: StaticCollider | null;
  /** Output: downward speed at the moment of landing this move (0 if no landing). */
  landingSpeed?: number;
  /** Output: bounced off a 'bouncy' surface this move. */
  bounced?: boolean;
}

export function createCapsule(position: THREE.Vector3, radius = 0.4, height = 1.2): CapsuleExt {
  return {
    position: position.clone(), velocity: new THREE.Vector3(), radius, height,
    onGround: false, groundNormal: new THREE.Vector3(0, 1, 0), groundCollider: null,
    touchingWall: null, wallNormal: new THREE.Vector3(),
    steppedUp: 0, onSteep: false, groundBody: null, hazard: null, inWater: null, landingSpeed: 0, bounced: false,
  };
}

class SCollider implements StaticCollider, ObbShape {
  id: number;
  kind: 'box' | 'cylinder';
  center: THREE.Vector3;
  half: THREE.Vector3;
  rotY: number;
  tilt?: number;
  tags: Set<ColliderTag>;
  velocity?: THREE.Vector3;
  userData?: unknown;
  enabled = true;
  // Cached shape (validated against the public fields before every use).
  cx = NaN; cy = NaN; cz = NaN; hx = NaN; hy = NaN; hz = NaN; r = 0; hh = 0;
  m = new Float64Array(9);
  minX = 0; minY = 0; minZ = 0; maxX = 0; maxY = 0; maxZ = 0;
  ry = NaN; tl = NaN;
  qstamp = 0;
  hashed = false;
  loose = false;
  wasEnabled = true;
  dirty = false;
  cells = new Int32Array(6);
  constructor(id: number, kind: 'box' | 'cylinder', center: THREE.Vector3, half: THREE.Vector3, rotY: number, tilt: number, tags: Set<ColliderTag>) {
    this.id = id; this.kind = kind; this.center = center; this.half = half; this.rotY = rotY; this.tilt = tilt; this.tags = tags;
  }
}

class DBody implements Body {
  id: number;
  shape: 'sphere' | 'box';
  radius: number;
  half?: THREE.Vector3;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  mass: number;
  restitution: number;
  friction: number;
  gravityScale: number;
  onGround = false;
  sleeping = false;
  carriedBy: string | null = null;
  tags: Set<string>;
  userData?: unknown;
  onHit?: (other: StaticCollider | Body | null, impactSpeed: number) => void;
  // internals
  sleepT = 0;
  groundCol: SCollider | null = null;
  hitSpeed = 0;
  hitOther: StaticCollider | Body | null = null;
  ex = 0; ey = 0; ez = 0; // AABB half extents
  constructor(id: number, shape: 'sphere' | 'box', position: THREE.Vector3) {
    this.id = id; this.shape = shape; this.position = position;
    this.radius = 0.3; this.velocity = new THREE.Vector3(); this.mass = 10; this.restitution = 0.2;
    this.friction = 0.6; this.gravityScale = 1; this.tags = new Set();
  }
}

class STrigger implements Trigger {
  id: number;
  center: THREE.Vector3;
  half: THREE.Vector3;
  radius?: number;
  onEnter?: (who: string) => void;
  onExit?: (who: string) => void;
  enabled = true;
  inside = new Set<string>();
  constructor(id: number, center: THREE.Vector3, half: THREE.Vector3) { this.id = id; this.center = center; this.half = half; }
}

const DEG = Math.PI / 180;
const KEY_X = 2048, KEY_Y = 1024;
const MAX_HASH_CELLS = 1024; // larger colliders live in the always-tested loose list
const WALL_SKIN = 0.06;

export interface PhysicsOptions { cellSize?: number }

export class Physics implements PhysicsWorld {
  gravity = 24;
  killY = -25;
  /** Character tuning (per-capsule overrides live on CapsuleExt). */
  stepHeight = 0.35;
  snapDistance = 0.4;
  capsuleMass = 60;
  private cosSlope = Math.cos(50 * DEG);

  private readonly cellSize: number;
  private readonly invCell: number;
  private cellMap = new Map<number, SCollider[]>();
  private statics: SCollider[] = [];
  private loose: SCollider[] = [];
  private bodies: DBody[] = [];
  private sap: DBody[] = [];
  private triggers: STrigger[] = [];
  private moverIds: string[] = [];
  private moverFns: (() => THREE.Vector3)[] = [];
  private capsules = new Map<string, CapsuleExt>();
  private capsuleList: CapsuleExt[] = [];
  private nextId = 1;
  private stamp = 0;
  private version = 0;

  // scratch
  private cands: SCollider[] = [];
  private nc = 0;
  private ct: Contact = newContact();
  private ct2: Contact = newContact();
  private span = newRaySpan();
  private rayScratch: RayHit = { point: new THREE.Vector3(), normal: new THREE.Vector3(), distance: 0, collider: null, body: null };
  private boxShape: ObbShape = { cx: 0, cy: 0, cz: 0, hx: 0, hy: 0, hz: 0, m: new Float64Array([1, 0, 0, 0, 1, 0, 0, 0, 1]) };
  private hitT = 0; private hitNx = 0; private hitNy = 0; private hitNz = 0;
  private hitC: SCollider | null = null; private hitB: DBody | null = null;
  // per-move state
  private mvWasGrounded = false;
  private mvCanStep = false;
  private mvPrevFeet = 0;
  private dbg: DebugDraw | null = null;

  constructor(opts: PhysicsOptions = {}) {
    this.cellSize = opts.cellSize ?? 4;
    this.invCell = 1 / this.cellSize;
  }

  get slopeLimitDeg(): number { return Math.acos(this.cosSlope) / DEG; }
  set slopeLimitDeg(v: number) { this.cosSlope = Math.cos(v * DEG); }
  get staticCount(): number { return this.statics.length; }
  get bodyList(): readonly Body[] { return this.bodies; }
  get triggerList(): readonly Trigger[] { return this.triggers; }

  // ---------------------------------------------------------------------------------------------
  // Registration
  // ---------------------------------------------------------------------------------------------

  addBox(center: THREE.Vector3, half: THREE.Vector3, opts: { rotY?: number; tilt?: number; tags?: ColliderTag[]; userData?: unknown } = {}): StaticCollider {
    const c = new SCollider(this.nextId++, 'box', center.clone(), half.clone(), opts.rotY ?? 0, opts.tilt ?? 0, new Set(opts.tags ?? ['solid']));
    c.userData = opts.userData;
    return this.addStatic(c);
  }

  addCylinder(center: THREE.Vector3, radius: number, halfHeight: number, opts: { tags?: ColliderTag[]; userData?: unknown } = {}): StaticCollider {
    const c = new SCollider(this.nextId++, 'cylinder', center.clone(), new THREE.Vector3(radius, halfHeight, radius), 0, 0, new Set(opts.tags ?? ['solid']));
    c.userData = opts.userData;
    return this.addStatic(c);
  }

  private addStatic(c: SCollider): SCollider {
    this.refreshShape(c);
    this.statics.push(c);
    this.hashInsert(c);
    this.version++;
    return c;
  }

  addBody(opts: Partial<Body> & { shape: 'sphere' | 'box'; position: THREE.Vector3 }): Body {
    const b = new DBody(this.nextId++, opts.shape, opts.position.clone());
    if (opts.velocity) b.velocity.copy(opts.velocity);
    if (opts.half) b.half = opts.half.clone();
    if (b.shape === 'box' && !b.half) b.half = new THREE.Vector3(0.3, 0.3, 0.3);
    b.radius = opts.radius ?? (b.half ? b.half.length() : 0.3);
    if (opts.mass !== undefined) b.mass = opts.mass;
    if (opts.restitution !== undefined) b.restitution = opts.restitution;
    if (opts.friction !== undefined) b.friction = opts.friction;
    if (opts.gravityScale !== undefined) b.gravityScale = opts.gravityScale;
    if (opts.tags) for (const t of opts.tags) b.tags.add(t);
    if (opts.userData !== undefined) b.userData = opts.userData;
    if (opts.onHit) b.onHit = opts.onHit;
    if (opts.carriedBy !== undefined) b.carriedBy = opts.carriedBy;
    if (opts.sleeping) b.sleeping = true;
    this.bodies.push(b);
    this.sap.push(b);
    return b;
  }

  addTrigger(opts: Omit<Trigger, 'id' | 'enabled'>): Trigger {
    const t = new STrigger(this.nextId++, opts.center.clone(), opts.half.clone());
    t.radius = opts.radius; t.onEnter = opts.onEnter; t.onExit = opts.onExit;
    this.triggers.push(t);
    return t;
  }

  remove(c: StaticCollider | Body | Trigger): void {
    if (c instanceof SCollider) {
      const i = this.statics.indexOf(c);
      if (i < 0) return;
      this.statics.splice(i, 1);
      if (c.hashed) this.hashRemove(c);
      if (c.loose) { const j = this.loose.indexOf(c); if (j >= 0) this.loose.splice(j, 1); c.loose = false; }
      this.wakeInBox(c.minX, c.minY, c.minZ, c.maxX, c.maxY, c.maxZ);
      this.version++;
    } else if (c instanceof DBody) {
      let i = this.bodies.indexOf(c);
      if (i >= 0) this.bodies.splice(i, 1);
      i = this.sap.indexOf(c);
      if (i >= 0) this.sap.splice(i, 1);
    } else if (c instanceof STrigger) {
      const i = this.triggers.indexOf(c);
      if (i >= 0) this.triggers.splice(i, 1);
    }
  }

  registerMover(id: string, getPos: () => THREE.Vector3): void {
    const i = this.moverIds.indexOf(id);
    if (i >= 0) { this.moverFns[i] = getPos; return; }
    this.moverIds.push(id);
    this.moverFns.push(getPos);
  }

  unregisterMover(id: string): void {
    const i = this.moverIds.indexOf(id);
    if (i >= 0) { this.moverIds.splice(i, 1); this.moverFns.splice(i, 1); }
    for (const t of this.triggers) if (t.inside.delete(id)) t.onExit?.(id);
    this.forgetCapsule(id);
  }

  /** Stop treating a capsule passed to moveCapsule as an obstacle for bodies. */
  forgetCapsule(ownerId: string): void {
    const c = this.capsules.get(ownerId);
    if (!c) return;
    this.capsules.delete(ownerId);
    const i = this.capsuleList.indexOf(c);
    if (i >= 0) this.capsuleList.splice(i, 1);
  }

  /** Resets the world for a new room (gravity and killY return to defaults). */
  clear(): void {
    this.cellMap.clear();
    this.statics.length = 0; this.loose.length = 0; this.bodies.length = 0; this.sap.length = 0; this.triggers.length = 0;
    this.moverIds.length = 0; this.moverFns.length = 0; this.capsules.clear(); this.capsuleList.length = 0;
    this.gravity = 24; this.killY = -25;
    this.version++;
  }

  /** Re-validate a static after its transform changed (optional; step() does this for every static). */
  refresh(c: StaticCollider): void {
    if (!(c instanceof SCollider)) return;
    if (this.refreshShape(c) && c.hashed) { this.hashRemove(c); this.hashInsert(c); }
  }

  wake(b: Body): void { (b as DBody).sleeping = false; (b as DBody).sleepT = 0; }

  isBelowKill(p: THREE.Vector3): boolean { return p.y < this.killY; }

  // ---------------------------------------------------------------------------------------------
  // Spatial hash
  // ---------------------------------------------------------------------------------------------

  private refreshShape(c: SCollider): boolean {
    const p = c.center, h = c.half, tilt = c.tilt ?? 0;
    if (p.x === c.cx && p.y === c.cy && p.z === c.cz && h.x === c.hx && h.y === c.hy && h.z === c.hz && c.rotY === c.ry && tilt === c.tl) return false;
    c.cx = p.x; c.cy = p.y; c.cz = p.z; c.hx = h.x; c.hy = h.y; c.hz = h.z;
    let ex: number, ey: number, ez: number;
    if (c.kind === 'box') {
      if (c.rotY !== c.ry || tilt !== c.tl) setBasis(c.m, c.rotY, tilt);
      ex = obbExtentX(c); ey = obbExtentY(c); ez = obbExtentZ(c);
    } else {
      c.r = h.x; c.hh = h.y;
      ex = h.x; ey = h.y; ez = h.x;
    }
    c.ry = c.rotY; c.tl = tilt;
    c.minX = p.x - ex; c.maxX = p.x + ex; c.minY = p.y - ey; c.maxY = p.y + ey; c.minZ = p.z - ez; c.maxZ = p.z + ez;
    return true;
  }

  private key(ix: number, iy: number, iz: number): number {
    ix = clamp(ix, -KEY_X / 2, KEY_X / 2 - 1) + KEY_X / 2;
    iz = clamp(iz, -KEY_X / 2, KEY_X / 2 - 1) + KEY_X / 2;
    iy = clamp(iy, -KEY_Y / 2, KEY_Y / 2 - 1) + KEY_Y / 2;
    return (ix * KEY_X + iz) * KEY_Y + iy;
  }

  private hashInsert(c: SCollider): void {
    const inv = this.invCell;
    const x0 = Math.floor(c.minX * inv), x1 = Math.floor(c.maxX * inv);
    const y0 = Math.floor(c.minY * inv), y1 = Math.floor(c.maxY * inv);
    const z0 = Math.floor(c.minZ * inv), z1 = Math.floor(c.maxZ * inv);
    if (c.velocity !== undefined || (x1 - x0 + 1) * (y1 - y0 + 1) * (z1 - z0 + 1) > MAX_HASH_CELLS) {
      if (!c.loose) { c.loose = true; this.loose.push(c); }
      return;
    }
    c.cells[0] = x0; c.cells[1] = x1; c.cells[2] = y0; c.cells[3] = y1; c.cells[4] = z0; c.cells[5] = z1;
    for (let x = x0; x <= x1; x++) for (let z = z0; z <= z1; z++) for (let y = y0; y <= y1; y++) {
      const k = this.key(x, y, z);
      let list = this.cellMap.get(k);
      if (!list) { list = []; this.cellMap.set(k, list); }
      list.push(c);
    }
    c.hashed = true;
  }

  private hashRemove(c: SCollider): void {
    const r = c.cells;
    for (let x = r[0]; x <= r[1]; x++) for (let z = r[4]; z <= r[5]; z++) for (let y = r[2]; y <= r[3]; y++) {
      const list = this.cellMap.get(this.key(x, y, z));
      if (!list) continue;
      const i = list.indexOf(c);
      if (i >= 0) list.splice(i, 1);
    }
    c.hashed = false;
  }

  /** Once per tick: move newly-animated statics to the loose list, rehash moved ones, wake props. */
  private syncStatics(dt: number): void {
    for (let i = 0; i < this.statics.length; i++) {
      const c = this.statics[i];
      if (c.enabled !== c.wasEnabled) {
        c.wasEnabled = c.enabled;
        this.wakeInBox(c.minX - 0.1, c.minY - 0.1, c.minZ - 0.1, c.maxX + 0.1, c.maxY + 0.1, c.maxZ + 0.1);
      }
      if (c.hashed && c.velocity !== undefined) { this.hashRemove(c); c.loose = true; this.loose.push(c); }
      if (this.refreshShape(c) || c.dirty) {
        c.dirty = false;
        if (c.hashed) { this.hashRemove(c); this.hashInsert(c); }
        this.wakeInBox(c.minX - 0.3, c.minY - 0.3, c.minZ - 0.3, c.maxX + 0.3, c.maxY + 0.3, c.maxZ + 0.3);
      } else if (c.velocity && c.enabled && (c.velocity.x !== 0 || c.velocity.y !== 0 || c.velocity.z !== 0)) {
        const m = (Math.abs(c.velocity.x) + Math.abs(c.velocity.y) + Math.abs(c.velocity.z)) * dt + 0.05;
        this.wakeInBox(c.minX - m, c.minY - m, c.minZ - m, c.maxX + m, c.maxY + m, c.maxZ + m);
      }
    }
  }

  private wakeInBox(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number): void {
    for (let i = 0; i < this.bodies.length; i++) {
      const b = this.bodies[i];
      if (!b.sleeping) continue;
      const p = b.position;
      const ex = b.shape === 'box' ? b.half!.x : b.radius, ey = b.shape === 'box' ? b.half!.y : b.radius, ez = b.shape === 'box' ? b.half!.z : b.radius;
      if (p.x + ex < x0 || p.x - ex > x1 || p.y + ey < y0 || p.y - ey > y1 || p.z + ez < z0 || p.z - ez > z1) continue;
      b.sleeping = false; b.sleepT = 0;
    }
  }

  /** Enabled statics whose AABB overlaps the box. Fills `out` from index 0 and returns the count. */
  queryStatics(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, out: StaticCollider[]): number {
    const stamp = ++this.stamp;
    let n = 0;
    for (let i = 0; i < this.loose.length; i++) {
      const c = this.loose[i];
      c.qstamp = stamp;
      if (!c.enabled) continue;
      this.refreshShape(c);
      if (c.maxX < x0 || c.minX > x1 || c.maxY < y0 || c.minY > y1 || c.maxZ < z0 || c.minZ > z1) continue;
      out[n++] = c;
    }
    const inv = this.invCell;
    const ix0 = Math.floor(x0 * inv), ix1 = Math.floor(x1 * inv);
    const iy0 = Math.floor(y0 * inv), iy1 = Math.floor(y1 * inv);
    const iz0 = Math.floor(z0 * inv), iz1 = Math.floor(z1 * inv);
    for (let x = ix0; x <= ix1; x++) for (let z = iz0; z <= iz1; z++) for (let y = iy0; y <= iy1; y++) {
      const list = this.cellMap.get(this.key(x, y, z));
      if (!list) continue;
      for (let i = 0; i < list.length; i++) {
        const c = list[i];
        if (c.qstamp === stamp) continue;
        c.qstamp = stamp;
        if (!c.enabled) continue;
        if (this.refreshShape(c)) c.dirty = true;
        if (c.maxX < x0 || c.minX > x1 || c.maxY < y0 || c.minY > y1 || c.maxZ < z0 || c.minZ > z1) continue;
        out[n++] = c;
      }
    }
    return n;
  }

  private gather(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number): void {
    this.nc = this.queryStatics(x0, y0, z0, x1, y1, z1, this.cands);
  }

  /** Contact between a capsule/sphere core segment and a static, written to `out`. */
  contactSeg(c: StaticCollider, ax: number, ay: number, az: number, bx: number, by: number, bz: number, r: number, out: Contact): void {
    const s = c as SCollider;
    if (s.kind === 'box') segObb(ax, ay, az, bx, by, bz, r, s, out);
    else segCyl(ax, ay, az, bx, by, bz, r, s, out);
  }

  // ---------------------------------------------------------------------------------------------
  // Characters
  // ---------------------------------------------------------------------------------------------

  moveCapsule(cs: CapsuleState, dt: number, ownerId: string): void {
    const c = cs as CapsuleExt;
    if (!this.capsules.has(ownerId)) { this.capsules.set(ownerId, c); this.capsuleList.push(c); }
    else if (this.capsules.get(ownerId) !== c) {
      const old = this.capsules.get(ownerId)!;
      this.capsuleList[this.capsuleList.indexOf(old)] = c;
      this.capsules.set(ownerId, c);
    }
    const r = c.radius, h = Math.max(c.height, 2 * r + 0.01);
    const p = c.position, v = c.velocity;
    const wasGrounded = c.onGround;
    const prevGround = c.groundCollider as SCollider | null;
    const pv = prevGround && prevGround.enabled && wasGrounded ? prevGround.velocity : undefined;

    v.y -= this.gravity * (c.gravityScale ?? 1) * dt;

    c.onGround = false; c.groundCollider = null; c.touchingWall = null; c.groundNormal.set(0, 1, 0); c.wallNormal.set(0, 0, 0);
    c.steppedUp = 0; c.onSteep = false; c.groundBody = null; c.hazard = null; c.inWater = null; c.landingSpeed = 0; c.bounced = false;
    this.mvWasGrounded = wasGrounded;
    this.mvCanStep = wasGrounded && (c.stepHeight ?? this.stepHeight) > 0;
    this.mvPrevFeet = p.y;

    const carX = pv ? pv.x * dt : 0, carY = pv ? pv.y * dt : 0, carZ = pv ? pv.z * dt : 0;
    const dx = v.x * dt + carX, dy = v.y * dt + carY, dz = v.z * dt + carZ;
    const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const n = clamp(Math.ceil(len / (r * 0.5)), 1, 12);
    const m = r + 0.6;
    this.gather(Math.min(p.x, p.x + dx) - m, Math.min(p.y, p.y + dy) - this.snapDistance - 0.2, Math.min(p.z, p.z + dz) - m,
      Math.max(p.x, p.x + dx) + m, Math.max(p.y, p.y + dy) + h + 0.5, Math.max(p.z, p.z + dz) + m);

    const inv = 1 / n;
    for (let s = 0; s < n; s++) {
      p.x += v.x * dt * inv + carX * inv;
      p.y += v.y * dt * inv + carY * inv;
      p.z += v.z * dt * inv + carZ * inv;
      this.resolveCapsule(c, r, h);
    }

    // Ground snapping: stay glued when walking down slopes and small steps.
    if (wasGrounded && !c.onGround && !c.bounced && v.y <= 0) {
      const sx = p.x, sy = p.y, sz = p.z, wall = c.touchingWall, steep = c.onSteep;
      this.mvCanStep = false;
      const half = this.snapDistance * 0.5;
      p.y -= half;
      this.resolveCapsule(c, r, h);
      if (!c.onGround) { p.y -= half; this.resolveCapsule(c, r, h); }
      if (!c.onGround) { p.set(sx, sy, sz); c.touchingWall = wall; c.onSteep = steep; }
    }

    this.capsuleVsBodies(c, r, h, dt);
    this.probeContacts(c, r, h);

    // Jumping or walking off a moving platform keeps its momentum.
    if (pv && !c.onGround) { v.x += pv.x; v.z += pv.z; if (pv.y > 0) v.y += pv.y; }
  }

  private resolveCapsule(c: CapsuleExt, r: number, h: number): void {
    const p = c.position, ct = this.ct;
    for (let iter = 0; iter < 4; iter++) {
      let any = false;
      for (let i = 0; i < this.nc; i++) {
        const col = this.cands[i];
        if (!col.enabled || col.tags.has('water')) continue;
        if (col.maxX < p.x - r || col.minX > p.x + r || col.maxZ < p.z - r || col.minZ > p.z + r || col.maxY < p.y || col.minY > p.y + h) continue;
        this.contactSeg(col, p.x, p.y + r, p.z, p.x, p.y + h - r, p.z, r, ct);
        if (ct.depth <= 1e-6) continue;
        if (col.tags.has('oneway') && !(ct.ny > 0.7 && c.velocity.y <= 0.01 && this.mvPrevFeet >= ct.py - 0.05)) continue;
        any = true;
        this.applyCapsuleContact(c, col, r, h);
      }
      if (!any) break;
    }
  }

  private applyCapsuleContact(c: CapsuleExt, col: SCollider, r: number, h: number): void {
    const ct = this.ct, p = c.position, v = c.velocity;
    if (ct.ny >= this.cosSlope) {
      p.y += ct.depth / ct.ny;
      if (v.y < 0) {
        if (!this.mvWasGrounded && -v.y > (c.landingSpeed ?? 0)) c.landingSpeed = -v.y;
        if (col.tags.has('bouncy') && v.y < -3) { v.y = Math.max(-v.y * 0.8, 9); c.bounced = true; }
        else v.y = 0;
      }
      if (!c.bounced) {
        c.onGround = true; c.groundCollider = col; c.groundNormal.set(ct.nx, ct.ny, ct.nz);
      }
      return;
    }
    const into = v.x * ct.nx + v.z * ct.nz < 0;
    if (ct.ny > -0.3 && this.mvCanStep && into && this.tryStepUp(c, r, h)) return;
    const steep = ct.ny > 0.05;
    const vyBefore = v.y;
    if (steep && into) {
      // Walking into a steep face: resolve horizontally so it can never be climbed.
      const hl = Math.sqrt(ct.nx * ct.nx + ct.nz * ct.nz);
      const d = ct.depth / hl;
      p.x += (ct.nx / hl) * d; p.z += (ct.nz / hl) * d;
    } else {
      p.x += ct.nx * ct.depth; p.y += ct.ny * ct.depth; p.z += ct.nz * ct.depth;
    }
    const vn = v.x * ct.nx + v.y * ct.ny + v.z * ct.nz;
    if (vn < 0) { v.x -= ct.nx * vn; v.y -= ct.ny * vn; v.z -= ct.nz * vn; }
    if (steep) {
      if (v.y > Math.max(vyBefore, 0)) v.y = Math.max(vyBefore, 0);
      c.onSteep = true;
    } else if (ct.ny > -0.3) {
      c.touchingWall = col;
      const l = Math.sqrt(ct.nx * ct.nx + ct.nz * ct.nz) || 1;
      c.wallNormal.set(ct.nx / l, 0, ct.nz / l);
    }
  }

  /**
   * Step-up: if a walkable top lies within step height just beyond the contact, lift the capsule until
   * its rounded bottom exactly clears the edge (it rides over the lip smoothly instead of popping).
   */
  private tryStepUp(c: CapsuleExt, r: number, h: number): boolean {
    const ct = this.ct, p = c.position;
    const hl = Math.sqrt(ct.nx * ct.nx + ct.nz * ct.nz);
    if (hl < 1e-6) return false;
    const stepH = c.stepHeight ?? this.stepHeight;
    if (ct.py > p.y + stepH + 0.01) return false;
    const ox = ct.px - (ct.nx / hl) * 0.02, oz = ct.pz - (ct.nz / hl) * 0.02;
    const oy = p.y + stepH + 0.02;
    if (!this.rayCore(ox, oy, oz, 0, -1, 0, stepH + 0.02, null, false, true)) return false;
    const topY = oy - this.hitT;
    const rise = topY - p.y;
    if (rise <= 0.002 || rise > stepH || this.hitNy < this.cosSlope) return false;
    const dx = p.x - ct.px, dz = p.z - ct.pz;
    const lift = topY + Math.sqrt(Math.max(0, r * r - dx * dx - dz * dz)) - r - p.y;
    if (lift <= 0) return false;
    if (this.capsuleBlocked(p.x, p.y + lift + 0.001, p.z, r, h)) return false;
    p.y += lift + 0.0005;
    c.steppedUp = (c.steppedUp ?? 0) + lift;
    if (c.velocity.y < 0) c.velocity.y = 0;
    c.onGround = true;
    c.groundCollider = this.hitC;
    c.groundNormal.set(this.hitNx, this.hitNy, this.hitNz);
    return true;
  }

  private capsuleBlocked(x: number, feet: number, z: number, r: number, h: number): boolean {
    const ct = this.ct2;
    for (let i = 0; i < this.nc; i++) {
      const col = this.cands[i];
      if (!col.enabled || col.tags.has('water') || col.tags.has('oneway')) continue;
      if (col.maxX < x - r || col.minX > x + r || col.maxZ < z - r || col.minZ > z + r || col.maxY < feet || col.minY > feet + h) continue;
      this.contactSeg(col, x, feet + r, z, x, feet + h - r, z, r, ct);
      if (ct.depth > 0.002) return true;
    }
    return false;
  }

  /** Wall / hazard / water reporting with a small skin so resting contacts register. */
  private probeContacts(c: CapsuleExt, r: number, h: number): void {
    const p = c.position, ct = this.ct2;
    let bestWall = -Infinity;
    if (c.touchingWall) bestWall = 0;
    for (let i = 0; i < this.nc; i++) {
      const col = this.cands[i];
      if (!col.enabled) continue;
      if (col.maxX < p.x - r - WALL_SKIN || col.minX > p.x + r + WALL_SKIN || col.maxZ < p.z - r - WALL_SKIN || col.minZ > p.z + r + WALL_SKIN
        || col.maxY < p.y - WALL_SKIN || col.minY > p.y + h + WALL_SKIN) continue;
      this.contactSeg(col, p.x, p.y + r, p.z, p.x, p.y + h - r, p.z, r, ct);
      if (ct.depth < -WALL_SKIN) continue;
      if (col.tags.has('water')) { if (ct.depth > 0) c.inWater = col; continue; }
      if (col.tags.has('hazard')) c.hazard = col;
      if (Math.abs(ct.ny) < 0.35 && ct.depth > bestWall && !col.tags.has('oneway')) {
        bestWall = ct.depth;
        c.touchingWall = col;
        const l = Math.sqrt(ct.nx * ct.nx + ct.nz * ct.nz) || 1;
        c.wallNormal.set(ct.nx / l, 0, ct.nz / l);
      }
    }
  }

  private capsuleVsBodies(c: CapsuleExt, r: number, h: number, _dt: number): void {
    const p = c.position, v = c.velocity, ct = this.ct;
    const mc = c.mass ?? this.capsuleMass;
    for (let i = 0; i < this.bodies.length; i++) {
      const b = this.bodies[i];
      if (b.carriedBy !== null) continue;
      const bp = b.position;
      this.bodyExtents(b);
      if (bp.x + b.ex < p.x - r || bp.x - b.ex > p.x + r || bp.z + b.ez < p.z - r || bp.z - b.ez > p.z + r || bp.y + b.ey < p.y || bp.y - b.ey > p.y + h) continue;
      this.contactSegBody(b, p.x, p.y + r, p.z, p.x, p.y + h - r, p.z, r, ct);
      if (ct.depth <= 1e-6) continue;
      b.sleeping = false; b.sleepT = 0;
      if (ct.ny >= this.cosSlope) {
        // Standing on a prop.
        p.y += ct.depth / ct.ny;
        if (v.y < 0) { if (!this.mvWasGrounded && -v.y > (c.landingSpeed ?? 0)) c.landingSpeed = -v.y; v.y = 0; }
        c.onGround = true; c.groundBody = b; c.groundNormal.set(ct.nx, ct.ny, ct.nz);
        continue;
      }
      const mb = b.mass > 0 ? b.mass : Infinity;
      const wc = mb === Infinity ? 1 : mb / (mb + mc);
      if (ct.ny <= -0.5) {
        // Prop resting on the character's head: lift the prop.
        bp.y -= ct.ny * ct.depth; if (b.velocity.y < v.y) b.velocity.y = v.y;
        continue;
      }
      const hl = Math.sqrt(ct.nx * ct.nx + ct.nz * ct.nz) || 1;
      const nx = ct.nx / hl, nz = ct.nz / hl;
      p.x += nx * ct.depth * wc; p.z += nz * ct.depth * wc;
      bp.x -= nx * ct.depth * (1 - wc); bp.z -= nz * ct.depth * (1 - wc);
      const vrel = -((v.x - b.velocity.x) * nx + (v.z - b.velocity.z) * nz); // approach speed
      if (vrel > 0) {
        const j = vrel / (1 / mc + (mb === Infinity ? 0 : 1 / mb));
        if (mb !== Infinity) { b.velocity.x -= nx * j / mb; b.velocity.z -= nz * j / mb; }
        v.x += nx * j / mc; v.z += nz * j / mc;
        if (vrel > b.hitSpeed) { b.hitSpeed = vrel; b.hitOther = null; }
      }
    }
  }

  private contactSegBody(b: DBody, ax: number, ay: number, az: number, bx: number, by: number, bz: number, r: number, out: Contact): void {
    const bp = b.position;
    if (b.shape === 'sphere') { segSphere(ax, ay, az, bx, by, bz, r, bp.x, bp.y, bp.z, b.radius, out); return; }
    const s = this.boxShape;
    s.cx = bp.x; s.cy = bp.y; s.cz = bp.z; s.hx = b.half!.x; s.hy = b.half!.y; s.hz = b.half!.z;
    segObb(ax, ay, az, bx, by, bz, r, s, out);
  }

  private bodyExtents(b: DBody): void {
    if (b.shape === 'box') { b.ex = b.half!.x; b.ey = b.half!.y; b.ez = b.half!.z; }
    else { b.ex = b.ey = b.ez = b.radius; }
  }

  // ---------------------------------------------------------------------------------------------
  // Dynamic bodies + triggers
  // ---------------------------------------------------------------------------------------------

  step(dt: number): void {
    this.syncStatics(dt);
    const g = this.gravity;
    for (let i = 0; i < this.bodies.length; i++) {
      const b = this.bodies[i];
      b.hitSpeed = 0; b.hitOther = null;
      this.bodyExtents(b);
      if (b.carriedBy !== null) { b.sleeping = false; b.onGround = false; b.groundCol = null; continue; }
      const v = b.velocity, p = b.position;
      if (b.sleeping) {
        if (v.x * v.x + v.y * v.y + v.z * v.z > 1e-8) { b.sleeping = false; b.sleepT = 0; } else continue;
      }
      if (p.y < this.killY - 20) { v.set(0, 0, 0); b.sleeping = true; continue; }
      v.y -= g * b.gravityScale * dt;
      const gc = b.groundCol;
      if (b.onGround && gc && gc.enabled && gc.velocity) { p.x += gc.velocity.x * dt; p.y += gc.velocity.y * dt; p.z += gc.velocity.z * dt; }
      b.onGround = false; b.groundCol = null;
      const sp = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z) * dt;
      const minExt = Math.max(0.05, Math.min(b.ex, b.ey, b.ez));
      const n = clamp(Math.ceil(sp / (minExt * 0.5)), 1, 8);
      const mx = Math.abs(v.x * dt) + b.ex + 0.05, my = Math.abs(v.y * dt) + b.ey + 0.05, mz = Math.abs(v.z * dt) + b.ez + 0.05;
      this.gather(p.x - mx, p.y - my, p.z - mz, p.x + mx, p.y + my, p.z + mz);
      for (let s = 0; s < n; s++) {
        p.x += v.x * dt / n; p.y += v.y * dt / n; p.z += v.z * dt / n;
        this.bodyVsStatics(b, true);
      }
    }
    this.bodiesVsBodies();
    // Settle any penetration introduced by pair resolution.
    for (let i = 0; i < this.bodies.length; i++) {
      const b = this.bodies[i];
      if (b.sleeping || b.carriedBy !== null) continue;
      const p = b.position;
      this.gather(p.x - b.ex - 0.05, p.y - b.ey - 0.05, p.z - b.ez - 0.05, p.x + b.ex + 0.05, p.y + b.ey + 0.05, p.z + b.ez + 0.05);
      this.bodyVsStatics(b, false);
    }
    this.bodiesVsCapsules();
    for (let i = 0; i < this.bodies.length; i++) {
      const b = this.bodies[i];
      if (b.hitSpeed > 1 && b.onHit) b.onHit(b.hitOther, b.hitSpeed);
      if (b.sleeping || b.carriedBy !== null) continue;
      const v = b.velocity;
      const moving = b.groundCol?.velocity && (b.groundCol.velocity.x !== 0 || b.groundCol.velocity.y !== 0 || b.groundCol.velocity.z !== 0);
      if (b.onGround && !moving && v.x * v.x + v.y * v.y + v.z * v.z < 0.02) {
        b.sleepT += dt;
        if (b.sleepT > 0.5) { b.sleeping = true; v.set(0, 0, 0); }
      } else b.sleepT = 0;
    }
    this.updateTriggers();
  }

  private bodyVsStatics(b: DBody, impulses: boolean): void {
    const p = b.position, v = b.velocity, ct = this.ct;
    for (let i = 0; i < this.nc; i++) {
      const col = this.cands[i];
      if (!col.enabled || col.tags.has('water')) continue;
      if (col.maxX < p.x - b.ex || col.minX > p.x + b.ex || col.maxY < p.y - b.ey || col.minY > p.y + b.ey || col.maxZ < p.z - b.ez || col.minZ > p.z + b.ez) continue;
      if (b.shape === 'sphere') {
        this.contactSeg(col, p.x, p.y, p.z, p.x, p.y, p.z, b.radius, ct);
        if (ct.depth <= 0) continue;
      } else {
        const hit = col.kind === 'box' ? aabbObb(p.x, p.y, p.z, b.ex, b.ey, b.ez, col, ct) : aabbCyl(p.x, p.y, p.z, b.ex, b.ey, b.ez, col, ct);
        if (!hit || ct.depth <= 0) continue;
      }
      if (col.tags.has('oneway') && !(ct.ny > 0.7 && v.y <= 0.01)) continue;
      p.x += ct.nx * ct.depth; p.y += ct.ny * ct.depth; p.z += ct.nz * ct.depth;
      if (ct.ny > 0.6) { b.onGround = true; b.groundCol = col; }
      const vn = v.x * ct.nx + v.y * ct.ny + v.z * ct.nz;
      if (vn >= 0) continue;
      const impact = -vn;
      let e = col.tags.has('bouncy') ? Math.max(b.restitution, 0.85) : b.restitution;
      if (impact < 1 || !impulses) e = 0;
      v.x -= ct.nx * vn * (1 + e); v.y -= ct.ny * vn * (1 + e); v.z -= ct.nz * vn * (1 + e);
      // Coulomb friction; spheres roll, so theirs acts as rolling resistance.
      let mu = b.friction * (col.tags.has('slippery') ? 0.08 : 1);
      if (b.shape === 'sphere') mu *= 0.12;
      const jn = impact * (1 + e);
      const vd = v.x * ct.nx + v.y * ct.ny + v.z * ct.nz;
      const tx = v.x - ct.nx * vd, ty = v.y - ct.ny * vd, tz = v.z - ct.nz * vd;
      const tl = Math.sqrt(tx * tx + ty * ty + tz * tz);
      if (tl > 1e-9) {
        const dec = Math.min(tl, mu * jn);
        v.x -= (tx / tl) * dec; v.y -= (ty / tl) * dec; v.z -= (tz / tl) * dec;
      }
      if (impulses && impact > b.hitSpeed) { b.hitSpeed = impact; b.hitOther = col; }
    }
  }

  private bodiesVsBodies(): void {
    const a = this.sap;
    for (let i = 0; i < a.length; i++) this.bodyExtents(a[i]);
    // Insertion sort by min x (nearly sorted frame to frame).
    for (let i = 1; i < a.length; i++) {
      const b = a[i];
      const k = b.position.x - b.ex;
      let j = i - 1;
      while (j >= 0 && a[j].position.x - a[j].ex > k) { a[j + 1] = a[j]; j--; }
      a[j + 1] = b;
    }
    for (let it = 0; it < 2; it++) {
      for (let i = 0; i < a.length; i++) {
        const bi = a[i];
        const maxX = bi.position.x + bi.ex;
        for (let j = i + 1; j < a.length; j++) {
          const bj = a[j];
          if (bj.position.x - bj.ex > maxX) break;
          if (bi.sleeping && bj.sleeping) continue;
          const pi = bi.position, pj = bj.position;
          if (Math.abs(pi.y - pj.y) > bi.ey + bj.ey || Math.abs(pi.z - pj.z) > bi.ez + bj.ez) continue;
          this.resolvePair(bi, bj);
        }
      }
    }
  }

  private pairContact(a: DBody, b: DBody, out: Contact): void {
    const pa = a.position, pb = b.position;
    if (a.shape === 'sphere' && b.shape === 'sphere') { segSphere(pa.x, pa.y, pa.z, pa.x, pa.y, pa.z, a.radius, pb.x, pb.y, pb.z, b.radius, out); return; }
    if (a.shape === 'sphere') { this.contactSegBody(b, pa.x, pa.y, pa.z, pa.x, pa.y, pa.z, a.radius, out); return; }
    if (b.shape === 'sphere') {
      this.contactSegBody(a, pb.x, pb.y, pb.z, pb.x, pb.y, pb.z, b.radius, out);
      out.nx = -out.nx; out.ny = -out.ny; out.nz = -out.nz;
      return;
    }
    const ox = a.ex + b.ex - Math.abs(pa.x - pb.x), oy = a.ey + b.ey - Math.abs(pa.y - pb.y), oz = a.ez + b.ez - Math.abs(pa.z - pb.z);
    out.nx = 0; out.ny = 0; out.nz = 0;
    if (oy <= ox && oy <= oz) { out.depth = oy; out.ny = pa.y >= pb.y ? 1 : -1; }
    else if (ox <= oz) { out.depth = ox; out.nx = pa.x >= pb.x ? 1 : -1; }
    else { out.depth = oz; out.nz = pa.z >= pb.z ? 1 : -1; }
  }

  private resolvePair(a: DBody, b: DBody): void {
    const ct = this.ct;
    this.pairContact(a, b, ct); // normal points from b toward a
    if (ct.depth <= 0) return;
    const va = a.velocity, vb = b.velocity;
    const vrel = (va.x - vb.x) * ct.nx + (va.y - vb.y) * ct.ny + (va.z - vb.z) * ct.nz;
    let wa = a.carriedBy !== null || a.mass <= 0 ? 0 : 1 / a.mass;
    let wb = b.carriedBy !== null || b.mass <= 0 ? 0 : 1 / b.mass;
    // Sleeping props act as immovable unless struck firmly (keeps stacks asleep).
    if (a.sleeping) { if (-vrel > 0.6) { a.sleeping = false; a.sleepT = 0; } else wa = 0; }
    if (b.sleeping) { if (-vrel > 0.6) { b.sleeping = false; b.sleepT = 0; } else wb = 0; }
    // Shock propagation: a supported lower body is immovable for the body resting on it, so stacks hold.
    if (ct.ny < -0.6 && a.onGround) wa = 0;
    else if (ct.ny > 0.6 && b.onGround) wb = 0;
    const w = wa + wb;
    if (w <= 0) return;
    const corr = (Math.max(0, ct.depth - 0.002) * (wa === 0 || wb === 0 ? 1 : 0.8)) / w;
    a.position.x += ct.nx * corr * wa; a.position.y += ct.ny * corr * wa; a.position.z += ct.nz * corr * wa;
    b.position.x -= ct.nx * corr * wb; b.position.y -= ct.ny * corr * wb; b.position.z -= ct.nz * corr * wb;
    if (ct.ny > 0.6) a.onGround = true;
    if (ct.ny < -0.6) b.onGround = true;
    if (vrel >= 0) return;
    const e = -vrel > 1 ? (a.restitution + b.restitution) * 0.5 : 0;
    const j = (-(1 + e) * vrel) / w;
    va.x += ct.nx * j * wa; va.y += ct.ny * j * wa; va.z += ct.nz * j * wa;
    vb.x -= ct.nx * j * wb; vb.y -= ct.ny * j * wb; vb.z -= ct.nz * j * wb;
    // Tangential friction between props.
    const mu = Math.sqrt(Math.max(0, a.friction * b.friction)) * 0.5;
    const rx = va.x - vb.x, ry = va.y - vb.y, rz = va.z - vb.z;
    const rn = rx * ct.nx + ry * ct.ny + rz * ct.nz;
    const tx = rx - ct.nx * rn, ty = ry - ct.ny * rn, tz = rz - ct.nz * rn;
    const tl = Math.sqrt(tx * tx + ty * ty + tz * tz);
    if (tl > 1e-9) {
      const dv = Math.min(tl, mu * j * w) / w;
      va.x -= (tx / tl) * dv * wa; va.y -= (ty / tl) * dv * wa; va.z -= (tz / tl) * dv * wa;
      vb.x += (tx / tl) * dv * wb; vb.y += (ty / tl) * dv * wb; vb.z += (tz / tl) * dv * wb;
    }
    if (-vrel > a.hitSpeed) { a.hitSpeed = -vrel; a.hitOther = b; }
    if (-vrel > b.hitSpeed) { b.hitSpeed = -vrel; b.hitOther = a; }
  }

  /** Props bump into characters that stand still (moveCapsule handles characters walking into props). */
  private bodiesVsCapsules(): void {
    const ct = this.ct;
    for (let k = 0; k < this.capsuleList.length; k++) {
      const c = this.capsuleList[k];
      const p = c.position, r = c.radius, h = Math.max(c.height, 2 * r + 0.01);
      const mc = c.mass ?? this.capsuleMass;
      for (let i = 0; i < this.bodies.length; i++) {
        const b = this.bodies[i];
        if (b.sleeping || b.carriedBy !== null) continue;
        const bp = b.position;
        if (bp.x + b.ex < p.x - r || bp.x - b.ex > p.x + r || bp.z + b.ez < p.z - r || bp.z - b.ez > p.z + r || bp.y + b.ey < p.y || bp.y - b.ey > p.y + h) continue;
        this.contactSegBody(b, p.x, p.y + r, p.z, p.x, p.y + h - r, p.z, r, ct);
        if (ct.depth <= 1e-6) continue;
        // Normal points from the body toward the capsule; push the body the other way.
        bp.x -= ct.nx * ct.depth; bp.y -= ct.ny * ct.depth; bp.z -= ct.nz * ct.depth;
        if (ct.ny >= this.cosSlope) continue; // character standing on it: no impulse
        const vb = b.velocity, vc = c.velocity;
        const vrel = (vb.x - vc.x) * -ct.nx + (vb.y - vc.y) * -ct.ny + (vb.z - vc.z) * -ct.nz; // >0: separating
        if (vrel >= 0) continue;
        const mb = b.mass > 0 ? b.mass : Infinity;
        const e = -vrel > 1 ? b.restitution : 0;
        const j = (-(1 + e) * vrel) / ((mb === Infinity ? 0 : 1 / mb) + 1 / mc);
        if (mb !== Infinity) { vb.x -= ct.nx * j / mb; vb.y -= ct.ny * j / mb; vb.z -= ct.nz * j / mb; }
        vc.x += ct.nx * j / mc; vc.z += ct.nz * j / mc;
        if (-vrel > b.hitSpeed) { b.hitSpeed = -vrel; b.hitOther = null; }
      }
    }
  }

  private updateTriggers(): void {
    for (let t = 0; t < this.triggers.length; t++) {
      const tr = this.triggers[t];
      if (!tr.enabled) {
        if (tr.inside.size) { for (const id of tr.inside) tr.onExit?.(id); tr.inside.clear(); }
        continue;
      }
      const c = tr.center, hf = tr.half, rad = tr.radius;
      for (let m = 0; m < this.moverIds.length; m++) {
        const id = this.moverIds[m];
        const p = this.moverFns[m]();
        let inside: boolean;
        if (rad !== undefined) {
          const dx = p.x - c.x, dy = p.y - c.y, dz = p.z - c.z;
          inside = dx * dx + dy * dy + dz * dz <= rad * rad;
        } else {
          inside = Math.abs(p.x - c.x) <= hf.x && Math.abs(p.y - c.y) <= hf.y && Math.abs(p.z - c.z) <= hf.z;
        }
        const was = tr.inside.has(id);
        if (inside && !was) { tr.inside.add(id); tr.onEnter?.(id); }
        else if (!inside && was) { tr.inside.delete(id); tr.onExit?.(id); }
      }
    }
  }

  // ---------------------------------------------------------------------------------------------
  // Queries
  // ---------------------------------------------------------------------------------------------

  /**
   * Core ray query. Direction must be unit length. Sets hitT/hitN/hitC/hitB. Ignores shapes that contain
   * the origin. `solidOnly` skips water and bodies (used for LOS and ground probes).
   */
  private rayCore(ox: number, oy: number, oz: number, dx: number, dy: number, dz: number, maxDist: number,
    filter: ((c: StaticCollider | Body) => boolean) | null | undefined, bodies: boolean, solidOnly: boolean): boolean {
    if (maxDist > 1e4) maxDist = 1e4;
    let best = maxDist;
    this.hitC = null; this.hitB = null;
    const stamp = ++this.stamp;
    const sp = this.span;
    for (let i = 0; i < this.loose.length; i++) {
      const c = this.loose[i];
      c.qstamp = stamp;
      if (this.rayTestStatic(c, ox, oy, oz, dx, dy, dz, best, filter, solidOnly)) best = sp.tin;
    }
    const cs = this.cellSize, inv = this.invCell;
    let ix = Math.floor(ox * inv), iy = Math.floor(oy * inv), iz = Math.floor(oz * inv);
    const sx = dx > 0 ? 1 : dx < 0 ? -1 : 0, sy = dy > 0 ? 1 : dy < 0 ? -1 : 0, sz = dz > 0 ? 1 : dz < 0 ? -1 : 0;
    let tmx = sx !== 0 ? ((ix + (sx > 0 ? 1 : 0)) * cs - ox) / dx : Infinity;
    let tmy = sy !== 0 ? ((iy + (sy > 0 ? 1 : 0)) * cs - oy) / dy : Infinity;
    let tmz = sz !== 0 ? ((iz + (sz > 0 ? 1 : 0)) * cs - oz) / dz : Infinity;
    const tdx = sx !== 0 ? cs / Math.abs(dx) : Infinity, tdy = sy !== 0 ? cs / Math.abs(dy) : Infinity, tdz = sz !== 0 ? cs / Math.abs(dz) : Infinity;
    const maxCells = Math.ceil(maxDist * inv) * 3 + 6;
    for (let guard = 0; guard < maxCells; guard++) {
      const list = this.cellMap.get(this.key(ix, iy, iz));
      if (list) {
        for (let i = 0; i < list.length; i++) {
          const c = list[i];
          if (c.qstamp === stamp) continue;
          c.qstamp = stamp;
          if (this.rayTestStatic(c, ox, oy, oz, dx, dy, dz, best, filter, solidOnly)) best = sp.tin;
        }
      }
      const tn = tmx < tmy ? (tmx < tmz ? tmx : tmz) : (tmy < tmz ? tmy : tmz);
      if (tn >= best || tn > maxDist) break;
      if (tmx <= tmy && tmx <= tmz) { ix += sx; tmx += tdx; }
      else if (tmy <= tmz) { iy += sy; tmy += tdy; }
      else { iz += sz; tmz += tdz; }
    }
    if (bodies && !solidOnly) {
      for (let i = 0; i < this.bodies.length; i++) {
        const b = this.bodies[i];
        if (filter && !filter(b)) continue;
        const p = b.position;
        const ok = b.shape === 'sphere'
          ? raySphereSpan(ox, oy, oz, dx, dy, dz, p.x, p.y, p.z, b.radius, sp)
          : rayAabbSpan(ox, oy, oz, dx, dy, dz, p.x, p.y, p.z, b.half!.x, b.half!.y, b.half!.z, sp);
        if (ok && sp.tin >= 0 && sp.tin < best) {
          best = sp.tin; this.hitC = null; this.hitB = b;
          this.hitNx = sp.nx; this.hitNy = sp.ny; this.hitNz = sp.nz;
        }
      }
    }
    this.hitT = best;
    return this.hitC !== null || this.hitB !== null;
  }

  private rayTestStatic(c: SCollider, ox: number, oy: number, oz: number, dx: number, dy: number, dz: number, best: number,
    filter: ((c: StaticCollider | Body) => boolean) | null | undefined, solidOnly: boolean): boolean {
    if (!c.enabled) return false;
    if (solidOnly && c.tags.has('water')) return false;
    if (filter && !filter(c)) return false;
    if (this.refreshShape(c) && c.hashed) c.dirty = true;
    const sp = this.span;
    const ok = c.kind === 'box' ? rayObbSpan(ox, oy, oz, dx, dy, dz, c, sp) : rayCylSpan(ox, oy, oz, dx, dy, dz, c, sp);
    if (!ok || sp.tin < 0 || sp.tin >= best) return false;
    this.hitC = c; this.hitB = null;
    this.hitNx = sp.nx; this.hitNy = sp.ny; this.hitNz = sp.nz;
    return true;
  }

  raycast(origin: THREE.Vector3, dir: THREE.Vector3, maxDist: number, filter?: (c: StaticCollider | Body) => boolean): RayHit | null {
    const s = this.rayScratch;
    if (!this.raycastInto(origin, dir, maxDist, s, filter)) return null;
    return { point: s.point.clone(), normal: s.normal.clone(), distance: s.distance, collider: s.collider, body: s.body };
  }

  /** Allocation-free raycast: fills `out` and returns true on a hit. */
  raycastInto(origin: THREE.Vector3, dir: THREE.Vector3, maxDist: number, out: RayHit, filter?: (c: StaticCollider | Body) => boolean): boolean {
    const l = Math.sqrt(dir.x * dir.x + dir.y * dir.y + dir.z * dir.z);
    if (l < 1e-12 || !(maxDist > 0)) return false;
    const dx = dir.x / l, dy = dir.y / l, dz = dir.z / l;
    if (!this.rayCore(origin.x, origin.y, origin.z, dx, dy, dz, maxDist, filter, true, false)) return false;
    out.distance = this.hitT;
    out.point.set(origin.x + dx * this.hitT, origin.y + dy * this.hitT, origin.z + dz * this.hitT);
    out.normal.set(this.hitNx, this.hitNy, this.hitNz);
    out.collider = this.hitC; out.body = this.hitB;
    return true;
  }

  overlapSphere(center: THREE.Vector3, radius: number): (StaticCollider | Body)[] {
    const out: (StaticCollider | Body)[] = [];
    this.overlapSphereInto(center, radius, out);
    return out;
  }

  /** Allocation-free variant: clears and fills `out`, returns its length. */
  overlapSphereInto(center: THREE.Vector3, radius: number, out: (StaticCollider | Body)[]): number {
    out.length = 0;
    const x = center.x, y = center.y, z = center.z, ct = this.ct2;
    this.gather(x - radius, y - radius, z - radius, x + radius, y + radius, z + radius);
    for (let i = 0; i < this.nc; i++) {
      const c = this.cands[i];
      this.contactSeg(c, x, y, z, x, y, z, radius, ct);
      if (ct.depth > 0) out.push(c);
    }
    for (let i = 0; i < this.bodies.length; i++) {
      const b = this.bodies[i];
      this.contactSegBody(b, x, y, z, x, y, z, radius, ct);
      if (ct.depth > 0) out.push(b);
    }
    return out.length;
  }

  /** Push a sphere out of solid statics (used by ropes). Returns true if it moved. */
  pushOutSphere(p: THREE.Vector3, radius: number): boolean {
    const ct = this.ct2;
    this.gather(p.x - radius, p.y - radius, p.z - radius, p.x + radius, p.y + radius, p.z + radius);
    let moved = false;
    for (let i = 0; i < this.nc; i++) {
      const c = this.cands[i];
      if (c.tags.has('water')) continue;
      this.contactSeg(c, p.x, p.y, p.z, p.x, p.y, p.z, radius, ct);
      if (ct.depth <= 0) continue;
      p.x += ct.nx * ct.depth; p.y += ct.ny * ct.depth; p.z += ct.nz * ct.depth;
      moved = true;
    }
    return moved;
  }

  visible(a: THREE.Vector3, b: THREE.Vector3): boolean {
    const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z;
    const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (d < 1e-6) return true;
    return !this.rayCore(a.x, a.y, a.z, dx / d, dy / d, dz / d, d - 1e-3, null, false, true);
  }

  // ---------------------------------------------------------------------------------------------
  // Debug
  // ---------------------------------------------------------------------------------------------

  debugDraw(scene: THREE.Scene): void {
    if (!this.dbg || this.dbg.scene !== scene) { this.dbg?.dispose(); this.dbg = new DebugDraw(scene); }
    this.dbg.update(this.statics, this.bodies, this.triggers);
  }

  setDebugVisible(v: boolean): void { if (this.dbg) this.dbg.lines.visible = v; }

  disposeDebug(): void { this.dbg?.dispose(); this.dbg = null; }
}

// ---------------------------------------------------------------------------------------------
// Wireframe overlay
// ---------------------------------------------------------------------------------------------

const TAG_COLORS: [ColliderTag, number][] = [
  ['hazard', 0xff3d6e], ['climbable', 0x8bd450], ['bouncy', 0xff7ad9], ['oneway', 0xf2b134],
  ['water', 0x4fc3f7], ['slippery', 0xbfe9ff],
];
const BOX_EDGES = [0, 1, 1, 3, 3, 2, 2, 0, 4, 5, 5, 7, 7, 6, 6, 4, 0, 4, 1, 5, 2, 6, 3, 7];
const CIRCLE_SEG = 20;

class DebugDraw {
  readonly scene: THREE.Scene;
  readonly lines: THREE.LineSegments;
  private geo = new THREE.BufferGeometry();
  private pos = new Float32Array(0);
  private col = new Float32Array(0);
  private n = 0;
  private color = new THREE.Color();

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    const mat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.85, depthTest: false, toneMapped: false });
    this.lines = new THREE.LineSegments(this.geo, mat);
    this.lines.name = 'physics-debug';
    this.lines.renderOrder = 999;
    this.lines.frustumCulled = false;
    scene.add(this.lines);
  }

  private ensure(verts: number): void {
    if (this.pos.length >= verts * 3) return;
    const cap = Math.max(verts, 1024) * 2;
    this.pos = new Float32Array(cap * 3);
    this.col = new Float32Array(cap * 3);
    this.geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    this.geo.setAttribute('color', new THREE.BufferAttribute(this.col, 3));
  }

  private v(x: number, y: number, z: number): void {
    const i = this.n * 3;
    this.pos[i] = x; this.pos[i + 1] = y; this.pos[i + 2] = z;
    this.col[i] = this.color.r; this.col[i + 1] = this.color.g; this.col[i + 2] = this.color.b;
    this.n++;
  }

  private circle(cx: number, cy: number, cz: number, r: number, axis: 0 | 1 | 2): void {
    for (let i = 0; i < CIRCLE_SEG; i++) {
      const a0 = (i / CIRCLE_SEG) * Math.PI * 2, a1 = ((i + 1) / CIRCLE_SEG) * Math.PI * 2;
      const c0 = Math.cos(a0) * r, s0 = Math.sin(a0) * r, c1 = Math.cos(a1) * r, s1 = Math.sin(a1) * r;
      if (axis === 1) { this.v(cx + c0, cy, cz + s0); this.v(cx + c1, cy, cz + s1); }
      else if (axis === 0) { this.v(cx, cy + c0, cz + s0); this.v(cx, cy + c1, cz + s1); }
      else { this.v(cx + c0, cy + s0, cz); this.v(cx + c1, cy + s1, cz); }
    }
  }

  private box(cx: number, cy: number, cz: number, hx: number, hy: number, hz: number, m: Float64Array | null): void {
    for (let e = 0; e < BOX_EDGES.length; e++) {
      const k = BOX_EDGES[e];
      const lx = k & 1 ? hx : -hx, ly = k & 2 ? hy : -hy, lz = k & 4 ? hz : -hz;
      if (m) this.v(cx + m[0] * lx + m[3] * ly + m[6] * lz, cy + m[1] * lx + m[4] * ly + m[7] * lz, cz + m[2] * lx + m[5] * ly + m[8] * lz);
      else this.v(cx + lx, cy + ly, cz + lz);
    }
  }

  update(statics: readonly SCollider[], bodies: readonly DBody[], triggers: readonly STrigger[]): void {
    let verts = 0;
    for (const c of statics) verts += c.kind === 'box' ? 24 : CIRCLE_SEG * 4 + 8;
    verts += bodies.length * CIRCLE_SEG * 6 + triggers.length * CIRCLE_SEG * 6;
    this.ensure(verts);
    this.n = 0;
    for (const c of statics) {
      let hex = 0x7df9ff;
      for (const [t, h] of TAG_COLORS) if (c.tags.has(t)) { hex = h; break; }
      this.color.setHex(c.enabled ? hex : 0x444a55);
      if (c.kind === 'box') this.box(c.center.x, c.center.y, c.center.z, c.half.x, c.half.y, c.half.z, c.m);
      else {
        const x = c.center.x, y = c.center.y, z = c.center.z, r = c.half.x, hh = c.half.y;
        this.circle(x, y + hh, z, r, 1); this.circle(x, y - hh, z, r, 1);
        for (let i = 0; i < 4; i++) { const a = (i / 4) * Math.PI * 2; this.v(x + Math.cos(a) * r, y - hh, z + Math.sin(a) * r); this.v(x + Math.cos(a) * r, y + hh, z + Math.sin(a) * r); }
      }
    }
    for (const b of bodies) {
      this.color.setHex(b.sleeping ? 0x6b7280 : b.carriedBy ? 0xffd166 : 0xffffff);
      const p = b.position;
      if (b.shape === 'box') this.box(p.x, p.y, p.z, b.half!.x, b.half!.y, b.half!.z, null);
      else { this.circle(p.x, p.y, p.z, b.radius, 0); this.circle(p.x, p.y, p.z, b.radius, 1); this.circle(p.x, p.y, p.z, b.radius, 2); }
    }
    for (const t of triggers) {
      this.color.setHex(t.enabled ? (t.inside.size ? 0xfff1c1 : 0xb388ff) : 0x444a55);
      const c = t.center;
      if (t.radius !== undefined) { this.circle(c.x, c.y, c.z, t.radius, 0); this.circle(c.x, c.y, c.z, t.radius, 1); this.circle(c.x, c.y, c.z, t.radius, 2); }
      else this.box(c.x, c.y, c.z, t.half.x, t.half.y, t.half.z, null);
    }
    const pa = this.geo.getAttribute('position') as THREE.BufferAttribute | undefined;
    const ca = this.geo.getAttribute('color') as THREE.BufferAttribute | undefined;
    if (pa) pa.needsUpdate = true;
    if (ca) ca.needsUpdate = true;
    this.geo.setDrawRange(0, this.n);
  }

  dispose(): void {
    this.scene.remove(this.lines);
    this.geo.dispose();
    (this.lines.material as THREE.Material).dispose();
  }
}
