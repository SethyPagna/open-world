/**
 * Engine-wide contracts. Every module codes against these interfaces so that modules can be
 * built in parallel. Implementations live in the files named in each section header.
 * Units: metres, seconds, radians. +Y is up. Room origin is its floor centre (y = 0).
 */
import type * as THREE from 'three';

// ---------------------------------------------------------------------------------------------
// Math helpers shared by everything (implemented in core/math.ts)
// ---------------------------------------------------------------------------------------------
export type V3 = THREE.Vector3;
export interface Aabb { min: THREE.Vector3; max: THREE.Vector3 }

// ---------------------------------------------------------------------------------------------
// Seeded RNG (core/rng.ts). Never use Math.random() for gameplay: runs are seed-reproducible.
// ---------------------------------------------------------------------------------------------
export interface Rng {
  readonly seed: number;
  next(): number;                       // [0,1)
  range(min: number, max: number): number;
  int(min: number, maxInclusive: number): number;
  chance(p: number): boolean;
  pick<T>(arr: readonly T[]): T;
  shuffle<T>(arr: T[]): T[];            // in place, returns arr
  weighted<T>(items: readonly T[], weight: (t: T) => number): T;
  fork(label: string | number): Rng;    // independent deterministic sub-stream
}

// ---------------------------------------------------------------------------------------------
// Event bus (core/events.ts). Typed, synchronous.
// ---------------------------------------------------------------------------------------------
export interface GameEvents {
  'scene:enter': { id: string };
  'scene:exit': { id: string };
  'climber:fell': { climberId: string; cause: string };
  'climber:stunned': { climberId: string; seconds: number };
  'climber:grabbed': { byId: string; targetId: string };
  'climber:thrown': { byId: string; targetId: string };
  'climber:emote': { climberId: string; emote: string };
  'room:clear': { roomId: string; byIds: string[] };
  'room:fail': { roomId: string; reason: string };
  'social:oath': { aId: string; bId: string };
  'social:betray': { byId: string; victimId: string; kind: string };
  'social:rescue': { byId: string; victimId: string };
  'economy:earn': { currency: string; amount: number; reason: string };
  'trait:gain': { climberId: string; traitId: string };
  'trait:use': { climberId: string; traitId: string };
  'audience:react': { patronId: string; text: string; delta: number };
  [key: `custom:${string}`]: unknown;
}
export interface EventBus {
  on<K extends keyof GameEvents>(type: K, fn: (e: GameEvents[K]) => void): () => void;
  emit<K extends keyof GameEvents>(type: K, e: GameEvents[K]): void;
}

// ---------------------------------------------------------------------------------------------
// Input (core/input.ts). Raw devices -> named actions. Camera-relative movement is computed by
// PlayerController, not here.
// ---------------------------------------------------------------------------------------------
export type Action =
  | 'jump' | 'dive' | 'grab' | 'interact' | 'trait1' | 'trait2' | 'trait3'
  | 'emote' | 'ping' | 'map' | 'pause' | 'scoreboard' | 'chat' | 'confirm' | 'back';
export interface InputState {
  move: THREE.Vector2;                  // x = right, y = forward, length <= 1 (keyboard or stick)
  look: THREE.Vector2;                  // mouse delta (px) or right stick this frame
  pointer: THREE.Vector2;               // normalized device coords of mouse
  down(a: Action): boolean;
  pressed(a: Action): boolean;          // true only on the frame it went down
  released(a: Action): boolean;
  readonly usingGamepad: boolean;
}
export interface Input extends InputState {
  update(): void;                       // called by Engine once per frame BEFORE ticks
  endFrame(): void;                     // clears pressed/released edges after the first tick consumed them
  bindings(): Record<Action, string[]>;
  rebind(a: Action, codes: string[]): void;
  enabled: boolean;                     // false while a text field / modal owns the keyboard
}

