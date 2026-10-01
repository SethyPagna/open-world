# Reader notes: _design/WORLD_STRUCTURE.md (early v1, "The Nested Wells")

**Source:** `_design/WORLD_STRUCTURE.md`, 886 lines, "THE NESTED WELLS: World Structure v1.0 (final)", dated 2026-09-28. Read in full, §0 to §16 (including the review log and resolved open questions).
**Reader:** early-WORLD_STRUCTURE · **Written:** 2026-09-30 for the v2 redesign (one connected open world, one story, Steam lobbies of up to 8 in NGO host mode).
**Pillars used below:** P1 Clear · P2 One world, one story · P3 Genuine · P4 Easy to start · P5 Organized · P6 Open world, together.
**Era note:** this is the earliest world file. It was written for **KNOTSPIRE**, the web build (three.js 0.186.1, a Node server, IndexedDB), where the players are candle people called **Wicks** and the frog is only a statue and an idiom. Most of its well geometry and reveal numbers (R 51 m, lip 180 m, sky disc 31°→74°, the 26 s "Out of the Well" reveal) were later carried into `master/01_WORLD.md` for the Unity/frog version. When the two disagree, the master file is the newer source.

---

## Summary for the archive

`WORLD_STRUCTURE.md` owned everything *around* a run of KNOTSPIRE, an 8-player party climber. The separate `GDD.md` owned rooms, the floor loop, betrayal, bots and the shop. This file decided where each stop sits in 3D space, what players see beyond it, how runs chain into layers, and how the camera reveals a bigger world after each boss.

Its main decisions: one layer equals one 36–45 minute run. Four layers (the Well, the Sky, Space, the Beyond) plus a closing Revelation make a campaign of about 2.6 hours over 4 sessions. Five laws hold the world together. The biggest: each layer's exit is the next layer's centre, and the stars you see are real lanterns held by those who stopped climbing. Layer 1 is "the Braid in the Well": five stone columns rising inside a 51 m well, with a disc of sky (the Coin) that grows from 31° to 74° as you climb. A seeded maze of stone ribs rises during the door draft. Each later layer adds one physics rule (UPDRAFT, DRIFT, LIGHT-LAG). Long camera pull-backs reveal the next scale, synced for all 8 players. An "astrolabe" map zooms out from the local floor to the whole world. The final line, "Every sky is someone's well", points the idiom outward.

It also held measured maze statistics, render and network budgets, a slice cut line, 12 change requests to the GDD, and three review logs.

---

## Reusable for v2

Each row says where the idea sits in the source and why it fits the new pillars.

### World and lore

