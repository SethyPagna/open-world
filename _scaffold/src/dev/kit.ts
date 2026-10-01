/**
 * ?demo=kit&biome=well|sky|space|beyond : render-kit dioramas, one per biome.
 *   well   - the bottom of the shaft: glowing pool, frog statue gazing up at the oculus, three lettered doors
 *   sky    - floating islands over a sea of cloud, star gate "2B", bell arch, floating steps
 *   space  - hex platform in orbit: the four tuning forks (C, E, G, crooked B-flat), painted valve pipes, ringed planetoid
 *   beyond - the whole climb as concentric layers: a well at the centre, a cloud ring, an orbit of planets, a halo of crystals
 * Extra params: &angle=<radians> fixes the orbit angle, &still=1 stops the orbit, &colliders=1 draws physics.
 * Test mode (&test=1) freezes the camera on the hero angle, uses pixel ratio 1, precompiles every shader and
 * renders only a few frames (then idles) so the software-GL harness can screenshot without timing out.
 * `__TF.debug.render(n)` renders more frames; `__TF.debug.hdr()` scans the HDR buffer for Inf/NaN.
 */
import * as THREE from 'three';
import {
  BloomEffect, EffectComposer, EffectPass, HueSaturationEffect, RenderPass, ToneMappingEffect, ToneMappingMode, VignetteEffect,
} from 'postprocessing';
import { Kit } from '../world/kit.ts';
import { BIOMES, LETTER_ACCENTS, paletteFor, type BiomeId, type Palette } from '../world/palettes.ts';
import { createSky, SKY_FOR_BIOME, type SkyOptions } from '../world/sky.ts';
import { applyLighting, LIGHTING, type LightingPreset } from '../world/lighting.ts';
import { KIT_TIME } from '../world/materials.ts';
import { textureCacheSize } from '../world/textures.ts';
import { Physics } from '../world/physics.ts';
import { mergeTestHooks } from '../core/debug.ts';
import { loadFonts } from '../ui/fonts.ts';

interface View {
  target: THREE.Vector3;
  /** Orbit radius / height above target / fov. */
  radius: number;
  height: number;
  fov: number;
  /** Hero angle (radians; 0 = camera on +Z). */
  angle: number;
  /** Orbit sweep: full circle (0) or a +-sway amplitude in radians. */
  sway: number;
  focus: { center: THREE.Vector3; radius: number };
  sky?: SkyOptions;
  update?: (t: number) => void;
}

type Builder = (kit: Kit, p: Palette, lp: LightingPreset) => View;

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const TAU = Math.PI * 2;
/** Point on a circle in the kit's angle convention: (cos a, sin a) in XZ. */
const onRing = (r: number, a: number, y = 0): [number, number, number] => [Math.cos(a) * r, y, Math.sin(a) * r];
/** rotY that makes a piece at ring angle `a` face the centre. */
const faceIn = (a: number) => Math.atan2(-Math.cos(a), -Math.sin(a));

