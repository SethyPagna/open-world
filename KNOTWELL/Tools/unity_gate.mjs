#!/usr/bin/env node
// KNOTWELL verification gate. Every agent verifies through this script, never by launching Unity directly.
//
//   node Tools/unity_gate.mjs check [runtime|editor|all]    fast C# type-check via dotnet (~20 s, no Unity)
//   node Tools/unity_gate.mjs core [dotnet-test-filter]     Game.Core + Tests/EditMode/Core under plain .NET (~30 s)
//   node Tools/unity_gate.mjs compile                       real Unity batchmode import + compile
//   node Tools/unity_gate.mjs test editmode|playmode [filter] [--category=X]
//   node Tools/unity_gate.mjs exec <Namespace.Class.Method> [-- extra unity args]
//
// Unity allows ONE process per project, so compile/test/exec share a lock (Tools/.locks/unity.lock) and queue.
// dotnet checks share a separate lock (they write the same obj/ dir). Stale locks (dead PID) are broken.
// Exit code 0 = green. Output is a short summary; full logs are under Logs/gate_*.log and TestResults/.

import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const UNITY = process.env.KNOTWELL_UNITY ?? 'C:/Program Files/Unity/Hub/Editor/6000.3.25f1/Editor/Unity.exe';
const LOCK_DIR = path.join(ROOT, 'Tools', '.locks');
const LOCK_WAIT_MS = 60 * 60 * 1000;
const UNITY_TIMEOUT_MS = Number(process.env.KNOTWELL_GATE_TIMEOUT_MS ?? 30 * 60 * 1000);

const [cmd, ...rest] = process.argv.slice(2);
const stamp = new Date().toISOString().replace(/[:.]/g, '-');

function usage() {
  console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 12).join('\n'));
  process.exit(64);
}

function pidAlive(pid) {
  try { process.kill(pid, 0); return true; } catch (e) { return e.code === 'EPERM'; }
}

async function withLock(name, label, fn) {
  fs.mkdirSync(LOCK_DIR, { recursive: true });
  const file = path.join(LOCK_DIR, name + '.lock');
  const start = Date.now();
  let announced = false;
  for (;;) {
    try {
      fs.writeFileSync(file, JSON.stringify({ pid: process.pid, label, since: new Date().toISOString() }), { flag: 'wx' });
      break;
    } catch (e) {
      if (e.code !== 'EEXIST') throw e;
      let holder = null;
      try { holder = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { /* being written */ }
      if (holder && !pidAlive(holder.pid)) { try { fs.unlinkSync(file); } catch {} continue; }
      if (!announced) { console.log(`[gate] waiting for ${name} lock held by ${holder?.label ?? '?'} (pid ${holder?.pid ?? '?'})`); announced = true; }
      if (Date.now() - start > LOCK_WAIT_MS) { console.log('[gate] gave up waiting for lock'); process.exit(75); }
      await new Promise((r) => setTimeout(r, 2000 + Math.random() * 2000));
    }
  }
  const release = () => { try { const h = JSON.parse(fs.readFileSync(file, 'utf8')); if (h.pid === process.pid) fs.unlinkSync(file); } catch {} };
  process.on('exit', release);
  for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => { release(); process.exit(130); });
  try { return await fn(); } finally { release(); }
}

// ---------- dotnet fast check ----------
// Up to CHECK_SLOTS checks run at once, each in its own bin/obj slot (Tools/Check/Directory.Build.props: KwSlot).
const CHECK_SLOTS = 4;
let currentSlot = 0;

