# Reader notes: master/10_UNITY_TECH.md

- **Source:** `_design/master/10_UNITY_TECH.md` (KNOTWELL v1, version 1.0, dated 2026-09-29, status "master design, binding"). 1,467 lines, read in full.
- **Reader:** master-10_UNITY_TECH. **Written:** 2026-09-30.
- **Lens:** the v2 brief (one connected Firefly Frog world, one story, MMO feel inside 8-player Steam lobbies on NGO host mode) and pillars P1 CLEAR, P2 ONE WORLD ONE STORY, P3 GENUINE, P4 EASY TO START, P5 ORGANIZED, P6 OPEN WORLD TOGETHER.
- **Section refs** below (§n) point into the source file.

---

## Summary for the archive

This file is the binding technical architecture for KNOTWELL v1. KNOTWELL v1 was an 8-seat co-op party climber with betrayal, built in Unity 6.3 LTS (6000.3.25f1) with URP and Netcode for GameObjects 2.13.3 in host mode over Steam. The file owns the "how", not the design numbers: packages, bootstrap, assemblies, a JSON → generators pipeline, baked room shells, netcode, host bots, Steam, saves, telemetry, tests, the performance budget, the agent build loop, licences and the build order.

What it decided: one player hosts and plays; there are no dedicated servers. Human frogs move with owner authority so hops feel instant, and the host decides every hit, value and betrayal. Each of the 20 doors is a room shell baked into a hidden cell 500 m under the well, and at most two rooms are live at once. Empty seats are filled by "Rival" bots that use the same code path as players. Secrets (Boon offers, secret quests, the Mimic) live in host-only internal types that bots cannot read. The title screen is the live game: you control a frog within seconds of pressing Play. Agents edit only text; Unity generates everything else; about 30 tests guard the rules. A proof of concept compares NGO with FishNet on tongue, raft and shove feel at 150 ms.

The goal was to make betrayal fair and funny, keep growth visible and true, make solo feel like a full lobby, and let a tiny team of agents build rooms fast.

---

## Reusable for v2

Most of this file is engine plumbing, and most of that plumbing still fits: the owner kept Unity 6000.3.25f1, URP, NGO 2.13.3 host mode, Steam, 8-player lobbies and an agent-built pipeline. What must change is the *shape* of the world (rooms in hidden cells → one connected world) and the *purpose* of some systems (betrayal → co-op).

### World and setting

| Item | Where | Why it fits v2 |
|---|---|---|
| **The well as the home zone.** Shaft inner radius 51 m, lip at y 180, water at y −2, mist from −2 to +8. Five stone columns ("strands", r 5 m) stand 30 m from the axis at bearings 0°, 72°, 144°, 216°, 288°. The hub sits at the well bottom; rest spots sit on strand tops at y 30, 60 and 90; an arena at y 120; a walkable Rim at y 180. | §5.2, §13.6 | Keeps the frogs and the well (owner decision 2) as one real, walkable vertical space. The hub and the three strand tops are natural town or camp sites stacked on one climb, so "up" is always the visible goal (P1, P2). Too small to be the whole open world (51 m radius), so use it as the starting zone. |
| **The world outside the well, from the ★1 reveal:** a mound of wells (~1.24 km), island rings and a cloud sea under a dome (~30 km), birds. | §13.6, §5.1 | In v1 this was only a render-only view at the end. In v2 it can become the playable open world that the well opens onto, so "getting out of the well" is the one story thread (P2, P6). |
| **Dusk falls as you climb.** Two baked lighting scenarios (`WellDay`, `WellDusk`) blended by progress. | §5.4 | A readable sign of progress built into the world itself, not a UI bar (P1, P2). Can blend by height or by story act in v2. |
| **Place is heard, not only seen.** The shaft has a reverb echo on croaks; the Rim does not. | §13.7 | You know where you are by ear (P1), and it makes the world feel physical (P3). |
| **"Glow chalk" readability.** Every tell, sign, frog and pickup is emissive and blooms, so dark places stay readable without realtime lights. | §13.2 | Light = life fits a firefly world (P2), and it keeps every important thing easy to spot (P1). Also cheap on the integrated-GPU dev PC. |

### Characters and NPCs

| Item | Where | Why it fits v2 |
|---|---|---|
| **Named frogs with memory:** Kestrel ("Watch this!" at the first pond), Moss (helps shove a door, catches your spot), Vex. The Rival Register gives callbacks such as "Last time you left me on the bridge." | §12.5, §12.6 | Specific names, habits and memories are the seed of genuine townsfolk and companions (P3). Keep the names and the friendly beats; drop their betrayal beats (see Party-only). |
| **Bark rules:** at most one bark every 4 s across the lobby and one every 12 s per character; speech bubbles with babble audio that can be read without sound. | §12.6 | NPC chatter that never floods the screen (P5), is accessible (P4), and lets personality come through in short lines (P3). |
| **NPC frogs on the player code path.** A bot frog is the same prefab as a player's, driven by a synthetic input stream from the host. | §7.1, §12.1 | NPC adventurers, guides and town frogs can move exactly like players, so the world looks alive even in a 2-player lobby (P6). No second movement system to build or debug. |
| **Bots perceive like players:** line of sight within 25 m, noise within its radius, reaction 0.25–0.6 s, 5–20% action errors. | §12.2, §12.4 | Companions that feel like people, not aimbots (P3). |
| **The key-action lock.** A bot never finishes a puzzle a first-time player is working on for 90 s, unless the player pings "Go!". | §12.3, T-25 | Keeps the "I figured it out" moment with the player; the "Go!" ping is a clear way out when stuck (P1, P4). |
| **Rookie ease-in.** During a new player's first 5 sessions, bots react +0.15 s slower and make +10% more errors, fading to zero by session 10. The label is always shown. | §12.4 | A gentle start that is honest about itself (P4, P3). |
| **Authored beats.** A beat `{place, trigger, actor, goal, bark}` is injected as a character's top-priority goal. | §12.5 | The same tool can stage story scenes with NPCs in the open world (P2, P3), without the betrayal limits it was built for. |

