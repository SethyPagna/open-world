# plan:1 (saved from master-design-unity run wf_27fa7ac0-6ba)

# KNOTWELL integration plan, fun-first lens: the first session and the power curve

**Base:** `C:/Users/mrkl6/Downloads/Projects/Team CO-OP/make me a name/_design/FUN_OVERHAUL.md` (binding). GDD and WORLD serve as a parts bin. Every timing below is a greybox hypothesis (FUN_OVERHAUL §9.3). This plan changes the binding document only where its own numbers break its first-session promise.

## 0. Ten fixes this lens makes to FUN_OVERHAUL

I checked FUN_OVERHAUL's first-climb script (§6.1) against its own yield tables (§4.1) and door rules (§3). Ten gaps would cost fun:

1. **Door 5 has no room in the clock.** Door 4 is at 4:00 and door 5 clears at 4:40, which is too short for a 45–90 s rule door. If door 5 becomes a breather instead, the first Awakening slips from door 7 to door 8. **Fix:** door 5 is a short rule pair (≤55 s), and Landing 1 moves to 4:45.
2. **The first gold door is a 5% roll.** The guarantee only forces one "on floor 4", and a Quick Climb never reaches floor 4. **Fix:** the first climb seeds the gold door at door 9. The odds page says "First climb: one guaranteed gold door", so the System never lies.
3. **The gold door offers a pick of 3 Legendaries, but no choice screen exists before the Keeper.** **Fix:** in the first climb, Moon Hop is granted automatically.
4. **The system pile-up moves past the Keeper rather than going away.** Doors 10–12 unlock choice, Party Rank, Tower Rank, a hat, Heart doors, Knot, Cut, the secret quest, forks and the Meeting Door. **Fix:** one new thing per stop (§2). Door 11 is Two Pads, which needs only Shove. The fork is at door 12, the secret quest at door 13, and Knot, Cut and Duos at Landing 3.
5. **The Keeper is "two earlier monsters combined", but door 3 onward is a choice.** **Fix:** `keeper_bell_raft` puts the fixed door-2 golem on a tipping-raft arena. The raft reads without a prior lesson.
6. **The raft is a "set piece" in §4.5 but is missing from §9.2's two set pieces.** **Fix:** `lily_raft` is a ♣ rule door.
7. **Vengeance breaks at forks.** The traitor can take the other branch. **Fix:** Vengeance carries over to the first room that holds both frogs, and the Meeting room counts.
8. **"Tree Frog" names two things:** an open class and the Sky molt. **Fix:** rename the molt the "Glider molt".
9. **The curve is better than the doc says.** The §4.5 table puts Lv10 at the Warden. The per-type yields in §4.1 put it at door 18 (gold door at 9) or door 19 (gold door forced late); I simulated both. Keep that: Thunder Croak and the Crown glow are then **played** at the Rematch and the Warden, not delivered as the credits roll. Add a CI test on it (§4).
10. **Classes stay out of the first climb.** Everyone plays a plain frog, and class select appears from climb 2. The stall opens from Landing 2, so there is no shopping before the Keeper.

## 1. Unified structure

**Ascent → Layer (one Climb) → Floor (5 doors) → Landing / Keeper / Warden → Door slot → Room prefab**

| Level | Rule | Well instance | WORLD geometry kept as dressing |
|---|---|---|---|
| Ascent | 4 layers, then the Revelation; door numbers run on (1–80) | Well 1–20, Sky 21–40, Space 41–60, Beyond 61–80 | Law 1: the exit of each layer is the centre of the next. The macro formats (Tower / Maze / Dungeon / Maze of dungeons) survive only as traversal art. |
| Layer = Climb | 20 doors, ~24 min. Quick Climb = doors 1–10 + Keeper, ~11 min. Re-hatch at Lv1; the new layer's movement verb is on by default. | Well | The Braid: 5 strands inside a well with a 51 m radius |
| Floor | 4 × 5 doors | F1: 1–5, F2: 6–10, F3: 11–15, F4: 16–20 | Hatch pond = the Foot (strand 1, y0). Landing 1 = strand 2 (y30, Mouth 37°). Keeper and Landing 2 = strand 3 (y60, 44°). Landing 3 = strand 4 (y90, 56°). Warden = strand 5 (y120, 74°). |
| Landing | 40 s after doors 5, 10 and 15; a save point | Stall (from Landing 2), jar lineup, 1 toy, Knot spot, Mirror | The Coin-glance camera tilt on first arrival (WORLD §4.5, 1.7 s): free wow |
| Door slot | Breather (single door), pair (4A/4B), fork (7/12/17: A or C plus E), gold, Rematch, ♥, Keeper, Warden | Plaque: number and letter, suit, prize icon, skulls | Doors are cut into the strand walls; you walk through them, with no Draft |
| Room | Prefab drawn from a seeded pool; tagged by suit, length, skulls and gimmick | 2 Twists, a rank-II lane and a rank-III/IV lane, mites, one shared-fate gimmick | Prefabs sit far apart in one scene, at most 2 live at once (UT) |

