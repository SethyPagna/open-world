# Reader notes: master/08_COSMETICS_SHOP.md

**Source:** `_design/master/08_COSMETICS_SHOP.md` (v1.0, 2026-09-29, 660 lines, read in full).
**Reader:** master-08_COSMETICS_SHOP · **Date:** 2026-09-30.
**Purpose:** sort what this KNOTWELL v1 file offers the v2 open-world co-op redesign (pillars P1 to P6).
Section numbers below (§) are the source file's own.

---

## Summary for the archive

This is the KNOTWELL v1 master design for everything a frog wears and how the player gets it. It sits under `DECISIONS.md` and `FUN_OVERHAUL.md`. It defines 8 cosmetic slots (Hat, Skin, Glow colour, Croak voice, Tongue trail, Emote, Door-entrance effect, Betrayal Snap) and 2 earned-only extras (System window theme, Tadpole ghost). The catalogue has 60 numbered items from four sources that never overlap: 12 defaults, 24 Pearl items, 16 prestige items (earned only), and 8 paid items in two Steam DLC Supporter Sets (Candle-Toad and Teacup). Rarity is a price and a craft budget, never a drop rate: Common 150, Rare 400, Epic 900, Legendary 2,000 Pearls. The Mirror is a physical station where selecting any tile tries it on at once. A Featured shelf keyed to play replaces the cut daily rotation, and a wishlist bar fills on the results screen. Strict rules protect readability: no cosmetic may fake the frog's body HUD (back spots, glow, Seat Hue, betrayal crimson), change play, carry information, or flash faster than 3 Hz. Nothing random, no currency, no light and no timers are ever sold. Cosmetics are data (JSON to ScriptableObjects) made by scripts, and 15 build-failing tests guard every rule. Rival bots wear catalogue items so players see them in play. A non-expiring pass and event items are specified as LATER. The goal was identity at 25 m, felt progress between climbs, brag without power, and fair, cosmetic-only money.

---

## Reusable for v2

Each row says where it is in the source and why it fits the new pillars. "Adapt" notes say what must change for one open world.

### World and lore

| Item | Where | Why it fits | Adapt |
|---|---|---|---|
| The line *"Every sky is someone's well."* | §6.2 #25 The Tiny Well | A short, specific theme line. It can anchor the ONE story (wells inside wells, a world looking up). P2, P3. | Offer it to the story owner as a candidate motto, not just a hat caption. |
| Rewards that are pieces of places: Rim Stone (a capstone carried out of the Well), Paint Chip (a flake of the painted sky dome), Meteor Iron, Knot Glass | §6.3 #41, §6.7 | A souvenir from each region makes rewards serve the one world. You wear where you have been. P2, P6. | Give each v2 region one "first time here" souvenir hat. Drop the "1–20" carving (door count). |
| World-reactive cosmetics: Rim Stone's flower opens under open sky and half-closes in the Well; Paper Boat rocks in water; Tiny Well micro-frog climbs to the rim when you look up | §6.2 #15, #25; §6.3 #41 | Clothing that obeys the world's rules makes the world feel consistent and alive. P2. | Tie reactions to v2 zone tags (open sky, underground, water). |
| Nature-true frog looks: dart-frog bands, see-through glass frog with a beating heart (Crystal Frog), spring-peeper chirp, real firefly yellow-green glow | §6.1 #1–3, §6.2 #26, #27 | Real frog biology gives looks that feel genuine, not generic fantasy. P3. | Keep the "after real frogs" rule for new skins and voices. |
| Bestiary-page hats: Explorer's Pith Helmet (4 pages), Heron Feather (8), Moth Antennae (12), Snail Shell (16), Beetle Pal (20), Open Book (24, a full Bestiary) | §6.3 #38–40, §6.7 | Exploration fills a journal, and the journal gives hats. That is an open-world reward loop with a clear next step. P1, P6. | Re-key page counts to the v2 world journal size. |

### Characters

