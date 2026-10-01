import assert from 'node:assert/strict';
import { EASE_IN, EASE_OUT, ParticleParams, ParticlePool, STRIDE, fadeAt, popIn, sizeAt } from '../src/world/particles.ts';
import type { CameraInfo, ParticleSink } from '../src/world/particles.ts';

const cam: CameraInfo = { x: 0, y: 0, z: 10, fx: 0, fy: 0, fz: -1 };
const step = (pool: ParticlePool, seconds: number, dt = 1 / 60): void => {
  for (let t = 0; t < seconds - 1e-9; t += dt) pool.update(dt, cam);
};

// Curves.
assert.ok(Math.abs(popIn(1) - 1) < 1e-9, 'popIn ends at 1');
assert.ok(Math.abs(popIn(0)) < 1e-9, 'popIn starts at 0');
let peak = 0;
for (let x = 0; x <= 1; x += 0.01) peak = Math.max(peak, popIn(x));
assert.ok(peak > 1.05 && peak < 1.2, `popIn overshoots a little (${peak})`);
assert.equal(sizeAt(1, 3, 0.5, 0, 0), 2);
assert.ok(sizeAt(1, 3, 0.5, EASE_OUT, 0) > 2, 'ease-out grows early');
assert.ok(sizeAt(1, 3, 0.5, EASE_IN, 0) < 2, 'ease-in grows late');
assert.equal(fadeAt(0.5, 0.1, 0.3), 1);
assert.equal(fadeAt(0, 0.1, 0.3), 0);
assert.ok(fadeAt(0.999, 0.1, 0.3) < 0.01);

// Lifecycle.
{
  const pool = new ParticlePool(64, false);
  const p = new ParticleParams();
  for (let i = 0; i < 10; i++) pool.spawn(p.reset().at(i, 0, 0));
  assert.equal(pool.liveCount, 10);
  pool.update(0.5, cam);
  assert.equal(pool.renderCount, 10);
  pool.update(0.6, cam);
  assert.equal(pool.liveCount, 0, 'all dead after life');
  assert.equal(pool.renderCount, 0);
}

// Ring-buffer reuse never grows past capacity and keeps working.
{
  const pool = new ParticlePool(8, false);
  const p = new ParticleParams();
  for (let i = 0; i < 50; i++) pool.spawn(p.reset().at(i, 0, 0).vel(0, 0, 0));
  assert.equal(pool.liveCount, 8);
  pool.update(0.01, cam);
  assert.equal(pool.renderCount, 8);
  // The newest spawns survive (oldest were recycled).
  const xs = new Set<number>();
  for (let i = 0; i < 8; i++) xs.add(pool.posSize[i * 4]);
  for (let x = 42; x < 50; x++) assert.ok(xs.has(x), `newest particle ${x} kept`);
  // Dead slots are reused before live ones.
  const pool2 = new ParticlePool(8, false);
  p.reset();
  p.life = 100;
  for (let i = 0; i < 4; i++) pool2.spawn(p);
  p.life = 0.01;
  for (let i = 0; i < 4; i++) pool2.spawn(p);
  pool2.update(0.05, cam);
  assert.equal(pool2.liveCount, 4);
  p.life = 100;
  for (let i = 0; i < 4; i++) pool2.spawn(p);
  pool2.update(0.01, cam);
  assert.equal(pool2.liveCount, 8, 'short-lived slots recycled without evicting long-lived ones');
}

// Gravity + drag integrate sensibly; ground bounce holds.
{
  const pool = new ParticlePool(4, false);
  const p = new ParticleParams().reset();
  p.life = 5;
  p.gravity = 10;
  p.y = 100;
  pool.spawn(p);
  step(pool, 1);
  const vy = pool.velRot[1];
  assert.ok(Math.abs(vy + 10) < 0.2, `free fall vy ~ -10 after 1 s (${vy})`);

  const pool2 = new ParticlePool(4, false);
  p.reset();
  p.life = 5;
  p.gravity = 20;
  p.y = 2;
  p.bounce = 0.4;
  p.groundY = 0.5;
  pool2.spawn(p);
  let minY = Infinity;
  for (let i = 0; i < 240; i++) {
    pool2.update(1 / 60, cam);
    minY = Math.min(minY, pool2.posSize[1]);
  }
  assert.ok(minY >= 0.5 - 1e-6, `never sinks below ground (${minY})`);
  assert.ok(Math.abs(pool2.posSize[1] - 0.5) < 1e-3, 'comes to rest on the ground');

  const pool3 = new ParticlePool(4, false);
  p.reset();
  p.life = 5;
  p.vx = 10;
  p.drag = 3;
  pool3.spawn(p);
  step(pool3, 2);
  assert.ok(pool3.velRot[0] < 0.1 && pool3.velRot[0] > 0, 'drag decays velocity');
}

