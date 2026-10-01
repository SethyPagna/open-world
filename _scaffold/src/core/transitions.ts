/**
 * Scene transitions: DOM overlays above the canvas and below the UI.
 * `out()` covers the screen, `in()` reveals it. Each kind is a tiny effect object driven by one
 * rAF loop with a clamped dt, so a long frame (shader compile, GC) slows the animation instead
 * of skipping it. Honors prefers-reduced-motion (every kind becomes a short cross-fade).
 */
import type { TransitionKind } from './api.ts';
import { ease } from './tween.ts';
import { clamp01, hash01, smoothstep } from './math.ts';

export interface TransitionOptions {
  /** Accent colour: iris rim, door seam, glitch fringe. Defaults to the System cyan. */
  color?: string;
  /** Iris focus in 0..1 screen coordinates (e.g. the player's projected position). */
  focus?: { x: number; y: number };
}
export type TransitionPhase = 'out' | 'in';

const INK = '#05060a';
const CYAN = '#7fe9ff';

interface Fx {
  readonly out: number;
  readonly in: number;
  mount(root: HTMLElement, opts: TransitionOptions): void;
  /** p = 0..1 normalized time of the phase. out: 0 -> covered at 1. in: covered at 0 -> clear at 1. */
  render(phase: TransitionPhase, p: number): void;
  unmount(): void;
}

function el(tag: string, css: string, parent?: HTMLElement): HTMLDivElement {
  const e = document.createElement(tag) as HTMLDivElement;
  e.style.cssText = css;
  parent?.appendChild(e);
  return e;
}

