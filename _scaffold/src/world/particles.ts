/**
 * GPU-instanced billboard particles. One instanced draw per blend mode (additive + alpha), fed from a
 * CPU simulation that lives in flat typed arrays (no per-frame allocations). Slots are reused in
 * ring-buffer order; the alpha pool is kept depth-sorted with an incremental insertion sort
 * (the previous frame's order is almost sorted already, so this is ~O(n)).
 *
 * Usage (zero-alloc): `const p = ps.params.reset(); p.x = ...; p.sprite = SPRITE.spark; ps.spawn();`
 */
import * as THREE from 'three';

export type ParticleBlend = 'add' | 'alpha';

/** Sprite cells in the procedural atlas (8 x 4 grid, 128 px cells). `glyph + i` (i < GLYPH_COUNT) are System glyphs. */
export const SPRITE = {
  glow: 0, dot: 1, sparkle: 2, star: 3, shard: 4, ring: 5, smoke: 6, pixel: 7,
  plus: 8, feather: 9, coin: 10, bubble: 11, snowflake: 12, leaf: 13, petal: 14, drop: 15,
  note: 16, heart: 17, streak: 18, ember: 19, wisp: 20, rect: 21, smoke2: 22, flare: 23,
  glyph: 24,
} as const;
export type SpriteName = keyof typeof SPRITE;
export const GLYPH_COUNT = 8;
export const ATLAS_COLS = 8;
export const ATLAS_ROWS = 4;
const CELL = 128;

export const EASE_LINEAR = 0;
export const EASE_OUT = 1;
export const EASE_IN = 2;

/** Mutable spawn description. Reuse one instance (e.g. `ParticleSystem.params`) to avoid allocations. */
export class ParticleParams {
  x = 0; y = 0; z = 0;
  vx = 0; vy = 0; vz = 0;
  /** Seconds alive (after `delay`). */
  life = 1;
  /** Seconds before the particle appears (staggered bursts). */
  delay = 0;
  /** m/s^2 pulling down; negative = buoyant. */
  gravity = 0;
  /** Exponential-ish velocity damping (1/s). */
  drag = 0;
  size0 = 0.2; size1 = 0.2;
  /** Fraction of life spent popping in with an overshoot (0 = none). */
  sizeIn = 0;
  sizeEase = EASE_LINEAR;
  /** Linear-space colour at birth / death. Values above 1 are HDR (bloom). */
  r0 = 1; g0 = 1; b0 = 1;
  r1 = 1; g1 = 1; b1 = 1;
  alpha = 1;
  /** Fractions of life used to fade in / out. */
  fadeIn = 0; fadeOut = 0.35;
  rot = 0; spin = 0;
  sprite: number = SPRITE.glow;
  /** 0..1: how much of the sprite's white-hot mask is used. */
  hot = 1;
  /** Velocity stretch (seconds): streak length = size + speed * stretch. */
  stretch = 0;
  /** Tumble speed (rad/s): width scales by cos(phase + age * flip), shading darkens edge-on. */
  flip = 0; flipPhase = 0;
  /** Lateral sway amplitude (m) and frequency (rad/s). */
  wobble = 0; wobbleFreq = 0;
  /** Alpha twinkle depth 0..1 and frequency (Hz). */
  pulse = 0; pulseFreq = 0;
  /** Horizontal orbit around the (moving) particle centre. */
  orbitR = 0; orbitW = 0; orbitPhase = 0;
  /** Ground restitution; < 0 disables ground collision. */
  bounce = -1;
  groundY = 0;
  /** When resting on the ground, lie flat (confetti, coins, feathers). */
  land = false;
  /** Render flat on the XZ plane instead of camera-facing (ripples, ground rings). */
  flat = false;
  /** Snap rendered position to a grid of this size (pixel/glitch look). */
  quant = 0;
  blend: ParticleBlend = 'add';

  reset(): this {
    this.x = 0; this.y = 0; this.z = 0; this.vx = 0; this.vy = 0; this.vz = 0;
    this.life = 1; this.delay = 0; this.gravity = 0; this.drag = 0;
    this.size0 = 0.2; this.size1 = 0.2; this.sizeIn = 0; this.sizeEase = EASE_LINEAR;
    this.r0 = 1; this.g0 = 1; this.b0 = 1; this.r1 = 1; this.g1 = 1; this.b1 = 1;
    this.alpha = 1; this.fadeIn = 0; this.fadeOut = 0.35;
    this.rot = 0; this.spin = 0; this.sprite = SPRITE.glow; this.hot = 1; this.stretch = 0;
    this.flip = 0; this.flipPhase = 0; this.wobble = 0; this.wobbleFreq = 0; this.pulse = 0; this.pulseFreq = 0;
    this.orbitR = 0; this.orbitW = 0; this.orbitPhase = 0;
    this.bounce = -1; this.groundY = 0; this.land = false; this.flat = false; this.quant = 0; this.blend = 'add';
    return this;
  }
  /** Sets both start and end colour. */
  color(r: number, g: number, b: number): this {
    this.r0 = r; this.g0 = g; this.b0 = b; this.r1 = r; this.g1 = g; this.b1 = b;
    return this;
  }
  colorEnd(r: number, g: number, b: number): this {
    this.r1 = r; this.g1 = g; this.b1 = b;
    return this;
  }
  at(x: number, y: number, z: number): this {
    this.x = x; this.y = y; this.z = z;
    return this;
  }
  vel(x: number, y: number, z: number): this {
    this.vx = x; this.vy = y; this.vz = z;
    return this;
  }
  size(a: number, b: number = a): this {
    this.size0 = a; this.size1 = b;
    return this;
  }
}

/** Anything particles can be emitted into (ParticleSystem, or a bare pool in tests). */
export interface ParticleSink {
  readonly params: ParticleParams;
  spawn(p?: ParticleParams): number;
}

