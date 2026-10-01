/**
 * ?demo=physics : the physics / rope / nav test course, two floating islands over the void at dusk.
 *
 * Stations: steps (0.30 m climbs, 0.50 m blocks), stairs, 30 deg ramp (walk) and 60 deg ramp (slide), pillars
 * and stumps (cylinders), walls (one rotated), a stepping-stone gap and a bridge, a moving platform to a raised
 * island, a climbable wall up to a ledge, a bounce pad, pushable crates and balls, a rope leash to a post and a
 * nav path (A* + string pulling) from the critter to a target beacon.
 *
 * Keys: WASD / arrows move (camera-relative), Space jump (hold = higher), Q/E orbit, G wireframe overlay,
 * R cut / re-tie the rope, T next target (Shift+T random), N autopilot along the nav path, F respawn.
 * `?cam=overview` starts on the wide shot; `?auto=1` starts with the autopilot on.
 *
 * Test hooks: __TF.report() -> { pos, onGround, touchingWall, bodies, fell, rope, nav, ... };
 * __TF.debug.setInput({ x, z, jump } | null) (world-space direction, overrides the keyboard), advance(seconds),
 * teleport(x, y, z), autopilot(on), target(i | [x, y, z]), cutRope(), tieRope(), wire(on), cam(name), respawn().
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { BloomEffect, EffectComposer, EffectPass, RenderPass, ToneMappingEffect, ToneMappingMode, VignetteEffect } from 'postprocessing';
import type { Body, ColliderTag, RayHit, StaticCollider, Trigger } from '../core/api.ts';
import { mergeTestHooks } from '../core/debug.ts';
import { createRng } from '../core/rng.ts';
import { Physics, createCapsule } from '../world/physics.ts';
import type { CapsuleExt } from '../world/physics.ts';
import { VerletRope } from '../world/rope.ts';
import { Nav } from '../world/nav.ts';

// ---------------------------------------------------------------------------------------------
// Tuning
// ---------------------------------------------------------------------------------------------
const STEP = 1 / 60;
const RUN_SPEED = 5.2;
const ACCEL = 34, DECEL = 42, AIR_CONTROL = 0.45;
const JUMP_V = 8.2;               // ~1.4 m apex at gravity 24
const JUMP_CUT = 0.45;            // velocity kept when Space is released early
const FALL_GRAVITY = 1.35;        // snappier descent
const COYOTE = 0.1, JUMP_BUFFER = 0.12;
const CLIMB_SPEED = 3.0;
const ROPE_LENGTH = 20;
const ROPE_SEGMENTS = 20;
const REEL_SPEED = 6;             // winch speed when the leash catches a fall (m/s)
const LEASH_SLACK = 2;            // line kept out beyond the straight distance to the post (m)

const PAL = {
  skyTop: '#141a36', skyMid: '#3c2d57', horizon: '#f2a65a', deep: '#0d0a18', sun: '#ffd7a0',
  stoneTop: '#c4a784', stoneSide: '#6b5e57', rockTop: '#5a4d4b', rockBottom: '#1c1624',
  wallSide: '#7c879b', wallTop: '#c3cad6', stairTop: '#e2d2b6', stairSide: '#857364',
  ramp: '#e0a64a', rampTop: '#f2c46e', steep: '#b8566b', steepTop: '#dc7d8c',
  climb: '#6fa845', climbTop: '#9be05c', wood: '#9a6a44', woodTop: '#c8955f',
  plat: '#5a3fb0', platTop: '#8f74e6', bounce: '#ff6fc8',
  system: '#5ce1e6', gold: '#ffd76a', danger: '#ff3d6e', lantern: '#ffb86b', hemp: '#cdb892',
  body: '#ff9448', belly: '#ffe0bd',
};

// ---------------------------------------------------------------------------------------------
// Entry
// ---------------------------------------------------------------------------------------------
export default function start(): void {
  const params = new URLSearchParams(location.search);
  const isTest = params.get('test') === '1';
  const app = document.getElementById('app') ?? document.body;

  const renderer = new THREE.WebGLRenderer({ antialias: false, stencil: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(isTest ? 1 : Math.min(window.devicePixelRatio, 2));
  renderer.setSize(app.clientWidth || window.innerWidth, app.clientHeight || window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  app.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog('#3a2c4c', 45, 150);
  const camera = new THREE.PerspectiveCamera(45, 16 / 9, 0.1, 900);

  const composer = new EffectComposer(renderer, { frameBufferType: THREE.HalfFloatType, multisampling: 4 });
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new BloomEffect({ mipmapBlur: true, intensity: 1.05, luminanceThreshold: 0.78, luminanceSmoothing: 0.22, radius: 0.72, levels: 8 });
  composer.addPass(new EffectPass(camera, bloom, new ToneMappingEffect({ mode: ToneMappingMode.AGX }), new VignetteEffect({ darkness: 0.55, offset: 0.32 })));

  const lab = new Lab(scene, camera, params);
  const hud = new Hud(app);

  const resize = (): void => {
    const w = app.clientWidth || window.innerWidth, h = app.clientHeight || window.innerHeight;
    renderer.setSize(w, h);
    composer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    lab.onResize(h);
  };
  window.addEventListener('resize', resize);
  resize();

  const keys = new Set<string>();
  window.addEventListener('keydown', (e) => {
    if (e.repeat) { if (e.code.startsWith('Key') || e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault(); return; }
    keys.add(e.code);
    if (e.code === 'Space' || e.code.startsWith('Arrow')) e.preventDefault();
    lab.onKey(e.code, e.shiftKey, hud);
  });
  window.addEventListener('keyup', (e) => keys.delete(e.code));
  window.addEventListener('blur', () => keys.clear());
  lab.keys = keys;

  let acc = 0, last = performance.now(), fps = 60;
  const loop = (now: number): void => {
    requestAnimationFrame(loop);
    const dt = Math.min(0.1, Math.max(0, (now - last) / 1000));
    last = now;
    fps += (1 / Math.max(dt, 1e-3) - fps) * 0.05;
    lab.fps = fps;
    if (!lab.paused) {
      acc += dt;
      let n = 0;
      while (acc >= STEP && n < 5) { lab.tick(STEP, hud); acc -= STEP; n++; }
      if (n === 5) acc = 0;
    }
    lab.frame(dt, acc / STEP);
    hud.update(lab, dt);
    composer.render(dt);
  };
  requestAnimationFrame(loop);

  mergeTestHooks(() => lab.report(), {
    scene,
    physics: lab.physics,
    nav: lab.nav,
    capsule: lab.cap,
    setInput: (v: { x?: number; z?: number; jump?: boolean } | null) => lab.setInput(v),
    /** Run `seconds` of fixed ticks synchronously; `render: false` skips drawing (fast scripted checks). */
    advance: (seconds: number, render = true) => {
      const n = Math.round(seconds / STEP);
      for (let i = 0; i < n; i++) lab.tick(STEP, hud);
      acc = 0;
      if (!render) return lab.report();
      lab.frame(0, 1);
      hud.update(lab, 0);
      composer.render(0);
      return lab.report();
    },
    teleport: (x: number, y: number, z: number) => lab.teleport(x, y, z),
    autopilot: (on = true) => { lab.autopilot = on; return on; },
    target: (t: number | [number, number, number]) => lab.setTarget(t, hud),
    cutRope: () => lab.cutRope(hud),
    tieRope: () => lab.tieRope(hud),
    leash: (metres: number) => lab.setLeash(metres),
    wire: (on?: boolean) => lab.setWire(on ?? !lab.wire),
    cam: (name: string) => lab.setCam(name),
    respawn: () => lab.respawn('debug', hud),
    pause: (on = true) => { lab.paused = on; return on; },
  });
}

// ---------------------------------------------------------------------------------------------
// The lab: world, critter, rope, nav and presentation
// ---------------------------------------------------------------------------------------------
interface Prop { body: Body; mesh: THREE.Object3D; home: THREE.Vector3; px: number; py: number; pz: number; spin: THREE.Quaternion; punch: number }
interface Target { name: string; pos: THREE.Vector3 }

class Lab {
  readonly physics = new Physics();
  readonly nav: Nav;
  readonly cap: CapsuleExt;
  readonly rope: VerletRope;
  keys = new Set<string>();
  fps = 60;
  paused = false;
  autopilot = false;
  wire = false;

  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly spawn = new THREE.Vector3(0, 0, 8);
  private readonly critter: Critter;
  private readonly props: Prop[] = [];
  private readonly platform: StaticCollider;
  private readonly platMesh: THREE.Object3D;
  private readonly platA = new THREE.Vector3(9.2, -0.15, -12);
  private readonly platB = new THREE.Vector3(11.8, 0.85, -12);
  private platPrev = new THREE.Vector3();
  private readonly bouncePad: THREE.Object3D;
  private bouncePunch = 0;
  private readonly post = new THREE.Vector3(1.5, 0, 2.2);
  private readonly postTop = new THREE.Vector3();
  private readonly ropeA = new THREE.Vector3();      // physics anchor (capsule centre line)
  private readonly ropeHead = new THREE.Vector3();   // drawn anchor (interpolated, on the critter's back)
  private leashMax = ROPE_LENGTH;
  private reeling = false;
  private reelT = 0;
  private hangT = 0;
  private groundY = 0;                               // feet height where the critter last stood
  private readonly ropeViz: RopeViz;
  private readonly pathViz: PathViz;
  private readonly beacon: Beacon;
  private readonly dust: Puffs;
  private readonly sparks: Puffs;
  private readonly sun: THREE.DirectionalLight;
  private readonly lanternLight: THREE.PointLight;
  private readonly navDots: THREE.Points;
  private readonly capWire: THREE.LineSegments;
  private readonly targets: Target[];
  private targetIdx = 0;
  private readonly target = new THREE.Vector3();
  private readonly rng = createRng(20260928);
  private readonly params: URLSearchParams;

  // controller state
  private input: { x: number; z: number; jump: boolean } | null = null;
  private jumpHeld = false;
  private coyote = 0;
  private buffer = 0;
  private jumping = false;
  private climbing = false;
  private wasGrounded = true;
  private readonly facing = new THREE.Vector3(0.3, 0, 0.95).normalize();
  private readonly prevPos = new THREE.Vector3();
  private readonly drawPos = new THREE.Vector3();
  private readonly lastSafe = new THREE.Vector3();
  private fell = 0;
  private lastFellCause = '';
  private ticks = 0;
  private path: THREE.Vector3[] | null = null;
  private pathLen = 0;
  private pathAge = 99;
  private apIndex = 1;
  private ropeTension = 0;
  private arrivals = 0;
  private atTarget = false;
  private targetTrigger: Trigger | null = null;

