# KNOTWELL · 07 · The Well Bottom, Landings and the toys

**Version** 1.0 · **Date** 2026-09-29 · **Status:** master design, bound by `DECISIONS.md` (**D**) and `_design/FUN_OVERHAUL.md` (**FO**).

**What this file owns** (D §9):
- `hub_well_bottom`: the title screen, the lobby, the map wall, the four difficulty doors, the statue, the Mirror, friends' best doors;
- `hatch_pond`, shot by shot;
- Landings: stations, the 40 s budget, the jar lineup presentation and the Keeper Landing ceremony;
- `meeting_room`: layout, waiting play and the rescue-rope flow;
- the 4 toys (`toy_frog_stack`, `toy_fly_catch`, `toy_jar_tag`, `toy_lily_sumo`): rules, controls, scoring, rewards, Rival behaviour and homages;
- Landing Party mode;
- `rim_surface`: layout and staging.

**What it does not own:**
- RoomDef data, kit and test hooks for these rooms (`05`);
- coin and jar amounts, stall prices, the results ceremony's content, failure and saving rules (`04`);
- Knot, Cut, Vengeance, barks, the Drama Director and Rival brains (`03`);
- the cosmetic catalogue and the Mirror's screens (`08`);
- the ★1 choreography, the map's drawing and the Mouth's geometry (`01`);
- verb numbers and the body (`02`);
- palettes, UI styling and audio (`09`);
- netcode and scenes (`10`).

**Tags:** [MUST-A] ships in the Quick Climb and free demo, [MUST-B] in the Full Climb, then [SHOULD] and [LATER]. **Numbers:** every number is a **greybox (GB)** hypothesis unless it cites FO or D. All of them live in JSON (§9).

**Coordinates:** metres, y up. Hubs use a **deck frame**: the origin is at the deck's centre at floor height, +z points radially outward toward the well wall, and −z points in toward the well axis. Rooms use `05`'s room frame (+z runs from entry to exit). Well positions are `10` §5.2.

**The test for every row:** does it make the player *feel stronger, laugh, or see something bigger* within about 90 s (D §5)? Does it keep hands busy? A row that only adds waiting or bookkeeping was cut.

---

## 1. The never-idle contract

