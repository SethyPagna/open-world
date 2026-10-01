/**
 * Test hooks (`window.__TF`) and the performance overlay. The engine installs these itself;
 * scenes/demos add their own with `mergeTestHooks` (never replace `__TF`).
 * Backquote toggles the overlay; `?debug=1` shows it at boot.
 */
import type { TransitionKind } from './api.ts';
import type { GameEngine } from './engine.ts';
import type { TransitionPhase } from './transitions.ts';

export interface TfHooks {
  report: () => Record<string, unknown>;
  debug: Record<string, unknown>;
  [key: string]: unknown;
}

function win(): { __TF?: Partial<TfHooks> } {
  return window as unknown as { __TF?: Partial<TfHooks> };
}

function safeCall(fn: () => unknown): Record<string, unknown> {
  try {
    const r = fn();
    return r && typeof r === 'object' ? (r as Record<string, unknown>) : { value: r };
  } catch (e) {
    return { reportError: String(e) };
  }
}

/** The shared hook object, created on first use. */
export function getTestHooks(): TfHooks {
  const w = win();
  const tf = (w.__TF ??= {}) as Partial<TfHooks>;
  tf.debug ??= {};
  tf.report ??= () => ({});
  return tf as TfHooks;
}

/**
 * Merge a report provider and debug functions into `window.__TF`. Later reports win on key
 * clashes; earlier providers keep contributing.
 */
export function mergeTestHooks(report?: (() => unknown) | null, debug?: Record<string, unknown>): void {
  const tf = getTestHooks();
  if (report) {
    const prev = tf.report;
    tf.report = () => ({ ...safeCall(prev), ...safeCall(report) });
  }
  if (debug) Object.assign(tf.debug, debug);
}

const installed = new WeakSet<object>();

export function installTestHooks(engine: GameEngine): void {
  if (installed.has(engine)) return;
  installed.add(engine);
  const overlay = new DebugOverlay(engine);
  mergeTestHooks(() => engine.report(), {
    engine,
    go: (id: string, kind: TransitionKind = 'fade', params: Record<string, unknown> = {}) => engine.scenes.go(id, params, kind),
    hitstop: (seconds: number) => engine.hitstop(seconds),
    timeScale: (v: number) => (engine.timeScale = v),
    pulse: (kind: 'flash' | 'chromatic' | 'glitch', strength?: number, seconds?: number) => engine.post.pulse(kind, strength, seconds),
    look: (name: string, blend?: number) => engine.post.setLookByName(name, blend),
    post: () => engine.post.snapshot(),
    advance: (seconds: number) => engine.advance(seconds),
    holdTransition: (p: number | null) => (engine.transitions.holdAt = p),
    transitionSpeed: (v: number) => (engine.transitions.speed = v),
    previewTransition: (kind: TransitionKind, phase: TransitionPhase, p: number) => engine.transitions.preview(kind, phase, p),
    clearTransition: () => engine.transitions.clear(),
    overlay: (on?: boolean) => overlay.toggle(on),
    input: () => ({
      move: [engine.input.move.x, engine.input.move.y],
      pointer: [engine.input.pointer.x, engine.input.pointer.y],
      usingGamepad: engine.input.usingGamepad,
      enabled: engine.input.enabled,
    }),
  });
  if (engine.params.get('debug') === '1') overlay.toggle(true);
  window.addEventListener('keydown', (e) => {
    if (e.code !== 'Backquote' || e.repeat) return;
    const t = e.target as HTMLElement | null;
    if (t && (t.isContentEditable || t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
    overlay.toggle();
  });
}

const GRAPH_W = 150;
const GRAPH_H = 34;

/** FPS / frame-time graph / draw calls. Runs its own rAF only while visible. */
class DebugOverlay {
  private readonly engine: GameEngine;
  private root: HTMLDivElement | null = null;
  private text: HTMLDivElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private samples = new Float32Array(GRAPH_W);
  private head = 0;
  private raf = 0;
  private last = 0;
  private nextText = 0;

  constructor(engine: GameEngine) {
    this.engine = engine;
  }

  get visible(): boolean {
    return this.root !== null;
  }

  toggle(on?: boolean): boolean {
    const want = on ?? !this.visible;
    if (want && !this.root) this.show();
    else if (!want && this.root) this.hide();
    return this.visible;
  }

  private show(): void {
    const r = document.createElement('div');
    r.style.cssText = 'position:fixed;left:8px;top:8px;z-index:2147483000;pointer-events:none;padding:6px 8px 7px;border-radius:6px;' +
      'background:rgba(5,6,10,0.78);border:1px solid rgba(127,233,255,0.28);box-shadow:0 0 12px rgba(127,233,255,0.12);' +
      'font:11px/1.35 ui-monospace,SFMono-Regular,Consolas,monospace;color:#d6f5ff;white-space:pre;min-width:150px';
    this.text = document.createElement('div');
    const c = document.createElement('canvas');
    c.width = GRAPH_W;
    c.height = GRAPH_H;
    c.style.cssText = `display:block;margin-top:4px;width:${GRAPH_W}px;height:${GRAPH_H}px`;
    this.ctx = c.getContext('2d');
    r.append(this.text, c);
    document.body.appendChild(r);
    this.root = r;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.tick);
  }

  private hide(): void {
    cancelAnimationFrame(this.raf);
    this.root?.remove();
    this.root = this.text = null;
    this.ctx = null;
  }

  private readonly tick = (now: number): void => {
    if (!this.root) return;
    this.raf = requestAnimationFrame(this.tick);
    const ms = now - this.last;
    this.last = now;
    this.samples[this.head] = ms;
    this.head = (this.head + 1) % GRAPH_W;
    if (now >= this.nextText) {
      this.nextText = now + 250;
      this.drawText();
    }
    this.drawGraph();
  };

  private drawText(): void {
    if (!this.text) return;
    const e = this.engine;
    const s = e.stats;
    let worst = 0;
    for (let i = 0; i < GRAPH_W; i++) worst = Math.max(worst, this.samples[i]);
    const mem = e.renderer.info.memory;
    this.text.textContent =
      `FPS ${s.fps.toFixed(0).padStart(3)}  ${s.frameMs.toFixed(1)}ms (max ${worst.toFixed(0)})\n` +
      `cpu ${s.cpuMs.toFixed(2)}ms  ticks/f ${s.ticksThisFrame}\n` +
      `draws ${s.drawCalls}  tris ${(s.triangles / 1000).toFixed(1)}k\n` +
      `geo ${mem.geometries}  tex ${mem.textures}  dpr ${s.pixelRatio}\n` +
      `scene ${e.scenes.currentId ?? '-'}  look ${e.post.lookName}` +
      (s.errors ? `\nERRORS ${s.errors}` : '');
  }

  private drawGraph(): void {
    const g = this.ctx;
    if (!g) return;
    g.clearRect(0, 0, GRAPH_W, GRAPH_H);
    g.fillStyle = 'rgba(127,233,255,0.12)';
    const y60 = GRAPH_H - (16.7 / 50) * GRAPH_H;
    g.fillRect(0, y60, GRAPH_W, 1);
    for (let i = 0; i < GRAPH_W; i++) {
      const ms = this.samples[(this.head + i) % GRAPH_W];
      const h = Math.min(GRAPH_H, (ms / 50) * GRAPH_H);
      g.fillStyle = ms < 18 ? '#6be38f' : ms < 34 ? '#ffd166' : '#ff6b6b';
      g.fillRect(i, GRAPH_H - h, 1, h);
    }
  }
}
