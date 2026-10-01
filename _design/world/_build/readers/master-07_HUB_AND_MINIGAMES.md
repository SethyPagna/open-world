# Reader: master/07_HUB_AND_MINIGAMES.md

**Source:** `_design/master/07_HUB_AND_MINIGAMES.md` (KNOTWELL v1.0, 2026-09-29, about 1,080 lines, read in full).
**Reader date:** 2026-09-30.
**Purpose:** sort v1's hub, Landing and minigame file into what v2 keeps, what goes to the archive, and what fights the six v2 pillars (P1 Clear, P2 One World One Story, P3 Genuine, P4 Easy to Start, P5 Organized, P6 Open World Together).

Section marks like "§4.5" point to sections of the source file. "Rivals" are v1's named bot frogs.

---

## Summary for the archive

`07_HUB_AND_MINIGAMES.md` is file 07 of the KNOTWELL v1 master design set, bound by `DECISIONS.md` and `FUN_OVERHAUL.md`. It owns every space outside the monster rooms:
- the Well Bottom hub, which is the title screen, the lobby and the trophy room in one live place;
- `hatch_pond` (door 0), a 35-second shot list for the first climb;
- the three Landings: 40-second warm stops after doors 5, 10 and 15, with a save, a free revive, a jar lineup, falling Wish Coins, a stall, the Mirror and one toy;
- the Keeper Landing ceremony;
- the `meeting_room`, where a split party meets again;
- four physical minigames (Frog Stack, Fly Catch, Jar Tag, Lily-Pad Sumo) and a Landing Party mode;
- the Rim, where the party glides after surfacing.

Its main decisions: a ten-rule "never idle" contract (overlays, not screens; no locked input; no loading screens; nobody waits on a slow human); the menu is the world; difficulty is picked by walking through one of four doors; everything earned changes the hub physically; no paid prompt inside a climb; toys never cost anything and pay only small jars; Landing Party pays records only. It ends with build notes, ten tests and nine open questions.

The goal was to keep hands busy and hold time outside rooms near 12% of a 24-minute party climb. v2 keeps its places, onboarding craft, toys and fairness rules. It drops the run timers, the betrayal hooks and the always-8 bot seats.

---

## Reusable for v2

Each row names where the idea sits in the source, why it fits the v2 pillars, and what must change (if anything).

### World and places

| Idea | Where | Why it fits | v2 note |
|---|---|---|---|
| **The menu is the world.** The title loop is the live hub, not a video. Boot starts a solo host and loads the world at once. | §2 intro; §2.9 | P4: control in about 5 s, no menu stack. P6: you start inside the shared place. | Keep. The first town is the title screen. |
| **The Well Bottom (the Foot)** as home: a mossy stone deck on black water, lantern-lit, stone steps down to a pond, the Mouth overhead. | §2, §2.2 | P2: the start of the frog-in-a-well story is a real place. P6: a natural starter town. | Keep as the first town. Remove the four difficulty doors and the Resume door (see Conflicts). |
| **Warm stops rule**: towns are lantern-lit and loud, with no monsters, and nothing there can hurt you ("dread, then a waltz"). | §1.1 rule 7 | P1: safe and unsafe read at a glance. P2: one visual grammar for the whole world. | Keep as the town rule. |
| **Statue of the first frog**, 0.9 m, pointing at the Mouth. The inscription reads 井底之蛙, "worn smooth where someone kept pointing up." | §2.6 | P2: the story's first clue sits in the first town. P3: a small, sincere, specific detail. | Keep as a story landmark and a first quest-giver prop. |
| **The Landing layout**: a stair mouth in the centre where arrivals climb up from below, a jar shelf ring, the stall, the Mirror, a lily bed to rest, and one play spot. | §4.1, §4.2 | P5: one repeatable layout, so every town works the same way. P6: a hangout spot. | Reuse as the town template along the well's strands. Drop the Knot spot and the exit timers. |
| **The view across the well**: from a Landing you see the other strands and their Landings at LOD. | §4.1 "The view" | P6: an open-world feel, since you see places you can go. P1: the next goal is visible. | Keep. Every town should frame the next place. |
| **The Mouth glance**: on arrival the camera tilts up (+65°) to show how much wider the sky is; any look input cancels it. | §4.3 | P1 and P2: progress is shown in the world, not in a HUD number. | Keep on first arrival at each town. |
| **The Mouth's rain**: coins drift down the light pillar; the wider the Mouth, the thicker the rain. | §4.5 | P2: rewards follow a world rule. It is a small "look up and snap" skill game. | Keep as a town arrival treat; tie it to the one v2 currency. |
| **The Rim**: a walkable lip ring (~340 m), 12 lantern poles that were the "stars" seen from below, a glide line of three moss pillars to a lookout facing a tear in the dome. | §8.1, §8.2 | P2: pays off the idiom with a place, not a cutscene. P6: a new open region. | Keep as the act-one payoff region. It is no longer a results screen. |
| **"It put you back."** Falling into the cloud sea is free; you puff back onto the terrace. | §8.2 | P4: low fail cost while exploring. P1: one honest line. | Keep for high regions. |
| **Soft water**: falling into the pond costs nothing; you swim at 1.5 m/s and hop back on. | §3 rules | P4: nothing punishes a first-minute mistake. | Keep for all town water. |

