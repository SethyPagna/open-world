// ?demo=ui — UI module showcase. A dark "well" of concentric glowing rings (layers upon layers,
// centre outward), wandering candle-folk that speech bubbles anchor to, and every overlay the UI
// module offers. `&state=` picks a scenario (hero | tones | tones2 | choice | screen | modal | edge
// | urgent | complete | log | anchor | lowfx | clean). window.__TF.report() / __TF.debug.* drive it
// from tests; __TF.debug.advance(s) fast-forwards deterministically for screenshots.
// Keys (humans): 1-4 traits · H hud · M altar screen · C choice · T all tones · L System log.
import * as THREE from 'three';
import type { SystemTone } from '../core/api.ts';
import { Ui } from '../ui/ui.ts';
import { h } from '../ui/h.ts';
import { displayFontLoaded } from '../ui/fonts.ts';
import type { TraitSlotInfo } from '../ui/hud.ts';
import {
  Button, Card, Grid, KeyCap, Panel, ProgressBar, RARITIES, ScreenFrame, Slider, Tabs, Toggle, TONES,
  type CardOpts, type TabsHandle,
} from '../ui/components.ts';

// ---------------------------------------------------------------------------------------------
// tiny deterministic RNG (demo only)
// ---------------------------------------------------------------------------------------------
function mulberry(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DOOR_COLORS = ['#FF6B2C', '#4FC3F7', '#8BD450', '#F2B134', '#B388FF', '#00E5C0'];
const DOOR_KEYS = ['A', 'B', 'C', 'D', 'E', 'X'];

function glowTexture(inner = 'rgba(255,255,255,1)', mid = 'rgba(255,255,255,0.35)'): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, inner);
  grd.addColorStop(0.22, mid);
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function beamTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 32;
  c.height = 256;
  const g = c.getContext('2d')!;
  const v = g.createLinearGradient(0, 0, 0, 256);
  v.addColorStop(0, 'rgba(255,255,255,0)');
  v.addColorStop(0.7, 'rgba(255,255,255,0.35)');
  v.addColorStop(1, 'rgba(255,255,255,0.9)');
  g.fillStyle = v;
  g.fillRect(0, 0, 32, 256);
  g.globalCompositeOperation = 'destination-in';
  const hgr = g.createLinearGradient(0, 0, 32, 0);
  hgr.addColorStop(0, 'rgba(0,0,0,0)');
  hgr.addColorStop(0.5, 'rgba(0,0,0,1)');
  hgr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = hgr;
  g.fillRect(0, 0, 32, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ---------------------------------------------------------------------------------------------
// Scene
// ---------------------------------------------------------------------------------------------
interface Actor {
  name: string;
  color: string;
  group: THREE.Group;
  head: THREE.Object3D;
  flame: THREE.Sprite;
  path: (t: number, out: THREE.Vector3) => void;
  lines: string[];
  said: number;
}

function buildWorld(scene: THREE.Scene, rng: () => number): { rings: THREE.Object3D[]; spire: THREE.Object3D; beams: THREE.Sprite[] } {
  scene.background = new THREE.Color('#04050b');
  scene.fog = new THREE.FogExp2('#05060d', 0.022);

  scene.add(new THREE.HemisphereLight('#4b5b9a', '#0a0610', 0.55));
  const key = new THREE.DirectionalLight('#9fb8ff', 0.35);
  key.position.set(-6, 14, 8);
  scene.add(key);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(80, 96),
    new THREE.MeshStandardMaterial({ color: '#0a0c18', roughness: 0.92, metalness: 0.05 }));
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  // Concentric layers: well -> sky -> space. Each ring is broken into arcs ("doors" between layers).
  const rings: THREE.Object3D[] = [];
  const radii = [2.4, 4.6, 7.4, 11, 15.5, 21, 28, 37];
  const inner = new THREE.Color('#ffcc4d');
  const midC = new THREE.Color('#54e8ff');
  const outer = new THREE.Color('#a98bff');
  radii.forEach((r, k) => {
    const f = k / (radii.length - 1);
    const col = f < 0.5 ? inner.clone().lerp(midC, f * 2) : midC.clone().lerp(outer, (f - 0.5) * 2);
    const g = new THREE.Group();
    const arcs = 3 + k;
    const gapRad = 0.16 + rng() * 0.12;
    for (let i = 0; i < arcs; i++) {
      const start = (i / arcs) * Math.PI * 2 + gapRad / 2;
      const len = (Math.PI * 2) / arcs - gapRad;
      const w = 0.035 + (k === 0 ? 0.03 : 0);
      const m = new THREE.Mesh(
        new THREE.RingGeometry(r - w, r + w, 96, 1, start, len),
        new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.95 - f * 0.45, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
      g.add(m);
      // soft under-glow band
      const halo = new THREE.Mesh(
        new THREE.RingGeometry(r - 0.32, r + 0.32, 96, 1, start, len),
        new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.09 - f * 0.05, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
      g.add(halo);
    }
    g.rotation.x = -Math.PI / 2;
    g.position.y = 0.02 + k * 0.002;
    g.userData.speed = (k % 2 ? -1 : 1) * (0.05 / (1 + k * 0.4));
    scene.add(g);
    rings.push(g);
  });

  // door beacons standing on the rings
  const beamTex = beamTexture();
  const beams: THREE.Sprite[] = [];
  for (let i = 0; i < 14; i++) {
    const r = radii[2 + (i % 5)];
    const a = rng() * Math.PI * 2;
    const c = DOOR_COLORS[i % DOOR_COLORS.length];
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: beamTex, color: c, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.55 }));
    const hgt = 5 + rng() * 9;
    s.scale.set(0.55, hgt, 1);
    s.center.set(0.5, 0);
    s.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
    s.userData.phase = rng() * 10;
    scene.add(s);
    beams.push(s);
  }

  // the knot spire at the bottom of the well
  const spire = new THREE.Group();
  const knot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.9, 0.16, 180, 12, 2, 5),
    new THREE.MeshStandardMaterial({ color: '#2a2214', emissive: '#ffb84d', emissiveIntensity: 0.75, roughness: 0.35, metalness: 0.7 }));
  knot.scale.set(0.62, 1.35, 0.62);
  knot.position.y = 2.1;
  spire.add(knot);
  const core = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture('rgba(255,244,210,1)', 'rgba(255,190,90,0.45)'), color: '#ffd27a', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  core.scale.set(5, 5, 1);
  core.position.y = 2.1;
  spire.add(core);
  const light = new THREE.PointLight('#ffb35a', 18, 16, 1.6);
  light.position.y = 3;
  spire.add(light);
  spire.userData.knot = knot;
  scene.add(spire);

  // stars: the sky beyond the well's mouth
  const n = 1400;
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const u = rng() * Math.PI * 2;
    const v = 0.08 + rng() * 0.9;
    const R = 120 + rng() * 60;
    pos[i * 3] = Math.cos(u) * Math.cos(v) * R;
    pos[i * 3 + 1] = Math.sin(v) * R;
    pos[i * 3 + 2] = Math.sin(u) * Math.cos(v) * R;
  }
  const sg = new THREE.BufferGeometry();
  sg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: '#cfe6ff', size: 1.4, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.8 })));

  // floating motes
  const m = 260;
  const mp = new Float32Array(m * 3);
  for (let i = 0; i < m; i++) {
    const r = 2 + rng() * 30;
    const a = rng() * Math.PI * 2;
    mp[i * 3] = Math.cos(a) * r;
    mp[i * 3 + 1] = 0.3 + rng() * 8;
    mp[i * 3 + 2] = Math.sin(a) * r;
  }
  const mg = new THREE.BufferGeometry();
  mg.setAttribute('position', new THREE.BufferAttribute(mp, 3));
  const motes = new THREE.Points(mg, new THREE.PointsMaterial({ color: '#ffd9a0', size: 0.09, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false }));
  motes.name = 'motes';
  scene.add(motes);

  return { rings, spire, beams };
}

