# hero:1 (saved from merge run wf_01dca530-b92)

# Hero case: the Candle Wick

## Verdict
Make the **Wick** the hero. Keep the **frog** as the world's witness and as a cosmetic line. Drop the **glow-frog hybrid**, because it collects the weaknesses of both.

This is not a sunk-cost argument, even though GDD v1.0 and WORLD_STRUCTURE v1.0 are both built on Wicks. My claim is narrower. Nearly every system the user asked for (co-op, sabotage, strange clear conditions, readable betrayal, "top tier" visuals and the climb from well to sky to space) has a natural physical form on a candle. On a frog, each of them has to be bolted on.

---

## 1. The strongest honest case for the Wick

### 1.1 The body is the whole UI
Pillar 1 in GDD §1.1 says you can read a Wick's whole state from its silhouette across a dark room. A candle can do this because it has **four separate visual channels**, and none of them overlap:

| State | Channel | Reads at 25 m in the dark because... |
|---|---|---|
| HP | **Body height** (0.72 m down to 55%) | A shrinking cylinder is the easiest size change to read |
| Emotion / intent | **Flame shape** (height, sway, fork, lean, tint; §4.5) | It is the brightest pixel on screen, and bloom exaggerates it |
| Stealth / exposure | **Flame size** (Brighten 14 m, Dim 2 m) | Light radius shows on the room itself, not only on the character |
| Reputation | **Soot rings** at 30/50/70% | Dark bands on a plain cylinder, drawn on top of any skin |

The **Resolve tell** is the key example: the flame forks and leans toward its target, 15% redder, 1.5 s before a Knife. It carries the whole "betrayal is always visible" rule, and it costs five shader uniforms, with no face rig.

A frog has no built-in place for HP (a bar? inflation?), for emotion (it needs an eye, lid and mouth rig), or for reputation (spots, which clash with spotted skins).

### 1.2 The hero is the light source
The art direction in §13.1 is "storybook miniatures lit only by the players". That style only works if the hero emits light. The Wick's `PointLight` is its HP (intensity scales with wax), its verb (Brighten/Dim) and its lighting rig.

Twelve room designs depend on flame verbs:
- light-seekers: the Snuffer, the Executioner and the Chrono-Slime;
- wax-script and shadow-glyphs;
- Drip, where healing is a visible sacrifice of your own body;
- Relight;
- the Drip Chimney, where your own heat melts the holds;
- the Fuse Tether;
- the boss, a bell that comes down on the brightest light.

A frog would need to carry a lantern in all of these rooms. At that point the lantern is the real protagonist and the frog is only holding it.

### 1.3 It is the best fit for the frog-in-a-well idea
This is where I disagree most with the literal reading of the user's message. 井底之蛙 ("the frog at the bottom of the well") is a saying about **perspective**, not about amphibians. The user even framed it loosely: "some concepts for reference that's all."

The world is a nested chain of wells, a scale ladder that is really a ladder of **lights**: candle, lantern, sun, star, galaxy knot. A candle hero makes each scale jump rhyme:
- **Law 2: "Every sky holds the ones who stopped."** The stars in the Coin are Burnt-Out Wicks holding lanterns. For a candle, looking up and discovering that the stars are other candles is a real emotional beat. For a frog it is only a fact.
- **The reveal beacons** (WORLD §10.1) are flame sprites held at a fixed screen size of at least 14 px. They are "the last things visible". At 14 px a frog is a green smudge; a Wick is a star. The hero **becomes the same kind of object as the thing it is looking at**, which is the idiom's lesson in visual form.
- **The frog is kept, in a stronger role.** It is the stone statue at the Foot, looking up. At the Revelation it is the nearest silhouette on the rim of the larger well. In Cycle 2 the plinth is empty: "The frog has gone up." If you *play* the frog, that twist has no one to land on. Making the frog the watcher is what lets the ending say that there is always a bigger well.

