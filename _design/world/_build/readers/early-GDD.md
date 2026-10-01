# Reader notes: early GDD (`_design/GDD.md`)

**Source:** `C:/Users/mrkl6/Downloads/Projects/Team CO-OP/make me a name/_design/GDD.md`. It has 2,825 lines, 17 sections plus §0, version 1.0, dated 2026-09-28. I read every line.
**Reader:** early-GDD · **Written:** 2026-09-30 · **For:** the v2 redesign (one open world, one story, Firefly Frogs in the well, co-op, 8-player Steam lobbies).

**One thing to know first.** This file is not the KNOTWELL frog design. It is the older **KNOTSPIRE** design: a browser party roguelite whose hero is a **Wick**, a living candle. KNOTWELL v1 used it as its "parts bin" (`_design/master/DECISIONS.md` §0 authority list). It re-themed several of its rooms for frogs and cut most of its systems (DECISIONS §8.3). v1 retired KNOTSPIRE as a name because it collided with the frog game Croakspire, per `_design/master/00_OVERVIEW.md` §1. So every "re-theme" note below means "carry the idea from candles to frogs", not "copy it".

---

## 1. Summary for the archive

This is the KNOTSPIRE game design document, v1.0 (2026-09-28). It came before KNOTWELL, and KNOTWELL v1 kept it as a parts bin. The hero is a Wick, a living candle whose wax is its health and whose body shrinks as it burns. The game was a browser party roguelite for 1–8 players, built on Vite, TypeScript, Three.js and a Node `ws` server. Ten AI Rivals with grudges filled empty seats.

A 36–45 minute run climbed 5 floors of a seeded tower. On each floor, players scrambled onto door plates. That picked a room, and it picked who they were locked in with. Each of the 12 rooms borrowed from an outside game, such as Among Us or PEAK. No monster could be hit to death; each one was a riddle you read from the room. Clear Conditions started redacted and filled in as you died and studied. Betrayal sat at the centre: ten named "Knives", Soot marks, a Tribunal vote, truth-checked Notes, bets, a hidden Taster role, and a boss that ended in a Trust Fall and a choice between one player's Crown Door and a shared Vigil. Around this sat 16 traits, 8 fusions, three currencies, 60 procedural cosmetics, a mock premium store and a 40-tier pass.

The goal was a dark storybook party game where betrayal is always visible and fair. What v2 can use is the world voice, the characters, the rule that monsters are riddles, the co-op verbs and the fair-shop rules.

---

## 2. Reusable for v2

Each row gives the idea, where it lives in the GDD, and the pillar it serves. P1 Clear, P2 One world one story, P3 Genuine, P4 Easy to start, P5 Organized, P6 Open world together.

### 2.1 World and story

| # | Idea | Where | Why it fits v2 |
|---|---|---|---|
| W1 | **The shared-light legend.** Whoever reaches the top alone can burn forever. But if everyone who arrives lights the Great Wick *together*, the whole tower is lit for every candle still climbing. "Nobody remembers anyone doing it." | §2.1 | P2, P6. This is one story goal that only makes sense as co-op. For frogs, the Firefly light could relight the whole well. Drop the alone option. |
| W2 | **The lighting payoff.** The Great Wick lights, then a light wave runs down the tower floor by floor over 6 s. The Vigil Ring fills while at least 75% of players stand in it for 10 s in total. | §6.13 Phase 3, §13.7 | P6, P1. A world event that every player in the lobby sees, where progress shows on the map itself. |
| W3 | **The System voice.** `[ BRACKETED CAPS ]` headers, dry and precise, never cruel, never lying, with humour from understatement ("You have been lit. Please do not go out."). There are 13 sample lines, and each room has enter, clear and fail lines. | §2.3, every §6.x "System" | P3, P1. It is a specific voice, not a generic narrator. v1 kept it (glossary row 28). v2 must also let it say what to do next (see conflict C17). |
| W4 | **"The System never lies. Nothing can forge one."** | §1.3 | P2, P1. A world rule the player can lean on. |
| W5 | **"Dread, then a waltz."** Tense, dark rooms swing to a warm, loud hub. | §1.1 #5, §2.2 | P2, P6. This maps well to wilds and towns in one open world. |
| W6 | **Where the comedy comes from:** bodies. Wobbling, belly-flops, a silly wick. **Where the dread comes from:** darkness, silence, a polite dry voice. | §2.2 | P3. A clear tone guide that is easy to test. |
| W7 | **A five-part writing format per place:** a one-line fantasy ("A bell-bodied giant that swallows every punch and rings louder for it."), a Codex hint (≤ 10 words), a full Codex entry, and enter, clear and fail lines. | every §6.x header and footer | P3, P1. It gives every encounter a human-sounding voice with the same shape. |
| W8 | **A later-layer seed:** two lore lines about "the ones who watch from above the Crown". | §2.4 | P2. It fits v1's "every sky is someone's well" idea as foreshadowing, and costs nothing. |

### 2.2 Characters

