# 05 · ROOMS: THE WELL SLICE

**KNOTWELL** · "Climb together. Fall alone." · Version 1.0 · 2026-09-29 · **Status: BINDING for room builds.**

**Authority.** The user's words, then `DECISIONS.md` (**D**), then `FUN_OVERHAUL.md` (**FO**, as amended by D §8.2), then the tech report (**UT**). The GDD, WORLD and CRIT are a parts bin. Where this file quotes a number owned elsewhere, the owner wins and this file is corrected:

| Topic | Owner |
|---|---|
| Verb-rank numbers (hop heights, tongue lengths, croak radii), spots, catch, revive | `02_HERO_AND_CONTROLS.md` |
| Rival roster, Drama Director limits, Doppelfrog role and vote rules, Betrayal Cam, Vengeance | `03_SOCIAL_AND_BOTS.md` |
| Firefly yields, Glow table, Boons, Wish Coin and jar amounts, Bestiary system, Team Lives | `04_PROGRESSION_ECONOMY.md` |
| Hub, `hatch_pond` shot list, Landings, `meeting_room` layout, the 4 toys' rules and scoring, `rim_surface` | `07_HUB_AND_MINIGAMES.md` |
| Final palettes, shader, VFX, UI art, audio mix | `09_ART_UI_AUDIO.md` |
| Room-cell grid, baking, netcode plumbing, assemblies, perf budget | `10_UNITY_TECH.md` |

**What this file owns:** the RoomDef contract and kit, door grammar and plaques, generator rules, the authored first climb door by door, the full spec of every MUST room, the Rematch overlay, and the per-room Definition of Done.

**Tags.** [MUST-A] Quick Climb and free demo · [MUST-B] Full Climb, ★1 and climb 2 · [SHOULD] · [LATER]. **GB** marks a greybox hypothesis: tune it in playtest, never cite it as fact.

**The taste of Layer 2.** The slice's Sky is the walkable Rim after ★1 (`rim_surface`, card in §6.1; choreography in `01_WORLD.md`). Sky Preview (doors 21–25 under Glide) is [SHOULD] and specified in `06_ROOMS_LATER.md`.

---

## 0. How to read a room spec

**Coordinates.** Every room uses its own local frame, in metres:
- origin at floor level in the room's centre;
- **+z runs from the entry door (−z) to the exit (+z)**;
- +x is to the right as you enter;
- y is up.

**ASCII maps** are top-down, +z up the page, 1 character ≈ 1 m unless the map says otherwise. `E` is the entry, `X` the exit gate, `M` the monster's start, `B` a bell, `J` a jar, `P` a pot cluster, `m` a mite spawner, `@` an anchor, `=` a rank ledge, `~` water, `#` wall.

**Per-room fields.** Header (id · suit/type · skulls · plaque · slot · status · budget) · Fantasy · Layout · Monster and cue · Rule · Clear · Fail · Hidden clear · Twists · Rank lanes · Mites and loose · Shared fate · Betrayal hook · Power moment · Scaling · BotPlan · Rewards · Bestiary page · System lines · Audio · Unity · Tags.

**Words.** Glossary spellings from D §10 throughout. Monsters are **never killed**: they sleep, kneel, flee, sink or get herded. "Frogs" means every seat in the room, humans and Rivals. *n* is the number of living frogs that entered the room.

---

## 1. The RoomDef contract

Every room is one JSON file at `KNOTWELL/Assets/Data/Rooms/<id>.json`. The editor command `GenerateRooms` turns it into a `RoomDefSO` ScriptableObject and a `Room_<id>.prefab` built from the baked shell plus kit placements. Agents edit JSON and C#; only generators write prefabs (D §12).

### 1.1 Fields