| Item | Where | Why it fits | Adapt |
|---|---|---|---|
| Each character's look says who they are: Moss (steady helper) wears Acorn Cap; Pell (scholar) the Pith Helmet; Kestrel ("Watch this!") the Traffic Cone; Ines (speedrunner) the Heron Feather; Brother Brass (captain) the Bell Cap; Pip (helper) Speckled Egg and Mint Fizz | §13.1 table, "Why" column | Readable, specific characters with a visual reason for every item. P3. | Recast Rivals as town NPCs or companions. Keep the "why" column for every v2 NPC. |
| "Every NPC look is obtainable": each character wears at least 2 catalogue items that exist in the build | §13.1 rules | Players see an item in play before any shop page, and the game never shows what it can't give ("the System never lies"). P1, P2. | Apply to town NPCs. Keep the "only items in this build" check (test C12). |
| Hat barks, once per new hat: Moss "You've been reading. Good."; Brother Brass "You carried a piece of the Well out. I respect that."; Pip "Ooh! Can I try it on?"; Kestrel "Hey! That's *my* look." | §13.2 | Short, human lines that notice the player. Gives a new look a witness. P3. | Move to town NPCs. Keep "at most one per session, first wear only". Drop Vex and Gutter's lines (party). |
| The first gift: the Bell Cap waits on a cushion at a stall; tongue it and it arcs onto your head with a bell *ting* | §0 beat 1, §6.3 #37 | A warm, physical first reward from a character. No default hat, so the gift lands harder. P3, P4. | Give it after the first town quest, from a named NPC. |

### Frog mechanics

| Item | Where | Why it fits | Adapt |
|---|---|---|---|
| Tongue is Interact (use the Mirror, pick up the hat) | §7.2 step 1, §0 | One verb for "use this" keeps controls tiny. P4. | Keep it as the one interact input across v2. |
| Croak voice plays each player's own pentatonic note, so a group always sounds in tune ("Eight kazoos in one Chorus is the joke") | §2 slot 4, §6.1 #3, §6.2 #28 | A co-op sound toy: players make music together by accident. P6. | Keep note-per-player in lobbies of 8. |
| The frog's body is the HUD, and no cosmetic may fake a readout ("Never counterfeit a readout") | §3.1 | The player reads state from the frog, not from menus. P1. | Keep the law. Re-list the v2 readouts (health, level, class) once they are set. |
| Hats never fall off: on impact ≥ 6 m/s a hat pops 0.3 m and re-seats in 0.5 s, local only | §3.2 | Physical charm with no network cost and no lost items. P3, P6. | As is. |
| 4 default emotes on a wheel: Wave, Point, Clap, Shrug | §6.1 #5–8 | The basic MMO social kit. Point is useful for co-op callouts. P4, P6. | Keep as defaults. |
| Class markings: the class shows on the body; "markings never lie"; a skin can't carry a class pattern; no cosmetic name contains a class name | §6.6, §3.1, test C10 | Light classes readable at a glance. P1, P6. | Keep only the open classes (Tree Frog, Bullfrog, Dart Frog) or v2's roles. Drop the in-climb secret reveal. |
| Co-op help as a prestige source: Lantern Tadpole for reviving 25 frogs (at most 5 per climb) | §6.3 #46 | Rewards helping others, not beating them. P6. | Re-key "per climb" to "per session". Needs a v2 downed state to exist. |

### Art

| Item | Where | Why it fits |
|---|---|---|
| Sizes in units of frog height H (0.60 m): hat box, eye-dome and face keep-outs, back-spot saddle | §3.3 | Every hat fits every frog, and a body change rescales all items as data. |
| Per-frog budgets: ≤ 3,000 cosmetic triangles (hat ≤ 1,500), ≤ 60 particles, 0 Light components (emissive plus bloom) | §3.4 | Towns with 8 players and NPCs need hard caps. |
| Flash rule: no cosmetic changes luminance by more than 10% faster than 3 Hz | §3.4, test C13 | Photosensitivity safety. Matches WCAG 2.3.1 (see External facts). |
| Rarity shown as a word and a colour | §4 | Colour-blind friendly. P1, P5. |
| Skins are shader parameters (`KW/ToonLit`: `_Base`, `_Belly`, `_MarkColor`, `_Pattern` enum solid/bands/speckle/hex/voronoi/stars/gradient/swirl) with no textures | §5 makers | Many skins, cheap for an agent-built game, one consistent toon look. |
| Glow colour sets hue only; brightness comes from the level table (±5%) | §5 makers, §3.1 | Paid or earned colours never make anyone brighter or harder to read. |
| Makers: Blender 5.2 Python scripts from primitives; CC0 Kenney, Quaternius or KayKit only as a fallback; `CosmeticThumbnailBaker` 256×256; a `licenses.csv` row for every asset | §5 | Fits "built mostly by Claude agents". Clean licensing. |
| Try-on lighting presets (dark room, warm lanterns `#FFB86B`, open daylight) | §7.2 step 4 | Players see how an item reads in each kind of place before spending. |
| *Reduce others' effects* setting (hides others' trails, arrival bursts; keeps hats, skins, glows); forced on in reduced-motion mode | §3.4 Settings | Busy towns stay readable. P5, P6. |
| Strong item designs worth keeping: Acorn Cap, Paper Boat, Well Bucket, The Tiny Well, Speckled Egg, Honeycomb, Stained Glass, Crystal Frog, Moonlight, Mint Fizz, Sunset, Aurora, Lily Twirl, Belly Drum, Firefly Confetti, Bell Cap, Pith Helmet, Heron Feather, Moth Antennae, Moon Crown, Parchment, Rim Gold | §6.1–6.3 | Pond, well and night-sky items that match the Firefly Frog world. P2, P3. |