// Per-particle record layout.
const PX = 0, PY = 1, PZ = 2, VX = 3, VY = 4, VZ = 5, AGE = 6, LIFE = 7, GRAV = 8, DRAG = 9;
const S0 = 10, S1 = 11, SIN = 12, SEASE = 13, R0 = 14, G0 = 15, B0 = 16, R1 = 17, G1 = 18, B1 = 19;
const ALPHA = 20, FIN = 21, FOUT = 22, ROT = 23, SPIN = 24, SPR = 25, STRETCH = 26, FLIP = 27, FLIPPH = 28;
const WOB = 29, WOBF = 30, PULSE = 31, PULSEF = 32, ORBR = 33, ORBW = 34, ORBPH = 35, BOUNCE = 36, GROUND = 37;
const FACING = 38, SEED = 39, QUANT = 40, HOT = 41, LAND = 42;
export const STRIDE = 43;

/** Back-out overshoot used for pop-in (0 -> ~1.1 -> 1). */
export function popIn(x: number): number {
  const t = x - 1;
  return 1 + 2.70158 * t * t * t + 1.70158 * t * t;
}
/** Size multiplier curve: lerp(size0, size1, ease(t)) * pop. */
export function sizeAt(s0: number, s1: number, t: number, ease: number, sizeIn: number): number {
  const e = ease === EASE_OUT ? 1 - (1 - t) * (1 - t) : ease === EASE_IN ? t * t * t : t;
  let s = s0 + (s1 - s0) * e;
  if (sizeIn > 0 && t < sizeIn) s *= popIn(t / sizeIn);
  return s;
}
/** Alpha envelope from fade-in / fade-out fractions (smooth). */
export function fadeAt(t: number, fadeIn: number, fadeOut: number): number {
  let a = 1;
  if (fadeIn > 0 && t < fadeIn) {
    const k = t / fadeIn;
    a *= k * k * (3 - 2 * k);
  }
  if (fadeOut > 0 && t > 1 - fadeOut) {
    const k = (1 - t) / fadeOut;
    a *= k * k * (3 - 2 * k);
  }
  return a;
}

export interface CameraInfo { x: number; y: number; z: number; fx: number; fy: number; fz: number }

/** CPU simulation for one blend pool. Pure (no WebGL): writes 4 vec4 render streams per live particle. */
export class ParticlePool {
  readonly capacity: number;
  readonly sorted: boolean;
  readonly data: Float32Array;
  readonly posSize: Float32Array;
  readonly color: Float32Array;
  readonly velRot: Float32Array;
  readonly misc: Float32Array;
  /** Rendered particle count after the last update. */
  renderCount = 0;
  private readonly listed: Uint8Array;
  private readonly live: Int32Array;
  private liveN = 0;
  private readonly pending: Int32Array;
  private pendN = 0;
  private readonly depth: Float32Array;
  private cursor = 0;
  private seedState = 0x2f6b1d;

  constructor(capacity: number, sorted: boolean) {
    this.capacity = capacity;
    this.sorted = sorted;
    this.data = new Float32Array(capacity * STRIDE);
    this.posSize = new Float32Array(capacity * 4);
    this.color = new Float32Array(capacity * 4);
    this.velRot = new Float32Array(capacity * 4);
    this.misc = new Float32Array(capacity * 4);
    this.listed = new Uint8Array(capacity);
    this.live = new Int32Array(capacity);
    this.pending = new Int32Array(capacity);
    this.depth = new Float32Array(capacity);
  }

  /** Live + pending (includes particles still waiting out their delay). */
  get liveCount(): number {
    return this.liveN + this.pendN;
  }

  spawn(p: ParticleParams): number {
    const cap = this.capacity;
    let slot = -1;
    for (let k = 0; k < 8; k++) {
      const s = (this.cursor + k) % cap;
      if (!this.listed[s]) {
        slot = s;
        break;
      }
    }
    // Pool full: recycle the slot at the cursor (roughly the oldest spawn).
    if (slot < 0) slot = this.cursor;
    this.cursor = (slot + 1) % cap;

    const d = this.data;
    const o = slot * STRIDE;
    d[o + PX] = p.x; d[o + PY] = p.y; d[o + PZ] = p.z;
    d[o + VX] = p.vx; d[o + VY] = p.vy; d[o + VZ] = p.vz;
    d[o + AGE] = -Math.max(0, p.delay);
    d[o + LIFE] = Math.max(1e-3, p.life);
    d[o + GRAV] = p.gravity; d[o + DRAG] = Math.max(0, p.drag);
    d[o + S0] = p.size0; d[o + S1] = p.size1; d[o + SIN] = p.sizeIn; d[o + SEASE] = p.sizeEase;
    d[o + R0] = p.r0; d[o + G0] = p.g0; d[o + B0] = p.b0;
    d[o + R1] = p.r1; d[o + G1] = p.g1; d[o + B1] = p.b1;
    d[o + ALPHA] = p.alpha; d[o + FIN] = p.fadeIn; d[o + FOUT] = p.fadeOut;
    d[o + ROT] = p.rot; d[o + SPIN] = p.spin; d[o + SPR] = p.sprite; d[o + STRETCH] = p.stretch;
    d[o + FLIP] = p.flip; d[o + FLIPPH] = p.flipPhase;
    d[o + WOB] = p.wobble; d[o + WOBF] = p.wobbleFreq; d[o + PULSE] = p.pulse; d[o + PULSEF] = p.pulseFreq;
    d[o + ORBR] = p.orbitR; d[o + ORBW] = p.orbitW; d[o + ORBPH] = p.orbitPhase;
    d[o + BOUNCE] = p.bounce; d[o + GROUND] = p.groundY; d[o + FACING] = p.flat ? 1 : 0;
    d[o + QUANT] = p.quant; d[o + HOT] = p.hot < 0 ? 0 : p.hot > 1 ? 1 : p.hot; d[o + LAND] = p.land ? 1 : 0;
    this.seedState = (Math.imul(this.seedState, 1664525) + 1013904223) | 0;
    d[o + SEED] = (this.seedState >>> 8) / 16777216;

    if (!this.listed[slot]) {
      this.listed[slot] = 1;
      this.pending[this.pendN++] = slot;
    }
    return slot;
  }

