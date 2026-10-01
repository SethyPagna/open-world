/**
 * Scene switching: transition out -> exit old -> await enter new -> hand the scene to post ->
 * precompile its shaders while still covered -> transition in. Calls to `go` are queued, so two
 * quick requests never interleave. Factories run on every visit (fresh scene instance each time).
 */
import type * as THREE from 'three';
import type { Engine, GameScene, SceneManager, TransitionKind } from './api.ts';
import type { TransitionOptions, Transitions } from './transitions.ts';

export interface SceneHost {
  /** Prepare a freshly entered scene for display (aspect, post.setScene, shader warmup). */
  prepare(scene: GameScene): Promise<void>;
}

export class Scenes implements SceneManager {
  readonly transitions: Transitions;
  private readonly engine: Engine;
  private readonly host: SceneHost;
  private readonly factories = new Map<string, (engine: Engine) => GameScene>();
  private _current: GameScene | null = null;
  private queue: Promise<void> = Promise.resolve();
  private pendingOpts: TransitionOptions | null = null;
  private _transitioning = false;
  private _loading = false;
  private _target: string | null = null;
  /** Number of completed scene switches (tests). */
  switches = 0;

  constructor(engine: Engine, transitions: Transitions, host: SceneHost) {
    this.engine = engine;
    this.transitions = transitions;
    this.host = host;
    transitions.onPhaseStart = (kind, phase) => {
      const post = this.engine.post;
      if (kind === 'glitch') post.pulse('glitch', 1, phase === 'out' ? 0.5 : 0.4);
      else if (kind === 'whiteout') post.pulse('flash', phase === 'out' ? 1.4 : 1.1, phase === 'out' ? 0.95 : 1.4);
      else if (kind === 'door' && phase === 'in') post.pulse('chromatic', 0.5, 0.5);
    };
  }

  get current(): GameScene | null {
    return this._current;
  }
  get currentId(): string | null {
    return this._current?.id ?? null;
  }
  /** True from the start of `go` until the reveal finishes. */
  get transitioning(): boolean {
    return this._transitioning;
  }
  /** True while the new scene's `enter` is running (nothing is rendered). */
  get loading(): boolean {
    return this._loading;
  }
  /** The scene id being switched to, if any. */
  get target(): string | null {
    return this._target;
  }
  has(id: string): boolean {
    return this.factories.has(id);
  }
  get ids(): string[] {
    return [...this.factories.keys()];
  }

  register(id: string, factory: (engine: Engine) => GameScene): void {
    this.factories.set(id, factory);
  }

  /** Options (accent colour, iris focus) for the next `go` only. */
  nextTransition(opts: TransitionOptions): void {
    this.pendingOpts = opts;
  }

  go(id: string, params: Record<string, unknown> = {}, transition: TransitionKind = 'fade'): Promise<void> {
    const run = this.queue.then(() => this.switchTo(id, params, transition));
    this.queue = run.catch(() => {});
    return run;
  }

  private async switchTo(id: string, params: Record<string, unknown>, kind: TransitionKind): Promise<void> {
    const factory = this.factories.get(id);
    if (!factory) throw new Error(`Unknown scene "${id}". Registered: ${this.ids.join(', ') || '(none)'}`);
    const opts = this.pendingOpts ?? {};
    this.pendingOpts = null;
    this._transitioning = true;
    this._target = id;
    const t = this.transitions;
    try {
      const old = this._current;
      if (old) await t.out(kind, opts);
      else t.coverNow(kind, opts);

      if (old) {
        this._current = null;
        try {
          old.exit();
        } catch (e) {
          console.error(`[scenes] exit() of "${old.id}" threw`, e);
        }
        this.engine.events.emit('scene:exit', { id: old.id });
      }

      this._loading = true;
      const scene = factory(this.engine);
      await scene.enter(params);
      await this.host.prepare(scene);
      this._loading = false;
      this._current = scene;
      this.switches++;
      this.engine.events.emit('scene:enter', { id: scene.id });
      await t.in(kind, opts);
    } finally {
      this._loading = false;
      this._transitioning = false;
      this._target = null;
    }
  }
}

/**
 * Dispose every geometry, material and texture under `root` (call from `GameScene.exit()`).
 * Shared resources you want to keep can be listed in `keep`.
 */
export function disposeObject(root: THREE.Object3D, keep?: Set<object>): void {
  const seen = new Set<object>();
  const disposeMat = (m: THREE.Material): void => {
    if (seen.has(m) || keep?.has(m)) return;
    seen.add(m);
    for (const v of Object.values(m as unknown as Record<string, unknown>)) {
      const tex = v as THREE.Texture | null;
      if (tex && typeof tex === 'object' && (tex as { isTexture?: boolean }).isTexture && !seen.has(tex) && !keep?.has(tex)) {
        seen.add(tex);
        tex.dispose();
      }
    }
    m.dispose();
  };
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (mesh.geometry && !seen.has(mesh.geometry) && !keep?.has(mesh.geometry)) {
      seen.add(mesh.geometry);
      mesh.geometry.dispose();
    }
    const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
    if (Array.isArray(mat)) mat.forEach(disposeMat);
    else if (mat) disposeMat(mat);
    const inst = o as THREE.InstancedMesh;
    if (inst.isInstancedMesh) inst.dispose();
  });
  const scene = root as THREE.Scene;
  if (scene.isScene) {
    const bg = scene.background as THREE.Texture | null;
    if (bg && (bg as { isTexture?: boolean }).isTexture && !keep?.has(bg)) bg.dispose();
    const env = scene.environment;
    if (env && !keep?.has(env)) env.dispose();
  }
}
