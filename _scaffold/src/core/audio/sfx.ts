/**
 * Named SFX recipes. Each recipe schedules a handful of synth voices relative to `s.t` and gets a
 * little cosmetic variation per play (pitch/timing/filter jitter) so repeats never machine-gun.
 * Recipes write into `s.out`; the engine adds gain, spatialisation and reverb/echo sends.
 */
import {
  bell, clamp, crackle, drum, fm, hash32, mtof, noise, noiseBuffer, PARTIALS, pluck, Prng, swell, tone, VOWELS, voice,
  type Ctx, type NoiseColor, type DrumOpts, type FmOpts, type NoiseOpts, type PluckOpts, type ToneOpts, type VoiceOpts, type BellOpts, type Formants,
} from './synth.ts';

export type SfxCategory = 'ui' | 'system' | 'reward' | 'move' | 'action' | 'world' | 'puzzle' | 'magic' | 'creature' | 'social' | 'ambient' | 'motif';

export class SfxVoice {
  end: number;
  readonly ctx: Ctx;
  readonly out: AudioNode;
  readonly t: number;
  readonly p: number;
  private readonly rng: () => number;
  constructor(ctx: Ctx, out: AudioNode, t: number, pitch: number, rng: () => number) {
    this.ctx = ctx;
    this.out = out;
    this.t = t;
    this.p = pitch;
    this.rng = rng;
    this.end = t;
  }
  r(): number {
    return this.rng();
  }
  rr(a: number, b: number): number {
    return a + (b - a) * this.rng();
  }
  pick<T>(arr: readonly T[]): T {
    return arr[Math.floor(this.rng() * arr.length)]!;
  }
  /** apply the per-play pitch multiplier */
  f(hz: number): number {
    return hz * this.p;
  }
  m(midi: number): number {
    return mtof(midi) * this.p;
  }
  private k(e: number): number {
    if (e > this.end) this.end = e;
    return e;
  }
  tone(dt: number, o: ToneOpts): number {
    return this.k(tone(this.ctx, this.out, this.t + dt, o));
  }
  noise(dt: number, o: NoiseOpts): number {
    return this.k(noise(this.ctx, this.out, this.t + dt, o));
  }
  fm(dt: number, o: FmOpts): number {
    return this.k(fm(this.ctx, this.out, this.t + dt, o));
  }
  pluck(dt: number, o: PluckOpts): number {
    return this.k(pluck(this.ctx, this.out, this.t + dt, o));
  }
  bell(dt: number, o: BellOpts): number {
    return this.k(bell(this.ctx, this.out, this.t + dt, o));
  }
  drum(dt: number, o: DrumOpts): number {
    return this.k(drum(this.ctx, this.out, this.t + dt, o));
  }
  voice(dt: number, o: VoiceOpts): number {
    return this.k(voice(this.ctx, this.out, this.t + dt, o));
  }
  crackle(dt: number, o: Parameters<typeof crackle>[3]): number {
    return this.k(crackle(this.ctx, this.out, this.t + dt, o));
  }
  swell(dt: number, o: Parameters<typeof swell>[3]): number {
    return this.k(swell(this.ctx, this.out, this.t + dt, o));
  }
}

export interface SfxDef {
  play(s: SfxVoice): void;
  cat: SfxCategory;
  gain?: number; // recipe-level trim
  wet?: number; // reverb send
  echo?: number; // delay send
  max?: number; // max simultaneous instances
  gap?: number; // min seconds between triggers (anti-spam)
  ui?: boolean; // routes to the UI bus (never muffled by pause/underwater)
}

const S: Record<string, SfxDef> = {};
function def(name: string, cat: SfxCategory, play: (s: SfxVoice) => void, o: Omit<SfxDef, 'play' | 'cat'> = {}): void {
  S[name] = { play, cat, ...o };
}

const V = VOWELS;
const P = PARTIALS;

// =============================================================================================
// UI
// =============================================================================================
// GDD 15.4: hover is a soft "wax tap": a short airy blip over a tiny body, kept dry so it stays crisp
def('ui_hover', 'ui', (s) => {
  const f = 2400 * s.rr(0.97, 1.03);
  s.tone(0, { freq: s.f(f), to: s.f(f * 1.2), glide: 0.03, gain: 0.13, env: { a: 0.002, d: 0.05 } });
  s.tone(0, { type: 'triangle', freq: s.f(f / 4), gain: 0.07, env: { a: 0.002, d: 0.035 } });
  s.noise(0, { gain: 0.035, env: { a: 0.001, d: 0.014 }, filter: { type: 'highpass', freq: 6500 } });
}, { ui: true, gap: 0.04, max: 2, wet: 0.05 });

def('ui_click', 'ui', (s) => {
  s.tone(0, { type: 'triangle', freq: s.f(1500 * s.rr(0.97, 1.03)), to: s.f(900), glide: 0.02, gain: 0.2, env: { a: 0.001, d: 0.035 } });
  s.tone(0, { freq: s.f(320), to: s.f(150), glide: 0.04, gain: 0.26, env: { a: 0.001, d: 0.07 } });
  s.noise(0, { gain: 0.06, env: { a: 0.001, d: 0.01 }, filter: { type: 'bandpass', freq: 4000, q: 1 } });
}, { ui: true, gap: 0.03, max: 3 });

def('ui_confirm', 'ui', (s) => {
  const b = s.f(1318.5 * s.rr(0.995, 1.005));
  s.bell(0, { freq: b, partials: P.glass, decay: 0.35, gain: 0.2, strike: 0.03 });
  s.bell(0.075, { freq: b * 1.4983, partials: P.glass, decay: 0.7, gain: 0.24 });
  s.tone(0, { freq: b / 2, gain: 0.1, env: { a: 0.004, d: 0.25 } });
  s.tone(0.075, { type: 'triangle', freq: b * 0.749, gain: 0.07, env: { a: 0.004, d: 0.3 } });
}, { ui: true, wet: 0.25, gap: 0.05 });

def('ui_back', 'ui', (s) => {
  s.bell(0, { freq: s.f(1174.7), partials: P.glass, decay: 0.25, gain: 0.18 });
  s.bell(0.065, { freq: s.f(880), partials: P.glass, decay: 0.4, gain: 0.17 });
  s.tone(0, { type: 'triangle', freq: s.f(620), to: s.f(380), glide: 0.12, gain: 0.09, env: { a: 0.003, d: 0.14 } });
}, { ui: true, wet: 0.2, gap: 0.05 });

def('ui_error', 'ui', (s) => {
  for (let i = 0; i < 2; i++) {
    s.tone(i * 0.11, { type: 'square', freq: s.f(i ? 185 : 196), gain: 0.13, dur: 0.075, env: { a: 0.003, d: 0.05, s: 0.6, r: 0.03 }, filter: { type: 'lowpass', freq: 1500, q: 3 } });
    s.tone(i * 0.11, { freq: s.f(98), gain: 0.22, env: { a: 0.003, d: 0.12 } });
  }
}, { ui: true, gap: 0.12 });

def('ui_open', 'ui', (s) => {
  s.noise(0, { gain: 0.1, env: { a: 0.06, d: 0.16 }, filter: { type: 'bandpass', freq: 500, to: 4200, time: 0.2, q: 1.3 } });
  const steps = [0, 4, 7, 12];
  steps.forEach((st, i) => s.bell(0.02 + i * 0.035, { freq: s.f(880 * Math.pow(2, st / 12)), partials: P.glass, decay: 0.35, gain: 0.1 }));
  s.tone(0, { freq: s.f(220), to: s.f(440), glide: 0.15, gain: 0.12, env: { a: 0.01, d: 0.22 } });
}, { ui: true, wet: 0.3, gap: 0.08 });

def('ui_close', 'ui', (s) => {
  s.noise(0, { gain: 0.09, env: { a: 0.03, d: 0.14 }, filter: { type: 'bandpass', freq: 4000, to: 500, time: 0.16, q: 1.3 } });
  s.tone(0, { freq: s.f(900), to: s.f(380), glide: 0.12, gain: 0.13, env: { a: 0.003, d: 0.15 } });
  s.bell(0.05, { freq: s.f(660), partials: P.glass, decay: 0.2, gain: 0.09 });
}, { ui: true, wet: 0.25, gap: 0.08 });

def('ui_tab', 'ui', (s) => {
  s.pluck(0, { freq: s.f(s.rr(1150, 1250)), decay: 0.09, bright: 0.7, gain: 0.32 });
  s.noise(0, { gain: 0.05, env: { a: 0.001, d: 0.008 }, filter: { type: 'highpass', freq: 5000 } });
  s.tone(0, { freq: s.f(420), to: s.f(300), glide: 0.03, gain: 0.1, env: { a: 0.001, d: 0.04 } });
}, { ui: true, gap: 0.04 });

/** A detent tick; pass `pitch` from the slider value so dragging reads as a rising scale. */
def('ui_slider', 'ui', (s) => {
  s.tone(0, { type: 'triangle', freq: s.f(1800), gain: 0.12, env: { a: 0.001, d: 0.025 } });
  s.tone(0, { freq: s.f(900), gain: 0.1, env: { a: 0.001, d: 0.03 } });
  s.noise(0, { gain: 0.04, env: { a: 0.0008, d: 0.006 }, filter: { type: 'highpass', freq: 5000 } });
}, { ui: true, gap: 0.03, max: 2, wet: 0 });

/**
 * System bell-babble (GDD 15.3): one glass-bell FM chime per typed character, carrier:modulator
 * 1:3.5, index 2 -> 0 over 150 ms, on C5. Pitch is deterministic so AudioEngine.typeTick() can
 * quantise it to the C major pentatonic from the character code.
 */
def('type_tick', 'ui', (s) => {
  const f = s.f(523.25);
  s.fm(0, { freq: f, ratio: 3.5, index: 2, indexTo: 0, indexTime: 0.15, gain: 0.1, env: { a: 0.001, d: 0.14 } });
  s.tone(0, { freq: f * 2, gain: 0.018, env: { a: 0.001, d: 0.05 } });
  s.voice(0, { freq: f * 0.5, vowel: s.pick([V.a, V.e, V.i, V.o]), formantShift: 1.6, q: 6, gain: 0.04, env: { a: 0.002, d: 0.04 } });
}, { ui: true, gap: 0.02, max: 8, wet: 0.15 });

// =============================================================================================
// System windows
// =============================================================================================
def('system_chime', 'system', (s) => {
  s.fm(0, { freq: s.f(880), ratio: 3.5, index: 2.2, indexTo: 0.15, indexTime: 0.45, gain: 0.12, env: { a: 0.002, d: 1.5 } });
  s.bell(0, { freq: s.f(1318.5), partials: P.glass, decay: 1.3, gain: 0.17, strike: 0.04 });
  s.bell(0.05, { freq: s.f(1760), partials: P.glass, decay: 1.0, gain: 0.1 });
  s.noise(0, { gain: 0.045, env: { a: 0.01, d: 0.5 }, filter: { type: 'highpass', freq: 7500 } });
  [2637, 3136, 3520, 4186].forEach((f, i) => s.bell(0.09 + i * 0.03, { freq: s.f(f), partials: P.glass, decay: 0.25, gain: 0.03 }));
  s.tone(0, { freq: s.f(220), gain: 0.08, env: { a: 0.005, d: 0.4 } });
}, { wet: 0.35, echo: 0.15, gap: 0.1 });

def('system_alert', 'system', (s) => {
  for (let k = 0; k < 2; k++) {
    const t0 = k * 0.3;
    s.tone(t0, { type: 'sawtooth', freq: s.f(880), gain: 0.1, dur: 0.11, env: { a: 0.004, d: 0.05, s: 0.7, r: 0.05 }, filter: { type: 'lowpass', freq: 2600, q: 4 } });
    s.tone(t0 + 0.14, { type: 'sawtooth', freq: s.f(659.3), gain: 0.1, dur: 0.11, env: { a: 0.004, d: 0.05, s: 0.7, r: 0.06 }, filter: { type: 'lowpass', freq: 2200, q: 4 } });
    s.tone(t0, { freq: s.f(110), gain: 0.22, env: { a: 0.003, d: 0.22 } });
  }
  s.bell(0, { freq: s.f(1760), partials: P.glass, decay: 0.5, gain: 0.07 });
}, { wet: 0.2, gap: 0.3 });

def('system_glitch', 'system', (s) => {
  const n = 9;
  for (let i = 0; i < n; i++) {
    const dt = i * 0.035 + s.rr(0, 0.02);
    if (s.r() < 0.55) {
      s.tone(dt, { type: 'square', freq: s.f(s.rr(150, 3200)), gain: 0.06, dur: s.rr(0.01, 0.035), env: { a: 0.001, d: 0.01, s: 1, r: 0.005 }, filter: { type: 'lowpass', freq: 6000 } });
    } else {
      s.noise(dt, { gain: 0.1, dur: s.rr(0.01, 0.03), env: { a: 0.001, d: 0.01, s: 1, r: 0.005 }, filter: { type: 'bandpass', freq: s.rr(800, 6000), q: 4 } });
    }
  }
  s.fm(0, { freq: s.f(55), ratio: 7.13, index: 25, gain: 0.05, dur: 0.3, env: { a: 0.002, d: 0.05, s: 1, r: 0.04 } });
  s.bell(0.32, { freq: s.f(1318.5 * 1.06), partials: P.glass, decay: 0.35, gain: 0.08 });
}, { wet: 0.1, gap: 0.15 });

