import assert from 'node:assert/strict';
import * as THREE from 'three';
import type { ColliderTag, PhysicsWorld, StaticCollider } from '../src/core/api.ts';
import { Kit, convexHull, prism, projectUVs, rockGeo, scaleNativeUVs, sectorPts, circlePts, yawToward } from '../src/world/kit.ts';
import { paletteFor } from '../src/world/palettes.ts';
import { Physics } from '../src/world/physics.ts';

const tests: [string, () => void][] = [];
const test = (name: string, fn: () => void): void => { tests.push([name, fn]); };
const near = (a: number, b: number, eps: number, msg?: string): void =>
  assert.ok(Math.abs(a - b) <= eps, `${msg ?? ''} expected ${b} +- ${eps}, got ${a}`);

/** Records every collider call; implements just enough of PhysicsWorld for the kit. */
class MockPhysics {
  gravity = 24;
  killY = -25;
  boxes: { center: THREE.Vector3; half: THREE.Vector3; rotY: number; tilt: number; tags: ColliderTag[] }[] = [];
  cyls: { center: THREE.Vector3; radius: number; halfHeight: number; tags: ColliderTag[] }[] = [];
  removed = 0;
  private id = 1;
  addBox(center: THREE.Vector3, half: THREE.Vector3, o: { rotY?: number; tilt?: number; tags?: ColliderTag[] } = {}): StaticCollider {
    this.boxes.push({ center: center.clone(), half: half.clone(), rotY: o.rotY ?? 0, tilt: o.tilt ?? 0, tags: o.tags ?? ['solid'] });
    return { id: this.id++, kind: 'box', center: center.clone(), half: half.clone(), rotY: o.rotY ?? 0, tilt: o.tilt, tags: new Set(o.tags ?? ['solid']), enabled: true };
  }
  addCylinder(center: THREE.Vector3, radius: number, halfHeight: number, o: { tags?: ColliderTag[] } = {}): StaticCollider {
    this.cyls.push({ center: center.clone(), radius, halfHeight, tags: o.tags ?? ['solid'] });
    return { id: this.id++, kind: 'cylinder', center: center.clone(), half: new THREE.Vector3(radius, halfHeight, radius), rotY: 0, tags: new Set(o.tags ?? ['solid']), enabled: true };
  }
  remove(): void { this.removed++; }
}
const mock = () => new MockPhysics();
const asWorld = (m: MockPhysics) => m as unknown as PhysicsWorld;

function drawables(root: THREE.Object3D): number {
  let n = 0;
  root.traverse((o) => { if ((o as THREE.Mesh).isMesh || (o as THREE.Sprite).isSprite || (o as THREE.Points).isPoints) n++; });
  return n;
}

test('geometry helpers: prism is closed-ish and outward, hull, sector, yaw', () => {
  const g = prism(circlePts(1, 8), 0.5, 0.05, { bottom: true });
  g.computeBoundingBox();
  near(g.boundingBox!.max.y, 0.5, 1e-6);
  near(g.boundingBox!.min.y, 0, 1e-6);
  near(g.boundingBox!.max.x, 1, 1e-6);
  // Every triangle's geometric normal points away from the centroid (outward winding).
  const p = g.attributes.position;
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), n = new THREE.Vector3(), m = new THREE.Vector3();
  const centre = new THREE.Vector3(0, 0.25, 0);
  for (let i = 0; i < p.count; i += 3) {
    a.fromBufferAttribute(p, i); b.fromBufferAttribute(p, i + 1); c.fromBufferAttribute(p, i + 2);
    n.subVectors(b, a).cross(m.subVectors(c, a));
    const mid = a.clone().add(b).add(c).divideScalar(3).sub(centre);
    assert.ok(n.dot(mid) > -1e-9, `triangle ${i / 3} faces inward`);
  }
  const hull = convexHull([new THREE.Vector2(0, 0), new THREE.Vector2(1, 0), new THREE.Vector2(0.5, 0.2), new THREE.Vector2(1, 1), new THREE.Vector2(0, 1)]);
  assert.equal(hull.length, 4);
  assert.equal(sectorPts(1, 2, 0, 1, 3).length, 8);
  near(yawToward(0, 1), 0, 1e-9);
  near(yawToward(1, 0), Math.PI / 2, 1e-9);
  // yawToward agrees with three.js: rotation.y = yaw turns local +Z toward (dx, dz).
  const o = new THREE.Object3D();
  o.rotation.y = yawToward(-0.6, 0.8);
  const z = new THREE.Vector3(0, 0, 1).applyEuler(o.rotation);
  near(z.x, -0.6, 1e-9); near(z.z, 0.8, 1e-9);
});

