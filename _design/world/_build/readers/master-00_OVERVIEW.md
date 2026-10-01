# Reader: master/00_OVERVIEW.md

**Source:** `_design/master/00_OVERVIEW.md` (KNOTWELL v1.0, 2026-09-29, 470 lines, read in full).
**Reader date:** 2026-09-30.
**Purpose:** sort v1's front-door file into what v2 keeps, what goes to the archive, and what fights the six v2 pillars (P1 Clear, P2 One World One Story, P3 Genuine, P4 Easy to Start, P5 Organized, P6 Open World Together).

Section marks like "§5" point to sections of the source file.

---

## Summary for the archive

`00_OVERVIEW.md` is the front door of the 10-file KNOTWELL v1 master design set. It defers to `DECISIONS.md` and points to files 01–10 for detail. It fixes the name KNOTWELL ("Climb together. Fall alone."), keeps FRAYWELL, SKYKNOT and SKYFLOOR as fallbacks, and retires KNOTSPIRE.

The game it describes is a 1–8 player co-op climb with betrayal, on Steam. A Firefly Frog hatches at the bottom of a stone well and climbs 20 numbered monster doors, in 4 floors of 5. Landings come after doors 5, 10 and 15, a Keeper boss guards door 10 and a Warden guards door 20. A Quick Climb takes about 11 minutes; a Full Climb about 24. Growth shows as light (Glow Lv1–10), never as size. The frog has three verbs: Tongue, Hop and Croak. Seven named Rival bots fill empty seats. Betrayal lives only in announced Heart doors, with a Betrayal Cam and Vengeance. The world is four rings (Well, Sky, Space, Beyond), and leaving the well reveals that the sky is the floor of a bigger well.

It also sets five pillars, a cadence contract (a beat about every 90 s), a wish-to-room trace, a 29-term glossary, the Milestone A and B slice lists, a build order, seven playtest gates and five open questions.

The goal was a funny, replayable, betrayal-flavoured party climber. v2 keeps the frog, the well, growth-as-light and much of the method, and drops the door-run structure and all betrayal.

---

## Reusable for v2

Each row names where the idea sits in the source, why it fits the v2 pillars, and what must change (if anything).

### World and lore

