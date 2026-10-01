import assert from 'node:assert/strict';
import * as THREE from 'three';
import { Physics } from '../src/world/physics.ts';
import { Nav } from '../src/world/nav.ts';
import { createRng } from '../src/core/rng.ts';

const v3 = (x: number, y: number, z: number): THREE.Vector3 => new THREE.Vector3(x, y, z);
const tests: [string, () => void][] = [];
const test = (name: string, fn: () => void): void => { tests.push([name, fn]); };
const bounds = (hx: number, hz: number, y0 = -1, y1 = 6) => ({ min: v3(-hx, y0, -hz), max: v3(hx, y1, hz) });
const fmt = (p: THREE.Vector3[] | null): string => (p ? p.map((q) => `(${q.x.toFixed(2)},${q.y.toFixed(2)},${q.z.toFixed(2)})`).join(' ') : 'null');

function room(half = 10): Physics {
  const p = new Physics();
  p.addBox(v3(0, -0.5, 0), v3(half, 0.5, half));
  return p;
}

function pathLength(path: THREE.Vector3[]): number {
  let s = 0;
  for (let i = 1; i < path.length; i++) s += path[i].distanceTo(path[i - 1]);
  return s;
}

/** Every point along every segment is walkable (sampled every 5 cm). */
function assertWalkablePath(nav: Nav, path: THREE.Vector3[]): void {
  const q = new THREE.Vector3();
  for (let i = 1; i < path.length; i++) {
    const n = Math.ceil(path[i].distanceTo(path[i - 1]) / 0.05);
    for (let k = 0; k <= n; k++) {
      q.lerpVectors(path[i - 1], path[i], k / n);
      assert.ok(nav.isWalkable(q), `segment ${i} leaves the walkable area at ${q.toArray().map((x) => x.toFixed(2))}: ${fmt(path)}`);
    }
  }
}

test('open floor: straight 2-point path, wall clearance is the capsule radius', () => {
  const p = room();
  p.addBox(v3(0, 1.5, 5), v3(10, 1.5, 0.25)); // wall face at z = 4.75
  const nav = new Nav(p);
  nav.build(bounds(10, 10));
  assert.equal(nav.cols, 40); assert.equal(nav.rows, 40);
  const path = nav.findPath(v3(-6, 0, -3), v3(6, 0, 2));
  assert.ok(path, 'path exists');
  assert.equal(path.length, 2, `smoothed to a straight line: ${fmt(path)}`);
  assert.ok(nav.isWalkable(v3(0, 0, 4.25)), 'cell centre 0.5 m from the wall is walkable');
  assert.ok(!nav.isWalkable(v3(0, 0, 4.6)), 'cell centre 0.15 m from the wall is not');
  assert.ok(!nav.isWalkable(v3(0, 0, 5)), 'inside the wall');
  assert.ok(!nav.isWalkable(v3(0, 0, 12)), 'outside the bounds');
  assert.ok(!nav.isWalkable(v3(0, 3, 0)), 'mid-air is not walkable');
});

test('path goes around a wall', () => {
  const p = room();
  p.addBox(v3(0, 1.5, -1), v3(0.2, 1.5, 6)); // wall from z=-7 to z=5 at x=0
  const nav = new Nav(p);
  nav.build(bounds(10, 10));
  const a = v3(-4, 0, 0), b = v3(4, 0, 0);
  const path = nav.findPath(a, b);
  assert.ok(path, 'path exists');
  assert.ok(path[0].distanceTo(a) < 1e-6 && path[path.length - 1].distanceTo(b) < 1e-6, 'starts at from, ends at to');
  assert.ok(path.some((q) => q.z > 5.2), `passes the open (+z) end of the wall: ${fmt(path)}`);
  assertWalkablePath(nav, path);
  for (let i = 1; i < path.length; i++) {
    assert.ok(p.visible(v3(path[i - 1].x, 0.6, path[i - 1].z), v3(path[i].x, 0.6, path[i].z)), 'no segment crosses the wall');
  }
  const len = pathLength(path);
  const ideal = 2 * Math.hypot(4, 5.6);
  assert.ok(len < ideal * 1.12, `string-pulled close to the taut route (${len.toFixed(2)} vs ${ideal.toFixed(2)})`);
  assert.ok(path.length <= 5, `few waypoints (${path.length})`);
});