test('uv helpers: native uv rescale by metres, box projection fallback', () => {
  const cyl = new THREE.CylinderGeometry(1, 1, 4, 16);
  assert.ok(scaleNativeUVs(cyl, 2));
  let maxU = 0, maxV = 0;
  const uv = cyl.attributes.uv;
  for (let i = 0; i < uv.count; i++) { maxU = Math.max(maxU, uv.getX(i)); maxV = Math.max(maxV, uv.getY(i)); }
  near(maxU, Math.round((Math.PI * 2) / 2), 1e-6, 'u wraps an integer number of times');
  near(maxV, 2, 1e-6, 'v = height / metres');
  const custom = rockGeo(1, 3);
  assert.equal(scaleNativeUVs(custom, 2), false);
  projectUVs(custom, 2);
  assert.ok(custom.attributes.uv.count === custom.attributes.position.count);
});

test('floor + wall register colliders that match the geometry', () => {
  const ph = mock();
  const root = new THREE.Group();
  const kit = new Kit(root, paletteFor('well'), asWorld(ph), { seed: 1 });
  kit.floor({ w: 6, d: 4, at: [1, 2, 3], style: 'tiles' });
  assert.equal(ph.boxes.length, 1);
  near(ph.boxes[0].center.y + ph.boxes[0].half.y, 2, 1e-6, 'floor collider top = floor top');
  near(ph.boxes[0].half.x, 3, 1e-6);
  near(ph.boxes[0].center.x, 1, 1e-6);
  const w = kit.wall({ from: [0, 0], to: [0, -8], height: 5 });
  const wb = ph.boxes[1];
  near(wb.half.x, 4, 1e-6, 'wall half length');
  near(wb.center.z, -4, 1e-6);
  near(Math.abs(Math.sin(wb.rotY)), 1, 1e-6, 'wall along Z is rotated 90 degrees');
  near(wb.center.y + wb.half.y, 5, 1e-6);
  assert.equal((w.userData.colliders as unknown[]).length, 1);
  // Visible bounds of the wall contain its collider footprint.
  const box = new THREE.Box3().setFromObject(w);
  assert.ok(box.max.y >= 5 && box.min.z <= -8 + 0.1 && box.max.z >= -0.1);
});

test('roundWell: inward-facing shaft and a closed ring of wall colliders (with an opening)', () => {
  const ph = mock();
  const root = new THREE.Group();
  const kit = new Kit(root, paletteFor('well'), asWorld(ph));
  kit.roundWell({ radius: 10, height: 12, openings: [{ angle: 0, width: 3, height: 4 }] });
  assert.ok(ph.boxes.length >= 16);
  for (const b of ph.boxes) near(Math.hypot(b.center.x, b.center.z), 10 + 0.4, 0.05, 'collider ring radius');
  const low = ph.boxes.filter((b) => b.center.y - b.half.y < 0.5);
  const inGap = ph.boxes.filter((b) => Math.abs(Math.atan2(b.center.z, b.center.x)) < 0.1);
  assert.ok(inGap.every((b) => b.center.y - b.half.y >= 3.99), 'opening leaves a gap below the lintel');
  assert.ok(low.length >= 14, 'the rest of the ring reaches the floor');
  // Shaft wall normals face the axis.
  let shaft: THREE.Mesh | null = null;
  root.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh && !shaft && m.geometry.attributes.position.count > 200 && (m.material as THREE.Material).name.endsWith(':brick')) shaft = m; });
  assert.ok(shaft);
  const g = (shaft as THREE.Mesh).geometry;
  const pos = g.attributes.position, nor = g.attributes.normal;
  for (let i = 0; i < pos.count; i += 17) {
    const d = pos.getX(i) * nor.getX(i) + pos.getZ(i) * nor.getZ(i);
    assert.ok(d < 0, 'normal points inward');
  }
  // Winding agrees with the normals (front faces are seen from inside).
  const a = new THREE.Vector3().fromBufferAttribute(pos, 0), b = new THREE.Vector3().fromBufferAttribute(pos, 1), c = new THREE.Vector3().fromBufferAttribute(pos, 2);
  const fn = b.clone().sub(a).cross(c.clone().sub(a));
  assert.ok(fn.dot(new THREE.Vector3().fromBufferAttribute(nor, 0)) > 0);
});

