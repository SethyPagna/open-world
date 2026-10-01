import assert from 'node:assert/strict';
import * as THREE from 'three';
import { Physics } from '../src/world/physics.ts';
import { VerletRope } from '../src/world/rope.ts';

const DT = 1 / 60;
const v3 = (x: number, y: number, z: number): THREE.Vector3 => new THREE.Vector3(x, y, z);
const tests: [string, () => void][] = [];
const test = (name: string, fn: () => void): void => { tests.push([name, fn]); };
const near = (a: number, b: number, eps: number, msg?: string): void =>
  assert.ok(Math.abs(a - b) <= eps, `${msg ?? ''} expected ${b} ± ${eps}, got ${a}`);

test('slack rope sags, has no tension and no pull', () => {
  const a = v3(0, 2, 0), b = v3(2, 2, 0);
  const r = new VerletRope({ attachA: () => a, attachB: () => b, length: 4 });
  let res = r.step(DT);
  for (let i = 0; i < 120; i++) res = r.step(DT);
  assert.equal(res.tension, 0);
  assert.equal(res.pullA.lengthSq(), 0); assert.equal(res.pullB.lengthSq(), 0);
  assert.ok(r.points[6].y < 2 - 1, `mid point sags (y=${r.points[6].y.toFixed(2)})`);
  near(r.pathLength, 4, 0.08, 'segments keep their rest length');
  assert.ok(r.points[0].equals(a) && r.points[12].equals(b), 'ends pinned');
});

test('taut rope pulls both ends toward each other; tension grows past 1', () => {
  const a = v3(0, 1, 0), b = v3(4.05, 1, 0);
  const r = new VerletRope({ attachA: () => a, attachB: () => b, length: 4 });
  const res = r.step(DT);
  assert.ok(res.tension > 1, `tension ${res.tension}`);
  assert.ok(res.pullA.x > 0 && res.pullB.x < 0, 'pulls point inward');
  near(res.pullA.length(), res.pullB.length(), 1e-9, 'split evenly');
  near(res.pullA.x, (0.05 * r.pullBias) / DT / 2, 1e-9, 'resting ends: the pull only removes part of the overshoot');
  near(res.pullA.y, 0, 1e-9); near(res.pullA.z, 0, 1e-9);
  // Exactly at rest length: tension 1, no pull.
  b.set(4, 1, 0); r.reset();
  const r2 = r.step(DT);
  near(r2.tension, 1, 1e-6); assert.equal(r2.pullA.lengthSq(), 0);
  // Almost taut: 0 < tension < 1.
  b.set(3.8, 1, 0);
  const r3 = r.step(DT);
  assert.ok(r3.tension > 0 && r3.tension < 1, `partial tension ${r3.tension}`);
});

test('anchored end is never pulled; pull is capped', () => {
  const a = v3(0, 1, 0), b = v3(0, 1, 9);
  const r = new VerletRope({ attachA: () => a, attachB: () => b, length: 4, invMassB: 0, maxPull: 20 });
  const res = r.step(DT);
  assert.equal(res.pullB.lengthSq(), 0);
  near(res.pullA.length(), 20, 1e-9, 'capped');
  assert.ok(res.pullA.z > 0);
});

test('applying the pull keeps a runner on a leash (no slingshot)', () => {
  const post = v3(0, 1, 0), runner = v3(0, 1, 0);
  const vel = v3(0, 0, 0);
  const r = new VerletRope({ attachA: () => runner, attachB: () => post, length: 3, invMassB: 0, maxPull: 14 });
  let maxDist = 0, minAfter = Infinity, reached = false, maxSpeed = 0;
  for (let i = 0; i < 300; i++) {
    // A platformer controller: accelerates toward 5.2 m/s outward and keeps whatever the rope adds.
    vel.x += Math.max(-34 * DT, Math.min(34 * DT, 5.2 - vel.x));
    runner.addScaledVector(vel, DT);
    const res = r.step(DT);
    vel.add(res.pullA);
    const dist = runner.distanceTo(post);
    maxDist = Math.max(maxDist, dist);
    if (dist > 2.95) reached = true;
    if (reached) minAfter = Math.min(minAfter, dist);
    maxSpeed = Math.max(maxSpeed, vel.length());
  }
  assert.ok(reached, 'reaches the end of the leash');
  assert.ok(maxDist < 3 * 1.03, `barely stretches (max ${maxDist.toFixed(3)})`);
  assert.ok(minAfter > 2.8, `is not flung back toward the post (min ${minAfter.toFixed(3)})`);
  assert.ok(maxSpeed < 5.3, `the rope never adds speed (max ${maxSpeed.toFixed(2)} m/s)`);
});