// ---------------------------------------------------------------------------------------------
// WELL: bottom of the shaft. Pool + frog + three doors + spiral stair + sunbeam through the oculus.
// ---------------------------------------------------------------------------------------------
const buildWell: Builder = (kit, p, lp) => {
  const R = 11, H = 18;
  const back = -Math.PI / 2;
  kit.roundWell({ radius: R, height: H, ringEvery: 3.3 });
  kit.floor({ radius: R - 0.05, innerRadius: 4.6, style: 'flag', tile: 1.25 });
  // Pool basin + curb (a small inner well), water, lily pads.
  kit.roundWell({ at: [0, -1.45, 0], radius: 4.6, height: 1.6, ringEvery: 99, segments: 48 });
  kit.water({ at: [0, -0.2, 0], radius: 4.02, sparkle: 1 });
  const pads: [number, number, number, boolean][] = [[2.6, -0.9, 0.62, true], [-2.4, 1.3, 0.55, false], [-1.2, -2.8, 0.7, true], [1.4, 2.5, 0.48, false], [3.1, 1.2, 0.4, false], [-3.0, -1.0, 0.45, false]];
  for (const [x, z, r, f] of pads) kit.lilyPad({ at: [x, -0.17, z], radius: r, flower: f });
  // Island with the frog, looking up at the sky it cannot reach (yet).
  kit.rocks({ at: [0, -0.75, 0], radius: 0.9, count: 6, size: 0.85, color: p.rockDark });
  kit.statue({ kind: 'frog', at: [0, -0.1, 0], rotY: 0.25, scale: 0.8, glow: p.glow });
  // Doors: 1A left, 1E centre, 1B right.
  const doors: [number, string, 'A' | 'B' | 'E'][] = [[back - 0.62, '1A', 'A'], [back, '1E', 'E'], [back + 0.62, '1B', 'B']];
  for (const [a, label, letter] of doors) {
    kit.door({ at: onRing(R - 0.25, a), rotY: faceIn(a), label, letter, open: letter === 'E' ? 0.0 : 0, sconceLights: letter === 'E' });
    kit.banner({ at: onRing(R - 0.35, a + 0.24, 5.2), rotY: faceIn(a + 0.24), letter, color: LETTER_ACCENTS[letter].deep, width: 0.9, height: 2.3 });
    kit.pressurePlate({ at: onRing(R - 3.2, a, 0.0), letter });
  }
  // Spiral stair up the right-hand wall to a lantern-lit landing.
  const s0 = back + 1.05, sweep = 1.25, steps = 24, rise = 0.3;
  kit.spiralStairs({ radius: R - 0.05, width: 1.8, steps, rise, startAngle: s0, sweep });
  const landA = s0 + sweep;
  kit.lantern({ at: onRing(R - 1.2, landA + 0.05, steps * rise), color: p.lantern, intensity: 10, distance: 9 });
  // Hanging lanterns from the first stone ring.
  kit.lantern({ at: onRing(R - 1.6, back - 1.25, 3.2), hanging: true, chain: 3.2, color: p.lantern, intensity: 12, distance: 10 });
  kit.lantern({ at: onRing(R - 1.6, back + 1.9, 2.4), hanging: true, chain: 3.6, light: false });
  // Pipes along the left wall with two painted valves (colour = the valve's pitch).
  const pipePts: [number, number, number][] = [];
  for (let i = 0; i <= 4; i++) pipePts.push(onRing(R - 0.45, back - 1.0 - i * 0.26, 2.6));
  pipePts.push(onRing(R - 0.45, back - 2.04, 0.2));
  kit.pipes({ points: pipePts, radius: 0.12, color: '#FF6B6B', valves: [1, 3] });
  // Clutter by the left door, crystals in the gloom, a crate stack on the right.
  kit.crate({ at: onRing(R - 1.6, back - 1.02), rotY: 0.4 });
  kit.crate({ at: onRing(R - 1.55, back - 1.02, 0.9), rotY: 0.9, size: 0.6 });
  kit.barrel({ at: onRing(R - 2.6, back - 1.1), color: p.woodDark });
  kit.barrel({ at: onRing(R - 1.4, back - 1.28) });
  kit.crystalCluster({ at: onRing(R - 0.9, back - 1.55), count: 6, height: 1.5, light: true });
  kit.crystalCluster({ at: onRing(R - 0.8, back + 0.98), count: 4, height: 1.0 });
  kit.crystalCluster({ at: onRing(R - 1.0, back + 2.35), count: 5, height: 1.3 });
  kit.lever({ at: onRing(R - 1.1, back + 0.33), rotY: faceIn(back + 0.33) });
  kit.rocks({ at: onRing(R - 1.2, back - 2.3), radius: 1.2, count: 7, size: 0.4 });
  // Sunbeam from the oculus onto the frog, dust motes inside it.
  const sun = new THREE.Vector3(...lp.key.direction).normalize();
  const top = sun.clone().multiplyScalar(H / sun.y);
  kit.lightShaft({ at: top, to: [0, -0.2, 0], radiusTop: 2.2, radiusBottom: 3.2, color: p.sky.sunGlow, intensity: 0.32 });
  kit.motes({ at: [0, 0, 0], radius: 4, height: 10, count: 140, color: '#fff1c8', size: 0.06 });
  kit.motes({ at: [0, 0, 0], radius: 10, height: 3, count: 60, color: p.water.biolume, size: 0.07, speed: 0.12 });
  return {
    target: V(0, 1.4, -2.2), radius: 8.6, height: 7.6, fov: 50, angle: 0.0, sway: 0.5,
    focus: { center: V(0, 2, 0), radius: 13 },
    sky: { shaftRadius: R, oculusHeight: 44, sunDirection: sun },
  };
};

