/**
 * Runtime showcase: `?demo=runtime` (optional `&start=hall`, `&auto=0` to stop the idle stroll).
 *
 * Exercises the engine loop, scene manager, every transition, post looks, the follow camera
 * (shake, punch, attention, cinematics), input and tweens on two small hand-built scenes:
 *   orbit - the floor of the well: a glowing crystal on a pedestal with orbiting bevelled shapes,
 *           moonlight falling from the round patch of sky far above.
 *   hall  - a warm timber hall: hearth, long table, lanterns, window light.
 *
 * Keys: 1-6 fade / iris / door / whiteout / glitch / cut to the other scene, C cinematic,
 * X shake, P (Shift+P) cycle post looks, E attention shift, WASD move, Space hop, ` stats.
 * UI and audio are inline stubs so this module depends on core/ only.
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import type { AudioApi, CameraShot, GameScene, SystemTone, TransitionKind, UiApi, UiScreen } from '../core/api.ts';
import { FollowCameraRig } from '../core/camera_rig.ts';
import { mergeTestHooks } from '../core/debug.ts';
import { GameEngine } from '../core/engine.ts';
import { DEG2RAD, Spring, TAU, clamp, damp, dampAngle, lerp, noise1, yawOf, cameraRelativeMove } from '../core/math.ts';
import { POST_LOOKS } from '../core/post.ts';
import { createRng } from '../core/rng.ts';
import type { SeededRng } from '../core/rng.ts';
import { disposeObject } from '../core/scene_manager.ts';

// ---------------------------------------------------------------------------------------------
// Inline stubs: a tiny HUD (title card, key hints, toasts) and silent audio.
// ---------------------------------------------------------------------------------------------
const UI_CSS = `
.rt-root{position:absolute;inset:0;pointer-events:none;z-index:20;color:#e8f6ff;font:13px/1.35 system-ui,'Segoe UI',sans-serif;user-select:none}
.rt-card{position:absolute;right:22px;top:18px;padding:12px 16px 12px 18px;min-width:220px;text-align:right;
  background:linear-gradient(180deg,rgba(9,14,24,.78),rgba(6,9,16,.62));border:1px solid rgba(127,233,255,.28);border-radius:10px;
  box-shadow:0 0 0 1px rgba(0,0,0,.35),0 10px 30px rgba(0,0,0,.35),inset 0 0 24px rgba(127,233,255,.06);backdrop-filter:blur(6px)}
.rt-eyebrow{font:600 10px/1 ui-monospace,Consolas,monospace;letter-spacing:.28em;color:#7fe9ff;opacity:.85}
.rt-title{margin-top:7px;font-size:22px;font-weight:700;letter-spacing:.02em;text-shadow:0 0 18px rgba(127,233,255,.25)}
.rt-sub{margin-top:4px;font:11px/1.3 ui-monospace,Consolas,monospace;color:#a9c4d6}
.rt-sub b{color:#ffd58a;font-weight:600}
.rt-keys{position:absolute;left:50%;bottom:16px;transform:translateX(-50%);display:flex;flex-wrap:wrap;justify-content:center;gap:6px 14px;
  max-width:min(94vw,980px);padding:9px 14px;border-radius:10px;background:rgba(6,9,16,.6);border:1px solid rgba(127,233,255,.16);
  box-shadow:0 8px 24px rgba(0,0,0,.3);font-size:12px;color:#c6dbe8}
.rt-keys span{white-space:nowrap}
.rt-keys kbd{display:inline-block;min-width:18px;padding:1px 5px;margin-right:5px;border-radius:4px;text-align:center;
  font:600 11px/16px ui-monospace,Consolas,monospace;color:#061018;background:#bff3ff;box-shadow:0 2px 0 #4aa9c4}
.rt-keys .sep{width:1px;align-self:stretch;background:rgba(127,233,255,.18)}
.rt-toast{position:absolute;left:50%;bottom:74px;transform:translate(-50%,8px);padding:7px 14px;border-radius:8px;opacity:0;
  font:600 12px/1.2 ui-monospace,Consolas,monospace;letter-spacing:.06em;color:#e9fbff;background:rgba(8,14,24,.82);
  border:1px solid rgba(127,233,255,.45);box-shadow:0 0 18px rgba(127,233,255,.18);transition:opacity .18s ease,transform .18s ease}
.rt-toast.on{opacity:1;transform:translate(-50%,0)}
.rt-toast.warning{border-color:rgba(255,196,110,.6);box-shadow:0 0 18px rgba(255,180,90,.2)}
.rt-toast.glitch{border-color:rgba(255,90,200,.6)}
@media (max-width:640px){.rt-card{right:10px;top:10px;min-width:0}.rt-title{font-size:18px}.rt-keys{font-size:11px;bottom:10px}}
`;

class DemoUi implements UiApi {
  readonly root: HTMLDivElement;
  activeScreen: string | null = null;
  private readonly titleEl: HTMLDivElement;
  private readonly subEl: HTMLDivElement;
  private readonly toastEl: HTMLDivElement;
  private toastLeft = 0;
  private sceneId = '';
  private look = '';

  constructor(host: HTMLElement) {
    const root = document.createElement('div');
    this.root = root;
    root.className = 'rt-root';
    root.dataset.layer = 'ui';
    const style = document.createElement('style');
    style.textContent = UI_CSS;
    root.appendChild(style);
    const card = div('rt-card', root);
    div('rt-eyebrow', card).textContent = 'KNOTSPIRE · RUNTIME';
    this.titleEl = div('rt-title', card);
    this.subEl = div('rt-sub', card);
    const keys = div('rt-keys', root);
    const chip = (k: string, label: string): void => {
      const s = document.createElement('span');
      const kb = document.createElement('kbd');
      kb.textContent = k;
      s.append(kb, label);
      keys.appendChild(s);
    };
    const sep = (): void => void div('sep', keys);
    chip('1', 'fade'); chip('2', 'iris'); chip('3', 'door'); chip('4', 'whiteout'); chip('5', 'glitch'); chip('6', 'cut');
    sep();
    chip('C', 'cinematic'); chip('X', 'shake'); chip('P', 'look'); chip('E', 'focus');
    sep();
    chip('WASD', 'move'); chip('Space', 'hop'); chip('`', 'stats');
    this.toastEl = div('rt-toast', root);
    host.appendChild(root);
  }

  setScene(title: string, id: string): void {
    this.titleEl.textContent = title;
    this.sceneId = id;
    this.renderSub();
  }
  setLook(name: string): void {
    this.look = name;
    this.renderSub();
  }
  private renderSub(): void {
    this.subEl.innerHTML = `scene <b>${this.sceneId}</b> · look <b>${this.look}</b>`;
  }

  system(opts: { title?: string; lines: string[]; tone?: SystemTone }): Promise<number | null> {
    this.toast([opts.title, ...opts.lines].filter(Boolean).join(' — '), opts.tone);
    return Promise.resolve(null);
  }
  toast(text: string, tone: SystemTone = 'info', seconds = 1.5): void {
    this.toastEl.textContent = text;
    this.toastEl.className = `rt-toast on ${tone}`;
    this.toastLeft = seconds;
  }
  objective(): void {}
  timer(): void {}
  prompt(): void {}
  bubble(): void {}
  patronChat(): void {}
  screen(id: string): void {
    this.activeScreen = id;
  }
  closeScreen(): void {
    this.activeScreen = null;
  }
  registerScreen(_id: string, _factory: (props: Record<string, unknown>) => UiScreen): void {}
  setHud(visible: boolean): void {
    this.root.style.visibility = visible ? '' : 'hidden';
  }
  update(dt: number): void {
    if (this.toastLeft > 0) {
      this.toastLeft -= dt;
      if (this.toastLeft <= 0) this.toastEl.classList.remove('on');
    }
  }
}

function div(cls: string, parent: HTMLElement): HTMLDivElement {
  const d = document.createElement('div');
  d.className = cls;
  parent.appendChild(d);
  return d;
}

const SILENT_AUDIO: AudioApi = {
  unlock() {},
  sfx() {},
  music() {},
  setIntensity() {},
  setListener() {},
  volumes: { master: 1, music: 1, sfx: 1 },
};

// ---------------------------------------------------------------------------------------------
// Small building helpers (procedural canvas textures, HDR materials, instancing).
// ---------------------------------------------------------------------------------------------
const V = (x: number, y: number, z: number): THREE.Vector3 => new THREE.Vector3(x, y, z);

function canvasTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, srgb = true): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');
  if (!g) throw new Error('2d canvas unavailable');
  draw(g);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function softDotTexture(): THREE.CanvasTexture {
  return canvasTexture(64, 64, (g) => {
    const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    r.addColorStop(0, 'rgba(255,255,255,1)');
    r.addColorStop(0.22, 'rgba(255,255,255,0.6)');
    r.addColorStop(0.55, 'rgba(255,255,255,0.14)');
    r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r;
    g.fillRect(0, 0, 64, 64);
  });
}

/** HDR unlit colour (values above 1 feed the bloom). */
function glowMat(hex: string, intensity: number, additive = false): THREE.MeshBasicMaterial {
  const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(intensity), fog: false });
  if (additive) {
    m.transparent = true;
    m.blending = THREE.AdditiveBlending;
    m.depthWrite = false;
  }
  return m;
}

function std(hex: string, roughness = 0.8, extra: THREE.MeshStandardMaterialParameters = {}): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color: hex, roughness, metalness: 0, ...extra });
}

function glowSprite(tex: THREE.Texture, hex: string, scale: number, opacity: number): THREE.Sprite {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({
    map: tex, color: hex, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, fog: false,
  }));
  s.scale.setScalar(scale);
  return s;
}

function mesh(geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0, shadows: 'both' | 'cast' | 'receive' | 'none' = 'both'): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = shadows === 'both' || shadows === 'cast';
  m.receiveShadow = shadows === 'both' || shadows === 'receive';
  return m;
}

/** Collects instance transforms + colours, then builds one InstancedMesh (one draw call). */
class Batch {
  private readonly mats: THREE.Matrix4[] = [];
  private readonly cols: THREE.Color[] = [];
  private readonly dummy = new THREE.Object3D();
  add(x: number, y: number, z: number, sx: number, sy: number, sz: number, ry = 0, color = '#ffffff', rx = 0, rz = 0, bright = 1): void {
    const d = this.dummy;
    d.position.set(x, y, z);
    d.rotation.set(rx, ry, rz);
    d.scale.set(sx, sy, sz);
    d.updateMatrix();
    this.mats.push(d.matrix.clone());
    this.cols.push(new THREE.Color(color).multiplyScalar(bright));
  }
  get size(): number {
    return this.mats.length;
  }
  build(geo: THREE.BufferGeometry, mat: THREE.Material, cast = true, receive = true): THREE.InstancedMesh {
    const im = new THREE.InstancedMesh(geo, mat, Math.max(1, this.mats.length));
    im.count = this.mats.length;
    for (let i = 0; i < this.mats.length; i++) {
      im.setMatrixAt(i, this.mats[i]);
      im.setColorAt(i, this.cols[i]);
    }
    im.instanceMatrix.needsUpdate = true;
    if (im.instanceColor) im.instanceColor.needsUpdate = true;
    im.castShadow = cast;
    im.receiveShadow = receive;
    im.computeBoundingSphere();
    return im;
  }
}

