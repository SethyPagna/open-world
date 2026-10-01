# 02 · HERO AND CONTROLS: the Firefly Frog

**Version** 1.0 · **Date** 2026-09-29 · **Status:** master design, bound by `DECISIONS.md`.

**What this file owns** (DECISIONS §9):
- the Firefly Frog body spec, how it is built, and the `IHeroBody` contract;
- the procedural rig, face and expressions;
- the two readouts on the body: spots (fragile) and Glow (power);
- Seat Hue;
- the 8 bindings and every verb's numbers at ranks I–IV;
- the tongue fairness caps;
- the spot, down, Dark, revive, fall and respawn rules;
- the hero animation list;
- Gates A and B, the remediation pass, and the Wick fallback mapping.

**What other files own:**
- **04:** which verb levels up, the Boon effects, and the firefly yields.
- **03:** Knot rules, the Betrayal Cam and barks.
- **05:** room lanes and per-room overrides.
- **09:** monsters, VFX art, camera cinematics and audio.
- **10:** motor authority and netcode code.

**Authority and conventions:**
- Sources: DECISIONS (binding), then FUN_OVERHAUL (**FO**), then UT/RR, then the parts bin (GDD, WORLD, CRIT, `inputs/hero_0–2`).
- **Tags:** [MUST-A] Quick Climb and demo · [MUST-B] Full Climb, ★1 and the Rim · [SHOULD] · [LATER].
- Every number is a **greybox hypothesis** unless a source is cited.
- **Units:** metres, seconds and kilograms. Unity axes: +Y up, +Z is the frog's forward, +X its right.

---

## 1. The hero on one screen

**Fantasy: a small frog with a big light.** You hatch dim and tiny at the bottom of a well. By door 18 you carry a ring of nine fireflies and a Crown glow, and your Thunder Croak shatters every pot in the room. Your body is the same size it was at door 0. Everyone can read both of these from 25 m:
- **how fragile you are:** 3 spots on your back;
- **how strong you have become:** belly glow, orbiting fireflies, lit markings, Awakening parts and the halo.

### Invariants: binding and tested (§11)

| # | Rule | Source |
|---|---|---|
| H1 | **Growth is light, never size.** No level, Boon, class, molt or cosmetic changes the mesh scale or the hitbox. | DECISIONS §2 positioning rule 1 (Frog Sqwad) |
| H2 | **The hitbox is identical for every frog:** a capsule of radius 0.30 m and height 0.95 m. Base speed, shove impulse and spots are identical too. | FO §5.4.1 |
| H3 | **Health is 3 back spots (4 on Easy).** They are the same colour, size and place for everyone, and nothing may cover them. | DECISIONS §2; FO §3.7 |
| H4 | **The power axis grows the *lit* silhouette only.** The lit envelope grows from 0.60 m wide at Lv1 to about 1.70 m wide at Lv10 (§5.2). | DECISIONS §2 |
| H5 | **Emotion never uses the Glow, spot or rim channels.** Glow means power, spots mean health, rim means seat, and the face and posture carry emotion. This fixes the channel-collapse fault hero_1 found in the glow-frog. | hero_1 §3 |
| H6 | **All hero motion is procedural.** There are no retargeted humanoid clips (§9). | DECISIONS §2 |
| H7 | **Every system talks to `IHeroBody`**, never to frog parts (§3.5). | DECISIONS §2 |
| H8 | **No verb costs health.** There is no stamina, except per-frog Grip on Grip surfaces (§7.2.6). | FO §7 |

---

## 2. Body spec [MUST-A]

### 2.1 Proportions (standing idle, feet at y = 0)

| Part | Spec |
|---|---|
| **Total height** | **0.95 m** to the top of the eye domes |
| Bean body (head and body in one piece, no neck) | Bottom at y 0.08. Widest point 0.60 m at y 0.30. 0.52 m wide at y 0.70. Depth 0.50 m. The top dips to y 0.86 between the domes. |
| Eye domes | 2 bumps, r 0.11, centred at (±0.14, 0.84, +0.05) |
| Eyeballs | r 0.085, set in the domes. Horizontal oval pupils 0.05 × 0.03. Iris ring 0.012 wide. |
| Mouth line | y 0.62, 0.36 m wide, a single curve with **no lips** |
| Cheeks | Puff regions at (±0.18, 0.60, +0.16), each r 0.07 |
| Throat sac | Centre (0, 0.50, +0.21). Rest r 0.10, mostly tucked under the chin. Croak inflates it to r 0.18. After the Croak Awakening: rest r 0.13, inflated r 0.22. |
| Belly glow patch | An ellipse 0.34 wide × 0.40 tall, centred at (0, 0.36, +0.26) |
| Back spots | 3 discs, r **0.075**, each with a 0.015 dark ring. **Top** (0, 0.66, −0.235), **Left** (−0.12, 0.49, −0.255), **Right** (+0.12, 0.49, −0.255). On Easy a 4th, **Bottom**, sits at (0, 0.34, −0.25). |
| Hind legs (folded in a Z at the sides) | Thigh 0.20 + shin 0.20 + foot 0.16 (toe pads 0.06). Feet rest at (±0.20, 0, +0.05). Fully extended reach: 0.54 m. |
| Front arms (nubs) | Upper arm 0.12 + hand 0.08, with 3 round toe pads. Hands rest at (±0.26, 0.28, +0.14). |
| **Hitbox** | A capsule, r 0.30, height 0.95, centred at (0, 0.475, 0). The top of the capsule is standable, which is what Frog Stack and Leapfrog use. Hats, parts and fireflies never collide. |
| **Weight** | 25 kg for everyone. It is used for raft torque, lily-pad sink (0.05 m per frog) and pressure plates. |

### 2.2 Silhouette and style rules

- **An upright bean.** The frog crouches only to charge a hop, swim or cling. A low, flat frog reads as a puddle from a 3/4 camera (hero_0 §5; FO §2.3).
- **Anti-Pepe:**
  - a round face;
  - no lips;
  - no droopy lower lids at rest;
  - lids never rest below 40% closed, except in the Sad and low-spot states;
  - dart-frog colours.
  - **Gate A also checks this:** 5 cold viewers must make no Pepe association (FO §2.3).
- **Default skin "Azure Dart":**

  | Region | Colour |
  |---|---|
  | Base | `#2FA4FF` |
  | Pattern | `#0E1726` ink reticulation |
  | Belly | `#CFF3FF` (pale, so the glow shows through) |
  | Iris | `#FFC640` |
  | Pupil | `#0B0B0B` |
  | Mouth line | `#0E1726` |

- **Rivals use the same mesh, rig and hitbox.** Their species look (bullfrog, tree frog, scarred toad and so on) is a skin plus optional cosmetic socket parts (03 and 08 own these).

### 2.3 Scale: frog metres

The frog is 0.95 m tall in Unity units. Physics, jump heights and the netcode run at this comfortable scale. **The world is dressed giant:**
- a pot is 1.2 m;
- the door-1 slab is 6 m;
- the Jar is 14 m;
- the Mouth is 180 m up (DECISIONS §6 row 1).

So the frog *reads* tiny while PhysX stays well tuned. Never scale the frog down to make the world feel big.

---

## 3. How it is built

### 3.1 Mesh: a Blender-Python generator [MUST-A, week 3]

**Script:** `Tools/Blender/build_frog.py`. Blender 5.2 is installed (DECISIONS §12). The script reads `Data/hero/body.json`, which holds the §2.1 numbers, so a proportion change is a JSON diff plus a re-run.

```
blender --background --factory-startup --python Tools/Blender/build_frog.py -- ^
  --params Data/hero/body.json --out KNOTWELL/Assets/Art/Hero/Frog.fbx
```

The Blender path lives in `Tools/paths.json`. The script exits non-zero on any failed assertion.

**Steps, all scripted:**
1. **Body.**
   - Revolve the §2.1 profile (12 radius/height pairs in `body.json`) into a bean, then squash its depth to 0.50.
   - Add the two dome spheres, then Voxel Remesh at 0.008 m to fuse them.
   - Smooth with Corrective Smooth ×10, then Decimate to **3,000 tris**.
2. **Separate meshes:**

   | Mesh | How it is made | Tris |
   |---|---|---|
   | Eyeballs | ico sphere, subdivision 2 | 2 × 320 |
   | Eyelids | hemispherical caps, 0.005 thicker than the eyeball | 2 × 200 |
   | Nictitating lids | the same caps, rotated 90° (§4) | 2 × 200 |
   | Sac | UV sphere, 16 × 8 | 240 |
   | Hind legs | Skin modifier on a 3-edge chain | 2 × 600 |
   | Arms | Skin modifier on a 2-edge chain | 2 × 300 |
   | Back spots | 3 conforming discs (plus the Easy 4th), shrink-wrapped to the back at +0.004 | 4 × 48 |

3. **Armature** from the §3.2 bone list, placed from `body.json`.
4. **Skin weights.**
   - Automatic heat weights first.
   - Then script-corrected bands: `Head` 100% above y 0.66, a `Spine` blend from 0.40 to 0.66, and `Hips` below that.
   - Legs and arms are weighted 100% to their own chains.
   - The spot discs are 100% on `Spine`, so they never swim.
5. **Seven shape keys, built by displacement functions** (a radial falloff around a centre point, each with a unit test on its max delta): `MouthSmile`, `MouthFrown`, `MouthOpen`, `MouthO`, `CheekPuff`, `BellyDeflate` (−6% belly volume, visual only), `BellyBreath`.
6. **Vertex colours carry the masks**, so there is no texture painting:
   - R = marking group (0.25, 0.5, 0.75 or 1.0);
   - G = belly glow;
   - B = ambient occlusion;
   - A = the skin-pattern weight.

   UVs come from Smart UV Project with a 0.02 margin, for skin pattern textures.
7. **LODs** use a Decimate collapse on the body and legs only. Eyes and spots are never decimated.

   | LOD | Tris | Used from |
   |---|---|---|
   | LOD0 | about 5,600 | — |
   | LOD1 | 2,200 | 12 m |
   | LOD2 | 900 | 30 m |

8. **Export** to FBX: `apply_scale_options='FBX_SCALE_UNITS'`, `bake_anim=False`, `add_leaf_bones=False`.
9. **Asserts:**
   - height is 0.95 ± 0.005;
   - every socket exists;
   - the triangle budget is met;
   - no weight is under 0.01;
   - the shape-key count is 7.

**Unity import** runs through `HeroModelPostprocessor` (Editor assembly):
- `animationType = Generic` (no Humanoid, because there are no clips);
- `importBlendShapes = true`;
- `optimizeGameObjects = false`, because the procedural layers write bone transforms;
- the materials are remapped to the §3.4 toon material.

A `licenses.csv` row reads "generated in-house by `build_frog.py`" (FO §8.6).

### 3.2 Minimal rig: 25 bones [MUST-A]

```
Root (motor-driven; carries the hitbox collider, never squashes or flips)
└─ SquashPivot (at the feet; squash and stretch scale lives here)
   └─ FlipPivot (at the body centre, y 0.45; Air Hop flip, visual only)
      └─ Hips
         ├─ Spine
         │  ├─ Head
         │  │  ├─ Jaw ── (TongueOrigin socket)
         │  │  ├─ Eye_L ─ Lid_L, Nict_L
         │  │  ├─ Eye_R ─ Lid_R, Nict_R
         │  │  └─ HatSpring ── (Hat socket)
         │  ├─ Sac
         │  ├─ UpperArm_L ─ Hand_L
         │  └─ UpperArm_R ─ Hand_R
         ├─ Thigh_L ─ Shin_L ─ Foot_L
         └─ Thigh_R ─ Shin_R ─ Foot_R
```

That is 25 bones, counting Root, SquashPivot and FlipPivot. Sockets are empty child transforms, not bones.
- **Eye retract** (the swallow gag, since real frogs push their eyes down to swallow) moves the `Eye_*` bones down.
- **Blink** rotates `Lid_*` about local X from 0° to 85°.
- **The Mimic's sideways blink** rotates `Nict_*` about local Y. Only Doppelfrog's Mimic uses it (FO §5.2).

### 3.3 Sockets [MUST-A]

These are fixed transforms in every body implementation (capsule, frog, Wick) and every molt, so every hat fits every form (DECISIONS §2). Positions are rest-pose, in root space.

