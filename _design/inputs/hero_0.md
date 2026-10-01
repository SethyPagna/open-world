# hero:0 (saved from merge run wf_01dca530-b92)

# The Case for the FROG as Hero

## 1. The frog is the user's idea, and the Wick isn't

The user gave one structural image and repeated it: *"it is like frog in a well, comes out of well sees the sky, then go to sky sees space."* The Korean form of the idiom is **우물 안 개구리**, "the frog inside the well". WORLD_STRUCTURE already puts Korean in every layer card. The user's reference text is a Korean light novel.

The current documents keep the metaphor but take it away from the player. The frog is a 0.6 m statue at the Foot, a silhouette on the rim in ★4, and an empty plinth in Cycle 2 (WORLD_STRUCTURE §0 row 3, §10.5). The idiom is about how a small creature *sees the world*. If the player is the frog, every reveal is an insight about themselves. If the player is a candle watching a frog statue, every reveal is a lesson about someone else.

The Revelation is where this matters most. Today the nearest watcher on the rim is "the stone frog from the Foot, now enormous." With frog heroes, that shot shows the player's own silhouette at colossal scale, looking down into a well the way they looked up at the Coin. "Every sky is someone's well" then lands as a mirror, not as trivia. It is also the logo shot and the key art.

## 2. The frog pitch, done properly: a Firefly Frog

The honest problem with a plain frog is that **a frog isn't a light source**. GDD pillar 1 ("Light is life and language") and the whole art direction ("lit only by the players") depend on the hero being the lamp. The frog fix should not bolt a candle onto the frog. It should use something frogs actually do: **frogs eat fireflies, and a well-fed frog glows through its belly.**

- **Light is eaten, not worn.** Fireflies in your belly are your HP *and* your light, the same way wax is today. You see them as a warm glow through translucent skin, plus the flame-equivalent `PointLight` (6 m base).
- **Damage makes you cough fireflies.** They scatter like Sonic rings and die out in 3 s, and anyone can tongue them back up. That is readable, comic, and a built-in temptation to betray.
- **The belly backlights what you swallow.** A swallowed key casts a key-shaped silhouette in your glowing belly. In the Liar's Banquet this becomes evidence everyone can see: "who swallowed it?" is answered by holding someone up to the light. No candle can offer that deduction verb.

### System translation (the GDD's mechanics survive almost 1:1)

| GDD (Wick) | Firefly Frog | Readable from silhouette? |
|---|---|---|
| Wax = HP, body shrinks | Fireflies = HP. Belly glow dims and the body deflates by up to 25% (hitbox constant, as in §5.1) | Yes: glow radius plus plumpness |
| Brighten / Dim | **Puff** (throat sac inflates as a lantern, 14 m) / **Shut-eye** (mouth closed, eyes lidded, 2 m) | Yes: the sac is a second glowing sphere |
| Flame emotions (§4.5) | Eyes plus sac plus posture. Fear = eyes retract and body flattens. Anger = sac flares. **Resolve tell** = cheeks puff, tongue-tip shows, eyes narrow toward the target, glow shifts 15% crimson | Yes: huge top-set eyes read at 25 m |
| Soot bands (reputation) | **Warning stripes.** The Tower paints poison-dart bands on you per Knife, always drawn over any skin; violet at Notorious | Yes, and nature-native: aposematism literally means "don't trust me" |
| Drip (heal 5) | Spit a firefly into an ally's mouth | Yes, and a guaranteed laugh |
| Snuffed → Smoke | Gone dark → a **tadpole ghost** swimming through the air | Yes |
| Relight | Tongue-feed a firefly to a dark frog | Yes |
| The Snuffer (a bell that falls on the brightest light) | **The Jar**: a child's firefly jar the size of a house, lowered on the brightest frog. The draft's well-bucket fits here too | Yes, and it is thematically exact |
| Knot / Cut | Glowing thread tied at the wrists; Cut becomes a bite | Unchanged |

Everything in §7 (Ledger, Tribunal, Notes), §8 (Rivals), §3 (Draft, doors) and the WORLD_STRUCTURE layer system is untouched.

## 3. Signature verbs a candle can't have