### Characters

| Idea | Where | Why it fits | v2 note |
|---|---|---|---|
| **Named frogs with a post and one line**: Moss in a doorway ("Here."), Brother Brass by the plinth ("I can carry that."), Kestrel posing and falling ("Watch this!" / "That was on purpose."), Pell at the map ("Interesting."), Maud at the Mirror ("Oh, sweetie."), Pip behind you ("I'll follow you!"), Lumen alone on the parapet (silent), Ines tapping a foot ("Go!", "Personal best."). | §2.8; §6.1–6.4 Rival plans | P3: each one has a place, a habit and one short human line. You meet them by where they stand. | Turn them into town NPCs and quest companions with fixed homes. Keep their posts as their "home" spots. |
| **Character shown through play**: Brass volunteers as the stack base; Moss steps onto a tipping pad to save you ("Nobody falls today."); Brass holds the centre ("Go. I'll hold."); Pip climbs first when a human is the base; Kestrel's charged hop belly-flops. | §6.1–6.4 Rival plans | P3: personality through behaviour, not text. | Keep as NPC behaviour in town activities. |
| **The stall toad**: a 1.2 m moss-covered old toad with half-closed eyes, speaking only in croaks and emote bubbles. It snores at Landing 1 and wakes when a coin drops into its bowl. | §4.6 | P3: memorable with no dialogue. P2: its wake-up follows cause and effect. | Keep as a shopkeeper. v2 can give it a name. |
| **Moss the helper**: "Here." in the doorway on first launch, braced at the first slab, sitting on the Rim looking down ("It was so small."). | §2.8; §3.1; §8.2 | P3 and P1: a guide who shows the way by standing in it. | Strong candidate for the first guide NPC, minus the Knot and Vengeance beats. |
| **Pell and Lumen** as quiet types (the reader, the loner). | §2.8; §8.2 | P3: not every character needs to joke. | Good seeds for lore NPCs. |

### Frog mechanics and co-op verbs

| Idea | Where | Why it fits | v2 note |
|---|---|---|---|
| **Tongue is Interact**; a prompt glyph shows within 2.5 m and 45°. | §2.3 | P4 and P5: one button for "do the thing". | Keep. |
| **Personal firefly clouds**: every frog has its own cloud in its Seat Hue; only the owner can gulp it; no stealing. | §3 rules | P6: MMO-style personal loot, so strangers never compete for the same reward. | Keep for quest rewards and XP pickups in the world. |
| **Consent haul**: the tongue tip dangles 1.5 s; a frog is reeled up only if it holds Tongue on the tip. "Nobody is ever hauled without holding on." | §6.1 Rules | P6: co-op help with no griefing path. | Keep as the rule for every player-to-player tongue move. |
| **Frog Stack perching**: land within 0.30 m of a head and ride it; max 4 per stack; the base walks at ×0.35. | §6.1 | P6: a physical co-op move anyone understands. | Keep as a world traversal trick (reach a high ledge together) and a town game. |
| **Chorus steadies**: croaks within 0.3 s of each other calm a stack, with a chord. | §6.1 | P6: a group verb with no menu. | Keep; teach it in words (see Conflicts). |
| **Glide on the Rim**: one prompt, "Hold Hop to glide"; gravity ×0.55, fall ≤ 3 m/s. | §8.2 | P4: one new verb, one prompt. P2: the Glider molt belongs to the sky. | Keep as the Rim region's movement unlock. |
| **Growth lanes**: every toy has a route only a higher verb rank reaches (Hop II to the 2.25 m head, Tongue II to a hook, Air Hop to the beacon). | §6.0 Fairness; per-toy lanes | P1 and "fair progress": you see what your new rank lets you do. P6: rank gates fit open-world routes. | Keep as the rule for world design: every new rank opens places you have already seen. |
| **Heal bug**: a 0.1 kg glowing beetle that rides on your back; you can tongue-pass it to any frog. | §4.6 | P6: a cute, visible way to help a friend or a stranger. P3: memorable. | Keep as a support item. |
| **Tadpole ghosts**: downed frogs float as tadpole ghosts and re-hatch at a town with a free revive. | §4.3 | P2: death uses the world's life cycle (egg, tadpole, frog). P4: low loss. | Keep as the respawn rule; towns are respawn points. |
| **Lantern gnats**: tongue them for a *plink*; nothing else. | §2.3; §2.7 | P4: hands stay busy with zero rules. | Keep as ambient town detail. |

### Progression, rewards and shop