function makeActor(scene: THREE.Scene, name: string, color: string, flameTex: THREE.Texture, path: Actor['path'], lines: string[]): Actor {
  const group = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.34, 0.62, 6, 14),
    new THREE.MeshStandardMaterial({ color: '#efe3cf', emissive: color, emissiveIntensity: 0.28, roughness: 0.55 }));
  body.position.y = 0.66;
  group.add(body);
  const wick = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.16, 6), new THREE.MeshBasicMaterial({ color: '#221a12' }));
  wick.position.y = 1.36;
  group.add(wick);
  const flame = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex, color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  flame.scale.set(1.3, 1.7, 1);
  flame.position.y = 1.62;
  group.add(flame);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex, color, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }));
  halo.scale.set(4.2, 4.2, 1);
  halo.position.y = 1.2;
  group.add(halo);
  const light = new THREE.PointLight(color, 5, 7, 1.8);
  light.position.y = 1.5;
  group.add(light);
  const head = new THREE.Object3D();
  head.position.y = 2.0;
  group.add(head);
  scene.add(group);
  return { name, color, group, head, flame, path, lines, said: 0 };
}

// ---------------------------------------------------------------------------------------------
// Minimap: concentric "layers" map (centre = where you are, outward = unexplored)
// ---------------------------------------------------------------------------------------------
function makeMinimap(slot: HTMLElement): (t: number) => void {
  const cv = document.createElement('canvas');
  slot.appendChild(cv);
  const g = cv.getContext('2d')!;
  const rng = mulberry(7);
  const rings = [0.2, 0.42, 0.64, 0.86];
  const rooms: { r: number; a: number; ring: number; c: string; seen: number }[] = [];
  rings.forEach((r, k) => {
    const n = 3 + k * 2;
    for (let i = 0; i < n; i++) {
      const d = Math.floor(rng() * DOOR_COLORS.length);
      rooms.push({ r, a: (i / n) * Math.PI * 2 + rng() * 0.4 + k, ring: k, c: DOOR_COLORS[d], seen: k === 0 ? 1 : k === 1 ? (rng() < 0.7 ? 1 : 0.4) : k === 2 ? (rng() < 0.3 ? 0.5 : 0.15) : 0.08 });
    }
  });
  let lastDraw = -1;
  return (t: number) => {
    if (t - lastDraw < 1 / 20) return;
    lastDraw = t;
    const w = slot.clientWidth;
    const hh = slot.clientHeight;
    if (!w || !hh) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (cv.width !== Math.round(w * dpr)) {
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(hh * dpr);
    }
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, hh);
    const cx = w / 2;
    const cy = hh / 2;
    const R = Math.min(w, hh) / 2 - 6;
    // grid
    g.strokeStyle = 'rgba(84,232,255,0.06)';
    g.lineWidth = 1;
    for (let x = (cx % 12); x < w; x += 12) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, hh); g.stroke(); }
    for (let y = (cy % 12); y < hh; y += 12) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    // rings
    rings.forEach((r, k) => {
      g.beginPath();
      g.arc(cx, cy, r * R, 0, Math.PI * 2);
      g.setLineDash(k > 1 ? [2, 5] : []);
      g.strokeStyle = `rgba(84,232,255,${0.42 - k * 0.09})`;
      g.stroke();
    });
    g.setLineDash([]);
    // corridors
    for (const a of rooms) {
      if (a.ring === 0) continue;
      let best = null as (typeof rooms)[number] | null;
      let bd = 1e9;
      for (const b of rooms) {
        if (b.ring !== a.ring - 1) continue;
        const d = Math.abs(Math.atan2(Math.sin(a.a - b.a), Math.cos(a.a - b.a)));
        if (d < bd) { bd = d; best = b; }
      }
      if (!best) continue;
      g.beginPath();
      g.moveTo(cx + Math.cos(a.a) * a.r * R, cy + Math.sin(a.a) * a.r * R);
      g.lineTo(cx + Math.cos(best.a) * best.r * R, cy + Math.sin(best.a) * best.r * R);
      g.strokeStyle = `rgba(200,225,255,${0.3 * Math.min(a.seen, best.seen) + 0.03})`;
      g.stroke();
    }
    // rooms
    for (const rm of rooms) {
      const x = cx + Math.cos(rm.a) * rm.r * R;
      const y = cy + Math.sin(rm.a) * rm.r * R;
      const s = rm.ring === 0 ? 4.5 : 3.5;
      g.globalAlpha = rm.seen;
      g.fillStyle = rm.seen > 0.3 ? rm.c : '#7e92ae';
      g.shadowColor = rm.c;
      g.shadowBlur = rm.seen > 0.9 ? 8 : 0;
      g.fillRect(x - s, y - s, s * 2, s * 2);
      g.shadowBlur = 0;
    }
    g.globalAlpha = 1;
    // you are here: pulsing centre
    const p = (t * 0.8) % 1;
    g.beginPath();
    g.arc(cx, cy, 4 + p * 14, 0, Math.PI * 2);
    g.strokeStyle = `rgba(255,204,77,${1 - p})`;
    g.lineWidth = 1.5;
    g.stroke();
    g.save();
    g.translate(cx, cy);
    g.rotate(t * 0.3);
    g.beginPath();
    g.moveTo(0, -6); g.lineTo(4.5, 5); g.lineTo(0, 2.5); g.lineTo(-4.5, 5); g.closePath();
    g.fillStyle = '#fff1c1';
    g.shadowColor = '#ffcc4d';
    g.shadowBlur = 10;
    g.fill();
    g.restore();
  };
}

