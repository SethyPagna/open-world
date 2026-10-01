# Critique of GDD.md (KNOTSPIRE draft) — unapplied

1. **[a/b] The Crown can be physically impossible or soft-lock (§6.13).**
   - **Sconce distances rule out a sync.** Vigil sconces at r = 16 m sit 18.8 m apart (72°), and 27.7 m apart in the 3-sconce "1 climber left" case. At 5 m/s plus a 0.3 s hold, nobody lights two inside the 1.5–2.5 s window, and Firebrand's 3 s cooldown doesn't help either. Any Crown with 4 or fewer lit climbers, which is common in a "brutal" run, can never finish Phase 1.
   - **Tendrils can lock the arena.**
     - With fewer than 2 Knives, the two Nameless tendrils need "any two climbers", so a lone survivor is hard-locked.
     - A named tendril whose victim and perpetrator are both Burnt Out can never be cleared.
     - A present victim who refuses to touch holds everyone hostage, because the perpetrator may only confess when the victim is absent.
   - **Fix:**
     - Sconce count = min(5, lit climbers), placed at r = 6 m when there are 3 or fewer.
     - Give each sconce a windable Vigil Decoy (reuse the 3A kit).
     - Tendrils with no present party become Nameless. Nameless tendrils need 1 climber holding for 4 s when only one is alive.
     - The perpetrator can always confess (20 Embers + 1 Soot); the victim's touch is just the faster route.
     - Add a test: the Crown is completable for every lit count from 1 to 8.

2. **[c] In solo, bots will solve every room for the human, which kills the redaction/"riddles with teeth" pillar (§6.0.3, §8.1, every Bot script).**
   - **Problem.** §8.1 says bots know Decree words only up to their study level, but every `botPlan` hard-codes the answer:
     - Throwers stand on the C/E/G lines and avoid B♭.
     - Readers go straight to the wax-script labels.
     - Winders compute `bellStart + 3.0 − placeTime`.
     - The Library Solver runs constraint propagation.

     Pell starts at study level 3. A first-time solo player will just follow Pell or Brass.
   - **Fix:** gate every botPlan in three stages.
     - **Explore:** poke kit props and make the room's canonical mistake.
     - **Theorise:** begins after hint50, or once any climber does a correct partial action or pings the right object.
     - **Execute:** begins after plain75, or immediately if the human pings "Go!".
     - In solo, cap every bot's effective study level at the human's level + 1. A bot never performs the final key action within the human's first 90 s in the room.
     - Add an M2 gate: first-time solo players make the key discovery themselves in at least 60% of sessions.

3. **[c/e] The betrayal math can't deliver the promised betrayals, and live and ghost bots are inconsistent (§8.5–8.7).**
   - **Live bots almost never Knife.** They Knife only if U > 1.0.
     - Vex with no grudge, a maximum gain and zero witnesses: 1.02 − 0.06 − 0.15 = 0.81. The Director's +0.2 only reaches 1.01.
     - Maud tops out at 0.65 (0.85 with the Director).
     - Gutter needs a grudge plus at least 41 Embers at stake.

     Grudges come only from being Knifed, so on a first run nobody Knifes first. The solo human sees almost no live bot betrayals, and the Director's target of "1–3 witnessed" is unreachable.
   - **Ghost bots Knife constantly.** They use sigmoid(4(U − 1)), which puts Vex at up to 32% per betrayal window. The Ledger floods with offscreen Knives: a Tribunal every floor, 8 Crown tendrils, and a Hall of Grievances full of strangers.
   - **Fix:**
     - Use one model for both: P = sigmoid(10(U − θ)) with a θ per Rival (Vex 0.55, Maud 0.6, Gutter 0.5 on grudges, helpers 1.5).
     - Cap ghost Knives at 1 per room.
     - Give the Director a run Knife budget of 3–5, at least 1 of them in the human's live rooms. It spends the budget by lowering θ, not by nudging U.

