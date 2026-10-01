# Reader notes: master/03_SOCIAL_AND_BOTS.md

- **Source:** `C:/Users/mrkl6/Downloads/Projects/Team CO-OP/make me a name/_design/master/03_SOCIAL_AND_BOTS.md`
- **Source version:** KNOTWELL v1 master set, 1.0, 2026-09-29, status BINDING. 1,825 lines, about 110 KB.
- **Read coverage:** every line, 1 to 1,825, in five chunks. Nothing skimmed.
- **Reader:** master-03_SOCIAL_AND_BOTS, for the v2 redesign (one open world, one story, co-op, up to 8 players per Steam lobby).
- **Section marks** below (§n) point into the source file. "v1" means the party climber. "v2" means the redesign.

---

## Summary for the archive

`03_SOCIAL_AND_BOTS.md` (KNOTWELL v1.0, 2026-09-29, 1,825 lines) was the binding social, bot and narrator spec for an 8-seat co-op party climber up a 20-door Tower inside a well. Its rule was "co-op is the default, betrayal is the spice". Everyday mischief (a 6 m/s shove, a tongue tug of at most 1 m, a croak-scare) moved no value and could never push a frog off a ledge. Real betrayal lived only in announced Heart doors: the Knot pact and its Cut, the Heart push, Split or Swallow, the Tongue-Tied Bridge and Doppelfrog, an Among Us style mimic vote. Every betrayal played a slow-motion Betrayal Cam, printed a one-door WANTED poster and gave the victim a guaranteed Vengeance quest. It could only move unbanked fireflies. The file also set blame tags and replays, 25 anti-griefing guard rails, an 8-clause fairness contract with tests, the ping Wheel, and the System, a dry announcer voice with 54 sample lines. Its largest part built the ten Rivals: bot frogs on the human code path, with personalities, a shared brain, an Explore-Theorise-Execute gate so bots never solve a room for a new player, a Trust table, a betrayal model, a Drama Director, 33 bark categories and a memory (the Rival Register). The goal was a full, funny and fair lobby, even for one player. For v2 the betrayal layer is archived. The cast, the helper brain, the gate, the barks, the Wheel, the fairness caps and the announcer rules carry over.

---

## Reusable for v2

Each row says what to keep, where it is in the source, and which pillar it serves. "Keep, reframed" means the idea is sound but its v1 wrapper (doors, climbs, betrayal) must go.

### Characters

| # | Item | Where | Why it fits |
|---|---|---|---|
| C1 | **The ten Rivals as the v2 core cast** (townsfolk, quest-givers, and companions who fill empty seats): Moss, Brother Brass, Pip Fizzwick, Vex Sulphur, Maud Tallow, Gutter, Kestrel, Ines the Taper, Pell, Lumen. | §16.3 | P3: each has one species, one body colour, one hat, one croak pitch, three signature lines and one clear job. That is a readable, memorable design brief per character. Their looks already come from the earned cosmetic catalogue, so the skins shop and the cast share one art set. |
| C2 | **Four families as world jobs.** Helpers (Moss, Brass, Pip) become guides, rescuers and starting-town hosts. Thinkers (Pell, Lumen) become lore keepers, puzzle hinters and explorers. Showboats (Kestrel, Ines) run races, challenges and slapstick. Schemers (Vex, Maud, Gutter) become traders, gossips and a grumpy veteran: tempting in words, never in mechanics. | §16.2 | P3 and P2: every character has a reason to be in the world and a thing to do for the player. |
| C3 | **Personality stats** Greed, Loyalty, Nerve, Honesty, Wit, Spite (0-100, bot-internal) drive taste, reaction time and error rate. | §16.3, §17.3, §17.4 | P3: behaviour matches personality. Kestrel gets +0.10 "show-off risk" and tries lanes above his rank; Pip gets +0.05 tongue misses. |
| C4 | **Quirks that make them specific:** Moss is the catcher ("Got it!"); Brass counts "On three."; Pip follows the frog it trusts most; Kestrel over-reaches and says "That was on purpose."; Lumen works alone, then says "Fine. Together."; Maud accepts every partner offer. | §16.3 quirks, §17.4, §22.5 | P3: sincere, specific habits a player can learn and like. |
| C5 | **Light classes shown on NPCs first:** Brass is a Bullfrog, Vex a Dart Frog, Kestrel a Tree Frog, visible on others before the player picks. | §16.3 quirks | P1 and P4: the player sees each class in action before choosing. Fits the brief's "light classes or roles". |
| C6 | **Honest newcomer bots.** Bots that are new too wear a visible "Rookie" label with a sprout icon. They are never secretly tuned to lose (the source calls that Fall Guys claim an unverified rumour). The Rookie factor `f` fades their clumsiness over time. | §16.5 | P3: honest, not manipulative. P4: newcomers are not out-played on day one. In v2, "new arrivals" in the starting town could carry this. |
| C7 | **Party variety rule:** with 3 or more bot seats, include at least one Helper and one Showboat (v1 also forced a Schemer, for betrayal); weight any character seated in both of the last 2 sessions (v1: climbs) by 0.7. | §16.4 | P3: the player meets different faces without random chaos. |