// ---------------------------------------------------------------------------------------------
// Sound: tiny WebAudio blip synth so the demo audibly exercises setSound (starts on first input)
// ---------------------------------------------------------------------------------------------
function makeBlips(): { play: (name: string) => void; count: number; last: string[] } {
  let ctx: AudioContext | null = null;
  const st = { count: 0, last: [] as string[], play: (_n: string) => {} };
  const unlock = (): void => {
    if (ctx) return;
    try { ctx = new AudioContext(); } catch { ctx = null; }
  };
  window.addEventListener('pointerdown', unlock, { once: true });
  window.addEventListener('keydown', unlock, { once: true });
  const table: Record<string, [number, number, OscillatorType, number, number?]> = {
    type_tick: [1850, 0.018, 'square', 0.012],
    ui_hover: [1400, 0.03, 'sine', 0.03],
    ui_click: [900, 0.05, 'triangle', 0.07, 1300],
    ui_confirm: [660, 0.12, 'triangle', 0.08, 990],
    ui_back: [520, 0.1, 'triangle', 0.07, 330],
    ui_tab: [1100, 0.05, 'sine', 0.05],
    system_chime: [1320, 0.35, 'sine', 0.06, 1760],
    system_close: [700, 0.12, 'sine', 0.04, 350],
    toast: [980, 0.08, 'sine', 0.04],
    objective_complete: [784, 0.3, 'triangle', 0.08, 1175],
    timer_tick: [1600, 0.04, 'square', 0.025],
    timer_urgent: [2000, 0.06, 'square', 0.04],
    chat_pop: [1250, 0.035, 'sine', 0.02],
    currency_gain: [1500, 0.08, 'sine', 0.05, 2200],
    trait_ready: [1046, 0.2, 'triangle', 0.06, 1568],
  };
  st.play = (name: string) => {
    st.count++;
    st.last.push(name);
    if (st.last.length > 12) st.last.shift();
    if (!ctx) return;
    const k = name.startsWith('system_open') ? 'system_chime' : name;
    const d = table[k] ?? [880, 0.05, 'sine', 0.03];
    const t0 = ctx.currentTime;
    const o = ctx.createOscillator();
    const gn = ctx.createGain();
    o.type = d[2];
    o.frequency.setValueAtTime(d[0], t0);
    if (d[4]) o.frequency.exponentialRampToValueAtTime(d[4], t0 + d[1]);
    gn.gain.setValueAtTime(d[3], t0);
    gn.gain.exponentialRampToValueAtTime(0.0001, t0 + d[1]);
    o.connect(gn).connect(ctx.destination);
    o.start(t0);
    o.stop(t0 + d[1] + 0.02);
  };
  return st;
}

