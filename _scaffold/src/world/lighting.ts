/**
 * Lighting presets per biome: hemisphere fill + ONE shadow-casting directional key (2048 map, tuned
 * bias/normalBias/radius) + an unshadowed rim + exponential fog + a small procedural environment map
 * (PMREM) so metals, glass and crystals have something to reflect. Lantern point lights are unshadowed
 * and flicker cosmetically.
 *
 *   const lit = applyLighting(scene, LIGHTING.well, { renderer, focus: { center, radius: 16 } });
 *   lit.addLantern(pos);  ...  lit.update(t);  ...  lit.dispose();
 */
import * as THREE from 'three';
import { PALETTES, type BiomeId, type Palette } from './palettes.ts';

export type ToneMappingHint = 'agx' | 'aces' | 'neutral';

export interface LightingPreset {
  id: string;
  hemi: { sky: string; ground: string; intensity: number };
  key: {
    color: string; intensity: number; direction: [number, number, number];
    castShadow: boolean; mapSize: number; bias: number; normalBias: number; radius: number;
  };
  rim: { color: string; intensity: number; direction: [number, number, number] };
  fog: { color: string; density: number } | null;
  /** Suggested renderer/post settings for this look (consumed by core/post.ts or demos). */
  exposure: number;
  toneMapping: ToneMappingHint;
  bloom: { intensity: number; threshold: number; smoothing: number; radius: number };
  vignette: number;
  saturation: number;
  envIntensity: number;
  lantern: { color: string; intensity: number; distance: number };
}

function preset(p: Palette, o: Omit<LightingPreset, 'id'>): LightingPreset {
  return { id: p.id, ...o };
}

export const LIGHTING: Readonly<Record<BiomeId, LightingPreset>> = {
  well: preset(PALETTES.well, {
    hemi: { sky: '#79bfd0', ground: '#2c2419', intensity: 1.1 },
    key: { color: '#fff0d2', intensity: 2.6, direction: [0.32, 1, 0.18], castShadow: true, mapSize: 2048, bias: -0.0004, normalBias: 0.035, radius: 3 },
    rim: { color: '#5dffd8', intensity: 0.9, direction: [-0.6, 0.35, -0.7] },
    fog: { color: '#0f2527', density: 0.024 },
    exposure: 1.05, toneMapping: 'agx',
    bloom: { intensity: 1.15, threshold: 0.62, smoothing: 0.25, radius: 0.72 },
    vignette: 0.55, saturation: 0.18, envIntensity: 0.55,
    lantern: { color: PALETTES.well.lantern, intensity: 16, distance: 10 },
  }),
  sky: preset(PALETTES.sky, {
    hemi: { sky: '#bfe2ff', ground: '#f0d8b0', intensity: 1.35 },
    key: { color: '#ffe6bd', intensity: 3.3, direction: [-0.55, 0.62, -0.75], castShadow: true, mapSize: 2048, bias: -0.0003, normalBias: 0.03, radius: 2.5 },
    rim: { color: '#ffb8e0', intensity: 0.8, direction: [0.7, 0.3, 0.6] },
    fog: { color: '#cfe6ff', density: 0.0075 },
    exposure: 1.0, toneMapping: 'agx',
    bloom: { intensity: 0.8, threshold: 0.8, smoothing: 0.2, radius: 0.7 },
    vignette: 0.35, saturation: 0.2, envIntensity: 1.0,
    lantern: { color: PALETTES.sky.lantern, intensity: 10, distance: 8 },
  }),
  space: preset(PALETTES.space, {
    hemi: { sky: '#6a58c0', ground: '#140a26', intensity: 1.0 },
    key: { color: '#e2ecff', intensity: 2.8, direction: [0.8, 0.5, 0.45], castShadow: true, mapSize: 2048, bias: -0.0004, normalBias: 0.035, radius: 3 },
    rim: { color: '#ff4fd8', intensity: 1.6, direction: [-0.8, 0.25, -0.5] },
    fog: { color: '#120b2c', density: 0.011 },
    exposure: 1.05, toneMapping: 'agx',
    bloom: { intensity: 1.3, threshold: 0.6, smoothing: 0.25, radius: 0.75 },
    vignette: 0.5, saturation: 0.22, envIntensity: 0.8,
    lantern: { color: PALETTES.space.lantern, intensity: 14, distance: 9 },
  }),
  beyond: preset(PALETTES.beyond, {
    hemi: { sky: '#ffc8f0', ground: '#3b1c6e', intensity: 1.25 },
    key: { color: '#fff0da', intensity: 2.8, direction: [0.1, 0.55, -1], castShadow: true, mapSize: 2048, bias: -0.0004, normalBias: 0.035, radius: 3 },
    rim: { color: '#7afcff', intensity: 1.5, direction: [0.3, 0.2, 1] },
    fog: { color: '#3a1560', density: 0.009 },
    exposure: 1.05, toneMapping: 'agx',
    bloom: { intensity: 1.25, threshold: 0.62, smoothing: 0.25, radius: 0.8 },
    vignette: 0.5, saturation: 0.25, envIntensity: 1.1,
    lantern: { color: PALETTES.beyond.lantern, intensity: 12, distance: 9 },
  }),
};

