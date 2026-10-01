/**
 * AudioEngine: the game's single WebAudio entry point (implements AudioApi).
 *
 *   music strip ─ duck ─ level ┐
 *   sfx strip ──────── level ──┼─ world ─ muffle ─┐
 *   reverb + ping-pong delay ──┘                  ├─ sum ─ drive ─ hp20 ─ comp ─ limiter ─ softclip ─ master ─ out ─ destination
 *   ui strip ───────── level ─────────────────────┘                                                         └ analyser
 *
 * Every strip has dry / reverb-send / delay-send inputs so a bus volume scales its wet signal too.
 * The same graph is built on OfflineAudioContext for the ?test=1 metric renders.
 */
import type * as THREE from 'three';
import type { AudioApi } from '../api.ts';
import { babbleRecipe, clampPitch, LOOPS, LoopKit, planBabble, SFX, SfxVoice, type LoopDef, type SfxDef } from './sfx.ts';
import { MusicPlayer, TRACKS, type MusicState } from './music.ts';
import { analyse, clamp, irData, Prng, setSynthRandom, smoothstep, softClipCurve, type Ctx } from './synth.ts';

// =============================================================================================
// Volumes (persisted)
// =============================================================================================
export interface Volumes { master: number; music: number; sfx: number }
export const VOLUME_KEY = 'knotspire.audio.volumes.v1';
export const DEFAULT_VOLUMES: Readonly<Volumes> = { master: 0.8, music: 0.7, sfx: 0.9 };
const VOL_KEYS = ['master', 'music', 'sfx'] as const;

/** Pure: tolerant parse of the stored JSON; anything missing/corrupt falls back to defaults. */
export function parseVolumes(raw: string | null | undefined): Volumes {
  const out: Volumes = { ...DEFAULT_VOLUMES };
  if (!raw) return out;
  try {
    const o = JSON.parse(raw) as Record<string, unknown> | null;
    if (o && typeof o === 'object') {
      for (const k of VOL_KEYS) {
        const v = o[k];
        if (typeof v === 'number' && Number.isFinite(v)) out[k] = clamp(v, 0, 1);
      }
    }
  } catch {
    /* corrupt storage: defaults */
  }
  return out;
}

/** Slider (0..1) to gain: squared, so the slider feels roughly linear in loudness. */
export const volToGain = (v: number): number => {
  const k = clamp(Number.isFinite(v) ? v : 0, 0, 1);
  return k * k;
};

// =============================================================================================
// Spatialisation (pure)
// =============================================================================================
export interface XYZ { x: number; y: number; z: number }
export interface Spatial { gain: number; pan: number; lowpass: number; wet: number; dist: number }

/**
 * Listener-relative panning + distance model. Forward is flattened onto XZ; right = (-f.z, 0, f.x),
 * so with three.js' default camera forward (0,0,-1) a source at +X pans right. Sources behind are
 * slightly darker (head shadow), far sources lose highs (air) and gain reverb.
 */
export function spatialize(lp: XYZ, lf: XYZ, at: XYZ, o: { ref?: number; max?: number; rolloff?: number } = {}): Spatial {
  const ref = Math.max(0.01, o.ref ?? 3);
  const max = Math.max(ref + 0.01, o.max ?? 45);
  const roll = o.rolloff ?? 1;
  const dx = at.x - lp.x;
  const dy = at.y - lp.y;
  const dz = at.z - lp.z;
  const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
  let fx = lf.x;
  let fz = lf.z;
  const fl = Math.hypot(fx, fz);
  if (!(fl > 1e-6)) {
    fx = 0;
    fz = -1;
  } else {
    fx /= fl;
    fz /= fl;
  }
  const hd = Math.hypot(dx, dz);
  const side = hd > 1e-6 ? (dx * -fz + dz * fx) / hd : 0;
  const front = hd > 1e-6 ? (dx * fx + dz * fz) / hd : 1;
  const near = clamp(hd / 1.5, 0, 1); // a source on top of the listener stays centred
  const pan = clamp(side * 0.85 * near, -1, 1);
  const gain = (ref / (ref + roll * Math.max(0, dist - ref))) * (1 - smoothstep(max * 0.7, max, dist));
  const far = smoothstep(ref, max, dist);
  const air = 1 - far;
  const behind = smoothstep(0, -1, front);
  const lowpass = (1500 + 18500 * air * air) * (1 - 0.45 * behind * near);
  return { gain, pan, lowpass, wet: 0.1 + 0.5 * far, dist };
}

// =============================================================================================
// Graph
// =============================================================================================
export interface Strip { dry: GainNode; rev: GainNode; dly: GainNode }
export interface SpacePreset { seconds: number; decay: number; brightness: number; predelay: number; ret: number; feedback: number }
export const SPACES: Readonly<Record<string, SpacePreset>> = {
  room: { seconds: 1.5, decay: 3.2, brightness: 0.6, predelay: 0.01, ret: 0.75, feedback: 0.3 },
  hall: { seconds: 2.8, decay: 2.6, brightness: 0.55, predelay: 0.02, ret: 0.85, feedback: 0.35 },
  well: { seconds: 4.0, decay: 2.0, brightness: 0.35, predelay: 0.03, ret: 0.95, feedback: 0.45 },
  sky: { seconds: 2.2, decay: 3.4, brightness: 0.85, predelay: 0.015, ret: 0.6, feedback: 0.3 },
  space: { seconds: 5.0, decay: 1.6, brightness: 0.7, predelay: 0.05, ret: 0.95, feedback: 0.5 },
};