| # | Item | Where | Why it fits |
|---|---|---|---|
| W1 | **The idiom and the closing line.** 井底之蛙 ("the frog at the bottom of the well") and "Every sky is someone's well." | §1, §2 (★ row), §10.5 | One story theme a player gets in one sentence. Every region, quest and reward can serve it (P2). The line is short and human (P3). |
| W2 | **Outward, not inward.** The draft ending ("Your well was all of it") was replaced because the idiom's lesson is that your circle is *not* everything. | §0 row 7, §16 Review 2 F3 | Gives the one story a clear direction: the world keeps getting bigger and kinder to curiosity. A good rule for every v2 quest line (P2). |
| W3 | **Law 1: the exit of every layer is the centre of the next.** Your well's mouth is the Sky's Foot. | §1, §5.1 | A single spine for a connected open world: regions nest outward from the starting well, so travel always means "up and out" (P2, P6). |
| W4 | **Law 2: the stars are real lanterns.** The lights overhead are lanterns held by folk on the rim, at their true positions. | §1, §4.4, §10.2 | The world keeps its promises: a light you see is a place you can reach, with someone standing there (P2, P3). In v2 these can be the frogs of the surface town. |
| W5 | **Law 3: every layer leaks the next.** Each stop shows a bigger piece of what comes next (the Coin, a tear in the dome, a nebula smear, moss glints). | §1, §2 (build-up cue column), §9.2 | The next goal is always on screen, so players know where to go without a quest arrow (P1). Classic landmark navigation for an open world. |
| W6 | **Law 4: up is outward, and the map is the world seen from far away.** A node's angle on the map equals its real bearing. | §1, §11.2 | An honest map is easy to read: what is "left" on the map is left in the world (P1, P5). |
| W7 | **The Coin.** From the bottom of the well the only sky is a bright disc. It widens as you climb (31° → 37° → 44° → 56° → 74°), and the boss silhouette hangs in it from minute zero. | §4.1, §4.3 | Progress you can see with no UI at all, and the final goal is visible from the first frame (P1, P4). |
| W8 | **The Coin shows the real sky of the next area,** at the current time of day. | §4.1, §9.2 | In a persistent world this is literally true: look up from the well and you see the actual sky region above (P2, P6). |
| W9 | **The Mound: 64 well mouths on a hill in a sea of cloud.** Your well is one of many. Past clears glow on it. | §3.3, §10.2 (9.0–12.5 s), §11.5 | Turns the story reveal into open-world geography. Other wells can be other frog villages, towns and dungeons (P6), and the reveal still serves the idiom (P2). |
| W10 | **The Rim as the next area's hub,** built out from your own well's lip. "Look south and your well is still lit." | §10.2 (23.5–26.0 s), §15 CR10 | Continuity between areas: you arrive where you left, and you can still see home (P2, P6). |
| W11 | **Region identities by structure:** the Well is a *tower* you climb, the Sky is a *maze* of cloud islands crossed on wind lanes, Space is a *dungeon* of decks, the Beyond is a *maze of dungeons*. | §5.2 | Each region gets one simple, readable shape. In v2 they become explorable places, not connectors (P6). |
| W12 | **The Sky region picture.** A cloud archipelago in rings (900 / 1,400 / 2,000 m) under a painted dome; the painted stars are pinholes with lanterns behind them; storms and thunderheads; birds. | §5.1, §9.2, §10.3 | A strong, frog-friendly second region. The painted dome is a clear story twist that stays inside the idiom ("your sky was a ceiling") (P2). |
| W13 | **Title-card lines per region:** "Your sky was a hole." · "Your sky was a ceiling." · "Your world was a speck." · "Every sky is someone's well." | §2 | Short, specific writing that sounds human (P3) and states the one theme at each step (P2). |
| W14 | **The Seam.** A crack in a hidden alcove shows a sliver of the next area (a warm draft and daylight; stars behind a torn dome). It pays nothing but fills a Codex page. | §6.4 | A good open-world secret: curiosity rewarded with story, not power (P2, P3). Place Seams at fixed spots in v2. |
| W15 | **Watchers leave lights in the sky.** Those who stopped climbing rise and hang a lantern above the area they left. | §1 Law 2, §4.4, §8.2 | Adapt as an MMO trace: frogs (players) who already climbed out leave lanterns that newer players below can see. The world shows that others were here (P6). |
| W16 | **"The world is never empty."** Other stops render with their occupants' lights visible; in solo, figures still appear on the next stop. | §4.7, §8.2 item 1 | The shared-world feeling from 8 players plus NPC frogs, even at low player counts (P6). Use townsfolk, not party bots. |

### Characters

| # | Item | Where | Why it fits |
|---|---|---|---|
| CH1 | **The stone frog statue** at the Foot, looking up. Inspect: "井底之蛙. Worn smooth where someone kept pointing up." Later: "The frog has gone up." | §4.7, §10.5 (66–75 s), §15 CR8 | A quiet, specific story anchor for the first town (P2, P3). At the Revelation the nearest giant rim silhouette is this frog: a strong bookend. |
| CH2 | **The lantern-folk.** Twelve silent figures who hold lanterns on 3 m poles over the well's lip. They are "the ones who watch from above". | §1 Law 2, §4.4, §10.2 | Ready-made NPC group for the surface: the frogs who climbed out first and wait for the next ones. Give each a name and a voice in v2 (P3). |
| CH3 | **The colossal rim watchers** at the end, leaning over a far larger well. | §10.5 (46–58 s) | The final image of the one story: you become a watcher yourself. Fits P2. |
| CH4 | **A market alcove keeper** ("Old Tallow's Market", the X alcove). | §6.1, §6.4 | A merchant NPC slot exists. The candle name must be renamed for the frog world. |

### Frog mechanics and movement

