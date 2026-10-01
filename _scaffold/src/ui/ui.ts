// UI facade: implements UiApi and owns every overlay layer. DOM only; no audio/engine imports.
//
// Layers (bottom -> top): bubbles, hud, chat, toasts, system windows, screens, modals, tooltip.
// `root` is the overlay element this class creates inside the host passed to the constructor.
import './styles.css';
import * as THREE from 'three';
import type { SystemTone, UiApi, UiScreen } from '../core/api.ts';
import { h, setUiSoundSink, uiSound, prefersReducedMotion } from './h.ts';
import { loadFonts } from './fonts.ts';
import { HISTORY_SIZE, SystemWindows, formatAgo, staticWindow, type SystemOpts } from './system_window.ts';
import { Hud, type TraitSlotInfo } from './hud.ts';
import { Toasts } from './toast.ts';
import { Bubbles, type BubbleOpts } from './bubbles.ts';
import { ChatFeed } from './chat_feed.ts';
import { KeyCap, ModalBox, ScreenFrame, setTooltipLayer, type ModalOpts } from './components.ts';

/** Built-in screen: the last HISTORY_SIZE System windows (GDD §14.2 "Tab reopens the last 10"). */
export const SYSTEM_LOG_SCREEN = 'system_log';

type ScreenFactory = (props: Record<string, unknown>) => UiScreen;
interface OpenScreen { id: string; screen: UiScreen; layer: HTMLElement; props: Record<string, unknown>; returnFocus: Element | null }
interface OpenModal { layer: HTMLElement; close: (v: string | null) => void }

const SCREEN_OUT = 0.34;
const WATCHDOG_MS = 250;

export class Ui implements UiApi {
  readonly root: HTMLElement;
  readonly hud: Hud;
  readonly windows: SystemWindows;
  readonly toasts: Toasts;
  readonly bubbles: Bubbles;
  readonly chat: ChatFeed;
  /** Called whenever the UI starts/stops wanting the keyboard (choice window, screen, modal). */
  onCaptureChange: ((capturing: boolean) => void) | null = null;

  private readonly screenHost: HTMLElement;
  private readonly modalHost: HTMLElement;
  private readonly factories = new Map<string, ScreenFactory>();
  private current: OpenScreen | null = null;
  private readonly leaving: { layer: HTMLElement; t: number }[] = [];
  private readonly modals: OpenModal[] = [];
  private camera: THREE.Camera | null = null;
  private w = 1280;
  private h = 720;
  private lastExternal = -1e9;
  private lastLoop = 0;
  private raf = 0;
  private capturing = false;
  private hudVisible = true;
  private reduced = false;
  private readonly ro: ResizeObserver | null = null;
  private readonly mq: MediaQueryList | null = null;
  private disposed = false;
  private promptTarget: THREE.Vector3 | THREE.Object3D | null = null;
  private promptLift = 0;
  private readonly pv = new THREE.Vector3();
  private readonly camInv = new THREE.Matrix4();

  constructor(host: HTMLElement) {
    loadFonts();
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';

    this.windows = new SystemWindows(() => uiSound('ui_click', 60));
    this.hud = new Hud();
    this.toasts = new Toasts();
    this.bubbles = new Bubbles();
    this.chat = new ChatFeed();
    this.screenHost = h('div.tf-screens');
    this.modalHost = h('div.tf-modals');
    const tip = h('div.tf-tips');

    this.root = h('div.tf-ui', { dataset: { ui: 'root' } },
      this.bubbles.el,
      this.hud.el,
      this.chat.el,
      this.toasts.el,
      this.windows.el,
      this.screenHost,
      this.modalHost,
      tip);
    host.appendChild(this.root);
    setTooltipLayer(tip);

    this.w = this.root.clientWidth || window.innerWidth;
    this.h = this.root.clientHeight || window.innerHeight;
    if (typeof ResizeObserver !== 'undefined') {
      this.ro = new ResizeObserver((entries) => {
        const r = entries[0]?.contentRect;
        if (r) {
          this.w = r.width;
          this.h = r.height;
        }
      });
      this.ro.observe(this.root);
    }

    if (typeof matchMedia === 'function') {
      this.mq = matchMedia('(prefers-reduced-motion: reduce)');
      this.mq.addEventListener('change', this.onMotionPref);
    }
    this.setReducedMotion(prefersReducedMotion());

    window.addEventListener('keydown', this.onKey, true);
    this.lastLoop = performance.now();
    this.raf = requestAnimationFrame(this.loop);
    this.registerScreen(SYSTEM_LOG_SCREEN, () => this.buildSystemLog());
  }

