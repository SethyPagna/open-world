# Reader: GDD_CRITIQUE.md

**Source:** `_design/GDD_CRITIQUE.md` (dated by file time 2026-09-28, 408 lines, 34 numbered points, read in full).
**Reader date:** 2026-09-30.
**Purpose:** sort this early critique into what v2 keeps, what goes to the archive, and what fights the six v2 pillars (P1 Clear, P2 One World One Story, P3 Genuine, P4 Easy to Start, P5 Organized, P6 Open World Together).

How to read the marks below:
- "#7" means the critique's numbered point 7.
- "§6.6" means the section of `GDD.md` that the critique points at. This reader did not re-read `GDD.md`; it only checked two lore lines there (lines 21-22 and 87-90) to confirm the setting.
- The source tags each point with letters a-g and never defines them. By usage they read roughly as: a = contradictions and clarity, b = room playability, c = bots and solo, d = progression and shop, e = economy and exploits, f = scope and tech, g = variety and replay.

**Important context.** This file critiques the **KNOTSPIRE** draft, not the Firefly Frog design. In KNOTSPIRE you play a **Wick**, a living candle. Wax is your health and your weight, and the game ran in a browser. So almost every name here (Wick, wax, Drips, Tallow, Snuffer, Chandler) is candle-themed and is off-theme for v2. What carries over is mostly **method**: the rules, tests and numbers the critique uses to find broken design.

---

## Summary for the archive

`GDD_CRITIQUE.md` is a 34-point review of `GDD.md`, the KNOTSPIRE draft that came before KNOTWELL. Its title says "unapplied": the fixes never went back into `GDD.md`, and KNOTWELL later replaced the candles with the Firefly Frog.

KNOTSPIRE was a party roguelite for 1-8 players, with AI Rivals in empty seats. You played a Wick, a living candle whose wax was both health and weight. Players climbed a tower floor by floor, split into parallel door rooms, made and cut Pacts (Knots), and could betray each other (Knives). A Crown boss ended the run with a choice: light the Great Wick together, or claim the Everflame alone.

The critique found five kinds of problem:
- Some content could not be finished at some player counts (Crown sconces, solo decoys, soft-locking tendrils).
- Bots and the economy misfired. Bots solved puzzles for the human, betrayal odds did not work, and there were farms and infinite loops.
- Rooms fell to one instant tell, or were genre imports with a candle skin.
- Scope was about twice the brief.
- Names and rules collided (Drip, Echo, Cut, Tallow, Chute, Martyr).

Each point comes with a concrete fix, often with a numeric test.

For v2 the candle theme, the betrayal and the door-room structure are gone. What lasts is the method. Content must be finishable at every party size. Helpers must not spoil discovery. One word means one thing. Identity colours are fixed and never sold. Rewards must not push players to skip content. Every rule gets numbers.

---

## Reusable for v2

Each row says where the idea sits, why it fits the v2 pillars, and what must change. Candle names are kept only so the archive can be traced; v2 should rename everything to fit the frog world.

### Design rules and acceptance tests (method)

