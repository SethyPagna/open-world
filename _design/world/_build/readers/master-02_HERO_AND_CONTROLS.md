# Reader: master/02_HERO_AND_CONTROLS.md

- **Reader id:** master-02_HERO_AND_CONTROLS
- **Source:** `_design/master/02_HERO_AND_CONTROLS.md` (KNOTWELL v1, version 1.0, dated 2026-09-29, 1,475 lines). Read in full, lines 1 to 1475.
- **Read on:** 2026-09-30, for the v2 redesign (one open world, one story, 8-player co-op lobbies, no betrayal).
- **Pillar keys used below:** P1 Clear · P2 One world, one story · P3 Genuine · P4 Easy to start · P5 Organized · P6 Open world, together.

---

## Summary for the archive

`02_HERO_AND_CONTROLS.md` is the KNOTWELL v1 master spec for the player character, the Firefly Frog, and for everything the player's hands touch. It is bound by `DECISIONS.md`. It owns the body, rig, face, health, controls and every verb number.

What it decided:
- Every frog is the same 0.95 m upright bean with one capsule hitbox (r 0.30 m). Growth shows only as light: belly glow, orbiting fireflies, lit markings, and a Crown glow at Glow 10. Size never changes.
- Health is 3 back spots (4 on Easy). Every hit costs exactly one spot. Emotion lives only in the face and posture, never in the health or power channels.
- The frog mesh comes from a Blender-Python script. Animation is 100% procedural (25 bones, 7 shape keys, no clips), behind an `IHeroBody` interface, with a capsule greybox built first.
- 8 bindings: Move, Camera, Hop, Tongue, Croak, Shove, Power, Wheel. The three core verbs have exact numbers at ranks I to IV, with Awakenings (Air Hop, Long Tongue, Twin Toll) and a Mastery (Thunder Croak).
- Fairness law for tongue-on-frog mischief, the crimson "Resolve" betrayal tell, the Knot "Cut" channel, and a Down, Dark, tadpole ghost and croak-revive loop.
- 8 colour-blind-safe Seat Hues with glyphs, 12 automated tests, readability Gates A and B, and a Wick candle fallback hero.

The goal was a tiny, readable hero whose power and health the whole party can read at 25 m, in a 20-door betrayal climb up a well.

---

## Reusable for v2

### World and lore

