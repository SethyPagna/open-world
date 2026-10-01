/**
 * Pure (no WebAudio) checks for the audio module: DSP generators, music theory, sequencer data,
 * spatialisation and volume persistence. Run: node tests/audio_pure.test.ts
 */
import assert from 'node:assert/strict';
import {
  analyse, hash32, irData, ksData, mtof, noiseData, noteToMidi, Prng, softClipCurve, PARTIALS,
} from '../src/core/audio/synth.ts';
import {
  babbleMood, crackleData, dripData, FORK_HZ, LOOPS, LOOP_NAMES, planBabble, REQUIRED_SFX, SFX, SFX_NAMES, tickData,
} from '../src/core/audio/sfx.ts';
import {
  chordTones, MODES, parseChord, REQUIRED_TRACKS, scaleNotes, stemGains, swingBeat, TRACKS, TRACK_NAMES, voiceChord,
} from '../src/core/audio/music.ts';
import { DEFAULT_VOLUMES, parseVolumes, spatialize, SPACES, volToGain } from '../src/core/audio/audio.ts';

let passed = 0;
function test(name: string, fn: () => void): void {
  try {
    fn();
    passed++;
  } catch (e) {
    console.error(`FAIL ${name}`);
    throw e;
  }
}
const near = (a: number, b: number, eps: number, msg?: string) => assert.ok(Math.abs(a - b) <= eps, `${msg ?? ''} expected ${b} ±${eps}, got ${a}`);
const finite = (d: Float32Array, msg: string) => {
  for (let i = 0; i < d.length; i++) if (!Number.isFinite(d[i]!)) assert.fail(`${msg}: non-finite sample at ${i}`);
};
const rms = (d: Float32Array, a = 0, b = d.length) => {
  let s = 0;
  for (let i = a; i < b; i++) s += d[i]! * d[i]!;
  return Math.sqrt(s / Math.max(1, b - a));
};

// ---------------------------------------------------------------------------------------------
test('pitch helpers', () => {
  assert.equal(noteToMidi('C4'), 60);
  assert.equal(noteToMidi('A4'), 69);
  assert.equal(noteToMidi('Bb4'), 70);
  assert.equal(noteToMidi('F#2'), 42);
  near(mtof(69), 440, 1e-9);
  near(mtof(60), 261.6256, 1e-3);
  assert.throws(() => noteToMidi('H2'));
});

test('hash32 + Prng are deterministic and in range', () => {
  assert.equal(hash32('a', 1), hash32('a', 1));
  assert.notEqual(hash32('a', 1), hash32('a', 2));
  const a = new Prng(42);
  const b = new Prng(42);
  for (let i = 0; i < 1000; i++) {
    const x = a.next();
    assert.equal(x, b.next());
    assert.ok(x >= 0 && x < 1);
  }
  const r = new Prng(7);
  const seen = new Set<number>();
  for (let i = 0; i < 2000; i++) {
    const k = r.int(2, 5);
    assert.ok(k >= 2 && k <= 5 && Number.isInteger(k));
    seen.add(k);
  }
  assert.equal(seen.size, 4, 'int() covers both ends inclusive');
});

// ---------------------------------------------------------------------------------------------
test('noiseData: normalised, finite, pink darker than white', () => {
  const pr = new Prng(1);
  const w = noiseData('white', 48000, () => pr.next());
  const p = noiseData('pink', 48000, () => pr.next());
  const br = noiseData('brown', 48000, () => pr.next());
  for (const [d, n] of [[w, 'white'], [p, 'pink'], [br, 'brown']] as const) {
    finite(d, n);
    let pk = 0;
    for (const v of d) pk = Math.max(pk, Math.abs(v));
    near(pk, 1, 1e-6, `${n} peak`);
  }
  // high-frequency content ~ energy of the first difference relative to the signal
  const hf = (d: Float32Array) => {
    let e = 0;
    for (let i = 1; i < d.length; i++) e += (d[i]! - d[i - 1]!) ** 2;
    return e / (rms(d) ** 2 * d.length);
  };
  assert.ok(hf(p) < hf(w) * 0.6, 'pink has less HF than white');
  assert.ok(hf(br) < hf(p), 'brown darker than pink');
});