test('null when unreachable', () => {
  const p = room();
  // A closed pen of walls around (6, 6).
  p.addBox(v3(6, 1, 4), v3(2.2, 1, 0.2)); p.addBox(v3(6, 1, 8), v3(2.2, 1, 0.2));
  p.addBox(v3(4, 1, 6), v3(0.2, 1, 2.2)); p.addBox(v3(8, 1, 6), v3(0.2, 1, 2.2));
  const nav = new Nav(p);
  nav.build(bounds(10, 10));
  assert.ok(nav.isWalkable(v3(6, 0, 6)), 'inside the pen is walkable ground');
  assert.equal(nav.findPath(v3(-5, 0, -5), v3(6, 0, 6)), null, 'pen is sealed');
  assert.equal(nav.findPath(v3(6, 0, 6), v3(-5, 0, -5)), null, 'and from inside');
  assert.ok(nav.componentCount >= 2);
  assert.notEqual(nav.regionAt(v3(6, 0, 6)), nav.regionAt(v3(-5, 0, -5)));
  assert.equal(nav.findPath(v3(-5, 0, -5), v3(-5, 0, 30)), null, 'goal far outside the grid');
  // Off-grid goal within snapRadius snaps to the nearest cell of the start's region.
  const snapped = nav.findPath(v3(-5, 0, -5), v3(-9.9, 0, -9.9));
  assert.ok(snapped, 'snaps a goal hugging the edge');
  assert.ok(nav.isWalkable(snapped[snapped.length - 1]));
});

test('steps: 0.3 m is linked, 0.5 m is not; stairs and a 30 degree ramp connect, 60 degrees does not', () => {
  const p = room(12);
  p.addBox(v3(-6, 0.15, -6), v3(2, 0.15, 2)); // 0.3 block
  p.addBox(v3(6, 0.25, -6), v3(2, 0.25, 2)); // 0.5 block
  // Stairs of 0.25 up to a 1.5 m deck at x in [4, 8], z in [2, 8].
  p.addBox(v3(6, 0.75, 5), v3(2, 0.75, 3));
  for (let k = 0; k < 5; k++) { const top = 1.25 - k * 0.25; p.addBox(v3(3.75 - k * 0.5, top / 2, 5), v3(0.25, top / 2, 1.2)); }
  // 30 and 60 degree ramps on the -x side, each ending at a deck of the ramp's height.
  const deg = (d: number): number => (d * Math.PI) / 180;
  // Tilt slopes along local Z (as kit.ts and physics.test.ts build ramps); rotY -90 deg makes it rise toward +X.
  const addRamp = (x0: number, z: number, horiz: number, d: number): void => {
    const t = deg(d), len = horiz / Math.cos(t);
    p.addBox(v3(x0 + horiz / 2 + Math.sin(t) * 0.2, (horiz * Math.tan(t)) / 2 - Math.cos(t) * 0.2, z), v3(1.2, 0.2, len / 2), { rotY: -Math.PI / 2, tilt: t });
  };
  addRamp(-10, 5, 2.4, 30); // top at x=-7.6, y=1.386
  p.addBox(v3(-5.6, 0.693, 5), v3(2, 0.693, 1.2));
  addRamp(-10, 9, 1.2, 60); // top at x=-8.8, y=2.08
  p.addBox(v3(-7.8, 1.04, 9), v3(1, 1.04, 1.2));
  const nav = new Nav(p);
  nav.build(bounds(12, 12, -1, 4));
  const start = v3(0, 0, 0);
  const low = nav.findPath(start, v3(-6, 0.3, -6));
  assert.ok(low, '0.3 m block reachable');
  assert.ok(Math.abs(low[low.length - 1].y - 0.3) < 1e-3);
  assert.equal(nav.findPath(start, v3(6, 0.5, -6)), null, '0.5 m block unreachable');
  assert.ok(nav.isWalkable(v3(6, 0.5, -6)), 'but its top is walkable ground');
  const deck = nav.findPath(start, v3(6, 1.5, 5));
  assert.ok(deck, `stairs lead to the deck`);
  const ramp = nav.findPath(start, v3(-5.6, 1.386, 5));
  assert.ok(ramp, '30 degree ramp leads to its deck');
  assert.ok(nav.isWalkable(v3(-8.8, 1.386 * (1.2 / 2.4), 5)), 'ramp surface is walkable');
  assert.ok(!nav.isWalkable(v3(-9.4, 0.6 * Math.tan(deg(60)), 9)), '60 degree surface is not walkable');
  assert.equal(nav.findPath(start, v3(-7.8, 2.08, 9)), null, '60 degree ramp does not lead up');
});