  clear(): void {
    this.liveN = 0;
    this.pendN = 0;
    this.renderCount = 0;
    this.listed.fill(0);
  }

  update(dt: number, cam: CameraInfo): number {
    const d = this.data;
    const live = this.live;
    const listed = this.listed;
    const depth = this.depth;
    for (let i = 0; i < this.pendN; i++) live[this.liveN++] = this.pending[i];
    this.pendN = 0;

    // Pass 1: physics, death, depth.
    let n = 0;
    const damp0 = dt;
    for (let i = 0; i < this.liveN; i++) {
      const s = live[i];
      const o = s * STRIDE;
      const age = d[o + AGE] + dt;
      if (age >= d[o + LIFE]) {
        listed[s] = 0;
        continue;
      }
      d[o + AGE] = age;
      live[n++] = s;
      if (age < 0) {
        depth[s] = -1e9;
        continue;
      }
      let vx = d[o + VX], vy = d[o + VY], vz = d[o + VZ];
      vy -= d[o + GRAV] * dt;
      const drag = d[o + DRAG];
      if (drag > 0) {
        const k = 1 / (1 + drag * damp0);
        vx *= k; vy *= k; vz *= k;
      }
      let px = d[o + PX] + vx * dt;
      let py = d[o + PY] + vy * dt;
      let pz = d[o + PZ] + vz * dt;
      const bounce = d[o + BOUNCE];
      if (bounce >= 0) {
        const g = d[o + GROUND];
        if (py <= g) {
          py = g;
          if (vy < 0) {
            vy = -vy * bounce;
            vx *= 0.7; vz *= 0.7;
            d[o + SPIN] *= 0.6;
            if (vy < 0.7) {
              vy = 0;
              if (d[o + LAND] > 0) {
                d[o + FACING] = 1;
                d[o + FLIP] = 0;
                d[o + FLIPPH] = 0;
                d[o + SPIN] = 0;
                d[o + WOB] = 0;
              }
            }
          }
          if (vy === 0) {
            const f = 1 / (1 + 7 * dt);
            vx *= f; vz *= f;
          }
        }
      }
      d[o + PX] = px; d[o + PY] = py; d[o + PZ] = pz;
      d[o + VX] = vx; d[o + VY] = vy; d[o + VZ] = vz;
      d[o + ROT] += d[o + SPIN] * dt;
      if (this.sorted) depth[s] = (px - cam.x) * cam.fx + (py - cam.y) * cam.fy + (pz - cam.z) * cam.fz;
    }
    this.liveN = n;

    // Pass 2: back-to-front for alpha blending. Temporal coherence keeps this near-linear.
    if (this.sorted) {
      for (let i = 1; i < n; i++) {
        const s = live[i];
        const dv = depth[s];
        let j = i - 1;
        while (j >= 0 && depth[live[j]] < dv) {
          live[j + 1] = live[j];
          j--;
        }
        live[j + 1] = s;
      }
    }

    // Pass 3: appearance -> render streams.
    const ps = this.posSize, co = this.color, vr = this.velRot, mi = this.misc;
    let r = 0;
    for (let i = 0; i < n; i++) {
      const s = live[i];
      const o = s * STRIDE;
      const age = d[o + AGE];
      if (age < 0) continue;
      const life = d[o + LIFE];
      const t = age / life;
      const seed = d[o + SEED];
      let x = d[o + PX], y = d[o + PY], z = d[o + PZ];
      const wob = d[o + WOB];
      if (wob !== 0) {
        const w = d[o + WOBF] * age + seed * 40;
        x += Math.sin(w) * wob;
        z += Math.cos(w * 0.83 + seed * 13) * wob;
        y += Math.sin(w * 0.61 + seed * 7) * wob * 0.35;
      }
      const orbR = d[o + ORBR];
      if (orbR !== 0) {
        const th = d[o + ORBPH] + d[o + ORBW] * age;
        const rr = orbR * (t < 0.12 ? popIn(t / 0.12) : 1);
        x += Math.cos(th) * rr;
        z += Math.sin(th) * rr;
        y += Math.sin(th * 2) * rr * 0.12;
      }
      const q = d[o + QUANT];
      if (q > 0) {
        x = Math.round(x / q) * q;
        y = Math.round(y / q) * q;
        z = Math.round(z / q) * q;
      }
      const size = sizeAt(d[o + S0], d[o + S1], t, d[o + SEASE], d[o + SIN]);
      let a = d[o + ALPHA] * fadeAt(t, d[o + FIN], d[o + FOUT]);
      const pulse = d[o + PULSE];
      if (pulse > 0) {
        const w = 0.5 + 0.5 * Math.sin(age * d[o + PULSEF] * 6.2831853 + seed * 50);
        a *= 1 - pulse * w * w;
      }
      let flipScale = 1;
      let shade = 1;
      const flip = d[o + FLIP];
      if (flip !== 0) {
        flipScale = Math.cos(d[o + FLIPPH] + age * flip);
        const af = flipScale < 0 ? -flipScale : flipScale;
        // Face-on glint; kept small so saturated confetti does not bleach to white under AgX.
        shade = 0.42 + 0.58 * af + (af > 0.93 ? (af - 0.93) * 4.5 : 0);
        if (af < 0.08) flipScale = flipScale < 0 ? -0.08 : 0.08;
      } else if (d[o + FACING] > 0 && d[o + LAND] > 0) {
        shade = 0.85;
      }
      const k = 4 * r;
      ps[k] = x; ps[k + 1] = y; ps[k + 2] = z; ps[k + 3] = size;
      co[k] = (d[o + R0] + (d[o + R1] - d[o + R0]) * t) * shade;
      co[k + 1] = (d[o + G0] + (d[o + G1] - d[o + G0]) * t) * shade;
      co[k + 2] = (d[o + B0] + (d[o + B1] - d[o + B0]) * t) * shade;
      co[k + 3] = a;
      vr[k] = d[o + VX]; vr[k + 1] = d[o + VY]; vr[k + 2] = d[o + VZ]; vr[k + 3] = d[o + ROT];
      mi[k] = d[o + SPR] + d[o + HOT] * 0.9;
      mi[k + 1] = d[o + STRETCH];
      mi[k + 2] = flipScale;
      mi[k + 3] = d[o + FACING];
      r++;
    }
    this.renderCount = r;
    return r;
  }
}

