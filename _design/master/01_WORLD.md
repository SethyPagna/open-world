# 01 · THE WORLD: every sky is someone's well

**KNOTWELL master design set** · file 01 of 00–10 · **Version** 1.0 · **Date** 2026-09-29 · **Status: BINDING** for world structure.

**Authority.** The user's words, then `DECISIONS.md` (**DEC**), then `FUN_OVERHAUL.md` (**FO**), then UT/RR, then the parts bin (`GDD.md`, `WORLD_STRUCTURE.md` = **WORLD**). This file re-homes WORLD's geometry, laws, reveals and ring map onto the Climb of 20 numbered doors and the Firefly Frog. Nothing here overrides DEC.

**This file owns** (DEC §9): the concentric Well → Sky → Space → Beyond world and its laws; the Braid geometry; the Mouth's angles; floors, Landings and doors as places; plaques as objects; the seeded climb planner; how the party splits and meets; Keepers and Wardens per layer; every scale reveal (window, Landing glance, Keeper pull-back, ★1, the Rim, LATER ★2–★4, the Revelation, Cycle 2); how scale is faked in URP; layer palettes, music keys, movement verbs, molts; and the map.

**Neighbours** (they own the inside of what this file places):

| Topic | Owner | This file gives them |
|---|---|---|
| RoomDef contract, room specs, Twists, authored door-by-door script | `05_ROOMS_SLICE.md` | Slot kinds, the planner, the room grid, plaque fields |
| Hub, Landing stations, the Keeper ceremony order, `meeting_room`, `rim_surface` interaction | `07_HUB_AND_MINIGAMES.md` | Where they stand, their size, what the camera does |
| Palettes per room, UI styling, fonts, audio mixing | `09_ART_UI_AUDIO.md` | Layer palettes, Mouth colours, music keys, map geometry |
| Scenes, netcode, visibility, bakes, CI plumbing | `10_UNITY_TECH.md` | The frames, the shell rig, the tests listed in §12 |
| Glow, Boons, Rank, yields | `04_PROGRESSION_ECONOMY.md` | Nothing; this file never changes a number of theirs |

**Tags.** Every feature carries [MUST-A] (Quick Climb, the free demo), [MUST-B] (Full Climb, ★1, the Rim, seeded climb 2), [SHOULD] or [LATER]. **Every number is a greybox hypothesis** unless it is marked *(computed)*, which means it was calculated for this file from the stated geometry, or *(source)* with its citation.

---

## 1. The world in one page

### 1.1 The picture

> You hatch in black water at the bottom of a stone well. Overhead, 180 m up, is **the Mouth**: a disc of afternoon sky with a thin beam across it, a rope, and something that looks like a jar. Four stone columns step up around you like a spiral staircase for giants. You will climb all of them, twenty monster doors, and that disc will grow into a sky. At the top a rope drops, you tongue its knot, and the well's own bucket hauls you out, and the sky you stared at all climb turns out to be the floor of a bigger world.

That is the user's image, delivered literally: *"frog in a well, comes out of well sees the sky, then go to sky sees space, then space see more bigger scenes."* The player **is** the frog (DEC §2), so every reveal lands on the player's own body.

### 1.2 Concentric layers, centre outward

```
                   TOP VIEW OF THE WHOLE WORLD (not to scale)
                ┌───────────────────────────────────────────┐
                │ BEYOND  doors 61–80  maze of dungeons     │
                │  ┌─────────────────────────────────────┐  │
                │  │ SPACE  doors 41–60  dungeon         │  │
                │  │  ┌───────────────────────────────┐  │  │
                │  │  │ SKY  doors 21–40  maze        │  │  │
                │  │  │  ┌─────────────────────────┐  │  │  │
                │  │  │  │ WELL  doors 1–20  tower │  │  │  │
                │  │  │  │   (you hatch here)      │  │  │  │
                │  │  │  └─────────────────────────┘  │  │  │
                │  │  └───────────────────────────────┘  │  │
                │  └─────────────────────────────────────┘  │
                └───────────────────────────────────────────┘
   and the whole disc is one stone in the wall of a bigger well (★4, LATER)
```

- **Up is outward.** Each layer's exit is the next layer's centre: your well's lip is the middle of the Sky; the Sky's painted dome is a patch on a planet; the planet's star is a point in the Beyond; the Beyond is moss on a stone in a colossal well.
- **Door numbers run on** across layers (DEC §4): Well 1–20, Sky 21–40, Space 41–60, Beyond 61–80. Global door = 20·(layer − 1) + local door. "Best door: 37" is the brag.
- **Cycle 2** [LATER] continues outward: doors 81–160 inside the bigger well.

### 1.3 The five laws (every world decision follows from them)

