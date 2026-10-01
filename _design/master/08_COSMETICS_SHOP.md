# 08 · Cosmetics, the Mirror and the shop

**Version** 1.0 · **Date** 2026-09-29 · **Status:** master design, bound by `DECISIONS.md` (**D**), then `FUN_OVERHAUL.md` (**FO**), then the reports (**RR**, **UT**). Parts bin: GDD §12, WORLD §3.2, CRIT #6 and #27, `inputs/hero_0..2`.

**This file owns** the 8 cosmetic slots and the 2 earned-only extras, the full catalogue (60 numbered items), rarities, the Mirror and try-on, Pearl prices and pacing, earned-only prestige, Supporter Sets as Steam DLC, the non-expiring pass [LATER], what is never sold, the retention ethics rules, Rival loadouts, the price and launch plan, store and capsule notes, telemetry with the "Worth it?" revert rule, and the build-failing tests (FO §8.6 plus additions).

**It does not own:** Pearl yields and the results ceremony (`04_PROGRESSION_ECONOMY`), the frog body, sockets and Seat Hue palette (`02_HERO_AND_CONTROLS`), the Rivals' personalities and barks (`03_SOCIAL_AND_BOTS`), hub and Landing layout (`07_HUB_AND_MINIGAMES`), palettes, the toon shader and the System window style (`09_ART_UI_AUDIO`), Steam, save and network plumbing (`10_UNITY_TECH`).

**Number labels.** Every number here is a greybox hypothesis unless it cites D or FO. Prices (150 / 400 / 900 / 2,000 Pearls) and the $2.99–4.99 Supporter band are FO §4.3 and §8.2.

**Scope tags:** [MUST-A] the Quick Climb and free demo · [MUST-B] the Full Climb launch · [SHOULD] · [LATER].

---

## 0. At a glance

| What | [MUST-A] (demo) | [MUST-B] (launch) | [LATER] |
|---|---|---|---|
| Slots you can change | Hat, Skin, Glow colour | All 8, plus the 2 earned-only extras | — |
| Pearl catalogue | 12 items (4 hats, 4 skins, 4 glows) | 24 items | +8–12 per free layer update |
| Prestige (earned-only) | Bell Cap (first Keeper), 2 Bestiary hats | +12 more (loyalty, betrayal-side, rank, feats) | Moon Crown (SSS), 3 surfacing hats, 3 Bestiary hats |
| Paid | Nothing. The demo sells the game, not DLC. | 2 Supporter Sets as Steam DLC, plus a Steam bundle of both | One paid product per layer update: a new Supporter Set **or** that layer's pass, never both |
| Shop rhythm | No rotation, no timers | Featured shelf keyed to play, never to the clock | Event items with an archive challenge |

**The cosmetic beats every new player gets** (D §5 clocks):
1. **~10:40, Keeper Landing:** the free **Bell Cap** waits on a cushion at the stall. Tongue it and it arcs onto your head with a bell *ting*. The Mirror opens. [MUST-A]
2. **The first results screen** (resting at the Keeper, ~11 min, or ★1, ~22:30): about **208** or **348** Pearls (04 §10.4), so the first Common, or two, is affordable in the first session. [MUST-A]
3. **~22:30, ★1 on the Rim:** the **Rim Stone** hat (you took a piece of the well with you). [MUST-B]
4. **Every results screen after that:** the Pearl count-up fills a thin bar toward your wishlisted item (§7.5). [MUST-A]

---

## 1. Why cosmetics matter in this game (design goals)

Every rule below serves one of these. If a cosmetic feature serves none, cut it.

1. **Identity at 25 m.** Eight frogs share one silhouette and one hitbox (D §2). A hat is the fastest way to tell *your* frog from Vex in a pile-up, and the most clip-able item in the game. That is why Hat is slot 1 and why most prestige items are hats.
2. **Felt progress between climbs.** Body and Build reset every climb (D §4). The Mirror is where Legend-track progress becomes something you can *wear*: Bestiary pages become hats, Heart-door co-op answers become a hat, Tower Rank becomes a System window.
3. **Brag without power.** Prestige items say "I did the hard thing" (Hell Warden, SSS, the Mimic win) and change nothing else. The System names the unlock with its cause, like every other gain.
4. **Attraction.** Frogs in tiny hats are shareable on sight (hero_0 §6). Rivals wear catalogue items in every climb, so you see an item in play before you ever open the Mirror.
5. **Respect.** Cosmetics only, no paid randomness, no currency for sale, no timers, generous and published earn rates (FO §8.2–8.4; RR "keep the jackpot feel of lights and jingles, sell only cosmetics").

---

## 2. The slots

FO §7 orders the slots by how often *other players* see them. Every item attaches to a fixed `IHeroBody` socket or a fixed shader parameter block, so every hat fits every molt (D §2).

| # | Slot | Attaches to | What it changes | What it can never change | First ships |
|---|---|---|---|---|---|
| 1 | **Hat** | `hat` socket | One mesh on the head, with optional spring bones and ≤ 20 particles | Eye domes, face, back spots, the Crown glow plane, the WANTED poster | [MUST-A] |
| 2 | **Skin** | Toon shader body block | Body colours, surface pattern, the **marking mask** that lights up with Glow Level | Geometry, the back-spot **saddle** (§3.3), rim light, outline | [MUST-A] |
| 3 | **Glow colour** | Toon shader glow block + firefly orbiters | Hue and saturation of the belly glow, the orbiting fireflies, lit markings and the Crown glow halo | Brightness at each Glow Level, the number of fireflies, the halo's shape | [MUST-A] |
| 4 | **Croak voice** | Croak audio emitter | Timbre of the tap pulse and the held note | The pentatonic note, loudness, timing window, echo, range | [MUST-B] |
| 5 | **Tongue trail** | Tongue tube material, tip mesh, trail particles | Tube colour and pattern, tip shape, ≤ 0.3 s trail | Tube length, radius (±10% max), the Awakening tip glow, the crimson tell tip | [MUST-B] |
| 6 | **Emote** | The Wheel's emote spokes (4 equipped; 02 owns the Wheel) | A ≤ 3 s procedural body sequence, optional 1 prop | Hitbox, collider, glow, spots, any gameplay tell | Defaults [MUST-A]; changing them [MUST-B] |
| 7 | **Door-entrance effect** | Your frog's feet, on the first frame you cross into a new room | A ≤ 0.8 s Shuriken burst and a sound | Room lighting (no Light components), plaques, cues | [MUST-B] |
| 8 | **Betrayal Snap** | The Betrayal Cam, only when *you* Cut | Extra world-space and screen-edge flair for the 0.8 s Cam | The crimson thread flash, `[ TRAITOR ]`, the victim's and cutter's faces. Screen-space parts stay in the outer 20% of each side; world-space parts stay at alpha ≤ 0.8 | [MUST-B] |
| + | **System window theme** (earned-only) | Your own System windows | Panel colour, border colour, border style | Text, font, size, position, timing | [MUST-B] |
| + | **Tadpole ghost** (earned-only) | Your tadpole ghost while Dark | Ghost mesh and material | Size, egg, the Seat Hue outline, nudge and ping behaviour | [MUST-B] |

