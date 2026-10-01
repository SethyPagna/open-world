// Reusable UI building blocks. Every factory returns plain DOM (or a tiny handle around it) and
// uses the design tokens from styles.css. Nothing here touches the DOM at import time.
import type { SystemTone } from '../core/api.ts';
import { h, svg, uiSound, clamp, type Child } from './h.ts';

// ---------------------------------------------------------------------------------------------
// Icons: 24x24 stroke glyphs, drawn in currentColor. Names are stable API for icon props.
// ---------------------------------------------------------------------------------------------
const ICON_PATHS: Record<string, string> = {
  flame: '<path d="M12 2.6c.5 2.8 2.3 4.4 3.7 6.1 1.4 1.7 2.3 3.4 2.3 5.6a6 6 0 0 1-12 0c0-2.3 1-3.9 2.3-5.2.3 1.4 1 2.4 2.1 2.9-.4-3.4.3-6.6 1.6-9.4Z"/><path d="M12 20.3a3 3 0 0 1-3-3c0-1.6 1.1-2.5 2-3.6.2 1 .7 1.6 1.4 1.9.5-.9.6-1.9.4-3 1.4 1 2.2 2.4 2.2 4.1a3 3 0 0 1-3 3.6Z"/>',
  drop: '<path d="M12 3.2c3 3.9 6 7.3 6 10.8a6 6 0 0 1-12 0c0-3.5 3-6.9 6-10.8Z"/><path d="M9.2 14.4a2.9 2.9 0 0 0 2.4 2.9"/>',
  spark: '<path d="M12 2.5l1.9 6.3c.2.7.7 1.2 1.4 1.4l6.2 1.8-6.2 1.8c-.7.2-1.2.7-1.4 1.4L12 21.5l-1.9-6.3c-.2-.7-.7-1.2-1.4-1.4L2.5 12l6.2-1.8c.7-.2 1.2-.7 1.4-1.4L12 2.5Z"/>',
  bolt: '<path d="M13.5 2.5 5 13.5h6l-1 8 8.5-11h-6l1-8Z"/>',
  shield: '<path d="M12 2.8 19.5 6v5.5c0 4.6-3.1 8.4-7.5 9.7-4.4-1.3-7.5-5.1-7.5-9.7V6L12 2.8Z"/><path d="m8.8 12 2.2 2.2 4.4-4.4"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3.2"/>',
  knot: '<path d="M12 12c-2-2.6-3.6-4-5.5-4a4 4 0 0 0 0 8c1.9 0 3.5-1.4 5.5-4Zm0 0c2 2.6 3.6 4 5.5 4a4 4 0 0 0 0-8c-1.9 0-3.5 1.4-5.5 4Z"/>',
  bell: '<path d="M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 2h-15l1.5-2Z"/><path d="M10 20.5a2 2 0 0 0 4 0"/><path d="M12 3v2"/>',
  key: '<circle cx="7.5" cy="12" r="4"/><path d="M11.5 12h10M18 12v3.5M21 12v2.5"/>',
  wind: '<path d="M3 8.5h11a3 3 0 1 0-3-3"/><path d="M3 12.5h15a3 3 0 1 1-3 3"/><path d="M3 16.5h7"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  mask: '<path d="M4 5.5c5 1.6 11 1.6 16 0v6c0 4.5-3.6 8-8 8s-8-3.5-8-8v-6Z"/><path d="M7.8 10.8h2.6M13.6 10.8h2.6M9 15c1.8 1.3 4.2 1.3 6 0"/>',
  heart: '<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.3 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10Z"/>',
  skull: '<path d="M12 3a7.5 7.5 0 0 0-7.5 7.5c0 2.6 1.3 4.3 3 5.3V19a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1v-3.2c1.7-1 3-2.7 3-5.3A7.5 7.5 0 0 0 12 3Z"/><circle cx="9" cy="11" r="1.6"/><circle cx="15" cy="11" r="1.6"/><path d="M10.5 20v-2.5M13.5 20v-2.5"/>',
  star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"/>',
  feather: '<path d="M19.5 4.5c-6.5-.5-12.5 4-13 12.5L4.5 19.5"/><path d="M19.5 4.5c.5 6.5-4 12.5-12.5 13"/><path d="M9 15l5-5"/>',
  door: '<path d="M5.5 21V9.5a6.5 6.5 0 0 1 13 0V21"/><path d="M3.5 21h17"/><path d="M12 9v12"/><circle cx="14.4" cy="14.5" r=".6"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  cross: '<path d="M6 6l12 12M18 6 6 18"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
  crown: '<path d="M3.5 8 7.5 12 12 5l4.5 7 4-4-1.8 10.5H5.3L3.5 8Z"/>',
  knife: '<path d="M20.5 3.5 10 14l-2-2L20.5 3.5Z"/><path d="m8 12-4.5 4.5 4 4L12 16"/>',
  candle: '<path d="M9 10h6v10.5H9z"/><path d="M12 3.5c1.3 1.4 2 2.5 2 3.6a2 2 0 0 1-4 0c0-1.1.7-2.2 2-3.6Z"/><path d="M7 20.5h10"/>',
  gem: '<path d="M6.5 4h11L21 9l-9 11.5L3 9l3.5-5Z"/><path d="M3 9h18M9 4l3 16.5L15 4"/>',
  chat: '<path d="M4 5.5h16v10H10l-4.5 4v-4H4z"/>',
  coin: '<circle cx="12" cy="12" r="8"/><path d="M12 7.5v9M14.5 9.5h-4a1.5 1.5 0 0 0 0 3h3a1.5 1.5 0 0 1 0 3h-4"/>',
  hourglass: '<path d="M6.5 3h11M6.5 21h11M7.5 3c0 5 9 5 9 9s-9 4-9 9M16.5 3c0 5-9 5-9 9s9 4 9 9"/>',
  map: '<path d="M3.5 6 9 4l6 2 5.5-2v14L15 20l-6-2-5.5 2V6Z"/><path d="M9 4v14M15 6v14"/>',
  note: '<path d="M9 18V5.5l10-2V16"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>',
  ghost: '<path d="M6 20V11a6 6 0 0 1 12 0v9l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5L6 20Z"/><circle cx="10" cy="11" r=".9"/><circle cx="14" cy="11" r=".9"/>',
  anchor: '<circle cx="12" cy="5" r="2"/><path d="M12 7v13.5M7.5 10.5h9M4.5 13.5a7.5 7.5 0 0 0 15 0"/>',
  book: '<path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v14.5H6.5A1.5 1.5 0 0 0 5 19V4.5Z"/><path d="M5 19a1.5 1.5 0 0 0 1.5 1.5H19"/><path d="M9 7.5h6"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.8v.4"/>',
  warn: '<path d="M12 3.5 21.5 20h-19L12 3.5Z"/><path d="M12 10v4.5M12 17.3v.3"/>',
  glitch: '<path d="M4 6h9M15 6h5M4 10h4M10 10h10M4 14h12M18 14h2M4 18h6M12 18h8"/>',
  diamond: '<path d="M12 3 21 12l-9 9-9-9 9-9Z"/>',
  hand: '<path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V11m0-6.5a1.5 1.5 0 0 1 3 0V11m0-5a1.5 1.5 0 0 1 3 0v6.5m0-3a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7h-1a6 6 0 0 1-5.2-3L4.5 14a1.5 1.5 0 0 1 2.6-1.5L8 14"/>',
  spiral: '<path d="M12 12.5a1 1 0 1 1 1-1 2.5 2.5 0 1 1-2.5-2.5 4 4 0 1 1-4 4 5.5 5.5 0 1 1 5.5 5.5 7 7 0 0 1-7-7"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1M18.7 18.7l-2.1-2.1M7.4 7.4 5.3 5.3"/>',
  mouse: '<rect x="6.5" y="3" width="11" height="18" rx="5.5"/><path d="M12 3v7M6.5 10h11"/>',
  // door-letter shapes (colour-blind codes, GDD §14.4)
  tri: '<path d="M12 4 21 19.5H3L12 4Z"/>',
  square: '<rect x="5" y="5" width="14" height="14" rx="1"/>',
  circle: '<circle cx="12" cy="12" r="7.5"/>',
  hex: '<path d="M12 3.5 19.5 7.8v8.4L12 20.5l-7.5-4.3V7.8L12 3.5Z"/>',
  scroll: '<path d="M7 4h11a2 2 0 0 1 2 2v1h-4"/><path d="M16 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1h10"/><path d="M7 4a2 2 0 0 0-2 2v11M9 9h5M9 12.5h5"/>',
};

