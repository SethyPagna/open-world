# Reader notes: master-09_ART_UI_AUDIO

Source: `_design/master/09_ART_UI_AUDIO.md` (1,700 lines, read in full). KNOTWELL v1, version 1.0, 2026-09-29, marked BINDING for look, screens and sound.
Reader: master-09_ART_UI_AUDIO. Written 2026-09-30 for the v2 redesign (one open world, one story, co-op MMO feel in 8-player Steam lobbies).

Section numbers below (§x) point into the source file.

---

## Summary for the archive

`09_ART_UI_AUDIO.md` is KNOTWELL v1's presentation master file. It covers everything the player sees and hears. That means the colour tokens (`palette.json`) and the toon look in URP 17: custom HLSL toon shading, inverted-hull outlines, self-lit "glow chalk" tells, fog, skies and post. It also covers a lighting recipe (`MoodDef`) for every room type and the art side of the Firefly Frog, the 10 Rivals and the 14 monsters. It has a procedural animation list with no keyframes, the Shuriken VFX list, the Cinemachine 3 rigs and shake presets, and the juice values. On the UI side it covers the System window, the UI Toolkit tech, the fonts, wireframes of 16 screens and accessibility. The audio plan has a mixer, a step-sequencer music director, a pentatonic croak system, positional tells with captions, and an SFX list built from synth recipes and CC0 packs. The file ends with the logo, capsule and trailer specs and 13 build tests.

Its main decisions:
- The look is "a glow-in-the-dark storybook diorama".
- Growth shows as light on the frog's body.
- Ten readability laws keep danger readable in the dark: self-lit tells with a sound and a caption, the 25 m rule, and no flashing faster than 3 Hz.
- Crimson `#FF3D6E` is reserved for betrayal.
- There are 8 Seat Hues, checked for colour blindness, and each one carries a shape glyph.
- Every croak is a note in the layer's pentatonic scale, so 8 frogs always sound good together.
- Hitstop is local and visual only.
- There are no spoken words.
- Music and most SFX are synthesised in-house.
- The shop has no timers and no casino sounds.

The goal was a dark, run-based party climber that stays readable, feels chunky and plays fair.

---

## Reusable for v2

Each row says where the idea is in the source and which v2 pillar it serves (P1 Clear, P2 One World One Story, P3 Genuine, P4 Easy to Start, P5 Organized, P6 Open World Together). "Adapt" means it needs a change for an open world.

### World and lore

