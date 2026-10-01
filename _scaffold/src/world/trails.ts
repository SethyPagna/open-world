/**
 * Camera-facing ribbon trails. Every trail is written into one shared dynamic buffer and drawn in a
 * single additive draw call; styles are chosen per vertex in the shader. Points are sampled by
 * distance, aged out by time (`length` = seconds of history) and smoothed with Catmull-Rom.
 */
import * as THREE from 'three';
import { SPRITE } from './particles.ts';
import type { ParticleSink } from './particles.ts';

export type TrailStyle = 'plain' | 'sparkle' | 'rainbow' | 'pixel' | 'ember';
export const TRAIL_STYLES: readonly TrailStyle[] = ['plain', 'sparkle', 'rainbow', 'pixel', 'ember'];
const STYLE_ID: Record<TrailStyle, number> = { plain: 0, sparkle: 1, rainbow: 2, pixel: 3, ember: 4 };

export interface TrailOptions {
  color: string;
  /** Full ribbon width at the head (m). Default 0.28. */
  width?: number;
  /** Seconds of history the ribbon shows. Default 0.45. */
  length?: number;
  /** 'plain' | 'sparkle' | 'rainbow' | 'pixel' | 'ember' (unknown -> plain). */
  style?: string;
  /** HDR multiplier for bloom. Default 2. */
  intensity?: number;
}
export interface TrailHandle {
  /** Stop sampling; the ribbon drains away over `length` seconds, then frees itself. */
  stop(): void;
  readonly alive: boolean;
}

export const TRAIL_MAX_POINTS = 48;
export const TRAIL_SUBDIV = 3;
const MAX_TRAILS = 64;
const MAX_SAMPLES = TRAIL_MAX_POINTS * TRAIL_SUBDIV + 2;

/** Ring buffer of timed points, iterated newest (i = 0) to oldest. Pure. */
export class TrailPath {
  readonly cap: number;
  readonly data: Float32Array;
  count = 0;
  private start = 0;
  constructor(cap = TRAIL_MAX_POINTS) {
    this.cap = cap;
    this.data = new Float32Array(cap * 4);
  }
  clear(): void {
    this.count = 0;
    this.start = 0;
  }
  push(x: number, y: number, z: number, t: number): void {
    this.start = (this.start - 1 + this.cap) % this.cap;
    const o = this.start * 4;
    this.data[o] = x; this.data[o + 1] = y; this.data[o + 2] = z; this.data[o + 3] = t;
    if (this.count < this.cap) this.count++;
  }
  private o(i: number): number {
    return ((this.start + i) % this.cap) * 4;
  }
  x(i: number): number { return this.data[this.o(i)]; }
  y(i: number): number { return this.data[this.o(i) + 1]; }
  z(i: number): number { return this.data[this.o(i) + 2]; }
  t(i: number): number { return this.data[this.o(i) + 3]; }
  /** Drops points older than maxAge. */
  expire(now: number, maxAge: number): void {
    while (this.count > 0 && now - this.t(this.count - 1) > maxAge) this.count--;
  }
}

/** Output of `sampleTrail`: smoothed positions, normalised age u (0 head .. 1 tail) and distance from head. */
export class TrailSamples {
  readonly x = new Float32Array(MAX_SAMPLES);
  readonly y = new Float32Array(MAX_SAMPLES);
  readonly z = new Float32Array(MAX_SAMPLES);
  readonly u = new Float32Array(MAX_SAMPLES);
  readonly d = new Float32Array(MAX_SAMPLES);
  n = 0;
}

// Control points (head + path) gathered before smoothing.
const CX = new Float32Array(TRAIL_MAX_POINTS + 1);
const CY = new Float32Array(TRAIL_MAX_POINTS + 1);
const CZ = new Float32Array(TRAIL_MAX_POINTS + 1);
const CA = new Float32Array(TRAIL_MAX_POINTS + 1);

/**
 * Head (live object position) + stored points -> Catmull-Rom smoothed samples. Returns sample count.
 * Pure: used by the renderer and unit tests.
 */
