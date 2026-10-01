// World-anchored speech bubbles. Deliberately rounded and warm so they can never be mistaken for
// a System window (GDD: "nothing in the game can forge one"). Positions are projected every frame;
// off-screen speakers clamp to the screen edge with an arrow, and far speakers fade.
import * as THREE from 'three';
import { h, clamp, lerp, uiSound } from './h.ts';

export interface BubbleOpts {
  seconds?: number;
  color?: string;
  who?: string;
  /** Follow this object instead of the given Vector3 (world position + offsetY). */
  object?: THREE.Object3D;
  /** Extra world-space lift above the anchor, metres. */
  offsetY?: number;
}

export interface ScreenPlacement { x: number; y: number; clamped: boolean; angle: number }

/**
 * NDC -> pixels, clamped to the rect inset by `margin`. Points behind the camera project mirrored,
 * so their direction is flipped and they always clamp. `angle` points from screen centre toward
 * the true position (radians, screen space, +y down).
 */
export function placeOnScreen(ndcX: number, ndcY: number, behind: boolean, w: number, hgt: number, margin: number): ScreenPlacement {
  const cx = w / 2;
  const cy = hgt / 2;
  let dx = ndcX * cx;
  let dy = -ndcY * cy;
  if (behind) {
    dx = -dx;
    dy = -dy;
    if (Math.abs(dx) < 1e-6 && Math.abs(dy) < 1e-6) dy = 1;
  }
  const hw = Math.max(1, cx - margin);
  const hh = Math.max(1, cy - margin);
  const angle = Math.atan2(dy, dx);
  if (!behind && Math.abs(dx) <= hw && Math.abs(dy) <= hh) return { x: cx + dx, y: cy + dy, clamped: false, angle };
  const s = Math.min(hw / Math.max(Math.abs(dx), 1e-9), hh / Math.max(Math.abs(dy), 1e-9));
  return { x: cx + dx * s, y: cy + dy * s, clamped: true, angle };
}

/** 1 up to `near`, easing down to `minOpacity` at `far`. */
export function distanceFade(d: number, near = 11, far = 42, minOpacity = 0.32): number {
  if (d <= near) return 1;
  if (d >= far) return minOpacity;
  const t = (d - near) / (far - near);
  return lerp(1, minOpacity, t * t * (3 - 2 * t));
}

/** Push overlapping rects apart vertically (upper one moves up). Mutates `ys`. */
export function separate(xs: number[], ys: number[], ws: number[], hs: number[], gap = 6): void {
  const n = xs.length;
  const order = [...Array(n).keys()].sort((a, b) => ys[b] - ys[a]);
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const a = order[i];
        const b = order[j];
        const overlapX = Math.min(xs[a] + ws[a], xs[b] + ws[b]) - Math.max(xs[a], xs[b]);
        if (overlapX <= 0) continue;
        const top = ys[a] < ys[b] ? a : b;
        const bot = top === a ? b : a;
        const overlapY = ys[top] + hs[top] + gap - ys[bot];
        if (overlapY > 0) ys[top] -= overlapY;
      }
    }
  }
}

interface BubbleView {
  el: HTMLElement;
  inner: HTMLElement;
  typed: HTMLElement;
  rest: HTMLElement;
  text: string;
  pos: THREE.Vector3;
  object: THREE.Object3D | null;
  offsetY: number;
  who: string | null;
  life: number;
  typeT: number;
  shown: number;
  leaving: number;
  w: number;
  hgt: number;
  // per-frame scratch
  sx: number; sy: number; op: number; sc: number; clamped: boolean; angle: number; visible: boolean;
  lastClamped: boolean | null;
}

const MARGIN = 18;
const LIFT = 12;
const TAIL = 9;

export class Bubbles {
  readonly el: HTMLElement;
  private readonly items: BubbleView[] = [];
  private readonly v = new THREE.Vector3();
  private readonly camPos = new THREE.Vector3();
  private readonly inv = new THREE.Matrix4();
  cps = 42;

  constructor() {
    this.el = h('div.tf-bubbles', { 'aria-live': 'polite' });
  }

  add(pos: THREE.Vector3, text: string, opts: BubbleOpts = {}): void {
    const who = opts.who ?? null;
    if (who) for (const b of this.items) if (b.who === who && b.leaving < 0) this.dismiss(b);
    const typed = h('span.bb-typed');
    const rest = h('span.bb-rest', null, text);
    const inner = h('div.bb-inner', null,
      who ? h('span.bb-who', null, who) : null,
      h('div.bb-text', null, typed, rest),
      h('i.bb-tail', { 'aria-hidden': 'true' }),
      h('i.bb-arrow', { 'aria-hidden': 'true' }));
    const el = h('div.bb', { style: { '--bb': opts.color ?? '#ffd27a' }, role: 'note', 'aria-label': who ? `${who}: ${text}` : text }, inner);
    this.el.appendChild(el);
    const seconds = opts.seconds ?? clamp(1.8 + text.length * 0.055, 2.6, 7.5);
    this.items.push({
      el, inner, typed, rest, text, pos, object: opts.object ?? null, offsetY: opts.offsetY ?? 0, who,
      life: seconds, typeT: 0, shown: 0, leaving: -1, w: el.offsetWidth, hgt: el.offsetHeight,
      sx: 0, sy: 0, op: 1, sc: 1, clamped: false, angle: 0, visible: false, lastClamped: null,
    });
    uiSound('chat_pop', 90);
  }