| Socket | Parent | Position | Used by | Rules |
|---|---|---|---|---|
| **Hat** | HatSpring | (0, 0.86, −0.06) | Hat cosmetics | **Envelope:** x ±0.22, z −0.22 to +0.10, y 0 to +0.30 above the socket. It may not hide more than 30% of either pupil from the front camera, and may not occlude the spots from any gameplay camera (§11 test T6). |
| **Face** | Head | (0, 0.72, +0.25) | Glasses, masks | Envelope 0.40 × 0.12 × 0.18. Never covers the mouth line or more than 30% of a pupil. |
| **Back** | Spine | (0, 0.56, −0.25) | **Gameplay only:** the spot cluster and the Grip ring anchor | No cosmetic attaches here. Skins may pattern the back outside the spot discs. |
| **Belly** | Hips | (0, 0.36, +0.27) | Belly glow patch centre; Glow colour | Skins may not paint over the glow patch. |
| Neck | Spine | (0, 0.55, +0.20) | Boon beads (§5.4); the Knot thread end | Gameplay only |
| Tag | Root | (0, 1.25, 0) | Name tag, Rival badge, Rookie label, **WANTED poster** | Billboard. The WANTED poster floats here, **never on the back**. |
| TongueOrigin | Jaw | (0, 0.60, +0.23) | Tongue tube start, spit, carried items | — |
| SacCenter | Sac | (0, 0.50, +0.21) | Croak radius origin, croak ring VFX | — |
| Hand_L / Hand_R | Hand | tips | Ping pointing, wall-cling IK | — |
| Foot_L / Foot_R | Foot | soles | Dust, Hop Awakening bands, Door-entrance FX | — |
| OrbitCenter | Root | (0, 0.55, 0) | Orbiting fireflies | — |
| CrownCenter | Root | (0, 1.08, 0) | Crown glow halo | — |
| Membrane_L / Membrane_R | UpperArm → Thigh | flanks | **Glider molt** [MUST-B] | — |
| Helmet | Head | (0, 0.80, +0.02) | **Moon Toad** fishbowl [LATER] | The shell (r 0.36) must clear the whole hat envelope, so hats stay on inside it. |

### 3.4 Materials and shader inputs [MUST-A]

- **One toon material for the body, legs, arms and sac:** `Knotwell/ToonHero.hlsl`, owned by the agent (UT). It has:
  - a 3-band ramp;
  - a Fresnel rim in the Seat Hue: intensity 1.2 (HDR), N·V threshold 0.35, power 3.0;
  - the outline Render Graph pass, 2.0 px at 1080p (09 owns the pass).
- **Per-frog shader inputs** go through a `MaterialPropertyBlock`, so the SRP Batcher stays intact:

  | Property | Meaning |
  |---|---|
  | `_SeatHue` | Seat Hue colour |
  | `_GlowColor` | Glow colour cosmetic, default `#FFE27A` |
  | `_GlowEmission` | from the §5.2 table |
  | `_MarkingsLit` | 0–4 marking groups lit |
  | `_CheekGlow` | 0–1, from unbanked fireflies |
  | `_SkinBase`, `_SkinPattern`, `_SkinBelly`, `_SkinIris` | skin palette |
  | `_PatternTex` | 512² skin pattern texture |
  | `_DarkFade` | 0–1, the Dark transition |

- **Spot material** (separate, 3–4 discs):

  | State | Look |
  |---|---|
  | Lit | Filled disc. Core `#FFD24A`, white-hot centre `#FFF6D6`, emission 4.0, ring `#1B1410` |
  | Out | **Hollow** ring `#3A2F22`, no emission. The filled/hollow difference is a shape cue, so it reads without colour vision. |
  | Just lost | Flicker at 6 Hz for 1.0 s |

  Skins and cosmetics can never set spot properties.
- **Eyes:** unlit iris and pupil, a specular dot, and lids in the skin colour.
- **Tongue:** coral `#FF9A7A` (hue 14°) with a paler tip `#FFD0BC` (hue 18°). The Tongue trail cosmetic scrolls a UV ribbon.
  - The tongue sits 29° from the betrayal crimson `#FF3D6E` (hue 345°). A pink tongue would sit within 10° of it, and the Resolve tell (§4) must never be ambiguous.
  - The tongue tip turns crimson **only** as the Resolve tell.
- **Draw budget per frog:** 4 materials (body, eyes, spots, tongue when out), no more than 6 draw calls, and 1 realtime point light (§5.2) with no shadows.

### 3.5 The `IHeroBody` contract [MUST-A]

It lives in `Game.Core/Hero/IHeroBody.cs`.
- **Gameplay truth** (spots, ranks, motor, tongue logic) lives in `HeroState` (a NetworkBehaviour) and `HeroMotor`.
- **The body is presentation only.** It reads replicated state, and nothing reads gameplay back from it except `VisualBounds`, which is used by tests.

```csharp
namespace Knotwell.Core.Hero
{
    public enum HeroVerb : byte { Hop, Tongue, Croak }
    public enum HeroSocket : byte { Hat, Face, Back, Belly, Neck, Tag, TongueOrigin, SacCenter,
        HandL, HandR, FootL, FootR, OrbitCenter, CrownCenter, SpotTop, SpotLeft, SpotRight, SpotBottom,
        MembraneL, MembraneR, Helmet }
    public enum HeroLife : byte { Alive, Down, Dark, Swallowed, Hidden }
    public enum HeroMolt : byte { Froglet, Glider, MoonToad, Beyond }
    public enum BoonFamily : byte { None, Body, Sight, Chorus, Risk, Duo, Legendary }
    public enum CroakKind : byte { Pulse, SustainStart, SustainEnd, Revive, Chorus, TwinToll, Thunder, Muffled }
    public enum HeroExpression : byte { Calm, Joy, Fear, Anger, Sad, Focus, HoldBreath, Dazed, Resolve }
    public enum HeroOneShot : byte { Hatch, ReHatch, LevelUp, Bank, Gulp, Spit, Catch, Caught, Hit, Splat,
        Scramble, KnotTie, CutSnap, HoldOn, ClassReveal, BoonBead, Crown, Molt, Emote0, Emote1, Emote2,
        Emote3, Emote4, Emote5, Emote6, Emote7 }

    public interface IHeroBody
    {
        // --- The members DECISIONS §2 names ---
        void SetSpots(int lit, int max);                        // max 3 (Easy 4)
        void SetGlow(int glowLevel, int unbankedFireflies);     // 1..10; unbanked drives _CheekGlow
        void PlayAwakening(HeroVerb verb, int rank);            // 3 = Awakening, 4 = Mastery
        Transform TongueOrigin { get; }
        void CroakFX(CroakKind kind, float radius);
        Transform GetSocket(HeroSocket socket);

        // --- State the body renders ---
        void SetSeat(int seatIndex);                            // 0..7 → Seat Hue + glyph (§5.6)
        void SetVerbRanks(int hop, int tongue, int croak);      // 1..4 each; parts per §5.3
        void SetBoons(ReadOnlySpan<BoonFamily> passives, BoonFamily active);
        void SetMolt(HeroMolt molt);
        void SetLife(HeroLife life);
        void SetExpression(HeroExpression e, float seconds);    // Resolve is host-forced (§4)
        void SetTongue(in TongueVisual t);                      // phase, tip, target, carried ids
        void SetCharge(float charge01);
        void SetGrip(float grip01, bool clinging);
        void ApplyMotor(in HeroMotorSample s);                  // pos, vel, grounded, wall, swim, glide
        void PlayOneShot(HeroOneShot shot);
        void PopSpotVisual(HeroSocket spot, Vector3 launchVelocity); // the orb itself is a NetworkObject
        void SetHitstop(float seconds);                         // local visual freeze (§10)
        Bounds VisualBounds { get; }
    }
}
```

**Implementations:**

| Class | Tier | Notes |
|---|---|---|
| `CapsuleHeroBody` | **[MUST-A, M0 week 1]** | A 0.95 m capsule with 3 sphere spots, an emissive belly disc, the firefly ring, and rank-III parts as primitives on the same sockets: a glowing sphere at TongueOrigin, rings at the feet, and a larger sac sphere. The greybox must already show all three growth readouts, because Gate B recall can't be earned by a grey capsule (plan_1 §7). |
| `FrogHeroBody` | **[MUST-A, week 3]** | §3.1–§4 and §9 |
| `WickHeroBody` | **[MUST-A test-grade, for Gate B only]**; ships only if the gates fail | §13 |

### 3.6 Replicated body state (read by every client) [MUST-A]

These are packed in `HeroState` as NetworkVariables unless noted. The procedural animation runs locally from them; **the ragdoll layer is never networked** (UT; DECISIONS §2).

| Field | Size | Notes |
|---|---|---|
| seat | byte | — |
| spots, spotsMax | 2 × byte | — |
| life | byte | — |
| glowLevel | byte | — |
| unbanked | ushort | Only the cheek-glow bucket (0–4) is replicated to others; the owner sees the exact count |
| ranks | ushort | 3 × 4 bits |
| awakenings | byte | bitmask |
| boons | 5 × byte | — |
| molt | byte | — |
| charge | byte | 0–255 |
| grip | byte | — |
| tongue | struct | phase, targetId, tip position quantised to 1 cm, carriedIds[2] |
| expression override | byte + time | Only Resolve, Down and Dark are host-forced; everything else is derived locally |
| cosmetics | ids | — |
| Croak events | unreliable RPC with host timestamp | Not a NetworkVariable |
| Motor | per 10_UNITY_TECH | Not a NetworkVariable |

---

## 4. Face and expression system [MUST-A]

**Emotion channels.** Emotion uses only these channels, never the Glow, spots or rim (H5):

| Channel | Parts | Range |
|---|---|---|
| **Eyes** | Lid close 0–1 (bone); pupil scale 0.6–1.3; eye retract 0–0.03 m; look-at | Head yaw ±25° and pitch ±20°, plus eyes ±30° on top |
| **Mouth** | `MouthSmile`, `MouthFrown`, `MouthOpen`, `MouthO` | 0–1 each. Frogs croak with the mouth *closed*, so croaks don't open it. |
| **Cheeks** | `CheekPuff` 0–1 (shape) | `_CheekGlow` is the unbanked-firefly readout, not an emotion |
| **Sac** | Breathing rate (Hz) and inflation (spring) | 0.3–8 Hz |
| **Posture** | Spine lean ±15°, side slump ±10°, crouch 0–0.3, micro-tremble | — |

**How expressions are chosen.**
- An `ExpressionMixer` picks the highest-priority active expression and cross-fades over 0.10 s.
- The **low-spot overlay** adds on top of the chosen expression. It is not an expression in its own right.
- **Priority runs top to bottom** in the table: the first matching row wins.

| Prio | Expression | Trigger | Eyes | Mouth / cheeks | Sac / posture | Duration |
|---|---|---|---|---|---|---|
| 1 | **Dark** | 0 spots after Down | Close over 0.4 s | — | The body curls into the egg (§8) | While Dark |
| 2 | **Down** | Last spot knocked out | Spiral pupils (shader) | `MouthO` 0.6 | Flat on belly; limbs twitch at 2 Hz | 3.0 s |
| 3 | **Resolve** (THE TELL) | Any Cut channel; any full yank or Heart-door steal windup; any Rival betrayal action (03) | Lids 0.45; pupils 0.7; locked on the target | `CheekPuff` 1.0; **the tongue tip peeks out, crimson `#FF3D6E`** | Leans 12° toward the target (away from the partner during a Cut) | The whole channel, **at least 0.6 s**. Host-forced, and no emote, cosmetic or setting can hide it (FO §5.2, §7 "Resolve tell"). |
| 4 | **Dazed** | Hit | Lids 0.8 for 0.15 s, then 0.3 | `MouthO` 0.7 | Sac flutter 8 Hz | 0.6 s |
| 5 | **HoldBreath** | Still for ≥ 0.3 s while a room's freeze cue is active | Wide: lids 0, pupils 1.1 | `CheekPuff` 0.6 | Sac 0; tremble 12 Hz at 0.003 m | While frozen |
| 6 | **Fear** | A monster cue active within 8 m, or on 1 spot in a rule room | Lids 0; pupils 0.6; eyes retract 0.01 | `MouthFrown` 0.3 | Crouch 0.1; sac flutter 4 Hz | While true |
| 7 | **Focus** | Charging a hop, aiming a spit, sustaining a croak | Lids 0.3; pupils 0.8 | `CheekPuff` 0.2 | — | While true |
| 8 | **Anger** | Shoved, tugged or Cut | Lids 0.35 | `MouthFrown` 0.8 | Sac flare 1.2×; one stomp | 2.0 s |
| 9 | **Sad** | Your Knot partner goes Dark or Cuts you | Lids 0.4 | `MouthFrown` 0.5 | Slump 8° to one side; sac 0.3 Hz | 3.0 s |
| 10 | **Joy** | Door clear, a catch (given or received), level-up, revived, Vengeance landed | Pupils 1.25 | `MouthSmile` 1.0 | 2 bounces of 0.05 m; sac bounce | 1.2 s |
| 11 | **Calm** | Default | Blink every 3–6 s | `MouthSmile` 0.15 | Breathe 0.5 Hz (sac ±6%, `BellyBreath` ±2%) | — |

**Low-spot overlay** (additive):

| Spots left | Lids | `BellyDeflate` | Breathing | Slump |
|---|---|---|---|---|
| 2 | +0.15 | — | — | — |
| 1 | +0.35 | 0.5 | 1.2 Hz | 5° |

This is FO §2.3's second health cue ("deflation and eyelid droop"). The hitbox is unchanged.

**Blink.** 0.12 s in total: close 0.04, hold 0.03, open 0.05. There is a 15% chance of a double-blink. Intervals are seeded per seat, so the 8 frogs never blink in sync.