| Idea | Where | Why it fits | v2 note |
|---|---|---|---|
| **Trophies are physical**: what you earn changes the room (chains fall, a stone notch lights, a chalk record is rewritten with a squeak, a letter is carved on the statue plinth). | §2.6 | P1: progress you can walk to. P2: rewards live in the world. | Keep. Your home area or town changes as the story moves on. |
| **Bestiary stones**: one stone per creature, notches for Seen, Survived, Cleared; blank and dark until seen. | §2.3; §2.6 | P1: a creature record you can see. P5: one place for creature facts. | Keep, plus a menu path (see Conflicts). Drop the "Hidden clear" notch. |
| **Jars graded by shape and colour** (Bronze squat, Silver tall, Gold star-lidded). A grade is known when earned; "the pop reveals nothing random." | §4.5 | P1: colour-blind safe reading. Fair: no loot-box reveal. | Keep as the reward container look. |
| **The jar lineup**: jars hop onto a shelf and pop 0.4 s apart with rising notes; hold Tongue to pop the rest; you can walk away. Friends' pops are heard across the deck. | §4.5 | P6: other players' rewards are audible, a shared "ding". P4: never blocks play. | Keep for quest turn-ins in towns. |
| **Fair stall rules**: private shopping, no stock race, no countdown, no discount, no "limited" label; two frogs can shop together. | §4.6 | "Addictive but fair" from the brief. | Keep as shop ethics. |
| **NPCs visibly shop**: their purchases pop over their heads, so you see the economy work. | §4.6 | P6: a living-town feel. | Keep for town NPCs. |
| **The Mirror**: a round brass frame holding a standing sheet of water; try-on while the world keeps running; others see your frog admiring itself. The Rim version is a rain pool. | §2.3; §2.6; §8.1 | P2: the shop is a thing in the world. P6: cosmetics are social. P5: the same frame in every town. | Keep in every town. Add a menu path for equipping (see Conflicts). |
| **No paid prompt during play**: Supporter items only on one quiet shelf in the home town; no sale badge, no timer, no text. | §2.6 Supporter shelf; §9.4 `NoPaidPromptInClimbTest` | Fair monetization for the cosmetic shop. | Keep, and keep the test. |
| **Story-moment hats**: the Bell Cap waits on the stall cushion when the stall first opens; the Rim Stone chips off the lip onto your head on first surfacing. | §4.8 step 5; §8.2 | P2 and P3: a reward that is a small scene, not a menu line. | Keep the pattern: milestone cosmetics arrive in the world. |
| **Rest has equal weight to going on**; nothing starts by itself. | §1.1 rule 8; §2.10; §7 | Fair retention. | Keep as an ethics rule. |
| **Toys never cost** a life or XP and have soft floors; free play pays only the laugh. | §6.0 Rewards; §2.7 | P4: safe to try. Fair: minigames never become a farm. | Keep. Prefer toy-milestone hats to currency (§10 open question 8). |
| **Friends' records on a chalk wall** from a Steam stat, with a LAN fallback; no online status and no "X passed you" outside the game. | §2.6 best-door wall | P6: friendly social proof. Fair: no guilt pings. | Keep the wall; change the stat from "best door" to a v2 measure. |

### UI and onboarding

| Idea | Where | Why it fits | v2 note |
|---|---|---|---|
| **The never-idle rules** that fit an open world: overlays, not screens; input never locked outside rare camera moments; every stop pays something you can see; the System speaks at most twice per stop; no loading screens. | §1.1 rules 1–4, 9, 10 | P1, P4, P5: the player is never parked in a menu. | Keep as UI law for v2. |
| **Press any key from 0.3 s; the egg hatches in 2.8 s; control by 0:05.** | §2.9; §3.1 | P4: far inside the 60 s target. | Keep. |
| **The `hatch_pond` shot list**: control, a first reward at ~0:20, a first laugh by 0:30, felt teamwork, and no text to read. Each beat has a fallback that never blocks. | §3.1 | P4: a tested model for the first minute. | Keep the format and the timings; re-author the beats around the v2 story. |
| **Just-in-time prompt glyphs** (Hop, Tongue, Shove) that appear only when the verb is useful. | §3.1 | P4: teaching by doing. | Keep. |
| **The System's cause lines**: `[ TONGUE II ] 4.5 m. Grapple. Because: you gulped 30 fireflies.` | §3 rules; §3.1 | P1: every change comes with its reason. | Keep the "Because:" format. |
| **Staged reveal**: the first launch shows one open path; toys, the Mirror and the stall appear after the first big milestone. | §2.1; §2.7 | P4: nothing arrives in a pile. | Keep, per story step. |
| **The idle nudge**: after 20 s standing still, the nearest NPC pings you and hops onto a toy; never again within 60 s. | §2.7 | P1: a gentle "here is something to do". | Keep; point at the next quest step as well as a toy. |
| **The toy contract**: Ready 2 s with a rule of 10 words or fewer, Play, Bell 0.3 s, Tally 2.5 s; every toy reads with the sound off. | §6.0 | P1 and P4: every minigame teaches itself in one line. | Keep for all town games and world events. |
| **One camera take per big moment**; everything else is an overlay you walk through. | §4.8 | P1: you never lose your frog. | Keep for story milestones. |
| **Autosave glyph**: a small lantern flickers for 1.5 s; no line. | §4.3 | P1: quiet reassurance. | Keep. |
| **Ready pips**: standing in a doorway lights a pip in your Seat Hue above it; the door opens when every human is ready. | §4.4 | P6: "ready" without chat. | Keep for group activities (a group quest door, a boss gate). |
| **An "open to team up" signal**: standing on a pad for 1 s raises a glyph over your head for everyone. | §4.9 | P6: a looking-for-group signal with no menu or chat. | Keep the signal only. Drop the Knot it was built for. |
| **Warm gust**: stragglers are carried along over 1.5 s, no damage. | §2.5; §4.4 | P6: nobody is left behind at a group start. | Keep for group travel starts, not as a timer. |