// ---------------------------------------------------------------------------------------------
// SKY: islands over the cloud sea.
// ---------------------------------------------------------------------------------------------
const buildSky: Builder = (kit, p) => {
  kit.floatingPlatform({ radius: 7, top: 'grass', depth: 6.5, crystals: 3, seed: 11 });
  kit.floor({ at: [0, 0.07, 0], radius: 4.3, style: 'tiles', tile: 1.0, thickness: 0.12 });
  // Star gate to 2B at the back of the plaza.
  kit.door({ at: [0, 0.07, -4.9], style: 'gate', label: '2B', letter: 'B' });
  for (const s of [-1, 1]) kit.banner({ at: [s * 2.25, 3.9, -4.35], letter: 'B', color: LETTER_ACCENTS.B.deep, trim: p.brass, width: 0.8, height: 2.1 });
  // Pillars on the grass ring (one broken), stone railing on the flanks.
  const pil: [number, 'round' | 'broken'][] = [[-2.3, 'round'], [-0.95, 'round'], [0.95, 'broken'], [2.3, 'round']];
  for (const [a, style] of pil) kit.pillar({ at: onRing(5.6, a + Math.PI / 2 + Math.PI, 0.05), height: 4.6, style });
  kit.railing({ from: [-6.4, -2.6], to: [-5.3, 1.9], at: [0, 0.05, 0] });
  kit.railing({ from: [5.3, 1.9], to: [6.4, -2.6], at: [0, 0.05, 0] });
  kit.lantern({ at: [-2.6, 0.07, -2.2], light: true, intensity: 6, distance: 7 });
  kit.lantern({ at: [2.7, 0.07, -1.8], light: false });
  kit.crate({ at: [3.4, 0.07, 1.6], rotY: 0.3 });
  kit.barrel({ at: [4.3, 0.07, 0.9] });
  kit.pressurePlate({ at: [0, 0.07, -1.2], letter: 'B' });
  kit.cloudPuff({ at: [-4.8, 0.2, 3.8], scale: 0.9, seed: 4 });
  // Floating steps up to a hex island with a bell arch.
  kit.stairs({ at: [-5.8, 0.05, -1.4], rotY: -2.35, width: 1.4, steps: 9, rise: 0.32, run: 0.55, solid: false });
  const hex = kit.floatingPlatform({ at: [-10.2, 2.9, -5.6], radius: 2.8, shape: 'hex', top: 'grass', depth: 3.8, seed: 5 });
  kit.floor({ parent: hex, at: [0, 0.07, 0], radius: 2.2, style: 'flag', tile: 0.9, thickness: 0.1 });
  kit.arch({ parent: hex, at: [0, 0.05, -0.3], width: 2.0, height: 3.2, depth: 0.7 });
  kit.bell({ parent: hex, at: [0, 3.02, -0.3], size: 0.95, yoke: false });
  // Distant islands for depth.
  const far = kit.floatingPlatform({ at: [9.5, -1.6, -7], radius: 3.2, top: 'grass', depth: 4.5, crystals: 2, seed: 8 });
  kit.crystalCluster({ parent: far, at: [0.6, 0.05, -0.4], count: 6, height: 1.6, color: p.crystal });
  kit.pillar({ parent: far, at: [-1.2, 0.05, 0.6], height: 3.2, style: 'broken' });
  const tiny = kit.floatingPlatform({ at: [4.5, 6.5, -16], radius: 1.8, top: 'grass', depth: 2.6, seed: 21 });
  kit.lantern({ parent: tiny, at: [0, 0.07, 0], light: false, size: 0.5 });
  kit.floatingPlatform({ at: [-15, 1.2, -14], radius: 2.2, shape: 'hex', top: 'grass', depth: 3, seed: 33 });
  // Cloud sea and drifting puffs.
  const clouds: [number, number, number, number][] = [
    [0, -6.5, 0, 5.5], [-9, -5, 3, 4.2], [8, -6, 4, 4.8], [-4, -7, -10, 5], [11, -4.5, -12, 4],
    [-16, -3.5, -6, 3.6], [15, -3, 2, 3], [-8, 5.5, -20, 2.4], [12, 9, -24, 3], [-2, -8, 10, 4.5],
  ];
  clouds.forEach(([x, y, z, s], i) => kit.cloudPuff({ at: [x, y, z], scale: s, seed: 100 + i }));
  kit.motes({ at: [0, 0, 0], radius: 12, height: 8, count: 90, color: '#fff6d8', size: 0.07, speed: 0.1 });
  return {
    target: V(-1.2, 1.4, -2.5), radius: 15.5, height: 7.4, fov: 46, angle: 0.28, sway: 0,
    focus: { center: V(-2, 0, -3), radius: 15 },
    sky: { cloudCover: 0.55 },
  };
};

