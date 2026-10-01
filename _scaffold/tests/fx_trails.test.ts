import assert from 'node:assert/strict';
import { TRAIL_MAX_POINTS, TRAIL_SUBDIV, TrailPath, TrailSamples, sampleTrail, trailAlphaAt, trailWidthAt } from '../src/world/trails.ts';

// Ring buffer order and capacity.
{
  const p = new TrailPath(4);
  for (let i = 0; i < 6; i++) p.push(i, 0, 0, i);
  assert.equal(p.count, 4);
  assert.equal(p.x(0), 5, 'newest first');
  assert.equal(p.x(3), 2, 'oldest kept');
  p.expire(6, 2.5);
  assert.equal(p.count, 2, 'aged points dropped');
  assert.equal(p.x(1), 4);
  p.clear();
  assert.equal(p.count, 0);
}

// Sampling: head + points, Catmull-Rom subdivided, u monotonic 0 -> <=1, distance accumulates.
{
  const path = new TrailPath();
  for (let i = 0; i < 10; i++) path.push(i * 0.2, Math.sin(i) * 0.1, 0, i * 0.05);
  const out = new TrailSamples();
  const now = 0.5;
  const n = sampleTrail(path, 2.0, 0, 0, 0, now, 0.6, TRAIL_SUBDIV, out);
  assert.equal(n, 10 * TRAIL_SUBDIV + 1, 'samples = segments * subdiv + 1');
  assert.equal(out.u[0], 0, 'head is age 0');
  for (let i = 1; i < n; i++) {
    assert.ok(out.u[i] >= out.u[i - 1] - 1e-6, 'u non-decreasing');
    assert.ok(out.d[i] > out.d[i - 1], 'distance increases');
    assert.ok(out.u[i] <= 1);
  }
  assert.equal(out.x[0], 2.0);
  assert.ok(Math.abs(out.x[n - 1] - 0) < 1e-6, 'tail ends at the oldest point');
}

// Degenerate: a single coincident point gives no ribbon.
{
  const path = new TrailPath();
  path.push(1, 1, 1, 0);
  const out = new TrailSamples();
  assert.equal(sampleTrail(path, 1, 1, 1, 0, 0, 0.5, TRAIL_SUBDIV, out), 0);
}

// Buffer is sized for a full path.
{
  const path = new TrailPath();
  for (let i = 0; i < TRAIL_MAX_POINTS * 2; i++) path.push(i, 0, 0, i * 0.001);
  const out = new TrailSamples();
  const n = sampleTrail(path, -1, 0, 0, 0, 1, 10, TRAIL_SUBDIV, out);
  assert.ok(n <= out.x.length, `fits (${n})`);
}

// Width and alpha taper to zero at the tail.
assert.equal(trailWidthAt(0), 1);
assert.equal(trailWidthAt(1), 0);
assert.equal(trailAlphaAt(1), 0);
assert.ok(trailWidthAt(0.5) > trailAlphaAt(0.5), 'ribbon stays wide while fading');

console.log('fx_trails: ok');
