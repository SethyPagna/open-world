/**
 * ?demo=audio : Audio Lab. Every SFX recipe as a button (grouped by category), every music track
 * with live intensity layering, loops, mixer, a positional pad, the System voice and Wick babble,
 * and a "well to space" radial spectrum (bass in the well at the centre, highs out among the
 * stars, time sweeping around).
 * ?test=1 renders 20 representative SFX, 2 babble lines, 4 s of 3 tracks and 2 loops through the
 * real master chain in OfflineAudioContexts and reports peak / rms / NaN / clipping per render.
 * &all=1 renders everything; &view=results shows the render sheet full-screen with spectrograms;
 * &fonts=1 loads the Google Fonts in test mode too (skipped by default so the report never depends
 * on the network).
 */
import {
  AudioEngine, renderBabbleOffline, renderLoopOffline, renderOffline, renderSfxOffline, renderTrackOffline, SPACES,
  type LoopHandle, type RenderMetrics, type RenderResult,
} from '../core/audio/audio.ts';
import { LOOP_NAMES, LOOPS, REQUIRED_SFX, SFX, SFX_NAMES, type SfxCategory } from '../core/audio/sfx.ts';
import { stemGains, TRACK_NAMES, TRACKS } from '../core/audio/music.ts';
import { Prng, setSynthRandom } from '../core/audio/synth.ts';
import { FONT, loadFonts } from '../ui/fonts.ts';

interface TF { report?: () => object; debug?: Record<string, unknown> }

const CAT_ORDER: readonly SfxCategory[] = ['ui', 'system', 'reward', 'move', 'action', 'world', 'puzzle', 'magic', 'creature', 'social', 'ambient', 'motif'];
// GDD 13.3: System cyan, gold, crimson, and the door-letter accents (A ember, B blue, C green, E violet, Crown white-gold)
const CAT_COLOR: Record<SfxCategory, string> = {
  ui: '#5CE1E6', system: '#9FD8FF', reward: '#FFD76A', move: '#5DFFC0', action: '#FF6B2C', world: '#D9B38C',
  puzzle: '#4FC3F7', magic: '#B388FF', creature: '#8BD450', social: '#FF5FA2', ambient: '#9FB4D0', motif: '#FFF1C1',
};
const CAT_LABEL: Record<SfxCategory, string> = {
  ui: 'Interface', system: 'System', reward: 'Rewards', move: 'Movement', action: 'Action', world: 'World',
  puzzle: 'Puzzles', magic: 'Magic', creature: 'Creatures', social: 'Crowd & Votes', ambient: 'Ambience', motif: 'Door motifs',
};
const VOICE_COLOR = '#FFB86B';
const RENDER_THREADS = 3;
const TEST_SFX = [
  'ui_click', 'type_tick', 'system_chime', 'reward_big', 'coin', 'jump', 'land_hard', 'footstep_stone', 'lash', 'splash_big',
  'door_rumble', 'shatter', 'fork_mid', 'resonance_chord', 'bell_toll', 'magic_up', 'monster_growl', 'crowd_cheer',
  'betrayal_sting', 'clear_sting',
];
const TEST_TRACKS = ['title', 'room_chase', 'boss'];
const TEST_LOOPS = ['fire', 'wind'];
const TEST_BABBLE: readonly { text: string; f0: number; resolve?: boolean }[] = [
  { text: 'Knot with me, I have the key.', f0: 300 },
  { text: 'LIAR!', f0: 380 },
];
/** GDD 2.3 sample lines, with the sting each one opens on. */
const SYSTEM_LINES: readonly { head: string; body: string; sting: string }[] = [
  { head: 'WELCOME, WICK', body: 'You have been lit. Please do not go out.', sting: 'system_chime' },
  { head: 'FLOOR 1', body: 'Four doors. Every door latches. Choose your company.', sting: 'quest_accept' },
  { head: 'KNOT TIED', body: 'Moss and you are bound. The Tower takes note.', sting: 'knot_tie' },
  { head: 'UNIQUE TITLE ACQUIRED', body: '「Slime-Warden」. The Tower is mildly impressed.', sting: 'title_fanfare' },
  { head: 'THE TIDE RISES', body: 'Rooms still sealed will feel the pressure.', sting: 'tide_swell' },
  { head: 'HIDDEN PIECE', body: 'You were not supposed to find that. Keep it.', sting: 'hidden_piece' },
  { head: 'THE CROWN', body: 'Climb together. Fall alone.', sting: 'bell_toll' },
];
/** Wick babble samples (GDD 15.3): one per phrase type, plus the Resolve tell. */
const BABBLE_LINES: readonly { label: string; text: string; f0: number; resolve?: boolean }[] = [
  { label: 'say', text: 'Knot with me, I have the key.', f0: 300 },
  { label: 'ask', text: 'Who lit the fork?', f0: 340 },
  { label: 'shout', text: 'LIAR! Help!', f0: 380 },
  { label: 'sorry', text: 'Sorry, sorry...', f0: 230 },
  { label: 'resolve tell', text: 'I would never cut a knot.', f0: 300, resolve: true },
];
const SPACE_FOR: Record<string, string> = { well_ambient: 'well', sky_ambient: 'sky', space_ambient: 'space', boss: 'hall', reveal: 'hall' };

// ---------------------------------------------------------------------------------------------
// tiny DOM helper
// ---------------------------------------------------------------------------------------------
type Kids = (Node | string | null | undefined | false)[];
function el<K extends keyof HTMLElementTagNameMap>(tag: K, props: Record<string, unknown> = {}, kids: Kids = []): HTMLElementTagNameMap[K] {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'class') n.className = String(v);
    else if (k === 'style') n.style.cssText = String(v);
    else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2), v as EventListener);
    else if (k in n && typeof v !== 'string') (n as unknown as Record<string, unknown>)[k] = v;
    else n.setAttribute(k, String(v));
  }
  for (const c of kids) if (c !== null && c !== undefined && c !== false) n.append(c);
  return n;
}

// ---------------------------------------------------------------------------------------------
// colour + FFT helpers (spectrograms)
// ---------------------------------------------------------------------------------------------
const STOPS: [number, [number, number, number]][] = [
  [0, [8, 10, 24]], [0.28, [52, 30, 110]], [0.52, [30, 118, 190]], [0.72, [92, 225, 230]], [0.88, [255, 215, 106]], [1, [255, 246, 228]],
];
function heat(t: number): [number, number, number] {
  const k = Math.min(1, Math.max(0, t));
  for (let i = 1; i < STOPS.length; i++) {
    const [b, cb] = STOPS[i]!;
    const [a, ca] = STOPS[i - 1]!;
    if (k <= b) {
      const f = (k - a) / (b - a);
      return [ca[0] + (cb[0] - ca[0]) * f, ca[1] + (cb[1] - ca[1]) * f, ca[2] + (cb[2] - ca[2]) * f];
    }
  }
  return STOPS[STOPS.length - 1]![1];
}

function fftMag(re: Float64Array, im: Float64Array): void {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j]!, re[i]!];
      [im[i], im[j]] = [im[j]!, im[i]!];
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wr = Math.cos(ang);
    const wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1;
      let ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const ar = re[i + k]!;
        const ai = im[i + k]!;
        const br = re[i + k + len / 2]! * cr - im[i + k + len / 2]! * ci;
        const bi = re[i + k + len / 2]! * ci + im[i + k + len / 2]! * cr;
        re[i + k] = ar + br;
        im[i + k] = ai + bi;
        re[i + k + len / 2] = ar - br;
        im[i + k + len / 2] = ai - bi;
        const t = cr * wr - ci * wi;
        ci = cr * wi + ci * wr;
        cr = t;
      }
    }
  }
}