export interface LanternOptions { color?: string; intensity?: number; distance?: number; flicker?: number }

export interface LightingHandle {
  readonly preset: LightingPreset;
  readonly hemi: THREE.HemisphereLight;
  readonly key: THREE.DirectionalLight;
  readonly rim: THREE.DirectionalLight;
  readonly fog: THREE.FogExp2 | null;
  readonly environment: THREE.Texture | null;
  readonly lanterns: readonly THREE.PointLight[];
  /** Fit the key light's shadow frustum to a sphere (room centre + radius) and aim it there. */
  setFocus(center: THREE.Vector3, radius: number): void;
  addLantern(position: THREE.Vector3, o?: LanternOptions): THREE.PointLight;
  removeLantern(light: THREE.PointLight): void;
  /** Cosmetic lantern flicker; call every frame with seconds. */
  update(time: number): void;
  dispose(): void;
}

export interface ApplyLightingOptions {
  /** Needed to build the environment map (PMREM). Without it there are no env reflections. */
  renderer?: THREE.WebGLRenderer;
  focus?: { center: THREE.Vector3; radius: number };
  /** Set scene.background to the fog colour (when no sky dome is used). */
  background?: boolean;
  environment?: boolean;
}

/**
 * Tiny procedural environment: gradient dome (hemi colours) + a bright key blob + rim blob, prefiltered
 * with PMREM. Costs one cube render at load.
 */
export function createEnvironment(renderer: THREE.WebGLRenderer, p: LightingPreset): THREE.Texture {
  const scene = new THREE.Scene();
  const geo = new THREE.SphereGeometry(10, 32, 16);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const sky = new THREE.Color(p.hemi.sky), ground = new THREE.Color(p.hemi.ground), c = new THREE.Color();
  const horizon = sky.clone().lerp(ground, 0.35).lerp(new THREE.Color(p.key.color), 0.2);
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i) / 10;
    if (y >= 0) c.copy(horizon).lerp(sky, Math.pow(y, 0.6));
    else c.copy(horizon).lerp(ground, Math.pow(-y, 0.5));
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const dome = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide }));
  scene.add(dome);
  const blob = (dir: [number, number, number], color: string, intensity: number, size: number) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(size, 16, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity) }));
    m.position.set(...dir).normalize().multiplyScalar(8);
    scene.add(m);
  };
  blob(p.key.direction, p.key.color, 6, 1.4);
  blob(p.rim.direction, p.rim.color, 3, 1.2);
  // A couple of soft panels so glossy things get a readable highlight shape, not just a dot.
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(8, 3), new THREE.MeshBasicMaterial({ color: new THREE.Color(p.hemi.sky).multiplyScalar(1.6), side: THREE.DoubleSide }));
  panel.position.set(0, 7, 0);
  panel.rotation.x = Math.PI / 2;
  scene.add(panel);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const rt = pmrem.fromScene(scene, 0.03);
  pmrem.dispose();
  scene.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh) {
      m.geometry.dispose();
      (m.material as THREE.Material).dispose();
    }
  });
  return rt.texture;
}