### Writing and voice

| # | Item | Where | Why it fits |
|---|---|---|---|
| W1 | **Bark writing style and most lines.** Short, specific, character-true lines. Keep B01 (start), B03 (entering danger), B04 (cue warnings), B06-B11 (growth onlookers, big clears, class reveal, rescues, gratitude, slapstick), B18 offers and replies, B22-B29 (reunion, rest-stop idle, bosses, failure, revives, rematch, treasure, the Rim), B31 (rookies). | §23.2 | P3: writing that sounds like people, not a generic narrator. Text plus croak-babble needs no voice actors, which suits a tiny team. |
| W2 | **Onlooker chorus.** 1-3 characters react out loud when a player grows (a new verb rank, a class reveal, Crown Glow). | §22.2 T6, B06-B08 | P3 and P6: the world notices you. The source's argument: the growth fantasy needs witnesses. |
| W3 | **The System's voice rules:** one `[ BRACKETED CAPS ]` header plus at most one sentence of 90 characters or fewer; it never lies (every number bound to a data key); it roasts events, never people; growth lines name the change and its cause ("Because: you grabbed 14 things."); no advice beyond the rule text. | §14.1 | P1: every growth message says what changed and why. P3: honest. Needs an in-world speaker in v2 (see Conflicts). |
| W4 | **Useful sample lines:** HATCHED, GLOW, TONGUE II, AWAKENING, BOON, CHOICE UNLOCKED, CROWN GLOW, SPOT LOST, CAUGHT, DARK (which names the fix: "Croak over the egg for 2 s."), REVIVED, and the break line `[ THE TOWER WILL WAIT ] Your door is saved.` | §14.3 #1, #7-#10, #12, #13, #24-#27, #53 | P1: the DARK line tells you how to recover. Fair progress: the 90-minute break line. |
| W5 | **Lore hints inside barks:** "Stay close. The well is hungry." (Moss), "Look up. It got bigger." (Moss), "Warm. I forgot what warm was." (Lumen), "The sky was a HOLE?" (Pip), "Those stars. Are they... lanterns?" (Pell), "Nobody told me there was more." (Lumen). | B01, B23, B29 | P2: these already point at one world mystery and give characters a past. |
| W6 | **Callbacks from memory:** once per session a character says one line about your shared history ("You caught me {n} times last climb. I counted.", "Door {best}. We got there together. Remember?"). | §24, B30 #2, #4-#6 | P3: genuine because it is true. P6: the world feels persistent. Re-key "climb" and "door" to v2 places and quests. |

### Lore and world

| # | Item | Where | Why it fits |
|---|---|---|---|
| L1 | **The big reveal:** the painted stars over the well are lanterns held by someone above; past them lie the Rim and the Sky. | §15, B29, §14.3 #54 | P2: one strong mystery that can carry a single story from the well floor up to the Rim. |
| L2 | **Named places and creatures:** hatch pond, Landings (rest stops with a hat stall, Frog Stack and a meeting spot), the Meeting room, the Keeper, the Warden (the Jar), Bell-Golem, heron shadow, snapper crossing, fog-stair eel, lamp knight, moss snail, echo warren, snake coil, sleeping toad, web spider. | §4 table, §22.5 | P2: raw material for regions, towns and their resident monsters in one connected world. |
| L3 | **Fireflies are light and loot.** Glow Level; Crown Glow at level 10 ("The fireflies orbit you out of respect."). | §14.3 #7, #13 | P2: a currency that is also light in a dark well is on-theme and self-explaining. |

### Frog mechanics

