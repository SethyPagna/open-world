# Reader notes: master/01_WORLD.md (KNOTWELL v1)

**Source:** `_design/master/01_WORLD.md`, 1,125 lines, version 1.0, dated 2026-09-29, status BINDING for the v1 world structure. Read in full, sections 1 to 13.
**Reader:** master-01_WORLD · **Written:** 2026-09-30 for the v2 redesign (one connected open world, one story, Steam lobbies of up to 8 in NGO host mode).
**Pillars used below:** P1 Clear · P2 One world, one story · P3 Genuine · P4 Easy to start · P5 Organized · P6 Open world, together.

---

## Summary for the archive

`01_WORLD.md` is file 01 of the KNOTWELL v1 master design set. It owned the world of an 8-player co-op party climber: its shape, laws, bosses, camera reveals, seeded door planner and map. It turned the owner's picture ("frog in a well sees the sky, then space, then bigger") into four nested layers: the Well (doors 1–20), the Sky (21–40), Space (41–60) and the Beyond (61–80). Five laws held it together. Each layer's exit is the next layer's centre. The brightest stars are lanterns held by frogs who climbed out first. Every layer shows a piece of the next. The map is the world seen from far away. Every reveal gives a new movement verb.

Only the Well was specified for building: a stone shaft 51 m in radius and 180 m deep. Five stone columns ("the Braid") step up 30 m at a time, with Landings on top. The well's bucket is the boss arena, and the boss, a giant firefly jar, hangs in the disc of sky from minute zero. That disc (the Mouth) widens from 31° to 74° as you climb. Rooms were baked shells on a hidden grid, reached by fading through numbered doors. A host-side seeded planner filled each run. The file also fixed URP scale tricks, a 26 s "Out of the Well" reveal, and a 4 km limit for networked play. The feel goal: about every 90 s the player gets stronger, laughs, or sees something bigger.

---

## Reusable for v2

Each row says where the idea sits in the source and why it fits the new pillars.

### World and lore

