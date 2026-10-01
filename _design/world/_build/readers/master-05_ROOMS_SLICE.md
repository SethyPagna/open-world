# Reader: master-05_ROOMS_SLICE

**Source:** `_design/master/05_ROOMS_SLICE.md` (KNOTWELL v1, version 1.0, 2026-09-29, "BINDING for room builds"). 2,408 lines, read in full.
**Reader date:** 2026-09-30. **Purpose:** sort v1 room content into what v2 keeps, what goes to the archive, and what breaks the six v2 pillars (P1 Clear, P2 One World One Story, P3 Genuine, P4 Easy to Start, P5 Organized, P6 Open World Together).

---

## Summary for the archive

`05_ROOMS_SLICE.md` was the binding room spec for KNOTWELL v1, the 8-player co-op party climber with betrayal. It ranked below DECISIONS.md, FUN_OVERHAUL.md and the tech report. It left verb numbers, bots, economy, hubs, art and netcode to files 02, 03, 04, 07, 09 and 10.

It owned six things:
1. **The RoomDef contract.** One JSON file per room. A generator turns it into a ScriptableObject and a prefab, so agents never hand-edit prefabs.
2. **A shared room kit** (MonsterBrain, NoiseBus, GazeCone, bells, rafts, tethers, grip walls). All of it is sized from verb-rank "gauges", never raw metres.
3. **Door grammar.** DoorHalls, walk-votes, four-part plaques with card suits, forks, the Meeting Door, and gold, Heart and Rematch overlays.
4. **Generator rules.** An authored first climb of 20 doors (about 22 minutes to ★1), then seeded climbs.
5. **Full specs for all 34 MUST rooms:** 5 hubs, 4 toys, 5 breathers, 12 rule doors (one monster, one rule of 14 words or fewer), 4 betrayal "Heart doors", 2 set pieces, the Keeper and the Warden.
6. **A 20-point Definition of Done** with auto-solve, soak, muted-audio and network tests, plus 14 Bestiary pages.

Core decisions: monsters are never killed. Every danger gets a 2-5 s cue with a visual twin. Bots never solve a room for a first-time human. Betrayal happens only in Heart doors.

The goal was a readable, escalating 20-minute climb that proved the party game.

---

## Reusable for v2

### World and story

