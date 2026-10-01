/**
 * Sky domes: one draw call each, rendered at the far plane (xyww) so they never clip and never need to
 * follow the camera.
 *   gradient  - zenith/horizon/ground gradient, haze band, sun disc + glow
 *   well      - looking up a well shaft from the bottom: exact ray/cylinder hit against the shaft so it
 *               continues kit.roundWell geometry seamlessly, brick courses, a sunlit crescent, and a
 *               bright oculus of day sky far above
 *   day       - gradient + drifting toon clouds above, a sea of clouds below, faint rainbow haze
 *   space     - twinkling star layers, a nebula band, a distant ringed planet
 *   beyond    - swirling iridescent cosmos with concentric halo rings around a bright core
 */
import * as THREE from 'three';
import type { BiomeId, Palette } from './palettes.ts';

export type SkyKind = 'gradient' | 'well' | 'day' | 'space' | 'beyond';
export const SKY_FOR_BIOME: Readonly<Record<BiomeId, SkyKind>> = { well: 'well', sky: 'day', space: 'space', beyond: 'beyond' };

export interface SkyOptions {
  sunDirection?: THREE.Vector3;
  /** Shared clock object (e.g. KIT_TIME from materials.ts); otherwise update(time) drives it. */
  time?: { value: number };
  /** well: shaft radius (match kit.roundWell), height of the oculus above y=0, axis centre XZ. */
  shaftRadius?: number;
  oculusHeight?: number;
  shaftCenter?: THREE.Vector2;
  /** space: direction and angular radius (radians) of the distant planet. */
  planetDirection?: THREE.Vector3;
  planetSize?: number;
  /** 0..1 overall cloud cover for 'day'. */
  cloudCover?: number;
}

export interface SkyHandle {
  readonly kind: SkyKind;
  readonly mesh: THREE.Mesh;
  readonly material: THREE.ShaderMaterial;
  readonly sunDirection: THREE.Vector3;
  update(time: number): void;
  setSunDirection(dir: THREE.Vector3): void;
  dispose(): void;
}

const C = (hex: string) => new THREE.Color(hex);

const COMMON = /* glsl */ `
uniform float uTime;
uniform vec3 uZenith; uniform vec3 uHorizon; uniform vec3 uGround; uniform vec3 uSun; uniform vec3 uSunGlow;
uniform vec3 uHaze; uniform vec3 uCloud; uniform vec3 uCloudShade; uniform vec3 uNebA; uniform vec3 uNebB; uniform vec3 uNebC;
uniform vec3 uStars; uniform vec3 uPlanet; uniform vec3 uPlanetShade; uniform vec3 uSunDir;
varying vec3 vDir;
varying vec3 vWorldDir;

float hash13(vec3 p) { p = fract(p * 0.1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float noise2(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), f.x), mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), f.x), f.y);
}
float noise3(vec3 p) {
  vec3 i = floor(p); vec3 f = fract(p); f = f * f * (3.0 - 2.0 * f);
  float n000 = hash13(i), n100 = hash13(i + vec3(1,0,0)), n010 = hash13(i + vec3(0,1,0)), n110 = hash13(i + vec3(1,1,0));
  float n001 = hash13(i + vec3(0,0,1)), n101 = hash13(i + vec3(1,0,1)), n011 = hash13(i + vec3(0,1,1)), n111 = hash13(i + vec3(1,1,1));
  return mix(mix(mix(n000, n100, f.x), mix(n010, n110, f.x), f.y), mix(mix(n001, n101, f.x), mix(n011, n111, f.x), f.y), f.z);
}
float fbm2(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { s += a * noise2(p); p = p * 2.03 + 11.7; a *= 0.5; } return s / 0.96875; }
float fbm3(vec3 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { s += a * noise3(p); p = p * 2.02 + 7.3; a *= 0.5; } return s / 0.96875; }

vec3 skyGradient(vec3 d) {
  float h = d.y;
  vec3 c = h > 0.0 ? mix(uHorizon, uZenith, pow(clamp(h, 0.0, 1.0), 0.55)) : mix(uHorizon, uGround, pow(clamp(-h, 0.0, 1.0), 0.35));
  c = mix(c, uHaze, exp(-abs(h) * 9.0) * 0.45);
  return c;
}
vec3 sunDisc(vec3 d, float size) {
  float sd = max(dot(d, normalize(uSunDir)), 0.0);
  return uSunGlow * (pow(sd, 6.0) * 0.35 + pow(sd, 48.0) * 0.6) + uSun * smoothstep(1.0 - 0.0009 * size, 1.0 - 0.0006 * size, sd) * 14.0;
}
float starLayer(vec3 d, float scale, float density, float t) {
  vec3 q = d * scale;
  vec3 id = floor(q);
  vec3 f = fract(q);
  float r = hash13(id);
  if (r < 1.0 - density) return 0.0;
  vec3 pos = vec3(hash13(id + 1.7), hash13(id + 4.1), hash13(id + 9.3)) * 0.7 + 0.15;
  float dist = length(f - pos);
  float tw = 0.65 + 0.35 * sin(t * (1.0 + r * 3.0) + r * 60.0);
  return smoothstep(0.07, 0.0, dist) * tw * (0.4 + 0.6 * fract(r * 13.0));
}
`;

