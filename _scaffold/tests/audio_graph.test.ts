/**
 * WebAudio scheduling checks against a strict mock AudioContext (Node has no WebAudio):
 * every SFX recipe (at several pitches/seeds), every loop and every music track (40 bars at three
 * intensities) must only schedule finite, non-negative times, exponential ramps between positive
 * values, positive time constants, in-range frequencies; start and stop every source exactly
 * once; and route every source to the destination. Also drives the AudioEngine end to end.
 * Run: node tests/audio_graph.test.ts
 */
import assert from 'node:assert/strict';
import { Prng, setSynthRandom } from '../src/core/audio/synth.ts';
import { babbleRecipe, LOOPS, LoopKit, planBabble, SFX, SFX_NAMES, SfxVoice } from '../src/core/audio/sfx.ts';
import { MusicPlayer, TRACKS, TRACK_NAMES } from '../src/core/audio/music.ts';
import { AudioEngine, AudioGraph, spatialize, triggerSfx, VOLUME_KEY } from '../src/core/audio/audio.ts';

// =============================================================================================
// Strict mock
// =============================================================================================
class Violations {
  list: string[] = [];
  where = '';
  add(msg: string): void {
    if (this.list.length < 50) this.list.push(`${this.where}: ${msg}`);
  }
}

class MParam {
  readonly owner: MNode;
  readonly name: string;
  readonly lo: number;
  readonly hi: number;
  private v: number;
  last: number | null;
  events = 0;
  maxAbs = 0;
  constructor(owner: MNode, name: string, v: number, lo: number, hi: number) {
    this.owner = owner;
    this.name = name;
    this.v = v;
    this.last = v;
    this.lo = lo;
    this.hi = hi;
  }
  private get bad(): Violations {
    return this.owner.ctx.bad;
  }
  private val(x: number, what: string): void {
    if (Number.isFinite(x)) this.maxAbs = Math.max(this.maxAbs, Math.abs(x));
    if (!Number.isFinite(x)) this.bad.add(`${this.owner.kind}.${this.name}.${what} non-finite value ${x}`);
    else if (x < this.lo || x > this.hi) this.bad.add(`${this.owner.kind}.${this.name}.${what} value ${x} outside [${this.lo}, ${this.hi}]`);
  }
  private time(t: number, what: string): void {
    if (!Number.isFinite(t) || t < 0) this.bad.add(`${this.owner.kind}.${this.name}.${what} bad time ${t}`);
    if (t > 3600) this.bad.add(`${this.owner.kind}.${this.name}.${what} absurd time ${t}`);
  }
  get value(): number {
    return this.v;
  }
  set value(x: number) {
    this.val(x, 'value');
    this.v = x;
    this.last = x;
  }
  setValueAtTime(x: number, t: number): this {
    this.val(x, 'setValueAtTime');
    this.time(t, 'setValueAtTime');
    this.last = x;
    this.events++;
    return this;
  }
  linearRampToValueAtTime(x: number, t: number): this {
    this.val(x, 'linearRamp');
    this.time(t, 'linearRamp');
    this.last = x;
    this.events++;
    return this;
  }
  exponentialRampToValueAtTime(x: number, t: number): this {
    this.val(x, 'expRamp');
    this.time(t, 'expRamp');
    if (!(x > 0)) this.bad.add(`${this.owner.kind}.${this.name} expRamp to non-positive ${x}`);
    if (this.last !== null && !(this.last > 0)) this.bad.add(`${this.owner.kind}.${this.name} expRamp from non-positive ${this.last}`);
    this.last = x;
    this.events++;
    return this;
  }
  setTargetAtTime(x: number, t: number, tc: number): this {
    this.val(x, 'setTarget');
    this.time(t, 'setTarget');
    if (!Number.isFinite(tc) || tc <= 0) this.bad.add(`${this.owner.kind}.${this.name} setTarget bad time constant ${tc}`);
    this.last = null; // unknown until the next explicit value
    this.events++;
    return this;
  }
  cancelScheduledValues(t: number): this {
    this.time(t, 'cancel');
    this.last = null;
    return this;
  }
  setValueCurveAtTime(): this {
    this.bad.add('setValueCurveAtTime used (overlap-prone)');
    return this;
  }
}

