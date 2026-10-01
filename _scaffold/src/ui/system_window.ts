// Manhwa-style "System windows": typed-out text, bracketed caps headers, tone skins, choices,
// and an elegant stack/queue. Driven entirely by update(dt) so it is deterministic under test.
import type { SystemTone } from '../core/api.ts';
import { h, uiSound, clamp } from './h.ts';
import { Corners, KeyCap, TONE_META, icon } from './components.ts';

export interface SystemOpts {
  title?: string;
  lines: string[];
  tone?: SystemTone;
  seconds?: number;
  wait?: boolean;
  choices?: string[];
}

// ---------------------------------------------------------------------------------------------
// Pure helpers (unit-tested in tests/ui.test.ts)
// ---------------------------------------------------------------------------------------------
export type SegKind = 'text' | 'em' | 'redact' | 'title' | 'key';
export interface Seg { kind: SegKind; text: string }

/**
 * Inline markup for System lines: `███` redaction bars, `「Title」` highlights, `*emphasis*`,
 * `{E}` key-caps. Everything else is literal text.
 */
export function parseMarkup(line: string): Seg[] {
  const out: Seg[] = [];
  const re = /(█+)|(「[^」]*」)|\*([^*]+)\*|\{([A-Za-z0-9]+)\}/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    if (m.index > last) out.push({ kind: 'text', text: line.slice(last, m.index) });
    if (m[1]) out.push({ kind: 'redact', text: m[1] });
    else if (m[2]) out.push({ kind: 'title', text: m[2] });
    else if (m[3]) out.push({ kind: 'em', text: m[3] });
    else out.push({ kind: 'key', text: m[4] });
    last = re.lastIndex;
  }
  if (last < line.length) out.push({ kind: 'text', text: line.slice(last) });
  return out;
}

/** Number of typing units in a segment (a key-cap types as one unit). */
export const segUnits = (s: Seg): number => (s.kind === 'key' ? 1 : s.text.length);

/** GDD §14.2: the System types at 35 characters per second. */
export const TYPE_CPS = 35;
/** GDD §14.2: "Tab reopens the last 10". */
export const HISTORY_SIZE = 10;
/** Photosensitivity (GDD §14.4): glitch jolts never exceed 3 Hz. */
export const GLITCH_MIN_INTERVAL = 1 / 3;

/**
 * Cumulative reveal time (seconds) of every typing unit across all lines. Sentence punctuation
 * and line breaks add beats; redaction bars type fast (they "slam" in).
 */
export function typeSchedule(lines: Seg[][], cps = TYPE_CPS): number[] {
  const times: number[] = [];
  const base = 1 / cps;
  let t = 0;
  lines.forEach((segs, li) => {
    if (li > 0) t += 0.16;
    for (const s of segs) {
      if (s.kind === 'key') {
        t += base * 2;
        times.push(t);
        continue;
      }
      for (let i = 0; i < s.text.length; i++) {
        t += s.kind === 'redact' ? base * 0.4 : base;
        times.push(t);
        if (s.kind !== 'redact') t += punctuationPause(s.text[i], s.text[i + 1]);
      }
    }
  });
  return times;
}

export function punctuationPause(c: string, next: string | undefined): number {
  if ('.!?…'.includes(c) && (next === undefined || next === ' ')) return 0.17;
  if (',;:—'.includes(c)) return 0.06;
  return 0;
}