export const ICON_NAMES = Object.keys(ICON_PATHS);

export function isIconName(s: string): boolean {
  return Object.prototype.hasOwnProperty.call(ICON_PATHS, s);
}

/** Build an icon. `name` may be a known icon name, raw `<svg ...>` markup, or a short text glyph. */
export function icon(name: string, cls = ''): HTMLElement | SVGSVGElement {
  if (isIconName(name)) {
    return svg(`<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[name]}</svg>`);
  }
  if (name.trim().startsWith('<svg')) {
    const el = svg(name);
    el.classList.add('ic');
    if (cls) el.classList.add(cls);
    return el;
  }
  return h('span.ic.ic--glyph', { class: cls || undefined, 'aria-hidden': 'true' }, name);
}

// ---------------------------------------------------------------------------------------------
// Tones & rarities (visual metadata)
// ---------------------------------------------------------------------------------------------
export const TONE_META: Record<SystemTone, { tag: string; kr: string; icon: string }> = {
  info: { tag: 'SYSTEM', kr: '시스템', icon: 'info' },
  quest: { tag: 'QUEST', kr: '퀘스트', icon: 'diamond' },
  warning: { tag: 'WARNING', kr: '경고', icon: 'warn' },
  danger: { tag: 'DANGER', kr: '위험', icon: 'skull' },
  reward: { tag: 'REWARD', kr: '보상', icon: 'spark' },
  glitch: { tag: 'ERR0R', kr: '오류', icon: 'glitch' },
  patron: { tag: 'PATRON', kr: '후원', icon: 'eye' },
};
export const TONES = Object.keys(TONE_META) as SystemTone[];

