/**
 * Stylized animated water (single draw): depth tint from the shoreline, fresnel sky reflection,
 * drifting caustic lines, shoreline foam ripples, sun glints and (in the Well) bioluminescent sparkles.
 * Supports scene fog. Circle pools (the well) and rectangles.
 */
import * as THREE from 'three';
import type { Palette } from './palettes.ts';

export interface WaterMaterialOptions {
  time?: { value: number };
  shape?: 'circle' | 'rect';
  /** circle: [radius, 0]; rect: [halfWidth, halfDepth] (metres, local XZ). */
  size?: [number, number];
  /** Distance from the edge (m) over which the water goes from shallow to deep. */
  depthFalloff?: number;
  opacity?: number;
  sparkle?: number;
  sunDir?: THREE.Vector3;
}

const col = (hex: string) => new THREE.Color(hex);

export function createWaterMaterial(p: Palette, o: WaterMaterialOptions = {}): THREE.ShaderMaterial {
  const uniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib.fog,
    {
      uDeep: { value: col(p.water.deep) },
      uShallow: { value: col(p.water.shallow) },
      uFoam: { value: col(p.water.foam) },
      uGlint: { value: col(p.water.glint) },
      uBio: { value: col(p.water.biolume) },
      uSkyA: { value: col(p.sky.horizon) },
      uSkyB: { value: col(p.sky.zenith) },
      uShape: { value: o.shape === 'rect' ? 1 : 0 },
      uSize: { value: new THREE.Vector2(...(o.size ?? [4, 4])) },
      uFalloff: { value: o.depthFalloff ?? 2.2 },
      uOpacity: { value: o.opacity ?? 0.92 },
      uSparkle: { value: o.sparkle ?? (p.id === 'well' || p.id === 'space' ? 1 : 0.35) },
      uSunDir: { value: (o.sunDir ?? new THREE.Vector3(0.3, 0.9, 0.2)).clone().normalize() },
    },
  ]);
  // Share the animation clock object rather than a copy (UniformsUtils.merge clones values).
  uniforms.uTime = o.time ?? { value: 0 };
  return new THREE.ShaderMaterial({
    uniforms,
    fog: true,
    transparent: true,
    depthWrite: true,
    vertexShader: /* glsl */ `
      #include <common>
      #include <fog_pars_vertex>
      uniform float uTime;
      varying vec3 vLocal; varying vec3 vWorld; varying vec3 vNrm;
      void main() {
        vec3 p = position;
        float t = uTime;
        // Two crossing swell trains; the analytic slope feeds the normal.
        float a = sin(p.x * 0.9 + t * 1.1) * 0.5 + sin(p.z * 1.3 - t * 0.8) * 0.5;
        float b = sin((p.x + p.z) * 2.1 + t * 1.7) * 0.25;
        p.y += (a + b) * 0.025;
        float dx = cos(p.x * 0.9 + t * 1.1) * 0.9 * 0.5 + cos((p.x + p.z) * 2.1 + t * 1.7) * 2.1 * 0.25;
        float dz = cos(p.z * 1.3 - t * 0.8) * 1.3 * 0.5 + cos((p.x + p.z) * 2.1 + t * 1.7) * 2.1 * 0.25;
        vNrm = normalize(mat3(modelMatrix) * normalize(vec3(-dx * 0.03, 1.0, -dz * 0.03)));
        vLocal = position;
        vec4 wp = modelMatrix * vec4(p, 1.0);
        vWorld = wp.xyz;
        vec4 mvPosition = viewMatrix * wp;
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: /* glsl */ `
      #include <common>
      #include <fog_pars_fragment>
      uniform float uTime; uniform vec3 uDeep; uniform vec3 uShallow; uniform vec3 uFoam; uniform vec3 uGlint;
      uniform vec3 uBio; uniform vec3 uSkyA; uniform vec3 uSkyB; uniform float uShape; uniform vec2 uSize;
      uniform float uFalloff; uniform float uOpacity; uniform float uSparkle; uniform vec3 uSunDir;
      varying vec3 vLocal; varying vec3 vWorld; varying vec3 vNrm;

      float h21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float vn(vec2 p) {
        vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y);
      }
      // Cheap caustic web (iterated domain warp); returns bright thin lines in [0, ~3.5].
      // Every division is guarded and the result clamped: an unbounded value here overflows the
      // half-float buffer and bloom smears the Inf/NaN over the whole screen.
      float caustic(vec2 p, float t) {
        vec2 i = p;
        float c = 1.0;
        for (int n = 0; n < 4; n++) {
          float tt = t * (1.0 - (3.5 / float(n + 1)));
          i = p + vec2(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x));
          vec2 q = p * 0.012 / max(abs(vec2(sin(i.x + tt), cos(i.y + tt))), vec2(1e-3));
          c += 1.0 / max(length(q), 1e-3);
        }
        c /= 4.0;
        c = clamp(1.17 - pow(c, 1.4), 0.0, 1.17);
        return c * c * c * c * c * c * c * c;
      }
      void main() {
        float edge;
        if (uShape < 0.5) edge = uSize.x - length(vLocal.xz);
        else edge = min(uSize.x - abs(vLocal.x), uSize.y - abs(vLocal.z));
        float n = vn(vWorld.xz * 1.7 + uTime * 0.15);
        float depth = smoothstep(0.0, uFalloff, edge + (n - 0.5) * 0.35);
        vec3 V = normalize(cameraPosition - vWorld);
        vec3 N = normalize(vNrm + vec3(n - 0.5, 0.0, vn(vWorld.zx * 1.9 - uTime * 0.12) - 0.5) * 0.12);
        float F = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 4.0);
        vec3 c = mix(uShallow, uDeep, depth);
        // Caustic light on the shallows / surface web on the deep part.
        float cs = caustic(vWorld.xz * 0.9 + 17.0, uTime * 0.45);
        c += uShallow * cs * mix(0.9, 0.35, depth);
        // Sky reflection.
        vec3 sky = mix(uSkyA, uSkyB, clamp(reflect(-V, N).y, 0.0, 1.0));
        c = mix(c, sky, F * 0.55);
        // Shoreline foam: a solid lip plus ripple rings travelling outward from the shore.
        float lip = 1.0 - smoothstep(0.04, 0.2 + n * 0.12, edge);
        float rip = smoothstep(0.82, 0.95, sin(edge * 9.0 - uTime * 2.2 + n * 3.0)) * (1.0 - smoothstep(0.1, 1.1, edge));
        c = mix(c, uFoam, clamp(lip + rip * 0.6, 0.0, 1.0));
        // Sun glints: sparse, sharp, bloom-bright.
        vec3 R = reflect(-V, N);
        float g = pow(max(dot(R, normalize(uSunDir)), 0.0), 350.0);
        float gl = step(0.72, vn(vWorld.xz * 6.0 + uTime * 0.8)) * g;
        c += uGlint * (g * 1.6 + gl * 5.0);
        // Bioluminescent motes drifting under the surface.
        vec2 cell = floor(vWorld.xz * 3.0);
        float r = h21(cell);
        vec2 fp = fract(vWorld.xz * 3.0) - 0.5 - (vec2(h21(cell + 7.1), h21(cell + 3.3)) - 0.5) * 0.6;
        float tw = 0.5 + 0.5 * sin(uTime * (1.5 + r * 2.0) + r * 30.0);
        float spark = smoothstep(0.09, 0.0, length(fp)) * step(0.86, r) * tw * uSparkle * depth;
        c += uBio * spark * 3.5;
        float alpha = mix(0.78, uOpacity, depth);
        alpha = max(alpha, lip);
        gl_FragColor = vec4(c, alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        #include <fog_fragment>
      }`,
  });
}

export interface WaterHandle {
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
  update(time: number): void;
  dispose(): void;
}

export interface WaterOptions extends WaterMaterialOptions {
  palette: Palette;
  shape?: 'circle' | 'rect';
  radius?: number;
  width?: number;
  depth?: number;
  segments?: number;
  /** Reuse an existing material (e.g. MaterialLibrary.get('water')). */
  material?: THREE.ShaderMaterial;
}

/** A water surface mesh at local y = 0 (position it at the pool's surface height). */
export function createWater(o: WaterOptions): WaterHandle {
  const shape = o.shape ?? 'circle';
  let geo: THREE.BufferGeometry;
  let size: [number, number];
  if (shape === 'circle') {
    const r = o.radius ?? 4;
    geo = new THREE.CircleGeometry(r, o.segments ?? 96, 0, Math.PI * 2);
    size = [r, 0];
  } else {
    const w = o.width ?? 8, d = o.depth ?? 8;
    const seg = o.segments ?? 48;
    geo = new THREE.PlaneGeometry(w, d, seg, Math.max(1, Math.round((seg * d) / w)));
    size = [w / 2, d / 2];
  }
  geo.rotateX(-Math.PI / 2);
  const ownMaterial = !o.material;
  const material = o.material ?? createWaterMaterial(o.palette, { ...o, shape, size });
  material.uniforms.uShape.value = shape === 'rect' ? 1 : 0;
  (material.uniforms.uSize.value as THREE.Vector2).set(size[0], size[1]);
  const mesh = new THREE.Mesh(geo, material);
  mesh.name = 'kit:water';
  mesh.receiveShadow = false;
  mesh.renderOrder = 1;
  return {
    mesh,
    material,
    update(time: number) {
      if (!o.time) material.uniforms.uTime.value = time;
    },
    dispose() {
      geo.dispose();
      if (ownMaterial) material.dispose();
      mesh.removeFromParent();
    },
  };
}