/** rgba() from a hex colour. */
function rgba(hex: string, a: number): string {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const n = parseInt(h.slice(0, 6), 16);
  if (Number.isNaN(n)) return `rgba(127,233,255,${a})`;
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

// ---------------------------------------------------------------------------------------------
class FadeFx implements Fx {
  readonly out: number;
  readonly in: number;
  private root: HTMLDivElement | null = null;
  private readonly color: string;
  constructor(outS = 0.45, inS = 0.55, color = INK) {
    this.out = outS;
    this.in = inS;
    this.color = color;
  }
  mount(root: HTMLElement): void {
    const bg = this.color === INK ? `radial-gradient(ellipse at 50% 45%, #0b0e17 0%, ${INK} 70%)` : this.color;
    this.root = el('div', `position:absolute;inset:0;background:${bg};opacity:0;will-change:opacity`, root);
  }
  render(phase: TransitionPhase, p: number): void {
    if (!this.root) return;
    const o = phase === 'out' ? ease('inOutQuad', p) : 1 - ease('inOutSine', p);
    this.root.style.opacity = o.toFixed(4);
  }
  unmount(): void {
    this.root?.remove();
    this.root = null;
  }
}

// ---------------------------------------------------------------------------------------------
/** Circle wipe: a clip-path hole closes on the focus point, beats, snaps shut; reopens with a pop. */
class IrisFx implements Fx {
  readonly out = 0.78;
  readonly in = 0.62;
  private root: HTMLDivElement | null = null;
  private ring: HTMLDivElement | null = null;
  private fx = 0.5;
  private fy = 0.5;
  private color = CYAN;
  mount(root: HTMLElement, opts: TransitionOptions): void {
    this.fx = clamp01(opts.focus?.x ?? 0.5);
    this.fy = clamp01(opts.focus?.y ?? 0.5);
    this.color = opts.color ?? CYAN;
    this.root = el('div', `position:absolute;inset:0;background:${INK};will-change:clip-path`, root);
    this.ring = el('div', `position:absolute;border-radius:50%;pointer-events:none;transform:translate(-50%,-50%);` +
      `border:2px solid ${rgba(this.color, 0.95)};box-shadow:0 0 14px 3px ${rgba(this.color, 0.55)},inset 0 0 22px 2px ${rgba(this.color, 0.35)}`, root);
  }
  render(phase: TransitionPhase, p: number): void {
    if (!this.root || !this.ring) return;
    const w = this.root.clientWidth || window.innerWidth;
    const h = this.root.clientHeight || window.innerHeight;
    const cx = this.fx * w, cy = this.fy * h;
    const far = Math.max(Math.hypot(cx, cy), Math.hypot(w - cx, cy), Math.hypot(cx, h - cy), Math.hypot(w - cx, h - cy)) + 8;
    const small = 0.13 * Math.min(w, h);
    let r: number;
    if (phase === 'out') {
      if (p < 0.62) r = far + (small - far) * ease('outCubic', p / 0.62);
      else if (p < 0.8) r = small * (1 + 0.04 * Math.sin(((p - 0.62) / 0.18) * Math.PI));
      else r = small * (1 - ease('inBack', (p - 0.8) / 0.2));
    } else {
      if (p < 0.28) r = small * ease('outBack', p / 0.28);
      else r = small + (far - small) * ease('inOutCubic', (p - 0.28) / 0.72);
    }
    r = Math.max(0, r);
    // Even-odd path: full rect minus a circle => ink everywhere except the hole.
    const d = `M0 0H${w}V${h}H0Z M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
    this.root.style.clipPath = r > 0.5 ? `path(evenodd,'${d}')` : 'none';
    const ring = this.ring;
    ring.style.left = `${cx}px`;
    ring.style.top = `${cy}px`;
    ring.style.width = ring.style.height = `${2 * r + 2}px`;
    ring.style.opacity = r < 2 || r > far - 4 ? '0' : '1';
  }
  unmount(): void {
    this.root?.remove();
    this.ring?.remove();
    this.root = this.ring = null;
  }
}

// ---------------------------------------------------------------------------------------------
let stoneUrl: string | null = null;
/** Procedural dark stone blocks (drawn once, cached as a data URL). */
function stoneTexture(): string {
  if (stoneUrl) return stoneUrl;
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const g = c.getContext('2d');
  if (!g) return (stoneUrl = '');
  g.fillStyle = '#0c0f16';
  g.fillRect(0, 0, 256, 256);
  const rowH = 64;
  for (let row = 0; row < 4; row++) {
    const off = row % 2 ? 64 : 0;
    for (let col = -1; col < 3; col++) {
      const x = col * 128 + off, y = row * rowH;
      const s = hash01(row * 7 + col * 13 + 5, 99);
      const l = 8 + s * 6;
      g.fillStyle = `hsl(222, 22%, ${l}%)`;
      g.fillRect(x + 2, y + 2, 124, rowH - 4);
      // top-left bevel light, bottom-right shade
      g.fillStyle = 'rgba(160,200,255,0.06)';
      g.fillRect(x + 2, y + 2, 124, 2);
      g.fillStyle = 'rgba(0,0,0,0.35)';
      g.fillRect(x + 2, y + rowH - 5, 124, 3);
    }
  }
  // grain
  const img = g.getImageData(0, 0, 256, 256);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (hash01(i >> 2, 7) - 0.5) * 14;
    img.data[i] += n;
    img.data[i + 1] += n;
    img.data[i + 2] += n * 1.1;
  }
  g.putImageData(img, 0, 0);
  try {
    stoneUrl = c.toDataURL('image/png');
  } catch {
    stoneUrl = '';
  }
  return stoneUrl;
}

/** Two stone door leaves slam shut; a seam of light flares; then they part. */
class DoorFx implements Fx {
  readonly out = 0.72;
  readonly in = 0.9;
  private root: HTMLDivElement | null = null;
  private left: HTMLDivElement | null = null;
  private right: HTMLDivElement | null = null;
  private seam: HTMLDivElement | null = null;
  private flare: HTMLDivElement | null = null;
  private runes: HTMLDivElement[] = [];
  private color = CYAN;

  mount(root: HTMLElement, opts: TransitionOptions): void {
    this.color = opts.color ?? CYAN;
    const col = this.color;
    this.root = el('div', 'position:absolute;inset:0;overflow:hidden', root);
    const tex = stoneTexture();
    const leaf = (side: 'left' | 'right'): HTMLDivElement => {
      const edge = side === 'left' ? 'right' : 'left';
      const shade = side === 'left' ? '90deg' : '270deg';
      const d = el('div', `position:absolute;top:0;bottom:0;${side}:0;width:calc(50% + 1px);will-change:transform;` +
        `background:linear-gradient(${shade}, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 80%, rgba(0,0,0,0.35) 100%),` +
        `linear-gradient(180deg, rgba(40,52,78,0.35) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.5) 100%)${tex ? `,url(${tex})` : ''} ,#0c0f16;` +
        `background-size:auto,auto,256px 256px;box-shadow:0 0 80px 20px rgba(0,0,0,0.85)`, this.root!);
      // carved frame
      el('div', `position:absolute;inset:26px;${edge}:18px;border:1px solid rgba(150,200,255,0.07);` +
        `box-shadow:inset 0 0 0 5px rgba(0,0,0,0.25),inset 0 0 0 6px rgba(150,200,255,0.05)`, d);
      // inner edge lip that catches the seam light
      el('div', `position:absolute;top:0;bottom:0;${edge}:0;width:3px;background:linear-gradient(180deg,transparent,${rgba(col, 0.25)},transparent)`, d);
      // half of the central sigil (the leaf clips it)
      const ringWrap = el('div', `position:absolute;top:50%;${edge}:0;width:0;height:0;overflow:visible`, d);
      const R = 'min(17vh, 17vw)';
      const rune = el('div', `position:absolute;left:0;top:0;width:calc(${R} * 2);height:calc(${R} * 2);transform:translate(-50%,-50%);` +
        `border-radius:50%;border:2px solid ${rgba(col, 0.28)};box-shadow:0 0 0 10px rgba(0,0,0,0.25),0 0 0 11px ${rgba(col, 0.12)};opacity:0.7`, ringWrap);
      el('div', `position:absolute;inset:18%;border-radius:50%;border:1px dashed ${rgba(col, 0.3)}`, rune);
      el('div', `position:absolute;inset:36%;border-radius:50%;border:2px solid ${rgba(col, 0.22)}`, rune);
      this.runes.push(rune);
      d.style.overflow = 'hidden';
      return d;
    };
    this.left = leaf('left');
    this.right = leaf('right');
    this.seam = el('div', `position:absolute;top:0;bottom:0;left:50%;width:3px;margin-left:-1.5px;opacity:0;transform:scaleY(0);will-change:transform,opacity;` +
      `background:linear-gradient(180deg, transparent 0%, ${rgba(col, 0.9)} 18%, #ffffff 50%, ${rgba(col, 0.9)} 82%, transparent 100%);` +
      `box-shadow:0 0 10px 2px ${rgba(col, 0.9)},0 0 40px 10px ${rgba(col, 0.45)}`, this.root);
    this.flare = el('div', `position:absolute;left:50%;top:50%;width:70vmin;height:140vh;transform:translate(-50%,-50%);opacity:0;pointer-events:none;` +
      `background:radial-gradient(ellipse at center, ${rgba(col, 0.55)} 0%, ${rgba(col, 0.12)} 30%, transparent 62%);mix-blend-mode:screen`, this.root);
  }

  render(phase: TransitionPhase, p: number): void {
    if (!this.root || !this.left || !this.right || !this.seam || !this.flare) return;
    let open: number; // 1 = fully open, 0 = shut
    let seam: number; // 0..1 seam intensity
    let jolt = 0;
    if (phase === 'out') {
      const impact = 0.78;
      if (p < impact) {
        open = 1 - ease('inCubic', p / impact);
        seam = 0;
      } else {
        const k = (p - impact) / (1 - impact);
        open = 0.018 * Math.sin(k * Math.PI) * (1 - k); // recoil
        seam = Math.exp(-k * 3.2);
        jolt = (1 - k) * (1 - k);
      }
    } else {
      const unlatch = 0.3;
      if (p < unlatch) {
        open = 0;
        const k = p / unlatch;
        seam = 0.25 + 0.75 * ease('inQuad', k) * (0.85 + 0.15 * Math.sin(k * 40));
      } else {
        const k = (p - unlatch) / (1 - unlatch);
        open = ease('inOutCubic', k);
        seam = 1 - smoothstep(0, 0.35, k);
      }
    }
    const jx = jolt * (hash01(Math.floor(p * 90), 3) - 0.5) * 10;
    const jy = jolt * (hash01(Math.floor(p * 90), 5) - 0.5) * 8;
    this.left.style.transform = `translate3d(calc(${(-open * 100).toFixed(3)}% + ${jx.toFixed(2)}px), ${jy.toFixed(2)}px, 0)`;
    this.right.style.transform = `translate3d(calc(${(open * 100).toFixed(3)}% + ${jx.toFixed(2)}px), ${jy.toFixed(2)}px, 0)`;
    const seamVisible = open < 0.08 ? seam : seam * (1 - smoothstep(0.02, 0.12, open));
    this.seam.style.opacity = seamVisible.toFixed(3);
    this.seam.style.transform = `translateX(${jx.toFixed(2)}px) scaleY(${Math.min(1, 0.25 + seam * 1.2).toFixed(3)})`;
    this.flare.style.opacity = (seamVisible * 0.9).toFixed(3);
    for (const r of this.runes) {
      r.style.opacity = (0.55 + 0.45 * seamVisible).toFixed(3);
      r.style.filter = seamVisible > 0.02 ? `drop-shadow(0 0 ${(12 * seamVisible).toFixed(1)}px ${rgba(this.color, 0.9)}) brightness(${(1 + seamVisible * 1.6).toFixed(2)})` : 'none';
    }
  }

  unmount(): void {
    this.root?.remove();
    this.root = this.left = this.right = this.seam = this.flare = null;
    this.runes = [];
  }
}