type BusName = 'music' | 'sfx' | 'ui';

export class AudioGraph {
  readonly ctx: Ctx;
  readonly music: Strip;
  readonly sfx: Strip;
  readonly ui: Strip;
  readonly world: GainNode;
  readonly muffle: BiquadFilterNode;
  readonly sum: GainNode;
  /** tap before dynamics (for headroom metrics) */
  readonly pre: GainNode;
  readonly comp: DynamicsCompressorNode;
  readonly limiter: DynamicsCompressorNode;
  readonly master: GainNode;
  readonly out: GainNode;
  readonly analyser: AnalyserNode;
  space: string;
  private readonly levels: Record<BusName, GainNode[]>;
  private readonly ducks: GainNode[];
  private readonly revIn: GainNode;
  private readonly convs: ConvolverNode[] = [];
  private readonly convGains: GainNode[] = [];
  private active = 0;
  private readonly dL: DelayNode;
  private readonly dR: DelayNode;
  private readonly fb: GainNode;

  constructor(ctx: Ctx, vol: Volumes, space = 'room') {
    this.ctx = ctx;
    const g = (v = 1): GainNode => {
      const n = ctx.createGain();
      n.gain.value = v;
      return n;
    };
    // ---- master chain
    this.sum = g();
    this.sum.channelCount = 2;
    this.sum.channelCountMode = 'explicit'; // mono voices upmix to both ears
    this.pre = g(0.9);
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 20;
    hp.Q.value = 0;
    this.comp = ctx.createDynamicsCompressor();
    this.comp.threshold.value = -16;
    this.comp.knee.value = 10;
    this.comp.ratio.value = 3;
    this.comp.attack.value = 0.012;
    this.comp.release.value = 0.22;
    this.limiter = ctx.createDynamicsCompressor();
    this.limiter.threshold.value = -3;
    this.limiter.knee.value = 0;
    this.limiter.ratio.value = 20;
    this.limiter.attack.value = 0.002;
    this.limiter.release.value = 0.1;
    const clip = ctx.createWaveShaper();
    clip.curve = softClipCurve();
    clip.oversample = 'none';
    this.master = g(volToGain(vol.master));
    this.out = g();
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.78;
    this.sum.connect(this.pre).connect(hp).connect(this.comp).connect(this.limiter).connect(clip).connect(this.master).connect(this.out);
    this.out.connect(this.analyser);

    // ---- world (muffle-able) bus
    this.world = g();
    this.muffle = ctx.createBiquadFilter();
    this.muffle.type = 'lowpass';
    this.muffle.frequency.value = 20000;
    this.muffle.Q.value = 0;
    this.world.connect(this.muffle).connect(this.sum);

    // ---- reverb: two convolvers so space changes crossfade instead of clicking
    this.revIn = g();
    const revHp = ctx.createBiquadFilter();
    revHp.type = 'highpass';
    revHp.frequency.value = 180;
    revHp.Q.value = 0;
    this.revIn.connect(revHp);
    for (let i = 0; i < 2; i++) {
      const c = ctx.createConvolver();
      c.normalize = false;
      const cg = g(0);
      revHp.connect(c).connect(cg).connect(this.world);
      this.convs.push(c);
      this.convGains.push(cg);
    }

    // ---- ping-pong delay with a darkening feedback loop
    const dlyIn = g();
    this.dL = ctx.createDelay(2);
    this.dR = ctx.createDelay(2);
    this.dL.delayTime.value = 0.375;
    this.dR.delayTime.value = 0.375;
    this.fb = g(0.35);
    const cross = g(1);
    const fbLp = ctx.createBiquadFilter();
    fbLp.type = 'lowpass';
    fbLp.frequency.value = 3200;
    fbLp.Q.value = 0;
    const fbHp = ctx.createBiquadFilter();
    fbHp.type = 'highpass';
    fbHp.frequency.value = 260;
    fbHp.Q.value = 0;
    const merger = ctx.createChannelMerger(2);
    const dlyRet = g(0.8);
    dlyIn.connect(this.dL);
    this.dL.connect(merger, 0, 0);
    this.dL.connect(cross).connect(this.dR);
    this.dR.connect(merger, 0, 1);
    this.dR.connect(fbLp).connect(fbHp).connect(this.fb).connect(this.dL);
    merger.connect(dlyRet).connect(this.world);
    const dly2rev = g(0.25);
    dlyRet.connect(dly2rev).connect(this.revIn);

    // ---- strips
    this.ducks = [g(), g(), g()];
    const mk = (bus: BusName, dryDest: AudioNode, duck: GainNode[] | null): Strip => {
      const inputs = [g(), g(), g()];
      const lv = [g(), g(), g()];
      const dests = [dryDest, this.revIn, dlyIn];
      for (let i = 0; i < 3; i++) {
        let head: AudioNode = inputs[i]!;
        if (duck) head = head.connect(duck[i]!);
        head.connect(lv[i]!).connect(dests[i]!);
      }
      this.levels[bus] = lv;
      return { dry: inputs[0]!, rev: inputs[1]!, dly: inputs[2]! };
    };
    this.levels = {} as Record<BusName, GainNode[]>;
    this.music = mk('music', this.world, this.ducks);
    this.sfx = mk('sfx', this.world, null);
    this.ui = mk('ui', this.sum, null);
    this.space = space;
    this.setSpace(space, 0, 0);
    this.setVolumes(vol, 0, 0);
  }

