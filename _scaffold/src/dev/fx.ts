/**
 * ?demo=fx : FX lab at the bottom of the Well. A 4x4 grid of rune pedestals cycles through every
 * burst kind; five orbs fly ribbon trails in each style; the Well is alive with ambient emitters
 * (dust in the sky-light shaft, fireflies, petals, embers, spores, wall crystals, ground mist).
 */
import * as THREE from 'three';
import { BloomEffect, EdgeDetectionMode, EffectComposer, EffectPass, RenderPass, SMAAEffect, SMAAPreset, ToneMappingEffect, ToneMappingMode, VignetteEffect } from 'postprocessing';
import type { BurstKind } from '../core/api.ts';
import { BURST_KINDS, BURST_DEFAULT_COLOR, FxSystem } from '../world/fx.ts';
import { AmbientEmitters, LightShaft } from '../world/ambient.ts';
import type { AmbientConfig, AmbientEmitter, AmbientKind } from '../world/ambient.ts';
import { TRAIL_STYLES } from '../world/trails.ts';
import type { TrailStyle } from '../world/trails.ts';
import { SPRITE } from '../world/particles.ts';

const POOL_BASE = 0.32;
const PALETTE = ['#FF6B2C', '#4FC3F7', '#8BD450', '#F2B134', '#B388FF', '#00E5C0', '#FFF1C1', '#ff5a9e'];
const POP_TEXT: Record<BurstKind, [string, string]> = {
  dust: ['THUD', '#e8d6bb'], spark: ['CLANG!', '#ffd36b'], confetti: ['HOORAY!', '#ff7aa8'], shards: ['CRACK!', '#bfe6ff'],
  smoke: ['fwoosh', '#c9c2e6'], ember: ['+3 EMBERS', '#ff9a4a'], bubbles: ['blub blub', '#8ae9ff'], stars: ['DIZZY', '#ffe45c'],
  splash: ['SPLASH!', '#6fd6ff'], glitch: ['ERR0R', '#c7a2ff'], feathers: ['fwump', '#fff4e6'], coins: ['+12', '#ffd34d'],
  heal: ['+25 WAX', '#7dff9a'], ice: ['FROZEN', '#b8f0ff'], soundwave: ['C · E · G', '#f5c05a'], poof: ['POOF!', '#f1ecff'],
};
const TRAIL_COLORS: Record<TrailStyle, string> = { plain: '#4FC3F7', sparkle: '#F2B134', rainbow: '#ffffff', pixel: '#B388FF', ember: '#FF6B2C' };

interface TF { report?: () => object; debug?: Record<string, unknown> }