// ---------------------------------------------------------------------------------------------
/** Scale reveal: a white bloom swells from the centre and swallows the screen, then slowly clears. */
class WhiteoutFx implements Fx {
  readonly out = 0.95;
  readonly in = 1.35;
  private root: HTMLDivElement | null = null;
  private bloom: HTMLDivElement | null = null;
  private halo: HTMLDivElement | null = null;
  private white: HTMLDivElement | null = null;
  mount(root: HTMLElement): void {
    this.root = el('div', 'position:absolute;inset:0;overflow:hidden', root);
    this.halo = el('div', 'position:absolute;inset:-10%;opacity:0;will-change:opacity;' +
      'background:radial-gradient(ellipse at 50% 50%, rgba(255,250,236,0.55) 0%, rgba(214,236,255,0.28) 38%, rgba(214,236,255,0) 70%)', this.root);
    this.bloom = el('div', 'position:absolute;left:50%;top:50%;width:24vmax;height:24vmax;border-radius:50%;opacity:0;will-change:transform,opacity;' +
      'transform:translate(-50%,-50%) scale(0.1);background:radial-gradient(circle, #ffffff 0%, #fffdf6 22%, rgba(255,246,226,0.9) 40%, rgba(220,238,255,0.45) 58%, rgba(220,238,255,0) 72%)', this.root);
    this.white = el('div', 'position:absolute;inset:0;background:#fbf9f4;opacity:0;will-change:opacity', this.root);
  }
  render(phase: TransitionPhase, p: number): void {
    if (!this.bloom || !this.white || !this.halo) return;
    if (phase === 'out') {
      const s = 0.1 + 9 * ease('inExpo', p);
      this.bloom.style.transform = `translate(-50%,-50%) scale(${s.toFixed(3)})`;
      this.bloom.style.opacity = smoothstep(0, 0.25, p).toFixed(3);
      this.halo.style.opacity = smoothstep(0, 0.6, p).toFixed(3);
      this.white.style.opacity = smoothstep(0.55, 1, p).toFixed(3);
    } else {
      const k = p < 0.14 ? 0 : ease('outCubic', (p - 0.14) / 0.86);
      this.white.style.opacity = (1 - smoothstep(0, 0.75, k)).toFixed(3);
      this.halo.style.opacity = (1 - k).toFixed(3);
      this.bloom.style.opacity = (1 - smoothstep(0, 0.9, k)).toFixed(3);
      this.bloom.style.transform = `translate(-50%,-50%) scale(${(9.1 + 4 * k).toFixed(3)})`;
    }
  }
  unmount(): void {
    this.root?.remove();
    this.root = this.bloom = this.white = this.halo = null;
  }
}