### Drop-in co-op (P6)

| Idea | Where | Why it fits | v2 note |
|---|---|---|---|
| **A friend arrives as an egg** falling down the light pillar (2.0 s streak, rising whistle, a plop), then hatches; the whole town hears it. | §2.4 | P6: drop-in with a story reason. P2: arrivals use the world's life cycle. | Keep as the v2 join moment. |
| **Invite in 2 inputs**: Esc → Invite opens the Steam overlay; Esc → LAN lists hosts. | §2.4 | P5: within the 2-input rule. | Keep. |
| **Joining restarts the NetworkManager behind a 0.6 s fade.** | §2.4 | Tech for P6. | Keep. |
| **Waiting is play**: toys and gnats in the lobby, so waiting for friends is not dead time. | §2.7 | P6: towns have things to do together. | Keep. |
| **The rescue rope**: a waiting frog holds a rope; a stuck friend grabs the end and is reeled through (1.2 s). Nobody is forced; a bell rings every 1.0 s so the rope is easy to find. | §5.4 | P6 and P4: no friend stays stuck. | Reuse as a "help a stuck friend" tool in hard places. Drop the fork structure around it. |
| **The helping hatch**: pass one item (a heal bug, a jar) to a group in another room. | §5.3 | P6: help across a split group. | Candidate for split-group dungeons. |
| **Reunion banner**: `Vex, from 12E, carrying the key.` plus one reunion line. | §5.2 | P6: two groups meeting again feels like a moment. | Keep the pattern, with v2 place names. |
| **NPC fairness in shared play**: an NPC never takes a target a human is going for; no NPC mischief within 2 s of a human's deciding moment; NPCs hold off the golden fly while a human is within 6 m. | §6.0 Rivals; §6.2 | P6: NPCs help without stealing the moment. | Keep for all companion NPCs. |

### Toys as town games

| Idea | Where | Why it fits | v2 note |
|---|---|---|---|
| **Frog Stack**: stack up to 4 frogs to light six lanterns at 1.15 / 1.70 / 2.25 m; a sky beacon at 5.15 m needs an Air Hop from the top. Win by lighting 4 of 7. | §6.1 | P6: pure co-op, learnable in one look. P2: lanterns and "reaching for the sky" fit the well story. | Keep as the signature town game. |
| **Fly Catch**: lunch. Flies scatter from a frog within 1.2 m and drift toward a frog standing still; fat flies need two tongues; one golden fly. | §6.2 | P2: frogs catching flies is the most honest game in this world. P6: team score. | Keep as a town game or a world event. |
| **Jar Tag**: tag where "it" wears a jar; hold Croak to hum low (light dims, you slow down). | §6.3 | P4: tag needs no teaching. P2: rehearses a jar threat if v2 keeps one. | Keep as an opt-in town game, without Vengeance. |
| **Lily-Pad Sumo**: shrinking pads, last frog dry wins; out frogs ripple-croak pads from the water, so nobody sits out. | §6.4 | P6: out players keep playing. | Keep as an opt-in friendly contest in a pond town. |
| **Hub free play**: toys with no reward, only the laugh. | §2.7; §6.0 | Fair and relaxed. | Keep. |
| **KPI**: at least 50% of humans touch a town toy; if not, move it closer to the arrival point. | §6.0 telemetry | P1: a measured placement rule. | Keep. |

### Art

| Idea | Where | Why it fits | v2 note |
|---|---|---|---|
| **Well Bottom palette**: water `#07090D`, mist `#1A2230`, stone `#4A4540`, moss `#557D33`, lanterns `#FFB86B`, light pillar `#FFF4E0` at 5.5%, UI panels `#0E0B10` at 88%, text `#F4EDE3`, gold `#FFD76A`. | §2.2 | P2: one look for the home region. | Keep as a starting palette (`09` owns final values). |
| **The egg**: translucent jelly, 0.45 m, bobbing ±0.03 m at 0.4 Hz in a stone cup of water, Seat Hue glowing inside. | §2.4 | P3: a readable, specific design. | Keep. |
| **The hatch in four beats**: wobble 0.8 s, crack 0.8 s, tadpole flip 0.6 s, pop 0.6 s. | §2.4 | P3 and P2: growth as a life cycle. | Keep. |
| **Jar looks**: Bronze `#C8803A` 0.30 m cork lid; Silver `#C9D3DC` 0.40 m tin lid; Gold `#FFD84A` 0.45 m star lid with a slow sparkle. | §4.5 | P1: shape plus colour. | Keep. |
| **Fly looks**: ordinary `#1B1E24` with a teal glint `#3FD0C9`; fat `#2A2F3A`/`#7CF0E6`; golden `#FFD84A` with a trail and a high whine. | §6.2 | P1: flies read differently from fireflies. | Keep. |
| **Cozy interior template**: a round chamber, r 11 m, domed 7 m, warm moss floor, a centre lantern with a gnat cloud. | §5.1 | P2: fits the stone-well world. | Reuse for inns, guild rooms or shelters. |
| **Rim look**: mossy grass `#6FA34A` on the lip, a cloud sea with tops at y 150, lantern poles leaning over the Mouth. | §8.1 | P2: the act-one reveal as a place. | Keep. |
| **Paper medal**: a cosmetic prop on the chest for the top frog of a game. | §7 | P3: a small, homemade-feeling reward. | Keep for town game winners. |

