import assert from 'node:assert/strict';
import * as THREE from 'three';
import { ParticleParams, ParticlePool } from '../src/world/particles.ts';
import type { CameraInfo, ParticleSink } from '../src/world/particles.ts';
import { BURST_DEFAULT_COLOR, BURST_DEFAULT_COUNT, BURST_KINDS, FLASH_MIN_INTERVAL, FlashGate, FxRand, PHOTOSAFE_FLASH_PEAK, emitBurst, linearColor } from '../src/world/fx.ts';
import { AMBIENT_DEFAULTS, AMBIENT_KINDS, AmbientEmitters, ambientTarget } from '../src/world/ambient.ts';

const cam: CameraInfo = { x: 0, y: 5, z: 10, fx: 0, fy: -0.4, fz: -0.9 };

class TwoPools implements ParticleSink {
  readonly params = new ParticleParams();
  readonly add = new ParticlePool(8192, false);
  readonly alpha = new ParticlePool(4096, true);
  spawned = 0;
  maxLife = 8;
  spawn(p: ParticleParams = this.params): number {
    this.spawned++;
    for (const k of ['x', 'y', 'z', 'vx', 'vy', 'vz', 'life', 'size0', 'size1', 'r0', 'g0', 'b0', 'r1', 'g1', 'b1', 'alpha'] as const) {
      assert.ok(Number.isFinite(p[k]), `${k} finite`);
    }
    assert.ok(p.life > 0 && p.life < this.maxLife, `sane life ${p.life}`);
    assert.ok(p.size0 >= 0 && p.size1 >= 0, 'non-negative size');
    return (p.blend === 'alpha' ? this.alpha : this.add).spawn(p);
  }
  get live(): number {
    return this.add.liveCount + this.alpha.liveCount;
  }
  update(dt: number): void {
    this.add.update(dt, cam);
    this.alpha.update(dt, cam);
  }
}

assert.equal(BURST_KINDS.length, 16, 'all 16 contract burst kinds');
for (const k of BURST_KINDS) {
  assert.ok(BURST_DEFAULT_COUNT[k] > 0);
  assert.ok(BURST_DEFAULT_COLOR[k].startsWith('#'));
}

// Every kind emits, dies out in bounded time, and scales with count.
for (const kind of BURST_KINDS) {
  const s = new TwoPools();
  const r = new FxRand(7);
  const n = emitBurst(s, kind, 1, 0.5, -2, {}, r);
  assert.ok(n > 0, `${kind} emits`);
  assert.equal(n, s.spawned);
  const big = new TwoPools();
  const nBig = emitBurst(big, kind, 0, 0, 0, { count: BURST_DEFAULT_COUNT[kind] * 3, color: '#ff00ff', speed: 1.5, size: 2, spread: 2 }, new FxRand(7));
  assert.ok(nBig > n, `${kind} count scales (${n} -> ${nBig})`);
  const tiny = new TwoPools();
  emitBurst(tiny, kind, 0, 0, 0, { count: 1, speed: 0, size: 0.1, spread: 0 }, new FxRand(3));
  for (let t = 0; t < 8; t += 1 / 30) s.update(1 / 30);
  assert.equal(s.live, 0, `${kind} fully expires`);
}

// Bad options never produce NaN.
{
  const s = new TwoPools();
  for (const kind of BURST_KINDS) emitBurst(s, kind, 0, 0, 0, { count: Number.NaN, speed: Number.NaN, size: undefined, color: 'not-a-colour' }, new FxRand(1));
  assert.ok(s.spawned > 0);
}

// Deterministic for a given seed.
{
  const a = new TwoPools();
  const b = new TwoPools();
  emitBurst(a, 'confetti', 0, 0, 0, {}, new FxRand(99));
  emitBurst(b, 'confetti', 0, 0, 0, {}, new FxRand(99));
  a.update(0.1);
  b.update(0.1);
  assert.deepEqual(Array.from(a.alpha.posSize.slice(0, 40)), Array.from(b.alpha.posSize.slice(0, 40)));
}