/** Drifting dust / embers: one Points draw call, positions rewritten each frame (no allocation). */
class Motes {
  readonly points: THREE.Points;
  private readonly base: Float32Array;
  private readonly pos: Float32Array;
  private readonly yMin: number;
  private readonly span: number;
  private readonly rise: number;
  constructor(count: number, rng: SeededRng, tex: THREE.Texture, color: string, size: number, spawn: (out: THREE.Vector3) => void, yMin: number, yMax: number, rise: number, opacity = 0.8) {
    this.base = new Float32Array(count * 4);
    this.pos = new Float32Array(count * 3);
    this.yMin = yMin;
    this.span = yMax - yMin;
    this.rise = rise;
    const v = new THREE.Vector3();
    for (let i = 0; i < count; i++) {
      spawn(v);
      this.base[i * 4] = v.x;
      this.base[i * 4 + 1] = rng.range(0, this.span);
      this.base[i * 4 + 2] = v.z;
      this.base[i * 4 + 3] = rng.range(0, TAU);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    const m = new THREE.PointsMaterial({
      map: tex, color, size, sizeAttenuation: true, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    this.points = new THREE.Points(g, m);
    this.points.frustumCulled = false;
    this.update(0);
  }
  update(t: number): void {
    const b = this.base, p = this.pos;
    for (let i = 0, n = p.length / 3; i < n; i++) {
      const ph = b[i * 4 + 3];
      p[i * 3] = b[i * 4] + Math.sin(t * 0.31 + ph) * 0.45;
      p[i * 3 + 1] = this.yMin + ((b[i * 4 + 1] + t * this.rise * (0.6 + 0.4 * Math.sin(ph * 3.1))) % this.span);
      p[i * 3 + 2] = b[i * 4 + 2] + Math.cos(t * 0.27 + ph * 1.3) * 0.45;
    }
    (this.points.geometry.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;
  }
}

interface Flicker { light: THREE.PointLight; base: number; seed: number; speed: number; depth: number }
interface Flame { obj: THREE.Object3D; sx: number; sy: number; seed: number; speed: number }

/** Additive flame: an outer and an inner cone that the scene wobbles each frame. */
function makeFlame(size: number, outer = '#ff8a2a', inner = '#ffe39a'): THREE.Group {
  const g = new THREE.Group();
  const o = mesh(new THREE.ConeGeometry(0.5 * size, 1.6 * size, 9, 1, true), glowMat(outer, 2.6, true), 0, 0.8 * size, 0, 'none');
  const i = mesh(new THREE.ConeGeometry(0.28 * size, 1.0 * size, 9, 1, true), glowMat(inner, 3.6, true), 0, 0.5 * size, 0, 'none');
  o.renderOrder = i.renderOrder = 5;
  g.add(o, i);
  return g;
}

// ---------------------------------------------------------------------------------------------
// The little climber: a capsule in a beanie and scarf, with spring squash & stretch.
// ---------------------------------------------------------------------------------------------
const HERO_SPEED = 5.2;

class Hero {
  readonly root = new THREE.Group();
  readonly body = new THREE.Group();
  readonly squash = new Spring(0, 4.2, 0.28);
  readonly pos = new THREE.Vector3();
  readonly prev = new THREE.Vector3();
  readonly vel = new THREE.Vector3();
  heading = 0;
  groundY = 0;
  private y = 0;
  private prevY = 0;
  private vy = 0;
  private grounded = true;
  private wasMoving = false;
  private stride = 0;
  private speed = 0;
  private t = 0;
  private readonly tail: THREE.Group;

  constructor(accent: string) {
    const cream = std('#f5e9d6', 0.62);
    const cloth = std(accent, 0.85);
    const clothDark = std(new THREE.Color(accent).multiplyScalar(0.72).getStyle(), 0.9);
    const ink = std('#1a1922', 0.25);
    this.body.add(mesh(new THREE.CapsuleGeometry(0.36, 0.46, 6, 18), cream, 0, 0.59, 0, 'cast'));
    const beanie = mesh(new THREE.SphereGeometry(0.385, 22, 10, 0, TAU, 0, Math.PI * 0.5), cloth, 0, 0.84, 0, 'cast');
    beanie.scale.set(1, 0.95, 1);
    const cuff = mesh(new THREE.TorusGeometry(0.372, 0.07, 8, 28), clothDark, 0, 0.86, 0, 'cast');
    cuff.rotation.x = Math.PI / 2;
    const pom = mesh(new THREE.IcosahedronGeometry(0.11, 1), std('#fff6ea', 0.95), 0, 1.25, 0, 'cast');
    const scarf = mesh(new THREE.TorusGeometry(0.35, 0.085, 10, 30), cloth, 0, 0.44, 0, 'cast');
    scarf.rotation.x = Math.PI / 2;
    this.tail = new THREE.Group();
    this.tail.position.set(0.14, 0.44, -0.3);
    this.tail.add(mesh(new RoundedBoxGeometry(0.17, 0.42, 0.07, 2, 0.03), cloth, 0, -0.2, 0, 'cast'));
    for (const sx of [-1, 1]) {
      const eye = mesh(new THREE.SphereGeometry(0.056, 12, 8), ink, sx * 0.13, 0.69, 0.338, 'none');
      eye.scale.set(1, 1.4, 0.55);
      const glint = mesh(new THREE.SphereGeometry(0.018, 6, 4), glowMat('#ffffff', 1.4), sx * 0.13 + 0.018, 0.72, 0.366, 'none');
      const cheek = mesh(new THREE.CircleGeometry(0.05, 12), new THREE.MeshBasicMaterial({ color: '#ff9f9a', transparent: true, opacity: 0.55 }), sx * 0.22, 0.6, 0.29, 'none');
      cheek.rotation.y = sx * 0.62;
      this.body.add(eye, glint, cheek);
    }
    this.body.add(beanie, cuff, pom, scarf, this.tail);
    this.root.add(this.body);
  }

  place(x: number, z: number, heading = 0): void {
    this.pos.set(x, this.groundY, z);
    this.prev.copy(this.pos);
    this.vel.set(0, 0, 0);
    this.heading = heading;
    this.y = this.prevY = 0;
    this.root.position.copy(this.pos);
    this.root.rotation.y = heading;
  }

  hop(): void {
    if (!this.grounded) return;
    this.grounded = false;
    this.vy = 6.4;
    this.squash.impulse(3.2);
  }

  tick(dt: number, wish: THREE.Vector3, constrain: (p: THREE.Vector3) => void): void {
    this.prev.copy(this.pos);
    this.prevY = this.y;
    const k = wish.lengthSq() > 0.0025 ? 11 : 8;
    this.vel.x = damp(this.vel.x, wish.x * HERO_SPEED, k, dt);
    this.vel.z = damp(this.vel.z, wish.z * HERO_SPEED, k, dt);
    this.pos.x += this.vel.x * dt;
    this.pos.z += this.vel.z * dt;
    constrain(this.pos);
    this.pos.y = this.groundY;
    const sp = Math.hypot(this.vel.x, this.vel.z);
    if (sp > 0.35) this.heading = dampAngle(this.heading, yawOf(this.vel.x, this.vel.z), 12, dt);
    const moving = sp > 0.8;
    if (moving !== this.wasMoving) {
      this.squash.impulse(moving ? -1.1 : 0.9);
      this.wasMoving = moving;
    }
    if (!this.grounded) {
      this.vy -= 24 * dt;
      this.y += this.vy * dt;
      if (this.y <= 0) {
        this.y = 0;
        this.vy = 0;
        this.grounded = true;
        this.squash.impulse(-3.4);
      }
    }
    this.stride += sp * dt * 1.9;
    this.speed = sp;
  }

  frame(dt: number, alpha: number): void {
    this.t += dt;
    this.root.position.lerpVectors(this.prev, this.pos, alpha);
    this.root.position.y = this.groundY + lerp(this.prevY, this.y, alpha);
    this.root.rotation.y = this.heading;
    const s = clamp(this.squash.update(dt), -0.32, 0.32);
    this.body.scale.set(1 - s * 0.5, 1 + s, 1 - s * 0.5);
    const walk = Math.min(1, this.speed / HERO_SPEED);
    this.body.position.y = this.grounded ? Math.abs(Math.sin(this.stride * Math.PI)) * 0.09 * walk : 0;
    this.body.rotation.x = walk * 0.13;
    this.body.rotation.z = Math.sin(this.stride * Math.PI) * 0.05 * walk;
    this.tail.rotation.x = 0.18 + walk * 0.55 + Math.sin(this.t * 7 + this.stride) * 0.08 * (0.3 + walk);
  }
}

// ---------------------------------------------------------------------------------------------
// Shared scene scaffolding.
// ---------------------------------------------------------------------------------------------
interface Ellipse { cx: number; cz: number; rx: number; rz: number }

abstract class DemoScene implements GameScene {
  abstract readonly id: 'orbit' | 'hall';
  abstract readonly title: string;
  abstract readonly look: string;
  readonly scene = new THREE.Scene();
  readonly rig = new FollowCameraRig(new THREE.PerspectiveCamera(50, 16 / 9, 0.1, 180));
  readonly hero: Hero;
  autopilot: boolean;
  protected readonly engine: GameEngine;
  protected readonly ui: DemoUi;
  protected readonly rng: SeededRng;
  protected readonly lights: Flicker[] = [];
  protected readonly flames: Flame[] = [];
  protected readonly motes: Motes[] = [];
  protected readonly dot = softDotTexture();
  protected t = 0;
  private idle = 0;
  private readonly wish = new THREE.Vector3();
  private readonly tmp = new THREE.Vector3();

  constructor(engine: GameEngine, ui: DemoUi, seed: number, accent: string) {
    this.engine = engine;
    this.ui = ui;
    this.rng = createRng(seed);
    this.hero = new Hero(accent);
    this.autopilot = engine.params.get('auto') !== '0';
  }

  get camera(): THREE.PerspectiveCamera {
    return this.rig.camera;
  }

  protected abstract build(): void;
  protected abstract constrain(p: THREE.Vector3): void;
  protected abstract readonly path: Ellipse;
  protected abstract readonly start: { x: number; z: number };
  abstract cinematicShots(): CameraShot[];
  abstract readonly attention: THREE.Vector3;
  protected animate(_dt: number): void {}

  enter(): void {
    this.build();
    this.scene.add(this.hero.root);
    this.hero.place(this.start.x, this.start.z, 0);
    this.rig.follow(this.hero.root, { distance: 11.5, pitch: 50 * DEG2RAD, height: 0.9, lookAhead: 0.3, yaw: 0 });
    this.rig.snap();
    this.engine.post.setLookByName(this.look, 0);
    this.ui.setScene(this.title, this.id);
    this.ui.setLook(this.look);
  }

  exit(): void {
    this.rig.skipCinematic();
    disposeObject(this.scene);
    this.scene.clear();
  }

  tick(dt: number): void {
    const input = this.engine.input;
    const w = this.wish;
    if (input.move.lengthSq() > 0.0025) {
      cameraRelativeMove(input.move, this.rig.yaw, w);
      this.idle = 0;
    } else {
      this.idle += dt;
      w.set(0, 0, 0);
      if (this.autopilot && this.idle > 2.2) this.stroll(w);
    }
    if (input.pressed('jump')) this.hero.hop();
    if (input.pressed('interact')) this.focusAttention();
    this.hero.tick(dt, w, (p) => this.constrain(p));
  }

  frame(dt: number, alpha: number): void {
    this.t += dt;
    this.hero.frame(dt, alpha);
    const t = this.t;
    for (const f of this.lights) {
      const n = noise1(t * f.speed, f.seed) * 0.7 + noise1(t * f.speed * 2.9, f.seed + 11) * 0.3;
      f.light.intensity = f.base * (1 + n * f.depth);
    }
    for (const f of this.flames) {
      const n = noise1(t * f.speed, f.seed);
      const m = noise1(t * f.speed * 1.7, f.seed + 5);
      f.obj.scale.set(f.sx * (1 - n * 0.1), f.sy * (1 + n * 0.28), f.sx * (1 + m * 0.1));
      f.obj.rotation.z = m * 0.08;
    }
    for (const m of this.motes) m.update(t);
    this.animate(dt);
    this.rig.update(dt);
  }

  /** Walk along the scene's ellipse, chasing a point a little ahead of the hero's own angle. */
  private stroll(out: THREE.Vector3): void {
    const e = this.path, p = this.hero.pos;
    const a = Math.atan2((p.z - e.cz) / e.rz, (p.x - e.cx) / e.rx) + 0.42;
    out.set(e.cx + Math.cos(a) * e.rx - p.x, 0, e.cz + Math.sin(a) * e.rz - p.z);
    const l = out.length();
    if (l > 1e-4) out.multiplyScalar(Math.min(0.5, l) / l);
  }

  focusAttention(): void {
    this.rig.focus(this.attention, 1.4, 0.72);
    this.ui.toast('attention → focal point');
  }

  playCinematic(): void {
    if (this.rig.cinematicActive) {
      this.rig.skipCinematic();
      this.ui.toast('cinematic skipped');
      return;
    }
    this.ui.toast('cinematic');
    void this.rig.cinematic(this.cinematicShots()).then(() => this.ui.toast('back to follow cam'));
  }

  shake(): void {
    this.rig.shake(0.85, 0.55);
    this.rig.punch(-7, 0.3);
    this.engine.hitstop(0.08);
    this.engine.post.pulse('chromatic', 0.8);
    this.hero.squash.impulse(-3);
  }

  /** Hero position in 0..1 screen coordinates (iris focus). */
  heroScreen(): { x: number; y: number } {
    const v = this.tmp.copy(this.hero.root.position);
    v.y += 0.7;
    v.project(this.camera);
    return { x: v.x * 0.5 + 0.5, y: 0.5 - v.y * 0.5 };
  }

  protected flicker(light: THREE.PointLight, speed = 3, depth = 0.22): void {
    this.lights.push({ light, base: light.intensity, seed: this.rng.int(0, 9999), speed, depth });
  }
  protected addFlame(parent: THREE.Object3D, x: number, y: number, z: number, size: number, speed = 6): THREE.Group {
    const f = makeFlame(size);
    f.position.set(x, y, z);
    parent.add(f);
    this.flames.push({ obj: f, sx: 1, sy: 1, seed: this.rng.int(0, 9999), speed });
    return f;
  }
  protected pointLight(color: string, intensity: number, x: number, y: number, z: number, distance = 0): THREE.PointLight {
    const l = new THREE.PointLight(color, intensity, distance, 2);
    l.position.set(x, y, z);
    this.scene.add(l);
    return l;
  }
}

/** Push `p` out of an axis-aligned box grown by `r` (XZ only). */
function pushOutBox(p: THREE.Vector3, minX: number, maxX: number, minZ: number, maxZ: number, r: number): void {
  const x0 = minX - r, x1 = maxX + r, z0 = minZ - r, z1 = maxZ + r;
  if (p.x <= x0 || p.x >= x1 || p.z <= z0 || p.z >= z1) return;
  const dl = p.x - x0, dr = x1 - p.x, dn = p.z - z0, df = z1 - p.z;
  const m = Math.min(dl, dr, dn, df);
  if (m === dl) p.x = x0;
  else if (m === dr) p.x = x1;
  else if (m === dn) p.z = z0;
  else p.z = z1;
}
function pushOutCircle(p: THREE.Vector3, cx: number, cz: number, r: number): void {
  const dx = p.x - cx, dz = p.z - cz;
  const d = Math.hypot(dx, dz);
  if (d >= r) return;
  if (d < 1e-5) {
    p.x = cx + r;
    return;
  }
  p.x = cx + (dx / d) * r;
  p.z = cz + (dz / d) * r;
}

// ---------------------------------------------------------------------------------------------
// Scene 1: the floor of the well.
// ---------------------------------------------------------------------------------------------
const WELL_R = 11.5;
const WELL_H = 44;
const FLOOR_Y = 0.13;
const CRYSTAL_LIGHT = 18;

const SKY_VERT = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const SKY_FRAG = /* glsl */ `
uniform float uTime;
varying vec2 vUv;
float h21(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main() {
  vec2 p = vUv - 0.5;
  float r = length(p) * 2.0;
  vec3 col = mix(vec3(0.13, 0.24, 0.5), vec3(0.03, 0.06, 0.16), smoothstep(0.0, 1.0, r));
  vec2 g = vUv * 70.0;
  vec2 id = floor(g);
  vec2 f = fract(g) - 0.5;
  float s = h21(id);
  vec2 o = vec2(h21(id + 1.7), h21(id + 9.3)) - 0.5;
  float star = step(0.9, s) * smoothstep(0.11, 0.0, length(f - o * 0.6));
  col += star * (0.8 + 1.6 * h21(id + 3.1)) * (0.75 + 0.25 * sin(uTime * 2.3 + s * 50.0));
  vec2 m = p - vec2(0.13, 0.08);
  float d = length(m);
  float disc = smoothstep(0.072, 0.066, d);
  float bite = smoothstep(0.066, 0.06, length(m - vec2(0.03, 0.022)));
  col += vec3(1.0, 0.95, 0.84) * disc * (1.0 - bite * 0.85) * 3.2;
  col += vec3(0.45, 0.62, 1.0) * exp(-d * 7.0) * 0.55;
  col *= mix(1.0, 0.25, smoothstep(0.8, 1.0, r));
  gl_FragColor = vec4(col, 1.0);
}`;
const SHAFT_VERT = /* glsl */ `
varying float vY;
varying vec3 vN;
varying vec3 vV;
void main() {
  vY = uv.y;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vN = normalize(mat3(modelMatrix) * normal);
  vV = normalize(cameraPosition - wp.xyz);
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;
const SHAFT_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform float uStrength;
uniform float uTime;
varying float vY;
varying vec3 vN;
varying vec3 vV;
void main() {
  float facing = pow(abs(dot(normalize(vN), normalize(vV))), 2.5);
  float fade = smoothstep(0.0, 0.3, vY) * (0.3 + 0.7 * vY);
  float drift = 0.8 + 0.2 * sin(uTime * 0.6 + vY * 9.0);
  gl_FragColor = vec4(uColor * facing * fade * drift * uStrength, 1.0);
}`;

function brickTextures(rng: SeededRng): { map: THREE.CanvasTexture; bump: THREE.CanvasTexture } {
  const S = 512, rows = 14, cols = 5, rh = S / rows, cw = S / cols;
  const tones: string[][] = [];
  const palette = ['#56606f', '#4b5462', '#606a79', '#687382', '#525b69'];
  for (let r = 0; r < rows; r++) {
    const row: string[] = [];
    for (let c = 0; c < cols; c++) row.push(rng.chance(0.12) ? rng.pick(['#4f6650', '#5a6d4f']) : rng.pick(palette));
    tones.push(row);
  }
  const each = (fn: (x: number, y: number, w: number, h: number, tone: string) => void): void => {
    for (let r = 0; r < rows; r++) {
      const off = (r % 2) * cw * 0.5;
      for (let i = -1; i <= cols; i++) fn(i * cw + off, r * rh, cw, rh, tones[r][((i % cols) + cols) % cols]);
    }
  };
  const specks = createRng(rng.int(0, 1e6));
  const map = canvasTexture(S, S, (g) => {
    g.fillStyle = '#1b1f27';
    g.fillRect(0, 0, S, S);
    each((x, y, w, h, tone) => {
      g.fillStyle = tone;
      g.beginPath();
      g.roundRect(x + 3, y + 3, w - 6, h - 6, 5);
      g.fill();
      g.fillStyle = 'rgba(255,255,255,0.07)';
      g.fillRect(x + 6, y + 4, w - 12, 3);
      g.fillStyle = 'rgba(0,0,0,0.22)';
      g.fillRect(x + 5, y + h - 8, w - 10, 4);
    });
    for (let i = 0; i < 1400; i++) {
      g.fillStyle = specks.chance(0.5) ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.12)';
      g.fillRect(specks.range(0, S), specks.range(0, S), 2, 2);
    }
  });
  const bump = canvasTexture(S, S, (g) => {
    g.fillStyle = '#000';
    g.fillRect(0, 0, S, S);
    each((x, y, w, h) => {
      g.fillStyle = '#c8c8c8';
      g.beginPath();
      g.roundRect(x + 3, y + 3, w - 6, h - 6, 6);
      g.fill();
    });
  }, false);
  for (const t of [map, bump]) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return { map, bump };
}

class OrbitScene extends DemoScene {
  readonly id = 'orbit' as const;
  readonly title = 'The Well Floor';
  readonly look = 'well';
  readonly attention = V(0, 3.0, 0);
  protected readonly path: Ellipse = { cx: 0, cz: 0, rx: 4.6, rz: 4.6 };
  protected readonly start = { x: 0, z: -4.6 };
  private crystal!: THREE.Group;
  private crystalLight!: THREE.PointLight;
  private halo!: THREE.Mesh;
  private readonly orbiters: Array<{ m: THREE.Mesh; r: number; speed: number; phase: number; y: number; tilt: number; spin: THREE.Vector3 }> = [];
  private readonly timed: THREE.ShaderMaterial[] = [];
  private frog!: THREE.Group;

  constructor(engine: GameEngine, ui: DemoUi) {
    super(engine, ui, 0x5eed01, '#e5484d');
    this.hero.groundY = FLOOR_Y;
  }

  protected constrain(p: THREE.Vector3): void {
    const r = Math.hypot(p.x, p.z);
    if (r > 8.5) p.multiplyScalar(8.5 / r);
    pushOutCircle(p, 0, 0, 2.75);
    pushOutCircle(p, -6.4, 2.8, 1.0);
    pushOutCircle(p, 6.6, 2.2, 1.0);
    pushOutCircle(p, -5.4, 5.6, 0.9);
  }

  cinematicShots(): CameraShot[] {
    return [
      { position: V(3.9, 1.0, -3.7), target: V(0, 2.9, 0), fov: 40, duration: 1.8, ease: 'inOutCubic', hold: 0.5 },
      { position: V(-4.3, 1.5, -2.4), target: V(0, 3.1, 0), fov: 44, duration: 2.2, ease: 'inOutSine' },
      { position: V(-2.0, 1.1, -3.3), target: V(1.2, WELL_H, 2.2), fov: 64, duration: 2.6, ease: 'inOutCubic', hold: 1.2 },
    ];
  }

  protected build(): void {
    const s = this.scene, rng = this.rng;
    s.background = new THREE.Color('#050912');
    s.fog = new THREE.FogExp2('#0a1322', 0.026);

    // --- light ------------------------------------------------------------------------------
    s.add(new THREE.HemisphereLight('#5d7cc0', '#1a130e', 1.0));
    const moon = new THREE.DirectionalLight('#c3d8ff', 2.4);
    moon.position.set(5, 36, 6);
    moon.castShadow = true;
    const sc = moon.shadow.camera;
    sc.left = sc.bottom = -12.5;
    sc.right = sc.top = 12.5;
    sc.near = 5;
    sc.far = 70;
    moon.shadow.mapSize.set(2048, 2048);
    moon.shadow.bias = -0.0004;
    moon.shadow.normalBias = 0.035;
    s.add(moon, moon.target);

    // --- floor: concentric flagstones around a rune slab ------------------------------------
    s.add(mesh(new THREE.CircleGeometry(9.3, 64).rotateX(-Math.PI / 2), std('#171a21', 1), 0, 0, 0, 'receive'));
    const stones = new Batch();
    const tones = ['#5b6576', '#667183', '#717b8b', '#535c6b', '#6a7280'];
    let ring = 0;
    for (let r = 2.95; r < 9.0; r += 0.98, ring++) {
      const n = Math.max(10, Math.round((TAU * r) / 1.08));
      for (let i = 0; i < n; i++) {
        const a = ((i + (ring % 2) * 0.5 + rng.range(-0.06, 0.06)) / n) * TAU;
        const w = (TAU * r) / n - 0.09 - rng.range(0, 0.07);
        const rr = r + rng.range(-0.05, 0.05);
        const mossy = rng.chance(0.1 + ring * 0.025);
        stones.add(Math.cos(a) * rr, FLOOR_Y - 0.15 + rng.range(-0.025, 0.03), Math.sin(a) * rr, w, 1, rng.range(0.8, 0.9),
          -a - Math.PI / 2, mossy ? rng.pick(['#56704f', '#4f6849']) : rng.pick(tones), rng.range(-0.025, 0.025), rng.range(-0.025, 0.025), rng.range(0.85, 1.12));
      }
    }
    const stoneGeo = new RoundedBoxGeometry(1, 0.3, 1, 2, 0.07);
    const stoneMat = std('#ffffff', 0.86);
    s.add(stones.build(stoneGeo, stoneMat, false, true));

    const slabMat = std('#646d7c', 0.8, { flatShading: true });
    s.add(mesh(new THREE.CylinderGeometry(2.45, 2.6, 0.32, 16), slabMat, 0, FLOOR_Y - 0.14, 0, 'receive'));
    const rune = glowMat('#7fe9ff', 2.2);
    const runeRing = mesh(new THREE.RingGeometry(2.14, 2.22, 72).rotateX(-Math.PI / 2), rune, 0, FLOOR_Y + 0.025, 0, 'none');
    s.add(runeRing);
    const ticks = new Batch();
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * TAU;
      const long = i % 2 === 0;
      ticks.add(Math.cos(a) * 2.0, FLOOR_Y + 0.02, Math.sin(a) * 2.0, long ? 0.26 : 0.12, 0.02, 0.05, -a, '#ffffff');
    }
    s.add(ticks.build(new THREE.BoxGeometry(1, 1, 1), rune, false, false));

    // --- water channel + curb + rim stones --------------------------------------------------
    const water = mesh(new THREE.RingGeometry(9.2, WELL_R + 0.2, 96, 1).rotateX(-Math.PI / 2),
      std('#0a1a27', 0.1, { metalness: 0.2, emissive: '#051019' }), 0, 0.03, 0, 'receive');
    s.add(water);
    const curb = new Batch();
    const nCurb = 62;
    for (let i = 0; i < nCurb; i++) {
      const a = ((i + rng.range(-0.1, 0.1)) / nCurb) * TAU;
      curb.add(Math.cos(a) * 9.18, FLOOR_Y - 0.08, Math.sin(a) * 9.18, (TAU * 9.18) / nCurb - 0.06, 0.95, 0.42, -a - Math.PI / 2, rng.pick(tones), 0, 0, rng.range(0.75, 0.95));
    }
    s.add(curb.build(stoneGeo, stoneMat));
    const rim = new Batch();
    const nRim = 46;
    for (let i = 0; i < nRim; i++) {
      const a = ((i + rng.range(-0.08, 0.08)) / nRim) * TAU;
      const h = rng.range(0.9, 1.5);
      rim.add(Math.cos(a) * (WELL_R - 0.35), h / 2 - 0.1, Math.sin(a) * (WELL_R - 0.35), (TAU * WELL_R) / nRim + 0.1, h, 0.95, -a - Math.PI / 2,
        rng.chance(0.3) ? '#4c6248' : rng.pick(['#474f5c', '#3f4652', '#515a67']), rng.range(-0.04, 0.04), rng.range(-0.05, 0.05), rng.range(0.8, 1.0));
    }
    s.add(rim.build(new RoundedBoxGeometry(1, 1, 1, 2, 0.12), stoneMat));

    // Moss cushions: soft clumps hugging the curb and the joints between flagstones.
    const moss = new Batch();
    for (let i = 0; i < 115; i++) {
      const a = rng.range(0, TAU);
      const r = rng.chance(0.6) ? rng.range(8.7, 9.2) : rng.range(3.4, 8.4);
      const clump = rng.int(1, 3);
      for (let j = 0; j < clump; j++) {
        const sz = rng.range(0.7, 1.35) * (j ? 0.7 : 1);
        const ox = j ? rng.range(-0.14, 0.14) : 0, oz = j ? rng.range(-0.14, 0.14) : 0;
        moss.add(Math.cos(a) * r + ox, FLOOR_Y + 0.02, Math.sin(a) * r + oz, sz, sz * rng.range(0.45, 0.7), sz * rng.range(0.8, 1.2), rng.range(0, TAU),
          rng.pick(['#6e9f55', '#79ab5d', '#62914c', '#86b565']), 0, 0, rng.range(0.75, 0.95));
      }
    }
    s.add(moss.build(new THREE.IcosahedronGeometry(0.12, 1), std('#ffffff', 0.95), false, true));

    // --- the shaft: brick cylinder seen from inside (near side culls away) -------------------
    const { map, bump } = brickTextures(rng);
    map.repeat.set(16, 9);
    bump.repeat.copy(map.repeat);
    const shaftGeo = new THREE.CylinderGeometry(WELL_R, WELL_R, WELL_H, 80, 16, true);
    const pos = shaftGeo.getAttribute('position');
    const colors = new Float32Array(pos.count * 3);
    const c = new THREE.Color();
    const low = new THREE.Color('#6f8a68'), mid = new THREE.Color('#ffffff'), high = new THREE.Color('#58627a');
    for (let i = 0; i < pos.count; i++) {
      const k = (pos.getY(i) + WELL_H / 2) / WELL_H;
      if (k < 0.08) c.copy(low).lerp(mid, k / 0.08);
      else c.copy(mid).lerp(high, Math.min(1, (k - 0.08) / 0.6));
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    shaftGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const shaft = mesh(shaftGeo, new THREE.MeshStandardMaterial({
      map, bumpMap: bump, bumpScale: 2.2, vertexColors: true, roughness: 0.92, side: THREE.BackSide,
    }), 0, WELL_H / 2 - 0.2, 0, 'receive');
    s.add(shaft);
    const lip = mesh(new THREE.TorusGeometry(WELL_R + 0.1, 0.55, 8, 64).rotateX(Math.PI / 2), std('#3b4250', 0.9), 0, WELL_H - 0.2, 0, 'none');
    s.add(lip);
    const skyMat = new THREE.ShaderMaterial({ vertexShader: SKY_VERT, fragmentShader: SKY_FRAG, uniforms: { uTime: { value: 0 } }, fog: false });
    this.timed.push(skyMat);
    const sky = mesh(new THREE.CircleGeometry(WELL_R + 0.4, 72).rotateX(Math.PI / 2), skyMat, 0, WELL_H + 0.2, 0, 'none');
    s.add(sky);

    // Moonbeam: an additive, view-faded cylinder from the opening onto the pedestal.
    const beamMat = new THREE.ShaderMaterial({
      vertexShader: SHAFT_VERT, fragmentShader: SHAFT_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      uniforms: { uColor: { value: new THREE.Color('#9fc2ff') }, uStrength: { value: 0.13 }, uTime: { value: 0 } },
    });
    this.timed.push(beamMat);
    const top = V(5, 36, 6).multiplyScalar(WELL_H / 36);
    const beamGeo = new THREE.CylinderGeometry(3.6, 2.9, top.length(), 40, 1, true).translate(0, top.length() / 2, 0);
    const beam = mesh(beamGeo, beamMat, 0.2, 0, 0.3, 'none');
    beam.quaternion.setFromUnitVectors(V(0, 1, 0), top.clone().normalize());
    beam.renderOrder = 6;
    s.add(beam);

    // --- pedestal and crystal ------------------------------------------------------------------
    const pedMat = std('#8a93a4', 0.72, { flatShading: true });
    const pedDark = std('#5e6676', 0.8, { flatShading: true });
    s.add(mesh(new THREE.CylinderGeometry(1.55, 1.72, 0.45, 8), pedMat, 0, FLOOR_Y + 0.2, 0));
    s.add(mesh(new THREE.CylinderGeometry(0.82, 1.02, 1.25, 8), pedDark, 0, FLOOR_Y + 1.05, 0));
    s.add(mesh(new THREE.CylinderGeometry(1.28, 1.06, 0.3, 8), pedMat, 0, FLOOR_Y + 1.8, 0));
    const band = mesh(new THREE.TorusGeometry(0.93, 0.045, 8, 48).rotateX(Math.PI / 2), glowMat('#7fe9ff', 3), 0, FLOOR_Y + 1.0, 0, 'none');
    s.add(band);
    const prongs = new Batch();
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * TAU + Math.PI / 4;
      prongs.add(Math.cos(a) * 0.82, FLOOR_Y + 2.18, Math.sin(a) * 0.82, 1, 1, 1, 0, '#b9c2d0', Math.sin(a) * -0.35, 0, 1);
    }
    s.add(prongs.build(new THREE.ConeGeometry(0.1, 0.5, 6), std('#ffffff', 0.5, { metalness: 0.4, flatShading: true })));

    this.crystal = new THREE.Group();
    this.crystal.position.set(0, 3.15, 0);
    const gem = mesh(new THREE.OctahedronGeometry(0.55, 0), new THREE.MeshStandardMaterial({
      color: '#c6f7ff', emissive: '#35cfff', emissiveIntensity: 1.6, roughness: 0.18, metalness: 0.1, flatShading: true,
    }), 0, 0, 0, 'cast');
    gem.scale.set(1, 1.75, 1);
    const core = mesh(new THREE.OctahedronGeometry(0.22, 0), glowMat('#ffffff', 4), 0, 0, 0, 'none');
    core.scale.set(1, 1.7, 1);
    this.crystal.add(gem, core, glowSprite(this.dot, '#7fe9ff', 3.6, 0.55));
    this.halo = mesh(new THREE.TorusGeometry(0.95, 0.018, 6, 64), glowMat('#bff6ff', 3), 0, 0, 0, 'none');
    this.crystal.add(this.halo);
    s.add(this.crystal);
    this.crystalLight = this.pointLight('#6fe3ff', CRYSTAL_LIGHT, 0, 3.4, 0);

    // Orbiting bevelled shapes.
    const shapes: Array<[THREE.BufferGeometry, string, boolean]> = [
      [new RoundedBoxGeometry(0.56, 0.56, 0.56, 4, 0.12), '#ff7a6b', false],
      [new THREE.TorusGeometry(0.3, 0.12, 14, 32), '#ffc857', false],
      [new THREE.IcosahedronGeometry(0.38, 0), '#69e0a8', true],
      [new THREE.DodecahedronGeometry(0.36, 0), '#a88bff', true],
      [new THREE.CapsuleGeometry(0.17, 0.38, 6, 14), '#6ec8ff', false],
      [new THREE.TorusKnotGeometry(0.24, 0.075, 80, 10), '#ff8ad8', false],
      [new THREE.OctahedronGeometry(0.36, 0), '#ffa04d', true],
      [new RoundedBoxGeometry(0.36, 0.7, 0.36, 4, 0.1), '#4fd1c5', false],
    ];
    shapes.forEach(([geo, color, flat], i) => {
      const m = mesh(geo, new THREE.MeshStandardMaterial({
        color, roughness: 0.32, metalness: 0.12, flatShading: flat, emissive: color, emissiveIntensity: 0.16,
      }), 0, 0, 0, 'cast');
      this.orbiters.push({
        m, r: 2.3 + (i % 3) * 0.55 + rng.range(-0.1, 0.1), speed: (i % 2 ? -1 : 1) * rng.range(0.32, 0.5), phase: (i / shapes.length) * TAU,
        y: 2.5 + rng.range(-0.3, 1.2), tilt: rng.range(0.15, 0.5), spin: V(rng.range(-1, 1), rng.range(0.4, 1.4), rng.range(-1, 1)),
      });
      s.add(m);
    });

    // --- braziers ------------------------------------------------------------------------------
    const iron = std('#2d313a', 0.55, { metalness: 0.6 });
    const bowlGeo = new THREE.LatheGeometry([V(0.02, 0, 0), V(0.35, 0.02, 0), V(0.6, 0.22, 0), V(0.66, 0.42, 0), V(0.58, 0.42, 0), V(0.5, 0.3, 0), V(0.02, 0.26, 0)].map((p) => new THREE.Vector2(p.x, p.y)), 12);
    for (const [bx, bz] of [[-6.4, 2.8], [6.6, 2.2]] as const) {
      const g = new THREE.Group();
      g.position.set(bx, FLOOR_Y, bz);
      g.add(mesh(new THREE.CylinderGeometry(0.16, 0.42, 0.9, 8), iron, 0, 0.45, 0));
      g.add(mesh(bowlGeo, iron, 0, 0.88, 0));
      const coals = mesh(new THREE.IcosahedronGeometry(0.46, 1), glowMat('#ff5a1f', 1.8), 0, 1.12, 0, 'none');
      coals.scale.set(1, 0.3, 1);
      g.add(coals, glowSprite(this.dot, '#ff8a3d', 3.4, 0.5));
      g.children[g.children.length - 1].position.y = 1.5;
      this.addFlame(g, 0, 1.1, 0, 0.62, 5);
      this.addFlame(g, 0.18, 1.1, 0.1, 0.4, 7);
      this.addFlame(g, -0.16, 1.1, -0.08, 0.36, 6.5);
      s.add(g);
      this.flicker(this.pointLight('#ff8a3d', 22, bx, FLOOR_Y + 1.8, bz), 3.2, 0.25);
    }

    // --- rope and bucket, an arched door, a frog looking up -----------------------------------
    const rope = new THREE.CatmullRomCurve3([V(-5.2, WELL_H, 6.4), V(-5.35, 24, 6.0), V(-5.45, 6, 5.7), V(-5.45, 1.55, 5.6)]);
    s.add(mesh(new THREE.TubeGeometry(rope, 48, 0.05, 6, false), std('#b58d5c', 0.95), 0, 0, 0, 'cast'));
    const bucket = new THREE.Group();
    bucket.position.set(-5.45, FLOOR_Y, 5.6);
    const wood = std('#8a5a36', 0.85);
    bucket.add(mesh(new THREE.CylinderGeometry(0.44, 0.36, 0.62, 14, 1, true), new THREE.MeshStandardMaterial({ color: '#8a5a36', roughness: 0.85, side: THREE.DoubleSide }), 0, 0.31, 0));
    bucket.add(mesh(new THREE.CircleGeometry(0.4, 14).rotateX(-Math.PI / 2), std('#0c1a26', 0.08, { emissive: '#08202c' }), 0, 0.46, 0, 'none'));
    for (const y of [0.12, 0.5]) bucket.add(mesh(new THREE.TorusGeometry(0.37 + y * 0.12, 0.025, 6, 28).rotateX(Math.PI / 2), iron, 0, y, 0));
    bucket.add(mesh(new THREE.TorusGeometry(0.42, 0.02, 6, 20, Math.PI), iron, 0, 0.62, 0));
    bucket.rotation.z = 0.06;
    s.add(bucket);
    void wood;

    const doorA = 2.62;
    const door = new THREE.Group();
    door.position.set(Math.cos(doorA) * (WELL_R - 0.55), FLOOR_Y - 0.05, Math.sin(doorA) * (WELL_R - 0.55));
    door.lookAt(0, FLOOR_Y, 0);
    const arch = new Batch();
    for (const sx of [-1, 1]) for (let i = 0; i < 4; i++) arch.add(sx * 1.4, 0.3 + i * 0.58, 0, 0.55, 0.54, 0.62, 0, rng.pick(['#747d8c', '#687181', '#7d8695']));
    for (let i = 0; i <= 8; i++) {
      const a = (i / 8) * Math.PI;
      arch.add(Math.cos(a) * 1.4, 2.3 + Math.sin(a) * 1.4, 0, 0.55, 0.5, 0.64, 0, i === 4 ? '#9aa6b8' : rng.pick(['#747d8c', '#687181', '#7d8695']), 0, 0, a - Math.PI / 2 + Math.PI / 2 - Math.PI / 2);
    }
    door.add(arch.build(new RoundedBoxGeometry(1, 1, 1, 2, 0.08), stoneMat));
    const dark = canvasTexture(64, 128, (g) => {
      const gr = g.createLinearGradient(0, 0, 0, 128);
      gr.addColorStop(0, '#02040a');
      gr.addColorStop(1, '#0b1a2a');
      g.fillStyle = gr;
      g.fillRect(0, 0, 64, 128);
    });
    const openShape = new THREE.Shape();
    openShape.moveTo(-1.15, 0);
    openShape.lineTo(1.15, 0);
    openShape.lineTo(1.15, 2.3);
    openShape.absarc(0, 2.3, 1.15, 0, Math.PI, false);
    openShape.lineTo(-1.15, 0);
    const opening = new THREE.ShapeGeometry(openShape, 16);
    opening.computeBoundingBox();
    const uv = opening.getAttribute('uv');
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) + 1.15) / 2.3, uv.getY(i) / 3.45);
    door.add(mesh(opening, new THREE.MeshBasicMaterial({ map: dark }), 0, 0, -0.15, 'none'));
    const sigil = mesh(new THREE.TorusGeometry(0.42, 0.035, 6, 48), glowMat('#ffc857', 3.2), 0, 2.0, -0.05, 'none');
    const sigilIn = mesh(new THREE.OctahedronGeometry(0.14, 0), glowMat('#ffe7a8', 3.5), 0, 2.0, -0.05, 'none');
    door.add(sigil, sigilIn, glowSprite(this.dot, '#ffc857', 2.4, 0.45));
    door.children[door.children.length - 1].position.set(0, 2.0, 0.1);
    for (let i = 0; i < 2; i++) door.add(mesh(new RoundedBoxGeometry(3.4 - i * 0.5, 0.18, 0.8, 2, 0.05), stoneMat.clone(), 0, 0.05 + i * 0.18, 0.55 + i * -0.25));
    s.add(door);
    const doorGlow = this.pointLight('#ffc857', 6, door.position.x * 0.9, 1.6, door.position.z * 0.9);
    this.flicker(doorGlow, 1.2, 0.18);