test('ramp collider tilt matches the real physics (walkable slope rising toward +Z)', () => {
  const ph = new Physics();
  const root = new THREE.Group();
  const kit = new Kit(root, paletteFor('sky'), ph);
  kit.ramp({ at: [0, 0, 0], width: 2, length: 4, rise: 1.2 });
  const probe = (z: number) => ph.raycast(new THREE.Vector3(0, 10, z), new THREE.Vector3(0, -1, 0), 20)?.point.y ?? NaN;
  const low = probe(0.6), high = probe(3.4);
  assert.ok(high > low + 0.5, `slope rises toward +Z (${low.toFixed(2)} -> ${high.toFixed(2)})`);
  near(probe(2), 0.6 + 0.1 / Math.cos(Math.atan2(1.2, 4)), 0.12, 'mid-ramp height');
});

test('stairs / spiral stairs: collider tops follow the steps', () => {
  const ph = new Physics();
  const kit = new Kit(new THREE.Group(), paletteFor('well'), ph);
  const s = kit.stairs({ at: [0, 0, 0], steps: 5, rise: 0.3, run: 0.5 });
  assert.equal(s.userData.topHeight, 1.5);
  const hit = ph.raycast(new THREE.Vector3(0, 10, 4 * 0.5 + 0.25), new THREE.Vector3(0, -1, 0), 20);
  near(hit!.point.y, 1.5, 0.02);
  const sp = kit.spiralStairs({ at: [20, 0, 0], radius: 6, steps: 10, rise: 0.25, startAngle: 0, sweep: Math.PI / 2 });
  const aEnd = (sp.userData.endAngle as number) - (Math.PI / 2) / 20;
  const top = ph.raycast(new THREE.Vector3(20 + Math.cos(aEnd) * 5.2, 10, Math.sin(aEnd) * 5.2), new THREE.Vector3(0, -1, 0), 20);
  near(top!.point.y, 2.5, 0.05, 'last step top');
});

