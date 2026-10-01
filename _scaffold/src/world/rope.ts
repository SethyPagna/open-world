/**
 * Verlet rope with pinned ends (tethers, the Fuse Tether, anchored climbing ropes).
 * The rope itself never moves its endpoints: step() returns the velocity deltas the owners should add
 * (after they moved this tick) so the ends stay within `length` of each other. The ends' velocities are
 * estimated from how the anchors moved since the last step; call reset() after teleporting an end.
 * Allocation-free after construction.
 */
import * as THREE from 'three';
import type { Body, PhysicsWorld, Rope, StaticCollider } from '../core/api.ts';

export interface RopeOptions {
  attachA: () => THREE.Vector3;
  attachB: () => THREE.Vector3;
  /** Rest length in metres. */
  length: number;
  segments?: number;
  /** 0..1 fraction of each link's length error corrected per solver iteration. */
  stiffness?: number;
  iterations?: number;
  /** When given (and it can push spheres out, like world/physics.ts), rope points collide with statics. */
  physics?: PhysicsWorld;
  /** Collision radius of the rope points (default 0.06). */
  radius?: number;
  /** Fraction of point velocity kept per step (default 0.985). */
  damping?: number;
  /** How the end pull is shared. 0 = anchored end that is never pulled. Default 1 and 1 (split evenly). */
  invMassA?: number;
  invMassB?: number;
  /** Cap on each step's pull velocity delta in m/s (default 30). */
  maxPull?: number;
  /**
   * Fraction of the length overshoot the pull removes per tick, on top of cancelling the ends' separating
   * speed (default 0.25). Higher is stiffer but rebounds more.
   */
  pullBias?: number;
}

export interface RopeStepResult { pullA: THREE.Vector3; pullB: THREE.Vector3; tension: number }

interface SpherePusher { pushOutSphere(p: THREE.Vector3, radius: number): boolean }

const hasPusher = (p: PhysicsWorld | undefined): p is PhysicsWorld & SpherePusher =>
  !!p && typeof (p as Partial<SpherePusher>).pushOutSphere === 'function';

const DOWN = new THREE.Vector3(0, -1, 0);
const isStatic = (c: StaticCollider | Body): boolean => 'kind' in c;

export class VerletRope implements Rope {
  readonly points: THREE.Vector3[];
  length: number;
  stiffness: number;
  attachA: () => THREE.Vector3;
  attachB: () => THREE.Vector3;
  iterations: number;
  radius: number;
  damping: number;
  invMassA: number;
  invMassB: number;
  maxPull: number;
  pullBias: number;
  /** Rope path length (sum of segment lengths) after the last step. */
  pathLength = 0;
  private readonly n: number;
  private readonly prev: Float64Array;
  private readonly physics: PhysicsWorld | undefined;
  private readonly pusher: SpherePusher | null;
  private cutAt = -1;
  /** Anchor positions at the previous step; the ends' velocities are estimated from them. */
  private readonly lastA = new THREE.Vector3();
  private readonly lastB = new THREE.Vector3();
  private readonly result: RopeStepResult = { pullA: new THREE.Vector3(), pullB: new THREE.Vector3(), tension: 0 };

  constructor(opts: RopeOptions) {
    this.attachA = opts.attachA;
    this.attachB = opts.attachB;
    this.length = opts.length;
    this.n = Math.max(1, Math.floor(opts.segments ?? 12));
    this.stiffness = opts.stiffness ?? 0.9;
    this.iterations = Math.max(1, Math.floor(opts.iterations ?? 8));
    this.physics = opts.physics;
    this.pusher = hasPusher(opts.physics) ? opts.physics : null;
    this.radius = opts.radius ?? 0.06;
    this.damping = opts.damping ?? 0.985;
    this.invMassA = opts.invMassA ?? 1;
    this.invMassB = opts.invMassB ?? 1;
    this.maxPull = opts.maxPull ?? 30;
    this.pullBias = opts.pullBias ?? 0.25;
    this.points = [];
    for (let i = 0; i <= this.n; i++) this.points.push(new THREE.Vector3());
    this.prev = new Float64Array((this.n + 1) * 3);
    this.reset();
  }

  get isCut(): boolean { return this.cutAt >= 0; }
  get segments(): number { return this.n; }
  /** Index i of the removed link (between points i and i+1), or -1. */
  get cutIndex(): number { return this.cutAt; }

  /**
   * Re-lay the rope between its anchors as a gentle sag of the right length, at rest. With a physics world
   * the sag rests on whatever lies under the chord instead of sinking through the floor.
   */
  reset(): void {
    const a = this.attachA(), b = this.attachB();
    this.lastA.copy(a); this.lastB.copy(b);
    const d = a.distanceTo(b);
    const sag = d < this.length ? Math.sqrt((3 * Math.max(d, 1e-3) * (this.length - d)) / 8) : 0;
    for (let i = 0; i <= this.n; i++) {
      const t = i / this.n;
      const p = this.points[i];
      p.lerpVectors(a, b, t);
      let drop = 4 * sag * t * (1 - t);
      if (this.physics && drop > 0) {
        const hit = this.physics.raycast(p, DOWN, drop + this.radius, isStatic);
        if (hit) drop = Math.max(0, hit.distance - this.radius);
      }
      p.y -= drop;
      this.prev[i * 3] = p.x; this.prev[i * 3 + 1] = p.y; this.prev[i * 3 + 2] = p.z;
    }
    this.pathLength = this.measure();
  }