    this.frog = new THREE.Group();
    const pa = 0.42, pr = 10.1;
    this.frog.position.set(Math.cos(pa) * pr, 0.05, Math.sin(pa) * pr);
    const pad = mesh(new THREE.CircleGeometry(0.55, 22, 0.35, TAU - 0.7).rotateX(-Math.PI / 2), std('#3f8a4a', 0.6, { side: THREE.DoubleSide }), 0, 0, 0, 'receive');
    const frogMat = std('#78c25e', 0.5);
    const fb = mesh(new THREE.SphereGeometry(0.24, 16, 10), frogMat, 0, 0.16, 0, 'cast');
    fb.scale.set(1.1, 0.72, 1.2);
    this.frog.add(pad, fb);
    for (const sx of [-1, 1]) {
      this.frog.add(mesh(new THREE.SphereGeometry(0.085, 12, 8), frogMat, sx * 0.12, 0.33, 0.12, 'cast'));
      this.frog.add(mesh(new THREE.SphereGeometry(0.045, 10, 6), std('#101015', 0.2), sx * 0.13, 0.36, 0.18, 'none'));
    }
    this.frog.lookAt(0, 0.05, 0);
    this.frog.children.slice(1).forEach((o) => (o.rotation.x = -0.35));
    s.add(this.frog);

