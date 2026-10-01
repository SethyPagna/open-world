# THE NESTED WELLS: World Structure v1.0 (final)

**Date** 2026-09-28 · **Status** Authoritative for world structure. It is the buildable source of truth for the layered world of **KNOTSPIRE**.
**Authority split.** `_design/GDD.md` (KNOTSPIRE v1.0) owns rooms, the floor loop, social systems, bots, economy, cosmetics and the shop. This document owns everything *around* a run: where Landings sit, what the player sees beyond them, how runs chain into layers, the Draft maze, the scale reveals and the layer map. Where the two overlap, the GDD wins, except for the change requests listed in §15.
**Engine facts checked** against `_scaffold/`:
- three 0.186.1, postprocessing 6.39.5 and ws 8.21.3.
- `src/world/palettes.ts` and `sky.ts` already define the four biomes this document uses: `well`, `sky`, `space` and `beyond`.
- `kit.roundWell` and `kit.spiralStairs` exist.
- `core/post.ts` already renders ChromaticAberration in its own EffectPass.
- `server/` is still empty; the GDD schedules it for M4.

Every number below was computed, not estimated. The generator statistics come from a Monte Carlo run of the exact algorithm in §7 (scripts: `…/scratchpad/theta2.mjs`, `final.mjs`, `clr.mjs`).

---

## 0. What changed from Draft v0.1, and why

The draft designed a second game, with frogs, Horizon, a Bucket Crown and a different set of letters, on top of the GDD. Review 2 was right to call that critical. This version keeps the draft's world ideas and hangs them on the GDD run.

| # | Decision | Final | Draft v0.1 | Why |
|---|---|---|---|---|
| 1 | Unit of play | **One layer = one GDD run** (Floors 1–4 + the Crown, 36–45 min). The Ascent is a campaign of 4 runs. | 18 floors in one 85-min run | Every session ends on a reveal. Nobody has to sit 85–112 min. Rooms, the Draft, the Tide and the Crown stay exactly as the GDD specifies them. |
| 2 | Layers | **4 layers + the Revelation**: Well, Sky, Space, Beyond, then "Every sky is someone's well" | 5 layers, with Orbit and Star Sea split | Matches the user's own chain ("well → sky → space → bigger") and the four biomes already in `palettes.ts`. |
| 3 | Protagonist and voice | **Wicks**, with the **System** as the only voice | Froglets and a Keeper frog | The GDD fixes both. The frog survives as an idiom, a statue and the last silhouette (§10.6). |
| 4 | L1 geometry | **The Braid in the Well**: five stone strands spiral up inside a well (R 51 m), each topped by a GDD Landing | A 9 m shaft with collar walkways | GDD Landings stay open, warm 18 m discs. From every one of them the sky is only a coin. |
| 5 | Maze | **Theta Draft**: stone ribs rise between the stairwell and the door plates during the Draft on floors 2–4 | Maze only in L2 landings | Puts "layers from the centre outward" on every floor of the slice. |
| 6 | Letters, seats, instances, Crowns, bots, currency | **GDD §3–§11 unchanged** | Parallel systems | Only one design can be authoritative. |
| 7 | Ending direction | **Outward.** The web becomes moss on a stone in a *larger* well. | The web became a pebble at the Bottom ("Your well was all of it") | The idiom's lesson is that the circle is *not* everything. |
| 8 | Growth of powers | Each trait has a **layer scope** that applies from the start of the run; rooms clamp it by default | Cards rewritten during reveals | Traits are run-scoped in the GDD (§9.1), so growth has to show up at run start. |

---

## 1. Concept and the five laws

You are a Wick at the bottom of a well. You climb the Knotspire, a braid of stone strands, and the only sky you ever see is **the Coin**: a disc of light 180 m above the water. At the top of the braid the Crown fight happens under that Coin. When it ends, the Crown lifts you out of the well. The camera pulls back until your well is one of 64 on a mossy mound, in a sea of clouds, under a sky that turns out to be painted. Every run you climb one bigger well. The last pull-back passes through the web of galaxies and comes out at a stone in a well wall, a well far larger than yours, with watchers on its rim.

**The five laws** (everything below follows from them):
1. **The exit of every layer is the centre of the next.** Your well's mouth is the Sky's Foot. The painted dome is a patch on a planet. The planet's star is a point in the Beyond's knot. The web is moss on a stone.
2. **Every sky holds the ones who stopped.**
   - Burnt Out climbers rise as wisps and hang lanterns in that layer's sky.
   - The silent **lantern-folk**, the GDD's "ones who watch from above the Crown", hold the rest.
   - All of them look like anonymous stars until the reveal.
3. **Every layer leaks the next.** Each floor shows a bigger piece of the next layer: the Coin in L1, the dome tear in L2, the nebula in L3, the moss glints in L4 (§9.2). The X alcove hides a crack onto it (§6.4).
4. **Up is outward.** Floors map to concentric rings. The layer map (the astrolabe) is the world seen from far enough away, so a node's angle on the map is its real bearing in the world.
5. **The GDD run is the unit.** Nothing in the world structure changes a room's rules except its layer's **Layer Omen** (§9.1), and rooms opt into that the way they already opt into Omens.

---

## 2. Layer table

Floors are numbered continuously across the campaign, the way the manhwa does it. Layer ℓ's local floor k is global floor **5(ℓ−1)+k**, and the Crown is 5ℓ♛. Cycle 2 adds 20.

| # | Layer | Global floors | Macro format | Landings sit on | Transfer (the GDD "Stair") | Layer Omen | Build-up cue (Law 3) | Crown skin → exit | Palette / sky (scaffold ids) | Music | Trait scope | Title card |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| L1 | **THE WELL** 우물 | 1–4, **5♛** | **Tower** (the Braid) | 5 strands inside a well, 30 m apart in height and 72° apart in bearing | Climb inside the next strand: 4.5 s the first time, 2.5 s after | none (GDD baseline). The Tide skin is rising well water. | The Coin grows 31° → 74° | Bronze Snuffer (GDD) → the **Crown lift**, 57 m to the lip | `well` / `well` | GDD recipes as written (Landing waltz in F) + kalimba drips | ×1 (GDD numbers) | (★1) "Your sky was a hole." |
| L2 | **THE SKY** 하늘 | 6–9, **10♛** | **Maze** (cloud-wall archipelago) | Islands on rings at 900 / 1,400 / 2,000 m across a bowl; Crown on the rim at 2,600 m | Wind-lane ride, 8 s | **UPDRAFT** | A dome tear at the zenith, 1° → 20° | Thunderhead bell → updraft through the dome | `sky` / `day` | Up a fifth (C) + breathy flute | range ×2, duration ×1.5 | (★2) "Your sky was a ceiling." |
| L3 | **SPACE** 우주 | 11–14, **15♛** | **Dungeon** (station decks, bulkheads) | Decks on orbits at 1.5 / 2 / 3 R of a 600 km planet; Crown at the moon (4 R) | Pod, 10 s | **DRIFT** | A magenta nebula smear, 5° → 90° | Docking bell → slingshot | `space` / `space` | G + FM glass bells | ×2 and through one wall; ×1.5 | (★3) "Your world was a speck." |
| L4 | **THE BEYOND** 너머 | 16–19, **20♛** | **Maze of dungeons** | Knots along a filament at 40 / 90 / 150 Mly; Crown on the halo at 220 Mly | Filament glide, 10 s | **LIGHT-LAG** | Moss-green glints, 3 → 120 | Halo bell → step off the halo | `beyond` / `beyond` | D + formant choir pad | ×3; ×2 | (★4) "Every sky is someone's well." |
| ★ | **THE REVELATION** 井底之蛙 | after 20♛ | Cinematic | A colossal well | — | — | — | — | L1 palette, warmer | F, orchestrated, ends on a music box | — | `[ TUTORIAL COMPLETE ] The game begins now.` |

**Keys:** each layer transposes every GDD recipe up a fifth, folded into ±6 semitones: L1 +0, L2 −5, L3 +2, L4 −3, Revelation +0. So the waltz runs F → C → G → D → F.

**The reveal motif** is the run's own seeded 5-note Landing motif (GDD §15.2), played at half speed in the next layer's key. Because the motif is pentatonic, any chimes players add over it will harmonise.

---

## 3. Runs, the campaign and meta progression

### 3.1 How a run maps onto a layer
- A run is a GDD run: the Foot, Floors 1–4, the Crown, then the Ledger.
- The world structure adds only four things to it:
  1. where each Landing sits (§4, §5);
  2. the Draft maze (§7.3);
  3. the Tide skin (§4.6);
  4. the Crown exit into the reveal, with the results staged at the next layer's Foot (§10).
- **Room tier** rises with the layer: `tier = GDD tier + (ℓ − 1)`, capped at 5. At the cap that means timer −24% and monster speed +32%.
- The Layer Omen does **not** count toward the GDD's Omen counts per floor.

### 3.2 The campaign ("the Ascent")
- **Surfacing.** Every climber who reaches the Crown (anyone who is not Burnt Out) **surfaces** from that layer. This holds whatever the ending: Candlelit, Everflame or Snuffed Summit. A failed summit changes how the reveal looks, never whether you see it.
- **Surfacing is stored in the local profile.** The GDD's IndexedDB profile gains `surfaced: {cycle, layer}[]`, with no server persistence.
- **Choosing the layer in the lobby:**
  - The host may pick any start layer from 1 to 1 + the highest layer any human has surfaced (at most 4).
  - **The default is the lowest layer that some human hasn't surfaced yet,** so nobody is spoiled by accident.
  - If the host picks higher, the lobby warns: `[ NOTICE ] 2 Wicks have not left the Well. They will skip what they skipped.`
- **Tourist Pass.** Players who skip a layer keep its reveal unseen until they surface that layer in a later run. At a higher layer's Foot they see only a 6 s "you are here" astrolabe animation, with the lower bands drawn dashed. No vista is shown, so nothing is spoiled.
- **Next Layer.** At the results (§10.2), a **Next Layer** button starts a new run in layer ℓ+1 with the same lobby. Rivals refill any empty seats.
- **Campaign length:** 4 runs of about 38 min each (§12), plus the 75 s Revelation, comes to about **2.6 h over 4 sessions**.

### 3.3 Meta progression (no power, per GDD §9.1)