  setVolumes(v: Volumes, now: number, time = 0.06): void {
    const set = (p: AudioParam, x: number) => {
      if (time <= 0) {
        p.cancelScheduledValues(now);
        p.value = x;
        p.setValueAtTime(x, now);
      } else p.setTargetAtTime(x, now, time / 3);
    };
    set(this.master.gain, volToGain(v.master));
    for (const n of this.levels.music) set(n.gain, volToGain(v.music));
    for (const n of this.levels.sfx) set(n.gain, volToGain(v.sfx));
    for (const n of this.levels.ui) set(n.gain, volToGain(v.sfx));
  }

  setDelayTime(seconds: number, now: number): void {
    const s = clamp(Number.isFinite(seconds) ? seconds : 0.375, 0.05, 1.9);
    this.dL.delayTime.setTargetAtTime(s, now, 0.08);
    this.dR.delayTime.setTargetAtTime(s, now, 0.08);
  }

  /** 0 = open, 1 = heavy lowpass (pause menu, underwater) on everything except UI. */
  setMuffle(amount: number, now: number, time = 0.25): void {
    const a = clamp(amount, 0, 1);
    const f = 20000 * Math.pow(380 / 20000, a);
    this.muffle.frequency.setTargetAtTime(f, now, Math.max(0.005, time / 3));
  }

  setSpace(name: string, now: number, fade = 1.2): void {
    const p = SPACES[name] ?? SPACES.room!;
    this.space = SPACES[name] ? name : 'room';
    const next = (this.active + 1) % 2;
    const sr = this.ctx.sampleRate;
    const [l, r] = irData(sr, p.seconds, { decay: p.decay, predelay: p.predelay, brightness: p.brightness, seed: 7 + p.seconds * 100 });
    const buf = this.ctx.createBuffer(2, l.length, sr);
    buf.getChannelData(0).set(l);
    buf.getChannelData(1).set(r);
    this.convs[next]!.buffer = buf;
    const ramp = (param: AudioParam, to: number) => {
      param.cancelScheduledValues(now);
      param.setValueAtTime(param.value, now);
      param.linearRampToValueAtTime(to, now + Math.max(0.01, fade));
    };
    ramp(this.convGains[next]!.gain, p.ret);
    ramp(this.convGains[this.active]!.gain, 0);
    this.active = next;
    this.fb.gain.setTargetAtTime(p.feedback, now, 0.2);
  }

  /** Dip the music (under stings / System voice) then recover. */
  duck(amount: number, now: number, hold = 0.5, attack = 0.06, release = 0.6): void {
    const to = 1 - clamp(amount, 0, 0.95);
    for (const d of this.ducks) {
      const p = d.gain;
      p.cancelScheduledValues(now);
      p.setValueAtTime(p.value, now);
      p.linearRampToValueAtTime(to, now + attack);
      p.setValueAtTime(to, now + attack + hold);
      p.linearRampToValueAtTime(1, now + attack + hold + release);
    }
  }
}

// =============================================================================================
// SFX triggering (shared by the live engine and offline renders)
// =============================================================================================
export function triggerSfx(g: AudioGraph, def: SfxDef, t: number, volume: number, pitch: number, sp: Spatial | null, rng: () => number): { end: number; nodes: AudioNode[]; input: GainNode } {
  const ctx = g.ctx;
  const strip = def.ui ? g.ui : g.sfx;
  const input = ctx.createGain();
  input.gain.value = (def.gain ?? 1) * volume * (sp ? sp.gain : 1);
  const nodes: AudioNode[] = [input];
  let head: AudioNode = input;
  if (sp) {
    if (sp.lowpass < 18000) {
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = clamp(sp.lowpass, 200, ctx.sampleRate * 0.45);
      lp.Q.value = 0;
      head = head.connect(lp);
      nodes.push(lp);
    }
    if (Math.abs(sp.pan) > 0.01) {
      const p = ctx.createStereoPanner();
      p.pan.value = sp.pan;
      head = head.connect(p);
      nodes.push(p);
    }
  }
  head.connect(strip.dry);
  const wet = clamp((def.wet ?? 0.12) + (sp ? sp.wet * 0.5 : 0), 0, 1);
  if (wet > 0.001) {
    const s = ctx.createGain();
    s.gain.value = wet;
    head.connect(s).connect(strip.rev);
    nodes.push(s);
  }
  if (def.echo) {
    const s = ctx.createGain();
    s.gain.value = def.echo;
    head.connect(s).connect(strip.dly);
    nodes.push(s);
  }
  const v = new SfxVoice(ctx, input, t, pitch, rng);
  def.play(v);
  return { end: v.end, nodes, input };
}

const disconnectAll = (nodes: readonly AudioNode[]): void => {
  for (const n of nodes) {
    try {
      n.disconnect();
    } catch {
      /* gone */
    }
  }
};

// =============================================================================================
// Loops
// =============================================================================================
export interface LoopHandle {
  readonly name: string;
  readonly alive: boolean;
  setVolume(v: number, time?: number): void;
  setPitch(p: number): void;
  setPosition(at: XYZ | null): void;
  stop(fade?: number): void;
}

interface LoopHost {
  now(): number;
  graph(): AudioGraph | null;
  listener(): { p: XYZ; f: XYZ };
  rng(): () => number;
  release(l: LoopImpl): void;
}

