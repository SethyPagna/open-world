# KNOTWELL: overview

**Version** 1.0 · **Date** 2026-09-29 · **Status:** master design set, file 00 of 10. It follows `DECISIONS.md`.

This file is the front door to the set:
- the name and the pitch;
- the pillars and what makes the game unique;
- the hero;
- the loop at every scale;
- the wish trace and the glossary;
- the slice checklist, the build order and the playtest gates.

Files 01–10 own the details.

---

## 0. How to read this set

**Order of authority:**
1. The user's four messages (TEAMBOUND_13 is a reference).
2. `DECISIONS.md`.
3. `FUN_OVERHAUL.md` (**FO**), as amended by DECISIONS §8.2.
4. The reports: tech stack (**UT**) and research (**RR**).
5. The parts bin: GDD, WORLD, CRIT and `inputs/`.

| File | Owns |
|---|---|
| `01_WORLD` | The rings, the Mouth, the map, the scale reveals, molts, Wardens |
| `02_HERO_AND_CONTROLS` | The Firefly Frog, `IHeroBody`, 8 bindings, verb ranks, spots, Gates A/B |
| `03_SOCIAL_AND_BOTS` | Heart doors, Knot/Cut, Betrayal Cam, Rivals, the fairness contract |
| `04_PROGRESSION_ECONOMY` | Fireflies, Glow, Boons, classes, Tower Rank, Bestiary, currencies, difficulty |
| `05_ROOMS_SLICE` | The RoomDef contract, the authored first climb, the 34 MUST rooms, the Definition of Done |
| `06_ROOMS_LATER` | SHOULD and LATER rooms and layers |
| `07_HUB_AND_MINIGAMES` | The well bottom, hatching, Landings, the Meeting room, toys, the Rim |
| `08_COSMETICS_SHOP` | Slots, the earned catalogue, Supporter Sets, retention ethics |
| `09_ART_UI_AUDIO` | Look, animation, UI, audio, juice, the capsule |
| `10_UNITY_TECH` | Packages, pipeline, netcode, bots, Steam, tests, performance |

**Conventions**
- **Status tags** on every feature: **[MUST-A]** (the Quick Climb and free demo), **[MUST-B]** (the Full Climb, ★1 and climb 2), **[SHOULD]**, **[LATER]**.
- **Numbers.** Every number is a **greybox hypothesis** unless a source proves it.
- **Words.** The only player-facing words are the §9 glossary.

---

## 1. Name

### KNOTWELL: *Climb together. Fall alone.*

| Use | Line |
|---|---|
| Hook (capsule, store) | *Tiny frogs. Monster doors. The sky is another well.* |
| ★1 trailer and store | *Your sky is somebody's floor.* |
| Heart-door copy | *They might not cut it.* |
| Store trivia | *A group of toads is called a knot.* |

**Rationale** (DECISIONS §1)
- **Knot is the team game.** It is the tongue-tether and the Knot/Cut betrayal verb. It is also the real collective noun for toads, confirmed by grammar-monster.com, online-field-guide.com and gaggleofnouns.com. So the title reads "a party of frogs in a well".
- **Well is the user's image.** Every sky is another well, so it names all four layers.
- **Said aloud it is "not well":** a free betrayal joke.
- **It survives the Wick fallback.**
- **Logo:** draw the K as a rope knot.

**Collision evidence**
- **Searches.** name_1 ran 37 WebSearch queries on 2026-09-28, and J0 and J1 re-ran them on 2026-09-29. No game called Knotwell exists on Steam, itch.io, Roblox or BGG.
- **Nearest titles, none confusable:** Knotwords (Steam 1963900), Knot (575990), Unknot! (3544020), King's Well (4332200), KNOTICAL (itch.io), The Knot Game (BGG 136387).
- **Domains.** knotwell.com has been a family blog since 2007. **playknotwell.com, knotwellgame.com and knotwell.gg are unregistered** (Verisign RDAP).
- **Why KNOTSPIRE was retired:** it collided with the frog game Croakspire (Steam 3744870).

**Runners-up, in fallback order**

| # | Name | Why | Collision evidence |
|---|---|---|---|
| 1 | **FRAYWELL** | "Farewell", a fraying rope, "the fray" | No game or company. Only fictional uses: a *Shadows of the Apt* character, and a town in the 2026 novel *Death Meets Cute*. Nearest game: Fraymakers (Steam 1420350). fraywell.com is free. |
| 2 | **SKYKNOT** | The cleanest collisions, but it drops "well" | No game. Nearest: the itch.io RPG "Knots in the Sky". skyknot.com is taken; skyknotgame.com is free. |
| 3 | **SKYFLOOR** | States the reveal best, but drops co-op and betrayal | SkyFloor® walkable skylights own the search. There are two tiny itch.io jam games. Its line survives as trailer copy. |

