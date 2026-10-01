import assert from 'node:assert/strict';
import { EASE, EASE_NAMES, Tweens, ease } from '../src/core/tween.ts';

let passed = 0;
async function test(name: string, fn: () => void | Promise<void>): Promise<void> {
  try {
    await fn();
    passed++;
  } catch (e) {
    console.error(`FAIL ${name}`);
    throw e;
  }
}
const close = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) <= eps, `${a} != ${b}`);
const flush = () => new Promise<void>((r) => setImmediate(r));

await test('every ease maps 0 -> 0 and 1 -> 1', () => {
  assert.equal(EASE_NAMES.length, 14);
  for (const n of EASE_NAMES) {
    close(EASE[n](0), 0, 1e-6);
    close(EASE[n](1), 1, 1e-6);
    assert.equal(ease(n, 0), 0);
    assert.equal(ease(n, 1), 1);
    assert.equal(ease(n, -3), 0, `${n} clamps below`);
    assert.equal(ease(n, 7), 1, `${n} clamps above`);
  }
});

await test('in-out eases are symmetric about the midpoint', () => {
  for (const n of ['inOutQuad', 'inOutCubic', 'inOutSine'] as const) {
    close(EASE[n](0.5), 0.5, 1e-9);
    for (const t of [0.1, 0.23, 0.4]) close(EASE[n](t) + EASE[n](1 - t), 1, 1e-9);
  }
});

await test('monotonic eases never go backwards; back/elastic overshoot as designed', () => {
  const monotonic = ['linear', 'inQuad', 'outQuad', 'inOutQuad', 'inCubic', 'outCubic', 'inOutCubic', 'inOutSine', 'outExpo', 'inExpo', 'outBounce'] as const;
  for (const n of monotonic) {
    if (n === 'outBounce') continue; // bounces dip between arcs by design
    let prev = -Infinity;
    for (let i = 0; i <= 100; i++) {
      const v: number = EASE[n](i / 100);
      assert.ok(v >= prev - 1e-12, `${n} decreased at ${i}`);
      prev = v;
    }
  }
  assert.ok(EASE.outBack(0.7) > 1, 'outBack overshoots');
  assert.ok(EASE.inBack(0.2) < 0, 'inBack anticipates');
  let above = false;
  for (let i = 1; i < 100; i++) if (EASE.outElastic(i / 100) > 1) above = true;
  assert.ok(above, 'outElastic overshoots');
  for (let i = 0; i <= 100; i++) assert.ok(EASE.outBounce(i / 100) <= 1 + 1e-9);
});

await test('to() interpolates, lands exactly, resolves once', async () => {
  const tw = new Tweens();
  const o = { x: 0, y: 10, label: 'keep' };
  let done = 0;
  const p = tw.to(o, { x: 100, y: 0 }, 1, 'linear').then(() => done++);
  tw.update(0.25);
  close(o.x, 25);
  close(o.y, 7.5);
  tw.update(0.5);
  close(o.x, 75);
  tw.update(0.5);
  assert.equal(o.x, 100);
  assert.equal(o.y, 0);
  assert.equal(o.label, 'keep');
  await p;
  assert.equal(done, 1);
  tw.update(1);
  assert.equal(tw.count, 0);
});

await test('delay holds the start value, and from-values are captured at start', async () => {
  const tw = new Tweens();
  const o = { v: 0 };
  tw.to(o, { v: 10 }, 1, 'linear', 0.5);
  o.v = 4; // changed during the delay: the tween should start from 4
  tw.update(0.4);
  assert.equal(o.v, 4);
  tw.update(0.1); // starts now
  tw.update(0.5);
  close(o.v, 7);
});

await test('a newer tween takes over the same property', async () => {
  const tw = new Tweens();
  const o = { a: 0, b: 0 };
  let firstDone = false;
  tw.to(o, { a: 10, b: 10 }, 1, 'linear').then(() => (firstDone = true));
  tw.update(0.5);
  tw.to(o, { a: -10 }, 1, 'linear');
  tw.update(0.5);
  close(o.b, 10); // first tween still owns b and finished it
  close(o.a, 5 + (-10 - 5) * 0.5);
  await flush();
  assert.equal(firstDone, true);
  tw.update(0.5);
  assert.equal(o.a, -10);
});

await test('zero-duration tween applies immediately', async () => {
  const tw = new Tweens();
  const o = { v: 1 };
  await tw.to(o, { v: 9 }, 0);
  assert.equal(o.v, 9);
});

await test('wait() and call() fire at the right time', async () => {
  const tw = new Tweens();
  const log: string[] = [];
  tw.call(0.3, () => log.push('call'));
  const w = tw.wait(0.5).then(() => log.push('wait'));
  tw.update(0.2);
  assert.deepEqual(log, []);
  tw.update(0.2);
  assert.deepEqual(log, ['call']);
  tw.update(0.2);
  await w;
  assert.deepEqual(log, ['call', 'wait']);
});

await test('timeScale scales progress; clear() drops everything', () => {
  const tw = new Tweens();
  const o = { v: 0 };
  tw.to(o, { v: 1 }, 1, 'linear');
  tw.timeScale = 0.5;
  tw.update(1);
  close(o.v, 0.5);
  tw.clear();
  tw.update(1);
  close(o.v, 0.5);
  assert.equal(tw.count, 0);
});

await test('killTweensOf resolves the victims and leaves values in place', async () => {
  const tw = new Tweens();
  const o = { v: 0 };
  const p = tw.to(o, { v: 1 }, 1, 'linear');
  tw.update(0.3);
  assert.equal(tw.isTweening(o), true);
  tw.killTweensOf(o);
  await p;
  tw.update(1);
  close(o.v, 0.3);
});

await test('works on Vector3-like objects and ignores non-numeric props', () => {
  const tw = new Tweens();
  const v = { x: 0, y: 0, z: 0, set() {} };
  tw.to(v, { x: 1, z: 2 }, 1, 'outQuad');
  tw.update(1);
  assert.equal(v.x, 1);
  assert.equal(v.z, 2);
  assert.equal(v.y, 0);
});

console.log(`tween: ${passed} tests passed`);