System window themes and tadpole ghosts are **never sold and never priced in Pearls** (FO §7, CRIT #27): they are rarely seen by others, so they are pure brag for yourself.

**Loadout.** One item per slot, 4 emotes. Up to **4 saved outfits** in the Mirror [MUST-B]. A loadout replicates as 12 `ushort` catalogue indices (24 bytes; the System window theme stays local) in one owner-written NetworkVariable, sent on change and at spawn. The host checks each id exists and matches its slot, else it substitutes the default (10 owns the transport). Bots get their loadouts from their Rival definition (§13).

---

## 3. Readability and fairness rules (every cosmetic, every time)

These are law, because the fairness contract is law (FO §2.2, §5.4) and "growth is light" is binding (D §2).

### 3.1 Never counterfeit a readout

The frog's body *is* the HUD. No cosmetic may imitate or hide any of these:

| Readout | What it tells you | Cosmetic rule |
|---|---|---|
| **3 back spots** | Health | Nothing overlaps the saddle (§3.3). No skin draws dots there. Spots use a fixed colour no cosmetic touches. |
| **Belly brightness, firefly count, lit markings** | Glow Level | A Glow colour sets hue only. No hat, skin or emote adds orbiting lights or pulses the belly. Marking coverage is 12–20% on every skin. |
| **Crown glow halo** | Lv10 | No emissive ring, torus or orbit arrangement on any hat. Non-emissive brims are fine. |
| **Seat Hue rim** | Who is who; blame and name tags | The rim is always the seat's. No cosmetic disables, tints or outshines it. |
| **Crimson** | Betrayal: the Cut thread, the tell's tongue tip, `[ TRAITOR ]` | No cosmetic colour within **15° of hue** of betrayal crimson (D §2). 09 owns the final hex in `presentation/palette.json`, and the test reads it from there. Today's reference is 03's `#E8254F` (hue ≈ 347°; GDD §13.3 had `#FF3D6E`, ≈ 345°), so cosmetic hues from about **330° to 2°** are banned whenever saturation ≥ 0.2 and value ≥ 0.2. Every cosmetic colour in this file clears both references by ≥ 19°. |
| **Monster and Mimic tells** | Rule-door danger; Doppelfrog's sideways blink | No cosmetic reproduces a tell: no sideways-blinking eye, no glowing eye pair, no cheek puff, no 0.6 s lean-in wind-up. |
| **WANTED poster, Vengeance slime** | Who betrayed whom | Always drawn over every cosmetic. |
| **Class markings** | Which class you are | A skin cannot carry a class pattern. Class markings appear only while you are that class (§6.6). No cosmetic name contains a class name (Tree Frog, Bullfrog, Dart Frog, Mime Frog, Echo Toad, Horned Frog, Glass Frog, Lily Walker, Bell-Eater). |

### 3.2 Never change play

- No cosmetic changes hitbox, collider, speed, hop height, tongue range, croak range, loudness, light cast on the room, or what you can see.
- **No cosmetic carries information.** Nothing points at monsters, sounds, jars or secrets. (An antenna that twitched toward sounds was cut from `hat_moth_antennae` for this reason.)
- Cosmetic triggers use gameplay events that are already replicated: croak, lash, door enter, Cut, landing, catch. All cosmetic visuals are client-side.
- **Hats never fall off in play.** On an impact ≥ 6 m/s, a hat may pop up 0.3 m and re-seat within 0.5 s, on the local ragdoll layer only (never networked). Kestrel's cone bouncing off during the first laugh is intended.

### 3.3 Geometry envelopes (defaults at frog height **H = 0.60 m**)

02 owns the frog's real proportions and sockets. Every cosmetic stores its sizes in units of H, so if 02 changes H everything scales. Metres below assume H = 0.60 m.

| Envelope | Rule |
|---|---|
| **Hat box** | Above the `hat` socket: width ≤ 0.55 H (0.33 m), depth ≤ 0.50 H (0.30 m), height ≤ 0.45 H (0.27 m). Below the socket plane: only inside a cylinder of radius 0.15 H (0.09 m) and depth 0.05 H (0.03 m), so the hat can seat. Particles are exempt but must stay at alpha ≤ 0.35. |
| **Eye-dome keep-out** | Each eye dome's sphere plus 0.02 H holds no hat geometry. |
| **Face keep-out** | No geometry in front of the eye domes below their centre height: the face, cheeks and mouth stay visible (they carry the Cut tell). |
| **Saddle** | An ellipse around the 3 back spots plus a 0.04 m margin. The shader forces every skin's pattern contrast there to 0, so the saddle shows the skin's base colour only; nothing hangs into it from above. |
| **Tongue tip** | Tip mesh fits a 0.06 m sphere, ≤ 300 triangles. |
| **Emote prop** | ≤ 0.35 m across, ≤ 800 triangles, spawned for the emote only. |

### 3.4 Budgets per frog

| Budget | Cap |
|---|---|
| Cosmetic triangles | ≤ 3,000 (hat ≤ 1,500) |
| Material slots | Hat ≤ 2; everything else uses the body and tongue materials |
| Live cosmetic particles | ≤ 60 per frog |
| Light components | **0.** Glow is emissive plus bloom, as for tells (D §12 budget: host ≤ 8 ms, frame ≤ 16.6 ms at 1080p with 8 seats) |
| Audio | 1 voice per croak; every other cosmetic sound ≤ −18 dB relative to the croak unless its row says quieter |
| Flashing | No cosmetic changes luminance by more than 10% faster than 3 Hz (the WCAG three-flashes line) |

**Settings** [MUST-B]: *Reduce others' effects* hides other players' door-entrance effects, tongue trail particles and the screen-edge parts of Betrayal Snaps, and keeps hats, skins and glow colours. It is also forced on by reduced-motion mode.

---

## 4. Rarities

**Rarity is a price and a craft budget, never a drop rate.** Nothing in KNOTWELL drops cosmetics at random, so no rarity ever has a percentage (D §8.3 "invented rarity percentages" are cut).

| Rarity | Label colour | Pearls (FO §4.3) | ≈ later Full Climbs (04 §10.4) | Craft budget: hats, skins, glows, emotes | Craft budget: croak, trail, door, Snap |
|---|---|---|---|---|---|
| Default | `#8A8F98` | free | — | Base look | Base look |
| **Common** | `#B8C4CC` | **150** | ~1.2 | One mesh or pattern, ≤ 1 spring bone; no particles; no extra sound | One recipe; ≤ 30 particles; 1 sound |
| **Rare** | `#4FC3F7` | **400** | ~3 | + a second moving part or a slow cycle, or ≤ 20 particles | + one moving element (sweep, burst on grab) |
| **Epic** | `#B388FF` | **900** | ~7 | + multi-part motion, ≤ 40 particles, 1 sound | + a mesh flipbook or a screen-edge element, ≤ 60 particles |
| **Legendary** | `#FFD76A` | **2,000** | ~15 | A signature behaviour reacting to 2+ game events, ≤ 60 particles (the §2 slot caps still apply, e.g. ≤ 20 on a hat) | — (no Legendary in these slots) |
| **Prestige** | `#FFF1C1` with a slow shimmer | earned only | — | Any budget up to Legendary | Any budget up to Epic |
| **Supporter** | `#7EE0A1` | Steam DLC, real money | — | **Capped at the Epic budget**, so paid items are never the showiest things in the game | Capped at Epic |

Rarity is always shown as a word ("RARE") as well as a colour, for colour-blind players. "Legendary" here is the FO §4.3 price band; it is not a Legendary Boon (see Open questions).

---

## 5. Build contract (how an agent makes a cosmetic)

**Rule: cosmetics are data.** Every non-paid item (defaults, Pearl items, prestige: 52 records) lives in `economy/cosmetics.json`, and the 2 sets with their 8 items in `economy/supporter_sets.json` (10 §4.1). An editor script generates the `CosmeticDef` and `SupporterSetDef` ScriptableObjects, as for rooms (UT; D §7). No cosmetic needs bespoke C#.

```json
{
  "id": "hat_acorn_cap",
  "slot": "Hat",
  "rarity": "Common",
  "pearlPrice": 150,
  "socket": "Hat",
  "milestone": "MUST-A",
  "nameKey": "cos.hat_acorn_cap.name",
  "descKey": "cos.hat_acorn_cap.desc",
  "wish": ["skins_shop"],
  "hue": ["#8A5A2B", "#5A3A1C", "#6B4A2A"],
  "visual": { "mesh": "Generated/Cosmetics/hat_acorn_cap.fbx", "sizeUnitsH": true,
              "springs": [{ "bone": "spr_stalk", "hz": 6, "damping": 0.3 }] }
}
```

- **Exactly one source field** per item, as 10 defines `CosmeticDef`: `pearlPrice`, **or** `earnedBy` (a prestige rule id plus its progress counter; defaults use `earnedBy: "default"`), **or** `supporterSetId`, or `passId` [LATER].
- `hue` lists every colour the item uses, so the crimson test (C7) reads one field.
- **There is no field that can name a gameplay stat, a random table or a grant** (FO §8.6; `ShopEnforcementTests`, §17 C1).
- Every player-facing string goes through Localization (D §8.2 #27), in the `KW_UI` table under keys `cos.<id>.name`, `.desc` and `.unlock`.
- Ownership of paid sets is read through `IDlcOwnership` (04 §10.5): `SteamDlcOwnership` in players, `MockDlcOwnership` in the editor and development builds only.

**Makers, per slot:**

| Slot | Maker | Output |
|---|---|---|
| Hat, tongue tip, emote props | Blender 5.2 Python scripts in `Tools/Blender/cosmetics/<id>.py`, built from primitives (cylinder, cone, torus, UV sphere, lathe profiles, Bezier tubes, boolean-free). CC0 props from Kenney, Quaternius or KayKit only when a script can't do it. | `.fbx` with the `hat` bone, spring bones named `spr_*`, ≤ budget tris |
| Skin | Parameters on the agent-owned HLSL toon shader (`KW/ToonLit`, 09): `_Base`, `_Belly`, `_MarkColor`, `_Pattern` (enum: `solid`, `bands`, `speckle`, `hex`, `voronoi`, `stars`, `gradient`, `swirl`), `_PatternParams` (vec4), `_MarkPattern` (same enum), `_Gloss`, `_Dither` (Bayer alpha for see-through skins) | No textures, or one baked 256² mask per skin from an editor script |
| Glow colour | Hue and saturation read from hex values; **value comes from the Glow Level table** (02/09), so every glow colour is equally bright at each level (±5%) | 4 colours: core, edge, fireflies, lit markings (+ an optional hue cycle) |
| Croak voice | In-house offline synth `Editor/CroakSynth.cs` renders 48 kHz mono WAVs per pentatonic note from a recipe (waveform, partials, formant Hz and Q, attack, decay, noise mix, transient). No third-party audio, so no licence risk. | `tap` clips and a `sustain` loop per note, loudness matched to the default croak ±1 dB RMS |
| Door effect, trail, Snap particles | Shuriken prefabs from JSON params (count, lifetime, speed, cone, gravity, colour over life, size) | Prefab ≤ particle cap |
| Emote | A PrimeTween sequence on rig targets (root squash, arm nubs, eyes, throat sac, leg IK targets) from JSON steps | ≤ 3.0 s, interruptible by any input |
| Thumbnails | `Editor/CosmeticThumbnailBaker` renders 256×256 tiles on the logged-in desktop (never `-nographics`) | One PNG per item |

Every generated or imported asset gets a `licenses.csv` row: script-generated items say `original, generated by <script>`; CC0 items name the pack and URL (FO §8.6; D §12).

---

## 6. The catalogue (60 items)

**Four sources, never overlapping** (FO §8.2): Default (12), Pearls (24), Prestige (16, earned only), Supporter (8, paid DLC). All sizes assume H = 0.60 m (§3.3). "Your note" means your seat's pentatonic croak note (09). "Glow Level" lighting of markings follows 02's table.

### 6.1 Defaults (1–12)

| # | id | Name | Slot | Tag | Visual |
|---|---|---|---|---|---|
| 1 | `skin_pond_lime` | Pond Lime | Skin | [MUST-A] | Body lime `#7ED957`; belly cream `#F4EDC9`; markings: two wavy black `#1E2230` bands per flank (`bands`, amplitude 0.015 m, width 0.018 m; 15% coverage), dart-frog style; gloss 0.25. |
| 2 | `glow_firefly` | Firefly | Glow colour | [MUST-A] | Core `#F2F77A`, edge `#B8E85A`, fireflies `#FFF6A8`, lit markings `#E6F57A`: real firefly yellow-green. |
| 3 | `croak_pond` | Pond Croak | Croak voice | [MUST-A] | Tap: sawtooth at your note plus 2nd and 3rd partials, formant 900 Hz Q 2.5, attack 12 ms, two pulses 70 ms apart ("rr-ibbit"), decay 180 ms. Sustain: the same reed held, 4 Hz vibrato ±10 cents. |
| 4 | `tongue_coral` | Coral Tongue | Tongue trail | [MUST-A] | Tube coral `#F7A08C` (gloss 0.5); tip sphere 0.045 m `#FFC2B0`; no trail. |
| 5 | `emote_wave` | Wave | Emote | [MUST-A] | 1.2 s: right nub rises 110° and waves ±25° at 2.5 Hz for 3 cycles; eyes squint 30%. |
| 6 | `emote_point` | Point | Emote | [MUST-A] | 0.9 s: right nub extends toward the camera's aim point, eyes track it, a 0.05 m hop. |
| 7 | `emote_clap` | Clap | Emote | [MUST-A] | 1.0 s: nubs clap 4× at 4 Hz, body squash 4% per clap, a soft "pap". |
| 8 | `emote_shrug` | Shrug | Emote | [MUST-A] | 0.8 s: both nubs up 60°, eye domes tilt 10° apart, squash 6%, a questioning "hm?" croaklet at −18 dB. |
| 9 | `door_plop` | Plop | Door-entrance | [MUST-B] | 6 dust quads `#CDBFAE`, 0.35 s, a 0.8 m/s outward ring; a soft "plop". |
| 10 | `snap_clean_cut` | Clean Cut | Betrayal Snap | [MUST-B] | Nothing extra: the system's crimson thread flash and `[ TRAITOR ]` only. |
| 11 | `sys_tower_blue` | Tower Blue | System window | [MUST-A] | 09's standard System window (GDD panel `#0B1630`, border `#5CE1E6`). |
| 12 | `ghost_tadpole` | Tadpole | Tadpole ghost | [MUST-A] | 02/09's standard tadpole ghost. |

There is **no default hat**: a bare head at 0:00 makes the Keeper's free hat land harder.

### 6.2 Pearl catalogue (13–36): 24 items, 12 in Milestone A

| # | id | Name | Slot | Rarity · Pearls | Tag | Visual |
|---|---|---|---|---|---|---|
| 13 | `hat_acorn_cap` | Acorn Cap | Hat | Common · 150 | [MUST-A] | Hemisphere cap 0.13 m across, 0.06 m tall, `#8A5A2B` with a raised scale texture (`hex` bump, cells 0.012 m, shade `#5A3A1C`); stalk cylinder 0.012 × 0.035 m `#6B4A2A`, tilted 15°, on one spring bone (6 Hz, damping 0.3) that wiggles on every hop. Worn 8° askew. ≤ 400 tris. |
| 14 | `hat_traffic_cone` | Traffic Cone | Hat | Common · 150 | [MUST-A] | Cone of base radius 0.075 m, 0.20 m tall, 16 sides, `#FF7A1A`, with two white reflective bands `#F4F4F0` (0.025 m tall, at 35% and 60% height); square base 0.17 × 0.17 × 0.012 m `#2A2A2A`. Sits 6° askew and wobbles ±12° on one spring (4 Hz, damping 0.25) after landings from ≥ 1.0 m. ≤ 300 tris. Kestrel's hat. |
| 15 | `hat_paper_boat` | Paper Boat | Hat | Rare · 400 | [MUST-A] | A folded newspaper boat (7-panel fold mesh) 0.22 m long, 0.09 m tall, 0.08 m wide, cream `#EFE3CF` with faint print lines (60 per metre, 10% contrast); a toothpick mast with a 0.03 m flag `#4FC3F7`. Idle bob: pitch ±4° at 0.5 Hz. In any water volume it rocks ±10° and the flag flutters. ≤ 600 tris. |
| 16 | `hat_well_bucket` | Well Bucket | Hat | Epic · 900 | [MUST-A] | A tiny wooden well bucket: top 0.12 m, bottom 0.10 m, 0.11 m tall, 10 staves alternating `#8A5A2B` / `#7A4E26`, two iron hoops `#4A4E57` (torus, tube 0.004 m); a rope handle (Bezier tube, 0.14 m span, `#CDB892`) on a hinge spring (3 Hz, damping 0.2). Inside, a water disc `#3E7FA8` with a scrolling ripple. Each landing sloshes 3 droplets out (`#9CC8FF`, 0.4 s, gravity 1) with a tiny "plip". ≤ 900 tris. |
| 17 | `skin_strawberry_jeans` | Strawberry Jeans | Skin | Common · 150 | [MUST-A] | Body `#E4502E` (hue 11°, clear of crimson); arms and legs "blue jeans" `#2F6FD0` (`gradient` at hip and shoulder, 0.03 m blend); belly `#F2C2A8`; markings: black `#1E2230` fine speckle on the flanks only (`speckle`, 40 cells/m, threshold 0.90; 14%). |
| 18 | `skin_speckled_egg` | Speckled Egg | Skin | Common · 150 | [MUST-A] | Duck-egg blue `#BFE3DA`, belly `#EAF5F0`; markings: brown `#6B4A2A` voronoi specks (30 cells/m, threshold 0.92; 12%); matte, gloss 0.2. |
| 19 | `skin_honeycomb` | Honeycomb | Skin | Rare · 400 | [MUST-A] | Amber `#E8A33D` under a hex grid (cells 0.035 m, walls 0.004 m `#B8741F`); belly `#FFE3A3`; honey gloss 0.6. Markings: every 5th cell filled `#7A4A12` (16%), which light like backlit honey as your Glow Level rises. |
| 20 | `skin_stained_glass` | Stained Glass | Skin | Epic · 900 | [MUST-A] | Voronoi cells (18 cells/m) in five jewel tones: amber `#F2B134`, emerald `#2FAE6B`, sapphire `#2F6FD0`, amethyst `#8E6BD8`, citrine `#E8F24A`; leading lines `#1A1420`, 0.006 m; frosted belly `#F4EDE3`; the saddle is plain lead-grey `#3A3440`. Markings: 1 cell in 6 (16%), lit from inside like a chapel window as your Glow Level rises. |
| 21 | `glow_moonlight` | Moonlight | Glow colour | Common · 150 | [MUST-A] | Core `#E8F1FF`, edge `#9CC8FF`, fireflies `#D8E8FF`, lit markings `#C0D4FF`: cool silver. |
| 22 | `glow_mint_fizz` | Mint Fizz | Glow colour | Common · 150 | [MUST-A] | Core `#C8FFE9`, edge `#5CE1B8`, fireflies `#9FE8C7`, lit markings `#8BF0C8`. |
| 23 | `glow_sunset` | Sunset | Glow colour | Rare · 400 | [MUST-A] | Belly gradient from `#FF8A3D` (bottom) to `#FFD166` (top); fireflies `#FFC45C`; lit markings `#FFB347`. The gradient line slides ±10% over an 8 s period, a sun setting and rising in your belly. |
| 24 | `glow_aurora` | Aurora | Glow colour | Epic · 900 | [MUST-A] | Hue cycles over 12 s through `#6BE38F` → `#5CE1E6` → `#6AA8FF` → `#8E6BD8` and back (138°–259°, nowhere near crimson). Each firefly is phase-offset, so the orbit carries a moving band of colour; at Lv10 the whole Crown glow halo carries it. |
| 25 | `hat_tiny_well` | The Tiny Well | Hat | Legendary · 2,000 | [MUST-B] | A miniature stone well: 12 bevelled blocks (0.03 × 0.025 × 0.02 m) alternating `#6B5E57` / `#5D6878`, moss tufts `#7FB24A` on 3 blocks, 0.15 m across, 0.05 m tall; an A-frame roof (two 0.12 m planks `#8A5A2B` on 0.09 m posts) with a crank and a thread rope holding a thimble bucket. Inside, 0.03 m below the rim, black water `#0E0B10` and a **0.03 m micro-frog** (the hero mesh at 5% scale, in your skin and glow colour, belly capped at 0.3 intensity, no fireflies) looking up. It (a) croaks back 0.2 s after you, an octave up, at −18 dB; (b) climbs to the rim and looks up with you at Landings or whenever your camera pitches up past 35°; (c) sits on the rim, out of its well, once you stand on the Rim or in the Sky. *Every sky is someone's well.* ≤ 1,500 tris. |
| 26 | `skin_crystal_frog` | Crystal Frog | Skin | Legendary · 2,000 | [MUST-B] | See-through, after real glass frogs: outer body pale lime `#CFF5C8` at 55% dithered alpha (4×4 Bayer; outline and rim kept); inside, a 0.05 m heart `#E8604A` beating at 1.1 Hz (scale 1.00 → 1.12), racing to 2.2 Hz for 3 s after you are hit; a lilac gut coil (tube `#C9B7E8`) and pale leg bones `#F4EDE3`. Your belly glow lights the whole body like a lantern. Markings: lime dots `#9BE07A` on the limbs only (14%). Spots stay opaque in the saddle. |
| 27 | `croak_peeper` | Spring Peeper | Croak voice | Common · 150 | [MUST-B] | Tap: sine plus triangle chirp, formant 2.4 kHz Q 4, attack 5 ms, decay 120 ms, starting 3 semitones sharp and settling on your note within 25 ms. Sustain: a 9 Hz trill on your note. |
| 28 | `croak_kazoo` | Kazoo | Croak voice | Rare · 400 | [MUST-B] | Tap: sawtooth through a nasal comb filter (delay 0.9 ms, feedback 0.6) and a 1.1 kHz formant, attack 10 ms, decay 200 ms. Sustain: kazoo hum with 5 Hz vibrato ±15 cents. Eight kazoos in one Chorus is the joke. |
| 29 | `tongue_candy_stripe` | Candy Stripe | Tongue trail | Common · 150 | [MUST-B] | Barber-pole spiral in white `#FFFFFF` and mint `#9FE8C7`, 6 turns per metre of extension, so the stripes stretch as the tongue flies out; tip sphere `#C8FFE9`; no particles. |
| 30 | `tongue_firework_lash` | Firework Lash | Tongue trail | Rare · 400 | [MUST-B] | Coral tube. While it extends, 12 fizz streaks per second spray from the tip (stretched billboards `#FFD166`, 0.25 s, 0.03 m); a successful grab bursts 16 star quads `#FFF1C1` (0.3 s). |
| 31 | `emote_lily_twirl` | Lily Twirl | Emote | Common · 150 | [MUST-B] | 1.4 s: a lily pad prop (0.30 m disc with a notch, `#5FA84A`, vein lines) pops under the frog (scale 0 → 1 in 0.1 s); the frog spins 720° on it with nubs out and pupils spiralling, ends in a wobbly 25° bow; the pad shrinks away. |
| 32 | `emote_belly_drum` | Belly Drum | Emote | Rare · 400 | [MUST-B] | 2.0 s: the frog sits back on its haunches (leg IK) and drums its belly with both nubs, 6 beats at 4 Hz, a tom at −18 dB walking your pentatonic notes 1-3-5-3-1-5; belly squash 5% per beat. The glow never changes (§3.1). |
| 33 | `door_firefly_confetti` | Firefly Confetti | Door-entrance | Common · 150 | [MUST-B] | 30 paper confetti quads (0.02 m) in your glow colour's edge hex and white, burst up at 2.5 m/s in a 50° cone, gravity 0.6, 0.9 s; a party-horn "pff" at −20 dB. |
| 34 | `door_big_splash` | Big Splash | Door-entrance | Epic · 900 | [MUST-B] | A cartoon water crown: a 12-frame mesh flipbook (a jagged-topped cylinder growing from 0.5 to 0.9 m across in 0.35 s) in `#9CC8FF` with a white `#FFFFFF` toon highlight, 20 droplets (0.6 s), a 0.6 m floor ring decal fading over 0.8 s, and a "SPLOOSH" at −18 dB. It splashes on dry stone too; that is the joke. |
| 35 | `snap_scissor_snip` | Scissor Snip | Betrayal Snap | Rare · 400 | [MUST-B] | Two 1.2 m ghostly scissor blades (matcap chrome `#C9CED6`, alpha 0.8) sweep in along the thread from the nearest screen edge and snip it at 60% of the Cam; a "snikt" under the stinger. |
| 36 | `snap_opera_curtain` | Opera Curtain | Betrayal Snap | Epic · 900 | [MUST-B] | Purple velvet curtains `#4B1E6E` with gold trim `#FFD76A` sweep in from both screen edges (20% of the width each) and part again; an additive spotlight cone `#FFF1C1` (no Light component) finds the cutter, who takes a 0.3 s bow; a three-note brass "ta-da" under the stinger. |

**Milestone A's 12** are rows 13–24: 4 hats, 4 skins, 4 glow colours (D §7), priced 6 × 150 + 3 × 400 + 3 × 900 = **4,800 Pearls**. **The full 24** cost 10 × 150 + 7 × 400 + 5 × 900 + 2 × 2,000 = **12,800 Pearls**.

### 6.3 Prestige: earned only, never sold (37–52)

Prestige items can't be bought with Pearls or money, are never in a pass, and never expire. The unlock shows as a one-line System window naming the cause, and as a title callout in the results ceremony (FO §4.4 step 5: cosmetic callouts pay nothing). Each prestige tile in the Mirror shows its exact rule and a deterministic progress bar (`Bestiary pages 7 / 8`).

**The betrayal-side rule.** Nothing rewards Cutting a friend or counts betrayals (D §8.3; FO §4.4). Betrayal-side prestige keys on **a room's own rule** (a role the room assigned you, or your Vengeance), is **first-time only**, and nothing repeats. Farming one with a friend once is allowed and harmless.

| # | id | Name | Slot | Unlock (exact rule) | Kind | Tag | Visual |
|---|---|---|---|---|---|---|---|
| 37 | `hat_bell_cap` | Bell Cap | Hat | Clear the Keeper for the first time. It waits on a cushion at the Keeper Landing stall (D §5 ceremony, step 5); tongue it to wear it. | Feat | [MUST-A] | A tiny bronze bell (lathe; mouth 0.11 m, 0.10 m tall) `#C08A3E` with an engraved band `#8A5A2B`, worn mouth-down like a cap. A 0.03 m ball clapper peeks out at the back on a spring (5 Hz, damping 0.2) and *tinks* (a two-partial bell on your note, −24 dB) on landings from ≥ 0.5 m. `[ FREE HAT ] Bell Cap. Because: you beat the Keeper.` |
| 38 | `hat_pith_helmet` | Explorer's Pith Helmet | Hat | 4 Bestiary pages with the Cleared stamp (04 §9.3) | Bestiary | [MUST-A] | A dome 0.16 m across, 0.07 m tall, with a 0.02 m flared brim, cream `#E9D8C4`; band `#8A5A2B` (0.012 m); a brass badge `#D9A441` on the front stamped with a door outline. |
| 39 | `hat_heron_feather` | Heron Feather | Hat | 8 Cleared pages | Bestiary | [MUST-A] | One grey-blue feather `#8FA3B8` (a curved 0.26 m lofted mesh with 18 barb strips, tip `#5D6878`) tucked into a braided grass band `#5FA84A`, swept back 45°, on a 3-bone spring (2 Hz, damping 0.15). |
| 40 | `hat_moth_antennae` | Moth Antennae | Hat | 12 Cleared pages | Bestiary | [MUST-B] | Two feathery antennae on a thin headband, each a 0.14 m curved tube with 14 comb barbs, cream velvet `#EFE3CF` tipped lilac `#C9B7E8`, on 2-bone springs. They twitch at random every 3–6 s and perk up when *you* croak. They never point at anything (§3.2). |
| 41 | `hat_rim_stone` | Rim Stone | Hat | Surface the Well for the first time (★1) | Feat | [MUST-B] | One capstone from the well rim (bevelled box 0.17 × 0.05 × 0.12 m, stone `#6B5E57` with a triplanar crack pattern), worn flat like a mortarboard; a moss mat `#7FB24A` on top and a 0.06 m wildflower (5 petals `#FFD166`, centre `#8A5A2B`) swaying on a 2 Hz spring. "1–20" is carved on its face. Under open sky (the Rim, the Sky) the flower opens fully; in the Well it half-closes. `[ SURFACED ] Rim Stone. Because: you left the Well.` |
| 42 | `hat_moon_crown` | Moon Crown | Hat | Reach Tower Rank SSS (FO §4.3) | Rank | [LATER] | An upright silver crescent tiara at the front of the head (a 0.16 m torus arc, matcap silver `#D8DEE6`) set with one pearl `#FFF1C1` (emissive 0.3); moon-dust motes (6 per second, `#E8F1FF`, 1.2 s) drift *down* from it. An arc, not a ring, so it can't read as the Crown glow. |
| 43 | `hat_three_on_a_pad` | Three on a Pad | Hat | Clear each of the 4 Heart doors by its co-op answer at least once (lifetime): three frogs on one pad in `heart_two_pads`; both share in `heart_split_swallow`; sling your partner across `heart_tied_bridge`; vote the Mimic out in `doppelfrog` (either variant). Counts in solo with Rivals. | Loyalty | [MUST-B] | A lily-pad beret (0.18 m disc, one notch, `#5FA84A` with vein lines) topped by a wobbling stack of three 0.04 m frog figurines (the hero mesh at 6.5% scale in Moss green `#9BE07A`, Pip teal `#6FF0D6` and your own skin). Each rides a spring; the stack topples and recovers on landings from ≥ 1.5 m. *The rule said pads, not frogs.* |
| 44 | `tongue_true_knot` | True Knot | Tongue trail | Keep one Knot from Landing 3 through a Warden clear with neither frog Cutting, in 3 climbs (lifetime) | Loyalty | [MUST-B] | The tongue becomes a two-strand rope (two tubes twisted 8 turns per metre): one strand in your glow colour's edge hex, one in twine `#CDB892`. While you are Knotted, the twine strand takes your partner's glow edge colour. The tip is a 0.04 m figure-eight knot. |
| 45 | `emote_trust_fall` | Trust Fall | Emote | Make a catch in the Warden's Trust Fall (first time) | Loyalty | [MUST-B] | 2.2 s: the frog stiffens, tips backward 90° over 0.6 s, lands flat with a "whump" and bounces twice (0.10 m, then 0.05 m). If another frog's ordinary lash touches the faller in the first 0.6 s (no aim assist; whatever the tongue-on-player rule is), both play a 10% hug-squash and the faller is set upright. The emote itself adds no physics and no value. |
| 46 | `ghost_lantern_tadpole` | Lantern Tadpole | Tadpole ghost | Revive 25 frogs by Croak (lifetime; at most 5 count per climb) | Loyalty | [MUST-B] | A paper-lantern tadpole: a ribbed lathe body (8 ribs) in `#FFB86B` paper at 55% alpha, a soft glow inside (emissive 0.4), and a paper-streamer tail rippling at 3 Hz. The Seat Hue outline stays. |
| 47 | `hat_bounty_hunter` | Bounty Hunter | Hat | Land your first Vengeance | Betrayal-side | [MUST-B] | A tiny cowboy hat: pinched crown 0.09 m tall, brim 0.22 m with upturned sides, suede `#A0703C`, band `#2A2320`, and a 0.03 m five-point tin star `#C9CED6` that glints once (0.15 s) whenever you tongue-tag a traitor. |
| 48 | `hat_quicksilver_bowler` | Quicksilver Bowler | Hat | Win `doppelfrog` as the Mimic without being voted out, in the human-vs-human variant (≥ 3 humans, ≥ 5 voters; first time) | Betrayal-side | [MUST-B] | A bowler (dome 0.13 m, 0.08 m tall, brim 0.18 m) in liquid chrome (matcap `#D8DEE6`) with a slow 0.002 m vertex ripple at 0.5 Hz, like mercury. It has no eye and never blinks: the Mimic's sideways blink is a tell (§3.1). |
| 49 | `emote_busted` | Busted | Emote | Be voted out as the Mimic (human-vs-human variant; first time) | Betrayal-side | [MUST-B] | 1.6 s: an additive spotlight cone `#FFF1C1` drops on the frog; both nubs shoot up; pupils shrink to dots; a cartoon sweat-drop quad pops at the head; a comic two-note "dun-dun". |
| 50 | `sys_parchment` | Parchment | System window | Reach Tower Rank C | Rank | [MUST-B] | Panel `#EFE3CF`, ink border `#8A5A2B` with a torn deckle edge (noise mask), text `#2A2320` (contrast ≥ 7:1). |
| 51 | `sys_rim_gold` | Rim Gold | System window | Reach Tower Rank S, which requires a Well surfacing (FO §4.3) | Rank | [MUST-B] | Panel `#0B1630`, a 2 px gold-leaf border `#FFD76A` with corner rivets and a slow sheen sweep every 6 s. |
| 52 | `door_redacted` | Redacted | Door-entrance | Clear the Warden on Hell | Feat | [MUST-B] | Five black bars `#0E0B10` with white `#F4EDE3` edges (world-space quads 0.4–0.9 m wide) slide across your frog one after another over 0.5 s, like redacted rule text, then peel away as paper strips; a typewriter "ka-chunk". Hell always redacts the rules; now you redact the doorway. |

**Prestige by kind:** Feat 3 (37, 41, 52) · Bestiary 3 (38–40) · Rank 3 (42, 50, 51) · Loyalty 4 (43–46) · Betrayal-side 3 (47–49).

**Where these are visible to others.** Hats, trails, emotes and door effects are seen by everyone; System windows and tadpole ghosts mostly by you. [SHOULD] Each prestige unlock also sets a Steam achievement, so its tile can show the **real** Steam global unlock percentage once data exists; on LAN or before data, it says "first in this lobby" or nothing. Never an invented number (FO §4.2).

### 6.4 Supporter Sets: paid Steam DLC (53–60)

Two 4-piece sets (hat, skin, croak voice, tongue trail), as FO §8.2 specifies. No Pearl item and no prestige item shares a mesh, pattern or recipe with them (§17 test C6). Each set is built against `IHeroBody` sockets, so it survives a hero change (§18).

**Set 1 · `set_candle_toad` · Candle-Toad Set** [MUST-B, stub; price set at launch]. The old candle hero's line, kept alive on the frog (FO §7 REMAP; D §2).

| # | id | Name | Slot | Visual |
|---|---|---|---|---|
| 53 | `hat_taper_candle` | Taper Candle | Hat | An ivory taper 0.03 m across and 0.16 m tall `#F3EBDD`, with 3 melt beads running down it (vertex bumps), in a brass dish (lathe, 0.08 m) `#D9A441`. A billboard flame (two noise-scrolled teardrops, `#FFF4C2` → `#FF9A3D`, 0.05 m tall, 1.2 Hz sway, emissive ≤ 0.8, no Light component) lags opposite your movement on a spring and gutters sideways for 0.3 s when you croak. |
| 54 | `skin_candlelight` | Candlelight | Skin | Ivory `#F3EBDD` with a warm shade `#E8C9A0` and a soft sheen (gloss 0.45); melt-bead ridges on the shoulders as a shading pattern (no geometry); belly `#FFF4E0`. Markings: amber runnels `#E8A33D` running downward (15%), glowing like candlelight as your Glow Level rises. |
| 55 | `croak_match_strike` | Match Strike | Croak voice | Tap: a 30 ms match-strike "fsst" (noise band-passed 3–6 kHz) that catches into a warm hollow croak (sine plus 3rd partial, formant 700 Hz), decay 220 ms, with a quiet crackle tail (sparse pops over 40 ms). Sustain: a warm hum with 2–4 random crackles per second. |
| 56 | `tongue_wick_cord` | Wick Cord | Tongue trail | A braided cotton cord (3 twisted strands, `#CDB892`); the tip is a tiny lit wick with a 0.02 m flame (the same flame shader); 6 ember motes `#FFB347` (0.3 s) per lash. |

**Set 2 · `set_teacup` · Teacup Set** [MUST-B, stub; price set at launch]. The frog-in-a-teacup look (hero_2 §7): cosy, merch-ready.

| # | id | Name | Slot | Visual |
|---|---|---|---|---|
| 57 | `hat_teacup` | Teacup | Hat | A porcelain teacup (lathe; rim 0.10 m, 0.06 m tall) `#F7F4EE` with a blue rim band `#3E6FB0` and a torus-segment handle, on a 0.14 m saucer. The tea surface `#C9853F` tilts ±8° with your acceleration; 3 steam ribbons (`#F4EDE3`, alpha 0.3, one per 0.5 s, rising 0.2 m); a paper tea-bag tag `#F2B134` dangles over the rim on a 3 Hz spring. |
| 58 | `skin_porcelain` | Porcelain | Skin | Glossy white `#F7F4EE` (gloss 0.6) with fine crackle-glaze lines (voronoi edges 0.002 m, `#C9CED6`). Markings: blue willow-pattern brush swirls `#3E6FB0` (`swirl`; 16%), which take your glow colour as your Glow Level rises. |
| 59 | `croak_kettle` | Kettle | Croak voice | Tap: a round "hoo" (sine plus 2nd partial, formant 800 Hz) with a whistle layer an octave up fading in over 150 ms, decay 250 ms. Sustain: a kettle whistle at the octave with ±10 cent flutter, 6 dB under the base. |
| 60 | `tongue_ribbon` | Ribbon | Tongue trail | A flat satin ribbon 0.035 m wide along the tongue spline, 1 twist per metre, `#9CC8FF` with a sheen; a bow at the tip (0.05 m, two loops and two tails) whose tails flutter for 0.4 s after each lash. |

**Paid never sells light.** No Supporter item is a Glow colour or changes belly glow, fireflies, markings brightness or the Crown glow. Growth is light (D §2), and growth is never for sale.

### 6.5 Counts

| Source | Hat | Skin | Glow | Croak | Tongue | Emote | Door | Snap | System window | Tadpole ghost | **Total** |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Default | 0 | 1 | 1 | 1 | 1 | 4 | 1 | 1 | 1 | 1 | **12** |
| Pearls | 5 | 5 | 4 | 2 | 2 | 2 | 2 | 2 | 0 | 0 | **24** |
| Prestige | 9 | 0 | 0 | 0 | 1 | 2 | 1 | 0 | 2 | 1 | **16** |
| Supporter | 2 | 2 | 0 | 2 | 2 | 0 | 0 | 0 | 0 | 0 | **8** |
| **Total** | **16** | **8** | **5** | **5** | **6** | **8** | **4** | **3** | **3** | **2** | **60** |

**By milestone:** [MUST-A] 25 (10 defaults, 12 Pearl items, 3 prestige hats) · [MUST-B] +34 (2 defaults, 12 Pearl items, 12 prestige, 8 Supporter) · [LATER] +1 (Moon Crown), plus §6.7.

### 6.6 Class markings (earned-only prestige, not equippable items)

FO §4.2 gives each class "its body markings" and FO §8.3 lists them as earned-only prestige. They are not in the 60 because you never equip them: **markings never lie.** While you are a class (chosen as a starting form, or revealed in-climb by a secret quest), its pattern replaces your skin's marking mask, drawn in your skin's marking colour, and lights with your Glow Level like any marking (coverage 12–20%). The reveal banner `Pip's frog changed: ECHO TOAD` plays over a 0.6 s morph of the old pattern into the new one. 04 owns the classes; 09 may restyle these patterns.

| Class | Marking pattern (outside the saddle) |
|---|---|
| Tree Frog (open) | A 0.012 m lateral stripe from eye to hip on each side, and a dot on each toe pad |
| Bullfrog (open) | A band around the throat sac, and two ridge lines beside the saddle |
| Dart Frog (open) | Three bold bands wrapping each flank |
| Mime Frog | A pale band across the eyes, and one "tear" line under the right eye |
| Echo Toad | Three concentric arcs on each flank, like sound waves |
| Horned Frog | Upward chevrons on the flanks, and a horn mark over each eye dome |
| Glass Frog | An outline of the belly window, and a small heart shape at the chest |
| Lily Walker | Notched lily-pad discs on the thighs and forearms |
| Bell-Eater | A bell silhouette on each cheek, and a line down the throat |

### 6.7 Later earned-only items (not in the 60)

| Item | Unlock | Visual (one line) | Tag |
|---|---|---|---|
| `hat_snail_shell` Snail Shell | 16 Cleared Bestiary pages (the full Well has ~24; FO §4.3) | A spiral shell helmet `#C9A27A` with growth rings, opening to the back | [LATER] |
| `hat_beetle_pal` Beetle Pal | 20 pages | A 0.05 m iridescent bell-beetle `#2F6FD0` perched on your head, rubbing its legs | [LATER] |
| `hat_open_book` Open Book | 24 pages (a complete Well Bestiary) | A tiny leather book worn open like a tent, with a ribbon bookmark `#FFD76A` | [LATER] |
| `hat_paint_chip` Paint Chip | First surfacing of the Sky (WORLD §3.2 surfacing reward, re-homed as a hat) | A curled flake of the painted sky dome, pastel `#BFD8F2` with a painted cloud, worn tilted | [LATER] |
| `hat_meteor_iron` Meteor Iron | First surfacing of Space | A rough iron nugget `#4A4E57` with one faint blue vein `#9CC8FF` (emissive 0.2) | [LATER] |
| `hat_knot_glass` Knot Glass | First surfacing of Beyond | A clear glass knot sculpture with a tiny slow galaxy inside | [LATER] |

In molts that cover the head (the Space layer's Moon Toad helmet), the hat renders **inside** the helmet at 85% scale: a hat in a fishbowl [LATER].

---

## 7. The Mirror (equip, try-on, wishlist)

### 7.1 Where and when [MUST-A]

- **The hub Mirror** stands by the black water in `hub_well_bottom`; **the Landing Mirror** is a station on `landing_well`. 07 places both.
- **It opens** at the first Keeper clear or at the end of the first climb, whichever comes first. Before that, walking up to it shows only your reflection. Shopping is not one of the 5 systems before the Keeper (D §5, §8.3).
- **In a climb** the Landing Mirror appears from the Keeper Landing in the first climb, and at every Landing after that. It offers equip, try-on, wishlist and Pearl purchases. **The Landing never waits for anyone in the Mirror:** its 40 s keeps running and the timer stays on screen.
- **Supporter items** appear only in the hub Mirror (§9.3).

### 7.2 Try-on: the Mirror is a toy, not a catalogue page

1. Walk up and press **Tongue** (Interact). The camera eases in 0.35 s to a front three-quarter close-up of your frog (distance 1.4 m, FOV 35) "in the reflection"; the world dims 30%.
2. A UI Toolkit panel fills the right 40% of the screen: tabs for the 8 slots plus the 2 earned-only extras, a 3-column tile grid, the Featured strip on top, Pearls bottom-right, and the buttons **Equip · Buy · ☆ Wishlist · See on Rivals · Outfits** (plus **Get on Steam** on Supporter tiles in the hub).
3. **Selecting any tile, owned or not, tries it on at once**, with a slot-specific preview:

| Slot | Preview |
|---|---|
| Hat | Drops from 0.3 m onto the socket, 12% squash on landing, a "pop" |
| Skin | Wipes on from head to feet in 0.35 s |
| Glow colour | The belly steps Lv1 → Lv10 → Lv1 in 2.0 s, so you see every level's look (preview only) |
| Croak voice | One tap, then 1 s of sustain |
| Tongue trail | Lashes a fly 3 m away |
| Emote | Plays |
| Door-entrance | Plays under a small door-frame prop |
| Betrayal Snap | Plays on a dummy Vex with a fake crimson thread, at full Cam timing |
| System window | Shows `[ BOON ] Shatter Croak. Because: you froze while it looked.` |
| Tadpole ghost | Swaps in and swims one loop |

4. **Three lighting presets** (one tap each): *Rule room* (dark, with one self-lit tell prop), *Landing* (warm lanterns `#FFB86B`), *Rim* (open daylight). Players see how an item reads in the dark before they spend.
5. Unowned try-ons wear a `TRYING ON` tag and revert when you leave. Other players never see try-ons.
6. **See on Rivals** lines up 3 Rivals wearing the item beside you, so you see it in a crowd. It is offered on earnable items only, because Rivals never wear paid items (§13).

### 7.3 Tile states

Owned · Equipped · ☆ Wishlisted · Affordable (price in white) · Not yet (price muted, plus "N more Pearls") · Prestige (its exact rule and a deterministic progress bar) · Supporter (the real Steam price, or "Owned").

**No tile ever shows** "limited", "leaving soon", a timer, a was/now price, a discount, a percentage of owners (except a real Steam achievement figure, §6.3), or who else bought it.

### 7.4 Featured shelf: replaces the daily rotation

The GDD's daily-rotating shop and its 24 h Bargain are cut, and its Vault list becomes the wishlist (§7.5; D §8.3; FO §8.3: a rotation on earned currency "earned nothing and only built a check-in habit"). **Every item is buyable at any time.** Featured is 3 tiles chosen **from your play, never from the clock**:

1. **Seen this climb:** an unowned earnable item a Rival wore in your last climb (`Kestrel wore this`). Never a Supporter item, and never a friend's name (§12.2 rule 8).
2. **Closest:** your wishlisted item nearest to affordable; if the wishlist is empty, the cheapest unowned Pearl item.
3. **New:** an item from the latest free update you haven't viewed yet; if none, a seeded unowned prestige item with its rule (curiosity: "how do I get *that*?").

The shelf changes only when you finish a climb or install an update. Nothing on it is cheaper, rarer or leaving.

### 7.5 Wishlist and the results bar

- **☆ Wishlist** any item, no limit (the GDD Vault list becomes a wishlist, FO §8.3). The icon is a star, never ♥, because ♥ is the Heart-door suit.
- **Results bar** [MUST-A, proposal to 04, who owns the ceremony]. During step 2 (Wish Coins count up into Pearls), a thin bar under the Pearl total fills toward your first wishlisted Pearl item (or, with an empty wishlist, the cheapest unowned one): `Acorn Cap · 120 / 150`. If the count-up crosses the price, a soft chime and `[ AFFORDABLE ] Acorn Cap.` There is **no buy button in the ceremony**; buying happens in the Mirror. A near-miss here is honest because the bar fills deterministically (FO §4.4). If 04 declines, the bar lives in the Mirror only.

### 7.6 Collection and outfits

- Each tab shows its count and the Mirror header shows the total; at launch, for example, `Hats 5 / 13` and `Collection 23 / 51`. **The count covers only earnable items in the build** (defaults, Pearl items, prestige). Supporter items sit in their own row and count toward nothing. There are no completion rewards.
- **Outfits** [MUST-B]: 4 saved loadouts, one tap to wear a whole outfit.
- **First wear pays a laugh:** the first time you wear a new hat into a climb, one Rival comments on it (§13.2).

---

## 8. Pearls and pacing

### 8.1 Prices and earning

- **Prices (FO §4.3):** Common 150 · Rare 400 · Epic 900 · Legendary 2,000. They are never discounted and never raised.
- **Earning (04 §10.4 owns the numbers; quoted here for pacing):** Wish Coins held at the end ÷ 2, +10 per floor reached, +20 per new Bestiary page. A later Full Climb pays **90–160 (median ~130)** and a later Quick Climb **50–80**, on failure too; first climbs pay more because every page is new. **+50 once** on first surfacing (D §8.2 #17). **Well-Rested** doubles Pearls for your next 2 climbs (FO §8.4).
- **Pearls never** expire, cap, get sold, convert to or from money, get taken by betrayal (FO §5.2), or gate play.
- **Published:** the help page "How Pearls work" states the earn rules in plain sentences, with every number bound to `Economy.json` so the text can't drift from the data (§17 C3, C14). Formulas never appear on the HUD.

### 8.2 Pacing (greybox; payouts from 04 §10.4)

| Moment | Pearls banked (typical) | What you can have |
|---|---|---|
| First Keeper, ~10:40 | 0 until the results | **Bell Cap** (free); the Mirror opens |
| First Quick Climb, resting at the Keeper (~11 min) | **~208** | Your first Common, in the first session |
| First Full Climb, ★1 (~22:30) | **~348** (8 new pages + the one-time 50) | **Rim Stone**, and two Commons, or a Common with most of a Rare |
| Climbs 2–4 | ~600–750 cumulative | A first Rare |
| ~7 later Full Climbs | ~1,000+ | A first Epic |
| ~15 later Full Climbs | ~2,000+ | A first Legendary |
| The whole Pearl catalogue (24) | 12,800 | ~95 Full Climbs at ~130 each; Well-Rested and a later free pass track shorten it |

**Pacing rules:** a new Common is always within 1–2 Full Climbs; no single item costs more than ~15 later Full Climbs (about 6 hours). If telemetry shows either rule broken, raise yields or add cheaper items; never raise prices (§8.1).

---

## 9. Supporter Sets: paid Steam DLC

### 9.1 What is sold [MUST-B, as stubs; prices set at launch]

- **Two sets at launch** (§6.4), 4 pieces each. **Target $3.99 each**, inside FO §8.2's $2.99–4.99 band; the final price is set at launch (D §7).
- **Supporter Bundle:** both sets as a Steam bundle at about 15% off, with Steam's complete-the-set pricing for owners of one set. The base game's **gift 4-pack** is the other bundle (FO §8.1).
- **LATER:** at most one new paid cosmetic product per free layer update (§14).

### 9.2 Mechanism (D §8.2 #20)

- Each set is **one Steam DLC AppID**. Ownership: `SteamApps.IsDlcInstalled(dlcAppId)` at boot and on `SteamApps.OnDlcInstalled` (Facepunch.Steamworks).
- **Buying:** the hub Mirror's **Get on Steam** calls `SteamFriends.OpenStoreOverlay(dlcAppId)`. Nothing is bought inside the game's own UI. On install: `[ SUPPORTER ] Candle-Toad Set. Thank you.` and the 4 items appear as Owned.
- **Not used:** ISteamMicroTxn (it needs a server), Steam Inventory (it creates a trade market), item trading, Unity IAP (`com.unity.purchasing` is removed, D §12).
- **Offline and LAN:** the profile caches `ownedDlc {appId: lastVerifiedUtc}`. The cache is honoured for 30 days without Steam and re-checked whenever Steam is up; a failed check removes it.
- **Other players' paid items** render for everyone. There are no servers, so the host does not verify licences; a pirated hat changes nobody's play. [SHOULD] If the Facepunch wrapper exposes `UserHasLicenseForApp` after `BeginAuthSession`, the host may check and silently fall back to defaults (10 confirms).

### 9.3 Presentation rules

1. The Supporter row is one row at the bottom of the **hub** Mirror. It never appears in a climb, at a Landing, in the results ceremony, on loading screens, in popups, or in the demo.
2. **Nothing marks who paid:** no badge, no name-tag change, no Rival comment on paid items.
3. **Rivals never wear Supporter items** (§13).
4. **Paid never outclasses earned:** Supporter items are capped at the Epic craft budget (§4), and they never sell light (§6.4).
5. Steam's own seasonal discounts are fine; the game never announces a sale.
6. Refunds follow Steam's policy.

---

## 10. The non-expiring pass [LATER; not at launch]

**Status.** There is no pass at launch (FO §8.2; D §8.1). This section is the ready spec if one is ever added, so that nobody reinvents the cut GDD pass.

### 10.1 Gate (all must hold, plus the user's sign-off)

1. Milestone B has been live for at least 90 days.
2. "Worth it?" Yes is at least 60% over the last 30 days, and next-day voluntary return is not falling.
3. It ships with a free named layer update, and **that update ships no new Supporter Set.** One paid cosmetic product per update: no stacking (FO §8.2's ethics finding).
4. Tests P1–P5 (§17) pass.

### 10.2 Shape

- **One pass per layer**, called in plain words ("the Sky pass"). It is not a new noun.
- **20 steps.** Progress is **doors reached** in any climb, with any outcome, in any mode that plays doors, solo included; each door number counts once per climb. **One step = 20 doors**, one Full Climb's worth, so 20 steps ≈ 20 Full Climbs ≈ 8 hours. No multipliers of any kind.
- **Never expires.** Every layer's pass stays progressable and purchasable forever. Your progress counts from the day the pass shipped, whether or not you buy.

| Track | Who | Rewards |
|---|---|---|
| **Free track** | Everyone | 10 rewards on even steps: +60 Pearls on steps 2, 4, 6, 8, 12, 14, 16 and 18 (480 in all), an emote at step 10, a hat at step 20 |
| **Supporter track** | One Steam DLC, at most $4.99 | 10 items on odd steps: Betrayal Snap (1), emote (3), tongue trail (5), door-entrance (7), croak voice (9), Betrayal Snap (11), skin (13), emote (15), door-entrance (17), hat (19). **Buying unlocks every step already reached, at once.** |

**FO §8.2's five guardrails, each a test:** it never expires (P1); no step skips, no boosters, nothing sold speeds progress (P2); progress comes from lost and solo climbs too (P3); the Supporter track pays no Pearls or anything toward another pass (P4); it never contains a Pearl-catalogue or prestige item (P5). Pass items get their own ids and a `passId` source (§5), and free-track items stay earnable forever through the free track.

---

## 11. Event items [LATER]

FO §8.3: event cosmetics "return within 45 days or through an archive challenge". KNOTWELL uses the stronger form:
- Events ride a free update or a free weekend. **Event items are earned by play, never sold.**
- The event shows its end **date**, never a countdown (§17 C4).
- When it ends, each item gets an **archive challenge** in the Mirror, available forever: a play goal such as "Clear 5 Heart doors by the co-op answer". **No event item is ever gone for good.**

---

## 12. What is never sold, and the ethics rules

### 12.1 Never sold (FO §8.2; D §8.3)

- Power, XP boosters, Pearl boosters, fireflies, Wish Coins, Pearls.
- Rerolls, keys, revives, jars, Team Lives, Boons, classes, talents, Tower Rank.
- Skips of doors, pass steps or layers. Layers themselves ship as free named updates (FO §8.1).
- **Any randomness:** no loot boxes, capsule draws, mystery packs or random drops. Jars never hold cosmetics.
- **Any currency.** Nothing is sold as a currency, and nothing converts money into Pearls.
- Energy, timers, waits.
- Information: hints, Bestiary tips, rule text, Twists.
- **Light:** Glow colours, or anything that changes the belly glow, fireflies, markings or Crown glow.
- Prestige items and Pearl-catalogue items.

### 12.2 The retention ethics rules (each has a test or a telemetry check)

1. **Cosmetic only** (§3). Nothing changes play, odds, speed of progress or information (FO §8.2).
2. **No paid randomness.** Nothing random is sold, anywhere.
3. **Direct prices in real money**, through Steam only.
4. **Earned and paid never overlap** (C6). Paid is capped at the Epic budget, Rivals never wear it, and nothing marks who paid.
5. **Generous, published earn rates that are never cut** (FO §8.3). A change may only lower prices or raise yields (C14).
6. **No clock pressure.** No daily rotation, no limited-time Pearl items, no countdowns in the Mirror at all, no "leaving soon", no was/now prices (C4).
7. **No streaks, login rewards or daily bonus.** Well-Rested rewards breaks instead (FO §8.4).
8. **No nudges.** No purchase popups, no out-of-game notifications, no friend names in any pull ("Pip bought…" never exists), no sale banners.
9. **The demo sells nothing but the game.**
10. **Betrayal never takes Pearls or cosmetics** (FO §5.2), and betrayal-side prestige never rewards Cutting (§6.3).
11. **Grind never splits friends.** No cosmetic is needed for any mode, lobby or difficulty.
12. **Kids and ratings.** Purchases happen only in the Steam overlay, where Steam's family controls apply. No gambling imagery near cosmetics (jars have no reels, FO §8.2).
13. **"Worth it?" outranks revenue** (§16 revert rule).

---

## 13. Rivals wear the catalogue

### 13.1 Loadouts [MUST-A with fallbacks; full in MUST-B]

Rivals are the shop window that isn't a shop: you see items **in play**, on frogs you laugh at, before you open the Mirror (FO §5.3; CRIT #27 "make every Rival look purchasable").

**Rules:**
- Rivals wear only **default, Pearl and prestige** items, never Supporter or pass items (C12).
- Every Rival wears at least 2 catalogue items, so every Rival look is obtainable.
- A Rival wears only items that exist in the current build. The demo uses the **A fallback** column, so the demo never shows an item the demo can't give you ("the System never lies").
- Seat Hue comes from the seat, not the Rival. 03 owns who they are, their species features (for example Gutter's scars) and their lines.

| Rival | Hat | Skin | Glow colour | Other | A fallback | Why |
|---|---|---|---|---|---|---|
| Moss | Acorn Cap | Speckled Egg | Mint Fizz | Pond Croak | — | The steady helper |
| Vex | Quicksilver Bowler | Honeycomb | Sunset | Scissor Snip | Hat → Well Bucket; no Snap | The opportunist wears his Mimic win |
| Pell | Explorer's Pith Helmet | Pond Lime | Moonlight | — | — | The scholar has read 4+ pages |
| Lumen | Moth Antennae | Crystal Frog | Aurora | — | Hat → Heron Feather; skin → Stained Glass | The lone wolf in the showpiece Legendary |
| Brother Brass | Bell Cap | Pond Lime | Sunset | Belly Drum | No emote change | The captain beat the Keeper first |
| Kestrel | Traffic Cone | Strawberry Jeans | Firefly | Firework Lash, Big Splash | Trail and door → defaults | "Watch this!" |
| Maud | Paper Boat | Stained Glass | Sunset | Opera Curtain | No Snap | The charming liar makes an entrance |
| Pip | Three on a Pad | Speckled Egg | Mint Fizz | Candy Stripe, Firefly Confetti | Hat → Acorn Cap; others → defaults | The helper always takes the co-op answer |
| Ines | Heron Feather | Strawberry Jeans | Moonlight | Spring Peeper | Croak → default | The speedrunner, sleek |
| Gutter | Bounty Hunter | Pond Lime | Firefly | Redacted | Bare head; door → default | The returnee has survived Hell |

### 13.2 Hat barks [MUST-B; lines proposed to 03]

At most one per climb, and only the first time you wear a new hat into a climb. They serve the onlooker chorus (FO §5.3): the look gets a witness.

| Rival | Trigger | Line |
|---|---|---|
| Kestrel | You wear the Traffic Cone | "Hey! That's *my* look." |
| Moss | Any Bestiary hat | "You've been reading. Good." |
| Vex | The Bell Cap | "Cute. The Keeper's hand-me-down." |
| Maud | Any Legendary | "Oh, sweetie. That must have taken ages." |
| Brother Brass | The Rim Stone | "You carried a piece of the Well out. I respect that." |
| Gutter | The Bounty Hunter | "You. Again. Nice star." |
| Pip | Any other new hat | "Ooh! Can I try it on?" |

---

## 14. Price and launch plan

| When | Paid | Free |
|---|---|---|
| **Milestone A: the free demo** (Next Fest vehicle, D §7) | **Nothing.** No Supporter row, no Steam store links. | The Quick Climb; the Mirror with 12 Pearl items, the Bell Cap and 2 Bestiary hats. [SHOULD] Demo Pearls, items and Bestiary carry into the full game through the same local save folder (10 confirms). |
| **Launch: Milestone B** | Base game **$7.99** plus a **gift 4-pack** (FO §8.1). 2 Supporter Sets as DLC (target $3.99 each; set at launch) and the Supporter Bundle. | All 24 Pearl items, 15 prestige items, the defaults. |
| **Each free named layer update** [LATER] | **At most one** new paid product: a Supporter Set (≤ $4.99) **or** that layer's pass (≤ $4.99, §10), never both. | +8–12 Pearl items, the layer's surfacing hat, new Bestiary hats, and a free weekend (FO §8.1). |
| **Steam seasonal sales** | Steam's own discounts on the game and DLC | — |

**Revenue, honestly.** The $7.99 base game carries the business. Supporter attach will be low: WEBTOON's paying share is about 1.5% outside Korea (RR), a different medium, so treat it only as an order-of-magnitude hint. The shop is never tuned to raise attach.

---

## 15. Store page and capsule notes

1. **Timing.** No frog-only public art before Gate A passes (D §2): no capsule, DLC capsule, trailer or store copy. The DLC pages go live with the launch build.
2. **Positioning.** Store copy leads with the well reveal, the monster doors and betrayal (D §2 positioning rules). Cosmetics are a supporting line, never the headline.
3. **Cosmetics copy** (after Gate A): *"Hats. So many hats."* · *"Earn every cosmetic by playing. Two optional Supporter Sets on Steam. No loot boxes. Nothing random for sale. No currency to buy."*
4. **Screenshots.** One of the store screenshots is the **hat lineup**: 8 frogs in 8 different hats on a warm Landing, the Mouth wide overhead (attraction plus scale). The capsule itself keeps FO §6.4's single focal point; whether that frog wears a hat is decided by the capsule A/B test.
5. **Each Supporter Set DLC page:**
   - its own capsule set on FO §6.4 rules: one focal point (a frog wearing the set's hat), readable at 120 × 45 px, large title text;
   - 4 screenshots of the set in a dark rule room, on a warm Landing, on the Rim and in a Betrayal Cam;
   - a plain list of the 4 items and the line *"Cosmetic only. Supports development."*;
   - capsule sizes from the current Steamworks asset checklist at upload time (header, small, main and vertical capsules).
6. **Ratings and disclosures.** Declare in-game purchases (DLC only) in Steam's content survey. Expect the IARC "In-Game Purchases" notice; the game never qualifies for "Includes Random Items", because nothing random is sold.
7. **Trailer.** Hats appear worn in play (the trailer's frogs wear catalogue items). The trailer never shows a shop screen (FO §6.4 beat list unchanged).

---

## 16. Telemetry and the "Worth it?" revert rule

Opt-in, no personal data; 10 owns the transport (D §12).

**Events [MUST-A]:** `mirror_open{context}`, `tryon{item}`, `wishlist_add{item}`, `buy_pearls{item, rarity, pearlsBefore, climbsPlayed}`, `equip{slot, item}`, `prestige_unlock{item}`, `featured_click{tile}`. **[MUST-B]:** `dlc_overlay_open{set}`, `dlc_owned{set}` (at boot).

**Health checks (greybox targets, not goals to maximise):**

| Check | Target | If missed |
|---|---|---|
| Players who surface and buy a first Pearl item in the same session | ≥ 60% | Add a cheaper first item, or ask 04 to raise yields |
| Median Full Climbs between purchases, first 10 climbs | ≤ 3 | Raise yields; never raise prices |
| Players holding > 2,000 unspent Pearls | watch; ≤ 30% | The catalogue lacks appeal: add or restyle items |
| Try-on → buy conversion per item | find dead items | Restyle the bottom 3 each update |
| Human frogs wearing a non-default hat by climb 5 | ≥ 70% | Hats aren't attractive enough; revisit Common hats |
| Supporter attach | observe only | No target, ever |

**Revert rule (FO §8.5).** Any shop or cosmetic change that raises session length, purchases or Supporter clicks while lowering "Worth it?" or next-day voluntary return is reverted.

---

## 17. Enforcement tests (EditMode; each fails the build)

**FO §8.6, as it applies here:**

| id | The build fails if… |
|---|---|
| **C1** | A cosmetic definition references a gameplay stat or a random table. The schema rejects any field it doesn't define, and a scanner rejects any string under `visual` that names `speed`, `spots`, `range`, `fireflies`, `xp`, `rank`, `odds`, `chance`, `weight`, `random`, `drop`, `loot`, `grant`, `reroll`, `revive` or `lives`. |
| **C2** | Any purchasable item (Pearl, Supporter or pass) grants in-climb currency, keys, rerolls or revives. |
| **C3** | A System text template contains "%" without a bound data key. |
| **C4** | Any shop UI shows a countdown under 24 h. Stricter here: the Mirror's UXML and assembly may not reference any countdown or timer element at all. |
| **C5** | An imported or generated asset has no row in `licenses.csv`. |

**Added by this file:**

| id | The build fails if… | Tag |
|---|---|---|
| **C6** | A Supporter or pass item shares an id, mesh, pattern-parameter hash or croak-recipe hash with any default, Pearl or prestige item. | [MUST-B] |
| **C7** | Any colour in any cosmetic definition (HSV saturation ≥ 0.2 and value ≥ 0.2) is within 15° of hue of the betrayal crimson in `presentation/palette.json`. | [MUST-A] |
| **C8** | A readout is counterfeited: a hat has an emissive part larger than 0.06 m or any orbit animator; a Glow colour definition has an intensity field; a skin's marking coverage (4,096 body samples) is outside 12–20%; the saddle's pattern contrast is above 0. | [MUST-A] |
| **C9** | A hat breaks the §3.3 envelope or keep-outs (vertex test against the frog prefab's `SOCKET_*` empties and eye-dome spheres), a tongue tip exceeds 0.06 m, or any triangle or particle budget (§3.4) is exceeded. | [MUST-A] |
| **C10** | A display name, in any locale, contains a class name or a retired word (D §10). | [MUST-A] |
| **C11** | A Pearl price is not in {150, 400, 900, 2000} or doesn't match its rarity; a Supporter or prestige item has a Pearl price. | [MUST-A] |
| **C12** | A Rival loadout names a missing, Supporter or pass item, or an item absent from the current build. | [MUST-A] |
| **C13** | A cosmetic's emissive or luminance curve changes by more than 10% faster than 3 Hz (curves sampled at 60 Hz). | [MUST-A] |
| **C14** | A published Pearl yield in `Economy.json` is lower, or a price higher, than in the last shipped version ("never cut"). | [MUST-B] |
| **C15** | [SHOULD] PlayMode on the desktop through the Unity CLI: 8 frogs at 25 m with seeded random loadouts, at 3/2/1 spots and Lv1/5/10. Spot pixels must reach ≥ 90% of the plain-frog baseline, and the halo detector must fire only at Lv10. | [SHOULD] |
| **P1–P5** | Pass guardrails (§10.2): an expiry field exists; any progress is purchasable; progress ignores lost or solo climbs; the Supporter track holds a currency; a pass contains a Pearl or prestige id. | [LATER] |

---

## 18. If the Wick ships instead (D §2 fallback)

Every item is written against `IHeroBody` sockets and shader blocks, so the catalogue survives a hero swap as data. The Wick is a second implementation of the same interface.

| Frog slot | On the Wick |
|---|---|
| Hat | The Wick's own `hat` socket, as its `IHeroBody` defines it |
| Skin | Body pattern; the pattern ops are unchanged (Honeycomb, Speckled Egg and Stained Glass began as candle patterns in GDD §12.4) |
| Glow colour | Flame colour, under the same hue rules and the same level-driven brightness |
| Croak voice | The flare-pulse sound, same recipes |
| Tongue trail | The thread-lasso trail |
| Emote, door-entrance, Betrayal Snap, System window | Unchanged |
| Tadpole ghost | The Wick's dark form |
| Candle-Toad Set | Flips to the frog side: the hat becomes a small frog figurine perched by the flame, and the skin a frog-green pattern. The frog stays in the game as the Revelation silhouette, the hub statue and this line (D §2). |

---

## 19. Open questions

1. **The computed brief asked for a daily rotation and a season pass; DECISIONS cuts both for launch.** D §8.3 cuts "the daily-rotating shop", and D §8.1 keeps FO's "no pass at launch". I followed D: there is no rotation (§7.4's Featured shelf is keyed to play instead), and the non-expiring pass is specified as [LATER] behind a gate that needs the user's sign-off (§10). If the user wants a pass at launch, D §8.1 must change first.
2. **Name collision: "Legendary".** FO §4.3 names the top Pearl price band "Legendary", and Legendary is also a Boon rarity (glossary #20). I kept FO's word. A rename (for example back to "Gilded") would avoid the clash but reintroduces a word; the chair decides.
3. **"Never contains an earned item" (FO §8.2).** I read it as "never locks a Pearl-catalogue or prestige item behind the pass". The free track then has its own items, earned by play. If the stricter reading is meant (a free track with Pearls only), drop the step-10 emote and step-20 hat.
4. **Assumptions owned by other files:** frog height H = 0.60 m and the socket positions (02); 4 emote spokes on the Wheel (02/03); the final betrayal crimson hex (09; 03 and GDD disagree by 2°, and this file clears both); the results-bar line in ceremony step 2 (04); demo save carry-over and the licence check on other players' DLC (10).
7. **`economy/cosmetics.json` scope.** 10 §4.1 lists it as "24 earned". This file puts all 52 non-paid records there (defaults and prestige included), so one validator covers them. 10 should widen the row, or add a `prestige.json`.
5. **Candle-Toad as paid.** It is the strongest homage to the old design and so a good Supporter Set. Some players may feel a homage belongs in the earned catalogue. The alternative is to swap it with an earned Legendary and make a different second paid set.
6. **The Supporter price** ($3.99 target) and the bundle discount (~15%) are proposals. D §7 sets prices at launch.
