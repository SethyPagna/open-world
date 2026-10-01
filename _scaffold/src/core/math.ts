/**
 * Small numeric toolkit shared by every module. Pure functions + tiny allocation-free helpers.
 * Everything that takes `dt` is frame-rate independent.
 */
import * as THREE from 'three';

export const TAU = Math.PI * 2;
export const DEG2RAD = Math.PI / 180;
export const RAD2DEG = 180 / Math.PI;
export const EPS = 1e-6;

export function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}
export function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
/** Inverse of lerp: where `v` sits between a and b (0 when a === b). Not clamped. */
export function invLerp(a: number, b: number, v: number): number {
  return a === b ? 0 : (v - a) / (b - a);
}
export function remap(v: number, inMin: number, inMax: number, outMin: number, outMax: number, clampOut = false): number {
  const t = invLerp(inMin, inMax, v);
  return lerp(outMin, outMax, clampOut ? clamp01(t) : t);
}
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01(invLerp(edge0, edge1, x));
  return t * t * (3 - 2 * t);
}
export function smootherstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01(invLerp(edge0, edge1, x));
  return t * t * t * (t * (t * 6 - 15) + 10);
}
/** Move `current` toward `target` by at most `maxDelta`. */
export function approach(current: number, target: number, maxDelta: number): number {
  const d = target - current;
  return Math.abs(d) <= maxDelta ? target : current + Math.sign(d) * maxDelta;
}

// ---------------------------------------------------------------------------------------------
// Frame-rate independent smoothing
// ---------------------------------------------------------------------------------------------
/**
 * Exponential smoothing toward `target`: `lambda` is the decay rate (1/s). Two steps of dt/2 give
 * exactly the same result as one step of dt, so it behaves identically at 30, 60 or 144 fps.
 */
export function damp(current: number, target: number, lambda: number, dt: number): number {
  return lerp(current, target, 1 - Math.exp(-lambda * dt));
}
/** Decay rate for which the remaining distance halves every `halfLife` seconds. */
export function halfLifeToLambda(halfLife: number): number {
  return Math.LN2 / Math.max(halfLife, EPS);
}
export function dampVec3(current: THREE.Vector3, target: THREE.Vector3, lambda: number, dt: number): THREE.Vector3 {
  return current.lerp(target, 1 - Math.exp(-lambda * dt));
}

/** Wrap an angle to [-PI, PI). */
export function wrapAngle(a: number): number {
  const w = ((((a + Math.PI) % TAU) + TAU) % TAU) - Math.PI;
  return w;
}
/** Shortest signed difference from `from` to `to`, in [-PI, PI). */
export function angleDelta(from: number, to: number): number {
  return wrapAngle(to - from);
}
/** Interpolate angles along the shortest arc. */
export function angleLerp(a: number, b: number, t: number): number {
  return a + angleDelta(a, b) * t;
}
export function dampAngle(current: number, target: number, lambda: number, dt: number): number {
  return angleLerp(current, target, 1 - Math.exp(-lambda * dt));
}

/** Mutable velocity holder for `smoothDamp`. */
export interface DampVelocity { v: number }
/**
 * Critically damped spring toward `target` (Game Programming Gems 4, 1.10). `smoothTime` is roughly
 * the time to reach the target. Never overshoots, and is stable for any dt.
 */