**Pool rule:** a room you played can't come back in the same climb except as the Rematch. The side of a pair you didn't choose can.

## 2. The first 15 minutes, minute by minute

Setup: solo with 7 Rookie Rivals, Normal, first climb. Glow levels come from the §4.1 per-type yields (k = 15).

| Clock | Door | Room id | What happens | Growth | New system |
|---|---|---|---|---|---|
| 0:00 | — | title = well bottom | Press any key; the Mouth is a 31° coin | — | — |
| 0:03 | Foot | `hatch_pond` | Hatch, then hop pad to pad | Lv1 | Hop |
| 0:15 | | | Tongue a firefly cloud | **Lv2, TONGUE II** (grapple) | Tongue + growth |
| 0:25 | | | Yank Kestrel off his pad ("That was on purpose."). If tongue-on-player is cut, Shove does it. | — | **first laugh** |
| 0:35 | 1 | `br_jar_mites` | Two-frog shove with Moss; `DOOR 1` slams; stomp mites | fireflies | — |
| 1:00 | 2 | `bell_golem` (fixed) | Ring 3 bells; freeze when its eyes glow; Moss tongues your lost spot back | — | rule door |
| 2:00 | | | Auto Boon **Shatter Croak**: every pot bursts | Boon 1 | — |
| 2:10 | 3A / 3C | `heron_shadow` ♠ / `lily_raft` ♣ | Pick by walking; Kestrel sinks the raft | **Lv3, HOP II**; Boon 2 | door choice; team gimmick |
| 3:30 | 4 | `br_window` | A crack in the wall shows hundreds of lanterns below | — | — |
| 3:50 | 5A / 5B | `fog_stairs` ♦ / `fragile_jar` ♣ | Hop II reaches the 2.3 m shortcut ledge: the numbers bind | **Lv4, CROAK II**; Boon 3 | — |
| 4:45 | L1 | `landing_well` | Frog Stack; jar lineup Bronze → Silver; look up (37°) | jars | — |
| 5:25 | 6 | `toy_fly_catch` | 30 s toy door that pays a jar | — | — |
| 5:55 | 7A / 7B | `chorus_sentinel` ♣ / pool | Croak together; one sad lone croak | **Lv5, TONGUE III: Awakening, Long Tongue** (7:05); bots gasp; Boon 4 | — |
| 7:05 | 8A / 8B | pool | Snatch the hidden-clear item from 6 m: `[ NOTED ]` | hidden clear, Bestiary stamp; Boon 5 | — |
| 8:05 | 9 | `br_gold` (seeded) | Treasure room; fireflies ×3 | **Moon Hop** (auto); **Lv6, HOP III Air Hop** | — |
| 8:55 | 10 | `keeper_bell_raft` | Golem on a tipping raft: croak the bells while balancing | **Lv7, CROAK III Big Voice** | — |
| 10:25 | L2 | ceremony, ≤40 s | `[ CHOICE UNLOCKED ]` pick (8 s), then Party Rank Up, then Rank F → E, then a steered pull-back to the Mouth (44°), then a free hat, then "Something is waiting in 12E", then **Climb on / Rest** | Rank E | choice + Rank (payout) |
| **11:05** | | | **The Quick Climb ends here.** Everything is banked. | | |
| 11:05 | 11 ♥ | `heart_two_pads` | "Only two may leave by the pads." Vex shoves Moss off with the full tell; Betrayal Cam and WANTED poster. You find the co-op answer: three frogs on one pad. | first pick after a clear | Heart door (Shove only) |
| 12:15 | 12A / 12E | `moth_library` / `slime_foundry` (SOLO) | Split. The Rivals wait in `meeting_room`. Key swap; rescue rope at 45 s. **Moss's Vengeance on Vex lands here.** | **Lv8, TONGUE IV** (8 m) | fork + Meeting Door |
| 13:25 | 13 | `br_jar_mites` | `[ HIDDEN CONDITION DETECTED ]`, private to you | — | secret quest |
| 13:45 | 14A / 14B | pool | Chase the quest | Boon | — |
| 14:50 | 15 | `sp_grip_wall` | Per-frog grip; tongue-haul a Rival up the wall | **Lv9, HOP IV** at the clear (~16:30) | set piece |

