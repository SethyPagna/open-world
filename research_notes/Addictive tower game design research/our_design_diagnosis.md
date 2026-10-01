# Diagnosis: why the current KNOTSPIRE design may not feel fun, addictive, attractive, immersive or progress-rich

Source key for internal citations: **GDD** = [_design/GDD.md](../../_design/GDD.md) (37,688 words, v1.0), **WORLD** = [_design/WORLD_STRUCTURE.md](../../_design/WORLD_STRUCTURE.md), **CRIT** = [_design/GDD_CRITIQUE.md](../../_design/GDD_CRITIQUE.md) (34 items, unapplied), **TB13** = [TEAMBOUND_13/README.md](../../TEAMBOUND_13/README.md). Section numbers (§) point into those files. Web sources are linked inline. Several primary pages (NamuWiki, TTITH fandom, Hades wiki, Aggro Crab interview, Medium) returned 402/403 to the fetcher; where a claim rests only on a search-result summary, it is marked "(search summary)".

## 1. Where is the design too complex, bureaucratic or abstract? What must a new player learn in run 1, and which systems read like spreadsheets?

### Takeaway
A first-time solo player meets about 22 key bindings, about 110 coined system terms and roughly 45 interacting systems in a single 36–45 minute run. The design's own words call the Tower "bureaucratic". Many of the most-specified systems are payout formulas, multipliers, truth-stamps and pick-order rules that the player has to read and weigh, not toys to play with. Hits in this space teach 1–3 verbs and get a round going with no rules reading.

