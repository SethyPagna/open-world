/**
 * 3/4 follow camera. Critically damped focus (XZ and Y smoothed separately so jumps do not bob
 * the view), velocity look-ahead, room bounds, trauma-based Perlin shake, FOV punch, temporary
 * attention shifts and awaitable cinematics. No allocations per frame.
 *
 * Yaw convention: yaw 0 = the camera looks toward +Z (it sits on the -Z side of the focus), which
 * matches rooms whose entry door is on the -Z wall. Camera-relative WASD: `cameraRelativeMove()`
 * in math.ts.
 */
import * as THREE from 'three';
import type { Aabb, CameraRig, CameraShot } from './api.ts';
import { ease } from './tween.ts';
import { DEG2RAD, angleDelta, clamp, damp, dampVec3, lerp, noise1, smoothDamp, wrapAngle, type DampVelocity } from './math.ts';

export interface FollowOptions { distance?: number; pitch?: number; yaw?: number; lookAhead?: number; height?: number }

interface CineState {
  shots: CameraShot[];
  i: number;
  t: number;
  fromPos: THREE.Vector3;
  fromTarget: THREE.Vector3;
  fromFov: number;
  resolve: () => void;
}

const ATTN_IN = 0.45;
const ATTN_OUT = 0.6;
const PUNCH_ATTACK = 0.06;

export class FollowCameraRig implements CameraRig {
  readonly camera: THREE.PerspectiveCamera;

  // Framing (the follow() options).
  distance = 11;
  pitch = 52 * DEG2RAD;
  height = 1;
  /** Seconds of target velocity to lead by. */
  lookAhead = 0.35;
  maxLookAhead = 2.5;
  /** Extra user zoom multiplier on distance (e.g. mouse wheel), smoothed. */
  zoom = 1;
  baseFov: number;

  // Feel.
  focusSmooth = 0.16;
  focusSmoothY = 0.32;
  yawSmooth = 0.12;
  zoomSmooth = 0.22;
  /** Accessibility multiplier for shake (Settings slider). */
  shakeScale = 1;
  maxShakeAngle = 0.05;
  maxShakeOffset = 0.2;
  shakeFrequency = 17;

  private target: THREE.Object3D | null = null;
  private readonly focusPt = new THREE.Vector3();
  private readonly goal = new THREE.Vector3();
  private readonly tmp = new THREE.Vector3();
  private readonly lastTargetPos = new THREE.Vector3();
  private hasLast = false;
  private readonly vel = new THREE.Vector3();
  private readonly aheadGoal = new THREE.Vector3();
  private readonly ahead = new THREE.Vector3();
  private readonly fvx: DampVelocity = { v: 0 };
  private readonly fvy: DampVelocity = { v: 0 };
  private readonly fvz: DampVelocity = { v: 0 };
  private _yaw = 0;
  private yawGoal = 0;
  private readonly yawVel: DampVelocity = { v: 0 };
  private curPitch = this.pitch;
  private curDist = 11;
  private readonly distVel: DampVelocity = { v: 0 };
  private bounds: Aabb | null = null;
  private placed = false;
  private recover = 0;

  private trauma = 0;
  private traumaDecay = 1;
  private shakeT = 0;

  private punchAmp = 0;
  private punchT = 0;
  private punchDur = 0;
  private fovCur: number;
  private lastFov = -1;

  private attnActive = false;
  private readonly attnPoint = new THREE.Vector3();
  private attnT = 0;
  private attnHold = 0;
  private attnZoom = 1;
  private attnW = 0;

  private cine: CineState | null = null;
  private readonly lookPoint = new THREE.Vector3();
  private readonly camPos = new THREE.Vector3();

  constructor(camera?: THREE.PerspectiveCamera) {
    this.camera = camera ?? new THREE.PerspectiveCamera(50, 16 / 9, 0.1, 500);
    this.baseFov = this.camera.fov;
    this.fovCur = this.baseFov;
  }

