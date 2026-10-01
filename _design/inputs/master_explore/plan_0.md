# plan:0 (saved from master-design-unity run wf_27fa7ac0-6ba)

# KNOTWELL integration plan (fidelity-first)

**Lens.** The pass/fail test is simple. In their first 60 minutes, a new player meets every wish from the user's four messages, whether they play solo with Rivals or with friends. The overhaul's engine carries those wishes: growth at every door, one-rule monsters, cheap failure and betrayal as a punchline. The frog-in-a-well is the spine. FUN_OVERHAUL (FO) is binding. Items tagged **[AMEND]** are small proposed amendments that need sign-off. Everything else places content FO already decided.

---

## 1. Wish trace: where each wish lands in the first hour

| User wish (msg) | Delivered by | First seen |
|---|---|---|
| Name it (1) | **KNOTWELL** title card over the well bottom. It is blocked on the USPTO/EUIPO/KIPRIS check (FO §2.1). | 0:00 |
| Frog in a well → sky → space → bigger (2) | Hatch at the well bottom. The Mouth grows 31° → 74°. Window breathers at doors 4 and 13. The steered pull-back at the Keeper. ★1 Out of the Well. You land on the walkable **Rim**, where a tear in the dome shows the stars of Space (WORLD Law 3). The concentric bands of the map. | 0:00 / 4:00 / 10:40 / ~26:00 |
| Tower, dungeon and maze; layers from the centre outward (2) | The Braid is the tower. Rooms are dungeon cells inside the strands. Forks and `echo_warren` are the maze. **The map** draws Well → Sky → Space → Beyond as rings. | 0:00 (hub wall), ~4:30 |
| Randomized levels, a door on every level, 1A/1E, players meeting (1) | Lettered pairs from door 3. Forks at 12 and 17 (from climb 2 also at 7). The Meeting Door with a key swap. In solo, an **offstage Rival** takes the other fork **[AMEND]**. | 2:10 / ~13:00 |
| Monsters with weird clear conditions, not fighting (1) | `bell_golem` at door 2. Every rule door has a hidden clear and 2 Twists. | 1:00 |
| Increasing powers (1) | Glow level, verb ranks, the Shatter Croak gift, Awakenings, Boons, Rematch flattening | 0:20 / 2:00 / 6:40 / ~20:00 |
| The Tutorial Is Too Hard: brutal, lone protagonist, sabotage, team-up (1) | Hard and Hell doors chained shut at the hub. E doors are SOLO/DUO. `fog_stair` (TTITH floor 3), `doppelfrog` (floor 16), `tongue_bridge` (floor 61). Hard unlocks at the first Keeper. | 0:00 (visible), ~10:00 (unlock) |
| Mafia / Among Us (1) | `doppelfrog`, with a solo variant **[AMEND]**. The Mimic Climb lobby mode is LATER. | ~16:00 |
| Chained Together (1) | `tongue_tether` at door 8; `tongue_bridge` at door 11 | ~7:30 |
| PEAK (1) | `grip_wall` at door 15 (per-frog grip) | ~18:00 |
| TEAMBOUND modes (reference) | **Summit** → `grip_wall` and the Warden climb. **Chained ascent** → `tongue_tether`. **Downstream** → `lily_raft`. **Echo Chamber** → `echo_warren`, `lamp_knight`. **Delivery** → the egg in `snapper_crossing`. **Tower of Babel** → Frog Stack. **One Body** → `toy_bigtoad` (SHOULD). **Deep Dive** → `sunken_bucket` (SHOULD). | 2:20–18:00 |
| Co-op modes "and time" (1) | Read as timed play: visible room clocks, Quick/Full climbs, Rematch old-time vs new, the Chrono-Slime (`slime_foundry`), Daily Seed (LATER) | 1:00 |
| Mini side games to lighten the mood (1) | `toy_sumo` (door 6), Frog Stack (Landing 1), Jar Tag (Meeting room), `toy_flycatch` (door 16), Landing Party mode | ~4:40 |
| Skins, shop, make money (1) | A free hat at the Keeper. The Mirror with a Supporter shelf at the hub. The first Common purchase right after the first surfacing, via a one-time +50 Pearl bonus **[AMEND]** | 10:40 / ~27:00 |
| Top-tier visuals and animation (1) | Procedural frog rig, toon shader with a rim light, self-lit tells, juice (FO §6.2) | 0:03 |
| Fun, addictive, immersive, feels like progress (3) | The FO §3.5 cadence contract: a tick every 10–30 s, a Boon about every 2 min, a Glow level every 2–3 doors | continuous |
| Unity (4) | The UT stack. The data, generators and seeds pattern drives everything below. | — |