test('ksData: loop period matches requested pitch and the string decays', () => {
  const sr = 48000;
  for (const f of [82.41, 196, 440, 1046.5]) {
    for (const bright of [0.1, 0.5, 0.9]) {
      const pr = new Prng(9);
      const { data, rate } = ksData(sr, f, 1.2, bright, () => pr.next());
      finite(data, `ks ${f}`);
      assert.ok(rate > 0.9 && rate < 1.1, `rate ${rate}`);
      // playing the buffer at `rate` must give f: buffer period (samples) == sr * rate / f
      const period = (sr * rate) / f;
      // autocorrelation peak search around the expected period, after the attack
      const st = Math.floor(sr * 0.05);
      const n = Math.min(4096, data.length - st - Math.ceil(period) * 2);
      let best = 0;
      let bestLag = 0;
      for (let lag = Math.floor(period * 0.8); lag <= Math.ceil(period * 1.2); lag++) {
        let s = 0;
        for (let i = 0; i < n; i++) s += data[st + i]! * data[st + i + lag]!;
        if (s > best) {
          best = s;
          bestLag = lag;
        }
      }
      assert.ok(Math.abs(bestLag - period) <= 1.01, `f=${f} bright=${bright}: lag ${bestLag} vs period ${period.toFixed(2)}`);
      const head = rms(data, 0, Math.floor(data.length * 0.1));
      const tail = rms(data, Math.floor(data.length * 0.9));
      assert.ok(tail < head * 0.2, `decays (${tail} vs ${head})`);
      near(data[data.length - 1]!, 0, 1e-3, 'faded end');
    }
  }
});

test('irData: stereo, finite, energy-normalised, decaying', () => {
  for (const [name, p] of Object.entries(SPACES)) {
    const [l, r] = irData(44100, p.seconds, { decay: p.decay, predelay: p.predelay, brightness: p.brightness, seed: 3 });
    assert.equal(l.length, r.length);
    near(l.length / 44100, p.seconds, 0.01);
    finite(l, name);
    finite(r, name);
    let e = 0;
    for (const d of [l, r]) for (const v of d) e += v * v;
    near(e / 2, 0.36, 0.01, `${name} energy`);
    const pre = Math.floor(44100 * p.predelay) + 1;
    assert.ok(rms(l, Math.floor(l.length * 0.85), l.length) < rms(l, pre, pre + 4410) * 0.1, `${name} tail decays`);
    assert.notDeepEqual(l.slice(pre, pre + 200), r.slice(pre, pre + 200), 'decorrelated ears');
  }
});

test('softClipCurve: odd, monotonic, transparent below knee, bounded', () => {
  const c = softClipCurve(4096, 0.82, 0.985);
  let prev = -Infinity;
  for (let i = 0; i < c.length; i++) {
    assert.ok(c[i]! >= prev, 'monotonic');
    prev = c[i]!;
    assert.ok(Math.abs(c[i]!) <= 0.985 + 1e-7, 'bounded');
    near(c[i]!, -c[c.length - 1 - i]!, 1e-6, 'odd');
    const x = (i / (c.length - 1)) * 2 - 1;
    if (Math.abs(x) <= 0.82) near(c[i]!, x, 1e-6, 'identity');
  }
});

test('analyse: peak/rms/NaN/clip on known signals', () => {
  const sr = 1000;
  const s = new Float32Array(sr);
  for (let i = 0; i < sr; i++) s[i] = 0.5 * Math.sin((2 * Math.PI * 10 * i) / sr);
  const a = analyse([s], sr);
  near(a.peak, 0.5, 1e-3);
  near(a.rms, 0.5 / Math.SQRT2, 3e-3);
  assert.equal(a.nan, false);
  assert.equal(a.clipped, 0);
  const z = new Float32Array(100);
  z[50] = NaN;
  z[60] = 1;
  const b = analyse([z], 100);
  assert.equal(b.nan, true);
  assert.equal(b.clipped, 1);
  assert.equal(analyse([new Float32Array(10)], 10).rms, 0);
});

test('loop texture generators: finite, normalised, not silent', () => {
  const pr = new Prng(4);
  for (const [n, d] of [['crackle', crackleData(44100, 2, 20, () => pr.next())], ['tick', tickData(44100, 0.5)], ['drip', dripData(44100, 2, 6, () => pr.next())]] as const) {
    finite(d, n);
    let pk = 0;
    for (const v of d) pk = Math.max(pk, Math.abs(v));
    near(pk, 1, 1e-6, `${n} peak`);
    assert.ok(rms(d) > 0.005, `${n} audible`);
  }
  assert.equal(tickData(1000, 0.5).length, 1000, 'tick buffer = tick + tock');
});

