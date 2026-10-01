/**
 * Typed synchronous event bus. Listener lists are copy-on-write, so subscribing or unsubscribing
 * inside a handler is safe and `emit` never allocates. A throwing listener is reported and the
 * remaining listeners still run.
 */
import type { EventBus, GameEvents } from './api.ts';

type Listener = (e: unknown) => void;
export type AnyListener = (type: keyof GameEvents, e: unknown) => void;

export class EventHub implements EventBus {
  private lists = new Map<string, Listener[]>();
  private any: AnyListener[] = [];

  on<K extends keyof GameEvents>(type: K, fn: (e: GameEvents[K]) => void): () => void {
    const key = type as string;
    const l = fn as Listener;
    const prev = this.lists.get(key);
    this.lists.set(key, prev ? [...prev, l] : [l]);
    let active = true;
    return () => {
      if (!active) return;
      active = false;
      this.remove(key, l);
    };
  }

  once<K extends keyof GameEvents>(type: K, fn: (e: GameEvents[K]) => void): () => void {
    const off = this.on(type, (e) => {
      off();
      fn(e);
    });
    return off;
  }

  off<K extends keyof GameEvents>(type: K, fn: (e: GameEvents[K]) => void): void {
    this.remove(type as string, fn as Listener);
  }

  emit<K extends keyof GameEvents>(type: K, e: GameEvents[K]): void {
    const list = this.lists.get(type as string);
    if (list) {
      for (let i = 0; i < list.length; i++) {
        try {
          list[i](e);
        } catch (err) {
          console.error(`[events] listener for "${String(type)}" threw`, err);
        }
      }
    }
    const any = this.any;
    for (let i = 0; i < any.length; i++) {
      try {
        any[i](type, e);
      } catch (err) {
        console.error('[events] onAny listener threw', err);
      }
    }
  }

  /** Observe every event (debug log, network replication, analytics). */
  onAny(fn: AnyListener): () => void {
    this.any = [...this.any, fn];
    return () => {
      this.any = this.any.filter((f) => f !== fn);
    };
  }

  listenerCount(type: keyof GameEvents): number {
    return this.lists.get(type as string)?.length ?? 0;
  }

  /** Remove all listeners (for one type, or everything). */
  clear(type?: keyof GameEvents): void {
    if (type === undefined) {
      this.lists.clear();
      this.any = [];
    } else {
      this.lists.delete(type as string);
    }
  }

  private remove(key: string, l: Listener): void {
    const prev = this.lists.get(key);
    if (!prev) return;
    const idx = prev.indexOf(l);
    if (idx < 0) return;
    const next = prev.slice();
    next.splice(idx, 1);
    if (next.length) this.lists.set(key, next);
    else this.lists.delete(key);
  }
}
