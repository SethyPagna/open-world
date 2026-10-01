# KNOTWELL: master design decisions (chair's verdict)

**Version** 1.0 · **Date** 2026-09-29 · **Status: BINDING** for every master-design file in `_design/master/` (00–10).

**Order of authority** when sources conflict:
1. The user's own words (the four messages, and TEAMBOUND_13 as a reference).
2. **This file.**
3. `_design/FUN_OVERHAUL.md` (**FO**). It is binding except where §8.2 below amends it. FO itself is not edited; the master files carry the amendments.
4. `reports/Unity co-op party game tech stack.md` (**UT**) and `reports/Addictive tower game design research.md` (**RR**).
5. The parts bin: `_design/GDD.md`, `_design/WORLD_STRUCTURE.md`, `_design/GDD_CRITIQUE.md` (**CRIT**), `_design/inputs/`.

**How this verdict was reached.** Three judges ruled on the explore outputs (`_design/inputs/master_explore/`: name_0, name_1, plan_0 fidelity-first, plan_1 fun-first, plan_2 buildability-first):
- **J0**, the fun and clip-ability lens;
- **J1**, the buildability and commercial lens;
- **J2**, the creative director from the earlier run (`judge_2.md`).

The three were unanimous on the name, tagline, hero, core slice roster and most FO amendments. For split items, the rules were:
- the majority wins;
- a three-way split goes to the stronger argument;
- the user's words and FO outrank any panel.

Every split ruling is logged in §11.

---

## 1. Name

### KNOTWELL: "Climb together. Fall alone."

- **Hook (capsule and store):** *Tiny frogs. Monster doors. The sky is another well.*
- **★1 trailer and store line:** *Your sky is somebody's floor.* (taken from SKYFLOOR)
- **Heart-door copy:** *They might not cut it.* (taken from MIGHTKNOT)
- **Store trivia:** *A group of toads is called a knot.*

**Rationale.** KNOTWELL is the only candidate that carries both halves of the user's pitch in one word and also survives the collision checks.
- **"Knot" is the team game.** It is the tongue-tether and the Knot/Cut betrayal verb. It is also the real collective noun for toads, confirmed by grammar-monster.com, online-field-guide.com and gaggleofnouns.com. So the title reads as "a party of frogs in a well".
- **"Well" is the user's own image.** Because every sky is another well, the word names all four layers, not only the first.
- **Said aloud it is "not well"**, a free joke for the betrayal side.
- **It works for either hero**, so it survives the Wick fallback.

**Collision evidence.**
- **Search.** name_1 ran 37 WebSearch queries on 2026-09-28, and J0 and J1 re-ran them on 2026-09-29. None found a game called Knotwell on Steam, itch.io, Roblox or BoardGameGeek.
- **Nearest titles, none confusable:** Knotwords (Steam 1963900), Knot (575990), Unknot! (3544020), King's Well (4332200), KNOTICAL (itch.io), The Knot Game (BGG 136387).
- **Mishearing.** "Notwell" returns only a small itch.io collection handle (itch.io/c/4303963) and surnames.
- **Domains** (Verisign RDAP, 2026-09-29):
  - knotwell.com has been a Knotwell family blog since 2007 (registered 2007-03-07, expires 2028-03-07), so it is not pursued;
  - **playknotwell.com, knotwellgame.com and knotwell.gg are unregistered.**
- **The retired name.** The old KNOTSPIRE collided with the frog game Croakspire (Steam 3744870).
- **Trademark: formal clearance is not done.** Justia and Trademarkia returned 403 and the USPTO tmsearch API returned 405. A human must search USPTO (classes 9 and 41, optionally 28), EUIPO and KIPRIS **before any public use**.