  get yaw(): number {
    return wrapAngle(this._yaw);
  }
  get cinematicActive(): boolean {
    return this.cine !== null;
  }
  /** Current shake trauma 0..1 (for tests/debug). */
  get shakeTrauma(): number {
    return this.trauma;
  }
  /** The smoothed point the camera is framing. */
  getFocus(out: THREE.Vector3): THREE.Vector3 {
    return out.copy(this.lookPoint);
  }

  follow(target: THREE.Object3D | null, opts: FollowOptions = {}): void {
    if (target !== this.target) this.hasLast = false;
    this.target = target;
    if (opts.distance !== undefined) this.distance = opts.distance;
    if (opts.pitch !== undefined) this.pitch = opts.pitch;
    if (opts.lookAhead !== undefined) this.lookAhead = opts.lookAhead;
    if (opts.height !== undefined) this.height = opts.height;
    if (opts.yaw !== undefined) this.setYaw(opts.yaw, !this.placed);
  }

  setBounds(b: Aabb | null): void {
    this.bounds = b ? { min: b.min.clone(), max: b.max.clone() } : null;
  }

  setYaw(yaw: number, instant = false): void {
    this.yawGoal = yaw;
    if (instant) {
      this._yaw = yaw;
      this.yawVel.v = 0;
    }
  }

  orbit(deltaYaw: number): void {
    this.yawGoal += deltaYaw;
  }

  shake(strength: number, seconds = 0.35): void {
    if (!(strength > 0)) return;
    const remaining = this.trauma > 0 ? this.trauma / this.traumaDecay : 0;
    this.trauma = Math.min(1, this.trauma + strength);
    this.traumaDecay = this.trauma / Math.max(0.05, Math.max(remaining, seconds));
  }

  punch(fovDelta: number, seconds = 0.3): void {
    const env = this.punchEnvelope();
    if (Math.abs(fovDelta) < Math.abs(this.punchAmp * env)) return;
    this.punchAmp = fovDelta;
    this.punchT = 0;
    this.punchDur = Math.max(PUNCH_ATTACK + 0.05, seconds);
  }

  focus(point: THREE.Vector3, seconds: number, zoom = 1): void {
    this.focusOn(point, seconds, zoom);
  }

  cinematic(shots: CameraShot[]): Promise<void> {
    this.finishCinematic();
    if (shots.length === 0) return Promise.resolve();
    if (!this.placed) this.snap();
    return new Promise<void>((resolve) => {
      this.cine = {
        shots,
        i: 0,
        t: 0,
        fromPos: this.camPos.clone(),
        fromTarget: this.lookPoint.clone(),
        fromFov: this.fovCur,
        resolve,
      };
    });
  }

  /** End the running cinematic now; the follow view blends back in. */
  skipCinematic(): void {
    this.finishCinematic();
  }

  /** Jump straight to the follow pose (scene enter, respawn). */
  snap(): void {
    this.computeGoal(0);
    this.focusPt.copy(this.goal);
    this.fvx.v = this.fvy.v = this.fvz.v = 0;
    this._yaw = this.yawGoal;
    this.yawVel.v = 0;
    this.curPitch = this.pitch;
    this.curDist = this.distance * this.zoom;
    this.distVel.v = 0;
    this.ahead.set(0, 0, 0);
    this.placed = true;
    this.placeCamera();
  }

  update(dt: number): void {
    const d = dt > 0 ? Math.min(dt, 0.1) : 0;
    this.shakeT += d;
    if (this.cine) this.updateCinematic(d);
    else this.updateFollow(d);
    this.applyFov(d);
    this.applyShake(d);
  }

  // --- internals -------------------------------------------------------------------------------
  private focusOn(point: THREE.Vector3, seconds: number, zoom: number): void {
    const w = this.attnActive ? this.attnW : 0;
    this.attnActive = true;
    this.attnPoint.copy(point);
    this.attnHold = Math.max(0, seconds);
    this.attnZoom = zoom;
    this.attnT = w * ATTN_IN; // continue the ramp from the current weight
  }

