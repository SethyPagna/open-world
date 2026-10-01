# TEAMBOUND 13 — Rescue Edition

Character-focused revision of the supplied v12 game. Existing gameplay, maps, controls and authoritative multiplayer are retained. This does not claim completion of photorealistic terrain, cloth simulation or mocap animation.

## Start solo

Open `teambound_rescue_v13.html` in a desktop browser. The existing explorer works without any external downloads. The new textured rescuer is an optional verified 6.8 MB asset package: expand **Character / Material Studio**, then **Install textured rescuer**. The first installation needs internet. Use **Save offline game** after installation to make a new single HTML with the rescuer embedded.

The download is data and image textures, not executable code. It is checked against SHA-256 before use. A failed download or invalid import retains the current character.

## Fully offline character installation (no Node.js)

Download the actual character pack from:
https://d2ol7oe51mr4n9.cloudfront.net/user_3J0Nno572Kz9GlNbwwAVIZ6FSSG/25a94b68-64d7-4949-affa-a9a3b30cbdb9.zip

Extract it. Open `EMBED_INTO_GAME_OFFLINE.html`, select this release's `teambound_rescue_v13.html`, and save the generated `teambound_rescue_v13_offline.html`. Your selected game is read in your own browser and is not uploaded. The original is unchanged.

Alternatively, in the game use **Import local .tbchar** and select the pack's `rescuer.tbchar`, then Save offline. The data-file import uses the same 48-joint rig and FPS visibility categories. Only this prepared format is supported, not an arbitrary FBX or GLB.

## Multiplayer: install the character ON THE HOST

Use Node.js 22 or newer. Close the old server. Run `INSTALL_RESCUER_WINDOWS.bat` first (or `node src/install_rescuer13.cjs`). It verifies the public package and embeds it into `public/index.html` and the standalone HTML. Then run `START_WINDOWS.bat` or `node server.js`.

All players open the same server URL/invite and use matching build **e98f0731e3b5f2c4e659**. The host installation supplies the same embedded model to each connecting browser. Installing a local character in one client does not distribute the model to other clients. HTTP LAN browsers may lack secure hashing for the online installer; embedding on the host avoids that requirement.

No online game server is hosted for you by these files. A localhost address is only for the hosting computer; use the host's LAN address for other computers on that network. Outside-network play needs a reachable server. Do not mix v12/v13 clients or servers.

## Inspect the character

Game: open movement inspection in Character / Material Studio. Seven inherited pose studies remain. New Face / Full body framing, quarter-speed and pause make close inspection easier.

Character pack: `OPEN_CHARACTER_STUDIO.html` contains an independent Three.js renderer with the actual retargeted GLB and textures, entirely offline. It is an asset studio, not gameplay footage. `rescuer_rigged_animated.glb` includes 48-joint skinning, embedded colour/normal textures and three sampled procedural studies. The original FBX and converted source textures are also provided.

## Controls

WASD movement; Space jump/mantle; left/right mouse grips; E interact; Ctrl crouch; V first/third person; L capture/release; middle-drag or Alt-drag for uncaptured look. H shows complete mode-specific controls. Tab opens shared-body positions. B/I retain measurement and collider tools.

## This revision

- A verified prepared public human package replaces the unverified raw-FBX download path as the primary installation method.
- Data-only import validates dimensions, joint indices, normalized weights, mesh arrays and embedded texture types.
- Model swaps commit only after complete texture decoding; invalid packages keep the prior character.
- Local .tbchar import reads files locally and requires no uploads.
- Colour plus normal maps load together; save-offline and GLB export preserve the imported asset.
- Corrected inverse-transpose skin-normal transform and safer cotangent normal-map frame.
- Close-up/slow/pause inspection and downloadable character diagnostics.
- Matching version hash fencing retained; gameplay source files unchanged.

## Evidence, not completion claims

Read VALIDATION.md. 90 local checks passed. Real source assets were separately converted and rendered in an independent asset studio. The actual game importer was tested using synthetic fixtures, not a locally rendered live run of this real human. Therefore actual-human end-to-end gameplay rendering/contact correctness across all modes remains an acceptance item.

Clothing is weighted to joints, not simulated fabric. Poses and exported studies are procedural, not motion capture. The source is an older low-poly firefighter asset, not an original scanned alpine character. No public-WAN four-device test is claimed.

## Build and tests

`python src/build13.py` rebuilds the exact unembedded game from retained baseline and patch modules. `node --check src/client_bundled.js` checks syntax. `npm run test:rules` and `npm run test:physics` run simulation regressions. Browser tests require Python Playwright, Chromium and an X display (`xvfb-run -a python checks13/browser13.py` on the tested Linux setup). They are developer tests, not needed to play.

For the network suite, start `PORT=8140 HOST=127.0.0.1 node server.js`, then `node tests/network_tests.cjs`. It uses four WebSocket clients on loopback. Reports document test scope. Do not treat a successful loopback check as public internet performance evidence.

## Source and rights

Human source: Microsoft Rocketbox Fire_Male_01, copyright (c) 2020 Microsoft, MIT. The source notice is retained in the game payload, exported GLB and character pack. See ROCKETBOX_MIT_LICENSE.txt and ASSET_PROVENANCE.md. No Microsoft endorsement implied.
