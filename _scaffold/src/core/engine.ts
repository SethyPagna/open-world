/**
 * The runtime: renderer, fixed 60 Hz simulation + variable-rate presentation, hitstop, slow-mo,
 * pause-on-hidden, resize, and the per-frame order every module relies on:
 *
 *   input.update() -> scene.tick() x N (edges consumed by the first tick, then input.endFrame())
 *   -> scene.frame(dt, alpha) -> tweens.update(dt) -> ui.update(dt, camera) -> post.render(dt)
 *
 * `frame` receives dt * timeScale; tweens, UI and post run on real (unscaled) time.
 */
import * as THREE from 'three';
import type { AudioApi, Engine, GameScene, UiApi } from './api.ts';
import { EventHub } from './events.ts';
import { InputManager } from './input.ts';
import { PostStack } from './post.ts';
import { Scenes } from './scene_manager.ts';
import { Transitions } from './transitions.ts';
import { Tweens } from './tween.ts';
import { installTestHooks } from './debug.ts';

export interface EngineDeps { ui: UiApi; audio: AudioApi }

export interface EngineStats {
  fps: number;
  frameMs: number;
  cpuMs: number;
  drawCalls: number;
  triangles: number;
  ticksThisFrame: number;
  totalTicks: number;
  frames: number;
  pixelRatio: number;
  errors: number;
}

export const TICK_RATE = 60;
export const STEP = 1 / TICK_RATE;
const MAX_FRAME_DT = 0.1;

export class GameEngine implements Engine {
  readonly renderer: THREE.WebGLRenderer;
  readonly input: InputManager;
  readonly events: EventHub;
  readonly audio: AudioApi;
  readonly ui: UiApi;
  readonly post: PostStack;
  readonly scenes: Scenes;
  readonly tweens: Tweens;
  readonly transitions: Transitions;
  readonly isTest: boolean;
  readonly params: URLSearchParams;
  readonly container: HTMLElement;
  readonly canvas: HTMLCanvasElement;

  time = 0;
  timeScale = 1;
  /** Freeze the simulation (pause menu) while presentation, UI and post keep running. */
  simPaused = false;
  /** Set the audio listener from the current scene camera every frame. */
  autoListener = true;
  /** Lower the pixel ratio (never below 1) when fps stays low. Off in tests. */
  autoResolution: boolean;
  maxTicksPerFrame = 5;
  readonly stats: EngineStats;

  private acc = 0;
  private hitstopLeft = 0;
  private last = 0;
  private raf = 0;
  private running = false;
  private hidden = false;
  private _w = 1;
  private _h = 1;
  private maxPixelRatio: number;
  private readonly ro: ResizeObserver | null;
  private readonly fallbackCamera = new THREE.PerspectiveCamera();
  private readonly listenerPos = new THREE.Vector3();
  private readonly listenerFwd = new THREE.Vector3();
  private fpsEma = 60;
  private frameMsEma = 16.7;
  private slowTime = 0;
  private sceneAge = 0;
  private errorLog = new Map<string, number>();
  private unloadGuard: ((e: BeforeUnloadEvent) => void) | null = null;
  private readonly cleanups: Array<() => void> = [];

  constructor(container: HTMLElement, deps: EngineDeps) {
    this.container = container;
    this.ui = deps.ui;
    this.audio = deps.audio;
    this.params = new URLSearchParams(location.search);
    this.isTest = this.params.get('test') === '1';
    this.autoResolution = !this.isTest;

    this.renderer = new THREE.WebGLRenderer({ antialias: false, stencil: false, depth: true, alpha: false, powerPreference: 'high-performance' });
    this.maxPixelRatio = this.isTest ? 1 : Math.min(window.devicePixelRatio || 1, 2);
    this.renderer.setPixelRatio(this.maxPixelRatio);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NoToneMapping;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.info.autoReset = false;
    this.canvas = this.renderer.domElement;
    this.canvas.style.cssText = 'display:block;width:100%;height:100%;outline:none;touch-action:none';
    this.canvas.tabIndex = 0;
    if (getComputedStyle(container).position === 'static') container.style.position = 'relative';
    container.insertBefore(this.canvas, container.firstChild);

    this.events = new EventHub();
    this.input = new InputManager(this.canvas, { allowPointerLock: !this.isTest });
    this.tweens = new Tweens();
    this.post = new PostStack(this.renderer);
    this.transitions = new Transitions(container, this.ui.root);
    this.scenes = new Scenes(this, this.transitions, { prepare: (s) => this.prepareScene(s) });

    this.stats = { fps: 60, frameMs: 16.7, cpuMs: 0, drawCalls: 0, triangles: 0, ticksThisFrame: 0, totalTicks: 0, frames: 0, pixelRatio: this.maxPixelRatio, errors: 0 };

    this.resize();
    this.ro = typeof ResizeObserver === 'function' ? new ResizeObserver(() => this.resize()) : null;
    this.ro?.observe(container);
    const onWinResize = (): void => this.resize();
    window.addEventListener('resize', onWinResize);
    this.cleanups.push(() => window.removeEventListener('resize', onWinResize));

    const onVis = (): void => {
      this.hidden = document.hidden;
      this.last = 0;
      this.acc = 0;
    };
    document.addEventListener('visibilitychange', onVis);
    this.cleanups.push(() => document.removeEventListener('visibilitychange', onVis));

    const unlock = (): void => {
      try {
        this.audio.unlock();
      } catch (e) {
        console.warn('[engine] audio.unlock failed', e);
      }
      for (const t of ['pointerdown', 'keydown', 'touchstart'] as const) window.removeEventListener(t, unlock, true);
    };
    for (const t of ['pointerdown', 'keydown', 'touchstart'] as const) window.addEventListener(t, unlock, true);
    this.cleanups.push(() => {
      for (const t of ['pointerdown', 'keydown', 'touchstart'] as const) window.removeEventListener(t, unlock, true);
    });

    try {
      this.post.warmup();
    } catch (e) {
      console.warn('[engine] post warmup failed', e);
    }
    installTestHooks(this);
    this.start();
  }