// ---------------------------------------------------------------------------------------------
// Demo content
// ---------------------------------------------------------------------------------------------
const TONE_SAMPLES: Record<SystemTone, { title: string; lines: string[] }> = {
  info: { title: 'Floor 1 — The Echo Nave', lines: ['You have entered 「The Echo Nave」.', 'Every sound you make will be *repeated*.'] },
  quest: { title: 'Hidden Quest', lines: ['Ring the three bells *in the order the Echo sang them*.', 'Reward: ███ ████ and a *Spark*.'] },
  warning: { title: 'Wax Running Low', lines: ['Your wick is guttering. Find a *Drip* before the flame fails.'] },
  danger: { title: 'The Well Is Closing', lines: ['The lid descends in *10 seconds*.', 'Climbers left below will ███████.'] },
  reward: { title: 'Trait Acquired', lines: ['「Split Wick」 — burn twice as bright, half as long.', '+40 Embers   +1 Spark'] },
  glitch: { title: 'Unauthorised Observer', lines: ['Something outside the tower is watching.', 'It has ██ names. Do not say any of them.'] },
  patron: { title: 'A Patron Takes Notice', lines: ['*The Lantern-Eyed* has wagered on you.', 'Do something worth watching.'] },
};

const RELICS: Omit<CardOpts, 'onClick'>[] = [
  { title: 'Tallow Stub', rarity: 'common', icon: 'candle', kicker: 'Relic', desc: '+10 max Wax. Humble, but it burns.', tags: ['Wax'], cost: { currency: 'embers', amount: 40 } },
  { title: 'Echo Bell', rarity: 'rare', icon: 'bell', kicker: 'Relic', desc: 'Your next shout is repeated twice, a heartbeat apart.', tags: ['Sound', 'Enigma'], cost: { currency: 'embers', amount: 95 } },
  { title: 'Split Wick', rarity: 'epic', icon: 'knot', kicker: 'Trait', desc: 'Burn twice as bright. Burn half as long.', tags: ['Flame'], cost: { currency: 'sparks', amount: 2 } },
  { title: 'Crown of Drips', rarity: 'mythic', icon: 'crown', kicker: 'Relic', desc: 'Every Drip you carry hardens into a sliver of Wax.', tags: ['Drips', 'Crown'], cost: { currency: 'sparks', amount: 5 } },
  { title: 'Oath of the Well', rarity: 'oath', icon: 'spiral', kicker: 'Oath', desc: 'The frog climbs. The sky widens. Carry nothing back down.', tags: ['Binding'] },
  { title: '█████ ████', rarity: 'rare', icon: 'eye', kicker: 'Sealed', desc: 'Found beyond the ██ Door. Not yet.', tags: ['Secret'], locked: true },
];

const CHAT: [string, string, string][] = [
  ['wickwatcher', 'this floor is so pretty :fire:', '#ff9a4a'],
  ['Lantern-Eyed', 'ring the LEFT bell first :eyes:', '#b388ff'],
  ['moth_enjoyer', 'pip is going to fall :skull: :skull:', '#6effc4'],
  ['ashling', ':gg: clean clear', '#4fc3f7'],
  ['wickwatcher', 'split wick run lets gooo :pog:', '#ff9a4a'],
  ['ninefold', 'that echo is SUS :sus:', '#ffd166'],
  ['moth_enjoyer', ':candle: :candle: :candle:', '#6effc4'],
];

function relicCards(onPick: (title: string) => void): HTMLElement {
  let selected: HTMLElement | null = null;
  const cards = RELICS.map((r) => {
    const el: HTMLElement = Card({
      ...r,
      onClick: () => {
        selected?.classList.remove('is-selected');
        el.classList.add('is-selected');
        selected = el;
        onPick(r.title);
      },
    });
    return el;
  });
  return Grid(cards, { min: 158, gap: 14 });
}