export default function start(): void {
  const params = new URLSearchParams(location.search);
  const isTest = params.get('test') === '1';
  const app = document.getElementById('app') ?? document.body;
  addFonts();

  const renderer = new THREE.WebGLRenderer({ antialias: false, stencil: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(isTest ? 1 : Math.min(window.devicePixelRatio, 2));
  renderer.setSize(app.clientWidth || window.innerWidth, app.clientHeight || window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.info.autoReset = false;
  app.appendChild(renderer.domElement);

  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden';
  app.appendChild(overlay);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#06050b');
  scene.fog = new THREE.FogExp2('#0a0814', 0.018);
  const camera = new THREE.PerspectiveCamera(40, 16 / 9, 0.1, 200);

  // Mirrors the game's post chain (core/post.ts, 'well' look): HalfFloat, no MSAA, bloom -> AgX,
  // then SMAA + vignette. Tuning FX against this grade means it holds in-game.
  const composer = new EffectComposer(renderer, { frameBufferType: THREE.HalfFloatType, multisampling: 0 });
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new BloomEffect({ mipmapBlur: true, intensity: 0.95, luminanceThreshold: 0.72, luminanceSmoothing: 0.25, radius: 0.75, levels: 8 });
  composer.addPass(new EffectPass(camera, bloom, new ToneMappingEffect({ mode: ToneMappingMode.AGX })));
  composer.addPass(new EffectPass(camera, new SMAAEffect({ preset: SMAAPreset.HIGH, edgeDetectionMode: EdgeDetectionMode.COLOR }), new VignetteEffect({ darkness: 0.58, offset: 0.3 })));

  buildWell(scene);
  const pedestals = buildPedestals(scene);
  const pedestalGems = scene.userData.pedestalGems as PedestalGems;
  const braziers = [new THREE.Vector3(-8.1, 0, -4.2), new THREE.Vector3(8.1, 0, -4.2)];
  for (const b of braziers) buildBrazier(scene, b);

  const shaft = new LightShaft({ top: new THREE.Vector3(0.8, 19, -1.2), bottom: new THREE.Vector3(0, 0, 0.2), radiusTop: 1.5, radiusBottom: 3.6, color: '#fff1c1', intensity: 0.2 });
  scene.add(shaft.mesh);

  const fx = new FxSystem(scene, camera, overlay);
  const ambient = new AmbientEmitters(fx.particles);
  const V = (x: number, y: number, z: number): THREE.Vector3 => new THREE.Vector3(x, y, z);
  const ambientCfg: AmbientConfig[] = [
    { kind: 'dust', min: V(-1.9, 0.2, -1.6), max: V(1.9, 9, 2.2), density: 2.4 },
    { kind: 'fireflies', min: V(-9.5, 0.4, -9.5), max: V(9.5, 4.2, 8), density: 0.04 },
    { kind: 'petals', min: V(-3, 0, -2.6), max: V(3, 14, 3), density: 0.03 },
    { kind: 'leaves', min: V(-6, 0, -6), max: V(6, 14, 4), density: 0.006 },
    { kind: 'embers', min: V(-8.5, 0.9, -4.6), max: V(-7.7, 4.5, -3.8), density: 9 },
    { kind: 'embers', min: V(7.7, 0.9, -4.6), max: V(8.5, 4.5, -3.8), density: 9 },
    { kind: 'spores', min: V(-10, 0.1, -10), max: V(-5, 3.5, 6), density: 0.35, color: '#7dffd4' },
    { kind: 'spores', min: V(5, 0.1, -10), max: V(10, 3.5, 6), density: 0.35, color: '#b9a4ff' },
    { kind: 'stars', min: V(-9.5, 3.5, -10.35), max: V(9.5, 11, -9.9), density: 0.45, size: 1.2 },
    { kind: 'wisps', min: V(-10, 0.1, -10), max: V(10, 0.7, 7), density: 0.025, color: '#9d8cff' },
  ];
  for (const c of ambientCfg) ambient.add(c);
  // debug.ambient(kind): a dense showcase volume over the centre plaza, for checking one kind.
  let showcase: AmbientEmitter | null = null;

  // Orbiting trail carriers.
  const orbGlow = glowTexture();
  const orbs = TRAIL_STYLES.map((style, i) => {
    const o = new THREE.Group();
    const col = new THREE.Color(TRAIL_COLORS[style]);
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.11, 1), new THREE.MeshBasicMaterial({ color: col.clone().multiplyScalar(3) }));
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: orbGlow, color: col.clone().multiplyScalar(2.2), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
    halo.scale.setScalar(0.9);
    o.add(core, halo);
    scene.add(o);
    const handle = fx.trail(o, { color: TRAIL_COLORS[style], style, width: style === 'pixel' ? 0.34 : 0.3, length: style === 'ember' ? 0.7 : 0.55 });
    return { o, style, handle, phase: i * 1.2566, radius: 7.3 - i * 0.35, height: 1.3 + i * 0.42, speed: 0.55 + i * 0.07 };
  });

  // Labels + HUD.
  const css = document.createElement('style');
  css.textContent = DEMO_CSS;
  document.head.appendChild(css);
  const labels = pedestals.map((p, i) => {
    const el = document.createElement('div');
    el.className = 'fxlab-label';
    el.innerHTML = `<span class="n">${String(i + 1).padStart(2, '0')}</span>${BURST_KINDS[i]}`;
    el.style.setProperty('--c', PALETTE[i % PALETTE.length]);
    overlay.appendChild(el);
    return { el, pos: p.clone().setY(0.02).add(new THREE.Vector3(0, 0, 0.95)) };
  });
  const hud = document.createElement('div');
  hud.className = 'fxlab-hud';
  overlay.appendChild(hud);

  // State.
  let simTime = 0;
  let frozen = false;
  let cycling = !params.has('nocycle');
  let cycleT = 0.4;
  let cycleIdx = 0;
  let lastBurst: BurstKind | null = null;
  let burstsFired = 0;
  let activeIdx = -1;
  let activeT = 0;
  let focusIdx: number | null = null;
  let drawCalls = 0;
  let triangles = 0;
  let frames = 0;
  let fpsAcc = 0;
  let fps = 0;
  let hudT = 0;
  const gemColor = new THREE.Color();
  const syncPx = new Uint8Array(4);

  const gemPos = (i: number): THREE.Vector3 => pedestals[i].clone().setY(1.05);
  const fire = (i: number, pop = true): void => {
    const kind = BURST_KINDS[i];
    const at = kind === 'splash' || kind === 'dust' || kind === 'heal' || kind === 'ice' ? pedestals[i].clone().setY(0.44) : gemPos(i);
    fx.burst(kind, at, { ground: 0.44 });
    if (pop) {
      const [txt, col] = POP_TEXT[kind];
      fx.popText(gemPos(i).add(new THREE.Vector3(0, 0.9, 0)), txt, { color: col, size: kind === 'coins' || kind === 'confetti' ? 34 : 28 });
    }
    lastBurst = kind;
    burstsFired++;
    activeIdx = i;
    activeT = 0;
  };

  const resize = (): void => {
    const w = app.clientWidth || window.innerWidth;
    const h = app.clientHeight || window.innerHeight;
    renderer.setSize(w, h);
    composer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  window.addEventListener('resize', resize);
  resize();

  const camPos = new THREE.Vector3();
  const camLook = new THREE.Vector3();
  const tmp = new THREE.Vector3();
  const placeCamera = (): void => {
    if (focusIdx !== null) {
      const p = pedestals[focusIdx];
      camPos.set(p.x, 3.5, p.z + 5.6);
      camLook.set(p.x, 1.45, p.z);
    } else {
      const sway = Math.sin(simTime * 0.12) * 0.9;
      camPos.set(sway, 9.2, 12.4);
      camLook.set(sway * 0.3, 0.2, -0.2);
    }
    camera.position.copy(camPos);
    camera.lookAt(camLook);
    camera.updateMatrixWorld();
  };

  const simulate = (dt: number): void => {
    simTime += dt;
    if (cycling) {
      cycleT -= dt;
      if (cycleT <= 0) {
        cycleT += 1.15;
        fire(cycleIdx);
        if (cycleIdx % 4 === 3) {
          const a = gemPos((cycleIdx + 5) % 16);
          const b = gemPos((cycleIdx + 10) % 16);
          fx.beam(a, b, { color: PALETTE[cycleIdx % PALETTE.length], seconds: 0.7 });
        }
        if (cycleIdx % 8 === 7) fx.ring(new THREE.Vector3(0, 0.02, 0), { color: '#B388FF', radius: 9, seconds: 1.4, width: 0.5 });
        cycleIdx = (cycleIdx + 1) % BURST_KINDS.length;
      }
    }
    for (const orb of orbs) {
      const a = orb.phase + simTime * orb.speed;
      orb.o.position.set(Math.cos(a) * orb.radius, orb.height + Math.sin(a * 3) * 0.5, Math.sin(a) * orb.radius * 0.82);
      orb.o.children[1].scale.setScalar(0.8 + 0.12 * Math.sin(simTime * 9 + orb.phase));
    }
    // Brazier fire: layered flame licks from the shared particle system.
    const P = fx.particles.params;
    for (const b of braziers) {
      const n = Math.random() < dt * 34 ? 1 + (Math.random() < 0.5 ? 1 : 0) : 0;
      for (let k = 0; k < n; k++) {
        P.reset();
        P.at(b.x + (Math.random() - 0.5) * 0.35, 1.25, b.z + (Math.random() - 0.5) * 0.35);
        P.vel((Math.random() - 0.5) * 0.3, 1.2 + Math.random() * 0.9, (Math.random() - 0.5) * 0.3);
        P.sprite = Math.random() < 0.5 ? SPRITE.glow : SPRITE.ember;
        P.size(0.55 + Math.random() * 0.25, 0.08);
        P.life = 0.45 + Math.random() * 0.3;
        P.gravity = -1.5;
        P.drag = 1;
        P.wobble = 0.06;
        P.wobbleFreq = 9;
        P.rot = Math.random() * 6.28;
        P.color(3.2, 1.9, 0.7).colorEnd(1.4, 0.18, 0.04);
        P.fadeIn = 0.1;
        P.fadeOut = 0.5;
        fx.particles.spawn(P);
      }
    }
    activeT += dt;
    ambient.update(dt);
    shaft.update(dt);
    placeCamera();
    // Sub-step so slow frames stay stable.
    let rem = dt;
    while (rem > 1e-6) {
      const h = Math.min(rem, 1 / 30);
      fx.update(h);
      rem -= h;
    }
    if (dt === 0) fx.update(0);
    animatePedestals();
  };

  const animatePedestals = (): void => {
    const t = simTime;
    for (let i = 0; i < pedestals.length; i++) {
      const bob = Math.sin(t * 1.6 + i * 0.7) * 0.07;
      pedestalGems.dummy.position.set(pedestals[i].x, 1.05 + bob, pedestals[i].z);
      pedestalGems.dummy.rotation.set(0, t * 0.9 + i, 0);
      const pulse = i === activeIdx ? 1 + 2.5 * Math.exp(-activeT * 3) : 1;
      pedestalGems.dummy.scale.setScalar(1 + (pulse - 1) * 0.25);
      pedestalGems.dummy.updateMatrix();
      pedestalGems.gems.setMatrixAt(i, pedestalGems.dummy.matrix);
      gemColor.set(PALETTE[i % PALETTE.length]).multiplyScalar(1.4 * pulse);
      pedestalGems.gems.setColorAt(i, gemColor);
      gemColor.set(PALETTE[i % PALETTE.length]).multiplyScalar(1.6 * pulse);
      pedestalGems.rings.setColorAt(i, gemColor);
      gemColor.set(PALETTE[i % PALETTE.length]).multiplyScalar(POOL_BASE * (1 + (pulse - 1) * 0.6));
      pedestalGems.pools.setColorAt(i, gemColor);
    }
    pedestalGems.gems.instanceMatrix.needsUpdate = true;
    if (pedestalGems.gems.instanceColor) pedestalGems.gems.instanceColor.needsUpdate = true;
    if (pedestalGems.rings.instanceColor) pedestalGems.rings.instanceColor.needsUpdate = true;
    if (pedestalGems.pools.instanceColor) pedestalGems.pools.instanceColor.needsUpdate = true;
  };

  const render = (): void => {
    renderer.info.reset();
    composer.render();
    drawCalls = renderer.info.render.calls;
    triangles = renderer.info.render.triangles;
    const w = overlay.clientWidth, h = overlay.clientHeight;
    for (let i = 0; i < labels.length; i++) {
      const l = labels[i];
      tmp.copy(l.pos).project(camera);
      const vis = tmp.z < 1 && Math.abs(tmp.x) < 1.1 && Math.abs(tmp.y) < 1.1;
      l.el.style.display = vis ? 'block' : 'none';
      if (!vis) continue;
      l.el.style.transform = `translate3d(${((tmp.x * 0.5 + 0.5) * w).toFixed(1)}px,${((-tmp.y * 0.5 + 0.5) * h).toFixed(1)}px,0) translate(-50%,-50%)`;
      l.el.classList.toggle('on', i === activeIdx && activeT < 1.1);
    }
  };

  const updateHud = (): void => {
    const s = fx.stats();
    hud.innerHTML = `<div class="t">[ FX LAB ]<span>THE WELL · FLOOR 0</span></div>
<div class="r"><b>BURST</b><i>${(lastBurst ?? '—').toUpperCase()}</i><em>${burstsFired}</em></div>
<div class="r"><b>PARTICLES</b><i>${s.liveParticles}</i><em>/ ${s.capacity}</em></div>
<div class="r"><b>DRAW CALLS</b><i>${drawCalls}</i><em>${fps.toFixed(0)} fps</em></div>
<div class="r"><b>TRAILS</b><i>${s.trails}</i><em>${ambient.emitters.length} ambient</em></div>`;
  };

  let last = performance.now();
  const loop = (now: number): void => {
    const raw = Math.min(0.1, Math.max(0, (now - last) / 1000));
    last = now;
    frames++;
    fpsAcc += raw;
    if (fpsAcc > 0.5) {
      fps = frames / fpsAcc;
      frames = 0;
      fpsAcc = 0;
    }
    // While frozen the harness drives frames through debug.step(); skipping idle renders keeps
    // software-GL screenshots fast.
    if (!frozen) {
      simulate(raw);
      render();
    }
    hudT -= raw;
    if (hudT <= 0) {
      hudT = 0.25;
      updateHud();
    }
    requestAnimationFrame(loop);
  };
  placeCamera();
  requestAnimationFrame(loop);

  const indexOf = (k: string | number): number => (typeof k === 'number' ? k : Math.max(0, BURST_KINDS.indexOf(k as BurstKind)));
  const w = window as unknown as { __TF?: TF };
  const prev = w.__TF ?? {};
  w.__TF = {
    ...prev,
    report: () => {
      const s = fx.stats();
      return {
        demo: 'fx',
        liveParticles: s.liveParticles,
        drawCalls,
        triangles,
        capacity: s.capacity,
        trails: s.trails,
        rings: s.rings,
        beams: s.beams,
        popTexts: s.popTexts,
        ambientEmitters: ambient.emitters.length,
        burstKinds: BURST_KINDS.length,
        burstsFired,
        lastBurst,
        fps: Math.round(fps * 10) / 10,
        simTime: Math.round(simTime * 100) / 100,
      };
    },
    debug: {
      ...(prev.debug ?? {}),
      fx,
      burst: (kind: string | number = 'spark') => {
        fire(indexOf(kind));
        return lastBurst;
      },
      fireAll: () => {
        for (let i = 0; i < BURST_KINDS.length; i++) fire(i, i % 3 === 0);
        return burstsFired;
      },
      focus: (kind: string | number | null) => {
        focusIdx = kind === null ? null : indexOf(kind);
        placeCamera();
        return focusIdx;
      },
      freeze: (on = true) => {
        frozen = on;
        return frozen;
      },
      cycle: (on = true) => {
        cycling = on;
        return cycling;
      },
      /** Advance the simulation deterministically (fixed 1/60 steps), then render once. */
      step: (seconds = 0.25) => {
        const n = Math.max(1, Math.round(seconds * 60));
        for (let i = 0; i < n; i++) simulate(1 / 60);
        render();
        updateHud();
        // Block until the GPU has finished this frame so a following screenshot only composites.
        const gl = renderer.getContext();
        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, syncPx);
        return fx.stats();
      },
      /** Milliseconds for one fully synced render (GPU included), for perf checks. */
      density: (v = 1) => {
        fx.density = v;
        return fx.density;
      },
      photosafe: (on = true) => {
        fx.photosafe = on;
        return fx.photosafe;
      },
      /** Synced ms for: bare scene, bare scene without fx meshes, full composer. */
      timeParts: () => {
        const gl = renderer.getContext();
        const px = new Uint8Array(4);
        const sync = (): void => gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
        const time = (fn: () => void): number => {
          sync();
          const t0 = performance.now();
          fn();
          sync();
          return Math.round(performance.now() - t0);
        };
        const fxMeshes = scene.children.filter((o) => /^(Particles|Trails|FxRings|FxBeams)/.test(o.name));
        const bare = time(() => renderer.render(scene, camera));
        fxMeshes.forEach((m) => (m.visible = false));
        const noFx = time(() => renderer.render(scene, camera));
        fx.update(0);
        const full = time(() => composer.render());
        return { bare, noFx, full, fxMeshes: fxMeshes.map((m) => m.name) };
      },
      timeRender: () => {
        const gl = renderer.getContext();
        const px = new Uint8Array(4);
        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
        const t0 = performance.now();
        render();
        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
        return Math.round(performance.now() - t0);
      },
      ring: () => fx.ring(new THREE.Vector3(0, 0.02, 0), { color: '#4FC3F7', radius: 6, seconds: 1 }),
      beam: () => fx.beam(gemPos(0), gemPos(15), { color: '#B388FF', seconds: 1.2 }),
      pop: (text = '+10 EMBERS', color = '#ffd36b') => fx.popText(new THREE.Vector3(0, 2, 0), text, { color }),
      flash: (color = '#ffffff', seconds = 0.3) => fx.flash(color, seconds),
      clear: () => fx.clear(),
      stopTrails: () => orbs.forEach((o) => o.handle.stop()),
      ambient: (kind: AmbientKind | null = 'snow', density?: number) => {
        showcase?.remove();
        showcase = null;
        if (kind) showcase = ambient.add({ kind, min: V(-3.2, 0.2, -2.6), max: V(3.2, 5.5, 3.2), density });
        return ambient.emitters.length;
      },
    },
  };
}

// ---------------------------------------------------------------------------------------------
// Set dressing (demo only).
// ---------------------------------------------------------------------------------------------
interface PedestalGems { gems: THREE.InstancedMesh; rings: THREE.InstancedMesh; pools: THREE.InstancedMesh; dummy: THREE.Object3D }

function buildPedestals(scene: THREE.Scene): THREE.Vector3[] {
  const xs = [-4.6, -1.55, 1.55, 4.6];
  const zs = [-5.0, -1.9, 1.15, 4.1];
  const pts: THREE.Vector3[] = [];
  for (const z of zs) for (const x of xs) pts.push(new THREE.Vector3(x, 0, z));
  const stone = new THREE.MeshStandardMaterial({ color: '#403a58', roughness: 0.82, metalness: 0.05, flatShading: true });
  const trim = new THREE.MeshStandardMaterial({ color: '#27223a', roughness: 0.7, metalness: 0.2, flatShading: true });
  const base = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.62, 0.72, 0.18, 6), trim, pts.length);
  const body = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.5, 0.56, 0.3, 6), stone, pts.length);
  const ringGeo = new THREE.TorusGeometry(0.4, 0.028, 8, 48);
  ringGeo.rotateX(Math.PI / 2);
  const rings = new THREE.InstancedMesh(ringGeo, new THREE.MeshBasicMaterial({ color: '#ffffff' }), pts.length);
  const gemMat = new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#ffffff', emissiveIntensity: 0.9, roughness: 0.15, metalness: 0.2, flatShading: true });
  gemMat.onBeforeCompile = (s) => {
    s.fragmentShader = s.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )\n totalEmissiveRadiance *= vColor.rgb;\n#endif');
  };
  const gemGeo = new THREE.OctahedronGeometry(0.17, 0);
  gemGeo.scale(1, 1.45, 1);
  const gems = new THREE.InstancedMesh(gemGeo, gemMat, pts.length);
  // Soft coloured light pool on the floor under each pedestal so the outer rows read in the dark.
  const poolGeo = new THREE.PlaneGeometry(3.2, 3.2);
  poolGeo.rotateX(-Math.PI / 2);
  const pools = new THREE.InstancedMesh(
    poolGeo,
    new THREE.MeshBasicMaterial({ map: glowTexture(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }),
    pts.length,
  );
  pools.renderOrder = 5;
  const d = new THREE.Object3D();
  const c = new THREE.Color();
  pts.forEach((p, i) => {
    d.position.set(p.x, 0.09, p.z);
    d.rotation.set(0, Math.PI / 6, 0);
    d.scale.setScalar(1);
    d.updateMatrix();
    base.setMatrixAt(i, d.matrix);
    d.position.y = 0.33;
    d.updateMatrix();
    body.setMatrixAt(i, d.matrix);
    d.position.y = 0.485;
    d.rotation.set(0, 0, 0);
    d.updateMatrix();
    rings.setMatrixAt(i, d.matrix);
    d.position.y = 0.012;
    d.updateMatrix();
    pools.setMatrixAt(i, d.matrix);
    c.set(PALETTE[i % PALETTE.length]).multiplyScalar(POOL_BASE);
    pools.setColorAt(i, c);
    c.set(PALETTE[i % PALETTE.length]).multiplyScalar(1.6);
    rings.setColorAt(i, c);
    d.position.y = 1.05;
    d.updateMatrix();
    gems.setMatrixAt(i, d.matrix);
    gems.setColorAt(i, c);
  });
  for (const m of [base, body]) {
    m.castShadow = true;
    m.receiveShadow = true;
  }
  gems.castShadow = true;
  scene.add(pools, base, body, rings, gems);
  scene.userData.pedestalGems = { gems, rings, pools, dummy: d } satisfies PedestalGems;
  return pts;
}