export function applyLighting(scene: THREE.Scene, p: LightingPreset, o: ApplyLightingOptions = {}): LightingHandle {
  const group = new THREE.Group();
  group.name = `kit:lighting:${p.id}`;
  scene.add(group);

  const hemi = new THREE.HemisphereLight(p.hemi.sky, p.hemi.ground, p.hemi.intensity);
  group.add(hemi);

  const key = new THREE.DirectionalLight(p.key.color, p.key.intensity);
  key.name = 'kit:key';
  key.castShadow = p.key.castShadow;
  key.shadow.mapSize.set(p.key.mapSize, p.key.mapSize);
  key.shadow.bias = p.key.bias;
  key.shadow.normalBias = p.key.normalBias;
  key.shadow.radius = p.key.radius;
  group.add(key, key.target);

  const rim = new THREE.DirectionalLight(p.rim.color, p.rim.intensity);
  rim.name = 'kit:rim';
  group.add(rim, rim.target);

  const prevFog = scene.fog;
  const prevBg = scene.background;
  const prevEnv = scene.environment;
  const prevEnvIntensity = scene.environmentIntensity;
  const fog = p.fog ? new THREE.FogExp2(p.fog.color, p.fog.density) : null;
  scene.fog = fog;
  if (o.background && p.fog) scene.background = new THREE.Color(p.fog.color);

  let environment: THREE.Texture | null = null;
  if (o.renderer && o.environment !== false) {
    environment = createEnvironment(o.renderer, p);
    scene.environment = environment;
    scene.environmentIntensity = p.envIntensity;
  }

  const keyDir = new THREE.Vector3(...p.key.direction).normalize();
  const rimDir = new THREE.Vector3(...p.rim.direction).normalize();
  const setFocus = (center: THREE.Vector3, radius: number) => {
    const dist = radius * 2.5 + 10;
    key.position.copy(center).addScaledVector(keyDir, dist);
    key.target.position.copy(center);
    rim.position.copy(center).addScaledVector(rimDir, dist);
    rim.target.position.copy(center);
    const cam = key.shadow.camera;
    cam.left = -radius;
    cam.right = radius;
    cam.top = radius;
    cam.bottom = -radius;
    cam.near = 0.5;
    cam.far = dist + radius * 2;
    cam.updateProjectionMatrix();
    key.updateMatrixWorld();
    key.target.updateMatrixWorld();
  };
  setFocus(o.focus?.center ?? new THREE.Vector3(), o.focus?.radius ?? 16);

  const lanterns: THREE.PointLight[] = [];
  const base = new Map<THREE.PointLight, { i: number; f: number; phase: number }>();

  return {
    preset: p, hemi, key, rim, fog, environment, lanterns,
    setFocus,
    addLantern(position, lo = {}) {
      const l = new THREE.PointLight(lo.color ?? p.lantern.color, lo.intensity ?? p.lantern.intensity, lo.distance ?? p.lantern.distance, 2);
      l.castShadow = false;
      l.position.copy(position);
      group.add(l);
      lanterns.push(l);
      base.set(l, { i: l.intensity, f: lo.flicker ?? 0.12, phase: lanterns.length * 1.37 });
      return l;
    },
    removeLantern(l) {
      const i = lanterns.indexOf(l);
      if (i >= 0) lanterns.splice(i, 1);
      base.delete(l);
      l.removeFromParent();
      l.dispose();
    },
    update(time) {
      for (const l of lanterns) {
        const b = base.get(l);
        if (!b) continue;
        l.intensity = b.i * (1 + b.f * flicker(time, b.phase));
      }
    },
    dispose() {
      for (const l of lanterns) l.dispose();
      lanterns.length = 0;
      key.shadow.map?.dispose();
      key.dispose();
      rim.dispose();
      hemi.dispose();
      group.removeFromParent();
      if (scene.fog === fog) scene.fog = prevFog;
      if (o.background) scene.background = prevBg;
      if (environment) {
        if (scene.environment === environment) {
          scene.environment = prevEnv;
          scene.environmentIntensity = prevEnvIntensity;
        }
        environment.dispose();
      }
    },
  };
}

/** Smooth pseudo-random flicker in [-1, 1] (sum of incommensurate sines; no allocation). */
export function flicker(t: number, phase: number): number {
  return (Math.sin(t * 7.3 + phase) * 0.5 + Math.sin(t * 13.1 + phase * 2.3) * 0.3 + Math.sin(t * 23.7 + phase * 0.7) * 0.2);
}

export function lightingFor(biome: BiomeId): LightingPreset {
  return LIGHTING[biome];
}
