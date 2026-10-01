# FUN OVERHAUL: every door makes you bigger

**Version** 1.0 · **Date** 2026-09-28 · **Status: BINDING design direction for the Unity build.**

**Authority.** Where this document conflicts with `_design/GDD.md` (KNOTSPIRE v1.0) or `_design/WORLD_STRUCTURE.md` (v1.0), this document wins. Those two documents stay useful as a parts bin: their room ideas, Rival roster, System voice and scale-reveal choreography carry over wherever this document keeps them (see §7). The Three.js scaffold in `_scaffold/` is obsolete. Nothing here should be built there.

**What this document fixes.** The user's words were: "the game doesn't feel fun or addicting or attractive", "it should feel immersive and addicting and fun, feel progress etc.", and "doing unity based game is smarter".

**Constraints.**
- Unity 6.3 LTS (C#), URP 17.
- 1–8 players, with bots filling empty seats.
- Online play over Steam plus LAN.
- Assets are procedural, code-generated, or free CC0 packs, each with its license recorded.
- Built by AI coding agents.

**How it was made.**
1. Three overhaul proposals were written: *power*, *party* and *immersion*.
2. Two judges scored them. Judge 0 chose *party* as the base; judge 1 chose *immersion*.
3. Two refuters attacked them: a design and evidence refuter, and an ethics refuter.
4. This document starts from the structure both judges converged on: *party*'s together-by-default numbered doors, run at *immersion*'s first-session pacing. It then grafts the picks and applies the valid objections. §10 logs what was accepted, what was rejected, and why.

**Source keys.**

| Key | Source |
|---|---|
| RR | `reports/Addictive tower game design research.md` |
| UT | `reports/Unity co-op party game tech stack.md` |
| DX | `research_notes/Addictive tower game design research/our_design_diagnosis.md` |
| GDD / WORLD / CRIT | The v1.0 design documents and their critique |
| hero_0/1/2, name_0 | The saved debates in `_design/inputs/` |

**Evidence caveat.** No benchmark game publishes D1 or D7 retention. Every timing and number below is a **greybox hypothesis**, not a finding. The proof gates are in §9.3.

---

## 1. Diagnosis: what was wrong, with evidence

1. **It measured loss where the genre measures gain.**
   - Wax is health, and the hero's body visibly shrinks all run.
   - Almost every verb costs wax: Brighten, Hold the Door, Cinch, Drip and Relight. Floors 2–4 also burn 1–3 wax/min.
   - The rules say "No permanent power", and "Levels never grant power".
   - Old rooms clamp your powers back to layer-1 numbers, while each tier adds up to −24% timer and +32% monster speed.

   *Evidence:* GDD §4.3, §5.1–5.2, §9.1, §9.9; WORLD §3.1, §9.4; RR table "Power fantasy". The user asked for "increasing powers". The design did the reverse.
2. **Growth was rare and often hollow.**
   - A 36–45 min run gave about **4 picks**, and the first arrived **4:40–7:10** in.
   - The Altar mixed in filler cards ("+20 wax", "Blank").
   - About half of the 16 traits did nothing outside their home room.

   *Evidence:* GDD §9.2–9.3; CRIT #25; DX §2 fact-check #4. Hades offers a pick at every chamber, and Vampire Survivors "barely lets you go a few seconds".
3. **The first session was a rules exam.**
   - The controls had **22 bindings (25 keys)**.
   - At 60 s came a 45 s Door Draft. Each of 4 plaques showed 7 fields.
   - A first-timer saw **0 of the 7** marked words of the first objective.

   *Evidence:* GDD §4.1, §3.6, §6.0.3; CRIT #34; DX fact-check #2–3. Roblox's own docs warn that players who don't understand the first minutes quit (RR).
4. **Toys were replaced by bureaucracy.**
   - The betrayal layer had 10 Knife types, Soot tiers, a Tribunal, truth-stamped Notes, Keyhole bets with odds formulas, a Pact Pot and a Clue Composer.
   - About 20–23 of CRIT's 34 findings are contradictions, soft-locks or exploits between these interlocking systems. CRIT #14 shows the betrayal math can't even produce the betrayals it promises.
   - The design has about 110 coined terms (an estimate, never counted).

   *Evidence:* GDD §7; CRIT #4, #14; DX §1.
5. **Door choice was an expected-value spreadsheet, not a temptation.**
   - Plaques showed SPLIT/FINISH/SOLE payout rules.
   - A SOLE E door paid about 4.5× an A share, so optimal solo play saw **2 rooms per run**.

   *Evidence:* GDD §3.6, §6.0.4; CRIT #10. Hades and Alice in Borderland show *what you get* and *how scary it is* instead (RR).
6. **Failure paid nothing.**
   - A Scorched room gave no reward and cost 25% of max wax on the next floor.
   - The only meta "progress" was a Codex that *spoils* rooms and runs out after about 2 runs.
   - Cosmetics were the only permanent gain: a Gilded skin took about 29 runs.

   *Evidence:* GDD §5.3, §9.8, §11.5; CRIT #11. Hades' "every run counts" and Vampire Survivors' permanent gold are the best-supported findings in the research (RR; roguelite fact-check conclusion 3).
7. **Too much of every floor was spent outside rooms.**
   - Landing, Intermission, Draft, Latch, Altar and the wait for the Tide took **20–55% of each floor**.
   - The minigames were "rarely played" because waits were capped at 60 s.
   - The only mode was a 36–45 min run.

   *Evidence:* GDD §3.3, §5.4; CRIT #26; RR "the fault is how few meaningful gains fit into each minute".
8. **The "wow" was locked away.**
   - The flagship reveal, Out of the Well, played after a **~38-minute** run.
   - Layers were reskins by default.
   - The campaign took about 2.6 h.
   - The world grew while your powers stayed clamped.

   *Evidence:* WORLD §3.2, §9.1, §10.2; DX §2 and §4.
9. **It was hard to be attracted to.**
   - The tagline, "Belay or betray", is climbing jargon, and the pitch needed six bullets.
   - The key art was dark rooms "lit only by the players", and no monster tell had to glow on its own.
   - There was no hat slot.
   - The user's own image, the frog in a well, was demoted to a statue.

   *Evidence:* GDD §0, §1.1 pillar 5, §2.2; CRIT #27, #28; DX §3; hero_0 §1. Among top-selling Steam capsules, 41% show a figure or creature, and about 7 in 10 read at 120 px (RR).
10. **The comedy and social channels were thin, and the budget went to things nobody sees.**
    - No laugh was guaranteed early.
    - Chat was 24 fixed phrases, with no voice.
    - Bot-only rooms ran off-screen in a Ghost Sim, which CRIT calls "the largest hidden cost". Live Grate feeds were "impossible as written".
    - The root cause was a habit of rigor. The spec states "Fun before physics" but has no "fun before rules".

    *Evidence:* GDD §3.7–3.8, §6.1, §7.9; CRIT #5, #20; RR "Our tower kept the genre's surface and inverted its engine". The hits get comedy from **coupling + visible blame + low failure cost** (Chained Together, PEAK, R.E.P.O.; RR).

**One-line verdict.** The pieces were right and pointed the wrong way. First **subtract** rules, currencies, controls and nouns. Then point every door, death and layer at **visible growth**.

---

## 2. The new fantasy and the hero

### 2.1 One sentence

> **Hatch as a nobody frog at the bottom of a well, climb twenty monster doors with up to seven friends or scheming bots, get absurdly stronger behind every door, and leap out to find the sky is the floor of a bigger well — if nobody cuts your rope first.**

- **Hook (capsule and store):** *Tiny frogs. Monster doors. The sky is another well.*
- **Tagline (kept from GDD §0):** ***Climb together. Fall alone.*** "Belay or betray" is retired, because "belay" is jargon.
- **Working title: KNOTWELL** (name_0's top pick).
  - "Knot" is the tether and Pact; "well" is the setting; said aloud it sounds like "not well".
  - It fits either hero, so it does not depend on the hero gate in §2.3.
  - KNOTSPIRE is retired, because a frog game already on Steam, *Croakspire*, sits next to it.
  - **Blocking task:** a USPTO, EUIPO and KIPRIS trademark search, plus domain and Steam handle checks, before any public use.

### 2.2 Pillars (these replace GDD §1.1)

Every feature must serve at least one pillar.
1. **Every door makes you stronger, and everyone can see it.** Growth is shown on your body and announced by the System with its cause. It is never a hidden stat.
2. **One monster, one rule, one weird way out.**
   - Each rule room has one warning cue, one plain rule, an obvious clear and a hidden clear, as in DOORS and The Tutorial Is Too Hard.
   - Monsters still can't be hit to death, but your power shows everywhere around them.
3. **My mistake is your problem.** Bodies are linked in every room, and blame is visible. Failure is cheap on Normal and cruel on Hell.
4. **Betrayal is a punchline.**
   - The door announces it.
   - It stays inside one room.
   - It ends in a slow-motion replay, and the victim gets revenge.
5. **Solo is a full lobby.** Seven named Rivals fill every empty seat. They help, fail in funny ways, gasp at your growth, and sometimes betray you.

**Tone rule, kept from GDD pillar 5 in a new form: "dread, then a waltz", at the scale of single doors.**
- Rule rooms stay dark and tense.
- Every tell, frog and plaque glows on its own inside that darkness (CRIT #28 read correctly: *self-lit tells*, not *no darkness*).
- Breather rooms and Landings are warm and loud.

**House rules** (these extend GDD §1.3):
- **Fun before rules.** Nothing ships that needs a formula on screen, a pick order, or a wait that nobody can play through.
- **The System never lies.** Every number it shows is true and comes from real data. That covers odds, rarity percentages and progress bars.
- **The fairness contract (§5.4) is law.**

### 2.3 Hero recommendation: the Firefly Frog, behind two gates

**The hero is an upright, bean-shaped frog whose light is the fireflies it has eaten** (hero_0's Firefly Frog, with hero_2's back-spot health display).

**Why the frog wins for this game:**
- **It puts the user's image in the player's body.**
  - The user said: "frog in a well, comes out of well sees the sky, then go to sky sees space."
  - With a frog hero, every scale reveal lands on *you*.
  - At the Revelation, the giant on the rim of the bigger well is your own species.
- **It has a state that grows.**
  - Belly brightness and orbiting fireflies track your Glow Level.
  - Boons add visible body parts.
  - Each layer brings a molt, using add-on parts on one rig (§4.1).

  A candle's defining image is shrinking. RR's own fix was to bolt a Flame axis onto it.
- **It has the best verbs on the table** (hero_1 concedes this):
  - a **tongue** that grabs, grapples, pulls levers and catches falling friends;
  - a **charged hop**, the textbook squash-and-stretch move;
  - a **croak** that rings bells, and whose chorus becomes a co-op instrument.
- **It has a head for hats**, and it makes a plushable silhouette. On the evidence: hats are "consistently popular", but the Roblox category data is unverified, so this is a design argument, not a sales one.
- **Its myth comes free.** The moon toad Chan Chu becomes the Space Warden.

**What the frog costs, and how we pay for it:**

| Risk (source) | Rule |
|---|---|
| HP is less readable than a shrinking candle (hero_1 §1.1) | HP is **3 glowing back spots**, readable from the 3/4 camera, identical for everyone. Deflation and eyelid droop add a second cue. The hitbox never changes. |
| A frog is low and wide, so bodies occlude each other in an 8-player crowd (hero_1) | **Upright bean posture.** The frog crouches only to hop. The camera sits at 3/4 with a player-colour rim light (UT toon stack). |
| The tongue is an unreadable ranged betrayal (hero_1) | See the tongue rules in §5.4: props react after a 0.25 s cheek-puff tell. Outside Heart doors, a tug on another player moves them at most 1 m and never toward a drop. Inside Heart doors a real yank needs a **0.6 s** tell. **The design must still work with tongue-on-player removed** (the fallback is shove). |
| Animation quality from AI agents (UT: humanoid clips retargeted onto stubby bodies "look off") | **All frog motion is procedural:** 2-bone leg IK (hand-written, because UnitySpringIK's license is unchecked), a spring-bone throat sac and eyes, a tongue spline, and PrimeTween squash and stretch. Budget 1.5–2 extra tech-art weeks. That is an estimate, not a measurement. |
| Meme risk | Round face, no lips, no droopy lids, dart-frog colours. Five cold viewers must make no Pepe association. |

**Gate A: readability** (blind test in week 3 of the greybox).
- Setup: 8 frogs on screen at the real camera distance, 25 m.
- Pass: testers read HP to within one spot and name each frog's power tier (dim, glowing or haloed).
- Run the same test on the Wick. The frog must score within 10% of it.

**Gate B: the same loop, A/B** (week 4).
- Run the identical 10-door greybox twice, once as the Frog and once as a **Wick with a growing Flame axis** (RR's fix).
- Pick the hero with better "name a power you gained" recall and better "Worth it?" scores.

**If either gate fails, ship the Wick with the Flame axis.**
- Every system in this document is written to work for both heroes: fireflies become flame motes, the tongue becomes a wax-thread lasso, the croak becomes a flare pulse.
- The frog then survives as a Candle-Toad cosmetic line and as the Revelation silhouette (hero_1).
- The name KNOTWELL survives either way.

**Until the gates pass, lock nothing that assumes the frog:** not the capsule, the trailer, the Warden art or the store copy.

---

## 3. The new core loop, with exact timings

### 3.1 Structure: one climb is one layer of 20 numbered doors

**The unit of play is a Climb.** A Climb is 20 numbered doors, played as 4 floors of 5 doors each. It replaces the GDD run, which was 5 floors with Drafts.

| Point | Door | What happens |
|---|---|---|
| Landing 1 | after door 5 | A 40 s warm stop |
| **The Keeper** | door 10 | Mini-boss, then Landing 2. **A clean place to stop:** save and leave with everything banked |
| Landing 3 | after door 15 | A 40 s warm stop |
| **The Warden** | door 20 | Layer boss, then the scale reveal and the results ceremony |

**Door numbers run on across the whole world**, the way DOORS counts its hotel doors and the manhwa counts floors:

| Layer | Doors |
|---|---|
| Well | 1–20 |
| Sky | 21–40 |
| Space | 41–60 |
| Beyond | 61–80 |

"Best door: 37" is the bragging number. It shows on the hub wall next to your friends' best doors.

**The party walks together by default**, as in DOORS. Comedy needs everyone in one space, and no room ever runs with only bots in it, so the Ghost Sim is deleted.

### 3.2 Door types and lengths

| Door type | Share of a climb | Length | What it must contain |
|---|---|---|---|
| **Breather** | ~40% (8 doors) | 15–30 s | At least one of: a **jar** (fireflies and coins), a **toy door** (a 30 s physical minigame that pays a jar), a **window** (a crack in the wall showing how big the world is), or a **sleeping threat** to sneak past. Warm light. Never an empty corridor. |
| **Rule door** | ~40% (8 doors) | 45–90 s; soft cap 90 s, hard cap 150 s | One monster, one cue, one rule (§3.8). Suits: A Body, B Mind, C Together, ♥ Heart. Dark room, self-lit tells. |
| **Set piece** | ~10% (2 doors) | 90–150 s | A climbing wall with per-frog grip (the PEAK layer), or a tether/raft crossing (the Chained Together layer). |
| **Keeper / Warden** | 2 doors | ~90 s / ~180 s | Keeper: a mini-boss built from 2 rule monsters of this layer. Warden: a 3-phase boss. Phase 1 replays earlier monsters, which you now flatten. Phase 3 is the **Trust Fall**, a tongue-catch finale (GDD §6.13, simplified). |

**Special doors placed inside that mix:**
- **Gold door:** 5% per door slot, and at least 1 per Full Climb. If none has rolled by door 15, one is forced on floor 4. A 45–60 s treasure room ending in a jar that holds a pick of 3 **Legendary** Boons plus ×3 fireflies.
- **Rematch door:** exactly 1 per Full Climb, somewhere in doors 15–19.
  - It is a rule room you already beat earlier in this climb, or an earlier layer's room, **at its old numbers**.
  - The plaque shows your first clear time ("1:12"). You flatten it in about 20 s.
  - It is the in-run version of "steamroll old content" (§4.1).
- **Heart door (♥):** 1–2 per climb.
  - First climb: never before door 11.
  - Later climbs: from door 6.
  - Human-vs-human betrayal happens only in friend and private lobbies (§5).
- **Fork (a lettered choice where the party may split):** doors 7, 12 and 17. In the first climb, only 12 and 17.

**Average door: about 57 s.**

| Climb | Doors | Other time | Total |
|---|---|---|---|
| **Full Climb** | 20 doors ≈ 21 min | 3 Landings × 40 s = 2 min; door choice and walk-ins ≈ 1 min | **≈ 24 min** |
| **Quick Climb** | Doors 1–10 plus the Keeper ≈ 9.5 min | Hatch and intro 0.5 min; Landing 1 plus the Keeper landing ≈ 1 min | **≈ 11 min** |

### 3.3 Choosing doors, splitting up and meeting again

- **Breathers** are a single door that opens by itself.
- **Every other door is a pair**, for example **4A** and **4B**.
  - Each plaque shows exactly four things (§3.4).
  - The party chooses by walking. **4 s after the first human steps into a doorway, the door with more humans in front of it opens.** A tie goes to the door the first human reached.
  - Bots follow the humans. In solo, the human decides.
  - There is no Draft, no plates, no Stampede and no Latch.
- **Forks** (doors 7, 12 and 17) offer **two doors, and the party may split**, for example **12A** (group) and **12E** (1–2 frogs only, Rare-or-better Boon, gold-rimmed).
  - At most **2 rooms run at once.** Rooms are prefabs placed far apart in one scene, hidden per player with the netcode's visibility controls (UT; confirm in the proof of concept).
  - **Bots never enter a door without a human.** In solo, every bot follows you.
  - This is the user's "1A and 1E where players meet".
- **The Meeting Door.** The two halves meet again at a door with **two locks**. Each fork room drops one key, so each half carries a key the other half needs.
  - **The group that finishes first** waits in a toy room: lily-pad sumo, Frog Stack, and a window into the other room.
  - Through that window they can **pass one item**, such as a jar, a key or a spit firefly.
  - **After 45 s of waiting, a rescue rope drops.** The waiting group can tongue-haul the other group's frogs through the window.
    - A room finished this way counts as **cleared with help**. That group **keeps its Boon pick** and loses only the hidden-clear bonus.
    - Nobody is punished for drawing the harder room, and waiting becomes co-op play.
    - This replaces *party*'s "door collapses and you lose your pick".

### 3.4 Door plaques: what do I get, and how scary is it?

A plaque shows these four things, and nothing else:
1. **A big number and letter**: `12E`.
2. **Suit (room type, and the Boon family it offers):**

   | Suit | Room type | Boon family |
   |---|---|---|
   | ♠ A | Body | Body |
   | ♦ B | Mind | Sight |
   | ♣ C | Together | Chorus |
   | ♥ Heart | Betrayal (was D) | Risk |
   | E | Enigma, solo or duo | any family, Rare or better |

   This is Alice in Borderland's suit grammar (RR).
3. **Prize icon:** Boon, jar, gold, key or window.
4. **Skulls, 1 to 3.** E doors add a **SOLO** or **DUO** tag.

Plaques never show payout formulas, capacity dots, Omens or Notes (RR; CRIT #10).

### 3.5 Timing targets

**First climb, from pressing Play.** The shot-by-shot version is in §6.1.

| Moment | Target | What it is |
|---|---|---|
| In control | **≤ 0:05** | The menu *is* the well bottom. You are a tadpole in the water. |
| First reward | **0:20** | You gulp a firefly cloud: `[ GLOW 1 → 2 ]`. Your belly lights and one firefly orbits you. |
| **First laugh** | **≤ 0:30** | You cause it. Kestrel shouts "Watch this!" on a wobbly lily pad, you tongue him off, he belly-flops and says "That was on purpose." (In public lobbies the prompt targets a pot stack that topples onto Kestrel.) |
| First rule monster | ~1:00 | Door 2, the bell-golem. `[ CLEAR ] Ring 3 bells. When its eyes glow, freeze.` Plain text, and the tell lights itself. |
| **First power spike** | **~2:00** | Clearing door 2 grants **Shatter Croak** automatically: one croak shatters every pot in the room, and fireflies shower down. `[ BOON ] Shatter Croak. Because: you froze while it looked.` |
| First door choice | ~2:10 | 3A or 3B: two picture doors. |
| First team-up | ~2:20 | Door 3C: a lily-pad raft that tips when the weight is uneven. |
| First glimpse of scale | ~4:00 | A window breather: the well is far bigger than you thought, and the Mouth is a coin of sky. |
| First Awakening | ~6:30 | One of your verbs evolves (§4.1). |
| **First choice screen** | **~10:00** | At the Keeper: `[ CHOICE UNLOCKED ] The Tower will let you choose now.` Before this, every clear *grants* a Boon with no screen (RR line 91). |
| Keeper, rank-up, look up | 9:30–11:00 | Keeper fight, Party Rank Up, first Tower Rank (F → E), a camera pull-back you steer up the shaft, a free hat. You can stop here with everything banked. |
| First betrayal option | ~12:00 (door 11+) | The first Heart door. The Knot and the Cut unlock with it. |
| First secret quest | door 11 | `[ HIDDEN CONDITION DETECTED ]`, visible only to you (§4.2). |
| **Out of the Well** | **~24:00** | The Warden, then the reveal, then the results ceremony. |

**From the second climb on:**
- The pick-1-of-3 starts at door 2.
- Heart doors start at door 6.
- Forks happen at 7, 12 and 17.
- Secret quests start at door 6.

**Cadence contract** (telemetry targets, not facts):
- something ticks every **10–30 s** (a gulp, a pop, a coin);
- a door clears every **~1 min**;
- a Boon every **~2 min**;
- a Glow level every **2–3 doors**;
- a Landing or rank moment every **~5 min**;
- a scale reveal every **~24 min**.
- **Time outside rooms is capped at 12%** of a climb. Today it is 20–55%.

### 3.6 Session options

| Mode | Length | Ends on | Notes |
|---|---|---|---|
| **Quick Climb** (default for new players and public lobbies) | ~11 min | The Keeper pull-back and a curiosity teaser | Saves at the Keeper. Resume later as a Full Climb from door 11. |
| **Full Climb** | ~24 min | The Warden, the scale reveal and the results | Every Landing is a save-and-leave point. A player who leaves hands their seat to a bot. |
| **Resume** | — | — | Continues from the last Landing checkpoint. The host saves the seed plus a small JSON state (UT seed pattern). |
| **The Ascent** | 4 Full Climbs, ~1.7 h over several sessions | The Revelation | Well → Sky → Space → Beyond. The lobby can start any layer that some member has surfaced (§8). |
| **Landing Party** | Rounds of 2–3 min, drop in and out | — | A playlist of the toy doors and minigames on their own (CRIT #26). |
| **Daily Seed** | LATER | — | One shared seed per day, with a replay-validated leaderboard. **No streaks.** |

**Difficulty is chosen at the entrance**, as in The Tutorial Is Too Hard. Unlocks are per lobby: the host's unlocks, or the most advanced member's, cover everyone.

| Difficulty | Team Lives | Rules | Pays | Unlocked by |
|---|---|---|---|---|
| **Easy** | unlimited | The climb ends only when every human is dark at the same moment. Health 4 spots. | ×1 | always |
| **Normal** | 3 | Health 3 spots | ×1 | always |
| **Hard** | 2 | +1 skull everywhere; rule monsters' tells are 30% shorter | fireflies and Rank ×1.5 | anyone in the lobby clearing a Keeper |
| **Hell** | 1 | **Clear conditions are redacted: decode them yourself** (TTITH). Tells are 30% shorter. | ×2, plus a Hell border on your results card | anyone in the lobby clearing a Warden on Hard |

### 3.7 Getting hurt, dying and failing

- **Health.** Every frog has **3 glowing back spots**. It is the same for every frog, whatever their level, rank, class or cosmetics.
  - A hit knocks one spot out as a glowing firefly. **Any frog can tongue it back within 3 s, and it always returns to its owner.** A hit becomes a co-op catch and a laugh.
- **Dark.** At 0 spots you become a **tadpole ghost**.
  - You can nudge props of 5 kg or less every 10 s, ping and watch, like an Among Us ghost.
  - Any frog revives you by **holding Croak over your egg for 2 s**. You come back with 1 spot.
  - Every Landing revives everyone and restores all spots, for free.
- **Room failure.** A room fails when its hard timer runs out or when every frog inside is dark.
  - The Tower spits the party out through the next door, so the climb goes on.
  - The failed room pays **50% of its clear bonus**, gives **no Boon**, and costs **1 Team Life**.
- **E doors (solo or duo) never cost a Team Life.** Their entrants lose only that door's Boon and their unbanked fireflies. One glory-seeker can't spend the lobby's lives.
- **The climb ends when** the Team Lives reach 0 (Normal and harder), or when every human is dark at once (Easy).
  - **Either way, the results ceremony pays out** (§4.4).
- **Public lobbies:** 2 flags from other humans turn a griefer's seat into a bot at the next door.

### 3.8 Rule-room anatomy (every rule door, every time)

1. **The cue** arrives 2–5 s before the danger. It is self-lit and positional in audio. Examples: the golem's eyes glow, a heron's shadow crosses the floor.
2. **The rule** is written in plain text on your first visit: `[ CLEAR ] Ring 3 bells. When its eyes glow, freeze.`
   - On repeat visits, an opt-in **Sealed** version redacts it for +50% fireflies.
   - Hell always redacts.
   - This fixes CRIT #34.
3. **The punishment** is readable and funny, never a mystery.
4. **An obvious clear and a hidden clear.** The hidden clear is TTITH's "you cleared it in a weird way". It pays ×2 fireflies, a Bestiary stamp and Rank points.
5. **Two seeded Twists per room** (CRIT #11). The seed changes which bells, which exit, or which floor tiles are safe, so a known room stays fresh.
6. **Rank shortcuts** are authored against the verb thresholds in §4.1, so growth binds to clears:
   - at least one **rank-II** shortcut per room (a ledge at 2.3 m, an anchor at 4.5 m, a bell 6 m away);
   - at least one **rank-III or IV** lane that skips a phase or reaches the hidden clear.
7. **Mites** (moths, bell-beetles) to stomp, tongue or croak. They pop into fireflies, so power always has an outlet even though the rule monster can't be killed.
8. **One shared-fate gimmick:** a tether, a tipping raft, a two-frog door, a fragile jar that must be carried, or a curse where one frog's hop moves another's platform (RR).

### 3.9 Controls: 8 bindings, down from 22

| Verb | Keyboard/mouse | Gamepad | Does |
|---|---|---|---|
| Move | WASD | Left stick | Hop-waddle |
| Camera | Mouse | Right stick | — |
| **Hop** | Space | A | Tap for a hop; hold to charge |
| **Tongue** | Left mouse | RT | Tap to lash (grab, pull, lever, catch); hold to carry. **Tongue is also Interact.** |
| **Croak** | Right mouse | LT | Tap for a pulse; hold to sustain a note. Hold over an egg to revive. |
| **Shove** | F | B | Short push, the same impulse for everyone. **Hold 1.2 s while Knotted = Cut** (from door 11). |
| **Power** | E | RB | Your one active Boon. Hold = your class Signature. |
| **Wheel** | Q (hold) | LB (hold) | Ping, 8 quick lines and emotes |

Pause and Settings (Esc) are not counted. Every hold can be switched to a toggle in Settings.

---

## 4. Progression

There are three layers of growth, and each one is felt differently:
- **Body** (Glow Level and verb ranks) grows every 2–3 doors and resets each climb.
- **Build** (Boons) grows every ~2 minutes and resets each climb.
- **Legend** (Tower Rank, the Bestiary, Classes) is permanent and paid by every climb, even a failed one.

### 4.1 In-run power: visible, binding, and never clamped

**Fireflies are XP.** They are not a currency, and you can't spend them.
- **Where they come from:**
  - **70%** of a room's fireflies are its **clear bonus**, paid equally to every frog inside, ghosts included.
  - **30%** are **loose**: clouds, jars and popped mites that you gulp.
  - This split stops the strongest frog from snowballing.
- **Banking.** Fireflies you gulp ride in your cheeks and **bank when the door clears**. Banked fireflies are never lost.
- **Spills.** A hit spills 20% of your unbanked fireflies.
  - **Outside Heart doors, spilled fireflies always return to their owner**, whoever tongues them up.
  - **Inside Heart doors, the catcher keeps them.** That is the betrayal temptation, and it is announced.
- **No pickup-magnet or loot-rate bonus scales with level**, so growth never compounds into more growth.

**Firefly yield per door** (Normal difficulty; Hard ×1.5, Hell ×2). *d* is the door number within the climb.

| Door type | Clear bonus (each frog) | Loose (typical gulp) | Hidden clear |
|---|---|---|---|
| Breather | 8 + d | 4 | — |
| Rule door | 18 + 2d | 8 | ×2 total |
| Set piece | 25 + 2d | 10 | ×2 total |
| Keeper / Warden | 60 / 120 | 10 | — |
| Gold door | ×3 of a rule door | — | — |

Averaged over the door mix, a frog banks about **18 + 2d per door**. The hatch pond before door 1 gives **30**.

**Glow Level.** The maximum is **10 per climb**. The total banked fireflies needed for level *n* is **15·(n−1)(n+2)/2**:

| Level | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|
| Total banked | 30 | 75 | 135 | 210 | 300 | 405 | 525 | 660 | 810 |
| Reached at (Normal, typical) | pond, 0:20 | door 3 | door 5 | door 7 | **Keeper (10)** | door 13 | door 15 | door 18 | **Warden (20)** |

The cumulative yield is 30 + 18D + D(D+1) after D doors. It hits these thresholds every 2–3 doors all the way up, so the back half keeps its cadence. The *power* draft missed this: its Lv 8→9 step took 4–5 minutes.

**Every level changes something you can do, and you can see it.**
- **Each level-up gives +1 rank to one of your three verbs:** Hop, Tongue or Croak.
  - The verb that levels is **the one you used most since your last level-up**. No verb may get more than 1 rank ahead of your lowest.
  - There is no menu. The System names the verb and the reason: `[ TONGUE II ] 4.5 m. Grapple unlocked. Because: you grabbed 14 things.`
- **Rank III of each verb is its Awakening**: a new behaviour, a full fanfare and a visible body change.
- **Rank IV is its Mastery.**
- **Each level also shows on your body:** +1 orbiting firefly, a brighter belly, and markings that light up. The hitbox never changes.
- **At Lv 10 you get the Crown glow**, a firefly halo. That is the trailer shot, from dim froglet to blazing.

**Verb ranks.** Rooms are built against these exact numbers (§3.8 rank shortcuts).

| Verb | I (start) | II | **III: Awakening** | IV: Mastery |
|---|---|---|---|---|
| **Hop** | Apex 1.4 m; charged 1.9 m | Charged 2.4 m: reaches rank-II ledges at 2.3 m | **Air Hop**: a second hop in mid-air; you can hop off a falling platform | Charged 3.0 m; the landing stomp pops mites within 3 m |
| **Tongue** | 3 m; pulls props ≤ 20 kg, levers, keys | 4.5 m; **grapple**: anchors pull *you* | **Long Tongue**: 6 m; grab 2 things at once; snatch a monster's projectile and spit it back | 8 m; chain grapples with no touchdown (the Space layer's traversal verb) |
| **Croak** | Pulse 4 m: rings bells, stuns mites | 6 m; staggers small monsters for 1 s | **Big Voice**: rings 2 bells at once; the pulse knocks mites back | **Thunder Croak**, 9 m: shatters pots and mites in range, 2 s stagger on rule monsters (never a kill) |

**Boons: the build.**
- **When:** a private **pick 1 of 3** after every rule door, set piece, Heart door, fork room, Rematch door and the Keeper. That is **about 12 per Full Climb** (4 per run today).
  - In the **first climb**, doors 2–9 *grant* a Boon automatically, picked to suit your most-used verb, with no choice screen.
  - The first choice screen is the Keeper's `[ CHOICE UNLOCKED ]`.
- **The offer:** 2 cards from the door's suit family and 1 wildcard. There are **no filler cards**.
  - A card for a Boon you already own shows as **an upgrade: I → II → III**. Duplicates upgrade; they never roll rarity.
- **Picking:**
  - 8 s, simultaneous, visible only to you.
  - A timeout takes the System's highlighted card.
  - Nobody waits on a pick order.
- **Slots:** **4 passive + 1 active** (the Power button). When your slots are full, a new Boon asks which one to replace, and the replaced Boon shatters.
- **Seeding:** offers are seeded from a **host-only secret salt** + player id + door index, and sent only to their owner. A modded client can't compute anyone else's offers.

**Slice Boon pool (16 + 4 Duo + 4 Legendary).** Every Boon has an effect that works in any room, plus a stronger effect in its home suit (CRIT #25).

| Family (suit) | Boons |
|---|---|
| **Body** (♠ Body) | **Spring Legs**: a charged landing bounces you again; II leaves a 3 s bounce pad for friends. **Stomp**: landings pop mites in 2 m; III staggers small monsters. **Shatter Croak**: your croak shatters pots and mites in its radius (the first-climb gift at door 2). **Sticky Pads**: cling to walls for 2 s; II makes set-piece grip drain 30% slower. |
| **Sight** (♦ Mind) | **Tell-Sight**: monster cues arrive 1 s earlier; II also for your Knot partner; III for everyone within 8 m. **Third Eye**: see hidden-clear glyphs; II also shows the room's Twists. **Firefly Sense**: jars and clouds show through walls within 15 m. **Sure Tongue**: the tongue snaps to levers and keys; +1 m. |
| **Chorus** (♣ Together) | **Chorus**: 2+ frogs croaking within 0.3 s stagger a monster for 2 s. **Leapfrog**: hopping off a teammate's head launches you 3 m. **Lifeline**: tongue-catching a hit or falling frog heals them 1 spot (once per door; III revives from 4 m). **Shared Glow**: frogs within 6 m get +10% of what you bank, without it coming out of yours. |
| **Risk** (♥ Heart) | **Deep Cheeks**: a door cleared without a hit banks your loose fireflies ×1.25. **Bold Belly**: loose fireflies ×2 at clear, but a hit spills *all* of them. **Quick Tongue**: +20% grab speed; in Heart doors it can steal from 5 m. **Last Gulp**: once per door, a hit that would take your last spot takes your unbanked fireflies instead. |
| **Duo** (offered only while Knotted to a frog holding a Boon from the other family) | **Frog Sling** (Body + Chorus): tongue-grab your partner in mid-air and launch them 12 m. **Lookout** (Body + Sight): standing on your partner's head gives both of you Third Eye. **Duet** (Chorus + Sight): your synced croaks ring every bell in the room. **Double or Nothing** (Risk + any): if neither of you is hit, both of you bank ×1.5. **Cutting the Knot breaks the Duo until the next Landing.** |
| **Legendary** (gold doors only) | **Moon Hop**: triple hop, and the landing shockwave pops everything small. **Frog Choir**: a synced croak of 3+ frogs launches the whole team 4 m up. **Time Gulp**: swallow the room clock for +20 s, once per door. **Lucky Belly**: gold-door chance ×2 for the rest of the climb, and jars open one tier higher. |

*Power*'s "Gambler's Gut" is renamed **Bold Belly**. No Boon uses card, dice or chip imagery.

**Power always has an outlet.**
- **Mites** pop in every rule room.
- The **Rematch door** (§3.2): you flatten a room you struggled with, while its plaque shows your old time.
- **Warden phase 1** re-uses earlier monsters at their old numbers.
- **The clamp is deleted.** That means WORLD §9.4 `'clamp'` and the layer tier penalties in WORLD §3.1 and GDD §3.5. Difficulty comes from new rule types and deeper doors, never from nerfing you.
- If a Boon trivialises a room, the System says so: `[ NOTED ] That was not the intended solution. Keep it.` It pays a hidden-clear stamp.

**Comeback bonus.** The human with the lowest Glow Level sees **4 cards instead of 3** until they catch up.
- In friend lobbies the System names them: `[ UNDERDOG ] The Tower loves a comeback.`
- In public lobbies the bonus is private and unnamed.

**Party Rank Up.** At the Keeper and the Warden (not at every floor), the whole team gets a shared fanfare and **+1 reroll each**. This is RR's team-level cider.

**Drop-in.** A human who joins mid-climb takes a bot's seat at the next door. They start at the party's lowest human Glow Level, with that many Boons granted automatically.

### 4.2 Secret quests and classes: everyone is special in a different way

- **Secret quest, once per climb.** From door 11 in the first climb, and door 6 after that, every human privately gets **one** quest. It is drawn from the classes they haven't unlocked, so no two frogs in the lobby share one.
  - `[ HIDDEN CONDITION DETECTED ]`, shown only to you.
  - Bots get quests too, and their badge says so.
  - **Quest rules:**
    - the condition is self-contained: **no other player can control it**, so friends can't farm it for each other;
    - it **never costs a shared resource**, such as Team Lives;
    - it is seeded with the host-only salt.
- **When you complete it:**
  - **During the climb:** your class Signature unlocks at once, on the Power button's hold, for the rest of this climb. That is the "who was secretly special" reversal. A **banner**, not a full-screen card, tells the lobby: `Pip's frog changed: ECHO TOAD`.
  - **Rarity line:** the real Steam global unlock percentage once data exists. Until then, or on LAN, it says "first in this lobby" or "3rd unlock on this save". **Never an invented number.**
  - **Permanently:** the class becomes a selectable starting form, with its body markings.
- **Classes are sidegrades.** Each has a different Signature (15–30 s cooldown). None changes health, speed, hitbox or shove. Anything a Signature does to another player is capped exactly like the tongue tug (§5.4).

| Class | Unlock | Signature |
|---|---|---|
| Tree Frog | open | **Glide Leap**: a 1.5 s glide after any hop |
| Bullfrog | open | **Belly Boom**: an 8 m croak that knocks mites and props back (monsters only stagger) |
| Dart Frog | open | **Dart Tongue**: one 10 m lash |
| Mime Frog | clear a Mind door without croaking | **Decoy**: leaves a croaking copy for 5 s |
| Echo Toad | ring 3 bells with one croak | **Replay**: your next croak repeats 2 s later where you stood |
| Horned Frog | be swallowed by a monster and escape with all your spots | **Spit Out**: survive one swallow per door and launch out |
| Glass Frog | clear 3 rule doors in a row without being hit | **See-Through**: 3 s of walls going transparent within 10 m |
| Lily Walker | clear a room without touching its floor | **Pad Drop**: place a 4 s lily pad in mid-air |
| Bell-Eater | spit 3 monster projectiles back in one climb | **Swallow**: hold one projectile and fire it when you choose |

### 4.3 Meta progression you can feel: three tracks, deterministic

This follows ARISE's "everything needs leveling" warning and ToG: New World's scarcity complaints (RR): three tracks, no random unlocks, and randomness only inside a run.

**Track 1: Tower Rank, F → SSS. This is the headline.**

Rank Points (RP) per climb, **paid on failure too**:

| Source | RP |
|---|---|
| Each door reached | +2 |
| Keeper cleared | +10 |
| Warden cleared | +25 |
| Each hidden clear | +5 |
| Each **new** Bestiary page (first time only) | +5 |
| Class unlocked | +10 |
| Difficulty | Hard ×1.5, Hell ×2 |
| **Well-Rested** (§8) | ×2 for up to 2 climbs |

| Rank | Total RP | ≈ climbs | Also needs | Unlocks talent |
|---|---|---|---|---|
| F | 0 | — | — | — |
| **E** | 20 | 1 (the first Keeper) | — | **+1 Boon reroll** per climb |
| **D** | 100 | 2–3 | — | **Start with a Common Boon** of your choice |
| **C** | 250 | ~5 | — | **See one door ahead**: plaques preview the next pair's prizes |
| **B** | 500 | ~9 | — | **Gold-door chance** 5% → 7% |
| **A** | 900 | ~16 | — | **First-visit hint** line for hidden clears |
| **S** | 1,400 | ~24 | **Surfaced the Well** (S means you climbed out) | **One free Landing-stall item** per climb |
| **SS** | 2,200 | ~37 | Surfaced the Sky | **Carry one Boon** into your next climb's door 1 |
| **SSS** | 3,300 | ~55 | Surfaced Space | Rematch doors appear twice per climb, plus the earned-only **Moon Crown** cosmetic |

Typical RP:

| Climb | RP |
|---|---|
| First climb that wipes at door 8 | 16 + 3 new pages × 5 = **31**, so rank E |
| First Quick Climb to the Keeper | 20 + 10 + 4 pages × 5 = **50** |
| Full Climb cleared | 40 + 10 + 25 + 2 hidden × 5 + 3 pages × 5 = **100** |

That averages about 60 per climb once new pages dry up.

**Talents** are the Hades Mirror, cut down.
- There are 8 talents, one per rank, granted automatically and each switchable off.
- They are **PvE conveniences only**, worth about one room of head start in total.
- **No talent ever touches health spots, speed, hitbox, shove, tug strength, or anything that reaches another player.**
- **Rank Sync** switches all talents off for everyone. It is on by default in public lobbies, and a host option elsewhere.
- **Rank never gates a mode.** Difficulty unlocks are per lobby (§3.6).

**Head start (endowed progress), done honestly.** The Rank bar is drawn with the doors you've already passed stamped in. The E bar is short (20 RP), so the very first session fills it through real play. There is no gifted pre-fill: Nunes & Drèze's effect depends on the head start reading as real progress (immersion fact-check, conclusion 1).

**Track 2: the Bestiary.** This replaces the Codex that spoiled rooms.
- One page per monster, with 4 stamps: **Seen**, **Survived**, **Cleared** and **Hidden clear**.
- **Dying to a monster the first time fills its page**, as a warm tip that highlights the rule line you missed. This is what Regression Scars become (DOORS' Guiding Light pattern).
- A "Hidden clear: ???" line gives you the next thing to chase.
- **Every 4 completed pages unlock a hat.**
- The Well has about 24 pages when complete; the slice has 12.

**Track 3: Classes.** §4.2: 3 open, 6 secret in the slice.

**Earned cosmetics use Pearls, the only meta currency.**
- A climb pays: Wish Coins held at the end ÷ 2, + 10 per floor reached, + 20 per new Bestiary page. That is **about 80–160 per Full Climb** and 40–80 per Quick Climb.
- Pearls buy **cosmetics only**.

| Tier | Price | ≈ Full Climbs |
|---|---|---|
| Common | 150 | 1–2 |
| Rare | 400 | ~4 |
| Epic | 900 | ~8 |
| Legendary | 2,000 | ~18 |

Today a Gilded item takes about 29 runs (GDD §11.5).

**Currency budget: two.** Wish Coins in a run, Pearls between runs. Fireflies are XP, not money.

### 4.4 Every climb pays, even on failure

**Results ceremony order, win or lose.** It runs about 20 s and is skippable after the first time.
1. **The door counter slams down:** `DOOR 14 · BEST 17`.
2. **Wish Coins count up into Pearls**, at rising pitch.
3. **Bestiary stamps** land one at a time.
4. **Class and secret-quest progress.**
5. **Titles.** Cosmetic callouts only; they pay nothing. There is **no award for counting betrayals** (RR: payouts key on the room's own rules, never on raw betrayal counts).
6. **The Tower Rank bar comes last**, because it is usually the one closest to full (goal gradient; Kivetz et al.). A near-miss line such as `Rank C: 92%` is allowed **only on a bar that fills deterministically**, never on a random outcome.
7. **Two buttons of equal weight: "Climb again" and "Rest".** Nothing starts by itself.
8. **A curiosity teaser** that the next launch shows first: `Something is waiting in 12E.` It never uses a real friend's name to pull you back.

**What each outcome keeps:**

| Outcome | Keeps |
|---|---|
| Wiped at door 8, first climb | ~31 RP (rank E), 3 Bestiary pages with death tips, ~40 Pearls, a new "best door" |
| Quit at a Landing | Everything banked up to that Landing, plus a Resume point |
| Keeper cleared (Quick Climb) | ~50 RP, Party Rank Up, a free hat (first time), the pull-back reveal of the Mouth, ~70 Pearls |
| Warden cleared | ~100 RP, the scale reveal, surfacing (and with it the next layer for the whole lobby), ~140 Pearls |
| Failed, but a secret quest done | The class is unlocked permanently |

**Death rewards are first-time-only** (Bestiary pages, class unlocks), so dying on purpose earns nothing (kr_tower_deathgame fact-check D3).

### 4.5 One Full Climb at a glance

Second climb, Normal difficulty, 2 friends + 5 bots:

| Door | Clock | Type | Banked (each) | Glow | Verbs H/T/C | Boons | Moment |
|---|---|---|---|---|---|---|---|
| pond | 0:20 | — | 30 | 2 | I/II/I | 0 | `[ TONGUE II ]` grapple |
| 2 | 1:50 | rule 2A | 72 | 2 | I/II/I | 1 | First pick |
| 3 | 2:50 | set piece 3C (raft) | 96 | 3 | II/II/I | 2 | Hop II ledge shortcut |
| 5 | 4:40 | rule 5B | 150 | 4 | II/II/II | 3 | Landing 1: shop, jar lineup |
| 7 | 6:40 | **Fork** 7A / 7E | 212 | 5 | II/III/II | 4 | **Awakening: Long Tongue**; meeting and key swap |
| 9 | 8:50 | rule, **gold door** | 282 | 5 | — | 5 | Legendary pick (Moon Hop) |
| 10 | 10:10 | **Keeper** | 320 | 6 | III/III/II | 6 | **Awakening: Air Hop**; Party Rank Up; save point |
| 11 | 12:00 | ♥ Heart | 360 | 6 | — | 7 (upgrade) | First Cut chance; Vengeance |
| 12 | 13:10 | **Fork** 12A / 12E | 402 | 6 | — | 8 | Secret quest done: Echo Toad banner |
| 13 | 13:40 | breather | 446 | 7 | III/III/III | 8 | **Awakening: Big Voice** |
| 15 | 16:00 | set piece (climbing wall) | 540 | 8 | III/IV/III | 10 | Tongue Mastery (8 m); Landing 3 |
| 17 | 18:30 | **Fork** 17A / 17C | 642 | 8 | — | 11 | Duo: Frog Sling |
| 18 | 19:20 | **Rematch** | 696 | 9 | IV/IV/III | 12 (slots full: upgrades) | Flatten 2A in 18 s: `[ OLD TIME 1:12 → 0:18 ]` |
| 20 | 23:40 | **Warden** | 810 | 10 | IV/IV/IV | 12 | Crown glow; Out of the Well |

Doors not shown: breathers 1, 4, 6, 8, 16 and 19, and rule door 14 (pick 9). Over the climb that is **12 Boon picks, 9 levels, 3 Awakenings, 3 Masteries, 1 Legendary, 1 Duo, 1 class unlock and 1 Rematch flatten**, against 4 trait picks in the GDD run.

---

## 5. Social and party design

### 5.1 Comedy: coupling, visible blame, cheap failure

The hits get their laughs from three things at once (RR; games_coop_social §1):
- **my mistake hurts you** (coupling);
- **everyone saw who did it** (visible blame);
- **it didn't cost much** (cheap failure).

This is a pattern read from successful games only, so every comedy beat below is a playtest target.

**Built-in gags** (each must read without sound, as R.E.P.O.'s slapstick does):
- tonguing the wrong frog off a lily pad;
- catching a friend's knocked-out spot in mid-air;
- a raft that tips when the fat frog jumps on;
- two frogs tongue-tied at a Knot, forced to hop in step;
- **Frog Sling** launches that miss;
- a Chorus that gives off one sad croak;
- being swallowed by the golem and spat into the pond;
- Frog Stack towers;
- lily-pad sumo.

**Linked bodies in every room.** Every room has one shared-fate gimmick (§3.8). The two set pieces per climb carry the Chained Together and PEAK physicality:
- a tether crossing, where the frogs are tongue-tied in pairs;
- a climbing wall where each frog has its own grip ring. Stamina is per frog, as in PEAK, not shared. Friends haul each other up with the tongue.

**Visible blame.**
- A short tag appears on every fall and every failed door: "Yanked by Vex", "Sank the raft: Pip".
- Tags are **friend and private lobbies only**, phrased as jokes, never added up into a results stat, and can be switched off in Settings.

**Replays.**
- The in-game **Betrayal Cam** (0.8 s, 25% speed) and a 3 s fall replay are rebuilt from the host's state. Each client re-simulates its own local ragdoll layer, so the replay is only ever seen inside the game.
- **Sharing a clip** uses Steam Game Recording timeline markers placed at betrayals, Awakenings, class unlocks and gold doors. *Tech check: confirm that the Facepunch.Steamworks wrapper exposes timeline markers.*
- If it doesn't, the fallback is a local rolling video buffer. That is LATER, because Unity has no built-in runtime video encoder.

**Voice.**
- Proximity voice is **LATER, friends-only and opt-in**.
- It needs a middleware decision the tech report doesn't make (Steam voice through Facepunch, or a Vivox/Dissonance-class plugin), and it changes the IARC rating.
- Until then: pings, 8 quick lines and emotes. Friends use Discord anyway.

**Minigames that actually get played** (CRIT #26):
- **toy doors**, 30 s breathers in the climb that pay a jar;
- the **Meeting-room** toys you use while waiting for the other half of a fork;
- the **Landing toy**;
- the standalone **Landing Party** mode.

Slice set: **lily-pad sumo**, **Frog Stack** (the TEAMBOUND Babel homage), **Jar Tag** (the Snuff Tag rules) and **Fly Catch**. The lying minigames (Pinky Promise, Rumour Dice) are cut.

### 5.2 Betrayal made hilarious

**Everyday mischief is always on, and it costs nobody anything:**
- shoves;
- tongue tugs of at most 1 m, never toward a drop outside Heart doors;
- croak-scaring a bot.

Mischief never moves value, because outside Heart doors spilled fireflies return to their owner.

**Real betrayal lives only in Heart doors (♥).**
- The door's plaque and rule announce it, the way Liar's Bar makes lying the rule.
- Every Heart door has a **clever co-op clear that pays everyone well**. This is the ORV lesson: the cruel rule has a non-lethal answer (RR).
- So betrayal is a *choice with a visible cost*, never the only way through.

| Heart door | Rule on the plaque | The temptation | The co-op answer | Source template |
|---|---|---|---|---|
| **Two Pads, Three Frogs** | "Only two may leave by the pads." | Shove a friend off a pad | Stack three frogs on one pad; the rule says "pads", not "frogs" | TTITH-style literal reading |
| **Split or Swallow** | Pairs choose in secret: share the jar, or swallow it | Swallow = take it all | Both share, and the Tower adds a bonus; a double swallow gets a clown honk | Pinky Promise as a room |
| **Tongue-Tied Bridge** | Pairs cross tied together; the bridge sinks under two | Cut the tether and run | Sling your partner across with the tongue | Chained Together; TTITH floor 61 |
| **Doppelfrog** | "One of you is not a frog." One public vote at the exit | The Mimic steals unbanked fireflies from anyone it tags | Watch for the Mimic's tell (it blinks sideways) and vote it out | Among Us / Mafia; TTITH floor 16 |

- **Doppelfrog** needs at least 5 voters and at least 3 humans (Liar Game's Minority Rule breaks down with fewer). Bots fill the remaining seats.
  - **Bots vote only on evidence everyone could see**, never on hidden information.
  - Their votes are marked as bot votes.
  - With fewer than 3 humans the room is replaced by a vote-free Heart door.
- **LATER lobby mode, "Mimic Climb":** a single hidden Mimic for a whole climb, for private lobbies of 4+ humans. This is the full Among Us wish, kept out of the core loop until the core is proven fun.

**The one betrayal verb: Knot and Cut.**
- **Knot.** From door 11 in the first climb. At a Landing, two frogs face each other and both pick "Knot?" on the Wheel.
  - Knotted frogs see each other through walls, revive each other twice as fast, and unlock **Duo Boons**.
  - Anyone can Knot anyone, and nothing depends on standing close, so premade voice groups get no edge.
- **Cut.** Hold Shove for **1.2 s** while Knotted.
  - The tell: a crimson thread flash, a rising "shhhk", and the cutter's cheeks puff.
  - **Holding on** (hold Tongue on the thread before the channel ends) stops it, stuns the cutter for 1 s, and puts Cut on cooldown.
  - **Outside a Heart door** a Cut just ends the Knot and its Duo. It is a comic breakup with the Cam.
  - **Inside a Heart door** it also takes the partner's *unbanked* fireflies, or frees you on the bridge.
- **The reveal.** At the room exit the **Betrayal Cam** plays in slow motion with a `[ TRAITOR ]` stinger. The betrayer wears a cartoon **WANTED poster** until the next door. This is framing, not shame: the Among Us "Vigilante" lesson. It replaces *party*'s snake mark.
- **Revenge: the Vengeance quest.** The victim stays in play (as a ghost if they went dark) and gets `[ VENGEANCE ] Tongue-tag the traitor in the next room.`
  - Success returns exactly what was taken, slimes the betrayer (cosmetic goo), and gives the victim **+1 card on their next pick**, once per climb.
  - There is no bonus loot, so friends can't farm fake betrayals.
  - Frustration (*goguma*) is paid off within one room (*saida*).
- **Betrayal never touches** banked fireflies, Glow Level, Boons, Rank, Pearls or cosmetics.

**Lobby types**

| Feature | Solo | Friends / private | Public (strangers) |
|---|---|---|---|
| Human-vs-human Heart doors | — (bots betray you) | On (host toggle) | **Off: bots do the betraying** |
| Blame tags, named Underdog | On | On (toggle) | Off / private |
| Tug near ledges | Bots only | On, ledge-guarded | Ledge-guarded |
| Rank Sync (talents off) | Off | Host option | **On by default** |
| Masked Bots | — | Opt-in; revealed on the results screen | **Never: bot badge always shown** |
| Voice (LATER) | — | Opt-in | Off |
| Kick to bot | — | Host | 2 human flags |

### 5.3 Bots: the Rivals as doubting onlookers

- **Keep the GDD's 10 Rivals, redrawn as frogs:** Moss, Vex, Pell, Lumen, Brother Brass, Kestrel, Maud, Pip, Ines and Gutter (GDD §8.2). Keep their archetypes and signature lines.
  - They are host-owned NetworkObjects running the player code path (UT). That is also the automated QA.
- **Rules:**
  - Bots perceive like players.
  - They have human reaction times.
  - **They never betray without the full tell**, and never outside Heart doors.
  - They draw from the same Boon tables.
  - They carry a badge (§5.2).
- **The onlooker chorus.** Bots bark about *your* growth. The growth fantasy needs witnesses (RR: bots as the sneering, gasping crowd).
  - At F rank: "An F-rank? Adorable."
  - At an Awakening: "Since when does your tongue do *that*?"
  - When a 3-skull door is cleared: "An F-rank cleared a three-skull door?!"
  - At a class unlock: "Wait. Pip was an *Echo Toad* this whole time?"
- **Drama Director targets per climb** (GDD §8.7, retuned):
  - a bot rescues a human by door 6;
  - at least one funny bot failure every 5 doors;
  - the first Heart door a human sees contains a visible bot betrayal;
  - at least one Knot is offered to the human.
  - **Limits:** at most 1 bot betrayal against the human per floor, none when the human is on 1 spot during floors 1–2 (the mercy rule), it never skips a tell, and it never forces a failure.
- **Rookie Rivals.**
  - For a player's first 5 climbs, bots are labelled **Rookie**: slower to react to cues and more slapstick.
  - They fade out gradually by climb 10, and the label is always shown.
  - This replaces "tuned to lose like Fall Guys", which is an **unverified rumour** (games_coop_social fact-check #14).
- **Rival memory** (the GDD's Rival Register) gives hub callbacks: "Last time you left me on the bridge." Bots also unlock secret-quest classes at half the human rate, and their badge shows it.
- **Evidence caveat.** No hit in the research gets its comedy from bots, and "bots betray, so strangers can't" is untested. Both are §9.3 test items.

### 5.4 The fairness contract (law)

1. **Hitbox, base speed, shove impulse (6 m/s) and health spots are identical for everyone**, whatever their level, rank, class or cosmetics.
2. **Any effect that reaches another player has a fixed ceiling that nothing raises.**
   - Tongue tug: at most 1 m, never toward a drop edge (a nav-edge check) outside Heart doors.
   - A full yank happens only inside Heart doors or on your Knot partner, after a **0.6 s** tell.
   - Signatures follow the same caps.
3. **Betrayal moves only unbanked room loot.**
4. **Talents are PvE-only and small.** Rank Sync is on by default in public lobbies. Rank never gates a mode.
5. **Hidden information goes only to its owner.** Offers and quests are seeded with a host-only salt that is never replicated. The host checks every pick.
6. **The host gets no latency edge.**
   - Tongue hits are resolved with lag compensation: targets are rewound by the lasher's RTT/2, capped at 150 ms.
   - When two frogs grab the same thing, the earliest input timestamp wins, and the host's own inputs are delayed by the median client one-way latency.
7. **Betrayal actions are server-authoritative from day one.** Dread Hunger and Deceit died of cheating and DDoS, not of their design (RR).
8. **Bots use the same tables and the same caps.**

---

## 6. Immersion and attraction

### 6.1 The first 10 minutes, shot by shot

This is the first climb: solo with bots, or friends with bots filling seats. **New systems before the Keeper: 5.**
1. the three verbs;
2. rule doors;
3. growth (fireflies, Glow and granted Boons);
4. the team gimmick;
5. picture-door choice.

The Keeper then *pays out*: Rank, the hat and choice. RR warned against an earlier plan that brought in about 7 systems in 10 minutes.

| Time | Shot / camera | Player does | Player feels or learns | New |
|---|---|---|---|---|
| 0:00 | Title screen = the well bottom. Low angle across black water up to **the Mouth**, a small coin of sky 180 m up. Eight eggs bob. Kalimba drips. | Presses any key | "I'm tiny. That's the sky." | — |
| 0:03 | Close on your egg. It wobbles and **hatches** in 3 s: tadpole, then *pop*, a froglet on a lily pad. `[ HATCHED ] Level 1. Everything is bigger than you.` | — | Growth is the language of this game | — |
| 0:06 | Third-person, 3/4. Prompt: **Hop**. | Hops pad to pad | Bouncy, responsive, squash and stretch | Verbs (1/5) |
| 0:15 | A firefly cloud drifts over the water. Prompt: **Tongue**. | Lashes, gulps | Belly lights up, pitch rises, one firefly orbits. `[ GLOW 1 → 2 ]` then `[ TONGUE II ] 4.5 m. Grapple.` | Growth (2/5) |
| 0:25 | Kestrel on a wobbly pad: "Watch this!" Prompt: **Tongue Kestrel**. | Yanks him | He belly-flops. "That was on purpose." **First laugh**, caused by the player. | — |
| 0:35 | A giant door stamped **1**. It needs two frogs to shove. Moss comes to help. | Shoves with Moss | Teamwork is physical. The door counter slams on screen: `DOOR 1`. | — |
| 0:40 | Breather: a warm jar room with mites. | Stomps mites, pops the jar | Power has an outlet | — |
| 1:00 | **Door 2**, dark. The bell-golem's eyes glow: the self-lit cue. `[ CLEAR ] Ring 3 bells. When its eyes glow, freeze.` | Rings, freezes, gets hit once | The hit knocks a spot out, **Moss tongues it back** to you: "Got it!" | Rule doors (3/5) |
| 2:00 | Clear. Slow push-in. `[ BOON ] Shatter Croak. Because: you froze while it looked.` | Croaks | **Every pot in the room shatters**, fireflies shower down. First power spike. | — |
| 2:10 | Two picture doors: **3A** (♠, jar, 1 skull) and **3C** (♣, Boon, 2 skulls). | Walks to 3C; the bots follow | "I chose the prize and the risk" | Door choice (4/5) |
| 2:20 | **3C, the raft.** A lily-pad raft on black water tips when the weight is uneven. | Balances with 3 bots; Kestrel jumps the wrong way | Shared fate; a laugh | Team gimmick (5/5) |
| 3:40 | Clear. `[ GLOW 2 → 3 ] [ HOP II ]` | — | Stronger again | — |
| 4:00 | **Window breather.** A crack in the well wall: far below, other stone strands and hundreds of lantern lights. The Mouth is still a coin. | Looks around, steering the camera | "This place is huge" | — |
| 4:40 | Door 5 clears, then **Landing 1** (40 s): warm lanterns, the Frog Stack toy, the jar lineup opens (Bronze → Silver). | Plays, or opens jars | A rest and a waltz | — |
| 6:40 | Door 7 clears: `[ TONGUE III: AWAKENING ] Long Tongue.` A full fanfare; your tongue glows and the bots gasp: "Since when does your tongue do *that*?" | Snatches a golem bell from 6 m | Your body changed | — |
| 8:50 | Door 9 is a gold door (a 5% roll): treasure room, a jar, fireflies ×3 | Gulps | A jackpot | — |
| 9:30 | **The Keeper**: two earlier monsters combined. The party wins using everything learned. | Fights | Mastery | — |
| 10:10 | Results mini-ceremony, then **`[ CHOICE UNLOCKED ]`**, the first pick-1-of-3, then `[ PARTY RANK UP ]`, then the **Tower Rank bar fills F → E**, bots cheering. | Picks a Boon | "I earned this" | Rank (payout) |
| 10:40 | **The player steers the camera up the shaft** to the Mouth, now visibly wider (31° → 44°). A Wish Coin rains down through it. A **free hat** appears at the Landing stall. `Floor 3: doors 11–15. Something is waiting in 12E.` Buttons: **Climb on** / **Rest**. | Chooses | Curiosity, a clean stop | — |

### 6.2 Presentation priorities, in order

1. **Responsive controls and juice before fidelity.** SDT links presence to intuitive controls, and "Juice It or Lose It" is the evidence.
   - A 120 ms coyote time and a 100 ms jump buffer.
   - 50–120 ms hitstop on pops and hits.
   - Squash and stretch on every hop.
   - Count-ups at rising pitch.
   - Cinemachine 3 Impulse shake.
   - All of it built as a roughly 200-line in-house feedback system on PrimeTween (UT).
2. **Frog readability and expressiveness.**
   - Procedural hop IK, eyes that blink and retract, a spring-bone throat sac, and a spline tongue with overshoot.
   - A toon ramp with a per-player **rim colour** (UT's agent-owned HLSL toon shader, plus an outline pass as a Render Graph feature).
3. **Self-lit tells in dark rooms, and warm breathers.**
   - Every tell, frog, plaque and pickup is emissive "glow chalk" (CRIT #28).
   - Colours are pushed and tested at real camera distance, as Fall Guys did (RR).
   - A sabotage "lights out" state can blend between baked APV lighting scenarios instead of switching on realtime lights (UT).
4. **Status windows that speak growth.** Every gain gets a one-line System window naming the change and its cause. Never a full stat sheet (Dr. O via RR). The System voice turns from bureaucratic examiner into a dry announcer that roasts and hypes.
5. **A sense of place and scale.**
   - The Mouth is visible from every Landing and grows every floor: **31° / 37° / 44° / 56° / 74°** (WORLD §4.3, renamed from "the Coin").
   - Wish Coins rain through it.
   - **Your croak echoes in the well and goes silent at the rim.**
   - Each layer has its own palette: moss and lanterns (Well), pastel (Sky), violet and neon (Space).
6. **Audio as a readability channel.**
   - Positional monster cues.
   - Croak chords that harmonise, because the motif is pentatonic (WORLD §2).
   - Built on Unity AudioMixer and a code sound manager. FMOD only if adaptive music needs it.
7. **Hero VFX only where they sell the fantasy:** Awakenings, gold jars and the reveals.
   - Shuriken particles by default.
   - VFX Graph only for the reveal transitions. It is still preview for URP, so test it on Steam Deck early (UT).

### 6.3 Scale-reveal moments (every reveal also opens a new verb)

| When | Moment | Player's role | Opens |
|---|---|---|---|
| ~Door 4 of every climb | **Window breather**: a crack shows the size of the world | Free look | — |
| Every Landing | Look up: the Mouth has grown | Free look | — |
| **Keeper (~10 min)** | **Steered pull-back** up the shaft to the Mouth; a Wish Coin falls | **Player-steered** (the 2012 study: agency raised presence more than camera angle did) | Choice screens, Knot and Cut, Heart doors |
| **Warden (~24 min)** | **★1 Out of the Well.** WORLD §10.2's choreography: the lift, the lanterns revealed as watchers, the dolly-zoom, the 64-well mound, the painted sky. First view 26 s, repeats 8 s. **Free look from 21 s.** Ends on "Your sky was a hole." | Free look; skippable after the first view | **The Sky layer** for the whole lobby: **Glide** on by default; the frog molts into a **Tree Frog** (glide membranes) |
| Sky Warden | ★2 The Painted Sky (LATER) | Same | **Space:** Drift physics; the Tongue IV grapple becomes the core traversal; **Moon Toad** fishbowl helmet; Warden **Chan Chu**, the moon toad |
| Space Warden | ★3 The Speck and the Drop (LATER) | Same | **Beyond:** Light-Lag; you glimpse the giant frogs on the rim |
| After door 80 | ★4 **The Revelation**: the nearest giant on the rim of the bigger well is *a frog, like you*. "Every sky is someone's well." | Free look | Cycle 2 |

**Layer build rules.**
- Each new layer **re-hatches you at Level 1**: a new underdog arc.
- The new movement verb is **on by default**, which fixes WORLD §9.1's "default: none".
- The molt uses **add-on parts on one rig with shared attach points**, not four bodies. So every hat fits every form.
- **Unity note:** URP has no camera-relative rendering. Build each layer near the origin, use nested shells (skyboxes, shell meshes, fog gradients) and a floating origin where players travel far (UT).

**Wardens (boss per layer).**
- **Well: The Jar**, a house-sized firefly jar lowered onto the brightest frog. This is the Snuffer reborn.
- **Sky:** a thunderhead heron.
- **Space: Chan Chu**, the moon toad with a coin in its mouth.
- **Beyond:** the Watcher at the rim.

### 6.4 Capsule and trailer (after the hero gate passes)

- **Capsule.**
  - **One focal point:** a huge-eyed frog face with a glowing belly, mid-leap out of a dark stone well mouth toward a sliver of bright sky.
  - The title runs large across the bottom third.
  - Nothing else: no door, no planet. The refuter was right that the earlier spec stacked five subjects.
  - It must read at 120 × 45 px. For reference, 41% of top-seller capsules show a figure or creature, and about 7 in 10 read at 120 px (RR). That data is descriptive, so A/B test two capsules on the Steam page.
- **Trailer.**
  1. It opens on gameplay in frame 1: froglets plop into the water in a heap.
  2. A friend gets tongue-yanked off a raft.
  3. An Awakening lands.
  4. A Lv 10 frog pops a room of mites with Thunder Croak.
  5. The Betrayal Cam plays with `[ TRAITOR ]`.
  6. The steered pull-back into the Sky.
  7. A 2-second glimpse of Space.

  That shows three environments (Zukowski via RR). End on "Climb together. Fall alone."

---

## 7. KEEP / CUT / SIMPLIFY / ADD against the current design

Section numbers are GDD v1.0 unless marked WORLD.

**Verdicts:**
- **KEEP:** the idea survives largely intact.
- **CUT:** delete it; don't build it.
- **SIMPLIFY:** keep the intent in a smaller form.
- **REPLACE:** a new system takes the slot.
- **ADD:** new.

| Current design (section) | Verdict | New form |
|---|---|---|
| §0 Name KNOTSPIRE; tagline "Belay or betray"; six-bullet pitch | REPLACE | **KNOTWELL** (pending clearance); one-sentence fantasy; the tagline becomes "Climb together. Fall alone." (§2.1) |
| §1.1 Pillars: 1 Light is life, 3 Every door is a social decision, 5 Lit only by players | REPLACE | The new pillars in §2.2: growth, one rule, linked bodies, betrayal as punchline, solo as a full lobby |
| §1.1 Pillars: 2 Riddles with teeth, 4 Belay or betray, 6 Solo is a full lobby | KEEP (reworded) | "One monster, one rule, one weird way out"; "Betrayal is a punchline"; "Solo is a full lobby" |
| §1.3 Non-negotiables (fun before physics, readable rooms, the System never lies, betrayal visible, fair cosmetics, no pay-to-win) | KEEP + ADD | Add **fun before rules**, **every number true**, and **the fairness contract** (§5.4) |
| §2.1–2.2 Fiction and tone (bureaucratic examiner; Little Nightmares darkness) | SIMPLIFY | Frogs in nested wells. The Tower is a sarcastic announcer of your gains. Dark rule rooms with self-lit tells; warm breathers. |
| §2.3 The System voice | KEEP | Retuned to growth: deltas plus causes, roasts, hype |
| §2.4 No audience layer | KEEP (for now) | Watchers or sponsors tipping for hidden clears only: a capped prototype from layer 2 (LATER; RR rank 8; DX fact-check D rated it WEAK) |
| §3.1–3.2 A 36–45 min run of 5 floors | REPLACE | A **Climb of 20 numbered doors**: Quick ~11 min, Full ~24 min (§3.1) |
| §3.3 Floor flow: Intermission, Draft, Latch, reveal orbit, Exit Vestibule, the Tide | CUT | Walk to a door; 40 s Landings after doors 5, 10 and 15. **The Tide is deleted.** |
| §3.4 Letters A/B/C/D/E/X/♛ with capacity and reward rules | SIMPLIFY | Suits ♠A Body, ♦B Mind, ♣C Together, ♥ Heart, E Enigma (forks only). X alcove cut; the Crown becomes the Warden. |
| §3.5 Seeded generation | KEEP | One replicated seed builds identical rooms; agents add rooms as data (UT) |
| §3.5 P-based door counts, Omens, Echo tiers, ring order, tier scaling (−6% timer / +8% speed) | CUT | Difficulty chosen at the entrance (§3.6) plus skulls; 2 seeded Twists per room |
| §3.6 Door Draft (plates, Stampede, Latch, Hold the Door, Draft Cam) | CUT | Picture-door pairs chosen by walking (§3.3) |
| §3.7 Ghost Sim and takeover | CUT | Bots never enter a door without a human |
| §3.8 Grates, Side Doors, Visitors, Keyholes, the Reunion beat | CUT / REPLACE | **Forks + Meeting Door + key swap + rescue rope** (§3.3). The Reunion bark survives at the Meeting Door. |
| §3.9 Same systems in solo and multiplayer | KEEP | Bots are host-owned NetworkObjects on the player code path (UT) |
| §4.1 22 bindings | SIMPLIFY | **8** (§3.9) |
| §4.2 Movement numbers (5 m/s, 1.4 m apex, coyote 120 ms, buffer 100 ms) | KEEP | Becomes Hop rank I. Dive and Brace are cut; Grab becomes the Tongue. |
| §4.3 Flame verbs (Brighten, Dim, Drip, Relight, wax costs) | CUT | Croak (pulse and revive), Tongue (catch a spot back). **No verb costs health.** |
| §4.4 Knot, Cut, Cinch, pings | SIMPLIFY | Knot on the Wheel; Cut = hold Shove 1.2 s; Cinch = "hold on" with the Tongue |
| §4.5 Flame emotions and the Resolve tell | SIMPLIFY | Frog channels: eyes, sac rhythm, posture. The Resolve tell becomes cheek puff + crimson tongue tip + lean. |
| §5.1 Wax as HP; the body shrinks | CUT | **3 back spots**, identical for all; the body *grows* in glow |
| §5.2 Damage table, ambient burn, fall damage in wax | SIMPLIFY | Hits and falls cost 1 spot; no ambient burn |
| §5.3 Snuffed / Smoke / Burnt Out / Scorched (−25% max wax, no reward) | REPLACE | Dark → tadpole ghost → croak revive; failure pays 50% of the clear bonus and costs a Team Life (§3.7) |
| §5.4 Global timers (60 s warm-up, 45 s Intermission, 45 s Draft, 2:30 Tide) | CUT | Rooms 15–150 s; Landings 40 s; time outside rooms ≤ 12% |
| §5.5 Scoring awards incl. "Sharpest Knife" | SIMPLIFY | Cosmetic callouts only; **nothing counts betrayals** |
| §6.0 Redacted Decree, hint ladder, study levels | REPLACE | Plain text first; opt-in **Sealed** redaction for +50%; Hell always redacts; hidden clear + 2 Twists + rank shortcuts (§3.8) |
| §6.1 Golem Belfry | KEEP | Door 2 bell-golem, the first rule monster |
| §6.2 Whispering Library | SIMPLIFY | A Mind door with one cue and one rule (CRIT #17: "homework") |
| §6.3 Fuse Tether | KEEP (reskinned) | The **tongue-tied tether** set piece; Tongue-Tied Bridge Heart door |
| §6.4 / §6.8 Clockwork Foundry, Glitched Watcher (E rooms) | KEEP | E doors at forks; solo or duo |
| §6.5 Liar's Banquet | REPLACE | **Doppelfrog** (≥ 5 voters, ≥ 3 humans) |
| §6.6 Weighing Hall | REPLACE | **Two Pads, Three Frogs** |
| §6.7 Drip Chimney | REPLACE | **Climbing wall** set piece, per-frog grip (PEAK) |
| §6.9 Harmony Sentinel | KEEP | A Together (♣) door built on Chorus croaks |
| §6.10 Hall of Grievances | CUT | It depended on Soot and the Ledger (CRIT #15) |
| §6.11 Mimic's Toll; §6.12 Karmic Executioner | SIMPLIFY | Rule doors for later layers; no wax or Soot mechanics |
| §6.13 The Crown: Snuffer, 3 phases, Trust Fall, 2 endings | SIMPLIFY | **The Jar** Warden: phase 1 re-uses earlier monsters, phase 3 is the tongue-catch Trust Fall; one ending, and its reveal |
| §7.1 Ledger overlay and disclosure rules | SIMPLIFY | The results ceremony plus Betrayal Cam replays; no overlay |
| §7.2 Knots: Pact Pot, gold threads, 25% Ember theft | SIMPLIFY | Knot → Duo Boons; Cut steals only unbanked fireflies, only in Heart doors |
| §7.3 10 Knife types | CUT | One verb (Cut) plus announced Heart-door rules |
| §7.4 Soot, Notorious, Confession, Forgive | CUT | A **WANTED** poster for one door; **Vengeance** quest |
| §7.5 Trust and Grudges | SIMPLIFY | Bot-internal AI values only; no UI |
| §7.6 Tribunal | CUT | The only vote is Doppelfrog |
| §7.7 Notes; §7.8 Keyhole bets | CUT | — |
| §7.9 24 quick-chat lines, context phrases, Clue Composer | SIMPLIFY | 8 lines + pings + emotes; Clue Composer cut; proximity voice LATER (friends, opt-in) |
| §7.10 Betrayal settings Off / Physical / Full | SIMPLIFY | Lobby types: Public / Friends / Private / Solo (§5.2) |
| §8.1–8.2 Rival rules and roster | KEEP | Redrawn as frogs; the onlooker chorus |
| §8.3 Draft timing; §8.6 Ghost Sim | CUT | — |
| §8.4–8.5 In-room roles, Knife utility | SIMPLIFY | Roles kept; betrayal utility only inside Heart doors, always with the tell |
| §8.7 Drama Director | KEEP (retuned) | Targets in §5.3 |
| §8.8 Rival Register | KEEP | Hub callbacks |
| §9.1 "No permanent power" | CUT | Body / Build / Legend growth (§4) |
| §9.2 Shared Altar: pick order, filler cards | CUT | Private, simultaneous pick 1 of 3 with no filler; auto-grants in the first climb before the Keeper |
| §9.3 16 traits in 4 slots | REPLACE | **16 Boons in 4 families**, 4 passive + 1 active slot, duplicates upgrade I→III. Survivors: Last Light → Last Gulp; Echo Wick → Echo Toad class; Resonance → Chorus. |
| §9.4 Anvil fusions | REPLACE | 4 **Duo Boons** via the Knot |
| §9.5 Origins | REPLACE | **Classes** (3 open + 6 secret) |
| §9.6 8 keys and items | CUT | Jars, the Gold Key (stall item), Meeting keys |
| §9.7 21 Unique Titles | SIMPLIFY | Cosmetic titles that unlock prestige items; no Altar cards, no currency |
| §9.8 Codex (spoils rooms) | REPLACE | **Bestiary**: death fills it, hats every 4 pages |
| §9.9 Wick Level | REPLACE | **Tower Rank F → SSS** with talents |
| §10.1 Landing: 11 stations | SIMPLIFY | Stall, jar lineup, one toy, the Knot spot, the Mirror; revive and heal are automatic |
| §10.2 Minigames | SIMPLIFY | Jar Tag (from Snuff Tag) and Frog Stack (from Wax Stack) kept; Pinky Promise and Rumour Dice cut; **toy doors**, lily-pad sumo, Fly Catch and **Landing Party** mode added |
| §10.3 Old Tallow's Market (X alcove) | SIMPLIFY | The **Landing stall**: heal 20, reroll 25, Boon upgrade 60, Gold Key 80 (Wish Coins) |
| §11 Embers / Drips / Sparks; the six-term Drips formula | REPLACE | **Wish Coins** (run) and **Pearls** (meta); formulas stay off screen |
| §12.1 Cosmetic rules (no gameplay effect, luminance, overlays on top) | KEEP | Plus: no cosmetic hue within 15° of betrayal crimson |
| §12.2 10 candle slots | REPLACE | Ordered by how often others see them: **Hat, Skin, Glow colour, Croak voice, Tongue trail, Emote, Door-entrance effect, Betrayal Snap**. System Window theme and Tadpole ghost become earned-only (CRIT #27). |
| §12.3–12.4 Rarities and the 60-item catalogue | REMAP | Wax patterns become Skins (Honeycomb, Speckled Egg, Stained Glass, Night Sky, Porcelain); the Traffic Cone and Coiled Spring become Hats; the Candle-Toad line keeps the candle alive |
| §12.5 Earned-only prestige | KEEP | Moon Crown (SSS), Surfacing hats, the Bestiary hat set |
| §12.6 Daily-rotating shop, Tallow Bargain | CUT | The whole earned catalogue buyable any time; Featured is a spotlight; the Vault becomes a wishlist |
| §12.7 Wickbook season pass | CUT | No pass at launch (§8) |
| §13 Three.js art pipeline | REPLACE | Unity URP 17: HLSL toon ramp + rim, outline Render Graph feature, bloom/LUT/SSAO, APV (UT) |
| §13.5–13.6 Wick design and procedural animation | REPLACE | Procedural frog rig (§2.3), readability gate |
| §14 UI/UX | SIMPLIFY | Huge door counter, status windows, 3-spot HUD, results ceremony; accessibility options kept |
| §15 Web Audio procedural audio | REPLACE | Unity AudioMixer + code sound manager; CC0/CC BY audio logged in `licenses.csv` |
| §16 Node/ws multiplayer | REPLACE | NGO 2.x host mode + Facepunch Steam transport; **Unity Transport with LAN discovery as the second transport**; NGO-vs-FishNet proof of concept |
| §16.9 Clips and share card | SIMPLIFY | Steam recording markers; the share card (group shot + vista) is kept |
| §17 Scope, milestones | REPLACE | Slice list and proof gates (§9.3) |
| WORLD §1–2 Nested wells, five laws, layer table | KEEP | Laws 1–4 kept. "The Coin" renamed **the Mouth**. The frog is *you*, not a statue. |
| WORLD §3.1 Run = layer with tier +1 per layer | SIMPLIFY | Climb = layer; **no tier penalties** |
| WORLD §3.2 Surfacing, lobby start layer, Tourist Pass | KEEP | The lobby's best unlock applies to everyone |
| WORLD §3.3 Meta with no power | REPLACE | §4.3 |
| WORLD §4 Braid in the Well geometry, the growing Coin | KEEP (dressing) | Landings on the strands; the Mouth grows 31° → 74° |
| WORLD §7.3 Theta Draft maze | CUT | — |
| WORLD §9.1 Layer Omens, default none | CHANGE | **Each layer's movement verb on by default** (glide, drift) |
| WORLD §9.4 `'clamp'` scope | CUT | Powers never nerfed; Rematch doors |
| WORLD §10 Scale-reveal choreography | KEEP | Ported to Unity: nested shells + floating origin, player steering |

**Noun budget.** At most about 25 player-facing coined nouns (RR). This is the full list:
1. KNOTWELL
2. the Mouth
3. fireflies
4. Glow Level
5. Awakening
6. Boon
7. Duo
8. Wish Coins
9. Pearls
10. Tower Rank
11. talents
12. Bestiary
13. class
14. secret quest
15. Knot
16. Cut
17. Heart door
18. Betrayal Cam
19. Vengeance
20. Keeper
21. Warden
22. Landing
23. Fork / Meeting Door
24. Rematch door
25. Rivals

Everything else uses plain words: spots, jars, Team Lives, gold door, the stall. Name collisions are fixed:
- "Coin" means only Wish Coins;
- "Lily Pad" is only a prop;
- there is no "Flies" currency;
- there is no "Moon Coins" currency.

**The user's original wishes: where each one lives**

| Wish | Delivered by |
|---|---|
| Combine Mafia / Among Us / Chained Together / PEAK | Doppelfrog vote door (+ LATER Mimic Climb); tongue-tied tether; per-frog-grip climbing wall |
| Skins + shop | §7 slot list, §8 storefront |
| Randomized doors, 1A/1E, where players meet | Seeded picture-door pairs, Forks with E doors, Meeting Door with key swap (§3.3) |
| Weird-clear-condition monsters and puzzles | Rule doors with a hidden clear, seeded Twists, Sealed and Hell redaction (§3.8) |
| Sabotage and team-up | Heart doors, the Cut, Doppelfrog; linked bodies, Duo Boons, rescue rope |
| Increasing powers | Glow Level, verb ranks, Awakenings, Boons, classes, Rematch doors (§4) |
| The Tutorial Is Too Hard | Difficulty at the entrance, Hell redaction, hidden clears, secret quests |
| Minigames to lighten the mood | Toy doors, Meeting-room toys, the Landing toy, Landing Party mode |
| Top-tier visuals and animation | §6.2 priorities; readability gate; procedural rig |
| Frog in a well: well → sky → space → bigger | The hero *is* the frog; the Mouth grows; reveals at the Keeper and Warden; layer molts (§6.3) |

---

## 8. Monetization and retention that players respect

### 8.1 Price and launch

- **$7.99**, with a **gift 4-pack**. PEAK's developer: "Eight bucks is still five bucks" (RR).
- **A free Quick Climb demo on Steam.**
- **A free weekend at each new layer update.**
  - The evidence is that free access *inside Steam* creates surges: Content Warning drew 6.2M claims in 24 h, helped by Landfall's existing audience (games_coop_social fact-check D4).
  - It is not evidence that "building filming into the loop" drives sales.
- **Creator keys a day early**, as Fall Guys did for streamers.
- **New layers ship as free, named updates.** The evidence says each update is a **spike on a declining baseline**, not a new record: DOORS' 2026 update reached 59% of its 2023 peak, and PEAK's all-time peak came in its Mesa update month (RR). Plan staffing and server-free costs for spikes.

### 8.2 What is sold, and what never is

- **Sold: Supporter Sets.**
  - 4-piece themed cosmetic sets (hat, skin, croak voice, tongue trail) at **$2.99–4.99, priced directly in real money**.
  - Paid and earned catalogues **never overlap**.
- **Never sold:**
  - power, XP or Pearl boosters, rerolls, keys, revives, jars;
  - any randomness;
  - premium currency;
  - energy or timers;
  - skips.

  Nothing sold changes play, odds, speed of progress or information.
- **No battle pass at launch.** The *immersion* plan stacked a paid game, DLC sets and a pass per layer. The ethics review called that stacking; Helldivers 2's passes run on its premium currency. If a pass is ever added, all of these must hold:
  - it never expires;
  - no tier skips and no boosters;
  - pass XP comes from lost and solo climbs too;
  - it doesn't pay for the next pass;
  - it never contains an earned item.
- **The jackpot feel lives only in earned play**: gold doors, Legendary picks, the jar lineup. Jar rules:
  - **no slot reels and no spin-past animations**;
  - the lineup is skippable;
  - jars never hold cosmetics;
  - odds (gold door 5%) are published on an in-game help page.

  Balatro's first PEGI 18 rating over gambling imagery is the risk to avoid (RR).

### 8.3 The earned catalogue

- **Pearls buy every earned cosmetic, at any time.**
  - "Featured" is a spotlight, not a gate.
  - There is no daily rotation and no 24 h Bargain: that rotation earned nothing and only built a check-in habit (ethics review).
- **Try-on** in the Mirror.
- The Vault list becomes a **wishlist**.
- **Earn rates are published and never cut.** Fall Guys' post-F2P earn cut drew an immediate backlash (RR).
- **Earned-only prestige:** the Moon Crown (SSS), Surfacing hats, the Bestiary hat set and class markings.
- **Event cosmetics** return within 45 days or through an archive challenge.

### 8.4 Retention: the one-more-climb engine, with a bookmark on every hook

**Pull (keep):**
- a Boon every ~2 min;
- a Glow level every 2–3 doors;
- Awakenings;
- a gold door or Legendary pick in most Full Climbs;
- a secret quest every climb;
- the Rank bar last in the ceremony;
- a **curiosity** teaser ("Something is waiting in 12E");
- friends' best doors on the hub wall;
- Rival callbacks;
- Bestiary gaps ("Hidden clear: ???");
- the next layer glimpsed at the Keeper.

**Rules that keep it respectful:**
1. **Well-Rested instead of a daily bonus.**
   - Each hour away fills a rest meter, capped at about 3 days.
   - The meter doubles RP and Pearls for your next 2 climbs.
   - It pulls you back, but it rewards breaks, not attendance.
   - **No streaks, ever.** The GDD's +50 first-run-of-the-day bonus and *party*'s +5 Renown are cut.
2. **Every hook has a bookmark.**
   - Every Landing is a save-and-leave point with everything banked.
   - The results screen offers "Climb again" and "Rest" with equal weight.
   - Nothing auto-starts.
3. **No out-of-game nudges** beyond Steam's own presence. Teaser copy never names a real friend.
4. **A gentle break line.** After about 90 minutes of continuous play: `[ THE TOWER WILL WAIT ] Your door is saved.` It is on by default, one tap turns it off, and it never blocks input.
5. **No energy, decay or expiring currency.**
6. **Grind never splits friends.** The host's unlocks cover the lobby, Rank Sync is available, and a new friend can join a veteran's Hell climb.
7. **Every number is true.** No invented rarity percentages. A near-miss line appears only on a deterministic bar.

### 8.5 Measuring it

- **"Worth it?"** is one tap after each climb (Yes / Meh / No), with next-day **voluntary** return tracked alongside it.
- **Revert rule:** a change that raises session length while lowering "Worth it?" or next-day return is reverted.
- **Clean exits:** track the share of sessions that end at a Landing or the results screen, against quits in the middle of a room.
- **Success is fun per session, not minutes per day.**

### 8.6 Enforcement: cheap EditMode tests that fail the build

The build fails if:
- a shop item definition references a gameplay stat or a random table;
- any purchasable item grants run currency, keys, rerolls or revives;
- a System text template contains "%" without a bound data key;
- any shop UI shows a countdown under 24 h;
- an imported asset has no row in `licenses.csv`.

This matches UT: agents write JSON and editor scripts generate the assets.

---

## 9. Top 15 changes, ranked by impact

**How they are ranked:** impact on the user's own words ("fun", "addicting", "attractive", "immersive", "feel progress", "increasing powers"), multiplied by the strength of the evidence, divided by cost.

**Evidence strength labels:**
- **Strong:** several confirmed sources agree.
- **Supported:** the direction is clear, but it rests on a pattern or on sources that were partly verified.
- **Weak / untested:** a hypothesis only.

### 9.1 The ranked list

| # | Change | Replaces | Research evidence | Strength |
|---|---|---|---|---|
| 1 | **Visible, binding growth.** Glow Level every 2–3 doors; every level ranks up a verb that rooms are built around; 3 Awakenings; a Boon at every clear (about 12 per climb); no clamp; Rematch doors | 4 picks per run, a shrinking body, clamped powers (GDD §5.1, §9.1–9.3; WORLD §9.4) | Hades' pick-1-of-3 and reward icons; Vampire Survivors' constant reinforcement; Kim Jun-hyun (status windows make growth visible); Moon Eun-hye (frequent item and level rewards); Dr. O ("numbers must bind", show only deltas); CRIT #25; RR rank 1 | Strong on direction; cadence untested |
| 2 | **Fun in the first 30 seconds, and ≤ 5 systems before the Keeper.** Control in 5 s, a laugh by 30 s, an automatic power at 2:00, the first choice screen and betrayal after the first Keeper, 8 controls | 60 s warm-up, 45 s Draft, 0/7 Decree words, 22 bindings (GDD §3.3, §3.6, §4.1; CRIT #34) | Roblox onboarding docs (confirmed verbatim); DOORS' one cue and one rule; RR line 91 and the fact-check warning about 7 systems in 10 minutes | Strong |
| 3 | **Every climb pays, shown in a results ceremony.** RP on death, first-time Bestiary pages, Pearls, the Rank bar last, two equal buttons, a curiosity teaser | Scorched: no reward, −25% max wax; a Codex that spoils rooms (GDD §5.3, §9.8; CRIT #11) | Hades' "every run counts" (Kasavin, confirmed); Vampire Survivors' permanent gold; Nunes & Drèze 34% vs 19%; Kivetz goal gradient; Ghibellini & Meier resumption (same-session only) | Strongest in the research |
| 4 | **DOORS rhythm.** 20 numbered doors averaging ~57 s, together by default, a picture-door pair at every non-breather, a huge door counter, Quick (~11 min) and Full (~24 min) climbs | 36–45 min runs with 20–55% of time outside rooms, the Tide, parallel instances (GDD §3.3–3.8) | DOORS: 7.79B visits, one-rule entities, the door number as bragging rights; RR "reward density per minute, not run length" (DX fact-check C) | Supported |
| 5 | **Doors show prize, type and danger.** A big number and letter, suit, prize icon, skulls; gold doors, Rematch doors | 7-field plaques, SPLIT/FINISH/SOLE math, 3 currencies (GDD §3.6, §11; CRIT #10, #33) | Hades' door symbols; Alice in Borderland suits; DCC's box tiers; DOORS' rare entities | Supported |
| 6 | **Cut the bureaucracy** (Draft, Ghost Sim, Grates, Tribunal, Notes, bets, Pact Pot, Soot, 10 Knives, Sparks) **and spend the budget on juice and rooms** | GDD §3.6–3.8, §7, §11 | CRIT #4, #5, #14, #20, #23, #31; RR "the first move is subtraction" | Strong (the design's own critique) |
| 7 | **Betrayal as a punchline.** Announced Heart doors, each with a clever co-op answer; one Cut verb; the Betrayal Cam; a WANTED poster; a Vengeance quest paid within one room; strangers never betray strangers | 10 Knife types, Soot, Tribunal (GDD §7) | Liar's Bar (lying is the rule); Among Us ghosts; ORV's cruel rule with a non-lethal answer; *goguma* → *saida* (71.5% use "cider"); Tomodachi's side-switch penalty; the "Vigilante" framing (anecdotal) | Supported; "funnier among friends" is anecdotal |
| 8 | **Juice and self-lit readability.** Hitstop, squash and stretch, rising-pitch count-ups, status windows with causes, dark rule rooms with glowing tells, warm breathers | Dark rooms "lit only by the players"; tells not required to glow (GDD §2.2; CRIT #28) | Juice It or Lose It; Balatro's layered feedback; Fall Guys' pushed colours tested at real size; SDT (controls → presence); UT's HLSL toon, PrimeTween, Cinemachine Impulse | Strong on feel; no retention data |
| 9 | **The Firefly Frog, behind a readability gate and an A/B against a Wick-Flame** | A shrinking candle; the user's frog as a statue (GDD §4, §5.1; WORLD §0) | The user's own image; hero_0 (36 vs 30); hero_1's rebuttal priced in as gates; Fall Guys' bean (trips funny, reads small); capsule data (41% show a creature; descriptive) | Medium until the gates pass |
| 10 | **Linked-body comedy in every room, plus minigames that get played.** Raft, tether, climbing wall with per-frog grip, spot catches, toy doors, Meeting-room toys, Landing Party | Comedy "from bodies" with no scripted beats; unplayed minigames (GDD §2.2; CRIT #26) | Friendslop = coupling + blame + cheap failure: Chained Together (92,186 peak), PEAK (per-climber stamina), R.E.P.O. (slapstick without sound; 271,571 peak) | Supported (survivorship bias) |
| 11 | **Scale as progression.** The Mouth grows every Landing; a steered pull-back at the Keeper (~10 min); Out of the Well at ~24 min; a new movement verb on by default and a molt per layer; layers ship as free named updates | Reveal at ~38 min; reskin-only layers; a 2.6 h campaign (WORLD §3.2, §9.1, §10.2) | The 2012 presence study (agency > camera angle); SSS-Class's best arc changed the setting; PEAK's peak in its Mesa month; DOORS update spikes on a declining baseline | Supported |
| 12 | **Tower Rank F → SSS with one talent per rank, the Bestiary, classes.** Three deterministic tracks; talents are PvE-only; Rank never gates a mode | Wick Level (cosmetics only), Gilded at ~29 runs, Origins (GDD §9.5, §9.9, §11.5) | Hades' Mirror of Night; ARISE's "everything needs leveling" bloat → 3 tracks; ToG: New World's scarcity complaints → deterministic unlocks; "discrete step-ups on a continuous meter" (kr_power_fantasy) | Supported |
| 13 | **A secret quest per player per climb, revealed in-run as a class.** Private, self-contained, salted; a banner, not a full-screen card | Origins as sidegrades; no per-player specialness | Solo Leveling's hidden-class job change; RR "everyone exceptional in a different way"; kr_power_fantasy fact-check 1 (private info breeds suspicion → **playtest it**) | Weak / untested (high upside) |
| 14 | **Difficulty chosen at the entrance, plus Team Lives.** Easy (unlimited) / Normal (3) / Hard (2) / Hell (1, redacted); E doors never cost lives; lobby-wide unlocks | Only one difficulty; Scorched; a near-unlosable party draft | The Tutorial Is Too Hard (Easy–Hell, harder pays more); Hades' God Mode for accessibility; Chained Together and Only Up! show that punishing modes also sell | Supported |
| 15 | **A storefront and ethics players respect.** $7.99 plus a gift 4-pack, a free demo, free weekends, creator keys; cosmetics only, direct prices, no pass or rotation at launch, Well-Rested, bookmarks, true numbers, EditMode enforcement | Mock Sparks, the Wickbook, a daily-rotating shop, a daily bonus (GDD §11.6, §12.6–12.7) | PEAK's pricing; Content Warning's free-on-Steam surge; Fall Guys' creator seeding and earn-rate backlash; the FTC HoYoverse order; Balatro PEGI 18 → 12; payer rates around 1.5% outside Korea (WEBTOON) | Supported on ethics and sentiment; no revenue evidence for this exact mix |

### 9.2 Unity feasibility: what makes this buildable by agents

- **Engine and rendering.** Unity 6.3 LTS with URP 17 (Forward+, APV).
  - The toon shader and outline are agent-owned HLSL.
  - Juice is PrimeTween plus Cinemachine 3 Impulse.
  - Particles use Shuriken; VFX Graph only for the reveals.
- **Netcode.** NGO 2.x in host mode over the Facepunch Steam transport, plus **Unity Transport with LAN discovery** as a second transport.
  - Both are tested from week 1.
  - A 1–2 week **NGO-vs-FishNet proof of concept** covers the tongue, the tether and the raft at 150 ms with packet loss.
  - Distributed Authority is ruled out.
  - The forced **NGO 3.0 migration** with 6.7 LTS in 2027 is a named milestone (UT).
- **Bots.** Host-owned NetworkObjects on the player code path.
  - **Profile 7 bots plus prop physics on the host from week 1.**
  - Ragdolls are a local cosmetic layer and are never networked.
- **Data first.** Doors, rule cards, Boons, quests, verb ranks and jar tables live in JSON that agents edit. Editor scripts generate the ScriptableObjects and prefabs. One seed builds identical rooms on every client and replays failed soaks (UT).
- **Rooms** are prefabs placed far apart in one scene. At most 2 are live at once (forks), hidden per client with the netcode's visibility controls. Scenes stay thin.
- **The frog.**
  - A script-built Blender bean mesh on a minimal rig with fixed hat attach points.
  - Motion is procedural: hand-written 2-bone IK, spring bones and a tongue spline.
  - No retargeted humanoid clips.
- **Scale reveals.** Nested shells near the origin plus a floating origin, because URP has no camera-relative rendering.
- **Legal.** `licenses.csv` plus a build validator. A **human must read Synty's and Sonniss's AI clauses** before those assets enter the repo. Prefer Kenney, Quaternius and KayKit (CC0).
- **Content slice:**

  | Content | Count |
  |---|---|
  | Well rule doors, each with a hidden clear + 2 Twists | 12 |
  | Breather templates (jar, 2 toy doors, window, sleeping threat, gold) | 6 |
  | Set pieces (tether, climbing wall) | 2 |
  | Heart doors | 4 |
  | Keeper + Warden (the Jar) | 2 |
  | Boons + Duos + Legendaries | 16 + 4 + 4 |
  | Verbs × ranks | 3 × 4 |
  | Classes (3 open + 6 secret) | 9 |
  | Bestiary pages | 12 |
  | Minigames | 4 |
  | Rivals | 10 |
  | Earned cosmetics + Supporter Sets | 24 + 2 |

  The full Well later needs about 24 rule doors, because short rooms use up content 2–3 times faster.

### 9.3 Proof gates: prove it before building more content

1. **Weeks 1–2: the netcode proof of concept.**
   - Covers tongue-on-prop, tongue-on-player, the tether and the raft.
   - Runs at 150 ms RTT with loss, with a full 8-seat lobby (humans plus bots).
   - Measure the host-versus-client gap with lag compensation on.
2. **In parallel: a 10-door greybox** following the first-climb script (§6.1) with capsule frogs: doors 1–10, the Keeper, auto-grants, the verb ranks, the raft and picture doors.
3. **Week 3: Gate A (readability).** Week 4: **Gate B, Frog vs Wick-Flame on the identical loop** (§2.3).
4. **A/B tests that answer the open questions:**
   1. Frog vs Wick-Flame.
   2. Tongue-on-player on vs off.
   3. 8 bodies per room vs 4.
   4. Bot-only betrayal (public rules) vs friend betrayal.
   5. Secret quests on vs off in Heart doors (suspicion).
   6. Well-Rested vs no rest meter (day-7 return and "Worth it?").
   7. As a sanity control only: a clamped build with no Glow Level.
5. **Feel target:** about every 90 s, the tester got stronger, laughed or saw something bigger.
6. **Funnel telemetry:**
   - hatch → first gulp → door 2 clear → first Boon → first Awakening → Keeper;
   - then first Heart door → first Meeting → Warden → next-day return;
   - plus "Worth it?" after each climb.
7. **Stop and fix pacing before adding content if any of these holds** (the thresholds are hypotheses):
   - the median time to the first power is over 3:00;
   - testers can't name a power they gained;
   - HP isn't readable at 25 m;
   - tongue-on-player feels unfair at 150 ms (then cut it and fall back to shove);
   - fewer than 60% of first-climb "Worth it?" answers are Yes;
   - more than 25% of first sessions quit in the middle of a room before door 5.

---

## 10. Review log

### 10.1 Base decision

The judges split: judge 0 chose **party** (49/60) and judge 1 chose **immersion** (7.8 weighted). Their grafts converged on the same hybrid, and this document adopts it:
- **From *party*:** the structure, which is the most expensive thing to change later. Numbered doors, together by default, Forks and a Meeting Door, the Heart-door roster, the bot rules.
- **From *immersion*:** the first-session order, world dressing, the gate with a fallback, and the storefront.
- **From *power*:** the progression spine, the fairness contract and the jackpots.

### 10.2 Grafts taken, by source

- **Power:**
  - fireflies as XP, banked at clear, spills that never cost levels;
  - a quadratic Glow curve (re-derived so the back half keeps its cadence);
  - "every level must change something" (made concrete as verb ranks);
  - Awakenings, recast as rank III of each verb;
  - the fairness contract;
  - mites; gold doors; the results ceremony order and the kill criterion;
  - Rematch doors (from *power*'s Tribute rooms, moved inside the climb);
  - shared Team Lives (renamed from "Lily Pads");
  - Party Rank Up (at the Keeper and Warden only);
  - the comeback bonus;
  - hidden classes (reduced to 6 secret quests that use existing verbs);
  - Chan Chu as a Warden.
- **Party:**
  - the DOORS rhythm;
  - Forks and the Meeting Door;
  - the first laugh from tonguing Kestrel;
  - the Heart-door roster;
  - public lobbies where only bots betray;
  - Drama Director targets;
  - duplicates upgrade Boons;
  - Duos through the Knot;
  - the difficulty chosen at the entrance;
  - the 8-control list;
  - blame tags (friends only);
  - "fun before rules";
  - friends' best doors on the hub wall.
- **Immersion:**
  - hatching as the first beat;
  - a head start earned by real action;
  - the first power granted automatically at 2:00;
  - betrayal after the first Keeper;
  - the steered pull-back, the free hat and the curiosity teaser;
  - Wish Coins raining through the Mouth;
  - the croak echo;
  - per-layer palettes;
  - 2-room forks meeting with a key swap;
  - Landing checkpoints;
  - "S means surfacing";
  - the readability gate with the Wick fallback;
  - the capsule and trailer spec;
  - $7.99 plus a gift 4-pack, free weekends, creator keys;
  - cosmetic slots ordered by how visible they are.

### 10.3 Objections accepted, and where they were applied

| Objection (source) | Applied in |
|---|---|
| Pick-1-of-3 and betrayal before the first floor breaks RR line 91; cap floor 1 at about 5 systems (refuter, judges) | §3.5, §6.1: auto-grants until the Keeper; Heart doors and the Knot from door 11 |
| CRIT #28 was misread as "remove darkness" (refuter) | §2.2 tone rule, §6.2 #3: dark rule rooms, self-lit tells |
| Test the hero properly: Wick-Flame under the same loop; lock nothing frog-dependent early (refuter) | §2.3 Gates A and B; §6.4 capsule after the gate |
| The 0.25 s tongue tell can't be countered; a 1 m tug is lethal at ledges; host latency edge (refuter, hero_1) | §5.4: ledge guard, 0.6 s yank tell in Heart doors, lag compensation, input-time arbitration; the design works with tongue-on-player cut |
| Growth doesn't bind to rule clears; "+2%" and "+10%" ticks (refuter, judges) | §4.1 verb ranks with authored thresholds; §3.8 rank shortcuts |
| Deleting the clamp is a no-op when power resets every run (refuter) | §3.2 Rematch door; Warden phase 1 |
| TTITH difficulty removed; the party draft is nearly unfailable (refuter) | §3.6 difficulty tiers, Team Lives, Hell redaction |
| Reward inflation; full-screen interruptions (refuter, ethics) | §4.1 5 slots, duplicates upgrade, no rarity rolls; §4.2 banners; Party Rank Up only twice |
| Weird puzzles collapse into reflex rules; no replay life (refuter, CRIT #11) | §3.8 hidden clear, 2 seeded Twists, Sealed opt-in |
| Minigames die in 40 s Landings (refuter) | §5.1 toy doors, Meeting toys, Landing Party |
| No PEAK grip or stamina; the climb becomes a hotel (refuter) | §3.2 climbing-wall set piece with per-frog grip |
| Snowballing (refuter) | §4.1 70/30 clear-bonus split, spills return to owner, no magnet or loot-rate scaling |
| Talents contradict "same heart cap" (refuter) | §4.3: no talent touches spots, speed, hitbox, shove or tug |
| Forgeable local saves; seed-derived hidden info (refuter) | §4.3 Rank never gates a mode, unlocks per lobby; §4.1 and §4.2 host-only salt; leaderboards LATER with replay validation |
| Shared lives punish players for other people's rooms; griefing burns lives (refuter) | §3.7 E doors never cost lives; 2-flag kick-to-bot |
| Collusion farms (Vengeance payouts, "get betrayed twice") (refuter, ethics, D3) | §5.2 Vengeance returns only what was taken, +1 card once per climb; §4.2 self-contained quests; first-time-only death rewards |
| Drop-in level and mixed-rank lobbies undefined (refuter) | §4.1 drop-in rule; §3.6 lobby-wide unlocks |
| The fork collapse punishes the slower group; "fun before rules" violated by wait timers (judges, refuter) | §3.3 rescue rope, "cleared with help" keeps the pick |
| Name collisions and noun bloat (judges, refuter) | §7 noun budget; the Mouth; no Flies or Moon Coins; "Lily Pad" is a prop only |
| Doppelfrog lets bots decide human votes (refuter) | §5.2: ≥ 3 humans, bots vote on public evidence, votes marked |
| The party rhythm removes door choice (refuter) | §3.3: a picture-door pair on every non-breather |
| Invented rarity "0.8%" (ethics) | §4.2: real Steam % or lobby-local text |
| Rank-gated modes split friends (ethics) | §3.6, §4.3: per-lobby unlocks |
| Daily bonus; daily-rotating shop (ethics) | §8.4 Well-Rested, no streaks; §8.3 catalogue buyable any time |
| No stopping point; cliffhanger at exit (ethics) | §3.6 Landing saves; §4.4 equal buttons, curiosity teaser, no auto-start |
| Human betrayal and shaming among strangers; snake mark (ethics) | §5.2 lobby table, WANTED poster, friends-only blame tags |
| Head start handed out as a gift (ethics, immersion fact-check) | §4.3 the bar stamped by real doors; no pre-fill |
| Hidden bot tuning presented as fact (ethics, games_coop fact-check #14) | §5.3 labelled Rookie Rivals fading gradually; bot badge |
| Titles that count betrayals (ethics) | §4.4 cosmetic callouts, no currency |
| Pass stacking; Helldivers passes use premium currency (ethics, refuter) | §8.2: no pass at launch; guardrails if ever |
| Clips rebuilt from host state miss the local ragdolls (judges, refuter) | §5.1 Steam recording markers; in-game replays only |
| LAN not addressed; voice middleware missing (judge 1) | §9.2 second transport; §5.1 voice LATER |
| The A/B test was a strawman (refuter) | §9.3: seven A/B tests on the real open questions |
| The capsule stacks five subjects (refuter) | §6.4: one focal point |

### 10.4 Objections rejected, with one-line reasons

1. **"Ship the Wick as the hero; RR's own fix keeps it" (refuter).** Rejected as the default: the user's own image, the tongue and croak verbs, the hat canvas and the scale-up favour the frog. The Wick-Flame stays as the gated fallback and the A/B arm.
2. **"Cut *power*'s Awakenings; fold them into I→III duplicates" (judge 1).** Rejected: Awakenings are what make levels *bind*. They are kept as rank III of each verb, which adds no system, while duplicates handle Boons.
3. **"Cut per-run hidden classes entirely" (judge 1).** Partly rejected: the in-climb reveal is the only "who was secretly special" moment the design has. It is cut down to 6 self-contained quests that re-use existing verbs.
4. **"Size door count by time, not a fixed 20" (judge 1).** Rejected: a fixed 20 per layer keeps the door number meaningful as bragging rights and global numbering. The room-length mix absorbs time variance.
5. **"Half the doors are filler" (refuter).** Rejected: breathers carry the rhythm and are the cheapest content, and each must hold a jar, toy, window or threat.
6. **"Make meta server-side or Steam-validated now" (refuter).** Rejected for launch: there are no servers. Rank gates nothing and unlocks are per lobby, so forging gains nothing. Leaderboards wait for replay validation.
7. **"Tower Pity damage resistance" (*power*).** Rejected: health is discrete spots, and Easy mode already gives the Hades God Mode role.
8. **"Hell doors per door, seating 1–2, with a guaranteed Legendary" (*power*).** Rejected: it recreates CRIT #10's solo-lane funnel and power gaps inside a betrayal game. Replaced by entrance difficulty plus skulls.
9. **"Four metamorphosis bodies" (*power*).** Rejected: one rig with add-on parts, so every hat fits every form.
10. **"12 hidden classes with 12 unique verbs, 32 Boons, 8 Duos" (*power*).** Rejected on scope: the slice is 6 secret classes, 16 Boons, 4 Duos and 4 Legendaries.
11. **"A $4.99 Layer Pass per update plus DLC sets" (*immersion*).** Rejected: layers ship free as named updates; only direct-priced Supporter Sets are sold.
12. **"A 6-slot rotating Pearl shop" (*immersion*, GDD §12.6).** Rejected: rotation on earned currency only builds a check-in habit.
13. **"Drop the tongue: it breaks the betrayal contract and is costly to network" (hero_1).** Rejected: capped, ledge-guarded, lag-compensated, and cuttable after the proof of concept without breaking the design.
14. **"A sponsor/audience layer at rank 4, in the slice" (DX).** Rejected for the slice: the fact-check rates it WEAK and it adds the largest system. It is a capped layer-2 prototype, LATER.
15. **"Party Rank Up at every floor clear" (*power*).** Rejected: reward inflation. It happens at the Keeper and Warden only.
16. **"Bots shouldn't be the betrayers, because bot betrayal lacks human trust" (games_coop_social fact-check 2d).** Not adopted as a rule. It is the only way to keep strangers safe in public lobbies, so it stays as a flagged A/B test (§9.3).
17. **"12–20 min default runs because long runs are the fault" (DX §4).** Reframed rather than adopted: the fault is reward density, since Hades has 20–45 min runs and is a hit. Quick Climb is the default for bounded sessions, not because of the DOORS 11.56 min figure.

### 10.5 Evidence corrections carried forward (do not re-cite)

- **"Fall Guys' bots were tuned to lose"** is UNVERIFIED (games_coop_social fact-check #14).
- **Helldivers 2 friendly-fire "consistency"** was a joke tweet (#11).
- **"Head items lead cosmetic sales"** is unverified. Hair leads the Roblox third-party data, and hats are only "consistently popular".
- **PEAK's stamina is per climber**, not shared. The Scoutmaster punishes the runaway climber.
- **DOORS' 11.56 min** is a platform average playtime that includes bounces, not a run length.
- **Content Warning's 6.2M claims** came from being free on Steam plus Landfall's audience, not from filming in its loop.
- **Chained Together's base mode is punishing**, and Only Up!'s virality came from lost progress. "Cheap failure" applies to Normal, not to the whole game.
- **Hades' Duos are single-player synergies.** Player-to-player Duo value is a hypothesis.
- **Reader-pacing research** (the cider figure, StoryBench, Kim, Moon) is about serial fiction. Mapping it to rooms is an unsourced analogy.
- **The resumption effect** (two-thirds of interrupted tasks resumed) is same-session lab data. The next-launch teaser is an extrapolation.
- **"Betrayal is funnier among friends"** rests on one anecdotal Schell Games retrospective. Steal a Brainrot shows toxic is not the same as unpopular, so our guardrails are a wellbeing and brand choice, not an engagement maximiser.
- **The 2012 presence study** supports the steered pull-back, not the molts. The molts rest on the user's wish.
- **The capsule statistics are descriptive, not causal.** A/B test the capsule.
- **The frog's +1.5–2 tech-art weeks** is an unmeasured estimate from the Three.js era.
