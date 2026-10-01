// In-run HUD: room badge, objective, countdown, interaction prompt, vital (wax) gauge, currency
// pills, trait slots with cooldown sweeps, and a minimap slot. The GDD asks for a nearly empty HUD,
// so every widget hides itself when it has nothing to say.
import { h, uiSound, clamp, replayClass } from './h.ts';
import { CurrencyPill, KeyCap, icon, tooltip, Corners } from './components.ts';

export interface TraitSlotInfo {
  id: string;
  name: string;
  icon: string;
  cooldown01: number; // 0 = ready, 1 = just used
  key: string;        // KeyboardEvent.code or short label, e.g. 'Digit1'
  charges?: number;
  desc?: string;
}

// ---------------------------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------------------------
/** Countdown text: `4:05` above a minute, `0:42` below, `9.4` in the final ten seconds. */
export function formatClock(seconds: number): string {
  const s = Math.max(0, seconds);
  if (s < 10) return (Math.floor(s * 10) / 10).toFixed(1);
  const whole = Math.floor(s);
  const m = Math.floor(whole / 60);
  const r = whole % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}

/** Door letters (GDD §3.4 / §13.3): identity colour, name and colour-blind shape (§14.4). */
export const DOOR_LETTERS: Record<string, { name: string; color: string; shape: string }> = {
  A: { name: 'Arena', color: '#ff6b2c', shape: 'tri' },
  B: { name: 'Baffle', color: '#4fc3f7', shape: 'square' },
  C: { name: 'Chain & Climb', color: '#8bd450', shape: 'circle' },
  D: { name: 'Dilemma', color: '#f2b134', shape: 'diamond' },
  E: { name: 'Enigma', color: '#b388ff', shape: 'hex' },
  X: { name: 'Secret', color: '#00e5c0', shape: 'star' },
  '♛': { name: 'Crown', color: '#fff1c1', shape: 'crown' },
};

export type TimerPhase = 'calm' | 'warn' | 'urgent' | 'zero';

/** GDD §14.3: crimson in the last 30 s; the final 10 s beat and tick. */
export function timerPhase(left: number): TimerPhase {
  if (left <= 0) return 'zero';
  if (left < 10) return 'urgent';
  if (left < 30) return 'warn';
  return 'calm';
}

export interface Designation { code: string; floor: number | null; letter: string | null; name: string }

/** "1E · The Echo Nave" | ("1E", "The Echo Nave") | "Landing · The Foot" -> parts. */
export function parseDesignation(text: string, name?: string): Designation {
  let code = text.trim();
  let rest = name ?? '';
  if (name === undefined) {
    const parts = code.split(/\s*[·:|—-]\s+/);
    code = parts[0];
    rest = parts.slice(1).join(' · ');
  }
  code = code.replace(/^door\s+/i, '');
  const m = /^(\d+)\s*([A-Z♛])?$/u.exec(code);
  return {
    code,
    floor: m ? Number(m[1]) : null,
    letter: m && m[2] ? m[2] : null,
    name: rest,
  };
}

// ---------------------------------------------------------------------------------------------
// HUD
// ---------------------------------------------------------------------------------------------
export class Hud {
  readonly el: HTMLElement;
  readonly minimap: HTMLElement;

  // room + objective
  private readonly roomEl: HTMLElement;
  private readonly roomSigil: HTMLElement;
  private readonly roomShape: HTMLElement;
  private readonly roomKicker: HTMLElement;
  private readonly roomName: HTMLElement;
  private readonly objEl: HTMLElement;
  private readonly objText: HTMLElement;
  private readonly objSub: HTMLElement;
  private objCurrent: string | null = null;
  private objBusy = 0;
  private objNext: { text: string | null; sub?: string } | null = null;

  // timer
  private readonly timerEl: HTMLElement;
  private readonly timerLabel: HTMLElement;
  private readonly timerVal: HTMLElement;
  private readonly timerBar: HTMLElement;
  private timerLeft: number | null = null;
  private timerTotal = 0;
  private timerShown = '';
  private timerWhole = -1;
  private timerLabelStr = '';
  private timerPaused = false;

  // prompt
  private readonly promptBox: HTMLElement;
  private readonly promptEl: HTMLElement;
  private promptAnchored = false;
  private readonly promptKey: HTMLElement;
  private readonly promptText: HTMLElement;
  private readonly promptRing: HTMLElement;
  private promptSig = '';

