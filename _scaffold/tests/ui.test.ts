// Pure logic of the UI module (no DOM): markup + typing schedule, queue planning, clocks,
// designations, screen projection, chat rate limiting, key labels and number formatting.
import assert from 'node:assert/strict';
import {
  parseMarkup, segUnits, typeSchedule, punctuationPause, revealedAt, autoSeconds, stepChoice,
  planPromotions, normaliseTitle, formatAgo, pushHistory, TYPE_CPS, HISTORY_SIZE, GLITCH_MIN_INTERVAL,
} from '../src/ui/system_window.ts';
import { formatClock, parseDesignation, timerPhase, DOOR_LETTERS } from '../src/ui/hud.ts';
import { placeOnScreen, distanceFade, separate } from '../src/ui/bubbles.ts';
import { TokenBucket, parseEmotes, EMOTES } from '../src/ui/chat_feed.ts';
import { keyLabel, formatAmount, isIconName, TONE_META, TONES, RARITIES, RARITY_META, CURRENCIES } from '../src/ui/components.ts';
import { clamp, lerp, UI_SOUNDS, setUiSoundSink, uiSound } from '../src/ui/h.ts';

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
const near = (a: number, b: number, eps = 1e-6): void => assert.ok(Math.abs(a - b) <= eps, `${a} !~ ${b}`);

// ------------------------------------------------------------------------------------------------
// System window markup + typing
// ------------------------------------------------------------------------------------------------
test('parseMarkup: plain text is one segment', () => {
  assert.deepEqual(parseMarkup('You have been lit.'), [{ kind: 'text', text: 'You have been lit.' }]);
  assert.deepEqual(parseMarkup(''), []);
});

test('parseMarkup: redaction, titles, emphasis and key-caps', () => {
  const s = parseMarkup('Let it ███ itself. 「Slime-Warden」 is *mildly* impressed. Press {E}.');
  assert.deepEqual(s.map((x) => x.kind), ['text', 'redact', 'text', 'title', 'text', 'em', 'text', 'key', 'text']);
  assert.equal(s[1].text, '███');
  assert.equal(s[3].text, '「Slime-Warden」');
  assert.equal(s[5].text, 'mildly');
  assert.equal(s[7].text, 'E');
  assert.equal(s.map((x) => (x.kind === 'em' ? `*${x.text}*` : x.kind === 'key' ? `{${x.text}}` : x.text)).join(''),
    'Let it ███ itself. 「Slime-Warden」 is *mildly* impressed. Press {E}.');
});

test('parseMarkup: unmatched markers stay literal', () => {
  assert.deepEqual(parseMarkup('a * b { c'), [{ kind: 'text', text: 'a * b { c' }]);
});

test('segUnits: key-caps type as a single unit', () => {
  assert.equal(segUnits({ kind: 'key', text: 'Enter' }), 1);
  assert.equal(segUnits({ kind: 'text', text: 'abc' }), 3);
});

test('typeSchedule: GDD 35 cps, monotonic, one entry per unit', () => {
  assert.equal(TYPE_CPS, 35);
  const lines = [parseMarkup('abcdefghij')];
  const t = typeSchedule(lines);
  assert.equal(t.length, 10);
  near(t[9], 10 / 35);
  for (let i = 1; i < t.length; i++) assert.ok(t[i] > t[i - 1]);
});

test('typeSchedule: punctuation and line breaks add beats; redactions slam in fast', () => {
  const plain = typeSchedule([parseMarkup('abc def')]);
  const stop = typeSchedule([parseMarkup('abc. ef')]);
  assert.ok(stop[6] - plain[6] > 0.15, 'sentence pause');
  const two = typeSchedule([parseMarkup('abc'), parseMarkup('def')]);
  assert.ok(two[3] - two[2] > 0.15, 'line pause');
  const red = typeSchedule([parseMarkup('████')]);
  assert.ok(red[3] < 4 / 35, 'redaction faster than text');
  assert.equal(punctuationPause('.', 'x'), 0, 'no pause inside "3.14"');
  assert.ok(punctuationPause('!', undefined) > 0);
  assert.ok(punctuationPause(',', ' ') > 0);
});

test('revealedAt: binary search over the schedule', () => {
  const t = [0.1, 0.2, 0.3, 0.4];
  assert.equal(revealedAt(t, 0), 0);
  assert.equal(revealedAt(t, 0.1), 1);
  assert.equal(revealedAt(t, 0.25), 2);
  assert.equal(revealedAt(t, 9), 4);
  assert.equal(revealedAt([], 1), 0);
});

test('autoSeconds: 4 s + 50 ms per character from open, minus typing time', () => {
  near(autoSeconds(['x'.repeat(40)]), 6);
  near(autoSeconds(['x'.repeat(40)], 1.5), 4.5);
  near(autoSeconds([''], 0), 4);
  assert.equal(autoSeconds(['x'.repeat(40)], 50), 2, 'never below the minimum read time');
  near(autoSeconds(['x'.repeat(1000)]), 14, 1e-9);
});

