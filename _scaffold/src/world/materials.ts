/**
 * Stylized material library. One MaterialLibrary per palette/room; materials are cached by name and
 * shared by every kit piece, so merged geometry costs one draw call per material.
 *
 * Most materials are white with `vertexColors: true`: kit builders write palette colours (with per-piece
 * jitter and baked ambient occlusion) into the colour attribute. A small onBeforeCompile patch adds
 * world-space moss on up-facing masonry, wet darkening near the floor, fresnel rims and vertex-coloured
 * emission. Textures come from textures.ts (global cache, not disposed here).
 */
import * as THREE from 'three';
import type { Palette } from './palettes.ts';
import {
  surfaceTexture, noiseTexture, runeStripTexture, letterPlateTexture, bannerTexture, ringBandsTexture,
  TEXTURE_METERS, type SurfaceName,
} from './textures.ts';
import { createWaterMaterial } from './water.ts';

export type MaterialName =
  | 'stone' | 'wet_stone' | 'brick' | 'tile' | 'plaster' | 'rock' | 'moss' | 'grass' | 'leaf' | 'petal'
  | 'wood' | 'brass' | 'gold' | 'iron' | 'paint' | 'cloth' | 'glass' | 'crystal' | 'cloud'
  | 'glow' | 'glow_soft' | 'glow_hot' | 'rune' | 'water' | 'void' | 'iridescent' | 'wax' | 'shadow' | 'foliage';

export const MATERIAL_NAMES: readonly MaterialName[] = [
  'stone', 'wet_stone', 'brick', 'tile', 'plaster', 'rock', 'moss', 'grass', 'leaf', 'petal',
  'wood', 'brass', 'gold', 'iron', 'paint', 'cloth', 'glass', 'crystal', 'cloud',
  'glow', 'glow_soft', 'glow_hot', 'rune', 'water', 'void', 'iridescent', 'wax', 'shadow', 'foliage',
];

/** Shared animation clock for every kit shader (water, void, crystals, runes). Set via tickMaterials(). */
export const KIT_TIME = { value: 0 };
export function tickMaterials(seconds: number): void {
  KIT_TIME.value = seconds;
}

/** Metres per texture tile for world-projected UVs (kit uses this when it generates UVs). */
export function uvMetersFor(mat: THREE.Material): number {
  return (mat.userData.uvMeters as number | undefined) ?? 2;
}

// ---------------------------------------------------------------------------------------------
// Shader patch
// ---------------------------------------------------------------------------------------------
export interface KitPatch {
  moss?: { color: string; amount: number };
  wet?: { amount: number; line: number };
  rim?: { color: string; strength: number; power?: number };
  vcEmissive?: boolean;
  /** Vertical gradient toward `color` below world y = `top` (cheap height-fog/darkness at pool level). */
  sink?: { color: string; top: number; depth: number };
  /** Wind sway (metres at 1 m above the local origin); for instanced tufts / foliage. */
  wind?: number;
}

const lin = (hex: string) => new THREE.Color(hex);