### Audio

| Idea | Where | Why it fits | v2 note |
|---|---|---|---|
| **Title bed**: kalimba drips (pentatonic, F), water lapping, one low croak echoing up the shaft. | §2.9 | P3 and P2: small, warm, specific. | Keep as the home-town theme. |
| **Rising pentatonic notes** for each pad landing, each gulp, each jar pop, each chain link snapping. | §2.5; §3.1; §4.5 | P1: you hear progress rise. | Keep as the one reward-sound grammar. |
| **The croak echoes in the well and goes silent at the Rim** (reverb send 0). Optional: the first croak on the Rim gets thunder back 6.0 s later. | §8.2 | P2: sound tells the story of leaving the well. | Keep. |
| **Audio wayfinding**: the rescue rope rings a bell every 1.0 s. | §5.4 | P1: find the thing by ear. | Keep the pattern for quest objects. |
| **Muffled croak** under a jar: −4 semitones, low-passed. | §6.3 | P1 and P3: a readable state by ear. | Keep if Jar Tag stays. |

### Tech and build

| Idea | Where | Why it fits | v2 note |
|---|---|---|---|
| **One abstract `ToyRound` NetworkBehaviour** (Ready → Play → Bell → Tally) with one `NetworkVariable<ToyRoundState>`; the host is authoritative; tongue and shove hits are lag-compensated. | §6.0; §9.1 | NGO 2.13.3 host mode, still valid. P5: every minigame shares one flow. | Keep. |
| **Cheap stack netcode**: replicate tilt, wobble speed and the perch list at 20 Hz; perched poses are derived on each client. | §6.1; §9.3 | Tech for 8 players. | Keep. |
| **FlySwarm budget**: int16 × 3 at 10 Hz, sent only to that room's clients, about 7 KB/s. | §9.3 | Tech. | Keep; use interest areas in the open world. |
| **Mirror render texture** 512², updated only within 6 m; a secondary window camera at 320 × 180, 15 fps, only for clients inside. | §2.6; §5.1 | Perf discipline. | Keep. |
| **Hide the cell switch with a ride** (the stair ride, a door walk); no loading screens. | §1.1 rule 10; §4.3 | P6: the world feels continuous. | Keep the trick for v2 world streaming. |
| **Data in JSON**: `hub/hub_layout.json`, `landing/landing.json`, `toys/toy_rules.json`, string keys `hub.*`, `landing.*`, `toy.*`. | §9.2 | Built by agents: numbers live in data. | Keep the pattern; rename to town and activity files. |
| **Tests that guard the pillars**: `HubUnlockTruthTests` (the System never lies), `NoPaidPromptInClimbTest`, `ToysNeverCostTests`, `ToyRoundSoak` (50 seeds), `FrogStackReachTests`, `FlyCatchTuningTests`; an agent screenshot test for the title composition. | §2.9; §9.4 | Built by agents: tests catch drift. | Keep; add a P1 test ("a next step is always shown"). |
| **Telemetry**: `toy_round {toyId, context, humans, rivals, result, winners, durationSec}`; `landing_duration`. | §1.2; §6.0 | Measures fun and pacing. | Keep; rename for towns. |
| **Steam stat read** via Facepunch `Friend.RequestUserStatsAsync()`, with a LAN or offline fallback and Spacewar 480 caveats. | §2.6; §9.1 `BestDoorService` | Steam plumbing, still valid. | Keep. |

---

## Party-only (to archive)

These only make sense in the v1 party climber. They leave the main game. Landing Party (the toy playlist mode) is the best candidate for the single documented opt-in town side mode; nothing is built for it now.

### Betrayal, tethers, grudges and social deduction

| Item | Where |
|---|---|
| **Lobby settings** for human betrayal, blame tags, Rank Sync and Masked Rivals (Masked Rivals hides who is a bot). | §2.4 |
| **Blame tags** such as `Dunked by Pip`. | §3.2 |
| **The Knot spot and Knots** (the pact thread between two frogs), Cut and Duos unlocking at Landing 3, Moss's `[ KNOT ] Moss asks: Knot?`, the Wheel's **Knot?** option, the rope flourish. | §4.2; §4.9; §4.10 |
| **Vengeance**: the staged "Moss tags Vex" at the Meeting door; tongue-tagging the traitor during Jar Tag at door 12. | §5.2; §6.3 |
| **Gutter's grudge**: glares only at a human the Register holds a grudge against ("You. Again."). **Register callbacks** like "Last time you left me on the bridge." | §2.8 |
| **Vex's sabotage**: a 15% chance per round to shove a stack with a human on top, in Friends or Private lobbies. Vex's lobby post "leaning on Hell's chains" ("Worth it."). | §2.8; §6.1 |
| **The Sumo rematch**: Moss and Vex on one pad after door 11's betrayal and door 12's Vengeance. | §6.4 |
| **Tagline** *Climb together. Fall alone.* and the rope-knot K logo. | §2.9 |

