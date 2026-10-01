# plan:2 (saved from master-design-unity run wf_27fa7ac0-6ba)

# KNOTWELL integration plan (Unity buildability-first)

**Lens.** This plan picks the smallest vertical slice that AI coding agents can finish at top-tier polish. The stack is Unity 6.3 LTS with URP 17, NGO 2.x in host mode over Facepunch (Steam) plus UTP (LAN), and host-owned bots.

**Sources.** FUN_OVERHAUL (FO) is binding. The GDD and WORLD documents are a parts bin. The tech-stack report (UT) sets the stack.

**Tiers.**
- **MUST (Slice A, the Quick Climb):** the Foot, doors 1–10, the Keeper, and a replayable second climb, finished to ship polish.
- **SHOULD (Slice B, the Full Well):** doors 11–20, the Warden and ★1 Out of the Well. This is FO §9.2's content slice.
- **LATER:** everything past the Well.

**Admission rule.** Nothing enters MUST unless the FO §6.1 first-ten-minutes script, the second climb, or an FO §9.3 proof gate uses it.

---

## 1. Unified structure: layers → floors → Landings → doors → rooms

| Level | What it is | Well count | Unity representation |
|---|---|---|---|
| **Layer** | One Climb of 20 numbered doors, with its own palette, Warden, reveal and (LATER) movement verb | Well 1–20 · Sky 21–40 · Space 41–60 · Beyond 61–80 | One scene per layer, built near the origin (`Well.unity`) by the editor command `BuildLayerScene` |
| **Floor** | 5 door slots climbing one strand of the WORLD Braid | 4 | A slot list in `ClimbTemplate.json` |
| **Landing** | A 40 s warm stop on a strand top; also a save point | Foot y 0 · L1 after door 5, y 30 · Keeper Landing after 10, y 60 · L3 after 15, y 90 · Warden arena y 120 · lip y 180 | `Landing` prefab in the shaft. The Mouth reads 31° / 37° / 44° / 56° / 74°, WORLD §4.3's numbers unchanged. |
| **Door slot** | One door number, of one type: Breather (a single door), Pair (5A/5B), Fork (7A/7E; the party may split), Keeper or Warden | 20 | `DoorHall` prefab: an antechamber with 1–2 plaques, the 4 s walk-vote and the door-counter slam |
| **Room** | A RoomDef JSON, a baked shell prefab and at most one bespoke monster script | 18 entries in MUST | See §1.2 |

The mapping is exact. FO §6.1's Keeper pull-back quotes the Mouth widening from 31° to 44°, which is WORLD's angle at the Foot and at strand 3 (y 60).

The Braid survives as the shaft's dressing. The Tide, the Draft maze, the Grates and the Crown lift are gone. The transfer between floors is now simply walking out of door 5, 10 or 15 onto the next Landing.

### 1.1 Slot template (the MUST acceptance path)

| Door | First climb | Later climbs |
|---|---|---|
| 0 | W-B00 Hatch Pond (the Foot) | Same, skippable |
| 1 | W-B01 Two-Frog Door (includes a jar and mites) | A breather |
| 2 | **W-R01 Bell-Golem**, a single door. Clearing it grants Shatter Croak. | A pair; pick 1 of 3 from here on |
| 3 | Pair: 3A (a rule room, ♠) / 3C **W-S01 raft** | A pair |
| 4 | W-B03 Window (forced) | A breather |
| 5 | A pair, then Landing 1 | A pair, then Landing 1 |
| 6 | A breather | W-H01 Heart door eligible |
| 7 | A pair | **Fork 7A / 7E**, rejoining at W-M01 |
| 8–9 | A breather and a pair; a gold door can roll on any slot (5%) | Same |
| 10 | **W-K01 Keeper**, then the Keeper Landing: `[CHOICE UNLOCKED]`, Rank F→E, the steered pull-back, a save point | Same |

### 1.2 The room contract: what makes rooms cheap

