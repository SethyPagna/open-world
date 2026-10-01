import assert from 'node:assert/strict';
import * as THREE from 'three';
import type { Body, StaticCollider } from '../src/core/api.ts';
import { Physics, createCapsule } from '../src/world/physics.ts';
import type { CapsuleExt } from '../src/world/physics.ts';

const DT = 1 / 60;
const v3 = (x: number, y: number, z: number): THREE.Vector3 => new THREE.Vector3(x, y, z);
const tests: [string, () => void][] = [];
const test = (name: string, fn: () => void): void => { tests.push([name, fn]); };
const near = (a: number, b: number, eps: number, msg?: string): void =>
  assert.ok(Math.abs(a - b) <= eps, `${msg ?? ''} expected ${b} ± ${eps}, got ${a}`);

function world(): Physics {
  const p = new Physics();
  p.addBox(v3(0, -0.5, 0), v3(30, 0.5, 30)); // floor top at y = 0
  return p;
}

/** Run `ticks` fixed steps. `drive` sets horizontal velocity like a controller would. */
function run(p: Physics, c: CapsuleExt, ticks: number, drive?: (c: CapsuleExt, i: number) => void, each?: (i: number) => void): void {
  for (let i = 0; i < ticks; i++) {
    drive?.(c, i);
    p.moveCapsule(c, DT, 'p1');
    p.step(DT);
    each?.(i);
  }
}
const walk = (vx: number, vz: number) => (c: CapsuleExt): void => { c.velocity.x = vx; c.velocity.z = vz; };

/** Ramp whose top surface starts at ground level at x0 and rises toward +x with the given angle. */
function addRamp(p: Physics, x0: number, horiz: number, deg: number, width = 4, tags?: StaticCollider['tags'] extends Set<infer T> ? T[] : never): StaticCollider {
  const th = (deg * Math.PI) / 180, hy = 0.2;
  const hz = horiz / Math.cos(th) / 2;
  const mx = x0 + horiz / 2, my = (horiz * Math.tan(th)) / 2;
  // With rotY = -90 deg, local +Z points to world -X, so a positive tilt raises the surface toward +X.
  return p.addBox(v3(mx + Math.sin(th) * hy, my - Math.cos(th) * hy, 0), v3(width / 2, hy, hz), { rotY: -Math.PI / 2, tilt: th, tags });
}

// ---------------------------------------------------------------------------------------------
test('capsule lands on ground and reports landing speed', () => {
  const p = world();
  const c = createCapsule(v3(0, 3, 0));
  let landing = 0, landedAt = -1;
  run(p, c, 90, undefined, (i) => { if (c.landingSpeed! > 0 && landedAt < 0) { landing = c.landingSpeed!; landedAt = i; } });
  assert.ok(c.onGround, 'grounded');
  near(c.position.y, 0, 0.01, 'feet on floor');
  assert.equal(c.velocity.y, 0);
  near(landing, Math.sqrt(2 * 24 * 3), 1.0, 'landing speed ~ sqrt(2gh)');
  assert.ok(c.groundCollider !== null);
  near(c.groundNormal.y, 1, 1e-6);
});

test('wall slide keeps tangential speed and reports the wall', () => {
  const p = world();
  const wall = p.addBox(v3(2.5, 1.5, 0), v3(0.5, 1.5, 20));
  const c = createCapsule(v3(1.0, 0, -5));
  run(p, c, 5);
  const z0 = c.position.z;
  run(p, c, 60, walk(3, 4));
  near(c.position.x, 2 - 0.4, 0.01, 'held off the wall by radius');
  near(c.position.z - z0, 4 * 1.0, 0.1, 'full tangential speed');
  assert.equal(c.touchingWall, wall);
  near(c.wallNormal.x, -1, 1e-6);
  near(c.velocity.z, 4, 1e-6);
  assert.ok(Math.abs(c.velocity.x) < 1e-6, 'into-wall velocity removed');
  // Resting against the wall without pushing still reports it (skin).
  run(p, c, 2, walk(0, 0));
  assert.equal(c.touchingWall, wall);
});