type Out = MNode | MParam;
class MNode {
  readonly ctx: MockCtx;
  readonly kind: string;
  outs: Out[] = [];
  channelCount = 2;
  channelCountMode = 'max';
  channelInterpretation = 'speakers';
  constructor(ctx: MockCtx, kind: string) {
    this.ctx = ctx;
    this.kind = kind;
    ctx.nodes.push(this);
  }
  p(name: string, v: number, lo = -1e9, hi = 1e9): MParam {
    return new MParam(this, name, v, lo, hi);
  }
  connect(dest: Out, output = 0, input = 0): MNode | undefined {
    if (!dest) this.ctx.bad.add(`${this.kind}.connect(undefined)`);
    if (!Number.isInteger(output) || !Number.isInteger(input)) this.ctx.bad.add(`${this.kind}.connect bad index`);
    if (dest instanceof MParam && dest.owner.ctx !== this.ctx) this.ctx.bad.add('cross-context connect');
    if (dest instanceof MNode && dest.ctx !== this.ctx) this.ctx.bad.add('cross-context connect');
    this.outs.push(dest);
    return dest instanceof MNode ? dest : undefined;
  }
  disconnect(): void {
    this.outs = [];
  }
}

class MSource extends MNode {
  started: number | null = null;
  stopped: number | null = null;
  onended: (() => void) | null = null;
  constructor(ctx: MockCtx, kind: string) {
    super(ctx, kind);
    ctx.sources.push(this);
  }
  start(t = 0, offset?: number): void {
    if (this.started !== null) this.ctx.bad.add(`${this.kind} started twice`);
    if (!Number.isFinite(t) || t < 0) this.ctx.bad.add(`${this.kind} start bad time ${t}`);
    if (offset !== undefined && (!Number.isFinite(offset) || offset < 0)) this.ctx.bad.add(`${this.kind} bad offset ${offset}`);
    this.started = t;
  }
  stop(t = 0): void {
    if (this.started === null) this.ctx.bad.add(`${this.kind} stopped before start`);
    if (this.stopped !== null) this.ctx.bad.add(`${this.kind} stopped twice`);
    if (!Number.isFinite(t) || t < 0) this.ctx.bad.add(`${this.kind} stop bad time ${t}`);
    if (this.started !== null && t < this.started) this.ctx.bad.add(`${this.kind} stop ${t} before start ${this.started}`);
    this.stopped = t;
  }
}

const OSC_TYPES = new Set(['sine', 'square', 'sawtooth', 'triangle']);
const BIQUAD_TYPES = new Set(['lowpass', 'highpass', 'bandpass', 'lowshelf', 'highshelf', 'peaking', 'notch', 'allpass']);

class MOsc extends MSource {
  readonly frequency: MParam;
  readonly detune: MParam;
  private t = 'sine';
  constructor(ctx: MockCtx) {
    super(ctx, 'Oscillator');
    this.frequency = this.p('frequency', 440, -ctx.sampleRate / 2, ctx.sampleRate / 2);
    this.detune = this.p('detune', 0, -15000, 15000);
  }
  get type(): string {
    return this.t;
  }
  set type(v: string) {
    if (!OSC_TYPES.has(v)) this.ctx.bad.add(`bad oscillator type ${v}`);
    this.t = v;
  }
  setPeriodicWave(): void {
    this.t = 'custom';
  }
}

class MBuffer {
  readonly numberOfChannels: number;
  readonly length: number;
  readonly sampleRate: number;
  readonly data: Float32Array[];
  constructor(ch: number, len: number, sr: number) {
    this.numberOfChannels = ch;
    this.length = len;
    this.sampleRate = sr;
    this.data = Array.from({ length: ch }, () => new Float32Array(len));
  }
  get duration(): number {
    return this.length / this.sampleRate;
  }
  getChannelData(i: number): Float32Array {
    return this.data[i]!;
  }
}