| Idea | Where | Why it fits | v2 note |
|---|---|---|---|
| **Finishable at every party size.** The Crown needed "a test: completable for every lit count from 1 to 8". Mechanics scale with the count (sconce count = min(5, lit climbers), placed closer when 3 or fewer). | #1; #18 (solo decoys took 10-14 s against a 9 s window) | P6: drop-in co-op means a quest can have 1 frog or 8 at any moment. | Make "clearable at 1, 2, 4 and 8 players" a gate for every quest, world event and boss. Scale by live player count, not by lobby size. |
| **Helpers must not spoil discovery.** Bots work in 3 stages: Explore (poke things, make the canonical mistake), Theorise (after a hint or a correct partial action), Execute (after the plain hint, or when the human pings "Go!"). A bot knows at most the human's level + 1 and never does the key action in the human's first 90 s. | #2 | P1 and P4: players learn by doing, not by watching a bot. P3: companions feel like people, not solvers. | Apply to v2 quest companions, NPC helpers and any fill-in frogs. Keep the gate: at least 60% of first-time solo players make the key discovery themselves. |
| **Hint ladder with a first-timer gate.** Hints come in two steps (a hint at 50% of the time, plain wording at 75%). The test is "at least 70% of first-timers clear before the 75% hint", not "clears in under 6 min". | #2; #12 | P1: the player always gets a way forward. P4: the test measures real understanding. | Open-world quests have no countdown, so trigger the ladder by time stuck (for example 60 s and 120 s with no progress). Keep the 70% gate. |
| **One word means one thing.** The critique lists 6 collisions (Drip, Echo, Cut, Tallow, Chute, Martyr) and renames each one. | #33 | P1 and P5: players and agent engineers both stop guessing. | Keep a v2 glossary. Every new term is checked against it before it ships. |
| **One key does one thing.** Tab had 3 bindings (Clue Log, Ledger, System history). X did two things when you were both tethered and in a Pact. | #13; #17 | P5: "reachable in 2 inputs or fewer" fails if an input means different things. | Put every binding in one table. No key has two meanings in the same context. |
| **Every rule has numbers.** Dash length, whether growth adds or multiplies, where a faller lands and who gets credit were all missing. Fixes: dash 12 m or 3 bounces; growth +0.1 scale per impact (additive); credit goes to the shover. | #22 | P1: a rule you cannot state cannot be read. It also matters because agents build most of the game from text. | Every mechanic spec lists its numbers, end conditions and who gets credit. |
| **Clearable with audio muted.** In blindfold view, each true hum is drawn as expanding rings ("visual sonar"). | #21 | P1 and P4: deaf players, and players with the sound off, can still play. | Adopt as a hard rule for all v2 content. |
| **Fair reaction windows.** Snip's 0.6 s channel was under human reaction time, so its floor became 0.9 s. The gaze check should use the character's facing, or the camera only after a 0.5 s static warning. | #13; #21 | P1: failure always feels fair. | Any hostile wind-up or grab in v2: at least 0.9 s, with a visible tell. |
| **Tells glow ("glow chalk").** "Darkness by default" fought "readable", so every tell was made emissive. | #28 | P1. It also fits the firefly theme: light is the frog's own tool. | In the dark well, every tell, path and interactable carries its own light. |
| **Rewards must not steer players away from content.** SOLE E rooms paid about 4.5 times an A share per head, so the best solo play saw only 2 rooms per run. | #10 | P1 and P2: the best reward path should also be the path that shows the world. | Check v2 quest and region rewards so that skipping regions is never the best plan. |
| **Economy test with a p95 cap, plus exploit checks.** The claim path paid 555 against a 520 p95 cap. Kinship was an infinite pump (+5 wax every 0.5 s). A solo farm paid +300 per run. The Mimic "sacrifice" had positive expected value. | #7; #9; #34 | Fits the v1 promise of progress that is "addictive-but-fair". | Every co-op bonus gets a cap and a condition (Kinship fix: only below 50% max, at most +20 per room). Run the p95 test on every reward table. |
| **Undo restores position only.** Rewind restores position and velocity, never resources, and is blocked across kill volumes and instance changes. | #7 | P1: no resource exploits. | Apply to any v2 respawn, rewind or "tongue back" rescue. |
| **Do not sell information the UI already shows.** The 25-Ember Rumour sold names that Soot, System lines and banners already showed. | #14 | P5: nothing is duplicated. | General rule for v2 shops and NPC services. |
| **No serial watching.** Eight Trust Falls in a row cost 160 s of watching; fix: pairs, 12 s limit. Altar picks in strict order became simultaneous claims within 15 s. | #24; #30 | P6: nobody stands still while others play. | Group moments in v2 run in parallel, or in pairs with a short limit. |
| **No dead waiting.** The Fuse took about 3:15 at best, so a good group waited up to 2 min. Fix: once the fuse is socketed, the flame "catches" at 4 m/s. | #19 | P1 and P6: pacing. | Once a group has done the hard part, the payoff comes fast. |
| **Honest build budget.** Replace "one script per room" with an S/M/L bespoke budget, and schedule the L pieces early. Keep a MUST / SHOULD / LATER cut list. | #4 | P5, and the tiny human team building mostly with agents. | Size every v2 zone, quest chain and boss as S, M or L before building. |
| **Multiplayer from the first milestone.** M1 needed a 4-player build but the server arrived in M4. | #4 | P6. | In v2, NGO host mode belongs in the first slice. |