test('climbable wall is reported with its tag', () => {
  const p = world();
  p.addBox(v3(0, 2, 2.5), v3(2, 2, 0.5), { tags: ['solid', 'climbable'] });
  const c = createCapsule(v3(0, 0, 0));
  run(p, c, 40, walk(0, 3));
  assert.ok(c.touchingWall?.tags.has('climbable'));
  near(c.wallNormal.z, -1, 1e-6);
});

test('step-up climbs 0.3 m but not 0.5 m', () => {
  for (const [hgt, climbs] of [[0.3, true], [0.35, true], [0.5, false]] as const) {
    const p = world();
    p.addBox(v3(3, hgt / 2, 0), v3(1.5, hgt / 2, 3));
    const c = createCapsule(v3(0, 0, 0));
    run(p, c, 5);
    let stepped = 0;
    run(p, c, 45, walk(4, 0), () => { stepped += c.steppedUp ?? 0; });
    if (climbs) {
      near(c.position.y, hgt, 0.01, `on top of ${hgt} step`);
      assert.ok(c.position.x > 2.5, `advanced over ${hgt} step`);
      assert.ok(c.onGround);
      assert.ok(stepped > 0.05 && stepped <= hgt + 1e-6, `steppedUp reported (${stepped})`);
    } else {
      near(c.position.y, 0, 0.01, `stays below ${hgt} block`);
      near(c.position.x, 1.5 - 0.4, 0.02, `blocked by ${hgt} block`);
    }
  }
});

test('stairs: climbs a flight of 0.25 m steps and snaps down on the way back', () => {
  const p = world();
  for (let i = 0; i < 6; i++) p.addBox(v3(2 + i * 0.5 + 0.25, (i + 1) * 0.25 / 2, 0), v3(0.25, (i + 1) * 0.25 / 2, 2));
  p.addBox(v3(7, 0.75, 0), v3(2, 0.75, 2)); // landing at 1.5 m
  const c = createCapsule(v3(0, 0, 0));
  run(p, c, 5);
  run(p, c, 100, walk(4, 0));
  near(c.position.y, 1.5, 0.02, 'top of stairs');
  let airborne = 0;
  run(p, c, 150, walk(-4, 0), () => { if (!c.onGround) airborne++; });
  near(c.position.y, 0, 0.02, 'back down');
  assert.ok(airborne <= 2, `ground snapping keeps us grounded on the way down (airborne ticks: ${airborne})`);
});

test('30 deg ramp is walkable, 60 deg ramp slides', () => {
  {
    const p = world();
    addRamp(p, 2, 6, 30);
    const c = createCapsule(v3(0, 0, 0));
    run(p, c, 5);
    let airborne = 0;
    run(p, c, 90, walk(4, 0), () => { if (!c.onGround) airborne++; });
    assert.ok(c.position.y > 1.5, `climbed the 30 deg ramp (y=${c.position.y.toFixed(2)})`);
    near(c.groundNormal.y, Math.cos(Math.PI / 6), 0.01, 'ramp ground normal');
    assert.ok(airborne <= 1, `stays grounded on the ramp (${airborne})`);
    // Standing still on the ramp does not creep downhill.
    const x = c.position.x, y = c.position.y;
    run(p, c, 60, walk(0, 0));
    near(c.position.x, x, 0.01, 'no creep x'); near(c.position.y, y, 0.01, 'no creep y');
    // Walk back down: ground snapping keeps us grounded.
    airborne = 0;
    run(p, c, 60, walk(-4, 0), () => { if (!c.onGround) airborne++; });
    assert.ok(airborne <= 1, `grounded walking down (${airborne})`);
  }
  {
    const p = world();
    addRamp(p, 2, 3, 60);
    const c = createCapsule(v3(0, 0, 0));
    run(p, c, 5);
    run(p, c, 90, walk(4, 0));
    assert.ok(c.position.y < 0.6, `cannot walk up 60 deg (y=${c.position.y.toFixed(2)})`);
    // Dropped onto the steep face: slides down, never grounded on it.
    const d = createCapsule(v3(3.5, 4.5, 0));
    let steep = 0;
    run(p, d, 120, undefined, () => { if (d.onSteep) steep++; });
    assert.ok(steep > 3, 'reported steep contact');
    assert.ok(d.position.x < 2.2, `slid off the bottom (x=${d.position.x.toFixed(2)})`);
    near(d.position.y, 0, 0.02, 'ends on the floor');
  }
});