class MBufSrc extends MSource {
  buffer: MBuffer | null = null;
  loop = false;
  loopStart = 0;
  loopEnd = 0;
  readonly playbackRate: MParam;
  readonly detune: MParam;
  constructor(ctx: MockCtx) {
    super(ctx, 'BufferSource');
    this.playbackRate = this.p('playbackRate', 1, 1e-4, 64);
    this.detune = this.p('detune', 0, -15000, 15000);
  }
  override start(t = 0, offset?: number): void {
    if (!this.buffer) this.ctx.bad.add('BufferSource started without buffer');
    super.start(t, offset);
  }
}

class MBiquad extends MNode {
  readonly frequency: MParam;
  readonly Q: MParam;
  readonly gain: MParam;
  readonly detune: MParam;
  private t = 'lowpass';
  constructor(ctx: MockCtx) {
    super(ctx, 'Biquad');
    this.frequency = this.p('frequency', 350, 0, ctx.sampleRate / 2);
    this.Q = this.p('Q', 1, -100, 100);
    this.gain = this.p('gain', 0, -40, 40);
    this.detune = this.p('detune', 0, -15000, 15000);
  }
  get type(): string {
    return this.t;
  }
  set type(v: string) {
    if (!BIQUAD_TYPES.has(v)) this.ctx.bad.add(`bad biquad type ${v}`);
    this.t = v;
  }
}

class MockCtx {
  readonly sampleRate: number;
  currentTime = 0;
  state: 'running' | 'suspended' | 'closed' = 'running';
  readonly bad = new Violations();
  nodes: MNode[] = [];
  sources: MSource[] = [];
  buffers: MBuffer[] = [];
  readonly destination: MNode;
  constructor(sr = 48000) {
    this.sampleRate = sr;
    this.destination = new MNode(this, 'Destination');
  }
  reset(where: string): void {
    this.bad.where = where;
    this.nodes = [this.destination];
    this.sources = [];
  }
  createGain() {
    const n = new MNode(this, 'Gain') as MNode & { gain: MParam };
    n.gain = n.p('gain', 1, -1e6, 1e6); // modulation depths (FM index, vibrato cents) are large
    return n;
  }
  createOscillator() {
    return new MOsc(this);
  }
  createBufferSource() {
    return new MBufSrc(this);
  }
  createBiquadFilter() {
    return new MBiquad(this);
  }
  createStereoPanner() {
    const n = new MNode(this, 'StereoPanner') as MNode & { pan: MParam };
    n.pan = n.p('pan', 0, -1, 1);
    return n;
  }
  createDelay(max = 1) {
    const n = new MNode(this, 'Delay') as MNode & { delayTime: MParam };
    n.delayTime = n.p('delayTime', 0, 0, max);
    return n;
  }
  createDynamicsCompressor() {
    const n = new MNode(this, 'Compressor') as MNode & Record<'threshold' | 'knee' | 'ratio' | 'attack' | 'release', MParam>;
    n.threshold = n.p('threshold', -24, -100, 0);
    n.knee = n.p('knee', 30, 0, 40);
    n.ratio = n.p('ratio', 12, 1, 20);
    n.attack = n.p('attack', 0.003, 0, 1);
    n.release = n.p('release', 0.25, 0, 1);
    return n;
  }
  createWaveShaper() {
    const ctx = this;
    const n = new MNode(this, 'WaveShaper') as MNode & { curve: Float32Array | null; oversample: string };
    let c: Float32Array | null = null;
    Object.defineProperty(n, 'curve', {
      get: () => c,
      set: (v: Float32Array) => {
        if (v.length < 2) ctx.bad.add('curve too short');
        for (const x of v) if (!Number.isFinite(x) || Math.abs(x) > 1) ctx.bad.add('bad curve value');
        c = v;
      },
    });
    n.oversample = 'none';
    return n;
  }
  createConvolver() {
    const n = new MNode(this, 'Convolver') as MNode & { buffer: MBuffer | null; normalize: boolean };
    n.buffer = null;
    n.normalize = true;
    return n;
  }
  createChannelMerger(_n = 6) {
    return new MNode(this, 'Merger');
  }
  createChannelSplitter(_n = 6) {
    return new MNode(this, 'Splitter');
  }
  createAnalyser() {
    const n = new MNode(this, 'Analyser') as MNode & { fftSize: number; smoothingTimeConstant: number };
    n.fftSize = 2048;
    n.smoothingTimeConstant = 0.8;
    return n;
  }
  createBuffer(ch: number, len: number, sr: number) {
    if (!Number.isInteger(len) || len < 1) this.bad.add(`createBuffer bad length ${len}`);
    if (!Number.isInteger(ch) || ch < 1 || ch > 32) this.bad.add(`createBuffer bad channels ${ch}`);
    const b = new MBuffer(ch, Math.max(1, Math.floor(len)), sr);
    this.buffers.push(b);
    return b;
  }
  createPeriodicWave() {
    return {};
  }
  resume() {
    this.state = 'running';
    return Promise.resolve();
  }
  suspend() {
    this.state = 'suspended';
    return Promise.resolve();
  }
  close() {
    this.state = 'closed';
    return Promise.resolve();
  }
}