// ---------------------------------------------------------------------------------------------
// SPACE: the Belfry in orbit. Forks C E G B-flat (crooked), painted pipes, planetoids.
// ---------------------------------------------------------------------------------------------
const buildSpace: Builder = (kit, p) => {
  kit.floatingPlatform({ radius: 7, shape: 'hex', top: 'none', depth: 7, crystals: 5, seed: 3 });
  kit.floor({ at: [0, 0.0, 0], radius: 6.5, style: 'tiles', tile: 1.15, thickness: 0.14 });
  kit.haloRing({ at: [0, 0.03, 0], radius: 3.1, thickness: 0.04, color: p.accent2 });
  // Forks on an arc at the back: C, E, G, B-flat (crooked, 40% desaturated).
  const forks: [string, boolean][] = [['#FF6B6B', false], ['#FFD166', false], ['#6BE38F', false], ['#B388FF', true]];
  forks.forEach(([color, crooked], i) => {
    const a = -Math.PI / 2 + (i - 1.5) * 0.52;
    kit.tuningFork({ at: onRing(4.6, a), rotY: faceIn(a), color, crooked, desaturate: crooked ? 0.4 : 0 });
  });
  // Gate to 3C beyond the forks.
  kit.door({ at: [0, 0, -6.2], style: 'gate', label: '3C', letter: 'C', sconceLights: false });
  // Painted pipe runs with valves along the front edge.
  kit.pipes({ points: [[-6.1, 0.35, -1.5], [-5.2, 0.35, 1.6], [-3.4, 0.35, 3.8], [-3.4, 1.6, 3.8]], radius: 0.13, color: '#FF6B6B', valves: [1] });
  kit.pipes({ points: [[6.1, 0.35, -1.5], [5.2, 0.35, 1.6], [3.4, 0.35, 3.8], [3.4, 1.6, 3.8]], radius: 0.13, color: '#6BE38F', valves: [1] });
  kit.bell({ at: [-3.4, 1.9, 3.8], size: 0.55, yoke: true });
  kit.bell({ at: [3.4, 1.9, 3.8], size: 0.55, yoke: true, color: '#b99a6a' });
  kit.lantern({ at: [-1.6, 0, 1.6], color: '#9ad8ff', intensity: 7, distance: 8 });
  kit.lantern({ at: [1.8, 0, 1.2], color: '#9ad8ff', light: false });
  kit.crystalCluster({ at: [-5.3, 0, -2.6], count: 6, height: 1.6, light: true });
  kit.crystalCluster({ at: [5.4, 0, -2.2], count: 5, height: 1.3, color: p.crystalAlt, color2: p.crystal });
  kit.statue({ kind: 'hooded', at: [0, 0, -1.4], scale: 0.75, glow: p.accent2 });
  // Stepping stones and a ramp off to a small square pad.
  kit.floatingPlatform({ at: [9.2, 0.6, 1.8], radius: 1.1, shape: 'square', top: 'stone', depth: 1.5, seed: 41, roots: false });
  kit.floatingPlatform({ at: [11.6, 1.3, -0.6], radius: 1.1, shape: 'square', top: 'stone', depth: 1.5, seed: 42, roots: false });
  kit.ramp({ at: [-7.4, 0, 0.2], rotY: -Math.PI / 2, width: 1.6, length: 3.2, rise: 1.1 });
  // Planetoids and orbit lines.
  kit.planetoid({ at: [-13, 4.5, -11], radius: 3.4, seed: 9, ring: true, moon: true, color: '#8a6fb8', color2: p.crystal });
  kit.planetoid({ at: [14, 7.5, -16], radius: 1.6, seed: 14, ring: false, color: '#c98f6a', color2: '#ffd6a0' });
  kit.planetoid({ at: [8.5, -5, -9], radius: 1.1, seed: 19, ring: false, color: p.rock });
  kit.haloRing({ at: [0, -1, 0], radius: 12, thickness: 0.03, color: p.accent2, tilt: [0.18, -0.1], spin: 0.02 });
  kit.haloRing({ at: [-13, 4.5, -11], radius: 5.8, thickness: 0.025, color: p.crystal, tilt: [0.5, 0.2], spin: -0.05 });
  kit.motes({ at: [0, -2, 0], radius: 12, height: 10, count: 120, color: '#cfe3ff', size: 0.06, speed: 0.08 });
  return {
    target: V(0, 1.5, -2.2), radius: 14.5, height: 7.2, fov: 46, angle: 0.18, sway: 0,
    focus: { center: V(0, 0, -1), radius: 12 },
    sky: { planetDirection: V(0.75, 0.28, -0.6), planetSize: 0.2 },
  };
};