**How it is enforced.** Every RoomDef carries `homage[]` and `wish[]` tags. An EditMode test fails the build if the first-climb script plus a seeded climb 2 misses any wish tag. Telemetry tracks a **fidelity KPI**: the share of first sessions that reach each row by minute 60. The target is ≥ 70%, and ≥ 60% for ★1.

---

## 2. Unified structure

### 2.1 Hierarchy: World → Layer → Climb → Floor → Landing → Door → Room

| Level | Count | Rule | In the Well |
|---|---|---|---|
| **World** | 1 (Cycle 2 LATER) | Concentric. Each layer's exit is the next layer's centre (WORLD Law 1). "Up is outward" (Law 4). | The map on the hub wall |
| **Layer** | 4 + the Revelation | Well is doors 1–20, Sky 21–40, Space 41–60, Beyond 61–80 (FO §3.1). Each layer re-hatches you at Lv 1 and turns on one new movement verb. | Macro format "Tower" (WORLD §5.2) |
| **Climb** | 1 per layer | The unit of play. Quick is doors 1–10 plus the Keeper (~11 min). Full is 20 doors (~24 min). | — |
| **Floor** | 4 per climb | 5 door slots each. Global door number = 20(ℓ−1) + d. | One strand of the Braid |
| **Landing** | 5 positions | Foot (the hatch pond) → Landing 1 (after door 5) → Keeper Landing (after door 10; save point) → Landing 3 (after door 15) → Summit (the Warden at door 20) → the next layer's Foot, which is the Rim | Strand tops at y 0/30/60/90/120. The Mouth is **31°/37°/44°/56°/74°**, which matches WORLD §4.3 exactly. |
| **Door slot** | 20 per climb | Breather, pair, fork, Keeper or Warden, plus gold and Rematch overlays | Door frames cut into the strand's flank; the walk between doors is ≤ 5 s |
| **Room** | template × seed | JSON RoomDef → ScriptableObject plus a prefab, with 2 seeded Twists. At most 2 are live at once (forks), placed far apart and hidden per client (UT). | A "cell inside the wall", entered through a 0.4 s fade |

**Door grammar** (FO §3.2–3.4):
- **Breathers** are a single door that opens by itself.
- **Pairs** offer two of ♠A Body, ♦B Mind, ♣C Together and ♥ Heart. The party chooses by walking, with a 4 s majority.
- **Forks** offer A plus E. The party may split, and it meets again at the two-lock Meeting Door.
- **The plaque** shows WORLD §6.3's layer glyph plus FO's four fields: `◯ 12E`, suit, prize icon, skulls. The glyph is the one addition, and it costs nothing.

**Offstage Rival [AMEND].** FO says "bots never enter a door without a human", which leaves the solo fork and an unsplit party with no second key. Under this amendment, whichever fork door no human takes is taken **offstage** by a Rival volunteer.
- If the humans take A, Lumen ("I work alone.") takes E.
- If a solo human takes E, the rest of the party takes A.

Offstage bots are **not simulated**. They are parked and reappear at the Meeting Door carrying the missing key after the human's clear time plus 5–20 s, with one reunion bark ("Kestrel fell in twice."). There is no physics, no Ghost Sim revival, and it can never soft-lock.

**The map [AMEND; FO never ruled on the WORLD §11 astrolabe].**
- **What it is:** a UI Toolkit panel on the hub wall, in the pause menu and under the results door counter. It uses no binding, so the controls stay at 8.
- **What it shows:** concentric bands for the Well (centre), Sky, Space and Beyond, plus a blank outer band. Doors 1–80 spiral outward, and forks branch as lettered lobes (7A/7E). Your path is traced, and friends' best doors are pinned (FO §3.1).
- **Why:** it is the user's "layers from centre to outwards circle" at minute 0. It costs no GPU time.