/** Gains on the audio path (feeding nodes, not params) must stay sane; modulation depths may be huge. */
function checkAudioGains(ctx: MockCtx): void {
  for (const n of ctx.nodes) {
    const gp = (n as MNode & { gain?: MParam }).gain;
    if (n.kind !== 'Gain' || !gp) continue;
    if (n.outs.some((o) => o instanceof MNode) && gp.maxAbs > 40) ctx.bad.add(`audio-path gain ${gp.maxAbs}`);
  }
}

/** Every source (and everything it feeds) must reach the destination. */
function unreachable(ctx: MockCtx): string[] {
  const memo = new Map<MNode, boolean>();
  const reaches = (n: MNode, seen: Set<MNode>): boolean => {
    if (n === ctx.destination) return true;
    const m = memo.get(n);
    if (m !== undefined) return m;
    if (seen.has(n)) return false;
    seen.add(n);
    let ok = false;
    for (const o of n.outs) {
      const next = o instanceof MParam ? o.owner : o;
      if (reaches(next, seen)) {
        ok = true;
        break;
      }
    }
    memo.set(n, ok);
    return ok;
  };
  const out: string[] = [];
  for (const s of ctx.sources) if (!reaches(s, new Set())) out.push(s.kind);
  return out;
}

function checkSources(ctx: MockCtx, needStop: boolean): void {
  for (const s of ctx.sources) {
    if (s.started === null) ctx.bad.add(`${s.kind} never started (leak)`);
    else if (needStop && s.stopped === null) ctx.bad.add(`${s.kind} never stopped`);
  }
}

function checkBuffers(ctx: MockCtx): void {
  for (const b of ctx.buffers) for (const d of b.data) for (let i = 0; i < d.length; i += 7) if (!Number.isFinite(d[i]!)) {
    ctx.bad.add('non-finite buffer sample');
    return;
  }
}

const asCtx = (m: MockCtx) => m as unknown as BaseAudioContext;
const asNode = (n: MNode) => n as unknown as AudioNode;

let passed = 0;
function test(name: string, fn: () => void | Promise<void>): Promise<void> {
  return Promise.resolve()
    .then(fn)
    .then(() => {
      passed++;
    })
    .catch((e) => {
      console.error(`FAIL ${name}`);
      throw e;
    });
}