| Item | Where | Why it fits |
|---|---|---|
| **The proverb frog.** The first-frog statue (우물 안 개구리 / 井底之蛙, "the frog at the bottom of the well"), 0.9 m, looking up | §6.1 `hub_well_bottom` | One sentence carries the whole story: a frog who thought the well was the world finds out it is bigger. P2 |
| **The Mouth as the one landmark.** A bright coin overhead. Its angle grows as you climb: 31° at the bottom, 37° / 44° / 56° at the Landings, 74° at the top | §6.1 `hub_well_bottom`, `landing_well`; §6.7 | It is always visible, so "up" is always the goal, and you can read progress without UI. P1, P6 |
| **Vertical geography.** The Foot (a mossy stone deck, r 18 m), the Braid's strands rising to tops at y 30 / 60 / 90 / 120, black water below | §3.1, §6.1, §6.5 `sp_grip_wall`, §6.7 | This is already one connected space. Strand tops can become towns, and the strands the roads between them. P6 |
| **The lantern-folk.** About 400 lantern lights across the shaft, unnamed until ★1 | §6.2 `br_window` | Ready-made residents for the towns. "Other people live here" is the right MMO beat. P6, P2 |
| **Creatures that forgot what they are.** The Bell-Golem sleeps when "it remembers enough"; the Lamp-Knight kneels "remembering it is only a lantern stand"; the Burrower "went home and forgot why"; the Coil Snake "forgot it has a tail" | §6.3 Bestiary entries, §6.6 | A gentle story spine: the Well's creatures are old, lost things, and frogs help them rest. It also explains why nothing is ever killed. P2, P3 |
| **Monsters are never killed.** They sleep, kneel, flee, sink or get herded | §0 "Words" | A world rule that keeps the tone consistent and kind. P2, P3 |
| **Creatures that return and change.** "The golem from door 2 got a boat. It hasn't learned to swim." | §6.6 `keeper_bell_raft` | Reusing a known creature in a new place builds one world instead of a list of rooms. P2, P4 |
| **Threads across zones.** The Heron's entry foreshadows the Sky Warden, a thunderhead heron | §6.3 `heron_shadow` | Shows how one creature can link two regions of one story. P2 |
| **The Warden's lore.** "Somebody kept fireflies in it once. Now it keeps whoever shines the most." | §6.7 | Ties the big threat to fireflies and glow, the world's light and currency. P2 |
| **Vistas.** A crack in the wall shows the real shaft. A one-time auto-glance plays, and any mouse move over 2° cancels it | §6.2 `br_window` | In an open world every vista is real. Keep "saw something bigger" and the cancellable glance. P6, P4 |
| **Quest seeds.** Echo Toad (ring 3 bells with one croak) and Bell-Eater (catch the golem's clapper and spit it back) | §6.3 `bell_golem`, §6.6 | Small quests built on a creature's own rule, easy to explain in one line. P1 |

### Characters

| Item | Where | Why it fits |
|---|---|---|
| **A frog cast with specific voices.** Moss, the kind one who catches your lost spot ("Got it!"). Brother Brass, the steady elder ("On three.", "I can carry that.", "Go. I'll hold.", "I'll go first."). Pell, the quiet noticer ("Interesting."). Pip, the young one ("It goes up forever?", "Help!", "Thanks!"). Kestrel, the show-off who fails ("Watch this!"). Lumen, the loner ("I work alone.") | §1.3, §5, BotPlans in §6 | Each has one trait and a short line. They can become town residents, quest givers or companions. P3. (Vex and Maud are built on betrayal; see Party-only.) |
| **Pip's line at the window:** "It goes up forever?" | §5 door 4, §6.2 `br_window` | A sincere line that states the story theme through a character. P3, P2 |
| **Monster silhouettes.** Bell-Golem: 3.2 m bronze bell body, stubby legs, clapper fists, two lamp eyes. Lamp-Knight: 4 m, lantern head, halberd. Heron: only a shadow, legs and a beak. Moss Snail: 2 m shell with a teal glyph. Snapper: an old turtle with glowing shell ridges. Sleeping Toad: 8 m, snoring | §6.2-§6.7 | Readable at a glance, memorable, and cheap to model. P3 |
| **The System voice.** Short, dry, kind: `[ CLEARED ] It remembered it's only a bell. It's asleep.`, `[ SNAGGED ] You were the fish.`, `[ SWALLOWED ] Tasted like pond.` | every System block in §6 | Sounds like a person, not a template. Keep the `[ TAG ] one line` format. P3 |
| **Death tips that teach.** "It can't hit a statue. Its eyes warn you two seconds early." | §6.3, §9 | A failure tells you exactly what to do next. P1, P4 |

### Frog mechanics

| Item | Where | Why it fits |
|---|---|---|
| **Three verbs, four ranks.** Hop, Tongue and Croak (plus Shove), ranks I-IV, with named unlocks: Long Tongue, Air Hop, Twin Toll, Tongue IV chain grapple, Hop IV stomp, Thunder Croak | §2.1, §5 | A small verb set with visible growth. Easy to learn, clear to master. P4 |
| **Gauges.** Challenges reference `ledge.II` or `anchor.III`, never metres. `Assets/Data/VerbRanks.json` sizes every ledge, gap and anchor | §2.1 | Retuning one number moves every route in the world at once. The world stays consistent. P2 |
| **Rank lanes.** Every challenge has a basic route plus a rank-II shortcut and a rank-III route for each verb | §1.1 `lanes`; rank tables in §6 | Old places open new paths as you grow. This is how v1 progression becomes open-world exploration. P6, P4 |
| **The toll rule.** A croak affects the nearest 1 target in range (2 from rank III). Only three named things ring more: an EchoSpot, the Duet Boon, a Chorus sync | §2.1 | One rule with named exceptions. P1 |
| **The noise table.** Every action has a loudness in metres (waddle 2, charged landing 7, splash 8, croak 12). A creature hears an event within that distance. Pings and emotes are silent | §2.3 | One stealth rule for every creature in the world. P2, P1 |
| **Gaze uses the frog's facing, not the camera** | §2.2 `GazeCone`, §6.3 `moss_snail`, `glitch_eye` | Fair and learnable in third person. P1 |
| **Spots, not deaths.** A hit costs 1 spot. The lost spot flies as a firefly that a friend can catch for 3 s, and it always returns to its owner | §2.4 | Friends rescue each other; nobody loses loot. P6 |
| **Simple fall rules.** Falls over 4 m onto solid ground cost 1 spot; falls into water cost nothing | §2.4 | Easy to remember, consistent everywhere. P1 |
| **Consensual hauls.** A tongue haul, rope or catch moves a frog only while that frog holds Tongue toward the helper | §3.8 | Co-op help with no griefing. P6 |
| **Solo fallbacks for group tasks.** The two-frog door shows a tongue chain after 8 s alone. Echo Bells let one frog put out five lamps at once | §6.2 `br_shove_door`, §6.3 `lamp_knight` | Drop-in co-op: every task works for 1 frog or 8. P6, P4 |
| **Scaling by party size** (n 1-3 versus 4-8) on every encounter | "Scaling" in every §6 spec | The same place stays fair as friends join or leave. P6 |
| **Grip climbing.** A grip ring on your back (100; hanging drains 6/s). Moss holds dry 3 s after contact and re-moisten after 15 s. A croak re-moistens holds near friends | §6.5 `sp_grip_wall` | Climbing a well is the setting's core fantasy, and the UI is on the frog. P6, P5 |
| **Your growth lights the dark.** Glow radius is 1.5 m + 0.1 m per Glow Level | §6.3 `echo_warren` | Progress you can see on your own frog. P1 |
| **Co-op finales without betrayal.** The Chorus lift (3 frogs croak within 0.3 s to lift the Jar) and the Trust Fall (fall backwards, friends catch) | §6.7 `warden_the_jar` | Strong group moments built on trust. P6, P3 |
| **The firefly loop.** Mites pop into fireflies, clouds are gulped, pots and Bronze / Silver / Gold jars break open | §2.2, §6.2 | Light is the world's resource; collecting it fits the setting. P2 (simplify the currencies; see Conflicts) |

### Creatures that already work as open-world encounters

Each has one rule of 14 words or fewer, a 1.5-3 s cue with a visual twin, and a Bestiary tip. P1, P3, P4.

| Creature | Its one rule | Cue | Possible v2 use |
|---|---|---|---|
| Bell-Golem | When its eyes glow, freeze | Eyes ramp to amber `#FFB000` over 2 s | A bell-tower guardian near a town |
| Heron | Be under a lily pad when the shadow falls | Wingbeats, light dims 30%, 3 white feathers, 3 s | A roaming threat over open water, like weather |
| Pike | It leaps at the low side; keep the raft level | Lime V-ripple `#7CFFB2`, 2.5 s | Ferry crossings between towns |
| Fog Eel | It bites only what the lantern-fish light | Hole rim glows cyan `#4DE8FF`, 1.5 s | A foggy stair region |
| Snapper | It bites the fastest thing moving | Shell ridges glow orange `#FF8A3D`, 1.5 s | An egg-escort quest |
| Burrower | It hunts your last croak; croak, then move | Crack line `#FF9A4D`, floor bulges 1.5 s | A dark maze dungeon |
| Lamp-Knight | Snuff all its lamps in one breath | Halberd rises, lantern flares white, 1.2 s | A group event on a timer bell |
| Coil Snake | It strikes whatever splashes; one frog per pad | Emerald eyes `#3DFF9E` and a wake, 2 s | A pad-field crossing |
| Moss Snail | It moves only while nobody watches it | Shell glyph flares teal `#3DFFD0` | A shrine puzzle |
| Web Spider | It drops on whoever croaks; one calls, the rest cross | 8 violet eyes `#B98CFF`, 2 s | A bridge where one volunteer helps many |
| Sleeping Toad | Be quiet; the noise meter is on its eyelid | Eyelid half-opens, throat swells, 2 s | A stealth path; being swallowed only spits you back out |
| The Keeper | A known monster in a new place (golem on a raft) | Same cues as before | Template for a first dungeon boss: built only from lessons already taught |

### Art

| Item | Where | Why it fits |
|---|---|---|
| **Colour language: warm means safe, dark means danger.** Rest spaces lit warm `#FFB86B`; danger areas at ambient 0.1 or below, with self-lit tells, frogs and signs; gold `#FFD76A` for rare rewards | §3.1, §6.2, §6.3 intro | Players read safety from light alone. P1 |
| **Style lock.** Toon ramp, outline, rim light, self-lit tells (set by the Bell-Golem) | §8.1 #2 | One look across the whole world. P2 |
| **Tell readability.** Every tell's emissive luminance is at least 3× the area's mean, checked from 25 m | §8.1 #11 | A measurable version of "always readable". P1 |
| **One tell colour per creature** (see the table above) | §6.3 | Each creature is known by its colour. P3, P1 |
| **Seat Hue per player** | §6.3 `lamp_knight`, §6.4 | Players can find each other in a crowd. P6 |
| **Diegetic UI.** Grip ring on the frog's back, a caught moth perched on your back, the noise meter on the toad's eyelid | §6.5, §6.3 `echo_warren`, §6.2 `br_sleeping_toad` | Less HUD clutter. P5 |
| **Juice rules.** Squash on every landing, 50-120 ms hitstop on hits and pops, rising-pitch count-ups, camera impulse on monster acts, a firefly pop on every mite | §8.1 #10 | Makes progress feel good; fair and cheap. P4 |

### Audio

| Item | Where | Why it fits |
|---|---|---|
| **The Well is tuned to F pentatonic (F G A C D).** Every bell, pad, pot and lamp plays one note; a Harmony plays the full chord | §6.3 `bell_golem`, `lamp_knight`, `snake_coil` | One musical identity for the world. P2 |
| **The Well theme.** Kalimba, choir and low brass; a warm Landing waltz in F major; the Keeper layer in F minor pentatonic | §6.2, §6.6, §6.7 | Safe places and danger places sound different. P1, P2 |
| **Silence as a cue.** The tension layer drops to silence during the golem's Look | §6.3 `bell_golem`, §6.6 | Players learn to freeze from sound alone. P1 |
| **Every audio cue has a visual twin, and every encounter is clearable muted** | §2.4, §8.1 #3 and #8 | Accessibility and clarity. P1, P4 |

### Tech (fits NGO host mode and an agent-built team)

| Item | Where | Why it fits |
|---|---|---|
| **Data-driven definitions.** One JSON per encounter → `GenerateRooms` → ScriptableObject + prefab. Agents edit JSON and C#; only generators write prefabs | §1, §8.2 CLI | Built for agents. Rename to an EncounterDef or AreaDef for v2 |
| **Host-simulated kit, clients render replicated state.** `MonsterBrain` (Idle → Tell → Act → Recover, plus Stagger and Sleep), `NoiseBus`, `GazeCone`, `TollTarget`, `Anchor`, `RankLedge`, `Carryable`, `Pad`, `Raft`, `Checkpoint`, `HideVolume`, `SweepHazard`, `WaterVolume` | §2.2 | Proven NGO host-mode building blocks. At most one bespoke script per encounter keeps scope small |
| **Static baked shells; only dynamic objects move** (APV, NavMesh) | §3.7 | Works for open-world chunks too |
| **Lag fairness.** An RTT/2 allowance capped at 150 ms; sync windows judged on client input timestamps | §6.3 `bell_golem`, `lamp_knight` | Latency never ruins a co-op sync |
| **Deterministic re-simulation.** Replicate dash origin, direction and start time instead of streaming a fast transform | §6.3 `slime_foundry` | Cheap netcode for fast creatures |
| **Rafts without buoyancy rigidbodies.** Host sums torque at 50 Hz and replicates tilt | §6.3 `lily_raft` | Stable shared platforms (ferries) |
| **Test hooks.** `IRoomAutoSolver` (`SolveObvious`, `SolveHidden`, `ForceFail`) drives the same input path as players; 8-bot soak over 50 seeds; muted-audio test; `LaneReachabilityTest`; golden screenshots; MPPM at 150 ms RTT and 2% loss; frame-sequence clips for human feel review | §8.1, §8.2 | Agents can prove an encounter works before a human plays it |
| **Performance budget.** Host simulation ≤ 8 ms and frame ≤ 16.6 ms at 1080p with 8 players | §8.1 #13 | A clear bar for 8-player lobbies |
| **All player text through one Localization table** | §1.1, §8.1 #15 | Organized text; easy to review for tone |
| **Steam Timeline markers** on clears and big moments | §6.2 `br_gold`, §7, §8.1 #19 | Cheap Steam feature for shareable moments |

### Progression and UI

| Item | Where | Why it fits |
|---|---|---|
| **The first minute.** Hatch in 3 s, hop 7 pads, gulp a firefly cloud, level up by about 35 s | §6.1 `hatch_pond`, §5 door 0 | Meets P4's "controlling a frog within 60 s". (Swap the prank on Kestrel for a kind first laugh.) |
| **Pacing rules.** One new system per stop; at most one full-screen card per stop; a "stronger, laughed or saw something bigger" beat at least every 90 s; exactly 5 systems before the first boss | §5 "Pacing checks" | A ready checklist for a low learning curve. P4 |
| **Power moments.** A new power is used right away where it shines (Shatter Croak granted beside 14 standing pots) | §5, "Power moment" in each §6 spec | Makes progress felt, not just shown. P4 |
| **The Rematch.** An old creature at its old numbers against the frog you are now, with `OLD TIME 1:12 → 0:18` | §7 | In an open world: return to an early area and see how strong you got |
| **The Bestiary.** One page per creature: a tip that highlights the rule, a hint line, a short entry | §9 | A journal that answers "how do I beat this?" without a wiki. P1, P4 |
| **Rest stops.** Landings hold a save point, a free revive, a jar lineup, a stall and the Mirror | §6.1 `landing_well` | The seed of v2's towns. P6 |
| **The Mirror** as the cosmetics station | §6.1 | Home for skins and the cosmetic shop |
| **Walk-vote.** Stand in a zone for 4 s to choose as a group; ties go to the first human | §3.1 | Group choices with no menu, for example starting a dungeon. P5, P6 |
| **Honest odds.** The odds page says "First climb: one guaranteed gold door." | §6.2 `br_gold` | Addictive but fair |
| **The companion rule.** AI frogs explore, then hint, then help, and never do the key action for a first-time human | §1.3 | If v2 keeps AI frogs as companions, they must not steal the player's solve. P4 |
| **Each rule is shown once, in plain text, in 14 words or fewer** | §1.1 `rule`, §8.1 #4 | P1 |

---

## Party-only (to archive)

- **The four Heart doors** (§6.4) and their shared rules: the ♥ plaque, the entry line "Heart door. Betrayal is allowed in here.", the Risk Boon family, "spilled fireflies stay with whoever catches them".
  - `heart_two_pads`: only two pads leave, and shoving a frog off a departing pad is a betrayal event. The Heart Jar split.
  - `doppelfrog`: the Mimic (Mafia / Among Us). "Spot the Mimic" and "Human Mimic" variants, the sideways blink and no-ripple tells, the tongue-tag that steals fireflies, the 15 s vote on lily thrones. Tech: `MimicRoleService`, host-only salt, `EvidenceLog`, `VoteDais`.
  - `heart_split_swallow`: Split or Steal (share or swallow the jar), secret choices behind shutters, the clown honk, the Tower's stone frog. Tech: `SecretChoice`.
  - `heart_tied_bridge`: tied pairs on sinking bridges, the Cut that takes a partner's fireflies, Lumpy the log.
- **Betrayal fallout:** the Betrayal Cam (0.8 s slow motion, `[ TRAITOR ]`), the WANTED poster, the Vengeance quest (landing in Jar Tag at door 12), the mercy rule, and the Drama Director beats (Vex shoves Moss at door 11; the Mimic wears Kestrel at door 14).
- **Betrayal tells:** the Rival 1.5 s tell (cheek puff, crimson tongue tip, lean) and the human Mimic's 0.6 s tell. The reserved "betrayal crimson" and the validator that rejects any tell hue within 15° of it (§3.2, §8.2).
- **Betrayal personalities:** Vex swallows unless Knotted to you; Maud says "Trust me." and swallows half the time; Kestrel is a coin flip; the Director allows one bot betrayal per floor (§6.4).
- **Mischief and pranks outside Heart doors:** shove at 6 m/s, a tongue tug of up to 1 m, and blame tags ("Clapped: Kestrel", "Sank the raft: Pip", "Dropped by: Vex", "Made to fidget: Vex") (§3.8 and each §6 spec).
- **The prank onboarding:** tongue Kestrel off his wobbly pad for the first laugh by 0:30, with a public-lobby pot-stack variant (§6.1 `hatch_pond`).
- **Tethers:** the whole `sp_tongue_tether` set piece, the `TetherSystem` (XPBD constraints), the Knot offered at Landing 3, the Cut (hold Shove 1.2 s), Duos including Frog Sling and Duet, the tension-pitched strings in D Dorian, and the "comic breakup" Cut with the Betrayal Cam (§6.4, §6.5).
- **E-door DUO mischief:** shoving a partner into the slime's dash line; pinging a false pillar (§6.3).
- **Competitive toys:** `toy_jar_tag` (Snuff Tag, where Vengeance lands) and `toy_lily_sumo` ("Last frog dry wins"). At most these fit the small, documented hook for an opt-in town side mode.
- **Rules for public lobbies:** human-versus-human betrayal off, Rivals do the betraying (§6.4).
- **Party tests:** `Heart_LeakTests` and the `ForceBetrayal` auto-solve path (§8.2).
- **Party tags and slogan:** wish tags `sabotage`, `mafia_among_us`, `chained_together`; homage tags `among_us_vote`, `split_or_steal`, `ttith_doppelganger`, `ttith_floor61`, `chained_together`, `tb_chained`; the tagline "Climb together. Fall alone."

---

## Conflicts with the new pillars

| # | Item | Where | Pillar | Why it conflicts |
|---|---|---|---|---|
| 1 | Rooms live in separate cells on a 300 m grid. You enter by a 0.4 s fade and leave by the "Tower gulp" (everyone pulled out within 3 s). At most 2 rooms are live | §2.2 `ExitGate`, §3.1, §3.4, §3.7 | P6, P2 | Places are not next to each other, so there is no world to walk through. v2 needs real streaming areas |
| 2 | The seeded door generator: slot template, pairs, forks at 7 / 12 / 17, bands, pool rule, debut rule, 1,000-seed validator | §4 | P2, P6 | One authored story cannot be a random shuffle of rooms |
| 3 | Door grammar: the `DOOR 12` counter slam; plaques with number and letter (A / B / C / E), card-suit glyphs ♠ ♦ ♣ ♥, prize icons, skulls, SOLO / DUO tags; room names kept off the plaque | §3.1-§3.3 | P1, P5 | A symbol language the player must learn, while the plain name is hidden |
| 4 | Party splits: forks, SOLO / DUO E doors, offstage "parked" Rivals, the two-lock Meeting Door key swap through a hatch, the shadow-glass window, the rescue rope after 45 s | §3.4, §6.1 `meeting_room` | P5, P4 | Heavy logistics just to split and rejoin a group |
| 5 | Run structure: Team Lives, a hard timer hidden until 20 s remain, 50% pay on failure, Quick Climb versus Full Climb, "Retry from door 11" | §2.4, §6.6, §6.7 | P1, P6 | A hidden timer breaks "know what to do next"; a persistent world has no run to lose |
| 6 | Too many progression layers: loose versus banked fireflies, Glow Level, 3 verbs × 4 ranks, Awakenings, Boons in four families with a private pick 1 of 3 at most doors, Legendaries, Wish Coins, Pearls, RP, Rank F → SSS talents, Party Rank Up rerolls, Cleared stamps, Bestiary stamps, secret quests, Lucky Belly odds | §1.1, §3.5, §5, §6.2, §7 | P4, P5 | Far more than a low learning curve allows. v2 should keep one currency and one visible growth track |
| 7 | Sealed and Hell modes replace rule words with █ blocks. Four difficulty doors in the hub, with Hard and Hell chained | §3.6, §6.1 `hub_well_bottom` | P1, P4 | Hides the one thing the player needs. At most an opt-in challenge, never the default |
| 8 | Hidden systems: the private `[ HIDDEN CONDITION DETECTED ]` banner at door 13; hidden-clear hints locked behind a Rank A talent; hidden clears worth ×2 | §6.2 `br_jar_mites`, §6.3 | P5, P1 | Features that are secret by design. Keep optional secrets only if the Bestiary gives the hint for free |
| 9 | "The Tower" as a game-show voice and force ("The Tower rolled a six", "the Tower is feeling generous", Tower gulp, Tower wind, the Tower's stone frog), mixed with "the Well", "Layer 2", "the Sky" and "Space" | §3.1, §3.5, §6.2 `br_gold`, §6.4, §6.7 | P2 | Two names for one place, and a meta host with no place in the story |
| 10 | Glitch dressing: the Glitch Eye is "an error in the Well that nobody fixed", `[ DARK ] 404: frog not found.`, magenta checker patches, pixel-mites, clocks ticking backward, corrupted stained glass | §6.3 `slime_foundry`, `glitch_eye` | P2, P3 | A software joke breaks a sincere world. The mechanics (don't meet its gaze; herd it with steam) can be re-skinned |
| 11 | Homage-driven design: every room carries `wish[]` and `homage[]` tags (DOORS, TTITH, TEAMBOUND, PEAK, Among Us), and `WishCoverageTest` fails the build if any is missing | §1.4, §8.2 | P2 | Content should serve one story, not a reference checklist |
| 12 | Scripted Drama Director gags: Kestrel's "That was on purpose." in five rooms; bots staged to fail on cue | §5, BotPlans in §6 | P3 | Repeated canned lines feel fake, and more so next to real players |
| 13 | The default session is "solo with 7 Rookie Rivals" filling every seat | §5 | P6 | v2 is about meeting real players; AI frogs can only be optional companions |
| 14 | A count-up clock and skull rating on every encounter | §2.4, §3.2 | P6 | Arcade pressure fights the relaxed open-world feel. Keep clocks for Rematch-style challenges only |
| 15 | Word collisions: "Dark" means "out of spots" while rooms are also dark; "Glow" means both a level and light | §2.4, §6.3 | P1 | One word, two meanings, in the same moment |
| 16 | Menus that exist only as places: the title screen is the well bottom, the map is a wall slab, the Mirror is a spot on the deck, the Sealed toggle is a stone you tongue | §3.6, §6.1 | P5 | A feature you must walk to breaks "2 inputs or fewer". Keep the places, but add a menu path |
| 17 | Height check: the Mouth is "180 m up" from the Foot, but the top arena is at y 120 and ★1 lifts straight into the Mouth | §6.1, §6.7 | P2 | One world needs one set of heights. Confirm before v2 lays out the map |

---

## Key numbers and names

**Places.** The Well; the Foot (mossy stone deck, r 18 m, y 0; parapet r 19 m); black water at y −2; the Braid and its strands; Landings on strand tops at y 30 / 60 / 90; the top arena on strand 5 at y 120; the Mouth (31° from the Foot, 37° / 44° / 56° at Landings, 74° at the top; "180 m up"); the Rim, the Sky, Space (seen through a tear in the dome). About 6 m of height per door; `br_window` at y 24 on strand 2.

**Frogs (keep the good-natured ones).** Moss, Brother Brass, Pell, Pip, Kestrel, Lumen. Party-only: Vex, Maud. Lumpy is a 20 kg mossy log.

**Creatures.** Bell-Golem, the Heron (future Sky Warden, a thunderhead heron), the Pike, the Fog Eel and its lantern-fish, the Snapper, the Burrower (a mole-toad), the Lamp-Knight, the Coil Snake, the Moss Snail, the Web Spider, the Chrono-Slime, the Glitch Eye, the Sleeping Toad, the Keeper "Bell on the Raft", the Warden "the Jar". Mites: bell-beetles, water-striders, dragonflies, fog moths, grubs, glow-grubs, glow-moths, lamp-moths, moss-mites, web-mites, moss-moths, jar-moths, bat-mites.

**Verb gauges (GB; 02 owned them).** Run 5 m/s, gravity 20 m/s², swim 2 m/s, shallow wading ×0.8.

| Gauge | I | II | III | IV |
|---|---|---|---|---|
| Ledge height | 1.4 m tap / 1.9 m charged | 2.3 m | 3.2 m (Air Hop) | 2.9 m one hop, 3.8 m with Air Hop |
| Gap | 2.6 m tap / 4.3 m charged | 4.8 m | 6.8 m | 8.0 m |
| Tongue reach | 3.0 m (no grapple) | 4.5 m grapple | 6.0 m, 2 targets | 8.0 m chained grapples |
| Croak | 4 m, 1 target | 6 m, 1 target | 6 m, 2 targets (Twin Toll) | 9 m, 2 targets, 2 s stagger |

**Noise (metres heard).** Waddle 2, tap landing 4, shove 6, charged landing 7, splash 8, pot shatter 8, croak 12, bell 12, pings 0.

**Rules of thumb.** Cue lead 2-5 s (Hard ×0.7). Rule ≤ 14 words. Tell luminance ≥ 3× the area mean from 25 m. 1 spot per hit; falls over 4 m cost 1 spot; water costs none; a lost spot is catchable for 3 s. Lag allowance RTT/2, capped at 150 ms. Perf: host ≤ 8 ms, frame ≤ 16.6 ms at 1080p with 8 players. Network test: 150 ms RTT, 2% loss.

**Growth in the first climb.** Lv2 at about 0:35 (30 fireflies), Lv3 at 105, Lv4 at 157, Lv5 Long Tongue at 215, Lv6 Air Hop at 365, Lv7 Twin Toll at 435, Lv8 Tongue IV at 533, Lv9 Hop IV at 677, Lv10 Thunder Croak at 836. About 22:30 to ★1. Yields per frog: breather 8 + d (4 loose), rule 18 + 2d (8 loose), set piece 25 + 2d (10 loose), Keeper 60 (10 loose), Warden 120 (10 loose).

**Named powers.** Tongue II, Hop II, Croak II, Long Tongue, Air Hop, Twin Toll, Tongue IV, Hop IV, Thunder Croak (with a Crown glow), Shatter Croak, Moon Hop, Sticky Pads, Third Eye.

**Colours.** Warm safe light `#FFB86B`; gold `#FFD76A`; lantern points `#FFF4E0`; moonlight `#CFE3FF`; fog `#9FB3C8`; sonar outlines `#6FA8FF`. Creature tells as listed in the encounter table above; the slime's Breath is `#C8FF4D`, the heron's feathers `#F4F8FF`.

**Music.** F pentatonic (F G A C D); Harmony chord F A C D G; Landing waltz in F major; Keeper layer in F minor pentatonic.

**Open questions that carry into v2** (§10). Consensual hauls moving a frog farther than 1 m; the toll rule (nearest 1, or 2 from rank III); crossing clears that need a living human in the exit zone.

<!-- END -->