### Pranks and mischief

| Item | Where |
|---|---|
| **Tongue on a player** as a prank: the Kestrel tug gag (the only frog-targeted prompt), humans tugging each other into the pond. | §3.1; §3.2 |
| **Shove as a wreck verb** in co-op toys ("wreck it (mischief)"), +30°/s wobble kicks, the spam throttle. | §6.0; §6.1 Controls |
| **The Drama Director** staging gags and counting "a funny bot failure every 5 doors". | §3.2; §6.0 |
| **The jar ring** worn after losing Jar Tag ("cosmetic framing, not shame"). | §6.3 |

### Structures that only make sense in the 20-door party climb

| Item | Where |
|---|---|
| **Always 8 seats**: Rivals fill every empty seat, a Rival hatches when you leave, Rookie leaf tags for your first 5 climbs. | §2.4; §6.0 |
| **The four difficulty doors** with Team Lives, skulls, firefly multipliers, chains and the start ring. | §2.5 |
| **The seal lever** (SEALED: rules hidden in rooms everyone has cleared). | §2.3; §2.5 |
| **Resume / Retry door** (`DOOR 11 · RESUME`, `DOOR 11 · RETRY`), the host-only save. | §2.5; §4.7 |
| **Per-climb reset**: back to a dim Lv1 froglet on every Climb again; the sink shot; Body and Build reset. | §2.6; §2.10 |
| **Landing exit caps**: soft and hard caps (40/60 s, Keeper 45/70 s), the 4 s walk-vote, the gust. | §4.4 |
| **The 12% outside-room time budget.** | §1.2 |
| **Forks and the meeting room as built**: group door vs E door, the key swap, the live window of the other fork, the 45 s rope tied to fork timers, "cleared with help" losing the hidden-clear bonus. | §5 |
| **Toy doors 6 and 16** as mandatory breathers inside the climb; seeded toy placement ("no toy at two stops in a row"). | §6.5 |
| **Run economy pieces**: Wish Coins that exist only inside a climb, Boon picks (1 of 3, 8 s), rerolls, Legendaries and Duos, the Gold Key, Rank D and Rank S talents, Party Rank Up, Tower Rank letters F → S, the results title "Sumo". | §2.3; §3.3; §4.5–4.8; §6.0 |
| **The Keeper Landing ceremony** as a 7-step payout script. | §4.8 |
| **The demo end**: `[ DEMO ] Doors 11–20 are in the full game.` and the Steam page button. | §4.8 |
| **Landing Party mode**: a toy playlist (~2:10 per round), party points (3 for a win, 1 for playing), standings, host toggles, the "party frog" at Glow Lv6 with every verb at rank III. | §7 |

---

## Conflicts with the new pillars