// =============================================================================================
await test('every sfx recipe schedules cleanly (3 pitches x 3 seeds)', () => {
  const ctx = new MockCtx();
  const stats: { name: string; nodes: number; end: number }[] = [];
  for (const name of SFX_NAMES) {
    for (const pitch of [0.5, 1, 2]) {
      for (const seed of [1, 2, 3]) {
        ctx.reset(`${name}@${pitch}#${seed}`);
        const pr = new Prng(seed * 7919 + pitch * 13);
        setSynthRandom(() => pr.next());
        const t = 1.25;
        const v = new SfxVoice(asCtx(ctx), asNode(ctx.destination), t, pitch, () => pr.next());
        SFX[name]!.play(v);
        if (!Number.isFinite(v.end) || v.end <= t) ctx.bad.add(`bad end ${v.end}`);
        if (v.end - t > 12) ctx.bad.add(`rings ${(v.end - t).toFixed(1)} s`);
        if (ctx.sources.length === 0) ctx.bad.add('no sources');
        checkSources(ctx, true);
        checkAudioGains(ctx);
        for (const k of unreachable(ctx)) ctx.bad.add(`${k} not routed to destination`);
        if (pitch === 1 && seed === 1) stats.push({ name, nodes: ctx.nodes.length, end: v.end - t });
      }
    }
  }
  checkBuffers(ctx);
  setSynthRandom(Math.random);
  assert.deepEqual(ctx.bad.list, []);
  const heavy = stats.filter((s) => s.nodes > 400);
  assert.deepEqual(heavy.map((s) => s.name), [], 'no recipe builds > 400 nodes');
  const worst = [...stats].sort((a, b) => b.nodes - a.nodes).slice(0, 3);
  console.log(`  sfx: ${SFX_NAMES.length} recipes ok; heaviest ${worst.map((w) => `${w.name}(${w.nodes})`).join(', ')}`);
});

await test('sfx through the full graph with spatialisation', () => {
  const ctx = new MockCtx();
  ctx.reset('graph');
  const g = new AudioGraph(asCtx(ctx), { master: 0.8, music: 0.7, sfx: 0.9 });
  g.out.connect(asNode(ctx.destination));
  const pr = new Prng(5);
  setSynthRandom(() => pr.next());
  const listener = { x: 0, y: 0, z: 0 };
  const fwd = { x: 0, y: 0, z: -1 };
  let t = 0.1;
  for (const name of SFX_NAMES) {
    const at = { x: pr.range(-20, 20), y: pr.range(-2, 5), z: pr.range(-20, 20) };
    triggerSfx(g, SFX[name]!, t, 1, 1, spatialize(listener, fwd, at), () => pr.next());
    t += 0.05;
  }
  // UI sounds and non-positional
  for (const name of ['ui_click', 'type_tick', 'system_chime']) triggerSfx(g, SFX[name]!, t, 1, 1, null, () => pr.next());
  g.setMuffle(1, t);
  g.setSpace('well', t);
  g.setSpace('space', t + 0.5);
  g.duck(0.5, t);
  g.setDelayTime(0.4, t);
  g.setVolumes({ master: 0.2, music: 0, sfx: 1 }, t);
  setSynthRandom(Math.random);
  checkSources(ctx, true);
  checkBuffers(ctx);
  for (const k of unreachable(ctx)) ctx.bad.add(`${k} not routed to destination`);
  assert.deepEqual(ctx.bad.list, []);
});

await test('every loop builds, starts, re-pitches and stops cleanly', () => {
  const ctx = new MockCtx();
  for (const [name, def] of Object.entries(LOOPS)) {
    ctx.reset(`loop:${name}`);
    const pr = new Prng(3);
    const kit = new LoopKit(asCtx(ctx), () => pr.next());
    def.build(kit);
    kit.out.connect(asNode(ctx.destination));
    kit.start(0.5, 0.4);
    kit.setPitch(1.5, 1);
    kit.setPitch(0.1, 2); // clamps
    kit.stop(3, 0.5);
    kit.stop(4, 0.5); // idempotent
    checkSources(ctx, true);
    checkAudioGains(ctx);
    for (const k of unreachable(ctx)) ctx.bad.add(`${k} not routed`);
    if (ctx.sources.length === 0) ctx.bad.add('no sources');
  }
  checkBuffers(ctx);
  assert.deepEqual(ctx.bad.list, []);
});