  // ------------------------------------------------------------------------------------------
  // UiApi
  // ------------------------------------------------------------------------------------------
  system(opts: SystemOpts): Promise<number | null> {
    return this.windows.open(opts);
  }

  toast(text: string, tone: SystemTone = 'info', seconds = 3.2): void {
    this.toasts.push(text, tone, seconds);
  }

  objective(text: string | null, sub?: string): void {
    this.hud.objective(text, sub);
  }

  timer(seconds: number | null, label?: string): void {
    this.hud.timer(seconds, label);
  }

  prompt(text: string | null, key?: string): void {
    this.hud.prompt(text, key);
  }

  /**
   * The Vector3 is held by reference: pass a live position to follow a moving actor (or use
   * `opts.object`), or a clone for a fixed point. One bubble per `who` at a time.
   */
  bubble(worldPos: THREE.Vector3, text: string, opts?: BubbleOpts): void {
    this.bubbles.add(worldPos, text, opts);
  }

  patronChat(patronName: string, text: string, color: string): void {
    this.chat.push(patronName, text, color);
  }

  registerScreen(id: string, factory: ScreenFactory): void {
    this.factories.set(id, factory);
  }

  screen(id: string, props: Record<string, unknown> = {}): void {
    const f = this.factories.get(id);
    if (!f) {
      console.warn(`[ui] unknown screen "${id}"`);
      return;
    }
    const returnFocus = this.current?.returnFocus ?? document.activeElement;
    if (this.current) this.dropScreen(false);
    const scr = f(props);
    const layer = h('div.scr-layer', { dataset: { screen: id } },
      h('div.scr-backdrop', { onclick: () => { if (!props.locked) this.closeScreen(); } }),
      h('div.scr-host', null, scr.el));
    this.screenHost.appendChild(layer);
    this.current = { id, screen: scr, layer, props, returnFocus };
    uiSound('screen_open');
    requestAnimationFrame(() => {
      if (this.current?.layer !== layer) return;
      const q = (sel: string): HTMLElement | null => scr.el.querySelector<HTMLElement>(sel);
      const first = q('[autofocus]')
        ?? q('[role="tab"][aria-selected="true"]')
        ?? q('.scr-body button:not([disabled]), .scr-body [tabindex="0"], .scr-body input, .scr-body select')
        ?? q('button:not([disabled]), [tabindex="0"], input, select');
      first?.focus({ preventScroll: true });
    });
    this.checkCapture();
  }

  closeScreen(): void {
    if (!this.current) return;
    const rf = this.current.returnFocus;
    this.dropScreen(true);
    if (rf instanceof HTMLElement && rf.isConnected) rf.focus({ preventScroll: true });
    this.checkCapture();
  }

  get activeScreen(): string | null {
    return this.current?.id ?? null;
  }

  setHud(visible: boolean): void {
    this.hudVisible = visible;
    this.hud.setVisible(visible);
    this.chat.el.classList.toggle('is-off', !visible);
  }

  update(dt: number, camera: THREE.Camera): void {
    this.camera = camera;
    this.lastExternal = performance.now();
    this.step(Math.min(dt, 0.1));
  }

  // ------------------------------------------------------------------------------------------
  // Extensions (beyond UiApi)
  // ------------------------------------------------------------------------------------------
  /** Sink for UI sounds (names listed in UI_SOUNDS, h.ts). */
  setSound(fn: ((name: string) => void) | null): void {
    setUiSoundSink(fn);
  }

  completeObjective(next: string | null = null, nextSub?: string): void {
    this.hud.completeObjective(next, nextSub);
  }

  /** Floor/room badge: `room("1E · The Echo Nave")` or `room("1E", "The Echo Nave")`; null hides. */
  room(designation: string | null, name?: string): void {
    this.hud.room(designation, name);
  }

  setVital(value: number, max = 100, label?: string, iconName?: string): void {
    this.hud.setVital(value, max, label, iconName);
  }