**Human tasks before any public use:**
- [ ] A trademark search: USPTO classes 9 and 41 (optionally 28), EUIPO and KIPRIS. The automated attempts returned 403/405.
- [ ] Register playknotwell.com and knotwellgame.com.
- [ ] Claim the @playknotwell handles.
- [ ] Get a Steam AppID. Use Spacewar 480 until then.

The root folder is renamed `KNOTWELL` only after this workflow finishes and with the user's OK.

---

## 2. Elevator pitch

**One sentence** (DECISIONS §3):
> Hatch as a nobody frog at the bottom of a well, climb twenty monster doors with up to seven friends or scheming Rivals, grow absurdly stronger and brighter behind every door, and leap out to find the sky is the floor of a bigger well — if nobody cuts your knot first.

**One paragraph.** KNOTWELL is a 1–8 player co-op climb with betrayal, on Steam.
- **The start.** You hatch at the bottom of a stone well. Your whole sky is a coin of light 180 m up.
- **The doors.** Each Climb is twenty numbered monster doors. Behind each is one monster you can never kill, one glowing warning, one plain rule, and a stranger hidden way out.
- **The growth.** Every door makes you visibly stronger. Your belly glows, fireflies orbit you, and your tongue, hop and croak evolve into moves the rooms are built around.
- **The party.** Friends and seven named Rival frogs share every room, and bodies are linked. One bad hop sinks everyone's raft, and everyone sees who did it.
- **The betrayal.** It lives only behind announced Heart doors. It ends in a slow-motion Betrayal Cam, and the victim gets Vengeance.
- **The reveal.** Beat the Warden at door 20 and you leap out onto the rim, to find the sky was only the floor of something bigger.
- **The session.** A Quick Climb takes about 11 minutes, and even a wipe pays out.

---

## 3. Pillars

These are FO §2.2's five pillars, kept by DECISIONS §8.1. Every feature serves at least one. The proofs are greybox targets.

| # | Pillar | Serves | First felt | Proof |
|---|---|---|---|---|
| 1 | **Every door makes you stronger, and everyone can see it.** | Progress, attraction | 0:20 `[ GLOW 1 → 2 ]`: the belly lights and a firefly orbits | Testers name a power they gained. The growth CI test lands Lv5 at doors 6–8 and Lv10 at 17–19. |
| 2 | **One monster, one rule, one weird way out.** A cue, a rule of ≤14 words, an obvious and a hidden clear. Monsters are never killed. | Fun (mastery), immersion (dread) | 1:00 `bell_golem`: "Ring 3 bells. When its eyes glow, freeze." | Every rule door can be cleared muted. `[ NOTED ]` fires on every unintended clear. |
| 3 | **My mistake is your problem.** One shared-fate gimmick per room, and visible blame. Failure is cheap on Normal and cruel on Hell. | Fun (comedy) | ~1:30 Moss tongues your lost spot back; 2:20 the raft tips | Every ~90 s the tester got stronger, laughed, or saw something bigger |
| 4 | **Betrayal is a punchline.** It is announced, stays in one room, is replayed, and is avenged. | Fun, stories | 11:05 `heart_two_pads`: Vex shoves Moss | Every Heart door has a co-op answer. No results stat or title counts betrayals. |
| 5 | **Solo is a full lobby.** Seven named Rivals fill empty seats: they help, flop, gasp and sometimes betray. | Immersion, attraction | 0:25 Kestrel: "Watch this!" | FO §6.1 plays with 1 human + 7 bots. The soak clears ≥90% of 50 seeds. |

**Tone rule: "dread, then a waltz".** Rule doors are dark, with self-lit tells. Breathers and Landings are warm and loud.

**House rules**
- **Fun before rules:** no on-screen formulas, pick orders or dead waits.
- **The System never lies:** every number shown is true data.
- **The fairness contract is law:**
  - hitbox, speed, shove and spots are identical for everyone;
  - effects that reach another player have fixed caps;
  - betrayal moves only unbanked loot.

---

## 4. What is unique, against the inspirations