export function sampleTrail(
  path: TrailPath, hx: number, hy: number, hz: number, headAge: number, now: number, maxAge: number,
  subdiv: number, out: TrailSamples,
): number {
  let m = 0;
  CX[0] = hx; CY[0] = hy; CZ[0] = hz; CA[0] = headAge;
  m = 1;
  for (let i = 0; i < path.count; i++) {
    const x = path.x(i), y = path.y(i), z = path.z(i);
    const dx = x - CX[m - 1], dy = y - CY[m - 1], dz = z - CZ[m - 1];
    if (dx * dx + dy * dy + dz * dz < 1e-6) continue;
    CX[m] = x; CY[m] = y; CZ[m] = z; CA[m] = now - path.t(i);
    m++;
  }
  let n = 0;
  if (m < 2) {
    out.n = 0;
    return 0;
  }
  const inv = 1 / Math.max(1e-4, maxAge);
  let dist = 0;
  for (let i = 0; i < m - 1; i++) {
    const i0 = i > 0 ? i - 1 : i, i2 = i + 1, i3 = i + 2 < m ? i + 2 : i + 1;
    for (let k = 0; k < subdiv; k++) {
      const t = k / subdiv;
      const t2 = t * t, t3 = t2 * t;
      const a = -0.5 * t3 + t2 - 0.5 * t;
      const b = 1.5 * t3 - 2.5 * t2 + 1;
      const c = -1.5 * t3 + 2 * t2 + 0.5 * t;
      const e = 0.5 * t3 - 0.5 * t2;
      const x = a * CX[i0] + b * CX[i] + c * CX[i2] + e * CX[i3];
      const y = a * CY[i0] + b * CY[i] + c * CY[i2] + e * CY[i3];
      const z = a * CZ[i0] + b * CZ[i] + c * CZ[i2] + e * CZ[i3];
      if (n > 0) dist += Math.hypot(x - out.x[n - 1], y - out.y[n - 1], z - out.z[n - 1]);
      out.x[n] = x; out.y[n] = y; out.z[n] = z;
      out.u[n] = Math.min(1, (CA[i] + (CA[i2] - CA[i]) * t) * inv);
      out.d[n] = dist;
      n++;
    }
  }
  const l = m - 1;
  dist += Math.hypot(CX[l] - out.x[n - 1], CY[l] - out.y[n - 1], CZ[l] - out.z[n - 1]);
  out.x[n] = CX[l]; out.y[n] = CY[l]; out.z[n] = CZ[l];
  out.u[n] = Math.min(1, CA[l] * inv);
  out.d[n] = dist;
  n++;
  out.n = n;
  return n;
}

/** Ribbon half-width multiplier along the trail (1 at head, 0 at tail). */
export function trailWidthAt(u: number): number {
  const k = 1 - u;
  return k <= 0 ? 0 : Math.pow(k, 0.75);
}
/** Ribbon alpha along the trail. */
export function trailAlphaAt(u: number): number {
  const k = 1 - u;
  return k <= 0 ? 0 : Math.pow(k, 1.5);
}

class TrailInstance {
  readonly path = new TrailPath();
  obj: THREE.Object3D | null = null;
  r = 1; g = 1; b = 1;
  width = 0.28;
  length = 0.45;
  style = 0;
  stopped = false;
  inUse = false;
  hx = 0; hy = 0; hz = 0;
  hasHead = false;
  headTime = 0;
  lastSampleT = 0;
  emitAcc = 0;
  speed = 0;
  generation = 0;
  stop(): void {
    if (this.inUse) this.stopped = true;
  }
}

/** Stable handle so a stale `stop()` never kills a trail that later reused the slot. */
class TrailRef implements TrailHandle {
  private readonly inst: TrailInstance;
  private readonly gen: number;
  constructor(inst: TrailInstance) {
    this.inst = inst;
    this.gen = inst.generation;
  }
  stop(): void {
    if (this.inst.generation === this.gen) this.inst.stop();
  }
  get alive(): boolean {
    return this.inst.generation === this.gen && this.inst.inUse;
  }
}