| # | Item | Where | Why it fits |
|---|---|---|---|
| M1 | **Glide (UPDRAFT).** Hold Jump in the air: fall at most 3 m/s for up to 1.5 s. Side gusts (4 m/s for 2 s) every 20–40 s, telegraphed 1 s ahead by streamers. | §9.1 | One button, one new verb for the Sky region, easy to learn (P4). Telegraphed hazards are fair (P1). |
| M2 | **Gentle, themed respawn lines** for falls: "The updraft returns you." | §9.1 (void fall row) | Failure that feels like part of the world, not a punishment (P3, P4). |
| M3 | **Travel routes per region:** a spiral stair climb inside a column (4.5 s first time, 2.5 s after), wind lanes (8 s), later pods and glides. | §5.3, §12.2 | Short scripted rides make good fast-travel links between hubs in an open world (P5, P6). Keep them short. |
| M4 | **The Coin glance.** On the first arrival at a new stop, the camera tilts up to show the goal (0.6 s up, 0.6 s hold, 0.5 s back), and any mouse move over 2° cancels it. | §4.5 | Shows "where to go next" without a prompt, and never fights the player (P1, P4). |
| M5 | **Camera pitch up to +80°** in hubs so players can actually look at the sky goal. | §4.5, §15 CR9 | Small rule that makes W7 work (P1). |
| M6 | **Movement reference numbers:** walk about 5 m/s, auto-mantle 1.3 m, jump apex 1.4 m, and the warning that the GDD jump physics did not produce that apex. | §7.3, §15 notes | Keep one checked set of frog jump numbers from day one, so level geometry and physics agree. |

### Art

| # | Item | Where | Why it fits |
|---|---|---|---|
| A1 | **Safe places warm and bright, danger places dark.** Hubs, travel and reveals use warm lanterns; dungeons stay dark (ambient ≤ 0.1, fog ≤ 15 m). | §9.2, §16 Review 2 F9 | Players read safety from light alone (P1). A clean art rule for the whole world (P2). |
| A2 | **Readable goal without looking up:** a dusty light pillar from the well mouth down to the water, and the Coin reflected in the water. | §4.5 | Keeps the goal in view from any angle (P1). Cheap to build. |
| A3 | **Players visible at distance:** each player is a constant-size flame sprite (at least 14 px) with a name tag; name tags within 25 m in hubs. | §4.7, §10.1 | Other players are always visible, a core MMO feel (P6). Swap the candle flame for a firefly glow. |
| A4 | **One boss look per region, all "a thing that covers the light":** Bronze Snuffer, Thunderhead bell, Docking bell, Halo bell (glass, a tiny galaxy inside). | §2, §9.2 | Region bosses share one visual idea (a bell or cover over the light), which ties them to one story (P2). The later master file turned this into the Jar. |
| A5 | **Watchers per region:** lanterns over the lip, lanterns behind pinholes in the dome, beacons on a moon, new stars on a halo. | §9.2 | Law 2 made visible in every region (P2). |
| A6 | **The miniature read.** A tilt-shift pulse makes the hill of wells look like a toy, then releases. | §10.2 (12.5–18.0 s) | A clear visual way to say "your world was small" (P2). |
| A7 | **The moss match cut.** Galaxy filaments turn into moss veins on one stone of a giant well, pixel-matched. | §10.5 (20–32 s) | A memorable ending image that closes the one story (P2, P3). |
| A8 | **Photosensitivity rules:** no flash; whiteouts ramp in ≥ 600 ms and out ≥ 400 ms; a cream crossfade in reduced-motion mode; state shown by shape plus pattern, never colour alone. | §10.1, §10.6, §11.4 | Accessibility from day one, and low risk for a small team. |

### Audio

| # | Item | Where | Why it fits |
|---|---|---|---|
| AU1 | **One theme that climbs with the world.** The hub waltz starts in F and moves up a fifth per region (F → C → G → D → back to F at the end). | §2 (keys), §9.3 | A single musical identity for the whole world; each region is the same song, higher (P2). |
| AU2 | **One voice per region:** kalimba drips keyed to the water (Well), breathy flute (Sky), glass bells (Space), choir pad (Beyond), ending on a music box. | §9.3 | Players know where they are by ear (P1). Simple for a tiny team. |
| AU3 | **A 5-note pentatonic motif** that the reveal plays at half speed in the next key; player chimes (keys 1–5) always harmonise. | §2, §10.1 (Chorus) | Players making music together without wrong notes is a gentle, social MMO touch (P6). |
| AU4 | **The First Shout.** On the rim, your first shout gets no echo (in the well it came back at once). Thunder answers 6 s later from a cloudbank 1.03 km away. | §10.2 | A small, true, physical moment that makes the world feel big without any text (P3). |
| AU5 | **Scale by sound:** a lowpass opening from 400 Hz to 12 kHz and reverb growing (1.0 / 3.0 / 8.0 s) as the camera pulls back; exactly 200 ms of silence before the motif. | §10.1 | Reusable audio grammar for big reveals and for entering large open spaces. |
| AU6 | **Intensity layers Calm / Tension / Pressure.** | §9.3 | A simple adaptive-music scheme for exploration vs danger. |