function applyPatch(mat: THREE.MeshStandardMaterial, patch: KitPatch): void {
  const defines: Record<string, string> = {};
  const u = {
    kitNoise: { value: noiseTexture() },
    kitMossColor: { value: lin(patch.moss?.color ?? '#557d33') },
    kitMoss: { value: patch.moss?.amount ?? 0 },
    kitWet: { value: patch.wet?.amount ?? 0 },
    kitWetLine: { value: patch.wet?.line ?? 0 },
    kitRimColor: { value: lin(patch.rim?.color ?? '#ffffff') },
    kitRim: { value: patch.rim?.strength ?? 0 },
    kitRimPow: { value: patch.rim?.power ?? 3 },
    kitSinkColor: { value: lin(patch.sink?.color ?? '#000000') },
    kitSinkTop: { value: patch.sink?.top ?? 0 },
    kitSinkDepth: { value: patch.sink?.depth ?? 1 },
    kitTime: KIT_TIME,
    kitWind: { value: patch.wind ?? 0 },
  };
  if (patch.moss && patch.moss.amount > 0) defines.KIT_MOSS = '';
  if (patch.wet && patch.wet.amount > 0) defines.KIT_WET = '';
  if (patch.rim && patch.rim.strength > 0) defines.KIT_RIM = '';
  if (patch.vcEmissive) defines.KIT_VC_EMISSIVE = '';
  if (patch.sink) defines.KIT_SINK = '';
  if (patch.wind) defines.KIT_WIND = '';
  mat.defines = { ...(mat.defines ?? {}), ...defines };
  mat.userData.kitUniforms = u;
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, u);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vKitWPos;\nvarying vec3 vKitWNrm;\nuniform float kitTime;\nuniform float kitWind;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
#ifdef KIT_WIND
{
  // Sway grows with height above the piece's origin; phase from its world position.
  vec3 kOrg = modelMatrix[3].xyz;
  #ifdef USE_INSTANCING
    kOrg += mat3(modelMatrix) * instanceMatrix[3].xyz;
  #endif
  float kh = max(transformed.y, 0.0);
  float kph = kitTime * 1.9 + kOrg.x * 0.55 + kOrg.z * 0.4;
  float ks = sin(kph) * 0.7 + sin(kph * 2.3 + 1.7) * 0.3;
  transformed.x += ks * kitWind * kh * kh;
  transformed.z += cos(kph * 1.3) * 0.4 * kitWind * kh * kh;
}
#endif`)
      .replace('#include <project_vertex>', `#include <project_vertex>
{
  vec4 kp = vec4(transformed, 1.0);
  vec3 kn = objectNormal;
  #ifdef USE_INSTANCING
    kp = instanceMatrix * kp;
    kn = mat3(instanceMatrix) * kn;
  #endif
  kp = modelMatrix * kp;
  vKitWPos = kp.xyz;
  vKitWNrm = normalize(mat3(modelMatrix) * kn);
}`);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>
varying vec3 vKitWPos;
varying vec3 vKitWNrm;
uniform sampler2D kitNoise;
uniform vec3 kitMossColor; uniform float kitMoss;
uniform float kitWet; uniform float kitWetLine;
uniform vec3 kitRimColor; uniform float kitRim; uniform float kitRimPow;
uniform vec3 kitSinkColor; uniform float kitSinkTop; uniform float kitSinkDepth;
uniform float kitTime; uniform float kitWind;`)
      .replace('#include <color_fragment>', `#include <color_fragment>
float kMask = 0.0;
float kWet = 0.0;
vec3 kWN = normalize(vKitWNrm);
#ifdef KIT_MOSS
{
  float up = smoothstep(0.2, 0.8, kWN.y);
  vec4 n1 = texture2D(kitNoise, vKitWPos.xz * 0.19);
  vec4 n2 = texture2D(kitNoise, vKitWPos.xz * 0.73 + 0.31);
  float m = n1.r * 0.7 + n2.g * 0.3;
  // Moss also creeps a little way down vertical faces from their tops (drips follow the noise).
  vec4 n3 = texture2D(kitNoise, vec2(vKitWPos.x + vKitWPos.z, vKitWPos.y * 0.35) * 0.23);
  float drip = (1.0 - abs(kWN.y)) * smoothstep(0.55, 0.8, n3.b) * 0.8;
  float cover = max(up, drip);
  kMask = cover * smoothstep(0.66 - kitMoss * 0.42, 0.72 - kitMoss * 0.4, m);
  vec3 mc = kitMossColor * (0.65 + 0.7 * n2.g);
  diffuseColor.rgb = mix(diffuseColor.rgb, mc, kMask);
}
#endif
#ifdef KIT_WET
{
  vec4 nw = texture2D(kitNoise, vec2((vKitWPos.x + vKitWPos.z) * 0.21, vKitWPos.y * 0.06));
  float low = 1.0 - smoothstep(kitWetLine - 0.2, kitWetLine + 1.2, vKitWPos.y);
  float streak = (1.0 - abs(kWN.y)) * smoothstep(0.5, 0.68, nw.b);
  kWet = kitWet * clamp(low + streak * 0.7, 0.0, 1.0) * (1.0 - kMask);
  diffuseColor.rgb *= mix(1.0, 0.6, kWet);
}
#endif
#ifdef KIT_SINK
{
  float s = clamp((kitSinkTop - vKitWPos.y) / kitSinkDepth, 0.0, 1.0);
  diffuseColor.rgb = mix(diffuseColor.rgb, kitSinkColor, s * s * 0.85);
}
#endif`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
roughnessFactor = mix(roughnessFactor, 1.0, kMask);
roughnessFactor = mix(roughnessFactor, 0.16, kWet);`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
#ifdef KIT_VC_EMISSIVE
  #if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
    totalEmissiveRadiance *= vColor.rgb;
  #endif
#endif
#ifdef KIT_RIM
{
  vec3 kV = normalize(cameraPosition - vKitWPos);
  float kF = pow(1.0 - clamp(abs(dot(kWN, kV)), 0.0, 1.0), kitRimPow);
  totalEmissiveRadiance += kitRimColor * kF * kitRim;
}
#endif`);
  };
  mat.customProgramCacheKey = () => 'kitpatch:' + Object.keys(defines).sort().join(',');
}

