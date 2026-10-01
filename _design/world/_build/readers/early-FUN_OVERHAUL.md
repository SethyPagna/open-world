# Reader: _design/FUN_OVERHAUL.md

- **Reader id:** early-FUN_OVERHAUL
- **Source:** `_design/FUN_OVERHAUL.md` (KNOTWELL v1, "FUN OVERHAUL: every door makes you bigger", version 1.0, dated 2026-09-28, status "BINDING design direction for the Unity build", 1,383 lines). Read in full, lines 1 to 1383.
- **Read on:** 2026-09-30, for the v2 redesign (one open world, one story, up to 8 players per Steam lobby, NGO host mode, no betrayal in the main game).
- **Later overrides noticed:** `_design/master/DECISIONS.md` cites this file as "FO" and changes a few of its names and numbers (for example, Croak III "Big Voice" became "Twin Toll", and the Sky molt became the "Glider molt"). Those are flagged in "Key numbers and names".
- **Pillar keys used below:** P1 Clear · P2 One world, one story · P3 Genuine · P4 Easy to start · P5 Organized · P6 Open world, together.

---

## Summary for the archive

`FUN_OVERHAUL.md` was the binding design direction for the KNOTWELL v1 Unity build. It overrode the older KNOTSPIRE `GDD.md` and `WORLD_STRUCTURE.md`, and the later master specs cite it as "FO". It was merged from three proposals (power, party and immersion), scored by two judges, and attacked by a design refuter and an ethics refuter.

It diagnosed ten faults in KNOTSPIRE. The candle hero shrank as it lost health. Growth was rare and hollow. The first session used 22 bindings and felt like a rules exam. Betrayal had become paperwork (10 Knife types, Soot, a Tribunal). Failure paid nothing, and the big reveal sat behind a 38-minute run.

What it decided:
- rename the game KNOTWELL, with the Firefly Frog as hero (a candle fallback behind readability tests);
- play a Climb of 20 numbered doors (Quick ~11 min, Full ~24 min), with picture-door pairs, forks and a Meeting Door;
- grow in three layers: Glow Level and verb ranks, Boons, then Tower Rank, Bestiary and classes;
- use 8 controls and at most 25 coined nouns;
- keep betrayal only in announced Heart doors (Knot and Cut, Betrayal Cam, Vengeance);
- fill empty seats with 10 Rival bots;
- add a fairness contract and a results ceremony that pays even on failure;
- sell fairly: $7.99, cosmetic sets, no pass, no streaks;
- run Unity and NGO proof gates.

The goal was a game that felt fun, "addicting" but fair, attractive, and full of felt progress.

---

## Reusable for v2

### World and lore