/** How many units are visible at time t (times ascending). */
export function revealedAt(times: readonly number[], t: number): number {
  let lo = 0;
  let hi = times.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (times[mid] <= t) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/**
 * GDD §14.2: a window stays 4 s + 50 ms per character, counted from when it opens. Returns the
 * time left to read once typing has taken `typingSeconds` (never less than `minRead`).
 */
export function autoSeconds(lines: readonly string[], typingSeconds = 0, minRead = 2): number {
  const n = lines.reduce((a, l) => a + l.length, 0);
  const total = clamp(4 + n * 0.05, 4, 14);
  return Math.max(minRead, total - typingSeconds);
}

export interface SystemLogEntry { tone: SystemTone; title: string; lines: string[]; choices: string[]; picked: number | null; serial: string; at: number }

/** "just now" · "12 s ago" · "3 min ago" · "1 h ago" for the System log. */
export function formatAgo(seconds: number): string {
  const s = Math.max(0, seconds);
  if (s < 5) return 'just now';
  if (s < 60) return `${Math.floor(s)} s ago`;
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  return `${Math.floor(s / 3600)} h ago`;
}

/** Push into a bounded most-recent-last history. Mutates and returns `list`. */
export function pushHistory<T>(list: T[], item: T, max = HISTORY_SIZE): T[] {
  list.push(item);
  if (list.length > max) list.splice(0, list.length - max);
  return list;
}

/** Wrap-around choice navigation. */
export function stepChoice(cur: number, delta: number, n: number): number {
  if (n <= 0) return 0;
  return (((cur + delta) % n) + n) % n;
}

/**
 * Strict FIFO promotion: how many entries from the front of the queue may open now.
 * Only one interactive (wait/choices) window is visible at a time; at most `max` total.
 */
export function planPromotions(visibleInteractive: readonly boolean[], queueInteractive: readonly boolean[], max: number): number {
  let count = visibleInteractive.length;
  let hasInteractive = visibleInteractive.some(Boolean);
  let n = 0;
  for (const inter of queueInteractive) {
    if (count >= max) break;
    if (inter && hasInteractive) break;
    count++;
    n++;
    if (inter) hasInteractive = true;
  }
  return n;
}

/** Normalise a title to the Tower's `[ BRACKETED CAPS ]` voice (brackets drawn separately). */
export function normaliseTitle(title: string): string {
  return title.replace(/^\s*\[\s*/, '').replace(/\s*\]\s*$/, '').toUpperCase();
}

/** A fully-revealed segment (choices, history). Same classes as typed text so styles match. */
function staticSeg(seg: Seg): Node {
  if (seg.kind === 'key') return KeyCap(seg.text.length === 1 ? `Key${seg.text.toUpperCase()}` : seg.text, { size: 'sm' });
  if (seg.kind === 'text') return document.createTextNode(seg.text);
  return h('span.sw-seg', { class: `sw-seg--${seg.kind}` }, h('span.sw-typed', null, seg.text));
}

/** A finished, non-interactive System window (history / codex / previews). */
export function staticWindow(e: Pick<SystemLogEntry, 'tone' | 'title' | 'lines'> & Partial<Pick<SystemLogEntry, 'choices' | 'picked' | 'serial'>>): HTMLElement {
  const meta = TONE_META[e.tone];
  const choices = e.choices ?? [];
  const picked = e.picked ?? null;
  return h('div.sw.is-static.is-typed', { class: `tone-${e.tone}`, role: 'article', 'aria-label': e.title },
    h('i.sw-glass', { 'aria-hidden': 'true' }),
    Corners(),
    h('header.sw-head', null,
      h('span.sw-tag', null, icon(meta.icon, 'sw-tag-ic'), h('b.sw-tag-kr', null, meta.kr), h('span.sw-tag-en', null, meta.tag)),
      h('h2.sw-title', null, h('span.sw-br', null, '['), h('span.sw-title-text', null, normaliseTitle(e.title)), h('span.sw-br', null, ']')),
      e.serial ? h('span.sw-serial', { 'aria-hidden': 'true' }, e.serial) : null),
    h('i.sw-rule', { 'aria-hidden': 'true' }),
    h('div.sw-body', null, ...e.lines.map((l) => h('p.sw-line', null, ...parseMarkup(l).map(staticSeg)))),
    choices.length ? h('div.sw-choices.is-shown', { class: picked !== null ? 'has-pick' : '' },
      ...choices.map((c, i) => h('div.sw-choice', { class: i === picked ? 'is-selected is-picked' : '', style: { '--i': i } },
        h('span.sw-choice-key', null, String(i + 1)),
        h('span.sw-choice-text', null, ...parseMarkup(c).map(staticSeg))))) : null);
}

const GLITCH_GLYPHS = '▓▒░█#%&@$¥Ø∆◊ΞΨ¤§×/\\<>';
const DECODE_GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&*+=<>';
const rndGlyph = (set: string): string => set[(Math.random() * set.length) | 0];

// ---------------------------------------------------------------------------------------------
// One window
// ---------------------------------------------------------------------------------------------
interface SegView { seg: Seg; typed: HTMLElement; rest: HTMLElement | null; units: number; shown: number; box: HTMLElement }
type WinState = 'queued' | 'opening' | 'typing' | 'ready' | 'closing' | 'done';

const OPEN_DELAY = 0.24;
const CLOSE_TIME = 0.34;
const COLLAPSE_TIME = 0.28;

let serialCounter = 0x02a1;

class SysWin {
  readonly opts: SystemOpts;
  readonly tone: SystemTone;
  readonly interactive: boolean;
  readonly key: string;
  readonly promise: Promise<number | null>;
  private resolveFn!: (v: number | null) => void;
  state: WinState = 'queued';
  readonly wrap: HTMLElement;
  private readonly win: HTMLElement;
  private readonly titleText: HTMLElement | null;
  private readonly titleStr: string;
  private readonly segs: SegView[] = [];
  private readonly times: number[];
  private readonly caret: HTMLElement;
  private readonly choiceEls: HTMLButtonElement[] = [];
  private readonly choicesBox: HTMLElement | null;
  private readonly lifeBar: HTMLElement;
  private readonly hint: HTMLElement | null;
  private clock = 0;
  private typeT = 0;
  private shown = 0;
  private tickAcc = 0;
  private life = 0;
  private lifeTotal = 0;
  private stateT = 0;
  private decodeT = 0;
  private glitchT = 0.5;
  private readonly corrupt: { sv: SegView; until: number }[] = [];
  selected = 0;
  result: number | null = null;
  /** Typing speed multiplier over TYPE_CPS. */
  speed = 1;
  /** Reduced motion: no jolts or glyph corruption (the RGB split stays, static). */
  reduced = false;
  readonly serial: string;

  private readonly onUserAction: () => void;

  constructor(opts: SystemOpts, onUserAction: () => void) {
    this.onUserAction = onUserAction;
    this.opts = opts;
    this.tone = opts.tone ?? 'info';
    this.interactive = !!(opts.wait || opts.choices?.length);
    this.key = `${this.tone}|${opts.title ?? ''}|${opts.lines.join('\n')}|${(opts.choices ?? []).join('|')}`;
    this.promise = new Promise((r) => (this.resolveFn = r));
    const meta = TONE_META[this.tone];
    this.titleStr = normaliseTitle(opts.title ?? meta.tag);
    const serial = `SYS·${(serialCounter++ & 0xffff).toString(16).toUpperCase().padStart(4, '0')}`;
    this.serial = serial;

    this.caret = h('i.sw-caret', { 'aria-hidden': 'true' });
    const parsed = opts.lines.map(parseMarkup);
    this.times = typeSchedule(parsed);
    const body = h('div.sw-body', { 'aria-hidden': 'true' });
    parsed.forEach((segs) => {
      const p = h('p.sw-line');
      for (const seg of segs) {
        const sv = this.buildSeg(seg);
        this.segs.push(sv);
        p.appendChild(sv.box);
      }
      body.appendChild(p);
    });
    const first = this.segs[0];
    if (first) first.box.insertBefore(this.caret, first.rest ?? null);
    else body.appendChild(this.caret);

    this.titleText = h('span.sw-title-text', null, this.titleStr.replace(/\S/g, ' '));
    const head = h('header.sw-head', null,
      h('span.sw-tag', null, icon(meta.icon, 'sw-tag-ic'), h('b.sw-tag-kr', null, meta.kr), h('span.sw-tag-en', null, meta.tag)),
      h('h2.sw-title', null, h('span.sw-br', null, '['), this.titleText, h('span.sw-br', null, ']')),
      h('span.sw-serial', { 'aria-hidden': 'true' }, serial));

    this.choicesBox = opts.choices?.length ? h('div.sw-choices', { role: 'group', 'aria-label': 'Choices' }) : null;
    opts.choices?.forEach((c, i) => {
      const b = h('button.sw-choice', {
        type: 'button', tabIndex: -1,
        onpointerenter: () => { if (this.state === 'ready') this.select(i, true); },
        onclick: (e: MouseEvent) => { e.stopPropagation(); if (this.state === 'ready') this.pick(i); },
      },
      h('span.sw-choice-key', null, String(i + 1)),
      h('span.sw-choice-text', null, ...parseMarkup(c).map((s) => this.staticSeg(s))),
      h('span.sw-choice-arrow', { 'aria-hidden': 'true' }, icon('diamond')));
      b.style.setProperty('--i', String(i));
      this.choiceEls.push(b);
      this.choicesBox!.appendChild(b);
    });

    this.hint = this.interactive
      ? h('footer.sw-foot', null, opts.choices?.length
        ? h('span.sw-hint', null, KeyCap('ArrowUp', { size: 'sm' }), KeyCap('ArrowDown', { size: 'sm' }), h('span', null, 'Select'), h('i.sw-dot'), KeyCap('Enter', { size: 'sm' }), h('span', null, 'Confirm'))
        : h('span.sw-hint', null, KeyCap('Enter', { size: 'sm' }), h('span', null, 'Continue')))
      : null;

    this.lifeBar = h('i.sw-life', { 'aria-hidden': 'true' });
    const full = `${this.titleStr}. ${opts.lines.join(' ').replace(/█+/g, 'redacted')}`;
    this.win = h('div.sw', {
      class: [`tone-${this.tone}`, this.interactive ? 'is-interactive' : ''],
      role: this.interactive ? 'dialog' : 'status',
      'aria-label': this.titleStr,
      onclick: () => this.onClick(),
    },
    h('i.sw-glass', { 'aria-hidden': 'true' }),
    h('i.sw-scan', { 'aria-hidden': 'true' }),
    Corners(),
    head,
    h('i.sw-rule', { 'aria-hidden': 'true' }),
    body,
    h('span.sr-only', null, full),
    this.choicesBox,
    this.hint,
    this.lifeBar);
    if (this.tone === 'reward') {
      for (let i = 0; i < 9; i++) {
        const s = h('i.sw-sparkle', { 'aria-hidden': 'true' });
        s.style.setProperty('--x', `${(4 + Math.random() * 92).toFixed(1)}%`);
        s.style.setProperty('--y', `${(Math.random() < 0.5 ? -6 + Math.random() * 16 : 84 + Math.random() * 18).toFixed(1)}%`);
        s.style.setProperty('--d', `${(Math.random() * 2.4).toFixed(2)}s`);
        s.style.setProperty('--s', (0.6 + Math.random() * 0.8).toFixed(2));
        this.win.appendChild(s);
      }
    }
    this.wrap = h('div.sw-wrap', { class: this.interactive ? 'is-interactive' : '' }, h('div.sw-clip', null, this.win));
  }

  private buildSeg(seg: Seg): SegView {
    if (seg.kind === 'key') {
      const kc = KeyCap(seg.text.length === 1 ? `Key${seg.text.toUpperCase()}` : seg.text, { size: 'sm' });
      const box = h('span.sw-seg.sw-seg--key', null, kc);
      kc.classList.add('is-hidden');
      return { seg, typed: kc, rest: null, units: 1, shown: 0, box };
    }
    const typed = h('span.sw-typed');
    const rest = h('span.sw-rest', null, seg.text);
    const box = h('span.sw-seg', { class: `sw-seg--${seg.kind}` }, typed, rest);
    return { seg, typed, rest, units: seg.text.length, shown: 0, box };
  }

  private staticSeg(seg: Seg): Node {
    return staticSeg(seg);
  }

  get typingDone(): boolean { return this.shown >= this.times.length; }
  get progress(): number { return this.times.length ? this.shown / this.times.length : 1; }

  start(): void {
    this.state = 'opening';
    this.stateT = 0;
    this.win.classList.add('is-opening');
    uiSound(`system_open_${this.tone}`);
    uiSound('system_chime', 80);
  }

  /** Reveal all text instantly. */
  skipTyping(): void {
    if (this.state === 'opening') this.stateT = OPEN_DELAY;
    this.typeT = this.times.length ? this.times[this.times.length - 1] + 1 : 0;
    this.decodeT = 10;
  }

  private onClick(): void {
    this.onUserAction();
    if (this.state === 'opening' || this.state === 'typing') {
      this.skipTyping();
    } else if (this.state === 'ready' && !this.opts.choices?.length) {
      this.close(null);
    }
  }

  confirm(): boolean {
    if (this.state === 'opening' || this.state === 'typing') {
      this.skipTyping();
      return true;
    }
    if (this.state !== 'ready') return false;
    if (this.opts.choices?.length) this.pick(this.selected);
    else this.close(null);
    return true;
  }

  select(i: number, fromPointer = false): void {
    if (!this.choiceEls.length) return;
    const n = clamp(i, 0, this.choiceEls.length - 1);
    if (n !== this.selected || !this.choiceEls[n].classList.contains('is-selected')) {
      this.choiceEls.forEach((b, j) => b.classList.toggle('is-selected', j === n));
      if (n !== this.selected) uiSound(fromPointer ? 'ui_hover' : 'system_choice_move', 40);
      this.selected = n;
    }
  }

  move(delta: number): void {
    if (this.state !== 'ready') return;
    this.select(stepChoice(this.selected, delta, this.choiceEls.length));
  }

  pick(i: number): void {
    if (this.state !== 'ready' || i < 0 || i >= this.choiceEls.length) return;
    this.select(i);
    this.choiceEls[i].classList.add('is-picked');
    this.choicesBox?.classList.add('has-pick');
    uiSound('ui_confirm');
    this.close(i, 0.32);
  }

  private closeDelay = 0;
  close(result: number | null, delay = 0): void {
    if (this.state === 'closing' || this.state === 'done') return;
    this.result = result;
    this.state = 'closing';
    this.stateT = 0;
    this.closeDelay = delay;
    this.resolveFn(result);
  }

  /** Called when the queue is backed up: shorten remaining life. */
  hurry(maxLife: number): void {
    if (!this.interactive && this.life > maxLife) this.life = maxLife;
  }

  update(dt: number): void {
    this.clock += dt;
    this.stateT += dt;
    switch (this.state) {
      case 'opening':
        this.decode(dt);
        if (this.stateT >= OPEN_DELAY) {
          this.state = 'typing';
          this.win.classList.add('is-open');
        }
        break;
      case 'typing': {
        this.decode(dt);
        this.typeT += dt;
        const n = revealedAt(this.times, this.typeT * this.speed);
        if (n !== this.shown) {
          this.reveal(n);
          this.tickAcc += dt;
          if (this.tickAcc > 0.035) {
            this.tickAcc = 0;
            uiSound('type_tick', 34);
          }
        }
        if (this.typingDone) this.enterReady();
        break;
      }
      case 'ready':
        this.decode(dt);
        if (this.lifeTotal > 0) {
          this.life -= dt;
          this.lifeBar.style.transform = `scaleX(${clamp(this.life / this.lifeTotal, 0, 1).toFixed(4)})`;
          if (this.life <= 0) this.close(null);
        }
        break;
      case 'closing':
        if (this.stateT >= this.closeDelay && !this.win.classList.contains('is-closing')) {
          this.win.classList.add('is-closing');
          uiSound('system_close', 60);
        }
        if (this.stateT >= this.closeDelay + CLOSE_TIME && !this.wrap.classList.contains('is-collapsing')) this.wrap.classList.add('is-collapsing');
        if (this.stateT >= this.closeDelay + CLOSE_TIME + COLLAPSE_TIME) {
          this.state = 'done';
          this.wrap.remove();
        }
        break;
    }
    if (this.tone === 'glitch' && this.state !== 'done') this.glitch(dt);
  }

  private enterReady(): void {
    this.state = 'ready';
    this.stateT = 0;
    this.win.classList.add('is-typed');
    const secs = this.opts.seconds ?? (this.interactive ? 0 : autoSeconds(this.opts.lines, this.clock));
    this.lifeTotal = this.life = secs > 0 ? secs : 0;
    this.win.classList.toggle('has-life', this.lifeTotal > 0);
    if (this.choicesBox) {
      this.choicesBox.classList.add('is-shown');
      this.select(0);
    }
  }

  private reveal(n: number): void {
    let remaining = n;
    let caretHost: SegView | null = null;
    for (const sv of this.segs) {
      const want = Math.min(sv.units, Math.max(0, remaining));
      remaining -= sv.units;
      if (want !== sv.shown) {
        sv.shown = want;
        if (sv.seg.kind === 'key') sv.typed.classList.toggle('is-hidden', want === 0);
        else {
          sv.typed.textContent = sv.seg.text.slice(0, want);
          sv.rest!.textContent = sv.seg.text.slice(want);
        }
      }
      if (!caretHost && want < sv.units) caretHost = sv;
    }
    this.shown = n;
    const host = caretHost ?? this.segs[this.segs.length - 1];
    if (host && this.caret.parentNode !== host.box) host.box.insertBefore(this.caret, host.rest);
    else if (host && host.rest && this.caret.nextSibling !== host.rest) host.box.insertBefore(this.caret, host.rest);
  }

  private decode(dt: number): void {
    if (!this.titleText || this.decodeT >= 10) return;
    this.decodeT += dt;
    const dur = 0.5;
    const p = this.decodeT / dur;
    if (p >= 1) {
      this.titleText.textContent = this.titleStr;
      this.decodeT = 10;
      return;
    }
    const n = this.titleStr.length;
    let s = '';
    for (let i = 0; i < n; i++) {
      const c = this.titleStr[i];
      s += c === ' ' || p > (i + 1) / n ? c : p > i / n - 0.35 ? rndGlyph(DECODE_GLYPHS) : ' ';
    }
    this.titleText.textContent = s;
  }

  private glitch(dt: number): void {
    for (let i = this.corrupt.length - 1; i >= 0; i--) {
      const c = this.corrupt[i];
      if (this.clock >= c.until) {
        c.sv.typed.textContent = c.sv.seg.text.slice(0, c.sv.shown);
        this.corrupt.splice(i, 1);
      }
    }
    if (this.reduced) return;
    this.glitchT -= dt;
    if (this.glitchT > 0) return;
    this.glitchT = GLITCH_MIN_INTERVAL + Math.random() * 0.5;
    const pool = this.segs.filter((s) => s.seg.kind !== 'key' && s.shown > 2 && !this.corrupt.some((c) => c.sv === s));
    if (pool.length) {
      const sv = pool[(Math.random() * pool.length) | 0];
      const t = sv.seg.text.slice(0, sv.shown).split('');
      const count = 1 + ((Math.random() * 3) | 0);
      for (let k = 0; k < count; k++) {
        const idx = (Math.random() * t.length) | 0;
        if (t[idx] !== ' ') t[idx] = rndGlyph(GLITCH_GLYPHS);
      }
      sv.typed.textContent = t.join('');
      this.corrupt.push({ sv, until: this.clock + 0.07 + Math.random() * 0.12 });
    }
    if (this.titleText && this.decodeT >= 10 && Math.random() < 0.35) {
      const chars = this.titleStr.split('');
      const idx = (Math.random() * chars.length) | 0;
      if (chars[idx] !== ' ') chars[idx] = rndGlyph(GLITCH_GLYPHS);
      this.titleText.textContent = chars.join('');
      const tt = this.titleText;
      const real = this.titleStr;
      setTimeout(() => { tt.textContent = real; }, 90);
    }
    if (Math.random() < 0.4) {
      this.win.classList.remove('is-jolt');
      void this.win.offsetWidth;
      this.win.classList.add('is-jolt');
    }
  }

  snapshot(): Record<string, unknown> {
    return {
      tone: this.tone, title: this.titleStr, state: this.state, interactive: this.interactive,
      progress: Number(this.progress.toFixed(3)), selected: this.opts.choices?.length ? this.selected : null,
      life: Number(this.life.toFixed(2)), choices: this.opts.choices?.length ?? 0,
    };
  }
}

// ---------------------------------------------------------------------------------------------
// Manager: stacking + queue + keyboard focus
// ---------------------------------------------------------------------------------------------
export class SystemWindows {
  readonly el: HTMLElement;
  maxVisible = 3;
  private visible: SysWin[] = [];
  private closing: SysWin[] = [];
  private queue: SysWin[] = [];
  private speed = 1;
  private reduced = false;
  private clock = 0;
  opened = 0;
  /** The last HISTORY_SIZE windows that opened, oldest first (for the System log screen). */
  readonly history: SystemLogEntry[] = [];
  private readonly onUserAction: () => void;

  constructor(onUserAction: () => void = () => {}) {
    this.onUserAction = onUserAction;
    this.el = h('div.tf-sys');
  }

  /** Seconds of UI time since construction (history timestamps use this clock). */
  get now(): number {
    return this.clock;
  }

  /** Typing speed multiplier (reduced-motion mode types ~3x faster). */
  setTypingSpeed(mult: number): void {
    this.speed = mult;
    for (const w of [...this.visible, ...this.queue]) w.speed = mult;
  }

  setReducedMotion(v: boolean): void {
    this.reduced = v;
    for (const w of [...this.visible, ...this.queue]) w.reduced = v;
  }

  open(opts: SystemOpts): Promise<number | null> {
    const win = new SysWin({ ...opts, lines: opts.lines.length ? opts.lines : [''] }, this.onUserAction);
    const dupe = [...this.visible, ...this.queue].find((w) => w.key === win.key && w.state !== 'closing' && w.state !== 'done');
    if (dupe) return dupe.promise;
    win.speed = this.speed;
    win.reduced = this.reduced;
    const entry: SystemLogEntry = {
      tone: win.tone, title: normaliseTitle(opts.title ?? TONE_META[win.tone].tag), lines: [...opts.lines],
      choices: [...(opts.choices ?? [])], picked: null, serial: win.serial, at: this.clock,
    };
    void win.promise.then((r) => { entry.picked = r; });
    pushHistory(this.history, entry);
    if (win.tone === 'danger') {
      let i = 0;
      while (i < this.queue.length && this.queue[i].tone === 'danger') i++;
      this.queue.splice(i, 0, win);
    } else {
      this.queue.push(win);
    }
    this.pump();
    return win.promise;
  }

  private pump(): void {
    const n = planPromotions(this.visible.map((w) => w.interactive), this.queue.map((w) => w.interactive), this.maxVisible);
    for (let i = 0; i < n; i++) {
      const w = this.queue.shift()!;
      this.visible.push(w);
      // Newest auto window on top of older ones; interactive windows keep top priority via CSS order.
      this.el.insertBefore(w.wrap, this.el.firstChild);
      w.start();
      this.opened++;
    }
    this.restack();
  }

  private restack(): void {
    let depth = 0;
    const byNewest = this.visible.filter((w) => w.interactive).concat(this.visible.filter((w) => !w.interactive).reverse());
    for (const w of byNewest) {
      w.wrap.style.setProperty('--depth', String(depth));
      w.wrap.classList.toggle('is-back', depth > 0);
      depth++;
    }
  }

  get focus(): SysWin | null {
    return this.visible.find((w) => w.interactive && w.state !== 'closing' && w.state !== 'done') ?? null;
  }

  /** True while an interactive window is up and wants the keyboard. */
  get capturing(): boolean {
    return this.focus !== null;
  }

  /** Keyboard routing. Returns true when the key was consumed. */
  handleKey(e: KeyboardEvent): boolean {
    const f = this.focus;
    if (!f) return false;
    const k = e.code || e.key;
    if (k === 'Enter' || k === 'NumpadEnter' || k === 'Space') return f.confirm();
    if (k === 'ArrowUp' || k === 'KeyW') { f.move(-1); return true; }
    if (k === 'ArrowDown' || k === 'KeyS') { f.move(1); return true; }
    const d = /^(?:Digit|Numpad)([1-9])$/.exec(k);
    if (d) {
      const i = Number(d[1]) - 1;
      if (f.opts.choices && i < f.opts.choices.length) {
        if (f.state === 'ready') f.pick(i);
        else f.skipTyping();
        return true;
      }
    }
    if (k === 'Escape' && !f.opts.choices?.length) return f.confirm();
    return false;
  }

  /** Engine 'confirm' action: skip typing / advance the focused window. */
  confirm(): boolean {
    return this.focus?.confirm() ?? false;
  }

  /** Reveal all text in every visible window. */
  skipAll(): void {
    for (const w of this.visible) w.skipTyping();
  }

  pick(i: number): void {
    const f = this.focus;
    if (!f) return;
    f.skipTyping();
    f.update(0);
    f.pick(i);
  }

  /** Close everything (scene change). Pending promises resolve null. */
  clear(): void {
    for (const w of [...this.visible, ...this.queue]) w.close(null);
    this.queue.length = 0;
  }

  update(dt: number): void {
    this.clock += dt;
    let changed = false;
    const backed = this.queue.length > 0 && this.visible.length >= this.maxVisible;
    for (const w of this.visible) {
      w.update(dt);
      if (backed && w.state === 'ready') w.hurry(1.1);
    }
    for (let i = this.visible.length - 1; i >= 0; i--) {
      const w = this.visible[i];
      if (w.state === 'closing' || w.state === 'done') {
        this.visible.splice(i, 1);
        this.closing.push(w);
        changed = true;
      }
    }
    for (let i = this.closing.length - 1; i >= 0; i--) {
      const w = this.closing[i];
      if (w.state !== 'done') w.update(dt);
      if (w.state === 'done') this.closing.splice(i, 1);
    }
    for (const w of this.queue) {
      if (w.state === 'closing') {
        w.state = 'done';
        changed = true;
      }
    }
    if (changed) {
      this.queue = this.queue.filter((w) => w.state !== 'done');
      this.pump();
    }
  }

  snapshot(): Record<string, unknown> {
    return {
      visible: this.visible.map((w) => w.snapshot()),
      closing: this.closing.length,
      queued: this.queue.length,
      capturing: this.capturing,
      opened: this.opened,
      history: this.history.length,
    };
  }
}
