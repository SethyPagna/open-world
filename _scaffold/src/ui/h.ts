// Tiny DOM helpers shared by every UI module. No DOM access at import time (Node tests import
// modules that import this file).

export type Child = Node | string | number | null | undefined | false | readonly Child[];
export type Props = Record<string, unknown> & {
  class?: string | readonly (string | false | null | undefined)[];
  style?: string | Record<string, string | number | null | undefined>;
  dataset?: Record<string, string>;
  html?: string;
};

/**
 * Hyperscript: `h('div.card.card--epic#id', { onclick: fn, 'aria-label': 'x' }, child, 'text')`.
 * Tag may carry `.class` and `#id` shorthand. `on*` props become listeners, `--vars` in style
 * objects go through setProperty, `html` sets trusted innerHTML (internal SVG only).
 */
export function h<K extends keyof HTMLElementTagNameMap>(tag: K | `${K}.${string}` | `${K}#${string}`, props?: Props | null, ...children: Child[]): HTMLElementTagNameMap[K];
export function h(tag: string, props?: Props | null, ...children: Child[]): HTMLElement;
export function h(tag: string, props?: Props | null, ...children: Child[]): HTMLElement {
  const m = /^([a-z0-9-]+)((?:[.#][\w-]+)*)$/i.exec(tag);
  const name = m ? m[1] : 'div';
  const el = document.createElement(name);
  if (m && m[2]) {
    for (const part of m[2].match(/[.#][\w-]+/g) ?? []) {
      if (part[0] === '.') el.classList.add(part.slice(1));
      else el.id = part.slice(1);
    }
  }
  if (props) applyProps(el, props);
  append(el, ...children);
  return el;
}

export function applyProps(el: HTMLElement, props: Props): void {
  for (const k in props) {
    const v = props[k];
    if (v === undefined || v === null) continue;
    if (k === 'class') {
      const list = typeof v === 'string' ? v.split(/\s+/) : (v as readonly (string | false | null | undefined)[]);
      for (const c of list) if (c) el.classList.add(c);
    } else if (k === 'style') {
      if (typeof v === 'string') el.style.cssText += v;
      else for (const [sk, sv] of Object.entries(v as Record<string, string | number | null | undefined>)) setStyle(el, sk, sv);
    } else if (k === 'dataset') {
      Object.assign(el.dataset, v);
    } else if (k === 'html') {
      el.innerHTML = String(v);
    } else if (k.startsWith('on') && typeof v === 'function') {
      el.addEventListener(k.slice(2).toLowerCase(), v as EventListener);
    } else if (typeof v === 'boolean') {
      if (k in el && !k.includes('-')) (el as unknown as Record<string, unknown>)[k] = v;
      else if (v) el.setAttribute(k, '');
    } else if (k in el && !k.includes('-') && k !== 'list' && k !== 'form') {
      (el as unknown as Record<string, unknown>)[k] = v;
    } else {
      el.setAttribute(k, String(v));
    }
  }
}

export function setStyle(el: HTMLElement, key: string, value: string | number | null | undefined): void {
  if (value === null || value === undefined) {
    el.style.removeProperty(key.startsWith('--') ? key : kebab(key));
    return;
  }
  const s = typeof value === 'number' && !key.startsWith('--') && !UNITLESS.has(key) ? `${value}px` : String(value);
  el.style.setProperty(key.startsWith('--') ? key : kebab(key), s);
}

const UNITLESS = new Set(['opacity', 'zIndex', 'flex', 'flexGrow', 'flexShrink', 'order', 'lineHeight', 'fontWeight', 'scale']);
const kebab = (s: string): string => s.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase());

export function append(el: Node, ...children: Child[]): void {
  for (const c of children) {
    if (c === null || c === undefined || c === false) continue;
    if (Array.isArray(c)) append(el, ...(c as Child[]));
    else if (typeof c === 'string' || typeof c === 'number') el.appendChild(document.createTextNode(String(c)));
    else el.appendChild(c as Node);
  }
}

export function clear(el: Element): void {
  while (el.firstChild) el.removeChild(el.firstChild);
}

/** Parse a trusted SVG string (internal icon set only) into an element. */
export function svg(markup: string): SVGSVGElement {
  const t = document.createElement('template');
  t.innerHTML = markup.trim();
  return t.content.firstElementChild as SVGSVGElement;
}

/** Restart a CSS animation class on an element (forces a style flush). */
export function replayClass(el: HTMLElement, cls: string): void {
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
}

// ---------------------------------------------------------------------------------------------
// Sound bus: UI never imports audio. Ui.setSound() installs the sink.
// ---------------------------------------------------------------------------------------------
let soundSink: ((name: string) => void) | null = null;
const lastPlayed = new Map<string, number>();

export function setUiSoundSink(fn: ((name: string) => void) | null): void {
  soundSink = fn;
}

/** Fire a UI sound by name, at most once per `minGapMs` for that name. */
export function uiSound(name: string, minGapMs = 0): void {
  if (!soundSink) return;
  const now = performance.now();
  const last = lastPlayed.get(name) ?? -1e9;
  if (now - last < minGapMs) return;
  lastPlayed.set(name, now);
  try {
    soundSink(name);
  } catch (e) {
    console.warn('[ui] sound sink threw', e);
  }
}

/**
 * Every sound name the UI can emit, for the audio module to map. `system_open_<tone>` fires when
 * a System window opens; `type_tick` fires while text types out (rate-limited ~28/s).
 */
export const UI_SOUNDS = [
  'type_tick', 'ui_hover', 'ui_click', 'ui_confirm', 'ui_back', 'ui_tab', 'ui_toggle', 'ui_slider',
  'system_chime', 'system_open_info', 'system_open_quest', 'system_open_warning', 'system_open_danger',
  'system_open_reward', 'system_open_glitch', 'system_open_patron', 'system_close', 'system_choice_move',
  'toast', 'objective_new', 'objective_complete', 'timer_tick', 'timer_urgent', 'timer_zero',
  'prompt_show', 'trait_ready', 'currency_gain', 'currency_spend', 'vital_hurt', 'chat_pop',
  'screen_open', 'screen_close', 'modal_open',
] as const;
export type UiSoundName = (typeof UI_SOUNDS)[number];

export const clamp = (v: number, lo: number, hi: number): number => (v < lo ? lo : v > hi ? hi : v);
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export function prefersReducedMotion(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}