### World, story and mechanics ideas

| Idea | Where | Why it fits | v2 note |
|---|---|---|---|
| **Build activities from the world's own verbs.** The critique names the genre imports (logic grid, whodunit, PEAK, Golden Balls, Liar's Dice, Among Us vote). It says only Wicks, Knots, Soot/Regrets and the System voice were truly native. | #32 | P2: every activity comes from the world's rules. | Build v2 quests from Tongue, Hop, Croak and light. The Chimney fix (dripping on the wall makes a hold for the climber below) is a good pattern: helping costs you something and is visible. |
| **Light reveals.** Library text changes when read Brightened or Dimmed. | #17; #32 | P2: light is the frog's power, so reading the world by glow fits the story. | A firefly-glow reveal: signs, carvings or paths that change under light. Show the rule openly. |
| **Wake someone with light to talk.** In the "Séance of the Snuffed", diners are snuffed candles that you Relight, at a cost, to question. | #32 | P2 and P3: talking is done with the world's main verb. | Keep only the idea: a dim or sleeping character wakes when a frog shares light. Drop the whodunit. |
| **Fallen things become routes.** Watcher pillars fall along the wall, do no damage, and become climbable ramps. | #22 | P2: climbing is the frog's life, and the world visibly changes because of players. | Use for world events: what breaks becomes a new path. |
| **Readable catches.** Trust Fall shows a shadow circle (±1 m drift) to catchers only. | #22 | P1 and P6: helping is readable. | Pairs with v1's "tongue back a lost firefly" rescue. |
| **Co-op puzzles where sharing is physical.** The Library fix: 3 rings × 6 glyphs (120 answers, not 1,680); 6 lectern stands where a placed book becomes public; a dial that greys out ruled-out answers. | #17 | P1: a small answer space and visible elimination. P6: sharing is an act in the world, not a menu. | Keep the pattern and the smaller size. Drop the private-clue hoarding. |
| **Twists as data.** Each room ships 2 seeded Twists, each with its own rule and study track. Example: "the Mimic copies the second-to-last toucher". | #11 | P6: a persistent world needs replay (daily or weekly variants) without new code. | Show the twist's rule plainly (P1). No hidden study gates. |
| **Omens as world states.** The slice cut Omens to 3: Heavy Air, Lantern-dark, Hushed. | #4 | P6: a living world can have weather-like states. | Candidate for shared world weather. At most 3, each announced with one plain line. |
| **The "together" ending.** The Candlelit ending: everyone who reaches the top lights the Great Wick together, and the whole tower is lit for everyone still climbing. | #9; `GDD.md` lines 87-90 | P2 and P6: a shared goal that helps every player in the world. | Keep the shape (a light shared by the whole well). Drop the "claim it alone" half. |
| **Short modes as configuration.** "Short Climb" (floors 1-2 plus a mini-Crown, about 15 min) and "Landing Party" (a minigame playlist), both built from existing systems. | #26 | P4: short sessions. P6: easy drop-in. | Town minigames and short world events, built from existing systems. |
| **Physical toys over lying games.** Make a physical toy a MUST (Hot Wax Potato, or Wick Curling built on shove, dive and brace). Move Pinky Promise down to SHOULD. | #26 | P3 and P4: instant, readable fun with no social reads. | Good fit for town play spaces, with frog verbs. |
| **Traits that always help.** Every trait gets a general effect plus its room synergy (example: Resonance also staggers any monster for 1 s). | #25 | P5: no dead picks. | Apply to v2 abilities or badges. |
| **Growth shown on the body, hitbox unchanged.** A flame corona ring per clear. The wick visibly stretches instead of the flame floating over a shrinking body. | #25; #28 | P1: read status at a glance. Matches v1's "growth as light". | Frog glow rings or back-spot brightness. Silhouette and hitbox never change. |
| **Named checkpoints, not arbitrary state.** Each room declares 2-3 named checkpoints with canned state. Late visitors join only at a checkpoint and wait 10 s or less. | #5 | P6: drop-in without rebuilding arbitrary mid-quest state. | NGO already syncs NetworkVariable values to late-joining clients ([NGO docs](https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.5/manual/basics/networkvariable.html)). Checkpointed quest states keep join and save logic simple. |

