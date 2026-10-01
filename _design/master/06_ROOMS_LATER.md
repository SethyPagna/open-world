# KNOTWELL: rooms after the slice

**File** `06_ROOMS_LATER.md` · **Version** 1.0 · **Date** 2026-09-29 · **Status:** the build spec for [SHOULD] rooms and the design spec for [LATER] rooms and modes.

**Authority.** `DECISIONS.md` (**DEC**) is binding, then `FUN_OVERHAUL.md` (**FO**). The old GDD, `WORLD_STRUCTURE.md` (**WORLD**) and `GDD_CRITIQUE.md` (**CRIT**) are the parts bin. Every room below is re-homed from that bin or is new, and says which.

**What this file owns** (DEC §9):
1. Full specs for the five SHOULD items: `moth_library`, `sunken_bucket`, `toy_bigtoad`, the `*_e` E variants and `sky_preview` (§3).
2. Specs for the three named LATER rooms: `mirror_toll`, `ash_axeman` and `hollow_toad` (§4).
3. Pitches for the second batch of 12 Well rule doors (§5).
4. The Sky, Space and Beyond: each layer's room grammar, its rooms by suit, its Keeper and its Warden (§2, §6–§8).
5. The LATER modes Mimic Climb and Daily Seed (§9).

**What it leaves to other files.** The RoomDef contract, the kit, generator rules and the per-room Definition of Done live in `05_ROOMS_SLICE.md`. Firefly yields, Boons and classes live in `04`. World geometry, the ring map and reveal choreography live in `01`. Palettes and audio live in `09`. Netcode, physics profiles and Steam calls live in `10`.

---

## 0. How to read this file

**Tags.** Every room and feature carries [SHOULD] or [LATER]. Nothing here is MUST. SHOULD items follow DEC §7's build order, and they are cut from the bottom up: Sky Preview first, then `sunken_bucket`, then `toy_bigtoad`, then the E variants.

**Numbers.** Every number is a greybox hypothesis unless it cites FO, DEC, WORLD or the GDD. Verb thresholds come from FO §4.1:

| Verb | I | II | III (Awakening) | IV (Mastery) |
|---|---|---|---|---|
| Hop | apex 1.4 m; charged 1.9 m | charged 2.4 m (ledges at 2.3 m) | Air Hop | charged 3.0 m; landing stomp pops mites within 3 m |
| Tongue | 3 m; pulls props ≤ 20 kg | 4.5 m grapple | Long Tongue: 6 m, 2 grabs at once, snatch and spit a projectile | 8 m chain-grapple with no touchdown |
| Croak | 4 m pulse; rings bells, stuns mites | 6 m; 1 s stagger on small monsters | Twin Toll: rings 2 bells at once; the pulse knocks mites back | Thunder Croak: 9 m; 2 s stagger on rule monsters, never a kill |

**Every rule door here obeys the same anatomy** (FO §3.8; DEC §4 "Rooms"), so the entries don't repeat it:
- one never-killed monster;
- one self-lit cue, 2–5 s before the danger;
- one plain rule of at most 14 words (every rule quoted here has been counted);
- an obvious clear and a hidden clear;
- 2 seeded Twists;
- a rank-II lane **and** a rank-III/IV lane for **each** of Hop, Tongue and Croak, because the Awakening verb follows usage (DEC §5);
- mites that pop into fireflies;
- one shared-fate gimmick;
- a soft length of 45–90 s and a hard cap of 150 s.