test('moving platform carries the capsule (horizontal and vertical)', () => {
  const p = world();
  const plat = p.addBox(v3(0, 1, 0), v3(1.5, 0.1, 1.5));
  plat.velocity = v3(2, 0, 0);
  const c = createCapsule(v3(0, 1.1, 0));
  // Owners move platforms before characters each tick.
  const tick = (): void => { plat.center.addScaledVector(plat.velocity!, DT); };
  run(p, c, 10, tick);
  const x0 = c.position.x, px0 = plat.center.x;
  run(p, c, 60, tick);
  near(c.position.x - x0, plat.center.x - px0, 0.02, 'moved with platform');
  assert.ok(c.onGround); assert.equal(c.groundCollider, plat);
  plat.velocity.set(0, 1.5, 0);
  run(p, c, 60, tick);
  near(c.position.y, plat.center.y + 0.1, 0.02, 'rides elevator up');
  assert.ok(c.onGround);
  // Jumping off keeps the platform momentum.
  plat.velocity.set(3, 0, 0);
  run(p, c, 3, tick);
  c.velocity.y = 8;
  p.moveCapsule(c, DT, 'p1');
  near(c.velocity.x, 3, 1e-6, 'inherits platform velocity');
});

test('one-way platform: jump through from below, land from above', () => {
  const p = world();
  p.addBox(v3(0, 2, 0), v3(2, 0.1, 2), { tags: ['oneway'] });
  const c = createCapsule(v3(0, 0, 0));
  run(p, c, 5);
  c.velocity.y = 11;
  let maxY = 0;
  run(p, c, 120, undefined, () => { maxY = Math.max(maxY, c.position.y); });
  assert.ok(maxY > 2.1, 'passed through from below');
  near(c.position.y, 2.1, 0.02, 'landed on top');
  assert.ok(c.onGround);
});

test('kill plane: falling into the void is detected by the caller', () => {
  const p = new Physics();
  p.addBox(v3(0, -0.5, 0), v3(2, 0.5, 2));
  const c = createCapsule(v3(0, 0, 0));
  let fellAt = -1;
  run(p, c, 240, walk(4, 0), (i) => { if (fellAt < 0 && p.isBelowKill(c.position)) fellAt = i; });
  assert.ok(fellAt > 0, 'fell below killY');
  assert.ok(c.position.y < p.killY);
  assert.equal(c.onGround, false);
});

