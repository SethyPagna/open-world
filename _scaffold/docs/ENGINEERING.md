# Engineering conventions (read before writing code)

Project root: `_scaffold/` (will be renamed to the game's name). Browser game: TypeScript + Three.js r186 +
pmndrs `postprocessing` 6.39 + Vite 8. Node 24. Everything visual and audible is procedural (no asset files).

## Commands (run from the project root)
- Typecheck: `node node_modules/typescript/bin/tsc --noEmit -p .`  (do NOT use `npx`; it hangs on this machine)
- Screenshot / playtest harness: `node tools/shot.mjs --query "demo=physics" --out shots/<you>/x.png [--wait 3000] [--steps-json '[...]']`
  - It connects to a shared dev server (port 5199) and a shared headless Chromium when they are running,
    and prints a JSON report: `errors` (console.error / page errors), `report` (= `window.__TF.report()`), `logs`.
  - Exit code 1 means the page logged errors. At most 4 browsers run at once (it queues automatically).
  - A run takes ~40 s. Put your screenshots in `shots/<your-module>/`. Look at them with the Read tool.
- Node unit tests: plain TypeScript files run directly by Node's type stripping: `node tests/<name>.test.ts`.
  Use `node:assert/strict`. No test framework.

## TypeScript rules (enforced by tsconfig)
- `strict`, `verbatimModuleSyntax`, `erasableSyntaxOnly`: no `enum`, no `namespace`, no constructor parameter
  properties, use `import type` for type-only imports.
- **Relative imports include the `.ts` extension**: `import { Rng } from '../core/rng.ts'`. This lets Node run
  shared logic (tests, server) directly.
- `import * as THREE from 'three'`. Addons: `import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'`.
- three r186 notes: `THREE.Clock` is deprecated (use `THREE.Timer` or performance.now()); `PCFSoftShadowMap`
  was removed (use `PCFShadowMap` + light.shadow.radius); colour management is on by default (sRGB).
- Contracts live in `src/core/api.ts`. **Do not edit api.ts.** If you need more, export extra types/methods from
  your own module and mention it in your report.
- Only create/edit files inside the paths assigned to you. Other agents are editing other files concurrently.
  Typecheck errors in files you do not own are not yours to fix; mention them in your report.
- Gameplay randomness uses the seeded `Rng` (src/core/rng.ts), never `Math.random()` (cosmetic-only jitter is ok).
- No external assets or network fetches at runtime except Google Fonts CSS (with fallbacks).

## Performance budget (mid-range laptop, 1080p, 60 fps)
- < 300 draw calls per frame in rooms; use InstancedMesh / merged geometry for repeated kit pieces.
- One shadow-casting directional light (2048 map) + a few unshadowed point lights. Bloom via postprocessing.
- Dispose geometries/materials/textures when a scene exits. No per-frame allocations in hot loops (reuse vectors).
- `?test=1` (set by the harness): pixel ratio 1, no pointer lock, deterministic seeds, skip intro cinematics.

## Test hooks
Every scene/demo must set `window.__TF = { report(): object, debug: { ... } }` (merge, do not replace, if it
already exists) so the harness can read state and drive behaviour (e.g. `__TF.debug.solve()`).

## Code style
Match the surrounding code. Small focused modules. Comments only for non-obvious "why".