  // camera
  private camYaw = 0.32;
  private camYawGoal = 0.32;
  private camPitch = 0.84;
  private camDist = 12;
  private readonly camFocus = new THREE.Vector3();
  private camMode = 'follow';
  private readonly tmp = new THREE.Vector3();
  private readonly tmp2 = new THREE.Vector3();

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, params: URLSearchParams) {
    this.scene = scene;
    this.camera = camera;
    this.params = params;
    const p = this.physics;
    buildBackdrop(scene);

    // Lights: low warm sun from the west-north-west, cool sky fill, a cool rim from the north.
    const hemi = new THREE.HemisphereLight('#9aa6dc', '#5a3a48', 1.25);
    scene.add(hemi);
    this.sun = new THREE.DirectionalLight('#ffc792', 2.7);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    const sc = this.sun.shadow.camera;
    sc.left = -20; sc.right = 20; sc.top = 20; sc.bottom = -20; sc.near = 1; sc.far = 80;
    this.sun.shadow.bias = -0.0004;
    this.sun.shadow.normalBias = 0.03;
    this.sun.shadow.radius = 3;
    scene.add(this.sun, this.sun.target);
    const rim = new THREE.DirectionalLight('#9cc8ff', 0.55);
    rim.position.set(6, 10, -30);
    scene.add(rim);

    // ----- Static course -----
    const B = new CourseBuilder(scene, p);
    // South island (spawn) and north island, 4 m of void between them.
    B.island(-12, 12, 0, 12, 0, 101);
    B.island(-12, 8, -17, -4, 0, 202);
    B.island(13, 19, -17, -7, 1.0, 303);
    // Bridge over the gap (nav's walkable link between the islands).
    B.bridge(3.5, 6, -4.2, 0.2);
    // Stepping stones: cylinders over the void.
    B.pillar(-5, -1.2, 0.55, 0.12, 6, 'stoneCyl');
    B.pillar(-5.2, -2.75, 0.55, 0.22, 6, 'stoneCyl');
    // Walls (one rotated) for wall-slide.
    B.box([-10.6, 1, 5.5], [0.3, 1, 3.6], 'wall');
    B.box([-7.6, 0.9, 1.4], [1.6, 0.9, 0.25], 'wall', { rotY: 0.55 });
    // Pillars and a stump (cylinders; the rope wraps around them).
    B.pillar(-5, 5, 0.7, 2.6, 0, 'pillar');
    B.pillar(-2.6, 3.6, 0.42, 1.1, 0, 'pillar');
    B.pillar(-7.8, 9, 0.55, 0.3, 0, 'stump');
    // Step test blocks.
    B.box([4.5, 0.15, 10], [1, 0.15, 1], 'stair');
    B.box([7.4, 0.25, 10], [1, 0.25, 1], 'steep');
    B.label('0.30 m', [4.5, 1.25, 10]);
    B.label('0.50 m', [7.4, 1.35, 10]);
    // Bounce pad.
    this.bouncePad = B.bounce(10, 1.6);
    B.label('BOUNCE', [10, 1.4, 1.6]);
    // Stairs (5 x 0.25 m) to a 1.5 m deck.
    for (let k = 0; k < 5; k++) {
      const top = 0.25 * (k + 1);
      B.box([-9.5, top / 2, -5.25 - 0.5 * k], [1.5, top / 2, 0.25], 'stair');
    }
    B.box([-9.5, 0.75, -10.25], [2, 0.75, 2.75], 'stair');
    B.label('STAIRS', [-9.5, 2.3, -6]);
    // 30 deg ramp to a deck, and a 60 deg ramp against a block (slides).
    B.ramp(-4, -5, 3, 3, 30, 'ramp');
    B.box([-4, 0.866, -10.25], [2, 0.866, 2.25], 'ramp');
    B.label('30°', [-4, 2.4, -6.2]);
    B.ramp(0.8, -5, 2, 1.2, 60, 'steep');
    B.box([0.8, 1.04, -7.6], [1, 1.04, 1.4], 'steep');
    B.label('60° SLIDE', [0.8, 3.0, -5.9]);
    // Climbable wall up to a 3 m ledge.
    B.climbWall(4.8, -9, 2.2, 3.0, 4);
    B.label('CLIMB', [4.8, 3.9, -8.6]);
    // Raised east island reached by the moving platform.
    B.label('MOVING', [10.5, 2.4, -12]);
    B.lanternPost(14.5, -8, 1.0);
    B.lanternPost(-11, 11, 0);
    B.lanternPost(-11.3, -16.2, 0);
    // Rope post.
    B.ropePost(this.post.x, this.post.z);
    this.postTop.set(this.post.x, 1.45, this.post.z);

    // Nav snapshot of the static world (before the moving platform exists).
    this.nav = new Nav(p);
    this.nav.build({ min: new THREE.Vector3(-13, -1, -18), max: new THREE.Vector3(20, 5, 13) });
    this.navDots = buildNavDots(this.nav);
    this.navDots.visible = false;
    scene.add(this.navDots);

    // Moving platform (animated each tick; velocity set so riders are carried).
    this.platform = p.addBox(this.platA.clone(), new THREE.Vector3(1.2, 0.15, 1.2), { tags: ['solid'] });
    this.platform.velocity = new THREE.Vector3();
    this.platMesh = B.platformMesh(1.2, 0.15, 1.2);
    this.platPrev.copy(this.platA);

    // ----- Props -----
    const crate = (x: number, y: number, z: number, s = 0.4, mass = 14): void => {
      const half = new THREE.Vector3(s, s, s);
      const body = p.addBody({ shape: 'box', position: new THREE.Vector3(x, y, z), half, mass, restitution: 0.15, friction: 0.7, tags: new Set(['crate']) });
      this.addProp(body, B.crateMesh(s));
    };
    const ball = (x: number, y: number, z: number, r: number, color: string, mass: number): void => {
      const body = p.addBody({ shape: 'sphere', position: new THREE.Vector3(x, y, z), radius: r, mass, restitution: 0.55, friction: 0.5, tags: new Set(['ball']) });
      this.addProp(body, B.ballMesh(r, color));
    };
    crate(8, 0.4, 4.2); crate(8.85, 0.4, 4.2); crate(8.42, 1.2, 4.2); crate(7.6, 0.4, 6.4, 0.3, 8);
    crate(-3.4, 2.1, -10.8, 0.35, 10);
    ball(6.2, 0.35, 6, 0.35, '#4fc3f7', 5); ball(10.2, 0.35, 7.5, 0.35, '#ffd166', 5); ball(9.3, 0.6, 9.2, 0.6, '#ff6b2c', 22);
    ball(-4.6, 2.2, -7.6, 0.3, '#8bd450', 4);
    B.label('PUSH', [8.4, 2.4, 4.2]);

    // ----- Critter -----
    this.cap = createCapsule(this.spawn);
    this.cap.mass = 60;
    this.critter = new Critter();
    scene.add(this.critter.root);
    this.prevPos.copy(this.spawn);
    this.lastSafe.copy(this.spawn);
    this.physics.registerMover('player', () => this.cap.position);

    // ----- Rope leash to the post -----
    this.rope = new VerletRope({
      attachA: () => this.ropeA, attachB: () => this.postTop, length: ROPE_LENGTH, segments: ROPE_SEGMENTS,
      physics: p, invMassA: 1, invMassB: 0, radius: 0.05, maxPull: 14,
    });
    this.updateRopeAnchor();
    this.relayRope();
    for (let i = 0; i < 90; i++) this.rope.step(STEP); // let it settle on the ground
    this.ropeViz = new RopeViz(scene, ROPE_SEGMENTS);

    // ----- Nav path, beacon, FX -----
    this.pathViz = new PathViz(scene);
    this.beacon = new Beacon(scene);
    this.dust = new Puffs(scene, 220, '#f3e2cc', { gravity: -1.2, drag: 3.2, grow: 1.6, additive: false, opacity: 0.55 });
    this.sparks = new Puffs(scene, 220, '#ffd08a', { gravity: 7, drag: 1.2, grow: -0.6, additive: true, opacity: 1, hdr: 3 });
    this.targets = [
      { name: 'Ramp deck', pos: new THREE.Vector3(-4, 1.732, -10.5) },
      { name: 'Stair deck', pos: new THREE.Vector3(-9.5, 1.5, -11) },
      { name: 'Crate corner', pos: new THREE.Vector3(10.5, 0, 10.5) },
      { name: 'Ledge (climb only)', pos: new THREE.Vector3(4.8, 3.0, -11) },
      { name: 'East island (platform)', pos: new THREE.Vector3(16, 1.0, -12) },
      { name: 'Stepping stones', pos: new THREE.Vector3(-8, 0, -6) },
    ];
    this.setTarget(0, null);

    // A sphere trigger around the target counts arrivals (moved with the target).
    this.targetTrigger = p.addTrigger({ center: this.target, half: new THREE.Vector3(0.9, 0.9, 0.9), radius: 0.9,
      onEnter: () => { this.arrivals++; this.atTarget = true; this.sparks.burst(this.target.x, this.target.y + 0.6, this.target.z, 34, 4.5, 3, 0.12, 0.9); },
      onExit: () => { this.atTarget = false; } });

    // Debug capsule outline.
    const cg = new THREE.CapsuleGeometry(0.4, 0.4, 3, 10);
    cg.translate(0, 0.6, 0);
    this.capWire = new THREE.LineSegments(new THREE.WireframeGeometry(cg), new THREE.LineBasicMaterial({ color: '#fff1c1', transparent: true, opacity: 0.8, depthTest: false }));
    cg.dispose();
    this.capWire.renderOrder = 1000;
    this.capWire.visible = false;
    scene.add(this.capWire);

    this.lanternLight = new THREE.PointLight('#ffb86b', 5, 7, 2);
    scene.add(this.lanternLight);

    this.physics.debugDraw(scene);
    this.physics.setDebugVisible(false);

    if (params.get('auto') === '1') this.autopilot = true;
    this.setCam(params.get('cam') ?? 'follow');
    this.camFocus.copy(this.spawn);
    this.snapCamera();
  }

  private addProp(body: Body, mesh: THREE.Object3D): void {
    this.scene.add(mesh);
    const prop: Prop = { body, mesh, home: body.position.clone(), px: body.position.x, py: body.position.y, pz: body.position.z, spin: new THREE.Quaternion(), punch: 0 };
    body.onHit = (_other, speed) => {
      if (speed < 2.2) return;
      prop.punch = Math.min(1, speed / 8);
      const b = prop.body;
      this.dust.burst(b.position.x, b.position.y - b.radius * 0.5, b.position.z, Math.min(14, 3 + speed * 1.5) | 0, 1.2 + speed * 0.15, 0.6, 0.16, 0.6);
    };
    this.props.push(prop);
  }

  onResize(h: number): void {
    const s = h * 0.5 * this.camera.projectionMatrix.elements[5];
    this.dust.setScale(s);
    this.sparks.setScale(s);
  }

  // ---------------------------------------------------------------------------------------------
  // Input / commands
  // ---------------------------------------------------------------------------------------------
  onKey(code: string, shift: boolean, hud: Hud): void {
    if (code === 'KeyG') this.setWire(!this.wire);
    else if (code === 'KeyR') { if (this.rope.isCut) this.tieRope(hud); else this.cutRope(hud); }
    else if (code === 'KeyT') this.setTarget(shift ? -1 : (this.targetIdx + 1) % this.targets.length, hud);
    else if (code === 'KeyN') { this.autopilot = !this.autopilot; hud.toast(this.autopilot ? 'AUTOPILOT · following the nav path' : 'AUTOPILOT OFF'); }
    else if (code === 'KeyF') this.respawn('respawn', hud);
    else if (code === 'KeyC') this.setCam(this.camMode === 'follow' ? 'overview' : 'follow');
    if (code === 'KeyQ') this.camYawGoal -= Math.PI / 4;
    if (code === 'KeyE') this.camYawGoal += Math.PI / 4;
  }

  setInput(v: { x?: number; z?: number; jump?: boolean } | null): object | null {
    this.input = v ? { x: v.x ?? 0, z: v.z ?? 0, jump: !!v.jump } : null;
    return this.input;
  }

  setWire(on: boolean): boolean {
    this.wire = on;
    this.physics.setDebugVisible(on);
    this.navDots.visible = on;
    this.capWire.visible = on;
    return on;
  }

  setCam(name: string): string {
    this.camMode = name === 'overview' ? 'overview' : 'follow';
    if (this.camMode === 'overview') { this.camYawGoal = 0.38; this.camPitch = 0.9; this.camDist = 42; }
    else { this.camPitch = 0.86; this.camDist = 12; }
    return this.camMode;
  }

  teleport(x: number, y: number, z: number): object {
    this.cap.position.set(x, y, z);
    this.cap.velocity.set(0, 0, 0);
    this.prevPos.copy(this.cap.position);
    this.climbing = false;
    this.reeling = false; this.hangT = 0; this.groundY = y;
    this.updateRopeAnchor();
    if (!this.rope.isCut) this.relayRope();
    else this.rope.syncAnchors();
    this.pathAge = 99;
    return this.report();
  }

  /** Re-lay the leash between the critter and the post, long enough that it starts slack. */
  private relayRope(): void {
    const d = this.ropeA.distanceTo(this.postTop);
    this.leashMax = Math.max(ROPE_LENGTH, d + 1);
    this.rope.length = Math.min(this.leashMax, d + LEASH_SLACK);
    this.rope.reset();
  }

  cutRope(hud: Hud | null): boolean {
    if (this.rope.isCut) return false;
    const k = ROPE_SEGMENTS >> 1;
    const mid = this.rope.points[k];
    this.rope.cut(k);
    this.reeling = false;
    this.sparks.burst(mid.x, mid.y, mid.z, 40, 5, 2, 0.1, 0.8);
    hud?.toast('ROPE CUT');
    return true;
  }

  /** Change the leash's full length (it re-tensions immediately if the critter is further away). */
  setLeash(metres: number): number {
    this.leashMax = Math.max(1.5, metres);
    if (this.rope.length > this.leashMax) { this.rope.length = this.leashMax; this.rope.reset(); }
    return this.leashMax;
  }

  tieRope(hud: Hud | null): boolean {
    this.rope.mend();
    this.updateRopeAnchor();
    this.relayRope();
    hud?.toast('ROPE TIED · leash ' + this.rope.length.toFixed(1) + ' m');
    return true;
  }

  setTarget(t: number | [number, number, number], hud: Hud | null): object {
    if (Array.isArray(t)) { this.target.set(t[0], t[1], t[2]); this.targetIdx = -1; }
    else if (t < 0) {
      const q = this.nav.randomWalkable(this.rng);
      this.target.copy(q);
      this.targetIdx = this.targetIdx < 0 ? 0 : this.targetIdx;
    } else {
      this.targetIdx = t % this.targets.length;
      this.target.copy(this.targets[this.targetIdx].pos);
    }
    this.targetTrigger?.center.copy(this.target);
    this.pathAge = 99;
    this.apIndex = 1;
    this.refreshPath();
    hud?.toast('TARGET · ' + this.targetName() + (this.path ? '' : ' · NO ROUTE'));
    return { target: this.target.toArray(), reachable: !!this.path };
  }

  private targetName(): string {
    return this.targetIdx >= 0 && this.targets[this.targetIdx].pos.equals(this.target) ? this.targets[this.targetIdx].name : 'random';
  }

  respawn(cause: string, hud: Hud | null): void {
    if (cause !== 'debug' && cause !== 'respawn') { this.fell++; this.lastFellCause = cause; }
    this.dust.burst(this.cap.position.x, Math.max(this.cap.position.y, -2), this.cap.position.z, 10, 2, 1, 0.3, 0.8);
    const at = cause === 'void' ? this.lastSafe : this.spawn;
    this.teleport(at.x, at.y + 0.02, at.z);
    this.critter.squash(-0.3);
    this.sparks.burst(at.x, at.y + 0.6, at.z, 26, 3.2, 2.2, 0.1, 0.7);
    if (hud && cause === 'void') hud.toast('FELL INTO THE VOID · respawned', 'danger');
  }

  // ---------------------------------------------------------------------------------------------
  // Simulation (fixed 60 Hz)
  // ---------------------------------------------------------------------------------------------
  tick(dt: number, hud: Hud): void {
    this.ticks++;
    const t = this.ticks * dt;
    // Moving platform: analytic ping-pong; velocity set so the physics carries riders.
    const u = 0.5 - 0.5 * Math.cos((t * Math.PI * 2) / 8);
    const plat = this.platform;
    this.platPrev.copy(plat.center);
    this.tmp.lerpVectors(this.platA, this.platB, u);
    plat.velocity!.copy(this.tmp).sub(plat.center).multiplyScalar(1 / dt);
    plat.center.copy(this.tmp);

    this.prevPos.copy(this.cap.position);
    for (const pr of this.props) { pr.px = pr.body.position.x; pr.py = pr.body.position.y; pr.pz = pr.body.position.z; }

    this.controller(dt, hud);
    this.physics.step(dt);

    // Rope: pull the critter back toward the post.
    this.updateRopeAnchor();
    this.leash(dt, hud);
    const res = this.rope.step(dt);
    this.ropeTension = res.tension;
    if (!this.rope.isCut && res.tension > 0) {
      const pull = res.pullA;
      if (this.cap.onGround && pull.y > 0) pull.y = 0;
      this.cap.velocity.add(pull);
      if (res.tension > 1.05 && this.ticks % 9 === 0) this.dust.burst(this.cap.position.x, this.cap.position.y + 0.05, this.cap.position.z, 2, 0.8, 0.3, 0.12, 0.4);
    }

    // Props that fall off the world come home.
    for (const pr of this.props) {
      const b = pr.body;
      if (b.position.y < this.physics.killY) {
        b.position.copy(pr.home); b.velocity.set(0, 0, 0); this.physics.wake(b);
        pr.px = b.position.x; pr.py = b.position.y; pr.pz = b.position.z;
        this.sparks.burst(pr.home.x, pr.home.y, pr.home.z, 18, 2.5, 1.5, 0.08, 0.6);
      }
    }

    // Re-plan 5x a second; mid-jump the start is off the grid, so keep the last plan until landing.
    if (++this.pathAge >= 12 && (this.cap.onGround || this.climbing || !this.path || this.pathAge > 90)) this.refreshPath();
  }

  private controller(dt: number, hud: Hud): void {
    const c = this.cap, v = c.velocity;
    // Desired direction (world space).
    let mx = 0, mz = 0, jumpDown = false;
    if (this.input) { mx = this.input.x; mz = this.input.z; jumpDown = this.input.jump; }
    else {
      const k = this.keys;
      const ix = (k.has('KeyD') || k.has('ArrowRight') ? 1 : 0) - (k.has('KeyA') || k.has('ArrowLeft') ? 1 : 0);
      const iy = (k.has('KeyW') || k.has('ArrowUp') ? 1 : 0) - (k.has('KeyS') || k.has('ArrowDown') ? 1 : 0);
      const sy = Math.sin(this.camYaw), cy = Math.cos(this.camYaw);
      mx = ix * cy - iy * sy; mz = -ix * sy - iy * cy;
      jumpDown = k.has('Space');
    }
    if (this.autopilot && !this.input && mx === 0 && mz === 0) { const d = this.autopilotDir(); mx = d.x; mz = d.z; }
    const ml = Math.hypot(mx, mz);
    if (ml > 1) { mx /= ml; mz /= ml; }
    const pressed = jumpDown && !this.jumpHeld;
    this.jumpHeld = jumpDown;

    const grounded = c.onGround;
    this.coyote = grounded ? COYOTE : this.coyote - dt;
    this.buffer = pressed ? JUMP_BUFFER : this.buffer - dt;

    // Climbing: push into a 'climbable' wall.
    const wall = c.touchingWall;
    const into = wall ? -(mx * c.wallNormal.x + mz * c.wallNormal.z) : 0;
    const canClimb = !!wall && wall.tags.has('climbable') && into > 0.35;
    if (canClimb && !this.climbing && (!grounded || into > 0.6)) { this.climbing = true; this.jumping = false; }
    if (this.climbing) {
      if (!canClimb) {
        this.climbing = false;
        if (into > 0.2 || (mx !== 0 || mz !== 0)) {
          // Topped out (or let go while pushing): mantle hop over the lip.
          v.y = 6.2; v.x = mx * 2.4; v.z = mz * 2.4;
          this.critter.squash(0.22);
        }
      } else if (pressed) {
        this.climbing = false;
        v.x = c.wallNormal.x * 5.5; v.z = c.wallNormal.z * 5.5; v.y = JUMP_V * 0.9;
        this.buffer = 0; this.jumping = true;
        this.critter.squash(0.3);
      } else {
        const nx = c.wallNormal.x, nz = c.wallNormal.z;
        const side = mx * -nz + mz * nx; // along the wall
        v.x = -nx * 1.2 + -nz * side * 1.6; v.z = -nz * 1.2 + nx * side * 1.6;
        v.y = CLIMB_SPEED * Math.min(1, into * 1.4);
        c.gravityScale = 0;
        if (this.ticks % 10 === 0) this.dust.burst(c.position.x - nx * 0.4, c.position.y + 0.4, c.position.z - nz * 0.4, 1, 0.5, 0, 0.1, 0.4);
      }
    }
    if (!this.climbing) {
      // Horizontal: accelerate toward the target velocity (reduced authority in the air).
      const tx = mx * RUN_SPEED, tz = mz * RUN_SPEED;
      const a = (ml > 0.01 ? ACCEL : DECEL) * (grounded ? 1 : AIR_CONTROL) * dt;
      const dx = tx - v.x, dz = tz - v.z, dl = Math.hypot(dx, dz);
      if (dl <= a) { v.x = tx; v.z = tz; } else { v.x += (dx / dl) * a; v.z += (dz / dl) * a; }
      if (this.buffer > 0 && this.coyote > 0) {
        v.y = JUMP_V;
        this.coyote = 0; this.buffer = 0; this.jumping = true;
        this.critter.squash(0.28);
        this.dust.burst(c.position.x, c.position.y + 0.05, c.position.z, 7, 1.6, 0.4, 0.14, 0.5);
      }
      if (this.jumping && !jumpDown && v.y > 0) { v.y *= JUMP_CUT; this.jumping = false; }
      if (v.y <= 0) this.jumping = false;
      c.gravityScale = v.y < 0 ? FALL_GRAVITY : 1;
    }

    this.physics.moveCapsule(c, dt, 'player');

    if (c.onGround && !this.wasGrounded) {
      const s = c.landingSpeed ?? 0;
      if (s > 3) {
        this.critter.squash(-Math.min(0.34, s * 0.028));
        this.dust.burst(c.position.x, c.position.y + 0.04, c.position.z, Math.min(18, 4 + s) | 0, 1.4 + s * 0.12, 0.3, 0.16, 0.6);
      }
    }
    if (c.bounced) {
      this.bouncePunch = 1;
      this.critter.squash(0.34);
      this.sparks.burst(c.position.x, c.position.y + 0.1, c.position.z, 24, 4, 2.5, 0.09, 0.7);
      hud.toast('BOUNCE!');
    }
    this.wasGrounded = c.onGround;
    if (c.onGround) this.groundY = c.position.y;
    if (c.onGround && c.groundCollider && !c.groundCollider.velocity && c.groundNormal.y > 0.95) this.lastSafe.copy(c.position);
    if (c.position.y < this.physics.killY) this.respawn('void', hud);

    if (Math.hypot(v.x, v.z) > 0.3 && !this.climbing) this.facing.set(v.x, 0, v.z).normalize();
    else if (this.climbing) this.facing.set(-c.wallNormal.x, 0, -c.wallNormal.z);
  }

  private autopilotDir(): THREE.Vector3 {
    const out = this.tmp2.set(0, 0, 0);
    const path = this.path;
    if (!path || path.length < 2) return out;
    const p = this.cap.position;
    while (this.apIndex < path.length - 1 && Math.hypot(path[this.apIndex].x - p.x, path[this.apIndex].z - p.z) < 0.45) this.apIndex++;
    const w = path[Math.min(this.apIndex, path.length - 1)];
    const dx = w.x - p.x, dz = w.z - p.z, d = Math.hypot(dx, dz);
    if (this.apIndex >= path.length - 1 && d < 0.3) return out;
    const s = Math.min(1, d / 0.8);
    return out.set((dx / d) * s, 0, (dz / d) * s);
  }

  private refreshPath(): void {
    this.pathAge = 0;
    const from = this.cap.position;
    const path = this.nav.findPath(from, this.target);
    this.path = path;
    this.apIndex = 1;
    this.pathLen = 0;
    if (path) for (let i = 1; i < path.length; i++) this.pathLen += path[i].distanceTo(path[i - 1]);
    this.pathViz.setPath(path, this.physics);
    this.beacon.setReachable(!!path);
  }

  /**
   * A retractable leash: it pays out as the critter walks or jumps away and brakes when it falls. A critter left
   * dangling below where it last stood is winched back up by the post.
   */
  private leash(dt: number, hud: Hud): void {
    const rope = this.rope, c = this.cap;
    if (rope.isCut) { this.reeling = false; this.hangT = 0; return; }
    const below = c.position.y < this.groundY - 0.4;
    if (!this.reeling) {
      const hanging = !c.onGround && !this.climbing && c.position.y < this.groundY - 1.0 && this.ropeTension >= 1;
      this.hangT = hanging ? this.hangT + dt : 0;
      if (this.hangT > 0.3) {
        this.reeling = true; this.reelT = 0;
        hud.toast('TETHER CAUGHT YOU · reeling in');
      }
    }
    if (this.reeling) {
      this.reelT += dt;
      rope.length = Math.max(1.2, rope.length - REEL_SPEED * dt);
      if (c.onGround && !below) this.reeling = false;
      else if (this.reelT > 8) { this.reeling = false; this.respawn('void', hud); }
    } else if (!below) {
      // Keep LEASH_SLACK of line out beyond the straight distance: pay out fast, take slack back in slowly.
      const want = Math.min(this.leashMax, this.ropeA.distanceTo(this.postTop) + LEASH_SLACK);
      if (want > rope.length) rope.length = want;
      else if (c.onGround && rope.length > want + 0.5) rope.length = Math.max(want, rope.length - 2.5 * dt);
    }
  }

  private updateRopeAnchor(): void {
    this.ropeA.set(this.cap.position.x, this.cap.position.y + 0.55, this.cap.position.z);
  }

  // ---------------------------------------------------------------------------------------------
  // Presentation (every rendered frame)
  // ---------------------------------------------------------------------------------------------
  frame(dt: number, alpha: number): void {
    const a = Math.min(1, Math.max(0, alpha));
    this.drawPos.lerpVectors(this.prevPos, this.cap.position, a);
    if (this.drawPos.distanceToSquared(this.cap.position) > 4) this.drawPos.copy(this.cap.position);
    const c = this.cap;
    const speed = Math.hypot(c.velocity.x, c.velocity.z);
    this.critter.update(dt, this.drawPos, this.facing, speed, c.onGround, this.climbing, c.velocity.y, this.ropeTension);

    // Moving platform mesh.
    this.platMesh.position.lerpVectors(this.platPrev, this.platform.center, a);

    // Props (spheres roll visually).
    for (const pr of this.props) {
      const b = pr.body;
      pr.mesh.position.set(pr.px + (b.position.x - pr.px) * a, pr.py + (b.position.y - pr.py) * a, pr.pz + (b.position.z - pr.pz) * a);
      if (b.shape === 'sphere' && dt > 0) {
        const vx = b.velocity.x, vz = b.velocity.z, sp = Math.hypot(vx, vz);
        if (sp > 0.02 && b.onGround) {
          this.tmp.set(vz / sp, 0, -vx / sp);
          _q.setFromAxisAngle(this.tmp, (sp * dt) / b.radius);
          pr.spin.premultiply(_q);
          pr.mesh.quaternion.copy(pr.spin);
        }
      }
      pr.punch = Math.max(0, pr.punch - dt * 5);
      const s = 1 + Math.sin(pr.punch * Math.PI) * 0.12;
      pr.mesh.scale.set(s, 2 - s, s);
    }
    this.bouncePunch = Math.max(0, this.bouncePunch - dt * 3.5);
    const bp = this.bouncePunch;
    this.bouncePad.scale.set(1 + bp * 0.18, 1 - Math.sin(bp * Math.PI) * 0.45, 1 + bp * 0.18);

    // Rope (first point follows the interpolated critter).
    this.updateRopeAnchorDraw();
    this.ropeViz.update(this.rope, this.ropeHead, this.ropeTension);

    this.pathViz.update(dt, this.path !== null);
    this.beacon.update(dt, this.target);
    this.dust.update(dt);
    this.sparks.update(dt);

    this.lanternLight.position.set(this.drawPos.x, this.drawPos.y + 1.9, this.drawPos.z);
    this.lanternLight.intensity = 3.5 + Math.sin(performance.now() * 0.004) * 0.25;

    if (this.wire) { this.physics.debugDraw(this.scene); this.capWire.position.copy(this.drawPos); }

    // Camera: smoothed 3/4 follow with slight look-ahead.
    const k = 1 - Math.exp(-dt * 5);
    this.camYaw += (this.camYawGoal - this.camYaw) * (1 - Math.exp(-dt * 8));
    if (this.camMode === 'follow') {
      this.tmp.set(this.drawPos.x + c.velocity.x * 0.18, this.drawPos.y + 0.8, this.drawPos.z + c.velocity.z * 0.18);
    } else this.tmp.set(2.5, 0.5, -3);
    this.camFocus.lerp(this.tmp, dt > 0 ? k : 1);
    this.placeCamera();

    // Shadow frustum follows the focus, snapped to texels (no shimmering).
    const texel = 40 / 2048;
    const fx = Math.round(this.camFocus.x / texel) * texel, fz = Math.round(this.camFocus.z / texel) * texel;
    this.sun.target.position.set(fx, 0, fz);
    this.sun.position.set(fx - 22, 24, fz - 9);
  }

  private updateRopeAnchorDraw(): void {
    this.ropeHead.set(this.drawPos.x - this.facing.x * 0.3, this.drawPos.y + 0.55 * this.critter.stretch, this.drawPos.z - this.facing.z * 0.3);
  }

  private placeCamera(): void {
    const cp = Math.cos(this.camPitch), sp = Math.sin(this.camPitch);
    this.camera.position.set(
      this.camFocus.x + Math.sin(this.camYaw) * cp * this.camDist,
      this.camFocus.y + sp * this.camDist,
      this.camFocus.z + Math.cos(this.camYaw) * cp * this.camDist,
    );
    this.camera.lookAt(this.camFocus);
  }

  private snapCamera(): void {
    this.camYaw = this.camYawGoal;
    if (this.camMode === 'overview') this.camFocus.set(2.5, 0.5, -3);
    this.placeCamera();
  }

  // ---------------------------------------------------------------------------------------------
  // Report
  // ---------------------------------------------------------------------------------------------
  report(): Record<string, unknown> {
    const c = this.cap;
    let awake = 0;
    for (const pr of this.props) if (!pr.body.sleeping) awake++;
    const r3 = (x: number): number => Math.round(x * 1000) / 1000;
    const wall = c.touchingWall;
    return {
      demo: 'physics',
      pos: [r3(c.position.x), r3(c.position.y), r3(c.position.z)],
      vel: [r3(c.velocity.x), r3(c.velocity.y), r3(c.velocity.z)],
      onGround: c.onGround,
      ground: c.groundCollider ? tagOf(c.groundCollider) : c.groundBody ? 'body' : null,
      touchingWall: wall ? tagOf(wall) : null,
      wallNormal: wall ? [r3(c.wallNormal.x), r3(c.wallNormal.z)] : null,
      climbing: this.climbing,
      onSteep: !!c.onSteep,
      bodies: { total: this.props.length, awake, sleeping: this.props.length - awake,
        list: this.props.map((p) => ({ shape: p.body.shape, pos: [r3(p.body.position.x), r3(p.body.position.y), r3(p.body.position.z)], sleeping: p.body.sleeping })) },
      fell: this.fell,
      lastFellCause: this.lastFellCause || null,
      rope: { cut: this.rope.isCut, tension: r3(this.ropeTension), length: r3(this.rope.length), pathLength: r3(this.rope.pathLength), reeling: this.reeling },
      nav: { nodes: this.nav.nodeCount, regions: this.nav.componentCount, buildMs: r3(this.nav.lastBuildMs),
        reachable: !!this.path, pathPoints: this.path?.length ?? 0, pathLength: r3(this.pathLen) },
      target: { name: this.targetName(), pos: this.target.toArray().map(r3), arrivals: this.arrivals, inside: this.atTarget },
      platform: this.platform.center.toArray().map(r3),
      autopilot: this.autopilot,
      wire: this.wire,
      statics: this.physics.staticCount,
      ticks: this.ticks,
      fps: Math.round(this.fps),
    };
  }

  hudLines(): HudLine[] {
    const c = this.cap;
    const f = (x: number): string => (x >= 0 ? ' ' : '') + x.toFixed(2);
    let awake = 0;
    for (const pr of this.props) if (!pr.body.sleeping) awake++;
    const wall = c.touchingWall;
    const rope = this.rope.isCut ? 'cut' : this.reeling ? 'reeling in' : `${this.ropeTension.toFixed(2)} · ${this.rope.length.toFixed(1)} m`;
    return [
      { k: 'pos', v: `${f(c.position.x)} ${f(c.position.y)} ${f(c.position.z)}` },
      { k: 'ground', v: c.onGround ? (c.groundBody ? 'prop' : c.groundCollider?.velocity ? 'moving' : `yes · ${(Math.acos(Math.min(1, c.groundNormal.y)) * 57.3).toFixed(0)}°`) : c.onSteep ? 'sliding' : 'air' },
      { k: 'wall', v: this.climbing ? 'climbing' : wall ? tagOf(wall) : '-', hot: this.climbing },
      { k: 'rope', v: rope, hot: this.ropeTension >= 1 || this.reeling, bar: this.rope.isCut ? undefined : Math.min(1.2, this.ropeTension) / 1.2 },
      { k: 'props', v: `${awake} awake / ${this.props.length}` },
      { k: 'nav', v: this.path ? `${this.pathLen.toFixed(1)} m · ${this.path.length} pts` : 'no route', hot: !this.path },
      { k: 'target', v: this.targetName() },
      { k: 'falls', v: String(this.fell) },
    ];
  }
}