### Tech (ideas that port to Unity 6 + NGO host mode)

| # | Item | Where | Why it fits |
|---|---|---|---|
| T1 | **Host computes once, broadcasts; clients never regenerate.** Integer-only decisions from a seeded RNG. | §7.1, §13 | Avoids float drift between machines. Fits NGO host authority directly. |
| T2 | **Synced cutscenes:** host sends `reveal_start {layer, variant, t0}`; every client starts at t0 + 500 ms; everyone sees the same frame; a rejoiner plays from the current time. | §8.2 item 6 | Story moments shared by the whole group, even on a voice call (P6). |
| T3 | **Far players are cheap:** positions of players in other areas streamed at 2 Hz (about 0.2 KB/s for 8). | §8.2 item 1 | A budget pattern for showing all 8 players across a big world (P6). |
| T4 | **Hide scene swaps behind a mask** (fog wall, whiteout, a tear) or once the old view is under 48 px. | §10.1 | Standard trick for streaming between regions without visible pops. |
| T5 | **No hitches in cutscenes:** warm shaders before a reveal, capture impostors before the exit, fixed pool of 12 point lights reassigned each frame, a check that the shader count stays constant. | §10.1, §14.2 G5 | Direct Unity equivalents exist (shader warm-up, light pooling). |
| T6 | **LOD by distance:** full detail ≤ 400 m, batched ≤ 3 km, points beyond, swaps inside haze. | §10.2 | A ready LOD plan for large outdoor regions. |
| T7 | **Performance targets:** 60 fps in hubs at 1080p Medium on Iris Xe; p95 ≥ 50 fps in cutscenes; ≤ 400k triangles; 1 shadow map. | §13 | Useful floor for a low-spec co-op game. Draw-call numbers must be re-measured in URP. |
| T8 | **Streamer mode:** hides seeds and shows player numbers instead of names. | §10.6, §11.4 | Cheap privacy feature for a social game. |
| T9 | **Human acceptance tests worth copying:** H2 "at least 80% change their answer to *how big is this world?* after the first reveal"; H3 "at least 70% tell low from high floors by the sky disc alone"; H6 "8/10 say *inside a well* and point up to the sky". | §14.2 | Numeric checks for P1 and P2 that a playtest can actually run. |

### Progression and UI

| # | Item | Where | Why it fits |
|---|---|---|---|
| U1 | **Failure changes how a story beat looks, never whether you see it.** | §3.2 (surfacing) | Fair progress: nobody is locked out of the story by a bad fight (P4, P3). |
| U2 | **Spoiler care in mixed groups:** by default start where some player has not been yet; warn when the host skips ahead; players who skip still see the reveal later. | §3.2 (layer choice, Tourist Pass) | The intent (friends at different progress can play together without spoiling) is exactly what drop-in co-op needs (P6). The v2 rule should be simpler: story beats trigger per player. |
| U3 | **Progress without power:** titles, a Codex page that replays reveals, visible "lit wells", earned-only cosmetic holders. "Nothing sells information." | §3.3 | Fits the fair cosmetic shop and the "addictive but fair" goal. |
| U4 | **Progress shown in the world:** your past clears glow on the hill of wells. | §3.3, §10.2 | Players see their history in the place, not in a menu (P1, P2). |
| U5 | **One map that zooms out.** Tab opens the local map; scrolling out (or M) zooms smoothly to the whole world, with a 220 ms iris. | §11.1 | One map, two inputs, local to world in one gesture (P5). |
| U6 | **Honest map with fog:** node angle = real bearing; places you have not reached show only their outline; details appear when you discover them. | §11.2, §11.3 | Clear, spoiler-free, and consistent with the world (P1, P2). |
| U7 | **A glyph budget:** at most 34 marks in view on the map. Touch targets 44 px. | §11.3 | A concrete clutter limit for P5. |
| U8 | **A small corner map arc** in hubs that fades after 5 s. | §14 (SHOULD) | Orientation without a permanent HUD (P1, P5). |
| U9 | **System line format** `[ TAG ] One plain sentence.` | throughout | Short, readable, consistent (P1). Use sparingly (see K3). |
| U10 | **Share card:** 1200×630, group shot on the left 60%, the vista on the right 40%. | §10.1 | Cheap social feature; helps word of mouth. |
| U11 | **"Next Layer" with the same lobby.** | §3.2 | The group stays together when moving on (P6). In v2 this becomes "travel together". |