const VERT = /* glsl */ `
varying vec3 vDir;
varying vec3 vWorldDir;
void main() {
  vDir = position;
  vWorldDir = normalize(position);
  vec4 p = projectionMatrix * mat4(mat3(viewMatrix)) * vec4(position, 1.0);
  gl_Position = p.xyww;
}`;

const OUT = /* glsl */ `
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
`;

const FRAG: Record<SkyKind, string> = {
  gradient: /* glsl */ `
    void main() {
      vec3 d = normalize(vDir);
      vec3 col = skyGradient(d) + sunDisc(d, 1.0);
      ${OUT}
    }`,

  well: /* glsl */ `
    uniform float uShaftR; uniform float uOculusH; uniform vec2 uShaftC;
    void main() {
      vec3 d = normalize(vDir);
      vec3 ro = cameraPosition - vec3(uShaftC.x, 0.0, uShaftC.y);
      // Ray vs infinite vertical cylinder (from inside): |ro.xz + t d.xz| = R
      float a = dot(d.xz, d.xz);
      float b = dot(ro.xz, d.xz);
      float c = dot(ro.xz, ro.xz) - uShaftR * uShaftR;
      float disc = max(b * b - a * c, 0.0);
      float t = (-b + sqrt(disc)) / max(a, 1e-5);
      vec3 hit = ro + d * t;
      vec3 col;
      if (hit.y > uOculusH || a < 1e-5) {
        // Through the oculus: a small bright day sky with soft clouds.
        vec2 uv = d.xz / max(d.y, 0.05);
        float cl = fbm2(uv * 1.6 + vec2(uTime * 0.02, 0.0));
        vec3 skyc = mix(uHorizon, uZenith, clamp(d.y, 0.0, 1.0));
        col = mix(skyc, uCloud, smoothstep(0.5, 0.75, cl) * 0.8);
        col += sunDisc(d, 3.0) * 0.6;
        col *= 1.6;
      } else {
        float az = atan(hit.z, hit.x);
        float arc = az * uShaftR;
        float h = hit.y;
        float rowH = 0.34;
        float row = floor(h / rowH);
        float bu = arc / 0.72 + mod(row, 2.0) * 0.5;
        float fu = fract(bu), fv = fract(h / rowH);
        float wu = fwidth(bu) * 1.5 + 0.03, wv = fwidth(h / rowH) * 1.5 + 0.05;
        float mortar = max(1.0 - smoothstep(0.0, wu, min(fu, 1.0 - fu)), 1.0 - smoothstep(0.0, wv, min(fv, 1.0 - fv)));
        float tone = 0.75 + 0.25 * hash12(vec2(floor(bu), row));
        vec3 wall = uNebB * tone;
        wall = mix(wall, uNebA * 0.5, mortar);
        // Moss streaks.
        float m = fbm2(vec2(arc * 0.6, h * 0.15));
        wall = mix(wall, uNebC * 0.35, smoothstep(0.6, 0.75, m) * 0.6);
        // Light: skylight falls off down the shaft; a sunlit crescent where the sun reaches through.
        float fromTop = uOculusH - h;
        float sky = exp(-fromTop * 0.09);
        vec3 sdir = normalize(uSunDir);
        vec3 wp = hit;
        float s = (uOculusH - wp.y) / max(sdir.y, 0.05);
        vec2 atTop = wp.xz + sdir.xz * s;
        float sunlit = (1.0 - smoothstep(uShaftR * 0.92, uShaftR * 1.0, length(atTop))) * step(0.0, -dot(normalize(wp.xz), sdir.xz));
        vec3 light = uHorizon * (0.05 + sky * 1.1) + uSun * sunlit * 1.6 * (0.4 + 0.6 * sky);
        col = wall * light;
        // Lip silhouette and the haze glow near the opening.
        float lip = smoothstep(uOculusH - 0.7, uOculusH - 0.2, h);
        col = mix(col, uNebA * 0.2, lip * 0.9);
        col += uSunGlow * exp(-fromTop * 0.35) * 0.35;
        // Vines hanging from the rim.
        float vine = step(0.72, noise2(vec2(arc * 1.3, 0.0))) * smoothstep(uOculusH - 1.0 - 6.0 * noise2(vec2(arc * 2.0, 3.0)), uOculusH, h);
        col = mix(col, uNebC * 0.18, vine * 0.9);
        // Dim to near-black low in the shaft (the lanterns in the room take over there).
        col *= smoothstep(-8.0, uOculusH * 0.6, h) * 0.9 + 0.1;
      }
      ${OUT}
    }`,

  day: /* glsl */ `
    uniform float uCover;
    void main() {
      vec3 d = normalize(vDir);
      vec3 col = skyGradient(d);
      vec3 sd = normalize(uSunDir);
      if (d.y > 0.0) {
        vec2 uv = d.xz / (d.y + 0.12) * 0.9 + vec2(uTime * 0.012, uTime * 0.004);
        float n = fbm2(uv);
        float n2 = fbm2(uv + sd.xz * 0.06);
        float thr = 0.62 - uCover * 0.2;
        float mask = smoothstep(thr, thr + 0.04, n) * smoothstep(0.0, 0.25, d.y);
        float lit = clamp(0.55 + (n - n2) * 5.0, 0.0, 1.0);
        vec3 cc = mix(uCloudShade, uCloud, lit);
        cc += uSunGlow * pow(max(dot(d, sd), 0.0), 4.0) * 0.5;
        col = mix(col, cc, mask * 0.95);
      } else {
        // Sea of clouds below.
        vec2 uv = d.xz / (-d.y + 0.03) * 0.35 + vec2(uTime * 0.006, 0.0);
        float n = fbm2(uv);
        float n2 = fbm2(uv - sd.xz * 0.05);
        float lit = clamp(0.62 + (n - n2) * 5.0, 0.0, 1.0);
        vec3 sea = mix(uCloudShade, uCloud, lit) * (0.9 + 0.2 * n);
        float far = exp(d.y * 14.0);
        col = mix(sea, uHaze, far * 0.8);
      }
      // Rainbow haze opposite the sun.
      float ang = acos(clamp(dot(d, -sd), -1.0, 1.0));
      float bow = (ang - 0.66) / 0.05;
      if (abs(bow) < 1.0 && d.y > -0.05) {
        vec3 rb = clamp(abs(fract(bow * 0.5 + 0.5 + vec3(0.0, 0.33, 0.67)) * 6.0 - 3.0) - 1.0, 0.0, 1.0);
        col += rb * (1.0 - abs(bow)) * 0.12 * smoothstep(-0.05, 0.2, d.y);
      }
      col += sunDisc(d, 1.6);
      ${OUT}
    }`,

  space: /* glsl */ `
    uniform vec3 uPlanetDir; uniform float uPlanetSize;
    void main() {
      vec3 d = normalize(vDir);
      float bd = dot(d, normalize(vec3(0.25, 1.0, 0.35)));
      float band = exp(-bd * bd * 5.0);
      vec3 col = mix(uZenith, uHorizon, band * 0.6 + 0.1);
      // Nebula: domain-warped fbm concentrated along the galactic band.
      vec3 q = d * 2.2;
      vec3 w = vec3(fbm3(q + 3.1), fbm3(q + 7.7), fbm3(q + 1.3));
      float n = fbm3(q * 1.3 + w * 1.6 + uTime * 0.004);
      float neb = smoothstep(0.35, 0.85, n) * (0.25 + band);
      vec3 nc = mix(uNebB, uNebA, smoothstep(0.3, 0.7, w.x));
      nc = mix(nc, uNebC, smoothstep(0.55, 0.8, w.y) * 0.6);
      float dust = smoothstep(0.55, 0.7, fbm3(q * 3.0 + 5.0));
      col += nc * neb * (1.0 - dust * 0.6) * 0.9;
      col += nc * pow(neb, 3.0) * 1.2;
      // Stars (three layers; the dense small layer sits in the band).
      float st = starLayer(d, 90.0, 0.10, uTime) * 1.2 + starLayer(d, 180.0, 0.10 + band * 0.25, uTime * 1.3) * 0.7 + starLayer(d, 40.0, 0.05, uTime * 0.7) * 2.5;
      col += uStars * st;
      // Distant planet with terminator, bands, atmosphere and a ring.
      vec3 pd = normalize(uPlanetDir);
      float pr = uPlanetSize;
      float cd = dot(d, pd);
      float ang = acos(clamp(cd, -1.0, 1.0));
      vec3 sdir = normalize(uSunDir);
      // Ring plane through the planet centre (at unit distance), tilted.
      vec3 rn = normalize(vec3(0.25, 1.0, -0.35));
      float dn = dot(d, rn);
      float tp = dot(pd, rn) / (abs(dn) < 1e-4 ? 1e-4 : dn);
      vec3 rp = d * tp - pd;
      float rr = length(rp) / sin(pr);
      float ringMask = smoothstep(1.35, 1.4, rr) * (1.0 - smoothstep(2.25, 2.35, rr)) * step(0.0, tp);
      float ringBand = 0.55 + 0.45 * sin(rr * 38.0) * sin(rr * 11.0);
      bool ringFront = tp < 1.0;
      vec3 ringCol = mix(uPlanet, uStars, 0.4) * ringBand * 0.9;
      if (ang < pr) {
        vec2 lp = vec2(0.0);
        vec3 up = normalize(cross(pd, vec3(0.0, 1.0, 0.0)));
        vec3 vv = cross(up, pd);
        lp = vec2(dot(d - pd * cd, up), dot(d - pd * cd, vv)) / sin(pr);
        float z = sqrt(max(1.0 - dot(lp, lp), 0.0));
        vec3 nrm = normalize(up * lp.x + vv * lp.y - pd * z);
        float lit = clamp(dot(nrm, sdir) * 0.9 + 0.1, 0.0, 1.0);
        float bands = fbm2(vec2(lp.y * 7.0 + fbm2(lp * 4.0) * 0.8, 1.0));
        vec3 pc = mix(uPlanetShade, uPlanet, 0.45 + bands * 0.55);
        vec3 pcol = pc * (0.08 + lit * 1.3);
        float rim = pow(clamp(1.0 - z, 0.0, 1.0), 3.0);
        pcol += uNebB * rim * (0.3 + lit) * 1.2;
        col = pcol;
        if (ringFront) col = mix(col, ringCol * (0.4 + lit), ringMask * 0.85);
      } else {
        col += ringCol * ringMask * 0.75;
        float glow = exp(-(ang - pr) * 30.0);
        col += uNebB * glow * 0.35;
      }
      ${OUT}
    }`,

  beyond: /* glsl */ `
    vec3 iri(float t) { return 0.5 + 0.5 * cos(6.28318 * (vec3(1.0, 1.0, 1.0) * t + vec3(0.0, 0.33, 0.67))); }
    void main() {
      vec3 d = normalize(vDir);
      vec3 core = normalize(uSunDir);
      float ca = acos(clamp(dot(d, core), -1.0, 1.0));
      // Swirl: rotate the sample around the core axis by an angle that grows with distance from it.
      vec3 ax = core;
      float sw = ca * 2.2 - uTime * 0.03;
      vec3 q = d * cos(sw) + cross(ax, d) * sin(sw) + ax * dot(ax, d) * (1.0 - cos(sw));
      vec3 w = vec3(fbm3(q * 2.0 + 1.0), fbm3(q * 2.0 + 5.0), fbm3(q * 2.0 + 9.0));
      float n = fbm3(q * 2.6 + w * 2.0);
      vec3 base = mix(uGround, uZenith, smoothstep(-0.6, 0.8, d.y));
      vec3 c1 = mix(uNebA, uNebB, smoothstep(0.3, 0.7, w.x));
      c1 = mix(c1, uNebC, smoothstep(0.55, 0.8, w.z) * 0.7);
      vec3 col = base + c1 * smoothstep(0.35, 0.9, n) * 1.1;
      col += iri(n * 1.5 + w.y + uTime * 0.02) * pow(smoothstep(0.5, 0.95, n), 2.0) * 0.6;
      // Concentric halo rings: layers upon layers, from the centre outwards.
      float rings = 0.0;
      for (int i = 1; i <= 5; i++) {
        float r = float(i) * 0.26 + 0.02 * sin(uTime * 0.2 + float(i));
        float dr = (ca - r) * 90.0;
        rings += exp(-dr * dr) * (1.2 - float(i) * 0.15);
      }
      col += mix(uHorizon, vec3(1.0), 0.4) * rings * 0.55;
      // The core: a white-gold eye with rays.
      float rays = pow(clamp(0.5 + 0.5 * sin(atan(dot(d, normalize(cross(core, vec3(0,1,0)))), dot(d, vec3(0,1,0))) * 18.0 + uTime * 0.1), 0.0, 1.0), 6.0);
      col += uSun * (exp(-ca * 18.0) * 3.0 + exp(-ca * 4.0) * 0.35 * (0.5 + rays * 0.5));
      col += uHorizon * exp(-ca * 1.5) * 0.25;
      col += uStars * (starLayer(d, 80.0, 0.08, uTime) + starLayer(d, 160.0, 0.12, uTime * 1.2) * 0.6);
      ${OUT}
    }`,
};