| Unlock | How it's earned | What it does |
|---|---|---|
| **Layer access** | First surfacing of layer ℓ | You can start runs in layer ℓ+1 |
| **4 surfacing titles** (change request CR7): *Out of the Well*, *Above the Paint*, *Speck-Walker*, *Someone's Well* | First surfacing of L1–L4 | The GDD title rules apply: +15 Drips and +1 private Altar card for the rest of that run |
| **Scale Plates** (a Codex page) | Every reveal seen; every Seam found | Replay reveals at first-view length. A Seam fills in its plate's sketch. |
| **Lit wells** on the Mound | Each Candlelit (gold), Everflame (white) or Snuffed Summit (ember) you finish in L1 | They glow in every ★1 you watch and on the run-select Mound (SHOULD). Stored locally, up to 63. |
| **Surfacing Holders** (earned-only prestige, GDD §12.5; CR12) | First surfacing of each layer | Well-stone, Paint-chip, Meteor-iron and Knot-glass candle holders |
| **Cycle 2: The Well Above** | Watching the Revelation | Floors 21–40; each layer adds the next layer's Omen at half strength (LATER) |

**Nothing sells information.** Door plaques, redaction and hints follow the GDD's Codex and Scar rules only.

---

## 4. Layer 1 geometry: the Braid in the Well

### 4.1 The well
- **The well.** An open stone cylinder with inner **radius 51 m** and lip at **y = 180 m**. It uses `kit.roundWell` with radius 51, height 184 and thickness 1.2, about 534 segments, merged into one draw call.
- **Water.** The floor of the well is water at y = −2 m, under a height-fog mist from −2 m to +8 m.
- **The Coin.** The sky shader is `sky.ts` kind `well`, with `shaftRadius` 51 and `oculusHeight` 180. Its oculus draws the **live L2 sky** at the run's time of day:
  - afternoon on Floor 1;
  - dusk by Floor 4, which keeps the GDD's Landing dusk palette `#1B2340`→`#F2A65A`;
  - night at the Crown, the GDD's starfield `#0B0E1F`.

### 4.2 The five strands
- **Placement.** Each strand is a stone column (r 5 m, braided fluting) rising from the water. Strand k is centred **d = 30 m** from the well axis at bearing **φ₀ + 72°·(k−1)**.
- **Tops.** The column's top is Landing k's deck, at **y = 0 / 30 / 60 / 90** for Floors 1–4. Strand 5 carries the **Crown arena** (r 20, GDD §6.13) at **y = 120**.
- **Inside.** Every column holds a spiral stair (`kit.spiralStairs`) that ends in the Landing's central **stairwell well** (r 3, GDD §10.1). "Arrivals climb up from below" is literally true.
- **Orientation.** On each Landing, GDD "north" is **radially outward, toward the well wall**. The door arc (r 16) has its back to the wall, with a 2 m misty gap (parapet at r 19, wall at 51 − 30 = 21 m). The stations on the south half face across the well to the other strands.
- **The Crown ring.** It hovers 30 m above the arena (y 150), per GDD §6.13, and the Snuffer hangs from it. The lip is 60 m above the arena.

```
 Unrolled side view (bearings spread left→right, 72° apart)
 y 182   ○    ○    ○    ○    ○    ○   lantern-folk lanterns, r 47 m, poles leaning in from the lip
 y 180 ══╧══════════════════════════════════════════╧══ lip, R 51 m ════════
 y 150                                   ♛ crown ring, chain, Snuffer
 y 120                             [==== CROWN arena r 20 ====] strand 5 (288°)
 y  90                 [= Landing 4 =] strand 4 (216°)
 y  60      [= Landing 3 =] strand 3 (144°)
 y  30                                    [= Landing 2 =] strand 2 (72°)
 y   0  [= THE FOOT =] strand 1 (0°)
 y  −2 ~~~~~~~~~~~~~~~~~ well water + mist; the Tide rises here ~~~~~~~~~~~~~~~~~
```

### 4.3 The Coin grows

Angles are measured from each Landing's centre at eye height 1.6 m, so the viewer is off-axis. "Eclipsed" means the share of the Coin hidden behind higher strands.