- **The nested-well story: a frog at the bottom of a well climbs out, finds the sky, then space, then learns the sky was the floor of a bigger well** (§2.1 one sentence, §6.3 scale-reveal table, §7 WORLD §1-2 row). Closing lines: "Your sky was a hole." and "Every sky is someone's well." *Why it fits:* this is the owner's own image ("frog in a well, comes out of well sees the sky, then go to sky sees space"). It gives one theme every place and quest can serve (P2). In v2 it becomes the main story arc of one connected world, not a ladder of layers.
- **The Mouth: the coin of sky 180 m above the well floor, visible from every rest stop, widening as you rise** (31° / 37° / 44° / 56° / 74°; §6.1 0:00, §6.2 #5). *Why it fits:* a fixed landmark on the skyline that always points at the story goal (P1, P2). It is the open world's "north star".
- **Wish Coins rain down through the Mouth** (§6.1 10:40, §6.2 #5). *Why it fits:* a wishing well gives the money an in-world reason to exist. Coins are wishes dropped from above (P2). It also sets up the Revelation about who is dropping them.
- **Window views: cracks in the well wall that show other stone strands and hundreds of lantern lights** (§3.2 Breather "window", §6.1 4:00). *Why it fits:* the lanterns can become other frog settlements you will visit, so the world feels big and lived in (P6). A glimpse tells the player where they can go next (P1).
- **Rest stops on the stone strands ("Landings"): warm lanterns, a stall, a toy, a mirror, free heal and revive** (§3.1, §6.1 4:40, §7 §10.1 and WORLD §4 rows). *Why it fits:* the seed of v2 towns. Warm, safe places between dark wild areas give the world a clear rhythm (P6, P2). Automatic heal and revive keep towns simple (P5).
- **Tone rule "dread, then a waltz": dark, tense danger areas where every threat glows on its own; warm, loud safe places** (§2.2). *Why it fits:* one mood grammar for the whole world. The player can read whether a place is safe from its light alone (P1, P2).
- **Big monsters are never killed; frogs ring bells, dodge and push back the dark** (§2.2 pillar 2, §4.1 Thunder Croak "never a kill"). *Why it fits:* a gentle, consistent tone (P2, P3). v2 still needs to decide what "combat" means in open areas.
- **Mites (moths, bell-beetles) that pop into fireflies when stomped, tongued or croaked** (§3.8 #7, §6.1 0:40). *Why it fits:* clearing pests turns the dark into your own light, which is the theme itself (P2). It also gives open areas small, low-stakes things to do between quests (P6).
- **Boss ideas with world logic** (§6.3 Wardens): **The Jar**, a house-sized firefly jar lowered onto the brightest frog; a **thunderhead heron** for the Sky; **Chan Chu**, the moon toad with a coin in its mouth, for Space; **the Watcher at the rim**. *Why it fits:* each threat makes sense for a firefly-eating frog (jars catch fireflies, herons eat frogs). They can be story bosses in one world (P2, P3).
- **Monster cue ideas: the bell-golem's eyes glow; a heron's shadow crosses the floor** (§3.8 #1, §6.1 1:00). *Why it fits:* threats that come from the frog world and warn you before they strike (P1, P2).
- **Hatching as the first beat: an egg wobbles, a tadpole, then a froglet on a lily pad** (§6.1 0:03). *Why it fits:* an origin moment that is also the tutorial. Growth is the language of the game from second 3 (P2, P4).
- **The Revelation: the giant on the rim of the bigger well is a frog, like you** (§2.3, §6.3 ★4). *Why it fits:* a story ending that follows from the world's own rule (P2). Keep it as the long-term mystery of the world.
- **Region palettes: moss and lanterns (Well), pastel (Sky), violet and neon (Space)** (§6.2 #5). *Why it fits:* each region reads at a glance while staying in one world (P2, P6).
- **Region movement verbs switched on by default: Glide in the Sky, Drift in Space** (§6.3 Layer build rules; §7 WORLD §9.1 row). *Why it fits:* new ways to travel as the world opens up, with no hidden toggle (P6, P1).

### Characters

- **The Firefly Frog: an upright, bean-shaped frog whose light comes from the fireflies it has eaten** (§2.3). *Why it fits:* a simple, memorable silhouette with a built-in reason to glow (P3). Owner decision 2 keeps the frogs.
- **Growth shows on the body: belly brightness, +1 orbiting firefly per level, markings that light up, a Crown glow (firefly halo) at the top level. The hitbox never changes** (§4.1). *Why it fits:* other players can see how far someone has come at a glance. That is a core MMO feeling (P6), and it is fair (P3).
- **Health as 3 glowing back spots, the same for every frog; deflation and eyelid droop as a second cue** (§2.3, §3.7). *Why it fits:* health is readable on the body at 25 m, not only in a HUD (P1).
- **Anti-meme face rules: round face, no lips, no droopy lids, dart-frog colours, a check with 5 cold viewers for any Pepe association** (§2.3). *Why it fits:* protects the frog's own identity (P3).
- **Player-colour rim light** (§2.3, §6.2 #2). *Why it fits:* you can pick out each friend in a crowd of 8 frogs (P6).
- **The ten Rivals as named frog characters: Moss, Vex, Pell, Lumen, Brother Brass, Kestrel, Maud, Pip, Ines, Gutter** (§5.3; archetypes and signature lines live in GDD §8.2). *Why it fits:* a ready cast for town NPCs, quest givers and companions (P3, P6). Keep their names and archetypes. Drop the betrayal side (see Party-only).
- **Specific voice lines that already sound human** (§3.5, §6.1): Kestrel's "Watch this!" then "That was on purpose." after a belly-flop; Moss's "Got it!" when he tongues your lost spot back. *Why it fits:* short lines with a real personality, not generic hero talk (P3). Kestrel the show-off and Moss the helper are clear first NPCs.
- **Character memory callbacks** (§5.3 Rival memory, "Last time you left me on the bridge"). *Why it fits:* NPCs who remember what you did make the world feel lived in and genuine (P3, P6).
- **NPCs react to your growth** (§5.3 onlooker chorus: "Since when does your tongue do *that*?"). *Why it fits:* the world notices you (P3). Soften the sneering lines (see Conflicts).
- **Classes as real frog species: Tree Frog, Bullfrog, Dart Frog, Mime Frog, Echo Toad, Horned Frog, Glass Frog, Lily Walker, Bell-Eater** (§4.2). Each has one Signature on a 15-30 s cooldown, and none changes health, speed, hitbox or shove. *Why it fits:* owner decision 1 asks for "light classes or roles". Species are real animals, so each class is easy to picture (P3, P2). As sidegrades they keep co-op fair (P6). Replace the secret-quest unlock with visible unlocks (see Conflicts).
- **One rig with add-on parts and shared attach points, so every hat fits every form** (§6.3 Layer build rules, §7 §13.5 row, §10.4 #9). *Why it fits:* many looks from one body keeps the cast consistent and cheap to build (P5, P3).
- **A hero with named sources of motion: charged hop (squash and stretch), tongue, croak** (§2.3). *Why it fits:* every verb is a real frog behaviour, so the body and the world agree (P2).

### Frog mechanics

- **Three core verbs: Hop, Tongue, Croak** (§2.3, §3.9). *Why it fits:* a tiny verb set anyone can learn in a minute (P4).
- **Tongue is also Interact** (§3.9). *Why it fits:* one button for "use that thing" (P5, P4).
- **Tap to hop, hold to charge; tap to lash, hold to carry; tap to pulse, hold to sustain** (§3.9). Every hold can be a toggle in Settings. *Why it fits:* one clear pattern across all verbs (P4), plus an accessibility option (P5).
- **Verb ranks I-IV with exact numbers** (§4.1 table). Hop apex 1.4 m, charged 1.9 m, then 2.4 m, Air Hop at III, 3.0 m at IV. Tongue 3 m and 20 kg, then 4.5 m grapple, 6 m Long Tongue, 8 m chain grapple. Croak 4 m, then 6 m, a two-bell ring at III, 9 m Thunder Croak at IV. *Why it fits:* in an open world these become visible traversal gates. A 2.3 m ledge, a 4.5 m anchor or a bell 6 m away tells you "come back when you can reach this" (P6, P1).
- **Rooms and paths built against those thresholds** (§3.8 #6 rank shortcuts: ledge 2.3 m, anchor 4.5 m, bell 6 m). *Why it fits:* growth binds to the world, so a new rank opens new paths (P6, P1).
- **A knocked-out spot flies off as a glowing firefly; any frog can tongue it back within 3 s, and it always returns to its owner** (§3.7). *Why it fits:* turns a hit into a kind co-op catch that works with strangers (P6, P3).
- **Going dark: become a tadpole ghost; any frog revives you by holding Croak over your egg for 2 s; you return with 1 spot** (§3.7). *Why it fits:* one verb for rescue, clear and friendly (P6, P1).
- **Chorus: 2+ frogs croaking within 0.3 s stagger a monster** (§4.1 Chorus Boon, §6.2 #6). *Why it fits:* the simplest "together" action. Strangers can join by pressing one button at the same time (P6).
- **Leapfrog (hop off a teammate's head for 3 m), Frog Stack towers, Frog Sling** (§4.1, §5.1). *Why it fits:* playful co-op moves anyone understands without talking (P6, P4).
- **Two-frog door that needs two frogs to push** (§6.1 0:35). *Why it fits:* a light co-op puzzle for drop-in players (P6). In v2 push with Move, not with Shove.
- **Tipping lily-pad raft that needs balanced weight** (§3.5 2:20, §6.1 2:20). *Why it fits:* co-op travel on water that reads without words (P6). Keep it optional, not forced coupling.
- **Climbing wall with a per-frog grip ring; friends haul each other up with the tongue** (§3.2 set piece, §5.1). *Why it fits:* vertical open-world travel with light, optional help from others (P6). Stamina is per frog, not shared, so strangers don't drag each other down.
- **Feel numbers: 5 m/s move, 120 ms coyote time, 100 ms jump buffer, 50-120 ms hitstop** (§6.2 #1, §7 §4.2 row). *Why it fits:* responsive controls are the first thing a new player feels (P4).

### Art

- **Juice before fidelity** (§6.2 #1): squash and stretch on every hop, hitstop on pops and hits, rising-pitch count-ups, Cinemachine 3 Impulse shake, about 200 lines of in-house feedback code on PrimeTween. *Why it fits:* feedback makes every action readable and satisfying (P1, P4).
- **Self-lit "glow chalk" tells: every threat cue, frog, sign and pickup is emissive; colours are pushed and tested at real camera distance** (§2.2 tone rule, §6.2 #3). *Why it fits:* the player can always see what matters, even in dark areas (P1).
- **Toon ramp with a per-player rim colour, an outline pass as a Render Graph feature, bloom, LUT, SSAO, APV lighting** (§6.2 #2, §9.2, §7 §13 row). *Why it fits:* a readable, consistent look across the whole world (P2, P3).
- **Big VFX only where they sell the fantasy: level milestones, treasure, story reveals; Shuriken particles by default** (§6.2 #7). *Why it fits:* keeps the screen calm and readable most of the time (P1, P5).
- **Capsule art rule: one focal point, a huge-eyed frog with a glowing belly leaping out of a dark well mouth toward a sliver of sky; must read at 120 × 45 px** (§6.4). *Why it fits:* one clear image that is the story (P2, P3).
- **Scale-reveal camera work: a player-steered pull-back up the shaft to the Mouth** (§6.1 10:40, §6.3). WORLD §10.2's choreography is the source (lanterns revealed as watchers, dolly-zoom, the 64-well mound). *Why it fits:* story milestones the player steers, which the source says raises presence (P2). Keep them as main-story beats.
- **Per-region palettes** (§6.2 #5). See World and lore.
- **Cosmetic slot order by how often others see them: Hat, Skin, Glow colour, Croak voice, Tongue trail, Emote, Door-entrance effect** (§7 §12.2 row). *Why it fits:* a shared world is where cosmetics are seen, so this order suits an MMO feel (P6). The owner keeps skins and a cosmetic shop.
- **Named skins and hats: Honeycomb, Speckled Egg, Stained Glass, Night Sky, Porcelain; Traffic Cone and Coiled Spring hats; a Candle-Toad line** (§7 §12.3-12.4 row). *Why it fits:* specific, concrete names (P3). The Candle-Toad line keeps the old candle idea as a costume.
- **Cosmetics never affect play; earned-only prestige items (Moon Crown, Surfacing hats, the Bestiary hat set, class markings)** (§7 §12.1, §12.5 rows; §8.3). *Why it fits:* fair (P3). Prestige items let others see what you have done (P6).
- **Asset sources: procedural, code-generated, or CC0 packs, each licence recorded; prefer Kenney, Quaternius and KayKit; a human reads Synty's and Sonniss's AI clauses first** (Constraints, §9.2). *Why it fits:* safe for an agent-built project.

### Audio

- **Positional monster cues that arrive 2-5 s before the danger** (§3.8 #1, §6.2 #6). *Why it fits:* you hear where a threat is and when it will strike (P1).
- **Croaks harmonise because the motif is pentatonic** (§6.2 #6). *Why it fits:* 8 players croaking in one town still sound good together (P6, P3).
- **Your croak echoes in the well and goes silent at the rim** (§6.2 #5). *Why it fits:* sound tells you where you are in the world (P2).
- **Title sound: kalimba drips over black water** (§6.1 0:00). *Why it fits:* a specific, quiet opening mood (P3).
- **Unity AudioMixer plus a code sound manager; FMOD only if adaptive music needs it; CC0 and CC BY audio logged in `licenses.csv`** (§6.2 #6, §7 §15 row). *Why it fits:* simple, agent-friendly stack.

### Tech

- **NGO 2.x host mode over the Facepunch Steam transport, plus Unity Transport with LAN discovery as a second transport; Distributed Authority ruled out; the NGO 3.0 migration with Unity 6.7 LTS in 2027 is a named milestone** (§9.2). *Why it fits:* matches the owner's decision (Steam lobbies, NGO host mode, up to 8 players).
- **Netcode proof of concept at 150 ms RTT with packet loss and a full 8-seat lobby** (§9.3 #1). *Why it fits:* the same test is needed for the v2 world. Re-scope it to roaming players rather than one shared room.
- **Lag compensation: rewind targets by the lasher's RTT/2, capped at 150 ms; the earliest input timestamp wins a contested grab; the host's own inputs are delayed by the median client one-way latency** (§5.4 #6). *Why it fits:* the host gets no edge in co-op (P6, P3).
- **Server-authoritative gameplay actions; hidden per-player data (offers) seeded with a host-only salt and sent only to its owner** (§5.4 #5, #7; §4.1 Seeding). *Why it fits:* good anti-cheat practice for any shared world (P6).
- **Bots and NPC frogs as host-owned NetworkObjects running the player code path; this doubles as automated QA** (§5.3, §9.2). *Why it fits:* companion frogs and test bots come almost for free (P6). Profile bots plus prop physics on the host from week 1.
- **Ragdolls are a local cosmetic layer, never networked** (§9.2). *Why it fits:* saves bandwidth in a busy world.
- **Data first: content lives in JSON that agents edit; editor scripts generate ScriptableObjects and prefabs** (§9.2). *Why it fits:* the team is mostly agents (brief). Quests, NPCs and regions can be data too (P5).
- **Floating origin plus nested shells (skyboxes, shell meshes, fog gradients), because URP has no camera-relative rendering** (§6.3 Unity note, §9.2). *Why it fits:* essential for a large open world with a tall vertical scale (P6).
- **Content placed far apart in one scene and hidden per client with the netcode's visibility controls** (§3.3, §9.2). *Why it fits:* the starting point for v2 interest management. It must scale from "2 live rooms" to "8 players anywhere" (see Conflicts).
- **Save and resume: the host saves a seed plus a small JSON state** (§3.6 Resume). *Why it fits:* the basis for a persistent-feeling world in host mode (P6).
- **Procedural frog rig: a script-built Blender bean mesh, hand-written 2-bone leg IK, spring bones for throat sac and eyes, a tongue spline, fixed hat attach points, no retargeted humanoid clips** (§2.3, §9.2). *Why it fits:* buildable by agents and keeps the whole cast consistent (P3, P5).
- **Build-failing EditMode tests** (§8.6): a shop item that references a gameplay stat or random table; a purchasable that grants currency, keys, rerolls or revives; a text template with "%" not bound to real data; a shop countdown under 24 h; an asset without a `licenses.csv` row. *Why it fits:* enforces fair, honest numbers automatically (P3).
- **Steam Game Recording timeline markers for clip sharing** (§5.1 Replays). *Why it fits:* cheap sharing of big moments (level milestones, story reveals). The markers set at betrayals are party-only.

### Progression

- **Fireflies are XP, not money. You gulp them, they bank when an area is cleared, and banked fireflies are never lost** (§4.1). *Why it fits:* the reward is the theme: light is growth (P2). Nothing is taken back (P3).
- **Clear rewards are shared equally by everyone who took part, ghosts included (70% of fireflies as the clear bonus, 30% loose); no loot-magnet or loot-rate bonus grows with level** (§4.1). *Why it fits:* strangers never compete for a kill or a pickup (P6). No snowballing (P3).
- **"Every level changes something you can do, and you can see it"** (§4.1). The level-up names the change and its cause, for example `[ TONGUE II ] 4.5 m. Grapple unlocked. Because: you grabbed 14 things.` *Why it fits:* the player always knows what changed and why (P1).
- **The verb that levels is the one you used most, and no verb gets more than 1 rank ahead of your lowest** (§4.1). *Why it fits:* no menu to learn, and growth follows how you play (P4).
- **Boon design rules: every Boon works everywhere plus a stronger effect at home; no filler cards; a duplicate upgrades it (I → II → III) instead of rolling rarity** (§4.1). *Why it fits:* useful rules for any v2 charm or equipment system (P5). The Boon names are a ready pool (see Key names).
- **Three deterministic tracks, no random unlocks, randomness only inside a run** (§4.3). *Why it fits:* progress is predictable and easy to follow (P1, P5).
- **The Bestiary: one page per monster with 4 stamps (Seen, Survived, Cleared, Hidden clear). Your first death to a monster fills its page with a warm tip that highlights the rule you missed; every 4 pages unlock a hat** (§4.3 Track 2). *Why it fits:* failure teaches instead of punishing (P4, P1). A tidy in-world journal (P5).
- **A rank that grows on every outing, paid on failure too; small, PvE-only perks per rank; rank never gates a mode** (§4.3 Track 1, talents). *Why it fits:* an adventurer-guild rank in town is a classic MMO feel (P6). Rename it and re-theme the letters (see Conflicts).
- **Every outing pays, even a failed one; death rewards are first-time only, so dying on purpose earns nothing** (§4.4). *Why it fits:* low frustration for new players (P4), and fair (P3).
- **Results summary order: counter, coins count up, stamps, class progress, cosmetic titles, rank bar last, then two equal buttons ("again" and "rest") and nothing auto-starts** (§4.4). *Why it fits:* a clear end-of-session recap with a clean place to stop (P1, P3).
- **Unlocks are per lobby: the host's or the most advanced member's unlocks cover everyone; a new friend can join a veteran's hardest content** (§3.6, §8.4 #6). *Why it fits:* grind never splits friends. This is drop-in co-op without friction (P6).
- **Drop-in joiners start at the party's lowest human level, with matching gear granted** (§4.1 Drop-in). *Why it fits:* a joiner can play at once with no catch-up grind (P6). Adapt "next door" to "anywhere".
- **Catch-up help for the lowest-level player** (§4.1 Comeback bonus). *Why it fits:* keeps mixed groups together (P6).
- **Two currencies at most: Wish Coins (spent in the world) and Pearls (cosmetics only)** (§4.3). *Why it fits:* few currencies are easy to learn (P5, P4). Pearl prices: Common 150, Rare 400, Epic 900, Legendary 2,000.
- **A town stall with plain prices: heal 20, reroll 25, upgrade 60, Gold Key 80 Wish Coins** (§7 §10.3 row). *Why it fits:* a shop anyone understands (P5).
- **Treasure feel only in earned play: rare gold rooms (5%), with odds published in-game; no slot reels, no spin animations; treasure jars never hold cosmetics** (§3.2, §8.2). *Why it fits:* "addictive but fair" as the brief asks (P3).
- **Fair monetization** (§8.1-8.3): $7.99 with a gift 4-pack; a free demo; free weekends at updates; creator keys a day early; 4-piece Supporter Sets at $2.99-4.99 priced in real money; paid and earned catalogues never overlap; nothing sold changes play, odds, speed of progress or information; no battle pass at launch; the earned catalogue buyable any time; earn rates published and never cut; event cosmetics return within 45 days; try-on in the Mirror; a wishlist instead of a vault. *Why it fits:* matches "skins and a cosmetic shop" and fair progress (P3).
- **Retention rules** (§8.4): Well-Rested instead of a daily bonus (a rest meter caps at ~3 days and doubles rank and Pearls for 2 outings); no streaks, ever; every hook has a save point; no out-of-game nudges; a gentle break line after ~90 minutes that never blocks input; no energy, decay or expiring currency. *Why it fits:* "addictive but fair" in practice (P3).

### UI and clarity

- **Signs that show only four things: a big name or number, a type, a prize icon and 1-3 skulls** (§3.4). *Why it fits:* reuse for quest boards and area entrances. "What do I get, and how scary is it?" (P1, P5).
- **One-line status windows that name the change and its cause, never a stat sheet** (§6.2 #4). *Why it fits:* clear feedback in plain words (P1).
- **Rules written in plain text on the first visit** (§3.8 #2), for example `[ CLEAR ] Ring 3 bells. When its eyes glow, freeze.` *Why it fits:* the player always knows the goal (P1).
- **House rules: "fun before rules" (nothing needs a formula on screen, a pick order, or a wait nobody can play through); "every number shown is true"** (§2.2). *Why it fits:* direct support for P4, P5 and P3.
- **Noun budget: at most about 25 player-facing coined nouns; plain words for everything else; name collisions fixed** (§7). *Why it fits:* a low learning curve depends on few invented words (P4, P5). v2 should aim lower than 25.
- **8 bindings in total** (§3.9): Move, Camera, Hop, Tongue, Croak, Shove, Power, Wheel. Pause and Settings are not counted. *Why it fits:* meets P4 and P5. v2 may drop Shove and reach 7 (see Party-only).
- **Wheel with pings, 8 quick lines and emotes; proximity voice later, friends-only and opt-in** (§3.9, §5.1 Voice). *Why it fits:* safe, simple talk with strangers in a shared world (P6).
- **Banners, not full-screen cards, for other players' milestones** (§4.2, §10.3). *Why it fits:* the world tells you about others without stopping your play (P6, P5).
- **Friends' best progress shown on a hub wall** (§3.1, §8.4). *Why it fits:* a town notice board that shows friends' progress is a light MMO social hook (P6).
- **Curiosity teaser at the end of a session ("Something is waiting in 12E."), never naming a real friend** (§4.4 #8). *Why it fits:* the next launch opens on a clear next goal (P1).
- **HUD kept minimal: a big progress counter, status windows, the 3-spot health HUD, the results recap, plus accessibility options** (§7 §14 row). *Why it fits:* P5.
- **Public-lobby safety: 2 flags from other humans turn a griefer's seat into a bot** (§3.7). *Why it fits:* a simple moderation tool for open lobbies (P6).

### Design method

- **Timing targets for the first minutes** (§3.5, §6.1): in control within 5 s (the menu is the well bottom), first reward at 0:20, first laugh by 0:30, first power at ~2:00, and no more than 5 new systems before the first big payoff. *Why it fits:* beats the brief's "control a frog within 60 s" and "core loop in 5 minutes" (P4).
- **First-10-minutes shot list with a "New systems" column counting 1/5 to 5/5** (§6.1). *Why it fits:* a proven format for the v2 first-session script (P4).
- **Cadence contract** (§3.5): something small every 10-30 s, a clear every ~1 min, a reward every ~2 min, a rest or rank moment every ~5 min. *Why it fits:* a density target for open-world content along the main path (P1). Retune for a world (see Conflicts about the 12% rule).
- **Encounter anatomy** (§3.8): a self-lit cue 2-5 s before danger, one plain rule, a readable and funny punishment, an obvious clear plus an optional hidden clear, 2 seeded twists, a shortcut for higher ranks, and mites as an outlet. *Why it fits:* a template for v2 dungeons and quest encounters (P1, P2).
- **"If a player finds an unintended solution, the game says so and pays for it"** (§4.1: `[ NOTED ] That was not the intended solution. Keep it.`). *Why it fits:* rewards curiosity in an open world (P6, P3).
- **Proof gates and stop conditions** (§9.3): stop and fix pacing if the median time to the first power exceeds 3:00, if testers cannot name a power they gained, if health is unreadable at 25 m, if fewer than 60% say "Worth it?" Yes, or if more than 25% of first sessions quit mid-encounter early. Feel target: about every 90 s the tester got stronger, laughed or saw something bigger. *Why it fits:* numeric acceptance rows for P4 and P1.
- **"Worth it?" one-tap survey plus a revert rule: undo any change that lengthens sessions but lowers "Worth it?" or next-day return** (§8.5). *Why it fits:* keeps "addictive" honest (P3).
- **Evidence corrections not to re-cite** (§10.5), for example: "Fall Guys' bots were tuned to lose" is unverified; PEAK's stamina is per climber; DOORS' 11.56 min is a platform average, not a run length; the capsule statistics are descriptive, not causal. *Why it fits:* stops v2 agents from repeating bad facts.

---

## Party-only (to archive)

These only make sense in the v1 betrayal party climber. Owner decision 3 moves them out of the main game.

- **Pillar 4 "Betrayal is a punchline"** and the betrayal clause of pillar 5 ("sometimes betray you") (§2.2).
- **The tagline "Climb together. Fall alone." and the end of the one-sentence pitch, "if nobody cuts your rope first"** (§2.1, §6.4 trailer end card).
- **The name's meaning "Knot is the tether and Pact"** (§2.1). The name KNOTWELL itself is not party-only, but this reading of it is.
- **Heart doors (♥, formerly D) and the whole roster** (§3.2, §3.4, §5.2): Two Pads, Three Frogs; Split or Swallow; Tongue-Tied Bridge; Doppelfrog. Also Heart-door placement rules (never before door 11 in the first climb, from door 6 later).
- **Doppelfrog public vote (at least 5 voters and 3 humans; bots vote on public evidence only) and the LATER "Mimic Climb" lobby mode with one hidden Mimic for a whole climb** (§5.2). This is the Among Us and Mafia layer.
- **Knot and Cut** (§5.2, §3.9): Knot at a Landing on the Wheel; Cut by holding Shove for 1.2 s while Knotted; the crimson thread flash, the rising "shhhk", the cheek-puff; "hold on" with the Tongue to stop it; the 1 s stun. Duo Boons that exist only while Knotted, and "cutting the Knot breaks the Duo" (§4.1).
- **Betrayal Cam (0.8 s at 25% speed) with a `[ TRAITOR ]` stinger; the WANTED poster until the next door; the Vengeance quest** that returns what was taken, slimes the betrayer and gives +1 card once per climb (the *goguma* to *saida* frame) (§5.2, §6.4 trailer beat 5).
- **Theft rules: inside Heart doors the catcher keeps spilled fireflies; Cut steals the partner's unbanked fireflies; the Quick Tongue Boon steals from 5 m; "betrayal moves only unbanked room loot"** (§4.1, §5.2, §5.4 #3).
- **Everyday mischief: shoves, tongue tugs on other players (at most 1 m, never toward a drop outside Heart doors), croak-scaring bots, and the 0.6 s yank tell and 0.25 s cheek-puff tell** (§2.3 risk table, §5.2, §5.4 #2). This covers the pranks. Shove's hold-to-Cut is part of it.
- **Blame tags such as "Yanked by Vex" and "Sank the raft: Pip"** (§5.1).
- **The comedy formula "coupling + visible blame + cheap failure" and pillar 3 "My mistake is your problem" as a rule for every room** (§2.2, §5.1).
- **Tethers: the tongue-tied tether set piece (Chained Together style), pairs tied together, the "curse where one frog's hop moves another's platform"** (§3.2, §3.8 #8, §5.1). Owner decision 3 names tethers as leaving.
- **Lobby-type table rules for betrayal** (§5.2): human-vs-human Heart doors on or off per lobby, bots do the betraying in public lobbies, and "Masked Bots" (bots disguised as players, revealed only on the results screen).
- **Drama Director betrayal targets** (§5.3): the first Heart door a human sees contains a visible bot betrayal; at most 1 bot betrayal per floor; the mercy rule. The non-betrayal targets (a bot rescues a human early, one funny bot failure every 5 doors) could carry over to companion NPCs.
- **Rivals as schemers and betrayers; "bots never betray without the full tell"** (§5.3).
- **The Risk (♥) Boon family framed as betrayal temptation** (§3.4, §4.1): Deep Cheeks, Bold Belly, Quick Tongue, Last Gulp, and the Duo Double or Nothing. Deep Cheeks and Last Gulp could survive as plain risk-reward charms without the theft.
- **Cosmetics tied to betrayal: the "Betrayal Snap" slot and the rule reserving "betrayal crimson"** (no cosmetic hue within 15° of it) (§7 §12.1-12.2 rows).
- **Secret per-player quests with `[ HIDDEN CONDITION DETECTED ]` and the "who was secretly special" reversal** (§4.2). The secret-knowledge mechanic breeds suspicion (the source's own caveat and A/B test 5). Classes stay; the secret delivery goes (see Conflicts).
- **Heart-door A/B tests** (§9.3 #4): tongue-on-player on vs off, bot-only betrayal vs friend betrayal, secret quests on vs off in Heart doors.
- **Already cut in v1, listed so the archive is complete** (§1 #4, §7): 10 Knife types, Soot tiers, Notorious, Confession, Forgive, the Tribunal, truth-stamped Notes, Keyhole bets, the Pact Pot, gold threads and 25% Ember theft, the Ledger overlay, the Hall of Grievances, the Liar's Banquet, the "Sharpest Knife" award, the Clue Composer, and the lying minigames Pinky Promise and Rumour Dice.
- **The lesson worth keeping in the archive note:** "Dread Hunger and Deceit died of cheating and DDoS, not of their design" (§5.4 #7), and betrayal as a choice with a visible cost, never the only way through (§5.2).

---

## Conflicts with the new pillars

- **The unit of play is a Climb of 20 numbered doors in 4 floors, with global door numbers across layers (Well 1-20, Sky 21-40, Space 41-60, Beyond 61-80)** (§3.1, §3.2). — **P2, P6.** Owner decision 2 asks for one connected open world, not a sequence of doors. Salvage: the regions and their order; "best door" could become a depth or region milestone.
- **Power resets every climb, and each new layer "re-hatches you at Level 1"** (§4 intro, §4.1, §6.3 Layer build rules). — **P2, P6.** In one continuous world and story there is no reason for a hero to lose growth. A persistent-feeling MMO world needs persistent levels.
- **Roguelite build churn: a private pick-1-of-3 Boon about every 2 minutes (about 12 per Full Climb), an 8 s timer, 4+1 slots where a replaced Boon shatters, rerolls, a 4-card comeback offer, auto-grants until a `[ CHOICE UNLOCKED ]` moment** (§4.1). — **P4, P5.** Too many decisions for a relaxed shared world. Slower, persistent charms or gear fit better.
- **Too many parallel progression systems at once** (§4): Glow Level, verb ranks, Awakenings, Masteries, 16 Boons + 4 Duos + 4 Legendaries, Tower Rank with 8 talents, the Bestiary, 9 classes, secret quests, Party Rank Up, Wish Coins, Pearls, Well-Rested, Rank Sync, Team Lives and four difficulties. — **P4, P5.** The source fills its own 25-noun budget exactly. v2 needs fewer tracks and fewer words.
- **"The Tower" and "the System": an unseen, sarcastic announcer with bracketed LitRPG windows; ranks F → SSS** (§2.2, §4.3, §6.2 #4). — **P2, P3.** A tower does not belong in a well world, and nobody in the fiction owns the voice. The F-SSS letters come from tower-and-hunter web fiction, not from a frog world. Keep the one-line window format, but give it an in-world owner and frog-world rank names.
- **Sneering bot barks ("An F-rank? Adorable.") and roast humour** (§5.3, §6.2 #4). — **P3.** Mockery from strangers can feel mean in a shared world. Keep reactions sincere and specific.
- **Card-suit door grammar (♠ Body, ♦ Mind, ♣ Together, ♥ Heart, E Enigma, from Alice in Borderland)** (§3.4). — **P2, P4.** Playing-card suits are off-theme in a frog well and add a layer to learn. It also sits oddly with the source's own rule that "No Boon uses card, dice or chip imagery" (§4.1).
- **Secret per-player quests drawn at random from classes you have not unlocked** (§4.2). — **P1, P5.** The player cannot see how to get a class or choose which one to chase. Make class unlocks visible, for example through a named trainer NPC in a town.
- **Redacted rules: Hell hides every clear condition; the Sealed option hides rules for +50%; "Hidden clear: ???"** (§3.6, §3.8 #2). — **P1.** Hiding the goal is the opposite of "always know what to do". Optional secrets are fine; hiding the main goal is not.
- **Shared Team Lives, room failure that spits the party through the next door, difficulty chosen at a run's entrance, Hell unlocked per lobby** (§3.6, §3.7). — **P6.** Shared lives punish drop-in strangers for each other's mistakes. In an open world, danger is better set by region.
- **"The party walks together by default"; at most 2 rooms live at once; bots never enter a door without a human** (§3.1, §3.3, §9.2). — **P6, and a tech risk.** v2 players roam freely, so up to 8 players may be in 8 places. The host must simulate all of them. The v1 tech plan (2 live rooms, visibility per room) does not cover this. Interest management and host load need a new proof of concept.
- **Forks with SOLO or DUO "E" doors, a Meeting Door with two locks and a key swap, and a rescue rope after 45 s** (§3.3). — **P2, P6.** Built for a door ladder. A co-op dungeon with two halves and a key swap could survive as one quest type.
- **Timed rest stops (40 s Landings) and "time outside rooms is capped at 12%"** (§3.1, §3.5). — **P6.** In an open world, towns and travel are the point, so this metric works against the brief.
- **Seven bots filling every empty seat; opt-in "Masked Bots" disguised as players** (§2.2 pillar 5, §5.2, §5.3). — **P3, P6.** Bots posing as players are not genuine. A crowd of bots following you feels odd in a world. Better as clearly named companion NPCs and townsfolk.
- **Many session modes: Quick Climb, Full Climb, Resume, The Ascent, Landing Party, Daily Seed** (§3.6). — **P5.** Scattered modes. v2 has one world. The minigames (lily-pad sumo, Frog Stack, Jar Tag, Fly Catch) can live in a town instead of a separate mode.
- **Hero gates A and B with a "Wick with a Flame axis" fallback; "lock nothing that assumes the frog" until the gates pass** (§2.3, §6.4, §9.3). — **P2.** Owner decision 2 keeps the frog, so the candle fallback is obsolete. The readability test at 25 m is still useful.
- **Linked bodies and a shared-fate gimmick in every room** (§3.8 #8, §5.1). — **P6.** Forced coupling with strangers adds friction to drop-in co-op. Keep co-op gimmicks optional and light.
- **The Shove verb** (§3.9, §5.4 #1). — **P2, P5.** Without pranks and Cut, Shove has little purpose. Dropping it takes the controls to 7.
- **Unexplained terms in the first session: "jar lineup (Bronze → Silver)", "Party Rank Up", "+1 reroll each"** (§4.1, §6.1 4:40). — **P1, P4.** Words that appear before the player knows what they mean.
- **Talents that each can be switched off, plus a "Rank Sync" toggle** (§4.3). — **P5.** Extra settings a new player must understand. Per-lobby unlocks already solve the fairness need.
- **The name KNOTWELL rests on the tether and Pact meaning, and its trademark search is still a blocking task** (§2.1). — **P2.** v2 needs either a new meaning for "knot" that fits co-op (a bond between friends) or a naming decision. This reader does not make that call.

---

## Key numbers and names

### Names

| Kind | Names (section) | Note for v2 |
|---|---|---|
| Game | **KNOTWELL** (working title; KNOTSPIRE retired because *Croakspire* is on Steam) (§2.1) | Trademark, domain and Steam handle checks still blocking |
| Hero | **Firefly Frog** (§2.3) | Keep |
| Landmark | **the Mouth** (renamed from "the Coin") (§6.2 #5, §7) | Keep; "Coin" means only Wish Coins |
| Growth words | **fireflies** (XP), **Glow Level**, **Awakening** (verb rank III), **Mastery** (rank IV), **Crown glow** (top level) (§4.1) | Keep the idea; "Level" may need to be persistent |
| Awakenings | **Air Hop**, **Long Tongue**, **Big Voice**; Masteries include **Thunder Croak** (§4.1) | `master/DECISIONS.md` renamed Big Voice to **Twin Toll**; use Twin Toll |
| Currencies | **Wish Coins** (in-world), **Pearls** (cosmetics only) (§4.3) | At most two |
| Tracks | **Tower Rank** F → SSS, **Bestiary**, **classes** (§4.3) | Rename "Tower" for a well world |
| Places | **Landing** (rest stop), **Keeper** (mid-boss), **Warden** (region boss), **gold door**, **Rematch door** (§3.1-3.2) | Landings become towns |
| Regions | **Well**, **Sky**, **Space**, **Beyond** (§3.1) | One connected world in v2 |
| Bosses | **The Jar** (Well), **thunderhead heron** (Sky), **Chan Chu** the moon toad (Space), **the Watcher at the rim** (Beyond) (§6.3) | Story bosses |
| Monsters | **bell-golem** (first rule monster, door 2), **mites** (moths, bell-beetles), heron shadow (§3.8, §6.1) | |
| Rivals | **Moss, Vex, Pell, Lumen, Brother Brass, Kestrel, Maud, Pip, Ines, Gutter** (§5.3) | Keep names and archetypes as NPCs; up to 7 fill seats in v1 |
| Classes (open) | **Tree Frog** (Glide Leap), **Bullfrog** (Belly Boom, 8 m croak), **Dart Frog** (Dart Tongue, one 10 m lash) (§4.2) | |
| Classes (secret in v1) | **Mime Frog** (Decoy), **Echo Toad** (Replay), **Horned Frog** (Spit Out), **Glass Frog** (See-Through, 10 m), **Lily Walker** (Pad Drop), **Bell-Eater** (Swallow) (§4.2) | Make unlocks visible |
| Boons: Body | Spring Legs, Stomp, Shatter Croak (first-climb gift at door 2), Sticky Pads (§4.1) | |
| Boons: Sight | Tell-Sight, Third Eye, Firefly Sense, Sure Tongue (§4.1) | |
| Boons: Chorus | Chorus, Leapfrog, Lifeline, Shared Glow (§4.1) | |
| Boons: Risk | Deep Cheeks, Bold Belly (renamed from "Gambler's Gut"), Quick Tongue, Last Gulp (§4.1) | Quick Tongue's theft is party-only |
| Duo / Legendary | Frog Sling, Lookout, Duet, Double or Nothing / Moon Hop, Frog Choir, Time Gulp, Lucky Belly (§4.1) | Duos were tied to the Knot |
| Minigames | **lily-pad sumo**, **Frog Stack** (TEAMBOUND Babel homage), **Jar Tag** (from Snuff Tag), **Fly Catch** (§5.1) | Town activities |
| Region verbs | **Glide** (Sky), **Drift** (Space), **Light-Lag** (Beyond) (§6.3) | Sky molt later renamed **Glider molt** in `DECISIONS.md`; Tree Frog stays a class |
| Cosmetics | Skins Honeycomb, Speckled Egg, Stained Glass, Night Sky, Porcelain; hats Traffic Cone, Coiled Spring; **Candle-Toad** line; **Moon Crown** (earned only) (§7, §8.3) | |
| Voice lines | "Watch this!" / "That was on purpose." (Kestrel); "Got it!" (Moss); "Your sky was a hole."; "Every sky is someone's well." (§3.5, §6.1, §6.3) | |
| Retired or banned | "Belay or betray", KNOTSPIRE, wax, "Flies" currency, "Moon Coins" currency, "Lily Pad" as anything but a prop (§2.1, §7) | |

### Numbers

| Area | Value (section) |
|---|---|
| Health | 3 glowing back spots for every frog (4 on Easy); a hit costs 1 spot (§3.6, §3.7) |
| Lost spot | Any frog can tongue it back within **3 s**; it always returns to its owner (§3.7) |
| Revive | Hold Croak over the egg for **2 s**; return with **1 spot**; ghosts can nudge props of **5 kg** or less every **10 s** (§3.7) |
| Movement feel | Move **5 m/s**; coyote time **120 ms**; jump buffer **100 ms**; hitstop **50-120 ms**; shove impulse **6 m/s** (§5.4, §6.2, §7) |
| Hop ranks | Apex 1.4 m, charged 1.9 m → charged 2.4 m → Air Hop → charged 3.0 m + 3 m landing stomp (§4.1) |
| Tongue ranks | 3 m, props ≤ 20 kg → 4.5 m grapple → 6 m, two things at once → 8 m chain grapple (§4.1) |
| Croak ranks | Pulse 4 m → 6 m, 1 s stagger → rings 2 bells at once → 9 m Thunder Croak, 2 s stagger, never a kill (§4.1) |
| Route thresholds | Rank-II ledge **2.3 m**, anchor **4.5 m**, bell **6 m** (§3.8 #6) |
| Glow curve | Total banked for level n = **15·(n−1)(n+2)/2**: 30, 75, 135, 210, 300, 405, 525, 660, 810 for levels 2-10; max level 10 (§4.1). `DECISIONS.md` later moved Lv 10 to door 18 |
| Firefly split | **70%** clear bonus shared equally, **30%** loose; a hit spills **20%** of unbanked (§4.1) |
| Chorus | 2+ frogs within **0.3 s** (§4.1) |
| Signatures | Cooldown **15-30 s** (§4.2) |
| Boon slots | **4 passive + 1 active**; duplicates upgrade I → II → III (§4.1) |
| The Mouth | **180 m** above the well floor; angle **31° / 37° / 44° / 56° / 74°** as you rise (§6.1, §6.2 #5) |
| Readability | 8 frogs readable at **25 m** camera distance (§2.3 Gate A) |
| Threat cue | Arrives **2-5 s** before danger (§3.8 #1) |
| First session | Control ≤ **0:05**; first reward **0:20**; first laugh ≤ **0:30**; first power **~2:00**; ≤ **5** new systems before the first payoff (§3.5, §6.1) |
| Cadence | Small tick every **10-30 s**; clear **~1 min**; reward **~2 min**; rest or rank moment **~5 min**; feel target: stronger, a laugh or something bigger every **~90 s** (§3.5, §9.3) |
| Controls | **8** bindings (from 22) (§3.9) |
| Noun budget | At most about **25** coined player-facing nouns (§7) |
| Rank thresholds | E 20, D 100, C 250, B 500, A 900, S 1,400, SS 2,200, SSS 3,300 RP (§4.3) |
| Pearls | ~80-160 per full outing; Common 150, Rare 400, Epic 900, Legendary 2,000 (§4.3) |
| Stall prices | Heal 20, reroll 25, upgrade 60, Gold Key 80 Wish Coins (§7 §10.3 row) |
| Treasure odds | Gold door **5%** per slot (7% at rank B), published in-game (§3.2, §4.3, §8.2) |
| Bestiary | A hat every **4** pages; the Well has ~24 pages, the slice 12 (`DECISIONS.md` later set 14) (§4.3, §9.2) |
| Retention | Well-Rested caps at ~**3 days** and doubles rank and Pearls for **2** outings; break line after ~**90 min** (§8.4) |
| Price | **$7.99** with a gift 4-pack; Supporter Sets **$2.99-4.99**; event cosmetics return within **45 days** (§8.1-8.3) |
| Netcode | Tested at **150 ms** RTT with loss; lag compensation rewinds by RTT/2, capped at **150 ms** (§5.4 #6, §9.3) |
| Reveal | Out of the Well: first view **26 s**, repeats **8 s**, free look from **21 s** (§6.3) |
| Stop conditions | Median first power > **3:00**; "Worth it?" Yes < **60%**; > **25%** of first sessions quit mid-encounter before the fifth one (§9.3 #7) |
| Slice counts (v1) | 12 rule doors, 6 breather templates, 2 set pieces, 4 Heart doors, 2 bosses, 16 + 4 + 4 Boons, 3 × 4 verb ranks, 9 classes, 12 Bestiary pages, 4 minigames, 10 Rivals, 24 earned cosmetics + 2 Supporter Sets (§9.2) |
| Tech | Unity 6.3 LTS, URP 17 (Forward+, APV); NGO 2.x host mode + Facepunch Steam transport + Unity Transport LAN; NGO 3.0 migration with 6.7 LTS in 2027 (§9.2). The owner's v2 brief pins Unity 6000.3.25f1 and NGO 2.13.3 |

<!-- END -->