| # | Idea | Where | Why it fits v2 |
|---|---|---|---|
| CH1 | **The Rival roster as town people and companions.** Keep the helpers and the neutral ones with their looks, colours and lines: **Moss** the Sherpa ("Brace!", "Nobody falls today."), **Brother Brass** the Captain ("I can carry that.", "Go. I'll hold."), **Pell** the Scholar ("I have a clue.", "Interesting."), **Pip Fizzwick** the Helper (follows the player it trusts most), **Kestrel** the Show-off ("Watch this!", "That was on purpose."), **Ines the Taper** the Speedrunner ("Keep up.", "Personal best."), **Lumen** the Lone Wolf ("I work alone.", "Fine. Together."). | §8.2 | P3. Each has a look, a flame colour, a favourite kind of place and 3 signature lines. They are small and specific, which is what "genuine" needs. |
| CH2 | **"Bots are characters, not difficulty levels."** Personality shows as readable habits: Pip misses 20% of throws, Kestrel lobs a stone early 25% of the time, Moss calls "Brace!" on every fall, Brass always volunteers. | §8.1 #4, §6.1, §6.3, §6.6 | P3. Character comes through behaviour, not text walls. |
| CH3 | **Old Tallow the Chandler.** A 2.5 m, six-armed candle merchant who melts and re-forms as he talks: "Ahh. A customer. Or a thief. Same wax." | §10.3, §13.5 | P3. A memorable shopkeeper. Put him in a town in plain sight, not behind a secret panel (see C14). |
| CH4 | **Small ties between characters.** Maud Tallow is Old Tallow's niece, and she never tells him anything. | §8.2 | P3, P2. One line like this makes the world feel lived in. Maud can stay as a charming gossip without the betrayal. |
| CH5 | **NPCs who remember you.** Per character, the Rival Register tracks sessions together, rescues and the last line said. Characters greet you with a callback. | §8.8 | P3, P6. Re-aim it at help and quests ("You pulled me up the chimney last time."), not knives. |
| CH6 | **Emotion shown on the body, automatically:** Calm, Joy, Fear (low health or a monster within 4 m), Anger, Sad. Each has a trigger and a shape change (height, sway, fork, tint). | §4.5 | P3, P1. For frogs this becomes glow and pose. The player reads feelings without UI. |
| CH7 | **Silhouette first.** At 25 m in the dark you can tell a character's type, emotion and status from outline and light alone. | §13.1 | P3, P1. A testable art rule for memorable, readable designs. |
| CH8 | **Shape language:** round = friendly-ish, angular = threat. | §13.5 | P1, P3. It is simple to follow and simple to check. |
| CH9 | **Creature designs worth re-theming:** the Echoing Golem (bell body, clapper fists, glowing crack), the Chrono-Slime (20 afterimages; its eyes lag 0.2 s behind the body), the Librarian (4 m moth-headed figure made of stacked books, paper wings), the Harmony Sentinel (lantern head, gold wires to its lamps; v1's Lamp-Knight), the Mimic (quicksilver mannequin), clockwork Diners (porcelain faces, key-wind backs). | §13.5 table | P3. Each has one readable hook. Several are already frog-themed in v1 (bell_golem, lamp_knight, slime_foundry). |

### 2.3 Creatures and encounters

| # | Idea | Where | Why it fits v2 |
|---|---|---|---|
| E1 | **No monster can be hit to death, and hitting one usually makes it worse.** Every monster is a riddle. | §1.1 #2, §6.14 | P2, P1. One world rule the player learns once and uses everywhere. v1 kept it. |
| E2 | **Physical tells and the readability contract.** Every encounter is solvable with zero text: chalk lines between the right forks, pipes painted in their valve's colour, murals of the solution, frost at the goal. Test: a first-time player clears it in under 6 minutes. | §1.3, §6.0.3, each room's "Physical tells" | P1, P4. The world itself tells you what to do. |
| E3 | **The hint ladder.** A hint line, then `[ PLAIN WORDING ]` with the full solution in one sentence. | §6.0.3 | P1, P4. Nobody stays stuck. For v2, trigger it by failed tries or time spent, not a room timer. |
| E4 | **Encounters to re-theme as landmark bosses or puzzle sites in the open world:** the Golem chord (ring three forks together while it stands in the gold circle; never ring the crooked one) §6.1; the Chrono-Slime (turn valves until steam makes a corridor into the cold store, then shut the hatch) §6.4; the Harmony Sentinel (put out every lamp within 1 s, twice) §6.9; the Drip Chimney climb (holds melt 3 s after touch and regrow after 20 s; pitons, rope, hauling) §6.7; the tied-group run ahead of a burning fuse §6.3; the Executioner that kneels only in the dark §6.12; the Watcher you must not look at §6.8. | §6.1–§6.12 | P6, P1. These are good co-op puzzles with clear rules. Only their betrayal hooks go (§3 below). |
| E5 | **Headcount scaling tables.** Each encounter tunes for n = 1, 2–3, 4–5 and 6–8. "Every room has 1-player tuning." | each §6.x "Scaling", §3.6 | P6, P4. Drop-in co-op needs content that works for 1 frog and for 8. |
| E6 | **Solo stand-ins for group tasks:** wind-up Decoys with a 1–9 s delay that strike a lamp for you (§6.9), and the Ballast Doll you tie yourself to (§6.3). | §6.9, §6.3 | P6, P4. A solo player can still do "group" puzzles, so friends can drop in and out. |
| E7 | **The Bell countdown.** Ringing a bell shows 3-2-1-NOW on every screen in the area, one beat per second. | §6.0.1 `Bell`, §6.9 Bell of Accord | P6, P1. Group timing without voice chat. |
| E8 | **The noise model.** Each action has a hearing radius: walk 3 m, jump landing 5, dive 7, shove 6, throw impact 8, bell 12, ping 10, stomp 9. Monsters go to the loudest sound heard in the last 3 s. | §6.0.5 | P1, P2. One simple sneaking rule across the world. v1 used it for the Sleeping Toad. |
| E9 | **Build encounters as data from a shared kit.** Lever, Valve, Plate, Scale, Fork, Sconce, GazeCone, NoiseEmitter, Rope, Hold, Dial, Bell, Decoy, Chute, Pillar, TellDecal, Checkpoint. One bespoke script per encounter at most. | §6.0.1, §6.0.2 | Tiny team and agent build. In Unity this becomes prefabs plus ScriptableObjects. |
| E10 | **A creature journal with sketch pages.** Each entry has a short hint ("It is deaf to fists. It is not deaf to harmony.") and a full entry. | §9.8, each §6.x Codex lines | P1, P3. v2 keeps the entries always readable (no redaction; see C4). v1 turned this into the Bestiary. |
| E11 | **Failing never ends your session.** A void fall costs 15 health and respawns you at the checkpoint after 1.5 s. | §5.3, §5.2 | P4. A forgiving start. |

### 2.4 Frog mechanics (carry from the Wick controller)

| # | Idea | Where | Why it fits v2 |
|---|---|---|---|
| F1 | **Feel defaults:** coyote time 120 ms, jump buffer 100 ms, auto-mantle ≤ 1.3 m in 0.35 s, air control 40%, no sprint key, no double jump. | §4.2 | P4. Forgiving input that stops beginners failing on timing. Re-tune for a hop. |
| F2 | **The dive-catch.** Grab stays active through a dive, and it is the main way to save a falling friend. | §4.2, §6.13 | P6, P3. For frogs it becomes the tongue-catch (v1 kept it). |
| F3 | **Grab, carry, throw** with weight bands (full speed ≤ 20 kg, −40% for 20–60 kg, drag only above 60 kg) and a dotted arc preview after 0.15 s of charge. | §4.2 | P1. You see where it will land before you throw. |
| F4 | **Brace, Reel and Haul.** Brace to anchor, reel a dangling friend up (1.5 m/s), or haul a friend hanging below you up 1.5 m. | §4.2, §6.3, §6.7 | P6. Helping is a physical, visible act. |
| F5 | **Revive and a ghost state.** Hold interact 2 s on a downed friend and they return at 30% health. While down, you can ping, send quick-chat, nudge small objects and watch. | §4.3, §5.3 | P6, P4. Being down is still play. Drop "Burnt Out" (C26). |
| F6 | **Give health to a friend** (5 per tap; you cannot drop yourself below 10). | §4.3 Drip | P6. A good ability for a support class. |
| F7 | **Hold the door.** Brace in a doorway or hatch to keep it open while friends get through (2 health/s). There is a title for it (*Doorholder*). | §3.6, §6.7 | P6, P3. A small, generous co-op act the world rewards. |
| F8 | **Every hold can be a toggle.** | §4.1, §14.4 | P4, accessibility. |

### 2.5 Co-op and social (no betrayal)

| # | Idea | Where | Why it fits v2 |
|---|---|---|---|
| S1 | **Pings.** Tap = Look (white, 6 s), double-tap = Danger (red), hold = a radial of Here, Go, Wait, Help. | §4.4 | P6, P5. It fits in one input. Drop "Liar!". |
| S2 | **Quick-chat in bell-babble.** Keep "On three.", "Wait.", "Go!", "Here.", "Follow me.", "Help!", "Brace!", "I have a clue.", "I can carry that.", "Thanks!", "Nice!", "Sorry!", "Yes.", "No.", "Go on without me.", "Don't touch it.", "I'll hold the door.", "Which door?", plus the context line "I owe you one, {name}." | §7.9 | P6, P4. Safe and language-light, with no free text needed. |
| S3 | **Emotes:** Wave, Bow, Shrug, Stomp, Point, Clap, Melt, Flicker. | §7.9 | P6. The basic MMO social kit. |
| S4 | **A buddy link without the knife.** Linked friends see each other's outline through walls at any distance, revive each other more cheaply, and get a direction chevron at the screen edge. A link kept to the end turns gold. | §7.2 (benefits only), §14.3 | P6, P1. You never lose your friend in a big world. |
| S5 | **The meeting banner.** When a group arrives where others wait, a chime plays and a banner slides in ("VEX, from 2D, carrying a Brass Key"), and a character may say one line about someone there. | §3.8 Reunion beat | P6. It makes meeting other players an event. Use it for arrivals in towns. |
| S6 | **Autopilot on disconnect.** 60 s of grace while a helper-personality bot drives your character (no bad actions). A reconnect token restores control, and you keep earning. | §16.5 | P6. Friction-free drop-out and rejoin. |
| S7 | **The world is never empty.** Named NPC adventurers fill the world when few humans are on. | §1.1 #6, §16.6 | P6. A living world even in a 2-player lobby. |
| S8 | **Bot realism rules.** Bots perceive like players (line of sight, 25 m, hearing by the noise model), react in 0.25–0.6 s and make 5–20% mistakes. Roles are assigned by fit (Caller, Lure, Thrower, Reader, Runner). Helpers heal a player below 30%, revive, and catch. | §8.1, §8.4 | P6, P3. Companion NPCs who feel like people, not cheats. |
| S9 | **The hub layout as a town template.** A round plaza (radius 18 m), with every service on one arc facing the exits: healing font, anvil, notice board and book, wardrobe mirror, toys. | §10.1 | P5. Everything in town is in sight and a few steps away. |
| S10 | **Town toys:** Wax Stack (stack blocks on a wobbling plinth; v1 Frog Stack) and Snuff Tag (tag with a bell hat, 2 s no-tag-back; v1 Jar Tag). Walk into a ring to join, and bots fill empty seats after 5 s. | §10.2 | P6, P4. Easy social fun between quests. |
| S11 | **First-hub teaching:** contextual prompts, a short demo with Moss and a practice plate. | §3.3 step 2, §10.1 The Foot | P4. Teach by doing, in place. |
| S12 | **Join code** `XXX-XXX` from 30 characters that cannot be confused (no 0, O, 1, I, L). | §16.2 | P6, P4. A backup to Steam invites. |
| S13 | **Safety defaults.** Only a display name and a cosmetic loadout go on the wire. No free text. Streamer mode hides the code and other players' names. | §16.2, §16.7, §14.4 | P6. It protects players in shared worlds. |
| S14 | **A share card that ends on a group shot**, never a villain shot. | §7.10, §16.9 | P6, P3. |

### 2.6 Progression

| # | Idea | Where | Why it fits v2 |
|---|---|---|---|
| PR1 | **"No permanent power except knowledge and sidegrades."** Levels never grant power. | §9.1, §9.9 | Fair progress (owner decision). Friends of different levels can still play together (P6). |
| PR2 | **Origins as light classes.** Same height, hitbox and light position; only proportions and stats differ. Lamplighter: revives cost half, and it senses downed allies within 30 m. Taper: runs 5.4 m/s, climbing costs 25% less. Votive: more health, a stronger brace. Birthday Candle: revives itself once. | §9.5 | Owner decision 1 (light classes or roles), P4. This maps straight onto four simple roles: Healer, Scout, Anchor, Survivor. |
| PR3 | **Feat titles.** Permanent, with a fanfare line; equip one under your name. Co-op ones worth keeping: *Golem Singer*, *Quiet Hands*, *Keeper of the Line*, *Slime-Warden*, *Doorholder*, *One-Breath*, *Merciful*, *Catcher in the Dark*, *Candlelit*. | §9.7 | P6, P3. Other players see what you did. |
| PR4 | **Clean-solve feats.** For example "Untouched" (beat the Golem without hitting it), "One-Breath" (no wrong notes), "Merciful" (never strike the Executioner). | §6.1, §6.9, §6.12 Hidden Pieces | P1, P3. They reward mastery, and a journal can list them so they are not hidden. |
| PR5 | **A few traits as class skills:** Resonance (ring nearby bells), Firebrand (light a lamp at range), Kinship (heals give double), Dimmer, Cold Wax. | §9.3 | P4 if only 1–2 per class. |
| PR6 | **Keys and chests:** a Brass Key opens a Brass Chest. | §9.6 | P1. A simple, readable reward loop. |

### 2.7 Economy and shop ethics

| # | Idea | Where | Why it fits v2 |
|---|---|---|---|
| EC1 | **Cosmetics never change readability or play.** Same height, hitbox and light position. Status overlays always draw on top. Light colours have luminance ≥ 0.6, and no hue within 15° of the warning colours. | §1.3, §12.1 | P1, fair shop. v1 kept this (Seat Hue rule). |
| EC2 | **Premium buys cosmetics only.** No loot boxes. Premium never buys currency, skills, keys or classes. | §1.3, §11.6 | Fair (owner decision). |
| EC3 | **The Vault promise.** Every non-prestige item returns within 45 days. No fake was/now prices. No countdowns under 24 h. Try everything on in the mirror first. You can see items on NPCs before you own them. | §12.5, §12.6 | Addictive but fair. |
| EC4 | **A pass that pays back more than it costs** (950 in, 1,000 back). "There are no XP boosters, ever." | §12.7 | Fair. |
| EC5 | **Earned-only prestige items** tied to co-op feats (Candlelit Halo, Knotted Gold, Blank Mask). | §12.5 | P6, P3. Status you cannot buy. |
| EC6 | **A time-to-earn promise:** the first shop item after about 1 session, a mid item after about 4. | §11.5 | Addictive but fair, and easy to test. |
| EC7 | **Cosmetic ideas that re-theme to frogs:** Teacup and Wine Bottle holders, the Traffic-Cone topper, shadow puppets (Rabbit Ears, Dragon, Crowd of Shadows, The Tall One), Soap Bubbles and Moth Swarm ghost forms, Red String of Fate and Daisy Chain links, Woodblock and Cowbell sounds. | §12.4 | P3. They are charming and specific. The **Shadow** slot (your cast silhouette as a cosmetic) is a cheap, unusual idea. |

### 2.8 Art

| # | Idea | Where | Why it fits v2 |
|---|---|---|---|
| A1 | **"Storybook miniatures", with warm light against cold dark.** The characters are the warm light, and hazards and darkness are cold (blue-violet). | §13.1 | P3, P1. v2 can keep it as the style for dungeons and nights. |
| A2 | **Zone palettes that climb:** Warm Landing (stone `#6B5E57`, lantern `#FFB86B`, dusk sky `#1B2340`→`#F2A65A`) as the town palette; then Belfry Stone, Candle Works, Cathedral of Wax, Ash Court and the Crown (starfield `#0B0E1F`, white-gold `#FFF1C1`). | §13.3 | P2. One colour story from the bottom to the top. Rename the zones for the well. |
| A3 | **Light budget.** Only the local player's light casts real shadows. At most 12 point lights per view; farther lights become glowing sprites. Fake shadow decals. | §13.2 | Tech: this carries straight over to URP. |
| A4 | **Procedural animation numbers:** a hop-waddle bob of 0.08 m at 2.2 Hz, ±8% squash and stretch, 12% jump stretch, a 15% landing squash for 80 ms, a hug squash on a catch. | §13.6 | P3, agent build. v1 also chose procedural motion. |
| A5 | **Big-moment VFX:** the light wave down the tower, confetti in each player's colour on a clear, and fake god-ray cones at exits. | §13.7 | P6, P1. |
| A6 | **The camera spec:** 4.5 m distance, 1.6 m height, 0.4 m shoulder offset, FOV 60 (slider 50–90), a 0.2 m sphere-cast spring arm, a climb cam (6 m, +20° pitch), a shake budget of 0.15 that turns off in reduced motion. | §13.8 | P4. |

### 2.9 Audio

| # | Idea | Where | Why it fits v2 |
|---|---|---|---|
| AU1 | **Bell-babble voices.** Each character has a voice pitch and speaks in short formant syllables. Questions rise, "Help!" is high and sharp, and "Sorry!" falls. | §15.3 | P3. Voice and personality without voice actors, which suits a tiny team. |
| AU2 | **The System voice as glass-bell chimes,** one per typed character. | §15.3 | P1, P3. The narrator is recognisable by ear. |
| AU3 | **Hub music that grows with the crowd:** the Landing waltz (96 BPM, 3/4, F major) adds a layer for every 2 players present, up to 4. | §15.2 | P6. A busy town sounds busy. |
| AU4 | **Three intensity layers per zone** (Calm, Tension, Pressure) that crossfade over 2 s. | §15.2 | P1. The music tells you when danger is near. |
| AU5 | **A musical identity per place:** taiko for arenas, pizzicato and clock ticks for puzzles, rope strings and wind for climbs, a harpsichord canon for scales, organ and choir for the summit. | §15.2 | P2. Each place sounds like part of one score. |
| AU6 | **Singing rope.** Each tether segment is a string whose pitch follows its tension, fitted to D Dorian, so a group moving together plays a chord. | §6.3 audio | P6, P3. A small delight that is only for co-op. |
| AU7 | **Stingers and the SFX list** (clear, fail, title, link tied; footsteps, catches, bells). | §15.2, §15.4 | A ready sound brief. |

### 2.10 UI

| # | Idea | Where | Why it fits v2 |
|---|---|---|---|
| U1 | **A minimal HUD where the body is the health bar.** The interaction prompt sits next to the target ("Hold E: Wind") with a fill ring. | §14.3 | P1, P5. |
| U2 | **The System window spec.** Panel `#0B1630` at 92%, border `#5CE1E6`, top-centre, max 560 px wide, typing at 35 characters/s, windows queue, and Tab reopens the last 10. | §14.2 | P1. A readable log of what just changed. |
| U3 | **The accessibility set:** toggles for every hold, full rebinding, colour-blind shape codes per category (triangle, square, circle, diamond, hexagon, star, crown), captions for lines and key sounds, reduced motion, flashes capped at 3 Hz, text size 100–150%, streamer mode. | §14.4 | P4, P5. |
| U4 | **Fonts and motion:** Fraunces for display, Nunito for UI, JetBrains Mono for System text and numbers. UI easing `cubic-bezier(0.2, 0.8, 0.2, 1)` at 180–240 ms. Banners slide in over 300 ms and hold 3 s. | §14.5, §14.6 | P3, P5. A consistent feel. |

### 2.11 Tech and production method

| # | Idea | Where | Why it fits v2 |
|---|---|---|---|
| T1 | **Every number lives in a data table,** never hard-coded. | "How to read" | Agent build. It is easy to tune and to diff. |
| T2 | **Milestone gates with numbers.** Style lock: 8 of 10 blind viewers name the intended look. A "kill gate" for a risky feature, with a fallback. | §17.3 | Method: it keeps a tiny team honest. |
| T3 | **Automated acceptance tests.** Every encounter builds for n = 1 up to its cap. Bots clear each one at least 70% of the time over 50 seeds, headless. A screenshot diff proves status overlays draw above every cosmetic pair. | §17.4 | Agent build, P1. |
| T4 | **Netcode habits:** the client predicts only its own body, and everything else is server-authoritative (the host under NGO). Interest tiers by distance. Bandwidth target ≤ 12 KB/s per client. A larger interpolation buffer (150 ms) for tethered players. | §16.3, §17.5 | P6. These carry over to NGO host mode. |
| T5 | **Profile export and import** as a file. | §16.8 | Useful for a persistent-feeling world without accounts. |

---

## 3. Party-only (to archive)

All of this only makes sense in the betrayal party game. Archive it with the source link. None of it goes into the v2 main game.

| Item | Where |
|---|---|
| Tagline "Belay or betray." and the trailer and boss line "Climb together. Fall alone." (v1 kept the second one as the KNOTWELL tagline; it is a betrayal line) | §0, §6.13 |
| Pillar 3 "Every door is a social decision" and Pillar 4 "Belay or betray" | §1.1 |
| The Among Us / Mafia row of the inspiration table (hidden traitor, votes) | §1.2 |
| Door Draft plate scramble: Calm and Stampede shoves, the Draft wind, the Draft Cam, the Latch, and "choose who you're locked in with" | §3.3, §3.6 |
| Hold the Door shove-out and the **Slam** | §3.6 |
| **Knots as pacts you can cut:** Cut the Knot, Cinch, the Pact Pot, taking 25% of a partner's Embers, the Betrayal Cam | §4.4, §7.2 |
| **The ten Knives:** The Cut, Snip, Cut the Knot, Rope Cut, Hot Drip, Blindfold Rip, Pinch, Splash, Bloodwax, Crown Rush | §7.3 |
| **Soot** bands, **Notorious**, and Soot removal by Confession, Forgive or the Penitent Fall | §7.4 |
| Grudges, the Trust math for knives, the **Resolve** tell, "cold feet", the Knife utility formula, betrayal windows in every RoomDef | §7.5, §8.1 #3, §8.5, §6.0.2 |
| The **Tribunal** and **Branded** | §7.6 |
| Truth-stamped **Notes**, including "{name} lies here." and "it's a trap." | §7.7 |
| **Keyhole bets**, including betting against your own Pact partner | §7.8 |
| The **Clue Composer** "said" lies; the quick-chat lines "Trust me.", "Liar!", "Worth it.", "I'll just check it."; the context line "You. You {knife-verb} me in {door}." | §7.9, §4.4 |
| Lobby betrayal settings (Off, Physical, Full), the Friendly preset, **Masked Bots** | §7.10, §3.9, §14.1 |
| **Liar's Banquet:** the **Taster** secret role, the Pinch, the seating vote, the Second Accusation, the Host accomplice | §6.5 |
| **Weighing Hall** lifeboat: chute levers, the victim's share going to the puller, the last-out Tithe, the Martyr Step Down | §6.6 |
| **Hall of Grievances (Weight of Guilt):** Regrets that wear your victim's face, the broadcast Confession, Forgive or Condemn (v1 cut this room) | §6.10 |
| Every room's "Betrayal hooks" and "Bot betrayal window", plus the greed bonuses built to be sniped: Clapper Heart / Last Note, Tome, Verdict, the Heartcandle "latest strike", First Through, SOLE 65/35 | §6.1–§6.12, §6.0.4 |
| Fuse Tether: Snip and run for the one-Wick Wicket | §6.3 |
| Drip Chimney: racing, hot drips, cutting the rope, letting the hatch slam | §6.7 |
| Glitched Watcher: Blindfold Rip, steering a blind partner to a false pillar | §6.8 |
| Mimic's Toll: Splash, and overwriting the copy to deny a reward | §6.11 |
| Karmic Executioner: Bloodwax sniping, resetting Absolution on purpose | §6.12 |
| **The Snuffer's betrayal layer:** soot tendrils named after Knives, grudge bots stepping aside at the Trust Fall, the Penitent Fall, the Crown Door solo claim (**Everflame**) against the shared Vigil, the bot `U_crown` formula, the Snuffed Summit | §6.13 |
| The **Drama Director**'s betrayal quotas (1–3 witnessed betrayals per run, the mercy rule) | §8.7 |
| Betrayer Rivals as betrayers: **Vex Sulphur** (Opportunist), **Maud Tallow** as the Charming Liar, **Gutter** (the Returnee who hunts you, weighted ×3 if you knifed him) | §8.2 |
| The Rival Register's knife tallies and grudge callbacks | §8.8 |
| Awards and titles about knives: *Sharpest Knife*, *Clean Hands*, *Notorious*, *Everflame*, *Second Guess*, *Scapegoat* | §5.5, §9.7 |
| The **Betrayal Snap** cosmetic slot (6 items, including Villain Monocle); the Oath Thread as a pact display; the Crown Wax and Crown Seal prestige items | §12.2, §12.4, §12.5 |
| The **Matchstick** Origin ("born guilty", starts with 1 Soot); the **Cutpurse's Eye** fusion; the **Snip** trait; **Unremarkable**'s anonymous Notes; the **Rumour** item that reveals a Ledger name | §9.3–§9.5, §10.3 |
| Minigames **Pinky Promise** (split or steal) and **Rumour Dice** (liar's dice) | §10.2 |
| Grate taunts, gossip barks, and Ghost Sim knife captions ("Gutter chuted Pip in 2D") | §3.8, §8.6 |
| The Ledger overlay and results timeline built around Knives | §7.1, §14.1 |
| The Hollow Suit's betrayal: only the head can see. The shared-body idea itself is co-op and could return as a toy (v1: Big Toad). | §6.14 |
| Betrayal-themed names: KNOTSPIRE, TRUSTFALL, BACKSTAIRS, OATHSPIRE (LATCHLIGHT was the Season 1 name) | §0 |

**A possible opt-in hook (build nothing now):** if v2 keeps one town side mode, the least costly source is the Liar's Banquet deduction room, whose rules are self-contained (§6.5). Pinky Promise (§10.2) is the smallest social-risk toy.

---

## 4. Conflicts with the new pillars

| # | Item | Pillar | Why |
|---|---|---|---|
| C1 | A run-based roguelite. The 36–45 min run resets everything each time ("Soot resets every run", "Word and Soot reset every run"). | P2, P6 | v2 is one persistent-feeling world with one story. A reset loop has no ongoing story or place. |
| C2 | A seeded procedural tower: 6 door letters, floor bands, Echo tiers, 6 Omens, the capacity check, the X-alcove roll | P2, P1 | Places are generated, not authored, so they cannot carry one story. The rules behind each floor are invisible to players. |
| C3 | Twelve rooms, each a different outside game (Among Us, PEAK, Chained Together, a glitch room) | P2 | It is a genre sampler, not one world. The roster check (§6.14) scores rooms by inspiration coverage, not by story. |
| C4 | **Redacted Clear Conditions** (`███`), study levels, Regression Scars, Codex un-redaction | P1, P4 | It hides the goal on purpose. A new player sees blocks where the instructions should be. |
| C5 | The hint only appears at 50% of the room timer, and the plain answer at 75% | P1 | A player can be stuck for 2–3 minutes before help arrives. |
| C6 | Timers everywhere: rooms 3:30–5:30, the Tide, Pressure (×1.5 speed), Intermission 45 s, Draft 45 s, Latch 6 s, a 9:00 boss cap | P6, P4 | Timers fight drop-in play and relaxed open-world exploring, and they add stress for beginners. |
| C7 | Wax as health: a shrinking body, ambient burn per floor, verbs that cost health (Brighten 1/s, hold-the-door 2/s) | P2, P4 | These are candle rules that do not fit the frog world. v1 cut them as "measures loss" (DECISIONS §8.3). |
| C8 | 22+ key bindings: Dive, Brace, Grab, Shove/Throw, Interact, Brighten, Dim, Drip, Traits 1–4, Knot, Cut, Ping, Quick-chat, Emote, Ledger, Shoulder, Draft Cam, Ready | P4, P5 | Far too many to learn in 5 minutes. v1 cut to 8 bindings. |
| C9 | A hidden **brightness rating** (base 1, +3 Brighten, −1 Dim, +2 Notorious, +1 Branded, −3 Unremarkable) that decides who monsters target | P1 | The player cannot see the number that decides who gets hit. |
| C10 | Too many currencies and tokens: Embers, Drips, Sparks, Brass, Master and Black Keys, Crown Fragments, Wick XP, pass XP | P5, P4 | Too much to track. v1 reduced this to Wish Coins and Pearls. |
| C11 | 16 traits + 8 fusions + an Altar draft with pick order + 4 slots with discard + titles that grant private cards | P4, P5 | A deep build system, taught mid-run, with rules for who picks first. |
| C12 | Origin select before play | P4 | It adds a choice screen before the player controls anything (v1 council cut "class select before the Keeper"). |
| C13 | Door plaques with 7 fields (designation, capacity dots, reward-rule icon, Omens, Codex hint, 2 Notes, redacted Decree) | P1, P5 | Too much to read in a 45 s scramble. v1 cut plaques to 4 fields. |
| C14 | **Old Tallow's hidden Market:** a 35% chance per Landing, revealed only by a Black Key, certain traits or knocking on the right panel | P5 | A core shop that is hidden and random breaks "nothing hidden". Keep the character in plain sight (CH3). |
| C15 | Parallel sealed instances: the Ghost Sim, Grates, Side Doors, Visitors, Keyholes | P6, P5 | Players are split into locked rooms instead of sharing one world. Meeting happens through bars and spyholes. |
| C16 | Glitch dressing: missing-texture checker, "404: Wick not found.", "an error the Tower never fixed", chromatic pulses | P2 | It breaks the in-world logic unless the story explains it. It also adds flashing (capped at 3 Hz). |
| C17 | The System "never gives advice beyond the Clear Condition and the hint ladder" | P1 | v2's narrator must always be able to say what to do next and why. |
| C18 | Darkness as the default ("lit only by the players"), Lantern-dark fog at 10 m | P1, P4 | Open-world navigation needs landmarks you can see. Keep deep darkness for dungeons and nights, not the whole world. |
| C19 | Room rules that are too complex: the Library's 1,680-code logic puzzle with 2 liar books; the Banquet's cup weights, testimonies and 12 cards; the Weighing Hall's "Needed = Baseline − T" by headcount | P4 | High learning curve. Fine as optional hard content, not as the main path. |
| C20 | Candle words everywhere: Wick, wax, Snuffed, Relight, Holder, Smoke, Scorched | P2 | These are off-theme for Firefly Frogs. v1 retired them (glossary "Retired words"). |
| C21 | The tech stack: Vite + TypeScript + Three.js r186, a Node `ws` server on port 8787, solo in a Web Worker, Web Audio synthesis, IndexedDB, a single-file HTML build | Owner decision (Unity 6000.3.25f1 URP, NGO 2.13.3 host mode, Steam) | Only the designs and numbers carry over. The code plan does not. The procedural audio recipes become a sound brief. |
| C22 | "If the host leaves, the server keeps the lobby running" | P6 | This relied on a dedicated server. In NGO host mode, v2 needs its own answer for the host leaving. |
| C23 | Retention pressure: a daily rotating shop (6 slots, 24–48 h), a first-run-of-the-day bonus (+50), a 40-tier season pass | Fair progress, P5 | Things appear and vanish on a clock. v1 cut these (DECISIONS §8.3). Keep the Vault promise and no-booster rules (EC3, EC4). |
| C24 | A main menu with 9 entries, and features split between the menu and the hub (Codex, Wardrobe, Shop, Rival Register) | P5 | P5 wants every feature within 2 inputs from play and in one obvious place. |
| C25 | 10 cosmetic slots, including betrayal-only ones | P5 | Too many slots. Several exist only to show betrayal. |
| C26 | **Burnt Out:** out for the rest of the run; in solo, it ends the run | P4, P6 | It punishes new players, and it stops a friend from playing with the group. |
| C27 | **Scorched:** −25% max health next floor and no reward | P4 | A harsh fail rule. A world with checkpoints needs a softer one. |
| C28 | A floor rhythm that creates waiting on the Landing (the GDD lists "Waiting on the Landing" as a risk) | P6 | Players wait for others' rooms to finish. An open world should never make people wait. |
| C29 | The boss's two exclusive endings (one player alone, or everyone) | P2, P6 | v2's story needs one co-op ending. |

---

## 5. Key numbers and names worth keeping consistent

### 5.1 Body and movement (re-tune for a frog, but start here)

| Name | Value | Where |
|---|---|---|
| Run speed; acceleration; deceleration; turn rate | 5.0 m/s; 30 m/s²; 40 m/s²; 720°/s | §4.2 |
| Jump apex; game gravity; air control | 1.4 m (vy₀ 5.3 m/s); 20 m/s²; 40% | §4.2 |
| Coyote time; jump buffer | 120 ms; 100 ms | §4.2 |
| Auto-mantle | ledges ≤ 1.3 m, 0.35 s | §4.2 |
| Dive | 7 m/s forward + 2 m/s up; 0.5 s slide; 0.35 s recover; 1.0 s cooldown | §4.2 |
| Grab cone | 1.6 m, 60° | §4.2 |
| Carry bands | ≤ 20 kg full speed; 20–60 kg −40%; > 60 kg drag at 1 m/s | §4.2 |
| Throw | 0–0.8 s charge maps to 5–14 m/s; arc preview after 0.15 s | §4.2 |
| Shove | 0.2 s windup; 1.4 m, 50°; 6 m/s + 1.5 m/s up; 60 ms hitstop; 1.2 s cooldown | §4.2 |
| Escape a carry | 6 jumps within 2 s | §4.2 |
| Hitbox (never changed by cosmetics) | capsule 0.32 m radius × 1.1 m | §5.1, §1.3 |
| Revive | hold 2 s; returns at 30% | §4.3, §5.3 |
| Give health | 5 per tap, 0.25 s per tap; never below 10 | §4.3 |
| Void fall | −15 health; respawn at the checkpoint after 1.5 s | §5.2 |
| Fall damage | above 6 m, 3 per metre, max 30 | §5.2 |
| Arriving at a hub | +20 health | §5.2 |

### 5.2 Camera, UI and accessibility

| Name | Value | Where |
|---|---|---|
| Follow camera | 4.5 m distance, 1.6 m height, 0.4 m shoulder, FOV 60 (slider 50–90), 0.2 m sphere cast, 8 m/s return | §13.8 |
| Climb cam; shake budget | 6 m, +20° pitch; max 0.15, off in reduced motion | §13.8 |
| System window | panel `#0B1630` at 92%, border `#5CE1E6`, max 560 px, top-centre 24 px, JetBrains Mono 600, body 16 px, 35 chars/s, 4 s + 50 ms per character, Tab reopens the last 10 | §14.2 |
| UI palette | night `#0E0B10`, panel `#1A1420`, text `#F4EDE3`, muted `#A89F94`, danger crimson `#FF3D6E`, gold `#FFD76A` | §13.3 |
| Fonts | Fraunces 600/800 (display), Nunito 400/700/800 (UI), JetBrains Mono 500/600 (System, numbers) | §14.5 |
| Motion | `cubic-bezier(0.2, 0.8, 0.2, 1)`, 180–240 ms; banners 300 ms in, 3 s hold | §14.6 |
| Cosmetic colour rules | luminance ≥ 0.6; no hue within 15° of the warning colours | §12.1 |
| Accessibility | text 100–150%; flashes ≤ 3 Hz; every hold can be a toggle; category shape codes: triangle, square, circle, diamond, hexagon, star, crown | §14.4 |
| Emotion trigger | Fear at < 25% health or a monster within 4 m | §4.5 |

### 5.3 World, audio and tech

| Name | Value | Where |
|---|---|---|
| Hub plaza | radius 18 m; exits on the north arc at radius 16 m; services on the south arc | §10.1 |
| Noise radii | walk 3, jump land 5, dive 7, shove 6, throw 8 (×1.5 if ≥ 3 kg), bell 12, ping 10, stomp 9 (m); monsters track the loudest sound in the last 3 s | §6.0.5 |
| Group ritual | ≥ 75% of players in the ring for 10 s in total; the light wave takes 6 s | §6.13, §13.7 |
| Hint ladder | hint at 50%, plain wording at 75% (v2: re-base on tries or time spent) | §6.0.3 |
| Readability test | a first-time clear in under 6 min using tells alone | §1.3, §17.3 |
| Hub music | waltz 96 BPM, 3/4, F major; +1 layer per 2 players, max 4 | §15.2 |
| Music layers | Calm / Tension / Pressure, 2 s crossfade | §15.2 |
| Reverb RT60 | belfry 3.2 s, library 1.4 s, chimney 2.5 s, Landing 1.0 s, Crown 4.0 s | §15.1 |
| Voices | player pitch 180–420 Hz; syllables 70–110 ms | §15.3 |
| Light budget | 12 point lights per view; only the local player's light casts shadows (512 cube map); light radius 6 m | §13.2 |
| Performance target | 60 fps at 1080p Medium on integrated graphics (Intel Iris Xe class) | §13.2 |
| Netcode | 30 Hz tick, 20 Hz snapshots, 100 ms interpolation (150 ms when tethered), ≤ 12 KB/s per client | §16.3, §17.5 |
| Disconnect grace | 60 s of helper autopilot, then autopilot for the rest of the session | §16.5 |
| Join code | `XXX-XXX`, 30-character alphabet without 0/O/1/I/L | §16.2 |
| Bot realism | reaction 0.25–0.6 s; 5–20% action errors; headless clear rate ≥ 70% over 50 seeds | §8.1, §8.4, §17.4 |

### 5.4 Economy fairness

| Name | Value | Where |
|---|---|---|
| Cosmetic tiers (earned currency) | Tallow 300, Beeswax 900, Tapered 2,400, Gilded 7,200; about 250 earned per session | §11.5, §12.3 |
| Vault promise | every non-prestige item returns within 45 days | §12.6 |
| Shop rules | no was/now prices, no countdown under 24 h, try-on before buying | §12.6 |
| Pass | 950 premium in, 1,000 back; no XP boosters, ever | §12.7 |

### 5.5 Names

- **Characters (reusable):** Moss, Brother Brass, Pell, Pip Fizzwick, Kestrel, Ines the Taper, Lumen, Old Tallow the Chandler, and Maud Tallow (his niece; keep her without the lying role). Archive **Vex Sulphur** and **Gutter** with the party mode, or rewrite them as non-betrayers.
- **Rival colours:** Moss `#9BE07A`, Vex `#E8F24A`, Pell `#6AA8FF`, Lumen `#C7B6FF`, Brass `#FFC45C`, Kestrel `#FF8A3D`, Maud `#FF7FA8`, Pip `#6FF0D6`, Ines `#FFF6E0`, Gutter `#FF5A4A` (§8.2).
- **Creatures:** Echoing Golem, Chrono-Slime, the Librarian, Glitched Watcher, Harmony Sentinel, the Mimic, Karmic Executioner, the Snuffer, clockwork Diners and the Host.
- **Places and objects:** the Knotspire, the Foot, the Landing, the Relight Font, the Mirror, the Great Wick, the Vigil Ring, the Crown Door; zones Warm Landing, Belfry Stone, Candle Works, Cathedral of Wax, Ash Court, the Crown.
- **v1 re-theme map (keep ids stable if v2 reuses them)**, from `_design/master/DECISIONS.md` room table: `golem_belfry` → `bell_golem`; `harmony_sentinel` → `lamp_knight`; `clockwork_foundry` → `slime_foundry`; `glitched_watcher` → `glitch_eye`; `fuse_tether` → `sp_tongue_tether`; `drip_chimney` → `sp_grip_wall`; `whispering_library` → `moth_library`; `the_snuffer` → `warden_the_jar`; `mimics_toll` → `mirror_toll`; `karmic_executioner` → `ash_axeman`; `hollow_suit` → `toy_bigtoad` / `hollow_toad`; Wax Stack → Frog Stack; Snuff Tag → Jar Tag. Party-only mappings: `liars_banquet` → `doppelfrog`, `weighing_hall` → `heart_two_pads`, Pinky Promise → Split or Swallow.
- **Retired words (do not bring back):** Belay, Door Draft, Latch, Stampede, the Tide, Omens, Soot, Knives, Tribunal, Ledger, Altar, trait, Anvil, Origins, Codex, wax, Snuffed, Scorched, Embers, Drips, Sparks, Wickbook (v1 glossary, `_design/master/00_OVERVIEW.md` §9).
- **Retired title:** KNOTSPIRE (it collided with Croakspire, per `00_OVERVIEW.md` §1). The runner-ups were TRUSTFALL, BACKSTAIRS, OATHSPIRE and LATCHLIGHT (§0).

<!-- END -->
