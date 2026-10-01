# KNOTSPIRE: Game Design Document

**Version** 1.0 · **Date** 2026-09-28 · **Status** Authoritative. This is the single source of truth for the vertical slice.
**Project folder:** rename `make me a name/` to `knotspire/`. npm package name: `knotspire`. The code scaffold lives in `_scaffold/` (Vite + TypeScript + Three.js + pmndrs `postprocessing` + `ws`; folders `src/{actors,core,cosmetics,game,net,scenes,ui,world}`, `server/server.mjs`).

### How to read this document
- **Units.** Metres, seconds and kilograms. **Wax** is HP. **Embers** are the in-run currency. **Drips** are the earned meta currency. **Sparks** are the premium currency, mocked in this build.
- **Room coordinates** are room-local. +Y is up, and the origin is the centre of the room floor. The entry door is always on the −Z wall, facing +Z.
- **Numbers are defaults.** Every number here is a default for a data table in `src/game/tuning/*.ts`. Engineers must not hard-code them anywhere else.
- **Scope tags.** **MUST**, **SHOULD** and **LATER** mark vertical-slice scope (see §17). An unmarked feature is MUST.
- **Words the game shows the player** are in `[brackets]` (System windows) or "quotes" (barks and UI copy).

---

## 0. Title, tagline, pitch, name

# KNOTSPIRE
**Tagline:** ***"Belay or betray."***
**Trailer and boss line:** ***"Climb together. Fall alone."***

**Elevator pitch.** KNOTSPIRE is a party roguelite that runs in the browser for 1–8 players. Any seat a friend doesn't take is filled by an AI rival who is petty, lovable and remembers everything.
- **You are a Wick**, a living candle. Your wax is your health, and your body visibly shrinks as it burns down. Your flame is your face, your torch and your reputation.
- **You climb a tower of lettered doors** (1A, 1B, 1C, 1E…) that latch shut behind you. On each floor you physically scramble onto a door's glowing plate, and in doing so you choose who you'll be locked in with.
- **No monster in a room can be hit to death.** You sing a bronze golem apart, steam-herd a slime that moves 100× faster than you into cold storage, and walk in the footprints of a shade that wears the skin of the friend you betrayed.
- **The System tells you only part of it.** It types out a half-redacted Clear Condition. You work out the rest by watching, by dying, or by trusting someone who might be lying.
- **Pacts are literal knots.** You can knot your wick to another climber's with a glowing thread, and cut it, in slow motion, for profit.
- **The tower keeps the receipts.** At the summit the Snuffer grows one soot tendril for every knife in the run. Then it asks you to fall backwards off a ledge and hope somebody catches you.

**Why the name.** Both judges ranked **KNOTSPIRE** first, and it is the strongest name on the panel.
- **It's clean.** It is a coined, two-syllable word, and quick web checks turned up no game or brand using it. Those checks are not a trademark clearance; see §17.
- **It's easy to say and says the whole game.** "Knot" is the Pact thread tying two wicks together, and the Fuse Tether you can hear singing. "Spire" is the lettered tower and signals a tower roguelite to genre fans. Said aloud, it echoes *conspire*, which is exactly what the players do.
- **It works as a logo and a folder name** (`knotspire/`), and it carries the best tagline anyone wrote: "Belay or betray."
- **TRUSTFALL was considered on its merits and rejected as the title.** An exact-name *TRUSTFALL* is already on Steam, several itch.io games (including a co-op trust game) use the name, and P!nk's 2023 album owns the search results. It lives on inside the game instead, as the boss phase **Trust Fall** and the line "Climb together. Fall alone."

**Runner-ups**
1. **BACKSTAIRS.** A clever backstab/stairs pun that works as a verb ("I got backstaired"). Searches for it are flooded by Backrooms games and *Backdoors*.
2. **LATCHLIGHT.** Fits candles and doors, and has no game collision. The name is soft and says nothing about betrayal, and a nursing night-light product already uses it. Reserved as the name for **Season 1**.
3. **OATHSPIRE.** Sounds premium, but the "Oath" space is crowded (*Oathbound*, *Oath*, *Oathsworn*), and one project already uses the exact name.

---

## 1. Pillars and uniqueness

### 1.1 Pillars (every feature must serve at least one)
1. **Light is life and language.**
   - Wax is HP and the body shrinks as it drops.
   - The flame is your face, your torch and your emotion.
   - Soot bands on your wax are your reputation.
   - You can read a Wick's whole state from its silhouette across a dark room. The HUD is nearly empty.
2. **Riddles with teeth.**
   - Monsters have no HP bars, and hitting one usually makes things worse.
   - Every Clear Condition is a physical trick that a player can read from the room itself: chalk lines, painted delays, glowing footprints.
3. **Every door is a social decision.** You don't pick a level. You pick who you get locked in with, by standing on a plate where everyone can see you.
4. **Belay or betray.**
   - Anyone may betray anyone, but every betrayal (a **Knife**) is a body doing something visible, with a readable tell.
   - Knives leave Soot, the Ledger records them, and the summit fights back with them.
5. **Dread, then a waltz.** Rooms are tense, dark and lit only by the players. The Landing between floors is a waltz, a minigame party and a wardrobe mirror. That swing between the two is the brand.
6. **Solo is a full lobby.** Seven AI Rivals with personalities, memories and tells fill the tower. They cooperate, they gossip, and some of them betray you.

### 1.2 What we take from each inspiration, and what we add