const _q = new THREE.Quaternion();

function tagOf(c: StaticCollider): string {
  for (const t of ['climbable', 'bouncy', 'hazard', 'oneway', 'slippery', 'water'] as ColliderTag[]) if (c.tags.has(t)) return t;
  return c.velocity ? 'platform' : 'solid';
}

interface HudLine { k: string; v: string; hot?: boolean; bar?: number }

// ---------------------------------------------------------------------------------------------
// Course building (colliders + meshes in one place)
// ---------------------------------------------------------------------------------------------
type Look = 'stone' | 'wall' | 'stair' | 'ramp' | 'steep' | 'climb' | 'wood' | 'plat' | 'stoneCyl' | 'pillar' | 'stump';

class CourseBuilder {
  private readonly scene: THREE.Scene;
  private readonly p: Physics;
  private readonly mats = new Map<string, THREE.Material>();

  constructor(scene: THREE.Scene, p: Physics) { this.scene = scene; this.p = p; }

  mat(look: Look): THREE.Material {
    let m = this.mats.get(look);
    if (m) return m;
    const L: Record<Look, [string, string, number, number]> = {
      stone: [PAL.stoneSide, PAL.stoneTop, 0.16, 1], wall: [PAL.wallSide, PAL.wallTop, 0.12, 1], stair: [PAL.stairSide, PAL.stairTop, 0.1, 0.5],
      ramp: [PAL.ramp, PAL.rampTop, 0.14, 1], steep: [PAL.steep, PAL.steepTop, 0.14, 0.5], climb: [PAL.climb, PAL.climbTop, 0.1, 0.5],
      wood: [PAL.wood, PAL.woodTop, 0.25, 0.5], plat: [PAL.plat, PAL.platTop, 0.12, 0.6], stoneCyl: [PAL.stoneSide, PAL.stoneTop, 0.0, 1],
      pillar: [PAL.wallSide, PAL.wallTop, 0.0, 1], stump: [PAL.wood, PAL.woodTop, 0.0, 1],
    };
    const [side, top, line, grid] = L[look];
    m = courseMaterial(side, top, line, grid);
    this.mats.set(look, m);
    return m;
  }