**Runners-up, in fallback order:**
1. **FRAYWELL.** It evokes "farewell", a fraying rope and "the fray". fraywell.com is unregistered, and the only other uses are fictional (a *Shadows of the Apt* character, a town in a 2026 novel). This is backup 1 if clearance fails.
2. **SKYKNOT.** It has the cleanest collisions: no game, and the nearest match is the itch.io tabletop game "Knots in the Sky". But it drops "well", and skyknot.com is registered (skyknotgame.com is free). Backup 2.
3. **SKYFLOOR** (name_0's top pick). It states the reveal best, but it drops co-op, betrayal and "well". The registered SkyFloor® walkable-skylight product line also owns its search results. Its line survives as trailer copy.

**Name housekeeping.**
- **Logo:** draw the K as a rope knot, so the silent K reads.
- **Human tasks before any public use:**
  - the trademark search;
  - register playknotwell.com (primary) and knotwellgame.com, and optionally a notwell.* redirect;
  - claim the @playknotwell handles;
  - obtain a Steam Direct AppID (use Spacewar 480 until then).
- **The Unity project** stays at `KNOTWELL/` with productName `KNOTWELL`. It already matches the final title, so it needs no rename.
- **The root folder** "make me a name" becomes `KNOTWELL` only **after this workflow finishes and with the user's OK**. In the same step, update the hard-coded paths in `_design/workflows/*.js` and `HANDOFF.md`. `TEAMBOUND_13/` stays read-only.

---

## 2. Hero: the Firefly Frog (committed)

**Body**
- An upright, bean-shaped froglet with two dome eye-bumps on top.
- A round face with no lips and no droopy lids (the anti-Pepe rule).
- Dart-frog colours.

**Health and growth**
- **Health** is 3 emissive back spots, identical for every frog. The hitbox never changes.
- **Growth is light, never size.** Each Glow Level:
  - brightens the belly glow;
  - adds one orbiting firefly;
  - lights up the markings.
- **Awakenings** add parts on fixed sockets: a glowing tongue tip, a bigger throat sac. Each layer's **molt** adds parts the same way; the Sky's is the Glider molt (glide membranes).
- **Lv10** adds a firefly **Crown glow** halo.

**Verbs:** Tongue (grab, grapple, catch, carry; it is also Interact), charged Hop, Croak (pulse, sustain, revive, Chorus).

**How it is built**
- **Mesh:** made by a Blender-Python script. Blender 5.2 is installed.
- **Rig:** minimal, with fixed hat, face, back and belly sockets, so every hat fits every molt.
- **Motion is 100% procedural:**
  - hand-written 2-bone leg IK;
  - spring bones on the throat sac, eyes and hat;
  - a Catmull-Rom tongue tube with overshoot;
  - PrimeTween squash and stretch;
  - a local ragdoll layer that is never networked.
- There are no retargeted humanoid clips.

**Seat Hue**
- Each seat gets a fixed rim-light colour from an 8-colour, colour-blind-safe palette.
- It drives name tags and blame tags. A cosmetic never does.
- No cosmetic hue may sit within 15° of the betrayal crimson.

**Code contract**
- Every system talks to `IHeroBody`: `SetSpots`, `SetGlow`, `PlayAwakening`, `TongueOrigin`, `CroakFX` and the sockets.
- A capsule implements it first, then the Frog.
- **The Wick with a growing Flame axis** is the documented fallback: a second implementation of the same interface. Fireflies become flame motes, the tongue a wax-thread lasso, the croak a flare pulse.

**Why the frog (unanimous: J0, J1, J2, and FO §2.3)**
- **It puts the user's structural image in the player's body.** "Frog in a well, comes out of well sees the sky, then go to sky sees space." Every scale reveal lands on *you*, and the Revelation giant is your own species. The moon toad Chan Chu is a free Space Warden.
- **Its verbs are the clips.** The best moments are all frog verbs:
  - tonguing Kestrel off his pad (the first laugh);
  - catching a friend's knocked-out spot in mid-air;
  - a Frog Sling that misses;
  - a Chorus that comes out as one sad croak;
  - being swallowed and spat out;
  - the tongue-catch Trust Fall.

  The candle's defining image is shrinking, which is the "measures loss" fault FO §1.1 diagnosed.
- **It has a head for hats.** The shop needs one.
- **It is buildable by agents.** A scripted mesh plus motion in C# is more diffable, testable and screenshot-checkable than keyframed animation.

**Positioning rules.** These are binding because of a competitor verified by J1 and J2: Frog Sqwad (Steam 3989960, released 11 June 2026, up to 8-player co-op frogs that "eat to grow" into a Megafrog). Its all-time peak is 1,078 concurrent players, with 72% positive of 355 user reviews.
1. **Growth is light, never size or hitbox.** No Megafrog form.
2. **Store copy, capsule and trailer lead with** the well reveal, the monster doors and betrayal. They never say "eat to grow".
3. **Croak III "Big Voice" is renamed "Twin Toll".** It rings 2 bells at once.

**Gates, deferred but not waived.** Gate A (readability) and Gate B (Frog vs Wick-Flame on the same loop) run on the Milestone A build, with the user plus at least 4 friends as the first human testers.
- **If Gate A fails:** make **one remediation pass** (bigger spots, stronger rim contrast, a more upright pose), then re-test. Only after that does the Wick ship, as one new `IHeroBody`, not a rewrite.
- **If the Wick ships,** the frog survives as the Revelation silhouette, the hub statue and the Candle-Toad cosmetic line.
- **Before Gate A passes,** no frog-only public art is locked: no capsule, trailer, Warden art, Steam page or store copy.

---

## 3. The one-sentence fantasy

> **Hatch as a nobody frog at the bottom of a well, climb twenty monster doors with up to seven friends or scheming Rivals, grow absurdly stronger and brighter behind every door, and leap out to find the sky is the floor of a bigger well — if nobody cuts your knot first.**

---

## 4. Unified structure (summary)

**World.** KNOTWELL is one concentric world, read from the inside out: **the Well** at the centre, then **the Sky**, **Space** and **Beyond**. The Revelation is that the whole thing sits in a bigger well: *every sky is someone's well*.
- **Each layer's exit is the next layer's centre** (WORLD Law 1), and "up is outward" (Law 4).
- **The ring map** on the hub wall draws the layers as concentric bands. Doors spiral outward and forks branch as lettered lobes, so the user's "layers from center to outwards circle" is on screen at 0:00.
- **Door numbers run on across the world:** Well 1–20, Sky 21–40, Space 41–60, Beyond 61–80. "Best door: 37" is the brag, pinned next to friends' best doors.

**Climb.** The unit of play is a **Climb**: one layer's 20 numbered doors, as 4 floors of 5, climbing the strands of the Braid up the shaft.

| Stop | After | What it is |
|---|---|---|
| **Landing 1** | door 5 | A 40 s warm stop |
| **The Keeper** | door 10 | Mini-boss, then the **Keeper Landing**: a save point where the **Quick Climb** (about 11 min) ends |
| **Landing 3** | door 15 | A 40 s warm stop |
| **The Warden** | door 20 | Layer boss, then the reveal and results. The **Full Climb** runs about 24 min. |

- **The Mouth** is the sky opening overhead. It widens at every stop: **31° → 37° → 44° → 56° → 74°**.
- **A new layer re-hatches you at Lv1,** with that layer's movement verb switched on (Glide in the Sky) and a molt on the same rig.

**Doors.**

| Door type | Share of a climb | Length | Examples |
|---|---|---|---|
| Breather | ~40% | 15–30 s | jar, toy door, window, sleeping threat, gold door |
| Rule door | ~40% | 45–90 s; hard cap 150 s | — |
| Set piece | 2 per climb | 90–150 s | Grip Wall, Tongue-Tied Tether |
| Keeper / Warden | 2 per climb | ~90 s / ~180 s | — |

The average door is about 57 s.
- **Breathers** are single doors.
- **Every other door is a pair** (5B / 5C). Each plaque shows only four things: number and letter, suit, prize icon, and skulls.
- **The party chooses by walking.** 4 s after the first human steps into a doorway, the door with more humans opens.
- **Forks** let the party split into a group door and an **E** door (SOLO or DUO). Forks fall at doors 12 and 17 in the first climb, and at 7, 12 and 17 after that.
  - The halves rejoin at the two-lock **Meeting Door**: a key swap, one item through the window, and a rescue rope at 45 s.
  - When no human takes a side, **offstage Rivals** take it. They are parked, not simulated, and arrive with the second key.
  - At most 2 rooms are live at once.
- **Overlays:**
  - **gold doors:** the first climb's is seeded at door 9, later ones roll at 5%;
  - one **Rematch door** in doors 15–19;
  - **Heart doors (♥):** announced betrayal. From door 11 in the first climb, from door 6 later.

**Rooms.** Every rule door has one never-killed monster, one self-lit cue, one plain rule (≤14 words), an obvious and a hidden clear, 2 seeded Twists, rank-II and rank-III/IV lanes for all three verbs, mites, and one shared-fate gimmick. Rooms are data: a RoomDef JSON, generated into baked shells on a 300 m grid under the shaft.

**First climb and later climbs.**
- **Climb 1 of every profile is authored** (§5). It is identical and testable, has 5 systems before the Keeper, and adds exactly one new system per stop after it.
- **Later climbs** are seeded from one replicated number, under FO's constraints.
- **Climb 2 guarantees two never-met monsters before door 10.**

**Growth: three tracks.**
- **Body:** Glow Level 1–10 and verb ranks I–IV. Resets every climb.
- **Build:** Boons. Auto-granted before the Keeper, then a private pick 1 of 3.
- **Legend:** Tower Rank F→SSS, the Bestiary and classes. Permanent, and paid even on failure.

**Failure.** 3 spots; a knocked-out spot is catchable; Dark → tadpole ghost → croak revive. **Team Lives** by difficulty: Easy unlimited, Normal 3, Hard 2, Hell 1. A failed room pays 50% and costs a life; E doors never cost lives. Every climb ends in a results ceremony that pays.

**Sessions.** Quick Climb (the default), Full Climb, Resume from any Landing, **Landing Party** (a playlist of the toys), and **the Ascent** (4 Full Climbs to the Revelation; LATER beyond the Well). **Difficulty is chosen at the entrance:** four doors stand at the well bottom from 0:00, with Hard and Hell chained until they unlock for the lobby.

**Social.** 1–8 seats; Rivals fill every empty one. **Mischief** (shove, a 1 m tug) is always on and moves no value. **Real betrayal happens only in Heart doors** and ends in the Betrayal Cam, a WANTED poster and a Vengeance quest. Human-vs-human betrayal happens only in friends and private lobbies.

---

## 5. The authored first climb (solo + 7 Rookie Rivals, Normal)

Glow levels use FO §4.1's yields (k = 15, no hidden clears, gold door at 9). J0, J1, J2 and plan_1 all re-ran them with identical results. Clocks are greybox targets.

| Door | ≈ Clock | Room(s) | Growth (typical verb order) | New system / beat |
|---|---|---|---|---|
| 0 | 0:00–0:35 | `hub_well_bottom` → `hatch_pond` | 30 banked. **Lv2, TONGUE II** (~0:20) | Verbs and growth. Kestrel laugh ≤0:30. |
| 1 | 0:35 | `br_shove_door` | — | `DOOR 1` slams; Moss helps shove |
| 2 | 1:00 | `bell_golem` (fixed) | **Shatter Croak** auto-granted (~2:00) | Rule doors |
| 3 | 2:10 | 3A `heron_shadow` ♠ / 3C `lily_raft` ♣ | **Lv3, HOP II**; Boon | Door choice; team gimmick |
| 4 | 3:40 | `br_window` | — | First glimpse of scale |
| 5 | 3:55 | 5B `fog_stair` ♦ / 5C `snapper_crossing` ♣ (short, ≤55 s) | **Lv4, CROAK II**; Boon | The Hop II ledge: numbers bind |
| L1 | 4:45 | `landing_well` + `toy_frog_stack` (Mouth 37°) | Jar lineup | Rest and waltz. No stall yet. |
| 6 | 5:25 | `toy_fly_catch` | Jar | Toy door |
| 7 | 5:55 | 7B `echo_warren` ♦ / 7C `lamp_knight` ♣ | **Lv5: Tongue Awakening, Long Tongue** (~7:00); Boon | Bots gasp |
| 8 | 7:05 | 8A `snake_coil` ♠ / the unchosen door-5 room | Boon; a chance at the first hidden clear | — |
| 9 | 8:05 | `br_gold` (seeded) | **Moon Hop** auto-granted; **Lv6: Hop Awakening, Air Hop** | Jackpot |
| 10 | 8:55 | `keeper_bell_raft` | **Lv7: Croak Awakening, Twin Toll** | Keeper |
| L2 | 10:25–11:05 | Keeper Landing, ≤40 s of ceremony | See the ceremony below | **The Quick Climb ends and saves here** |
| 11 ♥ | 11:05 | `heart_two_pads` | First pick 1 of 3 after a clear | Heart door (Shove only). Staged bot betrayal (Vex on Moss): Betrayal Cam, WANTED. |
| 12 | 12:15 | Fork: 12B/12C (the unchosen door-7 room) / 12E `slime_foundry` (SOLO), then `meeting_room` + `toy_jar_tag` | **Lv8, Tongue IV** | Fork and Meeting Door. Moss's Vengeance lands here. |
| 13 | 13:25 | `br_jar_mites` | — | Secret quest: `[ HIDDEN CONDITION DETECTED ]` |
| 14 ♥ | 13:45 | `doppelfrog` (the "spot the Mimic" solo variant with fewer than 3 humans) | Boon | The Mafia / Among Us beat |
| 15 | 14:50 | `sp_grip_wall` | **Lv9, Hop IV** (~16:30) | PEAK set piece |
| L3 | 16:30 | `landing_well` (Mouth 56°) | — | A Rival offers the **Knot**; Knot, Cut and Duos unlock |
| 16 | 17:10 | `toy_lily_sumo` | Jar | Toy door |
| 17 | 17:30 | Fork: 17C `sp_tongue_tether` / 17E `glitch_eye` (SOLO/DUO) | Duo offered (Frog Sling) | Chained set piece |
| 18 | 18:40 | **Rematch** overlay on `bell_golem`: `OLD TIME 1:12 → 0:18` | **Lv10: Croak Mastery, Thunder Croak, Crown glow** | Steamroll |
| 19 | 19:10 | `br_sleeping_toad` | — | Dread, then a waltz |
| 20 | 19:30 | `warden_the_jar` (~3:00) | Power lap | Trust Fall |
| ★1 | 22:30 | ★1 Out of the Well (26 s; free look from 21 s), then `rim_surface` | +50 Pearls, first surfacing only | Results on the Rim; **Climb again / Rest** |

**Keeper Landing ceremony, in order:**
1. `[ CHOICE UNLOCKED ]` and the first pick 1 of 3 (8 s).
2. Party Rank Up.
3. Tower Rank F → E.
4. A player-steered pull-back up the shaft as the Mouth widens 31° → 44°, with a Wish Coin falling.
5. A free hat, and the stall opens.
6. `Something is waiting in 12E.`
7. **Climb on / Rest**, with equal weight.

**Growth check (cumulative banked fireflies):**

| Point | Pond | D3 | D5 | D7 | D9 (gold) | Keeper | D12 | D15 | D18 |
|---|---|---|---|---|---|---|---|---|---|
| Banked | 30 | 105 | 157 | 215 | 365 | 435 | 533 | 677 | 836 |
| Level | Lv2 | Lv3 | Lv4 | Lv5 | Lv6 | Lv7 | Lv8 | Lv9 | Lv10 |

- **Awakening levels are fixed** (Lv5, 6, 7). **Which verb awakens follows usage.** So every room needs rank-III lanes for all three verbs.
- **FO §4.5's table is corrected to these yields.** Its Lv10 at the Warden becomes Lv10 at door 18, so Thunder Croak and the Crown glow are *played* at door 19 and the Warden.
- **EditMode CI test:** simulate the median first climb from the JSON tables. Fail the build if Lv5 lands outside doors 6–8 or Lv10 outside doors 17–19.

**Pacing rules**
- **Before the Keeper, exactly 5 systems:** verbs, growth, rule doors, door choice and the team gimmick.
- **After the Keeper, one new system per stop:**
  - door 11: Heart door;
  - door 12: fork and Meeting Door;
  - door 13: secret quest;
  - Landing 3: Knot, Cut and Duos.
- **Hard cap:** one full-screen card per door.
- **Feel target:** about every 90 s the player got stronger, laughed, or saw something bigger. It is measured in greybox.

**Seeded climbs (climb 2 onward)**
- Pick 1 of 3 from door 2.
- Forks at 7, 12 and 17.
- Heart doors from door 6, drawn from the ♥ pool of 4.
- Secret quests from door 6.
- Classes selectable.
- At least 1 gold door, forced on floor 4.
- One Rematch in doors 15–19.
- One set piece in each half.
- No suit three times in a row.
- **Debut rule:** while any monster is still unmet, place up to 2 never-met monsters before door 10.
  - In climb 2 this guarantees `moss_snail` and `web_spider`, as a pair somewhere in doors 3–9.
- **Pool rule:** a room you played can't return in the same climb except as the Rematch. The side you didn't choose can.
- **Plaque letters always match the suit** (A ♠, B ♦, C ♣, E solo/duo; Heart doors show ♥). So the unchosen door-7 room at door 12 is 12B or 12C.

---

## 6. Slice room roster

**Slice** means THE WELL:
- one authored Full Climb, doors 0–20;
- ★1 Out of the Well onto the walkable Rim;
- a seeded climb 2 with fresh monsters.

**Status and budget keys**
- **Status:** MUST-A (Milestone A, the Quick Climb and free demo), MUST-B (Milestone B), SHOULD, LATER.
- **Budget:** S = the monster plus the kit; M = plus one custom kit piece; L = multiple phases or a generator.
- **Skulls** are base values; Hard adds 1.

| # | id | Display name | Layer | Suit / type · first-climb slot | Skulls | One-line fantasy (rule in quotes) | Status · budget | Source |
|---|---|---|---|---|---|---|---|---|
| 1 | `hub_well_bottom` | The Well Bottom | Well | Hub: title screen | — | The menu is the well bottom: black water, 8 eggs, the Mouth a 31° coin 180 m up. It holds the ring map, the Mirror, the first-frog statue (우물 안 개구리 / 井底之蛙) and 4 difficulty doors (Hard and Hell chained). | MUST-A · M | new (WORLD Foot; plan_0 hub) |
| 2 | `hatch_pond` | Hatch Pond | Well | Onboarding · door 0 | — | Hatch in 3 s, hop pad to pad, gulp a firefly cloud (Lv2, TONGUE II), and tongue Kestrel off his pad for the first laugh. | MUST-A · S | new |
| 3 | `br_shove_door` | The Two-Frog Door | Well | Breather (jar) · door 1 | — | A giant door stamped 1 needs two frogs to shove. `DOOR 1` slams; a jar and mites wait behind it. | MUST-A · S | new |
| 4 | `bell_golem` | The Bell-Golem | Well | ♠ rule · door 2 (fixed); Rematch at 18; Keeper; Warden P1 | 1 | "Ring 3 bells. When its eyes glow, freeze." Out-think it at door 2, then flatten it at its old time. | MUST-A · M (style-lock room) | GDD room (§6.1 `golem_belfry`) |
| 5 | `heron_shadow` | Heron Shadow | Well | ♠ rule · 3A | 1 | "Reach the far bell. When the shadow falls, be under a lily pad." Tongue the feather it drops and it never returns. | MUST-A · S | new (DOORS "Rush" homage) |
| 6 | `lily_raft` | Lily Raft | Well | ♣ rule · 3C | 2 | "Ride to the far pad. The pike leaps at the low side." The raft tips when the fat frog jumps on. | MUST-A · M | new (TEAMBOUND Downstream) |
| 7 | `br_window` | The Window | Well | Breather (window) · door 4 | — | A crack in the wall onto the real shaft: other strands, hundreds of lanterns, the Mouth still a coin. | MUST-A · S | re-themed (WORLD Seam / X alcove) |
| 8 | `fog_stair` | Fog Stair | Well | ♦ rule, short (≤55 s) · 5B | 1 | "Reach the top. The eel lunges at whoever is lit." The fog hides a flat route that the fireflies avoid. | MUST-A · S | new (TTITH floor 3) |
| 9 | `snapper_crossing` | Snapper Crossing | Well | ♣ rule, short (≤55 s) · 5C | 2 | "Carry the egg to the nest. It bites the fastest thing moving." Two carriers, a cracking egg, a mite thrown as bait. | MUST-A · M | new (TEAMBOUND Delivery) |
| 10 | `landing_well` | The Landing | Well | Landing · after 5, 10, 15 | — | A 40 s warm stop on a strand top: jar lineup, one toy, the stall (from L2), the Knot spot (from L3), the Mirror. Look up: the Mouth has grown. | MUST-A · M | re-themed (GDD §10.1 Landing; WORLD Braid) |
| 11 | `toy_frog_stack` | Frog Stack | Well | Toy · Landing 1, Meeting room | — | Stack frogs into a wobbling tower for a jar. | MUST-A · S | re-themed (GDD Wax Stack; TEAMBOUND Tower of Babel) |
| 12 | `toy_fly_catch` | Fly Catch | Well | Toy door · door 6 | — | 30 s of tongue-snapping a fly swarm for the jar. | MUST-A · S | new |
| 13 | `echo_warren` | Echo Warren | Well | ♦ rule · 7B | 2 | "Find 3 glow-moths in the dark maze. It hunts your last croak." Your croak draws the walls. | MUST-A · M | new (TEAMBOUND Echo Chamber; the user's maze) |
| 14 | `lamp_knight` | The Lamp-Knight | Well | ♣ rule · 7C | 2 | "Snuff all its lamps in one breath. Twice." Two frogs croak within 0.3 s, or one sad lone croak. | MUST-A · M | GDD room (§6.9 `harmony_sentinel`) |
| 15 | `snake_coil` | Snake Coil | Well | ♠ rule · 8A | 2 | "Cross on the pads. It strikes whatever splashes." Tongue its tail into its mouth and it bites itself to sleep. | MUST-A · S | new |
| 16 | `br_gold` | Gold Door | Well | Breather (gold) · door 9 (seeded in climb 1; 5% after) | — | A 45–60 s treasure room: fireflies ×3 and a Legendary (Moon Hop auto-granted in climb 1). | MUST-A · S | new (FO gold door) |
| 17 | `keeper_bell_raft` | The Keeper: Bell on the Raft | Well | Keeper · door 10 | 2 | The door-2 golem on a tipping raft: ring its bells while keeping the raft level (~90 s). It is built only from lessons everyone was taught. | MUST-A · M (reuses 2 scripts via `PhaseSequencer`) | new |
| 18 | `br_jar_mites` | Jar Room | Well | Breather (jar) · door 13; seeded breather pool | — | Warm light, pots and mites to pop. The first secret quest appears here. | MUST-A · S | new |
| 19 | `heart_two_pads` | Two Pads, Three Frogs | Well | ♥ Heart · door 11 | 1 | "Only two may leave by the pads." Shove a friend off, or stack three frogs on one pad. | MUST-B · S | re-themed (GDD §6.6 `weighing_hall`) |
| 20 | `slime_foundry` | Slime Foundry | Well | E, SOLO · 12E | 2 | "Herd it into the cold with steam." The Chrono-Slime, and the door the teaser promised. | MUST-B · M | GDD room (§6.4 `clockwork_foundry`) |
| 21 | `meeting_room` | The Meeting Room | Well | Hub · after forks 12 and 17 | — | The two-lock Meeting Door. The first half plays Jar Tag and passes one item through the window; at 45 s a rescue rope drops. | MUST-B · M | re-themed (GDD §3.8 Reunion) |
| 22 | `toy_jar_tag` | Jar Tag | Well | Toy · Meeting room | — | Tag, with a jar over your head (Snuff Tag rules). | MUST-B · S | re-themed (GDD Snuff Tag) |
| 23 | `doppelfrog` | Doppelfrog | Well | ♥ Heart · door 14 | 2 | "One of you is not a frog." Spot the Mimic (it blinks sideways) and vote it out at the exit. | MUST-B · L | re-themed (GDD §6.5 `liars_banquet`) |
| 24 | `sp_grip_wall` | The Grip Wall | Well | Set piece · door 15 | 2 | A PEAK climb: every frog has its own grip ring, moss holds dry out, and friends are tongue-hauled up. | MUST-B · L | re-themed (GDD §6.7 `drip_chimney`; TEAMBOUND Summit) |
| 25 | `toy_lily_sumo` | Lily-Pad Sumo | Well | Toy door · door 16 | — | Shove each other off shrinking pads for 30 s. | MUST-B · S | new |
| 26 | `sp_tongue_tether` | Tongue-Tied Tether | Well | Set piece (♣) · 17C | 3 | Pairs tongue-tied together hop in step while the well water rises. | MUST-B · L | GDD room (§6.3 `fuse_tether`; TEAMBOUND Chained) |
| 27 | `glitch_eye` | The Glitch Eye | Well | E, SOLO/DUO · 17E | 3 | "Never look at the eye. Topple the three pillars that hum." | MUST-B · S | GDD room (§6.8 `glitched_watcher`) |
| 28 | `br_sleeping_toad` | The Sleeping Toad | Well | Breather (sleeping threat) · door 19 | — | Sneak past a giant sleeping toad. One loud croak and it stirs. | MUST-B · S | new (GDD §6.0.5 noise model) |
| 29 | `warden_the_jar` | The Warden: The Jar | Well | Warden · door 20 | 3 | A house-sized jar lowered onto the brightest frog. P1: flatten old monsters at their old numbers. P2: a Chorus lifts the Jar. P3: the tongue-catch Trust Fall. | MUST-B · L | re-themed (GDD §6.13 `the_snuffer`) |
| 30 | `rim_surface` | The Rim | Well → Sky | Hub, after ★1 | — | Walk out onto the rim with Glide on, stars of Space through a tear in the dome. Results, then +50 Pearls. | MUST-B · M | new (WORLD Law 3) |
| 31 | `heart_split_swallow` | Split or Swallow | Well | ♥ Heart · climb-2 pool | 1 | Pairs choose in secret: share the jar or swallow it. A double swallow gets a clown honk. | MUST-B · S | re-themed (GDD Pinky Promise minigame) |
| 32 | `heart_tied_bridge` | Tongue-Tied Bridge | Well | ♥ Heart · climb-2 pool, Knotted pairs | 2 | "Pairs cross tied together. The bridge sinks under two." Cut and run, or sling your partner across. | MUST-B · M (reuses the tether script) | re-themed (GDD §6.3 `fuse_tether` variant; TTITH floor 61) |
| 33 | `moss_snail` | The Moss Snail | Well | ♦ rule · climb-2 debut (doors 3–9) | 2 | "It only moves while nobody watches it. Ring the 3 bells behind it." Turn round and it's right behind you. | MUST-B · S (inverted GazeCone) | new |
| 34 | `web_spider` | The Web Spider | Well | ♣ rule · climb-2 debut (doors 3–9) | 2 | "It drops on whoever croaks. One croaks, the rest cross." A volunteer sacrifice. | MUST-B · S (NoiseBus) | new |
| 35 | `moth_library` | The Moth Library | Well | ♦ rule · pool | 2 | "Place three quiet books on their stands. Freeze when the moth twitches." | SHOULD · M | re-themed (GDD §6.2 `whispering_library`) |
| 36 | `sunken_bucket` | Sunken Bucket | Well | ♣ rule · pool | 2 | "Raise 3 relics. The catfish swallows the brightest light." Air is per frog; tongue a bubble to a friend. | SHOULD · L | new (TEAMBOUND Deep Dive) |
| 37 | `toy_bigtoad` | Big Toad | Well | Toy door | — | Everyone steers one big toad suit; the inputs are summed. | SHOULD · M | re-themed (GDD §6.14 `hollow_suit`; TEAMBOUND One Body) |
| 38 | `*_e` variants | (e.g. Echo Warren, solo) | Well | E variants of group rooms, same scripts | +1 | More E doors for forks. | SHOULD · S | re-themed (slice rooms) |
| 39 | `sky_preview` | Sky Preview | Sky | Doors 21–25 under Glide | 1–2 | `bell_golem`, `heron_shadow` and `lily_raft` re-dressed in pastel sky, plus a window onto Space. | SHOULD · M | re-themed (slice rooms) |
| 40 | `mirror_toll` | The Mirror Toll | Sky | ♦ rule | 2 | A mirror that copies the last frog to touch it. | LATER · M | re-themed (GDD §6.11 `mimics_toll`) |
| 41 | `ash_axeman` | The Ash Axeman | Space | ♠ rule | 3 | "It kneels only in the dark." Your glow becomes the liability. | LATER · M | re-themed (GDD §6.12 `karmic_executioner`) |
| 42 | `hollow_toad` | The Hollow Toad | Sky | Set piece | 3 | The full One Body set piece: the party drives one giant hollow toad. | LATER · L | re-themed (GDD §6.14 `hollow_suit`) |

**Counts (FO §9.2, restored)**

| Content | In the slice |
|---|---|
| Rule doors | **12**: 10 group (♠ 3 · ♦ 3 · ♣ 4) + 2 E |
| Heart doors | **4** |
| Set pieces | 2 |
| Keeper and Warden | 1 each |
| Breathers | 7 (5 `br_` + 2 toy doors) |
| Toys | 4 |
| Hubs | 5 |
| **MUST rooms** | **34** (18 A + 16 B) |
| **Bestiary pages** | **14** (12 rule monsters + Keeper + Warden) |

**TEAMBOUND_13 homes**

| Mode | Home |
|---|---|
| Summit | `sp_grip_wall` |
| Chained ascent | `sp_tongue_tether` |
| Downstream | `lily_raft` |
| Echo Chamber | `echo_warren`, `lamp_knight` |
| Delivery | `snapper_crossing` |
| Tower of Babel | `toy_frog_stack` |
| One Body | `toy_bigtoad` (SHOULD) |
| Deep Dive | `sunken_bucket` (SHOULD) |

**Cut rooms:** `weight_of_guilt` (it depended on Soot and the Ledger); plan_1's `fragile_jar` (folded into `snapper_crossing`); plan_1's `echo_chamber` (became `echo_warren`); plan_0's dynamic `keeper_well`.

---

## 7. Scope and milestones

### M0: weeks 1–2, bootstrap and proof of concept

- **Open `KNOTWELL/` in 6000.3.25f1 and fix it up** (see §12).
- **Netcode proof of concept, NGO 2.x vs FishNet**, at 150 ms RTT with 2% loss. It covers:
  - tongue on props and on players;
  - raft torque;
  - shove-off-pad;
  - 2-room visibility;
  - 7 host bots.
- **Decision rule:**
  - stay on NGO unless tongue or raft feel fails *and* FishNet fixes it;
  - if tongue-on-player feels unfair, cut it back to shove.
- **In parallel:** a capsule greybox of doors 0–10, generated from JSON, with the growth CI test green.
- **Week 3:** style-lock `bell_golem` and the hero. After that, the content factory runs: an S room takes at most 3 agent-days, from JSON plus one script.

### MUST-A: the Quick Climb (~11 min) at ship polish

Milestone A is also the free Steam demo and the Next Fest vehicle.

- **Rooms:** rows 1–18 of §6.
- **Controls and body:**
  - 8 bindings;
  - 3 verbs at ranks I–III;
  - Glow 1–7 on screen, with the curve defined to 10;
  - spots, catches, tadpole ghost, croak revive, Team Lives.
- **Difficulty:** Easy and Normal, **plus Hard as a data flag.** Hard unlocks per lobby at a Keeper clear, which happens inside A, so the hub's chain tag must tell the truth.
- **Boons:** 8 Boons + 2 Legendaries, auto-granted:
  - Shatter Croak, Spring Legs, Tell-Sight, Sure Tongue, Chorus, Lifeline, Deep Cheeks, Last Gulp;
  - the Legendaries Moon Hop and Time Gulp.
- **Keeper Landing ceremony:** `[ CHOICE UNLOCKED ]`, Party Rank Up, the pull-back and the free hat.
- **Repeat Quick Climbs** are seeded:
  - pairs are re-rolled;
  - Twists are re-seeded;
  - pick 1 of 3 from door 2 once unlocked.

  Forks and Heart doors arrive with B.
- **Economy and meta:**
  - Wish Coins and Pearls;
  - the stall from Landing 2;
  - the results ceremony;
  - Tower Rank F–C;
  - Bestiary pages with death tips;
  - save and resume at Landings.
- **Rivals:** 7 Rookie Rivals with the Drama Director's first-climb beats; blame tags; the 3 s fall replay.
- **The Mirror:** 12 earned cosmetics (Hat, Skin, Glow colour).
- **Hub:** the ring map, the statue and the four difficulty doors.
- **Steam and plumbing:**
  - **Steam Timeline markers;**
  - Localization string tables (English);
  - Steam friend and private lobbies plus LAN.
- **Measurement:** "Worth it?" tap and funnel telemetry.
- **Tests:**
  - all validators;
  - the 7-bot soak;
  - the growth CI test;
  - FO §8.6's enforcement tests;
  - the performance budget.

**Gate to B.** All of these must hold:
- **FO §6.1 plays end to end:**
  - with 1 human + 7 bots;
  - with 4 humans on LAN at 150 ms / 2% loss;
  - in one two-account Steam session.
- **Every room meets its Definition of Done.**
- **The soak clears on at least 90% of 50 seeds.**
- **The performance budget is met.**
- **FO §9.3's stop conditions are measured.**
- **Gates A and B are run** with the user and at least 4 friends.

**The Steam page and capsule go live only after Gate A passes.**

### MUST-B: the Full Climb (~24 min), ★1, the Rim and a seeded climb 2

- **Rooms:** rows 19–34 of §6, plus the Rematch overlay and the ★1 reveal (an L system: nested shells, Shuriken, Cinemachine; no VFX Graph).
- **Progression:**
  - rank IV verbs;
  - Glow 8–10 and the Crown glow;
  - 16 Boons + 4 Duos + 4 Legendaries, with pick 1 of 3;
  - Knot, Cut and Duos;
  - **3 open + 6 secret classes** with secret quests;
  - Tower Rank to S.
- **Difficulty:** **Hell and Sealed** (redacted rule text, tells ×0.7, 1 Team Life).
- **Rivals:** all 10, plus the Rival Register.
- **Bestiary:** 14 pages.
- **Shop:** 24 earned cosmetics, plus 2 **Supporter Sets as Steam cosmetic DLC** (stubs, priced at launch).
- **Modes and fixes:**
  - **Landing Party mode;**
  - Retry from door 11 (until first surfacing);
  - +50 Pearls on first surfacing.
- **Tests:** the wish-coverage test and the fidelity KPI.

**Emergency slip order if B runs late.** It needs the user's sign-off, because it breaks FO §9.2's counts. Slip in this order:
1. `heart_tied_bridge`
2. `heart_split_swallow`
3. `toy_lily_sumo`
4. `br_sleeping_toad` (reuse `br_jar_mites`)
5. `glitch_eye` (17E reuses a `slime_foundry` duo variant)
6. Landing Party

**Never slip:**
- `doppelfrog`, `sp_grip_wall`, `sp_tongue_tether`, `meeting_room`, `warden_the_jar`;
- ★1 and `rim_surface`;
- the climb-2 debut rooms;
- Hell and Sealed.

### SHOULD

Listed in build order. **Cut from the bottom up:** Sky Preview goes first, then `sunken_bucket`, then `toy_bigtoad`, then the E-variants.
1. **Share card:** a group shot plus the vista, door and difficulty, taken at the Keeper pull-back and on the Rim.
2. **Streamer-safe toggle:** hides the join code, and draws other humans as seat-colour tags.
3. **Korean localization,** using a TextMeshPro CJK subset.
4. **Public matchmaking** with 2-flag kick-to-bot, and mid-climb drop-in.
5. **Chorus at results;** the light pillar and the water reflection.
6. `moth_library` and the E-variants.
7. `toy_bigtoad`.
8. `sunken_bucket`.
9. **Sky Preview** (doors 21–25 under Glide).

### LATER

- **The rest of the Ascent:** the Sky, Space and Beyond climbs, with Glide, Drift and Light-Lag.
- **Wardens:** the thunderhead heron (Sky), Chan Chu (Space), the Watcher (Beyond).
- **Reveals:** ★2–★4, the Revelation, Cycle 2.
- **Modes:** Mimic Climb, Daily Seed with replay-validated leaderboards.
- **Social:** proximity voice (friends-only, opt-in); the Watchers audience layer.
- **Rooms:** `mirror_toll`, `ash_axeman`, `hollow_toad`, and the second batch of 12 Well rule doors.
- **Tech and release:** VFX Graph for later reveals; live DLC pricing; the IL2CPP release build.

---

## 8. Systems: kept, changed, cut

### 8.1 Kept as FO specifies (writers cite the FO section)

**Pillars and house rules**
- The 5 pillars and the tone rule, "dread, then a waltz" (§2.2).
- The house rules: *fun before rules*, *the System never lies*, and *the fairness contract is law* (§2.2, §5.4).

**Climb and doors**
- The Climb of 20 numbered doors.
- The door mix and lengths.
- The plaque with exactly 4 fields.
- The 4 s walk-vote.
- Forks with the Meeting Door, key swap and rescue rope; "cleared with help" keeps the Boon pick (§3.1–3.4).
- Rule-room anatomy (§3.8).
- The 8 bindings (§3.9).

**Growth**
- Fireflies: the 70/30 clear/loose split, banking, and spills that return to their owner outside Heart doors.
- The Glow curve 15·(n−1)(n+2)/2.
- The verb-rank table, Awakenings and Masteries (§4.1).
- Boons: 4 passive + 1 active slots, duplicates upgrade I→III, host-salted private offers, the comeback 4th card, and Party Rank Up at the Keeper and Warden only (§4.1).
- Classes as sidegrades, and the 9 FO classes with their Signatures (§4.2).
- Secret quests: self-contained, salted, and a banner rather than a full-screen card (§4.2).

**Meta and payout**
- Tower Rank F→SSS, 8 talents and Rank Sync.
- The Bestiary with death tips, and a hat every 4 pages.
- Pearls and their prices.
- The results-ceremony order, with the Rank bar last.
- First-time-only death rewards (§4.3–4.4).

**Health and difficulty**
- Spots, the catch within 3 s, tadpole ghost, the 2 s croak revive, and free revives at Landings.
- A failed room pays 50% and costs 1 life; E doors never cost lives (§3.7).
- Difficulty at the entrance, with Team Lives (§3.6).

**Social**
- Mischief caps.
- Heart doors, each with a co-op answer.
- Knot and Cut: a 1.2 s hold, countered by hold-on.
- Betrayal Cam, WANTED poster, and Vengeance, which returns exactly what was taken plus +1 card once per climb.
- The lobby-type table; blame tags in friends and private lobbies only (§5.1–5.2).
- Rivals: the 10 frogs, the onlooker chorus, the Rookie label, and the Drama Director's targets and limits (§5.3).

**Presentation and business**
- Presentation priorities, self-lit tells, the croak echo, per-layer palettes (§6.2).
- Capsule and trailer spec, after Gate A (§6.4).
- Storefront: $7.99 plus a gift 4-pack; the free Quick Climb demo; free weekends; creator keys; layers as free named updates; cosmetics only, direct-priced; no pass at launch; Well-Rested; no streaks; a bookmark on every hook; the gentle break line; "Worth it?" with the revert rule; the §8.6 build-failing tests (§8).
- **Tech:** the UT stack, as in §12.

### 8.2 Changed: council amendments that supersede FO text

1. **Door 5** is a short rule pair (≤55 s), and Landing 1 moves to ~4:45 (FO §6.1).
2. **The first gold door** is seeded at door 9, and Moon Hop is auto-granted (no pick 3 before the Keeper). The odds page says "First climb: one guaranteed gold door." (FO §3.2, §6.1)
3. **The Keeper** is the fixed `keeper_bell_raft`, not "two monsters combined" (FO §3.2).
4. **`lily_raft` is a ♣ rule door,** not a set piece (FO §4.5).
5. **After the Keeper, one system per stop:** Heart door at 11 (Shove only), fork at 12, secret quest at 13, and Knot, Cut and Duos at Landing 3. FO had Knot, Cut and the quest at door 11 (FO §3.5, §4.2, §5.2).
6. **Vengeance** carries over to the first room that holds both frogs. The Meeting room counts (FO §5.2).
7. **The Sky molt** is the **Glider molt** (FO §6.3 "Tree Frog"). Tree Frog stays only as a class.
8. **Croak III "Big Voice"** becomes **Twin Toll** (FO §4.1).
9. **FO §4.5's table** is corrected to the yields: Lv10 at door 18. The growth CI test enforces it.
10. **Classes** appear from climb 2, and **the stall** opens at Landing 2 (FO §4.5, §6.1).
11. **Offstage Rivals** take any fork side no human takes. They are parked, rejoin after the humans' clear time plus 5–20 s, and give one reunion bark. This fixes FO's solo soft-lock (FO §3.3).
12. **Doppelfrog with fewer than 3 humans** runs as "spot the Mimic":
    - a bot seat is the Mimic;
    - only humans vote;
    - bots only point at public evidence.

    The human-vs-human Mimic still needs at least 3 humans and 5 voters. This replaces FO's vote-free substitute, because the user named Mafia and Among Us first (FO §5.2).
13. **The ring map** is a UI Toolkit panel on the hub wall, in pause and under the results counter. It is "the map", a plain word, not a noun.
14. **The hub statue**, and **four difficulty doors visible from 0:00.**
15. **★1 ends on the walkable Rim** with Glide on, and the results play there.
16. **Retry from door 11** after a post-Keeper wipe, until the profile first surfaces.
17. **+50 Pearls, one time, published,** on first surfacing.
18. **Climb-2 debut rule** (§5), with `moss_snail` and `web_spider` added.
19. **Hero:** growth is light, never size. The gates are deferred to human testers, with one remediation pass before any fallback (FO §2.3).
20. **Supporter Sets ship as Steam cosmetic DLC.**
    - Ownership is checked with Facepunch's DLC-installed call.
    - No ISteamMicroTxn (it needs a server) and no Steam Inventory (it creates a trade market).
    - Earned and paid catalogues never overlap (FO §8.2).
21. **Steam Timeline markers are MUST-A.** This resolves FO §5.1's tech check.
    - Each Climb is one game phase, tagged with difficulty, best door and outcome.
    - **Featured markers:** Betrayal Cam, Awakenings, class reveals, gold doors, Vengeance landed, the Trust Fall catch, ★1.
    - **Standard markers:** each door clear.
22. **VFX Graph is not in the slice** (FO §6.2 #7 allowed it). ★1 uses shells, shaders, Shuriken and Cinemachine.
23. **The Bestiary has 14 pages** (FO §9.2 said 12). The principle stays "one page per monster".
24. **Secret-quest uniqueness goes to humans first.** Bots may share a class quest when seats exceed 6 secret classes.
25. **`[ NOTED ] That was not the intended solution. Keep it.`** fires on every hidden or unintended clear, in every room (FO §4.1).
26. **Hard ships in A; Hell and Sealed ship in B.** Unlocks stay per lobby (FO §3.6).
27. **Localization tables from day 1.** Every player-facing string goes through Localization.
28. **`wish[]` and `homage[]` tags on every RoomDef,** plus the wish-coverage EditMode test and the fidelity KPI:
    - at least 70% of first sessions reach each wish by minute 60;
    - at least 60% reach ★1.

### 8.3 Cut

**GDD systems (per FO §7)**
- **Run structure:** the 36–45 min run, Intermission, Door Draft, Latch, Stampede, Draft Cam, Ghost Sim, Grates, Side Doors, Visitors, Keyholes, Keyhole bets, the Tide, Omens, Echo tiers, tier scaling.
- **Body and currencies:** wax HP and the shrinking body, flame verbs, ambient burn, Scorched, Embers, Drips, Sparks.
- **Betrayal machinery:** Soot, the 10 Knives, Tribunal, Notes, Pact Pot, Clue Composer, the Ledger overlay.
- **Meta:** Altar filler cards, the Anvil, Origins, Wick Level, the Codex that spoils rooms.
- **Shop and retention:** the daily-rotating shop, the Tallow Bargain, the Wickbook pass, the daily bonus and streaks.
- **Minigames:** Pinky Promise and Rumour Dice as minigames.
- **Rooms:** `weight_of_guilt`.

**WORLD items**
- the Theta Draft maze and the Tide skin;
- the X alcove and Seam (absorbed by `br_window`);
- the Mound;
- tier +1 per layer and the `'clamp'` scope;
- Burnt-Out Watcher wisps.

**Council cuts**
- **Before the Keeper:** class select, shopping, and any pick-3 screen.
- **Frog Sqwad overlap:** any growth in frog size or hitbox, and "eat to grow" copy.
- **Public lobbies:** human-vs-human Heart doors and blame tags.
- **Honest numbers:** bot votes on hidden information; any results stat or title that counts betrayals; invented rarity percentages.
- **Steam commerce:** ISteamMicroTxn and Steam Inventory.
- **Agent tooling:** the official Unity MCP and Unity AI in the pipeline. Use the Unity CLI + Pipeline + the CoplayDev bridge, with plain batchmode as the fallback.
- **Obsolete:** the Three.js `_scaffold/`, and every browser-era argument.

---

## 9. File plan (`_design/master/`)

| File | Owns (one line) |
|---|---|
| `00_OVERVIEW.md` | Name, tagline, hook, fantasy, pillars and house rules, hero in brief, structure map, the user-wish trace (each wish to its room, system and minute), authority order, glossary copy, and how to read the set. |
| `01_WORLD.md` | The concentric Well → Sky → Space → Beyond world and its laws, Braid geometry, the Mouth's angles, the ring map, every scale reveal (window, Landing glance, Keeper pull-back, ★1 choreography, the Rim), layer palettes, movement verbs, molts and Wardens, and the LATER Revelation / Cycle 2. |
| `02_HERO_AND_CONTROLS.md` | Firefly Frog body spec, `IHeroBody`, the procedural rig, growth readouts, Seat Hue, the 8 bindings, the verb-rank numbers I–IV, spots, catch, ghost and revive, tongue fairness caps, Gates A/B, the remediation pass, and the Wick fallback mapping. |
| `03_SOCIAL_AND_BOTS.md` | Lobby types, mischief vs Heart doors, Knot/Cut, Betrayal Cam, WANTED, Vengeance, Doppelfrog rules (both variants), blame tags and replays, the fairness contract, the 10 Rivals as frogs, Rookie labels, onlooker barks, Drama Director targets and the staged first-climb beats, offstage Rivals, the Rival Register, and public-lobby rules (SHOULD). |
| `04_PROGRESSION_ECONOMY.md` | Firefly yields and the corrected Glow table, verb ranks, Awakenings and Masteries, the full Boon / Duo / Legendary pool and pick rules, the 9 classes and secret quests, Tower Rank and talents, the 14-page Bestiary, Wish Coins, Pearls and stall prices, the results ceremony, difficulty tiers and Team Lives, failure, Well-Rested, and the growth CI test. |
| `05_ROOMS_SLICE.md` | The RoomDef contract and kit, door grammar and plaques, generator rules, the authored first climb door by door, full specs for all 34 MUST rooms (cue, rule, clears, Twists, rank lanes, gimmick, BotPlan, System lines, Bestiary tip, wish/homage tags, budget), the Rematch overlay, and the per-room Definition of Done. |
| `06_ROOMS_LATER.md` | Specs for the SHOULD rooms (`moth_library`, `sunken_bucket`, `toy_bigtoad`, E-variants, Sky Preview), LATER rooms (`mirror_toll`, `ash_axeman`, `hollow_toad`), pitches for the second batch of 12 Well rule doors, Sky/Space/Beyond room themes and Wardens, Mimic Climb and Daily Seed. |
| `07_HUB_AND_MINIGAMES.md` | `hub_well_bottom` (title, ring map, difficulty doors, statue, Mirror, friends' best doors), `hatch_pond` onboarding shot by shot, Landings (stations, 40 s budgets, the Keeper ceremony), `meeting_room`, the 4 toys' rules and scoring, Landing Party mode, and `rim_surface`. |
| `08_COSMETICS_SHOP.md` | The 8 cosmetic slots, the 24 earned items (12 in A) with Pearl prices, earned-only prestige, the Mirror and try-on, Supporter Sets as Steam DLC, what is never sold, price and launch plan, the retention ethics rules, telemetry and the "Worth it?" revert rule, and the FO §8.6 enforcement tests. |
| `09_ART_UI_AUDIO.md` | The toon look (ramp, rim, outline, self-lit tells, dark rule rooms, warm breathers), palettes, frog / monster / Rival designs, the procedural animation list, Shuriken VFX, camera, UI (door counter, System windows, 3-spot HUD, plaques, results, ring map), accessibility, pentatonic croak audio and positional cues, the juice checklist, and the capsule / trailer spec. |
| `10_UNITY_TECH.md` | Versions and packages, project state and bootstrap fix-ups, assemblies, the data → generators → seeds pipeline, baked room shells (APV, NavMesh), netcode (NGO host, Facepunch/SDR, UTP LAN, visibility, lag compensation, server-authoritative betrayal), host bots, Steam integration (lobbies, Timeline, DLC), validators and the test list, the performance budget, the agent loop, `licenses.csv`, the M0 → A → B build order, and the NGO 3.0 milestone. |

**Rules for every writer:**
- **Use the §10 glossary spellings and the §6 ids exactly.** Coin no new player-facing nouns; the FO §7 noun budget still applies.
- **Tag every feature** [MUST-A], [MUST-B], [SHOULD] or [LATER].
- **Label every number** as a greybox hypothesis unless a source proves it, and cite the FO section or this file.
- **Do not restate FO wholesale.** Specify what an agent builds.
- **Frog art is written against `IHeroBody` sockets.** Nothing frog-only is locked before Gate A.

---

## 10. Glossary (30 terms; all writers must use these)

| # | Term | Meaning | Write it as / never as |
|---|---|---|---|
| 1 | **KNOTWELL** | The product | KNOTWELL. Never KNOTSPIRE, "Knot Well" or "Notwell". |
| 2 | **Layer** | One concentric band of the world: the Well, the Sky, Space, Beyond. Doors 1–20 / 21–40 / 41–60 / 61–80. **The Ascent** is all four to the Revelation. | Never "tier" or "world 2" |
| 3 | **Climb** | One layer's 20 numbered doors, as 4 floors of 5. **Quick Climb** runs hatch to Keeper (~11 min); **Full Climb** runs to the Warden (~24 min). | Never "run" |
| 4 | **Door number** | A slot's number, running on across layers ("Best door: 37"). Pairs are lettered (5B / 5C). | `DOOR 14`, `12E` |
| 5 | **Plaque** | Shows exactly 4 things: number + letter, suit, prize icon, 1–3 skulls (+SOLO/DUO). Suits: A ♠ Body, B ♦ Mind, C ♣ Together, E solo/duo, ♥ Heart. | Never payout formulas or capacity dots |
| 6 | **Breather** | A 15–30 s door: jar, toy door, window, sleeping threat or gold door | Never "empty corridor" or "filler" |
| 7 | **Rule door** | One monster, one cue, one rule, an obvious and a hidden clear, 2 **Twists**, mites, one shared-fate gimmick. Monsters are never killed. | Never "puzzle room" or "boss fight" |
| 8 | **Set piece** | A 90–150 s door: the Grip Wall (PEAK) or the Tongue-Tied Tether (Chained Together) | — |
| 9 | **Fork / Meeting Door** | A split into a group door and an E door. The halves rejoin at a two-lock door: key swap, one item through the window, rescue rope at 45 s. An untaken side goes to **offstage** Rivals. | Never Grate, Side Door or Ghost Sim |
| 10 | **Landing** | A 40 s warm stop after doors 5, 10 and 15, and a save point: jar lineup, one toy, the stall, the Knot spot, the Mirror. The Keeper Landing is Landing 2. | Never "hub floor" or "Intermission" |
| 11 | **Keeper / Warden** | The door-10 mini-boss (`keeper_bell_raft`) and the door-20 layer boss (The Jar). **Party Rank Up** plays at both. | Never "the Crown" or "Snuffer" |
| 12 | **Gold door / Rematch door** | Overlays. A gold door is a treasure room with a Legendary. A Rematch door is a beaten room at its old numbers, with the old time on the plaque. | — |
| 13 | **Heart door (♥)** | The only place real betrayal happens. It is announced on the plaque and always has a co-op answer. | Never "D door" or "traitor room" |
| 14 | **Knot / Cut / Duo** | **Knot:** a pact made at a Landing (see each other through walls, revive faster, Duo Boons). **Cut:** hold Shove 1.2 s while Knotted; **hold on** with the Tongue to stop it. | Never Pact, Knife or "belay" |
| 15 | **Betrayal Cam / WANTED poster / Vengeance** | A 0.8 s slow-motion replay with `[ TRAITOR ]`; a cartoon poster that lasts one door; the victim's quest to tongue-tag the traitor in the next shared room | Never "Soot" or "snake mark" |
| 16 | **The Mouth** | The sky opening overhead, widening 31° / 37° / 44° / 56° / 74° | Never "the Coin" |
| 17 | **Fireflies** | XP only. They ride in your cheeks (unbanked) and bank when the door clears. | Never a currency; never "flies" or "Embers" |
| 18 | **Glow Level** (Lv1–10) + **Crown glow** | The per-climb level, shown as light on the body; a halo at Lv10 | Never "size", "grow bigger" or "Wick Level" |
| 19 | **Verb rank** | Hop, Tongue and Croak at ranks I–IV. Rank III is the **Awakening** (Air Hop, Long Tongue, Twin Toll). Rank IV is the **Mastery** (charged 3.0 m hop, 8 m chain-grapple, Thunder Croak). | Never "Big Voice"; never "skill tree" |
| 20 | **Boon** (Duo Boon, Legendary) | The build. Auto-granted before the Keeper, then a private pick 1 of 3. 4 passive slots + 1 active (Power). | Never trait, card or Altar |
| 21 | **Wish Coins / Pearls / the Mirror** | Wish Coins are spent in a climb at the stall. Pearls are the only meta currency and buy earned cosmetics in the Mirror. **Supporter Sets** are paid DLC. | Never Drips, Sparks, gems or "premium currency" |
| 22 | **Tower Rank** (F → SSS), **talents**, **Rank Sync** | The permanent headline track. One small PvE talent per rank. Rank Sync switches talents off. | Never "account level" |
| 23 | **Bestiary** | One page per monster, with stamps Seen, Survived, Cleared and Hidden clear. Your first death fills a tip. A hat every 4 pages. | Never "Codex" |
| 24 | **Class / secret quest / Signature** | 3 open and 6 secret sidegrade forms. A private quest each climb reveals one. The Signature is the Power-button hold. | Never Origin or "hidden job" |
| 25 | **Spots / Dark / tadpole ghost / Team Lives** | 3 glowing back spots. At 0 spots you are Dark and become a tadpole ghost. Revive by holding Croak over the egg for 2 s. Team Lives are shared, by difficulty. | Never wax, HP bar, Scorched or "Lily Pads" |
| 26 | **Difficulty** (Easy, Normal, Hard, Hell) + **Sealed** | Chosen at the entrance doors. Hell always redacts the rule text; Sealed is the opt-in redaction on repeat visits, for +50% fireflies. | Never "tier" |
| 27 | **Rivals** (Rookie Rivals) + **Drama Director** | The 10 named bot frogs, labelled Rookie in a player's early climbs, and the host system that stages their beats | Capital R. Never "AI player" or "NPC". |
| 28 | **The System** | The Tower's voice: one-line `[ BRACKETED ]` windows that name a change and its cause | Never a full stat sheet |
| 29 | **★1 Out of the Well / the Rim / molt** | The Well → Sky reveal; the walkable rim after it; each layer's add-on body parts (the **Glider molt**, the Moon Toad helmet) | Never "Tree Frog" for the molt |
| 30 | **RoomDef / `IHeroBody` / Seat Hue** | Build terms for writers only: the room JSON contract, the hero body interface, the fixed per-seat rim colour | Not player-facing |

**Retired words.** Never use these in any master file except when quoting history:
- Belay, "Belay or betray";
- Door Draft, Latch, Stampede;
- the Tide, Omens, clamp;
- Soot, Knives, Tribunal, Ledger;
- Altar, trait, Anvil, Origins, Codex;
- wax, Snuffed, Scorched;
- Embers, Drips, Sparks, Wickbook;
- "eat to grow", "Megafrog", "Big Voice";
- "Tree Frog molt";
- W-R01-style room ids.

---

## 11. Chair's rulings on split items

| # | Issue | J0 | J1 | J2 | **Ruling** | Rule applied |
|---|---|---|---|---|---|---|
| 1 | Integration base | plan_1 | plan_2 spine ("same composite") | plan_1 | **plan_1 is the design base; plan_2 is the build spine; plan_0 is the acceptance test** | Majority. J1 agrees on substance. |
| 2 | Fantasy wording | adds "numbered" and "just" | base | base | **Base wording** (§3) | Majority |
| 3 | Rule-door count | 12 (adds `moss_snail`, `web_spider`) | 10 | 10 | **12** | FO §9.2 outranks the panels. J0's climb-2 content hole is real: climb 1's plaques show all 8 group rooms, so without debuts climb 2 meets no new monster. |
| 4 | Heart doors | 3 | 3 | 3 | **4** (`heart_tied_bridge` joins the climb-2 pool) | FO §9.2 and FO §5.2's roster outrank. It reuses the tether script (M). |
| 5 | Secret classes | 4 (+2 SHOULD) | 4 (+2 SHOULD) | 4 | **6** | FO §4.2 and §9.2 outrank. Six also keeps quests unique for up to 6 humans. |
| 6 | Bestiary pages | 14 | 12 | 12 | **14** | Follows from ruling 3 and FO §4.3's "one page per monster". Keeper and Warden death tips protect the ★1 KPI. |
| 7 | Hard tier | B | B | B | **MUST-A, as a data flag** | FO §3.6 unlocks Hard at a Keeper clear, and the Keeper ships in A. "The System never lies" forbids a chained door the demo can't honour. |
| 8 | Hell + Sealed | MUST-B | SHOULD | SHOULD | **MUST-B** | The user's words and FO outrank. The user named TTITH and "brutal", and FO §7's wish table delivers TTITH through "Hell redaction". Cost: a redaction flag, tells ×0.7, 1 life. |
| 9 | Landing Party | MUST-B | MUST-B | SHOULD | **MUST-B** | Majority (and FO §3.6, §5.1) |
| 10 | Steam Timeline markers | MUST-A | SHOULD, if wrapped | FO tech check | **MUST-A** | Stronger argument. J1's only objection was an unverified wrapper; J0 verified it, and the chair re-verified `SteamTimeline.cs` on 2026-09-29. |
| 11 | Share card | MUST-B | SHOULD | SHOULD | **SHOULD, first in line** | Majority. FO keeps it but doesn't tier it. |
| 12 | Streamer-safe toggle | MUST-B | — | — | **SHOULD** | One judge only; no FO basis |
| 13 | Supporter Sets delivery | sandbox (inherited) | Steam DLC | MicroTxn sandbox | **Steam cosmetic DLC** | ISteamMicroTxn needs a server holding the publisher Web API key, and FO §10.4 #6 says "there are no servers". DLC satisfies FO §8.2's "priced directly". Neither majority judge argued for the mechanism. |
| 14 | Public matchmaking, drop-in | SHOULD | SHOULD | silent | **SHOULD** | Majority |
| 15 | Milestone A as the free demo | — | yes | — | **Yes** | Uncontested; FO §8.1 |
| 16 | Localization tables from day 1 | — | yes | — | **Yes** (English in A; Korean SHOULD) | Uncontested; cheap now, costly later |
| 17 | VFX Graph | — | out of slice | — | **Out of the slice** | Uncontested; UT says it is still preview for URP |
| 18 | `br_jar_mites` tier | B | B | B | **MUST-A** | Chair's call. The demo's seeded repeat Quick Climbs need the generic jar breather. S cost. |
| 19 | Root folder rename | after the workflow, with the user's OK | after the workflow, update paths | rename | **After this workflow, with the user's OK, updating hard-coded paths** | Majority |
| 20 | Name, tagline, hero, Glider molt, Twin Toll, offstage Rival, solo Doppelfrog, ring map, Rim, Retry from 11, +50 Pearls, fixed Keeper, seeded gold door, short door 5 | same | same | same | **Adopted** | Unanimous |

---

## 12. Evidence and project state (checked 2026-09-29)

**Unity project and license.** The user said "i already got those license".
- **License:** `C:\ProgramData\Unity\Unity_lic.ulf` exists (2,623 bytes). The Personal license is active. HANDOFF.md's "NOT ACTIVE" row is stale.
- **Editor and tools:** Editor 6000.3.25f1 is installed with the Windows Mono player only. The Unity CLI and Blender 5.2 are installed.
- **`KNOTWELL/` has never been opened in the Editor.**
  - `ProjectSettings/ProjectVersion.txt` is absent.
  - `packages-lock.json` (00:16) is older than `manifest.json` (00:20).
  - `Assets/` holds only `InputSystem_Actions`, `Scenes` and `Settings`, so the template extras are already gone.
  - It is not yet a git repository.

**Package manifest.**

| Status | Packages |
|---|---|
| **Present** | URP 17.3.0, NGO 2.13.3, Multiplayer Play Mode 2.0.2, Cinemachine 3.1.7, Animation Rigging 1.4.1, Input System 1.20.0, Test Framework 1.6.0, AI Navigation 2.0.15, Splines 2.9.1, Timeline 1.8.13, PrimeTween 1.4.11 (npm scoped registry) |
| **Missing** | the Facepunch transport (community git URL); Facepunch.Steamworks (confirm whether the transport bundles it); `com.unity.localization` |
| **Remove** | `com.unity.purchasing` (Unity IAP has no Steam path; Supporter Sets are DLC); `com.unity.collab-proxy` (we use git); legacy `com.unity.analytics` 3.x (the telemetry transport is decided in `10_UNITY_TECH.md`: opt-in, no personal data); `com.unity.xr.legacyinputhelpers` |

**Bootstrap checklist (10_UNITY_TECH owns the details):**
- The first open writes `ProjectVersion.txt` and re-resolves the lock.
- `git init` with Unity.gitignore and LFS.
- Split assemblies: `Game.Core`, `Tower`, `Rooms`, `Bots`, `Net`, `UI`, `Editor`, `Tests`.
- Reset static state with `RuntimeInitializeOnLoadMethod`, and cover it with a test.
- Bake APV and the NavMesh on the logged-in desktop, never with `-nographics`.
- Only generators write scenes and prefabs.
- Add the windows-il2cpp module before release builds.
- NGO 3.0 / 6.7 LTS is a named 2027 milestone.

**Dev network and performance**
- **Day to day:** UTP + MPPM, with 1 host + 3 virtual players + bots.
- **Steam:** the Facepunch transport on Spacewar AppID 480 until our AppID exists, plus a real two-account Steam test at every milestone.
- **Performance budget, gated from week 1:** 8 seats (7 bots) plus up to 2 live rooms. Host simulation ≤8 ms and frame time ≤16.6 ms at 1080p on the dev PC.

**Steam Timeline.** Facepunch.Steamworks master `SteamTimeline.cs` exposes:
- `AddInstantaneousTimelineEvent(title, description, icon, priority, startOffsetSeconds, TimelineEventClipPriority)`
- `AddRangeTimelineEvent` and `Start/Update/EndRangeTimelineEvent`
- `StartGamePhase` / `EndGamePhase`
- `SetGamePhaseId`, `AddGamePhaseTag`, `SetGamePhaseAttribute`
- `SetTimelineGameMode`
- `OpenOverlayToGamePhase` / `OpenOverlayToTimelineEvent`

J0 checked it, and the chair re-fetched it on 2026-09-29.

**Competitor: Frog Sqwad** (Steam 3989960, Panic Stations)
- Released 11 June 2026; up to 8-player co-op; eat to grow into a Megafrog.
- All-time peak of 1,078 concurrent players, about 47 when checked.
- 72% positive of 355 user reviews.
- It has no well, no doors, no rule monsters and no betrayal. Differentiate on those.

**Name evidence:** see §1. Sources are `inputs/master_explore/name_0.md` and `name_1.md`, plus the J0 and J1 re-checks.

**Still open (human tasks):**
- the trademark search;
- domains and handles;
- a Steam Direct AppID;
- Gates A and B with at least 4 friends;
- reading the Synty and Sonniss AI clauses before those assets enter the repo.