test('every builder runs, finalize merges statics to one mesh per material, dispose removes colliders', () => {
  const ph = mock();
  const root = new THREE.Group();
  const kit = new Kit(root, paletteFor('space', 'E'), asWorld(ph), { seed: 3, maxLights: 3 });
  kit.floor({ radius: 6, innerRadius: 2, style: 'flag' });
  kit.floor({ w: 4, d: 4, at: [20, 0, 0], style: 'planks' });
  kit.wall({ at: [0, 0, -8], length: 6 });
  kit.roundWell({ radius: 4, height: 5, at: [40, 0, 0] });
  kit.wellhead({ at: [30, 0, 10] });
  kit.arch({ at: [0, 0, 5] });
  kit.door({ at: [5, 0, 5], label: '1E', letter: 'E', open: 0.5 });
  kit.door({ at: [-5, 0, 5], label: '3C', letter: 'C', style: 'gate' });
  kit.pillar({ at: [3, 0, 0] });
  kit.pillar({ at: [-3, 0, 0], style: 'broken' });
  kit.pillar({ at: [-3, 0, 3], style: 'square' });
  kit.stairs({ at: [8, 0, 0] });
  kit.spiralStairs({ at: [40, 0, 0], radius: 4 });
  kit.ramp({ at: [12, 0, 0] });
  kit.floatingPlatform({ at: [0, 10, 0], crystals: 2 });
  kit.floatingPlatform({ at: [10, 10, 0], shape: 'hex', top: 'tiles' });
  kit.floatingPlatform({ at: [20, 10, 0], shape: 'square', top: 'cloud' });
  kit.railing({ from: [0, 0], to: [4, 0] });
  kit.railing({ at: [0, 0, 2], length: 3, style: 'iron' });
  kit.lantern({ at: [1, 0, 1] });
  kit.lantern({ at: [2, 3, 1], hanging: true });
  kit.torchSconce({ at: [0, 2, -7.7] });
  kit.crate({ at: [4, 0, 4] });
  kit.barrel({ at: [5, 0, 4] });
  const pipes = kit.pipes({ points: [[0, 1, 0], [3, 1, 0], [3, 1, 3], [3, 3, 3]], valves: [0, 2], color: '#FF6B6B', radius: 0.2 });
  const bell = kit.bell({ at: [0, 4, 0] });
  const fork = kit.tuningFork({ at: [2, 0, -2], color: '#B388FF', crooked: true, desaturate: 0.4 });
  const plate = kit.pressurePlate({ at: [1, 0, -2], letter: 'A' });
  const lever = kit.lever({ at: [1, 0, -3] });
  kit.banner({ at: [0, 4, -7.6], letter: 'E' });
  kit.statue({ kind: 'frog', at: [6, 0, -3] });
  kit.statue({ kind: 'hooded', at: [7, 0, -3] });
  kit.statue({ kind: 'totem', at: [8, 0, -3] });
  kit.crystalCluster({ at: [9, 0, -3], light: true });
  kit.cloudPuff({ at: [0, -5, 0], solid: true });
  kit.lilyPad({ at: [0, 0, 9], flower: true, collide: true });
  kit.planetoid({ at: [0, 20, -20], moon: true });
  kit.rocks({ at: [0, 0, 12], collide: true });
  kit.haloRing({ at: [0, 1, 0], radius: 5, spin: 0.1 });
  kit.water({ at: [0, -0.2, 0], radius: 2 });
  kit.lightShaft({ at: [0, 10, 0], to: [1, 0, 0] });
  kit.motes({ at: [0, 0, 0] });
  kit.instanced((p) => kit.crate({ parent: p, size: 0.5 }), [{ at: [0, 0, 15] }, { at: [1, 0, 15], rotY: 1 }, { at: [2, 0, 15], scale: 1.5 }], { collider: 'box' });

  assert.ok(Array.isArray(pipes.userData.valves) && (pipes.userData.valves as unknown[]).length === 2);
  assert.ok(bell.userData.swing instanceof THREE.Object3D);
  assert.ok(fork.userData.glowMaterial instanceof THREE.Material);
  assert.ok(plate.userData.plate instanceof THREE.Object3D);
  assert.ok(lever.userData.handle instanceof THREE.Object3D);
  assert.equal(kit.lights.length, 3, 'maxLights caps point lights');

  const collidersBefore = kit.colliders.length;
  assert.equal(collidersBefore, ph.boxes.length + ph.cyls.length);
  assert.ok(ph.cyls.some((c) => c.tags.includes('bouncy')), 'solid cloud is bouncy');
  assert.ok(ph.cyls.some((c) => c.tags.includes('water')), 'water volume registered');
  assert.equal(ph.boxes.filter((b) => Math.abs(b.center.z - 15) < 1).length, 3, 'one collider per instance');

  const before = drawables(root);
  const stats = kit.finalize();
  const after = drawables(root);
  console.log(`   ${before} drawables -> ${after} after finalize (${stats.merged} merged, ${stats.dynamic} dynamic, ${stats.triangles} tris)`);
  assert.ok(after < before / 3, 'finalize reduces drawables substantially');
  assert.ok(after < 300, 'well under the per-room draw-call budget');
  // Merged meshes: one per (material, shadow flags); dynamic parts are untouched and still animatable.
  const mats = new Set<string>();
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh && m.userData.kitMerged) {
      const key = `${(m.material as THREE.Material).uuid}|${m.castShadow}|${m.receiveShadow}`;
      assert.ok(!mats.has(key), 'one merged mesh per material+shadow bucket');
      mats.add(key);
      assert.ok(m.geometry.index, 'merged geometry is indexed');
      assert.ok(m.geometry.attributes.color && m.geometry.attributes.uv && m.geometry.attributes.normal);
    }
  });
  assert.ok((bell.userData.swing as THREE.Object3D).children.length > 0);
  kit.update(1.5, 1 / 60);
  kit.update(2.5, 1 / 60);

  kit.dispose();
  assert.equal(ph.removed, collidersBefore);
  assert.equal(kit.colliders.length, 0);
  assert.equal(kit.lights.length, 0);
  let left = 0;
  root.traverse((o) => { if (o !== root && o.name.startsWith('kit:') && o.parent === root) left++; });
  assert.equal(left, 0, 'root is clean after dispose');
});

test('determinism: same seed -> same geometry', () => {
  const build = (seed: number) => {
    const root = new THREE.Group();
    const kit = new Kit(root, paletteFor('well'), null, { seed });
    kit.floor({ radius: 5, style: 'flag' });
    kit.floatingPlatform({ at: [0, 5, 0], seed: 4 });
    kit.finalize();
    let sum = 0;
    root.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        const p = m.geometry.attributes.position;
        for (let i = 0; i < p.count; i += 7) sum += p.getX(i) * 1.3 + p.getY(i) * 0.7 + p.getZ(i);
        const c = m.geometry.attributes.color;
        if (c) for (let i = 0; i < c.count; i += 11) sum += c.getX(i);
      }
    });
    return sum;
  };
  assert.equal(build(5), build(5));
  assert.notEqual(build(5), build(6));
});

let failed = 0;
for (const [name, fn] of tests) {
  try { fn(); console.log(`ok - ${name}`); }
  catch (e) { failed++; console.error(`FAIL - ${name}`); console.error(e); }
}
console.log(`${tests.length - failed}/${tests.length} kit builder tests passed`);
if (failed) process.exit(1);