export function smoothDamp(current: number, target: number, vel: DampVelocity, smoothTime: number, dt: number, maxSpeed = Infinity): number {
  const st = Math.max(0.0001, smoothTime);
  const omega = 2 / st;
  const x = omega * dt;
  const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  let change = current - target;
  const maxChange = maxSpeed * st;
  change = clamp(change, -maxChange, maxChange);
  const tgt = current - change;
  const temp = (vel.v + omega * change) * dt;
  vel.v = (vel.v - omega * temp) * exp;
  let out = tgt + (change + temp) * exp;
  // Prevent overshoot.
  if ((target - current > 0) === (out > target)) {
    out = target;
    vel.v = dt > 0 ? (out - target) / dt : 0;
  }
  return out;
}
/** Vector version of `smoothDamp`; mutates `current` and `velocity`. No allocations. */
export function smoothDampVec3(current: THREE.Vector3, target: THREE.Vector3, velocity: THREE.Vector3, smoothTime: number, dt: number): THREE.Vector3 {
  const st = Math.max(0.0001, smoothTime);
  const omega = 2 / st;
  const x = omega * dt;
  const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  const cx = current.x - target.x, cy = current.y - target.y, cz = current.z - target.z;
  const tx = (velocity.x + omega * cx) * dt;
  const ty = (velocity.y + omega * cy) * dt;
  const tz = (velocity.z + omega * cz) * dt;
  velocity.set((velocity.x - omega * tx) * exp, (velocity.y - omega * ty) * exp, (velocity.z - omega * tz) * exp);
  current.set(target.x + (cx + tx) * exp, target.y + (cy + ty) * exp, target.z + (cz + tz) * exp);
  return current;
}

// ---------------------------------------------------------------------------------------------
// Springs for secondary motion (squash & stretch, wobble, bob). Under-damped on purpose.
// ---------------------------------------------------------------------------------------------
const SPRING_SUBSTEP = 1 / 240;

/**
 * Damped harmonic oscillator. `frequency` in Hz, `damping` is the damping ratio
 * (1 = critical, < 1 = bouncy). Integrated with fixed sub-steps so the feel does not change with fps.
 */
export class Spring {
  value: number;
  velocity = 0;
  target: number;
  frequency: number;
  damping: number;
  constructor(value = 0, frequency = 4, damping = 0.4) {
    this.value = value;
    this.target = value;
    this.frequency = frequency;
    this.damping = damping;
  }
  update(dt: number): number {
    if (dt <= 0) return this.value;
    const n = Math.min(64, Math.max(1, Math.ceil(dt / SPRING_SUBSTEP)));
    const h = dt / n;
    const w = TAU * this.frequency;
    const k = w * w;
    const c = 2 * this.damping * w;
    for (let i = 0; i < n; i++) {
      this.velocity += (k * (this.target - this.value) - c * this.velocity) * h;
      this.value += this.velocity * h;
    }
    return this.value;
  }
  /** Kick the spring (units per second). */
  impulse(v: number): void {
    this.velocity += v;
  }
  snap(value: number): void {
    this.value = value;
    this.target = value;
    this.velocity = 0;
  }
  get settled(): boolean {
    return Math.abs(this.value - this.target) < 1e-4 && Math.abs(this.velocity) < 1e-3;
  }
}

/** Vector spring; mutates its own `value`. */
export class SpringVec3 {
  readonly value = new THREE.Vector3();
  readonly velocity = new THREE.Vector3();
  readonly target = new THREE.Vector3();
  frequency: number;
  damping: number;
  constructor(frequency = 4, damping = 0.4) {
    this.frequency = frequency;
    this.damping = damping;
  }
  update(dt: number): THREE.Vector3 {
    if (dt <= 0) return this.value;
    const n = Math.min(64, Math.max(1, Math.ceil(dt / SPRING_SUBSTEP)));
    const h = dt / n;
    const w = TAU * this.frequency;
    const k = w * w;
    const c = 2 * this.damping * w;
    const v = this.value, vel = this.velocity, t = this.target;
    for (let i = 0; i < n; i++) {
      vel.x += (k * (t.x - v.x) - c * vel.x) * h;
      vel.y += (k * (t.y - v.y) - c * vel.y) * h;
      vel.z += (k * (t.z - v.z) - c * vel.z) * h;
      v.x += vel.x * h;
      v.y += vel.y * h;
      v.z += vel.z * h;
    }
    return v;
  }
  snap(p: THREE.Vector3): void {
    this.value.copy(p);
    this.target.copy(p);
    this.velocity.set(0, 0, 0);
  }
}