| Item | Where | Why it fits v2 |
|---|---|---|
| **The frog-in-a-well theme as the one story.** The Noto Serif KR subset spells 우물 안 개구리 and 井底之蛙 on a statue inscription. This is the proverb about a frog at the bottom of a well who thinks the sky is only as big as the opening above ([wordrow.kr](https://wordrow.kr/basicn/en/meaning/70763_%EC%9A%B0%EB%AC%BC%20%EC%95%88%20%EA%B0%9C%EA%B5%AC%EB%A6%AC%5B%EA%B3%A0%EA%B8%B0%5D/); [seouldiscovery](https://seouldiscovery.wordpress.com/2011/04/30/frog-in-a-well-story-%EC%9A%B0%EB%AC%BC-%EC%95%88%EC%9D%98-%EA%B0%9C%EA%B5%AC%EB%A6%AC-%EC%9D%B4%EC%95%BC%EA%B8%B0/)) | §12.4 (fonts), §5.3 | P2: one theme that every place, quest and reward can serve: learning the world is bigger than your well. It is already on screen in v1, so v2 can put it at the centre of the story |
| **"Your sky is somebody's floor."** The trailer card line, and the idea that "every sky is another well" | §16.3, intro point 4 | P2: a one-line story spine for a world with layers stacked on each other (Well → Sky → Space → Beyond) |
| **The Mouth**: the round opening of sky 180 m overhead that widens as you rise, and the light pillar down the shaft | §5.3, §4.7, §13.1 | P1 and P2: a landmark visible from everywhere, so a player always knows which way is "up and onward". Also the story's goal made visible |
| **Sky colour tied to progress**: afternoon at the bottom to stars and moon at the top (4 keyframes) | §5.3 | P2 and P6: adapt it into a shared day/night cycle, or a sky that changes with each story chapter |
| **The four layers and their palettes** (Well: moss and lanterns in stone; Sky: pastel islands under a painted dome; Space; Beyond) | §5.4 | P2: ready-made region palettes and a long-term world arc. Adapt Space so it stays in the storybook look (see Conflicts) |
| **The lantern-folk**: 12 anonymous warm points at the well's lip, a far crowd murmur on Landings | §5.3, §15.8 `amb_landing` | P6 and P2: a people who already exist in the lore. They can become the townsfolk of v2's towns |
| **Two mood families**: "Dread" (cold, dark, dense fog, glowing dangers) and "Waltz" (warm lanterns `#FFB86B`, saturated, music box and marimba) | §1.2 | P1: in an open world this becomes "safe town = warm light and waltz, wild danger = cold light and drones". Players read safety from colour and sound without a tutorial |
| **Monsters are never killed.** On a clear they sleep, kneel, flee, sink or get herded, and each has a funny clear pose | §6.3 | P3 and P2: a gentle, sincere tone that fits a storybook pond world and a young audience. It gives every creature a personality |
| **The Jar (Warden)**: a 14 m glass jar holding thousands of trapped fireflies. When its lid pops, every firefly streams up the shaft | §6.3 row 14, §8 `vfx_jar_release` | P2: a strong story climax for Act 1: free the trapped light and open the way up |
| **Creature roster with pond-life identity**: Bell-Golem (bronze, turret-like), heron shadow, pike, fog eel, snapping turtle, blind olm "hunter", Lamp-Knight, water snake, Moss Snail, Web Spider, the giant sleeping toad | §6.3, "Other creatures" | P2 and P6: open-world creatures and field bosses that belong in a well. Each already has a silhouette, palette, tell and clear pose |
| **Small life**: moths and bell-beetles that pop into fireflies, clay pots with glowing cracks, the ladybird-like heal bug | §6.3 "Other creatures" | P6: ambient life and simple pickups that make a world feel lived in |
| **The Bestiary as a paper book** (paper `#F2E3C2`, ink `#3A2A1A`, stamps SEEN / SURVIVED / CLEARED) | §13.13 | P2 and P5: an in-world journal. Adapt: rename the "Tower's records" so the book belongs to the well's people |

### Characters

| Item | Where | Why it fits v2 |
|---|---|---|
| **Firefly Frog readouts**: "Fragile" = 3 back spots (filled disc when lit, hollow ring `#3A2F22` when out); "Strong" = belly glow, orbiting fireflies, lit markings, Crown glow | §6.1 | P1 and P4: health and power read from the body itself, by shape as well as colour, with no numbers needed |
| **Growth by level, Lv1 to Lv10**: belly emission 0.6 → 3.4, orbiters 0 → 9, markings 0/10 → 10/10, first visible bloom at Lv3, Crown glow at Lv10 (12-mote ring) | §6.1 table | P3 and the fair-progress goal: "you can see yourself get stronger". Other players can see it too, which gives an MMO feel (P6) |
| **Emotion never uses glow, spots or rim.** Faces and posture carry it. At low health: pupils shrink to 60% and a sweat drop falls. No drooping lids | §6.1 | P3: keeps the character readable and sincere (the "anti-Pepe" rule) |
| **Visible body upgrades**: glowing tongue-tip bead (Tongue III), foot bands (Hop III), a bigger sac with rings (Croak III), the Glider molt membranes, the Moon Toad helmet | §6.1 | P1 and P3: every upgrade is a visible part of the body, not a hidden stat |
| **The 10 Rivals as a cast**: Moss, Brother Brass, Pip, Vex, Maud, Gutter, Kestrel, Ines, Pell, Lumen, each with a species, skin hex, idle quirk and voice pitch | §6.2 | P3 and P6: ten specific, readable personalities ready to become town NPCs, quest givers or companions. Examples: Pip hops every 3 s and stays near a player; Pell reads plaques; Lumen stands 3 m apart facing away. Adapt: drop their bot-seat role (see Conflicts) |
| **Recognisable at 25 m by three things**: hat silhouette, idle quirk, name tag | §6.2 | P3 and P1: a good rule for every named NPC in v2 |
| **Shape language**: round = friendly-ish, angular = threat | §6.3 | P1: one simple visual rule for friend or danger |
| **Silhouette-first monsters**: each is unique at 64 px tall | §1.3 R7, §17 `SilhouetteTests` | P1 and P3: memorable designs, testable by a build check |
| **Default frog**: Azure Dart `#2FA4FF` with a glowing belly | §16.2 | P3: a clear hero image to keep |
| **The Wick fallback**: the same verbs and readouts on a candle body, if frog art fails its gate | §6.1 | Risk plan only: keep it as a documented contingency |

### Frog mechanics (the art and audio side)

| Item | Where | Why it fits v2 |
|---|---|---|
| **Three verbs**: Hop (tap, charged, Air Hop), Tongue (lash, grapple, carry), Croak (tap, hold, rank-ups). Each has a clear body tell (cheek puff 0.25 s before a lash) | §7.1 | P4: a small, learnable kit. One button per verb |
| **Chorus**: 2+ frogs croaking within 0.3 s makes a chord and a gold ring | §7.1, §8 `vfx_chorus`, §15.4 | P6: a cooperative social action strangers can do without talking. It is the "meet other players" moment |
| **Revive**: hold Croak over a downed friend's egg for 2 s; the egg answers with a rising 5-note arpeggio and pops | §7.1, §13.9, §15.4 | P6: a friendly drop-in co-op beat. Anyone passing by can help |
| **Down state**: the frog curls into an egg, and a tadpole ghost wriggles out with a gentle "underwater" mix | §6.1, §13.5 ghost HUD, §15.2 Ghost snapshot | P3 and P4: a soft, readable fail state. Adapt: in an open world, respawn at the nearest town or lantern |
| **Knocked-out spot orb** that always returns to its owner and can be caught by a friend | §6.1, §8 `vfx_spot_catch` | P6: a small help-your-friend moment. Keep it only if it stays simple |
| **Sonar croak**: a croak in a dark maze paints the walls as glowing lines for 1.5 s | §8 `vfx_sonar_ring` | P2: croak as a way to explore dark places. It fits a well world |
| **Glide and Cling** (Glider molt, Sticky Pads with grip shiver under 25%) | §7.1, §8 | P6: traversal verbs that suit an open world with height |
| **Tongue to choose**: take a Boon orb or buy at the stall by tonguing it | §13.8, §13.12 | P5 and P4: the world is the menu. No extra binding to learn |

### Art and rendering

| Item | Where | Why it fits v2 |
|---|---|---|
| **The one-line look**: "a glow-in-the-dark storybook diorama". Chunky toon frogs and monsters, dark stone where only living things and dangers glow, warm lantern-lit rest places | §1.1 | P2 and P3: one consistent art direction that an agent team can follow |
| **Ten readability laws (R1 to R10)**: value ladder, saturation split, reserved colours, self-lit tells with sound and caption 2 to 5 s before danger, the 25 m rule (contrast ≥ 3:1), fog never eats a tell, silhouette first, one focal point per cue, frogs never vanish, no flashing faster than 3 Hz | §1.3 | P1: these laws are what makes "the player always knows what is happening" testable |
| **Global colour tokens** (night, panel, text, lantern, growth, gold, ok, warn, danger_ping, glow_default, spot colours) | §2.1 | P5: one palette file drives shaders and UI |
| **Reserved-colour rules**: firefly gold = growth and health; reward gold = prizes; System cyan = the UI voice; monster tells never use the firefly-gold band (hue 44° to 56°, S ≥ 0.5) | §2.2 | P1: colour meaning never changes anywhere in the world |
| **8 Seat Hues with shape glyphs**, chosen by an optimiser for colour-blind separation (worst pair ΔE 22.7 normal, 10.3 under simulated colour-vision loss) | §2.3 | P6 and P1: 8 players in a lobby are always told apart by colour and by shape. Fits the 8-player lobby cap exactly |
| **Palette validator tests** (`PaletteTests`, `PaletteUsageTests`) | §2.5, §17 | P2 and P5: the build refuses colours that break the rules, so agents cannot drift |
| **URP 17 pipeline settings**: Forward+, HDR, SMAA (not TAA, which smears outlines), Neutral tonemapping (keeps hues true), Adaptive Probe Volumes, GPU Resident Drawer | §3.1 | Tech, still valid on Unity 6000.3 URP. Adapt shadow distance and probes for open terrain (see Conflicts) |
| **Custom HLSL shaders**: `KW_Toon` (3-band ramp, rim, one hard spec, emission masks), `KW_GlowChalk` (self-lit tells with an arming curve), `KW_WaterToon` (with an analytic Mouth reflection), `KW_SkyGradient`, `KW_SkyPainted`, `KW_LightShaft`, `KW_Ghost`, `KW_DitherFade` | §4.1 to §4.9 | Tech: agent-written text shaders with no Shader Graph, all written down with parameter values. Reusable as they are |
| **Outlines**: inverted hull with hue-matched dark colour (not black) plus a depth/normal edge pass for the environment | §4.2 | P3: a crisp storybook look |
| **Mood system (`MoodDef`)**: key light, ambient, fog, shade tint, rim multiplier, post profile, music state and mixer snapshot in one data record | §5.1, §5.2 | P2 and P5: one record per place keeps look and sound consistent. Adapt: blend by world volume instead of by door |
| **Specific mood recipes** worth keeping as zone moods: `well_bottom`, `hatch_pond`, `landing` (warm deck, cool shaft), `breather`, `hush`, `keeper` (a warm raft in the dark), `warden`, `rim` (pastel dawn) | §5.2 | P2: a tested set of lighting looks for towns, wilds and boss arenas |
| **Procedural animation only**, on a shared rig (springs, 2-bone IK, look-at, rigid segments, PrimeTween) | §7 | Tech: can be built by agents and needs no animator. Keeps every creature consistent |
| **Monster state grammar**: Idle → Tell (glow arms plus a 10 to 20% wind-up pose) → Act (≤ 0.5 s) → Recover (1.0 to 1.5 s, your moment) → Stagger → Sleep | §7.2 | P1 and P4: "players learn one visual language". The best single rule for a low learning curve in combat |
| **Prop motion** (lily pads sink per frog, lanterns flicker ±8% at 0.5 Hz, doors open with 15% overshoot, eggs bob) | §7.3 | P6: small motion that makes the world feel alive |
| **Shuriken VFX list** with the growth, verb and world effects, pooled by `FxPool`, and suppression near armed tells | §8 (Growth and rewards, Verbs and bodies, Rooms and world) | Tech and P1: a full effect list tied to events, local only, so it costs no bandwidth |
| **Cinemachine 3 follow rig**: distance 4.5 m (3.5 to 6.0), FOV 60 (50 to 90), shoulder offset (0.35, 0.25, 0), obstacle avoidance that ignores frogs and VFX | §9.1 `cam_follow` | P4: tuned third-person camera values |
| **`cam_glance`**: on first arrival at a new place the camera tilts up to +65° for 0.6 s to show the sky, and any look input cancels it | §9.1 | P1 and P2: shows the next goal (the sky) without a UI arrow. Use it at every new town or vista |
| **`cam_title`** (a slow drift above black water toward the Mouth), **`cam_mirror`**, `cam_portrait` for build-time portraits | §9.1 | P4 and P3: the title screen is the world |
| **Impulse presets** with a summed cap of 0.30 m, a 0 to 100% setting, and no shake in a tell's last 1.0 s | §9.2 | P1: shake adds feel without hiding danger |
| **The one hard juice rule**: hitstop and slow motion are local and visual and never touch `Time.timeScale` | §10.1 | Tech: essential for NGO host mode, where time scale on the host would freeze everyone |
| **Hitstop table** (40 to 150 ms, never stacks, cap 150 ms) and **squash/stretch presets** (volume-preserving, springs at 7 Hz and 0.45 damping) | §10.2, §10.3 | Fun-first feel: chunky, readable actions |
| **Count-ups at rising pitch**: each tick plays the next pentatonic note; 0.6 to 1.5 s; lands with a punch and a chord | §10.4 | Fair progress: rewards feel good without casino tricks |
| **Per-content juice checklist** (hitstop on every pop, squash on every landing, count-up on every reward, cue as sound + glow + caption, a laugh-shaped beat) | §10.6 | P1 and quality: turns "feels good" into a checkable Definition of Done for every quest area |
| **Budgets**: frog LOD0 ≤ 6,000 tris, monster ≤ 15,000 tris, ≤ 6 draw calls and 1 light per frog, GPU 10.4 ms at Medium | §3.4, §6.1 | Tech: still fits 8 frogs on screen. Adapt the room-sized numbers for open terrain |

### Audio

| Item | Where | Why it fits v2 |
|---|---|---|
| **"The party sounds like a band"**: every croak is a pentatonic note; each seat has a fixed note (Well: F3, A3, C4, D4, G3, F4, A4, C5), so any mix of players sounds good | Intro point 5, §15.3 | P6 and P3: when strangers meet in the open world, their croaks harmonise. A strong, sincere "together" feeling that needs no words |
| **The harmony rule**: every music pattern in a layer uses a scale that contains all five of its pentatonic notes, checked by `AudioKeyTests` | §15.3 | P2: sound stays consistent across the whole world |
| **Croak ranks you can hear**: I one note, II + octave below, III Twin Toll dyad, IV Thunder Croak triad + 40 Hz sub | §15.4 | Fair progress: growth you hear as well as see |
| **Echo in the well, silence at the Rim**: every Well croak feeds a 380 ms echo; on the Rim the echo is gone | §15.2 Rim snapshot, §15.4 | P2: storytelling through sound. Leaving the well changes how your own voice sounds |
| **Music scales with players present**: `mus_hub` adds a kalimba voice per joined human; `mus_landing` adds a layer per 2 frogs (max 4) | §15.5 | P6: towns literally sound fuller when more players are around |
| **Music cues to reuse as zone and town themes**: `mus_hub` (kalimba drips in 3D, water drone), `mus_landing` (the 3/4 waltz), `mus_hush`, `mus_keeper` (drone bends with the raft), `mus_rim` (waltz + breathy flute) | §15.5 | P2: an audio identity for home, towns, and the world above |
| **Danger music layers**: Calm → Tension (monster within 8 m or tell armed) → Pressure, crossfading over 2 s | §15.5 `mus_rule_{suit}` | P1: music tells you when danger is near. Adapt: drop the suit variants |
| **`MusicDirector`**: a step sequencer on `AudioSettings.dspTime` scheduling synthesised notes 100 ms ahead from `music.json` | §15.1 | Tech: can be built by agents, adapts to play, and stays in key with croaks |
| **Mixer tree and snapshots** (Well, Breather, Landing, Boss, Ghost, Results, Rim) with ducking so tells cut through music | §15.2 | Tech and P1 |
| **No spoken words.** Characters speak in babble: 70 to 110 ms formant syllables at each character's own pitch, always captioned | §15.6 | P3 and tech: every character has a voice, and every line localises through string tables |
| **Positional tells with occlusion**, directional captions like `[bell rings ←]`, and a visual twin for every audible cue | §15.7, §14.3 | P1: every danger can be read with sound off or on |
| **Reverb zones per place** (Cave, Stoneroom, Livingroom, Quarry, Plain) | §15.7 | P2: places sound like what they are |
| **`kw_synth` recipes** (bell, pluck, FM, kalimba, music box, croak with formants 700/1,200/2,600 Hz and a 25 Hz flutter), rendered byte-identical from JSON | §15.9 | Tech: agents can make and re-render sound. Every file gets a `licenses.csv` row |
| **Source rules**: Kenney CC0 packs (verify each at import), Freesound CC0 only, no CC BY-NC, **no casino, slot or reel sounds** | §15.8 | Fair progress and legal safety |
| **Loudness targets**: −18 LUFS integrated, true peak ≤ −1 dBTP; cosmetic sounds stay ≥ 18 dB under the croak | §15.2 | P1: cosmetics never drown gameplay sound |

### Tech (UI and data)

| Item | Where | Why it fits v2 |
|---|---|---|
| **UI Toolkit for every screen**, TextMeshPro only for world-space plaque text (with an HDR glow shader) | §12.1 | Tech: agents write UXML and USS as text |
| **Five PanelSettings layers**: World, HUD, System, Menu, Modal | §12.2 | P5: a clean layering of screens |
| **Tokens generated from `palette.json`** into `tokens.uss`, so shaders and UI never drift | §12.3 | P5 and P2 |
| **Fonts (all OFL)**: Fraunces (display), Nunito (UI), JetBrains Mono (numbers), Atkinson Hyperlegible (dyslexia swap), Noto Serif KR (inscription), Noto Sans KR (Korean) | §12.4 | P3: a warm, soft display face with a readable UI face |
| **`IconBaker`**: vector icons from `icons.json` to 256² sprites, tinted by USS; Kenney CC0 input glyphs | §12.5 | P5 |
| **World-space markers** placed with `RuntimePanelUtils`, no layout pass, clock text at 10 Hz | §12.6 | Tech: cheap name tags and pings for 8 players |
| **Data files**: `palette.json`, `juice.json`, `audio_cues.json` (with `captionKey` and `visualTwin` per cue), `music.json`, `synth_recipes.json`, `icons.json`, `logo.json` | §2, §10, §15.1, §15.9 | P5: content as data, easy for agents to tune |
| **Build tests**: Palette, PaletteUsage, TellReadability, Silhouette, Flash, UiCopy, FontCoverage, AudioCue, AudioKey, Juice, CardGate, Logo, GPU probes | §17 | P1 and P2: rules that stay true while agents build |

### Progression

| Item | Where | Why it fits v2 |
|---|---|---|
| **Growth is light on your body** (glow level 1 to 10, orbiters, Crown glow) | Intro point 1, §6.1 | Fair, visible, persistent progress. It works well for a persistent character |
| **Verb ranks I to IV with a visible part at III** (Awakening) and a gold shimmer at IV (Mastery) | §6.1, §7.1, §8 | P1: each rank changes how the frog looks and sounds |
| **Growth lines name the change and the cause**: `[ TONGUE II ] 4.5 m. Grapple unlocked. Because: you grabbed 14 things.` | §11.1 | P1: the player knows why they got stronger |
| **Cosmetic shop rules (the Mirror)**: try on under lighting presets; never a timer, discount, "leaving soon" or owner percentage; supporter items say "Cosmetic only. Supports development." | §13.11 | Keeps "skins and a cosmetic shop" fair and honest, as the brief asks |
| **Items you cannot afford are shown with a muted price, never hidden** | §13.12 | P5 |
| **Results rules**: the progress bar comes last (goal gradient); two equal buttons; nothing auto-starts; near-miss text only on a deterministic bar | §13.10 | Fair "one more go" feeling without tricks |
| **The break line**: "Your door is saved." after about 90 min, never blocks input | §13.16, §14.4 | Fair and humane. Adapt the wording to the world ("Your spot is saved" at a town) |

### UI

| Item | Where | Why it fits v2 |
|---|---|---|
| **The world is the menu**: the title is the well bottom; any key hatches your egg and you control a frog in ≤ 5 s | §13.1 | P4: well under the 60 s target |
| **Diegetic stations with a list as backup**: walk to the Mirror, map wall, Bestiary book, or press Esc for a 9-item left column | §13.2 | P5: every feature is 2 inputs from play (Esc, then pick) |
| **Drop-in join**: the eggs in the water mirror the 8 seats; a joining player hatches from their egg; no Ready button | §13.3 | P6: joining without friction, shown in the world |
| **Steam invite, join by code, streamer-safe code hiding** | §13.3 | P6 |
| **Map node states shown as shapes and colours** (dashed = future, solid = reached, tick = cleared, cracked = failed, pulsing ring = you). Outer regions are drawn from the start but dim and marked `?` | §13.4 | P1: you see the whole shape of the world and where you are. Adapt from a door spiral to a region map |
| **Pinned objective**: the room's rule stays on screen the whole time, and a clause you failed last time glows gold for 3 s | §13.5 rule chip, §14.4 | P1: becomes v2's always-visible quest line |
| **Context prompt with the device's input glyph** (`Tongue · grab`), and a reticle that becomes a ring when a target is in range | §13.5 | P4: the game tells you what the button does, right when you need it |
| **Name tags**: Seat Hue chip, glyph, name, 3 spot pips; constant size to 25 m | §13.9 | P6: other players are always visible and readable |
| **Pings** by type (monster, prop, door, frog, place) | §13.9 | P6: talk without voice chat |
| **The Wheel**: a radial with 8 quick lines and 4 emotes, spoken as babble with a speech bubble | §13.16 | P6 and P3: quick social talk for strangers. Keep the friendly lines only |
| **Message sizes**: a window for almost everything, a pinned chip, a side banner for lobby-wide news, and at most one full-screen card per door (`CardGate`) | §11.3 | P5: interrupts are rationed. Adapt to "one full-screen card per quest step" |
| **Copy rules**: sentence case, buttons are verbs ("Climb again", "Rest", "Equip"), equal-weight paired choices, no countdown on any choice, nothing auto-starts, no invented percentages | §11.4 | P1, P3 and P5: honest, clear writing |
| **UI motion language** (panels slide 12 px + fade in 200 ms, 3 px focus ring, reduced-motion fallbacks) | §7.4 | P5: one consistent feel across screens |
| **Settings tabs**: Controls, Camera, Video, Audio, Accessibility, Social, Language | §13.14 | P5: standard and easy to find |
| **Pause that tells the truth**: "the climb keeps going" when others are present; "Leave at the next Landing: everything is banked there" | §13.15 | P1 and P6: in a shared world, pause does not stop time. Adapt "Landing" to "town" |
| **No loading between areas**; boot → hub ≤ 3 s, with a firefly drawing the map | §13.16 | P6: an open world should feel connected |
| **Accessibility set**: every hold can be a toggle; full rebinding; shape codes always on; high-contrast tells; reduced motion; photosensitive mode (pulses ≤ 2 Hz); dyslexia font; text 100 to 150%; UI scale 80 to 130%; minimum text 16 px; captions for every line and every tell, with direction; mono audio; a +6 dB tell boost | §14 | P4: a low barrier for every player |
| **Capsule idea**: one huge-eyed frog with a glowing belly leaping out of a dark well mouth toward a sliver of bright sky | §16.2 | P2: the whole story in one image |
| **Share card**: group shot + vista + logo, streamer-safe | §16.5 | P6: players show their group |

---

## Party-only (to archive)

These only make sense in the betrayal party game. Archive them with the v1 repo.

| Item | Where |
|---|---|
| **Crimson `#FF3D6E` as "betrayal only"**, its 15° hue exclusion for cosmetics (hue 330° to 360°), the ♥ glyph as "betrayal is possible here", and the crimson whitelist in `PaletteUsageTests` | §2.1, §2.2, §2.5, §17 |
| **Heart doors** (♥ suit, `heart_stage` mood, `mus_heart` canon that thins to one voice "in the betrayal window", Risk Boon family recoloured away from crimson, host option "Heart doors between humans") | §2.4, §5.2, §15.5, §13.3 |
| **The Betrayal Cam**: `cam_betrayal` (letterbox 2.39:1, FOV 40), 25% slow-motion replay, desaturate-except, the BetrayalCam mixer snapshot, `[ TRAITOR ]` in crimson Fraunces 120 px, `vfx_traitor_ink`, `imp_traitor`, chromatic pulse, the bell-croak sting | §9.1, §9.2, §10.5, §11.2, §13.16, §15.2, §15.5 |
| **The WANTED poster** (`wanted_paper` / `wanted_ink` tokens, face RenderTexture from `cam_portrait`, `vfx_wanted_print`, `sfx_wanted_print`, WANTED badge and party-strip icon) | §2.1, §9.1, §12.6, §13.9 |
| **The Knot, the Cut, Hold On and the Breakup Cut**: `vfx_knot_tie`, `vfx_knot_thread`, `vfx_cut_channel` ♥, `vfx_cut_snap` ♥, `vfx_hold_on`, the matching SFX and stingers, `[ KNOT ]`, `[ IT'S OVER ]` in the cutter's hue, the Knot off-screen chevron, the Knot partner x-ray (45%) | §4.8, §7.1, §8 Social, §11.2, §13.16, §15.5, §15.8 |
| **Vengeance**: `goo` token `#8BE04E`, `vfx_vengeance_slime` with decals, `sfx_vengeance_slime`, `[ VENGEANCE ]` window, the victim-only target reticle over the traitor, the slide-whistle stinger | §2.1, §8, §13.9, §13.16, §15.5 |
| **Blame**: blame tags, the blame pill (`ink` 80%), `sfx_blame_pop`, `cam_fall_replay` (framing the faller and the blamed frog), Blame tags host and settings options | §9.1, §13.3, §13.9, §13.14 |
| **Rivals' "Resolve tell"** (the traitor tell: sac +40%, crimson tongue tip, narrowed eyes, glow 15% toward crimson, babble drops a fourth) | §7.1, §15.6 |
| **Betrayal-flavoured Rival quirks**: Gutter "stares at the last frog who betrayed him"; Vex's eyes flick between frogs' cheeks | §6.2 |
| **Masked Rivals** (hide the BOT badge until results) and the `BOT · public evidence` vote marking | §6.2, §13.3, §13.16 |
| **The Mimic (`doppelfrog`) and the Doppelfrog vote overlay** (social deduction with a 10 s ring and suspect portraits) | §6.3 "Other creatures", §13.16, §14.4 |
| **The Meeting Door**: `meeting_room`, `cam_meeting_window` with `KW_ShadowGlass`, `mus_meeting`, meeting keys `vfx_key_glint`, the "Rope in 0:45" ring | §5.2, §8, §9.1, §13.16, §15.5 |
| **Tethers**: `sp_tongue_tether`, `heart_tied_bridge`, the `set_tether` mood, `mus_tether`, rope catenary, `vfx_water_rise_foam`, `cam_pair` | §5.2, §7.3, §8, §9.1, §15.5 |
| **Pranks**: the shove (`vfx_shove_whoosh`, `imp_shove`, `sfx_shove`, 60 ms hitstop), tongue-yanking a friend off the raft, being "swallowed and spat" in front of others, the `[ UNDERDOG ]` social header | §7.1, §8, §9.2, §10.2, §11.2, §15.8, §16.3 |
| **Tagline "Climb together. Fall alone."**, and store copy that "leads with ... betrayal" | Header, §13.1, §16 |
| **The KNOTWELL name and the knot-K logo**: the rope knot stands for the Knot pairing mechanic. Re-decide the name and logo in v2 | §16.1 |
| **Trailer shots and screenshots built on betrayal and pranks** (0:04 tongue-yank, 0:28 Betrayal Cam; screenshots 2 "the Kestrel laugh" and 5 the Betrayal Cam) | §16.3, §16.4 |
| **Party lobby host options**: Rank Sync, Masked Rivals, Heart doors between humans | §13.3 |
| **Titles rule "nothing counts betrayals"** (only needed where betrayal exists) | §13.10 |

Possible opt-in side-mode hook (build nothing now): the Meeting Door's window camera, the Doppelfrog vote overlay and the Betrayal Cam are self-contained specs. A town "party hall" could reuse them later. For now, document them only.

---

## Conflicts with the new pillars

| Item | Where | Pillar | Why it conflicts |
|---|---|---|---|
| **20 separate doors as the structure**: DoorHalls, plaques, the door counter slam `DOOR 12`, walk-votes, Team Lives, skulls, the room clock, "the Tower pulls everyone out" (`sfx_tower_gulp`) | §7.3, §13.5, §13.7, §15.8 | P2, P6 | v2 is one connected world. Doors that load separate rule rooms break the open-world feel. Keep the monsters and tells; drop the door frame |
| **Card suits as content categories** (♠ Body, ♦ Mind, ♣ Together, ♥ Heart, E Enigma) on plaques, music variants and room accents | §2.4, §5.2, §15.5 | P2, P4 | Card imagery has nothing to do with a frog in a well, and it is extra vocabulary. It also contradicts the file's own rule that no icon uses card, dice or chip imagery (§12.5) |
| **"The Tower" vs "the Well"**: Tower Rank, "the Tower's records", "The Tower will wait", the Tower's gulp, while the setting is a well | §11.2, §13.10, §13.13, §15.8 | P2 | Two names for one place. Pick one in-world name |
| **The System**: a "dry, sarcastic announcer that hypes your growth and roasts your mistakes", in `[ BRACKETED CAPS ]` mono text on cyan panels | §11 | P2, P3 | It is a generic game-show and LitRPG voice with no place in the lore. Mocking the player can feel mean, not sincere. Keep the clarity rules (one header, one short sentence, name the cause). Give the voice an in-world owner, or make it neutral |
| **Hidden information**: redacted rule text (`█` blocks) under Sealed and Hell, hidden clears, `[ HIDDEN CONDITION DETECTED ]` private secret quests with an `ONLY YOU` tag, the Bestiary hiding the current room's page, "Something is waiting in 12E" teasers | §11.2, §13.5, §13.10, §13.13, §13.16 | P1, P5 | The player should always know what to do next and why, and nothing should be hidden. Mystery belongs in places to explore, not in hidden rules or secret unlock conditions |
| **Too many progress systems at once**: Glow Lv 1 to 10, verb ranks I to IV × 3, Boons (4 passive slots, a Power slot, 5 families, Legendary, Duo, ranks, rerolls, upgrades), classes, titles, Tower Rank letters, Party Rank, 4 Bestiary stamps, Wish Coins and Pearls, jars in 3 tiers, the stall, Gold Keys | §6.1, §8, §13.5, §13.8, §13.10, §13.12 | P4, P5 | The core loop is not learnable in 5 minutes with this much. v2 should keep one visible growth track (glow level plus visible verb parts) and cosmetics |
| **Two currencies and two shops** (Pearls at the Mirror, Wish Coins at the Landing stall; supporter items only at the hub Mirror) | §13.11, §13.12 | P5 | Duplicated and scattered. One currency and one shop place per town is easier |
| **Run-based roguelite frame**: Boons picked per climb, rerolls, "Leave now: a Rival takes your seat and keeps your Glow", a results ceremony after each climb, Rematch doors | §13.8, §13.10, §13.15, §8 `vfx_rematch_flatten` | P2, P6 | A persistent shared world needs persistent characters. Per-run power resets break "one story" continuity |
| **8 s timed Boon pick** that auto-takes the highlighted orb | §13.8, §14.4 | P1 | It breaks the file's own rule "no countdown on any choice" (§11.4). Timed choices add pressure for new players |
| **HUD density**: door chip, clock, rule chip, objective counter, System windows, coins, a 7-row party strip, status panel, 5-slot Boon bar, verb ranks, context prompt, reticle, captions, chevrons | §13.5 | P4, P5 | Too much on screen in the first minutes. v2 should bring HUD parts in only as they become relevant |
| **Rivals as bots filling empty seats** (BOT badge, "Swap Rival" in the lobby) | §6.2, §13.3 | P6, P3 | In an MMO-feel world the other frogs should be real players. The Rivals' personalities are better used as NPCs who live in the world |
| **Difficulty as 4 doors with chains** (Easy, Normal, Hard, Hell; Hard unlocks when anyone clears a Keeper) | §13.3, §5.2 difficulty looks | P4, P2 | A difficulty gate in the hub is a lobby-game pattern. An open world usually scales danger by region |
| **Off-theme looks**: E doors and the Glitch Eye with a `#FF00FF` checker glitch shader, chromatic aberration, bit-crushed square arpeggios; the Chrono-Slime; Space as "violet and neon on station decks" with neon magenta | §4.8 `KW_Glitch`, §5.2 `enigma`, §5.4, §6.3 rows 11 to 12, §15.5 `mus_enigma` | P2 | A digital glitch look and sci-fi station decks break "storybook diorama" and "nothing contradicts the world's rules". Keep Space only if it is re-imagined inside the storybook look |
| **Room-sized tech limits**: shadows to 40 m because "rooms are ≤ 40 m", a per-room light bake and reflection probe, room shell ≤ 250,000 tris, ≤ 4,000 particles "per room", budget for "2 live rooms", mood blends on a door pass (0.4 s) | §3.1, §3.4, §5.1, §8 | P6 | Open terrain needs streaming, larger shadow distance or cascades, zone-based probe baking, and mood blending by volume |
| **Name tags hidden beyond 40 m**, and the x-ray outline limited to yourself and your Knot partner "for fairness: no free wallhack" | §4.8, §13.9 | P6 | The fairness reason came from betrayal. In a co-op world, seeing your group through walls and from further away helps people find each other |
| **The dread/waltz swing timed "every ~1 min" by the door mix** | §1.2 | P2 | The rhythm came from door order. In an open world it should come from geography (town → wilds → town) |
| **Heavy in-game vocabulary**: Glow, Boon, Awakening, Mastery, Crown, Seat Hue, Landing, DoorHall, Keeper, Warden, the Rim, ★1, Sealed, Rematch, Tower Rank, Party Rank, Wish Coin, Pearl | Throughout | P4 | Every new word is learning cost. v2 should keep a short glossary and plain labels in the UI |
| **"Worth it?" survey chips** next to the two result buttons | §13.10, §18 Q10 | P5 | The source itself says they could read as a third choice. Move feedback out of the main flow |
| **The first visible growth comes at Lv3** (Lv1 0.6 and Lv2 0.9 sit under the bloom threshold of 1.0) | §6.1, §18 Q11 | P1, P4 | A new player's first level-up may not look like anything. Make the first level-up visible (raise Lv2 to ≥ 1.0) |

---

## Key numbers and names

### Colour tokens (keep the hexes)

| Token | Hex | Meaning to keep in v2 |
|---|---|---|
| `night` | `#0B0F14` | Backdrop, well-bottom black |
| `panel` / `panel_hi` | `#141B24` at 92% / `#1F2A36` | UI panels |
| `ink` / `text` / `text_muted` | `#101418` / `#F4EDE3` / `#A7A39B` | Text |
| `glow_default` | `#FFE27A` | Default glow, fireflies, count-ups |
| `spot_core` / `spot_hot` / spot out | `#FFD24A` / `#FFF6D6` / `#3A2F22` | Back spots (health) only |
| `growth` | `#FFE066` | Growth headers, focus ring |
| `gold` | `#FFD84A` | Rewards only |
| `lantern` / `lantern_core` | `#FFB86B` / `#FFE3B0` | Warm, safe light |
| `star_anon` | `#FFF4E0` | Lantern-folk lights |
| `ok` / `warn` / `danger_ping` | `#7CE08A` / `#FFA630` / `#FF5A1F` | Success, warning, monster ping |
| `system_bg` / `system_line` | `#0B1630` at 92% / `#5CE1E6` | UI voice windows (re-decide in v2) |
| `wish_coin` / `pearl` | `#EBAF3C` / `#EAF4FF` | Currencies (merge in v2) |
| Belly / default frog / tongue | `#CFF3FF` / Azure Dart `#2FA4FF` / coral at hue 14° | Hero colours |
| Well stone / shadow / moss / moss tips / bronze / rope / water | `#4E5A5E` / `#151B20` / `#557D33` / `#8DB45A` / `#C08A3E` / `#B08A5A` / `#05090C` | Well region palette |
| Sky cloud / shadow / grass / sun | `#FFF6EE` / `#C9B8D9` / `#A8D98A` / `#FFF3C4` | Sky region palette |
| Crimson (archive) | `#FF3D6E` | Party only. If crimson is freed in v2, re-check the Seat Hues and Rival skins |

### Seat Hues (8 players per lobby)

| Seat | Name | Hex | Glyph | Well note |
|---|---|---|---|---|
| 1 | Tangerine | `#FF9933` | circle | F3 (174.6 Hz) |
| 2 | Sky | `#80CAFF` | triangle | A3 (220.0 Hz) |
| 3 | Mint | `#80FF95` | square | C4 (261.6 Hz) |
| 4 | Plum | `#B23E9F` | flower | D4 (293.7 Hz) |
| 5 | Lemon | `#FFEA00` | cross | G3 (196.0 Hz) |
| 6 | Cobalt | `#007ED9` | hexagon | F4 (349.2 Hz) |
| 7 | Pearl | `#F2F0EA` | crescent | A4 (440.0 Hz) |
| 8 | Jade | `#24B28F` | teardrop | C5 (523.3 Hz) |

Worst separation: ΔE2000 22.7 (normal vision), 10.3 (simulated colour-vision loss). Tag-text contrast ≥ 4.4:1.

### Rivals (future NPC cast)

Moss (mossy frog `#9BE07A`, 220 Hz) · Brother Brass (bullfrog `#FFC45C`, 150 Hz) · Pip (teal reed frog `#6FF0D6`, 420 Hz) · Vex (yellow-banded dart frog `#E8F24A`, 300 Hz) · Maud (orchid painted reed frog `#D77FE0`, 280 Hz) · Gutter (scarred cane toad `#B5673A`, 170 Hz) · Kestrel (red-eyed tree frog `#FF8A3D`, 340 Hz) · Ines (lanky cream tree frog `#FFF1C9`, 320 Hz) · Pell (blue dart frog `#6AA8FF`, 260 Hz) · Lumen (lavender leaf frog `#C7B6FF`, 240 Hz).
Known naming clash to settle: Moss's hat is "Moss Cap" in 03 and "Acorn Cap" in 08 (§18 Q5).

### Creatures and places

- Monsters: Bell-Golem (2.6 m bronze, eye slits `#FFB000`), heron (6 m, mostly a shadow), pike (2.2 m), fog eel (3 m), snapping turtle (3 m), the hunter (3 m blind olm), Lamp-Knight (3 m), water snake (8 m), Moss Snail (2 m), Web Spider (1.8 m), Chrono-Slime (1.6 m), Glitch Eye (2.5 m), the Keeper (Bell-Golem at 3.2 m on a bell raft), the Jar / Warden (14 m), the giant sleeping toad (12 m), the Mimic (archive).
- Places: the Well, Well Bottom (hub), hatch pond, Landings, the Mouth, the light pillar, the Rim, the Sky, Space, Beyond.
- Layer keys: Well F G A C D (F major / D minor) · Sky C D E G A · Space G A B D E · Beyond D E F♯ A B.
- Proverb on the statue: 우물 안 개구리 / 井底之蛙 (the frog in the well).

### Frog and feel

- Health: 3 back spots (4 on Easy), lit emission 4.0, hollow when out.
- Glow levels 1 to 10: belly emission 0.6, 0.9, 1.2 (first bloom), then 1.5 to 3.0, and 3.4 at Lv10. Bloom threshold 1.0.
- Orbiters: radius 0.45 m + 0.03 m per level, one lap per 2.4 s. Crown ring at Lv10: 12 motes, radius 0.22 m.
- Frog budget: LOD0 ≤ 6,000 tris, LOD1 ≤ 2,000 from 15 m, 4 materials, ≤ 6 draw calls, 1 light. Monster ≤ 15,000 tris.
- Tell lead 2 to 5 s; glow arms 1.0 → 4.0; pulse 0.5 → 2.5 Hz; nothing flashes faster than 3 Hz; whiteouts ramp ≥ 600 ms.
- Readability: 25 m, contrast ≥ 3:1. Environment value ≤ 0.35 (dark places) and ≤ 0.60 (warm places). Characters S ≥ 0.55.
- Chorus window 0.3 s. Revive hold 2 s (a 5-note arpeggio at 0.4 s per note).
- Hitstop 40 to 150 ms, capped at 150, never stacked. Squash springs 7 Hz, damping 0.45.
- Count-ups 0.6 to 1.5 s, ≤ 20 ticks/s. Shake cap 0.30 m (0.35 for the Jar drop).
- Camera: 4.5 m (3.5 to 6.0), FOV 60 (50 to 90), target height 0.90 m, pitch −35° to +70° (−55° to +80° in open spaces), default blend 0.35 s. Glance at first arrival: +65° for 0.6 s.

### UI and audio numbers

- UI reference 1920 × 1080; UI scale 80 to 130%; text size 100 to 150%; minimum text 16 px.
- UI voice window: one header + one sentence ≤ 90 characters; types at 35 cps; lives 3.0 s + 40 ms per character; ≤ 2 visible, ≤ 3 waiting.
- Boot → hub ≤ 3 s; key press → frog control ≤ 5 s; hatch shot 2.8 s.
- Break line after about 90 min.
- Audio: 48 kHz, 48 real voices, pool of 48 AudioSources; −18 LUFS integrated, true peak ≤ −1 dBTP; Well echo 380 ms, decay 0.40; tells duck music by 8 dB; ≤ 8 croaks audible; pitch randomisation ±3%, never on notes. Croak formants 700 / 1,200 / 2,600 Hz with a 25 Hz flutter.
- Frame ≤ 16.6 ms; host simulation ≤ 8 ms; GPU 10.4 ms at Medium (1080p).

### Tech names

- Shaders: `KW_Toon` (variants `_KW_HERO`, `_KW_MONSTER`, `_KW_ENV`, `_KW_PROP`), `KW_GlowChalk`, `KW_WaterToon`, `KW_SkyGradient`, `KW_SkyPainted`, `KW_LightShaft`, `KW_Ghost`, `KW_DitherFade`, `KW_XRay`.
- Features: `KWOutlineFeature`, `KWEdgeFeature`, `KWXRayFeature`. Tools: `FxPool`, `TellLight`, `MoodDef`, `MusicDirector`, `SoundManager`, `IconBaker`, `NoiseBaker`, `OutlineNormalBaker`, `kw_synth`, `kw_gen_uss`, `kw_portraits`, `CardGate`, `Juice`.
- Stack: Unity 6 URP 17 Forward+, UI Toolkit, TextMeshPro for world text, Cinemachine 3, PrimeTween, Shuriken only (no VFX Graph), HLSL only (no Shader Graph), Unity AudioMixer (no FMOD).
- Data: `presentation/palette.json`, `juice.json`, `audio_cues.json`, `music.json`, `synth_recipes.json`, `icons.json`, `logo.json`.

<!-- END -->