function drawSpectrogram(cv: HTMLCanvasElement, data: Float32Array, sr: number): void {
  const W = cv.width;
  const H = cv.height;
  const g = cv.getContext('2d');
  if (!g) return;
  const N = 1024;
  const win = new Float64Array(N);
  for (let i = 0; i < N; i++) win[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (N - 1));
  const img = g.createImageData(W, H);
  const re = new Float64Array(N);
  const im = new Float64Array(N);
  const f0 = 40;
  const f1 = Math.min(18000, sr / 2);
  const col = new Float64Array(H);
  for (let x = 0; x < W; x++) {
    const c = Math.floor((x / W) * Math.max(1, data.length - N));
    for (let i = 0; i < N; i++) {
      re[i] = (data[c + i] ?? 0) * win[i]!;
      im[i] = 0;
    }
    fftMag(re, im);
    for (let y = 0; y < H; y++) {
      const f = f0 * Math.pow(f1 / f0, 1 - y / (H - 1));
      const b = Math.min(N / 2 - 1, Math.max(1, Math.round((f / sr) * N)));
      const m = Math.hypot(re[b]!, im[b]!) / (N / 4);
      col[y] = 20 * Math.log10(m + 1e-9);
    }
    for (let y = 0; y < H; y++) {
      const [r, gg, bb] = heat((col[y]! + 90) / 80);
      const o = (y * W + x) * 4;
      img.data[o] = r;
      img.data[o + 1] = gg;
      img.data[o + 2] = bb;
      img.data[o + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
}

function drawWave(cv: HTMLCanvasElement, data: Float32Array): void {
  const g = cv.getContext('2d');
  if (!g) return;
  const W = cv.width;
  const H = cv.height;
  g.clearRect(0, 0, W, H);
  g.fillStyle = 'rgba(92,225,230,0.75)';
  const step = data.length / W;
  for (let x = 0; x < W; x++) {
    let mn = 0;
    let mx = 0;
    const a = Math.floor(x * step);
    const b = Math.min(data.length, Math.floor((x + 1) * step));
    for (let i = a; i < b; i++) {
      const v = data[i]!;
      if (v < mn) mn = v;
      if (v > mx) mx = v;
    }
    const y0 = H / 2 - mx * (H / 2);
    const y1 = H / 2 - mn * (H / 2);
    g.fillRect(x, y0, 1, Math.max(1, y1 - y0));
  }
  g.fillStyle = 'rgba(255,61,110,0.9)';
  g.fillRect(0, 0, W, 1);
  g.fillRect(0, H - 1, W, 1);
}

// ---------------------------------------------------------------------------------------------
// styles
// ---------------------------------------------------------------------------------------------
// GDD 13.3 / 14.2 / 14.5: System navy + cyan, gold, crimson; Fraunces display, Nunito body, JetBrains Mono System text
const CSS = `
.al{--ink:#0E0B10;--glass:rgba(11,22,48,.80);--glass2:rgba(8,14,32,.92);--hair:rgba(120,215,235,.16);--text:#F4EDE3;--t2:#BCC8D8;--t3:#7D8BA3;
--cyan:#5CE1E6;--gold:#FFD76A;--crimson:#FF3D6E;--mint:#5DFFC0;--violet:#B388FF;
--fd:${FONT.display};--fb:${FONT.body};--fm:${FONT.mono};
position:fixed;inset:0;color:var(--text);font:12px/1.35 var(--fb);overflow:hidden;
background:
 radial-gradient(circle at 50% 118%, rgba(255,215,106,.10) 0 9%, transparent 9.2%),
 repeating-radial-gradient(circle at 50% 118%, rgba(92,225,230,.05) 0 1px, transparent 1px 64px),
 radial-gradient(ellipse at 50% 120%, #10204a 0%, #0a1230 46%, #0E0B10 82%);
display:grid;grid-template-rows:auto 1fr;gap:10px;padding:12px 14px;box-sizing:border-box}
.al *{box-sizing:border-box}
.al::after{content:"";position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(0deg,rgba(255,255,255,.018) 0 1px,transparent 1px 3px);mix-blend-mode:screen}
.al-stars{position:absolute;inset:0;pointer-events:none;background-image:
 radial-gradient(1px 1px at 12% 14%,#fff8 50%,transparent 51%),radial-gradient(1px 1px at 33% 6%,#fff6 50%,transparent 51%),
 radial-gradient(1.5px 1.5px at 71% 11%,#fff9 50%,transparent 51%),radial-gradient(1px 1px at 88% 23%,#fff7 50%,transparent 51%),
 radial-gradient(1px 1px at 55% 3%,#fff5 50%,transparent 51%),radial-gradient(1px 1px at 94% 5%,#fff6 50%,transparent 51%),
 radial-gradient(1px 1px at 4% 31%,#fff5 50%,transparent 51%),radial-gradient(1.5px 1.5px at 23% 27%,#fff4 50%,transparent 51%)}
.al-head{display:flex;align-items:center;gap:14px;position:relative;z-index:1}
.al-brand{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}
.al-brand b{font:800 23px/1 var(--fd);letter-spacing:.06em;color:var(--gold);text-shadow:0 0 18px rgba(255,215,106,.45)}
.al-brand span{font:600 12px/1 var(--fm);letter-spacing:.24em;text-transform:uppercase;color:var(--cyan);text-shadow:0 0 10px rgba(92,225,230,.6)}
.al-brand small{flex-basis:100%;font:500 9.5px/1.2 var(--fm);letter-spacing:.16em;color:var(--t3);text-transform:uppercase}
.al-pills{display:flex;gap:6px;margin-left:auto;flex-wrap:wrap;justify-content:flex-end}
.al-pill{font:500 10px/1 var(--fm);padding:6px 9px;border:1px solid var(--hair);background:var(--glass2);color:var(--t2);letter-spacing:.02em;white-space:nowrap}
.al-pill i{font-style:normal;color:var(--text)}
.al-pill.on{border-color:rgba(93,255,192,.5);color:var(--mint)} .al-pill.warn{border-color:rgba(255,61,110,.6);color:var(--crimson)}
.al-main{display:grid;grid-template-columns:minmax(0,1.08fr) minmax(0,1fr) 300px;gap:10px;min-height:0;position:relative;z-index:1}
.al-panel{position:relative;background:linear-gradient(180deg,var(--glass),var(--glass2));border:1px solid var(--hair);padding:10px 11px;min-height:0;display:flex;flex-direction:column;
 box-shadow:inset 0 1px 0 rgba(160,230,255,.08),0 12px 40px rgba(0,0,0,.45)}
.al-panel::before,.al-panel::after{content:"";position:absolute;width:12px;height:12px;border:2px solid var(--tone,var(--cyan));pointer-events:none;filter:drop-shadow(0 0 5px var(--tone,var(--cyan)))}
.al-panel::before{top:-2px;left:-2px;border-right:0;border-bottom:0}
.al-panel::after{bottom:-2px;right:-2px;border-left:0;border-top:0}
.al-h{display:flex;align-items:baseline;gap:8px;font:600 11px/1 var(--fm);letter-spacing:.12em;text-transform:uppercase;color:var(--tone,var(--cyan));margin:0 0 8px;white-space:nowrap}
.al-h::before{content:"[";opacity:.6} .al-h::after{content:"]";opacity:.6;order:1}
.al-h span{order:2;min-width:0;font:400 9px/1 var(--fm);letter-spacing:0;color:var(--t3);text-transform:none;overflow:hidden;text-overflow:ellipsis}
.al-scroll{overflow:auto;min-height:0;scrollbar-width:thin;scrollbar-color:rgba(92,225,230,.3) transparent}
.al-cat{margin:0 0 7px}
.al-cat h4{margin:0 0 4px;font:600 9.5px/1 var(--fm);letter-spacing:.14em;text-transform:uppercase;color:var(--c);display:flex;gap:6px;align-items:center}
.al-cat h4::before{content:"";width:6px;height:6px;background:var(--c);box-shadow:0 0 8px var(--c);transform:rotate(45deg)}
.al-cat h4 em{font:400 9px/1 var(--fm);color:var(--t3);font-style:normal;letter-spacing:0}
.al-chips{display:flex;flex-wrap:wrap;gap:3px}
.al-chip{font:500 9.5px/1 var(--fm);color:var(--t2);background:rgba(255,255,255,.028);border:1px solid rgba(150,215,255,.12);border-left:2px solid var(--c);padding:4px 6px 4px 5px;cursor:pointer;transition:background .12s,color .12s,transform .08s}
.al-chip:hover{background:rgba(92,225,230,.12);color:var(--text)}
.al-chip.hit{background:var(--c);color:#0E0B10;transform:translateY(-1px);box-shadow:0 0 14px var(--c)}
.al-chip.req::after{content:"";display:inline-block;width:3px;height:3px;margin-left:4px;vertical-align:middle;background:var(--c);opacity:.7}
.al-chip q{quotes:"\\201C" "\\201D";color:var(--text);font-family:var(--fb);font-weight:600}
.al-viz{position:relative;flex:0 0 auto}
.al-viz canvas{display:block;width:100%;height:auto;aspect-ratio:1.9}
.al-sys{position:relative;margin:8px 2px 2px;min-height:64px;padding:8px 12px 9px;background:rgba(11,22,48,.92);border:2px solid var(--cyan);
 box-shadow:0 0 8px rgba(92,225,230,.55),inset 0 0 22px rgba(92,225,230,.07);font:600 12px/1.45 var(--fm);color:#E6FBFF;transition:opacity .24s cubic-bezier(.2,.8,.2,1)}
.al-sys::before,.al-sys::after{content:"";position:absolute;width:10px;height:10px;border:2px solid #E6FBFF;pointer-events:none}
.al-sys::before{top:-5px;left:-5px;border-right:0;border-bottom:0} .al-sys::after{bottom:-5px;right:-5px;border-left:0;border-top:0}
.al-sys h5{margin:0 0 4px;font:600 11px/1 var(--fm);letter-spacing:.12em;text-transform:uppercase;color:var(--cyan);text-shadow:0 0 8px rgba(92,225,230,.8)}
.al-sys p{margin:0;min-height:17px}
.al-sys i{display:inline-block;width:7px;height:13px;margin-left:1px;vertical-align:-2px;background:var(--cyan);box-shadow:0 0 6px var(--cyan);animation:al-blink 1s steps(1) infinite}
.al-sys.idle{opacity:.55}
.al-sys.idle h5{color:var(--t3);text-shadow:none}
.al-sys em{position:absolute;right:10px;top:8px;font:500 9px/1 var(--fm);font-style:normal;color:var(--t3);letter-spacing:.06em}
@keyframes al-blink{50%{opacity:0}}
.al-tracks{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:4px;margin-top:8px}
.al-track{text-align:left;font:inherit;color:var(--text);background:rgba(255,255,255,.03);border:1px solid rgba(150,215,255,.13);padding:5px 7px;cursor:pointer;position:relative;overflow:hidden}
.al-track b{display:block;font:700 12px/1.15 var(--fd);letter-spacing:.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding-right:22px}
.al-track small{display:block;font:400 8.5px/1.3 var(--fm);color:var(--t3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.al-track:hover{border-color:rgba(92,225,230,.5)}
.al-track.on{border-color:var(--gold);background:linear-gradient(90deg,rgba(255,215,106,.18),rgba(255,215,106,.03));box-shadow:0 0 18px rgba(255,215,106,.2)}
.al-track.on b{color:var(--gold)}
.al-beat{position:absolute;right:6px;top:7px;display:flex;gap:2px}
.al-beat i{width:4px;height:4px;background:rgba(255,215,106,.25)} .al-beat i.lit{background:var(--gold);box-shadow:0 0 6px var(--gold)}
.al-int{display:grid;grid-template-columns:auto 1fr auto;gap:8px;align-items:center;margin-top:8px}
.al-int label{font:600 10px/1 var(--fm);letter-spacing:.12em;color:var(--t2);text-transform:uppercase}
.al-int output{font:600 12px/1 var(--fm);color:var(--gold);min-width:36px;text-align:right}
.al input[type=range]{-webkit-appearance:none;appearance:none;width:100%;height:18px;background:transparent;margin:0}
.al input[type=range]::-webkit-slider-runnable-track{height:4px;background:linear-gradient(90deg,var(--cyan) var(--p,50%),rgba(150,215,255,.14) var(--p,50%))}
.al input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:10px;height:16px;margin-top:-6px;background:#EAFFFF;border:0;box-shadow:0 0 10px var(--cyan)}
.al-stems{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin-top:6px}
.al-stem{border:1px solid rgba(150,215,255,.12);padding:4px 5px;background:rgba(0,0,0,.2)}
.al-stem small{display:block;font:500 8.5px/1.2 var(--fm);color:var(--t3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.al-stem .bar{height:5px;margin-top:3px;background:rgba(150,215,255,.1);position:relative}
.al-stem .bar i{position:absolute;inset:0 auto 0 0;background:linear-gradient(90deg,var(--mint),var(--cyan));box-shadow:0 0 8px rgba(93,255,192,.5)}
.al-stem .bar u{position:absolute;top:-2px;bottom:-2px;width:2px;background:var(--gold)}
.al-mix{display:grid;grid-template-columns:52px 1fr 30px;gap:3px 7px;align-items:center}
.al-mix label{font:600 9.5px/1 var(--fm);letter-spacing:.1em;text-transform:uppercase;color:var(--t2)}
.al-mix output{font:500 10px/1 var(--fm);color:var(--t3);text-align:right}
.al-seg{display:flex;gap:3px;flex-wrap:wrap;margin:6px 0 2px}
.al-seg button{flex:1;font:600 9px/1 var(--fm);letter-spacing:.1em;text-transform:uppercase;color:var(--t2);background:rgba(255,255,255,.03);border:1px solid rgba(150,215,255,.14);padding:6px 4px;cursor:pointer}
.al-seg button.on{color:#0E0B10;background:var(--violet);border-color:var(--violet);box-shadow:0 0 12px rgba(179,136,255,.5)}
.al-loops{display:flex;flex-wrap:wrap;gap:3px}
.al-loops button{font:500 9.5px/1 var(--fm);color:var(--t2);background:rgba(255,255,255,.03);border:1px solid rgba(150,215,255,.14);padding:5px 7px;cursor:pointer}
.al-loops button.on{color:#0E0B10;background:var(--mint);border-color:var(--mint);box-shadow:0 0 12px rgba(93,255,192,.5)}
.al-sub{font:600 9.5px/1 var(--fm);letter-spacing:.14em;text-transform:uppercase;color:var(--t3);margin:9px 0 5px;display:flex;justify-content:space-between;align-items:center}
.al-pad{display:grid;grid-template-columns:118px 1fr;gap:8px;align-items:start}
.al-pad canvas{width:118px;height:118px;border:1px solid var(--hair);cursor:crosshair;background:radial-gradient(circle,#0B1630,#060a1a)}
.al-log{font:400 9px/1.5 var(--fm);color:var(--t3);white-space:pre;overflow:hidden}
.al-log b{color:var(--t2);font-weight:500}
.al-btn{font:700 9.5px/1 var(--fm);letter-spacing:.12em;text-transform:uppercase;color:#0E0B10;background:var(--cyan);border:0;padding:6px 9px;cursor:pointer;box-shadow:0 0 12px rgba(92,225,230,.4)}
.al-btn.ghost{background:transparent;color:var(--t2);border:1px solid var(--hair);box-shadow:none}
.al-res{font:400 9.5px/1.25 var(--fm)}
.al-res table{width:100%;border-collapse:collapse}
.al-res th{font:600 8.5px/1 var(--fm);letter-spacing:.1em;color:var(--t3);text-align:right;padding:2px 3px;text-transform:uppercase}
.al-res th:first-child,.al-res td:first-child{text-align:left}
.al-res td{padding:1.5px 3px;text-align:right;color:var(--t2);border-top:1px solid rgba(150,215,255,.06);white-space:nowrap}
.al-res td:first-child{max-width:92px;overflow:hidden;text-overflow:ellipsis}
.al-res td.ok{color:var(--mint)} .al-res td.bad{color:var(--crimson);font-weight:700}
.al-res canvas{display:block;width:64px;height:14px}
.al-gate{position:absolute;inset:0;z-index:5;display:grid;place-items:center;background:rgba(14,11,16,.55)}
.al-gate button{font:800 17px/1 var(--fd);letter-spacing:.08em;color:#0E0B10;background:var(--gold);border:0;padding:16px 28px;cursor:pointer;box-shadow:0 0 40px rgba(255,215,106,.55)}
.al-gate p{font:400 11px/1.5 var(--fm);color:var(--t2);text-align:center;margin:12px 0 0}
.al-sheet{position:absolute;inset:58px 14px 12px;z-index:3;display:grid;grid-template-columns:repeat(auto-fill,minmax(232px,1fr));gap:7px;overflow:auto;align-content:start}
.al-card{background:var(--glass2);border:1px solid var(--hair);padding:6px 7px 7px;border-top:2px solid var(--c,var(--cyan))}
.al-card header{display:flex;justify-content:space-between;align-items:baseline;gap:6px;font:600 10px/1 var(--fm);margin-bottom:5px;white-space:nowrap;overflow:hidden}
.al-card header em{font:500 8.5px/1 var(--fm);color:var(--t3);font-style:normal}
.al-card canvas{display:block;width:100%;height:auto}
.al-card .wave{height:20px;margin-top:2px}
.al-card footer{display:flex;gap:8px;font:500 8.5px/1 var(--fm);color:var(--t3);margin-top:4px}
.al-card footer b{color:var(--t2);font-weight:500} .al-card footer .bad{color:var(--crimson)} .al-card footer .ok{color:var(--mint)}
`;

// ---------------------------------------------------------------------------------------------
export default function start(): void {
  const params = new URLSearchParams(location.search);
  const isTest = params.get('test') === '1';
  const renderAll = params.get('all') === '1';
  const sheetView = params.get('view') === 'results';
  const auto = params.get('auto') !== '0'; // auto=0: no test choreography / renders (for benchmarks)
  const dpr = isTest ? 1 : Math.min(2, window.devicePixelRatio || 1);

  // the game's own faces (GDD 14.5); fallbacks apply offline and in headless test runs
  if (!isTest || params.get('fonts') === '1') void loadFonts();
  document.head.append(el('style', {}, [CSS]));
  document.body.style.margin = '0';
  document.body.style.background = '#0E0B10';

  const engine = new AudioEngine({ seed: isTest ? 7 : undefined });
  if (isTest) {
    const pr = new Prng(99);
    setSynthRandom(() => pr.next());
  }

  // ---------------------------------------------------------------- state
  let selectedTrack: string | null = null;
  let spatial = false;
  const padPos = { x: 6, y: 0, z: -6 };
  const loops = new Map<string, LoopHandle>();
  const log: string[] = [];
  const renders: RenderMetrics[] = [];
  const renderData = new Map<string, RenderResult>();
  let renderPlan = 0;
  let renderCount = 0;
  let renderDone = false;
  let renderMs = 0;
  const renderTimes = new Map<string, number>();
  let renderError: string | null = null;
  let markReady: () => void = () => {};
  const readyP = new Promise<void>((res) => (markReady = res));
  const pushLog = (s: string) => {
    log.unshift(s);
    log.length = Math.min(log.length, 7);
    logEl.innerHTML = log.map((l, i) => (i === 0 ? `<b>${l}</b>` : l)).join('\n');
  };

  // ---------------------------------------------------------------- header
  const pillCtx = el('span', { class: 'al-pill' });
  const pillVoices = el('span', { class: 'al-pill' });
  const pillMusic = el('span', { class: 'al-pill' });
  const pillRender = el('span', { class: 'al-pill' });
  const head = el('div', { class: 'al-head' }, [
    el('div', { class: 'al-brand' }, [
      el('b', {}, ['Knotspire']),
      el('span', {}, ['Audio Lab']),
      el('small', {}, [`${SFX_NAMES.length} sfx · ${TRACK_NAMES.length} tracks · ${LOOP_NAMES.length} loops · System voice & babble · 100% procedural WebAudio`]),
    ]),
    el('div', { class: 'al-pills' }, [pillRender, pillMusic, pillVoices, pillCtx]),
  ]);

  // ---------------------------------------------------------------- SFX board
  const chips = new Map<string, HTMLButtonElement>();
  const byCat = new Map<SfxCategory, string[]>();
  for (const n of SFX_NAMES) {
    const c = SFX[n]!.cat;
    if (!byCat.has(c)) byCat.set(c, []);
    byCat.get(c)!.push(n);
  }
  const required = new Set(REQUIRED_SFX);
  const fire = (name: string) => {
    const at = spatial ? padPos : undefined;
    engine.sfx(name, { at });
    const chip = chips.get(name);
    if (chip) {
      chip.classList.add('hit');
      setTimeout(() => chip.classList.remove('hit'), 160);
    }
    pushLog(`sfx  ${name}${at ? `  @ (${at.x.toFixed(1)}, ${at.z.toFixed(1)})` : ''}`);
  };
  const board = el('div', { class: 'al-scroll' });
  let babbles = 0;
  const flash = (chip: HTMLElement) => {
    chip.classList.add('hit');
    setTimeout(() => chip.classList.remove('hit'), 160);
  };
  const say = (v: (typeof BABBLE_LINES)[number], chip?: HTMLElement) => {
    const len = engine.babble(v.text, { f0: v.f0, resolve: v.resolve, at: spatial ? padPos : undefined, speaker: v.label });
    if (len > 0) babbles++;
    if (chip) flash(chip);
    pushLog(`babble  “${v.text}”  ${v.f0} Hz${v.resolve ? ' ↓4th' : ''}  ${len.toFixed(2)} s`);
  };
  {
    const row = el('div', { class: 'al-chips' });
    const sys = el('button', { class: 'al-chip', title: 'System window: typed at 35 cps with the bell-babble (GDD 15.3)' }, ['[ SYSTEM ] speak']);
    sys.addEventListener('click', () => {
      flash(sys);
      speakNext();
    });
    row.append(sys);
    for (const v of BABBLE_LINES) {
      const b = el('button', { class: 'al-chip', title: `Wick babble · ${v.f0} Hz${v.resolve ? ' · the Resolve tell drops a perfect fourth' : ''}` }, [`${v.label} `, el('q', {}, [v.text])]);
      b.addEventListener('click', () => say(v, b));
      row.append(b);
    }
    board.append(el('div', { class: 'al-cat', style: `--c:${VOICE_COLOR}` }, [el('h4', {}, ['Voices', el('em', {}, ['System + Wick babble'])]), row]));
  }
  for (const cat of CAT_ORDER) {
    const names = byCat.get(cat);
    if (!names) continue;
    const row = el('div', { class: 'al-chips' });
    for (const n of names) {
      const b = el('button', { class: `al-chip${required.has(n) ? ' req' : ''}`, title: `${n} · ${cat}`, onclick: () => fire(n) }, [n]);
      chips.set(n, b);
      row.append(b);
    }
    board.append(el('div', { class: 'al-cat', style: `--c:${CAT_COLOR[cat]}` }, [el('h4', {}, [CAT_LABEL[cat], el('em', {}, [String(names.length)])]), row]));
  }
  const sfxPanel = el('section', { class: 'al-panel' }, [el('h3', { class: 'al-h' }, ['Sound effects', el('span', {}, ['click to play · ▪ = required by the GDD'])]), board]);

  // ---------------------------------------------------------------- visualiser + music
  const viz = el('canvas', { width: Math.round(570 * dpr), height: Math.round(300 * dpr) });
  const trail = document.createElement('canvas');
  trail.width = viz.width;
  trail.height = viz.height;
  const trackBtns = new Map<string, HTMLButtonElement>();
  const beatDots = new Map<string, HTMLElement[]>();
  const tracksEl = el('div', { class: 'al-tracks' });
  const playTrack = (name: string | null) => {
    selectedTrack = name;
    engine.music(name, name ? 1.5 : 2);
    if (name && SPACE_FOR[name]) setSpace(SPACE_FOR[name]!);
    for (const [n, b] of trackBtns) b.classList.toggle('on', n === name);
    pushLog(name ? `music  ${name}` : 'music  stop');
    buildStems();
  };
  for (const n of TRACK_NAMES) {
    const t = TRACKS[n]!;
    const dots = Array.from({ length: t.beats }, () => el('i'));
    beatDots.set(n, dots);
    const b = el('button', { class: 'al-track', title: t.mood, onclick: () => playTrack(selectedTrack === n ? null : n) }, [
      el('span', { class: 'al-beat' }, dots),
      el('b', {}, [t.title]),
      el('small', {}, [`${n} · ${t.key} ${t.mode.slice(0, 4)} · ${t.bpm}${t.beats === 3 ? ' · 3/4' : ''}`]),
    ]);
    trackBtns.set(n, b);
    tracksEl.append(b);
  }
  const intOut = el('output', {}, ['0.50']);
  const intSlider = el('input', { type: 'range', min: '0', max: '1', step: '0.01', value: '0.5' });
  const setP = (i: HTMLInputElement) => i.style.setProperty('--p', `${Number(i.value) * 100}%`);
  setP(intSlider);
  intSlider.addEventListener('input', () => {
    const v = Number(intSlider.value);
    engine.setIntensity(v);
    intOut.textContent = v.toFixed(2);
    setP(intSlider);
  });
  const stemsEl = el('div', { class: 'al-stems' });
  let stemBars: { fill: HTMLElement; mark: HTMLElement }[] = [];
  function buildStems(): void {
    stemsEl.textContent = '';
    stemBars = [];
    const def = selectedTrack ? TRACKS[selectedTrack] : undefined;
    const names = def ? def.stems.map((s) => s.name) : ['base', 'layer 2', 'layer 3', 'layer 4'];
    for (const n of names) {
      const fill = el('i', { style: 'width:0%' });
      const mark = el('u', { style: 'left:0%' });
      stemBars.push({ fill, mark });
      stemsEl.append(el('div', { class: 'al-stem' }, [el('small', {}, [n]), el('div', { class: 'bar' }, [fill, mark])]));
    }
  }
  buildStems();

  // System window (GDD 14.2): typed at 35 cps, every character rings the bell-babble
  const sysHead = el('h5', {}, ['[ SYSTEM ]']);
  const sysBody = el('p', {}, ['Waiting for the Tower to speak.']);
  const sysWin = el('div', { class: 'al-sys idle' }, [sysHead, sysBody, el('em', {}, ['35 cps · bell-babble'])]);
  const caret = el('i');
  let sysLine = -1;
  let sysTyping = false;
  let sysTimer: ReturnType<typeof setInterval> | null = null;
  let sysHold: ReturnType<typeof setTimeout> | null = null;
  let sysChars = 0;
  function speak(i: number): void {
    const line = SYSTEM_LINES[((i % SYSTEM_LINES.length) + SYSTEM_LINES.length) % SYSTEM_LINES.length]!;
    sysLine = i;
    if (sysTimer) clearInterval(sysTimer);
    if (sysHold) clearTimeout(sysHold);
    const head = [...`[ ${line.head} ]`];
    const body = [...line.body];
    sysHead.textContent = '';
    sysBody.textContent = '';
    sysBody.append(caret);
    sysWin.classList.remove('idle');
    engine.sfx(line.sting);
    engine.duck(0.35, (head.length + body.length) / 35);
    pushLog(`system  [ ${line.head} ]`);
    let k = 0;
    sysTyping = true;
    sysTimer = setInterval(() => {
      if (k < head.length) {
        const ch = head[k++]!;
        sysHead.textContent += ch;
        engine.typeTick(ch, true);
      } else if (k < head.length + body.length) {
        const ch = body[k++ - head.length]!;
        caret.before(ch);
        engine.typeTick(ch);
        sysChars++;
      } else {
        if (sysTimer) clearInterval(sysTimer);
        sysTimer = null;
        sysTyping = false;
        // GDD 14.2: a window stays 4 s + 50 ms per character; the test run keeps the Tower talking
        const hold = 4000 + 50 * body.length;
        sysHold = setTimeout(() => (isTest ? speak(sysLine + 1) : sysWin.classList.add('idle')), isTest ? 1800 : hold);
      }
    }, 1000 / 35);
  }
  const speakNext = () => speak(sysLine + 1);

  const musicPanel = el('section', { class: 'al-panel', style: '--tone:var(--gold)' }, [
    el('h3', { class: 'al-h' }, ['Well · Sky · Space', el('span', {}, ['radial spectrum: bass at the centre, highs at the rim, time sweeps clockwise'])]),
    el('div', { class: 'al-viz' }, [viz]),
    sysWin,
    el('div', { class: 'al-scroll', style: 'flex:1' }, [
      tracksEl,
      el('div', { class: 'al-int' }, [el('label', {}, ['Intensity']), intSlider, intOut]),
      stemsEl,
    ]),
  ]);

  // ---------------------------------------------------------------- mixer, space, loops, pad
  const mix = el('div', { class: 'al-mix' });
  for (const k of ['master', 'music', 'sfx'] as const) {
    const out = el('output', {}, [String(Math.round(engine.volumes[k] * 100))]);
    const s = el('input', { type: 'range', min: '0', max: '1', step: '0.01', value: String(engine.volumes[k]) });
    setP(s);
    s.addEventListener('input', () => {
      engine.volumes[k] = Number(s.value);
      out.textContent = String(Math.round(Number(s.value) * 100));
      setP(s);
    });
    mix.append(el('label', {}, [k]), s, out);
  }
  const muffOut = el('output', {}, ['0']);
  const muff = el('input', { type: 'range', min: '0', max: '1', step: '0.01', value: '0' });
  setP(muff);
  muff.addEventListener('input', () => {
    engine.setMuffle(Number(muff.value));
    muffOut.textContent = String(Math.round(Number(muff.value) * 100));
    setP(muff);
  });
  mix.append(el('label', {}, ['muffle']), muff, muffOut);
  const seg = el('div', { class: 'al-seg' });
  const segBtns = new Map<string, HTMLButtonElement>();
  function setSpace(n: string): void {
    engine.setSpace(n);
    for (const [k, b] of segBtns) b.classList.toggle('on', k === n);
  }
  for (const n of Object.keys(SPACES)) {
    const b = el('button', { onclick: () => setSpace(n) }, [n]);
    segBtns.set(n, b);
    seg.append(b);
  }
  segBtns.get('room')?.classList.add('on');
  const loopsEl = el('div', { class: 'al-loops' });
  for (const n of LOOP_NAMES) {
    const b = el('button', { title: LOOPS[n]!.desc }, [n]);
    b.addEventListener('click', () => {
      const cur = loops.get(n);
      if (cur) {
        cur.stop(0.8);
        loops.delete(n);
        b.classList.remove('on');
        pushLog(`loop  ${n} off`);
      } else {
        const h = engine.loop(n, spatial ? { at: { ...padPos } } : {});
        if (h) {
          loops.set(n, h);
          b.classList.add('on');
          pushLog(`loop  ${n} on`);
        }
      }
    });
    loopsEl.append(b);
  }
  const pad = el('canvas', { width: Math.round(118 * dpr), height: Math.round(118 * dpr) });
  const RANGE = 20;
  pad.addEventListener('pointerdown', (e) => {
    const r = pad.getBoundingClientRect();
    padPos.x = ((e.clientX - r.left) / r.width - 0.5) * 2 * RANGE;
    padPos.z = ((e.clientY - r.top) / r.height - 0.5) * 2 * RANGE;
    for (const h of loops.values()) if (spatial) h.setPosition(padPos);
    drawPad();
  });
  const spBtn = el('button', { class: 'al-btn ghost' }, ['3D off']);
  spBtn.addEventListener('click', () => {
    spatial = !spatial;
    spBtn.textContent = spatial ? '3D on' : '3D off';
    spBtn.classList.toggle('ghost', !spatial);
    for (const h of loops.values()) h.setPosition(spatial ? padPos : null);
    drawPad();
  });
  const logEl = el('div', { class: 'al-log' });
  const renderSub = el('span');
  const resEl = el('div', { class: 'al-res al-scroll', style: 'flex:1' });
  const sidePanel = el('section', { class: 'al-panel', style: '--tone:var(--violet)' }, [
    el('h3', { class: 'al-h' }, ['Mixer', el('span', {}, ['volumes persist'])]),
    mix,
    el('div', { class: 'al-sub' }, ['Space']),
    seg,
    el('div', { class: 'al-sub' }, ['Loops']),
    loopsEl,
    el('div', { class: 'al-sub' }, ['Position', spBtn]),
    el('div', { class: 'al-pad' }, [pad, logEl]),
    el('div', { class: 'al-sub' }, ['Offline renders', renderSub]),
    resEl,
  ]);

  const root = el('div', { class: 'al' }, [el('div', { class: 'al-stars' }), head, el('div', { class: 'al-main' }, [sfxPanel, musicPanel, sidePanel])]);
  document.body.append(root);

  // ---------------------------------------------------------------- gesture gate (real browsers)
  const gate = el('div', { class: 'al-gate' }, [
    el('div', {}, [el('button', { onclick: () => wake() }, ['Ring the bells']), el('p', {}, ['browsers keep audio asleep until you interact'])]),
  ]);
  let greeted = false;
  function greet(): void {
    if (greeted) return;
    greeted = true;
    gate.remove();
    if (!selectedTrack) playTrack('title');
    setTimeout(() => speak(0), 700);
  }
  function wake(): void {
    engine.unlock();
    greet();
  }
  root.append(gate);
  engine.unlock(); // allowed straight away when autoplay is permitted (test harness)
  setTimeout(() => {
    if (engine.unlocked && auto) greet();
  }, 120);

  // ---------------------------------------------------------------- drawing
  function drawPad(): void {
    const g = pad.getContext('2d');
    if (!g) return;
    const W = pad.width;
    g.clearRect(0, 0, W, W);
    g.strokeStyle = 'rgba(92,225,230,.14)';
    for (const m of [3, 10, 20]) {
      g.beginPath();
      g.arc(W / 2, W / 2, (m / RANGE) * (W / 2), 0, Math.PI * 2);
      g.stroke();
    }
    g.fillStyle = '#5CE1E6';
    g.beginPath();
    g.moveTo(W / 2, W / 2 - 7 * dpr);
    g.lineTo(W / 2 - 5 * dpr, W / 2 + 5 * dpr);
    g.lineTo(W / 2 + 5 * dpr, W / 2 + 5 * dpr);
    g.fill();
    const px = W / 2 + (padPos.x / RANGE) * (W / 2);
    const pz = W / 2 + (padPos.z / RANGE) * (W / 2);
    g.fillStyle = spatial ? '#FFD76A' : 'rgba(255,215,106,.35)';
    g.shadowColor = '#FFD76A';
    g.shadowBlur = spatial ? 10 : 0;
    g.beginPath();
    g.arc(px, pz, 4.5 * dpr, 0, Math.PI * 2);
    g.fill();
    g.shadowBlur = 0;
    g.fillStyle = 'rgba(183,200,222,.6)';
    g.font = `${8 * dpr}px ui-monospace, monospace`;
    g.fillText('forward', W / 2 - 16 * dpr, 10 * dpr);
  }
  drawPad();

  const F0 = 30;
  const F1 = 16000;
  let freq: Float32Array<ArrayBuffer> | null = null;
  let wave: Float32Array<ArrayBuffer> | null = null;
  let sweep = -Math.PI / 2;
  let lastT = performance.now();
  function drawViz(): void {
    const g = viz.getContext('2d');
    const tg = trail.getContext('2d');
    if (!g || !tg) return;
    const W = viz.width;
    const H = viz.height;
    const cx = W / 2;
    const cy = H * 0.54;
    const R = Math.min(W * 0.36, H * 0.5);
    const r0 = R * 0.12;
    const now = performance.now();
    const dt = Math.min(0.1, (now - lastT) / 1000);
    lastT = now;
    const an = engine.analyser;
    const sr = engine.context?.sampleRate ?? 48000;
    if (an) {
      if (!freq || freq.length !== an.frequencyBinCount) freq = new Float32Array(an.frequencyBinCount);
      if (!wave || wave.length !== an.fftSize) wave = new Float32Array(an.fftSize);
      an.getFloatFrequencyData(freq);
      an.getFloatTimeDomainData(wave);
    }
    // fade the trail a little so older layers sink like sediment
    tg.globalCompositeOperation = 'destination-out';
    tg.fillStyle = `rgba(0,0,0,${Math.min(1, dt * 0.12)})`;
    tg.fillRect(0, 0, W, H);
    tg.globalCompositeOperation = 'source-over';
    const dA = (Math.PI * 2 * dt) / 7;
    if (freq) {
      const steps = 72;
      for (let i = 0; i < steps; i++) {
        const ri = r0 + ((R - r0) * i) / steps;
        const ro = r0 + ((R - r0) * (i + 1)) / steps;
        const f = F0 * Math.pow(F1 / F0, (i + 0.5) / steps);
        const b = Math.min(freq.length - 1, Math.round((f / (sr / 2)) * freq.length));
        const db = freq[b]!;
        const k = Number.isFinite(db) ? (db + 100) / 68 : 0;
        if (k <= 0.04) continue;
        const [cr, cg, cb] = heat(k);
        tg.fillStyle = `rgba(${cr | 0},${cg | 0},${cb | 0},${Math.min(1, 0.25 + k)})`;
        tg.beginPath();
        tg.arc(cx, cy, ro, sweep, sweep + dA + 0.01);
        tg.arc(cx, cy, ri, sweep + dA + 0.01, sweep, true);
        tg.closePath();
        tg.fill();
      }
    }
    sweep += dA;
    g.clearRect(0, 0, W, H);
    // sky glow behind
    const bg = g.createRadialGradient(cx, cy, r0, cx, cy, R * 1.25);
    bg.addColorStop(0, 'rgba(4,6,15,1)');
    bg.addColorStop(0.35, 'rgba(10,22,52,.55)');
    bg.addColorStop(0.75, 'rgba(22,16,60,.35)');
    bg.addColorStop(1, 'rgba(4,6,15,0)');
    g.fillStyle = bg;
    g.fillRect(0, 0, W, H);
    g.drawImage(trail, 0, 0);
    // layer rings: well / sky / space
    const bands: [number, string, string][] = [[250, 'WELL', '#FFD76A'], [2000, 'SKY', '#5CE1E6'], [F1, 'SPACE', '#B388FF']];
    g.font = `600 ${9 * dpr}px ${FONT.mono}`;
    g.textAlign = 'left';
    for (const [f, label, c] of bands) {
      const rr = r0 + ((R - r0) * Math.log(f / F0)) / Math.log(F1 / F0);
      g.strokeStyle = c + '55';
      g.lineWidth = dpr;
      g.setLineDash([2 * dpr, 4 * dpr]);
      g.beginPath();
      g.arc(cx, cy, rr, 0, Math.PI * 2);
      g.stroke();
      g.setLineDash([]);
      g.fillStyle = c;
      g.fillText(label, cx + rr * Math.cos(-0.62) + 5 * dpr, cy + rr * Math.sin(-0.62));
    }
    // the well itself + a circular oscilloscope on its rim
    g.fillStyle = '#04060f';
    g.beginPath();
    g.arc(cx, cy, r0, 0, Math.PI * 2);
    g.fill();
    if (wave) {
      g.strokeStyle = 'rgba(255,241,193,.9)';
      g.lineWidth = 1.4 * dpr;
      g.beginPath();
      const n = 256;
      for (let i = 0; i <= n; i++) {
        const a = (i / n) * Math.PI * 2;
        const v = wave[Math.floor((i / n) * (wave.length - 1))]!;
        const rr = r0 * (1 + Math.max(-0.8, Math.min(0.8, v * 1.6)));
        const x = cx + Math.cos(a) * rr;
        const y = cy + Math.sin(a) * rr;
        if (i === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.stroke();
    }
    // sweep hand
    g.strokeStyle = 'rgba(92,225,230,.5)';
    g.lineWidth = dpr;
    g.beginPath();
    g.moveTo(cx + Math.cos(sweep) * r0, cy + Math.sin(sweep) * r0);
    g.lineTo(cx + Math.cos(sweep) * R, cy + Math.sin(sweep) * R);
    g.stroke();
    // side readouts
    const st = engine.state();
    g.fillStyle = 'rgba(183,200,222,.85)';
    g.font = `500 ${9 * dpr}px ${FONT.mono}`;
    const lines = [
      st.music.track ? TRACKS[st.music.track]!.title : 'no music',
      st.music.track ? `bar ${st.music.bar + 1} · beat ${st.music.beat + 1}` : '',
      `intensity ${st.music.intensity.toFixed(2)}`,
      `space ${st.space}`,
    ];
    lines.forEach((l, i) => g.fillText(l, 8 * dpr, (14 + i * 13) * dpr));
    g.textAlign = 'right';
    const rms = wave ? Math.sqrt(wave.reduce((a, v) => a + v * v, 0) / wave.length) : 0;
    const peak = wave ? wave.reduce((a, v) => Math.max(a, Math.abs(v)), 0) : 0;
    [`rms ${(20 * Math.log10(rms + 1e-9)).toFixed(1)} dB`, `peak ${peak.toFixed(3)}`, `${st.voices} voices`].forEach((l, i) => g.fillText(l, W - 8 * dpr, (14 + i * 13) * dpr));
    g.textAlign = 'left';
  }

  let frame = 0;
  function loop(): void {
    frame++;
    drawViz();
    if (frame % 6 === 0) updateStatus();
    requestAnimationFrame(loop);
  }
  function updateStatus(): void {
    const st = engine.state();
    pillCtx.innerHTML = `ctx <i>${st.context}</i>${engine.context ? ` · ${engine.context.sampleRate} Hz` : ''}`;
    pillCtx.className = `al-pill ${st.context === 'running' ? 'on' : 'warn'}`;
    pillVoices.innerHTML = `voices <i>${st.voices}</i>/${engine.maxVoices} · played <i>${st.stats.played}</i> · dropped <i>${st.stats.dropped}</i> · stolen <i>${st.stats.stolen}</i>`;
    pillMusic.innerHTML = st.music.track ? `♪ <i>${st.music.track}</i> · ${st.music.bar + 1}:${st.music.beat + 1}` : '♪ <i>silent</i>';
    const bad = renders.filter((r) => !r.ok).length;
    pillRender.innerHTML = renderPlan
      ? `renders <i>${renderCount}/${renderPlan}</i>${renderDone ? (bad ? ` · ${bad} bad` : ` · all ok · ${(renderMs / 1000).toFixed(1)} s`) : ''}`
      : 'renders <i>—</i>';
    pillRender.className = `al-pill ${renderDone ? (bad ? 'warn' : 'on') : ''}`;
    for (const [n, dots] of beatDots) dots.forEach((d, i) => d.classList.toggle('lit', n === st.music.track && i === st.music.beat));
    const def = selectedTrack ? TRACKS[selectedTrack] : undefined;
    const target = def ? stemGains(def, Number(intSlider.value)) : [];
    stemBars.forEach((s, i) => {
      const g = st.music.stems[i]?.gain ?? 0;
      s.fill.style.width = `${Math.min(100, (g / Math.max(1e-6, (def?.gain ?? 1) * (def?.stems[i]?.gain ?? 1))) * 100)}%`;
      s.mark.style.left = `calc(${(target[i] ?? 0) * 100}% - 1px)`;
    });
  }
  requestAnimationFrame(loop);

  // ---------------------------------------------------------------- offline renders
  const fmt = (v: number, d = 3) => (Number.isFinite(v) ? v.toFixed(d) : String(v));
  function showResult(m: RenderMetrics, r: RenderResult | undefined): void {
    let table = resEl.querySelector('table');
    if (!table) {
      table = el('table', {}, [el('tr', {}, ['render', 'peak', 'rms', 'pre', '', ''].map((h) => el('th', {}, [h])))]);
      resEl.append(table);
    }
    const spec = el('canvas', { width: 64, height: 14 });
    table.append(el('tr', { title: m.problems.join('; ') || 'ok' }, [
      el('td', { title: m.name }, [`${m.kind === 'music' ? '♪ ' : m.kind === 'loop' ? '∞ ' : m.name.startsWith('babble') ? '» ' : ''}${m.name.replace(/^babble: /, '')}`]),
      el('td', {}, [fmt(m.peak)]),
      el('td', {}, [fmt(m.rms, 4)]),
      el('td', {}, [fmt(m.prePeak, 2)]),
      el('td', { class: m.ok ? 'ok' : 'bad' }, [m.ok ? 'ok' : 'FAIL']),
      el('td', {}, [spec]),
    ]));
    if (r) drawSpectrogram(spec, r.left, m.sampleRate);
  }
  function showSheet(): void {
    const sheet = el('div', { class: 'al-sheet' });
    for (const m of renders) {
      const r = renderData.get(`${m.kind}:${m.name}`);
      const spec = el('canvas', { width: 232, height: 64 });
      const wv = el('canvas', { class: 'wave', width: 232, height: 20 });
      const cat = SFX[m.name]?.cat;
      const c = cat ? CAT_COLOR[cat] : m.kind === 'music' ? '#FFD76A' : m.kind === 'loop' ? '#5DFFC0' : VOICE_COLOR;
      sheet.append(el('div', { class: 'al-card', style: `--c:${c}` }, [
        el('header', {}, [m.name, el('em', {}, [`${m.kind} · ${m.seconds.toFixed(1)} s`])]),
        spec,
        wv,
        el('footer', {}, [
          el('span', {}, ['peak ', el('b', {}, [fmt(m.peak)])]),
          el('span', {}, ['rms ', el('b', {}, [fmt(m.rms, 4)])]),
          el('span', {}, ['pre ', el('b', {}, [fmt(m.prePeak, 2)])]),
          el('span', { class: m.ok ? 'ok' : 'bad' }, [m.ok ? 'ok' : m.problems.join(', ')]),
        ]),
      ]));
      if (r) {
        drawSpectrogram(spec, r.left, m.sampleRate);
        drawWave(wv, r.left);
      }
    }
    root.append(sheet);
  }

  /**
   * Offline renders run a few at a time (each OfflineAudioContext renders on its own thread) and
   * are listed in plan order as soon as the prefix before them is done.
   */
  async function runRenders(): Promise<void> {
    type Job = { name: string; run: () => Promise<RenderResult> };
    const sfxList = renderAll ? SFX_NAMES : TEST_SFX;
    const trackList = renderAll ? TRACK_NAMES : TEST_TRACKS;
    const loopList = renderAll ? LOOP_NAMES : TEST_LOOPS;
    const babbleList = renderAll ? BABBLE_LINES : TEST_BABBLE;
    const jobs: Job[] = [
      ...sfxList.map((n): Job => ({ name: n, run: () => renderSfxOffline(n, { seed: 11 }) })),
      ...babbleList.map((b): Job => ({ name: `babble: ${b.text}`, run: () => renderBabbleOffline(b.text, { f0: b.f0, resolve: b.resolve, seed: 11 }) })),
      ...trackList.map((n): Job => ({ name: n, run: () => renderTrackOffline(n, { seconds: 4, intensity: 0.8, seed: 7 }) })),
      ...loopList.map((n): Job => ({ name: n, run: () => renderLoopOffline(n, { seconds: 3 }) })),
    ];
    renderPlan = jobs.length;
    const slots: (RenderMetrics | undefined)[] = new Array(jobs.length);
    const data: (RenderResult | undefined)[] = new Array(jobs.length);
    let shown = 0;
    let next = 0;
    const t0 = performance.now();
    const worker = async (): Promise<void> => {
      while (next < jobs.length) {
        const i = next++;
        const job = jobs[i]!;
        const ts = performance.now();
        try {
          const r = await job.run();
          slots[i] = r.metrics;
          data[i] = r;
        } catch (e) {
          renderError = `${job.name}: ${String(e)}`;
          console.warn('[audio-lab] render failed', job.name, e);
          slots[i] = { name: job.name, kind: 'sfx', seconds: 0, sampleRate: 0, peak: NaN, rms: 0, nan: true, clipped: 0, prePeak: NaN, active: 0, ok: false, problems: [String(e)] };
        }
        renderTimes.set(job.name, performance.now() - ts);
        renderCount++;
        while (shown < jobs.length && slots[shown]) {
          const m = slots[shown]!;
          const r = data[shown];
          renders.push(m);
          if (r && (sheetView || renderData.size < 40)) renderData.set(`${m.kind}:${m.name}`, r);
          if (!sheetView) showResult(m, r);
          data[shown] = undefined;
          shown++;
        }
        updateStatus();
      }
    };
    await Promise.all(Array.from({ length: Math.min(RENDER_THREADS, jobs.length) }, worker));
    renderMs = performance.now() - t0;
    renderDone = true;
    if (sheetView) showSheet();
    updateStatus();
    markReady();
  }

  // ---------------------------------------------------------------- test mode choreography
  /** Wall-clock cost of representative offline renders (ms), to tell a heavy graph from a busy machine. */
  async function bench(): Promise<Record<string, number>> {
    const out: Record<string, number> = {};
    const time = async (label: string, fn: () => Promise<unknown>) => {
      const t = performance.now();
      await fn();
      out[label] = Math.round(performance.now() - t);
    };
    await time('osc_3s', async () => {
      const c = new OfflineAudioContext(2, 44100 * 3, 44100);
      const o = c.createOscillator();
      o.connect(c.destination);
      o.start();
      await c.startRendering();
    });
    await time('graph_3s', () => renderOffline(3, () => {}));
    for (const n of ['ui_click', 'coin', 'reward_big', 'crowd_cheer']) await time(n, () => renderSfxOffline(n, { seed: 11 }));
    await time('title_4s', () => renderTrackOffline('title', { seconds: 4, intensity: 0.8 }));
    await time('boss_4s', () => renderTrackOffline('boss', { seconds: 4, intensity: 0.8 }));
    return out;
  }

  if (isTest && auto) {
    engine.setIntensity(0.7);
    intSlider.value = '0.7';
    intOut.textContent = '0.70';
    setP(intSlider);
    const demoHits = ['coin', 'fork_low', 'fork_mid', 'fork_high', 'reward_small', 'lash', 'jump', 'land_soft'];
    let i = 0;
    setInterval(() => {
      if (!engine.unlocked) return;
      if (i % 4 === 3) say(BABBLE_LINES[(i >> 2) % BABBLE_LINES.length]!);
      else fire(demoHits[i % demoHits.length]!);
      i++;
    }, 800);
    const h = engine.loop('wind', { volume: 0.5 });
    if (h) {
      loops.set('wind', h);
      [...loopsEl.children].find((b) => b.textContent === 'wind')?.classList.add('on');
    }
    // stagger the offline work so the live engine gets going first
    setTimeout(() => void runRenders(), 300);
  } else {
    const b = el('button', { class: 'al-btn ghost', onclick: () => { b.remove(); void runRenders(); } }, ['run']);
    renderSub.append(b);
  }

  // ---------------------------------------------------------------- test hooks (merge)
  const w = window as unknown as { __TF?: TF };
  const prev = w.__TF ?? {};
  const r4 = (v: number) => (Number.isFinite(v) ? Math.round(v * 1e4) / 1e4 : v);
  w.__TF = {
    ...prev,
    report: () => {
      const st = engine.state();
      const fails = renders.filter((r) => !r.ok);
      const slowest = [...renderTimes.entries()].sort((a, b) => b[1] - a[1])[0];
      return {
        demo: 'audio',
        ready: renderDone,
        progress: `${renderCount}/${renderPlan}`,
        allOk: renderDone && fails.length === 0 && renders.length === renderPlan,
        failures: fails.map((f) => `${f.name}: ${f.problems.join('; ')}`),
        renderError,
        renderMs: Math.round(renderMs),
        slowestRender: slowest ? `${slowest[0]} ${Math.round(slowest[1])} ms` : null,
        summary: renders.length
          ? {
            count: renders.length,
            maxPeak: r4(Math.max(...renders.map((r) => r.peak))),
            minRms: r4(Math.min(...renders.map((r) => r.rms))),
            maxPrePeak: r4(Math.max(...renders.map((r) => r.prePeak))),
            anyNaN: renders.some((r) => r.nan),
            clippedSamples: renders.reduce((a, r) => a + r.clipped, 0),
          }
          : null,
        renders: renders.map((r) => ({ name: r.name, kind: r.kind, sec: r4(r.seconds), peak: r4(r.peak), rms: r4(r.rms), nan: r.nan, clipped: r.clipped, prePeak: r4(r.prePeak), finite: Number.isFinite(r.peak) && Number.isFinite(r.rms), ok: r.ok })),
        engine: {
          unlocked: st.unlocked, context: st.context, track: st.music.track, bar: st.music.bar, beat: st.music.beat, stems: st.music.stems.map((s) => r4(s.gain)),
          voices: st.voices, maxVoices: engine.maxVoices, played: st.stats.played, dropped: st.stats.dropped, stolen: st.stats.stolen, unknown: st.stats.unknown,
          space: st.space, loops: st.loops,
        },
        voices: { systemLine: sysLine >= 0 ? SYSTEM_LINES[sysLine % SYSTEM_LINES.length]!.head : null, typing: sysTyping, typedChars: sysChars, babbles },
        catalog: { sfx: SFX_NAMES.length, required: REQUIRED_SFX.length, requiredMissing: REQUIRED_SFX.filter((n) => !SFX[n]), tracks: TRACK_NAMES.length, loops: LOOP_NAMES.length },
      };
    },
    debug: {
      ...(prev.debug ?? {}),
      audio: engine,
      sfx: (name: string, opts?: { at?: { x: number; y: number; z: number }; volume?: number; pitch?: number }) => engine.sfx(name, opts),
      babble: (text: string, f0 = 300, resolve = false) => engine.babble(text, { f0, resolve }),
      speak: (i?: number) => (i === undefined ? speakNext() : speak(i)),
      music: (name: string | null) => playTrack(name),
      intensity: (v: number) => {
        engine.setIntensity(v);
        intSlider.value = String(v);
        intOut.textContent = v.toFixed(2);
        setP(intSlider);
      },
      space: (n: string) => setSpace(n),
      render: async (name: string) => (TRACKS[name] ? renderTrackOffline(name) : LOOPS[name] ? renderLoopOffline(name) : renderSfxOffline(name)).then((r) => r.metrics),
      renders: () => renders,
      bench,
      /** Resolves once the offline renders are done (harness: {"eval":"__TF.debug.ready()"}). */
      ready: async () => {
        await readyP;
        await new Promise((r) => setTimeout(r, 400)); // let the table/pills repaint
        return { renders: renders.length, failures: renders.filter((r) => !r.ok).length, ms: Math.round(renderMs) };
      },
    },
  };
}
