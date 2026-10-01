/**
 * Procedural music: a bar-granular lookahead sequencer driving named tracks. Each track has an
 * identity (key, mode, tempo, meter, instrumentation) and 3-4 intensity stems that crossfade with
 * setIntensity. Patterns are regenerated per bar from seeded PRNGs: motifs repeat across phrases
 * (so loops feel composed) while fills, ghost notes and voicings vary bar to bar.
 */
import {
  bell, clamp, crackle, drum, fm, hash32, mtof, noise, PARTIALS, pluck, Prng, smoothstep, swell, tone, VOWELS, voice,
  type Ctx, type Formants,
} from './synth.ts';

// =============================================================================================
// Theory (pure)
// =============================================================================================
export const MODES = {
  ionian: [0, 2, 4, 5, 7, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  aeolian: [0, 2, 3, 5, 7, 8, 10],
  harmonic: [0, 2, 3, 5, 7, 8, 11],
  pentatonic: [0, 2, 4, 7, 9],
  minpent: [0, 3, 5, 7, 10],
} as const;
export type ModeName = keyof typeof MODES;

const PC: Record<string, number> = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };
const QUALITIES: Record<string, readonly number[]> = {
  '': [0, 4, 7], m: [0, 3, 7], '5': [0, 7], dim: [0, 3, 6], aug: [0, 4, 8], sus2: [0, 2, 7], sus4: [0, 5, 7],
  '6': [0, 4, 7, 9], m6: [0, 3, 7, 9], '7': [0, 4, 7, 10], maj7: [0, 4, 7, 11], m7: [0, 3, 7, 10], m7b5: [0, 3, 6, 10],
  '9': [0, 4, 7, 10, 14], maj9: [0, 4, 7, 11, 14], m9: [0, 3, 7, 10, 14], add9: [0, 4, 7, 14], madd9: [0, 3, 7, 14],
  m11: [0, 3, 7, 10, 17], '13': [0, 4, 10, 14, 21], '7b9': [0, 4, 7, 10, 13], 'maj7#11': [0, 4, 7, 11, 18], '7sus4': [0, 5, 7, 10],
};

export interface Chord { symbol: string; root: number; bass: number; tones: readonly number[]; pcs: number[] }