| Idea | Where | Why it fits | v2 note |
|---|---|---|---|
| **The frog-in-a-well idiom, made literal** (우물 안 개구리 / 井底之蛙): a frog who thinks the sky is a coin of light learns the world is bigger. | §4 last-but-one row; §2; §8 row "frog in a well" | P2: one story theme that every place, quest and reward can serve. It is simple, old, and known in Korean and Chinese. | Make it THE story spine of v2. |
| **The Mouth**: the well's opening, always overhead, widening 31° → 37° → 44° → 56° → 74° as you rise. | §6; §9 row 16 | P1: a landmark you can see from anywhere, like a compass and a progress bar in one. P2: progress is part of the world, not a HUD number. | Keep as the open world's main landmark and "how far along am I" read. Re-key the angles to story acts, not door numbers. |
| **Rings, from centre outward**: Well, then Sky, Space, Beyond; "up is outward". | §6 World row; §8 row "layers from center to outwards circle" | P2 and P6: rings map cleanly onto open-world regions, from the starter zone out. | Keep the idea of concentric regions. Scope v2 to the Well (and maybe the Rim); later rings are expansions. |
| **The reveal "Your sky is somebody's floor"** and ★1 Out of the Well onto the walkable Rim. | §1 table; §2; §7 Full Climb row | P2: a clear act-one climax that pays off the idiom. | Keep as the first big story beat. The Rim becomes a new region, not a results screen. |
| **The well bottom as the hub**, with a hatch pond, a statue and a ring map on the wall. | §6; §10 Meta and hub | P6: a natural starter town. P4: you hatch, you hop, you are home. | Well bottom = first town. `hatch_pond` = the 60-second first-control spot. |
| **The Landing layout**: a warm stop with a save, a free revive, a stall, the Mirror (cosmetics), a jar lineup and one toy. | §7 Floor row; §9 row 10 | P5: one repeatable layout means every town works the same way. P6: warm, loud places where players gather. | Reuse as the town template. Drop the Knot spot. |
| **Tone rule "dread, then a waltz"**: danger zones are dark with self-lit tells; safe places are warm and loud. | §3 tone rule | P1: players read safe vs unsafe at a glance. P2: one consistent visual grammar. | Wilds are dim with glowing tells; towns are warm. |
| **Monsters are never killed.** One monster, one cue, one plain rule of 14 words or fewer, one obvious and one weird way past. | §3 pillar 2; §9 row 7 | P1: a rule in 14 words is readable. P2: a frog cannot kill a heron, so the world's rules stay true. Also matches the v1 owner wish "weird clearing conditions (not traditional fighting)" (§8). | Keep as the encounter rule for world creatures and quest set pieces. Show the rule openly (see Conflicts on hidden clears). |
| **Pond-predator monsters**: `heron_shadow`, `snapper_crossing`, `snake_coil`, `web_spider`, `moss_snail`, `lily_raft`, `fog_stair`, `echo_warren`, `sunken_bucket`, `moth_library`, `warden_the_jar`. | §10 room lists; §4 TEAMBOUND homes | P2: real threats to a small frog in a well. They fit the world with no explaining. | Good roster seed. Check the rest one by one (see Conflicts). |
| **"Growth is light, never size"** (a deliberate split from Frog Sqwad's "eat to grow"). | §4 "Against Frog Sqwad"; §5 | P2: one visual rule for power. P6: other players see your progress at a glance, an MMO status read. Fairness: hitboxes stay equal. | Keep as a hard world rule. |

### Characters

| Idea | Where | Why it fits | v2 note |
|---|---|---|---|
| **The Firefly Frog design**: upright, bean-shaped froglet; two dome eye-bumps; round face with no lips and no droopy lids (so no Pepe reading); dart-frog colours. | §5 | P3: readable, specific, memorable. The Pepe rule protects the brand. | Keep as the player species' base body. Keep the "no Pepe association from 5 cold viewers" check from Gate A (§11). |
| **Named frogs with one-line voices**: Kestrel ("Watch this!"; after a flop, "That was on purpose."), Moss (tongues your lost spot back to you), Vex. | §3 pillars 3–5; §7 first-laugh row | P3: short, sincere, specific lines. This is the "sounds human" bar v2 wants. | Turn them into honest town NPCs or quest companions. Drop Vex's betrayal beat; keep her as a character only if she gets a non-betrayal personality. |
| **The System**: one-line `[ BRACKETED ]` windows that state a change and its cause, e.g. `[ GLOW 1 → 2 ]`, `[ TONGUE II ] 4.5 m. Grapple.` | §9 row 28; §7 | P1: every change comes with its reason. House rule: "the System never lies; every number shown is true data" (§3). | Keep the format. Give it an in-world source (see Conflicts). |
| **Seat Hue**: a fixed rim colour per player drives name tags. | §5 | P6: you can spot your friends in a crowd. P1: who is who, fast. | Keep for party members' name tags and rim light. Drop its use for blame tags. |

### Frog mechanics

| Idea | Where | Why it fits | v2 note |
|---|---|---|---|
| **Three verbs**: Tongue (grab, grapple, carry, catch; it is also Interact), Hop (charges), Croak (pulses, sustains, revives, joins a Chorus). | §5 | P4: three verbs are learnable in a minute. P5: Tongue = Interact means one button for "do the thing". | Core of v2 controls. |
| **8 bindings total.** | §10 Play | P4 and P5: small, fixed control set. | Keep the cap. |
| **Health as 3 glowing back spots**, the same on every frog. A hit knocks one out as a firefly that any friend can tongue back within 3 s. | §5; §4 Fall Guys row ("a hit becomes a catch") | P1: health is on the body, readable at 25 m. P6: helping a stranger is one tongue flick, which suits drop-in co-op. | Keep. |
| **Verb ranks I–IV and Awakenings**: your most-used verb evolves at Lv5 (Rank III names: Air Hop, Long Tongue, Twin Toll). | §7 First Awakening row; §9 row 19 | P6: new moves open new routes, a natural open-world gate. P1: the ability is visible on the frog. | Keep as the traversal-unlock spine. Tie ranks to places you can now reach. |
| **Molts**: each layer adds parts on fixed sockets; the Sky's is the Glider molt. | §5; §9 row 29 | P2: region and body change together. P6: a new region means a new way to move. | Keep; the Glider molt is the Rim/Sky unlock. |
| **Chorus**: croaks from several frogs join into one stronger effect. | §5 | P6: a co-op verb that needs no menu or pact. | Good candidate for group world events. |
| **Procedural motion**: leg IK, spring bones, a spline tongue, PrimeTween squash. | §5; §11 Style lock | P3: lively bodies. Tech: cheap for a mostly-agent team, no hand animation. | Keep. |

### Progression and economy

| Idea | Where | Why it fits | v2 note |
|---|---|---|---|
| **Fireflies = XP**, shown as fireflies riding in your cheeks at rising pitch, banked at a safe point. | §7 Tick row; §9 row 17 | P1: XP is visible and audible. P2: fireflies are the frog's light, so XP and growth are one idea. | Bank at towns or lanterns instead of room clears. |
| **Glow Level Lv1–10**, with a lit belly, an orbiting firefly per level, lit markings, and the Crown glow at Lv10. | §5; §9 row 18 | P1, P3, P6: one readable number shown on the body. | Keep as the one level number. |
| **Growth curve table** (banked Fireflies at Glow 2–10). | §7 Growth check | Gives v2 a tested starting curve. | Re-key from door numbers to minutes and quests. Numbers below. |
| **Cadence contract**: a tick every 10–30 s; about every 90 s the player got stronger, laughed, or saw something bigger. | §7 | P1 and "addictive but fair": a steady beat of small wins. | Keep the 90 s feel target for open-world routes. |
| **"Every attempt pays, even a wipe"**; a failed attempt pays 50%. | §7 Door and Meta rows | P4: failure never feels wasted. | Keep for quests and encounters. |
| **Pearls, the one meta currency.** | §9 row 21 | P5: one currency is easy to track. | Keep; drop Wish Coins (see Conflicts). |
| **Bestiary**: a page per monster, 4 stamps, death tips; a hat per 4 pages. | §9 row 23; §7 Meta row | P1: failing teaches you. P5: one place for monster facts, so no wiki. | Keep. |
| **Light classes**: 3 open classes (6 more were secret). | §9 row 24 | Matches owner decision 1 ("light classes or roles"). | Keep the 3 open ones only; make any others visible from the start. |
| **Cosmetics**: the Mirror (a cosmetics mirror in every Landing), earned cosmetics (12 in A, 24 in B), a stall, Supporter Sets as paid Steam DLC, +50 Pearls on first surfacing. | §7; §9 row 21; §10 | Still valid from v1: skins and a cosmetic shop. P6: cosmetics are how players read each other in towns. | Keep. The Mirror sits in every town. |
| **Fair-retention rules**: "Climb again / Rest" at equal weight, no auto-start, a break line at ~90 min, no on-screen formulas or dead waits. | §7 Session row; §3 house rules | "Addictive but fair" from the brief. P4. | Keep as ethics rules for v2. |
| **Shared boss fanfare** (Party Rank Up). | §9 row 11 | P6: a shared moment for everyone present. | Keep for world-boss or story beats. |

### UI and onboarding

| Idea | Where | Why it fits | v2 note |
|---|---|---|---|
| **First-session shot list with times**: in control by 0:05, first reward at 0:20, first laugh by 0:30, first power spike ~2:00, first Awakening ~7:00. | §7; §11 PG1 | P4: stricter than the v2 target of control within 60 s. | Keep the format; re-author the beats for the open world. |
| **Introduce systems slowly**: exactly 5 systems before the first boss, then one new system per stop; at most one full-screen card per door. | §7 Pacing | P4 and P1: nothing arrives in a pile. | Keep, per quest step instead of per door. |
| **Player-facing word list** (only glossary words appear on screen) and a noun budget of about 25. | §0 Conventions; §9; Open question 4 | P4 and P5: a small, fixed vocabulary. | Keep the rule; make the v2 list much shorter. |
| **Readability tests**: HP read within 1 spot at 25 m; tells read at 25 m; every rule readable with sound off. | §3 pillar 2 proof; §11 PG2 and Gate A | P1, measured. | Keep as acceptance rows. |
| **The ring map** drawing layers as rings. | §6 | P1: the world's shape in one picture. | Make it reachable in 2 inputs from play (P5), not only on the hub wall. |

### Art and audio

| Idea | Where | Why it fits | v2 note |
|---|---|---|---|
| **Toon ramp, rim light, HLSL toon and outline shader, self-lit tells** in dark places. | §8 visuals row; §11 Style lock | P1 and P3: clear silhouettes, danger that glows. | Keep. |
| **Juice targets**: hitstop 50–120 ms, squash on every hop, rising-pitch count-ups, Cinemachine Impulse. | §11 PG2 | Feel. | Keep. |
| **Style lock with 3 golden screenshots and a 10 s clip before content.** | §11 PG2 | Method: fix the look before building a lot. | Keep. |
| **Blender-script meshes and a procedural rig.** | §11 Style lock | Tech: agent-buildable art. | Keep. |
| **Rising-pitch firefly sound as XP builds.** | §7 Tick row | P1: you hear progress. | Keep. |

### Tech and method

| Idea | Where | Why it fits | v2 note |
|---|---|---|---|
| **Unity 6000.3.25f1 (6.3 LTS), URP 17, NGO host mode, Facepunch Steam + LAN, Spacewar AppID 480 until a real AppID.** | §8 last row; §1; §11 M0 | Still valid from v1. | NGO is now pinned at 2.13.3 by the brief. |
| **M0 package clean-up**: add Facepunch and Localization; remove purchasing, collab-proxy, legacy analytics, XR legacy input; split the assemblies. | §11 M0 | Tech, still valid. | Keep. |
| **Netcode test at 150 ms / 2% loss**, with a fallback if tongue-on-player feels unfair. | §11 M0 and gates | P6: co-op must feel fair over real networks. | Keep the conditions; test tongue on props, catch and revive. |
| **`IHeroBody` contract, capsule first.** | §5 | Tech: gameplay code does not wait for final art. | Keep the contract; drop the Wick fallback body. |
| **Data-driven content** (RoomDef JSON generated into baked shells; a JSON-built capsule greybox; target of ≤3 agent-days per small room). | §6; §11 | Fits a mostly-agent team. | Re-shape as region, quest and encounter definitions. |
| **Automated checks**: validators, a bot soak over 50 seeds, a growth CI test, a wish-coverage EditMode test. | §8; §10 Tests | P2: a test can fail the build when content misses the story or pillars. | Turn the wish trace into a pillar and story trace (every quest tagged). |
| **Performance budget**: host sim ≤8 ms, frame ≤16.6 ms at 1080p with 8 players. | §10 Tests | Tech. | Keep the numbers; the "2 live rooms" part must change (see Conflicts). |
| **PG1, a 10-minute greybox feel test** with timestamps, run solo and with 2 humans; plus standing stop conditions (e.g. stop adding content if the median first power comes after 3:00, or fewer than 60% say "Worth it?" Yes). | §11 | P4, measured early and cheaply. | Keep the method; rewrite the script for the open world. |
| **Steam Timeline markers, English string tables, Korean localization (SHOULD), a streamer-safe toggle, a share card.** | §10 | Plumbing, still valid. Korean fits the idiom's origin. | Keep. |
| **Human tasks**: trademark search (USPTO classes 9 and 41, EUIPO, KIPRIS), domains, @playknotwell handles, Steam AppID. | §1 | Still needed for any name. | Keep. |

### Name

| Idea | Where | Why it fits | v2 note |
|---|---|---|---|
| **KNOTWELL**, and the trivia that "a group of toads is called a knot" (the source cites grammar-monster.com, online-field-guide.com and gaggleofnouns.com). | §1 | P6: a knot of frogs in a well reads as a community or party, with no betrayal needed. | The name can survive. Its tagline and half its reasons cannot (see Conflicts). |
| **Hook line** "Tiny frogs. Monster doors. The sky is another well." | §1 table | P2: states the idiom. | Keep "Tiny frogs" and "The sky is another well"; replace "Monster doors". |

---

## Party-only (to archive)

These only make sense in the v1 party game. They leave the main game. At most, one of them may become the single documented opt-in town side mode.

| Item | Where |
|---|---|
| **Pillar 4, "Betrayal is a punchline"**: announced, one room, replayed, avenged. | §3 |
| **Heart doors (♥)**: announced betrayal rooms, each with a co-op answer that pays better. Rooms: `heart_two_pads`, `doppelfrog`, `heart_split_swallow`, `heart_tied_bridge`. Heart copy "They might not cut it." | §1; §9 row 13; §10 MUST-B |
| **`doppelfrog` and the Mimic**: the Mafia / Among Us impostor-plus-vote room; a bot is the Mimic below 3 humans; Mimic Climb [LATER]. | §4; §8 "mafia, among us"; §10 |
| **Knot / Cut / Duo / hold on**: a pact made at a Landing; hold Shove 1.2 s to cut a partner; Tongue to hold on; Duo Boons that come through the Knot; the Knot spot at Landing 3. | §4; §7; §9 row 14 |
| **Betrayal Cam** (0.8 s replay), **WANTED poster**, **Vengeance** (the victim's tag-back quest). | §2; §9 row 15 |
| **Fairness clauses for betrayal**: "betrayal moves only unbanked loot"; no results stat or title counts betrayals. | §3 |
| **Tethers**: `sp_tongue_tether` (the Chained Together homage) and `heart_tied_bridge`. | §4; §8 "chained" |
| **Pillar 3, "My mistake is your problem"**: one shared-fate gimmick per room, visible blame, blame tags and the 3 s fall replay, Team Lives. | §3; §10 Social; §9 row 25 |
| **Pranks on other frogs**: tonguing Kestrel off his pad as the first laugh; tongue-on-player yanks; the shove verb used on players; `br_shove_door`. | §7 First laugh; §11 M0 fallback; §10 |
| **Rivals as schemers**: the Drama Director staging bot beats, including Vex shoving Moss at 11:05. | §2; §3 pillar 4 proof; §9 row 27 |
| **Liar's Bar homage** (lying is the rule). | §4 |
| **PvP-leaning toys**: `toy_jar_tag`, `toy_lily_sumo`, Landing Party. The best candidate for the one opt-in town side mode hook. | §8 "mini sidegames"; §10 |
| **Betrayal marketing**: tagline "Climb together. Fall alone."; the "not well" betrayal pun; "copy leads with the well, the doors and betrayal". | §1; §4 |
| **v1 wish rows served only by betrayal**: "mafia, among us"; "chained"; the "sabotage" half of "Tutorial Is Too Hard … sabotage, team up". | §8 |

Note: `toy_frog_stack`, `toy_fly_catch` and `toy_bigtoad` are co-op toys, not party-only. They can stay as town activities.

---

## Conflicts with the new pillars

| Item | Where | Pillar | Why it conflicts |
|---|---|---|---|
| **Twenty separate numbered monster doors**, grouped in 4 floors of 5, played as Quick (~11 min) or Full (~24 min) Climbs. | §2; §6; §7 | P6, P2 | Owner decision 2 asks for one connected open world, not a door run. |
| **"At most 12% of a climb outside rooms"** and **"at most 2 rooms live at once"**. | §7 cadence; §6; §10 perf budget | P6 | An open world is mostly outside rooms. The streaming and performance model must be redone. |
| **Each layer re-hatches you at Lv1.** | §6 Layer row | P6, P2 | A persistent-feeling world should not wipe your level at each region. There is no story reason given. |
| **Session design built on runs**: Climb again / Rest, results ceremony after each climb, retry from door 11, save only at Landings, Team Lives, a failed room costs a Team Life. | §7; §10 | P6 | Run structure, not a living world you drop in and out of. |
| **Drop-in is only [SHOULD] #4** (public matchmaking and drop-in). | §10 SHOULD | P6 | The brief makes drop-in co-op without friction a core pillar. |
| **Lettered door pairs, forks, E (solo) doors, the Meeting Door, two-lock doors and "offstage" sides; door numbers running to 80.** | §4 DOORS row; §6; §9 rows 4 and 9 | P1, P4, P5 | Many coined ideas just to split and rejoin a party. Hard to explain; splits friends. |
| **The Plaque with card suits** (♠ Body, ♦ Mind, ♣ Together, E, ♥) from Alice in Borderland. | §4; §9 row 5 | P2, P4 | Playing-card suits do not belong to a frog-in-a-well world. It is one more code to learn. |
| **Four difficulty doors at 0:00** (Easy, Normal, Hard, Hell); **Hell redacts rules**; **Sealed** hides rules for +50%. | §4; §9 row 26; §10 | P1, P4 | A choice before the first hop slows the start. Hiding rules breaks "the player knows what to do and why". |
| **Hidden clears pay ×2; `[ NOTED ]` fires on unintended clears.** | §3 pillar 2; §4 | P1, P4 | Paying double for a hidden trick rewards wiki knowledge. Keep the weird second route, but hint it in-world and pay the same. |
| **Secret classes and secret quests revealed mid-climb** (6 of the 9 classes), and a Signature Power hold. | §4 Korean fiction row; §9 row 24 | P1, P5 | "Nothing is hidden." Owner decision 1 asks for light classes. |
| **Too many progression systems**: Fireflies, Glow, verb ranks, Awakenings, Mastery, Boons (4 passive + 1 active, Duos, Legendaries, private pick 1 of 3), classes, talents, Tower Rank F→SSS, Rank Sync, Bestiary stamps, Wish Coins and Pearls. | §7; §9 rows 17–24 | P4, P5 | Too much to learn. The source's own open question 4 admits the 29-term list is over the ~25-noun budget. v2 should keep about three: Glow, verb ranks with Awakenings, and one class. |
| **Two currencies** (Wish Coins inside a climb, Pearls outside). | §9 row 21 | P5 | Two wallets for one kind of reward. |
| **The System that "roasts and hypes", F→SSS ranks and Solo Leveling-style windows.** | §4 Korean fiction row; §9 rows 22 and 28 | P2, P3 | A tower-game "System" has no place in a frog's well unless the story gives it one (for example a well spirit, or the fireflies themselves). A roasting voice can read as generic snark. |
| **A pile of homages**: DOORS, Hades, The Tutorial Is Too Hard, Alice in Borderland, Liar's Bar, Fall Guys, PEAK, Chained Together, Korean tower fiction, and all 8 TEAMBOUND_13 modes each given a door. | §4 | P2 | Each system is borrowed from a different game, so the whole does not add up to one world. The wish trace (§8) forced every phrase to get a room, which drove the sprawl. |
| **Off-theme creature and room names**: `glitch_eye` (a digital glitch), `slime_foundry`, the Chrono-Slime, `lamp_knight`, `ash_axeman`, `bell_golem`, `mirror_toll`. | §8; §10 | P2 | Knights, golems, foundries and glitches do not come from a well. Keep only those the story can explain (the bell and bucket ideas fit a real well if they are well objects, not golems). |
| **Space, Beyond, the Revelation and Cycle 2**, with "each exit is the next layer's centre; up is outward". | §6; §10 LATER | P1, P2 | The geometry is hard to picture and the scope is huge. v2 needs one clear rule for the world's shape, and a first release scoped to the Well and the Rim. |
| **The Wick with a growing Flame** as a fallback hero, and Gates A/B that pit Frog vs Wick. | §5; §11 gates; open questions 1–3 | P2, P3 | Owner decision 2 keeps the frogs, so a candle hero would break the world. Keep the readability tests; drop the Wick. |
| **Rival bots that fill empty seats and pose as party members**, plus "Solo is a full lobby" as a pillar. | §3 pillar 5; §9 row 27 | P3, P6 | In a shared world, bots that act like players can feel fake. Honest NPC townsfolk and companions keep the world alive without pretending. |
| **4 s walk-vote on picture-door pairs.** | §4; §7 Door row | P6 | A party-vote step with no place in an open world. |
| **Growth checks keyed to door numbers** (Lv5 at doors 6–8, Lv10 at doors 17–19). | §3 pillar 1 proof | P1 | Must be re-keyed to minutes played and story steps. |
| **Quick Climb default vs the ★1 target** (source open question 5). | Open questions | P1 | The source already saw that the default session did not lead players to the main story beat. In v2, the story path must be the default path. |
| **The ring map only on the hub wall.** | §6 | P5 | The map must be reachable in 2 inputs or fewer from play. |
| **Tagline "Climb together. Fall alone." and the "not well" pun.** | §1 | P2 | Both sell betrayal, which has left the game. Half of the name's rationale (the Knot/Cut verb) is gone too; the toad-group meaning must carry it alone. |

---

## Key numbers and names

### Names

- **Product:** KNOTWELL (never "Knot Well" or "Notwell"). Fallbacks in order: FRAYWELL, SKYKNOT, SKYFLOOR. KNOTSPIRE is retired (it collided with the frog game Croakspire, Steam 3744870, per the source).
- **Domains and handles** (the source's check on 2026-09-29, via Verisign RDAP; not re-checked here): playknotwell.com, knotwellgame.com and knotwell.gg were unregistered; knotwell.com is a family blog. Handles: @playknotwell.
- **Hero:** the Firefly Frog.
- **Named frogs:** Kestrel, Moss, Vex (10 Rival frogs in total; 7 "Rookie" in the first climb).
- **Places:** `hub_well_bottom`, `hatch_pond`, `landing_well`, the Mouth, the Rim, the Well, the Sky, Space, Beyond; ★1 "Out of the Well".
- **Bosses:** the Keeper (`keeper_bell_raft`), the Warden (`warden_the_jar`).
- **Verbs:** Tongue, Hop, Croak; Chorus. Rank III names: Air Hop, Long Tongue, Twin Toll.
- **Growth:** Fireflies (XP), Glow Level, Crown glow, Awakening, molt (Glider molt).
- **Economy:** Pearls, the Mirror, Supporter Sets, the stall, the Bestiary.
- **Tech names:** `IHeroBody`, RoomDef, Seat Hue (writers only).
- **Retired words** (never reuse): Belay, Door Draft, Latch, Stampede, the Tide, Omens, clamp, Soot, Knives, Tribunal, Ledger, Altar, trait, Anvil, Origins, Codex, wax, Snuffed, Scorched, Embers, Drips, Sparks, Wickbook, "eat to grow", Megafrog, Big Voice, "Tree Frog molt".

### Numbers

| What | Value | Where |
|---|---|---|
| Players per world | 1–8 (host + 7) | §2 |
| Well depth | The sky is a coin of light 180 m up | §2 |
| The Mouth | 31° → 37° → 44° → 56° → 74° | §6 |
| Health | 3 back spots; a knocked spot can be tongued back within 3 s | §5 |
| Glow Levels | Lv1–10; Crown glow at Lv10 | §5; §9 |
| Firefly curve (banked → Glow) | 30 → 2; 105 → 3; 157 → 4; 215 → 5; 365 → 6; 435 → 7; 533 → 8; 677 → 9; 836 → 10 | §7 Growth check |
| Verb ranks | I–IV; Awakening at Lv5, around 7:00 | §7; §9 |
| Tongue II reach | 4.5 m grapple | §7 |
| Controls | 8 bindings | §10 |
| Boon slots (if kept) | 4 passive + 1 active | §9 row 20 |
| Classes | 3 open (+6 secret in v1) | §9 row 24 |
| Monster rule length | ≤14 words | §3 |
| Cadence | A tick every 10–30 s; a "got stronger, laughed, or saw something bigger" beat about every 90 s; a Glow level every 2–3 encounters | §7 |
| First session | In control ≤0:05; first reward 0:20; first laugh ≤0:30; first power ~2:00 (stop if the median is after 3:00) | §7; §11 |
| Session ethics | Break line at ~90 min; no auto-start | §7 |
| Readability | HP within 1 spot and tells readable at 25 m; hitstop 50–120 ms | §11 |
| Performance | Host sim ≤8 ms; frame ≤16.6 ms at 1080p; 8 players | §10 |
| Network test | 150 ms latency, 2% packet loss | §11 |
| Playtest bars | ≥60% "Worth it?" Yes; ≤25% early quits; bot soak clears ≥90% of 50 seeds | §11 |
| Content speed | A small room in ≤3 agent-days | §11 |
| Cosmetics | 12 earned (A), 24 earned (B), 2 Supporter Sets; a hat per 4 Bestiary pages; +50 Pearls on first surfacing | §7; §10 |
| Engine | Unity 6000.3.25f1 (6.3 LTS), URP 17, NGO host (2.13.3 per brief), Facepunch Steam + LAN, AppID 480 until a real one | §8; §11; brief |

<!-- END -->