// ---------------------------------------------------------------------------------------------
test('parseChord', () => {
  assert.deepEqual(parseChord('Cmaj7').pcs, [0, 4, 7, 11]);
  assert.deepEqual(parseChord('Am').pcs, [9, 0, 4]);
  const d = parseChord('D/F#');
  assert.equal(d.root, 2);
  assert.equal(d.bass, 6);
  assert.deepEqual(parseChord('Bbm7b5').pcs, [10, 1, 4, 8]);
  assert.deepEqual(parseChord('Fmaj7#11').pcs, [5, 9, 0, 4, 11]);
  assert.throws(() => parseChord('H7'));
  assert.throws(() => parseChord('Cfoo'));
  assert.throws(() => parseChord('C/X'));
});

test('voiceChord: ascending, compact, smooth voice leading', () => {
  const c = parseChord('C');
  const v1 = voiceChord(c, 55);
  assert.equal(v1.length, 3);
  for (let i = 1; i < v1.length; i++) assert.ok(v1[i]! > v1[i - 1]!);
  assert.ok(v1[0]! >= 55 && v1[v1.length - 1]! - v1[0]! < 12);
  for (const n of v1) assert.ok(c.pcs.includes(n % 12));
  // moving C -> F from a C voicing should move each voice by at most a few semitones
  const v2 = voiceChord(parseChord('F'), 55, v1);
  const mean = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
  assert.ok(Math.abs(mean(v2) - mean(v1)) <= 3, `smooth: ${v1} -> ${v2}`);
  // 5-note chords are thinned to max voices, keeping the colour tones
  const m9 = voiceChord(parseChord('Dm9'), 50, undefined, 4);
  assert.equal(m9.length, 4);
  assert.ok(m9.some((n) => n % 12 === 4), 'keeps the 9th');
});

test('scaleNotes / chordTones / swingBeat', () => {
  const cMaj = scaleNotes(0, MODES.ionian, 60, 72);
  assert.deepEqual(cMaj, [60, 62, 64, 65, 67, 69, 71, 72]);
  assert.deepEqual(scaleNotes(2, MODES.phrygian, 62, 66), [62, 63, 65]);
  assert.deepEqual(chordTones(parseChord('G'), 60, 72), [62, 67, 71]);
  for (const sw of [0, 0.3, 0.65, 1]) {
    assert.equal(swingBeat(0, sw), 0);
    near(swingBeat(1, sw), 1, 1e-12);
    near(swingBeat(2.5, sw), 2 + 0.5 + sw / 6, 1e-12);
    let prev = -1;
    for (let b = 0; b <= 4; b += 0.125) {
      const w = swingBeat(b, sw);
      assert.ok(w > prev, 'monotonic');
      prev = w;
    }
  }
});

test('tracks: every required track exists with 3-4 stems and valid harmony', () => {
  for (const n of REQUIRED_TRACKS) assert.ok(TRACKS[n], `missing track ${n}`);
  assert.ok(TRACK_NAMES.length >= 13);
  for (const t of Object.values(TRACKS)) {
    assert.ok(t.stems.length >= 3 && t.stems.length <= 4, `${t.name} stems`);
    assert.equal(t.parts.length, t.stems.length, `${t.name} parts`);
    assert.ok(t.bpm >= 40 && t.bpm <= 200, `${t.name} bpm`);
    assert.ok(t.beats === 3 || t.beats === 4);
    assert.ok(t.progs.length >= 1);
    for (const p of t.progs) for (const c of p) assert.doesNotThrow(() => parseChord(c), `${t.name}: ${c}`);
    if (t.layers) assert.equal(t.layers.length, t.stems.length);
    // stem gains: stem 0 always on, full intensity = everything, monotonic in intensity
    const g0 = stemGains(t, 0);
    const g1 = stemGains(t, 1);
    assert.equal(g0[0], 1);
    for (const g of g1) near(g, 1, 1e-9, `${t.name} full`);
    for (let i = 1; i < g0.length; i++) assert.ok(g0[i]! < 0.05, `${t.name} stem ${i} silent at 0`);
    for (let i = 0; i < t.stems.length; i++) {
      let prev = -1;
      for (let v = 0; v <= 1.0001; v += 0.05) {
        const g = stemGains(t, v)[i]!;
        assert.ok(g >= prev - 1e-12);
        prev = g;
      }
    }
  }
  assert.equal(TRACKS.landing!.beats, 3, 'landing is a waltz');
  const idents = new Set(Object.values(TRACKS).map((t) => `${t.key}-${t.mode}-${t.bpm}`));
  assert.equal(idents.size, TRACK_NAMES.length, 'every track has its own key/mode/tempo identity');
});