**Density check.** Before the Keeper, exactly 5 systems appear: verbs, growth, rule doors, door choice and the team gimmick. After it, one system per stop. The feel target is "stronger, laughed or saw something bigger" every ≤90 s. The table has a beat in every row. The longest gap is 3:50–5:25 (Lv4 at 4:45), and Landing 1's jars and toy cover it.

**The first betrayal the player sees is bot-on-bot.** The player watches before they can be the victim, and sees Vengeance pay off one room later (goguma, then saida). The first betrayal aimed at the human comes at the next Heart door.

## 3. The rest of the Full Climb (15:00–24:00)

| Clock | Door | Room / beat | Growth / new |
|---|---|---|---|
| 16:30 | L3 | A Rival offers **Knot**; stall; the Mouth at 56° | Knot and Cut unlock |
| 17:10 | 16 | breather jar | — |
| 17:30 | 17C / 17E | `sp_tongue_tied_crossing` (Knotted pairs) / `blind_eye` (SOLO/DUO) | **Duo** offered (Frog Sling) |
| 18:40 | 18 | **Rematch** `bell_golem` at its old numbers: `OLD TIME 1:12 → 0:18` | **Lv10, CROAK IV Thunder Croak, Crown glow** |
| 19:10 | 19 | breather (the gold door is forced here if none has rolled) | — |
| 19:30 | 20 | `warden_the_jar`, 3:00. **P1:** flatten golem and raft at their old numbers. **P2:** the Jar drops on the *brightest* frog, so your glow is now the target; a 5-bell Chorus lifts it. **P3:** Trust Fall, caught with the tongue. | power lap |
| 22:30 | — | ★1 Out of the Well (26 s; free look from 21 s) | the Sky layer |
| 22:56 | — | Results: door counter, Pearls, stamps, class, Rank bar last, **Climb again / Rest** | ~23:20 total |

Time outside rooms comes to about 3:10 of 23:20 (14%), counting the ★1 reveal and the results. Excluding them it is about 11%, inside the 12% cap. Hold the Landing ceremonies to their budgets.

## 4. Power curve: the verified version

**Simulation.** I ran the §4.1 yields per door type, k = 15, Normal, with no hidden clears.

| Mix | Lv3 | Lv4 | Lv5 | Lv6 | Lv7 | Lv8 | Lv9 | Lv10 |
|---|---|---|---|---|---|---|---|---|
| Door 5 rule, gold at 9 (this plan) | 3 | 5 | **7** | 9 | 10 | 12 | 15 | **18** |
| Gold forced at 19 | 3 | 5 | 8 | 10 | 11 | 14 | 17 | 19 |
| Gold at 19 + 2 failed rooms | 3 | 5 | 8 | 10 | 12 | 15 | 18 | 19 |

**The verbs keep the same order in every mix.** The "≤1 rank ahead" rule makes them round-robin, and the Awakening beats are fixed by level:
- **Lv2 T II, Lv3 H II, Lv4 C II.**
- **Awakenings:** Lv5 Tongue III, Lv6 Hop III, Lv7 Croak III.
- **Masteries:** Lv8 Tongue IV, Lv9 Hop IV, Lv10 Croak IV.

In this plan's mix, **Big Voice (ring 2 bells) arrives at the golem Keeper's clear** and is then used on the Rematch golem and the Warden: the numbers bind.