| # | Item | Where | Why it fits |
|---|---|---|---|
| W1 | **The core idiom.** 井底之蛙 / 우물 안 개구리, "the frog at the bottom of the well", and the closing line "Every sky is someone's well." | §1.1, §3.5, §3.7, §9.9 (★4) | One theme a player gets in one sentence: a small frog finds out the world is bigger than its sky. Every region, quest and boss can hang on it (P2). The line is short and human (P3). |
| W2 | **Concentric world, "up is outward".** Well → Sky → Space → Beyond; each area's exit is the next area's centre (Law 1). | §1.2, §1.3 | Gives the open world one spine and one direction of travel. Rebuild the layers as connected regions, not door ranges (P2, P6). |
| W3 | **Law 2, "the brightest stars are real".** The lights you see overhead are lanterns held by frogs who climbed out before you, at their true positions. | §1.3, §3.1, §9.6 | A promise the world keeps: what you see is a real place with real frogs. In v2 those lights can be the surface town and its people, or other players' lanterns (P2, P6). |
| W4 | **Law 3, "every layer leaks the next".** From every stop you see a bigger piece of what comes next (the Mouth widening, a tear in the Sky's dome, a nebula smear, moss-green glints). | §1.3, §2.1 ("Law 3 leak" row) | The next goal is always on screen, so the player knows where to go without a quest arrow (P1). It is landmark-led open-world design. |
| W5 | **Law 5, "every reveal opens a verb".** Nothing big is only watched. | §1.3, §9.1 | Each story beat hands the player a new ability at once, so story and gameplay move together (P1, P2). |
| W6 | **The Well as the starting zone.** Black water, the hatch pond, stone columns stepping up like a giant spiral stair, lantern-lit Landings, the windlass, rope and bucket, the Jar hanging in the disc of sky. "The whole climb is visible at 0:00." | §3.1–§3.7 | A readable first zone with the end goal in view from the first frame (P1, P4). The bucket and rope lift you out, so the exit is part of the idiom (P2). |
| W7 | **Eight eggs bob in the hatch pond.** | §3.7, §9.2 | Matches the 8-player lobby: each player hatches from one egg. A lobby that lives inside the world (P6). |
| W8 | **The Rim and the hill of 63 other well mouths** ("You were never the only well"). The Sky Preview cuts doors into the lips of neighbouring wells ("Your sky is somebody's floor"). | §9.6 (9.0–12.5 s), §9.7, §9.8 | Turns the story reveal into an open-world region: other wells can be other frog villages, towns and dungeons. A strong MMO feel (P6) that still serves the one idiom (P2). |
| W9 | **The statue of the first frog** at the Foot, looking up, with the idiom carved on it. Later its plinth is empty: "The frog has gone up." | §3.7, §9.9 (Cycle 2) | A cheap, quiet story anchor for the first town (P2, P3). |
| W10 | **The Sky region picture.** Pastel cloud islands under a painted dome, wind, birds, storms; island rings at 900 / 1,400 / 2,000 m; the painted stars turn out to be pinholes with lanterns behind them. | §2.1, §9.9 (★2) | A natural second region. Same law (lanterns), one new verb (Glide), and it fits inside the networked 4 km cube (P2, P6). |
| W11 | **The molt as the region-change beat.** The frog peels its skin in 1.5 s, gulps it, and unfolds new parts. The System names the gain in one line: `[ MOLT ] Glider. Hold Hop in the air.` "A molt, not a loss." | §2.1 ("Re-hatch") | Teaches a new control in six words (P1, P4). It is a body change, which suits a frog story (P2). The source says real frogs eat their shed skin; not checked here. Keep the molt, drop the level reset (see Conflicts C5). |
| W12 | **The froglet grows only in light** (Glow Lv1–10, a halo called Crown glow at Lv10). | §2.1 (Molt row) | Progress that is the firefly frog's own nature: you visibly glow brighter (P2, P3). |

### Characters and creatures

| # | Item | Where | Why it fits |
|---|---|---|---|
| C1 | **The lantern frogs.** 12 silent frogs on the Rim hold lanterns on 6 m poles over your well. Two lean on the windlass crank. They turn their heads to follow the party. | §3.1, §9.6, §9.7 | Ready-made first townsfolk: the frogs who got out first and hold the lights for the ones still below. A sincere, specific motive (P3) that the player sees from minute zero (P2). |
| C2 | **The Jar.** A house-sized glass firefly jar, 12 m tall, hanging mouth-down over the bucket and glowing with trapped fireflies. It is "lowered onto the brightest frog". It is visible from minute zero. | §3.1, §3.5, §8 | A villain that fits the firefly-frog theme exactly (being caught in a jar), with a clear silhouette (P3), on screen from the start (P1). |
| C3 | **The boss pattern.** Phase 1 replays old monsters you can now flatten; phase 2 is a co-op phase; phase 3 is catching a falling friend with the region's verb. | §8 | A learnable pattern that pays off each region (P1, P2). Drop the "Trust Fall" name and the betrayal framing; tongue-catching a falling friend is pure co-op. |
| C4 | **Region bosses from frog predators and frog folklore.** The thunderhead heron (a heron made of storm cloud; its shadow is the lightning's tell). Chan Chu, the three-legged moon toad with a coin in its mouth. The Watcher, an eye that turns out to belong to a giant frog looking down its own well. | §2.1, §8 | Each one belongs in a frog's world, so the cast stays on one theme (P2). The heron's shadow as a tell is readable (P1). Chan Chu and his coin could tie the coin economy or the cosmetic shop into the lore (P2). |
| C5 | **Creature names used in this file:** `moss_snail`, `web_spider`, `bell_golem` (the door-2 golem, reused on a tipping raft as `keeper_bell_raft`), `heron_shadow`, `lily_raft`, `ash_axeman` ("It kneels only in the dark", so your glow is the danger), `br_jar_mites`. | §2.1, §6.2, §8, §9.8 | Small-world creatures a froglet would meet. They can become open-world wildlife and dungeon monsters. Their room designs belong to the 05 reader. |
| C6 | **Kestrel** (a Rival whose face squashes against glass) and **Wick** (the hero fallback, with a wax-thread lasso and the line "WELCOME, CLIMBER"). | §7.4, §9.6 | Named characters that already exist; possible town NPCs if their full designs hold up (check the 03 reader). |
| C7 | **"Everything is bigger than you."** Doors of 2.2 × 3.0 m and a 6 m door 1 next to a froglet. | §3.4, §3.7 | A simple, strong visual rule for character and set scale (P3). |

### Frog mechanics and movement

| # | Item | Where | Why it fits |
|---|---|---|---|
| M1 | **One verb per region, each on one input.** Well: the base verbs plus the Tongue grapple (from Tongue II, first used at 0:20). Sky: Glide (hold Hop in the air; fall at ≤ 3 m/s for up to 1.5 s per hop at 6 m/s forward). Space: Drift (gravity ×0.25). Beyond: Light-rails (the Tongue latches a glowing filament and slides you at 12 m/s). | §2.1 | Open-world traversal gates that cost one input each (P4). Each verb is taught by the reveal that unlocks it (P1). |
| M2 | **`[ TONGUE THE KNOT ]`** is the only prompt at the key story moment; if nobody acts within 6 s, the knot hooks itself. | §9.6 | One clear action and no fail state (P1, P4). |
| M3 | **Falls cost nothing.** On the Rim, dropping into another well or below the cloud sea returns you by updraft in 1.5 s. Landings have 1.1 m parapets you cannot fall off. | §3.6, §9.7 | New players can explore without fear (P4). The right tone for open-world movement. |
| M4 | **Tongue-catch a falling friend** (the Jar's last phase) and **tongue-haul friends** up a rescue rope. | §8, §7.2 | Positive co-op verbs: helping each other, not betraying (P6). |
| M5 | **Hidden spots with a fair tell.** A hairline crack glows `#9FE6FF` and a breeze whistles within 6 m. You Tongue a 20 kg loose stone to open a crawl gap. It never costs a life and takes ≤ 20 s. | §5.4 | Open-world secrets that are seen and heard before they are found (P1). The published frequency keeps it honest. |
| M6 | **The two-key door.** Two bronze locks, each lit when its key is used; in Space, an airlock with two frogs and two locks. | §5.2, §2.1 | A plain co-op puzzle for dungeons (P6). Keep the door, drop the fork system around it. |

### Art

| # | Item | Where | Why it fits |
|---|---|---|---|
| A1 | **Region palettes** with world-level hex keys (base, shadow, accent, warm key, fog, secondary, sky) for the Well, Sky, Space and Beyond. | §2.2 | One colour family per region keeps places recognisable (P2). Values are listed under Key numbers. |
| A2 | **The tone rule.** Dangerous spaces are dark with self-lit tells; warm light means safe (Landings, rest rooms). | §2.2 | Players read safety from light, with no UI (P1). |
| A3 | **Reserved colours** never used for world dressing: System `#0B1630` / `#5CE1E6`, reward gold `#FFD76A`. | §2.2 | Keeps the UI and rare rewards readable (P1, P5). The v1 betrayal crimson `#FF3D6E` is freed for danger or boss tells. |
| A4 | **Shape before colour.** Every state reads by shape or pattern, never by colour alone. | §5.1, §11.3 | Colour-blind safe and one less thing to learn (P1, P4). |
| A5 | **Signs with four short fields**, in self-lit "glow chalk", readable at 12 m: number, type mark, a reward icon from a closed set of five, and 1–4 skulls. Nothing else goes on them. | §5.1 | Adapt to quest boards and dungeon entrances: "what do I get, and how scary is it?" at a glance (P1). Swap the card suits for frog-world icons (see C4 in Conflicts). |
| A6 | **Information in the architecture.** The gold door is heard before it is seen (a shimmer audible from 12 m). The solo door is physically narrower. The boss door is double height, with a bell every 4 s that you hear from the stair below. A repeat door has your old time scratched into the frame. | §5.2 | The world tells you what a place is before any menu does (P1, P5). |
| A7 | **The lit trail.** Each cleared place lights a warm slit in the stone (`#FFB86B`); failures glow rust (`#7A3B1E`); secrets add a gold glint. You see your progress traced up the tower. | §3.4 | "Felt progress in the architecture" (P1). In v2, finished quests can light the shared world for the whole lobby (P6). Cheap to build (emissive toggles). |
| A8 | **Honest geometry.** The clouds in the disc of sky are the real clouds of the next area; lanterns stand where they shine. | §9.1, §10.2 | The world never lies about itself, which makes it feel genuine (P2, P3). |
| A9 | **One rig, every hat fits.** Molt parts are add-ons on the same rig: Glider membranes, the Moon Toad fishbowl helmet with a brass collar, a star-freckle coat whose markings trail light. | §2.1 | Good for the cosmetic shop and a tiny team (still valid from v1). Clear, memorable silhouettes (P3). |

### Audio

| # | Item | Where | Why it fits |
|---|---|---|---|
| S1 | **One music identity.** A 96 BPM waltz in 3/4, transposed per region (Well F, Sky C, Space G, Beyond D, finale F). Each region adds one voice: kalimba drips, breathy flute, FM glass bells, a formant choir. The finale ends on a music box. | §2.3 | One consistent sound across one world (P2). |
| S2 | **Height fills the music.** Kalimba only at the bottom, then pizzicato, music box, soft organ, and the full kit at the top. | §2.3 | Progress you can hear (P1). In v2, tie it to altitude or story progress. |
| S3 | **The croak's acoustics as place identity.** Echo in the well (slap-back at 0.12 s from the near wall and 0.47 s from the far wall, 3.5 s tail); dry air on the Rim; the "first shout", where thunder answers 6.0 s later. | §2.3, §9.3, §9.7 | A player can tell "I am outside now" by ear (P2, P3). |
| S4 | **A 5-note pentatonic motif** replayed at every reveal at half speed in the next region's key, so any croak chord harmonises. | §2.3 | A leitmotif that ties story beats together (P2). For one world, author one fixed motif instead of seeding it per run. |
| S5 | **Sound as scale.** Lowpass sweeps, growing reverb, and 200 ms of silence at each big swap. | §9.6, §10.1 | Cheap, strong feel for big moments. |

### Onboarding and reveals

| # | Item | Where | Why it fits |
|---|---|---|---|
| O1 | **The title screen is the well bottom**, with mouse or stick parallax before any key. Onboarding happens on lily pads in the hatch pond (0:00–0:35). First grapple at 0:20. | §3.7, §9.2 | Meets P4's "controlling a frog within 60 s" directly. |
| O2 | **The window.** A small cave with a crack looking across the shaft at everything still to come. The camera eases in, the view widens, no System text, 15–30 s. | §9.3 | Shows the player the whole zone and the goal early (P1). A quiet, genuine moment (P3). |
| O3 | **The Landing glance.** A short camera tilt up on first arrival, cancelled by any look input over 2°. The System line appears once per profile per stop: `[ THE MOUTH ] 37°. It was 31° at the bottom.` | §9.4 | Never holds control for long and never repeats (P4). Specific, honest writing (P3). |
| O4 | **Reveal rules.** Always steerable; frogs keep their bodies; every reveal opens a verb; only show what was really there. The first view can't be skipped; repeats skip with a 1 s hold. | §9.1, §9.6 | Story moments that respect the player (P1, P3). |
| O5 | **★1 "Out of the Well" (26 s).** The bucket rises, 200 ms of silence, the stars turn out to be lantern frogs, the hill of wells appears, the sun crests at 21 s, and a small tear in the dome shows Space. Card: **LAYER 2 · THE SKY · 하늘**, "Your sky was a hole." | §9.6 | The end of the starting zone and the promise of the open world in one shot (P2, P6). |
| O6 | **Card lines.** "Your sky was a hole." / "Your sky was a ceiling." / "Your world was a speck." / "Every sky is someone's well." | §2.1 | Short and human (P3); each states the story beat plainly (P1). |
| O7 | **Shared moments.** Reveals start at server time + 0.5 s, so every player (and a voice call) sees the same frame. A player who joins mid-reveal gets the short cut from the current time. | §9.6 | Co-op story beats stay in sync (P6). |
| O8 | **Reduced-motion versions** of every reveal (stills, a cream crossfade, rotation capped at 60°/s). | §9.6, §11.4 | Accessibility without a separate path. |
| O9 | **The feel target.** About every 90 s the player got stronger, laughed, or saw something bigger. | §9.1 | A usable pacing check for the first session (P1, P4). |
| O10 | **Player-driven camera moves.** In the Keeper pull-back, hold forward to rise ×1.6 or back for ×0.6, with a soft "not yet" bounce at the top. | §9.5 | The player keeps agency in every camera move. |

### Tech

| # | Item | Where | Why it fits |
|---|---|---|---|
| T1 | **Scale tricks in URP.** Build each area near the origin; bake cubemap skies from the real vista; stack a near and a far camera; drive fog per shot; use impostors; hide every swap under a mask. | §10.1–§10.3, §10.7 | URP has no camera-relative rendering (per the source), so a far-seeing open world needs exactly this (P6). |
| T2 | **The floating-origin rule.** Networked play stays inside a 4 km cube (float32 error ≤ 0.5 mm). Anything bigger is non-networked scenery drawn with camera tricks. NGO replicates world-space transforms, so no real origin shift. | §10.5 | A hard limit for a v2 open world in NGO host mode (P6). The Well (±1.2 km), the Rim hill (fog wall at 650 m) and the Sky islands (2.6 km) all fit inside it. |
| T3 | **Data-driven layout.** `WellLayout.json` is read by the editor command `BuildLayerScene well`; only generators write the scene. | §3.9 | Suits a build done mostly by agents: diffable data, scenes that rebuild the same way every time. |
| T4 | **Seeded determinism.** Host-only pure C#, PCG32 streams keyed by xxHash64 of (seed, name, args), integer maths, Lemire's unbiased `NextInt`, chances in basis points. Broadcast a small plan; clients never regenerate. | §6.1, §6.8 | Reusable for any v2 random content (events, loot, weather) and for replaying bugs in QA. |
| T5 | **Visibility split.** Room props and monsters replicate only to players inside that room; players are visible to everyone. | §7.2 | A starting point for interest management in dungeons inside a shared world (P6). |
| T6 | **Reveals as data.** Shot lists in JSON (`star1.json`, `keeper_pullback.json`) played by a client-side `RevealDirector`, with validators for masks and durations. | §10.10 | Story cameras authored by agents as data. |
| T7 | **No hitches.** Pre-load the vista additively with renderers off; warm shaders; a PlayMode test demands zero shader compiles and zero GC allocations during the reveal. | §10.8 | A quality gate that keeps big moments smooth. |
| T8 | **World tests.** Sky-disc angles, sightline clearance, map layout overlap, golden screenshots of signs at 8 m and 12 m. | §12 | A pattern for world validators in CI. |
| T9 | **Budgets.** Median ≤ 16.6 ms at 1080p; host simulation ≤ 8 ms; p95 ≤ 20 ms during the big reveal. | §10.9 | Still valid targets. |
| T10 | **A static CJK glyph subset** (18 glyphs) for the idiom and the region names in every language. | §10.8 | A cheap way to keep the Korean and Hanja names everywhere. |

### Progression, rewards and UI

| # | Item | Where | Why it fits |
|---|---|---|---|
| U1 | **The map as rings.** The world seen from far away: regions are rings, centre outward. Built with UI Toolkit `Painter2D`; labels only on hover and landmarks; ≤ 40 labels; text ≥ 18 px; a gamepad focus ring; reduced motion. | §11 | A map shaped like the world teaches the geography (P1, P2). Esc → Map is 2 inputs (P5). |
| U2 | **The map on a wall in the hub.** Walk up and interact to zoom. | §11.1 | A map that lives in the town (P5, P6). |
| U3 | **Friends' pins on the map** (up to 8, friends-only). | §11.3 | Shows where friends are or have been (P6). Change the content from "best door" to location or story progress. |
| U4 | **"The System never lies."** Odds pages are generated from data; System lines use true numbers. | §5.3, §9.4 | Supports the fair-but-addictive progress kept from v1, and an honest voice (P3). |
| U5 | **Rare reward with published odds and a pity guarantee** (gold doors: 5% per slot, at most 2, guaranteed by a set point; one guaranteed in the first run). | §5.3 | A fair rare-reward pattern for chests or events. The source warns that at 5% the guarantee supplied gold in 62% of runs, which made it predictable (§13 #1). |
| U6 | **Published secret rate** ("One climb in five hides a room."). | §5.4 | Secrets without dishonesty. |
| U7 | **Honest roadmap in the world.** A chained door reads `[ DOOR 21 ] The Sky opens in a free update.` | §9.7, §9.8 | Tells the player plainly what is not there yet (P1). |
| U8 | **Drop-in without friction.** A new player appears at a safe spot in front of the party, at the party's lowest level, never mid-room. Arrivals "come up from below". | §7.6, §3.6 | Drop-in co-op without friction (P6). |
| U9 | **First-session KPI.** The share of first sessions that see the window, the pull-back and ★1. | §12 (item 8) | Measures whether the first session lands (P4). |
| U10 | **Save point with a free cosmetic.** The Keeper Landing is a save point; a coin drops through the sky onto the stall and a free hat appears. | §4.3, §9.5 | Save points in towns and an early free cosmetic that shows off the shop (skins still valid from v1). |

---

## Party-only (to archive)

These only make sense in the v1 party climber. Archive them with the party-game repo.

| Item | Where |
|---|---|
| Social rule "My mistake is your problem": linked bodies in every room, Mischief always on, real betrayal only in announced ♥ doors | §2.1 (Well social rule) |
| Knot and Cut, unlocked from Landing 3; knotted partners; Cutting a partner | §2.1, §3.6, §9.2 |
| ♥ Heart doors: announced betrayal rooms, a crimson ♥ and knotted-rope carving with "THEY MIGHT NOT CUT IT.", a pool of 4 (including `heart_tied_bridge` and `doppelfrog`), 1–2 per climb from door 6, at least 3 apart | §5.2, §6.3–§6.5 |
| Betrayal crimson `#FF3D6E` as a colour reserved for betrayal | §2.2 |
| Later-layer social rules: Kite Knot (a Cut in mid-air drops your partner), Push-off (a Shove launches both frogs; a frog shoved into the void), Light-Lag (knotted partners see each other live) | §2.1 |
| The Tongue-Tied Tether set piece `sp_tongue_tether` ("Chained Together") | §2.1, §6.3 |
| `hollow_toad`, the "One Body" party toad | §2.1 |
| Shove as a prank verb (turned off during reveals "so nobody can be pushed around") | §9.6 |
| Vengeance carried into the meeting room | §7.2 |
| The "Trust Fall" name for boss phase 3 | §8 |
| ★4 showing the climb's Knots (gold threads) and Cuts (crimson snaps) | §9.9 |
| Secret quests and Boon offers on a host-only hidden salt | §6.1 |
| The Climb run format: 20 numbered doors per layer, global door numbers 1–80, the "Best door: 37" brag, Quick Climb / Full Climb, Climb again / Rest, Resume / Retry from door 11, Team Lives, the Tower spitting failed parties out with a comic plop | §1.2, §4.3, §4.4 |
| Door-by-door choice: pairs, the 4 s walk-vote in 1.5 m zones with a Seat Hue ring, sealed unchosen doors | §4.2 |
| Forks, E doors (SOLO / DUO caps), `meeting_room`, the Meeting Door, the 45 s rescue rope and "cleared with help", the shadow-glass window, Jar Tag while waiting | §7.1–§7.2, §7.5 |
| Bots as Rivals filling empty seats, the buddy rule, offstage Rivals parked with AI off and returning 5–20 s later, canned window vignettes, the Drama Director, Tower-carried keys, a leaving player's seat going to a bot | §7.3–§7.6 |
| Rematch doors with an `OLD TIME` brass strip | §5.2, §6.5 |
| The suit system (♠ Body, ♦ Mind, ♣ Together, ♥ Heart, E) and letter codes (`5B`, `12E`, `11♥`) | §5.1 |
| The seeded climb planner: 4,500-row skeleton table, rhythm rules, suit rotation, debut pair, pool rule, room weights, lookahead 1, `ClimbRules.json` | §6.2–§6.7, §6.9 |
| Party Rank Up at Keeper and Warden; Rank Sync; the "lobby's best unlock" rule | §5.3, §8 |
| The Watchers audience (spectator) layer | §9.9 |
| The telemetry cap "time outside rooms ≤ 12%" | §4.1 |
| Seat Hues as the identity colour of a lobby seat | §4.2, §11.3 |

---

## Conflicts with the new pillars

| # | Item | Pillar | Why |
|---|---|---|---|
| C1 | Rooms are shells on a hidden 300 m grid 600 m under the water, reached by fading through numbered doors. "No walking between doors." | P6, P2 | The owner wants one connected world instead of 20 monster doors. Teleport cells break the open-world feel. Keep instanced interiors only for dungeons entered from a visible place in the world. |
| C2 | Door numbers as the measure of progress ("Best door: 37", global doors 1–80, Cycle 2 doors 81–160). | P2, P1 | In v2, progress should be story and place ("I reached the Rim"), not a counter. |
| C3 | A seeded run planner (4,500 layouts, suit rotation, pool rules, weights) that re-rolls the world every climb. | P5, P6, P1 | Hidden, complex rules, and a re-rolled world is not a persistent place. Keep only the determinism pattern (T4). |
| C4 | Card suits and letter codes on plaques (`5B`, `12E`, `11♥`). | P4, P2 | A code to learn before you can choose, and playing cards do not belong in a frog well. Keep the four-field sign (A5) with frog-world icons. |
| C5 | Re-hatching at Glow Lv1 in every new layer. | P1, P6 | Losing power when you reach a new region reads as a punishment in a persistent world. Keep the molt (W11), drop the reset. |
| C6 | A new social rule per layer (Kite Knot, Push-off, Light-Lag). | P4, P6 | A new rule set in every region raises the learning curve. Light-Lag draws other players in the past, which hides the shared world. |
| C7 | Many progress nouns touched here: Glow, Boons, Tower Rank F to SSS, Rank Points, talents, Pearls, Wish Coins, the Bestiary, Team Lives, Party Rank Up, Rank Sync. | P5, P4 | Too many systems for "no manual needed". The 04 reader should decide which survive. |
| C8 | The day passes only when a party reaches a Landing; each stop has its own sky colour. | P6 | In a shared world, players stand at different heights at the same time. A per-party clock contradicts one world clock. The widening Mouth is pure geometry and still works. |
| C9 | The map as a spiral of 20 door nodes with about 14 kinds of mark (ghost doors, fork lobes, meeting diamonds, hexagons with pips). | P5, P1 | Too dense for a first-time player. Keep the rings-as-regions idea (U1). |
| C10 | Space and Beyond at true scale (a 600 km planet, light-years, Mly; the ShellRig; 150,000–200,000 points), with station decks, neon rails and airlocks. | P2, P6 | Sci-fi decks need a reason inside a frog folk-tale world. They cannot be one connected networked space: the 4 km rule forces separate frames, and Space floors use scripted pod transfers. Large scope for a tiny team. Keep them as story reveals or LATER. |
| C11 | A repeated meta joke: `[ TUTORIAL COMPLETE ]`, "That was the tutorial", "That was also the tutorial", "That was ███ tutorial", "The game begins now." | P3 | Once is a good joke. Four times makes the story feel like a trick. Keep one. |
| C12 | Long scripted reveals (★4 at 75 s, ★3 at 30 s) after every boss. | P1, P4 | Long camera moves pause play. Fine late in the game, but each one must end with a clear "what now". |
| C13 | One button with many jobs: Tongue grapples, interacts, pulls the knot, and skips reveals with a 1 s hold; Tongue ranks I–IV quietly gate range and strength. | P4, P5 | Easy to misread. Minor; check it in the controls reader. |
| C14 | System lines in degrees (`37°. It was 31° at the bottom.`). | P1 | Honest and specific, but casual players may not know what an angle of sky means. Always pair it with the visible picture. Minor. |
| C15 | At most 2 live rooms at once; parked Rivals with AI and physics off. | P6 | A living shared world needs several groups active at once. v2 needs its own simulation budget for 8 players spread across a region. |
| C16 | The layer "formats" (tower / maze / dungeon / maze of dungeons) exist only as space between doors. | P6 | In v2 these should be real places to explore, not connectors. |

---

## Key numbers and names

### Names

- **The idiom:** 井底之蛙 (Hanja), 우물 안 개구리 (Korean), "the frog at the bottom of the well". Closing line: "Every sky is someone's well."
- **Regions:** THE WELL 우물 · THE SKY 하늘 · SPACE 우주 · THE BEYOND 너머 · later "CYCLE 2 · THE WELL ABOVE".
- **Well places:** the Foot (hub, top of strand 1), the hatch pond (8 eggs, lily pads), the Braid (five stone strands), Landing 1, the Keeper Landing (Landing 2, save point), Landing 3, the bucket (boss arena), the windlass, the rope and its knot, the Mouth (the disc of sky), the Rim (the lip), the lit trail (arrow slits), the window (`br_window`), the statue of the first frog.
- **Characters:** the 12 lantern frogs; the Jar (`warden_the_jar`); `keeper_bell_raft`; the thunderhead heron; Chan Chu; the Watcher; Kestrel; Wick.
- **Creatures:** `moss_snail`, `web_spider`, `bell_golem`, `heron_shadow`, `lily_raft`, `ash_axeman`, `br_jar_mites`.
- **Verbs:** Move, Hop, Croak, Tongue (ranks I–IV; grapple from II), Shove, Power, emotes; Glide, Drift, Light-rails. "The controls stay at 8" bindings.
- **Molts:** Glider molt, Moon Toad helmet, star-freckle coat (proposal).
- **Progress words used here:** Glow Lv1–10, Crown glow (the Lv10 halo only; "Crown" is retired as a boss word), Wish Coins, Pearls (+50 at first surfacing), Boons, Tower Rank, Bestiary.
- **The game name:** KNOTWELL comes from the knot on the well rope (§3.5). It does not depend on the Knot/Cut betrayal mechanic.
- **System line format:** `[ TAG ] One plain sentence.` Examples: `[ THE MOUTH ] 37°. It was 31° at the bottom.` · `[ MOLT ] Glider. Hold Hop in the air.` · `[ TONGUE THE KNOT ]` · `[ WELCOME, FROG ]`.
- **Card lines:** "Your sky was a hole." · "Your sky was a ceiling." · "Your world was a speck." · "Every sky is someone's well."

### Well geometry (origin on the well's axis at Foot deck height, y up)

| Part | Value |
|---|---|
| Shaft | inner radius 51 m, wall 1.2 m, lip at y 180, water at y −2, mist from −2 to +8 m |
| Strands | 5, centred 30 m from the axis, radius 5 m, 72° apart; tops at y 0 / 30 / 60 / 90 / 120; start bearing φ₀ seeded 0–359 |
| Door niches | y = 30·(floor − 1) + 6·(door − 1); 7 × 4 × 4.5 m; doors 2.2 × 3.0 m, 1.2 m apart; door 1 is 6 m tall |
| Landings | radius 9 m, 1.1 m parapet, 2 m hatch; rope bridge 21.3 m long, 2.4 m wide (about 4.3 s at 5 m/s) |
| Bucket | radius 20 m, 2.0 m staves, floor at y 120, handle top at y 132 |
| Windlass | posts at r 53 m up to y 198; drum at y 196, 1.6 m across |
| The Jar | 12 m tall, 9 m across, rim at y 150, 30 m from the axis, glows `#FFE9A0` |
| Lanterns | 12 lantern frogs at r 47 m, y 182, 30° apart, on 6 m poles; 400 wall lanterns on a golden-angle spiral (137.508°) |
| The Mouth | 31.1° / 36.7° / 44.4° / 55.9° / 74.0° from the Foot / L1 / Keeper Landing / L3 / bucket; 3.7% → 21.1% of the upper sky (5.7× growth); 104° at y 140 |
| Hatch pond | lily pads run 21 m from the Foot to door 1; 8 eggs |
| Sightlines | every stop clears the Mouth sightline by ≥ 7.9 m (test floor ≥ 3 m) |

### Beyond the Well

| Place | Value |
|---|---|
| The Rim | walkable stone ring from r 51 to 60 m at y 180 |
| Hill of wells | 63 other wells at r = 72·√(i + 0.5) m, θ = i·137.508°; min spacing 111 m; hill radius 574 m; slope 12°; fog wall at r 650 m; cloud sea at y 120 |
| Sky | island rings at 900 / 1,400 / 2,000 m; dome rim at 2,600 m (+480 m); dome radius 30 km |
| Space | planet 600 km; decks at 1.5 / 2 / 3 R; moon dock at 4 R |
| Beyond | decks at 40 / 90 / 150 Mly; halo at 220 Mly; galaxy 150,000 points, web 200,000 points |

### Movement

Glide: fall ≤ 3 m/s, ≤ 1.5 s per hop, 6 m/s forward (up to 9 m of extra reach). Drift: gravity ×0.25. Light-rails: 12 m/s. Updraft return: 1.5 s. Walk: about 5 m/s. Tongue I pulls a 20 kg stone.

### Palettes

| Key | Well | Sky | Space | Beyond |
|---|---|---|---|---|
| Base | stone `#56615A` | cloud `#F4EDE3` | hull `#8A93A6` | glass deck `#2A2F45` |
| Shadow | `#1D222C` | `#C9C3D9` | `#1E2233` | `#06070F` |
| Accent | moss `#557D33` | island grass `#A8D98A` | nebula `#FF4FD8` | filament `#DCE3F0` |
| Warm key | lantern `#FFB86B` on Landing stone `#6B5E57` | sun `#FFF3C4` | floodlight `#FFE3B0` | halo `#FFF1C1` |
| Fog | mist `#232B3A` over water `#0E1A1F` | haze `#FFE3F0` | void `#0B0E1F` | nebula fog `#FF8FD0` |
| Secondary | bronze `#C08A3E` | thunderhead `#3A3F5C`, lightning `#E8ECFF` | neon `#39F0C8`, violet `#7A4FD8` | moss glint `#8BD450` |

- **Reserved:** System `#0B1630` / `#5CE1E6`; gold `#FFD76A`; v1 betrayal crimson `#FF3D6E` (freed in v2).
- **Lit trail:** cleared `#FFB86B`, failed `#7A3B1E`, secret `#FFD76A`; hidden crack `#9FE6FF`.
- **Skies in the Mouth:** afternoon `#8FC3F2`; late afternoon `#F6D29A` → `#9CC0E8`; dusk `#F2A65A` over `#1B2340`; blue hour `#3A3F6E`; night `#0B0E1F`; pre-dawn `#2B3A67`; sunrise `#FFD9A0`.
- **Finale:** lanterns `#FFC98A`, moss `#6A8F3A`. **Map:** background `#0E0B10` at 88%, text `#F4EDE3`.
- **Dark rooms:** ambient ≤ 0.10 luminance, fog ≤ 15 m.

### Audio

Waltz at 96 BPM in 3/4. Keys: Well F (0), Sky C (−5), Space G (+2), Beyond D (−3), finale F. Well echo at 0.12 s and 0.47 s with a 3.5 s tail. Thunder answers the first shout after 6.0 s. 200 ms of silence at each swap. Audio max distance 60 m.

### Timing

- **First-session clock:** 0:00 title, 0:20 first grapple, 0:35 door 1, 3:40 the window, 4:45 Landing 1, 10:25 Keeper, 16:30 Landing 3, 19:30 the bucket, 22:30 ★1. Feel target: something every ~90 s.
- **Reveals:** ★1 26.0 s (repeat 8 s; world swap at 6.0 s; sun and free look at 21.0 s); ★2 24 s; ★3 30 s; ★4 75 s (repeat 20 s). Whiteouts ramp for ≥ 600 ms.
- **Landing glance:** tilt +65° over 0.6 s, hold 0.6 s, return 0.5 s; cancelled by look input over 2°.
- **Keeper pull-back:** 3.5–8.0 s; the host waits at most 9 s.

### Tech

Networked play inside a 4 km cube (float32 ≤ 0.5 mm); the Well within ±1.2 km. Room grid at y −600, 300 m cells, 7 × 7 = 49 cells, rooms at most 120 × 120 × 60 m. FarCam 50–40,000 m; NearCam up to 2,000 m. Six Mouth cubemaps at 1024² per face (BC6H). Far-LOD capture 512². Cloud sea ≤ 60 billboards, ≤ 4 transparent layers per pixel. Frame budget median ≤ 16.6 ms, p95 ≤ 20 ms in ★1, host simulation ≤ 8 ms. Plan message ≤ 200 B, slot message ≤ 64 B. First-climb seed `0x4B4E4F54` ("KNOT"). 18 CJK glyphs.

### UI and odds

Sign 0.9 × 0.6 m at 1.4 m height; numerals 0.26 m, icons 0.14 m, skulls 0.08 m; readable at 12 m. Map canvas 1,000 units, outer radius 460, current band 80–320, 30 units per future band; text ≥ 18 px; ≤ 40 labels; 24 px hit areas; pause map 960 px; results map 480 px. Gold: 5% per slot (7% with the Rank B talent, ×2 with Lucky Belly), at most 2, guaranteed by door 15. Hidden rooms: 1 run in 5.

<!-- END -->
