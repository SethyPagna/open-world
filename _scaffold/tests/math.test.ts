import assert from 'node:assert/strict';
import * as THREE from 'three';
import {
  Spring, SpringVec3, Vec3Pool, angleDelta, angleLerp, approach, cameraRelativeMove, clamp, damp, dampAngle, dampVec3, fbm1,
  hash01, invLerp, lerp, noise1, remap, smoothDamp, smoothDampVec3, smoothstep, wrapAngle,
} from '../src/core/math.ts';

let passed = 0;
function test(name: string, fn: () => void): void {
  try {
    fn();
    passed++;
  } catch (e) {
    console.error(`FAIL ${name}`);
    throw e;
  }
}
const close = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) <= eps, `${a} != ${b} (eps ${eps})`);

test('clamp / lerp / invLerp / remap / smoothstep basics', () => {
  assert.equal(clamp(5, 0, 1), 1);
  assert.equal(clamp(-5, 0, 1), 0);
  assert.equal(lerp(2, 4, 0.5), 3);
  assert.equal(invLerp(2, 4, 3), 0.5);
  assert.equal(invLerp(2, 2, 3), 0);
  assert.equal(remap(5, 0, 10, 100, 200), 150);
  assert.equal(remap(20, 0, 10, 100, 200, true), 200);
  assert.equal(smoothstep(0, 1, -1), 0);
  assert.equal(smoothstep(0, 1, 2), 1);
  assert.equal(smoothstep(0, 1, 0.5), 0.5);
  assert.equal(approach(0, 10, 3), 3);
  assert.equal(approach(9, 10, 3), 10);
});

test('damp is frame-rate independent', () => {
  const lambda = 7.3;
  const run = (fps: number, seconds: number) => {
    let v = 0;
    const dt = 1 / fps;
    for (let i = 0; i < Math.round(seconds * fps); i++) v = damp(v, 10, lambda, dt);
    return v;
  };
  const a = run(30, 1), b = run(60, 1), c = run(144, 1), d = run(240, 1);
  close(a, b, 1e-9);
  close(b, c, 1e-9);
  close(c, d, 1e-9);
  close(a, 10 * (1 - Math.exp(-lambda)), 1e-9);
  // one big step == many small steps
  close(damp(0, 1, 4, 0.5), damp(damp(0, 1, 4, 0.25), 1, 4, 0.25), 1e-12);
});

test('dampVec3 and dampAngle are frame-rate independent too', () => {
  const a = new THREE.Vector3(), b = new THREE.Vector3();
  const tgt = new THREE.Vector3(3, -2, 8);
  for (let i = 0; i < 30; i++) dampVec3(a, tgt, 5, 1 / 30);
  for (let i = 0; i < 120; i++) dampVec3(b, tgt, 5, 1 / 120);
  assert.ok(a.distanceTo(b) < 1e-9);
  let x = 3, y = 3;
  for (let i = 0; i < 30; i++) x = dampAngle(x, -3, 6, 1 / 30);
  for (let i = 0; i < 90; i++) y = dampAngle(y, -3, 6, 1 / 90);
  close(wrapAngle(x), wrapAngle(y), 1e-9);
});

test('angles wrap and interpolate along the short arc', () => {
  close(wrapAngle(Math.PI * 3), -Math.PI, 1e-12);
  close(wrapAngle(-Math.PI * 0.5), -Math.PI * 0.5, 1e-12);
  for (let a = -20; a < 20; a += 0.37) {
    const w = wrapAngle(a);
    assert.ok(w >= -Math.PI && w < Math.PI);
    close(Math.sin(w), Math.sin(a), 1e-9);
  }
  close(angleDelta(3, -3), 2 * Math.PI - 6, 1e-12); // crosses PI, short way
  const mid = angleLerp(3, -3, 0.5);
  close(Math.abs(wrapAngle(mid)), Math.PI, 1e-9);
});