- **The fantasy line "a small frog with a big light"** (§1). You start dim at the bottom of the well and grow brighter, never bigger. *Why it fits:* one clear story theme that every system can serve: light against the dark of the well (P2). It is simple to say in one sentence (P4).
- **Frog metres: the frog is 0.95 m, the world is dressed giant** (§2.3): a pot is 1.2 m, a door slab 6 m, the Jar 14 m, the Mouth 180 m up. *Why it fits:* makes a big open world feel huge without shrinking physics. The frog reads tiny against a large place (P6). One scale rule for every place (P2).
- **The Mouth as the landmark you look up at** (§4 look-at #4, §7.8 pitch range up to +75°, A2 idle fidget, A63). *Why it fits:* a fixed, visible goal on the skyline tells the player where the story points at every moment (P1, P2). Works as the "north star" of an open world.
- **Water is home, not a hazard** (§7.2.7, §8.6). Deep water never costs a spot; landing in water never hurts. *Why it fits:* a world rule that matches what frogs are. It is consistent and easy to learn (P2, P4).
- **Pests become light** (§7.3.2 mites pop into fireflies; §7.4.1 Thunder Croak shatters mites into fireflies). *Why it fits:* the reward is the theme itself. Clearing the dark literally feeds your glow (P2).
- **"Never a kill" on big monsters** (§7.4.1 rule monsters stagger, never die; stagger cap 4.0 s). *Why it fits:* a gentle, consistent tone. Frogs ring bells and push back the dark; they do not slaughter (P2, P3). Needs a v2 decision on what "combat" means in the open world.
- **Bells rung by croaking** (§7.4.1). *Why it fits:* one reusable world object with one clear verb. Can be the standard switch across the whole world (P1, P2).
- **Echo in the Well, silence at the Rim** (§7.4.5: 0.35 s echo at −9 dB). *Why it fits:* audio that tells you where you are in the world (P2, P6).

### Characters and design

- **H1 "growth is light, never size" and H4 lit silhouette growth** (§1, §5.2). *Why it fits:* other players can see how far someone has come at a glance, which is a core MMO feeling (P6). Fair for everyone (P3).
- **H5 channel separation: glow = power, spots = health, rim = identity, face and posture = emotion** (§1, §4). *Why it fits:* nothing on the body means two things, so every read is clear (P1). Emotion stays sincere and not mixed with stats (P3).
- **Body spec: upright bean, two eye domes, horizontal oval pupils, no lips, throat sac, belly glow patch** (§2.1, §2.2). *Why it fits:* a simple, memorable silhouette that reads from a 3/4 camera (P3).
- **Anti-Pepe rules** (§2.2): round face, no lips, no droopy lids at rest, lids never rest below 40% closed except when sad or low on spots, dart-frog colours, and a 5-cold-viewer check. *Why it fits:* protects the character's own identity (P3).
- **Default skin "Azure Dart"** (§2.2): base `#2FA4FF`, ink reticulation `#0E1726`, pale belly `#CFF3FF`, gold iris `#FFC640`. *Why it fits:* a specific, real-animal look (poison dart frog) that feels chosen, not generic (P3).
- **Frog species as skins on one rig** (§2.2 "Rivals use the same mesh"): bullfrog, tree frog, scarred toad. *Why it fits:* in v2 this becomes the way to make many distinct town NPCs cheaply on the same rig and face system (P3, P6). NPCs may vary proportions via `body.json`; player frogs keep H2.
- **The face and expression system** (§4): Calm, Joy, Fear, Focus, Dazed, Anger, Sad, HoldBreath, Down, Dark, with priorities, a 0.10 s cross-fade, and a low-spot overlay (drooping lids, belly deflate). *Why it fits:* frogs that visibly react make characters feel alive and genuine (P3). Health shows on the body, not only in a HUD (P1).
- **Blink rules** (§4): 0.12 s, 15% double-blink, intervals seeded per frog so 8 frogs never blink in sync. *Why it fits:* a small detail that makes a crowd of frogs in a town look alive (P3, P6).
- **Look-at priorities** (§4): tongue target, then a speaking frog within 8 m, then a monster cue within 12 m, then the Mouth, then camera forward. *Why it fits:* the "speaking frog within 8 m" rule is ready-made for NPC conversations in towns (P3, P6).
- **Idle fidgets** (A2): sit back and look up at the Mouth, wipe an eye, yawn into a sac balloon. *Why it fits:* personality with no words (P3), and it points at the story goal (P2).
- **Free emotes** (A47): Wave, Belly Drum, Raspberry, Flop. *Why it fits:* friendly, readable ways to greet strangers in a shared world (P6, P3).
- **Frog Stack and Leapfrog: standing on another frog's head** (§2.1 hitbox top is standable, §7.1, A21). *Why it fits:* a playful co-op move anyone understands (P6, P4).

### Frog mechanics

- **Three core verbs: Hop, Tongue, Croak** (§6, §7). *Why it fits:* a very small verb set with a strong frog fantasy. Each verb is a real frog behaviour (P2, P4).
- **The one hop rule: move to hop, stand to leap** (§7.2.2), with coyote time 0.12 s and jump buffer 0.10 s (§7.2.1). *Why it fits:* running hops feel instant; the big leap is a deliberate "stop, crouch, leap" (P4). Still an open A/B question in v1 (§15 #4).
- **Arc preview after 0.15 s of charge, only you see it** (§7.2.2), and the spit arc preview (§7.3.4). *Why it fits:* shows exactly where you will land before you commit (P1).
- **Scramble ledge grab, 0.20 s** (§7.2.5). *Why it fits:* forgiving traversal for new players (P4).
- **Swim and water hop** (§7.2.7). *Why it fits:* rivers, ponds and lily pads can be open-world travel routes (P6).
- **Glide** (§7.2.8): fall speed cap 2.5 m/s, 2.0 s per airborne phase, refills on touchdown, wall latch or grapple; gravity is never changed. *Why it fits:* a traversal unlock for a big world (P6). Keep the unlock; drop the "molt resets you to Lv1" part (see Conflicts).
- **Grapple zip to tongue anchors** (§7.3.2, rank II+; chain grapple at IV). *Why it fits:* fast, fun travel through a vertical world (P6).
- **Tongue as the single "use" verb** (§7.3.2): grab, gulp, carry, pull levers, interact, catch. *Why it fits:* one button for "do something with that thing" keeps controls organized (P5, P4). Needs a visible prompt label (see Conflicts).
- **Target weights where saving a friend beats everything** (§7.3.2: catch and spot orb 2.0, interactable 1.25, lever and edible 1.1, carryable and anchor 1.0). *Why it fits:* the game quietly helps you help others (P6, P3).
- **Catch a falling friend** (§7.3.2, A28): reel them in at 10 m/s, cancel fall damage, both frogs get Joy. *Why it fits:* the best co-op moment the body makes. Kind, readable, and works with strangers (P6, P3).
- **Co-carry: two tongues on one prop add capacity to 40 kg** (§7.3.2). *Why it fits:* light co-op task that needs no talking (P6).
- **Two-Frog Door: needs 400 N, so two frogs pushing at once** (§7.1). *Why it fits:* a simple co-op puzzle for drop-in players. In v2, push with Move, not with Shove.
- **Croak pulse, sustain, and Chorus** (§7.4.1, §7.4.2, §7.4.4): 2+ frogs pulsing within 0.30 s and 8 m make a Chorus. *Why it fits:* the purest "together" mechanic: strangers in a town can join a Chorus by pressing one button at the same time (P6).
- **Each player croaks on its own pentatonic degree, so any two croaks harmonise** (§5.6). *Why it fits:* 8 players in one place still sound good together (P6, P3).
- **Revive by croaking over an egg; two revivers add progress; progress decays instead of resetting** (§7.4.3). *Why it fits:* clear co-op rescue with one verb (P6, P1).
- **Stagger cap law: 4.0 s immunity after any stagger** (§7.4.1). *Why it fits:* protects big encounters from being trivialised by 8 players (P6).
- **The `tongueOnFrogs = false` rule** (§7.11 #9): the tongue ignores other players, except catch and haul, which only save. *Why it fits:* this v1 fallback is the right v2 default. Players can only help each other with the tongue (P6, P3).
- **Haul a clinging or dangling friend at 2.0 m/s** (§7.11 #4). *Why it fits:* rescue-only interaction (P6).
- **Health: 3 spots, every hit costs exactly 1, nothing costs 2, no regeneration on its own** (§8.1). *Why it fits:* one number anyone can count (P1, P4).
- **Spot orb: a lost spot pops out and hovers 3.0 s; tongue it or touch it to get it back** (§8.2). *Why it fits:* turns taking damage into a small, readable chance to recover, alone or with friends (P1, P6).
- **Down with "Catch it!" for 3.0 s** (§8.3). *Why it fits:* a clutch co-op save with one world prompt. Keep only if it tests clear (v1 §15 #2 says the same).
- **Fall rules: 3 m splat with no damage, 6 m or more costs 1 spot; water, glide and catches never hurt** (§7.2.9, §8.6). *Why it fits:* simple, fair traversal risk (P1).
- **Last-safe-ground respawn**: sampled every 0.25 s, 0.6 m from drop edges, ring buffer of 8 (§8.6). *Why it fits:* falling off never sends you far back, which keeps the learning curve low (P4).
- **Unstuck: teleport to last safe ground, free, 30 s cooldown** (§6). *Why it fits:* no player gets stuck in an open world (P4, P5).
- **Noise radii for landings, croaks and spits** (§7.2.9, §7.4.5) feeding a NoiseBus. *Why it fits:* one consistent stealth and creature rule across the world (P2).

### Controls and UI

- **Move, Camera, Hop, Tongue, Croak, Wheel as the core layout** (§6), with keyboard, Xbox/Steam Deck and PlayStation columns. *Why it fits:* 6 bindings cover the whole game if Shove and Power are cut or deferred (P4, P5).
- **Pause shows the map** (§6, DECISIONS §8.2 #13). *Why it fits:* the map is 1 input away (P5, P1).
- **Wheel: tap = Look ping, double-tap = Danger ping, hold = 8-slot radial of quick lines and emotes** (§7.7). Danger ping uses a black-and-white hazard ring, no colour. *Why it fits:* strangers can talk without typing; everything is inside one button (P5, P6).
- **Quick lines: Here!, Go!, Wait!, Help!, Nice!, Sorry!, Watch this!, Thanks!** (§7.7). *Why it fits:* short, human phrases (P3, P6).
- **Reach glints** (§7.10): the first time a ledge, gap or anchor becomes reachable with your new rank, it sparkles once in your Glow colour; lanes you cannot use yet stay unmarked, with no nag icons. *Why it fits:* shows "you can go there now" in an open world without clutter (P1, P6).
- **The System line on every rank-up, with its cause** (§7.9), for example `[ HOP II ] Leap 2.4 m. Because: you hopped 31 times.` *Why it fits:* the player always knows what changed and why (P1). Makes progress feel earned and fair.
- **Accessibility settings** (§6): hold-to-toggle for every hold, tongue aim assist 0 to 100% (default 50%), FOV 50 to 90, reduced motion, text size 100 to 150%, full rebinding. *Why it fits:* lowers the barrier to start (P4).
- **Follow camera** (§7.8): 4.5 m distance, 1.1 m pivot, +0.35 m shoulder offset, FOV 60, pitch 18° down, with context offsets for charge, zip, cling and swim. *Why it fits:* tested defaults that keep the frog and the Mouth in view (P1).

### Progression

- **Glow Level 1 to 10 on the body** (§5.2): fireflies in orbit = level − 1; markings light at Lv 4, 6, 8, 10; light range 2 to 6 m; Crown glow at Lv 10. *Why it fits:* progress you and others can see in the world, which pushes the dark back as you grow (P2, P6).
- **Three power tiers: Dim (1 to 3), Glowing (4 to 9), Haloed (10)** (§5.5). *Why it fits:* three words anyone can learn (P4, P1).
- **Every level-up shows on the body** (§5.2): one firefly swoops into orbit, the belly steps up, the light reaches further. *Why it fits:* a fun, fair, visible reward loop (P1).
- **Verb ranks I to IV with one named Awakening per verb** (§7.9): Air Hop, Long Tongue, Twin Toll, then Thunder Croak. *Why it fits:* abilities that open new parts of one world, like a gentle metroidvania (P6, P2). The number of layers must shrink (see Conflicts).
- **Awakening body parts** (§5.3): spring heels on the feet, a glowing tongue tip, a bigger throat sac. *Why it fits:* each new power is visible on the frog (P1, P3).
- **Class markings in the skin mask** (§5.4). *Why it fits:* the owner wants light classes; markings can show a player's class to others (P6). Drop the "in-climb reveal".
- **Awakening ceremony, 1.8 s, with no input lock** (A59). *Why it fits:* celebration that never takes control away (P4).

### Art

- **Toon material: 3-band ramp, Fresnel rim, 2 px outline at 1080p** (§3.4). *Why it fits:* a clean, readable style an agent team can hold to (P3).
- **Per-frog values through `MaterialPropertyBlock`** (§3.4). *Why it fits:* keeps the SRP Batcher intact with 8 players and many NPCs (P6).
- **Spot material: lit = filled disc, lost = hollow ring; lost spots flicker at 6 Hz for 1.0 s** (§3.4). *Why it fits:* reads by shape, not only colour (P1, accessibility).
- **Tongue colour coral `#FF9A7A` with a pale tip `#FFD0BC`** (§3.4). *Why it fits:* a specific, warm colour choice (P3).
- **Glow colour default `#FFE27A`** (§3.4). *Why it fits:* the one colour of "light" in the world (P2).
- **Sockets: Hat, Face, Back (gameplay only), Belly, Neck, Tag, TongueOrigin, SacCenter, hands, feet, OrbitCenter, CrownCenter, Membrane_L/R, Helmet** (§3.3), with hat and face envelopes. *Why it fits:* every hat fits every frog and every form, which the cosmetic shop needs (P5).
- **Cosmetic guardrails** (§5.7): cosmetics never touch the spots, rim or glow emission, never change the hitbox, never add a collider; Glow colours need luminance ≥ 0.6; hats pass the spot-occlusion test. *Why it fits:* a fair cosmetic shop where paying never hides information (P1, P3).
- **Squash-and-stretch and spring values** (§9.3, §9.4). *Why it fits:* tested "feel" numbers that make the frog satisfying to move (P3, P4).
- **The animation list, minus party rows** (§9.6): A1 to A29, A32 to A42, A45 to A58, A60, A62 to A65. *Why it fits:* a complete, agent-buildable move set for a co-op frog.
- **Hatch as the first thing the player does** (A62): 3.0 s egg wobble, crack, tadpole, froglet, then control. *Why it fits:* control within seconds of starting, inside the story (P4, P2).
- **Juice table** (§10): hitstop, camera impulse, particles and sound cue per event, with a shake budget ≤ 0.15 and none in reduced motion. *Why it fits:* consistent feedback for every action (P1).

### Audio

- **Sound cue names** (§10): `hop_land`, `leap_land`, `charge_ready`, `tongue_thwap`, `gulp` (pitch rises with the count), `catch_chime`, `croak_{seatDegree}`, `thunder`, `spot_pop`. *Why it fits:* ready naming for the audio list (P5).
- **Frogs croak with the mouth closed** (§4, A35). *Why it fits:* a true animal detail that makes the frog feel real (P3).

### Tech

- **`IHeroBody` interface; systems never talk to frog parts** (§3.5). *Why it fits:* the same contract can drive player frogs and NPC frogs. Lets agents build and test in parallel.
- **`CapsuleHeroBody` greybox that already shows every readout** (§3.5). *Why it fits:* playable from week 1, as the method skill's "fun first" rule wants.
- **Mesh from `build_frog.py` reading `body.json`** (§3.1): a proportion change is a JSON diff plus a re-run, with asserts on height, sockets, triangles and shape keys. *Why it fits:* an agent-friendly art pipeline for a tiny human team. Can also generate NPC body variants.
- **100% procedural animation with no clips, in a fixed 10-layer stack; budget 0.08 ms per frog** (§9.1, §9.2). *Why it fits:* diffable, testable by agents, and cheap enough for 8 players plus NPCs.
- **Ragdoll layer is local only, never networked; hitstop is local only, never a global `timeScale`** (§3.6, §9.2, §10). *Why it fits:* correct rules for NGO host mode with 8 players.
- **Replicated state list** (§3.6): spots, life, glow level, ranks, awakenings, charge, grip, tongue phase and tip at 1 cm, cosmetics; croaks as unreliable RPCs with a host timestamp. *Why it fits:* a small, known network footprint.
- **Tongue lag compensation** (§7.11 #7): rewind by RTT/2 capped at 150 ms, earliest input timestamp wins, host input delayed by median client latency. *Why it fits:* fair shared-object grabs between co-op players.
- **One input action map generated from `bindings.json`; press and release timestamps read in code; bots emit the same `FrogInput` struct** (§6). *Why it fits:* agents never hand-edit the input asset; test bots play with the same controls.
- **Numbers in data files** (`verbs.json`, `motor.json`, §7) read by rooms, bots and tests. *Why it fits:* one source of truth (P5).
- **Tests to keep** (§11): T1 hop kinematics, T2 lane validator, T3 hitbox invariance, T4 player-colour rules, T5 cosmetic guard, T6 hat occlusion, T7 readability sheet, T9 stagger cap, T10 body contract, T11 animation budget, T12 no clips.
- **Readability gate method** (§12 Gate A): 8 frogs at 25 m, 20 slides, 3 s each, pass thresholds (90% health reads, 85% tier reads, no Pepe association among 5 cold viewers). *Why it fits:* a real test for "readable, memorable designs" (P3, P1).

---

## Party-only (to archive)

- **The Resolve tell** (§4 priority 3, §3.4, A30, A43): the crimson tongue tip `#FF3D6E`, lean toward the target, host-forced for at least 0.6 s on any betrayal action.
- **Betrayal crimson as a reserved hue** (§3.4, §5.6, §5.7 rule 2, T4, T5): every Seat Hue and cosmetic kept ≥ 15° from 345°, and the tongue colour chosen 29° away, only so the betrayal tell is never ambiguous.
- **The Mimic's sideways blink** (§3.2, §4): `Nict_*` bones used only by Doppelfrog's Mimic, a hidden-identity tell.
- **The Knot and the Cut** (§5.4 Knot thread, §6 Shove hold 1.2 s, §7.5, §7.7 "Knot?" slot, A31, A43, A44, §10 "Cut completes"): tethered partners, the Cut channel, the "hold on" counter, `CutSnap`, the thread flashing crimson, and the partner's faster 1.0 s revive and through-wall egg view (§7.4.3, §8.4).
- **Sad triggered by a partner Cutting you** (§4 priority 9).
- **Tongue mischief on other frogs** (§7.3.2 "Other frog", §7.11 #1 tug up to 1.0 m, A29).
- **Heart doors** (§7.5, §7.11 #2 and #5, §5.4 cheek glow purpose): full yank, steal after 0.6 s, dropping carried items on shove, unguarded ledges, Quick Tongue 5 m steal range, and firefly spills not returned.
- **Frog Sling** (§7.11 #8): a 12 m partner launch tied to the Knot.
- **Shove as frog-on-frog mischief** (§6 binding 6, §7.5): the 6.0 m/s belly bump on players, the per-victim rate cap, and the Anger reaction to being shoved.
- **Mischief shield and blame** (§7.5, §5.6): no spot lost within 2.0 s of another frog's shove or tug, blame tags, culprit motes as room evidence.
- **The WANTED poster on the Tag socket** (§3.3).
- **Rivals as betraying bots** (§2.2, §3.3 Rival badge, §4 "any Rival betrayal action", §8.2 Rival "Got it!" bark, §8.6 seat handover). The seat-filling bot idea belongs to the party game; any v2 NPC helpers need a fresh design.
- **Vote items and the Meeting Door window** (§7.3.4, §8.4 "03 G7").
- **"Tonguing Kestrel off his pad" as the first laugh** (§7.11 #1).
- **Betrayal outcomes server-authoritative from day 1** (§7.11 #7), as a reason; the lag-compensation method itself is reusable.
- **HoldBreath freeze-cue rooms** (§4 priority 5, A55): a room gag for the door climb. The expression can stay; the rule-room use is party material.
- **The Betrayal Cam and barks** (header, owned by 03).

---

## Conflicts with the new pillars

- **8 bindings, each with tap, hold, double-tap and context meanings** (§6). Hop alone has 6 contexts; Power has press vs 0.30 s hold; Wheel has tap, double-tap and hold; Shove hold becomes Cut. **P4, P1.** Too much to learn in 5 minutes. v2 should aim for Move, Camera, Hop, Tongue, Croak, Wheel and Menu, with Shove and Power cut or deferred.
- **Tongue target rules with 11 target types, checked in a hidden order with hidden weights** (§7.3.2). **P1.** The player cannot see what a lash will do. Keep the logic, but show a short action label on the soft-locked target ("Pull", "Carry", "Talk").
- **Too many progression layers on one frog** (§5.2 to §5.4, §7.6, §7.9): Glow Level, verb ranks I to IV, Awakening, Mastery, Boons with 5 families and bead colours, Signatures, Duos, Legendaries, classes, molts. **P4, P5.** Needs a wiki. v2 should pick one visible level axis plus a few named abilities.
- **Boons as run pickups** (§5.4 Boon beads, §7.6 Power). **P2, P6.** Run-based rewards that vanish between climbs do not fit a persistent world.
- **Molts that re-hatch you at Lv1** (A65, §7.2.8 citing DECISIONS §4; molts Froglet, Glider, Moon Toad, Beyond). **P6, P1.** A roguelite reset breaks persistent progress. Keep Glide as an unlock; drop the reset.
- **Door-based structure baked into rules** (§1 "door 18", §8.5 door clear, room failure, Team Lives, E doors, Heart doors, Landings as the only full restore; §14 Quick Climb doors 0 to 10; ★1, the Rim, Sky Preview). **P2, P6.** v2 is one connected world, not 20 doors.
- **Difficulty tiers that change health** (§8.1: Easy 4 spots, Normal, Hard, Hell with Team Lives 3, 2, 1). **P4, P6.** In a shared drop-in world, players in one lobby would play under different rules. Needs one world rule.
- **Death as four states: Down, Dark, egg, tadpole ghost, then re-hatch** (§8.3, §8.4, A49 to A52). **P4, P1.** Many new nouns for one outcome. The ghost only works "inside the room", and a solo player has no one to revive them. v2 needs a solo-safe fallback, for example re-hatch at the nearest lantern or town.
- **Tadpole ghost limited to the room** (§8.4, §7.8 "free orbit within the room"). **P2, P6.** There are no rooms in an open world.
- **Cheek glow for "unbanked" fireflies, banked only at door clear** (§5.4, A56). **P1.** "Unbanked" is a hidden rule tied to the door loop. If v2 keeps banking, the bank must be a visible place in the world.
- **In-climb class reveal** (§5.4, A61). **P1.** Hidden information about other players. The owner wants light, visible classes.
- **Seat Hue tied to seat index, host is always Orange** (§5.6). **P6, minor.** Fine for an 8-player lobby, but "seat" is party language. Call it "player colour" and keep the 8 hues and glyphs.
- **The crimson hue ban on cosmetics** (§5.7 rule 2). **P5, P2.** It limits the cosmetic shop only to protect the betrayal tell. Drop it, or reuse the reserved hue for one clear "danger" meaning.
- **No sprint, 5.0 m/s top ground speed** (§7.1). **P6, risk.** Right for rooms. In a large open world, walking may feel slow. v2 needs travel options (swim routes, grapple lines, glide, lantern fast travel) before adding sprint.
- **Grip stamina on tagged walls** (§7.2.6, §5.4 Grip ring). **P4, minor.** An extra meter with drain rates. Fine as a later-area mechanic; not in the first hour.
- **Health spots only 5.6 px at 25 m** (§5.1, §12, §15 #5). **P1.** v1 itself called this tight. In a busy world with NPCs, mirror spots as pips on the name tag (the v1 open idea).
- **The Wick candle fallback hero** (§13, §12 Gate B). **P2.** The owner decided to keep the frog. A second hero form splits the world's identity. Archive it; the Candle-Toad cosmetic idea can stay as a skin.
- **Jargon in player-facing text** (§7.9 System lines, §7.7, §8.3): Awakening, Mastery, Boon, Signature, Duo, Knot, Molt, Froglet, Beyond, Team Lives. **P4, P3.** Each new noun is a small wall. Keep a short glossary of at most a handful of player-facing words.
- **The Jar picks the brightest frog** (§5.2). **P2, open question.** Being strong making you a target can feel unfair in co-op. Decide if light should ever be a liability in v2.

---

## Key numbers and names

### Body and fairness
| Item | Value | Where |
|---|---|---|
| Frog height | 0.95 m to the top of the eye domes | §2.1 |
| Hitbox | capsule r 0.30 m, height 0.95 m, centre (0, 0.475, 0), identical for every player frog | §1 H2, §2.1 |
| Weight | 25 kg | §2.1 |
| Health | 3 back spots, fixed knock-out order Right, Left, Top; restore in reverse | §5.1 |
| Spot disc | r 0.075 m (0.095 after remediation), dark ring 0.015 | §2.1, §12 |
| Rig | 25 bones, 7 shape keys | §3.1, §3.2 |
| Triangles | body 3,000; LOD0 about 5,600, LOD1 2,200 (12 m), LOD2 900 (30 m) | §3.1 |
| Draw budget | 4 materials, ≤ 6 draw calls, 1 point light with no shadows per frog | §3.4 |
| Animation CPU | ≤ 0.08 ms per frog | §9.2 |

### Movement
| Item | Value | Where |
|---|---|---|
| Ground speed | 5.0 m/s; accel 30, decel 40 m/s²; turn 720°/s; step 0.30 m; slope 45°; no sprint | §7.1 |
| Swim / wade | 3.0 / 3.5 m/s | §7.1, §7.2.7 |
| Gravity | rise 20, fall 26 m/s²; terminal 18 m/s | §7.2.1 |
| Coyote / buffer | 0.12 s / 0.10 s | §7.2.1 |
| Charge | 0.10 s to 0.45 s; arc preview after 0.15 s | §7.2.2 |
| Hop apex by rank | tap 1.40 m; charged 1.90 / 2.40 / 2.40 + Air Hop / 3.00 m | §7.2.3 |
| Max gap by rank | 4.5 / 5.5 / 7.9 / 9.2 m | §7.2.3 |
| Air Hop | +1.0 m (vy 6.32 m/s), one per airborne phase | §7.2.4 |
| Scramble | 0.10 m margin, 0.20 s | §7.2.5 |
| Glide | fall cap 2.5 m/s, top speed 6.5 m/s, 2.0 s per airborne phase | §7.2.8 |
| Falls | ≥ 3 m splat, ≥ 6 m −1 spot; water, glide and catches never hurt | §7.2.9, §8.6 |

### Tongue and Croak
| Item | Value | Where |
|---|---|---|
| Tongue range by rank | 3.0 / 4.5 / 6.0 / 8.0 m | §7.3.3 |
| Tongue speed | 40 m/s out, 45 m/s back, 0.30 s cooldown | §7.3.1 |
| Carry | ≤ 20 kg alone, 40 kg co-carry at 2.5 m/s | §7.3.2 |
| Catch | reel at 10 m/s, 120 ms hitstop | §7.3.2 |
| Grapple zip | 12 m/s; refills Air Hop and Glide | §7.3.2 |
| Croak radius by rank | 4 / 6 / 6 / 9 m; cooldown 0.8 s (1.2 s at IV) | §7.4.1 |
| Sustain | up to 4.0 s, then 1.0 s lockout; move at 3.0 m/s | §7.4.2 |
| Revive | hold Croak within 1.5 m of the egg for 2.0 s; two revivers 1.0 s | §7.4.3 |
| Chorus | 2+ frogs within 0.30 s and 8 m | §7.4.4 |
| Stagger immunity | 4.0 s after any stagger | §7.4.1 |

### Health timings
| Item | Value | Where |
|---|---|---|
| Hit | 80 ms hitstop, Dazed 0.6 s, 1.0 s invulnerability | §8.2 |
| Spot orb | lives 3.0 s, returns home at 12 m/s | §8.2 |
| Down | 3.0 s, "Catch it!" | §8.3 |
| Void respawn | 1.5 s at last safe ground | §8.6 |
| Unstuck | free, 30 s cooldown | §6 |

### Glow and colour
| Item | Value | Where |
|---|---|---|
| Glow Level | 1 to 10; fireflies in orbit = L − 1; markings at 4, 6, 8, 10; light range 2 to 6 m | §5.2 |
| Tiers | Dim 1 to 3, Glowing 4 to 9, Haloed 10 (Crown: 12 fireflies) | §5.5 |
| Default skin "Azure Dart" | `#2FA4FF` base, `#0E1726` ink, `#CFF3FF` belly, `#FFC640` iris | §2.2 |
| Glow default | `#FFE27A` | §3.4 |
| Spot lit | core `#FFD24A`, centre `#FFF6D6`; lost = hollow ring `#3A2F22` | §3.4 |
| Tongue | `#FF9A7A`, tip `#FFD0BC` | §3.4 |
| Betrayal crimson (archive) | `#FF3D6E`, hue 345° | §3.4 |

**Player colours (v1 "Seat Hues")**, Okabe-Ito based, minimum pairwise CIEDE2000 10.9 across colour-vision simulations (§5.6):

| # | Name | Hex | Glyph |
|---|---|---|---|
| 0 | Orange | `#E69F00` | circle |
| 1 | Sky | `#56B4E9` | triangle |
| 2 | Green | `#009E73` | square |
| 3 | Lemon | `#F0E442` | star |
| 4 | Blue | `#1A6FD6` | hexagon |
| 5 | Vermilion | `#D55E00` | cross |
| 6 | Orchid | `#CC79A7` | crescent |
| 7 | White | `#F4F4F4` | teardrop |

Glyphs avoid card suits (§5.6).

### Camera
Distance 4.5 m, pivot 1.1 m, shoulder +0.35 m, FOV 60 (50 to 90), pitch 18° down, range −60° to +75° (§7.8).

### Names worth keeping consistent
- **Hero and body:** Firefly Frog, Azure Dart, spots, Glow, fireflies, Crown glow, throat sac, belly glow, froglet, egg, Hatch, tadpole.
- **Verbs and powers:** Hop, Tongue, Croak, Air Hop, Long Tongue, Twin Toll, Thunder Croak, Chorus, grapple zip, Scramble, Glide, catch, haul, spit.
- **World:** the Well, the Mouth (180 m up), the Rim, the Sky, Landings, the Jar, the Keeper, mites, bells, lily pads, Pearls (a protected currency, §7.11 #5).
- **Frog species (skins or classes in v1):** Tree Frog, Dart Frog, Horned Frog, bullfrog, scarred toad, Moon Toad, Candle-Toad.
- **Emotes:** Wave, Belly Drum, Raspberry, Flop.
- **Tech:** `IHeroBody`, `HeroState`, `HeroMotor`, `FrogInput`, `CapsuleHeroBody`, `FrogHeroBody`, `ToonHero.hlsl`, `build_frog.py`, `body.json`, `verbs.json`, `motor.json`, `bindings.json`, `LaneGlint`, `RespawnAnchor`, `GripSurface`, `TongueAnchor`, NoiseBus, PrimeTween, Cinemachine 3.

<!-- END -->
