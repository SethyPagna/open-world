/**
 * Colour palettes for the concentric world layers ("frog in a well"): the Well -> the Sky -> Space ->
 * the Beyond, plus the door-letter accents from the GDD (§3.4). Pure data + colour maths (no THREE),
 * so it runs in Node tests and on the server.
 *
 * Convention: every colour is an sRGB hex string '#rrggbb'. Kit geometry carries these as vertex
 * colours over mostly-white materials, so one material (one draw call) serves every tint of a surface.
 */

export type BiomeId = 'well' | 'sky' | 'space' | 'beyond';
export type RoomLetter = 'A' | 'B' | 'C' | 'D' | 'E' | 'X' | 'CROWN';
export const BIOMES: readonly BiomeId[] = ['well', 'sky', 'space', 'beyond'];
export const LETTERS: readonly RoomLetter[] = ['A', 'B', 'C', 'D', 'E', 'X', 'CROWN'];

export interface WaterColors { deep: string; shallow: string; foam: string; glint: string; biolume: string }
export interface SkyColors {
  zenith: string; horizon: string; ground: string;
  sun: string; sunGlow: string; haze: string;
  cloud: string; cloudShade: string;
  /** Space/Beyond: nebula / cosmos tones. Well: shaft wall tone. */
  nebulaA: string; nebulaB: string; nebulaC: string;
  stars: string; planet: string; planetShade: string;
}

export interface Palette {
  readonly id: BiomeId;
  readonly name: string;
  /** Ring index from the centre outwards (well = 1). */
  readonly layer: number;
  // Masonry
  stone: string; stoneDark: string; stoneLight: string; mortar: string; brick: string;
  tile: string; tileAlt: string; plaster: string;
  // Natural
  rock: string; rockDark: string; moss: string; mossBright: string; grass: string; leaf: string; petal: string;
  // Crafted
  wood: string; woodDark: string; brass: string; iron: string; cloth: string; clothAlt: string; paint: string;
  // Light and magic
  accent: string; accent2: string; glow: string; rune: string; lantern: string;
  crystal: string; crystalAlt: string; voidColor: string; iridescent: readonly [string, string, string];
  water: WaterColors;
  sky: SkyColors;
  /** 0..1 how much moss creeps over up-facing stone in this biome. */
  mossAmount: number;
  /** 0..1 how wet/glossy masonry is (well = very). */
  wetness: number;
}

/** Door letter identity colours (GDD §3.4). `glow` is the bloom-friendly light tint, `deep` the trim. */
export interface LetterAccent { letter: RoomLetter; name: string; color: string; glow: string; deep: string }

// ---------------------------------------------------------------------------------------------
// Colour maths (sRGB-space, good enough for palette authoring; lighting happens in linear in GPU)
// ---------------------------------------------------------------------------------------------
/** sRGB channels as bytes 0..255 (matches canvas ImageData and CSS). */
export type Rgb = [number, number, number];