  /**
   * Float the interaction prompt over a world point (GDD §14.3 "near the target"). Pass an
   * Object3D to follow it, a Vector3 (held by reference), or null to return it to its HUD slot.
   * Off-screen or behind-camera targets fall back to the HUD slot automatically.
   */
  promptAnchor(target: THREE.Vector3 | THREE.Object3D | null, liftMetres = 0.6): void {
    this.promptTarget = target;
    this.promptLift = liftMetres;
    if (!target) this.hud.placePrompt(null);
  }

  /** Open the System log (last 10 windows). Bind it to Tab (or wherever) in the game. */
  systemLog(): void {
    this.screen(SYSTEM_LOG_SCREEN);
  }

  /** 'low' drops backdrop blur and ambient shimmer loops for weak GPUs. */
  setQuality(q: 'high' | 'low'): void {
    this.root.classList.toggle('tf-lowfx', q === 'low');
  }

  setCurrency(id: string, amount: number, opts?: { icon?: string; color?: string; label?: string; animate?: boolean }): void {
    this.hud.setCurrency(id, amount, opts);
  }

  setTraits(list: TraitSlotInfo[]): void {
    this.hud.setTraits(list);
  }

  pulseTrait(id: string): void {
    this.hud.pulseTrait(id);
  }

  promptHold(p: number | null): void {
    this.hud.promptHold(p);
  }

  /** Container for the minimap (others render a canvas into it). Showing it reveals the frame. */
  get minimapSlot(): HTMLElement {
    this.hud.showMinimap(true);
    return this.hud.minimap;
  }

  /** Blocking confirm dialog. Resolves with the chosen action value, or null on Escape. */
  modal(opts: ModalOpts): Promise<string | null> {
    return new Promise((resolve) => {
      let done = false;
      const close = (v: string | null): void => {
        if (done) return;
        done = true;
        layer.classList.add('is-out');
        const i = this.modals.findIndex((m) => m.layer === layer);
        if (i >= 0) this.modals.splice(i, 1);
        setTimeout(() => layer.remove(), 260);
        uiSound(v === null ? 'ui_back' : 'ui_confirm');
        this.checkCapture();
        resolve(v);
      };
      const box = ModalBox(opts, close);
      const layer = h('div.modal-layer', null, h('div.modal-backdrop', { onclick: () => close(null) }), box);
      this.modalHost.appendChild(layer);
      this.modals.push({ layer, close });
      uiSound('modal_open');
      requestAnimationFrame(() => box.querySelector<HTMLElement>('.modal-foot button:last-child')?.focus({ preventScroll: true }));
      this.checkCapture();
    });
  }

  /** Route the engine's 'confirm' action: skip typing / advance the focused System window. */
  confirm(): boolean {
    return this.windows.confirm();
  }

  /** Scene change: drop windows, toasts, bubbles, prompt and timer. Screens stay. */
  clearTransient(): void {
    this.windows.clear();
    this.toasts.clear();
    this.bubbles.clear();
    this.hud.prompt(null);
    this.promptAnchor(null);
    this.hud.timer(null);
  }

  get capturingInput(): boolean {
    return this.windows.capturing || this.current !== null || this.modals.length > 0;
  }

  setReducedMotion(v: boolean): void {
    this.reduced = v;
    this.root.classList.toggle('tf-reduced', v);
    this.windows.setTypingSpeed(v ? 3 : 1);
    this.windows.setReducedMotion(v);
  }

  /** Global text scale (accessibility), e.g. 1.25. */
  setTextScale(s: number): void {
    this.root.style.setProperty('--ui-text', String(Math.max(0.75, Math.min(1.6, s))));
  }

  get hudShown(): boolean {
    return this.hudVisible;
  }

  snapshot(): Record<string, unknown> {
    return {
      size: [Math.round(this.w), Math.round(this.h)],
      windows: this.windows.snapshot(),
      hud: this.hud.snapshot(),
      toasts: this.toasts.snapshot(),
      bubbles: this.bubbles.snapshot(),
      chat: this.chat.snapshot(),
      screen: this.activeScreen,
      modals: this.modals.length,
      capturing: this.capturingInput,
      reducedMotion: this.reduced,
    };
  }

  dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    window.removeEventListener('keydown', this.onKey, true);
    this.mq?.removeEventListener('change', this.onMotionPref);
    this.ro?.disconnect();
    setTooltipLayer(null);
    this.root.remove();
  }

  // ------------------------------------------------------------------------------------------
  // internals
  // ------------------------------------------------------------------------------------------
  private step(dt: number): void {
    this.windows.update(dt);
    this.hud.update(dt);
    this.toasts.update(dt);
    this.chat.update(dt);
    this.bubbles.update(dt, this.camera, this.w, this.h);
    this.placePrompt();
    this.current?.screen.update?.(dt);
    for (let i = this.leaving.length - 1; i >= 0; i--) {
      const l = this.leaving[i];
      l.t -= dt;
      if (l.t <= 0) {
        l.layer.remove();
        this.leaving.splice(i, 1);
      }
    }
    this.checkCapture();
  }

  private loop = (now: number): void => {
    if (this.disposed) return;
    const dt = (now - this.lastLoop) / 1000;
    this.lastLoop = now;
    // Keep animating (menus, pause) when nobody is calling update().
    if (now - this.lastExternal > WATCHDOG_MS) this.step(Math.min(Math.max(dt, 0), 0.1));
    this.raf = requestAnimationFrame(this.loop);
  };

  private placePrompt(): void {
    const t = this.promptTarget;
    const cam = this.camera as THREE.PerspectiveCamera | null;
    if (!t || !cam || !this.hud.promptVisible) return;
    const p = this.pv;
    if ((t as THREE.Object3D).isObject3D) (t as THREE.Object3D).getWorldPosition(p);
    else p.copy(t as THREE.Vector3);
    p.y += this.promptLift;
    p.applyMatrix4(this.camInv.copy(cam.matrixWorld).invert());
    const behind = p.z > -0.05;
    p.applyMatrix4(cam.projectionMatrix);
    // Keep a margin so the pill never hugs the edges or sits under the corner widgets.
    if (behind || Math.abs(p.x) > 0.8 || p.y > 0.7 || p.y < -0.75) this.hud.placePrompt(null);
    else this.hud.placePrompt((p.x + 1) * 0.5 * this.w, (1 - p.y) * 0.5 * this.h);
  }

  private buildSystemLog(): UiScreen {
    const now = this.windows.now;
    const entries = [...this.windows.history].reverse();
    const list = entries.length
      ? h('ol.syslog', null, ...entries.map((e, i) => h('li.syslog-item', { style: { '--i': i } },
        h('div.syslog-meta', null,
          h('span.syslog-ago', null, formatAgo(now - e.at)),
          e.choices.length ? h('span.syslog-pick', null, e.picked === null ? 'No answer' : `Answered ${e.picked + 1}`) : null),
        staticWindow(e))))
      : h('p.syslog-empty', null, 'The System has not spoken yet.');
    const el = ScreenFrame(
      { title: 'System Log', kicker: `[ LAST ${HISTORY_SIZE} ]`, kr: '기록', tone: 'info', onClose: () => this.closeScreen(), class: 'scr--log' },
      list,
      h('span', null, KeyCap('Escape', { size: 'sm' }), 'Close'));
    return { el };
  }

  private dropScreen(animate: boolean): void {
    const c = this.current;
    if (!c) return;
    this.current = null;
    c.screen.onClose?.();
    c.layer.classList.add('is-out');
    this.leaving.push({ layer: c.layer, t: animate ? SCREEN_OUT : 0.2 });
    uiSound('screen_close');
  }

  private checkCapture(): void {
    const c = this.capturingInput;
    if (c !== this.capturing) {
      this.capturing = c;
      this.root.classList.toggle('is-capturing', c);
      this.onCaptureChange?.(c);
    }
  }

  private onMotionPref = (e: MediaQueryListEvent): void => this.setReducedMotion(e.matches);

  private onKey = (e: KeyboardEvent): void => {
    if (e.repeat && (e.code === 'Enter' || e.code === 'Space')) return;
    const t = e.target as HTMLElement | null;
    const typing = !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable) && (t as HTMLInputElement).type !== 'range';
    let consumed = false;
    if (this.modals.length) {
      if (e.code === 'Escape') {
        this.modals[this.modals.length - 1].close(null);
        consumed = true;
      }
    } else if (!typing && this.windows.handleKey(e)) {
      consumed = true;
    } else if (this.current && e.code === 'Escape' && !this.current.props.locked) {
      this.closeScreen();
      consumed = true;
    }
    if (consumed) {
      e.preventDefault();
      e.stopPropagation();
    }
  };
}

export type { TraitSlotInfo } from './hud.ts';
export type { BubbleOpts } from './bubbles.ts';
export type { SystemOpts } from './system_window.ts';
export { UI_SOUNDS } from './h.ts';