def('quest_accept', 'system', (s) => {
  [60, 64, 67, 72].forEach((n, i) => s.pluck(i * 0.06, { freq: s.m(n + 12), decay: 0.9, bright: 0.7, gain: 0.28 }));
  s.bell(0.24, { freq: s.m(84), partials: P.glass, decay: 1.3, gain: 0.17, strike: 0.02 });
  s.bell(0.24, { freq: s.m(91), partials: P.glass, decay: 1.0, gain: 0.08 });
  s.drum(0.24, { freq: 55, from: 2, decay: 0.5, gain: 0.32 });
  s.noise(0.2, { gain: 0.05, env: { a: 0.01, d: 0.6 }, filter: { type: 'highpass', freq: 7000 } });
}, { wet: 0.35, echo: 0.15, gap: 0.2 });

// =============================================================================================
// Rewards & economy
// =============================================================================================
def('reward_small', 'reward', (s) => {
  [0, 4, 7].forEach((st, i) => s.bell(i * 0.055, { freq: s.m(88 + st), partials: P.glass, decay: 0.55, gain: 0.14 }));
  s.noise(0.05, { gain: 0.05, env: { a: 0.02, d: 0.35 }, filter: { type: 'highpass', freq: 8000 } });
  s.tone(0, { type: 'triangle', freq: s.m(76), gain: 0.08, env: { a: 0.005, d: 0.3 } });
}, { wet: 0.3, echo: 0.15, gap: 0.06 });

def('reward_big', 'reward', (s) => {
  const brass = (dt: number, midi: number, dur: number, g: number) =>
    s.tone(dt, { type: 'sawtooth', unison: 3, spread: 11, freq: s.m(midi), gain: g, dur, env: { a: 0.025, d: 0.3, s: 0.75, r: 0.35 }, filter: { freq: 900, env: { peak: 3800, a: 0.03, d: 0.35 }, q: 2 }, vib: { rate: 5.5, depth: 10, delay: 0.3 } });
  brass(0, 72, 0.07, 0.1);
  brass(0.1, 72, 0.07, 0.1);
  for (const n of [60, 64, 67, 72]) brass(0.2, n, 0.95, 0.075);
  [72, 76, 79, 84, 88, 91].forEach((n, i) => s.bell(0.2 + i * 0.05, { freq: s.m(n + 12), partials: P.glass, decay: 0.9, gain: 0.07 }));
  s.drum(0.2, { freq: 45, from: 2.2, decay: 0.9, gain: 0.5, noise: 0.15 });
  s.noise(0.2, { gain: 0.1, env: { a: 0.005, d: 1.3 }, filter: { type: 'highpass', freq: 5500 } });
  s.crackle(0.22, { count: 18, span: 0.9, freq: 5000, gain: 0.05, decay: 0.008, fade: true });
}, { wet: 0.38, echo: 0.1, gap: 0.3, max: 2 });

def('coin', 'reward', (s) => {
  const j = s.rr(0.985, 1.015);
  s.tone(0, { type: 'square', freq: s.f(988 * j), gain: 0.07, dur: 0.06, env: { a: 0.001, d: 0.05, s: 0.8, r: 0.01 }, filter: { type: 'lowpass', freq: 5000 } });
  s.tone(0.06, { type: 'square', freq: s.f(1318.5 * j), gain: 0.07, env: { a: 0.001, d: 0.32 }, filter: { type: 'lowpass', freq: 6000 } });
  s.bell(0.06, { freq: s.f(2637 * j), partials: P.coin, decay: 0.45, gain: 0.09 });
}, { gap: 0.03, max: 4, wet: 0.15 });

def('coins_many', 'reward', (s) => {
  const n = 13;
  for (let i = 0; i < n; i++) {
    const dt = i * 0.042 + s.rr(0, 0.02);
    s.bell(dt, { freq: s.f(s.pick([2093, 2349, 2637, 3136, 3520]) * s.rr(0.98, 1.02)), partials: P.coin, decay: 0.28, gain: 0.085 * (1 - i / (n + 4)), pan: s.rr(-0.5, 0.5) });
    if (i % 3 === 0) s.noise(dt, { gain: 0.05, env: { a: 0.001, d: 0.01 }, filter: { type: 'bandpass', freq: 5000, q: 2 } });
  }
}, { gap: 0.2, max: 2, wet: 0.2 });

def('purchase', 'reward', (s) => {
  s.noise(0, { gain: 0.2, env: { a: 0.001, d: 0.02 }, filter: { type: 'bandpass', freq: 2000, q: 3 } });
  s.noise(0.05, { gain: 0.2, env: { a: 0.001, d: 0.025 }, filter: { type: 'bandpass', freq: 2600, q: 3 } });
  s.drum(0.05, { freq: 90, from: 1.6, decay: 0.15, gain: 0.3 });
  s.bell(0.09, { freq: s.f(2093), partials: P.coin, decay: 1.1, gain: 0.15 });
  s.bell(0.09, { freq: s.f(3136), partials: P.coin, decay: 0.9, gain: 0.11 });
  [0, 4, 7].forEach((st, i) => s.tone(0.12 + i * 0.04, { type: 'triangle', freq: s.m(84 + st), gain: 0.05, env: { a: 0.002, d: 0.2 } }));
}, { wet: 0.25, gap: 0.2 });

def('equip', 'action', (s) => {
  s.noise(0, { gain: 0.11, env: { a: 0.03, d: 0.08 }, filter: { type: 'bandpass', freq: 800, to: 2600, time: 0.08, q: 1.2 } });
  s.bell(0.07, { freq: s.f(1400 * s.rr(0.97, 1.03)), partials: P.metal, decay: 0.3, gain: 0.14 });
  s.drum(0.07, { freq: 110, from: 1.8, decay: 0.12, gain: 0.3 });
}, { wet: 0.15, gap: 0.08 });

def('unlock', 'action', (s) => {
  s.noise(0, { gain: 0.24, env: { a: 0.001, d: 0.02 }, filter: { type: 'bandpass', freq: 3000, q: 3 } });
  s.tone(0, { type: 'square', freq: s.f(1800), gain: 0.03, env: { a: 0.001, d: 0.012 } });
  s.noise(0.09, { gain: 0.24, env: { a: 0.001, d: 0.025 }, filter: { type: 'bandpass', freq: 2200, q: 3 } });
  s.drum(0.14, { freq: 180, from: 1.6, decay: 0.08, gain: 0.3 });
  s.bell(0.18, { freq: s.f(1046.5), partials: P.glass, decay: 0.7, gain: 0.14 });
  s.bell(0.25, { freq: s.f(1568), partials: P.glass, decay: 1.0, gain: 0.16 });
}, { wet: 0.3, gap: 0.2 });

// =============================================================================================
// Movement (small bouncy creatures)
// =============================================================================================
def('jump', 'move', (s) => {
  s.tone(0, { freq: s.f(s.rr(260, 300)), to: s.f(s.rr(560, 620)), glide: 0.09, gain: 0.26, env: { a: 0.003, d: 0.13 } });
  s.tone(0, { type: 'triangle', freq: s.f(520), to: s.f(1100), glide: 0.08, gain: 0.05, env: { a: 0.002, d: 0.08 } });
  s.noise(0, { gain: 0.06, env: { a: 0.003, d: 0.06 }, filter: { type: 'bandpass', freq: 900, to: 2500, time: 0.06, q: 1 } });
}, { gap: 0.05, max: 4 });

def('double_jump', 'move', (s) => {
  s.tone(0, { freq: s.f(s.rr(400, 440)), to: s.f(1150), glide: 0.12, gain: 0.2, env: { a: 0.003, d: 0.16 } });
  s.noise(0, { gain: 0.1, env: { a: 0.02, d: 0.14 }, filter: { type: 'bandpass', freq: 1200, to: 5000, time: 0.15, q: 1.5 } });
  s.bell(0.05, { freq: s.f(2637), partials: P.glass, decay: 0.3, gain: 0.05 });
  s.bell(0.09, { freq: s.f(3520), partials: P.glass, decay: 0.3, gain: 0.05 });
}, { gap: 0.05, max: 4, wet: 0.15 });

def('land_soft', 'move', (s) => {
  s.tone(0, { freq: s.f(s.rr(130, 150)), to: s.f(70), glide: 0.06, gain: 0.3, env: { a: 0.002, d: 0.09 } });
  s.noise(0, { color: 'pink', gain: 0.12, env: { a: 0.002, d: 0.07 }, filter: { freq: 900 } });
}, { gap: 0.05, max: 4 });

def('land_hard', 'move', (s) => {
  s.drum(0, { freq: s.f(48), from: 2.4, drop: 0.06, decay: 0.32, gain: 0.6, click: 0.12, noise: 0.22, noiseFreq: 700 });
  s.crackle(0.02, { count: 5, span: 0.15, freq: 2500, gain: 0.06 });
  s.noise(0, { color: 'brown', gain: 0.2, env: { a: 0.002, d: 0.3 }, filter: { freq: 300 } });
}, { gap: 0.06, max: 3, wet: 0.15 });

def('footstep_stone', 'move', (s) => {
  s.noise(0, { gain: 0.2, env: { a: 0.001, d: s.rr(0.03, 0.05) }, filter: { type: 'bandpass', freq: s.f(s.rr(1500, 2600)), q: 1.4 } });
  s.tone(0, { freq: s.f(s.rr(110, 140)), to: s.f(70), glide: 0.03, gain: 0.13, env: { a: 0.001, d: 0.04 } });
  s.noise(0.008, { gain: 0.045, env: { a: 0.001, d: 0.01 }, filter: { type: 'highpass', freq: 6000 } });
}, { gap: 0.06, max: 4 });

def('footstep_wet', 'move', (s) => {
  s.noise(0, { gain: 0.17, env: { a: 0.002, d: 0.09 }, filter: { type: 'bandpass', freq: s.f(s.rr(700, 1100)), to: s.f(2400), time: 0.07, q: 2.5 } });
  s.tone(0.01, { freq: s.f(s.rr(500, 700)), to: s.f(s.rr(1100, 1500)), glide: 0.04, gain: 0.06, env: { a: 0.002, d: 0.05 } });
  s.tone(0, { freq: s.f(120), to: s.f(70), glide: 0.04, gain: 0.1, env: { a: 0.001, d: 0.04 } });
}, { gap: 0.06, max: 4 });

def('footstep_wood', 'move', (s) => {
  s.noise(0, { gain: 0.22, env: { a: 0.001, d: 0.045 }, filter: { type: 'bandpass', freq: s.f(s.rr(380, 480)), q: 6 } });
  s.bell(0, { freq: s.f(s.rr(210, 260)), partials: P.wood, decay: 0.09, gain: 0.2 });
  s.noise(0, { gain: 0.05, env: { a: 0.001, d: 0.008 }, filter: { type: 'highpass', freq: 4000 } });
}, { gap: 0.06, max: 4 });

def('footstep_metal', 'move', (s) => {
  s.bell(0, { freq: s.f(s.rr(700, 950)), partials: P.metal, decay: 0.2, gain: 0.12, jitter: 0.01 });
  s.noise(0, { gain: 0.15, env: { a: 0.001, d: 0.02 }, filter: { type: 'bandpass', freq: 3500, q: 1.5 } });
  s.tone(0, { freq: s.f(140), to: s.f(80), glide: 0.03, gain: 0.12, env: { a: 0.001, d: 0.04 } });
}, { gap: 0.06, max: 4, wet: 0.1 });

def('footstep_cloud', 'move', (s) => {
  s.noise(0, { color: 'pink', gain: 0.28, env: { a: 0.012, d: 0.09 }, filter: { freq: s.f(s.rr(700, 1000)) } });
  s.noise(0, { gain: 0.04, env: { a: 0.01, d: 0.06 }, filter: { type: 'bandpass', freq: 6000, q: 1 } });
  s.tone(0, { freq: s.f(s.rr(95, 110)), to: s.f(65), glide: 0.06, gain: 0.12, env: { a: 0.008, d: 0.07 } });
  s.tone(0, { freq: s.f(s.rr(880, 1100)), gain: 0.035, env: { a: 0.005, d: 0.12 } });
}, { gap: 0.06, max: 4, wet: 0.14 });

def('dive', 'move', (s) => {
  s.noise(0, { gain: 0.2, env: { a: 0.05, d: 0.18 }, filter: { type: 'bandpass', freq: 400, to: 2600, time: 0.15, q: 1.6 } });
  s.voice(0, { freq: s.f(340), to: s.f(230), glide: 0.14, vowel: V.u, formantShift: 1.45, gain: 0.1, env: { a: 0.01, d: 0.12 } });
  s.tone(0, { freq: s.f(700), to: s.f(250), glide: 0.2, gain: 0.07, env: { a: 0.005, d: 0.2 } });
}, { gap: 0.08, max: 3 });

def('slide', 'move', (s) => {
  s.noise(0, { color: 'pink', gain: 0.18, dur: 0.45, env: { a: 0.03, d: 0.1, s: 0.8, r: 0.15 }, filter: { type: 'bandpass', freq: s.f(1400), to: s.f(1000), time: 0.5, q: 1.2 }, am: { rate: 18, depth: 0.4 } });
  s.noise(0, { gain: 0.045, dur: 0.45, env: { a: 0.03, d: 0.1, s: 0.8, r: 0.15 }, filter: { type: 'highpass', freq: 5000 } });
}, { gap: 0.15, max: 3 });

def('grab', 'action', (s) => {
  s.noise(0, { gain: 0.17, env: { a: 0.002, d: 0.05 }, filter: { type: 'bandpass', freq: 1800, q: 1.2 } });
  s.tone(0, { freq: s.f(200), to: s.f(120), glide: 0.04, gain: 0.25, env: { a: 0.001, d: 0.07 } });
  s.pluck(0.005, { freq: s.f(s.rr(420, 480)), decay: 0.12, bright: 0.3, gain: 0.2 });
}, { gap: 0.06, max: 4 });