The GDD spent 20–55% of every floor outside rooms, and its minigames were "rarely played" (FO §1 #7, CRIT #26). Every stop in this file obeys these rules.

### 1.1 Ten rules [MUST-A]

1. **No wait nobody can play through** (FO §2.2 "fun before rules"). Wherever a frog can stand still, something within 8 m can be popped, played, worn or looked at.
2. **Input is never locked** outside three camera moments:
   - the 2.8 s hatch;
   - the Keeper pull-back, which the player steers;
   - ★1 (`01`).
3. **Overlays, not screens.** Picks, ceremonies and results draw over the lower third while your frog keeps moving. **At most one full-screen card per door** (D §5). No stop in this file uses one.
4. **Every stop pays something you can see:** a jar pops, the Mouth has grown, a hat drops, a chain falls, a lantern lights.
5. **Nobody waits on a slow human.** A Landing's exit opens by walking (§4.4). A fork's rescue rope drops at 45 s (§5). A lobby has toys (§2.7).
6. **Toys are opt-in on Landings and mandatory only in toy doors.** You join a Landing toy by walking into it; nobody is pulled in.
7. **Warm stops.** Hubs and Landings are lantern-lit and loud: "dread, then a waltz" (FO §2.2). They hold no monsters and no mites, and nothing on them can cost a spot.
8. **Every stop is a bookmark.** Every Landing saves. Rest is always one walk or one button away, with the same weight as going on (FO §8.4).
9. **The System speaks at most twice per stop per client,** in one-line `[ BRACKETED ]` windows that name a change and its cause (FO §6.2 #4).
10. **No loading screens between doors.** Every room is a cell in `Well.unity` (`10` §5.3), and the stair ride or the walk through a door hides each cell switch.

### 1.2 Time budget (first Full Climb, median, GB)

| Stop | Target | What fills it | Counted outside rooms? |
|---|---|---|---|
| Title → in control | **≤ 0:05** (FO §3.5) | Press any key; the egg hatches (2.8 s) | no (before the climb) |
| `hatch_pond` (door 0) | 35 s first climb, ~15 s repeats | hop, gulp, the Kestrel laugh | no: it is door 0 |
| Landing 1 | **40 s** | jar lineup, Frog Stack, Mirror | yes |
| Keeper Landing | **40 s** (D §5: 10:25–11:05) | the ceremony, the stall, jars, Frog Stack | yes |
| Landing 3 | **40 s** | the Knot offer, stall, jars, Jar Tag | yes |
| Walk-ins and stair rides | ~60 s total | door plaques, the counter slam | yes |
| Meeting rooms (forks 12 and 17) | 5–45 s of waiting, then the rope | Jar Tag, Frog Stack, the live window, the hatch | no: part of the fork door |
| Toy doors (6 and 16) | ≤ 30 s door to door | the toy | no: they are breathers |
| Results (Rim or Well Bottom) | ~20 s | roam while it plays | after the climb |

**Outside-room share:** 3 × 40 s + ~60 s = 180 s of ~1,440 s = **12.5%**. FO §3.5 caps it at 12%. The cap holds if the **median Landing is ≤ 38 s**, which the walk-out exit rule allows (§4.4). Telemetry tracks `landing_duration` per stop, and a median over 40 s is a pacing bug.

---

## 2. `hub_well_bottom`: the Well Bottom [MUST-A]

**What it is.** The menu *is* the well bottom (FO §6.1; D §6 row 1). You are in control a few seconds after pressing Play (`10` §5.1: Boot starts a solo host and loads `Well.unity` at once). One place does three jobs:
- the **title screen**;
- the **lobby**, where friends drop in as eggs;
- the **trophy room**, where everything permanent you earned shows as something physical.

It sits on the Foot, a mossy stone deck of radius 18 m on strand 1 at y 0, with black water all round (`05` §6.1, `10` §5.2). The Mouth is a 31° coin of sky 180 m overhead (D §4).

### 2.1 Three states

| State | When | What the player sees first | Tag |
|---|---|---|---|
| **First launch** | a new profile | the title loop, then the hatch, then Moss waiting in the open Normal doorway. Only the eggs, the statue, the map, the four doors, the Bestiary stones (dark) and a **veiled** Mirror are present. | [MUST-A] |
| **Returning launch** | any later launch | the title loop with the curiosity teaser (`Something is waiting in 12E.`, FO §4.4 #8), then the hatch, then the full hub with everything unlocked so far | [MUST-A] |
| **Coming home** | after results, on **Climb again** | no title: the eggs are already in their nests and hatch at once (§2.10) | [MUST-A] |

### 2.2 Layout (deck frame)

```
                         +z  (outward; the well wall is 21 m past the deck edge)
  ....................................................................  parapet r 19 (outer half only)
       [Bestiary stones]      [======= MAP SLAB 6 x 4 m =======]      [Best-door wall]
         (-7.5, 13.5)                   (0, 14)                         (7.5, 13.5)
  [Supporter shelf, B]
    (-12, 10.5)      (M) Mirror (-9, 8)                     (S) statue (9, 8)
                                      e(-2.3,5.5)  e(2.3,5.5)
                             e(-5.5,2.3)                 e(5.5,2.3)
   class pads, B )                        (P) plinth (0,0)
   r 12, 232.5-277.5 deg     e(-5.5,-2.3)                e(5.5,-2.3)
                                      e(-2.3,-5.5) e(2.3,-5.5)
   (T) toy door, B (-15,-4)                                  (R) Resume / Retry door (15,-4)
                                        (L) seal lever, B (0,-10)
          [ EASY ]         [ NORMAL ]         [ HARD ]          [ HELL ]
         (-10.5,-12)       (-3.5,-12)        (3.5,-12)        (10.5,-12)
  ~~~~~~~~~~~~~~~~~~ stone steps down to hatch_pond (water y -2) ~~~~~~~~~~~~~~~~~~
                         -z  (toward the well axis, 30 m; the Mouth is overhead there)
```

Placements marked with `05`'s coordinates are theirs (eggs, map, Mirror, statue, doors); the rest are this file's. East of the deck, free-play lily pads float on the water at (25, −1.8, −6) [MUST-B].

**Look (GB; `09` owns palettes):** water `#07090D` under a mist `#1A2230` up to +8 m; stone `#4A4540` with moss `#557D33`; ten parapet lanterns `#FFB86B`; the light pillar from the Mouth `#FFF4E0` at 5.5% opacity (WORLD §4.5); UI panels `#0E0B10` at 88% with text `#F4EDE3` and gold `#FFD76A`.

### 2.3 Stations

Interaction is always **Tongue** (it is Interact, FO §3.9). A prompt glyph appears when a frog is within 2.5 m and facing within 45°. Panels are UI Toolkit overlays; the world keeps running behind them.

| Station | Position | Does | Present | Tag | Content owner |
|---|---|---|---|---|---|
| **8 eggs** in stone nests | r 6, bearings 22.5° + 45°·k; seat 1 at 202.5° (nearest the Normal door), then clockwise | one egg per seat; each glows in its **Seat Hue**; hatches its frog (§2.4) | always | A | `02` (Seat Hue), `05` (`HatchEgg`) |
| **Four difficulty doors** | x −10.5 / −3.5 / 3.5 / 10.5 at z −12, facing −z | start a climb at that difficulty (§2.5) | always; Hard and Hell chained until unlocked | A (Hell B) | `04` (difficulty rules) |
| **Map slab** | (0, 0, 14), 6 × 4 m, facing −z | the ring map drawn in glowing chalk; Tongue opens it full-screen | always | A | `01` (drawing) |
| **Best-door wall** | (7.5, 0, 13.5), a 3 × 2 m slate | chalked "best door" rows for you and friends (§2.6) | always | A | this file |
| **Bestiary stones** | (−7.5, 0, 13.5), 14 stones in 2 rows of 7 | each stone is one page; notches light per stamp; Tongue opens the Bestiary | always (dark until seen) | A | `04` |
| **Statue of the first frog** | (9, 0, 8), 0.9 m on a 0.6 m plinth | looks up, one arm pointing at the Mouth; Tongue reads the inscription | always | A | `01` (lore) |
| **The Mirror** | (−9, 0, 8), a round brass frame 1.6 m tall holding a standing sheet of water | Tongue opens the Mirror (try-on, buy with Pearls) | always; **veiled** by a lily-leaf curtain until the profile's first Keeper clear | A | `08` |
| **Supporter shelf** | (−12, 0, 10.5), a moss shelf, two 0.6 m frog statuettes wearing the Supporter Sets | Tongue opens the Mirror's Supporter tab | B builds | B | `08` |
| **Class pads** (10) | r 12, bearings 232.5°–277.5°, every 5° | stand on one for 1.0 s to set your starting form (§2.6) | from climb 2 | B | `04` |
| **Seal lever** | (0, 0, −10) | Tongue-hold 0.5 s toggles **Sealed** for the lobby's next climb (host only) | after the profile's first finished climb | B | `04` |
| **Resume / Retry door** | (15, 0, −4), a 2.4 × 3.2 m arch facing the deck centre | continues the host's saved climb (§2.5) | only while a save exists | A (Retry B) | `04` (rules) |
| **Toy door** | (−15, 0, −4), a 2.4 × 3.2 m arch carved with the 4 toy icons | starts **Landing Party** (§7) | after the profile's first Keeper clear | B | this file |
| **Free-play Frog Stack plinth** | (0, 0, 0), inside the egg ring | Frog Stack rules; no jar, no record (§2.7) | after the first Keeper clear | A | this file |
| **Free-play lily pads** | 5 pads on the water at (25, −1.8, −6) | Lily-Pad Sumo rules; no jar, no record | after the first Keeper clear | B | this file |
| **Lantern gnats** | a few gnats round each parapet lantern | tongue them for a *plink*; nothing else | after the first Keeper clear | A | this file |

**There is no Boon station.** The GDD's shared pick station is cut (FO §7). Boons are offered privately, in place, as an overlay (`04`). **There is no stall at the hub:** Wish Coins exist only inside a climb (FO §4.3).

### 2.4 The eggs and the lobby [MUST-A]

- **Always 8 eggs**, one per seat. Humans' eggs glow brighter than Rivals' eggs. A Rival's egg carries a small leaf tag reading **Rookie** during a player's first 5 climbs (FO §5.3).
- **Egg look:** translucent jelly, 0.45 m tall, bobbing ±0.03 m at 0.4 Hz in a 1.1 m stone cup of water, with the seat's Seat Hue glowing inside.
- **Well-Rested** shows as a small moon with 1–2 pips floating over your own egg (`04` §10.6). It is the only meter in the hub.
- **Hatch (2.8 s):**
  - wobble 0.8 s;
  - crack 0.8 s;
  - tadpole flip 0.6 s;
  - pop 0.6 s into a dim Lv1 froglet standing in the cup.
  - Rivals' eggs hatch 0.2–0.9 s after yours, each at its own offset.
- **Inviting.** Esc → **Invite** opens the Steam overlay invite. On LAN, Esc → **LAN** lists discovered hosts (`10`).
- **A friend joins:**
  - The Rival in that seat waves, hops into the water and swims off, with one line (`03`).
  - The friend's egg falls down the light pillar: a 2.0 s streak with a rising whistle, then a plop into the seat's cup.
  - The egg hatches at once (2.8 s). The whole hub hears it.
- **Joining someone else's game** restarts the NetworkManager behind a 0.6 s fade (`10` §5.1). You arrive as a falling egg in their hub.
- **Leaving.** Your seat's frog turns back into an egg that bobs in the cup, and a Rival hatches from it 2 s later.
- **Lobby settings** are an Esc panel, not a station. The host sets lobby type, human betrayal, blame tags, Rank Sync and Masked Rivals; the rules for each are `03` §2.

### 2.5 The difficulty doors: choosing how brutal [MUST-A]

The Tutorial Is Too Hard chooses difficulty at the entrance. So do we (FO §3.6, D §4): four giant doors, visible from the first frame.

| Door | Lamp | Leaf | Lintel plaque (≤ 8 words, true numbers from FO §3.6) | Chain tag |
|---|---|---|---|---|
| **EASY** | `#9BE07A` | 0 skulls | Unlimited lives. 4 spots. | — |
| **NORMAL** | `#FFB86B` | 1 skull | 3 Team Lives. | — |
| **HARD** | `#6AA8FF` | 2 skulls | 2 lives. +1 skull. Fireflies ×1.5. | `Clear a Keeper.` |
| **HELL** | `#FF5A1F` (never betrayal crimson) | 3 skulls | 1 life. Rules redacted. Fireflies ×2. | `Clear a Warden on Hard.` |

- **Size:** 3.2 m wide and 4.5 m tall, with stone frames and dark wood leaves. The carved words are localized (`hub.door.easy` and so on), and skulls are painted in glow chalk.
- **Hard in the demo.** Hard is a data flag in Milestone A, unlocked by a Keeper clear, which the demo contains (D ruling 7).
- **Hell in the demo.** The demo has no Warden, so the System must not promise one there. The demo's Hell tag reads `Full game: clear a Warden on Hard.`
- **Unlocks are per lobby** (FO §3.6). The most advanced member's unlocks cover everyone.
  - When such a member is in the lobby, or joins, the chains burst: links snap one by one over 1.2 s with rising pentatonic *tings*, and the padlock plops into the water.
  - `[ UNLOCKED ] Hard, for this lobby.`
- **Your own first unlock.** You earn it at the Keeper, and the chains fall on your next hub visit, 1.0 s after you hatch: `[ UNLOCKED ] Hard. +1 skull everywhere. Fireflies ×1.5.` This is felt progress you can walk through.
- **Starting a climb (the start ring):**
  - **Solo.** Stand in an open doorway for 0.5 s and it opens. No vote, no wait.
  - **2+ humans.** The first human to step into a doorway starts a **10 s ring** that fills around that door's lamp, visible to everyone.
    - The vote resolves early, 2 s after every human stands in some doorway, or when the ring completes.
    - The door with the most humans wins; a tie goes to the first human's door (FO §3.3). Only humans count (`03` G15).
    - The 10 s gives a friend in the Mirror fair notice. The Landing walk-vote is 4 s, because a Landing is not a dressing room.
  - **If a save exists,** the first human to step into a difficulty doorway sees `[ NEW CLIMB ] This replaces your save at DOOR 10.` (`04` §11.3), and the solo dwell rises to 1.5 s.
  - When the vote resolves, the door grinds open over 1.0 s with 80 ms hitstop. Anyone not yet through is carried in by a warm gust over 1.5 s (no damage, no tug): `[ THE TOWER ] Onward.`
  - Every door leads down the steps into `hatch_pond` (§3).
- **The first launch** skips the vote. The Normal and Easy doors stand open, Moss waits in the Normal doorway ("Here."), and walking through either one starts the authored first climb at that difficulty (D §5).
- **The seal lever** [MUST-B]:
  - Pulling it stamps **SEALED** in deep-blue ink `#3A4BA8` across all four lintels.
  - `[ SEALED ] Rules hidden in rooms everyone has cleared. Fireflies ×1.5.` Sealed touches only rooms whose Bestiary page every human in the lobby has stamped Cleared, so a first visit is always plain text (`04` §11.1 owns the rule; FO §3.8).
  - The lever greys out while Hell is lit, because Hell always redacts.
- **The Resume door:**
  - **Lintel:** the next door after the saved Landing, `DOOR 11 · RESUME`, with the saved difficulty's word under it.
  - **Walking in** uses the same start ring. The party arrives at that Landing with the normal arrival sequence (§4.3). Nothing already paid is paid again (`04`).
  - **After a post-Keeper wipe,** until the profile first surfaces, the same arch reads `DOOR 11 · RETRY` [MUST-B] (D §8.2 #16; `04` owns the rule).
  - **Only the host's save shows.** The host holds the seed and state (`10`).

### 2.6 The trophy wall: what the hub remembers [MUST-A]

Body and Build reset every climb, so the hub is where the Legend track becomes *physical* (FO §4.3). Every row below changes the room itself, not a menu.

| You earned | The hub changes | Tag |
|---|---|---|
| First Keeper clear | Hard's chains fall; the Mirror's veil drops; the free-play toys appear; the toy door lights [B] | A |
| A Bestiary stamp | a notch lights on that monster's stone. There are 4 notches: Seen, Survived, Cleared, Hidden clear. An unseen stone is blank and dark. | A |
| A new best door | the chalk number on your row is rubbed out and rewritten, with a squeak | A |
| A Tower Rank letter | the letter is carved, then gilded `#FFD76A` from E upward, on the **north face of the statue plinth**, facing the map | A |
| A class unlocked | its pad lights and shows its body marking | B |
| First surfacing | the map inks the Sky band (`01`); your row shows `20`; rank S becomes possible (`04`) | B |
| A Warden cleared on Hard | Hell's chains fall | B |

**The best-door wall** ("Best door: 37" is the brag, FO §3.1):
- Up to 8 chalk rows: **you** first, then friends sorted by best door, highest first. Example: `Pip · 37`.
- **Source:** a Steam stat `BEST_DOOR` (INT).
  - Written at results when you beat it: `SetStat` + `StoreStats`.
  - Read for each Steam friend who owns the game: Facepunch `Friend.RequestUserStatsAsync()`, then `GetStatInt("BEST_DOOR")`. `10` owns the wiring. The stat needs our AppID's stats config, so Spacewar 480 uses the fallback.
- **Fallback** (LAN, no AppID, or offline): people you have climbed with, from the local profile, with the best door their client reported at the lobby handshake, marked with a small LAN glyph.
- **Solo fill:** with fewer than 3 human rows, Rivals who climbed with you fill in, as true data: `Kestrel · 14 (with you)`.
- Tongue the wall to see up to 20 friends. The wall never shows online status, and nothing ever says "X passed you" outside the game (FO §8.4 #3).

**The statue.** The first frog, 0.9 m, on a 0.6 m plinth, looking up with one arm pointing at the Mouth. The south face (toward the eggs) is carved 우물 안 개구리 / 井底之蛙. Tongue it: `[ INSCRIPTION ] 井底之蛙. Worn smooth where someone kept pointing up.` (WORLD §4.7). It is the silhouette the Revelation pays off (`01`, LATER).

**The class pads** [MUST-B]:
- 10 lily pads, r 0.45 m, in stone cups: **Plain** first, then the 3 open classes (Tree Frog, Bullfrog, Dart Frog), then the 6 secret ones. A secret pad is dark and shows `?` until you unlock it.
- Standing on a pad for 1.0 s sets your starting form for the next climb. The marking appears on your body at once, and the System names it: `[ CLASS ] Bullfrog. Hold Power: Belly Boom.`
- Classes appear from climb 2 (D §8.2 #10). Rivals choose by archetype (`03`).

**The Mirror** at the hub and at every Landing (08 owns the screens):
- Tongue it: the camera orbits your frog in front of the water sheet while the world keeps running. Others see your frog admiring itself in a looping pose.
- Leave with Esc, Tongue, or 1 s of stick or WASD.
- The reflection is a 512² render texture that updates only while a frog is within 6 m (`10` perf).
- **Veiled until the profile's first Keeper clear.** There is no shopping before the Keeper (D §8.3), and a veiled frame is a free curiosity hook. Tongue the veil and it flutters. No text.

**The Supporter shelf** [MUST-B] lives at the hub only. It has no animation, no sound, no text, no sale badge and no timer, and it is never shown on a Landing, the Rim, a results screen, a loading moment or a toy. **No paid prompt ever appears inside a climb or at its payoff** (this file's rule, serving FO §8.2–8.4).

### 2.7 Lobby toys: waiting for friends is play [MUST-A; pads MUST-B]

These appear after the profile's first Keeper clear. Before then, the first-launch hub has exactly one path, the open Normal door (D §5 "5 systems before the Keeper").
- **Frog Stack plinth** at the deck centre: full Frog Stack rules (§6.1), with rounds starting when a frog steps on. No jar and no record: it is only for the laugh.
- **Lily-Pad Sumo pads** [MUST-B]: 5 pads on the east water. Rounds start when 2+ frogs stand on the pads (§6.4 rules). No jar.
- **Lantern gnats:** tongue them for a *plink* and a tiny pop. Hands stay busy.
- **The idle nudge.** A human who stands still for 20 s outside any panel gets one ping and one line from the nearest Rival, who then hops onto a free-play toy. It never repeats within 60 s.

### 2.8 Rivals at the hub [MUST-A]

After hatching, each seated Rival takes up an idle post that shows who it is. `03` owns barks, brains and the Register; these are placement defaults.

| Rival | Idle post | Line (`03` may replace) |
|---|---|---|
| Moss | the Normal doorway | "Here." |
| Brother Brass | beside the free-play plinth, or the Normal door before the first Keeper | "I can carry that." |
| Kestrel | on the statue plinth, posing; falls off every ~25 s | "Watch this!" / "That was on purpose." |
| Pell | reading the map slab | "Interesting." |
| Maud | at the Mirror (at the veil before the first Keeper) | "Oh, sweetie." |
| Vex | leaning on Hell's chains | "Worth it." |
| Pip | a few steps behind the nearest human | "I'll follow you!" |
| Lumen | sitting alone on the parapet | — |
| Ines | tapping a foot in the chosen doorway once a start ring runs | "Go!" |
| Gutter | by the Hard door; glares only at a human the Register holds a grudge against | "You. Again." |

- **At most one Rival Register callback per hub visit**, 3 s after the hatch ("Last time you left me on the bridge.", FO §5.3).
- When a start ring runs, every Rival walks to the chosen door.
- In solo, Rivals follow the human's door and never vote (FO §3.3).

### 2.9 The title loop and the first seconds [MUST-A]

**The title loop is the live hub.** It is not a video or a separate scene.

| t (s) | Camera | Picture | Audio |
|---|---|---|---|
| 0.0–2.5 | Low over the water beside the egg ring, pitch +12°, FOV 60 | Eggs bob in the foreground; the statue's pointing arm; beyond it the four doors glow in their lamp colours, Hard and Hell's chains glinting | Kalimba drips (pentatonic, F), water lapping |
| 2.5–7.0 | Tilts up to pitch +72° over 4.5 s (ease in-out) | Up the wall and the light pillar to **the Mouth**, a small coin of sky. The logo (a rope-knot K) fades in at 3.0 s, the tagline *Climb together. Fall alone.* at 4.0 s, and "Press any key" at 4.5 s | One low croak echoes up the shaft |
| 7.0–14.0 | Holds, with a slow 2° drift | On a returning launch the teaser line sits above the prompt, and the Well-Rested line under it when that is active (`04`) | — |
| 14.0 | Tilts back down over 3 s and loops | — | — |

- "Press any key" can be pressed from 0.3 s. The camera whips (0.3 s) to your egg and it hatches (2.8 s), so control arrives at ≤ 0:05 after pressing Play (FO §3.5).
- **Composition targets** (checked by the agent screenshot test): the first frame shows ≥ 3 eggs, the statue and all four doors with legible lamps; by 4.5 s the Mouth sits fully inside the top third and the logo reads at 1080p.
- A returning launch shows no friend's name, no sale, and no "come back" copy (FO §8.4 #3).

### 2.10 Coming home

**After a wipe or a Rest from a Landing: the sink** [MUST-A]
- A 3.0 s shot. Every frog, as a tadpole ghost, drifts down the light pillar and into the hub's water. The camera follows.
- Each frog re-forms on the deck **at its final Glow look**, with belly light, orbiting fireflies and Awakening parts: a last look at what you built.
- The results ceremony (`04`) plays as a lower-third overlay while everyone can walk.
- Then the buttons: **Climb again** and **Rest**, equal weight, plus **Retry from door 11** [MUST-B] when `04`'s rule allows. Nothing starts by itself (FO §4.4 #7).
- A **Rest from a Landing** (§4.7) skips the sink, plays the short results where you stand, then fades to the title loop.

**After a Warden clear:** results play on the Rim (§8).
- **Climb again from the Rim:** a 4.0 s dive. The camera plunges back through the Mouth and down the shaft past the Landings, and the party streaks down the light pillar as eggs, plopping into their cups.

**On Climb again,** from either place:
- Each frog hops into its egg cup, and a 0.6 s splash hides the swap.
- The new eggs hatch at once (2.8 s). You are a dim Lv1 froglet again, the underdog arc (FO §6.3).
- No glow drains away on screen. The reset is a fresh hatch, never a loss animation.

---

## 3. `hatch_pond`: door 0, shot by shot [MUST-A]

**Job:** the first 35 seconds must deliver control, a first reward, a first laugh the player *causes*, and teamwork you can feel, with no text to read (FO §3.5, §6.1; D §5 door 0).

**Place:** down the stone steps behind the difficulty doors, a pond 22 × 14 m at the Foot's waterline (`05` §6.1). It has 7 lily pads (r 1.0 m) in an arc from (−8, 0, −4) to (8, 0, 4) with gaps ≤ 2.2 m, **Kestrel's wobbly pad** (rocks ±12°) at (4, 0, 5), and the door-1 slab (4 m wide, 6 m tall) at (0, 0, 9), in `05`'s room frame.

**Rules this file adds:**
- **Every frog has its own cloud:** 30 fireflies in 3 clumps of 10, sparkling at the edges in that frog's Seat Hue. Only the owner can gulp it; anyone else's tongue passes through with a wobble. There is no stealing, and every frog gets exactly Lv2 (`04` §2.2).
- **Door 0 clears, per frog, when that frog gulps its last clump.** The 30 bank at once, so Lv2 lands at about 0:20 (D §5, `04` §2.3). A frog that skipped part of its cloud banks whatever is in its cheeks at the door-1 threshold, which is `05`'s rule.
- **Door 0's rank always goes to Tongue.** Pond hops never land higher than take-off, so they don't count as Hop uses (`04` §3), and 3 gulps count as 3 Tongue uses. The cause line is true: `Because: you gulped 30 fireflies.`
- **Water here is soft.** Falling in costs nothing. You swim at 1.5 m/s and hop back onto any pad.

### 3.1 The first climb (solo + 7 Rookie Rivals, Normal)

Clock from pressing Play. A typical key press lands at ~0:01.

| Clock | Camera | What happens | Player does | System / audio | Feel |
|---|---|---|---|---|---|
| 0:00 | Title loop (§2.9) | Eggs bob; the statue points up; four doors glow; the Mouth is a coin of sky | presses a key | kalimba drips | "I'm tiny. That's the sky." |
| 0:01 | Whip 0.3 s to your egg | The egg wobbles, cracks, flips a tadpole and pops a froglet (2.8 s). The Rivals' eggs pop around you | — | `[ HATCHED ] Level 1. Everything is bigger than you.` | growth is the language |
| 0:04 | Eases in 0.6 s to the 3/4 follow cam (4.5 m back, 2.2 m up, pitch 18°) | Moss stands in the open NORMAL doorway: "Here." The EASY door stands open too; HARD and HELL are chained | a **Hop** glyph appears; hops toward Moss | a plink per landing | control at ≤ 0:05 |
| 0:07 | — | You pass under NORMAL: the lintel word flares warm, a low bell rings, and 4 steps lead down to the water | walks through (this is the difficulty choice, D §4) | no line | "I chose" |
| 0:10 | follow cam | Pad 1. Squash and stretch on every landing, ripples, a rising pentatonic note per pad | hops pad to pad | — | bouncy, responsive |
| 0:13 | — | **Your cloud** drifts out of the light pillar and hangs 2 m above pad 3, 2.4 m ahead (inside Tongue I's 3 m) | a **Tongue** glyph appears | a soft shimmer | "that's for me" |
| 0:14–0:20 | — | 3 lashes, 3 gulps. The cheeks puff and the throat sac glows fuller each time | lashes | gulp pops rising in pitch | — |
| 0:20 | 80 ms hitstop, 15% push-in | The 30 bank: the belly light rises 0.6 → 0.9 (HDR), and one firefly spirals out to orbit you | — | `[ GLOW 1 → 2 ]`, then 0.8 s later `[ TONGUE II ] 4.5 m. Grapple. Because: you gulped 30 fireflies.` The tongue tip now glows (`04` §3) | **first reward** |
| 0:21 | — | A lantern hook (`Anchor`, 2.5 m up) at (−3, 0, 1) glints: an optional first grapple with the rank you just got | may grapple (optional, no text) | a *thwip* | numbers bind |
| 0:22 | Soft framing toward Kestrel | Kestrel strikes a one-legged pose on his rocking pad: "Watch this!" | a **Tongue** glyph appears over Kestrel, the only frog-targeted prompt in the game | — | — |
| 0:24–0:27 | 0.3 s slow-motion on the splash | Your lash tugs him ≤ 1.0 m (the mischief cap, `03` §3.1). His pad tips over its edge and he belly-flops (a local ragdoll and a big splash), surfaces, and spits water: **"That was on purpose."** Two Rivals laugh-croak | lashes | a splash, a honk-croak laugh | **first laugh, caused by you, ≤ 0:30** |
| 0:28–0:33 | — | The last pads to the bank. Moss is already braced against the slab: "Here." | hops | — | — |
| 0:33 | — | The slab is stamped **1** and is the size of a house. It opens only while ≥ 2 frogs push within 1.0 s of each other (`TwoFrogDoor`, `03` §4) | a **Shove** glyph appears; shoves with Moss | stone grinding, rising in pitch | teamwork is physical |
| 0:35 | Cinemachine impulse, 80 ms hitstop | The slab thuds open, and the door counter slams onto the screen: `DOOR 1` | walks into `br_shove_door` (`05`) | a deep thud | the climb has begun |

**Fallbacks** (never block progress):
- **No lash within 5 s of Kestrel's prompt:** he overbalances on his own at 0:30 ("That was on purpose."), and the prompt clears. The laugh lands, just not caused by you. Telemetry logs `kestrel_self`.
- **Tongue-on-player cut after M0:** the prompt becomes **Shove** when you are within 1.2 m (`05`).
- **Public lobby** [SHOULD]: the prompt targets a pot stack on Kestrel's pad, which topples onto him (FO §3.5).

### 3.2 With friends

- Every human gets their own cloud and the same beats.
- **Kestrel's prompt** shows to every human within 12 m, and the first lash wins. `03`'s Drama Director may stage a second gag later for a human who missed it.
- **Humans can tug each other into the pond.** Water is soft here, so this is the first free laugh between friends. Blame tags apply in friends' lobbies (`03` §5): `Dunked by Pip`.
- **The slab** needs any two frogs.

### 3.3 Repeat climbs

- **Hub to door 1 in ~15 s.** You still hatch in the hub (§2.10). Your cloud drifts to you on pad 1, and Lv2 and TONGUE II land about 5 s later.
- **Rank D's talent** ("start with a Common Boon of your choice", `04` §8.2) shows as a private 8 s pick overlay right after `[ TONGUE II ]`, while you keep hopping.
- **The Kestrel beat is first-climb only.** In 1 of 3 later climbs, `03` stages a seeded Rival slapstick on the wobbly pad. Otherwise the pad holds a pot stack that anyone can tongue down.
- **Test hook** (`05`): `HatchPond.AutoSolve()` asserts Lv2 and TONGUE II within 35 s. This file adds one assertion: `DOOR 1` slams within 40 s of pressing Play in the scripted first climb.

---

## 4. Landings (`landing_well`) [MUST-A; Landing 3 MUST-B]

**What a Landing is:** a 40 s warm stop and save on a strand top after doors 5, 10 and 15 (D §4, glossary 10). It is where you **rest, see how far you've come, and spend**. Heights and the Mouth: Landing 1 at y 30 (Mouth 37°), the Keeper Landing at y 60 (44°), Landing 3 at y 90 (56°) (`10` §5.2). The Warden arena at y 120 is not a Landing.

### 4.1 Layout (deck frame, +z toward the well wall)

```
                               +z (the well wall, 21 m out)
      ......................... parapet r 16.5 .........................
                     [ door A ]   exit arc r 14   [ door B ]
                     bearing -10               bearing +10    (a single door sits at 0)
          (K) Knot spot (-6.4, 6.4)                 (B) lily bed, Rest (6.4, 6.4)
                              .-------------.
   (S) stall (-10.3, -1.8)    |  jar shelf  |    (M) Mirror (10.3, -1.8)
                              |  ( stair )  |
                              |  ( mouth )  |   r 2.5 opening; shelf ring r 3.0, 0.6 m high
                              '-------------'
                               (T) toy spot, centred (0, -9):
                                   Frog Stack plinth or Jar Tag court
      .................................................................
                               -z (across the well: the other strands)
```

- **Deck:** a disc of radius 16 m, stone `#4A4540` with moss, and a 0.8 m parapet at r 16.5 all round.
- **Lighting:** 12 parapet lanterns `#FFB86B`. The shaft's light pillar falls just inside the parapet on the axis side.
- **The view:** the other strands and their Landings across the well (at LOD, `10`).
- **Arrival:** the strand's inner spiral stair ends in the **stair mouth** at the centre, so "arrivals climb up from below" is literally true (WORLD §4.2). A stone **jar shelf** rings it at r 3.0, 0.6 m high.
- **Exit arc** at r 14 on the +z side: one door at bearing 0°, or a pair at ±10°, with plaques as `05` specifies.

### 4.2 Stations

| Station | Where | Does | Present | Tag |
|---|---|---|---|---|
| **Stair mouth** | centre | the party arrives here; free revive | always | A |
| **Jar shelf** (the lineup) | ring r 3.0 round the stair mouth | your jars line up and pop (§4.5) | always | A |
| **The Mouth's rain** | the light pillar, landing round the stair mouth | Wish Coins fall; catch them (§4.5) | always | A |
| **Toy spot** | centred (0, −9) | one toy per Landing (§6.5) | always | A |
| **The Mirror** | (10.3, −1.8), the same brass frame as the hub | try-on and Pearl purchases (`08`) | veiled until the profile's first Keeper clear | A |
| **The stall** | (−10.3, −1.8) | 4 items for Wish Coins (§4.6) | Keeper Landing and Landing 3, every climb (`04` §10.3); a sleeping, shuttered stall at Landing 1 | A (L3 B) |
| **Knot spot** | (−6.4, 6.4) | a signal and a stage for Knots (§4.9) | from Landing 3 in climb 1, from Landing 1 later (`03` §6) | B |
| **Lily bed** | (6.4, 6.4), a moss bed under one lantern | Rest here: save and leave (§4.7) | always | A |
| **Exit door(s)** | arc r 14, +z | the next door or pair (§4.4) | always | A |

### 4.3 Arrival: the first 3 seconds (every Landing)

| t (s) | What happens | Owner |
|---|---|---|
| 0.0–0.8 | The party pops out of the stair mouth one by one; the stair ride hid the cell switch. **Tadpole ghosts re-hatch** with a pop, and every frog's spots refill one by one, 0.15 s apart, with a rising chime. It is a free revive, every time (FO §3.7) | this file |
| 0.2–1.9 | **The Mouth glance**, on the first arrival at this Landing in this climb: the camera tilts to +65° over 0.6 s, holds 0.6 s and returns over 0.5 s. Any look input over 2° cancels it (WORLD §4.5). You see how much wider the sky is. Skipped at the Keeper Landing, where the steered pull-back replaces it | `01` (angles) |
| 0.5 | The host autosaves (seed + state, `04` §11.3). A small lantern glyph flickers in the bottom-right corner for 1.5 s. No line | `04`, `10` |
| 1.0 | Your pouch jars hop onto the shelf in front of you, and the lineup starts (§4.5) | `04` (contents) |
| 1.5–7.5 | **The Mouth's rain**: Wish Coins drift down the light pillar and land round the stair mouth (§4.5) | `04` (amounts) |
| 2.0 | The toy's lamps light. In solo, a Rival starts it to invite you (§6) | this file |

The exit door is open from 0.0. The System speaks at most twice here: only lines that name a real change (a Knot offer, an unlock, a stall purchase).

### 4.4 Leaving a Landing: nobody waits on anybody [MUST-A]

| Lobby | Rule |
|---|---|
| **Solo** | Stand in the exit doorway for 0.5 s and it opens. The Rivals walk in 1 s after you. **No timer at all:** the only person waiting is you. |
| **2+ humans, before the soft cap** | A human standing in a doorway lights a **ready pip** in their Seat Hue above the door. The door opens 2 s after **every** human is in a doorway. |
| **2+ humans, after the soft cap** | The normal walk-vote (FO §3.3): 4 s after the first human steps into a doorway, the door with more humans opens. The Rivals head for the doors at the soft cap. |
| **Hard cap** | The door with the most humans opens (or the left one, if nobody is in a doorway), and a warm gust carries everyone still on the deck in over 1.5 s. No damage, no tug. `[ THE TOWER ] Onward.` Open panels close; confirmed purchases stay. |

| Landing | Soft cap | Hard cap |
|---|---|---|
| Landing 1, Landing 3 | 40 s | 60 s |
| Keeper Landing | 45 s | 70 s |

The caps count from arrival (0.0 in §4.3). A pair after a Landing (in seeded climbs) uses the same rule to choose between its two doors.

**Why this works:** a player who is done can say "ready" without words, and a player who is still shopping sees the pips and hurries. Nobody is ever stuck behind a menu for more than 60–70 s. A player who wants a longer break **Rests** (§4.7), and a Rival takes over their seat.

### 4.5 Jars and the Mouth's rain (presentation; `04` §10.1–10.2 owns every amount)

**Jar grades** (colours from `04`; the shapes let colour-blind players tell them apart):

| Grade | Colour | Shape (height, frog H = 0.60 m) | Holds (`04`) |
|---|---|---|---|
| Bronze | `#C8803A` | a squat round jar with a cork lid, 0.30 m | 5 Wish Coins |
| Silver | `#C9D3DC` | a tall jar with a tin screw lid, 0.40 m | 10 Wish Coins |
| Gold | `#FFD84A` | a star-lidded jar with a slow sparkle, 0.45 m | 20 Wish Coins + 1 reroll + your lowest Boon up 1 rank |

**The lineup** (`04` §10.2):
- The jars you earned since the last stop hop out of your pouch and stand on the shelf segment nearest you, Bronze → Silver → Gold (left to right from where you stand).
- They pop one after another, 0.4 s apart, starting 0.5 s after they land. Each pop is a glass tinkle a pentatonic step higher than the last, a 50 ms hitstop, and coins arcing into your cheeks with a count-up.
- A Gold jar adds a 0.6 s sparkle burst and a longer chime.
- **Hold Tongue to pop the rest at once.** The lineup never takes more than 4 s, and you can walk away mid-lineup: your jars keep popping.
- A grade is visible from the moment a jar is earned. **The pop reveals nothing random** (FO §8.2: no reels, no spin-past).
- Jars earned after Landing 3 pop in the results (`04` §12, meter 2).
- **Lucky Belly** flashes each jar up one grade just before it pops (`04` §6.2).
- Jars earned **on** a Landing, from its toy, pop on the spot the moment they are earned.
- Other frogs' lineups are visible and audible. Hearing a friend's Gold jar pop across the deck is part of the waltz.

**The Mouth's rain** (FO §6.2 #5 "Wish Coins rain through it"; amounts `04` §10.1: 4 at Landing 1, 8 at the Keeper Landing, 12 at Landing 3, per frog):
- At 1.5 s, coins glint at the top of the light pillar and tumble down over 6 s, spinning and ringing softly. They land in a 4 m ring round the stair mouth.
- **Your share arrives by itself:** coins that land fly to your purse.
- **Tongue-catch a coin in mid-air** for +1, up to +2 per frog (`04`). This is a 6-second "look up and snap" game at every stop.
- The wider the Mouth, the thicker the rain. The Keeper Landing's rain comes after the pull-back (§4.8).

### 4.6 The stall (`04` §10.3 owns items, prices and limits)

- **The keeper:** a moss-covered old toad, 1.2 m tall, with half-closed eyes, behind a knee-high moss counter under a lily-leaf awning and one lantern. It is never named on screen ("the stall"). It speaks only in croaks and emote bubbles; the System speaks for it.
- **Landing 1: shut in every climb** (`04` OQ7). A leaf hangs over the counter and the toad snores in slow `z` bubbles. Tongue it: one sleepy grunt. It is a curiosity hook, with no text.
- **Opening** (Keeper Landing, ceremony step 5, §4.8): a Wish Coin drops through the Mouth, bounces off the awning and clinks into the toad's bowl. The toad's eyes snap open, the leaf rolls up, and the lantern brightens.
- **Buying:**
  - Tongue the counter. A 4-row panel opens in the lower third, showing each item's icon, name, one-line effect and price in Wish Coins; rows you can't afford or have hit the limit on are greyed.
  - Pick a row, then confirm with Tongue again. The toad slides the item across and it hops into your pouch: `[ STALL ] Reroll +1.`
  - The **Boon upgrade** opens a private 8 s card showing your owned Boons (not Legendaries or Duos).
  - The **Gold Key** rides in your pouch until the next door pair, where you tongue it into a plaque (`04`).
- **Every frog shops privately.** There is no stock, no race, no countdown, no discount and no "limited" label (FO §8.6). Two frogs can stand at the counter together.
- **Rank S's talent** (one free item per climb): the toad winks, and your first row reads `0` (`04` §8.2).
- **Rivals have purses and visibly shop** (`04` §10.1). A Rival buys at most one item per Landing, takes ≤ 3 s, and steps aside for any human who comes within 3 m. Their purchases pop over their heads (a heal bug, a reroll icon), so you *see* the economy.
- **The heal bug** is a 0.1 kg glowing beetle that rides on your back (it doesn't hide the spots). You can tongue-pass it to any frog, and it counts as your one item through a Meeting window (`04`).

### 4.7 Save, Rest and Resume (`04` §11.3 owns the rules)

- **Every arrival is a checkpoint.**
- **To Rest,** walk onto the lily bed and hold Tongue for 1.0 s (the frog curls up), or use Esc → **Rest here**.
  - `04`'s line plays: `[ RESTING ] 137 Wish Coins → 68 Pearls. Your climb is saved at DOOR 10.`
  - The short results play where you lie (`04` §12), then the screen fades to the title loop.
- **In multiplayer, a human who rests leaves.** Their seat passes to a Rival, who hops out of the bed. If the **host** rests, the climb saves and ends for everyone: `[ THE HOST RESTS ] Your climb is saved at DOOR 10.` Each client gets its own short results.
- **Resume** is the hub's Resume door (§2.5).
- **Starting a new climb while a save exists** replaces it (`04`). The first human to step into a difficulty doorway sees `[ NEW CLIMB ] This replaces your save at DOOR 10.` In solo, the doorway dwell rises from 0.5 s to 1.5 s while that line shows.

### 4.8 The Keeper Landing ceremony [MUST-A]

**D §5's order is binding.** The design goal: seven payouts in about 30 s, and **only the pull-back takes the camera**. Everything else is an overlay while you walk. The ceremony also runs after a *failed* Keeper, because onboarding never waits on a win (`04` §11.2).

**First time on a profile** (the Quick Climb's end, ~10:25):

| t (s) | D step | What happens | Player |
|---|---|---|---|
| 0.0 | — | Arrival (§4.3) without the Mouth glance: free revive, save | walks |
| 0.3–1.3 | 1 | `[ CHOICE UNLOCKED ] The Tower will let you choose now.` | — |
| 1.3–9.3 | 1 | **The first pick 1 of 3** (8 s): three cards in the lower third, private, simultaneous. A timeout takes the highlighted card (`04` §6.1) | picks while moving |
| 9.3–11.8 | 2 | `[ PARTY RANK UP ]`: a ring of light rolls out from the party, everyone gets +1 reroll, and the Rivals cheer | — |
| 11.8–15.3 | 3 | The **Tower Rank bar** fills F → E in the lower third, with the doors you passed stamped into it (FO §4.3 "head start, honestly"). A gong sounds as `E` carves onto your name-tag letter (`04` §8.3) | — |
| 15.3–25.3 | 4 | **The steered pull-back** (`01` owns the path): the camera leaves your frog and rises up the shaft under your control (look to aim, hold Hop to rise faster). The Mouth opens wider as you climb toward it (31° → 44°, the hub's reading against this one), and one Wish Coin falls past the lens. It is per-client, so nobody waits for anybody. Press Shove to return early; it returns by itself at 10 s | steers |
| 25.3–27.8 | 5 | The coin lands in the stall toad's bowl, and **the stall opens** (§4.6). The **Bell Cap** waits on a cushion on the counter; tongue it and it arcs onto your head with a *ting* (`08` #37). The Mirror's veil drops, here and at the hub | tongues the hat |
| 25.3–31.3 | — | **The Mouth's rain**: 8 coins each, catchable (§4.5) | catches coins |
| 27.8–29.8 | 6 | `Floor 3: doors 11–15. Something is waiting in 12E.` | — |
| 29.8 | 7 | **Climb on** and **Rest**, two equal buttons in the lower third. Door 11's lamp lights. The jar lineup starts now, so it never collides with the ceremony, and the toy's lamps light | chooses, shops, plays |
| 45 / 70 | — | The soft and hard caps (§4.4) | — |

- **Climb on** is simply walking into door 11. The button is there for readability.
- **Rest** ends the Quick Climb cleanly (§4.7). The Resume door will read `DOOR 11 · RESUME`.
- **The demo build** [MUST-A]: the Keeper Landing is the demo's end.
  - **Climb on** becomes **Climb again**, a new seeded Quick Climb (D §7).
  - The line `[ DEMO ] Doors 11–20 are in the full game.` shows under the buttons, with a third, smaller button, **Steam page**, which opens the Steam overlay.
  - That is the only store link in the demo. It never repeats, and it never appears during play.

**Later Keeper Landings** (≈ 17 s to the buttons):
1. the pick 1 of 3 (8 s);
2. Party Rank Up (2.5 s);
3. the pull-back, cut to 4 s and skippable with Shove;
4. the Mouth's rain;
5. the teaser line (2 s);
6. the buttons.

The Rank bar shows here only if a rank letter changed. Otherwise it waits for the results.

### 4.9 The Knot spot [MUST-B]

`03` §6 makes a Knot from the Wheel anywhere on a Landing ("distance never matters"). So the spot is **a social signal and a stage**, not a requirement.
- **Look:** a 1.8 m mooring post with a big knotted rope hanging from its hook, and two lily pads 1.5 m apart at its foot.
- **Standing on a pad for 1 s** raises a soft knot glyph above your head for the whole party: *open to a Knot*. Stepping off clears it. It says "want to team up?" without chat.
- **When any two frogs Knot, anywhere on the Landing,** the rope on the post whips into their shared thread in a 1.5 s flourish, and both frogs hop onto the pads. Any movement skips it.
- **Rivals who want to Knot stand on a pad.** That is how climb 1's offer is staged (`03` beat DD-L3, `05` door list: Moss):
  - Moss hops onto a pad and pings you, and the other pad glows in your Seat Hue.
  - `03`'s line appears: `[ KNOT ] Moss asks: Knot?`
  - You accept with the Wheel's **Knot?** from wherever you stand.
- **Before Knots unlock,** the post stands with its rope coiled and nothing happens. Another free "what is that for?"

### 4.10 Landing by Landing

| Stop | Climb 1 (authored, D §5) | Seeded climbs |
|---|---|---|
| **Landing 1** (4:45, Mouth 37°) | **Lineup: Bronze → Silver** (the door-1 jar, then door 5's prize, `04` §5.1). The toy is **Frog Stack**: Brother Brass starts the stack (`05`), and Kestrel topples it once ("That was on purpose."). The stall sleeps and the Mirror is veiled. The Knot post is coiled. Rain: 4 | Toy from {Frog Stack, Jar Tag} (§6.5); Knot spot active; stall shut |
| **Keeper Landing** (10:25, 44°) | The ceremony (§4.8). The toy is **Frog Stack** again, and a chalk line on the beacon pole marks your Landing 1 score (`L1: 3`), so you can *see* the difference that Air Hop and Hop II make. Rain: 8 | Short ceremony; seeded toy; stall open |
| **Landing 3** (16:30, 56°) | The stall is open. **Moss offers the Knot** (§4.9); Knot, Cut and Duos unlock. The toy is **Jar Tag**. Rain: 12 | Seeded toy; stall; Knot spot |

---

## 5. `meeting_room`: where the halves meet [MUST-B]

**Job:** the user's "players meet in different levels … 1a 1e". A fork splits the party into a group door and an E door (D §4), and this is where the halves meet again. **The half that finishes first plays; it never just waits.** It can also watch its friends and help them. `05` §3.4 owns the fork rules, keys and rope; this section owns the room.

### 5.1 Layout (room frame: +z toward the Meeting Door)

```
                          +z
            ____________[ MEETING DOOR ]____________      double door 4 x 5 m at (0, 0, 10.8)
           /        lock E (-1, 1.2)  lock G (+1, 1.2) \
          /                                              \
         |  (P) Frog Stack plinth         pots x4 (east)  |
         |      (-7.5, 3)                                  |
         |              .----- Jar Tag court -----.        |
         |              |   o pillar     pillar o  |        |    court r 6 at (0, -1);
         |              |          (lantern,        |        |    4 pillars r 0.5 at r 3.5
         |              |   o       gnat cloud)  o  |        |
         |              '---------------------------'        |
          \  group tunnel (-7.8,-7.8)     E tunnel (7.8,-7.8)  /
           \______________ [ WINDOW + hatch ] ________________/
                          (0, 1.6, -10.8)           rope hook (1.8, -10.2)
                          -z
```

- **The room:** a round chamber, r 11 m, domed 7 m high, with a warm moss floor and a hanging lantern at the centre. A gnat cloud always circles the lantern.
- **One shared room.** Both fork rooms' exits open into it: the **group tunnel** (west) and the **E tunnel** (east). Everyone who arrives can see, tag and hug everyone else.
- **The Meeting Door** (north): two locks at 1.2 m height, 1.0 m either side of centre.
  - **Lock E**, on the group side (west), has a gold rim.
  - **Lock G**, on the E side (east), has a rim in the group door's suit colour.
  - **The key swap.** Each fork room drops one key, carried by its last frog out (`05`). The group room's key opens lock G and the E room's key opens lock E, so each half carries its key **across the room** to the other half's side. That walk is the "swap".
  - A key inserts itself when its carrier comes within 1.5 m of the matching lock, and the lock lights in the key's rim colour.
- **The window** (south wall, centre height 1.6 m, round, 2.4 m across, shadow glass) shows **whichever fork room is still live**. It is fed by a 320 × 180, 15 fps secondary camera at that room's `meetingWindowAnchor`, showing only its frogs and self-lit tells (`05`). The camera renders only for clients inside the Meeting room.
- **The hatch** (0.8 × 0.8 m) sits below the window at 0.5 m height (§5.3).
- **The rope hook** is beside the window (§5.4).
- **Toys:** the Jar Tag court and the Frog Stack plinth (§6). Four pots on the east wall pay 1 coin each to every frog in the room (`04` §10.1).

### 5.2 How the wait plays out

| Who is where | What the waiting half sees and does | Typical wait |
|---|---|---|
| **Humans on both sides** | The live window shows your friends' room: pure spectator comedy. Jar Tag and Frog Stack run. You can pass one item through the hatch; at 45 s, the rope | the gap between clear times, 10–40 s |
| **Solo: you took the group door** (Lumen went offstage to the E door, `05`) | You and 6 Rivals play Jar Tag. The window is **fogged**: drifting silhouettes, and every ~4 s a comic bump (a face-plant shadow). Offstage rooms are not simulated, so there is nothing live to show | 5–20 s (seeded, `05`) |
| **Solo: you took the E door** (the Rivals went offstage to the group door) | You alone: the gnat cloud, the pots and the Frog Stack plinth (which does nothing alone; Kestrel will be *very* keen when he arrives). The fogged window | 5–20 s |
| **Humans only on one side** | as the solo rows | 5–20 s |

**The reunion** (the second half arrives):
- A chime, and a banner slides in: `Vex, from 12E, carrying the key.` (GDD §3.8's reunion, kept).
- One reunion bark (`03`), for example "Kestrel fell in twice."
- Both keys insert, and the door grinds open over **2.0 s**. That window is where `03`'s staged Vengeance can land: Moss tags Vex (`05` door list).
- Then the next door number slams onto the screen.
- A Jar Tag or Frog Stack round in progress **ends 2 s after the second key goes in**. The toys never hold the door.

### 5.3 The hatch: one helping item

- Once per Meeting, **the waiting side** may push one item through the hatch (D §6 row 21; FO §3.3 "pass one item").
- **What fits:** any carryable of 3 kg or less. The useful ones are **the heal bug** (`04`: "it counts as the one item through a Meeting window"), an unopened **jar**, and a **pot** (it shatters on arrival and pays the frogs there). A thrown **mite** is also allowed, as a joke: it pops into 1 loose firefly for whoever gulps it.
- **Where it arrives:** it pops out of a matching hatch high on the other room's wall, at its `meetingWindowAnchor`, with a comic *thup*, and lands at 1.0 m height.
- After one use the hatch clacks shut, until the rope opens it.

### 5.4 The rescue rope (45 s)

`05` §3.4's rule, staged:
1. **The rope drops.** At 45 s after the first frog of the first half arrives, a thick gold rope `#FFD84A` uncoils from the ceiling hook beside the window: `[ ROPE ] Pull them through.`
2. **A waiting frog takes it.** It holds Tongue on the rope's end. The rope's other end appears out of the other room's hatch, dangling to 1.0 m above that room's floor, glowing and ringing a small bell every 1.0 s so it is easy to find.
3. **A frog there grabs on** (holds Tongue on the rope). It is reeled in over 1.2 s and tumbles out of the Meeting room's hatch onto a moss pile. The rope drops back for the next frog.
   - The holder must keep holding. If they let go, the rope retracts over 1.0 s, and any frog can take it up again.
   - Only one rope and one haul run at a time: about 1.5 s per frog.
4. **The room ends.**
   - When every living frog in that room is out, its **tadpole ghosts float out with the last one**, and the room counts as **cleared with help**. The Boon pick is kept and only the hidden-clear bonus is lost (FO §3.3; `04` §2.1). Its key pops out of the hatch.
   - If the room clears on its own first, it is a normal clear.
   - **Nobody is forced.** A frog there may ignore the rope and keep trying for the hidden clear until its room's hard timer.
- **Offstage Rivals never need the rope** (`05`).

---

## 6. The four toys

The user asked for "mini sidegames to lighten up". FO §5.1 says they must be **played, not skipped**: they live inside the climb's rhythm as toy doors, Landing toys and Meeting toys, plus a mode of their own. Each is a 20–25 s physical game built only from the three frog verbs and Shove. You learn it in one look, and it reads with the sound off.

| Toy | Kind | Players | Homage | Where (slice) | Tag |
|---|---|---|---|---|---|
| **Frog Stack** `toy_frog_stack` | co-op build | 1–8 | TEAMBOUND **Tower of Babel** (+ GDD Wax Stack) | Landing 1, Keeper Landing, Meeting rooms, hub, Landing Party | A |
| **Fly Catch** `toy_fly_catch` | co-op score attack | 1–8 | new: the tongue's own game; its two-tongue fat fly borrows TEAMBOUND **Echo Chamber**'s "shared magic, timing matters" | toy door 6, Landing Party | A |
| **Jar Tag** `toy_jar_tag` | tag | 3–8 | GDD **Snuff Tag**; a rehearsal for `warden_the_jar` | Meeting rooms, Landing 3, Landing Party | B |
| **Lily-Pad Sumo** `toy_lily_sumo` | last frog dry | 2–8 | TEAMBOUND **Downstream** (`lily_raft`'s tipping-raft script) + a friendly form of `heart_two_pads`' capacity rule; out frogs play on, as Among Us ghosts do | toy door 16, hub pads, Landing Party | B |

### 6.0 The toy contract (every toy, every time) [MUST-A]

**Round shape:**

| Phase | Length | What happens |
|---|---|---|
| **Ready** | 2.0 s | The toy's one-line rule appears (≤ 10 words) with a 3-note count chime. You can move, but scoring is off |
| **Play** | the toy's cap | — |
| **Bell** | 0.3 s | 50% slow-motion on the deciding moment. No input lock |
| **Tally** | 2.5 s | A lower-third overlay: the result, who won, personal counts, then jars hop into pouches |

**Where toys run, and how you join:**

| Context | Joining | Ends | Door-to-door |
|---|---|---|---|
| **Toy door** (a breather) | everyone in the room is in | Tally, then the exit opens | **≤ 30 s** (FO §3.2) |
| **Landing toy** | walk onto the plinth, court or pads; a round starts when a frog enters (Jar Tag needs 3) | its cap; the next round starts when someone re-enters | — |
| **Meeting toy** | as a Landing toy | its cap, or 2 s after the second key | — |
| **Hub free play** | as a Landing toy | its cap | — |
| **Landing Party** | the playlist (§7) | its cap | — |

**Rewards** (`04` §10.2 owns jars; this file only says who *wins*):
- **Toy door:** a **Bronze** jar for every frog; **Silver** instead for each winner, or for everyone when a co-op toy wins. The breather's own clear bonus (8 + d fireflies, 4 loose, 1 coin) is paid whatever the score (`04` §2.2).
- **Landing or Meeting toy:** a **Bronze** jar to each frog that played at least 10 s, at most one per frog per stop. It pops on the spot at a Landing, and in the next lineup from a Meeting.
- **Hub free play:** nothing but the laugh.
- **Landing Party:** records and points (§7).
- **Toys never** cost a spot, a life or a firefly, and falling in a toy never hurts: toys have soft floors. Toys never pay Pearls, Rank Points or Bestiary stamps directly. Wins feed `04`'s results title **Sumo** ("most toy wins").

**Fairness:**
- The mischief caps apply inside toys (`03` §3): Shove is 6 m/s for everyone; a tongue tug on a frog is ≤ 1 m (Sumo disables it); the spam throttle applies.
- A toy **role** (the jar wearer's speed, a stack base's slow walk) applies equally to whoever holds it. The fairness contract fixes a frog's identity, not a role (FO §5.4).
- Every toy has a lane that **only a higher verb rank reaches**, so growth shows up in the toys too (FO §3.8 "power always has an outlet"). The lanes are listed per toy.

**Rivals in toys** (`03` owns the brains; these are the toy plans):
- Human timing: 0.25–0.6 s reactions. The same verbs and caps. **Rookie** Rivals have ×1.4 reaction time, −20 aim points and +15% slapstick chance (FO §5.3).
- **At least one funny Rival failure per round.** It counts toward the Drama Director's "funny bot failure every 5 doors" (`03` §22).
- **Target reservation:** a Rival never takes a target a human is already going for (a fly, a lantern, the top of a stack).
- **A human's big moment is protected:** no Rival mischief within 2 s of a human scoring the round's deciding point.
- In solo, **a Rival starts the Landing toy 2 s after arrival** to invite you. If you haven't joined within 8 s, the Rivals play on without you, as background comedy.

**Build and test:**
- One abstract `ToyRound` NetworkBehaviour (`Game.Rooms`) runs Ready → Play → Bell → Tally, with one replicated `ToyRoundState` struct (phase, time, score, winners). The host is authoritative, and tongue and shove hits are lag-compensated (FO §5.4 #6).
- Every toy reads with the sound off: jar grades by shape, scores as big numerals, a lit lantern as a light.
- **Telemetry:** `toy_round {toyId, context, humans, rivals, result, winners, durationSec}`.
  - **KPI:** at least 50% of humans touch the Landing toy at a Landing (FO §5.1 "played, not skipped"). Below that, move the toy spot closer to the stair mouth.
- **Definition of Done, per toy:**
  - plays with 1 human + 7 Rivals, and with 4 humans at 150 ms / 2% loss (`10`);
  - a round never exceeds its cap;
  - every participant is paid the right jar;
  - it reads muted;
  - a 50-seed soak of `Toy.AutoPlay` has no stuck round (`05` test hook).

### 6.1 Frog Stack (`toy_frog_stack`) [MUST-A]

**Fantasy:** a wobbling tower of frogs reaching for the sky, TEAMBOUND's Tower of Babel ("build a supported way up to the sky beacon") with bodies as the building material.

**Arena:**
- **The plinth:** round, r 2.2 m, 0.4 m high, mossy stone on a visible spring collar that wobbles for show.
- **The beacon pole:** 6 m tall, at the plinth's north edge.
- **Six lanterns** hang on arms over the plinth, each 1.2 m from its centre. **The sky beacon**, a big firefly lantern, hangs from the pole's top over the centre.
- **Heights are generated** from `02`'s frog height (H = 0.60 m, `08` §3.3) and a stack step of 0.55 m. A stack of *n* frogs has its top head at 0.60 + 0.55·(*n* − 1) m above the plinth: 0.60 / 1.15 / 1.70 / 2.25 m for *n* = 1 to 4.

| Light | Centre height | Bearing (0° = the pole) | Reached by |
|---|---|---|---|
| L1, L2 | 1.15 m | 0°, 180° | a 2-stack |
| L3, L4 | 1.70 m | 60°, 240° | a 3-stack |
| L5, L6 | 2.25 m | 120°, 300° | a 4-stack |
| **Sky beacon** | **5.15 m**, over the centre | — | a hop from the top of a 4-stack with **Air Hop** (tap hop + mid-air hop), a Leapfrog launch, Moon Hop or Frog Choir |

- Paired lights sit on opposite sides, so two stacks can work at once.
- **A lantern lights** when the top head of a standing stack enters its 0.35 m glow sphere.
- **The beacon lights** only for a frog that **hopped from a perch** and reached its 0.45 m sphere.
- **Generator check:** a tap hop alone from a 4-stack misses the beacon by ≥ 1.0 m, and tap + Air Hop reaches it.

**Rules:**
- **Perch.** A frog that lands with its feet within 0.30 m horizontally of another frog's head socket, moving downward, **perches**: it rides that head as a kinematic follower with spring wobble.
  - **At most 4 frogs per stack** (`03` StackPad). A 5th lander bounces off with a *boing* (3 m/s up and away).
  - With 8 frogs, that makes two towers.
- **The base** is the bottom frog on the plinth. It walks at ×0.35 speed, carrying the stack. A base that steps off the plinth lowers the stack gently and scores nothing.
- **Perched frogs** lean with Move. Hop from a perch is a **tap hop only**: you can't charge on a perch, which keeps the beacon an Awakening feat.
- **Tongue haul (consent):** the top frog lashes toward a frog within its Tongue range, and the tongue tip dangles for 1.5 s. If that frog **holds Tongue on the tip** (the "hold on" verb), it is reeled up at 3 m/s and perches on top. Nobody is ever hauled without holding on (`03` §3).
- **Chorus steadies:** if every frog in a stack croaks within 0.3 s of each other, the stack's wobble speed halves at once, with a harmonised chord. There is a 4 s cooldown per stack. A frog with the **Chorus** Boon adds 2 s of steadiness, during which K(n) below is halved.
- **Shove** on any frog in a stack kicks the wobble by +30°/s in the shove's direction. That is the mischief, and the spam throttle applies.
- **The wobble model** runs on the host at 50 Hz, one per stack. State: tilt θ (2-D, degrees) and wobble speed ω (°/s).
  - α (°/s²) = K(n)·θ − 1.8·ω − 55·b + 20·Σlᵢ, where:
    - **K(n) = 0.6 + 0.45(n − 1)** s⁻², so taller stacks fall faster;
    - **b** is the base's move input projected onto the lean direction; walking the base under the lean corrects it;
    - **lᵢ** is each perched frog's lean input projected onto the lean direction; leaning against the tilt corrects it, and leaning with it tips the stack.
  - A frog landing on the stack kicks ω by +12°/s along its horizontal velocity.
  - **Topple at |θ| > 25°:** every perched frog tumbles off (a local ragdoll, no spot lost), and the base squashes flat for 0.3 s.
  - **Tuning targets (GB):** a hands-off 3-stack falls from 2° in ~4 s; a 4-stack with a careful base stands ≥ 15 s; a 4-stack with a careless base falls in ~2.5 s.
- **Round:** 25 s from the first frog touching the plinth. Lights stay lit for the round.
- **Winning:** light **4 or more** of the 7. Co-op: everyone who perched or based wins together.

**Controls:**

| Verb | In Frog Stack |
|---|---|
| Move | walk; as base, carry the stack; perched, lean |
| Hop | climb onto heads (tap or charged from the ground); tap hop from a perch |
| Tongue | haul a friend up (they hold on); hold on to be hauled |
| Croak | steady the stack in sync |
| Shove | wreck it (mischief) |
| Power | your Power Boon works normally, e.g. Moon Hop |

**Growth lanes:**
- Landing on a 4-stack's head (2.25 m) needs a charged **Hop II** (2.4 m); Hop I's 1.9 m falls short. Otherwise, get hauled.
- **Tongue II**'s 4.5 m hauls from farther away.
- **Air Hop** (Hop III) lights the beacon.
- **Leapfrog**, **Moon Hop** and **Frog Choir** are Boon routes to the beacon.
- **Twin Toll** and **Chorus** steady the stack.
- At the Keeper Landing, a chalk line on the pole marks your Landing 1 score, so the growth is visible.

**Rival plan:**
- **Base:** Brother Brass volunteers first ("I can carry that."); otherwise the highest-Loyalty Rival. The base walks toward the nearest unlit lantern that matches the stack's height, and corrects the lean 70% right after 0.35 s (Rookie: 50%).
- **Climbers** hop on when |θ| < 8° and ω < 10°/s, preferring the stack under an unlit lantern. Perched Rivals lean correctly 60% of the time (Rookie: 40%).
- **Hauls:** a Rival on top offers a haul to any human who stands within its reach for more than 1 s.
- **Pip** climbs first whenever a human is the base.
- **The funny failure:** Kestrel hops onto a leaning 3-stack ("Watch this!") and topples it, at most once per round, and never while a human is about to light a lantern.
- **Vex:** in Friends or Private lobbies only, 15% chance per round to shove a stack that has a human on top and fewer than 3 lights lit.

**Networking:** each stack replicates θ, ω and its perch list at 20 Hz. Perched frogs' poses are derived on each client from the base's transform plus the wobble. No perched frog runs its own synced physics, which keeps it inside M0's proof-of-concept budget (D §7).

**System:** Ready `[ FROG STACK ] Stack up. Light the lanterns.` · Beacon `[ SKY BEACON ] Lit.` (fireworks from the pole; a featured moment for clips).

### 6.2 Fly Catch (`toy_fly_catch`) [MUST-A]

**Fantasy:** lunch. A room full of flies, and the tongue you have been growing all climb.

**Arena** (`05` §6.2 shell: a reed bed 14 × 14 m, warm dusk light, 3 spawners at 2–4 m height). This file adds:
- 4 reed stumps 1.2 m tall (tap-hop height);
- 2 tall reeds with platforms at `ledge.II` (2.3 m);
- a lantern hook (`Anchor`) 4.0 m above the centre, a grapple point at Tongue II.

**The swarm** (`05`: 40 + 10*n* flies for *n* frogs in the room, so 120 for 8):
- **Fat flies:** ⌈*n*/2⌉ (4 for 8 frogs).
- **The golden fly:** 1.
- **Ordinary flies:** the rest (115 for 8 frogs).

**Flies are not fireflies** (glossary 17). They are score, never XP.

| Fly | Look | Points | Catch |
|---|---|---|---|
| Ordinary | dark body `#1B1E24`, teal wing glint `#3FD0C9`, 0.05 m | 1 | one tongue hit |
| Fat | twice the size, body `#2A2F3A`, wing `#7CF0E6`, a lazy buzz | 3 | **two tongue hits within 0.3 s**, from two frogs, or one Long Tongue lash, which takes 2 things at once. A single hit bonks it into a 1 s spin: an easy follow-up for a friend |
| **Golden** | body `#FFD84A`, a sparkle trail, a high whine | 5 | appears at 12 s from the centre hook and flies a figure-8 at 3.5–4.5 m height, 4 m/s, for 6 s, then leaves |

**Flight:**
- Flies swarm round the 3 spawn columns at 1.0–4.0 m height, cruising at 1.5 m/s.
- They **scatter at 3.0 m/s from any frog within 1.2 m**. Aim, don't chase.
- Flies drift down toward a frog that has stood still for ≥ 2 s. Patience pays.

**Rules:**
- **A lash** gulps a fly when the tongue tip passes within 0.25 m of it. The hit is lag-compensated.
- **Long Tongue** (rank III) also takes a second fly within 0.6 m of the first (`05`: "two flies per lash").
- **Croak** stuns ordinary flies in its radius for 1.5 s: they hang in the air, easy to pick. Inside this toy each frog's croak has a 3 s cooldown, so croak is a tool and not spam.
  - **Twin Toll** stuns for 2.5 s.
  - **Thunder Croak** stuns everything within 9 m.
- **Shove** pushes (mischief) and never touches scores.
- **Play:** 24 s, ending early if the swarm is empty. The door runs ≤ 30 s door to door (`05`'s "30 s" is the whole door).
- **Score:** the team total P against the maximum M (all flies caught: 132 with 8 frogs). Each frog's own count floats over its head during play (+1 pops) and appears in the Tally: `Pip 19 · you 14 · Kestrel 2`. It is for bragging only, not for jars.
- **Winning (co-op):** **P ≥ 50% of M.** The whole party wins: a Silver jar each. Otherwise a Bronze jar each.
- **Tuning target (GB):** 7 Rookie Rivals alone reach ~40% (Bronze, as `04` §5.1's first climb assumes). An engaged human scoring ≥ 15 tips it to a win, and an Awakened party wins comfortably (`04` §5.2: "Silver jar (won)"). The human's effort is visibly what decides it.

**Controls:**

| Verb | In Fly Catch |
|---|---|
| Move | position, and hold still to lure |
| Hop | stumps and platforms; Hop II reaches the 2.3 m reeds (the golden fly's height) |
| Tongue | catch; Tongue II grapples the centre hook |
| Croak | stun a cloud |
| Shove | mischief |
| Power | Boons work. In toys, Time Gulp adds +5 s to the round once (the room-clock rule, scaled so the door stays near 30 s) |

**Growth lanes:**
- **Hop II:** the reed platforms, the golden fly's lane.
- **Tongue II:** the centre-hook grapple.
- **Long Tongue:** 2 flies per lash, and fat flies solo.
- **Croak ranks:** bigger stuns.

In later climbs, a toy door after an Awakening becomes a victory lap.

**Rival plan:**
- **Target:** the nearest ordinary fly in reach that no human is lashing at. Aim is 65% (Rookie 45%).
- **Assists:** when anyone bonks a fat fly, the nearest Rival in reach follows up 0.15–0.35 s later (Moss, Brass and Pip prefer this). The human's bonk becomes a shared catch.
- **The golden fly:** Rivals hold off for 2.0 s while a human is within 6 m, so it is your shot.
  - Kestrel always goes for it with a charged hop ("Watch this!") and belly-flops into the reed water 50% of the time: the round's funny failure.
- **Ines** hunts ordinary flies greedily and says "Personal best." if she tops the tally.
- **Croak:** a Rival croak-stuns only a cluster of ≥ 5 flies.

**System:**
- Enter `[ DOOR 6 · TOY ] Lunch.` (`05`).
- Ready `[ FLY CATCH ] Fat flies need two tongues.`
- Win `[ FLY CATCH ] 71 of 132. Lunch is served.`

### 6.3 Jar Tag (`toy_jar_tag`) [MUST-B]

**Fantasy:** tag, but "it" wears a jar on its head. It is the house-sized Jar of the Warden in miniature: you learn to run from the jar before it comes for real.

**Arena:**
- **The court:** a glowing moss ring, r 6 m, fence line `#9BE07A` 0.4 m high. It is a soft wall for frogs in a round (they bounce back at 2 m/s) and open to walk into.
- **4 stone pillars:** r 0.5 m, 2.2 m tall, at r 3.5 m and bearings 45° / 135° / 225° / 315°, each topped with an `Anchor` ring.
- On a Landing the court is centred on the toy spot (0, −9); in the Meeting room at (0, −1).

**The jar:**
- Glass `#BFE8FF` at 40% opacity, with a white rim highlight, 0.7 m tall. It is the same asset as Doppelfrog's "jarred" drop (`03` §8.5).
- The wearer's croak is muffled: pitch −4 semitones, lowpassed.

**Rules:**
- **Start.** A round starts when ≥ 3 frogs have stood in the court for 1 s. The jar drops onto one frog from above in 1.0 s, with a *clunk*.
  - The frog is seeded, and never the same frog two rounds running.
  - A profile's **first** Jar Tag round always starts on a Rival (Vex by default), so you learn by running.
- **Tag** = the wearer's **Shove** connecting. In this toy it bumps at 2 m/s instead of 6 m/s, so tags never fling anyone.
  - The jar hops to the tagged frog's head in a 0.3 s arc.
  - The new wearer is dazed for 0.6 s.
  - The old wearer can't be tagged back for 2.0 s (Snuff Tag's rule).
- **The wearer moves at ×1.10**: a role modifier, equal for anyone who wears the jar.
- **Hum low.** Hold Croak: your belly light dims 80% and your name tag hides beyond 4 m, but you move at 60%. This is GDD dimming, re-themed.
- **Round length:** 20 s. The jar glows brighter and ticks through the last 3 s.
  - In the Meeting room a round also ends 2 s after the second key.
- **At the bell:**
  - the wearer gets the **jar ring**: a dotted cartoon ring over its head for the next door. It is cosmetic framing, not shame (the WANTED-poster lesson, `03` §9.2);
  - **winners** are frogs who **never wore the jar** this round ("Jar Dodgers").
- **Vengeance** can land in a Jar Tag round, by `03`'s rules (tongue-tag the traitor, `05` door 12). Jar tags and Vengeance tags don't interfere.

**Controls:**

| Verb | In Jar Tag |
|---|---|
| Move | run |
| Hop | dodge; Air Hop vaults the wearer |
| Tongue | grapple a pillar ring (Tongue II); it can't tag |
| Croak | hold to hum low |
| Shove | tag, as the wearer; otherwise a normal shove |
| Power | Boons work (Moon Hop is a great escape) |

**Growth lanes:**
- **Air Hop** vaults straight over the wearer.
- **Tongue II** grapples a pillar top: an instant escape up and over.
- **Leapfrog** launches off a friend's head.

**Rival plan:**
- **As wearer:** chase the nearest untagged frog, humans and Rivals alike. Switch targets after 5 s on the same frog, which spreads the fun. Lunge at ≤ 1.0 m.
  - Vex fakes: he turns away for 0.5 s, then lunges.
- **As runners:** flee directly away from the wearer and path round the pillars. Hum low when the wearer is within 6 m and facing away.
  - Rookies bonk a pillar 25% of the time: the funny failure.
  - Kestrel taunts from 2 m ("Watch this!") and gets tagged.
  - Pip hides next to a human, which chains tags comically.
- **No Rival shoves a runner into the wearer.** Rivals shove only as the wearer's tag.

**System:** Ready `[ JAR TAG ] Don't be wearing the jar at the bell.`

### 6.4 Lily-Pad Sumo (`toy_lily_sumo`) [MUST-B]

**Fantasy:** everyone on floating lily pads, everyone shoving, the pads shrinking. Last frog dry wins.

**Arena** (`05` §6.2: a dark pond 18 m across, 5 `Pad`s of r 2.0 m that shrink 10% every 5 s):
- The pads are the **centre pad** (0, 0, 0) and **4 ring pads** at r 4.5 m, bearings 45° / 135° / 225° / 315°, floating 0.15 m above the water.
- Pads shrink at 5, 10, 15 and 20 s to 90%, 81%, 73% and 66% of their radius. Each shrink is flagged by a 1 s wobble-flash and a loud *shlurp*.
- The edge gap between pads is 0.5 m at the start and 1.9 m at 66%, inside a tap hop's 2.6 m.
- A mossy bank rings the pond (r 9–10 m, 0.3 m above the water), lit by warm lanterns.

**Rules:**
- **Start:** 2 frogs on each ring pad (seeded), and the centre pad empty, so everyone rushes for it.
- **Tipping** uses the `Raft` rule (`03` TipRaft): a pad tilts toward its weight, and over 18° for 1.5 s, frogs on it slide at 1.5 m/s toward the low edge.
- **Sinking** uses the `Pad` rule:
  - a pad holds **3** frogs at full size, **2** below 80% radius, **1** below 60%;
  - an overloaded pad sinks at 0.15 m/s, and at 0.25 m under, everyone on it slides off;
  - once the load drops, it rises back at 0.3 m/s.
- **Out** = touching water. You're a splash, not a loser:
  - Out frogs swim at 1.5 m/s and can't climb back onto slick pads.
  - **Ripple croak:** from the water or the bank, your croak tilts the nearest pad inside your croak radius by 8°, away from you. Each frog has a 3 s cooldown.
  - The eliminated keep shaping the game, as Among Us ghosts do.
- **Tongue on frogs is off in Sumo.** Shoves decide it. Tongue on a pad's stem anchor pulls that pad 1.0 m toward you (2 s cooldown), moving pads, not frogs.
- **Shove** is the normal 6 m/s impulse (`05`). Tilt and slide do the rest.
- **Play:** ≤ 24 s, ending early when ≤ 1 frog is dry. It usually ends in 16–20 s.
- **Winning:**
  - the frog(s) **still dry** at the end win;
  - if the last frogs get wet within 0.2 s of each other, they share the win.
  - Winners get Silver jars and everyone else Bronze (`04`).

**Controls:**

| Verb | In Sumo |
|---|---|
| Move | footing |
| Hop | pad to pad; Air Hop recovers from a shove in mid-air |
| Tongue | pull a pad toward you by its stem; Tongue II grapples a far pad |
| Croak | from the water or bank: a ripple |
| Shove | the verb |
| Power | Boons work (Moon Hop's landing shockwave is devastating here) |

**Growth lanes:**
- **Air Hop** saves you in mid-air.
- **Tongue II** grapples to safety.
- A charged **Hop II** crosses late gaps with ease.
- **Croak II and up** widen your ripple's reach.

**Rival plan:**
- **Target:** the nearest frog on the same or an adjacent pad, preferring one near a tipping edge (tilt > 10°). Shove at ≤ 1.2 m.
- Rookies overshoot: a missed shove carries them into the water 35% of the time. That is the funny failure.
- A Rival that just shoved a human picks a different target next.
- **Brother Brass** holds the centre pad and counter-balances ("Go. I'll hold.").
- **Kestrel** charge-hops onto the centre pad at 5 s ("Watch this!"), overloading it.
- **Moss** steps onto the high side of a tipping pad to save whoever is on it ("Nobody falls today.").
- **Gutter** targets whoever last shoved him, this round only.
- **Out Rivals** ripple every 4–6 s, gentler than humans.

**System:** Enter `[ DOOR 16 · TOY ] Last frog dry wins.` (`05`).

**Climb 1's beat:** at door 16 the seed puts Moss and Vex on the same start pad, a comic rematch after door 11's betrayal and door 12's Vengeance (`03`).

### 6.5 Where toys appear

| Context | Climb 1 (authored) | Seeded climbs |
|---|---|---|
| Landing 1 | Frog Stack | one of {Frog Stack, Jar Tag} |
| Toy door 6 | **Fly Catch** | — |
| Keeper Landing | Frog Stack, with the Landing 1 chalk line | one of {Frog Stack, Jar Tag} |
| Meeting rooms (forks 12, 17; also 7 later) | **Jar Tag + Frog Stack** (both, always) | both, always |
| Landing 3 | **Jar Tag** | one of {Frog Stack, Jar Tag} |
| Toy door 16 | **Lily-Pad Sumo** | — |
| Toy doors, seeded | — | 2 per climb, in the band 6–16 (`05`), drawn from {Fly Catch, Lily-Pad Sumo} (+ Big Toad [SHOULD], `06`) |

**Seeding rule:** no toy appears at two consecutive stops (Landings and toy doors), not counting the Meeting room.

**Milestone A** contains only Frog Stack and Fly Catch, because the demo ends at the Keeper Landing. Both are complete, polished toys.

---

## 7. Landing Party mode [MUST-B]

**Job:** the toys on their own, for a group that wants 10 minutes of silliness, or for the end of a night (FO §3.6, §5.1; CRIT #26). Drop in and drop out.

- **Entry:** the hub's toy door (§2.3), lit after the profile's first Keeper clear. Walk in; it uses the 10 s start ring.
- **Venue:** a Landing-1 deck (Mouth 37°) strung with extra lanterns. Frog Stack and Jar Tag play on the deck's toy spot. Fly Catch and Lily-Pad Sumo play in their own cells through the exit door, and the stair ride hides the switch.
- **The party frog.** Everyone plays the same body:
  - **Glow Lv6 look, and every verb at rank III** (Air Hop, Long Tongue, Twin Toll);
  - no Boons, no classes, no Signatures.

  It is fair to newcomers and veterans alike, and it gives newer players a taste of Awakened power.
- **A round** is the four toys in a seeded order, never opening with the same toy twice running:
  - Frog Stack 25 s → Fly Catch 24 s → Jar Tag 20 s → Lily-Pad Sumo ≤ 24 s;
  - each with 2 s of Ready, 2.5 s of Tally and ~4 s of walking;
  - **≈ 2:10 per round** (FO: "rounds of 2–3 min").
- **Party points:** **3** for a toy win (co-op toys: everyone in the winning team) and **1** for playing. After each round, a 10 s standings overlay. The top frog(s) wear a **paper medal** (a cosmetic prop on the chest, `09`) through the next round.
- **Between rounds:** **Another round** and **Back to the Well**, equal buttons; a majority of humans decides. Nothing starts by itself (FO §4.4 #7). While the buttons are up, the deck's toy is free play.
- **Drop-in and drop-out:** a friend who joins takes a Rival's seat at the next toy; a human who leaves hands their seat to a Rival. Seats are always 8.
- **Host options:** switch each toy on or off (at least 2 stay on). **Big Toad** [SHOULD] joins the playlist if it ships (`06`, TEAMBOUND One Body).
- **Rewards: records only.**
  - Per-toy personal and lobby bests (most lights, most flies, Jar Dodger rounds, Sumo wins) show on the hub's best-door wall under a **Toys** line.
  - **No Pearls, Rank Points, Bestiary stamps or unlocks.** The toys must never become a farm, and the climb stays the progress engine (FO §4.3). The results title **Sumo** does not count Landing Party wins.
- **Rivals:** the same toy plans (§6); the Rookie label follows the viewer's profile.

---

## 8. `rim_surface`: the Rim [MUST-B]

**Job:** "comes out of well sees the sky": *played*, not only watched (D §8.2 #15). After ★1 (`01` owns its 26 s), you stand on the lip of the well you climbed, **with Glide on**, and the results play while you explore the new sky.

### 8.1 Layout (well frame: the axis is the origin; the lip is at y 180)

- **The lip ring:** a stone annulus from r 51 to r 58 m at y 180, topped with mossy grass `#6FA34A`. It is walkable all the way round, about 340 m.
- **The 12 lantern poles** lean in over the Mouth, their lanterns at r 47, y 182: the "stars" you saw from below (WORLD §4.4). Tongue a pole and it chimes in your seat's note.
- **The results terrace:** a stone disc r 11 m centred at r 66 m, bearing 180° (across the Mouth from strand 1). A 6 m-wide stone bridge joins it to the lip ring. Its south edge is open to the cloud sea, whose tops are at y 150.
- **The Rim pool:** a Mirror (a rain pool in a stone basin) on the terrace, 6 m west of its centre.
- **The glide line:** three moss pillars in the cloud sea south of the terrace, 9 m, 16 m and 24 m from its edge, with tops at y 177, 174 and 171.
  - The last is **the lookout**: a flat top, r 3 m, facing the **tear in the dome** where the stars of Space show (bearing 200°, about 50° up; `01` owns the sky and the tear, WORLD Law 3).
- **Only two exits: Climb again and Rest** (`05` §6.1), and no door plaque. A lip spot at bearing 0° is reserved for Sky Preview's entrance if it ships [SHOULD] (`06`).

### 8.2 Arrival and play

| t (s) | What happens |
|---|---|
| 0.0 | ★1's cloud puff wipes to the party standing on the terrace. The **Glider molt** is on: glide membranes on the fixed sockets (`02`) |
| 1.0 | **First surfacing only:** a capstone chips off the lip by your feet and lands on your head with a *tok*: the **Rim Stone** hat (`08` #41) |
| 2.5 | The results ceremony starts as the lower-third overlay (`04` §12). Floor 4's jars pop at meter 2, and `First surfacing +50` is its own Pearl line (D §8.2 #17) |
| ~22 | **Climb again** and **Rest** appear (§8.3) |

- **Glide is on by default** (D §4). The first time a frog leaves the ground on the Rim, one prompt appears: **Hold Hop to glide**. The numbers are `01`/`02`'s; WORLD's greybox is gravity ×0.55, a fall of ≤ 3 m/s while gliding, and 1.5 s per jump.
- **The glide line is the toy of the Rim.** Pillar to pillar to the lookout, then look up through the tear. There is no score. It is the first "see something bigger" of the next layer.
- **Falling into the clouds** is free. After 2.0 s below y 165, you puff back onto the terrace. The first time only: `[ THE SKY ] It put you back.`
- **Sound:** "Your croak echoes in the well and goes silent at the rim" (FO §6.2 #5). The croak's reverb send is 0 here, so it sounds small and open.
  - [SHOULD] **The First Shout** (WORLD §10.2): the first croak within 30 s gets thunder back from the cloudbank 6.0 s later.
- **The Rim pool (a Mirror):** there is no nudge, except that the water glints **once per profile**, the first time you can afford a Common. The +50 Pearls exist to make that first purchase possible right there (`08` §0). No text and no sound.
- **Rivals on the Rim:**
  - they glide clumsily, and Kestrel tries the lookout and misses once ("That was on purpose.");
  - Moss sits on the lip, looking down the well (a proposed line for `03`: "It was so small.");
  - Pell stands at the lookout: "Interesting."
- [SHOULD] **The share card** takes its group shot on the terrace at 2.5 s (D §7 SHOULD #1).

### 8.3 Leaving the Rim

- **Climb again:** a majority of humans. The 4.0 s dive down the Mouth to the Well Bottom and a fresh hatch (§2.10). In the slice, the next climb is a seeded Well climb, with `moss_snail` and `web_spider` debuting (D §5).
- **Rest:** per human. The host's Rest ends the session for everyone, with a fade to the title loop.
- **No caps.** It is the end of a climb, so nobody is hurried and no gust blows.

---

## 9. Build notes

### 9.1 Code (assemblies from `10` §3.2)

| Assembly | Types this file needs |
|---|---|
| `Game.Tower` | `HubDirector` (states, unlock reveals, the idle nudge); `StartRing` (the 10 s hub vote, the 0.5 s solo dwell, the replace-save line); `LandingController` (`10`: arrival, exit caps, gust); `KeeperCeremony` (the §4.8 timeline as data); `JarLineup`; `MouthRain`; `StallService` (panel ↔ `04`'s `EconomyDef`); `RestBed`; `MeetingRoomController` (keys, locks, hatch, rope, reunion banner); `RimDirector`; `LandingPartyDirector` |
| `Game.Rooms` | `ToyRound` (abstract NetworkBehaviour: Ready → Play → Bell → Tally, one `NetworkVariable<ToyRoundState>`); `FrogStackToy` + `StackPendulum` (uses `05`'s `StackPad` kind); `FlyCatchToy` + `FlySwarm` (`05`); `JarTagToy`; `LilySumoToy` (reuses `Raft` and `Pad`) |
| `Game.Bots` | `ToyBotPlan` per toy (§6), run by `BotPlanRunner` (`10`) |
| `Game.UI` | the start-ring and ready-pip widgets, the stall panel, ceremony overlays, the toy Tally, the best-door wall panel, the Landing Party standings |
| `Game.Platform` | `BestDoorService` (the Steam stat `BEST_DOOR` and the friends read, with the LAN/offline fallback, §2.6) |

### 9.2 Data (`Assets/_Knotwell/Data/`, `10` §4.2)

| File | Holds | Owner |
|---|---|---|
| `hub/hub_layout.json` | the §2.3 station placements not already in `05`'s room card; unlock conditions per station | this file |
| `landing/landing.json` | station placements (§4.1); soft and hard caps (§4.4); the arrival timeline (§4.3); the Keeper ceremony timings (§4.8); the Landing-by-Landing toy table (§4.10) | this file |
| `toys/toy_rules.json` | every number in §6 (caps, heights, gains, thresholds, cooldowns, Rival plan weights) and §6.5 placement rules | this file |
| `toys/landing_party.json` | playlist, points, round timings (§7) | this file |
| `rooms/<id>.json` for the 9 rooms here | RoomDef, kit, test hooks | `05` |
| jar contents, the Mouth's rain amounts, stall items and prices | — | `04` (`economy/economy.json`) |
| strings | `hub.*`, `landing.*`, `toy.*`, `meeting.*`, `rim.*` keys in `strings/en.json` (D §8.2 #27) | this file |

### 9.3 Networking notes (for `10`)

- **FlySwarm:** live fly positions as int16 × 3 at 10 Hz, sent only to that room's clients while the toy runs: ≤ 120 × 6 B × 10 Hz ≈ 7 KB/s for about 24 s. Catches are host events.
- **Frog Stack:** per stack, θ, ω and the perch list at 20 Hz. Perched poses are derived on each client.
- **Sumo:** pad tilt and sink exactly as the `Raft` and `Pad` kit replicate them (`05` §2.2).
- **Jar Tag:** the wearer's seat and the tag-back immunity end time.
- **Meeting window:** a local-only secondary camera, rendered only for clients inside the Meeting room. The other fork room's frogs are already visible to them under `RoomVisibility` (≤ 2 live rooms, `10`).

### 9.4 Tests (EditMode / PlayMode; failing any one fails the build)

| Test | Asserts |
|---|---|
| `HubStartRingTests` | solo: a 0.5 s dwell (1.5 s with a save); 2+ humans: a 10 s ring that resolves early when everyone is in a doorway; a tie goes to the first human's door; Rivals never vote |
| `HubUnlockTruthTests` | every chain tag and lintel plaque renders from `difficulty.json` data; in a demo build, Hell's tag says "Full game" (the System never lies) |
| `LandingExitTests` | solo has no cap; with 2+ humans the door opens only with everyone ready before the soft cap; walk-vote after the soft cap; the gust at the hard cap; the Keeper Landing uses 45 / 70 s |
| `KeeperCeremonyOrderTests` | D §5's steps 1–7 run in order; buttons by 30 s the first time and 17 s later; only step 4 takes the camera; it still runs after a failed Keeper |
| `ToyRoundSoak` | 50 seeds × each toy × {1 human + 7 Rivals, 4 humans + 4 Rivals}: no stuck round; caps respected; every participant paid the right jar grade |
| `FrogStackReachTests` | with `02`'s H and `05`'s gauges: every lantern is reachable by exactly its stack height; the beacon is missed by a tap hop from a 4-stack by ≥ 1.0 m and reached with tap + Air Hop |
| `FlyCatchTuningTests` | 7 Rookie Rivals alone lose (P < 50% M) in ≥ 70% of seeds; adding a scripted human scoring 15 wins in ≥ 60% |
| `MeetingRoomFlowTests` | extends `05`'s `Meeting.AutoSolve`: the hatch passes one item then shuts; the rope at 45 s; cleared-with-help marking; toys end ≤ 2 s after the second key |
| `NoPaidPromptInClimbTest` | no UI element bound to a Supporter Set or DLC id is active in any scene state except the hub (§2.6) |
| `ToysNeverCostTests` | no toy path can change spots, Team Lives, banked fireflies, RP or Pearls |

---

## 10. Open questions

1. **Meeting room shape (for `05` §3.4).** `05` describes halves that "swap keys through the window hatch", which implies a split room. This file uses **one shared room**: each half walks its key to the far lock, and the hatch passes one *helping* item into the still-live fork room. It is simpler, it lets Vengeance and Jar Tag include everyone, and it matches `04`'s "one item through a Meeting window". `05` should align, or say why a split room is better.
2. **Pond banking (for `05` §6.1).** `05` banks the pond's 30 fireflies at the door-1 threshold, which would put Lv2 at ~0:35. This file banks them when each frog finishes its cloud, so Lv2 lands at ~0:20 as D §5 and `04` §2.2 require. `05`'s threshold stays as the fallback for fireflies left in the cheeks.
3. **Hub start ring.** Hub doors use a **10 s** ring for 2+ humans, instead of the climb's 4 s walk-vote, so a friend in the Mirror isn't yanked out mid-try-on. If this breaks a D rule, drop it to 4 s.
4. **Frog Stack relies on `03`'s StackPad cap of 4.** With 8 seats, that means two towers. If M0's netcode proof of concept shows perched frogs stuttering at 150 ms, cap at 3, lower the lanterns by one step, and keep the beacon's Air Hop rule.
5. **The Keeper Landing is tight.** The first-time ceremony takes ~30 s before the buttons, leaving ~10 s of D §5's 40 s for the stall, jars and toy. The soft cap is 45 s, so the D §5 clock may slip 5–10 s at 10:25–11:05. Measure it in the greybox before cutting anything.
6. **Door 16's clock.** D §5 gives door 16 20 s (17:10 → 17:30). Lily-Pad Sumo is capped at 24 s and usually ends in 16–20 s by elimination. The authored clock may run a few seconds long.
7. **Toys pay only Bronze or Silver**, following `04` §10.2. So the Frog Stack beacon and a Fly Catch rout feel great but pay no more than a plain win. If playtests show toys feel skippable, the lever is a `04` change (for example, a Landing-toy win pays Silver), not a new currency.
8. **Landing Party pays no Pearls.** This is deliberately anti-farm. If players ask for progress there, add toy-milestone hats in `08`, never currency.
9. **The Mirror is veiled until the first Keeper clear** (D §8.3's "no shopping before the Keeper", and `08`'s "the Mirror opens" at ~10:40). A friend on a new profile joining a veteran's lobby therefore sees a veiled Mirror, even though the veteran sees it open. Each client's view is local by design. Confirm that this is acceptable.