- **Tongue lash** (replaces the 1.6 m grab cone). Range 4 m, 0.25 s windup with a visible cheek-puff. It can grab props, fireflies, climbing holds (as a grapple) and climbers. Light objects come to you; heavy anchors pull you to them. **Tongue-catch** replaces dive-catch in the Trust Fall: a 4 m save that yanks someone out of the air is the clip of the game.
- **Tongue steal is a Knife with a tell.** You can snatch a key, a firefly or a lever handle from 4 m. It is visible and has a counter (the victim bites down, which is Cinch). That satisfies the rule "betrayal is always visible."
- **Charged hop.** Tap for the GDD's 1.4 m apex; hold for a 2.4 m crouch-launch. This is the textbook squash-and-stretch move: crouch squash 25%, flight stretch 20%, splat landing.
- **Croak resonance.** The throat sac is a speaker. The Golem Belfry and Harmony Sentinel, which are already sing-it-apart rooms, become croak-chord rooms. Eight frogs holding a chord in a stone well is the Landing waltz as a co-op instrument.
- **Sticky pads** for C-room wall-cling on the well walls, which is PEAK's grip reborn.
- **Swallow and spit** to carry items hidden (but backlit), and to give light.

## 4. It survives the scale-up better than anything else on the table

| Layer | Frog fit |
|---|---|
| **L1 Well** | The habitat. The idiom is literal. |
| **L2 Sky** | **Frog rain is a real phenomenon** (waterspouts lift frogs and drop them), so the transfer is a waterspout ride. The UPDRAFT omen gets **gliding frogs** (Wallace's flying frog is real): a layer-scoped webbed-glide trait. |
| **L3 Space** | Fishbowl-helmet frog, an instantly iconic look. Tongue-grapple between hull rails is the best DRIFT traversal verb possible. The Crown sits at the moon, where East-Asian myth already places **the moon toad (Chan Chu)**. Myth becomes boss. |
| **L4 Beyond / ★4** | Watchers on the colossal rim are frogs, and you are one. The metamorphosis arc (tadpole ghost → froglet → frog → the giants on the rim) gives the user's "increase their powers" a body-language story. |

The candle's space layer needs an oxygen hand-wave. WORLD_STRUCTURE already had to cut O₂ from L3 (Review 0 M4).

## 5. Buildability in Three.js, honestly costed

- **Body:** a `LatheGeometry` pear, the same pipeline as the Wick. **The wax wrap-lighting/thickness shader transfers directly**: translucent frog skin lit from inside is the glass-frog look.
- **Eyes:** 2 spheres with pupil discs and hemisphere lids. Blink, retract, pupil shapes.
- **Throat sac:** a scaled sphere with emissive.
- **Hands:** the Rayman nub-hands stay.
- **Tongue:** `TubeGeometry` along a 12-point CatmullRom rebuilt each frame, with a spring overshoot and a sticky-tip sphere. It is cheap, and it is a squash-and-stretch toy in itself.
- **Hind legs:** the one real extra cost. They are 2-capsule chains with 2-bone IK that fold into a Z shape at rest and extend on the hop. GDD_CRITIQUE #28 already requires a shared `ProcRig` (spring bones, 2-bone IK) for the monsters, so the frog rides on that.
- **Estimate (mine, not measured):** about +1.5 tech-art weeks over the Wick. `_scaffold/src/actors/` is empty today, so **no actor code is thrown away**. `kit.statue({kind:'frog'})` and the palettes' "frog in a well" framing already exist.
- **Posture rule:** an upright "bean frog" (Frog-and-Toad / Fall Guys proportions) that crouches only to hop. A flat, realistic frog reads as a puddle from a 3/4 camera at 4.5 m.

## 6. Skins and commercial appeal

- **Hats.** GDD_CRITIQUE #27 names the hat/accessory slot as the top category in Fall Guys and Among Us, and notes the catalogue has none. **A Wick can't wear a hat, because its head is a flame.** A frog wearing a tiny hat is its own internet genre.
- **Nature supplies premium skins:**
  - poison-dart palettes;
  - a **glass frog** with a visible beating heart (Gilded);
  - tomato frog, horned frog and starry-night tree frog;
  - earned-only prestige pieces: Well-stone, the L3 fishbowl helmet and the Jar-lid crown.
- **Slot remap (10 slots kept):** Skin, Glow, **Hat** (new), Perch (was Holder), Shadow, Tadpole (was Smoke), Croak (was Knock), Oath Thread, Betrayal Snap, System Window. The 60-item count survives with a mostly mechanical recolour of the catalogue.
- **Silhouette.** Two eye-bumps on a bean is as recognisable as the Among Us visor, and it is plushable. The candle is readable, but it is a cylinder with a flame: nobody hugs it.

## 7. Comedy and clip potential

- tongue-yanking the wrong frog off a ledge;
- tongue-slapping a monster's face by accident;
- swallow gags (real frogs retract their eyeballs to swallow);
- spitting a firefly into a friend's mouth to heal them;
- eight-frog croak chords;
- the frog pyramid (TEAMBOUND's Tower of Babel as the Wax Stack minigame becomes the Frog Stack);
- a firefly "Sonic-ring" scramble after a hit;
- a raining-frogs transfer every floor.

The Wick's comedy (wobble, belly-flop, stub) is good, but most of it is transferable. The frog's is native.

## 8. Fair critique of the alternatives

**Candle Wick (current GDD).** It genuinely wins on:
- the **best HP silhouette in the field**: a shrinking body beats deflation plus glow in lit Landings;
- perfect native fit with pillar 1;
- a fully written GDD (§4.3, §4.5, §5, §12 and §13 are all candle-native).

It loses on:
- **fidelity**: the user's metaphor is demoted to set dressing;
- **no hat slot**;
- a verb set that is mostly generic TEAMBOUND grab/shove/throw plus light;
- a weak space logic;
- **uniqueness**: *Candleman* (2016) already owns "a candle whose light is life."

Its one frog-proof advantage: in a well, **rising water is a natural threat to a candle but not to a frog.**

**Glow-frog hybrid** (a frog carrying or crowned by a flame, or with glowing skin).
- **Flame on the head:** two focal points (eyes and flame), the hat slot is gone again, and the fiction needs an explanation ("why does a frog carry a candle?"). It also inherits the rig costs of both designs.
- **Glowing skin:** the whole-body glow blooms out the silhouette and fights the readability contract.

The Firefly Frog is what the hybrid should become: the light sits *inside* the silhouette, it is a stealable resource, and it is 100% frog.

**A 4th option?** I don't think one beats these. The Firefly Frog is the frog pitch in concrete form, not a new candidate.

## 9. What I concede, and how to fix it

1. **The Tide.** Rising water doesn't threaten frogs. Re-skin it as **the well draining**: the frogs dry out, which is also a Brighten-style HP drain. It is the fiction's reason to climb.
2. **HP readability** is about 15% weaker than a shrinking candle in lit spaces. Mitigate with deflation plus eye-lid droop plus belly glow.
3. **Design rewrite:** roughly 15–20% of the GDD's text (verbs, the HP vocabulary, cosmetics, the Chimney/Snuffer skins, plus renaming Wickbook and Drips). The systems don't change.
4. **Meme risk.** Rule: a round, chibi face, no human lips, never the drooping-lip frog. Frogs are also common in games (*Frogger*, *Frog Detective*, *Frogun*). The uniqueness comes from the firefly light and the well cosmology, not from "frog" alone.

## Scorecard (1–5)

| Criterion | Wick | **Firefly Frog** | Glow-frog hybrid |
|---|---|---|---|
| Fidelity to the user's vision | 2 | **5** | 4 |
| HP / emotion / reputation from silhouette | **5** | 4 | 3 |
| Signature verbs | 3 | **5** | 4 |
| Scale-up (Sky → Space → Beyond) | 3 | **5** | 4 |
| Procedural build cost (higher = cheaper) | **5** | 3 | 2 |
| Skins and commercial appeal (hats, plush) | 3 | **5** | 3 |
| Comedy and clips | 4 | **5** | 4 |
| Fit with the written GDD | **5** | 4 | 3 |
| **Total** | 30 | **36** | 27 |

**Recommendation:** make the Firefly Frog the hero. Keep every GDD system through the translation table in §2, keep the Wick's best idea (HP = light), and put the user's own metaphor in the player's hands.

Files read: `C:/Users/mrkl6/Downloads/Projects/Team CO-OP/make me a name/_design/GDD.md`, `C:/Users/mrkl6/Downloads/Projects/Team CO-OP/make me a name/_design/WORLD_STRUCTURE.md`, `C:/Users/mrkl6/Downloads/Projects/Team CO-OP/make me a name/_design/GDD_CRITIQUE.md`, `C:/Users/mrkl6/Downloads/Projects/Team CO-OP/make me a name/_scaffold/src/` (the actors folder is empty).