function buildWell(scene: THREE.Scene): void {
  const { map, emissive } = floorTextures();
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(10.7, 128),
    new THREE.MeshStandardMaterial({ map, bumpMap: map, bumpScale: 2.2, emissiveMap: emissive, emissive: '#ffffff', emissiveIntensity: 1.1, roughness: 0.86 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const brick = wallTexture();
  const wall = new THREE.Mesh(
    new THREE.CylinderGeometry(10.7, 10.7, 20, 128, 1, true),
    new THREE.MeshStandardMaterial({ map: brick, bumpMap: brick, bumpScale: 3, roughness: 0.93, side: THREE.BackSide }),
  );
  wall.position.y = 10;
  wall.receiveShadow = true;
  scene.add(wall);

  scene.add(new THREE.HemisphereLight('#6d68c8', '#140c1c', 0.9));
  const moon = new THREE.DirectionalLight('#9fb6ff', 1.1);
  moon.position.set(-5, 16, 7);
  moon.target.position.set(0, 0, -1);
  moon.castShadow = true;
  moon.shadow.mapSize.set(2048, 2048);
  moon.shadow.radius = 3;
  moon.shadow.bias = -0.0005;
  const sc = moon.shadow.camera;
  sc.left = -12; sc.right = 12; sc.top = 12; sc.bottom = -12; sc.near = 1; sc.far = 40;
  scene.add(moon, moon.target);

  const sun = new THREE.SpotLight('#ffe6b0', 26, 0, 0.19, 0.75, 0);
  sun.position.set(0.8, 19, -1.2);
  sun.target.position.set(0, 0, 0.2);
  scene.add(sun, sun.target);

  const rim = new THREE.PointLight('#8a5cff', 30, 16, 1.6);
  rim.position.set(0, 3, -8.5);
  scene.add(rim);
}

function buildBrazier(scene: THREE.Scene, at: THREE.Vector3): void {
  const metal = new THREE.MeshStandardMaterial({ color: '#2a2230', roughness: 0.5, metalness: 0.7, flatShading: true });
  const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.3, 0.9, 8), metal);
  stand.position.set(at.x, 0.45, at.z);
  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.32, 0.38, 10, 1, true), metal);
  bowl.position.set(at.x, 1.05, at.z);
  (bowl.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide;
  const coals = new THREE.Mesh(new THREE.CircleGeometry(0.56, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ff7a2a').multiplyScalar(2.2) }));
  coals.rotation.x = -Math.PI / 2;
  coals.position.set(at.x, 1.16, at.z);
  stand.castShadow = true;
  bowl.castShadow = true;
  const light = new THREE.PointLight('#ff8a3a', 18, 11, 1.7);
  light.position.set(at.x, 1.9, at.z);
  scene.add(stand, bowl, coals, light);
}

function mulberry(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function floorTextures(): { map: THREE.CanvasTexture; emissive: THREE.CanvasTexture } {
  const S = 2048;
  const R = 10.7;
  const px = S / 2 / R;
  const rnd = mulberry(77);
  const mk = (): [HTMLCanvasElement, CanvasRenderingContext2D] => {
    const c = document.createElement('canvas');
    c.width = S;
    c.height = S;
    return [c, c.getContext('2d') as CanvasRenderingContext2D];
  };
  const [mc, m] = mk();
  const [ec, e] = mk();
  m.fillStyle = '#0b0912';
  m.fillRect(0, 0, S, S);
  e.fillStyle = '#000';
  e.fillRect(0, 0, S, S);
  const cx = S / 2, cy = S / 2;
  const bands = [0, 1.15, 2.2, 3.35, 4.55, 5.8, 7.0, 8.3, 9.55, 10.7];
  for (let b = 0; b < bands.length - 1; b++) {
    const r0 = bands[b] * px, r1 = bands[b + 1] * px;
    const mid = (bands[b] + bands[b + 1]) / 2;
    const n = b === 0 ? 1 : Math.max(6, Math.round((2 * Math.PI * mid) / 1.25));
    const off = rnd() * Math.PI;
    for (let j = 0; j < n; j++) {
      const gap = b === 0 ? 0 : (0.05 * px) / Math.max(1, (r0 + r1) / 2);
      const a0 = off + (j * 2 * Math.PI) / n + gap;
      const a1 = off + ((j + 1) * 2 * Math.PI) / n - gap;
      m.beginPath();
      if (b === 0) m.arc(cx, cy, r1 - 0.05 * px, 0, Math.PI * 2);
      else {
        m.arc(cx, cy, r1 - 0.05 * px, a0, a1);
        m.arc(cx, cy, r0 + 0.05 * px, a1, a0, true);
      }
      m.closePath();
      const l = 13 + rnd() * 9 - b * 0.4;
      const hue = 252 + rnd() * 18;
      m.fillStyle = `hsl(${hue.toFixed(0)},${(10 + rnd() * 8).toFixed(0)}%,${l.toFixed(1)}%)`;
      m.fill();
      // Speckle wear inside the tile.
      for (let s = 0; s < 18; s++) {
        const a = a0 + (a1 - a0) * rnd();
        const rr = r0 + (r1 - r0) * rnd();
        m.fillStyle = rnd() < 0.5 ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.12)';
        m.beginPath();
        m.arc(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 2 + rnd() * 7, 0, Math.PI * 2);
        m.fill();
      }
      if (b >= 6 && rnd() < 0.35) {
        const a = a0 + (a1 - a0) * rnd();
        const rr = r0 + (r1 - r0) * rnd();
        const g = m.createRadialGradient(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 0, cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 40);
        g.addColorStop(0, 'rgba(70,110,60,0.35)');
        g.addColorStop(1, 'rgba(70,110,60,0)');
        m.fillStyle = g;
        m.fillRect(0, 0, S, S);
      }
    }
  }
  // Concentric rune circles: the Well's layers, drawn outward from the centre.
  const runeRings: [number, string][] = [[1.15, '#8f6bff'], [3.35, '#3fb6ff'], [5.8, '#8f6bff'], [8.3, '#34d6c0']];
  for (const [rm, col] of runeRings) {
    const r = rm * px;
    e.strokeStyle = col;
    e.lineWidth = 3;
    e.globalAlpha = 0.55;
    e.beginPath();
    e.arc(cx, cy, r, 0, Math.PI * 2);
    e.stroke();
    e.globalAlpha = 0.9;
    const ticks = Math.round(rm * 9);
    for (let i = 0; i < ticks; i++) {
      const a = (i / ticks) * Math.PI * 2;
      const kind = Math.floor(rnd() * 4);
      e.save();
      e.translate(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      e.rotate(a + Math.PI / 2);
      e.fillStyle = col;
      if (kind === 0) e.fillRect(-2, -9, 4, 18);
      else if (kind === 1) {
        e.beginPath();
        e.moveTo(0, -8); e.lineTo(6, 0); e.lineTo(0, 8); e.lineTo(-6, 0);
        e.closePath();
        e.fill();
      } else if (kind === 2) e.fillRect(-7, -2, 14, 4);
      e.restore();
    }
  }
  e.globalAlpha = 1;
  const map = new THREE.CanvasTexture(mc);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;
  const emissive = new THREE.CanvasTexture(ec);
  emissive.colorSpace = THREE.SRGBColorSpace;
  return { map, emissive };
}

function wallTexture(): THREE.CanvasTexture {
  const W = 1024, H = 1024;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d') as CanvasRenderingContext2D;
  const rnd = mulberry(9);
  g.fillStyle = '#07060b';
  g.fillRect(0, 0, W, H);
  const bh = 24, bw = 64;
  for (let row = 0; row * bh < H; row++) {
    const y = row * bh;
    const off = (row % 2) * (bw / 2) - rnd() * 10;
    const hNorm = y / H; // 0 top .. 1 bottom
    for (let x = off - bw; x < W + bw; x += bw * (0.8 + rnd() * 0.4)) {
      const w = bw * (0.75 + rnd() * 0.35);
      const l = 11 + rnd() * 9 + (1 - hNorm) * 4;
      const moss = hNorm > 0.82 ? (hNorm - 0.82) * 5 : 0;
      const hue = 255 - moss * 120 + rnd() * 10;
      g.fillStyle = `hsl(${hue.toFixed(0)},${(12 + moss * 20).toFixed(0)}%,${l.toFixed(1)}%)`;
      g.beginPath();
      g.roundRect(x + 2, y + 2, w - 4, bh - 4, 4);
      g.fill();
      g.fillStyle = 'rgba(255,255,255,0.05)';
      g.fillRect(x + 3, y + 3, w - 6, 3);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.repeat.set(6, 1);
  tex.anisotropy = 8;
  return tex;
}

function glowTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const g = c.getContext('2d') as CanvasRenderingContext2D;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.2, 'rgba(255,255,255,0.6)');
  grad.addColorStop(0.5, 'rgba(255,255,255,0.15)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

function addFonts(): void {
  if (document.getElementById('fxlab-fonts')) return;
  const l = document.createElement('link');
  l.id = 'fxlab-fonts';
  l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Nunito:wght@800;900&family=JetBrains+Mono:wght@500;700&display=swap';
  document.head.appendChild(l);
}

const DEMO_CSS = `
.fxlab-label{position:absolute;left:0;top:0;padding:3px 9px 3px 7px;font:600 11px/1.2 "JetBrains Mono",ui-monospace,Consolas,monospace;
letter-spacing:.16em;text-transform:uppercase;color:#d9e6ff;background:linear-gradient(180deg,rgba(14,16,34,.78),rgba(8,9,20,.78));
border:1px solid rgba(140,190,255,.28);border-radius:3px;white-space:nowrap;box-shadow:0 0 0 1px rgba(0,0,0,.4),0 4px 14px rgba(0,0,0,.45);
transition:border-color .2s,box-shadow .2s,color .2s;will-change:transform}
.fxlab-label .n{color:var(--c);margin-right:7px;opacity:.9}
.fxlab-label.on{border-color:var(--c);color:#fff;box-shadow:0 0 0 1px rgba(0,0,0,.4),0 0 16px var(--c),inset 0 0 10px rgba(255,255,255,.08)}
.fxlab-hud{position:absolute;left:18px;top:18px;min-width:250px;padding:12px 14px 10px;font:500 12px/1.55 "JetBrains Mono",ui-monospace,Consolas,monospace;
color:#cfe3ff;background:linear-gradient(180deg,rgba(10,16,38,.82),rgba(6,8,22,.82));border:1px solid rgba(110,200,255,.45);border-radius:4px;
box-shadow:0 0 18px rgba(60,160,255,.25),inset 0 0 22px rgba(60,140,255,.08)}
.fxlab-hud:before,.fxlab-hud:after{content:"";position:absolute;width:10px;height:10px;border:2px solid #7fd8ff}
.fxlab-hud:before{left:-3px;top:-3px;border-right:0;border-bottom:0}
.fxlab-hud:after{right:-3px;bottom:-3px;border-left:0;border-top:0}
.fxlab-hud .t{font-weight:700;letter-spacing:.2em;color:#9fe3ff;text-shadow:0 0 8px rgba(90,200,255,.8);margin-bottom:6px;display:flex;justify-content:space-between;gap:14px}
.fxlab-hud .t span{font-weight:500;letter-spacing:.12em;color:rgba(170,200,255,.55);font-size:10px;align-self:center}
.fxlab-hud .r{display:grid;grid-template-columns:96px 1fr auto;gap:8px}
.fxlab-hud b{font-weight:500;color:rgba(160,190,240,.6);letter-spacing:.12em;font-size:10.5px}
.fxlab-hud i{font-style:normal;color:#fff;font-weight:700}
.fxlab-hud em{font-style:normal;color:rgba(160,190,240,.55);font-size:10.5px}
`;