// ---------------------------------------------------------------------------------------------
test('sfx catalogue', () => {
  const missing = REQUIRED_SFX.filter((n) => !SFX[n]);
  assert.deepEqual(missing, [], 'required sfx present');
  assert.ok(SFX_NAMES.length >= 80, `>= 80 sfx (have ${SFX_NAMES.length})`);
  const cats = new Set(['ui', 'system', 'reward', 'move', 'action', 'world', 'puzzle', 'magic', 'creature', 'social', 'ambient', 'motif']);
  for (const n of SFX_NAMES) {
    const d = SFX[n]!;
    assert.ok(cats.has(d.cat), `${n} category`);
    assert.equal(typeof d.play, 'function');
    if (d.wet !== undefined) assert.ok(d.wet >= 0 && d.wet <= 1, `${n} wet`);
    if (d.gap !== undefined) assert.ok(d.gap >= 0 && d.gap < 5, `${n} gap`);
  }
  for (const k of ['a', 'b', 'c', 'd', 'e', 'x', 'crown']) assert.ok(SFX[`door_motif_${k}`], `door motif ${k}`);
  near(FORK_HZ.fork_low, mtof(60), 0.01);
  near(FORK_HZ.fork_mid, mtof(64), 0.01);
  near(FORK_HZ.fork_high, mtof(67), 0.01);
  near(FORK_HZ.fork_trap, mtof(70), 0.01);
  assert.ok(PARTIALS.fork.length >= 1);
  assert.ok(LOOP_NAMES.length >= 8);
  for (const n of LOOP_NAMES) assert.equal(typeof LOOPS[n]!.build, 'function');
});

test('GDD 15.2 stingers exist', () => {
  for (const n of ['clear_sting', 'fail_sting', 'title_fanfare', 'tide_swell', 'knot_tie', 'rope_snap']) assert.ok(SFX[n], n);
});

// ---------------------------------------------------------------------------------------------
test('babble: mood from phrase type', () => {
  assert.equal(babbleMood('Over here.'), 'statement');
  assert.equal(babbleMood('Who did it?'), 'question');
  assert.equal(babbleMood('Who did it?!'), 'question');
  assert.equal(babbleMood('Run!'), 'shout');
  assert.equal(babbleMood('You are a liar'), 'shout');
  assert.equal(babbleMood('help me'), 'shout');
  assert.equal(babbleMood('Sorry...'), 'sorry');
  assert.equal(babbleMood('oops, sorry!'), 'sorry');
});

test('babble: syllables, timing, vowels, contour (GDD 15.3)', () => {
  const line = 'Knot with me, I have the key.';
  const a = planBabble(line, { f0: 300 });
  assert.deepEqual(a, planBabble(line, { f0: 300 }), 'deterministic');
  assert.ok(a.length >= 7 && a.length <= 10, `syllable count ${a.length}`);
  let prevEnd = -1;
  for (const s of a) {
    assert.ok(s.dur >= 0.07 - 1e-9 && s.dur <= 0.11 + 1e-9, `70-110 ms (${s.dur})`);
    assert.ok(s.t >= prevEnd - 1e-9, 'syllables never overlap');
    prevEnd = s.t + s.dur;
    for (const v of [s.t, s.dur, s.f0, s.f1, s.gain]) assert.ok(Number.isFinite(v) && v >= 0);
    assert.ok('aeiou'.includes(s.vowel));
  }
  assert.equal(a[0]!.vowel, 'o', 'vowel comes from the letters ("knot")');
  assert.equal(a[2]!.vowel, 'e', '"me"');
  // a comma leaves a longer gap than a syllable boundary
  const gaps = a.slice(1).map((s, i) => s.t - (a[i]!.t + a[i]!.dur));
  assert.ok(Math.max(...gaps) >= 0.12, 'comma pause');
  // statement drifts down; question ends high and rising; sorry falls; shout sits high
  const q = planBabble('Is it you?', { f0: 300 });
  const lastQ = q[q.length - 1]!;
  assert.ok(lastQ.f0 > q[0]!.f0 * 1.2 && lastQ.f1 > lastQ.f0, 'question rises');
  const s = planBabble('Sorry sorry sorry sorry', { f0: 300 });
  assert.ok(s[s.length - 1]!.f0 < s[0]!.f0 * 0.85 && s.every((x) => x.f1 < x.f0), 'sorry falls');
  const shout = planBabble('Help!', { f0: 300 });
  assert.ok(shout[0]!.f0 > 300 * Math.pow(2, 2 / 12), 'shout is high');
  // Resolve tell: exactly a perfect fourth down
  const r = planBabble(line, { f0: 300, resolve: true });
  r.forEach((x, i) => near(x.f0 / a[i]!.f0, Math.pow(2, -5 / 12), 1e-9, 'resolve drops a fourth'));
  // capped, and nothing to say is silence
  assert.equal(planBabble('la '.repeat(100), { maxSyllables: 12 }).length, 12);
  assert.deepEqual(planBabble('   ...  '), []);
  assert.ok(planBabble('?!', {}).length === 0);
  assert.ok(planBabble('42', {}).length === 1, 'numbers still babble');
  for (const x of planBabble('Über café naïve', { f0: NaN })) assert.ok(Number.isFinite(x.f0) && x.f0 > 0);
});