Two more rules apply everywhere:
- **Hidden clears** always fire `[ NOTED ] That was not the intended solution. Keep it.` (DEC §8.2 #25). No entry repeats this.
- **Monsters are never killed.** A clear cracks, calms, traps, tricks, stalls or sends the monster to sleep.

**Ids and plaques.**
- Ids are snake_case with these prefixes: `br_` breather, `toy_` toy, `sp_` set piece, `heart_` Heart door, `keeper_`, `warden_`, and `_e` for an E variant.
- Plaque letters match the suit (DEC §5): A ♠ Body, B ♦ Mind, C ♣ Together, E solo/duo, ♥ Heart.
- Skulls are base values. Hard adds 1, and an E variant adds 1.

**Words.** This file uses the DEC §10 glossary exactly. It coins no new player-facing noun. Monster and room names are display names, the same kind as "the Bell-Golem" in DEC §6.

---

## 1. Traces: what the user asked for, and where it lives after the slice

### 1.1 The favourite monsters

These are the nine named monsters from the earlier brief and the GDD roster (GDD §6.14). Each one keeps a home in the slice or gets one here. Wherever the monster comes back, its rule changes to fit the new layer's physics, so a return never plays as a reskin.

| Monster | Slice home (DEC §6) | Later homes (this file) |
|---|---|---|
| **Echo Golem** (GDD `golem_belfry`) | `bell_golem`: door 2, the Keeper `keeper_bell_raft`, the door-18 Rematch, Warden phase 1 | `sky_preview` door 22 [SHOULD]; `vacuum_bell` (Space ♠); `keeper_echo_golem` (Beyond Keeper, door 70) |
| **Chrono-Slime** (GDD `clockwork_foundry`) | `slime_foundry` (12E) | `slime_squall` (Sky E) |
| **Mimic** (GDD `mimics_toll`, the Doppelfrog) | `doppelfrog` (♥ 14) | `mirror_toll` (Sky ♦); the **Mimic Climb** mode (§9.1) |
| **Karmic Executioner** (GDD `karmic_executioner`) | — | `ash_axeman` (Space ♠); `keeper_axe_pod` (Space Keeper, door 50) |
| **Weight of Guilt** (GDD `weight_of_guilt`) | Cut from the slice: it depended on Soot and the Ledger (DEC §6) | `heart_guilt_scale` (Beyond ♥). It is re-homed as a room-local Heart door that reads only what is in frogs' cheeks right now. There is no memory of earlier doors (see Open questions) |
| **Glitched Watcher** (GDD `glitched_watcher`) | `glitch_eye` (17E) | `watcher_satellite` (Space E); `warden_the_watcher` (Beyond Warden, door 80) |
| **Harmony Sentinel** (GDD `harmony_sentinel`) | `lamp_knight` (7C) | `slow_light_knight` (Beyond ♣) |
| **Liar's Banquet** (GDD `liars_banquet`) | `doppelfrog` (♥ 14) | `heart_moon_banquet` (Space ♥) |
| **Paradox Mirror** (the brief; CRIT #10 asked for it as a third E room) | — | `paradox_mirror` (Beyond E) |

### 1.2 TEAMBOUND_13 homages

| TEAMBOUND mode | Slice home (DEC §6) | Later homes |
|---|---|---|
| **Chained ascent** | `sp_tongue_tether`, `heart_tied_bridge` | `sp_spacewalk` (Space); `sp_light_rope` (Beyond); the Beyond Warden's phase-3 chain catch |
| **One Body** | — | `toy_bigtoad` [SHOULD]; `hollow_toad` (Sky set piece) |
| **Downstream** (raft) | `lily_raft`, `keeper_bell_raft` | `leaf_raft` (Sky ♣), and every later Keeper rides its layer's vessel (§2.3) |
| **Deep Dive** | — | `sunken_bucket` [SHOULD]; `water_globe` (Space ♣) |
| **Tower of Babel** | `toy_frog_stack` | `sp_babel_tower` (Sky set piece); the Thunderhead Heron's phase 2; `toy_zero_g_stack` (Space toy) |
| **Summit** | `sp_grip_wall` | `sp_oxygen_spire` (Space); `sp_moss_wall` (Beyond) |
| **Echo Chamber** | `echo_warren`, `lamp_knight` | `vacuum_bell`; `choir_bridge`; `keeper_echo_golem` |
| **Delivery** | `snapper_crossing` | `hot_signal` (Space ♣) |

### 1.3 The user's wishes after the slice

| Wish (the user's words) | Where this file pays it |
|---|---|
| "layers upon layers from center to outwards circle" / "frog in a well … sky … space … bigger scenes" | Three more layers of 20 doors each, with their own physics, Keepers, Wardens and reveals (§2, §6–§8) |
| "tower design, dungeon design … maze with dungeons" | The Sky's rooms are a **maze** of cloud islands, Space's are a **dungeon** of station decks, and the Beyond's are a **maze of dungeons** along a filament (WORLD §2 macro formats, kept as room dressing) |
| "monsters that have weird clearing conditions (not traditional fighting)" | 35 new rule doors (plus 6 E variants) and 3 new Heart doors, each with a hidden clear or a co-op answer; 3 Keepers and 3 Wardens |
| "mafia, among us" | `heart_moon_banquet`; the Mimic Climb mode |
| "chained, peak" | Set pieces in every later layer |
| "increase their powers" | Each layer re-hatches you at Lv1 into a new body part (the molt), and the rank lanes are rescaled so the numbers keep binding (§2.2) |
| "they can meet in different levels … 1a 1e 1b" | E doors in every layer, and E variants of the Well's group rooms (§3.4) |
| "mini sidegames" | One new toy per layer, plus `toy_bigtoad` |

---

## 2. The later layers: shared grammar [LATER]

### 2.1 Layer sheet

The Sky, Space and Beyond climbs are LATER (DEC §7). Door numbers run on across the world: Sky 21–40, Space 41–60, Beyond 61–80 (DEC §4).

| | **The Sky** 하늘 | **Space** 우주 | **Beyond** 너머 |
|---|---|---|---|
| **Doors** | 21–40 | 41–60 | 61–80 |
| **Room dressing** (WORLD §2 macro format) | A **maze** of cloud islands. Rooms are islands walled by cloud; the dread rooms are thunderhead interiors and night islands. | A **dungeon** of station decks, bulkheads and derelict modules | A **maze of dungeons**: clusters of rooms strung along a glowing filament; dead-star interiors |
| **Movement verb** (on by default; DEC §4) | **Glide** (01): hold Hop in the air; fall speed is capped at 3.0 m/s for up to 1.5 s per hop, at 6 m/s forward. Sky gravity ×0.55 (WORLD §9.1 UPDRAFT). | **Drift**: gravity ×0.25 and no air deceleration. You keep your momentum until you touch a surface or a tongue anchor (WORLD §9.1 DRIFT). Tongue IV's 8 m chain-grapple is the layer's core traversal (FO §4.1). | **Light-rails** (01): the Tongue latches onto a glowing filament and slides you along it at 12 m/s, at any rank. Rooms use Sky gravity, and Glide stays on (this file's proposal). **Light-Lag** is the layer's rule (01): anything outside your room, or more than 15 m away, is drawn `min(1.5 s, d ÷ 15 m/s)` in the past. 01 keeps everything inside a room live; this file lets Beyond rooms **opt in** (`layerRule: LIGHT_LAG`) to the same formula (see Open questions). **Sound, hits and colliders are always live.** |
| **Gusts / hazards** | Sideways gusts of 4 m/s for 2 s, every 20–40 s, telegraphed 1 s ahead by streamers (WORLD §9.1) | Floodlights sweep the decks; airless zones outside the air domes | Distant things show you the past |
| **Falls** (cost: 1 spot) | "The updraft returns you" to the last pad after 3 s | A safety line reels you back in 2 s (01) | The filament catches you after 3 s |
| **New social rule** (01 owns it) | **Kite Knot**: Knotted frogs glide as one | **Push-off**: a Shove sends both frogs apart at equal speed | Knotted partners always see each other live through Light-Lag |
| **Molt** (add-on parts on fixed sockets; DEC §2) | **Glider molt**: glide membranes on the arm sockets | **Moon Toad helmet**: a fishbowl helmet over the head socket. **The hat floats inside it**, so every hat still fits. | A star-freckle coat whose markings trail light for 1.5 s (01's proposal), on the same sockets [LATER] |
| **Dread rooms** (09 owns the palette tokens) | Pastel outside; storm-grey inside at ≤ 0.1 ambient; tells in lightning white `#F4F7FF` | Violet and neon: hull `#2A1F3D`, neon tells `#4DF3FF` / `#FF4DD8` | Nebula fog `#FF8FD0`; moss-green glints `#7CC46A` |
| **Waltz** (breathers and Landings) | Sunlit islands, warm `#FFC3A0` | Floodlit decks; the planet fills at least 35% of the view (WORLD §9.2) | Nebula glow, mean scene luminance ≥ 0.18 (WORLD §9.2) |
| **Leak of the next layer** (WORLD Law 3), grows per stop | A tear in the painted dome at the zenith: 1° / 3° / 8° / 20° / 40° (01) | A magenta nebula smear: 5° / 15° / 40° / 60° / 90° | Moss glints: 3 / 12 / 40 / 80 / 120 |
| **Keeper** (door 30 / 50 / 70) | `keeper_hawk_raft` | `keeper_axe_pod` | `keeper_echo_golem` |
| **Warden** (door 40 / 60 / 80; DEC §7 LATER) | `warden_thunder_heron`: the thunderhead heron | `warden_chan_chu`: Chan Chu, the moon toad | `warden_the_watcher`: the Watcher at the rim |
| **Reveal after the Warden** (01 owns it) | ★2 The Painted Sky | ★3 The Speck and the Drop | ★4 The Revelation |
| **Music key** (WORLD §9.3) | C, breathy flute | G, glass bells | D, choir pad |

### 2.2 Rules every later layer keeps

1. **Re-hatch at Lv1 into the molt** (DEC §4). The layer's first door is a two-frog shove door stamped with the layer's first number (`DOOR 21`, `DOOR 41`, `DOOR 61`). A 30-firefly cloud at the molt gives `[ GLOW 1 → 2 ]` in the first 20 s, mirroring the Hatch Pond.
2. **Same growth curve.** The Glow curve and yields are FO §4.1's, with *d* = the door index inside the layer (door 37 is d = 17). The growth CI test (DEC §5) is repeated for each layer.
3. **The numbers must keep binding.** Rooms are authored against the rank thresholds *under that layer's physics*. The reachability validator (05/10) re-solves every lane with the layer's physics profile. Hop apex scales by 1 / gravity:

   | Rank lane | Well (FO §4.1) | Sky and Beyond (×1.82) | Space, Drift (×4.0) |
   |---|---|---|---|
   | Hop I charged apex | 1.9 m | 3.45 m | 7.6 m |
   | **Rank-II ledge** (Hop II reaches it, Hop I doesn't) | 2.3 m | **4.2 m** | **9.2 m** |
   | Hop IV charged apex | 3.0 m | 5.45 m | 12.0 m |
   | Horizontal gap for rank II | authored in 05 | + 9 m of glide reach (1.5 s at 6 m/s) | not a limit in Drift; lanes are anchor spacing instead: 4.5 m (II), 6 m (III), 8 m chains (IV) |

4. **Rematch doors may pull any earlier layer's room at its old numbers** (FO §3.2). A Sky climb's Rematch door can be `bell_golem` at Well physics inside a Well-dressed bubble, showing `OLD TIME 1:12`. Warden phase 1 does the same.
5. **Debut rule per layer.** DEC §5's rule applies inside each layer: while any monster of this layer is unmet, up to 2 never-met monsters are placed before the layer's door 10 (door 30, 50 or 70).
6. **Pool size at launch, per layer.** At least 12 rule doors (7 new ones from this file plus 5 re-dressed from earlier layers; §6.8, §7.8, §8.8), plus the 4 Well Heart doors re-dressed and 1 new Heart door, 2 set pieces, 1 new toy, the Keeper and the Warden. Breathers reuse the Well's templates in the new dressing: jar, toy door, window onto the next layer, sleeping threat, gold door.
7. **The first climb of each later layer** is authored for its first 5 doors, the same way `sky_preview` is (§3.5), so the new verb is taught in a fixed order. It is seeded from there on.
8. **Bestiary.** Each new rule monster, Keeper and Warden has one page (DEC §8.2 #23). A monster that returns in a later layer, such as the Chrono-Slime in `slime_squall`, keeps its original page. Its later-layer room fills that page's stamps too.

### 2.3 The Keeper signature: every Keeper rides a vessel

The Well's Keeper is the door-2 golem on a tipping raft (DEC §6 #17). That becomes a series rule, and it carries the Downstream homage through the whole Ascent:
- **Each Keeper combines two monsters that this layer has already taught**;
- **it is fought aboard that layer's vessel**: a leaf raft in the Sky, a cargo pod in Space, a comet in the Beyond;
- it lasts about 90 s, and it is built only from lessons everyone was taught (DEC §6 #17).

### 2.4 The Warden signature: every Warden ends in a catch

The tagline is "Climb together. Fall alone." The Well Warden's phase 3 is the tongue-catch Trust Fall (DEC §6 #29). Every later Warden keeps the three-phase shape and escalates that catch:

| Warden | Phase 1 (~50 s) | Phase 2 (~70 s) | Phase 3 (~60 s): the catch |
|---|---|---|---|
| The Jar (Well; `05` owns it) | Flatten old monsters | A Chorus lifts the Jar | The Trust Fall: backwards off a ledge, caught by a tongue |
| The Thunderhead Heron (Sky) | Flatten old monsters | The Tower of Babel | The Sky Catch: blown off the island, caught mid-glide |
| Chan Chu (Space) | Flatten old monsters | Pull the Coin | The Drift Catch: floating away, caught by an 8 m chain-grapple |
| The Watcher (Beyond) | Flatten old monsters | Don't look; topple what hums | The Last Fall: all eight linked into one tongue chain |

---

## 3. SHOULD rooms: full specs

These five rooms are built with the slice kit and the slice pipeline (05): JSON RoomDef, a generator that bakes the room shell, and one monster script at most. Each one must pass 05's Definition of Done before it enters a seed pool. Build order (DEC §7): the E variants and `moth_library`, then `toy_bigtoad`, then `sunken_bucket`, then `sky_preview`.

### 3.1 `moth_library` · The Moth Library [SHOULD] · budget M

| Field | Value |
|---|---|
| Layer · suit · plaque | Well · ♦ Mind · B |
| Skulls | 2 |
| Placement | ♦ seed pool, doors 3–19. Never in the authored first climb. |
| Source | Re-themed from GDD §6.2 `whispering_library`. The code dial, the liar clues and the Clue Composer are cut, because CRIT #17 called it "homework". |
| Rule | **"Place three quiet books on their stands. Freeze when the moth twitches."** (12 words; DEC §6 #35) |
| Length | 60–90 s; hard cap 150 s |

**Fantasy.** A blind librarian-moth hangs asleep over a silent reading hall. It hears everything, so you tiptoe with books in your mouth.

**Why it isn't the bell-golem again** (judge_2's objection). The golem is **sight**: its eyes glow, so you stop moving. The moth is **hearing**: it is blind, so moving is fine and only *noise* is punished. You can keep waddling through a listen. You just can't hop, croak, drop a book or shove. The Bestiary teaches that on your first death.

**Layout** (GDD §6.2 dimensions, kept).
- **The hall:** 18 × 26 m, with 9 m walls, in warm-dark lamplight. Reading lamps glow `#FFD9A0` at 20%.
- **Galleries** run along the east and west walls at **2.3 m** (the rank-II ledge), 2.5 m deep. Ladders at (±7.5, 0, −6) let rank-I frogs up.
- **The Moth Beam** is 0.3 m wide and crosses the hall at y 4.5, z 8.
- **The Librarian** hangs at (0, 6.5, 8), wings folded. Its **catalogue** (the hidden-clear object) is tucked in its arms at y 5.5.
- **Six stand plinths:** (−5, 0, −8), (4, 0, −9), (−7, 0, 0), (6, 0, 1), (−8, 2.3, −2) and (8, 2.3, 9). Three hold stands (Twist A). A filled stand glows gold `#FFC94A`.
- **Five books:**
  - three **quiet** books with cream page edges `#EFE3CF`, 1.5 kg each. One of them is the **Heavy Tome**, 30 kg;
  - two **loud** books with lilac page edges `#C9B7E8` and a cracked seal. This is GDD §6.2's liar-book tell, kept as a trap.

**The monster and its cue.**
- **Cycle:** the **twitch** (2.5 s cue), then the **listen** (2.0 s), then rest (6–10 s, seeded).
- **The twitch.** Its antennae flare `#FFE9A8` and flick. A rising paper-rustle plays, positional, from the moth.
- **The listen.** Its wings spread and the hall lamps dim to 10%, while every tell stays self-lit. Any noise event with a loudness radius **≥ 4 m** anywhere in the hall makes it pounce on the source.
- **The pounce.** 1 spot, and the frog is wrapped in paper for 1.5 s (no tongue). It sneezes out confetti, which is the gag. The moth is back on its perch 3 s later.

**Loudness table** (radius in m; the slice's NoiseBus convention): waddle 2 · tongue lash 2 · mite rustle 3 · a carried loud book 4, pulsed every 1 s · hop landing 5 · shove 6 · charged-hop landing 7 · a book dropped from over 0.5 m 8 · croak = its pulse radius (4 / 6 / 9 m by rank).

**Clears.**
- **Obvious clear:** tongue-carry the three quiet books onto three stands. A book placed on a stand within 0.5 m locks in. A loud book on a stand is rejected with an 8 m THUD, which is a trap.
- **Hidden clear:** during a listen, walk the Moth Beam and tongue the catalogue out of the Librarian's arms without making any noise of 4 m or more. Then place it on any stand, and every stand fills. This is GDD §6.2's "Quiet Hands", with the Ledger renamed.

**Twists** (seeded per climb):
- **A (layout):** which 3 of the 6 plinths hold stands. At least one is always on a gallery.
- **B (books):** which 2 of the 5 books are loud, and which quiet book is the Heavy Tome. The listen cadence is 6–10 s, or 5–8 s (Hard always uses 5–8 s).

**Rank lanes.**

| Verb | Rank-II lane | Rank-III/IV lane |
|---|---|---|
| Hop | Charged 2.4 m reaches the 2.3 m galleries with no ladder. The gallery stand is 6 s closer. | **III** Air Hop crosses the 4 m gap between gallery ends. **IV** hops from the gallery onto the beam (2.3 + 3.0 m > 4.5 m); its landing stomp pops mites, but that is a 7 m noise, so only use it during rest. |
| Tongue | Grapple hooks (brass lamp brackets) every 4.5 m along the galleries: quiet travel at 2 m loudness. A hook at the beam's west end gives the hidden-clear route. | **III** Long Tongue carries 2 books at once, or spits a loud book 10 m as a lure: the moth pounces on the book. **IV** chain-grapples across the hall without touching the floor. |
| Croak | A 6 m pulse knocks every paper-moth mite off frogs within 6 m. It is noise, so do it during rest. | **IV** Thunder Croak *during* a listen deafens the Librarian: a 2 s stagger, it drops to the floor, and the listen ends. It is the only croak that is safe mid-listen. |

**Mites.** Paper moths, 6–10 of them. They flutter onto frogs, and a frog carrying one for 3 s **sneezes** (5 m) unless it is tongued, stomped or croaked off. Each pops into fireflies.

**Shared-fate gimmick: the Heavy Tome.**
- At 30 kg it needs two tongues, since Tongue I pulls at most 20 kg.
- Two carriers must freeze together. The pounce hits everything within 2 m of its source, so one hopper gets both frogs wrapped.
- With 1–2 frogs in the room (a fork half or the E variant), the Tome weighs 18 kg.

**Failure.** The hard cap (150 s) expires, or every frog inside is Dark. Failure follows FO §3.7: 50% of the clear bonus, and 1 Team Life.

**BotPlan.**
- **Roles:**
  - **Carriers** take the nearest quiet books; two bots pair on the Tome, or one bot pairs with a human who pings it.
  - **Shusher:** Pell says "Shh!" at every twitch.
  - **Lure:** a bot with Long Tongue spits loud books away from carriers.
- **Freeze reaction:** 250–400 ms after the twitch starts (Rookie Rivals +150 ms).
- **Funny failure:** Kestrel sneezes during 20% of listens. This counts toward the Drama Director's failure target.
- Bots never pick up a loud book unless they are the Lure.

**System lines.**
- Enter: `[ DOOR {n}B · THE MOTH LIBRARY ] Quiet, please.`
- First visit, first twitch: `[ TELL ] Antennae up. It is listening.`
- Clear: `[ CLEARED ] Returned on time.`
- Fail: `[ FAILED ] Your borrowing privileges have been revoked.`

**Bestiary: The Librarian.**
- Death tip: *"It is blind. It hears hops, croaks, shoves and dropped books. Waddling is silent."*
- Hidden-clear line: *"It keeps its catalogue in its arms."*

**Tags.** `wish[]`: weird-clear monsters, TTITH hidden clear. `homage[]`: GDD `whispering_library`.

**Kit.**
- NoiseBus (slice).
- The two-carrier Carry script from `snapper_crossing`.
- Stand = a Plate that accepts tagged items.
- **New:** a `Listener` monster script (cycle, threshold, pounce), about S size.

### 3.2 `sunken_bucket` · Sunken Bucket [SHOULD] · budget L

| Field | Value |
|---|---|
| Layer · suit · plaque | Well · ♣ Together · C |
| Skulls | 2 |
| Placement | ♣ seed pool, doors 3–19 |
| Source | New: the TEAMBOUND **Deep Dive** homage (DEC §6 #36) |
| Rule | **"Raise 3 relics. The catfish swallows the brightest light."** (9 words) |
| Length | 70–100 s; hard cap 150 s |

**Fantasy.** A flooded cistern under the well, where everything the well ever swallowed is lying in the silt. So is a catfish that swallows anything shiny, including you.

**Layout.**
- **The pool:** 14 m across and 14 m deep, with black-green water. The underwater URP volume uses fog `#1B4A5C` and a caustic decal.
- **The rim** carries the **relic basket** (3 slots) and the **winch** for the old well bucket's chain.
- **The old well bucket:** 2 m of iron-banded wood, lying on the bottom at 14 m, its chain running up to the winch.
- **Three relics** at 12 kg each: a bronze bell, a stone frog idol and a moss-green lantern. They glow gold when carried and sink when dropped.
- **Five silt spots** at depths 6, 8, 10, 12 and 14 m.
- **Four bubble vents,** at 8 m (×2) and 10 m (×2). Two are live (Twist B).
- **The catfish's lair,** a root cave at 12 m.

**Swimming and air** (a swim variant of the frog controller).
- **Swimming:** Move paddles at 2.5 m/s; camera pitch picks up or down; Hop is a **kick burst**.
- **Air is per frog: 20 s on Normal.** It reads on the body: the throat sac deflates, and a ring of 4 bubble pips (5 s each) floats over your head, visible to everyone.
  - **At 0 air** you lose 1 spot and float to the surface in 2 s.
  - **Refills:** surfacing refills fully in 1 s; a live vent gives +10 s per bubble, one bubble every 6 s.
- **Tongue a bubble to a friend.** Hold Croak underwater for 0.5 s to spit a bubble that travels 4 m. It costs you 5 s of air and gives 5 s to whoever it hits or whoever tongues it.

**The monster and its cue: Old Whiskers.**
- A 7 m catfish with barbels that glow `#7FE8D8`.
- **Targeting: the brightest light in the water.** Light values:
  - a frog = its Glow Level (1–10);
  - a carried relic = 11;
  - a lantern-fish mite = 14, while it is held and for 4 s after release.

  So **the relic carrier is always the target**, unless a friend holds a lantern-fish near them. Your growth never makes you the bait while a relic or lure is in the water, so this room never punishes levelling.
- **Cue:** the barbels flare and it turns toward its target 2.0 s before a lunge.
- **Lunge:** 9 m/s over 8 m.
- **Swallow:** it swallows the frog, whose relic drops back to the lair's silt. The camera cuts inside a glowing belly for 4 s, then it spits you out at the surface minus 1 spot. **Croak inside the belly and you are spat out at once, with no spot lost.** That feeds the Horned Frog quest (FO §4.2) and the "swallowed and spat out" gag (FO §5.1).
- Between lunges it circles the lair for 8–12 s.

**Clears.**
- **Obvious clear:** all 3 relics in the rim basket.
- **Hidden clear:**
  1. Hold a lantern-fish inside the sunken bucket and get out before the lunge. Whiskers swims in after it.
  2. Two frogs crank the winch together (both hold Tongue on the crank for 3 s).
  3. The catfish is hauled up in the bucket, sulking, and coughs every relic into the basket. It is never harmed.

**Twists:**
- **A:** which 3 of the 5 silt spots hold relics (one is always at 12 m or deeper), and whether the lair is on the north or south side.
- **B:** which 2 of the 4 vents are live, and whether a second lantern-fish school spawns at 10 m.

**Rank lanes.**

| Verb | Rank-II lane | Rank-III/IV lane |
|---|---|---|
| Hop (kick) | A 4 m kick (rank I kicks 3 m) beats the 2 m/s current through the 8 m root crack, a shortcut to the 12 m relic | **III** Air Hop becomes a double kick, which dodges a lunge. **IV**: a stomp on the silt raises a 3 m cloud that hides you (light value 0 for 3 s) and pops mites. |
| Tongue | Grapple rings every 4.5 m on the bucket chain pull you down at 5 m/s | **III** Long Tongue holds 2 relics, or snatches a lantern-fish from 6 m. **IV** chain-grapples the chain rings to the surface without swimming. |
| Croak | A 6 m pulse stuns bubble-leeches | **III** Twin Toll underwater blows one big bubble: +5 s air to every frog within 4 m, once per 10 s. **IV** Thunder Croak staggers Whiskers for 2 s, which breaks a lunge. |

**Mites.**
- **Lantern-fish** are lures. Gulp one and you lose the lure but bank its fireflies.
- **Bubble-leeches** cling on and drain 2 s of air per second until they are tongued off. They pop into fireflies.

**Shared-fate gimmick.** Air is shared by passing bubbles, and the brightest-light rule turns the carrier into bait. So every dive is a pair: one carries, one shields with a lure, and a third passes bubbles.

**Party size.** With 1–2 frogs in the room: 2 relics and 25 s of air.

**BotPlan.**
- **Roles:**
  - **Divers:** the two lowest-Glow bots;
  - **Shield:** holds a lantern-fish within 3 m of a carrier;
  - **Bubbler:** hovers at 6 m and passes a bubble to any diver down to 5 s of air.
- **Barks:** Moss: "I'll be the light!"
- **Funny failure:** Kestrel forgets to breathe on 15% of dives and floats up gasping, minus a spot.

**System lines.**
- Enter: `[ DOOR {n}C · SUNKEN BUCKET ] Hold your breath. It likes shiny things.`
- Clear: `[ CLEARED ] Salvage complete. The catfish is disappointed.`
- Fail: `[ FAILED ] The catfish kept the change.`

**Bestiary: Old Whiskers.**
- Death tip: *"It swallows the brightest light in the water. Carriers shine brightest. Croak from inside to leave early."*
- Hidden-clear line: *"It fits in the bucket."*

**Tags.** `wish[]`: TEAMBOUND modes, weird-clear monsters, team-up. `homage[]`: TEAMBOUND Deep Dive.

**Kit, and why it is L:**
- a water volume with buoyancy;
- the swim variant of the frog controller;
- the underwater post volume;
- a bubble projectile;
- the swallow state: the frog is parented inside the monster and hidden, with a camera cut. This is reused later by `water_globe` and `warden_chan_chu`.

### 3.3 `toy_bigtoad` · Big Toad [SHOULD] · budget M

| Field | Value |
|---|---|
| Layer · type | Well · toy door (a breather; no letter) |
| Placement | The seeded breather pool, plus a Landing Party round |
| Source | Re-themed from GDD §6.14 `hollow_suit`; the TEAMBOUND **One Body** homage (DEC §6 #37) |
| Length | 30 s, then a jar |

**Fantasy.** A festival toad costume, 6 m tall, stitched from felt, big enough for the whole party. Everyone climbs in. Everyone steers.

**Rules** (summed inputs, computed on the host each tick):

| Suit action | How it triggers | Numbers |
|---|---|---|
| **Move** | The **mean** of every frog's stick vector. An idle stick counts as zero, so passengers slow it down. | Top speed 4 m/s |
| **Hop** | The suit hops when at least half the frogs press Hop within a 0.4 s window | 1.5 m, plus 0.5 m per extra presser past half |
| **Tongue** | Fires when 2 or more frogs press Tongue within 0.3 s, toward the mean of their aim points | 8 m; catches flies |
| **Croak** | Volume = the number of croakers. 4 or more within 0.3 s herds the swarm into a clump for 3 s (the Chorus lesson). | — |

- **Goal:** eat flies from the Fly Catch swarm (60 flies, reusing `toy_fly_catch`'s swarm script).
- **Jars:** Bronze at 10 flies, Silver at 20, Gold at 30.

**Visible blame.** Each frog's stick shows as an arrow in its **Seat Hue** on the suit's belly, and each Tongue aim as a dot. "Pip went left" is readable without sound.

**Solo.** The Rivals follow your stick with 250 ms of lag and ±30° of noise. Once per round Kestrel pulls the opposite way, shouting "Shortcut!"

**Fairness.** Toys never cost spots or Team Lives (FO §5.1). The jar pays like the other toys (04).

**System line:** `[ TOY · BIG TOAD ] One toad. Eight opinions.`

**Kit.**
- **New:** `SummedInputController`. The host sums every seat's input each tick and drives one NetworkObject. This becomes the station controller for `hollow_toad` (§4.3).
- The stitched toad-suit mesh is made by the Blender script.
- The fly swarm is reused.

### 3.4 E variants (`*_e`) [SHOULD] · budget S each

**What an E variant is.** A data override of a group rule door. It keeps the same RoomDef, monster script and Bestiary page, and adds `variantOf`, `seats` (SOLO or DUO) and overrides for counts and timings.

**Plaque and rules** (FO §3.3, §3.7; DEC §4):
- the plaque shows E + SOLO/DUO with a gold rim and +1 skull, and offers a Rare-or-better Boon;
- an E variant **never costs a Team Life**;
- if no human takes the E side, **offstage Rivals** take it (DEC §8.2 #11).

**Pool rule.** A variant counts as its base room. If you met `echo_warren` at 7B, `echo_warren_e` can't appear at 12E in the same climb (DEC §5 pool rule).

**Why it matters.** Forks at doors 7, 12 and 17 need E doors. The slice has 2 E rooms (`slime_foundry` and `glitch_eye`), and 05 may add a `slime_foundry` duo variant (DEC §7 slip order). These 6 variants raise the E pool to at least 8, so three forks per climb don't repeat for two climbs.

| id | Base (suit) | Seats | Skulls | What changes (relative to the base numbers in 05) | Why it plays differently |
|---|---|---|---|---|---|
| `echo_warren_e` | `echo_warren` ♦ | SOLO | 3 | Maze 1.3× larger; the hunter ×1.15 speed; croak-drawn walls fade 30% sooner; still 3 glow-moths | The user's maze at its purest: alone in the dark, and every croak that maps the walls also calls the hunter |
| `heron_shadow_e` | `heron_shadow` ♠ | SOLO | 2 | Two shadows cross in turn, 4 s apart; half the lily pads; the feather (the hidden clear) drops only on the second pass | A rhythm test for one frog |
| `moss_snail_e` | `moss_snail` ♦ | DUO | 3 | One frog watches while the other rings the 3 bells. A polished bucket lid lets a lone frog watch behind itself for 3 s before it fogs (8 s recharge). | A pure trust duet: "don't blink" |
| `web_spider_e` | `web_spider` ♣ | DUO | 3 | One frog croaks (the spider drops on it) while the other crosses. Then the crosser tongue-throws the rope back and they swap. | Who volunteers first, on camera |
| `snake_coil_e` | `snake_coil` ♠ | SOLO / DUO | 3 | Two snakes. Tongue one's tail into the **other's** mouth and they bite each other to sleep. Pads sink 1 s after you land. | The hidden clear becomes the whole room |
| `moth_library_e` | `moth_library` ♦ | SOLO | 3 | Two quiet books plus the Tome at 18 kg; one loud book; listens every 5–8 s | Stealth with no one to blame |

**System lines.** Base lines, plus the prefix `[ DOOR {n}E · SOLO ]` or `· DUO ]`.

**Tags.** The base room's `wish[]` plus the "they can meet in different levels … 1a 1e 1b" wish.

### 3.5 `sky_preview` · Sky Preview: doors 21–25 under Glide [SHOULD] · budget M

| Field | Value |
|---|---|
| Layer | The Sky (the first five doors of the first Sky climb) |
| Skulls | 1–2 (DEC §6 #39) |
| Source | Re-themed slice rooms (DEC §6 #39) |
| Unlock | The profile has surfaced the Well (★1) |
| Length | About 4.5 min, then the results |

**Purpose.** The Rim (DEC §8.2 #15) gives the Sky one walk. Sky Preview gives it five doors: Glide, the Glider molt, "Best door: 25", and a window onto Space. It is the proof that each layer is a new body and new physics, not a reskin, and it is the template for §2.2 rule 7.

**Entry.** Nothing starts by itself (FO §8.4).
- On `rim_surface`, a cloud-bank door stamped **21** stands at the rim's edge **after** the results. Walking into it starts Sky Preview.
- A surfaced profile can also start it from the hub map.

**The molt.** At the door you re-hatch at Lv1 in the Glider molt (DEC §4):
- verbs return to rank I, Boons are cleared, and talents still apply;
- `[ MOLT ] Glider. Hold Hop in the air.` (01's line);
- a 30-firefly cloud drifts past for `[ GLOW 1 → 2 ]`, mirroring the Hatch Pond.

**Door by door.**

| Door | Room (source id) | Sky dressing | ≈ Clock |
|---|---|---|---|
| — | The molt on the Rim | Glider membranes pop out; first glide off the rim onto a cloud island | 0:00–0:20 |
| 21 | `br_shove_door` | The Cloud Door: two frogs shove, and `DOOR 21` slams on screen | 0:20 |
| 22 | `bell_golem` | Bells hang from balloons over a cloud island, and the golem stands in cloud to its knees. **Rule unchanged:** "Ring 3 bells. When its eyes glow, freeze." Bells sit at glide heights. | 0:45 |
| 23 | 23A `heron_shadow` / 23C `lily_raft` | **23A:** the shadow is the Thunderhead Heron's, so the Sky Warden is foreshadowed; the pads float on a sky pond. **23C:** the raft rides a wind river; the pike leaps from the cloud-sea. Rules unchanged. | 2:00 |
| 24 | `br_window` | A tear in the painted dome: the stars of Space and a magenta nebula smear (WORLD Law 3) | 3:30 |
| 25 | `toy_fly_catch` | Dragonflies instead of flies; snap them mid-glide | 3:45 |
| end | The Sky's first Landing | The results play here (best door 25) with **Climb again / Rest**. The System says honestly `[ THE SKY IS STILL BEING PAINTED ] Doors 26–40 arrive in a free update.` This line ships only while it is true. | 4:15 |

**Sky physics** (§2.1): gravity ×0.55; Glide (fall ≤ 3.0 m/s for ≤ 1.5 s per hop, 6 m/s forward); gusts of 4 m/s for 2 s every 20–40 s, with a 1 s streamer tell. A fall costs 1 spot, and the updraft returns you in 3 s.

**The re-dress keeps the numbers binding** (§2.2 rule 3):
- the generator scales every authored height ×1.82 and widens rank gaps by the 9 m of glide reach;
- the reachability validator must show that each rank-II lane still needs rank II (4.2 m ledges);
- the growth test must show Lv4 by door 25.

**Palette (Sky):** sky `#BFE3F5`, cloud `#FFF4EA`, shadow `#9DB4D8`, warm accent `#FFC3A0`. Tells stay self-lit. 09 owns the tokens.

**Pays** like any climb: RP per door reached, Bestiary stamps for re-met monsters, Pearls. Door 25 becomes "Best door: 25" on the hub wall.

**Tags.** `wish[]`: frog in a well → sky; layers from the centre outward. `homage[]`: WORLD ★1 and the Rim.

**Kit:**
- the Sky palette and material swaps;
- a `PhysicsProfile` asset (Sky);
- the Glider molt parts on the arm sockets (`IHeroBody`);
- a re-dress pass in the generator.

There are no new monster scripts.

---

## 4. The three named LATER rooms: specs

These are specified to the level of the SHOULD rooms, but they depend on their layer's physics profile, so they wait for the Sky and Space climbs (DEC §7 LATER).

### 4.1 `mirror_toll` · The Mirror Toll [LATER] · budget M

| Field | Value |
|---|---|
| Layer · suit · plaque | Sky · ♦ Mind · B |
| Skulls | 2 |
| Placement | Sky doors 23–39 |
| Source | Re-themed from GDD §6.11 `mimics_toll`. The poison economy, the floor-long curse and the drinker's reward are cut (plan_1; CRIT). It copies only a body and its verb ranks (CRIT: "copy skin, speed and shove only"). |
| Rule | **"It becomes whoever touches it. Make it become something it can't hold."** (12 words) |
| Length | 60–90 s; hard cap 150 s |

**Fantasy.** A quicksilver frog on a cloud-glass toll bridge. It turns into whoever touched it last, with their hat, their hop and their tongue.

**Layout.**
- A cloud-glass bridge, 12 × 24 m, between two islands over the void, with 1 m parapets that have gaps (Twist A). The Toll Gate is at the north end.
- Three brass lightning rods stand on the parapets. **Static beetles** (mites) crawl up one of them.

**The monster: the Mirror.**
- A 2.2 m quicksilver frog-shaped mannequin, blank until touched.
- **Touching it:** a shove, a tongue touch, landing on it, being shoved into it, or hitting it with a spat item.
- **The last frog to touch it becomes its template.** It takes that frog's hat and skin and **its verbs at that frog's current ranks.** A Lv9 frog's copy hops 3.0 m charged; a Lv2 frog's copy is feeble. It copies no Boons, and never the Seat Hue, so blame tags stay true.
- **The template frog shimmers,** so everyone can see who it is copying.
- **It hunts the nearest frog that isn't its template.** It mirrors that frog's movement, one step ahead of it.
- **Cue:** 0.8 s before a shove it ripples all over and a glass hum rises.
- **Shove:** 9 m/s (the standard 6 m/s × 1.5). Through a parapet gap, that is a fall: 1 spot, and the updraft returns you.

**Clears.**
- **Obvious clear:**
  1. Someone gulps a static beetle. They are **Charged** for 12 s: crackling, no Glide, and their touch sparks.
  2. They touch the Mirror.
  3. It copies the charge ×1.5, can't hold it, and goes **dull grey glass** for the rest of the room. The Toll Gate opens.

  The sacrifice is small and stays in the room: 12 s without Glide on a gusty bridge. The GDD's floor-long curse is cut.
- **Hidden clear (a Paradox Mirror nod):** two frogs touch it within the same 0.1 s. It tries to become both, splits into two half-mirrors that bicker, and they wander off the bridge together.

**Twists:**
- **A:** 3 of the 6 parapet gaps are open, and the gust direction is seeded.
- **B:** which rod the beetles climb (1 of 3). In some seeds the Mirror also copies the **second-to-last** toucher (CRIT #11). That seed shows two faint frog ghosts in its surface, so the rule text stays true.

**Rank lanes** (Sky thresholds, §2.2).

| Verb | Rank-II lane | Rank-III/IV lane |
|---|---|---|
| Hop | 4.2 m perches on the rod caps: grab a beetle out of the Mirror's reach | **III** Air Hop saves you after a shove through a gap. **IV** charged 5.45 m: land on the Mirror's head from above, which is a touch delivered outside its shove arc. |
| Tongue | 4.5 m grapple to the rod tops | **III** Long Tongue touches the Mirror from 6 m: the safest delivery. **IV** chain-grapples along hooks under the bridge and comes up behind it. |
| Croak | A 6 m pulse stuns the skittering beetles for 1 s, so they are easy to gulp | **IV** Thunder Croak staggers the Mirror for 2 s |

**Shared-fate gimmick.** The Mirror always hunts somebody other than its template. So the party hands templates around on purpose, and whoever it copies next decides who it chases.

**Mischief, not betrayal.** Re-touching it after a friend has set up a Charged copy overwrites the copy. That is a nuisance, like a shove, and it moves no value.

**BotPlan.**
- Brother Brass volunteers to gulp, saying "I can carry that." (GDD §6.11's line, kept).
- The other bots keep at least 5 m from the Mirror.
- **Funny failure:** Kestrel "helps" by touching it right after the Charged frog, 20% of the time.

**System lines** (the GDD entry line is kept).
- Enter: `[ DOOR {n}B · THE MIRROR TOLL ] The toll is paid in kind.`
- Clear: `[ CLEARED ] Toll paid. It will not be itself for a while.`
- Fail: `[ FAILED ] It became all of you.`

**Bestiary: The Mirror.**
- Death tip: *"It becomes whoever touched it last, hops and tongue included. Give it something that crackles."*
- Hidden-clear line: *"It can't be two frogs at once."*

**Kit.** New: `ReflectionTemplate`. It is a frog body instance driven through `IHeroBody`, with a chrome material. It copies the template's cosmetics and verb-rank table, and never the template's Boons or Seat Hue.

### 4.2 `ash_axeman` · The Ash Axeman [LATER] · budget M

| Field | Value |
|---|---|
| Layer · suit · plaque | Space · ♠ Body · A |
| Skulls | 3 |
| Placement | Space doors 51–59, the second half, when frogs are bright again |
| Source | Re-themed from GDD §6.12 `karmic_executioner`. The reflected damage onto the weakest frog (a betrayal channel) is cut, and so are all Soot rules. Its dark-reading and kneeling are kept. |
| Rule | **"Set the three dials in the dark. Then stay dark while it kneels."** (13 words) |
| Length | 75–110 s; hard cap 150 s |

**Fantasy.** "It kneels only in the dark" (DEC §6 #41). A hooded axeman in a derelict module who hunts the brightest light. Here your glow becomes the liability. That is only fun once you are bright, which is why it lives in the back half of Space (plan_1).

**Layout.**
- **The Court of Ash:** a derelict module, 26 × 26 m, under Drift gravity (×0.25). At its centre is a sunken 8 m **Absolution Circle**.
- **Five wall dials,** 6-position brass wheels. A Tongue hold of 0.4 s turns one a step. Three are real (Twist A).
- **A floodlight on a ceiling rail** cycles 12 s ON, 8 s OFF. It blends between two baked APV lighting scenarios over 0.5 s (UT; plan_2), with no realtime lights.
- **Three live ash vents** out of 5 (Twist B).

**Light value.** Your Glow Level (1–10).
- **Ash-coated frogs count as 0.** Stand in a vent's plume for 1 s and you are coated for 10 s: a grey frog, glow hidden, with the hitbox unchanged.
- **Cinder-moth mites** add +2 each while they cling to you.

**Reading the sentence.** A real dial's **dark-glyph** shows its correct position only when:
- the floodlight is OFF; and
- no frog with a light value above 3 is within 4 m.

**The monster: the Ash Axeman.**
- A 3.5 m hooded figure with an ash-grey axe. It is mag-booted: it walks the floor at 2.8 m/s and **cannot jump**.
- **It hunts the highest light value in the room.** A firefly jar (a mite, light value 12) outshines every frog.
- **Cleave:** a 1.2 s tell (the axe rises and the target is outlined in cinder orange `#FF7A2F`), then a 2.5 m arc: 1 spot.
- **The comedy of Drift:** a hopping frog floats out of reach, but it floats back down, slowly, onto a patient axe.

**Absolution.**
1. Once all 3 dials are set, it walks to the Circle and kneels.
2. A ring fills over **15 s** while no frog with a light value above 3 is within 8 m of the Circle and nobody touches the Axeman.
3. A breach resets the ring, and it rises to hunt for 10 s.
4. **After 2 resets, "Karma Turned":** a breach no longer resets the ring. The Axeman cleaves the frog who breached instead. This caps what one saboteur can do (GDD §6.12 rule 3, kept).

**Clears.**
- **Obvious clear:** Absolution completes.
- **Hidden clear:** carry a firefly jar (light value 12) past the floodlight's power box so that the Axeman cleaves the box. The module goes permanently dark, and it kneels at once for a 5 s Absolution.

**Twists:**
- **A:** which 3 of the 5 dials are real, and their glyph positions (8 positions on Hard).
- **B:** the floodlight cycle (12 on / 8 off, or 9 on / 11 off), and which 3 of the 5 ash vents are live.

**Rank lanes** (Drift thresholds, §2.2).

| Verb | Rank-II lane | Rank-III/IV lane |
|---|---|---|
| Hop | 9.2 m perches above the floodlight rail, on its shadow side | **III** Air Hop turns you mid-drift away from a cleave. **IV** a charged 12 m leap goes dial to dial. |
| Tongue | Grapple anchors every 4.5 m around the walls: dial to dial with no floor contact | **III** Long Tongue turns a dial from 6 m. **IV** 8 m chain-grapple around the court. |
| Croak | A 6 m pulse stuns cinder-moths off you (−2 light each) | **III** Twin Toll knocks back every moth within the pulse. **IV** Thunder Croak staggers the Axeman for 2 s, which breaks a cleave. |

**Shared-fate gimmick.** One bright frog near the Circle resets everyone's Absolution. So bright frogs become the bait and keep it busy far away, and dim or ashed frogs become the readers. Growth becomes a role, not a penalty.

**BotPlan.**
- **Roles:**
  - **Readers:** the lowest-light bots, ash-coated;
  - **Bait:** the highest-Glow bot draws it to the far side;
  - during Absolution, every bot coats in ash.
- Lumen never baits (GDD, kept).

**System lines** (the GDD lines are kept).
- Enter: `[ DOOR {n}A · THE ASH AXEMAN ] It carries out sentences. Yours is still being written.`
- Clear: `[ CLEARED ] Absolved. For now.`
- Fail: `[ FAILED ] Sentence carried out.`

**Bestiary: The Ash Axeman.**
- Death tip: *"It hunts the brightest light. Ash hides your glow. Its sentence shows only in the dark."*
- Hidden-clear line: *"It will cut anything that shines."*

**Kit:**
- the APV lighting-scenario blend (lit and dark);
- a hunt-by-light-value targeting script;
- an ash-coat state on `IHeroBody`: a `SetGlow` override for 10 s.

### 4.3 `hollow_toad` · The Hollow Toad [LATER] · budget L

| Field | Value |
|---|---|
| Layer · type | Sky · set piece (no letter) |
| Skulls | 3 |
| Placement | One Sky set-piece slot (one per half, DEC §5) |
| Source | Re-themed from GDD §6.14 `hollow_suit`; the full TEAMBOUND **One Body** set piece (DEC §6 #42) |
| Length | 120–150 s |

**Fantasy.** A hollow stone toad idol, 12 m tall, left on a cloud island by whoever built the Sky. Its eyes are windows and its mouth is a door. The whole party climbs inside and walks it across a collapsing bridge to ring the Sky gate's bell.

**Stations.** There are 4 stations with 2 seats each, for 8 frogs.
- You take a station by hopping into its hole; first come, first served.
- Inside a station, inputs are summed by the `SummedInputController` from `toy_bigtoad` (§3.3).
- In solo, you pick a station and the Rivals staff the rest.

| Station | Controls | What it does | Scales with the crew's rank (growth binds here too) |
|---|---|---|---|
| **Legs** | Move and Hop | Walks at 3 m/s on the mean stick. A hop needs both Legs frogs to release Hop within 0.4 s: 4–12 m by charge time (1.0–2.5 s). A lone release is a half-height stumble. | The crew's mean Hop rank: +20% hop per rank above I |
| **Tongue** | Aim and Tongue | Its own mouth camera. It grapples island anchors to swing the toad across gaps, and grabs frogs or the bell rope | The crew's best Tongue rank: range 15 / 18 / 20 m, and IV chains 3 anchors with no touchdown |
| **Eyes** | Camera and ping | **The only full view outside.** Everyone else sees a small eye-slit feed (30% of the screen) plus their own station camera. Eyes sees gust streamers 1 s early, and its pings show on every feed. | The crew's best Croak rank widens the ping ring from 6 m to 12 m |
| **Throat** | Croak | Scares off storm birds (mites). A bird landing on an eye blanks the Eyes feed for 3 s. Two Throat croaks within 0.3 s double the range to 20 m. | Croak rank: range 10 / 14 / 14 plus Twin Toll / 20 m, and IV adds a 2 s stagger on birds |

**Route** (checkpoints between stages):
1. **The crumbling bridge.** Each segment falls 1.5 s after the toad's weight lands on it.
2. **The 12 m gap.** The Tongue station grapples an island anchor and swings.
3. **The gate.** The Tongue station grabs the bell rope while the Throat rings it with a croak.

**Failure.**
- If the toad falls, the updraft returns it to the last checkpoint. That costs time but no spot.
- The set piece's hard cap of 150 s fails it: 50% pay and 1 Team Life (FO §3.7).

**Hidden clear.** All 8 frogs croak within 0.3 s from inside the toad, and its throat booms. The gate bell rings from 30 m away, so stage 3 is skipped.

**Twists:**
- **A:** the order in which the bridge collapses, and the gust schedule.
- **B:** the stage-2 anchor positions. One anchor crumbles; its cracked face is the tell.

**Visible blame.** Every station shows its crew's inputs as Seat-Hue arrows, as in `toy_bigtoad`.

**BotPlan.**
- Brother Brass takes Legs: "I've got legs."
- Kestrel on Eyes watches the wrong thing once per stage. That is the gag, and the ping shows it.

**System lines.**
- Enter: `[ DOOR {n} · THE HOLLOW TOAD ] Get in. Everyone. Now steer.`
- Clear: `[ CLEARED ] It walked. Nobody knows how.`
- Fail: `[ FAILED ] It had too many opinions.`

**Tags.** `wish[]`: TEAMBOUND modes, co-op, visuals. `homage[]`: TEAMBOUND One Body; GDD `hollow_suit`.

**Kit, and why it is L:**
- one host-owned rigidbody, with procedural legs using the frog's 2-bone IK at scale;
- 4 station controllers;
- one shared 480p render texture for the eye-slit feed;
- the station-joining flow.

It is the GDD's "bespoke control-sharing system beyond the kit", and `toy_bigtoad` builds half of it first.

---

## 5. The Well, second batch: 12 rule doors [LATER]

**Why a second batch.** Short rooms use up content 2–3 times faster, so the full Well needs about 24 rule doors (FO §9.2). The slice ships 12 (DEC §6), and SHOULD adds `moth_library` and `sunken_bucket`. This batch brings the Well to **26 rule doors, balanced 7 ♠ · 7 ♦ · 7 ♣ · 5 E**, plus the 6 E variants.

**Bestiary.** The batch adds 12 pages. With the slice (14), `moth_library` and `sunken_bucket`, the Well's Bestiary reaches **28 pages**. FO §4.3 estimated about 24.

**How it ships.** It ships as a free update to the Well. The debut rule (DEC §5) puts the new monsters in front of returning players before door 10 of their next climb.

**Budget.** All twelve pass 05's Definition of Done with at most one new monster script each.

| id | Display name | Suit | Skulls | Budget | Shared-fate gimmick | Homage / wish |
|---|---|---|---|---|---|---|
| `crayfish_snap` | The Crayfish Snap | ♠ A | 2 | M | Skipping rope for eight, plus a two-frog bell rope | party physicality |
| `leech_ford` | The Leech Ford | ♠ A | 2 | S | Picking friends' leeches off | cheap-failure comedy |
| `rat_king` | The Rat King | ♠ A | 3 | M | Passing its attention like a relay baton | chase comedy |
| `strider_pond` | The Strider Pond | ♠ A | 1 | S | One splash scatters everyone's ride | Frogger, TEAMBOUND Downstream |
| `cuckoo_call` | The Cuckoo's Call | ♦ B | 2 | M | One wrong croak resets the whole phrase | Echo Chamber; the pentatonic croak |
| `crab_shells` | The Shell Game | ♦ B | 2 | S | Eight pairs of eyes, one shell each | the party-game classic |
| `glowworm_sky` | The Glow-worm Ceiling | ♦ B | 2 | M | Tongue a stuck friend down | the first false sky (WORLD Law 3) |
| `newt_brigade` | The Fire Newt | ♣ C | 2 | M | A bucket brigade, mouth to mouth | slapstick |
| `tadpole_herd` | The Nursery | ♣ C | 2 | S | A line of frogs herding | TEAMBOUND Delivery |
| `twin_well` | The Twin Wells | E | 3 | M | One input, two bodies | glitch E; user's "1a 1e" |
| `still_clock` | The Stopped Clock | E | 3 | M | In DUO, time moves when *either* frog moves | the user's "and time" |
| `upside_well` | The Upside-Down Well | E | 3 | M | The lantern-carrier decides where down is for both | glitch E |

### 5.1 ♠ Body

**`crayfish_snap` · The Crayfish Snap** · ♠ A · 2 skulls · M
- **Rule:** "Ring the far bell. Be off the floor when it clicks twice." (12 words)
- **Room and cue.** A 4 m crayfish sits in a flooded side-cellar with its claws across the room like a skipping rope. The claws glow `#FF9E5E` and click twice, 1.5 s before a floor-level sweep 0.4 m high crosses the whole room. The sweep line is painted on the floor as it comes.
- **Punishment and gimmick.** Every frog must be airborne as it passes, so eight frogs hopping in time is a skipping-rope party. A mistimed frog is flipped (1 spot) and tagged "Tripped: Pip". The bell hangs 20 m away on a **two-frog rope**, so both pullers must hop in step while pulling.
- **Clears.** Obvious: ring the bell. **Hidden:** tongue its antenna into its own claw during a click. It snips its own antenna and sulks in the corner.
- **Twists.** Sweep tempo (every 4 s or 3 s) and path (side to side, or rotating); floor holes where the sweep dips.
- **Rank lanes.**
  - Hop II clears the 2.3 m "double sweep" when both claws stack. Air Hop takes two sweeps in one airtime. Hop IV's stomp pops pebble-shrimp mites.
  - A Tongue II grapple to the ceiling roots hangs you out of a sweep. Long Tongue pulls both bell ropes alone.
  - Croak II staggers the shrimp. Thunder Croak staggers the crayfish for 2 s, which freezes the rope.
- **Bestiary tip:** *"Two clicks, then the sweep. Count, then hop."*

**`leech_ford` · The Leech Ford** · ♠ A · 2 skulls · S
- **Rule:** "Cross the ford. Leeches cling to whoever stands still." (9 words)
- **Room and cue.** A knee-deep ford, 30 m across, with reeds and stepping stones. The **Leech Mother**, a 5 m leech coiled in the deep channel, sends leech waves: the water ripples glow `#B7FF6A` 2 s before each wave.
- **Punishment.** A frog moving slower than 0.5 m/s for 1.5 s in the water gains a leech. Each leech is −20% speed, and 3 leeches mean you're stuck. A wave costs a stuck frog 1 spot.
- **Gimmick.** A friend's tongue pops a leech into fireflies. The clip is a frog crawling with three leeches while two friends haul it.
- **Clears.** Obvious: everyone across. **Hidden:** carry the salt stone from the far bank's shrine back into the channel. Every leech lets go, and the Mother curls up asleep.
- **Twists.** Which stepping stones are loose; the wave timing.
- **Rank lanes.**
  - Hop II reaches the 2.3 m reed stumps (a dry route). Air Hop crosses the deep channel.
  - Tongue II grapples the overhanging roots. Long Tongue plucks two leeches at once.
  - Croak II's 6 m pulse knocks every leech off every frog in range (the de-leech croak). Thunder Croak staggers the Mother and cancels a wave.

**`rat_king` · The Rat King** · ♠ A · 3 skulls · M
- **Rule:** "Wind it round three posts. It chases the last frog it saw." (12 words)
- **Room and cue.** Seven cellar rats with their tails knotted into one rolling wheel of fur, 2 m across. It chases the **last frog it saw**: its view is a gaze cone out to 8 m. When it locks a new target, all 14 eyes flash `#FFE45C`, and it lunges 1.0 s later.
- **Gimmick.** The party passes its attention like a relay baton. A frog who hides too long leaves someone else as the only frog it can see.
- **Clears.** Obvious: lead it around three stone posts until its tails wrap, and it is stuck and squeaking. **Hidden:** lead it past the puddle where it sees itself. It chases its own reflection in circles until it is dizzy.
- **Twists.** Which 3 of 5 posts; and in some seeds it chases the **second-to-last** frog it saw. The tell is that its eyes flash twice.
- **Rank lanes.**
  - Hop II reaches 2.3 m barrels it can't climb. Air Hop jumps its lunge.
  - Tongue II grapples a post for a tight swing-wrap. Long Tongue snatches the cheese-rind lure from 6 m.
  - Croak II's 1 s stagger lets you break its line of sight. Thunder Croak staggers it for 2 s.

**`strider_pond` · The Strider Pond** · ♠ A · 1 skull · S
- **Rule:** "Ride the striders across. One splash scatters them all." (9 words)
- **Room and cue.** A still pond, 40 m across, with no pads. Giant water striders (1.5 m, 3 m/s) are the only platforms, and you ride one by landing on it. A frog landing in the water **splashes**, and every strider bolts to the edges for 3 s, dumping its rider. In the water, the **Diving Beetle** (3 m) goes for the splashiest frog. Its shell glints `#5CE1FF` under the surface 2 s before it rises.
- **Gimmick.** One splash scatters everyone's ride, and it is always somebody's fault.
- **Clears.** Obvious: everyone on the far bank. **Hidden:** tongue two striders together. They link legs and become a raft for the whole party.
- **Twists.** 5 or 7 striders; their loop paths.
- **Rank lanes.**
  - Hop II reaches the 2.3 m reed perches. Air Hop saves a missed landing with no splash.
  - Tongue II pulls a strider close. Long Tongue links two striders (the hidden clear).
  - Croak II pushes striders 2 m away (herding). Thunder Croak staggers the beetle.

### 5.2 ♦ Mind

**`cuckoo_call` · The Cuckoo's Call** · ♦ B · 2 skulls · M
- **Rule:** "Croak its song back on the bells. It pecks wrong notes." (11 words)
- **Room.** A 3 m wooden cuckoo lives in a clock-tower alcove. Five bell-stones stand in a ring, each ringing one pentatonic note and self-lit in its colour: C `#FF6B6B`, D `#FFA94D`, E `#FFD166`, G `#6BE38F`, A `#6BB8FF`.
- **The game.** The party croaks the phrase back on the stones, with at most 1.2 s between notes. Three rounds: 3 notes, then 4, then 5. Round 3 contains a two-note chord (two stones within 0.3 s).
- **Cue.** Before each phrase its doors fly open and its eye glows.
- **Punishment.** A wrong note shoots it out on its spring to peck whoever rang it (1 spot), and the round restarts.
- **Gimmick.** The phrase belongs to the whole party. One wrong croak resets everyone, and Chorus Boons shine here.
- **Clears.** Obvious: finish round 3. **Hidden:** croak the round-3 phrase **backwards**. The cuckoo sings itself to sleep inside its clock.
- **Twists.** Where the stones sit in the ring; which round holds the chord.
- **Rank lanes.**
  - Hop II reaches the two stones on 2.3 m shelves. Air Hop crosses between shelves.
  - Tongue II grapples to the far stones. Long Tongue rings a stone with a spat pebble.
  - Croak II's 6 m pulse rings far stones. Twin Toll plays the chord alone. Thunder Croak staggers the cuckoo mid-peck.

**`crab_shells` · The Shell Game** · ♦ B · 2 skulls · S
- **Rule:** "Find the shell hiding the bell. It pinches whoever lifts a wrong one." (13 words)
- **Room.** A hermit crab the size of a cart shuffles five shells across a sand floor like a street hustler, faster each round. One shell hides the exit bell.
- **The Mind trick.** Croak at a shell: a full shell echoes low, an empty one high, and a ring in that pitch's colour flashes on the sand. You lift a shell by tongue-pulling it (20 kg, Tongue I).
- **Cue.** Its eyestalks glow `#FF8FA3` before a pinch.
- **Punishment.** A wrong lift costs 1 spot, and it reshuffles.
- **Gimmick.** Eight frogs, eight pairs of eyes: each frog tracks one shell.
- **Clears.** Obvious: lift the right shell. **Hidden:** tongue the crab out of its **own** shell. The bell was in there all along.
- **Twists.** 5 or 7 shells; the shuffle pattern.
- **Rank lanes.**
  - Hop II reaches a 2.3 m rock with a clear view of the shuffle. Air Hop dodges a pinch.
  - Tongue II lifts from 4.5 m, outside its 2 m pinch. Long Tongue lifts two shells at once.
  - Croak II reaches 3 shells with one pulse. Twin Toll tests two at once. Thunder Croak freezes it mid-shuffle.

**`glowworm_sky` · The Glow-worm Ceiling** · ♦ B · 2 skulls · M
- **Rule:** "Follow the frog stars to the true exit. The lying stars are sticky." (13 words)
- **Room.** A cavern whose roof is a false starfield of glow-worms. It is the Well's first painted sky, foreshadowing ★2.
  - There are four exits, and constellations point to them.
  - The true exit is under the **frog-shaped** constellation.
  - One lying frog-constellation twinkles off the beat, 0.9 s instead of 1.0 s (GDD §6.5's off-beat tell).
  - **The constellations only line up from the 2.3 m reading ledges**, which makes rank II the reading spot.
- **The monster.** The **Lure Spider** hangs sticky glowing threads among the real glow-worm threads.
  - Touching a lure sticks you for 3 s, and then it reels you up (1 spot) unless a friend tongues you down.
  - **Cue:** a lure brightens `#C6FF8A` and twitches 2 s before a reel.
- **Clears.** Obvious: reach the true exit. **Hidden:** tongue two lures together. The spider reels up its own knot of thread and hangs there, embarrassed.
- **Twists.** Exit positions; which constellation lies.
- **Rank lanes.**
  - Hop II reaches the reading ledges. Air Hop hops clear of a twitching lure.
  - Tongue II grapples, but lures look like anchors. Long Tongue tests a thread safely from 6 m.
  - Croak II stuns cave-moths. Twin Toll dims the real glow-worms for 3 s while the lures stay lit, which reveals the web. Thunder Croak staggers the spider and drops everyone it has reeled up.

### 5.3 ♣ Together

**`newt_brigade` · The Fire Newt** · ♣ C · 2 skulls · M
- **Rule:** "Put out the fire newt. Water only travels mouth to mouth." (11 words)
- **Room.** A 3 m salamander wanders a boiler cellar with 5 flame spots on its back, leaving a trail of fire. The water is in a pool 20 m away.
- **The brigade.**
  - A frog gulps water (Tongue on the pool) and holds it for 6 s before it boils off as steam from its ears.
  - Spit it at a frog within 3 m and that frog catches it, which resets the 6 s.
  - Spit it at the newt from 4 m or closer to douse one flame.

  So the party forms a bucket brigade, mouth to mouth. A missed spit soaks the wrong frog, and the blame tag says whose spit it was.
- **Cue.** Its flames flare `#FF5A1F` and it turns 1.5 s before a 4 m fire-breath cone (1 spot) at the nearest frog holding water.
- **Clears.** Obvious: douse all 5 flames. **Hidden:** lure it into the pool with a lantern, since it chases warm light. Every flame goes out at once, and it sulks, steaming.
- **Twists.** Which 2 of 3 pools hold water; the fire-trail layout.
- **Rank lanes.**
  - Hop II takes a 2.3 m pipe shortcut. Air Hop crosses the fire trails.
  - Tongue II grapples along the pipes. Long Tongue holds 2 gulps.
  - Croak II blows out cinder mites. Twin Toll's knock-back shoves the newt 2 m. Thunder Croak staggers it.

**`tadpole_herd` · The Nursery** · ♣ C · 2 skulls · S
- **Rule:** "Herd the tadpoles home. The nymph snaps up strays." (9 words)
- **Room.** Twelve tadpoles wriggle in a shallow nursery, and home is a reed basket at the far end.
  - A croak pushes every tadpole within its pulse 3 m away.
  - A waddling frog within 2 m is followed.
- **The monster.** A 3 m **Dragonfly Nymph**, the real tadpole-hunter, prowls the weeds. A tadpole more than 5 m from every frog is a stray, and the nymph's hinged jaw shoots out and snaps it up.
  - The tadpole is fine: it is spat back out later. It is lost only for this room.
  - **Cue:** the nymph's eyes glow `#9CFF6B` and its jaw unfolds 2 s before it strikes.
- **Gimmick.** Herding needs a line of frogs. One croak at the wrong moment scatters everyone's tadpoles: the Delivery homage at sheepdog scale.
- **Clears.** Obvious: 8 of 12 home (6 of 12 with 3 frogs or fewer). **Hidden:** a perfect Chorus behind the herd (4 or more frogs within 0.3 s) sends every tadpole racing home at once.
- **Twists.** Basket position; reed-wall layout.
- **Rank lanes.**
  - Hop II reaches 2.3 m rocks with a view of the whole herd. Air Hop gets over the reed walls.
  - Tongue II carries one tadpole (1 kg) directly. Long Tongue carries two.
  - Croak II herds wide at 6 m. Twin Toll pushes two groups. Thunder Croak staggers the nymph.

### 5.4 E (solo or duo; glitch dressing)

Every E room gets glitch dressing (GDD §6.4): missing-texture patches and clocks ticking backwards. E rooms never cost a Team Life.

**`twin_well` · The Twin Wells** · E SOLO/DUO · 3 skulls · M
- **Rule:** "You are in both wells. Get both of you out." (10 words)
- **Room.** Two wells shown split-screen, and **your inputs drive your frog in both**. The layouts differ: a ledge in one is a gap in the other.
- **The monster.** The **Two-Headed Newt** has one head in each well. When one head sees your frog, the *other* head bites your other frog. The seeing head's eyes glow `#FF4DD8` 1.5 s before the bite.
- **DUO.** Each of you has a twin in each well, 4 bodies in all. Your twins share the wells, so you can boost each other's twin.
- **Clears.** Obvious: both of you on the two exit plates at once. **Hidden:** open the hole in the dividing wall so the two heads see each other. They argue and forget you.
- **Twists.** Which well gets which obstacles; the wall-hole position.
- **Rank lanes.**
  - Ledges sit at 2.3 m in one well and 1.4 m in the other, so Hop II and Air Hop matter differently per well.
  - Tongue II anchors exist in one well only, so your other twin flails; Long Tongue anchors are in both.
  - Croak II stuns glitch mites in both wells, because croaks echo across. Thunder Croak staggers both heads.

**`still_clock` · The Stopped Clock** · E SOLO/DUO · 3 skulls · M
- **Rule:** "Time moves only when you move. Ring the bell before it strikes." (12 words)
- **Room.** A clockwork chamber from the Chrono-Slime's family. **Room time runs at 0.05× while you stand still and at 1× at full speed**, scaling linearly with your speed (the SUPERHOT idea).
- **The monster.** The **Pendulum Mantis**, 4 m and built of clock hands.
  - Its pendulum sweeps the room, and clock-gears it has flung hang frozen in the air.
  - **Cue:** the pendulum glows `#9FE6FF` and ticks loudly on each backswing. The strike lands 2 s of room time later.
- **DUO.** Time moves when **either** of you moves. So one frog walking moves the other's world, and "stop moving!" is the whole comedy.
- **Clears.** Obvious: ring the bell beyond the pendulum's path. **Hidden:** while time is stopped, tongue a frozen gear and spit it at the pendulum's weight. The clock jams for good.
- **Twists.** The gear-hail pattern; the pendulum's swing axis.
- **Rank lanes.**
  - Hop II clears gears at 2.3 m. Air Hop repositions mid-air, but time moves while you do.
  - A Tongue II grapple counts as movement. Long Tongue snatches gears (the Bell-Eater class's quest).
  - Croak II shatters small gears. Thunder Croak staggers the mantis for 2 s of real time.
- **Why it's here.** The user asked for "modes and time". plan_0 read that as timed play, and this room makes time itself the toy.

**`upside_well` · The Upside-Down Well** · E SOLO/DUO · 3 skulls · M
- **Rule:** "Gravity follows the lantern. Bats bite whoever walks on their ceiling." (11 words)
- **Room.** A cube-shaped cistern, 12 m on a side. A carried lantern (5 kg) sets gravity: down points at whichever of the six faces the lantern is nearest to. When the lantern crosses a midplane, everyone tumbles for 0.5 s. **The exit is on the ceiling.**
- **The monster.** A bat colony roosts on one face, their ceiling. A frog standing on that face for more than 1 s is bitten (1 spot). The bats' eyes glint `#FFE45C` and they unfold 1 s before a bite.
- **DUO.** One frog carries the lantern while the other scouts, and the carrier decides where down is for both.
- **Clears.** Obvious: carry the lantern to the exit face without ever making the bats' face your floor. **Hidden:** set the lantern down on the bats' own face. Now they are the floor-dwellers, and they fall asleep in a dizzy heap.
- **Twists.** Which face the bats roost on; which face holds the exit.
- **Rank lanes.**
  - Hop II reaches 2.3 m wall ledges. Air Hop saves you during a tumble.
  - Tongue II grapples across faces. Long Tongue carries the lantern plus one more item.
  - Croak II stuns bat-moth mites. Thunder Croak staggers the colony for 2 s.

---

## 6. THE SKY: doors 21–40 [LATER]

**The feel.** You climbed out of a hole, and the sky turned out to be a floor: a sea of cloud with islands floating on it, under a dome that looks painted. Rooms are islands walled in by cloud (the WORLD **maze** format).
- **Dread rooms** are thunderhead interiors and night islands, where lightning is the self-lit tell.
- **Breathers** are sunlit islands with warm lanterns. The Sky's window breather looks through the dome's tear at the stars of Space.
- **Every Sky room is built for Glide.** Gaps are wider than a hop and narrower than a glide, and the rank-II ledges sit at 4.2 m (§2.2).

Each concept below is one room, with its id, suit, skulls, budget and rule on the first line.

### 6.1 ♠ Body

**`kite_hawk` · The Kite-Hawk** · ♠ A · 2 skulls · M · new. **Rule:** "Glide to the far island. It dives at whoever flies highest." (11 words)
A red kite-hawk circles three gaps of 12–18 m between islands. It dives at **the highest airborne frog**, after a 2 s tell: its shadow sharpens and a rising whistle plays from its position. A dive snatches the frog and drops it back on the previous island, minus a spot. That turns height into a role: one brave frog flies high on purpose as bait (a Leapfrog launch makes a great decoy) while everyone else glides low. **Hidden clear:** tongue the paper kite tied to the first island's post and fly it above the party. The hawk dives at the kite, tangles itself in the string and sulks on a branch. **Twists:** gap widths and gust timing; which way the hawk circles. **Lanes:**
- Hop: rank II reaches the 4.2 m launch perches (longer glides); Air Hop resets your height mid-glide so you can drop under a dive; Hop IV's 5.45 m launch crosses a gap in one flight.
- Tongue: the Tongue II grapple reaches balloon anchors floating mid-gap; Long Tongue snatches the kite string from 6 m.
- Croak: Croak II scatters the sparrow mites; Thunder Croak staggers the hawk mid-dive, so it pulls up.

**Bestiary tip:** *"It takes the highest flier. Fly low, or send someone high."*

**`windmill_giant` · The Miller's Mill** · ♠ A · 3 skulls · M · new. **Rule:** "Ride the sails up to the bell. Gusts blow off frogs clinging alone." (13 words)
A windmill island with four 14 m sails, turning once every 6 s. The bell hangs at the hub, 18 m up. The monster is **the Miller**, a stone toad-face set in the mill wall. Its cheeks puff and glow `#BFE3F5` 2 s before it blows a gust along one sail. A frog alone on that sail is blown off: it glides back down, minus a spot. **Two or more frogs within 1.5 m of each other on a sail hold on.** So the party climbs in huddles, and the funniest frog is the one who can't keep up with the sail's turn. **Hidden clear:** ride a sail to the top, drop through the Miller's mouth-window, and it coughs you up onto the hub bell. **Twists:** spin direction and speed (6 s or 5 s per turn); which sail the first gust takes. **Lanes:**
- Hop: Hop II reaches the 4.2 m sail roots; Air Hop jumps sail to sail.
- Tongue: the Tongue II grapple reaches the hub spokes; Tongue IV chain-grapples straight to the bell.
- Croak: Croak II stuns the seed-moth mites; Thunder Croak staggers the Miller, so there is no gust for 2 s.

### 6.2 ♦ Mind

**`mirror_toll` · The Mirror Toll** · ♦ B · 2 skulls · M. Specified in §4.1. It is the Mimic's Sky home.

**`cloud_maze` · The Cloud Maze** · ♦ B · 2 skulls · M · new (the user's maze). **Rule:** "Find the sunlit gap. The fog serpent follows every croak." (10 words)
An island walled into a maze by 6 m cloud walls, which no hop can clear (Hop IV reaches 5.45 m) and which you sink through after 1 s of standing on them. The exit, the sunlit gap, shows as a shaft of light, and 4 of the 12 wall pieces drift to new places every 20 s. **A croak blows a hole through a cloud wall for 3 s.** That is the tempting shortcut. But **the Fog Serpent**, a 20 m eel made of cloud, slides toward the last croak it heard. Its path thickens and glows `#9DB4D8` 2 s before it arrives, and its touch costs a spot. So the Mind question is *who* croaks, where, and whether to take the long way. **Hidden clear:** three croaked holes in one straight line within 1 s (a Chorus line) let sunlight through, and the serpent drizzles away as harmless rain for the rest of the room. **Twists:** which walls drift; where the serpent starts. **Lanes:**
- Hop: Hop II reaches the 4.2 m lookout posts that show the whole maze for 2 s; Air Hop lets you hop across the top of a wall before you sink.
- Tongue: the Tongue II grapple reaches balloon anchors over the walls; Long Tongue pulls a friend through a hole before it closes.
- Croak: Croak II's pulse punches a hole 6 m deep; Twin Toll opens two holes; Thunder Croak blows a 9 m tunnel but calls the serpent at once.

### 6.3 ♣ Together

**`leaf_raft` · The Wind River** · ♣ C · 2 skulls · M · new (the TEAMBOUND **Downstream** homage). **Rule:** "Ride the leaf down the wind river. Lightning strikes the highest frog." (12 words)
A 6 m sycamore leaf rides a 60 m river of wind between islands, and three bells on passing islands must be rung on the way.
- **Steering:** the leaf tilts and turns toward the heavier side. A croak into its curled sail adds 2 m/s.
- **The monster:** the **Thunder Carp** leaps from the cloud-sea alongside. The highest point on the raft glows `#F4F7FF` and crackles 1.5 s before its bolt, which knocks the highest frog off (the updraft returns it to the leaf, minus a spot).
- **The comedy:** ringing a bell means one frog must go high, stacking is punished, and "everyone lie down!" is the call.

**Hidden clear:** tongue the drifting brass wind-vane and hold it up. The bolt hits the vane and launches the leaf 40 m forward, to the end of the river. **Twists:** where the river bends; which side each bell island is on. **Lanes:**
- Hop: Hop II and Air Hop leap to an island bell and glide back to the leaf.
- Tongue: the Tongue II grapple swings the leaf round a bend by an island anchor; Long Tongue takes a bell rope from 6 m.
- Croak: Croak II rings bells at 6 m; Twin Toll rings two bells; Thunder Croak staggers the carp, so there is no bolt for 2 s.

**`wind_organ` · The Wind Organ** · ♣ C · 2 skulls · M · new (Echo Chamber, in the open air). **Rule:** "Blow the squall off the island with one chord. It eats lone croaks." (13 words)
**The Squall** is a small, furious storm-cloud with a face. It rolls across a hilltop island pushing frogs toward the edge at 3 m/s, and five hollow reed pipes stand among the rocks.
- **A chord:** 3 or more frogs croaking into pipes within 0.3 s blows the Squall back 10 m.
- **A lone pipe croak feeds it:** +10% size and push.
- **The tell:** it darkens to `#5B6B8C`, lightning flickers inside, and it inhales 2 s before each burst.
- **The clear:** push it off the edge three times, and it rains itself out into a sulking drizzle.

**Hidden clear:** all five pipes in one chord. The organ plays the layer's motif (WORLD §2), and the Squall turns into a rainbow. **Twists:** pipe positions; the Squall's approach path. **Lanes:**
- Hop: Hop II reaches the two 4.2 m pipes on the crag, out of the push; Air Hop gets you back after a push.
- Tongue: the Tongue II grapple pulls you from a pushed-back spot to a pipe; Long Tongue holds a friend at a pipe against the wind.
- Croak: Croak II reaches a pipe from 6 m, from behind a rock; Twin Toll voices two pipes; **Thunder Croak counts as a chord of three by itself.** That is where a Mastery can stand in for a team.

### 6.4 E

**`slime_squall` · Slime Squall** · E SOLO/DUO · 3 skulls · S · the **Chrono-Slime**, re-homed. It reuses `slime_foundry`'s script. **Rule:** "Herd it into the snow cloud with the wind." (9 words)
The Chrono-Slime got loose in the clouds. Its dash, its reflections and its breath-line tell (it pauses and paints its next dash) are exactly as in `slime_foundry` (05). The Sky changes the tools:
- **six wind vanes** replace the valves. A 1.5 s Tongue hold turns one and raises or drops a wind wall that the slime won't dash through;
- **a snow cloud** with a drawstring replaces the cold store.

Glide changes everything: a gliding frog hovers above its dash line, where it can't reach. But a gust can blow you into its path, and a frozen friend becomes a wall in mid-air. **Hidden clear:** the GDD's "Sleeper", kept: be frozen *inside* the snow cloud as it closes. **Twists:** which vane raises which wall; where the snow cloud sits. **Lanes:** `slime_foundry`'s lanes, re-authored at Sky thresholds.

### 6.5 ♥ Heart

**`heart_last_updraft` · The Last Updraft** · ♥ · 2 skulls · S · new. **Rule:** "This updraft lifts three frogs and the jar. The next lifts everyone." (12 words)
A storm island is crumbling, and an updraft column rises to the exit island. **The first updraft holds three frogs and the room's jar.** Its riders split the jar's unbanked fireflies, which is the announced loot. **The second updraft comes 20 s later, double-wide, and carries everyone.**
- **The temptation:** shove your way into the first three. Shoves work as everywhere, and inside a Heart door a full tongue yank is also legal after its 0.6 s tell (FO §5.4). A Knotted frog can Cut to get free.
- **The co-op answer:** nobody boards. Everyone waits 20 s under the heron shadows, which cost a spot per hit, and then **the Tower adds ×1.5 to the jar, split among everyone.**

It is a marshmallow test with shoving. A frog who rides the first updraft gets the Betrayal Cam at the exit (`[ TRAITOR ]`), the WANTED poster, and the victim's Vengeance quest, all per DEC §4 and FO §5.2. **Bots:** Vex boards at once when the Drama Director allows it (FO §5.3 limits apply); Moss always waits.

### 6.6 Set pieces

**`hollow_toad` · The Hollow Toad** · set piece · 3 skulls · L. Specified in §4.3. It is the TEAMBOUND **One Body** homage.

**`sp_babel_tower` · The Tower of Babel** · set piece · 3 skulls · L · the TEAMBOUND **Tower of Babel** homage, grown up from `toy_frog_stack`. **Goal:** "Build a tower of frogs to the dome's tear." The whole set piece runs on the Frog Stack toy's physics: frogs stand on heads, the stack wobbles, and gusts push it every 20–40 s. It has three stages:
1. **Stack** to a floating island 7 m up.
2. **Tongue-lock the tower and topple it.** Every frog holds Tongue on the frog above for 1 s, which makes the stack rigid. Tip it over, and it lands across a 10 m gap as a bridge of frogs that the rest walk over.
3. **Stack again** to ring the bell hanging under the tear, 12 m up. Lightning strikes the highest point every 8 s after a 1.0 s sky-flash, so the party must stack, ring with a croak from the top, and scatter before the strike.

Fail at the 150 s cap. **Hidden clear:** an 8-frog tower in stage 1, with a Chorus from the top frog, makes the island lower itself to you. **Growth binds here too:**
- the base frog's Hop rank adds launch height (+0.5 m per rank above I);
- a rank-II Tongue holds the lock 2 s longer;
- Croak rank sets the bell's ring range.

### 6.7 Toy, Keeper and Warden

**`toy_kite_race` · Kite Race** · toy door · S. A 30 s downhill glide through 10 cloud rings, with gusts. Each ring pays loose fireflies, and the jar is Bronze at 4 rings, Silver at 7 and Gold at 10. The Rivals race too, and Kestrel always cuts a ring and claims it counted.

**`keeper_hawk_raft` · Hawk over the River** · Keeper, door 30 · 2 skulls · M (reuses `leaf_raft` and `kite_hawk`). **Rule:** "Ring 3 bells from the leaf raft. The hawk takes the highest frog." (13 words)
The Well's Keeper was a golem on a raft. The Sky's is a hawk over one (§2.3). The leaf rides the wind river past three bell islands. Both taught dangers hunt the **highest** frog: the hawk's dive and the carp's lightning. So every bell ring needs one frog to go high for a moment, timed between dives, while the rest keep the leaf level and low. It lasts about 90 s and ends in Party Rank Up (FO §4.1). It has no hidden clear, like every Keeper (FO §4.1 yield table).

**`warden_thunder_heron` · The Thunderhead Heron** · Warden, door 40 · 3 skulls · L (DEC §7 LATER).
- **Arena:** a 40 m island inside a thunderhead.
- **The heron:** 30 m tall, standing in the cloud-sea. Its crest is a bronze bell (WORLD §9.2's "thunderhead bell", whose drop is telegraphed by lightning).
- **Foreshadowing:** its shadow crossed the Well at door 3A and the Sky at 23A. On entry: `[ WARDEN · THE THUNDERHEAD HERON ] It has been watching you since the Well.` (A line naming door 3 could be false for a player who took 3C, and the System never lies.)

The three phases (about 180 s):
1. **The old doors (~50 s).** Lightning drops three earlier monsters in cloud bubbles at their old numbers (for example `bell_golem`, `heron_shadow` and `kite_hawk`), and the party flattens each in about 15 s. This is the power lap.
2. **The Tower of Babel (~70 s).** The crest-bell is 12 m up, and the heron lowers its head, curious, toward the tallest stack. Lightning strikes the highest point every 8 s after a 1.0 s flash. A Chorus of 2 or more frogs from the top of the stack rings the bell once, and 3 rings end the phase.
3. **The Sky Catch (~60 s).** Its wingbeats blow frogs off the island one at a time. The System calls each name 2 s ahead: `[ CATCH ] Pip.` The blown frog tumbles for 3 s, and any gliding frog that tongues it inside that time slings it back (the spot-catch, scaled up). A dropped frog is returned by the updraft after 3 s, minus a spot. When everyone has had a turn, the heron bows its head, the storm opens, the tear widens to 40°, and ★2 plays.

### 6.8 The Sky's pool at launch

| Source | Rooms |
|---|---|
| **New rule doors (7)** | `kite_hawk`, `windmill_giant`, `mirror_toll`, `cloud_maze`, `leaf_raft`, `wind_organ`, `slime_squall` |
| **Re-dressed rule doors (5)** at Sky thresholds | `bell_golem` and `heron_shadow` (from `sky_preview`); `lily_raft`; `echo_warren` (a cloud warren); `snapper_crossing` (a cloud-egg carried island to island by glide) |
| **Heart doors** | `heart_last_updraft` (new); `heart_two_pads`, `heart_split_swallow`, `heart_tied_bridge` and `doppelfrog`, re-dressed |
| **Set pieces** | `hollow_toad`, `sp_babel_tower` |
| **Toys** | `toy_kite_race`, plus the Well's toys re-dressed |
| **Bestiary pages** | 8 new: 6 rule monsters (the Kite-Hawk, the Miller, the Mirror, the Fog Serpent, the Thunder Carp, the Squall), the Keeper and the Warden. The Chrono-Slime keeps its Well page. |

---

## 7. SPACE: doors 41–60 [LATER]

**The feel.** The painted dome was a patch on a planet. Now the party works through a derelict station in orbit (the WORLD **dungeon** format): decks, bulkheads, airlocks and dead modules in violet and neon.
- **Every frog wears the Moon Toad fishbowl helmet,** with its hat floating inside.
- **Drift makes every hop a commitment.** Gravity is ×0.25 and there is no air deceleration, so the Tongue's grapple is how you steer.
- **Dread rooms** are dark modules lit by floodlights and neon tells.
- **Breathers** are floodlit decks where the planet fills the window, and the window breather shows the magenta nebula of the Beyond.

### 7.1 ♠ Body

**`ash_axeman` · The Ash Axeman** · ♠ A · 3 skulls · M. Specified in §4.2. It is the Karmic Executioner's home.

**`vacuum_bell` · The Silent Bell** · ♠ A · 2 skulls · M · the **Echo Golem**, re-homed. **Rule:** "Ring 3 bells by tongue. When its eyes glow, touch nothing." (11 words)
A bell-golem cast in hull bronze stands in an airless module with two small air domes.
- **Outside the domes a croak makes no sound at all.** The bells ring only by **tongue contact**: the controller rumbles and a ring of light pulses out from the bell.
- **The golem hears through the hull.** When its eyes glow `#4DF3FF` (a 2 s tell), anything touching a surface (floor, wall or bell) is felt, and swiped for a spot.
- So the door-2 rule *freeze* becomes *float*: hop off before the glow and drift through it untouched. Space physics has turned the first lesson of the game inside out.

**Hidden clear:** lure the golem into an air dome by landing loudly beside it, then croak at its body. It hears itself ring for the first time, sits down and hums. **Twists:** where the bells and domes sit; the glow cadence. **Lanes:**
- Hop: Hop II reaches the 9.2 m perches; Air Hop changes your drift mid-air, so you can stay off the floor longer.
- Tongue: the Tongue II grapple reaches the anchors; Long Tongue rings a bell from 6 m; Tongue IV chain-grapples between bells without touching down once.
- Croak: croaks work only inside the domes: Croak II stuns mites there; Twin Toll rings the two dome bells together; Thunder Croak staggers the golem when it is in a dome.

**Bestiary tip:** *"It can't hear you in a vacuum. It can feel your feet."*

### 7.2 ♦ Mind

**`orbit_clock` · The Orrery Toad** · ♦ B · 2 skulls · M · new. **Rule:** "Make the three moons eclipse the sun. Stay out of their shadows." (12 words)
A brass orrery, 20 m across, fills a dome.
- **The model:** a sun-lamp at the hub, and three moons on arms with periods of 6, 9 and 18 s. They line up on their own only every 18 s, and never quite on the painted mark on the dome.
- **The controls:** a tongue-pull on a moon's lever slows it by 1 s for one orbit; a push speeds it up.
- **The monster:** the **Orrery Toad**, a clockwork toad at the hub. It snaps its 10 m tongue at any frog standing in a moon's shadow when an eclipse is 2 s away. The shadow edges glow `#FF4DD8` as the tell.

It is a room of prediction: watch one orbit, nudge two levers, and step out of the shade. **Hidden clear:** ride a moon arm through the eclipse yourself, as the fourth moon. The toad laughs so hard it lets you through. **Twists:** periods of 6/9/18 or 4/8/12 s; the mark's angle. **Lanes:**
- Hop: Hop II reaches the 9.2 m moon arms; Air Hop steers mid-drift.
- Tongue: the Tongue II grapple reaches the arm anchors; Long Tongue works two levers at once.
- Croak: Croak II stuns gear-mites; Thunder Croak staggers the toad.

**`hull_crawler` · The Hull Crawler** · ♦ B · 2 skulls · S · new. **Rule:** "Reach the hub. It follows the footprints you leave." (9 words)
A spinning ring-deck where "down" is outward and the hub at the centre is weightless. **Every footstep leaves a glowing magnetic footprint** (`#4DF3FF`) that lasts 6 s. The **Hull Crawler**, a 4 m hull-louse, follows the prints and bites whoever made the freshest one. Its feelers glow and it speeds up 2 s before it reaches you. A hop through Drift leaves no prints, so the Mind puzzle is planning a print-free route up the spokes toward less gravity, and laying decoy prints to pull it away from friends. **Hidden clear:** walk a closed loop of prints, and it follows its own tail around it forever. **Twists:** spoke layout; spin rate. **Lanes:**
- Hop: Hop II reaches the 9.2 m spoke ledges; Air Hop steers mid-drift.
- Tongue: the Tongue II grapple reaches the spoke anchors (a grapple leaves no prints); Long Tongue pulls a friend off a fresh print.
- Croak: Croak II stuns print-mites, which leave fresh prints of their own; Thunder Croak staggers the Crawler.

### 7.3 ♣ Together

**`hot_signal` · The Hot Signal** · ♣ C · 2 skulls · S · new (the TEAMBOUND **Delivery** homage). **Rule:** "Carry the signal to the dish. The static eats whoever holds it long." (13 words)
A glowing signal orb (2 kg) must cross a 60 m drifting cargo bay, from the radio room to the dish. **The Static**, a crackling cloud of noise, homes in on whoever has held the orb for more than 3 s. The holder's screen edge fizzes and the orb whines 1 s before the Static strikes, costing a spot and dropping the orb. So the orb is a hot potato. You pass it by tongue-spitting it to a friend, and in Drift a spat orb flies dead straight forever, so a miss sails across the bay while everyone chases it. **Hidden clear:** pass it 10 times without it touching anything, and the Static tunes in and turns into music. **Twists:** the bay's crate layout; where the dish sits. **Lanes:**
- Hop: Hop II reaches the 9.2 m crate tops (a shorter passing line).
- Tongue: the Tongue II grapple carries you with the orb held; **Long Tongue catches a spat orb from 6 m**, which is the passing lane.
- Croak: Croak II stuns static-mites; Thunder Croak staggers the Static, so it can be held for 5 s.

**`water_globe` · The Water Moon** · ♣ C · 3 skulls · L · new (the TEAMBOUND **Deep Dive**, second home). **Rule:** "Pull three relics from the water moon. The jellyfish stings the slowest." (12 words)
A 20 m sphere of floating water hangs in a zero-g chamber, and three relics orbit slowly inside it. You can dive in from any side. It uses `sunken_bucket`'s swim and air tech:
- **Air:** the Moon Toad helmet holds 30 s, and it fogs up as the air gets low, so the gauge is the helmet itself.
- **Leaving:** a frog who kicks out of the sphere keeps drifting until it grabs an anchor.
- **The monster:** the **Glass Jellyfish** drifts toward the **slowest-moving** frog in the water. Its bell pulses `#B06CFF` 2 s before it wraps you: 1 spot, and stuck for 2 s.
- **Shared fate:** relics are tongue-thrown out of the sphere to a catcher outside, and air bubbles are passed from helmet to helmet.

**Hidden clear:** all eight frogs gather in one clump at the centre. The jellyfish mistakes the clump for a bigger jellyfish and leaves. **Twists:** relic orbits; where the anchors float. **Lanes:**
- Hop: rank II's kick breaks the surface tension out of the sphere; Air Hop is a double kick.
- Tongue: the Tongue II grapple reaches the anchors; Long Tongue holds 2 relics.
- Croak: Twin Toll blows an air bubble (+5 s to every frog within 4 m); Thunder Croak staggers the jellyfish.

### 7.4 E

**`watcher_satellite` · The Dead Satellite** · E SOLO/DUO · 3 skulls · S · the **Glitched Watcher**, re-homed. It reuses `glitch_eye`'s script. **Rule:** "Never look at the eye. Drift blind to the three humming panels." (12 words)
A dead satellite's lens is the Watcher's eye, leaking in from the Beyond (WORLD Law 3), in heavy glitch dressing. Its six solar panels stand in for `glitch_eye`'s pillars: three hum and three don't, and you topple the three that hum. The gaze cone and hum rules are `glitch_eye`'s (05). **Drift is the difference:** you can't stop to aim, so looking away while you are sailing past is the skill. **Hidden clear:** tongue the satellite's own dish round to face the lens. The eye sees itself, freezes in a feedback loop, and every panel drops.

### 7.5 ♥ Heart

**`heart_moon_banquet` · The Moon Banquet** · ♥ · 2 skulls · L · the **Liar's Banquet**, re-homed. **Rule:** "One cup is poisoned. One diner lies once. One of you knows." (12 words)
Six clockwork diners sit at a low-gravity banquet with their cups floating in front of them.
- **Testimony:** wind a diner with a tongue hold of 1 s and it speaks one of its two testimonies, shown to everyone within 10 m. **The poisoner lies exactly once** (GDD §6.5, kept).
- **The frog-native proof:** swallow a cup and hold it for 3 s, and **your glowing belly backlights it** (hero_0 §2). The poisoned cup shows a skull-shaped bubble. It is public evidence, and nobody can fake it. Swallowing the poisoned cup costs 1 spot, and you hiccup violet for 10 s.
- **The Taster.** One frog is privately told who the poisoner is:
  - in friend and private lobbies with 3 or more humans, it is a human;
  - otherwise it is a bot seat, and only humans vote, while bots point only at public evidence (DEC §8.2 #12).
- **The vote.** A frog lights the Verdict Candle (a 2 s Tongue hold). For 15 s, frogs sit behind the diner they accuse, and the majority convicts.
- **The temptation:** if the table convicts the wrong diner, **the Taster takes the room's jar**. That is announced, unbanked loot.
- **The co-op answer:** belly-test the cups in front of everyone and convict the right diner. **The jar pays ×1.5, split among everyone,** and a Taster who pushed for the wrong diner gets the Betrayal Cam at the exit.

The Clue Composer, the Pinch, the Second Accusation and every Soot rule stay cut (DEC §8.3). The room differs from `doppelfrog` on purpose: there, you find the monster among the frogs; here, you work out the liar among the diners while one of *you* is lying.

### 7.6 Set pieces

**`sp_spacewalk` · The Spacewalk** · set piece · 3 skulls · L · the TEAMBOUND **Chained ascent** homage (`sp_tongue_tether`'s script). The whole party is clipped to one line, in 4 m segments. They must cross 120 m of the station's outer hull, including a debris field, while a solar-flare front climbs the hull behind them at 1.2 m/s. A frog caught by the front loses a spot every 3 s, like the rising water in the Well version.
- **In Drift, momentum is shared:** one frog's push moves the whole chain, and one frog launching drags everyone. It is shared fate at its purest.
- **Handholds:** tongue-anchor handrails every 4.5 m.
- **Debris:** tumbling panels cross every 6 s, with a 1.5 s glint as the tell.
- **Unclipping** is consensual: both ends hold Tongue on the segment for 1 s.

**Hidden clear:** the whole chain tongues the antenna mast's ring through one full orbit and slingshots past the debris field. The set piece fails at its 150 s cap (FO §3.7).

**`sp_oxygen_spire` · The Oxygen Spire** · set piece · 3 skulls · L · the TEAMBOUND **Summit** homage (`sp_grip_wall`'s per-frog ring, with oxygen in place of grip). A climb up the station's 80 m antenna spire, with "down" pointing at the station at ×0.25 gravity.
- **Each frog has its own oxygen ring** (per frog, as in PEAK; FO §10.5). It drains 1 per second outside and 3 per second while grappling hard.
- **Three glowing canisters** on the way refill it, and you can tongue a canister to a friend.
- **At 0 oxygen** a frog goes limp and drifts until a friend tongue-hauls it to a canister.
- **Solar wind** pushes sideways every 15 s.

**Hidden clear:** ride the rotating dish's rim as a slingshot past the middle third.

### 7.7 Toy, Keeper and Warden

**`toy_zero_g_stack` · Zero-G Frog Stack** · toy door · S · the TEAMBOUND **Tower of Babel** homage in zero-g. Two beacons hang 20 m apart, and the party links them with a chain of frogs, head to foot and tongue to foot. Each frog is about 0.9 m plus a 3 m tongue, so eight frogs can reach about 31 m. The jar goes by how fast the beacons connect: Bronze under 30 s, Silver under 20 s, Gold under 12 s. The stack can grow in any direction, and it wobbles in all of them.

**`keeper_axe_pod` · The Axeman's Pod** · Keeper, door 50 · 3 skulls · M (reuses `ash_axeman` and `vacuum_bell`). **Rule:** "Ring 3 bells by tongue. The axe hunts the brightest frog." (11 words)
The Space Keeper rides the layer's vessel, a cargo pod drifting across a floodlit hangar (§2.3).
- The Ash Axeman stands mag-booted on the pod, and hunts the frog with the highest light value within 10 m.
- The silent bells hang on the hangar walls, and they ring only by tongue.
- So frogs launch off the pod, ring a bell, and grapple back, using the pod's ash vents to go dark before they land.

It lasts about 90 s and ends in Party Rank Up.

**`warden_chan_chu` · Chan Chu, the Moon Toad** · Warden, door 60 · 3 skulls · L (DEC §7 LATER; FO §6.3). **Arena and Warden:**
- The arena is the moon's surface, at Drift gravity.
- Chan Chu is 40 m tall and three-legged, as in the legend. It is jade `#3FBF8F` with gold warts `#FFC94A`.
- **In its mouth is a Wish Coin 6 m across, with a square hole.** "Coin" still means only Wish Coins.
- On entry: `[ WARDEN · CHAN CHU ] A frog, like you. It has been climbing much longer.`

The three phases (about 180 s):
1. **The spinning coin (~50 s).** Each time the coin spins, an old monster climbs out of its square hole at its old numbers, and the party flattens it.
2. **Pull the Coin (~70 s).** Every frog tongues the coin, each at its own rank's reach, and a tug meter sums the pullers. Every 12 s Chan Chu inhales: its cheeks swell violet `#B06CFF` for 2 s, then it draws drifting frogs into its mouth. A swallowed frog is spat out 4 s later, minus a spot; croak inside and you are out at once, with no spot lost (as in §3.2). **Three pulls with at least 75% of the frogs pulling together for 2 s** pop the coin free.
3. **The Drift Catch (~60 s).** The moon's pull switches off. One at a time, as the System calls them, frogs float away at 2 m/s. A friend must chain-grapple across the floating moon-rocks and tongue-catch each one before it passes 30 m. When every frog is caught, Chan Chu laughs with a croak that shakes the moon, and the coin shatters into a rain of Wish Coins (+20 each, counted in the results). Then ★3 plays.

### 7.8 Space's pool at launch

| Source | Rooms |
|---|---|
| **New rule doors (7)** | `ash_axeman`, `vacuum_bell`, `orbit_clock`, `hull_crawler`, `hot_signal`, `water_globe`, `watcher_satellite` |
| **Re-dressed rule doors (5)** at Drift thresholds | `snake_coil` (floating plates); `web_spider` (a cable spider in a server bay); `moss_snail` (a hull limpet in the dark); `fog_stair` (a coolant stair full of steam); `lamp_knight` (lamps in airlocks) |
| **Heart doors** | `heart_moon_banquet` (new), plus the 4 Well Heart doors re-dressed |
| **Set pieces** | `sp_spacewalk`, `sp_oxygen_spire` |
| **Toys** | `toy_zero_g_stack`, plus the Well's toys re-dressed |
| **Bestiary pages** | 7 new: 5 rule monsters (the Ash Axeman, the Orrery Toad, the Hull Crawler, the Static, the Glass Jellyfish), the Keeper and the Warden. Two returning monsters keep their Well pages: `vacuum_bell` stamps the Bell-Golem's, and `watcher_satellite` stamps the Glitch Eye's. |

---

## 8. BEYOND: doors 61–80 [LATER]

**The feel.** The galaxy was a drop of water on a filament. Now the party climbs through clusters of rooms strung along a glowing filament (the WORLD **maze of dungeons** format), in nebula fog `#FF8FD0` with moss-green glints `#7CC46A`. Every glint is a hint of what ★4 will show.
- **Light-rails** (01) are the layer's verb: a tongue on a glowing filament slides you along it at 12 m/s. `late_stars`, `comet_rodeo` and `sp_light_rope` are built along filaments so the rails matter inside rooms too.
- **Light-Lag is the layer's rule.** In rooms that opt in, anything more than 15 m away shows you the past, while sound and hits are always live (§2.1). So the Beyond teaches one lesson over and over: **trust what you hear and what your friends call out over what you see.** That is the team game, turned into physics.
- **Dread rooms** are dead-star interiors.
- **Breathers** glow in the nebula, and the window breather shows moss-green glints the size of galaxies.

### 8.1 ♠ Body

**`late_stars` · The Late Stars** · ♠ A · 2 skulls · M · `LIGHT_LAG` · new. **Rule:** "Cross the filament. The falling stars you see have already landed." (11 words)
A 50 m filament path runs over the void while stars rain down on it. Because of Light-Lag, a distant star is drawn up to 1.5 s *after* it has actually struck. The honest cue is live: **a star's shadow on the filament**, a dark ring rimmed in `#7CC46A` that shrinks for 2 s before impact. Players learn to ignore the pretty falling light and watch the ground. A hit costs a spot and knocks you off, and the filament catches you 3 s later. **Hidden clear:** catch three falling stars out of the air with Long Tongue, which can snatch projectiles. The sky wants them back and stops throwing. **Twists:** the star rhythm; where the filament forks. **Lanes:**
- Hop: Hop II reaches the 4.2 m knots in the filament (a safer high route); Air Hop dodges a late read.
- Tongue: the Tongue II grapple reaches the anchor-motes; Long Tongue catches stars (the hidden clear).
- Croak: Croak II pops the stardust mites; Thunder Croak shatters a star in the air above you.

**`comet_rodeo` · The Comet** · ♠ A · 3 skulls · M · `LIGHT_LAG` · new. **Rule:** "Ride the comet through the gate. It bucks off anyone riding alone." (12 words)
A 6 m icy comet circles the cluster, and you ride it by tongue-grabbing its tail. Every 4 s it bucks: its core flares `#DDF6FF` 1 s before, and it throws off any rider with no other frog within 1.5 m. It is a buddy rodeo. Riders steer it together by leaning, with inputs summed as in `toy_bigtoad`. The goal is a ring-gate 30 m away that must be passed while at least four frogs are riding. The gate is far enough away that its turning opening is drawn late, so the party must aim ahead of what it sees. **Hidden clear:** all eight frogs ride as one tongue chain (the Chained homage). The comet gives up and parks in the gate. **Twists:** the gate's spin; the comet's orbit. **Lanes:**
- Hop: Hop II and Air Hop remount after a buck.
- Tongue: Long Tongue grabs the tail from 6 m; the Tongue IV chain re-catches a thrown friend.
- Croak: Croak II calms the ice-mites that loosen your grip; Thunder Croak staggers the comet, so there is no buck for 2 s.

### 8.2 ♦ Mind

**`retrace_map` · The Map Room** · ♦ B · 2 skulls · M · new. **Rule:** "Walk this climb's last doors in order. It erases wrong steps." (11 words)
The floor is the ring map itself, 30 m across: the user's "layers from center to outwards circle" as a room.
- **The tiles:** every door of this Beyond climb so far is a stone tile, numbered and lettered (61, 62B, 63, 64C …). The sides the party *didn't* take are there too.
- **The task:** walk the party's actual path, the **last 6 doors**, in order. The path is honestly shown on the pause map, and checking it is allowed. The fun is the argument: "No, we took the C door!"
- **The monster:** the **Eraser**, a moth made of pencil shavings. It rubs out the tile of a wrong step, and the frog on it drops to the ring below, minus a spot. It hovers over the tile it will erase next, which smudges and glows for 2 s.

**Hidden clear:** walk the first 6 doors of the host profile's most recent **Well** climb instead. The Eraser recognises an older map and gives up. **Twists:** tile spacing; the Eraser's start. **Lanes:**
- Hop: Hop II and Air Hop cross the gaps left by erased tiles.
- Tongue: Tongue II grapples the ring's rim; Long Tongue pulls a falling friend back up.
- Croak: Croak II scatters the shaving mites; Thunder Croak staggers the Eraser.

**`afterimage` · The Afterimage** · ♦ B · 3 skulls · M · `LIGHT_LAG` · new. **Rule:** "It is never where you see it. Listen, and ring the bells." (12 words)
The Afterimage keeps at least 22.5 m from you, so **you only ever see where it was 1.5 s ago** (22.5 m ÷ 15 m/s). Its footfalls, though, are live, positional drumbeats, which makes this the Beyond's stealth room. Ring 3 bells while tracking it by ear.
- It grabs frogs for a spot.
- **Accessibility:** a captioned direction arrow shows its footfalls (09's readability channel), so deaf and hard-of-hearing players get the live cue too.

**Hidden clear:** lure it across the still mirror-pool, where its lagging image and its live body overlap. It sees its own afterimage and follows that away instead. **Twists:** bell and pool positions. **Lanes:**
- Hop: Hop II reaches the 4.2 m bell ledges.
- Tongue: the Tongue II grapple is a silent way to move; Long Tongue rings a bell from 6 m.
- Croak: Croak II gives you a live echo map for 2 s; Thunder Croak staggers it.

### 8.3 ♣ Together

**`slow_light_knight` · The Slow-Light Knight** · ♣ C · 3 skulls · M · `LIGHT_LAG` · the **Harmony Sentinel**, re-homed (`lamp_knight`'s script). **Rule:** "Snuff its lamps so it sees them die together." (9 words)
The Harmony Sentinel's last post: a lamp-knight at the centre of a star cluster, with five lamps on pedestals at 6, 12, 18, 24 and 30 m.
- **The knight sees by slow light.** This is the room's own rule, separate from the layer's render lag: a lamp's darkness reaches its eyes d ÷ 20 m/s late, which is 0.3, 0.6, 0.9, 1.2 and 1.5 s.
- **So the snuffs must be staggered, farthest first,** so that all five lamps die inside a 1.0 s window **as the knight sees it**. Its lantern-head is a live mirror of its view, so the party can check. Do it twice.
- **The caller.** A bot caller counts a staggered call: "Far — go! … Middle! … Near!"
- **Punishment:** a lamp that goes out of time is a sour note. The knight's halberd swings at whoever put it out (1 spot), as in `lamp_knight`.

**Hidden clear:** tongue its lantern-head's shutter closed mid-swing, with Long Tongue. It sees nothing at all, so every lamp is dark to it at once. **Twists:** which 5 of 7 pedestals are used; and in some seeds the lamps must die in a **painted order** (CRIT #11). **Lanes:**
- Hop: Hop II reaches the pedestals on 4.2 m rocks.
- Tongue: Long Tongue snuffs from 6 m.
- Croak: Croak II snuffs from 6 m; Twin Toll snuffs two lamps that are the same distance away; Thunder Croak staggers the knight.

**`choir_bridge` · The Choir Bridge** · ♣ C · 2 skulls · S · new (**Echo Chamber**). **Rule:** "Sing the bridge into being. It fades when nobody sings." (10 words)
A 40 m gap lies between two clusters.
- **Building:** hold Croak (sustain) at a lectern stone and a bridge of light grows 1 m/s for each frog singing.
- **Breath:** a sustain lasts up to 6 s, and then that frog must breathe for 2 s.
- **Fading:** with nobody singing, the bridge fades at 1 m/s.
- **The monster:** the **Moth of Silence** lands on the quietest stretch and eats it. Its wings darken that section 2 s before it lands.

So the party keeps a relay of singers and walkers going, and breath becomes the co-op rhythm. **Hidden clear:** a Chorus of 4 frogs within 0.3 s. The croaks are pentatonic, so any four harmonise, and the whole bridge appears at once. **Lanes:**
- Hop: Hop II and Air Hop cross short gaps.
- Tongue: Tongue II grapples across eaten sections; Long Tongue carries a singer.
- Croak: rank II makes a sustain build 1.5 m/s; Twin Toll counts as two singers; Thunder Croak staggers the moth.

### 8.4 E

**`paradox_mirror` · The Paradox Mirror** · E SOLO/DUO · 3 skulls · M · the **Paradox Mirror** from the brief (CRIT #10: "a third E room"). **Rule:** "Your reflection lives 1.5 seconds ago. Get both of you through." (11 words)
A mirror-plane splits the room, and on the far side walks your reflection: mirrored, **solid**, and exactly 1.5 s behind you. Light-Lag made personal. Your reflection is a real body: it presses plates, rings bells, and you can hop onto its head because it stands where you stood.
- **The monster:** the **Paradox**, a frog-shaped hole in space. It hunts whichever of you or your reflection is closer. If it touches your reflection, *you* lose the spot. Its rim flares `#FF8FD0` 1.5 s before it lunges.
- **The obvious clear:** you and your reflection on the two exit plates at the same moment. You arrive at yours and stand still for 1.5 s.
- **DUO:** each frog's reflection walks on the other's side, so two frogs and two pasts must share the room.

**Hidden clear:** lead the Paradox across the mirror-plane after your reflection. It sticks halfway through the glass and stays there. **Twists:** plate positions; where the mirror-plane sits. **Lanes:**
- Hop: Hop II reaches 4.2 m plates (your reflection reaches its own copy 1.5 s later).
- Tongue: the Tongue II grapple hooks exist only on the reflection's side; Long Tongue reaches across the plane.
- Croak: Croak II stuns the mirror-mites; Thunder Croak staggers the Paradox.

### 8.5 ♥ Heart

**`heart_guilt_scale` · The Weight of Guilt** · ♥ · 2 skulls · M · the **Weight of Guilt**, re-homed with **no Ledger, no Soot and no memory of earlier doors** (see Open questions). **Rule:** "Your shade weighs what you hold. Pass it on, or walk it down." (13 words)
The floor is a hanging brass pan, 16 m across, over the void (GDD §6.6's scale, joined with §6.10's shades). The exit bridge extends only while the pan stays level (under 1°) for 3 s.
- **The shades.** Every frog is followed at 3 m by a grey shade of itself, the GDD's Regret without the Ledger. **A shade weighs 1 kg for every unbanked firefly in that frog's cheeks right now**, and it looks darker as it gets heavier.
- **The pan tilts** toward the heavier side. Past 3°, frogs on the low side slide toward the rim.
- **A fall** costs a spot and spills 20% of your unbanked fireflies. Inside a Heart door, whoever catches them keeps them (FO §4.1).
- **The temptation (announced):** tongue-tag another frog to **pass your shade to them**. The tell is 0.6 s, with your shade flickering betrayal-crimson. Now their side sinks, they may slide and spill, and you can be the one below to catch it.
- **The co-op answer** (the GDD's Empathy): walk exactly in your shade's footprints, which glow `#CDEBFF` and fade after 6 s, for 8 s in total. Your shade bows and dissolves, and **you keep your fireflies**. When every shade is gone, the pan levels itself and the Tower adds a jar for everyone.

A pass that makes someone spill plays the Betrayal Cam at the exit and gives the victim a Vengeance quest (DEC §4). The room reads only this room's cheeks. Nothing about earlier doors is shown or stored, and nothing is counted.

### 8.6 Set pieces

**`sp_moss_wall` · The Moss Wall** · set piece · 3 skulls · L · the TEAMBOUND **Summit** finale (`sp_grip_wall`'s per-frog grip ring). A climb up one stone of a colossal wall. Each brick is the size of a house, and the moss is the Well's own moss, `#557D33`, from the same bake as the Well's walls (WORLD ★4).
- Moss holds dry out, and friends tongue-haul each other up.
- Light-Lag means a friend more than 15 m above you is drawn late, so you haul on the call, not on the picture.
- **The foreshadow:** it must not spoil ★4. Players see only a stone wall. The match with the Well's bricks lands in ★4 itself (01 owns that).

**`sp_light_rope` · The Light Rope** · set piece · 3 skulls · M · the **Chained ascent** homage (`sp_tongue_tether`'s script). Tongue-tied pairs cross a 90 m filament while its light goes dark behind them at 1 m/s.
- The filament more than 15 m ahead is drawn up to 1.5 s late, so its gaps appear late. The front pair calls them with pings, which are live.
- "Hop now!" is the whole game.

### 8.7 Toy, Keeper and Warden

**`toy_lag_tag` · Lag Tag** · toy door · S. The Jar Tag rules (`toy_jar_tag`) under Light-Lag, in a 40 m glass deck. Past 15 m, the frog wearing the jar is drawn up to 1.5 s late, so from across the deck it is always closer than it looks. The screams are real.

**`keeper_echo_golem` · The Echo Golem** · Keeper, door 70 · 3 skulls · M · the **Echo Golem**'s last stand, riding a comet (§2.3). **Rule:** "Ring 3 bells. When its eyes glow, freeze. It echoes every croak." (12 words)
The door-2 golem is back, grown to 30 m and riding a comet around the cluster. On entry: `[ KEEPER · THE ECHO GOLEM ] Door 2 remembers you.`
- **The bells are on its own back.** Every croak it hears it **echoes 1.5 s later from its own body** (the Echo Toad's Replay, turned into a monster). So you croak at it from far away, and its echo rings its own bells.
- **The freeze rule returns,** but Light-Lag shows its glowing eyes late. Its hum, rising a fifth before the glow, is live. So you freeze on the **sound**, which is the lesson `late_stars` taught.
- It lasts about 90 s and ends in Party Rank Up.

**`warden_the_watcher` · The Watcher** · Warden, door 80 · 3 skulls · L (DEC §7 LATER). The **Glitched Watcher**'s true form. The glitch eye at 17E and the dead satellite in Space were its leaks (WORLD Law 3).
- **Arena:** a mossy stone ledge in the dark, with a vast eye opening above.
- On entry: `[ WARDEN · THE WATCHER ] It has been looking in since the Well.`

The three phases (about 180 s):
1. **The gaze (~50 s).** Old monsters light up wherever the eye looks, and the party flattens them at their old numbers, without once meeting its gaze. The gaze-cone numbers are `glitch_eye`'s (05).
2. **The pillars (~70 s).** "Never look at the eye. Topple the three pillars that hum." — `glitch_eye`'s rule at colossal scale, with 40 m moss stalks as the pillars. The eye is 60 m away, so its sweeping gaze is drawn 1.5 s late, but its hum is live. Turn away on the hum.
3. **The Last Fall (~60 s).** The eye closes in a 0.4 s blink, the only blink in the game (WORLD ★4), and the ledge drops away. The party falls **outward**, because up is outward (WORLD Law 4).
   - One at a time, as the System calls them, each falling frog must be tongue-caught by the end of a growing chain within 3 s. Each catch adds that frog to the chain.
   - A frog who is dropped rejoins the end of the chain after 3 s, minus a spot.
   - When all eight are linked, the chain lands on the rim, and **★4 The Revelation** plays: the nearest giant on the rim is a frog, like you (FO §6.3).
   - The eye, this file proposes, was that frog's eye, looking down into its own well (see Open questions; 01 owns the choreography).

### 8.8 The Beyond's pool at launch

| Source | Rooms |
|---|---|
| **New rule doors (7)** | `late_stars`, `comet_rodeo`, `retrace_map`, `afterimage`, `slow_light_knight`, `choir_bridge`, `paradox_mirror` |
| **Re-dressed rule doors (5)**, opted in to `LIGHT_LAG` where marked | `echo_warren` (a filament maze; LIGHT_LAG); `heron_shadow` (a star-heron's shadow; LIGHT_LAG); `snapper_crossing` (a star-egg); `moth_library` (star charts); `lily_raft` (a raft of light on a filament river) |
| **Heart doors** | `heart_guilt_scale` (new), plus the 4 Well Heart doors re-dressed |
| **Set pieces** | `sp_moss_wall`, `sp_light_rope` |
| **Toys** | `toy_lag_tag`, plus the Well's toys re-dressed |
| **Bestiary pages** | 8 new: 6 rule monsters (the Late Stars, the Comet, the Eraser, the Afterimage, the Moth of Silence, the Paradox), the Keeper and the Warden. The Slow-Light Knight stamps the Lamp-Knight's Well page. |

---

## 9. LATER modes

### 9.1 Mimic Climb [LATER]

**What it is.** "A single hidden Mimic for a whole climb, for private lobbies of 4+ humans. This is the full Among Us wish, kept out of the core loop until the core is proven fun" (FO §5.2; DEC §7 LATER). It is the user's first-named inspiration ("mafia, among us") at full size.

**Who and where.**
- **Friends and private lobbies only, with 4–8 humans.** Rivals may fill empty seats, but **a Rival is never the Mimic and never votes.** A Rival only points at public evidence (DEC §8.2 #12).
- **Opting in.** The host switches it on in the lobby. The four entrance doors then show a ♥ on their plaques, so every frog opts in by walking through.
- **Scope:** any layer the lobby has surfaced, Quick or Full Climb, any difficulty.

**Keeping betrayal announced.** Real betrayal happens only where it is announced (DEC §4). In Mimic Climb **the whole climb is announced**: every plaque carries a small ♥ in its corner. The Mimic's powers switch off in toy doors, at Landings and in the Meeting room, so the waltz stays safe.

**The draw.** At the hatch, the host-only salt picks one human (FO §5.4 #5). Only that frog sees: `[ SECRET ROLE: MIMIC ] Steal their light. Don't get voted out.` The Mimic looks exactly like its owner's frog.

**The Mimic's two powers.** Both are server-authoritative, and both carry a full tell (FO §5.4).

| Power | Input | Effect | Tell | Limit |
|---|---|---|---|---|
| **Steal** | Tongue-tag a frog within 3 m | Takes 20% of that frog's **unbanked** fireflies (the Doppelfrog rule, FO §5.2) | A 0.6 s cheek puff and a crimson tongue tip | 25 s cooldown; never touches banked fireflies, Glow, Boons or spots |
| **Rile** | Hold Power for 1.2 s inside a rule door | The monster fires its next cue **now**. The cue is real, and the System reports it as usual. | The Mimic's eyes blink sideways for the whole hold, visible within 6 m (the Doppelfrog tell) | Once per rule door |

Beyond these two powers, the Mimic is a normal frog. The mischief caps and the fairness contract apply to it in full.

**Votes.**
- **When:**
  - in a Full Climb: at Landing 1, the Keeper Landing, Landing 3, and the doorway of the Warden;
  - in a Quick Climb: at Landing 1 and the Keeper Landing.

  Mimic Climb Landings last 60 s instead of 40 s, to hold the 20 s vote.
- **How:** each human, tadpole ghosts included, picks a frog or **Skip** on the Wheel. A majority of humans convicts. A tie, or a Skip majority, convicts nobody.
- **A correct vote:** `[ MIMIC FOUND ]`.
  - A Betrayal Cam montage plays up to 3 of its tells, 0.8 s each.
  - **Every stolen firefly returns to its owner,** and the party gains +1 Team Life.
  - The Mimic wears the WANTED poster for one door, then keeps playing as an ordinary frog.
- **A wrong vote:** `[ NOT THE MIMIC ]`. The party loses 1 Team Life (on Easy, nothing), and the accused frog plays on.

**Winning.**
- **The party wins** the moment it votes the Mimic out.
- **The Mimic wins** if it survives the last vote, or if the Team Lives reach 0 first.
- **Either way the climb plays on and pays as normal** (FO §4.4). The outcome changes only a cosmetic callout on the results card, `Unseen Mimic` or `Mimic Hunters`. **No stat counts steals or betrayals** (DEC §8.3).

**Rivals in Mimic Climb.** They never vote and are never the Mimic. When a Rival *saw* a public tell within 6 m, it pings the frog it saw: "Saw that." It never uses hidden information (FO §5.3).

**Before it ships.** It rides FO §9.3's A/B test on suspicion (secret quests in Heart doors, on vs off), and it needs a "Worth it?" score per mode.

**Kit:**
- a role draw with the host salt;
- the vote on the Wheel;
- the Betrayal Cam montage (reused);
- a ♥ badge on every plaque.

### 9.2 Daily Seed [LATER]

**What it is.** One shared seed per day, with a leaderboard validated from replays, and **no streaks** (FO §3.6; DEC §7 LATER). It answers the user's "levels are randomized" with a shared puzzle for the day.

**The seed.**
- `seed = hash(UTC date, layer, build constant)`, one per layer the lobby has surfaced. Every client computes it, so there is no server.
- Yesterday's seed stays playable, unranked.

**Fixed format for a fair board:**
- a Full Climb on Normal, under the seeded-climb rules (DEC §5);
- **Rank Sync is forced on** (talents off), and only open classes are allowed;
- Sealed is off;
- 1–8 seats.

**Boards.** Two boards per layer: **Solo** (1 human) and **Party** (2–8 humans), each with Friends and Global views.
- **Score** = best door reached, then time: `door × 100000 + max(0, 99999 − seconds)`. A Warden clear counts as door 20, 40, 60 or 80.
- **Attempts are unlimited,** and the best one counts. Each attempt pays RP and Pearls as usual, and Well-Rested applies (it rewards breaks, not attendance).

**What it never does** (FO §8.4): no streak, no daily bonus, no expiring reward, and **no countdown on screen**. The hub map shows "Today's seed" and a teaser of its first 3 plaques.

**Validation.** "Replay-validated" needs care, because there is no server.
1. The host submits the score with an attached replay file (the Steam leaderboard calls are owned by 10). The file holds the seed, the door sequence, the clear time of every door, the party size and an input digest.
2. Any client that shows the top 50 performs a **plausibility check** on each attached replay:
   - the door sequence must regenerate from the seed;
   - every door's clear time must be at least that room's `minClearSec`, a RoomDef field set to 0.8 × the fastest clear seen in the 7-bot soak;
   - the door times must add up to the total.
3. Entries that fail are hidden locally and reported.

Full physics re-simulation is **not** promised, because PhysX isn't deterministic across machines (see Open questions).

---

## 10. Build notes: what this file asks of the kit and the pipeline

### 10.1 New kit pieces

Each piece is built once and reused. The field names are proposals; 05 and 10 confirm them.

| Kit piece | First used by | Reused by | Size |
|---|---|---|---|
| `Listener` (listen cycle, loudness threshold, pounce) | `moth_library` | `afterimage`, `vacuum_bell` (felt through the hull) | S |
| `SwimController` + `WaterVolume` + per-frog air + bubble projectile | `sunken_bucket` | `water_globe` | L |
| Swallow state (the frog hidden inside, a camera cut, spat out; croak to escape) | `sunken_bucket` | `warden_chan_chu` | M |
| `SummedInputController` | `toy_bigtoad` | `hollow_toad` (one per station), `comet_rodeo` | M |
| `ReflectionTemplate` (a frog body copied through `IHeroBody`) | `mirror_toll` | `paradox_mirror` (a copy delayed 1.5 s) | M |
| `PhysicsProfile` (gravity scale, air damping, Glide, gusts) | `sky_preview` | every later layer | M |
| `LightLag` view (details below) | the Beyond rooms | — | M |
| APV lighting-scenario blend (lit and dark) | `ash_axeman` | `keeper_axe_pod`, `hull_crawler` | S (UT) |
| `TimeScaleZone` (room time follows player speed) | `still_clock` | — | S |
| `GravityVolume` (down points somewhere other than −y) | `upside_well` | `hull_crawler` | M |
| Footprint decals (glow, fade, follow) | `hull_crawler` | `heart_guilt_scale` | S |
| RoomDef variant override (`variantOf`, `seats`) | the E variants | every later re-dress | S |

**The `LightLag` view.** Remote objects more than 15 m away are drawn from a client-side history buffer (1.5 s at 30 Hz), delayed by `min(1.5, d ÷ 15)` s (01's formula). **Colliders, hits and sound stay live**, so what hurts you is always where the live cue (a shadow or a sound) says it is. Only the picture lags.

### 10.2 Proposed RoomDef fields

These are added to 05's contract: `variantOf`, `seats`, `layer`, `layerRule` (`LIGHT_LAG` or none), `physicsProfile`, and `minClearSec`.

### 10.3 Counts

| Content in this file | Count |
|---|---|
| SHOULD rooms | 3 rooms (`moth_library`, `sunken_bucket`, `toy_bigtoad`), 6 E variants, and Sky Preview (5 doors re-dressed, no new scripts) |
| New rule doors | **35**: Well 2 SHOULD + 12 batch-two; Sky 7; Space 7; Beyond 7 |
| New Heart doors | 3 (one per later layer) |
| New set pieces | 6 (two per later layer) |
| New toys | 4 (`toy_bigtoad`, `toy_kite_race`, `toy_zero_g_stack`, `toy_lag_tag`) |
| Keepers and Wardens | 3 + 3 |
| New Bestiary pages | **37**: Well +14 (bringing the Well to 28), Sky 8, Space 7, Beyond 8 |
| Modes | 2 (Mimic Climb, Daily Seed) |

### 10.4 Order after the slice

Each step is a free named update (FO §8.1), and each one repeats the growth test, the soak and the reachability validator under its layer's physics profile.
1. The SHOULD list, in DEC §7's order.
2. **Well batch two.** It is the cheapest (no new physics) and extends the Well's replay life.
3. **The Sky.** It grows out of `sky_preview`. Mimic Climb can ship with it, once one layer past the Well is proven fun.
4. **Space.**
5. **The Beyond, with ★4 and Cycle 2.**

Daily Seed ships after the plausibility validator.

---

## 11. Open questions

1. **Weight of Guilt.** DEC §6 cut `weight_of_guilt` because it depended on Soot and the Ledger. The brief names it as a favourite monster, so this file re-homes it as `heart_guilt_scale`. That version reads only the unbanked fireflies in cheeks right now: no Ledger, no Soot, no portraits and no memory of earlier doors. If the chair rules that any Weight of Guilt breaks the cut, drop it; the Beyond's ♥ pool falls back to the 4 re-dressed Well Heart doors.
2. **Light-Lag inside rooms.** 01 and WORLD §9.1 keep everything inside a room live. This file lets Beyond rooms opt in (`LIGHT_LAG`) to 01's formula beyond 15 m, lagging only the *picture* while hits and sound stay live. `late_stars`, `comet_rodeo`, `afterimage`, `sp_moss_wall`, `sp_light_rope`, `toy_lag_tag` and the Watcher's phase 2 depend on it. `slow_light_knight`, `paradox_mirror` and `keeper_echo_golem` use their own room rules and don't. It needs sign-off from 01 and 10.
3. **Beyond movement.** DEC names "Glide, Drift and Light-Lag"; 01 adds Light-rails as the Beyond's verb, and this file adopts it. This file also keeps Sky gravity and Glide on in Beyond rooms, so the Sky's rank thresholds apply there. 01 should confirm that Glide carries over.
4. **The Tree Frog class in the Sky.** Its Signature, Glide Leap (1.5 s), duplicates the Sky's default Glide. A proposal for 04: Glide Leap lasts 3.0 s in the Sky and the Beyond, and becomes a 1.5 s mid-drift stop in Space.
5. **The Watcher as the giant frog's eye.** This file proposes that the Beyond Warden's eye belongs to the frog on the rim, and that its blink is ★4's blink. That touches the Revelation, which 01 owns.
6. **Mimic Climb and "betrayal only in Heart doors".** This file handles it with a ♥ on every plaque, opted into at the entrance. 03 should confirm that this keeps DEC §4's rule.
7. **Daily Seed validation.** Without a server, "replay-validated" can only be a plausibility check. Full re-simulation needs deterministic physics, which PhysX can't give across machines. If that isn't enough, Daily Seed needs a small validation service, which contradicts "there are no servers" (FO §10.4 #6).
8. **`moth_library` against judge_2's objection.** It is now hearing against the golem's sight. If playtests still read it as the golem, change its second sentence to "The moth hears every hop." That is a DEC §6 rule-text change.
9. **Every Keeper rides a vessel.** This series rule is inferred from DEC's fixed `keeper_bell_raft`. 05 should confirm it.
10. **Two hidden-role Heart doors.** With `doppelfrog` and `heart_moon_banquet`, suspicion may pile up. Let FO §9.3's A/B on suspicion decide whether the Banquet ships.
11. **Bestiary size.** The full Well reaches 28 pages against FO §4.3's estimate of about 24, so 7 Bestiary hats. 08 should budget the hats.