test('raycast hits rotated / tilted boxes and cylinders with correct face, normal, distance', () => {
  const p = new Physics();
  const a = Math.PI / 4;
  const rot = p.addBox(v3(0, 0, 0), v3(1, 1, 1), { rotY: a });
  const n0 = v3(Math.cos(a), 0, -Math.sin(a)); // local +X in world
  let h = p.raycast(n0.clone().multiplyScalar(5), n0.clone().negate(), 20)!;
  assert.ok(h); assert.equal(h.collider, rot);
  near(h.distance, 4, 1e-9); near(h.normal.x, n0.x, 1e-9); near(h.normal.z, n0.z, 1e-9); near(h.point.length(), 1, 1e-9);

  const q = new Physics();
  const tilt = (30 * Math.PI) / 180;
  const tb = q.addBox(v3(10, 2, 0), v3(2, 0.5, 2), { tilt });
  const up = v3(0, Math.cos(tilt), Math.sin(tilt));
  h = q.raycast(v3(10, 2, 0).addScaledVector(up, 6), up.clone().negate(), 20)!;
  assert.equal(h.collider, tb); near(h.distance, 5.5, 1e-9); near(h.normal.dot(up), 1, 1e-9);
  // Straight down onto the tilted top: normal is the face normal, point lies on the plane.
  h = q.raycast(v3(10.3, 10, 0.4), v3(0, -1, 0), 20)!;
  near(h.normal.dot(up), 1, 1e-9);
  near(h.point.clone().sub(v3(10, 2, 0)).dot(up), 0.5, 1e-9, 'point on top plane');
  // Matches THREE's YXZ Euler convention.
  const m = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(tilt, 0.7, 0, 'YXZ'));
  const tb2 = q.addBox(v3(-10, 2, 0), v3(1, 0.5, 1), { rotY: 0.7, tilt });
  const topN = v3(0, 1, 0).applyMatrix4(m);
  h = q.raycast(v3(-10, 2, 0).addScaledVector(topN, 3), topN.clone().negate(), 10)!;
  assert.equal(h.collider, tb2); near(h.distance, 2.5, 1e-9); near(h.normal.dot(topN), 1, 1e-9);

  const r = new Physics();
  const cyl = r.addCylinder(v3(0, 1, 0), 0.5, 1);
  h = r.raycast(v3(5, 1, 0), v3(-1, 0, 0), 20)!;
  assert.equal(h.collider, cyl); near(h.distance, 4.5, 1e-9); near(h.normal.x, 1, 1e-9);
  h = r.raycast(v3(0, 5, 0), v3(0, -1, 0), 20)!;
  near(h.distance, 3, 1e-9); near(h.normal.y, 1, 1e-9);
  h = r.raycast(v3(0.2, 1, 5), v3(0, 0, -1), 20)!;
  const zc = Math.sqrt(0.25 - 0.04);
  near(h.distance, 5 - zc, 1e-9); near(h.normal.x, 0.4, 1e-9); near(h.normal.z, zc / 0.5, 1e-9);
  assert.equal(r.raycast(v3(5, 1, 0), v3(1, 0, 0), 20), null, 'pointing away misses');
  assert.equal(r.raycast(v3(5, 1, 0), v3(-1, 0, 0), 4), null, 'maxDist respected');
  // Rays that start inside a shape ignore it.
  assert.equal(r.raycast(v3(0, 1, 0), v3(1, 0, 0), 20), null);
  // Bodies and filters.
  const ball = r.addBody({ shape: 'sphere', position: v3(0, 1, 3), radius: 0.5 });
  h = r.raycast(v3(0, 1, 10), v3(0, 0, -1), 20)!;
  assert.equal(h.body, ball); near(h.distance, 6.5, 1e-9);
  h = r.raycast(v3(0, 1, 10), v3(0, 0, -1), 20, (x) => x !== ball)!;
  assert.equal(h.collider, cyl);
});

test('raycast through the spatial hash across many cells', () => {
  const p = new Physics();
  const far = p.addBox(v3(0, 0, -150), v3(1, 1, 1));
  for (let i = 0; i < 40; i++) p.addBox(v3(10 + i, 0, -i * 3), v3(0.3, 0.3, 0.3));
  const h = p.raycast(v3(0, 0, 50), v3(0, 0, -1), 500)!;
  assert.equal(h.collider, far); near(h.distance, 199, 1e-9);
  // Diagonal ray, negative coordinates.
  const d = p.addBox(v3(-37, -21, -53), v3(0.5, 0.5, 0.5));
  const dir = v3(-37, -21, -53).normalize();
  const h2 = p.raycast(v3(0, 0, 0), dir, 200)!;
  assert.equal(h2.collider, d);
  // Infinite max distance is clamped, not an endless loop.
  assert.equal(p.raycast(v3(0, 50, 0), v3(0, 1, 0), Infinity), null);
});