// ---------------------------------------------------------------------------------------------
test('spatialize: panning follows the listener frame', () => {
  const o = { x: 0, y: 0, z: 0 };
  const fwd = { x: 0, y: 0, z: -1 };
  const right = spatialize(o, fwd, { x: 5, y: 0, z: 0 });
  const left = spatialize(o, fwd, { x: -5, y: 0, z: 0 });
  assert.ok(right.pan > 0.5 && left.pan < -0.5, `pan ${right.pan} / ${left.pan}`);
  // turn to face +X: the source at +X is now in front (centred), the one at +Z is on the right
  const east = { x: 1, y: 0, z: 0 };
  near(spatialize(o, east, { x: 5, y: 0, z: 0 }).pan, 0, 1e-9);
  assert.ok(spatialize(o, east, { x: 0, y: 0, z: 5 }).pan > 0.5);
  // pitch of the camera must not matter (forward is flattened)
  near(spatialize(o, { x: 0, y: -0.9, z: -0.1 }, { x: 5, y: 0, z: 0 }).pan, right.pan, 1e-9);
  // degenerate forward falls back to -Z
  near(spatialize(o, { x: 0, y: 1, z: 0 }, { x: 5, y: 0, z: 0 }).pan, right.pan, 1e-9);
  const at = spatialize(o, fwd, o);
  assert.equal(at.pan, 0);
  near(at.gain, 1, 1e-9);
});

test('spatialize: distance, air absorption, head shadow', () => {
  const o = { x: 0, y: 0, z: 0 };
  const fwd = { x: 0, y: 0, z: -1 };
  let prevG = Infinity;
  let prevLp = Infinity;
  let prevW = -Infinity;
  for (let d = 0; d <= 50; d += 1) {
    const s = spatialize(o, fwd, { x: 0, y: 0, z: -d });
    for (const v of [s.gain, s.pan, s.lowpass, s.wet]) assert.ok(Number.isFinite(v));
    assert.ok(s.gain <= prevG + 1e-12 && s.lowpass <= prevLp + 1e-9 && s.wet >= prevW - 1e-12);
    prevG = s.gain;
    prevLp = s.lowpass;
    prevW = s.wet;
  }
  near(spatialize(o, fwd, { x: 0, y: 0, z: -2 }).gain, 1, 1e-9, 'inside ref distance');
  near(spatialize(o, fwd, { x: 0, y: 0, z: -60 }).gain, 0, 1e-9, 'beyond max');
  const front = spatialize(o, fwd, { x: 0, y: 0, z: -6 });
  const back = spatialize(o, fwd, { x: 0, y: 0, z: 6 });
  near(front.gain, back.gain, 1e-9);
  assert.ok(back.lowpass < front.lowpass * 0.7, 'behind is darker');
});

test('volumes: parse, clamp, fall back, perceptual curve', () => {
  assert.deepEqual(parseVolumes(null), DEFAULT_VOLUMES);
  assert.deepEqual(parseVolumes('not json'), DEFAULT_VOLUMES);
  assert.deepEqual(parseVolumes('null'), DEFAULT_VOLUMES);
  assert.deepEqual(parseVolumes('42'), DEFAULT_VOLUMES);
  assert.deepEqual(parseVolumes('{"master":0.3,"music":2,"sfx":-1}'), { master: 0.3, music: 1, sfx: 0 });
  assert.deepEqual(parseVolumes('{"music":"loud"}'), DEFAULT_VOLUMES);
  assert.equal(volToGain(0), 0);
  assert.equal(volToGain(1), 1);
  assert.equal(volToGain(NaN), 0);
  assert.equal(volToGain(3), 1);
  assert.ok(volToGain(0.5) < 0.5 && volToGain(0.5) > 0.1);
});

console.log(`audio_pure: ${passed} tests passed`);
