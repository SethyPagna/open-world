/**
 * Continuous atmosphere: steady-state emitters that keep a box (or a box around a follow target)
 * populated at a given density. They spawn into the shared ParticleSystem, so any number of
 * emitters costs no extra draw calls. On creation each emitter prefills its volume with
 * particles at random ages so the room looks "already alive" on the first frame.
 */
import * as THREE from 'three';
import { EASE_IN, SPRITE } from './particles.ts';
import type { ParticleSink } from './particles.ts';
import { linearColor } from './fx.ts';
import type { RGB } from './fx.ts';

export type AmbientKind =
  | 'dust' | 'fireflies' | 'spores' | 'leaves' | 'petals' | 'bubbles' | 'snow' | 'stars' | 'embers' | 'wisps';
export const AMBIENT_KINDS: readonly AmbientKind[] = ['dust', 'fireflies', 'spores', 'leaves', 'petals', 'bubbles', 'snow', 'stars', 'embers', 'wisps'];

export interface AmbientConfig {
  kind: AmbientKind;
  /** World-space box (or offsets from `follow`'s position). */
  min: THREE.Vector3;
  max: THREE.Vector3;
  /** Particles per cubic metre. Defaults per kind (see AMBIENT_DEFAULTS). */
  density?: number;
  /** Hard cap on live particles for this emitter. Default 900. */
  maxCount?: number;
  color?: string;
  /** Size multiplier. */
  size?: number;
  /** Speed multiplier (drift / fall / rise). */
  speed?: number;
  /** Constant wind (m/s) added to every particle. */
  wind?: THREE.Vector3;
  /** Brightness multiplier for glowing kinds. */
  intensity?: number;
  /** Box follows this object (e.g. snow around the camera target). */
  follow?: THREE.Object3D | null;
}

interface KindDef {
  density: number;
  color: string;
  life: [number, number];
  /** 'up' spawns at the bottom and rises, 'down' at the top and falls, 'any' anywhere. */
  flow: 'up' | 'down' | 'any';
  speed: [number, number];
}
export const AMBIENT_DEFAULTS: Record<AmbientKind, KindDef> = {
  dust: { density: 2.5, color: '#ffe6bf', life: [6, 10], flow: 'any', speed: [0.02, 0.08] },
  fireflies: { density: 0.05, color: '#d6ff6a', life: [5, 9], flow: 'any', speed: [0.05, 0.2] },
  spores: { density: 0.6, color: '#8fffe0', life: [8, 12], flow: 'up', speed: [0.08, 0.2] },
  leaves: { density: 0.05, color: '#e8a33d', life: [6, 12], flow: 'down', speed: [0.5, 0.9] },
  petals: { density: 0.08, color: '#ffb7d5', life: [6, 12], flow: 'down', speed: [0.35, 0.7] },
  bubbles: { density: 0.25, color: '#86e8ff', life: [3, 7], flow: 'up', speed: [0.35, 0.9] },
  snow: { density: 1.2, color: '#eef6ff', life: [6, 12], flow: 'down', speed: [0.4, 0.9] },
  stars: { density: 0.3, color: '#fff6dd', life: [3, 7], flow: 'any', speed: [0, 0] },
  embers: { density: 0.6, color: '#ff8a3a', life: [1.8, 3.6], flow: 'up', speed: [0.6, 1.4] },
  wisps: { density: 0.012, color: '#d9d2ff', life: [10, 16], flow: 'any', speed: [0.1, 0.25] },
};
const LEAF_COLORS = ['#e8a33d', '#d9622b', '#b5c93a', '#f2c14e', '#c4452c'];
const PETAL_COLORS = ['#ffb7d5', '#fff0f6', '#ffc9de', '#f7a1c4'];
const STAR_COLORS = ['#fff6dd', '#cfe3ff', '#ffe1a8', '#ffffff'];

/** Target live count for a box volume and density, clamped to [0, maxCount]. */
export function ambientTarget(min: THREE.Vector3, max: THREE.Vector3, density: number, maxCount: number): number {
  const v = Math.max(0, max.x - min.x) * Math.max(0, max.y - min.y) * Math.max(0, max.z - min.z);
  return Math.max(0, Math.min(maxCount, Math.round(v * Math.max(0, density))));
}