| Position | y (m) | Coin (radial-plane diameter) | Share of the upper sky | Eclipsed | When (median run, §12) |
|---|---|---|---|---|---|
| The Foot, Floor 1 | 0 | **31.1°** | 3.7% | 21% (the Crown's underside and the Snuffer hang in it) | 0:00 |
| Floor 2 | 30 | **36.7°** | 5.1% | 7% | ~7:30 |
| Floor 3 | 60 | **44.4°** | 7.6% | 1% | ~15:00 |
| Floor 4 | 90 | **55.9°** | 12.0% | 9% | ~22:30 |
| The Crown | 120 | **74.0°** | 21.1% | 0% | ~30:00 |
| Crown lift, y 140 / 160 / 177 | — | 93° / 126° / 175° | 33% / 57% / 96% | 0% | ★1, 0–6 s |

- **Growth.** The visible sky grows 5.7× over the run, with no extra systems.
- **Foreshadowing.** From the Foot, the Crown's underside and the Snuffer's silhouette sit inside the Coin: the boss is visible from minute zero.
- **Clearance.** The sightline from every Landing's centre to the Coin's centre clears all higher strands by at least **8.5 m** (Foot vs the Crown: 8.5 m; others 10.6–13.2 m). This is re-checked in CI (gate G3).

### 4.4 Honest stars
- **Lantern-folk.** There are 12, spaced 30° apart starting at φ₀. Each holds a lantern on a 3 m pole that leans in from the rim, putting the lantern at **r 47 m, y 182 m**.
- **Burnt Out climbers.** A Burnt Out climber's wisp rises at 3 m/s (GDD Smoke speed) along the axis. From Floor 4 the climb takes 31 s. It hangs its lantern at the same radius, at the bearing of its last Landing.
- **The geometry holds.** From every point on every Landing's parapet, the line to any lantern crosses the lip plane at r ≤ 47.0 m (the lip is 51 m). So every "star" in the Coin sits at the lantern's real position, and no fake mapping is needed.
- **Anonymous until ★1** (review 0 C2):
  - Lanterns render as warm-white points (`#FFF4E0`) with no colour, shape or name.
  - A Burnt Out human sees `[ YOU ARE A STAR NOW ] Don't tell them.`
  - Their Keyhole spectate (GDD §5.3) is framed from the lip looking down. **Their camera never looks up**, so they don't see the Sky early.

### 4.5 Making the Coin readable without looking up (review 1 C1)
- **Pitch range.** On Landings the GDD third-person camera gets a range of −55° to **+80°**. This is an extra export from our camera module, since `api.ts` stays frozen.
- **Coin glance.** On your **first** arrival at each Landing in a run, as you climb out of the stairwell:
  - the camera tilts to +65° over 0.6 s, holds 0.6 s and returns over 0.5 s;
  - any mouse movement over 2° cancels it.
  This gives one ritual look at the Coin per floor.
- **Light pillar.**
  - An additive tapered cylinder of dusk light runs from the lip (r 51) to the water (r 45), with 400 instanced dust motes.
  - Its opacity per client is `0.04 + 0.4 × share(current floor)`, which is 0.055 at the Foot and 0.124 at the Crown.
  - Lantern motes drift down the pillar.
- **Reflection.** The water shader intersects the reflected view ray with the known disc (y 180, r 51), so there's no Reflector pass. Looking over any parapet you see the Coin below you as well.
- **Draft Cam cutaway.** The GDD Draft Cam (40 m, 70° tilt) sits 16.3 m from the axis and 29.4 m from the next strand's centre. Anything above y_k + 8 m dither-fades out over 0.3 s while the Draft Cam is active, but the well wall stays.

### 4.6 The Tide is the well filling (review 0 M1, as a skin)
- **Trigger.** When the GDD Tide for floor k runs out (§3.3 step 9), the well water surges at **2 m/s** up to **y_k + 1.0 m**. Landing k drowns in view of Landing k+1.
- **Nobody is standing there.** Everyone left on floor k is latched inside a room, so this is purely visual, alongside the GDD fog surge.
- **Cap.** The water never goes above y 91.
- **Tide clock.** The GDD Tide clock on the stairwell rim becomes a brass float gauge.
- **The GDD rule is unchanged:** rooms still running on floor k get Pressure.

### 4.7 What lives where
- **Rooms.** They are instances behind the doors, "inside the well wall". The GDD biomes (Belfry Stone … Ash Court) are unchanged.
- **Other Landings.** They render at LOD 1: the deck, the doors, and minigame props as impostors. Every climber's flame is visible as a bloom sprite. Name tags show within 25 m (GDD perception).
- **The stone frog.** A 0.6 m statue sits beside the Foot's Keyhole Rail, looking up (CR8). Inspecting it shows `[ INSCRIPTION ] 井底之蛙. Worn smooth where someone kept pointing up.`

---

## 5. Ring map topology: concentric layers, centre outward

### 5.1 Where each floor sits

| Layer | The Foot (layer centre = the previous exit) | Floor 2 | Floor 3 | Floor 4 | Crown (layer rim) | Bearing |
|---|---|---|---|---|---|---|
| L1 Well (m) | strand 1, y 0, d 30 | y 30 | y 60 | y 90 | y 120 (lip 180) | φ₀ + 72°(k−1) |
| L2 Sky (m, from the mound centre) | the rim of your well, mound radius 120, alt 0 | 900 m, +60 | 1,400 m, +150 | 2,000 m, +280 | 2,600 m, +480 | same rule |
| L3 Space (km, from the planet centre, R = 600) | a deck just outside the torn dome, 632 km | 900 km (1.5 R) | 1,200 km (2 R) | 1,800 km (3 R) | the moon dock, 2,400 km (4 R) | same, in the orbital plane |
| L4 Beyond (Mly, along one seeded filament path) | your galaxy's knot, 0 | 40 Mly | 90 Mly | 150 Mly | the halo ring, 220 Mly | same |

- **Every Landing is a GDD Landing:** an 18 m disc, the door arc on the north, the stairwell well at the centre, the stations on the south.
- **"North" is always outward from the layer centre,** so on every Landing you walk out of the centre, through the maze, to doors that face the next ring.

### 5.2 Tower, maze and dungeon at three scales (the user's "tower… dungeon… maze with dungeons")

| Scale | L1 Well | L2 Sky | L3 Space | L4 Beyond |
|---|---|---|---|---|
| **Macro** (how floors connect) | **Tower**: you climb a braid | **Maze**: an archipelago you cross on wind lanes | **Dungeon**: station decks joined by docking pods | **Maze of dungeons**: a filament maze whose knots are sealed decks |
| **Meso** (the Draft, §7.3) | *Stair*: 3 corridors, Floors 2–4 | *Labyrinth*: 4 corridors of cloud walls, Floors 1–4 | *Bulkheads*: 3 corridors; extra gaps cycle 4 s open / 4 s shut | *Labyrinth* of constellation lines; each bay is an airlock (1.5 s cycle) |
| **Micro** (rooms) | GDD rooms (dungeon cells behind doors) | GDD rooms under UPDRAFT | GDD rooms under DRIFT | GDD rooms; LIGHT-LAG between rooms |

**Spire choice** (review 2 F5) applies in L1 only, since the other layers have fixed formats:
- **Stair** (MUST, default).
- **Labyrinth** (SHOULD): the L2 maze pattern on L1 stone.
- **Undercroft** (LATER): every bay becomes a locked antechamber opened by the key action of the previous floor's room.

In the lobby the choice appears as three candidate wells on the Mound (SHOULD, §11.5).

### 5.3 Transfers
The GDD's **Stair** (Exit Vestibule → next Landing) becomes the layer's transfer. It is scripted: camera on rails, no physics, no bot pathing.

| Layer | Transfer | Duration |
|---|---|---|
| L1 | Spiral climb inside the next strand | 4.5 s the first time, 2.5 s after |
| L2 | Wind lane | 8 s |
| L3 | Pod | 10 s |
| L4 | Filament glide | 10 s |

Side Doors (GDD §3.8) are unchanged.

---

## 6. Doors and lettering

### 6.1 Letters (GDD §3.4, unchanged)
- **A Arena, B Baffle, C Chain & Climb, D Dilemma, E Enigma.**
- **X** is Old Tallow's Market alcove, not a room. **♛** is the Crown.
- **Doors per floor:** `P ≥ 5 ? 4 : 3`.
- **Floor 1:** A B C E (with 3 doors: A B E, which reads exactly like the manhwa's "1A, 1B, 1E").
- **Floors 2–4:** always A and E, plus letters drawn from {B 30, C 30, D 40}, with at least one D across Floors 2–3.

### 6.2 Placement on the ring
- **Positions.** Doors sit on the north arc at r 16, 40° apart and centred on north.
- **Order.** The GDD ring order runs **A, B/C/D…, E** from west to east as seen from the stairwell. The plate reads left to right like the manhwa ("1A 1B 1C 1E"), and the Grate wraps E|A (GDD).
- **Bays.** Each door has a **bay** 40° wide: the plate zone at r 12.9–16. Stone **fins** at the midpoints between doors separate the bays (§7.3).

### 6.3 Designations
- **Plaque.** The carved plaque shows **layer glyph + global floor + letter**: `◯ 2D`, `☁ 7B`, `✦ 13E`, `∞ 18A`, and Crowns `5♛`, `10♛`, `15♛`, `20♛`.
- **Glyphs** are SVG paths, not font glyphs.
- **System text** follows the GDD: `Door 7D: The Weighing Hall`.
- **Room logic** (floor bands, `fm`, tier) uses the **local** floor 1–4. Only the display is global.
- **Echo rooms** (GDD §3.5) say "Echo" on the plaque. There are no primes anywhere in the UI.

### 6.4 X alcove and the Seam
- **Placement.** The GDD roll is unchanged: 35% on Landings 2–4. The world plan puts the hidden panel on one of the 24 parapet panels whose bearing lies outside the door arc, ±(20°·doors + 10°).
- **In the Braid** the alcove is a niche cantilevered out over the well (CR6).
- **The Seam** (SHOULD) is a second tile inside the alcove: a crack in the well wall opposite the niche. It pays nothing. Finding it fills in a Codex Scale Plate.

| Layer | What the Seam shows (ambiguous on purpose; review 0 m2, review 2 F13) |
|---|---|
| L1 | A warm draft and a sliver of daylight. The frog's pond ripples. |
| L2 | A torn corner of the painted dome, with real stars behind it |
| L3 | A porthole where night-side lights curl into a spiral |
| L4 | Veins glimpsed through fog. Moss? Filaments? |

---

## 7. Generation algorithm

### 7.1 Principles
- **Who runs it.** The authority runs it once per run: the Node server, or the solo Web Worker. It is shared code in `src/game/world/plan.ts`.
- **Broadcast.** The authority sends the result as a reliable `world_plan` event of 4 KB or less (review 1 A4). **Clients never regenerate it,** so small cross-engine differences in `Math.cos` can't split a lobby.
- **Integer decisions.** Every discrete decision uses sfc32 plus integer degrees. Trigonometry is used only for positions and route lengths.
- **Door letters stay with the GDD.** Letters, rooms and Omens still come from GDD `generateFloor(seed, floor, P, used)` at each Intermission, because P is only known then. That is why the plan pre-builds a maze for **both** possible door counts.

### 7.2 Types and entry point
```ts
export type LayerId = 1 | 2 | 3 | 4;
export type Spire = 'stair' | 'labyrinth' | 'undercroft';
export interface WorldPlan {
  towerSeed: string; cycle: number; layer: LayerId; spire: Spire;
  phi0Deg: number;                       // integer 0..359
  landings: LandingPlan[];               // local floors 1..5 (5 = Crown)
  alcove: { floorLocal: 2 | 3 | 4; panel: number /* 0..23 */ }[];
  lanternFolk: number[];                 // 12 bearings (deg)
  vistaSeed: number;                     // mound, islands, dome, galaxy, web
}
export interface LandingPlan {
  floorLocal: 1 | 2 | 3 | 4 | 5; floorGlobal: number;   // 20(cycle-1) + 5(layer-1) + floorLocal
  bearingDeg: number;                    // (phi0 + 72(k-1)) mod 360; also the Landing's north
  pos: [number, number, number];         // layer frame, float64, units per §5.1
  maze3: ThetaMaze | null;               // null on the Foot (stair) and the Crown
  maze4: ThetaMaze | null;
}
export interface ThetaMaze {
  corridors: 3 | 4; rIn: 4.2; rOut: 12.9; alphaDeg: number;   // alpha = 20 * doors
  cells: { c: number; i: number; a0: number; a1: number }[];   // a0/a1 are exact rationals of alpha
  open: Uint8Array;                     // per candidate wall: 1 = gap (1.2 m wide), 0 = rib
  mouths: [number, number];             // corridor-0 cells open to the stairwell walkway (r 3.0–4.2)
  cycling?: Uint8Array;                 // L3 bulkheads: extra gaps with phase 0 or 4 s
  attempt: number;
}

export function generateWorldPlan(towerSeed: string, cycle: number, layer: LayerId, spire: Spire): WorldPlan {
  const h = xxhash32(`${towerSeed}|${cycle}|${layer}`);
  const rng = sfc32(h, 0x9e3779b9, layer, cycle);
  const phi0 = Math.floor(rng() * 360);
  const landings = [1, 2, 3, 4, 5].map((k) => {
    const bearing = (phi0 + 72 * (k - 1)) % 360;
    const mazeOn = k <= 4 && (spire !== 'stair' || layer > 1 || k >= 2);
    return {
      floorLocal: k, floorGlobal: 20 * (cycle - 1) + 5 * (layer - 1) + k, bearingDeg: bearing,
      pos: layerPosition(layer, k, bearing),                        // §5.1 table
      maze3: mazeOn ? thetaMaze(rng, 3, corridorsFor(layer, spire)) : null,
      maze4: mazeOn ? thetaMaze(rng, 4, corridorsFor(layer, spire)) : null,
    };
  });
  const alcove = [2, 3, 4].filter(() => rng() < 0.35)                // GDD §3.5 step 7
    .map((f) => ({ floorLocal: f, panel: pickPanelOutsideDoorArc(rng) }));
  return { towerSeed, cycle, layer, spire, phi0Deg: phi0, landings, alcove,
           lanternFolk: [...Array(12)].map((_, j) => (phi0 + 30 * j) % 360), vistaSeed: rng() * 2 ** 32 >>> 0 };
}
```

### 7.3 The Theta Draft maze (review 2 F4, review 0 C3)
**When.** At `[ DOOR DRAFT ]` (GDD T−45 s), stone ribs rise from the Landing floor in 0.8 s:
- **Height** 1.5 m, above the GDD's 1.3 m auto-mantle and 1.4 m jump apex, so they can't be hopped. The 1.6 m-high camera still sees over them.
- **Thickness** 0.4 m.
- **Anyone overlapping a rib** is pushed to the nearer cell.
- **Ribs sink at T−0,** when the spots lock, so the GDD Draft wind and the Latch walk-in are never blocked.

**Geometry** (north sector only; the south half and its stations stay open):
- The **walkway ring** at r 3.0–4.2 circles the stairwell and joins the south half to the maze through **2 seeded mouths**.
- **Corridors:**
  - *Stair* (3 corridors): [4.2, 7.1], [7.1, 10.0], [10.0, 12.9] m, 2.9 m wide.
  - *Labyrinth* (4 corridors): 2.18 m wide.
- **Sector:** ±α with α = 20°·doors, which is ±80° for 4 doors and ±60° for 3.
- **Cells per corridor:** n_c = doors + 2c. For 4 doors that is 4 / 6 / 8, giving cell arcs of 3.7–3.75 m, close to square.
- **Boundary walls** run along ±α from r 4.2 to 16.8. Fins between bays run from 12.9 to 16.8.
- **Bays.** Each bay opens into every outer-corridor cell whose arc overlaps it by at least 50%, so each bay has 2 cells to enter from.

**Algorithm** (`thetaMaze(rng, doors, C)`):
1. Build the cell graph. Candidate walls are spokes between neighbouring cells in a corridor, and ring segments wherever cells in adjacent corridors overlap by more than 1°.
2. Pick 2 distinct mouths in corridor 0.
3. Carve a randomised DFS spanning tree from mouth 1.
4. **Repair.** While any bay has fewer than **2 edge-disjoint routes** (unit max-flow from the walkway), open a random closed rib. At most 6 repairs are allowed.
5. **Validate** with Dijkstra on cell centres:
   - every bay's shortest route is 9–36 m (Labyrinth: 9–44);
   - the spread between the nearest and farthest bay is 20 m or less (Labyrinth: 24).
6. If validation fails, retry with `attempt + 1`, up to 16 attempts. The **fallback** is a hand-authored "comb": every spoke in the outer corridor open, one gap per ring wall. CI validates the comb too.

**Measured** (Monte Carlo of exactly this algorithm):

| Variant | Seeds | Fallbacks | Mean attempts (p99) | Route p5 / p50 / p95 | Bay spread p50 / p95 | Repairs | Ribs left closed |
|---|---|---|---|---|---|---|---|
| Stair, 3 doors | 50,000 | **0** | 1.28 (4) | 12.0 / 15.1 / 20.3 m | 5.0 / 10.6 m | 2.6 | 45% |
| Stair, 4 doors | 50,000 | **0** | 1.55 (6) | 11.7 / 16.4 / 24.6 m | 7.9 / 15.3 m | 2.8 | 43% |
| Labyrinth, 3 doors | 10,000 | **0** | 1.54 (6) | 11.9 / 16.2 / 23.9 m | 6.1 / 12.3 m | 2.5 | 52% |
| Labyrinth, 4 doors | 10,000 | **0** | 1.33 (5) | 12.3 / 19.5 / 28.9 m | 9.4 / 18.2 m | 1.5 | 53% |

**What it does to play:**
- The median route is about **3.3 s** at 5 m/s, well inside the 45 s Draft.
- Switching doors now costs a real detour of about 1–4 s, because the fins stop you walking along the plates. **That matters during the 10 s Stampede.**
- The 1.2 m gaps are real chokepoints for GDD Stampede shoves.
- Two disjoint routes per bay mean one griefer can never seal a door.

**Bots and the lobby:**
- Bots re-bake the 0.5 m nav grid when ribs rise or sink (72 × 72 cells over the disc, under 2 ms).
- The lobby has a toggle, **Draft maze: on / off** (default on), for the A/B gate H4.

### 7.4 Parameters

| Param | L1 | L2 | L3 | L4 |
|---|---|---|---|---|
| Bearing step between floors | 72° | 72° | 72° | 72° |
| Maze pattern / corridors | Stair 3 (Floors 2–4) · Labyrinth 4 (Floors 1–4, SHOULD) | Labyrinth 4 (Floors 1–4) | Bulkheads 3, the repair gaps cycling 4 s/4 s (phase 0 or 4 s) | Labyrinth 4; bays are airlocks (1.5 s cycle) |
| Route limit / spread limit | 36 / 20 m (Labyrinth 44 / 24) | 44 / 24 | 36 / 20 (always-open gaps alone must validate) | 44 / 24 (+1.5 s airlock) |
| Rib material | stone | cloud (soft collider, same geometry) | bulkhead plates | constellation lines (glowing) |
| X alcove chance | 35% on Floors 2–4 (GDD) | same | same | same |
| Tier offset | +0 | +1 | +2 | +3 (cap 5) |

### 7.5 Validation run in CI
1. Every maze variant: 50,000 seeds × {3, 4} doors → **zero fallbacks**, every bay with 2 disjoint routes, route and spread limits met.
2. Braid clearance: each Landing's centre sightline to the Coin clears every higher strand by at least 3 m (currently 8.5 m at minimum).
3. Alcove panels never overlap a door bay.
4. A plan hash taken for 1,000 seeds on Node, Chromium, Firefox and WebKit. This is informational, since plans are broadcast.

---

## 8. Meeting and instance rules (solo bots and multiplayer)

### 8.1 Canonical (GDD, unchanged)
- **The Door Draft** (§3.6): 45 s, 0.5 s claims, Calm then Stampede, and "Everyone sees everything, live".
- **The Latch** and Hold the Door.
- **Instances:**
  - a door with a human inside is a live instance (30 Hz tick, 20 Hz snapshots);
  - a bot-only door runs the **Ghost Sim**;
  - a Side Door visitor takes over a ghost room.
- **Grates** (A|E adjacent), **Keyholes**, **Reunion** barks, **the Tide**.
- **Solo** = 1 human + 7 Rivals, the Drama Director and the Rival Register.
- **Disconnects** get the 60 s Autopilot.

The world structure changes **none** of these rules. It adds only the following.

### 8.2 World additions
1. **You can see the other Landings.** In L1 the strands are 30 m apart in height and 72° apart in bearing:
   - climbers who went up first show as flames on the Landing above you;
   - stragglers show on the one below.
   - The Landing instance streams the flame positions of climbers on *other* Landings at 2 Hz (8 × 12 B × 2 Hz ≈ 0.2 KB/s, well inside the GDD's 12 KB/s budget).
   - In solo, Ghost-Sim Rivals appear on the next Landing at their timeline's arrival times, with no physics. The Braid is never empty.
2. **Draft maze** (§7.3). The only change to the Draft is physical routing.
3. **Burnt Out climbers become Watchers** (Law 2). Their GDD permissions are unchanged: spectate, minigames, Notes and bets. They also get a lantern in the layer's sky and a from-above Keyhole framing.
4. **LIGHT-LAG** in L4 is the only layer rule that touches meeting (§9.1).
5. **Layers and lobbies:** start layer, Tourist Pass and Next Layer (§3.2).
6. **Reveal sync:**
   - The authority sends `reveal_start {layer, variant: 'candlelit'|'everflame'|'snuffed', t0}` when the Crown ending resolves.
   - Every client starts at **t0 + 500 ms** server time, using the median offset of 5 GDD pings.
   - Clients enter the state `TRANSIT`: inputs are limited to free look and emotes.
   - **Everyone plays the same camera path,** so a voice call sees the same frame.
   - A client who rejoins during a reveal plays the repeat cut from the current t.
   - Solo's Worker sends the identical message.

---

## 9. Per-layer rules, visuals, music and powers

### 9.1 Rules (one headline rule per layer, delivered as a **Layer Omen**)
- **How rooms opt in.** A Layer Omen follows the GDD Omen contract: each `RoomDef` lists `layerOmens: ('UPDRAFT' | 'DRIFT' | 'LIGHT_LAG')[]`.
- **Rooms that don't list it** get the reskin only. The rule still applies on Landings, transfers and the Crown.
- **Default for the 12 slice rooms:** none. They opt in once they have been tuned for that layer (LATER).

| | L1 Well | L2 Sky | L3 Space | L4 Beyond |
|---|---|---|---|---|
| **Layer Omen** | — (GDD baseline) | **UPDRAFT** | **DRIFT** | **LIGHT-LAG** |
| **Effect** | — | Gravity ×0.55. Hold Jump in the air to glide: fall speed at most 3 m/s, up to 1.5 s per jump. Landing gusts every 20–40 s push 4 m/s sideways for 2 s, telegraphed 1 s ahead by streamers. | Gravity ×0.25. **No air deceleration**: you keep your momentum until you touch a surface, Grab or Brace. Brace = magboots: you stick, and shoves against you are reduced by 100% instead of 75%. Brighten costs 2 wax/s. | Anything **outside your own instance** is drawn `min(1.5 s, d / 15 m/s)` in the past. That covers other Landings, plates, grates, Keyholes and the astrolabe. **Inside your room everything is live** (review 0 M3, review 1 B5). Plate fullness is confirmed only when you claim: a full spot bounces you off with a chime. |
| **Physics contract** | GDD | `gravityScale` plus a capped fall speed | `gravityScale` plus zero air damping; capsules stay vertical (review 1 E2) | Server-side ring buffer, 8 × 30 samples × 48 B ≈ 11.5 KB |
| **Void fall** (GDD −15, respawn at the checkpoint) | as GDD | "The updraft returns you" | "The tether reels you in" | as GDD |
| **Tide skin** | Well water drowns the floor below | A storm front rolls under that island ring | That deck's lights fail | That knot's filaments go dark |
| **Minigames** | GDD | Snuff Tag and Wax Stack under UPDRAFT (towers wobble more) | Pinky Promise in zero-g booths | as GDD |

### 9.2 Visuals

| | L1 | L2 | L3 | L4 |
|---|---|---|---|---|
| Palette / sky kind | `well` / `well` (the Coin shows the live L2 sky) | `sky` / `day` (a painted dome, R 30 km) | `space` / `space` | `beyond` / `beyond` (concentric halo rings) |
| Time of day | Afternoon (F1) → dusk (F4) → night (Crown) | Dawn → noon → sunset | Day side → terminator → night side | — |
| Build-up cue per floor (Law 3) | Coin 31° / 37° / 44° / 56° / 74° | Dome tear 0° / 1° / 3° / 8° / 20° | Nebula smear 5° / 15° / 40° / 60° / 90° | Moss glints 3 / 12 / 40 / 80 / 120 |
| Landings, transfers and reveals (the waltz; review 2 F9) | Warm lanterns `#FFB86B` (GDD Warm Landing) | Sunlit | Floodlit deck; the planet fills ≥ 35% of the view from the deck | Nebula fog `#FF8FD0`, density 0.015; mean scene luminance ≥ 0.18 |
| Rooms (the dread) | GDD biomes, dark | GDD biomes plus thunderhead interiors and night islands; ambient ≤ 0.1, fog ≤ 15 m | Derelict modules, same limits | Dead-star interiors, same limits |
| Watchers (Law 2) | Lanterns over the lip | Lanterns behind pinholes in the dome (the painted stars) | Beacons on the moon | New stars on the halo |
| Crown skin | Bronze Snuffer (GDD) | Thunderhead bell (the drop is telegraphed by lightning) | Docking bell (a hull-plate clamp) | Halo bell (glass, a tiny galaxy inside) |

**Blending between layers.** `LayerLook = {palette, skyKind + params, fog, key, hemi, PostLook, particles, music}`:
- Colours lerp in OKLab and fog density lerps in log space.
- `PostApi.setLook` already blends the numeric parameters.
- The blend runs over the last 3 s of each reveal.

### 9.3 Music
| | L1 | L2 | L3 | L4 | Revelation |
|---|---|---|---|---|---|
| Transposition of every GDD recipe | 0 (Landing waltz in F) | −5 (C) | +2 (G) | −3 (D) | 0 (F) |
| Added layer voice | Kalimba drips, keyed to the water | Breathy flute (noise + formant) | FM glass bells (1:3.5) | Formant choir pad | The whole kit, ending on a music box |
| Reveal motif | — | ★1: motif ×2 slower, in C | ★2: in G | ★3: in D | ★4: original tempo, in F |

The GDD's intensity layers (Calm / Tension / Pressure) are unchanged.

### 9.4 Powers (the scope contract)

GDD traits (16) and fusions (8) are run-scoped. The world structure only widens their **scope by layer, from the start of the run**. There is no cutscene rewrite and no use counter (review 2 F10, partly applied).

| | L1 | L2 | L3 | L4 |
|---|---|---|---|---|
| Range | ×1 | ×2 | ×2, and passes through one wall | ×3 |
| Duration / radius effects | ×1 | ×1.5 | ×1.5 | ×2 |
| Card badge | ◯ | ☁ | ✦ | ∞ |
| Examples | Resonance 6 m · Firebrand 10 m · Echo Wick 6 s | Resonance 12 m · Firebrand 20 m · Echo Wick 9 s | Resonance 12 m through a hull · Firebrand 20 m | Resonance 18 m · Firebrand 30 m · Echo Wick 12 s |

- **Where the widening applies:** Landings, transfers, minigames, the Crown, and rooms that declare `layerScope: 'full'`.
- **Where it doesn't:** rooms default to `'clamp'`, meaning L1 numbers, so a wider power never trivialises an old puzzle. A room switches to `'full'` once it has been tuned for that layer.
- **Hold for the narrow form** (hold 0.3 s to cast the L1 form) comes with the first `'full'` room (LATER).
- **At each reveal** a single System line previews the next run: `[ OUTGROWN ] Resonance will not fit the next well.` It names the trait you used most this run.

---

## 10. Scale reveals

### 10.1 Pipeline (shared by all reveals)
**Shells:**
- Each scale is its own `Scene` in local units, with no coordinate above 1e5.
- **Camera-relative rendering.** The camera stays at the origin and each `shellRoot.position = −camPos`, computed in float64 on the CPU every frame (review 1 C3).
- Outer shells render first with a scaled camera (`pos / k`, same rotation and FOV), then depth is cleared, then the inner shell renders.
- This is implemented as a `ShellRenderPass` (`src/world/shells.ts`): `RenderPass(outer)`, then `RenderPass(inner)` with `clearPass.depth = true` and `ignoreBackground`. It is inserted through an **extra** `PostStack.setShells()` method, so `api.ts` is unchanged.
- **No `logarithmicDepthBuffer`.** Near plane = max(0.05, 0.01·d).

**Handoff masks.** A shell swaps only under one of these:
- a **whiteout**. It ramps over at least 600 ms and fades over at least 400 ms, so it is never a flash (GDD §14.4 photosensitivity). An overlay reaches α = 1.0 for at least 3 frames around the swap (review 1 C4).
- a **fog wall**;
- the **paper tear**;
- the **periapsis bloom**;
- the one **blink** (★4);
- or once the old scale is an **impostor under 48 px**.

In reduced-motion or photosensitive mode, a cream (`#F4EDE3` at 85%) crossfade replaces the whiteout and the blink.

**Snapshot impostor.**
- It is captured **during Crown Phase 3**, never on exit, which would hitch (review 1 C5).
- It is a top-down 512² render of the lit well (or deck, or knot), mapped onto its mouth disc in the next shell. **It shows your run:** lit Landings, and the Candlelit glow climbing the braid.

**Beacons.** Each climber is a constant-screen-size flame sprite of at least 14 px with a name tag (Wick numbers in streamer mode). They are the last things visible.

**Post-processing:**
- The GDD chain as built in `core/post.ts` (AgX, bloom, SMAA final pass, chromatic aberration in its own pass).
- **Reveal-only extras:** tilt-shift (screen-space) and DoF (innermost shell only, since after the depth clear the buffer holds only that shell).
- **Both are created at boot and toggled with `pass.enabled`,** so nothing recompiles mid-reveal (review 1 D2).
- GodRays on High; an additive cone on Low and Medium.

**Pre-warm.** `renderer.compileAsync()` on the next shell during Crown Phase 1. Web and galaxy points are sampled in a Worker during the previous run.

**Lights.** A fixed pool of **12 PointLights** (the GDD budget) is created with the scene and never added or removed. Each frame they are reassigned to the nearest flames and lanterns; every other flame is an emissive sprite plus bloom (review 1 D1).

**Audio:**
- A lowpass sweeps 400 Hz → 12 kHz across the pull.
- Reverb grows by crossfading 3 fixed convolvers (RT60 1.0 / 3.0 / 8.0 s), never by swapping a buffer mid-sweep.
- **Exactly 200 ms of silence at each handoff.** Then the motif.

**Chorus** (SHOULD) is locked during reveals and opens with the title card at the results. Keys 1–5 play the new layer's pentatonic notes, quantised to 1/8 notes (review 0 M5).

**Share card** (GDD §16.9, MUST):
- The group shot at ★1's 7.0 s and the vista at 18.0 s are each captured in the same frame, right after `composer.render()`, then drawn into an OffscreenCanvas. `preserveDrawingBuffer` isn't needed.
- They are composited into the GDD's 1200×630 card: group on the left 60%, vista on the right 40%, plus the Tower Seed and `◯ 5♛`.

### 10.2 ★1 "Out of the Well" (first view 26 s)

**Pre-roll** (the GDD ending VFX, not counted): Candlelit's 6 s light wave down the braid, Everflame's white-gold column, or the Snuffer's drop.

| t (s) | Camera | Picture | Technique | Audio |
|---|---|---|---|---|
| 0.0–5.0 | Group shot on the rising arena. FOV 60 → 70, pitch +20° → +75°. | **The Crown lift.** Strand 5's arena rises 120 → 170 m at 10 m/s, and the crown ring settles around the Great Wick. The Coin grows 74° → 152°. The anonymous stars resolve into points of lantern light. | Lanterns stay at their honest positions (r 47, y 182). | Crown music ducks to wind; lowpass 12 kHz → 400 Hz |
| 5.0–6.2 | Pitch +75° → +88° | Exposure 1 → 4; the overlay ramps α 0 → 1 over 5.2–5.8 s, holds to 6.0, then fades to 0 by 6.4. **`[ TUTORIAL COMPLETE ]`** types at 5.3 s (0.6 s at 35 cps). | **Swap at 6.0 s** (arena at y 177, Coin 175°). L1 becomes its impostor, well #0 on the Mound. | 6.0–6.2: total silence. 6.2: one music-box note (motif note 1). |
| 6.2–9.0 | Head height on the rim, 60° pan, FOV 70 | Pre-dawn blue. **The brightest stars were lanterns:** 12 lantern-folk and every Burnt Out wisp hold them on poles over your well. At **6.6 s** every anonymous star blooms into its flame colour and name over 0.4 s. Fog 0.03 keeps the world 30 m wide. | Share-card group shot at 7.0 s | One chime per lantern, quantised to 1/8 at 96 BPM |
| 9.0–12.5 | **Dolly-zoom** 4 → 14.4 m, FOV 70° → 22°. d·tan(FOV/2) stays at 2.80 (2.801 → 2.799). | Players stay the same size while the mist peels (fog 0.03 → 0.6/d). Behind them, the **Mound**: 63 other well mouths. Your past Candlelit wells glow gold and Everflame wells white. | 64-well InstancedMesh, Vogel r = 72·√(i + 0.5) m (min spacing 111 m, mound r 574 m) | Reverb 1.0 → 3.0 s |
| 12.5–18.0 | **Crane + exponential pull:** d = 14.4·1000^S(u), S = smoothstep over 5.5 s (exactly 3.0 decades). Pitch 15° → 88°, FOV 22°. | At **16.3 s** the 1.24 km mound fills the frame; a tilt-shift pulse at 15.6–17.1 s reads it as a miniature, then releases. By 18.0 s the island rings (900 / 1,400 / 2,000 m) and the rim (2,600 m, +480) form a **mandala at 96% fill from 14.4 km**. Each Landing island is about 7 px. | Island LOD: full ≤ 400 m, BatchedMesh ≤ 3 km, Points beyond; swaps inside haze. Fog density 0.6/d, so 30% haze at the end (review 1 C2). Dome R 30 km, far plane 40 km. | Lowpass to 4 kHz |
| 18.0–20.0 | Top-down hold | **Map match cut:** each L2 floor node spawns at its island's `vec.project(camera)` and FLIPs to its astrolabe position in 1.2 s. The L2 band inks in (stroke-dashoffset, 0.6 s) and the L1 disc shrinks into the pupil. | SVG overlay | — |
| 20.0–23.5 | Pitch 88° → 5°, FOV 22° → 60°. **Free look ±60°** from 21.0 s; it springs back on release. | **The sun crests at 21.0 s:** GodRays (High) or an additive cone. Parallax cloud sea, 40 boid birds. | — | 20.0–20.6 wind only (the breath). **20.6: motif ×2, up a fifth (C).** Lowpass fully open. |
| 23.5–26.0 | Slow push toward the rim | `[ WELCOME, WICK ] That was the tutorial.` (1.1 s), then the carved card **LAYER 2 · THE SKY · 하늘** and "Your sky was a hole." A cloud puff wipes to the party on **the Rim**, the L2 Foot disc built out from your well's lip. There the GDD results play; look south and your well is still lit. | — | Landing waltz in C |

**Ending variants (same camera path):**
- **Candlelit:** as above.
- **Everflame:** the claimant rides the white-gold column alone. Everyone else is Snuffed on the arena (GDD), and at 6.2–9.0 s their wisps stream past the camera and **take lantern positions: they become the new stars.** The group shot is the claimant alone among them.
- **Snuffed Summit:**
  - There is no lift. The bell comes down, and a wisp per climber rises out of the dark.
  - The mask is a fade from black instead of the whiteout.
  - The dawn is overcast: no birds, no sun crest.
  - `[ SNUFFED SUMMIT ] The Tower will wait. It is good at waiting.` comes before the layer card.
  - Surfacing still counts.

**Repeat cut (8 s):** lift 1.5 s, whiteout 1.0, lanterns 1.5, pull 2.5, match cut 1.0, title 0.5. Repeats always play, because they carry the match cut.

**The First Shout** (SHOULD, at the Rim results):
- The first ping, Stomp or quick-chat within 30 s gets **no** echo, only wind. (In the well it came back at once.)
- **6.0 s later** thunder rolls back from the cloudbank 1.03 km out (2.06 km round trip ÷ 343 m/s). It is built from `ctx.createDelay(6.5)` and a low-passed noise burst.
- Lightning, drawn as bloomed line segments, outlines the island ring of Floor 7.

### 10.3 ★2 "The Painted Sky" (first view 24 s; LATER)

| t (s) | Shot |
|---|---|
| 0–3 | Group shot in the Crown updraft, FOV 65. As the zenith nears, the "sky" resolves into **brushstrokes** (the dome shader swaps gradient for strokes by distance). The tear, 20° by now, widens. At 2.4 s the arena punches through: a paper-tear shader (alpha-cut noise edge with ember glow). **Handoff to the L3 shell under the tear bloom.** Silence 2.4–2.6 s. |
| 3–6 | Through the tear the camera turns 180°. The dome from outside is a pale canvas hemisphere (R 30 km) with brushstrokes on its back. The lantern-folk sit on it: **the painted stars were pinholes with lanterns behind them.** |
| 6–13 | Exponential pull 50 m → 6,000 km (5.08 decades in 7 s). The canvas shrinks to a white fleck on the day side; curvature and a Fresnel limb `#7FB8FF` appear. **The flat→round swap needs no mask, because it happens behind the opaque canvas** (the dome base sagitta, 30²/1,200 = 0.75 km, is hidden in base mist). At 9–11 s the orbits at 1.5 / 2 / 3 R rise into frame. At 6,000 km the planet spans **11.5°** and the outer orbit 33.4°. |
| 13–19 | Slow 30° orbit, free look ±60°. The terminator, and a magenta nebula smear on one horizon. **13.0: motif ×2 in G.** The L3 band inks into the astrolabe afterwards, at the Foot (no on-screen match cut; review 0 M6). |
| 19–24 | `[ WELCOME, WICK ] That was also the tutorial.` · **LAYER 3 · SPACE · 우주** · "Your sky was a ceiling." Wipe to the results on the Foot deck. |

Repeat cut: 8 s.

### 10.4 ★3 "The Speck and the Drop" (first view 30 s; LATER)

| t (s) | Shot |
|---|---|
| 0–2.5 | The Crown pod slingshots around the moon. **The periapsis bloom hides the handoff to the system shell (AU).** |
| 2.5–7 | Pull back. **The night side lights up with your climb:** every Ledger event of this run (Knot, Knife, catch, Relight, clear), about 2k city lights laid along the 72° braid spiral of your Landings (review 0 M6). At 6.5 s the planet drops under 48 px and becomes a point sprite. |
| 7–15 | Pull to 120,000 ly (galaxy shell). The sun becomes one of **150k points** in a two-arm spiral, r = 3,000·e^(0.22θ) ly out to a 50k ly rim. **Your point keeps your party's colour.** A local shell of 2k stars within 50 ly gives parallax, and empty decades are remapped to 0.6 s each (review 1 C5). |
| 15–21 | Face-on hold: 75% fill at 120k ly, FOV 60. **The Drop:** from 17–19 s a screen-space refraction sphere forms around the galaxy, stretches into a teardrop (vertex offset on a 64-segment sphere) and falls along a filament. **19.8 s: the L1 water drip.** The galaxy glow blooms at 20 s, hiding the handoff to the web shell (Mly). |
| 21–26 | Pull 120k ly → 300 Mly, free look. The galaxy is one bright knot on a filament. Filaments multiply into **200k points** sampled on the moss-seed Voronoi edges; 40 moss-green glints. |
| 26–30 | `[ WELCOME, WICK ] That was ███ tutorial.` · **LAYER 4 · THE BEYOND · 너머** · "Your world was a speck." **Motif ×2 in D.** |

Repeat cut: 9 s.

### 10.5 ★4 The Revelation (first view 75 s, once per cycle; repeat 20 s; LATER)

| t (s) | Shot |
|---|---|
| 0–6 | The group at the L4 Crown on the halo. This run's gold Pact threads and red Knife links run among the filaments. |
| 6–20 | Exponential pull through the web; filaments thicken and soften into glow. |
| 20–24 | **Match plane:** a camera-facing slice of `vein(p) = voronoiEdge3D(p·f, MOSS_SEED)` drawn as filament glow `#DCE3F0`. **A 0.4 s blink at 23.6 s** (the only blink in the game) hides the shell swap. |
| 24–32 | The same slice drawn as moss albedo. The colour crossfades silver → Well moss `#557D33` over 1.5 s; a wet sheen appears; a drip falls and ripples. Same seed and scale, so **the veins are pixel-identical** and players can screenshot the match. The moss uses the same 2048×1024 cylindrical bake as the L1 walls (review 1 C5). |
| 32–46 | **The pull continues outward** (review 2 F3). The moss is on one stone of a well wall. The camera rises up that well: it has your first well's brick courses and moss, but it is colossal, and it holds no tower. |
| 46–58 | The rim. Lantern-holding silhouettes lean over the lip, and **the nearest is the stone frog from the Foot**, now enormous. Candlelit: every lantern is lit. Everflame: the claimant stands among the silhouettes, with the others as new stars. |
| 58–66 | `[ 井底之蛙 ] Every sky is someone's well.`, then `[ TUTORIAL COMPLETE ] The game begins now.` The motif at its original tempo in F, orchestrated for the whole kit, ending on a solo music box. |
| 66–75 | The astrolabe: Cycle 1's whole disc shrinks into the pupil and a new outer band inks in, **CYCLE 2 · THE WELL ABOVE**. Then the results. In Cycle 2 the Foot's statue plinth is empty: `[ INSCRIPTION ] 井底之蛙. The frog has gone up.` |

### 10.6 Skips, accessibility and late joins
- **First views** are never skippable. Repeats always play.
- **Reduced motion:** 4 cross-dissolved stills of 2.5 s each, plus the title. No dolly-zoom, no tilt-shift, rotation capped at 60°/s. The blink and the whiteout become crossfades.
- **Captions** for every System line and the thunder (GDD §14.4).
- **Streamer mode:** an audio stinger plays 1 s before `reveal_start`, and the Tower Seed is hidden.
- **Hangul and Hanja** in cards are hand-authored stroke polylines, about 3 KB for 우물 하늘 우주 너머 井底之蛙 (SHOULD), because the single-file build has no CJK font guarantee.

---

## 11. Ring map UI: the astrolabe

### 11.1 Access
- **Tab** stays the GDD Ledger overlay, the ring map of the current floor.
- **Scrolling out** from it (or pressing **M**, which the GDD leaves unbound) zooms continuously into the astrolabe.
- The zoom takes 220 ms with an 8-blade iris. It is a small scale reveal in its own right.

### 11.2 Drawing
- **SVG**, viewBox 1000×1000, centre (500, 500), R = 460. It costs no GPU time.
- **Text** uses the GDD fonts (Nunito, JetBrains Mono, with their fallbacks). Layer glyphs ◯ ☁ ✦ ∞ are SVG paths.
- **Log-polar bands:**
  - **Pupil** (older layers), 0–69: each older layer takes half of the remaining radius.
  - **Current layer band**, 69–345.
  - **Reserved outer band**, 345–460: nothing but the rete's degree ticks, because the map is itself a frog in a well. A reveal inks the next band into it.
- **First run on a profile** (review 2 F13): the L1 band fills all the way to R = 460, and ★1 shrinks it for real.
- **Node angle = world bearing.**
- **Band radii** are honest, per review 2 F14:

| Layer | Mapping | Floor 1 | 2 | 3 | 4 | Crown |
|---|---|---|---|---|---|---|
| L1 | Perspective from a camera 30 m above the lip: r ∝ d / (210 − y), linearly remapped | 110 | 138 | 176 | 234 | 330 |
| L2 | Log-polar: 69 + 276·ln(ρ/600) / ln(2600/600) | 100 (the Rim) | 145 | 228 | 296 | 345 |
| L3, L4 | The same log-polar rule over the §5.1 radii | … | | | | |

  The L1 spiral bends outward as it rises, just as the upper strands loom larger from above.

### 11.3 Nodes and marks
- **Landing node** (22 px, 44 px touch target):
  - the global floor number, with a ring for the current floor;
  - its state (dashed = future, solid = reached, brass tick = passed, water line = flooded by the Tide in L1).
- **Door nodes** fan out from their Landing node along its bearing:
  - offset 26 px, spread ±8°·(doors − 1);
  - the letter plus the **GDD shape code** (A triangle, B square, C circle, D diamond, E hexagon, X star, ♛ crown; §14.4);
  - capacity dots;
  - occupants as flame-colour pips, filled for humans and hollow for Rivals;
  - cleared / failed / running state from the Ledger.
- **Fog:**
  - The current floor shows everything.
  - Later floors show the Landing node only. **Letters appear when that floor's Intermission reveals its plaques (GDD),** so nothing is sold or leaked (review 2 F7).
- **L4:** pips are drawn light-lagged, so the map can lie (review 0 M8).
- **Other marks:**
  - Burnt Out Watchers are dots just outside the band at their bearing.
  - The X alcove is a star glyph, drawn once revealed.
  - Pact threads (gold) and Knives (red) are drawn as in the GDD Ledger overlay.
- **Glyph budget:** at most 34 in the current band. The worst case is 5 Landings + 16 doors + Crown + X + 5 labels = 28.

### 11.4 Colour, mobile and accessibility
- **Colours:** GDD UI colours (night `#0E0B10` at 88%, text `#F4EDE3`, gold `#FFD76A`). Each band is filled with its layer palette's dominant colour at 10%.
- **Accessibility:** state is always shape plus pattern.
- **Mobile** is LATER (GDD).
- **Streamer mode:** Wick numbers, and the seed hidden.

### 11.5 The Mound (run select, SHOULD)
- The lobby's "Choose a well" screen is the L1 pupil blown up: 64 wells, top-down.
- **Three candidate wells** are highlighted, seeded from the profile and date. Each shows its spire (Stair, Labyrinth, Undercroft) and its 6-character Tower Seed.
- Typing any seed also works (GDD).
- Lit wells come from the local profile only. **There is no global "others' clears" count** (review 1 B7).

---

## 12. Pacing numbers

### 12.1 One L1 run (GDD timers plus world additions)

| Beat | Median | Fast | Slow (all caps) | Source |
|---|---|---|---|---|
| Foot warm-up | 60 s | 60 | 60 | GDD |
| Per floor × 4 (Floor 1 uses the warm-up instead of its 45 s Intermission): Intermission 45 + Draft 45 + Latch 6 (+8 held) + orbit 2 + room + Altar 15 + **stair 3 (world)** + wait for floor close | 270 room + 60 wait → **446 s** | 180 room + 20 → 316 | 330 + 210 (Tide + Pressure bound) → 664 | GDD §3.3, §5.4 |
| Crown | 360 | 240 | 540 (9:00 cap) | GDD §6.13 |
| **Crown lift + ★1** (world) | 6 + 26 | 6 + 8 (repeat) | 32 | §10.2 |
| Results at the Rim | 60 | 60 | 60 | GDD |
| **Run total** | **≈ 2,250 s ≈ 37.5 min** | **≈ 26 min** | **≈ 55 min** | fits the GDD's 36–45 min |

- **World overhead per run** is about 44 s (stairs 12, lift 6, reveal 26). The gate (H5) is ≤ 90 s.
- **The Draft maze adds no time,** because it runs inside the 45 s Draft.

### 12.2 Layers and the campaign

| | L1 | L2 | L3 | L4 | Revelation |
|---|---|---|---|---|---|
| Transfer per floor | 2.5–4.5 s | 8 s | 10 s | 10 s | — |
| Reveal (first / repeat) | 26 / 8 s | 24 / 8 | 30 / 9 | — | 75 / 20 |
| Median run | 37.5 min | ≈ 38 min | ≈ 38.5 min | ≈ 38.5 min | +45 s |

- **The reveal lands at about minute 37 of every session.**
- **Build-up cues** arrive every ~7.5 min, one per floor (§4.3, §9.2).
- **Campaign:** about 2.6 h over 4 sessions.
- **Longest stretch** without a room or Landing activity: a floor's wait, bounded by the GDD Tide + Pressure at about 3:30. The GDD's M2 gate holds the median at ≤ 60 s.

---

## 13. Engineering contracts and budgets

- **Messages:**
  - `world_plan` (reliable, ≤ 4 KB, at run start);
  - `reveal_start {layer, variant, t0}`;
  - other-Landing flame positions at 2 Hz inside the existing snapshot.
  - Nothing else is new.
- **Files:**
  - `src/game/world/plan.ts` (shared, Node-runnable per ENGINEERING.md);
  - `src/world/braid.ts` (well, strands, pillar, water reflection, cutaway);
  - `src/world/theta.ts` (ribs from a `ThetaMaze`, kit boxes merged into 1–2 draws);
  - `src/world/shells.ts` (ShellRenderPass, camera-relative roots, impostor capture);
  - `src/scenes/reveal_1.ts` (choreography as data: `CameraShot[]` per the frozen `CameraRig.cinematic`);
  - `src/ui/astrolabe.ts`.
- **Budgets:**
  - **Draw calls:** ≤ 150 during reveals and ≤ 300 on Landings (ENGINEERING.md), measured with `renderer.info.autoReset = false` and reset once per frame (review 1 D5).
  - **Geometry and shadows:** ≤ 400k triangles; 1 shadow map.
  - **Points:** 50k stars / 150k galaxy / 200k web, a quarter of each on Low.
  - **Pixel ratio:** min(dpr, √(2.1M / cssPixels)), capped at 1.5 on High; 0.85× dynamic resolution during reveals.
- **L2 vista** is about 40 draw calls: wells in one InstancedMesh; islands in a BatchedMesh with 8 archetypes; the cloud sea as one displaced mesh plus at most 60 billboards (at most 4 transparent layers per pixel); instanced birds; the dome; sun and GodRays; lantern sprites; climbers (review 1 D3).
- **Frame rate:** 60 fps on Landings at 1080p Medium on Iris Xe (GDD); **p95 ≥ 50 fps during ★1** on real hardware.

---

## 14. Vertical slice cut line

The GDD slice is **one L1 run**. The world structure adds the following to it, without touching GDD scope.

| Tier | Contents |
|---|---|
| **MUST** | **The Braid:** well (R 51, lip 180), 5 strands, placement (d 30, 72° steps, 30 m rise), stair climb-out, the void gap, the Draft Cam cutaway. **The Coin:** well sky with the live L2 sky and time of day, the Coin glance, the pitch range to +80°, the light pillar, the analytic water reflection. **Tide skin.** **Theta Draft (Stair)** on Floors 2–4, with nav re-bake and the lobby toggle. **Lantern-folk and Burnt Out wisps** as anonymous stars, plus the `[ YOU ARE A STAR NOW ]` line. **Crown on strand 5 and the Crown lift.** **★1** at full 26 s with all 3 ending variants, the 8 s repeat cut, and reduced-motion stills: shells, camera-relative roots, the impostor from Phase 3, masks, the audio sweep, 200 ms silence, the motif, System windows, and the share-card capture. **L2 vista:** the Mound (64 wells), island rings, cloud sea, dome, birds, sun crest. **Astrolabe:** the L1 band (first-run full disc), the Tab→M zoom, the ★1 match cut with the L2 band ink-in. **The Rim** results stage. **Profile:** `surfaced`, lit wells, the ★1 Scale Plate. **`world_plan` / `reveal_start`** and t0 + 500 ms sync. **Stone frog statue.** **Next Layer button:** `[ LAYER 2 ] Not yet built. The Tower apologises. Briefly.` |
| **SHOULD** | Labyrinth spire and Mound run-select. The Seam crack in the X alcove. The First Shout. Chorus at results. Hangul/Hanja stroke glyphs. Free look in ★1. GodRays and DoF on High. A 120 px corner astrolabe arc on Landings, fading after 5 s. |
| **LATER** | L2–L4 runs: Layer Omens, reskins, transfers, Crown skins, Tide skins, per-layer mazes. ★2–★4 and the Revelation. Trait layer scope and room `'full'` tuning. Surfacing titles 2–4 and Holders. Cycle 2. The Undercroft spire. LIGHT-LAG netcode. Daily wells (with the GDD's Daily Seed). |

### 14.1 Schedule inside the GDD milestones (about 8 engineer-weeks plus 6 tech-art weeks)

| GDD milestone | World-structure work | World gate |
|---|---|---|
| M0 Style Lock (2 wks) | Well shaft and Coin sky, one strand and Landing greybox → final | H6 |
| M2 Floor Loop (4 wks) | The Braid (5 strands, placement, stair climb-out, cutaway), Coin glance, pillar and reflection, Tide skin, Theta Draft plus nav re-bake, lantern-folk and wisps, `world_plan` | G1, G2, G3, G8, H3, H4 |
| M3 Full Tower (5 wks) | Crown on strand 5 and the lift; shells, impostor and masks; L2 vista; ★1 choreography and variants; astrolabe and match cut; the Rim results; share-card capture | G4–G7, H2 |
| M4 Online (3 wks) | `reveal_start` sync, rejoin during a reveal, other-Landing flames at 2 Hz | lobby of 8 sees the same frame (±1 frame at 100 ms RTT) |
| M5 Polish (3 wks) | Reduced motion, Iris Xe pass, SHOULD items | H1, H5 |

### 14.2 Acceptance gates

**Headless** (CI, Node plus the Playwright SwiftShader harness `tools/shot.mjs`):
- **G1 Maze.** 50,000 seeds × {3, 4} doors × {Stair, Labyrinth}: **zero fallbacks**; every bay has 2 disjoint routes; route and spread limits met (§7.3).
- **G2 Determinism.** Plan hashes are equal on Node, Chromium, Firefox and WebKit for 1,000 seeds.
- **G3 Braid clearance.** Every centre sightline clears higher strands by ≥ 3 m; lantern sightlines cross the lip plane at r < 51.
- **G4 Seam test.** `__TF.debug.renderRevealAt(t)` renders deterministic frames: a 45-frame contact sheet at 0.5 s steps, plus t−1/60, t and t+1/60 at each handoff. The test runs **with the masks disabled**, on a 16×16 tile grid, and passes if the maximum tile delta is ≤ 6%.
- **G5 No hitches.** `renderer.info.programs.length` is constant from t = 0 to the end of ★1.
- **G6 Draw calls.** ≤ 150 in ★1 and ≤ 300 on Landings.
- **G7 Fill.** Overdraw p99 ≤ 6 in ★1; fullscreen passes ≤ 12 1080p-equivalents.
- **G8 Bots.** Rivals reach a plate in every bay within 12 s from the stairwell rim on 1,000 seeded Landings.

**Human-run** (playtests; AI engineers can't run these):
- **H1** p95 ≥ 50 fps in ★1 on real Iris Xe at 1080p Medium.
- **H2 Wonder.**
  - At least 80% of testers change their answer to "how big is this world?" after ★1.
  - At least 70% name the lanterns as a surprise.
  - LATER: at least 60% rate ★3 as good as or better than ★1.
- **H3 Readability.** On a blind screenshot of a random Landing, at least 70% of one-run players can tell Floors 1–2 from Floors 3–4 by the Coin alone.
- **H4 Draft maze A/B.**
  - Median Draft-wind assignments per floor stay ≤ 1.
  - At least 60% prefer the maze on.
  - "Unfair" ratings for the Draft rise by no more than 10 points.
- **H5 Pacing.** L1 run median 36–45 min, with world overhead ≤ 90 s.
- **H6 Style.** Passes the GDD M0 blind test, and 8/10 viewers say "inside a well" and point up to "the sky".

---

## 15. GDD change requests and notes for the GDD panel

| CR | Change | GDD section |
|---|---|---|
| CR1 | In L1, Landings are open to the **well's interior** (mist below, the Coin above), not to an outside cloud sea. The dusk palette moves into the Coin. | §2.1, §10.1, §13.3 |
| CR2 | Landing positions follow the Braid (§4.2). "North" means outward from the layer centre. | §10.1 |
| CR3 | Theta Draft ribs on Floors 2–4 (Labyrinth: 1–4), with the lobby toggle "Draft maze". | §3.6 |
| CR4 | The Tide's L1 skin: well water rises to 1 m above the flooded Landing, plus the float gauge. | §3.3, §13.7 |
| CR5 | Crown arena on strand 5 (y 120, off-axis); the crown ring 30 m above; the lip 60 m above; the Crown lift → ★1 → results at the Rim. | §6.13, §14.1 |
| CR6 | The X alcove is a niche cantilevered behind a parapet panel outside the door arc; the Seam crack is SHOULD. | §10.3 |
| CR7 | 4 surfacing titles (the total becomes 25). | §9.7 |
| CR8 | The Foot's stone frog statue, with its inspect line. | §10.1 |
| CR9 | Camera: Landing pitch range to +80°; the Coin glance; the Draft Cam cutaway. | §13.8 |
| CR10 | Results staged at the next layer's Foot; the Next Layer button; lobby start layer. | §14.1, §16.2 |
| CR11 | Codex **Scale Plates** page. | §9.8 |
| CR12 | 4 earned-only surfacing Holders. | §12.5 |

**Notes found while checking the GDD** (not world changes):
- **§4.2 jump numbers are inconsistent.** vy₀ 5.3 m/s at g 20 m/s² gives a 0.70 m apex, not 1.4 m. A 1.4 m apex needs vy₀ ≈ 7.5 m/s, or g ≈ 10. The Theta rib height (1.5 m) assumes the stated 1.4 m apex and 1.3 m mantle.
- **§13.2 `PCFSoftShadowMap`** was removed in r186. ENGINEERING.md says to use `PCFShadowMap` with `shadow.radius`.
- **§13.2 lists SMAA and ChromaticAberration in one chain.** Both are convolution effects and cannot share an EffectPass. `core/post.ts` already renders them in separate passes, which is correct; keep it that way.

---

## 16. Review log

Verdict key:
- **Applied**: in this document as proposed.
- **Adapted**: the problem is accepted and fixed differently.
- **Superseded**: the draft system it attacked no longer exists, because the GDD's version replaces it.
- **Rejected**: with a reason.

### Review 0: Fun
| ID | Verdict | Where / reason |
|---|---|---|
| C1 Waiting | Superseded | The GDD floor loop bounds waiting: Tide plus Pressure, Side Doors, Keyholes, minigames, and the M2 gate of median wait ≤ 60 s. The world adds at most 4.5 s per floor. Rope countdown rejected: it duplicates the Tide. |
| C2 ★1 twist spoiled | Applied | §4.4, §10.2: anonymous warm stars; `[ YOU ARE A STAR NOW ] Don't tell them.`; the bloom at 6.6 s. |
| C3 Same braid, no real maze | Adapted | Theta Draft on every floor (§7.3), a macro format per layer, spire choice (§5.2). The Scatter / Station / Arms topologies are rejected because they were built on the draft's Fork/Confluence loop, which the GDD replaces. |
| C4 18 min to hook, 85–112 min to the end | Adapted | One layer per run: every ~38 min session ends on its reveal. The "First Ascent" compression is rejected because it breaks GDD floor bands, tiers and the 36–45 min run. |
| C5 Weak finale | Superseded | The finale is a full GDD Crown (Vigil, Trust Fall, Crown Door vs Great Wick) followed by the Revelation. Borrowed Doors rejected: a new replay-room system at high cost. |
| M1 Water unfelt | Adapted | §4.6: the Tide visibly drowns the floor below. Per-room flooding rejected: GDD Pressure already does that job. |
| M2 Cut/Crack payoffs | Superseded | The Bucket is gone. GDD Crown payouts (Everflame 300/40 vs Candlelit 150 each) already make defection tempting. |
| M3 L4 light delay vs co-op | Applied | §9.1: distance-scaled, and only outside your own instance. |
| M4 L3 oxygen | Adapted | O₂ removed; L3's rule is DRIFT (momentum), inside the physics contract. |
| M5 Chorus spam | Applied | §10.1: locked during reveals; SHOULD. |
| M6 Reveals get weaker; three dark layers | Applied | ★3 city lights and the Drop; full match cut only at ★1 and ★4; reveals lengthen; Landing luminance targets (§9.2). |
| M7 Automatic attribution | Superseded | GDD witnesses plus the Tribunal. |
| M8 Map bypasses visibility | Applied | For L4 (§11.3). L1–L3 have no hidden plate information in the GDD. |
| M9 First-through across instances | Superseded | GDD First Up and per-room bonuses. |
| M10 L1 front-loads systems | Superseded | GDD Foot tutorial. The world adds no maze on the Foot and no prompts. |
| M11 Hollow solo | Superseded / Applied | The GDD Rival Register and Drama Director cover memory and drama. Solo ★1 lanterns = lantern-folk + Burnt Out Rivals + your lit wells. |
| M12 63 wells never visited | Adapted | The Mound is L1 run-select, with lit-well records (§11.5, SHOULD). |
| M13 Seats | Superseded | GDD plates and the Draft wind. "Stick Together" rejected. |
| Minors | m1 superseded (the maze makes route cost real). m2, m3, m6 applied. m4 applied (Cycle 2 is per-run). m5, m8, m9 superseded. m7 applied (global floors plus glyphs, no primes). |

### Review 1: Feasibility
| ID | Verdict | Where / reason |
|---|---|---|
| A1 Validation unsatisfiable | Superseded / Applied | The format grammar is gone. The constructive Theta generator produced 0 fallbacks in 50,000 seeds; the CI gate G1 is kept. |
| A2 Gate lands on a door | Superseded | Arrivals come up at the Landing centre; doors sit on the north arc. |
| A3 Cross-link content | Superseded | Cross-links removed; GDD grates only. |
| A4 Cross-engine determinism | Applied | Plans are broadcast; discrete decisions are integer-only; G2. |
| A5 Bucket dial | Superseded | — |
| B1 No authority model | Superseded | GDD §3.7 / §16. The world adds two messages. |
| B2 Falls leave the instance | Superseded | GDD void-fall respawn. |
| B3 Needs-2 rooms | Superseded | Every GDD room has 1-player tuning. |
| B4 Cross-link windows | Superseded | — |
| B5 Light delay in co-op rooms | Applied | §9.1. |
| B6 Rope netcode | Superseded | GDD server-authoritative XPBD. |
| B7 Persistence contradictions | Applied | Everything is local profile; no global counts (§11.5). |
| B8 Loopholes | Superseded | — |
| C1 Camera never shows the Coin | Applied | §4.5. |
| C2 Fog, dome, framing | Applied | Recomputed: fog 0.6/d, dome R 30 km, 14.4 km for 96% fill (§10.2). |
| C3 One-scene post; shell origins | Applied | ShellRenderPass and camera-relative float64 roots (§10.1). |
| C4 Masks and a vacuous seam test | Applied | Overlay at α 1 for ≥ 3 frames, `renderRevealAt`, masks-off tile test (G4). The whiteout is ramped to honour GDD photosensitivity. |
| C5 Minor rendering | Applied | Impostor captured in Phase 3, ★3 decade remap plus local stars, Worker point sampling, shared moss bake, stroke glyphs, `createDelay(6.5)`, crossfaded convolvers, 11.5°. |
| D1 Point-light recompiles | Applied | A fixed pool of 12. |
| D2 Post toggles and merges | Applied / Rejected | Prebuilt reveal passes, `compileAsync` and G5 applied. **FXAA rejected:** `post.ts` already keeps ChromaticAberration in its own pass, so SMAA never merges with another convolution effect, and the GDD specifies SMAA. |
| D3 L2 vista cost | Applied | §13. |
| D4 Room loader | Superseded | GDD scope. |
| D5 Measurement | Applied | `autoReset = false`. |
| E1 Bot navigation | Superseded / Applied | GDD `botPlan` plus navmesh. The maze triggers a nav re-bake (G8); transfers are scripted. |
| E2 L3 physics | Applied | DRIFT uses only `gravityScale` and damping. |
| E3 Concave shaft collider | Rejected (not needed) | In the Braid nobody touches the well wall: there is a 2 m void gap with a fall volume. |
| F1 Schedule 5–8× over | Applied | The world slice rides the GDD milestones with a short MUST list; gates are labelled headless vs human. |

### Review 2: Fidelity
| ID | Verdict | Where / reason |
|---|---|---|
| F1 The draft replaces the game | Applied | The whole document (§0, §8). |
| F2 The frog sees the sky before leaving | Adapted | The Braid in the Well: Landings stay open (GDD) but open onto the well. **The enclosed-Landing, stairwell-coin version is rejected:** the Great Wick stands at the Crown's centre and would cap a central shaft; enclosing the Landings loses the GDD's warm, open waltz half; and a 7° coin reads only when you look straight up. |
| F3 The ending points inward | Applied | §10.5: outward pull, "Every sky is someone's well", Cycle 2 as an outer band. |
| F4 The maze is missing | Applied | Theta Draft is MUST (§7.3). |
| F5 Multiple designs | Applied | Stair MUST, Labyrinth SHOULD, Undercroft LATER; macro formats per layer. |
| F6 Meet Director vs the E lane | Superseded | The Meet Director is removed; the GDD Drama Director remains. |
| F7 Information for sale | Applied | Horizon and Door Info removed; the map shows letters only after Intermission. |
| F8 Irrational betrayal in Crowns | Superseded / Applied | The GDD Crown is used everywhere; reveals are framed by the ending (§10.2 variants). |
| F9 Pastel everywhere | Applied | Rooms stay dark in every layer; brightness is only on Landings, transfers and reveals (§9.2). |
| F10 Powers grow by cutscene | Adapted / Rejected | Layer scope applies from run start, and rooms clamp. **The earned-use counter is rejected:** traits reset every run and each layer is one run, so the counter would reset before it ever paid out. |
| F11 The TTIH joke is missing | Applied | `[ TUTORIAL COMPLETE ]`, "That was the tutorial" and the ███ line. |
| F12 Reveals shrink as scale grows | Applied | 26 / 24 / 30 / 75 s with free look. |
| F13 The frog already knows | Applied | First-run full disc; a harmless L1 Seam. |
| F14 L1 radii aren't honest | Applied | Perspective mapping (§11.2). |

### Draft open questions, resolved
- **Q1 (16 vs 18 min layers):** moot; a layer is a 36–45 min GDD run.
- **Q2 (maze feel):** Theta Draft plus the H4 A/B test.
- **Q3 (Crack timing):** removed.
- **Q4 (water):** now a visual Tide skin.
- **Q5 (cross-link latency):** removed.
- **Q6 (18X doors):** removed.
- **Q7 (light-delay cost):** ≈ 11.5 KB, trivial.
- **Q8 (beacon legibility):** GDD flame colours at luminance ≥ 0.6 plus letter shapes; mobile is LATER.
- **Q9 (Stand-in NPC):** removed; GDD D rooms have 1-player tuning.
- **Q10 (L2 draw calls):** about 40 once batched (§13).