### 1.4 It survives, and gets better, through Sky, Space and Beyond
- **Sky (UPDRAFT).** Every flame leans with the wind. The 1 s gust warning is already drawn on eight characters' heads, so the telegraph is free.
- **Space (DRIFT).** Real candle flames in microgravity burn as **dim blue spheres**, because nothing carries hot air upward. Switching the flame shader to a sphere in L3 announces the layer through the silhouette, and it is true science the audience can discover. Brighten costing 2 wax/s ("fire needs air") already fits.
- **Beyond (LIGHT-LAG).** The Wick's face is made of light, so a rule about light arriving late is a rule about the hero's own body.
- **Growth.** The line "[ OUTGROWN ] Resonance will not fit the next well" becomes a flame radius that visibly outgrows each layer.
- **Water.** The Tide is well water rising, and water kills a candle, so the dread is real. For a frog, water is home.

### 1.5 It is easy to build procedurally, and the squash-and-stretch comes naturally
- **Parts:** a Lathe body, a billboard flame shader, two nub spheres, a wick Tube and a Holder. That is about 6 meshes and trivially instanced, which suits the Iris Xe 60 fps target.
- **Squash-and-stretch** is a volume-preserving scale (`sy = s`, `sxz = 1/√s`) on a soft material. Warm wax *should* squash, so the ±8% waddle and the 15% landing squash look physically motivated rather than cartoon-imposed.
- **Wax** gets subsurface glow near the flame for free: shader thickness comes from the Lathe radius.
- **A frog** needs four 2-bone legs with ground IK to hop convincingly, plus eyes, lids, a mouth, a throat sac and a tongue spline: 12–15 parts. Without a proper rig it reads as a sliding blob, and that is the fastest way to miss "top tier".

### 1.6 Skins and commercial appeal
- **Silhouette.** It sits in the same class as the Among Us crewmate and the Fall Guys bean: a **vertical capsule with one strong feature on top**. Vertical silhouettes separate cleanly in an 8-player crowd seen from a 3/4 camera. Low, wide frog bodies overlap.
- **Catalogue.** Candles are a real consumer category with endless variety: tapers, votives, tealights, birthday numbers, trick candles, sparklers, church pillars, wine-bottle drip candles.
- **Two colour channels.** Every Wick skin has a lit, glowing top (the flame) and a body (the wax), so a cheap skin still looks good in the dark. The 60-item catalogue across 10 slots already shows the depth: Lava Lamp wax, Traffic-Cone wick, Phoenix Crest flame, Opera Curtain betrayal snap.

### 1.7 Comedy and clip potential
The GDD notes that the comedy comes from bodies. The Wick has built-in gags:
- melting to a stub;
- a puddle death;
- rising back up from the puddle in 0.8 s;
- a belly-flop dive with a flame trail;
- the match-flick Relight;
- Snuff Tag with a bell hat;
- being blown out in your friend's slow-motion Betrayal Cam.

The best clips are the **Trust Fall**, where the screen shows only sky until someone catches you, and the Cut, a 1.2 s duel with a glowing thread.

---

## 2. The Wick's real weaknesses, and their fixes

