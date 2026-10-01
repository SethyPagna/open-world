// Livestream-style audience feed (corner). Rate-limited through a token bucket, duplicate lines
// collapse into "x3", old lines fade, and the whole feed dims when idle.
import { h, uiSound, replayClass } from './h.ts';
import { icon } from './components.ts';

// ---------------------------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------------------------
export class TokenBucket {
  private tokens: number;
  private last: number;
  private readonly ratePerSec: number;
  private readonly burst: number;
  constructor(ratePerSec: number, burst: number, now = 0) {
    this.ratePerSec = ratePerSec;
    this.burst = burst;
    this.tokens = burst;
    this.last = now;
  }
  take(now: number): boolean {
    this.tokens = Math.min(this.burst, this.tokens + (now - this.last) * this.ratePerSec);
    this.last = now;
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }
    return false;
  }
}

export type ChatPart = { t: 'text'; v: string } | { t: 'emote'; v: string };

/** Known emotes: `:name:` tokens. Unknown `:words:` stay text. */
export const EMOTES: Record<string, { icon?: string; label?: string; color: string }> = {
  fire: { icon: 'flame', color: '#ff8a3d' },
  skull: { icon: 'skull', color: '#e9eef7' },
  heart: { icon: 'heart', color: '#ff5c8a' },
  eyes: { icon: 'eye', color: '#6fe6ff' },
  knife: { icon: 'knife', color: '#ff3d6e' },
  candle: { icon: 'candle', color: '#ffd166' },
  star: { icon: 'star', color: '#ffe38a' },
  knot: { icon: 'knot', color: '#fff1c1' },
  bell: { icon: 'bell', color: '#f2b134' },
  ghost: { icon: 'ghost', color: '#c9d4ff' },
  gg: { label: 'GG', color: '#6effc4' },
  lol: { label: 'LOL', color: '#ffd166' },
  pog: { label: 'POG', color: '#b388ff' },
  sus: { label: 'SUS', color: '#ff5a7a' },
  rip: { label: 'RIP', color: '#9fb3cc' },
  w: { label: 'W', color: '#6effc4' },
  l: { label: 'L', color: '#ff5a7a' },
};

export function parseEmotes(text: string): ChatPart[] {
  const out: ChatPart[] = [];
  const re = /:([a-z]+):/gi;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const name = m[1].toLowerCase();
    if (!EMOTES[name]) continue;
    if (m.index > last) out.push({ t: 'text', v: text.slice(last, m.index) });
    out.push({ t: 'emote', v: name });
    last = re.lastIndex;
  }
  if (last < text.length) out.push({ t: 'text', v: text.slice(last) });
  return out;
}

// ---------------------------------------------------------------------------------------------
// Feed
// ---------------------------------------------------------------------------------------------
interface Line { el: HTMLElement; key: string; count: HTMLElement; n: number; age: number; leaving: number }
interface Pending { name: string; text: string; color: string }

export class ChatFeed {
  readonly el: HTMLElement;
  private readonly list: HTMLElement;
  private readonly viewers: HTMLElement;
  private readonly lines: Line[] = [];
  private readonly backlog: Pending[] = [];
  private readonly bucket: TokenBucket;
  private clock = 0;
  private idle = 99;
  maxLines = 7;
  lineLife = 11;
  maxBacklog = 10;
  dropped = 0;
  total = 0;

  constructor() {
    this.bucket = new TokenBucket(2.2, 4, 0);
    this.list = h('div.chat-list', { role: 'log', 'aria-live': 'off' });
    this.viewers = h('span.chat-viewers', null, '');
    this.el = h('div.tf-chat.is-idle', null,
      h('div.chat-head', null, h('i.chat-live-dot'), h('span.chat-live', null, 'LIVE'), h('span.chat-eye', null, icon('eye')), this.viewers),
      this.list);
  }

  setViewers(n: number | null): void {
    this.viewers.textContent = n === null ? '' : n >= 1000 ? `${(n / 1000).toFixed(1)}k watching` : `${n} watching`;
  }

  push(name: string, text: string, color: string): void {
    this.total++;
    // Collapse repeats of the most recent visible line immediately (no rate cost).
    const key = `${name}|${text}`;
    const lastLine = this.lines[this.lines.length - 1];
    if (lastLine && lastLine.key === key && lastLine.leaving < 0) {
      lastLine.n++;
      lastLine.count.textContent = `×${lastLine.n}`;
      lastLine.count.hidden = false;
      lastLine.age = 0;
      replayClass(lastLine.el, 'is-bump');
      return;
    }
    this.backlog.push({ name, text, color });
    while (this.backlog.length > this.maxBacklog) {
      this.backlog.shift();
      this.dropped++;
    }
  }

  private emit(p: Pending): void {
    const parts = parseEmotes(p.text);
    const count = h('span.chat-count', { hidden: true });
    const el = h('div.chat-line', null,
      h('span.chat-name', { style: { color: p.color } }, p.name),
      h('span.chat-text', null, ...parts.map((part) => {
        if (part.t === 'text') return part.v;
        const e = EMOTES[part.v];
        return h('span.emote', { style: { '--em': e.color }, title: `:${part.v}:` }, e.icon ? icon(e.icon) : h('b', null, e.label ?? part.v));
      })),
      count);
    this.list.appendChild(el);
    this.lines.push({ el, key: `${p.name}|${p.text}`, count, n: 1, age: 0, leaving: -1 });
    uiSound('chat_pop', 110);
    const live = this.lines.filter((l) => l.leaving < 0);
    if (live.length > this.maxLines) this.retire(live[0]);
    this.idle = 0;
  }

  private retire(l: Line): void {
    if (l.leaving >= 0) return;
    l.leaving = 0;
    l.el.classList.add('is-leaving');
  }

  clear(): void {
    this.backlog.length = 0;
    for (const l of this.lines) this.retire(l);
  }

  update(dt: number): void {
    this.clock += dt;
    this.idle += dt;
    while (this.backlog.length && this.bucket.take(this.clock)) this.emit(this.backlog.shift()!);
    for (let i = this.lines.length - 1; i >= 0; i--) {
      const l = this.lines[i];
      if (l.leaving >= 0) {
        l.leaving += dt;
        if (l.leaving > 0.45) {
          l.el.remove();
          this.lines.splice(i, 1);
        }
        continue;
      }
      l.age += dt;
      if (l.age > this.lineLife) this.retire(l);
    }
    const idle = this.idle > 6;
    if (idle !== this.el.classList.contains('is-idle')) this.el.classList.toggle('is-idle', idle);
  }

  snapshot(): Record<string, unknown> {
    return { lines: this.lines.filter((l) => l.leaving < 0).length, backlog: this.backlog.length, dropped: this.dropped, total: this.total };
  }
}