test('visible() and overlapSphere()', () => {
  const p = world();
  p.addBox(v3(0, 1, 0), v3(0.2, 1, 3));
  const pool = p.addBox(v3(0, 1, 6), v3(2, 1, 1), { tags: ['water'] });
  assert.equal(p.visible(v3(-3, 1, 0), v3(3, 1, 0)), false, 'wall blocks');
  assert.equal(p.visible(v3(-3, 3, 0), v3(3, 3, 0)), true, 'over the wall');
  assert.equal(p.visible(v3(-3, 1, 6), v3(3, 1, 6)), true, 'water does not block sight');
  const crate = p.addBody({ shape: 'box', position: v3(3, 0.5, 3), half: v3(0.5, 0.5, 0.5) });
  assert.equal(p.visible(v3(3, 0.5, 0), v3(3, 0.5, 6)), true, 'bodies do not block sight');
  const hits = p.overlapSphere(v3(3, 0.5, 3), 0.7);
  assert.ok(hits.includes(crate)); assert.ok(!hits.includes(pool));
  assert.equal(p.overlapSphere(v3(0, 1, 6), 0.3)[0], pool);
});

test('triggers fire enter/exit exactly once (box and sphere), exit on disable', () => {
  const p = new Physics();
  let enter = 0, exit = 0, sEnter = 0, sExit = 0;
  const pos = v3(-5, 0.5, 0);
  const t = p.addTrigger({ center: v3(0, 0.5, 0), half: v3(1, 1, 1), onEnter: (id) => { assert.equal(id, 'bob'); enter++; }, onExit: () => exit++ });
  p.addTrigger({ center: v3(4.5, 0.5, 0), half: v3(0, 0, 0), radius: 1, onEnter: () => sEnter++, onExit: () => sExit++ });
  p.registerMover('bob', () => pos);
  for (let i = 0; i <= 100; i++) { pos.x = -5 + i * 0.1; p.step(DT); }
  assert.equal(enter, 1); assert.equal(exit, 1); assert.equal(sEnter, 1); assert.equal(sExit, 0);
  p.unregisterMover('bob');
  assert.equal(sExit, 1, 'unregistering inside a trigger fires exit');
  p.registerMover('bob', () => pos);
  pos.x = 0; p.step(DT); p.step(DT);
  assert.equal(enter, 2);
  t.enabled = false; p.step(DT);
  assert.equal(exit, 2, 'disable fires exit');
  p.step(DT); assert.equal(exit, 2);
  assert.equal(sEnter, 1);
});

test('dynamic bodies: fall, bounce, rest, sleep; onHit reports impact speed', () => {
  const p = world();
  let impact = 0;
  const ball = p.addBody({ shape: 'sphere', position: v3(0, 5, 0), radius: 0.3, restitution: 0.6, onHit: (_o, s) => { impact = Math.max(impact, s); } });
  const crate = p.addBody({ shape: 'box', position: v3(3, 2, 0), half: v3(0.4, 0.4, 0.4), mass: 20 });
  let bounced = false, prevVy = 0;
  for (let i = 0; i < 400; i++) {
    p.step(DT);
    if (prevVy < -2 && ball.velocity.y > 2) bounced = true;
    prevVy = ball.velocity.y;
  }
  assert.ok(bounced, 'ball bounced');
  near(impact, Math.sqrt(2 * 24 * 4.7), 0.8, 'impact speed');
  near(ball.position.y, 0.3, 0.01, 'ball rests on floor');
  near(crate.position.y, 0.4, 0.01, 'crate rests flat');
  assert.ok(ball.sleeping && crate.sleeping, 'both asleep');
});

