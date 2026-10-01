// Entry router. `?demo=<name>` runs src/dev/<name>.ts (module showcases used by the test
// harness); otherwise the real game boots from src/boot.ts.
const params = new URLSearchParams(location.search);
const demo = params.get('demo');
const demos = import.meta.glob('./dev/*.ts');
const bootModules = import.meta.glob('./boot.ts');

async function start(): Promise<void> {
  if (demo) {
    if (!/^[\w-]+$/.test(demo)) throw new Error(`Bad demo name "${demo}"`);
    // The glob is computed once per dev-server transform and misses demo files created later,
    // so in dev fall back to a direct runtime import (Vite serves /src/dev/<name>.ts on request).
    const load = demos[`./dev/${demo}.ts`] ?? (import.meta.env.DEV ? () => import(/* @vite-ignore */ `./dev/${demo}.ts`) : undefined);
    if (!load) throw new Error(`Unknown demo "${demo}". Available: ${Object.keys(demos).join(', ')}`);
    const mod = (await load()) as { default: () => void | Promise<void> };
    await mod.default();
    return;
  }
  const bootPath = './boot.ts'; // a variable, so Vite does not try to resolve it before it exists
  const load = bootModules['./boot.ts'] ?? (import.meta.env.DEV ? () => import(/* @vite-ignore */ bootPath) : undefined);
  if (!load) throw new Error('src/boot.ts is missing');
  const mod = (await load()) as { boot: () => void | Promise<void> };
  await mod.boot();
}

start().catch((e) => {
  console.error(e);
  const el = document.createElement('pre');
  el.style.cssText = 'position:fixed;inset:0;margin:0;padding:24px;color:#ffb4b4;background:#12060a;font:13px/1.5 ui-monospace,monospace;white-space:pre-wrap;z-index:99999';
  el.textContent = String(e?.stack ?? e);
  document.body.appendChild(el);
});