  // vital
  private readonly vitalEl: HTMLElement;
  private readonly vitalIcon: HTMLElement;
  private vitalIconName = 'flame';
  private readonly vitalFill: HTMLElement;
  private readonly vitalGhost: HTMLElement;
  private readonly vitalNum: HTMLElement;
  private readonly vitalMax: HTMLElement;
  private readonly vitalLabel: HTMLElement;
  private vital = { v: -1, max: 100, ghost: 1, hold: 0 };

  // currencies / traits
  private readonly pillsEl: HTMLElement;
  private readonly pills = new Map<string, CurrencyPill>();
  private readonly traitsEl: HTMLElement;
  private readonly traitViews = new Map<string, { el: HTMLElement; sweep: HTMLElement; cd: number; charges: HTMLElement }>();

  constructor() {
    // --- top-left: room badge + objective
    this.roomSigil = h('div.hud-sigil', null, '');
    this.roomShape = h('span.hud-room-shape', { 'aria-hidden': 'true' });
    this.roomKicker = h('span.hud-room-kicker');
    this.roomName = h('span.hud-room-name');
    this.roomEl = h('div.hud-room.is-hidden', null, this.roomSigil,
      h('div.hud-room-text', null, h('span.hud-room-top', null, this.roomShape, this.roomKicker), this.roomName));

    this.objText = h('div.hud-obj-text');
    this.objSub = h('div.hud-obj-sub');
    this.objEl = h('div.hud-obj.is-hidden', { 'aria-live': 'polite' },
      h('div.hud-obj-head', null, h('i.hud-obj-pip'), h('span', null, 'Objective'), h('b.hud-obj-kr', null, '목표')),
      h('div.hud-obj-main', null, h('i.hud-obj-check', null, icon('check')), this.objText),
      this.objSub);

    // --- top-centre: timer
    this.timerLabel = h('span.hud-timer-label');
    this.timerVal = h('span.hud-timer-val', null, '0:00');
    // A candle that burns down (GDD §14.3): the fill shortens from the right, a flame rides its tip.
    this.timerBar = h('i.hud-timer-fill');
    this.timerEl = h('div.hud-timer.is-hidden', { role: 'timer' },
      h('i.hud-timer-glow', { 'aria-hidden': 'true' }),
      this.timerLabel, this.timerVal,
      h('div.hud-timer-bar', null, this.timerBar, h('i.hud-timer-flame', { 'aria-hidden': 'true' })));

    // --- bottom-centre: prompt (above the trait bar; can be anchored to a world point by Ui)
    this.promptKey = h('span.hud-prompt-key');
    this.promptText = h('span.hud-prompt-text');
    this.promptRing = h('i.hud-prompt-ring', { 'aria-hidden': 'true' });
    this.promptEl = h('div.hud-prompt.is-hidden', { 'aria-live': 'polite' }, h('span.hud-prompt-keywrap', null, this.promptKey, this.promptRing), this.promptText);
    this.promptBox = h('div.hud-pc', null, this.promptEl);

    // --- bottom-left: vital
    this.vitalFill = h('i.hud-vital-fill');
    this.vitalGhost = h('i.hud-vital-ghost');
    this.vitalNum = h('span.hud-vital-num', null, '100');
    this.vitalMax = h('span.hud-vital-max', null, '/100');
    this.vitalLabel = h('span.hud-vital-label', null, 'Wax');
    this.vitalIcon = h('div.hud-vital-icon', null, h('i.hud-vital-halo'), icon('flame'));
    this.vitalEl = h('div.hud-vital.is-hidden', { role: 'meter', 'aria-valuemin': '0' },
      this.vitalIcon,
      h('div.hud-vital-main', null,
        h('div.hud-vital-top', null, this.vitalLabel, h('span.hud-vital-val', null, this.vitalNum, this.vitalMax)),
        h('div.hud-vital-bar', null, this.vitalGhost, this.vitalFill, h('i.hud-vital-ticks'))));

    // --- top-right: currencies + minimap
    this.pillsEl = h('div.hud-pills');
    this.minimap = h('div.hud-minimap-slot');
    const minimapFrame = h('div.hud-minimap.is-hidden', null, Corners(), this.minimap, h('i.hud-minimap-vignette', { 'aria-hidden': 'true' }));

    // --- bottom-centre: traits (GDD §14.3: 4 slots, cooldown rings, key numbers)
    this.traitsEl = h('div.hud-traits');

    this.el = h('div.tf-hud', null,
      h('div.hud-tl', null, this.roomEl, this.objEl),
      h('div.hud-tc', null, this.timerEl),
      h('div.hud-tr', null, this.pillsEl, minimapFrame),
      h('div.hud-bl', null, this.vitalEl),
      h('div.hud-bc', null, this.traitsEl),
      this.promptBox);
  }