| Inspiration | Takes | KNOTWELL's difference |
|---|---|---|
| **Mafia / Among Us** | Impostor plus a vote | `doppelfrog` is one announced room. Below 3 humans, a bot is the Mimic and only humans vote. Mimic Climb is [LATER]. |
| **Chained Together** | Bodies tied, shared falls | `sp_tongue_tether` is one door of twenty. The Knot can be **Cut** or saved by **hold on**. |
| **PEAK** | Per-climber grip; hauling friends | `sp_grip_wall` hauls with the tongue, and you reach it already 14 doors stronger |
| **DOORS** | Numbered doors, one-rule monsters, the door number as a brag | Picture-door pairs picked by walking; split and meet again; numbers run to 80; powers bind to rooms |
| **The Tutorial Is Too Hard** | Difficulty at the entrance, brutal Hell, weird clears, a lone hero | Four difficulty doors at 0:00; Hell redacts rules; SOLO E doors; hidden clears pay ×2 |
| **Hades** | Pick 1 of 3; every attempt pays | Private picks with nobody waiting; player-to-player Duos via the Knot; Party Rank Up |
| **Korean tower fiction** (Solo Leveling, TTITH) | System windows, hidden classes, F→SSS | The System roasts and hypes in one line. A secret quest reveals your class mid-climb. |
| **Alice in Borderland** | Suits as room types | ♠♦♣♥ on a 4-field plaque: prize and skulls, never payout math |
| **Liar's Bar** | Lying is the rule | Every Heart door also has a co-op answer that pays better |
| **Fall Guys / R.E.P.O.** | Slapstick readable without sound | A knocked-out spot is a catchable firefly, so a hit becomes a catch |
| **Frog in a well** (우물 안 개구리 / 井底之蛙) | The idiom | Literal and climbable. The Mouth widens 31° → 74°, and every reveal lands on your species. |
| **TEAMBOUND_13** | 8 physics modes | Each becomes a door (see below) |

**TEAMBOUND_13 homes:**

| Mode | Door |
|---|---|
| Summit | `sp_grip_wall` |
| Chained ascent | `sp_tongue_tether` |
| Downstream | `lily_raft` |
| Echo Chamber | `echo_warren`, `lamp_knight` |
| Delivery | `snapper_crossing` |
| Tower of Babel | `toy_frog_stack` |
| One Body | `toy_bigtoad` [SHOULD] |
| Deep Dive | `sunken_bucket` [SHOULD] |

**Against Frog Sqwad** (Steam 3989960; June 2026; up to 8 frogs that "eat to grow" into a Megafrog; peak 1,078 CCU; 72% positive). It has no well, no doors, no rule monsters and no betrayal. So:
- growth is light, never size or hitbox;
- copy leads with the well, the doors and betrayal;
- Croak III is **Twin Toll**.

---

## 5. The hero: the Firefly Frog

You are an upright, bean-shaped froglet: two dome eye-bumps, a round face with no lips and no droopy lids (no Pepe reading), and dart-frog colours.
- **Health** is 3 glowing back spots, the same on every frog. A hit knocks one out as a firefly any friend can tongue back within 3 s.
- **Growth is light, never size.** Each Glow Level brightens your belly, adds an orbiting firefly and lights your markings. Lv10 crowns you with the Crown glow.
- **Three verbs:**
  - the **Tongue** grabs, grapples, carries and catches (it is also Interact);
  - the **Hop** charges;
  - the **Croak** pulses, sustains, revives, and joins others into a Chorus.
- **Awakenings** add parts on fixed sockets. So does each layer's molt: the Sky's is the Glider molt.
- **Seat Hue:** a fixed rim colour per seat drives name and blame tags.
- **Motion is fully procedural:** leg IK, spring bones, a spline tongue, PrimeTween squash.
- **Build contract.** Everything talks to `IHeroBody`; a capsule implements it first. **The Wick with a growing Flame** is the fallback body, used only if Gate A fails after one remediation pass.
- **Public art.** No frog-only public art is locked before Gate A passes.

[MUST-A]; spec in `02`.

---

## 6. Structure map

| Level | What it is | Numbers | Status |
|---|---|---|---|
| **World** | Concentric: the Well, then the Sky, Space and Beyond. Each exit is the next layer's centre; up is outward. | 4 layers, then the Revelation | Well [MUST-B]; rest [LATER] |
| **Layer** | A ring. It re-hatches you at Lv1, with its movement verb on and a molt. | Doors 1–20 / 21–40 / 41–60 / 61–80 | Sky Preview [SHOULD] |
| **Climb** | 20 doors, as 4 floors of 5 | Quick ~11 min, Full ~24 min | [MUST-A] / [MUST-B] |
| **Floor** | 5 doors, then a 40 s Landing and save | Landings after 5, 10 and 15; Keeper at 10; Warden at 20 | [MUST-A] |
| **Door** | A breather, a pair (5B/5C), a fork (12B/12E), or a Keeper or Warden. Overlays: gold, Rematch, Heart. | ~57 s average | Forks and Heart [MUST-B] |
| **Room** | A RoomDef JSON, generated into a baked shell | At most 2 live at once | [MUST-A] |