---

## Party-only (to archive)

These only make sense in the v1 party climber. Archive them with the party-game repo.

| Item | Where |
|---|---|
| The GDD run loop the world wraps: the Foot, Floors 1–4, the Crown, the Ledger; Intermission 45 s, Door Draft 45 s (0.5 s claims, Calm then 10 s Stampede), the Latch and "Hold the Door", the Draft wind | §3.1, §8.1, §12.1 |
| The Theta Draft maze: stone ribs that rise at T−45 s so door-switching costs a detour during the Stampede; 1.2 m gaps as chokepoints for shoves; "two disjoint routes, so one griefer can never seal a door"; the lobby toggle "Draft maze: on / off"; A/B gate H4 | §7.3, §7.4, §14.2 G1/G8/H4 |
| Stampede shoves at chokepoints | §7.3 |
| Burnt Out / Snuffed climbers turning into Watchers with spectate, Notes and **bets**; the private line `[ YOU ARE A STAR NOW ] Don't tell them.`; Keyhole spectate from the lip | §4.4, §8.2 item 3 |
| Crown endings built on defection: Candlelit, **Everflame** (one claimant rides out alone while everyone else is Snuffed), Snuffed Summit; payouts "Everflame 300/40 vs Candlelit 150 each already make defection tempting" | §10.2 (variants), §16 Review 0 M2 |
| Pact threads (gold) and Knife links (red) drawn on the map and in the final reveal; witnesses and the Tribunal | §10.4 (Ledger events), §10.5 (0–6 s), §11.3, §16 Review 0 M7 |
| Rivals (bots filling seats), the Ghost Sim for bot-only rooms, the Drama Director, the Rival Register, the 60 s Autopilot | §8.1, §8.2, §16 Review 0 M11 |
| Door letters A Arena, B Baffle, C Chain & Climb, D Dilemma, E Enigma, X alcove, ♛ Crown; doors per floor `P ≥ 5 ? 4 : 3`; letter weights {B 30, C 30, D 40}; plaques like `◯ 2D`, `☁ 7B`, `✦ 13E`; Echo rooms; Side Doors; Grates | §6.1–§6.3, §5.3 |
| Run-scoped traits (16) and fusions (8), Altar cards, Drips currency, and the `[ OUTGROWN ]` preview line | §3.3, §9.4 |
| The Tide and Pressure timers that close a floor, and the Tide skin (well water drowning the floor below, the brass float gauge) | §4.6, §9.1 (Tide skin row), §12.1 |
| Room tier rising per layer (timer −24%, monster speed +32% at cap) | §3.1 |
| Minigames Snuff Tag, Wax Stack, Pinky Promise | §9.1 |
| The Crown fight vs the Great Wick (Vigil, Trust Fall, Crown Door, Phases 1–3) | §4.2, §16 Review 0 C5 |
| Spire choice (Stair, Labyrinth, Undercroft), the Mound as run select with three seeded candidate wells, 6-character Tower Seeds, Daily wells | §5.2, §11.5, §14 LATER |
| The Ascent as a campaign of 4 separate runs, Cycle 2 "The Well Above" as floors 21–40 | §3.2, §3.3 |
| Global floor numbering (layer ℓ floor k = 5(ℓ−1)+k; Crowns 5♛ 10♛ 15♛ 20♛) | §2, §6.3 |
| Occupant pips on the map (filled = human, hollow = Rival), capacity dots, door fan-outs | §11.3 |
| The joke line `[ SNUFFED SUMMIT ] The Tower will wait. It is good at waiting.` | §10.2 |

---

## Conflicts with the new pillars