await test('every track sequences 40 bars at 3 intensities cleanly', () => {
  const ctx = new MockCtx();
  for (const name of TRACK_NAMES) {
    for (const intensity of [0, 0.5, 1]) {
      ctx.reset(`${name}@${intensity}`);
      const pr = new Prng(17);
      setSynthRandom(() => pr.next());
      const g = new AudioGraph(asCtx(ctx), { master: 1, music: 1, sfx: 1 });
      g.out.connect(asNode(ctx.destination));
      const mp = new MusicPlayer({ ctx: asCtx(ctx), strip: g.music, setDelayTime: (s) => g.setDelayTime(s, 0) }, 3);
      mp.setIntensity(intensity, 0);
      mp.play(name, 0.5, 0);
      const def = TRACKS[name]!;
      const barDur = (60 / def.bpm) * def.beats;
      const before = ctx.sources.length;
      mp.schedule(40 * barDur, false);
      const made = ctx.sources.length - before;
      if (made === 0) ctx.bad.add('no notes');
      // intensity 0 must be sparser than full intensity (stems are skipped when silent)
      checkSources(ctx, true);
      checkAudioGains(ctx);
      for (const k of unreachable(ctx)) ctx.bad.add(`${k} not routed`);
      const st = mp.state(0);
      if (st.track !== name) ctx.bad.add(`state.track ${st.track}`);
    }
  }
  setSynthRandom(Math.random);
  checkBuffers(ctx);
  assert.deepEqual(ctx.bad.list, []);
});

await test('music: layering, crossfade, disposal, bar/beat clock, determinism', () => {
  const ctx = new MockCtx();
  ctx.reset('player');
  const g = new AudioGraph(asCtx(ctx), { master: 1, music: 1, sfx: 1 });
  g.out.connect(asNode(ctx.destination));
  const count = (intensity: number) => {
    const c = new MockCtx();
    c.reset('count');
    const gg = new AudioGraph(asCtx(c), { master: 1, music: 1, sfx: 1 });
    const mp = new MusicPlayer({ ctx: asCtx(c), strip: gg.music }, 9);
    mp.setIntensity(intensity, 0);
    mp.play('room_chase', 0, 0);
    const n0 = c.sources.length;
    mp.schedule(8 * (60 / 150) * 4, false);
    return c.sources.length - n0;
  };
  const lo = count(0);
  const hi = count(1);
  assert.ok(hi > lo * 1.5, `more layers at high intensity (${lo} -> ${hi})`);
  assert.equal(count(0.6), count(0.6), 'deterministic for a seed');

  const mp = new MusicPlayer({ ctx: asCtx(ctx), strip: g.music }, 4);
  mp.play('title', 1, 0);
  mp.play('title', 1, 0); // same track again: no restart
  ctx.currentTime = 0;
  mp.schedule(0.3);
  const spb = 60 / 76;
  ctx.currentTime = 0.06 + spb * 4 * 2 + spb * 2.5; // bar 2, beat 2
  mp.schedule(ctx.currentTime + 0.3);
  const st = mp.state();
  assert.equal(st.track, 'title');
  assert.equal(st.bar, 2);
  assert.equal(st.beat, 2);
  assert.equal(st.stems.length, 4);
  const tSwitch = ctx.currentTime;
  mp.play('boss', 2);
  assert.equal(mp.track, 'boss');
  assert.equal(mp.state().fading, 1, 'old track fading');
  ctx.currentTime = tSwitch + 1;
  mp.schedule(ctx.currentTime + 0.3);
  ctx.currentTime = tSwitch + 9;
  mp.schedule(ctx.currentTime + 0.3);
  assert.equal(mp.state().fading, 0, 'faded instance disposed');
  mp.play(null, 1);
  assert.equal(mp.track, null);
  // late scheduler (tab hitch): skip ahead rather than cramming old bars
  const n0 = ctx.sources.length;
  mp.play('minigame', 0.1);
  ctx.currentTime += 30;
  mp.schedule(ctx.currentTime + 0.3);
  const burst = ctx.sources.length - n0;
  assert.ok(burst < 400, `no catch-up burst (${burst} sources)`);
  checkSources(ctx, true);
  assert.deepEqual(ctx.bad.list, []);
});