export class AmbientEmitter {
  readonly config: AmbientConfig;
  enabled = true;
  readonly def: KindDef;
  /** Emission accumulator (fractional particles). */
  private acc = 0;
  private density: number;
  private readonly owner: AmbientEmitters;
  constructor(owner: AmbientEmitters, config: AmbientConfig) {
    this.owner = owner;
    this.config = config;
    this.def = AMBIENT_DEFAULTS[config.kind];
    this.density = config.density ?? this.def.density;
  }
  get target(): number {
    return ambientTarget(this.config.min, this.config.max, this.density, this.config.maxCount ?? 900);
  }
  setDensity(d: number): void {
    this.density = Math.max(0, d);
  }
  remove(): void {
    this.owner.remove(this);
  }
  /** Spawns needed this frame to hold the steady state (rate = target / mean life). */
  step(dt: number): number {
    if (!this.enabled) return 0;
    const meanLife = (this.def.life[0] + this.def.life[1]) * 0.5;
    this.acc += (this.target / meanLife) * dt;
    const n = Math.floor(this.acc);
    this.acc -= n;
    return Math.min(n, 64);
  }
}

const _o = new THREE.Vector3();
const _rgb: RGB = { r: 1, g: 1, b: 1 };

export class AmbientEmitters {
  private readonly ps: ParticleSink;
  private readonly list: AmbientEmitter[] = [];
  private seed = 0x1d872b41;

  constructor(particles: ParticleSink) {
    this.ps = particles;
  }

  get emitters(): readonly AmbientEmitter[] {
    return this.list;
  }

  add(config: AmbientConfig): AmbientEmitter {
    const e = new AmbientEmitter(this, config);
    this.list.push(e);
    // Prefill at random ages so the volume starts populated.
    const n = e.target;
    for (let i = 0; i < n; i++) this.spawn(e, true);
    return e;
  }

  remove(e: AmbientEmitter): void {
    const i = this.list.indexOf(e);
    if (i >= 0) this.list.splice(i, 1);
  }

  clear(): void {
    this.list.length = 0;
  }

  update(dt: number): void {
    for (let i = 0; i < this.list.length; i++) {
      const e = this.list[i];
      const n = e.step(dt);
      for (let k = 0; k < n; k++) this.spawn(e, false);
    }
  }

  private rnd(): number {
    let x = this.seed;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    this.seed = x;
    return (x >>> 0) / 4294967296;
  }
  private range(a: number, b: number): number {
    return a + (b - a) * this.rnd();
  }
  private pickColor(list: string[]): RGB {
    const c = linearColor(list[Math.floor(this.rnd() * list.length)], list[0]);
    _rgb.r = c.r; _rgb.g = c.g; _rgb.b = c.b;
    return _rgb;
  }