| # | Item | Pillar | Why |
|---|---|---|---|
| K1 | **Wrong hero and vocabulary.** The players are Wicks (candles) and the only voice is the System; the frog is a statue. Words like wax, Snuffed, Burnt Out, Tallow, Drips, Brighten, Everflame, the Great Wick come from candles. | P2 | v2 keeps the Firefly Frog world. Candle words contradict it. Keep the ideas, rename everything into frog and firefly terms (the later master file already did most of this). |
| K2 | **The world is a run.** Each layer is one 36–45 min session; the layout (φ₀ bearing, mazes, alcoves) is re-rolled from a seed every time. | P6, P2 | A persistent-feeling world must be the same place every visit. Keep the geometry, fix it in place. |
| K3 | **Stops joined by scripted rides; rooms are instances "inside the well wall" behind doors.** | P6 | The owner wants one connected world, not 20 doors. Rides are fine as fast travel; dungeons should be entered from visible places. |
| K4 | **Space and the Beyond at true scale:** a 600 km planet, orbits in km, galaxies in Mly, 150k–200k point clouds, station decks, docking pods, airlocks and magboots. | P2, P6 | Sci-fi decks need a reason inside a frog folk tale, and none of it can be walked by 8 players together. Keep as story reveals or LATER. |
| K5 | **A new physics rule per region** (UPDRAFT gravity ×0.55, DRIFT gravity ×0.25 with no air drag, LIGHT-LAG). | P4, P6 | Relearning movement in each region raises the learning curve. LIGHT-LAG draws other players up to 1.5 s in the past and lets the map lie, which hides the shared world. Keep only the glide (M1). |
| K6 | **Abilities that silently change by region and by room** (range ×1/×2/×3, `'clamp'` vs `'full'` rooms, hold 0.3 s for the narrow form). | P1, P5 | Hidden numbers the player cannot see or predict. |
| K7 | **The repeated tutorial joke:** `[ TUTORIAL COMPLETE ]`, "That was the tutorial", "That was also the tutorial", "That was ███ tutorial", "The game begins now." | P3 | Funny once. Four times it makes the story feel like a trick. Keep one at most. |
| K8 | **Long unskippable first-view reveals** (26 / 24 / 30 / 75 s) that lock all clients in a TRANSIT state with only free look and emotes. | P1, P6 | Long camera moves stop play for the whole group. Keep them rare and short, and always end on a clear "what now". |
| K9 | **Heavy hidden systems in the space between stops:** a DFS maze generator with max-flow repair, per-layer tier offsets, Layer Omens that rooms opt into, a 35% alcove roll. | P5, P4 | Correct engineering, but none of it is visible or needed in a fixed open world. |
| K10 | **Too many progress nouns:** surfacing, 4 titles, Drips, Altar cards, Codex, Scale Plates, lit wells, Holders, Tower Seed, spire, Cycle 2. | P5, P4 | Too many things to learn before "no manual needed" holds. Pick a small set. |
| K11 | **Three names for maps and a dense map:** the Ledger overlay, the ring map, the astrolabe; log-polar bands with a perspective remap for L1; pupils, rete ticks, pips, capacity dots, light-lagged marks. | P5, P1 | One map, one name, fewer marks. Keep the zoom-out (U5) and the honest bearings (U6). |
| K12 | **Time of day tied to party progress** (afternoon on Floor 1, dusk on Floor 4, night at the Crown). | P6 | In a shared world, players stand in different places at the same moment. It needs one world clock. |
| K13 | **Host-picked start layer, the Tourist Pass, and the notice "2 Wicks have not left the Well. They will skip what they skipped."** | P6, P4 | Friction for drop-in play: joining a friend should never mean skipping or being spoiled. Needs a simpler rule. |
| K14 | **Every big reveal lands at about minute 37 of a session.** | P6, P1 | Timed pacing belongs to runs. In an open world, reveals must be tied to places and quests the player chooses to reach. |
| K15 | **Persistence is local profile only** ("no server persistence", no global counts). | P6 | A persistent-feeling world needs a host-owned world save plus per-player character saves that travel between lobbies. |
| K16 | **Door plaques with glyph + global floor + letter** (`☁ 7B`) and a 7-shape code (triangle, square, circle, diamond, hexagon, star, crown). | P4, P2 | A code to learn before you can choose. Signs in v2 should use frog-world pictures and names. |
| K17 | **Web-only tech:** three.js 0.186.1, postprocessing 6.39.5, a Node server, IndexedDB, a Web Worker for solo, SVG UI, Playwright SwiftShader gates, stroke-drawn Hangul because a single-file build had no CJK font. | Brief (Unity 6000.3 + NGO) | Stale for Unity 6000.3.25f1 with URP and NGO 2.13.3. Port the ideas (T1–T9), not the code or file paths. |
| K18 | **Void gaps between Landing and wall with fall volumes, and Landings you can only leave by the stair.** | P6 | Fine for a tower, but the v2 well should be walkable and climbable as a place, with paths between stops. |