class LoopImpl implements LoopHandle {
  readonly name: string;
  private readonly def: LoopDef;
  private readonly host: LoopHost;
  private kit: LoopKit | null = null;
  private amp: GainNode | null = null;
  private lp: BiquadFilterNode | null = null;
  private pan: StereoPannerNode | null = null;
  private send: GainNode | null = null;
  private vol: number;
  private pitch: number;
  private at: XYZ | null;
  private readonly fadeIn: number;
  private last = { gain: -1, pan: 9, lp: -1, wet: -1 };
  alive = true;

  constructor(name: string, def: LoopDef, host: LoopHost, o: { at?: XYZ; volume?: number; pitch?: number; fadeIn?: number }) {
    this.name = name;
    this.def = def;
    this.host = host;
    this.vol = clamp(o.volume ?? 1, 0, 4);
    this.pitch = clampPitch(o.pitch);
    this.at = o.at ? { x: o.at.x, y: o.at.y, z: o.at.z } : null;
    this.fadeIn = o.fadeIn ?? 0.8;
  }

  /** Build the voice once a context exists (loops requested before unlock start on unlock). */
  attach(): void {
    const g = this.host.graph();
    if (!g || this.kit || !this.alive) return;
    const ctx = g.ctx;
    const now = this.host.now();
    const kit = new LoopKit(ctx, this.host.rng());
    this.def.build(kit);
    this.amp = ctx.createGain();
    this.amp.gain.value = 0;
    this.lp = ctx.createBiquadFilter();
    this.lp.type = 'lowpass';
    this.lp.frequency.value = 20000;
    this.lp.Q.value = 0;
    this.pan = ctx.createStereoPanner();
    this.send = ctx.createGain();
    this.send.gain.value = this.def.wet ?? 0.15;
    kit.out.connect(this.amp).connect(this.lp).connect(this.pan).connect(g.sfx.dry);
    this.pan.connect(this.send).connect(g.sfx.rev);
    kit.start(now + 0.01, this.fadeIn);
    if (this.pitch !== 1) kit.setPitch(this.pitch, now);
    this.kit = kit;
    this.update(now, true);
  }

  update(now: number, force = false): void {
    if (!this.kit || !this.amp || !this.lp || !this.pan || !this.send) return;
    const base = this.vol * (this.def.gain ?? 1);
    let gain = base;
    let pan = 0;
    let lp = 20000;
    let wet = this.def.wet ?? 0.15;
    if (this.at) {
      const L = this.host.listener();
      const sp = spatialize(L.p, L.f, this.at, { ref: 2.5, max: 40 });
      gain = base * sp.gain;
      pan = sp.pan;
      lp = sp.lowpass;
      wet = clamp(wet + sp.wet * 0.5, 0, 1);
    }
    const L = this.last;
    if (force || Math.abs(gain - L.gain) > 0.004) this.amp.gain.setTargetAtTime(gain, now, 0.06);
    if (force || Math.abs(pan - L.pan) > 0.01) this.pan.pan.setTargetAtTime(pan, now, 0.06);
    if (force || Math.abs(lp - L.lp) > L.lp * 0.02) this.lp.frequency.setTargetAtTime(clamp(lp, 200, 20000), now, 0.08);
    if (force || Math.abs(wet - L.wet) > 0.01) this.send.gain.setTargetAtTime(wet, now, 0.1);
    this.last = { gain, pan, lp, wet };
  }

  setVolume(v: number): void {
    this.vol = clamp(v, 0, 4);
    this.update(this.host.now());
  }
  setPitch(p: number): void {
    this.pitch = clampPitch(p);
    this.kit?.setPitch(this.pitch, this.host.now());
  }
  setPosition(at: XYZ | null): void {
    if (at) {
      if (this.at) {
        this.at.x = at.x;
        this.at.y = at.y;
        this.at.z = at.z;
      } else this.at = { x: at.x, y: at.y, z: at.z };
    } else this.at = null;
    this.update(this.host.now());
  }
  stop(fade = 0.8): void {
    if (!this.alive) return;
    this.alive = false;
    this.host.release(this);
    if (!this.kit) return;
    const now = this.host.now();
    const end = this.kit.stop(now, fade);
    const nodes = [this.amp, this.lp, this.pan, this.send].filter((n): n is NonNullable<typeof n> => !!n);
    setTimeout(() => disconnectAll(nodes), (end - now + 0.3) * 1000);
  }
}

// =============================================================================================
// Engine
// =============================================================================================
export interface AudioEngineOptions {
  /** localStorage-like store for volumes; null disables persistence. Defaults to window.localStorage. */
  storage?: Pick<Storage, 'getItem' | 'setItem'> | null;
  /** attach first-gesture listeners that call unlock() (default true) */
  autoUnlock?: boolean;
  seed?: number;
  lookahead?: number;
  maxVoices?: number;
}

export interface AudioEngineState {
  unlocked: boolean;
  context: AudioContextState | 'none';
  time: number;
  music: MusicState;
  voices: number;
  loops: string[];
  space: string;
  muffle: number;
  volumes: Volumes;
  stats: { played: number; dropped: number; stolen: number; unknown: number };
}

/** A sounding one-shot: `level` (volume x distance) decides who gets stolen when voices run out. */
interface LiveVoice { name: string; end: number; level: number; input: GainNode }

const PENT_SEMIS = [0, 2, 4, 7, 9];