  private spawn(e: AmbientEmitter, prefill: boolean): void {
    const cfg = e.config;
    const def = e.def;
    const P = this.ps.params.reset();
    _o.set(0, 0, 0);
    if (cfg.follow) {
      cfg.follow.updateWorldMatrix(true, false);
      _o.setFromMatrixPosition(cfg.follow.matrixWorld);
    }
    const mn = cfg.min, mx = cfg.max;
    const h = Math.max(0.01, mx.y - mn.y);
    const sz = cfg.size ?? 1;
    const spd = cfg.speed ?? 1;
    const it = cfg.intensity ?? 1;
    const base = linearColor(cfg.color, def.color);
    const speed = this.range(def.speed[0], def.speed[1]) * spd;
    P.x = _o.x + this.range(mn.x, mx.x);
    P.z = _o.z + this.range(mn.z, mx.z);
    let life = this.range(def.life[0], def.life[1]);
    if (def.flow === 'down') {
      // Fall through the whole box: life is set by the drop height.
      P.y = _o.y + (prefill ? this.range(mn.y, mx.y) : mx.y - this.rnd() * 0.2);
      life = Math.max(0.5, (P.y - (_o.y + mn.y)) / Math.max(0.05, speed));
      P.vy = -speed;
    } else if (def.flow === 'up') {
      P.y = _o.y + (prefill ? this.range(mn.y, mx.y) : mn.y + this.rnd() * 0.2);
      life = Math.min(life, Math.max(0.5, (_o.y + mx.y - P.y) / Math.max(0.05, speed)));
      P.vy = speed;
    } else {
      P.y = _o.y + this.range(mn.y, mx.y);
      const a = this.rnd() * Math.PI * 2;
      P.vx = Math.cos(a) * speed;
      P.vz = Math.sin(a) * speed;
      P.vy = (this.rnd() - 0.5) * speed * 0.5;
    }
    if (cfg.wind) {
      P.vx += cfg.wind.x;
      P.vy += cfg.wind.y;
      P.vz += cfg.wind.z;
    }
    P.life = life;
    P.rot = this.rnd() * Math.PI * 2;

    switch (cfg.kind) {
      case 'dust': {
        P.sprite = SPRITE.dot;
        P.size(this.range(0.018, 0.045) * sz);
        P.wobble = 0.12;
        P.wobbleFreq = this.range(0.3, 0.8);
        P.pulse = 0.6;
        P.pulseFreq = this.range(0.2, 0.7);
        P.fadeIn = 0.25;
        P.fadeOut = 0.3;
        P.hot = 0.6;
        const b = 1.3 * it;
        P.color(base.r * b, base.g * b, base.b * b);
        break;
      }
      case 'fireflies': {
        P.sprite = SPRITE.glow;
        P.size(this.range(0.14, 0.22) * sz);
        P.wobble = 0.5;
        P.wobbleFreq = this.range(0.4, 0.9);
        P.pulse = 0.92;
        P.pulseFreq = this.range(0.25, 0.6);
        P.fadeIn = 0.15;
        P.fadeOut = 0.2;
        const b = 3.2 * it;
        P.color(base.r * b, base.g * b, base.b * b);
        break;
      }
      case 'spores': {
        P.sprite = SPRITE.dot;
        P.size(this.range(0.03, 0.065) * sz);
        P.wobble = 0.25;
        P.wobbleFreq = this.range(0.5, 1.2);
        P.pulse = 0.35;
        P.pulseFreq = this.range(0.3, 0.8);
        P.alpha = 0.85;
        P.fadeIn = 0.2;
        P.fadeOut = 0.3;
        P.hot = 0.3;
        const b = 1.7 * it;
        P.color(base.r * b, base.g * b, base.b * b);
        break;
      }
      case 'leaves':
      case 'petals': {
        const leaf = cfg.kind === 'leaves';
        P.blend = 'alpha';
        P.sprite = leaf ? SPRITE.leaf : SPRITE.petal;
        P.hot = leaf ? 0 : 0.4;
        P.size((leaf ? this.range(0.13, 0.2) : this.range(0.08, 0.13)) * sz);
        P.wobble = leaf ? 0.45 : 0.35;
        P.wobbleFreq = this.range(1.1, 1.9);
        P.flip = this.range(2.5, 5) * (this.rnd() < 0.5 ? -1 : 1);
        P.flipPhase = this.rnd() * 6.28;
        P.spin = this.range(-1.8, 1.8);
        P.fadeIn = prefill ? 0.02 : 0.08;
        P.fadeOut = 0.12;
        const c = cfg.color ? base : this.pickColor(leaf ? LEAF_COLORS : PETAL_COLORS);
        const b = (leaf ? 1 : 1.1) * it;
        P.color(c.r * b, c.g * b, c.b * b);
        break;
      }
      case 'bubbles': {
        P.sprite = SPRITE.bubble;
        const s = this.range(0.05, 0.14) * sz;
        P.size(s, s * 1.3);
        P.sizeEase = EASE_IN;
        P.wobble = 0.06;
        P.wobbleFreq = this.range(4, 8);
        P.fadeIn = 0.1;
        P.fadeOut = 0.06;
        const b = 1.2 * it;
        P.color(base.r * b, base.g * b, base.b * b);
        break;
      }
      case 'snow': {
        const flake = this.rnd() < 0.25;
        P.sprite = flake ? SPRITE.snowflake : SPRITE.dot;
        P.size((flake ? this.range(0.07, 0.12) : this.range(0.03, 0.07)) * sz);
        P.wobble = 0.2;
        P.wobbleFreq = this.range(0.8, 1.6);
        P.spin = this.range(-1, 1);
        P.alpha = this.range(0.7, 1);
        P.fadeIn = 0.1;
        P.fadeOut = 0.1;
        P.hot = 0.3;
        const b = 1.1 * it;
        P.color(base.r * b, base.g * b, base.b * b);
        break;
      }
      case 'stars': {
        P.sprite = this.rnd() < 0.7 ? SPRITE.sparkle : SPRITE.glow;
        P.size(this.range(0.08, 0.25) * sz);
        P.pulse = 0.85;
        P.pulseFreq = this.range(0.3, 1.2);
        P.fadeIn = 0.25;
        P.fadeOut = 0.35;
        const c = cfg.color ? base : this.pickColor(STAR_COLORS);
        const b = this.range(1.5, 3.2) * it;
        P.color(c.r * b, c.g * b, c.b * b);
        break;
      }
      case 'embers': {
        P.sprite = SPRITE.ember;
        P.size(this.range(0.03, 0.065) * sz, 0.01);
        P.wobble = 0.3;
        P.wobbleFreq = this.range(1.5, 3.5);
        P.pulse = 0.5;
        P.pulseFreq = this.range(3, 8);
        P.fadeIn = 0.05;
        P.fadeOut = 0.45;
        P.gravity = -0.3;
        const b = 2.8 * it;
        P.color(base.r * b + 0.6, base.g * b + 0.3, base.b * b).colorEnd(base.r * 1.4 * it, base.g * 0.3 * it, base.b * 0.1 * it);
        break;
      }
      case 'wisps': {
        P.blend = 'alpha';
        P.sprite = SPRITE.wisp;
        P.hot = 0;
        P.size(this.range(1.6, 3.4) * sz);
        P.rot = this.range(-0.25, 0.25);
        P.spin = this.range(-0.04, 0.04);
        P.alpha = this.range(0.06, 0.13) * it;
        P.fadeIn = 0.3;
        P.fadeOut = 0.35;
        P.color(base.r, base.g, base.b);
        break;
      }
    }
    if (prefill && def.flow === 'any') {
      // Start part-way through life so the population is evenly aged on frame 1.
      P.life = life * (0.2 + 0.8 * this.rnd());
      P.fadeIn = 0;
    }
    this.ps.spawn(P);
  }
}