test('a pendulum on the rope swings without gaining energy', () => {
  const post = v3(0, 5, 0), bob = v3(3, 5, 0);
  const vel = v3(0, 0, 0);
  const r = new VerletRope({ attachA: () => bob, attachB: () => post, length: 3, invMassB: 0 });
  let maxDist = 0, maxYAfterStart = -Infinity;
  for (let i = 0; i < 600; i++) {
    vel.y -= 24 * DT;
    bob.addScaledVector(vel, DT);
    vel.add(r.step(DT).pullA);
    maxDist = Math.max(maxDist, bob.distanceTo(post));
    if (i > 30) maxYAfterStart = Math.max(maxYAfterStart, bob.y);
  }
  assert.ok(maxDist < 3 * 1.04, `holds the bob (max ${maxDist.toFixed(3)})`);
  assert.ok(maxYAfterStart < 5 + 0.05, `never swings above its release height (${maxYAfterStart.toFixed(3)})`);
  assert.ok(maxYAfterStart > 5 - 1.5, `keeps swinging (${maxYAfterStart.toFixed(3)})`);
});

test('cut: no pull, no tension, halves fall apart', () => {
  const a = v3(0, 3, 0), b = v3(3, 3, 0);
  const r = new VerletRope({ attachA: () => a, attachB: () => b, length: 3.2 });
  for (let i = 0; i < 30; i++) r.step(DT);
  assert.equal(r.isCut, false);
  r.cut();
  assert.equal(r.isCut, true); assert.equal(r.cutIndex, 6);
  b.set(8, 3, 0);
  let res = r.step(DT);
  for (let i = 0; i < 120; i++) res = r.step(DT);
  assert.equal(res.tension, 0); assert.equal(res.pullA.lengthSq(), 0); assert.equal(res.pullB.lengthSq(), 0);
  assert.ok(r.points[6].distanceTo(r.points[7]) > 1, 'gap at the cut');
  near(r.points[6].distanceTo(a), 1.6, 0.1, 'left half hangs from A');
  assert.ok(r.points[6].y < a.y - 1.4, 'left half hangs down');
});

test('rope points collide with statics', () => {
  const p = new Physics();
  const box = p.addBox(v3(0, 0.5, 0), v3(0.5, 0.5, 1));
  // Starts above the box (initial sag bottoms out at y ~ 1.3) and drapes onto it.
  const a = v3(-1.5, 2.6, 0), b = v3(1.5, 2.6, 0);
  const r = new VerletRope({ attachA: () => a, attachB: () => b, length: 4.5, physics: p, radius: 0.05 });
  assert.ok(Math.min(...r.points.map((q) => q.y)) > 1.1);
  for (let i = 0; i < 180; i++) { r.step(DT); p.step(DT); }
  for (const pt of r.points) {
    const inside = Math.abs(pt.x - box.center.x) < 0.5 && Math.abs(pt.y - box.center.y) < 0.5 && Math.abs(pt.z) < 1;
    assert.ok(!inside, `point ${pt.toArray().map((x) => x.toFixed(2))} inside the box`);
  }
  assert.ok(r.points.some((pt) => Math.abs(pt.x) < 0.5 && Math.abs(pt.y - 1.05) < 0.03), 'rope drapes over the top');
});

