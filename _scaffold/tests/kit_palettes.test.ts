import assert from 'node:assert/strict';
import {
  BIOMES, LETTERS, LETTER_ACCENTS, PALETTES, adjustHsl, biomeForFloor, contrastRatio, hexToRgb, hslToRgb, luminance,
  mixHex, paletteFor, rgbToHex, rgbToHsl, shadeHex,
} from '../src/world/palettes.ts';
import type { Palette } from '../src/world/palettes.ts';

const tests: [string, () => void][] = [];
const test = (name: string, fn: () => void): void => { tests.push([name, fn]); };
const HEX = /^#[0-9a-f]{6}$/;

test('hex <-> rgb round trip and short form', () => {
  assert.deepEqual(hexToRgb('#ff6b2c'), [255, 107, 44]);
  assert.deepEqual(hexToRgb('#abc'), [170, 187, 204]);
  assert.equal(rgbToHex([255, 107, 44]), '#ff6b2c');
  assert.equal(rgbToHex([300, -4, 12.6]), '#ff000d');
  assert.throws(() => hexToRgb('#12345'));
});

test('mix / shade stay in gamut and hit the endpoints', () => {
  assert.equal(mixHex('#000000', '#ffffff', 0), '#000000');
  assert.equal(mixHex('#000000', '#ffffff', 1), '#ffffff');
  assert.equal(mixHex('#000000', '#ffffff', 0.5), '#808080');
  assert.equal(shadeHex('#808080', 1), '#ffffff');
  assert.equal(shadeHex('#808080', -1), '#000000');
  assert.ok(luminance(shadeHex('#4fc3f7', 0.3)) > luminance('#4fc3f7'));
});

test('WCAG luminance / contrast', () => {
  assert.equal(luminance('#ffffff'), 1);
  assert.equal(luminance('#000000'), 0);
  assert.equal(Math.round(contrastRatio('#ffffff', '#000000')), 21);
  assert.equal(contrastRatio('#123456', '#123456'), 1);
});

test('hsl round trip within 1/255', () => {
  for (const hex of ['#ff6b2c', '#4fc3f7', '#8bd450', '#f2b134', '#b388ff', '#00e5c0', '#777777']) {
    const back = hslToRgb(rgbToHsl(hexToRgb(hex)));
    const orig = hexToRgb(hex);
    for (let i = 0; i < 3; i++) assert.ok(Math.abs(back[i] - orig[i]) <= 1, `${hex} channel ${i}: ${back[i]} vs ${orig[i]}`);
  }
  // Desaturating fully gives a grey.
  const [r, g, b] = hexToRgb(adjustHsl('#ff6b2c', 0, 0, 0));
  assert.ok(Math.abs(r - g) <= 1 && Math.abs(g - b) <= 1);
});

test('GDD letter colours are exact', () => {
  const gdd: Record<string, string> = { A: '#ff6b2c', B: '#4fc3f7', C: '#8bd450', D: '#f2b134', E: '#b388ff', X: '#00e5c0', CROWN: '#fff1c1' };
  for (const l of LETTERS) {
    assert.equal(LETTER_ACCENTS[l].color, gdd[l]);
    assert.match(LETTER_ACCENTS[l].glow, HEX);
    assert.match(LETTER_ACCENTS[l].deep, HEX);
    assert.ok(luminance(LETTER_ACCENTS[l].glow) >= luminance(LETTER_ACCENTS[l].color));
    assert.ok(luminance(LETTER_ACCENTS[l].deep) < luminance(LETTER_ACCENTS[l].color));
  }
});

test('every palette colour is a valid hex; layers go outward', () => {
  const walk = (o: unknown, path: string): void => {
    if (typeof o === 'string') {
      if (path.endsWith('.id') || path.endsWith('.name')) return;
      assert.match(o, HEX, path);
    } else if (Array.isArray(o)) o.forEach((v, i) => walk(v, `${path}[${i}]`));
    else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) walk(v, `${path}.${k}`);
  };
  BIOMES.forEach((b, i) => {
    const p: Palette = PALETTES[b];
    walk(p, b);
    assert.equal(p.id, b);
    assert.equal(p.layer, i + 1);
    assert.ok(p.mossAmount >= 0 && p.mossAmount <= 1 && p.wetness >= 0 && p.wetness <= 1);
  });
  assert.ok(PALETTES.well.mossAmount > PALETTES.space.mossAmount, 'the Well is the mossy one');
});

test('readability: letter colours stand out against each biome fog/sky', () => {
  for (const b of BIOMES) {
    const p = PALETTES[b];
    for (const l of ['A', 'B', 'C', 'D', 'E', 'X'] as const) {
      const c = LETTER_ACCENTS[l].glow;
      // Plates are emissive + bloom; require at least a modest contrast against the darkest backdrop.
      const worst = Math.min(contrastRatio(c, p.stoneDark), contrastRatio(c, p.voidColor));
      assert.ok(worst >= 1.6, `${l} on ${b}: ${worst.toFixed(2)}`);
    }
  }
});

test('paletteFor swaps the accent and never mutates the base', () => {
  const before = PALETTES.sky.accent;
  const p = paletteFor('sky', 'E');
  assert.equal(p.accent, LETTER_ACCENTS.E.color);
  assert.equal(PALETTES.sky.accent, before);
  p.stone = '#000000';
  assert.notEqual(PALETTES.sky.stone, '#000000');
  assert.equal(paletteFor('well').accent, PALETTES.well.accent);
});

test('biomeForFloor maps the climb and clamps', () => {
  assert.equal(biomeForFloor(1), 'well');
  assert.equal(biomeForFloor(2), 'sky');
  assert.equal(biomeForFloor(3), 'space');
  assert.equal(biomeForFloor(4), 'beyond');
  assert.equal(biomeForFloor(9), 'beyond');
  assert.equal(biomeForFloor(0), 'well');
  assert.equal(biomeForFloor(-3), 'well');
});

let failed = 0;
for (const [name, fn] of tests) {
  try { fn(); console.log(`ok - ${name}`); }
  catch (e) { failed++; console.error(`FAIL - ${name}`); console.error(e); }
}
console.log(`${tests.length - failed}/${tests.length} kit palette tests passed`);
if (failed) process.exit(1);