- **The Mouth** is the progress bar you can see. It widens **31° → 37° → 44° → 56° → 74°**.
- **The map** on the hub wall draws the layers as rings, with doors spiralling outward and forks as lettered lobes. [MUST-A]

---

## 7. The core loop at every scale

**Cadence contract** (FO §3.5):
- a tick every 10–30 s;
- a door every ~1 min;
- a Boon every ~2 min once picks unlock;
- a Glow level every 2–3 doors;
- a Landing or rank moment every ~5 min;
- a scale reveal every ~24 min;
- at most 12% of a climb outside rooms.

**Feel target:** about every 90 s, the player got stronger, laughed, or saw something bigger.

The clocks below are from the authored first climb: solo, 7 Rookie Rivals, Normal (DECISIONS §5).

| Scale | Timing | Loop | Payoff | Status |
|---|---|---|---|---|
| **Tick** | 10–30 s | Gulp a cloud, pop a mite, crack a pot | Fireflies ride in your cheeks at rising pitch and bank at the clear | A |
| **First reward** | **0:20** (in control ≤0:05) | Hatch, hop, gulp in `hatch_pond` | `[ GLOW 1 → 2 ]`, `[ TONGUE II ] 4.5 m. Grapple.` | A |
| **First laugh** | **≤0:30** | Tongue Kestrel off his pad | He belly-flops: "That was on purpose." | A |
| **First power spike** | **~2:00** | Clear `bell_golem` (door 2) | `[ BOON ] Shatter Croak.` One croak shatters every pot. | A |
| **Door** | ~57 s: breather 15–30 s; rule door 45–90 s (cap 150 s); set piece 90–150 s | Plaque → 4 s walk-vote → cue → rule → clear or hidden clear → bank | A Boon: auto-granted before the Keeper, a private pick 1 of 3 after. A failed room pays 50% and costs 1 Team Life. | A |
| **Floor** | ~4:45 (floor 1); ~5–6 min later | 5 doors, then a Landing: jar lineup, one toy, the stall (from Landing 2), the Knot spot (from Landing 3), the Mirror | A Glow level every 2–3 doors. The Mouth has grown. Free revive. Save. | A |
| **First Awakening** | ~7:00 (Lv5) | Your most-used verb evolves | `[ TONGUE III: AWAKENING ] Long Tongue.` The bots gasp. | A |
| **Quick Climb** | **~11 min** | Doors 1–9, then `keeper_bell_raft` | `[ CHOICE UNLOCKED ]`, Party Rank Up, Rank F → E, the steered pull-back (31° → 44°), a free hat, `Something is waiting in 12E.`, then **Climb on / Rest** | A |
| **Full Climb** | **~24 min** (★1 at 22:30) | Doors 11–20: Heart, fork, secret quest, Grip Wall, Knot, Tether, Rematch, `warden_the_jar` | Lv10 and the Crown glow at door 18. ★1 onto the walkable Rim with Glide on. +50 Pearls on the first surfacing only. | B |
| **Session** | Default: one Quick Climb. First session: ★1 inside 60 min. Break line at ~90 min. | Hub → difficulty door → climb → ~20 s results (Rank bar last) → **Climb again / Rest**, equal weight, no auto-start | Best door, Pearls, Rank Points, Bestiary pages. Every Landing is a bookmark. | A |
| **Meta** | Rank E after the first Keeper; D in 2–3 climbs; C ~5; S ~24 climbs plus surfacing | Every climb pays, even a wipe | A PvE talent per rank; a hat per 4 Bestiary pages; a Common cosmetic per 1–2 Full Climbs; a class per secret quest | A to C; B to S |
| **Ascent** | 4 Full Climbs, ~1.7 h | Well → Sky → Space → Beyond | ★1–★4 and the Revelation | Well B; rest LATER |

**Growth check** (enforced by the growth CI test):

| Point | Pond | D3 | D5 | D7 | D9 gold | Keeper | D12 | D15 | D18 |
|---|---|---|---|---|---|---|---|---|---|
| Banked | 30 | 105 | 157 | 215 | 365 | 435 | 533 | 677 | 836 |
| Glow | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |

**Pacing**
- **Exactly 5 systems before the Keeper:** verbs, growth, rule doors, door choice and the team gimmick.
- **After the Keeper, one new system per stop:**
  - Heart door at 11;
  - fork at 12;
  - secret quest at 13;
  - Knot, Cut and Duos at Landing 3.