    // --- dust in the moonlight ---------------------------------------------------------------
    const motes = new Motes(260, rng, this.dot, '#cfe6ff', 0.1, (v) => {
      const a = rng.range(0, TAU), r = Math.sqrt(rng.next()) * 9;
      v.set(Math.cos(a) * r, 0, Math.sin(a) * r);
    }, 0.3, 11, 0.22, 0.75);
    s.add(motes.points);
    this.motes.push(motes);
  }

  protected override animate(dt: number): void {
    const t = this.t;
    this.crystal.position.y = 3.15 + Math.sin(t * 1.3) * 0.12;
    this.crystal.rotation.y = t * 0.6;
    this.halo.rotation.set(Math.PI / 2 + Math.sin(t * 0.7) * 0.35, 0, t * 0.4);
    this.crystalLight.intensity = CRYSTAL_LIGHT * (0.9 + 0.1 * Math.sin(t * 2.1));
    for (const o of this.orbiters) {
      const a = o.phase + t * o.speed;
      o.m.position.set(Math.cos(a) * o.r, o.y + Math.sin(a * 2 + o.phase) * 0.22 + Math.sin(a) * o.tilt, Math.sin(a) * o.r);
      o.m.rotation.x += o.spin.x * dt;
      o.m.rotation.y += o.spin.y * dt;
      o.m.rotation.z += o.spin.z * dt;
    }
    for (const m of this.timed) m.uniforms.uTime.value = t;
    this.frog.position.y = 0.05 + Math.max(0, Math.sin(t * 0.9)) ** 12 * 0.1;
  }
}