// ---------------------------------------------------------------------------------------------
const SLICES = 18;
/** Signal corruption: RGB-split horizontal slices jitter in and cover the screen. */
class GlitchFx implements Fx {
  readonly out = 0.5;
  readonly in = 0.46;
  private root: HTMLDivElement | null = null;
  private base: HTMLDivElement | null = null;
  private slices: HTMLDivElement[] = [];
  private scans: HTMLDivElement[] = [];
  private color = CYAN;
  private clock = 0;
  private lastP = 0;
  mount(root: HTMLElement, opts: TransitionOptions): void {
    this.color = opts.color ?? CYAN;
    this.root = el('div', 'position:absolute;inset:0;overflow:hidden', root);
    this.base = el('div', `position:absolute;inset:0;background:${INK};opacity:0`, this.root);
    for (let i = 0; i < SLICES; i++) {
      this.slices.push(el('div', `position:absolute;left:0;width:100%;background:${INK};display:none;will-change:transform;` +
        `box-shadow:-9px 0 0 rgba(255,46,112,0.78), 9px 0 0 ${rgba(this.color, 0.78)}, 0 1px 0 rgba(255,255,255,0.08)`, this.root));
    }
    for (let i = 0; i < 3; i++) {
      this.scans.push(el('div', `position:absolute;left:0;width:100%;height:2px;display:none;background:${rgba(this.color, 0.9)};box-shadow:0 0 8px ${rgba(this.color, 0.8)}`, this.root));
    }
    this.clock = 0;
  }
  render(phase: TransitionPhase, p: number): void {
    if (!this.root || !this.base) return;
    const dur = phase === 'out' ? this.out : this.in;
    this.clock += Math.max(0, p - this.lastP) * dur;
    this.lastP = p;
    const cover = phase === 'out' ? ease('inQuad', p) : 1 - ease('outQuad', p);
    const step = Math.floor(this.clock * 28) + (phase === 'in' ? 1000 : 0); // stepped jitter at ~28 Hz
    for (let i = 0; i < SLICES; i++) {
      const s = this.slices[i];
      const thr = hash01(i, 11) * 0.85;
      if (cover <= thr && cover < 0.999) {
        s.style.display = 'none';
        continue;
      }
      const y = (i / SLICES) * 100 + (hash01(step * 31 + i, 1) - 0.5) * 6 * (1 - cover);
      const hgt = (100 / SLICES) * (0.35 + 0.65 * cover + hash01(step * 17 + i, 2) * 0.5);
      const jx = (hash01(step * 13 + i, 3) - 0.5) * 30 * (1 - cover * 0.9);
      const sx = 0.55 + 0.45 * cover + hash01(step * 7 + i, 4) * 0.2;
      s.style.display = 'block';
      s.style.top = `${y.toFixed(2)}%`;
      s.style.height = `${hgt.toFixed(2)}%`;
      s.style.transform = `translateX(${jx.toFixed(2)}%) scaleX(${sx.toFixed(3)})`;
    }
    for (let i = 0; i < this.scans.length; i++) {
      const on = hash01(step * 5 + i, 9) < 0.55 && cover > 0.05 && cover < 0.98;
      const sc = this.scans[i];
      sc.style.display = on ? 'block' : 'none';
      if (on) sc.style.top = `${(hash01(step * 3 + i, 8) * 100).toFixed(2)}%`;
    }
    const b = cover < 0.7 ? 0 : Math.floor(((cover - 0.7) / 0.3) * 4) / 4;
    this.base.style.opacity = (cover >= 0.999 ? 1 : b).toFixed(3);
  }
  unmount(): void {
    this.root?.remove();
    this.root = this.base = null;
    this.slices = [];
    this.scans = [];
    this.lastP = 0;
  }
}