async function withSlot(label, fn) {
  fs.mkdirSync(LOCK_DIR, { recursive: true });
  const start = Date.now();
  let announced = false;
  for (;;) {
    for (let s = 0; s < CHECK_SLOTS; s++) {
      const file = path.join(LOCK_DIR, `dotnet-${s}.lock`);
      try {
        fs.writeFileSync(file, JSON.stringify({ pid: process.pid, label, since: new Date().toISOString() }), { flag: 'wx' });
      } catch (e) {
        if (e.code !== 'EEXIST') throw e;
        try { const h = JSON.parse(fs.readFileSync(file, 'utf8')); if (!pidAlive(h.pid)) fs.unlinkSync(file); } catch {}
        continue;
      }
      currentSlot = s;
      const release = () => { try { const h = JSON.parse(fs.readFileSync(file, 'utf8')); if (h.pid === process.pid) fs.unlinkSync(file); } catch {} };
      process.on('exit', release);
      try { return await fn(); } finally { release(); }
    }
    if (!announced) { console.log(`[gate] all ${CHECK_SLOTS} check slots busy; waiting`); announced = true; }
    if (Date.now() - start > LOCK_WAIT_MS) { console.log('[gate] gave up waiting for a check slot'); process.exit(75); }
    await new Promise((r) => setTimeout(r, 1000 + Math.random() * 1000));
  }
}
function dotnetCheck(which) {
  const projects = which === 'runtime' ? ['Runtime'] : which === 'editor' ? ['Editor'] : ['Runtime', 'Editor'];
  let ok = true;
  for (const p of projects) {
    const r = spawnSync('dotnet', ['build', path.join(ROOT, 'Tools', 'Check', p + '.csproj'), '-nologo', '-v', 'q', '-clp:NoSummary;ErrorsOnly', `-p:KwSlot=${currentSlot}`], { encoding: 'utf8', cwd: ROOT, maxBuffer: 64 * 1024 * 1024 });
    const out = (r.stdout ?? '') + (r.stderr ?? '');
    const errors = [...new Set(out.split(/\r?\n/).filter((l) => /\berror\b/i.test(l)).map((l) => l.replace(/\s*\[[^\]]*\.csproj\]\s*$/, '').replace(ROOT + path.sep, '').trim()))];
    if (r.status === 0 && errors.length === 0) console.log(`[check:${p}] OK`);
    else { ok = false; console.log(`[check:${p}] FAILED (${errors.length} errors)`); for (const e of errors.slice(0, 60)) console.log('  ' + e); if (!errors.length) console.log(out.slice(-3000)); }
  }
  return ok ? 0 : 1;
}

// Pure Game.Core tests under plain .NET (Tools/CoreTests): seconds, no Unity, proves Core is engine-free.
function dotnetCoreTests(filter) {
  const args = ['test', path.join(ROOT, 'Tools', 'CoreTests'), '-nologo', '-v', 'q'];
  if (filter) args.push('--filter', filter);
  const r = spawnSync('dotnet', args, { encoding: 'utf8', cwd: ROOT, maxBuffer: 64 * 1024 * 1024 });
  const out = (r.stdout ?? '') + (r.stderr ?? '');
  const lines = out.split(/\r?\n/);
  const errors = [...new Set(lines.filter((l) => /error CS\d+/.test(l)).map((l) => l.replace(/\s*\[[^\]]*\.csproj\]\s*$/, '').trim()))];
  for (const e of errors.slice(0, 60)) console.log('  ' + e);
  for (const l of lines.filter((l) => /^\s*(Failed |Error Message:|Assert|Expected|But was|at Game\.)/.test(l)).slice(0, 80)) console.log('  ' + l.trim());
  const summary = lines.find((l) => /(Passed!|Failed!)\s+-/.test(l))?.trim() ?? '(no summary)';
  console.log(`[core] ${r.status === 0 ? 'OK' : 'FAILED'} ${summary}`);
  return r.status === 0 ? 0 : 1;
}

// ---------- Unity batchmode ----------
function editorHoldsProject() {
  // Temp/UnityLockfile exists (and is locked) while an Editor has the project open.
  const f = path.join(ROOT, 'Temp', 'UnityLockfile');
  if (!fs.existsSync(f)) return false;
  try { fs.unlinkSync(f); return false; } catch { return true; }
}