- **At most one full-screen card per door.**

---

## 8. User-wish trace

- Every RoomDef carries `wish[]` and `homage[]` tags.
- An EditMode test fails the build if the first climb plus a seeded climb 2 misses a wish.
- **Fidelity KPI:** at least 70% of first sessions reach each wish by minute 60, and at least 60% reach ★1.

| The user's words | Where it lives | First met | Status |
|---|---|---|---|
| "name it for me" | KNOTWELL over the well bottom | 0:00 | A |
| "mafia, among us" | `doppelfrog` | 13:45 | B |
| "chained" | `sp_tongue_tether`; `heart_tied_bridge` | 17:30 | B |
| "peak" | `sp_grip_wall` | 14:50 | B |
| "CO-OP games modes and time" | TEAMBOUND homes; Quick/Full Climbs; Rematch `OLD TIME 1:12 → 0:18`; the Chrono-Slime | 2:10 on | A/B |
| "skins … shop … make some money" | The Mirror (12 earned in A, 24 in B); the Keeper hat; the stall; Supporter Sets as Steam DLC | 10:40 | A/B |
| "maze dungeon … randomized" | Numbered doors; `echo_warren` (your croak draws the maze); seeded climbs | 5:55 | A |
| "meet in different levels … 1a 1e 1b" | Lettered pairs; forks with E doors; the Meeting Door; offstage Rivals | 2:10 / 12:15 | A/B |
| "weird clearing conditions (not traditional fighting)" | Rule doors: hidden clears, 2 Twists, `[ NOTED ]` | 1:00 | A |
| "increase there powers" | Glow, verb ranks, Awakenings, Boons, the Rematch flatten | 0:20 / 2:00 / 7:00 / 18:40 | A/B |
| "Tutorial Is Too Hard … brutal … sabotage, team up" | Entrance difficulty doors; Hell redaction; SOLO E doors; Heart doors; the Knot | 0:00 / 11:05 / 16:30 | A/B |
| "layers from center to outwards circle" | The map's rings; the Mouth | 0:00 | A |
| "frog in a well … sky … space" | Hatch; the window at door 4; the Keeper pull-back; ★1 and the Rim (Space through a tear); ★2–★4 [LATER] | 0:03 / 3:40 / 10:40 / 22:30 | A/B |
| "mini sidegames to lighten up" | Frog Stack, Fly Catch, Jar Tag, Lily-Pad Sumo; Landing Party | 4:45 | A/B |
| "the visuals the aniamtion" | Procedural frog, toon ramp and rim, self-lit tells, juice | 0:03 | A |
| "immersive and addicting and fun, feel progress" | The cadence contract, the results ceremony, the curiosity teaser | always | A |
| "korean, english light novels" | System windows with causes; F→SSS; secret quests; hidden clears | 0:03 / 13:25 | A/B |
| "unity based game" | Unity 6.3 LTS, URP 17, NGO 2.x host, Facepunch Steam + LAN | — | A |

---

## 9. Glossary

This is a condensed copy of DECISIONS §10, which stays authoritative for spellings and "never" forms. Rows 1–29 are the whole player-facing vocabulary. Row 30 is for writers only.