def('lash', 'action', (s) => {
  s.noise(0, { gain: 0.13, env: { a: 0.06, d: 0.02 }, filter: { type: 'highpass', freq: 800, to: 5000, time: 0.07 } });
  s.noise(0.07, { gain: 0.45, env: { a: 0.0008, d: 0.025 }, filter: { type: 'highpass', freq: 1800 } });
  s.tone(0.07, { freq: s.f(1400), to: s.f(180), glide: 0.06, gain: 0.24, env: { a: 0.001, d: 0.08 } });
  s.tone(0.07, { type: 'square', freq: s.f(2600), to: s.f(900), glide: 0.02, gain: 0.04, env: { a: 0.001, d: 0.02 } });
}, { gap: 0.06, max: 4 });

def('throw', 'action', (s) => {
  s.noise(0, { gain: 0.22, env: { a: 0.08, d: 0.1 }, filter: { type: 'bandpass', freq: 300, to: 2200, time: 0.16, q: 1.4 } });
  s.voice(0, { freq: s.f(s.rr(280, 320)), to: s.f(370), glide: 0.05, vowel: V.a, vowelTo: V.er, morph: 0.08, formantShift: 1.5, gain: 0.08, env: { a: 0.005, d: 0.08 } });
}, { gap: 0.06, max: 4 });

def('catch', 'action', (s) => {
  s.noise(0, { color: 'pink', gain: 0.3, env: { a: 0.001, d: 0.05 }, filter: { freq: 1800 } });
  s.tone(0, { freq: s.f(220), to: s.f(130), glide: 0.03, gain: 0.3, env: { a: 0.001, d: 0.06 } });
}, { gap: 0.06, max: 4 });

def('bonk', 'action', (s) => {
  s.bell(0, { freq: s.f(s.rr(560, 640)), partials: P.wood, decay: 0.13, gain: 0.3 });
  s.tone(0, { freq: s.f(900), to: s.f(300), glide: 0.12, gain: 0.24, env: { a: 0.001, d: 0.15 } });
  s.bell(0.02, { freq: s.f(1760), partials: P.glass, decay: 0.5, gain: 0.07 });
  s.noise(0, { gain: 0.12, env: { a: 0.001, d: 0.02 }, filter: { type: 'bandpass', freq: 2500 } });
}, { gap: 0.06, max: 4, wet: 0.1 });

def('stun', 'action', (s) => {
  s.tone(0, { freq: s.f(1200), to: s.f(520), glide: 0.55, gain: 0.08, env: { a: 0.01, d: 0.55 }, vib: { rate: 7, depth: 45 } });
  for (let i = 0; i < 4; i++) {
    const f0 = s.f(s.pick([2600, 3000, 3400]));
    s.tone(i * 0.13 + s.rr(0, 0.02), { freq: f0, to: f0 * 1.3, glide: 0.05, gain: 0.055, env: { a: 0.004, d: 0.08 }, vib: { rate: 30, depth: 70 }, pan: (i % 2 ? 0.4 : -0.4) });
  }
}, { gap: 0.2, max: 3, wet: 0.2 });

def('splash_small', 'world', (s) => {
  s.noise(0, { gain: 0.34, env: { a: 0.002, d: 0.26 }, filter: { freq: 3500, to: 900, time: 0.25 }, filter2: { type: 'highpass', freq: 250 } });
  for (let i = 0; i < 3; i++) {
    s.tone(s.rr(0.03, 0.16), { freq: s.f(s.rr(400, 700)), to: s.f(s.rr(1000, 1600)), glide: 0.03, gain: 0.06, env: { a: 0.002, d: 0.04 } });
  }
}, { gap: 0.05, max: 4, wet: 0.15 });

def('splash_big', 'world', (s) => {
  s.drum(0, { freq: s.f(60), from: 2, decay: 0.25, gain: 0.35 });
  s.noise(0, { gain: 0.48, env: { a: 0.003, d: 0.7 }, filter: { freq: 5000, to: 700, time: 0.6 }, filter2: { type: 'highpass', freq: 150 } });
  s.noise(0.05, { color: 'pink', gain: 0.18, env: { a: 0.05, d: 0.9 }, filter: { type: 'bandpass', freq: 1200, q: 0.7 } });
  for (let i = 0; i < 8; i++) {
    s.tone(s.rr(0.1, 0.8), { freq: s.f(s.rr(350, 700)), to: s.f(s.rr(900, 1700)), glide: 0.035, gain: 0.05, env: { a: 0.002, d: 0.05 }, pan: s.rr(-0.6, 0.6) });
  }
  s.crackle(0.1, { count: 10, span: 0.6, freq: 3000, gain: 0.05, fade: true });
}, { gap: 0.1, max: 2, wet: 0.25 });

def('bubble', 'world', (s) => {
  s.tone(0, { freq: s.f(s.rr(250, 400)), to: s.f(s.rr(900, 1400)), glide: s.rr(0.03, 0.06), gain: 0.18, env: { a: 0.002, d: 0.07 } });
}, { gap: 0.02, max: 6, wet: 0.2 });

def('fall_whistle', 'move', (s) => {
  s.tone(0, { freq: s.f(1900), to: s.f(380), glide: 1.3, gain: 0.15, dur: 1.2, env: { a: 0.02, d: 0.1, s: 1, r: 0.15 }, vib: { rate: 6, depth: 18, delay: 0.2 } });
  s.noise(0, { gain: 0.06, dur: 1.2, env: { a: 0.2, d: 0.1, s: 1, r: 0.2 }, filter: { type: 'bandpass', freq: 900, to: 300, time: 1.2, q: 1.5 } });
}, { gap: 0.3, max: 2, wet: 0.2 });

def('fall_yelp', 'move', (s) => {
  s.voice(0, { freq: s.f(s.rr(520, 600)), to: s.f(s.rr(880, 960)), glide: 0.07, vowel: V.a, vowelTo: V.e, morph: 0.15, formantShift: 1.5, gain: 0.2, dur: 0.12, env: { a: 0.005, d: 0.05, s: 0.9, r: 0.08 } });
  s.voice(0.12, { freq: s.f(900), to: s.f(300), glide: 0.38, vowel: V.e, vowelTo: V.u, morph: 0.35, formantShift: 1.5, gain: 0.16, dur: 0.3, env: { a: 0.01, d: 0.05, s: 0.9, r: 0.15 }, vib: { rate: 9, depth: 60 } });
}, { gap: 0.3, max: 3, wet: 0.2 });

def('respawn', 'magic', (s) => {
  s.swell(0, { len: 0.5, gain: 0.16, from: 300, to: 5000 });
  [0, 4, 7, 11, 14].forEach((st, i) => s.bell(0.1 + i * 0.06, { freq: s.m(72 + st), partials: P.glass, decay: 0.6, gain: 0.09 }));
  s.tone(0.5, { freq: s.f(300), to: s.f(900), glide: 0.05, gain: 0.24, env: { a: 0.001, d: 0.09 } });
  s.noise(0.5, { gain: 0.14, env: { a: 0.001, d: 0.03 }, filter: { type: 'bandpass', freq: 1500 } });
  s.noise(0.5, { gain: 0.05, env: { a: 0.01, d: 0.6 }, filter: { type: 'highpass', freq: 7000 } });
}, { wet: 0.4, echo: 0.15, gap: 0.2 });

def('heal', 'magic', (s) => {
  [0, 4, 7, 12].forEach((st, i) => s.tone(i * 0.05, { type: 'triangle', freq: s.m(67 + st), gain: 0.09, dur: 0.5, env: { a: 0.02, d: 0.3, s: 0.5, r: 0.35 } }));
  s.noise(0, { gain: 0.05, env: { a: 0.1, d: 0.5 }, filter: { type: 'bandpass', freq: 3000, to: 8000, time: 0.5, q: 2 } });
  s.bell(0.15, { freq: s.m(91), partials: P.glass, decay: 0.7, gain: 0.07 });
  s.bell(0.25, { freq: s.m(96), partials: P.glass, decay: 0.7, gain: 0.06 });
}, { wet: 0.35, echo: 0.15, gap: 0.15 });

def('hurt', 'action', (s) => {
  s.voice(0, { freq: s.f(s.rr(380, 440)), to: s.f(220), glide: 0.15, vowel: V.o, vowelTo: V.u, morph: 0.15, formantShift: 1.45, gain: 0.22, dur: 0.08, env: { a: 0.003, d: 0.05, s: 0.8, r: 0.08 } });
  s.drum(0, { freq: 90, from: 2, decay: 0.12, gain: 0.34 });
  s.noise(0, { gain: 0.2, env: { a: 0.001, d: 0.04 }, filter: { type: 'bandpass', freq: 1400, q: 0.8 } });
}, { gap: 0.08, max: 3 });

// =============================================================================================
// World: doors, mechanisms, materials
// =============================================================================================
def('door_rumble', 'world', (s) => {
  s.noise(0, { color: 'brown', gain: 0.55, dur: 1.4, env: { a: 0.25, d: 0.1, s: 1, r: 0.4 }, filter: { freq: 260 }, am: { rate: 13, depth: 0.5, type: 'triangle' } });
  s.noise(0, { color: 'pink', gain: 0.12, dur: 1.4, env: { a: 0.3, d: 0.1, s: 1, r: 0.4 }, filter: { type: 'bandpass', freq: 500, q: 1.5 }, am: { rate: 7.3, depth: 0.6 } });
  s.tone(0, { freq: s.f(42), gain: 0.3, dur: 1.4, env: { a: 0.3, d: 0.1, s: 1, r: 0.5 } });
  s.crackle(0.1, { count: 14, span: 1.4, freq: 1800, gain: 0.05, decay: 0.02 });
}, { wet: 0.35, gap: 0.3, max: 2 });

def('door_slam', 'world', (s) => {
  s.drum(0, { freq: s.f(42), from: 2.2, drop: 0.08, decay: 0.55, gain: 0.8, click: 0.18, noise: 0.35, noiseFreq: 500, noiseDecay: 0.2 });
  s.noise(0, { color: 'brown', gain: 0.4, env: { a: 0.002, d: 0.6 }, filter: { freq: 400 } });
  s.bell(0.005, { freq: s.f(180), partials: P.metal, decay: 0.4, gain: 0.09 });
  s.crackle(0.03, { count: 6, span: 0.25, freq: 3000, gain: 0.05 });
}, { wet: 0.45, gap: 0.2, max: 2 });

def('door_open', 'world', (s) => {
  s.tone(0, { type: 'sawtooth', freq: s.f(70), to: s.f(120), glide: 0.8, lin: true, gain: 0.2, dur: 0.8, env: { a: 0.08, d: 0.1, s: 1, r: 0.2 }, vib: { rate: 17, depth: 500, type: 'square' }, filter: { type: 'bandpass', freq: 900, to: 1300, time: 0.8, q: 5 } });
  s.noise(0.3, { gain: 0.12, dur: 1, env: { a: 0.5, d: 0.1, s: 1, r: 0.6 }, filter: { type: 'bandpass', freq: 300, to: 1500, time: 1, q: 0.8 } });
  for (const n of [62, 66, 69, 74]) s.tone(0.5, { freq: s.m(n), gain: 0.045, dur: 0.8, env: { a: 0.4, d: 0.1, s: 0.8, r: 0.8 } });
}, { wet: 0.4, gap: 0.3, max: 2 });

def('door_glow', 'magic', (s) => {
  for (const n of [76, 79, 83, 88]) s.tone(0, { freq: s.m(n) * s.rr(0.998, 1.002), gain: 0.045, dur: 1.0, env: { a: 0.3, d: 0.1, s: 0.8, r: 0.6 }, trem: { rate: 6, depth: 0.5 } });
  s.noise(0, { gain: 0.05, dur: 1, env: { a: 0.4, d: 0.1, s: 1, r: 0.6 }, filter: { type: 'bandpass', freq: 5000, q: 3 } });
  for (let i = 0; i < 4; i++) s.bell(s.rr(0.1, 1.0), { freq: s.m(s.pick([88, 91, 95, 100])), partials: P.glass, decay: 0.4, gain: 0.04, pan: s.rr(-0.6, 0.6) });
}, { wet: 0.5, echo: 0.2, gap: 0.3 });

def('plate_down', 'puzzle', (s) => {
  s.drum(0, { freq: s.f(95), from: 1.6, decay: 0.12, gain: 0.5, click: 0.1 });
  s.noise(0, { color: 'brown', gain: 0.25, env: { a: 0.005, d: 0.18 }, filter: { freq: 700 } });
  s.noise(0.05, { gain: 0.18, env: { a: 0.001, d: 0.015 }, filter: { type: 'bandpass', freq: 2600, q: 3 } });
  s.tone(0.05, { type: 'square', freq: s.f(700), to: s.f(500), glide: 0.02, gain: 0.035, env: { a: 0.001, d: 0.03 }, filter: { freq: 2000 } });
}, { wet: 0.15, gap: 0.08 });

def('plate_up', 'puzzle', (s) => {
  s.noise(0, { gain: 0.15, env: { a: 0.001, d: 0.015 }, filter: { type: 'bandpass', freq: 3000, q: 3 } });
  s.tone(0, { freq: s.f(300), to: s.f(520), glide: 0.08, gain: 0.12, env: { a: 0.002, d: 0.1 } });
  s.noise(0, { color: 'brown', gain: 0.12, env: { a: 0.003, d: 0.12 }, filter: { freq: 600 } });
}, { wet: 0.15, gap: 0.08 });

def('lever', 'puzzle', (s) => {
  for (let i = 0; i < 3; i++) {
    s.noise(i * 0.045, { gain: 0.22, env: { a: 0.001, d: 0.012 }, filter: { type: 'bandpass', freq: s.f(s.rr(2200, 2800)), q: 4 } });
    s.tone(i * 0.045, { type: 'square', freq: s.f(1500), gain: 0.03, env: { a: 0.001, d: 0.01 } });
  }
  s.drum(0.15, { freq: s.f(120), from: 1.6, decay: 0.12, gain: 0.45, click: 0.08 });
  s.bell(0.15, { freq: s.f(300), partials: P.metal, decay: 0.22, gain: 0.08 });
}, { wet: 0.2, gap: 0.15 });