### Audio

| Item | Where | Why it fits |
|---|---|---|
| `Editor/CroakSynth.cs`: an in-house offline synth renders 48 kHz mono croaks from a recipe (waveform, partials, formant, attack, decay, noise) | §5 makers | No third-party audio, so no licence risk. Agents can make voices as data. |
| Loudness rules: croak voices matched to the default ±1 dB RMS; every other cosmetic sound ≤ −18 dB under the croak; 1 voice per croak | §3.4, §5 | Many players in one place stay listenable. P6. |

### Tech

| Item | Where | Why it fits |
|---|---|---|
| Cosmetics are data: `economy/cosmetics.json` generates `CosmeticDef` ScriptableObjects; exactly one source field (`pearlPrice`, `earnedBy`, `supporterSetId` or `passId`); no field can name a stat, a random table or a grant | §5 | No bespoke C# per item. Agent-friendly and safe. |
| Localisation keys `cos.<id>.name`, `.desc`, `.unlock` in the `KW_UI` table | §5 | Clean text pipeline. |
| Loadout replication: 12 `ushort` ids (24 bytes) in one owner-written NetworkVariable, sent on change and at spawn; the host checks each id and substitutes the default if wrong | §2 Loadout | Fits NGO host mode and 8-player lobbies. Try-ons stay local. |
| DLC via `IDlcOwnership` (`SteamDlcOwnership` in players, `MockDlcOwnership` in editor and dev builds); one DLC AppID per set; buying opens the Steam overlay store; offline cache 30 days; no ISteamMicroTxn, no Steam Inventory, no Unity IAP | §9.2 | No servers needed, no trading market, no in-game payment UI. |
| Build-failing EditMode tests C1–C6, C8–C14 (stat or random fields, grants, "%" without data, no countdowns, licences, paid/earned overlap, readout fakes, envelopes and budgets, class names in item names, price table, NPC loadouts, flashing, "never cut" yields) | §17 | Rules that agents can't quietly break. P2 and fairness. |
| Telemetry events (`mirror_open`, `tryon`, `wishlist_add`, `buy_pearls`, `equip`, `prestige_unlock`, `featured_click`) and health checks, plus the "Worth it?" revert rule | §16 | Tunes for player trust, not for revenue. |

### Progression and economy

| Item | Where | Why it fits |
|---|---|---|
| Rarity is a price and a craft budget, never a drop rate. Fixed prices 150 / 400 / 900 / 2,000, never discounted, never raised. A change may only lower prices or raise yields. | §4, §8.1, test C14 | Clear and fair. The player always knows what an item costs. P1. |
| Four sources that never overlap: default, Pearls, prestige (earned only), Supporter (paid) | §6 intro, test C6 | Simple mental model for where an item comes from. P5. |
| Pearls never expire, cap, convert to or from money, or gate play. A help page states the earn rules with numbers bound to data. | §8.1 | Honest economy. P1. |
| Pacing rules: first Common in the first session; a new Common always within 1–2 play sessions; no item costs more than ~6 hours of play | §8.2 | Keeps the "addictive but fair" feel. P4. |
| Prestige tiles show the exact rule and a deterministic progress bar (`Bestiary pages 7 / 8`) | §6.3 intro, §7.3 | The player knows what to do next and why. P1. |
| Unlock lines name their cause: `[ FREE HAT ] Bell Cap. Because: you beat the Keeper.` | §6.3 #37, #41 | Every gain has a readable reason. P1. |
| No streaks, no login rewards, no daily bonus; a rest bonus rewards breaks instead (Well-Rested doubles Pearls for 2 sessions) | §12.2 rule 7, §8.1 | Fair progress without check-in habits. |
| Event items are earned by play, show an end date (never a countdown), and get an archive challenge forever after | §11 | No FOMO; fits a long-lived shared world. |

