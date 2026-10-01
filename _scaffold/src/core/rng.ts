/**
 * Seeded randomness. sfc32 generator seeded through splitmix32; `fork(label)` derives an
 * independent stream from (seed, label) only, so a sub-system's numbers never change when some
 * other system draws more or fewer numbers. Pure TS (no DOM/three), runs in Node and on the server.
 */
import type { Rng } from './api.ts';

/** FNV-1a over UTF-16 code units, finished with an avalanche so similar strings diverge. */
export function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return fmix32(h);
}

/** murmur3 finaliser: full avalanche of a 32-bit integer. */
export function fmix32(n: number): number {
  let h = n | 0;
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

/** Order-dependent combination of two 32-bit hashes. */
export function hashCombine(a: number, b: number): number {
  return fmix32((a >>> 0) ^ (Math.imul(b >>> 0, 0x9e3779b1) + 0x7f4a7c15 + ((a << 6) >>> 0) + (a >>> 2)));
}

function normalizeSeed(seed: number): number {
  if (!Number.isFinite(seed)) return hashString(String(seed));
  return Number.isInteger(seed) ? seed >>> 0 : hashString(seed.toString());
}

/** Seed from a player-facing code like a 6-character Tower Seed ("K7Q2MX"). Case-insensitive. */
export function seedFromCode(code: string): number {
  return hashString(code.trim().toUpperCase());
}

const CODE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'; // no 0/O/1/I/L
/** A readable seed code drawn from `rng` (so it is itself reproducible). */
export function seedCode(rng: Rng, length = 6): string {
  let s = '';
  for (let i = 0; i < length; i++) s += CODE_ALPHABET[rng.int(0, CODE_ALPHABET.length - 1)];
  return s;
}

export type RngState = [number, number, number, number];

export class SeededRng implements Rng {
  readonly seed: number;
  private a = 0;
  private b = 0;
  private c = 0;
  private d = 0;

  constructor(seed: number) {
    this.seed = normalizeSeed(seed);
    // splitmix32 expands the seed into the 128-bit state.
    let s = this.seed;
    const sm = (): number => {
      s = (s + 0x9e3779b9) | 0;
      let z = s;
      z = Math.imul(z ^ (z >>> 16), 0x21f0aaad);
      z = Math.imul(z ^ (z >>> 15), 0x735a2d97);
      return (z ^ (z >>> 15)) >>> 0;
    };
    this.a = sm();
    this.b = sm();
    this.c = sm();
    this.d = sm() | 1;
    for (let i = 0; i < 12; i++) this.u32();
  }

  /** Raw 32-bit output (sfc32). */
  u32(): number {
    const t = (((this.a + this.b) | 0) + this.d) | 0;
    this.d = (this.d + 1) | 0;
    this.a = this.b ^ (this.b >>> 9);
    this.b = (this.c + (this.c << 3)) | 0;
    this.c = (this.c << 21) | (this.c >>> 11);
    this.c = (this.c + t) | 0;
    return t >>> 0;
  }

  next(): number {
    return this.u32() / 4294967296;
  }

  range(min: number, max: number): number {
    return min + (max - min) * this.next();
  }

  int(min: number, maxInclusive: number): number {
    let lo = Math.ceil(min), hi = Math.floor(maxInclusive);
    if (hi < lo) [lo, hi] = [hi, lo];
    return lo + Math.floor(this.next() * (hi - lo + 1));
  }

  chance(p: number): boolean {
    return this.next() < p;
  }

  pick<T>(arr: readonly T[]): T {
    if (arr.length === 0) throw new Error('Rng.pick: empty array');
    return arr[Math.floor(this.next() * arr.length)];
  }

  shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      const t = arr[i];
      arr[i] = arr[j];
      arr[j] = t;
    }
    return arr;
  }

  weighted<T>(items: readonly T[], weight: (t: T) => number): T {
    if (items.length === 0) throw new Error('Rng.weighted: empty array');
    let total = 0;
    for (const it of items) {
      const w = weight(it);
      if (w > 0 && Number.isFinite(w)) total += w;
    }
    if (total <= 0) return this.pick(items);
    let r = this.next() * total;
    for (const it of items) {
      const w = weight(it);
      if (!(w > 0 && Number.isFinite(w))) continue;
      r -= w;
      if (r < 0) return it;
    }
    // Floating point fell off the end: return the last positively-weighted item.
    for (let i = items.length - 1; i >= 0; i--) if (weight(items[i]) > 0) return items[i];
    return items[items.length - 1];
  }

  /** Independent stream named by `label`; depends only on this rng's seed, not its position. */
  fork(label: string | number): SeededRng {
    const h = typeof label === 'number' ? fmix32(normalizeSeed(label) ^ 0x5bd1e995) : hashString(label);
    return new SeededRng(hashCombine(this.seed, h));
  }

  /** Standard normal sample (Box-Muller), scaled. */
  normal(mean = 0, sd = 1): number {
    const u = 1 - this.next();
    const v = this.next();
    return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  sign(): 1 | -1 {
    return this.next() < 0.5 ? -1 : 1;
  }

  /** Snapshot for save/replay/netcode. */
  getState(): RngState {
    return [this.a, this.b, this.c, this.d];
  }
  setState(s: RngState): void {
    [this.a, this.b, this.c, this.d] = s;
  }
  clone(): SeededRng {
    const r = new SeededRng(this.seed);
    r.setState(this.getState());
    return r;
  }
}

export function createRng(seed: number): SeededRng {
  return new SeededRng(seed);
}