// ---------------------------------------------------------------------------------------------
// BEYOND: the climb as concentric layers, centre outwards: well -> cloud ring -> orbit -> crystal halo.
// ---------------------------------------------------------------------------------------------
const buildBeyond: Builder = (kit, p) => {
  kit.floatingPlatform({ radius: 8.2, top: 'none', depth: 8, crystals: 6, seed: 77 });
  kit.floor({ radius: 8.1, innerRadius: 5.25, style: 'tiles', tile: 1.05, thickness: 0.12 });
  // Star-water pool with a stone curb, the original wellhead standing in it, and the frog on a rock.
  kit.wellhead({ radius: 5.15, height: 0.42, roof: false, shaft: false });
  kit.water({ at: [0, 0.26, 0], radius: 4.95, sparkle: 1.4 });
  kit.wellhead({ at: [0, 0.2, 0], radius: 1.05, height: 0.85, roof: true });
  kit.rocks({ at: [2.4, 0.1, 1.5], radius: 0.6, count: 4, size: 0.7 });
  kit.statue({ kind: 'frog', at: [2.4, 0.4, 1.5], rotY: -0.4, scale: 0.55, glow: p.accent2 });
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * TAU + 0.4;
    kit.lilyPad({ at: onRing(3.2 + (i % 3) * 0.5, a, 0.29), radius: 0.35 + (i % 2) * 0.15, flower: i % 2 === 0, flowerColor: i % 3 ? p.petal : p.accent2 });
  }
  // Iridescent pillars around the pool; gate to the Crown at the back.
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI / 2 + (i - 2.5) * 0.62;
    if (Math.abs(i - 2.5) < 1) continue;
    kit.pillar({ at: onRing(6.6, a), height: 4.2, radius: 0.32, material: 'iridescent', color: p.iridescent[i % 3], capitalColor: p.brass });
  }
  kit.door({ at: [0, 0, -6.7], style: 'gate', label: '4X', letter: 'X', sconceLights: false, width: 2.6, height: 3.9 });
  kit.lantern({ at: [-2.4, 0, -5.4], color: p.lantern, intensity: 6, distance: 7 });
  kit.lantern({ at: [2.4, 0, -5.4], color: p.lantern, light: false });
  // Layer 2: a ring of clouds hugging the island.
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * TAU;
    kit.cloudPuff({ at: onRing(10.5 + (i % 3) * 0.8, a, -1.2 - (i % 2) * 0.8), scale: 1.6 + (i % 3) * 0.4, seed: 300 + i });
  }
  // Layer 3: an orbit of small worlds.
  kit.haloRing({ at: [0, 1.2, 0], radius: 15, thickness: 0.035, color: p.iridescent[1], tilt: [0.12, 0.05], spin: 0.015 });
  const worlds: [number, number, string, boolean][] = [[-2.3, 1.3, '#7b6bd6', true], [-0.95, 0.8, '#d68fb8', false], [0.35, 1.7, '#5fc9d8', true], [1.9, 0.9, '#e0b870', false]];
  for (const [a, r, c, ring] of worlds) kit.planetoid({ at: onRing(15, a, 1.2 + Math.sin(a) * 1.5), radius: r, color: c, color2: p.crystal, ring, seed: Math.round(a * 100) + 500 });
  // Layer 4: crystal halo on the outermost ring.
  kit.haloRing({ at: [0, 3, 0], radius: 24, thickness: 0.06, color: p.accent, tilt: [0.08, 0], spin: -0.01 });
  for (let i = 0; i < 9; i++) {
    const a = -Math.PI / 2 + (i - 4) * 0.34;
    const rock = kit.floatingPlatform({ at: onRing(23, a, 2 + Math.cos(i * 1.7) * 2.5), radius: 1.3, top: 'none', depth: 2.2, seed: 900 + i, roots: false });
    kit.crystalCluster({ parent: rock, at: [0, 0, 0], count: 5, height: 2.6 + (i % 3) * 0.8, color: p.iridescent[i % 3], color2: p.crystal });
  }
  // Floating steps spiralling up to a lookout with the hooded keeper.
  kit.stairs({ at: [6.2, 0, 3.4], rotY: 2.3, width: 1.3, steps: 10, rise: 0.36, run: 0.5, solid: false, material: 'iridescent' });
  const look = kit.floatingPlatform({ at: [10.3, 3.7, -1.2], radius: 2.1, shape: 'hex', top: 'stone', depth: 2.8, seed: 61 });
  kit.statue({ parent: look, kind: 'hooded', at: [0, 0.05, 0], rotY: -1.2, scale: 0.6, material: 'iridescent', glow: p.glow });
  kit.motes({ at: [0, -1, 0], radius: 14, height: 12, count: 150, color: '#ffe8ff', size: 0.07, speed: 0.1 });
  return {
    target: V(0, 1.2, -1.5), radius: 17.5, height: 9.5, fov: 48, angle: -0.22, sway: 0,
    focus: { center: V(0, 0, 0), radius: 13 },
  };
};

