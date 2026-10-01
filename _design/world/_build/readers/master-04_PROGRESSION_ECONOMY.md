# Reader: master/04_PROGRESSION_ECONOMY.md

- **Reader id:** master-04_PROGRESSION_ECONOMY
- **Source:** `_design/master/04_PROGRESSION_ECONOMY.md` (KNOTWELL v1, version 1.0, dated 2026-09-29, 1,082 lines). Read in full, lines 1 to 1082.
- **Read on:** 2026-09-30, for the v2 redesign (one open world, one story, 8-player co-op lobbies, no betrayal).
- **Pillar keys used below:** P1 Clear · P2 One world, one story · P3 Genuine · P4 Easy to start · P5 Organized · P6 Open world, together.
- **No external facts are claimed in this file.** Every fact below comes from the source file, cited by its section (§).

---

## Summary for the archive

`04_PROGRESSION_ECONOMY.md` is the KNOTWELL v1 master spec for how a frog grows and what the game pays out. It is bound by `DECISIONS.md` and `FUN_OVERHAUL.md`. It owns yields, levels, powers, classes, ranks, the Bestiary, the currencies, the results screen, difficulty, saving and the tests that guard them.

What it decided:
- Three growth tracks. Body (Glow Level 1–10, verb ranks I–IV) and Build (Boons: 4 passive + 1 Power) reset every climb. Legend (Tower Rank F–SSS, talents, Bestiary, classes, Pearls) never resets.
- Five laws: growth is light, never size; numbers bind to room thresholds; no clamp; no compounding; the System never lies.
- Fireflies are XP only, paid 70% as a clear bonus and 30% loose. Level n needs 15·(n−1)(n+2)/2 fireflies, so Lv10 is 810.
- The verb you use most ranks up, and the System says why.
- A pool of 16 Boons, 4 Duos and 4 Legendaries; 9 classes (3 open, 6 from secret quests); a 14-page Bestiary with death tips.
- Wish Coins last one climb and convert to Pearls, which buy only cosmetics. There is no paid currency; Supporter Sets are Steam DLC. Jars have fixed contents.
- Well-Rested replaces streaks, a break line appears after 90 minutes, and every climb pays, win or lose.

The goal was an honest roguelite climb where the player feels stronger, laughs or sees something bigger about every 90 seconds.

---

## Reusable for v2

### World and lore