class NoneFx implements Fx {
  readonly out = 0;
  readonly in = 0;
  mount(): void {}
  render(): void {}
  unmount(): void {}
}

// ---------------------------------------------------------------------------------------------
export class Transitions {
  readonly layer: HTMLDivElement;
  /** Playback speed multiplier (debug). */
  speed = 1;
  /** Debug: freeze the running phase at this progress (0..1) until set back to null. */
  holdAt: number | null = null;
  /** Called when a phase starts (the scene manager uses it for post pulses). */
  onPhaseStart: ((kind: TransitionKind, phase: TransitionPhase) => void) | null = null;

  private fx: Fx | null = null;
  private fxKind: TransitionKind | null = null;
  private _phase: TransitionPhase | null = null;
  private _progress = 0;
  private _covered = false;
  private readonly mq: MediaQueryList | null;

  constructor(host: HTMLElement, before: HTMLElement | null = null) {
    this.layer = el('div', 'position:absolute;inset:0;pointer-events:none;overflow:hidden;contain:strict');
    this.layer.dataset.layer = 'transitions';
    if (before && before.parentElement === host) {
      host.insertBefore(this.layer, before);
      // Same stacking level as the UI root and earlier in DOM order => always painted below it.
      const z = getComputedStyle(before).zIndex;
      this.layer.style.zIndex = z && z !== 'auto' ? z : 'auto';
    } else {
      this.layer.style.zIndex = '50';
      host.appendChild(this.layer);
    }
    this.mq = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;
  }