const BUILDERS: Record<BiomeId, Builder> = { well: buildWell, sky: buildSky, space: buildSpace, beyond: buildBeyond };

const TONE: Record<LightingPreset['toneMapping'], ToneMappingMode> = {
  agx: ToneMappingMode.AGX, aces: ToneMappingMode.ACES_FILMIC, neutral: ToneMappingMode.NEUTRAL,
};

export default async function start(): Promise<void> {
  const params = new URLSearchParams(location.search);
  const isTest = params.get('test') === '1';
  const b = params.get('biome') as BiomeId | null;
  const biome: BiomeId = b && (BIOMES as readonly string[]).includes(b) ? b : 'well';
  const still = isTest || params.get('still') === '1';
  const angleParam = params.get('angle');
  await loadFonts(isTest ? 1500 : 2500).catch(() => undefined);

  const app = document.getElementById('app') ?? document.body;
  const renderer = new THREE.WebGLRenderer({ antialias: false, stencil: false, depth: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(isTest ? 1 : Math.min(window.devicePixelRatio, 2));
  const size = () => [app.clientWidth || window.innerWidth, app.clientHeight || window.innerHeight] as const;
  renderer.setSize(...size());
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.info.autoReset = false;
  app.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const palette = paletteFor(biome);
  const preset = LIGHTING[biome];
  const camera = new THREE.PerspectiveCamera(45, size()[0] / size()[1], 0.1, 500);
  const physics = new Physics();
  const root = new THREE.Group();
  root.name = `diorama:${biome}`;
  scene.add(root);

  const t0 = performance.now();
  const kit = new Kit(root, palette, physics, { seed: 7, maxLights: 6 });
  const view = BUILDERS[biome](kit, palette, preset);
  const buildMs = performance.now() - t0;
  const stats = kit.finalize();
  const sky = createSky(SKY_FOR_BIOME[biome], palette, { time: KIT_TIME, sunDirection: new THREE.Vector3(...preset.key.direction), ...view.sky });
  scene.add(sky.mesh);
  const lit = applyLighting(scene, preset, { renderer, focus: view.focus });
  camera.fov = view.fov;
  camera.updateProjectionMatrix();
  const tc = performance.now();
  await renderer.compileAsync(scene, camera).catch(() => renderer.compile(scene, camera));
  const compileMs = performance.now() - tc;

  const composer = new EffectComposer(renderer, { frameBufferType: THREE.HalfFloatType, multisampling: 4 });
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new BloomEffect({
    mipmapBlur: true, intensity: preset.bloom.intensity, luminanceThreshold: preset.bloom.threshold,
    luminanceSmoothing: preset.bloom.smoothing, radius: preset.bloom.radius, levels: 7,
  });
  const tone = new ToneMappingEffect({ mode: TONE[preset.toneMapping] });
  renderer.toneMappingExposure = preset.exposure;
  const sat = new HueSaturationEffect({ saturation: preset.saturation });
  const vignette = new VignetteEffect({ darkness: preset.vignette, offset: 0.3 });
  composer.addPass(new EffectPass(camera, bloom, tone, sat, vignette));

  let collidersShown = false;
  const showColliders = () => {
    if (collidersShown) return;
    collidersShown = true;
    physics.debugDraw(scene);
  };
  if (params.get('colliders') === '1') showColliders();

  const onResize = () => {
    const [w, h] = size();
    renderer.setSize(w, h);
    composer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  window.addEventListener('resize', onResize);
  onResize();

  // Orbit: hero angle, then a slow full orbit (sway 0) or a gentle sway around the hero angle.
  let angle = angleParam !== null ? Number(angleParam) : view.angle;
  const fixedAngle = still || angleParam !== null;
  const placeCamera = (t: number) => {
    let a = angle;
    if (!fixedAngle) a = view.sway > 0 ? view.angle + Math.sin(t * 0.12) * view.sway : view.angle + t * 0.05;
    const bob = fixedAngle ? 0 : Math.sin(t * 0.37) * 0.25;
    camera.position.set(view.target.x + Math.sin(a) * view.radius, view.target.y + view.height + bob, view.target.z + Math.cos(a) * view.radius);
    camera.lookAt(view.target);
    angle = a;
  };

  // Collider probes: raycast down at a few points; the hit heights should sit on the visible tops.
  const probe = (x: number, z: number) => {
    const hit = physics.raycast(new THREE.Vector3(x, 40, z), new THREE.Vector3(0, -1, 0), 80);
    return hit ? Math.round(hit.point.y * 100) / 100 : null;
  };

  // Test mode renders a fixed time (deterministic shots) for a few frames, then idles.
  const TEST_FRAMES = 3;
  let frames = 0, fps = 0, fpsFrames = 0, fpsFrom = performance.now(), calls = 0, tris = 0, frameMs = 0;
  let last = performance.now(), running = true, rendered = 0, budget = isTest ? TEST_FRAMES : Infinity;
  const tStart = performance.now();
  const renderOnce = (t: number, dt: number) => {
    const f0 = performance.now();
    kit.update(t, dt);
    lit.update(t);
    view.update?.(t);
    placeCamera(t);
    renderer.info.reset();
    composer.render(dt);
    calls = renderer.info.render.calls;
    tris = renderer.info.render.triangles;
    frameMs = performance.now() - f0;
    rendered++;
  };
  const frame = () => {
    if (!running || rendered >= budget) return;
    requestAnimationFrame(frame);
    const now = performance.now();
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    renderOnce(isTest ? 3 + rendered / 60 : (now - tStart) / 1000 + 3, dt);
    frames++;
    fpsFrames++;
    if (now - fpsFrom >= 1000) {
      fps = Math.round((fpsFrames * 1000) / (now - fpsFrom));
      fpsFrames = 0;
      fpsFrom = now;
    }
  };
  requestAnimationFrame(frame);
  const renderMore = (n = 1) => {
    budget = rendered + n;
    running = true;
    last = performance.now();
    requestAnimationFrame(frame);
  };

  /** Render the scene (no post) into a small float target and look for values that would break bloom. */
  const hdr = () => {
    const w = 320, h = 180;
    const rt = new THREE.WebGLRenderTarget(w, h, { type: THREE.FloatType });
    const buf = new Float32Array(w * h * 4);
    renderer.setRenderTarget(rt);
    renderer.render(scene, camera);
    renderer.readRenderTargetPixels(rt, 0, 0, w, h, buf);
    renderer.setRenderTarget(null);
    rt.dispose();
    let nonFinite = 0, over = 0, max = 0;
    for (let i = 0; i < buf.length; i++) {
      if ((i & 3) === 3) continue;
      const v = buf[i];
      if (!Number.isFinite(v)) nonFinite++;
      else {
        if (v > 60000) over++;
        if (v > max) max = v;
      }
    }
    return { max: Math.round(max * 100) / 100, nonFinite, overHalfFloat: over };
  };
  let hdrStats: ReturnType<typeof hdr> | null = null;

  mergeTestHooks(() => ({
    demo: 'kit', biome, drawCalls: calls, triangles: tris, fps, frames, frameMs: Math.round(frameMs),
    ready: rendered > 0,
    hdr: rendered > 0 ? (hdrStats ??= hdr()) : null,
    kit: { ...kit.stats(), buildMs: Math.round(buildMs), compileMs: Math.round(compileMs), mergedAtFinalize: stats.merged },
    colliders: kit.colliders.length,
    lights: { kit: kit.lights.length, lanterns: lit.lanterns.length },
    textures: textureCacheSize(),
    probes: biome === 'well'
      ? { floor: probe(7, 0), pool: probe(0.5, 2.5), stairTop: probe(...ringXZ(10.1, -Math.PI / 2 + 1.05 + 1.2)) }
      : biome === 'sky' ? { plaza: probe(0, 1.5), grass: probe(5.5, 1) } : biome === 'space' ? { deck: probe(1, 2) } : { deck: probe(6.5, 2) },
  }), {
    kit, scene, camera, renderer, physics, sky, lighting: lit,
    setAngle: (a: number) => { angle = a; if (isTest) renderMore(1); },
    showColliders: () => { showColliders(); if (isTest) renderMore(1); },
    render: renderMore,
    /** Render one frame synchronously (works in hidden tabs where rAF is paused). */
    frame: (t = 3) => renderOnce(t, 1 / 60),
    view,
    composer, bloom,
    hdr,
    stop: () => { running = false; },
  });
}

function ringXZ(r: number, a: number): [number, number] {
  return [Math.cos(a) * r, Math.sin(a) * r];
}