| # | Term | Meaning |
|---|---|---|
| 1 | **KNOTWELL** | The product (never "Knot Well" or "Notwell") |
| 2 | **Layer** / **the Ascent** | A ring: the Well, the Sky, Space, Beyond. The Ascent is all four. (Never "tier".) |
| 3 | **Climb** (Quick, Full) | 20 doors; Quick ends at the Keeper (~11 min), Full at the Warden (~24 min). (Never "run".) |
| 4 | **Door number** | Runs on across layers; pairs are lettered (`12E`) |
| 5 | **Plaque** | Number + letter, suit (♠ Body, ♦ Mind, ♣ Together, E, ♥), prize icon, skulls |
| 6 | **Breather** | A 15–30 s door: jar, toy, window, sleeping threat, gold |
| 7 | **Rule door** / **Twist** | One never-killed monster, cue and rule; 2 seeded Twists |
| 8 | **Set piece** | The Grip Wall or the Tongue-Tied Tether |
| 9 | **Fork / Meeting Door** | A split into a group door and an E door, rejoined at a two-lock door; untaken sides go **offstage** |
| 10 | **Landing** | A 40 s warm stop and save after doors 5, 10 and 15 |
| 11 | **Keeper / Warden** / **Party Rank Up** | The door-10 and door-20 bosses and their shared fanfare |
| 12 | **Gold door / Rematch door** | A treasure room with a Legendary; a beaten room at its old numbers |
| 13 | **Heart door (♥)** | Announced betrayal, always with a co-op answer |
| 14 | **Knot / Cut / Duo** / **hold on** | A Landing pact; hold Shove 1.2 s to cut it; Tongue to hold on |
| 15 | **Betrayal Cam / WANTED poster / Vengeance** | The 0.8 s replay; the one-door poster; the victim's tag-back quest |
| 16 | **The Mouth** | The sky opening, 31° → 74° |
| 17 | **Fireflies** | XP only; bank at the clear |
| 18 | **Glow Level** / **Crown glow** | Lv1–10 shown as light; the Lv10 halo (never "size") |
| 19 | **Verb rank** / **Awakening** / **Mastery** | Hop, Tongue, Croak I–IV. III: Air Hop, Long Tongue, Twin Toll. |
| 20 | **Boon** (Duo, Legendary) | The build; 4 passive + 1 active slot |
| 21 | **Wish Coins / Pearls / the Mirror** / **Supporter Sets** | In-climb coins; the one meta currency; the cosmetics mirror; paid DLC |
| 22 | **Tower Rank** / **talents** / **Rank Sync** | F → SSS; a PvE talent per rank; talents off |
| 23 | **Bestiary** | A page per monster, 4 stamps, death tips |
| 24 | **Class / secret quest / Signature** | 3 open + 6 secret sidegrades; the private quest; the Power hold |
| 25 | **Spots / Dark / tadpole ghost / Team Lives** | 3 back spots; out; ghost; shared lives |
| 26 | **Difficulty** (Easy, Normal, Hard, Hell) / **Sealed** | Chosen at the entrance; opt-in redaction for +50% |
| 27 | **Rivals** (Rookie) / **Drama Director** | The 10 bot frogs; the system staging their beats |
| 28 | **The System** | One-line `[ BRACKETED ]` windows: a change and its cause |
| 29 | **★1 Out of the Well / the Rim / molt** | The first reveal; the walkable rim; the layer's add-on parts (Glider molt) |
| 30 | *RoomDef, `IHeroBody`, Seat Hue* | Writers only |

**Retired words:** Belay, Door Draft, Latch, Stampede, the Tide, Omens, clamp, Soot, Knives, Tribunal, Ledger, Altar, trait, Anvil, Origins, Codex, wax, Snuffed, Scorched, Embers, Drips, Sparks, Wickbook, "eat to grow", Megafrog, Big Voice, "Tree Frog molt", W-R01-style ids.

---

## 10. Vertical slice checklist

**The slice is THE WELL:**
- the authored Full Climb, doors 0–20;
- ★1 onto the Rim;
- a seeded climb 2 with fresh monsters.

Row numbers are from the DECISIONS §6 roster.

### [MUST-A] Milestone A: the Quick Climb at ship polish (the free demo and Next Fest build)

**Rooms (rows 1–18)**
- [ ] Hubs: `hub_well_bottom`, `hatch_pond`, `landing_well`.
- [ ] Breathers: `br_shove_door`, `br_window`, `br_gold`, `br_jar_mites`.
- [ ] Rule doors: `bell_golem` (the style-lock room), `heron_shadow`, `lily_raft`, `fog_stair`, `snapper_crossing`, `echo_warren`, `lamp_knight`, `snake_coil`.
- [ ] Toys: `toy_frog_stack`, `toy_fly_catch`.
- [ ] The Keeper: `keeper_bell_raft`.

**Play**
- [ ] 8 bindings; verb ranks I–III; Glow 1–7 on screen (the curve defined to 10).
- [ ] Spots, the catch, the ghost, the revive, Team Lives.
- [ ] Easy and Normal, plus Hard as a data flag (it unlocks per lobby at a Keeper clear).
- [ ] 8 Boons + 2 Legendaries, auto-granted.
- [ ] The Keeper Landing ceremony.
- [ ] Seeded repeat Quick Climbs, with pick 1 of 3 from door 2.

**Meta and hub**
- [ ] Wish Coins, Pearls, the stall from Landing 2, the results ceremony.
- [ ] Tower Rank F–C.
- [ ] 9 Bestiary pages (8 rule monsters + the Keeper).
- [ ] Save and resume at Landings.
- [ ] The Mirror with 12 earned cosmetics.
- [ ] The hub: the map, the statue, 4 difficulty doors.

**Social**
- [ ] 7 Rookie Rivals with the Drama Director's first-climb beats.
- [ ] Blame tags and the 3 s fall replay.

