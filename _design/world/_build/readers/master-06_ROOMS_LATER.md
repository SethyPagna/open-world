# Reader notes: master/06_ROOMS_LATER.md

**Reader:** master-06_ROOMS_LATER · **Date:** 2026-09-30 · **Source:** `_design/master/06_ROOMS_LATER.md` (v1.0, 2026-09-29, 1427 lines, read in full)
**Purpose:** sort the v1 "rooms after the slice" spec into what v2 (one open world, one story, 8-player co-op lobbies) can reuse, what goes to the party-game archive, and what fights the six pillars.
Section references like "§3.2" point into the source file.

---

## Summary for the archive

`06_ROOMS_LATER.md` (v1.0, 2026-09-29) is the KNOTWELL v1 spec for every room and mode planned after the vertical slice. In v1, up to 8 frogs climb numbered doors. Each door is a short room (45–90 s, capped at 150 s) with one monster that is never killed, one plain rule of 14 words or fewer, a self-lit warning 2–5 s before danger, an obvious clear and a hidden clear. The file fully specifies five SHOULD items: the Moth Library, Sunken Bucket, the Big Toad toy, six solo/duo E variants, and Sky Preview (five doors under Glide). It specifies three LATER rooms (Mirror Toll, Ash Axeman, Hollow Toad), pitches 12 more Well rooms, and designs three more 20-door layers: the Sky (Glide, doors 21–40), Space (Drift, 41–60) and the Beyond (Light-rails and Light-Lag, 61–80). Each layer has its own physics, a Keeper fought on a vessel, a three-phase Warden that ends in a co-op catch, and a story reveal. The last reveal shows that the giant on the rim is a frog. It also designs two modes: Mimic Climb (a hidden traitor with votes) and Daily Seed (a shared daily run with no streaks). Key decisions: monsters are never killed, frogs re-hatch at Lv1 in each layer, betrayal lives only in announced Heart doors, and nothing rewards attendance. Totals: 35 new rule doors and 37 Bestiary pages. The file records no build.

---

## Reusable for v2

The strongest pieces, in one line each:
1. **The story ladder** Well → Sky → Space → Beyond, ending in "the giant on the rim is a frog, like you". It is the frog-in-a-well proverb played out as a whole game.
2. **The encounter anatomy**: one plain rule, one self-lit tell 2–5 s ahead, an obvious clear, an optional hidden clear, and the monster is never killed.
3. **Monsters with one sense or appetite each** (blind but hears, swallows the brightest light, dives at the highest flier). This makes them readable and memorable.
4. **Shared co-op actions that need no chat**: the pentatonic Chorus, two-tongue carries, passing air bubbles, catching a falling friend.
5. **The honest System voice** and the "no streaks, no expiring rewards" ethics.

### World and lore