export function createSky(kind: SkyKind, p: Palette, o: SkyOptions = {}): SkyHandle {
  const sunDirection = (o.sunDirection ?? defaultSun(kind)).clone().normalize();
  const uniforms: Record<string, THREE.IUniform> = {
    uTime: o.time ?? { value: 0 },
    uZenith: { value: C(p.sky.zenith) }, uHorizon: { value: C(p.sky.horizon) }, uGround: { value: C(p.sky.ground) },
    uSun: { value: C(p.sky.sun) }, uSunGlow: { value: C(p.sky.sunGlow) }, uHaze: { value: C(p.sky.haze) },
    uCloud: { value: C(p.sky.cloud) }, uCloudShade: { value: C(p.sky.cloudShade) },
    uNebA: { value: C(p.sky.nebulaA) }, uNebB: { value: C(p.sky.nebulaB) }, uNebC: { value: C(p.sky.nebulaC) },
    uStars: { value: C(p.sky.stars) }, uPlanet: { value: C(p.sky.planet) }, uPlanetShade: { value: C(p.sky.planetShade) },
    uSunDir: { value: sunDirection },
    uShaftR: { value: o.shaftRadius ?? 8 },
    uOculusH: { value: o.oculusHeight ?? 40 },
    uShaftC: { value: o.shaftCenter ?? new THREE.Vector2() },
    uPlanetDir: { value: (o.planetDirection ?? new THREE.Vector3(-0.6, 0.35, -0.7)).clone().normalize() },
    uPlanetSize: { value: o.planetSize ?? 0.16 },
    uCover: { value: o.cloudCover ?? 0.5 },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: VERT,
    fragmentShader: COMMON + FRAG[kind],
    side: THREE.BackSide,
    depthWrite: false,
    depthTest: true,
    depthFunc: THREE.LessEqualDepth,
    fog: false,
  });
  material.name = `sky:${kind}`;
  const geo = new THREE.SphereGeometry(1, 48, 24);
  const mesh = new THREE.Mesh(geo, material);
  mesh.name = `kit:sky:${kind}`;
  mesh.frustumCulled = false;
  mesh.renderOrder = -1000;
  mesh.matrixAutoUpdate = false;
  return {
    kind, mesh, material, sunDirection,
    update(time: number) {
      if (!o.time) uniforms.uTime.value = time;
    },
    setSunDirection(dir: THREE.Vector3) {
      sunDirection.copy(dir).normalize();
    },
    dispose() {
      geo.dispose();
      material.dispose();
      mesh.removeFromParent();
    },
  };
}

function defaultSun(kind: SkyKind): THREE.Vector3 {
  switch (kind) {
    case 'well': return new THREE.Vector3(0.35, 1, 0.2);
    case 'day': return new THREE.Vector3(-0.55, 0.32, -0.75);
    case 'space': return new THREE.Vector3(0.8, 0.35, 0.45);
    case 'beyond': return new THREE.Vector3(0.1, 0.45, -1);
    default: return new THREE.Vector3(0.4, 0.6, 0.3);
  }
}