**Plumbing**
- [ ] Steam Timeline markers.
- [ ] English string tables.
- [ ] Steam friend and private lobbies, plus LAN.
- [ ] "Worth it?" and funnel telemetry.

**Tests**
- [ ] The validators, the 7-bot soak and the growth CI test.
- [ ] FO §8.6's enforcement tests.
- [ ] The performance budget: host sim ≤8 ms, frame ≤16.6 ms at 1080p, with 8 seats and 2 live rooms.
- [ ] *Test only:* a greybox Wick-Flame `IHeroBody` for Gate B.

### [MUST-B] Milestone B: the Full Climb, ★1, the Rim and climb 2

**Rooms (rows 19–34)**
- [ ] Heart doors: `heart_two_pads`, `doppelfrog`, `heart_split_swallow`, `heart_tied_bridge`.
- [ ] The fork: `slime_foundry`, `glitch_eye`, `meeting_room`, `toy_jar_tag`.
- [ ] Set pieces: `sp_grip_wall`, `sp_tongue_tether`.
- [ ] `toy_lily_sumo`, `br_sleeping_toad`.
- [ ] `warden_the_jar`, `rim_surface`.
- [ ] Climb-2 debuts: `moss_snail`, `web_spider`.

**Systems**
- [ ] The Rematch overlay.
- [ ] ★1, made of shells, Shuriken and Cinemachine (no VFX Graph).
- [ ] Rank IV; Glow 8–10 and the Crown glow.
- [ ] 16 Boons + 4 Duos + 4 Legendaries, with picks.
- [ ] Knot, Cut, Duos, the Betrayal Cam, WANTED, Vengeance.
- [ ] 9 classes and their secret quests.
- [ ] Tower Rank to S.
- [ ] Hell and Sealed.
- [ ] All 10 Rivals and the Register.
- [ ] 14 Bestiary pages.
- [ ] 24 earned cosmetics and 2 Supporter Sets as Steam DLC.
- [ ] Landing Party.
- [ ] Retry from door 11.
- [ ] +50 Pearls on first surfacing.

**Tests**
- [ ] The wish-coverage test and the fidelity KPI.