await test('AudioEngine end to end on the mock (unlock, sfx, music, loops, volumes)', async () => {
  const ctx = new MockCtx();
  ctx.reset('engine');
  const store = new Map<string, string>();
  store.set(VOLUME_KEY, JSON.stringify({ master: 0.5, music: 0.25, sfx: 1 }));
  const storage = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v) };
  const g = globalThis as unknown as { window?: unknown };
  const hadWindow = 'window' in g;
  g.window = { AudioContext: function () { return ctx; } };
  const warns: string[] = [];
  const origWarn = console.warn;
  console.warn = (...a: unknown[]) => void warns.push(a.map(String).join(' '));
  try {
    const eng = new AudioEngine({ storage, autoUnlock: false, seed: 1 });
    assert.deepEqual({ ...eng.volumes }, { master: 0.5, music: 0.25, sfx: 1 }, 'volumes loaded');
    eng.sfx('coin'); // before unlock: silently dropped
    eng.music('landing', 0.5); // before unlock: pending
    const hum = eng.loop('hum', { at: { x: 3, y: 0, z: 0 } });
    assert.equal(eng.track, 'landing');
    eng.unlock();
    assert.equal(eng.unlocked, true);
    assert.ok(eng.analyser);
    eng.setListener({ x: 0, y: 1, z: 0 }, { x: 0, y: 0, z: -1 });
    eng.sfx('coin', { at: { x: 2, y: 0, z: 0 }, volume: 0.8, pitch: 1.2 });
    eng.sfx('jump');
    eng.sfx('jump', { pitch: NaN, volume: NaN });
    for (let i = 0; i < 20; i++) eng.sfx('type_tick');
    eng.sfx('far_away_nonexistent');
    eng.sfx('far_away_nonexistent');
    eng.sfx('hurt', { at: { x: 500, y: 0, z: 0 } }); // out of range: dropped
    for (const ch of 'Hello, wick!') eng.typeTick(ch);
    eng.setIntensity(0.9);
    eng.setMuffle(0.7);
    eng.setSpace('well');
    eng.setSpace('nowhere');
    eng.duck(0.5);
    eng.music('nonexistent');
    eng.music('boss', 1);
    ctx.currentTime = 0.5;
    await new Promise((r) => setTimeout(r, 80)); // scheduler ticks
    hum?.setPosition({ x: -3, y: 0, z: 0 });
    hum?.setPitch(1.3);
    hum?.setVolume(0.5);
    const s = eng.state();
    assert.equal(s.music.track, 'boss');
    assert.equal(s.space, 'well');
    assert.deepEqual(s.loops, ['hum']);
    assert.ok(s.stats.played >= 3, `played ${s.stats.played}`);
    assert.ok(s.stats.dropped >= 1, 'type_tick spam limited / far sound dropped');
    assert.equal(s.stats.unknown, 2);
    assert.equal(warns.filter((w) => w.includes('far_away_nonexistent')).length, 1, 'unknown sfx warns once');
    assert.ok(warns.some((w) => w.includes('nonexistent')) && warns.some((w) => w.includes('nowhere')));
    eng.volumes.music = 0.9;
    eng.volumes.master = 7; // clamps
    await new Promise((r) => setTimeout(r, 200));
    assert.deepEqual(JSON.parse(store.get(VOLUME_KEY)!), { master: 1, music: 0.9, sfx: 1 }, 'volumes persisted');
    hum?.stop(0.2);
    assert.equal(hum?.alive, false);
    eng.dispose();
    assert.equal(ctx.state, 'closed');
    for (const k of unreachable(ctx)) ctx.bad.add(`${k} not routed`);
    // storage that throws must not break anything
    const angry = { getItem: () => { throw new Error('denied'); }, setItem: () => { throw new Error('denied'); } };
    const e2 = new AudioEngine({ storage: angry, autoUnlock: false });
    e2.volumes.sfx = 0.3;
    await new Promise((r) => setTimeout(r, 200));
    assert.equal(e2.volumes.sfx, 0.3);
    e2.dispose();
  } finally {
    console.warn = origWarn;
    if (!hadWindow) delete g.window;
  }
  assert.deepEqual(ctx.bad.list, []);
});