  get reducedMotion(): boolean {
    return this.mq?.matches ?? false;
  }
  get kind(): TransitionKind | null {
    return this.fxKind;
  }
  get phase(): TransitionPhase | null {
    return this._phase;
  }
  get progress(): number {
    return this._progress;
  }
  /** True while the screen is fully covered (between out and in). */
  get covered(): boolean {
    return this._covered;
  }
  get active(): boolean {
    return this._phase !== null;
  }

  /** Cover the screen instantly (boot, before the first scene). */
  coverNow(kind: TransitionKind, opts: TransitionOptions = {}): void {
    this.mount(kind, opts);
    this.fx!.render('out', 1);
    this._covered = kind !== 'none';
    this.layer.style.pointerEvents = this._covered ? 'auto' : 'none';
  }

  /** Animate the cover. Resolves when the screen is fully covered. */
  async out(kind: TransitionKind, opts: TransitionOptions = {}): Promise<void> {
    this.mount(kind, opts);
    this.layer.style.pointerEvents = 'auto';
    await this.run('out');
    this._covered = kind !== 'none';
  }

  /** Animate the reveal of whatever is covering the screen. */
  async in(kind?: TransitionKind, opts: TransitionOptions = {}): Promise<void> {
    if (!this.fx || (kind && kind !== this.fxKind)) this.coverNow(kind ?? 'fade', opts);
    this._covered = false;
    await this.run('in');
    this.unmount();
    this.layer.style.pointerEvents = 'none';
  }

  /** Render a kind statically at a given progress (screenshots / tuning). Call `clear()` after. */
  preview(kind: TransitionKind, phase: TransitionPhase, p: number, opts: TransitionOptions = {}): void {
    if (this.fxKind !== kind || !this.fx) this.mount(kind, opts);
    this.fx!.render(phase, clamp01(p));
    this._phase = phase;
    this._progress = p;
  }

  clear(): void {
    this.unmount();
    this._phase = null;
    this._progress = 0;
    this._covered = false;
    this.layer.style.pointerEvents = 'none';
  }

  private mount(kind: TransitionKind, opts: TransitionOptions): void {
    if (this.fx && this.fxKind === kind) return;
    this.unmount();
    this.fx = this.create(kind);
    this.fxKind = kind;
    this.fx.mount(this.layer, opts);
  }

  private unmount(): void {
    this.fx?.unmount();
    this.fx = null;
    this.fxKind = null;
  }

  private create(kind: TransitionKind): Fx {
    if (kind === 'none') return new NoneFx();
    if (this.reducedMotion) return kind === 'whiteout' ? new FadeFx(0.35, 0.45, '#f6f3ec') : new FadeFx(0.28, 0.32);
    switch (kind) {
      case 'iris': return new IrisFx();
      case 'door': return new DoorFx();
      case 'whiteout': return new WhiteoutFx();
      case 'glitch': return new GlitchFx();
      default: return new FadeFx();
    }
  }

  private run(phase: TransitionPhase): Promise<void> {
    const fx = this.fx!;
    const seconds = (phase === 'out' ? fx.out : fx.in) / Math.max(0.01, this.speed);
    this._phase = phase;
    this._progress = 0;
    if (this.fxKind) this.onPhaseStart?.(this.fxKind, phase);
    if (seconds <= 0) {
      fx.render(phase, 1);
      this._phase = null;
      this._progress = 1;
      return Promise.resolve();
    }
    fx.render(phase, 0);
    return new Promise<void>((resolve) => {
      let t = 0;
      let last = performance.now();
      const step = (): void => {
        if (this.fx !== fx) return resolve(); // superseded
        const now = performance.now();
        const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
        last = now;
        t = document.hidden ? seconds : t + dt;
        let p = Math.min(1, t / seconds);
        if (this.holdAt !== null && p > this.holdAt) {
          p = this.holdAt;
          t = p * seconds;
        }
        this._progress = p;
        fx.render(phase, p);
        if (p >= 1) {
          this._phase = null;
          resolve();
        } else if (document.hidden) setTimeout(step, 16);
        else requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }
}
