/**
 * Tweens and easing. `Tweens.update(dt)` is driven by the engine once per rendered frame (real
 * time); scenes may own extra instances. Starting a tween on a property that another tween is
 * animating takes that property over (the older tween stops touching it).
 */
import type { EaseName, Tweener } from './api.ts';

export type EaseFn = (t: number) => number;

const C1 = 1.70158;
const C3 = C1 + 1;
const C4 = (2 * Math.PI) / 3;

function outBounce(t: number): number {
  const n1 = 7.5625, d1 = 2.75;
  if (t < 1 / d1) return n1 * t * t;
  if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
  if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
  return n1 * (t -= 2.625 / d1) * t + 0.984375;
}

export const EASE: Readonly<Record<EaseName, EaseFn>> = {
  linear: (t) => t,
  inQuad: (t) => t * t,
  outQuad: (t) => 1 - (1 - t) * (1 - t),
  inOutQuad: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  inCubic: (t) => t * t * t,
  outCubic: (t) => 1 - Math.pow(1 - t, 3),
  inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outBack: (t) => 1 + C3 * Math.pow(t - 1, 3) + C1 * Math.pow(t - 1, 2),
  inBack: (t) => C3 * t * t * t - C1 * t * t,
  outElastic: (t) => (t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * C4) + 1),
  outBounce,
  inOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  outExpo: (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  inExpo: (t) => (t <= 0 ? 0 : Math.pow(2, 10 * t - 10)),
};

export const EASE_NAMES = Object.keys(EASE) as EaseName[];

/** Evaluate an ease at `t` (clamped to [0, 1]); exact 0 and 1 at the ends. */
export function ease(name: EaseName, t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return EASE[name](t);
}

interface TweenRec {
  target: Record<string, number>;
  keys: string[];
  from: number[];
  to: number[];
  duration: number;
  elapsed: number; // negative while delayed
  ease: EaseFn;
  started: boolean;
  done: boolean;
  resolve: () => void;
}
interface CallRec { time: number; fn: () => void; done: boolean }

export class Tweens implements Tweener {
  /** Multiplier on dt (e.g. 0 to freeze scene tweens while paused). */
  timeScale = 1;
  private tweens: TweenRec[] = [];
  private calls: CallRec[] = [];

  to<T extends object>(obj: T, props: Partial<Record<keyof T, number>>, seconds: number, easeName: EaseName = 'outCubic', delay = 0): Promise<void> {
    const keys: string[] = [];
    const to: number[] = [];
    for (const k in props) {
      const v = props[k];
      if (typeof v === 'number') {
        keys.push(k);
        to.push(v);
      }
    }
    return new Promise<void>((resolve) => {
      const rec: TweenRec = {
        target: obj as unknown as Record<string, number>,
        keys,
        from: new Array<number>(keys.length).fill(0),
        to,
        duration: Math.max(0, seconds),
        elapsed: -Math.max(0, delay),
        ease: EASE[easeName] ?? EASE.outCubic,
        started: false,
        done: false,
        resolve,
      };
      this.tweens.push(rec);
      if (rec.elapsed >= 0) this.start(rec);
      if (rec.started && rec.duration === 0) this.finish(rec);
    });
  }

  call(seconds: number, fn: () => void): void {
    this.calls.push({ time: Math.max(0, seconds), fn, done: false });
  }

  wait(seconds: number): Promise<void> {
    return new Promise<void>((resolve) => this.call(seconds, resolve));
  }

  /** Stop every tween touching `obj`; their promises resolve immediately (values stay where they are). */
  killTweensOf(obj: object): void {
    for (const t of this.tweens) {
      if (t.target === obj && !t.done) {
        t.done = true;
        t.resolve();
      }
    }
  }

  isTweening(obj: object): boolean {
    return this.tweens.some((t) => t.target === obj && !t.done);
  }

  get count(): number {
    return this.tweens.length + this.calls.length;
  }

  update(dt: number): void {
    const step = dt * this.timeScale;
    if (step <= 0 && this.tweens.length === 0 && this.calls.length === 0) return;
    // Only advance what existed before this update; things created by callbacks start next frame.
    const nT = this.tweens.length;
    for (let i = 0; i < nT; i++) {
      const t = this.tweens[i];
      if (t.done) continue;
      t.elapsed += step;
      if (!t.started) {
        if (t.elapsed < 0) continue;
        this.start(t);
        if (t.done) continue;
      }
      if (t.elapsed >= t.duration) {
        this.finish(t);
      } else {
        const k = t.ease(t.elapsed / t.duration);
        for (let j = 0; j < t.keys.length; j++) t.target[t.keys[j]] = t.from[j] + (t.to[j] - t.from[j]) * k;
      }
    }
    const nC = this.calls.length;
    for (let i = 0; i < nC; i++) {
      const c = this.calls[i];
      if (c.done) continue;
      c.time -= step;
      if (c.time <= 0) {
        c.done = true;
        c.fn();
      }
    }
    compact(this.tweens);
    compact(this.calls);
  }

  /** Drop everything. Pending promises from `to`/`wait` are abandoned (they never settle). */
  clear(): void {
    for (const t of this.tweens) t.done = true;
    for (const c of this.calls) c.done = true;
    this.tweens.length = 0;
    this.calls.length = 0;
  }

  private start(rec: TweenRec): void {
    rec.started = true;
    // Take over these properties from older tweens.
    for (const other of this.tweens) {
      if (other === rec || other.done || !other.started || other.target !== rec.target) continue;
      for (const k of rec.keys) {
        const idx = other.keys.indexOf(k);
        if (idx >= 0) {
          other.keys.splice(idx, 1);
          other.from.splice(idx, 1);
          other.to.splice(idx, 1);
        }
      }
      if (other.keys.length === 0) {
        other.done = true;
        other.resolve();
      }
    }
    for (let j = 0; j < rec.keys.length; j++) {
      const cur = rec.target[rec.keys[j]];
      rec.from[j] = typeof cur === 'number' ? cur : rec.to[j];
    }
    if (rec.duration === 0) this.finish(rec);
  }

  private finish(rec: TweenRec): void {
    if (rec.done) return;
    for (let j = 0; j < rec.keys.length; j++) rec.target[rec.keys[j]] = rec.to[j];
    rec.done = true;
    rec.resolve();
  }
}

function compact<T extends { done: boolean }>(arr: T[]): void {
  let w = 0;
  for (let i = 0; i < arr.length; i++) if (!arr[i].done) arr[w++] = arr[i];
  arr.length = w;
}