await test('babble plans voice cleanly at every speaker pitch and mood', () => {
  const ctx = new MockCtx();
  const lines = ['Knot with me, I have the key.', 'Who lit the fork?', 'LIAR!', 'Sorry, sorry...', 'ok', 'la '.repeat(60)];
  for (const text of lines) {
    for (const f0 of [180, 300, 420]) {
      for (const resolve of [false, true]) {
        ctx.reset(`babble "${text.slice(0, 12)}" ${f0}${resolve ? ' resolve' : ''}`);
        const pr = new Prng(f0);
        setSynthRandom(() => pr.next());
        const plan = planBabble(text, { f0, resolve });
        const v = new SfxVoice(asCtx(ctx), asNode(ctx.destination), 0.5, 1, () => pr.next());
        babbleRecipe(plan).play(v);
        const last = plan[plan.length - 1]!;
        if (Math.abs(v.end - (0.5 + last.t + last.dur)) > 0.2) ctx.bad.add(`end ${v.end} vs plan ${last.t + last.dur}`);
        if (ctx.nodes.length > 400) ctx.bad.add(`${ctx.nodes.length} nodes`);
        checkSources(ctx, true);
        checkAudioGains(ctx);
        for (const k of unreachable(ctx)) ctx.bad.add(`${k} not routed`);
      }
    }
  }
  setSynthRandom(Math.random);
  assert.deepEqual(ctx.bad.list, []);
});

await test('voice budget: quietest voice is stolen for a louder one, typeTick is pentatonic', async () => {
  const ctx = new MockCtx();
  ctx.reset('steal');
  const g = globalThis as unknown as { window?: unknown };
  const hadWindow = 'window' in g;
  g.window = { AudioContext: function () { return ctx; } };
  try {
    const eng = new AudioEngine({ storage: null, autoUnlock: false, seed: 2, maxVoices: 3 });
    eng.unlock();
    eng.setListener({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: -1 });
    eng.sfx('gong', { volume: 1 });
    eng.sfx('bell_toll', { volume: 0.9 });
    eng.sfx('door_rumble', { at: { x: 0, y: 0, z: -30 } }); // far = quiet
    assert.equal(eng.state().voices, 3);
    eng.sfx('monster_growl', { volume: 0.001 }); // quieter than everyone: dropped, nothing stolen
    let s = eng.state();
    assert.equal(s.stats.stolen, 0);
    assert.equal(s.stats.dropped, 1);
    // the stolen voice fades instead of clicking: exactly one more gain ends ramped to 0
    const rampedToZero = () => ctx.nodes.filter((n) => {
      const gp = (n as MNode & { gain?: MParam }).gain;
      return n.kind === 'Gain' && gp !== undefined && gp.last === 0 && gp.events >= 2;
    }).length;
    const before = rampedToZero();
    eng.sfx('verdict', { volume: 1 }); // louder than the far rumble: steals it
    s = eng.state();
    assert.equal(s.stats.stolen, 1);
    assert.equal(s.voices, 3, 'budget respected');
    assert.equal(rampedToZero(), before + 1, 'stolen voice ramps to silence');
    const len = eng.babble('Knot with me?', { f0: 260, speaker: 'moss' });
    assert.ok(len > 0.3 && len < 2, `babble length ${len}`);
    assert.equal(eng.babble('   '), 0);
    eng.dispose();

    // typeTick: every audible character lands on C major pentatonic (C D E G A), punctuation on G
    const pitches: number[] = [];
    const e2 = new AudioEngine({ storage: null, autoUnlock: false });
    const orig = e2.sfx.bind(e2);
    e2.sfx = (name, opts) => {
      if (name === 'type_tick') pitches.push(opts?.pitch ?? 1);
      orig(name, opts);
    };
    for (const ch of 'The Tower remembers, Wick. 「Slime-Warden」 42!') e2.typeTick(ch);
    e2.typeTick('A', true);
    assert.ok(pitches.length > 30);
    for (const p of pitches) {
      const semi = Math.round(12 * Math.log2(p));
      assert.ok(Math.abs(12 * Math.log2(p) - semi) < 1e-9, 'whole semitones');
      assert.ok([0, 2, 4, 7, 9].includes(((semi % 12) + 12) % 12), `pentatonic ${semi}`);
      assert.ok(semi >= -12 && semi <= 21, `range ${semi}`);
    }
    assert.ok(pitches[pitches.length - 1]! < 1, 'headers an octave lower');
    e2.dispose();
  } finally {
    if (!hadWindow) delete g.window;
  }
  assert.deepEqual(ctx.bad.list, []);
});

console.log(`audio_graph: ${passed} tests passed`);
