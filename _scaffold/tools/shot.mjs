#!/usr/bin/env node
// Headless playtest harness: boots the game (Vite dev server on a free port) in Chromium
// with software WebGL, runs an optional script of actions, saves screenshots, and prints a
// JSON report (console errors, page errors, window.__TF.report()).
//
//   node tools/shot.mjs --query "scene=room&room=echo_golem&seed=3" --out shots/echo.png
//   node tools/shot.mjs --query "scene=title" --wait 4000 --shots 3 --interval 1500 --out shots/title.png
//   node tools/shot.mjs --query "scene=room&room=echo_golem" --steps steps.json --out shots/e.png
//
// steps.json: [{"wait":1000},{"keys":["KeyW"],"hold":800},{"press":"Space"},{"eval":"__TF.debug.solve()"},
//              {"shot":"after_solve"},{"mouse":[640,360]},{"click":[640,360]}]
// Exit code 1 if any uncaught page error or console.error occurred (unless --allow-errors).
import { chromium } from 'playwright';

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const T0 = Date.now();
const tlog = (m) => { if (process.env.SHOT_DEBUG) process.stderr.write(`[${Date.now() - T0}ms] ${m}
`); };
const argv = process.argv.slice(2);
const opt = (name, def) => {
  const i = argv.indexOf('--' + name);
  return i >= 0 ? (argv[i + 1] ?? true) : def;
};
const flag = (name) => argv.includes('--' + name);

const query = String(opt('query', 'scene=title'));
const out = path.resolve(root, String(opt('out', 'shots/shot.png')));
const wait = Number(opt('wait', 3500));
const shots = Number(opt('shots', 1));
const interval = Number(opt('interval', 1000));
const [w, h] = String(opt('size', '1280x720')).split('x').map(Number);
const stepsFile = opt('steps', null);
const inlineSteps = opt('steps-json', null);
const timeoutMs = Number(opt('timeout', 120000));
const allowErrors = flag('allow-errors');
const baseUrl = opt('url', null);

fs.mkdirSync(path.dirname(out), { recursive: true });
const stem = out.replace(/\.png$/i, '');

// At most MAX_SLOTS headless browsers run at once across all agents (memory is limited).
const MAX_SLOTS = Number(process.env.SHOT_SLOTS || 4);
const lockDir = path.join(root, 'tools', '.locks');
fs.mkdirSync(lockDir, { recursive: true });
let slotFile = null;
const alive = (pid) => { try { process.kill(pid, 0); return true; } catch { return false; } };
for (let tries = 0; !slotFile; tries++) {
  for (let i = 0; i < MAX_SLOTS && !slotFile; i++) {
    const f = path.join(lockDir, `slot-${i}`);
    try {
      fs.writeFileSync(f, String(process.pid), { flag: 'wx' });
      slotFile = f;
    } catch {
      try {
        const pid = Number(fs.readFileSync(f, 'utf8'));
        const age = Date.now() - fs.statSync(f).mtimeMs;
        if (!alive(pid) || age > 10 * 60_000) fs.rmSync(f, { force: true });
      } catch {}
    }
  }
  if (!slotFile) {
    if (tries === 0) process.stderr.write(`waiting for a free browser slot (${MAX_SLOTS} max)...\n`);
    await new Promise((r) => setTimeout(r, 1500));
  }
}
const releaseSlot = () => { try { if (slotFile) fs.rmSync(slotFile, { force: true }); } catch {} };
process.on('exit', releaseSlot);

// Prefer the shared dev server (npm run dev:shared, port 5199); otherwise start a private one.
let server = null;
let url = baseUrl;
if (!url) {
  const shared = 'http://127.0.0.1:5199/';
  try {
    const r = await fetch(shared, { signal: AbortSignal.timeout(1500) });
    if (r.ok) url = shared;
  } catch {}
}
if (!url) {
  const { createServer } = await import('vite');
  server = await createServer({ root, logLevel: 'error', server: { port: 0, strictPort: false, host: '127.0.0.1', hmr: false } });
  await server.listen();
  url = server.resolvedUrls.local[0];
}
const full = url.replace(/\/?$/, '/') + '?' + query + '&test=1';