export type Rarity = 'common' | 'rare' | 'epic' | 'mythic' | 'oath';
export const RARITIES: readonly Rarity[] = ['common', 'rare', 'epic', 'mythic', 'oath'];
export const RARITY_META: Record<Rarity, { label: string; kr: string; color: string }> = {
  common: { label: 'Common', kr: '일반', color: '#aab8cc' },
  rare: { label: 'Rare', kr: '희귀', color: '#4fc3f7' },
  epic: { label: 'Epic', kr: '영웅', color: '#b77dff' },
  mythic: { label: 'Mythic', kr: '신화', color: '#ff5a7a' },
  oath: { label: 'Oath', kr: '맹세', color: '#fff1c1' },
};

// ---------------------------------------------------------------------------------------------
// KeyCap
// ---------------------------------------------------------------------------------------------
const KEY_LABELS: Record<string, string> = {
  Space: 'SPACE', Enter: 'ENTER', NumpadEnter: 'ENTER', Escape: 'ESC', Esc: 'ESC', Tab: 'TAB', Backspace: 'BKSP',
  ShiftLeft: 'SHIFT', ShiftRight: 'SHIFT', Shift: 'SHIFT', ControlLeft: 'CTRL', ControlRight: 'CTRL', Control: 'CTRL', Ctrl: 'CTRL',
  AltLeft: 'ALT', AltRight: 'ALT', Alt: 'ALT', CapsLock: 'CAPS',
  ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→', Up: '↑', Down: '↓', Left: '←', Right: '→',
  Backquote: '`', Minus: '-', Equal: '=', BracketLeft: '[', BracketRight: ']', Semicolon: ';', Quote: "'", Comma: ',', Period: '.', Slash: '/',
};
const MOUSE_KEYS: Record<string, 'l' | 'r' | 'm'> = {
  Mouse0: 'l', Mouse1: 'm', Mouse2: 'r', LMB: 'l', RMB: 'r', MMB: 'm', MouseLeft: 'l', MouseRight: 'r', MouseMiddle: 'm',
};

/** Human label for a KeyboardEvent.code / short key name. Pure. */
export function keyLabel(code: string): string {
  if (KEY_LABELS[code]) return KEY_LABELS[code];
  let m = /^Key([A-Z])$/.exec(code);
  if (m) return m[1];
  m = /^(?:Digit|Numpad)(\d)$/.exec(code);
  if (m) return m[1];
  m = /^F(\d{1,2})$/.exec(code);
  if (m) return code;
  if (MOUSE_KEYS[code]) return MOUSE_KEYS[code] === 'l' ? 'LMB' : MOUSE_KEYS[code] === 'r' ? 'RMB' : 'MMB';
  return code.length <= 3 ? code.toUpperCase() : code.toUpperCase().slice(0, 5);
}