// ---------------------------------------------------------------------------------------------
// Void (portal / impossible-matter) shader: deep colour, parallax starfield, fresnel rim, slow swirl
// ---------------------------------------------------------------------------------------------
function voidMaterial(p: Palette): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: KIT_TIME,
      uDeep: { value: lin(p.voidColor) },
      uA: { value: lin(p.iridescent[0]) },
      uB: { value: lin(p.iridescent[1]) },
      uRim: { value: lin(p.accent2) },
    },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV; varying vec3 vW;
      #include <common>
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        #ifdef USE_INSTANCING
          wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
        #endif
        vW = wp.xyz;
        vN = normalize(mat3(modelMatrix) * normal);
        vV = cameraPosition - wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime; uniform vec3 uDeep; uniform vec3 uA; uniform vec3 uB; uniform vec3 uRim;
      varying vec3 vN; varying vec3 vV; varying vec3 vW;
      float h3(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
      void main() {
        vec3 V = normalize(vV);
        vec3 N = normalize(vN);
        float F = pow(1.0 - clamp(abs(dot(N, V)), 0.0, 1.0), 2.5);
        vec3 d = -V;
        // Stars: hashed cells along the view ray (looks like depth inside the surface).
        vec3 col = uDeep;
        for (int i = 0; i < 2; i++) {
          float s = 40.0 + float(i) * 55.0;
          vec3 q = d * s + vec3(uTime * 0.05 * float(i + 1));
          vec3 c = floor(q);
          float r = h3(c);
          vec3 f = fract(q) - 0.5;
          float st = smoothstep(0.12, 0.0, length(f)) * step(0.9, r);
          col += vec3(1.0, 0.95, 0.9) * st * (0.6 + 0.4 * sin(uTime * 3.0 + r * 40.0));
        }
        float sw = sin(atan(d.z, d.x) * 3.0 + d.y * 6.0 + uTime * 0.4) * 0.5 + 0.5;
        col += mix(uA, uB, sw) * 0.18 * (1.0 - F);
        col += uRim * F * 2.2;
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
}

// ---------------------------------------------------------------------------------------------
// Light shaft (god-ray cone) and drifting motes: additive, single draw each, no textures.
// ---------------------------------------------------------------------------------------------
/** Additive volumetric-looking cone. Geometry: open cylinder whose uv.y runs 0 (bottom) to 1 (top). */
export function lightShaftMaterial(color: string, intensity = 0.5): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: { uTime: KIT_TIME, uColor: { value: lin(color) }, uIntensity: { value: intensity } },
    vertexShader: /* glsl */ `
      varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      void main() {
        vUv = uv;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vN = normalize(mat3(modelMatrix) * normal);
        vV = cameraPosition - wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime; uniform vec3 uColor; uniform float uIntensity;
      varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      void main() {
        float facing = abs(dot(normalize(vN), normalize(vV)));
        float soft = pow(clamp(facing, 0.0, 1.0), 1.6);
        float along = smoothstep(0.0, 0.55, vUv.y) * (0.55 + 0.45 * vUv.y);
        float a = vUv.x * 6.2831853;
        float streak = 0.65 + 0.35 * sin(a * 7.0 + uTime * 0.35) * sin(a * 3.0 - uTime * 0.22 + vUv.y * 2.0);
        float k = soft * along * streak * uIntensity;
        gl_FragColor = vec4(uColor * k, 1.0);
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false, fog: false,
  });
}

/**
 * Atmosphere / aura shell: additive fresnel glow for a slightly larger sphere around a planet (or a
 * crystal, an orb). Brightest at the silhouette, brighter on the sun-facing limb.
 */
export function atmosphereMaterial(color: string, intensity = 1.2, power = 2.5, sunDir?: THREE.Vector3): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: lin(color) }, uIntensity: { value: intensity }, uPower: { value: power },
      uSun: { value: (sunDir ?? new THREE.Vector3(0.5, 0.6, 0.4)).clone().normalize() },
    },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vN = normalize(mat3(modelMatrix) * normal);
        vV = cameraPosition - wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uIntensity; uniform float uPower; uniform vec3 uSun;
      varying vec3 vN; varying vec3 vV;
      void main() {
        vec3 N = normalize(vN), V = normalize(vV);
        float ndv = clamp(dot(N, V), 0.0, 1.0);
        // Rim that fades to nothing exactly at the silhouette (no hard outer edge).
        float rim = pow(1.0 - ndv, uPower) * smoothstep(0.0, 0.18, ndv);
        float lit = 0.35 + 0.65 * smoothstep(-0.3, 0.6, dot(N, uSun));
        gl_FragColor = vec4(uColor * rim * lit * uIntensity, 1.0);
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, fog: false,
  });
}

/** Points material for drifting motes: rises through `height`, wobbles, twinkles, fades at the ends. */
export function motesMaterial(color: string, size = 0.08, height = 6, speed = 0.25): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: KIT_TIME, uColor: { value: lin(color) }, uSize: { value: size }, uHeight: { value: height },
      uSpeed: { value: speed }, uPixelScale: { value: 540 },
    },
    vertexShader: /* glsl */ `
      attribute float seed;
      uniform float uTime; uniform float uSize; uniform float uHeight; uniform float uSpeed; uniform float uPixelScale;
      varying float vAlpha;
      void main() {
        vec3 p = position;
        float t = uTime * uSpeed * (0.5 + seed);
        p.y = mod(p.y + t, uHeight);
        p.x += sin(t * 2.1 + seed * 40.0) * 0.35;
        p.z += cos(t * 1.7 + seed * 23.0) * 0.35;
        float h = p.y / uHeight;
        vAlpha = smoothstep(0.0, 0.12, h) * (1.0 - smoothstep(0.75, 1.0, h)) * (0.55 + 0.45 * sin(uTime * (1.3 + seed * 2.0) + seed * 50.0));
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = uSize * uPixelScale * (0.6 + seed * 0.8) / max(0.5, -mv.z);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - 0.5) * 2.0;
        float a = smoothstep(1.0, 0.0, d);
        a = a * a * vAlpha;
        gl_FragColor = vec4(uColor * a * 2.2, 1.0);
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
  });
}