// ---------------------------------------------------------------------------------------------
// Engine & scenes (core/engine.ts, core/scene_manager.ts)
// Fixed 60 Hz simulation (tick) + variable-rate presentation (frame).
// ---------------------------------------------------------------------------------------------
export interface Engine {
  readonly renderer: THREE.WebGLRenderer;
  readonly input: Input;
  readonly events: EventBus;
  readonly audio: AudioApi;
  readonly ui: UiApi;
  readonly post: PostApi;
  readonly scenes: SceneManager;
  readonly isTest: boolean;             // ?test=1 (headless harness): lower pixel ratio, no pointer lock
  readonly params: URLSearchParams;
  time: number;                         // seconds of simulated time since boot
  timeScale: number;                    // slow-mo (1 = normal)
  hitstop(seconds: number): void;       // freeze ticks briefly for impact
  readonly width: number;
  readonly height: number;
}
export interface GameScene {
  readonly id: string;
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  enter(params: Record<string, unknown>): void | Promise<void>;
  exit(): void;                         // dispose everything created in enter()
  tick(dt: number): void;               // fixed step, dt = 1/60
  frame(dt: number, alpha: number): void; // every rendered frame; alpha = interpolation
  onResize?(w: number, h: number): void;
}
export type TransitionKind = 'fade' | 'iris' | 'door' | 'whiteout' | 'glitch' | 'none';
export interface SceneManager {
  register(id: string, factory: (engine: Engine) => GameScene): void;
  go(id: string, params?: Record<string, unknown>, transition?: TransitionKind): Promise<void>;
  readonly current: GameScene | null;
}

// ---------------------------------------------------------------------------------------------
// Post-processing (core/post.ts). One composer; scenes pick a look.
// ---------------------------------------------------------------------------------------------
export interface PostLook {
  bloom?: { intensity: number; threshold: number; smoothing?: number; radius?: number };
  vignette?: number;                    // darkness 0..1
  chromatic?: number;                   // 0..0.01 offset
  noise?: number;                       // film grain 0..0.3
  saturation?: number;                  // -1..1
  contrast?: number;                    // -1..1
  exposure?: number;                    // tone-mapping exposure, default 1
  tint?: string;                        // colour grade multiply (hex)
  glitch?: boolean;                     // E-room corruption effect
  depthOfField?: { focusDistance: number; focalLength: number; bokehScale: number } | null;
}
export interface PostApi {
  setScene(scene: THREE.Scene, camera: THREE.Camera): void;
  setLook(look: PostLook, blendSeconds?: number): void;
  pulse(kind: 'flash' | 'chromatic' | 'glitch', strength?: number, seconds?: number): void;
  render(dt: number): void;
}

// ---------------------------------------------------------------------------------------------
// Camera rig (core/camera_rig.ts). Default: 3/4 follow view, ~55 deg pitch, smooth look-ahead.
// ---------------------------------------------------------------------------------------------
export interface CameraShot {
  position: THREE.Vector3; target: THREE.Vector3; fov?: number; duration: number; ease?: EaseName; hold?: number;
}
export interface CameraRig {
  readonly camera: THREE.PerspectiveCamera;
  follow(target: THREE.Object3D | null, opts?: { distance?: number; pitch?: number; yaw?: number; lookAhead?: number; height?: number }): void;
  setBounds(b: Aabb | null): void;      // clamp the focus point inside the room
  shake(strength: number, seconds?: number): void;
  punch(fovDelta: number, seconds?: number): void; // quick FOV kick
  focus(point: THREE.Vector3, seconds: number, zoom?: number): void; // temporary attention shift
  cinematic(shots: CameraShot[]): Promise<void>; // takes over until finished
  readonly yaw: number;                 // used to make WASD camera-relative
  orbit(deltaYaw: number): void;        // Q/E or right-drag rotate (optional per scene)
  update(dt: number): void;
}

// ---------------------------------------------------------------------------------------------
// Tweens & easing (core/tween.ts)
// ---------------------------------------------------------------------------------------------
export type EaseName = 'linear' | 'inQuad' | 'outQuad' | 'inOutQuad' | 'inCubic' | 'outCubic' | 'inOutCubic'
  | 'outBack' | 'inBack' | 'outElastic' | 'outBounce' | 'inOutSine' | 'outExpo' | 'inExpo';
export interface Tweener {
  to<T extends object>(obj: T, props: Partial<Record<keyof T, number>>, seconds: number, ease?: EaseName, delay?: number): Promise<void>;
  call(seconds: number, fn: () => void): void;
  wait(seconds: number): Promise<void>;
  update(dt: number): void;
  clear(): void;
}

