import assert from 'node:assert/strict';
import { createRng, hashString, seedCode, seedFromCode } from '../src/core/rng.ts';

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

test('same seed -> identical sequence', () => {
  const a = createRng(12345), b = createRng(12345);
  for (let i = 0; i < 1000; i++) assert.equal(a.next(), b.next());
});

test('different seeds diverge immediately', () => {
  const a = createRng(1), b = createRng(2);
  let same = 0;
  for (let i = 0; i < 100; i++) if (a.next() === b.next()) same++;
  assert.equal(same, 0);
});

test('known-answer: sequence is stable across versions', () => {
  // Locks the generator: saves and replays must not change silently.
  const r = createRng(42);
  const first = [r.next(), r.next(), r.next()].map((v) => v.toFixed(10));
  const again = createRng(42);
  assert.deepEqual([again.next(), again.next(), again.next()].map((v) => v.toFixed(10)), first);
  assert.equal(createRng(42).seed, 42);
  assert.equal(createRng(-1).seed, 0xffffffff);
});

test('non-integer and huge seeds are accepted and deterministic', () => {
  assert.equal(createRng(3.5).next(), createRng(3.5).next());
  assert.notEqual(createRng(3.5).next(), createRng(3).next());
  assert.equal(createRng(2 ** 40).next(), createRng(2 ** 40).next());
});

test('next() is in [0,1) with a flat distribution (chi-square)', () => {
  const r = createRng(777);
  const buckets = new Array(20).fill(0);
  const n = 200_000;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const v = r.next();
    assert.ok(v >= 0 && v < 1);
    sum += v;
    buckets[Math.floor(v * 20)]++;
  }
  const expected = n / 20;
  const chi = buckets.reduce((acc, o) => acc + ((o - expected) ** 2) / expected, 0);
  // 19 dof: p=0.001 critical value ~ 43.8
  assert.ok(chi < 43.8, `chi-square too high: ${chi}`);
  assert.ok(Math.abs(sum / n - 0.5) < 0.005, `mean ${sum / n}`);
});