export class AudioEngine implements AudioApi {
  readonly volumes: Volumes;
  readonly stats = { played: 0, dropped: 0, stolen: 0, unknown: 0 };
  maxVoices: number;
  lookahead: number;
  private readonly vols: Volumes;
  private ctx: AudioContext | null = null;
  private g: AudioGraph | null = null;
  private player: MusicPlayer | null = null;
  private pendingMusic: { track: string | null; fade: number } | null = null;
  private intensity = 0.5;
  private readonly lp: XYZ = { x: 0, y: 0, z: 0 };
  private readonly lf: XYZ = { x: 0, y: 0, z: -1 };
  private timer: ReturnType<typeof setInterval> | null = null;
  private lastTick = 0;
  private readonly lastPlay = new Map<string, number>();
  private live: LiveVoice[] = [];
  private readonly warned = new Set<string>();
  private readonly rand: Prng;
  private readonly seed: number;
  private readonly loops = new Set<LoopImpl>();
  private readonly storage: Pick<Storage, 'getItem' | 'setItem'> | null;
  private saveTimer: ReturnType<typeof setTimeout> | null = null;
  private muffle = 0;
  private space = 'room';
  private hiddenSuspend = false;
  private readonly cleanups: (() => void)[] = [];
  private readonly loopHost: LoopHost;

  constructor(opts: AudioEngineOptions = {}) {
    this.seed = (opts.seed ?? 0x5eed) >>> 0;
    this.rand = new Prng(this.seed);
    this.maxVoices = opts.maxVoices ?? 48;
    this.lookahead = opts.lookahead ?? 0.3;
    let store: Pick<Storage, 'getItem' | 'setItem'> | null = null;
    if (opts.storage !== undefined) store = opts.storage;
    else {
      try {
        store = typeof localStorage !== 'undefined' ? localStorage : null;
      } catch {
        store = null; // storage blocked (privacy mode / sandboxed iframe)
      }
    }
    this.storage = store;
    let raw: string | null = null;
    try {
      raw = store?.getItem(VOLUME_KEY) ?? null;
    } catch {
      raw = null;
    }
    this.vols = parseVolumes(raw);
    const self = this;
    const vols = this.vols;
    const acc = (k: keyof Volumes) => ({
      get: () => vols[k],
      set: (v: number) => {
        vols[k] = clamp(Number.isFinite(v) ? v : vols[k], 0, 1);
        self.onVolumes();
      },
      enumerable: true,
    });
    this.volumes = Object.defineProperties({} as Volumes, { master: acc('master'), music: acc('music'), sfx: acc('sfx') });
    this.loopHost = {
      now: () => this.ctx?.currentTime ?? 0,
      graph: () => this.g,
      listener: () => ({ p: this.lp, f: this.lf }),
      rng: () => {
        const r = new Prng(this.rand.next() * 4294967296);
        return () => r.next();
      },
      release: (l) => this.loops.delete(l),
    };
    if (opts.autoUnlock !== false && typeof window !== 'undefined') this.installUnlock();
    if (typeof document !== 'undefined') {
      const onVis = () => this.onVisibility();
      document.addEventListener('visibilitychange', onVis);
      this.cleanups.push(() => document.removeEventListener('visibilitychange', onVis));
    }
  }

  // ------------------------------------------------------------------ AudioApi
  unlock(): void {
    if (!this.ctx) {
      if (typeof window === 'undefined') return;
      const w = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
      const AC = w.AudioContext ?? w.webkitAudioContext;
      if (!AC) return;
      let ctx: AudioContext;
      try {
        ctx = new AC({ latencyHint: 'interactive' });
      } catch (e) {
        this.warnOnce('ctx', '[audio] AudioContext unavailable', e);
        return;
      }
      this.ctx = ctx;
      const g = new AudioGraph(ctx, this.vols, this.space);
      g.out.connect(ctx.destination);
      g.setMuffle(this.muffle, 0, 0.01);
      this.g = g;
      this.player = new MusicPlayer({ ctx, strip: g.music, setDelayTime: (s) => g.setDelayTime(s, ctx.currentTime) }, this.seed);
      this.player.setIntensity(this.intensity, 0);
      if (this.pendingMusic) {
        this.player.play(this.pendingMusic.track, this.pendingMusic.fade);
        this.pendingMusic = null;
      }
      for (const l of this.loops) l.attach();
      this.timer = setInterval(() => this.tick(), 25);
    }
    const ctx = this.ctx;
    if (ctx.state === 'suspended' && !(typeof document !== 'undefined' && document.hidden)) {
      ctx.resume().catch(() => {
        /* needs a real gesture; the unlock listeners retry */
      });
    }
  }

  sfx(name: string, opts: { at?: THREE.Vector3 | XYZ; volume?: number; pitch?: number } = {}): void {
    const def = SFX[name];
    if (!def) {
      this.stats.unknown++;
      this.warnOnce(`sfx:${name}`, `[audio] unknown sfx "${name}"`);
      return;
    }
    this.playDef(name, def, opts);
  }