1. **It is not the frog the user named.** The user may feel unheard, and that is the biggest risk. **Fix:** present the frog explicitly as the game's emblem and ending, not as a statue tucked in a footnote. Add an earned-only **Frog Holder** as the Cycle 2 reward. The plinth is empty because the frog has "gone up": it now carries your candle.
2. **A candle is an object, not a creature.** All the empathy rests on the eye-ovals in the flame. If they look ghostly, the hero is a lamp. **Fix:** make the flame-face the first prototype gate. It must pass a "can you tell Joy from Fear from Resolve at 25 m" test with players who have never seen it.
3. **The flame floats above a shrunken stub** (critique #28). **Fix:** keep the flame height fixed and let the **exposed charred wick grow longer** as the wax drops. Hitbox fairness is preserved, and the long black wick becomes a second way to read low HP.
4. **It has no signature traversal verb.** Its verbs are light verbs, so movement is a hop-waddle. The Landings and minigames need to lean on body comedy (dive, shove, brace, the Wax Stack).
5. **A frog is a meme animal and a candle is not.** This is true, but Among Us made a crewmate iconic through silhouette plus customisation plus clips, not through an existing meme.

---

## 3. A fair critique of the alternatives

### Frog
**What it genuinely does better:**
- a literal match for the user's image;
- instantly cute and meme-native;
- **the tongue-lash is the single best verb on the table**: ranged grab, yank and steal make a clip machine;
- the croak fits the resonance puzzles;
- **metamorphosis (tadpole, froglet, frog)** is a better growth metaphor across layers than anything the candle has.

**Why it loses:**
- **No readable state channels.** HP, emotion and reputation all need extra systems, and spots on the skin compete with soot.
- **It needs an external light** in a game built on darkness.
- **Its silhouette is low and wide.** In a crowd seen from 3/4 view, bodies occlude each other.
- **The scale-up has no rhyme.** A frog in a space helmet is a gag, not a revelation, and at beacon size a frog is invisible.
- **The tongue breaks the betrayal contract.** A 0.2 s ranged yank off a ledge is an **unreadable Knife**. Adding a 1.2 s channel makes it fair but removes the joy.
- **The tongue is costly to network.** A ranged grab of another player over `ws` needs server-authoritative reconciliation and feels bad at 100 ms of latency. It also violates "fun before physics" (§1.3).
- **It would be a redesign, not a swap.** WORLD_STRUCTURE §0 already rejected the frog draft as "a second game".

### Glow-frog hybrid
**What it genuinely does better:**
- it keeps the literal frog and solves the lighting problem;
- a bioluminescent amphibian can be very appealing (think glowing axolotl).

**Why it loses:**
- **HP, stealth and emotion all collapse onto one channel: glow.** When a glow-frog dims, is it hiding, dying or scared? That ambiguity is a direct readability failure, and the Wick avoids it because its size, flame shape and light radius are separate.
- **The metaphors blur.** Why does the glow run out? What does Drip give a friend? Why does a bell snuff it?
- **It has two focal points** (the face and the glowing sac), which splits the eye.
- **It is the most expensive to build** (the full frog rig plus glow shaders).
- **It is design by compromise.** It is worse than the Wick on systems and worse than the frog on purity.

### A 4th option?
I considered a **firefly or lantern-moth**: it is a light-bearing creature and flight suits Sky and Space. I rejected it, because flight dissolves the platforming, the Trust Fall and the tether.

The better fourth option is an **arrangement, not a new species**:
- **The Wick is the hero.**
- **The Frog is the world's witness and emblem:** statue, then Revelation silhouette, then "gone up", then the Frog Holder.
- **Frog DNA is sold as cosmetics:**
  - Toad Chamberstick holder (ceramic frog candle holders exist in real life);
  - Lily-Pad dish;
  - Frogspawn wax, with speckled translucent eggs;
  - a Croak knock sound.
- **Metamorphosis becomes the Surfacing Holders:** Well-stone, Paint-chip, Meteor-iron and Knot-glass.

---

## 4. Scorecard (1–5)

| Criterion | Wick | Frog | Glow-frog |
|---|---|---|---|
| Literal fidelity to the frog-in-a-well image | 3 (frog as witness) | **5** | 4 |
| Reading HP, emotion and reputation from the silhouette in 3/4 view | **5** | 2 | 2 |
| Signature verbs | 4 (light verbs) | **5** (tongue) | 4 |
| Fit with the dark, player-lit style and the 12 rooms | **5** | 1 | 3 |
| Survives Sky, Space and Beyond | **5** | 2 | 3 |
| Procedural build and squash-and-stretch | **5** | 2 | 2 |
| Skin catalogue depth and iconic silhouette | **5** | 4 | 3 |
| Comedy and clip potential | 4 | **5** | 3 |
| Netcode and fairness risk | **5** | 2 | 3 |
| **Total** | **41** | 28 | 27 |

**Bottom line:** the frog is the better *idea* to start from and the Wick is the better *character* to control. Ship the Wick, give the frog the ending, and sell the frog as holders.

**Files read:**
- C:/Users/mrkl6/Downloads/Projects/Team CO-OP/make me a name/_design/GDD.md (§0–2, §4.3–4.5, §5.1, §10.2, §12, §13)
- C:/Users/mrkl6/Downloads/Projects/Team CO-OP/make me a name/_design/WORLD_STRUCTURE.md (§0–4, §9, §10)
- C:/Users/mrkl6/Downloads/Projects/Team CO-OP/make me a name/_design/GDD_CRITIQUE.md (#26–28)