### UI

| Item | Where | Why it fits |
|---|---|---|
| The Mirror is a toy: selecting any tile tries it on at once, with a slot-specific preview (hat drops and squashes 12%, skin wipes on in 0.35 s, glow steps through all levels); `TRYING ON` tag; others never see try-ons | §7.2 | Instant, playful feedback with no manual. P4. |
| Tile states: Owned, Equipped, Wishlisted, Affordable, Not yet ("N more Pearls"), Prestige (rule plus bar), Supporter (real Steam price) | §7.3 | Every tile says what it is and what it needs. P1. |
| Tiles never show "limited", "leaving soon", timers, was/now prices, discounts, owner percentages (except real Steam achievement data) or who bought it | §7.3 | Calm, honest shop. |
| Featured shelf keyed to play, never the clock: "Seen" (an item a character wore near you), "Closest" (nearest wishlist item), "New" (latest update, or a prestige item with its rule) | §7.4 | Suggestions come from the world you played in. P1, P2. |
| Wishlist uses a star ☆, and a thin results bar fills toward the wished item (`Acorn Cap · 120 / 150`, then `[ AFFORDABLE ] Acorn Cap.`); no buy button in the results | §7.5 | A visible next goal with no pressure. P1. |
| Collection counts per tab (`Hats 5 / 13`), earnable items only; no completion rewards; 4 saved outfits | §7.6 | Organised progress. P5. |
| "See on Rivals": line up 3 characters wearing the item | §7.2 step 6 | Shows how an item reads in a crowd. P6. | 

### Business and ethics (still valid: Steam, skins, cosmetic shop)

| Item | Where | Why it fits |
|---|---|---|
| Never sold: power, boosters, currency, randomness (no loot boxes), revives, classes, skips, energy, timers, information, light, prestige or Pearl items | §12.1 | The fairness core. Matches the owner's "addictive-but-fair". |
| 13 retention ethics rules (cosmetic only, no paid randomness, direct prices through Steam, no clock pressure, no nudges or friend names, grind never splits friends, kids and ratings, "Worth it?" outranks revenue) | §12.2 | Each has a test or a telemetry check. |
| Supporter rules: one row at the bottom of the hub Mirror; nothing marks who paid; NPCs never wear paid items; paid is capped at the Epic craft budget; paid never sells light | §9.3, §6.4 | Paying players are welcome but never above earners. P6. |
| Two 4-piece Supporter Sets (hat, skin, croak, tongue) as Steam DLC; Teacup Set (cosy, merch-ready) | §6.4, §9.1 | Small, clear paid offer. |
| Store copy: *"Hats. So many hats."* and *"Earn every cosmetic by playing. Two optional Supporter Sets on Steam. No loot boxes. Nothing random for sale. No currency to buy."*; a hat-lineup screenshot of 8 frogs | §15 | Honest, short, human. P3. |
| Ratings: declare in-game purchases (DLC only); never "Includes Random Items" | §15.6 | Fits the no-randomness rule. |

---

## Party-only (to archive)