### Characters, cosmetics and shop

| Idea | Where | Why it fits | v2 note |
|---|---|---|---|
| **Fixed identity hue per player.** Each seat gets a hue from an 8-colour, colour-blind-safe palette, plus a shape glyph. Nothing within 20° of the alert hues (crimson about 345°, violet about 259°). Cosmetics change shape, pattern and particles, never the identity hue. | #6 | P1 and P6: tell up to 8 players apart at a glance, even when two own the same skin. | Put the identity hue on name tags, map pins, pings and a rim or back-spot accent, so body skins stay free to sell. |
| **A "Trim" slot.** Collars, spectacles, cowls, scarves and labels, kept to a band below the head so silhouette, height and hitbox stay the same. | #27 | P3: readable silhouettes. Also sells well: the critique calls hats and accessories the top category in Fall Guys and Among Us (no source given). | For the frog: a band below the eye bumps. Verify the market claim before relying on it. |
| **Every character look is buyable; 4-piece themed sets.** | #27 | P2 and P3: skins come from people in the world, so the shop tells the story too. | Every named v2 NPC look becomes a set. |
| **Only sell what others see.** 4 of 10 slots (Knock, System Window, Betrayal Snap, Shadow) were rarely seen by others; the slice cut to 7 slots. | #4; #27 | P5: fewer, clearer slots. | Count the slots others can actually see before adding one. |
| **A character's look must match their description.** Kestrel's loadout (Sparkler + Traffic-Cone) contradicted its "feather wick". | #27 | P3: consistency makes characters feel real. | Add a "look matches bio" check to the character sheet review. |
| **A named Rival cast** (Vex, Maud, Gutter, Pell, Brass, Lumen, Ines, Kestrel) and a many-armed merchant (Old Tallow the Chandler). | #2; #3; #9; #27; #28 | P3: named, specific personalities. Kestrel and Vex carried on into KNOTWELL. | Reuse names only where they fit frog characters with honest, non-betrayal roles. A memorable town merchant is a good slot; rename away from "Tallow". |

### Art and tech

| Idea | Where | Why it fits | v2 note |
|---|---|---|---|
| **One shared creature rig.** `ProcRig`: spring bones, 2-bone IK, look-at, rigid segments, because the knight, the Executioner and the six-armed merchant would look stiff. | #28 | P3: creatures that move with life. One kit for agents to reuse. | Unity's Animation Rigging package includes a Two Bone IK constraint ([Unity docs](https://docs.unity3d.com/Packages/com.unity.animation.rigging@1.3/manual/constraints/TwoBoneIKConstraint.html)). |
| **Light budget.** A fixed pool of 8 PointLights; the rest shown as emissive plus probe light. Transmission on High only. One spot shadow instead of a cube shadow. | #28 | Supports a dark, firefly-lit world with 8 glowing players on modest PCs. | The shader-recompile reason was browser-specific. URP Forward+ has no per-object light limit but still a per-camera limit ([Unity 6 manual](https://docs.unity3d.com/6000.0/Documentation/Manual/urp/rendering/forward-rendering-paths.html)), so a light budget still matters. |
| **Client-side physics for your own chain.** The client simulates its own chain against interpolated partner positions, instead of predicting only its own capsule against server tethers. | #19 | Stops rubber-banding under host authority. | Tethers are archived, but the lesson applies to any v2 tongue-grapple, vine or rope under NGO host mode. |
| **Freeze generation at one moment.** Generation read player counts at Draft start while events later changed them; fix: freeze at floor close. | #29 | P1: what you see is what you get. | Any seeded world event locks its inputs at one named moment. |

---

## Party-only (to archive)

These only make sense in the betrayal party game. None of them go into v2.