def('valve_turn', 'puzzle', (s) => {
  s.fm(0, { freq: s.f(900), to: s.f(1300), glide: 0.5, ratio: 1.01, index: 0.6, gain: 0.06, dur: 0.5, env: { a: 0.05, d: 0.1, s: 0.8, r: 0.1 }, vib: { rate: 11, depth: 80 } });
  s.tone(0, { type: 'sawtooth', freq: s.f(110), to: s.f(90), glide: 0.5, gain: 0.1, dur: 0.5, env: { a: 0.05, d: 0.1, s: 0.8, r: 0.1 }, filter: { type: 'bandpass', freq: 600, q: 3 }, vib: { rate: 9, depth: 300, type: 'square' } });
  s.bell(0.55, { freq: s.f(420), partials: P.metal, decay: 0.3, gain: 0.12 });
  s.drum(0.55, { freq: 150, from: 1.5, decay: 0.08, gain: 0.25 });
}, { wet: 0.25, gap: 0.2 });

def('steam_hiss', 'world', (s) => {
  s.noise(0, { gain: 0.3, dur: 1.0, env: { a: 0.03, d: 0.2, s: 0.6, r: 0.5 }, filter: { type: 'highpass', freq: 2500 }, filter2: { freq: 9000, to: 4000, time: 1.2 }, am: { rate: 9, depth: 0.15 } });
  s.noise(0, { color: 'pink', gain: 0.08, dur: 0.9, env: { a: 0.02, d: 0.1, s: 0.8, r: 0.4 }, filter: { type: 'bandpass', freq: 1200, q: 1 } });
}, { wet: 0.2, gap: 0.2, max: 3 });

def('ice_freeze', 'magic', (s) => {
  s.tone(0, { freq: s.f(1200), to: s.f(3200), glide: 0.5, gain: 0.05, dur: 0.4, env: { a: 0.05, d: 0.1, s: 0.7, r: 0.3 } });
  s.crackle(0, { count: 26, span: 0.6, freq: 5000, spread: 0.8, gain: 0.11, decay: 0.006, q: 6 });
  s.bell(0.5, { freq: s.f(2800), partials: P.glass, decay: 0.9, gain: 0.12 });
  s.noise(0, { gain: 0.07, dur: 0.6, env: { a: 0.3, d: 0.1, s: 0.6, r: 0.2 }, filter: { type: 'bandpass', freq: 7000, q: 4 } });
}, { wet: 0.35, echo: 0.1, gap: 0.2 });

def('shatter', 'world', (s) => {
  s.noise(0, { gain: 0.45, env: { a: 0.001, d: 0.12 }, filter: { type: 'highpass', freq: 1500 } });
  s.noise(0, { gain: 0.18, env: { a: 0.001, d: 0.3 }, filter: { type: 'bandpass', freq: 4000, q: 0.8 } });
  for (let i = 0; i < 14; i++) {
    const k = s.r();
    s.bell(k * k * 0.6, { freq: s.f(s.rr(2000, 6000)), partials: P.glass, decay: s.rr(0.1, 0.35), gain: 0.055, pan: s.rr(-0.7, 0.7), maxPartials: 2 });
  }
  s.crackle(0.02, { count: 18, span: 0.5, freq: 6000, gain: 0.07, decay: 0.01, fade: true });
  s.drum(0, { freq: 120, from: 1.5, decay: 0.08, gain: 0.2 });
}, { wet: 0.3, gap: 0.08, max: 3 });

def('glass_ding', 'world', (s) => {
  s.bell(0, { freq: s.f(s.rr(1740, 1780)), partials: P.glass, decay: 2.2, gain: 0.24, strike: 0.03, beat: 1.5 });
}, { wet: 0.35, gap: 0.05, max: 4 });

// =============================================================================================
// Belfry puzzle: tuning forks (C4 E4 G4 form a C-major triad; Bb4 is the crooked trap)
// =============================================================================================
function fork(s: SfxVoice, nominal: number, crooked = false): void {
  // GDD 15.4: the trap fork is 30 cents sharp of its nominal Bb and beats audibly
  const hzv = crooked ? nominal * Math.pow(2, 30 / 1200) : nominal;
  s.bell(0, { freq: s.f(hzv), partials: P.fork, decay: 3.4, gain: 0.3, beat: crooked ? 4.5 : 0.7, strike: 0.07, a: 0.004 });
  s.tone(0, { freq: s.f(hzv * 2), gain: 0.022, env: { a: 0.005, d: 1.0 } });
  s.bell(0, { freq: s.f(hzv * 4.2), partials: P.metal, decay: 0.12, gain: 0.05 });
  if (crooked) s.tone(0, { type: 'triangle', freq: s.f(hzv * 1.06), to: s.f(hzv * 1.02), glide: 2, gain: 0.03, env: { a: 0.01, d: 2.5 }, vib: { rate: 5.3, depth: 30 } });
}
def('fork_low', 'puzzle', (s) => fork(s, 261.63), { wet: 0.3, max: 3 });
def('fork_mid', 'puzzle', (s) => fork(s, 329.63), { wet: 0.3, max: 3 });
def('fork_high', 'puzzle', (s) => fork(s, 392.0), { wet: 0.3, max: 3 });
def('fork_trap', 'puzzle', (s) => fork(s, 466.16, true), { wet: 0.3, max: 3 });

def('resonance_chord', 'puzzle', (s) => {
  for (const n of [48, 60, 64, 67, 72, 76, 79]) s.tone(0, { freq: s.m(n), gain: 0.065, dur: 1.6, env: { a: 0.25, d: 0.3, s: 0.8, r: 1.2 } });
  [84, 88, 91].forEach((n, i) => s.bell(i * 0.08, { freq: s.m(n), partials: P.glass, decay: 2, gain: 0.09 }));
  s.swell(0, { len: 0.35, gain: 0.09, from: 1000, to: 8000 });
  s.tone(0, { type: 'sawtooth', unison: 3, spread: 8, freq: s.m(48), gain: 0.06, dur: 1.6, env: { a: 0.2, d: 0.2, s: 0.8, r: 1.0 }, filter: { freq: 300, to: 1400, time: 1.2 } });
  s.noise(0.3, { gain: 0.05, env: { a: 0.02, d: 1.5 }, filter: { type: 'highpass', freq: 8000 } });
}, { wet: 0.5, echo: 0.2, gap: 0.3, max: 2 });

def('bell_toll', 'world', (s) => {
  s.bell(0, { freq: s.f(s.rr(108, 112)), partials: P.church, decay: 5, gain: 0.5, strike: 0.2, beat: 1.1, a: 0.003 });
  s.drum(0, { freq: 55, from: 1.3, decay: 0.8, gain: 0.22 });
}, { wet: 0.5, gap: 0.3, max: 2 });

def('gong', 'world', (s) => {
  s.bell(0, { freq: s.f(98), partials: P.gong, decay: 4.5, gain: 0.45, a: 0.02, strike: 0.1, jitter: 0.01 });
  s.noise(0, { color: 'pink', gain: 0.11, env: { a: 0.15, d: 3 }, filter: { type: 'bandpass', freq: 2500, to: 900, time: 3, q: 0.7 } });
  s.drum(0, { freq: 50, from: 1.2, decay: 1, gain: 0.28 });
}, { wet: 0.45, gap: 0.3, max: 2 });

def('heartbeat', 'world', (s) => {
  s.drum(0, { freq: s.f(52), from: 1.8, drop: 0.04, decay: 0.18, gain: 0.6 });
  s.drum(0.22, { freq: s.f(46), from: 1.6, drop: 0.04, decay: 0.24, gain: 0.45 });
  s.noise(0, { color: 'brown', gain: 0.1, env: { a: 0.002, d: 0.1 }, filter: { freq: 200 } });
}, { gap: 0.3, max: 2 });

def('timer_tick', 'system', (s) => {
  s.noise(0, { gain: 0.34, env: { a: 0.0008, d: 0.012 }, filter: { type: 'bandpass', freq: s.f(3200), q: 4 } });
  s.bell(0, { freq: s.f(1900), partials: P.wood, decay: 0.05, gain: 0.2 });
  s.tone(0, { freq: s.f(620), to: s.f(520), glide: 0.03, gain: 0.08, env: { a: 0.001, d: 0.035 } });
}, { ui: true, gap: 0.08, max: 2, wet: 0.06 });

def('timer_urgent', 'system', (s) => {
  s.tone(0, { type: 'square', freq: s.f(1046.5), gain: 0.07, dur: 0.07, env: { a: 0.002, d: 0.03, s: 0.7, r: 0.02 }, filter: { freq: 3000 } });
  s.noise(0, { gain: 0.32, env: { a: 0.0008, d: 0.01 }, filter: { type: 'bandpass', freq: 4000, q: 3 } });
  s.tone(0, { freq: 90, to: 60, glide: 0.08, gain: 0.2, env: { a: 0.002, d: 0.1 } });
}, { ui: true, gap: 0.08, max: 2 });

// =============================================================================================
// Magic & movement FX
// =============================================================================================
def('whoosh', 'action', (s) => {
  const side = s.r() < 0.5 ? -1 : 1;
  s.noise(0, { color: 'pink', gain: 0.42, env: { a: 0.16, d: 0.22 }, filter: { type: 'bandpass', freq: s.f(s.rr(250, 350)), to: s.f(2400), time: 0.18, q: 1.2 }, pan: -0.5 * side, panTo: 0.5 * side, panTime: 0.35 });
  s.noise(0, { gain: 0.06, env: { a: 0.15, d: 0.15 }, filter: { type: 'bandpass', freq: 3000, to: 6000, time: 0.2, q: 3 } });
}, { gap: 0.05, max: 4 });

def('magic_up', 'magic', (s) => {
  [0, 4, 7, 11, 14, 19].forEach((st, i) => s.fm(i * 0.045, { freq: s.m(72 + st), ratio: 2, index: 1.5, indexTo: 0.2, indexTime: 0.3, gain: 0.065, env: { a: 0.003, d: 0.4 } }));
  s.noise(0, { gain: 0.1, env: { a: 0.3, d: 0.2 }, filter: { type: 'bandpass', freq: 1000, to: 8000, time: 0.4, q: 1.5 } });
  s.tone(0, { freq: s.f(300), to: s.f(1200), glide: 0.4, gain: 0.07, env: { a: 0.1, d: 0.3 } });
}, { wet: 0.4, echo: 0.25, gap: 0.1 });

def('magic_down', 'magic', (s) => {
  [19, 14, 11, 7, 4, 0].forEach((st, i) => s.fm(i * 0.05, { freq: s.m(67 + st), ratio: 2, index: 1.5, indexTo: 0.2, indexTime: 0.3, gain: 0.06, env: { a: 0.003, d: 0.4 } }));
  s.noise(0, { gain: 0.09, env: { a: 0.1, d: 0.35 }, filter: { type: 'bandpass', freq: 7000, to: 700, time: 0.45, q: 1.5 } });
  s.tone(0, { freq: s.f(1000), to: s.f(200), glide: 0.45, gain: 0.07, env: { a: 0.05, d: 0.4 } });
}, { wet: 0.4, echo: 0.25, gap: 0.1 });

def('teleport', 'magic', (s) => {
  s.tone(0, { type: 'sawtooth', freq: s.f(200), to: s.f(2400), glide: 0.25, gain: 0.1, env: { a: 0.01, d: 0.25 }, filter: { freq: 3000 }, vib: { rate: 40, depth: 200 } });
  s.fm(0, { freq: s.f(600), to: s.f(3000), glide: 0.25, ratio: 1.5, index: 4, indexTo: 0.5, indexTime: 0.25, gain: 0.07, env: { a: 0.005, d: 0.3 } });
  s.noise(0, { gain: 0.18, env: { a: 0.15, d: 0.1 }, filter: { type: 'bandpass', freq: 500, to: 6000, time: 0.25, q: 2 } });
  s.tone(0.26, { freq: s.f(1200), to: s.f(300), glide: 0.06, gain: 0.22, env: { a: 0.001, d: 0.08 } });
  s.noise(0.26, { gain: 0.15, env: { a: 0.001, d: 0.03 }, filter: { type: 'bandpass', freq: 2000 } });
  for (let i = 0; i < 3; i++) s.bell(0.3 + i * 0.05, { freq: s.m(96 + i * 4), partials: P.glass, decay: 0.3, gain: 0.04 });
}, { wet: 0.35, echo: 0.2, gap: 0.15 });

def('rewind', 'magic', (s) => {
  s.tone(0, { type: 'sawtooth', freq: s.f(800), to: s.f(150), glide: 0.7, gain: 0.09, dur: 0.7, env: { a: 0.02, d: 0.1, s: 1, r: 0.1 }, filter: { freq: 2500 }, vib: { rate: 8, to: 30, time: 0.7, depth: 500 } });
  s.noise(0, { color: 'pink', gain: 0.14, dur: 0.7, env: { a: 0.02, d: 0.1, s: 1, r: 0.1 }, filter: { type: 'bandpass', freq: 2000, to: 600, time: 0.7, q: 1.5 }, am: { rate: 12, to: 35, time: 0.7, depth: 0.8 } });
  s.swell(0.2, { len: 0.5, gain: 0.13, from: 6000, to: 800 });
  s.noise(0.76, { gain: 0.2, env: { a: 0.001, d: 0.015 }, filter: { type: 'bandpass', freq: 3000, q: 3 } });
}, { wet: 0.3, gap: 0.2 });