// ---------------------------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------------------------
const VERT = /* glsl */ `
attribute vec4 aPosSize;
attribute vec4 aColor;
attribute vec4 aVelRot;
attribute vec4 aMisc;
uniform vec2 uGrid;
varying vec2 vUv;
varying vec4 vColor;
varying float vHot;
void main() {
  float size = aPosSize.w;
  vec2 c = position.xy;
  c.x *= aMisc.z;
  float r = aVelRot.w;
  float cs = cos(r);
  float sn = sin(r);
  vec2 rc = vec2(c.x * cs - c.y * sn, c.x * sn + c.y * cs);
  vec4 mv;
  if (aMisc.w > 0.5) {
    vec3 wp = aPosSize.xyz + vec3(rc.x, 0.0, rc.y) * size;
    mv = viewMatrix * vec4(wp, 1.0);
  } else {
    mv = viewMatrix * vec4(aPosSize.xyz, 1.0);
    if (aMisc.y > 0.0) {
      vec3 vv = (viewMatrix * vec4(aVelRot.xyz, 0.0)).xyz;
      float sp = length(vv.xy);
      vec2 dir = sp > 1e-4 ? vv.xy / sp : vec2(1.0, 0.0);
      vec2 nrm = vec2(-dir.y, dir.x);
      float len = size + sp * aMisc.y;
      mv.xy += dir * (position.x * len) + nrm * (position.y * size);
    } else {
      mv.xy += rc * size;
    }
    // Nudge billboards toward the camera so big soft sprites clip less against floors.
    mv.z += size * 0.3;
  }
  gl_Position = projectionMatrix * mv;
  float idx = floor(aMisc.x + 0.001);
  vHot = clamp((aMisc.x - idx) / 0.9, 0.0, 1.0);
  float col = mod(idx, uGrid.x);
  float row = floor((idx + 0.5) / uGrid.x);
  vUv = vec2((col + uv.x) / uGrid.x, (row + 1.0 - uv.y) / uGrid.y);
  vColor = aColor;
  // Fade out sprites that are about to fill the screen (big puffs drifting past the lens).
  vColor.a *= smoothstep(0.15, 0.35 + size * 1.2, -mv.z);
}
`;