| # | Law | What it forces in the build | Tag |
|---|---|---|---|
| 1 | **Every layer's exit is the next layer's centre.** | The Rim (the Well's lip) is the Sky's first floor. Layer frames nest: the Sky vista is authored around your well. | [MUST-B] |
| 2 | **The brightest stars are real.** The lights you see in the Mouth are lanterns held by frogs who climbed out before you, standing at their true positions. | Lantern positions are geometry, not a skybox texture; their holders stay unrendered until ★1. | [MUST-A] lanterns · [MUST-B] reveal |
| 3 | **Every layer leaks the next.** From every Landing and every window you see a bigger piece of the next layer. | Well: the Mouth widens 31° → 74°. Sky: a tear in the dome shows Space. Space: a nebula smear. Beyond: moss-green glints. | [MUST-A] Well · [LATER] others |
| 4 | **Up is outward, on the map too.** The map is the world seen from far enough away: doors spiral outward, layers are rings. | §11. | [MUST-A] |
| 5 | **Every reveal opens a verb.** Nothing big is only watched (FO §6.3). | The Keeper ceremony, pull-back included, opens choice; ★1 opens Glide on the Rim; each later reveal opens its layer's verb. | [MUST-A] Keeper · [MUST-B] ★1 |

WORLD's Law 5 ("the GDD run is the unit") is replaced by the Climb (DEC §4). WORLD's Law 2 lost its Burnt-Out wisps (DEC §8.3); the lantern frogs carry it alone.

---

## 2. The layers

### 2.1 Layer table

Door ranges, verbs, molts and Wardens are DEC §4/§7 and FO §6.3. Social rules, room types and formats for the Sky, Space and Beyond are this file's proposals for LATER. They follow RR's rule that "each layer adds a movement power, new room types and a new social rule". They are flagged in §13 for sign-off when those layers are scheduled.

| | **THE WELL** 우물 | **THE SKY** 하늘 | **SPACE** 우주 | **THE BEYOND** 너머 |
|---|---|---|---|---|
| **Doors** · Keeper · Warden | 1–20 · 10 · 20 | 21–40 · 30 · 40 | 41–60 · 50 · 60 | 61–80 · 70 · 80 |
| **Status** | [MUST-A] 1–10 · [MUST-B] 11–20 | [SHOULD] Sky Preview 21–25 · [LATER] rest | [LATER] | [LATER] |
| **Theme** | Mossy stone shaft, lantern-lit Landings, black water, a disc of sky | Pastel cloud islands under a painted dome; wind, birds, storms | A small planet and its moon; station decks, hull rails, neon | Light filaments between galaxies; glass decks; moss-green veins |
| **Format** (the user's "tower / dungeon / maze") | **Tower.** Four stone strands step up around the shaft. Doors are niches stacked up inside each strand. | **Maze.** Island rings at 900 / 1,400 / 2,000 m. Doors sit on islands; forks are two cloud bridges that rejoin. | **Dungeon.** Station decks on orbits at 1.5 / 2 / 3 R of a 600 km planet. Doors are bulkheads; the Meeting Door is a real two-key airlock. | **Maze of dungeons.** Sealed glass decks strung on filaments at 40 / 90 / 150 Mly. Every rule slot is a fork. |
| **Movement power, on by default** | The three verbs. Grapple arrives with Tongue II at 0:20. | **Glide** (Glider molt): hold Hop in the air, fall ≤ 3 m/s for up to 1.5 s per hop, 6 m/s forward. | **Drift**: gravity ×0.25, no air drag until you touch, grab or grapple. The Tongue grapples anchors at any rank (range = your Tongue rank); Tongue IV chains them. | **Light-rails**: the Tongue latches onto a glowing filament and slides you along it at 12 m/s, at any rank. |
| **New room types** | ♠ Body / ♦ Mind / ♣ Together rule doors in dark stone cells; ♥ Heart doors; the two set pieces (Grip Wall = PEAK, Tongue-Tied Tether = Chained Together); SOLO/DUO E doors; toy doors; jar, window, sleeping-threat and gold breathers | Open-air rule doors on islands, where a fall is a 1-spot drop and the updraft brings you back; gust doors (streamer tells); a falling set piece (`hollow_toad`, the One Body party toad); `mirror_toll` ♦ | Zero-g deck rule doors; airlock pairs (two frogs, two locks, one room); `ash_axeman` ♠ ("It kneels only in the dark", so your glow is the liability); a hull-walk set piece | Echo rooms, where your own 1.5 s-old light copy is a platform or a decoy; filament mazes; forks at every rule slot |
| **New social rule** | **My mistake is your problem**: linked bodies in every room. Mischief is always on. Real betrayal only in announced ♥ doors. Knot and Cut from Landing 3 (DEC §4, §8.1). | **Kite Knot**: Knotted frogs glide as one. The upper frog steers and both get +50% glide time within 8 m. A Cut in mid-air drops your partner; outside ♥ doors their own glide opens at once and costs nothing. | **Push-off**: every Shove sends both frogs apart at equal speed. You cross gaps by launching off a friend. Outside ♥ doors a frog shoved into the void is reeled back by a safety line in 2 s. | **Light-Lag**: anything outside your room, or more than 15 m away, is drawn `min(1.5 s, d ÷ 15 m/s)` in the past. Inside your room everything is live. Knotted partners always see each other live, which is what a Knot is worth here. |
| **Molt** (add-on parts on the one rig; every hat fits) | None. The froglet grows only in light (Glow Lv1–10, Crown glow at Lv10). | **Glider molt**: glide membranes on the hands, feet and flanks (DEC §8.2 #7) | **Moon Toad helmet**: a fishbowl helmet with a brass collar | A star-freckle coat whose markings trail light for 1.5 s (proposal) |
| **Keeper** (the layer's door 10) | `keeper_bell_raft` [MUST-A] | Built from the Sky's floor-1–2 monsters [LATER] | Built from Space's floor-1–2 monsters [LATER] | Built from the Beyond's floor-1–2 monsters [LATER] |
| **Warden** (the layer's door 20) | **The Jar** `warden_the_jar` [MUST-B] | **The thunderhead heron** [LATER] | **Chan Chu**, the moon toad with a coin in its mouth [LATER] | **The Watcher** at the rim [LATER] |
| **Reveal** | ★1 **Out of the Well** (26 s) → the Rim [MUST-B] | ★2 **The Painted Sky** (24 s) [LATER] | ★3 **The Speck and the Drop** (30 s) [LATER] | ★4 **The Revelation** (75 s) → Cycle 2 [LATER] |
| **Card line** (on the next layer's card) | "Your sky was a hole." | "Your sky was a ceiling." | "Your world was a speck." | "Every sky is someone's well." |
| **Law 3 leak** (seen from every Landing) | The Mouth: 31° / 37° / 44° / 56° / 74° | Dome tear at the zenith: 1° / 3° / 8° / 20° / 40° | Nebula smear: 5° / 15° / 40° / 60° / 90° | Moss-green glints: 3 / 12 / 40 / 80 / 120 |

**Re-hatch.** A new layer re-hatches every frog at Glow Lv1 with that layer's verb on and its molt on the same rig (DEC §4). The beat is a **molt, not a loss**. The frog peels its old skin in 1.5 s, gulps it (real frogs do), and unfolds the new parts, and the System names the gain: `[ MOLT ] Glider. Hold Hop in the air.` Tower Rank, talents, the Bestiary and cosmetics carry over, and the layer's Rematch doors may pull in rooms from earlier layers to flatten (FO §3.2). [LATER]

**Formats and bots.** The layer format changes only the space *between* doors: strands, islands, decks, filaments. Rooms are always cells on the room grid (§3.8), so bots, validators and the room kit never change per layer.

### 2.2 Layer palettes

Hex values are world-level keys. `09_ART_UI_AUDIO.md` owns per-room and UI palettes and must stay inside these families. Rule rooms in every layer keep the tone rule: **dark cells, self-lit tells, warm breathers and Landings** (FO §2.2). Their ambient light is ≤ 0.10 luminance and their fog reaches ≤ 15 m.

| Key | Well | Sky | Space | Beyond |
|---|---|---|---|---|
| Base (walls, ground) | wall stone `#56615A` | cloud `#F4EDE3` | hull `#8A93A6` | glass deck `#2A2F45` |
| Shadow | `#1D222C` | cloud shadow `#C9C3D9` | `#1E2233` | `#06070F` |
| Signature accent | moss `#557D33` | island grass `#A8D98A` | nebula `#FF4FD8` | filament `#DCE3F0` |
| Warm key (Landings, breathers) | lantern `#FFB86B` on Landing stone `#6B5E57` | sun `#FFF3C4` | deck floodlight `#FFE3B0` | halo `#FFF1C1` |
| Fog / ambient | mist `#232B3A` over water `#0E1A1F` | haze `#FFE3F0` | void `#0B0E1F` | nebula fog `#FF8FD0` at density 0.015 |
| Secondary | bronze `#C08A3E` (bells) | thunderhead `#3A3F5C`, lightning `#E8ECFF` | neon rail `#39F0C8`, violet `#7A4FD8` | moss glint `#8BD450` |
| Sky seen from the layer | the Mouth (table in §3.3) | dome zenith `#7FB8FF` → horizon `#FFE3F0` | stars on `#0B0E1F`, planet limb `#7FB8FF` | halo rings `#FFF1C1` on `#06070F` |

- **Reserved colours** (never used for world dressing, so the UI and betrayal stay readable): betrayal crimson `#FF3D6E`, System `#0B1630` / `#5CE1E6`, gold-door gold `#FFD76A`. The nebula magentas sit ≥ 20° of hue away from the crimson.
- **Revelation** [LATER]: the Well palette warmed, with lanterns at `#FFC98A` and moss at `#6A8F3A`.

### 2.3 Layer music

Every layer transposes the one set of recipes (09 owns the recipes). The Landing waltz is 96 BPM in 3/4. The reveal motif is **this climb's seeded 5-note pentatonic Landing motif, played at half speed in the next layer's key**, so any croak chord the players add over it harmonises (WORLD §2, FO §6.2).

| | Well | Sky | Space | Beyond | Revelation |
|---|---|---|---|---|---|
| Key (transposition) | F (0) | C (−5) | G (+2) | D (−3) | F (0) |
| Added layer voice | Kalimba drips, keyed to the water | Breathy flute | FM glass bells | Formant choir pad | The whole kit, ending on a music box |
| The croak's acoustics (a readability channel) | **Echo.** A slap-back at 0.12 s (near wall) and 0.47 s (far wall) *(computed: 2·21 m and 2·81 m at 343 m/s)*, then a 3.5 s tail [MUST-A] | **Dry.** No echo on the Rim or islands: the "first shout" silence (FO §6.2) [MUST-B on the Rim] | Dry outside, a boomy 1.2 s tail inside hulls | Your croak comes back 1.5 s late, light-lagged | Echo returns |
| **Height fills the waltz** [MUST-A] | Foot: kalimba only. Landing 1 + pizzicato. Keeper Landing + music box. Landing 3 + soft organ. Warden: the full kit. | Same ladder, flute first | Same, bells first | Same, choir first | — |

The ladder is felt progress in sound: the higher you are, the fuller the waltz. It is the audio twin of the Mouth widening.

---

## 3. The Well: geometry of the Braid

One layer scene, `Well.unity`, built near the origin by the editor command `BuildLayerScene well` from `Data/World/WellLayout.json`. Only generators write it (DEC §12). **The Well frame:** the origin is on the well's axis at the Foot deck height, y is up, and bearings are measured from +x.

### 3.1 The shaft [MUST-A]

| Part | Numbers | Notes |
|---|---|---|
| Well wall | Inner radius **51 m**, 1.2 m thick, lip at **y 180** (source: WORLD §4.1) | Mossy stone `#56615A` / `#557D33`. A generated mesh of 96 radial segments with 3 LODs. |
| Water | Surface at **y −2**; height mist from −2 to +8 m (`#232B3A` over `#0E1A1F`) | The water is opaque, so the room grid far below is never visible. |
| Wall lanterns | **400** lantern niches on the inner wall, golden-angle spiral: yᵢ = 4 + 172·(i + 0.5)/400, bearingᵢ = i·137.508° | "Hundreds of lanterns": every other climb's doors. Scenery only. Two instanced draws. |
| The Mouth | The open lip, seen from below as a disc of sky (§3.3) | Its sky is a baked cubemap of the real Sky vista (§10.2), so the clouds in the Mouth are the clouds of ★1. |
| The windlass | Two stone posts on the rim at r 53 m rising to y 198, on the diameter through strand 5's bearing; a 1.6 m wooden drum spanning the Mouth at **y 196** | From the Foot it is a thin dark bar across the disc of sky (0.5° wide) *(computed)*: the classic well picture. |
| The rope and the Jar | The rope drops from the drum at d 30 m over strand 5 to **the Jar**: a glass firefly jar 12 m tall and 9 m across, hanging mouth-down with its rim at y 150 and base at y 162 | From the Foot the Jar sits inside the Mouth: 3.3° wide, projected 33.5 m from the axis at the lip *(computed)*. **The Warden is visible from minute zero.** It glows `#FFE9A0` with the fireflies inside it. |
| Lantern frogs | **12** lanterns at r 47 m, y 182, bearings φ₀ + 30°·j, on 6 m poles leaning in from the rim (source: WORLD §4.4) | **Law 2.** Lanterns are 0.4 m emissive spheres with bloom, so they read as the brightest stars in the Mouth. **Their frog bodies are not rendered until ★1.** |

### 3.2 The five strands [MUST-A strands 1–3 · MUST-B strands 4–5]

Five stone columns with braided fluting rise from the water. Strand *k* is centred **30 m** from the axis at bearing **βₖ = φ₀ + 72°·(k − 1)** (φ₀ is seeded per climb, an integer 0–359) and has a radius of **5 m** (source: WORLD §4.2). Each strand is taller than the last, so seen from the Foot they are a spiral staircase for giants: **the whole climb is visible at 0:00.**

| Strand | Top | What stands on top | What is inside |
|---|---|---|---|
| 1 | y 0 | **The Foot**: `hub_well_bottom` deck, r 9 m (07 owns its stations: map wall, statue, Mirror, four difficulty doors) | Nothing (solid) |
| 2 | y 30 | **Landing 1** (`landing_well`, r 9 m deck, 1.1 m parapet) | Floor 1: doors 1–5 |
| 3 | y 60 | **The Keeper Landing** (Landing 2; save point; Quick Climb ends here) | Floor 2: doors 6–10 |
| 4 | y 90 | **Landing 3** | Floor 3: doors 11–15 |
| 5 | y 120 | **The bucket**: the Warden arena (§3.5) | Floor 4: doors 16–20 |

```
 UNROLLED SIDE VIEW (bearings spread left → right, 72° apart; heights true)
 y 196  ════════════ windlass drum across the Mouth ════════════
 y 182   ✦    ✦    ✦    ✦    ✦    ✦   lanterns (r 47) = "the brightest stars"
 y 180 ══╧════════════════════════════╧══ lip, R 51 m  (the Rim, §9.7)
 y 162                                        ┌──┐  the Jar on its rope
 y 150                                        └──┘
 y 120                                  [\___bucket r 20___/]  strand 5 top
 y 114                                        [20]
 y  90                         [==L3==]~~~~~~~[16]            (bridge 21.3 m)
 y  60              [==L2==]~~~~~~[11]   ▯ doors 11–15 in strand 4
 y  30   [==L1==]~~~~~~[6]   ▯ doors 6–10 in strand 3
 y   0  [FOOT]~pads~[ 1 ]  ▯ doors 1–5 in strand 2
 y  −2 ~~~~~~~~~~~~~~~~~ black water, mist, 8 eggs ~~~~~~~~~~~~~~~~~
        strand 1   strand 2   strand 3   strand 4   strand 5
```

**Clearance** *(computed, sampled along each sightline)*: from every stop's centre at eye height 1.6 m, the line to the centre of the Mouth clears all other geometry (strands, decks, bridges, the bucket, the Jar) by **≥ 7.9 m**. Nearest obstacles: from the Foot, the bucket's underside at 8.5 m; from Landings 1–3, their own bridge at 7.9 m; from the bucket, the Jar at 9.0 m. The CI test keeps the minimum ≥ 3 m (§12).

### 3.3 The Mouth grows, and the day passes [MUST-A to 44° · MUST-B 56° and 74°]

Each stop sees a wider Mouth (DEC §4) and a later sky. Time only moves when you come out onto a Landing, so every Landing says "time has passed, you have climbed". The Mouth's sky crossfades over the Landing's first 8 s.

| Stop | y | Mouth *(computed, radial plane, eye 1.6 m)* | Share of the upper sky (source: WORLD §4.3) | Sky in the Mouth | First-climb clock (DEC §5) |
|---|---|---|---|---|---|
| The Foot | 0 | **31.1°** | 3.7% | Afternoon `#8FC3F2`, a sun glow `#FFF3C4` on one side | 0:00 |
| Landing 1 | 30 | **36.7°** | 5.1% | Late afternoon `#F6D29A` → `#9CC0E8` | 4:45 |
| Keeper Landing | 60 | **44.4°** | 7.6% | Dusk: `#F2A65A` at the rim over `#1B2340` | 10:25 |
| Landing 3 | 90 | **55.9°** | 12.0% | Blue hour `#3A3F6E`, the first stars | 16:30 |
| The bucket (Warden) | 120 | **74.0°** | 21.1% | Night `#0B0E1F`; stars and the 12 lanterns | 19:30 |
| ★1 lift | 140 / 160 / 177 | 93° / 126° / 175° (source: WORLD §10.2) | 33% / 57% / 96% | Pre-dawn `#2B3A67`, sunrise `#FFD9A0` at ★1 21 s | ~22:30 |

The visible sky grows **5.7×** over the climb with no new system (source: WORLD §4.3). The Keeper pull-back (§9.5) rises on the axis, where the Mouth spans 104° at y 140 *(computed)*.

### 3.4 Inside a strand: niches, stairs and slits [MUST-A]

- **The stair.** Each strand holds a central spiral stair (dressing with collision; nobody has to walk it, see §4.1). It opens through a 2 m hatch in the deck above.
- **Door niches.** Each floor has five niches, one per door, stacked up the strand at **y = 30·(f − 1) + 6·(j − 1)** for local door *j* = 1…5 of floor *f*. So floor 1's niches are at y 0 / 6 / 12 / 18 / 24, and door 20's niche is at y 114.
  - A niche is an alcove 7 m wide, 4 m deep and 4.5 m tall, lit by two wall lanterns. It is where the party stands to read plaques and vote.
  - One or two doors stand on its back wall, 2.2 m wide by 3.0 m tall, 1.2 m apart. Each has its plaque on the frame at 1.4 m height (§5). The doors are giant next to a froglet: *everything is bigger than you.*
  - Every niche has a sealed side room behind a wall panel, facing the axis. When the planner puts `br_window` at that slot, the panel swaps to the cracked variant (§9.3). This makes the window possible at any door height with one prefab.
- **Arrow slits: the lit trail** [MUST-A]. Each niche has one 0.35 × 1.1 m slit in the strand's outer face. It stays dark until its door is **cleared**, then glows warm `#FFB86B` for the rest of the climb.
  - A failed door glows a dim rust `#7A3B1E`.
  - A hidden clear adds a gold glint `#FFD76A`.
  - From every Landing you see your climb traced in light up the strands, and above you the dark slits of the doors still to come. The Keeper pull-back and ★1 show the whole trail. It is cheap (emissive toggles) and it is **felt progress in the architecture**.
- **Door 1** is the exception: a 6 m door stamped **1** at strand 2's base, facing the hatch pond. `br_shove_door` is a real chamber inside the strand base, with no fade. Its jar room ends in a short stair up to door 2's niche, which teaches once that the tower goes up (1.5 s).

### 3.5 The bucket: the Warden arena [MUST-B]

- **What it is.** The top of strand 5 is **the well's own bucket**: a wooden bucket 20 m in radius with 2.0 m staves and iron hoops, at y 120.
  - Door 20's niche (y 114) leads up a stair through the drain hatch at the bucket's centre. It is the only rule door played in the real shaft, because ★1 starts from it.
  - An iron handle arch spans the bucket, its top at y 132.
- **Clearance.** The bucket's edge reaches d 50 m against the wall at 51 m, so it rises in ★1 with 1 m to spare *(computed)*.
- **The fight.** `05_ROOMS_SLICE.md` owns `warden_the_jar` (P1 old monsters at their old numbers, P2 a Chorus lifts the Jar, P3 the Trust Fall). This file fixes only where it stands and how it ends: **the rope comes down** (§9.6).
- **The idiom.** 井底之蛙, the frog at the bottom of the well. What lifts a frog out of a well is the bucket, and the rope has a knot. KNOTWELL.

### 3.6 Landings and bridges [MUST-A L1 and L2 · MUST-B L3]

- **The decks.** Each Landing is an r 9 m deck on its strand's top, with a 1.1 m parapet (it cannot be fallen off).
  - 07 owns the stations: jar lineup, toy, stall (from Landing 2), Knot spot (from Landing 3), Mirror.
  - Arrivals climb out of the central stair hatch, so "arrivals come up from below" is literally true.
- **The bridge.** "Climb on" unrolls a **rope-and-plank bridge** (2.4 m wide, knotted rope rails) from the deck edge to the next strand's first niche at the same height. It is **21.3 m long** *(computed: chord 35.27 m − deck 9 m − strand 5 m)*, about 4.3 s at 5 m/s. The walk counts inside the Landing's 40 s budget.
- **From every Landing you see:**
  - the Mouth, bigger than last time;
  - the lit trail below;
  - the next strand's dark slits and its niche lanterns;
  - the bucket's underside and the Jar;
  - the water and the eggs far below.

### 3.7 The Foot and the hatch pond [MUST-A]

The Foot deck (strand 1 top, y 0) is the title screen and hub (07). The hatch pond is the water between strand 1 and strand 2's base: eight eggs bob in it, and lily pads lead 21 m from the Foot to the giant door 1. The onboarding (`hatch_pond`, 0:00–0:35) happens on those pads. The statue of the first frog stands on the Foot, looking up: 우물 안 개구리 / 井底之蛙 (DEC §8.2 #14).

### 3.8 The room grid: where rooms actually are [MUST-A]

Rule rooms, the Keeper, toy doors, jar rooms, the gold room, the meeting room and set pieces are **baked shells on a 300 m grid under the shaft** (DEC §4).

- **Layout.** Cells (i, j) for i, j ∈ −3…3 have their centres at **(300·i, −600, 300·j)** in the Well frame: 49 cells, far below the opaque water.
- **Assignment.** `WorldBuilder` assigns cells by sorting RoomDef ids, so a room's cell never moves between builds. A room fits a cell of at most 120 × 120 × 60 m.
- **Why 300 m.** Cells never share physics, light probes or audio (audio max distance is 60 m).
- **Why it is safe.** Every coordinate stays within ±1.2 km of the origin, where float32 is precise to about 0.1 mm *(computed: 1,200 m ÷ 2²³)*. The Well needs no floating origin (§10.5).
- **In-shaft rooms** (real geometry, no fade): `hub_well_bottom`, `hatch_pond`, `br_shove_door`, `br_window` (at any niche), `landing_well` (strands 2–4), `warden_the_jar` (the bucket) and `rim_surface` (the lip).

### 3.9 `WellLayout.json`, the file the generator reads [MUST-A]

```json
{
  "well":      { "innerRadius": 51, "wallThickness": 1.2, "lipY": 180, "waterY": -2, "mist": [-2, 8], "radialSegments": 96 },
  "strands":   { "count": 5, "axisDistance": 30, "radius": 5, "bearingStepDeg": 72, "tops": [0, 30, 60, 90, 120],
                 "roles": ["foot", "floor1", "floor2", "floor3", "floor4"] },
  "niches":    { "firstY": "30*(floor-1)", "stepY": 6, "size": [7, 4, 4.5], "door": [2.2, 3.0], "doorGap": 1.2,
                 "plaque": { "size": [0.9, 0.6], "centreHeight": 1.4 }, "slit": [0.35, 1.1] },
  "landings":  { "radius": 9, "parapet": 1.1, "hatch": 2, "bridge": { "width": 2.4, "length": 21.3 } },
  "bucket":    { "radius": 20, "staves": 2.0, "floorY": 120, "handleTopY": 132, "drainHatch": 1.5 },
  "windlass":  { "postRadius": 53, "postTopY": 198, "drumY": 196, "drumDiameter": 1.6 },
  "jar":       { "height": 12, "diameter": 9, "rimY": 150, "axisDistance": 30 },
  "lanterns":  { "rim": { "count": 12, "radius": 47, "y": 182, "stepDeg": 30 },
                 "wall": { "count": 400, "y": [4, 176], "goldenAngleDeg": 137.508 } },
  "roomGrid":  { "y": -600, "cell": 300, "range": [-3, 3], "maxRoom": [120, 120, 60] },
  "mouthStops":{ "y": [0, 30, 60, 90, 120], "expectedDeg": [31.1, 36.7, 44.4, 55.9, 74.0], "toleranceDeg": 0.2 }
}
```

---

## 4. How floors, Landings and doors work

### 4.1 The door loop, step by step [MUST-A]

One door slot, from leaving the last room to entering the next:

| Step | What happens | Time |
|---|---|---|
| 1. Exit | The room's exit door opens on `[ CLEAR ]` (or the Tower spits the party out on a failure, FO §3.7). Each frog that crosses the exit threshold fades out (0.15 s), is teleported by the host, and fades in (0.25 s) **2 m in front of the next niche**. | 0.4 s per frog |
| 2. The niche | Warm lamps, the stair spiralling above and below, the plaque(s) glowing. The door counter slams `DOOR n` on the wall of the niche (09 owns the slam). | — |
| 3. Choose | **Breather, Heart, set piece, Rematch, Keeper, Warden:** a single door opens by itself when the first human is within 3 m. **Pair:** the walk-vote (§4.2). **Fork:** both doors open (§7). | 0–4 s |
| 4. Enter | Each frog crossing the doorway fades (0.4 s) into the room cell's entry pad. The door stays open until every frog assigned to it has passed, or **8 s** after the first human passed; then stragglers are drawn in by a gust over 1 s (no penalty, no choice lost). | ≤ 8 s |
| 5. The room | 05 owns everything inside. | 15–150 s |

- **World overhead per climb** *(computed)*: 40 fades × 0.4 s = 16 s, plus the walk-vote's 4 s on about 12 slots (48 s, FO's "door choice ≈ 1 min"). The bridges sit inside the Landings' 40 s. Telemetry enforces FO §3.5's cap: **time outside rooms ≤ 12% of a climb**.
- **No walking between doors.** Players can walk down the stair to the previous (sealed) niche, but the loop never needs it. Bots never path between niches.

### 4.2 The walk-vote on pairs [MUST-A] (FO §3.3, DEC §8.1)

- **Doorway zones.** Each door has a zone 1.5 m deep in front of it.
- **The vote.** **4 s after the first human steps into a zone**, the door with more humans in its zone opens. A tie goes to the door the first human reached. Only humans count.
- **After the vote.** The other door seals: its plaque dims to 30% and a stone bar drops across it. It stays on the map as the unchosen side, and its room may return later (§6.5).
- **Bots.** In solo the human decides. Bots stand near the doors and bark suggestions during the 4 s ("This one!"), but they never vote.
- **Feedback.** A ring fills around the leading door's plaque over the 4 s, in the colour of the humans' Seat Hues (split ring when mixed).

### 4.3 Floors and stops [MUST-A floors 1–2 · MUST-B floors 3–4]

| Floor | Doors | Strand | Ends at | Then |
|---|---|---|---|---|
| 1 | 1–5 | 2 | Landing 1, y 30 (40 s) | Bridge to strand 3 |
| 2 | 6–10 | 3 | The Keeper (door 10), then the Keeper Landing, y 60: the ceremony (≤ 40 s, 07), **save point, the Quick Climb ends** | Bridge to strand 4 |
| 3 | 11–15 | 4 | Landing 3, y 90 (40 s) | Bridge to strand 5 |
| 4 | 16–20 | 5 | The Warden in the bucket, y 120; ★1 on a clear | The Rim |

**Sessions in space.**
- A Quick Climb saves at the Keeper Landing.
- **Resume** and **Retry from door 11** (until first surfacing, DEC §8.2 #16) both spawn the party on the Keeper Landing, with the bridge to strand 4 already unrolled.
- "Climb again" and "Rest" after results fade to the Foot. "Climb again" re-hatches the party in the pond.

### 4.4 Failure in space [MUST-A]

A failed room still exits forward: the Tower spits the party out through the exit threshold with a comic *plop* in front of the next niche, and the slit for that door glows rust (§3.4). A Warden failure never skips ★1 silently: ★1 plays **only on a Warden clear** (05 owns Warden retries; 04 owns Team Lives).

---

## 5. Door plaques: what do I get, and how scary is it?

### 5.1 Exactly four fields [MUST-A] (DEC §10 #5, FO §3.4)

| # | Field | Values | Size on the tablet |
|---|---|---|---|
| 1 | **Number + letter** | `5B`, `12E`, `11♥`. Breathers and gold doors are unlettered (`9`). The letter always matches the suit: A ♠, B ♦, C ♣, E solo/duo, ♥ Heart (DEC §5). | Numerals 0.26 m tall |
| 2 | **Suit, or type mark** | ♠ Body `#FF6B2C` · ♦ Mind `#4FC3F7` · ♣ Together `#8BD450` · ♥ Heart `#FF3D6E` · E `#B388FF` with a **SOLO** (one frog) or **DUO** (two frogs) tag. Type marks where there is no suit: a small lantern (breather), a bell (Keeper), the Jar (Warden). | 0.14 m |
| 3 | **Prize icon** (a closed set of five) | **Boon**: a seed-leaf cradling a firefly (rule doors, set pieces, ♥ doors, the Keeper). E doors show it with a star, meaning Rare or better (FO §3.3). **Jar** (jar breathers, toy doors, the sleeping threat). **Gold** (gold doors). **Key** (the Meeting Door's two locks). **Window** (window breathers, and the Warden: what you win is what you will see). | 0.14 m |
| 4 | **Skulls** | 1–3 from the RoomDef, +1 on Hard and Hell, drawn up to 4. Breathers show none. | 0.08 m each |

- **Nothing else goes on the plaque:** no payout formulas, capacity dots, rule text, layer glyphs or odds.
- **Shape before colour.** Suits read by shape (colour-blind safe), never by colour alone.
- **The tablet.** A 0.9 × 0.6 m tablet on the door frame at 1.4 m height, in self-lit "glow chalk" (emissive, so it blooms in dark niches).
- **Legibility** *(computed)*: the numerals are about 30 px tall at 8 m at 1080p with a 60° vertical FOV. The CI golden screenshot requires the suit and skulls to be readable at 12 m.

### 5.2 Door variants on the same four fields

| Door | Plaque | Frame and extras | Tag |
|---|---|---|---|
| Breather (jar, toy, window, sleeping threat) | `6` · lantern · jar or window · — | Warm wood door; light spills under it | [MUST-A] |
| Rule pair | `5B` / `5C` · suit · Boon (or jar, per the RoomDef) · skulls | Stone door with an iron ring | [MUST-A] |
| **Gold door** | `9` · lantern · **gold** · — | **Gilded frame and plaque (`#FFD76A`)**, 40 sparkles/s (Shuriken), a warm light pool 2 m out under the door, a shimmer loop audible from 12 m. Everyone hears it before they see it. | [MUST-A] |
| E door (fork) | `12E` · E + SOLO/DUO · Boon★ · skulls | **Violet rim** `#B388FF`, and the door is physically narrower (1.2 m), so the cap reads in the architecture | [MUST-B] |
| **Heart door** | `11♥` · ♥ · Boon · skulls | Crimson ♥ and a knotted-rope carving on the frame. DEC §1's line is carved under it, localised: *THEY MIGHT NOT CUT IT.* | [MUST-B] |
| **Rematch** | `18A` · the room's suit · Boon · its skulls, plus a brass strip under the plaque: `OLD TIME 1:12` | The frame is scuffed; your old time was scratched there by you | [MUST-B] |
| Keeper | `10` · bell · Boon · 2 | Double-height door; a bell tolls behind it every 4 s, audible from the stair below | [MUST-A] |
| Warden | `20` · the Jar · window · 3 | The niche stair leads up through the bucket's drain hatch (§3.5) | [MUST-B] |
| Meeting Door (after a fork) | Two key slots, no number | Two bronze locks; each lights when its key is used | [MUST-B] |

- **Per-layer frames** [LATER]: the Sky uses painted wood with cloud scrolls, Space an enamel plate on a steel hatch, the Beyond etched glass. The four fields never change.
- **Rank C talent, "See one door ahead"** (FO §4.3, owned by 04). Players who have it see a thin chalk strip under the current plaque with the next slot's prize icons. Plaques are drawn per client from replicated data, so this costs nothing. [MUST-A]

### 5.3 Gold doors: the odds, published [MUST-A]

The odds page text is generated from `ClimbRules.json`, because the System never lies (FO §2.2):

> **Gold doors.** Every breather or pair slot from door 2 to 19 has a **5%** chance to hold a gold door. At most **2** per climb. If none has appeared by door 15, the first breather on floor 4 turns gold. **First climb: one guaranteed gold door (door 9).** Rank B raises the chance to 7%. The Lucky Belly Boon doubles it.

- **On a breather slot**, the gold door replaces the breather.
- **On a pair slot**, one seeded side becomes an unlettered gold door beside a normal rule door. That is the jackpot choice: treasure, or the Boon and the fight. The rule room goes back into the pool as unchosen.
- **What the numbers mean** *(computed: 200,000 simulated seeded climbs over the skeleton table of §6.4)*:

| Chance per slot | Full Climbs whose gold comes from the floor-4 guarantee | Full Climbs with 2 gold doors | Quick Climbs (doors 2–10) with a gold door | Mean first gold door |
|---|---|---|---|---|
| 5% | 62% | 8% | 25% | 13.8 |
| 7% (Rank B) | 50% | 14% | 33% | 12.6 |
| 10% (Lucky Belly) | 37% | 24% | 44% | 11.1 |

- **The honest reading.** The 5% rate FO specifies makes floor 4 the usual place for gold. That is flagged in §13.
- **Where the rate comes from.** The lobby uses 7% if any human has the Rank B talent and Rank Sync is off. That matches the "lobby's best unlock" rule (FO §3.6).

### 5.4 Hidden rooms [SHOULD]

RR asks for "rare gold-rimmed doors **and hidden bonus rooms**", and the roguelite note asks to "sometimes hide a bonus room behind a puzzle". This is the smallest version that coins no noun.

| Rule | Value |
|---|---|
| **Frequency** | **1 climb in 5**, seeded; never in the first climb. Published on the odds page: "One climb in five hides a room." |
| **Where** | One jar or window breather on doors 6–19 |
| **The tell** | A hairline crack in the breather's wall glowing a cool `#9FE6FF`, plus a whistling breeze that is positional and audible within 6 m. Anyone within 4 m sees it. The Third Eye and Firefly Sense Boons show it through walls within 15 m. |
| **Opening** | Tongue the loose stone (20 kg, Tongue I can pull it). It pops out and leaves a 0.9 m crawl gap. There is no plaque: **it is the only door without one.** |
| **Inside** | A 12 × 8 m cave built into the same breather prefab (a variant, so no teleport). It holds **one jar one tier above the climb's normal jar**, and a sliver of the next layer: in the Well, a warm breeze and a crack of real daylight. |
| **Cost to play** | ≤ 20 s. It never holds a Boon (the pick cadence is 04's) and never costs a life. |
| **Payout** | The jar. It also counts as a hidden clear for Rank Points (+5, FO §4.3; 04 confirms). |
| **Bots** | Bots never open it first. On a player's Rookie climbs one Rival may glance at the crack after a human has stood within 4 m for 3 s without noticing ("…is that wind?"). |
| **Map** | Once found, a dotted side lobe with a crack glyph on that door's node |
| **Build cost** | S: two prefab variants (`br_jar_mites`, `br_window`) with the cave behind a removable wall |

---

## 6. Seeded generation: the climb planner

### 6.1 Principles [MUST-A]

- **One planner, on the host.** `ClimbPlanner` is pure C# in `Game.Tower`, with no `UnityEngine` dependency, so it is EditMode-testable. The host runs it. **Clients never run it.** They receive a small plan message and draw plaques and the map from it (WORLD §7.1: broadcast, don't regenerate).
- **One number replays everything.** `climbSeed` plus the **choice log** (per slot: the chosen door, fork membership, clear or fail, and clear time) rebuilds a whole climb exactly. This is UT's seed pattern: agents edit data, the network carries one number, and QA replays soak failures.
- **Integer decisions only.** Every discrete choice uses a PCG32 stream and integer maths. `NextInt(n)` uses Lemire's unbiased method; chances are basis points, with `Chance(500)` meaning 5%. Nothing uses `UnityEngine.Random` or float compares, so Editor and Player replays match.
- **Named streams.** Each purpose draws from its own stream, keyed by xxHash64 of (climbSeed, name, args): `"skeleton"`, `"gold"`, `"breather"`, `"hidden"`, `("slot", d)`, `("twist", d, roomId)`, `("offstage", d)`. Adding a new stream later never shifts an old one, so recorded replays survive content updates.
- **Seed derivation.** `climbSeed = SplitMix64(lobbySeed ^ ((ulong)layer << 32) ^ climbIndex)`. The host draws `lobbySeed` from the OS CSPRNG when the lobby is created. The Daily Seed [LATER] would derive it from the date.
- **It is not the offer salt.** Boon offers and secret quests use the host-only salt (FO §4.1). The climb seed carries no hidden information: plaques are public.

### 6.2 Inputs

```csharp
public sealed record ClimbContext(
    ulong LobbySeed, int Layer, int ClimbIndex,
    Difficulty Difficulty, int Humans, LobbyType Lobby,
    bool AuthoredFirstClimb,                 // any human who has never reached a Keeper → true
    MilestoneFlags Flags,                    // which slot kinds this build has (A: no F/H/S)
    IReadOnlyList<string> UnmetMonsters,     // no Bestiary "Seen" stamp for ≥1 human, in debut order
    int GoldBasisPoints,                     // 500, or 700 (Rank B talent, Rank Sync off)
    bool LuckyBelly, int RematchCount);      // 1, or 2 at Rank SSS (FO §4.3)
```

- **Authored or seeded.** The lobby plays the authored first climb (DEC §5; content in `Data/World/Climbs/well_first.json`, owned by 05) **if any human has never reached a Keeper**. Otherwise it is seeded. In friends and private lobbies the host may switch this off.
- **The authored climb's Twists** use the fixed seed `0x4B4E4F54` ("KNOT"), so climb 1 is identical and testable.
- **Debut order.** Monsters never shown on a plaque to the lobby's humans come first. That puts `moss_snail` and `web_spider` first in climb 2 (DEC §5). Monsters shown but never entered come next, in Bestiary order.

### 6.3 Slot kinds

| Kind | Code | Doors | Notes |
|---|---|---|---|
| Breather | B | 1 | Door 1 is always `br_shove_door`. Subtypes: jar, toy, window, sleeping threat, gold. |
| Pair | P | 2 | Two rule doors of different suits |
| Fork | F | 2 | A group rule door plus an E door (SOLO/DUO) → `meeting_room` → the Meeting Door |
| Heart | H | 1 | From the ♥ pool of 4 |
| Set piece | S | 1 | `sp_grip_wall`, `sp_tongue_tether` |
| Rematch | R | 1 | A beaten rule room at its old numbers (DEC §4) |
| Keeper / Warden | K / W | 1 | Fixed per layer |

**Rhythm rules**, "dread, then a waltz" (FO §2.2). *Light* means B or R; *heavy* means everything else.
- Within a floor, no two light slots are adjacent.
- Within a floor, no more than 2 heavy slots run in a row.
- Every floor has at least one light slot.
- A Landing resets both counts.

### 6.4 Phase A: the skeleton, at climb start

**Fixed slots** (DEC §5): 1 = B, 2 = P, 7 = F, 10 = K, 12 = F, 17 = F, 20 = W.

**The 13 free slots** {3, 4, 5, 6, 8, 9, 11, 13, 14, 15, 16, 18, 19} get:
- **6 × B**, so there are 7 breathers counting door 1 (DEC §6's 7);
- **2 × S**, exactly one in doors 2–9 and one in 11–19 ("one set piece in each half");
- **1 × R**, in {15, 16, 18, 19} ("one Rematch in doors 15–19");
- **1 or 2 × H** (50/50), from door 6, at least 3 doors apart (FO: 1–2 per climb);
- **P** for the rest, so every climb has 8 rule-type slots (3 forks + pairs + ♥), which is FO §3.2's ~40%.

One more rule: floor 4 must contain a B, so the gold guarantee always has a home.

**Baked table** *(computed: exhaustive enumeration)*:
- Exactly **4,500** skeletons satisfy every rule: **2,410** with one ♥ and **2,090** with two.
- `SkeletonTable.json` is generated by an editor command from `ClimbRules.json` and committed. At runtime the planner picks a row uniformly within the chosen ♥ count. There is no rejection sampling and no retry loop.
- When a debut is pending, the planner filters to the **4,310** rows (95.8%) that have a pair in doors 3–9.
- The authored first climb deliberately breaks two seeded rules (no set piece before door 10; two ♥ doors on floor 3), so it is validated separately.

**MUST-A build** (no forks, ♥ doors or set pieces yet; DEC §7): repeat Quick Climbs use a 10-door table. Door 7 becomes a pair, and there are 4 breathers (door 1 plus 3). **5 skeletons** qualify *(computed)*, for example `B P B P P B P B P K`. Pairs are re-rolled and Twists re-seeded every Quick Climb (DEC §7).

**Overlays, rolled on the skeleton's own streams:**
1. **Gold**: see §5.3. The side of a gold pair is `gold.NextInt(2)`.
2. **Debut**: if `UnmetMonsters` is not empty, one pair in doors 3–9 (uniform) becomes the debut pair. It shows the first two unmet monsters of different suits; a same-suit second monster moves to the next pair or fork before door 10. **Debut monsters are reserved: no other slot may draw them before the debut slot.** The pair guarantees that both are *offered* and one is *met* before door 10. The unchosen one gets ×3 weight in later draws.
3. **Breather subtypes**, drawn on the `"breather"` stream over the non-gold B slots (excluding door 1):
   - window ×1, weighted 3 : 1 toward doors ≤ 9, so the first glimpse of scale comes early;
   - toy ×2, at most one per floor;
   - sleeping threat ×1, only in doors 11–19;
   - jar for the rest.

   If there are too few slots, the sleeping threat drops first, then the second toy. Only rooms enabled in the build's flags are drawn.
4. **Hidden room** [SHOULD]: `hidden.Chance(2000)` picks one jar or window breather in doors 6–19.

### 6.5 Phase B: doors, just in time

The host fills **slot d when slot d − 1's plaques are revealed** (lookahead 1). That is early enough for the Rank C "see one door ahead" strip. The choice at slot d − 1 is not yet known at that moment, so nothing in Phase B depends on it: unchosen rooms return only from two slots later, and the suit rule is a fixed rotation.

| Kind | Assignment |
|---|---|
| **P** | Offer the 2 suits that the **suit rotation** leaves in (below). Draw one room per suit. On a gold slot, replace the seeded side with the gold door. Rooms on the plaques of slot d − 1 are excluded. |
| **F** | Draw the group side from rule rooms of the 2 suits the rotation leaves in (set pieces excluded in seeded climbs), and the E side from the E pool. **If no E room is eligible, the fork is played as a pair** (no split), and the event is logged. If no group room is eligible at all, the slot becomes a jar breather. |
| **H** | Draw from the ♥ pool, using each RoomDef's eligibility (for example `heart_tied_bridge` needs the Knot to be unlocked, `doppelfrog` picks its variant from the human count). |
| **S** | The half's set piece. There are exactly 2 in the slice, one per half. |
| **R** | The rule room played this climb whose clear took longest (you struggled; now flatten it). Ties go to the earliest. In layers ≥ 2 there is a 25% chance of an earlier layer's room. **If no beaten rule room exists, R becomes a jar breather.** |
| **B / K / W** | Subtype from Phase A; Keeper and Warden are fixed per layer. |

**The suit rotation** (DEC's "no suit three times in a row", made lookahead-proof). Number the P and F slots of a climb in order: rule slot 1, 2, 3…
- Rule slot *i* leaves out suit `perm[(i + phase) mod 3]`, where `perm` is a seeded permutation of ♠ ♦ ♣ and `phase` ∈ {0, 1, 2}.
- Any three consecutive rule slots therefore leave out each suit once, so **no suit can be played three times running**, whatever the party chooses.
- The rule needs no knowledge of choices, so it survives the lookahead.
- `phase` is chosen so that the debut pair leaves out the suit that neither debut monster uses (♠ for `moss_snail` ♦ + `web_spider` ♣).
- ♥, set piece, Rematch and breather slots neither count nor break the sequence. An E door played at a fork counts as a different suit.
- **When a pool runs dry**, the left-out suit stands in for an empty suit. The rotation breaks only then.

**The pool rule** (DEC §5):
- A rule room, set piece or ♥ room **you played** never returns in the same climb, except as the Rematch.
- **The side you didn't choose can return, from two slots after it was offered.**
- An E room that offstage Rivals took counts as unchosen.
- **Breathers are exempt**, because the slice has exactly 7 breather rooms for 7 breather slots and a missing gold door leaves one slot short. A breather never repeats within a floor, and `br_jar_mites` appears at most 3 times per climb, with fresh Twists each time.

**Room weights** inside a suit:
- **×3** for a monster unmet by the most humans;
- **×2** for a room the host has not played in its last 2 climbs;
- **×1** otherwise.

Ties break by RoomDef id order, which keeps the draw stable.

**Twists.** Each drawn room gets `twistSeed = Hash(climbSeed, "twist", d, roomId)`. 05's RoomDef picks its 2 Twists from it. Twists touch only dynamic objects, so one baked shell serves every seed (DEC §4, plan_2).

**Pool pressure with the MUST-B content** *(computed: 5,000 seeds for each of 5 choice policies, slice pools ♠ 3 · ♦ 3 · ♣ 4 rule rooms, E 2, ♥ 4, S 2)*:

| Event | Climbs where it happens at least once |
|---|---|
| A pair collapses to a single door (every eligible suit dry) | ≤ 0.7% |
| A suit is played three rule slots running (forced by a dry pool) | ≤ 1.6% |
| A fork's group side has no room (the slot becomes a jar breather) | ≤ 0.3% |
| The third fork plays as a pair because the E pool is empty | **25%** for a player who takes E half the time; **100%** for one who always does |

- The fork row happens because the slice has only 2 E rooms. The SHOULD `*_e` variants remove it (flagged in §13).
- The debut pair is offered in every debut climb by construction, because its monsters are reserved. Both debut monsters are *played* in climb 2 in 14–28% of climbs, depending on the policy.
- The Rematch always finds a beaten room unless every rule door failed.

### 6.6 Pseudo-code

```csharp
// Game.Tower.ClimbPlanner (host only)
public ClimbPlan Plan(ClimbContext ctx)
{
    ulong seed = SplitMix64(ctx.LobbySeed ^ ((ulong)ctx.Layer << 32) ^ (ulong)ctx.ClimbIndex);
    if (ctx.AuthoredFirstClimb)
        return ClimbPlan.FromAuthored(Data.Climbs["well_first"], twistSeed: 0x4B4E4F54UL);

    var sk = Rng.Stream(seed, "skeleton");
    var table = SkeletonTable.For(ctx.Flags);                     // 4,500 rows (B) or 5 rows (A)
    if (ctx.UnmetMonsters.Count > 0) table = table.WithPairIn(3, 9); // 4,310 rows
    int hearts = ctx.Flags.HasHearts ? (sk.Chance(5000) ? 2 : 1) : 0;
    string kinds = table.Rows(hearts)[sk.NextInt(table.Rows(hearts).Count)];

    var plan = new ClimbPlan(seed, ctx.Layer, kinds);

    // Gold overlay (§5.3)
    var g = Rng.Stream(seed, "gold");
    int bp = ctx.GoldBasisPoints * (ctx.LuckyBelly ? 2 : 1);
    for (int d = 2; d <= 19 && plan.Golds.Count < 2; d++)
        if ((kinds[d-1] == 'B' || kinds[d-1] == 'P') && g.Chance(bp))
            plan.AddGold(d, side: kinds[d-1] == 'P' ? g.NextInt(2) : 0);
    if (plan.Golds.Count == 0)
        plan.AddGold(FirstIndex(kinds, 'B', 16, 19), side: 0);    // the table guarantees one exists

    plan.SuitPerm = sk.Permutation(new[] { Suit.Spade, Suit.Diamond, Suit.Club });
    plan.SuitPhase = sk.NextInt(3);
    if (ctx.UnmetMonsters.Count > 0)
    {
        plan.DebutSlot = PairsIn(kinds, 3, 9)[sk.NextInt(PairsIn(kinds, 3, 9).Count)];
        plan.SuitPhase = PhaseThatLeavesOut(plan, plan.DebutSlot, SuitNotUsedBy(ctx.UnmetMonsters.Take(2)));
    }
    plan.Breathers = AssignBreatherSubtypes(Rng.Stream(seed, "breather"), kinds, plan.Golds, ctx.Flags);
    if (ctx.Flags.HiddenRooms && Rng.Stream(seed, "hidden").Chance(2000))
        plan.HiddenSlot = PickHiddenSlot(Rng.Stream(seed, "hidden"), plan.Breathers, 6, 19);
    return plan;                                                  // replicated as ClimbPlanMsg (≤ 200 B)
}

// Fills slot d. Called when slot d-1's plaques are revealed (lookahead 1); slot 1 at climb start.
public SlotDoors Assign(int d, ClimbPlan plan, ClimbHistory h, ClimbContext ctx)
{
    var r = Rng.Stream(plan.Seed, "slot", d);
    switch (plan.Kinds[d-1])
    {
        case 'B': return SlotDoors.Single(Breather(plan.Breathers[d], gold: plan.IsGold(d)));
        case 'P':
            var suits = plan.SuitsLeftIn(plan.RuleSlotIndex(d));    // the rotation: 2 of 3 suits
            var doors = new List<Door>();
            if (d == plan.DebutSlot) doors.AddRange(DebutDoors(ctx.UnmetMonsters, h));
            foreach (var s in r.Shuffle(suits).Append(plan.SuitLeftOut(plan.RuleSlotIndex(d))))  // left-out suit only stands in
                if (doors.Count < 2 && !doors.Any(x => x.Suit == s) && PickRule(r, s, d, h, ctx) is { } room)
                    doors.Add(room);
            if (plan.IsGold(d)) doors[plan.GoldSide(d)] = Door.Gold(d);
            return SlotDoors.Of(doors);                             // 1 door if every suit ran dry (≤ 0.7% of climbs)
        case 'F':
            var group = FirstNonNull(r.Shuffle(plan.SuitsLeftIn(plan.RuleSlotIndex(d)))
                            .Append(plan.SuitLeftOut(plan.RuleSlotIndex(d)))
                            .Select(s => PickRule(r, s, d, h, ctx, excludeSetPieces: true)));
            if (group is null) return SlotDoors.Single(Breather("jar", gold: false));   // ≤ 0.3% of climbs
            var e = PickE(r, d, h, ctx);
            return e is null ? SlotDoors.Of(group, PickRule(r, OtherSuit(group), d, h, ctx))  // fork → pair
                             : SlotDoors.Fork(group, e);
        case 'H': return SlotDoors.Single(PickHeart(r, d, h, ctx));
        case 'S': return SlotDoors.Single(PickSetPiece(d < 10 ? 0 : 1, h));
        case 'R': return h.BeatenRuleRooms.Any()
                    ? SlotDoors.Single(Door.Rematch(h.LongestClear(), oldTime: h.ClearTime(h.LongestClear())))
                    : SlotDoors.Single(Breather("jar", gold: false));
        case 'K': return SlotDoors.Single(Door.Keeper(ctx.Layer));
        default:  return SlotDoors.Single(Door.Warden(ctx.Layer));
    }
}

Door PickRule(Rng r, Suit s, int d, ClimbHistory h, ClimbContext ctx)
{
    var pool = Data.RuleRooms(ctx.Layer, s).Where(x =>
        x.MinDoor <= d && d <= x.MaxDoor && x.EligibleFor(ctx) &&
        !h.Played.Contains(x.Id) &&
        !(h.UnchosenAt.TryGetValue(x.Id, out int u) && d - u < 2) &&      // unchosen at u returns from u+2
        !h.ReservedDebut.Contains(x.Id) &&
        !h.OnPlaquesOf(d - 1).Contains(x.Id));                           // never the room just offered
    return r.WeightedPick(pool.OrderBy(x => x.Id), x =>
        (ctx.UnmetMonsters.Contains(x.MonsterId) ? 3 : 1) * (h.HostRecentlyPlayed(x.Id) ? 1 : 2));
}
```

### 6.7 `ClimbRules.json`: every tunable in one place [MUST-A]

```json
{
  "fixedSlots":   { "1": "B", "2": "P", "7": "F", "10": "K", "12": "F", "17": "F", "20": "W" },
  "freeCounts":   { "B": 6, "S": 2, "R": 1, "H": [1, 2], "P": "rest" },
  "heartWeightsBp": { "1": 5000, "2": 5000 }, "heartMinDoor": 6, "heartMinGap": 3,
  "setPieceHalves": [[2, 9], [11, 19]], "rematchRange": [15, 16, 18, 19], "rematchEarlierLayerBp": 2500,
  "rhythm":       { "maxHeavyRun": 2, "noAdjacentLight": true, "lightPerFloorMin": 1, "floor4NeedsB": true },
  "gold":         { "perSlotBp": 500, "rankBBp": 700, "luckyBellyMult": 2, "maxPerClimb": 2,
                    "slots": [2, 19], "kinds": ["B", "P"], "guaranteeByDoor": 15, "guaranteeFloor": 4 },
  "breathers":    { "window": 1, "windowEarlyWeight": [3, 1], "toy": 2, "toyPerFloorMax": 1,
                    "sleeping": 1, "sleepingMinDoor": 11, "jarMaxPerClimb": 3, "door1": "br_shove_door" },
  "hiddenRoom":   { "perClimbBp": 2000, "doors": [6, 19], "hosts": ["br_jar_mites", "br_window"] },
  "debut":        { "range": [3, 9], "max": 2, "unchosenWeight": 3 },
  "weights":      { "unmet": 3, "notRecentlyPlayed": 2, "recentClimbs": 2 },
  "pool":         { "unchosenReturnAfterSlots": 2, "breathersExempt": true },
  "forks":        { "firstClimb": [12, 17], "later": [7, 12, 17], "choiceWindowS": 8,
                    "rescueRopeS": 45, "offstageDelayS": [5, 20] },
  "walkVote":     { "delayS": 4, "zoneDepthM": 1.5, "doorOpenMaxS": 8 },
  "lookahead": 1, "authoredFirstClimbTwistSeed": "0x4B4E4F54",
  "milestones":   { "A": { "kinds": ["B", "P", "K"], "table": "quick10" },
                    "B": { "kinds": ["B", "P", "F", "H", "S", "R", "K", "W"], "table": "full20" } }
}
```

### 6.8 Replication and messages [MUST-A]

| Message | When | Size | Contents |
|---|---|---|---|
| `ClimbPlanMsg` | Climb start (host → all, reliable) | ≤ 200 B | seed, layer, the 20-char kinds string, the suit rotation (perm, phase), gold slots and sides, debut, hidden and rematch slots, breather subtypes, φ₀ |
| `SlotDoorsMsg` | At lookahead (host → all, reliable) | ≤ 64 B | d, then per door: roomId, letter, suit, prize, skulls, flags (gold, E cap, rematch old time) |
| `ChoiceLog` entry | At each walk-vote and each clear | ≤ 16 B | d, chosen index, fork membership bitmask, clear or fail, clear time. Saved in the Landing checkpoint JSON (Resume). |

### 6.9 Validators (EditMode, fail the build) [MUST-A, extended in MUST-B]

1. `SkeletonTable_Regenerates`: enumeration from `ClimbRules.json` reproduces the committed table hash (4,500 / 5 rows).
2. `Planner_100k`: 100,000 seeds × {1, 2, 4, 8 humans} × five choice policies (first door, second door, random, always-E, never-E). Every plan satisfies:
   - letters match suits;
   - no played room returns (except the Rematch);
   - no suit is played three rule slots running, except when a dry pool forced it (counted);
   - ♥ spacing ≥ 3;
   - gold ≤ 2, with the guarantee met;
   - the debut pair is in 3–9 when one is pending;
   - one Rematch is in 15–19.

   It **reports** the fork→pair, pair→single and forced-suit-repeat rates. The build fails if pair→single or forced repeats exceed 3% of climbs.
3. `Planner_Determinism`: seed + choice log gives an identical plan hash in EditMode and in the Player soak build.
4. `FirstClimb_Authored`: `well_first.json` passes every structural check except the two seeded-only rules.
5. `OddsPage_FromData`: the odds text in §5.3 is generated from `ClimbRules.json` and matches it.

---

## 7. Splitting up and meeting again (the user's "1A, 1B, 1E")

### 7.1 Four ways frogs meet

| # | How | When | Tag |
|---|---|---|---|
| 1 | **Together by default.** The whole party walks every breather, pair, ♥ door, set piece, Rematch, Keeper and Warden (FO §3.1). No room ever runs with only bots in it. | Every door | [MUST-A] |
| 2 | **Forks.** Two doors, a group door and a lettered E door (**SOLO** 1 frog, **DUO** up to 2), and the party may split | Doors 12 and 17 in the first climb; 7, 12 and 17 after that | [MUST-B] (MUST-A plays door 7 as a pair) |
| 3 | **The Meeting Door.** Both fork rooms exit into `meeting_room`. Its door has **two locks** and each half carries one key. There you get a key swap, one item passed through the window, and a rescue rope at 45 s (DEC §4, FO §3.3). | After every fork | [MUST-B] |
| 4 | **Landings.** Everyone together every five doors, with free revives and full spots (FO §3.7) | After 5, 10, 15 | [MUST-A] |

You also **see** the other half while apart: through the meeting room's shadow-glass window, and as Seat Hue pips on both fork lobes of the map (§11.3).

### 7.2 Fork rules [MUST-B]

- **Both doors open at once.** There is no walk-vote at a fork: each frog walks through the door it wants.
- **Caps are physical.** The E door is 1.2 m wide and **closes the moment its cap is reached**. The group door has no cap.
- **The timer.** 8 s after the first human passes either door, the choice ends. Humans still in the niche are drawn into the group door, and bots follow the buddy rule (§7.3).
- **An untaken side goes offstage** (§7.4).
- **Live rooms.** At most 2 rooms are live at once: the group room and the E room (DEC §4). `meeting_room` is a hub with ≤ 20 networked props and does not count.
- **Visibility.** Room props and monsters are visible only to the frogs inside that room. Frogs are visible to everyone (DEC §7 proof of concept; 10 owns).
- **The shadow-glass window.** It is a low-resolution portal (512 × 288, 15 fps) of the other fork room. Static shells exist on every client and frogs replicate to everyone, but the monster and props are not replicated to the waiting half. So the window is frosted: **you see your friends as silhouettes fighting something you cannot see**. 07 owns the room.
- **Rescue rope and "cleared with help".** At 45 s of waiting, a rope drops. The waiting half can tongue-haul the other half's frogs through the window. That room counts as **cleared with help**: its frogs keep the Boon pick and lose only the hidden-clear bonus (FO §3.3).
- **Vengeance** carries into the meeting room (DEC §8.2 #6).

### 7.3 Bots at forks: the buddy rule [MUST-B]

- **Buddies.** At climb start each bot gets a buddy human, round-robin by seat order. In solo, every bot's buddy is you.
- **Following.** At a fork a bot follows its buddy through the group door. **Bots never join a human in an E door**, because E doors are a human's moment of glory and never cost a Team Life (FO §3.7).
  - The one exception: a bot **Knotted** to a human follows them into a DUO door, because Duo Boons are the point of the Knot.
- **Orphans.** A bot whose buddy went E follows any human on the group side. If no human is on the group side, it goes offstage with the group side.
- **Rule of thumb.** Bots never enter a door without a human (FO §3.3), unless they are going offstage.

### 7.4 Offstage Rivals: the solo fix [MUST-B] (DEC §8.2 #11)

| Step | Rule |
|---|---|
| Trigger | A fork side that no human enters within the 8 s |
| Who | For an E side, the Drama Director picks 1 Rival (SOLO) or 2 (DUO). For a group side, every bot not already with a human goes. They **walk in visibly**, with one bark (03 owns the lines), and the door shuts. |
| Parked | Their NetworkObjects are hidden from every client, and their AI and physics are switched off. **Nothing is simulated** (no Ghost Sim, DEC §8.3). |
| Return | They appear at the meeting room's far door, holding the second key, at **the humans' clear time + 5–20 s** (`5 + offstage.NextInt(16)` s), with one reunion bark. If the humans' room failed, the same timer runs from the failure. |
| The window | While offstage Rivals are the other half, the window plays one of three canned vignettes: Kestrel's face squashed against the glass; a Rival sprinting past chased by a shadow; a silhouette holding up a key. |
| Consequence | Offstage Rivals always arrive after the humans, so the rescue rope never fires for them. Their Glow and rewards are 04's (they bank as if the room cleared). |
| No Rivals at all | With 8 humans there are no bots. If a side is untaken, **the Tower carries its key**: it drops down a chute into the meeting room on the same 5–20 s timer. |

### 7.5 Worked cases at fork 12

| Lobby | Choice | Who is where | Meeting |
|---|---|---|---|
| **Solo** (1 human + 7 Rivals) | Human takes **12B** (group) | Human + 6 Rivals in 12B. 1 Rival volunteers offstage into 12E. | Human's half waits 5–20 s (Jar Tag, window vignette); the volunteer bursts in with key 2 |
| **Solo** | Human takes **12E** (SOLO) | Human alone in 12E. All 7 Rivals go offstage into 12B. | The whole gang arrives 5–20 s after the human clears. The user's solo 1A/1E meeting, in every first climb. |
| 2 friends + 6 Rivals | Both take 12B | 2 humans + 5 Rivals in 12B; 1 Rival offstage in 12E | As solo |
| 2 friends + 6 Rivals | Ana takes 12E (SOLO), Bo takes 12B | Ana alone; Bo + 6 Rivals (Ana's buddies follow Bo) | Two live rooms. Whoever finishes first waits; rope at 45 s. |
| 2 friends + 6 Rivals | Both take 12E (DUO) | The duo in 12E; 6 Rivals offstage in 12B | Rivals arrive 5–20 s after the duo |
| 4 friends + 4 Rivals | 3 group, 1 E | 3 humans + 4 Rivals group; 1 human E | Two live rooms, rope at 45 s |
| 8 humans | Nobody takes E | 8 humans in the group room | The Tower drops key 2 down the chute 5–20 s after the clear |

### 7.6 Leaving and joining [MUST-A leaving · SHOULD drop-in]

- **Leaving.** A human who leaves hands their seat to a bot at once (FO §3.6). The bot takes over their door and their side of a fork.
- **Drop-in** [SHOULD] (DEC §7 SHOULD #4). A new human takes a bot's seat **in front of the next niche**, at the party's lowest human Glow Level with that many Boons granted (FO §4.1). They never appear mid-room.

---

## 8. Keepers and Wardens: the layer bosses

"Crown" is a retired word for bosses (DEC §10 #11); the Lv10 halo keeps the name Crown glow. Every layer has a **Keeper** at its door 10 (global 10, 30, 50, 70: the halfway mini-boss, then the save Landing) and a **Warden** at its door 20 (global 20, 40, 60, 80: the boss, then the reveal). **Party Rank Up** plays at both (FO §4.1).

**The Warden grammar** is the same in every layer, so each finale *pays off* the layer:
- **P1** replays earlier monsters at their old numbers, which you now flatten (FO §3.2).
- **P2** is a co-op phase built on the layer's social rule.
- **P3** is the Trust Fall, recast in the layer's verb.

| Layer | Keeper | Warden | Where it stands | Foreshadowing | P3 Trust Fall | Tag |
|---|---|---|---|---|---|---|
| **Well** | `keeper_bell_raft` (door 10): the door-2 golem on a tipping raft, built only from lessons everyone was taught (DEC §6) | **The Jar** (door 20): a house-sized firefly jar lowered onto the brightest frog | Keeper: a grid cell (a raft cavern). Warden: **the bucket**, in the real shaft (§3.5) | The Jar hangs in the Mouth from 0:00; the bell golem is door 2 | Tongue-catch a falling friend (05) | [MUST-A] Keeper · [MUST-B] Warden |
| **Sky** | Door 30, built from the Sky's floor-1–2 monsters with `PhaseSequencer` | **The thunderhead heron** (door 40): a heron made of storm cloud; its shadow is the lightning's tell | The dome's rim at 2,600 m, +480 m | `heron_shadow` (Well 3A). [SHOULD] At Landing 3 a heron silhouette crosses the Mouth once, 1.5 s. | Glide-catch a friend falling through cloud | [LATER] |
| **Space** | Door 50, from Space's floor-1–2 monsters | **Chan Chu** (door 60): the three-legged moon toad with a coin in its mouth, and the coin is a Wish Coin | The moon dock at 4 R | Wish Coins rain through the Mouth all climb (FO §6.2) | Tongue-tow a drifting friend in zero-g | [LATER] |
| **Beyond** | Door 70, from the Beyond's floor-1–2 monsters | **The Watcher** (door 80): an enormous eye in the halo. At ★4 you pull back and it is the eye of a giant frog looking down its well. | The halo ring at 220 Mly | The lantern frogs (Law 2) | Catch a light-lagged friend: aim where they *will* be | [LATER] |

---

## 9. Scale reveals, shot by shot

### 9.1 Rules for every reveal

1. **Steerable, always.** The corrected presence study found that **agency raised spatial presence more than camera perspective did** (immersion_attraction_psychology fact-check #13; FO §6.3). So every scripted camera lets the player steer at least its yaw, with a spring back to the path, and free look opens the moment the composition allows. Frogs keep their bodies whenever they are on screen.
2. **Every reveal opens a verb** (Law 5).
3. **Honest geometry.** Each reveal shows something that was really there all along: the Mouth's clouds are the vista's clouds, the lanterns stood where they shone, and your lit trail is your actual climb.
4. **The feel target** (DEC §5): about every 90 s the player got stronger, laughed, *or saw something bigger*. The scale beats below carry the third.

### 9.2 Scale beats in the first climb

| Clock (DEC §5) | Beat | How the player steers | Opens | Tag |
|---|---|---|---|---|
| 0:00 | **Title = the well bottom.** Low angle across black water up to the Mouth 180 m up; the windlass, rope and Jar inside the disc of sky; eight eggs bob. | Mouse or stick parallax ±4° before any key | — | [MUST-A] |
| 0:20 | **First grapple** (Tongue II): the first pull toward a pad; the camera lifts 10° to frame the strands stepping up | Full control | Grapple | [MUST-A] |
| 0:35 | **Door 1**: a 6 m door stamped **1**; two frogs shove it | Full control | Doors | [MUST-A] |
| 3:40 | **The window** (§9.3) | Free look plus a push-in | — | [MUST-A] |
| 4:45 | **Landing 1**: the Mouth glance, 37° (§9.4); the lit trail below | Cancelable tilt | — | [MUST-A] |
| 10:25 | **Keeper pull-back** (§9.5) up the shaft, the Mouth to 104° | Player-driven speed and look | Choice screens, then the post-Keeper systems (DEC §5) | [MUST-A] |
| 16:30 | **Landing 3**: 56°, blue hour, the first stars. [SHOULD] A heron silhouette crosses the Mouth. | Cancelable tilt | Knot, Cut, Duos | [MUST-B] |
| 19:30 | **The bucket**: 74°, night, the 12 lanterns overhead | Full control | — | [MUST-B] |
| 22:30 | **★1 Out of the Well** (§9.6) | Frogs keep control; camera yaw steer; free look from 21 s | **Glide** | [MUST-B] |
| ~23:00 | **The Rim** (§9.7): walk out, look down your own well, glide down the hill | Full control | The Sky (door 21) | [MUST-B] |

### 9.3 The window [MUST-A]

`br_window` is door 4 in the first climb; in seeded climbs it can be any breather slot (§6.4). It is built into the niche's side room (§3.4).

- **The room.** A sloped 5 × 3 m cave in the strand, one warm lamp, and a jar on a ledge (the breather pays).
- **The crack.** 1.2 m wide and 3.0 m tall, facing the well's axis.
- **The camera.** When a frog is within 1.5 m of the crack, the camera eases over 1.0 s to 1.2 m behind the frog's head. FOV goes 60° → 75°, the pitch range opens to −60°…+80°, and the view holds where the player leaves it. Stepping 3 m back restores the normal camera in 0.6 s.
- **What door 4 shows** (y 18 in strand 2):
  - across the shaft, strands 3–5 rising with their dark slits (the doors to come);
  - the warm Landing decks above;
  - 400 wall lanterns spiralling up the far wall;
  - 20 m below, black water and the glow of the eggs;
  - above, the Mouth (34.6° from here *(computed)*), crossed by the windlass, with the Jar hanging in it.
- **Audio.** Croaking into the crack returns the 0.47 s slap-back from the far wall: the loudest echo in the game. A Rival mutters that it is big (03 owns the line).
- **No System window.** The moment stays clean. Budget: 15–30 s.
- **Law 3 leaks in later layers** [LATER]: the Sky's window shows a torn corner of the dome with real stars; Space's is a porthole with the galaxy's arm curling; the Beyond's shows moss-green veins behind glass.

### 9.4 The Landing glance [MUST-A]

- **The tilt.** On the **first arrival at each Landing in a climb**, as the frog climbs out of the hatch, the camera tilts to +65° over 0.6 s, holds 0.6 s, and returns over 0.5 s. Any look input over 2° cancels it and hands over control (source: WORLD §4.5).
- **Pitch range.** On Landings the camera may pitch from −55° to +80° (02 owns the rest of the camera).
- **The System names it, first time per profile per stop only:** `[ THE MOUTH ] 37°. It was 31° at the bottom.` Then 44° ("It was 37°."), 56°, 74°. The numbers are the true computed angles of §3.3, because the System never lies.
- **The lit trail** of cleared doors is visible below (§3.4).
- **Light pillar and water reflection** [SHOULD] (DEC §7 SHOULD #5):
  - The pillar is an additive tapered cylinder in the Mouth's current sky colour, from the lip (r 51) to the water (r 45), at opacity 0.04 + 0.4 × the Mouth's share of the sky: 0.055 at the Foot, 0.124 at the bucket (source: WORLD §4.5).
  - The water shader reflects the Mouth by intersecting the reflected view ray with the lip disc, so there is no planar-reflection pass.

### 9.5 The Keeper pull-back [MUST-A]

It is step 4 of the Keeper Landing ceremony (DEC §5; 07 owns the order): after Tower Rank F → E, before the free hat. It runs in the real shaft with no shells (plan_2).

| t (s) | Camera | The player | Picture | Audio |
|---|---|---|---|---|
| 0.0–0.6 | Eases from third person to a crane 3 m behind and 2 m above the player's frog on the Keeper Landing; pitch +30° | Look is live | — | Waltz −6 dB |
| 0.6–5.6 (nominal) | Rises along a Cinemachine spline from the Keeper Landing (y 62), curving in to the axis and up to **y 140** | **Steer:** free yaw 360°, pitch −30°…+89°. **Hold forward to rise ×1.6; hold back for ×0.6** (the rise clamps to 3.5–8.0 s). After the first time, hold Tongue 1 s to skip. | Past Landing 3's dark deck (the next stop), the bucket's underside, **the Jar close up** (9 m of glass, fireflies swirling inside), the rope and the windlass drum overhead. Below: your **lit trail** of ten doors down strands 2 and 3, the Foot, the eggs. **The Mouth grows to 104°** *(computed)*. The lanterns stay anonymous points. | Wind rises; the lowpass opens 800 Hz → 8 kHz; the croak tail lengthens |
| At the top | Soft stop at y 140: the camera eases to zero over 0.8 s, and more forward input gives a gentle bounce ("not yet") | Look is live | `[ THE MOUTH ] 44°. Ten more doors.` | One music-box note (motif note 1) |
| +0.0–1.4 | **The one scripted move:** a Wish Coin drops through the Mouth, glinting in dusk light, and the camera follows it down (ease-in, 1.4 s) to the stall | Yaw ±30°, spring 1.0 s | The coin lands on the stall; **the free hat appears** (07) | Coin chime at rising pitch |

- **Client-local.** Each player steers their own camera, so nothing is synced. The host waits for every human's pull-back to end, or at most 9 s.
- **Other frogs** stay visible on the Landing below, tiny, with their Seat Hue rims.

### 9.6 ★1 Out of the Well [MUST-B]

**Pre-roll** (not counted):
- When the Jar's P3 is cleared, the Jar is winched up and out through the Mouth (05 owns how the fight ends).
- The rope comes back down with **a big knot** at its end, swinging over the bucket. The only prompt is `[ TONGUE THE KNOT ]`.
- The first frog to tongue the knot starts ★1 (the host decides, with lag compensation per FO §5.4) and is framed first in the group shot. If nobody does within 6 s, the knot hooks the handle by itself.
- The host sends `RevealStartClientRpc(layer 1, t0 = ServerTime + 0.5 s)`.

**First view: 26.0 s** (WORLD §10.2's choreography, re-homed; the cut GDD ending variants are gone: one ending, one reveal, FO §7).

| t (s) | Camera | Steer | Picture | Technique | Audio |
|---|---|---|---|---|---|
| 0.0–5.0 | Group shot in the rising bucket; FOV 60 → 70; pitch +20° → +75° | **Frogs keep full control** (hop, croak, emote; the staves keep everyone in). Camera yaw ±30°, spring 1.5 s. | The windlass turns and **the bucket rises 120 → 170 m at 10 m/s**. The Mouth grows 74° → 152°. The anonymous stars resolve into lantern points. Wish Coins spill over the rim. | Real Well geometry; the bucket is host-kinematic with a NetworkTransform | Warden music ducks to wind; lowpass 12 kHz → 400 Hz |
| 5.0–6.2 | Pitch +75° → +88° | None (1.2 s) | Exposure 1 → 4. The **whiteout** ramps α 0 → 1 over 5.2–5.8 s, holds to 6.0, and fades to 0 by 6.4 (ramp ≥ 600 ms, α = 1 for ≥ 3 frames; never a flash). `[ TUTORIAL COMPLETE ]` types at 5.3 s (the TTITH joke). | **Swap at 6.0 s** (bucket at y 177, the Mouth at 175°): the bucket eases to a stop with its floor level with the lip (y 180) by 6.4 s, its staves 1 m from the stone; the well interior switches to its far LOD (the 512² capture of *your* lit well, taken during Warden P3); FarCam and `Vista_Sky` switch on; lantern-frog bodies switch on | 6.0–6.2 **total silence** (200 ms); at 6.2 one music-box note |
| 6.2–9.0 | Head height on the Rim, a 60° pan, FOV 70 | Yaw ±30° | Pre-dawn blue `#2B3A67`. **The brightest stars were lanterns**: 12 frogs stand on the Rim holding them on poles over your well, and two lean on the windlass crank. At 6.6 s every lantern warms from `#FFF4E0` to its own flame colour over 0.4 s. Fog 0.03 keeps the world 30 m wide. The party hops the 1 m gap from the bucket onto the Rim. | [SHOULD] Share-card group shot at 7.0 s, rendered from the canonical (unsteered) camera | One chime per lantern, quantised to 1/8 notes at 96 BPM |
| 9.0–12.5 | **Dolly-zoom** 4 → 14.4 m while FOV goes 70° → 22°; d·tan(FOV/2) stays 2.80 *(computed: 2.801 → 2.799)* | Yaw ±10° (so the effect holds) | The party stays the same size while the mist peels (fog 0.03 → 0.6/d). Behind them rises **a hill of 63 other well mouths**, a few faintly lit. You were never the only well. | One instanced draw: i = 1…63 at r = 72·√(i + 0.5) m, θ = i·137.508°, with yours at i = 0 (r 51 m). Min spacing 111 m, hill r 574 m (source: WORLD §10.2). | Reverb crossfade 1.0 → 3.0 s |
| 12.5–18.0 | **Crane + exponential pull**: d = 14.4·1000^S(u) m, S = smoothstep over 5.5 s (exactly 3 decades); pitch 15° → 88°, FOV 22° | Yaw ±45°, spring 1.5 s | At 16.3 s the hill fills the frame *(computed: d ≈ 2.96 km, view 1.15 km)*, and a tilt-shift pulse (15.6–17.1 s) reads it as a miniature. By 18.0 s the island rings (900 / 1,400 / 2,000 m) and the dome's rim (2,600 m, +480 m) form a **mandala at 96% fill from 14.4 km** (source: WORLD). Each island is about 7 px. | NearCam + FarCam (§10.3); island LOD full ≤ 400 m, simplified ≤ 3 km, billboards beyond, swapped inside haze; fog 0.6/d (30% haze at the end); dome R 30 km | Lowpass to 4 kHz |
| 18.0–20.0 | Top-down hold | Yaw ±20° | **The map match cut** (§11.6): each Sky floor node appears on its island and flies to the map; the Sky band inks in; the Well shrinks into the centre | UI Toolkit overlay + PrimeTween | — |
| 20.0–23.5 | Pitch 88° → 5°, FOV 22° → 60° | **Free look ±60° from 21.0 s**, springing back on release | **The sun crests at 21.0 s.** A parallax cloud sea, 40 flocking birds, and at the zenith **a small tear in the painted dome, full of the stars of Space** (Law 3) | An HDR sun disc + 6 additive light-shaft cones (no volumetrics, UT) | 20.0–20.6 wind only (the breath); **20.6 the motif, half speed, up a fifth (C)**; lowpass fully open. Croaks are ducked −12 dB from 20.0 to 23.5 s. |
| 23.5–26.0 | Slow push toward the Rim | Free look | `[ WELCOME, FROG ] That was the tutorial.` (1.1 s), then the carved card **LAYER 2 · THE SKY · 하늘** and **"Your sky was a hole."** A cloud puff wipes to the party standing on **the Rim**. | CJK glyph subset (§10.8) | Landing waltz in C |

- **Repeat cut: 8 s.** Lift 1.5 · whiteout 1.0 · lanterns 1.5 · pull 2.5 · match cut 1.0 · title 0.5 (source: WORLD). The first view is never skippable; a repeat can be skipped by holding Tongue for 1 s.
- **Controls during ★1.** Move, Hop, Croak and emotes work; Tongue (except on the knot), Shove and Power are off, so nobody can be pushed around during the moment.
- **Reduced motion** [MUST-B]. Four cross-dissolved stills of 2.5 s each, then the title. There is no dolly-zoom and no tilt-shift, rotation is capped at 60°/s, and the whiteout becomes a cream crossfade (`#F4EDE3` at 85%).
- **Sync.** Every client starts at `t0 + 0.5 s` on NGO server time, so a voice call sees the same frame. Steering offsets are client-local. A client that joins or reconnects during ★1 plays the repeat cut from the current t.
- **Hero fallback.** The string key `reveal.star1.welcome` has a Wick variant ("WELCOME, CLIMBER"), and "tongue the knot" maps to the wax-thread lasso (DEC §2).

### 9.7 The Rim [MUST-B]

`rim_surface`'s interactions are 07's; this is the place.
- **The walk.** A walkable stone ring on the lip from r 51 to 60 m at y 180 (Well frame), with moss, the windlass posts, the bucket hanging level with the lip a 1 m hop from the stone, and the 12 lantern frogs. The frogs are silent and turn their heads to follow the party.
- **Glide is on** (DEC §8.2 #15).
  - Beyond the ring the hill slopes down at 12° to r ≈ 600 m among the other 63 well mouths.
  - Hopping into another well, or dropping below the cloud sea at y 120, means the updraft returns you to the Rim in 1.5 s at no cost.
  - A fog wall stands at r 650 m.
- **Look back down.** Look down into your own well and it is still lit: the Landings' lanterns, the lit trail, the water. **The frog finally looks down at where it was.**
- **Look up.** The zenith tear (1°) shows Space's stars. The first island ring floats at 900 m across a cloud gap: the Sky's next floors, visible and unreachable.
- **Sound.** Croaks are **dry**: no echo, only wind (FO §6.2).
  - [SHOULD] The First Shout: the first croak within 30 s of arriving gets no echo; 6.0 s later thunder rolls back from a cloudbank 1.03 km out *(computed: 2.06 km ÷ 343 m/s)*, and lightning outlines the 900 m island ring.
- **Door 21.** A door stamped **21** stands on the Rim beside the windlass.
  - In the slice it is chained: `[ DOOR 21 ] The Sky opens in a free update.` That is true: layers ship as free named updates (FO §8.1).
  - With the Sky Preview [SHOULD], it opens.
- **Results.** The ceremony plays here (04/07), then **Climb again / Rest** with equal weight. The first surfacing pays +50 Pearls (DEC §8.2 #17).

### 9.8 Sky Preview [SHOULD]

- **Where.** Doors 21–25 under Glide. The Sky's floor 1 is the hill itself: **its door niches are cut into the lips of the five nearest neighbouring wells** (111–163 m from yours *(computed)*). *Your sky is somebody's floor* (DEC §1), played.
- **Rooms.** `bell_golem`, `heron_shadow` and `lily_raft` re-dressed in the Sky palette with open roofs, on new grid cells, plus a `br_window` onto Space.
- **Validator.** Every re-dressed room re-passes its rank-lane validator **with Glide on**, because Glide adds up to 9 m of reach (1.5 s × 6 m/s). Gaps are re-authored in the Sky variants, never in the Well originals.
- **The end.** A chained rope bridge toward the 900 m island ring: `[ DOOR 26 ] The Sky opens in a free update.`

### 9.9 LATER reveals: ★2, ★3, ★4 and Cycle 2

Adapted from WORLD §10.3–10.5. The cut systems (Ledger, Knives, Everflame, Burnt-Out wisps) are replaced by what the climb actually logged.

**★2 The Painted Sky** (after the thunderhead heron, door 40; first view 24 s, repeat 8 s)

| t (s) | Shot |
|---|---|
| 0–3 | The beaten heron's storm lifts the party. Near the zenith the sky resolves into **brushstrokes**, and the 40° tear widens. At 2.4 s the party punches through (a paper-tear shader); the handoff to the Space shell hides under the tear's glow. Silence 2.4–2.6 s. |
| 3–6 | The camera turns 180°. From outside, the dome is a pale canvas hemisphere (R 30 km) with brushstrokes on its back, and the lantern frogs sit on it: **the painted stars were pinholes with lanterns behind them.** |
| 6–13 | Exponential pull 50 m → 6,000 km (5.08 decades in 7 s). The canvas shrinks to a white fleck on the day side of a small planet, and the flat-to-round swap hides behind it. At 6,000 km the planet spans 11.5° (source: WORLD). |
| 13–19 | A slow 30° orbit, free look ±60°: the terminator, and a magenta nebula smear on one horizon. Motif at half speed in G. |
| 19–24 | `[ WELCOME, FROG ] That was also the tutorial.` · **LAYER 3 · SPACE · 우주** · "Your sky was a ceiling." Opens: **Drift** and the **Moon Toad helmet**. |

**★3 The Speck and the Drop** (after Chan Chu, door 60; first view 30 s, repeat 9 s)

| t (s) | Shot |
|---|---|
| 0–2.5 | Chan Chu spits out its coin and the party rides it round the moon. The periapsis bloom hides the handoff to the system shell. |
| 2.5–7 | Pull back: **the night side lights up with your climb**, one city light per door cleared, catch made and Awakening earned this climb (read from the climb's event log), laid along the spiral of your decks. At 6.5 s the planet drops under 48 px and becomes a point. |
| 7–15 | Pull to 120,000 ly. The sun is one of 150,000 points in a two-arm spiral, r = 3,000·e^(0.22θ) ly, out to a 50,000 ly rim. **Your point keeps your party's Seat Hues.** (source: WORLD) |
| 15–21 | A face-on hold. **The Drop:** a refraction sphere forms around the galaxy, stretches into a teardrop and falls along a filament. At 19.8 s you hear the Well's water drip. The glow at 20 s hides the handoff to the web shell. |
| 21–26 | Pull 120,000 ly → 300 Mly. The galaxy is one bright knot on a filament; 200,000 points; 40 moss-green glints. |
| 26–30 | `[ WELCOME, FROG ] That was ███ tutorial.` · **LAYER 4 · THE BEYOND · 너머** · "Your world was a speck." Motif at half speed in D. Opens: **light-rails**. |

**★4 The Revelation** (after the Watcher, door 80; first view 75 s once per cycle, repeat 20 s)

| t (s) | Shot |
|---|---|
| 0–6 | The party on the halo. This climb's Knots (gold threads) and Cuts (crimson snaps) run among the filaments. The Watcher's eye closes. |
| 6–20 | The pull outward through the web; filaments thicken and soften into glow. |
| 20–24 | The match plane: a camera-facing slice of `vein(p) = voronoiEdge3D(p·f, MOSS_SEED)` drawn as filament glow `#DCE3F0`. **A 0.4 s blink at 23.6 s, the only blink in the game,** hides the swap. |
| 24–32 | The same slice drawn as moss: silver → Well moss `#557D33` over 1.5 s, a wet sheen, a drip and its ripple. Same seed, same scale, so **the veins are pixel-identical** and players can screenshot the match. |
| 32–46 | The pull continues outward. The moss is on one stone of a well wall. The camera rises up that well: your first well's brick courses and moss, colossal, holding no strands. |
| 46–58 | The rim. Lantern-holding silhouettes lean over the lip, and **the nearest is a frog, like you**, enormous. Its eye is the Watcher you just faced. It looks down into its well the way you looked up at the Mouth. |
| 58–66 | `[ 井底之蛙 ] Every sky is someone's well.`, then `[ TUTORIAL COMPLETE ] The game begins now.` The motif at its original tempo in F, orchestrated for the whole kit, ending on a music box. |
| 66–75 | The map: the whole disc shrinks into the centre and a new outer band inks in, **CYCLE 2 · THE WELL ABOVE**. Then the results. |

**Cycle 2** [LATER]
- Doors 81–160, inside the bigger well.
- Each layer keeps its own verb and adds the next layer's social rule.
- The Foot's statue plinth is empty: `[ INSCRIPTION ] 井底之蛙. The frog has gone up.`
- The lantern frogs become the Watchers audience layer (RR rank 8; capped, LATER per DEC §7).

---

## 10. Faking scale in Unity URP

**The constraint** (UT): URP has no camera-relative rendering; that is documented only for HDRP. So:
- build each layer near the origin;
- sell scale with nested skyboxes, shell meshes, fog gradients and slow pull-backs;
- use a floating origin only where something really travels far.

This section is that advice made specific.

### 10.1 The toolbox

| Technique | Where it is used | Tag |
|---|---|---|
| **Nested skyboxes**: each layer's sky is a bake of the next layer | The Mouth (§10.2); the Sky dome's tear shows the Space cubemap; Space's sky is a galaxy cubemap | [MUST-A] Mouth · [LATER] rest |
| **Camera stacking**: a near and a far camera, same pose, depth cleared between them | ★1 and the Rim (§10.3) | [MUST-B] |
| **Scaled shells** with double-precision camera maths | ★2–★4 (§10.4) | [LATER] |
| **Fog gradients** driven per shot | Well mist; the ★1 pull (0.6/d); the Sky haze | [MUST-A] mist · [MUST-B] pull |
| **Impostors and LOD** | Your well's far LOD (a capture of *your* lit well); the 63 wells; islands | [MUST-B] |
| **Real geometry at true positions** | Lanterns, the Jar, the windlass, the lit trail, the strands seen from the window | [MUST-A] |
| **A camera-only floating origin** | Never needed for networked play (§10.5) | [LATER] shells only |
| **Masks** at every swap | Whiteout, fog wall, paper tear, periapsis glow, blink, or an outgoing shell under 48 px | [MUST-B] |
| **Sound as scale** | Echo in the well, dry air on the Rim, a lowpass sweep, reverb growth, 200 ms of silence at each swap | [MUST-A] echo · [MUST-B] rest |

### 10.2 The Mouth: nested skyboxes, honestly [MUST-A]

- **The sky card.** The Mouth is a disc mesh at the lip (y 180, R 51 m). Its material samples a **cubemap along the view ray**, so it has real parallax as you move. It never uses a flat texture.
- **The bakes.** An editor command, `BakeMouthSkies`, renders `Vista_Sky` from (0, 200, 0) into **six cubemaps** (1024² per face, BC6H): afternoon, late afternoon, dusk, blue hour, night and pre-dawn, one per stop plus ★1. **The clouds in the Mouth are therefore the vista's real clouds**, and ★1 matches the disc you stared at all climb.
  - The MUST-A build ships with a placeholder `Vista_Sky` (dome, sun, cloud sea) until the full vista lands in B.
- **Real things in the Mouth.** On top of the card sit the windlass drum and rope, the Jar, and the 12 lanterns: real geometry that occludes the card.
- **Stars.** At blue hour and night, stars are baked into the cubemaps; the lanterns stay separate, brighter points.
- **Where the sky shows.** Rooms show no sky: rule rooms are dark cells (FO §2.2).

### 10.3 ★1: two cameras [MUST-B]

| Camera | URP role | Near / far | Culling | Notes |
|---|---|---|---|---|
| **FarCam** | Base | 50 m / 40,000 m | Layers `Vista`, `Sky` | Enabled only from the ★1 swap and on the Rim; no shadows; no post-processing |
| **NearCam** | Overlay, **Clear Depth** on | max(0.05, 0.01·d_focus) m / 2,000 m | Layers `World`, `Frogs`, `FX` | Driven by the CinemachineBrain; post-processing on this last camera only |

- **One pose.** FarCam is a child of NearCam with an identity local transform, so the pose is always shared and there is no sync code.
- **Precision.** Both cameras keep far/near ≤ 40,000, which a 24-bit reversed-Z depth buffer handles cleanly.
- **Why no scaling.** The Well, the Rim and the Sky vista share one frame (§10.5). The largest coordinate is the dome at 30 km, where float32 spacing is about 2 mm, invisible at that distance *(computed: 2¹⁴ ≤ 30,000 < 2¹⁵, so ulp = 2⁻⁹ m)*.
- **Per-camera fog.** The toon shader reads the global `_KWFog` (density, colour, height band). The reveal director sets it per camera in `RenderPipelineManager.beginCameraRendering`, so the pull's 0.6/d haze applies to the vista, never to the party in the foreground.

### 10.4 Scaled shells for the later reveals [LATER]

- **The rig.** `ShellRig` holds the camera position as a `double3` in the layer frame. Each shell *i* is its own additive scene authored in shell units within ±10⁵ of its origin, with a scale sᵢ:

  | Shell | Unit | sᵢ |
  |---|---|---|
  | Sky | metres | 1 |
  | Planet | kilometres | 10⁻³ |
  | System | 10⁶ km | 10⁻⁹ |
  | Galaxy | light-years | ≈ 1.06·10⁻¹⁶ |
  | Web | Mly | ≈ 1.06·10⁻²² |

- **The camera maths.** Every frame, each shell camera's position = (camPos − anchorᵢ)·sᵢ, computed in double and cast to float. Rotation and FOV are shared.
- **Stacking.** The outermost live shell renders as the Base camera and the inner shells as Overlays with Clear Depth. **At most 2 shells are live at once.**
- **Swaps.** A swap happens only under a mask, or when the outgoing shell is an impostor under 48 px (WORLD §10.1).
- **Frozen positions.** Galaxy and web points are sampled on a worker thread during the previous climb and baked into one static mesh each (150,000 and 200,000 points), with a quarter of the points on Low.

### 10.5 The floating-origin rule [MUST-A]

- **Networked gameplay never leaves a 4 km cube around its layer origin.** Float32 spacing there is ≤ 0.5 mm *(computed: 4,000 m < 2¹², so ulp ≤ 2⁻¹² m)*.
- **Anything bigger is non-networked scenery**, drawn by camera stacking (§10.3) or the ShellRig (§10.4). Their camera maths is double-precision and camera-relative: **a floating origin for the camera only.**
- **Why not a real floating origin.** NGO replicates transforms in world space, and runtime parenting of a NetworkObject under a non-networked root is restricted. A client-local origin shift would fight replication. Confirm this in the M0 proof of concept (10 owns).
- **It holds in every layer:**
  - **Well:** everything is within ±1.2 km, the room grid included.
  - **Sky:** the islands are within 2.6 km of the centre.
  - **Space:** each station deck is its own local frame; floors are joined by scripted pod transfers (10 s, camera on rails), never by flying across real distances.
  - **Beyond:** decks the same, joined by filament glides.

### 10.6 Atmosphere, light and post

- **Height mist in the well:** from y −2 to +8 m, `#232B3A`, computed in the toon shader.
- **Light shafts:** additive cone meshes. UT found no verified URP volumetric fog.
- **Tilt-shift** (★1 only): a Render Graph full-screen pass created at boot and toggled with `enabled`, so nothing compiles mid-reveal.
- **Depth of field** (★1 only): a URP Volume on NearCam.
- **Exposure** runs 1 → 4 through the whiteout on a Volume weight blend.
- **Colour grading:** one LUT per layer plus a reveal LUT. The layer LUT crossfades over the last 3 s of a reveal (WORLD §9.2).

### 10.7 LOD and impostors [MUST-B]

- **Your well from above.** A 512² top-down capture of the lit shaft (Landings, lit trail, fireflies), taken by a one-shot camera **during Warden P3**, never at the exit, to avoid a hitch (WORLD §10.1). It becomes the well interior's far LOD, so from 14 km up you still see *your* climb glowing.
- **The 63 other wells:** one instanced mesh (lip ring, dark disc); 30% of them get a faint glow chosen by `vistaSeed`.
- **Islands:** full detail ≤ 400 m, simplified ≤ 3 km, billboards beyond. Swaps happen inside haze.
- **The cloud sea:** one displaced mesh plus ≤ 60 billboards, with ≤ 4 transparent layers per pixel.

### 10.8 No hitches, no missing glyphs [MUST-B]

- **Pre-loading.** `Vista_Sky` loads additively during Warden P1 with its renderers disabled. It holds no NetworkObjects and loads locally on each client; 10 confirms NGO's client scene-sync mode.
- **Pre-warming.** Shader variants for the vista and reveal passes warm up at the same time (`ShaderVariantCollection.WarmUp`, or a `GraphicsStateCollection` in Unity 6).
- **Tested.** A PlayMode test records the shader-compile profiler marker and requires **zero compiles and zero GC allocations** in the reveal director from t = 0 to 26 s. PrimeTween is allocation-free (UT).
- **Glyphs.** The ★ cards and the statue need Hangul and Hanja in every language. MUST-B ships a static TextMeshPro font asset with exactly the glyphs of 우물 안 개구리, 하늘, 우주, 너머 and 井底之蛙 (18 glyphs). The full Korean set belongs to the SHOULD localisation (DEC §7).

### 10.9 Budgets (dev PC, 1080p; greybox hypotheses under DEC §12's gate)

| Scene | Frame time | Other |
|---|---|---|
| Shaft, Landings, rooms | median ≤ 16.6 ms; host simulation ≤ 8 ms (DEC §12) | 400 wall lanterns + 12 lanterns in 2 instanced draws |
| ★1 | median ≤ 16.6 ms, **p95 ≤ 20 ms** | ≤ 2 cameras; FarCam casts no shadows; the GPU Resident Drawer serves the static vista |
| Keeper pull-back | median ≤ 16.6 ms | Real shaft only |

### 10.10 Reveals are data [MUST-A pull-back · MUST-B ★1]

- **The files.** `Data/World/Reveals/keeper_pullback.json` and `star1.json` are arrays of shots. Each shot holds: `t0`, `t1`, `camPath` (a spline id or a formula id such as `expPull`), `fov`, `pitch`, `yawSteerDeg`, `springS`, `speedSteer` (min–max), `fog`, `exposure`, `post {tiltShift, dof}`, `mask`, `audio[]` and `ui[]` cues.
- **The player.** `RevealDirector` (client-side) plays a file from server time t0.
- **Validators:**
  - every shell or scene swap sits inside a mask with α = 1 for ≥ 3 frames;
  - the first view lasts 26.0 s and the repeat 8.0 s;
  - free look opens at 21.0 s;
  - every whiteout ramps for ≥ 600 ms.

---

## 11. The map

DEC §8.2 #13: a UI Toolkit panel on the hub wall, in pause, and under the results door counter. It is called **"the map"**, a plain word. It has no binding, so the controls stay at 8. It puts the user's "layers from center to outwards circle" on screen at 0:00.

### 11.1 Where it appears

| Place | Size | What it shows | Tag |
|---|---|---|---|
| **The hub wall** (the Foot) | 1024² RenderTexture on the wall mesh; walk up and Tongue (Interact) to zoom | Every layer as rings; your best door; friends' pins | [MUST-A] |
| **Pause** (Esc → Map) | 960 × 960 px | The current climb live: path, fork lobes, party pips | [MUST-A] |
| **Results** | 480 px under the door counter | The path drawing itself up to where you stopped | [MUST-A] |
| **★1 match cut** | Full-screen overlay at 60% | The Sky band inking in | [MUST-B] |

- **The build.** One custom `VisualElement` draws everything in `generateVisualContent` with `Painter2D` (arcs, lines, fills). Plain text, diffable.
- **Hub wall input.** `PanelSettings.targetTexture` puts the panel on the wall, and a raycast feeds `SetScreenToPanelSpaceFunction`.

### 11.2 Geometry

- **The canvas.** Logical 1000 × 1000 units, centre (500, 500), outer radius 460. The layout depends on the **current layer c**.
- **Rings:**

| Ring | Radius (units) | Contents |
|---|---|---|
| Centre | 0–80 | Layers older than *c*, nested (each takes half of the radius left). Before any surfacing: the hatch pond and its 8 eggs. |
| **Current band** | 80–320 | The current climb's 20 doors |
| Future bands | 30 each: 320–350, 350–380, 380–410 (4 − c of them) | Name and door range ("THE SKY 21–40"); 20 short ticks at the door angles; a number every fifth tick; Keeper and Warden ticks |
| Blank outer band | 410–460 | Degree ticks every 14.4°, nothing else. The map is itself a well. ★4 inks Cycle 2 in here. |

- **Door n** (1–20) of the current band sits at **r = 80 + 12·(n − 0.5)** (86 … 314) and **θ = 43.2° + 14.4°·(n − 1)**, measured from 12 o'clock (the Foot's bearing) in the direction the strands step up when seen from above.
- **Why the angles are honest.** Each floor's five doors fan around the bearing of the strand that holds them (72° apart, as in the world). So the map really is the Braid seen from above, rotated so the Foot is up (Law 4).
- **Landings** sit on the floor boundaries: between doors 5 and 6 at r 140, θ 108°, and so on.
- **The wedge.** Door 20 lands at 316.8°. The 72° wedge through 12 o'clock holds the Foot (the layer's start) and the ★ node (its exit).
- **Spacing** *(computed)*: adjacent doors at the innermost radius sit 21.6 units apart; nodes are 14 units wide, with a 24 px hit area.

### 11.3 Nodes and marks (state is always shape plus pattern, never colour alone)

| Mark | Drawing |
|---|---|
| Future door | Dashed ring, no letter. Plaques are revealed only at the niche, so the map never leaks a door (WORLD review F7). |
| Current door | A pulsing ring; its letter appears once its plaques are revealed |
| Cleared | A solid disc in the played suit's colour, with its letter |
| Failed | A cracked disc |
| Hidden clear | A star stamp on the disc |
| Gold door | A gold disc |
| Rematch | A loop arrow; hover shows `1:12 → 0:18` |
| ♥ | A heart |
| E | A hexagon (the GDD shape code) with a SOLO or DUO pip |
| Pair | The played door sits on the spiral; the unchosen door is a 60% ghost 14 units inside it |
| Fork | Two lobes: the group door on the spiral, the E door 18 units outside. They join at a Meeting diamond 7.2° later. |
| Landing | A square (the Keeper Landing adds a save glyph) |
| Keeper, Warden, ★ | A bell, a jar, a star |
| Hidden room found [SHOULD] | A dotted side lobe with a crack glyph |
| **Your path** | A glowing line through every played node |
| **Your best door** | A gold ring and `BEST 17` |
| **Party pips** (pause) | Seat Hue dots on the current node. Offstage Rivals are hollow pips on their lobe. |
| **Friends' best doors** [MUST-B] | Up to 8 pins just outside the band at their door's angle. A best door beyond the current layer pins onto a future band's tick, so a friend's "37" shows in the Sky ring, which is a reason to climb. |

- **Friends' pins source.** A Steam leaderboard `best_door` (keep-best), read friends-only. It is an unvalidated brag shown only to friends; the replay-validated leaderboards stay LATER (FO §3.6). 10 owns the calls.
- **Streamer-safe** [SHOULD] hides friends' names.
- **Label budget:** ≤ 40 labelled nodes at once. Labels appear only on hover or focus, and on landmarks (current door, Landings, Keeper, Warden, best door).

### 11.4 Colours and access

- **Palette.** Background night `#0E0B10` at 88%, text `#F4EDE3`, gold `#FFD76A` (GDD §13.3). Each band is filled with its layer's signature accent (§2.2) at 10%.
- **Legibility.** Text is ≥ 18 px at 1080p.
- **Gamepad.** The left stick walks a focus ring along the spiral.
- **Reduced motion** swaps every tween for an instant relayout.

### 11.5 The results path [MUST-A]

- **Order.** After the counter slams `DOOR 14 · BEST 17` (04/09), the path draws along the spiral from the Foot to the last door reached, at 12 doors per second.
- **Pops.** Each node pops into its state with a rising-pitch tick, and failed doors crack audibly.
- **New best.** A new best door gets the gold ring last.

### 11.6 The ★1 match cut [MUST-B]

- **Fade in.** At ★1 18.0 s the map fades in over the vista at 60%.
- **Nodes fly.** Each Sky floor's island spawns a node at its screen position (`Camera.WorldToScreenPoint`), which flies to its Sky-band position in 1.2 s (PrimeTween, ease-out cubic).
- **Relayout, at the same time.** The Well band (80–320) shrinks into the centre (0–80) over 0.6 s, the Sky band grows from 320–350 to 80–320, and its arc inks in with a 0.6 s stroke sweep.
- **Fade out** by 20.0 s.
- **After ★1** the map keeps the Sky as the current band, even though the Sky's doors ship as an update: its ticks read `21–40` and its door 21 node is chained.

---

## 12. Build list and tests for this file

| Milestone | World work |
|---|---|
| **M0** (weeks 1–2) | Capsule greybox of the shaft, strands 1–3, niches and the room grid, generated from `WellLayout.json`. `ClimbPlanner`, the skeleton tables and validators 1–5 (§6.9). The walk-vote. A stub of the lit trail. |
| **MUST-A** | The full shaft (wall, water, mist, 400 wall lanterns, windlass, rope, the Jar hanging, 12 lantern points); strands 1–3 with Landing 1 and the Keeper Landing; the Mouth at 31° / 37° / 44° with 3 baked cubemaps; niches, plaques (every A variant), gold doors with the odds page; `br_window`; the lit trail; the Landing glance with its System lines; the Keeper pull-back; the croak echo; the waltz height ladder; the seeded Quick Climb (5-row table); the map on the hub wall, in pause and in results. |
| **MUST-B** | Strands 4–5, Landing 3, the bucket; the Mouth at 56° / 74°; forks, the buddy rule, offstage Rivals, Tower-carried keys, the shadow-glass window; the Full Climb planner (4,500-row table, debut pair, Rematch, ♥ slots, set pieces); ★1 complete with reduced motion; `Vista_Sky`; NearCam/FarCam; the Rim (Glide on, dry croak, chained door 21); the map match cut; friends' pins; the CJK glyph subset. |
| **SHOULD** | Hidden rooms; the light pillar and water reflection; the First Shout; share-card captures at ★1 7.0 s and 18.0 s; the heron over Landing 3; streamer-safe map names; drop-in in front of the next niche; the Sky Preview (doors 21–25 in the neighbouring wells). |
| **LATER** | The Sky, Space and Beyond layers (formats, verbs, social rules, molts, Keepers, Wardens); `ShellRig`; ★2–★4; the Revelation; Cycle 2; the Watchers audience. |

**Tests this file adds** (EditMode unless marked; all fail the build):
1. `Geometry_MouthAngles`: the Mouth angle from each stop matches §3.3 within ±0.2°.
2. `Geometry_Clearance`:
   - every stop's Mouth sightline clears all geometry by ≥ 3 m;
   - the bucket clears the wall by ≥ 0.5 m throughout the ★1 lift;
   - no bridge intersects a strand.
3. Planner tests 1–5 (§6.9).
4. `Reveal_Timelines`: masks, durations and free-look times for `star1.json` and `keeper_pullback.json` (§10.10).
5. `Reveal_NoHitch` (PlayMode): zero shader compiles and zero GC allocations in the reveal director during ★1.
6. `Map_Layout`: no two node hit areas overlap at 960 px for 1,000 seeded climbs, including every fork, ghost and pin.
7. `Plaque_Golden`: one golden screenshot per plaque variant (§5.2) at 8 m and 12 m (with 05's Definition of Done).
8. Telemetry, not a test: time outside rooms ≤ 12% per climb (FO §3.5); median ★1 reach time; the share of first sessions that see the window, the pull-back and ★1 (DEC §8.2 #28's fidelity KPI).

---

## 13. Open questions

Per the brief, every decision above follows DEC even where flagged here.

1. **Gold doors cluster on floor 4.** At FO's 5% per slot, **62%** of Full Climbs get their gold door from the floor-4 guarantee, and only 25% of Quick Climbs see one (§5.3, computed). That makes the "variable reward" fairly predictable. Consider 8% per slot, or rolling on every slot 2–19. Either needs an FO amendment and a new published odds line.
2. **E-door rim colour.** FO §3.3 calls E doors "gold-rimmed". This file rims them violet `#B388FF`, so that gold means one thing (a gold door). This needs a nod from 05 and 09.
3. **Gold on a pair slot** turns one side into an unlettered gold door beside a rule door (§5.3). DEC says "5% per door slot" but never defines pairs. Confirm with 04 and 05.
4. **The third fork degrades to a pair** in 25–100% of climbs for E-loving players with the slice's 2 E rooms (§6.5, computed). Promoting one `*_e` variant (for example `echo_warren` SOLO) from SHOULD to MUST-B would remove it.
5. **Breathers are exempt from the pool rule** (§6.5). The slice's 7 breather rooms cannot fill 7 slots without a repeat when no gold door rolls. DEC §5's pool rule reads as universal, so this needs a one-line amendment.
6. **The Warden stands in the real shaft** (the bucket, §3.5), not on the room grid, because ★1 starts from it. 05 must build `warden_the_jar` there. The Jar leaving through the Mouth and the rope coming back with a knot are this file's proposal for the end of P3.
7. **Authored or seeded in mixed lobbies:** this file plays the authored first climb if *any* human has never reached a Keeper (§6.2), with a host override in friends lobbies. 03/04 should confirm per-player pacing (auto-grants) inside a seeded climb for a newcomer.
8. **Friends' best doors** come from an unvalidated Steam leaderboard, shown friends-only (§11.3). 10 should confirm the Facepunch leaderboard calls and whether the brag is acceptable before replay validation exists.
9. **Proposals for LATER layers need an owner's sign-off** when those layers are scheduled: Kite Knot, Push-off and Light-Lag as social rules; light-rails as the Beyond verb; the star-freckle molt; the Watcher being the Revelation frog's eye; the Sky's door niches in neighbouring wells.
10. **Tree Frog class vs Glide.** In the Sky everyone glides, so the Tree Frog class's Glide Leap loses its identity. Suggest doubling its glide to 3.0 s in the Sky (04 owns classes).
