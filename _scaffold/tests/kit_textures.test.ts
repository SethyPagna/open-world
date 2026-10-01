import assert from 'node:assert/strict';
import * as THREE from 'three';
import {
  ashlarAt, brickAt, fbm, fbmField, hash2, hashString, makeAshlar, mulberry32, noiseTexture, runeGlyph, surfaceTexture, textureCacheSize,
  disposeTextures, valueNoise, TEXTURE_METERS,
} from '../src/world/textures.ts';
import type { SurfaceName } from '../src/world/textures.ts';

const tests: [string, () => void][] = [];
const test = (name: string, fn: () => void): void => { tests.push([name, fn]); };

test('mulberry32 / hashes are deterministic and in [0,1)', () => {
  const a = mulberry32(42), b = mulberry32(42), c = mulberry32(43);
  const sa = Array.from({ length: 50 }, a), sb = Array.from({ length: 50 }, b), sc = Array.from({ length: 50 }, c);
  assert.deepEqual(sa, sb);
  assert.notDeepEqual(sa, sc);
  for (const x of sa) assert.ok(x >= 0 && x < 1);
  for (let i = 0; i < 200; i++) {
    const h = hash2(i, i * 7 - 3, 5);
    assert.ok(h >= 0 && h < 1);
  }
  assert.equal(hashString('1E'), hashString('1E'));
  assert.notEqual(hashString('1E'), hashString('1A'));
});

test('value noise / fbm stay in [0,1] and tile seamlessly', () => {
  for (let i = 0; i < 400; i++) {
    const x = i * 0.137, y = i * 0.291;
    const n = valueNoise(x, y, 8, 8, 3);
    assert.ok(n >= 0 && n <= 1);
    assert.ok(Math.abs(valueNoise(x, y, 8, 8, 3) - valueNoise(x + 8, y - 16, 8, 8, 3)) < 1e-9, 'periodic lattice');
  }
  for (let i = 0; i <= 20; i++) {
    const v = i / 20;
    const left = fbm(0, v, 4, 4, 5, 9), right = fbm(1 - 1e-9, v, 4, 4, 5, 9);
    assert.ok(Math.abs(left - right) < 1e-3, `u seam at v=${v}: ${left} vs ${right}`);
    const bottom = fbm(v, 0, 4, 6, 5, 9), top = fbm(v, 1 - 1e-9, 4, 6, 5, 9);
    assert.ok(Math.abs(bottom - top) < 1e-3, `v seam at u=${v}`);
    const f = fbm(v, v * 0.7, 3, 5, 4, 1);
    assert.ok(f >= 0 && f <= 1);
  }
});

test('fbmField matches per-pixel fbm and tiles', () => {
  const w = 64, h = 32;
  const F = fbmField(w, h, 6, 3, 4, 21);
  assert.equal(F.length, w * h);
  for (let k = 0; k < 200; k++) {
    const x = (k * 37) % w, y = (k * 11) % h;
    const ref = fbm((x + 0.5) / w, (y + 0.5) / h, 6, 3, 4, 21);
    assert.ok(Math.abs(F[y * w + x] - ref) < 1e-5, `pixel ${x},${y}: ${F[y * w + x]} vs ${ref}`);
  }
  let lo = 1, hi = 0;
  for (const v of F) { lo = Math.min(lo, v); hi = Math.max(hi, v); }
  assert.ok(lo >= 0 && hi <= 1 && hi - lo > 0.2, 'in range and not flat');
});

test('running bond: rows offset by half a brick, edges bounded', () => {
  const cols = 4, rows = 8;
  const r0 = brickAt(0.01, 0.5 / rows, cols, rows), r1 = brickAt(0.01, 1.5 / rows, cols, rows);
  assert.equal(r0.row, 0);
  assert.equal(r1.row, 1);
  // Same u, adjacent rows: the offset row's brick starts half a brick later so the ids differ in column.
  assert.notEqual(r0.id % 131, r1.id % 131);
  for (let i = 0; i < 300; i++) {
    const h = brickAt(i * 0.0371, i * 0.0529, cols, rows);
    assert.ok(h.edge >= 0 && h.edge <= 0.5 / Math.min(cols, rows) + 1e-9);
  }
  // Tiles: u and u+1 hit the same brick.
  assert.deepEqual(brickAt(0.3, 0.3, cols, rows), brickAt(1.3, 2.3, cols, rows));
});

