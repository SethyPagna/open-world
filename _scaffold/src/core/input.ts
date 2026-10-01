/**
 * Raw devices -> named actions. Keyboard uses `event.code` (layout independent), mouse buttons are
 * `Mouse0/1/2` (left/middle/right), standard-mapping gamepad buttons are `Pad0..Pad16`.
 *
 * Edges (`pressed`/`released`) are latched from the DOM events themselves, so a tap shorter than a
 * frame still registers; they stay latched until `endFrame()`, which the engine calls after the
 * first fixed tick of a frame. Read edges in `tick()`, not `frame()`.
 *
 * Besides the contract's actions, this manager also binds the GDD verbs the contract does not name
 * (brace, shove, brighten, dim, drip, trait4, knot, cut, shoulder, draftCam) and the four movement
 * directions, all rebindable: `down('brace')` etc. work on an `InputManager`.
 */
import * as THREE from 'three';
import type { Action, Input } from './api.ts';

export type ExtraAction =
  | 'up' | 'down' | 'left' | 'right'
  | 'brace' | 'shove' | 'brighten' | 'dim' | 'drip' | 'trait4' | 'knot' | 'cut' | 'shoulder' | 'draftCam';
export type ExtAction = Action | ExtraAction;

export const ACTIONS: readonly Action[] = [
  'jump', 'dive', 'grab', 'interact', 'trait1', 'trait2', 'trait3', 'emote', 'ping', 'map', 'pause', 'scoreboard', 'chat', 'confirm', 'back',
];
export const EXTRA_ACTIONS: readonly ExtraAction[] = [
  'up', 'down', 'left', 'right', 'brace', 'shove', 'brighten', 'dim', 'drip', 'trait4', 'knot', 'cut', 'shoulder', 'draftCam',
];
const ALL_ACTIONS: readonly ExtAction[] = [...ACTIONS, ...EXTRA_ACTIONS];

/** Defaults follow GDD §4.1 (keyboard + mouse first, standard gamepad second). */
export const DEFAULT_BINDINGS: Readonly<Record<ExtAction, readonly string[]>> = {
  jump: ['Space', 'Pad0'],
  dive: ['ControlLeft', 'Pad1'],
  grab: ['Mouse0', 'Pad7'],
  interact: ['KeyE', 'Pad2'],
  trait1: ['Digit1', 'Pad14'],
  trait2: ['Digit2', 'Pad15'],
  trait3: ['Digit3'],
  trait4: ['Digit4'],
  emote: ['KeyB'],
  ping: ['Mouse1', 'KeyZ', 'Pad11'],
  map: ['KeyM'],
  pause: ['Escape', 'Pad9'],
  scoreboard: ['Tab', 'Pad8'],
  chat: ['KeyT', 'Pad13'],
  confirm: ['Enter', 'NumpadEnter', 'Space', 'Pad0'],
  back: ['Escape', 'Backspace', 'Pad1'],
  up: ['KeyW', 'ArrowUp'],
  down: ['KeyS', 'ArrowDown'],
  left: ['KeyA', 'ArrowLeft'],
  right: ['KeyD', 'ArrowRight'],
  brace: ['ShiftLeft', 'Pad4'],
  shove: ['Mouse2', 'Pad6'],
  brighten: ['KeyF', 'Pad5'],
  dim: ['KeyQ', 'Pad12'],
  drip: ['KeyR', 'Pad3'],
  knot: ['KeyG'],
  cut: ['KeyX'],
  shoulder: ['KeyC', 'Pad10'],
  draftCam: ['KeyV'],
};