  private attentionWeight(dt: number): number {
    if (!this.attnActive) return (this.attnW = 0);
    this.attnT += dt;
    const t = this.attnT;
    let w: number;
    if (t < ATTN_IN) w = ease('inOutSine', t / ATTN_IN);
    else if (t < ATTN_IN + this.attnHold) w = 1;
    else if (t < ATTN_IN + this.attnHold + ATTN_OUT) w = 1 - ease('inOutSine', (t - ATTN_IN - this.attnHold) / ATTN_OUT);
    else {
      this.attnActive = false;
      w = 0;
    }
    return (this.attnW = w);
  }

  private computeGoal(dt: number): void {
    const t = this.tmp;
    if (this.target) {
      this.target.getWorldPosition(t);
      if (this.hasLast && dt > 0) {
        const vx = (t.x - this.lastTargetPos.x) / dt;
        const vy = (t.y - this.lastTargetPos.y) / dt;
        const vz = (t.z - this.lastTargetPos.z) / dt;
        if (vx * vx + vy * vy + vz * vz > 60 * 60) this.vel.set(0, 0, 0); // teleport
        else {
          const k = 1 - Math.exp(-8 * dt);
          this.vel.x += (vx - this.vel.x) * k;
          this.vel.y += (vy - this.vel.y) * k;
          this.vel.z += (vz - this.vel.z) * k;
        }
      } else if (!this.hasLast) {
        this.vel.set(0, 0, 0);
      }
      this.lastTargetPos.copy(t);
      this.hasLast = true;
      this.goal.set(t.x, t.y + this.height, t.z);
    } else if (dt > 0) {
      this.vel.multiplyScalar(Math.exp(-8 * dt));
    }
    this.aheadGoal.set(this.vel.x * this.lookAhead, 0, this.vel.z * this.lookAhead);
    const l = this.aheadGoal.length();
    if (l > this.maxLookAhead) this.aheadGoal.multiplyScalar(this.maxLookAhead / l);
    if (dt > 0) dampVec3(this.ahead, this.aheadGoal, 3, dt);
  }

  private updateFollow(dt: number): void {
    if (!this.placed) {
      this.snap();
      return;
    }
    this.computeGoal(dt);
    const g = this.tmp.copy(this.goal).add(this.ahead);
    const w = this.attentionWeight(dt);
    if (w > 0) g.lerp(this.attnPoint, w);
    if (this.bounds) {
      const b = this.bounds;
      g.set(clamp(g.x, b.min.x, b.max.x), clamp(g.y, b.min.y, b.max.y), clamp(g.z, b.min.z, b.max.z));
    }
    const soft = 1 + this.recover * 2.5;
    this.focusPt.x = smoothDamp(this.focusPt.x, g.x, this.fvx, this.focusSmooth * soft, dt);
    this.focusPt.z = smoothDamp(this.focusPt.z, g.z, this.fvz, this.focusSmooth * soft, dt);
    this.focusPt.y = smoothDamp(this.focusPt.y, g.y, this.fvy, this.focusSmoothY * soft, dt);

    const yawTarget = this._yaw + angleDelta(this._yaw, this.yawGoal);
    this._yaw = smoothDamp(this._yaw, yawTarget, this.yawVel, this.yawSmooth * soft, dt);
    this.curPitch = damp(this.curPitch, this.pitch, 6 / soft, dt);
    const distGoal = this.distance * this.zoom * lerp(1, this.attnZoom, w);
    this.curDist = smoothDamp(this.curDist, distGoal, this.distVel, this.zoomSmooth * soft, dt);
    this.recover = Math.max(0, this.recover - dt);
    this.placeCamera();
  }

  private placeCamera(): void {
    const h = Math.cos(this.curPitch) * this.curDist;
    const y = Math.sin(this.curPitch) * this.curDist;
    this.camPos.set(this.focusPt.x - Math.sin(this._yaw) * h, this.focusPt.y + y, this.focusPt.z - Math.cos(this._yaw) * h);
    this.lookPoint.copy(this.focusPt);
    this.camera.position.copy(this.camPos);
    this.camera.lookAt(this.lookPoint);
  }