| Item | Where | Why it fits v2 |
|---|---|---|
| **The layer ladder as one story.** The Well, then the Sky ("the sky turned out to be a floor", a painted dome), then Space, then the Beyond. Each step shows the last world was small. The finale reveals that the nearest giant on the rim is a frog, like you, and the rim wall's moss is the Well's own moss `#557D33`. | §2.1, §6 intro, §7 intro, §8 intro, §8.6 `sp_moss_wall`, §8.7 Watcher phase 3 | **P2.** One theme from start to end. It is the Korean proverb 우물 안 개구리, "a frog in a well": someone who thinks the small world they see is all there is ([wordrow.kr dictionary entry](https://wordrow.kr/basicn/en/meaning/70763_%EC%9A%B0%EB%AC%BC%20%EC%95%88%20%EA%B0%9C%EA%B5%AC%EB%A6%AC%5B%EA%B3%A0%EA%B8%B0%5D/); [Korea Economic Institute post](https://www.facebook.com/KoreaEconInstitute/photos/this-weeks-korean-saying-is-%EC%9A%B0%EB%AC%BC-%EC%95%88-%EA%B0%9C%EA%B5%AC%EB%A6%AC-or-frog-in-a-well-it-means-someone-who-isnt/10154898320663531/)). In v2 the layers become connected regions of one map, and the reveals become main-story chapters. |
| **The leak of the next region** (WORLD Law 3). A tear in the painted dome at the zenith grows 1° / 3° / 8° / 20° / 40° as you progress. Space leaks a magenta nebula smear; the Beyond leaks moss-green glints. | §2.1 "Leak of the next layer" | **P1, P6.** A landmark visible from anywhere tells the player where the story goes next without a quest marker. It also makes the world feel bigger than the current zone. |
| **Recurring presences.** The Thunderhead Heron's shadow crosses the Well and the Sky before you meet it. The Watcher's eye leaks in as the glitch eye (17E) and a dead satellite before its true form. | §6.7 heron entry line, §7.4 `watcher_satellite`, §8.7 `warden_the_watcher` | **P2.** One antagonist-like presence ties regions together. In an open world, tie the sightings to places, not door numbers. The source itself changed a line because "door 3" could be false for some players. |
| **The Watcher's eye is the giant frog's eye**, looking down into its own well; its blink is the only blink in the game. | §8.7 phase 3; Open question 5 | **P2.** The ending loops back to the opening image. A strong final beat for one story. |
| **Monsters are never killed.** A clear cracks, calms, traps, tricks, stalls or sends the monster to sleep. Many then sulk. | §0 "Two more rules" | **P2, P3.** A clear world rule that holds everywhere, and a warm tone that suits a co-op frog game. Monsters can become recurring neighbours in an open world. |
| **Region formats.** Sky: a maze of cloud islands. Space: a dungeon of decks. Beyond: clusters of rooms strung on a glowing filament. | §2.1 "Room dressing" | **P6.** Each region gets its own layout grammar. Sky islands you glide between are the strongest open-world fit. (Space has a theme risk; see Conflicts.) |
| **Dread and breather rhythm.** Dread places are thunderhead interiors and night islands (ambient ≤ 0.1, tells in lightning white). Breathers are sunlit islands with warm lanterns. | §2.1 "Dread rooms", "Waltz"; §6 intro | **P6, P1.** Maps directly to wild zones versus towns and camps. Players read "safe" from light and colour. |
| **Places that grow from the well's logic.** A flooded cistern under the well "where everything the well ever swallowed" lies in the silt; the old well bucket on its chain; a stone toad idol left "by whoever built the Sky"; a windmill with a stone toad-face. | §3.2, §4.3, §6.1 `windmill_giant` | **P2.** Every place hints that frogs built or shaped the world, which pays off in the final reveal. Good seeds for landmarks and side-quest lore. |
| **Chan Chu, the Moon Toad.** 40 m, three-legged, jade `#3FBF8F` with gold warts `#FFC94A`, a Wish Coin 6 m wide with a square hole in its mouth. Entry line: "A frog, like you. It has been climbing much longer." It laughs at the end. | §7.7 `warden_chan_chu` | **P3, P2.** A sincere elder frog, not a villain. It draws on the real three-legged money toad with a coin in its mouth, a Chinese luck charm ([Wikipedia: Jin Chan](https://en.wikipedia.org/wiki/Jin_Chan)). In v2 it could be a mentor, a town elder or a friendly world boss. |
| **The Heron as a character.** 30 m tall, standing in the cloud-sea, with a bronze bell for a crest. It watches from the start, and at the end it bows its head. | §6.7 | **P3, P2.** A readable silhouette and a quiet, dignified arc. |

### Characters (monsters, bosses, companions)

Design pattern worth keeping: **each monster has one sense or one appetite, and the rule names it.** The Librarian is blind and hears. Old Whiskers swallows the brightest light. The Kite-Hawk dives at the highest flier. The Rat King chases the last frog it saw. The Glass Jellyfish goes for the slowest frog. The Hull Crawler follows footprints. This one trait makes behaviour predictable (P1) and gives each creature a personality (P3).

| Character | Where | Why it fits v2 |
|---|---|---|
| **The Librarian**: a blind moth hanging asleep over a silent reading hall. Its catalogue is tucked in its arms. A pounce wraps you in paper and you sneeze confetti. Lines: "Quiet, please." / "Returned on time." / "Your borrowing privileges have been revoked." | §3.1 `moth_library` | **P3, P1.** Specific, funny and kind. Hearing-based stealth with a clear loudness table. Fits a library building in a town or a well-side ruin. |
| **Old Whiskers**: a 7 m catfish with glowing barbels `#7FE8D8` that swallows anything shiny. Hauled up in the old bucket, it sulks and coughs the relics out. "The catfish kept the change." | §3.2 `sunken_bucket` | **P3, P2.** A well-native creature with a clear appetite and a gentle defeat. A natural world boss for a flooded cistern. |
| **The Mirror**: a quicksilver frog mannequin that becomes whoever touched it last, hat and hop included. Two at once split it into two bickering half-mirrors. | §4.1 `mirror_toll` | **P3.** Memorable and readable (the copied frog shimmers). Keep the copy mechanic; drop the seeded "second-to-last" rule. |
| **Sky creatures**: the Kite-Hawk (tangles in a kite string and sulks on a branch), the Miller (a stone toad-face that puffs its cheeks), the Fog Serpent (a 20 m eel of cloud that drizzles away as rain), the Thunder Carp, the Squall (a small, furious storm-cloud with a face that ends as a rainbow or a sulking drizzle). | §6.1–§6.3 | **P3, P6.** Distinct silhouettes and weather-based behaviour. Good wandering field creatures or world events for a Sky region. |
| **Well batch two creatures**: the Crayfish (claws as a skipping rope; snips its own antenna), the Leech Mother (sleeps after the salt stone), the Rat King (seven rats with knotted tails; chases its own reflection until dizzy), the Diving Beetle and water striders, the Cuckoo (sings itself to sleep), the hermit-crab hustler (the bell was in its own shell), the Lure Spider ("embarrassed"), the Fire Newt (chases warm light, sulks steaming), the Dragonfly Nymph (spits tadpoles back out unharmed). | §5.1–§5.3 | **P3, P2.** Real pond and cellar animals with one funny trait each. A ready roster of well-region wildlife and quest targets. |
| **Space and Beyond creatures**: the Orrery Toad (laughs so hard it lets you pass), the Glass Jellyfish (mistakes a clump of frogs for a bigger jellyfish), the Eraser (a moth made of pencil shavings), the Moth of Silence, the Hull Crawler. | §7.2–§7.3, §8.2–§8.3 | **P3.** Good gentle-defeat ideas, re-themed if Space changes. |
| **The Bell-Golem / Echo Golem**: the first monster of the game, met again later in new forms. Entry line: "Door 2 remembers you." In airless Space it cannot hear, but it feels your feet. | §7.1 `vacuum_bell`, §8.7 `keeper_echo_golem` | **P2, P3.** A returning character whose rule changes with the place, "never a reskin". In v2 it can be the player's first encounter and a recurring friend or foe. |
| **Named companion frogs (v1 bots)**: **Pell** says "Shh!" at every twitch. **Kestrel** shouts "Shortcut!", sneezes at the wrong time and claims a missed ring counted. **Moss** says "I'll be the light!" and always waits. **Brother Brass**: "I can carry that." / "I've got legs." **Lumen** never takes the risky role. | §3.1–§3.3, §4.1, §4.3, §6.5, §6.7 BotPlans | **P3, P4.** Short, specific voices. In v2 they can be townsfolk, quest-givers or solo companions who teach by doing the right thing on screen. (Vex, the one who betrays, goes to the archive.) |
| **The System voice**: dry, short bracket lines. `[ NOTED ] That was not the intended solution. Keep it.` / `[ CLEARED ] It walked. Nobody knows how.` / `[ FAILED ] It had too many opinions.` Rule: **the System never lies**, and a line ships only while it is true. | §0, §3.5 ("THE SKY IS STILL BEING PAINTED"), §6.7 | **P3, P1.** Sounds human, gives honest feedback, and makes players trust on-screen text. |

### Frog mechanics

| Item | Where | Why it fits v2 |
|---|---|---|
| **Three verbs: Hop, Tongue, Croak**, each growing through ranks I–IV (numbers in "Key numbers" below). | §0 verb table (from FO §4.1) | **P4.** Three buttons cover the whole game. Growth shows as longer reach and bigger pulses, which is easy to feel. |
| **Glide**: hold Hop in the air. Fall speed capped at 3.0 m/s for up to 1.5 s per hop, 6 m/s forward. Comes with the Glider molt (membranes on the arm sockets). | §2.1, §3.5 | **P6, P4.** One-input open-world traversal. Better in v2 as a permanent unlock than as a per-layer reset. |
| **Light-rails**: the Tongue latches onto a glowing filament and slides you along at 12 m/s, at any rank. | §2.1 (Beyond), §8 intro | **P6, P4, P5.** A natural fast-travel line between regions that uses a verb the player already knows. |
| **Tongue carries and two-tongue lifts**: Tongue I pulls props up to 20 kg, so a 30 kg object needs two frogs. | §0, §3.1 Heavy Tome | **P6.** Co-op that strangers understand at a glance, with no tether. |
| **Croak as a shared instrument**: croaks are pentatonic, so any four harmonise. A **Chorus** is 4 or more frogs croaking within 0.3 s. It herds swarms, sings a bridge into being, rings bells and opens hidden clears. | §3.3, §5.2 `cuckoo_call`, §5.3 `tadpole_herd`, §8.3 `choir_bridge` | **P6, P3.** A way for strangers in a town to do something together with no chat. It sounds good by design. |
| **Swimming with per-frog air**: 20 s of air shown as 4 bubble pips (5 s each) floating over your head, visible to everyone, and a throat sac that deflates. Surfacing refills in 1 s; a vent gives +10 s. Hold Croak to spit a bubble to a friend (you lose 5 s, they gain 5 s). | §3.2 | **P1, P6.** The state lives on the body, not in a menu, and helping a friend is one button. |
| **Swallowed, then croak to escape**: a big monster swallows you, the camera cuts inside a glowing belly, and a croak gets you spat out at once with no loss. | §3.2, §7.7 phase 2 | **P3, P4.** A funny failure with a simple, taught way out. |
| **Loudness table for stealth** (waddle 2 m up to a dropped book 8 m). | §3.1 | **P1.** Stealth rules in metres, easy to show with rings. |
| **Light value and hiding your glow**: a frog's light equals its Glow Level (1–10); an ash coat sets it to 0 for 10 s. Some monsters hunt the brightest light. The design rule: **growth becomes a role, not a penalty**, and growth never makes you the bait while a brighter lure exists. | §3.2, §4.2 | **Fair progress, P1.** Protects the "addictive but fair" feeling. Levelling never punishes you. |
| **One body, many drivers**: the Big Toad costume (6 m, felt, the whole party inside) where movement is the mean of every stick, a hop needs half the frogs within 0.4 s, and each player's stick shows as an arrow in their colour on the belly. | §3.3 `toy_bigtoad`; §4.3 `hollow_toad` | **P6.** A town-festival activity for up to 8 players, readable with no voice chat. |
| **Frog stacking**: frogs stand on heads to build a wobbling tower; a tongue-lock makes it rigid so it can topple into a bridge. | §6.6 `sp_babel_tower`; §7.7 `toy_zero_g_stack` | **P6.** A physical co-op toy that is funny to watch and easy to understand. |
| **Kite Race**: a 30 s downhill glide through 10 cloud rings; jars at 4 / 7 / 10 rings. | §6.7 `toy_kite_race` | **P6, P4.** A short, repeatable open-world activity that also teaches Glide. |
| **Catch a falling friend**: a frog tumbles for 3 s and any frog who tongues it in time slings it back. The System names who is falling 2 s ahead. | §2.4, §6.7 phase 3, §7.7 phase 3 | **P6.** A pure co-op moment. Keep the catch; drop the tether chains (see Party-only). |
| **Soft falls**: a fall costs little, and the updraft (Sky), safety line (Space) or filament (Beyond) returns you in 2–3 s. Toys never cost anything. | §2.1 "Falls", §3.3 "Fairness" | **P4.** Failing is cheap, so new players keep trying. |
| **Frog-native proof**: swallow an item, hold it 3 s, and your glowing belly backlights it so everyone can see what it is. | §7.5 | **P3, P1.** A charming, frog-only way to inspect or show items. Reusable outside the banquet room it came from. |
| **Molts as add-on parts on fixed sockets**: glider membranes on the arms, a fishbowl helmet whose hat floats inside ("so every hat still fits"), a star-freckle coat that trails light 1.5 s. | §2.1 "Molt" | **Cosmetic shop, P5.** A clean rule: new body parts never break existing skins or hats. |

### Encounter design rules

| Item | Where | Why it fits v2 |
|---|---|---|
| **The anatomy**: one never-killed monster; one self-lit cue 2–5 s before danger; one plain rule of 14 words or fewer; an obvious clear and a hidden clear; mites that pop into fireflies; 45–90 s soft length. | §0 | **P1, P4.** Works for open-world encounters, world bosses and quest fights. Every rule in the file was word-counted. |
| **Tells stay self-lit** even when the room goes dark. | §3.1 "The listen", §2.1 | **P1.** Danger is always readable. |
| **One Bestiary page per creature**, with a death tip and a one-line hint at the hidden clear. A returning monster keeps its original page and adds stamps. | §2.2 rule 8; every room entry | **P1, P5.** One place to learn, no duplicate entries. Example tip: "It is blind. It hears hops, croaks, shoves and dropped books. Waddling is silent." |
| **Hidden-clear reward line**: `[ NOTED ] That was not the intended solution. Keep it.` | §0 | **P3.** Rewards curiosity with warmth. Hidden clears stay optional. |
| **Keepers combine two monsters the region already taught**, are fought aboard the region's vessel (raft, leaf, pod, comet), last about 90 s and have no hidden clear. | §2.3 | **P1, P2.** A mid-region test built only from lessons everyone learned. A recurring "vessel" motif ties regions together. |
| **Warden shape**: a power lap where old monsters are flattened at their old numbers (~50 s), a big set piece (~70 s), and a co-op catch finale (~60 s). | §2.4, §6.7, §7.7, §8.7 | **P6, fair progress.** The power lap lets players feel how much they have grown. The finale is about saving each other. |
| **Authored first visit**: the first five doors of each new layer are fixed, so the new verb is taught in a set order. | §2.2 rule 7, §3.5 | **P4.** In v2: each region's entry path is hand-built to teach its one new move. |
| **Nothing starts by itself**: you walk into a door to begin. | §3.5 "Entry" (FO §8.4) | **P1, P5.** Player choice starts every activity; nothing ambushes a new player. |
| **Debut rule**: new monsters are placed early so returning players meet them. | §2.2 rule 5, §5 "How it ships" | **P1.** In v2: new content appears near hubs and main roads, not in far corners. |

### Art

| Item | Where | Why it fits v2 |
|---|---|---|
| **Region palettes** (full list in "Key numbers"). Sky pastel outside, storm-grey inside; Space violet with neon tells; Beyond nebula pink with moss-green glints. | §2.1, §3.5 | **P2, P6.** Each region reads at a glance; one colour tells you where you are. |
| **One stated tell colour per monster** (for example antennae `#FFE9A8`, cleave outline `#FF7A2F`, crayfish claws `#FF9E5E`). | throughout §3–§8 | **P1.** Readable danger language. |
| **Readable item tells**: quiet books have cream page edges `#EFE3CF`; loud books have lilac edges `#C9B7E8` and a cracked seal. A filled stand glows gold `#FFC94A`. | §3.1 | **P1.** You can tell safe from unsafe by looking. |
| **The Well's moss** `#557D33`, baked the same on the rim wall at the end. | §8.6 | **P2.** A visual rhyme that carries the story. |
| **Big silhouettes**: the 30 m heron with a bell crest, the 40 m three-legged jade toad, the 12 m hollow stone toad idol with window eyes. | §6.7, §7.7, §4.3 | **P3, P6.** Landmark-scale characters for an open world skyline. |

### Audio

| Item | Where | Why it fits v2 |
|---|---|---|
| **Region music keys**: Sky in C with breathy flute; Space in G with glass bells; Beyond in D with a choir pad (WORLD §9.3). | §2.1 "Music key" | **P2.** Each region has its own voice inside one score. |
| **Pentatonic croak** with a colour per note: C `#FF6B6B`, D `#FFA94D`, E `#FFD166`, G `#6BE38F`, A `#6BB8FF`. | §5.2 `cuckoo_call` | **P6, P3.** Group croaks always sound good; colours make notes visible. |
| **Sound as the honest cue**: rising paper-rustle, a rising whistle before a dive, a glass hum, a hum rising a fifth before the golem's glow. | §3.1, §6.1, §4.1, §8.7 | **P1.** Audio warnings that match the visual tell. |
| **Captioned direction arrows** for important sounds such as footfalls (09's readability channel). | §8.2 `afterimage` | **P1, P4.** Accessibility for deaf and hard-of-hearing players. |
| **The wind organ plays the region's motif** when the hidden clear lands. | §6.3 `wind_organ` | **P3.** Music as reward. |

### Tech (Unity 6 URP, NGO host mode)

| Item | Where | Why it fits v2 |
|---|---|---|
| **`PhysicsProfile` asset** (gravity scale, air damping, Glide, gusts). | §10.1 | Lets regions or zones change movement feel from data. Keep changes small (see Conflicts). |
| **`SummedInputController`**: the host sums every seat's input each tick and drives one NetworkObject. | §3.3, §10.1 | Fits NGO host authority. Powers any shared vehicle or festival toy. |
| **`Listener`** (listen cycle, loudness threshold, pounce) and the **NoiseBus**. | §3.1, §10.1 | Reusable stealth AI for any hearing creature. |
| **`SwimController` + `WaterVolume` + per-frog air + bubble projectile**; the **swallow state** (frog parented inside the monster, hidden, camera cut, croak to escape). | §3.2, §10.1 | Water regions and big-creature gags, built once. |
| **`ReflectionTemplate`**: a frog body copied through `IHeroBody`, copying cosmetics and verb ranks, never Boons or the player colour. | §4.1, §10.1 | Mirror or mimic creatures that show your own skin, which also shows off shop cosmetics. |
| **APV lighting-scenario blend** between two baked scenarios over 0.5 s, with no realtime lights. | §4.2, §10.1 | Cheap day/night or lights-on/off changes in URP. |
| **`GravityVolume`**, **footprint decals** (glow, fade, follow), **`IHeroBody` sockets** for molt parts. | §10.1, §2.1 | General-purpose pieces; the sockets are the cosmetics backbone. |
| **Data-driven content with validators**: JSON RoomDef, a generator that bakes shells, a **reachability validator** that re-solves every route under the physics profile, a growth CI test, a 7-bot soak, and `minClearSec` (0.8 × the fastest bot clear). | §2.2 rule 3, §3.5, §9.2, §10.2 | Suits a game built mostly by agents: numbers are checked by tools, not by hand. The validator can check open-world traversal gates. |

### Progression, economy and ethics

| Item | Where | Why it fits v2 |
|---|---|---|
| **Glow Level 1–10 shown on the frog's own body**, and a fast first reward: a 30-firefly cloud gives `[ GLOW 1 → 2 ]` within the first 20 s. | §2.2 rule 1, §3.5 | **P4, fair progress.** Growth you can see; a reward before minute one. |
| **Fireflies as the main pickup**: small mites pop into fireflies everywhere. | §0 anatomy | **P1.** One clear "stuff you collect". |
| **Jars Bronze / Silver / Gold** for activities. | §3.3, §6.7, §7.7 | **P1.** A simple, familiar result tier. |
| **Bestiary stamps and Bestiary hats** (7 hats budgeted for 28 Well pages). | §2.2 rule 8, Open question 11 | **P5, cosmetics.** Collection rewards that feed the look of your frog, earned by play. |
| **"Coin" means only Wish Coins.** | §7.7 | **P5.** Naming discipline: one word, one currency. |
| **The power lap and old times**: revisiting an old monster at its old numbers, with `OLD TIME 1:12` shown. | §2.2 rule 4, §2.4 | **Fair progress.** Returning to early areas as a stronger frog feels good. |
| **Engagement ethics**: no streaks, no daily bonus, no expiring reward, no countdown on screen. "Well-Rested" rewards breaks, not attendance. No stat counts steals or betrayals. | §9.2 "What it never does", §9.1 "Winning" | **Addictive but fair.** Keep this list as a v2 rule for the shop and any daily content. |
| **Free named updates**, and the honest line that ships only while true. | §3.5, §10.4 | **P3.** Trust between the studio and players. |

### UI and clarity

| Item | Where | Why it fits v2 |
|---|---|---|
| **The bracket line format**: `[ TAG ] short text`, for example `[ MOLT ] Glider. Hold Hop in the air.` | §3.5, throughout | **P1, P5.** One consistent, short voice for tutorials and events. |
| **Name calls 2 s ahead**: `[ CATCH ] Pip.` | §6.7 phase 3 | **P1, P6.** Tells the whole group who needs help, before it is needed. |
| **State on the body**: air pips over the head, the shimmer on the copied frog, the darkening shade, the helmet that fogs as air runs low. | §3.2, §4.1, §7.3 | **P1, P5.** Less HUD, more readable world. |
| **A colour per player** (v1 "Seat Hue") used for arrows, aim dots and pings. | §3.3, §4.1 | **P6.** Players tell each other apart instantly. Reframe from "blame" to "who is doing what". |
| **Pings visible to everyone**, and an honest map of where you have been. | §4.3, §8.2 | **P1, P6.** Low-effort communication with strangers. |

---

## Party-only (to archive)

| Item | Where | Note for the archive |
|---|---|---|
| **Heart doors (♥)** as a category: rooms where betrayal is announced and legal. The four Well Heart doors (`heart_two_pads`, `heart_split_swallow`, `heart_tied_bridge`, `doppelfrog`) re-dressed in every layer. | §0 plaque letters, §6.8, §7.8, §8.8 | The core v1 betrayal container. |
| **`heart_last_updraft`**: a marshmallow test with shoving. The first updraft takes three frogs and the jar; waiting gives everyone ×1.5. | §6.5 | Betrayal choice room. |
| **`heart_moon_banquet`**: one poisoned cup, one lying diner, a secret **Taster** who knows the poisoner, a vote at the Verdict Candle, and the Taster wins the jar on a wrong vote. | §7.5 | Social deduction plus a secret role. The belly-backlight proof is reusable (see above). |
| **`heart_guilt_scale`**: shades that weigh your unbanked fireflies; tongue-tag a friend to pass your shade to them. | §8.5 | Betrayal channel. The "walk in your own footprints" co-op answer is a nice idea but depends on the betrayal setup. |
| **Mimic Climb mode**: a single hidden Mimic for a whole climb in 4–8 human private lobbies; powers Steal (20% of unbanked fireflies, 25 s cooldown) and Rile (fires a monster's next cue now); votes on the Wheel with Skip; `[ SECRET ROLE: MIMIC ] Steal their light. Don't get voted out.`; `[ MIMIC FOUND ]` / `[ NOT THE MIMIC ]`; results callouts `Unseen Mimic` / `Mimic Hunters`. | §9.1 | The full "mafia, Among Us" wish. **If v2 keeps a town side-mode hook, this section is the template**: host switch in the lobby, opt in by walking through a marked door, powers off in safe areas, bots never the traitor and never voting, no stat counts betrayals. Build nothing now. |
| **Betrayal Cam, `[ TRAITOR ]`, the WANTED poster, the victim's Vengeance quest.** | §6.5, §7.5, §8.5, §9.1 | v1 betrayal feedback loop. |
| **Tongue yank legal inside Heart doors** after a 0.6 s crimson tell; "whoever catches spilled fireflies keeps them". | §6.5, §8.5 | Theft rules. |
| **Tethers and chains**: `sp_tongue_tether`, `heart_tied_bridge`, `sp_spacewalk` (the party clipped to one line in 4 m segments), `sp_light_rope` (tongue-tied pairs), Kite Knot, Knotted frogs and Cut, the Beyond Warden's "all eight linked into one tongue chain", `comet_rodeo`'s eight-frog chain clear. | §1.2, §2.1 "New social rule", §7.6, §8.6, §8.1, §8.7 | TEAMBOUND "Chained ascent" homages. The brief removes tethers. Keep only the free-form "catch a falling friend". |
| **Push-off and shove as a social weapon**; the Mirror "re-touch overwrites a friend's setup" as mischief. | §2.1, §4.1 | Prank layer. A plain two-frog push on a heavy door can stay as co-op. |
| **Blame tags**: "Tripped: Pip", "the blame tag says whose spit it was", "Visible blame". | §3.3, §5.1, §5.3 | Party framing. In v2 the player colour stays, the blame framing goes. |
| **Vex** (the bot that boards first when allowed) and the **Drama Director's** failure and betrayal targets. | §3.1, §6.5 | Party pacing system. |
| **Ash Axeman "Karma Turned"** (caps what one saboteur can do). | §4.2 step 4 | Anti-saboteur rule; not needed without saboteurs. |
| **The tagline "Climb together. Fall alone."** | §2.4 | v1 party tagline. |
| **Suspicion A/B test and secret quests in Heart doors** (FO §9.3). | §9.1 "Before it ships", Open question 10 | Party-only research. |
| **`toy_lag_tag`** (Jar Tag under Light-Lag). | §8.7 | A party chase toy that also depends on Light-Lag. |
| **Rival "Saw that." pings** at public tells. | §9.1 | Only meaningful with a hidden traitor. |

---

## Conflicts with the new pillars

| Item | Where | Pillar | Why |
|---|---|---|---|
| **Numbered door climb**: 80 doors in four layers, forks at 7 / 12 / 17, plaques A/B/C/E/♥, skulls, seeded pools, pool rules, runs that end. | §0, §2.1, §2.2, §3.4 | **P6, P2** | The world is a list of separate rooms, not one connected place. v2 needs regions you walk between. |
| **Re-dressed rooms**: the same monster and rule in every layer (the Well golem on a cloud island "rule unchanged", the Moth Library as star charts, `lily_raft` as a raft of light). | §3.5, §6.8, §7.8, §8.8 | **P2, P5** | Breaks world logic (why is a well golem in the clouds with the same rule?) and duplicates content. Returning monsters whose rule changes with the place (`vacuum_bell`) are fine. |
| **Re-hatch at Lv1 in every layer**: verbs back to rank I, Boons cleared, talents kept. | §2.2 rule 1, §3.5 "The molt" | **P1, P4, fair progress** | Losing your power at each new region is confusing and feels unfair in a persistent world. Keep the molt as an added part, not a reset. |
| **Per-layer gravity and rescaled thresholds** (×0.55, ×0.25; rank-II ledges at 2.3 / 4.2 / 9.2 m). Drift has no air deceleration, "so every hop is a commitment". | §2.1, §2.2 rule 3, §7 intro | **P4** | Players relearn movement in every region. Keep Glide as an added unlock; keep big gravity changes local, rare and signposted. |
| **Light-Lag**: anything over 15 m away is drawn up to 1.5 s in the past. | §2.1, §8, §10.1, Open question 2 | **P1, P6** | You can't trust what you see, and other players would appear in the past, which hurts the "shared living world" feel. Extra tech (history buffer) and still unsigned by 01 and 10. |
| **Seeded rule changes**: the Mirror or Rat King sometimes target the second-to-last frog; lamps sometimes need a painted order. | §4.1 Twist B, §5.1 `rat_king`, §8.3 | **P1** | The rule text no longer says what the monster does. The source adds small tells, but it is still a hidden rule. |
| **Obscure hidden clears**: croak the phrase backwards; walk the host's last Well climb; three croaked holes in one line within 1 s; pass an orb 10 times without touching anything. | §5.2, §8.2, §6.2, §7.3 | **P1, P4** | Fine only as optional extras with a clear hint. Never gate progress on them. |
| **Split information in the Hollow Toad**: only the Eyes station sees outside; everyone else sees a 30% eye-slit feed. | §4.3 | **P1, P4** | Most players can't see what is happening. Keep the 8-seat vehicle; give everyone a full view. |
| **Maths-heavy puzzles**: staggered snuffs by distance ÷ 20 m/s (`slow_light_knight`), moon periods of 6 / 9 / 18 s (`orbit_clock`), recalling the last 6 doors in order (`retrace_map`). | §8.3, §7.2, §8.2 | **P4** | High learning curve; needs a bot caller or a manual. |
| **Time and gravity tricks**: room time follows your speed (`still_clock`), gravity follows a lantern (`upside_well`), one input drives two bodies (`twin_well`), a solid reflection 1.5 s behind you (`paradox_mirror`). | §5.4, §8.4 | **P4, P6** | Hard to read, and time or gravity changes can't be shared with other players in an open world without private instances. |
| **Too many systems and nouns**: Glow, fireflies (banked and unbanked), Pearls, RP, Wish Coins, spots, Team Lives, skulls, jars, Boons, talents, ranks, Awakening, Mastery, Rank Sync, classes, molts, Landings, Keepers, Wardens, Rematch, E variants, suits. | whole file (per DEC §10 glossary) | **P4, P5** | More terms than a new player can hold. v2 needs a much smaller glossary. |
| **The Awakening verb "follows usage"**: which verb reaches rank III depends on how you played. | §0 | **P1** | A hidden rule deciding your power. Let the player choose, or show it clearly. |
| **Duplicate abilities**: the Tree Frog class's Glide Leap copies the Sky's default Glide. | Open question 4 | **P5** | Two things that do the same job. |
| **Six rank lanes per room** (Hop, Tongue and Croak, each at rank II and at rank III/IV). | §0, every room | **P5** | Heavy to author and cluttered in small rooms. In an open world, place rank gates at region level instead. |
| **Run failure and hard caps**: 150 s caps, 50% pay on failure, Team Lives lost. | §3.1 "Failure", §4.3, FO §3.7 | **P4, P6** | Run pressure fits a party climber, not a persistent world. A failed encounter should simply reset. |
| **Space station, satellites, neon, fishbowl helmets; the Beyond's "galaxy is a drop of water on a filament".** | §7 intro, §8 intro | **P2** | Technology and a cosmic scale jump the frog-and-well world never sets up (who built the station?). Keep only if the v2 story explains it; otherwise re-theme to natural places. |
| **Judgment tone**: "It carries out sentences", "Absolution", "Karma", "Weight of Guilt", shades as regret. | §4.2, §8.5 | **P2, P3** | Heavy moral framing clashes with the warm frog tone. The light-hiding mechanic is fine; the framing needs a rewrite. |
| **Daily Seed**: a daily seeded climb scored `door × 100000 + max(0, 99999 − seconds)`, validated by a plausibility check with no server. | §9.2, Open question 7 | **P6** | There is no climb in an open world, and the no-server check can't stop cheating. Keep only the ethics list. |
| **Scripted bot failures that cost the team** (Kestrel forgets to breathe on 15% of dives and loses a spot). | §3.2, §3.1 | **P3, fair progress** | Comedy that makes a real player pay can feel fake or unfair. Keep bot jokes that cost nothing. |
| **Authority chain and scattered ownership**: DEC, FO, WORLD, CRIT, GDD and files 01–10 each own a slice; 11 open questions wait on other files. | header, §11 | **P5** (docs) | A lesson for v2's design docs: one owner per topic, and fewer cross-references. |

---

## Key numbers and names

### Frog verbs (FO §4.1, quoted in §0)

| Verb | I | II | III (Awakening) | IV (Mastery) |
|---|---|---|---|---|
| Hop | apex 1.4 m; charged 1.9 m | charged 2.4 m | Air Hop | charged 3.0 m; stomp pops mites within 3 m |
| Tongue | 3 m; pulls ≤ 20 kg | 4.5 m grapple | Long Tongue 6 m, 2 grabs, snatch and spit | 8 m chain-grapple |
| Croak | 4 m pulse | 6 m; 1 s stagger on small monsters | Twin Toll: 2 bells at once | Thunder Croak 9 m; 2 s stagger, never a kill |

- **Rank-II ledge:** 2.3 m (Well), 4.2 m (Sky, ×1.82), 9.2 m (Space, ×4.0).
- **Chorus:** 4 or more frogs croaking within 0.3 s. Summed-input hop window: 0.4 s.
- **Movement:** Glide fall ≤ 3.0 m/s for ≤ 1.5 s per hop, 6 m/s forward; Sky gravity ×0.55; Drift gravity ×0.25; Light-rails 12 m/s; Light-Lag 15 m and 1.5 s at most.
- **Gusts:** 4 m/s for 2 s, every 20–40 s, 1 s streamer tell.
- **Falls:** updraft or filament returns you in 3 s; Space safety line in 2 s.

### Encounter numbers

- Rule ≤ 14 words; tell 2–5 s before danger; soft length 45–90 s; hard cap 150 s (v1).
- Loudness radii: waddle 2 · tongue lash 2 · mite rustle 3 · carried loud book 4 · hop landing 5 · shove 6 · charged-hop landing 7 · dropped book 8 · croak = 4 / 6 / 9 m by rank.
- Air: 20 s per frog (4 pips × 5 s); Moon Toad helmet 30 s; vent +10 s; bubble pass −5 s / +5 s.
- Light value: frog = Glow Level 1–10; carried relic 11; firefly jar 12; lantern-fish 14; ash coat 0 for 10 s.
- Standard shove 6 m/s; heavy object 30 kg needs two tongues.
- First reward: a 30-firefly cloud gives Glow 1 → 2 within 20 s.
- Jars: Big Toad 10 / 20 / 30 flies; Kite Race 4 / 7 / 10 rings.

### Places, layers and reveals

- **The Well** (the start; Hatch Pond; `rim_surface`, the Rim), **The Sky 하늘**, **Space 우주**, **Beyond 너머**.
- Reveals: ★1 surfacing the Well, ★2 The Painted Sky, ★3 The Speck and the Drop, ★4 The Revelation.
- Dome tear sizes: 1° / 3° / 8° / 20° / 40°. Nebula smear: 5° / 15° / 40° / 60° / 90°. Moss glints: 3 / 12 / 40 / 80 / 120.
- Molts: Glider molt (arm sockets), Moon Toad helmet (hat floats inside), star-freckle coat (light trail 1.5 s).
- Keeper vessels: raft (Well), leaf raft (Sky), cargo pod (Space), comet (Beyond).

### Characters

- **Bosses:** the Bell-Golem / Echo Golem; The Jar (Well Warden, owned by 05); the Thunderhead Heron (30 m, bronze-bell crest); Chan Chu, the Moon Toad (40 m, three-legged, jade `#3FBF8F`, gold `#FFC94A`, Wish Coin 6 m with a square hole); The Watcher.
- **Creatures:** the Librarian, Old Whiskers, the Mirror, the Ash Axeman, the Kite-Hawk, the Miller, the Fog Serpent, the Thunder Carp, the Squall, the Crayfish, the Leech Mother, the Rat King, the Diving Beetle, the Cuckoo, the hermit crab, the Lure Spider, the Fire Newt, the Dragonfly Nymph, the Two-Headed Newt, the Pendulum Mantis, the Orrery Toad, the Hull Crawler, the Static, the Glass Jellyfish, the Eraser, the Afterimage, the Moth of Silence, the Paradox, the Chrono-Slime, the Harmony Sentinel / Lamp-Knight.
- **Companion frogs:** Pell, Kestrel, Moss, Brother Brass, Lumen. (Vex is party-only.)
- **Currencies and pickups:** fireflies, Glow Level, Pearls, RP, Wish Coins ("Coin" means only Wish Coins).

### Palette and audio tokens (09 owns them)

- **Sky:** sky `#BFE3F5`, cloud `#FFF4EA`, shadow `#9DB4D8`, warm accent `#FFC3A0`, lightning white `#F4F7FF`.
- **Space:** hull `#2A1F3D`, neon `#4DF3FF` and `#FF4DD8`.
- **Beyond:** nebula fog `#FF8FD0`, moss glints `#7CC46A`. **Well moss:** `#557D33`.
- **Other:** reading lamps `#FFD9A0`, filled stand / gold `#FFC94A`, quiet book `#EFE3CF`, loud book `#C9B7E8`, catfish barbels `#7FE8D8`.
- **Croak notes:** C `#FF6B6B`, D `#FFA94D`, E `#FFD166`, G `#6BE38F`, A `#6BB8FF`.
- **Music keys:** Sky C (breathy flute), Space G (glass bells), Beyond D (choir pad).

### Kit names (proposals in §10)

`PhysicsProfile`, `SummedInputController`, `Listener`, NoiseBus, `SwimController`, `WaterVolume`, swallow state, `ReflectionTemplate`, `IHeroBody`, `GravityVolume`, `TimeScaleZone`, `LightLag`, APV lighting-scenario blend, footprint decals, RoomDef fields `variantOf`, `seats`, `layer`, `layerRule`, `physicsProfile`, `minClearSec`.

### v1 totals (history only)

35 new rule doors, 3 new Heart doors, 6 set pieces, 4 new toys (`toy_bigtoad`, `toy_kite_race`, `toy_zero_g_stack`, `toy_lag_tag`), 3 Keepers, 3 Wardens, 37 new Bestiary pages (Well reaches 28), 2 modes.

<!-- END -->