  get width(): number {
    return this._w;
  }
  get height(): number {
    return this._h;
  }
  /** True while a hitstop is freezing the simulation. */
  get inHitstop(): boolean {
    return this.hitstopLeft > 0;
  }

  hitstop(seconds: number): void {
    if (seconds > 0) this.hitstopLeft = Math.max(this.hitstopLeft, seconds);
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.last = 0;
    this.raf = requestAnimationFrame(this.loop);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  /** Run `seconds` of frames synchronously at 60 fps (deterministic tests, headless capture). */
  advance(seconds: number): void {
    const n = Math.max(0, Math.round(seconds * TICK_RATE));
    for (let i = 0; i < n; i++) this.runFrame(STEP);
  }

  setPixelRatio(pr: number): void {
    const v = Math.max(0.5, Math.min(pr, 3));
    if (Math.abs(v - this.renderer.getPixelRatio()) < 1e-3) return;
    this.renderer.setPixelRatio(v);
    this.stats.pixelRatio = v;
    this.resize(true);
  }

  /** Ask before the tab closes (Ctrl+W while diving!). Enable while a run is in progress. */
  setUnloadGuard(on: boolean): void {
    if (on && !this.unloadGuard) {
      this.unloadGuard = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = '';
      };
      window.addEventListener('beforeunload', this.unloadGuard);
    } else if (!on && this.unloadGuard) {
      window.removeEventListener('beforeunload', this.unloadGuard);
      this.unloadGuard = null;
    }
  }

  /** A compact state summary for `__TF.report()` and the debug overlay. */
  report(): Record<string, unknown> {
    const s = this.stats;
    const mem = this.renderer.info.memory;
    const t = this.transitions;
    return {
      scene: this.scenes.currentId,
      ticks: s.totalTicks,
      fps: Math.round(s.fps * 10) / 10,
      frames: s.frames,
      time: Math.round(this.time * 1000) / 1000,
      frameMs: Math.round(s.frameMs * 100) / 100,
      drawCalls: s.drawCalls,
      triangles: s.triangles,
      memory: { geometries: mem.geometries, textures: mem.textures, programs: this.renderer.info.programs?.length ?? 0 },
      pixelRatio: s.pixelRatio,
      size: [this._w, this._h],
      transition: { active: t.active, kind: t.kind, phase: t.phase, progress: Math.round(t.progress * 1000) / 1000, covered: t.covered, reducedMotion: t.reducedMotion },
      transitioning: this.scenes.transitioning,
      switches: this.scenes.switches,
      timeScale: this.timeScale,
      hitstop: this.hitstopLeft > 0,
      frameErrors: s.errors,
      look: this.post.lookName,
    };
  }

  dispose(): void {
    this.stop();
    this.ro?.disconnect();
    for (const c of this.cleanups) c();
    this.setUnloadGuard(false);
    const cur = this.scenes.current;
    if (cur) {
      try {
        cur.exit();
      } catch (e) {
        console.error(e);
      }
    }
    this.input.dispose();
    this.post.dispose();
    this.renderer.dispose();
    this.canvas.remove();
    this.transitions.layer.remove();
  }

  // --- internals -------------------------------------------------------------------------------
  private readonly loop = (now: number): void => {
    if (!this.running) return;
    this.raf = requestAnimationFrame(this.loop);
    if (this.hidden) {
      this.last = 0;
      return;
    }
    const raw = this.last ? (now - this.last) / 1000 : STEP;
    this.last = now;
    this.runFrame(Math.min(Math.max(raw, 0), MAX_FRAME_DT), raw);
  };

