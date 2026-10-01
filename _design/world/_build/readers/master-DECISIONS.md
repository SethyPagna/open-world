# Reader: master/DECISIONS.md

**Source:** `_design/master/DECISIONS.md` (KNOTWELL v1.0, 2026-09-29, status BINDING, 782 lines, read in full: §1–§12).
**Reader date:** 2026-09-30.
**Purpose:** sort v1's binding verdict into what v2 keeps, what goes to the archive, and what fights the six v2 pillars (P1 Clear, P2 One World One Story, P3 Genuine, P4 Easy to Start, P5 Organized, P6 Open World Together).

Section marks like "§6 row 5" point into the source file. "FO" is `_design/FUN_OVERHAUL.md`, which the source amends.
External facts (competitor, domains, name searches) are quoted as the source recorded them on 2026-09-28/29. This reader did not re-check them.

---

## Summary for the archive

`DECISIONS.md` is the chair's binding verdict for the KNOTWELL v1 master design set. Three judges ruled on five explore drafts. The file ranks second in authority, under the owner's words and above `FUN_OVERHAUL.md` (FO), which it amends 28 times.

It fixes the name KNOTWELL, "Climb together. Fall alone.", with FRAYWELL, SKYKNOT and SKYFLOOR as fallbacks. It commits the Firefly Frog as the hero behind an `IHeroBody` interface, with growth shown as light, never size, and a candle (the Wick) as the fallback. It sets the world as four rings (Well, Sky, Space, Beyond), where every sky is someone's well. Play is a Climb of 20 numbered monster doors: Landings after 5 and 15, a Keeper at 10, a Warden at 20. Forks, Heart doors (announced betrayal), Knot/Cut pacts and 10 bot Rivals make the party layer. Growth runs on three tracks: Glow, Boons and Tower Rank.

It scripts the first climb door by door with clocks and firefly totals, lists 42 rooms (34 MUST), sets milestones M0, A (the ~11 min Quick Climb and free demo) and B (the ~24 min Full Climb), fixes a 30-term glossary and a retired-words list, logs 20 split rulings, and records the Unity and Steam project state.

The goal was a funny, replayable 8-seat party climber with betrayal, sold on Steam for $7.99 with cosmetics only. v2 keeps the frog, the well, the verbs, growth-as-light and the tech. It drops the door run and all betrayal.

---

## Reusable for v2

Each row names where the idea sits in the source, why it fits the v2 pillars, and what must change.

### World and lore