  private dismiss(b: BubbleView): void {
    if (b.leaving >= 0) return;
    b.leaving = 0;
    b.el.classList.add('is-leaving');
  }

  clear(): void {
    for (const b of this.items) this.dismiss(b);
  }

  update(dt: number, camera: THREE.Camera | null, w: number, hgt: number): void {
    if (!this.items.length) return;
    const cam = camera;
    if (cam) {
      this.inv.copy(cam.matrixWorld).invert();
      this.camPos.setFromMatrixPosition(cam.matrixWorld);
    }
    const xs: number[] = [];
    const ys: number[] = [];
    const ws: number[] = [];
    const hs: number[] = [];
    const idx: number[] = [];

    for (let i = this.items.length - 1; i >= 0; i--) {
      const b = this.items[i];
      if (b.leaving >= 0) {
        b.leaving += dt;
        if (b.leaving > 0.3) {
          b.el.remove();
          this.items.splice(i, 1);
          continue;
        }
      } else {
        b.life -= dt;
        if (b.life <= 0) this.dismiss(b);
      }
      if (b.shown < b.text.length) {
        b.typeT += dt;
        const n = Math.min(b.text.length, Math.floor(b.typeT * this.cps));
        if (n !== b.shown) {
          b.shown = n;
          b.typed.textContent = b.text.slice(0, n);
          b.rest.textContent = b.text.slice(n);
        }
      }
    }

    if (!cam) return;
    for (let i = 0; i < this.items.length; i++) {
      const b = this.items[i];
      if (b.object) b.object.getWorldPosition(this.v);
      else this.v.copy(b.pos);
      this.v.y += b.offsetY;
      const dist = this.v.distanceTo(this.camPos);
      this.v.applyMatrix4(this.inv);
      const behind = this.v.z > -0.05;
      this.v.applyMatrix4((cam as THREE.PerspectiveCamera).projectionMatrix);
      const p = placeOnScreen(this.v.x, this.v.y, behind, w, hgt, MARGIN + 30);
      if (!b.w) {
        b.w = b.el.offsetWidth;
        b.hgt = b.el.offsetHeight;
      }
      const fade = distanceFade(dist);
      b.op = p.clamped ? Math.max(0.78, fade) : fade;
      b.sc = p.clamped ? 0.86 : lerp(0.8, 1, (fade - 0.32) / 0.68);
      b.clamped = p.clamped;
      b.angle = p.angle;
      const bw = b.w * b.sc;
      const bh = b.hgt * b.sc;
      let x: number;
      let y: number;
      if (p.clamped) {
        // keep the whole bubble inside, nudged inward from the clamp point
        x = clamp(p.x - bw / 2, MARGIN, w - MARGIN - bw);
        y = clamp(p.y - bh / 2, MARGIN, hgt - MARGIN - bh);
      } else {
        x = clamp(p.x - bw / 2, MARGIN, w - MARGIN - bw);
        y = clamp(p.y - bh - LIFT - TAIL, MARGIN, hgt - MARGIN - bh);
      }
      b.sx = x;
      b.sy = y;
      b.visible = true;
      xs.push(x); ys.push(y); ws.push(bw); hs.push(bh); idx.push(i);
      // tail follows the anchor even when the box is nudged sideways
      b.inner.style.setProperty('--tail-x', `${clamp(p.x - x, 14, bw - 14) / b.sc}px`);
    }
    separate(xs, ys, ws, hs);
    for (let k = 0; k < idx.length; k++) {
      const b = this.items[idx[k]];
      b.sy = ys[k];
      b.el.style.transform = `translate3d(${b.sx.toFixed(1)}px, ${b.sy.toFixed(1)}px, 0) scale(${b.sc.toFixed(3)})`;
      b.el.style.opacity = b.op.toFixed(3);
      if (b.lastClamped !== b.clamped) {
        b.el.classList.toggle('is-edge', b.clamped);
        b.lastClamped = b.clamped;
      }
      if (b.clamped) b.inner.style.setProperty('--arrow', `${b.angle.toFixed(3)}rad`);
    }
  }

  snapshot(): { count: number; items: { who: string | null; x: number; y: number; opacity: number; clamped: boolean; typed: number }[] } {
    return {
      count: this.items.filter((b) => b.leaving < 0).length,
      items: this.items.filter((b) => b.leaving < 0).map((b) => ({
        who: b.who, x: Math.round(b.sx), y: Math.round(b.sy), opacity: Number(b.op.toFixed(2)), clamped: b.clamped,
        typed: Number((b.shown / Math.max(1, b.text.length)).toFixed(2)),
      })),
    };
  }
}