test('bodies stack and collide with each other', () => {
  const p = world();
  const a = p.addBody({ shape: 'box', position: v3(0, 0.5, 0), half: v3(0.5, 0.5, 0.5) });
  const b = p.addBody({ shape: 'box', position: v3(0.1, 2, 0), half: v3(0.5, 0.5, 0.5) });
  const s = p.addBody({ shape: 'sphere', position: v3(-0.1, 4, 0.05), radius: 0.4 });
  for (let i = 0; i < 300; i++) p.step(DT);
  near(a.position.y, 0.5, 0.03); near(b.position.y, 1.5, 0.05);
  assert.ok(s.position.y < 0.5 || s.position.y > 2.2, 'sphere either rolled off or rests on top');
  const moving = p.addBody({ shape: 'sphere', position: v3(-5, 0.3, 5), radius: 0.3, velocity: v3(6, 0, 0), restitution: 0.1 });
  const target = p.addBody({ shape: 'sphere', position: v3(-3, 0.3, 5), radius: 0.3 });
  for (let i = 0; i < 30; i++) p.step(DT);
  assert.ok(target.velocity.x > 1 || target.position.x > -2.5, 'momentum transferred');
  assert.ok(moving.position.x < target.position.x);
});

test('capsule shoves props; props nudge characters', () => {
  const p = world();
  const crate = p.addBody({ shape: 'box', position: v3(2, 0.4, 0), half: v3(0.4, 0.4, 0.4), mass: 15 });
  const c = createCapsule(v3(0, 0, 0));
  run(p, c, 5);
  run(p, c, 90, walk(3, 0));
  assert.ok(crate.position.x > 4, `crate pushed (x=${crate.position.x.toFixed(2)})`);
  assert.ok(c.position.x < crate.position.x - 0.4, 'capsule stays behind crate');
  // Heavy props barely move.
  const q = world();
  const anvil = q.addBody({ shape: 'box', position: v3(2, 0.4, 0), half: v3(0.4, 0.4, 0.4), mass: 5000 });
  const d = createCapsule(v3(0, 0, 0));
  run(q, d, 60, walk(3, 0));
  assert.ok(anvil.position.x < 2.1, 'heavy prop resists');
  // A thrown ball knocks a standing character back.
  const r = world();
  const e = createCapsule(v3(0, 0, 0));
  run(r, e, 5);
  r.addBody({ shape: 'sphere', position: v3(-3, 0.8, 0), radius: 0.3, mass: 8, velocity: v3(14, 0, 0) });
  let maxVx = 0;
  run(r, e, 30, undefined, () => { maxVx = Math.max(maxVx, e.velocity.x); });
  assert.ok(maxVx > 0.5, `character nudged (vx=${maxVx.toFixed(2)})`);
  // Standing on a crate counts as ground.
  const s = world();
  const box = s.addBody({ shape: 'box', position: v3(0, 0.5, 0), half: v3(0.5, 0.5, 0.5), mass: 30 });
  const f = createCapsule(v3(0, 2, 0));
  run(s, f, 60);
  assert.ok(f.onGround); assert.equal(f.groundBody, box);
  near(f.position.y, 1, 0.03);
});

test('disabling a static wakes and drops props resting on it (trapdoor)', () => {
  const p = world();
  const door = p.addBox(v3(0, 2, 0), v3(1, 0.1, 1));
  const crate = p.addBody({ shape: 'box', position: v3(0, 2.5, 0), half: v3(0.3, 0.3, 0.3) });
  for (let i = 0; i < 120; i++) p.step(DT);
  assert.ok(crate.sleeping);
  door.enabled = false;
  for (let i = 0; i < 120; i++) p.step(DT);
  near(crate.position.y, 0.3, 0.02, 'fell to the floor');
});