  private mesh(geo: THREE.BufferGeometry, mat: THREE.Material, cast = true): THREE.Mesh {
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = cast; m.receiveShadow = true;
    this.scene.add(m);
    return m;
  }

  box(c: [number, number, number], h: [number, number, number], look: Look, o: { rotY?: number; tilt?: number; tags?: ColliderTag[] } = {}): StaticCollider {
    const col = this.p.addBox(new THREE.Vector3(...c), new THREE.Vector3(...h), { rotY: o.rotY, tilt: o.tilt, tags: o.tags });
    const r = Math.min(0.06, h[0] * 0.5, h[1] * 0.5, h[2] * 0.5);
    const m = this.mesh(new RoundedBoxGeometry(h[0] * 2, h[1] * 2, h[2] * 2, 2, r), this.mat(look));
    m.position.set(...c);
    m.rotation.set(o.tilt ?? 0, o.rotY ?? 0, 0, 'YXZ');
    return col;
  }

  /** Ramp whose top surface starts at ground level (y0) at z0 and rises toward -z. */
  ramp(x: number, z0: number, width: number, horiz: number, deg: number, look: Look, y0 = 0): StaticCollider {
    const t = (deg * Math.PI) / 180, hy = 0.2;
    const hz = horiz / Math.cos(t) / 2;
    const cz = z0 - horiz / 2, cy = y0 + (horiz * Math.tan(t)) / 2;
    // Local up (0, cos t, sin t): push the box down/back by its half thickness.
    return this.box([x, cy - Math.cos(t) * hy, cz - Math.sin(t) * hy], [width / 2, hy, hz], look, { tilt: t });
  }

  island(x0: number, x1: number, z0: number, z1: number, top: number, seed: number): void {
    const hx = (x1 - x0) / 2, hz = (z1 - z0) / 2, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    this.box([cx, top - 0.5, cz], [hx, 0.5, hz], 'stone');
    const depth = 4 + Math.min(hx, hz) * 0.7;
    const rock = rockRoot(hx * 2 - 0.1, hz * 2 - 0.1, depth, seed);
    const m = this.mesh(rock, rockMaterial(), false);
    m.position.set(cx, top - 1, cz);
    // The tapering root is solid too (stacked boxes just inside it): a critter dangling from the leash bumps
    // into the rock and the rope wraps around it instead of passing through.
    const TIERS = 4;
    for (let k = 0; k < TIERS; k++) {
      const t = (k + 0.75) / TIERS;
      const s = 1 - Math.pow(t, 0.8) * 0.94 - 0.09 * t;
      const ex = (hx - 0.05) * s, ez = (hz - 0.05) * s;
      if (Math.min(ex, ez) < 0.3) break;
      this.p.addBox(new THREE.Vector3(cx, top - 1 - depth * (k + 0.5) / TIERS, cz), new THREE.Vector3(ex, depth / TIERS / 2, ez));
    }
  }