// Landing flips confetti flat.
{
  const pool = new ParticlePool(4, false);
  const p = new ParticleParams().reset();
  p.life = 5;
  p.gravity = 20;
  p.y = 1;
  p.bounce = 0.05;
  p.land = true;
  p.flip = 10;
  pool.spawn(p);
  step(pool, 1.5);
  assert.equal(pool.misc[3], 1, 'lies flat after landing');
  assert.equal(pool.misc[2], 1, 'no flip once landed');
}

// Delay hides the particle until it starts.
{
  const pool = new ParticlePool(4, false);
  const p = new ParticleParams().reset();
  p.delay = 0.5;
  p.life = 1;
  pool.spawn(p);
  pool.update(0.2, cam);
  assert.equal(pool.renderCount, 0, 'hidden during delay');
  assert.equal(pool.liveCount, 1);
  pool.update(0.4, cam);
  assert.equal(pool.renderCount, 1, 'visible after delay');
  pool.update(0.95, cam);
  assert.equal(pool.liveCount, 0, 'life counts from the end of the delay');
}

// Alpha pool renders back to front, and stays sorted as particles move.
{
  const pool = new ParticlePool(256, true);
  const p = new ParticleParams();
  for (let i = 0; i < 200; i++) {
    p.reset();
    p.life = 10;
    p.z = ((i * 7919) % 200) / 10 - 10;
    p.vz = ((i * 31) % 17) / 17 - 0.5;
    pool.spawn(p);
  }
  for (let f = 0; f < 30; f++) {
    pool.update(1 / 30, cam);
    for (let i = 1; i < pool.renderCount; i++) {
      const dPrev = 10 - pool.posSize[(i - 1) * 4 + 2];
      const d = 10 - pool.posSize[i * 4 + 2];
      assert.ok(dPrev >= d - 1e-4, `sorted far-to-near at frame ${f}`);
    }
  }
}

// Orbit keeps a constant radius around the centre; quantisation snaps.
{
  const pool = new ParticlePool(4, false);
  const p = new ParticleParams().reset();
  p.life = 3;
  p.orbitR = 0.5;
  p.orbitW = 4;
  pool.spawn(p);
  step(pool, 1);
  const r = Math.hypot(pool.posSize[0], pool.posSize[2]);
  assert.ok(Math.abs(r - 0.5) < 1e-3, `orbit radius ${r}`);

  const pool2 = new ParticlePool(4, false);
  p.reset();
  p.x = 0.123;
  p.y = 0.456;
  p.quant = 0.1;
  pool2.spawn(p);
  pool2.update(0.01, cam);
  assert.ok(Math.abs(pool2.posSize[0] - 0.1) < 1e-6 && Math.abs(pool2.posSize[1] - 0.5) < 1e-6, 'quantised');
}

// Everything written is finite.
{
  const pool = new ParticlePool(128, true);
  const p = new ParticleParams();
  for (let i = 0; i < 100; i++) {
    p.reset();
    p.vx = i - 50; p.vy = 30; p.gravity = 9; p.drag = 2; p.wobble = 0.3; p.wobbleFreq = 3; p.pulse = 0.8; p.pulseFreq = 4;
    p.flip = 7; p.stretch = 0.05; p.sizeIn = 0.2; p.bounce = 0.3; p.life = 2;
    pool.spawn(p);
  }
  step(pool, 1);
  for (const arr of [pool.posSize, pool.color, pool.velRot, pool.misc]) {
    for (let i = 0; i < pool.renderCount * 4; i++) assert.ok(Number.isFinite(arr[i]), 'finite render data');
  }
  assert.equal(pool.data.length, 128 * STRIDE);
}

// ParticleSink contract is satisfiable by a bare pool wrapper.
{
  const pool = new ParticlePool(16, false);
  const sink: ParticleSink = { params: new ParticleParams(), spawn: (q) => pool.spawn(q ?? sink.params) };
  sink.spawn();
  assert.equal(pool.liveCount, 1);
}

console.log('fx_particles: ok');