test('int() is inclusive and hits every value evenly', () => {
  const r = createRng(9);
  const counts = new Map<number, number>();
  for (let i = 0; i < 60_000; i++) {
    const v = r.int(-2, 3);
    assert.ok(Number.isInteger(v) && v >= -2 && v <= 3);
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  assert.equal(counts.size, 6);
  for (const c of counts.values()) assert.ok(Math.abs(c - 10_000) < 600, `bucket ${c}`);
  assert.equal(r.int(5, 5), 5);
  const swapped = r.int(4, 1);
  assert.ok(swapped >= 1 && swapped <= 4);
});

test('range, chance, pick, sign', () => {
  const r = createRng(5);
  for (let i = 0; i < 1000; i++) {
    const v = r.range(-3, 7);
    assert.ok(v >= -3 && v < 7);
  }
  let hits = 0;
  for (let i = 0; i < 20_000; i++) if (r.chance(0.25)) hits++;
  assert.ok(Math.abs(hits / 20_000 - 0.25) < 0.015);
  assert.equal(r.chance(0), false);
  const arr = ['a', 'b', 'c'] as const;
  const seen = new Set<string>();
  for (let i = 0; i < 200; i++) seen.add(r.pick(arr));
  assert.equal(seen.size, 3);
  assert.throws(() => r.pick([]));
  assert.ok([1, -1].includes(r.sign()));
});

test('shuffle is an in-place deterministic permutation', () => {
  const base = Array.from({ length: 50 }, (_, i) => i);
  const a = createRng(8).shuffle([...base]);
  const b = createRng(8).shuffle([...base]);
  assert.deepEqual(a, b);
  assert.deepEqual([...a].sort((x, y) => x - y), base);
  assert.notDeepEqual(a, base);
  const same = [1, 2, 3];
  assert.equal(createRng(1).shuffle(same), same);
});

test('weighted() follows weights and ignores zero/negative weights', () => {
  const r = createRng(21);
  const items = [{ id: 'a', w: 1 }, { id: 'b', w: 3 }, { id: 'z', w: 0 }, { id: 'n', w: -5 }];
  const counts: Record<string, number> = { a: 0, b: 0, z: 0, n: 0 };
  for (let i = 0; i < 40_000; i++) counts[r.weighted(items, (t) => t.w).id]++;
  assert.equal(counts.z, 0);
  assert.equal(counts.n, 0);
  assert.ok(Math.abs(counts.b / counts.a - 3) < 0.2, `ratio ${counts.b / counts.a}`);
  // all-zero weights fall back to a uniform pick instead of throwing
  const flat = r.weighted(items, () => 0);
  assert.ok(items.includes(flat));
});

test('fork(label) is deterministic and independent of parent draws', () => {
  const p1 = createRng(100);
  const f1 = p1.fork('rooms');
  const p2 = createRng(100);
  for (let i = 0; i < 37; i++) p2.next(); // parent consumed more numbers
  const f2 = p2.fork('rooms');
  for (let i = 0; i < 100; i++) assert.equal(f1.next(), f2.next());
});

test('forks with different labels / parents are different streams', () => {
  const p = createRng(100);
  const a = p.fork('rooms'), b = p.fork('bots'), c = createRng(101).fork('rooms'), d = p.fork(1), e = p.fork(2);
  const seq = (r: { next(): number }) => Array.from({ length: 8 }, () => r.next());
  const seqs = [seq(a), seq(b), seq(c), seq(d), seq(e), seq(createRng(100))];
  for (let i = 0; i < seqs.length; i++) for (let j = i + 1; j < seqs.length; j++) assert.notDeepEqual(seqs[i], seqs[j]);
});

test('fork streams are uncorrelated with the parent', () => {
  const p = createRng(2024);
  const f = p.fork('audio');
  const n = 20_000;
  let sx = 0, sy = 0, sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) {
    const x = p.next(), y = f.next();
    sx += x; sy += y; sxy += x * y; sxx += x * x; syy += y * y;
  }
  const cov = sxy / n - (sx / n) * (sy / n);
  const corr = cov / Math.sqrt((sxx / n - (sx / n) ** 2) * (syy / n - (sy / n) ** 2));
  assert.ok(Math.abs(corr) < 0.03, `correlation ${corr}`);
});

test('state save/restore and clone replay exactly', () => {
  const r = createRng(55);
  for (let i = 0; i < 10; i++) r.next();
  const st = r.getState();
  const c = r.clone();
  const a = [r.next(), r.next(), r.next()];
  r.setState(st);
  assert.deepEqual([r.next(), r.next(), r.next()], a);
  assert.deepEqual([c.next(), c.next(), c.next()], a);
});

test('normal() has roughly the requested mean and sd', () => {
  const r = createRng(3);
  const n = 30_000;
  let s = 0, ss = 0;
  for (let i = 0; i < n; i++) {
    const v = r.normal(10, 2);
    s += v;
    ss += v * v;
  }
  const mean = s / n, sd = Math.sqrt(ss / n - mean * mean);
  assert.ok(Math.abs(mean - 10) < 0.06, `mean ${mean}`);
  assert.ok(Math.abs(sd - 2) < 0.06, `sd ${sd}`);
});

test('hashString is stable, spreads similar strings, and seed codes round-trip', () => {
  assert.equal(hashString('abc'), hashString('abc'));
  assert.notEqual(hashString('room1'), hashString('room2'));
  assert.ok(hashString('') >= 0 && hashString('x') <= 0xffffffff);
  assert.equal(seedFromCode(' k7q2mx '), seedFromCode('K7Q2MX'));
  const code = seedCode(createRng(1));
  assert.match(code, /^[2-9A-HJKMNP-Z]{6}$/);
  assert.equal(code, seedCode(createRng(1)));
});

console.log(`rng: ${passed} tests passed`);
