// Emits one line per agent completion/failure across the given workflow journals.
import fs from 'node:fs';
const base = 'C:/Users/mrkl6/.claude/projects/C--Users-mrkl6-Downloads-Projects-Team-CO-OP-make-me-a-name/555c35cc-5651-4336-ba70-20ead6f6a594/subagents/workflows/';
const runs = process.argv.slice(2);
const seen = new Map(runs.map((r) => [r, 0]));
const labels = {};
let failures = 0;
function scan() {
  for (const r of runs) {
    let text = '';
    try { text = fs.readFileSync(base + r + '/journal.jsonl', 'utf8'); } catch { continue; }
    const lines = text.split('\n').filter(Boolean);
    for (let i = seen.get(r); i < lines.length; i++) {
      let l; try { l = JSON.parse(lines[i]); } catch { continue; }
      if (l.type === 'started') labels[l.key] = l.label;
      else if (l.type === 'result') console.log(`${r.slice(3, 9)} DONE ${labels[l.key] ?? l.key.slice(0, 12)}`);
      else if (l.type === 'failed' || l.type === 'error') { failures++; console.log(`${r.slice(3, 9)} FAILED ${labels[l.key] ?? l.key.slice(0, 12)} ${JSON.stringify(l).slice(0, 160)}`); }
    }
    seen.set(r, lines.length);
  }
}
// Skip history already present at start (earlier failed attempts).
for (const r of runs) { try { seen.set(r, fs.readFileSync(base + r + '/journal.jsonl', 'utf8').split('\n').filter(Boolean).length); } catch {} }
for (const r of runs) { try { for (const l of fs.readFileSync(base + r + '/journal.jsonl', 'utf8').split('\n').filter(Boolean)) { const j = JSON.parse(l); if (j.type === 'started') labels[j.key] = j.label; } } catch {} }
setInterval(scan, 3000);