test('stepChoice wraps both ways', () => {
  assert.equal(stepChoice(0, -1, 3), 2);
  assert.equal(stepChoice(2, 1, 3), 0);
  assert.equal(stepChoice(1, 1, 3), 2);
  assert.equal(stepChoice(0, 1, 0), 0);
});

test('planPromotions: FIFO, max visible, one interactive at a time', () => {
  assert.equal(planPromotions([], [false, false, false, false], 3), 3);
  assert.equal(planPromotions([false], [false, false, false], 3), 2);
  assert.equal(planPromotions([true], [false, true, false], 3), 1, 'stops at the 2nd interactive (strict FIFO)');
  assert.equal(planPromotions([], [true, true], 3), 1);
  assert.equal(planPromotions([false, false, false], [false], 3), 0);
});

test('normaliseTitle: strips brackets, uppercases', () => {
  assert.equal(normaliseTitle('[ Knot Tied ]'), 'KNOT TIED');
  assert.equal(normaliseTitle('hidden piece'), 'HIDDEN PIECE');
});

test('history: bounded, newest last', () => {
  assert.equal(HISTORY_SIZE, 10);
  const h: number[] = [];
  for (let i = 0; i < 25; i++) pushHistory(h, i);
  assert.deepEqual(h, [15, 16, 17, 18, 19, 20, 21, 22, 23, 24]);
  assert.deepEqual(pushHistory([1, 2], 3, 2), [2, 3]);
});

test('formatAgo', () => {
  assert.equal(formatAgo(-3), 'just now');
  assert.equal(formatAgo(4.9), 'just now');
  assert.equal(formatAgo(12.7), '12 s ago');
  assert.equal(formatAgo(185), '3 min ago');
  assert.equal(formatAgo(7300), '2 h ago');
});

test('glitch jolts are capped at 3 Hz (photosensitivity)', () => {
  assert.ok(1 / GLITCH_MIN_INTERVAL <= 3 + 1e-9);
});

// ------------------------------------------------------------------------------------------------
// HUD
// ------------------------------------------------------------------------------------------------
test('formatClock', () => {
  assert.equal(formatClock(245), '4:05');
  assert.equal(formatClock(42.9), '0:42');
  assert.equal(formatClock(10), '0:10');
  assert.equal(formatClock(9.96), '9.9');
  assert.equal(formatClock(0), '0.0');
  assert.equal(formatClock(-2), '0.0');
});

test('timerPhase: crimson under 30 s, urgent under 10 s', () => {
  assert.equal(timerPhase(74), 'calm');
  assert.equal(timerPhase(30), 'calm');
  assert.equal(timerPhase(29.9), 'warn');
  assert.equal(timerPhase(9.99), 'urgent');
  assert.equal(timerPhase(0), 'zero');
});

test('parseDesignation: combined and split forms', () => {
  assert.deepEqual(parseDesignation('1E · The Echo Nave'), { code: '1E', floor: 1, letter: 'E', name: 'The Echo Nave' });
  assert.deepEqual(parseDesignation('3A', 'The Harmony Sentinel'), { code: '3A', floor: 3, letter: 'A', name: 'The Harmony Sentinel' });
  assert.deepEqual(parseDesignation('Door 5♛: The Crown'), { code: '5♛', floor: 5, letter: '♛', name: 'The Crown' });
  const landing = parseDesignation('Landing · The Foot');
  assert.equal(landing.floor, null);
  assert.equal(landing.letter, null);
  assert.equal(landing.name, 'The Foot');
});

test('door letters each carry a distinct colour-blind shape that exists as an icon', () => {
  const shapes = Object.values(DOOR_LETTERS).map((d) => d.shape);
  assert.equal(new Set(shapes).size, shapes.length);
  for (const s of shapes) assert.ok(isIconName(s), `icon ${s}`);
  assert.equal(DOOR_LETTERS.E.shape, 'hex');
  assert.equal(DOOR_LETTERS.A.shape, 'tri');
});

// ------------------------------------------------------------------------------------------------
// Bubbles: projection helpers
// ------------------------------------------------------------------------------------------------
test('placeOnScreen: on-screen points map straight to pixels', () => {
  const p = placeOnScreen(0, 0, false, 1280, 720, 40);
  assert.deepEqual([p.x, p.y, p.clamped], [640, 360, false]);
  const q = placeOnScreen(0.5, 0.5, false, 1280, 720, 40);
  assert.deepEqual([q.x, q.y], [960, 180]);
});

test('placeOnScreen: off-screen points clamp to the inset rect edge', () => {
  const p = placeOnScreen(3, 0, false, 1280, 720, 40);
  assert.equal(p.clamped, true);
  near(p.x, 1240);
  near(p.y, 360);
  near(p.angle, 0);
});

test('placeOnScreen: behind the camera flips and always clamps', () => {
  const p = placeOnScreen(0.1, 0, true, 1280, 720, 40);
  assert.equal(p.clamped, true);
  assert.ok(p.x < 640, 'mirrored to the left');
  const c = placeOnScreen(0, 0, true, 1280, 720, 40);
  assert.equal(c.clamped, true);
  near(c.y, 680, 1e-6);
});

