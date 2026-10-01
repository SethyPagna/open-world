# KNOTWELL · 04 · Progression and economy

**Version** 1.0 · **Date** 2026-09-29 · **Status:** master design, bound by `DECISIONS.md` (**DEC**) and `_design/FUN_OVERHAUL.md` (**FO**).

**What this file owns** (DEC §9):
- firefly yields and the corrected Glow table;
- verb ranks, Awakenings and Masteries (the *progression rules*; the physical numbers live in `02_HERO_AND_CONTROLS.md`);
- the full Boon, Duo and Legendary pool and its pick rules;
- the 9 classes and their secret quests;
- Tower Rank and talents;
- the 14-page Bestiary;
- Wish Coins, jars, the stall and Pearls;
- the results ceremony;
- difficulty, Team Lives, failure and saving;
- Well-Rested;
- the growth CI test and the economy tests.

**What it does not own:** room contents and plaques (`05`), cosmetic items and Supporter Set contents (`08`), Knot/Cut/Vengeance rules (`03`), hub and Landing layout (`07`), and art (`09`).

**Tags.** Every feature carries **[A]** (MUST-A, the Quick Climb and free demo), **[B]** (MUST-B, the Full Climb and ★1), **[SHOULD]** or **[LATER]**.

**Numbers.** Every number here is a **greybox hypothesis** (FO §9.3) unless it cites FO or DEC. All of them live in JSON (§14), so tuning never touches code. Yields and curves were re-simulated for this file; they reproduce DEC §5's growth check exactly.

**Design test for every row below:** does it make the player *feel stronger, laugh, or see something bigger* within about 90 s (DEC §5)? A row that only adds bookkeeping was cut.

---

## 1. Three growth tracks at a glance

| Track | What grows | How often | Resets? | Where you see it |
|---|---|---|---|---|
| **Body** | Glow Level 1–10 and verb ranks I–IV | a level every 2–3 doors | every climb | belly light, orbiting fireflies, markings, Awakening parts, the Crown glow |
| **Build** | Boons: 4 passive + 1 Power | about one every 2 min (~13 per Full Climb) | every climb | Boon beads on the neck; the pick overlay |
| **Legend** | Tower Rank F → SSS and talents, the Bestiary, classes, Pearls | every climb, **win or lose** | never | the results ceremony, name tag letter, the hub wall, class markings |

**The cadence contract** (FO §3.5; telemetry targets):
- something ticks every **10–30 s** (a gulp, a pot, a coin);
- a door clears every **~1 min**;
- a Boon every **~2 min**;
- a Glow level every **2–3 doors**;
- a Landing or rank moment every **~5 min**;
- a scale reveal every **~24 min** (`01_WORLD`).

**Five laws that every number in this file obeys:**
1. **Growth is light, never size or hitbox** (DEC §2). No row here changes spots, hitbox, base speed or shove.
2. **Numbers bind.** Every verb rank, and most Boons, crosses a threshold that rooms are authored against (FO §3.8 rank lanes).
3. **No clamp.** Nothing ever nerfs your powers. Old rooms are for flattening (Rematch doors, Warden phase 1).
4. **No compounding.** No pickup magnet or loot rate scales with Glow Level (FO §4.1). The 70/30 split stops the strongest frog snowballing.
5. **The System never lies.** Every percentage, count and bar shown is computed from real data (FO §2.2).

---

## 2. Fireflies and Glow Level

### 2.1 Sources, banking and spills [A]

Fireflies are **XP only**. They are never spent and never called a currency (DEC glossary 17).

- **70% clear bonus, 30% loose** (FO §4.1).
  - The **clear bonus** is paid equally to every frog inside when the door clears, **tadpole ghosts included**.
  - **Loose** fireflies are gulped: firefly clouds, popped mites and room jars.