**Betrayal core**
- The Knife (betrayal action), "The Drop" (the 2D Knife rename), and the delayed Knife disclosure rule (#14, #33).
- Pacts and Knots: Cut the Knot (from anywhere, then fixed to the same instance and 12 m), Cinch (8 m), the Snip trait (0.6 s, 0.5 s with Frayed), and the X-key Pact cut (#13).
- Soot bands, Burn Out, Smoke and Scorched climbers as elimination and shame states (#12, #14, #30, #34).
- The Tribunal (the Among Us-style vote) and the 25-Ember Rumour (#4, #14, #32).
- Confession (20 Embers + 1 Soot) and the Forgive/Condemn prompt (#1, #34).
- The Pact Pot and the Betrayal Off lobby option (#4, #15).
- The Betrayal Cam, the full-screen Betrayal Snaps, Shadow decals and the Knock and System Window slots (#4, #13, #27).

**Rival betrayal AI**
- The utility model: Knife if U > 1.0, the ghost sigmoid(4(U − 1)), and the proposed shared P = sigmoid(10(U − θ)) with θ per Rival (Vex 0.55, Maud 0.6, Gutter 0.5 on grudges, helpers 1.5) (#3).
- The Drama Director and its run Knife budget of 3-5 (#3).
- The Rival Register and its grudges (#3, #4).
- Ghost bots Knifing offscreen, capped at 1 per room (#3).
- Bots pinning Notes that are "true with probability Honesty/100" (#31).

**Crown betrayal ending**
- The Everflame solo claim, the Crown Rush, Crown Fragments (one buyable), Wardens (Rivals with Loyalty ≥ 50) shoving channellers, and simultaneous channels cancelling (#9).
- Named and Nameless Crown tendrils tied to victims and perpetrators (#1).

**Rooms built on betrayal or lying**
- The Hall of Grievances: the Regret, footprints of Knife victims, and Doubt walks (#15).
- The Liar's Banquet: the poisoner, testimonies, the Seating Plan, the Taster and Taster's Pinch, the Hidden Piece, and the instant tells (#16, #34).
- The Whispering Library's private clues and hoarding, liar text, and the radial Clue Composer (#17).
- The Weighing Hall's melt/Chute dilemma, and "The Cut" paying the puller +1 share (#8).
- The Mimic drinker sacrifice, Martyr's Mark and curses lasting to the Crown (#34); the Martyr payout (#33).
- The Chute trapdoor that drops victims (#12, #33).

**Tethers**
- The Fuse Tether "Chained" room (1C), tether segments and XPBD tether gameplay (#13, #19).

**Spectating, betting and cross-room tricks**
- Keyhole bets, live odds and the payout formulas (Clear 0.9/p, Fail 0.9/(1 − p), 1.05 floor), Knife bets at 3.0× (#23).
- Keyhole live spectating and cross-instance Grate feeds (#4, #20).
- Side Door takeover, the Visitor and the Visitor Gate airlock (#4, #5).

**Lying minigames**
- Pinky Promise (a Golden Balls clone) and Rumour Dice (a Liar's Dice clone) (#26, #32).
- Notes with truth stamps; the 12 templates cut to 6; template 11 "the answer is…" (#4, #31).

**Payout splits**
- SPLIT and SOLE shares that depend on how many clear, and the rule for "the victim's share transfers" (#8, #10).

---

## Conflicts with the new pillars

| Item | Where | Pillar | Why |
|---|---|---|---|
| **The candle theme** (Wick, wax, Drips, Tallow, Snuffer, Chandler, Great Wick, Everflame). | whole file | P2 | v2 is the Firefly Frog in the well. Candle names would break the one-world rule. Keep ideas, never names. |
| **Parallel door rooms and instances:** Drafts, door lanes (A/E), Grates between rooms, Keyhole views, Side Doors, ghost rooms simulated from dice timelines. | #5; #10; #20; #29 | P6, P2 | v2 is one connected world where other players are visible. Rooms in separate coordinate spaces are the opposite. The critique itself calls this "the largest hidden cost". |
| **Hidden rules behind study.** Decree words are redacted until your study level rises, a Codex fills over runs, and a study-0 player saw zero Decree words. | #2; #11; #34 | P1, P4 | v2 shows each rule openly. The "riddles with teeth" pillar hid what to do. |
| **Room countdowns and the Tide.** Rooms ran 4:00-5:30, and RNG in other rooms could speed your timer ×1.5. | #12 | P1, P4 | A stranger's dice roll changed your clock. Open-world quests should not have hidden global timers. |
| **Scope about twice the brief** (Tribunal, 12 Notes, bets, spectating, Side Doors, 6 Omens × Echo tiers, Drama Director, Pact Pot, 10 Rivals, 10 slots, a 40-tier Wickbook, clips, two builds). | #4 | P5 | Too many systems for a tiny team. Treat as a warning: v2 needs a cut list from day one. |
| **Too many progress tracks and currencies:** Embers, Drips (renamed Seals), Crown Wax, wax as HP and weight, Codex study levels, a 40-tier Wickbook, Master Keys, per-run traits, Omen × Echo tiers. | #4; #9; #25; #33 | P5, P4 | Too much to learn and track. v2 should have one currency and one visible growth line where possible. |
| **Genre imports:** logic grid, whodunit plus vote, PEAK with melting, Golden Balls, Liar's Dice, the Among Us vote. | #32 | P2, P3 | Borrowed shapes with a skin, not the world's own activities. |
| **Homework puzzles.** The Library was a 4-of-8 permutation (1,680 answers) with 8 private clues in 4:30, plus a patrolling noise monster. | #17 | P4, P1 | The critique says groups would reach for pen and paper. |
| **Darkness by default** with no rule that tells glow. | #28 | P1 | You cannot read what you cannot see. The fix (glow chalk) is in Reusable. |
| **An audio-only room.** The Glitched Watcher's blind route needed three spatial hums, HRTF was on High only, and deaf players could not play it. | #21 | P1, P4 | Fails accessibility and the no-manual goal. |
| **Wax as health and weight** (shrinking body, weight units in 2D, a flame floating over a shrinking stub). Units were also inconsistent (10 units = 15 kg, Plate default 50, Echo Wick "weighs 30"). | #7; #8; #28 | P1 | One number doing two jobs is confusing. v1's 3 glowing back spots already replaced it. |
| **A roguelite run structure:** 36-45 min runs, per-run trait picks at an Altar, a Crown every run. | #24; #25; #26 | P6 | v2 is a persistent world, not a run that resets. |
| **Solo play depended on bots and ghost sims** that could solve rooms or flood the Ledger with offscreen events. | #2; #3 | P1, P6 | Much of the world happened out of sight. In v2 what matters happens where players can see it. |
| **Name collisions:** Drip ×5, Echo ×4, Cut ×3, Tallow ×5, Chute ×3, Martyr ×3. | #33 | P1, P5 | The rule is reusable; these names are not. |
| **Input overloads:** Tab ×3, X ×2, and a mid-room Forgive/Condemn prompt with no input spec. | #13; #17; #34 | P5 | Breaks "2 inputs or fewer, one meaning each". |
| **Cosmetic slots nobody else sees** (Knock, System Window, Betrayal Snap, Shadow) and an evidence system tied to purchasable flame colours. | #6; #27 | P5, P1 | Scattered slots, and identity that breaks when two players own the same item. |
| **A browser target:** a `ws` relay, 60 fps on Iris Xe, shader recompiles as lights changed. | #4; #28 | P5 (the fixed Unity 6000.3.25f1 + URP + NGO 2.13.3 + Steam stack) | The platform assumptions are obsolete. Only the budgeting lessons carry over. |
| **Instant tells that make other systems dead** (Banquet: a tick at 2 m, a film at 1 m, a 280 g cup, each solving the room in about 20 s). | #16 | P1, P5 | The room is party-only, but the lesson holds: if one tell solves it, cut the other systems or the tell. |

---

## Key numbers and names

Keep these consistent if v2 reuses the idea. Candle names are listed only for tracing back to the archive.

| Number or name | Value | Where | Use in v2 |
|---|---|---|---|
| Players per world | 1-8 (tested for every count) | #1 | Matches v2's 8-player Steam lobbies. |
| First-timer gate | ≥ 70% clear before the plain (75%) hint | #12 | Quest clarity gate. |
| Solo discovery gate | ≥ 60% of first-time solo players make the key discovery themselves | #2 | Companion design gate. |
| Helper restraint | Helper knowledge ≤ player + 1; no key action in the player's first 90 s | #2 | Companion rule. |
| Hint ladder | hint at 50%, plain wording at 75% | #2; #12 | Convert to time stuck. |
| Minimum hostile wind-up | 0.9 s (Snip floor) | #13 | Fairness floor. |
| Gaze warning | 0.5 s static warning before a camera-based gaze check | #21 | Fairness floor. |
| Identity palette | 8 colours, colour-blind safe, + a shape glyph; nothing within 20° of alert hues (crimson about 345°, violet about 259°) | #6 | Player identity on tags, pins and pings. |
| Economy cap | p95 of 520 per run (the claim path hit 555) | #9 | Method: set a p95 cap per session. |
| Co-op bonus cap (Kinship) | only while the receiver is under 50% max; at most +20 bonus per room | #7 | Pattern for any co-op heal or boost. |
| Light budget | a fixed pool of 8 PointLights; the rest emissive + probes | #28 | Starting point for a URP light budget. |
| Late join | 2-3 named checkpoints per piece; join wait ≤ 10 s | #5 | Drop-in rule. |
| Replay twists | 2 seeded Twists per piece, data only | #11 | Variant rule. |
| Omens (slice) | 3: Heavy Air, Lantern-dark, Hushed | #4 | World-state candidates. |
| Cosmetic slots (slice) | 7 (from 10) | #4 | Upper bound for v2. |
| Season pass (slice) | 20 tiers (from 40) | #4 | Upper bound for v2. |
| Rivals (slice) | 8 (from 10) | #4 | NPC cast size reference. |
| Library answer space | 3 rings × 6 glyphs = 120 (from 1,680); 6 lecterns; exactly 8 clues | #17 | Puzzle size reference. |
| Short mode | about 15 min (floors 1-2 + a mini-Crown) against a 36-45 min full run | #26 | Short session length. |
| Group-moment limit | pairs, 12 s each; simultaneous claims within 15 s, a bump within 1 s | #24; #30 | No serial watching. |
| Fuse catch speed | 4 m/s after the hard part (was 0.7 m/s over 110 m) | #19 | "Payoff comes fast" rule. |
| Physics numbers | dash 12 m or 3 bounces; growth +0.1 scale per impact (additive); Trust Fall drift ±1 m | #22 | Examples of fully specified rules. |
| One weight unit | 1 wax = 1 kg of prop = 1 W | #8 | Pattern: one unit everywhere. |
| Renames | Drips → Seals; Echo rooms → Reprise; the 2D Knife → The Drop; Tallow rarity → Paraffin; Golem chutes → spouts | #33 | Archive trace only; all candle-themed. |
| Rival names | Vex, Maud, Gutter, Pell, Brass, Lumen, Ines, Kestrel | #2; #3; #9; #27 | Kestrel and Vex already live on in KNOTWELL. |
| World names | KNOTSPIRE (the draft), the Knotspire tower, the Crown Door, the Great Wick, the Everflame, the Snuffer, Old Tallow the Chandler | title; #9; #28; `GDD.md` lines 87-90 | Archive only. |
| Named creatures | Echoing Golem, Harmony Sentinel, Executioner, Mimic, Glitched Watcher, Chrono-Slime, the Regret | #10; #11; #18; #21; #22; #15 | Candidates for rule-based encounters if re-themed as well creatures. |

## External sources used

- Unity 6 manual, URP Forward and Forward+ rendering paths: https://docs.unity3d.com/6000.0/Documentation/Manual/urp/rendering/forward-rendering-paths.html
- Unity Animation Rigging 1.3, Two Bone IK constraint: https://docs.unity3d.com/Packages/com.unity.animation.rigging@1.3/manual/constraints/TwoBoneIKConstraint.html
- Netcode for GameObjects 2.5, NetworkVariables (late-joining clients get the current value): https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.5/manual/basics/networkvariable.html

<!-- END -->