def('glitch_burst', 'magic', (s) => {
  for (let i = 0; i < 12; i++) {
    const dt = s.rr(0, 0.45);
    const k = s.r();
    if (k < 0.4) s.tone(dt, { type: 'square', freq: s.f(s.rr(80, 4000)), gain: 0.07, dur: s.rr(0.01, 0.04), env: { a: 0.001, d: 0.01, s: 1, r: 0.004 }, pan: s.rr(-0.8, 0.8) });
    else if (k < 0.75) s.noise(dt, { gain: 0.12, dur: s.rr(0.01, 0.05), env: { a: 0.001, d: 0.01, s: 1, r: 0.004 }, filter: { type: 'bandpass', freq: s.rr(300, 8000), q: 3 }, pan: s.rr(-0.8, 0.8) });
    else s.fm(dt, { freq: s.f(s.rr(100, 900)), ratio: s.rr(1.3, 7.7), index: 12, gain: 0.06, dur: s.rr(0.02, 0.06), env: { a: 0.001, d: 0.01, s: 1, r: 0.005 } });
  }
  s.fm(0, { freq: s.f(55), ratio: 7.13, index: 30, gain: 0.08, dur: 0.3, env: { a: 0.002, d: 0.05, s: 1, r: 0.05 } });
}, { wet: 0.1, gap: 0.1, max: 3 });

// =============================================================================================
// Rope (Fuse Tether) and creatures
// =============================================================================================
def('rope_creak', 'world', (s) => {
  s.tone(0, { type: 'sawtooth', freq: s.f(s.rr(60, 80)), to: s.f(s.rr(90, 110)), glide: 0.5, gain: 0.17, dur: 0.5, env: { a: 0.06, d: 0.1, s: 0.9, r: 0.15 }, vib: { rate: s.rr(25, 35), depth: 700, type: 'square' }, filter: { type: 'bandpass', freq: 1100, q: 6 } });
  s.tone(0.05, { type: 'sawtooth', freq: s.f(150), to: s.f(135), glide: 0.4, gain: 0.05, dur: 0.4, env: { a: 0.05, d: 0.1, s: 0.9, r: 0.1 }, filter: { type: 'bandpass', freq: 2000, q: 8 }, vib: { rate: 21, depth: 400, type: 'square' } });
}, { wet: 0.15, gap: 0.2, max: 3 });

/** GDD 6.3 Snip: downward pitch-bend, noise burst and a tritone. */
def('rope_snap', 'world', (s) => {
  s.noise(0, { gain: 0.5, env: { a: 0.0008, d: 0.05 }, filter: { type: 'highpass', freq: 1200 } });
  s.pluck(0, { freq: s.f(329.63), to: s.f(140), glide: 0.35, decay: 1.2, bright: 0.8, gain: 0.42 });
  s.pluck(0.01, { freq: s.f(466.16), to: s.f(198), glide: 0.35, decay: 1.2, bright: 0.8, gain: 0.28 });
  s.tone(0, { freq: 100, to: 50, glide: 0.1, gain: 0.24, env: { a: 0.001, d: 0.15 } });
}, { wet: 0.25, gap: 0.1 });

def('knot_tie', 'world', (s) => {
  s.noise(0, { color: 'pink', gain: 0.2, env: { a: 0.02, d: 0.12 }, filter: { type: 'bandpass', freq: 1500, to: 2500, time: 0.1, q: 1.5 } });
  s.pluck(0.1, { freq: s.f(220), decay: 0.7, bright: 0.6, gain: 0.34 });
  s.pluck(0.16, { freq: s.f(329.63), decay: 0.9, bright: 0.6, gain: 0.34 });
  s.tone(0.1, { freq: s.f(160), to: s.f(90), glide: 0.05, gain: 0.2, env: { a: 0.001, d: 0.08 } });
}, { wet: 0.25, gap: 0.15 });

/** a cute two-syllable "rib-bit" */
def('croak', 'creature', (s) => {
  const f0 = s.rr(150, 172);
  s.voice(0, { freq: s.f(f0), to: s.f(f0 * 0.85), glide: 0.12, vowel: V.o, formantShift: 1.15, q: 7, gain: 0.34, dur: 0.12, env: { a: 0.01, d: 0.03, s: 0.9, r: 0.04 }, am: { rate: 38, depth: 0.85, type: 'triangle' } });
  s.tone(0, { freq: s.f(f0), gain: 0.1, dur: 0.12, env: { a: 0.01, d: 0.03, s: 0.9, r: 0.04 } });
  s.voice(0.17, { freq: s.f(f0 * 1.3), to: s.f(f0 * 1.2), glide: 0.07, vowel: V.i, vowelTo: V.u, morph: 0.06, formantShift: 1.1, q: 7, gain: 0.28, dur: 0.07, env: { a: 0.005, d: 0.02, s: 0.9, r: 0.04 }, am: { rate: 45, depth: 0.8, type: 'triangle' } });
}, { wet: 0.2, gap: 0.1, max: 3 });

def('chirp', 'creature', (s) => {
  const n = s.pick([2, 3, 3]);
  for (let i = 0; i < n; i++) s.tone(i * s.rr(0.07, 0.1), { freq: s.f(s.rr(2300, 2800)), to: s.f(s.rr(3800, 4600)), glide: 0.04, gain: 0.11, env: { a: 0.003, d: 0.05 } });
}, { wet: 0.2, gap: 0.08, max: 3 });

def('monster_growl', 'creature', (s) => {
  s.voice(0, { freq: s.f(s.rr(62, 72)), to: s.f(55), glide: 1.0, vowel: V.o, vowelTo: V.a, morph: 0.6, q: 5, gain: 0.38, dur: 1.0, env: { a: 0.12, d: 0.2, s: 0.9, r: 0.3 }, am: { rate: 28, depth: 0.7, type: 'sawtooth' }, unison: 2, spread: 30, breath: 0.08 });
  s.noise(0, { color: 'brown', gain: 0.24, dur: 1, env: { a: 0.1, d: 0.1, s: 1, r: 0.3 }, filter: { freq: 350 }, am: { rate: 17, depth: 0.6 } });
  s.tone(0, { freq: s.f(45), gain: 0.2, dur: 1, env: { a: 0.15, d: 0.1, s: 1, r: 0.3 } });
}, { wet: 0.3, gap: 0.3, max: 2 });

def('monster_screech', 'creature', (s) => {
  s.voice(0, { freq: s.f(700), to: s.f(1250), glide: 0.25, vowel: V.e, vowelTo: V.i, morph: 0.3, q: 6, gain: 0.24, dur: 0.6, env: { a: 0.02, d: 0.1, s: 0.9, r: 0.25 }, vib: { rate: 13, depth: 80 }, unison: 3, spread: 40, breath: 0.1 });
  s.fm(0, { freq: s.f(1400), to: s.f(1800), glide: 0.5, ratio: 1.41, index: 3, gain: 0.05, dur: 0.6, env: { a: 0.02, d: 0.1, s: 0.9, r: 0.2 } });
  s.noise(0, { gain: 0.11, dur: 0.6, env: { a: 0.02, d: 0.1, s: 1, r: 0.2 }, filter: { type: 'bandpass', freq: 3000, q: 2 } });
}, { wet: 0.35, gap: 0.3, max: 2 });

def('monster_stomp', 'creature', (s) => {
  s.drum(0, { freq: s.f(38), from: 2.8, drop: 0.07, decay: 0.7, gain: 0.85, click: 0.15, noise: 0.3, noiseFreq: 400, noiseDecay: 0.25 });
  s.noise(0, { color: 'brown', gain: 0.42, env: { a: 0.003, d: 0.5 }, filter: { freq: 250 } });
  s.crackle(0.02, { count: 8, span: 0.4, freq: 1500, gain: 0.06, fade: true });
}, { wet: 0.35, gap: 0.12, max: 3 });

def('slime_squelch', 'creature', (s) => {
  s.noise(0, { color: 'pink', gain: 0.34, env: { a: 0.005, d: 0.22 }, filter: { type: 'bandpass', freq: s.f(s.rr(350, 450)), to: s.f(s.rr(1200, 1600)), time: 0.12, q: 7 } });
  for (let i = 0; i < 3; i++) s.tone(s.rr(0, 0.15), { freq: s.f(s.rr(180, 260)), to: s.f(s.rr(500, 700)), glide: 0.05, gain: 0.14, env: { a: 0.003, d: 0.06 } });
  s.tone(0, { freq: s.f(110), to: s.f(60), glide: 0.15, gain: 0.2, env: { a: 0.002, d: 0.15 } });
}, { wet: 0.15, gap: 0.08, max: 4 });

def('eye_open', 'creature', (s) => {
  s.noise(0, { color: 'pink', gain: 0.12, env: { a: 0.02, d: 0.15 }, filter: { type: 'bandpass', freq: 900, to: 2600, time: 0.12, q: 5 } });
  for (const n of [57, 58, 63.5]) s.tone(0.1, { type: 'triangle', freq: s.m(n), gain: 0.065, dur: 1.1, env: { a: 0.6, d: 0.1, s: 0.8, r: 0.5 }, vib: { rate: 4, depth: 25 } });
  s.swell(0, { len: 1, gain: 0.07, from: 300, to: 2500, q: 3 });
  s.fm(0.1, { freq: s.f(110), ratio: 1.414, index: 2, gain: 0.05, dur: 1.1, env: { a: 0.6, d: 0.1, s: 1, r: 0.5 } });
}, { wet: 0.45, gap: 0.3, max: 2 });

def('stone_grind', 'world', (s) => {
  s.noise(0, { color: 'brown', gain: 0.5, dur: 1.1, env: { a: 0.1, d: 0.1, s: 1, r: 0.3 }, filter: { type: 'bandpass', freq: 380, q: 1.2 }, am: { rate: 23, depth: 0.8, type: 'sawtooth' } });
  s.noise(0, { gain: 0.09, dur: 1.1, env: { a: 0.1, d: 0.1, s: 1, r: 0.3 }, filter: { type: 'bandpass', freq: 1800, q: 2 }, am: { rate: 31, depth: 0.9 } });
  s.crackle(0, { count: 20, span: 1.1, freq: 2200, gain: 0.05 });
  s.tone(0, { type: 'sawtooth', freq: 48, gain: 0.06, dur: 1.1, env: { a: 0.1, d: 0.1, s: 1, r: 0.3 }, filter: { freq: 200 } });
}, { wet: 0.25, gap: 0.3, max: 2 });

// =============================================================================================
// Crowd & social
// =============================================================================================
const crowdPan = (s: SfxVoice) => s.rr(-0.8, 0.8);

def('crowd_gasp', 'social', (s) => {
  for (let i = 0; i < 6; i++) {
    s.noise(s.rr(0, 0.05), { color: 'pink', gain: 0.07, env: { a: s.rr(0.08, 0.14), d: 0.25 }, filter: { type: 'bandpass', freq: s.rr(1400, 2400), to: s.rr(2600, 3400), time: 0.15, q: 3 }, pan: crowdPan(s) });
    s.voice(s.rr(0, 0.05), { freq: s.f(s.rr(220, 360)), to: s.f(s.rr(300, 460)), glide: 0.12, vowel: V.a, vowelTo: V.o, morph: 0.2, gain: 0.018, env: { a: 0.08, d: 0.2 }, pan: crowdPan(s) });
  }
  s.noise(0, { color: 'pink', gain: 0.16, env: { a: 0.12, d: 0.3 }, filter: { type: 'bandpass', freq: 1200, to: 2500, time: 0.15, q: 1.2 } });
}, { wet: 0.35, gap: 0.4, max: 2 });

def('crowd_cheer', 'social', (s) => {
  s.noise(0, { color: 'pink', gain: 0.2, dur: 1.6, env: { a: 0.15, d: 0.2, s: 0.8, r: 0.8 }, filter: { type: 'bandpass', freq: 1100, q: 0.8 }, am: { rate: 5, depth: 0.2 } });
  const vs = [V.a, V.ae, V.e, V.o];
  for (let i = 0; i < 10; i++) {
    s.voice(s.rr(0, 0.25), { freq: s.f(s.rr(180, 420)), to: s.f(s.rr(250, 520)), glide: s.rr(0.2, 0.6), vowel: s.pick(vs), vowelTo: s.pick(vs), morph: 0.5, q: 6, gain: 0.032, dur: s.rr(0.6, 1.3), env: { a: 0.06, d: 0.1, s: 0.9, r: 0.4 }, vib: { rate: s.rr(5, 8), depth: s.rr(20, 60) }, pan: crowdPan(s) });
  }
  for (let i = 0; i < 2; i++) s.tone(s.rr(0.1, 0.5), { freq: s.f(s.rr(1800, 2400)), to: s.f(s.rr(2600, 3000)), glide: 0.25, gain: 0.028, dur: 0.4, env: { a: 0.03, d: 0.1, s: 0.9, r: 0.1 }, pan: crowdPan(s) });
  s.crackle(0.2, { count: 40, span: 1.4, freq: 1500, spread: 0.6, gain: 0.07, decay: 0.02, q: 1.5 });
}, { wet: 0.4, gap: 0.5, max: 2 });

def('crowd_laugh', 'social', (s) => {
  s.noise(0, { color: 'pink', gain: 0.07, dur: 1.0, env: { a: 0.1, d: 0.1, s: 0.8, r: 0.4 }, filter: { type: 'bandpass', freq: 900, q: 1 } });
  for (let i = 0; i < 8; i++) {
    const f0 = s.rr(180, 380);
    const d = s.rr(0.7, 1.1);
    s.voice(s.rr(0, 0.15), { freq: s.f(f0), to: s.f(f0 * 0.8), glide: d, vowel: V.a, vowelTo: s.pick([V.a, V.ae, V.e]), morph: d, q: 6, gain: 0.042, dur: d, env: { a: 0.03, d: 0.1, s: 0.9, r: 0.25 }, am: { rate: s.rr(5.5, 7), depth: 0.95 }, breath: 0.02, pan: crowdPan(s) });
  }
}, { wet: 0.35, gap: 0.5, max: 2 });