  /** Pin the prompt to a screen point (px, bottom-centre of the pill), or null for its HUD slot. */
  placePrompt(x: number | null, y = 0): void {
    const on = x !== null;
    if (on !== this.promptAnchored) {
      this.promptAnchored = on;
      this.promptBox.classList.toggle('is-anchored', on);
    }
    if (on) this.promptBox.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -100%)`;
    else this.promptBox.style.removeProperty('transform');
  }

  get promptVisible(): boolean {
    return this.promptSig !== '';
  }

  setVisible(v: boolean): void {
    this.el.classList.toggle('is-off', !v);
  }

  /** Show the minimap frame (others render into `minimap`). */
  showMinimap(v: boolean): void {
    this.minimap.parentElement!.classList.toggle('is-hidden', !v);
  }

  // ---------------------------------------------------------------- room badge
  room(text: string | null, name?: string): void {
    if (text === null) {
      this.roomEl.classList.add('is-hidden');
      return;
    }
    const d = parseDesignation(text, name);
    const meta = d.letter ? DOOR_LETTERS[d.letter] : null;
    this.roomSigil.textContent = d.code;
    this.roomSigil.classList.toggle('is-long', d.code.length > 3);
    this.roomShape.replaceChildren(...(meta ? [icon(meta.shape)] : []));
    this.roomShape.hidden = !meta;
    this.roomEl.style.setProperty('--door', meta?.color ?? 'var(--cyan)');
    this.roomEl.classList.toggle('is-enigma', d.letter === 'E');
    this.roomKicker.textContent = d.floor !== null
      ? `Floor ${d.floor}${meta ? ` · ${meta.name}` : ''}`
      : 'Landing';
    this.roomName.textContent = d.name || (meta ? `${meta.name} Door` : d.code);
    this.roomEl.classList.remove('is-hidden');
    replayClass(this.roomEl, 'is-enter');
  }

  // ---------------------------------------------------------------- objective
  objective(text: string | null, sub?: string): void {
    if (this.objBusy > 0) {
      this.objNext = { text, sub };
      return;
    }
    if (text === null) {
      this.objCurrent = null;
      this.objEl.classList.add('is-hidden');
      return;
    }
    const changed = text !== this.objCurrent;
    this.objCurrent = text;
    // inner span so the strike-through line can follow wrapped text (box-decoration-break)
    this.objText.replaceChildren(h('span', null, text));
    this.objSub.textContent = sub ?? '';
    this.objSub.hidden = !sub;
    this.objEl.classList.remove('is-hidden', 'is-done');
    if (changed) {
      replayClass(this.objEl, 'is-new');
      uiSound('objective_new', 200);
    }
  }

  /** Strike the current objective through, then show `next` (or hide). */
  completeObjective(next: string | null = null, nextSub?: string): void {
    if (!this.objCurrent) {
      this.objective(next, nextSub);
      return;
    }
    this.objEl.classList.add('is-done');
    uiSound('objective_complete');
    this.objBusy = 1.35;
    this.objNext = { text: next, sub: nextSub };
  }

  // ---------------------------------------------------------------- timer
  timer(seconds: number | null, label?: string): void {
    if (seconds === null) {
      this.timerLeft = null;
      this.timerEl.classList.add('is-hidden');
      this.timerWhole = -1;
      return;
    }
    const lbl = label ?? '';
    if (this.timerLeft === null || lbl !== this.timerLabelStr || seconds > this.timerTotal) this.timerTotal = Math.max(seconds, 0.001);
    this.timerLabelStr = lbl;
    this.timerLabel.textContent = lbl;
    this.timerLabel.hidden = !lbl;
    this.timerLeft = seconds;
    this.timerEl.classList.remove('is-hidden');
    this.renderTimer();
  }

  /** Freeze the countdown (e.g. during a cinematic). */
  pauseTimer(p: boolean): void {
    this.timerPaused = p;
  }

  get timerRemaining(): number | null {
    return this.timerLeft;
  }

  private renderTimer(): void {
    if (this.timerLeft === null) return;
    const left = this.timerLeft;
    const txt = formatClock(left);
    if (txt !== this.timerShown) {
      this.timerShown = txt;
      this.timerVal.textContent = txt;
    }
    const frac = clamp(left / this.timerTotal, 0, 1);
    this.timerBar.style.transform = `scaleX(${frac.toFixed(4)})`;
    this.timerEl.style.setProperty('--t', frac.toFixed(4));
    const phase = timerPhase(left);
    const urgent = phase === 'urgent' || phase === 'zero';
    this.timerEl.classList.toggle('is-warn', phase !== 'calm');
    this.timerEl.classList.toggle('is-urgent', urgent);
    this.timerEl.classList.toggle('is-zero', phase === 'zero');
    const whole = Math.ceil(left);
    if (urgent && whole !== this.timerWhole && this.timerWhole !== -1) {
      if (left > 0) {
        replayClass(this.timerEl, 'is-beat');
        uiSound(whole <= 3 ? 'timer_urgent' : 'timer_tick');
      } else {
        uiSound('timer_zero');
      }
    }
    this.timerWhole = whole;
  }

  // ---------------------------------------------------------------- prompt
  prompt(text: string | null, key = 'KeyE'): void {
    if (text === null) {
      this.promptSig = '';
      this.promptEl.classList.add('is-hidden');
      this.promptHold(null);
      return;
    }
    const sig = `${key}|${text}`;
    if (sig === this.promptSig) return;
    const wasHidden = this.promptEl.classList.contains('is-hidden');
    this.promptSig = sig;
    this.promptKey.replaceChildren(KeyCap(key, { size: 'lg' }));
    this.promptText.textContent = text;
    this.promptEl.classList.remove('is-hidden');
    if (wasHidden) {
      replayClass(this.promptEl, 'is-pop');
      uiSound('prompt_show', 150);
    }
  }

  /** Radial fill on the prompt key-cap for hold-to-channel interactions (0..1, null = off). */
  promptHold(p: number | null): void {
    this.promptEl.classList.toggle('is-holding', p !== null);
    this.promptRing.style.setProperty('--p', String(clamp(p ?? 0, 0, 1)));
  }

  // ---------------------------------------------------------------- vital
  /** Resolve/health gauge. `iconName` swaps the glyph (default flame) while the hero is undecided. */
  setVital(value: number, max = 100, label?: string, iconName?: string): void {
    const v = clamp(value, 0, max);
    const prev = this.vital.v;
    this.vitalEl.classList.remove('is-hidden');
    if (label !== undefined) this.vitalLabel.textContent = label;
    if (iconName !== undefined && iconName !== this.vitalIconName) {
      this.vitalIconName = iconName;
      this.vitalIcon.lastElementChild?.replaceWith(icon(iconName));
    }
    if (v === prev && max === this.vital.max) return;
    const frac = v / max;
    if (prev >= 0 && v < prev) {
      this.vital.hold = 0.45;
      replayClass(this.vitalEl, 'is-hurt');
      uiSound('vital_hurt', 120);
    } else {
      this.vital.ghost = frac;
      if (prev >= 0 && v > prev) replayClass(this.vitalEl, 'is-heal');
    }
    if (prev < 0) this.vital.ghost = frac;
    this.vital.v = v;
    this.vital.max = max;
    this.vitalNum.textContent = String(Math.round(v));
    this.vitalMax.textContent = `/${Math.round(max)}`;
    this.vitalFill.style.transform = `scaleX(${frac.toFixed(4)})`;
    this.vitalGhost.style.transform = `scaleX(${this.vital.ghost.toFixed(4)})`;
    this.vitalEl.style.setProperty('--ticks', String(Math.max(1, Math.round(max / 10))));
    this.vitalEl.classList.toggle('is-low', frac < 0.25);
    this.vitalEl.setAttribute('aria-valuemax', String(max));
    this.vitalEl.setAttribute('aria-valuenow', String(Math.round(v)));
  }

  // ---------------------------------------------------------------- currencies
  setCurrency(id: string, amount: number, opts: { icon?: string; color?: string; label?: string; animate?: boolean } = {}): void {
    let p = this.pills.get(id);
    if (!p) {
      p = new CurrencyPill(id, amount, opts);
      this.pills.set(id, p);
      this.pillsEl.appendChild(p.el);
      replayClass(p.el, 'is-enter');
      return;
    }
    p.set(amount, opts.animate ?? true);
  }

  currency(id: string): number | null {
    return this.pills.get(id)?.value ?? null;
  }

  removeCurrency(id: string): void {
    this.pills.get(id)?.el.remove();
    this.pills.delete(id);
  }

  // ---------------------------------------------------------------- traits
  setTraits(list: TraitSlotInfo[]): void {
    const seen = new Set<string>();
    list.forEach((t, i) => {
      seen.add(t.id);
      let v = this.traitViews.get(t.id);
      if (!v) {
        const sweep = h('i.trait-sweep');
        const charges = h('span.trait-charges');
        const el = h('div.trait', { tabIndex: -1, 'aria-label': t.name },
          h('i.trait-bg', { 'aria-hidden': 'true' }),
          h('span.trait-ic', null, icon(t.icon)),
          sweep,
          h('i.trait-ready', { 'aria-hidden': 'true' }),
          h('span.trait-key', null, KeyCap(t.key, { size: 'sm' })),
          charges);
        tooltip(el, t.desc ?? t.name, { title: t.name });
        v = { el, sweep, cd: -1, charges };
        this.traitViews.set(t.id, v);
        replayClass(el, 'is-new');
      }
      if (this.traitsEl.children[i] !== v.el) this.traitsEl.insertBefore(v.el, this.traitsEl.children[i] ?? null);
      const cd = clamp(t.cooldown01, 0, 1);
      if (Math.abs(cd - v.cd) > 0.0015 || (cd === 0) !== (v.cd === 0)) {
        if (v.cd > 0 && cd === 0) {
          replayClass(v.el, 'is-flash');
          uiSound('trait_ready', 80);
        }
        v.cd = cd;
        v.sweep.style.setProperty('--cd', cd.toFixed(4));
        v.el.classList.toggle('is-cooling', cd > 0);
      }
      const ch = t.charges !== undefined ? String(t.charges) : '';
      if (v.charges.textContent !== ch) v.charges.textContent = ch;
    });
    for (const [id, v] of this.traitViews) {
      if (!seen.has(id)) {
        v.el.remove();
        this.traitViews.delete(id);
      }
    }
  }

  /** Flash a trait slot (e.g. on use). */
  pulseTrait(id: string): void {
    const v = this.traitViews.get(id);
    if (v) replayClass(v.el, 'is-used');
  }

  // ---------------------------------------------------------------- per frame
  update(dt: number): void {
    if (this.timerLeft !== null && !this.timerPaused && this.timerLeft > 0) {
      this.timerLeft = Math.max(0, this.timerLeft - dt);
      this.renderTimer();
    }
    if (this.objBusy > 0) {
      this.objBusy -= dt;
      if (this.objBusy <= 0) {
        this.objBusy = 0;
        const n = this.objNext;
        this.objNext = null;
        this.objCurrent = null;
        this.objEl.classList.remove('is-done');
        this.objective(n ? n.text : null, n?.sub);
      }
    }
    const vt = this.vital;
    if (vt.v >= 0) {
      const frac = vt.v / vt.max;
      if (vt.hold > 0) vt.hold -= dt;
      else if (vt.ghost > frac) {
        vt.ghost = Math.max(frac, vt.ghost - dt * 0.9);
        this.vitalGhost.style.transform = `scaleX(${vt.ghost.toFixed(4)})`;
      }
    }
  }

  snapshot(): Record<string, unknown> {
    return {
      visible: !this.el.classList.contains('is-off'),
      room: this.roomEl.classList.contains('is-hidden') ? null : `${this.roomSigil.textContent} · ${this.roomName.textContent}`,
      objective: this.objCurrent,
      objectiveDone: this.objEl.classList.contains('is-done'),
      timer: this.timerLeft === null ? null : Number(this.timerLeft.toFixed(2)),
      timerText: this.timerLeft === null ? null : this.timerShown,
      timerUrgent: this.timerEl.classList.contains('is-urgent'),
      timerPhase: this.timerLeft === null ? null : timerPhase(this.timerLeft),
      promptAnchored: this.promptAnchored,
      prompt: this.promptSig || null,
      vital: this.vital.v < 0 ? null : { v: this.vital.v, max: this.vital.max },
      currencies: Object.fromEntries([...this.pills].map(([k, p]) => [k, p.value])),
      traits: [...this.traitViews].map(([id, v]) => ({ id, cd: Number(v.cd.toFixed(3)) })),
    };
  }
}