// ---------------------------------------------------------------------------------------------
// Physics (world/physics.ts). Custom, deterministic, no library. Static world = oriented boxes +
// vertical cylinders + ramps. Dynamic = spheres/boxes for props. Characters = vertical capsules.
// ---------------------------------------------------------------------------------------------
export type ColliderTag = 'solid' | 'climbable' | 'slippery' | 'bouncy' | 'hazard' | 'water' | 'oneway' | 'noGrab';
export interface StaticCollider {
  id: number;
  kind: 'box' | 'cylinder';
  center: THREE.Vector3;
  half: THREE.Vector3;                  // box half extents (cylinder: x = radius, y = half height)
  rotY: number;                         // yaw only (boxes); ramps are boxes with rotX via `tilt`
  tilt?: number;                        // rotation about local X (ramps)
  tags: Set<ColliderTag>;
  velocity?: THREE.Vector3;             // moving platform velocity (set by owner each tick)
  userData?: unknown;
  enabled: boolean;
}
export interface Body {
  id: number;
  shape: 'sphere' | 'box';
  radius: number;                       // sphere radius (box: bounding)
  half?: THREE.Vector3;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  mass: number;
  restitution: number;
  friction: number;
  gravityScale: number;
  onGround: boolean;
  sleeping: boolean;
  carriedBy: string | null;             // climber id carrying it
  tags: Set<string>;                    // 'throwable', 'heavy', 'fork', ...
  userData?: unknown;
  onHit?: (other: StaticCollider | Body | null, impactSpeed: number) => void;
}
export interface CapsuleState {
  position: THREE.Vector3;              // FEET position
  velocity: THREE.Vector3;
  radius: number;
  height: number;
  onGround: boolean;
  groundNormal: THREE.Vector3;
  groundCollider: StaticCollider | null;
  touchingWall: StaticCollider | null;  // for climbing
  wallNormal: THREE.Vector3;
}
export interface RayHit { point: THREE.Vector3; normal: THREE.Vector3; distance: number; collider: StaticCollider | null; body: Body | null }
export interface Trigger {
  id: number; center: THREE.Vector3; half: THREE.Vector3; radius?: number; // radius => sphere trigger
  onEnter?: (who: string) => void; onExit?: (who: string) => void; enabled: boolean;
}
export interface PhysicsWorld {
  gravity: number;                      // default 24 (snappy platformer feel), rooms may change
  killY: number;                        // below this => fell
  addBox(center: THREE.Vector3, half: THREE.Vector3, opts?: { rotY?: number; tilt?: number; tags?: ColliderTag[]; userData?: unknown }): StaticCollider;
  addCylinder(center: THREE.Vector3, radius: number, halfHeight: number, opts?: { tags?: ColliderTag[]; userData?: unknown }): StaticCollider;
  remove(c: StaticCollider | Body | Trigger): void;
  addBody(opts: Partial<Body> & { shape: 'sphere' | 'box'; position: THREE.Vector3 }): Body;
  addTrigger(opts: Omit<Trigger, 'id' | 'enabled'>): Trigger;
  /** Move a capsule with collide-and-slide, step-up (0.35 m), slope limit (50 deg), moving platform carry. */
  moveCapsule(c: CapsuleState, dt: number, ownerId: string): void;
  raycast(origin: THREE.Vector3, dir: THREE.Vector3, maxDist: number, filter?: (c: StaticCollider | Body) => boolean): RayHit | null;
  overlapSphere(center: THREE.Vector3, radius: number): (StaticCollider | Body)[];
  /** Line of sight between points against solid statics (for gaze monsters etc). */
  visible(a: THREE.Vector3, b: THREE.Vector3): boolean;
  step(dt: number): void;               // integrates bodies, fires triggers for registered movers
  registerMover(id: string, getPos: () => THREE.Vector3): void; // climbers/monsters for triggers
  unregisterMover(id: string): void;
  clear(): void;
  debugDraw?(scene: THREE.Scene): void;
}
export interface Rope {
  readonly points: THREE.Vector3[];
  length: number;                       // rest length (m)
  stiffness: number;
  attachA: () => THREE.Vector3; attachB: () => THREE.Vector3;
  /** Returns the corrective impulses to apply to A and B this tick (tether pull). */
  step(dt: number): { pullA: THREE.Vector3; pullB: THREE.Vector3; tension: number };
  cut(): void;
  readonly isCut: boolean;
}