| Item | Where |
|---|---|
| Slot 8 **Betrayal Snap** and its items: #10 Clean Cut, #35 Scissor Snip, #36 Opera Curtain; its try-on on "a dummy Vex with a fake crimson thread" | §2, §6.1, §6.2, §7.2 |
| Betrayal readouts: the Betrayal Cam (0.8 s), `[ TRAITOR ]`, the crimson Cut thread, the crimson tell tongue tip, the WANTED poster, Vengeance slime | §2, §3.1 |
| The betrayal-crimson hue ban as written (no cosmetic hue within 15° of `#E8254F`, about 330°–2°) and test C7 | §3.1, §17 C7 (re-home only if v2 keeps crimson as a danger colour) |
| Cut and Mimic tells as keep-outs: Doppelfrog's sideways blink, glowing eye pair, cheek puff, 0.6 s lean-in wind-up; "the face carries the Cut tell" | §3.1, §3.3 |
| Betrayal-side prestige and its rule: #47 Bounty Hunter (first Vengeance), #48 Quicksilver Bowler (win `doppelfrog` as the Mimic, ≥ 3 humans, ≥ 5 voters), #49 Busted (voted out as the Mimic) | §6.3 |
| Heart-door unlocks: #43 Three on a Pad needs `heart_two_pads`, `heart_split_swallow`, `heart_tied_bridge` and the `doppelfrog` vote (the hat's look is reusable) | §6.3 #43 |
| #44 True Knot (keep one Knot tether from Landing 3 through a Warden clear with no Cut) | §6.3 #44 |
| #45 Trust Fall's unlock (a catch in the Warden's Trust Fall); the emote itself could survive as a co-op emote | §6.3 #45 |
| Secret classes revealed mid-climb by a secret quest (`Pip's frog changed: ECHO TOAD`): Mime Frog, Echo Toad, Horned Frog, Glass Frog, Lily Walker, Bell-Eater | §6.6 |
| Rival roles built on deceit: Vex "the opportunist wears his Mimic win", Maud "the charming liar", Gutter with the Bounty Hunter; barks by Vex ("The Keeper's hand-me-down") and Gutter ("You. Again. Nice star.") | §13.1, §13.2 |
| Kestrel's cone bouncing off "during the first laugh" (the party's opening prank beat) | §3.2 |
| Ethics rule 10: "Betrayal never takes Pearls or cosmetics"; "nothing rewards Cutting a friend" | §12.2, §6.3 |
| Store positioning that leads with "the well reveal, the monster doors and betrayal"; DLC screenshots "in a Betrayal Cam" | §15.2, §15.5 |
| §18 "If the Wick ships instead": the candle-hero fallback for v1 | §18 |

---

## Conflicts with the new pillars