  /**
   * Shared one-shot path. Per-sound `max`/`gap` drop spam; when the global voice budget is full
   * the quietest (usually farthest) voice is faded out for a louder newcomer (GDD 15.1).
   * Returns the end time on the audio clock, or null when nothing was played.
   */
  private playDef(name: string, def: SfxDef, opts: { at?: THREE.Vector3 | XYZ; volume?: number; pitch?: number }): number | null {
    const ctx = this.ctx;
    const g = this.g;
    if (!ctx || !g || ctx.state === 'closed') return null;
    const now = ctx.currentTime;
    const last = this.lastPlay.get(name);
    if (def.gap && last !== undefined && now - last < def.gap) {
      this.stats.dropped++;
      return null;
    }
    this.prune(now);
    let same = 0;
    for (const v of this.live) if (v.name === name) same++;
    if (same >= (def.max ?? 8)) {
      this.stats.dropped++;
      return null;
    }
    let sp: Spatial | null = null;
    if (opts.at) {
      sp = spatialize(this.lp, this.lf, opts.at);
      if (sp.gain < 0.004) {
        this.stats.dropped++;
        return null;
      }
    }
    const vol = clamp(Number.isFinite(opts.volume) ? opts.volume! : 1, 0, 4);
    if (vol <= 0) return null;
    const level = vol * (def.gain ?? 1) * (sp ? sp.gain : 1);
    if (this.live.length >= this.maxVoices) {
      let victim: LiveVoice | null = null;
      for (const v of this.live) if (!victim || v.level < victim.level) victim = v;
      if (!victim || victim.level >= level) {
        this.stats.dropped++;
        return null;
      }
      this.steal(victim, now);
    }
    let r: { end: number; nodes: AudioNode[]; input: GainNode };
    try {
      r = triggerSfx(g, def, now + 0.004, vol, clampPitch(opts.pitch), sp, () => this.rand.next());
    } catch (e) {
      this.warnOnce(`sfxerr:${name}`, `[audio] sfx "${name}" failed`, e);
      return null;
    }
    this.lastPlay.set(name, now);
    this.live.push({ name, end: r.end, level, input: r.input });
    this.stats.played++;
    setTimeout(() => disconnectAll(r.nodes), (r.end - now + 1.5) * 1000);
    return r.end;
  }

  private steal(v: LiveVoice, now: number): void {
    const p = v.input.gain;
    p.cancelScheduledValues(now);
    p.setValueAtTime(p.value, now);
    p.linearRampToValueAtTime(0, now + 0.03);
    const i = this.live.indexOf(v);
    if (i >= 0) this.live.splice(i, 1);
    this.stats.stolen++;
  }

  music(track: string | null, fadeSeconds = 1.5): void {
    if (track !== null && !TRACKS[track]) {
      this.warnOnce(`music:${track}`, `[audio] unknown music track "${track}"`);
      return;
    }
    const fade = clamp(Number.isFinite(fadeSeconds) ? fadeSeconds : 1.5, 0, 30);
    if (!this.player) {
      this.pendingMusic = { track, fade };
      return;
    }
    this.player.play(track, fade);
  }

  setIntensity(v: number): void {
    this.intensity = clamp(Number.isFinite(v) ? v : 0, 0, 1);
    this.player?.setIntensity(this.intensity);
  }

  setListener(pos: THREE.Vector3 | XYZ, forward: THREE.Vector3 | XYZ): void {
    this.lp.x = pos.x;
    this.lp.y = pos.y;
    this.lp.z = pos.z;
    this.lf.x = forward.x;
    this.lf.y = forward.y;
    this.lf.z = forward.z;
  }

  // ------------------------------------------------------------------ extensions
  /** Start a continuous bed (see LOOPS). Returns a handle even before unlock; it starts on unlock. */
  loop(name: string, opts: { at?: THREE.Vector3 | XYZ; volume?: number; pitch?: number; fadeIn?: number } = {}): LoopHandle | null {
    const def = LOOPS[name];
    if (!def) {
      this.warnOnce(`loop:${name}`, `[audio] unknown loop "${name}"`);
      return null;
    }
    const l = new LoopImpl(name, def, this.loopHost, opts);
    this.loops.add(l);
    l.attach();
    return l;
  }

  /** Dip the music, e.g. under a System announcement or a sting. */
  duck(amount = 0.45, hold = 0.5): void {
    if (this.g && this.ctx) this.g.duck(amount, this.ctx.currentTime, hold);
  }

  /** 0..1 lowpass over world audio (music + sfx), UI stays crisp: pause menus, underwater. */
  setMuffle(amount: number, seconds = 0.25): void {
    this.muffle = clamp(amount, 0, 1);
    if (this.g && this.ctx) this.g.setMuffle(this.muffle, this.ctx.currentTime, seconds);
  }

  /** Reverb/echo character: 'room' | 'hall' | 'well' | 'sky' | 'space'. */
  setSpace(name: string): void {
    if (!SPACES[name]) {
      this.warnOnce(`space:${name}`, `[audio] unknown space "${name}"`);
      return;
    }
    if (name === this.space) return;
    this.space = name;
    if (this.g && this.ctx) this.g.setSpace(name, this.ctx.currentTime);
  }

  /**
   * System bell-babble (GDD 15.3): one chime per typed character, quantised to the C major
   * pentatonic from the character code (C5..A6); headers sound an octave lower, punctuation a
   * low G. Call it for every character the System window types (35 cps).
   */
  typeTick(ch: string, header = false): void {
    if (!ch || /\s/.test(ch)) return;
    const c = ch.codePointAt(0) ?? 0;
    const semi = /[.,!?;:\-]/.test(ch) ? -5 : PENT_SEMIS[c % 5]! + 12 * ((c >> 3) & 1);
    this.sfx('type_tick', { pitch: Math.pow(2, (semi - (header ? 12 : 0)) / 12) });
  }