// ---------------------------------------------------------------------------------------------
// Hashing and coherent noise (cosmetic: shake, flicker, wobble). Deterministic, no Math.random.
// ---------------------------------------------------------------------------------------------
/** 32-bit integer avalanche hash (lowbias32). */
export function hashInt(n: number): number {
  let x = n | 0;
  x ^= x >>> 16;
  x = Math.imul(x, 0x7feb352d);
  x ^= x >>> 15;
  x = Math.imul(x, 0x846ca68b);
  x ^= x >>> 16;
  return x >>> 0;
}
/** Hash of an integer (and optional seed) to [0, 1). */
export function hash01(n: number, seed = 0): number {
  return hashInt(n + Math.imul(seed | 0, 0x9e3779b1)) / 4294967296;
}
/** 1D gradient (Perlin) noise, roughly in [-1, 1], smooth, deterministic. */
export function noise1(x: number, seed = 0): number {
  const i0 = Math.floor(x);
  const f = x - i0;
  const g0 = hash01(i0, seed) * 2 - 1;
  const g1 = hash01(i0 + 1, seed) * 2 - 1;
  const u = f * f * f * (f * (f * 6 - 15) + 10);
  return lerp(g0 * f, g1 * (f - 1), u) * 2;
}
/** Fractal 1D noise (octaves of noise1). */
export function fbm1(x: number, octaves = 3, seed = 0): number {
  let sum = 0, amp = 0.5, freq = 1, norm = 0;
  for (let o = 0; o < octaves; o++) {
    sum += noise1(x * freq, seed + o * 17) * amp;
    norm += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return sum / norm;
}

// ---------------------------------------------------------------------------------------------
// Vector helpers and pools (avoid `new Vector3()` in hot loops)
// ---------------------------------------------------------------------------------------------
/**
 * Frame-scoped pool: `get()` hands out reused vectors, `reset()` (once per frame/tick) recycles
 * all of them. Never keep a pooled vector across a reset.
 */
export class Vec3Pool {
  private items: THREE.Vector3[] = [];
  private used = 0;
  get(x = 0, y = 0, z = 0): THREE.Vector3 {
    let v = this.items[this.used];
    if (!v) {
      v = new THREE.Vector3();
      this.items.push(v);
    }
    this.used++;
    return v.set(x, y, z);
  }
  reset(): void {
    this.used = 0;
  }
  get size(): number {
    return this.items.length;
  }
}
export class Vec2Pool {
  private items: THREE.Vector2[] = [];
  private used = 0;
  get(x = 0, y = 0): THREE.Vector2 {
    let v = this.items[this.used];
    if (!v) {
      v = new THREE.Vector2();
      this.items.push(v);
    }
    this.used++;
    return v.set(x, y);
  }
  reset(): void {
    this.used = 0;
  }
}
/** Shared scratch pool for short-lived maths inside one function call. */
export const v3pool = new Vec3Pool();

/** Horizontal (XZ) distance between two points. */
export function distXZ(a: THREE.Vector3, b: THREE.Vector3): number {
  const dx = a.x - b.x, dz = a.z - b.z;
  return Math.sqrt(dx * dx + dz * dz);
}
/** Clamp a vector's length in place. */
export function clampLength(v: THREE.Vector3, max: number): THREE.Vector3 {
  const l2 = v.lengthSq();
  if (l2 > max * max) v.multiplyScalar(max / Math.sqrt(l2));
  return v;
}
/** Yaw (radians) of a direction on the XZ plane; 0 faces +Z, PI/2 faces +X. */
export function yawOf(dx: number, dz: number): number {
  return Math.atan2(dx, dz);
}
/**
 * Camera-relative movement on the XZ plane. With the camera rig's yaw convention (yaw 0 = camera
 * looks toward +Z), `move.y` goes forward and `move.x` goes right on screen. Writes into `out`.
 */
export function cameraRelativeMove(move: THREE.Vector2, yaw: number, out: THREE.Vector3): THREE.Vector3 {
  const s = Math.sin(yaw), c = Math.cos(yaw);
  // forward = (sin, 0, cos), right = (-cos, 0, sin)
  return out.set(s * move.y - c * move.x, 0, c * move.y + s * move.x);
}