**The Mimic's tell** (Doppelfrog, 05/03). The Mimic uses `Nict_*`, a **sideways** blink of the same 0.12 s, in place of 1 in 3 of its blinks. Humans and Rivals never use `Nict_*`.

**Look-at targets, in priority order:**
1. your tongue or spit target;
2. a speaking frog within 8 m;
3. an active monster cue within 12 m;
4. the Mouth, when idle at a Landing under open sky (pitch +40°);
5. the camera's forward direction.

Smoothing is 0.12 s. Bots use the same targets.

---

## 5. Two axes on one body

### 5.1 The fragile axis: spots [MUST-A]

- **3 spots** (4 on Easy) sit in a triangle across the upper back, readable from the 3/4 follow camera. The Easy 4th makes a diamond.
- **Knock-out order is fixed**, so each count makes a recognisable shape:

  | Mode | Order out | Pattern left |
  |---|---|---|
  | Normal and above | **Right → Left → Top** | 3 = ▲, 2 = diagonal pair, 1 = the lone top spot ("one light left") |
  | Easy | **Bottom → Right → Left → Top** | — |

  Spots restore in reverse order.
- **Readable size at the real camera.** At 25 m (vertical FOV 60°, 1080p) the scale is 37.4 px/m. So:
  - the frog is 35 px tall;
  - a spot is 5.6 px across, with a 2.2 px gap between spots.

  Bloom widens them. Gate A (§12) tests this, and the remediation pass enlarges spots to r 0.095 (7.1 px).

### 5.2 The power axis: Glow Level on the body [MUST-A Lv1–7 on screen; Lv8–10 and Crown MUST-B]

**Formulas** (t = (L − 1) / 9):
- belly emission E = 0.35 + 2.65 · t^0.8, in HDR with a bloom threshold of 1.0;
- point light range = 2 + 4t m;
- point light intensity = 0.5 + 1.0t;
- orbiting fireflies = L − 1;
- orbit radius = 0.55 + 0.03 · (L − 1) m.

Markings light one group at Lv4, 6, 8 and 10. Values below are rounded.

| Glow Level | Belly E | Light range | Fireflies | Orbit r | Markings lit | Tier (Gate A) | Lit width |
|---|---|---|---|---|---|---|---|
| 1 | 0.35 | 2.0 m | 0 | — | 0 | **dim** | 0.60 m |
| 2 | 0.81 | 2.4 | 1 | 0.58 | 0 | dim | 1.16 |
| 3 | 1.14 | 2.9 | 2 | 0.61 | 0 | dim | 1.22 |
| 4 | 1.45 | 3.3 | 3 | 0.64 | 1 (back stripes) | **glowing** | 1.28 |
| 5 | 1.73 | 3.8 | 4 | 0.67 | 1 | glowing | 1.34 |
| 6 | 2.01 | 4.2 | 5 | 0.70 | 2 (+ leg bands) | glowing | 1.40 |
| 7 | 2.27 | 4.7 | 6 | 0.73 | 2 | glowing | 1.46 |
| 8 | 2.52 | 5.1 | 7 | 0.76 | 3 (+ face mask) | glowing | 1.52 |
| 9 | 2.76 | 5.6 | 8 | 0.79 | 3 | glowing | 1.58 |
| 10 | 3.00 | 6.0 | 9 | 0.82 | 4 (+ belly rim) | **haloed**: Crown glow | about 1.70 |

**Orbiting fireflies.**
- **Sprite:** 0.05 m, drawn at **no less than 3 px on screen**, with a 0.15 m trail.
- **Motion:** orbit at 0.45 rev/s, a vertical bob of ±0.06 m at 0.7 Hz, and a 0.3 Hz twinkle that is out of phase between fireflies.
- **Implementation:** one Shuriken system per frog, positions set by script with `SetParticles`, at most 21 particles (9 orbiting plus 12 in the Crown).

**Crown glow [MUST-B].**
- A ring of 12 fireflies of r 0.24 at the CrownCenter socket, turning at 0.25 rev/s.
- A soft additive halo disc, 0.6 m across.
- It ignites over 1.2 s (§9 A60).

**Every level-up shows on the body** (FO §4.1):
- +1 firefly swoops into orbit over 0.4 s;
- the belly steps up;
- the light reaches further across the dark rule room.

Your light literally pushes the room's darkness back as you grow. It can also be a liability, as when the Jar picks the brightest frog (05).

**While you are Dark**, your orbiting fireflies circle **your egg** at 20% brightness. Everyone can see where to revive you, and whose egg it is.

### 5.3 Awakening and Mastery parts (fixed sockets) [III: MUST-A · IV: MUST-B]

| Verb | Rank III Awakening: part added | Rank IV Mastery: added effect |
|---|---|---|
| **Hop**: Air Hop | **Spring heels.** Glowing ankle bands (0.02 thick, Glow colour) on Foot_L/R. A light puff appears under the feet on each Air Hop. | The bands extend into shin stripes. A stomp ring VFX (3 m) plays on charged landings. |
| **Tongue**: Long Tongue | **A glowing tongue tip:** a 0.035 m emissive bead. At idle it peeks from the mouth corner as a glint every 4 s. | The tongue leaves a 0.3 s light ribbon. |
| **Croak**: Twin Toll | **A bigger throat sac:** rest r 0.10 → 0.13 and inflated 0.18 → 0.22, with two bell-ring marks. It sits inside the hitbox. | An animated crackle mask on the sac; the Thunder ring is 9 m. |

**How parts appear.**
- Parts pop on with an elastic scale of 0 → 1.2 → 1.0 over 0.25 s.
- Parts are body children, **never colliders**.
- The capsule greybox uses a primitive stand-in for each part (§3.5).

### 5.4 Other things you can read on the body

| Readout | What it shows | Tier |
|---|---|---|
| **Boon beads** (Neck) | One bead per held passive Boon (up to 4) plus a larger bead for the active one. Family colours: Body `#FFB347`, Sight `#6FE3FF`, Chorus `#7CF29A`, Risk `#C58CFF`, Legendary gold `#FFD700` with a sparkle. An upgrade (I → III) adds 1 or 2 rings to its bead. Beads are 0.03 m. | [MUST-A] |
| **Cheek glow** | Unbanked fireflies, in buckets: 0; 1–9 = 0.25; 10–24 = 0.5; 25–49 = 0.75; 50+ = 1.0. This is how others see "who is carrying loot" in a Heart door. | [MUST-A] |
| **Class markings** | Permanent class markings (04/08) sit in the skin mask. In-climb class reveals sweep-light them head to toe over 0.8 s. | [MUST-B] |
| **Knot thread** | 0.012 m wide, running Neck to Neck, a gradient of the two Seat Hues. Visible in line of sight up to 20 m. Through walls, only the two partners see it (03). It flashes crimson during a Cut. | [MUST-B] |
| **Grip ring** | Only while clinging to a Grip surface. A ring of r 0.40 around the waist in the Seat Hue, 0.03 thick, draining clockwise. It flashes at 4 Hz below 25%. Everyone sees it, so friends know whom to haul. | [MUST-B] |

### 5.5 Power tiers (what Gate A asks testers to name)

| Tier | Levels | What distinguishes it |
|---|---|---|
| **Dim** | Lv1–3 | 0–2 fireflies; belly under or just at bloom; no markings |
| **Glowing** | Lv4–9 | 3 or more fireflies; belly blooms; markings lit |
| **Haloed** | Lv10 | Crown glow |

### 5.6 Seat Hue [MUST-A]

**What it is.** Every seat (0–7) has a fixed rim-light colour plus a shape glyph.

**What it drives:**
- the rim light;
- the name tag;
- blame tags;
- pings;
- the tadpole ghost tint;
- the hop-arc preview;
- the Grip ring;
- the Knot thread;
- room evidence, such as culprit motes (05).