  /**
   * Wick babble (GDD 15.3): voices a speech bubble as formant syllables. `f0` is the speaker's
   * pitch (players 180-420 Hz), `resolve` drops it a perfect fourth. Returns the babble's length
   * in seconds (0 when nothing played) so bubbles can stay up exactly as long as the voice.
   */
  babble(text: string, opts: { f0?: number; resolve?: boolean; at?: THREE.Vector3 | XYZ; volume?: number; speaker?: string } = {}): number {
    const plan = planBabble(text, { f0: opts.f0, resolve: opts.resolve });
    if (!plan.length) return 0;
    const end = this.playDef(`babble:${opts.speaker ?? 'anon'}`, babbleRecipe(plan), opts);
    if (end === null || !this.ctx) return 0;
    const lastSyl = plan[plan.length - 1]!;
    return lastSyl.t + lastSyl.dur;
  }

  get analyser(): AnalyserNode | null {
    return this.g?.analyser ?? null;
  }
  get context(): AudioContext | null {
    return this.ctx;
  }
  get unlocked(): boolean {
    return !!this.ctx && this.ctx.state === 'running';
  }
  get track(): string | null {
    return this.player?.track ?? this.pendingMusic?.track ?? null;
  }

  state(): AudioEngineState {
    const now = this.ctx?.currentTime ?? 0;
    this.prune(now);
    return {
      unlocked: this.unlocked,
      context: this.ctx?.state ?? 'none',
      time: now,
      music: this.player?.state() ?? { track: this.pendingMusic?.track ?? null, bar: 0, beat: 0, intensity: this.intensity, stems: [], fading: 0 },
      voices: this.live.length,
      loops: [...this.loops].map((l) => l.name),
      space: this.space,
      muffle: this.muffle,
      volumes: { ...this.vols },
      stats: { ...this.stats },
    };
  }

  dispose(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    for (const c of this.cleanups.splice(0)) c();
    for (const l of [...this.loops]) l.stop(0.05);
    this.player?.stopAll();
    this.ctx?.close().catch(() => {});
    this.ctx = null;
    this.g = null;
    this.player = null;
  }

  // ------------------------------------------------------------------ internals
  private tick(): void {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running') return;
    const now = ctx.currentTime;
    const wall = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const gap = this.lastTick ? (wall - this.lastTick) / 1000 : 0.025;
    this.lastTick = wall;
    // background-throttled timers fire late: look further ahead instead of leaving holes
    this.player?.schedule(now + Math.max(this.lookahead, Math.min(2, gap * 1.5 + 0.05)));
    for (const l of this.loops) l.update(now);
  }

  private prune(now: number): void {
    const live = this.live;
    let w = 0;
    for (let i = 0; i < live.length; i++) if (live[i]!.end > now) live[w++] = live[i]!;
    live.length = w;
  }

  private onVolumes(): void {
    if (this.g && this.ctx) this.g.setVolumes(this.vols, this.ctx.currentTime);
    if (!this.storage) return;
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => {
      this.saveTimer = null;
      try {
        this.storage?.setItem(VOLUME_KEY, JSON.stringify(this.vols));
      } catch {
        /* quota / privacy mode: volumes just won't persist */
      }
    }, 150);
  }

  private installUnlock(): void {
    const events = ['pointerdown', 'keydown', 'touchend', 'mousedown'] as const;
    const handler = () => {
      this.unlock();
      if (this.ctx?.state === 'running') remove();
    };
    const remove = () => {
      for (const ev of events) window.removeEventListener(ev, handler, true);
    };
    for (const ev of events) window.addEventListener(ev, handler, { capture: true, passive: true });
    this.cleanups.push(remove);
  }

  private onVisibility(): void {
    const ctx = this.ctx;
    if (!ctx || ctx.state === 'closed') return;
    if (document.hidden) {
      if (ctx.state === 'running') {
        this.hiddenSuspend = true;
        ctx.suspend().catch(() => {});
      }
    } else if (this.hiddenSuspend) {
      this.hiddenSuspend = false;
      ctx.resume().catch(() => {});
    }
  }

  private warnOnce(key: string, msg: string, err?: unknown): void {
    if (this.warned.has(key)) return;
    this.warned.add(key);
    if (err !== undefined) console.warn(msg, err);
    else console.warn(msg);
  }
}

// =============================================================================================
// Offline rendering (tests, demo metrics): same graph, deterministic randomness
// =============================================================================================
export interface RenderMetrics {
  name: string;
  kind: 'sfx' | 'music' | 'loop';
  seconds: number;
  sampleRate: number;
  peak: number;
  rms: number;
  nan: boolean;
  clipped: number;
  prePeak: number;
  active: number; // seconds between first and last audible sample
  ok: boolean;
  problems: string[];
}
export interface RenderResult { metrics: RenderMetrics; left: Float32Array; right: Float32Array }

/** Unity volumes for metrics: the mix itself, worst case for clipping. */
export const RENDER_VOLUMES: Readonly<Volumes> = { master: 1, music: 1, sfx: 1 };

export async function renderOffline(seconds: number, setup: (g: AudioGraph) => void, o: { sampleRate?: number; volumes?: Volumes; space?: string; seed?: number } = {}): Promise<{ post: Float32Array[]; pre: Float32Array[]; sampleRate: number }> {
  const sr = o.sampleRate ?? 44100;
  const ctx = new OfflineAudioContext({ numberOfChannels: 4, length: Math.max(1, Math.ceil(sr * seconds)), sampleRate: sr });
  ctx.destination.channelInterpretation = 'discrete';
  const g = new AudioGraph(ctx, o.volumes ?? RENDER_VOLUMES, o.space ?? 'room');
  const merger = ctx.createChannelMerger(4);
  const s1 = ctx.createChannelSplitter(2);
  const s2 = ctx.createChannelSplitter(2);
  g.out.connect(s1);
  g.pre.connect(s2);
  s1.connect(merger, 0, 0);
  s1.connect(merger, 1, 1);
  s2.connect(merger, 0, 2);
  s2.connect(merger, 1, 3);
  merger.connect(ctx.destination);
  const pr = new Prng(o.seed ?? 1);
  const prev = setSynthRandom(() => pr.next());
  try {
    setup(g);
  } finally {
    setSynthRandom(prev);
  }
  const buf = await ctx.startRendering();
  return { post: [buf.getChannelData(0), buf.getChannelData(1)], pre: [buf.getChannelData(2), buf.getChannelData(3)], sampleRate: sr };
}

