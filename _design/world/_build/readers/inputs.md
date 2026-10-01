# Reader report: `_design/inputs/` (KNOTWELL v1 design inputs)

Read in full on 2026-09-30: 10 files, about 205 KB. Nothing was skimmed.

| Short id | File (under `_design/inputs/`) | Workflow run | What it is |
|---|---|---|---|
| hero_0 | `hero_0.md` | merge run wf_01dca530-b92 | The case for the Firefly Frog as hero |
| hero_1 | `hero_1.md` | same | The case for the Candle Wick as hero |
| hero_2 | `hero_2.md` | same | The case for a glow-frog hybrid called the "Glim" |
| name_0 | `name_0.md` | same | First name study; top pick KNOTWELL |
| mx/name_0 | `master_explore/name_0.md` | master-design-unity run wf_27fa7ac0-6ba | Second name study; top pick SKYFLOOR |
| mx/name_1 | `master_explore/name_1.md` | same | Third name study; keeps KNOTWELL |
| mx/plan_0 | `master_explore/plan_0.md` | same | Integration plan, fidelity-first lens (the owner's wishes) |
| mx/plan_1 | `master_explore/plan_1.md` | same | Integration plan, fun-first lens (first session, power curve) |
| mx/plan_2 | `master_explore/plan_2.md` | same | Integration plan, Unity buildability lens |
| mx/judge_2 | `master_explore/judge_2.md` | same | Final verdict: name, hero, base plan, grafts, cuts, slice |

These files quote other v1 documents that this reader did not open: FUN_OVERHAUL.md ("FO"), GDD.md, GDD_CRITIQUE.md ("CRIT"), WORLD_STRUCTURE.md ("WORLD") and a Unity tech-stack report ("UT"). Section numbers such as "FO §4.1" are given as the inputs quote them.

---

## Summary for the archive

This folder holds the design inputs for KNOTWELL v1, an 8-player co-op party climber with betrayal. Agents wrote them in two workflow runs in late September 2026.

The three hero files each argue for one hero: the Firefly Frog (hero_0), the Candle Wick (hero_1) and a glowing frog hybrid called the Glim (hero_2). The first name study (name_0) picked KNOTWELL. The `master_explore/` folder adds two more name studies, three integration plans with different lenses (the owner's wishes, first-session fun, and Unity buildability) and the judge's verdict.

What it decided:
- **Title:** KNOTWELL. "Knot" is also the collective noun for toads.
- **Hero:** the Firefly Frog. It is an upright bean-shaped frog with 3 glowing back spots for health. Its verbs are Tongue, charged Hop and Croak. It grows in light, never in size, because Frog Sqwad (2026) already sells "eat to grow". The Wick stayed as a coded fallback behind two playtest gates.
- **Game shape:** each layer (Well, Sky, Space, Beyond) was a climb of 20 numbered monster doors. Each room had one monster and one rule. Heart doors carried the betrayal, and Knot/Cut tied players together or cut them loose. A ★1 reveal ended the climb on the Rim.
- **Plans:** plan_1 became the base, plan_2's data-driven room contract and validators became the build spine, and plan_0's wish trace became the acceptance test.
- **Slice:** the Well, doors 0 to 20.

---

## Reusable for v2

Each row gives the idea, where it is, and why it fits the six pillars (P1 Clear, P2 One world one story, P3 Genuine, P4 Easy to start, P5 Organized, P6 Open world together). "Change" notes say what must change for v2. Items marked "my proposal" are this reader's ideas, not the source's.

### World and lore

| # | Idea | Where | Why it fits |
|---|---|---|---|
| W1 | **The frog-in-a-well saying as the one story theme.** 우물 안 개구리 / 井底之蛙: a small frog learns the world is bigger than its patch of sky. Lines worth keeping: "The sky is another well." "Every sky is someone's well." "Your sky is somebody's floor." | hero_0 §1; mx/judge_2 name_reasoning and grafts; mx/name_0 (SKYFLOOR) | P2: one idea that every place, quest and reward can serve. P3: it comes from a real saying and from the owner's own image, so it feels sincere, not generic. |
| W2 | **Nested layers as one world.** Well → Sky → Space → Beyond → the Revelation. WORLD's laws are stated plainly: Law 1, each layer's exit is the next layer's centre; Law 3, each layer leaks into the one below (seen through windows); Law 4, "up is outward". | mx/plan_0 §2.1, §5.2; mx/plan_1 §1 | P2: world rules written as laws are easy to check content against. P6: the layers become regions of one connected world. Change: you walk or ride between regions instead of starting a new climb. |
| W3 | **The Braid.** Five stone strands inside a well of 51 m radius. Strand tops sit at y 0, 30, 60, 90 and 120; the lip is at y 180. | mx/plan_1 §1; mx/plan_2 §1 | P6: a ready layout for the first region (a vertical start zone with ledges for camps or a town). P2: it is already built on the idiom. |
| W4 | **The Mouth** (the v1 "Coin" renamed): the round sky seen from the bottom. It widens from 31° to 74° as you climb. The first time you arrive somewhere new, the camera tilts up at it for 1.7 s. | mx/plan_0 §2.1; mx/plan_1 §1; mx/plan_2 §1 | P1: an always-visible landmark and progress meter that needs no UI. P2: the story's image is on screen all the time. |
| W5 | **Windows.** Cracks in the well wall that show the scale ("hundreds of lanterns below") and give each layer a view of the next. | mx/plan_0 §4 (`br_window`); mx/plan_1 §2 (3:30); mx/plan_2 W-B03 | P1 and P6: you see the next place before you go there, which is the open-world pull. P2: it is Law 3 made visible. |
| W6 | **The Rim.** A walkable surface at the top of the well. Glide is switched on there, and the stars of Space show through a tear in the dome. | mx/judge_2 grafts; mx/plan_0 §2.3 | P6: the first "outside" region. The owner's "sees the sky" is played, not only watched. |
| W7 | **The statue of the first frog, pointing up.** It is inscribed 우물 안 개구리 / 井底之蛙 and is worn smooth "where someone kept pointing up". Later the plinth is empty: "The frog has gone up." | hero_1 §1.3; hero_2 §1; mx/plan_0 §4, §5.2; mx/judge_2 grafts | P2 and P3: a founder figure and a story anchor for the starting town. It can be the legend behind the first quest. |
| W8 | **The Revelation.** The giant leaning over the rim of the bigger well is a frog: your own species. | hero_0 §1; hero_2 §1 | P2: one ending that lands on the player's own body. |
| W9 | **Lantern-folk.** Twelve lantern-holding frogs revealed at ★1 and planned as the Sky's audience. WORLD Law 2: "Every sky holds the ones who stopped." | mx/plan_0 §5.2; hero_1 §1.3 | P6 and P3, my proposal: re-cast them as the frogs who stopped climbing and settled, who are the people of the towns. That gives towns an in-story reason to exist. |
| W10 | **Frog rain as travel.** A waterspout lifts frogs from the Well and drops them into the Sky layer. | hero_0 §4 | P2: a world rule taken from a real phenomenon. P6: a natural fast-travel method. Source claim only (no URL given, and web checks failed in this pass); verify before use. |
| W11 | **Bosses from the frog's world.** The Jar (a child's firefly jar the size of a house) guards the Well. A thunderhead heron guards the Sky, Chan Chu the moon toad guards Space, and the Watcher guards Beyond. The early `heron_shadow` creature foreshadows the Sky's heron. | hero_0 §2, §4; mx/plan_0 §3, §7; mx/judge_2 slice (LATER) | P2: each threat is something a frog would really fear (jars, herons, the moon). P3: memorable, and it lets one region foreshadow the next. The Chan Chu myth is a source claim with no URL. |
| W12 | **Layer "formats"** as region dressing: Tower, Maze, Dungeon, Maze of dungeons. | mx/plan_0 §5.2 | P6: gives each region a distinct feel. Weak evidence; use only as a starting point. |
| W13 | **One-rule creatures.** The Well bestiary: bell golem, heron shadow, snake coil, echo warren, fog eel, lily-raft pike, snapper, lamp knight, well-eye, chrono-slime, moth, snapjaw, web spider, lantern pike, newt choir, mirror pond and moss snail. Each has one cue and one rule of 14 words or fewer, for example "Ring 3 bells. When its eyes glow, freeze." | mx/plan_0 §3–4; mx/plan_2 §2–3; mx/plan_1 §5 | P1: every creature is readable at a glance. P3: memorable. P2: they are all well animals. Change: in v2 each becomes an open-world species that follows the same rule everywhere. |

### Characters

| # | Idea | Where | Why it fits |
|---|---|---|---|
| C1 | **The Firefly Frog design.** An upright bean with two dome eye-bumps and a round face with no lips (the anti-Pepe rule). It uses dart-frog colours and has 3 emissive back spots for health, a belly glow, and orbiting fireflies that track Glow Level. At Lv10 it gets a firefly Crown halo. It must read at 120 px. | mx/judge_2 hero; hero_0 §2, §5 | P3: readable and memorable, and it would work as a plush toy. P1: health and growth show on the body. |
| C2 | **Growth is light, never size.** The body and hitbox stay small, and the light grows. | mx/judge_2 hero_reasoning and grafts | P2: "small frog, big light" is the theme itself. P6: a fixed hitbox is fair in groups. It also avoids Frog Sqwad's "eat to grow" pitch ([Steam 3989960](https://store.steampowered.com/app/3989960/Frog_Sqwad/), as recorded by mx/judge_2 on 2026-09-28). |
| C3 | **Frog biology as the visual language.** Fireflies are light the frog eats. The belly backlights what it swallows. The growth arc runs tadpole → froglet → frog. Molts change with the region (froglet; the Glider molt with webbed membranes; the Moon Toad fishbowl helmet), all on one rig so every hat fits every form. | hero_0 §2, §4; mx/plan_0 §6; mx/judge_2 grafts | P2: every visual comes from the world. P3: specific and true to real frogs. |
| C4 | **Emotion channels.** Eyes, lids and pupils; throat-sac rhythm (Calm breathing at 0.5 Hz, a Fear flutter at 6 Hz, a Joy bounce with sparks); posture (Sad slumps sideways with a 20% blue tint). When afraid, the eyes retract and the body flattens; when angry, the sac flares. | hero_2 §4; hero_0 §2 | P3: characters show feelings without text, which suits NPCs too. |
| C5 | **Named frog characters with one clear personality each.** Kestrel (a tree frog show-off: "Watch this!", "That was on purpose."), Moss (the helper who tongues your lost spot back to you), Vex (a yellow dart frog), Brother Brass (a bullfrog), Gutter (a scarred toad) and Lumen ("I work alone."). There are 10 Rivals in all. | mx/plan_0 §2.1, §6; mx/plan_1 §2; mx/plan_2 §3 (W-B00) | P3 and P6: re-cast them as town NPCs, guides or companions with sincere, specific voices. Change: drop their scheming role (see Party-only). |
| C6 | **Separate readable channels.** hero_1 argues that health, mood and light must each have their own channel. hero_2's critique says a single glow that means "hiding, dying or scared" fails. | hero_1 §1.1, §3 (glow-frog critique) | P1: one signal, one meaning. It is a rule to keep for every character and creature. |
| C7 | **Seat Hue and a reserved danger colour.** Each player gets a fixed rim-light and name-tag colour from 8 colour-blind-safe hues. No cosmetic may sit within 15° of the warning crimson. | mx/judge_2 hero_reasoning; mx/plan_2 §5 | P1 and P6: you can find your friends in a crowd. Change: crimson marks danger from creatures, not betrayal. |

### Frog mechanics

| # | Idea | Where | Why it fits |
|---|---|---|---|
| M1 | **Three verbs.** Hop (a tap reaches a 1.4 m apex; hold for a 2.4 m crouch launch). Tongue (grab props, catch fireflies, grapple anchors). Croak (a pulse of light and sound; hold it for a pitch). | hero_0 §3; hero_2 §3; mx/judge_2 hero | P4: three verbs, all frog-native, learnable in a minute. P3: they come from real frog bodies. |
| M2 | **Tongue rule by weight.** Props of 20 kg or less come to you; anchors of 60 kg or more pull you to them. A visible wind-up of 0.25 s comes first. | hero_2 §3; hero_0 §3 | P1: one predictable rule for every object in the world. |
| M3 | **Chorus.** Croaks that land within 0.3 s of each other stack, and the radius doubles. | hero_2 §3; mx/plan_0 §3 (`lamp_knight`) | P6: the purest "together" verb, which strangers can join without talking. |
| M4 | **Sticky-pad wall climbing with per-frog grip, plus tongue-hauling a friend up.** | hero_0 §3; mx/plan_1 §5 (`sp_grip_wall`) | P6: helping is a physical action. |
| M5 | **Tongue-catch save.** Catch a falling friend in mid-air. | hero_0 §3; mx/plan_0 §3 (Warden phase 3) | P6: help becomes the best moment to share. |
| M6 | **Health as 3 back spots.** A lost spot flies out as a prop that always returns to its owner, and a friend can tongue it back. | mx/plan_2 §4; mx/plan_1 §6 | P1: health is visible. P6: a hit becomes a co-op catch. |
| M7 | **Soft failure.** You become a tadpole ghost, and a friend croaks you back ("Hatch"). You can spit a firefly into a friend to heal them. | hero_0 §2; hero_2 §2; mx/plan_2 §4 | P4: failure is cheap and needs no manual. P6: friends are the fix. |
| M8 | **Movement verbs tied to regions.** Glide in the Sky (webbed membranes, modelled on Wallace's flying frog), Drift in Space with a tongue grapple, Light-Lag in Beyond (LATER). | mx/plan_0 §5.2; hero_0 §4; hero_2 §5 | P2 and P6: each region teaches one new way to move. Change: unlock once and keep it. The biology is a source claim with no URL. |
| M9 | **Verb ranks with named Awakenings.** Long Tongue, Air Hop, Big Voice (renamed Twin Toll). The top ranks are Tongue IV (8 m), Hop IV and Thunder Croak. | mx/plan_1 §4; mx/judge_2 | P1: you feel growth in the verbs you already use. Change: fold it into fewer tracks (see Conflicts X5). |
| M10 | **The interactable kit.** Bell, Lever, Plate, Pad, Jar, Pot, Key/Lock; Anchor, RankLedge, GripWall; GazeCone, NoiseBus, TellLight; Water. RankLedge heights are read from one `VerbRanks.json`. | mx/plan_2 §1.2 | P1 and P2: the same objects behave the same everywhere in the world. |
| M11 | **Co-op toys.** Frog Stack (a tower of frogs), Fly Catch, Lily Sumo and Jar Tag, each about 30 s. | mx/plan_1 §5; mx/plan_2 §3 (W-B05 to W-B09) | P6: optional town games. Lily Sumo and Jar Tag are contests, so keep them opt-in. |
| M12 | **Shared-weight raft.** Its tilt comes from the torque of the frogs' weights. | mx/plan_2 §3 (W-S01) | P6: a group ride that needs no text. |
| M13 | **Two-carrier egg delivery.** An egg needs 2 carriers and cracks after a fall of more than 1 m. | mx/plan_0 §4 (`snapper_crossing`) | P6: a clear co-op quest pattern. |

### Art

| # | Idea | Where | Why it fits |
|---|---|---|---|
| A1 | **Procedural animation.** Hand-written 2-bone leg IK, spring bones on the sac, eyes and hat, a Catmull-Rom tongue tube with overshoot, and PrimeTween squash and stretch. Ragdoll is a local effect only. | mx/plan_2 §5; mx/judge_2 hero_reasoning | P3: motion looks alive, not canned. It suits a team of agents. |
| A2 | **Feel numbers.** Anticipation squash 15%, launch stretch 20%, landing splat 20% with a sac wobble. The sac inflates to 1.8× in 0.12 s. The frog blinks every 3–6 s. | hero_2 §6 | P3: a starting tuning set. |
| A3 | **Toon shader with a rim light and outline.** Self-lit (emissive) tells must read by luminance at 25 m. | mx/plan_0 §1; mx/plan_2 §4, §7 | P1: danger and state read from far away. |
| A4 | **Translucent skin lit from inside** (the glass-frog look). | hero_0 §5; hero_2 §6 | P3: a signature look for the hero. |
| A5 | **A skin catalogue from nature.** Dart-frog palettes (strawberry, blue-jeans, bumblebee), a glass frog with a visible beating heart, and tomato, horned and starry-night tree frogs. Also hats, croak voices as an item type, and earned-only prestige pieces: Well-stone, the fishbowl helmet, the Jar-lid crown and Surfacing hats. | hero_0 §6; hero_2 §7; mx/plan_0 §5.2 | The owner's skins and cosmetic shop. P2: every skin comes from the world. |
| A6 | **Anti-meme rules.** A round chibi face, no human lips, no droopy lids. Brand gate: 5 cold viewers make no Pepe association. | hero_0 §9; hero_2 (gates) | P3: the hero reads as its own character. |
| A7 | **A Definition of Done for each area.** 3 golden screenshots at fixed seeds; a juice checklist (hitstop, squash, rising-pitch count-ups); a luminance check at 25 m; a positional audio cue; frame clips for a human feel review. | mx/plan_2 §7; mx/judge_2 grafts | Agents cannot judge motion, so a human reviews feel at each milestone. |

### Audio

| # | Idea | Where | Why it fits |
|---|---|---|---|
| U1 | **Pentatonic croaks that harmonise, a music key per layer, and an echo that dies at the rim.** Uses AudioMixer snapshots. | mx/plan_0 §5.2; mx/plan_2 §4 | P2: sound tells you where you are in the world. |
| U2 | **Croak as an instrument.** Chord puzzles (bell golem, lamp knight, newt choir). A mistimed chorus gives one sad croak. | hero_0 §3; hero_2 §3, §8; mx/plan_1 §2 | P3 and P6: shared music moments and gentle comedy. |
| U3 | **Every creature has a positional audio cue, and every challenge can be solved with audio muted.** | mx/plan_2 §1.2 (CRIT #21) | P1: accessibility. |
| U4 | **Reveal audio.** An audio sweep, then 200 ms of silence. | mx/plan_0 §5.2 | P2: the big story beats get a sound signature. |
| U5 | **Comic body sounds,** such as a deflating-balloon noise when Glow hits 0. | hero_2 §8 | P3: warmth and humour without words. |

### Tech

| # | Idea | Where | Why it fits |
|---|---|---|---|
| T1 | **The stack matches the brief:** Unity 6.3 LTS, URP 17, NGO 2.x host mode, and Facepunch for Steam (plus UTP for LAN). | mx/plan_2 lens; mx/judge_2 slice_scope | It is still valid from v1. |
| T2 | **`IHeroBody` interface:** `SetSpots`, `SetGlow`, `PlayAwakening`, `TongueOrigin`, `CroakFX`, plus attach sockets. A capsule implements it first. | mx/plan_2 §5; mx/judge_2 grafts | A clean code boundary for the hero, for NPC frogs and for cosmetics. Change: drop the Wick implementation. |
| T3 | **Content as data.** JSON definitions go through generators to ScriptableObjects and prefabs. Only generators write prefabs and scenes. EditMode validators fail the build on missing fields. | mx/plan_2 §1.2, §7; mx/judge_2 grafts | Suits an agent-built team. P2: a validator can lint the world for contradictions. Change, my proposal: RoomDef becomes QuestDef, NpcDef and CreatureDef. |
| T4 | **Contract fields worth keeping:** a plain rule of 14 words or fewer, one cue, a Bestiary page, a 3-stage bot plan (Explore, Theorise, Execute) and the System lines. | mx/plan_2 §1.2 | P1: every piece of content ships with its own explanation. |
| T5 | **Netcode patterns.** Predict the tongue's visual on the client and let the host confirm, with lag compensation capped at 150 ms. Replicate a raft as one float. Never network ragdolls. Use kinematic controllers and host-simulated props. Bots send the same input struct as humans. | mx/plan_2 §4, §7; mx/plan_0 §8 | P6: physical co-op that holds up with 8 players. |
| T6 | **NGO visibility by membership:** only players in an area see its dynamic objects. | mx/plan_2 §1.2 | P6: the start of area-of-interest for an open world. It still needs a proof of concept. |
| T7 | **Floating origin and nested shells for big scale reveals,** with Cinemachine and a ClientRpc that carries server time. | mx/plan_0 §5.2 | P6: large distances in one world. |
| T8 | **Network acceptance:** 4 humans at 150 ms RTT and 2% loss. A 7-bot soak on fixed seeds. | mx/plan_2 §6; mx/judge_2 grafts | Numbers that can be tested. |
| T9 | **Toolchain traps.** `.meta` and GUID churn when agents move assets. Static state leaks when domain reload is off (reset it with `RuntimeInitializeOnLoadMethod`). APV and NavMesh bakes need a logged-in GPU desktop, never `-nographics`. A `licenses.csv` validator. The NGO 3.0 migration is expected with Unity 6.7 LTS in 2027. | mx/plan_2 §7; mx/judge_2 grafts | Lessons that are already paid for. |
| T10 | **One replicated seed,** so a failed soak replays exactly. | mx/plan_0 §2.2 | Test hygiene. |
| T11 | **The Input System asset is generated from JSON, with 8 bindings.** | mx/plan_2 §4 | P4 and P5: a small, fixed control set. |

### Progression

| # | Idea | Where | Why it fits |
|---|---|---|---|
| G1 | **Glow Level 1–10 shown on the body:** belly emission, one more orbiting firefly per level, and the Crown glow at 10. | mx/plan_2 §5; mx/judge_2 hero | P1 and P2: progress is visible light, which is the theme. |
| G2 | **Cadence contract.** A small tick every 10–30 s, a perk about every 2 min, a level every 2–3 doors, and a "stronger, laughed or saw something bigger" beat at least every 90 s. | mx/plan_0 §1; mx/plan_1 §2 | "Addictive but fair" as numbers. Change: count in quest steps, not doors. |
| G3 | **First-session rules.** At most 5 new systems before the first big payoff, then one new thing per stop. At most one full-screen card per stop. Grant early powers instead of asking the player to choose. No class select and no shop before the first payoff. | mx/plan_1 §0, §2; mx/judge_2 integration_base and grafts | P4: the core loop is understood without a manual. |
| G4 | **Simulate growth with the real content mix and add a CI test on the level windows** (v1: Lv5 inside doors 6–8, Lv10 inside doors 17–19). | mx/plan_1 §4; mx/judge_2 integration_base | P1 and fairness. Change: windows in quest or region units. |
| G5 | **Rematch.** Return to an old monster at its old numbers and flatten it: "OLD TIME 1:12 → 0:18". | mx/plan_1 §3; mx/plan_0 §2.3 | P6: going back to old areas stronger is a classic open-world pleasure. |
| G6 | **Bestiary.** One page per creature. It fills on your first death and gives a tip. | mx/plan_0 §5.1; mx/plan_2 §4 | P1 and P5: all creature knowledge in one place. |
| G7 | **Fair economy lessons.** An earned cosmetic catalogue. A one-time +50 Pearls at the first big milestone, so the first Common cosmetic is affordable. No rotating daily shop, no battle pass, and no daily bonus or streaks (all cut as check-in habits). | mx/plan_1 §6; mx/judge_2 grafts; mx/plan_2 §4 | "Addictive but fair", plus the skins and cosmetic shop. |
| G8 | **Small perks ("Boons").** Shatter Croak, Spring Legs, Tell-Sight, Sure Tongue, Chorus, Lifeline, Deep Cheeks and Last Gulp, plus the Legendaries Moon Hop and Time Gulp. 4 passive slots and 1 active slot. Granted automatically early on. | mx/plan_2 §6; mx/plan_1 §0 | Frog-flavoured names (P2). Change: fewer of them, possibly as charms. |
| G9 | **Light classes,** 3 open ones, offered after the first session. | mx/plan_1 §0 (fix 10); mx/judge_2 | The owner asked for "light classes or roles". |
| G10 | **Difficulty set once at the entrance** (Easy, Normal, Hard) instead of hidden scaling. | mx/plan_1 §6; mx/plan_2 §4 | P1: no hidden rules. |

### UI

| # | Idea | Where | Why it fits |
|---|---|---|---|
| I1 | **The ring map.** Concentric bands: the Well at the centre, then Sky, Space and Beyond. Your path is traced and friends' progress is pinned. It shows on a hub wall, in pause and on results, is built in UI Toolkit and needs no extra binding. | mx/plan_0 §2.1; mx/judge_2 grafts | P1, P5 and P6: the world map is also the story diagram. |
| I2 | **Entrance sign.** Four fields: name, type, prize icon and skulls for difficulty. | mx/plan_0 §2.1; mx/plan_2 §4 | P1: you know what a place gives and costs before you enter. Change: drop the suit symbols. |
| I3 | **The Wheel:** pings, 8 quick-chat lines and emotes in one radial. It replaced 24 quick-chat lines and the Clue Composer. | mx/plan_2 §4 | P5 and P6: you can talk to strangers with one input. |
| I4 | **8 bindings.** Named ones: Hop, Tongue, Croak, Shove, Power and Wheel. | mx/plan_2 §4 | P4 and P5. |
| I5 | **Plain rule text on the first visit;** hints are never hidden. | mx/plan_0 §5.1; mx/plan_2 §4 | P1. |
| I6 | **Walk to choose.** A group picks a path by standing at it (4 s majority). | mx/plan_0 §2.1; mx/plan_1 §1 | P5 and P6: group decisions without a vote menu. |
| I7 | **Results order:** counters, then currency, then stamps, with the rank bar last. Two clear buttons ("Climb again" / "Rest"). | mx/plan_1 §3 | P1: a clear end-of-session summary. |
| I8 | **Hangul and Hanja title cards** using a TextMeshPro CJK subset. | mx/plan_0 §5.2 | P2: honours the saying's Korean root. |
| I9 | **Bracketed feedback lines:** `[ CHOICE UNLOCKED ]`, `[ NOTED ]`, `[ WELCOME, GLIM ] You have been lit. Please do not go out.` | hero_2 §2; mx/plan_1 §2 | Cheap, readable feedback. See Conflict X13 about whose voice it is. |

---

## Party-only (to archive)

| Item | Where |
|---|---|
| **The betrayal pillar and its copy.** "Climb together. Fall alone." "Belay or betray." "Tie in at the bottom. Cut loose at the top." "Every door makes you bigger. Every knot can be cut." "Leave the well. Leave a friend." "Hop together. Somebody croaks." "They might not cut it." The fantasy sentence ending "if nobody cuts your knot first". | name_0; mx/name_0; mx/name_1; mx/judge_2 (tagline, fantasy_sentence) |
| **The betrayal readings of the name** ("not well"; Knot as the thing you Cut). Names that only work for betrayal: TRAITOAD, FRAYWELL, MIGHTKNOT, CROAKWELL, ROPEWELL and WELLSWORN. | name_0; mx/name_0; mx/name_1 |
| **Heart doors (♥).** `heart_two_pads` ("Only two may leave by the pads", where the temptation is to shove a friend off), `heart_split_swallow` (the Pinky Promise dilemma) and `heart_tied_bridge` / the Tongue-Tied Bridge. | mx/plan_0 §3; mx/plan_1 §5; mx/plan_2 §2–3 |
| **Social deduction and secret roles.** `doppelfrog` (the Mimic, an Among Us style vote) and its solo "spot the Mimic" variant. The Liar's Banquet, with a swallowed key seen through a glowing belly as evidence. The Mimic Climb lobby mode. The "Mafia/Among Us" wish row and the build test that enforces it. | hero_0 §2; mx/plan_0 §1, §3; mx/plan_1 §5; mx/judge_2 grafts |
| **Knot, Cut and Pact.** The Pact thread runs mouth to mouth ("tongue-tied"). Hold Shove while Knotted to Cut. Duos (the Frog Sling). The Knot spot at Landings and the Knot unlock at Landing 3. | hero_2 §3; mx/plan_1 §3; mx/judge_2 slice_scope |
| **Tethers** (the owner's decision 3 moves them out). The Fuse Tether, `tongue_tether` / `sp_tongue_tether` / `sp_tongue_tied_crossing` (the Chained Together homage) and `tongue_bridge`. | mx/plan_0 §3; mx/plan_1 §5; mx/plan_2 §2 |
| **Betrayal presentation.** Betrayal Cam, the WANTED poster, Vengeance (and its carry-over rule), blame tags, the 3 s fall replay used for blame, and the Resolve tell (a 1.5 s crimson telegraph before a betrayal). Also the crimson hue reserved for betrayal and the Betrayal Snap and Oath Thread cosmetic slots. | hero_0 §2, §6; hero_1 §1.1; mx/plan_2 §4; mx/judge_2 slice_scope |
| **Staged bot drama.** The Drama Director staging a bot-on-bot betrayal (Vex shoves Moss off, and Moss takes Vengeance one room later, a "goguma, then saida" beat). Also the Rivals' scheming role, the Rival Register, and bots voting on public evidence. | mx/plan_1 §2; mx/plan_0 §5.1; mx/judge_2 grafts |
| **Pranks.** Tongue-yanking a frog off a ledge (the Kestrel gag). Tongue-stealing a held item as a "Knife with a tell", with the Cinch counter (grip or bite down). Shoving someone off a pad. Throwing frogs. | hero_0 §3; hero_2 §3; mx/plan_1 §2 |
| **v1 betrayal machinery that v1 had already cut.** Ledger, the 10 Knives, Soot, soot bands and warning stripes as reputation, Notorious (violet), Tribunal, Notes, bets, Pact Pot, Clue Composer, Rumour Dice and `weight_of_guilt`. | mx/plan_0 §5.1; mx/plan_1 §6; hero_0 §2; hero_1 §1.1 |
| **Betrayal gates and limits.** The Knife rate per floor must stay within ±15% of the Grab baseline over 500 bot runs. Human-vs-human Heart doors only in friend lobbies. No results stat that counts betrayals. | hero_2 (gates); mx/judge_2 cuts |
| **The "sabotage" and "lone protagonist" wishes** read from *The Tutorial Is Too Hard*, and the 1A/1E split-and-meet design built for them. | mx/plan_0 §1 |
| **Landing Party mode.** It is the natural candidate for the one small, documented opt-in town side-mode hook that v2 may keep. Build nothing for it now. | mx/plan_0 §7; mx/plan_1 §8; mx/judge_2 slice_scope |

---

## Conflicts with the new pillars

| # | Item | Pillar | Why | Where |
|---|---|---|---|---|
| X1 | **The 20-door numbered climb per layer** (floors, door slots, pairs, forks, breathers, the 11-minute Quick Climb and the 24-minute Full Climb) | P6, P2 | The owner's decision 2 asks for one connected world with one story, not 20 separate monster doors. Each room is a cut-off level. | mx/plan_0 §2; mx/plan_1 §1–3; mx/plan_2 §1 |
| X2 | **Rooms baked into hidden cells of a 300 m grid below the shaft,** entered through a 0.4 s fade. The door "hides how far away the room really is". | P2, P6 | The world's geography is fake, so it cannot feel open or continuous. | mx/plan_2 §1.2; mx/plan_0 §2.1 |
| X3 | **Re-hatching at Lv1 in each new layer** (framed as a "molt") | P1, P2, P6 | In a persistent world a level reset reads as a loss. It also breaks the idea of one continuous story. | mx/plan_0 §2.1; mx/plan_1 §4 |
| X4 | **The door symbol code.** ♠A Body, ♦B Mind, ♣C Together, ♥ Heart, E solo/duo, skulls, gold and Rematch overlays, a layer glyph, and ids like `12E`. | P1, P5 | A new player must learn a code before reading a sign. | mx/judge_2 notes §3; mx/plan_0 §2.1 |
| X5 | **Parallel progression tracks.** Glow Level, 3 verbs × 4 ranks, Awakenings, Masteries, Boons (16 + 4 Duo + 4 Legendary, in 4 passive + 1 active slots), classes (3 open + 4 or 6 secret), Tower Rank F→SSS with talents, Party Rank, Bestiary stamps, and a Bronze→Silver jar lineup. | P4, P5 | Far more than 5 systems even after staging. It needs a wiki to explain. | mx/plan_1 §4, §8; mx/plan_2 §4, §6; mx/judge_2 slice_scope |
| X6 | **Two currencies and run-based loss.** Wish Coins (per run), Pearls (meta), 50% pay on failure, Team Lives and "Retry from door 11". | P5, P6 | Run loss does not fit a persistent shared world, and two currencies are one more thing to learn. | mx/plan_2 §4; mx/plan_0 §2.3; mx/judge_2 grafts |
| X7 | **Hidden content.** Secret classes unlocked by private secret quests (`[ HIDDEN CONDITION DETECTED ]`), hidden clears, and Sealed and Hell rule redaction. | P5, P1 | The brief says nothing is hidden. Optional discoveries can stay only if the Bestiary or journal signposts them. | mx/plan_1 §2; mx/plan_2 §4; mx/judge_2 slice_scope |
| X8 | **Seeded "Twists" that change a creature's rule from run to run** (a crooked decoy bell, which tiles are safe) | P1, P2 | In one world a creature should follow the same rule every time. Otherwise the world contradicts itself. | mx/plan_2 §1.2; mx/plan_0 §3 |
| X9 | **Bots in every empty seat** (7 Rookie Rivals), offstage Rivals carrying keys, and the Drama Director scripting bot beats | P3, P6 | An MMO feel needs real players to be visible. Scripted bot "friends" feel fake. plan_1's own risk 4 notes that no hit game gets its comedy from bots. | mx/plan_0 §2.1; mx/plan_1 §9; mx/judge_2 grafts |
| X10 | **Split parties.** Forks with solo or duo E doors, a two-lock Meeting Door, a rescue rope, and at most 2 live rooms at once. | P6 | It pulls the group apart, then adds waiting rooms to patch the split. | mx/plan_0 §2.1; mx/plan_2 §3 (W-M01) |
| X11 | **Wick fallback and candle leftovers.** Hero Gates A/B with a Wick-Flame fallback, the Candle-Toad cosmetic line, Old Tallow's Market, the Tallow/Beeswax/Tapered/Gilded rarity names, Wickbook, Drips, Embers, Sparks, Burnt-Out Wicks as stars (Law 2), "You have been lit". | P2 | The owner kept the frog. Candle terms contradict the frog world. | hero_1; hero_2 §2, §7; mx/plan_0 §5.1, §6; mx/judge_2 hero |
| X12 | **Homage-driven content.** Every room carries `wish[]` / `homage[]` tags, and a build test fails if Mafia/Among Us, Chained, PEAK, the TEAMBOUND modes or TTITH floors are missing. | P2 | Content serves references instead of the one story. plan_0's risk 4 calls this "homage creep". | mx/plan_0 §1, §8; mx/judge_2 grafts |
| X13 | **The LitRPG "System" voice** (bracketed windows, "Please do not go out", "Something is waiting in 12E.") | P2, P3 | It is an outside game-show voice. It needs an in-world source (the well itself, or a character) or it breaks the one story and sounds generic. | hero_2 §2; mx/plan_1 §2; mx/judge_2 slice_scope |
| X14 | **"Lit only by the players" dark rooms and light-seeking monsters as the base art direction** | P1, P6 | A large shared world needs readable ambient light. Darkness everywhere hides paths. Keep darkness for chosen places. | hero_1 §1.2; hero_2 §2 |
| X15 | **The hook "Tiny frogs. Monster doors." and the "grow absurdly stronger" / "every door makes you bigger" pitch** | P2 | The doors are gone. "Bigger" contradicts "light, never size". | mx/judge_2 name_reasoning, fantasy_sentence; mx/name_1 |
| X16 | **Tongue on other players** (a ranged 0.2 s yank) | P6 | hero_1 calls it an unreadable attack that is costly to network. With strangers in a shared world it becomes griefing. At most, allow it as a consented save (the catch). | hero_1 §3; mx/plan_2 §7 |
| X17 | **Difficulty as places.** Hard and Hell doors chained at the hub; Hard unlocks at the Keeper. | P5 | Difficulty should be one setting, not a place to find. | mx/plan_0 §1; mx/judge_2 slice_scope |
| X18 | **Scattered stations.** The Mirror (shop) at the hub, the stall only from Landing 2, a Knot spot, the jar lineup, toys at Landings, and the map in three places. | P5 | Features are tied to places the player may not be near. The shop must be 2 inputs or fewer from play. | mx/plan_1 §1, §6; mx/plan_2 §4 |
| X19 | **The NGO-vs-FishNet proof of concept and the FishNet fallback** | Brief constraint (NGO 2.13.3 is fixed) | Keep the verb tests (tongue on props, raft, visibility, bots on host) and drop the framework choice. | mx/plan_2 §6–7; mx/judge_2 grafts |
| X20 | **Private and LAN lobbies as the default.** Public lobbies and drop-in are only SHOULD. | P6 | Drop-in co-op without friction must be core, not a stretch goal. | mx/plan_2 §6 |
| X21 | **Session-clock design.** ★1 at about 22–26 min, time outside rooms capped at 12%, and fun per minute counted per room. | P6 | Still useful as a feel check, but open-world pacing runs by quest and region, not by a fixed climb clock. | mx/plan_1 §3, §5; mx/plan_0 §2.3 |
| X22 | **The "brutal" difficulty wish** from *The Tutorial Is Too Hard* | P4 | It conflicts with a very low learning curve. Keep hard content optional. | mx/plan_0 §1 |

---

## Key numbers and names

### Names to keep consistent

| Name | Meaning / note | Where |
|---|---|---|
| **KNOTWELL** | The title. In v2 its safe reading is "a knot (group) of toads in a well". Drop "not well" and Cut. Before public use: trademark checks (USPTO, EUIPO, KIPRIS), domain and Steam handle; a logo whose K reads clearly (a rope-knot K). Fallbacks were FRAYWELL (betrayal-led, so weak for v2) and SKYKNOT. | mx/judge_2; mx/name_1 |
| **Firefly Frog** | The hero. "Glim" was the hybrid's name and was not chosen. | mx/judge_2; hero_2 |
| **Glow / Glow Level** | The light resource and the level (1–10). | mx/judge_2; mx/plan_2 |
| **우물 안 개구리 / 井底之蛙** | "The frog inside the well", the root saying. | hero_0 §1; mx/plan_0 §4 |
| **The Well, the Sky, Space, the Beyond, the Revelation, Cycle 2** | Layer order, centre to outside. | mx/plan_0 §2.1 |
| **The Braid, the Foot, the Mouth, Landings, the Rim** | The Well's places. "The Mouth" replaced "the Coin". | mx/plan_0 §2.1, §5.2; mx/plan_2 §1 |
| **Lantern-folk; the statue of the first frog** | World figures. | mx/plan_0 §4, §5.2 |
| **The Jar, the thunderhead heron, Chan Chu (the moon toad), the Watcher** | The Wardens of the Well, Sky, Space and Beyond. | mx/judge_2 slice_scope; hero_0 §4 |
| **Kestrel, Moss, Vex, Brother Brass, Gutter, Lumen** | Named frog characters (6 of 10 named in these files). | mx/plan_0 §6; mx/plan_1 §2 |
| **Hop, Tongue, Croak; Chorus; Shove** | The verbs. | mx/judge_2; hero_2 §3 |
| **Long Tongue, Air Hop, Twin Toll (was Big Voice), Thunder Croak, Shatter Croak, Moon Hop, Time Gulp** | Named power moments. | mx/plan_1 §4; mx/judge_2 |
| **Froglet, Glider molt (was "Tree Frog"), Moon Toad fishbowl helmet** | Region forms of the hero. | mx/plan_0 §6; mx/judge_2 grafts |
| **Tadpole ghost, Hatch (croak revive)** | Failure and revive. | hero_0 §2; hero_2 §2 |
| **The Mirror; Pearls; Bestiary; the map; the Wheel; Seat Hue** | Shop, currency, knowledge book, world map, chat radial, player colour. | mx/plan_0; mx/plan_2 |

### Numbers worth keeping

| Topic | Value | Where |
|---|---|---|
| The Mouth's angle by height | 31° at y 0 (Foot), 37° at y 30, 44° at y 60, 56° at y 90, 74° at y 120 | mx/plan_0 §2.1; mx/plan_2 §1 |
| Well size | radius 51 m; lip at y 180; about 6 m of height per door | mx/plan_1 §1; mx/plan_2 §1–2 |
| v1 door bands (useful for region order) | Well 1–20, Sky 21–40, Space 41–60, Beyond 61–80 | mx/plan_0 §2.1 |
| Glow Level | 1–10; +1 orbiting firefly per level; Crown at Lv10 | mx/plan_2 §5 |
| Health | 3 back spots | mx/judge_2 hero |
| Light radius | 6 m base, 14 m when puffed, 2 m with eyes shut | hero_0 §2; hero_2 §2 |
| Hop | 1.4 m tap apex; 2.4 m charged; a Hop II ledge at 2.3 m | hero_0 §3; mx/plan_1 §2 |
| Tongue | 0.25 s wind-up; props ≤20 kg come to you; anchors ≥60 kg pull you; Long Tongue snatch 6 m; Tongue IV 8 m; the old v1 grab reach was 1.6 m | hero_2 §3; mx/plan_1 §2 |
| Croak | 8 m pulse for 0.4 s, costing 2 Glow; Chorus window 0.3 s; the Warden's Chorus uses up to 5 croaks within 6 m; echo pulse 4 / 6 / 9 m by rank | hero_2 §3; mx/plan_0 §3–4 |
| Readability | tells read at 25 m; silhouette reads at 120 px; one 0.32 m capsule for every skin; 8 Seat Hues; cosmetics stay 15° away from crimson | mx/judge_2; hero_2 §4; mx/plan_2 §5 |
| Animation | squash 15%, stretch 20%, splat 20%; sac 1.8× in 0.12 s; blink every 3–6 s; Calm 0.5 Hz, Fear 6 Hz, Sad 20% blue | hero_2 §4, §6 |
| First minute | control within 5 s; first level at 0:15; first laugh by 0:30 (meets P4's 60 s target) | mx/plan_1 §2 |
| Cadence | tick every 10–30 s; perk about every 2 min; a beat every 90 s or less; 5 systems or fewer before the first payoff; 1 full-screen card per stop; 12% or less of time outside play | mx/plan_0 §1; mx/plan_1 §0, §2–3 |
| Challenge length | soft cap 90 s, hard cap 150 s; rule of 14 words or fewer | mx/plan_2 §1.2 |
| v1 growth simulation | Lv3 at door 3, Lv4 at 5, Lv5 at 7, Lv6 at 9, Lv7 at 10, Lv8 at 12, Lv9 at 15, Lv10 at 18 | mx/plan_1 §4; mx/judge_2 notes §2 |
| Tests | 7-bot soak clears 90% or more of 50 seeds; no bot does a key action in the first 90 s while a first-visit human is there; 4 humans at 150 ms RTT and 2% loss | mx/plan_2 §1.2, §6 |
| Lobby and controls | 8 players per lobby; 8 bindings | mx/judge_2; mx/plan_2 §4 |
| Cosmetics | 8 slots ordered by visibility; 12, then 24 earned items; 2 Supporter Sets; +50 Pearls on the first surfacing (v1's old catalogue: 60 items in 10 slots) | mx/plan_2 §4, §6; mx/judge_2 grafts; hero_0 §6 |
| Perks | 8 base + 2 Legendary in the first slice; 16 + 4 Duo + 4 Legendary in full; 4 passive + 1 active slot | mx/plan_2 §6; mx/judge_2 |
| Bestiary | 12 pages for the Well slice | mx/judge_2 notes §3 |
| ★1 reveal | 26 s, with free look from 21 s | mx/plan_1 §3; mx/plan_0 §5.2 |
| Build estimates (not measured) | a small room takes 3 agent-days or less; the frog costs +1.5 to 2 tech-art weeks over a simpler hero | mx/plan_2 §7; hero_0 §5; hero_2 §6 |

### Inconsistencies to settle before reuse

- **Tongue base reach:** 3.0 m (hero_2 §3) vs 4 m (hero_0 §3).
- **Chorus threshold:** 3 or more frogs (hero_2 §3) vs 2 or more (mx/plan_0 §3, `lamp_knight`).
- **Squash numbers:** crouch squash 25% (hero_0 §3) vs anticipation squash 15% (hero_2 §6).
- **Secret class count:** 4 (mx/judge_2) vs 6 (mx/plan_2 §6; mx/plan_0 counts 9 classes in total).
- **Croak III name:** "Big Voice" (mx/plan_1) was renamed "Twin Toll" (mx/judge_2).
- **"Tree Frog"** named a class, the Sky molt (renamed "Glider molt") and Kestrel's species.
- **"Moss"** names a character, the Moss Snail creature and the moss holds on the grip wall.
- **"Jar"** is overloaded: the Well Warden, Jar Tag, the jar lineup (rewards), the jar room and `br_jar_mites`.
- **Room ids differ between plans:** `fog_stair` vs `fog_stairs`; `keeper_well` vs `keeper_bell_raft` vs W-K01 Bell-Knight; `warden_jar` vs `warden_the_jar` vs W-WD01; `chorus_sentinel` vs `lamp_knight` vs W-R02; `glitch_eye` vs `blind_eye` vs W-R03 Well-Eye. mx/judge_2 chose readable snake_case ids with type prefixes (`hub_`, `br_`, `toy_`, `sp_`, `heart_`, `keeper_`, `warden_`, `rim_`).

### External facts and their sources

Web search was not available during this pass (session limit), so nothing below was re-checked. Each fact is given as the source recorded it.

- **Frog Sqwad** (Steam 3989960, Panic Stations): released 11 June 2026; co-op frogs for up to 8 players; eat to grow into a Megafrog; 72% positive of 355 reviews on 2026-09-28. <https://store.steampowered.com/app/3989960/Frog_Sqwad/> (cited by mx/judge_2).
- **"Knot" as the collective noun for toads:** mx/name_1 cites grammar-monster.com, online-field-guide.com and gaggleofnouns.com, but gives no full URLs. Verify before public copy.
- **Name collisions that ruled out titles:** WellBound (Steam 4292280, <https://store.steampowered.com/app/4292280/WellBound>, from name_0) and Hatchwell (Steam 1424690, <https://store.steampowered.com/app/1424690/Hatchwell>, from mx/name_0 and mx/name_1). There are also many frog-climb titles: Stick Tongue (Steam 3356480), Croak (2616540), Croakspire (3744870), Croakwood (2261380) and Frog Up! (4665830, 4069240).
- **Biology and myth claims with no URL in the source:** frog rain lifted by waterspouts, the glide of Wallace's flying frog, the fluorescence of the pumpkin toadlet, and Chan Chu as the moon toad (hero_0 §4; hero_2 §5). Verify each before it becomes world lore.

<!-- END -->