test('ashlar layout: edges monotone, cover [0,1], deterministic', () => {
  const L = makeAshlar(12, 5, 2, 4);
  assert.deepEqual(L, makeAshlar(12, 5, 2, 4));
  assert.equal(L.rowEdges[0], 0);
  assert.equal(L.rowEdges[5], 1);
  for (let i = 1; i < L.rowEdges.length; i++) assert.ok(L.rowEdges[i] > L.rowEdges[i - 1]);
  for (const be of L.blockEdges) {
    assert.ok(be.length >= 3 && be.length <= 5);
    assert.equal(be[0], 0);
    assert.equal(be[be.length - 1], 1);
  }
  for (let i = 0; i < 200; i++) {
    const h = ashlarAt(L, i * 0.047, i * 0.031);
    assert.ok(h.row >= 0 && h.row < 5);
    assert.ok(h.edge >= 0);
  }
});

test('rune glyphs: deterministic, in the unit box, always have a spine', () => {
  for (let s = 0; s < 40; s++) {
    const g = runeGlyph(s);
    assert.deepEqual(g, runeGlyph(s));
    assert.ok(g.lines.length >= 1);
    const [x0, y0, x1, y1] = g.lines[0];
    assert.equal(x0, x1, 'spine is vertical');
    assert.ok(y1 - y0 > 0.7);
    for (const l of g.lines) for (const c of l) assert.ok(c >= 0 && c <= 1);
  }
});

test('surface textures build without a DOM (DataTexture), are cached and tile-metred', () => {
  const names: SurfaceName[] = ['stone', 'brick', 'tiles', 'planks', 'metal', 'cloth', 'moss', 'rock', 'plaster'];
  const before = textureCacheSize();
  const t0 = performance.now();
  for (const n of names) {
    const s = surfaceTexture(n);
    assert.ok(s.map instanceof THREE.Texture, n);
    assert.equal(s.map.colorSpace, THREE.SRGBColorSpace, `${n} albedo is sRGB`);
    assert.ok(s.normalMap, `${n} has a normal map`);
    assert.equal(s.normalMap.colorSpace, THREE.NoColorSpace, `${n} normal map is data`);
    assert.equal(s.map.wrapS, THREE.RepeatWrapping);
    assert.ok(TEXTURE_METERS[n] > 0);
    assert.equal(surfaceTexture(n), s, 'cached');
  }
  const ms = performance.now() - t0;
  console.log(`   ${names.length} surfaces generated in ${ms.toFixed(0)} ms (node, no canvas)`);
  assert.ok(textureCacheSize() >= before + names.length);
  // Normal maps decode to unit-ish vectors facing +Z.
  const nm = surfaceTexture('brick').normalMap as THREE.DataTexture;
  const data = nm.image.data as Uint8Array;
  let minZ = 1;
  for (let i = 0; i < data.length; i += 4 * 97) {
    const x = data[i] / 127.5 - 1, y = data[i + 1] / 127.5 - 1, z = data[i + 2] / 127.5 - 1;
    const len = Math.hypot(x, y, z);
    assert.ok(len > 0.9 && len < 1.1, `normal length ${len}`);
    minZ = Math.min(minZ, z);
  }
  assert.ok(minZ > 0.2, 'normals face outward');
  const noise = noiseTexture();
  assert.equal(noiseTexture(), noise);
  disposeTextures();
  assert.equal(textureCacheSize(), 0);
});

let failed = 0;
for (const [name, fn] of tests) {
  try { fn(); console.log(`ok - ${name}`); }
  catch (e) { failed++; console.error(`FAIL - ${name}`); console.error(e); }
}
console.log(`${tests.length - failed}/${tests.length} kit texture tests passed`);
if (failed) process.exit(1);
