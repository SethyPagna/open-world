# TEAMBOUND 13 — validation and limits

Build: `e98f0731e3b5f2c4e659` · protocol 10.

## Checks executed in this revision

| Suite | Passed | What it establishes |
|---|---:|---|
| Rendered-browser and import pipeline | 25 | Actual v13 boots and compiles shaders; existing jump/FPS rig works; new inspector controls work; bounded character data, failed-decode rollback, no duplicate parts, offline-save/reload and GLB export function. **Character ingestion uses synthetic triangle fixtures.** |
| Existing contact-motion regression | 8 | Procedural explorer skin matrices, supported stance, independent hands, finger-contact targets, crouch, normalized weights and inverse binds. **Not the real rescuer's gameplay motion.** |
| Core physics regression | 30 | Metric gaps, crouch clearance, steps, oriented contacts, reach, hangs, mantles, props, ropes, and an input-driven freight route. |
| Mode rules | 15 | Existing scenario objective/state invariants remain valid. Not all complete route playthroughs rerun. |
| Four-client authoritative loopback | 12 | Canonical IDs/slots/seats, same snapshots, individual One Body movement, stale-input timeout, reconnect, permissions, mode/run transition, shared raft, late join, old-build rejection, host migration. **Native WebSocket clients, not four physical internet devices.** |

**90 local checks passed, 0 failed.** Individual reports are in `checks13` with the current build and explicit scope. Synthetic fixture exports are removed after the test so they cannot be mistaken for delivered human assets.

The network suite was run without artificial delay this revision. Earlier delayed tests are not counted or republished as new evidence. Core simulation files were compared byte-for-byte to the supplied v12 archive: engine.js, lab_sim.js, party_sim.js, spatial10.js and protocol10.js are unchanged. See `unchanged_authority.json`.

## Real public human conversion — separate asset environment

The actual Fire_Male_01 FBX was fetched and its Git blob ID verified. Source SHA-256:
`41489040dd25fdb4cf370d48f1c072eae2b714e0502806904b860cfe8b58883b`.

Actual conversion output: 4,322 original positions; 5,234 split render vertices; 8,551 triangles; 80 source skin clusters mapped into 48 runtime joints; maximum rounded weight-sum error approximately 1e-7. Rest-pose bounds are approximately 0.6424 m wide and 1.8009 m tall. These dimensions are asset measurements, not a population anatomical claim.

The prepared data package is 6,773,975 bytes with SHA-256:
`58d55ebd7aa0cbb9906bceaa2042aeb8b6b894676ece4a632c337c3c6fe7e2d6`.

Colour textures retain actual source image detail, up to 2048 pixels; normal textures are converted to 1024 pixels. The actual 48-joint GLB was loaded and posed in Chromium with Three.js. Twenty pose/time samples remained finite. The offline asset studio issued zero external requests. Standing and reaching screenshots of that actual model were visually inspected. This independent studio is clearly labelled, not represented as the multiplayer game.

The 24.8 MB separate asset pack also includes the original FBX, converted texture files, licence, conversion code, source hashes, independent viewer, data-only game package, and a GLB with three sampled procedural pose studies. An offline embedding utility was tested with a synthetic HTML fixture; it does not upload the selected game.

## Still unverified or unfinished

- The real rescuer was **not** rendered end-to-end inside the complete game in this local test environment. Synthetic ingestion tests and an independent real-asset studio do not prove that integration's visual/contact correctness.
- The three sampled GLB studies are not mocap and do not establish foot locking on live terrain. Studio sample finiteness is not a deformation-quality score.
- Photo-textured low-poly source does not equal final AAA photorealism. It is a firefighter/rescue model rather than final bespoke alpine clothing.
- Clothing is skin-deformed, not an independently simulated garment. No full facial performance, advanced hair, or new terrain production assets are delivered.
- No public-WAN multi-device trial, mobile/headset test or performance promise.
- Original procedural explorer remains fallback until character installation. Online installation needs internet and secure hashing; host-side embedding is the recommended LAN party path.

## Initial test errors, corrected before release

The first browser launch lacked an X display; rerunning under Xvfb resolved it. The first closed-details label assertion read rendered text instead of DOM text; it was corrected and the whole browser suite passed. Public asset conversion and studio setup also required coordinate/name normalization and proper 48-joint testing. Failures were not counted as successful checks.