// ---------------------------------------------------------------------------------------------
// Scene 2: the warm hall.
// ---------------------------------------------------------------------------------------------
const HALL_W = 9;
const HALL_ZF = -7;
const HALL_ZB = 7;
const HALL_H = 4.2;
const PLANK_Y = 0.07;

function plasterTexture(rng: SeededRng): THREE.CanvasTexture {
  const t = canvasTexture(256, 256, (g) => {
    g.fillStyle = '#e9d2b4';
    g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 260; i++) {
      const r = rng.range(6, 34);
      g.fillStyle = rng.chance(0.5) ? `rgba(120,80,50,${rng.range(0.02, 0.06)})` : `rgba(255,245,230,${rng.range(0.03, 0.08)})`;
      g.beginPath();
      g.arc(rng.range(0, 256), rng.range(0, 256), r, 0, TAU);
      g.fill();
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function rugTexture(rng: SeededRng): THREE.CanvasTexture {
  return canvasTexture(512, 288, (g) => {
    const W = 512, H = 288;
    g.fillStyle = '#7d1f27';
    g.fillRect(0, 0, W, H);
    g.strokeStyle = '#d9a441';
    g.lineWidth = 10;
    g.strokeRect(16, 16, W - 32, H - 32);
    g.fillStyle = '#4f1218';
    g.fillRect(30, 30, W - 60, H - 60);
    g.strokeStyle = '#e9c77a';
    g.lineWidth = 3;
    g.strokeRect(38, 38, W - 76, H - 76);
    const diamond = (cx: number, cy: number, rx: number, ry: number, fill: string, stroke?: string): void => {
      g.beginPath();
      g.moveTo(cx, cy - ry);
      g.lineTo(cx + rx, cy);
      g.lineTo(cx, cy + ry);
      g.lineTo(cx - rx, cy);
      g.closePath();
      g.fillStyle = fill;
      g.fill();
      if (stroke) {
        g.strokeStyle = stroke;
        g.lineWidth = 3;
        g.stroke();
      }
    };
    diamond(W / 2, H / 2, 120, 84, '#1f4f5a', '#e9c77a');
    diamond(W / 2, H / 2, 70, 48, '#8e2c3a', '#e9c77a');
    diamond(W / 2, H / 2, 26, 18, '#e9c77a');
    for (let i = 0; i < 9; i++) {
      const x = 62 + i * ((W - 124) / 8);
      diamond(x, 52, 9, 7, '#e9c77a');
      diamond(x, H - 52, 9, 7, '#e9c77a');
    }
    for (let i = 0; i < 2400; i++) {
      g.fillStyle = rng.chance(0.5) ? 'rgba(0,0,0,0.08)' : 'rgba(255,220,180,0.05)';
      g.fillRect(rng.range(0, W), rng.range(0, H), 2, 2);
    }
    g.fillStyle = '#e8dcc4';
    for (let x = 4; x < W; x += 6) {
      g.fillRect(x, 0, 2, 8);
      g.fillRect(x, H - 8, 2, 8);
    }
  });
}

function windowTexture(rng: SeededRng): THREE.CanvasTexture {
  return canvasTexture(128, 192, (g) => {
    const gr = g.createLinearGradient(0, 0, 0, 192);
    gr.addColorStop(0, '#1d2f66');
    gr.addColorStop(1, '#6f8fd8');
    g.fillStyle = gr;
    g.fillRect(0, 0, 128, 192);
    for (let i = 0; i < 26; i++) {
      g.fillStyle = `rgba(255,255,255,${rng.range(0.4, 0.95)})`;
      g.fillRect(rng.range(0, 128), rng.range(0, 110), 2, 2);
    }
    g.fillStyle = '#fff4d8';
    g.beginPath();
    g.arc(84, 46, 14, 0, TAU);
    g.fill();
    g.fillStyle = '#2a3f7e';
    g.beginPath();
    g.arc(90, 42, 12, 0, TAU);
    g.fill();
  });
}

function windowLightTexture(): THREE.CanvasTexture {
  return canvasTexture(256, 256, (g) => {
    g.filter = 'blur(10px)';
    g.fillStyle = '#ffffff';
    for (const [x, y] of [[36, 36], [134, 36], [36, 134], [134, 134]] as const) {
      g.beginPath();
      g.roundRect(x, y, 86, 86, 8);
      g.fill();
    }
  });
}

class HallScene extends DemoScene {
  readonly id = 'hall' as const;
  readonly title = 'The Warm Hall';
  readonly look = 'landing';
  readonly attention = V(0, 1.3, 6.2);
  protected readonly path: Ellipse = { cx: 0, cz: 1.6, rx: 5.0, rz: 3.5 };
  protected readonly start = { x: 0, z: -2.6 };
  private emblem!: THREE.Mesh;

  constructor(engine: GameEngine, ui: DemoUi) {
    super(engine, ui, 0x5eed02, '#2f8f9d');
    this.hero.groundY = PLANK_Y;
  }

  protected constrain(p: THREE.Vector3): void {
    p.x = clamp(p.x, -HALL_W + 0.75, HALL_W - 0.75);
    p.z = clamp(p.z, HALL_ZF + 0.5, 5.25);
    pushOutBox(p, -2.75, 2.75, 0.95, 3.45, 0.38);
    pushOutBox(p, 6.3, HALL_W, HALL_ZF, -5.0, 0.38);
    pushOutBox(p, 7.9, HALL_W, -0.5, 2.5, 0.38);
  }

  cinematicShots(): CameraShot[] {
    return [
      { position: V(-6.4, 1.5, -3.6), target: V(-0.8, 1.1, 2.2), fov: 44, duration: 1.8, ease: 'inOutCubic', hold: 0.3 },
      { position: V(-1.3, 1.35, 3.4), target: V(0, 1.35, 6.6), fov: 42, duration: 2.2, ease: 'inOutSine', hold: 0.7 },
      { position: V(6.9, 7.0, -5.9), target: V(0, 0.6, 2.4), fov: 52, duration: 2.4, ease: 'inOutCubic', hold: 0.6 },
    ];
  }

  protected build(): void {
    const s = this.scene, rng = this.rng;
    s.background = new THREE.Color('#120b07');
    s.fog = new THREE.FogExp2('#1b120c', 0.02);

    s.add(new THREE.HemisphereLight('#ffd3a1', '#2b1a10', 0.75));
    const key = new THREE.DirectionalLight('#ffdcb4', 1.5);
    key.position.set(5, 14, -4);
    key.target.position.set(0, 0, 1.5);
    key.castShadow = true;
    const sc = key.shadow.camera;
    sc.left = sc.bottom = -12;
    sc.right = sc.top = 12;
    sc.near = 2;
    sc.far = 40;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.bias = -0.0004;
    key.shadow.normalBias = 0.03;
    s.add(key, key.target);

    const woodDark = std('#4a2f1e', 0.8);
    const woodMid = std('#7a4a2c', 0.7);
    const plankGeo = new RoundedBoxGeometry(1, 0.14, 0.46, 1, 0.035);

    // --- floor --------------------------------------------------------------------------------
    s.add(mesh(new THREE.BoxGeometry(HALL_W * 2 + 0.4, 0.2, HALL_ZB - HALL_ZF + 0.4), std('#26170e', 1), 0, -0.1, (HALL_ZF + HALL_ZB) / 2, 'receive'));
    const planks = new Batch();
    const woods = ['#9a6a45', '#8a5b3a', '#a9774d', '#7b4f33', '#94643f'];
    for (let z = HALL_ZF + 0.25; z < HALL_ZB; z += 0.5) {
      let x = -HALL_W - rng.range(0, 1.6);
      while (x < HALL_W) {
        const len = rng.range(1.6, 3.3);
        const x0 = Math.max(-HALL_W, x), x1 = Math.min(HALL_W, x + len);
        if (x1 - x0 > 0.2) planks.add((x0 + x1) / 2, rng.range(-0.008, 0.008), z, x1 - x0 - 0.035, 1, 1, rng.range(-0.004, 0.004), rng.pick(woods), 0, 0, rng.range(0.85, 1.1));
        x += len;
      }
    }
    s.add(planks.build(plankGeo, std('#ffffff', 0.72), false, true));

    // Front cut edge: a sill beam so the diorama edge reads as intentional.
    s.add(mesh(new RoundedBoxGeometry(HALL_W * 2 + 0.8, 0.34, 0.4, 2, 0.06), woodDark, 0, -0.03, HALL_ZF - 0.05));

    // --- walls (three; the camera side is open) -------------------------------------------------
    const plaster = plasterTexture(rng);
    const wallMat = new THREE.MeshStandardMaterial({ color: '#d6b08a', map: plaster, roughness: 0.95 });
    s.add(mesh(new THREE.BoxGeometry(HALL_W * 2 + 0.8, HALL_H, 0.4), wallMat, 0, HALL_H / 2, HALL_ZB + 0.2));
    for (const sx of [-1, 1]) s.add(mesh(new THREE.BoxGeometry(0.4, HALL_H, HALL_ZB - HALL_ZF + 0.4), wallMat, sx * (HALL_W + 0.2), HALL_H / 2, (HALL_ZF + HALL_ZB) / 2 + 0.2));

    const beams = new Batch();
    const wood = '#5a3822';
    // top plates
    beams.add(0, HALL_H + 0.1, HALL_ZB + 0.2, HALL_W * 2 + 1, 0.3, 0.6, 0, wood);
    for (const sx of [-1, 1]) beams.add(sx * (HALL_W + 0.2), HALL_H + 0.1, (HALL_ZF + HALL_ZB) / 2 + 0.2, 0.6, 0.3, HALL_ZB - HALL_ZF + 0.9, 0, wood);
    // posts
    for (const z of [-6.8, -3.4, 0, 3.4, 6.8]) for (const sx of [-1, 1]) beams.add(sx * (HALL_W - 0.12), HALL_H / 2, z, 0.34, HALL_H, 0.34, 0, wood);
    for (const x of [-5.6, 5.6]) beams.add(x, HALL_H / 2, HALL_ZB - 0.12, 0.34, HALL_H, 0.34, 0, wood);
    // wainscot rail + panels
    beams.add(0, 1.22, HALL_ZB - 0.06, HALL_W * 2, 0.12, 0.14, 0, '#4a2f1e');
    for (const sx of [-1, 1]) beams.add(sx * (HALL_W - 0.06), 1.22, 0, 0.14, 0.12, HALL_ZB - HALL_ZF, 0, '#4a2f1e');
    beams.add(0, 0.6, HALL_ZB - 0.03, HALL_W * 2, 1.2, 0.06, 0, '#6b4329');
    for (const sx of [-1, 1]) beams.add(sx * (HALL_W - 0.03), 0.6, 0, 0.06, 1.2, HALL_ZB - HALL_ZF, 0, '#6b4329');
    s.add(beams.build(new RoundedBoxGeometry(1, 1, 1, 1, 0.02), std('#ffffff', 0.8)));

    // --- hearth ---------------------------------------------------------------------------------
    const hz = HALL_ZB - 0.35;
    const masonry = new Batch();
    const stoneTones = ['#8d8177', '#7c7068', '#9a8e82', '#6f655e', '#857a70'];
    for (let row = 0; row < 8; row++) {
      const y0 = row * 0.52;
      let x = -2.1 + (row % 2) * 0.3;
      while (x < 2.1) {
        const w = rng.range(0.55, 0.9);
        const x0 = Math.max(-2.1, x), x1 = Math.min(2.1, x + w);
        x += w;
        if (row < 3 && x1 > -1.15 && x0 < 1.15) {
          const l0 = Math.max(x0, 1.15), r1 = Math.min(x1, -1.15);
          if (x0 < -1.15 && r1 - x0 > 0.15) masonry.add((x0 + r1) / 2, y0 + 0.26, hz, r1 - x0 - 0.04, 0.48, 0.72, 0, rng.pick(stoneTones));
          if (x1 > 1.15 && x1 - l0 > 0.15) masonry.add((l0 + x1) / 2, y0 + 0.26, hz, x1 - l0 - 0.04, 0.48, 0.72, 0, rng.pick(stoneTones));
          continue;
        }
        if (row === 3 && x1 > -1.45 && x0 < 1.45) continue;
        if (x1 - x0 > 0.15) masonry.add((x0 + x1) / 2, y0 + 0.26, hz, x1 - x0 - 0.04, 0.48, 0.72, 0, rng.pick(stoneTones), 0, 0, rng.range(0.9, 1.08));
      }
    }
    masonry.add(0, 3 * 0.52 + 0.26, hz - 0.04, 2.9, 0.5, 0.8, 0, '#6a5f58');
    masonry.add(0, 0.08, hz - 0.85, 3.8, 0.16, 1.3, 0, '#7c7068');
    s.add(masonry.build(new RoundedBoxGeometry(1, 1, 1, 2, 0.06), std('#ffffff', 0.88)));
    s.add(mesh(new THREE.BoxGeometry(2.3, 1.56, 0.3), std('#120a07', 1, { emissive: '#250b02' }), 0, 0.78, hz + 0.2, 'receive'));
    const logs = std('#3a2518', 0.9);
    for (const [ry, x] of [[0.35, -0.2], [-0.3, 0.25], [0, 0]] as const) {
      const l = mesh(new THREE.CylinderGeometry(0.11, 0.12, 1.1, 8), logs, x, 0.3, hz - 0.15);
      l.rotation.set(0, ry, Math.PI / 2);
      s.add(l);
    }
    const fire = new THREE.Group();
    fire.position.set(0, 0.32, hz - 0.15);
    for (const [x, z, sz] of [[0, 0, 0.62], [-0.28, 0.05, 0.44], [0.3, -0.03, 0.48], [0.12, 0.1, 0.34], [-0.1, -0.1, 0.38]] as const) this.addFlame(fire, x, 0, z, sz, 5 + sz * 4);
    fire.add(glowSprite(this.dot, '#ff8a3d', 3.2, 0.55));
    s.add(fire);
    this.flicker(this.pointLight('#ff7a2e', 42, 0, 0.95, hz - 0.9), 3.4, 0.28);
    s.add(mesh(new RoundedBoxGeometry(4.5, 0.16, 0.95, 2, 0.04), woodMid, 0, 2.2, hz - 0.2));
    this.emblem = mesh(new THREE.TorusKnotGeometry(0.42, 0.11, 120, 14, 2, 3), std('#d4a64a', 0.3, { metalness: 0.85 }), 0, 3.3, hz - 0.45, 'cast');
    s.add(this.emblem);
    // mantel candles
    const wax = std('#f2e6cf', 0.6);
    for (const [x, h] of [[-1.7, 0.34], [-1.45, 0.22], [1.55, 0.28]] as const) {
      s.add(mesh(new THREE.CylinderGeometry(0.06, 0.065, h, 10), wax, x, 2.28 + h / 2, hz - 0.35));
      this.addFlame(s, x, 2.3 + h, hz - 0.35, 0.12, 9);
    }

    // --- banners --------------------------------------------------------------------------------
    const bannerShape = new THREE.Shape();
    bannerShape.moveTo(-0.55, 1.05);
    bannerShape.lineTo(0.55, 1.05);
    bannerShape.lineTo(0.55, -1.05);
    bannerShape.lineTo(0, -0.7);
    bannerShape.lineTo(-0.55, -1.05);
    bannerShape.closePath();
    const bannerGeo = new THREE.ShapeGeometry(bannerShape);
    const gold = std('#d9a441', 0.35, { metalness: 0.7 });
    for (const [x, col] of [[-3.9, '#1f6f78'], [3.9, '#8e2c3a']] as const) {
      const b = mesh(bannerGeo, std(col, 0.9, { side: THREE.DoubleSide }), x, 2.55, HALL_ZB - 0.03);
      b.rotation.y = Math.PI;
      s.add(b);
      const rod = mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.35, 8), gold, x, 3.62, HALL_ZB - 0.08);
      rod.rotation.z = Math.PI / 2;
      const ring = mesh(new THREE.TorusGeometry(0.2, 0.035, 6, 24), gold, x, 2.75, HALL_ZB - 0.06);
      s.add(rod, ring);
    }

    // --- rug, table, benches, table-top -------------------------------------------------------------
    s.add(mesh(new RoundedBoxGeometry(7.4, 0.03, 4.1, 1, 0.01), std('#ffffff', 0.95, { map: rugTexture(rng) }), 0, PLANK_Y + 0.015, 2.2, 'receive'));
    const furn = new Batch();
    furn.add(0, 0.92, 2.2, 5.2, 0.16, 1.3, 0, '#7a4a2c');
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) furn.add(sx * 2.25, 0.46, 2.2 + sz * 0.45, 0.16, 0.84, 0.16, 0, '#5a3822');
    for (const sz of [-1, 1]) {
      furn.add(0, 0.5, 2.2 + sz * 1.12, 4.8, 0.1, 0.4, 0, '#83502f');
      for (const sx of [-1, 1]) furn.add(sx * 2.0, 0.25, 2.2 + sz * 1.12, 0.12, 0.46, 0.3, 0, '#5a3822');
    }
    s.add(furn.build(new RoundedBoxGeometry(1, 1, 1, 2, 0.04), std('#ffffff', 0.7)));
    const brass = std('#c79a3e', 0.35, { metalness: 0.8 });
    const candleXs = [-1.8, -0.9, 0, 0.9, 1.8];
    candleXs.forEach((x, i) => {
      const h = [0.22, 0.3, 0.18, 0.26, 0.2][i];
      s.add(mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.03, 12), brass, x, 1.015, 2.2));
      s.add(mesh(new THREE.CylinderGeometry(0.05, 0.055, h, 10), wax, x, 1.03 + h / 2, 2.2));
      this.addFlame(s, x, 1.035 + h, 2.2, 0.11, 8 + i);
    });
    const mug = std('#cfc6b6', 0.55);
    for (const [x, z] of [[-1.3, 1.75], [0.5, 2.65], [1.4, 1.8], [-0.4, 1.7]] as const) s.add(mesh(new THREE.CylinderGeometry(0.075, 0.068, 0.15, 12), mug, x, 1.075, z));
    s.add(mesh(new THREE.SphereGeometry(0.3, 18, 8, 0, TAU, Math.PI / 2, Math.PI / 2), std('#9a6a3f', 0.6, { side: THREE.DoubleSide }), -0.45, 1.3, 2.35));
    for (const [x, z, col] of [[-0.55, 2.3, '#d8412f'], [-0.35, 2.42, '#f29a2e'], [-0.46, 2.52, '#8fbf3a']] as const) s.add(mesh(new THREE.SphereGeometry(0.1, 12, 8), std(col, 0.45), x, 1.12, z));
    this.flicker(this.pointLight('#ffc070', 7, 0, 1.75, 2.2), 5, 0.16);

    // --- lanterns -------------------------------------------------------------------------------
    const ironMat = std('#2b2622', 0.5, { metalness: 0.6 });
    for (const sx of [-1, 1]) for (const z of [-2.4, 3.9]) {
      const x = sx * (HALL_W - 0.45);
      const arm = mesh(new THREE.BoxGeometry(0.62, 0.05, 0.05), ironMat, sx * (HALL_W - 0.3), 3.05, z);
      const cap = mesh(new THREE.ConeGeometry(0.2, 0.16, 6), ironMat, x, 2.93, z);
      const glass = mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.3, 6), glowMat('#ffb45a', 2.4), x, 2.7, z, 'none');
      const base = mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.06, 6), ironMat, x, 2.53, z);
      const cage = mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.32, 6, 1, true), new THREE.MeshStandardMaterial({ color: '#2b2622', wireframe: true }), x, 2.7, z, 'none');
      const halo = glowSprite(this.dot, '#ffb45a', 1.7, 0.5);
      halo.position.set(x, 2.7, z);
      s.add(arm, cap, glass, base, cage, halo);
      this.flicker(this.pointLight('#ffae55', 11, x - sx * 0.3, 2.6, z), 2.6, 0.2);
    }

    // --- window + moonlight on the floor (left wall) ------------------------------------------
    const wz = 1.0;
    const winGroup = new THREE.Group();
    winGroup.position.set(-HALL_W + 0.02, 2.2, wz);
    winGroup.rotation.y = Math.PI / 2;
    winGroup.add(mesh(new THREE.PlaneGeometry(1.4, 2.1), new THREE.MeshBasicMaterial({ map: windowTexture(rng), fog: false }), 0, 0, 0, 'none'));
    const frame = new Batch();
    frame.add(0, 1.1, 0.05, 1.7, 0.16, 0.14, 0, wood);
    frame.add(0, -1.1, 0.08, 1.8, 0.16, 0.24, 0, wood);
    for (const x of [-0.78, 0.78]) frame.add(x, 0, 0.05, 0.16, 2.3, 0.14, 0, wood);
    frame.add(0, 0, 0.04, 0.07, 2.1, 0.08, 0, wood);
    frame.add(0, 0.1, 0.04, 1.4, 0.07, 0.08, 0, wood);
    winGroup.add(frame.build(new RoundedBoxGeometry(1, 1, 1, 1, 0.02), std('#ffffff', 0.8)));
    s.add(winGroup);
    const pool = mesh(new THREE.PlaneGeometry(2.3, 1.7).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({
      map: windowLightTexture(), color: '#7fa6ff', transparent: true, opacity: 0.32, blending: THREE.AdditiveBlending, depthWrite: false,
    }), -7.1, PLANK_Y + 0.02, wz + 0.25, 'none');
    pool.rotation.y = 0.08;
    s.add(pool);
    this.pointLight('#86a8ff', 7, -8.1, 2.4, wz);

    // --- bookshelf (right wall) ------------------------------------------------------------------
    const shelf = new Batch();
    const bx = HALL_W - 0.3;
    for (const z of [-0.5, 2.5]) shelf.add(bx, 1.45, z, 0.5, 2.9, 0.08, 0, '#5a3822');
    for (let i = 0; i < 5; i++) shelf.add(bx, 0.1 + i * 0.68, 1.0, 0.5, 0.06, 3.0, 0, '#5a3822');
    s.add(shelf.build(new RoundedBoxGeometry(1, 1, 1, 1, 0.015), std('#ffffff', 0.8)));
    const books = new Batch();
    const bookCols = ['#8e2c3a', '#1f6f78', '#c9a13b', '#3b5a8e', '#6b8e3b', '#7a3b8e', '#d8cfc0', '#a0522d', '#2f3e5c'];
    for (let lvl = 0; lvl < 4; lvl++) {
      let z = -0.42;
      while (z < 2.4) {
        const w = rng.range(0.06, 0.13);
        const h = rng.range(0.3, 0.5);
        if (rng.chance(0.08)) {
          z += 0.18;
          continue;
        }
        const lean = rng.chance(0.1) ? rng.range(-0.25, 0.25) : 0;
        books.add(bx - 0.03, 0.13 + lvl * 0.68 + h / 2, z + w / 2, rng.range(0.3, 0.38), h, w, 0, rng.pick(bookCols), lean, 0, rng.range(0.8, 1.05));
        z += w + 0.012;
      }
    }
    s.add(books.build(new RoundedBoxGeometry(1, 1, 1, 1, 0.012), std('#ffffff', 0.75)));

    // --- barrels, crates, plants --------------------------------------------------------------------
    const barrelGeo = new THREE.LatheGeometry([[0.001, 0], [0.36, 0], [0.43, 0.2], [0.46, 0.45], [0.43, 0.7], [0.36, 0.9], [0.001, 0.9]].map(([x, y]) => new THREE.Vector2(x, y)), 14);
    for (const [x, z] of [[-7.9, 6.2], [-7.0, 6.45], [-7.75, 5.25]] as const) {
      s.add(mesh(barrelGeo, std('#8a5a36', 0.8), x, PLANK_Y, z));
      for (const y of [0.18, 0.72]) s.add(mesh(new THREE.TorusGeometry(y < 0.4 ? 0.43 : 0.435, 0.022, 6, 28).rotateX(Math.PI / 2), ironMat, x, PLANK_Y + y, z));
    }
    const crateTex = canvasTexture(128, 128, (g) => {
      g.fillStyle = '#a4784c';
      g.fillRect(0, 0, 128, 128);
      g.strokeStyle = '#6b4a2c';
      g.lineWidth = 12;
      g.strokeRect(6, 6, 116, 116);
      g.lineWidth = 9;
      g.beginPath();
      g.moveTo(12, 12);
      g.lineTo(116, 116);
      g.stroke();
      g.fillStyle = 'rgba(0,0,0,0.12)';
      for (let y = 32; y < 128; y += 32) g.fillRect(0, y, 128, 2);
    });
    const crateMat = std('#ffffff', 0.85, { map: crateTex });
    const crateGeo = new RoundedBoxGeometry(0.82, 0.82, 0.82, 2, 0.04);
    for (const [x, y, z, ry] of [[7.6, 0.48, -5.9, 0.1], [6.75, 0.48, -6.2, -0.25], [7.35, 1.3, -6.0, 0.4]] as const) {
      const cr = mesh(crateGeo, crateMat, x, y, z);
      cr.rotation.y = ry;
      s.add(cr);
    }
    const leaf = std('#5d9c45', 0.8, { flatShading: true });
    const leafDark = std('#467a35', 0.8, { flatShading: true });
    for (const sx of [-1, 1]) {
      const px = sx * 2.85, pz = HALL_ZB - 0.6;
      s.add(mesh(new THREE.CylinderGeometry(0.3, 0.22, 0.5, 10), std('#b5623b', 0.8), px, PLANK_Y + 0.25, pz));
      s.add(mesh(new THREE.IcosahedronGeometry(0.42, 0), leaf, px, 0.95, pz));
      s.add(mesh(new THREE.IcosahedronGeometry(0.3, 0), leafDark, px + 0.2 * sx, 1.3, pz - 0.1));
      s.add(mesh(new THREE.IcosahedronGeometry(0.26, 0), leaf, px - 0.18 * sx, 1.35, pz + 0.12));
    }

    // Warm dust.
    const motes = new Motes(170, rng, this.dot, '#ffd9a0', 0.07, (v) => v.set(rng.range(-8, 8), 0, rng.range(-6, 6.5)), 0.3, 4.0, 0.12, 0.65);
    s.add(motes.points);
    this.motes.push(motes);
  }

  protected override animate(): void {
    this.emblem.rotation.z = this.t * 0.25;
  }
}