// ---------------------------------------------------------------------------------------------
export default async function demo(): Promise<void> {
  const params = new URLSearchParams(location.search);
  const state = params.get('state') ?? 'hero';
  const isTest = params.get('test') === '1';
  const app = document.getElementById('app') ?? document.body;

  const style = h('style', null, `
    .demo-traits { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 14px; }
    .demo-trait-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin: 2px 0 8px; font: 500 13px/1.3 var(--font-body); color: var(--text-2); }
    .demo-trait-row b { font: 700 12px/1 var(--font-mono); color: var(--text); letter-spacing: .02em; }
    .demo-settings { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 14px; }
    .demo-hint { display: inline-flex; align-items: center; gap: 6px; }
    .demo-foot-sp { flex: 1; }
  `);
  document.head.appendChild(style);

  // ---- three.js background
  const renderer = new THREE.WebGLRenderer({ antialias: !isTest, powerPreference: 'high-performance' });
  renderer.setPixelRatio(isTest ? 1 : Math.min(window.devicePixelRatio, 2));
  renderer.setSize(app.clientWidth || innerWidth, app.clientHeight || innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  app.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, (app.clientWidth || innerWidth) / (app.clientHeight || innerHeight), 0.1, 400);
  const rng = mulberry(20260928);
  const world = buildWorld(scene, rng);
  const flameTex = glowTexture('rgba(255,255,255,1)', 'rgba(255,255,255,0.5)');

  const circle = (r: number, speed: number, phase: number) => (t: number, out: THREE.Vector3): void => {
    out.set(Math.cos(t * speed + phase) * r, 0, Math.sin(t * speed + phase) * r);
  };
  const actors: Actor[] = [
    makeActor(scene, 'Moss', '#ffb35a', flameTex, circle(5.8, 0.22, 0.9), ['wait for me!!', 'who rang that bell?', 'I hear it too…']),
    makeActor(scene, 'Pip', '#6ee7ff', flameTex, circle(3.6, -0.3, 2.4), ["I'm NOT stepping on that", 'left bell. trust me.', 'my wick is shaking']),
    makeActor(scene, 'Juniper', '#b388ff', flameTex, circle(8.2, 0.12, 4.1), ['the rings are moving', 'up is out. out is up.']),
    makeActor(scene, 'The Echo', '#ff5a7a', flameTex, (t, out) => out.set(-6 + Math.sin(t * 0.2) * 4, 0, -34), ['…the Echo is copying us…', '…who rang that bell?…']),
  ];
  // one speaker always standing just behind the camera: demonstrates edge clamping + arrow
  const behind = makeActor(scene, 'Vesper', '#8bd450', flameTex, () => {}, ['over here! behind you', "don't leave me in the well"]);
  actors.push(behind);

  // ---- UI
  const ui = new Ui(app);
  ui.chat.setViewers(1284);
  const blips = makeBlips();
  ui.setSound((n) => blips.play(n));
  const minimap = makeMinimap(ui.minimapSlot);
  const choices: (number | null)[] = [];
  const log: string[] = [];

  let traitState: TraitSlotInfo[] = [
    { id: 'dash', name: 'Gutter Dash', icon: 'wind', cooldown01: 0, key: 'Digit1', desc: 'Burst forward trailing sparks.' },
    { id: 'bell', name: 'Echo Bell', icon: 'bell', cooldown01: 0.62, key: 'Digit2', desc: 'Shout; the room shouts back.' },
    { id: 'wick', name: 'Split Wick', icon: 'knot', cooldown01: 0.18, key: 'Digit3', charges: 2, desc: 'Burn twice as bright, half as long.' },
    { id: 'eye', name: 'Lantern Eye', icon: 'eye', cooldown01: 0, key: 'Digit4', desc: 'Reveal hidden doors for 4 s.' },
  ];
  const cdSpeed: Record<string, number> = { dash: 0, bell: 0.08, wick: 0.11, eye: 0 };

  ui.registerScreen('altar', (props) => {
    let tabs: TabsHandle | null = null;
    const traitsPane = (): HTMLElement => h('div.demo-traits', null,
      ...traitState.map((t) => Panel({ title: t.name, kicker: `Slot ${t.key.replace('Digit', '')}`, tone: 'info' },
        h('div.demo-trait-row', null, h('span', null, t.desc ?? ''), KeyCap(t.key, { size: 'sm' })),
        ProgressBar(1 - t.cooldown01, { label: `${t.name} readiness`, segments: 8 }).el)),
      Panel({ title: 'Wax Reserve', kicker: 'Vital', tone: 'warning' },
        h('div.demo-trait-row', null, h('span', null, 'Your candle burns while you climb.'), h('b', null, '72 / 100')),
        ProgressBar(0.72, { tone: 'warning', label: 'Wax', segments: 10 }).el));
    const settingsPane = (): HTMLElement => h('div.demo-settings', null,
      Panel({ title: 'Readability', kicker: 'Accessibility', tone: 'info' },
        Slider({ label: 'Text size', min: 75, max: 160, step: 5, value: 100, format: (v) => `${v}%`, onInput: (v) => ui.setTextScale(v / 100) }).el,
        Toggle({ label: 'Reduce motion', value: false, onChange: (v) => ui.setReducedMotion(v) }).el,
        Toggle({ label: 'Show HUD', value: true, onChange: (v) => ui.setHud(v) }).el),
      Panel({ title: 'System Voice', kicker: 'Audio', tone: 'patron' },
        Slider({ label: 'Typing ticks', min: 0, max: 100, value: 60, format: (v) => `${v}` }).el,
        Slider({ label: 'Chime volume', min: 0, max: 100, value: 80, format: (v) => `${v}` }).el,
        Toggle({ label: 'Patron chat', value: true, onChange: (v) => ui.chat.el.classList.toggle('is-off', !v) }).el));
    tabs = Tabs([
      { id: 'relics', label: 'Relics', icon: 'gem', badge: RELICS.length, render: () => relicCards((t) => ui.toast(`${t} marked for offering`, 'quest')) },
      { id: 'traits', label: 'Traits', icon: 'bolt', render: traitsPane },
      { id: 'settings', label: 'Settings', icon: 'gear', render: settingsPane },
    ], { active: typeof props.tab === 'string' ? props.tab : 'relics' });
    const foot = [
      h('span.demo-hint', null, KeyCap('KeyQ', { size: 'sm' }), KeyCap('KeyE', { size: 'sm' }), 'Switch tab'),
      h('span.demo-hint', null, KeyCap('Enter', { size: 'sm' }), 'Select'),
      h('i.demo-foot-sp'),
      Button({ label: 'Leave', variant: 'ghost', size: 'sm', onClick: () => ui.closeScreen() }),
      Button({ label: 'Offer to the Well', variant: 'primary', icon: 'candle', size: 'sm', onClick: () => { ui.closeScreen(); ui.system({ tone: 'reward', title: 'Offering Accepted', lines: ['The Well remembers your gift.'] }); } }),
    ];
    const el = ScreenFrame({ title: 'Altar of the Well', kicker: 'Floor 1 · Sanctum', kr: '제단', tone: 'quest', onClose: () => ui.closeScreen() }, tabs.el, foot);
    return { el, onClose: () => log.push('altar closed') };
  });

  // ---- debug API
  const sys = (tone: SystemTone, extra: Partial<{ seconds: number; wait: boolean; choices: string[] }> = {}): Promise<number | null> =>
    ui.system({ tone, ...TONE_SAMPLES[tone], ...extra });
  const debug = {
    ui,
    openTone: (tone: SystemTone, seconds = 30) => { void sys(tone, { seconds }); },
    allTones: (seconds = 40) => { ui.windows.maxVisible = 7; for (const t of TONES) void sys(t, { seconds }); },
    choice: () => {
      void ui.system({
        tone: 'quest', title: 'Dilemma',
        lines: ['A lantern burns alone on the altar.', 'Take it, and *the Echo* will follow you up.'],
        choices: ['Take the lantern', 'Leave it for the next climber', 'Blow it out  ███'],
      }).then((r) => { choices.push(r); ui.toast(r === null ? 'You walked away' : `Chose option ${r + 1}`, r === 0 ? 'warning' : 'info'); });
    },
    toast: (text = '+12 Embers', tone: SystemTone = 'reward') => ui.toast(text, tone),
    objective: (text: string | null = 'Ring the three bells in order', sub = '0 / 3 bells · the Echo repeats what it hears') => ui.objective(text, sub),
    complete: (next: string | null = 'Climb to the Crown Door', sub = 'Floor 1 · the way up is open') => ui.completeObjective(next, sub),
    timer: (s: number | null = 74, label = 'Bell Trial') => ui.timer(s, label),
    prompt: (text: string | null = 'Ring the bell', key = 'KeyE') => ui.prompt(text, key),
    hold: (p: number | null) => ui.promptHold(p),
    vital: (v: number) => ui.setVital(v),
    money: (id: string, delta: number) => ui.setCurrency(id, (ui.hud.currency(id) ?? 0) + delta),
    traits: (cds?: number[]) => {
      if (cds) traitState = traitState.map((t, i) => ({ ...t, cooldown01: cds[i] ?? t.cooldown01 }));
      ui.setTraits(traitState);
    },
    useTrait: (i: number) => {
      const t = traitState[i];
      if (!t || t.cooldown01 > 0) return;
      traitState = traitState.map((x, k) => (k === i ? { ...x, cooldown01: 1 } : x));
      cdSpeed[t.id] = 0.25;
      ui.pulseTrait(t.id);
      ui.setTraits(traitState);
    },
    bubble: (who = 'Moss', text = 'who rang that bell?') => {
      const a = actors.find((x) => x.name === who) ?? actors[0];
      ui.bubble(a.head.position, text, { who: a.name, color: a.color, object: a.head });
    },
    allBubbles: () => { for (const a of actors) ui.bubble(a.head.position, a.lines[0], { who: a.name, color: a.color, object: a.head, seconds: 30 }); },
    chat: (n = CHAT.length) => { for (let i = 0; i < n; i++) { const c = CHAT[i % CHAT.length]; ui.patronChat(c[0], c[1], c[2]); } },
    screen: (tab = 'relics') => ui.screen('altar', { tab }),
    closeScreen: () => ui.closeScreen(),
    modal: () => ui.modal({
      title: 'Abandon the Climb?', tone: 'danger',
      body: 'Your candle will be snuffed and your Embers left in the well. Patrons will remember.',
      actions: [{ label: 'Stay', value: 'stay', variant: 'ghost', hotkey: 'Escape' }, { label: 'Abandon', value: 'quit', variant: 'danger', hotkey: 'Enter' }],
    }).then((v) => { log.push(`modal:${v}`); }),
    hud: (v: boolean) => ui.setHud(v),
    log: () => ui.systemLog(),
    /** Pin the prompt over an actor ('spire' = the knot at the well's heart), or null for the HUD slot. */
    anchor: (who: string | null = 'spire') => {
      if (who === null) ui.promptAnchor(null);
      else if (who === 'spire') ui.promptAnchor(world.spire, 3.5);
      else ui.promptAnchor(actors.find((a) => a.name === who)?.group ?? null, 2.2);
    },
    quality: (q: 'high' | 'low') => ui.setQuality(q),
    skip: () => ui.windows.skipAll(),
    pick: (i: number) => ui.windows.pick(i),
    confirm: () => ui.confirm(),
    reduced: (v: boolean) => ui.setReducedMotion(v),
    textScale: (s: number) => ui.setTextScale(s),
    clear: () => ui.clearTransient(),
    camAngle: (a: number | null) => { camOverride = a; },
    /** Fast-forward world + UI by `seconds` of sim time (deterministic captures). */
    advance: (_seconds: number, _step?: number): number => 0,
  };

  let frames = 0;
  let fps = 0;
  let fpsAcc = 0;
  let fpsN = 0;
  let camOverride: number | null = null;
  const tfw = window as unknown as { __TF?: Record<string, unknown> };
  const tf = (tfw.__TF ??= {});
  tf.report = () => ({
    demo: 'ui', state, frames, simTime: Number(t.toFixed(2)), fps: Math.round(fps), fontsLoaded: displayFontLoaded(),
    sounds: { count: blips.count, last: blips.last.slice(-6) }, choices, log,
    ...ui.snapshot(),
  });
  tf.debug = Object.assign((tf.debug as Record<string, unknown> | undefined) ?? {}, debug);
  tf.ui = ui;

  // ---- baseline HUD
  const baseHud = (): void => {
    ui.room('1E · The Echo Nave');
    ui.setVital(72);
    ui.setCurrency('embers', 128);
    ui.setCurrency('drips', 12);
    ui.setCurrency('sparks', 3);
    ui.setTraits(traitState);
    debug.objective();
    debug.timer();
    debug.prompt();
  };

  // ---- scenario timeline (seconds of UI time)
  type Ev = [number, () => void];
  const timeline: Ev[] = [];
  const at = (t: number, fn: () => void): void => { timeline.push([t, fn]); };
  switch (state) {
    case 'clean':
      baseHud();
      break;
    case 'tones':
      baseHud();
      ui.windows.maxVisible = 4;
      (['info', 'quest', 'warning', 'danger'] as SystemTone[]).forEach((t, i) => at(0.2 + i * 0.35, () => debug.openTone(t, 60)));
      break;
    case 'tones2':
      baseHud();
      ui.windows.maxVisible = 4;
      (['reward', 'glitch', 'patron'] as SystemTone[]).forEach((t, i) => at(0.2 + i * 0.35, () => debug.openTone(t, 60)));
      at(1.3, debug.choice);
      break;
    case 'choice':
      baseHud();
      at(0.2, debug.choice);
      at(0.4, () => debug.chat(4));
      break;
    case 'screen':
      baseHud();
      debug.chat(4);
      at(0.3, () => debug.screen(params.get('tab') ?? 'relics'));
      break;
    case 'modal':
      baseHud();
      at(0.3, () => void debug.modal());
      break;
    case 'edge':
      baseHud();
      ui.prompt(null);
      at(0.1, debug.allBubbles);
      break;
    case 'urgent':
      baseHud();
      ui.timer(9.6, 'The Lid Descends');
      ui.setVital(19);
      at(0.2, () => debug.openTone('danger', 60));
      at(0.4, () => ui.toast('Wax −8', 'danger'));
      at(0.6, () => ui.toast('Pip fell into the well', 'warning'));
      break;
    case 'complete':
      baseHud();
      at(0.5, () => debug.complete());
      at(0.6, () => ui.toast('Bell Trial cleared', 'reward'));
      at(0.7, () => ui.setCurrency('embers', 168));
      break;
    case 'log':
      baseHud();
      ui.windows.maxVisible = 5;
      (['info', 'quest', 'reward', 'glitch'] as SystemTone[]).forEach((tn, i) => at(0.1 + i * 0.1, () => debug.openTone(tn, 0.5)));
      at(0.5, debug.choice);
      at(2, () => ui.windows.pick(1));
      at(4.5, debug.log);
      break;
    case 'anchor':
      baseHud();
      debug.anchor('spire');
      at(0.3, () => debug.bubble('Pip', 'left bell. trust me.'));
      at(0.4, () => debug.chat(3));
      break;
    case 'lowfx':
      baseHud();
      debug.quality('low');
      at(0.2, () => debug.openTone('info', 60));
      at(0.4, () => debug.openTone('danger', 60));
      break;
    default: // hero
      baseHud();
      debug.anchor('spire');
      at(0.2, () => debug.openTone('info', 14));
      at(0.7, () => debug.openTone('reward', 14));
      at(1.1, debug.choice);
      at(0.5, () => ui.toast('Pip joined the party', 'info'));
      at(0.9, () => ui.toast('+12 Embers', 'reward'));
      at(1.2, () => ui.toast('The Echo is listening', 'glitch'));
      at(0.3, () => debug.chat(6));
      at(0.4, () => debug.bubble('Moss', 'who rang that bell?'));
      at(0.8, () => debug.bubble('Pip', "I'm NOT stepping on that"));
      at(1.0, () => debug.bubble('The Echo', '…who rang that bell?…'));
      at(1.4, () => debug.bubble('Vesper', 'over here! behind you'));
      break;
  }
  timeline.sort((a, b) => a[0] - b[0]);

  // ---- resize
  const resize = (): void => {
    const w = app.clientWidth || innerWidth;
    const hh = app.clientHeight || innerHeight;
    renderer.setSize(w, hh);
    camera.aspect = w / hh;
    camera.updateProjectionMatrix();
  };
  window.addEventListener('resize', resize);

  // ---- ambient life when not in a scripted test
  let nextChatter = 6;
  let nextChat = 3;

  const tmp = new THREE.Vector3();
  const back = new THREE.Vector3();
  let last = performance.now();
  let t = 0;
  /** One simulation step (world + UI). Rendering is separate so tests can fast-forward. */
  const simulate = (dt: number): void => {
    t += dt;
    while (timeline.length && timeline[0][0] <= t) timeline.shift()![1]();

    // camera: slow sway around the well, looking down into it
    const ang = camOverride ?? (0.35 + Math.sin(t * 0.08) * 0.25);
    camera.position.set(Math.sin(ang) * 14.5, 6.2 + Math.sin(t * 0.21) * 0.3, Math.cos(ang) * 14.5);
    camera.lookAt(0, 1.8, 0);
    camera.updateMatrixWorld();

    // actors
    for (const a of actors) {
      if (a === behind) continue;
      a.path(t, tmp);
      a.group.position.set(tmp.x, Math.abs(Math.sin(t * 3 + a.name.length)) * 0.08, tmp.z);
      a.flame.scale.set(1.2 + Math.sin(t * 13 + a.name.length) * 0.08, 1.65 + Math.sin(t * 17) * 0.12, 1);
    }
    back.set(0, 0, 1).applyQuaternion(camera.quaternion);
    behind.group.position.set(camera.position.x + back.x * 3.2 - 1.6, 0, camera.position.z + back.z * 3.2 + 0.4);
    world.rings.forEach((r) => { r.rotation.z += (r.userData.speed as number) * dt; });
    world.beams.forEach((b) => { (b.material as THREE.SpriteMaterial).opacity = 0.35 + 0.25 * Math.sin(t * 1.3 + (b.userData.phase as number)); });
    const knot = world.spire.userData.knot as THREE.Mesh;
    knot.rotation.y += dt * 0.35;
    const motes = scene.getObjectByName('motes');
    if (motes) motes.rotation.y += dt * 0.02;

    // trait cooldowns tick down
    let changed = false;
    traitState = traitState.map((tr) => {
      const sp = cdSpeed[tr.id] ?? 0;
      if (tr.cooldown01 <= 0 || sp <= 0) return tr;
      changed = true;
      const cd = Math.max(0, tr.cooldown01 - dt * sp);
      return { ...tr, cooldown01: cd };
    });
    if (changed) ui.setTraits(traitState);

    if (!isTest && state === 'hero') {
      nextChatter -= dt;
      nextChat -= dt;
      if (nextChatter <= 0) {
        nextChatter = 4 + Math.random() * 4;
        const a = actors[Math.floor(Math.random() * actors.length)];
        a.said = (a.said + 1) % a.lines.length;
        ui.bubble(a.head.position, a.lines[a.said], { who: a.name, color: a.color, object: a.head });
      }
      if (nextChat <= 0) {
        nextChat = 1.5 + Math.random() * 3;
        const c = CHAT[Math.floor(Math.random() * CHAT.length)];
        ui.patronChat(c[0], c[1], c[2]);
      }
    }

    ui.update(dt, camera);
  };
  debug.advance = (seconds: number, step = 1 / 30): number => {
    for (let k = 0; k < Math.round(seconds / step); k++) simulate(step);
    minimap(t);
    renderer.render(scene, camera);
    return Number(t.toFixed(2));
  };
  // tf.debug received a copy of the placeholder above; publish the real one.
  (tf.debug as Record<string, unknown>).advance = debug.advance;
  // &freeze=1 (harness captures): only advance() moves time; frames re-render only when it did.
  const frozen = params.get('freeze') === '1';
  let renderedAt = -1;
  const loop = (now: number): void => {
    const dt = Math.min(0.1, Math.max(0, (now - last) / 1000));
    last = now;
    frames++;
    fpsAcc += dt;
    fpsN++;
    if (fpsAcc > 0.5) { fps = fpsN / fpsAcc; fpsAcc = 0; fpsN = 0; }
    if (frozen) ui.update(0, camera);
    else simulate(dt);
    if (!frozen || renderedAt !== t) {
      renderedAt = t;
      minimap(t);
      renderer.render(scene, camera);
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  // keyboard sugar for humans: 1-4 use traits (when the UI is not capturing), H toggles HUD, M opens the altar
  window.addEventListener('keydown', (e) => {
    if (ui.capturingInput || e.repeat) return;
    const m = /^Digit([1-4])$/.exec(e.code);
    if (m) debug.useTrait(Number(m[1]) - 1);
    else if (e.code === 'KeyH') ui.setHud(!ui.hudShown);
    else if (e.code === 'KeyM') debug.screen();
    else if (e.code === 'KeyC') debug.choice();
    else if (e.code === 'KeyT') debug.allTones(12);
    else if (e.code === 'KeyL' || e.code === 'Tab') { e.preventDefault(); debug.log(); }
  });
}