// ---------------------------------------------------------------------------------------------
// Navigation for bots (world/nav.ts): grid A* built from static colliders of the current room.
// ---------------------------------------------------------------------------------------------
export interface NavGrid {
  build(bounds: Aabb, cellSize?: number): void;
  findPath(from: THREE.Vector3, to: THREE.Vector3): THREE.Vector3[] | null;
  isWalkable(p: THREE.Vector3): boolean;
  nearestWalkable(p: THREE.Vector3): THREE.Vector3;
  randomWalkable(rng: Rng, near?: THREE.Vector3, radius?: number): THREE.Vector3;
}

// ---------------------------------------------------------------------------------------------
// FX (world/fx.ts, world/particles.ts): juice. All presentation-only.
// ---------------------------------------------------------------------------------------------
export type BurstKind = 'dust' | 'spark' | 'confetti' | 'shards' | 'smoke' | 'ember' | 'bubbles' | 'stars' | 'splash'
  | 'glitch' | 'feathers' | 'coins' | 'heal' | 'ice' | 'soundwave' | 'poof';
export interface Fx {
  burst(kind: BurstKind, at: THREE.Vector3, opts?: { count?: number; color?: string; speed?: number; size?: number; spread?: number }): void;
  ring(at: THREE.Vector3, opts?: { color?: string; radius?: number; seconds?: number; width?: number }): void; // shockwave
  beam(from: THREE.Vector3, to: THREE.Vector3, opts?: { color?: string; seconds?: number; width?: number }): void;
  popText(at: THREE.Vector3, text: string, opts?: { color?: string; size?: number; seconds?: number }): void; // floating 3D-anchored text
  flash(color?: string, seconds?: number): void;          // fullscreen
  trail(obj: THREE.Object3D, opts: { color: string; width?: number; length?: number; style?: string }): { stop(): void };
  update(dt: number): void;
  clear(): void;
}

// ---------------------------------------------------------------------------------------------
// Audio (core/audio/*.ts): 100% procedural WebAudio.
// ---------------------------------------------------------------------------------------------
export interface AudioApi {
  unlock(): void;                                       // call on first user gesture
  sfx(name: string, opts?: { at?: THREE.Vector3; volume?: number; pitch?: number }): void;
  music(track: string | null, fadeSeconds?: number): void; // named procedural tracks
  setIntensity(v: number): void;                        // 0..1 dynamic music layering
  setListener(pos: THREE.Vector3, forward: THREE.Vector3): void;
  volumes: { master: number; music: number; sfx: number };
}

// ---------------------------------------------------------------------------------------------
// UI (ui/*.ts): DOM overlay above the canvas. The "System window" visual language.
// ---------------------------------------------------------------------------------------------
export type SystemTone = 'info' | 'quest' | 'warning' | 'reward' | 'danger' | 'glitch' | 'patron';
export interface UiApi {
  readonly root: HTMLElement;
  /** Manhwa-style System window: typed-out text, auto-dismiss unless `wait`. */
  system(opts: { title?: string; lines: string[]; tone?: SystemTone; seconds?: number; wait?: boolean; choices?: string[] }): Promise<number | null>;
  toast(text: string, tone?: SystemTone, seconds?: number): void;
  objective(text: string | null, sub?: string): void;    // pinned objective panel
  timer(seconds: number | null, label?: string): void;   // countdown display
  prompt(text: string | null, key?: string): void;       // "[E] Ring the fork"
  bubble(worldPos: THREE.Vector3, text: string, opts?: { seconds?: number; color?: string; who?: string }): void;
  patronChat(patronName: string, text: string, color: string): void; // audience feed line
  screen(id: string, props?: Record<string, unknown>): void; // open a full-screen menu (shop, wardrobe, codex, settings, pause, results...)
  closeScreen(): void;
  readonly activeScreen: string | null;
  registerScreen(id: string, factory: (props: Record<string, unknown>) => UiScreen): void;
  setHud(visible: boolean): void;
  update(dt: number, camera: THREE.Camera): void;        // positions world-anchored elements
}
export interface UiScreen { el: HTMLElement; onClose?(): void; update?(dt: number): void }