- **Light is the XP** (§2.1, §2.3). Fireflies are the only growth, and growth "literally pushes back the dark": the belly light's range grows from 2 m to 6 m. *Why it fits:* the story theme (a small frog carrying light into a dark well) and the progression are the same thing (P2). Dark places in the open world can ask for a brighter frog, a gate the player can see and understand (P1).
- **Pests become light** (§4): mites pop into 1 firefly each; firefly clouds hold 2–4; pots hold 1–2. *Why it fits:* clearing the world's small pests feeds your glow. Reward and theme match (P2).
- **Wish Coins falling through the Mouth** (§10.1 "the Mouth's rain": 4, 8, then 12 coins; tongue-catch one before it lands for +1). *Why it fits:* the name already suggests coins wished down the well from the world above. That gives money a place in the story (P2), and a coin shower is a shared event that every frog nearby can join (P6).
- **Climbing out is the long goal** (§8.2 Rank S needs "surfaced the Well", bark "S means you climbed out"; §10.4 +50 Pearls on first surfacing). *Why it fits:* the Mouth is the one story direction. Tying the biggest milestone to reaching it keeps the story and the progress pointing the same way (P1, P2).
- **The Bestiary as a field guide** (§9): one page per creature, a toon render, stamps for Seen, Survived, Cleared and Hidden clear. *Why it fits:* a natural home for lore and creature personality (P2, P3). In v2 it can be organised by region instead of by door.
- **A creature roster built from real pond animals** (§9.1): the heron (Heron Shadow), the snake (Snake Coil), the eel (Fog Stair), the pike (Lily Raft), the snapper (Snapper Crossing), the Moss Snail, the Web Spider, plus the Bell-Golem, the Lamp-Knight, Echo Warren, the Keeper (Bell on the Raft) and the Warden (The Jar). *Why it fits:* a frog's real predators seen from 0.95 m tall make threats feel genuine and belong to one world (P2, P3). They can live in regions of the open world instead of in doors (P6).
- **"Never a kill"** (§3 Thunder Croak: "never a kill"; §6.3 #5: staggers never clear a room and never kill). *Why it fits:* a gentle, consistent tone. Frogs outwit and push back big animals; they do not slaughter them (P2, P3).
- **Frog species as classes** (§7.2): Tree Frog, Bullfrog, Dart Frog, Glass Frog, Horned Frog. *Why it fits:* each class is a real kind of frog with a trait a player can guess from the name (tree frogs glide, bullfrogs are loud, glass frogs are see-through). Real and specific, not generic fantasy classes (P3, P4).

### Characters and design

- **Three open classes that map one-to-one to the three verbs** (§7.2): Tree Frog = Hop (Glide Leap), Bullfrog = Croak (Belly Boom, 8 m), Dart Frog = Tongue (Dart Tongue, 10 m). *Why it fits:* a ready-made set of light roles that anyone understands in one line (P4), that other players read at a glance (P6), and that come straight from frog biology (P3). Strong candidate for the v2 starting roles.
- **Class markings as the role readout** (§7.1, §7.2): Tree Frog green with white side stripes; Bullfrog olive with a gold throat; Dart Frog electric blue with black dots; Glass Frog a translucent belly with a visible glowing heart; Horned Frog orange horns over the eyes; Echo Toad concentric rings on the back; Lily Walker a leaf-vein pattern; Bell-Eater brass belly bands; Mime Frog a white face with black stripes. *Why it fits:* specific, memorable designs on one rig (P3); roles visible across a town (P6). The markings do nothing mechanically, which keeps them honest.
- **Body parts that show abilities** (§3 body readouts): spring heels (glowing ankle bands, later shin stripes), a glowing tongue-tip bead (later a 0.3 s light ribbon), the Twin Toll throat sac with two bell marks (later a crackle mask). *Why it fits:* players see what a frog can do without opening a menu (P1), and others see how far someone has come (P6).
- **Orbiting fireflies and the Crown glow** (§2.3): Level − 1 fireflies orbit you; Lv10 adds the Crown glow. *Why it fits:* status everyone can read in a crowd, a core MMO feeling (P6).
- **Warm reactions to your growth** (§3: "Since when does your tongue do *that*?"; §8.3: "D already? Who *is* this frog?"). *Why it fits:* characters who notice you make the world feel lived-in (P3). In v2 these lines move to town NPCs; the rival bots that spoke them are archived.
- **Titles as friendly callouts** (§12): Safe Hands, Bell Ringer, Mite Popper, Belly Flop, Swallowed, Spotless, Chorus Leader, Egg Carrier. They pay nothing. *Why it fits:* specific, funny praise for how someone played, never a ranking of who was worst (P3, P6).

### Frog mechanics and abilities

- **Verb ranks with named unlocks** (§3): Hop (charged 1.9 m → 2.4 m → Air Hop → 3.0 m with a 3 m stomp), Tongue (3 m → 4.5 m with grapple → Long Tongue 6 m → 8 m chain grapple), Croak (4 m → 6 m with a 1 s stagger → Twin Toll → Thunder Croak 9 m). *Why it fits:* three verbs, deep growth, and each rank opens new ground. That is how an open world pulls a player back to old places (P2, P6).
- **"Numbers bind"** (§1 law 2, §3): places are authored against exact rank numbers (rank-II ledges at 2.3 m for a 2.4 m hop). *Why it fits:* in an open world this becomes a visible ability gate: "come back when you can Air Hop" (P1, P6). It only works if the gate is signposted in the world (see Conflicts).
- **The "Because:" line** (§3): `[ TONGUE II ] 4.5 m. Grapple unlocked. Because: you grabbed 14 things.` *Why it fits:* says what changed, what it does, and why it happened, in one line (P1).
- **Shared loot by design** (§4, §10.2, §2.1): a pot gives 1 coin to every frog in the room, ghosts included; a room jar pays every frog present; the clear bonus is split equally. *Why it fits:* no loot races, no kill-stealing, and strangers are glad to see each other (P6). This is the most important economy rule to carry into a shared world.
- **The heal bug** (§10.3): a carried 0.1 kg prop, tongue-passable, that gives +1 spot when you drop to 1. *Why it fits:* a simple item you can hand to a friend (P6, P4).
- **Co-op abilities from the Boon pool** (§6.2), rebuilt as permanent class perks or world abilities instead of run pickups:
  - Lifeline: tongue-catching a falling frog heals it 1 spot.
  - Chorus: 2 frogs croak within 0.3 s and monsters in range stagger for 2 s.
  - Frog Choir: 3+ frogs croak within 0.3 s and every frog within 10 m is launched 4 m up.
  - Leapfrog: hop off a friend's head for a 3 m launch; they feel nothing.
  - Spring Legs II: a charged landing leaves a 1 m bounce pad for 3 s that any frog can use.
  - Shared Glow: frogs within 6 m get +10% of your bank, none of it taken from yours.
  - Tell-Sight: monster cues reach you 1 s early, shareable with nearby frogs at higher ranks.
  - *Why it fits:* each one pays off only with other frogs nearby (P6), and each is one sentence long (P4). Frog Choir in particular is a perfect "strangers in a town square" moment.
- **Helpers that should probably be default behaviour** (§6.2): Sure Tongue (the tongue snaps to levers, keys, bells and anchors inside a 15° cone) and Firefly Sense (clouds, pots and jars shown through walls within 15 m; an entry count line `[ 3 CLOUDS · 5 POTS ]`). *Why it fits:* aim help and find-it help lower the learning curve with no wiki (P1, P4).
- **Traversal toys** (§6.2, §7.2): Sticky Pads (cling 2 s, wall-jump 1.4 m), Moon Hop (a triple hop), Glide Leap (fall speed 1.2 m/s for 1.5 s), Pad Drop (a mid-air lily pad, 1.2 m wide, holds 2 frogs for 4 s). *Why it fits:* open-world travel tools (P6); Pad Drop doubles as a co-op platform.
- **Fairness ceilings** (§1 laws 1 and 4, §6.3 #7, §7.1): nothing changes spots, hitbox, base speed or shove; no loot rate scales with level; anything that moves another frog obeys a 1 m tug cap and never pushes toward a drop. *Why it fits:* players at very different levels can share one world and one encounter fairly (P6).
- **Stagger immunity** (§6.3 #5): a creature that just recovered from a stagger is immune for 4 s. *Why it fits:* 8 frogs cannot lock a big creature forever (P6).
- **Synergy and clash icons** (§6.4): `↔ Moon Hop`, `⚠ Eats your Bold Belly`; "The System never hides a clash." Named combos such as Spring Legs + Leapfrog ("the frog trampoline") and Shatter Croak + Chorus ("the coin shower"). *Why it fits:* combos are shown, not discovered on a wiki (P1).

### Progression

- **The design filter** (header): "does it make the player feel stronger, laugh, or see something bigger within about 90 s? A row that only adds bookkeeping was cut." *Why it fits:* a one-line test that keeps v2 simple (P4, P5).
- **The cadence contract** (§1): something small every 10–30 s, a bigger beat about every minute, a power about every 2 minutes, a milestone about every 5 minutes, a scale reveal about every 24 minutes. *Why it fits:* the still-valid "addictive-but-fair feeling of progress", as numbers that can be re-cut for open-world quests and travel (P1).
- **First-session numbers** (§5.1, §13.1, §14.3): first reward by 0:20 (Lv2 in the hatch pond); first power at about 2:00; first big unlock at about 7:00. Stop conditions: median time to first power over 3:00, or testers unable to name a power they gained. *Why it fits:* matches P4's 60 s and 5 min targets and gives ready-made acceptance rows.
- **Progressive disclosure** (§6.1, §7.1, §11.2): the first session has no choice screens; gains arrive on their own with a one-line reason; choice unlocks later; the first climb has no classes; "onboarding never waits on a win". *Why it fits:* the lowest possible learning curve (P4).
- **Every session pays, win or lose** (§8.1, §12). Rank Points are paid on failure too. *Why it fits:* failure never wastes a player's time (P4).
- **A public rank letter on the name tag** (§8.3). *Why it fits:* other players see your experience in towns and lobbies (P6). The letters and the "Tower" name need rework (see Conflicts).
- **Small, switchable talents** (§8.2): granted automatically, each can be switched off, all together worth about "one room of head start", and none touches another player. *Why it fits:* veterans get a little comfort without leaving new friends behind (P6).
- **Rank never gates a mode, and unlocks cover the whole lobby** (§8.2, §11.1: "A new friend can join a veteran's Hell climb"). *Why it fits:* drop-in co-op without friction (P6).
- **Nobody joins behind the group** (§6.1 drop-in and comeback rules). *Why it fits:* the principle carries over as "a joining player is never useless in a friend's world" (P6). The run-based mechanics themselves do not carry over.
- **Death tips** (§9.3): the first time a creature beats you, its page fills with a warm tip that highlights the rule you broke; next visit, that clause glows gold for 3 s. *Why it fits:* the game teaches from your own mistakes, with no wiki (P1, P4).
- **The chase line** (§9.3): `Hidden clear: ???`, then a hint, then a sketch once found. The pause-menu Bestiary hides the page of the place you are in, so it never spoils a live puzzle. *Why it fits:* a clear optional goal with no spoilers (P1).
- **Bestiary hats** (§9.3): a hat at 4, 8 and 12 Cleared pages. *Why it fits:* exploring pays in cosmetics, which feeds the still-valid shop and skins goal.
- **Well-Rested** (§10.6): 1 rested session per 36 h away, at most 2; it doubles only meta rewards; "No streaks and no daily bonus, ever." The break line after about 90 minutes never blocks input and turns off with one tap. *Why it fits:* the fair half of "addictive-but-fair" (P3).
- **The lantern talent strand** (§8.2): 8 lanterns up a stone strand; lit means earned; tap to switch one off; the next one shows an exact bar (`Rank D: 64%`). *Why it fits:* light-themed (P2) and one place for all long-term progress (P5).
- **Honest near-miss** (§8.3, §12): a "so close" line is allowed only on a bar that fills deterministically. *Why it fits:* motivation without manipulation (P3).

### Economy and shop

- **A currency budget** (§10): one earned currency, one cosmetic currency, and no paid currency of any kind. Real money buys only Supporter Sets, sold as Steam cosmetic DLC at a direct price. *Why it fits:* simple (P5), fair, and matches the still-valid skins-and-shop decision.
- **Jars with fixed contents** (§10.2): Bronze 5, Silver 10, Gold 20 + a bonus; "no random contents, no reels, no spin-past animation"; jars never hold cosmetics or power; the opening is skippable. *Why it fits:* a jackpot feel without gambling (P3).
- **One stock, one price, for everyone** (§10.3): every player sees the same items at fixed prices, with no rotation and no race; each frog buys its own. *Why it fits:* organized (P5) and friendly in a shared world (P6). In v2, this is the town shop rule.
- **Pearls never buy power** (§10.4): never power, rerolls, keys, revives, jars, time or information. Earn rates are published and never cut. The whole catalogue can be bought at any time; "Featured" is a spotlight, not a gate. No shop countdown under 24 h (§14.2). *Why it fits:* a cosmetic shop players can trust (P3).
- **The price ladder** (§10.4): Common 150, Rare 400, Epic 900, Legendary 2,000 Pearls; the first Common is affordable in the first session (about 11 minutes). *Why it fits:* the skins wish lands in session 1 (P4).
- **The Mirror** (§10.4): the in-world place where the earned cosmetic catalogue lives. *Why it fits:* a real building for a town, not a menu (P5, P6).
- **Paid and earned catalogues never overlap** (§10.5), and Supporter Sets are 4-piece themes: hat, skin, croak voice, tongue trail. *Why it fits:* clear bundles; no one can tell what a player paid by looking at their power.

### UI and feedback

- **One-line System windows** (§6.6): every gain names the change and its cause. *Why it fits:* P1.
- **Overlays in the bottom third, and you keep moving** (§6.1): only one full-screen card in the whole first session; quests appear as banners, never full-screen (§7.3). *Why it fits:* a shared world never pauses for one player (P6), and the screen stays calm (P1).
- **Card anatomy** (§6.6): colour, name, rank pips, an effect line of 12 words or fewer, a synergy or clash icon, and a ribbon (NEW, UPGRADE). *Why it fits:* the 12-word rule is a good writing rule for every ability and quest line (P1, P3).
- **Quest progress on one hold** (§7.3): holding the Wheel shows the quest line and its pips (`Spit back 1/3`). *Why it fits:* quest info within 1 input (P5).
- **Results rules** (§12): line items with icons, never a formula; the rank bar fills last; two buttons of equal size; nothing starts by itself; skippable after the first time. *Why it fits:* clear and honest (P1, P3). In v2 it can become a session or chapter summary.
- **The curiosity teaser** (§12 #8): one line built from real state (`Something is waiting in 12E.`), also shown on the next launch, and it never uses a friend's name. *Why it fits:* the player always knows what to do next and why, even after a break (P1).
- **Published help and odds pages** (§10.2, §10.4). *Why it fits:* nothing hidden (P5).
- **The pouch icon** for rewards that open later (§4), and the one-tap `Worth it?  Yes · Meh · No` (§12). *Why it fits:* small, readable, low-effort feedback (P1).

### Art and audio

- **The level-up beat** (§2.3): a 0.6 s count-up at rising pitch, +1 firefly swoops into orbit over 0.4 s, 80 ms hitstop, a rising pentatonic arpeggio; nothing changes size. *Why it fits:* it uses the same pentatonic scale as the croaks in `02`, so progress sounds like the world (P2).
- **The Awakening beat** (§3): a 1.8 s fanfare, a 15% camera push-in, the new part pops 0 → 1.2 → 1.0 over 0.25 s, a full-body flash. Mastery is a shorter 1.2 s version.
- **The rank-up beat** (§8.3): the bar bursts into fireflies, 120 ms hitstop, the letter plate stamps down, at most 5.5 s, skippable after the first time.
- **Small sounds** (§10.2, §12, §9.2): jars pop 0.4 s apart with a rising chime; coins become pearls at rising pentatonic pitch; a 0.4 s ink-stamp thump for each Bestiary stamp.
- **Ability colours** (§6.2): amber `#FFB347`, cyan `#6FE3FF`, green `#7CF29A`, violet `#C58CFF`, gold `#FFD700`. *Why it fits:* reusable as colour codes for ability types (P1).
- **Beads on the neck** (§6.6): one small bead per ability, one larger bead for the active power; the power bead dims and refills as its cooldown. *Why it fits:* a readable "loadout necklace" others can see (P6).
- **Creature art for the journal** (§9.3): a toon render captured from each creature's prefab at build time. *Why it fits:* cheap, consistent art for an agent-built pipeline.

### Tech

- **All numbers in JSON, turned into ScriptableObjects by generators** (§14.1). *Why it fits:* agents tune the game without touching code.
- **Design laws as build-failing EditMode tests** (§14.2). The ones that survive the redesign: no ability field touches spots, hitbox, base speed or shove; no shop item references a gameplay stat or a random table; nothing sold for money grants currency, keys, rerolls or revives; every `%` in System text binds to a data key; no shop countdown under 24 h; every imported asset has a `licenses.csv` row; published prices match `Economy.json`; `MockDlcOwnership` is unreachable in release; the results order; the Well-Rested limits; quest predicates read only the owner's own events. *Why it fits:* the fairness promises stay true as agents change content (P3, P5).
- **Seeded, host-checked personal rolls** (§6.1): `SplitMix64(hostSalt, playerId, …)`, a host-only salt, a targeted ClientRpc to the owner, and the host rejects any pick not in that player's offer. *Why it fits:* cheat-safe rewards under NGO host mode (still-valid tech).
- **`IDlcOwnership`** (§10.5): `SteamDlcOwnership` calls `SteamApps.IsDlcInstalled(appId)`; `MockDlcOwnership` is editor and development only, compiled out of release, with a permanent banner `MOCK DLC: no purchase happened.` *Why it fits:* test cosmetics without real purchases.
- **Crash-safe saves** (§11.3): a seed plus a small JSON state at each checkpoint, and a pending-results record so the next launch pays anything owed. *Why it fits:* a persistent world needs the same "a crash loses nothing" promise.
- **Honest numbers from Steam** (§7.3, §10.6): real global unlock rates from `GetAchievementAchievedPercent` ("never an invented number"); `SteamUtils.SteamServerTime` for the rest clock; Steam Timeline featured markers on big moments (§3).
- **Opt-in telemetry with no personal data** (§14.3), with a short event list and stop conditions. *Why it fits:* measures P1 and P4 directly.
- **Cause tags on every rule clause** (§14.1) so a defeat can name the rule that was broken. *Why it fits:* powers the death-tip system (P1).
- **The exploit review table** (§13.5): each farming loop with its rate and a verdict. *Why it fits:* a simple method to keep the economy fair.

---

## Party-only (to archive)

- **Heart doors (♥) and their loot rules** (§2.1, §4, §6.2, §11.2, §16 #9): the catcher keeps spilled fireflies; the share-or-swallow jar `heart_split_swallow` (J = 2 × (8 + d)); Heart doors cost no Team Life so that a Rival's betrayal can never spend a solo player's life; the Heart-door bonuses on Boons (Bold Belly ×3, Quick Tongue +5 m snatch range); Frog Sling unguarded in Heart doors.
- **Firefly spills and "unbanked" cheeks as steal targets** (§2.1): a hit spills 20% of unbanked fireflies as a clump that others can grab. It exists to feed Heart-door betrayal.
- **The Risk (♥) Boon family** (§6.2): Deep Cheeks, Bold Belly, Quick Tongue, Last Gulp, and the Last Gulp + Bold Belly clash.
- **The Knot, the Cut and Duos** (§6.2, §6.5): Frog Sling, Lookout, Duet, Double or Nothing; a Duo guaranteed after a Knot forms; cutting the Knot breaks the Duo; Knot perks; a Rival offering the Knot at Landing 3.
- **Vengeance** (§6.1, §13.5): +1 choice for the victim once per climb, and the "faking betrayals" exploit check.
- **The Mafia beat** `doppelfrog` (§5.1, door 14).
- **The Meeting Door** (§2.1, §4, §6.1, §10.2): Meeting keys, the key prize, Meeting toys, the one item through a Meeting window, and "cleared with help".
- **Rival bots** (§6.1, §6.5, §7.3, §9.2, §10.1): picks by personality weights, purses that visibly shop, the Rival Register, Rival stamps, the Drama Director allowing Rival quest completions at half the human rate, Rivals croaking on your count, and the example names Pip and Maud in their barks.
- **Secret, private information** (§6.1, §7.3, §14.2): private offers and `OfferPrivacyTests`, private secret quests, the "Pip was a *Mime Frog* this whole time?" reveal, and public lobbies hiding the UNDERDOG line.
- **The betrayal-crimson hue gap** (§6.6): bead colours kept at least 15° of hue from the betrayal crimson.
- **Competitive toy doors and Landing toys** (§5, §10.2, §12): `toy_fly_catch`, `toy_lily_sumo`, Frog Stack, Jar Tag, the Sumo title, and a Silver jar to the winning team. This is the natural material for the owner's optional town side mode later; build nothing now.
- **The Warden's Trust Fall beat** (§5.1, door 20).
- **Guardrails that exist only because betrayal existed** (§7.3, §12): "no title counts betrayals", "quests never count betrayals", and the rejected "be betrayed three times" quest.
- **The onlooker chorus keyed to door skulls** (§8.3): "An F-rank cleared a three-skull door?!"
- **Shove as a frog-on-frog act** (§6.2 Deep Cheeks home effect: "shoves don't count as hits").

---

## Conflicts with the new pillars

- **Growth that resets every climb** (§1 Body and Build tracks, §2.4 Crown sparks after the Lv10 cap). **P6, P2.** A persistent world needs growth that stays. The Glow cap of 10 per climb and the "Crown keeps ticking" patch only exist because of the run structure.
- **Too many layers on one frog** (§1–§10): Glow Level, verb ranks, Awakenings, Masteries, 24 Boons in 4 families with 3 ranks, home-suit bonuses, 5 slots, rarity, rerolls, synergies, clashes, Legendaries, Duos, 9 classes with Signatures, secret quests, Tower Rank, talents, Rank Sync, 4 Bestiary stamps, fireflies, Wish Coins, Pearls, room jars and earned jars, a stall, Crown sparks, Well-Rested and Sealed. **P4, P5.** This needs a wiki. v2 should keep one visible level, the three verbs, a few named abilities and one role.
- **A Boon pick every ~2 minutes** (§6.1): an 8 s timer, auto-pick of a highlighted choice, 2 suit choices + 1 wildcard, 70/30 rarity rolls, ×1.5 upgrade weight, rerolls from 4 sources with hold caps, and replace-and-shatter. **P4, P1.** Constant decisions under time pressure, with hidden weights.
- **Card suits ♠ ♦ ♣ ♥ as ability families and door types** (§6.1, §6.2), while the same file says no Boon uses card, dice or chip imagery. **P2, P1.** Casino language does not belong in a frog's well, and the symbols do not explain themselves.
- **The hidden verb-rank rule** (§3): weighted usage counters (Croak ×1.5), a round-robin cap and a tie order. **P1.** The player cannot predict or steer which verb grows next. Keep the "Because:" line, but make the rule visible or simply fixed.
- **Invisible threshold gates** (§1 law 2, §3): a 2.3 m ledge against a 2.4 m hop is a 0.1 m margin the player cannot see. **P1.** In an open world every ability gate needs an in-world sign.
- **An economy written in doors** (§2.2, §5, §10.1, §10.3, §11): yield formulas in *d*, door types, the 70/30 split, banking at the door clear, failed rooms paying 50%, Team Lives, E, gold and Rematch doors, the Gold Key, plaque prize icons, Landings, Quick vs Full Climb, ★1, and Retry from door 11. **P2, P6.** v2 is one connected world, so every faucet needs a new source.
- **Banked vs unbanked fireflies** (§2.1). **P1.** A hidden rule tied to the door loop. If v2 keeps banking, the bank must be a visible place in the world.
- **Wish Coins that expire and convert** (§10.1, §10.3, §16 #4): coins last one climb, convert at ÷2 to Pearls on Rest, and a Resume starts at 0; "every coin spent is half a Pearl not earned". **P1, P5, P6.** Two currencies with a conversion rule confuse new players, and a persistent world needs money that persists.
- **Four difficulties with lives and chains** (§11.1): Easy, Normal, Hard and Hell with 3, 2 or 1 Team Lives, lobby unlock chains, Hell's always-redacted rule text, and Sealed rooms. **P4, P6, P1.** One shared world needs one set of rules; redacted text is unclear by design.
- **Secret classes from hidden quests** (§7.1, §7.3): assigned privately at a fixed door, changing your class mid-climb, and expiring with the climb; classes picked at the hub "before hatching". **P1, P5.** The owner wants light, visible classes. In v2, class trials should be visible, offered by an NPC of that species, and saved.
- **Two meanings on the Power button** (§7.1, §16 #1): tap for the Power Boon, hold 0.4 s for the class Signature; and the button is mostly idle in the first session. **P4, P5.**
- **"Tower" inside a well** (§6.1 "The Tower will let you choose now", §8 Tower Rank, §10.6 "THE TOWER WILL WAIT"). **P2.** The world is a well; the voice calls it a tower. v2 needs one in-world name for the place and for whoever speaks.
- **A System voice with no speaker** (§3, §6.1, §7.3: `[ HIDDEN CONDITION DETECTED ]`, `[ CHOICE UNLOCKED ]`). **P2, P3.** A voice borrowed from Korean power-fantasy stories reads as generic unless the story gives it a speaker (for example, the Well itself or a named character).
- **Rank letters F to SSS, with SS and SSS gated on surfacing the Sky and Space** (§8.2, §15 LATER). **P2, P4.** Gamer jargon, and a Space layer sits outside the well story. Fewer ranks with in-world names would read better.
- **Jargon count** (whole file): Glow, Awakening, Mastery, Boon, Duo, Legendary, Signature, RP, Tower Rank, talents, Rank Sync, Wish Coins, Pearls, jars, lineup, stall, Landing, Keeper, Warden, Sealed, Well-Rested, Crown sparks, hidden clear, Rematch. **P4.** Each new noun is a small wall; v2 needs a short glossary of a handful of player-facing words.
- **Off-theme creatures** (§9.1): the Chrono-Slime of Slime Foundry and the Glitch Eye. **P2.** Digital and time words break a natural pond world.
- **Time Gulp: swallowing the room clock** (§6.2). **P2, P6.** An open world has no room timers.
- **The stall only at Landings 2 and 3** (§10.3). **P5.** Shops belong in towns, always reachable.
- **A results ceremony tied to the end of a climb** (§12). **P6.** An open world has no climb end, so the summary needs a new trigger (logging out, returning to town, finishing a chapter).
- **The comeback bonus hidden in public lobbies** (§6.1). **P1.** A hidden boost is still hidden information.
- **Hidden clears that double the yield** (§2.1, §6.2 Third Eye's gold chalk). **P1, minor.** Secrets are good in an open world, but doubling rewards for hidden knowledge widens the gap between wiki readers and everyone else.
- **Talents that need a Rank Sync switch** (§8.2). **P5, minor.** If talents must be turned off to keep co-op fair, they may not be worth having.

---

## Key numbers and names

### Glow and light
| Item | Value | Where |
|---|---|---|
| Glow curve | total banked for level n = 15·(n−1)(n+2)/2 | §2.3 |
| Totals, Lv1 to Lv10 | 0, 30, 75, 135, 210, 300, 405, 525, 660, 810 | §2.3 |
| Steps | 30, 45, 60, 75, 90, 105, 120, 135, 150 | §2.3 |
| Orbiting fireflies | Level − 1; Lv10 adds the Crown glow | §2.3 |
| Belly emission | 0.35, 0.81, 1.14, 1.45, 1.73, 2.01, 2.27, 2.52, 2.76, 3.00 | §2.3 |
| Belly light range | 2 m → 6 m | §2.3 |
| Marking groups lit | 0, 0, 0, 1, 1, 2, 2, 3, 3, 4 | §2.3 |
| Crown sparks | every 75 fireflies past 810, at most +6, +5 coins each | §2.4 |
| Split | 70% clear bonus, 30% loose | §2.1 |
| Pickups | firefly cloud 2–4; mite 1; pot 1–2 fireflies + 1 coin to every frog present | §4 |
| Spill | 20% of unbanked, rounded up; drifts back after 3 s (party rule) | §2.1 |

### Verb ranks
| Verb | I | II | III (Awakening) | IV (Mastery) |
|---|---|---|---|---|
| Hop | apex 1.4 m, charged 1.9 m | charged 2.4 m (ledges 2.3 m) | Air Hop | charged 3.0 m; stomp pops mites within 3 m |
| Tongue | 3 m; props ≤ 20 kg | 4.5 m; grapple | Long Tongue 6 m; 2 things; snatch and spit | 8 m; chain grapple |
| Croak | pulse 4 m | 6 m; 1 s stagger | Twin Toll: 2 bells at once | Thunder Croak 9 m; 2 s stagger; never a kill |

Rank timing: II at Lv2–4, III at Lv5–7, IV at Lv8–10. Use weights Hop 1.0, Tongue 1.0, Croak 1.5; ties Tongue > Hop > Croak (§3).

### Pacing and first-session targets
| Item | Value | Where |
|---|---|---|
| Something ticks | every 10–30 s | §1 |
| A power | about every 2 min (about 13 per Full Climb) | §1, §5.1 |
| A milestone | about every 5 min | §1 |
| A scale reveal | about every 24 min | §1 |
| First reward | by 0:20 | §13.1 |
| First power | about 2:00; stop condition if the median passes 3:00 | §13.1, §14.3 |
| First big unlock | about 7:00 | §13.1 |
| Quick Climb / Full Climb | about 10:25 / about 22:30 | §5.1 |
| Break line | after about 90 min | §10.6 |

### Fairness caps
| Item | Value | Where |
|---|---|---|
| Tug cap on other frogs | at most 1 m, never toward a drop | §6.3 #7 |
| Stagger immunity | 4 s after recovery | §6.3 #5 |
| Shared Glow ceiling | +30% from all sources | §6.3 #4 |
| Reward multiplier ceiling | ×3.0 combined | §6.3 #3 |
| Signature input | hold Power 0.4 s | §7.1 |

### Classes
The "Verb" column is this reader's mapping, not a field in the source.

| Class | Verb | Signature | Numbers | Cooldown | Unlock |
|---|---|---|---|---|---|
| Tree Frog | Hop | Glide Leap | 1.5 s; fall 1.2 m/s; +2 m/s forward | 12 s | open |
| Bullfrog | Croak | Belly Boom | 8 m; knocks back 3 m; 1 s stagger; frogs ≤ 1 m | 20 s | open |
| Dart Frog | Tongue | Dart Tongue | 10 m lash | 15 s | open |
| Mime Frog | — | Decoy | 5 s croaking copy | 25 s | quest: clear a ♦ door without croaking |
| Echo Toad | Croak | Replay | repeats your croak 2 s later | 18 s | quest: ring 3 bells with one croak |
| Horned Frog | — | Spit Out / horn charge | escape 6 m; 4 m dash | 20 s | quest: be swallowed, leave with every spot |
| Glass Frog | — | See-Through | walls transparent, 3 s, 10 m | 25 s | quest: 3 rule doors in a row without a hit |
| Lily Walker | Hop | Pad Drop | 1.2 m pad, holds 2 frogs, 4 s | 15 s | quest: clear a room without touching the floor |
| Bell-Eater | Tongue | Swallow | store 1 projectile 8 s; spit 12 m | 20 s | quest: spit 3 projectiles back |

Later quest seeds (§7.3): "Stay in the Sleeping Toad's room for 20 s without waking it" (Sleeper); "Carry the egg across Snapper Crossing without it cracking" (Nurse Frog). Pacing target: about 50% quest completion, all 6 secret classes in 12–15 climbs.

### Economy
| Item | Value | Where |
|---|---|---|
| Jars | Bronze `#C8803A` 5 coins · Silver `#C9D3DC` 10 · Gold `#FFD700` 20 + 1 reroll | §10.2 |
| Jar lineup | 0.4 s apart, at most 4 s, skippable | §10.2 |
| Stall | heal bug 20 · reroll 25 · Boon upgrade 60 · Gold Key 80 | §10.3 |
| Mouth's rain | 4 / 8 / 12 coins; catch up to +2 | §10.1 |
| Pearls per session (v1 formula) | coins held ÷ 2, + 10 per floor, + 20 per new Bestiary page, + 50 on first surfacing, × 2 if Well-Rested | §10.4 |
| Cosmetic prices | Common 150 · Rare 400 · Epic 900 · Legendary 2,000 Pearls | §10.4 |
| Catalogue | 24 items (10 Common, 7 Rare, 5 Epic, 2 Legendary) = 12,800 Pearls; Milestone A has 12 items = 4,800 | §13.3 |
| First cosmetic | about 11 minutes into the first session | §10.4, §13.3 |
| Game price assumed | $7.99 | §13.3 |
| Supporter Sets | 4 pieces (hat, skin, croak voice, tongue trail), $2.99–4.99, Steam DLC | §10.5 |
| Well-Rested | 1 rested session per 36 h, at most 2 (72 h), ×2 meta rewards, used only past door 3 | §10.6 |

### Rank
| Rank | F | E | D | C | B | A | S | SS | SSS |
|---|---|---|---|---|---|---|---|---|---|
| Total RP | 0 | 20 | 100 | 250 | 500 | 900 | 1,400 | 2,200 | 3,300 |
| Colour | `#8A8F98` | `#9BD47A` | `#4FC3F7` | `#6E8CFF` | `#B07CFF` | `#FF9F43` | `#FFD84A` | `#FFF1A8` | `#FFFFFF` + 2 s shimmer |

RP sources: +2 per door reached, +10 Keeper, +25 Warden, +5 hidden clear, +5 new Bestiary page, +10 class unlock; late average about 61 RP per climb (§8.1, §13.4). Talents E to SSS: +1 reroll; start with a Common of your choice; see one door ahead; gold chance 5% → 7%; first-visit hint after 30 s; one free stall item; carry one Boon; two Rematch doors plus the Moon Crown (§8.2).

### Feedback timings
| Moment | Timing | Where |
|---|---|---|
| Level-up | 0.6 s count-up, 0.4 s swoop, 80 ms hitstop | §2.3 |
| Awakening | 1.8 s fanfare, 15% push-in, pop 0 → 1.2 → 1.0 over 0.25 s | §3 |
| Mastery | 1.2 s fanfare | §3 |
| Auto-granted power | 1.2 s bead flight, no screen | §6.1 |
| Pick overlay | 8 s (+4 s to replace) | §6.1 |
| Rank-up | ≤ 5.5 s, 120 ms hitstop | §8.3 |
| Class markings wash | 0.8 s | §7.3 |
| Bestiary stamp | 0.4 s each, up to 6 | §9.2, §12 |
| Death-tip clause glow | 3 s | §9.3 |
| Results, first time | about 20 s | §12 |
| Boon bead size | 0.03 m | §6.6 |

### Colours
Ability families: Body amber `#FFB347`, Sight cyan `#6FE3FF`, Chorus green `#7CF29A`, Risk violet `#C58CFF`, Legendary gold `#FFD700` (§6.2).

### Names worth keeping consistent
- **Light and growth:** fireflies (XP, never money), Glow Level, Crown glow, Air Hop, Long Tongue, Twin Toll, Thunder Croak, spring heels, tongue-tip bead.
- **Abilities worth reusing as names:** Lifeline, Chorus, Frog Choir, Leapfrog, Spring Legs, Sticky Pads, Sure Tongue, Tell-Sight, Firefly Sense, Shared Glow, Shatter Croak, Stomp, Moon Hop.
- **Classes:** Tree Frog, Bullfrog, Dart Frog, Glass Frog, Horned Frog, Echo Toad, Lily Walker, Bell-Eater, Mime Frog.
- **Creatures:** Bell-Golem, Heron Shadow, Snake Coil, Fog Stair (eel), Echo Warren, Moss Snail, Lily Raft (pike), Snapper Crossing (snapper), Lamp-Knight, Web Spider, the Keeper (Bell on the Raft), the Warden (The Jar).
- **Money and places:** Wish Coins, Pearls, Bronze, Silver and Gold jars, the heal bug, the Mirror (cosmetics), the Mouth, the Rim, the Well, surfacing, the lantern strand.
- **Cosmetics:** the Bestiary hat set, the free first hat, the Moon Crown, Supporter Sets.
- **Titles:** Safe Hands, Bell Ringer, Mite Popper, Belly Flop, Swallowed, Spotless, Hidden Hand, Chorus Leader, Egg Carrier.
- **Meta and care:** Well-Rested, the break line, the curiosity teaser, death tips, the chase line.
- **Data files:** `Yields.json`, `GlowCurve.json`, `VerbRanks.json`, `Boons.json`, `Synergies.json`, `Classes.json`, `Quests.json`, `Rank.json`, `Bestiary.json`, `Economy.json`, `Difficulty.json`, `ClimbTemplate_W1.json`.
- **Tests:** `GrowthCurveTests`, `BoonPoolTests`, `OfferPrivacyTests`, `QuestTests`, `RankTests`, `EconomyTests`, `EconomyBandTests`, `ResultsOrderTests`, `WellRestedTests`, `GrantPlanTests`.
- **Tech:** `IDlcOwnership`, `SteamDlcOwnership`, `MockDlcOwnership`, `SplitMix64`, `SteamApps.IsDlcInstalled`, `SteamUtils.SteamServerTime`, `GetAchievementAchievedPercent`, Steam Timeline, Cinemachine Impulse.
- **RoomDef tags to keep as world tags:** `Floor`, `canSwallow`, `hasProjectiles`, `EchoSpot`, `floorlessPossible`, cause tags on rule clauses, `hiddenClearHint`.

<!-- END -->