| Source | What we keep | What KNOTSPIRE adds |
|---|---|---|
| *Among Us* / *Mafia* | Suspicion, lying, a hidden traitor, votes | No run-wide assigned impostor. The one hidden role, the **Taster**, is scoped to a single room (Liar's Banquet). Everywhere else, open **Knives** plus a **Tribunal** vote on what people *did*, based on evidence everyone saw (culprit-coloured motes, sour notes, stamped Notes). |
| *Chained Together* | Shared tether, panic and comedy | The tether is a **lit fuse** that burns toward you (1C). Each segment is a string that sings, and cutting it is a visible 1.2 s duel. |
| *PEAK* | Grip, stamina, hauling friends up | One room, the **Drip Chimney**, where your own flame melts the holds you touch. |
| *The Tutorial Is Too Hard* | A lonely, brutal tower; Clear Conditions; Hidden Pieces; Unique Titles; knowledge carried across deaths | Clear Conditions start **redacted** and un-redact through deaths (**Regression Scars**) and the Codex. E doors form a lone-wolf lane with Keys and Titles. |
| TEAMBOUND 13 (our previous game) | Ropes, bracing, carrying, Tower of Babel, private rooms | Fun comes first. Physics lives only where it pays off (tether, chimney). Babel returns as the **Wax Stack** minigame. The ONE BODY mode returns post-slice as the **Hollow Suit** room. |
| *Fall Guys* | Bouncy bodies, cosmetics | Candle-only cosmetic slots: **Shadow, Smoke, Knock, Oath Thread, Betrayal Snap** and **System Window**. |

### 1.3 Non-negotiable rules
- **Fun before physics.** Rope and climbing physics exist only in C rooms. Tethers are distance constraints, not ragdoll chains.
- **Every room is solvable by reading it.** A first-time player must be able to clear it in under 6 minutes using physical tells alone (see §17).
- **The System never lies.** System windows are always true, and nothing in the game can forge one.
- **Betrayal is always visible.** No Knife can happen from inside a menu.
- **Cosmetics never change readability or gameplay.**
  - Every Wick keeps the same height, hitbox and flame position.
  - Flame colours are normalised to a luminance of at least 0.6.
  - Soot bands always draw on top of any skin.
- **No pay-to-win and no loot boxes.** Premium currency buys cosmetics only.

---

## 2. Fiction and tone

### 2.1 The world
- **Where Wicks come from.** Every candle that has ever been snuffed wakes, one day, at the foot of the **Knotspire**: a braided tower of old stone and older wax that rises above a sea of cloud.
- **How the tower works.** Its floors are rings of heavy doors, and each door is a test. The tower isn't evil. It is an *examiner*, patient, bureaucratic and faintly amused, and it speaks through **System windows**.
- **What waits at the top.** The **Crown Door** and the **Great Wick**. Legend says that whoever walks through the Crown Door alone will burn forever: the **Everflame**. Legend also says that if everyone who reaches the top lights the Great Wick *together*, the whole tower is lit for every candle still climbing. Nobody remembers anyone doing it.
- **The people you meet.** **Rivals**, other Wicks with names and grudges. **Old Tallow the Chandler**, a many-armed candle merchant hidden behind secret doors. And the **Snuffer**, the house-sized bell that hangs from the Crown and comes down on the brightest light.

### 2.2 Tone
- **Look.** Storybook miniatures lit only by the players: the dread of *Little Nightmares* with the bounce of *Fall Guys*.
- **Where the comedy comes from.** Bodies. Wobbling candles, belly-flop dives, a Wick shrinking to a stub, a traffic-cone wick.
- **Where the dread comes from.** Darkness, silence and the dry, polite voice of the System.
- **Betrayal is a game move, never a verdict on a person.** Word and Soot reset every run, and there is a Friendly preset (see §7.10).

### 2.3 The System (the Tower's voice)
**Voice rules**
- Every line is a System window (§14.2). Headers are `[ BRACKETED CAPS ]`, and body text is sentence case inside brackets.
- It addresses the player as **"Wick"** or by name. It is dry, precise and never cruel. Its dark humour comes from understatement.
- It never lies, and it never gives advice beyond the Clear Condition and the hint ladder.
- It is **audible as bell-babble**: formant chimes synced to the typing (§15).

**Sample lines (engineers: store in `src/game/text/system.ts`)**
1. `[ WELCOME, WICK ] You have been lit. Please do not go out.`
2. `[ FLOOR 1 ] Four doors. Every door latches. Choose your company.`
3. `[ CLEAR CONDITION ] Let it ███ itself.`
4. `[ STAMPEDE ] The plates are slippery now. Good luck.`
5. `[ KNOT TIED ] Moss and you are bound. The Tower takes note.`
6. `[ KNOT CUT ] Vex has cut a knot. The Tower remembers.`
7. `[ REGRESSION SCAR ] You failed here. You will know more next time.`
8. `[ UNIQUE TITLE ACQUIRED ] 「Slime-Warden」. The Tower is mildly impressed.`
9. `[ HIDDEN PIECE ] You were not supposed to find that. Keep it.`
10. `[ SNUFFED ] Smoke does not count toward the Clear Condition.`
11. `[ THE TIDE RISES ] Rooms still sealed will feel the pressure.`
12. `[ NOTE PROVEN FALSE ] The author's plaque has been stamped.`
13. `[ THE CROWN ] Climb together. Fall alone.`

### 2.4 Audience and sponsor layer
**There is none in the slice.** No Patrons, no sponsorship, no chat feed. The Tower is the only audience, and its flavour is *"the Tower remembers"*: the Ledger, Soot, Regrets and Snuffer tendrils. Two Codex lore lines mention *"the ones who watch from above the Crown"* to seed a possible later season. Nothing else.

---

## 3. Core loop and run structure

### 3.1 Loops at every scale

| Scale | Length | Loop |
|---|---|---|
| Moment | 2–20 s | Read the room (System window, tells) → poke a toy (grab, throw, shove, brace, Brighten/Dim) → watch the reaction → quick-chat (truth or lie) → act |
| Room | 3–6 min | Latch → reveal orbit → learn → execute → clear or fail → Shared Altar (trait) → Stair or Side Door |
| Floor | ~7–8 min | Landing (Intermission) → Door Draft (45 s) → Latch (6 s) → Room → Altar → next Landing (waiting time filled by minigames, Keyholes and Side Doors) |
| Run | 36–45 min | Floors 1–4 (rooms) → Floor 5, the **Crown** (boss) → the **Ledger** results → Drips |
| Meta | weeks | Drips → cosmetics. Codex study levels un-redact Clear Conditions. Titles unlock Origins. The Rival Register remembers you. The season pass (the Wickbook). |

### 3.2 Run structure
- **5 floors.**
  - **Floors 1–4** are room floors, each with a Landing and 3–4 doors.
  - **Floor 5** is the Crown: one arena, every survivor, the Snuffer.
- **8 climber slots.** Humans take slots and Rivals fill the rest. Private lobbies may set 4–8 slots.
- **Solo** is 1 human and 7 Rivals.
- **Run seed.** Every run has a **Tower Seed**, a 6-character code shown on the results and the share card. *Daily Seed* is LATER.

### 3.3 Floor flow (exact)

| Step | Duration | What happens |
|---|---|---|
| 1. Landing: arrivals | open-ended | Climbers arrive from the floor below one group at a time. The first arrival starts the **Tide** for the floor below (step 9). Available: minigames, Anvil, Chandler (if revealed), Keyholes, Note Board, Relight Font. |
| 2. Intermission | 45 s after the floor below closes (+15 s if a Tribunal fires) | Tribunal (§7.6), last shopping. Ends early if every lit human presses **Ready** (Enter). Floor 1's first Landing (the **Foot**) has a 60 s warm-up with contextual tutorial prompts. |
| 3. Door Draft | 45 s | The physical plate scramble (§3.6). The last 10 s are the **Stampede**. |
| 4. Latch | 6 s (+ up to 8 s if someone holds the door) | Doors grind open, climbers walk in, and the doors slam. |
| 5. Reveal orbit | 2.2 s | The camera orbits the room diorama. The System window types the door title and the (redacted) Clear Condition. The timer starts when the orbit ends. |
| 6. Room | per room (3:30–5:30) | See §6. |
| 7. Shared Altar | ≤ 15 s | On clear: trait draft (§9.2). |
| 8. Exit Vestibule | player choice | **Stair** (go up) or **Side Door** (join an uncleared room on this floor as a Visitor, §3.8). |
| 9. The Tide | 2:30 after the first climber reaches the next Landing | When it runs out, every room still running on the floor below gets **Pressure**: its timer runs at 1.5×, fog closes to 12 m, and the music goes up a layer. |
| 10. Floor close | — | When no live room remains. Ghost rooms (§3.7) resolve no later than 10 s after the last live room, and their timelines are compressed if needed. Go to step 2. |

**Timing target.** Median wait for early finishers ≤ 60 s. Worst case is bounded by the Tide plus Pressure (≈ 3:30).

### 3.4 Door letters (6 letters + the Crown)

| Letter | Name | Capacity | Reward rule | Identity | Key colour | Music motif |
|---|---|---|---|---|---|---|
| **A** | **Arena** | 1–8 | SPLIT (crowd-friendly, thin per head) | Big gimmick monsters that need many bodies. Always fits everyone. | Ember `#FF6B2C` | synth taiko toms |
| **B** | **Baffle** | 1–4/5 | SPLIT + solver bonus | Information gaps, logic, lying. Teams panic. | Ink blue `#4FC3F7` | pizzicato plucks + clock ticks |
| **C** | **Chain & Climb** | 1–4 or 1–8 | SPLIT / FINISH | Tethers and climbing: the TEAMBOUND DNA. The only letter with rope or grip physics. | Moss `#8BD450` | Karplus-Strong rope strings + wind |
| **D** | **Dilemma** | 1–5 | SPLIT with transfers (The Cut) | Explicit prisoner's dilemmas and lifeboats. Highest pay. | Brass `#F2B134` | two-voice harpsichord canon |
| **E** | **Enigma** | 1–2 | SOLE (lone wolf gets it all) | Glitched, volatile, lonely. Keys, Hidden Pieces, Unique Titles. | Lavender `#B388FF` + RGB split | bit-crushed Lydian arpeggios |
| **X** | **Secret** | 1 | — | Not a room. A hidden alcove on a Landing where **Old Tallow's Market** stands (§10.3). Revealed by a Black Key, Burning Dialect, Keysmith or the Watcher's Lens. | Verdigris `#00E5C0` | reversed music box |
| **♛** | **Crown** | everyone alive | Endings (§6.13) | Floor 5 boss. | White-gold `#FFF1C1` | organ + formant choir |

**Door designation** = floor number + letter, e.g. **"Door 2D: The Weighing Hall"**. There is only ever one door per letter per floor.

### 3.5 Tower generation (seeded, deterministic)

**Inputs:** the seed, and **P** = the number of climber slots still in the run (lit or Smoke, but not Burnt Out) at the moment the Draft starts.

1. **Doors per floor:** `doors = P >= 5 ? 4 : 3`.
2. **Letters per floor:**
   - **Floor 1:** A, B, C, E (with 3 doors: A, B, E).
   - **Floors 2–4:** always **A** and **E**, plus 2 (or 1) letters drawn without replacement from {B, C, D}, weighted B 30 / C 30 / D 40. At least one **D** must appear across floors 2–3.
3. **Room pick per letter:** choose from the rooms whose floor band contains this floor (see the table below), weighted uniformly.
   - A room already used this run may appear again **only** on a later floor, with **tier +1** and an **Omen** different from any it had before (an **Echo**).
   - The generator prefers unused rooms. It picks an Echo only when no unused room fits.
4. **Capacity check:** the total capacity on the floor must be ≥ P + 2. If it isn't, raise A's cap (the A room always supports 8).
5. **Omens** (sigils on the plaque, §3.5.1):
   - Floor 1: 0.
   - Floor 2: 30% chance of 1.
   - Floor 3: 1.
   - Floor 4: 1, or 2 with 50% chance.
   - Echo rooms get +1 more.
   - The same Omen never appears twice on one door.
6. **Ring order.** Doors sit on the Landing ring in the order A, B/C/D…, E, so that **A and E are always neighbours and share a Grate**: the loud room and the lonely room. The ring wraps.
7. **X alcove:** 35% chance per Landing on Landings 2–4. It is placed but stays invisible until someone reveals it.

**Room floor bands (12 rooms):**

| Room id | Letter | Floors | Tier at first floor of band |
|---|---|---|---|
| `golem_belfry` | A | 1–2 | 1 |
| `harmony_sentinel` | A | 2–3 | 2 |
| `karmic_executioner` | A | 3–4 | 3 |
| `whispering_library` | B | 1–2 | 1 |
| `liars_banquet` | B | 2–4 | 2 |
| `fuse_tether` | C | 1–2 | 1 |
| `drip_chimney` | C | 2–4 | 2 |
| `weighing_hall` | D | 2–3 | 2 |
| `weight_of_guilt` | D | 3–4 | 3 |
| `mimics_toll` | D | 3–4 | 3 |
| `clockwork_foundry` | E | 1–3 | 1 |
| `glitched_watcher` | E | 2–4 | 2 |

**Tier** is the number the room uses to scale itself: `tier = floor − bandStart + 1`, +1 for an Echo. Each room lists what tier changes. The default rule is timer −6% per tier above 1 and monster speed +8% per tier above 1.

**Room-count check.**
- The run has 16 door slots at most (4 floors × 4 doors) and 12 rooms. The Echo rule covers the gap without breaking any band.
- A needs 4 slots and has 3 rooms. E needs 4 and has 2. The B/C/D slots need 8 and have 7 rooms. Each shortfall is covered by at most 2 Echoes per letter.

```text
generateFloor(seed, floor, P, used):
  letters = floor==1 ? (P>=5 ? [A,B,C,E] : [A,B,E])
                     : [A, E] + drawWeighted({B:30,C:30,D:40}, P>=5 ? 2 : 1, forceD = floor==3 && !usedLetter(D))
  for L in letters:
    candidates = rooms(L).filter(r => band(r).includes(floor) && !used.has(r))
    if empty: candidates = rooms(L).filter(r => used.has(r) && used.get(r).floor < floor)   // Echo
    room = rng.pick(candidates); omens = rollOmens(floor, isEcho, excluding used.get(room)?.omens)
  arrange ring so A and E adjacent; ensure capSum >= P + 2
```

#### 3.5.1 Omens (plaque sigils; each room def declares which Omens it supports)

| Omen | Sigil | Effect |
|---|---|---|
| **Heavy Air** | downward chevron | Gravity ×1.25; jump height −15% |
| **Frayed** | torn thread | Tethers, ropes and Pact Cinch are weaker: segments snap at 70% of normal load; Snip channel 0.8 s |
| **Hushed** | closed lips | No quick-chat or pings inside (emotes only) |
| **Lantern-dark** | eclipsed moon | Ambient light 0; fog to 10 m; only flames light the room |
| **Tithed** | coin with a notch | Embers ×0.5; the Shared Altar shows +1 card |
| **Doubled** | two overlapping circles | Monster scale ×1.4 and speed ×1.15; Embers ×1.5 |

### 3.6 The Door Draft (physical)
- **Camera.** At Draft start the camera eases (0.6 s) to the **Draft Cam**: top-down at 40 m, 70° tilt, FOV 45°, framing the ring. **V** toggles between Draft Cam and third-person.
- **Plates.**
  - Each door has a plate in front of it with **N glowing spots**, where N = the room's cap.
  - Spots are 0.9 m discs on a 2.2 m-radius arc in front of the door, spaced 1.1 m apart.
  - A free spot glows the letter colour. An occupied spot glows the occupant's flame colour and adds their name to the plaque roster. **Everyone sees everything, live.**
- **Claiming.** Stand on a free spot for **0.5 s**. Stepping off frees it at once. You may switch as often as you like.
- **Calm (T−45 s to T−10 s).** Someone standing on a spot is **Planted**: a shove only plays a bump animation.
- **Stampede (T−10 s to T−0).** A bell tolls and the System shows `[ STAMPEDE ]`. Spots turn slick, shoves work normally (6 m/s impulse), and being pushed off a spot frees it.
- **What the plaque shows:**
  - designation and room name (carved);
  - capacity dots;
  - reward-rule icon (SPLIT / FINISH / SOLE);
  - Omen sigils;
  - the **Codex hint** line (if you have Seen the room);
  - the 2 most recent **Notes** with their stamps (§7.7);
  - the redacted Clear Condition (at your study level).
- **At T−0 the spots lock.** Anyone without a spot is pulled by the **Draft wind** (6 m/s) onto the door with the most free spots, with ties going to A.
- **Latch (6 s).**
  - The doors swing open and each claimed climber walks through their own door. Anyone who hasn't entered when the Latch ends is pulled in.
  - **Hold the Door:** a climber **Bracing inside a door frame** keeps that door open for up to **+8 s**, at a cost of 2 wax/s.
  - While a door is held, **any** climber may run through it:
    - if it has a free spot, or
    - as the one allowed "**Door Ajar**" entrant above its cap.
    Doing so frees the spot they left on their own plate.
  - Any climber may **shove the holder out of the frame**, which slams the door instantly. If another climber was within 3 m of the frame when it slammed, the Ledger logs a **Slam** (not a Knife), and that climber is pulled into their claimed door.
- **Doors never fizzle.** Every room has 1-player tuning. A door nobody claimed seals empty.
- **Bots** walk to plates at human-like times (§8.3).

### 3.7 Instances: live rooms and the Ghost Sim
- **Live instance.** A sealed door with **at least one human** inside becomes an authoritative simulation instance: 30 Hz tick, 20 Hz snapshots (§16). One Node process hosts every instance in a lobby. Solo runs the same simulation in a Web Worker.
- **Ghost Sim.** A door holding **only Rivals** is resolved abstractly:
  1. At Latch the server rolls a **ghost timeline**: for each room phase, a success roll with probability *p* (formula in §8.6), a duration, and events. Events include wax loss, Snuffs, Knives ("Vex chuted Pip in 2D"), trait picks, key drops and Hidden Pieces.
  2. The timeline plays out on the room clock. It writes the same Ledger events and updates each bot's wax, traits, keys and grudges.
  3. This keeps the whole tower alive in solo for the cost of **one** live room.
- **Takeover.** When a human enters a ghost room (as a Side Door Visitor), the room becomes live at that instant. It is built from the ghost state (who's alive, their wax, the time left, the phase checkpoint) by calling the room's `fromGhostState(phase, progress)`.

### 3.8 How climbers meet
- **Grates.** Neighbouring doors on the ring share a **Grate**: a 3 × 2 m barred window set into a side wall of each room (every room def declares one `grateAnchor`).
  - **Seeing through.** You see the neighbour room through it. It renders the other instance's entities within 8 m of its grate from a 10 Hz feed. Through a ghost room's grate you see a darkened silhouette diorama with bots walking to scripted grate spots.
  - **Passing items.** Pass one item (≤ 3 kg) every **20 s** through the slot.
  - **Dripping.** Drip wax to a climber standing within 2 m on the other side (5 wax per tap).
  - **Talking.** Quick-chat and pings pass through.
  - **Pact threads** run straight through the bars.
  - **Bodies never pass.**
  - **Solo scripting.** A ghost-room bot visits the grate every 45–75 s. Based on its Trust in you (§8.5) it offers a Drip, passes an item, gossips (context phrase) or taunts.
- **Side Doors.** After your room clears, the Exit Vestibule offers the **Stair** or a **Side Door**.
  - **Who can use them.** The Side Door lists every uncleared room on this floor with more than 60 s left and fewer than 2 Visitors.
  - **Entering.** You enter as a **Visitor** at the room's Visitor Gate, keeping your traits and wax.
  - **Scaling.** Room scaling is locked at seal and Visitors don't change it. The one exception is physical things: plates and scales count your weight.
  - **What a Visitor can earn:**
    - If the room clears, the Visitor gets **50% of a normal share**, paid by the Tower (not taken from the other climbers), plus a **Guide** Ledger credit (Trust +15 with every bot in the room).
    - A Visitor may instead *hunt*. Knives by Visitors count normally.
- **Stair.** Going up first gives first access to the Anvil, the Chandler and Keyholes. The first climber to reach a Landing gets **+5 Embers** ("First Up").
- **Keyholes.** The Landing's stairwell rim (the well you climbed out of) carries a **Keyhole Rail**: one brass keyhole for each room still running on the floor below, with its letter engraved above it.
  - Look through a keyhole (hold E) to spectate: live rooms stream at 5 Hz; ghost rooms show a shadow-puppet panel with event captions.
  - You can also bet on the outcome (§7.8).
- **Reunion beat.** When a group arrives at a Landing where others are waiting:
  - a chime plays and a banner slides in: *"VEX, from 2D, carrying a Brass Key"*;
  - each bot may bark a **context phrase** about a waiting climber (§7.9): *"You. You left me on the scale."*

### 3.9 Solo vs multiplayer (the same systems)

| | Solo | Multiplayer (2–8 humans) |
|---|---|---|
| Seats | 1 human + 7 Rivals | Humans + Rivals up to the slot count (4–8) |
| Simulation | Web Worker, in-memory transport | Node `ws` server, authoritative |
| Live rooms | 1 at a time (plus any Side Door takeover) | One per door that holds a human (≤ 4) |
| Ghost Sim | Every bot-only room | Every bot-only room |
| Drama Director | On (§8.7) | Off by default; lobby option |
| Masked Bots | n/a | Lobby option: hides bot badges; bots use the same names style and vocabulary as humans |
| Betrayal setting | Full | Lobby: **Off / Physical / Full** (§7.10) |

---

## 4. Controls and moment-to-moment verbs

### 4.1 Bindings (keyboard + mouse first; gamepad is SHOULD)

| Verb | Keyboard/Mouse | Gamepad (SHOULD) | Notes |
|---|---|---|---|
| Move | W A S D | Left stick | Hop-waddle |
| Camera | Mouse | Right stick | Sensitivity in Settings |
| Jump / mantle | Space | A / Cross | Auto-mantle ≤ 1.3 m |
| Dive | Left Ctrl | B / Circle | Belly-flop lunge; you can grab mid-dive |
| Brace (hold) | Left Shift | LB / L1 | Anchor; Hold the Door |
| Grab / grip / carry (hold) | Left Mouse | RT / R2 | Release to drop or let go |
| Shove (tap, empty-handed) · Throw (hold to charge, while carrying) | Right Mouse | LT / L2 | |
| Interact (tap or hold channel) | E | X / Square | Levers, valves, dials, drink, Relight, doors |
| Brighten (hold) | F | RB / R1 | 1 wax/s |
| Dim (toggle) | Q | D-pad Up | |
| Drip (tap on an ally ≤ 2 m, or at a Grate) | R | Y / Triangle | 5 wax per tap |
| Traits 1–4 | 1 2 3 4 | D-pad Left/Right cycle + R3 use | Only active traits bind |
| Knot: offer / accept / Cinch (hold) | G | Hold Y + A | See §7.2 |
| Cut (hold 1.2 s) | X | Hold Y + B | Snip a tether/rope segment, or cut a Pact |
| Ping (tap / double-tap / hold for radial) | Middle Mouse or Z | R3 | |
| Quick-chat wheel (hold) | T | D-pad Down (hold) | 24 phrases + 4 context phrases |
| Emote wheel (hold) | B | D-pad Down double-tap | 8 equipped emotes |
| Ledger overlay | Tab | View / Select | Floor map, Pacts, Knives, Soot |
| Shoulder swap | C | L3 | |
| Draft Cam toggle | V | — | Door Draft only |
| Ready (Landing) | Enter | Start (hold) | |
| Pause / Settings | Esc | Menu | |

Every hold action can be switched to a toggle in Settings for accessibility (§14.4).

### 4.2 Movement numbers
- **Ground movement:**
  - Run speed 5.0 m/s. Acceleration 30 m/s², deceleration 40 m/s².
  - Turn rate 720°/s.
  - Air control 40%.
  - There is no sprint key.
- **Jump:**
  - Apex 1.4 m (vy₀ 5.3 m/s), game gravity 20 m/s².
  - Coyote time 120 ms, jump buffer 100 ms.
  - There is no double jump.
- **Mantle.** Jumping into a ledge ≤ 1.3 m above your feet auto-mantles in 0.35 s.
- **Dive (Ctrl):**
  - Launches at 7 m/s horizontal + 2 m/s up, belly-slides for 0.5 s, then takes 0.35 s to recover. Cooldown 1.0 s.
  - Grab is active during the whole dive. **Dive-catch** is the main way to save a Trust Fall.
- **Brace (Shift):**
  - Mass ×4 for tether and rope solving. Shoves against you are reduced to 25%.
  - You can't move or jump while bracing. It costs no wax, except when holding a door (2 wax/s).
- **Grab (LMB hold):**
  - Takes the nearest grabbable thing in a 1.6 m, 60° cone: props, climbers, Smoke Holders, ropes, climbing holds.
  - **Carry speeds:** objects ≤ 20 kg at full speed; 20–60 kg at −40%; over 60 kg can only be dragged at 1 m/s; carrying a climber at −40%.
  - A carried climber escapes by pressing Jump 6 times within 2 s.
- **Throw (RMB hold while carrying):**
  - Charge time 0–0.8 s maps linearly to 5–14 m/s. The arc follows the camera ray, and a dotted arc preview appears after 0.15 s of charge.
  - Thrown climbers fly at ×0.7 speed.
- **Shove (RMB tap, empty-handed):**
  - 0.2 s windup (hands pull back), then a 1.4 m range cone of 50°.
  - Impulse 6 m/s horizontal + 1.5 m/s up. 60 ms hitstop on both climbers. Cooldown 1.2 s.
  - A shove does no damage by itself.

### 4.3 Flame verbs
- **Brighten (F hold):**
  - Light radius goes from 6 m to 14 m.
  - You can read **wax-script** (hint text on walls) within 6 m.
  - Costs 1 wax/s. Your **brightness rating** goes up by +3; light-seekers track this rating (Snuffer, Executioner, Chrono-Slime).
- **Dim (Q toggle):**
  - Your flame drops to an ember and light radius to 2 m.
  - Light-seekers can't target you beyond 4 m.
  - Reveals **shadow-glyphs** within 4 m. Move speed −20%. No wax cost.
- **Brightness rating** (used for targeting): base 1; Brighten +3; Dim −1 (untargetable beyond 4 m); Notorious (3 Soot) +2; Branded +1; Unremarkable −3.
- **Drip (R tap):** give 5 wax per tap (0.25 s per tap) to an ally within 2 m or across a Grate. You can't Drip yourself below 10 wax.
- **Relight (hold E for 2 s on a Snuffed climber's Holder):**
  - Costs the reliever 20 wax: 10 for a Pact partner, and halved for a Lamplighter (the two stack to 5).
  - The target returns with 30 wax.

### 4.4 Social verbs
- **Knot (G).**
  - Face a climber within 3 m and hold G. If they also start holding G within 3 s, the knot ties after 1.5 s of both holding.
  - Bots decide whether to accept (§8.5).
  - See §7.2.
- **Cut (X hold, 1.2 s).** You can cut:
  - your own Pact thread (from anywhere);
  - a tether segment attached to you (1C);
  - an anchored rope (2C).

  While you channel:
  - a **blade glint** appears at your nub hand, visible from 25 m;
  - a rising "shhhk" note plays;
  - the target thread or segment flashes crimson `#FF3D6E`.

  **Cinch (the counter).** The climber on the other end holds G (for a Pact, when within 8 m), or grabs the segment or rope (LMB within 1.5 m of their end). If they are still holding when the channel reaches 1.2 s, the cut **fails**, the cutter is stunned for 1 s, and Cut goes on a 5 s cooldown. Cinching costs the cinch-holder 2 wax/s.
- **Ping.** Tap Middle Mouse or Z = **Look** (white marker, 6 s). Double-tap = **Danger** (red). Hold = radial: **Here, Go, Wait, Help, Key, Liar!**
- **Quick-chat and emotes:** see §7.9.

### 4.5 Flame emotions (automatic, and part of the readability contract)

| State | Trigger | Flame shape |
|---|---|---|
| Calm | default | Tall teardrop, gentle 1.2 Hz sway |
| Joy | clear, catch, receiving a gift, Pact tied | Height ×1.3, bounces, sparks |
| Fear | wax < 25, or a monster within 4 m | Height ×0.7, gutters at 6 Hz |
| Anger | shoved, cut, or a Knife against you | Forks into two tongues for 2 s |
| **Resolve (the tell)** | shown for **1.5 s before any bot Knife**, and throughout any human or bot Cut channel | Forks, leans toward the target, colour shifts 15% toward crimson |
| Sad | a Pact partner Snuffed or Burnt Out | Droops to one side, tinted 20% blue |
| Notorious | Soot = 3 | Burns violet `#7A4FD8` and is outlined through walls |

---

## 5. Health, falling, death, timers, scoring

### 5.1 Wax (HP)
- **Max wax** is 100, modified by Origin (§9.5) and curses.
- **Body shrink:**
  - body height = `0.72 m × (0.55 + 0.45 × wax/maxWax)`;
  - body radius = `0.28 m × (0.85 + 0.15 × wax/maxWax)`.
  - The flame, holder, hands and hitbox **do not change**, which keeps readability and fairness intact. The hitbox is a 0.32 m-radius capsule, 1.1 m tall.
- **Drips.** At every 10 wax lost, a wax drip particle falls and leaves a floor decal that fades over 20 s.

### 5.2 Damage and healing (canonical table)

| Source | Wax |
|---|---|
| Monster swipe / swing | per room, 8–25 |
| Landing from > 6 m | −(h − 6) × 3, max −30 |
| Void fall | −15; respawn at the room checkpoint after 1.5 s |
| Fuse flame passing your tie point outside the Alcove (1C) | −20 |
| Poison (2B) / Toll shockwave (1A) | −30 / −15 |
| Ambient burn | Floor 1: 0; floor 2: 1 wax/min; floor 3: 2; floor 4: 3; floor 5: 0 |
| Brighten | −1 wax/s |
| Healing: Drip | +5 per tap from an ally |
| Healing: arriving at a Landing lit | +20 (not above max) |
| Healing: Relight Font | +25 wax for 10 Embers, at most 2 per Landing |
| Heartcandle (item) | self-Relight to 40 wax, or +40 wax if lit |

### 5.3 Snuffed, Smoke, Burnt Out, Scorched
- **Snuffed.** Wax reaches 0.
  - Your flame goes out with a smoke puff and your body melts to a **Holder** puddle where you fell. The puddle is the Relight point.
  - You become **Smoke**: a drifting wisp that moves at 3 m/s and passes through props but not walls.
- **What Smoke can do:**
  - ping, and send quick-chat phrases only (no context phrases);
  - **Haunt**: nudge an object ≤ 5 kg once every 10 s;
  - watch.

  Smoke doesn't count for Clear Conditions, and monsters can't target it.
- **Relight** (§4.3) brings you back at 30 wax, at your Holder.
- **If your room clears while you are Smoke:**
  - you still clear, but at **50% of a share**;
  - you arrive at the next Landing as Smoke;
  - the **Relight Font** relights you for **30 Embers**, paid by you or by any Pact partner (hold E at the Font);
  - **Birthday Candle** Origins relight themselves once per floor, and a **Martyr's Mark** gives one free relight.
- **Burnt Out.** A Smoke climber who reaches the end of the Intermission without being relit is out of the run. They can still:
  - spectate any live room (Keyhole view);
  - play minigames (winnings go to the Ledger score only);
  - pin Notes, and make Keyhole bets with Embers they still hold.

  They can't vote. In solo, the human being Burnt Out ends the run: the Ledger shows *"The tower goes on without you."*
- **Scorched.** A room's timer expired with you inside.
  - You are ejected to the next Landing with −25% max wax for the next floor and no room reward.
  - You gain a **Regression Scar** for that room (§6.0.3).
  - Failing a room never ends your run by itself.

### 5.4 Global timers (defaults)

| Timer | Value |
|---|---|
| Foot warm-up (floor 1 Landing) | 60 s |
| Intermission after floor close | 45 s (+15 s Tribunal); ends early on all-Ready |
| Door Draft | 45 s, with the Stampede in the last 10 s |
| Latch | 6 s, + up to 8 s with Hold the Door |
| Reveal orbit | 2.2 s |
| Shared Altar | 15 s |
| Tide | 2:30, then Pressure (timers ×1.5 speed, fog 12 m) |
| Room timers | per room, 3:30–5:30 at tier 1; −6% per tier |
| Crown (boss) | 9:00 total cap |

### 5.5 Scoring
- **Embers** are the in-run score and currency.
- **At run end, the Ledger converts them to Drips** (§11.4) and hands out **awards**:
  - Most Relights;
  - Sharpest Knife (most Embers taken by Knives);
  - Honest Wick (most Notes Borne Out);
  - Chute Champion;
  - Last Flame (last lit climber);
  - Doorholder;
  - Clean Hands (0 Knives).
- **There is no global leaderboard in the slice.** Daily Seed leaderboards are LATER.

---

## 6. Room specs (12 rooms + the Crown)

### 6.0 Shared rules for every room

#### 6.0.1 The room component kit (build rooms as data, not bespoke code)
Every room is a `RoomDef` data config (in `src/game/rooms/<id>.ts`) assembled from a shared kit in `src/world/kit/`. A room may add at most **one** bespoke entity script (its monster). Everything else must come from the kit.

| Component | Behaviour (defaults) |
|---|---|
| `Lever` | Hold E 0.5 s to flip; n states; emits `lever:<id>:<state>` |
| `Valve` | Hold E 1.5 s to toggle; linked to 1–3 outputs (e.g. steam jets) |
| `Plate` | Weight threshold (default 50); lit when satisfied |
| `Scale` | Sums the weight of every body and object in its area; exposes `current`, `baseline`, `delta` |
| `Fork` | Pitch plus colour. Rings for `ringTime` when hit by an object ≥ 1 kg at ≥ 4 m/s, or by Resonance |
| `Sconce` | Lit or out; a hit puts it out for `outTime`; relit by touch while lit, or by Firebrand |
| `GazeCone` | Angle, range and dwell time; applies an effect to whoever looks at it (camera-forward test) |
| `NoiseEmitter` | Global noise-event bus. Every impact, shove, landing, ring and ping posts `{pos, loudness}` (§6.0.5) |
| `FuseChain` | Distance constraints between climbers, a burn front and a socket |
| `Rope` | An anchored climbable rope (distance constraint + grab) |
| `Hold` | A climbing grip point; may melt and regrow |
| `Dial` | n rings × m glyphs; submit lever |
| `PrivateText` | A carryable item whose text only the holder sees (books, clue cards) |
| `Drinkable` | A cup or tonic with an effect on drink (hold E 1 s) |
| `Decoy` | A windable clockwork mannequin; a delay of 1–9 s (scroll wheel), then it performs one strike |
| `Chute` | A trapdoor volume; standing on it for 1 s drops you |
| `Pillar` | Topples after k hits, in the direction of the last hit |
| `Bell` | Group countdown: rings 3-2-1-NOW at 1 s intervals on every screen in the room |
| `WaxScript` | Wall text that shows only while Brightened within 6 m |
| `ShadowGlyph` | Wall text that shows only while Dimmed within 4 m (Dimmer: 10 m) |
| `TellDecal` | Chalk lines, painted numbers, footprint trails: the physical tells |
| `Checkpoint`, `KillVolume`, `ExitGate`, `VisitorGate`, `GrateAnchor`, `AltarSpawn`, `HiddenPieceTrigger` | Plumbing |

#### 6.0.2 `RoomDef` contract (TypeScript sketch)
```ts
interface RoomDef {
  id: RoomId; letter: 'A'|'B'|'C'|'D'|'E'; name: string; floors: [number, number];
  cap: [1, number]; timerSec: (tier: number, n: number) => number;
  pool: number; rule: 'SPLIT'|'FINISH'|'SOLE'; bonuses: BonusDef[];
  traitPool: [TraitId, TraitId, TraitId]; omens: OmenId[];
  clear: { decree: RedactedText; hint50: string; plain75: string };
  build(ctx: RoomCtx, n: number, tier: number, omens: OmenId[]): RoomInstance; // spawns kit + monster
  fromGhostState(phase: number, progress: number, survivors: ClimberState[]): RoomInstance;
  ghost: { phases: { name: string; baseP: number; fitTraits: TraitId[]; dur: [number, number] }[] };
  botPlan: BotPlan;                   // roles + goal graphs (§8.4)
  betrayalWindows: BetrayalWindow[];  // when bots may consider a Knife (§8.5)
  hiddenPiece: HiddenPieceDef; codex: { hint: string; full: string };
  system: { enter: string; clear: string; fail: string };
  truth: (result: RoomResult) => NoteTruth; // for checking Notes (§7.7)
}
```
Every room has a `grateAnchor` on its side wall (west if its ring index is odd, east if even), a `visitorGate` and a checkpoint at the entry.

#### 6.0.3 Clear Conditions: redaction, the hint ladder, Regression Scars
- **The Decree.** On entry, the System window types `[ CLEAR CONDITION ]` followed by the room's **Decree**, a riddle-form sentence.
  - Each word marked `{word:r}` has a **reveal rank** r (1–4).
  - The player sees every word with `r ≤ studyLevel + scars`. Other words render as shimmering `███` blocks, one block per character, capped at 5 blocks.
  - `studyLevel` comes from the Codex (§9.8): 0 Unseen, 1 Seen, 2 Survived, 3 Cleared, 4 Cleared Solo.
  - `scars` is the number of Regression Scars on the room, capped at 3.
  - At Cleared, the whole Decree is always shown.
- **Hint ladder** (for everyone in the room, whatever their study level):
  - **Start:** the Decree, as redacted for each viewer.
  - **50% of the timer elapsed:** `[ HINT ]` plus the room's `hint50` line.
  - **75% elapsed:** `[ PLAIN WORDING ]` plus `plain75`, the full solution in one sentence.
- **Regression Scar.** Failing or being Scorched in a room adds 1 Scar (max 3). **SHOULD:** the next time you enter that room, a faint ghost replay of your last 4 s before the failure plays at that spot.
- **Knowledge is asymmetric.** A returning player may see a clean Decree while a newcomer sees ███. They can guide, or they can lie. The System window is private to each viewer and never lies.
- **Readability contract.** Every room has **physical tells** (listed per room) that make it solvable with zero Decree words revealed. Acceptance test: a first-time player clears the room in under 6 minutes (§17).

#### 6.0.4 Reward rules
- **Floor multiplier `fm`:** floor 1 ×1.0, floor 2 ×1.25, floor 3 ×1.5, floor 4 ×1.75. **Omen multiplier `om`:** Tithed ×0.5, Doubled ×1.5.
- **SPLIT.** Total = `pool × fm × om × (1 + 0.15 × (n − 1))`, where n is the number of entrants (not Visitors) who cleared. Each clearer gets total / n, rounded down.
  - A Smoke clearer gets 50% of a share, and the rest is lost.
  - Visitors get 50% of a share, paid by the Tower.
- **FINISH.** Each finisher gets `pool × fm × om`.
- **SOLE** (E rooms). A solo clearer gets `pool × fm × om`. With 2 clearers, the **key-action** climber (defined per room) gets 65% and the other gets 35%.
- **Bonuses** (First Through, Last Note, Tome, etc.) are paid on top of the share.
- **Shared Altar order.** Bonus holders pick first, then everyone else in the order they reached the Altar (§9.2).

#### 6.0.5 Noise model (used by the Golem, the Librarian, the Watcher and bot hearing)

| Event | Loudness (radius in m) |
|---|---|
| Walking (not Dimmed) | 3 |
| Landing from a jump | 5 |
| Dive landing / belly-flop | 7 |
| Shove | 6 |
| Thrown object impact | 8 (×1.5 if ≥ 3 kg) |
| Fork, bell or sconce ring | 12 |
| Ping (Look/Danger) | 10 (Hushed Omen: 0) |
| Stomp emote | 9 |

A listener "hears" an event if its distance is ≤ the loudness. Monsters go toward the loudest event heard in the last 3 s.

---

### 6.1 `golem_belfry` · 1A · **The Belfry of the Echoing Golem**
**A · floors 1–2 · cap 1–8 · timer 5:00 · SPLIT, pool 60 · Omens: Heavy Air, Lantern-dark, Doubled, Hushed**
*Fantasy: "A bell-bodied giant that swallows every punch and rings louder for it."*

**Layout** (the M0 style-lock room)
- **The floor.** A round belfry floor, radius 15 m, with 12 m walls. A decorative gallery ring at 6 m. The entry is at (0, 0, −15).
- **The Resonance Circle.** A gold-painted ring of radius 4 m centred at (0, 0, 0).
- **Four tuning-fork pylons.** Each is a 3.2 m bronze fork on a 0.6 m stone plinth, at radius 10 m: N (0, 0, 10), E (10, 0, 0), W (−10, 0, 0) and S (0, 0, −10).
  - The seed shuffles the pitches **C4, E4, G4** and the trap **B♭4** across these four positions.
  - Fork colours: C `#FF6B6B`, E `#FFD166`, G `#6BE38F`, B♭ `#B388FF`.
  - The B♭ fork has a visibly crooked tine and is 40% desaturated.
- **Chime-stones.** Four wall chutes at NE/SE/SW/NW (radius 14.5 m, height 2 m). A stone (3 kg, radius 0.18 m, bronze) rolls out every 4 s, rotating round the chutes, up to 12 stones at once.
- **The Gallery Bell** hangs at (0, 10, 0).
- **Physical tells:**
  - chalk lines on the floor join the C, E and G plinths into a triangle, each line drawn in its two endpoint colours;
  - a chalk tally "III" next to the entry;
  - every 20 s the Gallery Bell plays the C–E–G arpeggio (0.3 s per note), and each fork flashes as its note plays.

**Entities**
- **The Echoing Golem**, 3.2 m tall at scale 1.0. It is a bronze bell body on two stubby legs, with clapper fists and a glowing crack.
  - **Hum.** A sine drone at its current pitch.
  - **Movement.** 1.6 m/s × (1 + 0.05 × growth steps), toward the loudest noise heard in the last 3 s. Otherwise it wanders.
  - **Swipe.** Triggered when a climber is within 2.5 m × scale. Telegraph 0.6 s: an arm rises and the hum climbs a fifth. Then a 120° arc: −10 wax and 8 m/s knockback.
- **Growth.** Every direct impact (a thrown object hits it, a climber is shoved into it, or a climber shoves it) adds:
  - +10% scale and +5% speed;
  - a **mote in the culprit's flame colour** that drifts into it and keeps orbiting. This is the evidence.
- **Toll.** At scale ≥ 2.0, every further impact triggers a Toll: a 12 m shockwave that costs −15 wax and knocks back at 6 m/s.

**Rules**
- **Forks.** A fork rings for `ringTime` (see the scaling table) when a stone (≥ 1 kg at ≥ 4 m/s) hits within 0.5 m of its tines, or when a Resonance hum reaches it.
- **Chord.** At some instant, **C, E and G are all ringing**, the Golem's centre is inside the Resonance Circle, and **B♭ is not ringing**. Then:
  - three coloured beams converge on the Golem;
  - it cracks (+1 crack), shrinks to max(0.6, scale × 0.6), and staggers for 3 s.
- **Dissonance.** If B♭ is ringing at the moment a chord would land, the Golem grows +20% and gains no crack.

**Clear Condition**
- Decree: `[ CLEAR CONDITION ] Let it {hear:1} {itself:2}, {three:2} {times:3}. The {crooked:4} {one:4} {lies:4}.`
- Hint (50%): *"The chalk lines show which forks belong together."*
- Plain (75%): *"Ring the C, E and G forks together while the Golem stands inside the gold circle, three times. Never ring the crooked fork."*
- **CLEAR:** 3 cracks. The Golem shatters into a shower of small bells.
- **FAIL:** the timer runs out, or the Golem reaches scale 2.5 (the belfry floor caves in). Everyone is Scorched.

**Scaling**

| n | ringTime | Chute interval | Golem speed | Notes |
|---|---|---|---|---|
| 1 | 4.0 s | 3 s | ×0.8 | Lure by stomping, then juggle three throws |
| 2–3 | 3.0 s | 4 s | ×1.0 | |
| 4–5 | 2.5 s | 4 s | ×1.0 | The crowd is the real enemy: stray impacts |
| 6–8 | 2.5 s | 2 chutes per interval | ×1.0; swipe radius ×1.2 | |

Tier 2: ringTime −0.4 s, and the Golem starts at scale 1.2.

**Betrayal hooks**
- **Feed the Golem.** The motes point to the culprit.
- **A last-second B♭ throw.**
- **Last Note.** Whichever climber's throw completes the **third** chord (the last of C/E/G to start ringing) takes the **Clapper Heart**: +15 Embers and first pick at the Altar. People snipe that final throw.
- **Bot betrayal windows:** chord attempts 2 and 3. Snipe needs Greed > 60. Throwing B♭ counts as Spite toward a target who holds the Clapper-Heart lead.

**Bot script (roles are assigned at room start)**
- **Caller:** Brother Brass if present, otherwise the highest-Nerve bot. When the Golem is in the Circle and every thrower is ready, it quick-chats "On three." and counts 3-2-1-NOW, one beat per second.
- **Lure:** the next-highest Nerve. When the Golem is outside the Circle, it stands at the Circle edge opposite the Golem and stomps or pings until the Golem enters, then backs off 6 m.
- **Throwers C/E/G:** the nearest bots, or they fill in around the human. Each fetches a stone, stands on the chalk line 5 m from its fork, and throws on NOW with timing jitter N(0, 0.1 + (100 − Wit)/500) s.
- **Runner:** any spare bot. Carries stones to throwers who have none.
- **Quirks:**
  - Pip misses 20% of throws.
  - Kestrel lobs a stone at the Golem early 25% of the time (a comedic, readable mistake).
  - A greedy bot's tell is loitering beside the fork most likely to ring last.

**Rewards:** SPLIT 60. Clapper Heart bonus. Trait pool: **Resonance, Echo Wick, Lead Wick**.
**Hidden Piece, "Untouched":** clear with **zero motes** (no direct impact on the Golem all room). Reward: a Brass Key and the permanent title *Golem Singer*.
**Codex hint:** *"It is deaf to fists. It is not deaf to harmony."*
**Codex full:** *"Cast from the bell that rang when the first candle went out. Every blow feeds it; every wrong note heals it. Ring C, E and G together while it stands in the gold circle, three times, and it remembers it is only a bell. Leave the crooked fork alone. Whoever lands the final note keeps its clapper."*
**System:**
- Enter: `[ DOOR 1A · THE BELFRY OF THE ECHOING GOLEM ] It is hungry for noise.`
- Clear: `[ CLEARED ] The bell is cracked. The silence is yours.`
- Fail: `[ FAILED ] The floor could not hold its appetite.`

---

### 6.2 `whispering_library` · 1B · **The Whispering Library** (pure puzzle)
**B · floors 1–2 · cap 1–4 · timer 4:30 (solo 5:30) · SPLIT, pool 45 · Omens: Hushed, Lantern-dark, Tithed**
*Fantasy: "Every book whispers only to the Wick holding it, and two of them are liars."*

**Layout**
- **The hall.** 18 m (x) × 26 m (z), with 9 m walls.
- **Galleries.** A gallery tier at 3.5 m runs along the east and west walls (2.5 m deep), reached by ladders at (±7.5, 0, −6). A 0.3 m-wide **Moth Beam** crosses the room at (x −9..9, y 4.5, z 8).
- **10 books.** Each weighs 1.5 kg and sits on a reading stand or shelf.
  - Ground floor: (−5, 0, −8), (4, 0, −9), (−7, 0, 0), (6, 0, 1), (−3, 0, 4), (3, 0, 12).
  - Galleries: (−8, 3.5, −2), (−8, 3.5, 10), (8, 3.5, −4), (8, 3.5, 9).
- **The Lectern** at (0, 0, 6) carries the **Glyph Dial**: 4 brass rings, each with 8 glyphs (Eye, Key, Moth, Bell, Crown, Knot, Tear, Star).
  - Interacting with a ring opens a radial picker (0.3 s).
  - The submit lever needs a 1 s hold.
- **The Librarian**, a 4 m moth-headed figure, hangs asleep at (0, 6.5, 8). The **Moth Ledger** is tucked in its folded arms at y 5.5.
- **Physical tells:**
  - **Liar books** have lilac page edges `#C9B7E8` (true books: cream `#EFE3CF`) and a cracked wax seal on the spine. You can see this within 1.5 m, or within 6 m while Brightened.
  - The Librarian's antennae twitch once per point of noise.

**Rules**
- **Reading.**
  - Carry at most 2 books (one per nub hand).
  - Holding a book for 1 s shows its clue in a private margin window and adds it to your personal **Clue Log** (Tab).
  - **Handing a book over is proof**: the receiver reads the real text.
  - **Describing a book is not proof.** B rooms add a **Clue Composer** to the quick-chat wheel (template + glyphs). It posts a speech bubble tagged *"said"*, and it can lie.
- **The code** is 4 different glyphs (8P4 = 1680 candidates).
  - **Generator:** add random true clues until exactly one candidate remains, then drop redundant clues, aiming for 8. Then write 2 **Liar** clues that are false for the real code but true for at least one other candidate.
  - **Clue templates:**
    - "The {G} sits in ring {k}."
    - "The {G} is not used."
    - "The {G1} comes before the {G2}."
    - "The {G1} sits directly after the {G2}."
    - "Ring {k} holds neither the {G1} nor the {G2}."
    - "The {G} sits in an even ring."
- **Noise meter.** Shared by the room, 0–3.
  - Each of these adds 1: a thrown object, a shove, a book dropped from > 1 m, a jump landing within 6 m of the Librarian.
  - Running within 5 m of the Librarian adds 0.2/s.
  - The meter decays by 1 every 10 s.
  - At 3 the Librarian wakes for 20 s:
    - it drifts at 2.5 m/s toward the loudest climber;
    - its touch costs −20 wax and makes you drop every book;
    - its wing dust mutes quick-chat within 5 m (pings still work).
  - Afterwards it goes back to sleep and the meter resets.
- **A wrong code** wakes the Librarian at once. **The third wrong code** burns the room.

**Clear Condition**
- Decree: `[ CLEAR CONDITION ] Turn the {dial:1} to what {eight:2} {books:1} {agree:2} on. {Ignore:3} the {lilac:4} {ones:4}.`
- Hint (50%): *"Some books lie. Look closely at their edges."*
- Plain (75%): *"The two books with lilac page edges lie. The other eight together name exactly one code. Dial it and pull the lever."*
- **CLEAR:** the correct code is submitted.
- **FAIL:** 3 wrong codes, or the timer runs out.

**Scaling**
- Every n uses the same 10 books.
- **Solo:** timer 5:30, and the Librarian's wake threshold is 4.
- **Tier 2:** 12 books, 3 liars, and a fifth ring on the dial.

**Betrayal hooks**
- **The Tome.** Whoever pulls the correct lever gets +15 Embers and first Altar pick, and *Language of Wax* is guaranteed to be among the Altar cards. So: hoard your clue, let the others share theirs, and dial alone.
- **Lying through the Clue Composer.**
- **Waking the Librarian** on purpose next to a rival.

**Bot script**
- **Reader:** everyone. Go to the nearest unread book (moving quietly: no jumps within 6 m of the Librarian), read it, and add the clue to the bot's own known-clue set. Bots know only the clues they have read or been handed. Clues that were only *said* are weighted by Trust.
- **Sharer:**
  - A bot posts each of its clues through the Composer with probability Honesty/100. Otherwise it flips one glyph.
  - It hands books to anyone with Trust ≥ 30, provided its Honesty ≥ 60.
- **Solver:** runs constraint propagation over its known clues. When exactly one candidate remains, it walks to the Lectern.
  - Pell announces "I have a clue." and then "Follow me."
  - A greedy bot says nothing and races. Its tell is drifting toward the Lectern while the others read.
- **Maud** lies exactly once per room.

**Rewards:** SPLIT 45. Tome bonus. Trait pool: **Language of Wax, Insight, Unremarkable**.
**Hidden Piece, "Quiet Hands":**
- Walk the Moth Beam, jump-grab the Moth Ledger from the sleeping Librarian's arms, and hold E for 2 s. The steal adds +1 noise, and each landing on the beam adds +1.
- Reward: the Ledger shows the code (to you only), plus a **Black Key** and the permanent title *Quiet Hands*.

**Codex hint:** *"Check the paper, not the words."*
**Codex full:** *"Ten books, one code. Eight tell the truth; the two with lilac edges and cracked seals lie. Read quietly, because the Librarian wakes at the third noise. Whoever turns the dial takes the Tome, so ask yourself who is still sharing."*
**System:**
- Enter: `[ DOOR 1B · THE WHISPERING LIBRARY ] Quiet, please. Some of these books are lying.`
- Clear: `[ CLEARED ] The Tome opens for {dialer}.`
- Fail: `[ FAILED ] Your borrowing privileges have been burned.`

---

### 6.3 `fuse_tether` · 1C · **The Fuse Tether** (the Chained Together fantasy)
**C · floors 1–2 · cap 1–4 (solo gets the Ballast Doll) · timer 5:00 · SPLIT, pool 50 · Omens: Frayed, Heavy Air, Lantern-dark**
*Fantasy: "You're tied together by a lit fuse. Run from the flame, then wait for it."*

**Layout**
- **The path.** 110 m long over the cloud void (the kill volume is 30 m below the path), 3–5 m wide, rising 12 m in total. There is a checkpoint at the start of each section.
- **Start.** The **Powder Keg** and the Lead spool, at (0, 0, 0) in path space.
- **S1 Cog Bridge (0–30 m):** three rotating cog platforms (radius 3 m, 0.5 rad/s, alternating direction) with 1.5 m gaps.
- **S2 Swinging Lamps (30–55 m):** four 2 m lamp discs, 5 m apart, swinging ±2.5 m sideways with a 4 s period, each offset by a quarter-cycle.
- **S3 Crumble Stair (55–85 m):** 12 steps rising 6 m. Each tile drops 1.5 s after first contact and respawns after 8 s.
- **S4 Gust Ledge (85–105 m):** a 1.5 m ledge with 2 gust vents. Each fires a 4 m/s sideways push every 7 s, with a 1 s warning fog streak.
- **The End (105–110 m):**
  - the **Powder Door** (4 m wide, 5 m tall);
  - the **Fireproof Alcove**, a 4 × 4 m brass-lined niche to its right, with the **Fuse Socket** set inside it;
  - the **Wicket**, a 1 m door to the left of the Powder Door, sealed with a wax lock.
- **Physical tells:**
  - the Alcove's brass glows the moment a fuse end comes within 10 m;
  - a painted mural above the door shows candles huddled in a niche while a spark climbs a rope toward them.

**Entities and rules**
- **The tether.**
  - Climbers are tied in plate order with **4 m fuse segments**. These are distance constraints with slack allowed, not rigid rods.
  - The **front** climber carries the **Fuse End** clip.
  - The **rear** climber is tied to the **Lead**. The Lead unspools from the Keg and has no constraint; it only marks the burn path.
- **The Flame.**
  - Lights at 0:20 and follows the rear climber's recorded path (a polyline sampled every 0.25 s) at **0.7 m/s**: tier 2 0.8 m/s, solo 0.55 m/s.
  - When it catches the rear tie point, it continues **up the chain at the same speed**.
  - Every tie point it passes outside the Alcove costs that climber **−20 wax**. The segment scorches but holds.
  - If it reaches a Fuse End that isn't in the socket, it fizzles. The Keg relights and a new Flame starts from the Keg 5 s later.
- **Falls.**
  - A climber over an edge dangles on their segment.
  - **Slide rule:** the chain slides toward the edge at `1.5 m/s × danglers − 2.0 m/s × bracers on solid ground`, never below 0.
  - If every climber ends up dangling, the group resets to the last checkpoint at −15 wax each, and the Flame keeps coming.
  - A dangler climbs their segment at 1.2 m/s (hold LMB + W). A braced teammate can **Reel** (Brace + LMB on the segment) at 1.5 m/s.
- **Untie.** Consensual and not a Knife: both ends stand on solid ground and both hold E for 1 s on the segment.
- **Snip.** A Knife (§4.4): a 1.2 s Cut on your front or rear segment. The other end can Cinch.
  - The chain splits.
  - The part still connected to the Lead stays **live**, and its new front climber automatically gets a Fuse End clip.
  - The other part becomes **Unbound**.
- **The Wicket.** An Unbound climber can Brighten and hold E for 6 s to melt its wax lock and pass through. **It takes exactly one Wick**, then seals forever.

**Clear Condition**
- Decree: `[ CLEAR CONDITION ] Bring the {fuse:1} to the {door:1}. Then {wait:3} for the {flame:2}, in {brass:4}.`
- Hint (50%): *"The flame opens the door. The brass alcove does not burn."*
- Plain (75%): *"Plug the front of the fuse into the socket, everyone still tied stands in the brass alcove, and let the flame burn up the fuse to the socket."*
- **CLEAR:** the Flame reaches the plugged-in Fuse Socket (the front climber inside the Alcove holds E for 1 s to plug in).
  - The Powder Door blasts open. Every climber on the live chain clears.
  - Unbound climbers who walk through within 10 s clear at half share.
  - The Wicket climber clears on passing through.
- **FAIL:** the timer runs out, or every climber on the live chain is Snuffed.

**Scaling**
- **n = 1:** tied to the **Ballast Doll**, a 50 kg wax dummy that ragdolls. It can be dragged, or thrown 4 m. Flame 0.55 m/s.
  - Cutting the Doll is not a Knife, but it makes you Unbound: you must use the Wicket, and the reward is ×0.5.
- **n = 2–4:** as written. At n = 4 the Alcove is exactly full: 4 m, 4 Wicks.

**Betrayal hooks**
- **Snip and run for the Wicket:**
  - **First Through:** +20 Embers, first Altar pick, and a full share as well.
  - Everyone behind you loses an anchor.
- **Refusing to Brace.**
- **Dawdling at the back** so the Flame bites your rear partner.
- **Bot betrayal window:** opens when the bot is within 15 m of the Wicket and isn't the front climber, or after it has been dragged back to a checkpoint twice.

**Bot script**
- Follow the authored path graph (section waypoints, and jump nodes with timing windows for the cogs and lamps). Keep segments near 3.2 m.
- **When a partner falls:** Brace after a 0.3–0.6 s reaction if Trust ≥ 40 or Loyalty ≥ 70. Otherwise brace late (1.2 s) half the time. Reel whenever braced with a dangler attached.
- **At the End:** the front bot plugs in, and the others go into the Alcove.
- **Moss** calls "Brace!" on every fall.
- **Snip tell:** the 1.5 s Resolve flame, a glance back at the rope, and the babble dropping a fourth in pitch.

**Audio signature (graft).** Every segment is a Karplus-Strong string. Its pitch comes from its tension, quantized to **D Dorian**. A slack segment is silent, and a segment is re-plucked whenever its tension changes by more than 20%. A group moving together plays a chord. A Snip plays a downward pitch-bend, a noise burst and a tritone.

**Rewards:** SPLIT 50. First Through (the Wicket). Trait pool: **Cold Wax, Snip, Kinship**.
**Hidden Piece, "Unbroken Fuse":** blow the Powder Door with the original chain intact (no snips, no unties), and with no climber ever taking flame damage. Reward: a Brass Key and the permanent title *Keeper of the Line*.
**Codex hint:** *"Run from the flame. Then wait for it."*
**Codex full:** *"The fuse is your rope and your clock. The flame follows the path you walked, so stay ahead of it. At the end, plug the fuse into the socket, crowd into the brass alcove and let the flame come to you; it opens the door. The little Wicket takes one Wick who is no longer bound. Only one."*
**System:**
- Enter: `[ DOOR 1C · THE FUSE TETHER ] You are tied together. The rope is burning.`
- Clear: `[ CLEARED ] Boom. The Tower appreciates punctuality.`
- Fail: `[ FAILED ] The fuse outlasted your patience.`

---

### 6.4 `clockwork_foundry` · 1E · **The Clockwork Foundry** (Chrono-Slime; glitch/E)
**E · floors 1–3 · cap 1–2 · timer 4:00 · SOLE, pool 70 (key action = closing the hatch) · Omens: Heavy Air, Lantern-dark, Doubled**
*Fantasy: "A slime that lives at a hundred times your speed. Herd it with steam into the cold."*

**Layout**
- **The foundry.** 20 × 20 m on three levels: Floor y 0, Mezzanine y 4, Catwalk y 8, joined by corner stairs.
- **6 wheel valves (V1–V6),** two per level.
- **8 steam jets (J1–J8)** on the ground floor. Each is a vertical steam curtain 3 m wide × 4 m tall, set at a pipe junction so that the jets form corridors.
- **The Cold Store.** A 4 × 4 m frosted vault at (7, 0, 7), lit `#9FE6FF`. It has:
  - a **Hatch**: crank it by holding E for 3 s (solo 2 s);
  - a **Hatch Lever**: any thrown object ≥ 1 kg slams the hatch instantly;
  - a **Hatch Weight** pin: single use; pull it (E) and the hatch slams 4 s later.
- **The Gauge Board** on the Catwalk at (0, 8, −8) shows the pipe diagram: which two jets each valve toggles, and which jets are live right now.
- **The glitch dressing** (every E room):
  - magenta/black "missing-texture" checker patches on 10% of the surfaces;
  - clocks that tick backward;
  - chromatic aberration pulses whenever the Slime dashes.
- **Physical tells:**
  - every valve's pipe is painted in its own colour, and that colour runs all the way to the two jets it feeds;
  - a chalk arrow on the floor points to the Cold Store;
  - frost spreads 1 m out of the vault door.

**Entities**
- **The Chrono-Slime.** A 0.8 m blob, drawn as a chain of 20 afterimages.
  - **Dash:** 30 m/s in a straight line (×1.08 per tier), reflecting off walls, live steam and frozen climbers.
  - **Breath:** after each dash it pauses for **1.5 s**, glows, and paints a dotted line showing its **next** dash direction. This is the tell.
  - **Choosing a direction:** 40% of the time toward the brightest climber in line of sight; otherwise a random open direction. It never dashes into live steam.
  - **Touch:** the climber is **Frozen** for 10 s in amber (Cold Wax: 3 s). The screen goes sepia with ticking clocks. **A frozen climber is a solid wall.** A climber frozen for the third time is ejected Scorched.

**Rules**
- **Valves.** Turning a valve (hold E for 1.5 s) toggles its two jets.
  - The target is the **Funnel**: J2, J5 and J7 on, J3 and J6 off. That forms a corridor from the room centre into the Cold Store.
  - The seed sets the valve→jet mapping and a starting state that is solvable in ≤ 4 turns.
- **Capture.** When a dash ends inside the Cold Store, the Slime becomes **Sleepy**: it moves at 2 m/s and tries to leave after 4 s. Close the hatch while it is inside.

**Clear Condition**
- Decree: `[ CLEAR CONDITION ] Put {time:2} in the {cold:1}.`
- Hint (50%): *"Steam is a wall to it. Follow the coloured pipes."*
- Plain (75%): *"Turn valves until the steam forms a corridor into the Cold Store. When the slime dashes in, close the hatch."*
- **CLEAR:** the hatch closes with the Slime inside.
- **FAIL:** the timer runs out, or every climber has been ejected.

**Scaling**
- **n = 1:** dash 22 m/s, freeze 8 s, hatch crank 2 s.
- **n = 2:** dash 30 m/s, freeze 10 s, crank 3 s.
- **Tier 2+:** +1 decoy jet (a jet that toggles alone and isn't part of the Funnel).

**Betrayal hooks**
- **SOLE split** (65/35), with the Key going to whoever closes the hatch. The partner might be the one holding the valve while you take the credit.
- **Use your partner as a wall:** shove them into the dash line. This is a shove, not a Knife. It is legal and often correct.

**Bot script**
- **Lumen** always prefers this door.
- **Plan:**
  1. Walk to the Gauge Board. The bot can't solve anything until it has seen the board.
  2. Compute the valve sequence with a BFS over 2⁸ states.
  3. Execute the sequence.
  4. Pick up a throwable, wait 6 m from the Hatch Lever, and throw at the lever when the Slime goes Sleepy inside.
- **With a human partner:** a bot with Wit > 60 takes the Reader role ("I have a clue." → pings the valves in order). Otherwise it takes the Runner role.
- **Betrayal window:** capture moment. A greedy bot grabs the lever throw even when the human is the one set up for it.

**Rewards:** SOLE 70. The hatch-closer also gets a **Master Key** (40%) or a **Brass Key**. A solo clear earns the Unique Title *Slime-Warden* (§9.7). Trait pool: **Three-Second Rewind, Cold Wax, Keysmith**.
**Hidden Piece, "Sleeper":** be Frozen *inside* the Cold Store at the moment the hatch closes. Solo route: pull the Hatch Weight pin, then get touched inside the vault. Reward: the **Frozen Second** consumable (pauses any room timer for 10 s, once) and the permanent title *Sleeper*.
**Codex hint:** *"Too fast to catch. Not too fast to herd."*
**Codex full:** *"The Chrono-Slime lives a hundred seconds in each of yours. It breathes before every dash and shows you where it will go. Steam is a wall to it, and so is a frozen friend. Build a corridor of steam into the Cold Store, and when it dashes in, shut the hatch."*
**System:**
- Enter: `[ DOOR 1E · THE CLOCKWORK FOUNDRY ] Something in here is late for everything. It is not late for you.`
- Clear: `[ CLEARED ] Time has been put in the cold.`
- Fail: `[ FAILED ] You ran out of time. It did not.`

---

### 6.5 `liars_banquet` · 2B · **The Liar's Banquet** (Among Us / Mafia: hidden traitor + vote)
**B · floors 2–4 · cap 1–5 · timer 5:00 (solo 5:30) · SPLIT, pool 55 + Verdict bonus 10 · Omens: Hushed, Lantern-dark, Tithed, Doubled**
*Fantasy: "Five clockwork diners, one poisoned cup, and somebody at your own table is on the poisoner's side."*

**Layout**
- **The dining hall.** 14 m (x) × 20 m (z), with 7 m walls and a chandelier at y 6 (5 candle stubs; Lantern-dark leaves only these).
- **The Long Table.** 10 × 2 m, centred at (0, 0, 2), along z. Five **Diners** (clockwork automatons, 1.4 m tall, seated) sit on its west side, each with a **cup** in front of them:
  - the **Baker** (flour-white, rolling-pin arm);
  - the **Bishop** (tall mitre, bell-hand);
  - the **Twin** (two small heads on one body, which answer in turn);
  - the **Widow** (veil, black lace);
  - the **Clockmaker** (loupe eye, ticking chest).
- **Accusation chairs.** Each Diner has one tall chair **behind** it, on the table's west side. Opposite each Diner, on the east side, is one **climber seat**, for a guest. There are 5 of each.
- **The Verdict Candle.** A 1 m church candle at the head of the table (0, 0, 8).
- **The Brass Scale** is on the sideboard at (−6, 0, −4). It reads cups in grams: a clean cup weighs **250 g**, a poisoned one **280 g**.
- **The Host.** A 1.8 m butler automaton that pours at the foot of the table (0, 0, −4). It is not a Diner.
- **12 clue cards** (PrivateText) are scattered:
  - under plates, in the Bishop's hymnal and in the kitchen alcove (4 × 3 m at (5, 0, −8));
  - on the mantel (−6, 1.4, 6), and in the wine cellar hatch (4, 0, 7), which is 1 m deep.
- **Physical tells:**
  - the poisoned cup's rim has a faint grey film, visible within 1 m, or within 4 m while Brightened;
  - the poisoner's clockwork **ticks off-beat** (0.9 s instead of 1.0 s) when you stand within 2 m;
  - a framed "Seating Plan" on the wall shows who sat where. Some cards reference it.

**Rules**
- **Diners.** Wind a Diner (hold E for 1 s on its key) and it speaks **one testimony**: a 2-line statement shown to everyone in the room within 10 m.
  - Each Diner has 2 testimonies and alternates between them.
  - **The poisoner tells exactly one lie** across its two testimonies. The others never lie.
- **Clue cards.** A card shows its text only to its holder (1 s hold). **Handing it over is proof.** Saying what it says in the Clue Composer is not proof.
  - Card templates:
    - "{Diner} never touched {object}."
    - "{Diner} sat left of {Diner}."
    - "The poison was carried in something {Diner} holds."
    - "{Diner} left the table before the toast."
    - "Only one of {Diner} and {Diner} is telling the truth."
- **Cups.** A cup can be carried (0.25 kg) and weighed. Drinking one (Drinkable, 1 s) gives **+5 wax** if it is clean, or **−30 wax** and Poisoned (−20% move speed for 20 s) if it is poisoned. Drinking is a risky test.
- **The Taster** (hidden role, only when n ≥ 3):
  - **Who.** One random entrant (human or bot) is privately told, during the reveal orbit: `[ SECRET ROLE: TASTER ] The poisoner is the {Diner}. If the table convicts the wrong diner, you are paid.`
  - **The Pinch.** Once per room, the Taster may **Pinch** a cup (hold E for 1 s). This is a clearly visible 1 s pinch-and-sprinkle animation with grey dust, and it adds 30 g to a clean cup, so two cups now read 280 g.
  - **Lying.** The Taster may lie freely with the Composer.
  - **Payout.** On a **wrong verdict**, the Taster earns **+60 Embers**, paid at room end whatever the final outcome.
- **The vote.**
  1. Any climber lights the **Verdict Candle** (hold E for 2 s) to call it.
  2. The Bell counts 15 s. Each lit climber votes by **sitting in the accusation chair behind a Diner** (tap E on a chair).
  3. **Majority of lit climbers** (ties = no verdict) convicts that Diner, and it is ground into gears.
  - **A correct verdict** clears the room.
  - **A wrong verdict** costs every climber −30 wax and takes 60 s off the timer. The candle can be relit after 20 s.
  - **Two wrong verdicts** fail the room.
- **The Second Accusation** (only with a Taster). After a correct verdict, the System gives the table **10 s**. Every climber holds Ping → **Liar!** on one climber.
  - **If the majority names the Taster:** they are revealed, their share of the pool is split among the accusers, and they gain +1 Soot.
  - **If not:** the Taster keeps a normal share plus a +25 **Clean Palate** bonus.
  - Either way, the Ledger reveals the Taster at room end. A Pinch is logged as a **Knife**.

**Clear Condition**
- Decree: `[ CLEAR CONDITION ] One cup is {heavier:3}. One {diner:1} is {lying:2}. {Convict:1} the right one. {Trust:4} {nobody:4} {at:4} {table:4}.`
- Hint (50%): *"Weigh the cups. Wind the diners. The guilty one lies once."*
- Plain (75%): *"The poisoned cup weighs 280 g; the poisoner's testimonies contradict each other once. Light the Verdict Candle and sit behind the guilty diner. Someone among you may have added weight to a cup."*
- **CLEAR:** a correct verdict.
- **FAIL:** two wrong verdicts, or the timer runs out.

**Scaling**
- **n = 1:** 4 Diners (no Twin), 10 cards, no Taster, timer 5:30. The vote is you sitting alone.
- **n = 2:** 5 Diners, 12 cards, no Taster.
- **n = 3–5:** 5 Diners, 12 cards, one Taster.
- **Tier 2+:**
  - 6 Diners (adds the **Soldier**);
  - the poisoner lies twice across 3 testimonies;
  - the Host moves one cup every 60 s (it is fair: you watch it walk).

**Betrayal hooks**
- The **Taster** (the one pre-assigned hidden traitor in the game, scoped to this room).
- **Hoarding cards.** Hold proof back, then argue.
- **A false "said".** Paraphrase a card falsely.
- **Verdict bonus.** The climber who lit the Verdict Candle for the correct verdict gets **+10 Embers** (the Verdict bonus), so lighting it early is tempting.
- **Bot betrayal window:** the whole room, for a Taster bot only. Non-Taster bots never Knife here, but a greedy one lies about cards (§8).

**Bot script**
- **Investigators:**
  - wind every Diner once;
  - collect cards and weigh the cups;
  - keep a belief distribution over the Diners (Bayesian: clue truth, weighted by Trust in whoever said it);
  - post clues with the Composer (with probability Honesty/100; otherwise distort one noun).
- **Vote:** a bot sits behind its argmax Diner once its belief ≥ 0.6, or when the Bell starts.
  - If someone it Trusts ≥ 60 is already sitting, it follows them with probability (100 − Nerve)/100.
- **A Taster bot:**
  1. Pinches a clean cup when no other climber is within 6 m facing it. It still shows the 1.5 s Resolve flame, the universal bot tell.
  2. Then argues for the heavier-but-clean cup's Diner.
- **Maud Tallow** is devastating as Taster: she "says" true clues all game, then lies once, at the vote.

**Rewards:** SPLIT 55. Verdict +10. Taster outcomes as above. Trait pool: **Insight, Language of Wax, Unremarkable**.
**Hidden Piece, "Second Guess" (the Host accomplice):**
- **The secret.** In every seed the Host is the poisoner's accomplice. Its tray carries a grey dust ring that shows only as a **ShadowGlyph** (while Dimmed within 4 m).
- **The trigger.** After the correct verdict, the Host's chair appears at the table foot. If any climber sits in it within 10 s (before or instead of the Second Accusation), the Host is exposed.
- **Reward:** a **Black Key** and the permanent title *Second Guess*.

**Codex hint:** *"Weigh the cups before you weigh the words."*
**Codex full:** *"Five diners, one poisoned cup, 30 grams of difference. The poisoner lies exactly once. When three or more sit down to eat, one of you has been told the answer and paid to hide it. Watch for the pinch, and look at the Host's tray in the dark."*
**System:**
- Enter: `[ DOOR 2B · THE LIAR'S BANQUET ] Dinner is served. So is poison.`
- Clear: `[ CLEARED ] The {Diner} has been ground into gears. Justice tastes of brass.`
- Fail: `[ FAILED ] Two innocents ground. The table is closed.`

---

### 6.6 `weighing_hall` · 2D · **The Weighing Hall** (social dilemma, the lifeboat)
**D · floors 2–3 · cap 1–5 · timer 4:30 · SPLIT with transfers (The Cut), pool 80 · Omens: Heavy Air, Tithed, Doubled, Hushed**
*Fantasy: "The room is a scale and you are the weight. Someone has to get lighter."*

**Layout**
- **The Pan.** The whole floor is a **suspended brass pan**, 16 m in diameter, hanging from four chains in a void hall that is 30 m high. The pan tilts at most 3° (visual only).
- **The Gate Ledge.** A fixed stone ledge 4 m north of the pan rim, with the **Exit Gate**. It connects to the pan only by the **Gate Bridge**, which extends in 0.5 s when the Gate opens.
- **The Bowl.** At the centre is a brass melting Bowl, 2 m across and glowing orange, ringed by **5 Seats**.
  - Each Seat is a **Chute** trapdoor with a **Chute lever** on a post 2.5 m behind it.
- **Rim bars.** 8 iron bars on the pan rim. Hanging from one takes you "off" the pan: your weight counts as 0 while you hang.
  - **Grip lasts 8 s** (Cold Wax: 12 s), and hanging costs 1 wax/s. After that you must re-mount; the bar is usable again after a 3 s cooldown.
- **Ballast.** Three loose brass weights (10 units each, 15 kg each). Throwing one over the rim removes it forever.
- **The Counterweight Pan.** A 3 m pan hanging 6 m up and 5 m east of the rim, holding a stack of iron and one **Crown Fragment**.
- **The Great Dial.** On the north wall, it shows **Current**, **Baseline** and **Needed**. Everyone can read it, always.
- **Physical tells:**
  - the dial needle is marked with a red notch at the target;
  - each climber's weight floats above their head as a small brass number while they are on the pan;
  - a painted relief above the Gate shows one candle sitting in a bowl while others walk out.

**Rules**
- **Weight.** Weight = the sum of **wax** of every climber on the pan, plus carried objects (10 units per ballast, 1 unit per other prop). Smoke weighs 0.
- **Baseline and Needed.**
  - **Baseline** is set at Latch.
  - **Needed** = Baseline − T, where T = **60** (n = 1), **80** (n = 2), **110** (n = 3), **130** (n = 4), **150** (n = 5).
- **The Gate.** When Current ≤ Needed, the Gate opens and the Bridge extends for **8 s**. Anyone who crosses in that time clears.
  - When the Bridge retracts, **Baseline resets** to the new Current, and the remaining climbers need a new T for their headcount.
- **Ways to get lighter:**
  1. **Bowl melt.** Sit in a Seat (E). You lose **5 wax/s** while seated; stand up with Jump. The melted wax collects in the Bowl as the **Tithe**.
  2. **Throw ballast** overboard: 30 units in total, once.
  3. **Hang** on rim bars (0 weight while hanging).
  4. **The Chute.** Pull a Seat's lever (hold E for 0.5 s) and whoever sits in that Seat drops into the Undercroft.
     - The Undercroft is a stone slide that deposits them at the next Landing: they are out of the room, uncleared.
     - The pull is **The Cut**, a **Knife**. **The victim's share transfers to the puller.**
  5. **Step Down.** Seated, hold E for 2 s to chute yourself. This is not a Knife. You leave uncleared, but the Tower pays you **50% of a share + 10 Embers ("Martyr")** at the next Landing.
- **Tithe.** When the last climber crosses the Bridge, the Bowl's Tithe goes to them: 1 Ember per 2 wax melted by anyone.

**Clear Condition**
- Decree: `[ CLEAR CONDITION ] The {Gate:1} opens for the {light:2}. The {scale:1} does not {care:3} {how:4}.`
- Hint (50%): *"Wax is weight. The dial shows what you owe."*
- Plain (75%): *"Lower the dial to the red notch: melt wax in the Bowl, throw ballast off, or hang on the rim bars. The gate opens for 8 seconds, then resets for whoever is left."*
- **CLEAR:** per climber, crossing the Bridge. The room ends when nobody is left on the pan.
- **FAIL:** the timer runs out. Everyone still on the pan is Scorched.

**Scaling**
- T by headcount as listed above.
- **n = 1:** a simple melt-and-throw puzzle: 3 ballast (30) plus 30 wax. The Chute is only for yourself.
- **Tier 2:** T ×1.2, only 2 ballast, and rim grip lasts 6 s.

**Betrayal hooks**
- **The Chute:**
  - the lever glows and **clanks once 1 s before** it drops (an audible, visible tell);
  - the seated victim can jump up during that second;
  - but a seated climber is also mid-melt and wants to stay.
- **The last-out Tithe.** Stall at the rim bars so you're the last to cross.
- **Hold the headcount.** Refuse to leave so the second opening needs your cooperation.
- **Bot betrayal window:** any time Needed − Current > 40 with less than 90 s left, or when a grudge target is seated.

**Bot script**
- Compute the gap. Assign actions in cost order:
  1. throw ballast;
  2. hang in a rotation (bots with Nerve > 50);
  3. melt (bots with Loyalty > 60 volunteer first; Brother Brass always volunteers and says "I can carry that.").
- **Vex Sulphur** loiters near chute levers. Its tell: it walks behind the Seats and stops.
- **Martyr logic:** a bot with Loyalty ≥ 80 and wax ≤ 35 Steps Down if that alone closes the gap.

**Rewards:** SPLIT 80 (after transfers). Tithe to the last out. Martyr payouts. Trait pool: **Hollow Core, Kinship, Dimmer**.
**Hidden Piece, "The Leap":**
- Reach the Counterweight Pan. The only way is to be **thrown** from the rim by a charged throw (≥ 12 m/s), or a dive from a rim bar with Heavy Air off.
- Landing there takes your whole weight off the main pan, which tips the scale massively.
- The leaper grabs the **Crown Fragment** and slides down a chain to the Gate Ledge (clears automatically).
- Reward: the Crown Fragment and the permanent title *Counterweight*.

**Codex hint:** *"Somebody has to get lighter."*
**Codex full:** *"The Hall weighs your wax, not your worth. Melt it, throw the ballast, hang off the rim; the gate opens for eight seconds and then counts again for whoever is left. Every seat is a trapdoor, and every trapdoor has a lever behind it. The scale does not care how."*
**System:**
- Enter: `[ DOOR 2D · THE WEIGHING HALL ] Please remain seated. Or don't.`
- Clear: `[ CLEARED ] The scale is satisfied. It is rarely satisfied.`
- Fail: `[ FAILED ] Too heavy. Too late.`

---

### 6.7 `drip_chimney` · 2C · **The Drip Chimney** (PEAK)
**C · floors 2–4 · cap 1–8 · timer 4:30 · FINISH, pool 40 each + First Through 20 · Omens: Heavy Air, Frayed, Lantern-dark, Doubled**
*Fantasy: "A wax chimney that melts where you grab it. Keep climbing, or haul a friend."*

**Layout**
- **The flue.** A hexagonal shaft, 40 m tall and 7 m across. The walls are pale wax (`#EDE0C8`) veined with soot.
- **Holds.** About **120 holds** (knobs 0.25 m, flakes 0.15 m, jugs 0.35 m), generated along 3 braided "routes" with 0.9–1.6 m spacing, plus random extras.
- **Rest Ledges** at 10, 20 and 30 m, each 1.2 m deep and wrapping 2 walls, with a checkpoint.
- **The Base** (y 0) holds:
  - a **Piton Rack** with 4 pitons;
  - a **Rope Coil** (12 m, anchorable at any ledge).
- **The Sun-Hatch.** A 2 × 2 m iron hatch at y 40, opening onto the roof (the exit).
- **Physical tells:**
  - every hold glows faintly **orange** on its underside when it can be gripped;
  - a hold turns **clear and dripping** when it is about to melt;
  - old chalk hand-prints mark the easiest route;
  - daylight pours through the Hatch.

**Rules**
- **Grip.** Hold LMB on a hold within 1.6 m to hang.
  - Hanging costs **1 wax/s** (your flame is right under the wax).
  - **Each hold melts 3 s after first contact** and **regrows after 20 s**.
- **Moving.**
  - **Reach:** grab another hold within 1.6 m while hanging (free).
  - **Lunge:** Jump while hanging to grab a hold up to 2.2 m away (−3 wax).
  - **Mantle** onto ledges automatically.
- **Hauling.**
  - A climber standing on a ledge, or Bracing on a jug, can **Haul**: grab a climber hanging within 1.6 m below (Brace + LMB). This lifts them 1.5 m and re-hangs them on the Hauler's hold.
  - Two Wicks can share one jug.
- **Pitons.** Carry one (0.5 kg, max 2) and hold E for 1 s against the wall to set it (−10 wax). It makes a permanent, non-melting hold.
- **The Rope.** Anchor it at a ledge (hold E for 2 s). Climbers below can climb it at 1.5 m/s (0.5 wax/s).
  - **Cutting an anchored rope** is a Knife (§4.4, X hold 1.2 s, Cinchable by anyone on the rope).
- **Hot drips.** Brightening while directly above a climber (within 3 m horizontally) rains hot wax on them for **−2 wax/s**. They see a red drip warning. Deliberate hot-dripping is logged (**a Knife if it Snuffs**).
- **Falls.** You fall to the ledge below, with fall damage per §5.2 (max −30).
- **The Sun-Hatch.** Opens when the first climber touches it.
  - **30 s later it slams shut** unless someone is **Bracing in its frame** (2 wax/s, the same as Hold the Door).
  - Once shut, it reopens only by cranking the **Hatch Wheel** from the 30 m ledge side (hold E for 10 s). This is the solo safety valve.

**Clear Condition**
- Decree: `[ CLEAR CONDITION ] {Up:1}. {Faster:2} than you {melt:3}.`
- Hint (50%): *"Holds regrow. Ledges rest. Ropes share."*
- Plain (75%): *"Climb to the hatch at the top. Holds melt 3 seconds after you touch them and regrow after 20. Pitons and the rope make safe holds. The hatch slams 30 seconds after the first climber arrives unless someone holds it open."*
- **CLEAR:** per climber, exiting through the Sun-Hatch.
- **FAIL:** the timer runs out. Anyone inside is Scorched.

**Scaling**
- **n = 1:** a 30 m flue (2 ledges), holds regrow in 12 s, and the Hatch does not slam.
- **n = 2–4:** as written.
- **n = 5–8:** +40 holds, and the rope is 20 m.
- **Tier 2:** melt time 2.5 s and regrow 25 s. **Heavy Air** makes lunges 1.8 m.

**Betrayal hooks**
- **First Through** (+20) pays the fastest, so climbers race.
- **Hot drips** on the climber below.
- **Cutting the rope.**
- **Letting the Hatch slam** on everyone below you.
- **Stealing a partner's hold.** Grabbing it starts its melt timer.
- **Bot betrayal window:** within 6 m of the Hatch while another climber is within 8 m of it; or a grudge target is on the rope.

**Bot script**
- Path-plan with A* over the hold graph. The edge cost is wax (reach 0, lunge 3), and holds are unavailable while melted or regrowing.
- Rest at ledges when wax < 40.
- **Moss** carries a piton and sets it at any gap longer than 2 m, calling "Here." (a ping).
- **Ines the Taper** speed-climbs, lunging always.
- **Brother Brass** stops at the Hatch and holds it (Loyalty > 60).
- **Hauling:** a bot with Loyalty > 50 hauls any dangler within reach.

**Rewards:** FINISH 40 each. First Through +20. Trait pool: **Cold Wax, Lead Wick, Last Light**.
**Hidden Pieces:**
- **"Doorholder":** hold the Sun-Hatch open until every other climber (at least 3) has exited. Reward: a Brass Key and the permanent title *Doorholder*.
- **"No Rest":** exit without ever standing on a ledge or using the rope. Reward: the permanent title *No Rest*, plus a **Master Key** if solo.

**Codex hint:** *"Your flame is the problem. Keep moving."*
**Codex full:** *"Every hold you touch starts to melt, and your own flame does it. Holds regrow in twenty seconds, pitons never melt, and a rope shares the climb, until somebody cuts it. The hatch at the top closes on its own unless someone stays behind to hold it."*
**System:**
- Enter: `[ DOOR 2C · THE DRIP CHIMNEY ] You are the reason it melts.`
- Clear: `[ CLEARED ] Daylight. Try not to take it for granted.`
- Fail: `[ FAILED ] The chimney has absorbed you. It thanks you for the wax.`

---

### 6.8 `glitched_watcher` · 2E · **The Glitched Watcher** (glitch room)
**E · floors 2–4 · cap 1–2 · timer 4:00 · SOLE, pool 70 (key action = toppling the final true pillar) · Omens: Lantern-dark, Hushed, Doubled**
*Fantasy: "A cathedral eye that deletes whatever looks at it. Find its real anchors blind."*

**Layout**
- **The nave.** 30 m long (z), 12 m wide and 14 m high. The glitch dressing is heavier than 1E: floor tiles occasionally render as 1-bit dither, and the stained glass scrolls like a corrupted texture.
- **Six pillars** (2 m wide, 12 m tall): three per side at z = −6, +3 and +12, x = ±4.5. **Three are true** (the Watcher's anchors) and **three are false**, as seeded.
- **The Watcher.** A 3 m floating stained-glass eye.
  - It drifts along the nave centre line (x 0, y 7) between z −10 and z 14 at 1.5 m/s, and turns toward the loudest noise (§6.0.5).
  - When a pillar falls it **blinks** (teleports) to the far end of the nave with a 0.3 s screen tear.
- **The Font of Cloth.** Near the entry (0, 0, −13): 2 **Blindfolds** (wearables).
- **Physical tells** for sighted players:
  - true pillars carry a hairline crack that **pulses at 1 Hz**, visible within 3 m;
  - dust sifts from their capitals;
  - the Watcher's glass shows 3 lit veins, one running toward each true anchor, readable in peripheral vision.

**Rules**
- **Looking kills.**
  - If your **camera forward vector is within 25° of the Watcher**, with line of sight, for **0.5 s**, you are **Paralysed**: turned to glitch-stone for 6 s, −10 wax. **A Paralysed climber is a solid obstacle.**
  - **Warning:** static grain at the screen edge grows as the angle drops below 45°, and a glitch hiss rises.
  - **Three Paralyses = Deleted.** You are ejected Scorched, with a 1-frame "missing texture" death.
- **Blindfold** (carry it; press E while carrying to wear or remove, 0.5 s):
  - the screen goes black except **echo outlines**: geometry within 3 m, plus a 6 m outline pulse whenever you or your partner Pings;
  - you **cannot be Paralysed**;
  - you **hear the true pillars hum**, spatialised, each at its own pitch (A3, C#4, E4);
  - move speed −15%.
- **Toppling.** A pillar topples after **3 shoves**, or **1 thrown object ≥ 3 kg** at ≥ 8 m/s. Loose masonry chunks (4 kg) lie around the nave.
  - **A true pillar falling** cracks the Watcher (+1 crack).
  - **A false pillar falling** makes the Watcher **Enraged** for 20 s: gaze cone 35°, dwell 0.35 s.

**Clear Condition**
- Decree: `[ CLEAR CONDITION ] {Do:2} not {look:1}. Break what {holds:3} it {up:3}. {Listen:4} {blind:4}.`
- Hint (50%): *"Three pillars are real. They sound different when you can't see."*
- Plain (75%): *"Never look at the eye. Wear a blindfold to hear which three pillars hum, and topple those three."*
- **CLEAR:** 3 true pillars toppled (2 solo). The Watcher shatters into pixels.
- **FAIL:** the timer runs out, or every climber has been Deleted.

**Scaling**
- **n = 1:** 4 pillars (2 true), gaze dwell 0.7 s, one blindfold.
- **n = 2:** as written.
- **Tier 2+:** the Watcher's drift is 2 m/s, and the hum is only audible within 8 m.

**Betrayal hooks**
- **SOLE.** The one who topples the last true pillar gets 65% and the Key.
- **Blindfold Rip** (a Knife). Grab a blindfolded partner's blindfold (hold LMB for 1 s from behind).
  - If they are facing the Watcher, they are Paralysed instantly.
  - The ripper's Resolve tell shows, and the victim's screen flashes a white hand-shape 0.5 s before, as the warning.
- **Lying as a guide.** Steer a blindfolded partner by pings toward a false pillar ("Go.").
- **Bot betrayal window:** after 2 true pillars have fallen, whenever the partner is blindfolded within 1.5 m.

**Bot script**
- **Sighted bot:** keeps its facing ≥ 60° from the Watcher (it always samples the angle before turning). It identifies true pillars from the pulse crack by walking within 3 m of each, then shoves.
- **With a human partner:** a bot with Wit > 60 dons the blindfold and pings true pillars ("Here."), and asks the human to topple them. Lumen instead takes both roles alone and says "Go on without me."
- **Kestrel** occasionally "peeks" (a glance at 30°) as comedic risk.

**Rewards:** SOLE 70. Final-pillar climber: **Master Key** (40%) or Brass. A solo clear earns the Unique Title *Unseen*. Trait pool: **Blindfold Sense, Dimmer, Three-Second Rewind**.
**Hidden Piece, "Watcher's Lens":**
- Clear **without ever wearing a blindfold and without ever being Paralysed**.
- Reward: the **Watcher's Lens**, a run item that permanently reveals X alcoves and ShadowGlyphs within 10 m, and the permanent title *Unflinching*.

**Codex hint:** *"Everything that looks at it is deleted. Listen instead."*
**Codex full:** *"The Watcher is an error the Tower never fixed. Meet its eye for half a second and you are stone; three times and you are gone. Three of its pillars are real anchors. They hum, but only for those who cannot see. Blindfold yourself, or trust the one who is."*
**System:**
- Enter: `[ DOOR 2E · THE GLITCHED WATCHER ] D̷o̷ ̷n̷o̷t̷ look directly at the error.`
- Clear: `[ CLEARED ] The error has been closed. Nobody saw anything.`
- Fail: `[ FAILED ] 404: Wick not found.`

---

### 6.9 `harmony_sentinel` · 3A · **The Harmony Sentinel**
**A · floors 2–3 · cap 1–8 · timer 5:00 · SPLIT, pool 60 + Heartcandle · Omens: Heavy Air, Hushed, Lantern-dark, Doubled**
*Fantasy: "A lamp-knight that only falls when every lamp goes out in the same heartbeat."*

**Layout**
- **The shrine.** Round, radius 12 m, with a 1 m dais at the centre.
- **The Harmony Sentinel.** A 4 m armoured lamp-knight: a lantern for a head and a halberd.
  - It patrols the dais ring at 2 m/s.
  - **Its lamps are the room's Sconces:** 5 sconces on pedestals (1.4 m tall) at radius 9 m, spaced 72° apart. At n ≥ 6 there are **7 sconces**.
  - Each sconce glows the Sentinel's gold `#FFD76A`, and a gold wire runs from it to the knight's back.
- **The Bell of Accord** hangs at the entry (0, 2, −11). Ringing it (E) starts a room-wide 3-2-1-NOW count.
- **Clockwork Decoys.** 4 of them (6 at n ≥ 6), each a 1 m wind-up mannequin holding a little mallet (18 kg, so it can be carried at −40%).
  - Wind it (hold E) and scroll to set a **delay of 1–9 s**. The delay is shown by a painted number on its chest and a ticking sound.
  - Put it down facing a sconce within 1 m and it strikes once when its delay elapses.
- **Tells:**
  - a chalk circle at each sconce is exactly where a Decoy fits;
  - a mural shows five hands striking at once under a single bell;
  - the Bell of Accord has "3 · 2 · 1" engraved on its lip.

**Rules**
- **Striking.** A **strike** snuffs a sconce: a shove on it, a thrown object ≥ 1 kg, or a Decoy's mallet.
- **Harmony.** If every sconce is out within a **window** of 1.0 s (1.2 s solo), that is **a Harmony**:
  - the Sentinel kneels and its lantern cracks;
  - all sconces relight after 4 s.
- **Sour notes.** A sconce struck outside a Harmony relights 1.0 s after the first strike of its attempt. The strike sounds a **sour note** in the striker's flame colour (the evidence).
- **The Sentinel.**
  - Always swings at the most recent sour-noter within 10 m. Otherwise it swings at the nearest climber.
  - Swing: a 1.2 s telegraph (the halberd rises and the lantern flares), then a 3 m arc: −15 wax and knockback.

**Clear Condition**
- Decree: `[ CLEAR CONDITION ] {All:1} its {lamps:2}, in {one:3} {breath:3}. {Twice:4}.`
- Hint (50%): *"Out of time is out of tune. The bell counts for you."*
- Plain (75%): *"Put out every lamp within one second of each other, twice. Ring the bell to count down together; wind the clockwork decoys to strike lamps nobody can reach."*
- **CLEAR:** 2 Harmonies.
- **FAIL:** the timer runs out.

**Scaling**
- **n = 1:** 5 sconces, window 1.2 s, 5 Decoys.
  - Solo is a pure timing puzzle: wind the Decoys with staggered delays so that they fire together with your own strike.
  - *Example:* the first Decoy you place gets 9 s, the next gets 7 s, and so on, following your walking time.
- **n = 2–5:** window 1.0 s. People take sconces, and Decoys cover the gaps.
- **n = 6–8:** 7 sconces, window 1.0 s.
- **Tier 2+:** window −0.1 s per tier, and the Sentinel patrols at 2.5 m/s.

**Betrayal hooks**
- **Heartcandle.** The climber whose strike is the **latest inside the window of the final Harmony** takes the **Heartcandle** (a self-Relight or +40 wax item) and first Altar pick.
  - Everyone wants to be last, so greed smears the timing. A greed-shaped betrayal that is fully visible.
- **A deliberate sour note** draws the Sentinel toward a rival.
- **Rewinding a partner's Decoy** to the wrong delay. The new number is visible on its chest.
- **Bot betrayal window:** the final Harmony attempt, for bots with Greed > 60 (they strike 0.1–0.3 s late).

**Bot script**
- **Caller** (Brother Brass, or the highest Wit): it rings the Bell of Accord once every sconce has a striker or a wound Decoy.
- **Strikers:** assigned to the nearest sconce. Each strikes on NOW with timing jitter N(0, 0.08 + (100 − Wit)/600) s.
- **Winders:** set each Decoy's delay to `bellStart + 3.0 − placeTime`, rounded to the nearest integer, and ring the bell exactly on the right second. Pell announces "On three."

**Rewards:** SPLIT 60. Heartcandle. Trait pool: **Resonance, Echo Wick, Firebrand**.
**Hidden Piece, "One-Breath":** clear with **zero sour notes** all room. Reward: a Brass Key and the permanent title *One-Breath*.
**Codex hint:** *"Out of time is out of tune."*
**Codex full:** *"The Sentinel's lamps are its heartbeat. Put them all out inside a single second and it kneels. Do it twice and it stays down. Ring the bell to count together; wind the decoys to strike where you cannot. The last hand inside the final second takes its heart."*
**System:**
- Enter: `[ DOOR 3A · THE HARMONY SENTINEL ] It will only listen to all of you at once.`
- Clear: `[ CLEARED ] Perfect harmony. The Tower hums along.`
- Fail: `[ FAILED ] Out of tune. Out of time.`

---

### 6.10 `weight_of_guilt` · 3D · **The Hall of Grievances** (the Weight of Guilt)
**D · floors 3–4 · cap 1–4 · timer 4:30 · SPLIT, pool 60 (+10 each if nobody Condemns) · Omens: Lantern-dark, Hushed, Tithed**
*Fantasy: "Each of you is followed by a shade wearing the face of the Wick you hurt most."*

**Layout**
- **The gallery.** 20 × 20 m, with 8 m walls. The floor is a dark mirror.
- **The Portrait Wall.** The walls carry **portraits of every Knife in this run**, generated from the Ledger:
  - the victim's Wick in their own cosmetics;
  - the perpetrator as a sooty silhouette behind them;
  - a brass caption, e.g. "2D · The Cut".
- **The Confessional.** A booth at (0, 0, 7) with a bell pull.
- **The Exit Arch** on the north wall is sealed by a veil of grey smoke.
- **Tells:**
  - glowing footprints trail behind every Regret;
  - the Confessional's curtain is embroidered with a kneeling candle and a bell.

**Entities**
- **Regrets.** At the end of the reveal orbit, each climber's **Regret** rises from the mirror floor.
  - **Its form.** It wears the **exact skin of that climber's worst victim** in this run: the Wick they took the most Embers from by a Knife. It is rendered in translucent grey, with a soot tear.
  - **A Doubt instead.** A climber with no victims gets a **Doubt**: their own skin, desaturated and face-down.
- **Behaviour.**
  - A Regret follows its owner at 2.2 m/s. It keeps its distance at 3 m and never attacks.
  - It **drains 1 wax every 3 s from every climber within 4 m** of it.
  - Striking a Regret does nothing, except that its drain doubles for 10 s.
- **Footprints.** A Regret leaves glowing footprints (`#CDEBFF`). They follow the **recorded path of the victim** from the room where the Knife happened (a Doubt walks its owner's own path).

**Rules: two ways to lay a Regret down**
1. **Empathy.**
   - Walk in your Regret's footprints for **20 s** in total (15 s for a Doubt). Footprints fade 6 s after they are made, so you must stay close behind it.
   - While you are in its footprints, **it does not drain you**.
   - At the end, the Regret turns, bows and dissolves.
2. **Confession.** Enter the Confessional and hold E for 3 s.
   - The whole tower sees `[ CONFESSION ] {Name} confesses: {Knife} in {door}.`
   - You pay **20 Embers** to the victim, and remove **1 Soot**.
   - **The victim answers** within 10 s, wherever they are: another room, a Landing, Smoke or Burnt Out. Bots decide by Trust and Spite (§8.5).
     - **Forgive:** the Regret dissolves instantly. The victim gets +5 Embers, and a Forgive is logged.
     - **Condemn:** the Regret stays and speeds up to 3 m/s. You must now do Empathy for 30 s.
     - **No answer** within 10 s counts as Forgive.
- **Only real Knives can be confessed.** The Ledger checks them.
- **Doubts cannot be confessed.** They only yield to Empathy.

**Clear Condition**
- Decree: `[ CLEAR CONDITION ] {Walk:3} where they {walked:3}. Or {say:2} {it:2} {out:1} {loud:1}.`
- Hint (50%): *"It wears the face of whoever you hurt. Follow its steps, or confess."*
- Plain (75%): *"Walk in your shade's glowing footprints for 20 seconds, or confess in the booth. The door opens when every shade is gone."*
- **CLEAR:** every lit climber's Regret or Doubt has been dissolved. Smoke climbers' Regrets vanish when they are Snuffed.
- **FAIL:** the timer runs out.

**Scaling**
- **n = 1:** one Regret or Doubt, timer 4:00. Solo is a quiet, sad and fast room: the breather beat of the run.
- **n = 2–4:** Regrets overlap. The drain stacks, so everyone must spread out, or help.
- **Tier 2:** Empathy 25 s, and the footprints fade after 4 s.

**Betrayal hooks**
- **Condemn out of spite.** Victims decide from outside the room.
- **Herding your Regret** into a group to drain them. This is a jerk move, not a Knife.
- **Pretending you have a Doubt.** Hide behind others so nobody sees whose face your shade wears.
- **Bot betrayal window:** bots never Knife here, but a Spite > 60 victim bot Condemns a perpetrator whose Trust is below 0.

**Bot script**
- **A bot with a Regret:** it Confesses if Honesty > 60, or if its victim is a bot that Trusts it > 20. Otherwise it walks Empathy.
- **Pip Fizzwick** walks other people's footprints to help (see the Hidden Piece).
- **Gutter** stands still and lets its Regret drain the room while it says "Not sorry." This is a comic, readable cue that it should be Condemned.

**Rewards:** SPLIT 60, +10 each if nobody Condemns. Trait pool: **Kinship, Insight, Hollow Core**.
**Hidden Piece, "Scapegoat":**
- Walk another climber's Regret footprints for 20 s. **The Regret switches owner to you** and dissolves when you finish.
- Clearing the room this way at least once gives a Brass Key, the permanent title *Scapegoat*, and **Trust +20** with that climber (if a bot).

**Codex hint:** *"The Tower remembers who you hurt. So does the Hall."*
**Codex full:** *"Every shade here wears a face you know, the one you cut deepest this climb. Walk its steps until you understand, or kneel in the booth and say it out loud to the whole tower. They may forgive you. They may not. Those who hurt nobody meet only their own doubt."*
**System:**
- Enter: `[ DOOR 3D · THE HALL OF GRIEVANCES ] The Tower has kept your receipts.`
- Clear: `[ CLEARED ] Your conscience has been processed.`
- Fail: `[ FAILED ] You could not put it down.`

---

### 6.11 `mimics_toll` · 4D · **The Mimic's Toll**
**D · floors 3–4 · cap 1–5 · timer 4:30 · SPLIT, pool 90 · Omens: Heavy Air, Frayed, Doubled, Tithed**
*Fantasy: "A mirror-thing that becomes whoever touches it, only bigger. To kill it, someone must first poison themselves."*

**Layout**
- **The Toll Bridge.** A 12 m (x) × 24 m (z) stone bridge hall over the void, with 1 m parapets. The **Toll Gate** is at the north end.
- **The Mimic.** A 2.2 m quicksilver figure. Unmatched, it is a blank mannequin.
- **The Apothecary Shelf** is at (−5, 1.2, −8), with **three unlabelled tonic bottles**: a green, an amber and a violet, colour-shuffled per seed.
- **Tells:**
  - labels in **wax-script** (read while Brightened within 6 m) name each tonic's curse;
  - a tollkeeper's mural shows a candle drinking, then touching a silver figure, which melts;
  - the Toll Gate plaque reads: "The Toll Is Paid In Kind."

**Entities and rules**
- **Mirroring.** Whoever last **touched** the Mimic becomes its **template**. A touch is a shove, a grab, being shoved into it, a thrown object you threw, or a dive into it.
  - The Mimic takes their **skin**, traits and verbs at **N×**, where N = the entrants in the room (max 3×). That means shove impulse ×N, speed ×(1 + 0.1 N), and trait effects copied.
  - **A new touch overwrites the copy.**
- **Behaviour.**
  - It hunts the climber nearest to it who is **not** its template. It mirrors their movement (it leads, not chases) and shoves at N×, which can knock climbers off the parapet into the void (−15, respawn).
  - Nothing damages it.
- **Tonics.** Each is a 0.5 kg bottle. Drinking one (1 s) applies a **curse that lasts until the end of the next floor**:
  - **Wilt:** −20 max wax.
  - **Brittle:** fall damage starts at 3 m instead of 6 m, and void falls cost −25.
  - **Heavy:** weight ×1.5, jump −30%, and Scales count you ×1.5.
- **Killing it.** When the Mimic copies **any cursed climber**, the curse is copied at N× and **kills it**: it melts to a silver puddle and the Toll Gate opens.
- **Thrown tonics.** A thrown bottle shatters, and the **Splash** curses whoever it hits (1.5 m radius). **Splashing** another climber without their consent is a **Knife**.

**Clear Condition**
- Decree: `[ CLEAR CONDITION ] It {becomes:1} {you:1}. {Become:2} {something:3} it {cannot:3} {survive:4}.`
- Hint (50%): *"It copies whoever touches it, curses included."*
- Plain (75%): *"Someone drinks a tonic from the shelf, then touches the mimic. It copies the curse and dies. The drinker keeps the curse for the next floor."*
- **CLEAR:** the Mimic dies.
- **FAIL:** the timer runs out.

**Scaling**
- **n = 1:** the Mimic is your 1× mirror. You must drink and touch: a lonely little sacrifice.
- **n = 2–5:** N× copies make touching it dangerous (it gets stronger with each touch by a strong climber).
- **Tier 2:** the curse duration extends through the floor after next as well.

**Betrayal hooks**
- **Who drinks?** The **drinker** (the cursed climber whose copy killed it) gets a **Martyr's Mark** (one free Relight this run) and **+15 Embers**, and carries the curse for a floor.
- **Splash** a rival with a tonic and shove them into the Mimic. A Knife: the victim carries the curse, **you** get their Martyr's Mark bonus, and they get the Mark.
- **Touching it on purpose** after someone has set up a cursed copy overwrites it, to deny them the reward.
- **Bot betrayal window:** after 60 s with nobody drinking, bots with Spite > 60 target a grudge climber for a Splash.

**Bot script**
- **Reader:** a bot with Wit > 50 Brightens at the shelf and reads the labels ("I have a clue."). It prefers **Wilt** if it has wax to spare, and **Heavy** if the next floor has no D.
- **Volunteer:** the drinker is the bot with the highest Loyalty × (wax/max). Brother Brass always volunteers ("I can carry that.").
- **Others:** they keep away from the Mimic (distance ≥ 5 m), and never touch it unless they are cursed.

**Rewards:** SPLIT 90. Martyr's Mark + 15 for the drinker. Trait pool: **Hollow Core, Last Light, Kinship**.
**Hidden Piece, "Empty Hands":**
- The Mimic dies while copying a climber who holds **0 traits**.
- Reward: the **Blank Mask** (an earned-only Holder cosmetic, §12.5) and the permanent title *Empty Hands*.

**Codex hint:** *"It becomes whoever touches it. Be something poisonous."*
**Codex full:** *"The Mimic wears whoever touched it last, stronger for every Wick in the room. It cannot be hurt, only corrupted: drink a tonic, touch it, and it drinks too. The drinker carries the curse a while longer. Read the labels by bright light if you want to choose your poison."*
**System:**
- Enter: `[ DOOR 4D · THE MIMIC'S TOLL ] The toll is paid in kind.`
- Clear: `[ CLEARED ] Toll paid. The Tower accepts sacrifices in all currencies.`
- Fail: `[ FAILED ] It became all of you.`

---

### 6.12 `karmic_executioner` · 4A · **The Karmic Executioner**
**A · floors 3–4 · cap 1–8 · timer 5:00 · SPLIT, pool 70 · Omens: Lantern-dark, Heavy Air, Doubled, Hushed**
*Fantasy: "An axeman whose wounds land on the weakest of you. It hunts the brightest, and it kneels only in the dark."*

**Layout**
- **The Court of Ash.** 26 × 26 m, with 10 m walls, and a sunken 8 m **Absolution Circle** (−0.5 m) at the centre.
- **Three Karma Dials** on the walls (W, N, E), each a 6-position brass wheel (hold E to turn one step, 0.4 s).
  - **ShadowGlyphs** above each dial show the correct position. They are readable **only while Dimmed within 4 m** (Dimmer: 10 m).
- **Four Lure Lanterns** in the corners. Light one (E, −5 wax) and it burns for 15 s at brightness rating 4.
- **Tells:**
  - a **red soot chain** runs from the Executioner's shackles to the **lowest-wax climber** in the room, visible at all times;
  - a mural shows a kneeling axeman in a dark room;
  - the dials are cold iron, and the glyph above each is a faint blank patch until someone Dims.

**Entities**
- **The Karmic Executioner.** A 3.5 m hooded figure with a wax-dipped axe, speed 2.8 m/s.
- **Targeting.** It hunts the climber or lantern with the highest **brightness rating** (§4.3). Soot and Notorious status count, so the guilty glow.
- **Cleave.** A 1.2 s telegraph: its axe rises and the target's flame is outlined red. Then a 2.5 m arc: −20 wax.
- **Bloodwax.** Every hit on the Executioner reflects **×2** onto the **lowest-wax climber** in the room, following the chain. A shove hit is 5 → 10 wax, a throw hit is 10 → 20 wax.
  - It is logged every time.
  - It counts as a **Knife** if it Snuffs someone other than the attacker.

**Rules**
1. **Set all three dials** to their ShadowGlyph positions. The Executioner then stops hunting, walks to the Absolution Circle and kneels.
2. **Absolution:** **20 s** (15 s solo). A progress ring fills as long as **no climber Brightens within 8 m of the Circle and nobody strikes it**.
   - Either of those **resets** the ring, and the Executioner rises for 10 s of hunting before kneeling again.
3. **After 2 resets** the room turns to **Karma Turned**:
   - hits now reflect onto **the attacker** instead;
   - Brightening no longer resets the ring (the Executioner cleaves the Brightener instead).
   - This caps how much one saboteur can do.

**Clear Condition**
- Decree: `[ CLEAR CONDITION ] {Read:2} its {sentence:3} in the {dark:1}. Then {let:4} it {kneel:2}.`
- Hint (50%): *"Its sentence is written where only the dim can read. Striking it strikes the weakest."*
- Plain (75%): *"Dim your flame near the three dials to read the right settings, set them, then stay dark and hands-off for 20 seconds while it kneels."*
- **CLEAR:** Absolution completes.
- **FAIL:** the timer runs out.

**Scaling**
- **n = 1:** 2 dials, Absolution 15 s, and Lure Lanterns burn for 20 s.
- **n = 2–5:** 3 dials.
- **n = 6–8:** 3 dials; the Executioner's speed is 3.2 m/s.
- **Tier 2:** each dial has 8 positions, and the telegraph is 1.0 s.

**Betrayal hooks**
- **Bloodwax sniping.** Strike it when your rival is the lowest-wax climber.
- **Brightening to reset Absolution** (up to 2 times).
- **Using a Lure Lantern** to lead it onto others. The bait is also the one who gets hunted, and whoever has spent the most wax becomes the chain's end.
- **Bot betrayal window:** when a grudge target is lowest-wax and within 40 wax of Snuffing, for a bot with Spite > 50.

**Bot script**
- **Readers** (the Dimmer-trait bots first, then the highest Wit): walk Dimmed to the nearest unread dial, read it and set it.
- **Bait:** the highest-Nerve bot lights Lure Lanterns in turn, away from the Readers.
- **During Absolution:** every bot Dims.
- **Lumen** never baits.

**Rewards:** SPLIT 70. Trait pool: **Dimmer, Unremarkable, Firebrand**.
**Hidden Piece, "Merciful":** clear with **nobody ever striking the Executioner**. Reward: a Master Key and the permanent title *Merciful*.
**Codex hint:** *"Its wounds fall on the weakest. Its mercy falls in the dark."*
**Codex full:** *"Strike the Executioner and the weakest of you bleeds twice over. It hunts the brightest flame, and soot burns bright. Its sentence is written above the dials in shadow-glyphs; read it Dimmed, set it, and give it twenty seconds of darkness to kneel. Twice it will forgive the Wick who spoils the dark. Not three times."*
**System:**
- Enter: `[ DOOR 4A · THE KARMIC EXECUTIONER ] It carries out sentences. Yours is still being written.`
- Clear: `[ CLEARED ] Absolved. For now.`
- Fail: `[ FAILED ] Sentence carried out.`

---

### 6.13 `the_snuffer` · 5♛ · **The Crown: The Snuffer** (boss)
**♛ · floor 5 · every surviving climber (Smoke is relit to 30 wax on arrival, free, once) · hard cap 9:00 · Endings below**
*Fantasy: "At the top, a bell the size of a house comes down on the brightest light. It remembers every knife."*

**Layout**
- **The Crown Arena.** A round roof, radius 20 m (the 40 m arena), open to a starry sky. The Crown hovers 30 m above it.
- **The Great Wick.** 6 m tall and unlit, at the centre (0, 0, 0), ringed by the **Vigil Ring** (radius 5 m, 16 carved candle cups).
- **Five Vigil Sconces** at radius 16 m, spaced 72° apart.
- **The Snuffer.** An 8 m bronze snuffer-bell on a chain from the Crown.
- **The Crown Door** is at (0, 12, 18). It rises on a plinth in Phase 3, reached by a spiral stair from the **Ledge of Doubt**.

**Phase 1: The Vigil (about 3:00)**
- **The drop.** Every 8 s the Snuffer **drops on the climber with the highest brightness rating**, after a 1.5 s telegraph (a 4 m shadow circle and a rising organ cluster). It deals −35 wax and a 3 s daze.
- **The sconces.** Light them by touching one with a lit flame (hold E for 0.3 s), or with Firebrand at range.
  - When all 5 are lit **within a window of 1.5 s**, the Snuffer **recoils**: it rises, and the sconces are blown out after 3 s.
  - **+0.25 s** is added to the window for every **gold thread** (Pact kept all run) among the living, up to 2.5 s.
  - **3 recoils** move the fight to Phase 2.
- **Soot tendrils.**
  - **How many:** `max(2, knivesThisRun)`, capped at 8. They erupt as the Crown arena forms.
  - **What they are:** each one is a **named Knife**, e.g. "Vex → Pip, 2D The Cut". It coils around a sconce, which **cannot be lit** while bound.
  - **Clearing one** (hold E for 2 s on it):
    - its **victim** can touch it to dissolve it (forgiveness);
    - if the victim is Smoke, Burnt Out or absent, the **perpetrator** must confess at the Great Wick (hold E for 3 s, −1 Soot, 20 Embers to the victim);
    - the 2 unnamed "Nameless" tendrils (when there are fewer than 2 Knives) need **any two climbers holding it together**.

**Phase 2: Trust Fall (about 2:00)**
- **Setup.** The arena tilts, and the **Ledge of Doubt** rises: a 4 m-high, 2 m-wide stone step at the north rim. Below it lies the chalk **Catch Ring** (radius 4 m).
- **Falling.** One at a time, in the order the System calls (**most Soot first**, ties broken by most Embers), each climber stands at the ledge edge **facing away** (the camera locks facing away and shows nothing behind). They hold Jump for 1 s to **fall backwards**.
- **Catching.**
  - A catcher succeeds by grabbing the faller: LMB within 1.2 m of the landing point at the moment of impact, or a dive-catch.
  - **Caught:** +10 Embers for the catcher and the faller, and a gold flash. The Snuffer's chain loosens one link.
  - **Dropped:** −25 wax. A dropped climber at ≤ 25 wax is Snuffed and becomes Smoke.
- **Timing and refusals.** Each faller has 20 s. Then the Tower's wind pushes them off.
- **Grudges.** Bots with Trust < −30 toward the faller **step aside**, with a visible shrug.
- **Penitent Fall** (optional, for a climber with ≥ 1 Soot): fall from the 8 m top step instead. It costs **30 wax** whether or not you are caught, and it removes **1 Soot** and **1 of your tendrils**.
- **Advancing.** Phase 3 starts once every living climber has fallen.

**Phase 3: The Crown (60 s)**
- **Setup.** The Crown Door opens atop the Ledge, and the Great Wick's Vigil Ring glows. There are two ways out, and they are mutually exclusive.
- **Crown Door Claim (the solo ending).**
  - Channel 3 s at the Door (−1 s per Crown Fragment you hold, minimum 1 s).
  - A shove interrupts the channel. **Starting a claim is a Knife** (**Crown Rush**).
  - On success, that climber takes the **Everflame**: **+300 Drips** and the *Everflame* title.
  - Everyone else is Snuffed on the spot, but still gets **+40 Drips**.
- **Candlelit Vigil (the shared ending).**
  - The Vigil Ring fills while **at least 75% of living climbers** stand in it, over **10 s** in total.
  - When it completes, the Great Wick lights and the tower below lights floor by floor.
  - Every living climber gets **+150 Drips**, and so do Smoke climbers.
- **Snuffed Summit.** Neither ending happens in 60 s, or the 9:00 cap runs out in any phase. Nobody gets an ending bonus; base payouts only.

**Scaling**
- **1 climber left:** Phase 1 has 3 sconces, and Phase 2 is skipped. The Crown Door and the Vigil (standing alone for 10 s) are both open.
  - Solo, where the human is the last one alive, is a real temptation.
- **Bots alive fill the arena as usual.**
- **Sconce window:** +0.3 s for each living climber above 4.

**Betrayal hooks**
- **Crown Rush.**
- **Refusing to catch.**
- **Refusing to dissolve your victim's tendril.** Forgiveness is optional.
- **Standing Brightened** to draw the drop onto a crowd.
- **Bot logic:** at Phase 3 each bot computes `U_crown = 0.8 × Greed/100 + 0.4 × (kept pacts == 0) + 0.3 × Spite/100 − 0.6 × Loyalty/100 − 0.2 × goldThreads`.
  - If `U_crown > 0.5` it rushes, **showing its Resolve tell 1.5 s before**, and says "I'll just check it."
  - Otherwise it walks to the Vigil Ring.
  - The Drama Director (§8.7) may nudge a borderline bot to rush when fewer than 2 betrayals have happened this run.

**Codex hint:** *"Climb together. Fall alone."*
**Codex full:** *"The Snuffer comes down on the brightest light. Light all five sconces in a single breath to drive it back; your knives rise as soot and bind them, and only your victims can untie them. Then the Tower asks you to fall backwards and trust whoever is below. At the end there is a door for one, and a wick for all. Nobody remembers anyone lighting it."*
**System:**
- Enter: `[ THE CROWN ] Climb together. Fall alone.`
- Phase 2: `[ TRUST FALL ] Step back, Wick. Someone is probably there.`
- Crown ending: `[ EVERFLAME ] {Name} burns forever. Alone.`
- Vigil ending: `[ CANDLELIT ] The Knotspire is lit. Every candle still climbing thanks you.`
- Snuffed Summit: `[ SNUFFED SUMMIT ] The Tower will wait. It is good at waiting.`

---

### 6.14 Roster check and the post-slice room

| Requirement | Rooms meeting it |
|---|---|
| **12 rooms** | golem_belfry, whispering_library, fuse_tether, clockwork_foundry, liars_banquet, weighing_hall, drip_chimney, glitched_watcher, harmony_sentinel, weight_of_guilt, mimics_toll, karmic_executioner |
| **≥ 7 gimmick monsters with non-combat clears** | Echoing Golem (chord), Chrono-Slime (herd into cold), Glitched Watcher (blind pillars), Harmony Sentinel (sync strikes), Regrets (empathy/confession), Mimic (self-curse), Karmic Executioner (read in the dark and kneel). **7**, plus the Librarian as a hazard and the Snuffer as boss |
| **Among Us / Mafia** (hidden traitor + vote) | liars_banquet: the Taster, the Verdict seating vote and the Second Accusation |
| **Chained Together / PEAK** | fuse_tether (Chained); drip_chimney (PEAK) |
| **Pure puzzle** | whispering_library |
| **Glitch / E** | clockwork_foundry, glitched_watcher |
| **Social dilemma** | weighing_hall (lifeboat), plus mimics_toll and weight_of_guilt |

**The Hollow Suit** (LATER; the first post-slice room, `hollow_suit`, letter C, floors 3–4):
- **The TEAMBOUND ONE BODY homage.** 2–4 Wicks climb inside a hollow suit of armour, and each Wick drives one limb: left arm, right arm, legs, or head (vision and voice).
- **The goal.** Walk the Suit across a collapsing drawbridge to the Throne Lever.
- **The betrayal.** Whoever drives the head can see; everyone else sees only through its eye-slit feed.
- **Why it is deferred.** It needs a bespoke IK/control-sharing system beyond the component kit.

---

## 7. Social systems (exact numbers)

### 7.1 The Ledger (the Tower remembers)
- **What it records.** Every social event goes to the run **Ledger** (`src/game/ledger.ts`) as `{t, floor, door, type, actor, target, value, witnesses[]}`:
  - Knives, Slams, Pacts, cuts, catches, Relights, Drips given, Confessions, Forgives, Condemns, Notes, bets and Visitor credits.
- **Who sees what.**
  - **Witnesses** (everyone in the same room or Landing, within line of sight or 25 m) see a Knife's actor at once.
  - **Everyone else** sees "a Knife in 2D against Pip" until the next **Tribunal**, when the Tower discloses all names from that floor.
  - **Soot bands** (§7.4) are always public.
- **At run end** the Ledger becomes the results screen (§14.1): the timeline, awards and share card.

### 7.2 Knots (Pacts)
- **Tying.** Face a climber within 3 m and both hold **G**. The knot ties after 1.5 s of both holding (the offer lasts 3 s).
  - **Max 2 Pacts per climber.** You cannot knot someone you have Knifed this floor.
  - The System line `[ KNOT TIED ]` is shown to both.
- **The thread.** A glowing thread runs between the two flames: a Bezier curve with 0.5 m sag, drawn in both flame colours braided (the Oath Thread cosmetic, §12). It passes through walls and Grates.
- **Benefits while knotted:**
  - see each other's **outline through walls** at any distance;
  - **Relight** each other for **10 wax** instead of 20;
  - share a **Pact Pot**: 15% of each partner's Ember income goes into it;
  - **Kept to the Crown.** If the Pact is still intact on reaching the Crown, it becomes a **gold thread**. Each gold thread widens the Vigil sconce window by +0.25 s (§6.13) and pays each partner **+25 Drips** at run end, and the Pot is split evenly.
- **Untying** (mutual, no penalty). Both hold G for 1.5 s. The Pot is split evenly.
- **Cut the Knot** (a **Knife**).
  - **The cut.** Hold **X** for 1.2 s from anywhere. The blade glint is visible from 25 m, the thread flashes crimson, and your partner hears a rising "shhhk" note.
  - **Cinch.** The partner may **Cinch** by holding G within 8 m of you (2 wax/s). A Cinch that is held when the channel reaches 1.2 s **fails the cut**: the cutter is stunned for 1 s and Cut has a 5 s cooldown.
  - **On success:**
    - the cutter takes **25% of the partner's current Embers (max 60)**;
    - the Pact Pot **burns** (lost), and the cutter gains **+1 Soot**;
    - a bot partner gains a **Grudge** (Trust −60);
    - the **Betrayal Cam** plays: a 0.8 s cut-in at 25% speed for both climbers and every witness, framing the thread snap with the cutter's **Betrayal Snap** cosmetic (§12);
    - the System line `[ KNOT CUT ]` is shown to the whole tower.

### 7.3 Knives (the complete list)
A **Knife** is any action that takes value from another climber for your benefit. Every Knife is a visible body action with a tell. Each Knife gives **+1 Soot** and is logged.

| Knife | Where | How (tell) | What it takes / gives |
|---|---|---|---|
| **The Cut** | 2D Weighing Hall | Pull a seated climber's Chute lever (lever glow + clank, 1 s) | Victim ejected uncleared; their share goes to you |
| **Snip** | 1C Fuse Tether | X on a segment, 1.2 s (glint; Cinchable) | Frees you for the Wicket (First Through +20) |
| **Cut the Knot** | anywhere | X 1.2 s (glint; Cinchable) | 25% of the partner's Embers (max 60) |
| **Rope Cut** | 2C Drip Chimney | X on an anchored rope, 1.2 s | The climbers on it fall; you win the race |
| **Hot Drip** (if it Snuffs) | 2C | Brighten above a climber (red drip warning) | Snuffs a rival |
| **Blindfold Rip** | 2E Glitched Watcher | Grab the blindfold from behind, 1 s (white hand-flash on the victim) | Paralysis; your SOLE 65% |
| **Pinch** | 2B Liar's Banquet | Taster only, 1 s sprinkle animation | +60 if a wrong verdict follows |
| **Splash** | 4D Mimic's Toll | Throw a tonic at a climber (bottle arc) | Curses them; you take the drinker's +15 |
| **Bloodwax** (if it Snuffs) | 4A Karmic Executioner | Strike the Executioner while a rival is lowest-wax (the red chain is visible) | Snuffs a rival |
| **Crown Rush** | 5 Crown | Channel at the Crown Door (Resolve tell for bots) | The Everflame |

**Not Knives:** shoves (including Stampede shoves), Slams, sour notes, overwriting the Mimic's copy, Condemning, Clue Composer lies, false Notes, and herding a Regret. These are cheek, not crimes. They still move bots' Trust (§8.5).

### 7.4 Soot
- **The bands.** Soot shows as dark bands around your wax body, 0–3. They are drawn above every cosmetic (§1.3).
- **3 Soot = Notorious:**
  - the flame burns violet `#7A4FD8`;
  - you are outlined through walls for everyone;
  - your brightness rating is +2 (the Snuffer and the Executioner prefer you);
  - bots start at Trust −20 toward you.
- **Removing Soot** (−1 each):
  - **Confession** (3D Confessional, or at the Great Wick);
  - **Forgive:** the victim uses the context phrase "I forgive you, {name}." while facing you within 3 m, or answers Forgive to a Confession;
  - a **Penitent Fall** (§6.13).
- **Soot resets every run.** So does everything else in §7 except the Rival Register (§8.8).

### 7.5 Grudges and Trust
Bots keep a **Trust** value from −100 to 100 toward every climber (§8.5). A **Grudge** is Trust ≤ −30.
- **Seeing it.** A bot's grudge is shown by a tiny soot "x" over its head when it looks at you, and by its context phrase at Reunions.
- **Humans** have no Trust meter. Their memory is their own.

### 7.6 The Tribunal
- **When.** In the Intermission after any floor on which **at least one Knife** happened. It adds 15 s.
- **Setup.**
  - The System discloses every Knife on that floor, with names: `[ TRIBUNAL ] The Tower has three entries for you.`
  - One stone **pedestal** rises for each climber who Knifed on that floor, carrying their portrait and their Knife list, plus one **Mercy** pedestal.
- **Voting.** Every lit climber (not Smoke or Burnt Out) votes by **standing on a pedestal** within **20 s**. You cannot vote for yourself.
- **Result.** The accused with the most votes is **Branded** if their votes are more than the Mercy votes **and** at least 40% of voters. At most 1 is Branded per Tribunal.
- **Branded** (for the next floor):
  - **−25% Embers**, and the withheld Embers go to that floor's victims;
  - brightness +1, and outlined through walls with a brass brand sigil;
  - the Branded picks **last** at their next Altar;
  - each of their victims gets **+1 card** at their own next Altar.
- **Bot votes:** Brand the accused with the lowest Trust among those with value taken ≥ 20. They vote Mercy if Trust > 20 toward every accused.

### 7.7 Notes (templated, truth-checked)
- **Pinning.** At a Landing's **Note Board**, each climber may pin **1 Note per Landing**. A Note is about any door on the **current** floor. Door plaques are revealed at the start of Intermission, so veterans can pin advice before the Draft.
- **Where it shows.** A Note appears on that door's plaque during the Draft (the 2 most recent), with the author's name and flame colour.
- **Templates** (fill-ins are pickers):

| # | Note | Checked by |
|---|---|---|
| 1 | "{door}: safe for {n}." | cleared with ≤ n entrants and nobody Snuffed |
| 2 | "{door}: needs {n}+." | cleared with ≥ n, or failed with < n |
| 3 | "{door}: solo-able." | cleared by one entrant, or Ghost p ≥ 0.6 at n = 1 |
| 4 | "{door}: bring {trait}." | a clearer held that trait |
| 5 | "{door}: {name} lies here." | that climber gained Soot, or was a revealed Taster, there |
| 6 | "{door}: {name} holds doors." | that climber held a door or hatch there |
| 7 | "{door}: it's a trap." | the room failed, or ≥ 1 Knife happened |
| 8 | "{door}: stay dim." | unverifiable (never stamped) |
| 9 | "{door}: weigh everything." | unverifiable |
| 10 | "{door}: don't sit down." | a Chute Knife happened (2D only) |
| 11 | "{door}: the answer is {glyph/position}." | matches the seed's solution |
| 12 | "{door}: I'd go {letter} instead." | unverifiable |

- **Stamps.** When the room resolves, `RoomDef.truth()` stamps each checkable Note:
  - **Borne Out:** a gold stamp, and the author's plaque gains a gold pip. Honest Wick award progress, and bots +5 Trust toward the author.
  - **Proven False:** a red stamp, `[ NOTE PROVEN FALSE ]`, and bots −10 Trust toward the author.

### 7.8 Keyhole bets
- **Placing.** At the **Keyhole Rail** (§3.8), bet on any room still running on the floor below, **before its timer passes 50%**.
- **Stake:** 1–20 Embers per room. One bet per room per climber.
- **Bet types and odds:**
  - **Clear** or **Fail:** odds `clamp(0.9 / p, 1.2, 5.0)`, where p is the live estimate (a ghost room's p, or for a live room the same formula with the progress so far).
  - **A Knife happens:** fixed **3.0×**.
- **Visibility.** Winnings are paid at floor close. Bets are public on the Rail, as little flame tokens by the keyhole. **Betting on a room with your Pact partner inside, against them, flags a context phrase for bots.**
- **Burnt Out** climbers may bet their remaining Embers. Winnings go to the Ledger score only.

### 7.9 Quick-chat, emotes and the Clue Composer
**Quick-chat wheel (T hold): 24 fixed phrases.** Spoken as bell-babble in the speaker's voice pitch, with a speech bubble. There is no free text in the slice (safety and localisation). Free-text lobby chat is LATER, behind a filter.

| | | | |
|---|---|---|---|
| 1 "On three." | 7 "Brace!" | 13 "Thanks!" | 19 "Don't touch it." |
| 2 "Wait." | 8 "I have a clue." | 14 "Nice!" | 20 "Stay dim." |
| 3 "Go!" | 9 "I can carry that." | 15 "Knot?" | 21 "I'll hold the door." |
| 4 "Here." | 10 "Trust me." | 16 "No." | 22 "Which door?" |
| 5 "Follow me." | 11 "Liar!" | 17 "Yes." | 23 "I'll just check it." |
| 6 "Help!" | 12 "Sorry!" | 18 "Go on without me." | 24 "Worth it." |

**Context phrases.** Four slots on the wheel, filled from the Ledger. Only real events can be referenced:
1. "You. You {knife-verb} me in {door}." (e.g. "You. You left me on the scale.")
2. "I owe you one, {name}." (after a catch, Relight or haul)
3. "{name} is carrying a {key}. Just saying."
4. "I forgive you, {name}." (the Forgive act, §7.4)

**Clue Composer** (B rooms only). Build a claim from a template plus pickers, e.g. "The {Moth} sits in ring {2}." It is posted as a bubble tagged *said*. It may be false.

**Emotes** (B hold, 8 equipped): Wave, Bow, Shrug, Stomp (noise 9), Point, Clap, Melt (mock-faint), Flicker (flame strobe). Emote animations are cosmetics (§12).

### 7.10 Lobby betrayal settings and the Friendly preset
| Setting | Knives | Pact Cut | Taster | Chute levers | Crown Door |
|---|---|---|---|---|---|
| **Off** | disabled | disabled (untie only) | disabled (bot Host only) | inert (Step Down only) | sealed: Vigil or Snuffed Summit |
| **Physical** | enabled, except hidden roles | enabled | disabled | enabled | enabled |
| **Full** (default; solo) | all | enabled | enabled | enabled | enabled |

- **Friendly preset:** Betrayal Off, Drama Director off, bot Spite capped at 20, and the Tribunal disabled.
- **Always true:** "Word and Soot reset every run." The results screen always ends on a group shot, never a villain shot.

---

## 8. Bots (Rivals)

### 8.1 Rules for Rivals
1. **Bots perceive like players.** They see within line of sight and 25 m (Lantern-dark: 10 m, or their own light). They hear by the noise model (§6.0.5), and they know Decree words only up to their own study level.
2. **Bots have human timing.** Reaction 0.25–0.6 s (lower with high Wit and Nerve), with aim and timing noise from Wit.
3. **A bot never Knifes without the tell:** the 1.5 s **Resolve** flame (§4.5), plus a babble drop of a fourth.
4. **Bots are characters, not difficulty levels.** Each Rival has stats, a door taste, a voice, 3 signature lines and a cosmetic loadout.

### 8.2 The Rival roster (10 Rivals; 7 per solo run)
Stats run 0–100: **G**reed, **L**oyalty, **N**erve, **H**onesty, **W**it, **S**pite.

| Rival | Archetype | G | L | N | H | W | S | Flame / look | Door taste | Signature lines |
|---|---|---|---|---|---|---|---|---|---|---|
| **Moss** | Sherpa | 10 | 90 | 60 | 90 | 50 | 10 | Soft green `#9BE07A`; mossy beeswax, rope coil | C > A > D | "Brace!" · "Here." · "Nobody falls today." |
| **Vex Sulphur** | Opportunist | 85 | 20 | 70 | 30 | 60 | 50 | Acid yellow `#E8F24A`; matchstick head | D > A > E | "Worth it." · "Nothing personal." · "You'd have done it too." |
| **Pell** | Scholar | 40 | 50 | 30 | 80 | 90 | 20 | Ink blue `#6AA8FF`; spectacles, taper | B > E > A | "I have a clue." · "Follow me." · "Interesting." |
| **Lumen** | Lone Wolf | 60 | 25 | 80 | 60 | 70 | 30 | Pale lavender `#C7B6FF`; hooded tealight | E > B > C | "Go on without me." · "I work alone." · "Fine. Together." |
| **Brother Brass** | Martyr / Captain | 15 | 95 | 75 | 85 | 55 | 5 | Warm gold `#FFC45C`; brass holder, monk cowl | A > D > C | "I can carry that." · "On three." · "Go. I'll hold." |
| **Kestrel** | Show-off | 55 | 50 | 95 | 60 | 35 | 25 | Hot orange `#FF8A3D`; feather wick, racing stripe | A > C > E | "Watch this!" · "Nice!" · "That was on purpose." |
| **Maud Tallow** | Charming Liar | 70 | 40 | 50 | 15 | 80 | 40 | Rose `#FF7FA8`; tall dinner candle, pearl drips | B > D > A | "Trust me." · "Would I lie?" · "Oh, sweetie." |
| **Pip Fizzwick** | Helper | 20 | 80 | 30 | 85 | 40 | 10 | Sherbet teal `#6FF0D6`; birthday candle, confetti | follows its highest-Trust climber | "Help!" · "Thanks!" · "I'll follow you!" |
| **Ines the Taper** | Speedrunner | 65 | 35 | 85 | 60 | 65 | 20 | White-hot `#FFF6E0`; thin taper | C > E > A | "Go!" · "Keep up." · "Personal best." |
| **Gutter** | Returnee / Hunter | 50 | 20 | 70 | 40 | 50 | 85 | Smoky red `#FF5A4A`; guttered stub, wax scars | the door its top grudge takes | "Not sorry." · "Remember me?" · "You. Again." |

**Picking 7 for a solo run.** The seed picks 7, with these constraints:
- at least one betrayer-leaning Rival (Vex, Maud or Gutter);
- at least one helper (Moss, Brass or Pip);
- **Gutter** is weighted ×3 if the Rival Register says you Knifed him last run.

**Maud Tallow** is Old Tallow the Chandler's niece. She never tells him anything.

### 8.3 Door choice and Draft timing
**Door score** for each door d:
```text
score(d) = 1.0 * letterPref(d.letter)          // 1.0 / 0.6 / 0.3 for 1st/2nd/3rd taste, 0 otherwise
         + 0.8 * rewardEV(d)                   // pool * fm * om / expectedEntrants, normalised 0..1 across doors
         + 0.6 * friends(d)                    // count of climbers with Trust >= 30 on d's plate, capped at 2, /2
         - 0.8 * grudges(d)                    // count with Trust <= -30, capped 2, /2   (Gutter: sign flips to +)
         + 0.5 * notes(d)                      // +1 per Borne-Out-author note recommending, -1 warning; Trust-weighted
         + 0.4 * codex(d)                      // own study level / 4
         - 0.3 * crowd(d)                      // occupied / cap
         + N(0, 0.25)                          // personality noise, rolled once per Draft
```
- **Timing:** each bot starts walking to its best door at T−40 to T−25 s. High Nerve walks early.
- **Switching:** it re-scores every 3 s and **switches only if another door beats its current one by ≥ 0.3**.
- **Stampede:** a bot with Greed > 60 contests an occupied spot on a door whose score is ≥ 0.3 above its alternatives, and shoves (Planted is off).
- **Hold the Door:** a bot with Loyalty > 70 Braces in the frame if a climber with Trust ≥ 30 is running within 8 m of a full door.
- **Pip Fizzwick** mirrors the plate of its highest-Trust climber, which is usually the human.

### 8.4 In-room behaviour
- **Roles.** Every `RoomDef.botPlan` defines **roles** (Caller, Lure, Thrower, Reader, Runner, Bait, Volunteer…). Each role is a goal graph built from kit actions: `goTo`, `grab`, `throwAt`, `hold`, `brace`, `interact`, `dim`, `brighten`, `ping`, `say`. Roles are assigned at room start by stat fit, then refilled when a bot is Snuffed.
- **Navigation.** A navmesh is baked at room build (`three-pathfinding` or a custom grid: a 0.5 m grid with jump links). C rooms use authored path graphs (1C) or a hold graph (2C).
- **Mistakes** keep bots human:
  - timing jitter scales with (100 − Wit);
  - 5–20% action errors (dropping a book, a mistimed throw);
  - Kestrel's show-off risks;
  - Pip's misses.
- **Helping the human.**
  - Bots with Loyalty > 60 Drip a human below 30 wax within 2 m (5 wax).
  - They Relight a Snuffed ally when Trust ≥ 20 and their own wax ≥ 40.
  - They catch in Trust Falls if Trust > −30.

### 8.5 Trust, Knots and betrayal logic
**Trust events** (per bot, toward a climber; clamp −100..100; starting Trust = 0 ± Rival Register memory, max ±20):

| Event | Δ Trust |
|---|---|
| Relit me | +30 |
| Caught me (Trust Fall, dive-catch, haul) | +25 |
| Forgave me / accepted my Confession | +20 |
| Guide credit (Visitor helped my room clear) | +15 |
| Kept Pact through a floor | +10 |
| Dripped me | +2 per tap (max +10 per room) |
| Voted with me / sat with me | +5 |
| Their Note was Borne Out | +5 |
| Shoved me (outside the Stampede) | −3 |
| Their Note was Proven False | −10 |
| Branded | −10 |
| Slammed a door on me | −15 |
| Condemned me | −20 |
| Knifed me (any Knife) | −60 (a Grudge) |
| Knifed my Pact partner | −25 |

**Accepting a Knot:** `Trust >= 50`, or `Trust >= 20 && Loyalty >= 40`. **Maud** accepts every offer.
**Offering a Knot:** at a Landing, a bot with Loyalty ≥ 50 offers once per floor to its highest-Trust climber with Trust ≥ 40. It says "Knot?".

**Knife utility** (evaluated only inside the room's authored `betrayalWindows`, and at Landings for Pact cuts):
```text
U = 1.2 * (Greed/100) * gainNorm            // Embers or advantage at stake, normalised 0..1 (60 Embers = 1)
  + 1.0 * (Spite/100) * grudge               // 1 if the target is a Grudge, else 0
  - 1.0 * (Loyalty/100) * bond               // 1 if Pact partner or Trust >= 30, 0.3 otherwise
  - 0.5 * (Honesty/100)
  - 0.1 * witnesses                          // other climbers who would see it
  + director                                 // Drama Director nudge, within ±0.2
Knife if U > 1.0
```
- **Execution.** The bot shows the **Resolve tell for 1.5 s**: flame fork, lean, crimson shift, babble drop.
- **Cold feet.** If the target turns to face it within that time and Nerve < 40, the bot aborts and says "Sorry!".
- **Forgive vs Condemn:** it Forgives if `Trust + Loyalty/2 − Spite/2 > 0`. Otherwise it Condemns.
- **Pact cut:** evaluated at each Landing with `gainNorm = min(60, 0.25 × partnerEmbers) / 60`. A cut is always attempted in view (the glint shows), and Cinch works against bots.

### 8.6 Ghost Sim (bot-only rooms)
- **Per-phase success probability:**
  ```text
  p = clamp(0.55 + 0.08 * fitTraits + 0.05 * fitSize - 0.07 * (tier - 1) - 0.10 * omens, 0.20, 0.92)
  ```
  - `fitTraits` counts the traits held by entrants that are in the phase's `fitTraits` list (max 3).
  - `fitSize` is +1 if n is within the room's sweet spot, 0 if it is acceptable, and −1 if it is outside.
- **Phase duration.** Drawn uniformly from `dur`, scaled by `(1 − 0.1 × avgWit/100)`.
- **Retries.** A failed phase retries if time remains. Each retry costs 10–20 wax to a random entrant.
- **Knives.** At each betrayal window, each bot rolls a Knife with `P = sigmoid(4 × (U − 1))`.
- **Hidden Pieces:** 5% per clear, 15% if a matching trait is held.
- **Output.** All results write real Ledger events. The grate diorama and the Keyhole panel play them as captions ("Gutter chuted Pip in 2D").

### 8.7 Drama Director (solo on; lobby option in multiplayer)
- **Targets per run:**
  - **1–3 betrayals** that the human witnesses (at least one toward the human, and at most 1 Knife on the human per floor);
  - **at least 2 Pacts** kept between the human and a bot;
  - **at least 1 rescue** of the human by a bot (a catch, Relight, haul or door hold).
- **Levers:**
  - nudges bot utilities within ±0.2;
  - biases bot door scores by ±0.2, toward or away from the human;
  - picks which Rival offers the Knot.
- **Limits.**
  - It never skips a tell.
  - It never Knifes a human who is below 25 wax on floors 1–2 (the **mercy rule**).
  - It never forces a room failure.

### 8.8 Rival Register (persistent)
- **Storage.** Stored in the local profile (IndexedDB via `idb-keyval`, with a localStorage fallback).
- **Per Rival:** runs together, Knives by and against you, Pacts kept, rescues, and the last context line.
- **Effects:**
  - starting Trust = clamp(5 × pactsKept + 5 × rescuesByYou − 10 × knivesByYou, −20, 20);
  - **callback barks** at the Foot ("Last time, you left me on the scale.");
  - the Gutter return weighting (§8.2).
- **Viewing and resetting.** The profile screen shows the Register as a wall of portraits with little tallies. A reset button is in Settings.

---

## 9. Progression

### 9.1 Layers
| Layer | Lives for | What it is |
|---|---|---|
| Traits and fusions | one run | 4 slots, from the Shared Altar and the Anvil |
| Keys and run items | one run | Brass, Master, Black, Crown Fragment, Heartcandle, Frozen Second, the Lens… |
| Soot, Trust, Pacts | one run | §7 |
| Unique Titles | forever | Earned by feats; each gives +1 private Altar card for the rest of the run you earn it in, and unlocks things (§9.7) |
| Codex study levels | forever | Un-redact Clear Conditions (§6.0.3) |
| Origins | forever | Sidegrade starting bodies (§9.5) |
| Rival Register | forever | §8.8 |
| Cosmetics, Wick Level, Wickbook | forever | §11–§12 |

There is **no permanent power** except knowledge (the Codex) and Origins, which are sidegrades.

### 9.2 The Shared Altar
- **When.** On a room clear, a brass Altar rises at the exit with **cards = clearers + 2** face up (minimum 3).
  - Tithed: +1 card.
  - Every Unique Title earned **this run** gives its holder **+1 private card** that only they see.
- **What is on the cards.** The room's 3 `traitPool` traits are always included. The rest are drawn from the global pool (weighted away from traits already held), plus filler cards: **+20 wax**, **+15 Embers**, **Blank** (take nothing and keep your slot).
- **Pick order.**
  1. **Bonus holders**, in the order they earned their bonus: First Through, Last Note, Tome, Verdict, Heartcandle.
  2. **Everyone else**, in the order they reached the Altar plate.
  3. **Branded climbers last.**
- **Time.** Each pick has a 15 s shared window. An AFK pick gets a random card.
- **Picking.** Walk into a card to take it. **Everyone sees who took what.**
- **Slots.** 4 trait slots. Taking a 5th means choosing one to discard (it shatters).

### 9.3 Traits (16)
Active traits bind to keys 1–4 in slot order. Wax costs are in brackets.

| # | Trait | Type | Effect | Cooldown |
|---|---|---|---|---|
| 1 | **Three-Second Rewind** | Active | Snap your own position, velocity and wax back to 3 s ago (a flame-trail ghost shows where). Others are unaffected. | 1 per floor |
| 2 | **Echo Wick** | Active | Records your next 6 s, then replays them as a translucent Echo that can ring forks, strike sconces, pull levers and weigh 30 on plates. It cannot grab climbers. | 25 s |
| 3 | **Resonance** | Active | Hum a 6 m pulse: rings every Fork and Bell in range for its ringTime, and lowers the Librarian's noise meter by 1. | 6 s |
| 4 | **Insight** | Passive | The hint ladder fires at 35% / 60% for you. +1 Decree reveal rank. | — |
| 5 | **Language of Wax** | Passive | Read wax-script without Brightening. Liar books, poisoned rims and tonic labels read from 6 m. | — |
| 6 | **Blindfold Sense** | Passive | While blindfolded or Dimmed: echo outlines within 8 m and double hum range. Immune to the first Paralysis each room. | — |
| 7 | **Dimmer** | Passive | No Dim speed penalty. ShadowGlyphs from 10 m. Untargetable by light-seekers beyond 3 m while Dimmed. | — |
| 8 | **Hollow Core** | Passive | −15 max wax. You count ×0.6 on Scales. −30% fall damage. | — |
| 9 | **Lead Wick** | Passive | Throws +25% speed. Thrown objects count ×1.5 mass for rings and topples. Shove impulse +20%. | — |
| 10 | **Cold Wax** | Passive | Freeze and Paralysis −60% duration. Grip and rim-hang time +50%. Holds melt 1 s slower under you. | — |
| 11 | **Firebrand** | Active | Flick your flame up to 10 m: lights a sconce, lantern or Vigil sconce at range, or relights a Holder at range [5 wax]. | 3 s |
| 12 | **Snip** | Passive | Your Cut channel is 0.6 s instead of 1.2 s. Frayed stacks, to a 0.5 s floor. | — |
| 13 | **Kinship** | Passive | Your Drips give 10 wax per tap (the cost is still 5). Relights cost you 5 less. Pact partners earn +10% Embers. | — |
| 14 | **Last Light** | Passive | Once per floor, a hit that would Snuff you leaves you at 1 wax, glowing white and invulnerable for 3 s. | 1 per floor |
| 15 | **Unremarkable** | Passive | Brightness rating −3. Hunters prefer anyone else. Notes you pin are anonymous. | — |
| 16 | **Keysmith** | Passive | Reveals X alcoves. Brass Keys count as Master at the Chandler. +15% key drop chance. | — |

### 9.4 Fusions (the Anvil; 25 Embers; the result uses 1 slot and frees 1)

| Fusion | Recipe | Effect |
|---|---|---|
| **Burning Dialect** | Language of Wax + Firebrand | Firebrand leaves a wax-script mark (a persistent ping, 60 s, seen by allies). Reveals X alcoves. Wax-script readable at 12 m. |
| **Choir of One** | Resonance + Echo Wick | Your Echo hums too. Resonance rings two chosen Forks (the two nearest your aim), 6 s cooldown. You can form a chord alone. |
| **Second Chance Oath** | Three-Second Rewind + Kinship | Rewind also rewinds your Pact partner if they are within 10 m. 1 per floor. |
| **Moth-Sight** | Blindfold Sense + Dimmer | While Dimmed: outlines of climbers and monsters through walls within 10 m, and you cannot be Paralysed. |
| **Tidal Weight** | Hollow Core + Lead Wick | Active (2 s cooldown): toggle your Scale weight between ×0.5 and ×2. |
| **Cutpurse's Eye** | Snip + Insight | See every climber's Embers, keys and traits over their heads. Cut the Knot takes 35% (max 80). |
| **Steam Heart** | Cold Wax + Last Light | Immune to Freeze. Last Light triggers twice per floor. |
| **Beacon** | Unremarkable + Firebrand | Firebrand plants a decoy flame (brightness 5, 10 s) that light-seekers chase, 8 s cooldown. |

### 9.5 Origins (choose at run start)
Every Origin has the **same height, hitbox and flame position** (§1.3). Only proportions and stats differ.

| Origin | Available | Max wax | Other | Silhouette |
|---|---|---|---|---|
| **Lamplighter** | start | 100 | Relight costs halved. Starts with a Relight glow on the HUD for Holders within 30 m. | Classic pillar candle, brass snuffer hat |
| **Taper** | start | 80 | Run 5.4 m/s. Hang and grip costs −25%. | Slim tall taper |
| **Votive** | start | 120 | Run 4.75 m/s. Brace mass ×5. | Squat, in a glass cup |
| **Birthday Candle** | start | 90 | Self-Relight once per floor (§5.3). | Striped spiral candle |
| **Tealight** | unlock: title *Slime-Warden* or 3 Crown arrivals | 70 | Counts ×0.5 on Scales. Dive 9 m/s. | Round tin tealight |
| **Matchstick** | unlock: 5 Unique Titles, or 1 Everflame | 60 | Starts with Firebrand and Snip, and **1 Soot** ("born guilty"). | Red-headed match |

### 9.6 Keys and run items

| Item | Source | Use |
|---|---|---|
| **Brass Key** | Hidden Pieces, E rooms, Market (30) | Opens a Landing **Brass Chest** (20 Embers or a trait card), or −10 Embers at the Market |
| **Master Key** | E rooms (40%), some Hidden Pieces | Opens the Anvil's reliquary: one free fusion, or a choice of 3 traits |
| **Black Key** | 1B and 2B Hidden Pieces | Reveals and opens the X alcove on any Landing (the Market spawns there if it didn't roll) |
| **Crown Fragment** | 2D Hidden Piece; 1 is sold in the Market at 60 | −1 s Crown Door channel each |
| **Heartcandle** | 3A bonus; Market (40) | Self-Relight to 40 wax, or +40 wax |
| **Frozen Second** | 1E Hidden Piece; Market (35) | Pauses your room's timer for 10 s, once |
| **Watcher's Lens** | 2E Hidden Piece | Reveals X alcoves and ShadowGlyphs within 10 m for the rest of the run |
| **Martyr's Mark** | 4D drinker | One free Relight |

- **Items are physical.** Keys and items are small carried props (0.2 kg) that are also shown on the HUD.
- **Snuffed:** they drop at your Holder, where **anyone** can pick them up (not a Knife: a Holder is fair game).
- **Grates:** they can be passed through Grates.

### 9.7 Unique Titles (permanent; the account shows them)
- **Room titles:**
  - **1A** *Golem Singer*;
  - **1B** *Quiet Hands*;
  - **1C** *Keeper of the Line*;
  - **1E** *Slime-Warden* (a solo clear), *Sleeper*;
  - **2B** *Second Guess*;
  - **2D** *Counterweight*;
  - **2C** *Doorholder*, *No Rest*;
  - **2E** *Unseen* (a solo clear), *Unflinching*;
  - **3A** *One-Breath*;
  - **3D** *Scapegoat*;
  - **4D** *Empty Hands*;
  - **4A** *Merciful*.
- **Run feats:**
  - *Everflame* (Crown claim);
  - *Candlelit* (Vigil ending);
  - *Clean Hands* (reach the Crown with 0 Knives, in a run with at least 1 Knife by others);
  - *Notorious* (reach 3 Soot);
  - *Honest Wick* (3 Notes Borne Out in one run);
  - *Catcher in the Dark* (5 Trust Fall catches, lifetime).
- **That is 21 titles** (15 room titles + 6 run feats).
- **When you earn one:** `[ UNIQUE TITLE ACQUIRED ]`, +1 private Altar card for the rest of that run, and +15 Drips (§11.4).
- **Equipping.** Equip 1 to show under your name.
- **What titles unlock:** Origins (§9.5), **Everflame-tier cosmetics** (§12.5) and Codex lore pages.

### 9.8 The Codex
- **Study levels per room:**
  - **0 Unseen:** grey silhouette.
  - **1 Seen:** you drafted near it, entered it, or watched it through a Keyhole or Grate. Shows the name and hint.
  - **2 Survived:** you were inside when it ended. Shows the monster sketch and tells.
  - **3 Cleared:** the full entry and the full Decree.
  - **4 Cleared Solo:** a lore line and a gold border.
- **Where it shows.** Plaques show the hint at level 1 or higher. Redaction uses study level + Scars (§6.0.3).
- **Where to read it.** The Codex is a leather book on the Landing (the Note Board lectern) and in the main menu. Each entry has a procedurally rendered sketch: the room's monster, rendered with an ink shader.
- **Bots** have per-Rival study levels in the Register. They start at 1 for every room, and Pell at 3.

### 9.9 Wick Level (meta)
- **XP.** 1 XP per Drip earned. Level n needs `400 + 100 n` XP. The soft cap is Level 30.
- **Every level:** +50 Drips and one of these:
  - an emote;
  - a System Window theme colour;
  - a Codex lore page;
  - a Wickbook tier skip on levels 10, 20 and 30 (mock only if premium).
- **Levels never grant power.**

---

## 10. The Landing (hub) and minigames

### 10.1 Landing layout
- **The disc.** A round stone disc, **radius 18 m**, open to the cloud sea, ringed by a 1 m parapet. Warm, lit and loud: the "waltz" half of the rhythm.
- **The doors.** 3–4 doors on the **north arc** at radius 16 m, spaced 40° apart and centred on north. Each door is 4 m tall with a plate in front of it (§3.6) and a plaque.
- **The stairwell well.** Centre, radius 3 m, where arrivals climb up from below. Its rim carries the **Keyhole Rail** (§3.8).
- **Stations** (the arc is the Landing's south half, facing the doors):

| Station | Position | Notes |
|---|---|---|
| **Relight Font** | (−8, 0, −6) | Relight Smoke for 30 Embers; +25 wax for 10 Embers (max 2 per Landing) |
| **Anvil** | (8, 0, −6) | Fusions (25 Embers); Master Key reliquary |
| **Note Board + Codex lectern** | (0, 0, −12) | §7.7, §9.8 |
| **The Mirror** (wardrobe) | (−12, 0, −2) | Change your cosmetics on Landings. Cosmetics change the look only |
| **Brass Chest** (if rolled) | random rim spot | Needs a Brass Key |
| **Pinky Promise Booth** | (−11, 0, −11) | §10.2 |
| **Snuff Tag court** | the whole open floor | Pillars ring (4 × 0.8 m) at radius 10 m |
| **Wax Stack plinth** | (11, 0, −11) | §10.2 |
| **Rumour Dice table** | (5, 0, −14) | §10.2 |
| **Tide clock** | on the stairwell rim | Counts the Tide (§3.3) |
| **X alcove** (hidden) | behind a random parapet panel | §10.3 |

- **The Foot** (floor 1's Landing) adds tutorial prompts, the Knot demo with Moss, and a dummy plate. Its warm-up is 60 s.

### 10.2 Minigames
- **Winnings cap:** **20 Embers per climber per Landing** from all minigames combined. The Tower pays.
- **Bots join** empty seats after 5 s.
- **Joining:** walk into a minigame's ring.

| # | Minigame | Players | Length | Rules | Payout | Scope |
|---|---|---|---|---|---|---|
| 1 | **Pinky Promise Booth** (split or steal) | 2 | 20 s | Two Wicks face each other through a slot. Each secretly pulls **Split** or **Steal** within 10 s, then the curtain drops. | Split/Split: **10 each**. Steal vs Split: **20** to the stealer, 0 to the splitter. Steal/Steal: **0 each + a clown horn**. Once per climber per Landing. Stealing = bot Trust −10 (not a Knife). | MUST |
| 2 | **Snuff Tag** | 3–8 | 60 s | One Wick wears the Snuffer Bell hat. Tagging (shove contact) passes it on, with a 2 s no-tag-back. Dimming hides you beyond 4 m. | Everyone not holding the bell at 0:00 gets **+4**. The holder gets 0 and a soot smudge (cosmetic, 1 floor). | MUST |
| 3 | **Wax Stack** (the Babel homage) | 1–8 | 60 s | Stack procedural wax blocks (1–5 kg; cubes, wedges, bells) on a wobbling plinth. Height is measured once the stack has been stable for 2 s at the buzzer. Anyone may shove the stack. | **1 Ember per 0.25 m**, max 12, split among contributors by blocks placed. | MUST |
| 4 | **Rumour Dice** (liar's dice) | 2–6 | ~90 s | Each Wick shakes 3 glyph dice (Eye, Key, Moth, Bell, Crown, Star) in a cup. Bid "at least N {glyph}s on the table". Raise or call "Liar!". | 5 Ember buy-in; the winner takes the pot + 5 from the Tower. | SHOULD |

**Bot minigame behaviour**
- **Pinky Promise:** P(Steal) = 0.2 + 0.5 × Greed/100 − 0.3 × (Trust ≥ 30) + 0.3 × (Grudge).
- **Rumour Dice:** bots bid by probability. Honesty sets how often they bluff.

### 10.3 Old Tallow's Market (the X alcove)
- **Revealing the alcove.** With 35% chance per Landing on Landings 2–4, a parapet panel hides a verdigris-lit alcove (`#00E5C0`). Any of these reveals it:
  - a Black Key used on the panel;
  - Keysmith, Burning Dialect or the Watcher's Lens (the panel glows);
  - Knocking on the right panel. Knock (E on a panel) plays a hollow sound only on the true panel, so this is findable by anyone patient.
- **Old Tallow the Chandler.** A 2.5 m many-armed candle merchant who melts and re-forms as he talks ("Ahh. A customer. Or a thief. Same wax.").
- **Stock:** 4 random items per visit. **Each item is sold once per Landing, to the first buyer**, so this is a race.

| Item | Embers |
|---|---|
| Heartcandle | 40 |
| Tonic of Clarity (+1 Decree reveal rank for this floor) | 20 |
| Piton ×2 | 10 |
| Frozen Second | 35 |
| Brass Key | 30 |
| Crown Fragment | 60 |
| Trait Reroll (reroll your next Altar's cards once) | 15 |
| Tallow Block (+30 wax, above max up to +10) | 15 |
| Spare Blindfold | 10 |
| Rumour (reveals one Ledger name from the floor below, before the Tribunal) | 25 |

---

## 11. Economy

### 11.1 Currencies
| Currency | Scope | Earned by | Spent on |
|---|---|---|---|
| **Embers** | one run | rooms, bonuses, First Up (+5), minigames (≤ 20 per Landing), bets, Pact Pot, Knives | Relight Font, heals, the Anvil, the Market, bets, Rumour Dice |
| **Drips** | account | the run-end conversion, Wick Levels, the Wickbook | cosmetics (all rarities except Everflame) |
| **Sparks** | account (**MOCK**) | the mock store; the premium Wickbook (pays back 1,000) | Beeswax and higher cosmetics, the premium Wickbook |

### 11.2 Ember targets (per climber, per run)
- **Typical room share:**
  - floor 1: about 15–30;
  - floor 4: about 35–60.
  - Worked example: at floor 4, `mimics_toll` with n = 5 gives total `90 × 1.75 × 1.6 = 252`, so **50 each**.
- **Gross per run:** 200–350 Embers. Sinks take 60–150.
- **Target Embers held at run end:** **120–220**.

### 11.3 Sinks and caps
- **Sinks:** Relight 30; heal 10; fusion 25; Market 10–60; bets; Rumour Dice.
- **Caps:**
  - minigames: 20 per Landing;
  - bet stake: 20;
  - Cut the Knot: 60 (Cutpurse's Eye: 80);
  - First Up: 5.

### 11.4 Run end: Embers to Drips
```text
Drips = floor(0.5 * EmbersHeld)
      + 20 * roomFloorsCompleted            // floors 1–4 where you cleared a room or visited one to clear
      + endingBonus                         // Everflame 300 (claimer) / 40 (others) · Candlelit 150 · Snuffed Summit 0
      + 25 * goldThreads                    // Pacts kept to the Crown
      + 15 * uniqueTitlesEarnedThisRun
      + 50 if first run of the day
```
- **Target: 150–350 Drips for a typical run.** For example, 160 Embers held → 80, + 80 floors, + 150 Candlelit, + 25 = **335**.
- **An Everflame claimer** usually lands between 450 and 500 Drips.
- **Burnt Out climbers** convert the Embers they held, plus floors completed.

### 11.5 Time to earn (the pacing promise)
| Rarity | Drips | Runs at ~250 Drips |
|---|---|---|
| Tallow | 300 | ~1 |
| Beeswax | 900 | ~4 |
| Tapered | 2,400 | ~10 |
| Gilded | 7,200 | ~29 (aspirational) |
| Everflame | earned only | Titles and feats |

### 11.6 The mock premium store (Sparks)
- **Nothing is real.** No payment code, no SDKs and no real-money strings in the slice.
- **The Spark packs** (500 / 1,100 / 2,400 Sparks) are labelled **Pack I / II / III**. The button opens a confirm dialog with a permanent banner: **"MOCK STORE: no real money. Sparks are granted locally for testing."** Sparks are stored in the local profile.
- **What Sparks buy.** Beeswax+ items (at the Spark price in §12) and the premium Wickbook. **Sparks never buy Embers, traits, keys, Origins or anything that affects play.**
- **Converting.** There is no Drips↔Sparks conversion.

---

## 12. Cosmetics and shop

### 12.1 Rules
- **No gameplay effect.** Cosmetics never change height, hitbox, flame position, light radius, brightness rating or sound loudness.
- **Flame colours** are normalised to a luminance of at least 0.6 and must stay distinguishable from the crimson `#FF3D6E` Cut flash and the violet `#7A4FD8` Notorious flame. No cosmetic flame may use a hue within 15° of either.
- **Soot bands, the Resolve fork, Branded sigils and Pact threads** always draw on top.
- **Everything is procedural.** Geometry comes from Three.js primitives and Lathe/Tube/Extrude geometry, plus shader parameters. Textures are generated at boot. A cosmetic is a data record: `{id, slot, rarity, price, params}`, rendered by `src/cosmetics/`.

### 12.2 Slots (10)
| Slot | What it changes |
|---|---|
| **Wax** | Body colour, pattern and surface shader (Lathe body stays the same) |
| **Flame** | Flame gradient, flicker style and spark particles |
| **Wick** | The wick string's shape and material on top of the body |
| **Holder** | The dish or stand under the feet |
| **Shadow** | The projected silhouette your flame casts on walls (a fake decal, §13.2) |
| **Smoke** | Your wisp form while Snuffed |
| **Knock** | The sound and particle of your shoves, knocks and plate claims |
| **Oath Thread** | Your half of any Pact thread |
| **Betrayal Snap** | The 0.8 s Betrayal Cam effect when you Cut |
| **System Window** | The theme of your own System windows (colour and border only; the text is always the same) |

Emotes (8 default: Wave, Bow, Shrug, Stomp, Point, Clap, Melt, Flicker) are unlocked through Wick Levels and the Wickbook. They are not part of the 60-item shop catalogue.

### 12.3 Rarities and prices
| Rarity | Colour | Drips | Sparks (mock) |
|---|---|---|---|
| Default | `#8A8F98` | free | — |
| **Tallow** | `#C9C3B6` | 300 | — (Drips only) |
| **Beeswax** | `#F2B134` | 900 | 180 |
| **Tapered** | `#9B6DFF` | 2,400 | 480 |
| **Gilded** | `#FFD76A` | 7,200 | 1,200 |
| **Everflame** | `#FFF1C1` with animated shimmer | earned only | — |

### 12.4 The catalogue (60 items)
Unlocks written as "Title: X" are earned-only prestige items (§12.5). Parameters are the defaults in `src/cosmetics/catalog.ts`.

| # | id | Name | Slot | Rarity | Price / unlock | Procedural visual |
|---|---|---|---|---|---|---|
| 1 | `wax_paraffin` | Plain Paraffin | Wax | Default | free | Ivory `#F3EBDD`; soft wrap-lit SSS; 3 random drip bumps |
| 2 | `wax_honeycomb` | Honeycomb | Wax | Tallow | 300 | Amber `#E8A33D` with a hex-cell normal pattern (shader hex grid, 0.04 m cells) |
| 3 | `wax_speckled_egg` | Speckled Egg | Wax | Tallow | 300 | Duck-egg blue `#BFE3DA` with brown voronoi specks (threshold 0.92) |
| 4 | `wax_marbled_rose` | Marbled Rose | Wax | Tallow | 300 | Pink `#F4B6C2` and cream marble: domain-warped noise bands |
| 5 | `wax_mint_stripe` | Mint Stripe | Wax | Tallow | 300 | Barber-pole spiral stripes, mint `#9FE8C7` / white, 6 turns |
| 6 | `wax_stained_glass` | Stained Glass | Wax | Beeswax | 900 / 180 | Voronoi cells in 5 jewel tones with dark leading lines; the flame lights them from inside (emissive = light proximity) |
| 7 | `wax_lava_lamp` | Lava Lamp | Wax | Beeswax | 900 / 180 | Slow 3D-noise blobs of orange `#FF7A3D` in purple `#5B2A86`, rising at 0.05 m/s |
| 8 | `wax_frosted_pine` | Frosted Pine | Wax | Beeswax | 900 / 180 | Deep green `#2F6B4F` with white frost noise growing from the base |
| 9 | `wax_night_sky` | Night Sky | Wax | Tapered | 2,400 / 480 | Navy `#0F1A3A` with twinkling star points (hash noise), and a slow meteor streak every 8 s |
| 10 | `wax_porcelain` | Porcelain Crackle | Wax | Tapered | 2,400 / 480 | Glossy white with blue crackle lines (voronoi edges) that glow faintly as wax drops |
| 11 | `wax_molten_gold` | Molten Gold | Wax | Gilded | 7,200 / 1,200 | Metallic gold (metalness 0.8) with flowing emissive seams; drips leave gold decals |
| 12 | `wax_crown` | Crown Wax | Wax | Everflame | Title: *Everflame* | White-gold pearlescent (iridescence 1.0) with a slow rising glitter field; a tiny crown relief at the base |
| 13 | `flame_candle` | Candle Flame | Flame | Default | free | Classic gradient `#FFF4C2`→`#FF9A3D`→transparent; 1.2 Hz sway |
| 14 | `flame_blue_pilot` | Blue Pilot | Flame | Tallow | 300 | Gas-blue core `#7FD1FF` (luminance-normalised) with a yellow tip; steady, low flicker |
| 15 | `flame_rose` | Rose Fire | Flame | Tallow | 300 | Pink `#FF9EC4`→white; soft petal-shaped sparks |
| 16 | `flame_sparkler` | Sparkler | Flame | Beeswax | 900 / 180 | Standard flame + 12 fizzing spark streaks per second (short-lived line particles) |
| 17 | `flame_pixel` | Pixel Flame | Flame | Beeswax | 900 / 180 | Flame shader quantised to a 12 × 16 pixel grid with a 4-colour palette; flickers at 8 fps |
| 18 | `flame_aurora` | Aurora | Flame | Tapered | 2,400 / 480 | Hue slowly cycles green→teal→violet (the notorious hue band skipped); ribbon trails when moving |
| 19 | `flame_phoenix` | Phoenix Crest | Flame | Gilded | 7,200 / 1,200 | A tall crest flame with two wing-shaped side tongues that flap on jump; ember feathers drift |
| 20 | `flame_candlelit_halo` | Candlelit Halo | Flame | Everflame | Title: *Candlelit* | Warm flame with a thin orbiting ring of 8 tiny candle flames |
| 21 | `wick_cotton` | Cotton Wick | Wick | Default | free | Black curled wick (Tube geometry, 3 cm) |
| 22 | `wick_braided` | Braided Twine | Wick | Tallow | 300 | Three-strand braid (3 twisted tubes), natural `#CDB892` |
| 23 | `wick_traffic_cone` | Traffic-Cone Wick | Wick | Beeswax | 900 / 180 | A tiny orange-and-white striped cone as the wick (the flame sits on its tip) |
| 24 | `wick_coiled_spring` | Coiled Spring | Wick | Tapered | 2,400 / 480 | A metal spring (helix tube) that boings with secondary motion on landing |
| 25 | `wick_knotted_gold` | Knotted Gold | Wick | Everflame | Title: *Keeper of the Line* + 10 lifetime gold threads | A gold thread tied in a figure-eight knot, shining along its length |
| 26 | `holder_tin_dish` | Tin Dish | Holder | Default | free | A shallow tin dish with a loop handle (Lathe) |
| 27 | `holder_teacup` | Teacup | Holder | Tallow | 300 | A porcelain teacup and saucer, blue rim `#6AA8FF` |
| 28 | `holder_chamberstick` | Brass Chamberstick | Holder | Beeswax | 900 / 180 | A brass chamberstick with a finger ring and a drip pan, roughness 0.3 |
| 29 | `holder_wine_bottle` | Wine Bottle | Holder | Tapered | 2,400 / 480 | A green glass bottle neck (transmission 0.9) with a wax waterfall down the side |
| 30 | `holder_candelabra` | Candelabra Arm | Holder | Gilded | 7,200 / 1,200 | An ornate gilded arm with two unlit side cups that light while Brightened (cosmetic only) |
| 31 | `holder_blank_mask` | Blank Mask | Holder | Everflame | Title: *Empty Hands* | A face-up white porcelain mask as your dish; its eye holes glow your flame colour |
| 32 | `shadow_plain` | Plain Shadow | Shadow | Default | free | A projected silhouette of your own body |
| 33 | `shadow_rabbit` | Rabbit Ears | Shadow | Tallow | 300 | Shadow-puppet rabbit ears that twitch when idle |
| 34 | `shadow_dragon` | Dragon | Shadow | Beeswax | 900 / 180 | A long-necked dragon silhouette; its wings open when you jump |
| 35 | `shadow_crowd` | Crowd of Shadows | Shadow | Tapered | 2,400 / 480 | Five small silhouettes of different candles that follow a beat behind your shadow |
| 36 | `shadow_tall_one` | The Tall One | Shadow | Gilded | 7,200 / 1,200 | A shadow twice your height wearing a crown; it bows when you bow |
| 37 | `smoke_grey_wisp` | Grey Wisp | Smoke | Default | free | Curl-noise ribbon of grey smoke with a faint face of two dots |
| 38 | `smoke_soap_bubbles` | Soap Bubbles | Smoke | Tallow | 300 | An iridescent bubble cluster that pops and re-forms |
| 39 | `smoke_ink_squid` | Ink Squid | Smoke | Beeswax | 900 / 180 | Ink-black smoke with 6 trailing tentacle ribbons |
| 40 | `smoke_moth_swarm` | Moth Swarm | Smoke | Tapered | 2,400 / 480 | 20 tiny paper moths circling a faint ember (instanced) |
| 41 | `knock_knuckle` | Knuckle Tap | Knock | Default | free | A wooden tap (short band-passed noise), with a dust puff |
| 42 | `knock_woodblock` | Woodblock | Knock | Tallow | 300 | A pitched woodblock (a 900 Hz decaying sine with a noise click) and wood chips |
| 43 | `knock_cowbell` | Cowbell | Knock | Beeswax | 900 / 180 | An 808-style cowbell (540/800 Hz squares through a bandpass) and a star-shaped ring decal |
| 44 | `knock_glass_harmonica` | Glass Harmonica | Knock | Tapered | 2,400 / 480 | A crystal tone with partials 1 / 2.32 / 4.25 and a shimmering ripple ring |
| 45 | `thread_braided_light` | Braided Light | Oath Thread | Default | free | Two strands, braided, in both flame colours |
| 46 | `thread_red_string` | Red String of Fate | Oath Thread | Tallow | 300 | A single red string `#E83A3A` with a tiny knot at its midpoint |
| 47 | `thread_daisy_chain` | Daisy Chain | Oath Thread | Beeswax | 900 / 180 | A chain of little daisies every 0.3 m (instanced), swaying |
| 48 | `thread_barbed_promise` | Barbed Promise | Oath Thread | Tapered | 2,400 / 480 | Dark wire with thorn barbs; blooms a flower at each end while kept |
| 49 | `thread_constellation` | Constellation | Oath Thread | Gilded | 7,200 / 1,200 | Star points joined by faint lines, drawing new stars as the Pact ages |
| 50 | `snap_thread` | Thread Snap | Betrayal Snap | Default | free | Slow-motion thread snap, crimson fibres drifting |
| 51 | `snap_scissors` | Scissor Snip | Betrayal Snap | Tallow | 300 | Giant ghostly scissors close across the frame |
| 52 | `snap_balloon` | Balloon Pop | Betrayal Snap | Tallow | 300 | The thread turns into a balloon string; the balloon pops into confetti |
| 53 | `snap_paper_tear` | Paper Tear | Betrayal Snap | Beeswax | 900 / 180 | The screen tears like paper along the thread line (shader displacement) |
| 54 | `snap_monocle` | Villain Monocle | Betrayal Snap | Beeswax | 900 / 180 | A monocle glints onto your flame; a curly moustache puff of smoke |
| 55 | `snap_opera_curtain` | Opera Curtain | Betrayal Snap | Tapered | 2,400 / 480 | Red velvet curtains sweep in from both sides and part again, with a single spotlight |
| 56 | `sys_tower_blue` | Tower Blue | System Window | Default | free | `#0B1630` panel, `#5CE1E6` border (§14.2) |
| 57 | `sys_parchment` | Parchment | System Window | Tallow | 300 | `#EFE3CF` panel, `#8A5A2B` ink border, deckle edge |
| 58 | `sys_terminal` | Terminal Green | System Window | Beeswax | 900 / 180 | `#07140B` panel, `#39FF88` border, scanlines |
| 59 | `sys_stained_glass` | Stained Glass Pane | System Window | Tapered | 2,400 / 480 | Leaded-glass border in 5 jewel tones; panel `#101021` |
| 60 | `sys_crown_seal` | Crown Seal | System Window | Everflame | Title: *Clean Hands* | Ivory panel `#FFF8E6` with a gold wax seal stamped on every window |

**Counts:** Default 10 · Tallow 15 · Beeswax 14 · Tapered 11 · Gilded 5 · Everflame 5 = **60**. By slot: Wax 12, Flame 8, Wick 5, Holder 6, Shadow 5, Smoke 4, Knock 4, Oath Thread 5, Betrayal Snap 6, System Window 5.

### 12.5 Earned-only prestige items (never sold, never in the Wickbook)
| Item | Unlock |
|---|---|
| Crown Wax | Title *Everflame* (claim the Crown Door) |
| Candlelit Halo | Title *Candlelit* (light the Great Wick) |
| Knotted Gold | Title *Keeper of the Line* + 10 lifetime gold threads |
| Blank Mask | Title *Empty Hands* (4D Hidden Piece) |
| Crown Seal | Title *Clean Hands* |

**Rival loadouts.** Each Rival has a fixed loadout drawn from this catalogue, e.g. Kestrel wears Sparkler + Traffic-Cone Wick. You can *see* a cosmetic before you own it.

### 12.6 The shop: daily rotation
- **6 slots, seeded by the UTC date** (deterministic offline):
  - **Featured** (48 h): 1 Tapered or Gilded item, with a turntable preview on a Wick in your loadout.
  - **Daily ×4** (24 h): 2 Tallow, 1 Beeswax, and 1 Beeswax or Tapered.
  - **Tallow Bargain** (24 h): 1 Tallow item at **200** Drips.
- **The Vault promise:** every non-Everflame item returns to the rotation within **45 days**. The Collection screen shows owned and unowned items and the date each was last seen.
- **What the shop never does:** no fake "was/now" prices, no countdown timers under 24 h, and no bundles in the slice.
- **Try-on.** Every item can be tried on in the Wardrobe mirror before buying.

### 12.7 The Wickbook (season pass; Season 1 "LATCHLIGHT")
- **Structure.** 40 tiers, 250 XP per tier. XP = Drips earned (the same stream as Wick Level). A season lasts about 8 weeks, which is about 40 runs for all 40 tiers.
- **Premium track:** **950 Sparks** (mock), and it **pays back 1,000 Sparks** across its tiers.
- **Pass items** are catalogue variants: recolours and parameter variants of catalogue items, flagged `passVariant`. They return to the shop as Tapered after the season (the Vault promise).

| Tiers | Free track | Premium track (mock) |
|---|---|---|
| 1 | 100 Drips | Wax variant "Latchlight Brass" (Molten Gold recolour, copper `#D98C4A`) |
| 2–5 | emote "Curtsy" (3), 100 Drips (5) | 100 Sparks (2), Knock variant "Latch Clack" (4) |
| 6–10 | Tallow Wick variant (8), 150 Drips (10) | Oath Thread variant "Brass Chain" (7), 150 Sparks (10) |
| 11–15 | System Window colour "Ember" (12), 100 Drips (15) | Shadow variant "Keyhole" (13), 150 Sparks (15) |
| 16–20 | emote "Tip Hat" (18), 150 Drips (20) | Flame variant "Lamp Oil" (17), 150 Sparks (20) |
| 21–25 | 100 Drips (25) | Betrayal Snap variant "Door Slam" (23), 150 Sparks (25) |
| 26–30 | Tallow Holder variant (28), 150 Drips (30) | Smoke variant "Lantern Moths" (27), 150 Sparks (30) |
| 31–35 | 100 Drips (35) | Holder variant "Door Knocker" (33), 150 Sparks (35) |
| 36–40 | 200 Drips (40) | Tier 40: Wax "Latchlight" (animated brass-and-keyhole pattern); Knock variant "Keyring Jingle" (37) |

Premium Sparks payback: 100 (tier 2) + 150 × 6 (tiers 10, 15, 20, 25, 30, 35) = **1,000**. Tiers not listed grant nothing but the tier-up fanfare. **There are no XP boosters, ever.**

---

## 13. Art direction

### 13.1 The look in one line
**Storybook miniatures lit only by the players.** Chunky diorama rooms, soft wax, warm brass, and darkness as the default. The only reliable light is the Wicks themselves. Two rules follow from that:
- **Silhouette first.** At 25 m in the dark, you must be able to tell a Wick's origin, emotion, Soot and Pact status from its outline and flame alone.
- **Warm vs cold.** Flames are warm (2,000–3,000 K look). Darkness and hazards are cold: blue-violet ambient, cyan System UI.

### 13.2 Rendering pipeline (Three.js r186 + pmndrs `postprocessing` 6.x)
- **Renderer:** `WebGLRenderer` with antialias off (SMAA in post). Output colour space sRGB. **AgX** tone mapping, exposure 1.0. Shadows use `PCFSoftShadowMap`. WebGPU is LATER.
- **Lights:**
  - **Every Wick has a flame `PointLight`** (intensity scales with wax; radius 6 m, 14 m Brightened, 2 m Dimmed) with `decay 2`.
  - **Only the local player's flame casts real shadows** (a 512 cube map). Other flames are shadowless.
  - **Each room has one authored key light** (a spot or directional, 2048 shadow map) that is often very dim.
  - **Budget:** 12 point lights per view, beyond which the farthest flames are demoted to emissive sprites plus light probes.
- **Fake shadows (the Shadow cosmetic).** Every Wick projects a silhouette decal onto the nearest wall and floor from the dominant light, rendered from its Shadow cosmetic's 2D shape. It is cheap, readable and fun.
- **Post chain** (in `src/scenes/post.ts`):
  1. `RenderPass`;
  2. `SMAAEffect`;
  3. `BloomEffect` (mipmapBlur, luminanceThreshold 0.75, intensity 1.1, radius 0.7);
  4. `DepthOfFieldEffect` (Landing tilt-shift and Draft Cam only; bokehScale 2);
  5. `ChromaticAberrationEffect` (E rooms: pulses 0.002 → 0.012 on a Slime dash or gaze);
  6. `VignetteEffect` (offset 0.3, darkness 0.6; Keyhole view uses a keyhole mask);
  7. `NoiseEffect` (film grain, opacity 0.05);
  8. `ToneMappingEffect` (AgX).
  - SSAO (`SSAOEffect`, half-res) is SHOULD. It is off on the Low preset.
- **Fog.** An exponential height fog shader chunk. Density per room; Lantern-dark 10 m, Pressure 12 m.
- **Quality presets:** Low / Medium / High. They control shadow size, bloom mips, SSAO, particle counts and pixel ratio (cap 1.5 on High).
- **Target: 60 fps at 1080p Medium** on an integrated GPU of the Intel Iris Xe class.

### 13.3 Palettes
**Global UI and system colours:** night `#0E0B10`, panel `#1A1420`, text `#F4EDE3`, muted `#A89F94`, System `#0B1630` / `#5CE1E6`, danger crimson `#FF3D6E`, Notorious violet `#7A4FD8`, gold `#FFD76A`.

**Biomes (one per floor):**

| Floor | Biome | Base | Shadow | Accent | Fog / ambient | Mood |
|---|---|---|---|---|---|---|
| Landing (all) | **Warm Landing** | stone `#6B5E57` | `#2B2327` | lantern `#FFB86B` | dusk sky `#1B2340`→`#F2A65A`; clouds `#E9D8C4` | Waltz |
| 1 | **Belfry Stone** | blue-grey `#5D6878` | `#1D222C` | bronze `#C08A3E` | `#232B3A` | Old, cold, quiet |
| 2 | **Candle Works** | soot brick `#4A3A34` | `#1A1412` | brass `#D9A441` | `#2A1E18` | Industrial, steamy |
| 3 | **Cathedral of Wax** | ivory wax `#E8DCC4` | `#3A2F3F` | violet glass `#8E6BD8` | `#241C30` | Holy, eerie |
| 4 | **Ash Court** | charcoal `#34302F` | `#0F0D0D` | ember `#FF6B2C` | `#1A1110` | Judgment |
| 5 | **The Crown** | night stone `#2A2D45` | `#0A0B16` | white-gold `#FFF1C1` | starfield `#0B0E1F` | Awe |

**Room types (the letter accent is layered on the biome):**

| Letter | Accent | Secondary | Room light tint | Extra treatment |
|---|---|---|---|---|
| A Arena | `#FF6B2C` | `#FFD166` | warm amber | Round arenas, high ceilings |
| B Baffle | `#4FC3F7` | `#EFE3CF` | cool blue | Paper, ink, shelves; clue glints |
| C Chain & Climb | `#8BD450` | `#CDB892` | daylight from above | Verticality; ropes; chalk |
| D Dilemma | `#F2B134` | `#8A5A2B` | brass gold | Scales, levers, bowls, symmetry |
| E Enigma | `#B388FF` | `#FF00FF` / `#000000` checker | cold violet | Glitch patches (10%), RGB split, 1-bit dither |
| X Secret | `#00E5C0` | `#2B1F17` | verdigris | Velvet, clutter, many arms |
| ♛ Crown | `#FFF1C1` | `#2A2D45` | moonlight white | Sky, stars, the Great Wick |

**Per-room key colours**

| Room | Base | Accent | Key light |
|---|---|---|---|
| golem_belfry | `#5D6878` | bronze `#C08A3E`, forks C `#FF6B6B` E `#FFD166` G `#6BE38F` B♭ `#B388FF` | `#FFC98A` spot, very dim |
| whispering_library | `#3B2E2A` | page cream `#EFE3CF`, liar lilac `#C9B7E8` | `#9CC8FF` moonlight shafts |
| fuse_tether | `#5D6878` | fuse spark `#FFB347` | `#FFE3B0` sky |
| clockwork_foundry | `#4A3A34` | steam `#DDE6EA`, cold `#9FE6FF` | `#FF9A5A` furnace |
| liars_banquet | `#3A2226` | wine `#7A1F2B`, silver `#C9CED6` | `#FFD7A0` chandelier |
| weighing_hall | `#4A3A34` | brass `#D9A441`, bowl `#FF8A3D` | `#FFCF7A` |
| drip_chimney | `#EDE0C8` | soot `#2A2320`, sun `#FFF3C4` | top-down `#FFF3C4` |
| glitched_watcher | `#E8DCC4` | glass `#8E6BD8`, glitch `#FF00FF` | `#B6A2FF` |
| harmony_sentinel | `#E8DCC4` | sentinel gold `#FFD76A` | `#FFE7B0` |
| weight_of_guilt | `#241C30` | footprints `#CDEBFF`, regret grey `#9A9AA8` | `#7A86B8` |
| mimics_toll | `#34302F` | quicksilver `#D8DEE6`, tonics green `#5CD68A` / amber `#FFB02E` / violet `#A070FF` | `#C0D4FF` |
| karmic_executioner | `#34302F` | blood-wax chain `#C2273A`, ember `#FF6B2C` | `#FF7A4A` low |
| the_snuffer | `#2A2D45` | bronze `#B07A3A`, soot `#1A1A22`, gold thread `#FFD76A` | `#E8ECFF` moon |

### 13.4 Materials (all procedural; textures built at boot and cached)
- **Wax.** `MeshPhysicalMaterial` with sheen 0.3 and roughness 0.45, plus an `onBeforeCompile` **wrap-lighting and thickness SSS** approximation. The thickness comes from the Lathe radius, so thin wax glows near the flame. Drip bumps are vertex displacement.
- **Flame.** A custom `ShaderMaterial` on a camera-facing billboard with 2 layered noise-scrolled teardrop gradients. Emotion parameters (§4.5): height, sway, fork, lean and tint. Two dark eye ovals inside the flame blink every 3–6 s. Additive blend with bloom.
- **Brass and bronze.** Metalness 1, roughness 0.3–0.45, with a triplanar noise scratch map (256² canvas).
- **Stone.** A triplanar voronoi-crack plus fbm albedo shader. Mortar lines come from a box-grid function.
- **Glass.** `MeshPhysicalMaterial` with transmission 0.9 and ior 1.45. Stained glass uses voronoi colour cells.
- **Soot.** A dark rough decal (`DecalGeometry`), with fbm-edged alpha.
- **Cloth and paper.** Lambert-ish with fbm fibre noise, plus a vertex wave for curtains.
- **Glitch.** A shader that swaps albedo to a magenta/black checker in a screen-space noise mask, with a per-object RGB offset.
- **Texture generation.** `src/world/tex/*.ts`, via simplex/voronoi into `DataTexture`s (256–512 px), with at most 24 generated textures in memory.

### 13.5 Character and creature design
- **The Wick** (every player and Rival):
  - **Body.** A Lathe body, 0.72 m tall at full wax, shrinking per §5.1.
  - **Hands.** Two floating **nub hands** (Rayman-style spheres, 0.09 m).
  - **Head and feet.** The flame-face sits on top and the Holder is at the feet.
  - **Overlays.** Soot bands are dark rings at 30 / 50 / 70% of body height. The name tag is in Nunito.
  - **Origins** change the Lathe profile only: Taper is slim; Votive is squat in a glass cup; Tealight is a tin disc body with the same hitbox.
- **Monsters.** The shape language is round = friendly-ish, angular = threat. None use a skeletal rig; all use procedural transforms.

| Monster | Shape |
|---|---|
| Echoing Golem | A bronze bell body on 2 stumpy legs, clapper fists, glowing crack seams, orbiting culprit motes |
| Chrono-Slime | A glossy teal-violet blob with 20 afterimages; eyes lag 0.2 s behind the body |
| The Librarian | A 4 m moth-headed tall figure of stacked books with folded paper wings |
| Glitched Watcher | A stained-glass eye in a floating iron ring, 3 glowing veins, pixel-edge shimmer |
| Harmony Sentinel | An armoured knight whose lantern is its head, gold wires to 5 sconces, a halberd |
| Regrets | Translucent grey copies of a victim's Wick, with a soot tear |
| The Mimic | A quicksilver mannequin that morphs (0.3 s vertex lerp) into the template's Wick at N× scale 1.2 |
| Karmic Executioner | A 3.5 m hooded figure, wax-dipped axe, red chain from its shackles |
| The Snuffer | An 8 m bronze snuffer-bell with a chain, soot tendrils (Tube + noise), and an interior glow when it recoils |
| Old Tallow | A 2.5 m candle merchant with 6 arms and melting drips that re-form |
| Diners and Host | Clockwork automatons with visible gears, porcelain faces and key-wind backs |

### 13.6 Animation list (all procedural in `src/actors/anim/*.ts`)
**Wick**
- **Movement:**
  - idle sway: 0.8 Hz, ±3°;
  - hop-waddle run: a sine bob of 0.08 m at 2.2 Hz at full speed, squash and stretch ±8%, and nub hands swinging opposite;
  - jump: stretch 12%, then a 15% squash on landing, 80 ms;
  - dive: belly-flop pitch 80° and a slide;
  - mantle: 0.35 s.
- **Actions:**
  - brace: squat 15%, hands forward, a small dust ring;
  - grab and carry: nubs extend and lock;
  - throw: a windup pull-back with an arc preview, then release;
  - shove: nubs pull back 0.2 s, then thrust (60 ms hitstop);
  - hang and climb: 2-bone reach for the nubs only;
  - Brighten (the flame swells) and Dim (the flame shrinks to an ember);
  - Drip: a tap-wobble;
  - Relight: a match flick.
- **States:**
  - Snuffed: a 1.2 s melt to a puddle;
  - Smoke: a curl-noise wisp;
  - Relit: the puddle rises back into a body in 0.8 s;
  - Frozen: an amber shell and ticking;
  - Paralysed: glitch-stone, desaturated with jitter;
  - Deleted: a 1-frame checker, then gone.
- **Social:**
  - Knot tie: threads spiral together;
  - Cut channel: the glint, the Resolve lean;
  - Betrayal Cam: a 0.8 s cut-in;
  - Trust Fall: tipping backwards with flailing nubs;
  - catch: a hug squash;
  - Confession: a kneel.
- **Emotes (8) and flame emotions (7):** §4.5 and §7.9.
- **Plate and doors:** claim stomp, walk-in, Door Ajar squeeze.
- **Monsters:** Golem waddle / swipe / growth pop / shatter; Slime dash smear / breath glow / sleepy wobble; Librarian wake unfold / flutter; Watcher drift / blink-teleport; Sentinel patrol / swing / kneel; Regret walk / bow and dissolve; Mimic morph; Executioner stalk / cleave / kneel; Snuffer drop / recoil / sway; Old Tallow melt-and-re-form.

### 13.7 VFX list
- **Flame and wax:** flame shader; wax drip particles and floor decals; smoke puffs; Relight match sparks.
- **Room effects:** chime-stone motes; chord beams; fork ring waves; steam jets (instanced noise sprites); frost spread; hatch slam dust.
- **Glitch:** RGB split, 1-bit dither patches, pixel sort on the Watcher's blink, and static at the screen edge for the gaze warning.
- **Social:** soot tendrils; Pact threads; the Cut glint and crimson flash; Betrayal Snap effects (§12).
- **Rewards:** confetti on clear (flame-coloured); a gold stamp and red stamp on Notes; Title-acquired sparks.
- **Atmosphere:** height fog; god-ray cones (fake, additive) at the Sun-Hatch and the Crown.
- **Big moments:** the Tide wave (a fog surge down the stairwell); **Candlelit** (the Great Wick lights and a light wave travels down the tower, floor by floor, over 6 s); **Everflame** (a white-gold column with everyone else's flames blowing out in sequence).

### 13.8 Camera
| Camera | Spec |
|---|---|
| **Third-person follow** (default) | Distance 4.5 m, height 1.6 m, shoulder offset 0.4 m (C swaps sides), FOV 60 (slider 50–90). The spring arm uses a 0.2 m sphere cast with 8 m/s return. Mouse sensitivity 0.1–2.0. |
| **Climb cam** (C rooms) | Pulls back to 6 m and pitches up 20° when hanging |
| **Draft Cam** | Top-down at 40 m, 70° tilt, FOV 45, 0.6 s ease; tilt-shift DOF (§3.6) |
| **Reveal orbit** | 2.2 s, a 200° orbit of the room diorama at 18 m, ending behind your Wick |
| **Betrayal Cam** | 0.8 s at 25% time scale, framing both flames and the thread (50% time scale in reduced motion) |
| **Trust Fall** | Locked facing away from the Catch Ring. The screen shows only sky until caught or landed |
| **Keyhole view** | Keyhole-shaped vignette over the target room's live or shadow-puppet feed |
| **Smoke** | Free-float spectate within your room |
| **Shake budget** | Max 0.15 amplitude, off in reduced motion |

---

## 14. UI/UX

### 14.1 Screens
1. **Title:** the tower silhouette with parallax clouds, and a lone Wick flame. "Press any key".
2. **Main menu:** Play Solo · Host Private Lobby · Join by Code · Wardrobe · Shop · Wickbook · Codex · Rival Register · Settings.
3. **Origin select:** a turntable of the 6 Origins (locked ones shown as silhouettes with their unlock rule).
4. **Lobby:**
   - code `XXX-XXX` (hidden in streamer mode) and the slot count;
   - seats (humans and Rivals, with a swap-Rival button);
   - settings: Betrayal Off/Physical/Full, Masked Bots, Drama Director, Friendly preset;
   - a Ready grid.
5. **Loading:** a pen draws the tower's floors as the seed is generated.
6. **In-run HUD** (§14.3), **Draft HUD** (plaque callouts, Stampede banner), **Altar** (cards in world space plus a pick-order strip), **Tribunal** (pedestal portraits with Ledger entries), **Minigame HUDs**.
7. **Ledger overlay (Tab):** a ring map of the floor showing doors, occupants (or silhouettes for ghost rooms), timers, Pacts, Knives so far, your Soot and keys.
8. **Pause and Settings:** Controls (rebind), Graphics preset, Audio buses, Accessibility, Streamer mode, and Reset the Register.
9. **Results (the Ledger):**
   - the ending card;
   - the run timeline (every Knife, Pact, catch and Relight as a flame glyph on a 5-floor strip);
   - awards (§5.5);
   - the Drips breakdown (§11.4);
   - titles earned;
   - Rival reactions (one context line each);
   - the **share card**, and the clip (§16.9).
10. **Shop, Wickbook, Wardrobe, Codex, Rival Register.**

### 14.2 The System window
- **Style:**
  - panel `#0B1630` at 92% opacity; 2 px border `#5CE1E6` with an 8 px outer glow; bracket corners;
  - max width 560 px, top-centre, 24 px from the top.
- **Type:** JetBrains Mono 600. Headers uppercase with 0.12 em letter-spacing; body 16 px.
- **Typing:** **35 characters per second**, with the System bell-babble (§15.3).
- **Redactions** are `█` blocks with a 0.8 Hz shimmer.
- **Queueing.** Windows queue. Each stays for 4 s + 50 ms per character, and Tab reopens the last 10.
- **Theme.** The System Window cosmetic changes the colours only. Position, size and font never change.

### 14.3 In-run HUD (minimal; the body is the health bar)
| Element | Where | Notes |
|---|---|---|
| Room timer | top-centre under the System window | A **burning candle bar** that shortens, plus `m:ss`. It turns crimson in the last 30 s. Pressure shows a double flame. |
| Embers and keys | top-right | Ember count with a +N pop; key icons |
| Traits | bottom-centre | 4 slots, cooldown rings, key numbers 1–4 |
| Wax | bottom-left | Optional numeric `78/100` (Settings; off by default). The body shows it anyway |
| Pact partners | left edge | Portrait, wax ring and a direction chevron (always shown for Pact partners) |
| Pings | world space | Look (white), Danger (red), radial types |
| Quick-chat and emote wheels | centre radial | 8 segments per page, 3 pages plus the context page |
| Interaction prompt | near the target | "Hold E: Wind" with a fill ring |

### 14.4 Accessibility
- **Controls:** every hold can be a toggle; full rebinding; mouse invert; sensitivity; FOV.
- **Colour-blind shape codes:** each letter has a shape as well as a colour: A triangle, B square, C circle, D diamond, E hexagon, X star, ♛ crown. Fork pitches also have tine-notch counts (1–4).
- **Captions:** subtitles for all System lines and barks, with the speaker's colour chip. Captions for key SFX ("[Chute lever clanks]").
- **Motion:** reduced motion turns off shake, chromatic aberration and screen tears, and plays the Betrayal Cam at 50%.
- **Photosensitivity:** glitch flashes are capped at 3 Hz with no full-screen white flashes.
- **Text:** text size 100–150%.
- **Streamer mode:** hides the lobby code and replaces other humans' names with Wick numbers.

### 14.5 Fonts (Google Fonts, with system fallbacks for the single-file build)
| Role | Font | Weights | Fallback stack |
|---|---|---|---|
| Display (logo, door names, titles) | **Fraunces** | 600, 800 (soft, "WONK" on) | `Georgia, 'Times New Roman', serif` |
| UI body, barks, menus | **Nunito** | 400, 700, 800 | `system-ui, 'Segoe UI', sans-serif` |
| System windows, numbers, timers | **JetBrains Mono** | 500, 600 | `ui-monospace, Consolas, monospace` |

- **Loading.** A `<link>` to Google Fonts with `display=swap` in `index.html`.
- **Single-file build.** `build:single` skips the link, so the fallbacks apply and nothing external is needed offline.
- **The logo** is typeset text: KNOTSPIRE in Fraunces 800 with a knot drawn through the O as an SVG path.

### 14.6 Motion language
- **Easing:** `cubic-bezier(0.2, 0.8, 0.2, 1)` for UI, 180–240 ms.
- **Panels:** slide 12 px and fade.
- **Buttons:** press scale 0.96 and a wax-drip hover highlight.
- **Banners** (Reunion, Title) slide in from the right in 300 ms, hold 3 s, then slide out.
- **Numbers:** counters roll with tick SFX.
- **The results timeline** draws left to right in 2 s.
- **Reduced motion:** fades only.

---

## 15. Audio (100% procedural, Web Audio API)

### 15.1 Architecture (`src/core/audio/`)
- **Graph.** One `AudioContext`, resumed on the first user gesture (title "Press any key").
  - Buses: **Music**, **SFX**, **Voice** (babble and System), **UI** → master `DynamicsCompressor` (threshold −14 dB, ratio 4) → limiter → output.
  - Every bus has a volume slider.
- **Space.**
  - 3D SFX use `PannerNode` (HRTF on High, equalpower otherwise), with the listener on the camera.
  - **Reverb** is a `ConvolverNode` per room, with an impulse response generated at load: noise × exp decay. RT60 values: belfry 3.2 s, library 1.4 s, chimney 2.5 s, Landing 1.0 s, Crown 4.0 s.
- **Scheduling.** The music scheduler looks ahead 100 ms (setTimeout 25 ms tick) and schedules notes on `currentTime`.
- **Limits.** Voice limit 48; the quietest and farthest voices are stolen first.
- **Workers.** A **bitcrusher AudioWorklet** (E rooms) and a **Karplus-Strong AudioWorklet** (strings and ropes).
- **Synth kit** (`synth.ts`):
  - `bell(partials, decay)`: additive, with partials 1, 2.76, 5.40, 8.93 for bronze;
  - `pluck(freq)`: Karplus-Strong;
  - `fm(car, mod, index, env)`;
  - `noiseHit(filter, env)`;
  - `formant(vowel, f0)`: a sawtooth through 3 bandpasses;
  - `organ(drawbars)`: additive sines at ratios 1, 2, 3, 4, 6, 8;
  - `tom(f0, drop)`: a sine with a pitch envelope plus a noise click.

### 15.2 Music recipes
Each context has 3 intensity layers (**Calm / Tension / Pressure**). They crossfade over 2 s by gain ramps, driven by game state: timer %, the Tide, monster proximity and phase.

| Context | Tempo / metre | Key / mode | Instruments (recipes) | Structure and layers |
|---|---|---|---|---|
| **Landing waltz** | 96 BPM, 3/4 | F major | Music box (`bell` with partials 1 / 3.1 / 5.2, short decay), pizzicato (`pluck`), brushed snare (hi-passed noise on beats 2 and 3), a soft `organ` pad | I–vi–IV–V in 8 bars. **Adds a layer per 2 climbers present** (up to 4 layers). The melody is generated from a seeded motif (5 notes, pentatonic) and varied each loop |
| **Door Draft** | 120 BPM, 4/4 | D minor | Timpani (`tom` 70 → 55 Hz), string ostinato (sawtooth into a lowpass, 16ths), ticking clock | Calm 35 s. **Stampede**: +10% tempo, a bell on every bar, and the ostinato up an octave |
| **A Arena** | 110 BPM, 4/4 | E Phrygian | **Synth taiko** (`tom` 120 → 60 Hz, noise click), bass drone, bell stabs | Tension adds double-time toms. The Golem hum is tuned to the key root |
| **B Baffle** | 84 BPM, 4/4 | A minor | **Pizzicato** plucks, **clock ticks** (a noise click at 1 Hz, off-beat in 2B near the poisoner), celesta (`fm` 1:4) | Sparse. Tension adds a walking pizz bass |
| **C Chain & Climb** | 100 BPM, 6/8 | D Dorian | **Karplus rope strings** (the live tether segments ARE the lead line, §6.3), **wind** (bandpassed noise with a slow LFO), frame drum | Pressure adds a high sustained string |
| **D Dilemma** | 92 BPM, 4/4 | G minor | **Two-voice harpsichord canon** (sawtooth pluck through a lowpass with 40 ms decay; voice 2 enters 1 bar later), low brass swell (`organ` 1+2) | Dissonance rises with the gap between voices: in 2D, the dial gap detunes voice 2 |
| **E Enigma** | 128 BPM, 4/4 | C Lydian | **Bit-crushed arpeggios** (square wave into the 6-bit crusher Worklet), sub pulse, reversed swells | Glitch stutters (buffer repeats of 1/16) on Slime dashes and Watcher blinks |
| **X Market** | 72 BPM, 3/4 | E♭ major | **Reversed music box** (rendered into a buffer, then reversed), creaky accordion (`formant` "o") | A loop with Old Tallow humming |
| **♛ Crown** | 66 → 88 BPM | B minor → B major (Candlelit) | **Organ** (drawbars 8-6-8-0-0-4), **formant choir** ("ah/oh", 4 voices, detuned ±6 cents), bell tolls | Phase 1: organ pedal and choir. Phase 2 (Trust Fall): music drops to heartbeat and wind. Phase 3: rising choir. **Candlelit** swells to B major; **Everflame** leaves a single thin organ note |
| **Results** | 90 BPM | F major | The Landing waltz on music box only | Plays over the timeline draw |

**Stingers** (one-shots): Clear (a major bell arpeggio), Fail (a descending minor bell), Title acquired (a fanfare of 3 bells), Knot tied (a perfect fifth), Knot cut (a downward bend and a tritone), Tide (a low gong swell).

### 15.3 Voices: bell-babble and the System
- **Wick babble.** Each Wick has a voice pitch f0 (humans pick 180–420 Hz; each Rival has a fixed one).
  - Each speech bubble becomes syllables: `formant(vowel, f0)` for 70–110 ms each, with vowels chosen by hashing the letters.
  - The pitch contour follows the phrase type: questions rise; "Liar!" and "Help!" are high and sharp; "Sorry!" falls.
  - The **Resolve tell drops the babble a perfect fourth**.
- **System voice.** Glass-bell FM chimes (carrier:modulator 1:3.5, index 2 → 0 over 150 ms), one per typed character at 35 cps. The pitch is quantised to the C major pentatonic, following the character code. Headers use a lower octave.

### 15.4 SFX list (recipes)
| Group | SFX | Recipe |
|---|---|---|
| **Body** | Footstep (wax squish) | Lowpassed noise, 30 ms, 400–900 Hz random |
| | Jump / land | Rising sine blip 200 → 400 Hz / thud: sine 90 Hz, 60 ms, plus a noise tap |
| | Dive / belly-flop | Whoosh (bandpass sweep 300 → 1,200 Hz) / wet slap (noise 1.5 kHz, 80 ms) |
| | Shove / hitstop | Thump (sine 110 Hz + noise), plus the Knock cosmetic layer |
| | Grab / throw | Soft click / whoosh scaled by speed |
| | Brace | Creak (a filtered sawtooth wobble, 150 Hz) |
| **Flame** | Brighten / Dim | Rising shimmer (sines 1–3 kHz, tremolo) / falling filtered noise |
| | Drip / Relight / Snuffed | Pluck plus sizzle / match strike (noise burst, then a rising tone) / puff (noise, 120 ms) plus a sine drop 300 → 80 Hz |
| **Social** | Knot tie | Two-bell ascending fifth |
| | Cut channel | "Shhhk": highpassed noise with rising cutoff over 1.2 s |
| | Cinch / cut fail | Rope creak / clank plus a buzz |
| | Knot cut | Downward pitch bend, noise burst, tritone |
| | Ping look / danger | Glass tick 1.5 kHz / double low tick 400 Hz |
| | Quick-chat pop / emote | Bubble pop (sine 600 → 900 Hz, 40 ms) |
| | Stamp (Borne Out / Proven False) | Wooden thunk plus a bell / thunk plus a buzzer |
| **Doors** | Plate claim | Soft tick in the letter's pitch |
| | Stampede bell | Bronze bell, low |
| | Latch / door slam | Low thud plus a metallic ring / a heavier thud plus reverb tail |
| | Grate pass | Metal slide |
| **Rooms** | Forks C4 / E4 / G4 / B♭4 | `bell` with bronze partials, 4 s decay; B♭ is detuned by 30 cents and adds a beating partial |
| | Golem hum / growth / Toll | Sine at the current pitch plus a 2nd harmonic / a pitch step up / sub boom 40 Hz plus noise |
| | Chime-stone roll | Rolling noise, bandpass 2 kHz, random-walk gain |
| | Librarian wake / book / dial | Paper flutter (granular noise) / page rustle / ratchet click |
| | Fuse sizzle / Powder blast / segment | Crackle (sparse noise impulses) / boom / Karplus string (pitch = tension) |
| | Slime dash / freeze / breath | Doppler whoosh / ice crack (highpassed noise) plus ticking / glassy inhale |
| | Steam jet / valve | Hiss (noise at 4–8 kHz) / wheel squeak |
| | Scale creak / chute clank / Bowl sizzle | Wood-metal creak / heavy clank (1 s before the drop) / fry noise |
| | Hold melt / piton / rope | Drip-sizzle / metal ping ×3 / rope creak |
| | Hatch slam | Iron clang with reverb |
| | Watcher gaze static / pillar hum / topple | White noise rising with angle / sines A3, C♯4, E4 with vibrato / crash (noise plus low sine) |
| | Sconce snuff / sour note / Bell of Accord | Soft "fff" / a minor-second cluster in the striker's pitch / bell count 3-2-1 |
| | Decoy tick | Clock tick at 2 Hz, faster in the last second |
| | Regret whisper / Confessional bell | `formant` noise at a whisper level / a small hand bell |
| | Mimic morph / tonic | A pitch-shifting warble / a gulp plus a curse chord |
| | Executioner telegraph / Absolution drone | A rising scrape / a low organ drone that fills with the ring |
| | Snuffer drop / recoil / tendril | Organ cluster plus a 30 Hz sub / a reverse cymbal / a squelchy low noise |
| | Trust Fall wind / catch | Wind swell / a hug squash plus a chime |
| | Vigil fill / Candlelit / Everflame | A rising 4-voice chord / ascending arpeggios, one per floor / a roar plus a single held organ note |
| **UI** | Hover / click / back | Wax tap / soft bell / low tap |
| | Embers gain / Drips count | Coin-like pluck / rolling tick |

---

## 16. Multiplayer model

### 16.1 Topology
- **Server.** An authoritative Node server, `server/server.mjs` (the `ws` package), started with `npm run server` on port **8787** by default.
  - One process hosts many lobbies.
  - Each lobby runs its Landing instance and up to 4 live room instances.
- **Shared simulation.** The simulation code lives in `src/core/sim/` and `src/game/`, and is **shared** between client and server. Vite builds a `sim` ESM bundle that `server.mjs` imports, so there is one source of truth.
- **Solo** runs the same simulation in a **Web Worker** over a `MessageChannel` transport, with the same message schema. It needs no server and works offline in `dist-single`.

### 16.2 Lobbies (private only in the slice)
- **Joining.**
  - Host → a 6-character code `XXX-XXX`, from an unambiguous 30-character alphabet with no 0/O/1/I/L.
  - Join → enter the code and the server address. LAN players use the host machine's `ip:8787`; online players use any deployed instance.
  - There is no matchmaking and there are no accounts.
- **Size.** Up to **8 humans**. Slots are 4–8, and Rivals fill the empty seats.
- **Host controls:** kick, slot count, the betrayal setting, Masked Bots, Drama Director, and the Friendly preset.
- **Privacy.** No personal data is sent. A display name (filtered by a small blocklist) and a cosmetic loadout are the only profile data on the wire.

### 16.3 Netcode
- **Tick and snapshots.**
  - The server ticks at **30 Hz** and sends snapshots at **20 Hz** per subscribed instance.
  - Snapshots are delta-compressed: positions quantised to 1 cm, yaw to 1/256, wax to an integer.
  - Clients interpolate with a 100 ms buffer.
- **Inputs.** Clients send input frames at 30 Hz (sequence-numbered: move vector, look yaw/pitch, button bitfield).
  - **The client predicts its own Wick** (movement and jump) and reconciles with the server.
  - Everything else is server-authoritative: props, monsters, tethers, scoring.
- **Physics** is a custom lightweight kit (`src/core/phys/`):
  - capsule vs static colliders (boxes, cylinders, heightless planes);
  - sphere/box props with simple impulses;
  - **XPBD distance constraints** for tethers, ropes and threads;
  - fixed step 1/60 on the server, 2 substeps.
  - It is deliberately "fun before physics" (§1.3). Rapier is an allowed fallback only if the kit fails the M1 gate (§17.3).
- **Messages:**
  - `hello/join/leave`;
  - `input`;
  - `snapshot`;
  - `event` (reliable, ordered: Ledger, System window, Altar, Tribunal, stamps);
  - `chat` (quick-chat id plus args, context-phrase id, Composer tokens);
  - `rpc` (vote, buy, pick, bet, note);
  - `ping`.
- **Bandwidth target:** ≤ 12 KB/s down per client, with 8 climbers and 30 props in view.
- **Interest management:**
  - your instance at 20 Hz;
  - the Grate neighbour at 10 Hz (entities within 8 m of the grate);
  - Keyhole spectate at 5 Hz;
  - ghost rooms send events only.

### 16.4 Instances
- **Lifecycle.** At Latch, the server creates one room instance per door that holds a human. Other doors run the **Ghost Sim** (§3.7, §8.6).
- **Side Door takeover** calls `RoomDef.fromGhostState(phase, progress, survivors)`.
- **Tear-down.** An instance is torn down at floor close, and its results are merged into the lobby Ledger.

### 16.5 Disconnects
- **Grace.** A dropped human gets **60 s** of grace. Their Wick runs on **Autopilot**: the bot brain with the Pip Fizzwick personality, **no Knives, no Pact cuts, no votes**.
- **Rejoin** restores control, with the lobby code plus a reconnect token held in sessionStorage.
- **After 60 s** the Wick stays on Autopilot for the rest of the run, shown as "(autopilot)", and it still earns for the player if they return.
- **If the host leaves,** the server keeps the lobby running. Host powers pass to the longest-connected human.

### 16.6 What solo simulates (so solo is excellent)
| System | Solo implementation |
|---|---|
| 7 other climbers | Rivals with full brains (§8) |
| Other rooms | Ghost Sim, with grate dioramas, Keyhole shadow-puppets and Ledger events |
| Meeting people | Grate visits (every 45–75 s), Reunion banners, context phrases, Side Door takeovers |
| Social economy | Bots pin Notes (true with probability Honesty/100), vote in Tribunals, bet on Keyholes and play every minigame |
| Drama | Drama Director on (§8.7) |
| Memory | Rival Register across runs (§8.8) |
| Pacing | The Tide still applies, and the human's room is always the live one. Bots never keep you waiting for more than 60 s: ghost rooms compress |

### 16.7 Safety and fair play
- **Server checks.** The server validates movement (speed and teleport caps) and cooldowns. Clients never report scores.
- **No free text in the slice.** Only quick-chat, context phrases and Composer tokens.
- **Streamer mode** (§14.4).
- **Betrayal settings and the Friendly preset** (§7.10).

### 16.8 Persistence
- **Local profile in IndexedDB** (with a localStorage fallback) holds:
  - owned cosmetics and the loadout;
  - Drips, Sparks (mock) and Wick Level;
  - Codex study levels and Scars;
  - titles, Origins and the Rival Register;
  - settings.
- **Export and import.** The profile can be exported and imported as a JSON file. There is no cloud save in the slice.

### 16.9 Clips and sharing
- **Share card** (MUST). A 1200 × 630 PNG drawn to a canvas: a group-shot render, the ending, the seed, the top 3 awards and the KNOTSPIRE wordmark. It is saved with a download button, and nothing is uploaded.
- **Clip** (SHOULD). A 15 s ring buffer (`canvas.captureStream(30)` → `MediaRecorder`, WebM, 720p) that auto-marks Betrayal Cam, catch and ending moments. It is exported as a local download.

---

## 17. Scope checklist, milestones and risks

### 17.1 MUST (vertical slice)
- [ ] **Engine:** Vite + TS + Three.js r186 + postprocessing; quality presets; 60 fps at 1080p Medium on Iris Xe class.
- [ ] **Wick:** the controller (§4); flame shader and emotions; wax shrink; Soot bands; Origins ×4 (start set).
- [ ] **Run loop:** Landing → Draft → Latch → room → Altar → Stair / Side Door → Tide → Crown → Ledger (§3).
- [ ] **Generation:** 5 floors, the letter rules, Echoes, Omens ×6, and the X alcove (§3.5).
- [ ] **Room kit** (§6.0) and **all 12 rooms plus the Snuffer**, each with its Decree/hint ladder, physical tells, solo tuning, bot plan, ghost phases, Hidden Piece, Codex and System lines.
- [ ] **Social:** Knots/Cut/Cinch; Knives ×10; Soot; Tribunal; Notes with stamps; Keyhole bets; quick-chat plus context phrases plus Composer; betrayal settings (§7).
- [ ] **Bots:** 10 Rivals, the door scoring, roles, Trust, the Knife utility with tell, Ghost Sim, Drama Director, Rival Register (§8).
- [ ] **Progression:** 16 traits, 8 fusions, the Altar, keys and items, 21 titles, the Codex with redaction (§9).
- [ ] **Landing:** stations, **3 minigames** (Pinky Promise, Snuff Tag, Wax Stack), Old Tallow's Market (§10).
- [ ] **Economy:** Embers, Drips, the mock Sparks store with its banner (§11).
- [ ] **Cosmetics:** the 60-item catalogue, 10 slots, Wardrobe mirror, daily shop, Wickbook with 40 tiers (§12).
- [ ] **Art:** biome palettes, procedural materials and textures, the VFX list, the camera set (§13).
- [ ] **UI:** all screens in §14.1; the System window; accessibility basics (toggles, shapes, captions, reduced motion).
- [ ] **Audio:** the synth kit, all music recipes, babble and the System voice, the SFX list (§15).
- [ ] **Multiplayer:** the `ws` server, private lobbies of up to 8, prediction and reconciliation, instances and interest, the 60 s autopilot; solo in a Web Worker (§16).
- [ ] **Results:** the Ledger timeline, awards, Drips breakdown, share card PNG.
- [ ] **Builds:** `npm run build` (web) and `npm run build:single` (a single offline HTML with fallback fonts).

### 17.2 SHOULD / LATER
**SHOULD**
- Gamepad support.
- The Rumour Dice minigame.
- SSAO.
- WebM clips.
- Regression Scar ghost replays.
- Tealight and Matchstick Origins (unlockable).
- Masked Bots.
- HRTF on High.
- Photo mode for the share card.
- Profile export and import.

**LATER**
- The Hollow Suit room (§6.14) and more rooms per letter.
- Daily Seed and leaderboards.
- Public matchmaking and hosting.
- Free-text chat with filtering.
- WebGPU.
- A second season.
- Real payments (only after legal and platform review).
- Cloud saves and accounts.
- Localisation.
- "The ones who watch" audience season.
- Mobile/touch.

### 17.3 Milestones and gates
| Milestone | Content | Gate (must pass to continue) |
|---|---|---|
| **M0: Style Lock** (2 wks) | One Wick, the flame shader, `golem_belfry` greybox → final art, audio kit v1, post chain | Blind screenshot test: 8/10 viewers say "candle" and "storybook". 60 fps on Iris Xe. The Golem is readable with no text. |
| **M1: Knot Test** (3 wks) | Controller, the physics kit, `fuse_tether` + Knot/Cut/Cinch in a 4-player LAN build, 3 bots | **The kill gate:** in playtests, at least 60% of sessions show a voluntary Knot, and at least 50% of Cut attempts are rated "fun" (not "unfair"). If this fails, simplify Pacts to Landing-only and cut Cinch. |
| **M2: Floor Loop** (4 wks) | Landing, Draft, Latch, Altar, Tide, Side Doors, Grates, Ghost Sim, 6 rooms (all of floor 1 plus 2B, 2D), bots v1 | Solo floors 1–2 are playable. Median wait ≤ 60 s. A first-time player clears each room in under 6 min using the physical tells alone. |
| **M3: Full Tower** (5 wks) | The remaining 6 rooms, the Snuffer, Tribunal, Notes, bets, traits and fusions, the Codex, titles, results | A full solo run takes 36–45 min. Bots produce 1–3 witnessed betrayals per run (the Drama Director's log). |
| **M4: Online** (3 wks) | The `ws` server, 8 humans, reconnect, interest management, the netcode budget | 8-player private lobby stable for 3 runs. ≤ 12 KB/s per client. No desync-visible rubber-banding at 100 ms RTT. |
| **M5: Wardrobe and Polish** (3 wks) | 60 cosmetics, the shop, the Wickbook, the mock store, accessibility, both builds | All checklist MUST items are ticked. A single-file build under 6 MB. |

### 17.4 Acceptance tests (automated where possible)
- **Rooms:**
  - every `RoomDef` builds for n = 1…cap and tiers 1–3 with no errors;
  - a bot-only live instance clears each room at n = 1 and n = 4 within its timer at least 70% of the time over 50 seeds (headless);
  - Ghost Sim p stays within [0.2, 0.92].
- **Generation:** 10,000 seeds → every floor passes the capacity check, A and E are adjacent, there is at least one D on floors 2–3, and no Omen repeats on a door.
- **Economy:** 1,000 simulated runs → median Drips 150–350, with an Everflame p95 ≤ 520.
- **Readability:** a screenshot diff confirms Soot bands and Resolve render above every cosmetic combination (60 items, sampled pairwise).

### 17.5 Risks and mitigations
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **12 bespoke rooms is too much for the slice** | High | High | The component kit (§6.0) plus a one-bespoke-script rule. Build order follows the milestones. If late, ship 10 rooms and let Echoes fill the rest (the generator already supports this) |
| **Bots feel dumb or unfair** | Med | High | Roles from `RoomDef` plans, perception limits, mandatory tells, the Drama Director mercy rule, and the headless clear-rate test (§17.4) |
| **Betrayal turns toxic among friends** | Med | High | Visible tells, Cinch counters, Tribunal and Confession/Forgive paths, the Friendly preset, the Off setting, "resets every run", and group-shot endings |
| **Redacted Clear Conditions confuse newcomers** | Med | Med | The physical-tells contract, the hint ladder at 50%/75%, and a first-time clear under 6 min enforced at M2 |
| **Point-light and post cost in the browser** | Med | Med | 12-light budget, only the local flame casts shadows, fake shadow decals, quality presets, pixel ratio cap |
| **Netcode for tethers and ropes** | Med | Med | Server-authoritative XPBD; the client predicts only its own capsule; tethered climbers get a slightly larger interpolation buffer (150 ms) |
| **Procedural audio feels thin or repetitive** | Med | Low | Layered recipes, seeded motif variation, per-room convolution, and an audio review at M0 and M3 |
| **Waiting on the Landing** | Med | Med | Tide + Pressure, minigames, Keyholes and Side Doors; ghost rooms compress; a 60 s median target |
| **Name clearance (KNOTSPIRE)** | Low | High | Run a formal trademark search (USPTO/EUIPO/Steam/itch) before any public build. BACKSTAIRS and OATHSPIRE are the fallbacks (§0) |
| **Mock store mistaken for real payments** | Low | High | The permanent MOCK banner, no price strings, no payment code, and Sparks stored locally only |
| **Scope creep from inspirations** | High | Med | This GDD is authoritative. New ideas go to LATER unless they replace a MUST of equal cost |