const SHAFT_VERT = /* glsl */ `
varying vec2 vUv;
varying vec3 vN;
varying vec3 vV;
void main() {
  vUv = uv;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vN = normalize(mat3(modelMatrix) * normal);
  vV = normalize(cameraPosition - wp.xyz);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;
const SHAFT_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform float uTime;
uniform float uIntensity;
varying vec2 vUv;
varying vec3 vN;
varying vec3 vV;
void main() {
  float facing = abs(dot(normalize(vN), normalize(vV)));
  float edge = pow(facing, 2.2);
  float along = smoothstep(0.0, 0.25, vUv.y) * (0.35 + 0.65 * vUv.y);
  float bands = 0.8 + 0.2 * sin(vUv.x * 40.0 + uTime * 0.6) * sin(vUv.x * 17.0 - uTime * 0.4 + vUv.y * 3.0);
  float a = edge * along * bands * uIntensity;
  gl_FragColor = vec4(uColor * a, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

/** Soft volumetric light cone (additive), e.g. sunlight falling down a well. Pair with a 'dust' emitter. */
export class LightShaft {
  readonly mesh: THREE.Mesh;
  private readonly material: THREE.ShaderMaterial;
  constructor(opts: { top: THREE.Vector3; bottom: THREE.Vector3; radiusTop: number; radiusBottom: number; color?: string; intensity?: number }) {
    const h = opts.top.distanceTo(opts.bottom);
    const g = new THREE.CylinderGeometry(opts.radiusTop, opts.radiusBottom, h, 48, 1, true);
    const c = new THREE.Color(opts.color ?? '#fff1c1');
    this.material = new THREE.ShaderMaterial({
      name: 'LightShaft',
      vertexShader: SHAFT_VERT,
      fragmentShader: SHAFT_FRAG,
      uniforms: { uColor: { value: c }, uTime: { value: 0 }, uIntensity: { value: opts.intensity ?? 0.35 } },
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    this.mesh = new THREE.Mesh(g, this.material);
    this.mesh.name = 'LightShaft';
    this.mesh.renderOrder = 15;
    const mid = opts.top.clone().add(opts.bottom).multiplyScalar(0.5);
    this.mesh.position.copy(mid);
    const up = opts.top.clone().sub(opts.bottom).normalize();
    this.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), up);
  }
  update(dt: number): void {
    this.material.uniforms.uTime.value += dt;
  }
  dispose(): void {
    this.mesh.removeFromParent();
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}