export function parseChord(sym: string): Chord {
  const m = /^([A-G][#b]?)([^/]*)(?:\/([A-G][#b]?))?$/.exec(sym);
  if (!m) throw new Error(`bad chord "${sym}"`);
  const root = PC[m[1]!];
  const tones = QUALITIES[m[2]!];
  if (root === undefined || !tones) throw new Error(`unknown chord "${sym}"`);
  const bass = m[3] ? PC[m[3]] : root;
  if (bass === undefined) throw new Error(`bad bass in "${sym}"`);
  const pcs: number[] = [];
  for (const iv of tones) {
    const pc = (root + iv) % 12;
    if (!pcs.includes(pc)) pcs.push(pc);
  }
  return { symbol: sym, root, bass, tones, pcs };
}

const chordCache = new Map<string, Chord>();
export function chord(sym: string): Chord {
  let c = chordCache.get(sym);
  if (!c) chordCache.set(sym, (c = parseChord(sym)));
  return c;
}

/** Smallest midi >= lo with the given pitch class. */
export const pcAbove = (pc: number, lo: number): number => lo + ((((pc - lo) % 12) + 12) % 12);

/**
 * Close voicing of the chord starting at/above `low`, choosing the inversion whose centre is
 * nearest the previous voicing (smooth voice leading). `max` drops the fifth, then the root.
 */
export function voiceChord(ch: Chord, low: number, prev?: readonly number[], max = 4): number[] {
  let pcs = ch.pcs.slice();
  if (pcs.length > max) pcs = pcs.filter((pc) => pc !== (ch.root + 7) % 12);
  if (pcs.length > max) pcs = pcs.filter((pc) => pc !== ch.root);
  pcs = pcs.slice(0, max);
  const target = prev && prev.length ? prev.reduce((a, b) => a + b, 0) / prev.length : low + 7;
  let best: number[] = [];
  let bestScore = Infinity;
  for (let r = 0; r < pcs.length; r++) {
    const notes: number[] = [];
    let cur = low;
    for (let k = 0; k < pcs.length; k++) {
      const n = pcAbove(pcs[(r + k) % pcs.length]!, k === 0 ? cur : cur + 1);
      notes.push(n);
      cur = n;
    }
    const mean = notes.reduce((a, b) => a + b, 0) / notes.length;
    const score = Math.abs(mean - target) + (notes[notes.length - 1]! - notes[0]!) * 0.05;
    if (score < bestScore) {
      bestScore = score;
      best = notes;
    }
  }
  return best;
}

export function chordTones(ch: Chord, lo: number, hi: number): number[] {
  const out: number[] = [];
  for (let m = lo; m <= hi; m++) if (ch.pcs.includes(((m % 12) + 12) % 12)) out.push(m);
  return out;
}

export function scaleNotes(keyPc: number, mode: readonly number[], lo: number, hi: number): number[] {
  const out: number[] = [];
  for (let m = lo; m <= hi; m++) if (mode.includes((((m - keyPc) % 12) + 12) % 12)) out.push(m);
  return out;
}

export const bassNote = (ch: Chord, lo: number): number => pcAbove(ch.bass, lo);
export const rootNote = (ch: Chord, lo: number): number => pcAbove(ch.root, lo);

function nearestIdx(arr: readonly number[], v: number): number {
  let bi = 0;
  let bd = Infinity;
  for (let i = 0; i < arr.length; i++) {
    const d = Math.abs(arr[i]! - v);
    if (d < bd) {
      bd = d;
      bi = i;
    }
  }
  return bi;
}

/** Swing warp: moves off-beat 8ths later by `sw` (0 straight .. 1 full triplet). */
export function swingBeat(beat: number, sw: number): number {
  if (!sw) return beat;
  const w = Math.floor(beat);
  const f = beat - w;
  const mid = 0.5 + sw / 6;
  return w + (f <= 0.5 ? (f / 0.5) * mid : mid + ((f - 0.5) / 0.5) * (1 - mid));
}

// =============================================================================================
// Track & bar model
// =============================================================================================
export interface Bar {
  ctx: Ctx;
  t0: number;
  spb: number; // seconds per beat
  beats: number;
  index: number;
  pos: number; // bar within the 4-bar phrase
  phrase: number;
  section: number; // 8-bar section
  chord: Chord;
  next: Chord;
  key: number;
  mode: readonly number[];
  rng: Prng; // unique per bar
  motif(k: string | number): Prng; // stable per key: repeating material
  at(beat: number): number;
  dur(beats: number): number;
  intensity: number;
  state: Record<string, number[] | number | undefined>;
}

export interface StemDef { name: string; rev?: number; dly?: number; gain?: number }
export interface TrackDef {
  name: string;
  title: string;
  mood: string;
  bpm: number;
  beats: number;
  key: string;
  mode: ModeName;
  swing?: number;
  progs: readonly (readonly string[])[];
  stems: readonly StemDef[];
  layers?: readonly number[]; // intensity at which each stem is fully in
  gain?: number;
  delayBeats?: number;
  parts: readonly ((b: Bar, d: AudioNode) => void)[];
}

// =============================================================================================
// Instruments (thin musical wrappers over synth voices)
// =============================================================================================
type D = AudioNode;
const hzOf = mtof;

function iPad(c: Ctx, d: D, t: number, dur: number, notes: readonly number[], o: { gain?: number; cutoff?: number; to?: number; a?: number; r?: number; type?: OscillatorType; unison?: number; spread?: number } = {}): void {
  for (const n of notes) {
    tone(c, d, t, { type: o.type ?? 'sawtooth', unison: o.unison ?? 2, spread: o.spread ?? 14, freq: hzOf(n), gain: o.gain ?? 0.035, dur, env: { a: o.a ?? 0.5, d: 0.4, s: 0.85, r: o.r ?? 1 }, filter: { freq: o.cutoff ?? 1100, to: o.to, time: dur, q: 0.3 } });
  }
}
function iSoftPad(c: Ctx, d: D, t: number, dur: number, notes: readonly number[], o: { gain?: number; a?: number; r?: number; trem?: number } = {}): void {
  for (const n of notes) {
    tone(c, d, t, { type: 'triangle', freq: hzOf(n), gain: o.gain ?? 0.04, dur, env: { a: o.a ?? 0.6, d: 0.3, s: 0.9, r: o.r ?? 1.2 }, trem: o.trem ? { rate: o.trem, depth: 0.3 } : undefined, detune: (n % 3) - 1 });
  }
}
function iBass(c: Ctx, d: D, t: number, dur: number, n: number, o: { gain?: number; bright?: number } = {}): void {
  const g = o.gain ?? 0.2;
  tone(c, d, t, { freq: hzOf(n), gain: g, dur, env: { a: 0.008, d: 0.25, s: 0.75, r: 0.12 } });
  tone(c, d, t, { type: 'sawtooth', freq: hzOf(n), gain: g * 0.35, dur, env: { a: 0.008, d: 0.2, s: 0.6, r: 0.1 }, filter: { freq: 220 + 900 * (o.bright ?? 0.2), env: { peak: 500 + 2000 * (o.bright ?? 0.2), d: 0.15 } } });
}
function iSub(c: Ctx, d: D, t: number, dur: number, n: number, g = 0.2): void {
  tone(c, d, t, { freq: hzOf(n), gain: g, dur, env: { a: 0.1, d: 0.3, s: 0.9, r: 0.4 } });
}
function iPluck(c: Ctx, d: D, t: number, n: number, o: { gain?: number; decay?: number; bright?: number; dur?: number; pan?: number } = {}): void {
  pluck(c, d, t, { freq: hzOf(n), gain: o.gain ?? 0.25, decay: o.decay ?? 1, bright: o.bright ?? 0.5, dur: o.dur, pan: o.pan });
}
function iEp(c: Ctx, d: D, t: number, dur: number, n: number, g = 0.08): void {
  fm(c, d, t, { freq: hzOf(n), ratio: 1, index: 1.6, indexTo: 0.25, indexTime: 0.9, gain: g, dur, env: { a: 0.003, d: 1.4, s: 0.35, r: 0.3 } });
  tone(c, d, t, { freq: hzOf(n) * 4, gain: g * 0.12, env: { a: 0.002, d: 0.15 } });
}
function iMallet(c: Ctx, d: D, t: number, n: number, kind: 'marimba' | 'vibe' | 'glock' | 'celesta' | 'glass' | 'musicbox', o: { gain?: number; decay?: number; pan?: number } = {}): void {
  const decays = { marimba: 0.6, vibe: 1.6, glock: 1.4, celesta: 1.1, glass: 1.8, musicbox: 0.9 };
  bell(c, d, t, { freq: hzOf(n), partials: PARTIALS[kind], decay: o.decay ?? decays[kind], gain: o.gain ?? 0.12, a: kind === 'marimba' ? 0.004 : 0.002, pan: o.pan, jitter: 0.001 });
}
function iLead(c: Ctx, d: D, t: number, dur: number, n: number, o: { gain?: number; type?: OscillatorType; a?: number; r?: number; cutoff?: number; vib?: number } = {}): void {
  tone(c, d, t, { type: o.type ?? 'triangle', freq: hzOf(n), gain: o.gain ?? 0.08, dur, env: { a: o.a ?? 0.03, d: 0.2, s: 0.75, r: o.r ?? 0.25 }, vib: { rate: 5.2, depth: o.vib ?? 12, delay: 0.25 }, filter: o.cutoff ? { freq: o.cutoff } : undefined });
}
function iFlute(c: Ctx, d: D, t: number, dur: number, n: number, g = 0.07): void {
  const f = hzOf(n);
  tone(c, d, t, { freq: f, gain: g, dur, env: { a: 0.09, d: 0.2, s: 0.8, r: 0.3 }, vib: { rate: 4.8, depth: 14, delay: 0.3 } });
  tone(c, d, t, { type: 'triangle', freq: f * 2, gain: g * 0.12, dur, env: { a: 0.12, d: 0.2, s: 0.7, r: 0.3 } });
  noise(c, d, t, { color: 'pink', gain: g * 0.35, dur, env: { a: 0.05, d: 0.15, s: 0.3, r: 0.2 }, filter: { type: 'bandpass', freq: Math.min(f * 2, 9000), q: 3 } });
}
function iBrass(c: Ctx, d: D, t: number, dur: number, n: number, o: { gain?: number; bright?: number; a?: number } = {}): void {
  const b = o.bright ?? 0.5;
  tone(c, d, t, { type: 'sawtooth', unison: 3, spread: 10, freq: hzOf(n), gain: o.gain ?? 0.06, dur, env: { a: o.a ?? 0.04, d: 0.25, s: 0.75, r: 0.2 }, filter: { freq: 500 + 1400 * b, env: { peak: 1200 + 3500 * b, a: 0.04, d: 0.3 }, q: 1 } });
}
function iStrings(c: Ctx, d: D, t: number, dur: number, notes: readonly number[], o: { gain?: number; a?: number; trem?: number; cutoff?: number } = {}): void {
  for (const n of notes) tone(c, d, t, { type: 'sawtooth', unison: 3, spread: 18, freq: hzOf(n), gain: o.gain ?? 0.03, dur, env: { a: o.a ?? 0.35, d: 0.3, s: 0.85, r: 0.5 }, filter: { freq: o.cutoff ?? 2400, q: 0.3 }, trem: o.trem ? { rate: o.trem, depth: 0.85 } : undefined, vib: { rate: 5, depth: 8, delay: 0.3 } });
}
function iChoir(c: Ctx, d: D, t: number, dur: number, notes: readonly number[], o: { gain?: number; vowel?: Formants; vowelTo?: Formants; a?: number } = {}): void {
  for (const n of notes) voice(c, d, t, { freq: hzOf(n), vowel: o.vowel ?? VOWELS.a, vowelTo: o.vowelTo, morph: dur, q: 8, unison: 3, spread: 16, gain: o.gain ?? 0.05, dur, env: { a: o.a ?? 0.5, d: 0.3, s: 0.9, r: 0.9 }, vib: { rate: 5, depth: 14, delay: 0.4 } });
}
function iOrgan(c: Ctx, d: D, t: number, dur: number, n: number, g = 0.04): void {
  [1, 2, 3, 4].forEach((h, i) => tone(c, d, t, { freq: hzOf(n) * h, gain: g * [1, 0.6, 0.3, 0.25][i]!, dur, env: { a: 0.02, d: 0.1, s: 1, r: 0.15 } }));
}

// drums
const kick = (c: Ctx, d: D, t: number, g = 0.5) => drum(c, d, t, { freq: 48, from: 3, drop: 0.05, decay: 0.34, gain: g, click: g * 0.12 });
const softKick = (c: Ctx, d: D, t: number, g = 0.35) => drum(c, d, t, { freq: 55, from: 2, drop: 0.04, decay: 0.25, gain: g });
const snare = (c: Ctx, d: D, t: number, g = 0.25) => drum(c, d, t, { type: 'triangle', freq: 185, from: 1.5, drop: 0.02, decay: 0.1, gain: g * 0.6, noise: g, noiseFreq: 2400, noiseDecay: 0.16, noiseQ: 0.6 });
const brush = (c: Ctx, d: D, t: number, g = 0.12) => noise(c, d, t, { color: 'pink', gain: g, env: { a: 0.02, d: 0.16 }, filter: { type: 'bandpass', freq: 2800, q: 0.6 } });
const hat = (c: Ctx, d: D, t: number, g = 0.08, open = false) => noise(c, d, t, { gain: g, env: { a: 0.001, d: open ? 0.25 : 0.035 }, filter: { type: 'highpass', freq: 7200 } });
const shaker = (c: Ctx, d: D, t: number, g = 0.05) => noise(c, d, t, { gain: g, env: { a: 0.012, d: 0.05 }, filter: { type: 'bandpass', freq: 6200, q: 1.2 } });
const clap = (c: Ctx, d: D, t: number, g = 0.2) => {
  for (let i = 0; i < 3; i++) noise(c, d, t + i * 0.011, { gain: g * (i === 2 ? 1 : 0.6), env: { a: 0.001, d: i === 2 ? 0.14 : 0.012 }, filter: { type: 'bandpass', freq: 1200, q: 1.4 } });
};
const rim = (c: Ctx, d: D, t: number, g = 0.12) => bell(c, d, t, { freq: 1700, partials: PARTIALS.wood, decay: 0.035, gain: g });
const tick = (c: Ctx, d: D, t: number, g = 0.08) => noise(c, d, t, { gain: g, env: { a: 0.0008, d: 0.01 }, filter: { type: 'bandpass', freq: 3600, q: 5 } });
const tock = (c: Ctx, d: D, t: number, g = 0.12) => bell(c, d, t, { freq: 880, partials: PARTIALS.wood, decay: 0.05, gain: g });
const woodblock = (c: Ctx, d: D, t: number, f = 800, g = 0.12) => bell(c, d, t, { freq: f, partials: PARTIALS.wood, decay: 0.07, gain: g });
const tom = (c: Ctx, d: D, t: number, f = 110, g = 0.35) => drum(c, d, t, { freq: f, from: 1.6, decay: 0.35, gain: g, noise: g * 0.2, noiseFreq: 900 });
const taiko = (c: Ctx, d: D, t: number, g = 0.55, f = 68) => drum(c, d, t, { freq: f, from: 1.8, drop: 0.05, decay: 0.6, gain: g, noise: g * 0.35, noiseFreq: 500, noiseDecay: 0.15, click: g * 0.05 });
const timpani = (c: Ctx, d: D, t: number, n: number, g = 0.35) => drum(c, d, t, { freq: hzOf(n), from: 1.08, drop: 0.08, decay: 1.2, gain: g, noise: g * 0.15, noiseFreq: 300 });
const crash = (c: Ctx, d: D, t: number, g = 0.12) => {
  noise(c, d, t, { gain: g, env: { a: 0.002, d: 1.8 }, filter: { type: 'highpass', freq: 4000 } });
  bell(c, d, t, { freq: 420, partials: PARTIALS.metal, decay: 1.2, gain: g * 0.3 });
};
const ride = (c: Ctx, d: D, t: number, g = 0.05) => {
  bell(c, d, t, { freq: 3100, partials: PARTIALS.metal, decay: 0.5, gain: g });
  noise(c, d, t, { gain: g * 0.6, env: { a: 0.001, d: 0.25 }, filter: { type: 'highpass', freq: 8000 } });
};
const triDing = (c: Ctx, d: D, t: number, g = 0.05) => bell(c, d, t, { freq: 4186, partials: PARTIALS.glass, decay: 1.5, gain: g });

// =============================================================================================
// Pattern helpers
// =============================================================================================
type Cell = readonly (readonly [number, number])[];
const R4: readonly Cell[] = [
  [[0, 1], [1, 0.5], [1.5, 0.5], [2, 2]],
  [[0, 1.5], [1.5, 0.5], [2, 1], [3, 1]],
  [[0, 0.5], [0.5, 0.5], [1, 1], [2, 1.5], [3.5, 0.5]],
  [[0, 2], [2, 1], [3, 1]],
  [[0.5, 0.5], [1, 0.5], [1.5, 1.5], [3, 1]],
  [[0, 1], [1, 1], [2, 1], [3, 1]],
];
const R4_SLOW: readonly Cell[] = [[[0, 2], [2, 2]], [[0, 3], [3, 1]], [[0, 1.5], [1.5, 2.5]], [[1, 3]], [[0, 4]]];
const R4_END: readonly Cell[] = [[[0, 4]], [[0, 3], [3, 1]], [[0, 2], [2, 2]], [[0, 1], [1, 3]]];
const R3: readonly Cell[] = [
  [[0, 1], [1, 1], [2, 1]],
  [[0, 2], [2, 1]],
  [[0, 1.5], [1.5, 0.5], [2, 1]],
  [[0, 0.5], [0.5, 0.5], [1, 2]],
  [[0, 1], [1, 0.5], [1.5, 0.5], [2, 1]],
];
const R3_END: readonly Cell[] = [[[0, 3]], [[0, 2], [2, 1]]];
const R_STACC: readonly Cell[] = [
  [[0, 0.5], [0.5, 0.5], [1.5, 0.5], [2, 0.5], [3, 0.5]],
  [[0, 0.5], [1, 0.5], [1.5, 0.5], [2.5, 0.5], [3, 0.5], [3.5, 0.5]],
  [[0, 0.5], [0.5, 0.5], [1, 0.5], [2, 1], [3, 0.5]],
  [[0.5, 0.5], [1, 0.5], [2, 0.5], [2.5, 0.5], [3.5, 0.5]],
];

interface Note { beat: number; len: number; midi: number }

/**
 * Motif-driven melody: rhythm and contour come from PRNGs keyed on (section parity, bar-in-
 * phrase), so phrases repeat with variation every 8 bars; strong beats snap to chord tones.
 */
function melody(b: Bar, key: string, lo: number, hi: number, cells: readonly Cell[], endCells: readonly Cell[], o: { leap?: number; rest?: number } = {}): Note[] {
  const sec = b.section % 2;
  const isEnd = b.pos === 3;
  const rm = b.motif(`${key}:r:${sec}:${b.pos % 2}:${isEnd ? 'e' : ''}`);
  const cell = isEnd ? rm.pick(endCells) : rm.pick(cells);
  const pm = b.motif(`${key}:p:${sec}:${b.pos}`);
  const scale = scaleNotes(b.key, b.mode, lo, hi);
  const ct = chordTones(b.chord, lo, hi);
  if (!scale.length || !ct.length) return [];
  const center = lo + (hi - lo) * pm.range(0.35, 0.7);
  let idx = nearestIdx(scale, ct[nearestIdx(ct, center)]!);
  const out: Note[] = [];
  for (let i = 0; i < cell.length; i++) {
    const [beat, len] = cell[i]!;
    if (i > 0) {
      const step = pm.chance(o.leap ?? 0.2) ? pm.pick([-3, 3, -4, 4]) : pm.pick([-2, -1, -1, 1, 1, 2]);
      idx = clamp(idx + step, 0, scale.length - 1);
    }
    let m = scale[idx]!;
    const strong = beat % 1 === 0 && (beat % 2 === 0 || len >= 1.5);
    if (strong || (isEnd && i === cell.length - 1)) {
      m = ct[nearestIdx(ct, m)]!;
      idx = nearestIdx(scale, m);
    }
    if (i > 0 && pm.chance(o.rest ?? 0.08)) continue;
    out.push({ beat, len, midi: m });
  }
  return out;
}

/** Fisher-Yates-free arpeggio index patterns */
const ARPS: readonly ((i: number, n: number) => number)[] = [
  (i, n) => i % n, // up
  (i, n) => { const p = 2 * n - 2; const k = i % Math.max(1, p); return k < n ? k : p - k; }, // up-down
  (i, n) => (i * 2) % n, // skip
  (i, n) => (i % 2 === 0 ? Math.floor(i / 2) % n : Math.min(n - 1, (Math.floor(i / 2) + 2) % n)), // broken
];

// =============================================================================================
// Tracks
// =============================================================================================
const TR: TrackDef[] = [];

// ---- TITLE: wistful awe, rising arps + pad (D major / B minor, 76) ----------------------------
TR.push({
  name: 'title', title: 'Wicks Remember', mood: 'wistful awe · rising arps', bpm: 76, beats: 4, key: 'D', mode: 'ionian',
  progs: [['Bm9', 'Gmaj9', 'D/F#', 'Asus4'], ['Gmaj7#11', 'D/F#', 'Em9', 'Asus4'], ['Bm9', 'Gmaj9', 'Em9', 'A']],
  stems: [{ name: 'pad', rev: 0.55 }, { name: 'arps', rev: 0.35, dly: 0.35 }, { name: 'melody', rev: 0.55, dly: 0.25 }, { name: 'pulse', rev: 0.25 }],
  parts: [
    (b, d) => {
      const v = voiceChord(b.chord, 57, b.state.pad as number[] | undefined, 4);
      b.state.pad = v;
      iPad(b.ctx, d, b.t0, b.dur(4), v, { gain: 0.032, cutoff: 900, to: 1500, a: 1.4, r: 2 });
      iBass(b.ctx, d, b.t0, b.dur(3.8), bassNote(b.chord, 38), { gain: 0.17 });
    },
    (b, d) => {
      const notes = chordTones(b.chord, 62, 88);
      const pat = ARPS[b.motif(`arp${b.section % 2}:${b.pos}`).int(0, 1)]!;
      for (let i = 0; i < 16; i++) {
        const half = i >> 3;
        const k = i & 7;
        const n = notes[Math.min(notes.length - 1, pat(k + half * 2, notes.length))]!;
        iPluck(b.ctx, d, b.at(i * 0.25), n, { gain: 0.07 + k * 0.012, decay: 1.4, bright: 0.55, pan: (k / 7 - 0.5) * 0.7 });
      }
    },
    (b, d) => {
      for (const nt of melody(b, 'mel', 69, 86, R4_SLOW, R4_END, { leap: 0.3 })) {
        iLead(b.ctx, d, b.at(nt.beat), b.dur(nt.len * 0.95), nt.midi, { gain: 0.075, type: 'sine', a: 0.12, r: 0.8, vib: 16 });
        iLead(b.ctx, d, b.at(nt.beat), b.dur(nt.len * 0.95), nt.midi + 12, { gain: 0.012, type: 'triangle', a: 0.2, r: 0.8 });
      }
    },
    (b, d) => {
      softKick(b.ctx, d, b.at(0), 0.32);
      softKick(b.ctx, d, b.at(2.5), 0.18);
      for (let i = 0; i < 8; i++) shaker(b.ctx, d, b.at(i * 0.5), i % 2 ? 0.035 : 0.022);
      if (b.pos === 0) { timpani(b.ctx, d, b.at(0), rootNote(b.chord, 38), 0.3); triDing(b.ctx, d, b.at(0), 0.035); }
      if (b.pos === 3) swell(b.ctx, d, b.at(2), { len: b.dur(2), gain: 0.07, from: 500, to: 7000 });
    },
  ],
});

// ---- LANDING: cozy hub waltz in 3/4 (GDD 15.2: F major, 96, I-vi-IV-V) -----------------------
TR.push({
  name: 'landing', title: 'The Landing Waltz', mood: 'cozy hub · plucks & soft bass', bpm: 96, beats: 3, key: 'F', mode: 'ionian',
  progs: [['F', 'Dm7', 'Bbmaj7', 'C7'], ['F', 'F/A', 'Bb', 'C'], ['Dm7', 'Gm7', 'C7', 'F'], ['Bb', 'C', 'Am7', 'Dm7'], ['Gm7', 'C7', 'F', 'F']],
  stems: [{ name: 'waltz', rev: 0.25 }, { name: 'music box', rev: 0.4, dly: 0.2 }, { name: 'flute', rev: 0.4 }, { name: 'brushes', rev: 0.2 }],
  parts: [
    (b, d) => {
      const bn = b.index % 2 === 0 ? bassNote(b.chord, 40) : pcAbove((b.chord.root + 7) % 12, 40);
      iPluck(b.ctx, d, b.at(0), bn, { gain: 0.34, decay: 1.4, bright: 0.2 });
      iSub(b.ctx, d, b.at(0), b.dur(0.9), bn, 0.1);
      const v = voiceChord(b.chord, 57, b.state.v as number[] | undefined, 3);
      b.state.v = v;
      for (const bt of [1, 2]) v.forEach((n, i) => iPluck(b.ctx, d, b.at(bt) + i * 0.008, n, { gain: 0.085, decay: 0.45, bright: 0.45, pan: (i - 1) * 0.3 }));
      for (const n of v) iOrgan(b.ctx, d, b.t0, b.dur(2.9), n - 12, 0.008);
    },
    (b, d) => {
      for (const nt of melody(b, 'box', 72, 89, R3, R3_END)) iMallet(b.ctx, d, b.at(nt.beat), nt.midi, 'musicbox', { gain: 0.13 });
    },
    (b, d) => {
      const m = b.motif(`fl:${b.section % 2}:${b.pos}`);
      const ct = chordTones(b.chord, 64, 79);
      const n = ct[m.int(0, ct.length - 1)]!;
      iFlute(b.ctx, d, b.at(0), b.dur(2.7), n, 0.06);
    },
    (b, d) => {
      softKick(b.ctx, d, b.at(0), 0.26);
      brush(b.ctx, d, b.at(1), 0.07);
      brush(b.ctx, d, b.at(2), 0.06);
      for (let i = 0; i < 6; i++) shaker(b.ctx, d, b.at(i * 0.5), i % 2 ? 0.022 : 0.034);
      if (b.rng.chance(0.3)) rim(b.ctx, d, b.at(2.5), 0.06);
      if (b.pos === 0 && b.phrase % 2 === 0) triDing(b.ctx, d, b.at(0), 0.035);
    },
  ],
});

// ---- SHOP: lounge, jazzy ii-V-I, swung (F major, 90) ------------------------------------------
TR.push({
  name: 'shop', title: "Old Tallow's Lounge", mood: 'lounge · jazzy chords', bpm: 90, beats: 4, key: 'F', mode: 'ionian', swing: 0.65,
  progs: [['Gm9', 'C13', 'Fmaj9', 'Dm9'], ['Bbmaj7', 'Am7', 'Gm9', 'C7b9'], ['Fmaj9', 'D7b9', 'Gm9', 'C13']],
  stems: [{ name: 'keys & bass', rev: 0.3 }, { name: 'brushes', rev: 0.2 }, { name: 'vibes', rev: 0.4, dly: 0.15 }, { name: 'wah horn', rev: 0.35 }],
  parts: [
    (b, d) => {
      const v = voiceChord(b.chord, 55, b.state.v as number[] | undefined, 4);
      b.state.v = v;
      const comp = b.motif(`comp:${b.pos % 2}:${b.section % 2}`).pick([[[0, 1.4], [2.5, 1]], [[0.5, 1], [2, 0.5], [3.5, 0.5]], [[0, 0.5], [1.5, 2]], [[0, 2], [3.5, 0.5]]] as const);
      for (const [bt, ln] of comp) v.forEach((n) => iEp(b.ctx, d, b.at(bt), b.dur(ln), n, 0.045));
      // walking bass: root, chord tone, chord tone, chromatic approach to next root
      const r = rootNote(b.chord, 36);
      const ct = chordTones(b.chord, r + 1, r + 12);
      const nr = rootNote(b.next, 36);
      const walk = [r, ct[b.rng.int(0, Math.min(1, ct.length - 1))]!, ct[Math.min(ct.length - 1, b.rng.int(1, 2))]!, nr + (b.rng.chance(0.5) ? 1 : -1)];
      walk.forEach((n, i) => iPluck(b.ctx, d, b.at(i), n, { gain: 0.36, decay: 0.9, bright: 0.18, dur: b.dur(0.9) }));
    },
    (b, d) => {
      for (const bt of [0, 1, 1.5, 2, 3, 3.5]) ride(b.ctx, d, b.at(bt), bt % 1 ? 0.03 : 0.045);
      brush(b.ctx, d, b.at(1), 0.08);
      brush(b.ctx, d, b.at(3), 0.08);
      softKick(b.ctx, d, b.at(0), 0.2);
      if (b.rng.chance(0.5)) softKick(b.ctx, d, b.at(2.5), 0.12);
    },
    (b, d) => {
      for (const nt of melody(b, 'vib', 70, 86, R4, R4_END, { rest: 0.15 })) {
        bell(b.ctx, d, b.at(nt.beat), { freq: hzOf(nt.midi), partials: PARTIALS.vibe, decay: 1.4, gain: 0.1 });
      }
    },
    (b, d) => {
      if (b.pos % 2 === 1 || b.rng.chance(0.3)) {
        const ct = chordTones(b.chord, 60, 72);
        const n = ct[b.motif(`horn:${b.pos}`).int(0, ct.length - 1)]!;
        voice(b.ctx, d, b.at(2), { freq: hzOf(n), vowel: VOWELS.u, vowelTo: VOWELS.a, morph: b.dur(0.6), q: 7, gain: 0.07, dur: b.dur(1.6), env: { a: 0.05, d: 0.2, s: 0.8, r: 0.25 }, vib: { rate: 5, depth: 14, delay: 0.3 } });
      }
    },
  ],
});

// ---- MINIGAME: playful staccato (C major, 132) ------------------------------------------------
TR.push({
  name: 'minigame', title: 'Bouncy Business', mood: 'playful staccato', bpm: 132, beats: 4, key: 'C', mode: 'ionian',
  progs: [['C', 'Am', 'F', 'G'], ['C', 'E7', 'Am', 'F'], ['F', 'G', 'Em', 'Am'], ['Dm7', 'G7', 'C', 'C']],
  stems: [{ name: 'bounce', rev: 0.12 }, { name: 'pizz', rev: 0.2 }, { name: 'lead', rev: 0.2, dly: 0.2 }, { name: 'toys', rev: 0.15 }],
  layers: [0, 0.2, 0.45, 0.7],
  parts: [
    (b, d) => {
      const r = rootNote(b.chord, 36);
      for (let i = 0; i < 8; i++) {
        const n = i % 2 ? r + 12 : r;
        tone(b.ctx, d, b.at(i * 0.5), { type: 'square', freq: hzOf(n), gain: 0.07, dur: b.dur(0.22), env: { a: 0.003, d: 0.08, s: 0.6, r: 0.03 }, filter: { freq: 700, env: { peak: 1800, d: 0.08 } } });
      }
      clap(b.ctx, d, b.at(1), 0.14);
      clap(b.ctx, d, b.at(3), 0.14);
    },
    (b, d) => {
      const v = voiceChord(b.chord, 60, b.state.v as number[] | undefined, 3);
      b.state.v = v;
      for (const bt of [0.5, 1.5, 2.5, 3.5]) v.forEach((n) => iPluck(b.ctx, d, b.at(bt), n, { gain: 0.09, decay: 0.22, bright: 0.65 }));
    },
    (b, d) => {
      for (const nt of melody(b, 'lead', 72, 88, R_STACC, R4_END, { leap: 0.35 })) {
        tone(b.ctx, d, b.at(nt.beat), { type: 'square', freq: hzOf(nt.midi), gain: 0.045, dur: Math.min(b.dur(nt.len) * 0.5, 0.2), env: { a: 0.002, d: 0.05, s: 0.7, r: 0.04 }, filter: { freq: 3200 } });
      }
    },
    (b, d) => {
      for (let i = 0; i < 4; i++) kick(b.ctx, d, b.at(i), 0.34);
      const m = b.motif(`wb:${b.pos % 2}`);
      for (let i = 0; i < 16; i++) if (m.chance(0.28)) woodblock(b.ctx, d, b.at(i * 0.25), i % 4 === 2 ? 1100 : 800, 0.07);
      if (b.pos === 0) triDing(b.ctx, d, b.at(0), 0.04);
      if (b.pos === 3 && b.rng.chance(0.6)) tone(b.ctx, d, b.at(3), { freq: 700, to: 1800, glide: b.dur(0.9), gain: 0.04, dur: b.dur(0.9), env: { a: 0.02, d: 0.1, s: 1, r: 0.05 }, vib: { rate: 7, depth: 30 } });
    },
  ],
});

// ---- ROOM TENSION: low pulse, ostinato, sparse percussion (D phrygian, 92) --------------------
TR.push({
  name: 'room_tension', title: 'Held Breath', mood: 'tense · low pulse & ostinato', bpm: 92, beats: 4, key: 'D', mode: 'phrygian',
  progs: [['Dm', 'Eb/D', 'Dm', 'Eb/D'], ['Dmadd9', 'Bbmaj7/D', 'Gm/D', 'Eb/D'], ['Dm', 'Cm/D', 'Bbmaj7/D', 'Eb/D']],
  stems: [{ name: 'drone', rev: 0.4 }, { name: 'ostinato', rev: 0.25, dly: 0.12 }, { name: 'percussion', rev: 0.4 }, { name: 'strings', rev: 0.5 }],
  parts: [
    (b, d) => {
      iPad(b.ctx, d, b.t0, b.dur(4), [38, 45], { gain: 0.05, cutoff: 280, to: 520, a: 0.8, r: 1.2, unison: 3, spread: 10 });
      iSub(b.ctx, d, b.t0, b.dur(4), 26, 0.14);
      softKick(b.ctx, d, b.at(0), 0.3);
      softKick(b.ctx, d, b.at(0.4), 0.18);
    },
    (b, d) => {
      const sc = scaleNotes(b.key, b.mode, 50, 65);
      const base = b.motif(`ost:${b.section % 2}`).pick([[0, 0, 1, 0, 4, 0, 1, 2], [0, 1, 0, 2, 0, 1, 0, 4], [0, 0, 1, 0, 0, 2, 1, 0]] as const);
      for (let i = 0; i < 8; i++) {
        let s = base[i]!;
        if (b.rng.chance(0.12)) s += b.rng.pick([1, -1, 7]);
        const n = sc[clamp(s, 0, sc.length - 1)]!;
        iPluck(b.ctx, d, b.at(i * 0.5), n, { gain: i % 2 ? 0.14 : 0.2, decay: 0.4, bright: 0.28, dur: b.dur(0.4) });
      }
    },
    (b, d) => {
      if (b.pos % 2 === 0) taiko(b.ctx, d, b.at(0), 0.4);
      if (b.rng.chance(0.45)) tom(b.ctx, d, b.at(2.5), 90, 0.22);
      for (let i = 0; i < 16; i++) {
        tick(b.ctx, d, b.at(i * 0.25), i % 4 === 0 ? 0.045 : 0.02);
        if (b.rng.chance(0.08)) rim(b.ctx, d, b.at(i * 0.25), 0.09);
      }
      if (b.pos === 3) swell(b.ctx, d, b.at(2), { len: b.dur(2), gain: 0.08, from: 300, to: 4000 });
    },
    (b, d) => {
      const pair = b.motif(`str:${b.pos % 2}`).pick([[69, 70], [74, 75], [62, 63]] as const);
      iStrings(b.ctx, d, b.t0, b.dur(4), pair, { gain: 0.022, a: 1.5, trem: 7.5, cutoff: 2600 });
      if (b.rng.chance(0.25)) bell(b.ctx, d, b.at(b.rng.pick([1, 2, 3])), { freq: hzOf(b.rng.pick([87, 88, 82])), partials: PARTIALS.glass, decay: 2, gain: 0.04 });
    },
  ],
});

// ---- ROOM PUZZLE: curious, mallets, ticking (F lydian, 100) -----------------------------------
TR.push({
  name: 'room_puzzle', title: 'Clockwork Curiosity', mood: 'curious · mallets & ticking', bpm: 100, beats: 4, key: 'F', mode: 'lydian',
  progs: [['Fmaj7#11', 'G/F', 'Em7', 'Am7'], ['Dm9', 'G', 'Fmaj7', 'Esus4'], ['Fmaj7#11', 'Am7', 'G/F', 'Cmaj7']],
  stems: [{ name: 'clock', rev: 0.25 }, { name: 'marimba', rev: 0.3 }, { name: 'pizz & glock', rev: 0.4, dly: 0.2 }, { name: 'brushes', rev: 0.2 }],
  parts: [
    (b, d) => {
      for (let i = 0; i < 8; i++) (i % 2 ? tick : tock)(b.ctx, d, b.at(i * 0.5), i % 2 ? 0.07 : 0.09);
      const v = voiceChord(b.chord, 53, b.state.v as number[] | undefined, 4);
      b.state.v = v;
      iSoftPad(b.ctx, d, b.t0, b.dur(4), v, { gain: 0.025, a: 0.8, r: 1.2 });
    },
    (b, d) => {
      const notes = chordTones(b.chord, 57, 79);
      const pat = b.motif(`mar:${b.pos % 2}:${b.section % 2}`).pick([[0, 2, 1, 3, 2, 4, 3, 1], [0, 1, 2, 3, 4, 3, 2, 1], [0, 3, 1, 4, 2, 5, 3, 1]] as const);
      for (let i = 0; i < 8; i++) iMallet(b.ctx, d, b.at(i * 0.5), notes[Math.min(notes.length - 1, pat[i]!)]!, 'marimba', { gain: i % 2 ? 0.1 : 0.13, pan: ((i % 4) / 3 - 0.5) * 0.5 });
    },
    (b, d) => {
      const r = rootNote(b.chord, 41);
      [r, r + 7, r + 12, r + 7].forEach((n, i) => iPluck(b.ctx, d, b.at(i), n, { gain: 0.26, decay: 0.35, bright: 0.3 }));
      for (const nt of melody(b, 'glk', 79, 96, R4_SLOW, R4_END, { leap: 0.45, rest: 0.25 })) iMallet(b.ctx, d, b.at(nt.beat), nt.midi, 'glock', { gain: 0.07 });
    },
    (b, d) => {
      for (let i = 0; i < 16; i++) shaker(b.ctx, d, b.at(i * 0.25), i % 2 ? 0.02 : 0.035);
      softKick(b.ctx, d, b.at(0), 0.26);
      softKick(b.ctx, d, b.at(2.5), 0.18);
      for (let bt = 0; bt < 4; bt += 0.75) woodblock(b.ctx, d, b.at(bt), 1200, 0.05);
      if (b.pos === 0) triDing(b.ctx, d, b.at(0), 0.03);
    },
  ],
});

// ---- ROOM CHASE: driving 8ths (E minor, 150) --------------------------------------------------
TR.push({
  name: 'room_chase', title: 'Run, Wick, Run', mood: 'driving 8ths', bpm: 150, beats: 4, key: 'E', mode: 'aeolian',
  progs: [['Em', 'C', 'D', 'Bm'], ['Em', 'G', 'D', 'C'], ['Am', 'C', 'D', 'B7'], ['C', 'D', 'Em', 'Em']],
  stems: [{ name: 'drive', rev: 0.12 }, { name: 'drums', rev: 0.15 }, { name: 'stabs', rev: 0.25 }, { name: 'lead', rev: 0.25, dly: 0.3 }],
  layers: [0, 0.2, 0.5, 0.75],
  parts: [
    (b, d) => {
      const r = rootNote(b.chord, 28);
      for (let i = 0; i < 8; i++) {
        const n = i === 7 && b.rng.chance(0.5) ? r + 12 : r;
        tone(b.ctx, d, b.at(i * 0.5), { type: 'sawtooth', unison: 2, spread: 8, freq: hzOf(n), gain: 0.12, dur: b.dur(0.38), env: { a: 0.003, d: 0.1, s: 0.6, r: 0.04 }, filter: { freq: 260, env: { peak: 1500, d: 0.12 }, q: 4 } });
      }
      for (let i = 0; i < 4; i++) kick(b.ctx, d, b.at(i), 0.42);
    },
    (b, d) => {
      snare(b.ctx, d, b.at(1), 0.22);
      snare(b.ctx, d, b.at(3), 0.22);
      for (let i = 0; i < 16; i++) hat(b.ctx, d, b.at(i * 0.25), i % 2 ? 0.035 : 0.06);
      hat(b.ctx, d, b.at(3.5), 0.05, true);
      if (b.pos === 3) {
        for (let i = 0; i < 4; i++) snare(b.ctx, d, b.at(3 + i * 0.25), 0.1 + i * 0.04);
        tom(b.ctx, d, b.at(2.5), 140, 0.25);
        tom(b.ctx, d, b.at(2.75), 110, 0.25);
      }
    },
    (b, d) => {
      const v = voiceChord(b.chord, 62, b.state.v as number[] | undefined, 3);
      b.state.v = v;
      for (const bt of [0, 0.75, 1.5, 2.5, 3.25]) v.forEach((n) => iBrass(b.ctx, d, b.at(bt), b.dur(0.3), n, { gain: 0.03, bright: 0.7, a: 0.01 }));
      const r = rootNote(b.chord, 76);
      for (let i = 0; i < 8; i++) tone(b.ctx, d, b.at(i * 0.5 + 0.25), { type: 'sawtooth', freq: hzOf(i % 2 ? r + 7 : r), gain: 0.02, dur: b.dur(0.15), env: { a: 0.003, d: 0.05, s: 0.5, r: 0.03 }, filter: { freq: 2500 } });
    },
    (b, d) => {
      const notes = chordTones(b.chord, 76, 93);
      const pat = ARPS[b.motif(`la:${b.pos % 2}`).int(0, 3)]!;
      for (let i = 0; i < 16; i++) tone(b.ctx, d, b.at(i * 0.25), { type: 'square', freq: hzOf(notes[pat(i, notes.length)]!), gain: 0.028, dur: b.dur(0.18), env: { a: 0.002, d: 0.05, s: 0.6, r: 0.03 }, filter: { freq: 3600 } });
      if (b.pos === 0) crash(b.ctx, d, b.at(0), 0.1);
      if (b.pos === 3) swell(b.ctx, d, b.at(2), { len: b.dur(2), gain: 0.09, from: 600, to: 9000 });
    },
  ],
});

// ---- BOSS: heavy, choir pad + war drums (C harmonic minor, 116) -------------------------------
TR.push({
  name: 'boss', title: 'The Bell That Hungers', mood: 'heavy · choir & drums', bpm: 116, beats: 4, key: 'C', mode: 'harmonic',
  progs: [['Cm', 'Abmaj7', 'Fm', 'G7'], ['Cm', 'Db/C', 'Cm', 'G/B'], ['Fm', 'Cm/Eb', 'Db', 'G7']],
  stems: [{ name: 'choir', rev: 0.5 }, { name: 'war drums', rev: 0.3 }, { name: 'brass', rev: 0.3 }, { name: 'fury', rev: 0.4 }],
  layers: [0, 0.2, 0.5, 0.78],
  parts: [
    (b, d) => {
      const v = voiceChord(b.chord, 55, b.state.v as number[] | undefined, 3);
      b.state.v = v;
      iChoir(b.ctx, d, b.t0, b.dur(4), v, { gain: 0.045, vowel: b.pos % 2 ? VOWELS.o : VOWELS.a, a: 0.35 });
      const bn = bassNote(b.chord, 24);
      iPad(b.ctx, d, b.t0, b.dur(4), [bn, bn + 12], { gain: 0.06, cutoff: 240, a: 0.2, r: 0.6, unison: 3 });
    },
    (b, d) => {
      taiko(b.ctx, d, b.at(0), 0.6);
      taiko(b.ctx, d, b.at(1.5), 0.4, 80);
      taiko(b.ctx, d, b.at(2), 0.3, 90);
      taiko(b.ctx, d, b.at(3), 0.5);
      if (b.rng.chance(0.5)) taiko(b.ctx, d, b.at(3.5), 0.3, 95);
      if (b.pos === 0) timpani(b.ctx, d, b.at(0), rootNote(b.chord, 36), 0.4);
    },
    (b, d) => {
      const r = rootNote(b.chord, 43);
      const pat = b.motif(`br:${b.section % 2}`).pick([[0, 0, 7, 0, 8, 7, 0, 11], [0, 0, 3, 0, 7, 3, 0, 2], [0, 12, 0, 7, 0, 8, 7, 3]] as const);
      for (let i = 0; i < 8; i++) iBrass(b.ctx, d, b.at(i * 0.5), b.dur(0.35), r + pat[i]!, { gain: 0.05, bright: 0.45, a: 0.01 });
      iBass(b.ctx, d, b.at(0), b.dur(3.8), r - 12, { gain: 0.15, bright: 0.3 });
    },
    (b, d) => {
      const ct = chordTones(b.chord, 72, 86);
      iStrings(b.ctx, d, b.t0, b.dur(4), ct.slice(0, 3), { gain: 0.018, a: 0.2, trem: 12, cutoff: 3500 });
      if (b.pos === 3) for (let i = 0; i < 16; i++) snare(b.ctx, d, b.at(i * 0.25), 0.04 + i * 0.012);
      if (b.pos === 0) {
        crash(b.ctx, d, b.at(0), 0.12);
        bell(b.ctx, d, b.at(0), { freq: hzOf(rootNote(b.chord, 48)), partials: PARTIALS.church, decay: 3, gain: 0.12 });
      }
      // the Crown's organ answers every other phrase
      if (b.pos === 2 && b.phrase % 2 === 1) for (const n of voiceChord(b.chord, 48, undefined, 3)) iOrgan(b.ctx, d, b.at(0), b.dur(2), n, 0.03);
    },
  ],
});

// ---- REVEAL: huge swell, major-lydian, long reverb (D lydian, 64) -----------------------------
TR.push({
  name: 'reveal', title: 'The Sky Opens', mood: 'huge swell · lydian', bpm: 64, beats: 4, key: 'D', mode: 'lydian',
  progs: [['D', 'E/D', 'D', 'E/D'], ['Bm7', 'Gmaj7#11', 'D/A', 'A'], ['D', 'E/D', 'F#m7', 'Gmaj7#11']],
  stems: [{ name: 'swell', rev: 0.7 }, { name: 'shimmer', rev: 0.55, dly: 0.45 }, { name: 'horns', rev: 0.6 }, { name: 'timpani', rev: 0.45 }],
  layers: [0, 0.15, 0.4, 0.65],
  parts: [
    (b, d) => {
      const v = voiceChord(b.chord, 57, b.state.v as number[] | undefined, 4);
      b.state.v = v;
      iPad(b.ctx, d, b.t0, b.dur(4), v, { gain: 0.03, cutoff: 700, to: 2600, a: 1.8, r: 2.5, unison: 3, spread: 16 });
      iChoir(b.ctx, d, b.t0, b.dur(4), v.slice(0, 3).map((n) => n + 12), { gain: 0.028, vowel: VOWELS.o, vowelTo: VOWELS.a, a: 1.6 });
      iSub(b.ctx, d, b.t0, b.dur(4), bassNote(b.chord, 26), 0.2);
    },
    (b, d) => {
      const notes = chordTones(b.chord, 74, 98);
      for (let i = 0; i < 8; i++) iMallet(b.ctx, d, b.at(i * 0.5), notes[i % notes.length]!, 'glass', { gain: 0.05 + i * 0.006, decay: 2.2, pan: (i / 7 - 0.5) * 0.8 });
    },
    (b, d) => {
      for (const nt of melody(b, 'horn', 62, 79, R4_SLOW, R4_END, { leap: 0.35 })) iBrass(b.ctx, d, b.at(nt.beat), b.dur(nt.len * 0.95), nt.midi, { gain: 0.05, bright: 0.25, a: 0.25 });
    },
    (b, d) => {
      if (b.pos === 0) {
        drum(b.ctx, d, b.at(0), { freq: 40, from: 2, decay: 1.6, gain: 0.55, noise: 0.15, noiseFreq: 300 });
        crash(b.ctx, d, b.at(0), 0.1);
      }
      if (b.pos === 3) {
        const n = rootNote(b.chord, 38);
        for (let i = 0; i < 16; i++) timpani(b.ctx, d, b.at(i * 0.25), n, 0.06 + i * 0.016);
        swell(b.ctx, d, b.at(1), { len: b.dur(3), gain: 0.1, from: 300, to: 9000 });
      } else if (b.pos === 1) timpani(b.ctx, d, b.at(0), rootNote(b.chord, 38), 0.25);
    },
  ],
});

// ---- RESULTS: warm, satisfied groove (Bb major, 96) -------------------------------------------
TR.push({
  name: 'results', title: 'Tally of Wax', mood: 'warm · satisfied', bpm: 96, beats: 4, key: 'Bb', mode: 'ionian', swing: 0.25,
  progs: [['Bbmaj7', 'Dm7', 'Ebmaj7', 'F'], ['Gm9', 'Ebmaj9', 'Bbmaj7/D', 'Fsus4'], ['Ebmaj7', 'F', 'Dm7', 'Gm7'], ['Cm9', 'F13', 'Bbmaj9', 'Bbmaj9']],
  stems: [{ name: 'keys & bass', rev: 0.3 }, { name: 'groove', rev: 0.15 }, { name: 'bells', rev: 0.4, dly: 0.2 }, { name: 'lift', rev: 0.35 }],
  parts: [
    (b, d) => {
      const v = voiceChord(b.chord, 57, b.state.v as number[] | undefined, 4);
      b.state.v = v;
      for (const [bt, ln] of [[0, 1.3], [1.5, 1.2], [3, 0.9]] as const) v.forEach((n) => iEp(b.ctx, d, b.at(bt), b.dur(ln), n, 0.04));
      const r = rootNote(b.chord, 34);
      iBass(b.ctx, d, b.at(0), b.dur(1.4), r, { gain: 0.17 });
      iBass(b.ctx, d, b.at(1.5), b.dur(1), r + 7, { gain: 0.13 });
      iBass(b.ctx, d, b.at(2.5), b.dur(1.3), b.rng.chance(0.5) ? r + 12 : r, { gain: 0.14 });
    },
    (b, d) => {
      kick(b.ctx, d, b.at(0), 0.36);
      kick(b.ctx, d, b.at(2.5), 0.28);
      snare(b.ctx, d, b.at(1), 0.14);
      snare(b.ctx, d, b.at(3), 0.14);
      for (let i = 0; i < 8; i++) hat(b.ctx, d, b.at(i * 0.5), i % 2 ? 0.03 : 0.045);
    },
    (b, d) => {
      for (const nt of melody(b, 'cel', 72, 89, R4, R4_END, { rest: 0.12 })) iMallet(b.ctx, d, b.at(nt.beat), nt.midi, 'celesta', { gain: 0.1 });
    },
    (b, d) => {
      const v = voiceChord(b.chord, 64, undefined, 3);
      iStrings(b.ctx, d, b.t0, b.dur(4), v, { gain: 0.02, a: 0.6 });
      clap(b.ctx, d, b.at(1), 0.08);
      clap(b.ctx, d, b.at(3), 0.08);
      for (let i = 0; i < 16; i++) shaker(b.ctx, d, b.at(i * 0.25), i % 4 === 2 ? 0.035 : 0.018);
    },
  ],
});

// ---- WELL AMBIENT: damp, echoing depths (A aeolian, 60) ---------------------------------------
TR.push({
  name: 'well_ambient', title: 'Bottom of the Well', mood: 'damp · echoing drips', bpm: 60, beats: 4, key: 'A', mode: 'aeolian',
  progs: [['Am9', 'Fmaj7', 'Am9', 'Em7'], ['Am9', 'Dm9', 'Fmaj7', 'Esus4']],
  stems: [{ name: 'depth', rev: 0.5 }, { name: 'drips', rev: 0.75, dly: 0.35 }, { name: 'echoes', rev: 0.8 }, { name: 'hope', rev: 0.65, dly: 0.2 }],
  layers: [0, 0.1, 0.35, 0.65],
  delayBeats: 1.5,
  parts: [
    (b, d) => {
      noise(b.ctx, d, b.t0, { color: 'brown', gain: 0.14, dur: b.dur(4), env: { a: 1.5, d: 0.5, s: 0.8, r: 2 }, filter: { freq: 170 } });
      iSub(b.ctx, d, b.t0, b.dur(4), 33, 0.12);
      const v = voiceChord(b.chord, 52, b.state.v as number[] | undefined, 3);
      b.state.v = v;
      iSoftPad(b.ctx, d, b.t0, b.dur(4), v, { gain: 0.02, a: 1.5, r: 2 });
    },
    (b, d) => {
      const sc = scaleNotes(9, MODES.minpent, 81, 100);
      const n = b.rng.int(2, 5);
      for (let i = 0; i < n; i++) {
        const f = hzOf(b.rng.pick(sc));
        tone(b.ctx, d, b.at(b.rng.range(0, 3.9)), { freq: f * 0.8, to: f, glide: 0.03, gain: b.rng.range(0.03, 0.07), env: { a: 0.002, d: 0.09 }, pan: b.rng.range(-0.8, 0.8) });
      }
    },
    (b, d) => {
      if (b.rng.chance(0.6)) woodblock(b.ctx, d, b.at(b.rng.pick([0.5, 1.5, 2.5])), b.rng.range(300, 420), 0.07);
      if (b.rng.chance(0.4)) iPluck(b.ctx, d, b.at(b.rng.pick([1, 2, 3])), b.rng.pick(chordTones(b.chord, 57, 69)), { gain: 0.1, decay: 1.6, bright: 0.2 });
      if (b.pos === 0 && b.phrase % 2 === 0) bell(b.ctx, d, b.at(0), { freq: 110, partials: PARTIALS.church, decay: 5, gain: 0.07 });
      if (b.rng.chance(0.12)) voice(b.ctx, d, b.at(2), { freq: 150, to: 130, glide: 0.12, vowel: VOWELS.o, formantShift: 1.15, q: 7, gain: 0.05, dur: 0.12, env: { a: 0.01, d: 0.03, s: 0.9, r: 0.04 }, am: { rate: 38, depth: 0.85, type: 'triangle' }, pan: b.rng.range(-0.7, 0.7) });
    },
    (b, d) => {
      for (const nt of melody(b, 'hope', 76, 88, R4_SLOW, R4_END, { rest: 0.35 })) iFlute(b.ctx, d, b.at(nt.beat), b.dur(nt.len * 0.9), nt.midi, 0.04);
    },
  ],
});

// ---- SKY AMBIENT: bright air, chimes, flute (E lydian, 70) ------------------------------------
TR.push({
  name: 'sky_ambient', title: 'Above the Rim', mood: 'airy · wind chimes', bpm: 70, beats: 4, key: 'E', mode: 'lydian',
  progs: [['Emaj9', 'F#/E', 'C#m9', 'Amaj7#11'], ['Emaj9', 'Bsus4', 'C#m9', 'F#/E']],
  stems: [{ name: 'air', rev: 0.5 }, { name: 'chimes', rev: 0.6, dly: 0.3 }, { name: 'flute', rev: 0.55, dly: 0.2 }, { name: 'harp & birds', rev: 0.45 }],
  layers: [0, 0.15, 0.4, 0.65],
  parts: [
    (b, d) => {
      const f0 = b.rng.range(350, 600);
      noise(b.ctx, d, b.t0, { color: 'pink', gain: 0.07, dur: b.dur(4), env: { a: 1.2, d: 0.5, s: 0.8, r: 1.5 }, filter: { type: 'bandpass', freq: f0, to: f0 * b.rng.range(1.5, 2.6), time: b.dur(4), q: 1.6 }, am: { rate: 0.4, depth: 0.4 } });
      const v = voiceChord(b.chord, 64, b.state.v as number[] | undefined, 4);
      b.state.v = v;
      iSoftPad(b.ctx, d, b.t0, b.dur(4), v, { gain: 0.022, a: 1.2, r: 1.8, trem: 3 });
      iSub(b.ctx, d, b.t0, b.dur(4), bassNote(b.chord, 40), 0.09);
    },
    (b, d) => {
      const sc = scaleNotes(4, MODES.pentatonic, 83, 100);
      const n = b.rng.int(3, 7);
      for (let i = 0; i < n; i++) iMallet(b.ctx, d, b.at(b.rng.range(0, 3.9)), b.rng.pick(sc), 'glass', { gain: b.rng.range(0.02, 0.05), decay: 2.2, pan: b.rng.range(-0.8, 0.8) });
    },
    (b, d) => {
      for (const nt of melody(b, 'fl', 71, 88, R4_SLOW, R4_END, { rest: 0.2, leap: 0.3 })) iFlute(b.ctx, d, b.at(nt.beat), b.dur(nt.len * 0.92), nt.midi, 0.055);
    },
    (b, d) => {
      if (b.pos % 2 === 0) {
        const notes = chordTones(b.chord, 64, 88);
        for (let i = 0; i < 9; i++) iPluck(b.ctx, d, b.at(i / 3), notes[i % notes.length]!, { gain: 0.08, decay: 1.8, bright: 0.75, pan: (i / 8 - 0.5) * 0.6 });
      }
      if (b.rng.chance(0.5)) {
        const t0 = b.at(b.rng.range(1, 3.5));
        const k = b.rng.int(2, 3);
        for (let i = 0; i < k; i++) tone(b.ctx, d, t0 + i * 0.09, { freq: b.rng.range(2300, 2800), to: b.rng.range(3800, 4500), glide: 0.04, gain: 0.03, env: { a: 0.003, d: 0.05 }, pan: 0.6 });
      }
    },
  ],
});

// ---- SPACE AMBIENT: vast, cold shimmer (F# lydian, 56) ----------------------------------------
TR.push({
  name: 'space_ambient', title: 'Beyond the Crown', mood: 'vast · cold shimmer', bpm: 56, beats: 4, key: 'F#', mode: 'lydian',
  progs: [['F#maj7#11', 'G#/F#', 'D#m9', 'Bmaj7#11'], ['F#maj7#11', 'Emaj7/F#', 'Dmaj7#11', 'C#sus4']],
  stems: [{ name: 'void', rev: 0.6 }, { name: 'stars', rev: 0.7, dly: 0.45 }, { name: 'choir', rev: 0.8 }, { name: 'pulsar', rev: 0.4, dly: 0.5 }],
  layers: [0, 0.1, 0.35, 0.6],
  delayBeats: 1,
  parts: [
    (b, d) => {
      iSub(b.ctx, d, b.t0, b.dur(4), 30, 0.14);
      iSub(b.ctx, d, b.t0, b.dur(4), 37, 0.05);
      const v = voiceChord(b.chord, 54, b.state.v as number[] | undefined, 4);
      b.state.v = v;
      iPad(b.ctx, d, b.t0, b.dur(4), v, { gain: 0.022, cutoff: 250, to: b.pos % 2 ? 350 : 1000, a: 2, r: 3, unison: 3, spread: 22 });
    },
    (b, d) => {
      const sc = scaleNotes(6, MODES.lydian, 86, 103);
      const n = b.rng.int(3, 6);
      for (let i = 0; i < n; i++) fm(b.ctx, d, b.at(b.rng.range(0, 3.8)), { freq: hzOf(b.rng.pick(sc)), ratio: 3.5, index: 1.2, indexTo: 0, indexTime: 0.6, gain: b.rng.range(0.015, 0.035), env: { a: 0.003, d: 1.2 }, vib: undefined });
    },
    (b, d) => {
      const v = voiceChord(b.chord, 62, undefined, 3);
      iChoir(b.ctx, d, b.t0, b.dur(4), v, { gain: 0.03, vowel: VOWELS.u, vowelTo: VOWELS.a, a: 2.2 });
    },
    (b, d) => {
      for (let i = 0; i < 4; i++) bell(b.ctx, d, b.at(i), { freq: 2637, partials: PARTIALS.metal, decay: 0.08, gain: 0.02 });
      const notes = chordTones(b.chord, 42, 58);
      for (let i = 0; i < 8; i++) tone(b.ctx, d, b.at(i * 0.5), { freq: hzOf(notes[(i * 3) % notes.length]!), gain: 0.05, dur: b.dur(0.3), env: { a: 0.01, d: 0.2, s: 0.4, r: 0.2 } });
      if (b.rng.chance(0.3)) crackle(b.ctx, d, b.at(b.rng.range(0, 3)), { count: 6, span: 0.4, freq: 7000, gain: 0.02, decay: 0.004 });
    },
  ],
});

export const TRACKS: Readonly<Record<string, TrackDef>> = Object.fromEntries(TR.map((t) => [t.name, t]));
export const TRACK_NAMES: readonly string[] = TR.map((t) => t.name);
export const REQUIRED_TRACKS: readonly string[] = ['title', 'landing', 'shop', 'minigame', 'room_tension', 'room_puzzle', 'room_chase', 'boss', 'reveal', 'results', 'well_ambient', 'sky_ambient', 'space_ambient'];

/** Gain of each stem at intensity v (stem 0 always on). Pure. */
export function stemGains(def: TrackDef, v: number): number[] {
  const n = def.stems.length;
  const th = def.layers ?? (n === 4 ? [0, 0.25, 0.5, 0.75] : [0, 0.35, 0.7]);
  // intensity 0 is always just the base stem, whatever the thresholds
  return def.stems.map((_, i) => (i === 0 ? 1 : smoothstep(Math.max(0.001, th[i]! - 0.2), th[i]! + 0.05, v)));
}

// =============================================================================================
// Sequencer
// =============================================================================================
export interface MusicStrip { dry: AudioNode; rev: AudioNode; dly: AudioNode }
export interface MusicHost {
  ctx: Ctx;
  strip: MusicStrip;
  setDelayTime?(seconds: number): void;
}

class Instance {
  readonly def: TrackDef;
  readonly fadeDry: GainNode;
  readonly fadeRev: GainNode;
  readonly fadeDly: GainNode;
  readonly stems: GainNode[] = [];
  readonly stemTargets: number[] = [];
  readonly spb: number;
  readonly barDur: number;
  bar = 0;
  nextTime: number;
  stopAt: number | null = null;
  done = false;
  readonly seed: number;
  readonly state: Record<string, number[] | number | undefined> = {};
  private readonly nodes: AudioNode[] = [];
  private prog: readonly string[];
  private progSection = -1;

  constructor(host: MusicHost, def: TrackDef, t: number, seed: number, intensity: number) {
    const c = host.ctx;
    this.def = def;
    this.seed = seed;
    this.spb = 60 / def.bpm;
    this.barDur = this.spb * def.beats;
    this.nextTime = t;
    this.prog = def.progs[0]!;
    const g = def.gain ?? 1;
    this.fadeDry = c.createGain();
    this.fadeRev = c.createGain();
    this.fadeDly = c.createGain();
    for (const f of [this.fadeDry, this.fadeRev, this.fadeDly]) f.gain.value = 0;
    this.fadeDry.connect(host.strip.dry);
    this.fadeRev.connect(host.strip.rev);
    this.fadeDly.connect(host.strip.dly);
    this.nodes.push(this.fadeDry, this.fadeRev, this.fadeDly);
    const gains = stemGains(def, intensity);
    def.stems.forEach((sd, i) => {
      const sg = c.createGain();
      sg.gain.value = gains[i]! * (sd.gain ?? 1) * g;
      this.stemTargets.push(gains[i]!);
      sg.connect(this.fadeDry);
      if (sd.rev) {
        const s = c.createGain();
        s.gain.value = sd.rev;
        sg.connect(s).connect(this.fadeRev);
        this.nodes.push(s);
      }
      if (sd.dly) {
        const s = c.createGain();
        s.gain.value = sd.dly;
        sg.connect(s).connect(this.fadeDly);
        this.nodes.push(s);
      }
      this.stems.push(sg);
      this.nodes.push(sg);
    });
  }

  fade(now: number, to: number, seconds: number): void {
    for (const f of [this.fadeDry, this.fadeRev, this.fadeDly]) {
      const p = f.gain;
      p.cancelScheduledValues(now);
      p.setValueAtTime(p.value, now);
      p.linearRampToValueAtTime(to, now + Math.max(0.02, seconds));
    }
  }

  setIntensity(now: number, v: number, seconds = 1.6): void {
    const gains = stemGains(this.def, v);
    const g = this.def.gain ?? 1;
    this.stems.forEach((s, i) => {
      const target = gains[i]! * (this.def.stems[i]!.gain ?? 1) * g;
      this.stemTargets[i] = gains[i]!;
      s.gain.cancelScheduledValues(now);
      s.gain.setValueAtTime(s.gain.value, now);
      s.gain.linearRampToValueAtTime(target, now + seconds);
    });
  }

  chordAt(bar: number): string {
    const section = Math.floor(bar / 8);
    if (section !== this.progSection) {
      this.progSection = section;
      const r = new Prng(hash32(this.seed, this.def.name, 'prog', section));
      this.prog = section === 0 ? this.def.progs[0]! : this.def.progs[r.int(0, this.def.progs.length - 1)]!;
    }
    return this.prog[bar % this.prog.length]!;
  }

  scheduleBar(ctx: Ctx, intensity: number): void {
    const i = this.bar;
    const sym = this.chordAt(i);
    const nextSym = (i + 1) % 8 === 0 ? this.chordAt(i + 1) : this.prog[(i + 1) % this.prog.length]!;
    const def = this.def;
    const seed = this.seed;
    const t0 = this.nextTime;
    const spb = this.spb;
    const sw = def.swing ?? 0;
    const b: Bar = {
      ctx, t0, spb, beats: def.beats, index: i, pos: i % 4, phrase: Math.floor(i / 4), section: Math.floor(i / 8),
      chord: chord(sym), next: chord(nextSym), key: PC[def.key]!, mode: MODES[def.mode],
      rng: new Prng(hash32(seed, def.name, 'bar', i)),
      motif: (k) => new Prng(hash32(seed, def.name, 'motif', k)),
      at: (beat) => t0 + swingBeat(beat, sw) * spb,
      dur: (beats) => beats * spb,
      intensity,
      state: this.state,
    };
    def.parts.forEach((part, k) => {
      const s = this.stems[k];
      if (!s) return;
      // skip silent stems entirely (saves CPU); they rejoin at the next bar line
      if (this.stemTargets[k]! < 0.002 && s.gain.value < 0.002) return;
      part(b, s);
    });
  }

  dispose(): void {
    for (const n of this.nodes) {
      try {
        n.disconnect();
      } catch {
        /* noop */
      }
    }
  }
}

export interface MusicState { track: string | null; bar: number; beat: number; intensity: number; stems: { name: string; gain: number }[]; fading: number }

export class MusicPlayer {
  private readonly host: MusicHost;
  private readonly instances: Instance[] = [];
  private current: Instance | null = null;
  private intensity = 0.5;
  private seedCounter = 0;
  readonly seed: number;
  lookahead = 0.35;

  constructor(host: MusicHost, seed = 1) {
    this.host = host;
    this.seed = seed >>> 0;
  }

  get track(): string | null {
    return this.current?.def.name ?? null;
  }

  play(name: string | null, fade = 1.5, now = this.host.ctx.currentTime): void {
    if (name !== null && !TRACKS[name]) {
      console.warn(`[audio] unknown music track "${name}"`);
      return;
    }
    if (this.current && name === this.current.def.name && this.current.stopAt === null) return;
    if (this.current) {
      this.current.fade(now, 0, fade);
      this.current.stopAt = now + fade;
      this.current = null;
    }
    if (name === null) return;
    const def = TRACKS[name]!;
    const inst = new Instance(this.host, def, now + 0.06, hash32(this.seed, name, this.seedCounter++), this.intensity);
    inst.fade(now, 1, Math.max(0.05, fade));
    this.host.setDelayTime?.(inst.spb * (def.delayBeats ?? 0.75));
    this.instances.push(inst);
    this.current = inst;
  }

  setIntensity(v: number, now = this.host.ctx.currentTime): void {
    this.intensity = clamp(v, 0, 1);
    this.current?.setIntensity(now, this.intensity);
  }

  getIntensity(): number {
    return this.intensity;
  }

  /** Schedule every bar that starts before `until`. `live` skips bars that are already late. */
  schedule(until: number, live = true): void {
    const now = this.host.ctx.currentTime;
    for (const inst of this.instances) {
      if (inst.done) continue;
      if (live && inst.nextTime < now - 0.02) {
        // fell behind (tab hitch): jump to the next bar line instead of blasting late notes
        while (inst.nextTime < now) {
          inst.nextTime += inst.barDur;
          inst.bar++;
        }
      }
      for (;;) {
        if (inst.stopAt !== null && inst.nextTime >= inst.stopAt) {
          inst.done = true;
          break;
        }
        if (inst.nextTime >= until) break;
        inst.scheduleBar(this.host.ctx, this.intensity);
        inst.nextTime += inst.barDur;
        inst.bar++;
      }
    }
    for (let i = this.instances.length - 1; i >= 0; i--) {
      const inst = this.instances[i]!;
      // keep faded instances connected long enough for reverb tails / released notes
      if (inst.done && inst.stopAt !== null && now > inst.stopAt + 6) {
        inst.dispose();
        this.instances.splice(i, 1);
      }
    }
  }

  state(now = this.host.ctx.currentTime): MusicState {
    const c = this.current;
    if (!c) return { track: null, bar: 0, beat: 0, intensity: this.intensity, stems: [], fading: this.instances.length };
    // bars [0, c.bar) are scheduled; bar k starts at nextTime - (c.bar - k) * barDur
    const back = Math.max(1, Math.ceil((c.nextTime - now) / c.barDur));
    const start = c.nextTime - back * c.barDur;
    const barNow = Math.max(0, c.bar - back);
    const beat = now < start ? 0 : Math.min(c.def.beats - 1, Math.floor((now - start) / c.spb));
    return {
      track: c.def.name,
      bar: barNow,
      beat,
      intensity: this.intensity,
      stems: c.def.stems.map((s, i) => ({ name: s.name, gain: c.stems[i]!.gain.value })),
      fading: this.instances.filter((x) => x !== c && !x.done).length,
    };
  }

  stopAll(): void {
    for (const i of this.instances) i.dispose();
    this.instances.length = 0;
    this.current = null;
  }
}