def('crowd_boo', 'social', (s) => {
  s.noise(0, { color: 'pink', gain: 0.08, dur: 1.2, env: { a: 0.2, d: 0.1, s: 0.8, r: 0.4 }, filter: { type: 'bandpass', freq: 400, q: 1 } });
  for (let i = 0; i < 10; i++) {
    const f0 = s.rr(110, 200);
    s.voice(s.rr(0, 0.2), { freq: s.f(f0), to: s.f(f0 * 0.78), glide: 1.2, vowel: V.u, vowelTo: V.o, morph: 0.8, q: 7, gain: 0.045, dur: s.rr(1, 1.4), env: { a: 0.15, d: 0.1, s: 0.9, r: 0.4 }, vib: { rate: s.rr(4, 6), depth: 30 }, pan: crowdPan(s) });
  }
}, { wet: 0.35, gap: 0.5, max: 2 });

def('betrayal_sting', 'social', (s) => {
  for (const n of [38, 44, 51]) s.tone(0, { type: 'sawtooth', unison: 3, spread: 18, freq: s.m(n), gain: 0.12, dur: 0.5, env: { a: 0.005, d: 0.3, s: 0.5, r: 0.6 }, filter: { freq: 500, env: { peak: 3000, a: 0.005, d: 0.4 }, q: 3 } });
  s.tone(0.05, { type: 'sawtooth', unison: 4, spread: 25, freq: s.m(81), to: s.m(69), glide: 1.0, gain: 0.05, dur: 1, env: { a: 0.02, d: 0.1, s: 0.8, r: 0.4 }, filter: { freq: 3500 }, vib: { rate: 6, depth: 20 } });
  s.drum(0, { freq: 40, from: 2, decay: 0.9, gain: 0.5, noise: 0.18 });
  s.bell(0, { freq: s.m(56), partials: P.church, decay: 2.5, gain: 0.14 });
}, { wet: 0.45, gap: 0.5, max: 2 });

def('rescue_sting', 'social', (s) => {
  const br = (dt: number, n: number, dur: number, g: number) =>
    s.tone(dt, { type: 'sawtooth', unison: 3, spread: 10, freq: s.m(n), gain: g, dur, env: { a: 0.015, d: 0.3, s: 0.7, r: 0.5 }, filter: { freq: 1200, env: { peak: 3500, a: 0.02, d: 0.2 }, q: 2 } });
  br(0, 67, 0.1, 0.1);
  for (const n of [60, 64, 67, 72]) br(0.14, n, 0.8, 0.065);
  [84, 88, 91, 96].forEach((n, i) => s.bell(0.14 + i * 0.05, { freq: s.m(n), partials: P.glass, decay: 0.8, gain: 0.065 }));
  s.drum(0.14, { freq: 98, from: 1.3, decay: 0.8, gain: 0.34, noise: 0.1 });
}, { wet: 0.4, echo: 0.15, gap: 0.5, max: 2 });

def('vote_cast', 'social', (s) => {
  s.drum(0, { freq: s.f(140), from: 1.7, decay: 0.09, gain: 0.45, click: 0.1 });
  s.noise(0, { color: 'pink', gain: 0.15, env: { a: 0.002, d: 0.06 }, filter: { type: 'bandpass', freq: 2200, q: 1.5 } });
  s.bell(0.06, { freq: s.f(1568), partials: P.glass, decay: 0.5, gain: 0.12 });
}, { wet: 0.25, gap: 0.1 });

def('verdict', 'social', (s) => {
  for (const dt of [0, 0.3]) {
    s.bell(dt, { freq: s.f(420), partials: P.wood, decay: 0.12, gain: 0.34 });
    s.drum(dt, { freq: 120, from: 1.5, decay: 0.15, gain: 0.4, click: 0.1 });
  }
  s.drum(0.6, { freq: 45, from: 2, decay: 1.2, gain: 0.6, noise: 0.18 });
  for (const n of [48, 55, 60, 65]) s.tone(0.6, { type: 'sawtooth', unison: 2, spread: 10, freq: s.m(n), gain: 0.05, dur: 1.4, env: { a: 0.02, d: 0.4, s: 0.7, r: 1 }, filter: { freq: 1600 } });
  s.bell(0.6, { freq: s.f(131), partials: P.church, decay: 3, gain: 0.22 });
}, { wet: 0.45, gap: 0.8, max: 1 });

def('reveal_swell', 'social', (s) => {
  s.swell(0, { len: 1.8, gain: 0.2, from: 200, to: 9000 });
  for (const n of [50, 57, 62, 66, 68, 73]) s.tone(0, { type: 'sawtooth', unison: 2, spread: 12, freq: s.m(n), gain: 0.04, dur: 1.8, env: { a: 1.6, d: 0.2, s: 1, r: 1.2 }, filter: { freq: 400, to: 5000, time: 1.8 } });
  [74, 78, 81, 86].forEach((n, i) => s.bell(1.8 + i * 0.04, { freq: s.m(n), partials: P.glass, decay: 2, gain: 0.09 }));
  s.drum(1.8, { freq: 45, from: 2, decay: 1.5, gain: 0.5 });
  s.noise(1.8, { gain: 0.07, env: { a: 0.005, d: 1.5 }, filter: { type: 'highpass', freq: 6000 } });
}, { wet: 0.5, echo: 0.1, gap: 1, max: 1 });

// =============================================================================================
// Ambience one-shots
// =============================================================================================
def('wind_gust', 'ambient', (s) => {
  const pan = s.rr(-0.6, 0.6);
  s.noise(0, { color: 'pink', gain: 0.38, dur: 1.3, env: { a: 0.5, d: 0.2, s: 0.8, r: 0.6 }, filter: { type: 'bandpass', freq: s.f(s.rr(250, 350)), to: s.f(s.rr(1100, 1500)), time: 0.7, q: 2.5 }, pan, panTo: -pan, panTime: 1.6, am: { rate: 3.3, depth: 0.4 } });
  s.noise(0, { gain: 0.07, dur: 1.3, env: { a: 0.5, d: 0.1, s: 0.8, r: 0.5 }, filter: { type: 'bandpass', freq: 3000, to: 5000, time: 1, q: 4 } });
}, { wet: 0.3, gap: 0.3, max: 3 });

def('space_hum', 'ambient', (s) => {
  s.tone(0, { freq: s.f(55), gain: 0.28, dur: 2.2, env: { a: 0.5, d: 0.2, s: 1, r: 0.8 }, trem: { rate: 0.7, depth: 0.3 } });
  s.tone(0, { freq: s.f(110.4), gain: 0.11, dur: 2.2, env: { a: 0.7, d: 0.1, s: 1, r: 0.8 } });
  s.tone(0, { type: 'sawtooth', unison: 3, spread: 12, freq: s.f(82.4), gain: 0.05, dur: 2.2, env: { a: 0.8, d: 0.1, s: 1, r: 0.8 }, filter: { freq: 300, to: 900, time: 2 } });
  s.noise(0, { color: 'pink', gain: 0.05, dur: 2.2, env: { a: 0.8, d: 0.1, s: 1, r: 0.8 }, filter: { type: 'bandpass', freq: 2000, q: 6 } });
}, { wet: 0.4, gap: 0.5, max: 2 });

def('portal', 'magic', (s) => {
  s.fm(0, { freq: s.f(220), to: s.f(440), glide: 1.2, ratio: 1.5, index: 5, indexTo: 1, indexTime: 1.2, gain: 0.09, dur: 1.2, env: { a: 0.3, d: 0.1, s: 0.9, r: 0.4 }, vib: { rate: 6, to: 14, time: 1.2, depth: 60 } });
  s.noise(0, { gain: 0.17, dur: 1.2, env: { a: 0.4, d: 0.1, s: 0.8, r: 0.4 }, filter: { type: 'bandpass', freq: 300, to: 3000, time: 1.2, q: 3 }, am: { rate: 5, to: 12, time: 1.2, depth: 0.6 } });
  for (let i = 0; i < 5; i++) s.bell(s.rr(0.2, 1.2), { freq: s.m(s.pick([84, 88, 91, 95, 96])), partials: P.glass, decay: 0.5, gain: 0.04, pan: s.rr(-0.7, 0.7) });
}, { wet: 0.45, echo: 0.2, gap: 0.3, max: 2 });

def('confetti_pop', 'reward', (s) => {
  s.noise(0, { gain: 0.5, env: { a: 0.001, d: 0.05 }, filter: { type: 'bandpass', freq: 1800, q: 0.8 } });
  s.tone(0, { freq: s.f(220), to: s.f(90), glide: 0.05, gain: 0.34, env: { a: 0.001, d: 0.08 } });
  s.crackle(0.03, { count: 22, span: 0.8, freq: 4500, spread: 1, gain: 0.07, decay: 0.008, fade: true });
  s.tone(0.02, { freq: s.f(1800), to: s.f(3200), glide: 0.3, gain: 0.035, env: { a: 0.02, d: 0.3 } });
}, { wet: 0.25, gap: 0.08, max: 3 });

def('countdown_beep', 'system', (s) => {
  s.tone(0, { type: 'square', freq: s.f(880), gain: 0.09, dur: 0.12, env: { a: 0.003, d: 0.05, s: 0.85, r: 0.04 }, filter: { freq: 3500, q: 2 } });
  s.tone(0, { freq: s.f(880), gain: 0.14, dur: 0.12, env: { a: 0.003, d: 0.05, s: 0.85, r: 0.04 } });
}, { ui: true, wet: 0.15, gap: 0.2 });

def('go_horn', 'system', (s) => {
  for (const n of [57, 64, 69, 73]) s.tone(0, { type: 'sawtooth', unison: 3, spread: 12, freq: s.m(n), gain: 0.07, dur: 0.7, env: { a: 0.03, d: 0.2, s: 0.8, r: 0.3 }, filter: { freq: 1500, env: { peak: 4000, a: 0.04, d: 0.3 }, q: 2 }, vib: { rate: 5.5, depth: 12, delay: 0.2 } });
  s.drum(0, { freq: 55, from: 2, decay: 0.4, gain: 0.45 });
  s.noise(0, { gain: 0.09, env: { a: 0.005, d: 0.5 }, filter: { type: 'highpass', freq: 5000 } });
}, { wet: 0.3, gap: 0.3 });

// =============================================================================================
// Stingers (GDD 15.2): room clear / fail, title acquired, the Tide
// =============================================================================================
def('clear_sting', 'system', (s) => {
  [72, 76, 79, 84, 88].forEach((n, i) => s.bell(i * 0.075, { freq: s.m(n), partials: P.glass, decay: 1.1 + i * 0.15, gain: 0.13, strike: i === 0 ? 0.03 : 0 }));
  for (const n of [60, 64, 67]) s.tone(0.3, { type: 'triangle', freq: s.m(n), gain: 0.05, dur: 0.6, env: { a: 0.02, d: 0.3, s: 0.6, r: 0.6 } });
  s.drum(0.3, { freq: 55, from: 2, decay: 0.5, gain: 0.34 });
  s.noise(0.3, { gain: 0.05, env: { a: 0.01, d: 0.9 }, filter: { type: 'highpass', freq: 7500 } });
}, { wet: 0.4, echo: 0.2, gap: 0.5, max: 1 });

def('fail_sting', 'system', (s) => {
  [79, 75, 72, 67].forEach((n, i) => s.bell(i * 0.16, { freq: s.m(n), partials: P.church, decay: 1.4, gain: 0.15, bright: 0.6 }));
  s.tone(0.48, { type: 'sawtooth', unison: 2, spread: 14, freq: s.m(48), to: s.m(47), glide: 1, gain: 0.07, dur: 0.9, env: { a: 0.05, d: 0.3, s: 0.7, r: 0.6 }, filter: { freq: 700 } });
  s.drum(0.48, { freq: 42, from: 1.6, decay: 0.8, gain: 0.38 });
}, { wet: 0.45, gap: 0.5, max: 1 });

def('title_fanfare', 'reward', (s) => {
  [79, 84, 88].forEach((n, i) => s.bell(i * 0.14, { freq: s.m(n), partials: P.celesta, decay: 1.6, gain: 0.16, strike: 0.03 }));
  for (const n of [67, 72, 76, 79]) s.bell(0.42, { freq: s.m(n + 12), partials: P.glass, decay: 2, gain: 0.08 });
  for (const n of [60, 67, 72, 76]) s.tone(0.42, { type: 'sawtooth', unison: 3, spread: 10, freq: s.m(n), gain: 0.05, dur: 0.8, env: { a: 0.04, d: 0.3, s: 0.75, r: 0.6 }, filter: { freq: 1200, env: { peak: 3500, a: 0.05, d: 0.3 }, q: 1.5 }, vib: { rate: 5.5, depth: 10, delay: 0.3 } });
  s.drum(0.42, { freq: 50, from: 2, decay: 0.9, gain: 0.4, noise: 0.1 });
  s.crackle(0.45, { count: 14, span: 0.9, freq: 5500, gain: 0.04, decay: 0.008, fade: true });
}, { wet: 0.4, echo: 0.15, gap: 1, max: 1 });

def('tide_swell', 'world', (s) => {
  s.noise(0, { color: 'brown', gain: 0.4, env: { a: 1.4, d: 0.1, s: 0, r: 0.05 }, filter: { freq: 120, to: 500, time: 1.4 } });
  s.swell(0, { len: 1.4, gain: 0.1, from: 200, to: 2400, color: 'pink' });
  s.bell(1.4, { freq: s.f(65.4), partials: P.gong, decay: 4, gain: 0.42, a: 0.03, strike: 0.08, jitter: 0.01 });
  s.drum(1.4, { freq: 36, from: 1.5, decay: 1.4, gain: 0.45 });
}, { wet: 0.5, gap: 2, max: 1 });