### Frog mechanics

| Item | Where | Why it fits v2 |
|---|---|---|
| **FrogMotor feel numbers:** capsule r 0.30 m / h 0.90 m (same for every frog, level and cosmetic); walk 5.0 m/s; accel 30 m/s², decel 40 m/s²; turn 720°/s; air control 40%; gravity 20 m/s²; terminal fall 30 m/s; coyote time 120 ms; jump buffer 100 ms; step 0.25 m; slope 50°. | §8.2 | Tight, forgiving controls are the core of "controlling a frog within 60 s" (P4). The fixed hitbox keeps co-op fair (P6). |
| **Hop height comes from one table:** take-off speed v₀ = √(2·g·apex), never typed in. Rank I apex 1.4 m (7.48 m/s); charged 1.9 / 2.4 / 3.0 m. | §8.2 | One table moves every ledge in the world at once, so world rules stay consistent (P2). |
| **Few verbs, each a request with instant feedback:** Hop, Tongue, Croak, Shove, Power (+ a Wheel for pings, lines, emotes). The owner plays squash, cheek puff and tongue launch at once; the host confirms. | §8.3 | A tiny verb set is easy to learn (P4). No press ever feels dead. |
| **Tongue ranks:** range 3 / 4.5 / 6 / 8 m; pulls props ≤ 20 kg at rank I; grapple from rank II; two targets at rank III; chain grapple at rank IV; 0.25 s cheek-puff tell before props react. | §8.3 | Rank-gated traversal is the open-world gate: a grapple anchor you can see but not yet use tells you what to come back for (P1, P6). |
| **Growth follows use.** Every puzzle area must offer, per verb (Hop, Tongue, Croak), a rank-II lane and a rank-III/IV lane; Awakening (rank 3) and Mastery (rank 4) add visible parts to the frog. | §9, §10.7 | You get better at what you do, and you can see it on the body (P1, P3). |
| **Croak and Chorus:** pulse radius 4 / 6 / 9 m; two or more croaks within 0.3 s make a Chorus; croaks play on pentatonic notes so a Chorus always sounds good. | §8.3, §13.7 | A "together" action that rewards timing with friends and never sounds wrong (P6, P3). |
| **Spots, catches and revives:** 3 spots on Normal, 4 on Easy. A hit knocks one spot out as a firefly; any frog's tongue can catch it back within 3 s. At 0 spots a frog becomes a tadpole ghost (3 m/s, can ping and nudge ≤ 5 kg props); a living frog holding Croak within 1.5 m for 2 s revives it with 1 spot. Rest spots restore everyone. | §8.8 | Health you read on the frog's back, not a hidden meter (P1). Rescue is co-op and quick (P6). Fits the firefly theme (P2). |
| **Carry and spit:** tongue-carry props, spit at 10 m/s. Mass classes: pot 1 kg, egg 1.5 kg, jar 2 kg, stone 3 kg, heavy prop 15 kg. Eggs crack above 5 m/s. | §8.4, §10.3 | Simple physical puzzles anyone understands (P4). |
| **Things you stand on:** lily pads, rafts, other frogs (a frog counts as ground when the contact normal's y ≥ 0.7, which allows Frog Stack towers). Raft tilt: one frog on the rim settles at ~12° in ~1.5 s; max 28°; frogs slide above 20°. | §8.2, §8.5 | Co-op traversal comedy that needs no betrayal (P6). A pond world full of pads and rafts fits the well (P2). |
| **Grip wall:** a per-frog stamina ring (0–1); moss holds dry and regrow; a friend can tongue-haul you up. | §8.7 | Climbing fits a well; hauling a friend is co-op (P6). |
| **Swallowed and spat out** by a monster at 8 m/s. | §8.8 | A short, funny fail state for PvE. |
| **Local ragdoll:** 7 bodies, runs ≤ 1.2 s, held within 0.4 m of the true position, blends back in 0.3 s; never networked. A 3 s fall replay plays from a local buffer. | §8.9 | Slapstick with zero bandwidth and no desync (P6). |
| **Hitstop is local and visual only** (50–120 ms); it never touches `Time.timeScale`. | §13.4 | A hard rule for any host-mode game: the host must never freeze the world for others. |

### Art and character design

| Item | Where | Why it fits v2 |
|---|---|---|
| **`IHeroBody` contract:** `SetSpots`, `SetGlow(level 1..10, crown)`, `PlayAwakening(verb, rank)`, `CroakFX`, sockets Hat / Face / Back / Belly, `SetSeatHue`, `SetMolt` (Glider molt), `SetLife` (Alive, Dark, TadpoleGhost, Swallowed). | §9 | Every system talks to the body through one small interface, so progress, health and cosmetics all show on the character (P1, P3). Molts give a clear, in-world reason for new traversal (P2). |
| **The Glow:** Glow Level shows on the belly, the markings and as orbiting fireflies (1 per level, at most 10). | §9 | Your level is part of your silhouette, readable across a town (P1, P3, P6), and it is literally the firefly theme (P2). |
| **Procedural frog, no animation clips:** hand-written two-bone leg IK with 0.12 m foot raycasts; spring bones on throat sac, eyes and hat; tongue as a 12 × 8 Catmull-Rom tube with overshoot; PrimeTween squash and stretch. | §9 | Lively, reactive motion that agents can write as code. The same rig can drive NPC frog variants. |
| **Deterministic mesh generator:** `Tools/blender/build_frog.py` in Blender 5.2; LOD0 ≤ 6,000 triangles, LOD1 ≤ 2,000 (from 15 m); ≤ 24 bones; blendshapes `blink`, `eyeRetract`, `cheekPuff`; five socket empties. | §9 | A tiny team can generate NPC frogs (elders, merchants, guards) from parameters and keep them consistent (P2, P3). |
| **Toon look:** stepped ramp; Fresnel rim tinted by the player's colour; emission mask (R spots, G belly, B markings); inverted-hull outlines written as a Render Graph renderer feature. | §13.2 | Clear silhouettes and readable state at a distance, with 8 players in view (P3, P6). |
| **A player colour that cosmetics never override** (Seat Hue as the rim light). | §9, §7.6 | You can always find your friends in a crowd (P6). In v2, bind it to the player, not to the seat index. |
| **Agent-safe art rules:** no Shader Graph or VFX Graph (node graphs are assets agents handle badly); Shuriken particles only, pooled, ≤ 4,000 alive per area. | §13.2, §13.3 | Keeps art buildable by agents as text. |
| **URP quality presets:** High / **Medium (the budget preset)** / Low (render scale 0.77 + STP, Steam Deck class). | §13.1 | Still the right starting point for the same engine and dev PC. |

### Audio

| Item | Where | Why it fits v2 |
|---|---|---|
| Mixer groups Master, Music, SFX, Voice, System, UI; snapshots per place; a pool of 48 audio sources; per-surface footsteps; positional monster cues. | §13.7 | A clean base that scales from rooms to zones (swap the snapshots to Town, Field, Cave, Well). |
| **Every cue is also visible:** each monster cue has a glowing tell with a 2–5 s lead, so every encounter can be cleared with audio muted. | §10.7, §13.2 | Accessibility and clarity (P1, P4). |

### Tech (engine, network, pipeline)

| Item | Where | Why it fits v2 |
|---|---|---|
| **Pinned stack:** Unity 6000.3.25f1, URP 17.3.0 (Forward+, APV, GPU Resident Drawer, STP), NGO 2.13.3 host, Facepunch transport 2.0.0 vendored, Facepunch.Steamworks built from master ≥ `e445525`, Multiplayer Play Mode 2.0.2, Cinemachine 3.1.7, Input System 1.20.0, AI Navigation 2.0.15, PrimeTween 1.4.11, UI Toolkit, Localization, Newtonsoft JSON. | §1 | The owner kept this stack. Reuse the pins and the vendoring steps as-is. |
| **The "rejected" list** (no HDRP, no VFX Graph, no Unity IAP / Steam microtransactions / Steam Inventory, no humanoid retargeting, Synty and Sonniss blocked until a human reads their AI clauses). | §1 | Still valid. Only the reason for rejecting Distributed Authority changes: v2 still wants one trusted host for quest state, loot and the world save. |
| **Assembly layering:** `Game.Core` (pure C#, no Unity references, type-checks with `dotnet` in ~20 s) → Content → Platform → Net → Hero → Rooms → Bots → Tower → UI. Static state must be readonly or reset on load (domain reload is off). | §3 | Good for fast agent edits. Rename Rooms → World/Areas and Tower → Story/Quests; the layering holds. |
| **Data → generators → seeds.** Agents edit only text (C#, JSON, HLSL, UXML); Unity generators build every ScriptableObject, prefab, scene and table into `Generated/`, which nobody hand-edits. Inputs are hashed so only changed content rebuilds. | §4 | One source of truth for quests, NPCs, places and dialogue keeps the story consistent (P2) and lets validators check it. Built for a tiny, agent-heavy team. |
| **BuildHash in connection approval** with a plain message: "[ DIFFERENT VERSION ] Update … to join." | §4.5, §7.3 | Friends never get a confusing failure when versions differ (P1, P6). |
| **The title screen is the live game.** Boot starts a host session at once and puts you in control at the well bottom ≤ 5 s after Play; friends join that running session by Steam invite. | §5.1 | The single best fit for P4 (in control well under 60 s) and P6 (drop-in, no separate lobby screen). |
| **Solo is a friends-only Steam lobby of 1.** Friends can join any time through the overlay invite or "Join game". A cold launch from an invite reads `+connect_lobby`. | §7.2, §14.1, §14.2 | Drop-in co-op with no menus (P6, P5). |
| **LAN mode:** Unity Transport on port 7777; discovery broadcast on UDP 47777 once a second; manual IP fallback. | §7.2 | Keeps LAN play and a Steam-less dev path. |
| **Authority rules:** owner moves its own frog (instant feel); the host decides hits, values, loot and world state; all NetworkVariables are server-write; cosmetics, ragdolls, camera and replays are local only. | §7.5, §7.6 | Instant controls (P4) and one source of truth for progress (P1). |
| **Lag compensation:** 60 Hz pose history of 16 entries (267 ms); rewind ≤ 150 ms; contested grabs within 100 ms go to the earliest input; the host's own presses wait up to 100 ms so the host has no edge; the tongue launches locally at once and hides a miss inside its 12% overshoot. | §7.10 | Makes tongue-on-enemy and tongue-on-prop fair for every player in a shared world (P6). |
| **Movement validation:** ≤ 6.5 m/s horizontal (≤ 14 m/s within 1 s of an impulse, grapple or sling); no step over 3 m per tick without a teleport; 3 violations → silent correction. | §7.11 | Light cheat protection that never shames anyone. |
| **Bandwidth budget:** per client ≤ 16 KB/s average, ≤ 32 KB/s peak, ≤ 4 KB/s up; host up ≤ 112 KB/s with 7 remotes; RPCs ≤ 1,024 bytes. | §7.12 | A tested starting point for 8-player lobbies. |
| **Per-client visibility** (`CheckObjectVisibility`, `NetworkShow` / `NetworkHide`). | §7.9 | The mechanism carries over to distance- or zone-based interest management in an open world (the "2 live rooms" rule does not; see Conflicts). |
| **You never lose your own progress to someone else leaving:** a leaving player's character is kept; a reconnect reclaims it; each client computes its own long-term progress from the host's public facts and saves it locally. | §7.13, §15.1 | Friction-free drop-in and drop-out (P6). |
| **Seeded, split random streams:** PCG32 + SplitMix64, one stream per purpose; `UnityEngine.Random` and `System.Random` banned in gameplay (a test enforces it). | §6.1, T-12 | Reproducible loot, spawns and events; a failed soak can be replayed. |
| **Encounter framework:** `IRoom` lifecycle (Dormant → Preparing → Ready → Running → Resolving → Resolved → TornDown), a shared kit, and **at most one bespoke monster script per encounter**. | §10.1–10.3 | Rebrand as world encounters, puzzle sites or dungeons. The one-script rule keeps content cheap: an S encounter ≤ 3 agent-days, an M ≤ 5 (§22.3). |
| **The kit:** Bell, Lever, Plate, Pad, Jar, Pot, KeyLock, Egg, MiteSwarm, GazeCone (0.5 s warning), NoiseBus listener, TellLight, Anchor, RankLedge, GripWall, Raft, CountdownBell (3-2-1-NOW), ExitGate, Checkpoint, WaterVolume, KillVolume, PhaseSequencer. | §10.3 | Reusable building blocks for open-world puzzles and bosses; the same pieces everywhere make rules consistent (P2). |
| **Encounter validators:** rule text ≤ 14 words; exactly one monster; every cue has a glowing tell with a 2–5 s lead; a NavMesh path from entry to exit; every text key exists. | §10.7, T-05 | Directly enforces P1 (one short rule you can read) and accessibility. Extend to quests: every quest step has a marker, a one-line goal and a reachable target. |
| **Auto-solve and soak:** each encounter ships a bot "solver plan"; soaks run bots through content and flag `STUCK` after 45 s without progress; 50 seeds, ≥ 90% must finish. | §10.6, T-24, T-30 | Proves every quest is completable before a human sees it. Essential for agent-built content. |
| **NavMesh per verb rank:** agent `Frog` (r 0.3, h 0.9, step 0.25, slope 50°); links from every ledge and anchor tagged with an area per rank (`HopII`, `TongueII` …). | §5.4 | NPCs only use routes their rank allows, and a validator can prove each area is reachable at the intended rank (open-world gating stays honest, P1). |
| **Saves:** atomic write (`.tmp` → flush → `File.Replace` with `.bak`); `schemaVersion` with migrations and fixture tests; save path fixed by company/product name. | §15, T-15 | Solid base for a local character save plus a host world save. |
| **Telemetry:** local log by default (nothing leaves the machine); optional aggregated Steam stats, off by default; no names, SteamIds or IPs; a "Worth it?" tap after a session. | §16 | Honest, privacy-first measurement. Redefine the funnel for v2's first session (control ≤ 60 s, loop understood ≤ 5 min). |
| **Agent loop and gates:** type-check (~20 s) → recompile → regenerate → validate → test → screenshot; exit codes 8 (tests failed, never retry), 6 (no verdict, retry once), 7 (Editor unreachable), 4 (licence/precondition, stop), 75 (project locked). Only a human approves golden screenshots and judges feel. | §17, §19 | Still the right way to build with agents plus a tiny human team. |
| **Performance budget** on the dev PC (Intel Arc iGPU, 1080p, Medium): host simulation ≤ 8 ms p95; frame ≤ 16.6 ms p95; 0 B/frame steady allocation; boot to in-control ≤ 8 s; no frame over 33 ms on a transition. | §20 | Keep the floor and the "fail the milestone" rule; re-size the per-system split for open-world streaming (see Conflicts). |
| **Proof-of-concept method:** three netcode arms, scripted identical inputs, 150 ms RTT with 2% loss, a written decision rule, a 10-day timebox, and `FrogMotor` written as a pure step function both stacks call. | §21 | Re-run S1 (tongue on props), S3 (raft), S5 (visibility) and S6 (host load) for v2's PvE needs. |
| **Build order habits:** style lock in week 3 (one hero area + the frog at ship quality) before the content factory; a named NGO 3.0 upgrade milestone. | §22 | Early style lock protects character quality (P3). |
| **`licenses.csv`** with an allowlist (CC0, CC-BY-4.0, MIT, Apache-2.0, OFL-1.1, Unity-Companion, PrimeTween, Steamworks-SDK, Own-Work), SHA-256 per file, credits generated from rows; prefer Kenney, Quaternius, KayKit. | §23, T-09 | Unchanged need. |
| **Verify-at-M0 register** (V-01 … V-14), each with a check and a fallback. | §24 | Carry over; none of them depended on betrayal. |

### Progression, economy and UI

| Item | Where | Why it fits v2 |
|---|---|---|
| **"The System never lies":** every number on screen is bound to data; a test fails on an unbound placeholder. | §7.5, T-08 | Progress players can trust (P1). Keep the rule even if the "System" voice changes. |
| **Fair talents:** talents may only be PvE conveniences; anything touching speed, hitbox, health or other players is rejected by a test. | §4.3, T-10 | "Addictive but fair" progress that never splits a group of friends by power (P6). |
| **Fair cosmetic shop:** the cosmetic type has no gameplay field (a test fails the build if one is added); no paid item grants currency, keys, rerolls or revives; no shop countdown under 24 h; an item is never both earned and paid; 24 earned cosmetics; paid Supporter Sets are Steam cosmetic DLC; the host checks DLC ownership with an auth ticket before others see it. | §4.3, §14.4, T-07 | Matches the owner's "skins and a cosmetic shop" with fair feeling. Cosmetic slots worth keeping: Hat, Skin, Glow colour, Croak voice, Tongue trail, Emote. |
| **Bestiary:** one page per monster with Seen and Cleared stamps; first-death tips. | §4.2, §15.1 | A tidy journal in one place (P5); tips after a failure teach without a manual (P4). |
| **Pacing tests:** at most one full-screen card per stop; at most 5 systems introduced before the first big milestone, then at most 1 new system per stop. | T-19, T-04 | Turns P4 ("low learning curve") into a testable rule. Apply to the first 5 minutes and each quest step. |
| **One map, drawn in UI Toolkit** with `Painter2D`, rendered onto a wall in the hub and shown in pause. | §13.5 | The seed of a world map that is both a place in the world and one input away (P1, P5). |
| **Signs show exactly 4 things** (v1 door plaques: number, letter, prize, danger). | §13.5 | A clear limit on how much a sign may say (P1). |
| **Localization from day 1:** every string is a key; Smart Strings (`{door}`, `{verb}`); a test fails on literal UI text. Korean is a SHOULD. | §13.5, T-14 | Keeps writing in one place, easy to edit for tone (P3, P5). |
| **Settings:** hold or toggle per binding, subtitles and captions, reduced motion, photosensitive mode, streamer-safe, a gentle break reminder, language. | §15.3 | Accessibility from the start (P4, P5). |
| **Player-steered camera pull-back** up the real shaft (a spline dolly the player drives with the stick). | §13.4 | A memorable "look how far you came" moment that the player controls (P2, P3). Good for the moment you first leave the well. |
| **Share card:** a 1200 × 630 group-shot PNG saved locally; nothing uploaded. | §13.6 | A small social moment for friends (P6). |
| **Steam Timeline markers** on highlights (door clears, Awakenings, gold finds, the big reveal), with Valve icon names checked at M0. | §14.3 | Re-point at v2 moments: quest done, new town, Awakening, boss down. |
| **Toys as small minigames** (`toy_frog_stack`, `toy_fly_catch`: score instead of fail). | §10.4 | Could live in towns as optional co-op activities. The Frog Stack is co-op, not betrayal. |

---

## Party-only (to archive)

These exist only for the betrayal party game or the 20-door party run. Archive them with the v1 repo summary.

- **Server-authoritative betrayal:** Knot, Cut (hold Shove 1.2 s while Knotted), the hold-on counter, loot moves of unbanked fireflies, WANTED, Vengeance hunter/target, Underdog flag, `BetrayalService`, betrayal windows (§7.5, §7.6, §8.3, §10.4).
- **Heart doors:** `heart_two_pads`, `doppelfrog`, `heart_split_swallow`, `heart_tied_bridge`; `IHeartRoom`, `BetrayalWindows`, `CoopAnswer`; 1–2 per climb from door 6 (§6.3 rule 4, §10.4).
- **Doppelfrog (Among Us-style Mimic):** host-only `mimic` stream, `RoleRpc`, `VoteRpc`, `VoteBooth`, "only humans vote", bot votes marked, the Mimic's sideways blink hidden inside random fidgets on `FrogFxRpc` (§6.1, §7.7, §7.8, §12.2).
- **Split or Swallow:** `SecretChoiceRpc`, `SecretChoice` kit piece, simultaneous reveal (§7.7, §7.8, §10.3).
- **The secrets machine:** `hostSalt`, host-only streams `offer`, `quest`, `mimic`, `secret`; `HostSecrets` and `SecretDealer` as internal types; `IBotPrivateChannel`; `HiddenInfoTests` (T-11); the rule that bots cannot reach secrets through assembly visibility (§3.2 rule 3, §6.1, §7.8, §12.2). Needed only because players hid things from each other.
- **Tethers:** the XPBD chain (10 segments, 4 iterations at 60 Hz) with both owners solving their own end; the `Tethered` motor mode; `sp_tongue_tether`, `heart_tied_bridge`; PoC scenario S7 (§8.2, §8.6, §21.3).
- **Frog-on-frog force:** tongue tug on another frog (≤ 1.0 m, shortened to 0.3 m before a drop), the full yank after a 0.6 s tell, shoving other frogs (6 m/s + 1.5 m/s up); `FairnessCaps` constants tug 1.0 m, yank tell 0.6 s, shove 6 m/s, Cut hold 1.2 s; PoC scenarios S2 and S4; the "if S2 fails, cut tongue-on-player back to shove" rule (§4.2, §8.3, §21.3, §21.4). Keep Shove on objects and enemies; frog-on-frog pushing goes.
- **Betrayal presentation:** the Betrayal Cam (0.8 s at 25% speed, `[ TRAITOR ]`), `BetrayalCamRpc`, chromatic pulses on betrayal reveals, "betrayal crimson" and the rule that no cosmetic hue sits within 15° of it, the "Betrayal Snap" cosmetic slot, Timeline markers for Betrayal Cam, Vengeance landed and Trust Fall catch (§4.2, §4.3, §8.9, §13.4, §14.3).
- **The Drama Director's betrayal side:** staged betrayals (Vex betrays Moss at door 11, Moss's Vengeance at door 12, a Rival offering the Knot at Landing 3), "at most 1 bot betrayal against a human per floor", `DramaLimitTests` (T-18) (§12.5).
- **Rivals as competitors:** 10 Rival bots filling every empty seat, hidden stats G/L/N/H/W/S, "door taste" by suit, the host's "Gutter" weighting in the Rival Register, offstage parked Rivals that reappear with the second key (§4.3, §10.5, §12).
- **Forks and the Meeting Door:** splitting the party into a group room and a solo/duo "E" room, `ItemWindow`, `RescueRope` after 45 s, `ShadowGlass`, `meeting_room`, the "at most 2 live rooms" rule built for it (§10.5, §7.9).
- **Walk-vote door choice:** "4 s after the first human steps into a doorway, the door with more humans opens" (§11).
- **Party social settings and flags:** blame tags, `Masked` seat flag, public-lobby "flag to kick to Rival" (§7.6, §7.13, §15.3).
- **Landing Party:** a `PartyPlaylist` of 2–3 min toy rounds instead of a climb, drop in and out between rounds (§11, §22.5). *This is the natural candidate for v2's one documented opt-in town side-mode hook; build nothing for it now.*

---

## Conflicts with the new pillars

| Item | Pillar | Why it conflicts | v2 direction |
|---|---|---|---|
| **20 separate doors, each a room shell in a hidden cell on an 8 × 8 grid 500 m under the water, reached by a 0.7 s teleport fade** (§5.3, §10, §11). | P2, P6 | The whole world model is disconnected rooms, the opposite of one connected open world. | Build contiguous areas streamed by distance. Keep baking per area and the "only dynamic things are networked" rule. |
| **"Time outside rooms ≤ 12% of a climb"** as a target, with a soak failing above 15% (§11, T-30). | P6 | In an open world, travel and towns *are* the game. | Replace with a clarity metric, e.g. "time with no known next step". |
| **The climb as a run that resets:** Quick Climb vs Full Climb, Glow and Boons per climb, Team Lives, wipes, "Retry from door 11", Rematch overlay with old times, results screen after every run (§6, §10.2, §11, §15.2). | P2, P6, P4 | A roguelite loop fights a persistent-feeling world and adds rules to learn. | Persistent character growth; sessions end anywhere; no team-life fail state. |
| **The seeded climb planner and its grammar:** suits ♠ ♦ ♣ ♥ on plaques with letters A/B/C/E, skulls, the debut rule, the pool rule, "no suit three times in a row", gold odds 5% (7% with a talent, ×2 with a Legendary), a forced gold door by door 16–19 (§6.2, §6.3). | P1, P4 | Hidden dice rules and a card-suit code players must decode. | One hand-built world. Use seeded streams only for small variety (loot, spawns, events). |
| **Too many overlapping progress layers and currencies:** fireflies (banked and "in cheeks"), Glow Level, verb ranks I–IV, 24 Boons (16 + 4 Duo + 4 Legendary), Wish Coins, Pearls, Tower Rank F → S, 8 talents, 3 open + 6 secret classes, Bestiary, Rival Register, 5 difficulties (§4.2, §7.6, §15.1). | P4, P5 | Far more than a player can hold in the first 5 minutes; the same idea (power) lives in several places. | One visible level (the Glow), verb ranks by use, one currency, light classes, Bestiary as the journal. |
| **Hidden and redacted content:** Sealed and Hell modes redact the rule text; hidden clears pay ×2; "unintended" clears; 6 secret classes unlocked by secret quests sent privately; class hidden until revealed (§6.2, §7.8, §10.2, §10.4). | P1 | The player is not told what to do or why. | Keep optional secrets as *discoveries* in the world (with a hint), never as hidden rules. Drop redaction. |
| **The "System" voice** in bracketed windows (`[ HIDDEN CONDITION DETECTED ]`, `[ NOTED ] That was not the intended solution. Keep it.`, `[ CLIMB IN PROGRESS ]`) (§7.3, §7.7, §10.2). | P2, P3 | A generic game-system voice with no in-world source can break the one story and read as stock "LitRPG" tone. | Keep "the numbers never lie". Give messages an in-world speaker (the well, an elder frog, a firefly) or plain UI text. |
| **Joining is refused mid-climb** in MUST-A (`[ CLIMB IN PROGRESS ] Join at the well bottom…`); mid-run drop-in was only a SHOULD (§7.3, §7.13). | P6 | Drop-in without friction must be a MUST. | Join any time; spawn at the host's nearest town or next to a friend. |
| **The host leaving ends the session for everyone**; host migration is LATER (§7.13). | P6 | A "persistent-feeling" world needs the world to survive and your character to be safe. | Host writes a world save at towns; each player's character is saved locally; a plain message on host exit; consider "any player can re-host this world" later. |
| **The authored first climb replays for everyone when any newcomer joins** (Open question 1, §6.2). | P6, P4 | Veterans get pulled back into the tutorial; newcomers do not get a personal start. | Per-player onboarding (a personal first-quest track) inside the shared world. |
| **Every empty seat is filled by a competing Rival bot**, and the host's CPU budget is built around 7 bot brains (§7.1, §12.7, §20). | P6 | An MMO feel means real players plus townsfolk, not 7 rivals in your party. | NPC frogs live in the world and towns; companions are optional; re-size the brain budget. |
| **"At most 2 live rooms" and the ≤ 2-room performance split** (§7.9, §20). | P6 | 8 players spread across an open world make the host simulate many areas at once. | Distance-based interest management and area sleep; re-measure the host budget with players spread out. |
| **World scale and precision were sized for ~1.1 km** (largest room coordinate ~1,110 m; no floating origin; far clip 1,000 m in the shaft) (§5.2, §5.3). | P6 | An open world beyond the well will be larger. | Plan additive-scene streaming, far-LOD shells and a precision check before the world is laid out. |
| **The outside world exists only as a render-only diorama** (★1 nested shells, no NetworkObjects, played once as a cutscene) (§13.6). | P2, P6 | The most exciting place in the story is not playable. | Make the outside the open world; keep the nested-shell trick only for far vistas. |
| **The Keeper ceremony stacks 7+ beats in ≤ 40 s** (a pick, Party Rank Up, Tower Rank F → E, the camera pull-back, a free hat, a stall, a teaser line, Climb on / Rest) (§11). | P4, P1 | Too many new things at once. | One reward and one message per story milestone. |
| **Per-climb Boon drafts during an 8 s walk** (3 cards, or 4 with a comeback card, sent privately) (§7.8, §10.2). | P4, P2 | Draft-style picks every few minutes are a run-based habit, and the offers are secret. | Rewards tied to quests and places, shown to everyone. |
| **Seat Hue is tied to the seat index** (8 fixed hues) (§7.6, §9). | P3 | In a persistent world your colour should be yours, not change with join order. | Player-chosen identity colour from a readable set; still never overridden by cosmetics. |
| **"Forging a save gains nothing because Rank gates nothing"** (§15.1). | P6 | If v2 levels or gear carry power into friends' worlds, a local save can be edited to bring power in. | Decide early: either progress stays cosmetic/traversal-only, or the host validates what a joining character brings. |
| **The product and company name `KNOTWELL`** fixes the save path and Steam Auto-Cloud forever once the demo ships (§2.3, Open question 5). The name is built on the Knot, a betrayal mechanic. | P2 | The name may no longer describe the game. | Settle the v2 name before any public build. |
| **Many difficulty doors in the hub** (Easy, Normal, Hard, Hell, Sealed; Hard adds a skull and shortens tells to ×0.7; Hell/Sealed chained until unlocked) (§4.2, §11). | P4, P5 | Choosing a mode before playing is a barrier. | One default difficulty; optional challenge areas in the world. |

---

## Key numbers and names

### Versions, tools and dates

| Name | Value | Where |
|---|---|---|
| Unity | 6.3 LTS, **6000.3.25f1** (revision e1dba0a9aba4); Mono in dev, IL2CPP in release (module not yet installed) | §1 |
| URP / NGO / Unity Transport | 17.3.0 / **2.13.3** host mode / via NGO | §1 |
| Steam transport / wrapper | `com.community.netcode.transport.facepunch` 2.0.0 (vendored, bundled 2.3.2 DLLs deleted) / Facepunch.Steamworks master ≥ `e445525` (SteamTimeline) | §1, §2.2 B4 |
| Other packages | MPPM 2.0.2, Cinemachine 3.1.7, Animation Rigging 1.4.1, PrimeTween 1.4.11, Input System 1.20.0, AI Navigation 2.0.15, Splines 2.9.1, Test Framework 1.6.0, uGUI 2.0.0, Localization 1.5.x, Newtonsoft 3.2.x, CoplayDev MCP for Unity v10.0.0, Unity CLI 1.0.0-beta.11 | §1 |
| Tools | Blender 5.2, .NET SDK 9.0.313, git 2.54 + git-lfs 3.7.1 | §1 |
| Dev PC (performance reference) | Intel Core Ultra 7 155H, Intel Arc integrated GPU, 31.4 GB RAM, 2880 × 1800 | §1 |
| **Unity Personal licence expiry** | **2026-11-04 13:20Z**; calendar reminder **2026-10-28** | §1, V-04 |
| First project import | 1,581 s (26.4 min) | §2.1 |
| Unity 6.3 LTS support end / NGO 3.0 move | **2027-12-04** / after Unity 6.7 LTS has ≥ 3 patches, no later than **2027-09-01** | §22.7 |
| Steam AppID in dev | **480 (Spacewar)** until the real AppID exists; `steam_appid.txt` only in Development builds | §2.2 B9, §14.1 |

### Project settings and network

| Name | Value | Where |
|---|---|---|
| Physics / network tick | 60 Hz fixed step (1/60 s, max 0.1 s) / **30 Hz** | §2.3, §7.4 |
| Run in background | On (the host keeps simulating when alt-tabbed) | §2.3 |
| Window / budget resolution | 1920 × 1080, Fullscreen Window | §2.3, §20 |
| Seats per lobby | **8** (Steam lobby `CreateLobbyAsync(8)`) | §7.1, §14.2 |
| LAN | game port **7777**, discovery UDP **47777**, magic `"KNWL"` | §7.2 |
| Lobby data keys | `kw_ver`, `kw_type`, `kw_layer`, `kw_diff`, `kw_door`, `kw_seats` (rename `kw_door` for v2) | §7.2 |
| Approval payload | ≤ 256 bytes | §7.3 |
| Lag compensation | history 16 × 60 Hz (267 ms); cap **150 ms**; contested window 100 ms; host input delay ≤ 100 ms | §7.10 |
| Movement validation | ≤ 6.5 m/s; ≤ 14 m/s within 1 s of an impulse; step > 3 m refused; 3 strikes → correction | §7.11 |
| Bandwidth | ≤ 16 KB/s avg, ≤ 32 KB/s peak down; ≤ 4 KB/s up; host ≤ 112 KB/s; RPC ≤ 1,024 bytes | §7.12 |
| Save path | `%USERPROFILE%\AppData\LocalLow\<Company>\<Product>\save\` (v1: `KNOTWELL\KNOTWELL`); Auto-Cloud quota 1 MB / 20 files | §2.3, §14.5, §15 |
| Save sizes | profile ≤ 64 KB; host world/climb save ≤ 16 KB | §15 |

### Frog

| Name | Value | Where |
|---|---|---|
| Capsule | r 0.30 m, h 0.90 m, skin 0.02 m; same for everyone | §8.2 |
| Walk / accel / decel / turn | 5.0 m/s / 30 m/s² / 40 m/s² / 720°/s | §8.2 |
| Air control / gravity / terminal | 40% / 20 m/s² / 30 m/s | §8.2 |
| Coyote / jump buffer | **120 ms / 100 ms** | §8.2 |
| Hop apex | rank I 1.4 m (7.48 m/s); charged I 1.9 m; charged II 2.4 m; charged IV 3.0 m; v₀ = √(2·g·apex) | §8.2 |
| Tongue range by rank | 3 / 4.5 / 6 / 8 m; prop tell 0.25 s; tongue tube 12 × 8 with 12% overshoot | §8.3, §7.10, §9 |
| Croak radius | 4 / 6 / 9 m; Chorus window 0.3 s; revive: hold 2 s within 1.5 m | §8.3, §8.8 |
| Shove (objects) | 0.2 s wind-up, 1.4 m, 50° cone, 60 ms hitstop, 1.2 s cooldown | §8.3 |
| Spots | 3 (Normal), 4 (Easy); knocked spot catchable 3 s, drifts up 0.8 m/s | §8.8, §9 |
| Tadpole ghost | 3 m/s; may nudge ≤ 5 kg once per 10 s | §8.8 |
| Glow Level | 1–10; 1 orbiting firefly per level, max 10 | §9 |
| Verb ranks | I–IV; rank 3 = Awakening, rank 4 = Mastery | §9 |
| Frog mesh | LOD0 ≤ 6,000 tris, LOD1 ≤ 2,000 (from 15 m), ≤ 24 bones, ≤ 3 materials; sockets Hat, Face, Back, Belly, TongueOrigin; blendshapes blink, eyeRetract, cheekPuff | §9, §20 |
| NavMesh agent `Frog` | r 0.3, h 0.9, step 0.25, slope 50° | §5.4 |
| Local ragdoll | 7 bodies, ≤ 1.2 s, leash 0.4 m, blend back 0.3 s | §8.9 |
| Props | pot 1, egg 1.5, jar 2, stone 3, heavy 15 kg; spit 10 m/s; ≤ 20 tongueable props per area | §8.4 |
| Raft | ~12° with one frog on the rim, settles ~1.5 s; max 28°; slide above 20° | §8.5 |

### World (v1 well)

| Name | Value | Where |
|---|---|---|
| Shaft | inner radius 51 m; lip y 180; wall 1.2 m; water y −2; mist −2 … +8 | §5.2 |
| Strands | 5 columns r 5 m, 30 m from the axis, bearings 0°, 72°, 144°, 216°, 288° (0° = +Z) | §5.2 |
| Stops | well bottom y 0; strand tops y 30, 60, 90; arena y 120 (r 20); Rim y 180 | §5.2 |
| Far clip | 1,000 m in the shaft; 250 m inside rooms | §5.2 |
| Outside-world scales | mound of wells ~1.24 km; dome and island rings ~30 km | §13.6 |
| Place names | `hub_well_bottom`, `hatch_pond`, `landing_well`, `rim_surface`, later layers Sky, Space, Beyond | §5.1, §5.2 |
| Encounter/area names used in v1 | `bell_golem`, `lily_raft`, `heron_shadow`, `fog_stair`, `snapper_crossing`, `echo_warren`, `lamp_knight`, `snake_coil`, `moss_snail`, `web_spider`, `ash_axeman`, `keeper_bell_raft`, `warden_the_jar`, `toy_frog_stack`, `toy_fly_catch`, `sp_grip_wall` | §5, §22.3 |
| Named characters | Kestrel, Moss, Vex (Rivals in v1) | §12.5 |

### Budgets and quality bars

| Name | Value | Where |
|---|---|---|
| Host simulation | ≤ 8.0 ms p95 (v1 split: physics 1.5, netcode 1.0, brains 1.4, NavMesh 0.5, rooms 1.2, motors 0.6, rigs 0.8, UI 0.5, audio 0.3 ms) | §20 |
| Frame time | ≤ 16.6 ms p95 (60 fps); big vista ≤ 20 ms p95 | §20 |
| Draw cost | ≤ 600 batches / 80 SetPass in an encounter; ≤ 900 / 120 at a rest stop; ≤ 600k visible tris | §20 |
| Asset caps | monster ≤ 20k tris; area shell ≤ 150k tris; ≤ 4,000 particles | §20, §13.3 |
| Memory | ≤ 3 GB process; ≤ 1.5 GB graphics | §20 |
| Boot to in-control | **≤ 8 s** (budget); ≤ 5 s after Play (target, §5.1) | §20, §5.1 |
| Allocation | 0 B/frame target, ≤ 1 KB/frame p95 | §20 |
| Bark limits | 1 per 4 s lobby-wide; 12 s per character | §12.6 |
| Bot think rate | 10 Hz, staggered; ≤ 8 raycasts per think; ≤ 4 path requests per frame | §12.1, §12.7 |
| Key-action lock | 90 s (unless "Go!"); explore → theorise at 45 s | §12.3 |
| Rule text | ≤ 14 words; tell lead 2–5 s | §10.7 |
| Encounter length | soft cap 90 s, hard cap 150 s (v1 average door ~57 s) | §10.2 |
| Stuck detection | 45 s without progress | §10.6 |
| Soak pass | ≥ 90% of 50 seeds | T-30 |
| Golden screenshot compare | 16 × 16 tiles, fail above 6% per tile; only a human approves | §17 |
| Content factory rate | S ≤ 3 agent-days, M ≤ 5 | §22.3 |
| Share card | 1200 × 630 PNG, saved locally | §13.6 |

### Naming conventions

- Code root `Assets/_Knotwell/`; assemblies `Game.Core`, `Game.Content`, `Game.Platform`, `Game.Net`, `Game.Hero`, `Game.Rooms`, `Game.Bots`, `Game.Tower`, `Game.UI`, `Game.Editor`, `Game.Tests.*` (§3).
- Commands prefixed `kw_` (`kw_generate_defs`, `kw_build_rooms`, `kw_build_layer`, `kw_bake`, `kw_validate`, `kw_shot`, `kw_golden`, `kw_hero_import`, `kw_build`) and log lines prefixed `[KNOTWELL]` (§17). If the product name changes, rename these once, early.
- Shaders `KW_Toon.shader`, `KW_ToonCore.hlsl`, `KW_Outline*.hlsl`, `KW_Water.hlsl` (§3.1).
- String tables `KW_UI`, `KW_System`, `KW_Rooms`, `KW_Barks` (§4.2).
- Collision layers: Frog 6, FrogGhost 7, Prop 8, Monster 9, RoomStatic 10, ShaftStatic 11, LocalRagdoll 12, Trigger 13 (§8.10).

<!-- END -->