export function KeyCap(code: string, opts: { size?: 'sm' | 'md' | 'lg'; tone?: SystemTone } = {}): HTMLElement {
  const mouse = MOUSE_KEYS[code];
  const size = opts.size ?? 'md';
  if (mouse) {
    const el = h('kbd.kc.kc--mouse', { class: `kc--${size}`, 'aria-label': keyLabel(code), dataset: { btn: mouse } });
    el.appendChild(svg(`<svg viewBox="0 0 16 22" aria-hidden="true"><rect x="1.2" y="1.2" width="13.6" height="19.6" rx="6.8" fill="none" stroke="currentColor" stroke-width="1.6"/><path class="kc-mb" d="${mouse === 'l' ? 'M8 2v7.5H1.8V8A6.2 6.2 0 0 1 8 2Z' : mouse === 'r' ? 'M8 2v7.5h6.2V8A6.2 6.2 0 0 0 8 2Z' : 'M7 4h2v5H7z'}"/></svg>`));
    return el;
  }
  const label = keyLabel(code);
  return h('kbd.kc', { class: [`kc--${size}`, label.length > 1 ? 'kc--wide' : '', opts.tone ? `tone-${opts.tone}` : ''] }, label);
}

// ---------------------------------------------------------------------------------------------
// Button
// ---------------------------------------------------------------------------------------------
export type ButtonVariant = 'primary' | 'ghost' | 'danger';
export interface ButtonOpts {
  label: string;
  variant?: ButtonVariant;
  icon?: string;
  hotkey?: string;
  onClick?: (e: MouseEvent) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  title?: string;
}

export function Button(o: ButtonOpts): HTMLButtonElement {
  const b = h('button.btn', {
    type: 'button',
    class: [`btn--${o.variant ?? 'primary'}`, `btn--${o.size ?? 'md'}`],
    disabled: !!o.disabled,
    title: o.title,
    onpointerenter: () => { if (!b.disabled) uiSound('ui_hover', 45); },
    onfocus: () => uiSound('ui_hover', 45),
    onclick: (e: MouseEvent) => {
      if (b.disabled) return;
      uiSound(o.variant === 'danger' ? 'ui_back' : 'ui_click');
      o.onClick?.(e);
    },
  });
  append3(b, o.icon ? icon(o.icon, 'btn-ic') : null, h('span.btn-label', null, o.label), o.hotkey ? KeyCap(o.hotkey, { size: 'sm' }) : null);
  b.appendChild(h('i.btn-shine', { 'aria-hidden': 'true' }));
  return b;
}

function append3(el: HTMLElement, ...c: (Node | null)[]): void {
  for (const n of c) if (n) el.appendChild(n);
}

// ---------------------------------------------------------------------------------------------
// Panel (static glass frame with bracket corners)
// ---------------------------------------------------------------------------------------------
export function Corners(): HTMLElement[] {
  return ['tl', 'tr', 'bl', 'br'].map((c) => h('i.corner', { class: `corner--${c}`, 'aria-hidden': 'true' }));
}

export function Panel(o: { title?: string; kicker?: string; tone?: SystemTone; class?: string }, ...children: Child[]): HTMLElement {
  return h('section.panel', { class: [`tone-${o.tone ?? 'info'}`, o.class] },
    Corners(),
    o.title || o.kicker ? h('header.panel-head', null,
      o.kicker ? h('span.panel-kicker', null, o.kicker) : null,
      o.title ? h('h3.panel-title', null, o.title) : null) : null,
    h('div.panel-body', null, ...children));
}

// ---------------------------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------------------------
export interface TabDef { id: string; label: string; icon?: string; badge?: string | number; render: () => HTMLElement }
export interface TabsHandle { el: HTMLElement; select(id: string): void; readonly active: string; next(dir: 1 | -1): void }