function runUnity(args, logName) {
  const logFile = path.join(ROOT, 'Logs', `gate_${logName}.log`);
  fs.mkdirSync(path.dirname(logFile), { recursive: true });
  const full = ['-batchmode', '-projectPath', ROOT, '-logFile', logFile, ...args];
  return new Promise((resolve) => {
    const t0 = Date.now();
    const child = spawn(UNITY, full, { stdio: 'ignore', windowsHide: true });
    const timer = setTimeout(() => { console.log('[gate] Unity timed out; killing'); child.kill(); }, UNITY_TIMEOUT_MS);
    child.on('exit', (code) => {
      clearTimeout(timer);
      let log = '';
      try { log = fs.readFileSync(logFile, 'utf8'); } catch {}
      resolve({ code, log, logFile, secs: Math.round((Date.now() - t0) / 1000) });
    });
    child.on('error', (e) => { clearTimeout(timer); resolve({ code: -1, log: String(e), logFile, secs: 0 }); });
  });
}

function summarizeLog(log) {
  const lines = log.split(/\r?\n/);
  const cs = [...new Set(lines.filter((l) => /error CS\d+/.test(l)).map((l) => l.trim()))];
  const other = [...new Set(lines.filter((l) =>
    /(Scripts have compiler errors|Aborting batchmode|executeMethod method .* threw exception|Couldn't set project path|another Unity instance|Exception:|NullReferenceException|An error occurred while resolving packages|\[Package Manager\].*error)/i.test(l)
  ).map((l) => l.trim()))];
  const gate = lines.filter((l) => l.startsWith('[KNOTWELL]')).map((l) => l.trim());
  return { cs, other, gate };
}

function printSummary(tag, res) {
  const s = summarizeLog(res.log);
  for (const g of s.gate.slice(0, 80)) console.log('  ' + g);
  if (s.cs.length) { console.log(`[${tag}] ${s.cs.length} compiler errors:`); for (const e of s.cs.slice(0, 60)) console.log('  ' + e); }
  if (s.other.length) { console.log(`[${tag}] notable log lines:`); for (const e of s.other.slice(0, 25)) console.log('  ' + e); }
  return s;
}

// Unity 6.3 on this machine sometimes crashes (0xC0000005) AFTER "Batchmode quit successfully invoked", with the
// work already done. Treat that as a clean exit; any crash before that line is a real failure.
function cleanQuit(res) {
  if (res.code === 0) return true;
  if (/Batchmode quit successfully invoked/.test(res.log) && !/Aborting batchmode/.test(res.log)) {
    console.log(`[gate] note: Unity crashed during shutdown (exit ${res.code}) after quitting cleanly; ignoring.`);
    return true;
  }
  return false;
}

function parseNUnit(xmlFile) {
  if (!fs.existsSync(xmlFile)) return null;
  const xml = fs.readFileSync(xmlFile, 'utf8');
  const run = xml.match(/<test-run[^>]*>/)?.[0] ?? '';
  const attr = (s, a) => s.match(new RegExp(`\\b${a}="([^"]*)"`))?.[1];
  const failures = [];
  const re = /<test-case\b([^>]*)>([\s\S]*?)<\/test-case>/g;
  let m;
  while ((m = re.exec(xml))) {
    if (attr(m[1], 'result') !== 'Failed') continue;
    const msg = m[2].match(/<message><!\[CDATA\[([\s\S]*?)\]\]><\/message>/)?.[1] ?? '';
    const st = m[2].match(/<stack-trace><!\[CDATA\[([\s\S]*?)\]\]><\/stack-trace>/)?.[1] ?? '';
    failures.push({ name: attr(m[1], 'fullname'), msg: msg.trim(), where: st.split('\n').find((l) => /Assets[\\/]/.test(l))?.trim() ?? '' });
  }
  return { total: +attr(run, 'total') || 0, passed: +attr(run, 'passed') || 0, failed: +attr(run, 'failed') || 0, skipped: +attr(run, 'skipped') || 0, failures };
}

async function unityJob(kind, args) {
  if (!fs.existsSync(UNITY)) { console.log(`[gate] Unity not found at ${UNITY} (set KNOTWELL_UNITY)`); return 2; }
  return withLock('unity', `${kind} ${args.join(' ')}`.trim(), async () => {
    if (editorHoldsProject()) { console.log('[gate] BLOCKED: the Unity Editor has KNOTWELL open. Close it (or ask the human to) and retry.'); return 75; }

    if (kind === 'compile') {
      const res = await runUnity(['-quit'], `compile_${stamp}`);
      const s = printSummary('compile', res);
      const ok = cleanQuit(res) && s.cs.length === 0 && !/Scripts have compiler errors/.test(res.log);
      console.log(`[compile] ${ok ? 'OK' : 'FAILED'} in ${res.secs}s (exit ${res.code}) log: ${path.relative(ROOT, res.logFile)}`);
      return ok ? 0 : 1;
    }

    if (kind === 'test') {
      const platform = /^play/i.test(args[0] ?? '') ? 'PlayMode' : 'EditMode';
      const filter = args.slice(1).find((a) => !a.startsWith('--'));
      const category = args.find((a) => a.startsWith('--category='))?.split('=')[1];
      const xml = path.join(ROOT, 'TestResults', `${platform}_${stamp}.xml`);
      fs.mkdirSync(path.dirname(xml), { recursive: true });
      const uargs = ['-runTests', '-testPlatform', platform, '-testResults', xml];
      if (filter) uargs.push('-testFilter', filter);
      if (category) uargs.push('-testCategory', category);
      const res = await runUnity(uargs, `${platform.toLowerCase()}_${stamp}`);
      const s = printSummary('test', res);
      const r = parseNUnit(xml);
      if (!r) { console.log(`[test] no results file (exit ${res.code}); compile errors or run failure. log: ${path.relative(ROOT, res.logFile)}`); return 1; }
      for (const f of r.failures.slice(0, 40)) console.log(`  FAIL ${f.name}\n       ${f.msg.split('\n').slice(0, 6).join('\n       ')}${f.where ? '\n       at ' + f.where : ''}`);
      const ok = r.failed === 0 && r.total > 0 && s.cs.length === 0;
      console.log(`[test:${platform}] ${ok ? 'OK' : 'FAILED'} ${r.passed}/${r.total} passed, ${r.failed} failed, ${r.skipped} skipped in ${res.secs}s. xml: ${path.relative(ROOT, xml)}`);
      if (r.total === 0) console.log('[test] zero tests ran; check the filter/category and that the test asmdef is found.');
      return ok ? 0 : 1;
    }

    if (kind === 'exec') {
      const [method, ...extra] = args;
      if (!method) usage();
      const passthrough = extra[0] === '--' ? extra.slice(1) : extra;
      const res = await runUnity(['-quit', '-executeMethod', method, ...passthrough], `exec_${method.split('.').pop()}_${stamp}`);
      const s = printSummary('exec', res);
      const ok = cleanQuit(res) && s.cs.length === 0 && !/executeMethod method .* threw exception/i.test(res.log);
      console.log(`[exec ${method}] ${ok ? 'OK' : 'FAILED'} in ${res.secs}s (exit ${res.code}) log: ${path.relative(ROOT, res.logFile)}`);
      return ok ? 0 : 1;
    }
    usage();
  });
}

let code;
switch (cmd) {
  case 'check': code = await withSlot('check', async () => dotnetCheck(rest[0] ?? 'all')); break;
  case 'core': code = await withLock('dotnet-core', 'core', async () => dotnetCoreTests(rest[0])); break;
  case 'compile': code = await unityJob('compile', []); break;
  case 'test': code = await unityJob('test', rest); break;
  case 'exec': code = await unityJob('exec', rest); break;
  default: usage();
}
process.exit(code);