test('distanceFade: full near, smooth falloff, floor far', () => {
  assert.equal(distanceFade(5), 1);
  assert.equal(distanceFade(100), 0.32);
  const mid = distanceFade(26.5);
  assert.ok(mid < 1 && mid > 0.32);
  assert.ok(distanceFade(20) > distanceFade(30));
});

test('separate: overlapping bubbles are pushed apart vertically', () => {
  const xs = [100, 120];
  const ys = [200, 210];
  const ws = [150, 150];
  const hs = [40, 40];
  separate(xs, ys, ws, hs, 6);
  const top = Math.min(ys[0], ys[1]);
  const bot = Math.max(ys[0], ys[1]);
  assert.ok(bot - top >= 46 - 1e-9, `gap ${bot - top}`);
  const ys2 = [200, 205];
  separate([0, 500], ys2, [100, 100], [40, 40]);
  assert.deepEqual(ys2, [200, 205], 'no horizontal overlap -> untouched');
});

// ------------------------------------------------------------------------------------------------
// Chat feed
// ------------------------------------------------------------------------------------------------
test('TokenBucket: burst then steady rate', () => {
  const b = new TokenBucket(2, 3, 0);
  assert.equal([b.take(0), b.take(0), b.take(0), b.take(0)].filter(Boolean).length, 3);
  assert.equal(b.take(0.2), false);
  assert.equal(b.take(0.5), true, '0.5 s at 2/s refills one token');
  let n = 0;
  for (let t = 1; t <= 11; t += 0.01) if (b.take(t)) n++;
  assert.ok(n >= 19 && n <= 23, `~2/s over 10 s, got ${n}`);
});

test('parseEmotes: known :emotes: become parts, unknown stay text', () => {
  assert.deepEqual(parseEmotes('gg :fire: :nope: :GG:'), [
    { t: 'text', v: 'gg ' }, { t: 'emote', v: 'fire' }, { t: 'text', v: ' :nope: ' }, { t: 'emote', v: 'gg' },
  ]);
  assert.deepEqual(parseEmotes('plain'), [{ t: 'text', v: 'plain' }]);
  for (const [k, e] of Object.entries(EMOTES)) {
    assert.ok(e.icon || e.label, k);
    if (e.icon) assert.ok(isIconName(e.icon), `emote icon ${e.icon}`);
  }
});

// ------------------------------------------------------------------------------------------------
// Components metadata + helpers
// ------------------------------------------------------------------------------------------------
test('keyLabel', () => {
  assert.equal(keyLabel('KeyE'), 'E');
  assert.equal(keyLabel('Digit3'), '3');
  assert.equal(keyLabel('Space'), 'SPACE');
  assert.equal(keyLabel('Escape'), 'ESC');
  assert.equal(keyLabel('ArrowUp'), '↑');
  assert.equal(keyLabel('F11'), 'F11');
  assert.equal(keyLabel('Mouse0'), 'LMB');
  assert.equal(keyLabel('q'), 'Q');
});

test('formatAmount', () => {
  assert.equal(formatAmount(0), '0');
  assert.equal(formatAmount(1284), '1,284');
  assert.equal(formatAmount(12500), '12.5k');
  assert.equal(formatAmount(250000), '250k');
  assert.equal(formatAmount(3_400_000), '3.4M');
  assert.equal(formatAmount(-1500), '-1,500');
});

test('every tone, rarity and currency has complete metadata', () => {
  assert.deepEqual([...TONES].sort(), ['danger', 'glitch', 'info', 'patron', 'quest', 'reward', 'warning']);
  for (const t of TONES) {
    const m = TONE_META[t];
    assert.ok(m.tag && m.kr && isIconName(m.icon), t);
  }
  assert.deepEqual([...RARITIES], ['common', 'rare', 'epic', 'mythic', 'oath']);
  for (const r of RARITIES) assert.match(RARITY_META[r].color, /^#[0-9a-f]{6}$/i);
  for (const [k, c] of Object.entries(CURRENCIES)) assert.ok(isIconName(c.icon), k);
});

test('clamp / lerp', () => {
  assert.equal(clamp(5, 0, 1), 1);
  assert.equal(clamp(-5, 0, 1), 0);
  assert.equal(lerp(2, 4, 0.5), 3);
});

test('uiSound: routed through the sink, rate-limited per name, names documented', () => {
  const got: string[] = [];
  setUiSoundSink((n) => got.push(n));
  uiSound('ui_click');
  uiSound('type_tick', 10_000);
  uiSound('type_tick', 10_000);
  uiSound('ui_click');
  setUiSoundSink(null);
  uiSound('ui_click');
  assert.deepEqual(got, ['ui_click', 'type_tick', 'ui_click']);
  for (const t of TONES) assert.ok((UI_SOUNDS as readonly string[]).includes(`system_open_${t}`), t);
  assert.ok((UI_SOUNDS as readonly string[]).includes('type_tick'));
});

console.log(`ui: ${passed} tests passed`);