  /** Remove one link (default: the middle). Both halves keep hanging from their anchors. */
  cut(at?: number): void {
    this.cutAt = Math.min(this.n - 1, Math.max(0, Math.floor(at ?? this.n / 2)));
  }

  /** Forget the anchors' motion (after teleporting an end without re-laying the rope). */
  syncAnchors(): void {
    this.lastA.copy(this.attachA()); this.lastB.copy(this.attachB());
  }

  /** Re-join a cut rope (e.g. re-tying a tether). Call reset() to re-lay it between the anchors. */
  mend(): void {
    this.cutAt = -1;
  }

  /** The returned object is reused: copy what you need before the next step. */
  step(dt: number): RopeStepResult {
    const res = this.result;
    res.pullA.set(0, 0, 0); res.pullB.set(0, 0, 0); res.tension = 0;
    const pts = this.points, prev = this.prev, n = this.n;
    const A = this.attachA(), B = this.attachB();
    if (!(dt > 0)) return res;

    const g = (this.physics?.gravity ?? 24) * dt * dt, damp = this.damping;
    for (let i = 1; i < n; i++) {
      const p = pts[i], k = i * 3;
      const vx = (p.x - prev[k]) * damp, vy = (p.y - prev[k + 1]) * damp, vz = (p.z - prev[k + 2]) * damp;
      prev[k] = p.x; prev[k + 1] = p.y; prev[k + 2] = p.z;
      p.x += vx; p.y += vy - g; p.z += vz;
    }
    pts[0].copy(A); pts[n].copy(B);
    prev[0] = A.x; prev[1] = A.y; prev[2] = A.z;
    prev[n * 3] = B.x; prev[n * 3 + 1] = B.y; prev[n * 3 + 2] = B.z;

    const seg = this.length / n, stiff = this.stiffness;
    for (let it = 0; it < this.iterations; it++) {
      for (let i = 0; i < n; i++) {
        if (i === this.cutAt) continue;
        const a = pts[i], b = pts[i + 1];
        const wa = i === 0 ? 0 : 1, wb = i + 1 === n ? 0 : 1;
        if (wa + wb === 0) continue;
        const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z;
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (d < 1e-9) continue;
        const f = ((d - seg) / d) * stiff / (wa + wb);
        a.x += dx * f * wa; a.y += dy * f * wa; a.z += dz * f * wa;
        b.x -= dx * f * wb; b.y -= dy * f * wb; b.z -= dz * f * wb;
      }
      if (this.pusher && (it & 1 || it === this.iterations - 1)) {
        for (let i = 1; i < n; i++) this.pusher.pushOutSphere(pts[i], this.radius);
      }
    }

    this.pathLength = this.measure();
    // Velocities of the ends over the last tick (the owners' motion), then remember this tick's anchors.
    const iv = 1 / dt;
    const vax = (A.x - this.lastA.x) * iv, vay = (A.y - this.lastA.y) * iv, vaz = (A.z - this.lastA.z) * iv;
    const vbx = (B.x - this.lastB.x) * iv, vby = (B.y - this.lastB.y) * iv, vbz = (B.z - this.lastB.z) * iv;
    this.lastA.copy(A); this.lastB.copy(B);
    if (this.cutAt >= 0) return res;

    const L = this.length;
    const dx = B.x - A.x, dy = B.y - A.y, dz = B.z - A.z;
    const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
    // A rope wrapped around an obstacle is taut before its ends are `length` apart.
    const eff = this.pusher && this.pathLength > L * 1.01 ? Math.max(d, this.pathLength) : d;
    res.tension = eff <= 0.9 * L ? 0 : (eff - 0.9 * L) / (0.1 * L);
    const excess = eff - L;
    const wsum = this.invMassA + this.invMassB;
    if (excess <= 0 || wsum <= 0 || d < 1e-9) return res;
    // Pull along the rope's first/last link so wrapped ropes tug around corners.
    const pa = res.pullA, pb = res.pullB;
    this.dirTo(pts[0], pts[1], dx / d, dy / d, dz / d, pa);
    this.dirTo(pts[n], pts[n - 1], -dx / d, -dy / d, -dz / d, pb);
    // Velocity-level constraint: cancel the speed at which the ends separate along the rope, plus a bias that
    // removes part of the overshoot. The owners add the result to their velocity every tick, so a pull that
    // only corrected position would pile up tick after tick and fling them past the anchor.
    const separating = -(vax * pa.x + vay * pa.y + vaz * pa.z) - (vbx * pb.x + vby * pb.y + vbz * pb.z);
    const corr = Math.min(Math.max(0, separating + (excess * this.pullBias) / dt), this.maxPull);
    pa.multiplyScalar((corr * this.invMassA) / wsum);
    pb.multiplyScalar((corr * this.invMassB) / wsum);
    return res;
  }

  private dirTo(from: THREE.Vector3, to: THREE.Vector3, fx: number, fy: number, fz: number, out: THREE.Vector3): void {
    const x = to.x - from.x, y = to.y - from.y, z = to.z - from.z;
    const l = Math.sqrt(x * x + y * y + z * z);
    if (this.pusher && l > 1e-6) out.set(x / l, y / l, z / l);
    else out.set(fx, fy, fz);
  }

  private measure(): number {
    let s = 0;
    const pts = this.points;
    for (let i = 0; i < this.n; i++) if (i !== this.cutAt) s += pts[i].distanceTo(pts[i + 1]);
    return s;
  }
}