// ---------------------------------------------------------------------------------------------
// Library
// ---------------------------------------------------------------------------------------------
interface StdOpts {
  surface?: SurfaceName; roughness?: number; metalness?: number; normalScale?: number;
  emissive?: string; emissiveIntensity?: number; envMapIntensity?: number; flat?: boolean; side?: THREE.Side;
  uvMeters?: number;
}

export class MaterialLibrary {
  readonly palette: Palette;
  private readonly cache = new Map<string, THREE.Material>();
  private readonly owned: THREE.Material[] = [];

  constructor(palette: Palette) {
    this.palette = palette;
  }

  get(name: MaterialName): THREE.Material {
    let m = this.cache.get(name);
    if (!m) {
      m = this.make(name);
      m.name = `kit:${this.palette.id}:${name}`;
      this.cache.set(name, m);
    }
    return m;
  }

  /** Standard material by name, typed (throws for shader-only materials like water/void/glow). */
  std(name: MaterialName): THREE.MeshStandardMaterial {
    const m = this.get(name);
    if (!(m instanceof THREE.MeshStandardMaterial)) throw new Error(`material "${name}" is not a MeshStandardMaterial`);
    return m;
  }

  /** A solid emissive colour for a dynamic part (not vertex-coloured). Cached by colour+intensity. */
  glow(color: THREE.ColorRepresentation, intensity = 3): THREE.MeshBasicMaterial {
    const c = new THREE.Color(color);
    const key = `glow:${c.getHexString()}:${intensity}`;
    let m = this.cache.get(key) as THREE.MeshBasicMaterial | undefined;
    if (!m) {
      m = new THREE.MeshBasicMaterial({ color: c.clone().multiplyScalar(intensity), toneMapped: false });
      m.name = key;
      this.cache.set(key, m);
    }
    return m;
  }