  private runFrame(dt: number, rawDt = dt): void {
    const t0 = performance.now();
    this.renderer.info.reset();
    this.input.update();
    const scene = this.scenes.current;
    let ticks = 0;
    if (scene) {
      this.sceneAge += dt;
      if (this.simPaused) {
        this.acc = 0;
      } else if (this.hitstopLeft > 0) {
        this.hitstopLeft = Math.max(0, this.hitstopLeft - dt);
      } else {
        this.acc += dt * this.timeScale;
      }
      while (this.acc >= STEP && ticks < this.maxTicksPerFrame) {
        try {
          scene.tick(STEP);
        } catch (e) {
          this.reportError('tick', e);
        }
        this.acc -= STEP;
        this.time += STEP;
        ticks++;
        if (ticks === 1) this.input.endFrame();
      }
      if (this.acc >= STEP) this.acc %= STEP; // drop the backlog instead of spiralling
      const alpha = this.acc / STEP;
      try {
        scene.frame(this.simPaused ? 0 : dt * this.timeScale, alpha);
      } catch (e) {
        this.reportError('frame', e);
      }
    } else {
      this.input.endFrame();
      this.acc = 0;
      this.sceneAge = 0;
    }
    this.tweens.update(dt);
    const cam = scene?.camera ?? this.fallbackCamera;
    if (scene && this.autoListener) {
      cam.getWorldPosition(this.listenerPos);
      cam.getWorldDirection(this.listenerFwd);
      try {
        this.audio.setListener(this.listenerPos, this.listenerFwd);
      } catch (e) {
        this.reportError('audio', e);
      }
    }
    try {
      this.ui.update(dt, cam);
    } catch (e) {
      this.reportError('ui', e);
    }
    if (scene && !this.scenes.loading) {
      try {
        this.post.render(dt);
      } catch (e) {
        this.reportError('post', e);
      }
    }
    // While paused no tick consumes edges; drop them so a press made in a pause menu does not
    // replay on the first tick after resuming. (Hitstop keeps them: a buffered jump should land.)
    if (this.simPaused) this.input.endFrame();

    const s = this.stats;
    s.ticksThisFrame = ticks;
    s.totalTicks += ticks;
    s.frames++;
    s.drawCalls = this.renderer.info.render.calls;
    s.triangles = this.renderer.info.render.triangles;
    s.cpuMs = performance.now() - t0;
    if (rawDt > 0 && rawDt < 1) {
      const k = 1 - Math.exp(-rawDt * 4);
      this.frameMsEma += (rawDt * 1000 - this.frameMsEma) * k;
      this.fpsEma = 1000 / Math.max(1, this.frameMsEma);
    }
    s.frameMs = this.frameMsEma;
    s.fps = this.fpsEma;
    this.adaptResolution(rawDt);
  }

  private adaptResolution(rawDt: number): void {
    if (!this.autoResolution || this.scenes.transitioning || this.sceneAge < 3) {
      this.slowTime = 0;
      return;
    }
    const pr = this.renderer.getPixelRatio();
    if (this.fpsEma < 45 && pr > 1) {
      this.slowTime += Math.min(rawDt, 0.25);
      if (this.slowTime > 3) {
        this.slowTime = 0;
        this.sceneAge = 1; // give the new resolution time to settle
        this.setPixelRatio(Math.max(1, pr - 0.25));
        console.info(`[engine] auto resolution: pixel ratio ${pr} -> ${this.renderer.getPixelRatio()}`);
      }
    } else {
      this.slowTime = Math.max(0, this.slowTime - rawDt);
    }
  }

  /** Log a frame error, muting repeats so one broken scene cannot flood the console. */
  private reportError(where: string, e: unknown): void {
    this.stats.errors++;
    const key = where + ':' + String((e as Error)?.message ?? e);
    const n = this.errorLog.get(key) ?? 0;
    this.errorLog.set(key, n + 1);
    if (n < 3) console.error(`[engine] ${where} threw${n === 2 ? ' (further repeats muted)' : ''}`, e);
  }

  private resize(force = false): void {
    const w = Math.max(1, Math.floor(this.container.clientWidth || window.innerWidth));
    const h = Math.max(1, Math.floor(this.container.clientHeight || window.innerHeight));
    if (!force && w === this._w && h === this._h) return;
    this._w = w;
    this._h = h;
    this.renderer.setSize(w, h, false);
    this.post.setSize(w, h);
    const scene = this.scenes?.current;
    if (scene) this.applyAspect(scene);
  }

  private applyAspect(scene: GameScene): void {
    const cam = scene.camera;
    cam.aspect = this._w / this._h;
    cam.updateProjectionMatrix();
    try {
      scene.onResize?.(this._w, this._h);
    } catch (e) {
      this.reportError('onResize', e);
    }
  }

  private async prepareScene(scene: GameScene): Promise<void> {
    this.applyAspect(scene);
    this.post.setScene(scene.scene, scene.camera);
    this.acc = 0;
    this.sceneAge = 0;
    try {
      const compile = this.renderer.compileAsync(scene.scene, scene.camera);
      await Promise.race([compile, new Promise((r) => setTimeout(r, 2000))]);
    } catch (e) {
      console.warn('[engine] shader precompile failed', e);
    }
  }
}
