/**
 * Juice: bursts, ground shockwaves, beams, floating world text, screen flashes and ribbon trails.
 * Presentation only. Particles share two instanced draws (see particles.ts); rings, beams and
 * trails are one instanced/batched draw each. Pop text and flashes are pooled DOM nodes.
 */
import * as THREE from 'three';
import type { BurstKind, Fx } from '../core/api.ts';
import { EASE_IN, EASE_OUT, ParticleSystem, SPRITE, GLYPH_COUNT, popIn } from './particles.ts';
import type { ParticleSink } from './particles.ts';
import { TrailRenderer } from './trails.ts';
import type { TrailHandle } from './trails.ts';

export const BURST_KINDS: readonly BurstKind[] = [
  'dust', 'spark', 'confetti', 'shards', 'smoke', 'ember', 'bubbles', 'stars', 'splash',
  'glitch', 'feathers', 'coins', 'heal', 'ice', 'soundwave', 'poof',
];

export interface BurstOptions {
  /** Main-layer particle count (secondary layers scale with it). */
  count?: number;
  /** CSS colour for the main layer. */
  color?: string;
  /** Speed multiplier (1 = default). */
  speed?: number;
  /** Size multiplier (1 = default). */
  size?: number;
  /** Spatial spread multiplier (1 = default radius/cone). */
  spread?: number;
  /** Floor height for bouncing debris (default FxSystem.groundY, never above the burst). */
  ground?: number;
}

export const BURST_DEFAULT_COUNT: Record<BurstKind, number> = {
  dust: 10, spark: 22, confetti: 44, shards: 14, smoke: 12, ember: 24, bubbles: 14, stars: 5, splash: 26,
  glitch: 30, feathers: 10, coins: 12, heal: 10, ice: 12, soundwave: 3, poof: 14,
};
export const BURST_DEFAULT_COLOR: Record<BurstKind, string> = {
  dust: '#cdb99d', spark: '#ffc24d', confetti: '#ff5a7a', shards: '#bfe6ff', smoke: '#a39cba', ember: '#ff7a2a',
  bubbles: '#7fe3ff', stars: '#ffe45c', splash: '#5fcfff', glitch: '#b388ff', feathers: '#fff4e6', coins: '#ffc83d',
  heal: '#6cff8e', ice: '#aeeaff', soundwave: '#f2b134', poof: '#f1ecff',
};
const CONFETTI_PALETTE = ['#ff5a7a', '#ffd23f', '#4fc3f7', '#8bd450', '#b388ff', '#ff9f43', '#ff7ad9', '#00e5c0'];

export interface RGB { r: number; g: number; b: number }
const colorCache = new Map<string, RGB>();
const _c = new THREE.Color();
const _hsl = { h: 0, s: 0, l: 0 };