  /** Additive rune decal (strip texture wraps along u). */
  runes(seed = 13, intensity = 2.5): THREE.MeshBasicMaterial {
    const key = `runes:${seed}:${intensity}`;
    let m = this.cache.get(key) as THREE.MeshBasicMaterial | undefined;
    if (!m) {
      m = new THREE.MeshBasicMaterial({
        map: runeStripTexture(seed), color: new THREE.Color(1, 1, 1).multiplyScalar(intensity), vertexColors: true,
        transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, fog: false,
        polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, side: THREE.DoubleSide,
      });
      m.name = key;
      this.cache.set(key, m);
    }
    return m;
  }

  /** Glowing letter plate text ("1E"), additive. */
  plate(text: string, color: string, intensity = 2.2): THREE.MeshBasicMaterial {
    const key = `plate:${text}:${color}:${intensity}`;
    let m = this.cache.get(key) as THREE.MeshBasicMaterial | undefined;
    if (!m) {
      m = new THREE.MeshBasicMaterial({
        map: letterPlateTexture(text, color), color: new THREE.Color(1, 1, 1).multiplyScalar(intensity),
        transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, fog: false,
        polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
      });
      m.name = key;
      this.cache.set(key, m);
    }
    return m;
  }

  banner(color: string, trim: string, emblem: string): THREE.MeshStandardMaterial {
    const key = `banner:${color}:${trim}:${emblem}`;
    let m = this.cache.get(key) as THREE.MeshStandardMaterial | undefined;
    if (!m) {
      m = new THREE.MeshStandardMaterial({
        map: bannerTexture(color, trim, emblem), roughness: 0.85, metalness: 0, side: THREE.DoubleSide, alphaTest: 0.5,
      });
      m.name = key;
      this.cache.set(key, m);
    }
    return m;
  }

  rings(color: string): THREE.MeshStandardMaterial {
    const key = `rings:${color}`;
    let m = this.cache.get(key) as THREE.MeshStandardMaterial | undefined;
    if (!m) {
      m = new THREE.MeshStandardMaterial({
        map: ringBandsTexture(), color: new THREE.Color(color), transparent: true, side: THREE.DoubleSide,
        roughness: 0.8, depthWrite: false, emissive: new THREE.Color(color), emissiveIntensity: 0.25,
      });
      m.name = key;
      this.cache.set(key, m);
    }
    return m;
  }

  /** Additive fresnel shell (planet atmospheres, auras). Cached by colour + intensity. */
  atmosphere(color: string, intensity = 1.2): THREE.ShaderMaterial {
    const key = `atmo:${color}:${intensity}`;
    let m = this.cache.get(key) as THREE.ShaderMaterial | undefined;
    if (!m) {
      m = atmosphereMaterial(color, intensity);
      m.name = key;
      this.cache.set(key, m);
    }
    return m;
  }

  /** Private clone the caller animates (e.g. a fork that flashes). Disposed with the library. */
  unique<T extends THREE.Material>(m: T): T {
    const c = m.clone() as T;
    if (m instanceof THREE.MeshStandardMaterial && m.userData.kitUniforms && c instanceof THREE.MeshStandardMaterial) {
      // Clones keep onBeforeCompile but share the uniform objects; that is fine for static patches.
      c.userData.kitUniforms = m.userData.kitUniforms;
    }
    this.owned.push(c);
    return c;
  }