### 2.2 Generator
- **Climb 1** in each profile is **authored** (§2.3), so every first hour is identical and fully testable.
- **Later climbs** use one replicated seed and follow FO's constraints:
  - forks at 7, 12 and 17;
  - Heart doors from door 6;
  - at least one gold door, forced on floor 4 if none has rolled;
  - one Rematch in doors 15–19;
  - one set piece in each half of the climb;
  - no suit three times in a row;
  - rooms respect their own door band.
- One seed rebuilds any failed bot soak exactly (UT).

### 2.3 The first Full Climb, door by door

| Door | Room | Why it's here (wish) | ≈ Clock |
|---|---|---|---|
| 0 | `hub_well_bottom` → `br_hatch_pond` | Hatch; tonguing Kestrel for the first laugh; Hard/Hell doors chained in view | 0:00 |
| 1 | `br_shove_door` (two-frog door + jar room) | Team-up is physical | 0:35 |
| 2 | `bell_golem` ♠ | First weird clear; Shatter Croak granted | 1:00 |
| 3 | 3A `snake_coil` ♠ / 3C `lily_raft` ♣ | First door choice; Downstream | 2:10 |
| 4 | `br_window` | Scale ("the well is huge") | 4:00 |
| 5 | 5A `heron_shadow` ♠ / 5B `echo_warren` ♦ | The maze; the heron foreshadows the Sky Warden | ~4:30 |
| L1 | Landing 1 (Mouth 37°) | Frog Stack (Babel), stall, jar lineup | 5:00 |
| 6 | `toy_sumo` | Side game | 5:40 |
| 7 | 7B `moth_library` ♦ / 7C `snapper_crossing` ♣ | Delivery; Tongue Awakening | 6:40 |
| 8 | `tongue_tether` (set piece) | Chained ascent | 7:30 |
| 9 | `br_gold` (scripted the first time) | Jackpot | 8:50 |
| 10 | `keeper_well` | CHOICE UNLOCKED, rank E, hat, pull-back to 44°, "Something is waiting in 12E." Quick Climb ends and saves here. | 9:30–11:00 |
| 11 | `tongue_bridge` ♥ | Knot and Cut; the Drama Director stages a bot Cut; Vengeance | 12:00 |
| 12 | Fork 12A `lamp_knight` ♣ / **12E `slime_foundry`** | 1A/1E, lone protagonist; Meeting room with Jar Tag and the rescue rope | 13:10 |
| 13 | `br_sleeping_toad` or `br_window` | Dread, then a waltz | 14:30 |
| 14 | `doppelfrog` ♥ | Among Us / Mafia | 15:30 |
| 15 | `grip_wall` (set piece) → Landing 3 (Mouth 56°) | PEAK / Summit | 17:00 |
| 16 | `toy_flycatch` | Side game | 18:30 |
| 17 | Fork 17B `fog_stair` ♦ / 17E `glitch_eye` | TTITH floor 3 ("cleared it in a weird way") | 19:00 |
| 18 | Rematch: `bell_golem` at its old numbers | Steamroll ("OLD TIME 1:12 → 0:18") | 20:30 |
| 19 | `br_jar` | Breath before the boss | 21:30 |
| 20 | `warden_jar` → ★1 → the Rim | Out of the Well; Glide works on the Rim; stars through the dome tear | 22:00–26:00 |

**Retry from the Keeper [AMEND].** Until a profile first surfaces, a climb that wipes after door 10 offers **"Retry from door 11"** alongside "Climb again". This protects the ★1 KPI without adding a noun. Climb 2 (about 27–51 min) is seeded and runs FO's second-climb rules.

---

## 3. Where each GDD room lives now

