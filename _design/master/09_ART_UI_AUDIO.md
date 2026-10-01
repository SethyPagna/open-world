# 09 · ART, UI AND AUDIO

**KNOTWELL** · "Climb together. Fall alone." · Version 1.0 · 2026-09-29 · **Status: BINDING** for the look, the screens and the sound.

**Authority.** The user's words, then `DECISIONS.md` (**D**), then `_design/FUN_OVERHAUL.md` (**FO**, as amended by D §8.2), then the tech report (**UT**) and the research report (**RR**). GDD, WORLD and CRIT are a parts bin.

**This file owns** (D §9):
- final colour values (`presentation/palette.json`), including the **8 Seat Hue hexes** and the **betrayal crimson**;
- the toon look: ramp, rim, outline, glow chalk, fog, skies, post (bloom, SSAO, grading LUT, vignette);
- lighting recipes per layer and per room mood;
- monster and Rival art direction, and the art side of the frog;
- the procedural animation checklist for monsters, props and UI, plus the juice values for the frog;
- the Shuriken VFX list;
- Cinemachine 3 camera values and Impulse presets;
- the juice rules (`presentation/juice.json`);
- the System window look, UI tech, fonts and a wireframe of every screen;
- accessibility;
- audio: music per state and layer, the pentatonic croak system, positional cues, the SFX list with sources, the mixer (`presentation/audio_cues.json`);
- the logo, capsule and trailer spec.

**Other files own** (this file follows them and never restates their rules):

| Topic | Owner |
|---|---|
| World geometry, the Mouth's angles, ★1 choreography and timings, the map's geometry | `01_WORLD.md` |
| Frog proportions, rig, sockets, `IHeroBody`, spot and Glow rules, Seat Hue *rule*, hero motion numbers | `02_HERO_AND_CONTROLS.md` |
| System voice rules and line library, Betrayal Cam sequence, WANTED poster, the Wheel, Rival personalities and species | `03_SOCIAL_AND_BOTS.md` |
| Glow readout targets per level, Boon marks, results ceremony order, rank-up beats, jars, stall, Bestiary pages | `04_PROGRESSION_ECONOMY.md` |
| Room specs, each room's cue, plaque fields, per-room Definition of Done | `05_ROOMS_SLICE.md` |
| Hub, Landing and Meeting-room layouts and flows, the never-idle rules | `07_HUB_AND_MINIGAMES.md` |
| Cosmetic slots, catalogue, the Mirror's behaviour, Rival loadouts, rarity colours | `08_COSMETICS_SHOP.md` |
| URP asset plumbing, assemblies, generators, validators' code, budgets' enforcement | `10_UNITY_TECH.md` |

**Tags.** [MUST-A] Quick Climb and free demo · [MUST-B] Full Climb, ★1, the Rim and climb 2 · [SHOULD] · [LATER]. In tables and short labels, [A] means [MUST-A] and [B] means [MUST-B]. A section tag applies to every row in it unless a row says otherwise.

**Numbers.** Every number in this file is a **greybox hypothesis (GB)** unless it carries a source key (FO §x, D §x, 0x §x) or says "verified". GB numbers live in JSON and are tuned in playtest. Pixel sizes are at the **1920 × 1080 reference**; UI scales with screen height.

**Words.** Glossary spellings from D §10. The task's "codex" screen is the **Bestiary**; the "wardrobe" and "shop" are **the Mirror** (Pearls) plus the Landing **stall** (Wish Coins).