test('determinism: identical input sequences give bit-identical results', () => {
  const sim = (): number[] => {
    const p = world();
    addRamp(p, 4, 4, 25);
    p.addCylinder(v3(-2, 1, 2), 0.6, 1);
    const plat = p.addBox(v3(0, 1.5, -4), v3(1, 0.1, 1));
    plat.velocity = v3(0, 0, 0);
    const bodies: Body[] = [];
    for (let i = 0; i < 12; i++) {
      bodies.push(p.addBody({ shape: i % 2 ? 'sphere' : 'box', position: v3((i % 4) - 1.5, 1 + Math.floor(i / 4) * 1.1, 1.5), radius: 0.35, half: v3(0.35, 0.35, 0.35), restitution: 0.3 }));
    }
    const c = createCapsule(v3(0, 0, -1));
    for (let i = 0; i < 400; i++) {
      plat.velocity!.set(Math.sin(i * 0.05) * 2, 0, 0);
      plat.center.addScaledVector(plat.velocity!, DT);
      c.velocity.x = Math.cos(i * 0.021) * 4; c.velocity.z = Math.sin(i * 0.033) * 4;
      if (i % 50 === 0 && c.onGround) c.velocity.y = 8;
      p.moveCapsule(c, DT, 'p');
      p.step(DT);
    }
    const out = [c.position.x, c.position.y, c.position.z];
    for (const b of bodies) out.push(b.position.x, b.position.y, b.position.z, b.velocity.x, b.velocity.y, b.velocity.z);
    return out;
  };
  const a = sim(), b = sim();
  assert.deepEqual(a, b);
  assert.ok(a.every(Number.isFinite));
});

test('broadphase: 500 statics stay fast', () => {
  const p = new Physics();
  let seed = 1;
  const rnd = (): number => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  p.addBox(v3(0, -0.5, 0), v3(60, 0.5, 60));
  for (let i = 0; i < 499; i++) {
    const x = rnd() * 110 - 55, z = rnd() * 110 - 55;
    if (rnd() < 0.5) p.addBox(v3(x, 1, z), v3(0.3 + rnd(), 1, 0.3 + rnd()), { rotY: rnd() * 3 });
    else p.addCylinder(v3(x, 1, z), 0.3 + rnd() * 0.5, 1);
  }
  const caps = Array.from({ length: 8 }, (_, i) => createCapsule(v3(i * 3 - 12, 0, 0)));
  const o = v3(0, 0, 0), d = v3(0, 0, 0);
  const hit = { point: v3(0, 0, 0), normal: v3(0, 0, 0), distance: 0, collider: null, body: null };
  let hits = 0, best = Infinity;
  // Best of several rounds: the first ones measure JIT warm-up, not steady state.
  for (let round = 0; round < 6; round++) {
    const t0 = performance.now();
    for (let tick = 0; tick < 120; tick++) {
      for (let k = 0; k < caps.length; k++) {
        caps[k].velocity.x = Math.cos(tick * 0.05 + k) * 5; caps[k].velocity.z = Math.sin(tick * 0.05 + k) * 5;
        p.moveCapsule(caps[k], DT, 'c' + k);
      }
      p.step(DT);
      for (let r = 0; r < 50; r++) {
        o.set(rnd() * 100 - 50, 1, rnd() * 100 - 50); d.set(rnd() - 0.5, 0, rnd() - 0.5);
        if (p.raycastInto(o, d, 30, hit)) hits++;
      }
    }
    best = Math.min(best, (performance.now() - t0) / 120);
  }
  console.log(`   500 statics: ${best.toFixed(3)} ms/tick for 8 capsules + 50 rays (hits ${hits})`);
  assert.ok(hits > 0);
  assert.ok(best < 3, `per-tick cost ${best.toFixed(2)} ms (typically ~0.4 ms)`);
});

// ---------------------------------------------------------------------------------------------
let failed = 0;
for (const [name, fn] of tests) {
  try { fn(); console.log(`ok - ${name}`); }
  catch (e) { failed++; console.error(`FAIL - ${name}`); console.error(e); }
}
console.log(`${tests.length - failed}/${tests.length} physics tests passed`);
if (failed) process.exit(1);