---

## Key numbers and names

### Names

- **Game name in this file:** KNOTSPIRE; the "Knotspire" is the braid of stone strands. The document title is "The Nested Wells". (The Unity version is KNOTWELL.)
- **The idiom:** 井底之蛙. **Closing line:** "Every sky is someone's well."
- **Regions:** THE WELL 우물 · THE SKY 하늘 · SPACE 우주 · THE BEYOND 너머 · THE REVELATION 井底之蛙 · later CYCLE 2 · THE WELL ABOVE. **Glyphs:** ◯ ☁ ✦ ∞.
- **Title lines:** "Your sky was a hole." · "Your sky was a ceiling." · "Your world was a speck." · "Every sky is someone's well."
- **Well places:** the Foot, the Braid (five strands), Landings, the stairwell well, the Crown arena, the crown ring, the lip, the Coin, the light pillar, the Rim, the Mound, the X alcove, the Seam, the Keyhole Rail.
- **Characters:** the Wicks (players), the System (voice), the lantern-folk (12), the stone frog statue, the Great Wick, the Snuffer, Old Tallow (market).
- **Reveals:** ★1 "Out of the Well", ★2 "The Painted Sky", ★3 "The Speck and the Drop", ★4 "The Revelation".
- **Region bosses (skins):** Bronze Snuffer · Thunderhead bell · Docking bell · Halo bell.
- **Region rules:** UPDRAFT · DRIFT · LIGHT-LAG.
- **Surfacing titles:** *Out of the Well*, *Above the Paint*, *Speck-Walker*, *Someone's Well*. **Holders:** Well-stone, Paint-chip, Meteor-iron, Knot-glass.
- **Map:** the astrolabe (zoom out from the Tab map). **Codex page:** Scale Plates.
- **Statue lines:** `[ INSCRIPTION ] 井底之蛙. Worn smooth where someone kept pointing up.` and `[ INSCRIPTION ] 井底之蛙. The frog has gone up.`

### Well geometry (origin on the well axis, y up)

| Thing | Value |
|---|---|
| Well inner radius / lip height | 51 m / y 180 m (wall 184 m tall, 1.2 m thick) |
| Water / mist | y −2 m / mist from −2 to +8 m |
| Strands | 5 columns, r 5 m, centred 30 m from the axis, 72° apart |
| Stop heights | Floors 1–4 at y 0 / 30 / 60 / 90; Crown arena (r 20 m) at y 120; crown ring at y 150 |
| Stop layout | 18 m disc; stairwell well r 3 m at the centre; door arc r 16 m facing the wall; parapet r 19 m; 2 m void gap to the wall |
| Lantern-folk | 12, 30° apart, lanterns at r 47 m, y 182 m, on 3 m poles |
| Coin size by stop | 31.1° / 36.7° / 44.4° / 55.9° / 74.0°; sky share 3.7% → 21.1% (5.7× growth) |
| Coin during the lift | 93° / 126° / 175° at y 140 / 160 / 177 |
| Sightline clearance | ≥ 8.5 m measured; gate ≥ 3 m |
| Wisp rise speed | 3 m/s (31 s from Floor 4 to the lip) |

### Beyond the Well

| Thing | Value |
|---|---|
| The Mound | 64 well mouths; Vogel spacing r = 72·√(i + 0.5) m; min spacing 111 m; mound about 1.24 km across |
| Sky islands | rings at 900 / 1,400 / 2,000 m (altitudes +60 / +150 / +280); Crown on the rim at 2,600 m, +480 |
| Painted dome | R 30 km; far plane 40 km; cloudbank 1.03 km out; 40 birds |
| Space (LATER) | planet R 600 km; orbits 1.5 / 2 / 3 R; moon dock at 4 R |
| Beyond (LATER) | knots at 40 / 90 / 150 Mly; halo at 220 Mly |