| GDD room | New id · type | Door band (Well) | Change |
|---|---|---|---|
| 6.1 golem_belfry | `bell_golem` · ♠ rule | 2 (fixed), then 2–9 | The rule becomes "Ring 3 bells; freeze when its eyes glow." The C/E/G chord and crooked B♭ become the Twists. The hidden clear ("Untouched") is ringing all three with one Big Voice croak, which also unlocks Echo Toad. |
| 6.2 whispering_library | `moth_library` · ♦ rule | 5–14 | Simplified per CRIT #17: 3 rings × 6 glyphs, books placed on public stands, liar books edged in lilac, and a noise meter wakes the moth. One cue, one rule. |
| 6.3 fuse_tether | `tongue_tether` · set piece | 8, then 6–16 | Tongue-tied pairs. The cog, lamp, crumble and gust sections are kept. The fuse is replaced by **rising well water** as the pursuer, which removes CRIT #19's dead time. |
| 6.3 (variant) | `tongue_bridge` · ♥ | 11+ | FO's Tongue-Tied Bridge |
| 6.4 clockwork_foundry | `slime_foundry` · E | fork 12 | Kept, with CRIT #22's dash spec. It carries "time". |
| 6.5 liars_banquet | `doppelfrog` · ♥ | 14 in climb 1, then 6+ | FO's replacement. **[AMEND]** With fewer than 3 humans it runs as "spot the Mimic": a bot seat is the Mimic, humans decide, and bots only point at public evidence. |
| 6.6 weighing_hall | `two_pads` · ♥ | 6+ | FO's Two Pads, Three Frogs. The lifeboat survives. |
| 6.7 drip_chimney | `grip_wall` · set piece | 15, then 11–19 | The PEAK wall. Melting holds become moss holds that dry out. Rope and pitons become a tongue haul. |
| 6.8 glitched_watcher | `glitch_eye` · E | fork 17 | Visual sonar rings (CRIT #21). Shut-eye replaces the blindfold. Gaze is tested on the frog's facing. |
| 6.9 harmony_sentinel | `lamp_knight` · ♣ rule | 8–17 | Put the lamps out with a Chorus croak (2+ frogs within 0.3 s). Decoys get the Bell mode from CRIT #18. |
| 6.10 weight_of_guilt | — | — | **CUT** (it depended on Soot and the Ledger; FO §7) |
| 6.11 mimics_toll | `mirror_toll` · ♦ | Sky, LATER | Re-authored with no wax. The Mimic's look is reused in `doppelfrog`. |
| 6.12 karmic_executioner | `ash_axeman` · ♠ | Space, LATER | Needs a "go dark" answer that is not a Dim verb (redesign) |
| 6.13 the_snuffer | `warden_jar` · Warden | 20 | **The Jar.** Phase 1 replays earlier monsters at their old numbers. Phase 2 drops the Jar on the brightest frog, pushed back with a Chorus of up to 5 croaks at r 6 m (fixes CRIT #1). Phase 3 is a paired tongue-catch Trust Fall: 12 s, with a drifting shadow circle (CRIT #22, #30). One ending. |
| 6.14 hollow_suit | `toy_bigtoad` (SHOULD) → `hollow_toad` (LATER) | 6, 16 | One Body. The 30 s toy sums the inputs using TEAMBOUND's tested rules. |
| 10.2 Pinky Promise / Snuff Tag / Wax Stack / Rumour Dice | `split_or_swallow` ♥ / Jar Tag / Frog Stack / cut | — | As FO §5.1 |
| 10.3 Old Tallow's Market | The Landing stall | Landings | As FO §7 |

---

## 4. New rooms needed

Each room has one monster, one cue and one rule, an obvious clear, a hidden clear, 2 Twists, a rank shortcut, mites and a shared-fate gimmick (FO §3.8). The rooms that are not rule doors still take their parts from the same kit.

| Id · type | Rule line | Hidden clear | Shared fate / homage |
|---|---|---|---|
| `heron_shadow` ♠ | "Reach the far bell. When the shadow falls, be under a lily pad." (Wingbeats warn 3 s ahead.) | Tongue the feather it drops mid-pass; spooked, it never returns | Pads sink under 3 frogs. Seeds the Sky Warden. |
| `snake_coil` ♠ | "Cross on the pads. It strikes whatever splashes." | Tongue its tail into its mouth; it bites itself and sleeps | One frog's hop rocks the next pad |
| `echo_warren` ♦ | "Find 3 glow-moths in the dark maze. It hunts your last croak." | Croak into its empty burrow and it gets lost | A croak draws walls for everyone in range; the pulse radius (4/6/9 m) is the rank shortcut. The maze wish; Echo Chamber. |
| `fog_stair` ♦ | "Reach the top. The eel lunges at whoever is lit." | The fog hides a flat ground route; Third Eye shows it | TTITH floor 3 |
| `lily_raft` ♣ | "Ride to the far pad. The pike leaps at the low side." | Paddle with tongues on the reeds so nobody ever steps off | Weighted raft; Downstream |
| `snapper_crossing` ♣ | "Carry the egg to the nest. It bites the fastest thing moving." | Throw a mite past it so it chases the mite into the pool | The egg needs 2 carriers and cracks after a fall of more than 1 m; Delivery |
| `sunken_bucket` ♣ (SHOULD) | "Raise 3 relics. The catfish swallows the brightest light." | Drop a firefly jar as a decoy | Air is per frog; tongue a bubble to a friend; Deep Dive |
| `keeper_well` | Two monsters you met this climb, combined | — | Party payoff |

**Breathers and hubs:**
- Breathers: `br_hatch_pond`, `br_shove_door`, `br_jar`, `br_window` (it carries WORLD's Seam vistas for each layer), `br_sleeping_toad` (uses the GDD §6.0.5 noise model) and `br_gold`.
- Toys: `toy_sumo`, `toy_flycatch`, `toy_bigtoad`.
- Hubs: `meeting_room`, `landing`, `hub_well_bottom` (title, map wall, Mirror, difficulty doors, and the statue of the first frog pointing up, inscribed 우물 안 개구리 / 井底之蛙).

---

## 5. What happens to each GDD and WORLD system

### 5.1 GDD (FO §7 governs; integration notes only)

| System | Fate | Integration note |
|---|---|---|
| Run, Intermission, Draft, Latch, Tide, Omens, Echo tiers | CUT | The Climb and 40 s Landings replace them. The layer glyph plus skulls replaces Omens. |
| Ghost Sim, Grates, Side Doors, Keyholes, bets, Reunion | CUT / REPLACE | Forks and the Meeting Door. The offstage Rival **[AMEND]** keeps the Reunion bark. |
| Letters A–E, X, ♛ | SIMPLIFY | Suits ♠♦♣♥ plus E. X becomes the stall. ♛ becomes the Warden. |
| Wax, flame verbs, Snuffed/Scorched | REPLACE | 3 back spots, Hop/Tongue/Croak, tadpole ghost, croak revive, Team Lives |
| Decree redaction, hint ladder, Codex, Scars | REPLACE | Plain text on the first visit. Sealed is opt-in. Hell redacts. The Bestiary fills its page on your first death. |
| Traits, Altar, Anvil, Origins, keys, titles, Wick Level | REPLACE | Boons, Duos, classes, Tower Rank F→SSS, cosmetic titles |
| Ledger, 10 Knives, Soot, Tribunal, Notes, Pact Pot, Clue Composer | CUT / SIMPLIFY | Knot and Cut, Heart doors, Betrayal Cam, the WANTED poster, Vengeance |
| Rivals, Drama Director, Rival Register | KEEP | Redrawn as frog species. They are the onlooker chorus. Rookie labels. They also play the offstage fork parties. |
| Minigames, economy, 60 cosmetics, rotating shop, Wickbook | SIMPLIFY / REPLACE | Toys, Wish Coins and Pearls, 8 slots, Supporter Sets, no pass |
| Audience layer (§2.4) | LATER | Grafted onto the lantern-folk (see 5.2) |
| Three.js art, Web Audio, Node netcode | REPLACE | The UT Unity stack |

### 5.2 WORLD (FO rules on only about 10 rows; the rest is decided here)

| WORLD item | Fate |
|---|---|
| Laws 1, 3, 4 | **KEEP.** Law 3's per-layer leaks go into `br_window`. Law 4 becomes the map. |
| Law 2 (Burnt Out climbers become stars) | **RE-SOURCE.** Burnt Out no longer exists. The 12 lantern-folk frogs remain the ★1 surprise and become the LATER Sky audience (DCC-style reveal of the audience at layer 2, capped per RR). |
| Law 5 (the run is the unit) | **REPLACE** with the Climb |
| Braid geometry, the Mouth's growth, the Mouth glance | **KEEP** (Coin renamed the Mouth). The light pillar and water reflection are SHOULD. |
| Tide skin, Theta Draft maze, X alcove, flames on other Landings, Burnt Out Watchers | **CUT.** The Seam's per-layer table moves into `br_window`. |
| Layer formats (Tower, Maze, Dungeon, Maze of dungeons) | **KEEP** as each layer's macro dressing. The Sky's island maze is LATER. |
| Layer Omens | **CHANGE:** a movement verb on by default (Sky Glide, Space Drift with the Tongue IV grapple; Beyond Light-Lag is LATER) |
| Trait layer scope, the `'clamp'` rule, tier +1 per layer | **CUT** |
| Reveal pipeline (shells, masks, impostor, audio sweep, 200 ms silence, t0 + 500 ms sync) | **KEEP,** ported: nested shells near the origin plus a floating origin, Cinemachine, and an NGO ClientRpc carrying server time |
| ★1 (26 s / 8 s repeat) | **KEEP,** with one ending variant. It now lands on the frog. |
| ★2–★4 and the Revelation | **LATER** |
| Astrolabe, Mound run select, lit wells | **SIMPLIFY** into the map. The Mound is cut; lit wells are LATER. |
| Surfacing, lobby start layer, Tourist Pass, Next Layer button | **KEEP** |
| Surfacing titles, Holders, Scale Plates | Become Surfacing hats (earned-only) and reveal replays from the map |
| First Shout, Chorus at results, share card | **KEEP.** The First Shout is MUST (cheap); Chorus and the share card are SHOULD. |
| Hangul/Hanja cards | **KEEP,** using a TextMeshPro CJK subset |
| Stone frog statue | **REPLACE** with the statue of the first frog at the hub. In Cycle 2 the plinth is empty. |

---

## 6. The hero

**The Firefly Frog** (FO §2.3). It is an upright bean with 3 glowing back spots for health. Its belly glow and orbiting fireflies track its Glow level. Its verbs are Tongue, charged Hop and Croak, all animated procedurally.

- **Molts** use one rig with add-on parts, so every hat fits every form:
  - Well: froglet;
  - Sky: Tree Frog membranes;
  - Space: Moon Toad fishbowl helmet;
  - Beyond: LATER.
- **The Rivals are frog species** that match their archetypes: Brother Brass a bullfrog, Vex a yellow dart frog, Kestrel a tree frog, Gutter a scarred toad.

**Fidelity argument.** The frog is the user's only repeated structural image. With a frog hero, every reveal lands on the player. It also makes the Revelation giant the player's own species.

**Gates A and B stay, with one amendment [AMEND].** If Gate A fails on readability, run **one remediation pass first**: bigger back spots, stronger rim contrast, and more of the upright pose. Then re-run Gate A in week 5, before falling back to the Wick-Flame. Readability is tunable in a way that the user's metaphor is not.

If the Wick ships anyway, all the systems still work (FO §2.3), but three fidelity items must be protected:
- the Revelation silhouette stays a frog;
- the hub statue stays;
- the Candle-Toad cosmetic line keeps the player wearing the frog.

Until the gates pass, lock no frog-only art: no capsule, trailer or Warden art.

---

## 7. Slice scope

**MUST-1: greybox, weeks 1–4, alongside the netcode proof of concept.**
- Rooms: `hub_well_bottom`, `br_hatch_pond`, `br_shove_door`, `bell_golem`, `lily_raft`, `snake_coil`, `br_window`, `echo_warren`, `heron_shadow`, `landing`, `toy_sumo`, `snapper_crossing`, `tongue_tether`, `br_gold`, `keeper_well`.
- Systems: the verb ranks, auto-granted Boons, the map (a stub is enough), and a greybox Keeper pull-back.
- It runs the §2.3 script through door 10. Gates A and B run on it.

**MUST-2: the Well vertical slice.**
- Doors: `moth_library`, `fog_stair`, `lamp_knight`, `slime_foundry`, `glitch_eye`, `grip_wall`, `tongue_bridge`, `two_pads`, `split_or_swallow`, `doppelfrog` (including the solo variant), `meeting_room`, `br_sleeping_toad`, `br_jar`, `toy_flycatch`, the Rematch overlay and `warden_jar`.
- Reveal: ★1, and the Rim walkable with Glide on.
- Systems:
  - the offstage Rival;
  - Retry from door 11;
  - Frog Stack and Jar Tag;
  - the Mirror with 24 earned items and 2 Supporter Sets;
  - the first-surfacing +50 Pearls;
  - Easy, Normal and Hard;
  - the First Shout;
  - the wish-coverage test and the fidelity KPI.
- FO's counts all hold: 16+4+4 Boons, 9 classes, 12 Bestiary pages, 10 Rivals. **That makes 11 of FO's 12 rule doors MUST.**

**SHOULD:**
- `sunken_bucket` (the 12th rule door), `toy_bigtoad`, Landing Party mode, Hell (redaction only);
- the share card, Chorus at results, the light pillar and water reflection;
- **Sky Preview:** doors 21–25 under Glide, using re-dressed `bell_golem`, `heron_shadow` and `lily_raft` plus a `br_window` view onto Space. It exists so that "sky" is played, not only watched.

**LATER:**
- the full Sky, Space and Beyond climbs;
- `mirror_toll`, `ash_axeman`, `hollow_toad`;
- the Wardens: the thunderhead heron, Chan Chu, the Watcher;
- ★2–★4, the Revelation, Cycle 2;
- the Mimic Climb, the Watcher audience layer, proximity voice, Daily Seed, Light-Lag;
- the second 12 Well rule doors (FO §9.2).

---

## 8. Five biggest risks

1. **The hero gate removes the spine.** If the Wick wins, the user's own image goes back to being scenery, which is the diagnosis in FO §1.9 all over again. *Mitigation:* the remediation pass before fallback (§6); the fallback keeps a frog silhouette at the Revelation and the Candle-Toad line; lock no frog-only art before the gates.

2. **Solo players never meet the multiplayer wishes.** Forks, the Among Us vote and human betrayal are gated on human counts in FO. A solo tester, the most common first session, would miss the meeting, the vote and the sabotage. *Mitigation:*
   - the offstage Rival at forks;
   - the solo Doppelfrog;
   - the Drama Director's guaranteed bot Cut at door 11.

   All three are tested A/B against FO's defaults (FO §9.3, item 4).

3. **"Well → sky → space → bigger" reads as a trailer promise.** Space and Beyond are LATER, and ★1 arrives only at about 26 minutes, and only if the climb isn't wiped first. *Mitigation:*
   - the map's rings at 0:00;
   - windows at doors 4 and 13;
   - the Keeper pull-back at 10 minutes;
   - stars of Space through the dome tear at the Rim;
   - Retry from door 11;
   - the Sky Preview (SHOULD).

   The KPI needs ≥ 60% of first sessions to reach ★1 within 60 minutes.

4. **Homage creep breaks "subtract first".** Covering 8 TEAMBOUND modes plus 4 named games plus a maze pulls toward the bloat FO was written to cure. *Mitigation:*
   - each homage lives inside the kit, as a rule door's shared-fate gimmick or a 30 s toy;
   - each room gets at most one bespoke script (its monster);
   - nothing new before the Keeper beyond FO's 5 systems;
   - the additions coin no nouns ("the map", "offstage").

   Cut order if the schedule slips: Sky Preview, then `sunken_bucket`, then `toy_bigtoad`, then Hell.

5. **Networking linked bodies with 8 seats.** The tongue, the tether, the raft, the egg carry and the Frog Sling all depend on host-authoritative physics under 150 ms. NGO has the weakest prediction, 7 bots run on the host's CPU, and the NGO 3.0 migration is forced in 2027. If this fails, the Chained Together, PEAK and Delivery wishes lose their comedy. *Mitigation:*
   - the NGO-vs-FishNet proof of concept in weeks 1–2, run on exactly these verbs;
   - ragdolls as a local cosmetic layer only;
   - shove as the fallback for tongue-on-player;
   - a bot soak with fixed seeds from week 1;
   - the 6.7 LTS migration scheduled as a named milestone (UT).

Sources: all under `C:/Users/mrkl6/Downloads/Projects/Team CO-OP/make me a name/`
- `_design/FUN_OVERHAUL.md`
- `_design/GDD.md`
- `_design/GDD_CRITIQUE.md`
- `_design/WORLD_STRUCTURE.md`
- `_design/inputs/`
- `reports/`
- `TEAMBOUND_13/public/index.html` (the mode definitions)