test('smoothDamp converges without overshoot, roughly fps independent', () => {
  const run = (fps: number) => {
    const vel = { v: 0 };
    let x = 0;
    let max = 0;
    for (let i = 0; i < fps * 2; i++) {
      x = smoothDamp(x, 10, vel, 0.3, 1 / fps);
      max = Math.max(max, x);
    }
    return { x, max };
  };
  const a = run(30), b = run(144);
  assert.ok(a.max <= 10 + 1e-9 && b.max <= 10 + 1e-9, 'no overshoot');
  close(a.x, 10, 0.01);
  close(b.x, 10, 0.01);
  // halfway progress at t=0.3s should be similar at different frame rates
  const at = (fps: number) => {
    const vel = { v: 0 };
    let x = 0;
    for (let i = 0; i < Math.round(0.3 * fps); i++) x = smoothDamp(x, 10, vel, 0.3, 1 / fps);
    return x;
  };
  close(at(30), at(240), 0.15);
});

test('smoothDampVec3 moves toward the target and settles', () => {
  const p = new THREE.Vector3(), v = new THREE.Vector3(), t = new THREE.Vector3(5, 1, -4);
  for (let i = 0; i < 240; i++) smoothDampVec3(p, t, v, 0.2, 1 / 120);
  assert.ok(p.distanceTo(t) < 1e-3);
});

test('Spring oscillates (under-damped), settles, and is stable at low fps', () => {
  const s = new Spring(0, 3, 0.3);
  s.target = 1;
  let peak = 0;
  for (let i = 0; i < 60; i++) peak = Math.max(peak, s.update(1 / 60));
  assert.ok(peak > 1.2, `expected overshoot, got ${peak}`);
  for (let i = 0; i < 600; i++) s.update(1 / 60);
  close(s.value, 1, 1e-3);
  const coarse = new Spring(0, 8, 0.2);
  coarse.target = 1;
  for (let i = 0; i < 40; i++) coarse.update(0.1); // 10 fps, stiff spring: must not explode
  assert.ok(Math.abs(coarse.value - 1) < 0.05);
  const a = new Spring(0, 4, 0.4), b = new Spring(0, 4, 0.4);
  a.target = b.target = 1;
  for (let i = 0; i < 30; i++) a.update(1 / 30);
  for (let i = 0; i < 144; i++) b.update(1 / 144);
  close(a.value, b.value, 0.01);
  a.snap(3);
  assert.equal(a.settled, true);
});

test('SpringVec3 reaches its target', () => {
  const s = new SpringVec3(5, 0.5);
  s.target.set(1, 2, 3);
  for (let i = 0; i < 300; i++) s.update(1 / 60);
  assert.ok(s.value.distanceTo(s.target) < 1e-3);
});

test('noise is smooth, bounded and deterministic', () => {
  let prev = noise1(0);
  let maxStep = 0;
  for (let x = 0; x < 50; x += 0.01) {
    const v = noise1(x);
    assert.ok(v >= -1.01 && v <= 1.01, `noise out of range ${v}`);
    maxStep = Math.max(maxStep, Math.abs(v - prev));
    prev = v;
  }
  assert.ok(maxStep < 0.08, `noise jumps ${maxStep}`);
  assert.equal(noise1(3.7, 2), noise1(3.7, 2));
  assert.notEqual(noise1(3.7, 2), noise1(3.7, 3));
  close(noise1(5), 0, 1e-12); // zero at lattice points
  const h = hash01(12345);
  assert.ok(h >= 0 && h < 1);
  assert.ok(Math.abs(fbm1(1.3)) <= 1.01);
});

test('Vec3Pool reuses vectors after reset', () => {
  const pool = new Vec3Pool();
  const a = pool.get(1, 2, 3);
  const b = pool.get();
  assert.notEqual(a, b);
  pool.reset();
  const c = pool.get(4, 5, 6);
  assert.equal(c, a);
  assert.deepEqual(c.toArray(), [4, 5, 6]);
  assert.equal(pool.size, 2);
});

test('cameraRelativeMove matches the rig yaw convention', () => {
  const out = new THREE.Vector3();
  cameraRelativeMove(new THREE.Vector2(0, 1), 0, out); // forward at yaw 0 -> +Z
  assert.ok(out.distanceTo(new THREE.Vector3(0, 0, 1)) < 1e-9);
  cameraRelativeMove(new THREE.Vector2(1, 0), 0, out); // right at yaw 0 -> -X
  assert.ok(out.distanceTo(new THREE.Vector3(-1, 0, 0)) < 1e-9);
  cameraRelativeMove(new THREE.Vector2(0, 1), Math.PI / 2, out); // forward at yaw 90 -> +X
  assert.ok(out.distanceTo(new THREE.Vector3(1, 0, 0)) < 1e-9);
});

console.log(`math: ${passed} tests passed`);