**Every room is data.** A RoomDef JSON is turned by a generator into a ScriptableObject and a prefab. Its fields are:
- id, kind, suit, skulls, capacity (group, solo or duo);
- length: target, soft cap 90 s, hard cap 150 s;
- monster, cue, and a plain rule of at most 14 words;
- a hidden clear and 2 Twists;
- rank lanes, one shared-fate gimmick, the prize and the Boon family;
- a Bestiary page;
- a 3-stage BotPlan (Explore, then Theorise, then Execute; CRIT #2);
- System lines;
- the layout: kit placements by coordinate. The GDD specs already give those coordinates.

**Room shells are static and baked.**
- Every room prefab sits permanently in its own cell of a 300 m grid below the shaft.
- One editor command bakes APV lighting and the NavMesh once per layer scene.
- "Spawning" a room means enabling its cell, after which the host spawns its dynamic objects.
- This gives baked lighting and bot NavMesh with no runtime baking. The door transition hides how far away the room really is.
- The one exception is the Window breather (W-B03). It is placed in the real shaft at its nominal height, about 6 m per door, so the view through it is real geometry.

**Only the dynamic parts are networked.**
- Each live room has one `RoomState` NetworkObject that carries its kit state as NetworkVariables and bitfields.
- The monster and at most 20 tongueable props are host-simulated NetworkObjects, visible only to the frogs in that room. This relies on NGO visibility, which the proof of concept must confirm.
- Frogs are always visible to everyone. That is what the Meeting Hall's shadow-glass window draws.

**Twists touch only dynamic objects** (which bells are live, which tiles are safe). A validator enforces this, so one baked shell serves every seed.

**The kit** is GDD §6.0.1, re-skinned for frog verbs:
- Interactables: Bell, Lever, Plate, Pad (tippable), Jar, Pot, Key/Lock.
- Hazards and sensing: MiteSpawner, GazeCone, NoiseBus, TellLight (the emissive cue).
- Traversal: Anchor (grapple point), RankLedge, Tether, GripWall.
- Structure: CountdownBell, Window, ExitGate, Checkpoint, Water/KillVolume.

RankLedge and Anchor read their heights and distances from `VerbRanks.json`. Retuning Hop II therefore moves every rank-II ledge in every room at once.

**Script budget.**
- **S:** the monster plus the kit.
- **M:** also one custom kit piece.
- **L:** multiple phases, or a content generator.

MUST contains no L room. The Keeper reuses two existing monster scripts through a shared `PhaseSequencer`.

**The build fails in EditMode if a room:**
- is missing any contract field;
- has more than one MonsterBrain;
- lacks a rank-II lane or a rank-III/IV lane;
- can't be cleared with audio muted (CRIT #21);
- or is cleared by the 7-bot soak on fewer than 90% of 50 seeds within the hard cap.

A second test fails the build if any bot performs a room's key action within the first 90 s while a first-visit human stub is present.

---

## 2. Where each GDD room lives now

| GDD room | New id | Now | Tier | Budget |
|---|---|---|---|---|
| 6.1 golem_belfry | **W-R01 Bell-Golem ♠** | Door 2 of the first climb. Rule: "Ring 3 bells. When its eyes glow, freeze." Chords and B♭ become a Twist: a crooked decoy bell from 2 skulls. Hidden clear: ring all three bells with one croak from the gold circle. It is also the style-lock room and the first Rematch target. | MUST | S |
| 6.9 harmony_sentinel | **W-R02 Lamp-Knight ♣** | Rule: "Snuff all its lamps in one breath. Twice." A croak-sync with the CountdownBell. Decoys spawn in their chalk circles and get a Bell mode (CRIT #18). Echo Chamber homage. | MUST | M |
| 6.8 glitched_watcher | **W-R03 Well-Eye ♦** + **W-E03** (solo/duo) | A group ♦ room, plus an E fork variant from the same script. Rule: "Never look at the eye. Topple the three pillars that hum." Gaze is tested on the frog's facing, and hums draw sonar rings (CRIT #21). Pillars fall along the walls and become ramps (CRIT #22). | MUST | S |
| 6.4 clockwork_foundry | **W-R05 Chrono-Slime ♦** + **W-E05** (duo) | Rule: "Herd it into the cold with steam." A dash lasts 12 m or 3 bounces (CRIT #22). The duo variant is the slice's door 7E. | MUST | S |
| 6.6 weighing_hall | **W-H01 Two Pads, Three Frogs ♥** | Rule: "Only two may leave by the pads." The temptation is to shove a friend off; the co-op answer is stacking three frogs on one pad. No monster script. | MUST | S |
| 6.3 fuse_tether | **W-S03 Tongue-Tied Tether** (set piece) + **W-H02 Tongue-Tied Bridge ♥** | Frogs are tongue-tied in pairs. Once the fuse is socketed the flame catches at 4 m/s (CRIT #19). Each client solves its own chain against interpolated partner positions. | SHOULD | M |
| 6.7 drip_chimney | **W-S02 Climbing Wall** | PEAK-style per-frog grip, with tongue-hauls; door 15 | SHOULD | M |
| 6.5 liars_banquet | **W-H04 Doppelfrog ♥** | Needs at least 5 voters and 3 humans; bots vote only on public evidence. With fewer humans it is replaced by a vote-free Heart door. | SHOULD | L |
| 6.2 whispering_library | **W-R06 Hush Library ♦** | Goes past CRIT #17's 3-ring fix to: "Place three quiet books on their stands; freeze when the moth twitches." The Clue Composer is cut. | SHOULD | M |
| 6.13 the_snuffer | **W-WD01 The Jar** (Warden) | The Jar is lowered onto the brightest frog (the highest Glow Level). Phase 1 replays earlier monsters at their old numbers. Phase 2: a Chorus cracks the lid. Phase 3: a tongue-catch Trust Fall, with a seeded drop circle shown only to catchers (CRIT #22). One ending. | SHOULD | L |
| 6.11 mimics_toll | A Sky rule room | Re-themed; the curse no longer carries across floors | LATER | M |
| 6.12 karmic_executioner | A Space rule room | "Kneels only in the dark", driven by an APV lights-out scenario blend | LATER | M |
| 6.14 hollow_suit | One Body homage | Needs control sharing beyond the kit | LATER | L |
| 6.10 weight_of_guilt | — | **CUT**: it depends on Soot and the Ledger | — | — |

---

## 3. New rooms needed

| Id | Kind | Hook | Tier | Budget / homage |
|---|---|---|---|---|
| W-B00 Hatch Pond | the Foot | Egg → tadpole → froglet. Hop, tongue, gulp. A firefly cloud gives `[GLOW 1→2]` and `[TONGUE II]`. Kestrel's "Watch this!" gag. | MUST | S |
| W-B01 Two-Frog Door | breather | Door 1 takes two frogs to shove open; a jar and mites behind it | MUST | S |
| W-B02 Jar Room | breather | A jar, mites and pots | MUST | S |
| W-B03 Window | breather | A real crack onto the real shaft. Replaces WORLD's X-alcove Seam. | MUST | S |
| W-B04 Gold Room | special | A 45–60 s treasure room ending in a pick of 3 Legendaries | MUST | S |
| W-B05 Frog Stack | toy door, Landing toy and Meeting toy | Tower of Babel homage | MUST | S |
| **W-S01 Lily-Pad Raft (3C)** | set piece | The raft's tilt is computed from the torque of the frogs' weights and replicated as a single float; there is no buoyancy rigidbody | MUST | M; Downstream homage |
| **W-R04 Heron Shadow ♠** | rule | Rule: "When the shadow passes, get under a pad or underwater." Hidden clear: tongue a fish into its path. A frog-native DOORS "Rush". | MUST | S |
| **W-K01 The Bell-Knight** | Keeper | A golem carrying the Lamp-Knight's lanterns. Phase 1: snuff the lanterns in one breath to open its crack. Phase 2: ring 3 bells while its eyes are dark. About 90 s. | MUST | M: two existing scripts + `PhaseSequencer` |
| **W-M01 Meeting Hall** | where a fork rejoins | Two locks, and each fork room drops one key. Frog Stack to play while waiting, a shadow-glass window, and a rescue rope at 45 s ("cleared with help" keeps the Boon pick). Passing an item through the window is SHOULD. | MUST | M |
| W-R07 Snapjaw ♠ | rule | Rule: "It bites whatever faces it. Walk past backwards." Hidden clear: feed it a pot and ride its shell. | SHOULD | S |
| W-R08 Web Spider ♣ | rule | Rule: "It drops on whoever croaks. One croaks, the rest cross." | SHOULD | S |
| W-R09 Lantern Pike ♣ | rule | Rule: "It rises under the brightest frog. Lead it into the net, then croak together." Your visible growth is the bait. | SHOULD | S |
| W-R10 Newt Choir ♣ | rule | Rule: "Sing its phrase back on the pitch stones." Uses the pentatonic croaks. | SHOULD | S; Echo Chamber homage |
| W-R11 Mirror Pond ♦ | rule | Rule: "Your reflection moves the other way. Walk it out." | SHOULD | M |
| W-R12 Moss Snail ♣ | rule | Rule: "It moves only while nobody watches. Someone always looks." The opposite rule to R03. | SHOULD | S |
| W-H03 Split or Swallow ♥ | Heart | Pinky Promise as a room | SHOULD | S |
| W-B06 to W-B09 | toys and breathers | Lily-pad sumo; a sleeping threat (R01 or R04 in its Sleep state); Jar Tag; Fly Catch | SHOULD | S |
| Deep Pond | set piece | Swimming with shared air | LATER | L; Deep Dive homage |

**Counts.**
- R01–R12 make up FO's 12 Well rule doors.
- Every TEAMBOUND_13 mode has a home:

  | TEAMBOUND_13 mode | Where it lives |
  |---|---|
  | Summit | W-S02 Climbing Wall |
  | Chained | W-S03 Tongue-Tied Tether |
  | Downstream | W-S01 Lily-Pad Raft |
  | Echo Chamber | W-R02 Lamp-Knight, W-R10 Newt Choir |
  | Delivery | The fragile-jar kit gimmick |
  | Babel | W-B05 Frog Stack |
  | One Body | Hollow Suit (LATER) |
  | Deep Dive | Deep Pond (LATER) |

---

## 4. What happens to each GDD and WORLD system

| System (source) | Fate | Unity form | Tier |
|---|---|---|---|
| Wax HP and the shrinking body (GDD §5) | REPLACE: 3 back spots; the body *grows* in glow | Hero shader `_Spots` / `_Glow`. A knocked-out spot is a tongueable prop that always returns to its owner. | MUST |
| Flame verbs; 22 bindings (§4) | REPLACE: Hop, Tongue, Croak, Shove, Power, Wheel (8 bindings) | Input System asset generated from JSON; `VerbRanks.json` | MUST ranks I–III; SHOULD rank IV |
| Run, Intermission, Draft, Latch, Tide (§3.3–3.6) | CUT. A numbered Climb with walk-vote DoorHalls takes their place. | `ClimbDirector` (host), `DoorHall` | MUST |
| Letters, capacity dots, SPLIT/FINISH/SOLE (§3.4, §6.0.4) | SIMPLIFY: number and letter, suit, prize, skulls | `Plaque` reads the RoomDef | MUST |
| Seeded generation; Omens, Echo tiers, tier scaling (§3.5; WORLD §3.1) | KEEP the seed. CUT the rest; 2 Twists, skulls and entrance difficulty replace them. | One replicated seed plus a host-only salt | MUST |
| Ghost Sim, Grates, Side Doors, Keyholes (§3.7–3.8) | CUT. Forks and the Meeting Hall replace them. | At most 2 live rooms, with visibility by membership | MUST (the door 7 fork) |
| Decree redaction, hint ladder, Regression Scars, Codex (§6.0.3, §9.8) | REPLACE: a plain rule first; Sealed and Hell redaction; a Bestiary with death tips | `Bestiary.json` | MUST: plain rules + Bestiary. SHOULD: Sealed / Hell |
| Altar, 16 traits, Anvil, Origins (§9.2–9.5) | REPLACE: Boons, Duos and classes | `Boons.json`. Offers come from the salted seed and go only to their owner. | MUST: 8 Boons + 2 Legendaries. SHOULD: 16 + 4 Duos + 4 Legendaries, 9 classes, secret quests |
| "No permanent power"; Wick Level (§9.1, §9.9; WORLD §3.3) | REPLACE: Glow Level; Tower Rank with talents | `Rank.json` plus a save JSON | MUST: Glow 1–6, Rank F–C. SHOULD: Glow 7–10, Rank B–S |
| WORLD `'clamp'` scope | CUT. The Rematch door is a data flag on an already-played room. | — | SHOULD |
| Scorched and failure (§5.3) | REPLACE: tadpole ghost, croak revive, Team Lives, 50% pay on failure | — | MUST |
| Ledger, 10 Knives, Soot, Tribunal, Notes, bets, Pact Pot (§7) | CUT. Heart doors, Knot/Cut, the Betrayal Cam, the WANTED poster and Vengeance replace them. | Replays come from a client-local 3 s ring buffer of frog transforms. Betrayal is server-authoritative. | MUST: H01, shove, Cam, WANTED, Vengeance. SHOULD: Knot, Cut, Duos |
| 24 quick-chat lines, Clue Composer (§7.9) | SIMPLIFY: the Wheel (pings, 8 lines, emotes) | UI Toolkit | MUST |
| Rivals, Drama Director, Rival Register (§8) | KEEP, redrawn as frogs: staged BotPlans, onlooker barks, the Rookie label | `Rivals.json`. Bots emit the same `ClimberInput` as humans. | MUST: 7 Rivals + the first-climb beats. SHOULD: all 10 + the Register |
| Landing's 11 stations; Old Tallow's Market (§10.1, §10.3) | SIMPLIFY: stall, jar lineup, toy, Mirror (plus a Knot spot in SHOULD) | `Landing` prefab | MUST |
| Embers / Drips / Sparks (§11) | REPLACE: Wish Coins (per run) and Pearls (meta) | `Economy.json` plus FO §8.6's EditMode tests | MUST |
| 10 cosmetic slots, daily rotation, Wickbook (§12) | SIMPLIFY: 8 slots ordered by visibility; an earned catalogue; no rotation and no pass | Attach sockets on one rig | MUST: Hat, Skin, Glow, 12 items. SHOULD: 24 items, all slots. LATER: Supporter Sets |
| Art, audio, netcode, UI pipelines (§13–16) | REPLACE with the UT stack | HLSL toon shader plus an outline Render Graph feature, Shuriken, a ~200-line PrimeTween feedback library, AudioMixer, NGO + Facepunch + UTP LAN | MUST |
| WORLD Braid and the Coin | KEEP as the shaft; the Coin is renamed the Mouth | `Well.unity` | MUST: Foot to Keeper Landing. SHOULD: L3 and the Warden arena |
| WORLD honest stars; ★1 choreography | KEEP for the Warden payoff | Nested shells plus a floating origin | SHOULD |
| WORLD Theta Draft maze, Tide skin, transfers | CUT | — | — |
| WORLD Layer Omens ("default: none") | CHANGE: each layer's movement verb is on by default | A controller profile per layer | LATER |
| WORLD astrolabe, Mound, Tourist Pass | KEEP surfacing, applied per lobby. The astrolabe becomes the layer-select screen. | — | LATER |
| WORLD music keys, pentatonic motif | KEEP. Croaks harmonise, and the echo dies at the rim. | AudioMixer snapshots | MUST (Well); LATER (other layers) |

---

## 5. The hero

**Default:** the Firefly Frog, behind Gate A (readability, week 3) and Gate B (the same loop A/B against the Wick-Flame, week 4). If either gate fails, the Wick with a Flame axis ships instead.

**Code against the body, not the species.**
- All systems talk to one interface, `IHeroBody`: `SetSpots`, `SetGlow(level)`, `PlayAwakening(verb)`, `TongueOrigin`, `CroakFX`, and attach sockets for hat, face, back and belly.
- A capsule implements it first. The Frog and the Wick are two further implementations of the same interface.
- If a gate flips, the cost is one new body, not a rewrite. Nothing frog-specific is locked before Gate B: not the capsule, the Warden art or the trailer.

**How the frog is built:**
- **Mesh.** A Blender-Python upright bean: round face, no lips, dart-frog colours (the anti-meme rule). Blendshapes cover blink, eye retract and cheek puff.
- **Rig.** Root, hips, spine, head, jaw, throat sac, two 3-bone legs, two nub arms and two eyes, plus fixed sockets so every hat fits every form.
- **Motion is all procedural:**
  - hand-written 2-bone leg IK (UnitySpringIK's license is unchecked);
  - spring bones on the sac, eyes and hat;
  - the tongue as a generated Catmull-Rom tube mesh with overshoot;
  - PrimeTween squash and stretch;
  - ragdoll only as a local cosmetic layer that is never networked.
- **Growth on the body.**
  - `_GlowLevel` drives belly emission and marking masks.
  - Each level adds one orbiting firefly, up to 10 (Shuriken).
  - Awakenings add parts on the sockets: a glowing tongue tip, a larger throat sac.
- **Readability.**
  - The 3 spots are emissive masks in the toon ramp.
  - Each seat gets a fixed Seat Hue (CRIT #6) from an 8-colour, colour-blind-safe palette. It drives the rim light, name tag, blame tags and evidence; a cosmetic never does.
  - No cosmetic hue may sit within 15° of the betrayal crimson.
- **Cost.** FO's "+1.5–2 tech-art weeks" is an estimate that was never measured. Measure it against the capsule in week 3.

---

## 6. Slice scope

### MUST: Slice A, the Quick Climb (about 11 min) at ship polish

**Rooms (18):**
- Breathers: W-B00, W-B01, W-B02, W-B03, W-B04, W-B05.
- Rule rooms: W-R01, W-R02, W-R03, W-R04, W-R05.
- E variants: W-E03, W-E05.
- Set piece W-S01, Heart door W-H01, Keeper W-K01, Meeting Hall W-M01.
- Landings: the Foot, L1 and the Keeper Landing, with the steered pull-back. This is a Cinemachine spline up the real shaft; no shells are needed below 180 m.

**Bespoke code:** 5 monster scripts, the raft, the `PhaseSequencer` and the Meeting Hall.

**Systems:**
- 8 controls. Ranks I–III for all three verbs, so all 3 Awakenings (Air Hop, Long Tongue, Big Voice). Glow 1–6 on screen, with the curve defined up to 10.
- Spots, spot catches, the tadpole ghost, croak revive, Team Lives. Easy and Normal difficulty.
- Boons: 8 base (Shatter Croak, Spring Legs, Tell-Sight, Sure Tongue, Chorus, Lifeline, Deep Cheeks, Last Gulp) and 2 Legendaries (Moon Hop, Time Gulp). The first climb auto-grants; `[CHOICE UNLOCKED]` comes at the Keeper; picks start at door 2 afterwards. Slots: 4 passive + 1 active.
- Wish Coins and Pearls; the stall and the jar lineup.
- The results ceremony; Tower Rank F–C with 3 talents; 6 Bestiary pages.
- 7 Rivals, the Rookie label and onlooker barks.
- Blame tags, a 3 s fall replay, the Betrayal Cam, the WANTED poster and Vengeance.
- The Mirror with 12 earned cosmetics (Hat, Skin, Glow).
- Save and resume at Landings.
- Private lobbies over LAN (UTP) and Steam (Facepunch).
- Funnel telemetry and the "Worth it?" tap; FO §8.6's enforcement tests.

**Acceptance:**
- FO §6.1 plays end to end with 1 human + 7 bots, and with 4 humans on LAN at 150 ms RTT and 2% loss.
- The second climb shows the door 7 fork and W-H01.
- FO §9.3's stop conditions are measured.
- The soak and all validators are green.

**Order of work:**
1. **Weeks 1–2:** netcode proof of concept, NGO against FishNet: tongue on props and players, raft torque, shove-off-pad, 2-room visibility, 7 bots on the host. In parallel, a capsule greybox of doors 0–10 built from JSON.
2. **Week 3:** style-lock W-R01 and the hero; Gate A.
3. **Week 4:** Gate B; W-R02 to W-R05 and W-S01 through the content factory.
4. **Then:** the Keeper, the ceremony, the fork and W-H01; then a polish pass against each room's Definition of Done.

### SHOULD: Slice B, the Full Well (about 24 min)

- **Rooms:** W-R06 to W-R12; W-S02 and W-S03; W-H02, W-H03 and W-H04; W-B06 to W-B09; W-WD01 The Jar; Landing 3; ★1 Out of the Well with the Rim results.
- **Rematch door:** a data flag on an already-played room, placed in doors 15–19.
- **Progression:** rank IV of each verb; Glow 7–10 and the Crown glow; the full Boon pool (16 + 4 Duos + 4 Legendaries); Knot, Cut and Duos; 3 open + 6 secret classes with secret quests; Tower Rank B–S.
- **Modes and difficulty:** Hard and Hell (Sealed and redacted rules); all 10 Rivals plus the Register.
- **Online and polish:** public lobbies with flag-to-bot; drop-in; 24 cosmetics; the share card.

### LATER

- **Beyond the Well:** Sky, Space and Beyond (doors 21–80) with their movement verbs (Glide, Drift, Light-Lag); ★2–★4 and the Revelation; Cycle 2; the astrolabe layer select.
- **Rooms:** the Sky and Space re-themes of mimics_toll and karmic_executioner; the Hollow Suit; Deep Pond.
- **Modes:** Mimic Climb; Landing Party; Daily Seed.
- **Social and monetization:** proximity voice; Supporter Sets with real-money pricing; the Watchers/sponsor layer.

---

## 7. The five biggest risks

1. **Networked slapstick on an NGO host.**
   - *The risk.* Tongue grabs, spot catches, raft tilt, shove-off-pad and fork visibility all ride NGO 2.x, the netcode with the weakest prediction. On top of that, the host runs 7 bots' AI and all prop physics. If the physics rubber-bands, the comedy dies.
   - *Mitigation.* Run the proof of concept before building content. Use kinematic controllers and host-simulated props. Predict the tongue's *visual* on the client and let the host confirm the grab, with lag compensation capped at 150 ms. Replicate the raft as one angle. Never network ragdolls. Agree the fallbacks in advance: FishNet, and cutting tongue-on-player back to shove.
2. **Agents can't see motion.**
   - *The risk.* Compile, test and screenshot loops prove correctness, not feel, and "top-tier" is judged in motion.
   - *Mitigation.* Finish W-R01 and the hero first, as the reference. Give each room a Definition of Done:
     - 3 golden screenshots at fixed seeds;
     - a juice checklist: hitstop, squash, rising-pitch count-ups;
     - a luminance check that emissive tells read at 25 m;
     - positional audio for the cue.

     Export frame-sequence clips from the soak build for a human feel review at every milestone. Gate A is the hard stop.
3. **Content burn, and the real cost of a room.**
   - *The risk.* Rooms of about 57 s use up content 2–3× faster than the GDD's did, so 5 monsters will feel repeated by the third climb. The real per-room cost is the BotPlan, Twists, rank lanes and Bestiary page, not the monster script. Bots that solve rooms kill the riddle (CRIT #2), and bot comedy is untested (FO §5.3).
   - *Mitigation.* Enforce the validator and soak contract. Add a content-factory gate: each of W-R02 to W-R05 must be built from JSON plus one script in at most 3 agent-days. Get variety from E variants and skull tiers. SHOULD adds its seven S-budget rooms before any L room. Track repeat fatigue in telemetry.
4. **A late hero flip, or the procedural frog costing more than planned.**
   - *Mitigation.* Code everything against `IHeroBody`; lock nothing frog-specific before week 4; the Wick is a second implementation of the same interface with the same sockets.
5. **Toolchain and engine traps.**
   - *The risks:*
     - the Unity CLI is beta, the Pipeline package is experimental, and the MCP bridges are pre-release;
     - `.meta` and GUID churn when agents move assets;
     - Play mode without domain reload leaks static state in NGO and bot singletons;
     - APV and NavMesh bakes need a GPU desktop session (never `-nographics`);
     - the forced NGO 3.0 migration arrives with Unity 6.7 LTS in 2027.
   - *Mitigation.* Keep plain batchmode as the fallback behind the CLI's exit-code gate. Only generators write prefabs and scenes. Reset static state with `RuntimeInitializeOnLoadMethod` and cover it with a test. Bake on the logged-in Windows desktop. Make NGO 3.0 a named milestone, and keep a `licenses.csv` validator.

**Blocking before any public use:** trademark, domain and Steam-handle checks for KNOTWELL (USPTO, EUIPO, KIPRIS).