#!/usr/bin/env node
// Keeps one headless Chromium alive so tools/shot.mjs can connect instantly instead of
// launching (slow on this machine). Writes the endpoint to tools/.browser_ws.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const server = await chromium.launchServer({
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'],
});
fs.writeFileSync(path.join(here, '.browser_ws'), server.wsEndpoint());
console.log('browser server ready', server.wsEndpoint());
const stop = async () => {
  try { fs.rmSync(path.join(here, '.browser_ws'), { force: true }); } catch {}
  await server.close();
  process.exit(0);
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