test('multi-layer: under and over a bridge; ceilings lower than the capsule block', () => {
  const p = room();
  p.addBox(v3(0, 2.2, 0), v3(1.5, 0.2, 8)); // bridge deck top at 2.4, underside 2.0
  p.addBox(v3(-5, 0.95, 0), v3(1.5, 0.15, 1.5)); // slab with 0.8 m headroom under it
  p.addBox(v3(-5, 0.4, 0), v3(0.2, 0.4, 0.2)); // (a post holding it up)
  const nav = new Nav(p);
  nav.build(bounds(10, 10, -1, 4));
  assert.ok(nav.isWalkable(v3(0, 0, 0)), 'floor under the bridge');
  assert.ok(nav.isWalkable(v3(0, 2.4, 0)), 'bridge deck');
  assert.ok(!nav.isWalkable(v3(-5.5, 0, 0.6)), 'no headroom under the slab');
  assert.ok(nav.isWalkable(v3(-5.5, 1.1, 0.6)), 'top of the slab');
  const under = nav.findPath(v3(-3, 0, 0), v3(3, 0, 0));
  assert.ok(under, 'walk under the bridge');
  for (const q of under) assert.ok(q.y < 0.01, 'stays on the floor layer');
  assertWalkablePath(nav, under);
  assert.equal(nav.findPath(v3(0, 2.4, -6), v3(0, 0, 3)), null, 'deck is a separate island (no ramps)');
  const deck = nav.findPath(v3(0, 2.4, -6), v3(0, 2.4, 6));
  assert.ok(deck && deck.every((q) => Math.abs(q.y - 2.4) < 1e-3), 'deck path stays on the deck');
});

test('hazards and water are avoided; the path takes the gap', () => {
  const p = room();
  p.addBox(v3(-2.5, 0.05, 0), v3(7.5, 0.1, 1), { tags: ['hazard'] }); // lava strip x in [-10, 5]
  p.addBox(v3(8.5, 0.3, 0), v3(1.5, 0.3, 1), { tags: ['water'] });   // pond x in [7, 10]
  const nav = new Nav(p);
  nav.build(bounds(10, 10));
  assert.ok(!nav.isWalkable(v3(0, 0.15, 0)) && !nav.isWalkable(v3(0, 0, 0)), 'lava is not walkable');
  assert.ok(!nav.isWalkable(v3(0, 0, 1.2)), 'nor right next to it');
  assert.ok(!nav.isWalkable(v3(8.5, 0, 0)), 'pond floor is not walkable');
  const path = nav.findPath(v3(-4, 0, -4), v3(-4, 0, 4));
  assert.ok(path, 'path exists');
  assert.ok(path.some((q) => q.x > 5 && q.x < 7), `threads the dry gap at x in [5, 7]: ${fmt(path)}`);
  assertWalkablePath(nav, path);
  const noWater = new Nav(p, { avoidWater: false });
  noWater.build(bounds(10, 10));
  assert.ok(noWater.isWalkable(v3(8.5, 0, 0)), 'avoidWater: false wades');
});

test('rotated walls and cylinders; nearest and random walkable', () => {
  const p = room();
  p.addBox(v3(0, 1, 0), v3(4, 1, 0.25), { rotY: Math.PI / 4 });
  p.addCylinder(v3(-5, 1, 5), 1, 1);
  const nav = new Nav(p);
  nav.build(bounds(10, 10));
  assert.ok(!nav.isWalkable(v3(1, 0, -1)), 'on the rotated wall');
  assert.ok(!nav.isWalkable(v3(-5, 0, 5)) && !nav.isWalkable(v3(-5, 0, 6.3)), 'pillar + clearance');
  assert.ok(nav.isWalkable(v3(-5, 0, 6.6)));
  const nw = nav.nearestWalkable(v3(-5, 0, 5));
  assert.ok(nav.isWalkable(nw), 'nearestWalkable is walkable');
  const d = Math.hypot(nw.x + 5, nw.z - 5);
  assert.ok(d > 1.35 && d < 1.9, `just outside the pillar clearance (${d.toFixed(2)})`);
  const same = nav.nearestWalkable(v3(3, 0.1, 3.3));
  assert.ok(same.x === 3 && same.z === 3.3 && Math.abs(same.y) < 1e-6, 'a walkable point is returned as is (on the ground)');
  const rng = createRng(42), rng2 = createRng(42);
  const near = v3(-3, 0, -3);
  for (let i = 0; i < 50; i++) {
    const q = nav.randomWalkable(rng, near, 4);
    assert.ok(nav.isWalkable(q), 'random point walkable');
    assert.ok(Math.hypot(q.x - near.x, q.z - near.z) < 4 + 0.5, 'within radius');
    assert.ok(nav.findPath(near, q), 'and reachable');
    assert.ok(q.equals(nav.randomWalkable(rng2, near, 4)), 'seed-deterministic');
  }
  const anywhere = nav.randomWalkable(createRng(7));
  assert.ok(nav.isWalkable(anywhere));
});