test('reset lays a long slack leash on the ground (not through it); it reads no tension', () => {
  const p = new Physics();
  p.addBox(v3(0, -0.5, 0), v3(12, 0.5, 12)); // 1 m thick floor slab
  const a = v3(0, 0.55, 6), b = v3(1.5, 1.45, 0.2); // critter waist -> post top, 6 m apart
  const r = new VerletRope({ attachA: () => a, attachB: () => b, length: 12, segments: 16, physics: p, invMassB: 0, radius: 0.05 });
  for (const q of r.points) assert.ok(q.y >= 0.05 - 1e-6, `laid above the floor (y=${q.y.toFixed(3)})`);
  let res = r.step(DT);
  for (let i = 0; i < 240; i++) res = r.step(DT);
  for (const q of r.points) assert.ok(q.y > -0.01, `stays on the floor (y=${q.y.toFixed(3)})`);
  assert.equal(res.tension, 0, `slack (path ${r.pathLength.toFixed(2)})`);
  assert.equal(res.pullA.lengthSq(), 0);
  r.cut(); r.mend();
  assert.ok(!r.isCut, 'mend re-joins a cut rope');
});

test('rope wrapped around a post is taut before the ends are length apart', () => {
  const p = new Physics();
  p.gravity = 0; // top-down tether: isolate wrapping from sag
  p.addCylinder(v3(0, 1, 0), 0.5, 1.5);
  const a = v3(-1, 1, 0.6), b = v3(-1, 1, -0.6);
  const r = new VerletRope({ attachA: () => a, attachB: () => b, length: 3, physics: p, segments: 16, radius: 0.04 });
  // Lay the rope around the far side of the post: A -> (0, .56) -> arc through +x -> (0, -.56) -> B.
  const path: THREE.Vector3[] = [a.clone(), v3(0, 1, 0.56)];
  for (let k = 1; k < 12; k++) { const t = Math.PI / 2 - (k / 12) * Math.PI; path.push(v3(Math.cos(t) * 0.56, 1, Math.sin(t) * 0.56)); }
  path.push(v3(0, 1, -0.56), b.clone());
  const lens = [0];
  for (let i = 1; i < path.length; i++) lens.push(lens[i - 1] + path[i].distanceTo(path[i - 1]));
  for (let i = 0; i <= 16; i++) {
    const s = (i / 16) * lens[lens.length - 1];
    let k = 1; while (k < lens.length - 1 && lens[k] < s) k++;
    r.points[i].lerpVectors(path[k - 1], path[k], (s - lens[k - 1]) / (lens[k] - lens[k - 1]));
  }
  let res = r.step(DT);
  for (let i = 0; i < 20; i++) res = r.step(DT);
  const straight = a.distanceTo(b);
  assert.ok(r.pathLength > 2.5 * straight, `rope follows the post (${r.pathLength.toFixed(2)})`);
  assert.ok(res.tension > 1, `taut via wrap (tension ${res.tension.toFixed(2)}, straight ${straight.toFixed(2)} < length 3)`);
  assert.ok(res.pullA.x > 0.5 * res.pullA.length(), `pull drags A toward the post (${res.pullA.toArray().map((x) => x.toFixed(2))})`);
  for (const q of r.points) assert.ok(Math.hypot(q.x, q.z) > 0.5 - 1e-6, `point inside the post: ${q.toArray().map((x) => x.toFixed(3))} r=${Math.hypot(q.x, q.z).toFixed(3)}`);
});

test('determinism', () => {
  const sim = (): number[] => {
    const p = new Physics();
    p.addBox(v3(0, -0.5, 0), v3(10, 0.5, 10));
    const a = v3(0, 1, 0), b = v3(1, 1, 0);
    const r = new VerletRope({ attachA: () => a, attachB: () => b, length: 3, physics: p });
    const out: number[] = [];
    for (let i = 0; i < 200; i++) {
      b.set(Math.cos(i * 0.05) * 3, 1 + Math.sin(i * 0.11), Math.sin(i * 0.05) * 3);
      const res = r.step(DT);
      out.push(res.tension, res.pullA.x, res.pullB.z);
    }
    for (const pt of r.points) out.push(pt.x, pt.y, pt.z);
    return out;
  };
  const x = sim(), y = sim();
  assert.deepEqual(x, y);
  assert.ok(x.every(Number.isFinite));
});

let failed = 0;
for (const [name, fn] of tests) {
  try { fn(); console.log(`ok - ${name}`); }
  catch (e) { failed++; console.error(`FAIL - ${name}`); console.error(e); }
}
console.log(`${tests.length - failed}/${tests.length} rope tests passed`);
if (failed) process.exit(1);