### Movement

- Walk 5 m/s · auto-mantle 1.3 m · jump apex 1.4 m (flagged: the GDD's vy₀ 5.3 m/s at g 20 m/s² only reaches 0.70 m).
- Glide: fall ≤ 3 m/s, up to 1.5 s per jump; Sky gravity ×0.55; gusts 4 m/s for 2 s every 20–40 s, 1 s warning.
- Space gravity ×0.25 (LATER).
- Rides: stair climb 4.5 s first / 2.5 s after · wind lane 8 s · pod 10 s · filament glide 10 s.
- Coin glance: up 0.6 s, hold 0.6 s, back 0.5 s, to +65°; cancelled by a mouse move over 2°. Hub camera pitch −55° to +80°.

### Palette

| Use | Hex |
|---|---|
| Well dusk ramp | `#1B2340` → `#F2A65A` |
| Night starfield | `#0B0E1F` |
| Anonymous lantern stars | `#FFF4E0` |
| Warm hub lanterns | `#FFB86B` |
| Well moss | `#557D33` |
| Beyond nebula fog | `#FF8FD0` |
| Filament glow | `#DCE3F0` |
| Planet limb | `#7FB8FF` |
| Cream (reduced-motion fade, UI text) | `#F4EDE3` |
| UI night panel | `#0E0B10` at 88% |
| UI gold | `#FFD76A` |

### Audio

- Keys per region: F → C → G → D → F (Revelation). Transposition 0 / −5 / +2 / −3 / 0 semitones.
- Region voices: kalimba drips · breathy flute · FM glass bells (ratio 1:3.5) · formant choir pad · music box at the end.
- Motif: 5-note pentatonic, played ×2 slower in the next key. Lantern chimes quantised to 1/8 at 96 BPM.
- Reveal sound: lowpass 400 Hz ↔ 12 kHz; reverbs RT60 1.0 / 3.0 / 8.0 s; exactly 200 ms silence at each handoff.
- First Shout: thunder 6.0 s after the shout (2.06 km round trip at 343 m/s).

### Timing

- Reveal lengths first / repeat: ★1 26 / 8 s · ★2 24 / 8 s · ★3 30 / 9 s · ★4 75 / 20 s.
- ★1 key beats: whiteout swap at 6.0 s; lanterns bloom at 6.6 s; group shot at 7.0 s; mound fills the frame at 16.3 s; sun crest at 21.0 s; motif at 20.6 s.
- Run median 37.5 min (fast 26, slow 55); world overhead about 44 s per run (gate ≤ 90 s); a new sight cue about every 7.5 min; campaign about 2.6 h.
- Foot warm-up 60 s (matches P4's "control within 60 s").

### Network and tech

- Tick 30 Hz, snapshots 20 Hz, 12 KB/s per-client budget; far-player positions 2 Hz (≈ 0.2 KB/s for 8).
- World plan message ≤ 4 KB, sent once; cutscene start at t0 + 500 ms using the median of 5 pings; disconnect autopilot 60 s.
- 60 fps in hubs at 1080p Medium on Iris Xe; p95 ≥ 50 fps during ★1; ≤ 400k triangles; 1 shadow map; 12 pooled point lights; draw calls ≤ 150 in reveals and ≤ 300 in hubs (three.js numbers, re-measure in URP).
- LOD: full ≤ 400 m, batched ≤ 3 km, points beyond.
- Human gates: H2 ≥ 80% change "how big is this world?"; ≥ 70% name the lanterns as a surprise · H3 ≥ 70% tell low from high stops by the Coin · H6 8/10 say "inside a well".

### UI

- Map zoom 220 ms with an 8-blade iris; map nodes 22 px with 44 px touch targets; at most 34 marks in view; corner map arc 120 px, fades after 5 s.
- Share card 1200×630 (group 60% left, vista 40% right).
- Reduced motion: 4 stills × 2.5 s, rotation capped at 60°/s.
- System line format: `[ TAG ] One plain sentence.` Examples kept: `[ WELCOME, WICK ] That was the tutorial.` (rename for frogs), `[ INSCRIPTION ] …`.

<!-- END -->