| # | Item | Where | Why it fits |
|---|---|---|---|
| M1 | **Mischief as harmless social play:** shove (6 m/s, same for every frog), tongue tug (at most 1.0 m), croak-scare (2 m, a 0.4 s startle hop). Moves no value, ever. | §3.1, §3.2 | P6: players can touch and tease each other in towns. P4: three verbs on buttons the player already has. |
| M2 | **Ledge guard and the teeter.** Nobody can be shoved or tugged off a drop or into hazard water. Near an edge, the push turns into a 0.8 s arm-wheel teeter gag. Hazard edges are a NavMesh area (`HazardEdge`) checked by a validator. | §3.3 | P6: a shared world without griefing. Also a built-in joke. |
| M3 | **Spam throttle:** at most 3 shoves or tugs on the same frog per 5 s; the 4th fizzles silently. | §3.4 | P6: no pest behaviour, no shaming text. |
| M4 | **Co-op "shared fate" encounter kinds:** TwoFrogDoor, TipRaft, GazeShared (it sees movement), NoiseShared (it hears croaks), LightLure (it follows the brightest frog), FragileCarry (egg or key), ChorusLock (two croaks together), WatchLock (it moves only unwatched), GripHaul, StackPad. | §4 | P2: each is one plain monster rule that holds everywhere. P6: each works better with other frogs. Keep them for world events and group dungeons. Drop the player-blame column. |
| M5 | **The rescue loop:** a knocked-out spot always flies back to its owner and can be caught mid-air; revive with a 2 s croak hold; downed frogs become tadpole ghosts that can ping and nudge small props (5 kg or less, every 10 s) but never key objects. | §3.2, §11.1, §12.1 G6-G7, §17.7 | P6: helping each other is the social core. P4: one input (hold Croak) to help. |
| M6 | **A partner bond, without the Cut.** Keep the good half of the Knot: see your partner's outline through walls, revive them in 1.0 s, a ledge-guarded rescue yank, Duo abilities, and an invite ring of portraits where distance never matters. | §6 | P6: easy duos inside an 8-player world. Must be simplified and made visible (see Conflicts). |
| M7 | **Better-together traversal:** Frog Stack (up to 4 frogs on each other's heads) and the Frog Sling (hold Tongue on a partner 0.6 s, then Hop, for a 12 m launch). | §4 StackPad, §8.4 Sling, §22.5 DD-17, DD-L1 | P6: movement that rewards grouping. The Sling was lent to everyone in a Heart room; the motion itself is a Duo and is not party-only. |

### Art

| # | Item | Where | Why it fits |
|---|---|---|---|
| R1 | **Per-character art refs:** one real frog species each (mossy frog, bullfrog, teal reed frog, yellow-banded dart frog, orchid painted reed frog, scarred cane toad, red-eyed tree frog, lanky cream tree frog, blue dart frog, lavender leaf frog), one body hex, one hat. | §16.3 | P3: readable silhouettes and colours. Species are art notes, never player-facing. |
| R2 | **A reserved alarm colour.** Every character and cosmetic hue stays at least 15 degrees from one reserved crimson. In v1 it meant betrayal. In v2 it can mean danger (monster attack, hazard). | §7.3, §16.3 | P1: one colour, one meaning, everywhere. |
| R3 | **Hats as identity keys:** Moss Cap, Bell Cowl, Matchstick, Pearl String, Eyepatch, Feather Crest, Racing Stripe skin, Sweatband, Round Specs, Leaf Hood, Party Hat, Confetti entrance, Vine tongue trail, Velvet croak voice. | §16.3, §27 Q4 | P3 plus the cosmetic shop: every NPC look is earnable, so the cast sells the shop honestly. |
| R4 | **Slapstick animation gags:** teeter (0.8 s), croak-scare startle, belly-flop, stack collapse, over-rotated Sling landing. | §3.3, §3.1, §22.5 | P3: humour through the body, not through text. |

### Audio

| # | Item | Where | Why it fits |
|---|---|---|---|
| A1 | **Croak-babble instead of voice acting:** 70-110 ms syllables at each character's croak pitch (150-420 Hz), pitch contour by line type (questions rise, "Help!" high and sharp, "Sorry!" falls). | §23.1, §16.3 | P3: each character has a voice. Tiny team: no recording sessions. |
| A2 | **The announcer's typing chime:** one glass-bell chime per character at 35 characters per second, pitch quantised to a pentatonic scale. | §14.2 | P3: a signature sound for the narrator. |
| A3 | **The tell principle:** every threatening action has a sound and a visual warning before it lands, and nothing talks over a monster's tell. | §7.3, §14.2, §23.1 "cue silence" | P1: danger is always readable. Reuse for monsters, not for betrayal. |

### UI

| # | Item | Where | Why it fits |
|---|---|---|---|
| U1 | **The Wheel:** hold one button; release on a target to ping, or flick to a quick line. Pings last 3 s (1 per 1.5 s), coloured by target: monster red, door gold, prop or frog in the owner's Seat Hue, place white. Quick lines: "Go!", "Wait.", "Help!", "Thanks!", "Sorry!". Emotes on an inner ring. | §13 | P4 and P5: all communication in 2 inputs. P6: talk without typing. |
| U2 | **"Go!" and "Help!" as the carry-me switch:** one quick line makes companions stop holding back and act. | §13, §18 | P1: a stuck player always has a one-input way forward. |
| U3 | **Announcer window delivery:** top-centre; priority levels P0-P3; at most 3 queued; nothing below P0 during a monster cue; last 10 lines kept in the pause menu; no line repeats one of the last 2. | §14.2 | P1: text never hides a danger tell. P5: missed lines are one menu away. |
| U4 | **"What hit me" replay:** a small picture-in-picture (28% of screen width, bottom-right) replays your last 1.5 s at half speed after a fall. It never blocks input and shows once. | §5.2 | P1: you learn why you failed. Keep it with world or self causes only. |
| U5 | **Cause tags that name the world, not a player:** e.g. the self tag "{v} vs. gravity: gravity wins", or a noise tag rewritten as "It heard that." | §5.1 templates | P1 plus P3 humour, without pointing at friends. |
| U6 | **A companion page:** 10 portraits, silhouettes for characters not yet met, shared history shown both ways, reachable from a town wall and from pause. | §24 display | P5: reachable in 2 inputs. P3: the cast feels like people you know. |
| U7 | **Speech bubbles you can place:** world-space bubble with a border in the speaker's colour, readable within 25 m; an off-screen speaker shows as a small edge chip with their name. | §23.1 | P1 and P6: you always know who spoke and where. |
| U8 | **Local comfort toggles:** fall replays on or off, a streamer-safe mode that hides the join code, and skip for any repeated cutscene after 3 viewings. | §2, §9.1 skip, G18 | P5: simple settings, one place. |

### Tech

| # | Item | Where | Why it fits |
|---|---|---|---|
| T1 | **Bots are frogs.** Each companion is a host-owned NetworkObject on the same prefab and code path as a human, writing the same `FrogInput`. No special physics, no teleports, no hidden knowledge. The same bots run the automated QA soak. | §16.1 | P6: fills an 8-seat world when friends are offline. Tiny team: one code path, free QA. |
| T2 | **Bot brain budget:** think at 10 Hz (10 ms stagger per seat), steer every FixedUpdate; sight 25 m with a 150-degree cone (12 m in the dark, except self-lit objects); at most 8 raycasts per think; 7 brains in 1.5 ms of host CPU per frame. NavMesh links tagged by the Hop rank they need. | §17.1, §17.2, §17.6, §17.9 | Proven numbers for NGO host mode on a player's PC. |
| T3 | **Bots read only public state.** A reflection test fails the build if bot code can see hidden data. | §17.2, T-SOC-06 | P3: companions never cheat, so they feel like fair teammates. |
| T4 | **Explore, Theorise, Execute gate.** Companions poke around, then demonstrate at most one step ahead of the humans, and never finish a puzzle for a first-timer in the first 90 s. "Go!" overrides it. Hidden solutions stay human discoveries. BotPlan fields: `keyActions`, `finalKeyAction`, `hiddenClearActions`, `canonicalMistake`, `survivalActions`, `startStage`. | §18, §25 | P1 and P4: players learn by doing, with help one input away. Acceptance: human does the first key action in at least 60% of rooms and the final one in at least 50%. |
| T5 | **Helping always on:** catch, revive and haul run above every other bot goal and are never gated. | §17.7 | P6: companions make the world feel friendly. |
| T6 | **Roles by stat fit:** Ringer (highest Wit), Carrier (highest Loyalty), Catcher (Helpers), Lure (Loyalty or Nerve 80+), Lookout, Hauler, Caller (Brass). | §17.5 | P6: companions fill group jobs in dungeons and events. |
| T7 | **Players lead, bots follow.** Bots may suggest a direction once, never count in a group vote, then follow the humans. | §19.1 | P6: the world waits on people, not on bots. |
| T8 | **"Parked, not simulated."** An off-screen companion is hidden at an anchor with a fixed outcome, then reappears with one reunion line. No physics, no dice. | §19.3 | P6 plus tiny team: an errand or side trip for a companion costs no CPU and never soft-locks (T-SOC-12). |
| T9 | **Server authority pattern:** clients send intents only; the host validates and decides; private info travels by owner-only RPC, never a NetworkVariable. | §7.1, G20, F5, F7 | Fits NGO 2.13.3 host mode. |
| T10 | **Fairness contract, minus betrayal:** hitbox, base speed, shove impulse and spots are identical for every frog whatever its level, class or cosmetics (reflection test T-FAIR-01); tongue hits rewound by RTT/2 up to 150 ms; bots read the same tables as humans (T-FAIR-08). | §12.2 F1, F4, F6, F8 | Brief: "addictive-but-fair". Skins stay cosmetic by test, not by promise. |
| T11 | **Client-side replay buffer:** 30 Hz snapshots for 4 s, about 61 KB for 8 frogs; ragdolls re-simulated locally, never networked. | §5.2 | Cheap replays for clarity (U4) with no network cost. |
| T12 | **Data-first content:** agents write JSON, generators build ScriptableObjects, validators check strings (every number a `{key}`, lines 90 characters or fewer, every key resolves) and bark rate limits. | §25, §26 T-SOC-09, T-SOC-11 | Tiny human team building with agents. |
| T13 | **Drop-in without friction:** after 60 s idle a seat shows `[ AWAY ]` and a helper brain drives it (helps only); any input returns control. A 15 s straggler gust for group instances. Frogs overlapping in a doorway soft-push apart at 0.5 m/s. The host can hand a seat to a bot. | §12.1 G13-G16 | P6: no one holds the group hostage; nobody blocks a door. |
| T14 | **Steam Timeline markers:** the system is already MUST-A; v2 fires them for story beats and boss clears instead of betrayals. | §5.3 | Cheap shareable moments. |

### Progression

| # | Item | Where | Why it fits |
|---|---|---|---|
| G1 | **Cheap, shared failure:** mistakes cost little; rest stops restore spots for free. | §1 comedy formula, §10.1 | P4: trying things is safe. |
| G2 | **No farming between friends:** rewards cannot be looped by two friends feeding each other; death-related rewards are first-time-only. | §11.5, G9 | Fair progress. |
| G3 | **Growth names its cause and gets witnesses** (W2, W3). | §14.1, §16.1 | The "fun, fair progress" feeling the brief asks for. |
| G4 | **Companion friendship from good deeds only:** revive +30, catch or haul +25, stayed partners for a stretch +10, "Thanks!" +2 (once per encounter). Drop every betrayal row. | §20 | P3: companions warm to you for real reasons. Must become visible (see Conflicts). |
| G5 | **Lantern tips (the old audience layer):** a lantern above "leans in" and drops a few fireflies, only for co-op or skill moments (a mid-air catch, a hidden solution), never for drama, falls or votes. Hard caps per player and per session; never show invented viewer numbers. | §15 | P2: ties rewards to the lantern-holders of L1. Fair: drama never pays. Needs a new name (see Conflicts). |
| G6 | **First-session beats as a shot list:** first laugh by 0:30 (tongue Kestrel off a wobbly pad; he belly-flops); a helper pushes a two-frog door with you; a helper catches your first lost spot; Pip says "It goes up forever?!"; Brass calls "On three." for a group croak. Director limits: never skip a tell, never force a failure, never finish a human's action (L3, L4, L7). | §22.2-§22.5 DD-00, DD-01, DD-02, DD-04, DD-10 | P4: the first five minutes teach tongue, shove, catch and croak through characters, with no manual. |

---

## Party-only (to archive)

These only make sense in the betrayal party game. They leave the main game and go to the archive repo.

| Item | Where |
|---|---|
| "Betrayal is the spice" contract, spice budget per climb (Heart doors, bot betrayals, Cams), consent by walking away from a ♥ door | §1 |
| Lobby betrayal permissions: the `CanBetray` check, the "Human betrayal" host toggle, Public vs Friends betrayal rules, Masked Rivals (bots hidden as `Frog 3` for deduction) | §2 |
| Heart doors (♥) and the Heart-door contract H1-H8, `BetrayalEvent`, `HeartDoorValidator` | §8.1, §25 |
| The Heart push: ledge guard off, the full yank that can kill, 20% spills that the catcher keeps | §7.2 |
| The Cut (hold Shove 1.2 s while Knotted), the hold-on counter (Tongue 0.4 s), stun, 8 s cooldown, the breakup Cut | §7.1 |
| Betrayal tells: the Rival "full tell" (1.5 s), cold feet `(1 - Nerve/100) × 0.8`, betrayal crimson `#E8254F` as a betrayal colour | §7.3 |
| `heart_two_pads` (Two Pads, Three Frogs), `heart_split_swallow` (Split or Swallow, jar J = 2 × (8 + d)), `heart_tied_bridge` (Tongue-Tied Bridge) | §8.2-§8.4 |
| `doppelfrog`: Human Mimic and Spot the Mimic variants, role reveal, side-blink tell, the Mimic tag, vote pads, 15 s vote, quorum rule, jarring, Rival evidence scoring, "I saw" speech tell | §8.5 |
| Shared-fate kinds `Tether`, `JarShare`, `Mimic` | §4 |
| Betrayal Cam (4.4 s sequence, 25% speed, `[ TRAITOR ]` sting), Betrayal Snap cosmetic, WANTED poster and its crimes | §9 |
| Escrow ("crimson cheeks") | §10.2 |
| Vengeance quests: hunter outline, hunted icon, tongue tag, slime decal `#8BE04E`, +1 Boon card, anti-farm, Rival traitors waiting to be tagged | §11 |
| Blame tags that name another player ("Shoved by {a}. Allegedly."), `BlameTracker` contact weights, the blame-tagged failed-door replay | §5.1, §5.2 |
| Steam Timeline "Betrayal" and "Vengeance" markers | §5.3 |
| Betrayal guard rails G1, G2, G8 (the ♥ part), G9 (the Vengeance part), G10, G11, G12, G22, G23, G24; fairness clauses F2 (♥ yank), F3 (escrow), F7 (betrayal service) | §12 |
| Wheel lines "Liar!" and "Trust me." (and "Knot?" as untie) | §13 |
| System lines #36, #39-#48 and the Heart lines SHARED, DUET, SWALLOWED, DOUBLE SWALLOW, QUORUM, WRONG FROG, NO VERDICT, the Two Pads HIDDEN CLEAR ("The Tower counted pads. You counted frogs.") | §14.3, §8 |
| Trust rows for mischief, votes, yanks, Vengeance and betrayal (−3 to −60); grudges at Trust ≤ −30; Gutter ×3 party weighting | §20, §16.4 |
| The betrayal decision model: utility `U`, thresholds θ (Vex 0.45, Maud 0.50, Gutter 0.60, Ines 0.75, Lumen 0.80, Kestrel 0.90, Pell 1.00, Helpers 1.5), room temptation weights, seeded rolls, worked examples | §21, §16.2 |
| Drama Director betrayal parts: targets T3 and T5, limits L1, L2, L5, L6, the θ nudge, the Mimic pick; beats DD-11 (Vex shoves Moss), DD-12 (Moss's Vengeance), DD-14 (Maud as Mimic) | §22 |
| Bark categories B12 (partly), B13, B14, B15, B16, B17, B19, B20, B21, B32, B33; B30 lines #1 and #3 (betrayal callbacks) | §23.2 |
| Hidden Register fields `betrayalsByYou`, `betrayalsByThem`, `vengeanceByYou`, `vengeanceByThem` | §24 |
| Tests T-SOC-01, 02, 03, 04, 05, 07, 10, 13, 14; betrayal telemetry (`betrayal`, `cut_attempt`, `cut_held`, `vengeance`, `mimic_vote`); A/B tests 1 and 2; the "betrayed players dislike it" fix trigger | §26 |
| The tongue-on-player fallback (touch tags for Mimic and Vengeance) | §7.3 |
| Open questions 1, 2, 5, 7, 8, 9 (Heart-door lives, consent by walking, jar numbers, human count for the Mimic, Masked Rivals tag, Vex's swallow rate) | §27 |

**Note for the optional town side-mode hook** (build nothing now): the smallest self-contained piece here is Doppelfrog's "Spot the Mimic" with vote pads (§8.5), because it already runs with one human and needs no Knots, escrow or Vengeance. Split or Swallow (§8.3) is the second candidate: one booth, one jar, a 6 s choice. Both fit a single opt-in parlour room in a town.

---

## Conflicts with the new pillars

| Item | Pillar | Why |
|---|---|---|
| The whole frame is a linear 20-door climb: door numbers, floors of 5 doors, Landings, forks, E doors, the Meeting Door, the walk vote, offstage fork sides (§19, §22.5, §14.3 #2 "19 to go") | P2, P6 | v2 is one connected open world. Every system keyed to "door n" or "climb" needs re-keying to places, quests and sessions. |
| Door suits ♣ ♠ ♦ ♥ and E, and each Rival's "door taste" (§16.3, §19.1, B02) | P1, P2 | Card-suit icons have no meaning in a frog-and-well world, and the player must learn a hidden code. |
| The narrator is "the Tower's voice", a LitRPG-style System with ranks F to S, `[ RANK E ] ... has noticed you exist` (§14, #50) | P2 | v2 needs one in-world speaker that fits the single story. "The System" is borrowed framing (the source credits Dungeon Crawler Carl), not the frogs' world. |
| Rank-tease barks ("An F-rank? Adorable.", "F-rank. Fresh. Crunchy.") (B05) | P4, P3 | Teasing a brand-new player about a letter grade works against "easy to start". It also adds another number to learn. |
| Noun overload for a new player: spots, Dark, tadpole ghost, fireflies banked and unbanked, Glow Level, verb ranks, Awakening, Boons and Duo Boons, Knot, Tower Rank, Team Lives, Pearls, Wish Coins, Bestiary stamps, Hidden-clear stamps, Sealed, Hell, Rematch, Keeper, Warden, Landings | P4, P5 | Far too many terms to learn without a wiki. v2 should merge or cut most of them. |
| Hidden values: Trust has no UI; personality stats are bot-internal; partner offers depend on hidden Trust; the Rookie factor is hidden (§20, §16.3, §16.5) | P1, P5 | Players cannot see why a companion likes them or offers to team up. If friendship stays, show it (for example, a simple heart or badge on the companion page). |
| The Knot unlocks late (Landing 3 of the first climb), only at Landings, through the Wheel, with a 10 s accept window and re-ask blocks (§6) | P4, P5, P6 | Teaming up must be available from the start, from anywhere, in 2 inputs or fewer. |
| One button, many holds: Tongue hold means carry, full yank, Mimic tag, hold-on, grapple and Sling; Shove hold means Cut; Hop hold means skip (§7, §27 Q6) | P4 | Overloaded holds are hard to learn. With betrayal gone, v2 can give each hold one meaning. |
| Redacted rules in Hell and Sealed: rule text becomes █ blocks (§14.1) | P1 | Hiding the rule on purpose contradicts "always know what to do next". Fine only as a clearly labelled optional challenge. |
| No free text ever; voice chat LATER (G17) | P6 | An MMO feel usually includes some chat. The Wheel covers basics, but the owner should decide on text or voice for friends-only lobbies. Safety was the v1 reason. |
| "Rivals never enter a door without a human; no Rival-only room is ever simulated" (§16.1) | P6 | A living open world needs townsfolk who exist where no player stands. "Parked, not simulated" (T8) helps, but ambient town life needs its own plan. |
| The cast is called "Rivals" and the memory is the "Rival Register"; one family is "Schemers" built to betray (§16) | P2, P3 | In v2 these characters are neighbours and companions. The names and the Schemers' motives must change to fit one story. |
| Blame tags that name other players, even as jokes (§5.1) | P6 | In a shared world, public blame adds friction between strangers and friends. |
| Run structure: Team Lives, "CLIMB OVER", "Everything you learned is banked", climb counts for Rookie labels (§14.3 #28-#31, §16.5) | P2, P6 | A roguelite reset does not fit a persistent world. The Rookie fade needs a new clock (for example, hours played). |
| First-session beats are keyed to authored door numbers in `director_climb1.json` (§22.5) | P2 | The idea survives (G6) but must be re-keyed to the starting town and first quests. |
| Two names for one space: "the Tower" climbs inside "the Well"; "the Sky" starts at door 21 | P2 | v2 needs one clear rule for what the world is (a well, a tower, or a tower inside a well) and one name for each layer. |
| Name collision: the "Watchers" audience layer vs the Warden "the Watcher" (§27 Q3) | P2 | One word, two meanings. Pick one name per thing. |
| Pronouns are inconsistent: Pip is "her" in DD-19 but "its" in §16.3; Kestrel, Vex, Gutter and Brass are "he"; Moss, Maud, Ines, Pell and Lumen are unstated | P3 | A character bible needs fixed pronouns so writers and agents stay consistent. |
| Rival loadout items must exist in the cosmetics catalogue or be swapped (§27 Q4) | P2 | Still open. The cast's hats and the shop must be one list. |
| Masked Rivals hide that a player is a bot (§2) | P3 | Hiding who is a bot is not genuine. Already archived with the party parts. |

---

## Key numbers and names

**The cast** (§16.3). Name · family and archetype · art species · body hex (hue) · hat · croak f0 · signature lines.
- **Moss** · Helper, the Sherpa · mossy frog with lichen bumps · `#9BE07A` (101°) · Moss Cap, Vine tongue trail · 220 Hz · "Got it!" / "Here." / "Nobody falls today."
- **Brother Brass** · Helper, the Captain · bullfrog · `#FFC45C` (39°) · Bell Cowl · 150 Hz · "I can carry that." / "On three." / "Go. I'll hold."
- **Pip Fizzwick** · Helper, the Tagalong · teal reed frog, oversized eyes · `#6FF0D6` (168°) · Party Hat, Confetti entrance · 420 Hz · "Help!" / "Thanks!" / "I'll follow you!"
- **Vex Sulphur** · Schemer, the Opportunist · yellow-banded dart frog · `#E8F24A` (64°) · Matchstick · 300 Hz · "Worth it." / "Nothing personal." / "You'd have done it too."
- **Maud Tallow** · Schemer, the Charming Liar · orchid painted reed frog · `#D77FE0` (294°) · Pearl String, Velvet croak voice · 280 Hz · "Trust me." / "Would I lie?" / "Oh, sweetie."
- **Gutter** · Schemer, the Grudge · scarred cane toad · `#B5673A` (22°) · Eyepatch · 170 Hz · "Not sorry." / "Remember me?" / "You. Again."
- **Kestrel** · Showboat, the Show-off · red-eyed tree frog · `#FF8A3D` (24°) · Feather Crest, Racing Stripe skin · 340 Hz · "Watch this!" / "Nice!" / "That was on purpose."
- **Ines the Taper** · Showboat, the Speedrunner · lanky cream tree frog · `#FFF1C9` (45°) · Sweatband · 320 Hz · "Go!" / "Keep up." / "Personal best."
- **Pell** · Thinker, the Scholar · blue dart frog · `#6AA8FF` (215°) · Round Specs · 260 Hz · "Interesting." / "Follow me." / "I have a theory."
- **Lumen** · Thinker, the Lone Wolf · lavender leaf frog · `#C7B6FF` (254°) · Leaf Hood · 240 Hz · "Go on without me." / "I work alone." / "Fine. Together."

**Personality stats** (G, L, N, H, W, S; §16.3): Moss 10/90/60/90/50/10 · Brass 15/95/75/85/55/5 · Pip 20/80/30/85/40/10 · Vex 85/20/70/30/60/50 · Maud 70/40/50/15/80/40 · Gutter 50/20/70/40/50/85 · Kestrel 55/50/95/60/35/25 · Ines 65/35/85/60/65/20 · Pell 40/50/30/80/90/20 · Lumen 60/25/80/60/70/30.

**Cast order and scope** (§16.4): first seven seated: Kestrel, Moss, Vex, Maud, Brother Brass, Pip, Pell (MUST-A). Lumen, Ines and Gutter were MUST-B. Class ties: Brass Bullfrog, Vex Dart Frog, Kestrel Tree Frog.

**Pronouns stated in the source:** Kestrel he, Vex he, Gutter he, Brass he, Pip she (once; "it" elsewhere). Others unstated.

**Places and things:** the Well, the Tower, the hatch pond, Landings, the Meeting room, the hub wall, the Mirror (cosmetics), the Keeper, the Warden (the Jar), the Rim, the Sky, lanterns (the painted stars), fireflies, Glow Level, Crown Glow (level 10), spots, Dark, tadpole ghost, the Bestiary.

**Colours:** reserved crimson `#E8254F` (about 347°), with a 15° exclusion for every character and cosmetic hue · slime green `#8BE04E` · parchment `#F2E3C2`, ink `#3A2A1A` · blame pill `#101418` at 80%.

**Frog numbers:**
- Shove impulse 6 m/s, identical for every frog.
- Tug at most 1.0 m. Ledge guard: tug stops 0.4 m from a hazard edge; shove loses its edge-ward push within 1.5 m of an edge; a tug under 0.2 m fizzles. Hazard edge = drop over 1.0 m, hazard water, spikes, void.
- Teeter 0.8 s. Croak-scare radius 2 m, startle hop 0.4 s.
- Spam throttle: 3 per target per 5 s.
- Revive: 2.0 s croak hold (1.0 s for a partner). Ghost nudge: 5 kg or less, every 10 s.
- Tongue range by rank: 3 / 4.5 / 6 / 8 m (owned by 02). Partner yank hold 0.6 s. Frog Sling: 12 m launch. Frog Stack: up to 4 frogs.
- Partner invite: 10 s to accept; partner outline in the same room; thread visible to others within 25 m.

**Wheel and text:**
- Ping 3 s, at most 1 per 1.5 s per player. 8 quick lines (5 kept for v2).
- Announcer: header plus 90 characters or fewer; typing 35 characters per second; on screen 3.0 s + 40 ms per character; queue of 3; history of 10; no repeat of the last 2.
- Barks: on screen 2.0 s + 40 ms per character; readable 25 m (15 m in the dark); 1 bark per 2.5 s per area; 1 per 10 s per character; chorus of up to 3 within 1.2 s; dropped after waiting 3 s; no repeat of the last 3; syllables 70-110 ms.

**Bot brain:**
- Think 10 Hz, 10 ms stagger; sight 25 m, 150° cone (12 m in the dark); 8 raycasts per think; 7 brains within 1.5 ms per frame, inside an 8 ms host simulation budget.
- Reaction time `r = 0.60 − 0.35 × (W + N) / 200` s, plus `0.25 f` for rookies, plus N(0, 0.05) jitter (Kestrel and Brass 0.37 s, Pell 0.39 s, Pip 0.48 s).
- Error rate `e = 0.05 + 0.15 × (1 − W/100)`, times `(1 + 0.5 f)` for rookies.
- Rookie factor `f = min(1, max(0, (10 − c) / 5))`: 1 up to the 5th session unit, 0 at the 10th.
- Gate: Explore ends at the first human key action, a human ping on a key object, or 30 s (45 s if the rule is redacted). Theorise: bot key actions never exceed human key actions + 1; no final key action in a first-timer's first 90 s. Acceptance: human first key action in at least 60% of rooms, final key action in at least 50%; veteran soak clears at least 90% of 50 seeds.
- Helping thresholds: catch at Trust 0 or more, revive at 20 or more, haul above −30 (Helpers always).

**Friendship (Trust) numbers to keep:** range −100 to 100; starting seed capped at ±20; revive +30; catch or haul +25; stayed partners through a stretch +10; "Thanks!" +2 once per encounter. Partner offer at Loyalty 50+ and Trust 20+; accept at Trust 50+, or 20+ with Loyalty 40+ (Lumen needs 50).

**Session and fairness:**
- Away after 60 s idle (Public hand-off after 5 min). Straggler gust after 15 s. Doorway soft-push 0.5 m/s.
- Lag compensation: rewind by RTT/2, capped at 150 ms.
- Replay buffer: 30 Hz, 4.0 s, about 61 KB for 8 frogs. Fall replay: last 1.5 s at 0.5× in a 28%-width window.
- Offstage companions return after U(5, 20) s; no soft-lock within +20 s.
- Break reminder at 90 minutes.
- Lantern tips: 10% of the clear bonus, rounded up; caps 1 per frog per door, 5 per frog per climb, 15 per lobby per climb (v1 units; re-key to encounters and sessions).
- First laugh by 0:30 in the first session.

**Build names worth keeping** (never shown to players): `RivalBrain` (rename for v2), `BotPerception`, `BotGate`, `TrustTable`, `DoorLobbyist`, `OffstageParty`, `DramaDirector`, `BarkDirector`, `BarkBubble`, `SystemWindowQueue`, `WheelMenu`, `ReplayBuffer`, `FallReplayPip`, `FairnessCaps`, `BotPlanValidator`, `BarkValidator`, `SystemLineValidator`. Data: `Data/social/rivals.json`, `social_caps.json`, `director.json`, `barks.json` with the `Barks` string table (keys `bark.<category>.<nn>`), `system_lines.json` with the `System` string table (keys `sys.<situation>.<name>`), `profile/rivals.json` for the per-player memory.

<!-- END -->