// =============================================================================================
// Extras for KNOTSPIRE (candle Wicks + door-letter motifs from GDD 3.4)
// =============================================================================================
def('snuff', 'action', (s) => {
  s.noise(0, { color: 'pink', gain: 0.3, env: { a: 0.01, d: 0.25 }, filter: { freq: 1400, to: 300, time: 0.25 } });
  s.tone(0, { freq: s.f(180), to: s.f(80), glide: 0.15, gain: 0.2, env: { a: 0.002, d: 0.15 } });
  s.noise(0.08, { gain: 0.04, env: { a: 0.1, d: 0.5 }, filter: { type: 'highpass', freq: 4000 } });
}, { wet: 0.25, gap: 0.1 });

def('ignite', 'action', (s) => {
  s.noise(0, { gain: 0.2, env: { a: 0.05, d: 0.2 }, filter: { type: 'bandpass', freq: 400, to: 2500, time: 0.15, q: 1.2 } });
  s.crackle(0.08, { count: 10, span: 0.4, freq: 2500, gain: 0.07, fade: true });
  s.tone(0, { freq: s.f(150), to: s.f(300), glide: 0.1, gain: 0.14, env: { a: 0.01, d: 0.2 } });
}, { wet: 0.2, gap: 0.1 });

def('hidden_piece', 'reward', (s) => {
  // reversed music box: swelling (backwards) notes then one true ring
  [88, 83, 79, 76].forEach((n, i) => s.tone(i * 0.16, { type: 'sine', freq: s.m(n), gain: 0.07, dur: 0.17, env: { a: 0.15, d: 0.01, s: 1, r: 0.02 } }));
  s.bell(0.66, { freq: s.m(91), partials: P.celesta, decay: 1.8, gain: 0.16 });
  s.bell(0.66, { freq: s.m(84), partials: P.celesta, decay: 1.8, gain: 0.1 });
}, { wet: 0.45, echo: 0.3, gap: 0.5 });

def('door_motif_a', 'motif', (s) => {
  [0, 0.18, 0.36].forEach((dt, i) => s.drum(dt, { freq: s.f([98, 82, 65][i]!), from: 1.7, decay: 0.5, gain: 0.5, noise: 0.2, noiseFreq: 600 }));
}, { wet: 0.35, gap: 0.3 });
def('door_motif_b', 'motif', (s) => {
  [74, 77, 81].forEach((n, i) => s.pluck(i * 0.14, { freq: s.m(n), decay: 0.3, bright: 0.4, gain: 0.3 }));
  [0, 0.14, 0.28, 0.42].forEach((dt) => s.noise(dt + 0.07, { gain: 0.15, env: { a: 0.001, d: 0.012 }, filter: { type: 'bandpass', freq: 3200, q: 4 } }));
}, { wet: 0.3, gap: 0.3 });
def('door_motif_c', 'motif', (s) => {
  [62, 69, 74].forEach((n, i) => s.pluck(i * 0.1, { freq: s.m(n), decay: 1.5, bright: 0.6, gain: 0.26 }));
  s.noise(0, { color: 'pink', gain: 0.1, dur: 0.8, env: { a: 0.3, s: 0.8, r: 0.4 }, filter: { type: 'bandpass', freq: 600, to: 1400, time: 0.8, q: 2 } });
}, { wet: 0.3, gap: 0.3 });
def('door_motif_d', 'motif', (s) => {
  [74, 72, 70, 69].forEach((n, i) => {
    s.pluck(i * 0.12, { freq: s.m(n), decay: 0.5, bright: 0.9, gain: 0.2 });
    s.pluck(0.24 + i * 0.12, { freq: s.m(n - 12), decay: 0.5, bright: 0.9, gain: 0.16 });
  });
}, { wet: 0.3, gap: 0.3 });
def('door_motif_e', 'motif', (s) => {
  [0, 4, 6, 11, 14].forEach((st, i) => s.tone(i * 0.07, { type: 'square', freq: s.m(71 + st), gain: 0.06, dur: 0.05, env: { a: 0.001, d: 0.02, s: 0.8, r: 0.02 }, filter: { freq: 2600, q: 6 } }));
  s.tone(0.12, { type: 'square', freq: s.m(83), gain: 0.03, dur: 0.3, env: { a: 0.001, d: 0.1, s: 0.5, r: 0.1 }, vib: { rate: 18, depth: 90, type: 'square' } });
}, { wet: 0.3, echo: 0.3, gap: 0.3 });
def('door_motif_x', 'motif', (s) => {
  [76, 79, 83, 88].forEach((n, i) => s.tone(i * 0.15, { freq: s.m(n), gain: 0.07, dur: 0.16, env: { a: 0.14, d: 0.01, s: 1, r: 0.02 } }));
}, { wet: 0.45, echo: 0.2, gap: 0.3 });
def('door_motif_crown', 'motif', (s) => {
  for (const n of [48, 55, 60, 64, 67]) s.tone(0, { type: 'sawtooth', freq: s.m(n), gain: 0.04, dur: 1.2, env: { a: 0.08, d: 0.2, s: 0.9, r: 0.8 }, filter: { freq: 1800 } });
  for (const n of [60, 64, 67]) s.voice(0.05, { freq: s.m(n + 12), vowel: V.a, vowelTo: V.o, morph: 1.2, gain: 0.05, dur: 1.2, env: { a: 0.2, d: 0.2, s: 0.9, r: 0.8 }, vib: { rate: 5, depth: 15, delay: 0.3 }, unison: 2, spread: 12 });
}, { wet: 0.5, gap: 0.5 });

// =============================================================================================
// Wick babble (GDD 15.3): a speech bubble becomes formant syllables of 70-110 ms whose vowels
// come from the letters and whose contour follows the phrase type. Pure planning; AudioEngine
// .babble() voices the plan.
// =============================================================================================
export type BabbleVowel = 'a' | 'e' | 'i' | 'o' | 'u';
export type BabbleMood = 'statement' | 'question' | 'shout' | 'sorry';
export interface Syllable { t: number; dur: number; f0: number; f1: number; vowel: BabbleVowel; gain: number }
export interface BabbleOpts {
  f0?: number; // speaking pitch, Hz (players 180-420)
  resolve?: boolean; // the Resolve tell drops the voice a perfect fourth
  maxSyllables?: number;
}

export function babbleMood(text: string): BabbleMood {
  const t = text.trim().toLowerCase();
  if (/\b(sorry|oops|my bad)\b/.test(t)) return 'sorry';
  if (/\?\W*$/.test(t)) return 'question';
  if (/!\W*$/.test(t) || /\b(liar|help)\b/.test(t)) return 'shout';
  return 'statement';
}

const VOWEL_OF: Record<string, BabbleVowel> = { a: 'a', e: 'e', i: 'i', y: 'i', o: 'o', u: 'u' };
const BABBLE_VOWELS: readonly BabbleVowel[] = ['a', 'e', 'i', 'o', 'u'];