**Why this file matters for fun.** It carries five felt things, and every rule below serves one of them:
1. **You can see yourself get stronger.** Growth is light on your body (D §2), and it blooms.
2. **Danger is readable in the dark.** Every tell glows on its own, sounds from where it is, and is captioned (FO §6.2 #3).
3. **Every action feels chunky.** Hitstop, squash, shake and rising-pitch count-ups (FO §6.2 #1).
4. **The world keeps getting bigger.** The Mouth widens overhead and every sky is another well (FO §6.3).
5. **The party sounds like a band.** Every croak is a pentatonic note, so eight frogs always harmonise (FO §6.2 #6).

---

## 1. The look on one page [MUST-A]

### 1.1 One line

**A glow-in-the-dark storybook diorama.** Chunky toon frogs and monsters. Dark, cold stone rule rooms where only living things and dangers glow. Warm, loud, lantern-lit breathers and Landings. A sky that keeps getting bigger overhead.

Mood references (for feel only; copy nothing): Fall Guys' pushed colours tested at real size (RR); DOORS' one glowing cue per monster (RR); Little Nightmares-style dread, confined to rule rooms; the warmth of lantern-lit dioramas like Cult of the Lamb, whose look Unity credits mostly to lighting (UT).

### 1.2 The tone rule: dread, then a waltz (FO §2.2)

| Mood family | Where | Light | Colour | Sound |
|---|---|---|---|---|
| **Dread** | Rule doors, Heart doors, E doors, set pieces, Keeper, Warden | Dark, cold key, dense low fog | Muted environment, glowing frogs and tells | Drones, heartbeat, sparse bells; music ducks under every tell |
| **Waltz** | Breathers, toy doors, Landings, the Well Bottom, `meeting_room`, results | Warm lanterns `#FFB86B`, soft bloom | Saturated, warm | The waltz, marimba, claps, the jar chimes |

A climb alternates the two every ~1 min (FO §3.2's door mix). That swing is the rhythm; never flatten it by lighting a rule room warmly or darkening a breather.

### 1.3 Ten readability laws (tested in §17)

| # | Law | Numbers |
|---|---|---|
| R1 | **Value ladder.** Brightest to darkest: armed tells > back spots > plaques > frogs' belly and rim > interactables > environment | HDR emission: armed tell 4.0 · spot 4.0 (02 §3.4) · plaque glyphs 2.5 · belly 0.6–3.4 (04 §2.3) · interactables 1.5. Environment albedo value ≤ 0.35 in dread rooms and ≤ 0.60 in waltz rooms (HSV V) |
| R2 | **Saturation split.** Characters and tells are saturated; environments are not | Characters and tells S ≥ 0.55. Environment S ≤ 0.40 (dread), ≤ 0.50 (waltz) |
| R3 | **Reserved colours.** Betrayal crimson means betrayal; firefly gold means growth and health; System cyan means the System; reward gold means rewards | §2.2. Validator-enforced |
| R4 | **Self-lit tells.** Every cue has an emissive `TellLight`, a positional sound and a directional caption, 2–5 s before the danger (FO §3.8; 05 §2.4) | The glowing part is visible from every 3/4 camera angle. A monster whose body can hide its tell gets a second emitter on the far side |
| R5 | **The 25 m rule.** Armed tells, the 3 spots and plaque glyphs read at 25 m on the **Medium** preset (FO §2.3 Gate A; 10 §13.1) | Luminance contrast ≥ 3:1 against a 20 px ring around the target, in golden screenshots |
| R6 | **Fog never eats a tell.** | Emissive surfaces resist fog by 0.7. No fog volume denser than 0.06 within 3 m of a `TellLight` |
| R7 | **Silhouette first.** Every monster reads by outline alone in the dark | Each monster's silhouette is unique at 64 px tall (Bestiary thumbnail test) |
| R8 | **One focal point per cue.** During a 2–5 s cue window nothing else near it flashes | VFX with emission > 1.5 within 6 m of an armed tell are suppressed by `FxPool`; System windows below P0 wait (03 §14.2) |
| R9 | **Frogs never vanish.** | Your own frog and your Knot partner draw an x-ray silhouette through walls (§4.8). Every name tag carries 3 spot pips |
| R10 | **No harsh flashing.** | No full-screen luminance change > 10% faster than 3 Hz (08 §3.4 uses the same WCAG line). Whiteouts ramp ≥ 600 ms (WORLD §10.1) |

---

## 2. The colour system [MUST-A]

All values live in `presentation/palette.json` → `PaletteDef` (10 §4.2). UI reads them as USS variables (§12.3); shaders read them as global properties.

### 2.1 Global tokens

| Token | Hex | Role |
|---|---|---|
| `night` | `#0B0F14` | Page and panel backdrop, well-bottom black |
| `panel` | `#141B24` at 92% | Menu and HUD panels |
| `panel_hi` | `#1F2A36` | Hover and selected rows |
| `ink` | `#101418` | Dark text on light chips; the blame pill at 80% (03 §5.1) |
| `text` | `#F4EDE3` | Body text on dark |
| `text_muted` | `#A7A39B` | Secondary text |
| `system_bg` | `#0B1630` at 92% | **System windows only** |
| `system_line` | `#5CE1E6` | **System windows only** (border, bracket corners) |
| `glow_default` | `#FFE27A` | Default Glow colour, orbiting fireflies, loose fireflies, count-ups (02 §3.4) |
| `spot_core` / `spot_hot` | `#FFD24A` / `#FFF6D6` | Back spots only (02 §3.4). No cosmetic or UI element may reuse them |
| `growth` | `#FFE066` | Growth headers: `[ GLOW ]`, verb ranks, `[ AWAKENING ]` |
| `gold` | `#FFD84A` | Gold door plaque, Legendary Boons, Gold jar, the Crown glow sparks (04 §10.2; replaces 05's GB `#FFD76A`) |
| `bronze` / `silver` | `#C8803A` / `#C9D3DC` | Jars (04 §10.2) |
| `wish_coin` | `#EBAF3C` | Wish Coin face |
| `pearl` | `#EAF4FF` | Pearl icon (with the iridescent shader, §4.9) |
| **`crimson`** | **`#FF3D6E`** (hue 344.8°, verified) | **Betrayal only**: the Cut thread flash, the crimson tongue tip, `[ TRAITOR ]`, the WANTED stamp, the ♥ glyph, "Liar!" marks (03 §13) |
| `warn` | `#FFA630` | Room clock in its last 20 s (05 §2.4), 1-spot warning pips |
| `danger_ping` | `#FF5A1F` (hue 15.8°) | Monster pings. 03 §13 says "red"; this is the red, kept 31° from crimson |
| `ok` | `#7CE08A` | Success ticks, "Cleared" stamp |
| `goo` | `#8BE04E` | Vengeance slime (03 §11.4) |
| `wanted_paper` / `wanted_ink` | `#F2E3C2` / `#3A2A1A` | WANTED poster (03 §9.2) |
| `lantern` | `#FFB86B` | Warm key light (GDD §13.3; 05 §3.1) |
| `lantern_core` | `#FFE3B0` | Lantern flames |
| `star_anon` | `#FFF4E0` | Anonymous lantern-folk points (WORLD §4.4; 05 `br_window`) |

**Crimson is final at `#FF3D6E`.** 02 and 08 already use it; 03's reference `#E8254F` moves to it. The 15° exclusion (D §2) therefore bans hues **330°–360°** for cosmetics whenever S ≥ 0.2 and V ≥ 0.2 (08 §3.1). The one pink-adjacent colour in the game, the tongue, sits at hue 14° (02 §3.4).

### 2.2 Reserved-colour rules

1. **Crimson** appears only on the keys listed above. `PaletteUsageTests` fails the build if any other material, USS rule, VFX gradient or cosmetic uses a colour within 15° of hue 344.8° at S ≥ 0.2 and V ≥ 0.2. The ♥ plaque glyph is the one static use: it announces that betrayal is possible here (05 §3.2).
2. **Firefly gold** (`glow_default`, `spot_*`, `growth`) means growth or health. Monster tells never use hues 44°–56° at S ≥ 0.5 **on their tell part**, so a glowing monster eye can't read as a friend's spot. (The golem's eye amber `#FFB000`, hue 41°, from 05 §1.2, passes.)
3. **System cyan** (`system_bg`, `system_line`) is only the System. No HUD panel, room light or cosmetic uses a colour within ΔE2000 18 of `#5CE1E6`.
4. **Reward gold** (`gold`) means a prize: gold doors, Legendaries, Gold jars, Crown sparks.

### 2.3 Seat Hues (8)

02 owns the rule (one fixed colour per seat, colour-blind-safe, driving rim, name tag, blame tag, pings and the ghost; D §2). These are the values.

**How they were chosen (verified 2026-09-29).** An optimiser searched 311 bright candidates (CIELAB L\* ≥ 45, ≥ 25° of hue from crimson, ≥ ΔE2000 18 from System cyan) for the 8-colour set with the largest worst-case separation. It used CIEDE2000 under normal vision and under protanopia, deuteranopia and tritanopia simulated with the Machado 2009 matrices at severity 1.0. Results:
- worst pair, normal vision: **ΔE 22.7** (mint vs jade);
- worst pair, any colour-vision deficiency: **ΔE 10.3** (protanopia, mint vs lemon);
- nearest to crimson in any mode: **ΔE 13.5** (jade, deuteranopia); by hue, plum at 35° is the nearest.

Eight colours cannot all be far apart for every viewer, so **every Seat Hue also carries a shape glyph**, and the glyph appears everywhere the colour does.

| Seat | Name | Hex | Hue | Glyph | Rim gain | Tag text | Contrast on `night` |
|---|---|---|---|---|---|---|---|
| 1 | Tangerine | `#FF9933` | 30° | ● circle | 1.0 | `ink` | 9.0:1 |
| 2 | Sky | `#80CAFF` | 205° | ▲ triangle | 1.0 | `ink` | 10.8:1 |
| 3 | Mint | `#80FF95` | 130° | ■ square | 0.9 | `ink` | 15.2:1 |
| 4 | Plum | `#B23E9F` | 310° | ✿ flower | 1.6 | `text` | 3.7:1 |
| 5 | Lemon | `#FFEA00` | 55° | ✚ cross | 0.9 | `ink` | 15.6:1 |
| 6 | Cobalt | `#007ED9` | 205° | ⬢ hexagon | 1.5 | `ink` | 4.6:1 |
| 7 | Pearl | `#F2F0EA` | — | ◗ crescent | 0.8 | `ink` | 16.9:1 |
| 8 | Jade | `#24B28F` | 165° | teardrop icon | 1.1 | `ink` | 7.2:1 |

- **Seat order** gives small lobbies the most distinct colours first: seats 1–2 differ by ΔE 48 in every mode.
- **Rim gain** multiplies the rim intensity so dark hues (plum, cobalt) read as bright as light ones on a frog.
- **Glyphs** are vector icons baked by `IconBaker` (§12.5), never font characters; the symbols above are only labels. Seat 8 uses a teardrop instead of a diamond, because ♦ is a suit, and seat 4 a flower instead of a star, because stars mark hidden clears and ★1.
- **Name tag chip:** the Seat Hue fills a pill; text uses the "Tag text" column (≥ 4.4:1 contrast, verified).
- **Lemon (seat 5) sits near firefly gold** (hue 55° vs 50°). It is allowed because rims and chips never overlap the belly or spots, and the glyph separates them; Gate A checks it.

### 2.4 Suits, Boon families, rank letters and rarity

**Suit tokens** (final). They keep 05 §3.2's greybox values except ♠, which moves from `#7FD1FF` to `#7FB2FF` because the old value sat only ΔE2000 15.6 from System cyan (verified; now 26.0):

| Suit | Plaque and room accent | Glyph | Boon family colour |
|---|---|---|---|
| ♠ A Body | `#7FB2FF` | ♠ | Body `#7FB2FF` |
| ♦ B Mind | `#B79CFF` | ♦ | Sight `#B79CFF` |
| ♣ C Together | `#8CE38C` | ♣ | Chorus `#8CE38C` |
| ♥ Heart | `crimson` (glyph only) | ♥ | **Risk `#FF9E3D`** (hue 30°): Boon marks must stay ≥ 15° from crimson (04 §6.6), so the Risk family is not crimson |
| E Enigma | `#F2F2F2` with a `gold` rim | eye-in-hexagon | any family (the E door's Boon shows its own family) |
| Legendary | — | — | `gold` with a 2 s shimmer |
| Duo | — | — | thread `#C9A7FF` (04 §6.6 "violet") |

- **Rank letters** use 04 §8.3's colours unchanged.
- **Cosmetic rarity labels** use 08 §4's colours, always with the word ("RARE").
- **Suit ≠ colour alone:** every suit shows its glyph; colour is the second channel.

### 2.5 Palette validator [MUST-A]

`PaletteTests` (EditMode; 10 implements) fails the build if:
- two Seat Hues are closer than ΔE2000 20 (normal) or 9 (any simulated deficiency);
- a Seat Hue, Boon family colour, suit accent, rank letter or cosmetic hue sits within 15° of crimson's hue (at S ≥ 0.2, V ≥ 0.2);
- a Seat Hue is within ΔE2000 18 of `system_line`;
- a `crimson` reference appears outside the whitelist in §2.2;
- a Seat Hue's tag-text contrast is under 4.4:1.

The test re-runs the same colour maths as the verification above (CIEDE2000, Machado 2009 matrices), so the numbers in §2.3 stay true.

---

## 3. Rendering stack (URP 17) [MUST-A]

10 §13.1 builds the asset and presets; this section sets the values.

### 3.1 Pipeline settings

| Setting | Value | Why |
|---|---|---|
| Rendering path | **Forward+** | Many cheap lights (frog belly lights, lanterns) with no per-object limit problems (UT) |
| HDR | On, R11G11B10 | Emission above 1.0 must bloom |
| Anti-aliasing | **SMAA High** on the main camera (High, Medium); **STP** at render scale 0.77 (Low) | TAA smears thin outlines; SMAA keeps them crisp |
| MSAA | Off | Post AA instead |
| Grading | HDR grading mode, LUT size **32** | URP bakes §5's grading overrides into its internal LUT each frame; no hand-painted LUT textures |
| Tonemapping | **Neutral** | Keeps pushed hues; ACES shifts saturated brights (reds toward orange), which would move crimson and the Seat Hues |
| Main light shadows | Soft, max distance 40 m, depth bias 1.0, normal bias 1.0 | Rooms are ≤ 40 m |
| Additional light shadows | 1 per room: the room's key spot, 1,024 atlas | Frog belly lights never cast shadows (02 §3.4) |
| Probes | Adaptive Probe Volumes; scenarios `WellDay` / `WellDusk` on the shaft (10 §5.4) plus a per-room bake | Rooms bake their own mood |
| Reflection probes | One box probe per room shell, baked, 128 px | Toon surfaces need little reflection; water and the Jar glass use it |
| GPU Resident Drawer | On (static shells only; 10 §13.1) | — |
| Depth texture | On · **Opaque texture off** | Water and glass fake refraction (§4.5, §4.9) |

### 3.2 Renderer features (in order)

1. **Screen Space Ambient Occlusion** (built-in): method Interleaved Gradient; source Depth Normals; intensity and radius per mood (§5.2); direct lighting strength 0.25; samples Medium; blur Medium; downsample on at Medium. Off on Low.
2. **`KWOutlineFeature`** (Render Graph, `RecordRenderGraph`; 10 §13.2): draws the inverted-hull pass of every renderer on the `Outlined` rendering layer (§4.2).
3. **`KWEdgeFeature`** (Render Graph): depth-and-normal edges for the environment (§4.2). High and Medium only.
4. **`KWXRayFeature`**: a Render Objects-style pass that draws your own frog and your Knot partner where they are hidden (§4.8).
5. **Decals** (Screen Space technique): Vengeance goo, splash marks, dried moss holds, the Jar's shadow ring. ≤ 24 live decals.

### 3.3 Stencil and layers

| Id | Use |
|---|---|
| Stencil ref 8 | Glow chalk writes it; `KWEdgeFeature` skips those pixels, so glows stay clean |
| Stencil ref 16 | Frogs write it; `KWXRayFeature` tests against it |
| Rendering layer `Outlined` | Frogs, monsters, carryable props |
| Rendering layer `Tell` | Every `TellLight` surface; `FxPool` reads it for law R8 |
| Physics/camera layer `IgnoreCamera` | Frogs, fireflies, VFX: the camera's collision never pushes in for them |

### 3.4 GPU budget on the Medium preset (dev PC, 1080p) [MUST-A]

D §12 sets frame ≤ 16.6 ms and host simulation ≤ 8 ms. The GPU share (GB, measured with the Render Graph Viewer and GPU markers from week 3):

| Pass | Budget |
|---|---|
| Opaque (toon lit, APV) | 5.0 ms |
| Outlines (hull + edges) | 0.9 ms |
| SSAO (half res) | 1.0 ms |
| Transparent + particles (≤ 4,000 live, 10 §13.3) | 1.5 ms |
| Post: bloom, grading, vignette, SMAA | 1.6 ms |
| UI Toolkit | 0.4 ms |
| **Total** | **10.4 ms**, leaving headroom for 2 live rooms and the main-thread cost |

Asset budgets: the frog per 02 §3 and 10's frog budget (LOD0 ≤ 6,000 tris, LOD1 ≤ 2,000 from 15 m); a monster ≤ 15,000 tris at LOD0 with one LOD at 20 m; a room shell ≤ 250,000 tris; textures: most surfaces use ramp + vertex colour; masks are 256² or 512²; no texture over 1,024² except the Mouth sky gradients (2,048 × 1).

---

## 4. Shaders and materials (agent-owned HLSL) [MUST-A]

All shaders are text in `Assets/_Knotwell/Shaders/`, SRP Batcher-compatible (`CBUFFER_START(UnityPerMaterial)`), with `DOTS_INSTANCING_ON` support on environment variants so the GPU Resident Drawer can take them. No Shader Graph (UT; 10 §13.2).

### 4.1 `KW_Toon.shader` + `KW_ToonCore.hlsl`

One shader with four keyword variants: `_KW_HERO`, `_KW_MONSTER`, `_KW_ENV`, `_KW_PROP`. (02 §3.4 calls the hero variant `Knotwell/ToonHero.hlsl`; it is this file with `_KW_HERO`.)

**Lighting model.**
```hlsl
// half-Lambert remapped into bands; shadow attenuation passes through the same step
float h     = saturate(dot(N, L) * 0.5 + 0.5) * lerp(1, shadowAtten, _ShadowStrength);
float band1 = smoothstep(_RampThreshold - _RampSoftness, _RampThreshold + _RampSoftness, h);
float band2 = smoothstep(_Ramp2Threshold - _RampSoftness, _Ramp2Threshold + _RampSoftness, h);
float3 shade = ShadeFromBase(base, _KW_ShadeTint, _KW_ShadeTintAmount);   // OKLab L x 0.55, hue pulled toward the mood's tint
float3 lit   = lerp(lerp(shade * _DeepShade, shade, band2), base, band1) * mainLight.color;
lit += AdditionalLightsToon(...) * 0.6;          // Forward+ loop, same ramp, softer weight
lit += SampleAPV(N) * base * _GIStrength;         // SH from APV
float rimMask = pow(saturate(1 - dot(N, V)), _RimPower);
rimMask = smoothstep(_RimThreshold, 1, rimMask);
lit += rimMask * _RimColor.rgb * _RimIntensity * _KW_RimMul;              // Seat Hue on frogs
lit += ToonSpec(N, H) * _SpecColor;               // one hard highlight for wet skin, bronze, water
lit += Emission();                                 // masks: R spots (separate material on frogs), G belly, B markings
return KW_ApplyFog(lit, positionWS, emissiveMask); // §4.6
```

**Parameters and defaults per variant:**

| Property | Hero | Monster | Env | Prop | Notes |
|---|---|---|---|---|---|
| `_RampThreshold` | 0.52 | 0.50 | 0.48 | 0.50 | Main light/shade line |
| `_Ramp2Threshold` | 0.22 | 0.25 | 0.20 | 0.22 | Deep-shade line (02's "3-band ramp") |
| `_RampSoftness` | 0.04 | 0.03 | 0.10 | 0.05 | Env is painterly-soft; characters crisp |
| `_DeepShade` | 0.70 | 0.60 | 0.75 | 0.70 | Multiplier inside the deep band |
| `_ShadowStrength` | 0.85 | 0.90 | 1.00 | 0.90 | — |
| `_GIStrength` | 0.80 | 0.70 | 1.00 | 0.90 | — |
| `_RimPower` | **3.0** (02) | 2.5 | — | 3.0 | Env has no rim |
| `_RimThreshold` | **0.35** (02) | 0.30 | — | 0.40 | — |
| `_RimIntensity` | **1.2** HDR (02) × Seat rim gain | 0.8 | — | 0.5 | Monsters rim in their accent colour |
| `_RimColor` | `_SeatHue` (MPB) | monster accent | — | `#FFFFFF` | — |
| `_SpecSize` / `_SpecSoftness` | 0.93 / 0.02 | 0.90 / 0.02 | 0.95 / 0.03 | off | Wet skin, bronze, glass |
| `_OutlineWidthPx` | **2.0** (02) | 2.5 | (edge pass) | 1.5 | §4.2 |

**Global shader properties set by the mood (§5):** `_KW_ShadeTint` (colour), `_KW_ShadeTintAmount` (0–1), `_KW_RimMul` (dread 1.35, waltz 1.0), `_KW_EmissiveMul` (tells), `_KW_FogResist`.

**Hero per-frog inputs** keep 02 §3.4's `MaterialPropertyBlock` names: `_SeatHue`, `_GlowColor`, `_GlowEmission`, `_MarkingsLit` (0–10 segments, 04 §2.3), `_CheekGlow`, `_SkinBase`, `_SkinPattern`, `_SkinBelly`, `_SkinIris`, `_PatternTex`, `_DarkFade`. The belly uses **wrap lighting** (`_WrapLight` 0.35) so light seems to come from inside the pale belly `#CFF3FF`.

### 4.2 Outlines

**Inverted hull** (`KWOutlineFeature`, characters and props):
- Width in screen pixels: `w = _OutlineWidthPx × (screenHeight / 1080) × clamp(8 m / viewDistance, 0.5, 1.0)`, floored at 1.0 px.
- The hull extrudes along **smoothed normals baked into UV3** by `OutlineNormalBaker` (an AssetPostprocessor), so hard edges never crack the hull.
- Colour: the surface base colour in OKLab with **L × 0.25, chroma × 1.1**, so outlines are dark and hue-matched, not black. A frog's outline never takes the Seat Hue (the rim carries seat identity).
- LOD2 and anything beyond 30 m: no hull.

**Environment edges** (`KWEdgeFeature`):
- Roberts cross on depth and normals; depth threshold 0.02 × centre depth; normal threshold 0.45 (dot).
- 1 px at 1080p; the edge darkens the pixel ×0.35; fades out between 25 m and 45 m.
- Skips stencil 8 (glow chalk), the sky, water and transparents.

### 4.3 `KW_GlowChalk.shader`: self-lit tells, plaques, interactables

The "glow chalk" of CRIT #28: unlit, emissive, hand-drawn.

| Property | Default | Notes |
|---|---|---|
| `_Color` | per use (HDR) | Tell hex from the RoomDef `cue.hex` (05 §1.1) |
| `_Intensity` | tell idle 1.0 → armed 4.0; plaque 2.5; interactable 1.5 | HDR; bloom threshold is 1.0 |
| `_ChalkMask` | 256² stroke texture from `NoiseBaker` | Gives the drawn-on look |
| `_PulseHz` / `_PulseDepth` | idle 0.5 Hz / 0.15 | — |
| `_ArmT` | 0 → 1 over the cue's `leadSec` | Driven by `TellLight` from `MonsterBrain.State` (05 §2.2) |
| `_FogResist` | 0.7 | §4.6 |

**Arming curve:** intensity `1.0 + 3.0 × ArmT²`; pulse rises from 0.5 Hz to **2.5 Hz** (under the 3 Hz line, R10) during the last 40% of the lead. Hard and Hell shorten `leadSec` × 0.7 (05 §1.1); the curve scales with it.

### 4.4 Frog-specific rendering

Covered in §6.1: spots (separate material, 02 §3.4), belly and markings, orbiters, Crown glow, Awakening parts, x-ray, ghost.

### 4.5 `KW_WaterToon.shader`

| Property | Value |
|---|---|
| Shallow / deep colour | `#1E3B3A` / `#05090C`, depth fade over 3 m |
| Foam | `#CFE9E4`, 0.12 m band at intersections, noise-cut edge |
| Normals | 2 scrolling 256² maps (`NoiseBaker`), 0.03 and 0.05 m/s at crossed angles |
| Vertex wave | amplitude 0.03 m, wavelength 1.5 m (off on Low) |
| **Mouth reflection** | Analytic: the reflected view ray is intersected with the Mouth disc (WORLD §4.5; 01 owns the disc), returning the Mouth sky colour × 0.6. No planar reflection pass |
| Lantern reflections | From the room's reflection probe |
| Ripples | Shuriken ring particles on the surface (§8), not a ripple RT |
| Refraction | Fake: UV offset of the deep colour by normal; opaque texture stays off |

### 4.6 Fog

- **Distance fog:** URP's built-in fog, Exponential Squared; colour and density per mood (§5.2).
- **Height fog** in `KW_ToonCore.hlsl`: `hf = saturate((_HFTop − y) / (_HFTop − _HFBase)) × _HFDensity × saturate(dist / _HFStart)`. The final fog is `max(urpFog, hf)`.
- **Emissive resistance:** fog factor × (1 − `_FogResist` × emissiveMask), so glow chalk and frogs' belly cut through fog (R6).
- **Well shaft mist:** height fog from the water (y −2) to +8 m, colour `#2A3A40` (WORLD §4.1).

### 4.7 Skies

| Shader | Where | Parameters |
|---|---|---|
| `KW_SkyGradient` (skybox) | The Well (seen only through the Mouth), the Rim | 3-stop gradient (zenith, horizon, ground), sun disc (size, softness), star field (hash, twinkle 0.3 Hz), one cloud band (noise). Presets per time of day (§5.3) |
| `KW_SkyPainted` | The Rim's dome [MUST-B] | Brushstroke overlay by distance (WORLD §10.3), the dome tear showing Space stars (D §6 row 30); 01 owns the geometry |
| `KW_LightShaft` | Additive cone meshes: the Mouth's light pillar, Landing shafts, the Grip Wall's top light | Colour, intensity 0.05–0.15, noise scroll 0.02, soft depth fade 0.5 m, fades within 2 m of the camera. URP has no volumetrics, so shafts are faked (UT) |

### 4.8 Utility shaders

| Shader | Use | Spec |
|---|---|---|
| `KW_XRay` | Your own frog and your Knot partner behind walls (the Knot's "see each other through walls", FO §5.2) | ZTest Greater against stencil 16. Your frog: Seat Hue at 25% with a 1 px rim. Knot partner: 45%. No other frogs (fairness: no free wallhack) |
| `KW_Ghost` | Tadpole ghost | Transparent Fresnel: alpha 0.35 + Fresnel 0.5, Seat Hue tint, no outline. 08 slot "Tadpole ghost" may swap mesh and material but keeps the Seat Hue outline (08 §2) |
| `KW_DitherFade` (function) | Anything within 1.2 m of the camera; other frogs between the camera and yours | 4 × 4 Bayer screen-door; fully gone at 0.4 m |
| `KW_Glitch` | E doors, `glitch_eye` | Albedo swaps to a `#FF00FF` / `#000000` checker inside a screen-space noise mask (≤ 10% of the screen); per-object RGB offset ≤ 3 px; flicker ≤ 3 Hz (R10) |

### 4.9 Special materials

| Material | Spec |
|---|---|
| **Jar glass** (`warden_the_jar`, jars) | Fresnel + matcap highlight (256² baked), tint `#DDEFF2` at 20%, no refraction pass; trapped fireflies inside are unlit sprites `#FFE27A` HDR 2.0 |
| **Bronze** (bells, golem) | Toon `_KW_MONSTER` with spec 0.90; base `#C08A3E`, patina `#5E8C7A` in cavities via vertex colour |
| **Stone** (walls, strands) | Toon `_KW_ENV`; triplanar voronoi-crack albedo baked to 512² by `NoiseBaker`; wet darkening by vertex colour near water |
| **Moss** | `#557D33` base, `#8DB45A` tips (WORLD §10.5 moss) |
| **Pearl icon** | Thin-film iridescence approximation: hue shift by N·V over `#EAF4FF` |
| **Toon water drip, slime** | `KW_Toon` with spec 0.88 and a 0.2 translucency term |

---

## 5. Layers and moods: lighting recipes

### 5.1 How a mood is built

A **mood** is one `MoodDef` in `presentation/palette.json`. Each room, hub and Landing names one mood (plus optional overrides) in its RoomDef (`audio.musicState` and a new `look.mood` key; 05 §1.1 owns the field list). A mood sets:
- the key light (a baked Directional or Spot in the shell; its colour and intensity are baked into the room's APV and lightmap);
- the ambient (URP Environment Lighting gradient used as fill, plus an APV multiplier);
- fog (URP Exponential Squared + the height fog of §4.6);
- the global shader properties (`_KW_ShadeTint`, `_KW_RimMul`, `_KW_EmissiveMul`, `_KW_FogResist`);
- one global Volume profile (bloom, SSAO, grading, vignette);
- the music state and the mixer snapshot (§15).

Room shells bake with their mood's key and ambient (10 §5.4). Moods blend over **0.4 s** as you pass through a door (the 0.4 s door fade, 05 §3.1), and over **3 s** during reveals (WORLD §9.2: colours lerp in OKLab, fog density in log space).

```json
{
  "id": "rule_dread",
  "key":     {"type": "Directional", "hex": "#7C9CC8", "intensity": 0.35, "pitchDeg": 62, "shadows": "Soft"},
  "ambient": {"sky": "#1C2433", "equator": "#121820", "ground": "#07090C", "apvMul": 0.6},
  "fog":     {"hex": "#0E141B", "expSq": 0.045, "heightTop": 1.2, "heightDensity": 0.5},
  "shade":   {"tint": "#3A4A8C", "amount": 0.25},
  "rimMul": 1.35, "bellyLight": true, "emissiveMul": 1.0, "fogResist": 0.7,
  "post": {
    "bloom":    {"threshold": 1.0, "intensity": 0.9, "scatter": 0.70},
    "ssao":     {"intensity": 0.70, "radius": 0.30},
    "grading":  {"postExposure": -0.2, "contrast": 12, "saturation": -5, "temperature": -12,
                 "splitShadows": "#1E3A5F", "splitHighlights": "#FFE7C2", "splitBalance": -20},
    "vignette": {"intensity": 0.30, "smoothness": 0.45}
  },
  "music": "mus_rule_{suit}", "snapshot": "RuleRoom"
}
```

**Fog maths, so the 25 m rule holds.** Exponential Squared keeps `exp(−(d·ρ)²)` of a surface. At ρ = 0.045: 44% visible at 20 m, 8% at 35 m. That is "dread at 20–35 m". A tell with fog resist 0.7 keeps ≥ 83% of its colour at 25 m.

### 5.2 The Well's moods

**Lighting**

| Mood | Used by | Key light | Ambient sky / equator / ground (APV ×) | Fog (colour, ExpSq ρ; height top, density) | Shade tint (amount) | Rim × | Belly light |
|---|---|---|---|---|---|---|---|
| `well_bottom` [A] | `hub_well_bottom`, title | Directional from the Mouth, pitch 88°, colour = the Mouth's sky (§5.3), 0.5 | `#1A2430` / `#0E141B` / `#05080B` (0.7) | `#0E161C`, 0.012; mist to +8 m at 0.6, colour `#2A3A40` | `#2B3F6B` (0.20) | 1.2 | on |
| `hatch_pond` [A] | `hatch_pond` | Spot `#FFCF8A` 1.2, pitch 60°, from a lantern ring | `#2B3A45` / `#1D2A30` / `#0B1216` (1.0) | `#1D2A30`, 0.010; mist to +1 m at 0.4 | `#6B4A3A` (0.15) | 1.0 | on |
| `doorhall` [A] | Every DoorHall antechamber (05 §3.1) | 3 point lanterns `#FFB86B` 1.4 | `#3A2E2A` / `#2A211E` / `#120E0C` (1.0) | `#2A211E`, 0.010; none | `#6B4A3A` (0.15) | 1.0 | off |
| `breather` [A] | Jar, window, toy doors, `meeting_room` | Lantern cluster `#FFB86B` 1.4 + one key spot | `#4A3A34` / `#3A2E2A` / `#1C1614` (1.0) | `#3B2F2A`, 0.012; none | `#7A4A3A` (0.15) | 1.0 | off |
| `gold` [A] | `br_gold` | Top spot `#FFD84A` 1.6 + gold-dust particles | `#4A3A20` / `#3A2E18` / `#1C160C` (1.0) | `#3A2E18`, 0.010; none | `#7A5A2A` (0.15) | 1.0 | off |
| `hush` [B] | `br_sleeping_toad` | Lantern `#FFB86B` 0.6 + cool fill `#7C9CC8` 0.2 | `#2A2622` / `#1E1B1A` / `#0C0B0A` (0.8) | `#1E1B1A`, 0.020; mist to +0.6 m at 0.4 | 50/50 warm-cool (0.20) | 1.2 | on |
| `landing` [A] | `landing_well` | Lanterns `#FFB86B` 1.3 + the Mouth's light pillar (§4.7) | `#3A3440` / `#2E2A2E` / `#14100E` (1.0) | `#2A3A40`, 0.008 (you see across the shaft to other strands); mist below the deck | `#6B4A3A` (0.15) | 1.0 | off |
| `rule_dread` [A] | Rule doors | Directional `#7C9CC8` 0.35, pitch 62°, from a crack or skylight | `#1C2433` / `#121820` / `#07090C` (0.6) | `#0E141B`, 0.045; ground mist to +1.2 m at 0.5 | `#3A4A8C` (0.25) | 1.35 | on |
| `heart_stage` [B] | Heart doors | Theatre spot `#FFCF7A` 0.9, cone 50° (inner 35°), on the dilemma props; the rest dark | `#151A20` / `#0F1418` / `#06080A` (0.6) | `#14181C`, 0.030 | `#1F4A4A` (0.25), teal shadows | 1.35 | on |
| `enigma` [B] | E doors | Directional `#B6A2FF` 0.4 from above | `#1A1628` / `#120F1C` / `#07060C` (0.6) | `#120F1C`, 0.040 | `#4A3A8C` (0.30) | 1.35 | on |
| `set_grip` [B] | `sp_grip_wall` | Directional from the Mouth, pitch 85°, `#FFF3C4` 1.1, shadows on; light-shaft cone 0.12 | `#2F3A44` / `#232C34` / `#101418` (0.9) | `#56616B`, 0.006 (see far up and down); mist below the start ledge at 0.7 | `#3A4A6B` (0.15) | 1.2 | on |
| `set_tether` [B] | `sp_tongue_tether`, `heart_tied_bridge` | Directional `#5FA8B8` 0.6, pitch 35°; rising water glows `#A8F5B8` HDR 0.6 at the waterline | `#13232A` / `#0E1A20` / `#05090C` (0.6) | `#10222A`, 0.030 | `#1F4A5A` (0.25) | 1.35 | on |
| `keeper` [A] | `keeper_bell_raft` | Moon shaft through the Mouth `#CFE0FF` 0.7, pitch 80°; raft lanterns `#FFB86B` 0.8 (a warm island in the dark) | `#141C26` / `#0E141B` / `#05090C` (0.6) | `#0F1820`, 0.025 | `#2B3F6B` (0.25) | 1.35 | on |
| `warden` [B] | `warden_the_jar` | Night moon `#E8ECFF` 0.8 through the Mouth; **the Jar's trapped fireflies** are the brightest light (point `#FFE27A` 2.0, range 20 m, inside the glass) | `#10141E` / `#0B0F16` / `#040609` (0.6) | `#0B1018`, 0.020 | `#2B3F6B` (0.25) | 1.35 | on |
| `rim` [B] | `rim_surface` | Sun `#FFF3C4` 1.3 at pitch 12° (dawn) | `#BFE3FF` / `#FFE1EC` / `#A8D98A` (APV off; open sky) | `#FFE9F0`, 0.004 pastel haze | `#8A7AB8` (0.12), lilac shadows | 0.9 | off |

**Post**

| Mood | Bloom threshold / intensity / scatter | SSAO intensity / radius | Grading: exposure, contrast, saturation, temperature; split shadows → highlights | Vignette | Music · snapshot (§15) |
|---|---|---|---|---|---|
| `well_bottom` | 1.0 / 0.9 / 0.75 | 0.50 / 0.40 | 0, +10, +5, −8; `#16324F` → `#FFE3B0` | 0.30 | `mus_hub` · Well |
| `hatch_pond` | 1.0 / 0.8 / 0.70 | 0.50 / 0.30 | +0.1, +5, +12, +6 | 0.18 | `mus_hatch` · Breather |
| `doorhall` | 1.0 / 0.7 / 0.70 | 0.55 / 0.30 | +0.05, +6, +10, +12 | 0.20 | carries the last music; door sting · Breather |
| `breather` | 1.0 / 0.6 / 0.70 | 0.50 / 0.30 | +0.1, +5, +12, +15 | 0.15 | `mus_breather` / `mus_toy` · Breather |
| `gold` | 1.0 / 1.1 / 0.80 | 0.45 / 0.30 | +0.15, +6, +15, +20 | 0.12 | `mus_gold` · Breather |
| `hush` | 1.0 / 0.8 / 0.70 | 0.60 / 0.30 | −0.1, +8, 0, +2 | 0.25 | `mus_hush` · Breather |
| `landing` | 1.0 / 0.7 / 0.75 | 0.50 / 0.35 | +0.1, +6, +10, +12; `#1E3A5F` → `#FFE3B0` (warm deck, cool shaft) | 0.15 | `mus_landing` · Landing |
| `rule_dread` | 1.0 / 0.9 / 0.70 | 0.70 / 0.30 | −0.2, +12, −5, −12; `#1E3A5F` → `#FFE7C2` (balance −20) | 0.30 | `mus_rule_{suit}` · RuleRoom |
| `heart_stage` | 1.0 / 0.8 / 0.70 | 0.65 / 0.30 | −0.1, +15, 0, +4; `#0F2A2E` → `#FFE7C2` | 0.35 (a stage iris) | `mus_heart` · RuleRoom |
| `enigma` | 1.0 / 0.9 / 0.70 | 0.65 / 0.30 | −0.2, +12, 0, −15 | 0.30; chromatic aberration pulses 0 → 0.35 on the monster's special moves (off in reduced motion) | `mus_enigma` · RuleRoom |
| `set_grip` | 1.0 / 0.8 / 0.80 | 0.60 / 0.40 | 0, +8, +5, 0 | 0.20 | `mus_grip` · RuleRoom |
| `set_tether` | 1.0 / 0.85 / 0.70 | 0.60 / 0.30 | −0.1, +10, 0, −10 | 0.25 | `mus_tether` · RuleRoom |
| `keeper` | 1.0 / 0.9 / 0.75 | 0.60 / 0.35 | −0.1, +12, 0, −6 | 0.28 | `mus_keeper` · Boss |
| `warden` | 1.0 / 1.0 / 0.80 | 0.60 / 0.40 | −0.1, +14, +5, −8 | 0.30 | `mus_warden` · Boss |
| `rim` | 1.0 / 0.6 / 0.85 | 0.35 / 0.50 | +0.2, +4, +8, +8 | 0.10 | `mus_rim` · Rim |

**Difficulty looks** (applied on top of any dread mood):
- **Hard** [A]: vignette +0.05.
- **Hell** [B]: saturation −20 and contrast +10 on the environment only (glow chalk and frogs keep full colour, via the emissive mask), vignette +0.08. The rule text is redacted (05 §3.6); the Hell border shows on the results card (FO §3.6).

**Suit accent in rule rooms.** The suit colour appears only on the room's entry-arch trim (glow chalk at intensity 1.0) and on the DoorHall plaque. Room lighting stays mood-neutral, so nothing competes with the tell (R8).

### 5.3 The Well's sky through the Mouth [A]

The Mouth shows the Sky layer's live sky, afternoon to night as you climb (WORLD §4.1). 10 §5.4 blends the APV scenarios `WellDay` → `WellDusk` by `(door − 1) / 19`; the skybox follows the same blend in OKLab:

| Door | Zenith | Horizon | Sun / stars | Mouth light colour (key of `well_bottom`, `landing`) |
|---|---|---|---|---|
| 0–1 | `#6FB6FF` | `#CFE9FF` | sun high | `#CFE6FF` |
| 10 | `#5E8FD8` | `#FFD9A8` | sun low | `#FFE3C0` |
| 15 | `#1B2340` | `#F2A65A` (GDD §13.3 dusk) | sunset | `#F2B880` |
| 20 | `#0B0E1F` | `#2A2440` | stars (twinkle 0.3 Hz), moon | `#E8ECFF` |

- **The Mouth's angles** (31° / 37° / 44° / 56° / 74°) are geometry and belong to 01. This file only colours what shows through.
- **The light pillar** (WORLD §4.5): an additive tapered cylinder from the lip to the water, opacity `0.04 + 0.4 × share of sky`, with 400 instanced dust motes (§8).
- **The 12 lantern-folk** are anonymous warm-white points `star_anon` at the lip until ★1 (WORLD §4.4).

### 5.4 The four layers

| | **The Well** [A] | **The Sky** [B: the Rim · SHOULD: Sky Preview · LATER: the climb] | **Space** [LATER] | **Beyond** [LATER] |
|---|---|---|---|---|
| Idea | Moss and lanterns in a stone shaft | Pastel islands under a painted dome | Violet and neon on station decks | Deep dark, silver filaments, moss glints |
| Base / shadow | wet stone `#4E5A5E` / `#151B20` | cloud `#FFF6EE` / `#C9B8D9` | deck metal `#2A2F3A` / `#0E1016` | `#1A1E2A` / `#05060C` |
| Accents | moss `#557D33`, moss tips `#8DB45A`, lantern `#FFB86B`, bronze `#C08A3E`, rope `#B08A5A`, water `#05090C` | grass `#A8D98A`, sun `#FFF3C4`, rim stone `#D8CFC2`, stars in the tear `#E8E0FF` | neon magenta `#FF4FD8` (31° from crimson), violet `#7A5CFF`, sodium `#FFD36B`, planet `#6FA8FF`, limb `#7FB8FF`, nebula `#FF8FD0` | filament `#DCE3F0`, glints `#9BE07A`, nebula fog `#FF8FD0` at 0.015 (WORLD §9.2) |
| Waltz (Landings) | lanterns `#FFB86B` | sunlit | floodlit deck `#DDE8FF`; the planet fills ≥ 35% of the view (WORLD §9.2) | nebula fog; mean scene luminance ≥ 0.18 (WORLD §9.2) |
| Dread (rule rooms) | cold stone, ambient ≤ 0.1, fog ≤ 35 m | thunderhead interiors `#2B3350`, lightning `#E8F0FF` (each flash ramps 120 ms; ≤ 1 per 2 s) | derelict modules, the same limits | dead-star interiors, the same limits |
| Sky seen overhead | the Mouth (§5.3) | the painted dome and its tear | the planet and the moon | halo rings |
| Molt on the frog | — | **Glider molt** (§6.1) | Moon Toad helmet | (LATER) |
| Music key (§15.3) | F | C | G | D |

The Rim (`rim_surface`) is the Sky's first waltz: pastel dawn, Glide on, and the stars of Space through the dome tear (D §6 row 30).

---

## 6. Characters

### 6.1 The Firefly Frog: the art side [A unless marked]

02 owns the body, sockets, rig and the spot material; 04 owns the per-level targets. This is how they look on screen.

**The two readouts, restated as art rules (02 §1 H3–H5):**
- **Fragile:** 3 back spots (4 on Easy). Lit = filled disc `spot_core` with a `spot_hot` centre, emission 4.0. Out = **hollow** ring `#3A2F22`, so health reads by shape without colour (02 §3.4).
- **Strong:** belly, orbiting fireflies, lit markings, Awakening parts, the Crown glow.

**Growth by level** (values from 04 §2.3; the bloom threshold of 1.0 turns them into a visible moment):

| Level | Belly `_GlowEmission` | Blooms? | Orbiters | Markings lit | Belly light (dread moods only) |
|---|---|---|---|---|---|
| 1 | 0.6 | no: a dim froglet | 0 | 0/10 | range 2.0 m, intensity 0.30 |
| 2 | 0.9 | no | 1 | 1 | 2.25 m, 0.40 |
| 3 | 1.2 | **yes: the first bloom** | 2 | 2 | 2.5 m, 0.50 |
| 4–9 | 1.5 → 3.0 | yes | 3 → 8 | 3 → 9 | +0.25 m and +0.10 per level |
| 10 | 3.4 | yes | 9 → **Crown glow** | 10 | 4.25 m, 1.20 |

- **Belly light:** one realtime point light per frog, no shadows (02 §3.4), colour = Glow colour. It is off in waltz moods, where the belly is emissive only.
- **Orbiters** (`FireflyOrbit`, a pooled sprite ring, not Shuriken, so it is deterministic): radius 0.45 m + 0.03 m per level, one lap per 2.4 s (04 §2.3), vertical bob ±0.08 m at 0.7 Hz with phases spread evenly; each firefly is a 0.05 m sprite at HDR 2.0 in the Glow colour with a 3-sprite fading tail (0.2 s).
- **Crown glow** (Lv10): the 9 orbiters rise to `CrownCenter` (02 §3.3) and join 3 new motes in a ring of 12, radius 0.22 m, turning 0.25 rev/s and pulsing ±15% at 0.5 Hz. Crown sparks past the cap (04 §2.4) are `gold` motes riding the same ring, max 6.
- **Cheek glow** (unbanked fireflies): `_CheekGlow` in 5 buckets (02 §3.6); cheeks emit Glow colour at HDR 0.3 + 0.3 per bucket. At the door clear the cheeks' glow streams into the belly (§8 `vfx_bank`).
- **Awakening parts** (02 §5.3 owns the geometry): Tongue III, a glowing tongue-tip bead at HDR 2.0; Hop III, glowing bands at both `Foot` sockets; Croak III, the larger sac (02 §2.1) with 3 glowing rings. **Mastery IV** adds a `gold` rim and a 0.8 s shimmer sweep every 4 s (04 "Mastery shimmer").
- **Boon marks** (04 §6.6): 5 small glow-chalk marks at fixed places (cheeks, shoulders, a forehead gem), in family colours (§2.4), with 1–3 rank pips. Legendary: `gold` with a 2 s shimmer. A Duo draws a 1 px `#C9A7FF` thread toward the partner, fading out beyond 15 m.
- **Emotion never uses glow, spot or rim** (02 H5). Faces and posture carry it.
- **Low spots:** at 1 spot, pupils shrink to 60% and a sweat-drop sprite falls every 1.5 s. **No drooping lids**, even though 02 §2.2 lets lids close past 40% in its Sad and low-spot states: D §2's anti-Pepe rule wins (Open question 3).
- **Knocked-out spot:** the orb (a NetworkObject, 02 `PopSpotVisual`) is a 0.12 m sphere in `spot_core` at HDR 4.0, ringed in the **owner's Seat Hue**, with a 3 s countdown ring that shrinks (FO §3.7: it always returns to its owner).
- **Down and Dark:** `_DarkFade` 0 → 1 over 0.6 s (desaturate to 20%, darken to 30%); the frog curls into its egg (0.25 m, Seat Hue at HDR 1.0, pulsing 0.5 Hz) and the tadpole ghost wriggles out (`KW_Ghost`, 0.35 m, 3 Hz wriggle).
- **Glider molt** [B]: `Membrane_L/R` (02 §3.3), translucent white at 35% with a Glow-colour edge at HDR 0.8. They unfold in 0.2 s on glide and fold in 0.3 s on landing.
- **Moon Toad helmet** [LATER]: glass (§4.9) on the `Helmet` socket; hats stay inside it (02 §3.3).
- **Name tag** at the `Tag` socket (§13.9): Seat Hue chip + glyph + name + 3 spot pips + rank letter + badges.
- **Draw budget:** per 02 §3.4 (4 materials, ≤ 6 draw calls, 1 light).

**The Wick fallback** (D §2; 02 §13 owns the mapping). The same `KW_Toon` shader with a `_KW_HERO_WICK` keyword. Spots become 3 glowing beads on the back (same hollow-when-out rule). The belly glow becomes flame height and corona. Orbiters become flame motes. The tongue becomes D §2's thread lasso, in the same coral. The croak ring becomes a flare pulse in the same ring VFX. Palette, rim, outline and Seat Hues do not change.

**Before Gate A** (D §2): no frog art goes public. Capsule, trailer and store work in §16 wait for it.

### 6.2 The Rivals as frogs [A: 7 · B: 10]

03 §16.3 owns who they are and their species; 08 §13.1 owns what they wear. All ten use the frog mesh and hitbox (02 §2.2). Their skin base colours (03's references, final here; hues verified against crimson):

| Rival | Species look (03) | Skin base | Hue | Idle quirk (`RivalIdleProfile`) | Babble f0 (03) |
|---|---|---|---|---|---|
| Moss | Mossy frog, lichen bumps | `#9BE07A` | 101° | Steady; always faces the group; checks the nearest human's spots | 220 Hz |
| Brother Brass | Bullfrog | `#FFC45C` | 38° | Wide stance (visual only), chest out, slow nods | 150 Hz |
| Pip | Teal reed frog, oversized eyes (eye scale +10%, visual only) | `#6FF0D6` | 168° | Hops in place every 3 s; stays within 3 m of a human | 420 Hz |
| Vex | Yellow-banded dart frog, bands `#1A1A1A` | `#E8F24A` | 64° | Eyes flick between frogs' cheeks every 0.8 s; leans | 300 Hz |
| Maud | Orchid painted reed frog (moved off rose; CRIT #6) | `#D77FE0` | 294° | 12° head tilt, slow blinks, one-eyed wink | 280 Hz |
| Gutter | Scarred cane toad, scars `#8A4A2A` | `#B5673A` | 22° | Hunched 8°; stares at the last frog who betrayed him | 170 Hz |
| Kestrel | Red-eyed tree frog, eyes `#E84A2A` | `#FF8A3D` | 24° | Poses on ledges; balances on one leg | 340 Hz |
| Ines | Lanky cream tree frog | `#FFF1C9` | 45° | Taps a foot at 3 Hz; faces the exit | 320 Hz |
| Pell | Blue dart frog, black spots | `#6AA8FF` | 215° | Reading tilt; looks at plaques and rule text | 260 Hz |
| Lumen | Lavender leaf frog | `#C7B6FF` | 254° | Stands 3 m apart, facing away | 240 Hz |

- **Recognisable at 25 m** by three things: hat silhouette (08), idle quirk, name tag. The Seat Hue rim comes from the seat, never the Rival (08 §13.1).
- **Kestrel's red eyes** (hue 10°) sit 25° from crimson and are small; they pass the 15° rule. His tongue stays coral (02 §3.4).
- **Badges** on the name tag: `BOT` (a gear glyph, always shown in public lobbies; FO §5.2), `ROOKIE` (a leaf glyph, text `text_muted`, shown for a player's first climbs; FO §5.3). Masked Rivals (friends' opt-in) hide `BOT` until the results.

### 6.3 Monsters [A: rows 1–8 and 13 · B: rows 9–12 and 14] (D §6)

**Shape language:** round = friendly-ish, angular = threat (GDD §13.5). Every monster is built on the shared procedural rig (CRIT #28 `ProcRig`: spring bones, 2-bone IK, look-at, rigid segments), never keyframed. **Monsters are never killed** (D §4): on clear they sleep, kneel, flee, sink or get herded, and each has a funny clear pose for the Bestiary portrait.

The tell colour column is a default; a RoomDef's `cue.hex` (05) overrides it and must pass §2.2.

| # | Room · monster | Silhouette and scale | Palette | Self-lit tell (default hex) | Motion (procedural) | Clear pose |
|---|---|---|---|---|---|---|
| 1 | `bell_golem` · Bell-Golem | 2.6 m bronze bell body on stumpy legs, clapper fists, crack seams | bronze `#C08A3E`, patina `#5E8C7A` | Eye slits `#FFB000` (05 §1.2) | Waddle (0.9 Hz, ±6° sway); head sweeps like a turret (40°/s) while looking; idle hum wobble | Sits down, bells silent, snores |
| 2 | `heron_shadow` · heron | 6 m heron, mostly beyond a skylight; its shadow crosses the floor | shadow `#05080B` at 70%; feather `#EAF6FF` | The skylight turns cold `#9FD3FF` and a feather-shaped shadow leads the sweep; the dropped feather glows `#EAF6FF` | `SweepHazard` spline; head dips into the skylight once per cycle | Flies off; one feather drifts down |
| 3 | `lily_raft` · pike | 2.2 m pike; only fin and eyes break the water | mottled `#3E5A3A`, eyes `#E6FF8A` | A glowing ripple ring `#A8F5B8` on the raft's low side | Circling fin; breach arc on the leap | Sinks, bubbles |
| 4 | `fog_stair` · eel | 3 m eel in fog | `#2E3A36`, lure `#C6FF5A` | Its lure and eyes brighten on whoever is lit | S-curve swim; lunge 0.3 s | Coils around a post and sulks |
| 5 | `snapper_crossing` · snapper | 3 m snapping turtle, mossy shell | shell `#4E5A3A`, moss `#557D33` | The inside of its jaws glows `#FF8A4A` (hue 21°); eyes track the fastest mover | Neck extends on a spring; jaw snap | Pulls into its shell |
| 6 | `echo_warren` · the hunter (05 names it) | 3 m blind olm-like salamander, translucent | `#E9D6CF` | Gill fronds glow `#B9D2FF` when it hears (NoiseBus); it turns to your last croak | Slither spine (6 segments); head sways toward noise | Curls up asleep in a niche |
| 7 | `lamp_knight` · Lamp-Knight | 3 m armoured knight, a lantern for a head, 5 lamps on wires | armour `#5A6270`, lamps `lantern_core` | The halberd's edge glows `#9FD3FF` before a sweep; lamp flames lean toward croaks | Patrol on a spline; halberd swing 0.5 s | Kneels, lamps out |
| 8 | `snake_coil` · snake | 8 m water snake, coiled | bands `#2F4F4F` / `#D9C27A`, eyes `#D0FF6A` | Splash rings glow where it will strike; the head rises 0.6 s before | Coil breathing; strike on a spline | Bites its own tail and sleeps |
| 9 | `moss_snail` · Moss Snail | 2 m snail, moss shell, eye stalks | shell `#557D33`, body `#9A8F7A` | Eye-stalk tips glow `#E6FF8A` when nobody watches (it is about to move), with a scrape | Moves only when unwatched; stalks retract when looked at | Hides in its shell |
| 10 | `web_spider` · Web Spider | 1.8 m spider in a ceiling web | `#2A2530`, web `#EAF6FF` at 0.6 | Its abdomen glows `#B6A2FF` and the thread lengthens 1 s before it drops on whoever croaks | 8-leg IK on the web; drop on a spring | Wraps itself in its own web |
| 11 | `slime_foundry` · Chrono-Slime | 1.6 m glossy blob | body `#6A5ACD`, core `#2EC4B6` | The core brightens `#9FF7EC` before a dash; the eyes lag 0.2 s (GDD §13.5) | Jelly spring body; 20 afterimages on a dash (§8) | Frozen in the cold store, blinking |
| 12 | `glitch_eye` · Glitch Eye | 2.5 m stained-glass eye in an iron ring | glass `#8E6BD8`, iron `#2A2A30`, veins `#B6A2FF` | The pupil dilates; a gaze wedge `#B6A2FF` at 20% sweeps the floor; screen-edge static rises as it turns to you (≤ 3 Hz). Gaze uses frog facing (CRIT #21) | Drift; blink-teleport with a pixel sort | Its lids close; the ring stops turning |
| 13 | `keeper_bell_raft` · the Keeper | The Bell-Golem at 3.2 m, on a raft with 4 lanterns | as 1, plus lanterns | As 1, plus the raft's low-side waterline glows `#A8F5B8` | As 1, plus raft tilt | Sits on the raft and bobs away |
| 14 | `warden_the_jar` · The Jar | A 14 m glass jar (02 §2.3) with a cork lid on a rope from the Mouth; thousands of trapped fireflies inside | glass (§4.9), cork `#9A6A3A`, rope `#B08A5A` | Its shadow ring (a decal) tightens on the brightest frog while the fireflies inside swirl toward that frog, 3 s before the drop; the rope creaks | Rope swing (spring); drop; P2 lift under the Chorus; P3 the Trust Fall | The lid pops; every firefly streams out and up the shaft (★1 pre-roll) |

**Other creatures**

| Creature | Look | Notes |
|---|---|---|
| Giant sleeping toad (`br_sleeping_toad`) [B] | 12 m warty toad `#6B5A3A`; belly breathes at 0.2 Hz; snore bubbles | Its stir tell: eyelid slits glow `#FFB000`. Not a hero, so closed lids are fine |
| The Mimic (`doppelfrog`) [B] | An exact copy of its seat's frog, loadout and Seat Hue included | Its only tell: the **sideways blink** (02's nictitating lids), 150 ms, every 4–8 s, readable at 10 m. No cosmetic may copy it (08 §3.1) |
| Mites | Moths 0.15 m (wings `#CDBFA8`, abdomen `glow_default` HDR 1.2); bell-beetles 0.12 m bronze with a tiny bell; striders; grubs (05 §2.2) | They glow firefly-gold because they pop into fireflies. They never use tell colours |
| Pots | 1.2 m clay `#B0764A`; a crack glows `glow_default` HDR 0.8 when fireflies are inside | Shatter into 6–10 shards (§8) |
| Heal bug (stall item, 04 §10.3) | 0.1 kg ladybird-like bug, shell `#7CE08A` with one glowing spot | Eats itself at 1 spot with a gulp and a green puff |

**Bestiary portraits** are rendered at build time by `kw_portraits` (a `[CliCommand]`): 512 × 512, front 3/4, FOV 30, `rule_dread` mood with the monster's tell armed at 100%, and its clear pose as the second image (04 §9.3).

---

## 7. Procedural animation list

No keyframed clips anywhere (D §2 for the hero; CRIT #28 for creatures). Everything is code on the shared rig: springs, 2-bone IK, look-at, rigid segments and PrimeTween.

### 7.1 The frog: the art and juice checklist [A unless marked]

02 §9 owns the hero's motion numbers and the full list. This table is the checklist of what each moment must *show*, with the juice hooks from §10 and the VFX from §8. If 02 and this table disagree on a motion number, 02 wins; on juice values (`juice.json`), this file wins.

| Moment (02 `HeroOneShot` or state) | Must show | Juice (§10) | VFX · SFX |
|---|---|---|---|
| Hatch / ReHatch | Egg wobble, crack, froglet pops onto the pad | squash `land_tap` | `vfx_hatch` · `sfx_hatch_*` |
| Idle | Sac breathing, blinks (eyes retract during the blink), look-at toward the nearest tell > frog > pickup within 10 m | — | — |
| Waddle | Hop-waddle bob; feet planted by IK | — | `sfx_step_*` |
| Tap hop / charged hop / Air Hop | Anticipation, stretch, land squash; charge crouches deeper and cheeks puff; Air Hop kicks off a firefly puff | `hop_*` squash; `imp_land_charged` | `vfx_hop_dust`, `vfx_air_hop` · `sfx_hop_*` |
| Tongue lash / grapple / carry | 0.25 s cheek-puff tell (FO §2.3), tube with overshoot, tip splat; carried item dangles on a spring | `tongue_hit` hitstop | `vfx_tongue_hit` · `sfx_tongue_*` |
| Croak / sustain / Twin Toll / Thunder | Sac inflates; ring at `SacCenter`; notes rise; Thunder shudders the whole body | `croak_*` | `vfx_croak_ring`, `vfx_shatter_croak`, `vfx_thunder_croak` · §15.4 |
| Gulp / Bank | Fireflies stream into the mouth; cheeks glow; at the clear the cheeks' glow flows to the belly | count-up | `vfx_gulp`, `vfx_bank` |
| LevelUp | Belly punch 1.0 → 1.08 → 1.0 over 0.35 s (04 §2.3), a new orbiter spirals out | `levelup` | `vfx_levelup` |
| Awakening (rank III) | Rise 0.4 m, 360° turn, part pops in with a 1.3 → 1.0 overshoot; nearby Rivals turn their heads | `awakening` | `vfx_awakening` · `stg_awakening` |
| Hit | Spot pops out as an orb; flinch squash; eyes squeeze | `hit_taken` | `vfx_spot_knock`, `vfx_hit_star` |
| Catch / Caught | Tongue snaps the orb or the friend; both frogs hug-squash | `catch` | `vfx_spot_catch` |
| Splat (fall > 4 m) | Pancake squash 0.6 Y for 0.25 s, then pops back | `splat` | `vfx_hop_dust` ×2 |
| Teeter (03 §3.3) | 0.8 s arm-wheel wobble on the brink, eyes wide | — | `sfx_teeter` |
| Down → Dark → ghost | Curl into the egg; the ghost wriggles out | — | `vfx_dark_puff`, `vfx_ghost_trail` |
| Revive | The egg pulses in time with the reviver's held croak; pop | `revive` | `vfx_revive` |
| Swallowed and spat | Squashed into the monster's cheek (0.4 s bulge), spat on an arc with a spin; local ragdoll on landing | `splat` | — |
| KnotTie / CutSnap / HoldOn [B] | Threads spiral and knot / thread snaps crimson / tongue wraps the thread | `cut_snap` | `vfx_knot_tie`, `vfx_cut_*`, `vfx_hold_on` |
| Resolve tell (Rivals' full tell, 03 §7.3) [B] | Sac +40% held, crimson tongue tip, eyes narrow, 10° lean, glow 15% toward crimson | — | `sfx_babble_drop4` |
| ClassReveal [B] | Class markings flash on in sequence, head to toe | `awakening` (lighter) | `vfx_class_reveal` |
| Glide [B] | Membranes unfold; body tilts 20°; slow sway | — | `vfx_glide_streamers` |
| Cling (Grip, Sticky Pads) [B] | Hands and feet IK to the wall; grip shiver when grip < 25% | — | `vfx_moss_dry` |
| Local ragdoll | Big impacts only (shove off a pad, spat out, falls > 3 m); 0.8–1.5 s, blends back in 0.25 s; never networked (D §2) | — | — |
| Emotes | 08 owns the items (≤ 3 s procedural sequences) | — | — |

### 7.2 Monsters: the shared state grammar [A]

Every `MonsterBrain` state (05 §2.2) has the same readable shape, so players learn one visual language:

| State | Look | Timing |
|---|---|---|
| Idle | Breathing at 0.25–0.5 Hz; slow look-around | — |
| **Tell** | The `TellLight` arms (§4.3) **and** an anticipation pose: 10–20% wind-up away from the action (a golem leans back, a snake's head rises, the Jar's shadow ring tightens) | The cue's `leadSec` (2–5 s; Hard/Hell × 0.7) |
| Act | Fast; a 2-sprite smear trail on the moving part | ≤ 0.5 s |
| Recover | A slow, open, vulnerable pose: the moment players get to act | 1.0–1.5 s |
| Stagger | 2 Hz wobble, dizzy stars (`vfx_stagger_stars`, white) | 1 s (rank II croak) or 2 s (Thunder Croak; 05 §2.1) |
| Sleep (the clear) | Breathing at 0.2 Hz, Zzz bubbles; the monster's clear pose (§6.3) | until the room tears down |

Per-monster motion is in §6.3.

### 7.3 Props and world [A]

| Thing | Motion |
|---|---|
| Lily pads | Bob 0.05 m sink per frog (02 §2.1) with a 1.5 Hz spring; rock ±4° on landing |
| Raft | Tilt from the replicated `TiltX/TiltZ` (05 §2.2), smoothed by a 4 Hz spring; waterline foam on the low side |
| Bells | Swing on a spring pivot (2 Hz, damping 0.3); ring shimmer |
| Doors | Slam: 0.35 s down with 80 ms hitstop (05 §3.1). Open: 0.6 s with 15% overshoot |
| Plaques | Flip in over 0.3 s when the DoorHall loads; idle glyph pulse 0.5 Hz ±10% |
| Jars | Wobble when tongued; lid pops with a 1.4 overshoot; contents arc out (04 §10.2) |
| Pots | Wobble on a near-miss; shatter into 6–10 mesh shards |
| Tether / rope | Catenary sag solved each frame from the replicated length; the rope squeaks on stretch > 90% |
| Grip holds | Moss darkens from `#8DB45A` to `#6B5A3A` as it dries (05 `MossHold`), with flakes |
| Lanterns | Flicker ±8% at 0.5 Hz (well under the 3 Hz line) |
| Eggs (hub seats) | Bob 0.3 Hz ±0.03 m; a human's egg glows its Seat Hue |
| Water | §4.5; the rising water in the tether set piece moves on the replicated height |
| The Mirror | Surface ripples 0.3 s when you step in front of it |

### 7.4 UI motion language [A]

| Element | Motion | Reduced motion |
|---|---|---|
| Panels | Slide 12 px + fade, 200 ms, ease `cubic-bezier(0.2, 0.8, 0.2, 1)` (GDD §14.6) | Fade only |
| Buttons | Hover lift 2 px; press scale 0.96 for 80 ms | Colour change only |
| Numbers | Roll with ticks (§10.4) | Snap to the final value, one tick |
| Banners | In from the right in 300 ms, hold 3 s, out in 300 ms (GDD §14.6) | Fade |
| The door counter | Slam from 1.4× to 1.0× in 120 ms, holds 0.35 s, then flies to its corner chip in 250 ms | Fade in place |
| System windows | §11.2 | Fade |
| Focus ring | 3 px `growth`, 2 px offset, grows in over 90 ms | Instant |

---

## 8. VFX (Shuriken) [A unless marked]

**Rules** (10 §13.3): Shuriken only; pooled by `FxPool` and pre-warmed per room; ≤ 4,000 live particles per room; ≤ 4 transparent layers of overdraw; soft particles off in Low; Low halves every count. Effects are **local**, triggered by replicated events, so they cost no bandwidth. No VFX Graph in the slice (D §8.2 #22).

**Colour rules:** growth effects take the frog's Glow colour; reward effects use `gold`; betrayal effects are the only ones allowed crimson (whitelist ids marked ♥); tells use the RoomDef `cue.hex`; nothing uses `spot_core` except spot effects.

| Id | Trigger | Look | Max particles | Life |
|---|---|---|---|---|
| **Growth and rewards** | | | | |
| `vfx_gulp` | A gulp | Fireflies stream along the tongue into the mouth | 12 | 0.3 s |
| `vfx_firefly_cloud` | Loose cloud (05 `FireflyCloud`) | Drifting sprites that swarm away from a lash | 20 per cloud | loop |
| `vfx_bank` | Door clear | Cheek glow flows to the belly; one ring pulse | 24 | 0.6 s |
| `vfx_levelup` | Level-up | Belly flare ring + the new orbiter spirals out | 30 | 0.5 s |
| `vfx_verb_rank` | Verb rank II | A small verb emblem bursts from the verb's body part | 16 | 0.4 s |
| `vfx_awakening` | Rank III | A 2 m spiral column of fireflies, a 3 m shockwave ring, a sparkle on the new part | 120 | 1.2 s |
| `vfx_mastery` [B] | Rank IV | A `gold` shimmer sweeps over the part | 40 | 0.8 s |
| `vfx_crown_form` [B] | Lv10 | The 9 orbiters rise into the ring; 3 new motes | 30 | 1.0 s |
| `vfx_boon_grant` | Boon granted or picked | The orb bursts into its body mark | 24 | 0.5 s |
| `vfx_boon_orb` | Pick offer (§13.8) | 3 (or 4) private orbs with family-colour halos | 20 each | loop, 8 s |
| `vfx_boon_shatter` | A Boon is replaced | Glass-like shards in the family colour | 30 | 0.6 s |
| `vfx_class_reveal` [B] | Class unlocked | Markings flash on; the banner sparkles | 60 | 1.0 s |
| `vfx_rank_up` | Tower Rank up (04 §8.3 beat 2) | The bar bursts into fireflies | 80 | 1.0 s |
| `vfx_party_rank_up` | Keeper and Warden | A ring of light passes through every frog | 100 | 1.2 s |
| `vfx_noted` | `[ NOTED ]` hidden or unintended clear | A gold stamp puff and one star | 30 | 0.6 s |
| `vfx_mite_pop` | Mite popped | A tiny burst and one firefly | 10 | 0.3 s |
| `vfx_pot_shatter` | Pot breaks | 6–10 mesh shards + fireflies | 20 | 1.0 s |
| `vfx_jar_open_bronze / _silver / _gold` | Jar opens | Lid pop, coins arc into cheeks, chime sparkles | 20 / 30 / 60 | 0.8 s |
| `vfx_wishcoin_rain` | Keeper pull-back (FO §6.1 10:40) | Wish Coins fall through the Mouth past the camera | 40 over 3 s | 3 s |
| `vfx_gold_dust` | `br_gold` ambience | Slow gold dust | 150 | loop |
| `vfx_shatter_croak` | Shatter Croak | A radial ring and pot shards everywhere in radius | 40 | 0.5 s |
| `vfx_thunder_croak` [B] | Thunder Croak | A 9 m ring, dust ring, ground ripple | 80 | 0.7 s |
| **Verbs and bodies** | | | | |
| `vfx_hop_dust` | Landing | Dust puff (charged: a ring) | 8 / 16 | 0.4 s |
| `vfx_air_hop` | Air Hop | A firefly puff under the feet | 12 | 0.3 s |
| `vfx_tongue_hit` | Tongue hits | A small splat star | 6 | 0.2 s |
| `vfx_croak_ring` | Any croak | A ring mesh (not particles) grows to the croak radius, plus note sprites in the frog's Seat Hue that show the pentatonic note's height | 8 | 0.5 s |
| `vfx_chorus` | Chorus success | Rings merge into one gold chord ring; notes stack into a chord | 30 | 0.6 s |
| `vfx_chorus_fail` | "One sad croak" (FO §5.1) | One droopy note sprite falls and bounces | 1 | 1.0 s |
| `vfx_bell_ring` | Bell rung | Shimmer rings + 6 notes | 12 | 0.6 s |
| `vfx_sonar_ring` | Croak in `echo_warren` | The ring paints the maze walls it passes as glowing lines, fading over 1.5 s ("your croak draws the walls", D §6 row 13) | shader + 8 | 1.5 s |
| `vfx_spot_knock` | Spot knocked out | The orb's launch trail | 12 | 0.4 s |
| `vfx_spot_catch` | Orb or frog caught | A ring flash in the owner's Seat Hue and hug stars | 16 | 0.5 s |
| `vfx_spot_return` | Orb returns to its owner | A homing streak | 8 | 0.3 s |
| `vfx_hit_star` | Hit taken | A white comic impact star (never spot-gold) | 6 | 0.2 s |
| `vfx_dark_puff` | Going Dark | Cool grey smoke as the frog curls into its egg | 20 | 0.6 s |
| `vfx_ghost_trail` | Tadpole ghost | Bubbles | 6 | loop |
| `vfx_revive` | Revive | Egg pulses in sync, then a pop burst | 30 | 2.0 s + 0.4 s |
| `vfx_shove_whoosh` | Shove | Air streaks | 6 | 0.2 s |
| `vfx_splash` + `vfx_ripple` | Water entry | Splash plus a ring on the surface | 24 + 1 | 0.6 s |
| `vfx_glide_streamers` [B] | Gliding | Wind streaks off the membranes | 10 | loop |
| `vfx_moss_dry` [B] | Grip hold drying | Flakes | 8 | 0.5 s |
| **Social** [B] | | | | |
| `vfx_knot_tie` | Knot made | Two threads in both Seat Hues spiral and knot | 20 | 1.0 s |
| `vfx_knot_thread` | While Knotted and within 10 m | A faint thread, gradient Seat Hue A → B, alpha 0.35 | line | loop |
| `vfx_cut_channel` ♥ | Cut channel | The thread flashes crimson at 0.6 s and 1.0 s; sparks rise | 12 | 1.2 s |
| `vfx_cut_snap` ♥ | Cut completes | Crimson spark burst; the two ends fall slowly | 30 | 0.8 s |
| `vfx_hold_on` | Hold on succeeds | Gold sparks where the tongue wraps the thread | 12 | 0.4 s |
| `vfx_traitor_ink` ♥ | `[ TRAITOR ]` slam (03 §9.1) | A crimson ink splat behind the word | 20 | 0.6 s |
| `vfx_wanted_print` | Poster prints (03 §9.2) | A paper puff | 10 | 0.4 s |
| `vfx_vengeance_slime` | Vengeance lands | Goo splash + decal + falling drops for the rest of the room (03 §11.4) | 30 | 0.6 s + drops |
| **Rooms and world** | | | | |
| `vfx_door_slam` | Door counter slam | Dust burst and stone chips | 40 | 0.8 s |
| `vfx_plaque_glint` | A plaque enters view | A 4-sparkle glint | 4 | 0.4 s |
| `vfx_tell_arm` | Any cue arming | Rising motes in the tell colour | 8 | the lead |
| `vfx_stagger_stars` | Monster stagger | 5 white stars orbiting | 5 | 1–2 s |
| `vfx_sleep_z` | Monster asleep | Zzz bubbles | 3 | loop |
| `vfx_steam_jet` [B] | `slime_foundry` | Steam column | 60 | 1.5 s |
| `vfx_slime_afterimage` [B] | Slime dash | 20 ghost sprites along the path | 20 | 0.6 s |
| `vfx_water_rise_foam` [B] | Tether set piece | A foam line on the rising water | 60 | loop |
| `vfx_lightpillar_motes` | The Mouth's light pillar | Dust motes drifting down | 400 (instanced) | loop |
| `vfx_lantern_motes` | Lanterns | Rising glowing motes | 6 per lantern | loop |
| `vfx_mist` | Well water | Large soft sprites | 30 | loop |
| `vfx_hatch` | Egg hatch | 12 shell pieces and a 16-particle splash | 28 | 0.8 s |
| `vfx_rematch_flatten` [B] | Rematch door flatten | Cartoon flatten dust and speed lines | 40 | 0.6 s |
| `vfx_key_glint` [B] | Meeting keys | Sparkle | 4 | loop |
| `vfx_jar_inside` [B] | The Jar | Trapped fireflies swirling | 300 | loop |
| `vfx_jar_release` [B] | The Jar's lid pops (★1 pre-roll) | Every firefly streams up the shaft: the hero moment | 800 | 3 s |
| `vfx_trustfall_catch` [B] | Trust Fall caught | Gold burst and hug stars | 60 | 1.0 s |

**★1 components** [B] (01 owns the timing): the lanterns blooming into colour and name at 6.6 s, 40 boid birds (code-driven sprites), cloud-sea parallax meshes, the sun crest (light-shaft cone). Shells, shaders, Shuriken and Cinemachine only (D §8.2 #22).

**`FxPool` suppression (R8):** while any tell within 6 m of an effect is armed, that effect spawns at 30% count and with emission capped at 1.5.

---

## 9. Cameras (Cinemachine 3) [A unless marked]

10 §13.4 lists the rigs; these are the values. All are `CinemachineCamera`s with a `CinemachineBrain` on the main camera; default blend 0.35 s EaseInOut. Input is never locked except for the moments 07 §1.1 lists (the hatch, the Keeper pull-back, ★1) and the Betrayal Cam at a room exit (03 §9.1).

### 9.1 Rigs

| Rig | Components | Values |
|---|---|---|
| `cam_follow` (default) | Third Person Follow + Rotation Composer; `CinemachineInputAxisController` | Target `CamTarget` at (0, 0.90, 0) on the frog. Camera distance **4.5 m** (Settings 3.5–6.0). Camera side 0.62 (the frog sits a little left of centre). Shoulder offset (0.35, 0.25, 0); vertical arm 0.40. Damping (0.10, 0.25, 0.20). Pitch −35° to +70° in rooms, **−55° to +80° on Landings** (WORLD §4.5; 10 §13.4). FOV **60** (Settings 50–90). Recentring off. Obstacle avoidance: layers Environment, radius 0.20 m, into 0.05 s, out of 0.40 s. Frogs, fireflies and VFX are on `IgnoreCamera` |
| `cam_follow_wide` [B] | as follow | Distance 6.0 m, pitch bias +20°: `sp_grip_wall` and when hanging (GDD §13.8 climb cam) |
| `cam_raft` | as follow | Distance 5.5 m; follows 25% of the raft's roll, capped at 4°. **0° in reduced motion** |
| `cam_pair` [B] | Group Framing on a target group of the tethered or Knotted pair | Framing size 0.6 of the screen, distance 5–8 m; `sp_tongue_tether`, `heart_tied_bridge` |
| `cam_glance` | Pan Tilt override on the follow rig | First arrival at each Landing: pitch to +65° over 0.6 s, hold 0.6 s, back over 0.5 s; any look input over 2° cancels (WORLD §4.5) |
| `cam_pullback` | Spline Dolly on a spline up the real shaft + Pan Tilt | Keeper Landing, player-steered (FO §6.3; 10 §13.4). Auto-advance so the climb takes **9 s**; holding Move forward speeds it ×2 and back slows it ×0.5, clamped to **6–14 s**. Look ±60° yaw and ±40° pitch around the spline's up. FOV 60 → 70. Holds 1.5 s on the widened Mouth while a Wish Coin falls past (`vfx_wishcoin_rain`), then blends back to follow in 1.0 s |
| `cam_betrayal` [B] | Group Framing on the traitor–victim group | 03 §9.1: elevation 35°, distance 7 m, FOV 40, 0.5 m dolly-in, letterbox 2.39:1 |
| `cam_fall_replay` | Group Framing on the faller and the blamed frog | Side-on, elevation 20°, distance 6 m, FOV 45; 03 §5.2 owns what plays |
| `cam_trustfall` [B] | Hard Look At, locked | Faces away from the catch ring and up at the Jar and the Mouth; FOV 70; the sky fills the frame until you are caught (GDD §13.8) |
| `cam_ghost` | Third Person Follow + Confiner 3D | Distance 3.0 m, confined to the room's bounds |
| `cam_hatch` | Hard Look At | 07 owns the 2.8 s shot |
| `cam_title` | Spline Dolly, auto | 0.3 m above the black water, pitch +38° toward the Mouth, FOV 50, drifting 0.2 m/s (FO §6.1 0:00) |
| `cam_mirror` | Orbital Follow | 08 §7.2: 1.4 m front 3/4, FOV 35, 0.35 s ease |
| `cam_meeting_window` [B] | Secondary camera to a RenderTexture | 320 × 180 at 15 fps (05 §3.4), with the `KW_ShadowGlass` look: desaturated 100% except emissive, tinted `#7C9CC8` |
| `cam_portrait` | Offscreen | Bestiary portraits (build time, §6.3) and the WANTED face RenderTexture (256 × 356; 03 §9.2) |
| `cam_star1_*` [B] | Spline Dolly, Follow Zoom (the dolly-zoom), Group Framing | 01 owns the shot list (WORLD §10.2); 10 §13.6 runs it |
| `cam_sharecard` [SHOULD] | Group Framing to a RenderTexture | Captures the group shot at the Keeper pull-back and on the Rim (D §7 SHOULD 1) |

### 9.2 Impulse presets (`juice.json`)

One `CinemachineImpulseListener` on the brain's camera; channels: 1 = local only, 2 = world.

| Preset | Amplitude (m) | Frequency (Hz) | Duration (s) | Radius | Channel | Trigger |
|---|---|---|---|---|---|---|
| `imp_land_charged` | 0.04 | 18 | 0.15 | — | local | Your charged-hop landing |
| `imp_door_slam` | 0.10 | 14 | 0.30 | — | local | Door counter slam (05 §3.1) |
| `imp_shove` | 0.03 | 20 | 0.10 | — | local | Your shove connects, or you are shoved |
| `imp_hit_taken` | 0.08 | 16 | 0.20 | — | local | You lose a spot |
| `imp_bell` | 0.02 | 25 | 0.12 | 8 m | world | A bell rings near you |
| `imp_golem_stomp` | 0.12 | 10 | 0.35 | 20 m | world | Golem and Keeper stomps |
| `imp_shatter_croak` | 0.08 | 12 | 0.25 | 12 m | world | Shatter Croak |
| `imp_thunder_croak` [B] | 0.16 | 9 | 0.45 | 15 m | world | Thunder Croak |
| `imp_awakening` | 0.07 | 10 | 0.30 | — | local | Your Awakening |
| `imp_rank_up` | 0.06 | 12 | 0.20 | — | local | Tower Rank burst (04 §8.3) |
| `imp_raft_splash` | 0.05 | 12 | 0.20 | 10 m | world | A frog lands on the raft |
| `imp_traitor` [B] | 0.06 | 14 | 0.20 | — | local | `[ TRAITOR ]` slam |
| `imp_jar_drop` [B] | 0.30 | 6 | 0.80 | 40 m | world | The Jar hits the floor |

- **Cap:** the summed amplitude at the listener never exceeds 0.30 m (0.35 only for `imp_jar_drop`).
- **Settings:** Camera shake 0–100% (default 100%). Reduced motion sets it to 0.
- **Never shake during a tell's last 1.0 s** (R8), except the tell's own act.

---

## 10. Juice rules (`presentation/juice.json`) [A]

Built on the ~200-line `Juice` library over PrimeTween and Cinemachine Impulse (UT; 10 §13.4). FO §6.2 #1: responsive controls and juice come before fidelity.

### 10.1 The one hard rule

**Hitstop and slow motion are local and visual.** Hitstop freezes the involved frogs' visual pose, their VFX and the camera; it never touches `Time.timeScale`, because on the host that would freeze the simulation for everyone (10 §13.4). Slow motion exists only in replays (the Betrayal Cam, the fall replay), which re-simulate the local ragdoll layer (FO §5.1).

### 10.2 Hitstop

| Event | Frozen | Duration |
|---|---|---|
| You pop a mite | your frog | 40 ms |
| Jar pops in the lineup | the jar | 40 ms each |
| Pot shatter | your frog, the pot | 50 ms |
| You ring a bell | your frog, the bell | 50 ms |
| Shove connects | both frogs (10's shove spec) | 60 ms |
| Spot or friend caught | catcher and caught | 70 ms |
| You lose a spot | you and the hitting monster's pose | 80 ms |
| Door counter slam | camera | 80 ms (05 §3.1) |
| Level-up | your frog | 80 ms (04 §2.3) |
| Shatter Croak | your frog, every shattering pot | 100 ms |
| Thunder Croak [B] | your frog and everything in radius | 120 ms |
| Rank-up burst | the bar, your frog | 120 ms (04 §8.3) |
| Trust Fall catch [B] | catcher and caught | 120 ms |
| Awakening | your frog | 150 ms |

Hitstops never stack (the longest active one wins) and are capped at 150 ms. FO §6.2 #1's range is 50–120 ms for pops and hits; the 40 ms and 150 ms entries sit outside it on purpose (tiny pops, the Awakening).

### 10.3 Squash and stretch

Visual only, on the body's visual root; the collider never changes (02 H1). Volume-preserving: `xz = 1 / sqrt(y)`. Return springs use frequency 7 Hz, damping ratio 0.45.

| Preset | Y scale (XZ follows) | Timing |
|---|---|---|
| `hop_anticip` | 0.85 | 50 ms |
| `hop_takeoff` | 1.18 | 80 ms |
| `land_tap` | 0.82, held | 60 ms, then the spring |
| `charge` | 1.00 → 0.72 across the charge | the charge time |
| `hop_charged_release` / `land_charged` | 1.25 / 0.78 | 90 / 70 ms |
| `croak_body` | 1.04 punch | 120 ms |
| `hit_taken` | 0.80 | 80 ms |
| `catch` | XZ 1.10 punch on both | 150 ms |
| `splat` | 0.60 | 250 ms, then pops back |
| `levelup` | belly 1.08 punch (04 §2.3) | 350 ms |
| `ui_punch` | 1.12 punch, OutBack | 180 ms |

### 10.4 Count-ups at rising pitch

- Tick rate ≤ 20 per second. Each tick plays the next pentatonic note of the current layer's scale (§15.3), starting from the scale root; after 2 octaves it loops within the top octave.
- A count-up always takes 0.6–1.5 s: totals over 30 step in larger increments.
- Used by: fireflies banking, Wish Coins → Pearls, RP, the jar lineup, the stall wallet.
- The final value lands with `ui_punch` and a chord.

### 10.5 Screen effects

| Effect | Where | Values | Reduced motion |
|---|---|---|---|
| Chromatic pulse | `[ TRAITOR ]`; E-door special moves | 0 → 0.4 in 80 ms, back in 300 ms | off |
| Desaturate-except | Betrayal Cam (03 §9.1) | world −40%, the two frogs full | kept (no motion) |
| Vignette pulse | You lose a spot | +0.15 for 300 ms | kept |
| Letterbox | Betrayal Cam | 2.39:1 in 0.3 s | kept |
| Radial speed lines | Frog Sling, Rematch flatten [B] | 24 lines, 0.3 s | off |

### 10.6 The juice checklist for every room (feeds 05's Definition of Done)

A room is not done until a reviewer ticks all of these in its frame-sequence clips (plan_2 via D):
1. Every pop, hit and clear has a hitstop from §10.2.
2. Every hop and landing squashes (§10.3).
3. Every reward counts up at rising pitch (§10.4).
4. The cue is a positional sound **and** a glow **and** a caption (R4).
5. The armed tell reads at 25 m in the 3 golden screenshots (R5).
6. At least one laugh-shaped physical beat (a wobble, a splash, a spat-out frog) is juiced with a shake or a squash.
7. Nothing flashes near an armed tell (R8).

---

## 11. UI language: the System window [A]

### 11.1 Voice (03 owns the rules and the 54 sample lines)

The System is "a dry, sarcastic announcer that hypes your growth and roasts your mistakes" (03 §14.1). What that means for the screen:
- one `[ BRACKETED CAPS ]` header plus at most one sentence of ≤ 90 characters (03 §14.1);
- growth lines name the change **and** its cause: `[ TONGUE II ] 4.5 m. Grapple unlocked. Because: you grabbed 14 things.` (FO §4.1);
- **never a stat sheet** (FO §6.2 #4, via RR's Dr. O);
- every number comes from a data key (FO §8.6 test).

### 11.2 Anatomy

```
  ┌─[ TONGUE II ]──────────────────────────────────────────────┐
  │ (icon)  4.5 m. Grapple unlocked. Because: you grabbed 14 things.  │
  └───────────────────────────────────────────────────────────┘
   └ bracket corners 12 px              width 360–760 px, auto ┘
```

| Part | Spec |
|---|---|
| Position | Top-centre, top edge at y 144 px (below the room clock and rule chip, §13.5) |
| Size | Width 360–760 px (auto), padding 14 × 20 px, min height 56 px. At most **2 windows visible**, stacked with an 8 px gap; at most 3 waiting (03 §14.2) |
| Panel | `system_bg` at 92%; 2 px `system_line` border; 8 px outer glow in `system_line` at 35%; 12 px bracket corners, 3 px thick |
| Header | JetBrains Mono ExtraBold, 20 px, uppercase, tracking 0.12 em. Colour by kind (below) |
| Body | JetBrains Mono SemiBold, 18 px, line height 1.35, `text`. Bound numbers bold, in `growth` on growth lines. "Because:" in `text_muted` |
| Icon | Optional 40 px at the left: the verb, Boon mark, level orb or monster thumbnail |
| Enter / exit | Header appears at once; the panel slides down 12 px and fades in 200 ms; the body types at **35 cps** (03 §14.2) with the System chime (§15.6); fade out 200 ms |
| Lifetime | 3.0 s + 40 ms per character after typing ends (03 §14.2) |
| Redaction | `█` blocks with a 0.8 Hz shimmer (03 §14.1); Hell adds a thin static line along the bottom edge |
| Priority | 03 §14.2 (P0 rules and safety … P3 flavour). During a cue window only P0 shows (R8) |
| Theme cosmetic | Recolours panel and border only (08 §2) |
| History | The pause menu's System log shows the last 10 (03 §14.2) |

**Header colour by kind:**

| Kind | Examples (03 owns the text) | Header colour | Extra |
|---|---|---|---|
| Rule and safety (P0) | `[ CLEAR ]`, `[ FAILED ]`, `[ DARK ]`, `[ VOTE ]` | `system_line` | — |
| Growth (P1) | `[ GLOW 4 → 5 ]`, `[ TONGUE II ]`, `[ BOON ]`, `[ AWAKENING ]`, `[ NOTED ]`, `[ CHOICE UNLOCKED ]`, `[ PARTY RANK UP ]` | `growth` | icon |
| Social (P2) | `[ KNOT ]`, `[ VENGEANCE ]`, `[ UNDERDOG ]` | `text` | — |
| Betrayal | `[ TRAITOR ]` (the Cam stinger, 03 §9.1) | `crimson` | ink splat |
| Private | `[ HIDDEN CONDITION DETECTED ]`, secret-quest progress | `system_line` | an eye icon and an `ONLY YOU` tag in `text_muted` |
| Warning | last 20 s, 1 spot left, `[ THE TOWER WILL WAIT ]` | `warn` | — |

### 11.3 Four sizes of message

| Size | Use | Spec |
|---|---|---|
| **Window** | Almost everything (§11.2) | — |
| **Rule chip** | The room's rule after its `[ CLEAR ]` window | Pinned under the clock for the whole room (§13.5) |
| **Banner** | Lobby-wide news: `Pip's frog changed: ECHO TOAD` (FO §4.2), Vengeance landed, a class reveal | 480 × 64 px at the right edge, 30% from the top; in 300 ms, hold 3 s, out 300 ms (GDD §14.6). Fraunces 600 22 px + icon |
| **Full-screen card** | At most **one per door** (D §5): the Awakening fanfare, or the Betrayal Cam (03 §9.1), or ★1 (01) | `CardGate` downgrades a second card in the same door to a banner. The Awakening card: vignette 0.5, the verb's new name at 96 px Fraunces 800 in `growth`, the part popping in; 0.9 s; input stays live |

### 11.4 Copy rules for all UI text

- Sentence case for labels and buttons; CAPS only in System headers, plaque letters and the door counter.
- Every number is bound to data (FO §8.6; 10's `LocalizationTests`).
- Buttons are verbs: "Climb again", "Rest", "Climb on", "Equip", "Wishlist".
- **Equal-weight choices** (FO §4.4 #7): paired buttons share size, style and colour; "go" is on the left, "stop" on the right; **no countdown on any choice; nothing auto-starts**.
- No retired word from D §10 appears in any string table (`UiCopyTests`).
- No invented percentage anywhere (FO §2.2; D §8.3). Real ones only: Steam achievement rates, the published gold-door odds.
- The teaser never names a real friend (FO §4.4 #8).

---

## 12. UI tech [A]

### 12.1 Stack

| Layer | Tech |
|---|---|
| Every screen, HUD and overlay | **UI Toolkit** runtime (UXML + USS written by agents; 10 §13.5) |
| World-space text on plaques | **TextMeshPro** 3D text (uGUI 2.0 package; 10 §2) with the `KW_TMP_Glow` shader: a copy of TMP's SDF shader with an HDR `_EmissionIntensity`, so plaque glyphs bloom (the stock SDF shader has no HDR emission control) |
| The ring map | UI Toolkit `Painter2D` arcs; on the hub wall through `PanelSettings.targetTexture` (1,024²), directly in pause and results (10 §13.5) |
| Strings | Localization string tables `KW_UI`, `KW_System`, `KW_Rooms`, `KW_Barks` with Smart Strings (10 §4.2), bound in UXML |
| Input | Input System UI module; every screen fully navigable by gamepad; focus ring §7.4 |
| Motion | USS transitions for panels; PrimeTween for number rolls and punches (`style.scale`, `style.translate`) |

### 12.2 PanelSettings

| Asset | Sort | Holds |
|---|---|---|
| `PS_World` | — (RenderTexture 1,024²) | The map on the hub wall |
| `PS_HUD` | 0 | Room and Landing HUD, name tags, pings, captions |
| `PS_System` | 10 | System windows, banners, the rule chip |
| `PS_Menu` | 20 | Menus, the lobby, the Mirror, Bestiary, settings, results |
| `PS_Modal` | 30 | Full-screen cards, confirmations |

All screen panels: Scale With Screen Size, reference 1920 × 1080, match 0.5, then × the user's UI scale (80–130%).

### 12.3 Tokens and styles

`kw_gen_uss` (a `[CliCommand]`) writes `Assets/_Knotwell/UI/tokens.uss` from `palette.json`, so USS and shaders never drift:
```css
:root {
  --kw-night: #0B0F14; --kw-panel: rgba(20,27,36,0.92); --kw-text: #F4EDE3; --kw-text-muted: #A7A39B;
  --kw-system-bg: rgba(11,22,48,0.92); --kw-system-line: #5CE1E6; --kw-growth: #FFE066; --kw-gold: #FFD84A;
  --kw-crimson: #FF3D6E; --kw-warn: #FFA630; --kw-ok: #7CE08A;
  --kw-seat-1: #FF9933; /* … --kw-seat-8 */
  --kw-font-display: resource("Fonts/Fraunces SDF"); --kw-font-ui: resource("Fonts/Nunito SDF");
  --kw-font-mono: resource("Fonts/JetBrainsMono SDF");
}
```
Components live in `components.uss` (`.kw-button`, `.kw-chip`, `.kw-window`, `.kw-tile`, `.kw-bar`). Screens are `UI/Screens/<screen>.uxml`.

### 12.4 Fonts

All are SIL Open Font License 1.1 (Google Fonts). Each file gets a `licenses.csv` row (FO §8.6), and the OFL text ships in `Licenses/` and on the Credits screen.

| Role | Font | Weights | Font asset |
|---|---|---|---|
| Display: logo, door counter, plaques, card titles, banners | **Fraunces** (soft, "WONK" on) | 600, 800 | Dynamic SDF, 1,024² atlas, padding 9 |
| UI body, menus, barks, captions | **Nunito** | 400, 700, 800 | Dynamic SDF, 1,024² |
| System windows, numbers, timers | **JetBrains Mono** | 600, 800 | Dynamic SDF, 1,024² |
| Dyslexia-friendly swap for Nunito (§14) | **Atkinson Hyperlegible** | 400, 700 | Dynamic SDF |
| Korean in the statue inscription and layer cards [A statue · B cards] | **Noto Serif KR**, static subset of 15 glyphs: 우 물 안 개 구 리 하 늘 주 너 머 井 底 之 蛙 | 700 | Static SDF, 512² |
| Korean localisation [SHOULD] | **Noto Sans KR** subset (10 §13.5) | 400, 700 | Static SDF from the `ko` string table's characters |

**Type scale** (px at 1080p, before the text-size setting):

| Style | Size | Font |
|---|---|---|
| Door counter slam | 160 | Fraunces 800 |
| Card title | 96 | Fraunces 800 |
| Screen title | 48 | Fraunces 800 |
| H1 / H2 | 36 / 28 | Nunito 800 |
| Body | 20 | Nunito 700 |
| Small (the minimum anywhere) | 16 | Nunito 700 |
| HUD numbers | 28–44 | JetBrains Mono 800 |
| System header / body | 20 / 18 | JetBrains Mono 800 / 600 |
| Captions | 22 | Nunito 700 |

### 12.5 Icons

`IconBaker` (a `[CliCommand]`) rasterises vector paths from `presentation/icons.json` into 256² white-on-transparent PNG sprites with mipmaps; USS tints them (`-unity-background-image-tint-color`). Sets:
- suits (♠ ♦ ♣ ♥, E eye-in-hexagon);
- the 8 seat glyphs (§2.3);
- prizes (Boon orb, jar, gold jar, key, window, Rematch hourglass);
- skull;
- verbs (Hop, Tongue, Croak) × ranks I–IV;
- Boon families (Body, Sight, Chorus, Risk, Duo, Legendary);
- badges (BOT gear, ROOKIE leaf, HOST house, Knot, WANTED, ghost, egg);
- currencies (Wish Coin, Pearl);
- the 4 Bestiary stamps;
- input glyphs: keyboard and gamepad prompts from Kenney's CC0 input-prompt art (verify the pack name and add its `licenses.csv` row at import).

No icon uses card, dice or chip imagery (FO §4.1: Boons never look like gambling).

### 12.6 World-space and screen-anchored elements

| Element | How |
|---|---|
| Plaques | TMP 3D number and letter (glyphs 0.35 m, 05 §3.2) + glow-chalk icon quads from the atlas |
| Name tags, pings, egg prompts, off-screen chevrons | `PS_HUD` elements placed each `LateUpdate` with `RuntimePanelUtils.CameraTransformWorldToPanel`, moved with `style.translate` (no layout pass), `usageHints = DynamicTransform` |
| WANTED poster | World-space billboard quad; the face is a RenderTexture from `cam_portrait` (03 §9.2) |
| Boon orbs | World-space glow-chalk meshes, rendered only on their owner's client (§13.8) |
| Walk-vote rings | Floor decals (§13.7) |

**UI budget:** ≤ 0.4 ms GPU (§3.4) and ≤ 0.5 ms main-thread CPU. The clock's text updates at 10 Hz, not every frame.

---

## 13. Screens (wireframes at 1920 × 1080)

Diagrams are schematic: positions and sizes in the notes are the spec. Seat glyphs appear as ● ▲ ■ ✿ ✚ ⬢ ◗ and "drop"; ◈ is a Wish Coin, ◌ a Pearl. Names in the diagrams are examples.

### 13.1 Title: the well bottom is the menu [A]

```
┌────────────────────────────────────────────────────────────────────────────┐
│                                   ( )  ← the Mouth: a 31° coin of sky, 180 m up│
│                                · ·  · ·   12 anonymous lantern points          │
│  K N O T W E L L                                                             │
│  Climb together. Fall alone.                                                 │
│                                                                              │
│                                                                              │
│       ~  ~  ~   black water, mist   ~  ~    o o o o o o o o   8 eggs bob      │
│                                                                              │
│                              Press any key                                   │
│  v1.0.0                                                          Esc  Menu    │
└────────────────────────────────────────────────────────────────────────────┘
```
- `cam_title` (§9.1); mood `well_bottom`; music `mus_hub`.
- The logo (§16.1) sits top-left at 30% of the width. It fades 1.2 s after the first input.
- "Press any key" pulses at 0.5 Hz. Any key hatches **your egg** (your Seat Hue) and puts you in control in ≤ 5 s (FO §3.5; 07 owns the 2.8 s hatch).
- On a later launch, one System line shows the last climb's teaser (FO §4.4 #8), for example `[ SOMETHING IS WAITING ] 12E.`

### 13.2 The hub menu: stations first, a list as backup [A]

The stations are diegetic (07 places them): the 4 difficulty doors (Play), the map wall, the Mirror, the statue, the Bestiary book, and the eggs (the seats). Each shows a 28 px world prompt when you are within 3 m: `Tongue · The Mirror`.

**Esc / Start** opens a 420 px left column over the live hub (`PS_Menu`):
```
┌───────────────────────┐
│ KNOTWELL              │
│ ▸ Play                │  (walks your frog to the difficulty doors)
│   Invite friends      │  (Steam overlay)
│   Join by code        │
│   The map             │
│   The Mirror          │
│   Bestiary            │
│   Settings            │
│   Credits & licences  │
│   Quit                │
└───────────────────────┘
```

### 13.3 Lobby [A: friends, private, LAN · SHOULD: public]

A 600 px right panel over the live hub. The eggs in the water mirror the 8 seats: a human who joins hatches from their egg.
```
┌──────────────────────────────── LOBBY ────────────────────────────────┐
│ Friends · private        Code K7F-2QX  [Copy] [Invite ▸] [LAN ▸]       │
│ Climb  (● Quick Climb ~11 min) (○ Full Climb ~24 min) (○ Resume: L2)   │
│        (○ Landing Party)                                               │
│───────────────────────────────────────────────────────────────────────│
│ ● 1  You            HOST   Rank E  Best door 14   in a doorway ✓       │
│ ▲ 2  Friend A              Rank D  Best door 17   in the hub           │
│ ■ 3  Kestrel   BOT · ROOKIE                       [Swap Rival ▾]       │
│ ✿ 4  Moss      BOT · ROOKIE                       [Swap Rival ▾]       │
│ … rows 5–8                                                             │
│───────────────────────────────────────────────────────────────────────│
│ Host options  Heart doors between humans [On]   Masked Rivals [Off]    │
│               Rank Sync [Off]   Blame tags [On]                        │
│ Difficulty    Walk into a door:  EASY · NORMAL · HARD (chained) · HELL (chained) │
│               Hard unlocks when anyone here clears a Keeper.           │
└───────────────────────────────────────────────────────────────────────┘
```
- Rows are 44 px: seat glyph in its Seat Hue, name, badges, rank letter (04 colours), best door.
- **Starting is walking** (D §4): 4 s after the first human steps into a difficulty doorway, the door with more humans opens. No Ready button.
- Chains on Hard and Hell show their true unlock rule (FO §3.6; D §11 ruling 7: the System never lies).
- Host options follow the lobby-type table (FO §5.2; 03 §2). Public lobbies [SHOULD] hide them, force BOT badges and turn Rank Sync on.
- Streamer-safe [SHOULD]: the code shows as `•••-•••`.

### 13.4 The map [A: the Well band · B: forks, the Sky band named]

01 owns the geometry; this is the panel. Full screen from pause and the hub wall; a 360 px strip under the results counter.
```
┌──────────────────────────────── THE MAP ───────────────────────────────┐
│                         ( ? )  Beyond                                   │
│                     (   ( ? )  Space    )                               │
│                 (   (   ( ? )  Sky        )   )    named after ★1        │
│             (   (   (  THE WELL  1 → 20  )   )   )                      │
│        door nodes spiral outward: 1 · 2 · 3C · 4 · 5B · L1 · 6 · 7C …    │
│        forks branch into lettered lobes: 12B / 12E                      │
│                                                                         │
│  You: best door 14          Friends: Friend A 17 · Friend B 9           │
│  Legend: ♠ ♦ ♣ ♥ E · cleared ✓ · failed (cracked) · hidden clear ☆ ·    │
│          gold door · Rematch hourglass · Landing lantern · Keeper · Warden │
└─────────────────────────────────────────────────────────────────────────┘
```
- Door nodes are 22 px; Landing nodes 30 px with a lantern icon; the Keeper is a bell icon, the Warden a jar.
- **Node states, each a shape as well as a colour:** future = dashed ring; reached = solid; cleared = `ok` tick; failed = cracked ring in `warn`; hidden clear = `gold` star; gold door = `gold` fill; Rematch = hourglass; Heart = ♥ glyph; current = a ring pulsing in `growth` at 1 Hz.
- Your path is a 3 px `growth` line. Friends' best doors are pearl pins outside the band with their initial.
- Outer bands are drawn from 0:00 but dim and labelled `?` until surfaced, so the "layers from centre to outward circle" shape is on screen at once without spoilers (D §4).
- Future doors show only their number; suits appear when you reach their DoorHall.

### 13.5 Room HUD [A]

```
┌────────────────────────────────────────────────────────────────────────────┐
│┌──────────┐                 ┌────────┐                             ◈ 37     │
││ 7C ♣ ☠☠  │                 │  0:41  │  room clock (count-up)               │
││ lives ◉◉◯│   [ CLEAR ] Snuff all its lamps in one breath. Twice.   Lamps 3/5 │
│└──────────┘          ┌─[ BOON ]──────────────────────────────┐                │
│▲ Friend A ●●○ Lv5    │ Chorus. Because: you croaked in time.   │                │
│■ Kestrel BOT ●●● Lv4 └────────────────────────────────────────┘                │
│✿ Moss BOT ●●● Lv4                                                            │
│✚ Vex BOT ●○○ Lv4 (Knot)                    ·   reticle                      │
│                                                                              │
│                          [bell rings ←]  caption                             │
│┌──────────────┐        ┌──┬──┬──┬──┬────┐                    Tongue · grab ▸ │
││ ◉ ◉ ◯   Lv 5 │        │B1│B2│B3│B4│PWR │    H II · T III · C II              │
││ ▓▓▓▓▓▒▒░ +12 │        └──┴──┴──┴──┴────┘                                    │
│└──────────────┘                                                              │
└────────────────────────────────────────────────────────────────────────────┘
```

| Element | Position and size | Rules |
|---|---|---|
| Door chip | Top-left, 24 px margin, 220 × 96 px | `7C` Fraunces 800 44 px, suit glyph 32 px, skulls 20 px (up to 4 on Hard). Team Lives as lantern pips (Easy: ∞). Difficulty word 14 px |
| Room clock | Top-centre, y 24, 120 × 48 px chip | Count-up `m:ss`, JetBrains Mono 32 px, in rule doors, Heart doors, set pieces, Keeper and Warden. **Amber (`warn`) in the last 20 s**, when the hard timer shows and a bell tolls every 5 s (05 §2.4). Never crimson |
| Rule chip | Under the clock, y 84, ≤ 760 px | The full rule (≤ 14 words, D §4) stays pinned for the whole room, JetBrains Mono 16 px, at most 2 lines. Redacted blocks under Sealed and Hell (05 §3.6). A clause you died to last time glows gold for 3 s (04 §9.3) |
| Objective counter | Right of the rule chip | Only when the clear condition counts things ("Lamps 3/5"), from the RoomDef |
| System windows | Top-centre from y 144 | §11 |
| Wish Coins | Top-right, 24 px margin | Coin icon + count; `+N` pops with `ui_punch` |
| Party strip | Left edge from y 200; up to 7 rows × 36 px | Seat glyph (Seat Hue), name 16 px, 3 spot pips (filled or hollow), Lv, badges (BOT, ROOKIE), Knot icon, WANTED icon, ghost icon with "revive" and a direction chevron within 20 m, a grey "other room" icon at forks |
| Your status | Bottom-left, 24 px margin, 300 × 110 px | 3 big spot icons (40 px, filled or hollow, mirroring your back), Glow Lv (Fraunces 36 px), a firefly bar: banked progress to the next level (solid Glow colour) + the cheeks' preview (hatched) + the unbanked count |
| Boon bar | Bottom-centre | 4 passive slots (56 px) + the Power slot (64 px, gem-shaped) with a clockwise cooldown ring; rank pips; the Signature hold ring once a class is active [B] |
| Verb ranks | Right of the Boon bar | `H II · T III · C II`, 16 px, with verb icons |
| Context prompt | Bottom-right | `Tongue · grab` with the device's input glyph |
| Reticle | Centre, 12 px dot | Becomes a `growth` ring when a tongue target is in range; props get an outline; frogs get their Seat Hue ring |
| Captions | Bottom-centre, above the Boon bar | §14.3 |
| Off-screen chevrons | Screen edge | Your Knot partner (Seat Hue), Dark friends' eggs, pings |

**Tadpole ghost HUD:** the screen desaturates 50% with a 0.35 vignette; the status panel reads "Tadpole ghost · nudge ready" with a 10 s ring (FO §3.7); a prompt tells the living "Hold Croak over the egg".

### 13.6 Landing HUD [A]

Same as the room HUD except:
- **no room clock and no rule chip.** A **Landing ring** (the 40 s budget, 07) sits top-centre around a "Climb on" doorway icon, with `In the doorway: 2 / 3` (07's walk-out exit rule);
- world prompts on the stations: stall, jar lineup, toy, Knot spot, Mirror;
- the stall wallet shows under the Wish Coins;
- the jar lineup plays in the world (04 §10.2), each jar's coins arcing into cheeks with a count-up.

### 13.7 DoorHall and plaques [A]

**Plaque** (05 §3.2: 1.2 × 0.8 m, self-lit, exactly 4 things):
```
┌──────────────────────────────────────┐  1.2 m
│  12E                        SOLO     │  number + letter: Fraunces 800, 0.35 m, glow 2.5
│                                      │
│   [suit glyph 0.28 m]   [prize 0.22 m]│
│                                      │
│   ☠ ☠                                │  skulls 0.10 m each (Hard +1)
└──────────────────────────────────────┘  0.8 m
```
- Stone `#3A3F46` with a glow-chalk trim in the suit accent (§2.4). ♥ doors: only the ♥ glyph is crimson. Gold door: the whole plaque `gold`. Rematch: the hourglass prize with the old time under it (05 §3.2).
- The Sealed seal sits under the plaque (05 §3.6); it glows `system_line` when armed.
- Rank C's "see one door ahead" talent (04) shows its preview icons on the door **lintel**, never on the plaque.

**Walk-vote:** a 2 × 2 m floor ring in front of each door (a decal). Each human standing in it shows as their seat glyph on the ring. The leading door's ring fills clockwise in `growth` over the 4 s (D §4); a tie shows both rings half-filled.

**Door counter slam** (05 §3.1): `DOOR 12`, Fraunces 800 160 px, centred, 0.35 s with `imp_door_slam` and 80 ms hitstop, then it flies to the door chip.

### 13.8 Boon pick: tongue the one you want [A: the Keeper's first · B: every pick]

Diegetic, so it needs no new binding and your frog keeps moving (07 §1.1 rule 3):
- **3 orbs** (4 with the comeback bonus, FO §4.1) float in a 100° arc 1.2 m in front of your frog at eye height. **Only your client renders them** (host-salted private offers, 10 §7).
- **Aim and press Tongue** to take one; the orb flies to its body mark (`vfx_boon_grant`). On a gamepad a stick flick moves the highlight and Tongue confirms.
- **Reroll** is a smaller fourth orb showing its charges; tongue it to reroll.
- **8 s** (FO §4.1); on timeout the highlighted orb (the System's pick) is taken.
- **Slots full:** your 5 slot orbs appear in a second row; tongue one to replace it and it shatters (`vfx_boon_shatter`).

The info strip in the lower third (`PS_Menu`, 900 × 150 px) shows the highlighted orb, per 04 §6.6:
```
┌──────────────────────────────────────────────────────────────────────┐
│ [family colour]  SPRING LEGS  ●●○  UPGRADE      synergy: Leapfrog ⟲   │
│ A charged landing bounces you again.                                  │
│ ▓▓▓▓▓▓▓▓▓▓▓░░░░░ 5 s          Reroll ×2                               │
└──────────────────────────────────────────────────────────────────────┘
```

### 13.9 Name tags and world markers [A]

- **Name tag** (at the `Tag` socket): a 22 px chip `[glyph] Name [rank letter]` filled with the Seat Hue (text per §2.3), with 3 spot pips below and badges to the right. Constant screen size to 25 m; beyond 25 m only glyph and pips; hidden beyond 40 m unless Knotted or pinged. Hidden behind walls except for your Knot partner (§4.8).
- **Blame pill** (03 §5.1): 0.6 m above the tag for 2.5 s, `ink` at 80%, the blamer's name in their Seat Hue.
- **WANTED poster** (03 §9.2): 0.5 × 0.7 m, 0.9 m above the tag.
- **Pings** (03 §13): a 3 s marker. Monster `danger_ping`; prop your Seat Hue; door `gold`; frog their Seat Hue; place white.
- **Knocked-out spot:** the owner's Seat Hue ring with a 3 s countdown (§6.1).
- **Dark egg:** an egg icon with "Hold Croak · 2 s" and a fill ring while someone revives (FO §3.7).
- **Vengeance target** (visible to the victim only): a comic target reticle in `warn` over the traitor for the next shared room (03 §11).

### 13.10 Results ceremony [A]

04 owns the content and FO §4.4 the order. It is a **lower-third overlay while everyone roams** (07 §1.1 rule 3), on the Rim after ★1 or at the Well Bottom otherwise (07 §1.2). About 20 s; hold Hop 0.5 s to skip after the first time.
```
┌────────────────────────────────────────────────────────────────────────────┐
│   (the party roams; the camera stays on your frog)     ┌──────────────────┐ │
│                                                        │ DOOR 14 · BEST 17│ │
│                                                        │ [map strip]      │ │
│                                                        └──────────────────┘ │
│┌──────────────────────────────────────────────────────────────────────────┐│
││ Wish Coins 86 → Pearls +43   ◌ 385     Acorn Cap  120 / 150  ▓▓▓▓▓▓▓░     ││
││ Bestiary   [SEEN] [SURVIVED] [CLEARED]  stamps land one at a time          ││
││ Class      Echo Toad  2 / 3 bells          Titles: {title}                  ││
││ Tower Rank  E ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░ D   92%                                ││
││           [ Climb again ]              [ Rest ]          Worth it? Yes Meh No ││
││ Something is waiting in 12E.                                                ││
│└──────────────────────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────────────────────┘
```
1. **The door counter slams** into the top-right card: `DOOR 14 · BEST 17` (FO §4.4 step 1), with the map strip (§13.4).
2. **Wish Coins count up into Pearls** at rising pitch (§10.4). 08 §7.5's wishlist bar fills underneath; `[ AFFORDABLE ]` chimes if it crosses the price. No buy button here.
3. **Bestiary stamps** land one at a time, 0.4 s apart, each with an ink thump (04 §9.2).
4. **Class and secret-quest progress.**
5. **Titles:** cosmetic callouts only; nothing counts betrayals (FO §4.4).
6. **The Tower Rank bar comes last** (goal gradient). A near-miss line such as `92%` appears only on this deterministic bar (FO §4.4). A rank-up plays 04 §8.3's beats.
7. **Two equal buttons**, "Climb again" and "Rest" (§11.4). Nothing starts by itself.
8. **The teaser** (FO §4.4 #8).
- **"Worth it?"** (FO §8.5): three equal chips to the right of the buttons, optional, gone after 10 s, never blocking.
- **First surfacing** adds a `+50 Pearls` line in `gold` at step 2 (D §8.2 #17). Hell adds the Hell border around the whole panel (FO §3.6).

### 13.11 The Mirror: wardrobe and shop [A: Hat, Skin, Glow · B: all slots]

08 §7 owns the behaviour; this is its layout.
```
┌───────────────────────────────┬────────────────────────────────────────────┐
│                               │ THE MIRROR                Collection 23 / 51 │
│   your frog, close-up         │ Featured  [Kestrel wore this] [Closest] [New]│
│   "in the reflection"         │ Hat · Skin · Glow · Croak · Tongue · Emote ·  │
│   (world dimmed 30%)          │ Door · Snap · Window (earned) · Ghost (earned)│
│                               │ ┌────────┐ ┌────────┐ ┌────────┐             │
│   Light: (Rule room)          │ │  tile  │ │  tile  │ │  tile  │  3 columns  │
│          (Landing) (Rim)      │ └────────┘ └────────┘ └────────┘             │
│   TRYING ON                   │   …                                          │
│                               │ [Equip] [Buy 150 ◌] [☆ Wishlist]             │
│                               │ [See on Rivals] [Outfits]           ◌ 342     │
└───────────────────────────────┴────────────────────────────────────────────┘
```
- The panel is the right 40% (08 §7.2); `cam_mirror`.
- **Tiles** are 148 × 180 px: an item render under the selected lighting preset, the name (16 px), the rarity word in its 08 §4 colour, then the price or state (08 §7.3). Selecting a tile tries it on.
- **Never** a timer, a discount, a "leaving soon" or an owner percentage (08 §7.3; FO §8.6 test).
- **Supporter tiles** appear only in the hub Mirror, in their own row, with **Get on Steam** (the Steam overlay store page; 10 owns the call) and the line "Cosmetic only. Supports development." (08 §15) [B].

### 13.12 The stall [A, from Landing 2]

Four items stand on cushions at the stall (04 §10.3); **tongue one to buy it**. A 360 px panel appears within 3 m:
```
┌──────────── THE STALL ────────────┐
│ Heal bug        20 ◈   1 / Landing │
│ Reroll          25 ◈   2 / Landing │
│ Boon upgrade    60 ◈   1 / Landing │
│ Gold Key        80 ◈   1 / climb   │
│                     You have 86 ◈  │
└────────────────────────────────────┘
```
- Items you can't afford are shown with the price muted, never hidden.
- The first Keeper Landing adds the free hat on its own cushion (08 §0).
- Rank S's free item shows a `FREE` tag (04 §8.2).

### 13.13 Bestiary [A: 9 pages · B: 14]

A book spread (07 places the book; the pause copy hides the page of the room you are in, 04 §9.3).
```
┌──────────────────────────────── BESTIARY ─────────────────────────────────┐
│ Pages 9 / 14              Next hat at 8 Cleared  ▓▓▓▓▓▓░░  6 / 8            │
│ ┌──────────── left page ─────────────┐ ┌──────────── right page ──────────┐│
│ │ [portrait 360 × 360]               │ │ The Bell-Golem        ♠  ☠        ││
│ │                                    │ │ Ring 3 bells. When its eyes glow, ││
│ │ SEEN   SURVIVED   CLEARED   HIDDEN │ │ freeze.                           ││
│ │  ✓        ✓          ✓        ???  │ │ Death tip (warm): …               ││
│ │                                    │ │ Hidden clear: ???                 ││
│ │                                    │ │ Best time 0:18 · Sealed · Hell    ││
│ └────────────────────────────────────┘ └───────────────────────────────────┘│
│  ◂ 1 / 14 ▸                 Grid: 14 thumbnails (unseen = silhouette only)  │
└────────────────────────────────────────────────────────────────────────────┘
```
- Paper `#F2E3C2`, ink `#3A2A1A` (the WANTED palette, so paper means "the Tower's records").
- Unseen pages show only the monster's silhouette (R7). A page never shows a clear you haven't stamped; once stamped, the hidden clear shows as a sketch (04 §9.3).

### 13.14 Settings [A]

Tabs across the top: Controls · Camera · Video · Audio · Accessibility · Social · Language.

| Tab | Options (default) |
|---|---|
| Controls | Rebind all 8 bindings, keyboard and gamepad (02); each hold as hold or toggle (FO §3.9); invert Y (off); gamepad vibration (on) |
| Camera | Sensitivity 0.1–2.0 (1.0); distance 3.5–6.0 m (4.5); FOV 50–90 (60); shake 0–100% (100); raft roll follow on/off (on) |
| Video | Preset Low / Medium / High (auto-detect; 10 §13.1); resolution; display mode; V-sync; frame cap 30/60/120/off; SSAO; environment outlines; bloom; particle density 50–100% |
| Audio | Master, Music, SFX, Croaks, Voice (barks), System chimes, UI (0–100%); mono; tell boost +6 dB (off) |
| Accessibility | §14 |
| Social | Blame tags (on; friends and private only, FO §5.1); Rival chatter frequency Low/Normal; Reduce others' effects (off; 08 §3.4); the break line (on; FO §8.4 #4); streamer-safe [SHOULD] |
| Language | English [A]; 한국어 [SHOULD] |

### 13.15 Pause [A]

```
┌────────────── PAUSED ─── the climb keeps going ──────────────┐
│ Door 14 · Normal · Team Lives ◉◉◯ · Full Climb                │
│ ▸ Resume                                                      │
│   The map (this climb)                                        │
│   Bestiary (this room's page hidden)                          │
│   System log (last 10)                                        │
│   Settings                                                    │
│   Controls                                                    │
│   Leave at the next Landing   everything is banked there      │
│   Leave now                   a Rival takes your seat          │
└───────────────────────────────────────────────────────────────┘
```
- **Solo:** pause freezes the climb. **With other humans:** it doesn't. The header says `the climb keeps going`, your frog stands still, and every normal rule still applies to it.
- "Leave now" hands your seat to a Rival that keeps your Glow, ranks and Boons (FO §3.6; 10's leave rule).

### 13.16 Overlays

| Overlay | Tag | Spec |
|---|---|---|
| **Keeper Landing ceremony** (D §5 order; 07 owns the flow) | [A] | `[ CHOICE UNLOCKED ]` window → the Boon pick (§13.8) → `[ PARTY RANK UP ]` banner → the Rank bar as a lower-third strip (04 §8.3) → `cam_pullback` (§9.1) → the free hat on the stall → the teaser window → "Climb on" and "Rest" as equal chips. It never uses a full-screen card (07 §1.1) |
| **Awakening card** | [A] | The door's full-screen card (§11.3) |
| **Betrayal Cam** | [B] | 03 §9.1: letterbox 2.39:1, the 0.8 s capture at 25% speed, `[ TRAITOR ]` in crimson Fraunces 800 120 px with `vfx_traitor_ink`, the poster printing, letterbox out. Breakup Cut: `[ IT'S OVER ]` in the cutter's Seat Hue |
| **Vengeance** | [B] | A P2 window `[ VENGEANCE ] …` (03) plus the target reticle (§13.9) |
| **Doppelfrog vote** | [B] | 03 §8.5 owns the rules. A top-centre bar of the suspects' portraits with seat glyphs; each vote lands as the voter's glyph under a portrait; Rival votes are marked `BOT · public evidence`; a 10 s ring |
| **Meeting Door** | [B] | Two key-slot icons on the door (world); `Rope in 0:45` ring above the shadow-glass window; the rescue-rope prompt (05 §3.4) |
| **The Wheel** | [A] | 03 §13: a 360 px radial with 8 line slices and an inner ring of 4 emotes, icon + label per slice |
| **Secret quest** | [B] | `[ HIDDEN CONDITION DETECTED ]` private window (§11.2), then a private tracker chip under the party strip: `Echo Toad · 1 / 3` |
| **Class banner** | [B] | `Pip's frog changed: ECHO TOAD` (FO §4.2) |
| **Break line** | [A] | `[ THE TOWER WILL WAIT ] Your door is saved.` after ~90 min; never blocks input (FO §8.4 #4) |
| **Loading** | [A] | None between doors (07 §1.1 rule 10). Boot → hub: a firefly draws the map's spiral; target ≤ 3 s |

---

## 14. Accessibility [A unless marked]

### 14.1 Input and camera

- Every hold can be a toggle (FO §3.9); full rebinding of all 8 bindings on keyboard and gamepad (02).
- Sensitivity, invert Y, FOV 50–90, camera distance 3.5–6.0 m, shake 0–100%, raft roll follow on or off.
- **Hold to skip** is always "hold Hop 0.5 s" (03 §9.1 uses the same), after a sequence's first viewing.
- Every screen is fully usable with a gamepad; prompts show the active device's glyphs.

### 14.2 Vision

| Option | Effect | Default |
|---|---|---|
| Text size | 100–150% for all text | 100% |
| UI scale | 80–130% | 100% |
| **Shape codes** | Seat glyphs, suit glyphs, Boon-family marks, hollow-vs-filled spots and map-node shapes (§2.3, §13.4). **Always on**: identity never rests on colour alone | on (not optional) |
| **High-contrast tells** | Tells × 1.5 emission plus a 2 px white outline on the tell part | off |
| **Reduced motion** | Shake 0; chromatic aberration, radial lines and raft roll off; Betrayal Cam plays at 50% speed instead of 25% (GDD §13.8); reveals as 4 cross-dissolved stills (WORLD §10.6); UI fades only (§7.4); forces "Reduce others' effects" (08 §3.4) | off |
| **Photosensitive mode** | Every pulse capped at 2 Hz; whiteouts become a cream `#F4EDE3` 85% crossfade (WORLD §10.1); glitch patches and lightning off | off |
| Dyslexia-friendly font | Atkinson Hyperlegible replaces Nunito everywhere | off |
| Reduce others' effects | 08 §3.4 | off |

Always, regardless of settings: no full-screen flash faster than 3 Hz (R10); minimum text 16 px at 100%.

### 14.3 Hearing

- **Captions** for every System line and Rival bark, with the speaker's Seat Hue chip and glyph (GDD §14.4).
- **Directional sound captions** for every tell and key sound: `[bell rings ←]`, `[the golem hums ↑]`, using 8 directions relative to the camera. Default on; 22 px; background `panel` at 80%; at most 2 lines; 3.0 s + 40 ms per character.
- **Visual sonar:** every audible tell also has a glowing visual (R4; 05 §2.4 "every room is clearable with audio muted"; CRIT #21).
- Mono audio; tell boost +6 dB; a separate slider for every bus (§13.14).

### 14.4 Mind and comfort

- The room's rule stays pinned the whole time (§13.5); a death tip highlights the clause you broke next time (04 §9.3).
- The System log keeps the last 10 lines (03 §14.2).
- No head bob; no camera roll except the raft's capped 4° (off in reduced motion).
- The break line (FO §8.4 #4) is on by default and never blocks input.
- Nothing times out a choice except the 8 s Boon pick (FO §4.1), which always takes the highlighted Boon, and the Doppelfrog vote (03).
- Streamer-safe [SHOULD]: hides the join code and shows other humans as seat-coloured tags (D §7 SHOULD 2). Korean [SHOULD] (D §7 SHOULD 3).

---

## 15. Audio

### 15.1 Architecture [A]

- **Unity AudioMixer + `SoundManager`** (10 §13.7: a pool of 48 AudioSources, randomised pitch, per-surface steps, positional cues). FMOD is not used (UT; 10 §13.7).
- **`MusicDirector`** is a step sequencer on `AudioSettings.dspTime`. It schedules sampled notes and stems with `AudioSource.PlayScheduled` 100 ms ahead (the GDD's look-ahead) from `presentation/music.json` (patterns, instruments, layers). Intensity layers crossfade over 2 s. Because the whole game shares one tempo grid and one scale per layer, every croak can be pitched to fit (§15.3).
- **Project audio settings:** 48 kHz; DSP buffer "Best latency"; Max Real Voices 48; Max Virtual Voices 512. No spatialiser plugin in A (Unity's panning); Steam Audio HRTF [SHOULD], after its licence is checked and logged.
- **Import:** one-shots under 1 s: PCM, Decompress On Load, mono. Loops and ambience: Vorbis quality 0.7, Compressed In Memory. Music stems over 1 MB: Streaming.
- **`presentation/audio_cues.json` → `AudioCueDef`** (10 §4.2): `{id, clips[], bus, spatial (2D|3D), rolloff (tell|world|near), minDist, maxDist, priority, maxInstances, cooldownMs, volumeDb, pitchRandom, pentatonic, captionKey, captionDirectional, visualTwin}`.

### 15.2 The mixer [A]

10 §13.7 names the groups Master, Music, SFX, Voice, System and UI. This tree adds children and two returns:
```
Master   (Compressor: threshold −10 dB, ratio 4:1, attack 5 ms, release 120 ms)
├─ Music ─── MusicBed, MusicLead
├─ Stingers              (never ducked by tells)
├─ SFX
│  ├─ Tells              (sidechain → Music −8 dB, Ambience −6 dB)
│  ├─ Monsters
│  ├─ Frogs
│  ├─ Croaks             (send → WellEcho; sidechain → MusicLead −3 dB)
│  ├─ Props
│  └─ Ambience
├─ Voice                 (Rival babble, quick lines)
├─ System                (System chimes; sidechain → Music −4 dB)
├─ UI
└─ WellEcho (return)     (Echo: delay 380 ms, decay 0.40; wet set by snapshot)
```

**Snapshots.** 10's five, plus six more:

| Snapshot | Music | Other | WellEcho wet | Blend in |
|---|---|---|---|---|
| Well (10) | 0 dB | — | 0.35 | 1.0 s |
| RuleRoom (10) | −4 dB | Ambience −2 dB, Tells +2 dB | 0.20 | 0.5 s |
| Breather (10) | 0 dB | — | 0.15 | 0.5 s |
| Landing (10) | 0 dB | — | 0.35 | 1.0 s |
| Reveal (10) | per 01 | lowpass 400 Hz → 12 kHz across the pull; exactly 200 ms of silence at each handoff (WORLD §10.1) | — | per 01 |
| Boss | +1 dB | Tells +2 dB | 0.30 | 0.5 s |
| BetrayalCam [B] | −9 dB, lowpass 800 Hz | SFX −6 dB; Stingers 0 dB | 0 | 0.2 s |
| Ghost | −6 dB, lowpass 1.2 kHz | SFX lowpass 2 kHz ("underwater") | 0.35 | 0.6 s |
| Pause (solo only) | −6 dB, lowpass 1.2 kHz | SFX −12 dB | — | 0.3 s |
| Results | −2 dB | SFX −6 dB | 0.15 | 1.0 s |
| Rim [B] | 0 dB | — | **0** ("your croak goes silent at the rim", FO §6.2 #5) | 2.0 s |

**Ducking** (Duck Volume on the target group): threshold −30 dB, ratio 4, attack 20 ms, release 600 ms. Tells duck Music by up to 8 dB and Ambience by 6 dB; System ducks Music 4 dB; a stinger ducks Music 10 dB for its length.

**Limits.** Each cue has `maxInstances`; the same cue retriggered within 40 ms merges. Priority (Unity: lower wins): tells 0, System 16, croaks 32, frogs 64, props 96, ambience 160, UI 200. At most 8 croaks are audible (the nearest). Pitch randomisation ±3% on body and prop sounds, **never** on pentatonic notes.

**Loudness** (GB; measured on a 2-minute golden-session capture): integrated −18 LUFS, true peak ≤ −1 dBTP. Assets are normalised: one-shots peak at −3 dBFS, loops at −20 LUFS. Cosmetic one-shots stay ≥ 18 dB under the croak (08 §3.4).

### 15.3 Keys and the harmony rule [A]

| Layer | Pentatonic (croaks, bells, pops, ticks) | Home key (WORLD §2) |
|---|---|---|
| Well | F G A C D | F major (D minor) |
| Sky [B: the Rim] | C D E G A | C |
| Space [LATER] | G A B D E | G |
| Beyond [LATER] | D E F♯ A B | D |

- **The harmony rule:** every music pattern in a layer uses a scale that contains all five pentatonic notes of that layer. In the Well that means key signatures of 0, 1 or 2 flats: C, F or B♭ major and their modes (D minor, G Dorian, A Phrygian, F Lydian, C Mixolydian). **So a croak always fits whatever is playing.** `AudioKeyTests` checks every pattern's pitch set. Stingers are exempt (the betrayal tritone).
- **Seat notes** (Well; transposed with the layer): seat 1 F3 (174.6 Hz), 2 A3 (220.0), 3 C4 (261.6), 4 D4 (293.7), 5 G3 (196.0), 6 F4 (349.2), 7 A4 (440.0), 8 C5 (523.3). Any combination is consonant.
- **The reveal motif:** the climb's seeded 5-note pentatonic motif, played at half speed in the next layer's key (WORLD §2).

### 15.4 The croak: a party instrument that grows with you [A; rank IV B]

| Croak | Sound |
|---|---|
| Tap | The seat note, 0.25 s, the `croak` recipe (§15.9) with its 25 Hz "ribbit" flutter |
| Hold (sustain) | The seat note held, vibrato 5 Hz ±15 cents |
| **Rank I → IV** (felt progress you can hear) | I: one note. II: + the octave below at −9 dB. III **Twin Toll**: a dyad, the seat note + the pentatonic note two steps up (F → A, A → D: always consonant). IV **Thunder Croak**: a triad (+2 and +4 steps) + a 40 Hz sub boom + a 1.2 s rumble tail |
| Chorus success (2+ frogs within 0.3 s, FO §4.1) | Each voice snaps to its seat note; a glass-bell shimmer an octave up: a chord |
| **One sad croak** (FO §5.1) | A lone attempted Chorus: the seat note bends down 2 semitones over 0.4 s with a muted "wah". Off-scale on purpose: it's the joke |
| Revive (hold over an egg 2 s) | The egg answers with a rising 5-note arpeggio in the reviver's key, one note per 0.4 s; it pops on the fifth |
| Warden P2: the Chorus lifts the Jar [B] | Held croaks route to MusicLead and the music drops to a pad: **the party is the melody** |
| Muffled (02 `CroakKind.Muffled`, e.g. swallowed) | Lowpass 600 Hz, −6 dB |

- **Echo:** in the Well every croak feeds WellEcho (380 ms, 3 audible repeats). On the Rim the echo is gone (FO §6.2 #5). [SHOULD] The First Shout: the first croak on the Rim gets thunder back 6.0 s later (WORLD §10.2).
- **Latency:** your own croak plays within one frame of the input, locally. Others' croaks play on arrival. Only pitch is quantised, never timing.
- **Croak voice cosmetic** (08 slot 4) changes timbre only (08 §2).

### 15.5 Music per state and layer

Every cue lives in `music.json`; tempos are GB.

| Cue | State | Tempo, metre | Key / mode | Instruments | Behaviour | Tag |
|---|---|---|---|---|---|---|
| `mus_hub` | Well Bottom, title, lobby | free time on a 60 BPM grid | F pentatonic | Kalimba drips (a random pentatonic note every 0.3–1.2 s, placed in 3D around the shaft), water drone F1 + C2, soft wind | +1 kalimba voice per joined human | A |
| `mus_hatch` | `hatch_pond` | 96, 4/4 | F major | Kalimba, marimba | Each of the first gulps plays the next motif note | A |
| `mus_breather` | Breathers | 104, 4/4 | F major | Marimba ostinato, pizzicato bass, brushed snare | 8-bar loop | A |
| `mus_toy` | Toy doors, Landing toys | 128, 4/4 | F major | Formant "kazoo" lead, claps, bass | 30 s arrangements that end on a hit at 0:30 | A |
| `mus_gold` | `br_gold` | 92, 3/4 | F major | Music-box runs up the pentatonic, glass bells | Jackpot feel with **no casino sounds, reels or spin-past** (FO §8.2) | A |
| `mus_landing` | Landings | 96, 3/4 | F major | The waltz: music box, pizzicato, brushed snare on 2 and 3, organ pad; I–vi–IV–V over 8 bars | +1 layer per 2 frogs present (max 4); the melody is the climb's seeded motif, varied each loop (GDD §15.2) | A |
| `mus_keeper_ceremony` | Keeper Landing ceremony | 96, 3/4 | F major | The waltz + choir pad | Rank-up stingers land on downbeats | A |
| `mus_rule_{suit}` | Rule doors | 84, 4/4 | D minor base | **Calm:** sub drone D1, half-time heartbeat, a bronze bell every 2 bars. **Tension** (monster within 8 m or a tell armed): + low string ostinato in 8ths, ticking. **Pressure** (the hard timer's last 20 s, or you on 1 spot): + taiko on 1 and 3, the ostinato up an octave | Layers crossfade over 2 s. Suit colour on top: ♠ synth taiko + bell stabs (A Phrygian); ♦ pizzicato + clock ticks + celesta (D minor); ♣ rope plucks + frame drum in 6/8 (G Dorian) | A |
| `mus_heart` | Heart doors | 92, 4/4 | D minor | Two-voice harpsichord canon (voice 2 one bar late), low brass swell | Thins to one voice in the betrayal window | B |
| `mus_enigma` | E doors | 128, 4/4 | F Lydian | Bit-crushed square arpeggios, sub pulse, reversed swells | 1/16 stutters on the monster's special moves | B |
| `mus_grip` | `sp_grip_wall` | 100, 6/8 | G Dorian | Rope strings (Karplus), wind, frame drum | +1 layer per 25% of height climbed | B |
| `mus_tether` | `sp_tongue_tether` | 112, 4/4 | D minor | Strings, low drum | A lowpass opens as the water rises; in-step paired hops add drum hits | B |
| `mus_keeper` | `keeper_bell_raft` | 110, 4/4 | D minor | Synth taiko, bronze bell motif, organ bass | The drone bends ±30 cents with the raft's tilt (seasick comedy) | A |
| `mus_warden` | `warden_the_jar` | P1 88, 4/4 | D minor → F major | Organ, choir, bells | P1 lifts to F major whenever you flatten an old monster; **P2** drops to a pad so the held croaks carry the tune; **P3** (Trust Fall) heartbeat and wind only; the catch swells to full F major | B |
| `mus_hush` | `br_sleeping_toad` | 72, 3/4 | F major | Music box only; the snore is a low F drone | Any loud noise stops the music for a beat | B |
| `mus_meeting` | `meeting_room` | 116, 4/4 | F major | Toy band | The other room's music muffled underneath | B |
| `mus_results` | Results | 90, 3/4 | F major | The waltz on music box alone | Count-ups tick on its scale | A |
| `mus_rim` | `rim_surface` | 96, 3/4 | C major | The waltz + breathy flute | No echo | B |
| ★1 | The reveal (01 owns the timing) | — | C | The motif at half speed, up a fifth | Lowpass sweep; 200 ms of silence at each handoff (WORLD §10.1) | B |
| Other layers | Sky Preview [SHOULD]; Sky, Space, Beyond [LATER] | as the Well | C / G / D (WORLD §2) | + breathy flute (Sky), FM glass bells 1:3.5 (Space), formant choir pad (Beyond) | Every Well cue transposed | — |

**Stingers** (bus Stingers): door clear (a major bell arpeggio); room failed (descending minor bells, then the Tower's comic gulp); level-up (a rising pentatonic arpeggio, 04 §2.3); Awakening (3-bell fanfare + choir swell); rank-up (bell fanfare); `[ NOTED ]` (two wooden knocks + a bell); gold door (a music-box run); Knot tied (a rising fifth); ♥ Cut (downward bend + tritone); ♥ `[ TRAITOR ]` (a bell-croak sting, 03 §9.1); `[ IT'S OVER ]` (a sad violin-croak, 03); Vengeance landed (slide whistle up + a cymbal).

### 15.6 Voices [A]

- **No spoken words anywhere**, so every line localises through the string tables.
- **Rival babble:** formant syllables of 70–110 ms, vowels hashed from the text, at each Rival's f0 (03 §16.3). Questions rise; "Help!" is high and sharp; "Sorry!" falls (GDD §15.3). Always captioned.
- **The full tell:** the babble drops a perfect fourth (03 §7.3).
- **Quick lines** (the Wheel): the speaker's Croak voice as babble, with a speech bubble (03 §13).
- **The System chime:** a glass-bell FM tone (carrier:modulator 1:3.5, index 2 → 0 over 150 ms) for each typed character at 35 cps, its pitch quantised to the layer's pentatonic by character code; headers an octave lower; 24 dB under the croaks; its own slider (GDD §15.3; 03 §14.2).

### 15.7 Positional cues [A]

| Emitter | Setup |
|---|---|
| **Tell** | 3D, spatial blend 1.0, rolloff "tell": 0 dB to 3 m, −6 dB at 12 m, −14 dB at 25 m, silent beyond 40 m; spread 30°; Doppler 0; priority 0. **Occlusion:** a raycast at 4 Hz; when blocked, a lowpass slides 5 kHz → 800 Hz and −4 dB over 0.2 s |
| Monster idles and acts | 3D, logarithmic, min 2 m, max 30 m; priority 64 |
| Your frog | Spatial blend 0.6 (present, not panned hard) |
| Other frogs | Spatial blend 1.0, "near" rolloff (max 25 m) |
| UI, System, music, stingers | 2D |

Every audible cue has a visual twin and a directional caption (R4, §14.3). **Reverb zones** (Unity AudioReverbZone presets): shaft and hub `Cave`; rule rooms `Stoneroom` (`echo_warren` uses `SewerPipe`); breathers and Landings `Livingroom`; `sp_grip_wall` `Quarry`; the Rim `Plain`. The Well's croak echo is the WellEcho send, not a zone.

### 15.8 SFX list and sources

**Source keys**
- `K-UI` Kenney "UI Audio" and `K-DIG` Kenney "Digital Audio": CC0, confirmed in the research notes (Unity art research, Q5).
- `K-IF` Kenney "Interface Sounds", `K-IMP` Kenney "Impact Sounds", `K-RPG` Kenney "RPG Audio": CC0; **verify each pack's name and licence at import**.
- `SYN`: in-house `kw_synth` recipes (§15.9).
- `FS0`: Freesound, **CC0 only**, one `licenses.csv` row per file.
- **Banned:** Kenney "Casino Audio" and any slot, reel or coin-machine sound (FO §8.2, the Balatro PEGI lesson); any CC BY-NC file (UT); Sonniss until a human has read its AI clause (D §12).

| Group | Id | Recipe | Source | 3D? | Bus |
|---|---|---|---|---|---|
| **Frog** | `sfx_step_{stone,wood,wet,moss}` | Pad taps: lowpassed noise, 30 ms, 400–900 Hz (GDD §15.4) + a soft footstep layer at −12 dB | SYN + K-IMP | 3D | Frogs |
| | `sfx_hop_tap`, `sfx_hop_charge_loop`, `sfx_hop_release` | Rising blip 200 → 400 Hz; a tone rising with charge; a "boing" (pluck + pitch bend) | SYN | 3D | Frogs |
| | `sfx_land_tap`, `sfx_land_heavy`, `sfx_splat` | Thud 90 Hz 60 ms + noise tap; heavier + soft impact; wet slap (noise 1.5 kHz, 80 ms) | SYN + K-IMP | 3D | Frogs |
| | `sfx_air_hop` | Whoosh + a firefly chime | SYN | 3D | Frogs |
| | `sfx_tongue_out`, `_hit`, `_stretch_loop`, `_reel`, `_spit` | "Thwip" (noise sweep 400 → 2,000 Hz over 90 ms + pluck); sticky splat; rubber stretch; slurp; "ptoo" | SYN | 3D | Frogs |
| | `sfx_gulp` | Sine drop 400 → 150 Hz + a "g" formant; **each gulp in a door is one pentatonic step higher**, reset at the bank | SYN | 3D | Frogs |
| | `sfx_croak_*` | §15.4 | SYN | 3D | Croaks |
| | `sfx_shove` | Thump 110 Hz + noise, with a soft body-hit layer | SYN + K-IMP | 3D | Frogs |
| | `sfx_hit_taken` | FM woodblock "bonk" + the spot's glass tick (2.5 kHz) | SYN | 3D | Frogs |
| | `sfx_spot_orb_loop`, `_catch`, `_return` | A shimmering hum at the owner's seat note; a major-third chime; a whoosh | SYN | 3D | Frogs |
| | `sfx_dark`, `sfx_ghost_loop`, `sfx_revive_pop` | Deflating "pff" + a falling tone; bubbly loop; pop + major arpeggio | SYN | 3D | Frogs |
| | `sfx_teeter` | A comic vibrato whistle | SYN | 3D | Frogs |
| | `sfx_levelup`, `sfx_bank` | Rising pentatonic arpeggio; count-up ticks | SYN | 2D | Stingers / UI |
| | `sfx_boon_orb_loop`, `_take`, `_shatter` | A soft hum per family; chime + whoosh into the mark; glass shatter | SYN + K-IMP | 2D (private) | UI |
| | `sfx_glide_wind` [B] | Bandpassed noise with an LFO | SYN | 3D | Frogs |
| **Social** | `sfx_knot_tie` | Two bells, a rising fifth | SYN | 3D | Stingers |
| | `sfx_cut_channel` ♥ | "Shhhk": highpassed noise, cutoff rising over 1.2 s (GDD §15.4) | SYN | 3D | Stingers |
| | `sfx_cut_snap` ♥ | Downward bend + noise burst + tritone | SYN | 3D | Stingers |
| | `sfx_hold_on` | Rope creak (Karplus bend) + clunk | SYN | 3D | Props |
| | `sfx_wanted_print` | Paper crinkle + a stamp thunk | FS0 + K-IMP | 3D | UI |
| | `sfx_vengeance_slime` | Wet goo splat + slide whistle up | SYN | 3D | Stingers |
| | `sfx_blame_pop` | Bubble pop (sine 600 → 900 Hz, 40 ms) | SYN | 2D | UI |
| | `sfx_ping_look`, `_danger`, `_door` | Glass tick 1.5 kHz; double low tick 400 Hz; bell tick | SYN | 2D | UI |
| **Doors** | `sfx_door_slam` | Stone thud + a 45 Hz sub + a reverb tail | K-IMP + SYN | 2D | Stingers |
| | `sfx_door_open` | Stone grind + air | FS0 + SYN | 3D | Props |
| | `sfx_walkvote_tick` | 8 rising pentatonic ticks over the 4 s | SYN | 2D | UI |
| | `sfx_plaque_flip` | Stone clack | K-IMP | 3D | Props |
| | `sfx_clock_toll` | A bronze bell every 5 s in the last 20 s (05 §2.4) | SYN | 2D | Tells |
| | `sfx_countdown_bell` | 3-2-1-NOW bells (05 `CountdownBell`) | SYN | 2D | Tells |
| | `sfx_tower_gulp` | A huge comic gulp as the Tower pulls everyone out (05 `ExitGate`) | SYN | 2D | Stingers |
| **Rooms** | `sfx_bell_{F,G,A,C,D}` | Bronze bell, partials 1, 2.76, 5.40, 8.93 (GDD §15.1), 4 s decay, tuned to the Well pentatonic | SYN | 3D | Props |
| | `sfx_lamp_snuff` | A soft "fff" + ping | SYN | 3D | Props |
| | `sfx_pot_shatter` | Ceramic break + firefly chime | K-IMP + SYN | 3D | Props |
| | `sfx_mite_pop` | A pop on the next pentatonic note, so a string of pops plays a scale | SYN | 3D | Props |
| | `sfx_jar_{bronze,silver,gold}` | Lid pop + a coin cascade (plucked) + chime; gold adds a music-box flourish. No slot sounds | SYN | 3D | Props |
| | `sfx_coin`, `sfx_pearl` | Plucked coin ping; glassy "tink" with shimmer | SYN | 2D | UI |
| | `sfx_water_splash`, `_swim`, `_rise_loop` | Splash; paddling; a rising-water gurgle | FS0 + SYN | 3D | Props |
| | `sfx_raft_creak`, `sfx_rope_creak` | Karplus string, pitch = tension (GDD §15.4) | SYN | 3D | Props |
| | `sfx_moss_dry` [B] | Sparse crackle | SYN | 3D | Props |
| **Cues** (bus Tells; each has a visual twin) | `sfx.golem.hum_rise` (05 §1.2) | A sine at the key root + a rising 2nd harmonic | SYN | 3D | Tells |
| | heron, pike, eel, snapper, hunter, knight, snake, snail, spider, slime, eye, Keeper, Jar | Wing gust + cold whistle; bubble surge; lure hum; jaw creak; gill rattle; rising halberd scrape; hiss + splash rattle; scrape (only while it moves); thread creak (1 s); an inhale; static rising with angle; raft creak + hum; rope creak + a swelling swarm | SYN (+ FS0 textures) | 3D | Tells |
| **UI** | `ui_hover`, `ui_click`, `ui_back`, `ui_error` | Soft clicks | K-UI | 2D | UI |
| | `ui_tab`, `ui_panel_open`, `ui_panel_close` | Light interface blips | K-IF | 2D | UI |
| | `ui_countup_tick` | A pentatonic tick (§10.4) | SYN | 2D | UI |
| | `ui_equip`, `ui_buy`, `ui_wishlist` | Click + chime | K-UI + SYN | 2D | UI |
| | `ui_system_chime` | §15.6 | SYN | 2D | System |
| | `ui_rank_stamp`, `ui_bestiary_stamp` | Wooden thunk + bell; ink thump + paper | K-IMP + SYN | 2D | UI |
| **Ambience** | `amb_well_shaft` | Wind, distant water drops, water lapping | SYN + FS0 | 3D | Ambience |
| | `amb_rule_{stone,water,cave}` | Low rumble beds | SYN | 2D | Ambience |
| | `amb_landing` | Lantern crackle, a far crowd murmur (the lantern-folk, 05 `br_window`) | SYN + FS0 | 3D | Ambience |
| | `amb_rim` [B] | Open wind, birds | FS0 | 2D | Ambience |

### 15.9 Synthesis and licences [A]

- **`kw_synth`** (a `[CliCommand]` in `Game.Editor`) renders `presentation/synth_recipes.json` into 48 kHz, 16-bit mono WAVs in `Assets/_Knotwell/Audio/Synth/`. Recipes: `bell(partials, decay)`, `pluck` (Karplus-Strong), `fm(car, mod, index, env)`, `noiseHit(filter, env)`, `formant(vowel, f0)`, `organ(drawbars)`, `tom(f0, drop)`, `kalimba` (modal partials 1, 5.8, 11.4 with fast decay on the upper two), `musicBox` (partials 1, 3.1, 5.2; GDD §15.2), `breathFlute` (noise + formant), and **`croak`**: a glottal pulse train through formants at 700, 1,200 and 2,600 Hz with a 25 Hz amplitude flutter. Noise is seeded, so a re-render is byte-identical and diffable.
- Every file gets a `licenses.csv` row (FO §8.6): `self-generated by kw_synth`, licence `Proprietary (KNOTWELL)`. Kenney rows say `CC0 1.0`; the credits thank Kenney, and Kenney's logo is never used (UT). Freesound rows must say `CC0` (`AudioSourceTests`).
- **Music is made in-house** by `MusicDirector` playing synthesised instruments; the slice ships no licensed music. [SHOULD] If budget allows, a human composer writes 3 hero themes (the Landing waltz, the Warden, ★1) as stems; the sequencer stays as the adaptive layer.

---

## 16. Logo, capsule and trailer

**Nothing frog-only goes public before Gate A passes** (D §2): no capsule, trailer, Warden art, Steam page or store copy. Store copy leads with the well reveal, the monster doors and betrayal, and never says "eat to grow" (D §2 positioning rules). No AI-generated art ships (UT: ownership terms unverified).

### 16.1 Logo [A in game · public use after the trademark search, D §1]

- **Wordmark:** KNOTWELL in Fraunces 800 (soft), tracking −0.01 em, `text` on dark or `ink` on light.
- **The K is a rope knot** (D §1): two rope strokes, rope `#C9A36B` with shadow `#8A6A3F`, form the K's arms and tie through its stem; one firefly in `glow_default` sits on the knot.
- **Tagline** "Climb together. Fall alone." in Nunito 700 at 28% of the wordmark's cap height.
- **Minimum size:** 120 px wide, where the K must still read as a knot (a 120 px render is part of `LogoTests`' golden images). Clear space: one K-width on every side. Never separate the K from the rest (it prevents a "Not well" misread).
- **Source:** vector paths in `presentation/logo.json`, baked by `IconBaker` into a 4K PNG and the in-game sprite.

### 16.2 Capsule [after Gate A]

FO §6.4, restated as a build spec:
- **One focal point:** a huge-eyed frog face with a glowing belly, mid-leap out of a dark stone well mouth toward a sliver of bright sky. The title runs large across the bottom third. Nothing else: no door, no planet.
- **Colour plan:** the default Azure Dart frog `#2FA4FF` (02 §2.2), belly `glow_default`, a tangerine rim `#FF9933` so it pops off the stone `#151B20`, and the sky sliver `#CFE9FF`.
- **Must read at 120 × 45 px** (FO §6.4); A/B test two capsules on the Steam page. Whether the frog wears a hat is part of that test (08 §15).
- **Made in engine:** a generated `Capsule.unity` with `cam_capsule`, rendered at 4K in the toon look, then the logo composited. Sizes come from the current Steamworks graphical-asset checklist at upload (header, small, main and vertical capsules, library assets); **verify them there**, don't trust remembered sizes.

### 16.3 Trailer [after Gate A]

60 s, 1080p60, captured in the Editor with Unity Recorder (an editor-only tool, not shipped) from fixed seeds with Rivals. It opens on gameplay in frame 1 and shows three environments (FO §6.4; RR):

| Time | Shot |
|---|---|
| 0:00–0:04 | Frame 1 is play: froglets plop into the water in a heap (`hatch_pond`) |
| 0:04–0:10 | A friend is tongue-yanked off the raft: "That was on purpose." |
| 0:10–0:16 | A dark rule room: the golem's eyes glow, everyone freezes, one frog doesn't |
| 0:16–0:22 | An Awakening lands; the Rivals gasp |
| 0:22–0:28 | A Lv10 frog with the Crown glow pops a room of mites with Thunder Croak |
| 0:28–0:34 | The Betrayal Cam: `[ TRAITOR ]` and the WANTED poster |
| 0:34–0:40 | The Grip Wall and the Tongue-Tied Tether: bodies linked |
| 0:40–0:48 | The steered pull-back up the shaft as the Mouth widens; card: *Your sky is somebody's floor.* (D §1) |
| 0:48–0:54 | ★1: the Rim, the painted sky, **2 s of Space's stars through the dome tear** (FO §6.4; D §6 row 30) |
| 0:54–1:00 | Logo and "Climb together. Fall alone." |

### 16.4 Store screenshots [after Gate A]

1. The hat lineup: 8 frogs in 8 hats on a warm Landing, the Mouth wide overhead (08 §15).
2. The Kestrel laugh: a tongue yank mid-air.
3. A dark rule room: one self-lit tell and 8 glowing frogs.
4. An Awakening mid-fanfare.
5. The Betrayal Cam with `[ TRAITOR ]`.
6. The Keeper pull-back up the shaft.
7. ★1 on the Rim.
8. The Warden's Trust Fall catch.

### 16.5 Share card [SHOULD]

A 1200 × 630 PNG: the group shot on the left 60%, the vista on the right 40%, and the door number, difficulty and logo (WORLD §10.1; D §7 SHOULD 1). Captured by `cam_sharecard` at the Keeper pull-back and on the Rim. Streamer-safe mode swaps names for seat glyphs.

---

## 17. Tests this file defines (10 implements them; 05's Definition of Done uses them) [A]

| Test | Fails the build when |
|---|---|
| `PaletteTests` | §2.5's rules break (Seat Hue separation normal and simulated CVD, crimson distance, System-cyan distance, tag-text contrast) |
| `PaletteUsageTests` | Crimson is used outside its whitelist; a tell colour falls in the firefly band (44°–56°, S ≥ 0.5); a HUD panel, room light or cosmetic sits within ΔE 18 of System cyan |
| `TellReadabilityTests` (PlayMode, goldens) | In any room's golden shots on Medium, the armed tell or a lit spot at 25 m is under 3:1 contrast against a 20 px ring (R5) |
| `SilhouetteTests` | Two monsters' 64 px silhouette masks overlap by IoU ≥ 0.8 (R7) |
| `FlashTests` | Sampled full-screen luminance changes by > 10% faster than 3 Hz in any reveal, glitch or lightning capture (R10) |
| `UiCopyTests` | A string uses a retired word (D §10), a `%` without a data key, or an unbound number (FO §8.6); a shop screen shows a countdown under 24 h (FO §8.6); paired choice buttons don't share a style class |
| `FontCoverageTests` | Any `en` (later `ko`) string has a glyph missing from its font asset |
| `AudioCueTests` | A 3D room cue lacks a `visualTwin` or `captionKey`; a clip lacks a `licenses.csv` row or comes from a banned source |
| `AudioKeyTests` | A music pattern breaks the harmony rule (§15.3), or a seat note isn't in its layer's pentatonic |
| `JuiceTests` | Any code outside solo pause writes `Time.timeScale` (§10.1) |
| `CardGateTests` | The climb-1 simulation shows more than one full-screen card in any door (D §5) |
| `LogoTests` | The 120 px logo render differs from its golden image |
| GPU budget probes | A §3.4 pass exceeds its budget on the dev PC at Medium for 3 consecutive runs |

---

## 18. Open questions

1. **Who publishes the Seat Hue hexes?** D §9 gives Seat Hue to 02 and palettes to 09; 10 §4.2 puts them in 09's `palette.json`. This file sets 8 verified hexes (§2.3). If 02 publishes a different set, keep whichever passes `PaletteTests` with the larger worst-case CVD separation.
2. **Eight colours can't all be far apart for colour-blind players** (worst simulated ΔE 10.3), so glyphs carry identity. Gate A should include at least one tester with a colour-vision deficiency.
3. **Low-spot eyelids.** FO §2.3 uses eyelid droop as a health cue; D §2's anti-Pepe rule forbids droopy lids; 02 §2.2 allows lids below 40% in "Sad and low-spot states". This file uses shrunken pupils and sweat drops instead and recommends 02 drop the low-spot lid state.
4. **Rival looks.** 03 gives species colours; 08 dresses the Rivals in catalogue skins (Moss in Speckled Egg, for example). Recommend 08 choose each Rival's skin so its base matches 03's colour, or add species skins to the earned catalogue, so Rivals stay recognisable and every look stays earnable.
5. **Rival hat names differ** between 03 §16.3 and 08 §13.1 (Moss: Moss Cap vs Acorn Cap). 08 owns loadouts; 03 should point to it.
6. **Crimson.** 03 still cites `#E8254F`; this file fixes `#FF3D6E` (already used by 02 and 08). 03 should update.
7. **The results stage after a mid-climb wipe** (the Well Bottom or the last Landing) is 04's and 07's call; the overlay works in both.
8. **Music quality risk.** A sequencer with synthesised instruments is agent-buildable and harmony-safe, but may sound cheap. A human composer for 3 themes is listed as [SHOULD].
9. **Kenney pack names** other than UI Audio and Digital Audio, and the input-prompt pack, are from memory and must be verified at import (the licence test catches mistakes).
10. **"Worth it?" beside the equal buttons** could read as a third choice. If playtests show that, show it one beat after the player picks.
11. **The first levels' glow steps.** 04's Lv1 0.6 and Lv2 0.9 both sit under the bloom threshold, so the first visible bloom is Lv3. If Gate A testers can't tell Lv1 from Lv2 at 25 m, raise Lv2 to 1.0.