| Item | Pillar | Why it conflicts | Suggested fix |
|---|---|---|---|
| 10 Mirror tabs (8 slots and 2 extras), 5 buttons (Equip, Buy, Wishlist, See on Rivals, Outfits), 3 lighting presets, a Featured strip | P4, P5 | Too much for a low learning curve on first open. | Launch with 4–5 slots (Hat, Skin, Glow colour, Emote, maybe Croak). Add slots in later updates. |
| System window theme and Tadpole ghost as extra slots | P5 | Rarely seen by others, yet each adds a tab. | Cut for launch, or fold into a later "extras" tab. |
| The Mirror exists only as physical stations (hub and Landing); Supporter items only in the hub | P5 | Equipping must be reachable in 2 inputs or fewer from play. A walk-to station alone breaks that. | Put Wardrobe (equip, wishlist, outfits) in the main menu. Keep a town Mirror or tailor as the fun place to try on and buy (P6). |
| Mirror unlock at "the first Keeper clear or the end of the first climb" | P1, P4 | No Keeper or climbs in v2. The idea (no shop before the core loop is learned) is right. | Unlock after the first town quest, with the Bell Cap gift. |
| Climb vocabulary in every unlock and pacing rule: Keeper, Warden, Landings (40 s timer), Hell, Quick and Full Climb, floors, layers (Well, Rim, Sky, Space, Beyond), surfacing, Tower Rank C/S/SSS, Wish Coins, Boons, Rule and Heart doors | P2 | Contradicts one connected world with one story. | Re-key to quests, regions, the world journal and play hours. Build a v2 glossary before renaming items. |
| Door-entrance slot fires when you "cross into a new room"; #52 Redacted is tied to Hell's redacted rule text | P2, P6 | An open world has no room-by-room doors. | Repurpose as an "arrival" effect (entering a town, fast travel) or cut. |
| Earnings formula: Wish Coins ÷ 2, +10 per floor, +20 per page, paid out at a results screen after each climb | P1, P2 | Run-based. A persistent world needs earnings from quests and discovery. | Keep the rates' spirit (first Common in session 1; ~130 Pearls per ~25 min) and re-derive from v2 activities. |
| Glow Level Lv1–10 and "Body and Build reset every climb"; the Crown glow halo at Lv10 | P1, P2 | The body HUD meant per-run growth. In a persistent world its meaning changes. | Keep "growth is light" if v2 keeps levels; redefine what the glow shows. |
| Human-world objects: Traffic Cone, Strawberry Jeans, Kazoo, Opera Curtain, newspaper Paper Boat, Teacup | P2 | Off-theme unless the world's rules say human things fall into the well. | Decide the rule in the world bible. If things fall in, these become found objects with a story; if not, restyle. |
| Candle-Toad Supporter Set is an homage to the dropped candle hero | P2 | Means nothing to a new player without the v1 history. | Give it an in-world reason (a lantern-keeper trade, for example) or replace it. |
| Complex prestige rules (≥ 3 humans and ≥ 5 voters; 3 climbs from Landing 3 through a Warden; at most 5 revives per climb) | P1 | Hard to read and hard to aim for. | One-sentence rules only, always shown on the tile with a progress bar. |
| "Legendary" is both the top price band and a Boon rarity | P2, P5 | One word, two meanings (the source's own open question 2). | Check against the v2 glossary; rename one if both survive. |
| Rivals are bots that fill empty seats in a climb | P6 | v2 characters live in towns, not in lobby seats. | Keep "NPCs wear obtainable items"; drop the seat-filler role. |
| "The Landing never waits for anyone in the Mirror: its 40 s keeps running" | P4, P5 | Shopping under a timer. | No timers near shopping in v2. |
| Non-expiring pass [LATER] with progress in "doors reached", 1 step = 20 doors | P2, P5 | Climb-based, and a third progress track to explain. | Keep LATER. If ever built, progress from any play in the world. |
| Base game $7.99 with a gift 4-pack; revenue case built on a party game | (business) | Sized for a party climber, not an open-world co-op game. | Recheck price at v2 launch; keep "the base game carries the business". |

---

## Key numbers and names

### Prices and rarity

| Rarity | Pearls | Label colour | ≈ v1 Full Climbs |
|---|---|---|---|
| Default | free | `#8A8F98` | — |
| Common | 150 | `#B8C4CC` | ~1.2 |
| Rare | 400 | `#4FC3F7` | ~3 |
| Epic | 900 | `#B388FF` | ~7 |
| Legendary | 2,000 | `#FFD76A` | ~15 |
| Prestige | earned only | `#FFF1C1` with a slow shimmer | — |
| Supporter | Steam DLC | `#7EE0A1` | — |

- Catalogue: **60** items = 12 default + 24 Pearl + 16 prestige + 8 Supporter. 6 more earned hats are listed as LATER (§6.7).
- Milestone A Pearl set: 12 items costing **4,800** Pearls. Full Pearl catalogue: **12,800** Pearls (~95 v1 Full Climbs at ~130 each).
- v1 payouts: first Quick Climb ~**208**, first Full Climb ~**348**, later Full Climb 90–160 (median ~130), later Quick Climb 50–80, **+50** once on first surfacing, **+20** per new Bestiary page, **+10** per floor.
- Pacing: a new Common within 1–2 sessions; no item above ~15 Full Climbs (~6 hours).
- Supporter Set target **$3.99** (band $2.99–4.99); bundle ~15% off; base game **$7.99**; gift 4-pack; DLC ownership cache **30 days** offline.
- Pass [LATER]: 20 steps; gate needs 90 days live and "Worth it?" ≥ 60%; free track +60 Pearls on 8 steps (480 total).

### Body, envelopes and budgets

- Frog height **H = 0.60 m**. Hat box ≤ 0.55 H × 0.50 H × 0.45 H (0.33 × 0.30 × 0.27 m). Seat cylinder radius 0.15 H, depth 0.05 H. Eye-dome keep-out +0.02 H. Saddle margin 0.04 m.
- Tongue tip ≤ 0.06 m sphere, ≤ 300 tris; tongue radius ±10% max; trail ≤ 0.3 s.
- Emote ≤ 3.0 s, interruptible; emote prop ≤ 0.35 m, ≤ 800 tris; 4 emotes equipped; 4 saved outfits.
- Door-entrance effect ≤ 0.8 s.
- Per frog: ≤ 3,000 cosmetic tris (hat ≤ 1,500), hat ≤ 2 material slots, ≤ 60 particles (hat ≤ 20), **0** Light components, sounds ≤ −18 dB under the croak, marking coverage 12–20%.
- Flashing: no luminance change > 10% faster than 3 Hz.
- Frame budget cited from D §12: host ≤ 8 ms, frame ≤ 16.6 ms at 1080p with 8 seats.
- Hat pop: impact ≥ 6 m/s, pop 0.3 m, re-seat in 0.5 s.
- Loadout: 12 `ushort` ids = 24 bytes.
- Mirror camera: 0.35 s ease, 1.4 m, FOV 35, world dims 30%, panel on the right 40%, 3-column grid.

### Names worth keeping consistent

- **Currency and places:** Pearls, the Mirror, Featured shelf, Wishlist (☆, never ♥), Outfits, Supporter Sets, Well-Rested; v1 scene ids `hub_well_bottom`, `landing_well`.
- **Defaults:** Pond Lime skin (body `#7ED957`, belly `#F4EDC9`), Firefly glow (core `#F2F77A`, edge `#B8E85A`, fireflies `#FFF6A8`), Pond Croak ("rr-ibbit"), Coral Tongue (`#F7A08C`), emotes Wave, Point, Clap, Shrug; Tower Blue System window (panel `#0B1630`, border `#5CE1E6`). There is no default hat.
- **Signature items:** Bell Cap (first gift), Rim Stone, The Tiny Well, Crystal Frog, Stained Glass, Aurora, Explorer's Pith Helmet, Heron Feather, Moth Antennae, Moon Crown, Lantern Tadpole.
- **Supporter Sets:** `set_candle_toad` (Taper Candle, Candlelight, Match Strike, Wick Cord); `set_teacup` (Teacup, Porcelain, Kettle, Ribbon).
- **Characters and their looks:** Moss, Vex, Pell, Lumen, Brother Brass, Kestrel, Maud, Pip, Ines, Gutter (§13.1). Seat Hue colours used in items: Moss green `#9BE07A`, Pip teal `#6FF0D6`.
- **Classes:** open Tree Frog, Bullfrog, Dart Frog; secret (party) Mime Frog, Echo Toad, Horned Frog, Glass Frog, Lily Walker, Bell-Eater.
- **Lighting:** Landing lanterns `#FFB86B`.
- **Tech names:** `economy/cosmetics.json`, `economy/supporter_sets.json`, `CosmeticDef`, `SupporterSetDef`, `IHeroBody`, `IDlcOwnership`, `SteamDlcOwnership`, `MockDlcOwnership`, `KW/ToonLit`, `Editor/CroakSynth.cs`, `Editor/CosmeticThumbnailBaker`, `Tools/Blender/cosmetics/<id>.py`, `KW_UI` table, keys `cos.<id>.name/.desc/.unlock`, `ShopEnforcementTests`, `presentation/palette.json`, `licenses.csv`.
- **Unlock line format:** `[ TAG ] Item. Because: cause.`

---

## External facts checked

- WCAG 2.3.1 limits content to three flashes in any one second, and a general flash is a pair of opposing changes in relative luminance of 10% or more. This supports the source's 10% / 3 Hz rule. https://w3c.github.io/wcag21/understanding/three-flashes-or-below-threshold.html
- Steamworks `ISteamFriends::ActivateGameOverlayToStore(AppId_t, EOverlayToStoreFlag)` opens the Steam overlay to a store page; passing a DLC's app ID shows that DLC. This supports §9.2's "buy only in the Steam overlay". https://partner.steamgames.com/doc/store/application/dlc and https://partner.steamgames.com/doc/api/isteamfriends
- DLC install checks live in `ISteamApps` (the source uses `IsDlcInstalled`). https://partner.steamgames.com/doc/api/ISteamApps
- Netcode for GameObjects `NetworkVariableWritePermission` has an `Owner` option, so the owner-written loadout variable in §2 is supported. https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.5/manual/basics/networkvariable.html
- Not re-verified: the source's WEBTOON paying-share figure (§14, cited to the v1 research report). Treat it as unverified.

<!-- END -->