4. **[f] Scope is roughly twice the brief, and "one bespoke script per room" is fiction (§6.0.1, §17).**
   - **Beyond the brief, MUST includes:**
     - Tribunal
     - 12 Note templates with truth stamps
     - Keyhole bets with live odds
     - cross-instance Grate feeds and Keyhole live spectating
     - Side Door takeover
     - 6 Omens × Echo tiers
     - the Drama Director and the Rival Register
     - the Pact Pot
     - 10 Rivals with per-room quirks
     - 10 cosmetic slots, including wall-projected Shadow decals and 6 full-screen Betrayal Snaps
     - a 40-tier Wickbook
     - clips
     - two builds
   - **Several rooms need far more than one script.**
     - The Library and the Banquet each need a logic generator with uniqueness checks.
     - The Weighing Hall has baseline, bridge and Tithe logic.
     - The Hall of Grievances needs portraits generated from the Ledger plus cross-tower Confession answers.
     - The Crown has 3 phases.
   - **Cut list for the slice:**
     - Bets → LATER
     - Notes → 6 templates with no stamps (SHOULD)
     - Tribunal → LATER (Soot and the Crown tendrils already punish)
     - Side Doors → live rooms only (see #5)
     - Grates → silhouette glass (#20)
     - Omens → 3 (Heavy Air, Lantern-dark, Hushed)
     - Rival Register → SHOULD
     - Rivals → 8
     - Cosmetic slots → 7 (drop Knock, System Window and Shadow)
     - Wickbook → 20 tiers
   - **Also:**
     - Replace the one-script rule with an honest S/M/L bespoke budget per room, and schedule the L rooms (Library, Banquet, Crown) early.
     - M1 needs a 4-player LAN build but the server arrives in M4. Move a minimal `ws` relay into M1.

5. **[f/b] `fromGhostState(phase, progress, survivors)` for 12 rooms is the largest hidden cost (§3.7, §6.0.2, §16.4).**
   - **Problem.** Rebuilding arbitrary mid-room state from a dice timeline means a bespoke serializer per room: Golem scale, cracks and 12 rolling stones; a fuse chain 60 m along with burned segments; which Library clues were read; a Weighing Hall baseline after a partial exit. The result must also match what the Keyhole captions already showed. The signature also differs between §3.7 and §6.0.2.
   - **Fix:**
     - Each RoomDef declares 2–3 named checkpoints with a canned `checkpointState(k, survivors)`.
     - Ghost timelines advance from checkpoint to checkpoint.
     - Side Doors into ghost rooms open only at a checkpoint boundary; the Visitor waits 10 s or less in the Visitor Gate airlock.
     - On takeover, bots snap to authored positions.

6. **[a/e] The evidence system relies on unique flame colours, but flame colour is a shared, purchasable cosmetic (§6.1 motes, §6.9 sour notes, §3.6 plates, §7.2 threads, §12.1).**
   - **Duplicates break evidence.** Eight new players all own `flame_candle`, so motes and sour notes can't name anyone.
   - **Rivals and one cosmetic break the §12.1 hue rule:**
     - Maud `#FF7FA8` (~341°) is 4° from the Cut crimson (~345°).
     - Rose Fire `#FF9EC4` (~337°) is 8° from it.
     - Lumen `#C7B6FF` (~254°) is 5° from Notorious violet (~259°), so Lumen reads as Notorious.
   - **Fix:**
     - Give each seat a fixed Seat Hue from an 8-colour, colour-blind-safe palette (nothing within 20° of crimson or violet), plus a shape glyph.
     - Use the Seat Hue for motes, sour notes, plate spots, name tags and threads.
     - Flame cosmetics change shape, flicker and particles only, with the rim tinted toward the Seat Hue.
     - Recolour Maud, Lumen and Rose Fire.

7. **[e] Kinship is an infinite wax pump, and Rewind breaks two rooms (§9.3).**
   - **Kinship pump.** A taps B for +10 at a cost of 5, and B taps back for +5 at a cost of 5. The pair nets +5 wax every 0.5 s with no limit, and it works through Grates. Wax is also weight in 2D.
   - **Rewind exploits.**
     - Rewind restores wax: melt in the Bowl, bank the Tithe, then rewind the wax back.
     - Rewind restores position, so it rewinds you out of the Chute slide and cancels The Cut.
   - **Fix:**
     - Kinship's bonus applies only while the receiver is below 50% max wax, up to +20 bonus wax per room.
     - Rewind restores position and velocity only, never wax.
     - Rewind is blocked across Kill/Chute volumes and instance changes.

8. **[b/e] The Weighing Hall is trivially solved by hanging (§6.6).**
   - **The hanging bypass.**
     - A hanger weighs 0, so at n = 5 two hangers (about 160) already beat T = 150.
     - The last climber alone (T = 60) hangs on a north bar, lets go and crosses in the 8 s window.
     - The melt/Chute dilemma never has to happen.
   - **Units are inconsistent.** Ballast is "10 units, 15 kg", the Plate default is "50", and Echo Wick "weighs 30".
   - **"The victim's share transfers" is undefined,** because SPLIT shares depend on n at clear.
   - **Fix:**
     - Hangers count 50% of their weight, with at most 2 hanging at once, and rim bars only on the south half (12 m or more from the bridge).
     - The bridge is live: it retracts the moment Current > Needed.
     - Use one weight unit everywhere (1 wax = 1 kg of prop = 1 W).
     - The Cut pays the puller +1 share computed at seal n.

9. **[c/e] The Crown ending economy is broken (§6.13, §11.4, §17.4).**
   - **Solo Everflame farm.** No rule makes a bot interrupt a Crown Rush, so a solo human takes +300 Drips every run.
   - **Candlelit is near-impossible with bots.** U_crown's +0.4 for "no kept Pacts" makes 6 of 10 Rivals rush against the 0.5 threshold: Vex 1.11, Gutter 0.94, Maud 0.84, Lumen 0.82, Ines 0.77, Kestrel 0.62. Simultaneous channels are undefined.
   - **Fragments make the claim unstoppable.** Two Crown Fragments (one of them buyable) bring the channel to 1 s, which can't realistically be shoved.
   - **Your own economy test fails.** An Everflame claimer gets 110 (from 220 Embers) + 80 + 300 + 15 (the Everflame title) + 50 (first run of the day) = 555, above the 520 p95 cap.
   - **Fix:**
     - Rivals with Loyalty ≥ 50 take a Warden role and shove channellers.
     - Lower the Pact term to 0.15 and raise the threshold to 0.7.
     - Simultaneous channels cancel each other.
     - Channel time has a 2 s floor.
     - Everflame pays 200 Drips.
     - The title and Crown Wax are granted only if 3 or more other climbers were lit.

10. **[a/g] Door generation is near-deterministic and funnels solo players into the thinnest lane (§3.5).**
    - **The lanes never vary.**
      - The A lane is always Golem → Sentinel → Executioner → Executioner Echo.
      - The E lane is Foundry → Watcher → Echo → Echo.
    - **The Echo pseudo-code ignores bands,** so golem_belfry could appear on floor 4 at tier 5.
    - **Hard-coded designations will be wrong.** "3A" Sentinel always appears as 2A, "4A" Executioner always appears as 3A, and "4D" Mimic often appears as 3D.
    - **SOLE E pays about 4.5× an A share per head** (70 vs about 15), so optimal solo play is E on every floor, which means seeing 2 rooms per run.
    - **Fix:**
      - Widen every band by one floor.
      - Enforce bands in the Echo filter.
      - Template all door strings as `{designation}`.
      - Apply −20% to the E pool for each consecutive E room.
      - If a room is added, make it the brief's Paradox Mirror as a third E room.

11. **[g/b] Rooms have no replay life; once a trick is known it stays solved (§6.0.3, §9.8).**
    - **Problem.** Seeds shuffle parameters, but the trick never changes: drink then touch, dim and read, walk the prints, sync the lamps. After about two runs the Codex shows the full Decree, and the hook inspired by The Tutorial Is Too Hard is gone.
    - **Fix:** every RoomDef ships 2 seeded Twists. Each Twist has its own Decree and its own Codex study track. Examples:
      - Golem: the crooked fork is required, and one chalk line lies.
      - Mimic: it copies the second-to-last toucher.
      - Executioner: its sentence can only be read while Brightened, which makes it hunt you.
      - Sentinel: lamps must go out in a painted order.

      Twists are data, not new code.

12. **[a] The Tide and the readability test contradict each other (§3.3, §1.3, §17.3).**
    - **Any first arrival starts the Tide.** That includes chuted victims, Scorched climbers and, in solo, ghost bots whose room length is a dice roll. RNG from other rooms speeds the human's timer ×1.5 and pulls the hints forward.
    - **The acceptance test is meaningless.** "Clears in under 6 min" is longer than every timer (4:00–5:30), and it passes trivially thanks to the 75% plain-wording hint.
    - **Fix:**
      - The Tide starts only when the first clearer has arrived and at least 50% of rooms are closed. In solo it never touches the human's room.
      - Rewrite the gate: at least 70% of first-timers clear before the 75% hint.
      - In solo, the Draft locks early once the human has been Planted for 3 s.

13. **[a/b] Cutting a Pact across instances breaks "betrayal is always visible" (§4.4, §7.2).**
    - **Uncounterable cross-room cuts.** Cut the Knot works "from anywhere" but Cinch needs 8 m, so a cross-room cut can't be countered and isn't seen.
    - **Undefined visuals.** The witness Betrayal Cam and the "outline at any distance" are undefined across separate coordinate spaces.
    - **Ambiguous X key.** X is ambiguous when you are both tethered in 1C and in a Pact.
    - **Snip is too fast.** The Snip trait's 0.6 s channel (0.5 s with Frayed) is at human reaction time, which undercuts the M1 "fun, not unfair" gate.
    - **Fix:**
      - Cut the Knot only within the same instance or Landing, and within 12 m.
      - Across instances, show only a HUD chevron.
      - X cuts the aimed segment; a Pact cut needs X while looking at the partner.
      - Snip's channel floor is 0.9 s.

14. **[a] Delayed Knife disclosure is fiction (§7.1).**
    - **Problem.** Names are supposedly withheld until the Tribunal, yet:
      - Soot bands are public;
      - `[ KNOT CUT ] Vex has cut a knot` names the cutter tower-wide;
      - Confessions broadcast;
      - Reunion banners announce who arrived.

      The 25-Ember Rumour sells information everyone already has.
    - **Fix (choose one):**
      - Disclose immediately, and delete both the delay rule and the Rumour.
      - Or update Soot only at the Tribunal and change the System line to "A knot has been cut."

15. **[a/b] The Hall of Grievances contradicts itself (§6.10).**
    - **Problem.**
      - The Regret "follows its owner at 3 m", yet you must walk behind it in its footprints. Both can't lead.
      - The footprints replay the victim's path "from the room where the Knife happened". That is another room's geometry, so the path goes through walls, and ghost Knives have no recorded path at all.
      - With Betrayal Off or a clean run, everyone gets a 15 s Doubt walk for 60 + 10: free money on floors 3–4.
    - **Fix:**
      - The Regret leads along a seeded spline authored for this gallery. It turns and drains you whenever you leave its prints.
      - Exclude the room when Betrayal is Off or the run has fewer than 2 Knives.
      - Doubts pay 50%.

16. **[b] The Liar's Banquet's instant tells make its other systems dead content (§6.5).**
    - **Problem.**
      - The off-beat tick (at 2 m), the grey rim film (at 1 m) and the 280 g cup each solve the room in about 20 s. The 10 testimonies and 12 cards get ignored.
      - The Taster's Pinch changes weight only, so it never fools anyone who checks the film or the tick.
      - How the poisoned cup maps to the poisoner (their own cup, or the victim's?) is undefined.
    - **Fix:**
      - The cup identifies the victim. The Seating Plan plus the testimonies narrow who could reach that cup, and the poisoner's single lie decides it.
      - Remove the tick, or make it the Hidden Piece tell.
      - Pinch adds 30 g and the film.
      - Cut the cards to 6.

17. **[b/g] The Whispering Library is homework, not party play (§6.2).**
    - **Problem.**
      - It is a 4-of-8 permutation (1,680 candidates) with 8 private clues. Clues are shared through a radial-menu Clue Composer, in 4:30, while a noise monster patrols. Groups will reach for pen and paper, and bots finish first and take the Tome.
      - "Aim for 8" is not an algorithm.
      - Tab has three bindings: Clue Log, Ledger and System history.
    - **Fix:**
      - Use 3 rings × 6 glyphs (120 candidates).
      - Add 6 lectern stands where a placed book becomes public. Sharing is then a physical act, and hoarding means not placing.
      - The dial greys out eliminated glyphs.
      - Generator: build a minimal unique clue set, then pad it with redundant true clues to exactly 8.
      - Move the Clue Log to J.
      - Candle-native twist: liar text changes when read Dimmed.

18. **[b] Harmony Sentinel decoys fail in solo, and the boss repeats this mechanic (§6.9, §6.13).**
    - **Solo is impossible.** Decoys weigh 18 kg (carried at 3 m/s) and sconces are 10.6 m apart. Even with decoys pre-placed, walking 4 legs and winding takes about 10–14 s, which is more than the 9 s maximum delay.
    - **Count and relight conflicts.** The layout says 4 decoys; the scaling says 5 at n = 1. "Relit by touch" conflicts with shoving a sconce out.
    - **The boss reuses the check.** Crown Phase 1 is the same "all lamps in one window" check, in reverse.
    - **Fix:**
      - Decoys spawn in the chalk circles.
      - Winding sets either "Bell" mode (strike on the Bell's NOW) or a 1–15 s delay counted from winding.
      - Sconces relight only with E.
      - Rebuild the Crown as the Tower's final exam, with one phase per letter: A chords the Snuffer, D weighs down its chain, C is a tethered Trust Fall, E is "don't look at its shadow".

19. **[b] The Fuse Tether has dead waiting time, and its netcode is the riskiest (§6.3, §16.3).**
    - **Dead time.** At 0.7 m/s over 110 m, the earliest clear is about 3:15 (about 3:47 solo at 0.55 m/s). A group that plays well stands in the Alcove for up to 2 minutes.
    - **Rubber-banding.** Predicting only your own capsule against server-side XPBD tethers will rubber-band in the flagship "Chained" room.
    - **Fix:**
      - Once the Fuse End is socketed, the flame "catches" and runs at 4 m/s. The wait becomes a 10–30 s betrayal window.
      - The client runs XPBD for its own chain against interpolated partner positions.

20. **[a/f] Grate topology is impossible as written, and live feeds are expensive (§3.5 step 6, §3.8, §10.1).**
    - **Problem.**
      - Each room has exactly one grate, but a ring that "wraps" needs two per room.
      - The doors sit on a 120° north arc, not a ring.
      - A 3-door floor leaves one room without a partner.
      - Rendering a neighbour instance's geometry, plus a ghost diorama, for every room pair is heavy.
    - **Fix:**
      - Pair doors (0,1) and (2,3). On 3-door floors, the middle room's grate opens onto the Keyhole well.
      - Render grates as frosted "shadow glass" that shows only silhouettes and flame light. It needs no neighbour geometry and suits the style.

21. **[b] The Glitched Watcher relies on audio the platform can't deliver (§6.8, §15.1).**
    - **Problem.**
      - The blind route depends on three spatialised hums, but HRTF is High-only. Equal-power panning has no front/back cue, and deaf players can't play the room at all.
      - The gaze test uses the camera, so a spring-arm swing can Paralyse you.
    - **Fix:**
      - In blindfold view, draw each true hum as expanding echo rings (visual sonar).
      - Base the gaze on the Wick's facing, or on the camera only after a 0.5 s static warning.
      - Add a rule: every room can be cleared with audio muted.

22. **[b] Unspecified physics blocks implementation.**
    - **Chrono-Slime:** the dash has no length or end condition, yet the rules depend on "a dash ends inside the Cold Store". 2D or 3D movement is also unstated.
    - **Golem:** "+10% scale" isn't defined as additive or multiplicative. When a climber is shoved into it, it's unclear whether the mote goes to the shover or the shoved.
    - **Watcher pillars:** 12 m pillars fall across a 12 m nave with no collision, damage or blocking rules.
    - **Trust Fall:** there is no defined landing point, so catching is either trivial or luck.
    - **Fix:**
      - Slime: each dash is 12 m or 3 bounces, whichever comes first, on the ground floor only.
      - Golem: growth is additive (+0.1 scale per impact), and the mote goes to the shover.
      - Pillars: fall along the wall, deal no damage, and become climbable ramps.
      - Trust Fall: a shadow circle with ±1 m seeded drift, shown only to catchers.

23. **[e] Keyhole bet odds are exploitable (§7.8).**
    - **Problem.**
      - Clear and Fail both pay `0.9/p`. At p = 0.2 a Fail bet pays 4.5× and wins 80% of the time.
      - The 1.2 floor makes safe Clears +EV: at p = 0.92, EV is 1.10.
      - Knife bets pay a flat 3.0× while ghost Knife rates run around 30%.
      - A bettor can Side Door into the room they bet against and sabotage it.
    - **Fix:**
      - Pay Clear at 0.9/p and Fail at 0.9/(1 − p), with a 1.05 floor.
      - Freeze odds at placement.
      - No Visiting a room you bet on.
      - Or cut bets from the slice.

24. **[a/c] Shared Altar timing is contradictory, and solo builds never vary (§3.3, §9.2).**
    - **Timing.** The Altar is "≤ 15 s", but also "15 s per pick". An A room at n = 8 has 10 world-space cards picked in strict order.
    - **Solo variety.** In solo, `clearers + 2, min 3` equals exactly the room's 3 traitPool cards, so solo builds are fixed per room.
    - **Fix:**
      - Claims are simultaneous within 15 s; a higher-priority climber can bump a contested card within 1 s.
      - At n = 1, show 2 room traits plus 2 global cards.

25. **[d] Power growth is thin, and the brief's floor-skip keys are missing (§9).**
    - **Problem.**
      - A run gives 4 picks, and many traits are dead outside their home room (Blindfold Sense, Language of Wax, Resonance, Snip).
      - No key skips floors, although the brief asked for "Door Keys… to skip floors".
      - X is reduced from the brief's secret level to a shop.
    - **Fix:**
      - Give every trait a universal effect plus its room synergy (e.g., Resonance also staggers any monster for 1 s).
      - Add the Master Key "Skip Stair": bypass the next floor's room, arrive first, get no Altar.
      - Show growth as a flame corona ring per clear, which leaves the hitbox unchanged.

26. **[d/g] The minigames aren't "light", and there are no short modes (§10.2).**
    - **Problem.**
      - Pinky Promise is Golden Balls and Rumour Dice is Liar's Dice: more lying.
      - Solo waits are capped at 60 s, so the minigames are rarely played, and there's no way to play them on their own.
      - The only mode is a 36–45 min run.
    - **Fix:**
      - Make a physical wax toy MUST (Hot Wax Potato, or Wick Curling built on shove/dive/brace), and move Pinky Promise to SHOULD.
      - Add a "Landing Party" menu mode (minigame playlist).
      - Add a "Short Climb" lobby option (floors 1–2 plus a mini-Crown, about 15 min). Both are configuration of existing systems.

27. **[d] The shop can't sell what sells, and Rivals wear items that don't exist (§8.2, §12).**
    - **Problem.**
      - Rivals wear spectacles, a cowl, a hood, a feather wick, a racing stripe, pearl drips and confetti; none of these is in the catalogue.
      - Kestrel's loadout (Sparkler + Traffic-Cone) contradicts its "feather wick".
      - There is no hat/accessory slot, which is the top category in Fall Guys and Among Us.
      - 4 of 10 slots (Knock, System Window, Betrayal Snap, Shadow) are rarely seen by other players.
    - **Fix:**
      - Add a "Trim" slot (collars, spectacles, cowls, scarves, labels) confined to a band below the flame, so silhouette, height and Soot stay intact.
      - Sell 4-piece themed sets.
      - Make every Rival look purchasable.
      - Make Knock and System Window Wickbook-only.

28. **[d/f] Visuals: the performance plan and the dark style put "top-tier" at risk (§13).**
    - **Problem.**
      - Demoting flames beyond the 12-light budget changes the light count, which triggers shader recompiles and hitches.
      - Transmission (wine bottle, Votive cup, stained glass) adds a render pass, and the local cube shadow costs 6 renders. 60 fps on Iris Xe is unlikely.
      - "Darkness by default" fights "readable": no tell is required to be self-lit.
      - The knight, the Executioner and the six-armed merchant have no rig tech, so they will look stiff.
      - A shrinking body under a fixed flame leaves the flame floating 0.32 m above the stub.
    - **Fix:**
      - Use a fixed pool of 8 PointLights (intensity 0 when free); show the rest as emissive plus probe light.
      - Enable transmission on High only, and use a single spot shadow instead of a cube.
      - Make every tell emissive "glow chalk".
      - Build every creature on a shared `ProcRig` (spring bones, 2-bone IK, look-at, rigid segments).
      - The wick visibly stretches as wax drops.

29. **[a] Draft and Landing geometry and rules conflict (§3.5, §3.6, §10.1).**
    - **Problem.**
      - Eight spots 1.1 m apart on a 2.2 m arc span about 200°, which wraps behind the door.
      - Generation uses P "at Draft start", but plaques and Notes appear at Intermission start, and Burn Outs at Intermission end change P.
      - Door Ajar can put 3 Wicks into a cap-2 SOLE room.
      - The shoved-out holder's fate is undefined.
      - "Raise A's cap" is vacuous, since A is always 8.
    - **Fix:**
      - Arc radius = max(2.2, (spots − 1) × 1.1 / 2.0).
      - Freeze generation at floor close.
      - No Door Ajar on E doors.
      - A shoved holder falls inward into their own room.
      - Delete the capacity step.

30. **[a] Crown flow and Smoke rules collide (§5.3, §6.13).**
    - **Problem.**
      - Burn Out happens at the end of the Intermission, while the Crown "relights Smoke on arrival".
      - The Landing-5 flow is unspecified.
      - Eight sequential Trust Falls at up to 20 s each is 160 s of watching.
    - **Fix:**
      - Landing 5 has a 30 s Intermission and no Draft, and Smoke that reaches it is never Burnt Out.
      - Use two ledges, with fallers in pairs and a 12 s limit.

31. **[a/c] Notes can't be true or false as specified (§7.7).**
    - **Problem.**
      - Template 11 ("the answer is…") can't be known before anyone enters, because answers are seeded per run.
      - Bots pin notes that are "true with probability Honesty/100", but truth is only decided after the room resolves.
    - **Fix:**
      - Bots pin notes consistent with their Codex knowledge, with probability Honesty/100.
      - Drop template 11.

32. **[g] Where it's still a mashup.**
    - **Problem.** These are genre imports with a candle skin:
      - Library: a logic grid.
      - Banquet: a whodunit plus a vote.
      - Chimney: PEAK with melting.
      - Pinky Promise: Golden Balls.
      - Rumour Dice: Liar's Dice.
      - Tribunal: the Among Us vote.

      Only Wicks, Knots, Soot/Regrets and the System voice are truly native.
    - **Fix:** route rooms through the wax and light verbs.
      - Library: text changes between Brightened and Dimmed.
      - Banquet → "Séance of the Snuffed": diners are snuffed candles you Relight, at a wax cost, to question.
      - Chimney: Dripping onto the wall creates a hold for the climber below, so cooperation literally costs HP.

33. **[a] Naming collisions will confuse players and engineers.**
    - **Collisions:**
      - Drip: the heal verb, the Drips currency, the Drip Chimney, hot drips and drip particles.
      - Echo: Echo rooms, the Echo Wick trait, the Echoing Golem and echo outlines.
      - Cut: Cut, The Cut and Cut the Knot.
      - Tallow: a rarity, Old Tallow, Maud Tallow, the Tallow Block and the Tallow Bargain.
      - Chute: the trapdoor, the Golem's wall chutes and Chute Champion.
      - Martyr: the payout, Martyr's Mark and Brass's archetype.
    - **Fix:**
      - Drips → "Seals"
      - Echo rooms → "Reprise"
      - the 2D Knife → "The Drop"
      - the Tallow rarity → "Paraffin"
      - Golem chutes → "spouts"

34. **[a] Smaller text fixes.**
    - **§6.0.3:** a study-0 player sees zero Decree words. State that entering grants Seen before the Decree types.
    - **Keysmith:** "Brass counts as Master at the Chandler", but a Master Key has no Chandler use.
    - **Chimney:** the solo "Hatch Wheel safety valve" is pointless, because the solo hatch never slams.
    - **Bloodwax:** "lowest-wax climber" must exclude Smoke.
    - **Tealight:** described as a "disc" at the full 0.72 m height.
    - **§7.10 Off:** "Taster disabled (bot Host only)" is meaningless.
    - **Confession:** the Forgive/Condemn prompt reaches players mid-room with no input spec. Use two context-wheel slots, with Forgive as the default.
    - **Mimic:** copying "traits at N×" needs per-trait monster code. Copy skin, speed and shove only.
    - **Mimic drinker reward:** the drinker's reward (Martyr's Mark + 15) is positive EV, so it's a race to drink, not a sacrifice. Remove the Ember bonus, and make curses last to the Crown.
    - **Splash text:** "you get their Martyr's Mark bonus, and they get the Mark" should read "you get +15 Embers; they get the Mark".
    - **§17.4:** "clears at n = 4" is invalid for cap-2 E rooms. Use min(4, cap).