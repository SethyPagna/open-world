// Small System slips that slide in from the right edge. Identical toasts merge into a "x3" count.
import type { SystemTone } from '../core/api.ts';
import { h, uiSound, replayClass } from './h.ts';
import { TONE_META, icon } from './components.ts';

interface ToastView { el: HTMLElement; count: HTMLElement; bar: HTMLElement; key: string; life: number; total: number; n: number; leaving: number }

export class Toasts {
  readonly el: HTMLElement;
  max = 5;
  private readonly items: ToastView[] = [];

  constructor() {
    this.el = h('div.tf-toasts', { role: 'log', 'aria-live': 'polite' });
  }

  push(text: string, tone: SystemTone = 'info', seconds = 3.2): void {
    const key = `${tone}|${text}`;
    const same = this.items.find((t) => t.key === key && t.leaving < 0);
    if (same) {
      same.n++;
      same.count.textContent = `×${same.n}`;
      same.count.hidden = false;
      same.life = same.total = Math.max(same.life, seconds);
      replayClass(same.el, 'is-bump');
      uiSound('toast', 60);
      return;
    }
    const meta = TONE_META[tone];
    const count = h('span.toast-count', { hidden: true });
    const bar = h('i.toast-life');
    const el = h('div.toast', { class: `tone-${tone}` },
      h('span.toast-ic', null, icon(meta.icon)),
      h('span.toast-text', null, text),
      count,
      bar);
    const view: ToastView = { el, count, bar, key, life: seconds, total: seconds, n: 1, leaving: -1 };
    this.items.push(view);
    this.el.appendChild(el);
    uiSound('toast', 60);
    const live = this.items.filter((t) => t.leaving < 0);
    if (live.length > this.max) this.dismiss(live[0]);
  }

  private dismiss(t: ToastView): void {
    if (t.leaving >= 0) return;
    t.leaving = 0;
    t.el.classList.add('is-leaving');
  }

  clear(): void {
    for (const t of this.items) this.dismiss(t);
  }

  update(dt: number): void {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const t = this.items[i];
      if (t.leaving >= 0) {
        t.leaving += dt;
        if (t.leaving > 0.42) {
          t.el.remove();
          this.items.splice(i, 1);
        }
        continue;
      }
      t.life -= dt;
      t.bar.style.transform = `scaleX(${Math.max(0, t.life / t.total).toFixed(4)})`;
      if (t.life <= 0) this.dismiss(t);
    }
  }

  snapshot(): { count: number; texts: string[] } {
    const live = this.items.filter((t) => t.leaving < 0);
    return { count: live.length, texts: live.map((t) => t.key) };
  }
}