**A cosmetic never sets or overrides it** (DECISIONS §2; CRIT #6).

**The palette.** It is the Okabe–Ito colour-blind-safe set with black replaced by white, because a rim light can't be black, and blue lifted for rim brightness.
- The minimum pairwise CIEDE2000 is **10.9** across normal, protan, deutan and tritan simulations (Machado 2009 matrices, checked 2026-09-29).
- The worst pair, orange vs reddish purple under tritan, is backed by glyphs.
- Every hue is at least 15° from the betrayal crimson (345°).

| Seat | Name | Hex | Hue | Glyph | Croak degree* |
|---|---|---|---|---|---|
| 0 (host) | Orange | `#E69F00` | 41° | ● circle | 1 |
| 1 | Sky | `#56B4E9` | 202° | ▲ triangle | 2 |
| 2 | Green | `#009E73` | 164° | ■ square | 3 |
| 3 | Lemon | `#F0E442` | 56° | ★ star | 5 |
| 4 | Blue | `#1A6FD6` | 213° | ⬢ hexagon | 6 |
| 5 | Vermilion | `#D55E00` | 26° | ✚ cross | 1′ |
| 6 | Orchid | `#CC79A7` | 327° (18° from crimson) | ☾ crescent | 2′ |
| 7 | White | `#F4F4F4` | — | teardrop | 3′ |

\*Each seat croaks on its own degree of the major pentatonic scale, so any two croaks harmonise. The key per layer comes from 09 (FO §6.2 #6).

**Glyph rules.** Glyphs avoid the card suits (♠ ♦ ♣ ♥), which belong to plaques. The glyph shows on the name tag, pings and blame tags.

### 5.7 Cosmetic guardrails that protect the body [MUST-A; 08 owns the catalogue]

1. **No cosmetic may:**
   - touch the spot discs, the Back socket, the rim or `_GlowEmission`;
   - change the hitbox;
   - add a collider.
2. **No cosmetic hue, including Glow colours, may sit within 15° of crimson** (330°–360°) (DECISIONS §2).
3. **Glow colour cosmetics need relative luminance ≥ 0.6**, so the dim/glowing/haloed read survives.
4. **Hats fit the §3.3 envelope** and pass the spot-occlusion test (T6).
5. **Skins may change** base, pattern, belly, iris and pattern texture. Spot contrast is guaranteed by the dark spot ring, which is drawn over every skin.

---

## 6. Controls: 8 bindings [MUST-A] (FO §3.9, kept)

| # | Verb | Keyboard / mouse | Xbox / Steam Deck | PlayStation | Tap | Hold | Context |
|---|---|---|---|---|---|---|---|
| 1 | **Move** | WASD | Left stick | Left stick | — | — | Hop-waddle; swim; climb Grip walls; ghost swim |
| 2 | **Camera** | Mouse | Right stick | Right stick | — | — | Aims the Tongue and spit |
| 3 | **Hop** | Space | A | Cross | Instant hop while moving | Charge a leap with no move input; glide while falling (Sky) | In the air: Air Hop (III). On a wall: wall hop. In water: water hop. Hauled or carried: let go. Held by a yank tell: wriggle free. |
| 4 | **Tongue** | Left mouse | RT | R2 | Lash: grab, gulp, pull, lever, catch, **Interact** | Carry; grapple zip; **hold on** (Cut counter) | Jars, stall, Mirror, doors, keys, levers |
| 5 | **Croak** | Right mouse | LT | L2 | Pulse | Sustain a note; **revive** over an egg | While carrying: **spit**. Chorus with others. |
| 6 | **Shove** | F | B | Circle | Belly bump (the same 6 m/s impulse for everyone) | **While Knotted: hold 1.2 s = Cut** [MUST-B] | — |
| 7 | **Power** | E | RB | R1 | Your active Boon | 0.30 s = class Signature [MUST-B] | — |
| 8 | **Wheel** | Q | LB | L1 | Look ping (double-tap = Danger) | Radial: 8 quick lines / 8 emotes; "Knot?" at the Knot spot | — |

**Not counted** (FO §3.9):
- Pause/Settings on Esc, Menu or Options. Pause shows the map (DECISIONS §8.2 #13).
- Pause → **Unstuck**: teleports you to your last safe ground at no cost, with a 30 s cooldown.

X/Y (Square/Triangle) and the stick clicks are unbound by default, and anything can be rebound.

**Input implementation.**
- A single action map, `Frog`, generated from `Data/input/bindings.json` into `InputSystem_Actions.inputactions` by an Editor generator. Agents never hand-edit the asset.
- **Press and release timestamps are read in code, not through Input System Hold interactions.** The hop rule, the Cut channel and the tongue lag compensation (FO §5.4.6) all need exact input times.
- Bots emit the same `FrogInput` struct (UT; plan_2).

**Settings** (all [MUST-A] except where tagged):

| Setting | Values |
|---|---|
| Hold → toggle, per hold | **Hop charge:** press to start, press to fire. **Carry:** tap to take, tap to drop. **Croak sustain / revive:** tap to start, tap to stop. **Cut [MUST-B]:** double-tap Shove to start, Shove to cancel. **Wheel:** tap to open. **Signature:** double-tap Power. (FO §3.9) |
| Mouse sensitivity | 0.1–3.0, default 1.0; invert Y |
| Stick look speed | 180°/s yaw, 120°/s pitch; response exponent 1.6; radial deadzone 0.12 |
| Tongue aim assist | 0–100%, default 50%. Soft-lock cone 12° on mouse, 18° on stick, at 50%. |
| FOV | 50–90, default 60 |
| Reduced motion | Squash and stretch amplitude ×0.5; no FOV punches; no camera shake; Air Hop flip off |
| Text | Prompts are localized (table `Hero`), size 100–150% (DECISIONS §8.2 #27) |

---

## 7. Verbs, with exact numbers

All values live in `Data/hero/verbs.json` and `Data/hero/motor.json`. Rooms, bots, the growth CI test and the lane validator (§11) all read these same files. Ranks follow FO §4.1, with DECISIONS §10 #19 naming the Awakenings and Masteries.

### 7.1 Move [MUST-A]

**Ground:**
- speed **5.0 m/s**;
- acceleration 30 m/s², deceleration 40 m/s² (GDD §4.2, kept by FO §7);
- turn rate 720°/s;
- step offset 0.30 m;
- slope limit 45° (steeper slopes slide you down at 3 m/s);
- **no sprint.**

**Air control:**
- acceleration 12 m/s² (40%);
- top horizontal speed is the higher of 5.0 m/s and your launch speed;
- with no input you slow by 4 m/s²; with input, air drag is 0.

**Speed modifiers:**

| Situation | Speed |
|---|---|
| Carrying ≤ 5 kg | Full |
| Carrying 5–20 kg | 3.5 m/s |
| Sustaining a croak | 3.0 m/s |
| Crouch-shuffle while charging a hop | 1.2 m/s |
| Shallow water (≤ 0.5 m) | 3.5 m/s |
| Swimming | 3.0 m/s |
| Tadpole ghost | 3.0 m/s in 3D (GDD §5.3; matches 10) |

**Pushing and platforms.**
- **Walking into a prop pushes it** with 250 N. Props ≤ 40 kg slide. The Two-Frog Door needs 400 N, so two frogs pushing at once (`br_shove_door`, 05).
- On moving platforms you inherit the platform's velocity. Your 25 kg counts toward raft torque (§7.2.9).

**Frogs collide with each other**, and you can stand on another frog's head.

### 7.2 Hop [MUST-A ranks I–III · IV MUST-B]

#### 7.2.1 Constants

| Constant | Value |
|---|---|
| Rise gravity (while rising) | 20 m/s² |
| Fall gravity | 26 m/s² (a snappy fall) |
| Terminal fall speed | 18 m/s |
| Coyote time | **0.12 s** (FO §6.2) |
| Jump buffer | **0.10 s** (FO §6.2) |

This supersedes GDD §4.2's "vy₀ 5.3 m/s": at g = 20 that value gives a 0.70 m apex, not 1.4 m.

#### 7.2.2 The one hop rule: move to hop, stand to leap

| When you press Hop… | Result |
|---|---|
| **with move input** (stick or keys ≥ 0.2) | An **instant hop** on press (0 ms latency). Your current horizontal speed is kept. |
| **with no move input** | **Charge.** You crouch, you can shuffle at 1.2 m/s to aim, and the hop fires on **release**. A release before 0.10 s is a plain tap hop. Charge fraction c runs linearly from 0 at 0.10 s to 1 at 0.45 s. At full charge you can hold as long as you like. |
| in the air, with an Air Hop available | An Air Hop, on press (§7.2.4). **Exception:** if a ground contact is predicted within 0.10 s (a ray along your velocity), the press is buffered instead, so the Air Hop isn't wasted on a landing. |
| in the air, within the buffer | Buffered. On landing, it becomes an instant hop if you have move input; with no move input, it becomes a charge if Hop is still held, or a tap if not. |

This keeps running hops instant and makes the big leap a deliberate "stop, crouch, leap": the frog fantasy and the textbook squash-and-stretch beat (FO §2.3).

**Arc preview.** After 0.15 s of charging, a dotted arc and a landing ring in your Seat Hue show where you will land. It is visible only to you. [MUST-A]

**How a charged leap flies:**
- **Apex** = 1.4 + (rank charged apex − 1.4) × c.
- **Horizontal speed at release:**
  - with move input: 2.0 + (H_rank − 2.0) × c, in the stick direction;
  - with no move input: 0.8 m/s along your facing, which gives a straight-up leap to a ledge overhead.

#### 7.2.3 Hop numbers by rank

Gaps are on flat ground, same height, launched at full speed.

| Rank | Tap apex | Charged apex (vy₀) | H_rank | Airtime (charged) | Max gap | Max ledge reach* |
|---|---|---|---|---|---|---|
| **I** (start) | 1.40 m (7.48 m/s) | **1.90 m** (8.72) | 5.5 m/s | 0.82 s | Tap while running at 5.0 m/s: **3.5 m**. Charged: **4.5 m**. | 1.50 tap · **2.00** charged |
| **II** | 1.40 | **2.40 m** (9.80) | 6.0 | 0.92 s | **5.5 m** | **2.50** |
| **III: Air Hop** | 1.40 | 2.40 | 6.0 | 1.32 s with Air Hop | **7.9 m** | **3.50** (2.40 + 1.00 + 0.10) |
| **IV: Mastery** | 1.40 | **3.00 m** (10.95) | 6.5 | 1.42 s with Air Hop | **9.2 m** | 3.10 alone · **4.10** with Air Hop |

\*Reach = apex + **0.10 m scramble margin** (§7.2.5).

**Rank IV Mastery also adds a landing stomp.** A charged landing with c ≥ 0.5 pops mites within **3 m** and nudges props ≤ 5 kg at 3 m/s (FO §4.1).

**Carrying 5–20 kg** multiplies every apex by 0.7.

#### 7.2.4 Air Hop (Hop III, the Awakening)

- **One per airborne phase.** Moon Hop (a Legendary, 04) gives 2, which makes a triple hop.
- It sets vy to **6.32 m/s**, which is +1.0 m above the point where you trigger it.
- **It redirects you:** your horizontal velocity turns to the stick direction, keeping its speed (at least 2.0 m/s).
- It works while falling, including off a falling platform (FO §4.1).
- **It resets the fall-damage height.**
- A press inside the coyote window uses the ground hop, not the Air Hop.
- **Visuals:**
  - a 360° forward flip on `FlipPivot` over 0.35 s (the hitbox never rotates; reduced motion turns the flip off);
  - a light puff under the feet.

#### 7.2.5 Scramble (the ledge grab)

- **When it triggers:** during any hop or fall, you touch a ledge face, the ledge top is 0–0.10 m above your feet, and your centre is within 0.35 m of the edge.
- **What happens:** you scramble up in **0.20 s**. Hand IK grips the lip, the legs kick twice, and you stand with zero velocity.
- **Why the margin is so small:** it keeps the rank thresholds honest (§7.10).

#### 7.2.6 Grip surfaces and wall cling [MUST-B; `sp_grip_wall`, Sticky Pads]

Only surfaces tagged `GripSurface` can be clung to. The Sticky Pads Boon gives a short cling on any wall; its cling time and wall-jump numbers are 04's.

- **Latching.** You latch automatically on contact while airborne or walking into the wall.
- **Grip** (the PEAK layer, per frog, never shared; FO §5.1):

  | Event | Grip |
  |---|---|
  | Start | 100 |
  | Clinging still | −10/s |
  | Climbing at 1.8 m/s | −16/s |
  | Each wall hop | −20 |
  | Being tongue-hauled | 0 |
  | Standing on ground or a ledge ≥ 0.4 m deep | +40/s |
  | Moss holds | Refills from moss holds are room data (05) |
  | Sticky Pads II | All drain ×0.7 |

- **At 0 grip** you slide down at 1.5 m/s for 0.5 s, then detach and fall.
- **Wall hops:**

  | Input | Hop |
  |---|---|
  | Hop with stick up | Up the wall, apex 1.0 m |
  | Hop with stick neutral | Up the wall, apex 0.6 m |
  | Hop with stick away | Off the wall: apex 1.2 m, 3.0 m/s outward |

- **Letting go:** hold the stick away from the wall for 0.3 s to drop.
- **Other verbs on a wall:** the Tongue works (including the rank II grapple). Croak works. Shove does not.

#### 7.2.7 Water [MUST-A]

- **Shallow water** (≤ 0.5 m): you wade at 3.5 m/s.
- **Deep water:** you **swim** at 3.0 m/s, pitched 70°, with the eyes at the waterline, frog-style.
  - There is no charge in water.
  - A **water hop** lifts you 1.0 m above the surface (vy 6.32), onto pads or edges.
  - Tongue and Croak work.
- **Water is safe by default.** Frogs are at home in it. Landing in deep water never costs a spot from height.
- **Rooms may mark water as a hazard** (pike, eel, cold; 05).

#### 7.2.8 Glide: the Sky's movement verb [MUST-B for the Rim · SHOULD Sky Preview · LATER Sky]

- **Where it is on:**
  - with the **Glider molt**, on the Rim after ★1 and in the Sky (DECISIONS §4);
  - for the Tree Frog class Signature "Glide Leap", which uses its own numbers from 04 (1.5 s, fall speed 1.2 m/s, cooldown 12 s). The numbers below are the Glider molt's.
- **How to glide:** keep holding Hop past the apex, or hold Hop while falling once your Air Hops are spent.
- **Numbers:**

  | Parameter | Value |
  |---|---|
  | Fall speed cap | 2.5 m/s |
  | Horizontal acceleration | 10 m/s² toward the stick |
  | Horizontal top speed | 6.5 m/s |
  | Turn rate | 180°/s |
  | Duration | **2.0 s per airborne phase** |

- **Refills:** touchdown, wall latch or grapple.
- **Release Hop** to drop.
- **Glide landings never hurt.**
- **Gravity is not changed.** WORLD's UPDRAFT ×0.55 is rejected because it would break every room's hop thresholds. Sky rooms gate on gap width instead.

#### 7.2.9 Landings

| Landing | Effect | Noise radius |
|---|---|---|
| Normal | Squash (§9) | 1.5 m |
| Charged | Squash | 3 m |
| Drop ≥ 3 m | **Splat:** 0.25 s recovery, no damage | 5 m |
| Drop ≥ 6 m | Splat **and −1 spot** (§8) | 5 m |
| Deep water | Splash | 4 m |

- **Raft and platform impulse on landing** = 25 kg × landing speed × 0.5. That is why a frog landing hard on a raft tips it ("the fat frog", FO §5.1).
- Noise feeds the rooms' NoiseBus (GDD §6.0.5).

### 7.3 Tongue [MUST-A ranks I–III · IV MUST-B]

#### 7.3.1 Timeline of one lash

| t (from press) | What happens |
|---|---|
| 0.00 | **Cheek-puff tell** starts (`CheekPuff` 0 → 1 over 0.10 s); eyes lock on the target |
| 0.10 | The tongue leaves the mouth at **40 m/s**. It reaches 3 m at 0.175 s and 8 m at 0.30 s. |
| On contact | **Light things stick and come home at once:** fireflies, spot orbs, keys, items ≤ 2 kg, mites (which pop into fireflies). |
| **≥ 0.25** | The earliest moment a **prop (2–20 kg), lever or frog** may move (FO §2.3). The tongue waits, stuck, until then. |
| ≥ 0.6 s after sticking | The earliest moment a **full yank or Heart-door steal** acts (§7.11) |
| Return | Retracts at 45 m/s. **0.30 s cooldown** once the tongue is back in. |
| Miss | The tongue slaps limp at max range for 0.08 s, then retracts. A miss at 3 m costs about 0.6 s. |

#### 7.3.2 What the tongue does, by target (checked in this order)

| Target | Effect |
|---|---|
| **Frog in fall peril** (airborne ≥ 0.25 s, vy < −3 m/s, and no walkable safe ground within 4 m below its path), or a room-flagged Trust Fall target | **Catch.** Reels them to you at 10 m/s and sets them down beside you. Cancels fall damage and void. You must be grounded or clinging. Both frogs get a 120 ms hitstop and Joy. |
| **Knocked-out spot orb** (§8.2) | Returns to its **owner**, always, whoever tongued it |
| Loose fireflies | Gulped and banked at clear (04). A fixed **0.5 m touch-gulp** radius also applies. It never scales (FO §4.1). |
| **Carryable** (≤ 20 kg: jar, key, egg, pot) | Reeled to the mouth. **Hold Tongue to carry; release to drop** it 0.4 m in front of you. **Co-carry:** 2 tongues on one prop add their capacities (40 kg), at 2.5 m/s. |
| Lever or handle | Pulled over 0.3 s, then the tongue auto-releases |
| Interactable (jar lid, stall item, the Mirror, Landing toys) | **Interact.** Uses the rank range, but never less than 2.5 m. |
| **Anchor** (`TongueAnchor`), rank II+ | **Grapple zip** at 12 m/s while you hold. Release to let go, keeping your velocity (capped at 12 m/s). Arriving within 0.8 m pops you up (vy 5.0) so you land on top. **A zip refills your Air Hop and Glide.** |
| Anchor at rank I; any prop > 20 kg | A comic "thwap". Nothing moves. |
| Monster body | "Thwap", unless the room tags a tongue point (for example `snake_coil`'s tail or `heron_shadow`'s feather; 05) |
| **Snatchable projectile**, rank III+ | Caught and carried. **Spit it back** (§7.3.4). |
| Other frog | **Tug** (≤ 1 m), **yank**, **haul** or **steal**, strictly per §7.11 |

**Target selection.**
- **Candidates must be:** within the rank range + 0.25 m tip tolerance; inside the soft-lock cone (§6); and in line of sight (a 0.05 m sphere cast).
- **Pick** = the smallest (angle to aim ray ÷ weight). Weights:

  | Target type | Weight |
  |---|---|
  | Catch target, spot orb | 2.0 |
  | Interactable | 1.25 |
  | Lever | 1.1 |
  | Edible | 1.1 |
  | Carryable | 1.0 |
  | Anchor | 1.0 |
  | Frog (tug) | 0.6 |

  So saving a friend beats everything, and tugging one is hard to do by accident.
- **Feedback:** the soft-locked target shows a 0.3 s Seat Hue outline. With no target, the tongue flies straight along the camera ray.

#### 7.3.3 Tongue numbers by rank

| Rank | Range | Adds |
|---|---|---|
| **I** (start) | **3.0 m** | Pulls props ≤ 20 kg, levers and keys; catches; carries |
| **II** | **4.5 m** | **Grapple:** anchors pull *you* |
| **III: Long Tongue** (Awakening) | **6.0 m** | **Two targets at once:** a second lash while carrying adds a second item. **Snatch** a monster projectile and spit it back. |
| **IV: Mastery** | **8.0 m** | **Chain grapple:** lash a new anchor mid-zip to redirect with no touchdown. Up to 4 anchors per airborne phase, at most 8 m apart. |

Sure Tongue (a Boon, 04) adds +1 m and snaps to levers and keys. The Dart Frog Signature is one 10 m lash.

#### 7.3.4 Spit (Croak while carrying)

- **You can't croak with your mouth full.** Tapping Croak while carrying **spits** the item along the aim ray:

  | Item | Launch |
  |---|---|
  | Items > 2 kg | 10 m/s + 2 m/s up |
  | Items ≤ 2 kg | 14 m/s |
  | Monster projectiles | 14 m/s, flat |

- **Arc preview** while carrying (Seat Hue, only you see it). [MUST-A]
- **Noise** radius 2 m.
- **Uses:**
  - pass one item through the Meeting Door window (a key, a jar or a spat firefly; FO §3.3);
  - return projectiles (Long Tongue; Bell-Eater, 04).

### 7.4 Croak [MUST-A ranks I–III · IV MUST-B]

#### 7.4.1 Pulse

- **Timing.** On press the sac inflates over 0.12 s. The **pulse event** happens at press + 0.12 s, using the host timestamp. The ring VFX expands at 30 m/s.
- **Radius** is measured from SacCenter. A bell counts if its centre is within radius + 0.3 m (the standard bell radius).

| Rank | Pulse radius | Bells per pulse | Mites | Monsters | Pots | Cooldown |
|---|---|---|---|---|---|---|
| **I** (start) | **4 m** | 1 (nearest) | Stun 1.5 s | — | — | 0.8 s |
| **II** | **6 m** | 1 | Stun 2 s | **Small monsters stagger 1 s** | — | 0.8 s |
| **III: Twin Toll** (Awakening) | 6 m | **2 at once** | **Knocked back 3 m** | Small monsters stagger 1 s | — | 0.8 s |
| **IV: Thunder Croak** (Mastery) | **9 m** | 2 | **Shattered** (they pop into fireflies) | **Rule monsters stagger 2 s** (never a kill) | **Shattered** | 1.2 s |

**Stagger cap (law, it protects every room):** after any stagger ends, that monster is **immune to stagger for 4.0 s**. This applies to croaks, Chorus, stomps and Signatures alike. No party can stagger-lock a rule monster.

#### 7.4.2 Sustain

- **Starting it:** if Croak is still held at 0.25 s, the pulse becomes a sustained note.
- **Effect:** it counts as "croaking" for rooms, in a field of 0.5 × the pulse radius.
- **Limits:**
  - 4.0 s at most, followed by a 1.0 s breath lockout;
  - you move at 3.0 m/s while sustaining.
- **Pitch** is your seat's pentatonic degree (§5.6). The Croak voice cosmetic changes timbre only.

#### 7.4.3 Revive

- **How:** hold Croak with your SacCenter within **1.5 m** of a Dark frog's egg.

  | Reviver | Time |
  |---|---|
  | Anyone | **2.0 s** (FO §3.7) |
  | Their Knot partner | **1.0 s** |
  | Lifeline III (04) | From 4 m |

- **Two revivers add their progress** together (1.0 s with two).
- **Walking out of range or getting hit** pauses the channel. Progress then decays at 1 s/s, so it is not reset.
- The press still fires a pulse, which is harmless.

#### 7.4.4 Chorus

- **When it fires:** 2 or more frogs pulse within **0.30 s** of each other, within 8 m of each other. A Chorus event fires at their centroid.
- **What uses it:**
  - rooms (`lamp_knight`);
  - the Chorus Boon (2 s stagger, subject to the stagger cap);
  - Frog Choir (3+ frogs, 04);
  - the Duet Duo.
- **A lone pulse where a Chorus was needed** plays the "one sad croak" gag (05 and 09).

#### 7.4.5 Noise

- A pulse is heard by monsters within its radius.
- A sustain is heard continuously at 0.5 × the radius.
- In the Well, a 0.35 s echo plays at −9 dB. It falls silent at the Rim (FO §6.2 #5; 09).

### 7.5 Shove [MUST-A] and Cut [MUST-B]

**Shove** (a belly bump), with numbers from GDD §4.2 as kept by FO §5.4:

| Parameter | Value |
|---|---|
| Windup | 0.20 s: lean back 12° (this is the tell) |
| Reach | 1.4 m, 50° cone |
| Impulse | **6.0 m/s horizontal + 1.5 m/s up**, identical for everyone |
| Hitstop | 60 ms, on both frogs |
| Cooldown | 1.2 s |
| Damage | None |
| Props | An impulse of 150 N·s |
| Monsters | No effect |
| **Rate cap** | One shove per victim per 0.6 s, across all shovers |

- **A shoved frog keeps what it carries**, except inside Heart doors, where it drops it.
- **Mischief shield** (FO §5.2: "mischief costs nobody anything"). Outside Heart doors, a fall, void or water hazard reached **within 2.0 s** of another frog's shove or tug **costs no spot**.
  - You respawn at your last safe ground, and the blame tag still fires in friend and private lobbies (03).
  - Monster hits are not shielded, so the shield can't be farmed as invulnerability.

**Cut** [MUST-B] only exists while you are Knotted. It unlocks at Landing 3 in climb 1 (DECISIONS §8.2 #5).
- **Channel:** press Shove (the shove fires as normal), then **keep holding**. The Cut completes **1.2 s after the press**.
- **The tells run from t = 0:**
  - the Resolve face (§4);
  - the Knot thread flashes crimson;
  - a rising "shhhk" (09).
- **Outcomes:**

  | Outcome | Result |
  |---|---|
  | Released early | Cancelled, no cooldown |
  | **Held on** (§7.3) | Fails. The cutter is stunned 1.0 s, and Cut goes on a 5.0 s cooldown. |
  | Completed | `CutSnap` plays. The consequences are 03's. |

- **Hold on:** when your partner starts a Cut, the prompt `Hold Tongue to hold on` appears. Press and hold Tongue at any range, with no aim needed, until the channel's 1.2 s would have ended.

### 7.6 Power [MUST-A Boons · MUST-B Signatures]

| You hold… | Press | Hold |
|---|---|---|
| No Signature yet | Fires your **active Boon** on press | — |
| A Signature | A release before 0.30 s fires the active Boon | **0.30 s fires the class Signature** (charge ring at the Tag socket) |

Boon effects and cooldowns are 04's; Signature cooldowns are 15–30 s (FO §4.2). Anything a Signature does to another frog obeys §7.11.

### 7.7 Wheel [MUST-A]

- **Tap** (< 0.20 s): a **Look** ping at the aim point. It lasts 6 s and shows your glyph and Seat Hue.
- **Double-tap** (within 0.30 s): a **Danger** ping, drawn as a pulsing "!" with a black-and-white hazard ring. It uses no colour, so it never reads as crimson.
- **Rate cap:** 3 pings per 2 s.
- **Hold** (≥ 0.20 s): an 8-slot radial.
  - Aim with the mouse or right stick; release on a slot to send.
  - Press Tongue while it is open to flip between the Lines and Emotes pages.
- **Default lines** (table keys; 03 owns the wording):
  1. Here!
  2. Go!
  3. Wait!
  4. Help!
  5. Nice!
  6. Sorry!
  7. Watch this!
  8. **Knot?** At the Knot spot from Landing 3 [MUST-B]; elsewhere this slot reads *Thanks!*
- **Knot?** opens a sub-ring of the frogs at this Landing (glyph + name). The frog you pick accepts by choosing Knot? → you within 10 s. Nothing depends on distance (FO §5.2).
- **Emotes page:** 8 equipped emotes (08). There are 4 free defaults (§9 A47).

### 7.8 Follow camera and aim [MUST-A] (09 owns the cinematic cameras)

**Rig:** Cinemachine 3, using CinemachineCamera + OrbitalFollow + RotationComposer + Deoccluder.

| Parameter | Value |
|---|---|
| Distance | 4.5 m |
| Pivot | 1.1 m above the feet |
| Shoulder offset | +0.35 m right. It keeps the tongue ray clear of your own head. |
| FOV | 60 (slider 50–90) |
| Pitch | Default 18° down (matches 07's hatch shot). Range −60° to +75°, so you can always look up at the Mouth. |
| Collision | Sphere r 0.2, 8 m/s return |

**Context offsets:**

| Context | Change |
|---|---|
| Charging | Distance −0.3, FOV −3 |
| Charged leap | FOV +5 punch over 0.3 s |
| Grapple zip | FOV +6 |
| Wall cling | Distance 6.0, pitch +20° (GDD §13.8 climb cam) |
| Swim | Pivot 0.5 |
| Tadpole ghost | Free orbit within the room, 3 m |

**The aim ray** is the camera centre ray. It is used for the Tongue, spit and pings.

### 7.9 Master verb-rank table (the numbers rooms are built against)

| Verb | I (start) | II | III: Awakening | IV: Mastery |
|---|---|---|---|---|
| **Hop** | Tap 1.4 m; charged **1.9 m**; gap 4.5 m | Charged **2.4 m**; gap 5.5 m | **Air Hop**: +1.0 m mid-air, redirect, off falling platforms; reach 3.5 m; gap 7.9 m | Charged **3.0 m**; landing stomp pops mites in 3 m; reach 4.1 m; gap 9.2 m |
| **Tongue** | **3 m**; props ≤ 20 kg, levers, keys; catch; carry | **4.5 m**; **grapple** | **Long Tongue**: **6 m**; 2 targets; snatch and spit back projectiles | **8 m**; chain grapple, no touchdown |
| **Croak** | Pulse **4 m**; rings 1 bell; stuns mites 1.5 s | **6 m**; small monsters stagger 1 s | **Twin Toll**: rings **2 bells** at once; knocks mites back 3 m | **Thunder Croak**, **9 m**: shatters pots and mites; rule monsters stagger 2 s (never a kill) |

**The System line on every rank-up** (a one-line delta plus its cause, FO §4.1). The cause counter is 04's.

| Rank-up | Line |
|---|---|
| Hop II | `[ HOP II ] Leap 2.4 m. Because: you hopped 31 times.` |
| Tongue II | `[ TONGUE II ] 4.5 m. Grapple unlocked. Because: you grabbed 14 things.` |
| Croak II | `[ CROAK II ] 6 m. Small monsters stagger. Because: you croaked 22 times.` |
| Awakenings (III) | `[ TONGUE III: AWAKENING ] Long Tongue.` Full fanfare (§9 A59). |
| Masteries (IV) | `[ CROAK IV: MASTERY ] Thunder Croak.` |

### 7.10 Room lanes derived from these numbers (05 authors; the validator enforces)

**Effective reaches:**
- Hop: reach per §7.2.3.
- Tongue: range + 0.25 m.
- Croak: radius + 0.3 m for a bell.

**The lane rule:** a rank-N lane sits **≥ 0.20 m (gaps ≥ 0.40 m) beyond rank N−1's reach** and **≤ rank N's reach − 0.10 m** (gaps − 0.30 m).

| Lane | Ledge height | Flat gap | Tongue target / anchor | Bell distance |
|---|---|---|---|---|
| Everyone (rank I) | ≤ 1.3 m by tap; 1.6–1.8 by charge | ≤ 3.2 by tap; 3.8–4.2 by charge | ≤ 3.1 m | ≤ 4.2 m |
| **Rank II** | **2.2–2.4 m** (FO's 2.3) | **4.9–5.2** | **3.5–4.6 m** (FO's 4.5 anchor) | **4.5–6.2** (FO's 6 m bell) |
| **Rank III** | 2.7–3.4 | 6.0–7.6 | 5.0–6.1 (snatchable, far key) | Bell *pairs*, each ≤ 6.2 m |
| **Rank IV** | 3.7–4.0 | 8.4–8.9 | Anchor chains ≤ 8 m apart, each 6.5–8.1 m from the frog | 6.5–9.2 m (Thunder only) |

**Reach glints: numbers you can see.** [MUST-A] Each lane object carries `LaneGlint(verb, rank)`.
- When your rank first meets a lane, it shows a 1.0 s sparkle in your Glow colour **the first time it enters your view**, once per lane per climb.
- Lanes you can't use yet stay unmarked. There are no nag icons.

This is the moment the player feels "I can reach that *now*", so growth visibly binds to rooms (FO §3.8 #6; Dr. O's "numbers must bind", RR).

### 7.11 Tongue and mischief fairness caps (LAW) [MUST-A]

This restates FO §5.4 as build rules. **Bots obey every line** (FO §5.4.8).

1. **Tug** (outside Heart doors, on a frog that is not your Knot partner):
   - at most **1.0 m** in total, horizontal, toward you, over 0.2 s;
   - it starts no earlier than **0.25 s** after the lasher's press, so the cheek-puff tell is visible to all;
   - **it is never toward a drop.** The host samples the tug path every 0.1 m, plus 0.3 m past the end. At any sample with no ground within 0.5 m below, or inside a hazard volume, the tug stops 0.3 m short. **Safe water is not a drop**, because falling into it costs nothing (05). That is what keeps the first laugh legal: tonguing Kestrel off his pad (FO §3.5). If less than 0.2 m would remain, the tug cancels into a comic *boing* wobble.
   - At most **one tug per victim per 1.5 s**, across all lashers, so a crowd can't chain a frog 4 m.
   - Never on a clinging, swimming, Down or Dark frog.
2. **Full yank.** Allowed only **inside Heart doors** or on **your Knot partner**.
   - The tongue must stay stuck **0.6 s** with the Resolve tell (crimson tongue tip, lean, cheek puff) before anything moves.
   - The victim **wriggles free by pressing Hop** during those 0.6 s. A partner being rescued simply doesn't.
   - Then the victim is pulled at 8 m/s, up to the tongue's length.
   - **Inside Heart doors ledges are not guarded**, because betrayal is announced there. **A partner yank outside Heart doors keeps the ledge guard**, so it only ever rescues (03).
   - 03 adds the victim's name-tag flash and a rising "hnnk" to the tell.
3. **Catch** applies only to frogs in fall peril or on flagged Trust Fall targets, and only toward the catcher's safe ground. It can't be used to yank someone off a platform they were landing on.
4. **Haul** applies only to a frog clinging or dangling below you (Grip surfaces, the rescue rope). It pulls at 2.0 m/s; their grip does not drain; they can drop with Hop.
5. **Steal** happens **only inside Heart doors**.
   - It takes an item another frog is carrying, after 0.6 s stuck with the Resolve tell.
   - The carrier breaks it by spitting or hopping.
   - Quick Tongue gives a 5 m steal range (04).
   - **Spot orbs always return to their owner**, in every room. **Banked** fireflies, Glow, Boons, Rank, Pearls and cosmetics are untouchable (FO §5.2).
6. **The tongue never deals damage.** Outside Heart doors it never takes anything another frog carries.
7. **Lag compensation.**
   - Tongue hits are resolved on the host, with targets rewound by the lasher's RTT/2, capped at **150 ms**.
   - When two frogs grab the same thing, the **earliest input timestamp wins**.
   - **The host's own inputs are delayed by the median client one-way latency** (FO §5.4.6).
   - Betrayal outcomes are server-authoritative from day 1 (FO §5.4.7).
8. **Signatures, Duos and Boons** that touch a frog use caps 1–6 unchanged. Frog Sling's 12 m launch works only on a Knot partner, is ledge-guarded outside Heart doors, and can be cancelled by the partner holding on. Its input and timing are 04's.
9. **The M0 fallback switch** `verbs.json: tongueOnFrogs = false`. It is used if the proof of concept finds tongue-on-player unfair at 150 ms RTT with 2% loss (DECISIONS §7 M0).
   - The tongue then ignores frogs, **except catch and haul**, which only save.
   - Shove becomes the only frog-on-frog mischief.
   - Frog Sling becomes a shove-launch of your partner (04).
   - If catch itself fails the proof of concept, it becomes a 1.5 m "belly catch": stand under the falling frog.

---

## 8. Health: spots, down, Dark, revive, falls, respawn [MUST-A]

### 8.1 Summary

| Difficulty | Spots | Team Lives (04; DECISIONS §4) |
|---|---|---|
| Easy | **4** | unlimited. The climb ends only if every human is Dark at once. |
| Normal | 3 | 3 |
| Hard | 3 | 2 |
| Hell | 3 | 1 |

**Every damaging event costs exactly 1 spot:** a monster hit, a room hazard, a fall of 6 m or more, or the void. Nothing costs 2 (FO §7 "hits and falls cost 1 spot"). **Spots never regenerate on their own.**

### 8.2 Getting hit

1. **The spot pops out.** Visual hitstop is **80 ms** and the frog plays Dazed for 0.6 s: movement ×0.5, no verbs.
2. **Knockback:** 3.5 m/s away from the source + 2 m/s up. Falls get no knockback.
3. **Invulnerability for 1.0 s.** Only the emission blinks, at 10 Hz. The silhouette never flickers.
4. **The spot orb:**
   - r 0.06, spot gold;
   - launched **4 m/s up + 2.5 m/s outward**, away from the source, with ±30° seeded jitter;
   - bounces once, then hovers 0.3 m up, bobbing ±0.05 m at 1 Hz;
   - lives **3.0 s** and blinks faster in its last 1.0 s (FO §3.7);
   - over a hazard, it spawns at your last safe ground instead, so it stays catchable.
5. **Catching the orb.** Anyone who tongues it, or the owner touching it, sends it home at 12 m/s. It relights the socket and triggers Joy on both frogs. A Rival shouts "Got it!" (03).
6. **Spills of unbanked fireflies** follow 04's rule (20%, returned to the owner outside Heart doors). Last Gulp (04) can take fireflies in place of your last spot.

### 8.3 Down: the last-spot save

- **When your last spot is knocked out, you go Down for 3.0 s.**
  - You lie flat, can't act (Wheel pings still work) and are immune to further hits.
  - Your orb hovers beside you.
- **Prompts:**

  | Who | Sees |
  |---|---|
  | Everyone else | A world prompt `Catch it!` over the orb |
  | You | `[ LAST SPOT ] 3…2…1` |

- **Caught in time:** you **pop back up with 1 spot** and 2.0 s of invulnerability. This is the clutch save, the best clip the body makes (DECISIONS §2).
- **Not caught:** you go **Dark**.
- **For room failure, Down is not Dark** (FO §3.7).

### 8.4 Dark → tadpole ghost → croak revive

- **The body curls into a glowing egg** (0.25 m, in your Seat Hue, pulsing at 0.5 Hz; 09) over 0.5 s, where you fell (or at your last safe ground, if over a hazard). A **tadpole ghost** pops out (FO §3.7).
- **The ghost** is 0.35 m long, in your Seat Hue at 50% alpha, with a glowing head.

  | Can | Can't |
  |---|---|
  | Swim freely in 3D at 3.0 m/s inside the room | Pass through walls (it passes through props and frogs) |
  | Nudge one prop ≤ 5 kg every 10 s (Tongue; a 2 m/s push). Keys, eggs, bells and vote items are excluded (03 G7). | Be targeted by monsters |
  | Ping and use the Wheel | Gulp, carry, shove or croak |
  | **Share the clear bonus** (FO §4.1) | — |

- **Revive:** hold Croak over the egg (§7.4.3). You re-hatch **at the egg with 1 spot** and 2.0 s of invulnerability.
- **Your orbiting fireflies** circle your egg at 20% brightness. Your Knot partner sees the egg through walls (03).

### 8.5 Automatic recoveries

| When | What happens |
|---|---|
| **Door clear** | Down frogs stand with 1 spot. **Dark frogs re-hatch at the exit with 1 spot.** A human never sits out more than one door as a ghost. |
| **Room failure** (timer, or all inside Dark) | The Tower spits the party through the next door. Dark frogs re-hatch there with 1 spot. The room pays 50%, gives no Boon and costs 1 Team Life. **E doors never cost lives** (FO §3.7; 04). |
| **Landing** | Everyone is revived and every spot restored, free (FO §3.7) |
| Stall heal (04) | +1 spot |

### 8.6 Falls, hazards and respawn

- **Fall height** = your highest point since the last *support*, minus your landing height. Supports are ground, wall latch, grapple, catch, Air Hop and glide.

  | Fall | Result |
  |---|---|
  | ≥ 3 m | Splat, no damage |
  | **≥ 6 m** | Splat and **−1 spot** |
  | Into water, while gliding, or when caught | **Never damages** |

- **Void, kill volumes and hazard water** (room-flagged): −1 spot. The screen fades over 0.5 s and you reappear at your **last safe ground** after **1.5 s**, with 1.0 s of invulnerability.
- **How "last safe ground" is sampled:**
  - every 0.25 s while you are grounded on a static, non-hazard surface;
  - with ≥ 0.6 m clearance to the nearest drop edge, and outside monster danger volumes;
  - kept in a ring buffer of 8, and the newest valid sample is used.

  Rooms can override it with `RespawnAnchor`s, such as the Grip Wall's base ledges (05).
- **If the void took your last spot,** you reappear **Down** at the respawn point, with your orb beside you.
- **Protections:** the mischief shield (§7.5) and Unstuck (§6).
- **Seats.** A human who leaves hands their seat, spots and body to a Rival at once (FO §3.6). A drop-in joins at the next door (04).
- **Swallowed** (room-specific, 05):
  1. counts as a hit: −1 spot;
  2. you are hidden for 1.0–2.0 s;
  3. you are spat out 4 m at 6 m/s.

  The Horned Frog class escapes one swallow per door at no cost (04).

---

## 9. Animation: 100% procedural [MUST-A unless tagged]

### 9.1 No clips on the hero, and where CC0 clips *do* go

- **The frog, the Rivals and the tadpole ghost use zero keyframed or retargeted clips** (DECISIONS §2; FO §2.3).
  - Humanoid retargeting onto stubby bodies "looks off" (UT).
  - Code motion is diffable, testable and screenshot-checkable by agents.
- **Quaternius UAL and KayKit CC0 clips** (UT) are used only as **timing references** while tuning (for example the anticipation-to-launch ratio) and **for humanoid monsters**. The `lamp_knight` is a candidate. That is 09 and 05's call, and each needs a `licenses.csv` row.

### 9.2 The procedural stack (per frog, in `LateUpdate` order)

| # | Layer | What it does | Key numbers |
|---|---|---|---|
| 1 | `HeroMotor` output | Root position and yaw. Remote frogs are interpolated (10). | — |
| 2 | `LocomotionPose` | A state machine producing pose parameters: crouch, lean, pitch, arm swing, leg phase, wall/swim/glide blend | 0.10 s blends |
| 3 | `FrogLegIK` | Hand-written **analytic 2-bone IK** (thigh–shin; the foot is aligned to the ground normal, max 30°). Pole: knee 35° outward, 20° forward. Foot plant ray 0.5 m. | Re-plant when foot error > 0.12 m. Plant for 60% of the step cycle. |
| 4 | `ArmIK` | 2-bone IK for the scramble grip, wall cling, door push and ping point | — |
| 5 | `SquashStretch` | **PrimeTween** on `SquashPivot` at the feet. Volume-preserving: s_y = k, s_xz = 1/√k. Never touches Root or the collider. | Values in §9.3 |
| 6 | `SpringBones` | Damped springs (semi-implicit Euler, dt clamped to 1/30) | Values in §9.4 |
| 7 | `FaceRig` | Lids, 7 blend shapes, look-at, `ExpressionMixer` | §4 |
| 8 | `TongueTube` | A generated **Catmull-Rom tube**, rebuilt only while the tongue is out | §9.5 |
| 9 | `RagdollLayer` | **Local cosmetic only, never networked.** Arms and legs blend to physics (6 capsules + CharacterJoints) while the motor keeps driving Root. | Triggers: knockback ≥ 6 m/s, Down, the Dark collapse, freefall > 0.8 s. Blend in over 0.1 s, out over 0.25 s. |
| 10 | `GlowRig` | Shader properties, the firefly ring, the Crown, the point light | §5.2 |

**Budget:** ≤ **0.08 ms CPU per frog** on the dev PC (8 frogs ≤ 0.64 ms), inside the host's 8 ms (DECISIONS §12). Measured in the 7-bot soak.

### 9.3 Squash and stretch values

| Event | k (s_y) | Time | Ease |
|---|---|---|---|
| Tap hop anticipation (visual only; the launch is instant) | 0.85 | 0.04 s | OutQuad |
| Charge crouch | 1.0 → **0.70** at full charge | 0.45 s | OutCubic; 14 Hz vibration of 0.004 m at full |
| Launch stretch: tap / charged | 1.20 / **1.30** | 0.10 / 0.12 s | OutQuad, then back to 1.0 by the apex |
| Land: tap / charged / splat | 0.80 / 0.70 / **0.60** | 0.06 / 0.08 / 0.08 s | Then a spring back to 1.0 with a 1.06 overshoot over 0.18 s |
| Hop-waddle step | ±0.06 | Per step | Sine |
| Croak pulse | Sac r ×1.8 (from 0.10 to 0.18); body k 1.03 | 0.12 s in, 0.20 s out | OutBack |
| Shove | k 0.90 in the windup; Z-stretch 1.15 on the thrust | 0.20 / 0.08 s | — |
| Catch (the catcher braces) | 0.85 | 0.10 s | — |
| Re-hatch pop | 0.60 → 1.25 → 1.0 | 0.30 s | OutElastic |

### 9.4 Spring bones

| Spring | Frequency | Damping ratio | Limit |
|---|---|---|---|
| Throat sac | 6 Hz | 0.35 | 20% stretch |
| Eyes (in their domes) | 9 Hz | 0.45 | 0.02 m |
| Hat (`HatSpring`) | 4 Hz | 0.30 | 20° |
| Belly jiggle (`BellyBreath` weight) | 5 Hz | 0.40 | ±0.15 weight |
| Glider membrane edges [MUST-B] | 3 Hz | 0.25 | 15° |
| Crown ring tilt [MUST-B] | 2 Hz | 0.50 | 10° |

### 9.5 Tongue tube

| Parameter | Value |
|---|---|
| Curve | Catmull-Rom from TongueOrigin, through 2 interior points, to the tip |
| Sag when slack | 5% of the length at the midpoint |
| Samples | 12 along × 8 around, so 96 vertices. Rebuilt by an `IJob` while out. |
| Radius | 0.035 at the root, tapering to 0.025 |
| Tip | A sticky sphere, r 0.05 |
| Extend | **40 m/s**, overshooting 8% past the target, then springing back over 0.06 s |
| Travel wobble | Lateral 0.03 m, decaying over 0.15 s |
| Retract | 45 m/s |
| Homing | The tip homes on the soft-locked target, so the curve bends toward moving targets |

**Networking:** only phase, target and tip travel over the network (§3.6).

### 9.6 The full animation list

Timings are greybox targets. "Layers" refers to the numbered rows in §9.2.

**Locomotion and traversal**

| ID | Animation | Timing and shape | Layers | Tier |
|---|---|---|---|---|
| A1 | Idle breathe | Sac ±6% and belly ±2% at 0.5 Hz; weight shift of hips ±3° every 4–7 s | 2, 6 | A |
| A2 | Idle fidgets (≥ 10 s without input) | One every 10–15 s: sit back and look up at the Mouth (open sky only); wipe an eye with a hand (1.2 s); yawn into a sac balloon (1.5 s) | 2, 4, 7 | A |
| A3 | Hop-waddle | Step rate = 1.6 + 0.24·v Hz (2.8 Hz at 5 m/s); bob 0.05·(v/5) m; pitch forward 8°·(v/5); arms swing ±20°; alternating foot plants | 2, 3, 5 | A |
| A4 | Start / stop | 0.08 s lean-in; a 0.12 s skid with toe dust above 3.5 m/s | 2, 3 | A |
| A5 | Turn on the spot | Shuffle re-plants | 3 | A |
| A6 | Tap hop | 0.04 s anticipation → 0.10 s stretch with legs straight → air tuck from 0.12 s → reach for the ground 0.12 s before predicted contact → land squash + dust | 3, 5 | A |
| A7 | Charge | Crouch over 0.45 s; legs fold tight; hands plant; Focus face; rising "boing"; full-charge flash (0.1 s) | 2, 3, 5, 7 | A |
| A8 | **Charged leap** (the hero pose) | 0.12 s stretch; **legs trail fully extended for 0.25 s** and arms reach forward; then tuck | 3, 5 | A |
| A9 | Air Hop | A 360° forward flip on `FlipPivot` over 0.35 s + a light puff (III) | 2, 10 | A |
| A10 | Freefall flail | vy < −6 m/s for 0.3 s: arms windmill at 3 Hz, legs kick, eyes wide. After 0.8 s, a ragdoll starfish. | 2, 9 | A |
| A11 | Splat | k 0.60, eyes pop 1.2×, 0.25 s recovery | 5, 7 | A |
| A12 | Scramble | 0.20 s: hand IK on the lip, 2 leg kicks, pull up | 3, 4 | A |
| A13 | Wall cling / climb | Body 0.10 m off the wall; 4-limb IK on the surface; climb cycle 2.0 Hz; below 25% grip, a 7 Hz tremble; 0.5 s slip at 0 | 3, 4 | B |
| A14 | Wall hop | 0.10 s push-off | 3, 5 | B |
| A15 | Swim | Breaststroke kick 1.4 Hz; pitch 70°; eyes at the waterline; water-hop pop | 2, 3 | A |
| A16 | **Glide** | Membranes spread over 0.12 s; starfish pose; roll ±15° into turns; edge flutter 2 Hz | 2, 6 | B |
| A17 | Riding a raft or platform | Counter-lean ±10° against the platform tilt | 2 | A |
| A18 | Grapple zip | Body stretched toward the anchor (k 1.15 along the travel axis), legs trailing, an arrival pop | 2, 5 | A |
| A19 | Chain grapple | 20° swing roll between anchors | 2 | B |
| A20 | Being carried or hauled | Dangle; limp limb springs | 6, 9 | A |
| A21 | Stack standing (Frog Stack, Leapfrog) | Feet IK onto the head below; tower wobble through the springs | 3, 6 | A |

**Tongue**

| ID | Animation | Timing and shape | Layers | Tier |
|---|---|---|---|---|
| A22 | Lash windup | `CheekPuff` 0 → 1 over 0.10 s; jaw open 0.06 s; head leans 5° toward the target | 7 | A |
| A23 | Extend / stick / retract | §9.5. On stick, a 0.05 s tip squash ("thwap"). | 8 | A |
| A24 | Miss | 0.08 s limp slap, retract, a blink | 7, 8 | A |
| A25 | Carry | Item at TongueOrigin + 0.15 m; `CheekPuff` 0.5; head tilted back 8°. Heavy items: lean back 10°, slower step. | 2, 7 | A |
| A26 | Spit | 0.08 s head snap, cheeks blow, "ptoo" | 5, 7 | A |
| A27 | Gulp | 0.15 s tongue; **eyes retract 0.03 m for 0.15 s** (the real frog swallow); belly glow pulse 0.2 s | 7, 10 | A |
| A28 | Catch (both frogs) | Catcher braces (k 0.85); the caught frog is reeled in and set down; 120 ms hitstop; both Joy | 5, 7, 8 | A |
| A29 | Tug / get tugged | The victim stumbles 0.2 s toward the lasher | 2 | A |
| A30 | Yank / get yanked | 0.6 s Resolve windup; the victim flails at 8 m/s | 2, 7, 9 | B |
| A31 | Hold on | Tongue wraps the Knot thread (0.1 s); both lean away; tug-of-war tremble | 7, 8 | B |
| A32 | Lever pull | The tongue wraps; the frog leans back 0.3 s | 2, 8 | A |
| A33 | Two-target carry (III) | The tongue curls to snag a second item; the two stack at the mouth | 8 | A |

**Croak**

| ID | Animation | Timing and shape | Layers | Tier |
|---|---|---|---|---|
| A34 | Pulse | Sac inflates 0.12 s with a 1.1 overshoot; the body lifts 0.03 m; a 0.1 s squint; ring VFX | 5, 6, 10 | A |
| A35 | Sustain | Sac held at 0.17 m with a 5 Hz vibrato (±4%); **mouth closed**; blissful half-lids | 6, 7 | A |
| A36 | Revive channel | Sac pulses at 2 Hz; head bowed to the egg; the egg brightens over the channel | 2, 6 | A |
| A37 | Chorus | Every participant's sac flashes together; one shared ring at the centroid | 10 | A |
| A38 | Twin Toll (III) | A double ring, 0.08 s apart | 10 | A |
| A39 | Thunder Croak (IV) | Sac r 0.24; crackle mask; 90 ms hitstop; camera impulse 0.12 within 9 m | 5, 10 | B |
| A40 | Mouth-full croak | A muffled "mmph" puff (then the spit) | 7 | A |

**Shove and social**

| ID | Animation | Timing and shape | Layers | Tier |
|---|---|---|---|---|
| A41 | Shove (belly bump) | 0.20 s windup, lean back 12° → 0.08 s thrust, lean forward 18° → 60 ms hitstop → 0.25 s recovery | 2, 5 | A |
| A42 | Get shoved | 0.3 s stumble with windmilling arms; Anger 2 s | 2, 9 | A |
| A43 | **Cut channel** | 1.2 s: Resolve face, crimson tongue tip, cheeks puff, lean 12° away from the partner, the thread flashing crimson; at 1.2 s, `CutSnap` with a thread-whip VFX | 2, 7, 10 | B |
| A44 | Knot tie | Face each other; tongue tips touch (0.4 s); thread spirals (0.6 s); both hop once | 2, 8 | B |
| A45 | Ping point | Additive arm point, 0.4 s | 4 | A |
| A46 | Two-Frog Door push | Hand IK flat on the door; legs dig in; strain tremble | 3, 4 | A |
| A47 | **Free emotes** (Wheel) | **Wave** (1.0 s); **Belly Drum** (1.2 s, drummed on the belly); **Raspberry** (the tongue flaps, 0.8 s); **Flop** (sit and flop, 1.0 s) | 2, 4, 8 | A |

**Health**

| ID | Animation | Timing and shape | Layers | Tier |
|---|---|---|---|---|
| A48 | Hit | 80 ms hitstop; knockback; Dazed face; the spot pops from its socket with a "pip" spring and the socket flashes | 5, 7, 10 | A |
| A49 | **Down** | Collapse onto the belly (0.25 s); spiral pupils; glow flickers at 6 Hz; limb twitch at 2 Hz. When caught: pop up in 0.3 s with Joy. | 2, 7, 9 | A |
| A50 | Go Dark | Glow fades over 0.4 s; the body curls into the egg (0.5 s, a visual morph); the ghost pops out (0.3 s) | 5, 9, 10 | A |
| A51 | Tadpole ghost | Tail wiggle at 3 Hz; drifting bob; 50% alpha in the Seat Hue | — | A |
| A52 | Re-hatch | Egg wobble 0.3 s → crack 0.2 s → froglet pop (0.30 s, §9.3) → glow relights; 2.0 s invulnerability blink | 5, 10 | A |
| A53 | Void respawn | A firefly swirl blinks you in over 0.4 s | 10 | A |
| A54 | Swallowed / spat | Hidden; the spit launch is slimy, with a splat and 1 s of drip particles | 5, 9 | A |
| A55 | **HoldBreath** (freeze cue) | The statue pose (§4): cheeks puffed, eyes wide, trembling. A room-freeze gag. | 7 | A |

**Growth and ceremony**

| ID | Animation | Timing and shape | Layers | Tier |
|---|---|---|---|---|
| A56 | Bank (door clear) | Unbanked fireflies stream from the cheeks into the belly over 0.6 s, the count-up rising in pitch | 10 | A |
| A57 | Level up | A 0.5 s ring pulse; a new firefly swoops into orbit (0.4 s); the System line | 10 | A |
| A58 | Boon bead | The bead pops onto the Neck socket (0.25 s, elastic) | 10 | A |
| A59 | **Awakening** (1.8 s; **no input lock**) | 0.00: System window + chord. 0.00–0.30: glow flare (E ×2) and fireflies spiral in. 0.20–0.45: the part pops onto its socket. 0.45–1.20: a spin-hop celebration, cancelled by any input. 1.20–1.80: settle. Bots gasp within 1.0 s (03). | 2, 5, 10 | A (IV: B) |
| A60 | Crown glow ignition | Over 1.2 s, the 12 fireflies rise into the halo | 10 | B |
| A61 | Class reveal | Markings sweep-light head to toe over 0.8 s; a banner (04) | 10 | B |
| A62 | **Hatch** (door 0) | 3.0 s: egg wobble ×3 at ±8° (0–1.0) → crack lines glow (1.0–1.6) → tadpole wriggles out (1.6–2.4) → pops into a froglet (2.4–3.0) + `[ HATCHED ]`. Control at 3.0 s (FO §6.1). | 5, 10 | A |
| A63 | Look up at the Mouth | Head pitch +40°, eyes +20°. Used at Landings and in the Keeper pull-back (01, 07). | 7 | A |
| A64 | Results pose | 2 victory hops, then a pose picked by outcome | 2, 5 | A |
| A65 | **Glider molt** | 1.5 s skin-shed shimmer; membranes grow from 0 to 1 (DECISIONS §4 "re-hatch at Lv1 with a molt") | 5, 10 | B |
| A66 | Moon Toad helmet molt | The same, with the helmet | 10 | LATER |

---

## 10. Juice per verb [MUST-A] (the ~200-line in-house feedback system on PrimeTween + Cinemachine Impulse; UT)

**Hitstop is local and visual.** It freezes the pose layers (§9.2 rows 2–8) and the VFX of the frogs involved for N ms, while the simulation keeps running. There is **never a global `timeScale` change** in multiplayer.

| Event | Hitstop | Camera impulse | Particles (Shuriken) | Sound cue (09 designs it) |
|---|---|---|---|---|
| Tap land / charged land | — / 40 ms | — / 0.04 | Dust 6 / 12 | `hop_land` / `leap_land` |
| Full-charge ready | — | — | A ring flash | `charge_ready` (rising) |
| Tongue stick: prop / frog | 50 / 60 ms | — | Sticky splat, 4 | `tongue_thwap` |
| Gulp | — | — | Belly sparkle | `gulp` (pitch rises with the count) |
| **Catch** (spot or frog) | **120 ms** | 0.05 | A 12-firefly burst | `catch_chime` |
| Croak pulse / Thunder | — / 90 ms | — / 0.12 | Ring / ring + crackle | `croak_{seatDegree}` / `thunder` |
| Shove | 60 ms, on both | 0.03 | Puff, 6 | `bump` |
| Hit (spot lost) | 80 ms | 0.08 | Spot orb + 8 sparks | `spot_pop` |
| Level up | — | — | Ring + firefly swoop | Count-up at rising pitch |
| Awakening | — | 0.06 | Spiral of 40 fireflies | Chord |
| Cut completes | 100 ms | 0.10 | Thread whip, crimson | `snap` |

**Shake budget:** amplitude ≤ 0.15 (GDD §13.8); none in reduced motion.

---

## 11. Tests and validators owned here

EditMode tests run in CI; the PlayMode tests produce PNG sheets for agents and humans.

| ID | Test | Fails the build when | Tier |
|---|---|---|---|
| T1 | `HopKinematicsTest` | Any apex, gap or reach in §7.2.3, recomputed from `motor.json`, is off by more than 0.02 m | A |
| T2 | `LaneValidator` (with 05) | Any RoomDef lane tagged (verb, rank) is reachable at rank − 1, or unreachable at its rank, by the §7.10 margins. Heights and distances are read from baked shells. | A |
| T3 | `HitboxInvarianceTest` (PlayMode) | For Glow 1–10 × every class × every molt × every cosmetic, the collider radius, height, centre and mass are not identical | A |
| T4 | `SeatHueTest` | There are not exactly 8 hues, 8 unique glyphs, or every hue ≥ 15° from crimson `#FF3D6E`, or `SeatHue` is written from any cosmetic code path (a reflection scan) | A |
| T5 | `CosmeticGuardTest` (with 08) | A cosmetic hue lies within 15° of crimson; a Glow colour has relative luminance < 0.6; a cosmetic touches the spot, rim or glow properties; a cosmetic adds a collider | A |
| T6 | `HatOcclusionTest` | A hat exceeds the §3.3 envelope, or occludes more than 10% of any spot disc's pixels from 16 gameplay-camera poses (4.5 m, pitch −15° to +30°, every 45° of yaw behind the frog), or more than 30% of a pupil from the front | A |
| T7 | `ReadabilitySheet` (PlayMode screenshot) | It renders 8 frogs at **25 m** in the `bell_golem` lighting and in a warm Landing, with every mix of spots 0–3 and tiers. It **fails** if lit-spot vs back-skin contrast < 3:1, or if a lit spot is under 4 px across. It saves the PNG for Gate A prep. | A |
| T8 | `TongueCapTest` (PlayMode, bots) | Across 500 seeded tugs near ledges, a victim moves more than 1.0 m, or toward a drop, outside Heart doors; or any tug or yank acts before its 0.25 / 0.6 s tell | A |
| T9 | `StaggerCapTest` | A monster is staggered again within 4.0 s of a stagger ending | A |
| T10 | `BodyContractTest` | `CapsuleHeroBody`, `FrogHeroBody` or `WickHeroBody` lacks a socket or throws on any `IHeroBody` call with edge values | A |
| T11 | `AnimBudgetTest` (soak) | The procedural stack takes more than 0.08 ms per frog (median of the 7-bot soak) | A |
| T12 | `NoClipsTest` | Any `AnimationClip` or `Animator` is referenced under `Assets/Game/Hero` or by the frog prefab | A |

---

## 12. Gates A and B, and the remediation pass

They run on the **Milestone A build**, with **the user plus at least 4 friends** as the first human testers (DECISIONS §2).
- **Before Gate A passes, nothing frog-only is locked:** no capsule, trailer, Warden art, Steam page or store copy.
- All frog art is written against the `IHeroBody` sockets (DECISIONS §9).

### Gate A: readability (FO §2.3)

**Setup:**
- The `GateA` scene: 8 frogs at **25 m**, on the real follow camera at 1080p.
- Two lighting sets: dark `bell_golem` and a warm Landing.
- 20 randomised slides per tester (spots 0–3 × tier). Each slide is shown for 3 s. The Wick is shown in the same slides.

**Pass**, all of these:

| Check | Threshold |
|---|---|
| HP read within ±1 spot | ≥ 90% of reads |
| Tier (dim / glowing / haloed) named correctly | ≥ 85% |
| Frog vs Wick | Both scores within 10% of the Wick's |
| Pepe association | None among 5 cold viewers |

**If it fails, run one remediation pass** (DECISIONS §2), then re-test Gate A with the same protocol:

| Lever | From | To |
|---|---|---|
| Bigger spots | r 0.075, ring 0.015, emission 4.0 | r **0.095**, ring 0.020, emission **6.0** (7.1 px at 25 m) |
| Stronger rim contrast | intensity 1.2, N·V 0.35, outline 2.0 px | intensity **1.8**, N·V **0.45**, outline **3.0 px** |
| A more upright pose | — | Spine 4° more upright; legs folded 15% tighter; eye domes +0.02 m; body depth −0.03 m (hitbox unchanged) |

**If the re-test fails, the Wick ships** (§13), as one new `IHeroBody` and not a rewrite.

### Gate B: the same loop, Frog vs Wick-Flame (FO §2.3)

- **Setup:** the identical Quick Climb greybox (doors 0–10), played by each tester twice. Half the testers play the Frog first.
- **Measures:**
  - "name a power you gained": the count of correct distinct powers, unaided;
  - "Worth it?" (Yes / Meh / No).
- **Pick** the hero that is better on both.

### Automated pre-gates (agents, before any human sees it)

T7 (readability sheet) and T3 (hitbox invariance) must be green.

---

## 13. The Wick fallback: the same interface, mapped [MUST-A test-grade for Gate B · ships only if the gates fail]

`WickHeroBody : IHeroBody` (DECISIONS §2; FO §2.3).
- **Same hitbox, sockets, verbs, numbers and rules.** Only presentation changes.
- **The candle never shrinks.** Its growth is a Flame axis, and health is 3 spots, as with the frog.
- **Test-grade cost:** one lathe mesh plus a flame billboard shader. It reuses `TongueTube`, the croak ring and the firefly ring renderer.

| `IHeroBody` member / readout | Firefly Frog | Wick with a Flame axis |
|---|---|---|
| Body | Bean frog, 0.95 m | Candle body with nub hands, 0.95 m to the flame tip, the same capsule |
| `SetSpots` | 3 back discs | 3 glowing beads set in the back of the candle, same positions and knock-out order |
| `SetGlow`: power axis | Belly glow, orbiting fireflies, markings, light radius | **Flame height** (0.10 → 0.28 m) and brightness, orbiting **flame motes**, glowing veins; the same light radius formula |
| Crown glow | Firefly halo | Mote halo |
| `PlayAwakening`: Hop / Tongue / Croak | Spring heels / glowing tongue tip / bigger sac | Brass coil feet / glowing lasso tip / flare corona |
| `TongueOrigin`: Tongue | Mouth; tongue tube | Right nub hand; a **thread lasso** ("wax-thread lasso", DECISIONS §2) using the same tube code |
| `CroakFX`: Croak | Sac pulse ring | **Flare pulse** ring |
| Hat socket | Head, between the domes | A collar ring at the flame base. Hats flagged `wickSafe` get a flame hole (08). |
| Expressions (§4) | Eyes, sac, posture | Flame-face eyes, flame shape and lean (GDD §4.5 emotion table, without its reputation row); **Resolve** is a crimson-tipped fork leaning at the target |
| Down / Dark / ghost / egg | Belly-flop / egg / tadpole | Tipped over / a sealed candle stub / a wisp |
| Glider molt | Membranes | Paper-lantern wings |
| Seat Hue | Rim light | Rim light (identical) |

**If the Wick ships,** the frog survives in three places (DECISIONS §2):
- the Revelation silhouette;
- the hub statue;
- the Candle-Toad cosmetic line.

---

## 14. Build order (ties into DECISIONS §7)

| When | Deliverable |
|---|---|
| **M0 weeks 1–2** | `IHeroBody`; **`CapsuleHeroBody`** with every readout; `HeroMotor` with the §7 numbers; `FrogInput` for bots; the tongue on props and on players in the netcode proof of concept (150 ms, 2% loss); T1, T4, T8, T10, T12 green |
| **Week 3: style-lock** | `build_frog.py` + the rig + `ToonHero.hlsl` + the spot and glow material; `FrogHeroBody` with layers 1–7 and 10; T3, T6, T7 green; `bell_golem` screenshots signed off |
| **Weeks 4–5** | Tongue tube, ragdoll layer, the full A1–A64 list at the MUST-A tier, juice (§10), reach glints, arc previews |
| **Milestone A** | Ranks I–III, Glow 1–7, spots/Down/Dark/revive; test-grade `WickHeroBody`; **Gates A and B with humans** |
| **Milestone B** | Rank IV, Glow 8–10, Crown, Cut and hold-on, Grip surfaces, the Glider molt and Glide (the Rim), class markings, Knot thread |
| LATER | Moon Toad helmet, Drift and Light-Lag motor profiles, the Beyond molt |

**The frog's extra tech-art cost** (FO's +1.5–2 weeks) is an unmeasured estimate. **Measure it against the capsule in week 3** (plan_2).

---

## 15. Open questions

1. **Re-hatch at door clear (§8.5) is my addition.** FO only restores at Landings.
   - Without it, a human who goes Dark early on floor 1 would spend up to 4 doors as a ghost, which is dead time in a party game.
   - It keeps Normal cheap. Hell's brutality stays in its 1 Team Life, redaction and shorter tells.
   - If the owners of 04 want more bite on Hell, the smallest change is "Hell: Dark frogs re-hatch only at Landings."
2. **Down (§8.3) adds a 3 s last-spot window before Dark.** It uses no new player-facing noun, only the prompt "Catch it!". It is the cheapest way to make FO's "catch the knocked-out spot" matter at the most dramatic moment. If it tests as confusing, fall back to FO's instant Dark.
3. **The task brief asked for "CC0 clips".** DECISIONS §2 forbids retargeted humanoid clips on the hero, so the list is 100% procedural and CC0 clips are limited to timing references and humanoid monsters (§9.1).
4. **The hop rule, "move to hop, stand to leap" (§7.2.2),** is my resolution of FO's "tap for a hop; hold to charge". It removes tap latency while moving. The cost is that you can't charge on the run. A/B it in the greybox against "all hops fire on release", measuring feel and missed-jump telemetry.
5. **Gate A at 25 m is tight:** 5.6 px spots, 7.1 px after remediation. If remediation still fails, a cheaper step than the Wick exists: mirroring the spots as 3 pips on each frog's name tag beyond 15 m. It is not in DECISIONS' remediation list, so it would need the chair's sign-off before it could stand in for the Wick flip.
6. **Gate B tie-break.** If the heroes split across the two measures, I propose that **the Frog stays**, because the user's own image outranks a split result (DECISIONS authority order 1). The chair should confirm.
7. **Glide leaves gravity alone** (§7.2.8), which contradicts WORLD's UPDRAFT ×0.55, so Well rooms re-dressed as Sky Preview keep valid hop lanes. 01 and 06 should confirm that the Sky gates on gap width, not height.

8. **09's "Growth by level" table disagrees with this file**, although 04 §2.3 matches it. 09 names 02 as the owner of the Glow rules, so I recommend 09 adopts §5.2 and §5.4. The differences:

   | Item | 09 | This file |
   |---|---|---|
   | Belly emission | 0.6 → 3.4 | 0.35 → 3.00 |
   | Light range | 2.0 → 4.25 m | 2 → 6 m |
   | Orbit radius base | 0.45 m | 0.55 m |
   | Markings | 10 segments | 4 groups |
   | Boon readout | Boon marks on the cheeks, shoulders and forehead | Neck beads, which 04 §6.6 also uses |
   | Crown | Orbiters collapse into the Crown | The 9 orbiters **stay** and 12 Crown fireflies are added |

   Keeping the orbiters matters. If they collapse into the Crown, the lit silhouette narrows at the very moment it should peak (H4).