| Item | Pillar | Why it conflicts | v2 fix |
|---|---|---|---|
| **Difficulty chosen at the entrance** by four doors with lives, skulls and multipliers, before the player knows the game. | P4, P1 | A new player makes a hard choice with no context. Lives and multipliers belong to a run, not a world. | One world at one base difficulty. If needed, difficulty is a per-group setting in the Esc menu, explained in one line. |
| **"Rules redacted"** on Hell and the **SEALED** lever. | P1 | Hiding a creature's rule on purpose breaks "the player knows what to do and why". | Always show the plain rule. |
| **The "Hidden clear" notch** and the hidden-clear bonus. | P1 | A reward for a condition the game does not state. | Replace with a visible optional goal ("Get past without being seen"). |
| **Six secret classes** shown as dark `?` pads; classes chosen per climb. | P1, P5 | Hidden options and per-run picks work against a small, clear role list. | Keep 3 visible light roles on lit pads in the first town. Stand on a pad 1 s to pick; allow a change in any town. |
| **Per-climb reset to a dim Lv1 froglet** ("the underdog arc"). | P6, P2 | An open world with towns needs a persistent frog. Losing your level each session contradicts "a shared living world". | Persistent Glow level and ranks. Keep the fresh-hatch joy only for a brand-new character. |
| **Too many currencies and meters**: fireflies, Wish Coins, Pearls (Wish Coins convert to Pearls at about half on Rest), Rank Points, three jar grades, rerolls, Boons, Legendaries, Duos, the Gold Key, Party Rank, Tower Rank letters, Well-Rested, 10 classes. | P4, P5 | A new player cannot hold this list. Conversions are hidden maths. | Fireflies for growth plus one currency for the shop. Jars become a look for reward packages, not a separate system. |
| **The Keeper ceremony**: seven payouts in about 30 s (a pick, a Party Rank, a rank bar, a camera pull-back, the stall opening, a hat, rain, a teaser, buttons). | P1, P4 | Too many new things at once; a newcomer cannot tell which matters. | One milestone, one new thing, then a clear next step. |
| **Towns on a clock**: 40 s stops, soft and hard caps, walk-votes and a gust that carries you out. | P6, P5 | Towns in an MMO are places to stay, shop, dress up and meet people. A timer pushes players out. | No timers in towns. Group starts use ready pips only. |
| **"The Tower" in System lines** (`[ THE TOWER ] Onward.`, `The Tower will let you choose now.`) while the setting is a well. | P2 | Two names for one place; "the Tower" is left over from an older concept and has no source in the world. | One name for the place. Give the System voice an in-world source, or cut the naming. |
| **"Flies are not fireflies"**: flies are score, fireflies are XP, and both are gulped with the tongue. | P1, P2 | Two near-identical bugs with different meanings will confuse a new player. It is also odd that food gives nothing. | Give flies a clear world role (food that fills a meter or feeds a quest) and a clearly different look and sound. |
| **No-text curiosity hooks**: the veiled Mirror ("Tongue the veil and it flutters. No text."), the snoring stall, the coiled Knot rope. | P1 | A closed feature with no reason given reads as broken or confusing. | Keep the charm and add one plain line: what it is and when it opens. |
| **Local-only veiled Mirror**: a new friend sees a veil while a veteran sees it open in the same lobby. | P6, P1 | Two players in one town see different towns. | Shared towns look the same to everyone; lock the button, not the object. |
| **Map, Bestiary and records only as physical stations** you walk to and Tongue. | P5 | The map and the Bestiary must be reachable in 2 inputs or fewer from play. | Keep the stations as world art, and add menu paths (for example, one key for the map). |
| **Wardrobe only at a Mirror.** | P5 | Changing an owned outfit should not need a walk. | Buy at a Mirror; equip from the menu anywhere. |
| **Always 8 bot seats and Masked Rivals.** | P6 | Players cannot tell humans from bots, which blurs "other players visible". | Humans are the only party members. NPCs live in towns and quests, clearly marked as NPCs. |
| **The host's Rest ends the session for everyone**; only the host's save exists. | P6, P2 | In a world that should feel persistent, one person leaving ends it for all, and guests keep no world progress. | Each player keeps their own frog progress. A host leaving shows a clear warning and saves first. |
| **Mischief tugs and shoves inside co-op toys and in the first minute** (the Kestrel tug as the first laugh). | P6, P3 | In public 8-player lobbies, player-on-player tugs invite griefing. The first laugh depends on a prank. | Use the no-prank fallbacks the source already has: Kestrel falls on his own, or a pot stack topples. Keep the consent haul. |
| **Chorus-steadies and other toy rules not in the Ready line** (croak in sync within 0.3 s to steady a stack). | P1 | A rule the Ready line does not state will stay unknown. | One Ready line per toy, plus a one-line tip after a failed round. |
| **Lock naming in the meeting room**: "Lock E" sits on the group side and "Lock G" on the E side. | P1 | Names point the wrong way. | If a two-key door returns, name each lock after the key that fits it. |
| **Two vote timers** (10 s ring at the hub, 4 s walk-vote at Landings). | P5 | The same action has two rules in two places. | One group-start rule everywhere: ready pips, then open. |
| **Time outside the action treated as a cost** (the 12% cap, "a median over 40 s is a pacing bug"). | P6 | In v2, time in towns is part of the fun. | Measure town time as engagement, not as a bug. Keep the "never idle" spirit. |

---

## Key numbers and names

### Timing
- Title → in control: **≤ 0:05**. "Press any key" works from **0.3 s**. Camera whip **0.3 s**. Hatch **2.8 s** (wobble 0.8, crack 0.8, tadpole flip 0.6, pop 0.6).
- Follow camera: **4.5 m back, 2.2 m up, pitch 18°**.
- First Lv2 at **~0:20**; first laugh **≤ 0:30**; first door opens by **0:35** (test: within 40 s).
- Drop-in egg streak **2.0 s**; join fade **0.6 s**; a bot re-hatches in a left seat after **2 s**.
- Idle nudge after **20 s** still, not again within **60 s**. The System: **at most 2 lines per stop**. Something to play within **8 m** of any standing spot.
- Mouth glance: **+65°**, 0.6 s up, 0.6 s hold, 0.5 s down; cancelled by more than **2°** of look input.
- Autosave glyph **1.5 s**. Warm gust **1.5 s**.
- Toy contract: Ready **2.0 s** (rule ≤ **10 words**), Bell **0.3 s**, Tally **2.5 s**. A toy door runs ≤ **30 s** door to door.
- Rescue rope at **45 s**; haul **1.2 s**; bell every **1.0 s**.

### Places and sizes (metres)
- Well Bottom deck (the Foot): r **18**, y **0**; parapet r **19**; well wall **21 m** past the deck edge; axis **30 m** away; **10** parapet lanterns.
- The Mouth: **180 m** overhead, **31°** from the Well Bottom; **37°** at Landing 1 (y 30), **44°** at the Keeper Landing (y 60), **56°** at Landing 3 (y 90); the Warden arena at y 120.
- Eggs: ring r **6**; egg **0.45 m**; bob ±**0.03 m** at **0.4 Hz**; cup **1.1 m**.
- Statue **0.9 m** on a **0.6 m** plinth. Mirror frame **1.6 m**. Map slab **6 × 4 m**. Doors **3.2 × 4.5 m**. Interact prompt **2.5 m / 45°**.
- Hatch pond **22 × 14 m**, **7** pads r **1.0**, gaps ≤ **2.2 m**; swim **1.5 m/s**.
- Landing deck r **16**, parapet r **16.5** (0.8 m high), stair mouth r **2.5**, jar shelf r **3.0**, exit arc r **14**, **12** lanterns.
- Meeting room r **11**, domed **7 m**; hatch **0.8 × 0.8 m**; items ≤ **3 kg**.
- Rim: lip r **51–58** at y **180**, about **340 m** round; **12** lantern poles at r 47, y 182; terrace r **11**; cloud tops y **150**; puff back after **2.0 s** below y **165**; glide pillars **9 / 16 / 24 m** out, tops y **177 / 174 / 171**.
- Glide: gravity ×**0.55**, fall ≤ **3 m/s**.