// Colour parsing: cached, linear, falls back.
{
  const c = linearColor('#ffffff', '#000000');
  assert.ok(Math.abs(c.r - 1) < 1e-6);
  const f = linearColor('definitely-not-a-colour', '#ff0000');
  assert.ok(f.r > 0.9 && f.g < 0.01, 'fallback colour');
  assert.equal(linearColor('#ffffff', '#000000'), c, 'cached');
}

// Ambient: steady-state population around the target.
{
  assert.equal(ambientTarget(new THREE.Vector3(0, 0, 0), new THREE.Vector3(2, 3, 4), 0.5, 1000), 12);
  assert.equal(ambientTarget(new THREE.Vector3(0, 0, 0), new THREE.Vector3(10, 10, 10), 5, 100), 100, 'capped');
  for (const kind of AMBIENT_KINDS) {
    const s = new TwoPools();
    s.maxLife = 40;
    const amb = new AmbientEmitters(s);
    const min = new THREE.Vector3(-5, 0, -5), max = new THREE.Vector3(5, 6, 5);
    const density = Math.min(1.5, AMBIENT_DEFAULTS[kind].density * 2);
    const e = amb.add({ kind, min, max, density, wind: new THREE.Vector3(0.1, 0, 0) });
    const target = e.target;
    assert.ok(target > 0, `${kind} target`);
    assert.ok(Math.abs(s.live - target) <= 1, `${kind} prefilled (${s.live}/${target})`);
    for (let t = 0; t < 30; t += 1 / 30) {
      amb.update(1 / 30);
      s.update(1 / 30);
    }
    const ratio = s.live / target;
    assert.ok(ratio > 0.55 && ratio < 1.5, `${kind} steady state ${s.live}/${target}`);
    e.remove();
    assert.equal(amb.emitters.length, 0);
  }
}

// Quality density scales every burst, and never drops a layer entirely.
for (const kind of BURST_KINDS) {
  const full = emitBurst(new TwoPools(), kind, 0, 0, 0, {}, new FxRand(5), 0, 1);
  const low = emitBurst(new TwoPools(), kind, 0, 0, 0, {}, new FxRand(5), 0, 0.4);
  const zero = emitBurst(new TwoPools(), kind, 0, 0, 0, {}, new FxRand(5), 0, 0);
  const bad = emitBurst(new TwoPools(), kind, 0, 0, 0, {}, new FxRand(5), 0, Number.NaN);
  assert.ok(low <= full, `${kind} density 0.4 emits no more than 1 (${low} vs ${full})`);
  assert.ok(zero > 0, `${kind} density 0 still shows the burst`);
  assert.equal(bad, full, `${kind} NaN density falls back to 1`);
}
{
  const full = emitBurst(new TwoPools(), 'confetti', 0, 0, 0, {}, new FxRand(5), 0, 1);
  const low = emitBurst(new TwoPools(), 'confetti', 0, 0, 0, {}, new FxRand(5), 0, 0.5);
  assert.ok(low < full * 0.7, `confetti thins out on low quality (${low}/${full})`);
}

// Flash gate: onsets capped at 3 Hz; photosafe peak is dim; calls inside the cooldown only extend.
{
  const g = new FlashGate();
  assert.equal(g.trigger(0, 0.2, false), 0.85);
  assert.equal(g.trigger(0.1, 0.5, false), 0, 'second onset inside the cooldown is swallowed');
  assert.ok(Math.abs(g.remaining(0.1) - 0.5) < 1e-9, 'but it extends the running flash');
  assert.equal(g.trigger(0.2, 0.1, false), 0);
  assert.ok(Math.abs(g.remaining(0.2) - 0.4) < 1e-9, 'a shorter request never shortens it');
  assert.ok(g.trigger(FLASH_MIN_INTERVAL + 1e-6, 0.2, true) === PHOTOSAFE_FLASH_PEAK, 'photosafe peak after cooldown');
  let onsets = 0;
  for (let t = 0; t < 3; t += 1 / 60) if (g.trigger(10 + t, 0.1, false) > 0) onsets++;
  assert.ok(onsets <= 9 + 1, `at most ~3 onsets per second (${onsets} in 3 s)`);
  g.reset();
  assert.equal(g.trigger(0, 0.2, false), 0.85, 'reset clears the cooldown');
}

console.log('fx_bursts: ok');