const kill = setTimeout(() => {
  console.log(JSON.stringify({ ok: false, error: 'timeout ' + timeoutMs + 'ms' }));
  process.exit(2);
}, timeoutMs);

// Prefer the persistent browser (node tools/browser_server.mjs); launching is slow here.
let browser = null;
let shared = false;
try {
  const ws = fs.readFileSync(path.join(root, 'tools', '.browser_ws'), 'utf8').trim();
  browser = await chromium.connect(ws, { timeout: 5000 });
  shared = true;
  tlog('connected to shared browser');
} catch {}
if (!browser) {
  tlog('launching');
  browser = await chromium.launch({
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'],
  });
}
const context = await browser.newContext({ viewport: { width: w, height: h } });
const page = await context.newPage();
const logs = [];
const errors = [];
page.on('console', (m) => {
  const t = m.type();
  const text = m.text();
  if (t === 'error') errors.push('console.error: ' + text);
  else if (t === 'warning' || t === 'log' || t === 'info') logs.push(t + ': ' + text);
});
page.on('pageerror', (e) => errors.push('pageerror: ' + (e.stack || e.message)));
page.on('requestfailed', (r) => {
  const u = r.url();
  if (!u.includes('fonts.g')) errors.push('requestfailed: ' + u + ' ' + (r.failure()?.errorText ?? ''));
});

// browser.close() can hang for minutes on this machine; never wait more than 3s for it.
async function quickClose() {
  const t = (ms) => new Promise((r) => setTimeout(r, ms));
  tlog('closing');
  await Promise.race([context.close().catch(() => {}), t(3000)]);
  await Promise.race([browser.close().catch(() => {}), t(shared ? 1000 : 3000)]);
  tlog('closed');
  if (server) await Promise.race([server.close().catch(() => {}), t(2000)]);
  releaseSlot();
}

const saved = [];
async function snap(name) {
  const file = name ? `${stem}_${name}.png` : out;
  await page.screenshot({ path: file });
  saved.push(path.relative(root, file));
}

try {
  tlog('goto');
  await page.goto(full, { waitUntil: 'load' });
  tlog('loaded');
  await page.waitForTimeout(wait);
  const steps = stepsFile ? JSON.parse(fs.readFileSync(path.resolve(root, String(stepsFile)), 'utf8')) : inlineSteps ? JSON.parse(String(inlineSteps)) : null;
  if (steps) {
    for (const s of steps) {
      if (s.wait) await page.waitForTimeout(s.wait);
      if (s.keys) {
        for (const k of s.keys) await page.keyboard.down(k);
        await page.waitForTimeout(s.hold ?? 300);
        for (const k of s.keys) await page.keyboard.up(k);
      }
      if (s.press) await page.keyboard.press(s.press);
      if (s.type) await page.keyboard.type(s.type);
      if (s.mouse) await page.mouse.move(s.mouse[0], s.mouse[1]);
      if (s.click) await page.mouse.click(s.click[0], s.click[1]);
      if (s.selector) await page.click(s.selector);
      if (s.eval) {
        const r = await page.evaluate(s.eval);
        if (r !== undefined) logs.push('eval: ' + JSON.stringify(r).slice(0, 2000));
      }
      if (s.shot) await snap(s.shot);
    }
  }
  if (!steps || !steps.some((s) => s.shot)) {
    for (let i = 0; i < shots; i++) {
      if (i > 0) await page.waitForTimeout(interval);
      await snap(shots > 1 ? String(i) : '');
    }
  }
  tlog('shots done');
  const report = await page.evaluate(() => {
    const tf = window.__TF;
    try {
      return tf && typeof tf.report === 'function' ? tf.report() : null;
    } catch (e) {
      return { reportError: String(e) };
    }
  });
  const result = { ok: errors.length === 0, url: full, saved, errors, report, logs: logs.slice(-40) };
  console.log(JSON.stringify(result, null, 1));
  clearTimeout(kill);
  await quickClose();
  process.exit(errors.length && !allowErrors ? 1 : 0);
} catch (e) {
  console.log(JSON.stringify({ ok: false, url: full, fatal: String(e && e.stack || e), errors, saved, logs: logs.slice(-40) }, null, 1));
  await quickClose();
  process.exit(1);
}