/** CSS colour -> cached linear RGB. Unparseable strings fall back. */
const COLOR_FN = /^(rgb|hsl)a?\(/i;
const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
function looksLikeColor(s: string): boolean {
  return HEX.test(s) || COLOR_FN.test(s) || Object.prototype.hasOwnProperty.call(THREE.Color.NAMES, s.toLowerCase());
}

export function linearColor(css: string | undefined, fallback: string): RGB {
  const key = css ?? fallback;
  let c = colorCache.get(key);
  if (!c) {
    // THREE.Color warns and keeps its previous value on unknown strings, so pre-validate and
    // start from NaN to detect a no-op parse.
    _c.setRGB(Number.NaN, Number.NaN, Number.NaN);
    if (looksLikeColor(key)) _c.setStyle(key);
    if (!Number.isFinite(_c.r + _c.g + _c.b)) _c.setStyle(fallback);
    c = { r: _c.r, g: _c.g, b: _c.b };
    if (colorCache.size > 256) colorCache.clear();
    colorCache.set(key, c);
  }
  return c;
}

/** Tiny xorshift so bursts are deterministic per FxSystem (cosmetic only). */
export class FxRand {
  private s: number;
  constructor(seed = 0x9e3779b9) {
    this.s = seed | 0 || 1;
  }
  next(): number {
    let x = this.s;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    this.s = x;
    return (x >>> 0) / 4294967296;
  }
  range(a: number, b: number): number {
    return a + (b - a) * this.next();
  }
  sign(): number {
    return this.next() < 0.5 ? -1 : 1;
  }
}

const DIR = { x: 0, y: 0, z: 0 };
/** Random unit vector with y in [yMin, yMax] (cone around +Y when yMin > 0). */
function dir(r: FxRand, yMin: number, yMax: number): void {
  const th = r.next() * Math.PI * 2;
  const y = r.range(yMin, yMax);
  const k = Math.sqrt(Math.max(0, 1 - y * y));
  DIR.x = Math.cos(th) * k;
  DIR.y = y;
  DIR.z = Math.sin(th) * k;
}
const VAR: RGB = { r: 0, g: 0, b: 0 };
/** Hue/lightness jitter of a colour (for single-colour confetti etc). */
function variant(c: RGB, r: FxRand, dh: number, dl: number): RGB {
  _c.setRGB(c.r, c.g, c.b);
  _c.getHSL(_hsl);
  _c.setHSL((_hsl.h + r.range(-dh, dh) + 1) % 1, _hsl.s, Math.min(0.92, Math.max(0.08, _hsl.l + r.range(-dl, dl))));
  VAR.r = _c.r; VAR.g = _c.g; VAR.b = _c.b;
  return VAR;
}

/**
 * Emits one burst into `ps`. Pure w.r.t. rendering (only touches the sink), so tests can run it
 * against a bare pool. `density` is the quality-preset multiplier on every layer's count.
 * Returns the number of particles emitted.
 */
export function emitBurst(
  ps: ParticleSink, kind: BurstKind, x: number, y: number, z: number, o: BurstOptions, r: FxRand, groundDefault = 0, density = 1,
): number {
  const P = ps.params;
  const k0 = o.count !== undefined && Number.isFinite(o.count) ? o.count / BURST_DEFAULT_COUNT[kind] : 1;
  const k = Math.min(20, Math.max(0.05, k0 * (Number.isFinite(density) ? Math.max(0, density) : 1)));
  const sp = finite(o.speed, 1);
  const sz = finite(o.size, 1);
  const spr = finite(o.spread, 1);
  const gy = Math.min(finite(o.ground, groundDefault), y);
  const c = linearColor(o.color, BURST_DEFAULT_COLOR[kind]);
  const n = (b: number): number => Math.max(1, Math.round(b * k));
  let emitted = 0;
  const emit = (): void => {
    ps.spawn(P);
    emitted++;
  };
  const glow = (size: number, life: number, ir: number, ig: number, ib: number, alpha = 0.9): void => {
    P.reset();
    P.at(x, y, z);
    P.sprite = SPRITE.glow;
    P.size(size * 0.25 * sz, size * sz);
    P.sizeEase = EASE_OUT;
    P.life = life;
    P.color(ir, ig, ib);
    P.alpha = alpha;
    P.fadeOut = 1;
    emit();
  };
  const flatRing = (size: number, life: number, ir: number, ig: number, ib: number, alpha: number, delay = 0, blend: 'add' | 'alpha' = 'add'): void => {
    P.reset();
    P.blend = blend;
    P.at(x, y + 0.03, z);
    P.flat = true;
    P.sprite = SPRITE.ring;
    P.size(0.25 * sz, size * spr * sz);
    P.sizeEase = EASE_OUT;
    P.life = life;
    P.delay = delay;
    P.color(ir, ig, ib);
    P.alpha = alpha;
    P.fadeOut = 0.85;
    P.hot = 0.3;
    emit();
  };

  switch (kind) {
    case 'dust': {
      for (let i = 0, N = n(10); i < N; i++) {
        P.reset();
        P.blend = 'alpha';
        dir(r, 0, 0.3);
        const s = r.range(1.4, 3.0) * sp;
        const off = r.range(0.05, 0.25) * spr;
        P.at(x + DIR.x * off, y + 0.1 * sz + r.range(0, 0.1), z + DIR.z * off);
        P.vel(DIR.x * s * spr, DIR.y * s + 0.3, DIR.z * s * spr);
        P.drag = 3.2;
        P.gravity = -0.35;
        P.sprite = i % 2 ? SPRITE.smoke : SPRITE.smoke2;
        P.hot = 0;
        const s0 = r.range(0.22, 0.36) * sz;
        P.size(s0, s0 * 2.6);
        P.sizeEase = EASE_OUT;
        const b = r.range(0.85, 1.1);
        P.color(c.r * b, c.g * b, c.b * b).colorEnd(c.r * 0.72, c.g * 0.7, c.b * 0.68);
        P.alpha = r.range(0.5, 0.7);
        P.fadeIn = 0.06;
        P.fadeOut = 0.7;
        P.life = r.range(0.7, 1.15);
        P.rot = r.next() * 6.28;
        P.spin = r.range(-1.5, 1.5);
        emit();
      }
      for (let i = 0, N = n(6); i < N; i++) {
        P.reset();
        P.blend = 'alpha';
        dir(r, 0.5, 1);
        const s = r.range(2, 4) * sp;
        P.at(x, y + 0.05, z).vel(DIR.x * s * spr, DIR.y * s, DIR.z * s * spr);
        P.sprite = SPRITE.dot;
        P.size(r.range(0.04, 0.07) * sz);
        P.gravity = 18;
        P.bounce = 0.3;
        P.groundY = gy;
        P.color(c.r * 0.55, c.g * 0.5, c.b * 0.45);
        P.life = r.range(0.6, 0.9);
        P.fadeOut = 0.25;
        P.hot = 0.3;
        emit();
      }
      flatRing(1.9, 0.45, c.r * 1.1, c.g * 1.1, c.b * 1.1, 0.35, 0, 'alpha');
      break;
    }
    case 'spark': {
      glow(1.8, 0.16, 1.2 + c.r * 2, 1.1 + c.g * 2, 0.8 + c.b * 2);
      P.reset();
      P.at(x, y, z);
      P.sprite = SPRITE.flare;
      P.size(1.7 * sz, 0.2 * sz);
      P.rot = r.next() * 0.8 - 0.4;
      P.life = 0.2;
      P.color(2 + c.r, 2 + c.g, 2 + c.b);
      P.fadeOut = 0.6;
      emit();
      for (let i = 0, N = n(22); i < N; i++) {
        P.reset();
        dir(r, -0.15, 1);
        const s = r.range(4.5, 10) * sp;
        P.at(x, y, z).vel(DIR.x * s * spr, DIR.y * s, DIR.z * s * spr);
        P.sprite = SPRITE.streak;
        P.stretch = 0.035;
        P.size(r.range(0.07, 0.11) * sz, 0.02 * sz);
        P.gravity = 10;
        P.drag = 2;
        P.bounce = 0.35;
        P.groundY = gy;
        P.life = r.range(0.35, 0.8);
        P.color(1.6 + c.r * 1.6, 1.4 + c.g * 1.6, 1.0 + c.b * 1.6).colorEnd(c.r * 1.8, c.g * 0.55, c.b * 0.25);
        P.fadeOut = 0.45;
        P.hot = 0.8;
        emit();
      }
      for (let i = 0, N = n(6); i < N; i++) {
        P.reset();
        dir(r, 0.3, 1);
        const s = r.range(1, 2.6) * sp;
        P.at(x, y, z).vel(DIR.x * s * spr, DIR.y * s, DIR.z * s * spr);
        P.sprite = SPRITE.ember;
        P.size(r.range(0.05, 0.08) * sz, 0.01);
        P.gravity = -0.6;
        P.drag = 1.6;
        P.wobble = 0.06;
        P.wobbleFreq = 8;
        P.pulse = 0.5;
        P.pulseFreq = 9;
        P.life = r.range(0.8, 1.5);
        P.color(c.r * 2.4, c.g * 2.4, c.b * 2.4).colorEnd(c.r * 1.2, c.g * 0.35, c.b * 0.1);
        emit();
      }
      break;
    }
    case 'confetti': {
      glow(1.2, 0.12, 2, 1.9, 1.7, 0.7);
      for (let i = 0, N = n(44); i < N; i++) {
        P.reset();
        P.blend = 'alpha';
        dir(r, 0.55, 1);
        const s = r.range(5.5, 9.5) * sp;
        const h = 0.75 * spr;
        P.at(x + r.range(-0.1, 0.1), y + 0.1, z + r.range(-0.1, 0.1)).vel(DIR.x * s * h, DIR.y * s, DIR.z * s * h);
        P.sprite = r.next() < 0.75 ? SPRITE.rect : SPRITE.pixel;
        const s0 = r.range(0.12, 0.18) * sz;
        P.size(P.sprite === SPRITE.pixel ? s0 * 0.7 : s0);
        P.gravity = 7;
        P.drag = 2.8;
        P.flip = r.range(8, 16) * r.sign();
        P.flipPhase = r.next() * 6.28;
        P.rot = r.next() * 6.28;
        P.spin = r.range(-5, 5);
        P.wobble = 0.1;
        P.wobbleFreq = r.range(4, 7);
        P.bounce = 0.05;
        P.land = true;
        P.groundY = gy + 0.01;
        P.life = r.range(2.4, 3.6);
        P.fadeOut = 0.15;
        P.hot = 0.35;
        const col = o.color ? variant(c, r, 0.05, 0.14) : linearColor(CONFETTI_PALETTE[Math.floor(r.next() * CONFETTI_PALETTE.length)], '#ffffff');
        P.color(col.r, col.g, col.b);
        emit();
      }
      for (let i = 0, N = n(10); i < N; i++) {
        P.reset();
        dir(r, 0, 1);
        const s = r.range(1.5, 4) * sp;
        P.at(x, y + 0.2, z).vel(DIR.x * s * spr, DIR.y * s, DIR.z * s * spr);
        P.sprite = SPRITE.sparkle;
        P.size(r.range(0.12, 0.22) * sz, 0.02);
        P.sizeIn = 0.15;
        P.drag = 3;
        P.pulse = 0.6;
        P.pulseFreq = 6;
        P.rot = r.next() * 6.28;
        P.life = r.range(0.5, 1);
        P.color(2.5, 2.2, 1.6);
        emit();
      }
      break;
    }
    case 'shards': {
      glow(1.3, 0.12, c.r * 2 + 0.6, c.g * 2 + 0.6, c.b * 2 + 0.6);
      for (let i = 0, N = n(14); i < N; i++) {
        P.reset();
        P.blend = 'alpha';
        dir(r, 0.1, 1);
        const s = r.range(3.5, 7.5) * sp;
        P.at(x, y, z).vel(DIR.x * s * spr, DIR.y * s, DIR.z * s * spr);
        P.sprite = SPRITE.shard;
        const s0 = r.range(0.12, 0.26) * sz;
        P.size(s0, s0 * 0.7);
        P.gravity = 15;
        P.drag = 0.6;
        P.bounce = 0.3;
        P.groundY = gy;
        P.spin = r.range(8, 14) * r.sign();
        P.flip = r.range(6, 12) * r.sign();
        P.flipPhase = r.next() * 6.28;
        P.rot = r.next() * 6.28;
        P.life = r.range(0.9, 1.5);
        P.fadeOut = 0.3;
        P.color(c.r * 1.5, c.g * 1.5, c.b * 1.5).colorEnd(c.r, c.g, c.b);
        emit();
      }
      for (let i = 0, N = n(8); i < N; i++) {
        P.reset();
        dir(r, 0, 1);
        const s = r.range(2, 5) * sp;
        P.at(x, y, z).vel(DIR.x * s * spr, DIR.y * s, DIR.z * s * spr);
        P.sprite = SPRITE.sparkle;
        P.size(r.range(0.08, 0.16) * sz, 0.02);
        P.drag = 4;
        P.pulse = 0.5;
        P.pulseFreq = 10;
        P.life = r.range(0.3, 0.6);
        P.color(2.5, 2.5, 2.6);
        emit();
      }
      for (let i = 0, N = n(4); i < N; i++) {
        P.reset();
        P.blend = 'alpha';
        dir(r, 0, 0.4);
        const s = r.range(0.6, 1.2) * sp;
        P.at(x, y, z).vel(DIR.x * s, DIR.y * s, DIR.z * s);
        P.sprite = SPRITE.smoke;
        P.size(0.3 * sz, 1.1 * sz);
        P.sizeEase = EASE_OUT;
        P.drag = 2;
        P.life = 0.6;
        P.alpha = 0.28;
        P.hot = 0;
        P.color(c.r * 0.9, c.g * 0.9, c.b * 0.9);
        emit();
      }
      break;
    }
    case 'smoke': {
      for (let i = 0, N = n(12); i < N; i++) {
        P.reset();
        P.blend = 'alpha';
        dir(r, 0.1, 0.7);
        const s = r.range(0.5, 1.4) * sp;
        const off = r.range(0, 0.25) * spr;
        P.at(x + DIR.x * off, y + 0.1, z + DIR.z * off).vel(DIR.x * s * spr, DIR.y * s, DIR.z * s * spr);
        P.gravity = -1.4;
        P.drag = 1.4;
        P.sprite = i % 2 ? SPRITE.smoke : SPRITE.smoke2;
        P.hot = 0;
        const s0 = r.range(0.35, 0.55) * sz;
        P.size(s0, s0 * 2.6);
        P.sizeEase = EASE_OUT;
        P.rot = r.next() * 6.28;
        P.spin = r.range(-0.6, 0.6);
        P.life = r.range(1.4, 2.4);
        P.alpha = r.range(0.55, 0.7);
        P.fadeIn = 0.08;
        P.fadeOut = 0.6;
        const b = r.range(0.85, 1.1);
        P.color(c.r * b, c.g * b, c.b * b).colorEnd(c.r * 0.5, c.g * 0.5, c.b * 0.55);
        emit();
      }
      for (let i = 0, N = n(3); i < N; i++) {
        P.reset();
        P.blend = 'alpha';
        P.at(x + r.range(-0.3, 0.3), y + 0.5, z + r.range(-0.3, 0.3)).vel(r.range(-0.3, 0.3), 0.5 * sp, r.range(-0.3, 0.3));
        P.sprite = SPRITE.wisp;
        P.hot = 0;
        P.size(0.9 * sz, 2.2 * sz);
        P.rot = r.range(-0.4, 0.4);
        P.life = 1.8;
        P.alpha = 0.25;
        P.fadeIn = 0.2;
        P.fadeOut = 0.6;
        P.color(c.r, c.g, c.b);
        emit();
      }
      break;
    }
    case 'ember': {
      glow(1.4, 0.3, c.r * 2.2, c.g * 2.2, c.b * 2.2, 0.8);
      for (let i = 0, N = n(24); i < N; i++) {
        P.reset();
        dir(r, 0.5, 1);
        const s = r.range(1, 3) * sp;
        const off = r.range(0, 0.25) * spr;
        P.at(x + DIR.x * off, y + r.range(0, 0.2), z + DIR.z * off).vel(DIR.x * s * spr, DIR.y * s, DIR.z * s * spr);
        P.sprite = SPRITE.ember;
        P.gravity = -1.3;
        P.drag = 1.2;
        P.wobble = 0.15;
        P.wobbleFreq = r.range(3, 7);
        P.pulse = 0.55;
        P.pulseFreq = r.range(6, 13);
        P.size(r.range(0.06, 0.12) * sz, 0.015);
        P.life = r.range(1, 2.2);
        // Saturated hot start (AgX bleaches added white), cooling to deep red.
        P.color(0.9 + c.r * 2.2, 0.25 + c.g * 2.2, 0.04 + c.b * 1.2).colorEnd(c.r * 1.6, c.g * 0.3, c.b * 0.08);
        P.fadeOut = 0.4;
        P.hot = 0.45;
        emit();
      }
      for (let i = 0, N = n(6); i < N; i++) {
        P.reset();
        dir(r, 0.2, 1);
        const s = r.range(3, 6) * sp;
        P.at(x, y, z).vel(DIR.x * s * spr, DIR.y * s, DIR.z * s * spr);
        P.sprite = SPRITE.streak;
        P.stretch = 0.03;
        P.size(0.06 * sz, 0.02);
        P.gravity = 4;
        P.drag = 1.5;
        P.life = r.range(0.3, 0.5);
        P.color(2.4, 1.8, 1.0).colorEnd(c.r * 1.6, c.g * 0.4, c.b * 0.1);
        emit();
      }
      for (let i = 0, N = n(3); i < N; i++) {
        P.reset();
        P.blend = 'alpha';
        P.at(x + r.range(-0.2, 0.2), y + 0.3, z + r.range(-0.2, 0.2)).vel(0, 0.8 * sp, 0);
        P.sprite = SPRITE.smoke;
        P.hot = 0;
        P.size(0.3 * sz, 1.2 * sz);
        P.drag = 0.8;
        P.rot = r.next() * 6.28;
        P.spin = r.range(-0.5, 0.5);
        P.life = r.range(1.2, 1.8);
        P.alpha = 0.35;
        P.fadeIn = 0.15;
        P.color(0.06 + c.r * 0.12, 0.05 + c.g * 0.1, 0.06 + c.b * 0.1);
        emit();
      }
      break;
    }
    case 'bubbles': {
      for (let i = 0, N = n(14); i < N; i++) {
        P.reset();
        dir(r, -1, 1);
        const off = Math.cbrt(r.next()) * 0.35 * spr;
        P.at(x + DIR.x * off, y + 0.1 + Math.abs(DIR.y) * off, z + DIR.z * off);
        P.vel(DIR.x * 0.6 * sp, r.range(0.8, 1.8) * sp, DIR.z * 0.6 * sp);
        P.gravity = -1.2;
        P.drag = 1.3;
        P.wobble = 0.07;
        P.wobbleFreq = r.range(5, 9);
        P.sprite = SPRITE.bubble;
        const s0 = r.range(0.07, 0.22) * sz;
        P.size(s0, s0 * 1.35);
        P.sizeEase = EASE_IN;
        P.sizeIn = 0.1;
        P.life = r.range(1.2, 2.4);
        P.fadeIn = 0.05;
        P.fadeOut = 0.08;
        P.alpha = 0.95;
        P.color(c.r * 1.25, c.g * 1.25, c.b * 1.25);
        emit();
      }
      for (let i = 0, N = n(5); i < N; i++) {
        P.reset();
        dir(r, 0, 1);
        const s = r.range(1, 2) * sp;
        P.at(x, y + 0.2, z).vel(DIR.x * s, DIR.y * s, DIR.z * s);
        P.sprite = SPRITE.sparkle;
        P.size(r.range(0.06, 0.1) * sz, 0.01);
        P.drag = 2;
        P.life = r.range(0.4, 0.7);
        P.color(1.5, 1.7, 1.8);
        emit();
      }
      break;
    }
    case 'stars': {
      glow(1.2, 0.15, c.r * 1.8, c.g * 1.8, c.b * 1.8, 0.7);
      const N = n(5);
      for (let i = 0; i < N; i++) {
        P.reset();
        P.blend = 'alpha';
        P.at(x, y + 0.1, z);
        P.sprite = SPRITE.star;
        P.orbitR = 0.5 * spr;
        P.orbitW = 5.2 * sp;
        P.orbitPhase = (i / N) * Math.PI * 2;
        P.size(0.22 * sz);
        P.sizeIn = 0.15;
        P.spin = 2.5;
        P.life = 1.9;
        P.fadeOut = 0.18;
        P.color(c.r * 1.35, c.g * 1.35, c.b * 1.35);
        emit();
      }
      for (let i = 0, N2 = n(6); i < N2; i++) {
        P.reset();
        P.blend = 'alpha';
        dir(r, 0.2, 1);
        const s = r.range(2.5, 4.5) * sp;
        P.at(x, y, z).vel(DIR.x * s * spr, DIR.y * s, DIR.z * s * spr);
        P.sprite = SPRITE.star;
        P.size(r.range(0.09, 0.14) * sz);
        P.gravity = 9;
        P.drag = 2;
        P.spin = r.range(-8, 8);
        P.life = r.range(0.55, 0.9);
        P.fadeOut = 0.4;
        P.color(c.r * 1.2, c.g * 1.2, c.b * 1.2);
        emit();
      }
      for (let i = 0, N2 = n(6); i < N2; i++) {
        P.reset();
        const a = r.next() * Math.PI * 2;
        const rr = r.range(0.3, 0.7) * spr;
        P.at(x + Math.cos(a) * rr, y + r.range(0, 0.35), z + Math.sin(a) * rr);
        P.sprite = SPRITE.sparkle;
        P.size(r.range(0.12, 0.2) * sz, 0.03);
        P.sizeIn = 0.2;
        P.pulse = 0.7;
        P.pulseFreq = 5;
        P.delay = r.range(0, 0.4);
        P.life = r.range(0.5, 0.9);
        P.color(1.5 + c.r, 1.5 + c.g, 1.2 + c.b);
        emit();
      }
      break;
    }
    case 'splash': {
      for (let i = 0, N = n(26); i < N; i++) {
        P.reset();
        dir(r, 0.5, 1);
        const s = r.range(3.5, 7) * sp;
        P.at(x + DIR.x * 0.1, y + 0.05, z + DIR.z * 0.1).vel(DIR.x * s * spr, DIR.y * s, DIR.z * s * spr);
        P.sprite = SPRITE.dot;
        P.stretch = 0.045;
        P.size(r.range(0.05, 0.09) * sz, 0.03 * sz);
        P.gravity = 16;
        P.drag = 0.5;
        P.life = r.range(0.5, 0.95);
        P.color((0.8 + c.r) * 1.2, (0.8 + c.g) * 1.2, (0.8 + c.b) * 1.2).colorEnd(c.r * 1.4, c.g * 1.4, c.b * 1.4);
        P.fadeOut = 0.3;
        P.hot = 0.5;
        emit();
      }
      for (let i = 0; i < 3; i++) flatRing(1.6 + i * 0.5, 0.75, c.r * 1.6, c.g * 1.6, c.b * 1.6, 0.8, i * 0.11 + (i > 1 ? 0.02 : 0));
      for (let i = 0, N = n(5); i < N; i++) {
        P.reset();
        P.blend = 'alpha';
        dir(r, 0, 0.5);
        const s = r.range(0.8, 1.6) * sp;
        P.at(x, y + 0.15, z).vel(DIR.x * s * spr, DIR.y * s, DIR.z * s * spr);
        P.sprite = SPRITE.smoke2;
        P.hot = 0;
        P.size(0.25 * sz, 0.9 * sz);
        P.sizeEase = EASE_OUT;
        P.drag = 3;
        P.life = r.range(0.5, 0.8);
        P.alpha = 0.3;
        P.color((c.r + 0.5) * 0.8, (c.g + 0.5) * 0.8, (c.b + 0.5) * 0.8);
        emit();
      }
      break;
    }
    case 'glitch': {
      const pal: RGB[] = [c, linearColor('#ff2bd6', '#ff2bd6'), linearColor('#28f0ff', '#28f0ff'), linearColor('#ffffff', '#ffffff')];
      for (let i = 0, N = n(30); i < N; i++) {
        P.reset();
        P.at(x + r.range(-0.6, 0.6) * spr, y + r.range(0, 1.1) * spr, z + r.range(-0.6, 0.6) * spr);
        P.vel(r.range(-1.2, 1.2) * sp, r.range(-0.4, 0.4) * sp, r.range(-1.2, 1.2) * sp);
        P.sprite = SPRITE.pixel;
        P.quant = 0.07 * sz;
        P.hot = 0;
        P.size((1 + Math.floor(r.next() * 3)) * 0.05 * sz);
        P.drag = 2.5;
        P.life = r.range(0.25, 0.8);
        P.pulse = 0.9;
        P.pulseFreq = r.range(8, 18);
        const col = pal[Math.floor(r.next() * pal.length)];
        P.color(col.r * 2.2, col.g * 2.2, col.b * 2.2);
        P.fadeOut = 0.2;
        emit();
      }
      for (let i = 0, N = n(7); i < N; i++) {
        P.reset();
        P.at(x + r.range(-0.3, 0.3), y + r.range(0.1, 1.2) * spr, z + r.range(-0.3, 0.3));
        P.vel(r.range(5, 9) * r.sign() * sp, 0, r.range(-0.5, 0.5));
        P.sprite = SPRITE.pixel;
        P.stretch = 0.06;
        P.quant = 0.07 * sz;
        P.hot = 0;
        P.size(0.05 * sz);
        P.drag = 4;
        P.life = r.range(0.12, 0.3);
        const col = pal[Math.floor(r.next() * pal.length)];
        P.color(col.r * 2.5, col.g * 2.5, col.b * 2.5);
        P.fadeOut = 0.3;
        emit();
      }
      for (let i = 0, N = n(5); i < N; i++) {
        P.reset();
        P.at(x + r.range(-0.5, 0.5) * spr, y + r.range(0.2, 1.0) * spr, z + r.range(-0.5, 0.5) * spr);
        P.vel(0, r.range(0.3, 0.7) * sp, 0);
        P.sprite = SPRITE.glyph + Math.floor(r.next() * GLYPH_COUNT);
        P.size(r.range(0.22, 0.34) * sz);
        P.drag = 0.5;
        P.pulse = 0.75;
        P.pulseFreq = 10;
        P.quant = 0.05;
        P.life = r.range(0.5, 1);
        P.color(c.r * 2.6, c.g * 2.6, c.b * 2.6);
        emit();
      }
      P.reset();
      P.at(x, y + 0.5, z);
      P.sprite = SPRITE.pixel;
      P.hot = 0;
      P.size(0.9 * sz);
      P.life = 0.08;
      P.alpha = 0.5;
      P.fadeOut = 0;
      P.color(1.2, 1.2, 1.3);
      emit();
      break;
    }
    case 'feathers': {
      for (let i = 0, N = n(4); i < N; i++) {
        P.reset();
        P.blend = 'alpha';
        dir(r, 0, 0.6);
        P.at(x, y + 0.2, z).vel(DIR.x * 1.5 * sp, DIR.y * 1.5 * sp, DIR.z * 1.5 * sp);
        P.sprite = SPRITE.smoke;
        P.hot = 0;
        P.size(0.3 * sz, 1 * sz);
        P.sizeEase = EASE_OUT;
        P.drag = 5;
        P.life = 0.45;
        P.alpha = 0.5;
        P.color(c.r, c.g, c.b);
        emit();
      }
      for (let i = 0, N = n(10); i < N; i++) {
        P.reset();
        P.blend = 'alpha';
        dir(r, 0.3, 1);
        const s = r.range(2.5, 5) * sp;
        P.at(x, y + 0.2, z).vel(DIR.x * s * spr, DIR.y * s, DIR.z * s * spr);
        P.sprite = SPRITE.feather;
        P.hot = 0;
        P.size(r.range(0.2, 0.3) * sz);
        P.gravity = 2.4;
        P.drag = 2.8;
        P.wobble = 0.22;
        P.wobbleFreq = r.range(2.5, 4);
        P.rot = r.next() * 6.28;
        P.spin = r.range(-2.5, 2.5);
        P.flip = r.range(2, 4.5) * r.sign();
        P.flipPhase = r.next() * 6.28;
        P.bounce = 0;
        P.land = true;
        P.groundY = gy + 0.01;
        P.life = r.range(2.4, 3.6);
        P.fadeOut = 0.25;
        const b = r.range(0.9, 1.05);
        P.color(c.r * b, c.g * b, c.b * b).colorEnd(c.r * 0.9, c.g * 0.9, c.b * 0.9);
        emit();
      }
      for (let i = 0, N = n(8); i < N; i++) {
        P.reset();
        P.blend = 'alpha';
        dir(r, -0.2, 1);
        const s = r.range(0.6, 1.5) * sp;
        P.at(x, y + 0.3, z).vel(DIR.x * s * spr, DIR.y * s, DIR.z * s * spr);
        P.sprite = SPRITE.dot;
        P.size(r.range(0.03, 0.05) * sz);
        P.gravity = 0.6;
        P.drag = 2;
        P.wobble = 0.12;
        P.wobbleFreq = 3;
        P.life = r.range(1.2, 2);
        P.color(c.r, c.g, c.b);
        P.hot = 0;
        emit();
      }
      break;
    }
    case 'coins': {
      glow(1.3, 0.14, c.r * 2, c.g * 2, c.b * 2, 0.8);
      for (let i = 0, N = n(12); i < N; i++) {
        P.reset();
        P.blend = 'alpha';
        dir(r, 0.65, 1);
        const s = r.range(5, 7.5) * sp;
        const h = 0.75 * spr;
        P.at(x, y + 0.1, z).vel(DIR.x * s * h, DIR.y * s, DIR.z * s * h);
        P.sprite = SPRITE.coin;
        P.size(r.range(0.17, 0.21) * sz);
        P.gravity = 17;
        P.drag = 0.3;
        P.bounce = 0.45;
        P.land = true;
        P.groundY = gy + 0.01;
        P.flip = r.range(10, 18) * r.sign();
        P.flipPhase = r.next() * 6.28;
        P.rot = r.range(-0.3, 0.3);
        P.life = r.range(1.8, 2.4);
        P.fadeOut = 0.15;
        // Deeper gold: the sprite's own highlight supplies the shine.
        P.color(c.r * 1.15, c.g * 0.92, c.b * 0.45);
        emit();
      }
      for (let i = 0, N = n(10); i < N; i++) {
        P.reset();
        dir(r, 0.2, 1);
        const s = r.range(1, 3.5) * sp;
        P.at(x + r.range(-0.25, 0.25), y + 0.2, z + r.range(-0.25, 0.25)).vel(DIR.x * s * spr, DIR.y * s, DIR.z * s * spr);
        P.sprite = SPRITE.sparkle;
        P.size(r.range(0.1, 0.18) * sz, 0.02);
        P.drag = 3;
        P.pulse = 0.6;
        P.pulseFreq = 7;
        P.rot = r.next() * 6.28;
        P.life = r.range(0.4, 0.8);
        P.color((1.6 + c.r) * 1.2, (1.4 + c.g) * 1.2, (0.8 + c.b) * 1.2);
        emit();
      }
      break;
    }
    case 'heal': {
      flatRing(1.8, 0.7, c.r * 2, c.g * 2, c.b * 2, 0.8);
      P.reset();
      P.at(x, y + 0.6, z);
      P.sprite = SPRITE.glow;
      P.size(1.3 * sz, 0.6 * sz);
      P.life = 0.5;
      P.alpha = 0.6;
      P.color(c.r * 1.1, c.g * 1.1, c.b * 1.1);
      emit();
      for (let i = 0, N = n(10); i < N; i++) {
        P.reset();
        const a = r.next() * Math.PI * 2;
        const rr = r.range(0.25, 0.6) * spr;
        P.at(x + Math.cos(a) * rr, y + r.range(0, 0.4), z + Math.sin(a) * rr);
        P.vel(r.range(-0.15, 0.15), r.range(1.1, 2.1) * sp, r.range(-0.15, 0.15));
        P.gravity = -0.4;
        P.drag = 0.9;
        P.wobble = 0.06;
        P.wobbleFreq = 3;
        P.sprite = SPRITE.plus;
        P.size(r.range(0.13, 0.2) * sz, 0.08 * sz);
        P.sizeIn = 0.25;
        P.delay = r.range(0, 0.25);
        P.life = r.range(1, 1.6);
        P.fadeOut = 0.35;
        P.color(c.r * 2.1, c.g * 2.1, c.b * 2.1).colorEnd(c.r * 1.4, c.g * 1.4, c.b * 1.4);
        emit();
      }
      for (let i = 0, N = n(14); i < N; i++) {
        P.reset();
        P.at(x, y + r.range(0, 0.3), z).vel(0, r.range(1, 2) * sp, 0);
        P.orbitR = r.range(0.35, 0.6) * spr;
        P.orbitW = r.range(3, 5) * r.sign();
        P.orbitPhase = r.next() * 6.28;
        P.drag = 0.4;
        P.sprite = SPRITE.sparkle;
        P.size(r.range(0.08, 0.14) * sz, 0.02);
        P.pulse = 0.5;
        P.pulseFreq = 6;
        P.life = r.range(0.8, 1.4);
        P.color((c.r + 0.6) * 1.8, (c.g + 0.6) * 1.8, (c.b + 0.6) * 1.8);
        emit();
      }
      break;
    }
    case 'ice': {
      glow(1.3, 0.12, c.r * 1.8, c.g * 1.8, c.b * 1.8, 0.8);
      for (let i = 0, N = n(12); i < N; i++) {
        P.reset();
        P.blend = 'alpha';
        dir(r, 0.15, 1);
        const s = r.range(2.5, 5.5) * sp;
        P.at(x, y + 0.05, z).vel(DIR.x * s * spr, DIR.y * s, DIR.z * s * spr);
        P.sprite = SPRITE.shard;
        const s0 = r.range(0.1, 0.24) * sz;
        P.size(s0, s0 * 0.8);
        P.gravity = 14;
        P.drag = 0.5;
        P.bounce = 0.25;
        P.groundY = gy;
        P.spin = r.range(6, 12) * r.sign();
        P.flip = r.range(5, 10) * r.sign();
        P.flipPhase = r.next() * 6.28;
        P.rot = r.next() * 6.28;
        P.life = r.range(0.8, 1.3);
        P.fadeOut = 0.3;
        P.color(c.r * 1.55, c.g * 1.55, c.b * 1.55).colorEnd(c.r * 1.1, c.g * 1.1, c.b * 1.1);
        emit();
      }
      for (let i = 0, N = n(8); i < N; i++) {
        P.reset();
        dir(r, 0, 1);
        const s = r.range(0.5, 1.6) * sp;
        P.at(x, y + 0.3, z).vel(DIR.x * s * spr, DIR.y * s, DIR.z * s * spr);
        P.sprite = SPRITE.snowflake;
        P.size(r.range(0.08, 0.16) * sz, 0.04 * sz);
        P.drag = 2;
        P.gravity = 0.4;
        P.spin = r.range(-2, 2);
        P.rot = r.next() * 6.28;
        P.life = r.range(1.2, 2);
        P.pulse = 0.3;
        P.pulseFreq = 4;
        P.color((c.r + 0.4) * 1.6, (c.g + 0.4) * 1.6, (c.b + 0.4) * 1.6);
        emit();
      }
      for (let i = 0, N = n(5); i < N; i++) {
        P.reset();
        P.blend = 'alpha';
        dir(r, 0, 0.3);
        const s = r.range(0.8, 1.6) * sp;
        P.at(x, y + 0.15, z).vel(DIR.x * s * spr, DIR.y * s, DIR.z * s * spr);
        P.sprite = SPRITE.smoke;
        P.hot = 0;
        P.size(0.4 * sz, 1.4 * sz);
        P.sizeEase = EASE_OUT;
        P.drag = 2.5;
        P.rot = r.next() * 6.28;
        P.life = r.range(0.8, 1.2);
        P.alpha = 0.3;
        P.color(c.r * 0.6 + 0.4, c.g * 0.6 + 0.4, c.b * 0.6 + 0.4);
        emit();
      }
      flatRing(2, 0.8, c.r * 1.6, c.g * 1.6, c.b * 1.6, 0.7);
      break;
    }
    case 'soundwave': {
      glow(1.6, 0.2, c.r * 1.6, c.g * 1.6, c.b * 1.6, 0.8);
      for (let i = 0, N = n(3); i < N; i++) {
        P.reset();
        P.at(x, y + 0.4, z);
        P.sprite = SPRITE.ring;
        P.size(0.3 * sz, 2.5 * spr * sz);
        P.sizeEase = EASE_OUT;
        P.delay = i * 0.13;
        P.life = 0.7;
        P.alpha = 0.85 - i * 0.18;
        P.fadeOut = 0.8;
        P.hot = 0.3;
        P.color(c.r * 2.2, c.g * 2.2, c.b * 2.2);
        emit();
      }
      // The ground shockwave itself comes from FxSystem.ring(); this is its trailing echo.
      flatRing(2.6, 0.9, c.r * 1.4, c.g * 1.4, c.b * 1.4, 0.45, 0.2);
      for (let i = 0, N = n(5); i < N; i++) {
        P.reset();
        dir(r, 0.3, 0.9);
        const s = r.range(0.8, 1.6) * sp;
        P.at(x, y + 0.5, z).vel(DIR.x * s * spr, DIR.y * s, DIR.z * s * spr);
        P.sprite = SPRITE.note;
        P.drag = 1;
        P.gravity = -0.3;
        P.wobble = 0.1;
        P.wobbleFreq = 4;
        P.rot = r.range(-0.4, 0.4);
        P.spin = r.range(-1, 1);
        P.size(r.range(0.18, 0.26) * sz);
        P.sizeIn = 0.2;
        P.life = r.range(1, 1.6);
        P.color(c.r * 2, c.g * 2, c.b * 2);
        emit();
      }
      break;
    }
    case 'poof': {
      glow(1.5, 0.15, 2, 2, 2.1, 0.8);
      for (let i = 0, N = n(14); i < N; i++) {
        P.reset();
        P.blend = 'alpha';
        dir(r, -0.15, 0.9);
        const s = r.range(2.2, 4.2) * sp;
        P.at(x + DIR.x * 0.1, y + 0.35 + DIR.y * 0.1, z + DIR.z * 0.1).vel(DIR.x * s * spr, DIR.y * s, DIR.z * s * spr);
        P.drag = 6;
        P.gravity = -0.4;
        P.sprite = i % 2 ? SPRITE.smoke : SPRITE.smoke2;
        P.hot = 0;
        const s0 = r.range(0.3, 0.48) * sz;
        P.size(s0, s0 * 1.9);
        P.sizeEase = EASE_OUT;
        P.sizeIn = 0.1;
        P.life = r.range(0.45, 0.8);
        P.alpha = 0.9;
        P.fadeOut = 0.55;
        P.rot = r.next() * 6.28;
        P.spin = r.range(-2, 2);
        P.color(c.r * 1.05, c.g * 1.05, c.b * 1.05).colorEnd(c.r * 0.75, c.g * 0.75, c.b * 0.8);
        emit();
      }
      for (let i = 0, N = n(5); i < N; i++) {
        P.reset();
        P.blend = 'alpha';
        dir(r, 0.2, 1);
        const s = r.range(2.5, 4) * sp;
        P.at(x, y + 0.35, z).vel(DIR.x * s * spr, DIR.y * s, DIR.z * s * spr);
        P.sprite = SPRITE.star;
        P.size(r.range(0.1, 0.14) * sz);
        P.gravity = 6;
        P.drag = 2.5;
        P.spin = r.range(-8, 8);
        P.life = r.range(0.5, 0.8);
        P.fadeOut = 0.4;
        P.color(1.3, 1.15, 0.55);
        emit();
      }
      for (let i = 0, N = n(4); i < N; i++) {
        P.reset();
        dir(r, 0, 1);
        const s = r.range(1.5, 3) * sp;
        P.at(x, y + 0.35, z).vel(DIR.x * s, DIR.y * s, DIR.z * s);
        P.sprite = SPRITE.sparkle;
        P.size(r.range(0.1, 0.16) * sz, 0.02);
        P.drag = 3;
        P.life = r.range(0.4, 0.7);
        P.color(2, 2, 2.2);
        emit();
      }
      break;
    }
  }
  return emitted;
}

function finite(v: number | undefined, def: number): number {
  return v !== undefined && Number.isFinite(v) ? v : def;
}

// ---------------------------------------------------------------------------------------------
// Ground shockwave rings: one instanced draw, analytic shader.
// ---------------------------------------------------------------------------------------------
const RING_VERT = /* glsl */ `
attribute vec4 aRing;
attribute vec4 aColor;
attribute vec4 aParam;
varying vec2 vLocal;
varying vec4 vColor;
varying vec4 vParam;
void main() {
  vLocal = position.xy * 1.25;
  vec3 wp = aRing.xyz + vec3(vLocal.x, 0.0, vLocal.y) * aRing.w;
  vColor = aColor;
  vParam = aParam;
  gl_Position = projectionMatrix * viewMatrix * vec4(wp, 1.0);
}
`;
const RING_FRAG = /* glsl */ `
varying vec2 vLocal;
varying vec4 vColor;
varying vec4 vParam;
void main() {
  float r = length(vLocal);
  float p = vParam.x;
  float cur = 1.0 - pow(1.0 - p, 3.0);
  float w = max(0.006, vParam.y * (1.0 - 0.6 * p));
  float ang = atan(vLocal.y, vLocal.x);
  float wav = 0.007 * sin(ang * 7.0 + vParam.z * 30.0 + p * 8.0) + 0.004 * sin(ang * 13.0 - p * 5.0);
  float dd = (r - cur - wav) / w;
  float ring = dd > 0.0 ? exp(-dd * dd * 3.0) : exp(-dd * dd * 0.7);
  float fill = smoothstep(cur, cur * 0.15, r) * 0.16 * (1.0 - p);
  float fade = pow(1.0 - p, 1.3);
  float a = (ring + fill) * fade * vColor.a;
  vec3 col = vColor.rgb * (0.55 + ring) + vec3(pow(ring, 6.0) * 1.4 * fade);
  gl_FragColor = vec4(col * a, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

const RING_CAP = 48;
const RS = 11; // x y z R r g b width age dur seed
class RingLayer {
  readonly mesh: THREE.Mesh;
  private readonly sim = new Float32Array(RING_CAP * RS);
  private readonly used = new Uint8Array(RING_CAP);
  private readonly aRing = new Float32Array(RING_CAP * 4);
  private readonly aColor = new Float32Array(RING_CAP * 4);
  private readonly aParam = new Float32Array(RING_CAP * 4);
  private cursor = 0;
  count = 0;

  constructor() {
    const g = new THREE.InstancedBufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0], 3));
    g.setIndex([0, 2, 1, 0, 3, 2]);
    for (const [name, arr] of [['aRing', this.aRing], ['aColor', this.aColor], ['aParam', this.aParam]] as const) {
      const a = new THREE.InstancedBufferAttribute(arr, 4);
      a.setUsage(THREE.DynamicDrawUsage);
      g.setAttribute(name, a);
    }
    g.instanceCount = 0;
    const m = new THREE.ShaderMaterial({
      name: 'FxRings',
      vertexShader: RING_VERT,
      fragmentShader: RING_FRAG,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });
    this.mesh = new THREE.Mesh(g, m);
    this.mesh.name = 'FxRings';
    this.mesh.frustumCulled = false;
    this.mesh.matrixAutoUpdate = false;
    this.mesh.renderOrder = 18;
    this.mesh.visible = false;
  }

  add(x: number, y: number, z: number, radius: number, c: RGB, intensity: number, seconds: number, width: number, seed: number): void {
    let slot = -1;
    for (let k = 0; k < RING_CAP; k++) {
      const s = (this.cursor + k) % RING_CAP;
      if (!this.used[s]) {
        slot = s;
        break;
      }
    }
    if (slot < 0) slot = this.cursor;
    this.cursor = (slot + 1) % RING_CAP;
    this.used[slot] = 1;
    const o = slot * RS;
    const d = this.sim;
    d[o] = x; d[o + 1] = y + 0.03; d[o + 2] = z; d[o + 3] = Math.max(0.05, radius);
    d[o + 4] = c.r * intensity; d[o + 5] = c.g * intensity; d[o + 6] = c.b * intensity;
    d[o + 7] = Math.min(0.5, Math.max(0.01, width / Math.max(0.05, radius)));
    d[o + 8] = 0; d[o + 9] = Math.max(0.05, seconds); d[o + 10] = seed;
  }

  update(dt: number): void {
    const d = this.sim;
    let n = 0;
    for (let s = 0; s < RING_CAP; s++) {
      if (!this.used[s]) continue;
      const o = s * RS;
      d[o + 8] += dt;
      const p = d[o + 8] / d[o + 9];
      if (p >= 1) {
        this.used[s] = 0;
        continue;
      }
      const k = n * 4;
      this.aRing[k] = d[o]; this.aRing[k + 1] = d[o + 1]; this.aRing[k + 2] = d[o + 2]; this.aRing[k + 3] = d[o + 3];
      this.aColor[k] = d[o + 4]; this.aColor[k + 1] = d[o + 5]; this.aColor[k + 2] = d[o + 6]; this.aColor[k + 3] = 1;
      this.aParam[k] = p; this.aParam[k + 1] = d[o + 7]; this.aParam[k + 2] = d[o + 10]; this.aParam[k + 3] = 0;
      n++;
    }
    this.count = n;
    uploadInstanced(this.mesh, n, RING_ATTRS);
  }

  clear(): void {
    this.used.fill(0);
    this.count = 0;
    this.mesh.visible = false;
  }
}
const RING_ATTRS = ['aRing', 'aColor', 'aParam'] as const;
const BEAM_ATTRS = ['aFrom', 'aTo', 'aColor'] as const;

function uploadInstanced(mesh: THREE.Mesh, n: number, names: readonly string[]): void {
  const g = mesh.geometry as THREE.InstancedBufferGeometry;
  g.instanceCount = n;
  mesh.visible = n > 0;
  if (n === 0) return;
  for (const name of names) {
    const a = g.getAttribute(name) as THREE.InstancedBufferAttribute;
    a.clearUpdateRanges();
    a.addUpdateRange(0, n * 4);
    a.needsUpdate = true;
  }
}

// ---------------------------------------------------------------------------------------------
// Beams: camera-facing energy strips, one instanced draw.
// ---------------------------------------------------------------------------------------------
const BEAM_VERT = /* glsl */ `
uniform float uTime;
attribute vec4 aFrom;
attribute vec4 aTo;
attribute vec4 aColor;
varying vec4 vInfo;
varying vec4 vColor;
void main() {
  float u = position.x;
  float v = position.y;
  vec3 A = aFrom.xyz;
  vec3 D = aTo.xyz - A;
  float L = length(D);
  vec3 dir = L > 1e-5 ? D / L : vec3(0.0, 1.0, 0.0);
  vec3 P = A + D * u;
  vec3 toCam = normalize(cameraPosition - P);
  vec3 side = cross(dir, toCam);
  float sl = length(side);
  side = sl > 1e-4 ? side / sl : vec3(1.0, 0.0, 0.0);
  float p = aTo.w;
  float env = smoothstep(0.0, 0.07, p) * (1.0 - smoothstep(0.55, 1.0, p));
  float cap = sqrt(max(0.0, 1.0 - pow(abs(2.0 * u - 1.0), 14.0)));
  float seed = aColor.w;
  float wob = sin(u * L * 3.0 - uTime * 22.0 + seed * 10.0) * 0.5 + sin(u * L * 7.3 + uTime * 17.0) * 0.25;
  float w = aFrom.w * (0.3 + 0.7 * env) * cap * (1.0 + 0.12 * wob);
  P += side * (v * w + wob * 0.05 * aFrom.w);
  vInfo = vec4(u, v, L, p);
  vColor = aColor;
  gl_Position = projectionMatrix * viewMatrix * vec4(P, 1.0);
}
`;
const BEAM_FRAG = /* glsl */ `
uniform float uTime;
varying vec4 vInfo;
varying vec4 vColor;
void main() {
  float u = vInfo.x;
  float v = vInfo.y;
  float L = vInfo.z;
  float p = vInfo.w;
  float env = smoothstep(0.0, 0.05, p) * (1.0 - smoothstep(0.6, 1.0, p));
  float core = exp(-v * v * 28.0);
  float glow = exp(-v * v * 3.5) * (1.0 - v * v);
  float flow = 0.75 + 0.25 * sin(u * L * 5.0 - uTime * 28.0 + vColor.w * 10.0);
  float streak = pow(0.5 + 0.5 * sin(u * L * 1.7 - uTime * 12.0 + v * 2.0), 6.0) * 0.6;
  float peak = max(max(vColor.r, vColor.g), vColor.b);
  vec3 col = vColor.rgb * glow * (flow + streak) + vec3(core * 2.2 * max(peak, 1.0));
  gl_FragColor = vec4(col * env, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;
const BEAM_CAP = 32;
const BS = 14; // fx fy fz w tx ty tz age dur r g b seed emitAcc
class BeamLayer {
  readonly mesh: THREE.Mesh;
  readonly material: THREE.ShaderMaterial;
  readonly sim = new Float32Array(BEAM_CAP * BS);
  readonly used = new Uint8Array(BEAM_CAP);
  private readonly aFrom = new Float32Array(BEAM_CAP * 4);
  private readonly aTo = new Float32Array(BEAM_CAP * 4);
  private readonly aColor = new Float32Array(BEAM_CAP * 4);
  private cursor = 0;
  count = 0;

  constructor() {
    const seg = 40;
    const pos: number[] = [];
    const idx: number[] = [];
    for (let i = 0; i <= seg; i++) {
      const u = i / seg;
      pos.push(u, -1, 0, u, 1, 0);
      if (i > 0) {
        const a = (i - 1) * 2;
        idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
    const g = new THREE.InstancedBufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    for (const [name, arr] of [['aFrom', this.aFrom], ['aTo', this.aTo], ['aColor', this.aColor]] as const) {
      const a = new THREE.InstancedBufferAttribute(arr, 4);
      a.setUsage(THREE.DynamicDrawUsage);
      g.setAttribute(name, a);
    }
    g.instanceCount = 0;
    this.material = new THREE.ShaderMaterial({
      name: 'FxBeams',
      vertexShader: BEAM_VERT,
      fragmentShader: BEAM_FRAG,
      uniforms: { uTime: { value: 0 } },
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    this.mesh = new THREE.Mesh(g, this.material);
    this.mesh.name = 'FxBeams';
    this.mesh.frustumCulled = false;
    this.mesh.matrixAutoUpdate = false;
    this.mesh.renderOrder = 26;
    this.mesh.visible = false;
  }

  add(a: THREE.Vector3, b: THREE.Vector3, c: RGB, seconds: number, width: number, seed: number): number {
    let slot = -1;
    for (let k = 0; k < BEAM_CAP; k++) {
      const s = (this.cursor + k) % BEAM_CAP;
      if (!this.used[s]) {
        slot = s;
        break;
      }
    }
    if (slot < 0) slot = this.cursor;
    this.cursor = (slot + 1) % BEAM_CAP;
    this.used[slot] = 1;
    const d = this.sim;
    const o = slot * BS;
    d[o] = a.x; d[o + 1] = a.y; d[o + 2] = a.z; d[o + 3] = width * 0.5;
    d[o + 4] = b.x; d[o + 5] = b.y; d[o + 6] = b.z;
    d[o + 7] = 0; d[o + 8] = Math.max(0.05, seconds);
    d[o + 9] = c.r; d[o + 10] = c.g; d[o + 11] = c.b; d[o + 12] = seed; d[o + 13] = 0;
    return slot;
  }

  update(dt: number, time: number): void {
    this.material.uniforms.uTime.value = time;
    const d = this.sim;
    let n = 0;
    for (let s = 0; s < BEAM_CAP; s++) {
      if (!this.used[s]) continue;
      const o = s * BS;
      d[o + 7] += dt;
      const p = d[o + 7] / d[o + 8];
      if (p >= 1) {
        this.used[s] = 0;
        continue;
      }
      const k = n * 4;
      this.aFrom[k] = d[o]; this.aFrom[k + 1] = d[o + 1]; this.aFrom[k + 2] = d[o + 2]; this.aFrom[k + 3] = d[o + 3];
      this.aTo[k] = d[o + 4]; this.aTo[k + 1] = d[o + 5]; this.aTo[k + 2] = d[o + 6]; this.aTo[k + 3] = p;
      this.aColor[k] = d[o + 9]; this.aColor[k + 1] = d[o + 10]; this.aColor[k + 2] = d[o + 11]; this.aColor[k + 3] = d[o + 12];
      n++;
    }
    this.count = n;
    uploadInstanced(this.mesh, n, BEAM_ATTRS);
  }

  clear(): void {
    this.used.fill(0);
    this.count = 0;
    this.mesh.visible = false;
  }
}

// ---------------------------------------------------------------------------------------------
// DOM layer: pop text + fullscreen flash.
// ---------------------------------------------------------------------------------------------
const FX_CSS = `
.fx-layer{position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:40;contain:strict}
.fx-pop{position:absolute;left:0;top:0;white-space:nowrap;will-change:transform,opacity;opacity:0;
font-family:"Nunito","Arial Rounded MT Bold","Segoe UI",system-ui,sans-serif;
font-weight:900;line-height:1;letter-spacing:.01em;color:var(--c);
text-shadow:0 .07em 0 var(--o),.06em 0 0 var(--o),-.06em 0 0 var(--o),0 -.06em 0 var(--o),.045em .045em 0 var(--o),
-.045em .045em 0 var(--o),.045em -.045em 0 var(--o),-.045em -.045em 0 var(--o),0 .16em .06em rgba(0,0,0,.5),0 0 .55em var(--g)}
.fx-flash{position:absolute;inset:0;opacity:0;mix-blend-mode:screen;will-change:opacity;display:none}
`;
function ensureCss(doc: Document): void {
  if (doc.getElementById('fx-css')) return;
  const s = doc.createElement('style');
  s.id = 'fx-css';
  s.textContent = FX_CSS;
  doc.head.appendChild(s);
}
const POP_CAP = 40;
interface Pop { el: HTMLDivElement; active: boolean; x: number; y: number; z: number; age: number; dur: number; tilt: number; dx: number }

const _p = new THREE.Vector3();
const _q = new THREE.Vector3();

export interface FxStats { liveParticles: number; capacity: number; trails: number; rings: number; beams: number; popTexts: number }

/** Minimum seconds between flash onsets (GDD 14.4: flashes capped at 3 Hz). */
export const FLASH_MIN_INTERVAL = 1 / 3;
/** Photosafe flashes: peak opacity and brightest allowed channel (no full-screen white). */
export const PHOTOSAFE_FLASH_PEAK = 0.3;
export const PHOTOSAFE_FLASH_MAX_CHANNEL = 0.55;

/**
 * Flash envelope bookkeeping, pure so the 3 Hz cap is unit-testable. `trigger` returns the peak to
 * use, or 0 when the call lands inside the cooldown (it then only extends the running flash).
 */
export class FlashGate {
  private lastOnset = -1e9;
  private endAt = -1e9;
  trigger(now: number, seconds: number, photosafe: boolean): number {
    const end = now + seconds;
    if (now - this.lastOnset < FLASH_MIN_INTERVAL) {
      if (end > this.endAt) this.endAt = end;
      return 0;
    }
    this.lastOnset = now;
    this.endAt = end;
    return photosafe ? PHOTOSAFE_FLASH_PEAK : 0.85;
  }
  /** Seconds until the running flash (including extensions) ends. */
  remaining(now: number): number {
    return Math.max(0, this.endAt - now);
  }
  reset(): void {
    this.lastOnset = -1e9;
    this.endAt = -1e9;
  }
}

export class FxSystem implements Fx {
  readonly particles: ParticleSystem;
  readonly trails: TrailRenderer;
  /** Default floor height for bouncing debris. */
  groundY = 0;
  /** Quality preset multiplier for burst particle counts (Low ~0.5, Medium 0.8, High 1). */
  density = 1;
  /** Photosensitivity setting: dim, never-white flashes (the 3 Hz cap always applies). */
  photosafe = false;
  camera: THREE.Camera;
  private readonly scene: THREE.Object3D;
  private readonly rings = new RingLayer();
  private readonly beams = new BeamLayer();
  private readonly layer: HTMLDivElement;
  private readonly flashEl: HTMLDivElement;
  private readonly pops: Pop[] = [];
  private readonly rnd = new FxRand(0x51f15e);
  private popCursor = 0;
  private flashAge = 0;
  private flashDur = 0;
  private flashPeak = 0;
  private readonly flashGate = new FlashGate();
  private time = 0;
  private w = 1;
  private h = 1;
  private readonly ro: ResizeObserver | null = null;

  constructor(scene: THREE.Scene, camera: THREE.Camera, overlayRoot: HTMLElement) {
    this.scene = scene;
    this.camera = camera;
    this.particles = new ParticleSystem(scene);
    this.trails = new TrailRenderer(scene, this.particles);
    scene.add(this.rings.mesh, this.beams.mesh);

    const doc = overlayRoot.ownerDocument;
    ensureCss(doc);
    this.layer = doc.createElement('div');
    this.layer.className = 'fx-layer';
    if (getComputedStyle(overlayRoot).position === 'static' && overlayRoot !== doc.body) overlayRoot.style.position = 'relative';
    overlayRoot.appendChild(this.layer);
    this.flashEl = doc.createElement('div');
    this.flashEl.className = 'fx-flash';
    this.layer.appendChild(this.flashEl);
    const measure = (): void => {
      const r = this.layer.getBoundingClientRect();
      this.w = r.width || window.innerWidth;
      this.h = r.height || window.innerHeight;
    };
    measure();
    if (typeof ResizeObserver !== 'undefined') {
      this.ro = new ResizeObserver(measure);
      this.ro.observe(this.layer);
    }
  }

  burst(kind: BurstKind, at: THREE.Vector3, opts: BurstOptions = {}): void {
    if (!BURST_DEFAULT_COUNT[kind]) return;
    emitBurst(this.particles, kind, at.x, at.y, at.z, opts, this.rnd, this.groundY, this.density);
    const spr = finite(opts.spread, 1);
    if (kind === 'soundwave') this.ring(at, { color: opts.color ?? BURST_DEFAULT_COLOR.soundwave, radius: 3.0 * spr, seconds: 0.8, width: 0.22 });
    else if (kind === 'splash') this.ring(at, { color: opts.color ?? BURST_DEFAULT_COLOR.splash, radius: 1.5 * spr, seconds: 0.6, width: 0.14 });
    else if (kind === 'heal') this.ring(at, { color: opts.color ?? BURST_DEFAULT_COLOR.heal, radius: 1.2 * spr, seconds: 0.7, width: 0.12 });
    else if (kind === 'ice') this.ring(at, { color: opts.color ?? BURST_DEFAULT_COLOR.ice, radius: 1.6 * spr, seconds: 0.7, width: 0.2 });
  }

  ring(at: THREE.Vector3, opts: { color?: string; radius?: number; seconds?: number; width?: number } = {}): void {
    const c = linearColor(opts.color, '#9fe8ff');
    const radius = finite(opts.radius, 2.5);
    this.rings.add(at.x, at.y, at.z, radius, c, 2.2, finite(opts.seconds, 0.7), finite(opts.width, radius * 0.08), this.rnd.next());
  }

  beam(from: THREE.Vector3, to: THREE.Vector3, opts: { color?: string; seconds?: number; width?: number } = {}): void {
    const c = linearColor(opts.color, '#7fd6ff');
    const width = finite(opts.width, 0.45);
    const seconds = finite(opts.seconds, 0.6);
    this.beams.add(from, to, { r: c.r * 2.2, g: c.g * 2.2, b: c.b * 2.2 }, seconds, width, this.rnd.next());
    const P = this.particles.params;
    // Muzzle + impact flares.
    for (let i = 0; i < 2; i++) {
      const v = i === 0 ? from : to;
      P.reset();
      P.at(v.x, v.y, v.z);
      P.sprite = SPRITE.glow;
      P.size(width * 2.2, width * 3.2);
      P.life = Math.min(0.5, seconds);
      P.color(c.r * 2.5, c.g * 2.5, c.b * 2.5);
      P.fadeOut = 0.7;
      this.particles.spawn(P);
      P.reset();
      P.at(v.x, v.y, v.z);
      P.sprite = SPRITE.flare;
      P.size(width * 4, width * 1.5);
      P.rot = this.rnd.range(-0.3, 0.3);
      P.life = Math.min(0.35, seconds);
      P.color(1.5 + c.r * 2, 1.5 + c.g * 2, 1.5 + c.b * 2);
      this.particles.spawn(P);
    }
    emitBurst(this.particles, 'spark', to.x, to.y, to.z, { count: 10, color: opts.color ?? '#bfefff', speed: 0.7 }, this.rnd, this.groundY, this.density);
  }

  popText(at: THREE.Vector3, text: string, opts: { color?: string; size?: number; seconds?: number } = {}): void {
    let pop: Pop | undefined;
    for (let k = 0; k < this.pops.length; k++) {
      const p = this.pops[(this.popCursor + k) % this.pops.length];
      if (!p.active) {
        pop = p;
        break;
      }
    }
    if (!pop) {
      if (this.pops.length < POP_CAP) {
        const el = this.layer.ownerDocument.createElement('div');
        el.className = 'fx-pop';
        this.layer.insertBefore(el, this.flashEl);
        pop = { el, active: false, x: 0, y: 0, z: 0, age: 0, dur: 1, tilt: 0, dx: 0 };
        this.pops.push(pop);
      } else {
        pop = this.pops[this.popCursor % this.pops.length];
      }
    }
    this.popCursor = (this.pops.indexOf(pop) + 1) % Math.max(1, this.pops.length);
    const color = opts.color ?? '#ffe27a';
    const sizeOpt = finite(opts.size, 30);
    const px = sizeOpt <= 6 ? 30 * sizeOpt : sizeOpt;
    const c = linearColor(color, '#ffe27a');
    _c.setRGB(c.r, c.g, c.b);
    const o = _c.clone().multiplyScalar(0.18);
    const el = pop.el;
    el.textContent = text;
    el.style.fontSize = `${px.toFixed(1)}px`;
    el.style.setProperty('--c', color);
    el.style.setProperty('--o', `#${o.getHexString()}`);
    el.style.setProperty('--g', `#${_c.getHexString()}aa`);
    el.style.display = 'block';
    el.style.opacity = '0';
    pop.active = true;
    pop.x = at.x; pop.y = at.y; pop.z = at.z;
    pop.age = 0;
    pop.dur = Math.max(0.3, finite(opts.seconds, 1.15));
    pop.tilt = this.rnd.range(-9, 9);
    pop.dx = this.rnd.range(-14, 14);
  }

  flash(color = '#ffffff', seconds = 0.22): void {
    const dur = Math.max(0.04, finite(seconds, 0.22));
    const peak = this.flashGate.trigger(this.time, dur, this.photosafe);
    if (peak === 0) {
      // Inside the 3 Hz cooldown: keep decaying from the current level, just more slowly, so a
      // spammed flash never brightens again.
      if (this.flashPeak > 0) {
        const t = Math.min(1, this.flashAge / this.flashDur);
        this.flashPeak *= (1 - t) * (1 - t);
        this.flashAge = 0;
        this.flashDur = Math.max(0.04, this.flashGate.remaining(this.time));
      }
      return;
    }
    const c = linearColor(color, '#ffffff');
    _c.setRGB(c.r, c.g, c.b);
    if (this.photosafe) {
      const m = Math.max(_c.r, _c.g, _c.b, 1e-4);
      if (m > PHOTOSAFE_FLASH_MAX_CHANNEL) _c.multiplyScalar(PHOTOSAFE_FLASH_MAX_CHANNEL / m);
    }
    const hex = `#${_c.getHexString()}`;
    this.flashEl.style.background = `radial-gradient(ellipse at 50% 50%, ${hex}cc 0%, ${hex} 70%, ${hex} 100%)`;
    this.flashEl.style.display = 'block';
    this.flashAge = 0;
    this.flashDur = dur;
    this.flashPeak = peak;
  }

  trail(obj: THREE.Object3D, opts: { color: string; width?: number; length?: number; style?: string }): TrailHandle {
    return this.trails.add(obj, opts);
  }

  update(dt: number): void {
    const cam = this.camera;
    this.time += dt;
    cam.updateMatrixWorld();
    this.updateBeamEmitters(dt);
    this.trails.update(dt, cam);
    this.particles.update(dt, cam);
    this.rings.update(dt);
    this.beams.update(dt, this.time);
    this.updatePops(dt, cam);
    if (this.flashPeak > 0) {
      this.flashAge += dt;
      const t = this.flashAge / this.flashDur;
      if (t >= 1) {
        this.flashPeak = 0;
        this.flashEl.style.display = 'none';
      } else {
        const k = 1 - t;
        this.flashEl.style.opacity = (this.flashPeak * k * k).toFixed(3);
      }
    }
  }

  private updateBeamEmitters(dt: number): void {
    const d = this.beams.sim;
    const P = this.particles.params;
    for (let s = 0; s < BEAM_CAP; s++) {
      if (!this.beams.used[s]) continue;
      const o = s * BS;
      const p = d[o + 7] / d[o + 8];
      if (p > 0.7) continue;
      d[o + 13] += dt * 45;
      while (d[o + 13] >= 1) {
        d[o + 13] -= 1;
        P.reset();
        const sp = this.rnd.range(1.5, 4);
        dir(this.rnd, -0.2, 1);
        P.at(d[o + 4], d[o + 5], d[o + 6]).vel(DIR.x * sp, DIR.y * sp, DIR.z * sp);
        P.sprite = SPRITE.streak;
        P.stretch = 0.04;
        P.size(0.06, 0.02);
        P.gravity = 8;
        P.drag = 2;
        P.life = this.rnd.range(0.2, 0.45);
        P.color(1.8 + d[o + 9], 1.8 + d[o + 10], 1.8 + d[o + 11]).colorEnd(d[o + 9], d[o + 10], d[o + 11]);
        this.particles.spawn(P);
        // Motes drifting along the beam.
        const f = this.rnd.next();
        P.reset();
        P.at(d[o] + (d[o + 4] - d[o]) * f, d[o + 1] + (d[o + 5] - d[o + 1]) * f, d[o + 2] + (d[o + 6] - d[o + 2]) * f);
        P.vel(this.rnd.range(-0.3, 0.3), this.rnd.range(0, 0.5), this.rnd.range(-0.3, 0.3));
        P.sprite = SPRITE.sparkle;
        P.size(d[o + 3] * 0.8, 0);
        P.rot = this.rnd.next() * 6.28;
        P.life = this.rnd.range(0.25, 0.5);
        P.color(d[o + 9] * 1.2 + 0.6, d[o + 10] * 1.2 + 0.6, d[o + 11] * 1.2 + 0.6);
        this.particles.spawn(P);
      }
    }
  }

  private updatePops(dt: number, cam: THREE.Camera): void {
    const e = cam.matrixWorld.elements;
    _q.set(e[12], e[13], e[14]);
    for (const p of this.pops) {
      if (!p.active) continue;
      p.age += dt;
      const t = p.age / p.dur;
      if (t >= 1) {
        p.active = false;
        p.el.style.display = 'none';
        continue;
      }
      const rise = 0.95 * (1 - Math.pow(1 - t, 2.2));
      _p.set(p.x, p.y + rise, p.z);
      const dist = _p.distanceTo(_q);
      _p.project(cam);
      if (_p.z > 1 || _p.z < -1) {
        p.el.style.opacity = '0';
        continue;
      }
      const sx = (_p.x * 0.5 + 0.5) * this.w + p.dx * Math.min(1, p.age * 3);
      const sy = (-_p.y * 0.5 + 0.5) * this.h;
      const intro = Math.min(1, p.age / 0.3);
      let s = 0.25 + 0.75 * popIn(intro);
      if (t > 0.8) s *= 1 - (t - 0.8) * 1.2;
      s *= Math.min(1.35, Math.max(0.6, 9 / Math.max(1, dist)));
      const wob = Math.sin(p.age * 28) * Math.exp(-p.age * 7) * 0.22;
      const rot = p.tilt * (1 - intro * 0.7);
      const alpha = t < 0.75 ? Math.min(1, p.age * 12) : 1 - (t - 0.75) / 0.25;
      p.el.style.transform = `translate3d(${sx.toFixed(1)}px,${sy.toFixed(1)}px,0) translate(-50%,-50%) rotate(${rot.toFixed(2)}deg) scale(${(s * (1 + wob)).toFixed(3)},${(s * (1 - wob)).toFixed(3)})`;
      p.el.style.opacity = alpha.toFixed(3);
    }
  }

  stats(): FxStats {
    let pops = 0;
    for (const p of this.pops) if (p.active) pops++;
    return {
      liveParticles: this.particles.liveCount,
      capacity: this.particles.capacity,
      trails: this.trails.activeCount,
      rings: this.rings.count,
      beams: this.beams.count,
      popTexts: pops,
    };
  }

  clear(): void {
    this.particles.clear();
    this.trails.clear();
    this.rings.clear();
    this.beams.clear();
    for (const p of this.pops) {
      p.active = false;
      p.el.style.display = 'none';
    }
    this.flashPeak = 0;
    this.flashGate.reset();
    this.flashEl.style.display = 'none';
  }

  dispose(): void {
    this.clear();
    this.particles.dispose();
    this.trails.dispose();
    this.scene.remove(this.rings.mesh, this.beams.mesh);
    for (const m of [this.rings.mesh, this.beams.mesh]) {
      m.geometry.dispose();
      (m.material as THREE.Material).dispose();
    }
    this.ro?.disconnect();
    this.layer.remove();
  }
}