- **Cheeks and banking.** Gulped fireflies ride in your cheeks, which glow with them (`02`'s cheek-glow readout). They **bank when the door clears**. Banked fireflies are never lost, stolen or reduced by anything.
- **Spills.** A hit spills **20%** of your unbanked fireflies, rounded up, as a glowing clump.
  - **Outside Heart doors** the clump always returns to its owner: whoever tongues it, it flies to the owner. Uncaught, it drifts back to the owner after 3 s.
  - **Inside Heart doors** the catcher keeps it (announced on the plaque). Uncaught after 5 s, it drifts back to the owner.
- **Failure.** A failed room pays **50% of its clear bonus**; loose fireflies already gulped still bank (FO §3.7).
- **E doors.** On failure their entrants lose only that door's Boon and their **unbanked** fireflies; the 50% clear bonus still pays, and banked fireflies are safe (FO §3.7).
- **Hidden clear.** The door's total yield (clear + loose) is doubled (**×2**) for every frog inside (FO §3.8). **Cleared with help** at a Meeting Door keeps the Boon pick but loses the hidden-clear bonus (FO §3.3).

### 2.2 Yields per door (Normal) [A]

*d* is the door number within the climb (1–20). Source: FO §4.1, confirmed by DEC §5.

| Door type | Clear bonus (each frog) | Loose (typical gulp) | Typical total | Notes |
|---|---|---|---|---|
| Hatch pond (door 0) | — | 30 (one cloud) | **30** | always exactly Lv2 at ~0:20 |
| Breather: jar, window, toy door, sleeping threat | 8 + d | 4 | 12 + d | toy doors pay an earned jar on top (§10.2) |
| Rule door, Heart door, E door, Rematch door | 18 + 2d | 8 | 26 + 2d | hidden clear ×2 |
| Set piece | 25 + 2d | 10 | 35 + 2d | hidden clear ×2 |
| Keeper | 60 | 10 | 70 | — |
| Warden | 120 | 10 | 130 | — |
| Gold door | 3 × (18 + 2d) | 0 | 54 + 6d | the ×3 applies to the clear bonus only |

**Multipliers** (multiply together, applied to the door total):

| Modifier | Fireflies | Source |
|---|---|---|
| Hard | ×1.5 | FO §3.6 |
| Hell | ×2 | FO §3.6 |
| Sealed room (§11.1) | ×1.5 (not in Hell, which always redacts) | FO §3.8 |
| Boons: Deep Cheeks and Bold Belly (loose part), Double or Nothing (door total) | capped at ×3.0 combined (§6.3) | §6.2 |

**Nothing else** changes yields: not Glow Level, not Tower Rank, not class, not cosmetics.

### 2.3 Glow Level: curve, readouts and moments [A: Lv1–7 on screen, curve defined to 10; B: Lv8–10]

**Curve** (FO §4.1, binding): the total banked fireflies needed for level *n* is **15·(n−1)(n+2)/2**.

| Level | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| Total banked | 0 | 30 | 75 | 135 | 210 | 300 | 405 | 525 | 660 | 810 |
| Step | — | 30 | 45 | 60 | 75 | 90 | 105 | 120 | 135 | 150 |
| Verb rank gained (typical order, §3) | — | Tongue II | Hop II | Croak II | **Tongue III (Awakening)** | **Hop III (Awakening)** | **Croak III (Awakening)** | Tongue IV | Hop IV | Croak IV + **Crown glow** |

**What the body shows per level.** `02_HERO_AND_CONTROLS.md` §5.2 owns the formulas; this is the summary that progression relies on.

| Level | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| Orbiting fireflies (L − 1) | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 + **Crown glow** |
| Belly emission (02) | 0.35 | 0.81 | 1.14 | 1.45 | 1.73 | 2.01 | 2.27 | 2.52 | 2.76 | 3.00 |
| Marking groups lit (02) | 0 | 0 | 0 | 1 | 1 | 2 | 2 | 3 | 3 | 4 |
| Power tier for Gate A (FO §2.3) | dim | dim | dim | glowing | glowing | glowing | glowing | glowing | glowing | **haloed** |

- The belly light's range also grows (2 m → 6 m), so **your growth literally pushes back the dark of a rule room** (02).
- The Seat Hue rim light never changes with level (DEC §2).

**The level-up moment** (every level, at the door clear):
1. The bank count-up finishes (0.6 s, rising pitch).
2. `[ GLOW 4 → 5 ]` System window; +1 firefly swoops into orbit over 0.4 s and the belly steps up (02 §5.2); 80 ms hitstop; a rising pentatonic arpeggio. Nothing changes size: the collider never moves.
3. The verb-rank line follows (§3).

### 2.4 After Lv10: the Crown keeps ticking [B]

Hard and Hell reach Lv10 early (Hard ~door 13, Hell ~door 10; §5.3), and Normal at door 18. So fireflies must still mean something after the cap:
- every **75** fireflies banked past 810 add **one spark** to the Crown glow (maximum +6 sparks) and **+5 Wish Coins**;
- System line: `[ CROWN +1 ]`.

It is visual plus a little stall money. It adds no power, so the fairness contract is untouched.

---

## 3. Verb ranks, Awakenings and Masteries [A: I–III; B: IV]

**Rule** (FO §4.1, DEC §5):
- Each Glow level gives **+1 rank to one verb**: Hop, Tongue or Croak.
- **Ranks II are reached at Lv2–4, Awakenings (rank III) at Lv5, 6 and 7, Masteries (rank IV) at Lv8, 9 and 10.** The *levels* are fixed; *which verb* goes first follows usage.
- The verb that ranks up is **the one you used most since your last level-up**, subject to **no verb more than 1 rank ahead of your lowest**. This makes the ranks round-robin in usage order.
- Ties break Tongue > Hop > Croak, so the first climb's default story (Tongue II in the pond) holds.
- There is no menu. The System names the verb and the reason: `[ TONGUE II ] 4.5 m. Grapple unlocked. Because: you grabbed 14 things.`

**What counts as a "use"** (counters in `VerbRanks.json`; reset at each level-up):

| Verb | Counts | Weight |
|---|---|---|
| Hop | a charged hop; a hop that lands ≥ 0.8 m higher than take-off; a stomp landing that pops something | 1.0 |
| Tongue | a successful grab, carry, lever pull, grapple, catch or gulp | 1.0 |
| Croak | a pulse that touches ≥ 1 bell, mite, monster, egg or pot; a revive hold | 1.5 |

Croak is weighted up because rooms offer fewer croak targets than hop surfaces. Tune in greybox.

**The ranks** (FO §4.1 with DEC's rename; `02` owns the physical detail, and rooms are built against these exact numbers):

| Verb | I (start) | II | **III: Awakening** | IV: Mastery |
|---|---|---|---|---|
| **Hop** | apex 1.4 m; charged 1.9 m | charged 2.4 m (rank-II ledges at 2.3 m) | **Air Hop**: a second hop in mid-air | charged 3.0 m; the landing stomp pops mites within 3 m |
| **Tongue** | 3 m; props ≤ 20 kg, levers, keys | 4.5 m; **grapple** (anchors pull you) | **Long Tongue**: 6 m; 2 things at once; snatch and spit projectiles | 8 m; chain grapples with no touchdown |
| **Croak** | pulse 4 m: rings the nearest bell, stuns mites | 6 m; staggers small monsters 1 s | **Twin Toll**: rings 2 bells at once; the pulse knocks mites back | **Thunder Croak**, 9 m: shatters pots and mites in range; 2 s stagger on rule monsters (never a kill) |

**Body readouts per verb rank** (fixed sockets on the one rig; `02` §5.3 owns the parts):

| Rank | Hop | Tongue | Croak |
|---|---|---|---|
| II | shown by the level's glow and the System line | same | same |
| III Awakening | **spring heels**: glowing ankle bands; a light puff under the feet on each Air Hop | **a glowing tongue-tip bead** that glints from the mouth corner | **the Twin Toll throat sac** with two bell-ring marks (inside the hitbox) |
| IV Mastery | the bands extend into shin stripes; a 3 m stomp ring on charged landings | the tongue leaves a 0.3 s light ribbon | a crackle mask on the sac; the 9 m Thunder ring |

**Awakening moment** (the biggest in-climb beat, three per climb):
- a 1.8 s fanfare: camera push-in 15% (Cinemachine), the part pops on (scale 0 → 1.2 → 1.0 over 0.25 s, 02), full-body flash;
- `[ TONGUE III: AWAKENING ] Long Tongue. 6 m. Because: you grabbed 22 things.`;
- two Rivals bark (`03`): "Since when does your tongue do *that*?";
- a Steam Timeline **featured** marker (DEC §8.2 #21).

**Mastery moment:** a 1.2 s fanfare, the IV readout appears, `[ HOP IV: MASTERY ] 3.0 m. Because: …`. Lv10 adds the Crown glow (§2.3).

---

## 4. In-room pickups [A]

Every room gives power an outlet, even though the rule monster can't be killed (FO §3.8 #7).

| Pickup | Where | Gives | Rule |
|---|---|---|---|
| **Firefly cloud** | every room; 2–4 per rule door | 2–4 loose fireflies each | tongue or hop through it to gulp |
| **Mite** (moth, bell-beetle) | every rule door, jar breathers | 1 loose firefly each on pop | stomp, tongue or croak it |
| **Pot** | most rooms | its 1–2 loose fireflies (`05`) **and 1 Wish Coin to every frog in the room**, ghosts included | shared coins, so a Shatter Croak player is everyone's hero, and nobody hogs |
| **Room jar** (Bronze / Silver / Gold; `05`'s `Jar` kit piece) | jar breathers, `br_window`, the sleeping toad's back, the gold door's plinth | its coins to **every frog in the room** at once; it spills part of the room's loose fireflies (no extra) | open it with tongue, stomp or croak (`05`); §10.2 |
| **Earned jar** | toy doors, jar-prize doors, hidden clears, Rematch times, toys, secret quests | carried in your pouch; opens in the next Landing lineup (§10.2) | nothing to carry physically; the pouch icon shows it |
| **Heart-door jar** (`heart_split_swallow`) | that room only | unbanked fireflies, by `03`'s share-or-swallow rule | a room prop, not a coin jar |
| **Knocked-out spot** | wherever you are hit | your spot back | any frog tongues it within 3 s; it always returns to its owner (`02`) |
| **Spilled clump** | after a hit | your unbanked fireflies | §2.1 |
| **Monster projectile** | rooms flagged `hasProjectiles` | needs Long Tongue to snatch and spit; feeds the Bell-Eater quest | `05` places them |
| **Meeting key** | fork rooms | opens one lock of the Meeting Door | `03`, `07` |
| **Heal bug** | bought at the stall only (§10.3) | +1 spot when you drop to 1 | carried; tongue-passable |

---

## 5. The in-climb power curve, door by door

### 5.1 The authored first climb (solo + 7 Rookie Rivals, Normal) [A to door 10; B after]

The door list, rooms and clocks are DEC §5. Growth follows §2.2 with **no hidden clears**, the seeded gold door at 9, and the typical path (3C, 5C, 7C, 8A, 12E, 17C). **Coins** follow §10.1. Stall spending assumed: 60 at Landing 2, 25 at Landing 3.

| Door | ≈ Clock | Room | Banked | Glow | H/T/C | Boons (P = passive, ★ = Power) and jars | Coins held | Body now shows | Beat |
|---|---|---|---|---|---|---|---|---|---|
| 0 | 0:20 | `hatch_pond` | 30 | **2** | I/II/I | — | 0 | belly lit; 1 firefly | `[ GLOW 1 → 2 ] [ TONGUE II ]` |
| 1 | 0:35 | `br_shove_door` | 43 | 2 | I/II/I | the Bronze jar pops in the room | 11 | — | first pots, first jar |
| 2 | 1:00 | `bell_golem` | 73 | 2 | I/II/I | Shatter Croak I (P1) | 17 | 1 Boon bead | first power spike, auto |
| 3 | 2:10 | 3C `lily_raft` (Boon prize) | 105 | **3** | II/II/I | + Lifeline **II** (P2) | 23 | 2 fireflies | the Boon-prize door pays one rank higher (§6.1) |
| 4 | 3:40 | `br_window` | 121 | 3 | II/II/I | the Bronze jar pops in the room | 30 | — | scale |
| 5 | 3:55 | 5C `snapper_crossing` (jar prize) | 157 | **4** | II/II/II | + Chorus I (P3); a Silver jar to the lineup | 36 | first markings lit | the Hop II ledge binds |
| L1 | 4:45 | Landing 1 | 157 | 4 | — | lineup: Silver | 52 | — | rest; Frog Stack earns a Bronze jar |
| 6 | 5:25 | `toy_fly_catch` | 175 | 4 | — | a Bronze jar | 53 | — | toy |
| 7 | 5:55 | 7C `lamp_knight` (Boon prize) | 215 | **5** | II/**III**/II | Chorus I → **III** (upgrade, +2 for the Boon prize) | 60 | **tongue-tip bead** | first Awakening; Chorus is at home in this room |
| 8 | 7:05 | 8A `snake_coil` (jar prize) | 257 | 5 | — | Shatter Croak I → II (upgrade); a Silver jar | 67 | — | "duplicates upgrade", learned by doing |
| 9 | 8:05 | `br_gold` (seeded) | 365 | **6** | **III**/III/II | + **Moon Hop** (P4); the Gold jar pops (+20, +1 reroll) | 97 | **spring heels** | jackpot; `[ AIR HOP ]` |
| 10 | 8:55 | `keeper_bell_raft` | 435 | **7** | III/III/**III** | — | 112 | **Twin Toll sac** | Twin Toll rings the Keeper's bells |
| L2 | 10:25 | Keeper Landing | 435 | 7 | — | **first pick 1 of 3** (8 s); Party Rank Up (+1 reroll); lineup ×3 | 142 → 82 after the stall | — | Rank F → E; stall opens; the Quick Climb ends |
| 11 ♥ | 11:05 | `heart_two_pads` | 483 | 7 | — | pick | 89 | — | Heart door |
| 12 | 12:15 | 12E `slime_foundry` | 533 | **8** | III/**IV**/III | pick (Rare+); Jar Tag earns a Bronze jar | 102 | tongue light ribbon | fork + Meeting |
| 13 | 13:25 | `br_jar_mites` | 558 | 8 | — | the Silver jar pops in the room (floor 3) | 118 | — | secret quest appears |
| 14 ♥ | 13:45 | `doppelfrog` | 612 | 8 | — | pick | 125 | — | Mafia beat |
| 15 | 14:50 | `sp_grip_wall` | 677 | **9** | **IV**/IV/III | pick | 134 | shin stripes | PEAK |
| L3 | 16:30 | Landing 3 | 677 | 9 | — | lineup; stall; Knot offered | 153 → 128 | — | Knot, Cut, Duos |
| 16 | 17:10 | `toy_lily_sumo` | 705 | 9 | — | a Bronze jar | 129 | — | toy |
| 17 | 17:30 | 17C `sp_tongue_tether` | 774 | 9 | — | pick: **Duo offered** (Frog Sling) | 139 | Duo bead | Chained |
| 18 | 18:40 | Rematch `bell_golem` | 836 | **10** | IV/IV/**IV** | pick; a Silver jar (old time beaten) | 148 | **Crown glow**; Thunder ring | `OLD TIME 1:12 → 0:18` |
| 19 | 19:10 | `br_sleeping_toad` | 867 | 10 | — | the Silver jar on its back (+10, if you dare) | 161 | — | dread, then a waltz |
| 20 | 19:30 | `warden_the_jar` | 997 | 10 | — | Party Rank Up (+10 coins); 2 Crown sparks (+10) | 201 | Crown +2 sparks | Trust Fall |
| ★1 | 22:30 | results on the Rim | — | — | — | lineup at results (+15) | **216** | — | +50 Pearls, first surfacing |

**Totals for the first Full Climb:** 9 levels, 3 Awakenings, 3 Masteries, **13 Boons** (6 auto-granted before the Keeper, 7 picked after), 1 Legendary, 1 Duo offered, 1 Rematch flatten, up to 1 class. Wish Coins: gross ≈ 301, held at the end ≈ 216.

**Why doors 7 and 8 upgrade instead of adding Boons.** Passive slots fill at doors 2, 3, 5 and 9 (Moon Hop). The authored grant plan (§6.1) keeps slot 4 free for the gold door, so the Legendary never has to replace anything, and the player learns "duplicates upgrade" before the first choice screen.

### 5.2 A seeded second climb (2 friends + 5 Rivals, Normal) [B]

This replaces FO §4.5's table, corrected to the yields (DEC §8.2 #9). Picks run from door 2; forks at 7, 12 and 17; Heart doors from 6; the debut rule places `moss_snail` and `web_spider` in doors 3–9 (DEC §5). Assumed: 1 hidden clear (door 15), the gold door rolled at 16, stall spend 60 + 45.

| Door | Type | Room (example) | Banked | Glow | H/T/C | Boon event and jars | Coins held |
|---|---|---|---|---|---|---|---|
| 0 | pond | `hatch_pond` | 30 | 2 | I/II/I | Rank D talent: start with a Common of your choice | 0 |
| 1 | jar | `br_jar_mites` | 43 | 2 | — | the Bronze jar pops | 11 |
| 2 | rule ♠ | 2A `snake_coil` | 73 | 2 | — | pick 1 | 17 |
| 3 | rule ♦ | 3B `moss_snail` (debut, jar prize) | 105 | 3 | II/II/I | pick 2; a Silver jar | 23 |
| 4 | window | `br_window` | 121 | 3 | — | the Bronze jar pops | 30 |
| 5 | rule ♣ | 5C `web_spider` (debut) | 157 | 4 | II/II/II | pick 3 | 36 |
| L1 | Landing | — | 157 | 4 | — | lineup: Silver; Frog Stack earns a Bronze | 52 |
| 6 | ♥ | `heart_split_swallow` | 195 | 4 | — | pick 4 (Risk family); secret quest appears | 58 |
| 7 | fork | 7B `echo_warren` / 7E; Meeting toy Bronze | 235 | 5 | II/III/II | pick 5; Long Tongue | 65 |
| 8 | set piece | 8C `sp_grip_wall` | 286 | 5 | — | pick 6 | 73 |
| 9 | toy | `toy_fly_catch` | 307 | 6 | III/III/II | a Silver jar (won) | 74 |
| 10 | Keeper | `keeper_bell_raft` | 377 | 6 | — | pick 7; Party Rank Up | 89 |
| L2 | Landing | — | 377 | 6 | — | lineup ×4; stall −60 | 119 → 59 |
| 11 | rule ♣ | 11C `lamp_knight` (jar prize) | 425 | 7 | III/III/III | pick 8; a Silver jar | 67 |
| 12 | fork | 12A `heron_shadow` / 12E `glitch_eye` | 475 | 7 | — | pick 9; Meeting toy Bronze | 75 |
| 13 | jar | `br_jar_mites` | 500 | 7 | — | the Silver jar pops (floor 3) | 91 |
| 14 | ♥ | `heart_two_pads` | 554 | 8 | III/IV/III | pick 10 | 98 |
| 15 | rule ♦ | 15B `fog_stair`, **hidden clear** | 666 | 9 | IV/IV/III | pick 11; `[ NOTED ]`; a Silver jar; secret quest done → a Gold jar | 106 |
| L3 | Landing | — | 666 | 9 | — | lineup ×5; stall −45 | 165 → 120 |
| 16 | gold | `br_gold` | 816 | **10** | IV/IV/IV | **Legendary pick** (pick 12); the Gold jar pops | 150 |
| 17 | fork | 17C `sp_tongue_tether` / 17E | 885 | 10 | — | pick 13; Duo offered | 165 |
| 18 | Rematch | `snake_coil` at its old numbers | 947 | 10 | — | pick 14; slots full, so upgrades; a Silver jar | 174 |
| 19 | breather | `br_sleeping_toad` | 978 | 10 | — | the Silver jar on its back | 192 |
| 20 | Warden | `warden_the_jar` | 1,108 | 10 | — | Party Rank Up | 227 |
| — | results | lineup | — | — | — | — | **242** |

**Totals:** 14 Boon events, 9 levels, 1 Legendary, 1 Duo, 1 hidden clear, 1 class. Wish Coins: gross ≈ 347, held ≈ 242, so **161 Pearls** before new pages. A plain climb (no hidden clear, no quest, no toad jar, same spending) holds ≈ 192 coins: **136 Pearls** (§13).

### 5.3 Difficulty and stress variants (first-climb door list)

| Case | Lv5 at door | Lv7 at door | Lv10 at door | Verdict |
|---|---|---|---|---|
| **Normal, median** (DEC §5) | 7 | 10 (Keeper) | **18** | the target |
| Normal, gold door forced at 19 | 7 | 11 | 19 | inside the CI window |
| Normal, gold at 19 + 2 failed rooms | 8 | 12 | 19 | Crown glow still arrives before the Warden |
| Normal, 2 hidden clears (doors 8, 12) | 7 | 9 | 17 | inside the window |
| **Hard ×1.5** | 5 | 9 | **13** | intended: more doors at Crown glow (plan_1 §4); §2.4 keeps it ticking |
| **Hell ×2** | 4 | 8 | **10** | the Hell fantasy: a blazing frog in redacted rooms; §2.4 keeps it ticking |

### 5.4 The growth CI test [A]

An EditMode test, `GrowthCurveTests`, reads `Yields.json`, `GlowCurve.json` and `ClimbTemplate_W1.json` (the authored first climb) and simulates the median first climb (Normal, no hidden clears, typical path). **The build fails if** (DEC §5):
- Lv5 lands outside doors **6–8**;
- Lv10 lands outside doors **17–19**;
- the pond does not give exactly Lv2;
- the Keeper clear does not reach Lv7;
- the stress case "gold forced at 19 + 2 failed rooms" does not reach Lv10 by door 20.

It also fails if any door's yield formula references Glow Level, Tower Rank, class or a cosmetic (law 4, §1).

---

## 6. Boons: the build

### 6.1 When Boons arrive [A; the full pool is B]

| Situation | What happens | Screen? |
|---|---|---|
| **First climb, doors 2–9** | **Auto-granted** by the authored grant plan below (DEC §5; FO §3.5) | none: a 1.2 s bead flies onto the neck with a System line |
| **First climb, Keeper Landing** | `[ CHOICE UNLOCKED ] The Tower will let you choose now.` The first pick 1 of 3: **2 upgrades** of Boons you own + **1 new Boon** from a family you don't hold (so it asks what to replace) | the one full-screen card of that door (DEC §5) |
| **After that, and from door 2 of every later climb** | A private **pick 1 of 3** after every rule door, set piece, Heart door, fork room (E doors included), Rematch door and the Keeper (FO §4.1) | an 8 s overlay in the bottom third; you keep moving |
| **Gold door** | A Legendary pick (§6.2) | overlay |
| Breathers, toy doors, the Warden | no Boon (they pay fireflies, coins and jars) | — |

**The first climb's grant plan** (`ClimbTemplate_W1.json`; the CI test checks slot 4 is free at door 9):

| Door | Grant | Rule |
|---|---|---|
| 2 | **Shatter Croak** | fixed: `[ BOON ] Shatter Croak. Because: you froze while it looked.` |
| 3 | new | a Common from the door's suit family, matching your most-used verb |
| 5 | new | same rule |
| 7 | upgrade | your lowest-rank Boon of the door's family (else your lowest overall) goes up a rank |
| 8 | upgrade | same rule |
| 9 | **Moon Hop** | fixed Legendary; fills passive slot 4. The odds page says "First climb: one guaranteed gold door" (DEC §8.2 #2) |

**The plaque's prize icon changes the Boon** (`05` draws the plaque; this is what the icon pays):
- **Boon prize:** the Boon from this door arrives **one rank higher**: a new Boon at II, an upgrade +2. Capped at III. Its door usually carries more skulls: "I chose the prize and the risk" (FO §6.1).
- **Jar prize:** the normal Boon, plus a **Silver jar** (§10.2).
- **Key prize** (fork rooms): the Meeting key, plus the normal Boon.

**The offer** (FO §4.1):
- **3 choices: 2 from the door's suit family, 1 wildcard** from any family. **No filler, ever.**
  - Suit → family: ♠ → Body, ♦ → Sight, ♣ → Chorus, ♥ → Risk.
  - Set pieces use their suit (`sp_grip_wall` ♠, `sp_tongue_tether` ♣). The Keeper draws from any family. A Rematch uses the room's suit.
  - **E doors:** 3 Rare-or-better choices from any family (FO §3.3).
- **Rarity of a new Boon:** Common 70%, Rare 30%. E doors: Rare 100%. Milestone A has Commons only.
- **Upgrades.** A Boon you own appears as an upgrade ("Spring Legs II"), with weight ×1.5. A Boon at III never appears. Duplicates never roll rarity.
- **Duo:** while you are Knotted and eligible (§6.5), the wildcard becomes a Duo. It is **guaranteed on the first eligible pick after the Knot forms**, then 35% per pick.
- **Legendary** (gold doors only): 3 Legendaries you don't own, drawn from the seed (all of them if 3 or fewer remain). If fewer than 3 remain, the rest are upgrades.
- **Extra choices:**
  - **comeback:** the human with the lowest Glow Level sees **4 choices** until they draw level with the next-lowest human (FO §4.1). Friends lobbies name it: `[ UNDERDOG ] The Tower loves a comeback.` Public lobbies keep it private.
  - **Vengeance:** +1 choice on the victim's next pick, once per climb (`03`).
  - Maximum 5 choices.

**Picking.**
- **8 s, simultaneous, private.** Nobody waits on a pick order (FO §4.1).
- Walking through the next door, or the timeout, takes the **highlighted** choice. The System highlights an upgrade to your most-used Boon, else the choice matching your most-used verb.
- **Slots: 4 passive + 1 Power** (FO §4.1). When the matching slot is full, a new Boon asks which to replace, inline on the same overlay (+4 s). The replaced Boon shatters into **+5 Wish Coins per rank**: `[ SHATTERED ] Stomp II. +10 coins.`
- **Rerolls.** A reroll redraws every choice once, never repeating the ones just shown. At most 2 rerolls per pick; hold at most 3. Sources:

  | Source | Rerolls |
  |---|---|
  | Tower Rank E talent | +1 per climb |
  | Party Rank Up at the Keeper | +1 each |
  | Gold jar | +1 |
  | Stall | 25 coins each |

- **Party Rank Up** plays at the Keeper and the Warden only (FO §4.1): a shared fanfare, every frog's glow pulses, **+1 reroll each** at the Keeper and **+10 Wish Coins each** at the Warden (no picks remain after it).
- **Seeding and secrecy** (FO §4.1, §5.4): each offer is drawn from `SplitMix64(hostSalt, playerId, climbSeed, doorIndex, pickIndex, rerollIndex)`. The salt is host-only and never replicated. Offers go only to their owner (a targeted ClientRpc). The host rejects any pick whose id was not in that player's offer.
- **Rivals** draw from the same tables and pick by personality weights (`03`).
- **Drop-in** (FO §4.1): a human who takes a bot's seat mid-climb starts at the party's lowest human Glow Level (banked = that level's threshold), with verbs ranked in the default order, as many auto-granted Commons (rank I) as that human holds Boons, and 10 Wish Coins per floor reached.

### 6.2 The pool: 16 Boons + 4 Duos + 4 Legendaries (24)

Every Boon works in any room and is **stronger in its home suit** (CRIT #25; FO §4.1). No Boon uses card, dice or chip imagery.
- *Slot:* **P** = passive, **★** = Power (tap Power; the Power bead dims and refills as its cooldown).
- *Verb* is the tag the auto-grant matches against your most-used verb.
- *Tag* is the milestone.

**Body (♠), amber `#FFB347`**

| Boon | Rarity · slot · verb | I | II | III | Home ♠ | Tag |
|---|---|---|---|---|---|---|
| **Shatter Croak** | Common · P · Croak | Your croak shatters pots and pops mites within its radius | +1 m radius; the burst also knocks mites 2 m back | shards stagger small monsters in the radius for 1 s | the radius covers the whole room | A (door-2 gift) |
| **Spring Legs** | Common · P · Hop | A charged-hop landing bounces you again at 60% of its height | the landing also leaves a 1 m bounce pad for 3 s that any frog can use | the rebound is a full charged hop | rebound +0.5 m | A |
| **Stomp** | Rare · ★ · Hop | Slam straight down from any height; the landing pops mites and pots within 2 m. Cooldown 5 s | 3 m | also staggers small monsters for 1 s | cooldown 3 s | B |
| **Sticky Pads** | Rare · P · Hop | Touch a wall mid-hop to cling for 2 s; hop off it to wall-jump 1.4 m | cling 3 s; set-piece grip drains 30% slower (FO) | wall-jump 1.9 m; clinging on moss costs no grip | cling +1 s | B |

**Sight (♦), cyan `#6FE3FF`**

| Boon | Rarity · slot · verb | I | II | III | Home ♦ | Tag |
|---|---|---|---|---|---|---|
| **Tell-Sight** | Common · P · any | Monster cues reach you 1 s early: a ghost flash of the tell and its sound. The danger itself is unchanged | also for your Knot partner | also for every frog within 8 m | +0.5 s | A |
| **Third Eye** | Rare · ★ · any | 6 s of seeing the room's hidden-clear glyphs (gold chalk). Cooldown 20 s | also shows the room's 2 Twists (which bells are live, which tiles are safe) | shared with frogs within 8 m | 9 s | B |
| **Firefly Sense** | Rare · P · Tongue | Firefly clouds, pots and jars show through walls within 15 m | 25 m, and mites too | on entry, a count line: `[ 3 CLOUDS · 5 POTS ]`; an unvisited door's plaque shows ✦ if you haven't stamped its hidden clear | +10 m | B |
| **Sure Tongue** | Common · P · Tongue | The tongue snaps to levers, keys, bells and anchors inside a 15° cone; +1 m range | +1.5 m; 25° cone | +2 m; a missed lash retracts 50% faster | cone +10° | A |

**Chorus (♣), green `#7CF29A`**

| Boon | Rarity · slot · verb | I | II | III | Home ♣ | Tag |
|---|---|---|---|---|---|---|
| **Chorus** | Common · P · Croak | When you and at least 1 other frog croak within 0.3 s, monsters in range stagger for 2 s | window 0.5 s | the synced croak also rings every bell within 6 m | stagger 3 s | A |
| **Leapfrog** | Rare · P · Hop | Hopping off a teammate's head launches you 3 m up; they feel nothing | 4 m | 5 m, and you can chain 2 heads without touching down | +1 m | B |
| **Lifeline** | Common · P · Tongue | Tongue-catching a falling or knocked-back frog heals them 1 spot, once per door | twice per door | also revives a Dark frog: tongue its egg for 1 s from up to 4 m | +1 use per door | A |
| **Shared Glow** | Rare · P · Croak | Frogs within 6 m when you bank get +10% of your bank, none of it taken from yours | +15% within 8 m | +20% within 10 m | +5% | B |

**Risk (♥), violet `#C58CFF`**

| Boon | Rarity · slot · verb | I | II | III | Home ♥ | Tag |
|---|---|---|---|---|---|---|
| **Deep Cheeks** | Common · P · Tongue | Clear a door without being hit: your loose fireflies bank ×1.25 | ×1.5 | ×1.75 | shoves don't count as hits | A |
| **Bold Belly** | Rare · P · Tongue | Your loose fireflies bank ×2, but a hit spills **all** your unbanked fireflies | ×2.25 | ×2.5 | ×3 in Heart doors | B |
| **Quick Tongue** | Rare · P · Tongue | Lash and retract 20% faster | 30% | 40% | in Heart doors, snatch spilled clumps from 5 m further (FO) | B |
| **Last Gulp** | Common · P · any | Once per door, a hit that would take your last spot swallows your unbanked fireflies instead; 1 s invulnerable | 1.5 s, plus a 2 m shockwave that pops mites | twice per door | 2 s invulnerable | A |

**Legendary (gold doors only), gold `#FFD700` with a sparkle.** Single rank; never offered once owned.

| Boon | Slot | Effect | Tag |
|---|---|---|---|
| **Moon Hop** | P | Two extra mid-air hops (a triple hop; four with Air Hop). Every landing sends out a 3 m shockwave that pops mites and pots and knocks props ≤ 20 kg; small monsters stagger 0.5 s | A (seeded at door 9 in the first climb) |
| **Frog Choir** | P | When 3+ frogs, you among them, croak within 0.3 s, every frog within 10 m is launched 4 m straight up. Cooldown 8 s. The launch counts as a hop | B |
| **Time Gulp** | ★ | Once per door, swallow the room clock: +20 s on its timer. A room gains at most +40 s from all frogs | A |
| **Lucky Belly** | P | Gold-door chance ×2 for the rest of the climb (5% → 10%; never stacks between frogs), and the jars you earn (not room jars) open one grade higher (Bronze → Silver → Gold; a Gold jar adds +10 coins) | B |

**Duo (only while Knotted), a two-tone bead in both families' colours.** Single rank. Offered only when you hold a Boon from one of its families and your Knot partner holds one from the other (FO §4.1).

| Duo | Families | Slot | Effect | Tag |
|---|---|---|---|---|
| **Frog Sling** | Body + Chorus | ★ | Tap Power while your Knot partner is airborne within 8 m: tongue-grab them and launch them 12 m along your aim. Cooldown 6 s. Outside Heart doors the landing point is ledge-guarded (never over a drop), and the partner can hold on with the Tongue to cancel | B |
| **Lookout** | Body + Sight | P | While one of you stands on the other's head, both of you see Third Eye I glyphs and get Tell-Sight I | B |
| **Duet** | Chorus + Sight | P | Your croak and your partner's within 0.3 s ring every bell in the room | B |
| **Double or Nothing** | Risk + any | P | If neither of you is hit in a door, both of you bank ×1.5 of that door's fireflies | B |

- A Duo works for both partners while they stay Knotted, whichever of them holds it. The exception is Frog Sling, where the holder slings the partner.
- The second partner is never offered a Duo the first already holds.
- **Cutting the Knot breaks the Duo until the next Landing** (FO §4.1). It sleeps in its slot, dimmed, and wakes on a new Knot.

**Milestone A pool** (DEC §7): Shatter Croak, Spring Legs, Tell-Sight, Sure Tongue, Chorus, Lifeline, Deep Cheeks and Last Gulp, plus Moon Hop and Time Gulp. That is 8 Commons + 2 Legendaries; it has no Power Boon except Time Gulp. **Milestone B** adds the 8 Rares, Frog Choir, Lucky Belly and the 4 Duos.

### 6.3 Stacking rules [A]

1. **One copy per Boon.** A duplicate is an upgrade I → II → III. A rank's numbers **replace** the lower rank's; they don't add.
2. **Distances and durations from different sources add.** Tongue IV (8 m) + Sure Tongue III (+2 m) = 10 m.
3. **Firefly multipliers multiply,** in this order: difficulty × Sealed × hidden clear × Boon multipliers.
   - Boon multipliers (Deep Cheeks, Bold Belly, Double or Nothing) are **capped at ×3.0 combined** per door.
   - Difficulty, Sealed, the hidden clear and the gold door sit outside the cap.
4. **Shared Glow:** a frog receives at most **+30%** from all Shared Glow sources together.
5. **Staggers never clear a room and never kill.** A rule monster that has just recovered from a stagger is **immune for 4 s**, so stagger-locking can't replace its rule.
6. **Once-per-door** effects reset at the next door; **once-per-climb** effects reset at the hatch.
7. **Fairness ceilings beat everything** (FO §5.4). Any effect that moves another frog obeys the tug cap: at most 1 m, and never toward a drop outside Heart doors. Nothing touches spots, hitbox, base speed or shove.
8. **Gold-door chance:** base 5%; Rank B talent 7% (the host's, §8.2); Lucky Belly ×2 (14% at most). The odds page shows the lobby's current number.

### 6.4 Synergies (named, data-driven)

`Synergies.json` lists every pair. When a choice synergizes with a Boon you hold, the overlay shows a link icon: `↔ Moon Hop`. When it clashes, it shows `⚠ Eats your Bold Belly`. The System never hides a clash.

| Pair | What happens | Why it's fun |
|---|---|---|
| Moon Hop + Stomp | Each Moon Hop landing counts as a Stomp (+1 m radius); Stomp's cooldown resets on the third landing | a triple-slam room clear, the trailer shot |
| Moon Hop + Spring Legs | The last Moon Hop landing rebounds | endless bouncing |
| Spring Legs + Leapfrog | Bouncing off a head counts as a charged landing, so it rebounds | the frog trampoline |
| Leapfrog + Frog Sling | A slung partner who lands on a frog's head gets the Leapfrog launch | combo clips |
| Shatter Croak + Chorus | A synced croak shatters pots within 1.5× the radius for each participant holding Shatter Croak | the coin shower |
| Chorus + Frog Choir | The Choir launch also counts as a Chorus stagger | — |
| Tell-Sight + Third Eye | While Third Eye is active, Tell-Sight warns 1 s earlier still | the "I saw it coming" frog |
| Sure Tongue + Lifeline | The snap cone includes falling frogs | easier heroic saves |
| Sticky Pads + Frog Sling | A slung partner clings to whatever wall they hit | wall shots |
| Firefly Sense + Lucky Belly | Gold-door plaques glint one door ahead | anticipation |
| Deep Cheeks + Bold Belly | They multiply (×2.5 at I/I, up to the ×3.0 cap); the overlay marks it "Risky pair" | greed with a visible cost |
| **Clash:** Last Gulp + Bold Belly | Last Gulp swallows your big Bold Belly cheeks | a readable, funny loss |
| **Class:** Echo Toad + Chorus | The Replay echo counts as a second frog for Chorus timing | solo Chorus |
| **Class:** Bullfrog + Shatter Croak | Belly Boom shatters pots in its 8 m | — |
| **Class:** Lily Walker + Spring Legs | Pad Drop pads are bouncy | — |

### 6.5 Duo and team synergies [B]

Team play is where the power fantasy is shared. The research's warning is that with 8 players, one player's cider is seven players' goguma (RR), so team-level payoffs are built in:
- **Party Rank Up** at the Keeper and Warden: one fanfare for everyone (§6.1).
- **Knot perks** (`03`): see each other through walls, revive twice as fast, Duo eligibility.
  - In solo, a Rival offers the Knot at Landing 3 (DEC §5), so Duos exist for solo players too.
- **Shared-power Boons:** Tell-Sight III, Third Eye III, Lifeline, Shared Glow, Chorus, Frog Choir and Duet only pay off with other frogs nearby.
- **Pots pay everyone** (§4), and the clear bonus is split equally, ghosts included (§2.1).
- **In solo, Rivals croak on your count** (`03`), so Chorus-family Boons work without friends.

### 6.6 Showing the build on the body [A]

- **Boon beads** (`02` §5.4 owns the look): a string of beads on the Neck socket, one 0.03 m bead per passive Boon (up to 4) plus a larger bead for the Power Boon, in the family colours of §6.2. An upgrade adds 1 or 2 rings to its bead. Legendary beads sparkle; a Duo bead is two-toned. The socket never moves between molts, so the build reads the same in every layer.
- **Cooldowns:** the Power bead dims and refills clockwise.
- All bead colours sit at least 15° of hue from the betrayal crimson (`09`; DEC §2).
- **The pick overlay** shows, for each choice: family colour, name, rank pips, a one-line effect (≤ 12 words), a synergy or clash icon, and a ribbon: NEW, UPGRADE, DUO or LEGENDARY. An 8 s timer bar and the reroll button (with its charges) sit under it.
- Every gain gets a one-line System window naming the change and its cause (FO §6.2 #4).

---

## 7. Classes and secret quests: everyone is special differently [B]

### 7.1 Rules

- **Classes are sidegrades** (FO §4.2). None changes spots, speed, hitbox or shove. Anything a Signature does to another frog obeys the tug cap (FO §5.4).
- **The Signature** is the Power button's **hold** (0.4 s). A tap still uses your Power Boon.
- **The first climb has no classes:** everyone is a plain frog, and holding Power does nothing (DEC §8.2 #10).
- **From climb 2** you choose a class at the hub before hatching: the egg shows its markings (`07`). The default is the plain frog. Any unlocked class can be chosen.
- **A secret quest completed mid-climb changes your class at once** for the rest of that climb, whatever you started as (FO §4.2).
- **Class markings** are body patterns in the class's colour. They are earned-only cosmetics (`08`) and do nothing.

### 7.2 The 9 classes

| Class | Unlock | Signature (hold Power) | Numbers | Cooldown | Markings |
|---|---|---|---|---|---|
| **Tree Frog** | open | **Glide Leap**: hold in the air to glide | 1.5 s; fall speed 1.2 m/s; +2 m/s forward | 12 s | green with white side stripes |
| **Bullfrog** | open | **Belly Boom**: a huge croak | 8 m; knocks mites and props ≤ 20 kg back 3 m; monsters stagger 1 s; frogs are pushed ≤ 1 m, never toward a drop | 20 s | olive with a gold throat |
| **Dart Frog** | open | **Dart Tongue**: one long lash (grab, grapple or catch) | 10 m | 15 s | electric blue with black dots |
| **Mime Frog** | secret quest | **Decoy**: leaves a croaking copy where you stand | lasts 5 s; noise and sight monsters target it first; it never counts for a clear | 25 s | white face, black stripes |
| **Echo Toad** | secret quest | **Replay**: your next croak repeats 2 s later where you stood | full effect (bells, stagger); counts as another frog for Chorus timing | 18 s | concentric rings on the back |
| **Horned Frog** | secret quest | **Spit Out**: when swallowed, burst out at once with no spot lost; otherwise a short horn charge | escape once per door, launching 6 m; the charge is a 4 m dash that breaks pots | 20 s (charge) | orange horns over the eyes |
| **Glass Frog** | secret quest | **See-Through**: walls within range turn transparent (you see bodies, props, monsters) | 3 s; 10 m | 25 s | a translucent belly with a visible glowing heart |
| **Lily Walker** | secret quest | **Pad Drop**: place a lily pad in mid-air under you | 1.2 m wide; holds 2 frogs; lasts 4 s | 15 s | leaf-vein pattern |
| **Bell-Eater** | secret quest | **Swallow**: hold Power to keep the next projectile your tongue touches; release to spit it | stores 1 for up to 8 s; spit range 12 m | 20 s | brass-coloured belly bands |

### 7.3 The 6 secret quests: odd conditions, exact detection

Each quest must be **self-contained**: no other player can cause or block it, so friends can't farm it (FO §4.2). `QuestTests` enforce this by checking that every predicate reads only events whose actor is the quest's owner, or a monster or room, never another frog.

| Class | The quest line (shown privately) | Exact detection | Feasibility tag (host checks the seeded climb) |
|---|---|---|---|
| **Mime Frog** | "Clear a ♦ door without croaking once." | You entered at the door's start and were inside at the clear. Zero Croak inputs from you (tap, hold, sustain or revive) in between. You are not Dark at the clear. | ≥ 2 ♦ rule doors remain |
| **Echo Toad** | "Ring 3 bells with one croak." | One Croak pulse from you makes ≥ 3 bells ring within 0.2 s. Only your own pulse counts: an `EchoSpot` such as the golem's gold circle is the usual way (`05`); rings from a Chorus or Duet sync don't count, because another frog took part. | ≥ 2 remaining rooms have an `EchoSpot` reaching ≥ 3 bells (`echoSpotBells ≥ 3`) |
| **Horned Frog** | "Be swallowed. Leave with every spot." | You enter the `Swallowed` state at full spots and leave it (spat out or escaped) still at full spots, and not Dark. | ≥ 2 remaining rooms flag `canSwallow` |
| **Glass Frog** | "Clear 3 rule doors in a row without a single hit." | 3 consecutive rule or E doors, each cleared (not failed) with 0 spot losses by you. Breathers between them don't break the streak; a Heart door neither breaks nor counts. | ≥ 4 rule or E doors remain |
| **Lily Walker** | "Clear a room without touching its floor." | From entry + 2 s until the clear, your feet never touch a collider tagged `Floor` (water and raft decks count as floor; pads, props, walls, bells and frogs' heads don't). Rule doors and set pieces only. | ≥ 2 remaining rooms flag `floorlessPossible` |
| **Bell-Eater** | "Spit 3 monster projectiles back." | 3 projectiles caught by your tongue and spat back within this climb. It needs Long Tongue (Tongue III), which Normal reaches by Lv7. | ≥ 3 projectile events possible in the remaining doors (`hasProjectiles`) |

**Assignment** (host, at door 13 in the first climb and door 6 in later climbs; DEC §5):
1. Candidates are the player's **locked** secret classes, filtered by feasibility.
2. **Humans first:** no two humans in the lobby share a quest (DEC §8.2 #24).
3. Rivals draw next. Rivals may share when seats exceed the 6 classes.
4. The draw is seeded with the host-only salt.
5. If no candidate is feasible, the host re-checks at each later door.
6. A player who has unlocked all 6 gets no quest. [LATER: a "gold markings" quest for the class they play.]

**Presentation.**
- On assignment, privately: `[ HIDDEN CONDITION DETECTED ] Clear a ♦ door without croaking once.` It is a banner, never a full-screen card (FO §4.2).
- Holding the Wheel shows the quest line and its progress pips (`Spit back 1/3`).
- **On completion:**
  - privately: `[ CLASS UNLOCKED ] MIME FROG. Because: you cleared Fog Stair without a single croak.` The line quotes the exact odd deed (kr_power_fantasy);
  - to the lobby, a banner: `Pip's frog changed: MIME FROG`;
  - the markings wash over your body in 0.8 s, the Signature is live at once, and the Rivals bark: "Wait. Pip was a *Mime Frog* this whole time?";
  - a Steam Timeline featured marker and a Steam achievement;
  - a **Gold jar** (opens at the next Landing or the results);
  - **+10 RP**, first time only (§8.1).
- **The rarity line** is the real Steam global unlock percentage once Steam has data (`GetAchievementAchievedPercent`). Until then, and always on LAN, it reads "first in this lobby" or "3rd unlock on this save". **Never an invented number** (FO §4.2).
- **An unfinished quest ends with the climb.** Progress doesn't carry over; a new quest is drawn next climb.
- **Rivals** complete quests only on the climbs where the Drama Director allows it (half the human rate, FO §5.3). Their badge says so. A Rival's class is saved in the Rival Register, so Maud can later show up as a Glass Frog.

**Pacing check.** One quest per climb, with about 50% completion (greybox target), unlocks all 6 secret classes in roughly 12–15 climbs.

**[LATER] quest ideas** that pass the self-contained test: "Stay inside the Sleeping Toad's room for 20 s without waking it" (a Sleeper class); "Carry the egg across Snapper Crossing without it cracking" (a Nurse Frog class). Rejected forever: anything that counts betrayals or needs another frog's action ("be betrayed three times" is farmable).

---

## 8. Tower Rank and talents: the headline meta track

### 8.1 Rank Points (RP) [A]

RP are **paid on failure too** (FO §4.3). They bank at every Landing and at the results. Only humans earn RP, each for themselves.

| Source | RP | Notes |
|---|---|---|
| Each door reached | +2 | every door number you enter, 1–20 |
| Keeper cleared | +10 | — |
| Warden cleared | +25 | — |
| Each hidden clear | +5 | not when "cleared with help" |
| Each **new** Bestiary page | +5 | first time a monster is Seen, lifetime |
| Class unlocked | +10 | first time only |
| Difficulty | Hard ×1.5, Hell ×2 | applied to the climb's total |
| Well-Rested | ×2 | §10.6 |

**Death rewards are first-time-only** (new pages, class unlocks), so dying on purpose earns nothing (FO §4.4).

### 8.2 Ranks and talents

The talents are RR's "small permanent talent tree": **eight lanterns on one strand**, one per rank. They are granted automatically, each can be switched off, and all together they are worth about **one room of head start** (FO §4.3).

| Rank | Total RP | Also needs | ≈ climbs (§13) | Talent (exact) | Scope | Tag |
|---|---|---|---|---|---|---|
| **F** | 0 | — | — | — | — | A |
| **E** | 20 | — | 1 (the first Keeper) | **+1 Boon reroll** each climb, credited at your first pick | personal | A |
| **D** | 100 | — | 1–2 | **Start with a Common Boon of your choice**: at the hub before hatching, choose 1 of the 8 Commons (the full list, not a random 3). It fills passive slot 1 at rank I | personal | A |
| **C** | 250 | — | 3 | **See one door ahead**: your plaques also show the next pair's prize icons as a faint second row | personal (display only) | A |
| **B** | 500 | — | 7 | **Gold-door chance 5% → 7%** | lobby: the host's talent | B |
| **A** | 900 | — | 12–13 | **First-visit hint**: on a first visit to a room whose hidden clear you haven't stamped, one hint line after 30 s (`[ HINT ] The gold circle hears everything.`; `05` writes one per room) | personal | B |
| **S** | 1,400 | **surfaced the Well** ("S means you climbed out") | 19–22 | **One free stall item** per climb (any item; the Gold Key counts) | personal | B |
| **SS** | 2,200 | surfaced the Sky | 30–35 | **Carry one Boon** into your next climb: at the results, mark one; it starts the next climb at rank I | personal | LATER |
| **SSS** | 3,300 | surfaced Space | 46–54 | **Rematch doors twice per climb**, plus the earned-only **Moon Crown** cosmetic (`08`) | lobby: the host's | LATER |

**Talent rules** (FO §4.3, §5.4):
- **No talent ever touches** spots, speed, hitbox, shove, tug strength, or anything that reaches another player.
- **Rank Sync** switches every talent off for everyone. It is on by default in public lobbies, a host option in friends and private lobbies, and off in solo.
- Lobby talents (B, SSS) use the host's. Under Rank Sync they are off.
- **Rank never gates a mode.** Difficulty unlocks are per lobby (§11.1).

**The talent strand** (the UI; `07` places it): 8 lanterns up a stone strand on the hub wall, next to the ring map.
- A lit lantern is an earned talent. Tapping it switches that talent off, and the lantern dims.
- The next lantern shows its talent greyed, with a deterministic bar: `Rank D: 64%`.

### 8.3 The rank-up ceremony [A to C; B to S]

A rank-up plays **only at the Keeper Landing ceremony or at the results**, never mid-room. The first one, F → E, is step 3 of the first Keeper Landing ceremony (DEC §5).

| Beat | Time | What happens |
|---|---|---|
| 1 | ~1.5 s | The Rank bar fills with a rising count-up. It is the **last meter** of the results (goal gradient, FO §4.4) |
| 2 | 0.5 s | At 100% the bar bursts into fireflies: 120 ms hitstop, Cinemachine Impulse, and the new letter plate stamps down: `[ TOWER RANK: D ]` |
| 3 | 2 s | The talent line: `Talent: start each climb with a Common Boon of your choice.` The strand's next lantern lights |
| 4 | 1 s | Two Rivals bark: "An E-rank? Still adorable." / "D already? Who *is* this frog?" / at S: "S means you climbed *out*." |
| 5 | 0.5 s | The letter flies onto your name tag |

- **Total ≤ 5.5 s**, skippable after the first time.
- **Rank S needs surfacing.** If RP ≥ 1,400 but the Well is not surfaced, the bar holds full with a lock: `Rank S: climb out of the Well.` A near-miss line is allowed here because the bar fills deterministically (FO §4.4).
- **The letter is public.** It shows on name tags in the hub, at Landings, in the lobby list and in the Rival Register, so it means something to others (kr_power_fantasy). The onlooker chorus keys off it: "An F-rank cleared a three-skull door?!" (`03`).
- **The head start is honest.** The bar is drawn with the doors you've passed stamped in; there is no gifted pre-fill (FO §4.3). E needs only 20 RP, so the first session fills it through real play.

**Letter colours:** F `#8A8F98` · E `#9BD47A` · D `#4FC3F7` · C `#6E8CFF` · B `#B07CFF` · A `#FF9F43` · S `#FFD84A` · SS `#FFF1A8` · SSS `#FFFFFF` with a 2 s prismatic shimmer.

---

## 9. The Bestiary: 14 pages [A: 9 pages; B: 14]

One page per monster (FO §4.3; DEC §8.2 #23). It replaces the room-spoiling book of the old design: it never shows a room's solution unless you found it.

### 9.1 Pages

| # | Page id | Page title (from DEC §6) | The monster | Suit | Tag |
|---|---|---|---|---|---|
| 1 | `bst_bell_golem` | The Bell-Golem | the golem (also met in the Keeper, the Rematch and Warden phase 1) | ♠ | A |
| 2 | `bst_heron_shadow` | Heron Shadow | the heron | ♠ | A |
| 3 | `bst_snake_coil` | Snake Coil | the snake | ♠ | A |
| 4 | `bst_fog_stair` | Fog Stair | the eel | ♦ | A |
| 5 | `bst_echo_warren` | Echo Warren | the thing that hunts your last croak | ♦ | A |
| 6 | `bst_moss_snail` | The Moss Snail | the snail | ♦ | B (climb-2 debut) |
| 7 | `bst_lily_raft` | Lily Raft | the pike | ♣ | A |
| 8 | `bst_snapper_crossing` | Snapper Crossing | the snapper | ♣ | A |
| 9 | `bst_lamp_knight` | The Lamp-Knight | the knight | ♣ | A |
| 10 | `bst_web_spider` | The Web Spider | the spider | ♣ | B (climb-2 debut) |
| 11 | `bst_slime_foundry` | Slime Foundry | the Chrono-Slime | E | B |
| 12 | `bst_glitch_eye` | The Glitch Eye | the eye | E | B |
| 13 | `bst_keeper_bell_raft` | The Keeper: Bell on the Raft | the Keeper | — | A |
| 14 | `bst_warden_the_jar` | The Warden: The Jar | the Warden | — | B |

`05` writes each page's rule line, death tip and hidden-clear line, and names the monsters.

**Heart doors have no page** (DEC §6 counts 14: 12 rule monsters + Keeper + Warden). Their co-op answer counts as the room's hidden clear (`03` H2) and pays its fireflies ×2, +5 RP and a Silver jar, but there is no page to stamp.

### 9.2 Stamps

| Stamp | Earned when |
|---|---|
| **Seen** | You enter a room with this monster, or face it inside the Keeper, a Rematch or the Warden. The first Seen makes it a **new page**: +5 RP, +20 Pearls |
| **Survived** | You are inside when the door ends (clear or fail) and you are not Dark |
| **Cleared** | The room is cleared while you are inside, ghosts included |
| **Hidden clear** | The room is cleared by its hidden clear while you are inside (not "cleared with help"). Pays +5 RP and a Silver jar every time; the stamp itself is once |

- **Stamps land one at a time in the results** (§12), each with a 0.4 s ink-stamp thump.
- **Rivals** keep their own stamps in the Rival Register (`03`). They drive barks ("I've *seen* this one") and nothing else.

### 9.3 Death tips, the chase line and hats

- **Death tip.** Your **first time going Dark** to a monster fills a warm tip on its page, which highlights the rule clause you broke. Each RoomDef rule clause carries a cause tag, and the death event names it. On your next visit to that room the clause glows gold for 3 s when the rule text appears (the DOORS Guiding Light pattern; FO §4.3).
- **The chase line.** Until stamped, the page reads `Hidden clear: ???`. Rank A's talent adds a hint line (§8.2). Once stamped, the page shows the clear as a sketch.
- **Page extras:** a toon render of the monster (captured from its prefab at build time), your best clear time (the Rematch plaque reads it), and Sealed and Hell clear badges.
- **Hats.** Every **4 pages with the Cleared stamp** unlock a hat: at 4, 8 and 12. These are the Bestiary hat set, earned-only (`08`). The first usually arrives in the first climb.
- **Where it lives:** a book at the hub (`07`) and in the pause menu. The pause version hides the page of the room you are in until you leave it, so it never spoils a live room.

---

## 10. Currencies: one in-climb, one meta, one paid (and no paid currency)

**Currency budget: two** (FO §4.3). **Wish Coins** are earned and spent inside a climb. **Pearls** are the only meta currency and buy earned cosmetics. Fireflies are XP, not money. The only real-money purchases are **Supporter Sets**, sold as Steam cosmetic DLC at a direct price: there is **no paid currency of any kind** (FO §8.2; DEC §8.2 #20).

### 10.1 Wish Coins (in-climb) [A]

**Faucets, per frog, Normal** (they don't scale with difficulty; §11.1):

| Source | Coins |
|---|---|
| **Clear coins** (every frog inside, ghosts included; a failed room pays 50%) | breathers of every kind: **1** · rule, Heart and Rematch doors: **2 + floor** (3 / 4 / 5 / 6) · E doors: **2 × (2 + floor)** (6 / 8 / 10 / 12) · set pieces: **4 + floor** (5–8) · gold door: **10** · Keeper: **12** · Warden: **20** |
| **Pots** | **1 per pot, to every frog in the room.** Target counts (±1, placed by `05`): rule 3 · jar breather 5 · breather 2 · window 1 · sleeping threat 2 · Heart 2 · E 3 · set piece 2 · Keeper 3 · Rematch 3 · toy, gold and Warden 0 |
| **Jars** (room and earned) | Bronze 5 · Silver 10 · Gold 20 (+1 reroll) (§10.2) |
| **The Mouth's rain** at each Landing | Landing 1: **4** · Landing 2: **8** · Landing 3: **12**. Coins fall through the Mouth; each one you tongue-catch before it lands is +1, up to +2. The wider the Mouth, the more falls |
| Party Rank Up at the Warden | +10 |
| Crown sparks after Lv10 | +5 each, at most 6 (§2.4) |
| A shattered Boon | +5 per rank (§6.1) |

**Rules:**
- **Coins go straight into your purse.** They are never unbanked, never spilled, never stolen and never at risk, even in Heart doors. Betrayal moves only unbanked fireflies (FO §5.4).
- **Coins live for one climb.** At the end of the climb, or when you **Rest** at a Landing, the coins you hold convert to Pearls (§10.4): `[ RESTING ] 142 Wish Coins → 71 Pearls. Your climb is saved at DOOR 10.` A resumed climb starts with 0 coins, so nothing is counted twice.
- **Rivals have purses** and visibly shop at the stall. Their coins convert to nothing.

### 10.2 Jars: in the room, and in the lineup [A]

The jackpot feel lives only in earned play (FO §8.2). There are two ways to get a jar, and both use the same three grades with **fixed contents**:

| Jar | Colour | Holds |
|---|---|---|
| **Bronze** | `#C8803A` | 5 Wish Coins |
| **Silver** | `#C9D3DC` | 10 Wish Coins |
| **Gold** | `#FFD700` | 20 Wish Coins + 1 reroll |

**Room jars** are `05`'s physical `Jar` kit piece. You open them in the room with a tongue, stomp or croak, and their coins go at once to **every frog in the room**, ghosts included. They also spill part of the room's loose fireflies (inside the room's loose budget, never extra).

| Room jar | Grade |
|---|---|
| `br_shove_door`, `br_window` | Bronze |
| `br_jar_mites` | Bronze on floors 1–2, Silver on floors 3–4 (`05`) |
| `br_sleeping_toad` | Silver, on the toad's back: a Hop IV or Long Tongue dare |
| `br_gold` | Gold, on the plinth; its 3-frog lid also opens the Legendary pick (`05`) |

**Earned jars** are not physical. They drop into your pouch icon and open in the **lineup** at the next Landing, the DCC safe-room ritual (RR):

| Earned by | Jar |
|---|---|
| A rule door with the jar prize icon | Silver |
| A toy door | Bronze each; **Silver** to the winner or winning team |
| Playing the Landing toy or a Meeting toy for ≥ 10 s | Bronze |
| A hidden clear | Silver |
| A Rematch door cleared faster than its old time | Silver |
| A secret quest completed | Gold |

**The lineup.** Earned jars stand on the Landing's rim, Bronze → Silver → Gold. They pop one after another, 0.4 s apart, with a rising chime, and coins arc into each frog's cheeks. Hold Tongue to skip; it takes at most 4 s. Jars still unopened when the climb ends open in the results. Lucky Belly raises every jar you earn one grade.

**Honesty rules** (published on the help page):
- no random contents, no reels, no spin-past animation;
- jars never hold cosmetics, Boons or extra fireflies, so the Glow curve and the CI test stay exact;
- the lineup is skippable (FO §8.2).

### 10.3 The stall [A]

The stall stands at **Landing 2 and Landing 3 in every climb**. In the first climb it opens at Landing 2, so there is no shopping before the Keeper (DEC §8.2 #10).
- Every player sees the same 4 items at fixed prices, all the time. There is **no rotation and no race**: each frog buys its own.
- FO §7's prices are kept.

| Item | Coins | Limit | Effect |
|---|---|---|---|
| **Heal bug** | 20 | carry 1; buy 1 per Landing | When you drop to 1 spot it eats itself: +1 spot (never above the maximum). It is a 0.1 kg prop you can tongue-pass to any frog, and it counts as the one item through a Meeting window |
| **Reroll** | 25 | 2 per Landing; hold at most 3 | +1 reroll charge (§6.1) |
| **Boon upgrade** | 60 | 1 per Landing | +1 rank to one Boon you own, your choice (not Legendaries or Duos) |
| **Gold Key** | 80 | 1 per climb | At the next door pair, tongue the key into either plaque and that door becomes a **gold door**. Not on E doors, Heart doors, the Keeper, the Warden, set pieces or Rematch doors. The party still chooses by walking |

- Rank S's talent makes one item per climb free.
- The first Landing-2 visit in the first climb also presents the free hat (`08`).
- **The spend-or-save choice** is the stall's tension: every coin spent is half a Pearl not earned. The results show it plainly as items, never as a formula.

### 10.4 Pearls (meta) [A]

**Pearls paid per climb** (FO §4.3; DEC §8.2 #17):
- **Wish Coins held ÷ 2** (rounded down),
- **+ 10 per floor reached** (a floor counts once you enter its first door: a Quick Climb reaches 2, a Full Climb 4),
- **+ 20 per new Bestiary page**,
- **+ 50 once, on the profile's first surfacing** (published),
- then **× 2 if Well-Rested** (§10.6).

The results show these as line items with icons, never as a formula.

**Earn rates.** These are published on the help page and **never cut** (FO §8.3). Values from the §5 simulations:

| Climb | Pearls |
|---|---|
| First climb, wiped at door 8 | ~155 (5 new pages pay 100) |
| First Quick Climb, resting at the Keeper | **~210** (6 new pages pay 120) |
| First Full Climb, out of the Well | **~350** (8 new pages + 50 for surfacing) |
| A later Quick Climb | 50–80 (median ~65) |
| A later Full Climb | **75–165** (median ~135; it depends on stall spending) |
| A later Full Climb, wiped at door 14 | ~80 |

**Prices** (FO §4.3; `08` assigns items to them):

| Rarity | Pearls | ≈ later Full Climbs |
|---|---|---|
| Common | 150 | ~1.2 |
| Rare | 400 | ~3 |
| Epic | 900 | ~7 |
| Legendary | 2,000 | ~15 |

- **Sinks:** only the earned cosmetic catalogue in the Mirror: 12 items in A, 24 in B (`08`). The whole catalogue can be bought at any time; "Featured" is a spotlight, not a gate (FO §8.3).
- **Pearls never buy** power, rerolls, keys, revives, jars, time or information.
- **The first purchase lands in the first session.** The first Quick Climb pays about 210 Pearls, so a Common is affordable after about 11 minutes, on top of the free Keeper hat. The earn-rate table on the help page says so honestly.

### 10.5 Paid: Supporter Sets, and the development mock [B stubs; priced at launch]

- **What:** 4-piece themed cosmetic sets (hat, skin, croak voice, tongue trail) at **$2.99–4.99, priced directly in real money** (FO §8.2). `08` owns the contents and prices.
- **How:** Steam cosmetic DLC (DEC §8.2 #20). No ISteamMicroTxn and no Steam Inventory.
- **Ownership is read behind one interface,** `IDlcOwnership`:
  - `SteamDlcOwnership` calls Facepunch.Steamworks' `SteamApps.IsDlcInstalled(appId)`;
  - `MockDlcOwnership` is for the editor and development builds only. A debug-menu toggle grants each set locally, and a permanent banner reads `MOCK DLC: no purchase happened.` It is compiled out of release builds (`#if UNITY_EDITOR || DEVELOPMENT_BUILD`), and a build test fails if it is reachable in a release player.
- **Isolation.** Paid and earned catalogues never overlap. Nothing paid changes play, odds, progress speed or information (FO §8.2). The FO §8.6 tests enforce it (§14.2).

### 10.6 Well-Rested and the break line [A]

- **The rest meter** fills with real time since your last climb ended: **1 rested climb per 36 h away, at most 2** (reached at 72 h, "about 3 days", FO §8.4).
- **A rested climb doubles its RP and Pearls.** Fireflies, coins and Boons are unchanged. It is used only by a climb that reaches door 3, so a quick quit doesn't burn it.
- **The clock** is Steam server time (`SteamUtils.SteamServerTime`) when online and the local clock on LAN. Faking it gains only cosmetics sooner and a Rank that gates nothing.
- **Display:** a small moon with 1–2 pips on your hub egg and on the results' Pearl line (`Well-Rested ×2`).
- **No streaks and no daily bonus, ever** (FO §8.4). Well-Rested rewards breaks, not attendance.
- **The break line:** after about 90 minutes of continuous play, `[ THE TOWER WILL WAIT ] Your door is saved.` It is on by default, one tap turns it off, and it never blocks input (FO §8.4).

---

## 11. Difficulty, Team Lives, failure and saving

### 11.1 Difficulty, chosen at the entrance (FO §3.6; DEC §4)

Four doors stand at the well bottom from 0:00. Hard and Hell are chained until the lobby unlocks them, and each chain tag states its real condition.

| Difficulty | Team Lives | Spots | Rules | Fireflies and RP | Unlocked by (per lobby) | Tag |
|---|---|---|---|---|---|---|
| **Easy** | unlimited | 4 (the whole lobby) | The climb ends only when every human is Dark at once | ×1 | always | A |
| **Normal** | 3 | 3 | — | ×1 | always | A |
| **Hard** | 2 | 3 | +1 skull on every plaque; rule monsters' tells 30% shorter (×0.7) | **×1.5** | anyone in the lobby has cleared a Keeper ("Clear a Keeper to unlock") | A, as a data flag (DEC §8.2 #26) |
| **Hell** | 1 | 3 | Rule text is **always redacted**: decode it yourself (TTITH); tells ×0.7 | **×2**, plus a Hell border on the results card | anyone in the lobby has cleared a Warden on Hard | B |

- **Wish Coins and Pearls do not scale with difficulty.** The published earn rates stay one simple, true table. Harder play pays in Rank, light (fireflies) and the Hell border.
- **Unlocks are per lobby:** the host's, or the most advanced member's, cover everyone (FO §3.6). A new friend can join a veteran's Hell climb.

**Sealed** [B]:
- The host toggles a seal on the difficulty door.
- Sealed applies only to rooms whose Bestiary page **every human in the lobby** has stamped Cleared. Those rooms show their rule redacted (`05` owns the redaction) and pay **×1.5 fireflies**.
- A first visit is always plain text (fun before rules). Hell ignores Sealed, since it always redacts.

### 11.2 Getting hurt and failing (FO §3.7)

- **Spots, catches, the tadpole ghost and the 2 s croak revive** are `02`'s. Landings revive everyone and restore all spots for free.
- **A room fails** when its hard timer ends or every frog inside is Dark.
  - It pays **50% of its clear bonus** (fireflies and clear coins) and **no Boon**, and costs **1 Team Life**.
  - Pots, gulped fireflies and jars already earned are kept.
  - The Tower spits the party out through the next door, so the climb goes on.
- **E doors never cost a Team Life.** Their entrants lose only that door's Boon and their unbanked fireflies (the 50% clear bonus still pays).
- **Heart doors never cost a Team Life either** (`03` rule H4, mirrored here; pending sign-off, §16). A Team Life is shared, and betrayal may move only unbanked loot (FO §5.4 #3), so a Rival's betrayal must never spend a solo player's life.
- **A failed Keeper** costs a life and pays 50%, with no Party Rank Up. The Keeper Landing ceremony still runs, and in the first climb it still unlocks choice: onboarding never waits on a win. Hard stays chained until a Keeper is actually *cleared*.
- **A failed Warden** costs a life and restarts at phase 1 with all spots. At 0 lives the climb ends at door 20.
- **The climb ends** at 0 Team Lives (Normal and harder) or when every human is Dark at once (Easy). **The results always pay** (§12).

### 11.3 Saving, resting and resuming [A]

- **Every Landing is a checkpoint.** It stores the seed plus a small JSON state (`10` owns the format):
  - the door, Team Lives and difficulty;
  - for every seat: banked fireflies, verb ranks and usage counters, Boons with ranks and slots, rerolls, the heal bug, class, and quest state.
- **Rest** at a Landing runs the results now. RP, pages and floors pay now, coins convert now (§10.1), and **one Resume point** per profile is stored, with 0 coins.
- **Resume** continues from that checkpoint. Starting a new climb replaces the Resume point, and a confirm line says so.
- **Retry from door 11** [B]: after a wipe past the Keeper, and only until the profile first surfaces, the results offer `Retry from DOOR 11`. It reloads the Keeper Landing checkpoint with full Team Lives (DEC §8.2 #16).
- **A crash or quit mid-room loses nothing banked.** Each Landing writes a pending-results record, and the next launch pays it.
- **A human who leaves** hands their seat to a Rival at the next door and keeps everything up to the last Landing.

---

## 12. The results ceremony: every climb pays, win or lose [A]

It plays on the Rim after ★1 (DEC §8.2 #15), at a Landing when you Rest, and at the well bottom after a wipe (`07` stages it). Each human sees their own meters; the titles are shared. **About 20 s the first time**; after that, holding Tongue fast-forwards each meter and a tap jumps to the buttons.

| # | Meter | Time | What the player sees and hears |
|---|---|---|---|
| 1 | **The door counter slams** | 1.5 s (+0.5 s for a new best) | `DOOR 14 · BEST 17` in huge numerals, with the ring map behind it tracing your path. A new record stamps `NEW BEST` |
| 2 | **Wish Coins become Pearls** | ~3 s | Coins pour out of a jar and become pearls at rising pentatonic pitch. Line items, never a formula: `Wish Coins 214 → 107` · `4 floors +40` · `2 new pages +40` · `First surfacing +50` · `Well-Rested ×2`. The total lands with a clack |
| 3 | **Bestiary stamps** | 0.4 s each (up to 6, then `+N more`) | New pages flip in, stamps thump down, and death tips show a small `tip added` tab |
| 4 | **Class and secret quest** | ≤ 2 s | An unlocked class card with rotating markings, or `Quest: Spit back 2/3. It ends with the climb.` (private) |
| 5 | **Titles** | ≤ 2 s | Up to 3 cosmetic callouts, at most 1 per frog: `Safe Hands: Pip (4 catches)`. They pay nothing, and **no title counts betrayals** (FO §4.4) |
| 6 | **Tower Rank bar, last** | 1.5–5.5 s | Fills last because it is usually the closest to full (goal gradient). Rank-up ceremony if crossed (§8.3). The near-miss line `Rank C: 92%` is allowed because this bar is deterministic |
| 7 | **Two equal buttons** | — | **Climb again** and **Rest**, the same size and weight. Nothing starts by itself. After a post-Keeper wipe before first surfacing, a third small button: `Retry from DOOR 11`. Below them, the optional one-tap `Worth it?  Yes · Meh · No` (`08`) |
| 8 | **The curiosity teaser** | — | One line under the buttons, and the first line of the next launch: `Something is waiting in 12E.` It is generated from real state (an unvisited E door, a `???` page, the next talent) and **never uses a friend's name** (FO §4.4) |

**Titles** (callouts only; the earlier achiever wins ties):

| Title | Stat |
|---|---|
| Safe Hands | most spot and frog catches |
| Bell Ringer | most bells rung |
| Mite Popper | most mites popped |
| Belly Flop | most falls |
| Swallowed | most times swallowed |
| Spotless | no hits all climb |
| Hidden Hand | most hidden clears |
| Sumo | most toy wins |
| Egg Carrier | longest carry time |
| Chorus Leader | most synced croaks |

**What each outcome keeps** (Normal; values from §5 and §13):

| Outcome | RP | Pearls | Also keeps |
|---|---|---|---|
| First climb, wiped at door 8 | ~41 → **E** | ~155 | 5 pages with death tips; BEST 8 |
| First Quick Climb, Rest at the Keeper | ~60 → **E** | ~210 | Party Rank Up, the free hat, the pull-back, a Resume point |
| First Full Climb, out of the Well | ~120 → **D** | ~350 | ★1 and the Rim; the Sky marked surfaced for the lobby |
| Later Quick Climb | ~32 | 50–80 | — |
| Later Full Climb, cleared | ~80–90 | 75–165 (median ~135) | a Legendary pick in most climbs; the Warden |
| Later Full Climb, wiped at door 14 | ~43 | ~80 | — |
| Quit at a Landing | everything banked to that Landing | coins converted | a Resume point |
| Failed, but a secret quest completed | +10 | +10 (the Gold jar's 20 coins, halved) | **the class, permanently** |

---

## 13. Balance sanity table

All values come from the simulations behind §5 (`Yields.json` and `Economy.json` as written in this file). They are greybox hypotheses; the "Worth it?" tap and the funnel settle them (FO §8.5, §9.3).

### 13.1 In-climb growth

| Check | Target | This design | Status |
|---|---|---|---|
| First reward | ≤ 0:20 | Lv2 in the pond | ✔ |
| First power spike | ~2:00 | Shatter Croak at the door-2 clear | ✔ |
| Glow level cadence | every 2–3 doors | Lv3 at 3, 4 at 5, 5 at 7, 6 at 9, 7 at 10, 8 at 12, 9 at 15, 10 at 18 | ✔ (largest gap: 3 doors) |
| First Awakening | ~6:30–7:00 | door 7 (~7:00) | ✔ |
| Crown glow played, not watched | before the Warden | door 18 (Normal), 13 (Hard), 10 (Hell) | ✔; §2.4 keeps Hard and Hell ticking |
| Boons per Full Climb | ~12 | 13 (first climb), 14 (seeded) | ✔ |
| Build fills | slots full by ~door 15 | 5 slots and mostly III by door 18 (seeded) | ✔ ("slots full: upgrades", as FO §4.5) |
| Snowball guard | the strongest frog can't run away | 70/30 split, equal clear bonus, spills return, no level-scaled loot, Shared Glow ≤ +30%, Boon multipliers ≤ ×3.0 | ✔ |

### 13.2 Wish Coins per climb (per frog)

| Climb | Gross | Typical spend | Held at the end | Stall buys that fit |
|---|---|---|---|---|
| First Quick Climb (to the Keeper) | ~142 | 0–60 (stall opens at L2) | 82–142 | one upgrade, or a heal + a reroll |
| First Full Climb | ~301 | ~85 | ~216 | an upgrade + a reroll |
| Later Quick Climb | ~114 | ~25 | ~89 | a reroll |
| Later Full Climb (plain) | ~297 | 50 / 105 / 225 | 247 / 192 / 72 | from "save it all" to "Gold Key + 2 upgrades + heal" |
| Later Full Climb (rich: hidden clear, quest, gold door, the toad's jar) | ~347 | ~105 | ~242 | — |

**The tension works:** a big spender at both stalls (225 coins) keeps about 70 coins, so about 75 Pearls instead of about 165. That is a real choice between power now and a hat later, with no wrong answer.

### 13.3 Pearls and cosmetics

| Check | Value | Status |
|---|---|---|
| Later Full Climb | 75–165 Pearls (median ~135) | ✔ FO's 80–160, give or take the extreme spenders |
| Later Quick Climb | 50–80 | ✔ inside FO's 40–80 |
| First Common (150) | after the first Quick Climb (~210 Pearls, ~11 min), plus the free hat | ✔ the skins-and-shop wish lands in session 1 |
| A Rare (400) | ~3 later Full Climbs | ✔ |
| An Epic (900) | ~7 later Full Climbs | ✔ |
| A Legendary (2,000) | ~15 later Full Climbs (~6 h) | ✔ (the old design needed ~29 long sessions for its top skin) |
| The Milestone A catalogue (12 items) | 4,800 Pearls (`08` §6.2): ~70 Quick Climbs (~13 h), since the demo has only Quick Climbs | the demo can't empty the shop, but its first hat is 11 minutes away |
| The whole 24-item catalogue | 12,800 Pearls (`08`: 10 Common, 7 Rare, 5 Epic, 2 Legendary): ~94 later Full Climbs (~38 h), ~30 h with Well-Rested | healthy for a $7.99 game |
| Lifetime one-offs | 14 pages × 20 = 280, + 50 surfacing | — |

### 13.4 Tower Rank pace

The model repeats Full clear, Quick, Full clear, Full wiped at door 14, on Normal. The late average is ~61 RP per climb (FO: "about 60").

| Rank | E | D | C | B | A | S | SS | SSS |
|---|---|---|---|---|---|---|---|---|
| Climbs, no Well-Rested | 1 | 1 | 3 | 7 | 13 | 22 | 35 | 54 |
| Climbs, Well-Rested every 4th | 1 | 1 | 3 | 7 | 12 | 19 | 30 | 46 |
| FO §4.3's estimate | 1 | 2–3 | ~5 | ~9 | ~16 | ~24 | ~37 | ~55 |

New pages front-load the early ranks, so the first week feels fast and the tail matches FO. SS and SSS also need surfacing layers that are LATER.

### 13.5 Farming and exploit checks

| Loop | Rate | Verdict |
|---|---|---|
| Pearls per minute | Floor-1 quit loop 6.8 · Quick 5.8 · Full (mid spend) 5.7 · Full (no spend) 7.8 | no dominant loop. Coins scale with the floor and the Mouth's rain grows per Landing, so deep play pays best when you save |
| RP per minute | Floor-1 quit 1.9 · Quick 2.9 · Full 3.5 | full climbs are best, as intended |
| Dying on purpose | new pages and classes pay once, lifetime | nothing to farm (FO §4.4) |
| Resting and resuming to double-dip coins | coins convert at Rest; the Resume starts at 0 | closed |
| Gold Key chain | 1 per climb | capped |
| Easy for RP | the same RP as Normal (FO: Easy ×1) | accepted: Rank gates nothing, and Easy is the accessibility door |
| Faking betrayals for Vengeance | Vengeance returns exactly what was taken, +1 choice once per climb (`03`) | nothing to farm |
| Friends feeding a secret quest | quests are self-contained by test | closed |
| Stacking Shared Glow or Risk Boons | +30% and ×3.0 caps | capped |
| Winding the clock for Well-Rested | max 2 rested climbs; Steam server time when online | harmless: cosmetics sooner, Rank gates nothing |
| Sealed without learning | only rooms every human has Cleared | closed |
| Paying to win | nothing sold touches play (§10.5) | closed by test |

---

## 14. Data files and tests

### 14.1 JSON (agents edit these; generators turn them into ScriptableObjects; UT pattern)

| File | Holds | Owner |
|---|---|---|
| `Yields.json` | per door type: clear base, per-door slope, loose; hidden ×2; gold ×3; Sealed ×1.5; difficulty multipliers | 04 |
| `GlowCurve.json` | k = 15, max level 10, per-level body readouts (§2.3), Crown sparks (every 75, max 6, +5 coins) | 04 (the look: `02`, `09`) |
| `VerbRanks.json` | rank numbers (`02`); usage weights and tie order (§3) | 02 / 04 |
| `Boons.json`, `Synergies.json` | the 24 Boons (§6.2); pairs and clashes (§6.4) | 04 |
| `Classes.json`, `Quests.json` | 9 classes and Signatures; 6 quests with predicates and feasibility tags | 04 |
| `Rank.json` | RP sources, thresholds, talents, letter colours | 04 |
| `Bestiary.json` | 14 pages: ids, rooms, suit, milestone | 04 (tips: `05`) |
| `Economy.json` | clear coins, pot targets, jars, the Mouth's rain, stall, Pearl terms, prices, Well-Rested | 04 |
| `Difficulty.json` | the §11.1 table and Sealed | 04 |
| `ClimbTemplate_W1.json` | the authored first climb, including the grant plan (§6.1) and prize icons | 05 + 04 |

**RoomDef fields this file needs from `05`:** `pots` (count), `prize` (boon / jar / key / gold / window), `echoSpotBells` (most bells one `EchoSpot` croak reaches), `canSwallow`, `hasProjectiles`, `floorlessPossible`, cause tags on every rule clause (for death tips), `hiddenClearHint` (for the Rank A talent), and a `Floor` tag on walkable floor colliders (for the Lily Walker quest).

**Example entries:**

```json
{
  "id": "tell_sight",
  "family": "sight",
  "rarity": "common",
  "slot": "passive",
  "verbTag": "any",
  "milestone": "A",
  "ranks": [
    { "preTellSec": 1.0, "share": "self" },
    { "preTellSec": 1.0, "share": "knot" },
    { "preTellSec": 1.0, "share": "radius", "radiusM": 8 }
  ],
  "home": { "suit": "diamond", "preTellSecAdd": 0.5 },
  "lineKey": "BOON_TELL_SIGHT"
}
```

```json
{
  "id": "quest_mime_frog",
  "classId": "mime_frog",
  "predicate": "ClearSuitWithoutVerb",
  "params": { "suit": "diamond", "verb": "croak" },
  "target": 1,
  "scope": "climb",
  "feasibility": { "tag": "rule_diamond", "minRemaining": 2 },
  "lineKey": "QUEST_MIME_FROG"
}
```

```json
{
  "clearCoins": {
    "breather": { "base": 1, "perFloor": 0 },
    "rule": { "base": 2, "perFloor": 1 },
    "e": { "base": 4, "perFloor": 2 },
    "set": { "base": 4, "perFloor": 1 },
    "gold": { "base": 10, "perFloor": 0 },
    "keeper": { "base": 12, "perFloor": 0 },
    "warden": { "base": 20, "perFloor": 0 }
  },
  "jars": { "bronze": 5, "silver": 10, "gold": 20, "goldRerolls": 1 },
  "mouthRain": [4, 8, 12],
  "stall": { "heal": 20, "reroll": 25, "upgrade": 60, "goldKey": 80 },
  "pearls": { "coinDivisor": 2, "perFloor": 10, "perNewPage": 20, "firstSurfacing": 50 },
  "prices": { "common": 150, "rare": 400, "epic": 900, "legendary": 2000 },
  "wellRested": { "hoursPerClimb": 36, "maxClimbs": 2, "multiplier": 2, "consumeAtDoor": 3 }
}
```

### 14.2 EditMode tests that fail the build

| Test | Fails when |
|---|---|
| `GrowthCurveTests` | §5.4 |
| `GrantPlanTests` | the first climb's grant plan does not leave passive slot 4 free at door 9; any pre-Keeper door shows a choice screen |
| `BoonPoolTests` | the pool isn't exactly 16 + 4 + 4; a regular Boon lacks 3 ranks or a home effect; any Boon field references spots, hitbox, base speed, shove impulse or the tug cap; the A pool isn't the 10 listed in §6.2; an offer can hold duplicates or a Boon at III; offers differ for the same salt and inputs |
| `OfferPrivacyTests` | an offer or quest type is reachable from a replicated NetworkVariable or a non-targeted RPC |
| `QuestTests` | a predicate reads another frog's events; a quest lacks a feasibility tag; a quest counts betrayals |
| `RankTests` | thresholds don't strictly increase; S, SS or SSS lack their surfacing flag; a talent touches a non-whitelisted stat or another player |
| `EconomyTests` (with FO §8.6) | a shop item references a gameplay stat or a random table; anything sold for money grants coins, keys, rerolls or revives; a System template has `%` without a bound data key; any shop UI shows a countdown under 24 h; an imported asset has no `licenses.csv` row; a jar definition holds a random table, a cosmetic or fireflies; the Pearl calculation uses any term beyond the four published; published prices differ from `Economy.json`; `MockDlcOwnership` is reachable in a release build |
| `EconomyBandTests` (warning, not failure) | the simulated median later Full Climb pays outside 80–160 Pearls, or a later Quick Climb outside 40–80 |
| `ResultsOrderTests` | the meter order differs from §12; the Rank bar isn't last; anything auto-starts; the two buttons differ in size |
| `WellRestedTests` | more than 2 rested climbs; a pip per less than 36 h; a rested climb consumed before door 3 |

### 14.3 Telemetry hooks

`08` owns the transport; it is opt-in and carries no personal data. Events:
- level-up (door, clock);
- verb rank (verb, cause count);
- Boon offer and pick (ids, time to pick, reroll used);
- stall purchase;
- jar opened;
- coins held at the end;
- Pearls paid;
- rank-up;
- quest assigned, completed or expired;
- results skipped (step);
- the "Worth it?" answer.

These feed FO §9.3's funnel and the stop conditions (for example: the median time to first power over 3:00, or testers unable to name a power they gained).

---

## 15. Milestone map

| Milestone | Progression and economy content |
|---|---|
| **A** (Quick Climb, free demo) | fireflies and yields; Glow 1–7 on screen (curve to 10); verb ranks I–III with usage rules; in-room pickups; the first-climb grant plan; `[ CHOICE UNLOCKED ]`; pick 1 of 3 in repeat Quick Climbs from door 2; the A pool (8 Commons + Moon Hop + Time Gulp); Party Rank Up; rerolls; Wish Coins, jars, the lineup, the stall (L2); Pearls; Tower Rank F–C with talents E, D, C; Bestiary 9 pages with death tips; Easy, Normal, Hard (data flag); Team Lives, failure, Landing saves, Rest and Resume; the results ceremony; Well-Rested and the break line; the growth CI test and the tests in §14.2 |
| **B** (Full Climb, ★1) | Glow 8–10, rank IV, the Crown glow and sparks; the full pool (8 Rares, Frog Choir, Lucky Belly, 4 Duos) and synergies; 3 open + 6 secret classes with quests; Tower Rank to S with talents B, A, S; 14 Bestiary pages and hats; the stall at L3 and the Gold Key; Hell and Sealed; Retry from door 11; +50 Pearls on first surfacing; Supporter Set DLC stubs with the mock |
| **SHOULD** | Korean strings for every System line here; the share card showing your build (DEC §7) |
| **LATER** | talents SS and SSS; re-hatching at Lv1 in the Sky with the Glider molt and talents carried; Sky Rematch doors pulling in Well rooms; gold-markings quests; the extra quest ideas in §7.3; Daily Seed scoring |

---

## 16. Open questions

1. **Power-slot Boons.** FO fixes 4 passive + 1 Power slots but never says which Boons are Power. This file makes **Stomp**, **Third Eye**, **Time Gulp** and **Frog Sling** the Power Boons. Stomp becomes a ground-slam button instead of FO's passive "landings pop mites" (same radii); Frog Sling needs a button, because tonguing an airborne partner is already the catch. Milestone A's pool therefore has only one Power Boon (Time Gulp), so the Power button is mostly idle until B's classes arrive. Is that acceptable for the demo?
2. **Jars hold coins; their fireflies are part of the room's loose budget.** FO says jars hold "fireflies and coins". A room jar spills fireflies only from the room's existing loose share, and earned jars hold coins only (plus the Gold jar's reroll). This keeps DEC §5's growth table and CI test exact. If jars should add fireflies, the CI yields must be re-run.
3. **The plaque's prize icon now pays something.** The Boon prize gives +1 rank, and the jar prize a Silver jar, because FO's example ("3A jar, 1 skull / 3C Boon, 2 skulls") implies a trade-off while FO also grants a Boon at every rule door. `05` must adopt the same meaning.
4. **Resting converts coins, and a Resume starts with 0 coins.** This is simple and closes a double-dip, but it makes resting at the Keeper cost stall money on Landing 3. The alternative is to keep coins in the save and pay their Pearls when the climb finally ends.
5. **The first session is generous:** about 210 Pearls after the first Quick Climb (a Common plus the free hat), because FO's own +20-per-new-page term dominates early. FO §4.4's "~40 Pearls for a door-8 wipe" does not match FO's formula (it gives ~155). This file follows the formula.
6. **Hell reaches Lv10 at the Keeper** (×2 fireflies, FO-binding). Crown sparks keep something ticking, but Hell's back half has no Glow growth. Consider capping Hell's firefly bonus at ×1.5 after the Keeper, or accept it as the Hell fantasy.
7. **The stall at Landings 2 and 3 in every climb.** DEC says the stall opens at Landing 2 in the first climb and is silent about later climbs. Keeping Landing 1 stall-free in all climbs keeps floor 1 about play.
8. **The brief asks for a "mocked" paid currency.** FO §8.2 and DEC glossary 21 forbid any paid currency, so the mock here is a development-only DLC-ownership stub (§10.5), not a currency.
9. **Mirrored from `03`, needing sign-off:** Heart doors cost no Team Life (H4), and `heart_split_swallow`'s jar J = 2 × (8 + d) replaces that room's loose yield (share + share pays J/2 × 1.5 each; the Duet pays J/2 × 2). This file counts the Duet as that room's hidden clear, so its clear bonus also doubles as usual; `03` should confirm. `03` also promises a Hidden-clear *stamp* for Heart doors, but they have no Bestiary page (§9.1).