export function judge(name: string, kind: RenderMetrics['kind'], seconds: number, r: { post: Float32Array[]; pre: Float32Array[]; sampleRate: number }): RenderMetrics {
  const a = analyse(r.post, r.sampleRate);
  const p = analyse(r.pre, r.sampleRate);
  const problems: string[] = [];
  if (a.nan) problems.push('NaN/Inf samples');
  if (!Number.isFinite(a.peak) || !Number.isFinite(a.rms)) problems.push('non-finite metrics');
  if (a.peak > 1) problems.push(`peak ${a.peak.toFixed(3)} > 1`);
  if (a.rms <= 0.005) problems.push(`rms ${a.rms.toFixed(4)} too quiet`);
  if (a.clipped > 0) problems.push(`${a.clipped} clipped samples`);
  return {
    name, kind, seconds, sampleRate: r.sampleRate, peak: a.peak, rms: a.rms, nan: a.nan, clipped: a.clipped, prePeak: p.peak,
    active: a.dur, ok: problems.length === 0, problems,
  };
}

/** Schedule once on a throwaway context to learn how long a recipe rings. */
function sfxLength(def: SfxDef, pitch: number): number {
  const probe = new OfflineAudioContext({ numberOfChannels: 1, length: 1, sampleRate: 44100 });
  const pr = new Prng(3);
  const prev = setSynthRandom(() => pr.next());
  try {
    const v = new SfxVoice(probe, probe.createGain(), 0, pitch, () => pr.next());
    def.play(v);
    return v.end;
  } finally {
    setSynthRandom(prev);
  }
}

export interface SfxRenderOpts { pitch?: number; volume?: number; seed?: number; sampleRate?: number; at?: XYZ }

export function renderSfxOffline(name: string, o: SfxRenderOpts = {}): Promise<RenderResult> {
  const def = SFX[name];
  if (!def) return Promise.reject(new Error(`unknown sfx ${name}`));
  return renderDefOffline(name, def, o);
}

export function renderBabbleOffline(text: string, o: SfxRenderOpts & { f0?: number; resolve?: boolean } = {}): Promise<RenderResult> {
  return renderDefOffline(`babble: ${text}`, babbleRecipe(planBabble(text, { f0: o.f0, resolve: o.resolve })), o);
}

export async function renderDefOffline(name: string, def: SfxDef, o: SfxRenderOpts = {}): Promise<RenderResult> {
  const pitch = clampPitch(o.pitch);
  const seconds = clamp(sfxLength(def, pitch) + (def.wet || def.echo ? 1.2 : 0.3), 0.3, 9);
  const rr = new Prng(o.seed ?? 11);
  const sp = o.at ? spatialize({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: -1 }, o.at) : null;
  const r = await renderOffline(seconds, (g) => {
    triggerSfx(g, def, 0.01, o.volume ?? 1, pitch, sp, () => rr.next());
  }, { sampleRate: o.sampleRate, seed: o.seed });
  return { metrics: judge(name, 'sfx', seconds, r), left: r.post[0]!, right: r.post[1]! };
}

export async function renderTrackOffline(name: string, o: { seconds?: number; intensity?: number; seed?: number; sampleRate?: number } = {}): Promise<RenderResult> {
  if (!TRACKS[name]) throw new Error(`unknown track ${name}`);
  const seconds = o.seconds ?? 4;
  const r = await renderOffline(seconds, (g) => {
    const mp = new MusicPlayer({ ctx: g.ctx, strip: g.music, setDelayTime: (s) => g.setDelayTime(s, 0) }, o.seed ?? 7);
    mp.setIntensity(o.intensity ?? 0.75, 0);
    mp.play(name, 0.05, 0);
    mp.schedule(seconds, false);
  }, { sampleRate: o.sampleRate, seed: o.seed, space: name.endsWith('_ambient') ? name.replace('_ambient', '') : 'hall' });
  return { metrics: judge(name, 'music', seconds, r), left: r.post[0]!, right: r.post[1]! };
}

export async function renderLoopOffline(name: string, o: { seconds?: number; seed?: number; sampleRate?: number } = {}): Promise<RenderResult> {
  const def = LOOPS[name];
  if (!def) throw new Error(`unknown loop ${name}`);
  const seconds = o.seconds ?? 3;
  const pr = new Prng(o.seed ?? 5);
  const r = await renderOffline(seconds, (g) => {
    const kit = new LoopKit(g.ctx, () => pr.next());
    def.build(kit);
    const amp = g.ctx.createGain();
    amp.gain.value = def.gain ?? 1;
    kit.out.connect(amp).connect(g.sfx.dry);
    kit.start(0, 0.3);
    kit.stop(seconds - 0.4, 0.3);
  }, { sampleRate: o.sampleRate, seed: o.seed });
  return { metrics: judge(name, 'loop', seconds, r), left: r.post[0]!, right: r.post[1]! };
}