  /** Every material currently alive in this library (for stats / debugging). */
  all(): THREE.Material[] {
    return [...this.cache.values(), ...this.owned];
  }

  dispose(): void {
    for (const m of this.cache.values()) m.dispose();
    for (const m of this.owned) m.dispose();
    this.cache.clear();
    this.owned.length = 0;
  }

  // -------------------------------------------------------------------------------------------
  private stdMat(o: StdOpts, patch?: KitPatch, physical = false): THREE.MeshStandardMaterial {
    const tex = o.surface ? surfaceTexture(o.surface) : null;
    const params: THREE.MeshPhysicalMaterialParameters = {
      color: 0xffffff, vertexColors: true,
      roughness: o.roughness ?? 0.85, metalness: o.metalness ?? 0,
      map: tex?.map ?? null, normalMap: tex?.normalMap ?? null, roughnessMap: tex?.roughnessMap ?? null,
      normalScale: new THREE.Vector2(o.normalScale ?? 1, o.normalScale ?? 1),
      emissive: new THREE.Color(o.emissive ?? '#000000'), emissiveIntensity: o.emissiveIntensity ?? 1,
      envMapIntensity: o.envMapIntensity ?? 1, flatShading: o.flat ?? false, side: o.side ?? THREE.FrontSide,
    };
    const m = physical ? new THREE.MeshPhysicalMaterial(params) : new THREE.MeshStandardMaterial(params);
    m.userData.uvMeters = o.uvMeters ?? (o.surface ? TEXTURE_METERS[o.surface] : 2);
    if (patch) applyPatch(m, patch);
    return m;
  }