| Field | Type | Rule |
|---|---|---|
| `id` | snake_case string | Exactly the D §6 id |
| `nameKey`, `ruleKey`, `fantasyKey` | Localization keys | All player text goes through the `Rooms` string table (D §8.2 #27) |
| `kind` | enum | `hub`, `onboarding`, `breather`, `toy`, `gold`, `rule`, `set_piece`, `heart`, `keeper`, `warden` |
| `suit` | enum | `spade` (A, Body), `diamond` (B, Mind), `club` (C, Together), `heart` (♥), `enigma` (E), `none` |
| `capacity` | object | `mode`: `group` (1–8), `solo` (1), `duo` (2), `solo_duo` (1–2) |
| `skulls` | 1–3 | Base value. Hard adds 1 (shown on the plaque) |
| `band` | [min, max] | Door numbers where the generator may place it (§4.3) |
| `short` | bool | True for ≤55 s rooms (door-5 candidates) |
| `lengthSec` | {target, soft, hard} | Rule doors: soft 90, hard ≤150 (FO §3.2) |
| `monster` | {id, brain, bestiaryId} | At most one `MonsterBrain` per room |
| `cue` | {what, leadSec, hex, sfx} | Lead 2–5 s before danger (FO §3.8). Hard and Hell multiply `leadSec` by 0.7 |
| `rule` | string key, ≤14 words | Plain text, shown on first visit |
| `sealedKeep` | int[] | Word indices left visible when Sealed or Hell redacts the rule (§3.6) |
| `clear`, `fail` | condition objects | Evaluated only on the host |
| `hiddenClear` | {id, trigger, hintKey} | Pays ×2 fireflies, a Bestiary stamp, +5 RP, and always fires `[ NOTED ]` |
| `twists` | list | **Exactly 2 for rule doors, set pieces and the Keeper**; 0 for Heart doors, breathers, hubs and the Warden. Each touches only dynamic objects (validator) |
| `lanes` | list | Each entry: `{rank, verb, gauge, what}`. **Rule doors, set pieces and the Keeper** need ≥ 1 rank-II lane and a rank-III lane for **each** of Hop, Tongue and Croak (D §5: the Awakening verb follows usage). Heart doors need ≥ 1 rank-II lane where the room has verbs to use |
| `mites` | {type, countPerFrog} | Mites pop into 1 loose firefly each |
| `loose` | perFrog | FO §4.1: breather 4, rule/Heart 8, set piece 10, Keeper/Warden 10 |
| `gimmick` | id | The one shared-fate gimmick |
| `betrayal` | {window, verb} or null | Heart doors only. Other rooms allow mischief (§3.8) |
| `prize` | enum | `boon`, `jar`, `gold`, `key`, `window`, `rematch` |
| `boonFamily` | enum | Body / Sight / Chorus / Risk / any (E: Rare or better) |
| `botPlan` | object | Roles plus three stages: `explore`, `theorise`, `execute` (§1.3) |
| `system` | keys | `enter`, `clear`, `dark`, `fail`, `hidden`, plus room extras |
| `audio` | keys | Cue SFX, monster motif, music state |
| `bestiary` | {tipKey, hiddenHintKey, entryKey} | Rule monsters, Keeper and Warden only (14 pages) |
| `wish[]`, `homage[]` | tag ids | Vocabulary in §1.4. Fed to the wish-coverage test (D §8.2 #28) |
| `status`, `budget` | enum | MUST-A / MUST-B / SHOULD / LATER · S / M / L |
| `layout` | {shell, placements[]} | Kit prefab + socket + position + params. The shell is static and baked |
| `tests` | {autoSolve[], soakSeeds} | §8.2 |

### 1.2 Example (`bell_golem`, trimmed)

```json
{
  "id": "bell_golem", "kind": "rule", "suit": "spade", "skulls": 1,
  "capacity": {"mode": "group"}, "band": [2, 19], "short": false,
  "lengthSec": {"target": 60, "soft": 90, "hard": 120},
  "monster": {"id": "bell_golem", "brain": "BellGolemBrain", "bestiaryId": "bell_golem"},
  "cue": {"what": "eyes_glow", "leadSec": 2.0, "hex": "#FFB000", "sfx": "sfx.golem.hum_rise"},
  "ruleKey": "room.bell_golem.rule", "sealedKeep": [0, 1, 5],
  "clear": {"type": "flags_all", "flags": ["bell0", "bell1", "bell2"]},
  "fail": {"type": "any", "of": ["hard_timer", "all_dark"]},
  "hiddenClear": {"id": "golem_one_croak", "trigger": "EchoSpot.gold_circle", "hintKey": "room.bell_golem.hidden_hint"},
  "twists": [{"id": "crooked_bell"}, {"id": "double_look"}],
  "lanes": [
    {"rank": "II", "verb": "hop", "gauge": "ledge.II", "what": "gallery bell"},
    {"rank": "III", "verb": "croak", "gauge": "croak.III", "what": "two bells from the midpoint"}
  ],
  "mites": {"type": "bell_beetle", "countPerFrog": 4}, "loose": {"perFrog": 8},
  "gimmick": "clap_radius", "betrayal": null, "prize": "boon", "boonFamily": "body",
  "wish": ["weird_clear_monsters", "increasing_powers"], "homage": ["doors_one_rule"],
  "status": "MUST-A", "budget": "M",
  "layout": {"shell": "shell_belfry_r12", "placements": [
    {"kit": "Bell", "socket": "s0", "pos": [0, 0, 5.5]},
    {"kit": "EchoSpot", "id": "gold_circle", "pos": [0, 0, 0], "radius": 1.2}
  ]},
  "tests": {"autoSolve": ["obvious", "hidden", "fail"], "soakSeeds": 50}
}
```

### 1.3 BotPlan: three stages (CRIT #2)

Rivals must never solve a room *for* a first-time human.

| Stage | Starts when | Rivals do |
|---|---|---|
| **Explore** | Room start | Poke kit props, pop mites, and make the room's **canonical mistake** (listed per room) |
| **Theorise** | Any frog makes a correct partial action, or pings the right object, or 30 s pass (Rookie: 40 s) | Stand at the right props, ping them, try the rule at 60% timing accuracy |
| **Execute** | 60 s pass (Rookie: 75 s), or a human pings "Go!" on the Wheel, or every human in the room has this monster's Cleared stamp | Run the role graph with normal jitter |

**Hard limits (validator + PlayMode test):**
- No Rival performs a room's **key action** (the one that fires `clear`) in a human's first 90 s in that room, while any human there lacks the Cleared stamp.
- Rival study is capped at the most-experienced human's stamp level + 1.
- Rivals never betray outside Heart doors, never without the full tell (1.5 s: cheek puff, crimson tongue tip, lean), and never against the mercy rule (03).

### 1.4 Tag vocabulary

**`wish[]`** (the user's words, D §8.2 #28): `name`, `frog_well_sky_space`, `tower_dungeon_maze_layers`, `random_doors_1a1e_meet`, `weird_clear_monsters`, `increasing_powers`, `ttith_brutal`, `sabotage`, `team_up`, `mafia_among_us`, `chained_together`, `peak`, `teambound_modes`, `coop_time`, `minigames`, `skins_shop`, `top_visuals`, `feel_progress`.

**`homage[]`**: `doors_one_rule`, `doors_rush`, `doors_eyes`, `doors_figure`, `ttith_floor3`, `ttith_doppelganger`, `ttith_floor61`, `tb_summit`, `tb_chained`, `tb_downstream`, `tb_echo`, `tb_delivery`, `tb_babel`, `tb_one_body`, `tb_deep_dive`, `peak_grip`, `chained_together`, `among_us_vote`, `split_or_steal`, `stare_rule`.

---

## 2. The room kit

Namespace `Knotwell.Rooms.Kit`, assembly `Rooms`. A room may add **one** bespoke script, its `MonsterBrain`; everything else comes from this list. Every kit piece is host-simulated, and clients only render replicated state.

### 2.1 Gauges: rooms are built against verb ranks

Rooms reference **gauge keys**, never raw metres. `RankLedge`, `RankGap` and `Anchor` read their size from `Assets/Data/VerbRanks.json` at generation time, so retuning a rank moves every lane in every room at once (plan_2). Current values (GB; FO §4.1 plus GDD §4.2 physics at 5 m/s run and 20 m/s² gravity; 02 owns them):

| Gauge | I | II | III (Awakening) | IV (Mastery) |
|---|---|---|---|---|
| `ledge.*` (height a lane needs) | 1.4 m tap / 1.9 m charged | **2.3 m** (charged 2.4) | **3.2 m** (charged + Air Hop) | **2.9 m** in one charged hop; 3.8 m with Air Hop |
| `gap.*` (running jump) | 2.6 m tap / 4.3 m charged | 4.8 m | **6.8 m** (Air Hop) | 8.0 m |
| `anchor.*` (tongue reach) | 3.0 m (props, levers, keys; no grapple) | **4.5 m grapple** | **6.0 m**, 2 targets at once, spit-back | **8.0 m**, chained grapples with no touchdown |
| `croak.*` (pulse radius, toll targets) | 4 m, 1 target | 6 m, 1 target, 1 s stagger on small monsters | 6 m, **2 targets (Twin Toll)**, mite knockback | **9 m**, 2 targets, shatters pots and mites, **2 s stagger on rule monsters** |

**Toll rule** (bells, lamps and any other `TollTarget`): a croak affects the **nearest** 1 target inside its radius (2 from rank III). Three exceptions ring more: an `EchoSpot` (every target in radius), the Duet Duo Boon (every bell in the room), and a Chorus Boon sync. This keeps "ring 3 bells with one croak" a real feat (the Echo Toad quest).

### 2.2 Components

| Component | What it does | Replicated state |
|---|---|---|
| `RoomState` | One per live room: seed, Twist, phase, room clock, clear/fail, flags bitfield | `NetworkVariable<int> Seed`, `<byte> Twist`, `<byte> Phase`, `<double> StartTime` (server time), `<uint> Flags`, `<byte> Result` |
| `MonsterBrain` (abstract) | States `Idle → Tell → Act → Recover`, plus `Stagger`, `Sleep`. Hears the `NoiseBus`; sees by `GazeCone` | `<byte> State`, `<double> StateTime`, `<ushort> TargetSeat`; transform by `NetworkTransform` (host) |
| `TellLight` | The self-lit cue: an emissive ramp over `leadSec` plus a positional one-shot | Driven by `MonsterBrain.State` (no own state) |
| `TollTarget` (`Bell`, `Lamp`) | Rung or snuffed by croak under the toll rule; relights after `relightSec` if the room says so | bit in `RoomState.Flags` |
| `EchoSpot` | A volume in which a croak affects every `TollTarget` in radius | none |
| `Lever`, `Valve` | Tongue-hold 0.5 s / 1.5 s to flip or turn | bit / byte |
| `Plate` | Lit while ≥ `units` of weight stand on it (a frog = 1 unit; props by table) | bit |
| `Pad` | Lily pad: capacity, sink rule, rock on landing | `<byte> Load`, `<half> Sink` |
| `Raft` | Tilt from the torque of weights; no buoyancy rigidbody (plan_2) | `<half> TiltX`, `<half> TiltZ`, spline `<half> Progress` |
| `Carryable` | Tongue-carry; mass; `fragile` (cracks on a fall > 1 m, 3 cracks break it); `twoCarrier` mode | `<byte> Cracks`, holder seats |
| `Jar` | Tier Bronze / Silver / Gold; opened by tongue, stomp or croak; spills loose fireflies and Wish Coins (04 owns amounts) | bit |
| `Pot` | Breaks on stomp (Hop IV), Thunder Croak, Shatter Croak or a thrown prop; 1–2 loose fireflies | bit |
| `MiteSpawner` | Spawns mites (moths, bell-beetles, striders, grubs) that pop into 1 loose firefly each | count |
| `FireflyCloud` | A drifting cloud of loose fireflies; gulped by tongue | amount |
| `GazeCone` | Looker (monster sees frogs) or **inverted** (frogs watch the monster: `moss_snail`). Uses the frog's **facing**, never the camera (CRIT #21) | none |
| `NoiseBus` | Static service. Every event posts `{pos, loudness m, seat}` (table 2.3). Monsters chase the loudest event heard in the last 3 s | none |
| `Anchor` | Grapple point with a `gauge` | none |
| `RankLedge`, `RankGap` | Geometry sized from a gauge | none (baked) |
| `Tether` | Distance constraint between two frogs: rest length, max length, elasticity, cut rule | `<half> Length`, bit `Cut` |
| `GripWall`, `MossHold` | Climbable holds that dry after contact and re-moisten | `<uint>` dry bitfield ×4 |
| `SweepHazard` | A moving hazard volume on a spline (the heron shadow) | `<half> Progress` |
| `HideVolume` | Cover from a `SweepHazard`, with a frog capacity | `<byte> Load` |
| `FogVolume`, `WaterVolume` | Visibility limit; swimming at 2 m/s and currents | none |
| `KillVolume` | A fall below the room: respawn at the last `Checkpoint` with −1 spot | none |
| `Checkpoint` | Respawn point | bit |
| `CountdownBell` | 3-2-1-NOW on every screen in the room at 1 s beats; tongue or croak it to start | `<double> NowTime` |
| `ExitGate` | Opens on clear. **The Tower gulp:** every frog still inside is pulled to the DoorHall within 3 s | bit |
| `HiddenClearTrigger` | Fires `hiddenClear` from a named condition | bit |
| `PhaseSequencer` | Runs 2–3 `MonsterBrain` scripts as phases (Keeper, Warden) | `<byte> Phase` |
| `WindowView` | A crack in a wall onto real geometry (`br_window`) | none |
| `VoteDais`, `SecretChoice` | Heart-door vote pads and private choices | per-seat bytes (owner-only where secret) |
| `Plaque`, `DoorHall` | §3 | §3 |

**Loose fireflies.** Each room spawns `loose.perFrog × n` fireflies at start: half as mites, half as clouds and pots (GB split). Loose fireflies ride in the gulper's cheeks and bank on clear (FO §4.1).

### 2.3 Noise table (frog verbs)

| Event | Loudness (m) |
|---|---|
| Waddle | 2 |
| Tap-hop landing | 4 |
| Charged-hop landing | 7 |
| Splash, belly-flop, falling into water | 8 |
| Shove | 6 |
| Tongue hits a prop | 5 |
| Pot shatter, prop impact | 8 (×1.5 for props ≥ 3 kg) |
| Croak pulse (any rank) | 12 |
| Croak sustain | 12, re-posted every 0.5 s |
| Bell ring | 12 |
| Ping, Wheel lines, emotes | 0 (UI only; pings never wake anything) |

A listener hears an event when its distance is ≤ the loudness. This replaces GDD §6.0.5, and every room below uses it.

### 2.4 Shared room rules (every room, every time)

- **Clear bonus** goes to every frog that entered, ghosts included (FO §4.1). The Tower gulp pulls stragglers out.
- **Room clock.** A count-up clock shows top-centre in rule doors, Heart doors, set pieces, the Keeper and the Warden. Its final value is the **old time** a Rematch shows.
- **Hard timer.** Hidden until 20 s remain; then a bell tolls once per 5 s and the clock turns amber.
- **Failure** (hard timer, or every frog inside Dark): `[ FAILED ]`, then the Tower gulp. The room pays 50% of its clear bonus, gives no Boon, and costs 1 Team Life. E doors never cost a Team Life (FO §3.7).
- **Hits and falls** cost 1 spot. A knocked-out spot flies as a glowing firefly and can be tongue-caught for 3 s; it always returns to its owner (02).
- **Falls** of more than 4 m onto solid ground cost 1 spot. Falls into water cost none.
- **Monster touches never kill outright.** Every hit is one spot.
- **Every room is clearable with audio muted.** Each audio cue has a visual twin (validator).
- **Hidden or unintended clear:** always `[ NOTED ] That was not the intended solution. Keep it.` (D §8.2 #25), then the room's own hidden line.

---

## 3. Door grammar and plaques

### 3.1 The DoorHall

Every door slot is a `DoorHall` prefab at the end of a ≤5 s walk up the Braid strand: an antechamber 8 m wide × 6 m deep, lit warm (`#FFB86B`, GB), holding 1 door (breather) or 2 doors (pair, fork) 4 m apart.

1. **The door counter slams** on entry: `DOOR 12`, full width, 0.35 s with 80 ms hitstop and a stone thud. One per door; it is not a full-screen card.
2. **Walk-vote** (FO §3.3). A 2 × 2 m vote volume sits in front of each door. **4 s after the first human steps into one, the door with more humans opens.** A tie goes to the door the first human reached. Rivals follow humans; in solo the human decides.
3. **Entering** is a 0.4 s fade through the door frame into the room's cell.

### 3.2 Plaques: exactly four things

A 1.2 × 0.8 m self-lit stone plaque above each door shows:
1. **Number and letter**: `12E` (glyphs 0.35 m tall);
2. **Suit glyph**: ♠ A Body · ♦ B Mind · ♣ C Together · ♥ Heart · E Enigma;
3. **Prize icon**: Boon, jar, gold, key, window, or the Rematch hourglass;
4. **Skulls**, 1–3, plus a `SOLO` or `DUO` tag on E doors.

**Greybox suit tokens** (09 owns final art): ♠ `#7FD1FF`, ♦ `#B79CFF`, ♣ `#8CE38C`, E `#F2F2F2` with a gold rim, gold door: whole plaque `#FFD76A`. The ♥ glyph uses the betrayal crimson, which 09 defines; nothing else on a plaque may use it.

**Never on a plaque:** payout formulas, capacity dots, Omens, Notes, clear times (except the Rematch hourglass), room names. The room's name appears in its System entry line.

### 3.3 Letters

| Letter | Meaning |
|---|---|
| A | ♠ Body room |
| B | ♦ Mind room |
| C | ♣ Together room |
| E | Enigma, SOLO or DUO, fork only; Rare-or-better Boon |
| (none) | Breathers (single door, opens by itself), toy doors, gold door, Keeper, Warden |
| ♥ | Heart doors show the glyph and the pair letter of their slot |

Plaque letters always match the suit (D §5). So a pair's two doors never share a letter.

### 3.4 Forks, the Meeting Door, offstage Rivals

- **Forks** fall at doors 12 and 17 in climb 1, and at 7, 12 and 17 after that (D §4).
- A fork offers a **group door** (A, B or C) and an **E door** (SOLO or DUO). The party may split. The walk-vote locks each frog's side at 4 s.
- **At most 2 rooms are live** (FO §3.3). The fork rooms run in two cells, each visible only to its own frogs (NGO visibility; 10 owns).
- **Offstage Rivals** (D §8.2 #11). If no human takes a side, Rivals take it **offstage**:
  - they are parked, not simulated;
  - they rejoin at the Meeting Door after the humans' clear time plus 5–20 s (seeded);
  - they carry the missing key and give one reunion bark ("Kestrel fell in twice.").
  - Default volunteers: Lumen takes an E side ("I work alone."); the rest of the party takes the group side.
- **The Meeting Door** (FO §3.3; 07 owns the room's toys and art):
  - It has **two locks**. Each fork room drops one **key** on clear, carried by its last frog out. Lock G sits on the E side and lock E on the group side, so the halves must **swap keys** through the window hatch.
  - The first half to finish waits in `meeting_room`: Jar Tag, and a **shadow-glass window** onto the other fork room. It shows that room's frogs and self-lit tells only, from a 320 × 180, 15 fps secondary camera (GB).
  - The **window hatch** (0.8 × 0.8 m) passes one object at a time: a key, a jar or a spat firefly.
  - **Rescue rope at 45 s of waiting.** A rope drops beside the window. A waiting frog tongues it; it extends into the other room. A frog there who grabs it (hold Tongue on the rope) is hauled out. When every frog there is out, or their room clears, that room counts as **cleared with help**: the Boon pick is kept; only the hidden-clear bonus is lost (FO §3.3).

### 3.5 Overlays

| Overlay | Rule |
|---|---|
| **Gold door** | A breather slot becomes `br_gold` (§6.2). Climb 1: seeded at door 9. Later: 5% per eligible breather slot (Rank B talent: 7%; Lucky Belly ×2), forced on the door-16 or door-19 slot if none has rolled by door 15 (D §5, D §8.2 #2) |
| **Rematch door** | Exactly one per Full Climb, in doors 15–19 (§7) |
| **Heart door** | 1–2 per climb. Climb 1: single doors at 11 and 14. Seeded climbs: from door 6, as **one side of a pair**, so a party can always walk away from betrayal |

### 3.6 Sealed and Hell: redacting the rule

- **Sealed** (opt-in, [MUST-B]). A round stone seal sits under the plaque of any room that **every human present** has stamped Cleared. Any human may tongue it during the walk-vote to toggle it; it glows when armed. A Sealed room pays **+50% fireflies** (FO §3.8).
- **Hell** always redacts every room's rule.
- **Redaction:** words not in `sealedKeep` render as `█` blocks, one per letter, capped at 5 per word. Numbers are always kept.
- **Decode for the bonus:** the cue, the room's physical tells and the Bestiary hint are enough to solve every room with zero rule words visible (the old readability contract, GDD §6.0.3). This is tested (§8.2).

### 3.7 Room cells

- Every room prefab lives permanently in its own cell of the 300 m grid under the shaft (plan_2; 10 owns the constants). "Spawning" a room enables its cell; the host then spawns its dynamic objects.
- **The one exception is `br_window`**, placed in the real shaft at its nominal height, so the view is real geometry.
- **Shells are static and baked** (APV, NavMesh). Twists and seeds may only move dynamic objects, so one baked shell serves every seed (validator).

### 3.8 Mischief versus betrayal in rooms

- **Outside Heart doors:** shove (6 m/s impulse, same for everyone) and a tongue tug of at most 1 m, never toward a drop (nav-edge check). **Water is not a drop** for the ledge guard, since falling into water costs nothing; that is what makes tonguing Kestrel off his pad legal. Spilled fireflies return to their owner. Blame tags ("Clapped: Kestrel") appear in friends and private lobbies only (03).
- **Hauls are consensual.** A tongue haul, a rescue rope or a Trust Fall catch moves a frog only while that frog holds Tongue aimed at the hauler or rope, or has chosen to fall. So a haul is not a tug and is not capped.
- **Inside Heart doors:** the room's `betrayal` field names what is allowed. A full yank needs the 0.6 s tell (FO §5.4). Betrayal moves only unbanked room loot and is server-authoritative.

---

## 4. Generator rules

### 4.1 Climb 1 is authored

`Assets/Data/Climbs/climb1_well.json` lists every slot of §5. Every profile's first climb is identical: same rooms, no Twists, fixed layouts, the Drama Director's beats. **The growth CI test** (D §5) simulates it from the JSON tables and fails the build if Lv5 falls outside doors 6–8 or Lv10 outside doors 17–19.

### 4.2 Seeded climbs (climb 2 onward)

One replicated `int` seed plus the host-only salt (salt only for private offers and quests) builds the whole climb on every client.

**Slot template:**

| Door | Slot | Door | Slot |
|---|---|---|---|
| 0 | `hatch_pond` (skippable after the first climb) | 11 | pair |
| 1 | breather | 12 | **fork** |
| 2 | pair (pick 1 of 3 starts here) | 13 | breather |
| 3 | pair | 14 | pair |
| 4 | breather: `br_window` | 15 | pair or set piece |
| 5 | pair (prefers `short` rooms), then Landing 1 | L3 | Landing 3 |
| 6 | breather, or a pair with a ♥ side | 16 | breather (toy door preferred) |
| 7 | **fork** | 17 | **fork** |
| 8 | pair | 18 | pair (default Rematch slot) |
| 9 | breather (gold eligible) | 19 | breather |
| 10 | `keeper_bell_raft`, then Landing 2 | 20 | `warden_the_jar` |

**Constraints** (validator runs each over 1,000 seeds):
1. Forks at 7, 12 and 17. An E pool room never repeats in a climb.
2. 1–2 Heart doors, from door 6, drawn from the ♥ pool of 4, each as one side of a pair.
3. At least 1 gold door (§3.5).
4. Exactly one Rematch in doors 15–19.
5. One set piece in each half (doors 2–9 and 11–19), placed as one side of a pair.
6. No suit three slots in a row; the two sides of a pair never share a suit.
7. **Debut rule:** while any Well monster is unmet on this profile, place up to 2 never-met monsters before door 10. Climb 2 therefore guarantees `moss_snail` and `web_spider` as a pair somewhere in doors 3–9 (D §5).
8. **Pool rule:** a room played in this climb can't return except as the Rematch. The unchosen side of a pair can.
9. Each room respects its `band`.
10. **Twists:** seeded climbs roll one Twist per room instance (A or B, 50/50). Hard always rolls one; Hell rolls both. Climb 1 rolls none.
11. **Layout shuffles** (which sockets are live, which pads float where) are seeded separately from Twists and apply in every seeded climb.

### 4.3 Pools and bands

| Pool | Rooms (band) |
|---|---|
| ♠ group rule | `bell_golem` (2–19), `heron_shadow` (2–12), `snake_coil` (3–19) |
| ♦ group rule | `fog_stair` (3–14, short), `echo_warren` (5–19), `moss_snail` (3–19) |
| ♣ group rule | `lily_raft` (2–14), `snapper_crossing` (3–14, short), `lamp_knight` (5–19), `web_spider` (3–19) |
| E | `slime_foundry` (7–17), `glitch_eye` (12–17) |
| ♥ | `heart_two_pads` (6–19), `heart_split_swallow` (6–19), `heart_tied_bridge` (11–19; needs Knot unlocked), `doppelfrog` (6–19) |
| Set piece | `sp_tongue_tether` (6–19), `sp_grip_wall` (11–19; its hatch opens onto a Landing when placed at 15) |
| Breather | `br_shove_door` (1 only), `br_window` (4 only), `br_jar_mites` (any), `br_sleeping_toad` (8–19), `toy_fly_catch` (6–16), `toy_lily_sumo` (6–16), gold overlay |

---

## 5. The authored first climb, door by door

Solo with 7 Rookie Rivals (Moss, Vex, Pell, Lumen, Brother Brass, Kestrel, Pip; 03 owns the roster), Normal. Yields are FO §4.1 with d = door number and no hidden clears; **Heart doors pay rule-door yields**. The Banked column reproduces D §5's growth check.

| Door | ≈ Clock | Room(s) · plaque | Target length | Clear + loose (each) | Banked | Growth | Drama Director beat | Teaches |
|---|---|---|---|---|---|---|---|---|
| 0 | 0:00 | `hub_well_bottom` → `hatch_pond` | 35 s | 30 (cloud) | 30 | **Lv2, TONGUE II** | Kestrel: "Watch this!" | Hop, Tongue, growth; first laugh ≤0:30 |
| 1 | 0:35 | `br_shove_door` | 25 s | 9 + 4 | 43 | — | Moss helps shove | Linked bodies |
| 2 | 1:00 | `bell_golem` ♠ (fixed single) | 60 s | 22 + 8 | 73 | **Shatter Croak** (granted) | Moss catches a knocked spot | Rule doors |
| 3 | 2:10 | 3A `heron_shadow` ♠ · 3C `lily_raft` ♣ | 75 s | 24 + 8 | 105 | **Lv3, HOP II**; Boon granted | Kestrel sinks the raft's edge | Door choice; team gimmick |
| 4 | 3:40 | `br_window` | 15 s | 12 + 4 | 121 | — | Pip: "It goes up forever?" | First glimpse of scale |
| 5 | 3:55 | 5B `fog_stair` ♦ · 5C `snapper_crossing` ♣ | ≤55 s | 28 + 8 | 157 | **Lv4, CROAK II**; Boon | Pell pings the 2.3 m ledge | The Hop II ledge: numbers bind |
| L1 | 4:45 | `landing_well` + `toy_frog_stack` | 40 s | jars (Wish Coins) | 157 | — | Brass starts the stack | Rest; Mouth 37° |
| 6 | 5:25 | `toy_fly_catch` | 30 s | 14 + 4 | 175 | — | — | Toy door |
| 7 | 5:55 | 7B `echo_warren` ♦ · 7C `lamp_knight` ♣ | 70 s | 32 + 8 | 215 | **Lv5: Tongue Awakening, Long Tongue**; Boon | Bots gasp: "Since when does your tongue do *that*?" | Awakening |
| 8 | 7:05 | 8A `snake_coil` ♠ · the unchosen door-5 room | 60 s | 34 + 8 | 257 | Boon | — | First hidden-clear chance (Long Tongue on the tail) |
| 9 | 8:05 | `br_gold` (seeded) | 50 s | 108 (×3) | 365 | **Moon Hop** granted; **Lv6: Air Hop** | Everyone dances | Jackpot |
| 10 | 8:55 | `keeper_bell_raft` | 90 s | 60 + 10 | 435 | **Lv7: Twin Toll** | Brass: "On three." | Mastery exam |
| L2 | 10:25 | Keeper Landing ceremony (≤40 s, D §5) | 40 s | — | 435 | `[ CHOICE UNLOCKED ]`, Rank F → E, hat | — | **The Quick Climb ends and saves** |
| 11 ♥ | 11:05 | `heart_two_pads` | 60 s | 40 + 8 | 483 | first pick 1 of 3 | **Vex shoves Moss** (full tell) → Betrayal Cam, WANTED | Heart door (Shove only) |
| 12 | 12:15 | fork: 12B/12C (the unchosen door-7 room) · 12E `slime_foundry` SOLO → `meeting_room` | 70 s | 42 + 8 | 533 | **Lv8: Tongue IV** | **Moss's Vengeance on Vex** lands in Jar Tag | Fork and Meeting Door |
| 13 | 13:25 | `br_jar_mites` | 20 s | 21 + 4 | 558 | — | — | `[ HIDDEN CONDITION DETECTED ]` |
| 14 ♥ | 13:45 | `doppelfrog` (spot-the-Mimic variant) | 70 s | 46 + 8 | 612 | Boon | The Mimic wears Kestrel | Mafia / Among Us |
| 15 | 14:50 | `sp_grip_wall` | 110 s | 55 + 10 | 677 | **Lv9: Hop IV** (~16:30) | Pip dangles: "Help!" | PEAK |
| L3 | 16:30 | `landing_well` (Mouth 56°) | 40 s | — | 677 | — | **Moss offers the Knot** | Knot, Cut, Duos |
| 16 | 17:10 | `toy_lily_sumo` | 30 s | 24 + 4 | 705 | — | — | Toy door |
| 17 | 17:30 | fork: 17C `sp_tongue_tether` · 17E `glitch_eye` SOLO/DUO | 100 s | 59 + 10 | 774 | Duo offered (Frog Sling) | A sling that misses | Chained Together |
| 18 | 18:40 | **Rematch** `bell_golem`: `OLD TIME 1:12 → 0:18` | ~20 s | 54 + 8 | 836 | **Lv10: Thunder Croak, Crown glow** | Onlookers: "An F-rank did *that*?!" | Steamroll |
| 19 | 19:10 | `br_sleeping_toad` | 25 s | 27 + 4 | 867 | — | Kestrel almost croaks | Dread, then a waltz |
| 20 | 19:30 | `warden_the_jar` | ~180 s | 120 + 10 | 997 | power lap | Brass falls first | Trust Fall |
| ★1 | 22:30 | ★1 Out of the Well → `rim_surface` | 26 s + results | — | — | +50 Pearls (first surfacing) | — | The Sky |

**Pacing checks** (D §5): exactly 5 systems before the Keeper (verbs, growth, rule doors, door choice, team gimmick); after it one per stop; one full-screen card per door at most; a "stronger, laughed or saw something bigger" beat at least every 90 s.

---

## 6. Room specs

The 34 MUST rooms (D §6 rows 1–34), grouped by kind. Hubs, onboarding and toys are **room cards**: this file owns their RoomDef data, kit and test hook, and `07_HUB_AND_MINIGAMES.md` owns their shots, rules and scoring.

### 6.1 Hubs, onboarding and toys (room cards)

#### `hub_well_bottom` · hub · title screen · [MUST-A] · M
- **What it is.** The menu *is* the well bottom: black water at y −2, 8 eggs bobbing, the Mouth a 31° coin 180 m up (WORLD §4.3).
- **Footprint.** The Foot, a mossy stone deck of radius 18 m on strand 1 at y 0. The parapet is at r 19 m, and the well wall 21 m beyond the deck edge.
- **Placements** (deck frame, +z radially outward):
  - 8 `HatchEgg` at r 6 m, 45° apart;
  - the **map** (UI Toolkit panel on a 6 × 4 m wall slab) at (0, 0, 14);
  - the **Mirror** at (−9, 0, 8);
  - the first-frog statue (우물 안 개구리 / 井底之蛙), 0.9 m, looking up, at (9, 0, 8);
  - **four difficulty doors** at (−10.5, 0, −12), (−3.5, 0, −12), (3.5, 0, −12) and (10.5, 0, −12): Easy, Normal, Hard, Hell. Hard and Hell are chained until the lobby unlocks them (D §4, ruling 7).
- **Choosing difficulty** uses the §3.1 walk-vote on the four difficulty doors. The chosen door leads to `hatch_pond`.
- **Unity.** `Hub_WellBottom.prefab`; `HatchEgg` (seat-bound; `NetworkVariable<byte> SeatState`); `DifficultyDoor` (`<bool> Chained`).
- **Test hook.** `Hub.AutoStart(Difficulty d)` walks every seat through door d.
- **Tags.** wish `name`, `frog_well_sky_space`, `tower_dungeon_maze_layers`, `ttith_brutal`.

#### `hatch_pond` · onboarding · door 0 · [MUST-A] · S
- **What it is.** Hatch in 3 s, hop pad to pad, gulp a firefly cloud (Lv2, TONGUE II), and tongue Kestrel off his wobbly pad for the first laugh by 0:30. 07 owns the shot list.
- **Footprint.** A pond 22 × 14 m at the Foot's waterline.
- **Placements:**
  - 7 `Pad`s (r 1.0 m) in an arc from (−8, 0, −4) to (8, 0, 4), gaps ≤ 2.2 m (inside `gap.I` tap);
  - 8 `FireflyCloud`s of 30 each, one per seat, drifting 2 m above the pads;
  - Kestrel's wobbly pad (`Pad`, rock ±12°) at (4, 0, 5);
  - the door-1 slab at (0, 0, 9).
- **Yield.** The 30 fireflies bank on reaching the door-1 threshold: 30 banked, Lv2 (FO §4.1).
- **Kestrel beat.** Tongue-on-player is ≤1 m here, and his pad's 1 m edge makes a 1 m tug enough. If tongue-on-player is cut after the M0 proof of concept, Shove does it. In public lobbies the prompt targets a pot stack that topples onto Kestrel (FO §3.5).
- **Test hook.** `HatchPond.AutoSolve()`: hop 7 pads, gulp, tug Kestrel, walk out. Assert Lv2 and TONGUE II within 35 s.

#### `landing_well` · Landing · after doors 5, 10 and 15 · [MUST-A] · M
- **Footprint.** Strand tops at y 30 / 60 / 90 (Landings 1, 2 and 3). The Mouth reads 37° / 44° / 56°.
- **Stations** (07 owns): jar lineup, one toy, the stall (from Landing 2), the Knot spot (from Landing 3), the Mirror.
- **Rules this file relies on:** a 40 s budget, a save point, and a free revive with all spots restored (FO §3.7).
- **Test hook.** `Landing.Skip()` advances after the ceremony. The soak asserts ≤ 40 s per Landing.

#### `meeting_room` · hub · after forks 12 and 17 · [MUST-B] · M
- The two-lock Meeting Door, key swap, window hatch, shadow-glass window and rescue rope follow §3.4. 07 owns the layout and the Jar Tag toy placement.
- **It counts as a shared room for Vengeance** (D §8.2 #6).
- **Test hook.** `Meeting.AutoSolve(mode)` with modes `keysSwap`, `rescueRope` and `offstage`. Assert the door opens within 60 s of the second key.

#### `rim_surface` · hub · after ★1 · [MUST-B] · M
- **What it is.** The walkable Rim, the Sky's Foot built out from the well's lip, with Glide on. The stars of Space show through a tear in the dome. The results ceremony plays here (D §8.2 #15). 01 owns the ★1 choreography; 07 owns the Rim layout.
- **This file's contract.** Door 20's clear hands off to ★1. No door plaque is shown on the Rim. The only exits are **Climb again** and **Rest** (FO §4.4).

#### `toy_frog_stack` · toy · Landing 1, Meeting room · [MUST-A] · S
Stack frogs into a wobbling tower for a jar (the TEAMBOUND Tower of Babel homage). 07 owns the rules and scoring. Kit: a `Plate` scoring pedestal plus the frog-on-frog stacking physics that `heart_two_pads` reuses (§6.4).

#### `toy_jar_tag` · toy · Meeting room · [MUST-B] · S
Tag, with a jar over your head (Snuff Tag rules). 07 owns the rules. **Vengeance may land by tagging the traitor here** (§5, door 12).

### 6.2 Breathers and toy doors

Breathers (FO §3.2) are single doors that open by themselves, 15–30 s long, warm-lit, and must hold at least one of a jar, a toy, a window, a sleeping threat or gold. **They never fail and never cost a Team Life.** At their maximum length the Tower gulp moves everyone on. They pay a clear bonus of 8 + d and 4 loose per frog (FO §4.1).

---

#### `br_shove_door` · breather (jar) · door 1 · [MUST-A] · S
*"The door is stamped 1. It is also the size of a house."*

**Layout** (12 × 16 m):
```
 z+10  ####X####        X exit arch (0,0,10)
       #  mPm  #        P pot cluster (±3,0,7), m mites
       #   J   #        J Bronze Jar on a stump (0,0,6)
 z 0   [==1==]          the Door-1 slab, 4 m wide x 6 m tall, hinged at x = -2
       .push.           push volume 4 x 1.5 m, z -1.5..0
 z-6   E                entry (0,0,-6); tongue chain @ (2.5,1.6,-0.5)
```

- **How it opens.** ≥ 2 frogs pushing into the slab (forward input inside the push volume) for a cumulative 1.2 s; or 3 shoves on the slab within 2 s from ≥ 2 different frogs. It swings open over 1.0 s, and the `DOOR 1` counter slams on the same frame as the stone hits the wall.
- **Solo fallback.** If only 1 frog is alive in the room for 8 s, a chain glows at (2.5, 1.6, −0.5): tongue-hold 1.5 s opens the slab.
- **Behind it:** a Bronze Jar (tongue it open), 4 pots, and bell-beetle mites (2 per frog).
- **Shared fate:** the two-frog door.
- **Power moment.** With TONGUE II you gulp a mite from 4.5 m, and the System says so the first time: `[ TONGUE II ] Nice reach.`
- **BotPlan.** Moss walks to the slab and pings it: "Here." Kestrel shoves it alone first and bounces off (the scripted gag). Everyone pushes when a human pushes.
- **Length.** Target 25 s; maximum 40 s, then the gulp.
- **System.** Enter: `[ DOOR 1 ] It takes two.` · Jar: `[ JAR ] Bronze. Pop it.`
- **Audio.** Stone grind rising in pitch while pushed; a thud with 80 ms hitstop; warm waltz (Landing kit, F major).
- **Unity.** `Room_br_shove_door.prefab`: `ShoveSlab` (kit `Plate` subclass, 2 units + a shove counter; `NetworkVariable<half> Open`), `Jar`, `Pot` ×4, `MiteSpawner`, `ExitGate`.
- **Test hook.** `AutoSolve`: 2 bots push 1.3 s; assert the slab opens and the counter event fires once.
- **Tags.** wish `team_up`, `feel_progress`.

---

#### `br_window` · breather (window) · door 4 · [MUST-A] · S
*"A crack in the wall. Through it: the real well, and it is enormous."*

**Placement.** The only room built **in the real shaft** (§3.7). It is a passage cut into strand 2's column at y 24 (nominal door height, about 6 m per door), facing across the well.

**Layout** (3 × 12 m passage):
```
 z+6   X                 exit stair up (0,0,6)
       |  J |            Bronze Jar at (0,0,3.5)
       |    )))) crack   1.5 m wide x 4 m tall opening on the +x wall, z -1..+1
       | m  |
 z-6   E
```

- **The view.** Real geometry through the crack: the other strands, **~400 lantern lights** (emissive impostor points, `#FFF4E0`, no names), mist far below, and the Mouth still a coin. D §6 row 7 says "hundreds of lanterns"; they are the lantern-folk revealed at ★1 (01).
- **Camera.** Pitch range opens to +80° inside the crack zone. One automatic glance (tilt to +60° over 0.6 s, hold 0.6 s, return over 0.5 s) plays the first time; any mouse movement over 2° cancels it (WORLD §4.5).
- **Contents:** a Bronze Jar and strider mites (2 per frog).
- **Power moment:** none. This is the "saw something bigger" beat.
- **BotPlan.** Rivals walk to the crack and stop to look (a 1.5 s look-idle). Pip: "It goes up forever?"
- **Length.** Target 15 s; maximum 30 s.
- **System.** Enter: `[ DOOR 4 ] That is not a wall. That is the well.`
- **Audio.** Wind through the crack (positional), distant kalimba drips, the lanterns' faint crowd murmur.
- **Unity.** A `WindowView` placed by `BuildLayerScene` at the slot's shaft height; no room cell. `Jar`, `MiteSpawner`, `ExitGate`.
- **Test hook.** Assert the Mouth's on-screen angle from the crack reads 31–37° (GB) and no lantern shows a name before ★1.
- **Tags.** wish `frog_well_sky_space`, `tower_dungeon_maze_layers`, `top_visuals`.

---

#### `br_jar_mites` · breather (jar) · door 13; seeded breather pool · [MUST-A] · S
*"Warm light, pots, and things to pop."*

**Layout** (12 × 12 m cellar, lanterns `#FFB86B`):
```
 z+6   ###X###
       #P  m P#     P pot clusters (-4,0,3) and (4,0,3), 4 pots each
       #   J   #    J jar (0,0,1): Bronze on floors 1-2, Silver on 3-4
       #m  C  m#    C firefly cloud (0,2,-2)
 z-6   ###E###
```

- **Contents:** 8 pots, bell-beetle mites (2 per frog), one cloud. The jar opens to a stomp, tongue or croak.
- **Door 13 of climb 1** posts the private `[ HIDDEN CONDITION DETECTED ]` banner on entry (D §5; 04 owns secret quests).
- **Power moment.** At Lv8+ a charged-hop stomp (Hop IV) pops every mite within 3 m. Shatter Croak bursts every pot at once.
- **BotPlan.** Rivals pop mites and leave the jar to the lowest-Glow human (the comeback nudge).
- **Length.** Target 20 s; maximum 40 s.
- **System.** Enter: `[ DOOR 13 ] Breathe.` (the number follows the slot)
- **Audio.** The Landing waltz, muffled; each pot has its own pentatonic pitch.
- **Unity.** `Jar`, `Pot` ×8, `MiteSpawner`, `FireflyCloud`, `ExitGate`. **Test hook:** pop all; assert loose total = 4n.
- **Tags.** wish `feel_progress`.

---

#### `br_gold` · breather (gold) · door 9 (seeded in climb 1; 5% after) · [MUST-A] · S
*"The Tower rolled a six."*

**Layout** (16 × 16 m vault, gold light `#FFD76A`, gold-dust particles):
```
 z+8   ####X####
       #  :::  #     ::: gold rain column, r 5 m around the plinth
       #  :G:  #     G Gold Jar on a 1 m plinth (0,1,0)
       #  :::  #
 z-8   ####E####
```

- **The rain.** For 30 s, the **×3 clear bonus** falls visibly as gold fireflies that flow into every frog's cheeks: 3 × (18 + 2d) each (108 at door 9). Nothing extra is loose, so the growth table in §5 stays exact.
- **The Gold Jar.** Its lid opens when 3 frogs tongue it within 0.5 s of each other (a small co-op beat), or by itself after 12 s.
  - **Climb 1:** Moon Hop is granted automatically (D §8.2 #2).
  - **Later climbs:** a private pick 1 of 3 Legendaries (04).
- **Honesty.** The odds page says "First climb: one guaranteed gold door." (D §8.2 #2).
- **Power moment.** Moon Hop's triple hop and small shockwave fire on the spot: the jar room is the first place you use it.
- **BotPlan.** Rivals crowd the plinth and tongue the lid when the human does. Kestrel: "Nice!"
- **Length.** 45–60 s; the exit opens at 30 s.
- **System.** Enter: `[ DOOR 9 · GOLD ] Somebody up there likes you.` · Legendary: `[ LEGENDARY ] Moon Hop. Because: the Tower is feeling generous.`
- **Audio.** Music-box arpeggio up the pentatonic scale; the count-up rises in pitch per firefly (FO §6.2).
- **Unity.** `GoldRain` (Shuriken burst streamed to each seat; the bonus is paid by `RoomState`, not by particles), `Jar` (Gold tier, 3-tongue lid). A Steam Timeline featured marker fires (D §8.2 #21).
- **Test hook.** Assert +3 × (18 + 2d) banked per frog and the Legendary granted or offered.
- **Tags.** wish `increasing_powers`, `feel_progress`.

---

#### `br_sleeping_toad` · breather (sleeping threat) · door 19; band 8–19 · [MUST-B] · S
*"Something the size of a house is asleep across the path. Don't."*

**Layout** (26 × 14 m cave, warm moss glow, one lantern at each end):
```
 z+13  #######X#######    X exit (0,0,13)
       #:           :#    : ledges 1.8 m wide at x = -6 and x = +6
       #:  +-------+ :#
       #:  | TOAD  >|P:#   body x -4..4, z -3..5, back at y 3.0; > mouth (4.5,0.5,1)
       #:P |   J   | :#   J Silver Jar on its back (0,3,1); P pots by nose and tail
       #:  +-------+ :#
 z-13  ~~~~~~~E~~~~~~~    entry pond, the spit-out point, at z -11
```

- **The toad.** An 8 m giant toad asleep across the cave, head at +x, its mouth at (4.5, 0.5, 1). It snores every 3 s: its head lifts and settles.
- **The noise meter** (shared, shown on its eyelid: shut → twitch → half-open → open):
  - each heard event with loudness ≥ 7 m adds +1; any croak adds +2;
  - it decays by 1 every 5 s;
  - **events inside a snore's loud 0.8 s count half** (move on the snore).
- **At 2 (the tell):** the eyelid opens halfway and the throat sac swells, 2 s before anything happens.
- **At 3:** it wakes for 4 s and **inhales**: a 6 m, 60° suction cone at 4 m/s toward the mouth. Frogs that reach the mouth are **swallowed and spat out** into the entry pond 1.5 s later: no spot is lost, only time. Then it sleeps and the meter resets.
- **The path.** Ledges around both sides; or over its back (a `ledge.IV` 2.9 m hop, or a grapple onto a wart `Anchor` at 4.5 m). The back holds a Silver Jar.
- **Pots** by its nose are noise traps.
- **Power moment.** At door 19 you have Thunder Croak and every instinct says use it. Don't. The joy is a Hop IV onto its back and a Long Tongue snatch of the jar while it snores.
- **BotPlan.** Rivals tiptoe on the ledges. **Director beat:** Kestrel inhales to croak and Pip covers his mouth: "Shh!"
- **Length.** Target 25 s; maximum 45 s.
- **System.** Enter: `[ DOOR 19 ] Quiet, please. It has had a long day.` · Swallowed: `[ SWALLOWED ] Tasted like pond.`
- **Audio.** Deep snore loop (the low pentatonic root); each meter step adds a creak; the waltz drops to a music box.
- **Unity.** `SleepingToadBrain` (a `MonsterBrain` with `Sleep/Stir/Inhale`; `NetworkVariable<byte> Meter`), `NoiseBus`, `Anchor`, `RankLedge`, `Jar`, `Pot` ×6, `WaterVolume` (spit-out point). No Bestiary page (it's a breather).
- **Test hook.** Script a charged landing at 5 m (meter +1) and a croak (+2): assert the inhale and the spit-out without a spot lost.
- **Tags.** wish `feel_progress`, `ttith_brutal`; homage `doors_figure` (hunts by sound).

---

#### `toy_fly_catch` · toy door · door 6; band 6–16 · [MUST-A] · S
- **Shell.** A reed bed 14 × 14 m, warm dusk light. A swarm of 40 + 10n flies enters from 3 spawners at 2–4 m height for 30 s.
- **Rules and scoring** are 07's. The door pays a jar at the end, plus the breather clear bonus (8 + d) and 4 loose per frog.
- **Power moment.** Long Tongue grabs two flies per lash from door 7 on (in later climbs, when the toy door comes after an Awakening).
- **System.** Enter: `[ DOOR 6 · TOY ] Lunch.`
- **Unity.** `FlySwarm` spawners, `Jar`. **Test hook:** `Toy.AutoPlay(30 s)`; assert a jar is paid.
- **Tags.** wish `minigames`.

#### `toy_lily_sumo` · toy door · door 16; band 6–16 · [MUST-B] · S
- **Shell.** A dark pond 18 m across with 5 `Pad`s (r 2 m) that shrink 10% every 5 s for 30 s.
- **Rules and scoring** are 07's. Shoves use the normal 6 m/s impulse, and landing in the water costs no spot.
- **System.** Enter: `[ DOOR 16 · TOY ] Last frog dry wins.`
- **Test hook.** `Toy.AutoPlay(30 s)`.
- **Tags.** wish `minigames`.

### 6.3 Rule doors (12)

Every rule door is dark (ambient ≤ 0.1) with self-lit tells, frogs and plaques (FO §2.2). Yields are FO §4.1: clear 18 + 2d and 8 loose per frog; the hidden clear pays ×2 total. **The Boon** is granted automatically in climb 1 before the Keeper (picked to suit your most-used verb) and is a private pick 1 of 3 otherwise (two from the suit's family plus one wildcard; 04).

**Crossing clears.** Several rooms clear when frogs reach the far side (`clear.type = "cross"`). A crossing clear fires when ≥ ceil(n_alive / 2) frogs stand in the exit zone, **including at least one living human** if any human is alive in the room. This keeps the 90 s guard (§1.3) honest: Rivals can cross, but they can't finish the room for you.

---

#### `bell_golem` · ♠ A rule · 1 skull · door 2 (fixed single in climb 1); Rematch 18; reused by the Keeper and Warden P1 · [MUST-A] · M · **style-lock room**

*"A bronze bell-giant that listens with its whole body and watches with two lamps. Ring its bells while it isn't looking."*

**Layout.** A round belfry, r 12 m, walls 10 m, a dark stone floor with a moonlit oculus.
```
 z+12            X               X exit (0,0,12)
          s4 .       . s0        s0..s4 bell sockets at r 5.5 m, bearings 36+72i deg
     ====   gallery 2.3 m  ====  = gallery ledge (ledge.II), r 11-12 m, broken by a
    =            .            =    6.5 m gap at the exit side (gap.III); pots P x14
   = s3        (gold)       s1 =  (gold) EchoSpot r 1.2 m at (0,0,0)
    =             M           =  M golem start (0,0,4)
     ====               ====     @ beam anchor (0,4.5,0)
              s2                 s2 = (0,0,-5.5)
 z-12            E
```
- **Sockets:** s0 (3.23, 0, 4.45), s1 (5.23, 0, −1.70), s2 (0, 0, −5.5), s3 (−5.23, 0, −1.70), s4 (−3.23, 0, 4.45). Adjacent sockets are 6.47 m apart. A gallery socket g0 sits at (0, 2.3, 11).
- **Live bells:** climb 1 uses s2, s0 and s4 (all on the ground, reachable at rank I). Seeded climbs pick 3 of the 6 sockets.
- **Gallery:** 14 pots on the ledge; stone stairs at x = ±11 give a slow rank-I route.

**Monster and cue.** The **Bell-Golem**: 3.2 m, a bronze bell body on two stubby legs, clapper fists, two lamp eyes.
- **Moves** at 1.2 m/s toward the loudest noise heard in the last 3 s (§2.3); otherwise it wanders.
- **The Look** (the cue) comes every 7–10 s (seeded). Its eyes ramp from dim to **amber `#FFB000` over 2.0 s** while its hum rises a fifth. Then the eyes blaze for a **2.5 s Look**.
- **Seen.** During the Look, any frog moving faster than 0.3 m/s, or starting a hop, lash, croak or shove, is seen. The golem claps: a bronze ring-wave reaches each seen frog for **−1 spot** and 4 m/s knockback. Frogs within 2 m of a seen frog are knocked back 3 m/s but lose no spot.
- **Lag fairness.** A frog is seen only after moving for ≥ 0.15 s inside the Look, measured after an RTT/2 allowance (≤ 150 ms).
- **Swipe.** A frog within 2 m of it for 1 s gets swiped: a 0.6 s tell (an arm rises), then −1 spot and 6 m/s knockback.

**Rule:** `[ CLEAR ] Ring 3 bells. When its eyes glow, freeze.` · Sealed/Hell: `Ring 3 █████. ████ ███ eyes ████, █████.`

**Clear.** 3 live bells rung. A bell rings from a croak under the toll rule (§2.1) or from a prop ≥ 1 kg hitting it at ≥ 4 m/s. A rung bell glows gold and stays rung. After the third, the golem sits, rings itself three times, softly, and **falls asleep**.

**Fail.** Hard timer 120 s, or every frog Dark. Lengths: target 60 s, soft 90 s, hard 120 s.

**Hidden clear: "One croak."** A croak from inside the gold circle rings **every** live bell within its radius (EchoSpot). If it rings all 3 at once, the golem sits at once: ×2.
- The bells are 5.5 m from the circle, so it needs **Croak II (6 m)**. It can't happen at door 2 of climb 1 (Croak I, 4 m); it can at the door-18 Rematch.
- It also completes the Echo Toad secret quest (ring 3 bells with one croak).
- Hint (Rank A talent): "The gold circle remembers every bell."

**Twists** (seeded climbs):
- **A `crooked_bell`:** a 4th bell with a bent crown, 40% desaturated. Ringing it un-rings the last rung bell and triggers a Look with a short 1.0 s tell.
- **B `double_look`:** every second Look is followed by another 0.8 s after it ends. The tell is the eyes flickering twice during the wind-up.

**Rank lanes.**

| Rank | Hop | Tongue | Croak |
|---|---|---|---|
| II | Gallery ledge (`ledge.II` 2.3 m): socket g0 and a safe loop | Beam anchor (0, 4.5, 0): swing across the golem's path | 6 m: ring from outside swipe range; **hidden clear from the gold circle** |
| III | Air Hop across the 6.5 m gallery gap | Long Tongue spits a pot at a bell from 6 m (12 m/s) | Twin Toll rings two adjacent bells from their midpoint (3.2 m each) |
| IV | Landing stomp pops bell-beetles within 3 m | 8 m chain from beam to gallery | **Thunder Croak staggers the golem 2 s and cancels a Look** |

**Mites and loose.** Bell-beetles, 4 per frog, that clink as they crawl (moving to pop them during a Look is the temptation). 14 pots hold the other 4 per frog.

**Shared fate.** The clap's 2 m knockback ring, and the noise: every bell rung turns the golem toward the ringer, across everyone's path.

**Betrayal hook.** None (♠ rule door). Mischief: shoving a friend into motion during a Look gets them clapped. Blame tag (friends only): "Made to fidget: Vex."

**Power moment.**
- **Door 2:** on clear, Shatter Croak is granted, and the 14 pots are still standing. One croak bursts them all and fireflies rain down (FO §6.1, 2:00).
- **Door 18 Rematch:** Thunder Croak cancels its Look, Twin Toll rings two bells per croak, or one croak from the gold circle ends it. `OLD TIME 1:12 → 0:18`.

**Scaling.**

| n | Look every | Tell | Golem speed |
|---|---|---|---|
| 1–2 | 9–12 s | 2.5 s | 1.0 m/s |
| 3–5 | 7–10 s | 2.0 s | 1.2 m/s |
| 6–8 | 7–10 s | 2.0 s | 1.4 m/s (the crowd is the danger) |

Hard: +1 skull, tell ×0.7 (1.4 s), Look 3.0 s. Hell: redacted rule and both Twists.

**BotPlan.**
- *Roles:* Ringer ×3 (nearest bot per bell), Caller (Brother Brass: "Freeze!" as the eyes start to glow), Catcher (Moss).
- *Explore:* bots croak at bells from 5 m (out of range) and pop beetles during the first Look. **Kestrel gets clapped:** "That was on purpose."
- *Theorise:* walk to within 3 m of a bell; freeze on the tell at 70% reliability.
- *Execute:* ring, freeze, ring. The third bell (the key action) waits for the 90 s guard.
- *Director beat (climb 1):* Moss stays within 3 m of the human. If the human's spot is knocked out, Moss tongue-catches it ("Got it!"); if not, Kestrel is clapped and Moss catches his.

**Rewards.** Clear 18 + 2d, loose 8. Prize: Boon (Body family). Climb 1: **Shatter Croak** is always the grant. `[ BOON ] Shatter Croak. Because: you froze while it looked.`

**Bestiary page: The Bell-Golem.**
- Death tip: "It can't hit a statue. Its eyes warn you two seconds early." (It highlights "When its eyes glow, freeze.")
- Hidden line: `Hidden clear: ??? — the gold circle remembers every bell.`
- Entry: "Cast for the first well. Every bell it hears reminds it that it is only a bell. Three, and it remembers enough to sleep."

**System.**
- Enter: `[ DOOR 2 · THE BELL-GOLEM ] It hears everything. It sees fidgeting.` then the rule.
- Bell: `[ BELL 1/3 ]`
- First clap per frog: `[ CLAPPED ] You moved. It noticed.`
- Dark: `[ DARK ] Statues don't fidget. You did.`
- Clear: `[ CLEARED ] It remembered it's only a bell. It's asleep.`
- Fail: `[ FAILED ] The bell keeps ringing without you.`
- Hidden: `[ NOTED ] That was not the intended solution. Keep it.` then `[ HIDDEN CLEAR ] One croak. Three bells.`

**Audio.**
- Hum: a sine drone at the pitch of the last bell rung, rising a fifth on the tell.
- Bells are tuned to the Well's F pentatonic (F G A C D, one pitch per socket).
- The tension layer (low kalimba pulses) **drops to silence during every Look**; the eyes are its visual twin.
- The clap is a bronze gong with 80 ms hitstop and a Cinemachine Impulse.

**Unity.**
- `Room_bell_golem.prefab` on `shell_belfry_r12`.
- `BellGolemBrain : MonsterBrain`: states `Wander, LookTell, Look, Swipe, Sleep`, plus `RaftMode` and `CameoMode` flags for the Keeper and Warden. NetworkVariables `State`, `StateTime`, `LookSeed`.
- `Bell` ×6 (live mask in `RoomState.Flags` bits 8–13, rung bits 0–5), `EchoSpot gold_circle`, `Pot` ×14, `MiteSpawner(bell_beetle)`, `Anchor` beam, `RankLedge` gallery, `RankGap` gallery break.
- `FrogMotionProbe`: host-side per-seat velocity and verb events, sampled during a Look.
- **Test hook:**
  - `SolveObvious`: bots stand at bells, freeze on `LookTell`, croak after each Look;
  - `SolveHidden`: the fixture sets one bot to Croak II and croaks in the gold circle;
  - `ForceFail`: bots move constantly.
  - Assert the clear fires in ≤ 120 s, `[ NOTED ]` fires on the hidden path, and Shatter Croak is granted in climb-1 mode.

**Tags.** wish `weird_clear_monsters`, `increasing_powers`, `feel_progress`; homage `doors_one_rule`.

---

#### `heron_shadow` · ♠ A rule · 1 skull · 3A; band 2–12 · [MUST-A] · S

*"Something enormous fishes the well from above. You only ever see its shadow, and its beak."*

**Layout.** A flooded channel 30 × 10 m, water 0.3 m deep (wading is ×0.8, so 4 m/s), under a roof crack 30 m long that lets in pale moonlight `#CFE3FF`.
```
 z+15   [B]   X          B far bell on a post (0,0,14); X exit (0,0,15)
        (7)  :           ( ) pad canopies: giant lily pads on 1.2 m stalks,
     @ (6)   :=            canopy r 1.4 m, shelter <= 3 frogs
       (5)   :=          = rank ledge (ledge.II 2.3 m) with an overhang (counts
     @   (4) :=            as cover), x = +5, z -8..8
       (3)   :=          @ root anchors at 4.5 m on the x = -5 wall, every 4 m
     @   (2) :
       (1)   :           S sluice bells, a pair at (+-2.5,0,-13), 5 m apart
 z-15  S  E  S
```
Canopies at z = −10, −6, −2, 2, 6, 10, 13, alternating x = ±2.

**Monster and cue.** **The Heron**, never fully seen: its shadow, its legs, and a beak that stabs through the light.
- **Cue, 3.0 s ahead:** wingbeats from the pass's start end (positional), the moonlight dims 30%, and 3 glowing white feathers `#F4F8FF` drift down.
- **Pass:** an 8 m-wide shadow band sweeps the channel along z at 8 m/s (about 4 s end to end). A frog in the band and not under cover is **beak-stabbed**: −1 spot, lifted 2 m and dropped (a comic dangle).
- Passes come every 9–12 s.

**Rule:** `[ CLEAR ] Reach the far bell. When the shadow falls, be under a lily pad.` · Sealed: `Reach ███ far ████. ████ ███ shadow █████, ██ █████ █ ████ ███.`

**Clear.** The far bell rung (croak within radius, or a spat prop). One ringer clears everyone.
**Fail.** Hard 120 s, or all Dark. Target 55 s.

**Hidden clear: "The feather."** During the second pass, one feather falls into the open at a seeded point. Tongue it before it touches water: the heron is spooked, never returns, and the far bell rings itself. ×2.
- Tongue I (3 m) means leaving cover; **Long Tongue (6 m) reaches it from under a canopy**.
- Hint: "It drops something it can't bear to lose."

**Twists.**
- **A `return_pass`:** passes alternate direction; the wingbeats come from the far end.
- **B `sinking_canopy`:** 2 seeded canopies sink after 4 s of shelter. Their stalks sway for 1.5 s first.

**Rank lanes.**

| Rank | Hop | Tongue | Croak |
|---|---|---|---|
| II | The ledge with overhang cover: skip the water entirely | Root anchors: swing canopy to canopy | Ring the far bell from 6 m (from the z 8 canopy) |
| III | Air Hop from the ledge end to the bell platform (6.8 m) | **Long Tongue takes the feather from cover** (hidden clear); 2 striders at once | **Twin Toll rings both sluice bells**: the channel drains, and everyone wades at full speed (5 m/s) |
| IV | Stomp pops striders within 3 m | 8 m chain along the roots to the bell in one pass | Thunder Croak at the light slot stalls the shadow 2 s |

The sluice pair also opens for 2 frogs croaking within 0.3 s at rank I–II: a co-op option before Twin Toll.

**Mites.** Water-striders, 4 per frog, skate the channel; a cloud drifts under each canopy.

**Shared fate.** A canopy shelters 3. **A 4th frog under it bends the stalk and tips the pad up, exposing all four.** Crowding is your problem.

**Betrayal hook.** None. Mischief: shoving someone out of cover; blame tag "Shoved into the shadow: Vex."

**Power moment.** A Long-Tongue snatch of the feather from cover, and the heron never comes back. At rank III, one Twin Toll drains the channel for the whole party.

**Scaling.** n 1–3: passes every 12–14 s. n 4–8: 9–12 s. Hard: tell 2.1 s, sweep 10 m/s.

**BotPlan.**
- *Explore:* bots wade in the open and get stabbed. **Kestrel:** "Watch this!", then he's dangled.
- *Theorise:* move canopy to canopy on the tell; ping empty canopies.
- *Execute:* one bot heads for the bell; ringing it waits for the 90 s guard.

**Rewards.** Rule yields; Boon (Body).

**Bestiary page: The Heron.**
- Tip: "Its wings warn you three seconds early. Under a pad, you're a lily."
- Hidden line: `Hidden clear: ??? — it drops something it can't bear to lose.`
- Entry: "It fishes the Well from the sky. Nobody has seen more of it than a shadow and a beak. Some day it will be the Sky's problem." (It foreshadows the Sky Warden, the thunderhead heron.)

**System.**
- Enter: `[ DOOR 3A · HERON SHADOW ] Something up there is fishing.`
- First stab: `[ SNAGGED ] You were the fish.`
- Dark: `[ DARK ] Should have been a lily.`
- Clear: `[ CLEARED ] It found easier fish.`
- Fail: `[ FAILED ] The heron ate well tonight.`
- Hidden: `[ NOTED ] …` then `[ HIDDEN CLEAR ] You kept its feather. It won't be back.`

**Audio.** A low wing *whoomph* with Doppler (visual twin: the light dims and feathers fall); music drops to a heartbeat during the tell; the sluice drains with a gurgle.

**Unity.** `HeronBrain` drives a `SweepHazard` (a decal projector plus a hazard volume; `NetworkVariable<half> Progress`, `<byte> Dir`); `HideVolume` ×7 (capacity 3, `<byte> Load`); `WaterVolume` (0.3 m, ×0.8, drainable); `Bell` far + sluice pair; `Anchor` ×6; `RankLedge`; `MiteSpawner(strider)`; `FeatherPickup` (a `HiddenClearTrigger` on tongue contact before its y reaches 0.3).
- **Test hook:** obvious (canopy-hop on tells, ring), hidden (the fixture sets Tongue III and tongues the feather from a canopy), fail.

**Tags.** wish `weird_clear_monsters`, `frog_well_sky_space`; homage `doors_rush`.

---

#### `lily_raft` · ♣ C rule · 2 skulls · 3C; band 2–14 · [MUST-A] · M

*"A lily-pad raft on black water, and a pike that hates slopes."*

**Layout.** A black lake 44 × 18 m. The start dock is at z −20 and the far pad (dock) at z +20. Reeds line both banks every 4 m at x = ±7. Checkpoint pads sit at z −8, 4 and 14.
```
 z+20  ====[ far pad ]==== X
   r                         r    r reeds (anchors) every 4 m at x = +-7
   r        ( raft )         r    raft: lily disc r 2.5 m, rim 0.4 m above water,
   r   <~~ current 0.8 m/s   r      drifting up a centre spline (+-2 m)
   r   c        ~        c   r    c checkpoint pads (z -8, 4, 14)
 z-20  ====[ start dock ]== E
```

**The raft** (host physics, no buoyancy rigidbody; plan_2):
- **Tilt** θ = clamp(0.9° × Σ wᵢ·rᵢ, 18°), where rᵢ is each weight's offset from the centre in metres and every frog weighs 1 unit (the fairness contract).
- **A charged-hop landing** adds a +2-unit spike for 0.5 s at the landing point. That is the "fat frog jumps on" gag, and anyone can do it.
- **Tilt > 10°:** frogs within 0.5 m of the low edge slide off into the water.
- **Capsize:** tilt ≥ 18° for 1.5 s flips the raft. Everyone falls in, and the raft rights itself at the last checkpoint after 4 s.
- **The low edge's rim glows amber** whenever tilt > 6° (the visual twin of the creak).

**Monster and cue.** **The Pike.** A glowing lime **V-ripple `#7CFFB2`** approaches from the side the raft leans toward, **2.5 s** before the leap.
- If tilt > 6° toward that side when it arrives, it bursts across the low edge: frogs within 1.5 m of the edge lose 1 spot and go in the water.
- If the raft is level, it bumps harmlessly and circles off.
- It visits every 8–11 s.

**Rule:** `[ CLEAR ] Ride to the far pad. The pike leaps at the low side.` · Sealed: `Ride ██ ███ far ███. ███ pike █████ ██ ███ ███ ████.`

**Clear.** The raft docks at the far pad with ≥ ceil(n_alive / 2) frogs aboard; swimmers are carried in by the current. **Fail.** Hard 150 s, or all Dark. Target 80 s.

**Swimming.** Frogs in the water swim at 2 m/s and climb back aboard with a tap hop within 1 m of the rim.

**Paddling.** Tonguing a reed within reach pulls the raft 1.5 m toward it along the current: a paddle stroke.

**Hidden clear: "Dry feet."** Dock with **no frog ever having touched the water**. ×2. Hint: "Nobody got their feet wet."

**Twists.**
- **A `log_rider`:** at z 0 a mossy log (2 units, 20 kg `Carryable`) drops onto the raft at a seeded offset. Balance it or tongue it off.
- **B `twin_pikes`:** a second pike with a cyan ripple `#4DE8FF`. Both can come at once, but only the low side is leapt.

**Rank lanes.**

| Rank | Hop | Tongue | Croak |
|---|---|---|---|
| II | From the water, a charged hop (2.4 m) back onto the rim, no help needed | Grapple a reed (4.5 m) to haul yourself from the water back aboard | 6 m croak staggers the pike 1 s (it counts as small) and cancels its leap |
| III | Air Hop over the pike's leap | **Long Tongue paddles two reeds at once** (a double stroke) | Twin Toll's knockback shoves the ripple 3 m off course |
| IV | Stomp pops dragonflies within 3 m | 8 m reed chain: the raft races | Thunder Croak staggers it 2 s |

**Mites.** Dragonfly mites hover 1–2 m above the water, 4 per frog; one cloud rides the raft.

**Shared fate.** The tipping raft: everyone's position is everyone's problem.

**Betrayal hook.** None. Mischief: leaning on purpose. Blame tag: "Sank the raft: Pip."

**Power moment.** At rank III a frog Air-Hops over the pike while double-paddling; the Rivals gasp.

**Scaling.** n 1–3: tilt gain 1.4°/unit·m (each body counts more), pike every 10–13 s. n 4–8: 0.9°. Hard: ripple 1.75 s.

**BotPlan.**
- *Explore:* bots bunch on one side (the canonical mistake).
- *Director beat, climb 1 at ~2:40:* **Kestrel's charged landing on the rim tips it;** the pike takes him. "That was on purpose."
- *Theorise:* after the first leap, bots spread to cancel torque (host computes the counter-positions).
- *Execute:* bots balance and ping the centre; Pell paddles.

**Rewards.** Rule yields; Boon (Chorus).

**Bestiary page: The Pike.**
- Tip: "It only leaps at the low side. Keep the raft flat and it just sulks."
- Hidden line: `Hidden clear: ??? — nobody got their feet wet.`
- Entry: "It has circled the bottom of the Well since before the first frog. It isn't hungry. It just can't stand a slope."

**System.**
- Enter: `[ DOOR 3C · LILY RAFT ] Everyone on. Evenly.`
- Overboard: `[ OVERBOARD ] The raft had opinions.`
- Capsize: `[ CAPSIZED ] Somebody leaned.`
- Dark: `[ DARK ] Sunk.`
- Clear: `[ CLEARED ] Docked. The pike sulks.`
- Fail: `[ FAILED ] The raft went on without you.`
- Hidden: `[ NOTED ] …` then `[ HIDDEN CLEAR ] Dry feet all the way.`

**Audio.** Water lapping; a raft creak pitched by tilt (visual twin: the amber rim); the ripple's rising hiss, positional.

**Unity.**
- `Raft` (kit): the host sums torque at 50 Hz, then `NetworkVariable<half> TiltX`, `TiltZ`, `Progress`. Clients interpolate. Frogs on the raft move in raft space (platform parenting in the character controller).
- `PikeBrain` (approach, leap, sulk); `Anchor` reeds; `WaterVolume` with a current; `Checkpoint` ×3; `MiteSpawner(dragonfly)`.
- This is the M0 netcode proof-of-concept case (D §7). Fallback: host-owned raft with client visual smoothing.
- **Test hook:** obvious (bots place by the torque solver), hidden (bots never enter the water and paddle), fail (all to one side until the timer).

**Tags.** wish `team_up`, `teambound_modes`, `weird_clear_monsters`; homage `tb_downstream`.

---

#### `fog_stair` · ♦ B rule · 1 skull · short (≤55 s) · 5B; band 3–14 · [MUST-A] · S

*"A foggy cistern, a spiral stair, and an eel that only bites what the lantern-fish light."*

**Layout.** A cistern 14 × 14 m with 9 m walls. A 1.2 m stone stair spirals clockwise up the walls from (−6, 0, −6) to the exit ledge at (6, 6, 6), about 36 m of stair. Fog limits sight to 5 m (`#9FB3C8`, 20% density). The floor is shallow water, so falls cost no spot.
```
 z+7   ####X######      X exit ledge (6,6,6)
       #h  . . . h#     h eel holes, 8 along the stair
       #.   @    .#     @ central chain with anchors every 3.5 m from (0,4.5,0) up
       #h  ::::  h#     :::: invisible glass ramp (hidden), (-6,0,5) -> (6,6,6), 17 deg
       #=    L   .#     = the Hop II shortcut (ledge.II 2.3 m) between stair turns
       #h. . . . h#     L lantern-fish orbits (3)
 z-7   #E#########
```

**Monster and cue.** **The Fog Eel**, blind; the lantern-fish are its eyes.
- **Lit.** Three **lantern-fish** drift on slow orbits, each throwing a 2 m cone of light `#FFF1B8`. A frog inside a cone is **lit** (bright outline).
- **Cue.** When a frog has been lit for 0.8 s within 3 m of a hole, that **hole's rim glows cyan `#4DE8FF` for 1.5 s** with a gurgle.
- **Lunge:** −1 spot, and the target plus anyone within 1.2 m behind it on the stair are knocked off (a domino) into the water below. Climb again from the start.

**Rule:** `[ CLEAR ] Reach the top. The eel lunges at whoever is lit.` · Sealed: `Reach ███ top. ███ eel ██████ ██ ███████ ██ lit.`

**Clear.** Crossing clear at the exit ledge. **Fail.** Hard 100 s, or all Dark. Target 45 s, soft 55 s.

**Hidden clear: "Walked on nothing"** (TTITH floor 3: "you cleared it in a weird way"). An **invisible glass ramp** runs straight across the room's centre, away from every hole.
- The fog hides it, but **firefly clouds flow around it** like water around a post, and the fireflies never cross it.
- Any frog reaching the top by the ramp fires the hidden clear: ×2. The Third Eye Boon outlines it.
- Hint: "The fireflies know a way you can't see."

**Twists.**
- **A `lantern_swarm`:** 5 lantern-fish in a school, 30% faster.
- **B `moving_eel`:** only 4 holes are live per 10 s; a ripple in the wall shows where the eel is.

**Rank lanes.**

| Rank | Hop | Tongue | Croak |
|---|---|---|---|
| II | **The 2.3 m shortcut skips a quarter of the spiral.** This is D §5's door-5 beat: "the numbers bind" | Grapple the chain anchor (0, 4.5, 0) and swing past a lit stretch | A 6 m croak scatters lantern-fish for 3 s |
| III | Air Hop across the fog from the first turn to the third (6.8 m) | Long Tongue grabs 2 lantern-fish and holds them pointing away (a torch) | Twin Toll's knockback shoves 2 fish 4 m away |
| IV | Stomp pops fog moths within 3 m | 8 m chain up the central chain anchors: top in one go | Thunder Croak staggers every eel hole within 9 m for 2 s |

**Mites.** Fog moths, 4 per frog, flutter toward the lantern-fish (chasing them gets you lit).

**Shared fate.** The narrow stair: a lunge dominoes everyone within 1.2 m behind the target.

**Power moment.** Door 5 of climb 1: you got HOP II at door 3, and here a 2.3 m ledge you couldn't reach two minutes ago cuts the climb in half.

**Scaling.** n 1–3: 2 lantern-fish. n 4–8: 3. Hard: cue ×0.7 (1.05 s).

**BotPlan.**
- *Explore:* bots climb straight through the light and get lunged. Kestrel's fall dominoes Pip.
- *Theorise:* wait in the dark for the fish to pass.
- *Director beat (climb 1):* **Pell pings the 2.3 m ledge.** A lane hint, not the key action.
- *Execute:* timed dashes.

**Rewards.** Rule yields; Boon (Sight).

**Bestiary page: The Fog Eel.**
- Tip: "It only bites what the lantern-fish light. Wait in the dark, then go."
- Hidden line: `Hidden clear: ??? — the fireflies know a way you can't see.`
- Entry: "Blind as a stone. The lantern-fish are its eyes, and they aren't even friends."

**System.**
- Enter: `[ DOOR 5B · FOG STAIR ] Mind the step. Mind the light.`
- First lunge: `[ LIT ] You were the brightest thing on the stairs.`
- Dark: `[ DARK ] Spotlight, eel, you.`
- Clear: `[ CLEARED ] Up and out. The eel sulks in the fog.`
- Fail: `[ FAILED ] The fog kept you.`
- Hidden: `[ NOTED ] …` then `[ HIDDEN CLEAR ] You walked on nothing. The fireflies told you.`

**Audio.** Drips; the eel's wet gurgle from the lit hole (positional; visual twin: the cyan rim); the lantern-fish hum a soft sine.

**Unity.** `FogEelBrain` (hole choice, lunge); `LanternFish` ×3 (kinematic orbits from server time; `LitSensor`: the host cone-tests each seat at 20 Hz); local height fog (09 owns the shader); `GlassRamp` (collider plus an outline shown only with Third Eye); a client-side firefly flow field that steers around the ramp capsule, deterministic from the seed; `RankLedge`; `Anchor` chain; `MiteSpawner(fog_moth)`.
- **Test hook:** obvious (wait for dark, climb), hidden (walk the ramp), fail.

**Tags.** wish `weird_clear_monsters`, `ttith_brutal`, `increasing_powers`; homage `ttith_floor3`.

---

#### `snapper_crossing` · ♣ C rule · 2 skulls · short (≤55 s) · 5C; band 3–14 · [MUST-A] · M

*"Two frogs, one egg, and an old turtle who bites whatever is fastest."*

**Layout.** A mud flat 26 × 14 m. The snapper's pool (r 3 m, 1 m deep) sits at the centre.
```
 z+13  ####X####          X exit; N nest in a reed ring (0,0,11)
       #   N   #
       #=  .   #  r       = rock shelf (ledge.II 2.3 m) along x = -6, z -6..6,
       #=  ( S )   r        out of bite reach (4 m from the pool centre)
       #=  .   # g        S snapper pool r 3 m; routes around it at x = +-4.5
       #   .   #  r       r reeds (anchors 4.5 m) along x = +6
       # g [e] #          g grub mounds (5,0,-6) and (-6,2.3,0); [e] egg pad (0,0,-10)
 z-13  ####E####
```

**The egg.** A `Carryable`, 12 kg, fragile: it cracks on any fall over 1 m, and 3 cracks break it (a new egg drops onto the egg pad after 3 s).
- **Two carriers** (both tongue-holding it) move at 2.0 m/s; **one carrier** drags it at 1.0 m/s, wobbling.
- A carrier can toss it up to 3 m. Tongue-catching it before it lands prevents the crack.

**Monster and cue.** **The Snapper.**
- Every 0.5 s it picks the **fastest-moving thing** within 8 m of its pool that is moving faster than 1.0 m/s: frogs, mites, props, eggs.
- **Cue: its shell ridges glow orange `#FF8A3D` and its head swivels onto the target for 1.5 s.** Then it snaps (reach 4 m from the pool centre) at the target's position.
- A bitten frog loses 1 spot. A bitten carrier drops the egg (a crack). A spat mite gets eaten.

**Rule:** `[ CLEAR ] Carry the egg to the nest. It bites the fastest thing moving.` · Sealed: `Carry ███ egg ██ ███ nest. ██ █████ ███ fastest █████ ██████.`

**Clear.** The egg is in the nest. **Fail.** Hard 100 s, or all Dark. Target 50 s, soft 55 s.

**Hidden clear: "Full."** It snaps 3 airborne mites (spat bait) within 20 s and falls asleep before the egg arrives. ×2. Hint: "It's never been full before."

**Twists.**
- **A `moving_nest`:** the nest sits at a seeded bank position instead of z 11.
- **B `mud_patches`:** 4 mud patches slow frogs to 2 m/s, so bait-running is harder.

**Rank lanes.**

| Rank | Hop | Tongue | Croak |
|---|---|---|---|
| II | Shelf (2.3 m): bait-runners race along it out of reach | **Reed grapple: a bait frog zips at 8 m/s**, the fastest thing in the room | 6 m croak staggers the snapper 1 s |
| III | Air Hop over a snap | **Long Tongue holds the egg and a mite at once**: carry and bait with one frog | Twin Toll's knockback flings mites into the air: instant bait |
| IV | Stomp pops grubs into the open | 8 m chain along the reeds | Thunder Croak staggers it 2 s |

Croak I stuns grubs so they can be picked up.

**Mites.** Grubs, 4 per frog: slow crawlers until spat (spit launches them at 5 m/s, or 12 m/s with Long Tongue).

**Shared fate.** The fragile egg needs two carriers, so drops are everyone's.

**Betrayal hook.** None. Mischief: running past the carriers to draw a bite onto them. Blame tag: "Drew the bite: Kestrel."

**Power moment.** One rank-III frog carries and baits at once while the Rivals stare; or a reed grapple at 8 m/s makes you the perfect decoy.

**Scaling.** n 1–3: the egg can be carried by one frog at 1.5 m/s. n 4–8: as written. Hard: cue 1.05 s.

**BotPlan.**
- *Explore:* bots sprint past the pool (the canonical mistake: being fastest); one bot drags the egg alone at speed.
- *Theorise:* two carriers walk at ≤ 1.9 m/s; one bot spits grubs.
- *Execute:* 2 carriers plus 2 baiters. The egg entering the nest (the key action) waits for the 90 s guard unless a human is a carrier.

**Rewards.** Rule yields; Boon (Chorus).

**Bestiary page: The Snapper.**
- Tip: "It bites whatever is fastest. Be slow, and make something else fast."
- Hidden line: `Hidden clear: ??? — it's never been full.`
- Entry: "Old as the pool. It isn't guarding the nest; it's just very, very competitive."

**System.**
- Enter: `[ DOOR 5C · SNAPPER CROSSING ] Precious cargo. Slow feet.`
- Crack: `[ CRACK 1/3 ] Gently.`
- Egg lost: `[ EGG LOST ] Another one's coming. Somehow.`
- Dark: `[ DARK ] You were the fastest thing in the room. Congratulations.`
- Clear: `[ CLEARED ] Delivered. It'll hatch into someone else's problem.`
- Fail: `[ FAILED ] Nobody was slow enough.`
- Hidden: `[ NOTED ] …` then `[ HIDDEN CLEAR ] Fed and asleep. Nobody has done that before.`

**Audio.** A shell creak and jaw clicks during the cue (visual twin: the orange ridges); an egg-wobble tick while carried; the carriers' footsteps fall into a rhythm when in step.

**Unity.** `SnapperBrain` (fastest-mover pick from host velocities, props included via Rigidbody velocity); `Carryable` egg (`twoCarrier`: kinematic midpoint of two tongue tips; `<byte> Cracks`); `MiteSpawner(grub)` ×2; `RankLedge` shelf; `Anchor` reeds.
- **Test hook:** obvious (two carriers at 1.9 m/s, a baiter spits every 1.5 s), hidden (feed 3 mites), fail.

**Tags.** wish `team_up`, `teambound_modes`, `coop_time`; homage `tb_delivery`.

---

#### `echo_warren` · ♦ B rule · 2 skulls · 7B; band 5–19 · [MUST-A] · M

*"A pitch-black maze. Your croak draws the walls, and something underneath comes to see who croaked."*

**Layout.** A 24 × 24 m maze on a 12 × 12 grid of 2 m cells. Walls are **2.3 m tall** (exactly `ledge.II`) and 0.4 m thick. It is generated per seed as a perfect maze with 6 walls removed for loops. The entry is at (0, 0, −12) and the exit at (0, 0, 12). The Burrower's burrow is an open 4 × 4 m hollow at the centre.
```
 +--+--+--+--X--+--+     (illustrative 6x6 of the 12x12 grid)
 |  .     |     |  |     o glow-moths in dead-ends, >= 6 m apart
 +  +--+  +  +--+  +     [ ] the burrow at the centre
 |o |     |[  ]    |     E entry, X exit
 +  +  +--+  +--+  +
 |     |  .     | o|
 +--+  +--+--+  +  +
 |  o     |        |
 +--+--E--+--+--+--+
```
- **Total darkness** (ambient 0). Each frog is self-lit with a glow radius of 1.5 m + 0.1 m per Glow Level: **your growth literally lights the maze**.
- **3 glow-moths** (`#E6FF7A`) hide in seeded dead-ends. They glow faintly within 2 m and show as bright dots in croak outlines.

**Croak sonar.** A croak draws every wall within its radius as glowing outlines (`#6FA8FF`) for 4 s, visible to every frog within 12 m.

**Monster and cue.** **The Burrower**, a blind mole-toad under the floor.
- It tunnels toward **the position of the most recent croak** at 3 m/s.
- **Cue:** a line of glowing cracks `#FF9A4D` races across the floor toward the croak point with a rumble, and **1.5 s before it bursts, the floor there bulges and glows**.
- **Burst:** frogs within 1.5 m lose 1 spot and are tossed 2 m. It then sinks and waits.
- With no croak for 12 s, it hunts the loudest other noise.

**Moths.** Tongue a moth (reach per rank) and it perches on your back socket and brightens you. A frog hit while carrying drops its moth into an adjacent cell. When 3 are caught, they fly to the exit lantern and the exit opens.

**Rule:** `[ CLEAR ] Find 3 glow-moths in the dark maze. It hunts your last croak.` · Sealed: `Find 3 █████ ██ ███ dark ████. ██ █████ ████ last █████.`

**Clear.** 3 moths caught. **Fail.** Hard 150 s, or all Dark. Target 80 s.

**Hidden clear: "Home."** Croak from inside the burrow while the Burrower is at least 8 m away. It tunnels home, forgets why, curls up and sleeps. The walls sink 2 m (the maze flattens) and the moths fly to the nearest frogs. ×2. Hint: "Make it go home."

**Twists.**
- **A `shifting_walls`:** 4 seeded wall segments slide every 12 s, with a grinding and dust cue 1 s before.
- **B `echo_lag`:** it hunts the **second-to-last** croak; the crack line shows which.

**Rank lanes.**

| Rank | Hop | Tongue | Croak |
|---|---|---|---|
| II | **Hop II mounts the 2.3 m walls**: walk the tops (safe from bursts) and skip the maze | Ceiling-root anchors (4.5 m) over 6 junctions | 6 m sonar |
| III | Air Hop wall-top to wall-top across loops (6.8 m) | Long Tongue catches moths at 6 m, 2 at once | **Twin Toll chimes 2 moths** (moths are toll targets): each flies 2 cells toward you |
| IV | Stomp pops glow-grubs within 3 m | 8 m root chain across the maze | **Thunder Croak: 9 m sonar reveals most of the maze** and staggers a Burrower mid-burst for 2 s |

**Mites.** Glow-grubs on the walls, 4 per frog.

**Shared fate.** Sonar is shared: your croak lights the map for everyone within 12 m, **and paints the target on whoever stands near you**.

**Betrayal hook.** None. Mischief: croaking right next to a friend. Blame tag: "Croaked on you: Vex."

**Power moment.** A Hop II frog strolling along the wall tops of a maze the Rivals are lost in, or one Thunder Croak lighting the whole Warren.

**Scaling.** n 1–3: the Burrower moves at 2.5 m/s with a 2.0 s cue. n 4–8: 3 m/s, 1.5 s. Hard: cue ×0.7.

**BotPlan.**
- *Explore:* bots croak and stand still (the canonical mistake) and get burst.
- *Theorise:* croak, then move 2 cells away.
- *Execute:* split into search pairs; ping moth sightings; Pell: "Interesting." The third moth (the key action) waits for the 90 s guard.

**Rewards.** Rule yields; Boon (Sight).

**Bestiary page: The Burrower.**
- Tip: "It goes where you croaked, not where you are. Croak, then move."
- Hidden line: `Hidden clear: ??? — make it go home.`
- Entry: "The Warren is its ear. Every croak is a knock on its door, and it always answers."

**System.**
- Enter: `[ DOOR 7B · ECHO WARREN ] Lights out. Croak to see. It's listening.`
- First burst: `[ FOUND YOU ] It heard that.`
- Dark: `[ DARK ] You croaked and stayed put.`
- Clear: `[ CLEARED ] Three moths. One very confused mole.`
- Fail: `[ FAILED ] Lost in the Warren.`
- Hidden: `[ NOTED ] …` then `[ HIDDEN CLEAR ] It went home and forgot why.`

**Audio.** Croaks echo with long reverb (the Well's echo); the Burrower's sub-bass rumble is positional (visual twin: the crack line); moths chime the high pentatonic note.

**Unity.**
- `MazeGenerator` (seeded grid). Walls are **dynamic instanced `WallBlock` props on a baked floor**, so one shell serves every seed.
- Bots plan with a `GridPlanner` (BFS on the grid), not the NavMesh.
- `SonarPulse`: a global shader array of the last 8 pulses (`_SonarPos`, `_SonarTime`, `_SonarRadius`).
- `BurrowerBrain` (`NetworkVariable<Vector3> Target`, `State`); `Moth` ×3 (`TollTarget` + perch on the `IHeroBody` back socket); `Anchor` roots.
- **Test hook:** obvious (grid DFS with croak-then-move), hidden (croak in the burrow when the Burrower is ≥ 8 m away), fail.

**Tags.** wish `tower_dungeon_maze_layers`, `weird_clear_monsters`, `teambound_modes`; homage `tb_echo`.

---

#### `lamp_knight` · ♣ C rule · 2 skulls · 7C; band 5–19 · [MUST-A] · M

*"A lantern-headed knight that only falls when every lamp goes out in the same heartbeat."*

**Layout.** A round shrine, r 12 m, with a 1 m-high dais of r 3 m at the centre.
```
 z+12          X             L lamps on 1.4 m pedestals at r 8 m, 72 deg apart
         L1         L2         (adjacent lamps 9.4 m apart); lamp 3 stands on
                               a rank-II plinth (2.3 m) in some seeds
     L5     (dais K)     L3  K the Lamp-Knight's patrol ring on the dais
                             o an Echo Bell in a chalk circle beside each lamp
              L4             @ wire hooks (anchors) 4.5 m above each lamp
 z-12    C     E             C CountdownBell at the entry (0,1.5,-10)
```
Each lamp glows gold `#FFD76A`, and a glowing wire runs from it to the knight's back.

**Monster and cue.** **The Lamp-Knight**, 4 m, armoured, with a lantern head and a halberd. It patrols the dais ring at 2 m/s.
- **Swing cue: the halberd rises and its lantern flares white `#FFFFFF`, 1.2 s.** Then a 3 m arc: −1 spot, 6 m/s knockback.
- It swings at the most recent sour-noter within 10 m, otherwise at the nearest frog.

**Snuffing.** A croak snuffs lamps under the toll rule: the nearest 1 in radius, 2 from rank III.
- **A Harmony** is every lamp out within a **1.0 s window** (1.2 s when n ≤ 3). The knight kneels for 4 s and its lantern cracks; the lamps relight after 4 s.
- **A sour note** is a lamp snuffed outside a Harmony. It relights 1.0 s after that attempt's first snuff, and the knight turns on the sour-noter.
- **Echo Bells** (not toll targets, so they never steal a croak from a lamp). A tongue tap arms one (0.3 s). At the CountdownBell's **NOW**, each armed Echo Bell snuffs its lamp, then disarms. So a lone frog can arm four and croak the fifth itself (CRIT #18).
- **The sad-croak gag.** If exactly one frog croaks within 0.3 s of NOW while ≥ 2 lamps are unmanned and unarmed, the System says `[ ONE SAD CROAK ]` and the knight tilts its head at them. No hit, just shame.

**Rule:** `[ CLEAR ] Snuff all its lamps in one breath. Twice.` · Sealed: `Snuff ███ ███ lamps ██ ███ breath. █████.`

**Clear.** 2 Harmonies: it kneels and sleeps. **Fail.** Hard 150 s, or all Dark. Target 75 s.

**Hidden clear: "Visor down."** During a kneel, tongue-flip the knight's visor shut (a `Lever` on its helmet at 4.2 m). It can't see to relight, and it sleeps at once. ×2.
- Reach it with Long Tongue (6 m) from a lamp plinth, or by hopping onto the dais and using Hop II.
- Hint: "It can't relight what it can't see."

**Twists.**
- **A `wisp_relighter`:** a moth-wisp relights a random lamp every 8 s; tongue it to stop it.
- **B `lamp_cart`:** one lamp rides a cart around the outer ring at 0.5 m/s.

**Rank lanes.**

| Rank | Hop | Tongue | Croak |
|---|---|---|---|
| II | Reach the plinth lamp (2.3 m) | Wire hooks (4.5 m): lamp to lamp in 1 s | Snuff from 6 m, outside the swing arc |
| III | Air Hop over a swing | Long Tongue arms 2 Echo Bells at once, or flips the visor from 6 m | **Twin Toll snuffs 2 adjacent lamps from their midpoint** (4.7 m) |
| IV | Stomp pops lamp-moths within 3 m | 8 m hook chain | Thunder Croak snuffs 2 within 9 m and staggers the knight 2 s |

The **Chorus** Boon's synced croaks also stagger it for 2 s.

**Mites.** Lamp-moths, 4 per frog, circle the lamps (swatting them near a lit lamp risks a sour note).

**Shared fate.** The window: one early croak relights everything and draws the halberd onto the one who was early.

**Betrayal hook.** None. Mischief: a deliberate sour note. Blame tag: "Sour note: Kestrel."

**Power moment.** With Twin Toll, you and one Rival do what took five frogs. "Since when does your croak do *that*?"

**Scaling.** Always 5 lamps. n = 1: 5 Echo Bells, window 1.2 s. n 2–3: window 1.2 s. n 4–8: 1.0 s (spare frogs arm bells and bait the knight). Hard: window 0.8 s, swing tell 0.84 s.

**BotPlan.**
- *Roles:* Caller (Brother Brass rings the CountdownBell: "On three."), Snuffers (nearest lamp each), Armers (Echo Bells for unmanned lamps).
- *Explore:* bots croak at lamps one by one (sour notes). **Kestrel's lone croak** produces the sad-croak gag.
- *Theorise:* stand at lamps and wait for the bell.
- *Execute:* Brass rings once every lamp has a snuffer or an armed bell. Timing jitter N(0, 0.08 + (100 − Wit)/600) s (GDD §6.9). Harmony 2 (the key action) needs a human's croak inside it during the 90 s guard.

**Rewards.** Rule yields; Boon (Chorus).

**Bestiary page: The Lamp-Knight.**
- Tip: "Out of time is out of tune. Ring the bell, and croak on NOW."
- Hidden line: `Hidden clear: ??? — it can't relight what it can't see.`
- Entry: "It guards its lamps like a heartbeat. Put them all out in one breath and it kneels, remembering it is only a lantern stand."

**System.**
- Enter: `[ DOOR 7C · THE LAMP-KNIGHT ] It only listens to all of you at once.`
- First sour note: `[ SOUR NOTE ] Early. It noticed.`
- Harmony: `[ HARMONY 1/2 ]`
- Gag: `[ ONE SAD CROAK ]`
- Dark: `[ DARK ] Out of tune, out of spots.`
- Clear: `[ CLEARED ] It kneels. Perfect harmony.`
- Fail: `[ FAILED ] Out of time. Out of tune.`
- Hidden: `[ NOTED ] …` then `[ HIDDEN CLEAR ] Visor down. Lights out. Goodnight.`

**Audio.**
- Each lamp hums one pentatonic note; a Harmony plays the full chord (F A C D G) with a choir swell.
- A sour note is a flat semitone clash, with the sour-noter's Seat Hue flashing (visual twin).
- The CountdownBell ticks 3-2-1 with an on-screen count; the knight clanks, positional.

**Unity.** `LampKnightBrain` (patrol, swing, kneel; `State`, `TargetSeat`); `Lamp` ×5 (`TollTarget`, relight 1.0 s / 4.0 s); `EchoBell` ×5 (armed bits); `CountdownBell`; a visor `Lever` parented to the knight; `RankLedge` plinth; `Anchor` ×5.
- **Window fairness:** croak events carry the client input timestamp, and the host evaluates the window on those times, rewound by up to RTT/2 capped at 150 ms (FO §5.4), so latency never ruins a sync.
- **Test hook:** obvious (Wit-100 bots on NOW), hidden (visor flip during a kneel), fail (croak off-beat until the timer).

**Tags.** wish `team_up`, `teambound_modes`, `weird_clear_monsters`; homage `tb_echo`.

---

#### `snake_coil` · ♠ A rule · 2 skulls · 8A; band 3–19 · [MUST-A] · S

*"Lily pads over deep water, and a snake that strikes at every splash."*

**Layout.** A dark pool 28 × 14 m, 2 m deep. 16 pads (r 1.2 m) on a loose seeded grid, 2.2–2.6 m apart (inside `gap.I`).
```
 z+14  ===== far bank ===== X
        o  o   o  o   o          o pads (16; +4 at n >= 6)
         o   o  @    o           two 4.8 m gaps with no pads (gap.II) and
        o  o  [4.8]  o  o          one 6.5 m gap (gap.III)
          o  t   o   o           @ hanging roots (anchors 4.5 m) over the gaps
        o   o   [6.5]  o         t the snake's glowing tail tip (climb 1: (4,0,2))
 z-14  ===== start bank === E    p seed pods float in open water (6)
```
The snake is a 12 m water snake coiled on the pool floor.

**Splashes.** A splash is any frog or prop entering the water, a charged-hop landing on a pad (falling more than 1.9 m), or a **pad sinking: a pad holds one frog, and a second frog landing on it sinks it and both splash.**

**Monster and cue.** **The Coil Snake.** After a splash, **two emerald eyes `#3DFF9E` surface 2 m away and a glowing wake runs to the splash point for 2.0 s**. Then it strikes there (r 1.5 m): −1 spot and into the water, which is another splash. Swimmers move at 2 m/s and climb onto a pad with a tap hop.

**Rule:** `[ CLEAR ] Cross on the pads. It strikes whatever splashes.` · Sealed: `Cross ██ ███ pads. ██ ███████ ████████ splashes.`

**Clear.** Crossing clear at the far bank. **Fail.** Hard 120 s, or all Dark. Target 60 s.

**Hidden clear: "Ouroboros."** Tongue its glowing tail tip and drag it 3 m toward its head while the head is surfaced after a strike (1.5 s). It bites its own tail and naps. ×2.
- Climb 1's tail sits 3 m from pad 9, so Tongue I can do it, but **Long Tongue (6 m) makes it easy**: D §5's "chance at the first hidden clear" at door 8.
- Hint: "Give it something it can't resist: itself."

**Twists.**
- **A `ripple_pads`:** a landing rocks pads within 2.5 m for 1 s; hopping off a rocking pad splashes.
- **B `lily_bloom`:** 4 pads are closed flowers that open only when croaked at.

**Rank lanes.**

| Rank | Hop | Tongue | Croak |
|---|---|---|---|
| II | Charged Hop II across a 4.8 m gap | Roots (4.5 m) swing across the gaps | **A croak sinks a seed pod up to 6 m away: a decoy splash** that pulls the strike off your friends |
| III | Air Hop across the 6.5 m gap | Long Tongue grabs the tail from 6 m, or 2 pods | Twin Toll sinks 2 pods: 2 decoys |
| IV | A charged 3.0 m hop clears 5.8 m without a splash | 8 m root chain | Thunder Croak staggers the surfaced head 2 s: an easy tail-bite window |

Croak I sinks pods within 4 m.

**Mites.** Water-striders on the pads, 4 per frog.

**Shared fate.** One frog per pad. Doubling up sinks both; the strike then hits both.

**Betrayal hook.** None. Mischief: hopping onto an occupied pad. Blame tag: "Sank the pad: Pip."

**Power moment.** Door 8 of climb 1: your fresh Long Tongue snatches the tail from 6 m and the System stamps `[ NOTED ]`.

**Scaling.** n 1–3: strike delay 2.5 s. n 4–8: 2.0 s. At n ≥ 6, 4 extra pads (20). Hard: 1.4 s.

**BotPlan.**
- *Explore:* two bots land on the same pad and sink it.
- *Theorise:* wait for a free pad; ping it.
- *Execute:* cross in a line; one bot sinks decoy pods. Kestrel belly-flops once (the Director's funny failure).

**Rewards.** Rule yields; Boon (Body).

**Bestiary page: The Coil Snake.**
- Tip: "It hunts splashes, not frogs. One frog per pad, and never jump in."
- Hidden line: `Hidden clear: ??? — give it something it can't resist.`
- Entry: "It has chased ripples so long it forgot it has a tail."

**System.**
- Enter: `[ DOOR 8A · SNAKE COIL ] Quietly. One per pad.`
- First strike: `[ SPLASH ] It heard that.`
- Pad sunk: `[ SUNK ] One pad, one frog.`
- Dark: `[ DARK ] Splashed out.`
- Clear: `[ CLEARED ] Across, and barely a ripple.`
- Fail: `[ FAILED ] The pool keeps what splashes.`
- Hidden: `[ NOTED ] …` then `[ HIDDEN CLEAR ] It bit itself. It's napping. Tell no one.`

**Audio.** Each pad plops its own pentatonic pitch when landed on; the wake hisses, positional (visual twin: the glowing wake); a glassy chime as the eyes surface.

**Unity.** `SnakeBrain` (subscribes to `WaterVolume.OnSplash`; wake path; strike); `Pad` ×16–20 (capacity 1, sink on 2); `SeedPod` ×6; `TailLever` (tongue-drag along a spline, `<half> TailPull`); `Anchor` roots; `RankGap` ×3; `MiteSpawner(strider)`.
- **Test hook:** obvious (one per pad, in turn), hidden (tail drag at the surfacing), fail.

**Tags.** wish `weird_clear_monsters`, `increasing_powers`; homage `doors_one_rule`.

---

#### `moss_snail` · ♦ B rule · 2 skulls · climb-2 debut (doors 3–9); band 3–19 · [MUST-B] · S

*"Slow as moss, until you blink. Nobody has ever seen it move."*

**Layout.** A mossy grotto 22 × 16 m, dim green light, 6 stone columns that block sight.
```
 z+8   ####[B  B  B]##X     B bells on a shelf at 2.3 m (ledge.II):
       #  /  @   @  \  #     (-4,2.3,7), (0,2.3,7.5), (4,2.3,7); ramps (/ \) at x = +-9
       #  |   ( S )    |#     S the snail's start (0,0,2); @ anchors 4.5 m over the shelf
       # I      I     I #     I columns (6)
       #  (m)          #     (m) still mirror pool r 1.5 m, seeded (climb 2: (-6,0,-2))
 z-8   #######E########
```

**Monster and cue.** **The Moss Snail**, a 2 m shell with a teal glyph.
- **It moves only while no frog watches it.** A frog watches if the snail is within 30° of that frog's **facing** (not the camera), within 20 m, with line of sight.
- Unwatched, it glides at 6 m/s toward the nearest frog.
- **Cue:** the instant nobody watches, its **shell glyph flares teal `#3DFFD0`** and a wet slither rises (positional). A teal moss vignette flashes on the screen edge of any frog it's approaching within 8 m.
- **Touch:** −1 spot, and the frog is slimed (stuck 3 s).

**Rule:** `[ CLEAR ] It only moves while nobody watches it. Ring the 3 bells behind it.` · Sealed: `██ only █████ █████ ███████ watches ██. Ring ███ 3 █████ ██████ ██.`

**Clear.** 3 bells rung. **Fail.** Hard 130 s, or all Dark. Target 70 s.

**Croaks ring behind your back.** A croak is omnidirectional, so a frog can stare the snail down and ring bells behind it. The croak radius is the whole game here.

**Hidden clear: "Mirror."** Lure it (everyone looks away) until it glides within 0.5 m of the still mirror pool. It sees its own reflection, is watched forever, and sleeps. ×2. Hint: "It hates being looked at. Even by itself."

**Twists.**
- **A `decoy_shell`:** an empty shell also flares, so you might watch the wrong one.
- **B `lantern_blink`:** every 10 s the lanterns stutter (1 s tell) and go dark for 0.6 s. Nobody can watch, and it moves 3.6 m.

**Rank lanes.**

| Rank | Hop | Tongue | Croak |
|---|---|---|---|
| II | Hop straight onto the 2.3 m shelf, skipping the long ramps | Anchors over the shelf | Ring from 6 m while facing it |
| III | Air Hop over it | Long Tongue spits a pot into a bell from 6 m while a friend beside you watches | Twin Toll rings 2 bells (4 m apart) from between them |
| IV | Stomp pops moss-mites within 3 m | 8 m chain from the doorway to the shelf | **Thunder Croak rings 2 bells within 9 m from mid-room while you stare it down** |

**Mites.** Moss-mites, 4 per frog, on the columns (turning to pop them means looking away).

**Shared fate.** One watcher protects everyone. The moment every frog looks away, it moves, and not always toward the one who looked away.

**Betrayal hook.** None. Mischief: looking away on purpose. Blame tag: "Looked away: Vex."

**Power moment.** Thunder Croak ringing two bells behind it while you never break eye contact.

**Scaling.** n 1–3: glides at 4 m/s. n 4–8: 6 m/s. Hard: 7 m/s. There's no tell to shorten; watching is the counter.

**BotPlan.**
- *Explore:* every bot turns to the bells; it slimes Pip. "Help!"
- *Theorise:* after the first slime, Pell: "Interesting." He stays watching.
- *Execute:* one watcher (highest Wit) plus ringers. The third bell waits for the 90 s guard.

**Rewards.** Rule yields; Boon (Sight).

**Bestiary page: The Moss Snail.**
- Tip: "Someone must always be looking at it. Croaks ring behind your back."
- Hidden line: `Hidden clear: ??? — it hates being looked at. Even by itself.`
- Entry: "Nobody has ever seen it move. That is exactly the problem."

**System.**
- Enter: `[ DOOR 4B · THE MOSS SNAIL ] Don't take your eyes off it. Any of you.` (the number and letter follow the slot)
- First slime: `[ SLIMED ] Nobody was looking.`
- Dark: `[ DARK ] It was right behind you.`
- Clear: `[ CLEARED ] Three bells. It's pretending it never moved.`
- Fail: `[ FAILED ] Everyone looked away.`
- Hidden: `[ NOTED ] …` then `[ HIDDEN CLEAR ] It saw itself. It hasn't moved since.`

**Audio.** The slither, positional (visual twin: the glyph and the edge vignette); dead silence while it's watched.

**Unity.** `MossSnailBrain` with an **inverted `GazeCone`**: the host tests every seat's timestamped facing at 20 Hz and glides on the NavMesh while unwatched. `Bell` ×3, `MirrorPool` (`HiddenClearTrigger`), `RankLedge` shelf, `Anchor` ×2, `MiteSpawner(moss_mite)`.
- **Test hook:** obvious (bot 0 watches, others ring), hidden (all look away while the lure path crosses the pool), fail.

**Tags.** wish `weird_clear_monsters`, `team_up`; homage `stare_rule`.

---

#### `web_spider` · ♣ C rule · 2 skulls · climb-2 debut (doors 3–9); band 3–19 · [MUST-B] · S

*"One rope bridge, and a spider above it that comes down on whoever says a word."*

**Layout.** A gorge 22 × 10 m. A rope bridge 1.2 m wide spans 16 m (z −8..8) over mist. Six metres down, a web net catches fallers (no spot) and a web ladder climbs back to the start in about 15 s.
```
 z+11  ===== far ledge ===== X      B exit bell on the far ledge
 z +8  -------+-------            = side ledges (ledge.II) on the gorge walls
   @   |   bridge   |   @         @ side anchors, y 3, every 4 m, both walls
   =   |  (web over |   =         the web canopy spans y 4-8 above the bridge
   @   |   y 4-8)   |   @
 z -8  -------+-------
 z-11  ===== start ledge == E  (h) echo hollow (-4,0,-10)
```

**Monster and cue.** **The Web Spider**, lurking in the canopy.
- **Guard.** While it's free, any frog on the bridge for more than 1.0 s draws it down.
- **The croak draw.** When any frog croaks, it drops onto that frog, wherever it is.
- **Cue (2.0 s):** its **8 eyes light violet `#B98CFF`** and a glinting thread descends.
- **Wrap:** 6 s as a cocoon (−1 spot). A cocoon is a solid 1 m obstacle. Tonguing a cocoon for 1 s frees its frog early.
- **The window.** While wrapping and climbing back (6 s + 2 s), the spider is busy, and everyone else crosses freely.

**Rule:** `[ CLEAR ] It drops on whoever croaks. One croaks, the rest cross.` · Sealed: `██ █████ ██ ███████ croaks. One ██████, ███ ████ cross.`

**Clear.** Crossing clear on the far ledge. **Fail.** Hard 120 s, or all Dark. Target 60 s.

**The volunteer.** One frog croaks on the start side and pays a spot; the others cross. Then someone on the far side croaks to bring the volunteer over: a sacrifice chain.

**Hidden clear: "The gorge croaked."** A croak inside the echo hollow bounces off the far wall, and the spider drops on the empty echo point. Nobody is wrapped all room: ×2. Hint: "Let the gorge croak for you."

**Twists.**
- **A `two_spiders`:** two spiders; each croak draws the nearer one.
- **B `sagging_bridge`:** with ≥ 3 frogs on the bridge it sags to 1.5 m/s.

**Rank lanes.**

| Rank | Hop | Tongue | Croak |
|---|---|---|---|
| II | Side ledges on the gorge wall (2.3 m): a crumbly path around the web | **Swing the side anchors under the bridge**, below the web | Croaking from farther back keeps the volunteer out of the crowd |
| III | Air Hop over cocoons, and across the last 6.8 m | Long Tongue frees a cocoon from 6 m, or two at once | Twin Toll from the hollow echoes twice: the drop is delayed 2 s |
| IV | Stomp pops web-mites | 8 m anchor chain across: skip the bridge | **Thunder Croak staggers the drop and it retracts: volunteering costs nothing** |

**Mites.** Web-mites, 4 per frog, on the web strands (tonguing them from the bridge costs time on the bridge).

**Shared fate.** One frog's sacrifice lets everyone cross, and a cocoon blocks the 1.2 m bridge for everyone behind it.

**Betrayal hook.** None. (Volunteering is co-op; the real betrayal version of this dilemma is the Heart doors.)

**Power moment.** At rank IV the brave croak becomes free: you croak, stagger the drop, and walk across.

**Scaling.** n = 1 alive: after 20 s the echo hollow glows as a hint. n 2–8: as written. Hard: cue 1.4 s, wrap 7 s.

**BotPlan.**
- *Explore:* bots walk onto the bridge and get wrapped.
- *Theorise:* **Brother Brass volunteers:** "I can carry that." He croaks at the start.
- *Execute:* the others cross in the window; the last across croaks for Brass: "Go. I'll hold." The crossing clear needs a human.

**Rewards.** Rule yields; Boon (Chorus).

**Bestiary page: The Web Spider.**
- Tip: "It always answers a croak. Let one frog call it while the rest run."
- Hidden line: `Hidden clear: ??? — let the gorge croak for you.`
- Entry: "It hangs over the only bridge in the Well and waits for someone brave enough to say something."

**System.**
- Enter: `[ DOOR 5C · THE WEB SPIDER ] Someone has to say something.` (the number and letter follow the slot)
- First wrap: `[ WRAPPED ] Brave, and now sticky.`
- Dark: `[ DARK ] Too many volunteers, not enough spots.`
- Clear: `[ CLEARED ] Everyone across. One of you is still sticky.`
- Fail: `[ FAILED ] Nobody spoke up. Or everyone did.`
- Hidden: `[ NOTED ] …` then `[ HIDDEN CLEAR ] The gorge croaked. The spider fell for it.`

**Audio.** A taut thread *twang* on the drop cue (visual twin: the violet eyes and glinting thread); the bridge creaks; the cocoon muffles your croak.

**Unity.** `WebSpiderBrain` (listens to `NoiseBus` croaks only; drop spline; `State`, `TargetSeat`, `DropPos`); `Cocoon` (obstacle prop, tongue-hold 1 s to free); `EchoHollow` (retargets croaks inside it to the far echo point); bridge with a host `<half> Sag`; `Anchor` ×10; web-net catch volume and ladder.
- **Test hook:** obvious (Brass croaks, others cross, the last croaks), hidden (croak in the hollow), fail.

**Tags.** wish `team_up`, `weird_clear_monsters`; homage `doors_one_rule`.

---

#### `slime_foundry` · E rule · SOLO (12E); DUO variant in seeded forks · 2 skulls · band 7–17 · [MUST-B] · M

*"A slime that lives a hundred seconds in each of yours. Herd it into the cold with steam."* The door the Keeper Landing's teaser promised: `Something is waiting in 12E.`

**Layout.** A foundry 20 × 20 m on two levels: the floor (y 0) and a catwalk ring at 2.3 m (`ledge.II`), with corner stairs. Glitch dressing: magenta/black checker patches on 10% of surfaces, clocks ticking backward, a chromatic pulse on every dash.
```
 z+10  ## V5 ==== V6 ####      V1..V6 wheel valves; = catwalk (y 2.3)
       #  J1  J2 | [COLD]#     J1..J8 steam curtains (3 m wide, 4 m tall)
       V3   J3 J4 |  J7  V4      on the floor, forming corridors
       #  J5  J6 --  J8   #    [COLD] Cold Store 4 x 4 m at (7,0,7), frost #9FE6FF
       #  G      pots     #    G Gauge Board on the catwalk (0,2.3,-9)
 z-10  ## V1 ==E=== V2 ####    @ pipe anchors (4.5 m) overhead
```
- **Valve positions:** V1 (−8, 0, −8), V2 (8, 0, −8); V3 (−9, 2.3, 0), V4 (9, 2.3, 0); V5 (−5, 2.3, 9), V6 (5, 2.3, 9). A tongue-hold of 1.5 s turns a valve, toggling its 2 jets.
- **The Cold Store** has three closers:
  - a hatch crank (tongue-hold 2 s solo, 3 s duo);
  - a Hatch Lever that any prop ≥ 1 kg slams shut instantly;
  - a Hatch Weight pin (tongue-pull; the hatch slams 4 s later).
- **Physical tells:** each valve's pipe is painted its own colour all the way to its two jets; a chalk arrow points at the Cold Store; frost spreads 1 m out of its door.
- 8 pots (2 kg) are the throwables.

**Monster and cue.** **The Chrono-Slime**, a 0.8 m blob with a 20-afterimage trail.
- **Dash:** a straight line for **12 m or 3 bounces, whichever comes first**, on the floor only (CRIT #22). It reflects off walls, live steam and frozen frogs.
- **Cue, the Breath:** after each dash it pauses **1.5 s, glows `#C8FF4D`, and paints a dotted line of its next dash**.
- **Direction:** 40% toward the **brightest frog** in line of sight (your glow is a liability), otherwise a random open direction. It never dashes into live steam.
- **Touch:** −1 spot and **frozen in amber** 4 s (solo) or 5 s (duo). A frozen frog is a wall.

**The Funnel.** The seed sets the valve→jet mapping, a start state, and a target jet state that makes a corridor from the centre into the Cold Store, solvable in ≤ 4 valve turns. When a dash ends inside the Store, the slime turns Sleepy (2 m/s) and tries to leave after 4 s.

**Rule:** `[ CLEAR ] Herd it into the cold with steam.` · Sealed: `Herd ██ ████ ███ cold ████ █████.`

**Clear.** The hatch closes with the slime inside. **Fail.** Hard 150 s, or the entrants all Dark. **E doors never cost a Team Life**; entrants lose only this door's Boon and their unbanked fireflies (FO §3.7). Target 90 s.

**Hidden clear: "Sleeper."** Be frozen **inside** the Cold Store when the hatch closes. Solo route: pull the weight pin, then get touched inside. ×2. Hint: "The cold keeps two things as well as one."

**Twists.**
- **A `decoy_jet`:** a 9th jet toggles alone and isn't part of the Funnel.
- **B `iced_door`:** the Store's door is iced shut until a seeded valve vents steam onto it: one more step.

**Rank lanes.**

| Rank | Hop | Tongue | Croak |
|---|---|---|---|
| II | Hop onto the catwalk (2.3 m) without the stairs | Pipe anchors: swing floor ↔ catwalk | 6 m croak staggers the slime 1 s (it's small), delaying its next dash |
| III | Air Hop over a dash line | **Long Tongue turns two valves at once from 6 m**, and spits a pot at the Hatch Lever from 6 m | Twin Toll's knockback shoves a Sleepy slime deeper into the Store |
| IV | Stomp pops glitch-mites | 8 m pipe chain across the room | **Thunder Croak staggers a Sleepy slime 2 s at the door: a guaranteed capture** |

**Mites.** Glitch-mites (pixel bugs), 4 per frog.

**Shared fate.**
- **SOLO:** your clear drops the key the group needs at the Meeting Door (§3.4).
- **DUO:** a frozen partner is a wall, and using them as one is legal and often correct.

**Betrayal hook.** None (E door). DUO mischief: shoving your partner into the dash line to make a wall.

**Power moment.** A Long Tongue double-valve turn, then a pot spat across the room into the Hatch Lever as the slime dashes in.

**Scaling.** SOLO: dash 22 m/s, freeze 4 s, crank 2 s. DUO: 26 m/s, 5 s, 3 s. Hard: +1 skull, Breath 1.05 s.

**BotPlan** (a DUO partner, or the offstage volunteer).
- *Explore:* the bot walks to the Gauge Board first; it can't plan before it has seen the board.
- *Theorise:* BFS over the jet states.
- *Execute:* turn valves, then wait 6 m from the Hatch Lever with a pot. Closing the hatch (the key action) waits for the 90 s guard.
- Offstage: Lumen, "I work alone."

**Rewards.** Rule yields; E Boon (any family, Rare or better); **the fork key**.

**Bestiary page: The Chrono-Slime.**
- Tip: "It shows you its next dash. Steam is a wall to it, and so is a frozen friend."
- Hidden line: `Hidden clear: ??? — the cold keeps two things as well as one.`
- Entry: "It lives a hundred seconds in each of yours and is late for nothing. Build it a corridor of steam into the cold, and shut the door."

**System.**
- Enter: `[ DOOR 12E · SLIME FOUNDRY ] Something in here is late for everything. It is not late for you.`
- First freeze: `[ FROZEN ] It was quicker.`
- Dark: `[ DARK ] Out-paced.`
- Clear: `[ CLEARED ] Time has been put in the cold.`
- Fail: `[ FAILED ] You ran out of time. It did not.`
- Hidden: `[ NOTED ] …` then `[ HIDDEN CLEAR ] Two things kept cold. One of them was you.`

**Audio.** Steam hiss per jet, panned (visual twin: the curtains); backward tick-tock; a tape-rewind zip on each dash; an inhaling squeak with the Breath's dotted line.

**Unity.**
- `ChronoSlimeBrain`: the host simulates dashes with 60 Hz sub-steps and replicates `DashOrigin`, `DashDir`, `DashStartTime`, `State`. **Clients re-simulate each dash deterministically from those**, so no transform is streamed at 26 m/s.
- `Valve` ×6 (byte), `SteamJet` ×8–9 (bits), `ColdStore` (crank `<half>`, lever, pin), `GaugeBoard` (UI Toolkit, drawn from `RoomState`), `Pot` ×8, `RankLedge` catwalk, `Anchor` pipes, glitch dressing as a shader keyword.
- The DUO variant is the same RoomDef with a `capacity.mode = duo` value table.
- **Test hook:** obvious (BFS the valves, wait, throw), hidden (pin, then get touched inside), fail.

**Tags.** wish `random_doors_1a1e_meet`, `ttith_brutal`, `coop_time`, `weird_clear_monsters`.

---

#### `glitch_eye` · E rule · SOLO/DUO (17E) · 3 skulls · band 12–17 · [MUST-B] · S

*"An error in the Well that nobody fixed: a stained-glass eye that turns whatever looks at it to stone."*

**Layout.** A glitched nave 28 m long (z) × 12 m wide × 14 m high. Floor tiles occasionally render as 1-bit dither, and the stained glass scrolls like a corrupted texture.
```
 z+14  ####X####      pillars (2 m wide, 10 m tall) against the walls at
       P   :   P        x = +-4.5, z = -6, 3, 12 (solo: one z 12 pillar removed, seeded)
       P   O   P      O the Glitch Eye on the centre line, y 7, drifting z -10..12
       P   :   P      : its drift line; c masonry chunks (4 kg) x6 on the floor
 z-13  F   E   c      F the leaf font (0,0,-12): 2 blinker leaves
```

**Monster and cue.** **The Glitch Eye**, a 3 m floating stained-glass eye. It drifts at 1.5 m/s and turns toward the loudest noise.
- **Gaze.** If a frog's **facing** (not the camera; CRIT #21) is within 25° of it, with line of sight, for 0.5 s (solo 0.7 s), that frog is **Paralysed**: glitch-stone for 5 s, −1 spot. A Paralysed frog is a solid obstacle. **Three Paralyses eject you** (the E door never costs a life).
- **Cue:** static grain grows at the screen edges as your angle to it drops below 45°, with a rising glitch hiss.
- **When any pillar falls**, it blinks to the far end with a 0.3 s screen tear.

**Blinker leaves** (no new binding). Tongue-carry a leaf and it snaps over your face.
- The screen goes black except echo outlines (geometry within 3 m, plus a 6 m outline pulse whenever you or your partner croaks).
- **True pillars show expanding hum rings** (visual sonar, CRIT #21), and hum at A3, C#4 and E4.
- You **can't be Paralysed**, and you move 15% slower. Your tongue is busy holding the leaf.

**Toppling.** 3 shoves, or 1 chunk ≥ 3 kg hitting at ≥ 8 m/s, or a Hop IV charged landing within 1 m of the base.
- Pillars **fall along the wall**, deal no damage, and become climbable ramps (CRIT #22).
- A true pillar cracks the eye. A false one **enrages** it for 20 s (cone 35°, dwell 0.35 s).
- **Sighted tells:** true pillars carry a hairline crack pulsing at 1 Hz within 3 m, dust sifts from their tops, and 3 lit veins in the eye's glass run toward the true pillars.

**Rule:** `[ CLEAR ] Never look at the eye. Topple the three pillars that hum.` · Sealed: `Never ████ ██ ███ eye. ██████ ███ three ███████ ████ hum.`

**Clear.** 3 true pillars down: the eye shuts its lid and blinks out, asleep. **Fail.** Hard 150 s, or every entrant ejected or Dark. Target 90 s.

**Hidden clear: "Unflinching."** Clear without ever wearing a leaf and without ever being Paralysed. ×2. Hint: "Eyes open, and never meet its gaze."

**Twists.**
- **A `wandering_eye`:** drifts at 2 m/s and turns faster.
- **B `quiet_hum`:** hums and rings reach only 8 m.

**Rank lanes.**

| Rank | Hop | Tongue | Croak |
|---|---|---|---|
| II | A gallery at 2.3 m behind the pillars, out of its sightline | Rafter anchors (4.5 m) | A croak is noise: croak far from your target to turn the eye away |
| III | Air Hop | **Long Tongue spits a chunk at 12 m/s from 6 m: one-shot pillars from a safe angle** | Twin Toll rings the two wall chime-stones at once: the eye looks up at the ceiling for 3 s |
| IV | **A charged landing topples a pillar in one hit** | 8 m rafter chain | Thunder Croak staggers it 2 s (it shuts) |

**Mites.** Pixel-mites, 4 per frog.

**Shared fate.** DUO: one blind frog hears, one sighted frog topples, guided by pings. SOLO: the fork key.

**Betrayal hook.** None (E door). DUO mischief: pinging a false pillar. Talk moves no value.

**Power moment.** Hop IV stomping a pillar flat in one landing, or chunk snipes from across the nave.

**Scaling.** SOLO: 5 pillars (3 true), dwell 0.7 s, 1 leaf. DUO: 6 pillars, dwell 0.5 s, 2 leaves. Hard: dwell ×0.7.

**BotPlan** (DUO partner, or offstage).
- *Explore:* the bot drifts toward the eye; Kestrel "peeks" at 30°.
- *Theorise:* it wears the leaf and pings hum rings: "Here."
- *Execute:* the bot guides and the human topples. The third true pillar waits for the 90 s guard.

**Rewards.** Rule yields; E Boon (Rare or better); the fork key.

**Bestiary page: The Glitch Eye.**
- Tip: "It only sees what faces it. Wear a leaf and follow the humming pillars."
- Hidden line: `Hidden clear: ??? — eyes open, and never meet its gaze.`
- Entry: "An error in the Well that nobody ever fixed. Three of its pillars are real, and they hum for anyone who stops looking."

**System.**
- Enter: `[ DOOR 17E · THE GLITCH EYE ] Do not look directly at the error.` ("Do not" renders with a TMP strikethrough-glitch style tag)
- First Paralysis: `[ PARALYSED ] You looked. It looked back.`
- Dark: `[ DARK ] 404: frog not found.`
- Clear: `[ CLEARED ] The error has been closed. Nobody saw anything.`
- Fail: `[ FAILED ] Too much eye contact.`
- Hidden: `[ NOTED ] …` then `[ HIDDEN CLEAR ] Eyes open. Never met its gaze.`

**Audio.** A glitch hiss that rises as your angle closes (visual twin: static grain); pillar hums (visual twin: rings); the eye's drone.

**Unity.** `GlitchEyeBrain` (per-seat facing test at 20 Hz, enrage, blink-teleport); `Pillar` ×5–6 (a kinematic hinge fall along the wall, then a static ramp collider; `<byte> PillarState`); `LeafMask` (`Carryable` → face socket; the echo-view post-process runs only on the wearer's client); `MasonryChunk` ×6; hum-ring VFX rendered only for leaf wearers.
- **Test hook:** obvious (a sighted bot keeps facing > 60° off the eye and topples true pillars by seed), hidden (never wear a leaf), fail.

**Tags.** wish `random_doors_1a1e_meet`, `ttith_brutal`, `weird_clear_monsters`; homage `doors_eyes`.

### 6.4 Heart doors (4)

**The only rooms where real betrayal happens** (D §4). Shared rules:
- **The plaque shows ♥, and the entry line always says so:** `Heart door. Betrayal is allowed in here.`
- **Yields:** rule-door yields (18 + 2d, 8 loose). Boon family: Risk.
- **Every Heart door has a co-op answer that pays everyone well.** It is the room's hidden clear: ×2, a stamp, and `[ NOTED ]`.
- **Betrayal moves only unbanked room loot**, is server-authoritative, and ends at the room exit in the **Betrayal Cam** (0.8 s slow motion, `[ TRAITOR ]`), a **WANTED** poster for one door, and a **Vengeance** quest for the victim. 03 owns all three.
- **Inside Heart doors, spilled fireflies stay with whoever catches them** (FO §4.1).
- **No Heart door can fail or cost a Team Life.** Each resolves on its own clock.
- **Rivals betray only with the full 1.5 s tell** and within the Drama Director's limits, including the mercy rule (03).
- **Public lobbies:** human-vs-human betrayal is off; Rivals do the betraying (FO §5.2).
- Heart doors have no rule monster and no Bestiary page.

---

#### `heart_two_pads` · ♥ Heart · 1 skull · door 11 (climb 1, single); band 6–19 · [MUST-B] · S

*"Two ferry pads, a crowd of frogs. The rule says pads, not frogs."* (the TTITH-style literal reading)

**Layout.** A chamber 18 × 18 m around a dark pool, with a stone island (r 5 m) in the middle. The entry bridge sinks once everyone is across, so there's no way back.
```
 z+13  ~~~~~~~~ X ~~~~~~~~     X exit landing across 8 m of water
       ~~~~~~~~~~~~~~~~~~~
       ~~~~  [1]   [2]  ~~~~   [1][2] ferry pads, r 0.8 m (one frog's footprint),
       ~~~ (   island   ) ~~     docked at (-1.5,0,5.2) and (1.5,0,5.2)
       ~~~ (     J      ) ~~   J the Heart Jar, rose glass, on the island centre
       ~~~ (            ) ~~
 z-9   ~~~~~~~~ E ~~~~~~~~~    entry bridge (sinks behind you)
```

**The ferries.** Each pad departs when its ring fills: **3 s after the last frog lands on it**. Each landing resets the fill. A departing pad carries everything standing on it to the exit in 3 s.
- **A pad fits one frog's feet, and more frogs must stand on heads**: the Frog Stack physics from `toy_frog_stack`. A stack of k wobbles ±4k°; if the base frog moves, it falls.
- **Each ferry carries a small bell.** Ringing it resets that pad's ring to 3 s (hold the ferry).
- At 47 s both rings start filling regardless; at 50 s they leave.

**Rule:** `[ CLEAR ] Only two may leave by the pads.` · Sealed: `Only two ███ █████ ██ ███ pads.`

**Clear.** Both pads have left: the room resolves. Frogs left on the island are moved on by the Tower gulp 3 s later.

**Stakes.** Everyone gets the clear bonus and keeps the Boon pick.
- **The Heart Jar** (8 × n loose fireflies plus Wish Coins; 04) **splits among frogs who left by the pads.**
- **Every frog left behind drops its unbanked cheek fireflies into the jar.**

**Betrayal: Shove only** (D §8.2 #5; the tongue yank is off in this room). A shove (the normal 6 m/s) that knocks a frog off a departing pad, or off a stack, in that pad's last 3 s is a **betrayal event**: the Cam at the exit, WANTED on the shover, Vengeance for the victim.

**Co-op answer (hidden clear): "Literal."** Every frog in the room leaves by the two pads, in stacks. ×2, and the Tower adds +50% to the jar. Hint: "It said pads. It never said frogs."

**Twists.** None: Heart doors keep their dilemma bare. The layout shuffle only moves the pads' dock positions.

**Rank lanes.**

| Rank | Hop | Tongue | Croak |
|---|---|---|---|
| II | Hop II lands on top of a 2-frog stack (2.2 m) | Haul a swimmer back onto the island (consensual) | Ring a ferry bell from 6 m |
| III | Air Hop onto a 3-stack (3.2 m) | Long Tongue pulls 2 swimmers' tongues at once | **Twin Toll rings both ferry bells: hold both ferries while the stacks build** |

**Shared fate.** The stack: the base frog carries everyone above it.

**Power moment.** An Air Hop onto the top of a wobbling tower of Rivals, and a Twin Toll that holds both ferries while the last frog climbs on.

**Scaling.** n = 2: both leave (the room is almost free; the generator avoids placing it when n < 3). n = 3: the title case. n 4–8: stacks of 2–4.

**BotPlan.**
- *Explore:* bots stand on pads alone (the obvious reading).
- *Theorise:* after 15 s Brother Brass stands on pad 2: "I can carry that." (a hint, not the answer). If a human stands on a pad, Pip hops onto their head: "Thanks!" Others follow.
- *Director beat (climb 1, the first Heart door a human sees):* **Vex shows the full tell (cheek puff, crimson tongue tip, lean) and shoves Moss off pad 1** about 2 s before it leaves. Betrayal Cam; WANTED on Vex; Moss gets Vengeance, which lands at door 12 (§5).

**System.**
- Enter: `[ DOOR 11 ♥ · TWO PADS, THREE FROGS ] Heart door. Betrayal is allowed in here.`
- Departs: `[ PAD 1 DEPARTS ]`
- Left behind: `[ LEFT BEHIND ] Your cheeks stay with the jar.`
- Clear: `[ CLEARED ] Two pads left. The water noticed who didn't.`
- Co-op: `[ NOTED ] …` then `[ LITERAL ] It said pads, not frogs. Everyone out.`

**Audio.** The Heart-door stinger on entry (low cello and heartbeat); ferry rings fill with 3 rising pentatonic ticks; a shove off a pad gets a record-scratch plus the Cam's slow-motion whoosh.

**Unity.** `FerryPad` ×2 (the host collects every frog whose feet chain to the pad through stack contacts; `<half> Ring`, `<byte> State`); `HeartJar` (split logic in `RoomState`, host only); `StackPhysics` (shared with `toy_frog_stack`: frog-on-frog platform parenting with wobble); `BetrayalSensor` (records shove-off-pad events: instigator, victim, server time; feeds 03's Cam); `Bell` ×2 on the pads.
- **Test hook:** obvious (2 bots leave), co-op (everyone stacks), betrayal (a scripted shove: exactly one Cam event, WANTED set, the victim's unbanked fireflies moved).

**Tags.** wish `sabotage`, `team_up`, `ttith_brutal`.

---

#### `doppelfrog` · ♥ Heart · 2 skulls · door 14 (climb 1, single); band 6–19 · [MUST-B] · L · **never slip**

*"One of you is not a frog."* (TTITH's doppelganger floor meets Mafia and Among Us.)

**Two variants** (D §8.2 #12; **03 owns role assignment and vote rules**):
- **Spot the Mimic** (fewer than 3 humans). A **Rival's seat is the Mimic** for this room. Only humans vote. Rivals only point at public evidence, and their pings are marked.
- **Human Mimic** (at least 3 humans and at least 5 voters). One seat, human or Rival, is secretly the Mimic, assigned with the host-only salt and told only to its owner.

**Layout.** A lantern-lit marsh hall 24 × 24 m flooded 0.2 m deep, so every real frog leaves ripples.
```
 z+12  [V V V V V V V V S] X     V lily thrones in each seat's Seat Hue; S Skip
       ~  ~  (L)  ~  ~  ~        (L) the exit lantern (0,0,11): fill with 6 clouds
       ~ n  ~  ~ i ~  ~ n ~      n cloud nests (6) around the walls
       ~  i  ~  ~  ~  i   ~      i reed islands (5), tops at 2.3 m
       ~ n  ~  i  ~  ~  n ~
 z-12  ~  ~  ~  E  ~  ~  ~
```

**The task** (as in Among Us). Tongue-carry 6 firefly clouds from the nests to the exit lantern. When it's full, or at 50 s, the vote opens.

**The Mimic** looks and moves exactly like the seat it copies: hat, name tag, Seat Hue. It has two tells:
1. **It blinks sideways**: a horizontal membrane every 4–7 s, readable within 8 m.
2. **It leaves no ripples** in the shallow water, readable from anywhere.

**The Mimic's move.** It can tongue-tag a frog to **steal its unbanked fireflies**; the victim's cheeks visibly deflate (public evidence). Tell: cheek puff + glowing tongue tip, **0.6 s for a human Mimic and 1.5 s for a Rival Mimic**. Cooldown 12 s.

**The vote.** 15 s at the exit. Voters stand on the throne of the frog they accuse, or on Skip. A majority of voters convicts; a tie convicts nobody.
- **Mimic convicted:** it bursts into moths, everything it stole returns, and the co-op answer pays.
- **Wrong frog convicted:** that frog is sent up early (it keeps everything and misses only the jar). The Mimic escapes with its loot, and the Betrayal Cam replays its best tag.
- **No conviction:** the Mimic escapes.
- **Climb 1:** the Mimic wears **Kestrel**. The real Kestrel pops out of a jar afterwards: "That was on purpose."

**Rule:** `[ CLEAR ] One of you is not a frog.` · Sealed: `One ██ ███ ██ ███ █ frog.`

**Clear.** The vote resolves, either way. The room always clears.

**Co-op answer (hidden clear): "Caught in the act."** Tongue-tag the Mimic **during its tag tell**. It's exposed on the spot: ×2 for everyone, and everything returns. **The lantern is the room's jar:** the 6 clouds in it (the room's loose budget) split among all frogs at the exit. A conviction at the vote adds +50% to that split, without the ×2; an escape lets the Mimic's seat keep what it stole. Hint: "Watch the water, and watch the eyes."

**Rank lanes.**

| Rank | Hop | Tongue | Croak |
|---|---|---|---|
| II | Reed islands (2.3 m): a vantage point for reading ripples | Grapple carries clouds faster | **A croak makes every frog within radius flinch-blink.** Real frogs blink up-down; the Mimic blinks sideways |
| III | Air Hop between islands | Long Tongue carries 2 clouds | Twin Toll: two flinch-pulses 0.5 s apart |
| IV | — | — | **Thunder Croak makes everyone within 9 m blink at once, and the sideways one pops out** |

**Shared fate.** The lantern task, and the vote: one table, one verdict.

**Betrayal.** The Mimic's tags. A wrong vote is its own small tragedy.

**Power moment.** Thunder Croak across a crowd, and a single sideways blink.

**BotPlan.**
- Non-Mimic Rivals do the task. A Rival that sees a frog making no ripples within 10 m **pings it** (marked as a bot ping). A tagged Rival shouts "Help!" and points at the tagger.
- **Rivals never use hidden information.** They vote (human variant only) for a frog with ≥ 2 public evidence points: a no-ripple sighting seen by 2 frogs, or a witnessed tag. Otherwise they Skip.
- A Rival Mimic tags with the full 1.5 s tell, prefers the richest cheeks, and avoids witnesses within 6 m.

**System.**
- Enter: `[ DOOR 14 ♥ · DOPPELFROG ] Heart door. Count the frogs. Then count again.`
- Tagged: `[ YOINK ] Your cheeks feel lighter.`
- Vote: `[ VOTE ] Stand on the frog who isn't one.`
- Caught: `[ UNMASKED ] It was never a frog.`
- Wrong: `[ OOPS ] That one was a frog.`
- Escaped: `[ ESCAPED ] It's still out there. Wearing someone.`
- Co-op: `[ NOTED ] …` then `[ CAUGHT ] Mid-tongue. Rude.`

**Audio.** Marsh ambience; a faint glass *tink* on each sideways blink (visual twin: the blink itself); a drumroll through the vote; the reveal sting.

**Unity.** `MimicBody` (an `IHeroBody` variant rendering the copied seat's cosmetics and Seat Hue, with ripples off and a sideways-blink blendshape); `MimicRoleService` (host, salted, owner-only ClientRpc); `CloudTask` nests; `ExitLantern` (`<byte> Fill`); `VoteDais` (per-seat standing detection, host tally, bot marks); `EvidenceLog` (public events only; the only thing Rivals read).
- **Test hook:** spot-the-Mimic with a scripted human vote; a wrong vote; catch-in-the-act; and a leak test asserting no client except the owner ever receives the Mimic's seat before the reveal.

**Tags.** wish `mafia_among_us`, `sabotage`, `ttith_brutal`; homage `ttith_doppelganger`, `among_us_vote`.

---

#### `heart_split_swallow` · ♥ Heart · 1 skull · climb-2 ♥ pool; band 6–19 · [MUST-B] · S

*"A jar between you, a screen between you. Share it, or swallow it whole."* (Pinky Promise, reborn as a room.)

**Layout.** A round mossy chamber, r 10 m. Four pair alcoves ring a central stump. In each alcove two frogs face each other across a jar on a plinth, and a shutter screen can rise between them. On each frog's side: a **green lily (SHARE)** and a **toothy clam (SWALLOW)**.

**Flow.**
1. **Talk, 15 s,** with the shutter down: Wheel lines, emotes and pings.
2. **Choose, 10 s,** with the shutter up. Stand on your lily or clam; the last one stood on counts, and SHARE is the default.
3. **Reveal.** The shutters drop and the jar reacts:

| Both SHARE | One SWALLOWs | Both SWALLOW |
|---|---|---|
| The jar splits evenly and the Tower adds +50%: `[ SHARED ]` | The swallower gulps the whole jar; the sharer gets none of it. **A betrayal event** (the Cam catches the gulp and the partner's face) | A **clown honk**, the jar shatters, nobody gets it, and both frogs are slimed (cosmetic goo) |

- **The jar** holds the pair's loose budget: 16 fireflies plus Wish Coins (04).
- **Odd n:** the leftover frog pairs with the Tower's stone frog, which always shares.
- **Choices are secret:** the host keeps them, each client sees only its own, and the reveal is broadcast.

**Rule:** `[ CLEAR ] Pairs choose in secret: share the jar or swallow it.` · Sealed: `Pairs ██████ ██ secret: █████ ███ jar ██ swallow ██.`

**Clear.** After the reveal the exit opens; the room always clears.

**Co-op answer (hidden clear): "All shared."** Every pair shares: ×2 for everyone, plus `[ NOTED ]`.

**Rank lanes.** None required: this door is about nerve, not verbs. Mites: none (the jars are the loose).

**Shared fate.** Your outcome is literally your partner's choice.

**BotPlan.** Rivals choose by 03's betrayal utility, which shows in their personality:
- Moss, Pip and Brother Brass share.
- Vex swallows unless Knotted to you, or if he's already WANTED.
- Maud says "Trust me." and swallows half the time.
- Kestrel is a coin flip.
- Talk is truthful except Maud's.
- The Director keeps to ≤ 1 bot betrayal per floor against the human, and the mercy rule.

**System.**
- Enter: `[ DOOR n ♥ · SPLIT OR SWALLOW ] Heart door. Share the jar, or swallow it whole.`
- Shared: `[ SHARED ] +50%. The Tower approves.`
- One swallow: `[ SWALLOWED ] {name} is full. {partner} is not.`
- Both: `[ HONK ] Two swallows. No jar.`
- Co-op: `[ NOTED ] …` then `[ ALL SHARED ] Nobody swallowed. Unheard of.`

**Audio.** A drumroll through the choice; a gulp; a detuned pentatonic clown horn.

**Unity.** `SecretChoice` (a server-only dictionary; a targeted ClientRpc confirms each frog's own choice; the reveal RPC goes to all); `Shutter` ×4; `PairJar` ×4.
- **Test hook:** all share; one swallow (exactly one Cam event); both swallow (honk); and a leak test that no choice reaches another client before the reveal.

**Tags.** wish `sabotage`, `team_up`; homage `split_or_steal`.

---

#### `heart_tied_bridge` · ♥ Heart · 2 skulls · climb-2 ♥ pool (Knotted pairs); band 11–19 · [MUST-B] · M · **first to slip** (D §7)

*"You're tied to your partner. The bridge holds one of you."*

**Layout.** A chamber over the well water, 24 × 16 m. Near bank z −10..−6; four parallel floating plank bridges, one per pair, each 12 m long and 1.0 m wide, z −6..6; the far bank z 6..10 with the exit. Each bridge carries a buoy bell.

**The tether** (the `sp_tongue_tether` script). Knotted pairs are tied by their Knot; everyone else is tied by the Tower with a pale thread.
- Rest length 3 m; elastic to a **maximum of 14 m**.
- Beyond 4 m the farther frog slows to speed × (1 − (L − 4)/12).
- Holding Tongue on the thread **reels** at 2 m/s.

**The bridge.** It **sinks when 2 frogs stand on it** (0.5 m/s, fully under in 2 s) and rises 3 s after it drops back to ≤ 1 frog. Frogs on a sunk bridge swim at 2 m/s, and the tether drags.

**Rising water.** From 10 s the water rises 0.1 m/s. The near bank (1.5 m above the water) floods at about 25 s.

**Three ways across:**
1. **Patient:** one crosses against the elastic pull, then reels the partner over. About 20 s.
2. **Sling:** while your tied partner is airborne within 3 m, tap Tongue on them to **launch them 12 m** along your aim (a room-granted sling; hopping is their consent). Frog Sling Duo owners can launch from the ground.
3. **Cut:** hold Shove 1.2 s (the Cut). The partner can **hold on** with Tongue on the thread to stop it, stunning the cutter 1 s. Inside this Heart door, **a Cut takes the partner's unbanked fireflies** and frees you to sprint across alone. Nobody is stranded: the partner still crosses on their own bridge.

**Rule:** `[ CLEAR ] Pairs cross tied together. The bridge sinks under two.` · Sealed: `Pairs █████ ████ together. ███ bridge █████ █████ two.`

**Clear.** Crossing clear on the far bank; the gulp takes the rest. **The water topping the far bank at 120 s ends the room** without a Team Life lost (a Heart door can't fail), and stragglers are gulped.

**Co-op answer (hidden clear): "Every knot held."** Every pair across, no Cut, nobody swam. ×2.

**Rank lanes.**

| Rank | Hop | Tongue | Croak |
|---|---|---|---|
| II | Charged hop from the bank to mid-bridge | Reel at 3 m/s | Ring your buoy bell: **the bridge lifts 0.5 m and holds two for 4 s** |
| III | Air Hop at the top of a sling adds 3 m | Sling reach 6 m | **Twin Toll lifts 2 bridges**: two pairs cross together |

**Shared fate.** The tether.

**Betrayal.** The Cut. The full 1.5 s tell comes first for Rivals.

**Power moment.** A 12 m sling that lands clean. Or one that doesn't.

**Scaling.** Odd n: one trio tied in a line (3 m segments), or the odd frog is tied to "Lumpy", a 20 kg mossy log it can Cut freely for no loot.

**BotPlan.**
- *Explore:* pairs both step on (the bridge sinks).
- *Theorise:* one waits and one crosses.
- *Execute:* Rivals with Frog Sling sling; others go the patient way.
- Betrayal only through 03's utility and the Director's limits.

**System.**
- Enter: `[ DOOR n ♥ · TONGUE-TIED BRIDGE ] Heart door. You're tied, and the bridge only holds one.`
- Sunk: `[ SUNK ] Two was one too many.`
- Clear: `[ CLEARED ] Across, still tied. Mostly.`
- Water: `[ TIME ] The well came up to meet you.`
- Co-op: `[ NOTED ] …` then `[ UNBROKEN ] Every knot held.`

**Audio.** Each tether is a plucked string pitched by its tension, quantised to D Dorian (the GDD §6.3 graft); a sinking gurgle; the water's rising hiss.

**Unity.** Reuses `TetherSystem` from `sp_tongue_tether`; `FloatingBridge` ×4 (`<half> Sink`); `BuoyBell` ×4 (`TollTarget`); `RisingWater` (`<half> Level`); `SlingAction` (a room-granted ability).
- **Test hook:** a patient pair, a sling pair, a Cut pair (the Cam fires once and the loot moves), and the water timeout.

**Tags.** wish `sabotage`, `team_up`, `chained_together`, `ttith_brutal`; homage `ttith_floor61`, `chained_together`.

### 6.5 Set pieces (2)

90–150 s rooms carrying the PEAK and Chained Together physicality (FO §3.2). Yields: 25 + 2d clear, 10 loose. No rule monster and no Bestiary page; the antagonist is the physics and the clock. They obey the rank-lane rule like rule doors.

---

#### `sp_grip_wall` · set piece · ♠ A · 2 skulls · door 15; band 11–19 · [MUST-B] · L · **never slip**

*"A mossy chimney up the inside of a strand. The moss dries where you grab it. Keep climbing, or haul a friend."* (PEAK; TEAMBOUND Summit)

**Layout.** A hexagonal shaft inside strand 4, 7 m across and **24 m tall**. A trapdoor hatch at the top opens **onto Landing 3's deck** (y 90 in the shaft), so this room ends by climbing out into the Landing and the Mouth at 56°.
```
 side view (unrolled)          top: 2 x 2 m hatch at y 24 -> Landing 3
 y24  ====[HATCH]====
 y16  ==ledge 2==  @           ledges at y 8 and y 16: 1.2 m deep, wrapping
 y12   . o  o . o  @             2 walls, checkpoints, grip refill
 y 8  ==ledge 1==  @           o moss holds (~80) on 3 braided routes,
 y 4   o . o  o .  @             0.9-1.6 m apart
 y 0  ====floor====  E          @ root anchors every 4.5 m up one wall
```

**Grip ring** (per frog, shown as a ring on the frog's back; PEAK's stamina is per climber, FO §10.5).
- Grip is 100. **Hanging drains 6/s**, each reach costs 4, and a lunge (a hop from a hold, 2.2 m reach) costs 12.
- Standing on a ledge refills 40/s. At 0 you fall to the ledge below (falls over 4 m cost 1 spot).

**Moss holds** glow green when moist. **A hold dries 3 s after first contact** (it turns grey) and re-moistens 15 s later, when a drip falls on it. The Sticky Pads Boon clings 2 s on bare wall; at II grip drains 30% slower.

**Hauls** (consensual; §3.8). A frog on a ledge or a jug hold can haul a hanging frog within its tongue reach who is holding Tongue toward it, at 1.5 m/s. Hauling while hanging costs the hauler 8 grip/s.

**The hatch** slams 30 s after the first frog touches it, unless a frog **sits in its frame**. That frog can't climb out while holding it. A slammed hatch reopens with an 8 s tongue-hold crank from ledge 2.

**Plain line:** `[ CLEAR ] Climb to the hatch. Moss dries where you grab it.`

**Clear.** ≥ half the living frogs out through the hatch, including a human; the Tower gulp hauls up the rest, who still get the bonus. **Fail.** Hard 150 s with fewer than half out. Target 110 s.

**Hidden clear: "Nobody fell."** The whole party out with zero falls: ×2. Hint: "Up, together, and nobody lets go."

**Twists.**
- **A `dry_spell`:** holds re-moisten after 25 s.
- **B `ledge_bats`:** bat-mites between y 12 and 20 knock 20 grip off on contact.

**Rank lanes.**

| Rank | Hop | Tongue | Croak |
|---|---|---|---|
| II | Step-ups of 2.3 m from each ledge to a jug | **The root line: grapple anchor to anchor** | **A croak shakes the drips loose: every hold within 6 m re-moistens.** Croak for the friends below you |
| III | Air Hop off a drying hold ("hop off a falling platform") | Long Tongue hauls from 6 m, or grabs 2 holds | Twin Toll knocks bat-mites off 2 friends |
| IV | Charged 3.0 m hops between holds | **Tongue IV chains straight up the root line with no touchdown** | Thunder Croak re-moistens every hold within 9 m |

**Mites.** Moss-moths flutter up the shaft, 5 per frog; clouds sit on the ledges.

**Shared fate.** **A falling frog bowls off anyone within 1 m below it.** Blame tag: "Landed on: Pip." Plus the hatch holder, and every haul.

**Betrayal hook.** None (mischief: grabbing a friend's next hold, which starts its drying).

**Power moment.** Door 15 of climb 1: you got Tongue IV at door 12. You **zip up the root line in four grapples** while the Rivals struggle, then haul Pip up from 6 m. "Help!" "Thanks!"

**Scaling.** n 1–3: grip drains 4/s and holds re-moisten in 10 s. n 4–8: as written. Hard: drain 7.5/s.

**BotPlan.** A* over the hold graph (edge cost = grip).
- *Explore:* bots climb straight up and dry their own holds. **Pip dangles: "Help!"**
- *Theorise:* rest on ledges.
- *Execute:* Moss hauls danglers; **Brother Brass holds the hatch: "Go. I'll hold."**

**Rewards.** 25 + 2d, 10 loose; Boon (Body).

**System.**
- Enter: `[ DOOR 15 · THE GRIP WALL ] Up. Faster than the moss dries.`
- Fall: `[ FELL ] The moss disagreed.`
- Dark: `[ DARK ] Let go once too often.`
- Clear: `[ CLEARED ] Daylight. Well, lantern-light.` The hatch opens onto Landing 3, and its 1.7 s Mouth glance plays (WORLD §4.5).
- Fail: `[ FAILED ] The wall keeps its own.`
- Hidden: `[ NOTED ] …` then `[ NOBODY FELL ] Not once.`

**Audio.** Wet squelches on grabs; a drying crackle (visual twin: grey moss); a low beep as your grip ring drains (twin: the ring flashes); the hatch creaks and the Landing waltz swells through it.

**Unity.** `GripWall` with `MossHold` ×80 (a dry bitfield across 3 × `uint`); `GripRing` on each frog (server-owned `<byte> Grip`); `Haul` action; `Hatch` (`<byte> State`, `<half> Crank`); ledge `Checkpoint`s; `Anchor` root line. `GripWallGenerator` builds the 3 braided routes from the seed at generation time; hold positions are baked, and moisture is dynamic.
- **Test hook:** A* bots climb (obvious), zero-fall perfect bots (hidden), idle bots (fail); assert the hatch hands off to Landing 3.

**Tags.** wish `peak`, `teambound_modes`, `team_up`, `increasing_powers`; homage `peak_grip`, `tb_summit`.

---

#### `sp_tongue_tether` · set piece · ♣ C · 3 skulls · 17C; band 6–19 · [MUST-B] · L · **never slip**

*"Tongue-tied in pairs, hopping in step, while the well rises behind you."* (Chained Together; TEAMBOUND Chained ascent)

**Layout.** A ledge path 70 m long (path space s = 0..70) climbing 12 m inside the well wall, 3–4 m wide, over the well water. Checkpoints sit at each section start.

| Section | Path (m) | Obstacle |
|---|---|---|
| S1 Pad Hop | 0–18 | 6 floating pads with 2.0 m gaps (hop in step) |
| S2 Swinging Lanterns | 18–36 | 4 lantern discs, 2 m wide, swinging ±2 m sideways on a 4 s period, a quarter-cycle apart |
| S3 Crumble Stair | 36–56 | 10 steps rising 6 m. Each tile drops 1.5 s after first contact and respawns after 8 s |
| S4 Gust Ledge | 56–68 | A 1.5 m ledge with 2 gust vents: a 4 m/s sideways push every 7 s, with a 1 s mist-streak warning |
| Exit | 68–70 | The door |

**The tether.** Pairs are tied tongue to tongue: Knotted pairs by their Knot, everyone else by the Tower in seat order. It's a distance constraint (rest 3 m, **max 4 m**) with slack. Odd n: one trio, or the odd frog is tied to Lumpy the log (20 kg).
- **Hop in step:** if your partner hops within 0.3 s of you, both hops go 20% farther. If they don't and the tether goes taut mid-air, you're **yanked back** (the gag).
- **Dangling:** a frog over an edge dangles. A partner on solid ground holding Tongue on the tether reels them up at 1.5 m/s. The chain slides toward the edge at 1.5 m/s × danglers − 2.0 m/s × reelers (never below 0; GDD §6.3). If both dangle, both drop to the checkpoint.

**The chaser** (CRIT #19's fix for the dead waiting). **From 20 s the water rises at 0.1 m/s** and tops the exit at 140 s. A pair fully under water for 3 s loses 1 spot each and respawns at the highest checkpoint above the water.

**Plain line:** `[ CLEAR ] Reach the top together. Hop in step.`

**Clear.** Every living pair through the exit, or ≥ half the frogs including a human (the rest are gulped). **Fail.** The water reaches the exit (140 s) or the hard cap (150 s). Target 100 s.

**Hidden clear: "Unbroken knot."** No frog ever touched the water, and nobody Cut. ×2.

**Twists.**
- **A `reverse_gusts`:** gusts alternate direction.
- **B `quick_lanterns`:** a 3 s lantern period.

**Rank lanes.**

| Rank | Hop | Tongue | Croak |
|---|---|---|---|
| II | Step over 2 crumble tiles at once (2.3 m rise) | Anchors above S2: swing past the lanterns | **A croak freezes crumble tiles within 6 m for 2 s**: hold the stair for your partner |
| III | Air Hop off a falling tile | Long Tongue reels 6 m, or grabs a lantern and your partner | Twin Toll stops 2 lanterns swinging for 2 s (lanterns are toll targets) |
| IV | Charged 3.0 m hops up the stair | **An 8 m chain grapple through S2, with your partner dangling behind you** | Thunder Croak freezes every tile within 9 m |

**Frog Sling** (Duo, offered after Landing 3 in climb 1) launches your partner 12 m ahead, straight across S3. **The misses are the clip.**

**Mites.** Dragonfly mites along the path, 5 per frog.

**Shared fate.** The tether itself.

**Betrayal hook.** Outside a Heart door, a **Cut only ends the Knot and its Duo**: a comic breakup with the Betrayal Cam, and no loot moves (FO §5.2). You're then free and alone.

**Power moment.** A Frog Sling across the crumble stair, or a Tongue IV chain grapple with your partner flapping behind like a kite.

**Scaling.** n 1–3: the water rises at 0.08 m/s. n 4–8: 0.1. Hard: 0.12.

**BotPlan.** Rivals follow an authored path graph (section waypoints and jump nodes with timing windows).
- *Explore:* hops out of step (the yank gag).
- *Theorise:* sync each hop to the partner's hop.
- *Execute:* Moss calls "Hop!" on the Wheel line; Rivals reel danglers after a 0.3–0.6 s reaction.
- The Director stages one sling miss in climb 1.

**Rewards.** 25 + 2d, 10 loose; Boon (Chorus); Duo offers where Knotted (04).

**System.**
- Enter: `[ DOOR 17C · TONGUE-TIED TETHER ] You're tied together. The well is rising.`
- Yank: `[ OUT OF STEP ]`
- Dark: `[ DARK ] Dragged under.`
- Clear: `[ CLEARED ] Still tied. Still friends. Probably.`
- Fail: `[ FAILED ] The well caught up.`
- Hidden: `[ NOTED ] …` then `[ UNBROKEN ] Dry feet, same knot.`

**Audio.** Each tether is a plucked string pitched by tension (D Dorian); synced hops play a chord; the rising water rumbles below.

**Unity.** `TetherSystem`: XPBD distance constraints, **each client solving its own chain against interpolated partner positions**, with the host authoritative on positions, Cuts and water hits (CRIT #19; the M0 proof-of-concept case). `CrumbleTile` ×10 (`<byte> State`); `SwingLantern` ×4 and `GustVent` ×2 driven by server time (no state); `RisingWater` (`<half> Level`); path `Checkpoint`s.
- **Test hook:** bots on the path graph with perfect sync (obvious), no water contact (hidden), idle (fail).

**Tags.** wish `chained_together`, `teambound_modes`, `team_up`; homage `chained_together`, `tb_chained`.

### 6.6 The Keeper

#### `keeper_bell_raft` · Keeper · 2 skulls · door 10 · [MUST-A] · M (two scripts through `PhaseSequencer`)

*"The golem from door 2 got a boat. It hasn't learned to swim."* It is built only from lessons everyone was taught (D §6 row 17): the Look from door 2 and a raft that reads without a lesson.

**Layout.** A vaulted cistern with a round, dark pool (r 24 m). In the middle floats a **lily raft 16 m across** (r 8 m), chained to the pool floor. Three bells stand on the raft rim at r 7 m, 120° apart. Six rim ladders let swimmers climb back with a tap hop.
```
 z+24  ~~~~~~~~~~~ X ~~~~~~~~~~~     X exit to the Keeper Landing
      ~~~~     B1      ~~~~
     ~~~   (    raft     )  ~~~     raft r 8 m; B1..B3 rim bells at 0/120/240 deg
     ~~~  (   M  chain    ) ~~~     M the Bell-Golem (4 weight units)
     ~~~   (B3        B2)   ~~~     h rim ladders x6
      ~~~~  h   h    h  ~~~~
 z-24  ~~~~~~~~~~~ E ~~~~~~~~~~~
```

**The raft** (kit `Raft`): θ = clamp(0.6° × Σ wᵢ·rᵢ, 20°). Frogs weigh 1 unit and **the golem 4**; its footfalls add +1-unit spikes. Low edge > 12° for 1.5 s: frogs within 1 m of it slide into the water.

**Phase 1, "Ring the rim"** (~45 s). The door-2 golem, on a raft.
- It walks toward bell noise, so **every bell you ring tips the raft toward the ringer**, and the party must counterweight.
- **But moving during a Look gets you clapped.** Dread, then a waltz.
- **Clapper throws:** every 12 s it hurls a 3 kg clapper at the loudest frog (tell: a 1.0 s arm wind-up and an amber glow on the clapper). A hit costs 1 spot. **Long Tongue can snatch the clapper and spit it back: a 2 s stagger** (and progress on the Bell-Eater quest).
- All 3 bells rung → Phase 2.

**Phase 2, "Tip it in"** (~40 s). The golem roars, the bells go silent, and **the chain snaps**: the raft drifts free.
- The golem plants itself at the centre and Looks every 6 s.
- The party lures it toward an edge (it still walks toward bell rings and croaks), then **everyone piles onto the opposite side between Looks** to tip past 20°.
- It slides off, sinks, rings sadly three times from the bottom, and sleeps.

**Plain line:** `[ CLEAR ] Ring its 3 bells. Then tip it in.`

**Clear.** The golem goes overboard. **Party Rank Up** plays, then the Keeper Landing ceremony (D §5). **Fail.** Hard 180 s, or all Dark: 1 Team Life, 50% pay, and the party still reaches the Keeper Landing, where the Quick Climb saves. Target 90 s.

**Keeper feat (stamp only; FO §4.1 gives the Keeper no ×2): "Dry Keeper."** Nobody touched the water all fight: a Bestiary stamp and +5 RP.

**Twists** (seeded climbs only).
- **A `crooked_bell`:** as `bell_golem` A.
- **B `pike_visit`:** in Phase 2 the pike from `lily_raft` circles and leaps at the low side.

**Rank lanes** (climb 1 arrives at Lv6: Tongue III, Hop III, Croak II).

| Rank | Hop | Tongue | Croak |
|---|---|---|---|
| II | Charged hop from the water straight onto the rim, no ladder | Grapple the bell posts (4.5 m) to reposition between Looks | Ring a rim bell from 6 m |
| III | **Air Hop off the tipping raft** (fresh from door 9) | **Snatch its clapper and spit it back** (fresh from door 7) | Twin Toll rings 2 rim bells from between them (seeded climbs, Hard) |
| IV | Stomp pops bell-beetles | 8 m post-to-post chain | Thunder Croak staggers a Look |

**Mites.** Bell-beetles, 5 per frog; at the clear a shower of small bells pops into the rest of the loose fireflies.

**Shared fate.** The raft (everyone's weight) and the Look (everyone freezes).

**Power moment.** Spitting its own clapper back into its face, then Air-Hopping off the edge as it tips. The clear lands `[ CROAK III: AWAKENING ] Twin Toll.` (Lv7) right before Party Rank Up.

**Scaling.** n 1–3: tilt gain 1.2°, the golem weighs 2 units, Looks every 9 s. n 4–8: as written. Hard: tells ×0.7, the golem weighs 5.

**BotPlan.** The Keeper is an exam of taught lessons, so Explore lasts only 20 s.
- Brother Brass calls the pile-on: "On three."
- Moss catches knocked spots.
- **Kestrel slides off once:** "That was on purpose."
- The pile-on that tips it (the key action) needs a human on the tipping side.

**Rewards.** Keeper 60 + 10 loose; Party Rank Up (+1 reroll each); the ceremony.

**Bestiary page: The Keeper, Bell on the Raft.**
- Tip: "Freeze on the glow, move on the silence. Everyone to the far side at once."
- Entry: "The golem from door 2 got a boat. It hasn't learned to swim."

**System.**
- Enter: `[ DOOR 10 · THE KEEPER ] Bell on the Raft. You've met. It's been practising.`
- Phase 2: `[ PHASE 2 ] The chain snapped. Tip it in.`
- Overboard: `[ OVERBOARD ]`
- Dark: `[ DARK ] Clapped and sunk.`
- Clear: `[ KEEPER CLEARED ] It sank. It's ringing down there. Softly.` then `[ PARTY RANK UP ]`
- Fail: `[ FAILED ] It kept its boat.`
- Feat: `[ STAMP ] Dry Keeper.`

**Audio.** The Keeper layer of the Well theme (kalimba plus low brass, F minor pentatonic), which **drops to silence on every Look**; raft creak by tilt; a sad triple ring from under the water at the clear.

**Unity.** `PhaseSequencer` [`BellGolemBrain` (RaftMode), `KeeperTipPhase`]; `Raft` (r 8; chain constraint in Phase 1, free drift in Phase 2); `Bell` ×3; `Clapper` (host rigidbody projectile, snatchable); ladders. NetworkVariables: `Phase`, raft `TiltX`/`TiltZ`, golem `State`.
- **Test hook:** obvious (ring and counterweight, then the pile-on), fail, and an assertion that the clear fires the Keeper Landing ceremony event and Party Rank Up exactly once.

**Tags.** wish `weird_clear_monsters`, `increasing_powers`, `team_up`, `feel_progress`; homage `tb_downstream`, `doors_one_rule`.

### 6.7 The Warden

#### `warden_the_jar` · Warden · 3 skulls · door 20 · [MUST-B] · L · **never slip**

*"A house-sized firefly jar comes down on the brightest frog. At Lv10, that's you."*

**Layout.** The Warden arena is **strand 5's top at y 120**, a round stone deck (r 20 m) open to the Mouth at 74°. The Jar (glass, 6 m tall, 5 m across, cork lid) hangs on a chain from the lip.
```
 z+20        [L1] [L2]            L1 L2 Ledges of Doubt (Phase 3): 4 m high,
           (  catch ring  )        2 m wide, 3 m apart at the north rim
      A1                  A2      A1..A3 "old door" alcoves at r 18 m
            (    JAR    )          (bearings 0, 120, 240 deg)
                  C               C CountdownBell at the centre
             A3        E          the Mouth overhead: 74 deg
```

**The Jar's drop.** Its target is **the brightest frog**: highest Glow Level, ties to the lowest seat. **Tell: a 4 m shadow circle and a rattling chain, 1.5 s.** A trapped ("jarred") frog glows inside the glass, safe but out of play.

**Phase 1, "Old doors"** (~45 s): the power lap.
- Every 12 s an alcove opens and releases a **cameo** of a monster you met this climb, **at its old numbers**, with its own rule. Each cameo lasts 12 s.
- **Cameo pool** (MUST-B): Bell-Golem, Heron, Lamp-Knight, Moss Snail, Web Spider. The Warden picks the 3 most recently cleared, filling from the Bell-Golem.
- **Flattening:** a cameo is pacified by obeying its rule once (one bell, one hide, one Harmony of 3 lamps, one watch, one croak-and-run), **or by a single Thunder Croak stagger**.
- Meanwhile the Jar drops on the brightest frog every 10 s and lifts again after 5 s.

**Phase 2, "Lift the Jar"** (~60 s). The Jar drops on the brightest frog and stays.
- **A Chorus lifts it:** at least min(3, living − 1) frogs croaking within 0.3 s of each other within 6 m lift it 1 m.
- Twin Toll and Thunder Croak each count as 2 croaks, and the Chorus Boon adds 1. The jarred frog can croak too, muffled.
- The CountdownBell helps: Brother Brass rings it, "On three."
- **3 lifts** free the frog and crack the lid. The Jar rises, then 6 s later drops on the new brightest frog. **2 lid cracks → Phase 3.**

**Phase 3, "Trust Fall"** (~50 s; CRIT #22 and #30 fixes).
- The arena tilts 8° north. Two Ledges of Doubt rise, and the cracked Jar hovers above them.
- Fallers go **in pairs** (brightest pair first). Each stands at the edge **facing away**, with the camera locked, and holds Hop for 1 s to fall backwards. After 12 s a Tower wind pushes them.
- **Catchers see a drifting shadow circle** (±1 m seeded drift, shown only to catchers). A catch is a Tongue on the faller while airborne within reach, or standing in the circle at landing.
- **Caught:** a gold flash, and the chain loosens one link. **Dropped:** −1 spot.
- When every living frog has fallen once, **the chain snaps, the Jar lifts into the Mouth, and ★1 begins.**

**Plain line:** `[ CLEAR ] Survive the old doors. Lift the Jar. Then trust someone.`

**Clear.** Phase 3 complete → ★1 Out of the Well (01 owns the choreography), then `rim_surface`.

**Fail.** Hard 330 s, or all Dark at once. That costs 1 Team Life and pays 50% of the Warden bonus (once). The Warden **restarts at the current phase** with everyone revived on 1 spot. At 0 Team Lives the climb ends in results without ★1, and **Retry from door 11** is offered until the profile first surfaces (D §8.2 #16). Target 180 s.

**Warden feat (stamp only): "Nobody dropped."** Every fall caught the first time: a Bestiary stamp and +5 RP.

**Twists.** None in the slice. The Warden is fixed.

**Rank lanes** (every lane lands at Lv10: every verb is rank IV).
- **Phase 1:** Thunder Croak flattens any cameo; Moon Hop's shockwave pops cameo mites; Air Hop dodges heron passes.
- **Phase 2:** Twin Toll and Thunder count double, so **two bright frogs can lift what took four**.
- **Phase 3:** Long Tongue (6 m) and Tongue IV (8 m) catch from well outside the circle; Air Hop repositions under a drifting shadow.

**Mites.** Jar-moths, 5 per frog, spill from the Jar each time it lifts; plus the cameos' own mites.

**Shared fate.** The Jar traps one frog and needs the others to lift it. The fall needs a catcher.

**Betrayal hook.** None (Heart doors only). Not catching is mischief; blame tag (friends only): "Dropped by: Vex." Rivals always try to catch.

**Power moment.** The power lap: the Bell-Golem that took you 1:12 at door 2 folds to one Thunder Croak. Then the Jar picks you *because* you're the brightest thing in the Well.

**Scaling.** n = 1–2 living: Phase 2 needs 1 croak plus the CountdownBell (a 2 s sustained croak lifts 1 m). **Phase 3 is skipped with only 1 frog alive** (no catcher), and the chain snaps after Phase 2. n 3–8: as written. Hard: drop tell 1.05 s, 4 lifts per crack.

**BotPlan.**
- *Phase 1:* Rivals flatten cameos by rule right away. The Warden is an exam, so there's no 90 s guard; the key action, finishing Phase 3, needs everyone anyway.
- *Phase 2:* Brass calls and Rivals croak on NOW.
- *Phase 3:* **Brother Brass falls first:** "I'll go first." Rivals catch with human jitter; Rookie Rivals drop 10% (a funny failure, within the Director's limits).

**Rewards.** Warden 120 + 10 loose; Party Rank Up; ★1; +25 RP (04).

**Bestiary page: The Warden, the Jar.**
- Tip: "It comes down on the brightest frog. Croak together to lift it, then fall together."
- Entry: "Somebody kept fireflies in it once. Now it keeps whoever shines the most."

**System.**
- Enter: `[ DOOR 20 · THE WARDEN ] The Jar. It collects bright things.`
- Jarred: `[ JARRED ] You were the brightest thing here. Congratulations.`
- Phase 2: `[ PHASE 2 ] Croak together. It's heavy.`
- Phase 3: `[ TRUST FALL ] Step back. Someone is probably there.`
- Caught: `[ CAUGHT ]` · Dropped: `[ DROPPED ] Probably.`
- Dark: `[ DARK ] Kept in the Jar.`
- Clear: `[ WARDEN CLEARED ] The Jar is lifting. Hold on.`
- Fail: `[ FAILED ] The Jar keeps you. For now.`

**Audio.** The Well theme's full arrangement in F (kalimba, choir, low brass). Each Chorus lift plays a rising chord through the glass's resonance. The Trust Fall is a heartbeat, then silence during the fall, then a warm chord on each catch.

**Unity.**
- `PhaseSequencer` [`WardenOldDoors` (spawns cameos through `MonsterBrain.CameoMode`: a 12 s lifetime inside an alcove volume), `WardenJarLift`, `WardenTrustFall`].
- `JarBody` (kinematic; `<half> Height`, `<ushort> TrappedSeat`, `<byte> LidCracks`); `CountdownBell`; `LedgeOfDoubt` ×2 (`<byte> FallerSeatA`, `<byte> FallerSeatB`); `CatchCircle` (rendered only on catchers' clients).
- The clear raises `WardenCleared`, which `StarRevealDirector` (01, 10) consumes.
- **Test hook:** all phases with Wit-100 bots (obvious); a mid-phase wipe restarts at that phase (fail); and a determinism test that the Jar's target is max Glow with ties to the lowest seat.

**Tags.** wish `frog_well_sky_space`, `increasing_powers`, `team_up`, `feel_progress`, `top_visuals`.

---

## 7. The Rematch overlay [MUST-B]

The in-climb version of "steamroll old content" (FO §3.2, §4.1): a room you struggled with, at its old numbers, against the frog you are now.

| Rule | Value |
|---|---|
| How many | Exactly one per Full Climb, in doors 15–19, as a **single door** (no pair: it's a guaranteed power beat). The Rank SSS talent makes it two |
| Climb 1 | Door 18 is always `bell_golem` |
| Seeded climbs | Among the **group rule doors cleared earlier in this climb** (not E, not Heart, not set pieces), take the one with the **longest clear time**; ties go to the lowest door. If none qualifies, `bell_golem` at its door-2 numbers |
| Old numbers | The same Twist, layout seed, skulls and monster tuning as the first visit. Your current Glow, verb ranks and Boons apply in full. **Nothing is clamped** (FO §4.1) |
| Plaque | Number and letter of the current slot, the room's suit, **the Rematch hourglass with the old time (`1:12`) in the prize slot**, and skulls. It's the only plaque that shows a time |
| In the room | The room clock counts up, with the old time beside it in grey |
| On clear | One full-width line (not a full-screen card): `[ REMATCH ] OLD TIME 1:12 → 0:18` |
| Onlookers | At ≤ ⅓ of the old time, a Rival bark from FO §5.3's set ("An F-rank cleared a three-skull door?!" or its Rematch cousin, "An F-rank did *that*?!") |
| Pays | Normal rule-door yields at the Rematch door's d, and the Boon pick. A hidden clear still pays ×2: the Rematch is where most players first land a room's hidden clear |
| Sealed | Available (every human has the Cleared stamp by definition) |
| Can fail | Yes: the ordinary rules apply |
| Steam Timeline | A standard marker; a featured marker at ≤ ⅓ of the old time |
| LATER | From the Sky onward, a Rematch may pull an earlier layer's room (FO §3.2) |

**Unity.** `RematchOverlay` is data on the slot (`rematchOf: <roomId>`, `oldTimeSec`, `oldSeed`, `oldTwist`), not a new room. `RoomState` loads the old seed and Twist. **Test hook** `Rematch_OldNumbers`: clear `bell_golem` at door 2 with rank-I verbs, then again at door 18 with rank-IV verbs, and assert identical monster tuning and a shorter time.

---

## 8. Definition of Done and tests

### 8.1 Definition of Done (every room, before it counts as built)

1. **Contract.** The RoomDef JSON is complete and every validator in §8.2 is green.
2. **Style.** It matches the `bell_golem` style-lock (toon ramp, outline, rim light, self-lit tells), and nothing frog-only is locked before Gate A (D §2).
3. **Cue.** Lead time 2–5 s (breathers exempt), positional audio, **and a visual twin**.
4. **Rule.** ≤ 14 words in English; the Sealed rendering has been checked on screen.
5. **Clears.** Obvious, hidden and fail are all reached by `AutoSolve`.
6. **Soak.** 8 bots clear it within the hard cap on ≥ 90% of 50 seeds. Heart doors resolve on 100%.
7. **First-visit guard.** No Rival fires the key action in the first 90 s while a human stub lacks the Cleared stamp.
8. **Muted audio.** Bots perceiving only visual tells clear it on ≥ 90% of seeds.
9. **Lanes.** A rank-II lane exists, and rule doors and set pieces have a rank-III lane for each of Hop, Tongue and Croak. `LaneReachabilityTest` checks each lane with a kinematic probe at the gauge values.
10. **Juice.** Squash on every hop landing; 50–120 ms hitstop on hits and pops; rising-pitch count-ups at the clear; Cinemachine Impulse on monster acts; a firefly pop on every mite.
11. **Readability.** Every tell's emissive luminance is ≥ 3× the room's mean (GB), checked from 25 m.
12. **Golden screenshots.** 3 at seeds 1–3 (entry wide shot, cue moment, clear moment) under `Assets/Tests/Golden/Rooms/<id>/`.
13. **Performance.** Host simulation ≤ 8 ms and frame time ≤ 16.6 ms at 1080p with 8 seats, this room and one other live room (D §12).
14. **Network.** Plays at 150 ms RTT and 2% loss in MPPM (1 host, 3 clients, 4 bots) with no `RoomState` desync.
15. **Localization.** Every string is in the `Rooms` table, and no System template contains "%" without a bound key (FO §8.6).
16. **Bestiary.** Rule monsters, Keeper and Warden have a page with tip, hidden line and entry.
17. **Tags.** `wish[]` and `homage[]` set.
18. **Licences.** Every imported asset has a `licenses.csv` row.
19. **Steam Timeline.** A standard marker on clear.
20. **Human feel review.** A frame-sequence clip is exported from the soak build for a human review at each milestone, because agents can't judge motion (plan_2 risk 2).

### 8.2 Tests

**Auto-solve hook.** Every room ships an `IRoomAutoSolver`, which drives the same `ClimberInput` path bots and humans use (UT):

```csharp
public interface IRoomAutoSolver
{
    IEnumerator SolveObvious(RoomTestContext ctx);
    IEnumerator SolveHidden(RoomTestContext ctx);  // may call ctx.SetVerbRank(verb, rank)
    IEnumerator ForceFail(RoomTestContext ctx);    // Heart doors: ForceBetrayal instead
}
```

| Suite | Kind | What fails the build |
|---|---|---|
| `RoomDefValidatorTests` | EditMode | A missing field; more than one `MonsterBrain`; missing lanes; a rule over 14 words; bad `sealedKeep`; a Twist touching a baked object; unknown tags; a missing Localization key; a tell hex within 15° hue of the betrayal crimson |
| `ClimbGeneratorTests` | EditMode | Any §4.2 constraint broken across 1,000 seeds (forks, Heart placement, gold, Rematch, set-piece halves, suits, debut rule, pool rule, bands) |
| `GrowthCurveTest` | EditMode | Climb 1's Lv5 outside doors 6–8 or Lv10 outside doors 17–19 (D §5) |
| `WishCoverageTest` | EditMode | Climb 1 plus seeded climb 2 missing any wish tag (D §8.2 #28) |
| `BestiaryCoverageTest` | EditMode | Fewer or more than 14 pages |
| `Rooms_AutoSolve_<id>_{Obvious,Hidden,Fail}` | PlayMode | No clear or fail event; yields that don't match FO §4.1; `[ NOTED ]` not fired on the hidden path |
| `Rooms_FirstVisitGuard_<id>` | PlayMode | A Rival key action before 90 s |
| `Rooms_MutedAudio_<id>` | PlayMode | Below 90% of seeds cleared with audio perception off |
| `Rooms_SealedDecode_<id>` | PlayMode | A decode bot (no rule text; physical tells only) clears under 80% of seeds [MUST-B] |
| `Rooms_Soak` | Headless player (`-bots 8 -seed N -runSeconds 1500`) | Exceptions, desyncs, stuck rooms, or under 90% of 50 seeds |
| `Heart_LeakTests` | PlayMode | A secret choice, a Mimic's seat or a private offer reaching any client but its owner |
| `Rematch_OldNumbers` | PlayMode | §7 |

**CLI.** `unity run KNOTWELL --command GenerateRooms -- --seed 42` builds every prefab. `unity run KNOTWELL --command CaptureRoomShots -- --room <id> --seeds 1,2,3` writes the golden screenshots. Both gate on exit code 0 (UT).

---

## 9. Roster and Bestiary check

**All 34 MUST rooms are specified** (D §6 rows 1–34):

| Kind | Rooms | § |
|---|---|---|
| Hubs and onboarding (5) | `hub_well_bottom`, `hatch_pond`, `landing_well`, `meeting_room`, `rim_surface` | 6.1 |
| Toys (4) | `toy_frog_stack`, `toy_jar_tag` (6.1); `toy_fly_catch`, `toy_lily_sumo` (the 2 toy doors, 6.2) | 6.1, 6.2 |
| Breathers (5) | `br_shove_door`, `br_window`, `br_jar_mites`, `br_gold`, `br_sleeping_toad` | 6.2 |
| Rule doors (12) | ♠ `bell_golem`, `heron_shadow`, `snake_coil` · ♦ `fog_stair`, `echo_warren`, `moss_snail` · ♣ `lily_raft`, `snapper_crossing`, `lamp_knight`, `web_spider` · E `slime_foundry`, `glitch_eye` | 6.3 |
| Heart doors (4) | `heart_two_pads`, `doppelfrog`, `heart_split_swallow`, `heart_tied_bridge` | 6.4 |
| Set pieces (2) | `sp_grip_wall`, `sp_tongue_tether` | 6.5 |
| Keeper and Warden (2) | `keeper_bell_raft`, `warden_the_jar` | 6.6, 6.7 |

**The 14 Bestiary pages** (04 owns the system; the tips are here):

| # | Page | Room | Death tip | Hidden line |
|---|---|---|---|---|
| 1 | The Bell-Golem | `bell_golem` | It can't hit a statue. Its eyes warn you two seconds early. | the gold circle remembers every bell |
| 2 | The Heron | `heron_shadow` | Its wings warn you three seconds early. Under a pad, you're a lily. | it drops something it can't bear to lose |
| 3 | The Pike | `lily_raft` | It only leaps at the low side. Keep the raft flat. | nobody got their feet wet |
| 4 | The Fog Eel | `fog_stair` | It only bites what the lantern-fish light. Wait in the dark. | the fireflies know a way you can't see |
| 5 | The Snapper | `snapper_crossing` | It bites whatever is fastest. Be slow; make something else fast. | it's never been full |
| 6 | The Burrower | `echo_warren` | It goes where you croaked, not where you are. Croak, then move. | make it go home |
| 7 | The Lamp-Knight | `lamp_knight` | Out of time is out of tune. Croak on NOW. | it can't relight what it can't see |
| 8 | The Coil Snake | `snake_coil` | It hunts splashes, not frogs. One frog per pad. | give it something it can't resist |
| 9 | The Moss Snail | `moss_snail` | Someone must always be looking at it. | it hates being looked at, even by itself |
| 10 | The Web Spider | `web_spider` | It always answers a croak. One calls, the rest run. | let the gorge croak for you |
| 11 | The Chrono-Slime | `slime_foundry` | It shows its next dash. Steam and frozen friends are walls. | the cold keeps two things as well as one |
| 12 | The Glitch Eye | `glitch_eye` | It only sees what faces it. Wear a leaf and listen. | eyes open, and never meet its gaze |
| 13 | The Keeper, Bell on the Raft | `keeper_bell_raft` | Freeze on the glow; tip it on the silence. | (stamp) Dry Keeper |
| 14 | The Warden, the Jar | `warden_the_jar` | It takes the brightest. Croak together, then fall together. | (stamp) Nobody dropped |

**TEAMBOUND_13 homes** (D §6): Summit → `sp_grip_wall` · Chained ascent → `sp_tongue_tether` · Downstream → `lily_raft` (and the Keeper's raft) · Echo Chamber → `echo_warren`, `lamp_knight` · Delivery → `snapper_crossing` · Tower of Babel → `toy_frog_stack` and the stacks in `heart_two_pads` · One Body and Deep Dive → SHOULD rooms in 06.

---

## 10. Open questions

These rules are followed as written above; each needs an owner's confirmation.

1. **Consensual hauls (§3.8).** Rescue ropes, grip-wall hauls, raft recoveries and Trust Fall catches all move a frog farther than FO §5.4's 1 m tug cap. This file treats them as uncapped *because the moved frog opts in* (it holds Tongue toward the hauler, or chose to fall). **02 and 03 should confirm**; otherwise those five rooms need redesign.
2. **The toll rule (§2.1).** FO gives croak radii but not how many bells a croak rings. "Nearest 1, nearest 2 from Twin Toll, all only via EchoSpot, Duet or Chorus" is this file's reading. It is what makes Twin Toll and the Echo Toad quest mean something. **02 should confirm.**
3. **Heart doors pay rule-door yields.** FO §4.1 is silent. This reading keeps D §5's growth check exact (door 11 = 483, door 14 = 612). **04 should confirm.**
4. **`heart_two_pads` stakes.** Left-behind frogs lose only their jar share and unbanked cheek fireflies, and keep the clear bonus and the Boon pick. This stays inside "betrayal moves only unbanked room loot", but the dilemma may feel soft. **Playtest.**
5. **Warden Phase 1 cameos** need `CameoMode` in 5 brains (L). If they slip, Phase 1 runs three Bell-Golem cameos at their old numbers.
6. **`sp_grip_wall` has no suit in D §6.** It's assigned ♠ (Body) here.
7. **Crossing clears require a living human in the exit zone** (§6.3). This keeps the 90 s guard from being dodged in crossing rooms; flag it if 03 prefers a different guard.
8. **`glitch_eye`'s blinker leaf** is a tongue-carried prop, so the shut-eye needs no new binding.
9. **The Sealed opt-in** is a stone seal you tongue under the plaque (§3.6), so it needs no menu. 07 and 09 may prefer a UI toggle.