export function Tabs(defs: TabDef[], opts: { active?: string; onChange?: (id: string) => void; hotkeys?: [string, string] } = {}): TabsHandle {
  const bar = h('div.tabs-bar', { role: 'tablist' });
  const ink = h('i.tabs-ink', { 'aria-hidden': 'true' });
  const body = h('div.tabs-body');
  const cache = new Map<string, HTMLElement>();
  const btns = new Map<string, HTMLButtonElement>();
  let active = '';
  let activeIndex = 0;

  const [prevKey, nextKey] = opts.hotkeys ?? ['KeyQ', 'KeyE'];
  bar.appendChild(h('span.tabs-hk', { 'aria-hidden': 'true' }, KeyCap(prevKey, { size: 'sm' })));
  defs.forEach((d, i) => {
    const b = h('button.tab', {
      type: 'button', role: 'tab', id: `tab-${d.id}`, 'aria-selected': 'false', tabIndex: -1,
      onclick: () => select(d.id),
      onpointerenter: () => uiSound('ui_hover', 45),
      onkeydown: (e: KeyboardEvent) => {
        if (e.key === 'ArrowRight') { e.preventDefault(); next(1); btns.get(active)?.focus(); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); next(-1); btns.get(active)?.focus(); }
      },
    },
    d.icon ? icon(d.icon, 'tab-ic') : null,
    h('span.tab-label', null, d.label),
    d.badge !== undefined ? h('span.tab-badge', null, String(d.badge)) : null);
    b.dataset.index = String(i);
    btns.set(d.id, b);
    bar.appendChild(b);
  });
  bar.appendChild(h('span.tabs-hk', { 'aria-hidden': 'true' }, KeyCap(nextKey, { size: 'sm' })));
  bar.appendChild(ink);
  const el = h('div.tabs', null, bar, body);

  // Q / E (or custom) switch tabs while this tab strip is on screen. The listener unhooks itself
  // the first time it fires after the element has left the document.
  let wasConnected = false;
  const onHot = (e: KeyboardEvent): void => {
    if (!el.isConnected) {
      if (wasConnected) window.removeEventListener('keydown', onHot);
      return;
    }
    wasConnected = true;
    if (e.defaultPrevented || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.code !== prevKey && e.code !== nextKey) return;
    const t = e.target as HTMLElement | null;
    if (t && (t.tagName === 'INPUT' && (t as HTMLInputElement).type !== 'range' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    if (!el.offsetParent || el.closest('.is-out')) return;
    if (document.querySelector('.tf-modals .modal-layer:not(.is-out)')) return;
    e.preventDefault();
    next(e.code === prevKey ? -1 : 1);
  };
  if (typeof window !== 'undefined') window.addEventListener('keydown', onHot);

  function placeInk(): void {
    const b = btns.get(active);
    if (!b || !b.offsetWidth) return;
    ink.style.setProperty('--x', `${b.offsetLeft}px`);
    ink.style.setProperty('--w', `${b.offsetWidth}px`);
  }

  function select(id: string, silent = false): void {
    const d = defs.find((t) => t.id === id);
    if (!d || id === active) return;
    const idx = defs.indexOf(d);
    const dir = idx >= activeIndex ? 1 : -1;
    for (const [bid, b] of btns) {
      const on = bid === id;
      b.setAttribute('aria-selected', String(on));
      b.tabIndex = on ? 0 : -1;
      b.classList.toggle('is-active', on);
    }
    let pane = cache.get(id);
    if (!pane) {
      pane = h('div.tabs-pane', { role: 'tabpanel', 'aria-labelledby': `tab-${id}` }, d.render());
      cache.set(id, pane);
    }
    for (const p of body.children) (p as HTMLElement).hidden = true;
    if (pane.parentNode !== body) body.appendChild(pane);
    pane.hidden = false;
    pane.style.setProperty('--dir', String(dir));
    pane.classList.remove('is-entering');
    void pane.offsetWidth;
    pane.classList.add('is-entering');
    active = id;
    activeIndex = idx;
    placeInk();
    requestAnimationFrame(placeInk);
    if (!silent) {
      uiSound('ui_tab');
      opts.onChange?.(id);
    }
  }

  function next(dir: 1 | -1): void {
    const i = (activeIndex + dir + defs.length) % defs.length;
    select(defs[i].id);
  }

  select(opts.active ?? defs[0]?.id ?? '', true);
  return { el, select: (id) => select(id), next, get active() { return active; } };
}

// ---------------------------------------------------------------------------------------------
// Card (rarity-coloured frame)
// ---------------------------------------------------------------------------------------------
export interface CardOpts {
  title: string;
  rarity: Rarity;
  icon?: string;
  desc?: string;
  kicker?: string;
  cost?: { currency: string; amount: number };
  tags?: string[];
  locked?: boolean;
  selected?: boolean;
  onClick?: () => void;
}

export function Card(o: CardOpts): HTMLElement {
  const meta = RARITY_META[o.rarity];
  const el = h('article.card', {
    class: [`card--${o.rarity}`, o.locked ? 'is-locked' : '', o.selected ? 'is-selected' : ''],
    tabIndex: 0,
    'aria-label': `${o.title}, ${meta.label}`,
    onpointerenter: () => uiSound('ui_hover', 45),
    onpointermove: (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', ((e.clientX - r.left) / r.width).toFixed(3));
      el.style.setProperty('--my', ((e.clientY - r.top) / r.height).toFixed(3));
    },
    onpointerleave: () => { el.style.removeProperty('--mx'); el.style.removeProperty('--my'); },
    onclick: () => { if (!o.locked) { uiSound('ui_click'); o.onClick?.(); } },
    onkeydown: (e: KeyboardEvent) => { if ((e.key === 'Enter' || e.key === ' ') && !o.locked) { e.preventDefault(); uiSound('ui_click'); o.onClick?.(); } },
  },
  h('i.card-frame', { 'aria-hidden': 'true' }),
  h('div.card-top', null,
    h('span.card-rarity', null, h('b.card-rarity-kr', null, meta.kr), meta.label.toUpperCase()),
    o.kicker ? h('span.card-kicker', null, o.kicker) : null),
  h('div.card-art', { 'aria-hidden': 'true' },
    h('i.card-rings'),
    h('i.card-rays'),
    h('div.card-emblem', null, icon(o.icon ?? 'star', 'card-ic'))),
  h('h4.card-name', null, o.title),
  o.desc ? h('p.card-desc', null, o.desc) : null,
  o.tags?.length || o.cost ? h('div.card-foot', null,
    ...(o.tags ?? []).map((t) => h('span.card-tag', null, t)),
    o.cost ? h('span.card-cost', null, icon(CURRENCIES[o.cost.currency]?.icon ?? 'coin', 'card-cost-ic'), String(o.cost.amount)) : null) : null,
  o.locked ? h('div.card-lock', null, icon('lock')) : null);
  el.style.setProperty('--rar', meta.color);
  return el;
}

export function Grid(children: HTMLElement[], opts: { min?: number; gap?: number; class?: string } = {}): HTMLElement {
  return h('div.grid', { class: opts.class, style: { '--min': `${opts.min ?? 180}px`, '--gap': `${opts.gap ?? 16}px` } }, ...children);
}

// ---------------------------------------------------------------------------------------------
// Currency pill (count-up animation + floating delta)
// ---------------------------------------------------------------------------------------------
export const CURRENCIES: Record<string, { icon: string; color: string; label: string }> = {
  embers: { icon: 'flame', color: '#ff9a4a', label: 'Embers' },
  drips: { icon: 'drop', color: '#ffe3a6', label: 'Drips' },
  sparks: { icon: 'spark', color: '#8be9ff', label: 'Sparks' },
  keys: { icon: 'key', color: '#c8a6ff', label: 'Keys' },
};

export class CurrencyPill {
  readonly el: HTMLElement;
  private readonly num: HTMLElement;
  private shown: number;
  private target: number;
  private from = 0;
  private t = 1;
  private raf = 0;
  private last = 0;

  constructor(id: string, amount = 0, opts: { icon?: string; color?: string; label?: string } = {}) {
    const meta = CURRENCIES[id] ?? { icon: 'coin', color: '#ffd166', label: id };
    this.shown = this.target = amount;
    this.num = h('span.pill-num', null, formatAmount(amount));
    this.el = h('div.pill', { style: { '--pill': opts.color ?? meta.color }, title: opts.label ?? meta.label, 'aria-label': `${opts.label ?? meta.label}: ${amount}` },
      h('span.pill-ic', null, icon(opts.icon ?? meta.icon)),
      this.num);
    this.el.dataset.currency = id;
  }

  get value(): number { return this.target; }

  set(amount: number, animate = true): void {
    if (amount === this.target) return;
    const delta = amount - this.target;
    this.from = this.shown;
    this.target = amount;
    this.el.setAttribute('aria-label', `${this.el.title}: ${amount}`);
    if (!animate) {
      this.shown = amount;
      this.num.textContent = formatAmount(amount);
      return;
    }
    this.t = 0;
    uiSound(delta > 0 ? 'currency_gain' : 'currency_spend', 60);
    const d = h('span.pill-delta', { class: delta > 0 ? 'is-gain' : 'is-loss' }, `${delta > 0 ? '+' : '−'}${formatAmount(Math.abs(delta))}`);
    this.el.appendChild(d);
    d.addEventListener('animationend', () => d.remove());
    this.el.classList.remove('is-bump', 'is-drop');
    void this.el.offsetWidth;
    this.el.classList.add(delta > 0 ? 'is-bump' : 'is-drop');
    if (!this.raf) {
      this.last = performance.now();
      this.raf = requestAnimationFrame(this.tick);
    }
  }

  private tick = (now: number): void => {
    const dt = Math.min(0.1, (now - this.last) / 1000);
    this.last = now;
    this.t = Math.min(1, this.t + dt / 0.7);
    const e = 1 - Math.pow(1 - this.t, 3);
    this.shown = Math.round(this.from + (this.target - this.from) * e);
    this.num.textContent = formatAmount(this.shown);
    this.raf = this.t < 1 ? requestAnimationFrame(this.tick) : 0;
  };
}

export function formatAmount(n: number): string {
  const a = Math.abs(n);
  if (a >= 1e6) return `${(n / 1e6).toFixed(a >= 1e7 ? 0 : 1)}M`;
  if (a >= 1e4) return `${(n / 1e3).toFixed(a >= 1e5 ? 0 : 1)}k`;
  return Math.round(n).toLocaleString('en-US');
}

// ---------------------------------------------------------------------------------------------
// ProgressBar, Slider, Toggle
// ---------------------------------------------------------------------------------------------
export function ProgressBar(value = 0, opts: { tone?: SystemTone; label?: string; segments?: number } = {}): { el: HTMLElement; set(v: number): void } {
  const fill = h('i.pb-fill');
  const el = h('div.pb', { class: `tone-${opts.tone ?? 'info'}`, role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-label': opts.label ?? 'progress' },
    fill, opts.segments ? h('i.pb-seg', { style: { '--seg': opts.segments } }) : null);
  const set = (v: number): void => {
    const c = clamp(v, 0, 1);
    fill.style.transform = `scaleX(${c})`;
    el.setAttribute('aria-valuenow', String(Math.round(c * 100)));
  };
  set(value);
  return { el, set };
}

export function Slider(o: { label: string; min: number; max: number; step?: number; value: number; format?: (v: number) => string; onInput?: (v: number) => void }): { el: HTMLElement; input: HTMLInputElement } {
  const fmt = o.format ?? ((v: number) => String(v));
  const out = h('output.sl-val', null, fmt(o.value));
  const input = h('input.sl-input', { type: 'range', min: String(o.min), max: String(o.max), step: String(o.step ?? 1), value: String(o.value), 'aria-label': o.label });
  const paint = (): void => {
    const v = Number(input.value);
    input.style.setProperty('--p', String((v - o.min) / (o.max - o.min || 1)));
    out.textContent = fmt(v);
  };
  input.addEventListener('input', () => {
    paint();
    uiSound('ui_slider', 55);
    o.onInput?.(Number(input.value));
  });
  paint();
  const el = h('label.sl', null, h('span.sl-label', null, o.label), input, out);
  return { el, input };
}

export function Toggle(o: { label: string; value: boolean; onChange?: (v: boolean) => void }): { el: HTMLElement; set(v: boolean): void } {
  let v = o.value;
  const sw = h('button.tg', {
    type: 'button', role: 'switch', 'aria-checked': String(v), 'aria-label': o.label,
    onclick: () => { set(!v); uiSound('ui_toggle'); o.onChange?.(v); },
  }, h('i.tg-knob'));
  const set = (nv: boolean): void => {
    v = nv;
    sw.setAttribute('aria-checked', String(v));
  };
  const el = h('div.tg-row', null, h('span.tg-label', null, o.label), sw);
  return { el, set };
}

// ---------------------------------------------------------------------------------------------
// Tooltip (one shared floating element, mounted by Ui into its tooltip layer)
// ---------------------------------------------------------------------------------------------
let tipLayer: HTMLElement | null = null;
let tipEl: HTMLElement | null = null;
let tipTimer = 0;

export function setTooltipLayer(layer: HTMLElement | null): void {
  tipLayer = layer;
  tipEl = null;
}

export function tooltip(target: HTMLElement, content: string | (() => Node), opts: { title?: string; tone?: SystemTone } = {}): void {
  const show = (): void => {
    if (!tipLayer) return;
    window.clearTimeout(tipTimer);
    tipTimer = window.setTimeout(() => {
      if (!tipLayer || !target.isConnected) return;
      if (!tipEl) {
        tipEl = h('div.tip', { role: 'tooltip' });
        tipLayer.appendChild(tipEl);
      }
      tipEl.className = `tip tone-${opts.tone ?? 'info'}`;
      tipEl.replaceChildren(
        ...(opts.title ? [h('div.tip-title', null, opts.title)] : []),
        h('div.tip-body', null, typeof content === 'string' ? content : content()));
      const r = target.getBoundingClientRect();
      const lr = tipLayer.getBoundingClientRect();
      tipEl.style.left = `${r.left + r.width / 2 - lr.left}px`;
      tipEl.style.top = `${r.top - lr.top}px`;
      tipEl.classList.toggle('is-below', r.top < 120);
      if (r.top < 120) tipEl.style.top = `${r.bottom - lr.top}px`;
      tipEl.classList.add('is-on');
    }, 220);
  };
  const hide = (): void => {
    window.clearTimeout(tipTimer);
    tipEl?.classList.remove('is-on');
  };
  target.addEventListener('pointerenter', show);
  target.addEventListener('focus', show);
  target.addEventListener('pointerleave', hide);
  target.addEventListener('blur', hide);
  target.addEventListener('pointerdown', hide);
}

// ---------------------------------------------------------------------------------------------
// Modal box & screen frame
// ---------------------------------------------------------------------------------------------
export interface ModalAction { label: string; variant?: ButtonVariant; value: string; hotkey?: string }
export interface ModalOpts { title: string; body: string | Node; tone?: SystemTone; actions?: ModalAction[] }

export function ModalBox(o: ModalOpts, onResult: (value: string | null) => void): HTMLElement {
  const actions = o.actions ?? [{ label: 'OK', value: 'ok', variant: 'primary' as const, hotkey: 'Enter' }];
  return h('div.modal', { class: `tone-${o.tone ?? 'info'}`, role: 'dialog', 'aria-modal': 'true', 'aria-label': o.title },
    Corners(),
    h('header.modal-head', null, h('span.modal-tag', null, TONE_META[o.tone ?? 'info'].kr), h('h3.modal-title', null, `[ ${o.title.toUpperCase()} ]`)),
    h('div.modal-body', null, o.body),
    h('footer.modal-foot', null, ...actions.map((a) => Button({ label: a.label, variant: a.variant ?? 'ghost', hotkey: a.hotkey, onClick: () => onResult(a.value) }))));
}

export interface ScreenFrameOpts { title: string; kicker?: string; kr?: string; tone?: SystemTone; onClose?: () => void; class?: string }

/** Standard full-screen menu layout (header / scrollable body / footer hints). */
export function ScreenFrame(o: ScreenFrameOpts, body: Child, foot?: Child): HTMLElement {
  return h('div.scr', { class: [`tone-${o.tone ?? 'info'}`, o.class] },
    Corners(),
    h('header.scr-head', null,
      h('div.scr-titles', null,
        h('div.scr-kicker', null, o.kr ? h('b.scr-kr', null, o.kr) : null, o.kicker ?? '[ SYSTEM ]'),
        h('h2.scr-title', null, o.title)),
      o.onClose ? h('button.scr-close', { type: 'button', 'aria-label': 'Close', onclick: () => o.onClose?.(), onpointerenter: () => uiSound('ui_hover', 45) },
        KeyCap('Escape', { size: 'sm' }), h('span', null, 'Close')) : null),
    h('i.scr-rule', { 'aria-hidden': 'true' }),
    h('div.scr-body', null, body),
    foot ? h('footer.scr-foot', null, foot) : null);
}