| Idea | Where | Why it fits | v2 note |
|---|---|---|---|
| **Concentric world**: the Well at the centre, then the Sky, Space and Beyond. WORLD Law 1: each layer's exit is the next layer's centre. Law 4: up is outward. | §4 World; §10 #2 | P2: one rule explains the whole map. P6: rings become regions, from the starter zone outward. | Keep the rings. Scope v2 to the Well and the Rim; later rings are expansions. |
| **The Revelation**: "every sky is someone's well". Trailer line: *Your sky is somebody's floor.* | §1; §4 World | P2: the frog-in-a-well idiom turned into the story's big truth. | Keep as the story spine and the act-one payoff. |
| **The idiom on the first-frog statue** (우물 안 개구리 / 井底之蛙) in the well bottom. | §6 row 1 | P2 and P3: a real, old saying, known in Korean and Chinese, gives the world a root. | Keep the statue as the first lore object a player sees. |
| **The Mouth**: the sky opening overhead, a 31° "coin" 180 m up at the bottom, widening 31° → 37° → 44° → 56° → 74° as you rise. | §4 Climb; §6 row 1; §10 #16 | P1: a landmark visible from anywhere, and progress shown by the world, not a HUD. | Keep as the main landmark. Re-key the angles to story acts or heights. |
| **The Braid**: strands that climb the shaft; Landings sit on strand tops. | §4 Climb; §6 row 10 | P6: gives the well a vertical geography for one connected world. | Strands can be districts or routes joined by bridges. |
| **The Window** (`br_window`): a crack onto the real shaft showing other strands, hundreds of lanterns, and the Mouth still a coin. | §6 row 7 | P6: shows a big, lived-in world beyond you. P2: scale grows as you climb. | Turn into vista points. The lanterns can be other towns. |
| **★1 Out of the Well**: a 26 s reveal with free look from 21 s, ending on the walkable **Rim** with Glide on and the stars of Space seen through a tear in the dome. | §5 ★1 row; §6 row 30; §8.2 #15 | P2: a clear act-one climax. P6: the Rim is a new region, not a results screen. | Keep as the first big story beat. |
| **Later rings as a roadmap**: movement verbs Glide (Sky), Drift and Light-Lag; Wardens the thunderhead heron (Sky), Chan Chu the moon toad (Space) and the Watcher (Beyond); molts such as the Glider molt and the Moon Toad helmet. | §2 Why the frog; §7 LATER; §10 #29 | P2: each ring brings a new region, a new body part and a guardian from the same frog myth. Chan Chu is real folklore. | Keep as the expansion plan. |
| **Tone rule "dread, then a waltz"**: dark danger places with self-lit tells, warm safe places; per-layer palettes. | §8.1 Pillars; §8.1 Presentation; §9 file 09 | P1: safe vs unsafe reads at a glance. | Wilds dim with glowing tells; towns warm. |
| **World law A, "light draws hunters"** (reader's synthesis): the eel lunges at whoever is lit (`fog_stair`); the catfish swallows the brightest light (`sunken_bucket`); the Jar drops on the brightest frog (`warden_the_jar`); the Ash Axeman kneels only in the dark. | §6 rows 8, 29, 36, 41 | P2: growth is light, so power and risk are one idea. P1 and P4: learn it once, use it everywhere. | Candidate core rule of the v2 world. |
| **World law B, "noise wakes things"** (reader's synthesis): `echo_warren` hunts your last croak; `web_spider` drops on whoever croaks; `br_sleeping_toad` stirs at one loud croak. | §6 rows 13, 28, 34 | P2: a second simple, consistent rule. P6: croaking is a group decision. | Candidate core rule, paired with law A. |
| **Monsters are never killed.** | §4 Rooms; §10 #7 | P2: a tiny frog does not kill a heron, so the world's rules stay true. | Keep as the encounter rule. Teach it in the first minutes (P1). |

### Characters

| Idea | Where | Why it fits | v2 note |
|---|---|---|---|
| **Firefly Frog body**: an upright, bean-shaped froglet, two dome eye-bumps, a round face with no lips and no droopy lids (the anti-Pepe rule), dart-frog colours. | §2 Body | P3: readable and memorable; the anti-Pepe rule protects the brand. | Keep as the player species' base body. |
| **Growth shown on the body**: belly glow brightens, one orbiting firefly per Glow Level, markings light up; a Crown glow halo at Lv10. | §2 Health and growth; §10 #18 | P6: other players read your progress in town. P3: a clear visual story of "a nobody frog getting brighter". | Keep. |
| **Parts on fixed sockets**: Awakenings add a glowing tongue tip or a bigger throat sac; each layer's molt adds parts the same way. | §2 Health and growth | P3: change you can see. P5: every hat fits every molt. | Keep. |
| **Seat Hue**: a fixed rim-light colour per player from an 8-colour, colour-blind-safe palette; it drives name tags; a cosmetic never overrides it. | §2 Seat Hue | P6 and P1: find your friends in a crowd, fast. | Keep for party members. Drop its blame-tag use. |
| **Named frogs**: Kestrel (the show-off who gets tongued off his pad for the first laugh), Moss (the helper who shoves door 1 with you), Vex; 10 named frogs in all. | §5 doors 0, 1, 11; §10 #27 | P3: raw material for sincere, specific townsfolk and quest companions. | Recast as honest NPCs. Vex needs a new, non-betrayal role. |
| **Onlooker chorus and short barks**, such as a one-line reunion bark. | §8.1 Social; §8.2 #11 | P3 and P6: a world that notices you. | Rewrite as NPC ambient lines in towns. |
| **Pond-predator roster**: heron, snapping turtle (`snapper_crossing`), pike (`lily_raft`), eel (`fog_stair`), snake (`snake_coil`), moss snail, web spider, glow-moths and moth (`echo_warren`, `moth_library`), catfish (`sunken_bucket`), the giant sleeping toad, the Jar. | §6 rows 5, 6, 8, 9, 13, 15, 28, 29, 33–36 | P2: real dangers to a small frog in a well; no explaining needed. P3: one silhouette, one behaviour each. | Good seed for the v2 creature list. |
| **The Jar as the Well's Warden**: a house-sized jar lowered onto the brightest frog. | §6 row 29 | P2: a frog trapped in a jar is the well story's own fear. | Keep as the Well's big threat. Its P1/P2 phases need re-work (see Conflicts). |
| **Chan Chu, the moon toad**, as a future Warden. | §2; §7 LATER | P2 and P3: real myth, same species. | Keep for the Space ring. |

### Frog mechanics

| Idea | Where | Why it fits | v2 note |
|---|---|---|---|
| **Three verbs**: Tongue (grab, grapple, catch, carry; also Interact), charged Hop, Croak (pulse, sustain, revive, Chorus). | §2 Verbs | P4: learnable in a minute. P5: Tongue = Interact, so one button does "the thing". | Core controls. |
| **8 bindings in total.** | §7 MUST-A; §8.1 Climb and doors | P4 and P5: a small, fixed control set. | Keep the cap. |
| **Verb ranks I–IV**: rank III is the Awakening (Air Hop, Long Tongue, Twin Toll); rank IV the Mastery (charged 3.0 m hop, 8 m chain-grapple, Thunder Croak). | §5 table; §10 #19 | P6: new moves open new routes, a natural open-world gate. P1: the move shows on the frog. | Keep as the traversal-unlock spine. Show how a rank is earned (see Conflicts). |
| **Health as 3 back spots**: a knocked-out spot can be caught within 3 s; at 0 spots you go Dark and become a tadpole ghost; hold Croak 2 s over the egg to revive; free revives at Landings. | §4 Failure; §8.1 Health; §10 #25 | P1: health is on the body. P6: helping a stranger is one tongue flick or one held croak. | Keep. |
| **Co-op actions with no menu or pact**: shove a giant door with two frogs; carry an egg in pairs; two frogs croak within 0.3 s; tongue-haul a friend up a wall; a Chorus lifts the Jar; the tongue-catch Trust Fall; tongue an air bubble to a friend; stack frogs into a tower. | §6 rows 3, 9, 11, 14, 24, 29, 36 | P6: drop-in co-op that strangers understand by watching. | Keep as the co-op grammar for world encounters. |
| **Glide** as the Sky's movement verb, with the Glider molt. | §4 Climb; §8.2 #7 | P6: a traversal unlock that opens the Rim and the Sky. | Keep. |
| **Frog-verb tricks against monsters**: tongue the heron's dropped feather and it never returns; tongue the snake's tail into its mouth and it bites itself to sleep. | §6 rows 5, 15 | P3: specific, funny, frog-true solutions. | Keep the idea; hint these openly (P1). |
| **NoiseBus and an inverted GazeCone** (the moss snail moves only while nobody watches it). | §6 rows 33, 34 | P2: reusable systems that express world laws A and B. | Keep as code building blocks. |

### Encounters and places

| Idea | Where | Why it fits | v2 note |
|---|---|---|---|
| **Encounter anatomy**: one monster, one self-lit cue, one plain rule of 14 words or fewer, a shared-fate gimmick, mites. | §4 Rooms; §10 #7 | P1: a rule in 14 words is readable. | Keep for world creatures and quest set pieces. Drop hidden clears and seeded Twists (see Conflicts). |
| **"Built only from lessons everyone was taught"** (the Keeper). | §6 row 17 | P1 and P4: bosses test what the game already taught. | Keep as a rule for every story boss. |
| **Breathers as world spots**: jar rooms with mites to pop, a window vista, a sleeping threat to sneak past, a gold treasure room. | §4 Doors; §6 rows 7, 16, 18, 28 | P6: the small points of interest an open world needs between big beats. | Re-use as places on the map. |
| **Co-op toys** as town activities: Frog Stack, Fly Catch, Big Toad (everyone steers one toad suit; inputs summed). | §6 rows 11, 12, 37 | P6: towns need things to do together. They are co-op, not betrayal. | Keep as optional town games. |
| **The Grip Wall** (PEAK-style climb with per-frog grip, moss holds drying out, friends tongue-hauled up). | §6 row 24 | P2: climbing the well wall is the story. P6: a co-op set piece. | Keep as a world set piece; no tether. |
| **The Rematch feeling**: a beaten threat at its old numbers (`OLD TIME 1:12 → 0:18`); the Warden's first phase flattens old monsters. | §5 door 18; §6 row 29; §10 #12 | P2 and "fair progress": going back to an early area and breezing through proves growth. | Make early areas feel easy on return; no separate door type. |

### Progression, economy and ethics

| Idea | Where | Why it fits | v2 note |
|---|---|---|---|
| **Fireflies are XP only, never a currency.** | §10 #17 | P5: one meaning per thing. | Keep. |
| **Glow curve** 15·(n−1)(n+2)/2 (thresholds under Key numbers). | §8.1 Growth; §5 Growth check | A tested starting curve. | Keep as the persistent level curve; retune from doors to minutes and quests. |
| **Everything pays**: the Legend track pays even on failure; a failed room pays 50%; results always pay; first-time-only death rewards. | §4 Growth, Failure; §8.1 Meta | "Addictive but fair": failure never wastes time. | Keep for quests and encounters. |
| **Rank Sync**: a switch that turns talents off. | §10 #22 | P6: friends at different levels can play together, like an MMO level sync. | Reshape as automatic sync when a low-level friend joins. |
| **Light classes as sidegrades**: 3 open classes, a Signature on the Power-button hold; Tree Frog is one class. | §4 Growth; §8.1 Growth; §8.2 #7; §10 #24 | Owner decision 1 asks for light classes or roles. | Keep a few open sidegrades. Make all of them visible (see Conflicts). |
| **Bestiary**: one page per monster, stamps Seen, Survived, Cleared and Hidden clear; your first death fills a tip; a hat every 4 pages. | §8.1 Meta; §10 #23 | P1: deaths teach. P5: one place for monster facts, so no wiki. | Keep. |
| **Pearls, the one meta currency**, spent at the Mirror (try-on). Earned and paid catalogues never overlap. | §10 #21; §8.2 #20 | Owner keeps skins and a cosmetic shop. P5: one currency. | Keep. |
| **Supporter Sets as Steam cosmetic DLC**, checked with Facepunch's DLC-installed call. No ISteamMicroTxn (needs a server with the publisher key) and no Steam Inventory (creates a trade market). | §8.2 #20; §11 #13 | Fair, server-free paid cosmetics that fit host-mode lobbies. | Keep. |
| **Retention ethics**: cosmetics only, direct-priced; no pass at launch; Well-Rested; no streaks or daily bonus; a bookmark on every hook; the gentle break line; a "Worth it?" tap with a revert rule; build-failing enforcement tests; no invented rarity percentages; a published odds page. | §8.1 Presentation and business; §8.2 #2; §8.3 | The brief's "addictive-but-fair". Well-Rested is also a known MMO habit. | Keep as v2 ethics rules. |
| **+50 Pearls, one time, published**, on first surfacing. | §8.2 #17 | A clear, honest reward for the act-one climax. | Keep for the first time out of the well. |
| **The pull-back**: a player-steered camera pull-back up the shaft as the Mouth widens, with a coin falling; then a free hat. | §5 Keeper ceremony | P2: progress shown as world scale, not a number. | Keep for story milestones. |
| **Boon names as a name pool**: Shatter Croak, Spring Legs, Tell-Sight, Sure Tongue, Lifeline, Deep Cheeks, Last Gulp; Legendaries Moon Hop and Time Gulp. | §7 MUST-A | P3: short, specific, frog-flavoured names. | Reuse names for charms or perks if v2 keeps a small slot system. |

### UI and clarity

| Idea | Where | Why it fits | v2 note |
|---|---|---|---|
| **The System line format**: a one-line `[ BRACKETED ]` window that names a change and its cause; never a stat sheet; "the System never lies". | §8.1 Pillars; §10 #28 | P1: every change comes with its reason. | Keep the format. Give it an in-world speaker (see Conflicts). |
| **`[ NOTED ] That was not the intended solution. Keep it.`** on any unintended clear. | §8.2 #25 | P3: a warm, human line that rewards creative play. | Keep. |
| **Interruption caps**: one full-screen card per door; secret quests as a banner, not a card. | §5 Pacing; §8.1 Growth | P4 and P5: nothing arrives in a pile. | Keep: at most one full-screen card per quest step. |
| **Staged teaching**: exactly 5 systems before the first boss, then one new system per stop. | §5 Pacing | P4. | Keep, per story beat instead of per door. |
| **Feel target**: about every 90 s the player got stronger, laughed, or saw something bigger; measured in greybox. | §5 Pacing | P1 and P4, measurable. | Keep for open-world routes. |
| **Information cap**: a door plaque shows exactly 4 things. | §4 Doors; §10 #5 | P1: a sign never says more than you can read in a glance. | Keep the cap for quest boards and signs. |
| **"The map"**: a UI Toolkit panel, on the hub wall, in pause and under the results counter; the plain word "map", not a new noun. | §4 World; §8.2 #13 | P5: one map, reachable from pause in 2 inputs. | Keep the plain word and the pause access. |
| **Word discipline**: fixed glossary spellings; coin no new player-facing nouns; a retired-words list. | §9 Rules; §10 | P4 and P5: fewer words to learn. | Keep the discipline; make the v2 list far shorter. |
| **First-session shot list with clocks**: hatch in 3 s, Lv2 at ~0:20, first laugh by 0:30, door 1 at 0:35. | §5 door 0; §6 row 2 | P4: control in seconds, beating the 60 s target. | Keep the method; re-author the beats. |
| **The hub is the title screen**: black water, 8 eggs, the ring map, the Mirror, the statue. | §6 row 1 | P4: the menu is the world, so play starts at once. P6: 8 eggs show 8 player slots. | Keep the in-world start; remove the difficulty doors (see Conflicts). |
| **Death tips and a 3 s fall replay** (without blame). | §7 MUST-A | P1: you see why you fell. | Keep. |
| **Plumbing**: Localization tables from day 1 (English; Korean via a TextMeshPro CJK subset), a streamer-safe toggle, a share card (group shot plus vista). | §7 SHOULD 1–3; §8.2 #27 | P6 sharing; Korean fits the idiom's origin. | Keep. |

### Art and audio

| Idea | Where | Why it fits | v2 note |
|---|---|---|---|
| **Agent-built hero**: Blender-Python mesh (Blender 5.2); minimal rig with hat, face, back and belly sockets. | §2 How it is built | Buildable, diffable, testable by agents. | Keep. |
| **100% procedural motion**: hand-written 2-bone leg IK; spring bones on throat sac, eyes and hat; a Catmull-Rom tongue tube with overshoot; PrimeTween squash and stretch; a local ragdoll never networked. | §2 How it is built | P3: lively bodies with no hand animation. Tech: the ragdoll never costs bandwidth. | Keep. |
| **VFX without VFX Graph**: shells, shaders, Shuriken and Cinemachine. | §6 MUST-B; §8.2 #22; §11 #17 | Tech: VFX Graph was still preview for URP per the source. | Keep for v2's first release. |
| **Self-lit tells, dark danger places, warm safe places, per-layer palettes.** | §8.1 Presentation; §9 file 09 | P1 and P2. | Keep. |
| **Croak echo, pentatonic croak audio, positional cues.** Named only; the detail lives in `09_ART_UI_AUDIO.md`. | §8.1 Presentation; §9 file 09 | P1: sound shows where things are. P6: a group Chorus sounds like music. | Keep. |
| **Proximity voice**, friends-only and opt-in. | §7 LATER | P6: meeting players feels social. | Consider opt-in for v2 towns. |

### Tech and method

| Idea | Where | Why it fits | v2 note |
|---|---|---|---|
| **Package set** (full list under Key numbers). Add the Facepunch transport, Facepunch.Steamworks and `com.unity.localization`; remove purchasing, collab-proxy, legacy analytics 3.x and xr.legacyinputhelpers. | §12 Package manifest | Still valid from v1. | Keep. |
| **Bootstrap checklist**: first open writes `ProjectVersion.txt`; git with Unity.gitignore and LFS; static reset via `RuntimeInitializeOnLoadMethod` with a test; bake APV and NavMesh on the logged-in desktop, never `-nographics`; only generators write scenes and prefabs; add windows-il2cpp before release; NGO 3.0 / 6.7 LTS as a 2027 milestone. | §12 | Still valid. | Keep. The project state is as of 2026-09-29 and may be stale. |
| **Split assemblies**: `Game.Core`, `Tower`, `Rooms`, `Bots`, `Net`, `UI`, `Editor`, `Tests`. | §12 | Clean build boundaries. | Keep the split; rename `Tower` and `Rooms` for a world and quests. |
| **Data → generators → seeds**: RoomDef JSON with `wish[]` and `homage[]` tags. | §4 Rooms; §8.2 #28; §12 | Fits a mostly-agent team. | Keep the pattern with region, quest and encounter definitions. Tag each with a pillar and a story beat. |
| **`IHeroBody` contract, capsule first**: `SetSpots`, `SetGlow`, `PlayAwakening`, `TongueOrigin`, `CroakFX`, sockets. | §2 Code contract | Gameplay code never waits for art. | Keep the contract. |
| **Dev network**: UTP + Multiplayer Play Mode with 1 host + 3 virtual players; the Facepunch transport on Spacewar AppID 480; a real two-account Steam test at every milestone. | §12 | P6 tested daily. | Keep. |
| **Netcode test at 150 ms RTT and 2% loss**, with a fallback if tongue-on-player feels unfair. | §7 M0 | P6: fair over real networks. | Keep the conditions; test tongue on props, catch and revive. |
| **Performance budget from week 1**: host simulation ≤8 ms and frame ≤16.6 ms at 1080p with 8 seats. | §12 | Tech. | Keep the numbers; the "2 live rooms" basis must change. |
| **Steam lobbies**: friend and private lobbies plus LAN; public matchmaking and mid-session drop-in were SHOULD. | §7 MUST-A; §7 SHOULD 4 | P6. | Keep lobbies; drop-in must become core in v2. |
| **Steam Timeline** (Facepunch `SteamTimeline.cs`): instant and range events, game phases with tags and attributes, overlay links. Featured markers included Awakenings, class reveals, gold doors, the Trust Fall catch and ★1. | §8.2 #21; §12 | P6: easy clip sharing. | Keep; drop the betrayal markers. |
| **Growth CI test**: simulate the median first session from the JSON tables; fail the build if Lv5 or Lv10 land outside their windows. | §5 Growth check | P4: pacing guarded by a test. | Keep the pattern for v2's first hour. |
| **Wish-coverage test and fidelity KPI**: at least 70% of first sessions reach each owner wish by minute 60; at least 60% reach ★1. | §8.2 #28 | P1 and P4, measured. | Keep; add a pillar trace. |
| **Soak test**: 7 host bots, clears on at least 90% of 50 seeds. | §7 Gate to B | Stability check. | Keep with bots walking the world. |
| **Agent tooling**: Unity CLI + Pipeline + the CoplayDev bridge, plain batchmode as fallback; not the official Unity MCP or Unity AI. | §8.3 Council cuts | Method, still valid. | Keep. |
| **Telemetry**: opt-in, no personal data; the "Worth it?" tap and a funnel. | §7 MUST-A; §12 | Fair and measurable. | Keep. |
| **Human gates**: Gate A (readability) and Gate B with the owner plus at least 4 friends; one remediation pass before any fallback; no public frog art before Gate A. | §2 Gates | P3: checks the design reads as genuine to real people. | Keep. |
| **Scope discipline**: tags MUST-A / MUST-B / SHOULD / LATER, numbers labelled as greybox hypotheses, a slip order and a never-slip list, cut from the bottom. | §7; §9 Rules | Method for a tiny team. | Keep. |
| **Store model**: $7.99 plus a gift 4-pack; a free demo; free weekends; creator keys; each new layer a free named update; cosmetics only. | §8.1 Presentation and business | Fits "skins and a cosmetic shop" and fair progress. | Keep; rings become free expansions. |
| **Frog Sqwad positioning**: growth is light, never size or hitbox; never say "eat to grow". | §2 Positioning; §12 Competitor | P3: a clear identity next to a live 8-player frog game (source: Steam app 3989960, https://store.steampowered.com/app/3989960/). | Keep. Lead v2 copy with the well and the story. |
| **Human tasks**: trademark search (USPTO classes 9 and 41, optionally 28; EUIPO; KIPRIS), domains, @playknotwell handles, a Steam Direct AppID, reading the Synty and Sonniss AI clauses. | §1; §12 Still open | Still needed for any name and any bought assets. | Keep. |

---

## Party-only (to archive)

These make sense only in the betrayal party game. None are built in v2.

| Item | Where | Note for the archive |
|---|---|---|
| **Party framing**: tagline "Climb together. Fall alone."; the "not well" joke; Heart-door copy "They might not cut it."; the fantasy's "scheming Rivals" and "if nobody cuts your knot first"; positioning rule 2 (lead store copy with betrayal). | §1; §2 Positioning; §3 | Half of the KNOTWELL name's rationale (see Conflicts). |
| **Heart doors (♥)**: announced betrayal, each with a co-op answer; the first at door 11, from door 6 in later climbs; a pool of 4: `heart_two_pads` (only two may leave; shove a friend off), `doppelfrog`, `heart_split_swallow` (share or swallow the jar; clown honk on a double swallow), `heart_tied_bridge`. | §4 Overlays; §5; §6 rows 19, 23, 31, 32; §10 #13 | The only place real betrayal happened. |
| **Knot / Cut / Duo**: a pact made at a Landing (see each other through walls, revive faster, Duo Boons); Cut = hold Shove 1.2 s while Knotted; the partner can hold on with the Tongue; the Knot spot at Landing 3; Duo Boons such as Frog Sling. | §5 L3, door 17; §8.1 Social; §10 #14 | The "knot" in KNOTWELL. |
| **Betrayal Cam** (a 0.8 s slow-motion replay with `[ TRAITOR ]`), the **WANTED poster** (one door), **Vengeance** (tongue-tag the traitor in the next shared room; returns exactly what was taken plus +1 card once per climb). | §4 Social; §8.1 Social; §8.2 #6; §10 #15 | Full revenge loop. |
| **Doppelfrog**, the Mafia / Among Us beat: "One of you is not a frog"; the Mimic blinks sideways; vote at the exit. Human-vs-human needs at least 3 humans and 5 voters; with fewer, "spot the Mimic" uses a bot Mimic, only humans vote, bots only point at public evidence. Also Mimic Climb (LATER). | §6 row 23; §7 LATER; §8.2 #12 | Never-slip item in v1. |
| **Secret-role plumbing**: host-salted private offers; secret-quest uniqueness goes to humans first. | §8.1 Growth; §8.2 #24 | The secret classes themselves are listed under Conflicts. |
| **Mischief and pranks**: always-on shove and a 1 m tug, mischief caps; tongue-on-player; tonguing Kestrel off his pad as the first laugh. | §4 Social; §5 door 0; §7 M0; §8.1 Social | In a shared world with strangers this becomes griefing. |
| **Tethers**: `sp_tongue_tether` (pairs tongue-tied together while the water rises; the Chained Together home), `heart_tied_bridge`, the shared tether script. | §6 rows 26, 32; §6 TEAMBOUND homes | The brief moves tethers out. |
| **Rivals as seat-fillers**: 10 named bot frogs fill every empty seat; the Rookie label; the Rival Register; the Drama Director's targets, limits and staged beats (Vex betrays Moss at door 11; "Bots gasp" at door 7); offstage Rivals take untaken fork sides. | §4 Social; §5; §7; §8.1 Social; §8.2 #11; §10 #27 | The frogs' names and personalities can move to v2 NPCs; the system cannot. |
| **Blame**: blame tags (friends and private lobbies only), Seat Hue as a blame colour, the lobby-type table, 2-flag kick-to-bot, "no human-vs-human Heart doors in public lobbies". | §2 Seat Hue; §7 SHOULD 4; §8.1 Social; §8.3 | — |
| **Betrayal crimson**: no cosmetic hue within 15° of it. | §2 Seat Hue | v2 may still want one reserved danger colour. |
| **Betrayal telemetry and markers**: Steam Timeline featured markers for Betrayal Cam and Vengeance; the rule "no results stat or title that counts betrayals"; "no bot votes on hidden information". | §8.2 #21; §8.3 | — |
| **Party modes and competitive toys**: Landing Party (a playlist of the toys), `toy_lily_sumo` (shove each other off shrinking pads), `toy_jar_tag` (tag with a jar over your head). | §4 Sessions; §6 rows 22, 25; §7 MUST-B | Candidates for the one documented, opt-in town side-mode hook. Build nothing now. |
| **The Watchers audience layer** (LATER; not defined in this file). | §7 LATER | Record only. |
| **Already cut in v1** (for the archive record): Soot, the 10 Knives, Tribunal, Notes, Pact Pot, Clue Composer, the Ledger overlay; Pinky Promise and Rumour Dice minigames; `weight_of_guilt`; "Belay or betray". | §6 Cut rooms; §8.3; §10 Retired words | Shows how far v1 had already trimmed betrayal. |

---

## Conflicts with the new pillars

| Item | Where | Pillar | Why it conflicts | Suggested v2 handling |
|---|---|---|---|---|
| **The Climb unit**: 20 numbered doors as 4 floors of 5; door numbers run on across layers; "Best door: 37" as the brag. | §4 World, Climb; §10 #3, #4 | P2, P6 | Progress is a number in a list of rooms, not a place in one world. | Connected regions. Brag with places and story beats. |
| **Rooms are baked shells on a 300 m grid under the shaft**; at most 2 rooms live at once. | §4 Rooms; §4 Doors | P2, P6 | A door leads to a room that is not where it seems, and there is no shared open space. | Streamed regions with their own performance budget. |
| **Door grammar**: suits ♠ Body, ♦ Mind, ♣ Together; letters A/B/C/E; skulls; prize icons; paired doors; a 4 s walk-vote. | §4 Doors; §5 Seeded climbs; §10 #5 | P2, P4 | A card-game layer on top of a pond; lots to learn before it pays. | Plain signs and map markers. |
| **Forks and the Meeting Door**: a group door plus an E door (SOLO/DUO), a two-lock door, a key swap, one item through the window, a rescue rope at 45 s, offstage Rivals. | §4 Doors; §8.2 #11; §10 #9 | P4, P5 | Many rules for one split. | Cut. Groups split and meet freely in an open world. |
| **Per-climb reset**: a new layer re-hatches you at Lv1; the Body track and Boons reset every climb. | §4 Climb, Growth | P2, P6 | In a persistent world, losing your light has no story reason. | Persistent Glow. Any reset must be a story event. |
| **Too many growth systems**: Glow, verb ranks, Awakenings, Masteries, Boons (4 passive + 1 active, duplicates I→III, pick 1 of 3, a comeback 4th card, Duos, Legendaries), 9 classes, secret quests, Tower Rank F→SSS, talents, Rank Sync, Party Rank Up. MUST-B alone adds 16 Boons + 4 Duos + 4 Legendaries. | §4 Growth; §7 MUST-B; §8.1 Growth, Meta | P4, P5 | Far more than a low learning curve allows. | One level (Glow), one rank line per verb, a few open classes, cosmetics. |
| **Two currencies and a stall**: Wish Coins spent in a climb, Pearls as meta. | §7 MUST-A; §10 #21 | P5 | Two wallets for one small economy. | One earned currency. |
| **Hidden information by design**: hidden clears; 2 seeded Twists per room; `[ HIDDEN CONDITION DETECTED ]`; Hell always redacts the rule text; Sealed (redacted text, tells ×0.7) for +50% fireflies. | §4 Rooms; §5 door 13; §7 MUST-B; §10 #26 | P1 | The player is meant not to know. | Keep a "weird second way" but hint it. Redaction only as an opt-in challenge off the story path, or cut. |
| **"Which verb awakens follows usage"**, with no visible meter. | §5 Growth check | P1 | The player cannot see why they got Twin Toll and not Air Hop. | Show a usage meter, or let the player choose. |
| **Secret classes**: 6 of 9 classes are unlocked by private, salted secret quests. | §4 Growth; §7 MUST-B; §8.1 Growth; §11 #5 | P1, P5 | Hidden by design; needs a wiki. | Every class visible, each with a clear unlock quest. |
| **Difficulty and shared failure**: 4 difficulty doors at the well bottom from 0:00; Hard and Hell chained and unlocked per lobby; shared Team Lives (Easy unlimited, Normal 3, Hard 2, Hell 1); a failed room costs a life; Retry from door 11 after a wipe. | §4 Failure, Sessions; §8.2 #14, #16, #26 | P4, P6 | A choice before the first hop. A stranger's fall costs everyone; lobby unlocks block drop-in. | Personal respawn at the nearest safe spot. Challenge lives in optional areas. |
| **Session menu**: Quick Climb, Full Climb, Resume from any Landing, Landing Party, the Ascent, Retry from door 11, Daily Seed, Mimic Climb. | §4 Sessions; §7 | P5, P6 | Many ways in; an MMO feel needs one world you join and leave. | One world; save at towns. |
| **Seeded climbs**: debut rule, pool rule, no suit three times in a row, a forced gold door on floor 4, a 5% gold roll. | §4 Overlays; §5 Seeded climbs | P2 | A persistent world should stay the same place. | Use seeding only for a repeatable side area, if at all. |
| **The Keeper Landing ceremony** stacks 7 beats in about 40 s (choice unlocked, Party Rank Up, Tower Rank, pull-back, free hat, a teaser, Climb on / Rest). | §5 Keeper ceremony | P1, P4 | Too much at once. | Keep the pull-back and the hat; put ranks in one line. |
| **The Tower frame**: the System is "the Tower's voice"; "Tower Rank"; a `Tower` assembly. | §10 #22, #28; §12 | P2, P3 | There is no tower in a well. A floating game-voice reads as generic, not genuine. | Give the voice an in-world speaker. Rename the rank. |
| **Off-theme rooms**: `bell_golem` and its Keeper (a golem), `lamp_knight` (a knight), `slime_foundry` (a Chrono-Slime from a clockwork source room), `glitch_eye` (a glitch), `mirror_toll`, `ash_axeman` (an executioner). | §6 rows 4, 14, 17, 20, 27, 40, 41 | P2 | They come from the old candle GDD, not from a pond. | Re-skin as well creatures or cut. `bell_golem` was v1's style-lock room; bells can stay only if the world explains them. |
| **Bots dressed as players**: Rivals fill every empty seat; the Drama Director stages their drama; Rookie labels. | §4 Social; §8.1 Social | P3, P6 | Staged drama is not genuine; the "others" in the world should be real players or clear NPCs. | NPCs are plainly NPCs. |
| **Name and store copy lean on the party game**: the tagline, the hook "Monster doors", the "not well" joke, "lead with betrayal". | §1; §2 Positioning | P2, P3 | Half the name's reasons leave with betrayal. | The synthesis must re-justify KNOTWELL ("a knot" = a group of toads survives) or pick a new name. Trademark is still not cleared. |
| **The Wick fallback**: a candle hero with a flame axis. | §2 Code contract, Gates | P2 | A candle is a different world; the owner chose frogs. | Keep `IHeroBody`; drop the Wick world, or keep a frog remediation pass only. |
| **"Chorus" names two things**: a Croak use and a Boon. | §2 Verbs; §7 MUST-A | P5 | One word, two meanings. | One meaning only. |
| **Glossary size**: about 60 named terms across 29 player-facing rows. | §10 | P4 | Too many words to learn. | A short v2 list. |
| **Fireflies ride in your cheeks unbanked**; a 70/30 clear/loose split; spills return to their owner. | §8.1 Growth; §10 #17 | P4 | An extra rule to learn. | Bank at town lanterns, or automatically. |
| **Public matchmaking and mid-session drop-in were only SHOULD.** | §7 SHOULD 4; §11 #14 | P6 | v2 needs drop-in without friction as a core feature. | Promote to MUST. |
| **The Jar's phases**: "flatten old monsters at their old numbers" and "a Chorus lifts the Jar", tuned to a run's numbers. | §6 row 29 | P2 | Built on the door run. | Keep the Jar; re-design its fight for the world. |

---

## Key numbers and names

### Tech (as of 2026-09-29)

| Item | Value |
|---|---|
| Engine | Unity 6000.3.25f1, URP 17.3.0 |
| Netcode | NGO 2.13.3, host mode; NGO 3.0 / 6.7 LTS named as a 2027 milestone |
| Other packages present | Multiplayer Play Mode 2.0.2, Cinemachine 3.1.7, Animation Rigging 1.4.1, Input System 1.20.0, Test Framework 1.6.0, AI Navigation 2.0.15, Splines 2.9.1, Timeline 1.8.13, PrimeTween 1.4.11 (npm scoped registry) |
| To add | Facepunch transport, Facepunch.Steamworks, `com.unity.localization` |
| To remove | `com.unity.purchasing`, `com.unity.collab-proxy`, legacy `com.unity.analytics` 3.x, `com.unity.xr.legacyinputhelpers` |
| Steam | Spacewar AppID 480 until a real AppID; friend and private lobbies plus LAN |
| Tools | Blender 5.2; Unity CLI; Windows Mono player only (add windows-il2cpp before release) |
| Unity project | `KNOTWELL/`, productName `KNOTWELL`; never opened in the Editor as of 2026-09-29 |
| Netcode test | 150 ms RTT, 2% loss |
| Performance | host simulation ≤8 ms; frame ≤16.6 ms at 1080p; 8 seats |

### Hero and verbs

| Item | Value |
|---|---|
| Seats and hues | 1–8 players; 8-colour colour-blind-safe Seat Hue palette |
| Health | 3 back spots, same for every frog; hitbox never changes |
| Catch window | 3 s |
| Revive | hold Croak 2 s over the egg; free revives at Landings |
| Glow Levels | Lv1–10; one orbiting firefly per level; Crown glow at Lv10 |
| Verb ranks | I–IV; Awakenings at Lv5, 6, 7 |
| Rank III names | Air Hop, Long Tongue, Twin Toll (never "Big Voice") |
| Rank IV names | charged 3.0 m hop, 8 m chain-grapple, Thunder Croak |
| Bindings | 8 |
| Lamp-Knight sync | two croaks within 0.3 s |

### Glow curve: 15·(n−1)(n+2)/2 fireflies to reach level n (reader's arithmetic)

| Level | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|
| Threshold | 30 | 75 | 135 | 210 | 300 | 405 | 525 | 660 | 810 |
| v1 first-climb banked total at that level | 30 | 105 | 157 | 215 | 365 | 435 | 533 | 677 | 836 |

### World

| Item | Value |
|---|---|
| Rings | the Well, the Sky, Space, Beyond; then the Revelation and Cycle 2 (LATER) |
| The Mouth | 31° at the bottom (a coin 180 m up) → 37° → 44° → 56° → 74° |
| Well bottom | black water, 8 eggs, ring map, Mirror, first-frog statue |
| ★1 reveal | 26 s, free look from 21 s, ends on the Rim with Glide on |
| Wardens | the Jar (Well), the thunderhead heron (Sky), Chan Chu (Space), the Watcher (Beyond) |
| Molts | Glider molt (Sky), Moon Toad helmet |
| Ring verbs | Glide (Sky), Drift, Light-Lag |

### Pacing (v1 values; greybox hypotheses)

| Item | Value |
|---|---|
| Hatch | 3 s; Lv2 at ~0:20; first laugh by 0:30 |
| Feel target | a beat about every 90 s |
| Rule length | 14 words or fewer |
| Landing | 40 s warm stop |
| Door lengths | breather 15–30 s; rule door 45–90 s (cap 150 s); set piece 90–150 s; Keeper ~90 s; Warden ~180 s; average ~57 s |
| Sessions | Quick Climb ~11 min; Full Climb ~24 min |
| First Awakening | ~7:00 |

### Economy and fairness

| Item | Value |
|---|---|
| Price | $7.99, plus a gift 4-pack; free demo |
| First surfacing | +50 Pearls, once, published |
| Failed attempt | pays 50% |
| Bestiary | 14 pages; a hat every 4 pages |
| Cosmetics | 8 slots; 12 earned in A, 24 in B; Hat, Skin, Glow colour; 2 Supporter Sets as Steam DLC |
| Boon slots | 4 passive + 1 active |
| Sealed | +50% fireflies; tells ×0.7 |

### Tests and KPIs

| Item | Value |
|---|---|
| Growth CI | fail if Lv5 lands outside doors 6–8 or Lv10 outside doors 17–19 |
| Wish coverage | ≥70% of first sessions reach each wish by minute 60 |
| Act-one reach | ≥60% of first sessions reach ★1 |
| Soak | 7 bots; clear on ≥90% of 50 seeds |
| Human gates | owner plus at least 4 friends |

### Names to keep consistent

| Name | Status for v2 |
|---|---|
| KNOTWELL (fallbacks FRAYWELL, SKYKNOT, SKYFLOOR; retired KNOTSPIRE) | Open: the synthesis decides. Never "Knot Well" or "Notwell". |
| Firefly Frog | Keep |
| The Well, the Sky, Space, Beyond, the Revelation | Keep |
| The Mouth, the Braid, the Rim, ★1 Out of the Well | Keep |
| Fireflies (XP only), Glow Level, Crown glow | Keep |
| Tongue, Hop, Croak, Chorus; Awakening, Mastery; Air Hop, Long Tongue, Twin Toll, Thunder Croak; Glide; molt, Glider molt | Keep ("Chorus" for the Croak use only) |
| Spots, Dark, tadpole ghost | Keep |
| Pearls, the Mirror, Supporter Sets, Well-Rested | Keep |
| Bestiary | Keep (never "Codex") |
| The System, `[ NOTED ]` line | Keep the format; rename the speaker |
| Kestrel, Moss, Vex | Keep as characters; drop the Rival role |
| Chan Chu, the Jar, the thunderhead heron, the Watcher | Keep |
| Tree Frog | A class only, never the molt |
| Room ids worth keeping: `hub_well_bottom`, `hatch_pond`, `br_window`, `heron_shadow`, `lily_raft`, `fog_stair`, `snapper_crossing`, `echo_warren`, `snake_coil`, `moss_snail`, `web_spider`, `moth_library`, `sunken_bucket`, `br_sleeping_toad`, `sp_grip_wall`, `warden_the_jar`, `rim_surface`, `toy_frog_stack`, `toy_fly_catch`, `toy_bigtoad` | Keep as seeds for v2 place and creature ids |
| Tower Rank, Climb, Door number, Plaque, suits, Landing, Keeper, Fork, Meeting Door, Boon, Wish Coins, Rivals, Drama Director | Retire or rename (door-run terms) |
| Heart door, Knot, Cut, Duo, Betrayal Cam, WANTED, Vengeance, Doppelfrog, Mimic | Archive |

**Stay retired in v2** (from the source's retired-words list): wax, Snuffed, Scorched, Embers, Drips, Sparks, Wickbook, Soot, Knives, Tribunal, Ledger, Altar, trait, Anvil, Origins, Codex, "eat to grow", "Megafrog", "Big Voice", "Tree Frog molt", Belay.

<!-- END -->