export function planBabble(text: string, o: BabbleOpts = {}): Syllable[] {
  const mood = babbleMood(text);
  const base = clamp(Number.isFinite(o.f0) ? o.f0! : 300, 80, 900) * (o.resolve ? Math.pow(2, -5 / 12) : 1);
  const max = Math.max(1, Math.floor(o.maxSyllables ?? 16));
  const tokens = text.toLowerCase().normalize('NFKD').match(/[a-z0-9']+|[.,!?;:]/g) ?? [];
  const units: { key: string; vowel: BabbleVowel | null; wordStart: boolean; pause: number }[] = [];
  for (const tok of tokens) {
    if (/^[.,!?;:]$/.test(tok)) {
      const last = units[units.length - 1];
      if (last) last.pause = Math.max(last.pause, tok === ',' || tok === ';' ? 0.13 : 0.22);
      continue;
    }
    // one syllable per vowel group (digits and vowel-less words still get one)
    const groups = tok.match(/[^aeiouy]*[aeiouy]+/g) ?? [tok];
    const n = clamp(groups.length, 1, 4);
    for (let i = 0; i < n; i++) {
      const g = groups[i] ?? tok;
      const v = /[aeiouy]/.exec(g)?.[0];
      units.push({ key: `${tok}:${i}:${g}`, vowel: v ? VOWEL_OF[v]! : null, wordStart: i === 0, pause: i === n - 1 ? 0.045 : 0.016 });
    }
  }
  if (!units.length) return [];
  const used = units.slice(0, max);
  const N = used.length;
  const out: Syllable[] = [];
  let t = 0;
  for (let i = 0; i < N; i++) {
    const u = used[i]!;
    const h = hash32('babble', u.key);
    const k = i / Math.max(1, N - 1); // 0..1 through the phrase
    const dur = 0.07 + 0.04 * ((h & 1023) / 1023);
    let semi = ((h >>> 10) % 5) - 2; // cosmetic wobble, stable per syllable
    let bend = 0; // semitones glided within the syllable
    let gain = u.wordStart ? 1 : 0.85;
    if (mood === 'statement') semi -= 3 * k;
    else if (mood === 'question') {
      if (i === N - 1) { semi += 7; bend = 3; } else if (i === N - 2) semi += 3;
    } else if (mood === 'shout') {
      semi += 5;
      gain *= 1.2;
      if (i === N - 1) bend = -2;
    } else {
      semi -= 6 * k;
      bend = -1.5;
    }
    const f0 = base * Math.pow(2, semi / 12);
    out.push({ t, dur, f0, f1: f0 * Math.pow(2, bend / 12), vowel: u.vowel ?? BABBLE_VOWELS[(h >>> 20) % 5]!, gain });
    t += dur + (i < N - 1 ? u.pause : 0);
  }
  return out;
}

/** Voices a babble plan: sawtooth through small-creature formants (shifted up ~a fourth). */
export function babbleRecipe(plan: readonly Syllable[]): SfxDef {
  return {
    cat: 'social',
    wet: 0.12,
    max: 6,
    play(s) {
      for (const y of plan) {
        s.voice(y.t, {
          freq: s.f(y.f0), to: y.f1 !== y.f0 ? s.f(y.f1) : undefined, glide: y.dur, vowel: V[y.vowel], formantShift: 1.3, q: 7,
          gain: 0.17 * y.gain, dur: y.dur, env: { a: 0.008, d: 0.04, s: 0.85, r: 0.03 },
        });
      }
    },
  };
}

// =============================================================================================
// Loops: continuous beds (machinery, weather, ambience). Built once, run until stopped; their
// pitch/volume/position can be driven live (e.g. steam valve pressure, wind by altitude).
// =============================================================================================
/** Pure: sparse random pops (fire crackle, embers). Normalised to peak 1. */
export function crackleData(sr: number, seconds: number, perSecond: number, r: () => number): Float32Array {
  const len = Math.max(1, Math.floor(sr * seconds));
  const out = new Float32Array(len);
  const n = Math.max(1, Math.round(perSecond * seconds));
  for (let k = 0; k < n; k++) {
    const at = Math.floor(r() * len);
    const amp = Math.pow(r(), 2.2) * (r() < 0.1 ? 1 : 0.45);
    const dec = sr * (0.0006 + r() * 0.0035);
    const color = 0.3 + r() * 0.6; // one-pole smoothing: small = darker pop
    let y = 0;
    const L = Math.min(len - at, Math.floor(dec * 6));
    for (let i = 0; i < L; i++) {
      y += color * (r() * 2 - 1 - y);
      out[at + i] = out[at + i]! + y * amp * Math.exp(-i / dec);
    }
  }
  return normalise(out);
}

/** Pure: clock escapement, `period` seconds per tick, alternating tick (bright) / tock (dull). */
export function tickData(sr: number, period: number): Float32Array {
  const len = Math.max(2, Math.floor(sr * period * 2));
  const out = new Float32Array(len);
  for (let k = 0; k < 2; k++) {
    const at = Math.floor(sr * period * k);
    const f = k === 0 ? 3100 : 2150;
    const dec = sr * (k === 0 ? 0.006 : 0.009);
    const L = Math.min(len - at, Math.floor(dec * 7));
    for (let i = 0; i < L; i++) {
      const tt = i / sr;
      out[at + i] = Math.exp(-i / dec) * (Math.sin(2 * Math.PI * f * tt) * 0.7 + Math.sin(2 * Math.PI * f * 1.73 * tt) * 0.3);
    }
  }
  return normalise(out);
}

/** Pure: water drips (rising sine blips) scattered over the buffer. */
export function dripData(sr: number, seconds: number, count: number, r: () => number): Float32Array {
  const len = Math.max(1, Math.floor(sr * seconds));
  const out = new Float32Array(len);
  for (let k = 0; k < count; k++) {
    const at = Math.floor(r() * (len - sr * 0.1));
    const f0 = 500 + r() * 700;
    const f1 = f0 * (1.8 + r() * 0.8);
    const amp = 0.3 + r() * 0.7;
    const L = Math.floor(sr * 0.09);
    let ph = 0;
    for (let i = 0; i < L && at + i < len; i++) {
      const x = i / L;
      const f = f0 + (f1 - f0) * Math.min(1, x * 3);
      ph += (2 * Math.PI * f) / sr;
      const env = Math.min(1, i / (sr * 0.001)) * Math.exp(-x * 7);
      out[at + i] = out[at + i]! + Math.sin(ph) * env * amp;
    }
  }
  return normalise(out);
}

function normalise(d: Float32Array): Float32Array {
  let pk = 0;
  for (let i = 0; i < d.length; i++) pk = Math.max(pk, Math.abs(d[i]!));
  if (pk > 0) for (let i = 0; i < d.length; i++) d[i] = d[i]! / pk;
  return d;
}

interface LoopFilter { type?: BiquadFilterType; freq: number; q?: number }

/** Builder for a loop's node graph; the engine owns `out` and routes it. */
export class LoopKit {
  readonly ctx: Ctx;
  readonly out: GainNode;
  readonly srcs: AudioScheduledSourceNode[] = [];
  readonly nodes: AudioNode[] = [];
  private readonly pitched: [AudioParam, number][] = [];
  private readonly offsets = new Map<AudioScheduledSourceNode, number>();
  private readonly rng: () => number;
  private stopped = false;
  constructor(ctx: Ctx, rng: () => number) {
    this.ctx = ctx;
    this.rng = rng;
    this.out = this.add(ctx.createGain());
    this.out.gain.value = 0;
  }
  r(): number {
    return this.rng();
  }
  private add<T extends AudioNode>(n: T): T {
    this.nodes.push(n);
    return n;
  }
  private chainTo(head: AudioNode, filters: readonly LoopFilter[], gain: number): { amp: GainNode; filters: BiquadFilterNode[] } {
    let cur = head;
    const fs: BiquadFilterNode[] = [];
    for (const f of filters) {
      const b = this.add(this.ctx.createBiquadFilter());
      b.type = f.type ?? 'lowpass';
      b.frequency.value = fclampK(this.ctx, f.freq);
      b.Q.value = f.q ?? (b.type === 'lowpass' || b.type === 'highpass' ? 0.5 : 1);
      cur.connect(b);
      cur = b;
      fs.push(b);
    }
    const amp = this.add(this.ctx.createGain());
    amp.gain.value = gain;
    cur.connect(amp).connect(this.out);
    return { amp, filters: fs };
  }
  /** LFO onto any param (depth in the param's units). */
  lfo(param: AudioParam, rate: number, depth: number, type: OscillatorType = 'sine'): void {
    const o = this.add(this.ctx.createOscillator());
    o.type = type;
    o.frequency.value = rate;
    const g = this.add(this.ctx.createGain());
    g.gain.value = depth;
    o.connect(g).connect(param);
    this.srcs.push(o);
  }
  osc(o: { type?: OscillatorType; freq: number; gain: number; detune?: number; filters?: readonly LoopFilter[] }): { osc: OscillatorNode; amp: GainNode } {
    const n = this.add(this.ctx.createOscillator());
    n.type = o.type ?? 'sine';
    n.frequency.value = fclampK(this.ctx, o.freq);
    if (o.detune) n.detune.value = o.detune;
    this.pitched.push([n.frequency, n.frequency.value]);
    this.srcs.push(n);
    const { amp } = this.chainTo(n, o.filters ?? [], o.gain);
    return { osc: n, amp };
  }
  noise(o: { color?: NoiseColor; gain: number; filters?: readonly LoopFilter[]; rate?: number }): { amp: GainNode; filters: BiquadFilterNode[] } {
    const s = this.add(this.ctx.createBufferSource());
    s.buffer = noiseBuffer(this.ctx, o.color ?? 'white');
    s.loop = true;
    const rate = o.rate ?? 1;
    s.playbackRate.value = rate;
    this.pitched.push([s.playbackRate, rate]);
    this.srcs.push(s);
    this.offsets.set(s, this.rng() * 2.5);
    return this.chainTo(s, o.filters ?? [], o.gain);
  }
  buffer(key: string, make: (sr: number) => Float32Array, o: { gain: number; filters?: readonly LoopFilter[]; rate?: number }): { amp: GainNode; filters: BiquadFilterNode[] } {
    const s = this.add(this.ctx.createBufferSource());
    s.buffer = loopBuffer(this.ctx, key, make);
    s.loop = true;
    const rate = o.rate ?? 1;
    s.playbackRate.value = rate;
    this.pitched.push([s.playbackRate, rate]);
    this.srcs.push(s);
    this.offsets.set(s, this.rng() * s.buffer.duration);
    return this.chainTo(s, o.filters ?? [], o.gain);
  }
  start(t: number, fadeIn: number): void {
    for (const s of this.srcs) {
      const off = this.offsets.get(s);
      if (off !== undefined) (s as AudioBufferSourceNode).start(t, off);
      else s.start(t);
    }
    this.out.gain.setValueAtTime(0, t);
    this.out.gain.linearRampToValueAtTime(1, t + Math.max(0.02, fadeIn));
  }
  setPitch(p: number, t: number): void {
    const k = clamp(p, 0.25, 4);
    for (const [param, base] of this.pitched) param.setTargetAtTime(base * k, t, 0.06);
  }
  /** Fade out and release every node; returns when silent. */
  stop(t: number, fade: number): number {
    if (this.stopped) return t;
    this.stopped = true;
    const g = this.out.gain;
    const f = Math.max(0.02, fade);
    // setTarget starts from whatever the automation is at t, so this also works when scheduled ahead
    g.cancelScheduledValues(t);
    g.setTargetAtTime(0, t, f / 5);
    for (const s of this.srcs) s.stop(t + f + 0.05);
    const first = this.srcs[0];
    if (first) {
      const nodes = this.nodes;
      first.onended = () => {
        for (const n of nodes) {
          try {
            n.disconnect();
          } catch {
            /* gone */
          }
        }
      };
    }
    return t + f + 0.05;
  }
}

const fclampK = (ctx: Ctx, f: number): number => clamp(f, 8, ctx.sampleRate * 0.45);
const loopBufs = new WeakMap<Ctx, Map<string, AudioBuffer>>();
function loopBuffer(ctx: Ctx, key: string, make: (sr: number) => Float32Array): AudioBuffer {
  let m = loopBufs.get(ctx);
  if (!m) loopBufs.set(ctx, (m = new Map()));
  let b = m.get(key);
  if (!b) {
    const d = make(ctx.sampleRate);
    b = ctx.createBuffer(1, d.length, ctx.sampleRate);
    b.getChannelData(0).set(d);
    m.set(key, b);
  }
  return b;
}

export interface LoopDef {
  cat: SfxCategory;
  desc: string;
  gain?: number;
  wet?: number;
  build(k: LoopKit): void;
}

const seeded = (label: string): (() => number) => {
  const r = new Prng(hash32('loop', label));
  return () => r.next();
};

export const LOOPS: Readonly<Record<string, LoopDef>> = {
  hum: {
    cat: 'world', desc: 'arcane machinery hum', gain: 0.7,
    build(k) {
      const a = k.osc({ freq: 60, gain: 0.16 });
      k.osc({ freq: 120.3, gain: 0.07 });
      k.osc({ freq: 180, gain: 0.025 });
      const buzz = k.osc({ type: 'sawtooth', freq: 60, gain: 0.03, filters: [{ freq: 520, q: 2 }] });
      k.lfo(a.amp.gain, 0.23, 0.04);
      k.lfo(buzz.amp.gain, 3.1, 0.012);
    },
  },
  wind: {
    cat: 'ambient', desc: 'gusting wind', gain: 0.9, wet: 0.2,
    build(k) {
      const a = k.noise({ color: 'pink', gain: 0.32, filters: [{ type: 'bandpass', freq: 520, q: 0.9 }] });
      k.lfo(a.filters[0]!.frequency, 0.11 + k.r() * 0.05, 260);
      k.lfo(a.amp.gain, 0.07, 0.14);
      const w = k.noise({ gain: 0.05, filters: [{ type: 'bandpass', freq: 1500, q: 7 }] });
      k.lfo(w.filters[0]!.frequency, 0.05 + k.r() * 0.04, 520);
      k.lfo(w.amp.gain, 0.13, 0.04);
    },
  },
  fire: {
    cat: 'world', desc: 'crackling fire / brazier', gain: 0.9,
    build(k) {
      const roar = k.noise({ color: 'brown', gain: 0.35, filters: [{ freq: 420 }] });
      k.lfo(roar.amp.gain, 0.6, 0.1);
      k.buffer('crackle', (sr) => crackleData(sr, 4.3, 26, seeded('crackle')), { gain: 0.3, filters: [{ type: 'highpass', freq: 900 }] });
      k.noise({ color: 'pink', gain: 0.04, filters: [{ type: 'bandpass', freq: 2500, q: 0.7 }] });
    },
  },
  water: {
    cat: 'world', desc: 'babbling water', gain: 0.8, wet: 0.25,
    build(k) {
      const a = k.noise({ color: 'pink', gain: 0.18, filters: [{ type: 'bandpass', freq: 900, q: 0.6 }] });
      k.lfo(a.filters[0]!.frequency, 0.3, 200);
      k.buffer('bubbles', (sr) => dripData(sr, 3.7, 38, seeded('bubbles')), { gain: 0.14, filters: [{ type: 'highpass', freq: 400 }] });
    },
  },
  steam: {
    cat: 'world', desc: 'pressurised steam', gain: 0.8,
    build(k) {
      const a = k.noise({ gain: 0.26, filters: [{ type: 'highpass', freq: 2600 }, { type: 'peaking', freq: 6200, q: 1.2 }] });
      k.lfo(a.amp.gain, 7.3, 0.05);
      k.noise({ color: 'pink', gain: 0.06, filters: [{ type: 'bandpass', freq: 900, q: 1 }] });
    },
  },
  rumble: {
    cat: 'ambient', desc: 'deep stone rumble', gain: 1,
    build(k) {
      const a = k.noise({ color: 'brown', gain: 0.55, filters: [{ freq: 110 }] });
      k.lfo(a.amp.gain, 0.17, 0.2);
      const s = k.osc({ freq: 36, gain: 0.22 });
      k.lfo(s.amp.gain, 0.09, 0.08);
    },
  },
  space: {
    cat: 'ambient', desc: 'vast cosmic drone', gain: 0.8, wet: 0.45,
    build(k) {
      k.osc({ freq: 55, gain: 0.15 });
      k.osc({ freq: 82.6, gain: 0.07, detune: 3 });
      k.osc({ freq: 110.3, gain: 0.05 });
      const sh = k.noise({ color: 'pink', gain: 0.06, filters: [{ type: 'bandpass', freq: 2200, q: 9 }] });
      k.lfo(sh.filters[0]!.frequency, 0.04, 900);
      k.lfo(sh.amp.gain, 0.21, 0.03);
    },
  },
  clock: {
    cat: 'puzzle', desc: 'tick-tock escapement', gain: 0.6, wet: 0.15,
    build(k) {
      k.buffer('clock', (sr) => tickData(sr, 0.5), { gain: 0.25 });
    },
  },
  drips: {
    cat: 'ambient', desc: 'cave drips (the Well)', gain: 0.7, wet: 0.6,
    build(k) {
      k.buffer('drips', (sr) => dripData(sr, 5.3, 5, seeded('drips')), { gain: 0.3 });
      k.noise({ color: 'brown', gain: 0.08, filters: [{ freq: 160 }] });
    },
  },
  crowd: {
    cat: 'social', desc: 'distant crowd murmur', gain: 0.8, wet: 0.3,
    build(k) {
      const formants: [number, number][] = [[520, 0.12], [1200, 0.07], [2400, 0.03]];
      for (const [f, g] of formants) {
        const n = k.noise({ color: 'pink', gain: g, filters: [{ type: 'bandpass', freq: f, q: 3 }] });
        k.lfo(n.filters[0]!.frequency, 1.7 + k.r() * 2, f * 0.25);
        k.lfo(n.amp.gain, 2.9 + k.r() * 2.5, g * 0.6);
      }
    },
  },
};
export const LOOP_NAMES: readonly string[] = Object.keys(LOOPS);

// =============================================================================================
export const SFX: Readonly<Record<string, SfxDef>> = S;
export const SFX_NAMES: readonly string[] = Object.keys(S);

/** Names the game design requires; tests assert every one exists. */
export const REQUIRED_SFX: readonly string[] = [
  'ui_hover', 'ui_click', 'ui_confirm', 'ui_back', 'ui_error', 'ui_open', 'ui_close', 'ui_tab', 'type_tick',
  'system_chime', 'system_alert', 'system_glitch', 'quest_accept', 'reward_small', 'reward_big', 'coin', 'coins_many',
  'purchase', 'equip', 'unlock', 'jump', 'double_jump', 'land_soft', 'land_hard', 'footstep_stone', 'footstep_wet',
  'footstep_wood', 'footstep_metal', 'footstep_cloud', 'dive', 'slide', 'grab', 'lash', 'throw', 'catch', 'bonk', 'stun',
  'splash_small', 'splash_big', 'bubble', 'fall_whistle', 'fall_yelp', 'respawn', 'heal', 'hurt', 'door_rumble',
  'door_slam', 'door_open', 'door_glow', 'plate_down', 'plate_up', 'lever', 'valve_turn', 'steam_hiss', 'ice_freeze',
  'shatter', 'glass_ding', 'fork_low', 'fork_mid', 'fork_high', 'resonance_chord', 'bell_toll', 'gong', 'heartbeat',
  'timer_tick', 'timer_urgent', 'whoosh', 'magic_up', 'magic_down', 'teleport', 'rewind', 'glitch_burst', 'rope_creak',
  'rope_snap', 'knot_tie', 'croak', 'chirp', 'monster_growl', 'monster_screech', 'monster_stomp', 'slime_squelch',
  'eye_open', 'stone_grind', 'crowd_gasp', 'crowd_cheer', 'crowd_laugh', 'crowd_boo', 'betrayal_sting', 'rescue_sting',
  'vote_cast', 'verdict', 'reveal_swell', 'wind_gust', 'space_hum', 'portal', 'confetti_pop', 'countdown_beep', 'go_horn',
];

/** Fork pitches in Hz, exported so puzzle code can match visuals to notes (GDD 6.1). */
export const FORK_HZ = { fork_low: 261.63, fork_mid: 329.63, fork_high: 392.0, fork_trap: 466.16 } as const;

export const clampPitch = (p: number | undefined): number => clamp(p ?? 1, 0.25, 4);

export type { Formants };