**Rules:**
- **CI test (EditMode).** Simulate the median first climb from the JSON tables and fail the build if Lv5 falls outside doors 6–8 or Lv10 outside doors 17–19.
- **Correct the §4.5 table** to match the yields. Do not "fix" the yields to match the table.
- **Hard (×1.5) maxes out earlier.** That is an intended reward: more doors at Crown glow.
- **Re-hatching at Lv1 in the Sky** must read as a *molt*, not a loss. Keep the molt part, give the Glide verb at Lv1, carry Rank talents, and let Sky Rematch doors pull in Well rooms to flatten.

## 5. Where every room lives, and whether it earns its minutes

**FPM (fun per minute)** is a design estimate of beats per minute, to be measured in greybox. A beat is getting stronger, laughing, or seeing something bigger.
- ★★★: at least 1 beat per minute (a built-in gag, a power outlet and a clear cue).
- ★★: about 0.7 per minute.
- ★: under 0.5 per minute.

| Room id | Source | Slot | Why it earns (or loses) its minutes | FPM | Cost | Tier |
|---|---|---|---|---|---|---|
| `hatch_pond` | NEW | Foot | Control in ≤5 s, Lv2 at 0:15, laugh by 0:30 | ★★★ | S | MUST-A |
| `bell_golem` | GDD `golem_belfry` | door 2 (fixed), Keeper, Rematch, Warden P1 | One cue, one rule; appears 4× per climb and you flatten it later. The old B♭ fork becomes a Twist (the crooked bell); "Untouched" becomes the hidden clear | ★★★ | M | MUST-A |
| `lily_raft` | NEW (TEAMBOUND Downstream) | 3C, ♣ pool | Coupling and blame with no text. Cue: a pike ripple; rule: everyone to the middle | ★★★ | M | MUST-A |
| `heron_shadow` | NEW (DOORS Rush) | 3A, ♠ pool | The cheapest rule door; a sneak lane for Hop II | ★★ | S | MUST-A |
| `fog_stairs` | NEW (TTITH floor 3) | ♦ pool | "You cleared it in a weird way": fireflies avoid the invisible path | ★★ | S | MUST-A |
| `fragile_jar` | NEW (TEAMBOUND Delivery) | ♣ pool | Carry a shared jar; drops are blame; tongue passes | ★★★ | S | MUST-A |
| `chorus_sentinel` | GDD `harmony_sentinel` | ♣ pool | Home of the Chorus Boon; the sad-croak gag; bots croak on your count (CRIT #18) | ★★★ | M | MUST-A |
| `keeper_bell_raft` | NEW | door 10 | A mastery exam built from two guaranteed lessons | ★★★ | M | MUST-A |
| `moth_library` | GDD `whispering_library` | ♦ pool | Rebuilt as a sneak: 3 glowing books, freeze when its antennae twitch. The code grid, liar books and Clue Composer are cut (CRIT #17, "homework") | ★★ (★ as written) | M | MUST-B |
| `echo_chamber` | NEW (TEAMBOUND Echo Chamber) | ♦ pool | Your croak repeats 2 s later; feeds the Echo Toad quest | ★★ | M | MUST-B |
| `slime_foundry` | GDD `clockwork_foundry` | fork E | Solo glory; never costs a Team Life | ★★ | M | MUST-B |
| `blind_eye` | GDD `glitched_watcher` | fork E | DOORS "Eyes"; the pillars hum *visibly* (CRIT #21) | ★★ | M | MUST-B |
| `heart_two_pads` | GDD `weighing_hall` | door 11 | Betrayal using a verb you already know | ★★★ | S | MUST-B |
| `heart_split_swallow` | GDD Pinky Promise | ♥ pool | A 10-second dilemma that ends in a clown honk | ★★ | S | MUST-B |
| `sp_grip_wall` | GDD `drip_chimney` | door 15 | PEAK per-frog grip; tongue hauls | ★★★ | L | MUST-B |
| `sp_tongue_tied_crossing` | GDD `fuse_tether` | 17C | Chained Together. The alcove wait is cut (CRIT #19); rising water is the chaser | ★★★ | L | MUST-B |
| `meeting_room` | GDD Reunion | after forks | Waiting becomes play: Frog Stack, a window to pass items through, the rescue rope | ★★ | M | MUST-B |
| `warden_the_jar` | GDD `the_snuffer` | door 20 | Power lap, Chorus, Trust Fall. Soot tendrils, Crown Rush and the two endings are cut | ★★★ | L | MUST-B |
| `heart_tied_bridge` | GDD `fuse_tether` | ♥ pool | Needs Knot and Cut; reuses the tether | ★★★ | M | SHOULD |
| `heart_doppelfrog` | GDD `liars_banquet` | ♥, ≥3 humans | Great with friends; unplayable solo | ★★★ with friends | L | SHOULD |
| `deep_dive` | NEW (TEAMBOUND Deep Dive) | ♣ | Shared air bubble; needs water tech | ★★ | L | LATER |
| `hollow_suit` | GDD §6.14 (One Body) | Sky set piece | Bespoke shared-control tech | ★★★ | L | LATER |
| `mirror_frog` | GDD `mimics_toll` | Sky | Copies the last frog to touch it; the poison economy is cut | ★★ | M | LATER |
| `dim_knight` | GDD `karmic_executioner` | Sky ♠ | "Kneels only in the dark": your glow becomes a liability, which is only fun once you're bright | ★★ | M | LATER |
| `weight_of_guilt` | GDD §6.10 | — | It depended on Soot and the Ledger | — | — | **CUT** |

**Breathers:**
- MUST-A: `br_jar_mites`, `br_window`, `br_gold`, `toy_fly_catch`, and `toy_frog_stack` at the Landing (the TEAMBOUND Babel homage).
- SHOULD: `br_sleeping_heron`, `toy_lily_sumo`, Jar Tag.

All 8 TEAMBOUND modes now have a home: Summit, Chained, One Body, Echo, Downstream, Deep Dive, Delivery and Babel.

**Pool size.** A Full Climb plays 7 group rule doors, so it needs 8 in the pool. It also needs 2 E doors, because 12E and 17E can't repeat. That makes the slice **8 + 2 E + 2 ♥**, not 12 + 4 ♥: fewer rooms, better ones.

## 6. System fates

| GDD / WORLD system | Fate | Fun-first reason |
|---|---|---|
| Draft, Latch, Stampede, Draft Cam, Theta Draft maze | CUT → picture pairs chosen by walking (4 s) | 45 s per floor with zero play |
| Ghost Sim, Grates, Keyholes, Side Doors, Visitors | CUT | Budget nobody sees |
| Omens, Echo tiers, tier scaling, WORLD tier+1 and `clamp` | CUT → difficulty at the entrance, skulls, 2 Twists | Nerfing growth is anti-fun |
| Wax HP, flame verbs, Scorched, ambient burn | CUT → 3 back spots, catchable spot, tadpole ghost, croak revive | A hit becomes a co-op catch |
| 10 Knives, Soot, Tribunal, Notes, bets, Pact Pot, Ledger overlay | CUT → Heart doors, Knot/Cut, Betrayal Cam, WANTED, Vengeance | One verb, one punchline |
| Altar, 16 traits, Anvil, Origins, keys | REPLACE → Boons (auto-granted in the first climb), Duos, classes (from climb 2) | A pick every ~2 min |
| Codex, Wick Level, Titles | REPLACE → Bestiary, Tower Rank; Titles LATER | Death fills a page |
| Embers / Drips / Sparks | REPLACE → Wish Coins and Pearls; stall from Landing 2 | No shopping before the payoff |
| Landing (11 stations), minigames | SIMPLIFY → 5 stations; Frog Stack and Fly Catch MUST, the rest SHOULD; Pinky Promise and Rumour Dice cut | Toys that actually get played |
| System voice, Rivals, Drama Director, Rival Register | KEEP (retuned) | The cheapest fun per minute in the game: text and barks. The Director scripts the first climb's beats. |
| Seeded generation | KEEP (graph over room prefabs; JSON data) | Replayable QA |
| Daily shop, Wickbook, daily bonus | CUT | Check-in habits, not fun |
| WORLD laws, Braid, the Mouth, Coin glance | KEEP (as dressing) | Free wow |
| Lantern-folk | KEEP for the ★1 reveal; Burnt-Out wisps are cut (nobody burns out any more) | — |
| Tide skin, astrolabe map, the Mound, lit wells, Scale Plates, Seam / X alcove | CUT or LATER; window breathers absorb the Seam | — |
| Transfers | KEEP only as the 2.5 s Landing arrival; counts toward the 12% cap | — |
| Layer Omens | REPLACE → movement verb on by default (Glide, Drift) | Layers as level-ups |
| Surfacing, lobby start layer, Tourist Pass | KEEP | — |
| ★1 choreography | KEEP (MUST-B); ★2–4 LATER | — |
| Cycle 2 | LATER | — |

## 7. The hero

The **Firefly Frog** stays behind Gate A (readability, week 3) and Gate B (Frog vs Wick-Flame on the same loop, week 4). If either gate fails, ship the Wick with the Flame axis.

**Addition from this lens:** the capsule greybox must already show the three growth readouts:
- belly emissive brightness;
- a count of orbiting fireflies;
- a visible effect per verb rank.

Gate B scores recall of "name a power you gained", and a grey capsule can't earn that. The procedural rig (2-bone IK, a spring-bone throat sac, a tongue spline) is on the critical path for "attractive". Lock nothing that assumes the frog until both gates pass.

## 8. Slice scope

**MUST-A: the Quick Climb, the gate build (weeks 1–6)**
- **Rooms:** `hatch_pond`, `br_jar_mites`, `bell_golem`, `heron_shadow`, `lily_raft`, `br_window`, `fog_stairs`, `fragile_jar`, `landing_well` + `toy_frog_stack`, `toy_fly_catch`, `chorus_sentinel`, `br_gold`, `keeper_bell_raft`.
- **Systems:**
  - 8 bindings; 3 verbs × 4 ranks; Glow Level;
  - auto Boons (16 in the pool);
  - the Landing 2 ceremony; Rank F → E; Bestiary (7 pages);
  - Easy and Normal; the results ceremony;
  - the 7 Rookie Rivals and the Drama Director script;
  - the growth CI test.

**MUST-B: the Full Climb and ★1 (the slice)**
- **Rooms:** `heart_two_pads`, `heart_split_swallow`, `moth_library`, `echo_chamber`, `slime_foundry`, `blind_eye`, `meeting_room`, `sp_grip_wall`, `sp_tongue_tied_crossing`, `warden_the_jar`, plus the Rematch (a system, not a room).
- **Systems:** pick-1-of-3, Duos, Legendaries, Knot/Cut, Betrayal Cam, Vengeance, 3 open classes, 4 secret quests (the data-only ones), Pearls, 24 earned cosmetics, Out of the Well.

**SHOULD:** `heart_tied_bridge`, `heart_doppelfrog`, `br_sleeping_heron`, `toy_lily_sumo`, Jar Tag, Landing Party, Hard/Hell, Sealed redaction, 2 more secret quests, Supporter Sets.

**LATER:** the Sky layer (`mirror_frog`, `dim_knight`, `hollow_suit`), `deep_dive`, ★2–4, Mimic Climb, proximity voice, Daily Seed, Titles, the astrolabe, Cycle 2.

## 9. The five biggest risks

1. **The funniest rooms are the hardest to network.** Raft, tether, grip wall and tongue-on-player with 8 bodies and 7 host bots: if they rubber-band, the laughs turn into frustration.
   - Mitigation: the proof of concept in weeks 1–2 covers exactly these.
   - Fallbacks: shove instead of tongue-on-player; a host-owned raft body with client visual smoothing; a kinematic tether.
2. **The onboarding overload just moves past the Keeper.** Without the one-per-stop staging in §2, doors 10–13 stack about 8 systems.
   - Mitigation: telemetry on quits between door 11 and Landing 3.
   - Hard cap: one full-screen card per door.
3. **Content burn.** At ~57 s per door, rooms are used up 2–3× faster, and repetition shows by the third climb.
   - Mitigation: build the room kit before the rooms; 2 seeded Twists and rank lanes per room; track "seen this room" fatigue; agents add rooms as data.
4. **Solo comedy depends on bots.** No hit in the research gets its comedy from bots. If the Rivals read as dumb AI, the solo default (the Quick Climb) goes flat.
   - Mitigation: script the first climb's beats (Kestrel, the Moss save, Vex's betrayal); keep the Rookie label; A/B test bot betrayal.
5. **Attraction depends on an agent-built procedural frog.** If it looks off, pillar 1 ("everyone can see it") and the capsule both fail.
   - Mitigation: Gates A and B; budget the extra 1.5–2 tech-art weeks; keep the Wick-Flame fallback ready. Nothing frog-specific gets locked early.