### Frog and verb numbers used here
- Frog height H **0.60 m**; stack step **0.55 m**.
- Hop I **1.9 m**, charged Hop II **2.4 m**, tap-hop gap **2.6 m**; ledge.II **2.3 m**.
- Tongue I **3 m**, Tongue II **4.5 m** (grapple).
- Shove **6 m/s**; tongue tug on a frog ≤ **1.0 m**.

### Toys
- **Frog Stack** (`toy_frog_stack`): plinth r **2.2**, pole **6 m**, lanterns at **1.15 / 1.70 / 2.25 m**, sky beacon **5.15 m**; perch **0.30 m**; max **4** per stack; base speed ×**0.35**; topple past **25°**; K(n) = 0.6 + 0.45(n − 1); round **25 s**; win at **4 of 7** lights.
- **Fly Catch** (`toy_fly_catch`): **40 + 10n** flies; fat **⌈n/2⌉**; **1** golden at 12 s for 6 s; points **1 / 3 / 5**; scatter within **1.2 m** at **3.0 m/s**; lure after **2 s** still; hit radius **0.25 m**; croak stun **1.5 s**, cooldown **3 s**; play **24 s**; win at **50%** of the maximum (132 with 8 frogs).
- **Jar Tag** (`toy_jar_tag`): court r **6**; 4 pillars (r 0.5, 2.2 m tall) at r **3.5**; needs **3+** frogs; wearer ×**1.10**; tag bump **2 m/s**; daze **0.6 s**; no tag-back **2.0 s**; hum low: light −80%, speed **60%**, name hidden past **4 m**; round **20 s**.
- **Lily-Pad Sumo** (`toy_lily_sumo`): pond **18 m**; **5** pads r **2.0**, shrinking 10% every **5 s** to **66%**; capacity **3 / 2 / 1**; tip at **18°** for **1.5 s**; ripple **8°**, cooldown **3 s**; play ≤ **24 s**.
- Reward rule: Bronze jar for **≥ 10 s** of play at a town toy, at most one per stop.

### Rewards and shop
- Jars: Bronze `#C8803A` **0.30 m**; Silver `#C9D3DC` **0.40 m**; Gold `#FFD84A` **0.45 m**. Pops **0.4 s** apart; a lineup takes ≤ **4 s**.
- Mouth's rain: **4 / 8 / 12** coins per frog at the three Landings; +1 per mid-air catch, up to **+2**; falls over **6 s** into a **4 m** ring.
- First surfacing: **+50 Pearls**.
- Stall toad **1.2 m**; an NPC shopper takes ≤ **3 s** and steps aside for a human within **3 m**.

### Names worth keeping consistent
- **Places:** the Well Bottom (the Foot), `hatch_pond`, Landings (`landing_well`), the stair mouth, the jar shelf, the lily bed, the Rim (`rim_surface`), the lookout, the tear in the dome, the glide line, the Rim pool, the Mouth, the light pillar, the Mouth's rain.
- **Things:** the statue of the first frog (井底之蛙 / 우물 안 개구리), the Mirror, the stall and its toad, Bestiary stones, the chalk record wall, eggs and nests, the heal bug, tadpole ghosts, lantern gnats, the sky beacon, the paper medal, the Bell Cap (`08` #37), the Rim Stone (`08` #41), the Glider molt, Seat Hue.
- **Characters and their lines:** Moss ("Here.", "Nobody falls today.", "It was so small."), Brother Brass ("I can carry that.", "Go. I'll hold."), Kestrel ("Watch this!", "That was on purpose."), Pell ("Interesting."), Maud ("Oh, sweetie."), Pip ("I'll follow you!"), Lumen (silent), Ines ("Go!", "Personal best."). Vex and Gutter need new, non-grudge roles if they stay.
- **System lines to reuse in form:** `[ HATCHED ] Level 1. Everything is bigger than you.`, `[ GLOW 1 → 2 ]`, `[ TONGUE II ] 4.5 m. Grapple. Because: you gulped 30 fireflies.`, `[ THE SKY ] It put you back.`, `[ FROG STACK ] Stack up. Light the lanterns.`, `[ FLY CATCH ] Fat flies need two tongues.`, `[ JAR TAG ] Don't be wearing the jar at the bell.`
- **Code names:** `ToyRound`, `ToyRoundState`, `FrogStackToy`, `StackPendulum`, `FlyCatchToy`, `FlySwarm`, `JarTagToy`, `LilySumoToy`, `HubDirector`, `LandingController`, `JarLineup`, `MouthRain`, `StallService`, `RestBed`, `RimDirector`, `BestDoorService`, `ToyBotPlan`.

<!-- END -->