  private make(name: MaterialName): THREE.Material {
    const p = this.palette;
    const moss = p.mossAmount > 0 ? { color: p.moss, amount: p.mossAmount } : undefined;
    const wet = p.wetness > 0.3 ? { amount: p.wetness * 0.8, line: 0.4 } : undefined;
    switch (name) {
      case 'stone': return this.stdMat({ surface: 'stone', roughness: 1, normalScale: 1.1 }, { moss, wet });
      case 'wet_stone': return this.stdMat({ surface: 'stone', roughness: 0.55, normalScale: 1.2 }, { moss, wet: { amount: 0.9, line: 1.6 } });
      case 'brick': return this.stdMat({ surface: 'brick', roughness: 1, normalScale: 1.2 }, { moss, wet });
      case 'tile': return this.stdMat({ surface: 'tiles', roughness: 1, normalScale: 0.9 }, { moss: moss && { color: moss.color, amount: moss.amount * 0.5 }, wet });
      case 'plaster': return this.stdMat({ surface: 'plaster', roughness: 1, normalScale: 0.4 });
      case 'rock': return this.stdMat({ surface: 'rock', roughness: 1, normalScale: 1.4, flat: false }, { moss });
      case 'moss': return this.stdMat({ surface: 'moss', roughness: 1, normalScale: 1.5 });
      case 'grass': return this.stdMat({ surface: 'moss', roughness: 1, normalScale: 0.8 }, { rim: { color: p.mossBright, strength: 0.25, power: 4 } });
      case 'foliage': return this.stdMat({ roughness: 0.75, side: THREE.DoubleSide }, { wind: 0.35, rim: { color: p.mossBright, strength: 0.3, power: 3 } });
      case 'leaf': return this.stdMat({ roughness: 0.55, side: THREE.DoubleSide }, { rim: { color: p.mossBright, strength: 0.35 } });
      case 'petal': return this.stdMat({ roughness: 0.5, emissive: p.petal, emissiveIntensity: 0.35, side: THREE.DoubleSide }, { vcEmissive: true, rim: { color: '#ffffff', strength: 0.4 } });
      case 'wood': return this.stdMat({ surface: 'planks', roughness: 1, normalScale: 1 }, { moss: moss && { color: moss.color, amount: moss.amount * 0.4 } });
      case 'brass': return this.stdMat({ surface: 'metal', roughness: 0.9, metalness: 1, normalScale: 0.35, envMapIntensity: 1.3 });
      case 'gold': return this.stdMat({ surface: 'metal', roughness: 0.55, metalness: 1, normalScale: 0.2, envMapIntensity: 1.6 });
      case 'iron': return this.stdMat({ surface: 'metal', roughness: 1.2, metalness: 0.75, normalScale: 0.6 });
      case 'paint': return this.stdMat({ surface: 'metal', roughness: 1.4, metalness: 0.1, normalScale: 0.3 });
      case 'cloth': return this.stdMat({ surface: 'cloth', roughness: 1, side: THREE.DoubleSide });
      case 'wax': return this.stdMat({ roughness: 0.45 }, { rim: { color: '#ffe9c4', strength: 0.35 } });
      case 'glass': {
        const m = new THREE.MeshPhysicalMaterial({
          color: 0xffffff, roughness: 0.04, metalness: 0, transparent: true, opacity: 0.22, envMapIntensity: 2,
          clearcoat: 1, depthWrite: false, side: THREE.DoubleSide,
        });
        return m;
      }
      case 'crystal': {
        const m = this.stdMat({ roughness: 0.18, metalness: 0.05, emissive: '#ffffff', emissiveIntensity: 0.55, envMapIntensity: 1.8 },
          { vcEmissive: true, rim: { color: shadeHexToWhite(p.crystal), strength: 1.4, power: 2.5 } }, true) as THREE.MeshPhysicalMaterial;
        m.clearcoat = 1;
        m.clearcoatRoughness = 0.1;
        return m;
      }
      case 'cloud': return this.stdMat({ roughness: 1, emissive: p.sky.cloudShade, emissiveIntensity: 0.28 }, { rim: { color: p.sky.sunGlow, strength: 0.7, power: 2.2 } });
      case 'iridescent': {
        const m = this.stdMat({ roughness: 0.22, metalness: 0.35, envMapIntensity: 1.6 }, { rim: { color: p.iridescent[1], strength: 0.45, power: 3 } }, true) as THREE.MeshPhysicalMaterial;
        m.iridescence = 1;
        m.iridescenceIOR = 1.7;
        m.iridescenceThicknessRange = [180, 820];
        m.clearcoat = 0.8;
        m.sheen = 0.6;
        m.sheenColor = new THREE.Color(p.iridescent[0]);
        return m;
      }
      case 'glow': return glowVc(3.2);
      case 'glow_soft': return glowVc(1.5);
      case 'glow_hot': return glowVc(7);
      case 'rune': return this.runes(13, 2.5);
      case 'water': return createWaterMaterial(p, { time: KIT_TIME });
      case 'void': return voidMaterial(p);
      case 'shadow': return new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35, depthWrite: false });
    }
  }
}

function glowVc(intensity: number): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 1, 1).multiplyScalar(intensity), vertexColors: true, toneMapped: false });
}

function shadeHexToWhite(hex: string): string {
  const c = new THREE.Color(hex);
  c.lerp(new THREE.Color(1, 1, 1), 0.35);
  return '#' + c.getHexString();
}

const shared = new WeakMap<Palette, MaterialLibrary>();
/** Library shared by everyone using the same palette object (dispose it with disposeSharedMaterials). */
export function sharedMaterials(palette: Palette): MaterialLibrary {
  let lib = shared.get(palette);
  if (!lib) {
    lib = new MaterialLibrary(palette);
    shared.set(palette, lib);
  }
  return lib;
}
export function disposeSharedMaterials(palette: Palette): void {
  shared.get(palette)?.dispose();
  shared.delete(palette);
}

/** Dispose every geometry (and optionally material) under an object. Textures are left to textures.ts. */
export function disposeObject(root: THREE.Object3D, materials = false): void {
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    if (materials && mesh.material) {
      const ms = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const m of ms) m.dispose();
    }
    if ((o as THREE.InstancedMesh).isInstancedMesh) (o as THREE.InstancedMesh).dispose();
  });
}