// ---------------------------------------------------------------------------------------------
// Boot.
// ---------------------------------------------------------------------------------------------
const KINDS: readonly TransitionKind[] = ['fade', 'iris', 'door', 'whiteout', 'glitch', 'none'];

export default function runtimeDemo(): void {
  const host = document.getElementById('app') ?? document.body;
  const ui = new DemoUi(host);
  const engine = new GameEngine(host, { ui, audio: SILENT_AUDIO });
  engine.scenes.register('orbit', () => new OrbitScene(engine, ui));
  engine.scenes.register('hall', () => new HallScene(engine, ui));

  const lookNames = Object.keys(POST_LOOKS);
  const active = (): DemoScene | null => {
    const s = engine.scenes.current;
    return s instanceof DemoScene ? s : null;
  };

  const switchScene = (kind: TransitionKind): void => {
    const cur = active();
    if (!cur || engine.scenes.transitioning) return;
    const next = cur.id === 'orbit' ? 'hall' : 'orbit';
    engine.scenes.nextTransition({ color: next === 'hall' ? '#ffb45a' : '#7fe9ff', focus: cur.heroScreen() });
    ui.toast(`${kind === 'none' ? 'cut' : kind} → ${next}`, kind === 'glitch' ? 'glitch' : 'info');
    void engine.scenes.go(next, {}, kind);
  };

  const cycleLook = (dir: number): void => {
    const i = lookNames.indexOf(engine.post.lookName);
    const name = lookNames[(i + dir + lookNames.length) % lookNames.length];
    engine.post.setLookByName(name, 0.6);
    ui.setLook(name);
    ui.toast(`look: ${name}`);
  };

  window.addEventListener('keydown', (e) => {
    if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
    const m = /^(?:Digit|Numpad)([1-6])$/.exec(e.code);
    if (m) {
      switchScene(KINDS[Number(m[1]) - 1]);
      return;
    }
    const s = active();
    if (!s || engine.scenes.transitioning) return;
    if (e.code === 'KeyC') s.playCinematic();
    else if (e.code === 'KeyX') s.shake();
    else if (e.code === 'KeyP') cycleLook(e.shiftKey ? -1 : 1);
  });

  mergeTestHooks(() => {
    const s = active();
    const p = s?.hero.root.position;
    return {
      demo: 'runtime',
      hero: p ? [Math.round(p.x * 100) / 100, Math.round(p.z * 100) / 100] : null,
      cinematic: s?.rig.cinematicActive ?? false,
      shake: s ? Math.round(s.rig.shakeTrauma * 1000) / 1000 : 0,
    };
  }, {
    next: (kind: TransitionKind = 'fade') => switchScene(kind),
    cinematic: () => active()?.playCinematic(),
    shake: () => active()?.shake(),
    cycleLook: (dir = 1) => cycleLook(dir),
    focus: () => active()?.focusAttention(),
    autopilot: (on: boolean) => {
      const s = active();
      if (s) s.autopilot = on;
    },
    heroTo: (x: number, z: number) => active()?.hero.place(x, z),
  });

  void engine.scenes.go(engine.params.get('start') === 'hall' ? 'hall' : 'orbit', {}, 'fade');
}