/** Keys whose browser default (scroll, focus change) we suppress while the game owns the keyboard. */
const PREVENT = new Set(['Space', 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Backspace', 'Quote', 'Slash']);

const PAD_LABELS = ['A', 'B', 'X', 'Y', 'LB', 'RB', 'LT', 'RT', 'View', 'Menu', 'L3', 'R3', 'D-Up', 'D-Down', 'D-Left', 'D-Right', 'Home'];
const KEY_LABELS: Record<string, string> = {
  Space: 'Space', Enter: 'Enter', NumpadEnter: 'Enter', Escape: 'Esc', Tab: 'Tab', Backspace: 'Bksp', Backquote: '`',
  ShiftLeft: 'Shift', ShiftRight: 'R-Shift', ControlLeft: 'Ctrl', ControlRight: 'R-Ctrl', AltLeft: 'Alt', AltRight: 'AltGr',
  ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→', CapsLock: 'Caps',
  Mouse0: 'LMB', Mouse1: 'MMB', Mouse2: 'RMB', Mouse3: 'Mouse4', Mouse4: 'Mouse5',
  Minus: '-', Equal: '=', BracketLeft: '[', BracketRight: ']', Semicolon: ';', Quote: "'", Comma: ',', Period: '.', Slash: '/', Backslash: '\\',
};

/** Short human label for a binding code: "KeyE" -> "E", "Mouse0" -> "LMB", "Pad0" -> "A". */
export function keyLabel(code: string): string {
  if (KEY_LABELS[code]) return KEY_LABELS[code];
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Digit')) return code.slice(5);
  if (code.startsWith('Numpad')) return 'Num' + code.slice(6);
  if (code.startsWith('Pad')) return PAD_LABELS[Number(code.slice(3))] ?? code;
  return code;
}

function isEditable(t: EventTarget | Element | null): boolean {
  if (!t || !(t instanceof HTMLElement)) return false;
  if (t.isContentEditable) return true;
  const tag = t.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}

function radialDeadzone(x: number, y: number, dz: number, out: THREE.Vector2): THREE.Vector2 {
  const m = Math.hypot(x, y);
  if (m < dz) return out.set(0, 0);
  const s = Math.min(1, (m - dz) / (1 - dz)) / m;
  return out.set(x * s, y * s);
}

type KeyboardApi = { lock?: (codes?: string[]) => Promise<void>; unlock?: () => void };

export interface InputOptions {
  /** localStorage key for rebinds. */
  storageKey?: string;
  /** Disable pointer lock (the headless harness sets ?test=1). */
  allowPointerLock?: boolean;
}

export class InputManager implements Input {
  readonly move = new THREE.Vector2();
  readonly look = new THREE.Vector2();
  readonly pointer = new THREE.Vector2();
  /** Wheel delta this frame (px, positive = scroll down / zoom out). */
  wheel = 0;
  /** Left/right stick after deadzone (for analog-aware code). */
  readonly stickMove = new THREE.Vector2();
  readonly stickLook = new THREE.Vector2();
  deadzone = 0.18;
  /** Right-stick look speed in "pixels per second" so it matches mouse-delta units. */
  padLookSpeed = 900;
  triggerThreshold = 0.35;

  private _enabled = true;
  private _usingGamepad = false;
  private readonly held = new Set<string>();
  private readonly pressedLatch = new Set<ExtAction>();
  private readonly releasedLatch = new Set<ExtAction>();
  private binds: Record<ExtAction, string[]>;
  private readonly byCode = new Map<string, ExtAction[]>();
  private readonly lookAcc = new THREE.Vector2();
  private wheelAcc = 0;
  private clientX = Number.NaN;
  private clientY = Number.NaN;
  private padPrev: boolean[] = [];
  private lastUpdate = 0;
  private capture: ((code: string | null) => void) | null = null;
  private readonly el: HTMLElement;
  private readonly storageKey: string;
  private readonly allowPointerLock: boolean;
  private readonly cleanups: Array<() => void> = [];

  constructor(el: HTMLElement, opts: InputOptions = {}) {
    this.el = el;
    this.storageKey = opts.storageKey ?? 'knotspire.bindings.v1';
    this.allowPointerLock = opts.allowPointerLock ?? true;
    this.binds = this.loadBindings();
    this.rebuildIndex();

    const on = <K extends keyof WindowEventMap>(t: Window | HTMLElement, type: K, fn: (e: WindowEventMap[K]) => void, o?: AddEventListenerOptions): void => {
      t.addEventListener(type, fn as EventListener, o);
      this.cleanups.push(() => t.removeEventListener(type, fn as EventListener, o));
    };
    on(window, 'keydown', (e) => this.onKeyDown(e));
    on(window, 'keyup', (e) => this.up(e.code));
    on(el, 'mousedown', (e) => this.onMouseDown(e));
    on(window, 'mouseup', (e) => this.up('Mouse' + e.button));
    on(window, 'mousemove', (e) => this.onMouseMove(e));
    on(el, 'wheel', (e) => this.onWheel(e), { passive: true });
    on(el, 'contextmenu', (e) => e.preventDefault());
    on(window, 'blur', () => this.releaseAll());
    const onVis = (): void => {
      if (document.hidden) this.releaseAll();
    };
    document.addEventListener('visibilitychange', onVis);
    this.cleanups.push(() => document.removeEventListener('visibilitychange', onVis));
  }

  // --- Input contract ------------------------------------------------------------------------
  get enabled(): boolean {
    return this._enabled;
  }
  set enabled(v: boolean) {
    if (v === this._enabled) return;
    this._enabled = v;
    if (!v) this.releaseAll();
  }
  get usingGamepad(): boolean {
    return this._usingGamepad;
  }

  down(a: ExtAction): boolean {
    const list = this.binds[a];
    for (let i = 0; i < list.length; i++) if (this.held.has(list[i])) return true;
    return false;
  }
  pressed(a: ExtAction): boolean {
    return this.pressedLatch.has(a);
  }
  released(a: ExtAction): boolean {
    return this.releasedLatch.has(a);
  }

  update(): void {
    const now = performance.now();
    const dt = this.lastUpdate ? Math.min(0.1, Math.max(0, (now - this.lastUpdate) / 1000)) : 1 / 60;
    this.lastUpdate = now;
    this.pollGamepad();

    if (this._enabled) {
      this.look.copy(this.lookAcc);
      this.look.x += this.stickLook.x * this.padLookSpeed * dt;
      this.look.y += this.stickLook.y * this.padLookSpeed * dt;
      this.wheel = this.wheelAcc;
      const kx = (this.down('right') ? 1 : 0) - (this.down('left') ? 1 : 0);
      const ky = (this.down('up') ? 1 : 0) - (this.down('down') ? 1 : 0);
      this.move.set(kx, ky);
      if (kx !== 0 && ky !== 0) this.move.multiplyScalar(Math.SQRT1_2);
      if (this.stickMove.lengthSq() > this.move.lengthSq()) this.move.copy(this.stickMove);
    } else {
      this.look.set(0, 0);
      this.wheel = 0;
      this.move.set(0, 0);
    }
    this.lookAcc.set(0, 0);
    this.wheelAcc = 0;

    if (!Number.isNaN(this.clientX)) {
      const r = this.el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        this.pointer.set(((this.clientX - r.left) / r.width) * 2 - 1, -((this.clientY - r.top) / r.height) * 2 + 1);
      }
    }
  }

  endFrame(): void {
    this.pressedLatch.clear();
    this.releasedLatch.clear();
  }

  bindings(): Record<ExtAction, string[]> {
    const out = {} as Record<ExtAction, string[]>;
    for (const a of ALL_ACTIONS) out[a] = [...this.binds[a]];
    return out;
  }

  rebind(a: ExtAction, codes: string[]): void {
    this.releaseAll();
    this.binds[a] = [...new Set(codes.filter((c) => typeof c === 'string' && c.length > 0))];
    this.rebuildIndex();
    this.saveBindings();
  }

  // --- Extras ----------------------------------------------------------------------------------
  resetBindings(): void {
    this.releaseAll();
    this.binds = cloneDefaults();
    this.rebuildIndex();
    try {
      localStorage.removeItem(this.storageKey);
    } catch {
      /* storage unavailable */
    }
  }

  /** Label for the binding a prompt should show ("E", "LMB", "X"), preferring the active device. */
  actionLabel(a: ExtAction): string {
    const list = this.binds[a];
    const pad = list.find((c) => c.startsWith('Pad'));
    const kb = list.find((c) => !c.startsWith('Pad'));
    const code = this._usingGamepad ? pad ?? kb : kb ?? pad;
    return code ? keyLabel(code) : '?';
  }

  /** Resolves with the next key / mouse button / pad button code (null on Escape). For rebinding UIs. */
  listenForBinding(): Promise<string | null> {
    this.capture?.(null);
    return new Promise((resolve) => {
      this.capture = (code) => {
        this.capture = null;
        resolve(code);
      };
    });
  }

  /** Is this raw code held right now (e.g. 'Backquote')? */
  isCodeDown(code: string): boolean {
    return this.held.has(code);
  }

  get pointerLocked(): boolean {
    return document.pointerLockElement === this.el;
  }
  lockPointer(): void {
    if (!this.allowPointerLock || this.pointerLocked) return;
    try {
      const r = this.el.requestPointerLock() as unknown;
      if (r instanceof Promise) r.catch(() => {});
    } catch {
      /* not allowed without a gesture */
    }
  }
  unlockPointer(): void {
    if (this.pointerLocked) document.exitPointerLock();
  }

  /**
   * In fullscreen, Chromium's Keyboard Lock lets the page receive Ctrl+W / Ctrl+T instead of the
   * browser (Dive is Ctrl in the GDD). No-op elsewhere.
   */
  lockKeyboard(): void {
    const kb = (navigator as Navigator & { keyboard?: KeyboardApi }).keyboard;
    kb?.lock?.().catch(() => {});
  }
  unlockKeyboard(): void {
    (navigator as Navigator & { keyboard?: KeyboardApi }).keyboard?.unlock?.();
  }

  /** Release everything currently held (fires `released` for held actions). */
  releaseAll(): void {
    for (const code of [...this.held]) this.up(code);
    this.lookAcc.set(0, 0);
    this.wheelAcc = 0;
  }

  dispose(): void {
    for (const c of this.cleanups) c();
    this.cleanups.length = 0;
    this.capture?.(null);
  }

  // --- Internals -------------------------------------------------------------------------------
  private onKeyDown(e: KeyboardEvent): void {
    if (this.capture) {
      e.preventDefault();
      this.capture(e.code === 'Escape' ? null : e.code);
      return;
    }
    if (!this._enabled || isEditable(e.target) || isEditable(document.activeElement)) return;
    if (PREVENT.has(e.code) || ((e.ctrlKey || e.metaKey) && this.byCode.has(e.code))) e.preventDefault();
    if (e.repeat) return;
    this._usingGamepad = false;
    this.downCode(e.code);
  }

  private onMouseDown(e: MouseEvent): void {
    if (this.capture) {
      e.preventDefault();
      this.capture('Mouse' + e.button);
      return;
    }
    if (!this._enabled) return;
    if (e.button === 1) e.preventDefault(); // no autoscroll
    this._usingGamepad = false;
    this.downCode('Mouse' + e.button);
  }

  private onMouseMove(e: MouseEvent): void {
    this.clientX = e.clientX;
    this.clientY = e.clientY;
    if (!this._enabled) return;
    this.lookAcc.x += e.movementX || 0;
    this.lookAcc.y += e.movementY || 0;
    if (e.movementX || e.movementY) this._usingGamepad = false;
  }

  private onWheel(e: WheelEvent): void {
    if (!this._enabled) return;
    this.wheelAcc += e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * 400 : e.deltaY;
  }

  private downCode(code: string): void {
    if (this.held.has(code)) return;
    const actions = this.byCode.get(code);
    if (actions) {
      for (const a of actions) if (!this.down(a)) this.pressedLatch.add(a);
    }
    this.held.add(code);
  }

  private up(code: string): void {
    if (!this.held.delete(code)) return;
    const actions = this.byCode.get(code);
    if (actions) {
      for (const a of actions) if (!this.down(a)) this.releasedLatch.add(a);
    }
  }

  private pollGamepad(): void {
    const pads = typeof navigator !== 'undefined' && navigator.getGamepads ? navigator.getGamepads() : null;
    let pad: Gamepad | null = null;
    if (pads) {
      for (const p of pads) {
        if (p && p.connected && (p.mapping === 'standard' || !pad)) {
          pad = p;
          if (p.mapping === 'standard') break;
        }
      }
    }
    if (!pad) {
      for (let i = 0; i < this.padPrev.length; i++) if (this.padPrev[i]) this.up('Pad' + i);
      this.padPrev.length = 0;
      this.stickMove.set(0, 0);
      this.stickLook.set(0, 0);
      return;
    }
    for (let i = 0; i < pad.buttons.length; i++) {
      const b = pad.buttons[i];
      const isDown = b.pressed || b.value > this.triggerThreshold;
      if (isDown !== !!this.padPrev[i]) {
        const code = 'Pad' + i;
        if (isDown) {
          if (this.capture) this.capture(code);
          else if (this._enabled) {
            this._usingGamepad = true;
            this.downCode(code);
          }
        } else {
          this.up(code);
        }
      }
      this.padPrev[i] = isDown;
    }
    const ax = pad.axes;
    radialDeadzone(ax[0] ?? 0, -(ax[1] ?? 0), this.deadzone, this.stickMove);
    radialDeadzone(ax[2] ?? 0, ax[3] ?? 0, this.deadzone, this.stickLook);
    if (!this._enabled) {
      this.stickMove.set(0, 0);
      this.stickLook.set(0, 0);
    } else if (this.stickMove.lengthSq() > 0 || this.stickLook.lengthSq() > 0) {
      this._usingGamepad = true;
    }
  }

  private rebuildIndex(): void {
    this.byCode.clear();
    for (const a of ALL_ACTIONS) {
      for (const code of this.binds[a]) {
        const list = this.byCode.get(code);
        if (list) list.push(a);
        else this.byCode.set(code, [a]);
      }
    }
  }

  private loadBindings(): Record<ExtAction, string[]> {
    const b = cloneDefaults();
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) {
        const saved = JSON.parse(raw) as Record<string, unknown>;
        for (const a of ALL_ACTIONS) {
          const v = saved[a];
          if (Array.isArray(v) && v.every((c) => typeof c === 'string')) b[a] = [...(v as string[])];
        }
      }
    } catch {
      /* storage unavailable or corrupt: defaults */
    }
    return b;
  }

  private saveBindings(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.binds));
    } catch {
      /* storage unavailable */
    }
  }
}

function cloneDefaults(): Record<ExtAction, string[]> {
  const out = {} as Record<ExtAction, string[]>;
  for (const a of ALL_ACTIONS) out[a] = [...DEFAULT_BINDINGS[a]];
  return out;
}