const TRAIL_VERT = /* glsl */ `
attribute vec4 aColor;
attribute vec4 aInfo;
varying vec4 vColor;
varying vec4 vInfo;
varying float vDepth;
void main() {
  vColor = aColor;
  vInfo = aInfo;
  vec4 mv = viewMatrix * vec4(position, 1.0);
  vDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`;
const TRAIL_FRAG = /* glsl */ `
uniform float uTime;
varying vec4 vColor;
varying vec4 vInfo;
varying float vDepth;
float hash2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
vec3 hue(float h) { return clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0); }
void main() {
  float u = vInfo.x;
  float v = vInfo.y;
  float d = vInfo.z;
  int style = int(vInfo.w + 0.5);
  float e = max(0.0, 1.0 - v * v);
  float peak = max(max(vColor.r, vColor.g), vColor.b);
  vec3 col = vColor.rgb;
  float a = vColor.a * pow(e, 1.3);
  float core = pow(e, 9.0) * (1.0 - u) * (1.0 - u);
  if (style == 1) {
    vec2 cell = floor(vec2(d * 9.0, (v + 1.0) * 2.0));
    float h = hash2(cell);
    float tw = step(0.72, h) * pow(0.5 + 0.5 * sin(uTime * 16.0 + h * 60.0), 3.0);
    col += vec3(tw * 3.0 * max(peak, 1.0));
    a = max(a, tw * vColor.a * e);
  } else if (style == 2) {
    col = (hue(fract(d * 0.22 - uTime * 0.45)) * 0.85 + 0.15) * peak;
  } else if (style == 3) {
    vec2 q = floor(vec2(d * 11.0, (v + 1.0) * 2.49));
    float h = hash2(q);
    float keep = step(u * 1.25 - 0.15, h);
    a = vColor.a * keep * step(abs(v), 0.97) * (0.55 + 0.45 * (1.0 - u));
    col *= 0.7 + 0.6 * hash2(q + 7.0);
    core = 0.0;
  } else if (style == 4) {
    float n = hash2(floor(vec2(d * 14.0 - uTime * 6.0, v * 3.0)));
    float flick = 0.75 + 0.25 * sin(d * 23.0 - uTime * 31.0);
    vec3 hotc = vec3(1.0, 0.92, 0.65) * max(peak, 1.0) * 1.4;
    vec3 mid = col;
    vec3 cool = vec3(col.r * 0.7, col.g * 0.18, col.b * 0.05);
    col = mix(mix(hotc, mid, smoothstep(0.0, 0.3, u)), cool, smoothstep(0.35, 0.9, u)) * flick;
    a *= smoothstep(0.0, 0.35, n + 0.45 - u * 0.6);
  }
  col += vec3(core * 1.6 * max(peak, 1.0));
  a *= smoothstep(0.2, 1.4, vDepth);
  gl_FragColor = vec4(col * a, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

const _v = new THREE.Vector3();
const _color = new THREE.Color();
const TRAIL_ATTRS = [['position', 3], ['aColor', 4], ['aInfo', 4]] as const;

export class TrailRenderer {
  readonly mesh: THREE.Mesh;
  private readonly parent: THREE.Object3D;
  private readonly particles: ParticleSink | null;
  private readonly trails: TrailInstance[] = [];
  private readonly samples = new TrailSamples();
  private readonly pos: Float32Array;
  private readonly col: Float32Array;
  private readonly info: Float32Array;
  private readonly index: Uint16Array;
  private readonly material: THREE.ShaderMaterial;
  private now = 0;
  private hueT = 0;
  private emitSeed = 12345;

  constructor(parent: THREE.Object3D, particles: ParticleSink | null = null) {
    this.parent = parent;
    this.particles = particles;
    for (let i = 0; i < MAX_TRAILS; i++) this.trails.push(new TrailInstance());
    const maxVerts = MAX_TRAILS * MAX_SAMPLES * 2;
    this.pos = new Float32Array(maxVerts * 3);
    this.col = new Float32Array(maxVerts * 4);
    this.info = new Float32Array(maxVerts * 4);
    this.index = new Uint16Array(MAX_TRAILS * (MAX_SAMPLES - 1) * 6);
    const g = new THREE.BufferGeometry();
    const mk = (arr: Float32Array, n: number): THREE.BufferAttribute => {
      const a = new THREE.BufferAttribute(arr, n);
      a.setUsage(THREE.DynamicDrawUsage);
      return a;
    };
    g.setAttribute('position', mk(this.pos, 3));
    g.setAttribute('aColor', mk(this.col, 4));
    g.setAttribute('aInfo', mk(this.info, 4));
    const idx = new THREE.BufferAttribute(this.index, 1);
    idx.setUsage(THREE.DynamicDrawUsage);
    g.setIndex(idx);
    g.setDrawRange(0, 0);
    this.material = new THREE.ShaderMaterial({
      name: 'Trails',
      vertexShader: TRAIL_VERT,
      fragmentShader: TRAIL_FRAG,
      uniforms: { uTime: { value: 0 } },
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    this.mesh = new THREE.Mesh(g, this.material);
    this.mesh.name = 'Trails';
    this.mesh.frustumCulled = false;
    this.mesh.matrixAutoUpdate = false;
    this.mesh.renderOrder = 25;
    this.mesh.visible = false;
    parent.add(this.mesh);
  }

  get activeCount(): number {
    let n = 0;
    for (const t of this.trails) if (t.inUse) n++;
    return n;
  }

  add(obj: THREE.Object3D, opts: TrailOptions): TrailHandle {
    let inst = this.trails.find((t) => !t.inUse);
    if (!inst) {
      // Out of slots: recycle the first stopped trail, else the oldest slot.
      inst = this.trails.find((t) => t.stopped) ?? this.trails[0];
    }
    inst.generation++;
    inst.inUse = true;
    inst.stopped = false;
    inst.obj = obj;
    inst.path.clear();
    inst.hasHead = false;
    inst.emitAcc = 0;
    inst.speed = 0;
    const intensity = opts.intensity ?? 2;
    _color.set(opts.color);
    inst.r = _color.r * intensity; inst.g = _color.g * intensity; inst.b = _color.b * intensity;
    inst.width = opts.width ?? 0.28;
    inst.length = Math.max(0.05, opts.length ?? 0.45);
    const st = (opts.style ?? 'plain') as TrailStyle;
    inst.style = STYLE_ID[st] ?? 0;
    return new TrailRef(inst);
  }

  clear(): void {
    for (const t of this.trails) {
      if (t.inUse) t.generation++;
      t.inUse = false;
      t.obj = null;
      t.path.clear();
    }
    this.mesh.visible = false;
  }

  private rnd(): number {
    this.emitSeed = (Math.imul(this.emitSeed, 1664525) + 1013904223) | 0;
    return (this.emitSeed >>> 8) / 16777216;
  }

  update(dt: number, camera: THREE.Camera): void {
    this.now += dt;
    this.hueT += dt;
    this.material.uniforms.uTime.value = this.now;
    const now = this.now;
    const ce = camera.matrixWorld.elements;
    const camX = ce[12], camY = ce[13], camZ = ce[14];
    let vert = 0;
    let idx = 0;
    const S = this.samples;
    for (const t of this.trails) {
      if (!t.inUse) continue;
      if (!t.stopped && t.obj) {
        t.obj.updateWorldMatrix(true, false);
        _v.setFromMatrixPosition(t.obj.matrixWorld);
        if (t.hasHead) {
          const moved = Math.hypot(_v.x - t.hx, _v.y - t.hy, _v.z - t.hz);
          if (dt > 0) t.speed = t.speed * 0.8 + (moved / dt) * 0.2;
          this.emit(t, t.hx, t.hy, t.hz, _v.x, _v.y, _v.z, moved);
        }
        t.hx = _v.x; t.hy = _v.y; t.hz = _v.z;
        t.headTime = now;
        if (!t.hasHead) {
          t.hasHead = true;
          t.path.push(t.hx, t.hy, t.hz, now);
          t.lastSampleT = now;
        }
        // Space samples so the buffer covers the whole history even at high speed.
        const minStep = Math.max(0.04, (t.speed * t.length) / (TRAIL_MAX_POINTS - 6));
        const p = t.path;
        const dx = t.hx - p.x(0), dy = t.hy - p.y(0), dz = t.hz - p.z(0);
        if (p.count === 0 || dx * dx + dy * dy + dz * dz > minStep * minStep || now - t.lastSampleT > t.length / 8) {
          p.push(t.hx, t.hy, t.hz, now);
          t.lastSampleT = now;
        }
      }
      t.path.expire(now, t.length);
      if (t.stopped && t.path.count === 0) {
        t.inUse = false;
        t.obj = null;
        continue;
      }
      if (!t.hasHead) continue;
      const n = sampleTrail(t.path, t.hx, t.hy, t.hz, now - t.headTime, now, t.length, TRAIL_SUBDIV, S);
      if (n < 2) continue;
      if (vert + n * 2 > this.pos.length / 3) break;
      idx = this.writeRibbon(t, n, camX, camY, camZ, vert, idx);
      vert += n * 2;
    }
    const g = this.mesh.geometry;
    g.setDrawRange(0, idx);
    this.mesh.visible = idx > 0;
    if (idx > 0) {
      for (const [name, size] of TRAIL_ATTRS) {
        const a = g.getAttribute(name) as THREE.BufferAttribute;
        a.clearUpdateRanges();
        a.addUpdateRange(0, vert * size);
        a.needsUpdate = true;
      }
      const ia = g.getIndex() as THREE.BufferAttribute;
      ia.clearUpdateRanges();
      ia.addUpdateRange(0, idx);
      ia.needsUpdate = true;
    }
  }

  private writeRibbon(t: TrailInstance, n: number, camX: number, camY: number, camZ: number, base: number, idx: number): number {
    const S = this.samples;
    const pos = this.pos, col = this.col, info = this.info, index = this.index;
    let psx = 0, psy = 1, psz = 0;
    const hw = t.width * 0.5;
    for (let j = 0; j < n; j++) {
      const ja = j > 0 ? j - 1 : j, jb = j < n - 1 ? j + 1 : j;
      let tx = S.x[ja] - S.x[jb], ty = S.y[ja] - S.y[jb], tz = S.z[ja] - S.z[jb];
      const tl = Math.hypot(tx, ty, tz) || 1;
      tx /= tl; ty /= tl; tz /= tl;
      const vx = camX - S.x[j], vy = camY - S.y[j], vz = camZ - S.z[j];
      let sx = ty * vz - tz * vy, sy = tz * vx - tx * vz, sz = tx * vy - ty * vx;
      const sl = Math.hypot(sx, sy, sz);
      if (sl < 1e-5) {
        sx = psx; sy = psy; sz = psz;
      } else {
        sx /= sl; sy /= sl; sz /= sl;
      }
      psx = sx; psy = sy; psz = sz;
      const u = S.u[j];
      const w = hw * trailWidthAt(u);
      const a = trailAlphaAt(u);
      const v0 = base + j * 2;
      for (let side = 0; side < 2; side++) {
        const sgn = side === 0 ? -1 : 1;
        const vi = v0 + side;
        pos[vi * 3] = S.x[j] + sx * w * sgn;
        pos[vi * 3 + 1] = S.y[j] + sy * w * sgn;
        pos[vi * 3 + 2] = S.z[j] + sz * w * sgn;
        col[vi * 4] = t.r; col[vi * 4 + 1] = t.g; col[vi * 4 + 2] = t.b; col[vi * 4 + 3] = a;
        info[vi * 4] = u; info[vi * 4 + 1] = sgn; info[vi * 4 + 2] = S.d[j]; info[vi * 4 + 3] = t.style;
      }
      if (j > 0) {
        const a0 = v0 - 2, b0 = v0 - 1, c0 = v0, d0 = v0 + 1;
        index[idx++] = a0; index[idx++] = b0; index[idx++] = c0;
        index[idx++] = b0; index[idx++] = d0; index[idx++] = c0;
      }
    }
    return idx;
  }

  /** Style particles emitted along the segment the head just travelled. */
  private emit(t: TrailInstance, ax: number, ay: number, az: number, bx: number, by: number, bz: number, moved: number): void {
    const ps = this.particles;
    if (!ps || t.style === 0 || moved <= 0) return;
    const perMetre = t.style === 1 ? 7 : t.style === 2 ? 5 : t.style === 3 ? 9 : 10;
    t.emitAcc += moved * perMetre;
    let guard = 0;
    while (t.emitAcc >= 1 && guard++ < 24) {
      t.emitAcc -= 1;
      const f = this.rnd();
      const x = ax + (bx - ax) * f, y = ay + (by - ay) * f, z = az + (bz - az) * f;
      const P = ps.params.reset();
      const j = t.width * 0.6;
      P.x = x + (this.rnd() - 0.5) * j;
      P.y = y + (this.rnd() - 0.5) * j;
      P.z = z + (this.rnd() - 0.5) * j;
      const peak = Math.max(t.r, t.g, t.b, 1e-3);
      if (t.style === 1) {
        P.sprite = SPRITE.sparkle;
        P.size(0.1 + this.rnd() * 0.1, 0);
        P.sizeIn = 0.15;
        P.life = 0.45 + this.rnd() * 0.4;
        P.vel((this.rnd() - 0.5) * 0.4, 0.2 + this.rnd() * 0.3, (this.rnd() - 0.5) * 0.4);
        P.drag = 2;
        P.rot = this.rnd() * 6.28;
        P.spin = (this.rnd() - 0.5) * 4;
        P.color(t.r * 0.5 + 1.2, t.g * 0.5 + 1.2, t.b * 0.5 + 1.2).colorEnd(t.r, t.g, t.b);
        P.pulse = 0.5;
        P.pulseFreq = 7;
      } else if (t.style === 2) {
        P.sprite = this.rnd() < 0.5 ? SPRITE.star : SPRITE.sparkle;
        P.size(0.09 + this.rnd() * 0.06, 0.02);
        P.sizeIn = 0.2;
        P.life = 0.5 + this.rnd() * 0.3;
        P.gravity = 1.5;
        P.vel((this.rnd() - 0.5) * 0.6, 0.4 + this.rnd() * 0.4, (this.rnd() - 0.5) * 0.6);
        P.spin = (this.rnd() - 0.5) * 6;
        _color.setHSL((this.hueT * 0.45 + f * 0.2 + this.rnd() * 0.15) % 1, 1, 0.6);
        P.color(_color.r * 2.4, _color.g * 2.4, _color.b * 2.4);
        P.hot = 0.4;
      } else if (t.style === 3) {
        P.sprite = SPRITE.pixel;
        P.quant = 0.05;
        P.size(0.05 + Math.floor(this.rnd() * 2) * 0.03, 0.03);
        P.life = 0.35 + this.rnd() * 0.45;
        P.gravity = 3;
        P.vel((this.rnd() - 0.5) * 0.5, this.rnd() * 0.5, (this.rnd() - 0.5) * 0.5);
        const b = 0.7 + this.rnd() * 0.8;
        P.color(t.r * b, t.g * b, t.b * b);
        P.pulse = 0.8;
        P.pulseFreq = 9;
        P.hot = 0;
      } else {
        P.sprite = SPRITE.ember;
        P.size(0.05 + this.rnd() * 0.05, 0.01);
        P.life = 0.5 + this.rnd() * 0.6;
        P.gravity = -2.2;
        P.drag = 1.5;
        P.vel((this.rnd() - 0.5) * 0.7, 0.2 + this.rnd() * 0.6, (this.rnd() - 0.5) * 0.7);
        P.wobble = 0.08;
        P.wobbleFreq = 7;
        P.color(1.2 * Math.max(1, peak), 0.9 * Math.max(1, peak), 0.5 * Math.max(1, peak)).colorEnd(t.r * 0.9, t.g * 0.25, t.b * 0.1);
        P.pulse = 0.4;
        P.pulseFreq = 11;
      }
      ps.spawn(P);
    }
    if (t.emitAcc > 4) t.emitAcc = 0;
  }

  dispose(): void {
    this.parent.remove(this.mesh);
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}