  private updateCinematic(dt: number): void {
    const c = this.cine;
    if (!c) return;
    c.t += dt;
    let shot = c.shots[c.i];
    while (c.t >= shot.duration + (shot.hold ?? 0)) {
      c.t -= shot.duration + (shot.hold ?? 0);
      c.fromPos.copy(shot.position);
      c.fromTarget.copy(shot.target);
      c.fromFov = shot.fov ?? c.fromFov;
      c.i++;
      if (c.i >= c.shots.length) {
        this.camPos.copy(shot.position);
        this.lookPoint.copy(shot.target);
        this.fovCur = c.fromFov;
        this.finishCinematic();
        return;
      }
      shot = c.shots[c.i];
    }
    const k = shot.duration > 0 ? ease(shot.ease ?? 'inOutCubic', c.t / shot.duration) : 1;
    this.camPos.lerpVectors(c.fromPos, shot.position, k);
    this.lookPoint.lerpVectors(c.fromTarget, shot.target, k);
    this.fovCur = lerp(c.fromFov, shot.fov ?? c.fromFov, k);
    this.camera.position.copy(this.camPos);
    this.camera.lookAt(this.lookPoint);
  }

  private finishCinematic(): void {
    const c = this.cine;
    if (!c) return;
    this.cine = null;
    // Hand back to the follow view from exactly where the cinematic left the camera.
    this.focusPt.copy(this.lookPoint);
    this.fvx.v = this.fvy.v = this.fvz.v = 0;
    const ox = this.camPos.x - this.lookPoint.x;
    const oy = this.camPos.y - this.lookPoint.y;
    const oz = this.camPos.z - this.lookPoint.z;
    const dist = Math.hypot(ox, oy, oz);
    if (dist > 1e-4) {
      this.curDist = dist;
      this.curPitch = Math.asin(clamp(oy / dist, -1, 1));
      const yaw = Math.atan2(-ox, -oz);
      this._yaw = this.yawGoal + angleDelta(this.yawGoal, yaw);
    }
    this.distVel.v = 0;
    this.yawVel.v = 0;
    this.recover = 1;
    this.placed = true;
    c.resolve();
  }

  private punchEnvelope(): number {
    if (this.punchDur <= 0 || this.punchT >= this.punchDur) return 0;
    const t = this.punchT;
    if (t < PUNCH_ATTACK) return ease('outQuad', t / PUNCH_ATTACK);
    return 1 - ease('outCubic', (t - PUNCH_ATTACK) / (this.punchDur - PUNCH_ATTACK));
  }

  private applyFov(dt: number): void {
    if (!this.cine) this.fovCur = damp(this.fovCur, this.baseFov, 5, dt);
    this.punchT += dt;
    const fov = this.fovCur + this.punchAmp * this.punchEnvelope();
    if (Math.abs(fov - this.lastFov) > 1e-4) {
      this.camera.fov = fov;
      this.camera.updateProjectionMatrix();
      this.lastFov = fov;
    }
  }

  private applyShake(dt: number): void {
    if (this.trauma > 0) this.trauma = Math.max(0, this.trauma - this.traumaDecay * dt);
    const s = this.trauma * this.trauma * this.shakeScale;
    if (s <= 0) return;
    const f = this.shakeT * this.shakeFrequency;
    const cam = this.camera;
    cam.rotateY(this.maxShakeAngle * s * noise1(f, 11));
    cam.rotateX(this.maxShakeAngle * s * noise1(f, 23));
    cam.rotateZ(this.maxShakeAngle * 0.6 * s * noise1(f * 0.8, 37));
    cam.translateX(this.maxShakeOffset * s * noise1(f, 41));
    cam.translateY(this.maxShakeOffset * s * noise1(f, 53));
  }
}