export function hexToRgb(hex: string): Rgb {
  let h = hex.trim().replace(/^#/, '');
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  if (!/^[0-9a-fA-F]{6}$/.test(h)) throw new Error(`bad hex colour "${hex}"`);
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Clamps to 0..255 and rounds, so maths results can be passed straight in. */
export function rgbToHex(rgb: Rgb): string {
  const c = (v: number) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0');
  return '#' + c(rgb[0]) + c(rgb[1]) + c(rgb[2]);
}

export function mixHex(a: string, b: string, t: number): string {
  const x = hexToRgb(a);
  const y = hexToRgb(b);
  return rgbToHex([x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t]);
}

/** amount > 0 lightens toward white, < 0 darkens toward black. */
export function shadeHex(hex: string, amount: number): string {
  return amount >= 0 ? mixHex(hex, '#ffffff', amount) : mixHex(hex, '#000000', -amount);
}

/** WCAG relative luminance (0..1). */
export function luminance(hex: string): number {
  const lin = (byte: number) => {
    const v = byte / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Bytes in, [h, s, l] in 0..1 out. */
export function rgbToHsl(rgb: Rgb): Rgb {
  const r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return [h / 6, s, l];
}

/** [h, s, l] in 0..1 in, bytes out. */
export function hslToRgb([h, s, l]: Rgb): Rgb {
  if (s === 0) return [l * 255, l * 255, l * 255];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const f = (t: number) => {
    let x = t;
    if (x < 0) x += 1;
    if (x > 1) x -= 1;
    if (x < 1 / 6) return p + (q - p) * 6 * x;
    if (x < 1 / 2) return q;
    if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6;
    return p;
  };
  return [f(h + 1 / 3) * 255, f(h) * 255, f(h - 1 / 3) * 255];
}

/** Rotate hue (turns), scale saturation, add lightness. Used for per-piece tint jitter. */
export function adjustHsl(hex: string, dh: number, sMul = 1, dl = 0): string {
  const [h, s, l] = rgbToHsl(hexToRgb(hex));
  return rgbToHex(hslToRgb([(((h + dh) % 1) + 1) % 1, Math.min(1, Math.max(0, s * sMul)), Math.min(1, Math.max(0, l + dl))]));
}

// ---------------------------------------------------------------------------------------------
// Letters (GDD §3.4: A ember, B ink blue, C moss, D brass, E lavender, X verdigris, Crown white-gold)
// ---------------------------------------------------------------------------------------------
function accent(letter: RoomLetter, name: string, color: string): LetterAccent {
  return { letter, name, color, glow: shadeHex(color, 0.35), deep: shadeHex(color, -0.55) };
}

export const LETTER_ACCENTS: Readonly<Record<RoomLetter, LetterAccent>> = {
  A: accent('A', 'Arena', '#ff6b2c'),
  B: accent('B', 'Baffle', '#4fc3f7'),
  C: accent('C', 'Chain & Climb', '#8bd450'),
  D: accent('D', 'Dilemma', '#f2b134'),
  E: accent('E', 'Enigma', '#b388ff'),
  X: accent('X', 'Secret', '#00e5c0'),
  CROWN: accent('CROWN', 'Crown', '#fff1c1'),
};

// ---------------------------------------------------------------------------------------------
// Biome palettes
// ---------------------------------------------------------------------------------------------
const WELL: Palette = {
  id: 'well', name: 'The Well', layer: 1,
  stone: '#857d70', stoneDark: '#4a4a44', stoneLight: '#b3aa98', mortar: '#2c302c', brick: '#8a7766',
  tile: '#6f6a5f', tileAlt: '#5d6259', plaster: '#9c9383',
  rock: '#5c5a52', rockDark: '#33332f', moss: '#557d33', mossBright: '#8fbf4a', grass: '#5b8a38', leaf: '#3f8f5a', petal: '#ffd6f0',
  wood: '#7e5436', woodDark: '#4a3020', brass: '#c9953f', iron: '#3f4447', cloth: '#8e2c3a', clothAlt: '#2f6368', paint: '#b8442f',
  accent: '#ffb35c', accent2: '#5dffd8', glow: '#ffc86b', rune: '#62ffe6', lantern: '#ffae55',
  crystal: '#3ff0d0', crystalAlt: '#a8ff6a', voidColor: '#050c0d', iridescent: ['#5dffd8', '#a8ff6a', '#ffc86b'],
  water: { deep: '#06343b', shallow: '#1a8c86', foam: '#c6fff0', glint: '#fff1c8', biolume: '#5dffd8' },
  sky: {
    zenith: '#cdeeff', horizon: '#8cc9ef', ground: '#0a1516',
    sun: '#fff6dc', sunGlow: '#ffe2a0', haze: '#bfe9ff',
    cloud: '#ffffff', cloudShade: '#a9c7dc',
    nebulaA: '#1c2a28', nebulaB: '#3a4a3c', nebulaC: '#5dffd8',
    stars: '#fff6e0', planet: '#ffffff', planetShade: '#ffffff',
  },
  mossAmount: 0.75, wetness: 0.8,
};

const SKY: Palette = {
  id: 'sky', name: 'The Sky', layer: 2,
  stone: '#ece4d4', stoneDark: '#988972', stoneLight: '#fffaf0', mortar: '#cbbfaa', brick: '#efe3cf',
  tile: '#f4ecdd', tileAlt: '#d9c6a0', plaster: '#fbf4e6',
  rock: '#b9a48c', rockDark: '#7c6655', moss: '#8ccf64', mossBright: '#b9ec7c', grass: '#88cc5c', leaf: '#6cc47a', petal: '#ffe1f0',
  wood: '#b27b4b', woodDark: '#7a4f30', brass: '#e9b949', iron: '#6d7688', cloth: '#3d80d6', clothAlt: '#f2b134', paint: '#e9564a',
  accent: '#ffd36b', accent2: '#7fd8ff', glow: '#ffe8a8', rune: '#ffd36b', lantern: '#ffd27a',
  crystal: '#a8ecff', crystalAlt: '#ffd6f5', voidColor: '#1b3b6b', iridescent: ['#ffb3de', '#a8ecff', '#fff1a8'],
  water: { deep: '#1f7fd0', shallow: '#8fe6ff', foam: '#ffffff', glint: '#fffbe6', biolume: '#bff4ff' },
  sky: {
    zenith: '#2f7fdc', horizon: '#c2e6ff', ground: '#f3f7ff',
    sun: '#fff5d6', sunGlow: '#ffcf70', haze: '#ffd7e6',
    cloud: '#ffffff', cloudShade: '#a9bde6',
    nebulaA: '#ff9ec7', nebulaB: '#9fe3ff', nebulaC: '#fff1a8',
    stars: '#ffffff', planet: '#ffffff', planetShade: '#dfe8ff',
  },
  mossAmount: 0.2, wetness: 0.1,
};

const SPACE: Palette = {
  id: 'space', name: 'Space', layer: 3,
  stone: '#4a4e78', stoneDark: '#23254a', stoneLight: '#7076a8', mortar: '#151630', brick: '#52557f',
  tile: '#34385e', tileAlt: '#4b5086', plaster: '#5d6190',
  rock: '#474163', rockDark: '#221f38', moss: '#3ad6c0', mossBright: '#7affe8', grass: '#3ad6c0', leaf: '#3ad6c0', petal: '#ff8ae6',
  wood: '#5c4a6e', woodDark: '#2e2440', brass: '#d8ad5e', iron: '#2c3046', cloth: '#6b2fa6', clothAlt: '#1fb8cc', paint: '#ff4fa8',
  accent: '#ff4fd8', accent2: '#4ff0ff', glow: '#a6f6ff', rune: '#7af3ff', lantern: '#b7e8ff',
  crystal: '#ff4fd8', crystalAlt: '#4ff0ff', voidColor: '#07061a', iridescent: ['#ff4fd8', '#4ff0ff', '#b388ff'],
  water: { deep: '#150b44', shallow: '#6a3cff', foam: '#d8f6ff', glint: '#ffffff', biolume: '#4ff0ff' },
  sky: {
    zenith: '#04031a', horizon: '#1b1044', ground: '#03020c',
    sun: '#eef4ff', sunGlow: '#9fc8ff', haze: '#3a1f6e',
    cloud: '#ffffff', cloudShade: '#6a5a9a',
    nebulaA: '#ff3fae', nebulaB: '#22cfff', nebulaC: '#7a3cff',
    stars: '#fff4e0', planet: '#ff9a5c', planetShade: '#3a1a4a',
  },
  mossAmount: 0.0, wetness: 0.25,
};

const BEYOND: Palette = {
  id: 'beyond', name: 'The Beyond', layer: 4,
  stone: '#e9defa', stoneDark: '#9280bd', stoneLight: '#ffffff', mortar: '#bfb0df', brick: '#e4d8fb',
  tile: '#fbf2ff', tileAlt: '#d6f4ff', plaster: '#fff8ff',
  rock: '#8d78d2', rockDark: '#4b3a86', moss: '#9dffcb', mossBright: '#d4ffe8', grass: '#9dffcb', leaf: '#8affd6', petal: '#ffb3f5',
  wood: '#c6a0f5', woodDark: '#7a5ab0', brass: '#ffe0a0', iron: '#6f5f9a', cloth: '#ff6fae', clothAlt: '#6ff4ff', paint: '#ff6fae',
  accent: '#ff7ad9', accent2: '#7afcff', glow: '#fff1c1', rune: '#ffffff', lantern: '#ffe6f4',
  crystal: '#aefcff', crystalAlt: '#ffb3f5', voidColor: '#12002a', iridescent: ['#ff7ad9', '#7afcff', '#fff27a'],
  water: { deep: '#3a0a6a', shallow: '#ff8ad8', foam: '#ffffff', glint: '#ffffff', biolume: '#7afcff' },
  sky: {
    zenith: '#12032e', horizon: '#ff8fd0', ground: '#0a0220',
    sun: '#fffbe8', sunGlow: '#ffe45f', haze: '#ff9ad5',
    cloud: '#ffffff', cloudShade: '#c7a3ff',
    nebulaA: '#ff5fd2', nebulaB: '#5ff2ff', nebulaC: '#ffe45f',
    stars: '#ffffff', planet: '#7afcff', planetShade: '#3a0a6a',
  },
  mossAmount: 0.0, wetness: 0.4,
};

export const PALETTES: Readonly<Record<BiomeId, Palette>> = { well: WELL, sky: SKY, space: SPACE, beyond: BEYOND };

/**
 * Palette for a room: the biome's palette with its accent swapped to the door letter's colour.
 * Returns a fresh object (safe to mutate).
 */
export function paletteFor(biome: BiomeId, letter?: RoomLetter): Palette {
  const base = PALETTES[biome];
  const p: Palette = { ...base, water: { ...base.water }, sky: { ...base.sky } };
  if (letter) {
    const a = LETTER_ACCENTS[letter];
    p.accent = a.color;
    p.glow = a.glow;
  }
  return p;
}

/** Biome for a floor number (1-based): 1 Well, 2 Sky, 3 Space, 4+ (and the Crown) the Beyond. */
export function biomeForFloor(floor: number): BiomeId {
  return BIOMES[Math.min(BIOMES.length - 1, Math.max(0, Math.floor(floor) - 1))];
}