function bigRoom(): Physics {
  // 60 x 60 m dungeon room: floor, outer walls, 4 interior wall runs, 24 pillars, 2 ramps with decks, stairs, crates.
  const p = new Physics();
  p.addBox(v3(0, -0.5, 0), v3(30, 0.5, 30));
  p.addBox(v3(0, 2, 30.25), v3(30.5, 2, 0.25)); p.addBox(v3(0, 2, -30.25), v3(30.5, 2, 0.25));
  p.addBox(v3(30.25, 2, 0), v3(0.25, 2, 30.5)); p.addBox(v3(-30.25, 2, 0), v3(0.25, 2, 30.5));
  p.addBox(v3(-10, 1.5, 5), v3(0.3, 1.5, 15)); p.addBox(v3(10, 1.5, -5), v3(0.3, 1.5, 15));
  p.addBox(v3(0, 1.5, 12), v3(6, 1.5, 0.3), { rotY: 0.3 }); p.addBox(v3(0, 1.5, -12), v3(6, 1.5, 0.3), { rotY: -0.3 });
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    p.addCylinder(v3(Math.cos(a) * 22, 2, Math.sin(a) * 22), 0.6, 2);
  }
  const t = (30 * Math.PI) / 180;
  for (const z of [-20, 20]) {
    // Ramp rises from (x=-24, y=0) to (x=-21, y=1.732), 3 m wide.
    p.addBox(v3(-24 + 1.5 + Math.sin(t) * 0.2, 1.5 * Math.tan(t) - Math.cos(t) * 0.2, z), v3(1.5, 0.2, 1.5 / Math.cos(t)), { rotY: -Math.PI / 2, tilt: t });
    p.addBox(v3(-18, 1.732 / 2, z), v3(3, 1.732 / 2, 3)); // deck x in [-21, -15], top 1.732
  }
  for (let k = 0; k < 8; k++) p.addBox(v3(20 + k * 0.5, 0.15 + k * 0.15, 20), v3(0.25, 0.15 + k * 0.15, 2));
  for (let i = 0; i < 12; i++) p.addBox(v3(-5 + (i % 4) * 3, 0.5, -3 + Math.floor(i / 4) * 3), v3(0.5, 0.5, 0.5), { rotY: i * 0.4 });
  return p;
}

test('60 x 60 m room builds in under 50 ms', () => {
  const p = bigRoom();
  const nav = new Nav(p);
  const b = bounds(30, 30, -1, 8);
  let best = Infinity;
  for (let i = 0; i < 6; i++) { nav.build(b); best = Math.min(best, nav.lastBuildMs); }
  console.log(`   build ${best.toFixed(1)} ms, ${nav.nodeCount} nodes, ${nav.componentCount} regions`);
  assert.ok(best < 50, `build took ${best.toFixed(1)} ms`);
  assert.ok(nav.nodeCount > 9000);
  const path = nav.findPath(v3(-27, 0, -27), v3(27, 0, 27));
  assert.ok(path, 'corner to corner');
  assertWalkablePath(nav, path);
  const up = nav.findPath(v3(-27, 0, 20), v3(-17, 1.732, 20));
  assert.ok(up && Math.abs(up[up.length - 1].y - 1.732) < 1e-3, 'ramp to its deck');
  assertWalkablePath(nav, up);
  for (let i = 0; i < 30; i++) nav.findPath(v3(-27, 0, -27), v3(27, 0, 27)); // JIT warm-up
  const t0 = performance.now();
  for (let i = 0; i < 20; i++) nav.findPath(v3(-27, 0, -27), v3(27, 0, 27));
  const per = (performance.now() - t0) / 20;
  console.log(`   findPath across the room ${per.toFixed(2)} ms`);
  assert.ok(per < 10, `findPath ${per.toFixed(2)} ms`);
});

test('determinism', () => {
  const run = (): number[] => {
    const nav = new Nav(bigRoom());
    nav.build(bounds(30, 30, -1, 8));
    const out: number[] = [nav.nodeCount, nav.componentCount];
    const rng = createRng(99);
    for (let i = 0; i < 20; i++) {
      const a = nav.randomWalkable(rng), b = nav.randomWalkable(rng);
      const path = nav.findPath(a, b);
      out.push(path ? path.length : -1);
      if (path) for (const q of path) out.push(q.x, q.y, q.z);
    }
    return out;
  };
  const x = run(), y = run();
  assert.deepEqual(x, y);
  assert.ok(x.length > 60);
});

let failed = 0;
for (const [name, fn] of tests) {
  try { fn(); console.log(`ok - ${name}`); }
  catch (e) { failed++; console.error(`FAIL - ${name}`); console.error(e); }
}
console.log(`${tests.length - failed}/${tests.length} nav tests passed`);
if (failed) process.exit(1);