**Slip order** (only with the user's sign-off):
1. `heart_tied_bridge`
2. `heart_split_swallow`
3. `toy_lily_sumo`
4. `br_sleeping_toad`
5. `glitch_eye`
6. Landing Party

**Never slip:** `doppelfrog`, both set pieces, `meeting_room`, the Warden, ★1 and the Rim, the debuts, Hell and Sealed.

### [SHOULD], in order (cut from the bottom)

1. The share card.
2. The streamer-safe toggle.
3. Korean localization.
4. Public matchmaking and drop-in.
5. Chorus at results, the light pillar and the reflection.
6. `moth_library` and the E-variants.
7. `toy_bigtoad`.
8. `sunken_bucket`.
9. Sky Preview (doors 21–25).

### [LATER]

- The Sky, Space and Beyond climbs, with their Wardens.
- ★2–★4, the Revelation and Cycle 2.
- Mimic Climb and the Daily Seed.
- Friends-only proximity voice; the Watchers layer.
- `mirror_toll`, `ash_axeman`, `hollow_toad`, and 12 more Well rule doors.
- VFX Graph; the IL2CPP release build; NGO 3.0 on Unity 6.7 LTS (2027).

---

## 11. Build order, milestones and playtest gates

Weeks after M0 are **planning hypotheses**. Re-plan once M0 measures real agent-days per room; the target is an S room in ≤3 agent-days.

| Step | When | Build | Exit |
|---|---|---|---|
| **Human** | Now, in parallel | Trademark, domains, handles, AppID. Read the Synty and Sonniss AI clauses before those assets enter. The license is already active (`Unity_lic.ulf`). | Clearance before public use |
| **M0** | Weeks 1–2 | Open `KNOTWELL/` in 6000.3.25f1; git + LFS. Manifest: add Facepunch and Localization; remove purchasing, collab-proxy, legacy analytics, xr legacy input. Split the assemblies. **Netcode PoC, NGO vs FishNet, at 150 ms / 2% loss:** tongue on props and players, raft torque, shove-off-pad, 2-room visibility, 7 bots. **In parallel:** a JSON-generated capsule greybox of doors 0–10; the growth CI test; the performance gate. | Stay on NGO unless tongue or raft feel fails *and* FishNet fixes it. An unfair tongue-on-player falls back to shove. Then **PG1**. |
| **Style lock** | Week 3 | `bell_golem` and the Frog at final look: Blender-script mesh, procedural rig, HLSL toon and outline, PrimeTween feedback, Cinemachine Impulse | **PG2** |
| **Content factory** | Weeks 4–10 | The other 17 MUST-A rooms, the Keeper, the ceremony, the meta, Steam, telemetry | **PG3** per room |
| **Milestone A** | ~Week 12 | The polish pass; the Wick test body | **Gates A and B**, then the **Gate to B**. The Steam page goes live only after Gate A. |
| **Milestone B** | ~Weeks 13–24 | The MUST-B list | **PG7** |
| **SHOULD / LATER** | After B | §10 order; layers ship as free named updates | — |

| Gate | Who, when | Procedure | Pass (all) | On fail |
|---|---|---|---|---|
| **PG1: the 10-minute greybox feel test** | The user, plus any design-naive friend; end of M0, and again after every pacing change | Capsule greybox, doors 0–10 to the Keeper Landing, DECISIONS §5 script with the bot beats stubbed (Kestrel, Moss's catch, the raft misjump). Run 1: solo + 7 bots. Run 2: 2 humans on LAN at 150 ms / 2%. Every growth, laugh-beat, scale-view, clear, fail and quit is logged with a timestamp. | In control ≤0:05; gulp ≤0:25; Kestrel yanked ≤0:30; Shatter Croak ≤3:00; Keeper Landing between 9:30 and 12:30; no 90 s gap without a logged beat outside rule doors; time outside rooms ≤12%; 2 powers named unprompted; "Worth it?" Yes; no soft-locks | Stop and fix pacing before any content (FO §9.3) |
| **PG2: style lock** | The user, week 3 | 3 golden screenshots; a 10 s frame clip; an 8-frog shot at 25 m | Hitstop 50–120 ms; squash on every hop; rising-pitch count-ups; tells read at 25 m; the room is clearable muted; spots and glow tiers are distinct; the user signs off | Iterate; the content factory waits |
| **PG3: room done** | Every room | Validators; soak over 50 seeds | Contract complete; ≥90% of seeds cleared within the hard cap; the `05` Definition of Done met | No merge |
| **Gate A: readability** | The user + ≥4 friends, on the A build | 8 frogs at 25 m, Glow set by debug including the halo | HP read within 1 spot; tiers named (dim, glowing, haloed); the Frog within 10% of the Wick; no Pepe association from 5 cold viewers | One remediation pass (bigger spots, more rim, more upright), a re-test, then the Wick |
| **Gate B: Frog vs Wick** | Same | The same Quick Climb as each hero | The winner has the better power recall and "Worth it?" | The Wick ships; the frog stays as the statue and the Revelation silhouette |
| **Gate to B** | After A and B | FO §6.1 with 1 human + 7 bots; with 4 humans on LAN (150 ms / 2%); in one two-account Steam session | Every Definition of Done met; soak ≥90%; performance budget met; FO §9.3 stop conditions measured | Fix before B |
| **PG7: slice** | First-session testers, on the B build | The Full Climb and climb 2 on all three network setups | Wish-coverage green; fidelity KPI (≥70% per wish by 60 min, ≥60% ★1); ≥60% "Worth it?" Yes; ≤25% mid-room quits before door 5 | Cut SHOULD items, never a "never slip" one |

**Standing stop conditions** (FO §9.3). Stop adding content if any holds:
- the median first power comes after 3:00;
- testers can't name a gained power;
- HP is unreadable at 25 m;
- the tongue feels unfair at 150 ms;
- fewer than 60% say "Worth it?" Yes;
- more than 25% quit mid-room before door 5.

---

## Open questions

1. **Gates A and B come late.** They wait for the Milestone A build, so the full frog look is built before any human judges it. I followed that ruling. A free hedge: show the PG2 screenshots to 5 cold viewers for the Pepe check. It would not replace Gate A.
2. **No calendar for A and B.** DECISIONS dates only M0 and week 3. The weeks in §11 are this file's hypotheses and need confirming after M0.
3. **Gate B needs a Wick body in Milestone A,** but the MUST-A list doesn't name one. I listed it as test-only, at greybox fidelity. Please confirm.
4. **The noun budget.** FO caps coined nouns at about 25, and rows 1–29 exceed it. The Drama Director should never reach the UI; consider moving it to row 30.
5. **Quick Climb default vs the ★1 KPI.** "≥60% of first sessions reach ★1" needs players to press "Climb on" at the Keeper Landing, yet the Quick Climb is the default and the buttons have equal weight. Either make a new profile's default the Full Climb (with the Keeper Landing as a bookmark), or measure ★1 over the first two sessions.