  bridge(x0: number, x1: number, z0: number, z1: number): void {
    const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, hx = (x1 - x0) / 2, hz = (z1 - z0) / 2;
    this.p.addBox(new THREE.Vector3(cx, -0.1, cz), new THREE.Vector3(hx, 0.1, hz));
    // Planks (visual) across the span, and two rope rails on posts.
    const n = Math.round((z1 - z0) / 0.36);
    const plank = new RoundedBoxGeometry(hx * 2, 0.16, (z1 - z0) / n - 0.05, 2, 0.03);
    const planks = new THREE.InstancedMesh(plank, this.mat('wood'), n);
    const mtx = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(1, 1, 1), pos = new THREE.Vector3();
    for (let i = 0; i < n; i++) {
      q.setFromEuler(new THREE.Euler(0, (hash2(i, 7) - 0.5) * 0.04, 0));
      pos.set(cx + (hash2(i, 3) - 0.5) * 0.08, -0.08 + (hash2(i, 5) - 0.5) * 0.02, z0 + ((i + 0.5) / n) * (z1 - z0));
      planks.setMatrixAt(i, mtx.compose(pos, q, s));
    }
    planks.castShadow = true; planks.receiveShadow = true;
    this.scene.add(planks);
    const postGeo = new THREE.CylinderGeometry(0.06, 0.07, 0.9, 8);
    const postMat = new THREE.MeshStandardMaterial({ color: '#6e4a31', roughness: 0.8 });
    const railMat = new THREE.MeshStandardMaterial({ color: PAL.hemp, roughness: 0.9 });
    for (const x of [x0 + 0.05, x1 - 0.05]) {
      for (const z of [z0 - 0.1, z1 + 0.1]) {
        const pm = this.mesh(postGeo, postMat);
        pm.position.set(x, 0.45, z);
      }
      const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(x, 0.82, z0 - 0.1), new THREE.Vector3(x, 0.45, cz), new THREE.Vector3(x, 0.82, z1 + 0.1));
      this.mesh(new THREE.TubeGeometry(curve, 24, 0.03, 6, false), railMat);
    }
  }

  pillar(x: number, z: number, r: number, height: number, sink: number, look: Look): StaticCollider {
    const hh = (height + sink) / 2;
    const col = this.p.addCylinder(new THREE.Vector3(x, height - hh, z), r, hh);
    const geo = new THREE.CylinderGeometry(r, r * (sink > 0 ? 0.55 : 1), hh * 2, 28, 1);
    const m = this.mesh(geo, this.mat(look));
    m.position.set(x, height - hh, z);
    // Capstone / bronze band for readability.
    if (look === 'pillar') {
      const band = this.mesh(new THREE.CylinderGeometry(r * 1.08, r * 1.08, 0.12, 28), new THREE.MeshStandardMaterial({ color: '#c08a3e', metalness: 0.9, roughness: 0.35 }));
      band.position.set(x, height - 0.14, z);
    }
    return col;
  }

  bounce(x: number, z: number): THREE.Object3D {
    this.p.addCylinder(new THREE.Vector3(x, 0.12, z), 0.85, 0.12, { tags: ['solid', 'bouncy'] });
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.95, 0.12, 32), new THREE.MeshStandardMaterial({ color: '#4a2a4a', roughness: 0.6 }));
    base.position.y = 0.06; base.receiveShadow = true; base.castShadow = true;
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.85, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: PAL.bounce, roughness: 0.35, emissive: '#ff2fa8', emissiveIntensity: 0.25 }));
    cap.scale.y = 0.18; cap.position.y = 0.1; cap.castShadow = true; cap.receiveShadow = true;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.88, 0.035, 8, 48), glowMaterial('#ff7ad9', 3));
    ring.rotation.x = Math.PI / 2; ring.position.y = 0.13;
    g.add(base, cap, ring);
    this.scene.add(g);
    return g;
  }

  climbWall(x: number, zFace: number, halfW: number, height: number, depth: number): void {
    const col = this.p.addBox(new THREE.Vector3(x, height / 2, zFace - depth / 2), new THREE.Vector3(halfW, height / 2, depth / 2), { tags: ['solid', 'climbable'] });
    void col;
    const m = this.mesh(new RoundedBoxGeometry(halfW * 2, height, depth, 2, 0.06), this.mat('stone'));
    m.position.set(x, height / 2, zFace - depth / 2);
    // Green climbing panel with holds on the face.
    const panel = this.mesh(new RoundedBoxGeometry(halfW * 2 - 0.2, height - 0.15, 0.08, 2, 0.03), this.mat('climb'));
    panel.position.set(x, height / 2 - 0.05, zFace + 0.02);
    const holdGeo = new THREE.DodecahedronGeometry(0.075, 0);
    const holds = new THREE.InstancedMesh(holdGeo, new THREE.MeshStandardMaterial({ color: '#d7f59a', roughness: 0.6, emissive: '#8bd450', emissiveIntensity: 0.25 }), 30);
    const mtx = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), pos = new THREE.Vector3();
    for (let i = 0; i < 30; i++) {
      const u = hash2(i, 11), w = hash2(i, 13);
      pos.set(x - halfW + 0.3 + u * (halfW * 2 - 0.6), 0.25 + w * (height - 0.5), zFace + 0.07);
      q.setFromEuler(new THREE.Euler(hash2(i, 17) * 3, hash2(i, 19) * 3, 0));
      const k = 0.8 + hash2(i, 23) * 0.7;
      s.set(k, k, k * 0.6);
      holds.setMatrixAt(i, mtx.compose(pos, q, s));
    }
    holds.castShadow = true;
    this.scene.add(holds);
  }

  ropePost(x: number, z: number): void {
    this.p.addCylinder(new THREE.Vector3(x, 0.75, z), 0.14, 0.75);
    const wood = this.mesh(new THREE.CylinderGeometry(0.13, 0.15, 1.5, 12), new THREE.MeshStandardMaterial({ color: '#6e4a31', roughness: 0.8 }));
    wood.position.set(x, 0.75, z);
    const brass = new THREE.MeshStandardMaterial({ color: '#c08a3e', metalness: 0.9, roughness: 0.3 });
    const ring = this.mesh(new THREE.TorusGeometry(0.16, 0.035, 8, 24), brass);
    ring.position.set(x, 1.42, z); ring.rotation.x = Math.PI / 2;
    const knob = this.mesh(new THREE.SphereGeometry(0.1, 16, 10), brass);
    knob.position.set(x, 1.55, z);
  }

  lanternPost(x: number, z: number, y: number): void {
    const pole = this.mesh(new THREE.CylinderGeometry(0.05, 0.07, 2.2, 8), new THREE.MeshStandardMaterial({ color: '#3a2c2a', roughness: 0.7 }));
    pole.position.set(x, y + 1.1, z);
    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 10), glowMaterial(PAL.lantern, 4));
    glow.position.set(x, y + 2.3, z);
    const cage = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.36, 6, 1, true), new THREE.MeshStandardMaterial({ color: '#3a2c2a', roughness: 0.6, wireframe: true }));
    cage.position.copy(glow.position);
    const light = new THREE.PointLight(PAL.lantern, 6, 9, 2);
    light.position.set(x, y + 2.3, z);
    this.scene.add(glow, cage, light);
  }

  platformMesh(hx: number, hy: number, hz: number): THREE.Object3D {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new RoundedBoxGeometry(hx * 2, hy * 2, hz * 2, 2, 0.06), this.mat('plat'));
    body.castShadow = true; body.receiveShadow = true;
    const rim = new THREE.Mesh(new THREE.BoxGeometry(hx * 2 + 0.04, 0.05, hz * 2 + 0.04), glowMaterial('#b39bff', 2.6));
    rim.position.y = -hy + 0.04;
    // Little thruster glows underneath.
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const t = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), glowMaterial('#c7b5ff', 5));
      t.position.set(sx * (hx - 0.3), -hy - 0.03, sz * (hz - 0.3));
      g.add(t);
    }
    g.add(body, rim);
    this.scene.add(g);
    return g;
  }

  crateMesh(s: number): THREE.Object3D {
    const m = new THREE.Mesh(new RoundedBoxGeometry(s * 2, s * 2, s * 2, 2, 0.05), crateMaterial());
    m.castShadow = true; m.receiveShadow = true;
    return m;
  }

  ballMesh(r: number, color: string): THREE.Object3D {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 28, 18), ballMaterial(color));
    m.castShadow = true; m.receiveShadow = true;
    return m;
  }

  label(text: string, at: [number, number, number]): void {
    const s = labelSprite(text);
    s.position.set(...at);
    this.scene.add(s);
  }
}