### Cited Findings
**What the design asks a new player to learn (the first run, in order of encounter)**
- **Controls:** 22 bound verbs, including Move, Camera, Jump/mantle, Dive, Brace, Grab, Shove/Throw (the same button does different things depending on whether you are carrying), Interact, Brighten, Dim, Drip, Traits 1–4, Knot/accept/Cinch (G), Cut (X, three kinds of target), Ping (tap, double-tap or hold radial), Quick-chat (24 phrases + 4 context phrases), Emote, Ledger, Shoulder swap, Draft Cam, Ready and Pause — [GDD §4.1](../../_design/GDD.md)
- **Before the first room:** menu (9 entries), Origin select (4 starting Origins with different max wax and speed stats), lobby betrayal settings — [GDD §14.1, §9.5, §7.10](../../_design/GDD.md)
- **The Foot:** a 60 s warm-up with "contextual tutorial prompts, the Knot demo with Moss, and a dummy plate". It is the only onboarding space in the document — [GDD §3.3, §10.1](../../_design/GDD.md)
- **Door Draft, 45 s, on every floor.** Each plaque shows 7 fields: designation, capacity dots, a SPLIT/FINISH/SOLE reward-rule icon, Omen sigils, the Codex hint, the 2 latest Notes with truth stamps, and the redacted Clear Condition. Plate rules cover Planted/Calm, Stampede, the 0.5 s claim, Draft wind, Latch, Hold the Door, Door Ajar and Slam. WORLD adds a rib maze that rises during the Draft on floors 2–4 and adds "a real detour of about 1–4 s" to switching doors — [GDD §3.6](../../_design/GDD.md); [WORLD §7.3](../../_design/WORLD_STRUCTURE.md)
- **Status and health:** Wax (HP), brightness rating (base 1, Brighten +3, Dim −1, Notorious +2, Branded +1, Unremarkable −3), Snuffed / Smoke / Holder / Relight / Burnt Out / Scorched, Relight Font, and ambient burn of 1–3 wax/min on floors 2–4 — [GDD §4.3, §5.1–5.3](../../_design/GDD.md)
- **In-room layer:** the Decree with per-word reveal ranks, a hint ladder at 50% and 75%, Regression Scars, study levels 0–4, the Tide and Pressure, and 6 Omens with multipliers — [GDD §6.0.3, §3.3, §3.5.1](../../_design/GDD.md)
- **Between rooms:** the Shared Altar and its pick order, 16 traits in 4 slots, 8 Anvil fusions, the Exit Vestibule (Stair or Side Door), the Visitor's 50% share, Grates (pass one item every 20 s), and Keyholes (spectate and bet) — [GDD §9.2–9.4, §3.8](../../_design/GDD.md)
- **Social layer:** Knots/Pacts (max 2, a 15% Pact Pot, gold threads), Cut the Knot and Cinch, **10 distinct Knife types**, Soot 0–3 and Notorious, Confession and Forgive, bot Trust (−100 to 100) and Grudges, the Tribunal (pedestals, Mercy, Branded at −25% Embers), Notes (12 templates, Borne Out or Proven False stamps), Keyhole bets (odds `clamp(0.9/p, 1.2, 5.0)`), the Clue Composer, and a one-room hidden role (the Taster) — [GDD §7.1–7.9](../../_design/GDD.md)
- **Economy:** 3 currencies (Embers, Drips, Sparks), plus a separate "Drip" heal verb and the "Drip Chimney" room. CRIT flags these naming collisions, and others: Echo ×4, Cut ×3, Tallow ×5, Chute ×3, Martyr ×3 — [GDD §11.1](../../_design/GDD.md); [CRIT #33](../../_design/GDD_CRITIQUE.md)
- **Landing stations:** Relight Font, Anvil, Note Board, Codex lectern, Mirror, Brass Chest, 4 minigames, Tide clock, a hidden X alcove and Old Tallow's Market (10 stock items) — [GDD §10.1–10.3](../../_design/GDD.md)
- **Items and meta:** 8 keys and items, 21 titles, the Codex, Wick Level and the Wickbook — [GDD §9.6–9.9](../../_design/GDD.md)
- **The Crown:** 3 phases (5 sconces in a 1.5 s window, named soot tendrils, sequential Trust Falls, a Penitent Fall option), then a choice between two mutually exclusive endings — [GDD §6.13](../../_design/GDD.md)

**The design describes itself as bureaucratic, and CRIT confirms the systems don't mesh**
- The fiction defines the Tower as "an *examiner*, patient, bureaucratic and faintly amused" — [GDD §2.1](../../_design/GDD.md)
- CRIT finds that scope is "roughly twice the brief", and 32 of its 34 items are contradictions, soft-locks or exploits between interacting systems. Examples:
  - Knife-disclosure rules contradict each other;
  - the betrayal math can't produce the betrayals it promises;
  - the Crown can be impossible to finish with 4 or fewer climbers.

  — [CRIT #1, #3, #4, #14](../../_design/GDD_CRITIQUE.md)

**Spreadsheet-like systems the player has to parse**
- **Reward rules:** SPLIT total = `pool × fm × om × (1 + 0.15 × (n − 1))`; SOLE pays 65/35; Smoke clearers get 50%; Visitors get 50% — [GDD §6.0.4](../../_design/GDD.md)
- **Run-end Drips formula:** six additive terms — [GDD §11.4](../../_design/GDD.md)
- **Room tier:** `tier = floor − bandStart + 1`, then timer −6% and monster speed +8% per tier — [GDD §3.5](../../_design/GDD.md)
- **Door choice is dominated by payout math.** CRIT computes that a SOLE E door pays about 4.5× an A share per head, "so optimal solo play is E on every floor, which means seeing 2 rooms per run" — [CRIT #10](../../_design/GDD_CRITIQUE.md)

**How the benchmarks onboard**
- **Among Us** "strips social deduction down to its essentials: hidden roles, periodic discussions, voting", and players "can join a public lobby with strangers and play their first round successfully without ever reading the rules" (search summary) — [Dinogame GG](https://dinogame.gg/blog/why-is-among-us-so-popular/); [Innersloth beginner's guide](https://innersloth.zendesk.com/hc/en-us/articles/7794240573460-Beginner-s-Guide-to-Among-Us)
- **Vampire Survivors** has "minimalist controls: you just move" (search summary) — [The Vibes](https://www.thevibes.com/articles/lifestyles/53373/vampire-survivors-an-escalating-dopamine-rush-disguised-as-a-retro-game)
- **Roblox's own design docs:**
  - "Players who don't understand what to do in the first few minutes are likely to quit, but so are players who are bored by lengthy and prescriptive tutorials."
  - "The more they have to learn, the harder it becomes to retain it all, increasing the likelihood of feeling overwhelmed and quitting."
  - They recommend just-in-time contextual tutorials.

  — [Roblox Creator Hub: Onboarding techniques](https://create.roblox.com/docs/production/game-design/onboarding-techniques)
- **DOORS** teaches its most frequent threat through one tell and one answer: when the lights flicker, hide in a closet. Repeat encounters reinforce it — [DOORS Wiki: Rush](https://doors-game.fandom.com/wiki/Rush); [GINX](https://www.ginx.tv/en/roblox/doors-rush)

### Inferences
- **Cognitive load.** The Foot's 60 s warm-up cannot teach even half the bindings. In practice a new player enters the first Draft with about 7 unread plaque fields per door × 4 doors, 45 s on the clock, and no idea what SPLIT, FINISH or SOLE mean. Load is highest exactly when the player knows least. **Implication:** floor 1 should hide the Draft entirely (auto-assign, or two big doors with pictures), and the first room should need only move, jump and grab.
- **Too many "value tracks".** About 110 coined terms is a codex, not a game vocabulary. Party hits run on roughly 5–15 nouns. **Implication:** cap player-facing proper nouns at about 25 for the slice, merge synonyms, and delete the collision families CRIT lists.
- **Rules crowd out toys.** The social layer has 10 Knife types, Soot tiers, a Tribunal, Notes with stamps, bets and a Pact Pot. Each needs UI, rules text and trust arithmetic, and none of them is a physical toy. Among Us gets its drama from one hidden role and one vote. **Implication:** one betrayal verb with a big visible cost, plus one public vote, gives most of the drama at a fraction of the cost.
- **Players will optimise the fun away.** Payout formulas push players toward door choices made on EV rather than excitement (E every floor, only 2 rooms seen). **Implication:** show rewards as loot, and keep the formulas off screen.
- **TB13 shows the same instinct.** The previous project's README spends its space on SHA-256-verified asset packages, a 48-joint rig and "90 local checks", and never says what is fun ([TB13](../../TEAMBOUND_13/README.md)). The team's instinct is rigor, and KNOTSPIRE moved that rigor from physics into rules. GDD §1.3 says "Fun before physics"; it needs an equivalent "Fun before rules".

### Gaps
- No published count of how many mechanics Among Us, Fall Guys or DOORS teach in their first session. The comparison above is qualitative.
- No playtest data on KNOTSPIRE exists yet, so the cognitive-load estimate is inferred from the spec, not measured.

## 2. How long until the first laugh, first power gain and first "wow"? How often does the player feel stronger? Is there a power fantasy?

### Takeaway
On paper the first power gain arrives at about minute 6–7 of a run, and only if the player clears their first room. The run's total power gains are about 4. The big "wow" (the scale reveal) is gated behind about 38 minutes of play. Nearly every verb costs wax, the hero's body visibly shrinks all run, and powers are explicitly clamped so they never trivialise rooms. That is the reverse of a power fantasy, while the user asked that players "increase their powers".

### Cited Findings
**Time to first power gain (the design's own timers)**
- Foot warm-up 60 s → Door Draft 45 s → Latch 6 s → reveal orbit 2.2 s → room (Golem 5:00 timer; the hint at 50% = 2:30; plain wording at 75% = 3:45) → Shared Altar ≤ 15 s — [GDD §3.3, §5.4, §6.1, §6.0.3](../../_design/GDD.md)
- The first trait therefore arrives at about 5:45–7:10 into the run, not counting menus and Origin select.
- A failed ("Scorched") room gives no reward and −25% max wax for the next floor — [GDD §5.3](../../_design/GDD.md)
- A first-timer sees only rank-1 Decree words. In the Golem Decree that is 1 of 7 marked words ("hear"), so the objective is mostly `███` until the hint ladder fires — [GDD §6.0.3, §6.1](../../_design/GDD.md); [CRIT #34](../../_design/GDD_CRITIQUE.md)

**How often the player gets stronger**
- "A run gives 4 picks, and many traits are dead outside their home room (Blindfold Sense, Language of Wax, Resonance, Snip)" — [CRIT #25](../../_design/GDD_CRITIQUE.md)
- Altar cards include fillers such as "+20 wax", "+15 Embers" and "Blank" — [GDD §9.2](../../_design/GDD.md)
- About half of the 16 traits are information or utility passives:
  - Insight, Language of Wax, Blindfold Sense, Dimmer, Cold Wax, Unremarkable, Keysmith;
  - Hollow Core, which *lowers* max wax by 15.

  — [GDD §9.3](../../_design/GDD.md)

**The anti-power-fantasy decisions, verbatim**
- "No monster in a room can be hit to death." "Monsters have no HP bars, and hitting one usually makes things worse." — [GDD §0, §1.1](../../_design/GDD.md)
- "Your wax is your health, and your body visibly shrinks as it burns down" — [GDD §0, §5.1](../../_design/GDD.md)
- Wax costs are everywhere:
  - Brighten −1/s; Hold the Door −2/s; Cinch −2/s;
  - Drip −5 per tap; Relight −20; Firebrand −5;
  - ambient burn −1 to −3 wax/min on floors 2–4.

  — [GDD §4.3, §5.2, §9.3](../../_design/GDD.md)
- "There is **no permanent power** except knowledge (the Codex) and Origins, which are sidegrades." "Levels never grant power." — [GDD §9.1, §9.9](../../_design/GDD.md)
- Across layers, rooms default to `'clamp'` (L1 numbers) "so a wider power never trivialises an old puzzle", while room tier rises with the layer: at the cap, timer −24% and monster speed +32% — [WORLD §9.4, §3.1](../../_design/WORLD_STRUCTURE.md)

**Where laughs and wows come from**
- Comedy sources are "Bodies. Wobbling candles, belly-flop dives, a Wick shrinking to a stub" — [GDD §2.2](../../_design/GDD.md)
- There are no scripted guaranteed early laughs. The closest are bot quirks such as "Kestrel lobs a stone at the Golem early 25% of the time" — [GDD §6.1](../../_design/GDD.md)
- The flagship wow, "Out of the Well" (26 s), plays after the Crown, i.e. after a full ~38-min run. The in-run build-up is the Coin growing from 31° to 74° — [WORLD §4.3, §10.2, §3.2](../../_design/WORLD_STRUCTURE.md)

**Benchmarks**
- **Hades:** the first chamber of every run is guaranteed to reward a Boon or a Daedalus Hammer — [Hades Wiki: Chamber Reward](https://hades.fandom.com/wiki/Chamber_Reward) (search summary). Chamber rewards are shown on the door symbols before you choose — [Inverse](https://www.inverse.com/gaming/hades-symbol-meaning-guide-hera-dionysus-apollo-ares-aphrodite)
- **Vampire Survivors** "barely lets you go a few seconds without something good happening": XP drops, level-ups offer a choice, and chests pop with upgrades, turning "a vulnerable character with a single attack into an unstoppable force" (search summary) — [The Vibes](https://www.thevibes.com/articles/lifestyles/53373/vampire-survivors-an-escalating-dopamine-rush-disguised-as-a-retro-game); [Kokutech](https://www.kokutech.com/blog/gamedev/design-patterns/power-fantasy/vampire-survivors)
- **Solo Leveling:** completing quests grants "loot boxes, weapons, and ability points that would substantially boost his powers", and a Job Change unlocks the hidden class Shadow Monarch (search summary) — [Solo Leveling Wiki: Quests](https://solo-leveling.fandom.com/wiki/Quests); [Job Change Quest](https://solo-leveling.fandom.com/wiki/Job_Change_Quest)
- **The Tutorial Is Too Hard:** the protagonist climbs to the 60th floor and "transcended the category of a challenger and ascended to the status of a god" (search summary). Growth to overwhelming power is the arc — [TTITH Wiki: Floors](https://the-tutorial-is-too-hard.fandom.com/wiki/Floors)

### Inferences
- **Power moments.** At about 4 per 36–45 min, the player gets a power gain every ~9–11 min at best. Hades gives one on the first door, and Vampire Survivors every few seconds. **Implication:** give a reward on *every* room clear plus in-room pickups, and aim for a felt power gain every 60–120 s.
- **Metaphor.** The hero's core metaphor is decline: shrink, burn and drain. Keep wax as the fragile HP if you like, but give the player a second, growing axis, the **Flame** (size, colour, corona, a level number). Then the silhouette shows growth instead of loss. CRIT #25 already proposes "a flame corona ring per clear".
- **Clamping.** Clamping powers in older rooms deletes the defining payoff of tower fiction: returning to an old floor as a monster and flattening it. **Implication:** let powers trivialise earlier content on purpose, and move difficulty into new rooms, new gimmicks and higher floors instead.
- **Combat.** "No monster can be hit to death" is a strong identity, but it leaves no moment of domination. **Implication:** keep non-combat Clear Conditions, and add satisfying *power expressions*: shatter the golem, blast the slime into the cold store, one-shot small mobs with an upgraded Flame.
- **Laughs and wows.** Both need to be designed beats in the first 2 minutes: a guaranteed slapstick moment in room 1 and a mini-reveal at the end of floor 1, not only at minute 38.

### Gaps
- There is no sourced figure for the average time to Vampire Survivors' first level-up, or for Hades' chamber count per biome. The fetches failed, so the benchmark is qualitative.
- The actual time to the first clear depends on untested room difficulty.

## 3. Is the hero appealing? Is the fantasy clear in one sentence? Would a thumbnail or trailer sell it?

### Takeaway
The Wick (a bouncy living candle with nub hands and a flame face) is a cute, ownable mascot with Fall Guys energy. But the pitch needs a tagline plus six bullets, the tagline uses climbing jargon ("belay"), and the key art is set in dark rooms lit only by players. The fantasy it sells is "fragile candle navigating bureaucratic riddles", not "nobody climbs a monstrous tower and becomes a god".

### Cited Findings
- **Hero design:** a lathe body 0.72 m tall, floating Rayman-style nub hands, a flame-face on top, hop-waddle and belly-flop animations, and 7 flame emotions — [GDD §13.5, §13.6, §4.5](../../_design/GDD.md)
- **Pitch:** a tagline ("Belay or betray."), a second line, and a six-bullet elevator pitch covering the Wick, lettered doors, "no monster can be hit to death", redacted System text, knot Pacts, and "the tower keeps the receipts" — [GDD §0](../../_design/GDD.md)
- **Look:**
  - "Storybook miniatures lit only by the players: the dread of *Little Nightmares* with the bounce of *Fall Guys*" — [GDD §2.2](../../_design/GDD.md)
  - Rooms are "tense, dark and lit only by the players" — [GDD §1.1 pillar 5](../../_design/GDD.md)
  - CRIT warns that "'Darkness by default' fights 'readable': no tell is required to be self-lit" — [CRIT #28](../../_design/GDD_CRITIQUE.md)
- **None of the six pillars** mentions growth, reward, power or progress. They are: Light is life and language; Riddles with teeth; Every door is a social decision; Belay or betray; Dread, then a waltz; Solo is a full lobby — [GDD §1.1](../../_design/GDD.md)
- **Trailer-grade beats already specified:**
  - the Betrayal Cam (a 0.8 s slow-mo thread snap);
  - the Trust Fall;
  - the Golem shattering "into a shower of small bells";
  - the Candlelit light wave down the tower;
  - the Everflame column;
  - the "Out of the Well" pull-back.

  — [GDD §7.2, §6.1, §13.7](../../_design/GDD.md); [WORLD §10.2](../../_design/WORLD_STRUCTURE.md)
- **How hits in the space sell:**
  - DOORS' most frequent threat, Rush, is a single readable face ("a dark gray, skull-like face with a large grin"), and the game has over 7.6 billion visits (search summary) — [DOORS Wiki: Rush](https://doors-game.fandom.com/wiki/Rush)
  - Critics praised DOORS' tense atmosphere, and it drew back popular Roblox YouTubers — [Wikipedia: Doors (game)](https://en.wikipedia.org/wiki/Doors_(game))
  - R.E.P.O. "generates more visible, slapstick moments that read well without audio context" — [CoopQueue](https://coopqueue.com/features/repo-vs-lethal-company/)

### Inferences
- **One-sentence test.** The most compact honest sentence is "Candle heroes climb a tower of lettered doors, solving riddle-monsters and betraying each other for wax." It is clear, but it promises cleverness and paranoia, not growth, loot or triumph. **Implication:** rewrite the pitch around climb + grow + betray. For example: "Climb a tower of 100 doors with your friends, get absurdly powerful, and decide who gets left behind." Then make a pillar literally about "every door makes you stronger".
- **Tagline.** "Belay" is climbing jargon many younger or Roblox-age players won't parse. "Climb together. Fall alone." is the stronger line. This is inference, not tested.
- **Thumbnail.** A dark room lit by small flames reads poorly at thumbnail size. **Implication:** key art should show a huge, readable monster or gimmick, a bright flame-hero mid-action, and a big floor number or door letter. Keep the darkness *inside* rooms, but give every tell and hero an emissive glow (CRIT #28).
- **The candle is an asset.** A shrinking candle is instantly readable and funny. It just needs a matching "growing" state, a bigger and wilder flame, so trailers can show both the stub and the inferno.

### Gaps
- No A/B data exists on the thumbnail or tagline. Comparative click-through figures for dark versus bright Roblox or Steam capsules were not found.

## 4. Where is progress invisible or delayed?

### Takeaway
Progress is delayed at every scale:
- **Floors:** the run is 5 floors over 36–45 min, so one visible "+1 floor" every ~7.5 min.
- **Endings:** the payoff arrives only at the Crown and the reveal.
- **Meta:** permanent progress is cosmetics, a Codex that *spoils* rooms (useful for about 2 runs per room), and layer access.
- **Layers:** the world grows while your powers stay clamped in rooms.

Hits make progress visible per room (a door number, loot, a level-up), per round (5–15 min) and per session (permanent upgrades).

### Cited Findings
**Run and campaign length**
- Run 36–45 min; floor ~7–8 min; room 3:30–5:30 — [GDD §3.1, §5.4](../../_design/GDD.md)
- The campaign is 4 runs of about 38 min, "about 2.6 h over 4 sessions" — [WORLD §3.2](../../_design/WORLD_STRUCTURE.md)
- Non-room time per floor (Landing, Intermission 45 s, Draft 45 s, Latch 6 s, Altar ≤ 15 s, waiting on the Tide of 2:30) is about 20–55% of each floor, from the timers in [GDD §3.3, §5.4](../../_design/GDD.md)
- CRIT notes "Solo waits are capped at 60 s, so the minigames are rarely played… The only mode is a 36–45 min run" — [CRIT #26](../../_design/GDD_CRITIQUE.md)

**Progress markers**
- 5 floors per run, with global floor numbers across the campaign (1–20) — [GDD §3.2](../../_design/GDD.md); [WORLD §2](../../_design/WORLD_STRUCTURE.md)
- "There is no global leaderboard in the slice" — [GDD §5.5](../../_design/GDD.md)

**Meta progression**
- Drips buy cosmetics only. Earn times at ~250 Drips per run: Tallow ~1 run, Beeswax ~4, Tapered ~10, Gilded ~29 — [GDD §11.5](../../_design/GDD.md)
- Wick Level gives emotes, theme colours and lore pages — [GDD §9.9](../../_design/GDD.md)
- Codex study levels "un-redact Clear Conditions" — [GDD §6.0.3, §9.8](../../_design/GDD.md)
- CRIT: "After about two runs the Codex shows the full Decree, and the hook inspired by The Tutorial Is Too Hard is gone" — [CRIT #11](../../_design/GDD_CRITIQUE.md)

**Layers**
- "Default for the 12 slice rooms: none" for Layer Omens; rooms get "the reskin only" — [WORLD §9.1](../../_design/WORLD_STRUCTURE.md)
- Traits widen by layer but rooms clamp them to L1 numbers — [WORLD §9.4](../../_design/WORLD_STRUCTURE.md)

**Benchmarks**
- **Among Us:** "Most games last between five and fifteen minutes" (search summary) — [Dinogame GG](https://dinogame.gg/blog/why-is-among-us-so-popular/)
- **Fall Guys:** each round "only takes two or three minutes", and an episode is "four or five rounds" (search summary of Mediatonic's E3 comments) — [Screen Rant](https://screenrant.com/fall-guys-rounds-each-game-match-mediatonic/)
- **Hades:** runs around 25–45 min for full escapes (search summary; player reports, not an official figure) — [KUTO blog](https://thelockoftime.world/blog/how-long-to-beat-hades). The Mirror of Night "turn[s] failed runs into permanent account strength", and "every bit of Darkness you earn makes the next attempt a little easier" — [TheGamer: Mirror of Night](https://www.thegamer.com/hades-mirror-of-night-roguelite-progression/); [Hades Wiki: Mirror of Night](https://hades.fandom.com/wiki/Mirror_of_Night)
- **DOORS:** the death screen reports "rooms survived, the cause of the death, the knobs gained". Guiding Light tips get more helpful the more a player dies to the same entity (search summary) — [DOORS Wiki: Death Screen](https://doors-game.fandom.com/wiki/Death_Screen); [Guiding Light](https://doors-game.fandom.com/wiki/Guiding_Light)
- **Lethal Company:** runs on a three-day quota cycle with escalating profit targets, a short, legible progress loop — [Wikipedia: Lethal Company](https://en.wikipedia.org/wiki/Lethal_Company)

### Inferences
- **Run length.** A 36–45 min run with ~5 visible progress ticks is too coarse for a browser party game. **Implication:**
  - make a default run 12–20 min, with rooms of 60–150 s and 10–20 numbered doors;
  - put a huge door counter on screen;
  - ship CRIT #26's "Short Climb" and "Landing Party" as the *default*, not an option.
- **Codex as meta.** "The game gets spoiled" is a weak meta reward, and it runs out after about 2 runs per room. **Implication:** make meta progress additive and strength-flavoured:
  - Hades-style permanent talents, even small ones;
  - unlockable Origins and classes that play differently;
  - a persistent rank (F → SSS);
  - a highest-floor record.

  Move redaction to a *choice*: decode the Decree yourself for bonus loot.
- **Deaths.** Regression Scars are close to DOORS' Guiding Light: death teaches you more. That is a genuine strength. Deliver it like DOORS, as a warm, instant death-screen tip plus stats ("rooms survived, loot gained"), not only as un-redacted riddle words.
- **Layers.** Layers that reskin but don't change play, combined with clamped powers, make L2–L4 feel like "the same run, harder". **Implication:** each layer should open with a new ability ("in the Sky you can glide", on by default) and new room types. The layer transition should feel like leveling up, not a cutscene.

### Gaps
- No public retention data links run length to D1/D7 retention for browser or Roblox games. The Roblox docs give qualitative guidance only.

## 5. What's missing that the Korean/English source fiction and hit games have?

### Takeaway
The design keeps the tower's *surface* (lettered doors, redacted Clear Conditions, Hidden Pieces, Titles, the System voice). It dropped most of the *engine* that makes tower fiction addictive:
- visible stats and level-ups;
- escalating power;
- sponsors or an audience reacting to you;
- loot and jackpot drops;
- ranks and records;
- hidden classes;
- fast, numerous floors.

It also omits the comedy channel that drives modern co-op hits: proximity voice plus physics slapstick.

### Cited Findings
**What we kept (strengths)**
- Clear Conditions, Hidden Pieces, Unique Titles and "knowledge carried across deaths" — [GDD §1.2](../../_design/GDD.md)
- 21 titles — [GDD §9.7](../../_design/GDD.md)
- A System that "never lies" — [GDD §2.3](../../_design/GDD.md)

**What we explicitly cut**
- "Audience and sponsor layer. **There is none in the slice.** No Patrons, no sponsorship, no chat feed." — [GDD §2.4](../../_design/GDD.md)
- By contrast, in TTITH "the gods who watch and sponsor Tutorial participants provide genuinely entertaining interactions… ranges from helpful advice to sarcastic roasting… gods bet on challengers, offer rewards for impressive feats, and occasionally intervene" (search summary) — [ScrollEpics](https://www.scrollepics.com/blog/the-tutorial-is-too-hard/); [Novel Updates](https://www.novelupdates.com/series/the-tutorial-is-too-hard/)

**Source-fiction traits we lack**
- **Stats and status windows:** our HUD is "minimal; the body is the health bar", and the numeric wax readout is off by default — [GDD §14.3](../../_design/GDD.md)
- In system fiction, a status window displays "level, stats, skills, and titles", and the genre is described as "binge-readable, with constant hooks and payoffs" where "the world feels fair… the system rewards you transparently" (search summary) — [Medium: Why do so many Korean webnovels begin with status windows](https://stelland.medium.com/why-do-so-many-korean-webnovels-begin-with-status-windows-8e03f40dc5c0); [Wikipedia: Web novels in South Korea](https://en.wikipedia.org/wiki/Web_novels_in_South_Korea)
- **Floor count and floor variety:** TTITH floors vary among "trap stages, puzzle stages, combat arenas, boss encounters", and the protagonist reaches floor 60 (search summary) — [TTITH Wiki: Floors](https://the-tutorial-is-too-hard.fandom.com/wiki/Floors). Our run is 5 floors and our campaign is 20 — [GDD §3.2](../../_design/GDD.md); [WORLD §2](../../_design/WORLD_STRUCTURE.md)
- **Hidden classes, daily quests, penalty zones and loot boxes** are staples in Solo Leveling — [Solo Leveling Wiki: Quests](https://solo-leveling.fandom.com/wiki/Quests); [Job Change Quest](https://solo-leveling.fandom.com/wiki/Job_Change_Quest). Our Origins are "sidegrades" — [GDD §9.1, §9.5](../../_design/GDD.md)
- **Jackpots and loot:**
  - minigame winnings are capped at 20 Embers per Landing, bet stakes at 20, and Cut the Knot at 60;
  - there are no no-cap jackpots, no rare drops, and no gear;
  - Market items are small utilities.

  — [GDD §10.2, §11.3, §10.3](../../_design/GDD.md)

**Comedy channel**
- Quick-chat is 24 fixed phrases and "There is no free text in the slice" — [GDD §7.9](../../_design/GDD.md)
- **PEAK:** proximity voice chat that fades with distance, with mouths animating to speech; sold over ten million copies — [Wikipedia: Peak](https://en.wikipedia.org/wiki/Peak_(video_game)); [TheGamer](https://www.thegamer.com/peak-best-viral-game-played-crab-game-repo/)
- **Lethal Company:** proximity voice is "central to its appeal"; about 10 million sold; $10 price — [Wikipedia: Lethal Company](https://en.wikipedia.org/wiki/Lethal_Company); [Game Developer](https://www.gamedeveloper.com/business/lethal-company-sold-an-estimated-10-million-copies)
- **R.E.P.O.:** physics hauling plus proximity chat; "chaos-first" — [CoopQueue](https://coopqueue.com/features/repo-vs-lethal-company/); [Ethic News](https://ethic-news.org/2025/05/07/review-r-e-p-o-stands-out-among-other-lethal-company-clones/)

**Fast rounds**
- Fall Guys rounds last 2–3 min; Among Us games 5–15 min (see Q4 sources). Our shortest unit of play is a 36–45 min run — [GDD §3.1](../../_design/GDD.md)

### Inferences
- **Sponsors.** The sponsor/god audience is the single highest-leverage missing element. In one system it provides:
  - comedy (roasts in System windows);
  - jackpots (gifts for feats);
  - visible progress (the number of sponsors or followers watching you);
  - betting drama;
  - a reason to perform for someone.

  **Implication:** restore a "Patrons above the Crown" layer in the slice. Tie it to existing hooks: a Hidden Piece found means a Patron gift drop; a betrayal means Patrons split into cheer and boo; a Title means a follower surge.
- **Status window.** The System voice is already in the game; it only needs to speak the language of growth. **Implication:** an in-world status window with Level, Flame and 3–4 stats that tick up on every clear, plus `[ LEVEL UP ]` and `[ HIDDEN CLASS UNLOCKED ]` windows. Titles should give visible, permanent perks or badges.
- **Loot.** Needs variance and rarity: rare drops, a chance of a "golden door", and a Hidden Piece that pays 5–10× a normal room.
- **Comedy.** Without voice or free text, it depends on bodies alone. **Implication:** optional proximity voice (WebRTC) for friend lobbies, plus more physics slapstick and funnier bot barks for solo, with the sponsor feed as the solo "laugh track".

### Gaps
- I could not fetch primary text on TTITH's exact status-window stats or sponsor mechanics (the NamuWiki and fandom pages were blocked). The details above rest on search summaries and should be checked against the other researchers' notes (`kr_power_fantasy.md`, `en_jp_litrpg_deathgame.md`).
- No sourced data on browser-game adoption of WebRTC proximity voice or its moderation cost.

## 6. What should be CUT or SIMPLIFIED, and what should be AMPLIFIED? (ranked by impact)

### Takeaway
The biggest wins are additive and feel-driven:
1. a constant, visible power curve;
2. short runs with many numbered doors;
3. a front-loaded first 2 minutes;
4. a sponsor/audience layer.

The biggest cuts are bureaucratic:
- payout math;
- the 12-template Note system;
- bets;
- the Tribunal;
- 10 Knife types;
- 3 currencies;
- the invisible, engineering-heavy instance systems.

Keep the brand-defining pieces: Wicks, lettered doors, gimmick monsters with non-combat clears, the Knot and cut, the System voice, Regression Scars (as death tips), and the concentric-world reveal.

### Cited Findings
**Evidence for each recommendation**
- **Power curve:** Vampire Survivors' constant reinforcement; Hades' guaranteed first reward and permanent Mirror upgrades; Solo Leveling and TTITH growth arcs (Q2, Q4, Q5 sources). Our 4 picks per run, clamped powers and no permanent power — [CRIT #25](../../_design/GDD_CRITIQUE.md); [WORLD §9.4](../../_design/WORLD_STRUCTURE.md); [GDD §9.1](../../_design/GDD.md)
- **Short rounds:** Fall Guys at 2–3 min rounds and Among Us at 5–15 min games, against our 36–45 min runs. CRIT #26 already proposes a ~15 min "Short Climb" — [CRIT #26](../../_design/GDD_CRITIQUE.md)
- **Onboarding:** Roblox guidance to "get to the fun quickly" and teach contextually. Our first objective is redacted, and the first Draft happens at 60 s — [Roblox Creator Hub](https://create.roblox.com/docs/production/game-design/onboarding-techniques); [GDD §3.3, §6.0.3](../../_design/GDD.md)
- **Social simplification:** Among Us' hidden roles, discussion and vote, against our 10 Knife types plus Soot, Tribunal, Notes, bets and the Pact Pot. CRIT's own cut list already moves Bets and the Tribunal to LATER and shrinks Notes — [CRIT #4](../../_design/GDD_CRITIQUE.md)
- **Invisible engineering:** CRIT calls `fromGhostState` for 12 rooms "the largest hidden cost". Grate live feeds are "impossible as written… and expensive" — [CRIT #5, #20](../../_design/GDD_CRITIQUE.md)
- **Door plaques:** Hades door symbols preview the *reward* — [Inverse](https://www.inverse.com/gaming/hades-symbol-meaning-guide-hera-dionysus-apollo-ares-aphrodite). Our plaques show capacity, a reward-rule icon, Omens, Notes and redaction — [GDD §3.6](../../_design/GDD.md)

**Ranked list**

| Rank | Change | Type | Evidence | What it implies |
|---|---|---|---|---|
| 1 | **A visible power curve.** Every room clear gives a pick (never filler). Add in-room pickups. A Flame Level and status window that tick up. Traits with universal effects that stack (CRIT #25). The flame grows as you do. Remove the `'clamp'` rule so old rooms become satisfying to steamroll. | AMPLIFY/ADD | Vampire Survivors, Hades, Solo Leveling, TTITH; GDD §9.1, §5.1; WORLD §9.4 | Answers "increase their powers". Gives a felt gain every 1–2 min. A new pillar: "Every door makes you stronger." |
| 2 | **Shorter, denser runs.** Default 12–20 min run; rooms 60–150 s; 10–20 numbered doors with a giant counter; Short Climb and Landing Party as defaults; the draft cut to ~10–15 s. | SIMPLIFY | Fall Guys, Among Us, DOORS door counts; GDD §3.1, §5.4; CRIT #26 | Progress ticks every couple of minutes. Sessions fit a browser attention span. |
| 3 | **Front-load the first 2 minutes.** Room 1 starts ≤ 30 s after Play; a plain objective on first visit; a guaranteed power pickup in room 1; a scripted slapstick beat; teach move, jump and grab only, everything else just in time. | SIMPLIFY/AMPLIFY | Roblox onboarding docs; the Hades first-chamber guarantee; GDD §3.3, §6.0.3 | Stops early quits. Redaction becomes an opt-in "decode for bonus loot" layer, or a floor 2+ or replay feature. |
| 4 | **A sponsor/audience layer.** Patrons above the Crown comment (roasts and hype), bet on you, and drop gifts or jackpots for feats, betrayals and Hidden Pieces. A follower count acts as a visible rank. | ADD | TTITH sponsor gods; GDD §2.4 explicitly cut it | Solves comedy, jackpots, visible status and solo loneliness in one system. It also fits the existing System-window UI. |
| 5 | **Collapse the social bureaucracy.** Keep the Knot and cut (one betrayal verb, a big slow-mo moment) and one public vote per run. Cut Notes, Keyhole bets, Rumour, the Pact Pot, 10 Knife types → 1–2, and hidden Trust numbers in the UI. Move the Taster to an optional "Impostor" lobby mode. | CUT/SIMPLIFY | Among Us essentials; CRIT #4, #14, #23 | Betrayal stays readable and dramatic without a rules manual. |
| 6 | **One run currency and one meta currency.** Hide the SPLIT/FINISH/SOLE formulas. Plaques show *what you'll get* (loot icons, a rarity glow) and *how scary* (skulls), not capacity and rule math. | SIMPLIFY | Hades door symbols; GDD §6.0.4, §11.1; CRIT #10, #33 | Door choice becomes "which prize and which risk?", not an EV calculation. |
| 7 | **Real meta progression.** A small permanent talent tree (Hades Mirror-style), unlockable classes and hidden classes that play differently, a persistent rank (F→SSS), a highest-floor record and a Daily Seed leaderboard. Keep cosmetics on top. | ADD | Hades Mirror of Night; Solo Leveling hidden class; GDD §9.1, §9.9, §5.5 | Every session ends stronger, and there is a reason to "one more run". |
| 8 | **Comedy channels.** Optional proximity voice in friend lobbies; more physics slapstick (ragdoll tumbles, carry/throw friends — already in the kit); funny bot barks; sponsor roasts as the solo laugh track. | ADD | PEAK, Lethal Company, R.E.P.O.; GDD §7.9, §2.2 | Laughs come every minute, not by chance. |
| 9 | **Make layers feel like level-ups.** Each layer grants a new movement power (glide, zero-g) on by default, adds new room types, and teases the next layer at the end of floor 1, not only after the Crown. | AMPLIFY | WORLD §9.1 ("Default… none"), §3.1 (harder tiers), §10.2 | The world grows *and* you grow. The "frog in a well" reveal lands as a reward for power, not just a cutscene. |
| 10 | **Cut vocabulary and controls.** 22 bindings → about 8 context-sensitive ones; ~110 coined terms → ~25; fix the name collisions. | SIMPLIFY | GDD §4.1; CRIT #33; Roblox cognitive-load guidance | Lower load; the codex becomes optional lore. |
| 11 | **Defer invisible engineering.** Ghost Sim takeover, live Grate feeds, Keyhole live spectating, the Theta Draft maze, Omens × Echo tiers, the Rival Register. | CUT (slice) | CRIT #4, #5, #20; WORLD §7.3 | Frees budget for rooms, juice and rewards the player actually sees. |

**What to keep and polish (already strong)**
- **Gimmick monsters with non-combat clears**, and physical tells as the readability contract — [GDD §6.0.3, §6.14](../../_design/GDD.md)
- **Regression Scars.** They match DOORS' Guiding Light pattern — [DOORS Wiki](https://doors-game.fandom.com/wiki/Guiding_Light)
- **The Betrayal Cam and Trust Fall** as clip moments — [GDD §7.2, §6.13](../../_design/GDD.md)
- **Hidden Pieces and Titles**, which need bigger payoffs — [GDD §9.7](../../_design/GDD.md)
- **The concentric scale reveals** — [WORLD §10](../../_design/WORLD_STRUCTURE.md)

### Inferences
- **Process.** The document is written as an engineering spec: formulas, coordinates, Monte Carlo maze stats. CRIT's fixes mostly *add* rules to patch interactions between rules. Continuing to patch will make the game more correct but not more fun. **Implication:** before more spec work, prototype a 10-minute vertical slice to one feel target: "every 90 s I got stronger, laughed, or saw something new". Then measure first-session drop-off.
- **The sequencing order is 1 → 2 → 3.** Power curve, short runs and first-two-minutes can be tested in greybox without new art, and they address the user's exact words ("feel progress", "increase their powers", "addicting"). Rank 4, the sponsor layer, is the most distinctive fit with the Korean source fiction and should follow immediately.

### Gaps
- The impact ranking is a judgment from benchmarks and the spec, not from playtests. It should be validated with a greybox A/B, for example a 40-min run with clamped powers against a 15-min run with a visible Flame Level.
- I found no quantitative industry data tying "number of systems in the first session" to retention. That relationship is inferred from the Roblox guidance and from the hits' simplicity.

## Fact-check (independent)

Checked 2026-09-28 by a separate reviewer whose default was to try to refute each claim. Limits: the WebSearch budget was already used up, so every check used WebFetch on known URLs. Fandom wikis (Hades, DOORS, Solo Leveling), create.roblox.com, dinogame.gg, thegamer.com, Medium, Novel Updates and Reddit were blocked or returned 403/404. Where a primary page could not be reached, the claim is marked UNVERIFIED, even if it matches the reviewer's general knowledge.

### Claims

| # | Claim in the notes | Verdict | Correct fact / evidence |
|---|---|---|---|
| 1 | CRIT: "32 of its 34 items are contradictions, soft-locks or exploits between interacting systems" (§1) | **CORRECTED** | This overstates it. At least 11 items are about scope, cost, fun, monetisation, visuals, platform or originality, not interactions between rules: #4 scope, #5 ghost-state cost, #11 replay life, #17 homework, #21 audio, #22 unspecified physics, #25 thin power growth, #26 no short modes, #27 shop, #28 visuals/perf, #32 mashup. That leaves roughly 20–23 of 34 as contradictions, soft-locks or exploits. The three examples given (#1, #3, #14) are accurate. Source: [CRIT](../../_design/GDD_CRITIQUE.md) item headings. |
| 2 | "A first-timer sees only rank-1 Decree words… 1 of 7 ('hear')" (§2) | **CORRECTED** | The rule reveals a word when `r ≤ studyLevel + scars`, and a first visit is study 0 (Unseen) with 0 scars. So a first-timer sees **0 of 7** words (GDD §6.0.3, §9.8), which CRIT #34 flags ("a study-0 player sees zero Decree words"). "1 of 7" holds only once CRIT #34's fix (entering grants Seen) is applied. The corrected figure makes the diagnosis stronger. |
| 3 | 22 bound verbs (§1) | **CONFIRMED** | GDD §4.1 has 22 table rows. "Traits 1–4" is one of those rows, so the player actually learns 25 keyboard keys. |
| 4 | First trait arrives at about 5:45–7:10 (§2) | **CONFIRMED (with a caveat)** | The arithmetic holds from GDD timers: 60 s + 45 s + 6 s + 2.2 s, then a clear between the 75% hint (3:45) and time-out (5:00), then Altar ≤ 15 s. It is not a floor, though: clearing at the 50% hint gives about 4:40. |
| 5 | SOLE E pays about 4.5× an A share, so optimal solo play sees 2 rooms per run (§1) | **CONFIRMED** (as CRIT's claim) | CRIT #10 says this word for word ("70 vs about 15"). It has not been independently recomputed from GDD §6.0.4. |
| 6 | TB13 README: SHA-256 checks, a 48-joint rig, "90 local checks" (§1) | **CONFIRMED** | [TB13 README](../../TEAMBOUND_13/README.md) lines 9, 18 and 51. |
| 7 | DOORS has "over 7.6 billion visits" (§3) | **CONFIRMED** (and now conservative) | Rolimons lists 7,785,326,641 visits — <https://www.rolimons.com/game/6516141723> |
| 8 | Wikipedia: critics praised DOORS' "tense atmosphere", and it "drew back popular Roblox YouTubers" (§3) | **CORRECTED** | Wikipedia has no article on DOORS: `Doors_(game)` redirects to "List of Roblox games". That entry says critics praised the horror and quotes a reviewer calling it "too much for YouTubers to handle". Nothing there says it drew YouTubers back. It also gives the release (Aug 10, 2022) and The Mines floor (Aug 30, 2024) — <https://en.wikipedia.org/wiki/List_of_Roblox_games> |
| 9 | PEAK sold over ten million copies; its proximity voice fades with distance and mouths animate (§5) | **CONFIRMED / UNVERIFIED** | Sales are confirmed: "over ten million copies" by mid-August 2025; developed by Aggro Crab and Landfall; released June 16, 2025; $7.99. Proximity chat is confirmed. Neither Wikipedia nor Steam mentions the distance fade or the mouth animation — <https://en.wikipedia.org/wiki/Peak_(video_game)>; <https://store.steampowered.com/app/3527290/PEAK/> |
| 10 | Lethal Company sold about 10 million at $10, and Wikipedia calls proximity voice "central to its appeal" (§5) | **CONFIRMED / CORRECTED** | Sales are confirmed: more than 10 million as of January 2024, a Push To Talk estimate. The $10 price is confirmed. Wikipedia does **not** call voice "central to its appeal". The closest support is a PC Gamer piece cited there: a "viral hit in no small part thanks to all the intense shouting". The three-day quota cycle with rising targets is confirmed — <https://en.wikipedia.org/wiki/Lethal_Company> |
| 11 | Fall Guys: each round "only takes two or three minutes", and an episode is "four or five rounds", from Mediatonic's E3 comments (§4) | **CORRECTED** | The cited Screen Rant page (Aug 7, 2020) has none of those phrases and no mention of E3. It says: "Every match contains 5 rounds and each round can last approximately 1 to 5 minutes max." For a whole match, the same page gives both "about 5 to 10 minutes" and "15 to 20 minutes" — <https://screenrant.com/fall-guys-rounds-each-game-match-mediatonic/> |
| 12 | Roblox docs quotes: "Players who don't understand… first few minutes…" and "The more they have to learn…" (§1) | **CONFIRMED** | Both quotes match word for word, as do "just in time" contextual tutorials. Checked against Roblox's official docs source — <https://github.com/Roblox/creator-docs/blob/main/content/en-us/production/game-design/onboarding-techniques.md> |
| 13 | Hades doors preview the reward, and runs take 25–45 min (§2, §4) | **CONFIRMED / CORRECTED** | Inverse confirms the preview: "Symbols appear over every doorway in *Hades*, giving the player a preview of what's waiting ahead." The cited KUTO page says runs take "**20–45 minutes**", not 25–45. Wikipedia confirms that permanent upgrades are bought between runs (the Mirror of Night) — <https://www.inverse.com/gaming/hades-symbol-meaning-guide-hera-dionysus-apollo-ares-aphrodite>; <https://thelockoftime.world/blog/how-long-to-beat-hades>; <https://en.wikipedia.org/wiki/Hades_(video_game)> |
| 14 | Hades' first chamber is guaranteed a "Boon or a Daedalus Hammer" (§2) | **UNVERIFIED** | The fandom wiki was blocked. The reviewer's recollection is that chamber 1 is always a god **Boon**, which makes the "or Hammer" part doubtful. Recheck before quoting. |
| 15 | Vampire Survivors quotes from The Vibes: "minimalist controls: you just move", "barely lets you go a few seconds…", "unstoppable force" (§1, §2) | **CORRECTED** | The Vibes page contains none of these phrases. Its actual wording is "the only thing you can control is movement". The Kokutech page returned 429/403, so the other two quotes are unverified — <https://www.thevibes.com/articles/lifestyles/53373/vampire-survivors-an-escalating-dopamine-rush-disguised-as-a-retro-game> |
| 16 | R.E.P.O. "generates more visible, slapstick moments that read well without audio context", and is "chaos-first" (§3, §5) | **CONFIRMED** | Both match word for word — <https://coopqueue.com/features/repo-vs-lethal-company/> |
| 17 | Korean status-window quotes ("level, stats, skills, and titles", "binge-readable", "rewards you transparently") (§5) | **UNVERIFIED** | Medium returned 403. The second cited source, Wikipedia "Web novels in South Korea", contains **none** of these phrases, so it should not be cited for them — <https://en.wikipedia.org/wiki/Web_novels_in_South_Korea> |
| 18 | TTITH: the hero climbs to floor 60 and "transcended… to the status of a god", and sponsor gods bet on and roast climbers (§2, §5) | **UNVERIFIED** | The ScrollEpics URL returns **404**, Novel Updates returned 403 and the fandom wiki was blocked. The MyAnimeList synopsis ("The Tutorial Is Too Tough!") covers only Hell difficulty and a 0.01% survival rate, not floors or gods. The sibling note `kr_tower_deathgame.md` says the story *opens* with the hero stuck on floor 60, which conflicts with "floor 60" as the arc's endpoint — <https://myanimelist.net/manga/146856/The_Tutorial_Is_Too_Tough> |
| 19 | Solo Leveling: the Job Change unlocks "the hidden class Shadow Monarch" (§2) | **UNVERIFIED (likely imprecise)** | The fandom wiki was blocked and Wikipedia gives no detail. The reviewer recalls that the Job Change grants the hidden class **Necromancer**, and that Shadow Monarch is revealed later as Ashborn's successor. |
| 20 | Among Us games last 5–15 min, and a new player can win a first round "without ever reading the rules" (§1, §4) | **UNVERIFIED** | Dinogame was blocked and the Innersloth guide returned 403. Wikipedia gives no game length. The finding is plausible, but it currently rests only on a search summary. |

### Design conclusions

| # | Conclusion | Verdict | Why |
|---|---|---|---|
| A | **Run 1 is overloaded** (22+ bindings, ~110 terms, 7-field plaques at 60 s). Hide the Draft on floor 1 and teach only move, jump and grab. | **SUPPORTED** | The binding count, the timers and the Roblox guidance all check out. The redaction problem is actually worse than stated (0 of 7 words, not 1). The "~110 terms" and "~45 systems" figures are estimates that were never counted. Treat them as order-of-magnitude, not data. |
| B | **The design is anti-power-fantasy.** Add a visible Flame/Level curve, a reward on every clear, and remove `'clamp'`. | **SUPPORTED** | GDD §9.1 and §9.9, WORLD §9.4 and CRIT #25 say this in the design's own words. The benchmark evidence is thinner than it looks: the Vampire Survivors quotes are misattributed or unverified, and the Hades first-chamber guarantee is unverified. The "power gain every 60–120 s" target is a judgment call, not a sourced figure. |
| C | **36–45 min runs are too long.** Default to 12–20 min runs. | **WEAK** | The Fall Guys figures were mis-cited: matches are 5 rounds of 1–5 min each, and the source puts a whole match at anywhere from 5 to 20 min. The Among Us 5–15 min figure is unverified. Hades, which the notes use as a *positive* model, has 20–45 min runs, the same as KNOTSPIRE, and is a hit. So the evidence supports **reward and progress density per minute**, not run length as such. Reframe it that way: keep a Short Climb, but the core fix is more ticks per minute. |
| D | **A sponsor/audience layer is "the single highest-leverage missing element".** | **WEAK** | Its main evidence (TTITH sponsor gods) could not be verified: one source is 404, one is 403 and the wiki was blocked. No game benchmark shows an audience layer driving retention. The comedy benchmarks (PEAK, Lethal Company, R.E.P.O.) get their laughs from voice and physics, not audiences. It is also the largest *added* system, in a design whose problem is too many systems. It is a plausible idea, but it should be a prototype candidate, not rank 4. |
| E | **Collapse the social bureaucracy** to one betrayal verb and one vote. | **SUPPORTED** | CRIT #4 itself lists the Tribunal, 12 Note templates, live-odds bets and Grate feeds as beyond the brief. CRIT #3, #14, #23 and #31 show these systems don't work as written. The Among Us comparison quote is unverified, but the argument doesn't depend on it. Note that the "32 of 34" figure used for support is overstated (≈20–23). |

**Also worth noting.** The proximity-voice recommendation (rank 8) is supported by the sales of PEAK and Lethal Company. It carries a moderation and safety cost for a young, browser-based audience, and GDD §7.9 deliberately cut free text for "safety and localisation". Voice is a bigger version of the same risk. Keep it friends-only and opt-in, as the notes suggest.