const FRAG = /* glsl */ `
uniform sampler2D uAtlas;
varying vec2 vUv;
varying vec4 vColor;
varying float vHot;
void main() {
  vec4 t = texture2D(uAtlas, vUv);
  float a = t.g * vColor.a;
  if (a < 0.002) discard;
  float peak = max(max(vColor.r, vColor.g), vColor.b);
  vec3 rgb = mix(vColor.rgb * t.r, vec3(max(peak, 1.0)), t.b * vHot);
  gl_FragColor = vec4(rgb, a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

function makePoolMesh(pool: ParticlePool, atlas: THREE.Texture, blend: ParticleBlend): THREE.Mesh {
  const g = new THREE.InstancedBufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0], 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2));
  g.setIndex([0, 1, 2, 0, 2, 3]);
  const streams: [string, Float32Array][] = [['aPosSize', pool.posSize], ['aColor', pool.color], ['aVelRot', pool.velRot], ['aMisc', pool.misc]];
  for (const [name, arr] of streams) {
    const a = new THREE.InstancedBufferAttribute(arr, 4);
    a.setUsage(THREE.DynamicDrawUsage);
    g.setAttribute(name, a);
  }
  g.instanceCount = 0;
  const m = new THREE.ShaderMaterial({
    name: blend === 'add' ? 'ParticlesAdd' : 'ParticlesAlpha',
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms: { uAtlas: { value: atlas }, uGrid: { value: new THREE.Vector2(ATLAS_COLS, ATLAS_ROWS) } },
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: blend === 'add' ? THREE.AdditiveBlending : THREE.NormalBlending,
  });
  const mesh = new THREE.Mesh(g, m);
  mesh.name = m.name;
  mesh.frustumCulled = false;
  mesh.matrixAutoUpdate = false;
  mesh.renderOrder = blend === 'add' ? 30 : 20;
  mesh.visible = false;
  return mesh;
}

export interface ParticleSystemOptions { capacityAdd?: number; capacityAlpha?: number }

export class ParticleSystem implements ParticleSink {
  readonly params = new ParticleParams();
  readonly add: ParticlePool;
  readonly alpha: ParticlePool;
  readonly atlas: THREE.DataTexture;
  readonly meshAdd: THREE.Mesh;
  readonly meshAlpha: THREE.Mesh;
  private readonly parent: THREE.Object3D;
  private readonly cam: CameraInfo = { x: 0, y: 0, z: 0, fx: 0, fy: 0, fz: -1 };

  constructor(parent: THREE.Object3D, opts: ParticleSystemOptions = {}) {
    this.parent = parent;
    this.add = new ParticlePool(opts.capacityAdd ?? 4096, false);
    this.alpha = new ParticlePool(opts.capacityAlpha ?? 2048, true);
    this.atlas = createParticleAtlas();
    this.meshAlpha = makePoolMesh(this.alpha, this.atlas, 'alpha');
    this.meshAdd = makePoolMesh(this.add, this.atlas, 'add');
    parent.add(this.meshAlpha, this.meshAdd);
  }

  spawn(p: ParticleParams = this.params): number {
    return (p.blend === 'alpha' ? this.alpha : this.add).spawn(p);
  }

  get liveCount(): number {
    return this.add.liveCount + this.alpha.liveCount;
  }
  get capacity(): number {
    return this.add.capacity + this.alpha.capacity;
  }

  update(dt: number, camera: THREE.Camera): void {
    const e = camera.matrixWorld.elements;
    const cam = this.cam;
    cam.x = e[12]; cam.y = e[13]; cam.z = e[14];
    const l = Math.hypot(e[8], e[9], e[10]) || 1;
    cam.fx = -e[8] / l; cam.fy = -e[9] / l; cam.fz = -e[10] / l;
    this.upload(this.meshAdd, this.add.update(dt, cam));
    this.upload(this.meshAlpha, this.alpha.update(dt, cam));
  }

  private upload(mesh: THREE.Mesh, n: number): void {
    const g = mesh.geometry as THREE.InstancedBufferGeometry;
    g.instanceCount = n;
    mesh.visible = n > 0;
    if (n === 0) return;
    for (const name of ATTR_NAMES) {
      const a = g.getAttribute(name) as THREE.InstancedBufferAttribute;
      a.clearUpdateRanges();
      a.addUpdateRange(0, n * 4);
      a.needsUpdate = true;
    }
  }

  clear(): void {
    this.add.clear();
    this.alpha.clear();
    this.meshAdd.visible = false;
    this.meshAlpha.visible = false;
  }

  dispose(): void {
    this.parent.remove(this.meshAdd, this.meshAlpha);
    for (const m of [this.meshAdd, this.meshAlpha]) {
      m.geometry.dispose();
      (m.material as THREE.Material).dispose();
    }
    this.atlas.dispose();
  }
}
const ATTR_NAMES = ['aPosSize', 'aColor', 'aVelRot', 'aMisc'] as const;

// ---------------------------------------------------------------------------------------------
// Procedural atlas. R = shading (luminance), G = coverage, B = white-hot mask, A = 255.
// Packing coverage into G (instead of A) sidesteps canvas premultiplication fringes in mips.
// ---------------------------------------------------------------------------------------------
type Ctx = CanvasRenderingContext2D;
type SpriteDraw = (m: Ctx, h: Ctx, rnd: () => number) => void;

function mulberry(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const grey = (v: number, a = 1): string => {
  const c = Math.round(v * 255);
  return `rgba(${c},${c},${c},${a})`;
};
function radial(ctx: Ctx, x: number, y: number, r: number, stops: [number, number, number][]): CanvasGradient {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  for (const [o, v, a] of stops) g.addColorStop(o, grey(v, a));
  return g;
}
function disc(ctx: Ctx, x: number, y: number, r: number, fill: string | CanvasGradient): void {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}
function starPath(ctx: Ctx, cx: number, cy: number, points: number, outer: number, inner: number, rot: number): void {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = rot + (i * Math.PI) / points;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}
function sparklePath(ctx: Ctx, cx: number, cy: number, r: number, pinch: number): void {
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.quadraticCurveTo(cx + pinch, cy - pinch, cx + r, cy);
  ctx.quadraticCurveTo(cx + pinch, cy + pinch, cx, cy + r);
  ctx.quadraticCurveTo(cx - pinch, cy + pinch, cx - r, cy);
  ctx.quadraticCurveTo(cx - pinch, cy - pinch, cx, cy - r);
  ctx.closePath();
}
/** Multiplies coverage by a radial falloff so soft sprites never show their quad edge. */
function softEdge(ctx: Ctx, inner: number, outer = 63): void {
  ctx.save();
  ctx.globalCompositeOperation = 'destination-in';
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, outer);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(inner / outer, 'rgba(255,255,255,1)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, CELL, CELL);
  ctx.restore();
}
function puff(ctx: Ctx, rnd: () => number, blobs: number, spreadR: number, baseR: number): void {
  for (let i = 0; i < blobs; i++) {
    const a = rnd() * Math.PI * 2;
    const d = i === 0 ? 0 : spreadR * (0.35 + 0.65 * rnd());
    const x = 64 + Math.cos(a) * d;
    const y = 64 + Math.sin(a) * d * 0.85;
    const r = baseR * (0.55 + 0.45 * rnd()) * (i === 0 ? 1.25 : 1);
    // Light from the top-left: brighter blobs up there.
    const lit = 0.72 + 0.28 * Math.max(0, Math.min(1, 0.5 - (x - 64 + y - 64) / 110));
    ctx.fillStyle = radial(ctx, x - r * 0.25, y - r * 0.3, r * 1.15, [[0, Math.min(1, lit + 0.12), 0.95], [0.55, lit, 0.7], [1, lit * 0.9, 0]]);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  softEdge(ctx, 50);
}

const DRAWERS: SpriteDraw[] = [];
DRAWERS[SPRITE.glow] = (m, h) => {
  disc(m, 64, 64, 62, radial(m, 64, 64, 62, [[0, 1, 1], [0.12, 1, 0.9], [0.3, 1, 0.5], [0.55, 1, 0.18], [0.8, 1, 0.05], [1, 1, 0]]));
  disc(h, 64, 64, 26, radial(h, 64, 64, 26, [[0, 1, 1], [0.5, 1, 0.5], [1, 1, 0]]));
};
DRAWERS[SPRITE.dot] = (m, h) => {
  disc(m, 64, 64, 58, radial(m, 64, 64, 58, [[0, 1, 1], [0.86, 0.92, 1], [1, 0.8, 0]]));
  disc(h, 52, 50, 16, radial(h, 52, 50, 16, [[0, 1, 0.7], [1, 1, 0]]));
};
DRAWERS[SPRITE.sparkle] = (m, h) => {
  disc(m, 64, 64, 40, radial(m, 64, 64, 40, [[0, 1, 0.45], [1, 1, 0]]));
  sparklePath(m, 64, 64, 60, 7);
  m.fillStyle = radial(m, 64, 64, 60, [[0, 1, 1], [0.6, 0.95, 1], [1, 0.8, 0.9]]);
  m.fill();
  sparklePath(h, 64, 64, 30, 4);
  h.fillStyle = grey(1);
  h.fill();
  disc(h, 64, 64, 12, grey(1));
};
DRAWERS[SPRITE.star] = (m, h) => {
  m.lineJoin = 'round';
  starPath(m, 64, 67, 5, 54, 25, -Math.PI / 2);
  const g = m.createLinearGradient(30, 20, 100, 110);
  g.addColorStop(0, grey(1));
  g.addColorStop(1, grey(0.78));
  m.fillStyle = g;
  m.fill();
  m.lineWidth = 8;
  m.strokeStyle = grey(0.42);
  m.stroke();
  h.save();
  h.translate(50, 48);
  h.rotate(-0.6);
  h.beginPath();
  h.ellipse(0, 0, 11, 6, 0, 0, Math.PI * 2);
  h.fillStyle = grey(1, 0.9);
  h.fill();
  h.restore();
};
DRAWERS[SPRITE.shard] = (m, h) => {
  const pts: [number, number][] = [[62, 6], [98, 58], [74, 122], [30, 74]];
  m.beginPath();
  m.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) m.lineTo(pts[i][0], pts[i][1]);
  m.closePath();
  m.fillStyle = grey(0.62);
  m.fill();
  // Lit facet.
  m.beginPath();
  m.moveTo(62, 6); m.lineTo(66, 66); m.lineTo(74, 122); m.lineTo(30, 74); m.closePath();
  m.fillStyle = grey(1);
  m.fill();
  m.beginPath();
  m.moveTo(62, 6); m.lineTo(98, 58); m.lineTo(66, 66); m.closePath();
  m.fillStyle = grey(0.82);
  m.fill();
  h.lineWidth = 4;
  h.lineCap = 'round';
  h.strokeStyle = grey(1, 0.95);
  h.beginPath();
  h.moveTo(58, 16); h.lineTo(36, 72);
  h.stroke();
};
DRAWERS[SPRITE.ring] = (m) => {
  m.shadowColor = 'white';
  m.shadowBlur = 10;
  m.lineWidth = 7;
  m.strokeStyle = grey(1);
  m.beginPath();
  m.arc(64, 64, 52, 0, Math.PI * 2);
  m.stroke();
  m.shadowBlur = 0;
};
DRAWERS[SPRITE.smoke] = (m, _h, rnd) => puff(m, rnd, 8, 30, 30);
DRAWERS[SPRITE.pixel] = (m) => {
  m.fillStyle = grey(1);
  m.fillRect(10, 10, 108, 108);
};
DRAWERS[SPRITE.plus] = (m, h) => {
  const bar = (x: number, y: number, w: number, hh: number): void => {
    m.beginPath();
    m.roundRect(x, y, w, hh, 12);
    m.fill();
    m.stroke();
  };
  m.fillStyle = grey(1);
  m.strokeStyle = grey(0.55);
  m.lineWidth = 6;
  bar(44, 10, 40, 108);
  bar(10, 44, 108, 40);
  m.fillStyle = grey(1);
  m.fillRect(47, 47, 34, 34);
  h.fillStyle = grey(1, 0.8);
  h.beginPath();
  h.roundRect(50, 18, 12, 36, 6);
  h.fill();
};
DRAWERS[SPRITE.feather] = (m) => {
  m.save();
  m.translate(64, 64);
  m.rotate(0.35);
  m.beginPath();
  m.moveTo(0, 58);
  m.bezierCurveTo(-30, 30, -26, -38, 2, -60);
  m.bezierCurveTo(26, -30, 24, 26, 0, 58);
  m.closePath();
  const g = m.createLinearGradient(-26, 0, 26, 0);
  g.addColorStop(0, grey(0.8));
  g.addColorStop(0.5, grey(1));
  g.addColorStop(1, grey(0.86));
  m.fillStyle = g;
  m.fill();
  m.strokeStyle = grey(0.7);
  m.lineWidth = 2;
  for (let i = -40; i < 44; i += 9) {
    m.beginPath();
    m.moveTo(0, i);
    m.lineTo(-18, i - 12);
    m.moveTo(0, i + 3);
    m.lineTo(17, i - 9);
    m.stroke();
  }
  m.strokeStyle = grey(0.55);
  m.lineWidth = 3.5;
  m.beginPath();
  m.moveTo(0, 62);
  m.quadraticCurveTo(-2, 0, 2, -58);
  m.stroke();
  m.restore();
};
DRAWERS[SPRITE.coin] = (m, h) => {
  disc(m, 64, 64, 57, grey(0.66));
  disc(m, 64, 64, 49, radial(m, 52, 48, 70, [[0, 1, 1], [1, 0.84, 1]]));
  m.lineWidth = 4;
  m.strokeStyle = grey(0.7);
  m.beginPath();
  m.arc(64, 64, 38, 0, Math.PI * 2);
  m.stroke();
  sparklePath(m, 64, 64, 22, 5);
  m.fillStyle = grey(0.74);
  m.fill();
  h.lineWidth = 6;
  h.lineCap = 'round';
  h.strokeStyle = grey(1, 0.85);
  h.beginPath();
  h.arc(64, 64, 44, Math.PI * 1.1, Math.PI * 1.45);
  h.stroke();
  disc(h, 42, 40, 5, grey(1));
};
DRAWERS[SPRITE.bubble] = (m, h) => {
  disc(m, 64, 64, 58, radial(m, 64, 64, 58, [[0, 1, 0.08], [0.72, 1, 0.16], [0.9, 1, 0.75], [0.97, 1, 0.9], [1, 1, 0]]));
  h.lineWidth = 7;
  h.lineCap = 'round';
  h.strokeStyle = grey(1, 0.95);
  h.beginPath();
  h.arc(64, 64, 42, Math.PI * 1.08, Math.PI * 1.42);
  h.stroke();
  disc(h, 84, 88, 5, grey(1, 0.7));
};
DRAWERS[SPRITE.snowflake] = (m, h) => {
  m.strokeStyle = grey(1);
  m.lineCap = 'round';
  m.lineWidth = 7;
  m.shadowColor = 'white';
  m.shadowBlur = 4;
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    const c = Math.cos(a), s = Math.sin(a);
    const P = (d: number, off: number): [number, number] => [64 + c * d - s * off, 64 + s * d + c * off];
    m.beginPath();
    m.moveTo(64, 64);
    m.lineTo(...P(54, 0));
    m.moveTo(...P(30, 0)); m.lineTo(...P(42, 12));
    m.moveTo(...P(30, 0)); m.lineTo(...P(42, -12));
    m.stroke();
  }
  m.shadowBlur = 0;
  disc(h, 64, 64, 10, grey(1));
};
DRAWERS[SPRITE.leaf] = (m) => {
  m.save();
  m.translate(64, 64);
  m.rotate(-0.5);
  m.beginPath();
  m.moveTo(0, 58);
  m.bezierCurveTo(-44, 20, -30, -40, 0, -60);
  m.bezierCurveTo(30, -40, 44, 20, 0, 58);
  m.closePath();
  const g = m.createLinearGradient(-30, -40, 30, 40);
  g.addColorStop(0, grey(1));
  g.addColorStop(1, grey(0.72));
  m.fillStyle = g;
  m.fill();
  m.strokeStyle = grey(0.55);
  m.lineWidth = 3;
  m.beginPath();
  m.moveTo(0, 60);
  m.lineTo(0, -52);
  for (let i = -30; i < 40; i += 16) {
    m.moveTo(0, i + 10); m.lineTo(-18, i - 4);
    m.moveTo(0, i + 10); m.lineTo(18, i - 4);
  }
  m.stroke();
  m.restore();
};
DRAWERS[SPRITE.petal] = (m, h) => {
  m.beginPath();
  m.moveTo(64, 120);
  m.bezierCurveTo(14, 90, 18, 20, 50, 12);
  m.quadraticCurveTo(64, 26, 78, 12);
  m.bezierCurveTo(110, 20, 114, 90, 64, 120);
  m.closePath();
  m.fillStyle = radial(m, 64, 70, 64, [[0, 1, 1], [0.7, 0.9, 1], [1, 0.75, 1]]);
  m.fill();
  h.beginPath();
  h.ellipse(52, 52, 8, 18, -0.3, 0, Math.PI * 2);
  h.fillStyle = grey(1, 0.5);
  h.fill();
};
DRAWERS[SPRITE.drop] = (m, h) => {
  m.beginPath();
  m.moveTo(64, 6);
  m.bezierCurveTo(74, 34, 104, 56, 104, 82);
  m.arc(64, 82, 40, 0, Math.PI);
  m.bezierCurveTo(24, 56, 54, 34, 64, 6);
  m.closePath();
  m.fillStyle = radial(m, 56, 80, 50, [[0, 1, 1], [1, 0.8, 1]]);
  m.fill();
  h.beginPath();
  h.ellipse(50, 80, 7, 14, 0.3, 0, Math.PI * 2);
  h.fillStyle = grey(1, 0.9);
  h.fill();
};
DRAWERS[SPRITE.note] = (m) => {
  m.fillStyle = grey(1);
  m.save();
  m.translate(44, 96);
  m.rotate(-0.45);
  m.beginPath();
  m.ellipse(0, 0, 24, 17, 0, 0, Math.PI * 2);
  m.fill();
  m.restore();
  m.fillRect(60, 14, 10, 84);
  m.beginPath();
  m.moveTo(66, 14);
  m.bezierCurveTo(90, 26, 110, 40, 96, 72);
  m.bezierCurveTo(100, 50, 86, 44, 66, 40);
  m.closePath();
  m.fill();
};
DRAWERS[SPRITE.heart] = (m, h) => {
  m.beginPath();
  m.moveTo(64, 116);
  m.bezierCurveTo(10, 78, 6, 40, 30, 22);
  m.bezierCurveTo(46, 12, 60, 22, 64, 38);
  m.bezierCurveTo(68, 22, 82, 12, 98, 22);
  m.bezierCurveTo(122, 40, 118, 78, 64, 116);
  m.closePath();
  m.fillStyle = radial(m, 50, 44, 80, [[0, 1, 1], [1, 0.72, 1]]);
  m.fill();
  h.beginPath();
  h.ellipse(38, 42, 7, 12, -0.6, 0, Math.PI * 2);
  h.fillStyle = grey(1, 0.85);
  h.fill();
};
DRAWERS[SPRITE.streak] = (m, h) => {
  m.save();
  m.translate(64, 64);
  m.scale(1, 0.22);
  disc(m, 0, 0, 62, radial(m, 0, 0, 62, [[0, 1, 1], [0.35, 1, 0.8], [0.7, 1, 0.25], [1, 1, 0]]));
  m.restore();
  h.save();
  h.translate(64, 64);
  h.scale(1, 0.1);
  disc(h, 0, 0, 50, radial(h, 0, 0, 50, [[0, 1, 1], [0.6, 1, 0.6], [1, 1, 0]]));
  h.restore();
};
DRAWERS[SPRITE.ember] = (m, h) => {
  disc(m, 64, 64, 60, radial(m, 64, 64, 60, [[0, 1, 1], [0.2, 1, 0.85], [0.45, 1, 0.3], [1, 1, 0]]));
  disc(h, 64, 64, 18, radial(h, 64, 64, 18, [[0, 1, 1], [1, 1, 0]]));
};
DRAWERS[SPRITE.wisp] = (m, _h, rnd) => {
  for (let i = 0; i < 9; i++) {
    const x = 30 + rnd() * 68;
    const y = 64 + (rnd() - 0.5) * 22;
    const r = 16 + rnd() * 18;
    m.save();
    m.translate(x, y);
    m.scale(1.6, 0.6);
    disc(m, 0, 0, r, radial(m, 0, 0, r, [[0, 1, 0.55], [1, 1, 0]]));
    m.restore();
  }
  softEdge(m, 30);
};
DRAWERS[SPRITE.rect] = (m, h) => {
  const g = m.createLinearGradient(40, 20, 88, 108);
  g.addColorStop(0, grey(1));
  g.addColorStop(1, grey(0.8));
  m.fillStyle = g;
  m.beginPath();
  m.roundRect(40, 16, 48, 96, 6);
  m.fill();
  h.fillStyle = grey(1, 0.35);
  h.fillRect(44, 20, 8, 88);
};
DRAWERS[SPRITE.smoke2] = (m, _h, rnd) => puff(m, rnd, 11, 34, 25);
DRAWERS[SPRITE.flare] = (m, h) => {
  disc(m, 64, 64, 30, radial(m, 64, 64, 30, [[0, 1, 0.9], [1, 1, 0]]));
  for (const [sx, sy] of [[1, 0.035], [0.035, 1]] as const) {
    m.save();
    m.translate(64, 64);
    m.scale(sx, sy);
    disc(m, 0, 0, 62, radial(m, 0, 0, 62, [[0, 1, 1], [0.4, 1, 0.5], [1, 1, 0]]));
    m.restore();
  }
  disc(h, 64, 64, 12, radial(h, 64, 64, 12, [[0, 1, 1], [1, 1, 0]]));
};
// System glyphs: random strokes on a 3x3 lattice, seeded so the atlas is identical every boot.
for (let gi = 0; gi < GLYPH_COUNT; gi++) {
  DRAWERS[SPRITE.glyph + gi] = (m, h) => {
    const rnd = mulberry(977 + gi * 131);
    const P = (i: number): [number, number] => [28 + (i % 3) * 36, 28 + Math.floor(i / 3) * 36];
    m.lineCap = 'round';
    m.lineJoin = 'round';
    m.lineWidth = 9;
    m.strokeStyle = grey(1);
    m.shadowColor = 'white';
    m.shadowBlur = 6;
    let cur = Math.floor(rnd() * 9);
    m.beginPath();
    m.moveTo(...P(cur));
    const strokes = 3 + Math.floor(rnd() * 3);
    for (let s = 0; s < strokes; s++) {
      let nxt = cur;
      for (let tries = 0; tries < 12 && nxt === cur; tries++) {
        const dx = Math.floor(rnd() * 3) - 1;
        const dy = Math.floor(rnd() * 3) - 1;
        const cx = (cur % 3) + dx, cy = Math.floor(cur / 3) + dy;
        if (cx >= 0 && cx < 3 && cy >= 0 && cy < 3) nxt = cy * 3 + cx;
      }
      if (rnd() < 0.25) m.moveTo(...P(nxt));
      else m.lineTo(...P(nxt));
      cur = nxt;
    }
    m.stroke();
    m.shadowBlur = 0;
    const dot = Math.floor(rnd() * 9);
    disc(m, ...P(dot), 7, grey(1));
    disc(h, ...P(dot), 5, grey(1));
  };
}

/** Builds the 1024x512 sprite atlas (browser only: needs a 2D canvas). */
export function createParticleAtlas(): THREE.DataTexture {
  const W = CELL * ATLAS_COLS, H = CELL * ATLAS_ROWS;
  const mk = (): Ctx => {
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('particles: 2D canvas unavailable');
    return ctx;
  };
  const main = mk();
  const hot = mk();
  for (let i = 0; i < ATLAS_COLS * ATLAS_ROWS; i++) {
    const draw = DRAWERS[i];
    if (!draw) continue;
    const ox = (i % ATLAS_COLS) * CELL, oy = Math.floor(i / ATLAS_COLS) * CELL;
    for (const c of [main, hot]) {
      c.save();
      c.beginPath();
      c.rect(ox, oy, CELL, CELL);
      c.clip();
      c.translate(ox, oy);
    }
    draw(main, hot, mulberry(4242 + i * 17));
    main.restore();
    hot.restore();
  }
  const a = main.getImageData(0, 0, W, H).data;
  const b = hot.getImageData(0, 0, W, H).data;
  const out = new Uint8Array(W * H * 4);
  for (let i = 0; i < W * H * 4; i += 4) {
    const ma = a[i + 3], ha = b[i + 3];
    out[i] = ma < 8 ? 255 : a[i];
    out[i + 1] = Math.max(ma, ha);
    out[i + 2] = Math.round((ha * b[i]) / 255);
    out[i + 3] = 255;
  }
  const tex = new THREE.DataTexture(out, W, H, THREE.RGBAFormat, THREE.UnsignedByteType);
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  tex.name = 'ParticleAtlas';
  return tex;
}