function hash2(a: number, b: number): number {
  let h = Math.imul(a ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(b + 0x632be5ab, 0xc2b2ae35);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12;
  return (h >>> 0) / 4294967296;
}

function hash3(x: number, y: number, z: number): number {
  return hash2(Math.round(x * 97) + Math.round(z * 131) * 7919, Math.round(y * 53));
}

/** Warm stylized surface: lighter tops, faint 1 m world grid, per-tile tint variation. */
function courseMaterial(side: string, top: string, line: number, grid: number): THREE.MeshStandardMaterial {
  const m = new THREE.MeshStandardMaterial({ color: side, roughness: 0.86, metalness: 0 });
  const uTop = { value: new THREE.Color(top) };
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uTop = uTop;
    sh.uniforms.uLine = { value: line };
    sh.uniforms.uGrid = { value: grid };
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWP;\nvarying vec3 vWN;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        vec4 wp4 = vec4(transformed, 1.0);
        vec3 wn3 = objectNormal;
        #ifdef USE_INSTANCING
          wp4 = instanceMatrix * wp4; wn3 = mat3(instanceMatrix) * wn3;
        #endif
        vWP = (modelMatrix * wp4).xyz;
        vWN = normalize(mat3(modelMatrix) * wn3);`);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWP;\nvarying vec3 vWN;\nuniform vec3 uTop;\nuniform float uLine;\nuniform float uGrid;')
      .replace('#include <color_fragment>', `#include <color_fragment>
        vec3 an = abs(vWN);
        vec2 guv = an.y > max(an.x, an.z) ? vWP.xz : (an.x > an.z ? vWP.zy : vWP.xy);
        guv /= uGrid;
        vec2 gw = max(fwidth(guv), vec2(1e-4));
        vec2 gl = abs(fract(guv - 0.5) - 0.5) / gw;
        float gline = 1.0 - min(min(gl.x, gl.y), 1.0);
        float topF = smoothstep(0.55, 0.85, vWN.y);
        diffuseColor.rgb = mix(diffuseColor.rgb, uTop, topF);
        vec2 cell = floor(guv);
        float h = fract(sin(dot(cell, vec2(12.9898, 78.233))) * 43758.5453);
        diffuseColor.rgb *= 0.9 + 0.14 * h;
        vec2 big = floor(guv * 0.5);
        diffuseColor.rgb *= 1.0 - 0.06 * mod(big.x + big.y, 2.0) * topF;
        diffuseColor.rgb *= 1.0 - gline * uLine;
        diffuseColor.rgb *= mix(0.78, 1.0, smoothstep(-0.6, 0.4, vWN.y));`);
  };
  m.customProgramCacheKey = () => 'course-v1';
  return m;
}

let _rockMat: THREE.MeshStandardMaterial | null = null;
function rockMaterial(): THREE.MeshStandardMaterial {
  return (_rockMat ??= new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, flatShading: true }));
}

/** Tileable 5-octave value-noise fbm (period 8 lattice cells at the base octave) in the red channel. */
function cloudNoiseTexture(size = 256): THREE.DataTexture {
  const data = new Uint8Array(size * size * 4);
  const lattice = (x: number, y: number, p: number): number => hash2(((x % p) + p) % p, (((y % p) + p) % p) * 7 + p * 131);
  const vnoise = (u: number, v: number, p: number): number => {
    const ix = Math.floor(u), iy = Math.floor(v);
    let fx = u - ix, fy = v - iy;
    fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
    const a = lattice(ix, iy, p), b = lattice(ix + 1, iy, p), c = lattice(ix, iy + 1, p), d = lattice(ix + 1, iy + 1, p);
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
  };
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    let s = 0, amp = 0.5, p = 8;
    for (let o = 0; o < 5; o++) { s += amp * vnoise((x / size) * p, (y / size) * p, p); p *= 2; amp *= 0.5; }
    const i = (y * size + x) * 4;
    data[i] = data[i + 1] = data[i + 2] = Math.round(Math.min(1, s / 0.97) * 255); data[i + 3] = 255;
  }
  const t = new THREE.DataTexture(data, size, size);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.magFilter = THREE.LinearFilter;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.generateMipmaps = true;
  t.needsUpdate = true;
  return t;
}

/** Faceted rock root under a floating island (top = footprint, tapering to a point). */
function rockRoot(w: number, d: number, depth: number, seed: number): THREE.BufferGeometry {
  const g = new THREE.BoxGeometry(w, depth, d, 6, 5, 6);
  const pos = g.getAttribute('position') as THREE.BufferAttribute;
  const top = new THREE.Color(PAL.rockTop), bot = new THREE.Color(PAL.rockBottom), c = new THREE.Color();
  const col = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const t = 0.5 - y / depth; // 0 at top, 1 at bottom
    const n = hash3(x + seed, y, z);
    const shrink = t <= 0.001 ? 1 : Math.max(0.06, 1 - Math.pow(t, 0.8) * 0.94 + (n - 0.5) * 0.18 * t);
    const ny = t <= 0.001 ? y : y - (n - 0.5) * 0.6 * t;
    pos.setXYZ(i, x * shrink + (t > 0.001 ? (hash3(z, x, seed) - 0.5) * 0.5 * t : 0), ny - depth / 2, z * shrink + (t > 0.001 ? (hash3(seed, z, x) - 0.5) * 0.5 * t : 0));
    c.copy(top).lerp(bot, Math.min(1, t * 1.25));
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const out = g.toNonIndexed();
  g.dispose();
  out.computeVertexNormals();
  return out;
}

function glowMaterial(hex: string, intensity: number, additive = false): THREE.MeshBasicMaterial {
  const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(intensity) });
  if (additive) { m.transparent = true; m.blending = THREE.AdditiveBlending; m.depthWrite = false; }
  return m;
}

function canvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void): THREE.CanvasTexture {
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const g = cv.getContext('2d');
  if (!g) throw new Error('2d canvas unavailable');
  draw(g);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

let _crateMat: THREE.MeshStandardMaterial | null = null;
function crateMaterial(): THREE.MeshStandardMaterial {
  if (_crateMat) return _crateMat;
  const tex = canvasTex(128, 128, (g) => {
    g.fillStyle = '#b07a4a'; g.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 5; i++) { g.fillStyle = i % 2 ? '#a36f42' : '#b88452'; g.fillRect(0, i * 25.6, 128, 25.6); }
    g.strokeStyle = 'rgba(60,35,20,0.55)'; g.lineWidth = 2;
    for (let i = 1; i < 5; i++) { g.beginPath(); g.moveTo(0, i * 25.6); g.lineTo(128, i * 25.6); g.stroke(); }
    g.strokeStyle = '#6e4a31'; g.lineWidth = 14; g.strokeRect(7, 7, 114, 114);
    g.lineWidth = 12; g.beginPath(); g.moveTo(10, 118); g.lineTo(118, 10); g.stroke();
    g.fillStyle = '#d9a441';
    for (const [x, y] of [[10, 10], [118, 10], [10, 118], [118, 118]]) { g.beginPath(); g.arc(x, y, 4, 0, Math.PI * 2); g.fill(); }
  });
  return (_crateMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8 }));
}

const _ballMats = new Map<string, THREE.MeshStandardMaterial>();
function ballMaterial(color: string): THREE.MeshStandardMaterial {
  let m = _ballMats.get(color);
  if (m) return m;
  const tex = canvasTex(128, 64, (g) => {
    g.fillStyle = color; g.fillRect(0, 0, 128, 64);
    g.fillStyle = '#fff4e6';
    g.fillRect(0, 27, 128, 10);
    for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(16 + i * 32, 14, 5, 0, Math.PI * 2); g.fill(); }
  });
  m = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.4 });
  _ballMats.set(color, m);
  return m;
}

function labelSprite(text: string): THREE.Sprite {
  const w = 256, h = 72;
  const tex = canvasTex(w, h, (g) => {
    g.font = '600 30px ui-monospace, Consolas, "Courier New", monospace';
    const tw = Math.min(w - 20, g.measureText(text).width + 36);
    const x0 = (w - tw) / 2;
    g.fillStyle = 'rgba(11,22,48,0.82)';
    roundRect(g, x0, 12, tw, 48, 10); g.fill();
    g.strokeStyle = 'rgba(92,225,230,0.9)'; g.lineWidth = 2.5;
    roundRect(g, x0, 12, tw, 48, 10); g.stroke();
    g.fillStyle = '#e9fbff'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(text, w / 2, 37);
  });
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, fog: false }));
  s.scale.set(2.0, 2.0 * (h / w), 1);
  s.renderOrder = 5;
  return s;
}

function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  g.beginPath();
  g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}

// ---------------------------------------------------------------------------------------------
// Backdrop: dusk sky dome, sun glow, a cloud sea far below, distant floating rocks
// ---------------------------------------------------------------------------------------------
function buildBackdrop(scene: THREE.Scene): void {
  const sunDir = new THREE.Vector3(-1, 0.16, -0.55).normalize();
  const sky = new THREE.Mesh(new THREE.SphereGeometry(600, 32, 20), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: {
      uTop: { value: new THREE.Color(PAL.skyTop) }, uMid: { value: new THREE.Color(PAL.skyMid) },
      uHorizon: { value: new THREE.Color(PAL.horizon) }, uDeep: { value: new THREE.Color(PAL.deep) },
      uSun: { value: new THREE.Color(PAL.sun) }, uSunDir: { value: sunDir },
    },
    vertexShader: 'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position.z = gl_Position.w; }',
    fragmentShader: `varying vec3 vDir; uniform vec3 uTop, uMid, uHorizon, uDeep, uSun; uniform vec3 uSunDir;
      void main(){
        vec3 d = normalize(vDir); float h = d.y;
        vec3 c = mix(uHorizon * 0.62, uMid, smoothstep(0.0, 0.22, h));
        c = mix(c, uTop, smoothstep(0.2, 0.75, h));
        c = mix(c, mix(uMid * 0.55, uDeep, smoothstep(-0.05, -0.45, h)), smoothstep(0.02, -0.12, h));
        float s = max(dot(d, uSunDir), 0.0);
        c += uSun * (pow(s, 12.0) * 0.35 + pow(s, 400.0) * 1.6);
        c += uHorizon * 0.12 * exp(-abs(h) * 14.0);
        gl_FragColor = vec4(c, 1.0);
      }`,
  }));
  sky.renderOrder = -10;
  sky.frustumCulled = false;
  scene.add(sky);

  // Cloud sea: fbm baked once into a tileable texture (4 fetches per pixel instead of 10 noise evaluations).
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1400, 1, 1), new THREE.ShaderMaterial({
    fog: false,
    uniforms: { uTime: { value: 0 }, uNoise: { value: cloudNoiseTexture() }, uLit: { value: new THREE.Color('#e7a17c') }, uShade: { value: new THREE.Color('#2a2040') },
      uFar: { value: new THREE.Color('#5a3b52') }, uSunDir: { value: sunDir } },
    vertexShader: 'varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: `varying vec3 vW; uniform float uTime; uniform sampler2D uNoise; uniform vec3 uLit, uShade, uFar, uSunDir;
      float clouds(vec2 p){ return texture2D(uNoise, p).r * 0.7 + texture2D(uNoise, p * 2.3 + vec2(0.37, 0.61)).r * 0.3; }
      void main(){
        vec2 p = vW.xz * 0.00225 + vec2(uTime * 0.0005, uTime * 0.00025);
        float n = clouds(p), n2 = clouds(p + vec2(0.044, -0.025) + uSunDir.xz * 0.0075);
        float lit = clamp((n - n2) * 3.2 + 0.45, 0.0, 1.0);
        vec3 c = mix(uShade, uLit, lit * smoothstep(0.35, 0.75, n));
        float dist = length(vW.xz - cameraPosition.xz);
        c = mix(c, uFar, smoothstep(60.0, 520.0, dist));
        gl_FragColor = vec4(c * 0.85, 1.0);
      }`,
  }));
  sea.rotation.x = -Math.PI / 2;
  sea.position.y = -42;
  sea.renderOrder = -5;
  sea.onBeforeRender = () => { (sea.material as THREE.ShaderMaterial).uniforms.uTime.value = performance.now() / 1000; };
  scene.add(sea);

  // Distant floating islets for depth.
  const mat = rockMaterial();
  const topMat = new THREE.MeshStandardMaterial({ color: '#8f7a68', roughness: 0.9 });
  const spots: [number, number, number, number][] = [[-46, -6, -40, 7], [38, 3, -58, 9], [-70, 10, -90, 12], [62, -10, -20, 6], [-30, -14, 30, 5], [80, 6, -110, 14], [20, -18, -80, 8]];
  spots.forEach(([x, y, z, s], i) => {
    const g = new THREE.Group();
    const root = new THREE.Mesh(rockRoot(s, s * 0.8, s * 0.9, 900 + i), mat);
    root.position.y = -0.3;
    const top = new THREE.Mesh(new THREE.CylinderGeometry(s * 0.55, s * 0.6, 0.6, 7), topMat);
    top.scale.z = 0.8;
    g.add(root, top);
    g.position.set(x, y, z);
    g.rotation.y = i * 1.3;
    scene.add(g);
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.25 + s * 0.02, 10, 8), glowMaterial(PAL.lantern, 6));
    lamp.position.set(x + s * 0.2, y + 1.2, z);
    scene.add(lamp);
  });
}

// ---------------------------------------------------------------------------------------------
// The critter: placeholder capsule hero with squash & stretch, blinking eyes and a lantern sprout
// ---------------------------------------------------------------------------------------------
class Critter {
  readonly root = new THREE.Group();
  stretch = 1;
  private readonly body = new THREE.Group();
  private readonly eyes: THREE.Object3D[] = [];
  private readonly feet: THREE.Mesh[] = [];
  private readonly sprout = new THREE.Group();
  private squashV = 0;
  private squashX = 0;
  private yaw = 0;
  private walk = 0;
  private blinkT = 2.2;
  private sway = 0;
  private swayV = 0;
  private time = 0;

  constructor() {
    const skin = new THREE.MeshStandardMaterial({ color: PAL.body, roughness: 0.5, emissive: '#ff5a1f', emissiveIntensity: 0.06 });
    const cap = new THREE.Mesh(new THREE.CapsuleGeometry(0.4, 0.4, 8, 24), skin);
    cap.position.y = 0.6; cap.castShadow = true;
    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.3, 20, 14), new THREE.MeshStandardMaterial({ color: PAL.belly, roughness: 0.6 }));
    belly.scale.set(0.95, 1.05, 0.45); belly.position.set(0, 0.5, 0.2);
    const white = new THREE.MeshStandardMaterial({ color: '#fffaf2', roughness: 0.3 });
    const black = new THREE.MeshStandardMaterial({ color: '#1a1220', roughness: 0.2 });
    const shine = new THREE.MeshBasicMaterial({ color: '#ffffff' });
    for (const sx of [-1, 1]) {
      const eye = new THREE.Group();
      const ball = new THREE.Mesh(new THREE.SphereGeometry(0.105, 18, 12), white);
      ball.scale.set(1, 1.15, 0.6);
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.062, 14, 10), black);
      pupil.position.set(0, -0.01, 0.05); pupil.scale.set(1, 1.2, 0.6);
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 6), shine);
      dot.position.set(0.02 * sx, 0.03, 0.085);
      eye.add(ball, pupil, dot);
      eye.position.set(sx * 0.15, 0.86, 0.33);
      eye.rotation.y = sx * 0.25;
      this.eyes.push(eye);
      this.body.add(eye);
      const blush = new THREE.Mesh(new THREE.CircleGeometry(0.055, 16), new THREE.MeshBasicMaterial({ color: '#ff7a8a', transparent: true, opacity: 0.55 }));
      blush.position.set(sx * 0.25, 0.72, 0.34); blush.rotation.y = sx * 0.6;
      this.body.add(blush);
      const foot = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 10), new THREE.MeshStandardMaterial({ color: '#e0692e', roughness: 0.6 }));
      foot.scale.set(1, 0.55, 1.3); foot.position.set(sx * 0.17, 0.06, 0.05); foot.castShadow = true;
      this.feet.push(foot);
      this.root.add(foot);
    }
    const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.025, 0.28, 6), new THREE.MeshStandardMaterial({ color: '#7a5a2a', roughness: 0.7 }));
    stalk.position.y = 0.14;
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 10), glowMaterial(PAL.lantern, 5));
    bulb.position.y = 0.3;
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 6), new THREE.MeshStandardMaterial({ color: '#8bd450', roughness: 0.6 }));
    leaf.scale.set(1.4, 0.3, 0.7); leaf.position.set(0.07, 0.12, 0); leaf.rotation.z = 0.5;
    this.sprout.add(stalk, bulb, leaf);
    this.sprout.position.y = 1.16;
    this.body.add(cap, belly, this.sprout);
    this.root.add(this.body);
  }

  squash(v: number): void { this.squashV += v * 14; }

  update(dt: number, pos: THREE.Vector3, facing: THREE.Vector3, speed: number, grounded: boolean, climbing: boolean, vy: number, tension: number): void {
    this.time += dt;
    this.root.position.copy(pos);
    const goal = Math.atan2(facing.x, facing.z);
    let d = goal - this.yaw;
    d = Math.atan2(Math.sin(d), Math.cos(d));
    this.yaw += d * (1 - Math.exp(-dt * 14));
    this.root.rotation.y = this.yaw;
    // Squash spring (bouncy, underdamped).
    this.squashV += (-this.squashX * 220 - this.squashV * 11) * dt;
    this.squashX += this.squashV * dt;
    // Walk hop and air stretch.
    if (grounded && speed > 0.4) this.walk += dt * (6 + speed * 1.6);
    const hop = grounded && speed > 0.4 ? Math.abs(Math.sin(this.walk)) * 0.07 * Math.min(1, speed / 3) : 0;
    const air = grounded || climbing ? 0 : Math.max(-0.1, Math.min(0.12, vy * 0.012));
    const breathe = Math.sin(this.time * 2.4) * 0.015;
    const s = Math.max(-0.4, Math.min(0.45, this.squashX + air + breathe - tension * 0.03));
    this.stretch = 1 + s;
    this.body.scale.set(1 - s * 0.45, 1 + s, 1 - s * 0.45);
    this.body.position.y = hop;
    this.body.rotation.x = grounded ? Math.min(0.2, speed * 0.03) : climbing ? -0.12 : -vy * 0.012;
    // Feet shuffle.
    const fs = grounded && speed > 0.4 ? Math.sin(this.walk) * 0.12 : 0;
    this.feet[0].position.z = 0.05 + fs; this.feet[1].position.z = 0.05 - fs;
    this.feet[0].position.y = 0.06 + Math.max(0, -fs) * 0.5; this.feet[1].position.y = 0.06 + Math.max(0, fs) * 0.5;
    // Sprout sway follows motion (spring).
    this.swayV += (-(this.sway) * 90 - this.swayV * 7 + (speed * 0.05 + this.squashV * 0.02) * 30) * dt;
    this.sway += this.swayV * dt;
    this.sprout.rotation.x = -Math.max(-0.7, Math.min(0.7, this.sway));
    // Blink.
    this.blinkT -= dt;
    let e = 1;
    if (this.blinkT < 0.12) e = Math.max(0.08, Math.abs(this.blinkT - 0.06) / 0.06);
    if (this.blinkT < 0) this.blinkT = 2.5 + ((this.time * 7.31) % 1) * 2.5;
    for (const eye of this.eyes) eye.scale.y = e;
  }
}

// ---------------------------------------------------------------------------------------------
// Rope tube (rebuilt in place from the Verlet points each frame, no allocations)
// ---------------------------------------------------------------------------------------------
const ROPE_RADIAL = 7;
const ROPE_SUB = 4;

class RopeViz {
  private readonly parts: { mesh: THREE.Mesh; geo: THREE.BufferGeometry; pos: Float32Array; nrm: Float32Array; uv: Float32Array; rings: number }[] = [];
  private readonly mat: THREE.MeshStandardMaterial;
  private readonly hemp = new THREE.Color(PAL.hemp);
  private readonly hot = new THREE.Color('#ff7a3a');
  private readonly pts: THREE.Vector3[] = [];
  private readonly n: number;
  private readonly T = new THREE.Vector3();
  private readonly N = new THREE.Vector3();
  private readonly Bn = new THREE.Vector3();
  private readonly P = new THREE.Vector3();
  private readonly prevP = new THREE.Vector3();

  constructor(scene: THREE.Scene, segments: number) {
    this.n = segments;
    for (let i = 0; i <= segments * ROPE_SUB; i++) this.pts.push(new THREE.Vector3());
    const tex = canvasTex(64, 64, (g) => {
      g.fillStyle = '#ecdcb6'; g.fillRect(0, 0, 64, 64);
      g.strokeStyle = 'rgba(120,92,52,0.45)'; g.lineWidth = 6;
      for (let i = -64; i < 128; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 64, 64); g.stroke(); }
    });
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    this.mat = new THREE.MeshStandardMaterial({ map: tex, color: PAL.hemp, roughness: 0.85, emissive: '#000000' });
    const maxRings = segments * ROPE_SUB + 1;
    for (let k = 0; k < 2; k++) {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(maxRings * (ROPE_RADIAL + 1) * 3);
      const nrm = new Float32Array(pos.length);
      const uv = new Float32Array(maxRings * (ROPE_RADIAL + 1) * 2);
      const idx: number[] = [];
      for (let r = 0; r < maxRings - 1; r++) for (let j = 0; j < ROPE_RADIAL; j++) {
        const a = r * (ROPE_RADIAL + 1) + j, b = a + ROPE_RADIAL + 1;
        idx.push(a, b, a + 1, b, b + 1, a + 1);
      }
      geo.setIndex(idx);
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
      geo.setAttribute('normal', new THREE.BufferAttribute(nrm, 3).setUsage(THREE.DynamicDrawUsage));
      geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2).setUsage(THREE.DynamicDrawUsage));
      const mesh = new THREE.Mesh(geo, this.mat);
      mesh.castShadow = true;
      mesh.frustumCulled = false;
      scene.add(mesh);
      this.parts.push({ mesh, geo, pos, nrm, uv, rings: 0 });
    }
  }

  update(rope: VerletRope, headA: THREE.Vector3, tension: number): void {
    const cut = rope.cutIndex;
    const pts = rope.points;
    if (cut < 0) { this.build(0, pts, 0, this.n, headA); this.parts[1].mesh.visible = false; }
    else { this.build(0, pts, 0, cut, headA); this.build(1, pts, cut + 1, this.n, null); }
    const t = Math.max(0, Math.min(1, (tension - 0.75) / 0.45));
    this.mat.color.copy(this.hemp).lerp(this.hot, t * 0.8);
    this.mat.emissive.copy(this.hot).multiplyScalar(t * t * 1.4);
  }

  /** Catmull-Rom through points[i0..i1] (point i0 replaced by `head` when given). */
  private build(k: number, pts: THREE.Vector3[], i0: number, i1: number, head: THREE.Vector3 | null): void {
    const part = this.parts[k];
    const count = i1 - i0;
    if (count < 1) { part.mesh.visible = false; return; }
    part.mesh.visible = true;
    const at = (i: number): THREE.Vector3 => (i === i0 && head ? head : pts[Math.max(i0, Math.min(i1, i))]);
    let m = 0;
    for (let i = i0; i < i1; i++) {
      const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
      for (let s = 0; s < ROPE_SUB; s++) {
        const t = s / ROPE_SUB, t2 = t * t, t3 = t2 * t;
        this.pts[m++].set(
          0.5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
          0.5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
          0.5 * (2 * p1.z + (-p0.z + p2.z) * t + (2 * p0.z - 5 * p1.z + 4 * p2.z - p3.z) * t2 + (-p0.z + 3 * p1.z - 3 * p2.z + p3.z) * t3),
        );
      }
    }
    this.pts[m++].copy(at(i1));
    const rings = m;
    const R = 0.055;
    const { pos, nrm, uv } = part;
    let len = 0;
    this.N.set(0, 1, 0);
    for (let r = 0; r < rings; r++) {
      const P = this.pts[r];
      const Q = this.pts[Math.min(rings - 1, r + 1)], O = this.pts[Math.max(0, r - 1)];
      this.T.subVectors(Q, O);
      if (this.T.lengthSq() < 1e-10) this.T.set(1, 0, 0);
      this.T.normalize();
      // Parallel transport of the frame.
      this.N.addScaledVector(this.T, -this.N.dot(this.T));
      if (this.N.lengthSq() < 1e-6) this.N.set(this.T.y, -this.T.x, 0.3).addScaledVector(this.T, -this.N.dot(this.T));
      this.N.normalize();
      this.Bn.crossVectors(this.T, this.N);
      if (r > 0) len += P.distanceTo(this.prevP);
      this.prevP.copy(P);
      for (let j = 0; j <= ROPE_RADIAL; j++) {
        const a = (j / ROPE_RADIAL) * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
        const nx = this.N.x * ca + this.Bn.x * sa, ny = this.N.y * ca + this.Bn.y * sa, nz = this.N.z * ca + this.Bn.z * sa;
        const o = (r * (ROPE_RADIAL + 1) + j) * 3;
        pos[o] = P.x + nx * R; pos[o + 1] = P.y + ny * R; pos[o + 2] = P.z + nz * R;
        nrm[o] = nx; nrm[o + 1] = ny; nrm[o + 2] = nz;
        const u = (r * (ROPE_RADIAL + 1) + j) * 2;
        uv[u] = len * 5; uv[u + 1] = j / ROPE_RADIAL;
      }
    }
    part.rings = rings;
    part.geo.setDrawRange(0, (rings - 1) * ROPE_RADIAL * 6);
    (part.geo.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;
    (part.geo.getAttribute('normal') as THREE.BufferAttribute).needsUpdate = true;
    (part.geo.getAttribute('uv') as THREE.BufferAttribute).needsUpdate = true;
  }
}

// ---------------------------------------------------------------------------------------------
// Nav path: glowing chevrons marching along the (ground-projected) path
// ---------------------------------------------------------------------------------------------
const PATH_MAX_SAMPLES = 2400;
const PATH_SAMPLE = 0.1;
const CHEVRONS = 220;

class PathViz {
  private readonly mesh: THREE.InstancedMesh;
  private readonly samples = new Float32Array(PATH_MAX_SAMPLES * 3);
  private n = 0;
  private offset = 0;
  private readonly m = new THREE.Matrix4();
  private readonly q = new THREE.Quaternion();
  private readonly s = new THREE.Vector3();
  private readonly p = new THREE.Vector3();
  private readonly e = new THREE.Euler(0, 0, 0, 'YXZ');
  private readonly hit = { point: new THREE.Vector3(), normal: new THREE.Vector3(), distance: 0, collider: null, body: null } as RayHit;
  private readonly down = new THREE.Vector3(0, -1, 0);
  private readonly o = new THREE.Vector3();
  private readonly onlyStatic = (c: StaticCollider | Body): boolean => (c as StaticCollider).kind !== undefined && !(c as StaticCollider).velocity;

  constructor(scene: THREE.Scene) {
    const shape = new THREE.Shape();
    shape.moveTo(-0.13, -0.07); shape.lineTo(0, 0.06); shape.lineTo(0.13, -0.07); shape.lineTo(0.13, -0.01); shape.lineTo(0, 0.12); shape.lineTo(-0.13, -0.01); shape.closePath();
    const geo = new THREE.ShapeGeometry(shape);
    geo.rotateX(-Math.PI / 2);
    geo.scale(1, 1, -1); // tip points along +z before yaw
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(PAL.system).multiplyScalar(2.4), transparent: true, opacity: 0.95, depthWrite: false, side: THREE.DoubleSide });
    this.mesh = new THREE.InstancedMesh(geo, mat, CHEVRONS);
    this.mesh.count = 0;
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 4;
    scene.add(this.mesh);
  }

  setPath(path: THREE.Vector3[] | null, physics: Physics): void {
    this.n = 0;
    if (!path || path.length < 2) return;
    const S = this.samples;
    for (let i = 1; i < path.length && this.n < PATH_MAX_SAMPLES - 1; i++) {
      const a = path[i - 1], b = path[i];
      const len = a.distanceTo(b);
      const k = Math.max(1, Math.ceil(len / PATH_SAMPLE));
      for (let j = i === 1 ? 0 : 1; j <= k && this.n < PATH_MAX_SAMPLES; j++) {
        const t = j / k;
        const x = a.x + (b.x - a.x) * t, z = a.z + (b.z - a.z) * t;
        let y = a.y + (b.y - a.y) * t;
        this.o.set(x, y + 0.8, z);
        if (physics.raycastInto(this.o, this.down, 1.6, this.hit, this.onlyStatic)) y = this.hit.point.y;
        S[this.n * 3] = x; S[this.n * 3 + 1] = y + 0.05; S[this.n * 3 + 2] = z;
        this.n++;
      }
    }
  }

  update(dt: number, visible: boolean): void {
    const mesh = this.mesh;
    if (!visible || this.n < 2) { mesh.count = 0; return; }
    const spacing = 0.5;
    this.offset = (this.offset + dt * 1.6) % spacing;
    const total = (this.n - 1) * PATH_SAMPLE;
    let c = 0;
    const S = this.samples;
    for (let d = this.offset + 0.35; d < total - 0.2 && c < CHEVRONS; d += spacing) {
      const f = d / PATH_SAMPLE, i = Math.min(this.n - 2, Math.floor(f)), t = f - i;
      const x = S[i * 3] + (S[i * 3 + 3] - S[i * 3]) * t, y = S[i * 3 + 1] + (S[i * 3 + 4] - S[i * 3 + 1]) * t, z = S[i * 3 + 2] + (S[i * 3 + 5] - S[i * 3 + 2]) * t;
      const j = Math.min(this.n - 1, i + 3), h = Math.max(0, i - 2);
      const dx = S[j * 3] - S[h * 3], dy = S[j * 3 + 1] - S[h * 3 + 1], dz = S[j * 3 + 2] - S[h * 3 + 2];
      const hl = Math.hypot(dx, dz);
      this.e.set(-Math.atan2(dy, hl), Math.atan2(dx, dz), 0);
      this.q.setFromEuler(this.e);
      const edge = Math.min(1, d / 1.2, (total - d) / 1.0);
      const sc = 0.35 + 0.65 * Math.max(0, edge);
      this.s.set(sc, sc, sc);
      this.p.set(x, y, z);
      mesh.setMatrixAt(c++, this.m.compose(this.p, this.q, this.s));
    }
    mesh.count = c;
    mesh.instanceMatrix.needsUpdate = true;
  }
}

// ---------------------------------------------------------------------------------------------
// Target beacon
// ---------------------------------------------------------------------------------------------
class Beacon {
  private readonly g = new THREE.Group();
  private readonly ring: THREE.Mesh;
  private readonly ring2: THREE.Mesh;
  private readonly gem: THREE.Mesh;
  private readonly beam: THREE.Mesh;
  private readonly light: THREE.PointLight;
  private readonly okCol = new THREE.Color(PAL.gold);
  private readonly badCol = new THREE.Color(PAL.danger);
  private readonly cur = new THREE.Color(PAL.gold);
  private goal = this.okCol;
  private t = 0;

  constructor(scene: THREE.Scene) {
    this.ring = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.035, 8, 56), new THREE.MeshBasicMaterial({ color: '#ffffff' }));
    this.ring.rotation.x = Math.PI / 2; this.ring.position.y = 0.05;
    this.ring2 = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.62, 48), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.18, depthWrite: false, blending: THREE.AdditiveBlending }));
    this.ring2.rotation.x = -Math.PI / 2; this.ring2.position.y = 0.04;
    this.gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.2, 0), new THREE.MeshStandardMaterial({ color: '#fff1c1', emissive: '#ffffff', emissiveIntensity: 1.6, roughness: 0.2, metalness: 0.3 }));
    this.gem.scale.y = 1.5; this.gem.castShadow = true;
    this.beam = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.38, 4.5, 20, 1, true), new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      uniforms: { uColor: { value: this.cur } },
      vertexShader: 'varying float vY; void main(){ vY = uv.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'varying float vY; uniform vec3 uColor; void main(){ float a = pow(1.0 - vY, 2.2) * 0.55; gl_FragColor = vec4(uColor * 1.6 * a, a); }',
    }));
    this.beam.position.y = 2.25;
    this.light = new THREE.PointLight(PAL.gold, 5, 6, 2);
    this.light.position.y = 1.0;
    this.g.add(this.ring, this.ring2, this.gem, this.beam, this.light);
    scene.add(this.g);
  }

  setReachable(ok: boolean): void { this.goal = ok ? this.okCol : this.badCol; }

  update(dt: number, at: THREE.Vector3): void {
    this.t += dt;
    this.g.position.copy(at);
    this.cur.lerp(this.goal, 1 - Math.exp(-dt * 8));
    (this.ring.material as THREE.MeshBasicMaterial).color.copy(this.cur).multiplyScalar(3);
    (this.ring2.material as THREE.MeshBasicMaterial).color.copy(this.cur);
    (this.gem.material as THREE.MeshStandardMaterial).emissive.copy(this.cur);
    this.light.color.copy(this.cur);
    const pulse = 1 + Math.sin(this.t * 3) * 0.06;
    this.ring.scale.set(pulse, pulse, pulse);
    this.gem.position.y = 1.05 + Math.sin(this.t * 2.2) * 0.12;
    this.gem.rotation.y = this.t * 1.4;
  }
}

// ---------------------------------------------------------------------------------------------
// Tiny particle puffs (dust, sparks)
// ---------------------------------------------------------------------------------------------
class Puffs {
  private readonly pts: THREE.Points;
  private readonly N: number;
  private head = 0;
  private readonly pos: Float32Array;
  private readonly vel: Float32Array;
  private readonly life: Float32Array;
  private readonly max: Float32Array;
  private readonly size0: Float32Array;
  private readonly alpha: Float32Array;
  private readonly size: Float32Array;
  private readonly mat: THREE.ShaderMaterial;
  private readonly o: { gravity: number; drag: number; grow: number; opacity: number };
  private seed = 1;

  constructor(scene: THREE.Scene, n: number, color: string, o: { gravity: number; drag: number; grow: number; additive: boolean; opacity: number; hdr?: number }) {
    this.N = n; this.o = o;
    this.pos = new Float32Array(n * 3); this.vel = new Float32Array(n * 3);
    this.life = new Float32Array(n); this.max = new Float32Array(n).fill(1); this.size0 = new Float32Array(n);
    this.alpha = new Float32Array(n); this.size = new Float32Array(n);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute('aAlpha', new THREE.BufferAttribute(this.alpha, 1).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute('aSize', new THREE.BufferAttribute(this.size, 1).setUsage(THREE.DynamicDrawUsage));
    this.mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: o.additive ? THREE.AdditiveBlending : THREE.NormalBlending,
      uniforms: { uColor: { value: new THREE.Color(color).multiplyScalar(o.hdr ?? 1) }, uScale: { value: 400 } },
      vertexShader: `attribute float aAlpha; attribute float aSize; varying float vA; uniform float uScale;
        void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv;
          gl_PointSize = aSize * uScale / max(0.1, -mv.z); vA = aAlpha; }`,
      fragmentShader: `varying float vA; uniform vec3 uColor;
        void main(){ float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.12, d) * vA; if (a < 0.01) discard; gl_FragColor = vec4(uColor, a); }`,
    });
    this.pts = new THREE.Points(geo, this.mat);
    this.pts.frustumCulled = false;
    this.pts.renderOrder = 6;
    scene.add(this.pts);
  }

  setScale(s: number): void { this.mat.uniforms.uScale.value = s; }

  private rnd(): number { this.seed = (Math.imul(this.seed, 1664525) + 1013904223) >>> 0; return this.seed / 4294967296; }

  burst(x: number, y: number, z: number, count: number, speed: number, up: number, size: number, life: number): void {
    for (let k = 0; k < count; k++) {
      const i = this.head; this.head = (this.head + 1) % this.N;
      const a = this.rnd() * Math.PI * 2, r = 0.4 + this.rnd() * 0.6;
      this.pos[i * 3] = x + Math.cos(a) * 0.15; this.pos[i * 3 + 1] = y; this.pos[i * 3 + 2] = z + Math.sin(a) * 0.15;
      this.vel[i * 3] = Math.cos(a) * speed * r; this.vel[i * 3 + 1] = up * (0.5 + this.rnd()); this.vel[i * 3 + 2] = Math.sin(a) * speed * r;
      this.max[i] = life * (0.6 + this.rnd() * 0.6); this.life[i] = this.max[i];
      this.size0[i] = size * (0.6 + this.rnd() * 0.8);
    }
  }

  update(dt: number): void {
    const o = this.o;
    const damp = Math.exp(-o.drag * dt);
    for (let i = 0; i < this.N; i++) {
      if (this.life[i] <= 0) { this.alpha[i] = 0; continue; }
      this.life[i] -= dt;
      const k = i * 3;
      this.vel[k] *= damp; this.vel[k + 1] = this.vel[k + 1] * damp - o.gravity * dt; this.vel[k + 2] *= damp;
      this.pos[k] += this.vel[k] * dt; this.pos[k + 1] += this.vel[k + 1] * dt; this.pos[k + 2] += this.vel[k + 2] * dt;
      const t = 1 - Math.max(0, this.life[i]) / this.max[i];
      this.alpha[i] = o.opacity * Math.min(1, t * 8) * (1 - t);
      this.size[i] = Math.max(0, this.size0[i] * (1 + o.grow * t));
    }
    const g = this.pts.geometry;
    (g.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;
    (g.getAttribute('aAlpha') as THREE.BufferAttribute).needsUpdate = true;
    (g.getAttribute('aSize') as THREE.BufferAttribute).needsUpdate = true;
  }
}

// ---------------------------------------------------------------------------------------------
// Debug: walkable nav cells as dots
// ---------------------------------------------------------------------------------------------
function buildNavDots(nav: Nav): THREE.Points {
  const n = nav.nodeCount;
  const pos = new Float32Array(n * 3);
  const v = new THREE.Vector3();
  for (let i = 0; i < n; i++) { nav.nodePosition(i, v); pos[i * 3] = v.x; pos[i * 3 + 1] = v.y + 0.04; pos[i * 3 + 2] = v.z; }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: new THREE.Color(PAL.system).multiplyScalar(1.4), size: 4, sizeAttenuation: false, depthTest: true, transparent: true, opacity: 0.85 }));
  pts.renderOrder = 998;
  return pts;
}

// ---------------------------------------------------------------------------------------------
// HUD: a small System window with live readouts, key hints and toasts
// ---------------------------------------------------------------------------------------------
const HUD_CSS = `
.ph-root{position:absolute;inset:0;pointer-events:none;z-index:20;color:#e9fbff;font:13px/1.35 system-ui,'Segoe UI',sans-serif;user-select:none}
.ph-win{position:absolute;left:18px;top:16px;width:262px;padding:11px 14px 12px;border-radius:9px;
  background:linear-gradient(180deg,rgba(11,22,48,.86),rgba(8,14,32,.74));border:1px solid rgba(92,225,230,.5);
  box-shadow:0 0 0 1px rgba(0,0,0,.35),0 0 22px rgba(92,225,230,.18),inset 0 0 18px rgba(92,225,230,.07)}
.ph-eye{font:600 10px/1 ui-monospace,Consolas,monospace;letter-spacing:.3em;color:#5ce1e6;display:flex;justify-content:space-between}
.ph-eye i{font-style:normal;letter-spacing:.08em;color:#8fb8c6}
.ph-title{margin:6px 0 8px;font-size:19px;font-weight:700;letter-spacing:.02em;text-shadow:0 0 16px rgba(92,225,230,.35)}
.ph-row{display:flex;gap:10px;font:12px/1.55 ui-monospace,Consolas,monospace;color:#cfe7f0;white-space:pre}
.ph-row b{width:52px;color:#7fb4c4;font-weight:500}
.ph-row.hot span{color:#ffd76a;text-shadow:0 0 10px rgba(255,215,106,.5)}
.ph-meter{flex:0 0 58px;height:6px;margin-top:7px;border-radius:3px;background:rgba(92,225,230,.14);overflow:hidden;box-shadow:inset 0 0 0 1px rgba(92,225,230,.22)}
.ph-meter i{display:block;height:100%;width:0;border-radius:3px;background:linear-gradient(90deg,#5ce1e6,#ffd76a 70%,#ff7a3a);box-shadow:0 0 8px rgba(255,215,106,.55);transition:width .1s linear}
.ph-keys{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);display:flex;flex-wrap:wrap;justify-content:center;gap:6px 14px;
  max-width:min(94vw,1020px);padding:8px 14px;border-radius:10px;background:rgba(8,14,32,.62);border:1px solid rgba(92,225,230,.18);font-size:12px;color:#c6dbe8}
.ph-keys span{white-space:nowrap}
.ph-keys kbd{display:inline-block;min-width:16px;padding:1px 5px;margin-right:5px;border-radius:4px;text-align:center;
  font:600 11px/16px ui-monospace,Consolas,monospace;color:#061018;background:#bff3ff;box-shadow:0 2px 0 #4aa9c4}
.ph-toast{position:absolute;left:50%;top:18px;transform:translate(-50%,-8px);padding:8px 16px;border-radius:8px;opacity:0;
  font:600 12px/1.2 ui-monospace,Consolas,monospace;letter-spacing:.08em;color:#e9fbff;background:rgba(11,22,48,.86);
  border:1px solid rgba(92,225,230,.6);box-shadow:0 0 20px rgba(92,225,230,.22);transition:opacity .18s ease,transform .18s ease}
.ph-toast.on{opacity:1;transform:translate(-50%,0)}
.ph-toast.danger{border-color:rgba(255,61,110,.7);box-shadow:0 0 20px rgba(255,61,110,.25)}
@media (max-width:700px){.ph-win{width:220px;left:10px;top:10px}.ph-keys{font-size:11px}}
`;

class Hud {
  private readonly rows: { row: HTMLDivElement; v: HTMLSpanElement; meter: HTMLElement; fill: HTMLElement }[] = [];
  private readonly toastEl: HTMLDivElement;
  private readonly fpsEl: HTMLElement;
  private toastLeft = 0;
  private acc = 1;

  constructor(host: HTMLElement) {
    const root = el('div', 'ph-root', host);
    el('style', '', root).textContent = HUD_CSS;
    const win = el('div', 'ph-win', root);
    const eye = el('div', 'ph-eye', win);
    eye.append('◆ SYSTEM');
    this.fpsEl = el('i', '', eye);
    el('div', 'ph-title', win).textContent = 'Physics Lab';
    for (let i = 0; i < 8; i++) {
      const row = el('div', 'ph-row', win) as HTMLDivElement;
      el('b', '', row);
      const meter = el('div', 'ph-meter', row);
      const fill = el('i', '', meter);
      meter.style.display = 'none';
      this.rows.push({ row, v: el('span', '', row) as HTMLSpanElement, meter, fill });
    }
    const keys = el('div', 'ph-keys', root);
    const chip = (k: string, label: string): void => { const s = el('span', '', keys); el('kbd', '', s).textContent = k; s.append(label); };
    chip('WASD', 'move'); chip('Space', 'jump'); chip('Q/E', 'orbit'); chip('G', 'wireframe'); chip('R', 'rope'); chip('T', 'target');
    chip('N', 'autopilot'); chip('C', 'overview'); chip('F', 'respawn');
    this.toastEl = el('div', 'ph-toast', root) as HTMLDivElement;
  }

  toast(text: string, tone: 'info' | 'danger' = 'info', seconds = 1.8): void {
    this.toastEl.textContent = text;
    this.toastEl.className = `ph-toast on ${tone}`;
    this.toastLeft = seconds;
  }

  update(lab: Lab, dt: number): void {
    if (this.toastLeft > 0) { this.toastLeft -= dt; if (this.toastLeft <= 0) this.toastEl.classList.remove('on'); }
    this.acc += dt;
    if (this.acc < 0.1) return;
    this.acc = 0;
    const lines = lab.hudLines();
    for (let i = 0; i < this.rows.length; i++) {
      const l = lines[i], r = this.rows[i];
      if (!l) { r.row.style.display = 'none'; continue; }
      (r.row.firstChild as HTMLElement).textContent = l.k;
      r.v.textContent = l.v;
      r.row.classList.toggle('hot', !!l.hot);
      r.meter.style.display = l.bar === undefined ? 'none' : '';
      if (l.bar !== undefined) r.fill.style.width = `${Math.round(Math.max(0, Math.min(1, l.bar)) * 100)}%`;
    }
    this.fpsEl.textContent = `${Math.round(lab.fps)} fps`;
  }
}

function el(tag: string, cls: string, parent: HTMLElement): HTMLElement {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  parent.appendChild(e);
  return e;
}
