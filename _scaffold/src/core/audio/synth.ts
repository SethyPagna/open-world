/**
 * Reusable procedural voices on top of WebAudio. Every function schedules on the audio clock at
 * absolute time `t` into `dest` and returns the time at which the voice is fully silent, so callers
 * can chain or track voices. Works on any BaseAudioContext (live or OfflineAudioContext).
 * Pure DSP helpers (KS strings, impulse responses, soft clip, PRNG) have no WebAudio dependency so
 * Node tests can exercise them directly.
 */

export type Ctx = BaseAudioContext;

// ---------------------------------------------------------------------------------------------
// Small pure helpers
// ---------------------------------------------------------------------------------------------
export const clamp = (v: number, lo: number, hi: number): number => (v < lo ? lo : v > hi ? hi : v);
export const lerp = (a: number, b: number, k: number): number => a + (b - a) * k;
export const smoothstep = (a: number, b: number, v: number): number => {
  const k = clamp((v - a) / (b - a), 0, 1);
  return k * k * (3 - 2 * k);
};
export const mtof = (m: number): number => 440 * Math.pow(2, (m - 69) / 12);
export const cents = (c: number): number => Math.pow(2, c / 1200);
export const dbToGain = (db: number): number => Math.pow(10, db / 20);

const NOTE_PC: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
/** 'C4' -> 60, 'Bb4' -> 70, 'F#2' -> 42 */
export function noteToMidi(n: string): number {
  const m = /^([A-G])([#b]?)(-?\d)$/.exec(n);
  if (!m) throw new Error(`bad note ${n}`);
  const pc = NOTE_PC[m[1]!]! + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
  return pc + (Number(m[3]) + 1) * 12;
}
export const hz = (n: string): number => mtof(noteToMidi(n));

/** FNV-1a over the joined parts: stable seeds from labels. */
export function hash32(...parts: (string | number)[]): number {
  const s = parts.join('|');
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32: tiny seeded PRNG for cosmetic/musical variation (gameplay uses core/rng.ts). */
export class Prng {
  private s: number;
  constructor(seed: number) {
    this.s = seed >>> 0;
  }
  next(): number {
    let t = (this.s = (this.s + 0x6d2b79f5) >>> 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  range(a: number, b: number): number {
    return a + (b - a) * this.next();
  }
  int(a: number, bInclusive: number): number {
    return a + Math.floor(this.next() * (bInclusive - a + 1));
  }
  chance(p: number): boolean {
    return this.next() < p;
  }
  pick<T>(arr: readonly T[]): T {
    return arr[Math.floor(this.next() * arr.length)]!;
  }
}

/** Cosmetic randomness source for voices (noise offsets, KS excitation). Swappable for determinism. */
let rnd: () => number = Math.random;
/** Returns the previous source so callers can restore it. */
export function setSynthRandom(fn: () => number): () => number {
  const prev = rnd;
  rnd = fn;
  return prev;
}
export const rand = (): number => rnd();

// ---------------------------------------------------------------------------------------------
// Node bookkeeping: every voice disconnects its nodes once its sources end (keeps the graph lean).
// ---------------------------------------------------------------------------------------------
class Bag {
  readonly nodes: AudioNode[] = [];
  readonly srcs: AudioScheduledSourceNode[] = [];
  readonly offsets = new Map<AudioScheduledSourceNode, number>();
  add<T extends AudioNode>(n: T): T {
    this.nodes.push(n);
    return n;
  }
  src<T extends AudioScheduledSourceNode>(n: T): T {
    this.srcs.push(n);
    this.nodes.push(n);
    return n;
  }
  /** Start every source at `t`, stop at `end`, disconnect everything afterwards. */
  run(t: number, end: number): number {
    const stop = end + 0.03;
    for (const s of this.srcs) {
      const off = this.offsets.get(s);
      if (off !== undefined) (s as AudioBufferSourceNode).start(t, off);
      else s.start(t);
      s.stop(stop);
    }
    const first = this.srcs[0];
    if (first) {
      const nodes = this.nodes;
      first.onended = () => {
        for (const n of nodes) {
          try {
            n.disconnect();
          } catch {
            /* already gone */
          }
        }
      };
    }
    return end;
  }
}

export const nyq = (ctx: Ctx): number => ctx.sampleRate * 0.45;
export const fclamp = (ctx: Ctx, f: number): number => clamp(f, 8, nyq(ctx));

// ---------------------------------------------------------------------------------------------
// Envelopes
// ---------------------------------------------------------------------------------------------
export interface Env {
  a?: number; // attack seconds (linear)
  h?: number; // hold at peak
  d?: number; // decay: time to ~2% of the way from peak to sustain
  s?: number; // sustain level 0..1 (fraction of peak); 0 => percussive
  r?: number; // release: time to ~0.25% after the gate closes
}

/**
 * ADSR on `p` starting at `t`. `gate` = time from t until release (defaults to a+h+d, i.e. a
 * percussive one-shot). Returns the time the envelope is effectively silent.
 */
export function adsr(p: AudioParam, t: number, peak: number, e: Env = {}, gate?: number): number {
  const a = Math.max(0.0015, e.a ?? 0.004);
  const h = Math.max(0, e.h ?? 0);
  const d = Math.max(0.004, e.d ?? 0.15);
  const s = clamp(e.s ?? 0, 0, 1);
  const r = Math.max(0.004, e.r ?? 0.06);
  const g = gate ?? a + h + d;
  p.setValueAtTime(0, t);
  p.linearRampToValueAtTime(peak, t + a);
  const ds = t + a + h;
  if (h > 0) p.setValueAtTime(peak, ds);
  p.setTargetAtTime(peak * s, ds, d / 4);
  const rel = Math.max(ds + 0.001, t + g);
  p.setTargetAtTime(0, rel, r / 6);
  return rel + r;
}

/** Glide `p` from `from` to `to` over `time` starting at `t` (exponential unless lin). */
export function sweep(p: AudioParam, t: number, from: number, to: number, time: number, lin = false): void {
  p.setValueAtTime(from, t);
  if (lin) p.linearRampToValueAtTime(to, t + Math.max(0.001, time));
  else p.exponentialRampToValueAtTime(Math.max(1e-4, to), t + Math.max(0.001, time));
}

// ---------------------------------------------------------------------------------------------
// Shared building blocks
// ---------------------------------------------------------------------------------------------
export interface FilterOpts {
  type?: BiquadFilterType;
  freq: number;
  q?: number; // lowpass/highpass: dB resonance; bandpass/peaking: linear Q
  to?: number; // sweep target
  time?: number; // sweep time
  delay?: number; // sweep starts after this
  lin?: boolean;
  env?: { peak: number; a?: number; d?: number }; // filter envelope (freq jumps to peak then decays to freq)
  gain?: number; // peaking/shelf dB
}

export function filter(ctx: Ctx, bag: Bag, t: number, f: FilterOpts): BiquadFilterNode {
  const n = bag.add(ctx.createBiquadFilter());
  n.type = f.type ?? 'lowpass';
  const lpHp = n.type === 'lowpass' || n.type === 'highpass';
  n.Q.value = f.q ?? (lpHp ? 0.5 : 1);
  if (f.gain !== undefined) n.gain.value = f.gain;
  const base = fclamp(ctx, f.freq);
  n.frequency.setValueAtTime(base, t);
  if (f.env) {
    const pk = fclamp(ctx, f.env.peak);
    const a = Math.max(0.002, f.env.a ?? 0.005);
    n.frequency.exponentialRampToValueAtTime(pk, t + a);
    n.frequency.setTargetAtTime(base, t + a, Math.max(0.002, (f.env.d ?? 0.2) / 4));
  } else if (f.to !== undefined) {
    const st = t + (f.delay ?? 0);
    if (st > t) n.frequency.setValueAtTime(base, st);
    if (f.lin) n.frequency.linearRampToValueAtTime(fclamp(ctx, f.to), st + Math.max(0.002, f.time ?? 0.2));
    else n.frequency.exponentialRampToValueAtTime(fclamp(ctx, f.to), st + Math.max(0.002, f.time ?? 0.2));
  }
  return n;
}

/** Chain nodes in order and return the head (input). */
function chain(nodes: AudioNode[]): AudioNode {
  for (let i = 0; i < nodes.length - 1; i++) nodes[i]!.connect(nodes[i + 1]!);
  return nodes[0]!;
}

function tail(ctx: Ctx, bag: Bag, dest: AudioNode, pan?: number, sweepTo?: { to: number; time: number; t: number }): AudioNode {
  if ((pan === undefined || pan === 0) && !sweepTo) return dest;
  const p = bag.add(ctx.createStereoPanner());
  const p0 = clamp(pan ?? 0, -1, 1);
  if (sweepTo) {
    p.pan.setValueAtTime(p0, sweepTo.t);
    p.pan.linearRampToValueAtTime(clamp(sweepTo.to, -1, 1), sweepTo.t + Math.max(0.01, sweepTo.time));
  } else p.pan.value = p0;
  p.connect(dest);
  return p;
}
const panSweep = (t: number, o: { panTo?: number; panTime?: number }) =>
  o.panTo === undefined ? undefined : { to: o.panTo, time: o.panTime ?? 0.5, t };

export interface Lfo {
  rate: number;
  depth: number; // in the target param's units
  type?: OscillatorType;
  delay?: number; // fade-in time for the depth
  to?: number; // rate sweep target
  time?: number;
}

function lfo(ctx: Ctx, bag: Bag, t: number, targets: AudioParam[], l: Lfo): void {
  const o = bag.src(ctx.createOscillator());
  o.type = l.type ?? 'sine';
  o.frequency.setValueAtTime(Math.max(0.01, l.rate), t);
  if (l.to !== undefined) o.frequency.exponentialRampToValueAtTime(Math.max(0.01, l.to), t + Math.max(0.01, l.time ?? 1));
  const g = bag.add(ctx.createGain());
  if (l.delay) {
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(l.depth, t + l.delay);
  } else g.gain.value = l.depth;
  o.connect(g);
  for (const p of targets) g.connect(p);
}

// ---------------------------------------------------------------------------------------------
// Noise
// ---------------------------------------------------------------------------------------------
export type NoiseColor = 'white' | 'pink' | 'brown';

/** Pure: fill a buffer with coloured noise, normalised to ~[-1, 1]. */
export function noiseData(color: NoiseColor, len: number, r: () => number = Math.random): Float32Array {
  const out = new Float32Array(len);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, last = 0;
  for (let i = 0; i < len; i++) {
    const w = r() * 2 - 1;
    if (color === 'white') out[i] = w;
    else if (color === 'pink') {
      // Paul Kellet's refined pink filter
      b0 = 0.99886 * b0 + w * 0.0555179;
      b1 = 0.99332 * b1 + w * 0.0750759;
      b2 = 0.969 * b2 + w * 0.153852;
      b3 = 0.8665 * b3 + w * 0.3104856;
      b4 = 0.55 * b4 + w * 0.5329522;
      b5 = -0.7616 * b5 - w * 0.016898;
      out[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
      b6 = w * 0.115926;
    } else {
      last = (last + 0.02 * w) / 1.02;
      out[i] = last * 3.5;
    }
  }
  let pk = 0;
  for (let i = 0; i < len; i++) pk = Math.max(pk, Math.abs(out[i]!));
  if (pk > 0) for (let i = 0; i < len; i++) out[i] = out[i]! / pk;
  return out;
}

const noiseCache = new WeakMap<Ctx, Map<string, AudioBuffer>>();
function cacheFor(ctx: Ctx): Map<string, AudioBuffer> {
  let m = noiseCache.get(ctx);
  if (!m) noiseCache.set(ctx, (m = new Map()));
  return m;
}
export function noiseBuffer(ctx: Ctx, color: NoiseColor): AudioBuffer {
  const m = cacheFor(ctx);
  const key = 'noise:' + color;
  let b = m.get(key);
  if (!b) {
    const len = Math.floor(ctx.sampleRate * 3);
    b = ctx.createBuffer(1, len, ctx.sampleRate);
    const pr = new Prng(hash32('noise', color));
    b.getChannelData(0).set(noiseData(color, len, () => pr.next()));
    m.set(key, b);
  }
  return b;
}

export interface NoiseOpts {
  color?: NoiseColor;
  gain?: number;
  env?: Env;
  dur?: number; // gate
  filter?: FilterOpts;
  filter2?: FilterOpts;
  rate?: number; // playback rate (pitch-shifts the noise texture)
  am?: Lfo; // amplitude modulation (depth 0..1)
  pan?: number;
  panTo?: number;
  panTime?: number;
}

export function noise(ctx: Ctx, dest: AudioNode, t: number, o: NoiseOpts = {}): number {
  const bag = new Bag();
  const src = bag.src(ctx.createBufferSource());
  src.buffer = noiseBuffer(ctx, o.color ?? 'white');
  src.loop = true;
  src.loopStart = 0;
  if (o.rate) src.playbackRate.value = o.rate;
  const amp = bag.add(ctx.createGain());
  const nodes: AudioNode[] = [src];
  if (o.filter) nodes.push(filter(ctx, bag, t, o.filter));
  if (o.filter2) nodes.push(filter(ctx, bag, t, o.filter2));
  nodes.push(amp);
  if (o.am) {
    const trem = bag.add(ctx.createGain());
    trem.gain.value = 1 - o.am.depth * 0.5;
    lfo(ctx, bag, t, [trem.gain], { ...o.am, depth: o.am.depth * 0.5 });
    nodes.push(trem);
  }
  nodes.push(tail(ctx, bag, dest, o.pan, panSweep(t, o)));
  chain(nodes);
  const end = adsr(amp.gain, t, o.gain ?? 0.3, o.env ?? { a: 0.002, d: 0.1 }, o.dur);
  // random offset so repeated hits never sound identical
  bag.offsets.set(src, rand() * 2);
  return bag.run(t, end);
}

// ---------------------------------------------------------------------------------------------
// Oscillator voice (sine/tri/saw/square, unison + detune, glide, filter, vibrato, tremolo)
// ---------------------------------------------------------------------------------------------
export interface ToneOpts {
  type?: OscillatorType;
  wave?: PeriodicWave;
  freq: number;
  to?: number; // glide target
  glide?: number; // glide time
  glideDelay?: number;
  lin?: boolean;
  detune?: number; // cents
  unison?: number;
  spread?: number; // cents across the unison stack
  gain?: number;
  env?: Env;
  dur?: number; // gate
  filter?: FilterOpts;
  vib?: Lfo; // depth in cents
  trem?: Lfo; // depth 0..1
  pan?: number;
  panTo?: number;
  panTime?: number;
}

export function tone(ctx: Ctx, dest: AudioNode, t: number, o: ToneOpts): number {
  const bag = new Bag();
  const n = Math.max(1, Math.floor(o.unison ?? 1));
  const amp = bag.add(ctx.createGain());
  const mix = bag.add(ctx.createGain());
  mix.gain.value = 1 / Math.sqrt(n);
  const f0 = fclamp(ctx, o.freq);
  const oscs: OscillatorNode[] = [];
  for (let i = 0; i < n; i++) {
    const osc = bag.src(ctx.createOscillator());
    if (o.wave) osc.setPeriodicWave(o.wave);
    else osc.type = o.type ?? 'sine';
    osc.frequency.setValueAtTime(f0, t);
    if (o.to !== undefined) {
      const st = t + (o.glideDelay ?? 0);
      if (st > t) osc.frequency.setValueAtTime(f0, st);
      const tt = st + Math.max(0.002, o.glide ?? 0.1);
      if (o.lin) osc.frequency.linearRampToValueAtTime(fclamp(ctx, o.to), tt);
      else osc.frequency.exponentialRampToValueAtTime(fclamp(ctx, o.to), tt);
    }
    const spread = n > 1 ? ((i / (n - 1)) * 2 - 1) * (o.spread ?? 12) : 0;
    osc.detune.value = (o.detune ?? 0) + spread;
    osc.connect(mix);
    oscs.push(osc);
  }
  if (o.vib) lfo(ctx, bag, t, oscs.map((x) => x.detune), o.vib);
  const nodes: AudioNode[] = [mix];
  if (o.filter) nodes.push(filter(ctx, bag, t, o.filter));
  nodes.push(amp);
  if (o.trem) {
    const tr = bag.add(ctx.createGain());
    tr.gain.value = 1 - o.trem.depth * 0.5;
    lfo(ctx, bag, t, [tr.gain], { ...o.trem, depth: o.trem.depth * 0.5 });
    nodes.push(tr);
  }
  nodes.push(tail(ctx, bag, dest, o.pan, panSweep(t, o)));
  chain(nodes);
  const end = adsr(amp.gain, t, o.gain ?? 0.3, o.env ?? {}, o.dur);
  return bag.run(t, end);
}

// ---------------------------------------------------------------------------------------------
// FM (2-operator, optional feedback-ish second modulator)
// ---------------------------------------------------------------------------------------------
export interface FmOpts {
  freq: number;
  ratio?: number; // modulator / carrier
  index?: number; // modulation index (peak deviation / modulator freq)
  indexTo?: number;
  indexTime?: number; // time to settle to indexTo
  type?: OscillatorType;
  modType?: OscillatorType;
  to?: number;
  glide?: number;
  lin?: boolean;
  detune?: number;
  gain?: number;
  env?: Env;
  dur?: number;
  filter?: FilterOpts;
  vib?: Lfo;
  pan?: number;
}

export function fm(ctx: Ctx, dest: AudioNode, t: number, o: FmOpts): number {
  const bag = new Bag();
  const car = bag.src(ctx.createOscillator());
  const mod = bag.src(ctx.createOscillator());
  car.type = o.type ?? 'sine';
  mod.type = o.modType ?? 'sine';
  const ratio = o.ratio ?? 1;
  const f0 = fclamp(ctx, o.freq);
  const mf0 = fclamp(ctx, f0 * ratio);
  car.frequency.setValueAtTime(f0, t);
  mod.frequency.setValueAtTime(mf0, t);
  if (o.to !== undefined) {
    const tt = t + Math.max(0.002, o.glide ?? 0.1);
    const f1 = fclamp(ctx, o.to);
    const mf1 = fclamp(ctx, f1 * ratio);
    if (o.lin) {
      car.frequency.linearRampToValueAtTime(f1, tt);
      mod.frequency.linearRampToValueAtTime(mf1, tt);
    } else {
      car.frequency.exponentialRampToValueAtTime(f1, tt);
      mod.frequency.exponentialRampToValueAtTime(mf1, tt);
    }
  }
  if (o.detune) car.detune.value = o.detune;
  const depth = bag.add(ctx.createGain());
  const i0 = (o.index ?? 2) * mf0;
  depth.gain.setValueAtTime(i0, t);
  if (o.indexTo !== undefined) depth.gain.setTargetAtTime(o.indexTo * mf0, t, Math.max(0.002, (o.indexTime ?? 0.3) / 4));
  mod.connect(depth);
  depth.connect(car.frequency);
  if (o.vib) lfo(ctx, bag, t, [car.detune, mod.detune], o.vib);
  const amp = bag.add(ctx.createGain());
  const nodes: AudioNode[] = [car];
  if (o.filter) nodes.push(filter(ctx, bag, t, o.filter));
  nodes.push(amp, tail(ctx, bag, dest, o.pan));
  chain(nodes);
  const end = adsr(amp.gain, t, o.gain ?? 0.3, o.env ?? {}, o.dur);
  return bag.run(t, end);
}

// ---------------------------------------------------------------------------------------------
// Karplus-Strong plucked string
// ---------------------------------------------------------------------------------------------
/**
 * Pure: render a KS string. Loop delay = N + S samples (S = averaging weight), so the buffer is
 * rendered at a slightly-off pitch and `rate` (playbackRate) corrects it exactly.
 */
export function ksData(sr: number, freq: number, decay: number, bright: number, r: () => number = Math.random): { data: Float32Array; rate: number } {
  const b = clamp(bright, 0, 1);
  const S = 0.5 - 0.42 * b; // lower S => less damping of highs => brighter/metallic
  const period = sr / Math.max(20, freq);
  const N = Math.max(2, Math.floor(period - S));
  const rate = freq * (N + S) / sr;
  const len = Math.max(N * 4, Math.ceil(sr * clamp(decay, 0.05, 6)));
  const out = new Float32Array(len);
  // excitation: lowpassed noise burst (brightness = cutoff), DC removed
  const k = 0.08 + 0.9 * b;
  let y = 0;
  let mean = 0;
  for (let i = 0; i < N; i++) {
    y += k * (r() * 2 - 1 - y);
    out[i] = y;
    mean += y;
  }
  mean /= N;
  let pk = 1e-9;
  for (let i = 0; i < N; i++) {
    out[i] = out[i]! - mean;
    pk = Math.max(pk, Math.abs(out[i]!));
  }
  for (let i = 0; i < N; i++) out[i] = out[i]! / pk;
  const rho = Math.pow(10, -3 / (Math.max(0.05, decay) * freq));
  for (let i = N; i < len; i++) {
    const a = out[i - N]!;
    const c = i - N - 1 >= 0 ? out[i - N - 1]! : 0;
    out[i] = rho * ((1 - S) * a + S * c);
  }
  // gentle DC blocker + fade the last 8 ms so the buffer never ends in a click
  let x1 = 0, y1 = 0;
  for (let i = 0; i < len; i++) {
    const x = out[i]!;
    y1 = x - x1 + 0.995 * y1;
    x1 = x;
    out[i] = y1;
  }
  const fade = Math.min(len, Math.floor(sr * 0.008));
  for (let i = 0; i < fade; i++) out[len - 1 - i] = out[len - 1 - i]! * (i / fade);
  return { data: out, rate };
}

let ksCount = 0;
function ksBuffer(ctx: Ctx, freq: number, decay: number, bright: number, variant: number): { buf: AudioBuffer; rate: number } {
  const m = cacheFor(ctx);
  // quantise to a quarter-semitone so the cache stays small; playbackRate corrects the rest
  const q = Math.round(12 * 4 * Math.log2(freq / 440)) / 48;
  const fq = 440 * Math.pow(2, q);
  const key = `ks:${fq.toFixed(2)}:${decay.toFixed(1)}:${bright.toFixed(2)}:${variant}`;
  let b = m.get(key);
  const sr = ctx.sampleRate;
  const S = 0.5 - 0.42 * clamp(bright, 0, 1);
  const N = Math.max(2, Math.floor(sr / fq - S));
  const baseRate = fq * (N + S) / sr;
  if (!b) {
    if (++ksCount > 400) {
      for (const k of [...m.keys()]) if (k.startsWith('ks:')) m.delete(k);
      ksCount = 0;
    }
    const pr = new Prng(hash32(key));
    const { data } = ksData(sr, fq, decay, bright, () => pr.next());
    b = ctx.createBuffer(1, data.length, sr);
    b.getChannelData(0).set(data);
    m.set(key, b);
  }
  return { buf: b, rate: baseRate * (freq / fq) };
}

export interface PluckOpts {
  freq: number;
  decay?: number; // T60 seconds
  bright?: number; // 0..1
  gain?: number;
  to?: number; // pitch bend target (Hz)
  glide?: number;
  dur?: number; // optional mute (release) after this
  r?: number; // release time when muted
  filter?: FilterOpts;
  pan?: number;
  variant?: number;
}

export function pluck(ctx: Ctx, dest: AudioNode, t: number, o: PluckOpts): number {
  const bag = new Bag();
  const decay = clamp(o.decay ?? 1.2, 0.05, 6);
  const bright = clamp(o.bright ?? 0.5, 0, 1);
  const { buf, rate } = ksBuffer(ctx, o.freq, decay, bright, o.variant ?? Math.floor(rand() * 3));
  const src = bag.src(ctx.createBufferSource());
  src.buffer = buf;
  src.playbackRate.setValueAtTime(rate, t);
  if (o.to !== undefined) src.playbackRate.exponentialRampToValueAtTime(Math.max(0.01, rate * (o.to / o.freq)), t + Math.max(0.005, o.glide ?? 0.2));
  const amp = bag.add(ctx.createGain());
  const nodes: AudioNode[] = [src];
  if (o.filter) nodes.push(filter(ctx, bag, t, o.filter));
  nodes.push(amp, tail(ctx, bag, dest, o.pan));
  chain(nodes);
  const g = o.gain ?? 0.4;
  amp.gain.setValueAtTime(g, t);
  const minRate = o.to !== undefined ? Math.min(rate, rate * (o.to / o.freq)) : rate;
  let end = Math.min(t + buf.duration / Math.max(0.05, minRate), t + decay * 1.5 + 0.1);
  if (o.dur !== undefined && t + o.dur < end) {
    const r = Math.max(0.01, o.r ?? 0.06);
    amp.gain.setTargetAtTime(0, t + o.dur, r / 6);
    end = t + o.dur + r;
  }
  return bag.run(t, end);
}

// ---------------------------------------------------------------------------------------------
// Bells / mallets / forks: additive inharmonic partials with individual decays
// ---------------------------------------------------------------------------------------------
export type PartialSet = readonly (readonly [ratio: number, amp: number, decayMul: number])[];
export const PARTIALS = {
  /** church/hand bell: hum, prime, minor-third tierce, quint, nominal + upper inharmonics */
  church: [[0.5, 0.55, 1.0], [1, 1, 0.8], [1.183, 0.55, 0.55], [1.506, 0.35, 0.45], [2, 0.5, 0.4], [2.51, 0.22, 0.3], [2.66, 0.2, 0.25], [3.01, 0.16, 0.2], [4.07, 0.1, 0.14], [5.19, 0.06, 0.1]],
  /** Risset's classic inharmonic bell */
  risset: [[0.56, 1, 1], [0.563, 0.67, 0.9], [0.92, 1, 0.65], [0.923, 1.8, 0.55], [1.19, 2.67, 0.325], [1.7, 1.67, 0.35], [2, 1.46, 0.25], [2.74, 1.33, 0.2], [3, 1.33, 0.15], [3.76, 1, 0.1], [4.07, 1.33, 0.075]],
  /** free-free bar (glass, glockenspiel) */
  glass: [[1, 1, 1], [2.756, 0.35, 0.45], [5.404, 0.14, 0.22], [8.933, 0.05, 0.1]],
  glock: [[1, 1, 1], [2.76, 0.3, 0.35], [5.4, 0.16, 0.16]],
  marimba: [[1, 1, 1], [3.93, 0.22, 0.2], [9.54, 0.05, 0.06]],
  vibe: [[1, 1, 1], [4, 0.28, 0.35], [10, 0.04, 0.1]],
  celesta: [[1, 1, 1], [2, 0.25, 0.4], [3, 0.08, 0.2], [4.2, 0.05, 0.1]],
  /** music-box comb tine (GDD 15.2: partials 1 / 3.1 / 5.2, short decay) */
  musicbox: [[1, 1, 1], [3.1, 0.3, 0.3], [5.2, 0.12, 0.15]],
  fork: [[1, 1, 1], [6.27, 0.12, 0.05]],
  coin: [[1, 1, 1], [2.32, 0.5, 0.6], [3.87, 0.35, 0.45], [5.61, 0.18, 0.3]],
  gong: [[0.5, 0.6, 1], [1, 1, 0.9], [1.41, 0.7, 0.85], [1.73, 0.5, 0.8], [2.12, 0.55, 0.7], [2.44, 0.4, 0.6], [2.87, 0.35, 0.5], [3.36, 0.3, 0.4], [3.9, 0.22, 0.35], [4.5, 0.18, 0.3], [5.32, 0.12, 0.25]],
  metal: [[1, 1, 1], [1.59, 0.7, 0.6], [2.14, 0.6, 0.5], [2.65, 0.45, 0.4], [3.52, 0.3, 0.3], [4.63, 0.2, 0.2]],
  wood: [[1, 1, 1], [2.57, 0.3, 0.3], [4.1, 0.1, 0.15]],
} as const satisfies Record<string, PartialSet>;

export interface BellOpts {
  freq: number;
  partials?: PartialSet;
  decay?: number; // seconds for the fundamental (decayMul scales per partial)
  gain?: number;
  a?: number;
  strike?: number; // noise click amount
  beat?: number; // Hz of beating on the main partial (adds a detuned twin)
  bright?: number; // 0..1 tilt: scales upper partial amplitudes
  jitter?: number; // random detune fraction per partial (cosmetic)
  pan?: number;
  filter?: FilterOpts;
  maxPartials?: number;
}

export function bell(ctx: Ctx, dest: AudioNode, t: number, o: BellOpts): number {
  const bag = new Bag();
  const parts = o.partials ?? PARTIALS.glass;
  const decay = Math.max(0.02, o.decay ?? 1.5);
  const bright = o.bright ?? 1;
  const out = bag.add(ctx.createGain());
  const nodes: AudioNode[] = [out];
  if (o.filter) nodes.push(filter(ctx, bag, t, o.filter));
  nodes.push(tail(ctx, bag, dest, o.pan));
  chain(nodes);
  let sum = 0;
  for (const [, a] of parts) sum += a;
  const norm = (o.gain ?? 0.3) * (1.8 / Math.max(1, sum));
  let end = t;
  const limit = nyq(ctx) * 0.95;
  let count = 0;
  const maxP = o.maxPartials ?? 99;
  const main = Math.max(0, parts.findIndex((p) => p[0] === 1));
  for (let i = 0; i < parts.length && count < maxP; i++) {
    const [ratio, amp0, dm] = parts[i]!;
    const f = o.freq * ratio * (1 + (o.jitter ?? 0.002) * (rand() * 2 - 1));
    if (f > limit || f < 15) continue;
    count++;
    const amp = amp0 * (i === 0 ? 1 : Math.pow(bright, 0.5 + i * 0.25));
    const osc = bag.src(ctx.createOscillator());
    osc.frequency.value = f;
    const g = bag.add(ctx.createGain());
    const d = decay * dm;
    const e = adsr(g.gain, t, amp * norm, { a: o.a ?? 0.0025, d, s: 0, r: d * 0.3 });
    osc.connect(g).connect(out);
    end = Math.max(end, e);
    if (o.beat && i === main) {
      const twin = bag.src(ctx.createOscillator());
      twin.frequency.value = f + o.beat;
      const g2 = bag.add(ctx.createGain());
      adsr(g2.gain, t, amp * norm * 0.7, { a: o.a ?? 0.0025, d, s: 0, r: d * 0.3 });
      twin.connect(g2).connect(out);
    }
  }
  bag.run(t, end);
  if (o.strike) {
    noise(ctx, dest, t, {
      gain: o.strike,
      env: { a: 0.001, d: 0.025 },
      filter: { type: 'bandpass', freq: Math.min(o.freq * 3, 9000), q: 1.2 },
      pan: o.pan,
    });
  }
  return end;
}

// ---------------------------------------------------------------------------------------------
// Membrane drums (kick, toms, taiko, timpani): pitch-dropping body + click + noise skin
// ---------------------------------------------------------------------------------------------
export interface DrumOpts {
  freq: number; // settled body pitch
  from?: number; // start pitch multiplier
  drop?: number; // pitch drop time
  decay?: number;
  gain?: number;
  type?: OscillatorType;
  click?: number;
  noise?: number;
  noiseFreq?: number;
  noiseDecay?: number;
  noiseQ?: number;
  pan?: number;
}

export function drum(ctx: Ctx, dest: AudioNode, t: number, o: DrumOpts): number {
  const bag = new Bag();
  const osc = bag.src(ctx.createOscillator());
  osc.type = o.type ?? 'sine';
  const f = fclamp(ctx, o.freq);
  osc.frequency.setValueAtTime(fclamp(ctx, f * (o.from ?? 2.5)), t);
  osc.frequency.exponentialRampToValueAtTime(f, t + Math.max(0.005, o.drop ?? 0.05));
  const amp = bag.add(ctx.createGain());
  chain([osc, amp, tail(ctx, bag, dest, o.pan)]);
  const decay = o.decay ?? 0.35;
  let end = adsr(amp.gain, t, o.gain ?? 0.6, { a: 0.0015, d: decay, s: 0, r: 0.02 });
  bag.run(t, end);
  if (o.click) {
    noise(ctx, dest, t, { gain: o.click, env: { a: 0.001, d: 0.012 }, filter: { type: 'highpass', freq: 2500 }, pan: o.pan });
  }
  if (o.noise) {
    end = Math.max(end, noise(ctx, dest, t, {
      gain: o.noise,
      env: { a: 0.001, d: o.noiseDecay ?? decay * 0.4 },
      filter: { type: 'bandpass', freq: o.noiseFreq ?? 1200, q: o.noiseQ ?? 0.8 },
      pan: o.pan,
    }));
  }
  return end;
}

// ---------------------------------------------------------------------------------------------
// Formant voice (vowels): croaks, choirs, crowds, monster growls, System bell-babble
// ---------------------------------------------------------------------------------------------
export type Formants = readonly [number, number, number];
export const VOWELS: Record<'a' | 'e' | 'i' | 'o' | 'u' | 'ae' | 'er', Formants> = {
  a: [730, 1090, 2440],
  e: [530, 1840, 2480],
  i: [300, 2250, 3000],
  o: [570, 840, 2410],
  u: [320, 870, 2240],
  ae: [660, 1720, 2410],
  er: [490, 1350, 1690],
};

export interface VoiceOpts {
  freq: number;
  to?: number;
  glide?: number;
  glideDelay?: number;
  type?: OscillatorType;
  vowel: Formants;
  vowelTo?: Formants;
  morph?: number;
  formantShift?: number; // multiply all formants (small creatures > 1)
  q?: number;
  gain?: number;
  env?: Env;
  dur?: number;
  vib?: Lfo;
  am?: Lfo; // amplitude modulation (croak ratchet, laughter)
  breath?: number; // noise mixed into the source
  unison?: number;
  spread?: number;
  pan?: number;
}

export function voice(ctx: Ctx, dest: AudioNode, t: number, o: VoiceOpts): number {
  const bag = new Bag();
  const src = bag.add(ctx.createGain());
  const n = Math.max(1, o.unison ?? 1);
  src.gain.value = 1 / Math.sqrt(n);
  const oscs: OscillatorNode[] = [];
  const f0 = fclamp(ctx, o.freq);
  for (let i = 0; i < n; i++) {
    const osc = bag.src(ctx.createOscillator());
    osc.type = o.type ?? 'sawtooth';
    osc.frequency.setValueAtTime(f0, t);
    if (o.to !== undefined) {
      const st = t + (o.glideDelay ?? 0);
      if (st > t) osc.frequency.setValueAtTime(f0, st);
      osc.frequency.exponentialRampToValueAtTime(fclamp(ctx, o.to), st + Math.max(0.003, o.glide ?? 0.2));
    }
    osc.detune.value = n > 1 ? ((i / (n - 1)) * 2 - 1) * (o.spread ?? 15) : 0;
    osc.connect(src);
    oscs.push(osc);
  }
  if (o.vib) lfo(ctx, bag, t, oscs.map((x) => x.detune), o.vib);
  const amp = bag.add(ctx.createGain());
  const shift = o.formantShift ?? 1;
  const fg = [1, 0.55, 0.28];
  for (let k = 0; k < 3; k++) {
    const bp = bag.add(ctx.createBiquadFilter());
    bp.type = 'bandpass';
    bp.Q.value = (o.q ?? 9) * (1 + k * 0.3);
    const fa = fclamp(ctx, o.vowel[k]! * shift);
    bp.frequency.setValueAtTime(fa, t);
    if (o.vowelTo) bp.frequency.exponentialRampToValueAtTime(fclamp(ctx, o.vowelTo[k]! * shift), t + Math.max(0.01, o.morph ?? 0.2));
    const g = bag.add(ctx.createGain());
    g.gain.value = fg[k]! * 3.2;
    src.connect(bp).connect(g).connect(amp);
  }
  const outNodes: AudioNode[] = [amp];
  if (o.am) {
    const tr = bag.add(ctx.createGain());
    tr.gain.value = 1 - o.am.depth * 0.5;
    lfo(ctx, bag, t, [tr.gain], { ...o.am, depth: o.am.depth * 0.5 });
    outNodes.push(tr);
  }
  outNodes.push(tail(ctx, bag, dest, o.pan));
  chain(outNodes);
  const end = adsr(amp.gain, t, o.gain ?? 0.3, o.env ?? { a: 0.02, d: 0.2, s: 0.7, r: 0.1 }, o.dur);
  bag.run(t, end);
  if (o.breath) {
    noise(ctx, dest, t, {
      gain: o.breath,
      color: 'pink',
      env: o.env ?? { a: 0.02, d: 0.2, s: 0.7, r: 0.1 },
      dur: o.dur,
      filter: { type: 'bandpass', freq: o.vowel[1] * shift, q: 2 },
      pan: o.pan,
    });
  }
  return end;
}

// ---------------------------------------------------------------------------------------------
// Texture helpers
// ---------------------------------------------------------------------------------------------
/** A cloud of tiny random clicks/ticks (crackle, ice, paper, debris). */
export function crackle(ctx: Ctx, dest: AudioNode, t: number, o: { count: number; span: number; freq: number; spread?: number; gain?: number; decay?: number; q?: number; pan?: number; fade?: boolean }): number {
  let end = t;
  for (let i = 0; i < o.count; i++) {
    const k = rand();
    const dt = (o.fade ? k * k : k) * o.span;
    const f = o.freq * Math.pow(2, (rand() * 2 - 1) * (o.spread ?? 1));
    const g = (o.gain ?? 0.2) * (0.35 + 0.65 * rand()) * (o.fade ? 1 - dt / (o.span + 1e-3) * 0.7 : 1);
    end = Math.max(end, noise(ctx, dest, t + dt, {
      gain: g,
      env: { a: 0.0008, d: o.decay ?? 0.012 },
      filter: { type: 'bandpass', freq: f, q: o.q ?? 3 },
      pan: o.pan !== undefined ? clamp(o.pan + (rand() - 0.5) * 0.6, -1, 1) : (rand() - 0.5) * 0.8,
    }));
  }
  return end;
}

/** Reverse-style swell: filtered noise that crescendos into `t + len`. */
export function swell(ctx: Ctx, dest: AudioNode, t: number, o: { len: number; gain?: number; from?: number; to?: number; color?: NoiseColor; q?: number; pan?: number }): number {
  return noise(ctx, dest, t, {
    color: o.color ?? 'white',
    gain: o.gain ?? 0.2,
    env: { a: o.len, d: 0.05, s: 0, r: 0.04 },
    filter: { type: 'bandpass', freq: o.from ?? 400, to: o.to ?? 6000, time: o.len, q: o.q ?? 0.9 },
    pan: o.pan,
  });
}

// ---------------------------------------------------------------------------------------------
// Pure generators for the master chain
// ---------------------------------------------------------------------------------------------
/**
 * Stereo impulse response: early reflections + exponentially decaying noise that darkens over
 * time (high frequencies die first, like a real room).
 */
export function irData(sr: number, seconds: number, opts: { decay?: number; predelay?: number; brightness?: number; seed?: number } = {}): [Float32Array, Float32Array] {
  const len = Math.max(64, Math.floor(sr * seconds));
  const pre = Math.floor(sr * (opts.predelay ?? 0.012));
  const decay = opts.decay ?? 3;
  const bright = clamp(opts.brightness ?? 0.6, 0.05, 1);
  const pr = new Prng(opts.seed ?? 1234);
  const chans: [Float32Array, Float32Array] = [new Float32Array(len), new Float32Array(len)];
  for (let c = 0; c < 2; c++) {
    const d = chans[c]!;
    let y = 0;
    for (let i = pre; i < len; i++) {
      const x = (i - pre) / (len - pre);
      const env = Math.pow(1 - x, decay) * Math.exp(-x * 2);
      const k = lerp(0.2 + 0.75 * bright, 0.04 + 0.1 * bright, Math.sqrt(x));
      y += k * (pr.next() * 2 - 1 - y);
      d[i] = y * env * (1.4 - bright * 0.4);
    }
    // a handful of early reflections, different per ear
    for (let e = 0; e < 7; e++) {
      const at = pre + Math.floor(sr * (0.004 + pr.next() * 0.07));
      if (at < len) d[at] = d[at]! + (pr.next() < 0.5 ? -1 : 1) * (0.5 - e * 0.05);
    }
  }
  // normalise energy so wet level is predictable across sizes
  let e2 = 0;
  for (const d of chans) for (let i = 0; i < len; i++) e2 += d[i]! * d[i]!;
  const g = 1 / Math.sqrt(Math.max(1e-9, e2 / 2)) * 0.6;
  for (const d of chans) for (let i = 0; i < len; i++) d[i] = d[i]! * g;
  return chans;
}

/** Transparent below `knee`, smooth saturation above, never exceeds `ceil`. */
export function softClipCurve(n = 4096, knee = 0.82, ceil = 0.985): Float32Array<ArrayBuffer> {
  const c = new Float32Array(n);
  const room = ceil - knee;
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    const ax = Math.abs(x);
    const y = ax <= knee ? ax : knee + room * Math.tanh((ax - knee) / room);
    c[i] = Math.sign(x) * y;
  }
  return c;
}

/** Pure: RMS/peak/NaN/clip stats for a set of channels. RMS is over the audible region. */
export function analyse(chans: Float32Array[], sr: number, thresh = 1e-3): { peak: number; rms: number; nan: boolean; clipped: number; dur: number; start: number } {
  let peak = 0;
  let nan = false;
  let clipped = 0;
  let first = -1;
  let last = -1;
  for (const d of chans) {
    for (let i = 0; i < d.length; i++) {
      const v = d[i]!;
      if (!Number.isFinite(v)) {
        nan = true;
        continue;
      }
      const a = Math.abs(v);
      if (a > peak) peak = a;
      if (a >= 0.999) clipped++;
      if (a > thresh) {
        if (first < 0 || i < first) first = i;
        if (i > last) last = i;
      }
    }
  }
  let sum = 0;
  let cnt = 0;
  if (first >= 0) {
    for (const d of chans) {
      for (let i = first; i <= last; i++) {
        const v = d[i]!;
        if (Number.isFinite(v)) sum += v * v;
        cnt++;
      }
    }
  }
  return { peak, rms: cnt ? Math.sqrt(sum / cnt) : 0, nan, clipped, dur: first >= 0 ? (last - first) / sr : 0, start: Math.max(0, first) / sr };
}
