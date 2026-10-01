# 03 · Social play, betrayal and the Rivals

**KNOTWELL master design set** · **Version** 1.0 · **Date** 2026-09-29 · **Status:** BINDING for social systems, the System voice and the Rivals.

**Authority.** The user's words, then `DECISIONS.md` (**DEC**), then `_design/FUN_OVERHAUL.md` (**FO**), then the reports (**UT**, **RR**), then the parts bin (GDD, WORLD, CRIT). This file re-homes GDD §2.3, §7 and §8 onto FO §5 and DEC §4, §5, §8. Where GDD text disagrees, this file wins.

**Tags.** Every feature carries [MUST-A] (Quick Climb, free demo), [MUST-B] (Full Climb, ★1, climb 2), [SHOULD] or [LATER]. Every number is a **greybox hypothesis** unless a source is cited. Build terms (`BetrayalService`, `RivalBrain`, stage names) are never shown to players.

**What this file owns** (DEC §9): lobby types; mischief vs Heart doors; the Knot and the Cut; the Betrayal Cam, WANTED poster and Vengeance; Heart-door social rules (all four, Doppelfrog in both variants); blame tags and replays; the fairness contract; anti-griefing guard rails; the Wheel's content; the System voice; the audience layer (LATER); the 10 Rivals as frogs; Rookie Rivals; bot brains, gating, door behaviour, betrayal model, barks; the Drama Director and its first-climb beats; offstage Rivals; the Rival Register; public-lobby rules.

**What other files own, referenced here:**

| Topic | Owner |
|---|---|
| Seat Hue palette, the 8 bindings, verb-rank numbers, spots/catch/ghost/revive, tongue physics | `02_HERO_AND_CONTROLS.md` |
| Firefly yields, Boons and Duos, classes and secret quests, Tower Rank, Team Lives, results ceremony | `04_PROGRESSION_ECONOMY.md` |
| Room geometry, timers, Twists, rank lanes, each room's BotPlan contents | `05_ROOMS_SLICE.md` (this file sets the rules every BotPlan obeys) |
| Hub, Landings, Meeting room and toy rules | `07_HUB_AND_MINIGAMES.md` |
| Betrayal Snap cosmetic, earned catalogue | `08_COSMETICS_SHOP.md` |
| Final hexes, fonts, System-window visuals, audio recipes, Rival art | `09_ART_UI_AUDIO.md` |
| NGO RPC plumbing, lag compensation, visibility, Steam Timeline calls, soak harness | `10_UNITY_TECH.md` |

---

## 1. The social contract in one screen

**Co-op is the default. Betrayal is the spice.** Every room is built so that working together is the easiest way through, and every mistake is shared. Betrayal exists in exactly one place, the **Heart door (♥)**, where the plaque and the rule announce it, it stays inside one room, it ends in a slow-motion replay, and the victim gets a guaranteed shot at revenge (FO §2.2 pillar 4, §5.2).

| Where you are | What another frog can do to you | What it can cost you |
|---|---|---|
| Any room, Landing or toy (not ♥) | **Mischief:** shove, a tongue tug of at most 1 m, a croak in your ear | Pride. Never fireflies, never a spot from a drop (the ledge guard, §3.3). |
| Knotted, outside ♥ | A **Cut**: a comic breakup | The Knot and its Duo until the next Landing. Nothing else. |
| **Heart door** | **The Cut** (if Knotted) and **the Heart push** (shove or full yank, no ledge guard); the room's own secret choice | Only **unbanked** fireflies from this room, plus whatever spot the room's hazard takes. Never a Team Life (§8.1 rule H4). |

**The comedy formula** (RR; FO §5.1): *my mistake hurts you* (coupling) + *everyone saw who did it* (visible blame) + *it didn't cost much* (cheap failure). §4 builds the coupling, §5 builds the blame, §10 caps the cost.

**Spice budget per climb** [MUST-B]:
- Heart doors: 2 in climb 1 (doors 11 and 14, authored); 1–2 in seeded climbs, from door 6 (DEC §5).
- Bot betrayals: at most **3 per climb**, at most **2 per Heart door**, at most **1 against each human per floor** (§22).
- Betrayal Cams: at most **1 Cam sequence per door**, holding up to 2 clips (§9.1). It is that door's one full-screen moment (DEC §5 "one full-screen card per door").

**Consent by walking** [MUST-B]. In climb 1, doors 11 and 14 are single Heart doors (authored, DEC §5). In seeded climbs a ♥ plaque is always one side of a pair, and the other side is a ♠/♦/♣ door. Walking away from the ♥ door is the lobby's opt-out. (05 places doors; this is the social rule it must honour.)

---

## 2. Lobby types

[MUST-A] Solo, Friends (Steam friends), Private (invite code) and LAN. [SHOULD] Public matchmaking (DEC §7 SHOULD #4). Friends and Private share one rule set.

| Feature | Solo | Friends / Private / LAN | Public [SHOULD] |
|---|---|---|---|
| Seats | 1 human + 7 Rivals | 2–8 humans; Rivals fill every empty seat | 2–8 humans; Rivals fill |
| Human → human betrayal in Heart doors | — | **On** (host toggle "Human betrayal", default On) | **Off.** Rivals do the betraying. |
| Human → Rival betrayal | On | On | On |
| Rival → human betrayal | On (Drama Director limits) | On | On |
| Blame tags (§5) | On | On (host toggle, and each player's local toggle) | **Off** |
| Named Underdog line (04) | On | On | Private, unnamed |
| Tongue tug near ledges (§3.3) | Ledge-guarded | Ledge-guarded | Ledge-guarded |
| Rank Sync (talents off, 04) | Off | Host option, default Off | **On** by default |
| Bot badge on Rivals | Shown | Shown; **Masked Rivals** opt-in [SHOULD] | **Always shown** |
| Doppelfrog variant (§8.5) | Spot the Mimic | Human Mimic if ≥3 humans and the toggle is On; else Spot the Mimic | Spot the Mimic |
| Drama Director (§22) | On | Host option, default On | On |
| Kick a player to a Rival | — | Host, any time; takes effect at the next door | **2 flags** from other humans; takes effect at the next door |
| Proximity voice [LATER] | — | Opt-in per player | Off |
| Free text | Never | Never | Never |
| Streamer-safe toggle [SHOULD] | — | Hides the join code; other humans drawn as Seat Hue tags | Same |

**The betrayal permission check** (one function, host-side, used by every betrayal verb):

```csharp
// Game.Core/Social/LobbyRules.cs
public bool CanBetray(Seat actor, Seat victim, RoomDef room) =>
    room.IsHeartDoor
    && !actor.IsDark
    && (victim.IsRival || actor.IsRival
        || (Lobby.Type is LobbyType.Friends or LobbyType.Private or LobbyType.Lan
            && Lobby.HumanBetrayalOn));
```

When `CanBetray` is false, the Heart push falls back to mischief caps (§3), the Cut acts as a breakup (§7.2), Split or Swallow locks the swallow input for that pair, and the tied bridge locks the Cut prompt.

**Masked Rivals** [SHOULD]. Host opt-in, Friends/Private only. Rivals show a plain handle (`Frog 3`) in their Seat Hue, with no badge and no signature barks. Every Rival is revealed on the results screen with its real name. Never in Public.

---

## 3. Mischief: always on, never costs anything

Mischief is the everyday slapstick layer (FO §5.2). It is on in every room and every lobby, and it **moves no value**.

### 3.1 The three mischief verbs [MUST-A]

| Verb | Input (02) | Effect on another frog | Cap |
|---|---|---|---|
| **Shove** | Shove tap | 6 m/s impulse, identical for everyone (FO §5.4 #1) | Ledge guard (§3.3); spam throttle (§3.4) |
| **Tug** | Tongue lash on a frog | Pulls the frog toward you | **≤ 1.0 m** displacement; ledge guard |
| **Croak-scare** | Croak pulse within 2 m of a frog | Startle animation (eyes pop, 0.4 s hop in place); Rivals bark (§23 B12) | No physics effect on humans |

### 3.2 What mischief can never do

- Move fireflies. **Outside Heart doors, spilled fireflies always return to their owner**, whoever tongues them (FO §4.1).
- Move a knocked-out spot to anyone but its owner. A caught spot always flies home (FO §3.7).
- Push a frog over a drop or into hazard water (§3.3).
- Change a Team Life, a Boon, a level, Rank, Pearls or a cosmetic.

### 3.3 The ledge guard [MUST-A]

- **Hazard edges** are authored in every room shell as a NavMesh area `HazardEdge` (drops over 1.0 m, pike water, spike pits, the void). 05's shell generator stamps them; a validator fails any room whose hazards lack the area.
- **Tug:** the host predicts the tug's end point. If it is off the NavMesh or within 0.4 m of a `HazardEdge`, the tug is shortened to the last safe point. If that is under 0.2 m, the tongue fizzles with a wet "thhp".
- **Shove:** when the target is within 1.5 m of a `HazardEdge`, the impulse component toward the edge is removed. The target does the **teeter** instead: a 0.8 s arm-wheel wobble on the brink (a built-in gag, 09 animates it).
- **Knot partner full yank outside ♥:** the landing point must be on the NavMesh within 0.5 m of the yanker, or the yank is refused (fizzle).
- **Inside Heart doors** the ledge guard is off for betrayal-permitted pairs only (`CanBetray` true). Everyone else keeps it.
- **Rafts:** a raft is a platform, not a hazard. Weight shifts that tip a raft are the gimmick (§4) and are allowed. Shoving a frog *off* a raft into pike water is blocked by the same guard.

### 3.4 Spam throttle [MUST-A]

Outside Heart doors, one frog may shove or tug the same target at most **3 times in 5 s**. The 4th fizzles and the System stays silent (no shaming). Rivals obey the same throttle.

---

## 4. Shared fate: linked bodies in every room

Every rule door, set piece, Heart door, Keeper and Warden carries exactly one **shared-fate gimmick** (FO §3.8 #8; DEC §4). This is where the co-op comedy comes from. Each gimmick is a component that also reports **who caused** a failure, so blame tags (§5) are always true.

```csharp
// Rooms/SharedFate/ISharedFate.cs
public interface ISharedFate {
    SharedFateKind Kind { get; }
    // Called by BlameTracker when a blame-worthy event happens in this room.
    BlameResult ResolveBlame(BlameEvent e, IReadOnlyList<Contact> recentContacts);
}
```

| Kind | Rule (greybox numbers) | Blame source | Default slice rooms (05 may refine) |
|---|---|---|---|
| `TwoFrogDoor` | Opens only while ≥2 frogs push within 1.0 s of each other | — | `br_shove_door` |
| `TipRaft` | Tilt is one replicated float from weight torque (DEC §7 M0). Over 18° for 1.5 s, frogs slide | The frog whose weight change added the most torque in the last 1.0 s | `lily_raft`, `keeper_bell_raft` |
| `GazeShared` | One frog moving while the monster looks turns the monster's attack on the whole cone | The frog that moved | `bell_golem`, `keeper_bell_raft` |
| `NoiseShared` | One frog's croak or splash draws the monster to everyone within 6 m of the noise | The noisemaker | `echo_warren`, `snake_coil`, `br_sleeping_toad`, `web_spider` |
| `LightLure` | The brightest frog draws the monster, and frogs within 2 m of it share the hit | The brightest frog | `fog_stair`, `warden_the_jar` P1 |
| `FragileCarry` | A shared object (egg, key) cracks on a drop over 1.2 m or a carrier hit; 3 cracks break it | The frog that dropped it or got hit | `snapper_crossing` |
| `ChorusLock` | Two frogs must croak within 0.3 s; a lone croak wakes the monster | The lone croaker ("one sad croak") | `lamp_knight` |
| `WatchLock` | The monster moves only while nobody watches it; someone must keep looking | The last frog to look away | `moss_snail` |
| `Tether` | Pairs tongue-tied at 3.0 m max; hops must land within 0.25 s of each other | The frog whose hop broke sync | `sp_tongue_tether`, `heart_tied_bridge` |
| `GripHaul` | Per-frog grip ring (PEAK: per climber, not shared, FO §10.5); tongue-haul a friend up | Self ("gravity") | `sp_grip_wall` |
| `StackPad` | Frogs stand on each other's heads (Frog Stack rules); stacks of up to 4 | The frog who stepped off or pushed | `heart_two_pads`, `toy_frog_stack` |
| `JarShare` | Pairs choose share or swallow in secret | The swallower | `heart_split_swallow` |
| `Mimic` | One seat is not a frog | The Mimic | `doppelfrog` |

---

## 5. Blame tags and replays

### 5.1 Blame tags [MUST-A]

A short joke tag appears over the victim on every fall, every hazard hit caused by another frog, and every failed door (FO §5.1; RR "who caused it").

**Where they show:** Solo, Friends, Private, LAN. **Never in Public.** Each player can turn them off locally (Settings → Social → Blame tags); the host can turn them off for the lobby. They are **never** added up, never shown in results, never saved to the Rival Register, never sent to Steam (DEC §8.3 "any results stat or title that counts betrayals").

**Attribution** (host, `BlameTracker`):
1. Every frog keeps a list of `Contact { byId, kind, t, deltaV }` for the last 3.0 s. Kinds and weights: shove 1.0, tug 1.0, yank 1.2, landed-on-head 0.8, raft weight 0.6, dropped-carry 1.0, noise 0.7, Cut 1.5, Mimic tag 1.5.
2. On a blame event (hazard fall, spot lost to a monster, gimmick failure, room failure), the room's `ISharedFate.ResolveBlame` answers first. If it returns nothing, pick the contact with the highest `weight × (1 − age / 3.0 s)`, ignoring physical contacts under 1.0 m/s.
3. No contact → a self tag.
4. A frog is never blamed for its own Signature or a Boon effect on itself.

**Display:** a pill 0.6 m above the victim's name tag for 2.5 s; the blamer's name is printed in the blamer's **Seat Hue**; pill background `#101418` at 80%. The same tag rides on the fall replay (§5.2). Rivals react with a B12/B25 bark (§23).

**Templates** (string table `Blame`; `{a}` = blamer, `{v}` = victim):

| Key | Text | When |
|---|---|---|
| `blame.shove` | Shoved by {a}. Allegedly. | shove contact |
| `blame.yank` | Yanked by {a} | tug or yank contact |
| `blame.head` | Landed on by {a} | landed-on-head |
| `blame.raft` | Sank the raft: {a} | `TipRaft` |
| `blame.gaze` | Moved while it looked: {a} | `GazeShared` |
| `blame.noise` | {a} croaked. It noticed. | `NoiseShared` |
| `blame.light` | Too shiny: {a} | `LightLure` |
| `blame.drop` | Dropped the egg: {a} | `FragileCarry` |
| `blame.lone` | One sad croak: {a} | `ChorusLock` |
| `blame.look` | Looked away: {a} | `WatchLock` |
| `blame.sync` | Out of step: {a} | `Tether` |
| `blame.cut` | Cut loose by {a} | Cut (Heart door) |
| `blame.mimic` | Tagged by something | Mimic tag (the tag never names the Mimic before the vote) |
| `blame.self` | {v} vs. gravity: gravity wins | no contact |

### 5.2 Replays [MUST-A]

All replays are rebuilt **on each client** from a local ring buffer of replicated state; the host only sends the event (FO §5.1; UT). Ragdolls are re-simulated locally and never networked (DEC §2).

- **`ReplayBuffer`** (client): 30 Hz snapshots of every frog in the local player's current room, for 4.0 s: position, rotation, tongue endpoint, throat-sac scale, pose flags (hop, tongue, croak, stunned, dark), carried-object id. About 8 frogs × 120 frames × 64 B ≈ 61 KB.
- **The 3 s fall replay:** on the local player's own fall or hazard hit caused by a contact, a picture-in-picture window (28% of screen width, bottom-right, 12 px corner radius) plays the last 1.5 s at 0.5× (3.0 s), with the blame tag. Input is never blocked. It shows once per incident. Setting: Social → Fall replays (On).
- **The failed-door replay:** when a door fails, the same PiP plays the 1.5 s before the fail trigger for every human, tagged by `ResolveBlame` (tag hidden in Public).
- **The Betrayal Cam:** §9.

### 5.3 Steam Timeline markers [MUST-A for the system; MUST-B for these two events]

DEC §8.2 #21 makes Timeline markers MUST-A. This file names the two social **featured** markers; 10 wires them through `SteamTimeline.AddInstantaneousTimelineEvent`:

| Event | Title | Description template | Offset |
|---|---|---|---|
| Betrayal Cam | "Betrayal" | "{traitor} and {victim}, door {n}" | −3.0 s |
| Vengeance landed | "Vengeance" | "{victim} got {traitor} back, door {n}" | −2.0 s |

Names in markers are Seat display names. In Public, descriptions drop names ("Betrayal, door {n}").

---

## 6. The Knot

[MUST-B] A **Knot** is the pact two frogs make at a Landing (DEC glossary #14). It is the only relationship system in the game, and it replaces the GDD's Pacts, Pact Pot and gold threads.

**When it unlocks**
- **Climb 1:** at **Landing 3** (DEC §5, §8.2 #5). A Rival offers first (§22.4, beat DD-L3).
- **Seeded climbs:** from **Landing 1**.

**Forming a Knot** (Landings only)
1. Open the Wheel and pick **"Knot?"**.
2. If a frog is under your reticle within 6 m, it is asked. Otherwise a ring of party portraits (Seat Hue ring plus name) opens, and you pick one. **Distance never matters**, so premade voice groups get no edge (FO §5.2).
3. The asked frog sees `{name} asks: Knot?` above the asker and accepts by picking "Knot?" within **10 s**.
4. Limits:
   - one Knot per frog;
   - a declined or timed-out request blocks re-asking the same frog until the next Landing;
   - after a Cut, the two frogs can't re-Knot until the next Landing.

**The thread.** A glowing tongue-thread joins the pair:
- a spline with 0.5 m sag at rest, 2 cm thick, braided from both Seat Hues;
- visible to the pair through walls, and to everyone else only in line of sight within 25 m.

**What the Knot gives**

| Benefit | Number | Owner of the number |
|---|---|---|
| See your partner's outline through walls | Same room only; outline in the partner's Seat Hue | this file |
| Faster revive | Croak hold **1.0 s** instead of 2.0 s | 02 |
| Duo Boons offered | While the two hold Boons from different families | 04 |
| Tell-Sight II and Lookout share | As the Boon text says | 04 |
| **Partner full yank** | Hold Tongue on your partner 0.6 s: pull them to you. Outside ♥ it is ledge-guarded (§3.3), so it rescues and never kills. | this file |

**How a Knot ends**
- a **Cut** (§7.1);
- a **mutual untie**: both pick "Knot?" again, with no Cam and no cost;
- the end of the climb;
- nothing else. A disconnect hands the seat, and the Knot, to a Rival.

**Across a fork** the Knot stays. Outlines show only when both frogs are in the same room.

---

## 7. The two betrayal verbs

There are exactly **two betrayal verbs**, and both reuse bindings the player already has (FO §3.9). No new button exists for betrayal.

### 7.1 Verb 1: the Cut [MUST-B]

**Input.** Hold **Shove for 1.2 s** while Knotted. It works at any distance, because the thread is the target.

**The tell** (humans and Rivals; a Rival also plays the full tell of §7.3 first):
- the thread flashes betrayal crimson and pulses at 4 Hz;
- a rising "shhhk" climbs one octave over 1.2 s. It plays positionally at the cutter, and as a 2D copy in the partner's ears, so the partner never misses it;
- the cutter's cheeks puff (throat sac +40%).

**The counter: hold on.**
- The partner holds **Tongue for 0.4 s** at any point in the channel. The tongue auto-wraps the thread, with no aim needed.
- The partner must start by 0.8 s into the 1.2 s channel.
- **Result:** the Cut fails, the cutter is stunned for 1.0 s, Cut goes on an 8 s cooldown, and the Knot survives. System: `[ HELD ON ]`.

**Cancels.** The channel also ends if the cutter releases Shove, is hit, or goes Dark.

**Outcomes**

| Where | Result |
|---|---|
| Outside a Heart door, or `CanBetray` false | **Breakup.** The Knot ends. The Duo breaks until the next Landing. A Cam plays with `[ IT'S OVER ]`. No poster, no Vengeance, and no value moves. |
| Inside a Heart door, `CanBetray` true | **Betrayal.** All of the partner's unbanked fireflies move into the cutter's crimson cheeks (escrow, §10.2). In `heart_tied_bridge` the cutter is also freed. Then the Cam with `[ TRAITOR ]`, a WANTED poster and a Vengeance quest. |

**Server authority** (FO §5.4 #7).
- The client sends `RequestCutStartServerRpc` / `RequestCutReleaseServerRpc`, which are intents only.
- The host validates the Knot, runs the 1.2 s timer on its own clock, and broadcasts `CutChannelClientRpc { cutter, partner, hostTickStart }` so that every client starts the tells on the same tick.
- The host alone decides the outcome.

### 7.2 Verb 2: the Heart push [MUST-B]

"Heart push" is a design term, like "full tell" and "escrow". Players never see it: on screen they simply shove and yank. Inside a Heart door, for any pair where `CanBetray` is true, the mischief caps come off:
- **Shove** keeps its 6 m/s impulse, but the ledge guard is off.
- **Full yank:** hold Tongue on a frog for **0.6 s** to pull it to you along the tongue, up to your tongue range (3 / 4.5 / 6 / 8 m by rank, per 02).
  - The tell during the 0.6 s: your cheeks puff, your tongue tip glows crimson, the victim's name tag flashes crimson, and a wet, rising "hnnk" plays.
  - Released early, it is an ordinary 1 m tug.
- **Spills:** a hit in a Heart door spills 20% of the frog's unbanked fireflies, and **whoever catches them keeps them** (FO §4.1).

**Which verbs a Heart door allows** is data: `RoomDef.heart.verbs` ⊆ {Shove, Yank, Cut, Swallow, MimicTag}. `heart_two_pads` in climb 1 is `[Shove]` only (DEC §5).

A push counts as a betrayal only when value moves (rule H3, §8.1). A shove that changes nothing is mischief, even in a Heart door.

### 7.3 Tells: every betrayal is readable

| Action | Human tell | Rival tell |
|---|---|---|
| Cut | 1.2 s channel (§7.1) | Full tell 1.5 s, then the channel |
| Heart shove | The Shove wind-up from 02 | Full tell 1.5 s, then the shove |
| Full yank, Mimic tag | 0.6 s: cheek puff, crimson tongue tip, the victim's tag flashes | Full tell 1.5 s, then the 0.6 s |
| Swallow | None: it is a secret choice, and the room says so | Full tell while facing its partner in the booth |

**The full tell** (Rivals only; FO §5.3 "never betray without the full tell"; hero_0's Resolve tell, re-homed). It lasts **1.5 s**:
- the throat sac inflates 40% and holds;
- the crimson tongue tip peeks out;
- the eyes narrow and track the target;
- the body glow shifts 15% toward betrayal crimson;
- the body leans 10° toward the target;
- the croak-babble drops a perfect fourth;
- a babble-only "…" bubble appears, with no words.

Nothing shortens the full tell: no Boon, no difficulty (Hell's tells ×0.7 apply to monsters only), and no Drama Director.

**Cold feet** (Rivals only). If, during the full tell, the target is within 12 m and faces the Rival within 30°, the Rival aborts with probability **(1 − Nerve/100) × 0.8** and barks "Sorry!" (§23 B32). That window's roll is spent. So staring down a suspicious frog works: it gives Vex (Nerve 70) a 24% chance to lose his nerve, and Maud (Nerve 50) 40%.

**Betrayal crimson.** Reference `#E8254F` (hue about 347°). 09 owns the final hex. The 15° exclusion for cosmetics and Seat Hues (DEC §2) is measured from it.

**If tongue-on-player is cut** after the M0 proof of concept (DEC §7):
- the full yank is removed;
- the Mimic tag and the Vengeance tag become **touch tags** (bump within 0.8 m for 0.3 s);
- the Kestrel beat uses Shove.

The rest of this file is unchanged.

---

## 8. Heart doors (♥)

### 8.1 The Heart-door contract

Every Heart RoomDef must pass these rules. `HeartDoorValidator` checks the data side.

| # | Rule |
|---|---|
| **H1** | **Announced.** ♥ on the plaque, a rule of 14 words or fewer that names the temptation, and an entry System line. |
| **H2** | **The co-op answer pays best.** Every Heart door's co-op answer *is* its hidden clear: ×2 fireflies, the Hidden-clear stamp and +5 RP (04). Betrayal is quicker and surer, but smaller. |
| **H3** | **A betrayal event exists only when value moves:** fireflies are taken, or a frog is left to the hazard by another frog's action within 2.0 s. Anything else is mischief. |
| **H4** | **No Team Life** is spent in a Heart door [AMEND; see Open questions]. A failed Heart door still pays 50% and no Boon (FO §3.7). |
| **H5** | **Only unbanked fireflies move** (§10). |
| **H6** | **Every betrayal event** gets a Cam at the exit (§9), a WANTED poster for one door, and a Vengeance quest for the victim (§11). |
| **H7** | **Rivals** obey the full tell and the Drama Director's limits (§22). |
| **H8** | **Timing** is a rule door's: 45–90 s, hard cap 150 s (05). The Boon pick after a Heart door comes from the **Risk** family (FO §3.4). |

**Betrayal events are host records:**

```csharp
public readonly struct BetrayalEvent {
    public readonly BetrayalKind Kind;   // Push, Cut, Swallow, MimicTag
    public readonly SeatId Traitor, Victim;
    public readonly DoorId Door;
    public readonly double HostTime;
    public readonly int Taken;           // unbanked fireflies moved to escrow; may be 0 for a left-behind push
}
```

### 8.2 `heart_two_pads`: Two Pads, Three Frogs [MUST-B]

- **Where:** door 11 in climb 1; the ♥ pool after that.
- **Plaque rule:** "Only two may leave by the pads."
- **Verbs:** `[Shove]` in climb 1; `[Shove, Yank]` in seeded climbs.

**Social skeleton** (05 owns the geometry and timers):
- Two lily pads wait at the exit pool.
- A pad leaves **5.0 s** after its first rider lands, carrying everything stacked on it.
- Stacks hold up to **4 frogs** (`StackPad`).
- Frogs left behind take the long way, a pike-guarded swim (05) that usually costs a spot, and rejoin at the next door.

| Path | What happens |
|---|---|
| **Obvious clear** | Two frogs ride, and everyone else swims. |
| **Temptation** | Shove (or yank) a frog off a pad or stack in its last 5.0 s, and ride in its place. |
| **Betrayal event** | A frog is knocked off a pad or stack by another frog's contact in the final 5.0 s and is not back on at departure. **Stake:** 50% of the victim's unbanked fireflies fly straight into the pusher's crimson cheeks (auto-gulp, so there is no catching race). |
| **Co-op answer** (hidden clear) | Everyone leaves by the pads, stacked. The rule says *pads*, not *frogs*. |

- **Rival window:** from 5.0 s to 1.0 s before each departure, for Rivals on or beside that pad.
- **Climb-1 beat:** DD-11, Vex shoves Moss (§22.4).
- **System lines:**
  - entry: `[ HEART DOOR ] Only two may leave by the pads. Betrayal is allowed in here. So is not doing it.`
  - hidden clear: `[ HIDDEN CLEAR ] Everyone left by the pads. The Tower counted pads. You counted frogs.`

### 8.3 `heart_split_swallow`: Split or Swallow [MUST-B]

- **Where:** the climb-2 ♥ pool. DEC slip order #2.
- **Plaque rule:** "Share the jar or swallow it. Your partner chooses too."

**Pairing**
- Knot partners pair first.
- Everyone else pairs by walking into a booth: the first two frogs in a booth are a pair.
- A frog still alone in a booth after 8 s pairs with the Tower's stone frog, which always shares.
- **Public lobbies:** a human–human pair has swallow locked, shown by a lock icon on the jar.

**The booth**
- The two frogs face each other across one jar, so each can read the other's face.
- **Jar value J = 2 × (8 + d)** fireflies, where d is the door number within the climb (greybox).
- **Choice window:** 6 s after both frogs are in the booth.
  - **Croak = share. Tongue the jar = swallow.**
  - The last input counts. No input means share.
  - Both choices stay hidden until the curtains lift together.

| Outcome | Pays | System |
|---|---|---|
| Share + share | Each gets J/2 × 1.5 | `[ SHARED ] Both of you shared. The Tower adds a bonus. It's almost touching.` |
| **Duet:** both croak within 0.3 s | Each gets J/2 × 2, plus the hidden-clear stamp (the co-op answer) | `[ DUET ] Two frogs, one note. The jar doubled out of embarrassment.` |
| Swallow + share | The swallower gets J (escrow). The sharer gets 0. **Betrayal event.** | `[ SWALLOWED ] {traitor} swallowed the jar. {victim} brought a croak to a jar fight.` |
| Swallow + swallow | The jar shatters. Both get 0. A clown honk, with no Cam and no Vengeance. | `[ DOUBLE SWALLOW ] Nobody gets the jar. *honk*` |

**Rivals** decide with the betrayal model (§21; room weight 0.20) when the window opens. A Rival that will swallow plays the full tell while facing its partner, so a sharp human can read it and swallow first.

### 8.4 `heart_tied_bridge`: Tongue-Tied Bridge [MUST-B]

- **Where:** the climb-2 ♥ pool, for Knotted pairs. DEC slip order #1.
- **Plaque rule:** "Pairs cross tied together. The bridge sinks under two."
- **Verbs:** `[Cut, Shove, Yank]`.

**Pairs**
- Knot partners stay paired.
- The Tower tongue-ties everyone else in twos at the entrance, by proximity.
- An odd frog is tied to a floating stone frog, which never Cuts.
- **In this room only**, a room tie counts as a Knot for the Cut input. The ties in `sp_tongue_tether` can never be Cut.

| Path | What happens |
|---|---|
| **Obvious clear** | Hop across in step (`Tether` sync within 0.25 s) before the bridge sinks (05's numbers). |
| **Temptation: the Cut** | The tie snaps at the partner's end. The cutter hops free and fast. The partner is left mid-bridge to sink (the pike takes 1 spot). The cutter takes **all** of the partner's unbanked fireflies. |
| **Co-op answer: the Sling** (hidden clear) | One frog braces on a post and tongue-launches its partner across: hold Tongue on the partner 0.6 s, then Hop, for a 12 m launch (the Frog Sling Duo's motion, lent to everyone in this room). The far frog then grapples the post-frog across (Tongue II grapple, anchored on the partner). Both cross without touching the sunken section. |

- **Rival window:** when the bridge has sunk below 50% of its float height and the Rival is tied to a frog behind it.
- **System entry line:** `[ HEART DOOR ] Tied in pairs. The bridge holds one of you. The Tower is curious which.`

### 8.5 `doppelfrog`: Doppelfrog [MUST-B]

- **Where:** door 14 in climb 1; the ♥ pool after that. It is never slipped (DEC §7).
- **Plaque rule:** "One of you is not a frog."
- **What it delivers:** the user's Mafia / Among Us wish, in every first climb (DEC §8.2 #12).

**Two variants**

| | **Human Mimic** | **Spot the Mimic** |
|---|---|---|
| **Runs when** | Friends, Private or LAN; Human betrayal is On; **at least 3 humans** in the room | Every other case: solo, 1–2 humans, Public, or the toggle Off |
| **Who is the Mimic** | One human, drawn uniformly from the host-only salt. Never the same human twice in a row in one session. | One Rival seat, picked by the Director (Maud in climb 1) |
| **Who votes** | Every seat, humans and Rivals. **At least 5 voters.** | **Humans only** |
| **What Rivals do** | Vote only on public evidence they perceived. Their vote chips carry a bot badge. | Never vote. They only **point** at public evidence. |

**The Mimic's kit**
- **Role reveal**, sent only to its owner: `[ YOU ARE NOT A FROG ] Tag frogs. Don't get voted out. You blink sideways. You can't help it.`
- **The side-blink:** every 5 ± 1 s, the Mimic's eyelids close sideways for 0.15 s. It reads within 8 m. It is automatic and can't be suppressed.
- **The tag:** hold Tongue on a frog within tongue range for 0.6 s. That is the yank input, but with no pull.
  - It takes 50% of the victim's unbanked fireflies (at least 3, if the victim holds 3 or more) into the Mimic's crimson cheeks.
  - Cooldown 12 s; at most 4 tags per room; never the same frog twice.
  - The victim sees a crimson splash at its screen edge and is **not told who** did it.
- **A Rival Mimic** plays the full tell before each tag, and tags only when no frog other than the target faces it within 8 m. So it is sneaky, but still readable.
  - Its tags count against the Director's budget (§22.3): **at most 2 tags per room, and at most 1 on each human** (L1, L5). A human Mimic keeps the full 4.
  - However many tags land, the exit Cam shows **one** Mimic clip.
- The room's task (05) is the same for every frog, the Mimic included.
- In Doppelfrog **only the Mimic can take value.** Other frogs' pushes stay under mischief caps, so the deduction stays clean.

**Rival evidence.** Rivals read replicated public state only (`BotPerception`; test T-SOC-06):

| Seen | Evidence |
|---|---|
| A side-blink (within 8 m, in line of sight, facing within 60°) | +1 |
| A tag (within 12 m, in line of sight) | +3 |
| A human pinging a frog with "Liar!" | +0 (a claim is not evidence) |

A Rival points or votes at a frog once its evidence on that frog reaches **3 or more**. Below that it skips.

**The vote**
- **Where:** an arc of 8 **vote pads** at the exit, each with a floating portrait of one seat (Seat Hue ring and name), plus a grey skip pad.
- **When:** a 15 s window opens when the room task completes, or at 90 s, whichever comes first.
- **How:** your vote is the pad you stand on when the window closes. You may switch. Standing is public, as in Among Us.
- **Who:**
  - Dark frogs don't vote.
  - Human Mimic variant: if fewer than 5 living voters remain, every tadpole ghost is revived with 1 spot to vote: `[ QUORUM ] The dark may vote. Just this once.`
  - Spot the Mimic: Rivals stand *beside* the pad of the frog they point at and bark (§23 B20). Only human pads count.
- **Tally:** a seat with **more than 50% of non-skip votes** is jarred. A comic jar drops over it, and it leaves by the next door's jar 3 s after everyone else. A tie, or no majority, jars nobody.

**Outcomes**

| Result | Pays | System |
|---|---|---|
| **Mimic jarred** | Every tag's fireflies fly home at once. Every non-Mimic frog gets hidden-clear pay (the co-op answer). | `[ MIMIC CAUGHT ] It was {name}. It always blinks sideways.` |
| Wrong frog jarred | Normal clear pay. The Mimic keeps its escrow, and each tagged frog gets a Vengeance quest on the Mimic. | `[ WRONG FROG ] {name} was a frog. The Mimic thanks you.` |
| Nobody jarred | As above | `[ NO VERDICT ] Nobody was jarred. Somebody is relieved.` |

- **The reveal always lands:** whatever the vote, the exit Cam replays the Mimic's best-witnessed tag (or else its first) and captions it `It was {name}.`
- **Honest Rivals point with "I saw…" lines only.** A Rival Mimic may accuse without evidence, but never with "I saw". This is a speech tell that players can learn (§23 B20).
- **A hard-cap failure** follows H4.

---

## 9. The reveal: Betrayal Cam and the WANTED poster

### 9.1 Betrayal Cam [MUST-B]

- **Trigger:** every betrayal event (H3) and every breakup Cut.
- **Capture:** at the event, each client marks its `ReplayBuffer` window **[t − 0.6 s, t + 0.2 s]** (0.8 s, DEC glossary #15). The window covers the traitor, the victim and every frog within 6 m.
- **When it plays:** at the **room exit**, as the party passes through the exit door, so it never interrupts play. The other half of a fork sees it at the Meeting Door.

**The sequence, 4.4 s:**

| t (s) | Beat |
|---|---|
| 0.0–0.3 | Letterbox in to 2.39:1 |
| 0.3–3.5 | The 0.8 s capture at **25% speed** (3.2 s) |
| 2.7 | At the betrayal moment: **`[ TRAITOR ]`** slams in betrayal crimson with a bell-croak sting, and the traitor's **Betrayal Snap** cosmetic (08 slot 8) plays |
| 3.5–4.1 | The WANTED poster prints onto the traitor |
| 4.1–4.4 | Letterbox out |

**Camera**
- A Cinemachine 3 target group: traitor weight 1.0, victim 1.0, radius 1.2 m.
- Elevation 35°, distance 7 m, FOV 40, a slow 0.5 m dolly-in.
- The world desaturates 40% except the two frogs. The traitor's rim goes crimson; the victim keeps its Seat Hue rim.

**Variants**
- **Breakup Cut:** the stinger is `[ IT'S OVER ]` in the cutter's Seat Hue, with a sad violin-croak. No poster.
- **Split or Swallow:** the clip is the curtains lifting and the gulp.
- **Doppelfrog:** the Mimic's tag, captioned `It was {name}.`

**Limits**
- One Cam sequence per door, holding at most 2 clips (a first human victim's clip goes first).
- A third event in the same door still gets its poster and Vengeance, but no clip.
- The Cam is that door's one full-screen moment (DEC §5).
- **Skip:** once a profile has watched 3 Cams, holding Hop for 0.5 s skips (local only).

### 9.2 WANTED poster [MUST-B]

- **Form:** a 0.5 × 0.7 m cartoon billboard, 0.9 m above the traitor's name tag, always facing the camera.
- **Visibility:** everyone within 40 m, and through walls inside the same room.
- **Look:** parchment `#F2E3C2`, ink `#3A2A1A` and a crimson stamp. It shows the traitor's face (captured to a RenderTexture during the Cam), the header "WANTED", "for {crime}" and the footer "Reward: 1 honk".
- **Crimes** (string table `Wanted`):
  - `wanted.push` "pad theft";
  - `wanted.cut` "knot cutting";
  - `wanted.swallow` "jar swallowing";
  - `wanted.mimic` "not being a frog".
- **Lasts** until the next door clears or fails.
- **Framing, not shame** (the Vigilante lesson; RR, games_coop_social): no stat, no title, no carry-over, no Register tally. It never appears on the results screen.

---

## 10. Contained costs

### 10.1 What betrayal can and can't touch [MUST-B]

- **Can move:** only the victim's **unbanked** fireflies from the current room, and only through the Heart verbs.
- **Can cause:** a frog left to the room's hazard can lose a spot. Every Landing restores spots for free.
- **Can never touch:**
  - banked fireflies, Glow Level or verb ranks;
  - Boons (the Duo break in §7.1 is the only exception);
  - Team Lives (H4);
  - Wish Coins, Pearls, Tower Rank, the Bestiary, classes or cosmetics;
  - the Rival Register.

### 10.2 Escrow: "crimson cheeks" [MUST-B]

- **Where taken fireflies go:** into the traitor's cheeks, which bulge and glow crimson so everyone can see the loot.
- **They don't bank** at the Heart door's clear and don't count toward the traitor's Glow Level.
- **They bank for the traitor** only when the Vengeance chance ends unclaimed (§11.4).
- **If the traitor is hit,** the spill comes out of escrow first, and escrow spills always fly back to the victim.

**Build**
- `Escrow { traitor, victim, amount, door }` lists live on the host.
- `BankedFireflies` has a setter internal to the growth code, and only `DoorClearService` writes it.
- `BetrayalService` can write only `Unbanked` and `Escrow`.
- This is enforced by assembly boundaries and test T-FAIR-03.

---

## 11. The victim: the ghost and a guaranteed Vengeance

### 11.1 The victim stays in play [MUST-B]

If a betrayal leaves the victim Dark, they become a **tadpole ghost** (02):
- they can nudge props of 5 kg or less every 10 s, ping and watch, as an Among Us ghost does;
- their pings are shown to the living;
- they are revived by a 2 s croak hold (1 s by a Knot partner), and every Landing revives them for free.

### 11.2 The quest is guaranteed [MUST-B]

The moment the host logs a betrayal event, the victim gets a **banner**, not a full-screen card:

`[ VENGEANCE ] Tongue-tag {traitor} in the next room.`

Every betrayal event issues one, bot-on-bot events included. Rival victims run their quest themselves (§22).

### 11.3 The Vengeance room

**Which room:** the first room after the Heart door that holds both frogs. That can be a door, a fork room, the Meeting room or a Landing (DEC §8.2 #6).

**Helps for the hunter**
- The traitor is outlined in betrayal crimson through walls, for the victim only.
- The traitor sees a small "hunted" icon over its own spots. That is fair warning.

**The tag**
- Any Tongue lash that touches the traitor's hurtbox, at the victim's own tongue range. It moves nobody.
- **A ghost victim** swims through the traitor for 0.5 s instead, so going Dark never blocks revenge.
- It becomes a touch tag if tongue-on-player is cut (§7.3).

### 11.4 Outcomes

| Outcome | Result |
|---|---|
| **Landed** | The host moves the escrow back into the victim's unbanked cheeks; it banks at this room's clear. The traitor is **slimed**: a cosmetic green goo `#8BE04E` decal that oozes for the rest of the room, with no gameplay effect. The victim gets **+1 card on their next Boon pick, once per climb** (FO §5.2). The featured Timeline marker fires, and Rivals bark B17. System: `[ VENGEANCE LANDED ] {n} fireflies returned. {traitor} is slimed. Justice is sticky.` |
| **Expired** (the room ends with no tag) | The escrow banks to the traitor at this room's clear. System: `[ VENGEANCE EXPIRED ] {traitor} got away with it. This time.` |
| **The traitor disconnects** | The escrow returns to the victim at the next door clear. |
| **The victim disconnects** | The Rival that takes the seat inherits the quest. |
| **Several quests on one traitor** | All run at once, and each returns only its own amount. |

### 11.5 Anti-farm

Vengeance returns **exactly what was taken**, plus the once-per-climb +1 card. It pays no fireflies, Pearls or RP bonus. A fake betrayal between friends nets zero (FO §5.2; *goguma* is paid off by *saida* within one room).

### 11.6 Rival traitors and victims

- **A Rival traitor** keeps running its room plan.
  - A **Rookie** Rival traitor stops and waits for the tag: "Fine. Get it over with."
  - A non-Rookie Rival traitor may make **one** dodge hop per Vengeance room, and never more.
- **A Rival victim** hunts its traitor when the Director allows it (§22), barking B17 when the tag lands.

---

## 12. Anti-griefing guard rails and the fairness contract

### 12.1 Guard rails (all lobby types unless marked)

| # | Guard rail | Numbers | Tag |
|---|---|---|---|
| G1 | Real betrayal lives only in Heart doors | Checked by T-SOC-01 | MUST-B |
| G2 | Human → human betrayal only in Friends, Private or LAN, and only with the host toggle on; never in Public | `CanBetray` (§2) | MUST-B |
| G3 | Mischief moves no value | §3.2 | MUST-A |
| G4 | Ledge guard on tug, shove and the partner yank outside ♥ | 0.4 m tug margin; 1.5 m shove margin (§3.3) | MUST-A |
| G5 | Mischief spam throttle | 3 per target per 5 s (§3.4) | MUST-A |
| G6 | Knocked-out spots always return to their owner; spilled fireflies return to their owner outside ♥ | FO §3.7, §4.1 | MUST-A |
| G7 | Ghosts can't grief puzzles. Nudges are ≤ 5 kg every 10 s (02), and ghosts can't nudge anything tagged `key`, `egg`, `carried`, `bell`, `vote` or `rulekey` in a RoomDef | Tag list validated per room | MUST-A |
| G8 | Contained costs: only unbanked fireflies move; no Team Life in ♥ (H4); E doors never cost lives (FO §3.7) | §10 | MUST-B |
| G9 | No farming: Vengeance returns only what was taken; death rewards are first-time-only (04; FO §4.4) | §11.5 | MUST-B |
| G10 | Betrayals are never counted anywhere lasting or public: no results stat, title, Register tally, leaderboard or Steam stat (DEC §8.3) | T-SOC-07 | MUST-A |
| G11 | The WANTED poster lasts one door and never persists | §9.2 | MUST-B |
| G12 | Knot throttles: one pending request per frog; a decline blocks re-asking until the next Landing; no re-Knot after a Cut until the next Landing; Cut cooldown 8 s after a hold-on | §6, §7.1 | MUST-B |
| G13 | **Away:** after 60 s with no input the seat shows `[ AWAY ]`. A Rival brain drives the frog: it helps, and never betrays or Knots. The seat is left out of walk votes and Doppelfrog votes. Any input returns control at once. In Public, after 5 min Away, the seat passes to a Rival at the next door. | 60 s / 5 min | MUST-A (Public part SHOULD) |
| G14 | **Stragglers:** 15 s after a door opens, any frog still outside is carried through by a gust (`[ STRAGGLER ]`), so one player can't hold the party hostage | 15 s | MUST-A |
| G15 | **Doorways can't be blocked.** Only humans count in the walk vote, and a tie goes to the first human's door (FO §3.3). Frogs overlapping in a door frame soft-push apart at 0.5 m/s. Rivals path around frogs in doorways. | — | MUST-A |
| G16 | **Kick to a Rival:** by the host (Friends/Private) or by 2 human flags (Public). A kicked player can't rejoin that lobby for the rest of the climb. | 2 flags | MUST-A host · SHOULD flags |
| G17 | No free text, ever. The Wheel only. Voice is LATER, friends-only and opt-in. | FO §5.1 | MUST-A |
| G18 | Streamer-safe toggle | DEC §7 SHOULD #2 | SHOULD |
| G19 | Blame tags are off in Public, can be switched off locally, and are never summed | §5.1 | MUST-A |
| G20 | **Server-authoritative betrayal.** Clients send intents. The host validates the Knot, the Heart flag, `CanBetray`, range, cooldowns and channel time. Hidden roles and offers travel by owner-only RPC. | FO §5.4 #5, #7 | MUST-A (framework) |
| G21 | Rivals obey every cap humans do | FO §5.4 #8 | MUST-A |
| G22 | Mercy rule: no Rival betrays a human who is on 1 spot during floors 1–2 | §22.3 | MUST-B |
| G23 | Masked Rivals are never allowed in Public | §2 | SHOULD |
| G24 | Winning as the Mimic pays only room loot; no persistent reward | §8.5 | MUST-B |
| G25 | Any Signature or Boon effect that reaches another frog obeys the tug cap | FO §4.2, §5.4 #2 | MUST-A |

### 12.2 The fairness contract (law; FO §5.4, restated with the tests that enforce it)

| # | Clause | Enforced by |
|---|---|---|
| F1 | Hitbox, base speed, shove impulse (6 m/s) and spots are identical for every frog, whatever its level, rank, class or cosmetics | **T-FAIR-01:** a reflection scan fails the build if any BoonDef, TalentDef, ClassDef or CosmeticDef field targets `Hitbox`, `BaseSpeed`, `ShoveImpulse` or `SpotCount` |
| F2 | Anything that reaches another frog has a fixed ceiling: tug ≤ 1 m, ledge-guarded outside ♥; the full yank only in ♥ or on your Knot partner, after a 0.6 s tell; Signatures under the same caps | **T-FAIR-02:** PlayMode, 1,000 random tugs, shoves and Signatures outside ♥ in `test_ledge_room`. Every displacement is ≤ 1.0 m and every end point is on the NavMesh, at least 0.4 m from a `HazardEdge`. |
| F3 | Betrayal moves only unbanked room loot | **T-FAIR-03:** only `DoorClearService` writes `BankedFireflies`. **T-SOC-02:** a property test shows unbanked + escrow + banked is conserved across every betrayal and Vengeance path. |
| F4 | Talents are PvE-only and small; Rank Sync is on by default in Public; Rank never gates a mode | 04's tests |
| F5 | Hidden information goes only to its owner | **T-FAIR-05:** no `NetworkVariable` holds an offer, quest or Mimic role; those RPCs are single-target; **T-SOC-06:** `BotPerception` can't read `HiddenRole` |
| F6 | The host gets no latency edge: tongue hits are rewound by RTT/2 (≤ 150 ms); simultaneous grabs go to the earliest input timestamp | 10's tests |
| F7 | Betrayal actions are server-authoritative from day one | **T-FAIR-07:** client assemblies can't reference `BetrayalService` internals |
| F8 | Rivals use the same tables and caps as humans | **T-FAIR-08:** `RivalBrain` reads the one `BoonTable` and `VerbRankTable` instance |

---

## 13. The Wheel: pings, quick lines, emotes

[MUST-A] Holding **Wheel** (Q / LB; the binding is in 02) opens a radial menu. Release it on a target to ping, or flick to a slice.

**Pings.** A ping lasts 3 s, with at most one ping per 1.5 s per player. Its colour depends on the target:
- a monster: red;
- a key or prop: the pinger's Seat Hue;
- a door: gold;
- a frog: that frog's Seat Hue;
- a place: white.

Tadpole ghosts can ping, and the living see it.

**Eight quick lines.** Each is spoken as croak-babble in the speaker's Croak voice, with a text bubble (string table `Wheel`).

| # | Line | What Rivals do when they hear it |
|---|---|---|
| 1 | "Go!" | Every Rival in the room skips to **Execute** (§18) and moves toward the pinged target, if there is one |
| 2 | "Wait." | Rivals within 15 m hold position for 5 s |
| 3 | "Help!" | The nearest helper Rival (§16) comes to the speaker; that Rival switches to Execute |
| 4 | "Thanks!" | +2 Trust toward the speaker (at most once per door); sometimes a B10 reply |
| 5 | "Sorry!" | +2 Trust toward the speaker, if the speaker blamed that Rival in the last 10 s |
| 6 | "Knot?" | Landings only: asks the reticle target or opens the portrait ring (§6). While Knotted, it means untie. |
| 7 | "Trust me." | Nothing mechanical. Maud answers "Oh, sweetie." |
| 8 | "Liar!" | With a frog pinged: a crimson "?" over that frog for 3 s. A public claim. Rivals log it but give it **no evidence weight** (§8.5). |

**Emotes.** The 4 equipped emotes (08's Emote slot) sit on an inner ring.

---

## 14. The System: the Tower's voice

### 14.1 Voice rules [MUST-A]

The System is a **dry, sarcastic announcer that hypes your growth and roasts your mistakes**. It replaces the GDD's bureaucratic examiner (FO §2.3, §6.2 #4; DCC's host via RR).

| Rule | Detail |
|---|---|
| **Form** | One `[ BRACKETED CAPS ]` header plus at most one sentence of 90 characters or fewer. Never a stat sheet. |
| **Growth lines name the change and its cause** | "Because: …" |
| **The System never lies** (FO §2.2) | Every number is rendered from a data key. The build fails on an unbound number, or a `%` without a key (FO §8.6). It never states odds that aren't the real odds: the seeded climb-1 gold door gets no odds line. |
| **It roasts events, never people** | No insults about skill, looks or identity. No real friend's name in a teaser (FO §4.4 #8). |
| **Betrayal is framed, not shamed** | Lines about a traitor last one door. It never counts betrayals. |
| **No advice beyond the rule text** | Except the Bestiary death tip and the rank-A hint talent (04). |
| **Address** | "frog", or the player's name |
| **Redaction** | Hell always and Sealed on request: rule text becomes `█` blocks with a 0.8 Hz shimmer |

### 14.2 Delivery [MUST-A]

- **Window:** top-centre (09 owns the look).
- **Typing:** 35 characters per second, with one glass-bell chime per character, pitch quantised to the pentatonic scale (GDD §15.3, re-homed to AudioMixer by 09).
- **Lifetime:** 3.0 s + 40 ms per character after typing ends (greybox).
- **Priority:**

  | Level | Lines |
  |---|---|
  | P0 | Rules and safety: `CLEAR`, `HEART DOOR`, `FAILED`, `DARK`, `VOTE`, lives |
  | P1 | Growth: `GLOW`, verb ranks, `BOON`, `AWAKENING`, `NOTED`, `CLEARED` |
  | P2 | Social: Knot, Vengeance, `WANTED`, spots |
  | P3 | Flavour |

- **Queue:** at most 3 windows waiting. A P3 line is dropped when 2 or more are queued, and a P0 line cuts off any showing P3.
- **Monster cues:** nothing below P0 appears during a cue window (2–5 s), so text never covers a tell.
- **History:** the pause menu shows the last 10 lines.
- **Variants:** where a situation has several lines, the last 2 used are never repeated.
- **Strings:** the `System` string table, keys `sys.<situation>.<name>`, Smart-String `{keys}`. Every number in the samples below is stored as a key, for example `{revive_s}` or `{lives}`.

### 14.3 Sample lines by situation (54)

A = [MUST-A], B = [MUST-B]. Lines quoted from FO or DEC are marked (FO) or (DEC).

**Hatch, hub and doors**

| # | Key | Trigger | Line | Tag |
|---|---|---|---|---|
| 1 | `sys.hatch` | Hatching | `[ HATCHED ] Level 1. Everything is bigger than you.` (FO) | A |
| 2 | `sys.door.first` | `DOOR 1` slams | `[ DOOR 1 ] 19 to go. The Tower is counting. So should you.` | A |
| 3 | `sys.difficulty.locked` | Touching the chained Hard door | `[ LOCKED ] Hard opens when anyone in this lobby clears a Keeper.` | A |
| 4 | `sys.difficulty.hell` | Entering Hell | `[ HELL ] Every rule is redacted. The Tower assumes you read minds.` | B |
| 5 | `sys.rookie` | Climb 1 starts with Rivals | `[ ROOKIE RIVALS ] They're new here too. It shows.` | A |
| 6 | `sys.straggler` | G14 | `[ STRAGGLER ] The Tower does not wait. It carries.` | A |

**Growth**

| # | Key | Trigger | Line | Tag |
|---|---|---|---|---|
| 7 | `sys.glow` | Level-up | `[ GLOW 3 → 4 ] Your belly is now visible from space. Nearly.` | A |
| 8 | `sys.rank.verb` | Verb rank II or IV | `[ TONGUE II ] 4.5 m. Grapple unlocked. Because: you grabbed 14 things.` (FO) | A |
| 9 | `sys.awakening` | Verb rank III | `[ HOP III: AWAKENING ] Air Hop. Because: you jumped 61 times, some on purpose.` | A |
| 10 | `sys.boon.grant` | A Boon auto-granted | `[ BOON ] Shatter Croak. Because: you froze while it looked.` (FO) | A |
| 11 | `sys.boon.upgrade` | A duplicate Boon | `[ BOON II ] Spring Legs. Same Boon, twice the bounce.` | B |
| 12 | `sys.choice` | The Keeper's first pick | `[ CHOICE UNLOCKED ] The Tower will let you choose now.` (FO) | A |
| 13 | `sys.crown` | Glow Level 10 | `[ CROWN GLOW ] Level 10. The fireflies orbit you out of respect.` | B |
| 14 | `sys.underdog` | Comeback 4th card | `[ UNDERDOG ] The Tower loves a comeback.` (FO) | B |
| 15 | `sys.bigclear` | A 3-skull clear by a human at rank C or below | `[ THREE SKULLS ] Cleared by an E-rank. The Tower is recalculating.` | A |

**Rule doors**

| # | Key | Trigger | Line | Tag |
|---|---|---|---|---|
| 16 | `sys.rule` | Entering a rule door | `[ CLEAR ] Ring 3 bells. When its eyes glow, freeze.` (FO; the template is `[ CLEAR ] {rule}`) | A |
| 17 | `sys.sealed` | Sealed opt-in | `[ SEALED ] Rule redacted. Fireflies +50%. You asked for this.` | B |
| 18 | `sys.cleared` | A clear | `[ CLEARED ] 3C in 1:04. The raft would like a word.` | A |
| 19 | `sys.hidden` | Hidden clear | `[ HIDDEN CLEAR ] The other way out. Fireflies ×2. The Tower pretends to be surprised.` | A |
| 20 | `sys.noted` | Any unintended clear | `[ NOTED ] That was not the intended solution. Keep it.` (DEC §8.2 #25) | A |
| 21 | `sys.rematch` | Rematch clear | `[ OLD TIME 1:12 → 0:18 ]` (FO) | B |
| 22 | `sys.gold` | Gold door | `[ GOLD DOOR ] Jackpot. Gulp responsibly.` | A |
| 23 | `sys.teaser` | Results teaser | `Something is waiting in 12E.` (FO) | A |

**Hits, Dark and failure**

| # | Key | Trigger | Line | Tag |
|---|---|---|---|---|
| 24 | `sys.spot` | A spot knocked out | `[ SPOT LOST ] 2 left. It's glowing on the floor. Somebody catch it.` | A |
| 25 | `sys.caught` | A mid-air catch | `[ CAUGHT ] Moss returned your spot. Mid-air. Show-off.` | A |
| 26 | `sys.dark` | Going Dark | `[ DARK ] Pip met the Bell-Golem up close. Croak over the egg for 2 s.` | A |
| 27 | `sys.revived` | A revive | `[ REVIVED ] Pip is back with 1 spot. Try to keep this one.` | A |
| 28 | `sys.failed` | Rule door failed (Easy drops the life clause) | `[ FAILED ] 7C. Half pay, no Boon, 1 Team Life. The Tower moves you along.` | A |
| 29 | `sys.failed.heart` | Heart door failed | `[ FAILED ] 11. Half pay, no Boon. Heart doors keep your lives.` | B |
| 30 | `sys.lives.last` | 1 Team Life left | `[ TEAM LIVES: 1 ] Choose your next mistake carefully.` | A |
| 31 | `sys.wipe` | Climb over | `[ CLIMB OVER ] Door 8. Everything you learned is banked.` | A |

**Forks and the Meeting Door**

| # | Key | Trigger | Line | Tag |
|---|---|---|---|---|
| 32 | `sys.fork` | A fork appears | `[ FORK ] The party may split. Two locks, one door. Bring each other's keys.` | B |
| 33 | `sys.rope` | The rescue rope at 45 s | `[ ROPE ] The other half is taking a while. Here is a rope.` | B |
| 34 | `sys.withhelp` | Cleared with help | `[ CLEARED WITH HELP ] The Boon stays. The dignity is negotiable.` | B |
| 35 | `sys.offstage` | Offstage Rivals arrive | `[ MEETING DOOR ] Lumen took the other door. Lumen brought the key.` | B |

**Heart doors, Knots and betrayal**

| # | Key | Trigger | Line | Tag |
|---|---|---|---|---|
| 36 | `sys.heart` | Entering a Heart door | `[ HEART DOOR ] Betrayal is allowed in here. So is not doing it.` | B |
| 37 | `sys.knot.unlock` | Landing 3, climb 1 | `[ KNOT ] Landings allow Knots now. Choose your frog carefully.` | B |
| 38 | `sys.knot` | A Knot is tied | `[ KNOT TIED ] Moss and you. You see each other through walls now. Be normal about it.` | B |
| 39 | `sys.heldon` | Hold-on succeeds | `[ HELD ON ] Moss held on. Vex is stunned and slightly embarrassed.` | B |
| 40 | `sys.breakup` | Breakup Cut | `[ IT'S OVER ] Kestrel and you are no longer Knotted. The Duo took it hardest.` | B |
| 41 | `sys.traitor` | Cam stinger | `[ TRAITOR ]` | B |
| 42 | `sys.wanted` | Poster printed | `[ WANTED ] Vex. Reward: one honk. Expires at the next door.` | B |
| 43 | `sys.vengeance` | Quest issued | `[ VENGEANCE ] Tongue-tag Vex in the next room.` (FO) | B |
| 44 | `sys.vengeance.landed` | Tag lands | `[ VENGEANCE LANDED ] 14 fireflies returned. Vex is slimed. Justice is sticky.` | B |
| 45 | `sys.vengeance.expired` | No tag | `[ VENGEANCE EXPIRED ] Vex got away with it. This time.` | B |
| 46 | `sys.mimic.role` | Owner-only | `[ YOU ARE NOT A FROG ] Tag frogs. Don't get voted out. You blink sideways.` | B |
| 47 | `sys.vote` | Vote opens | `[ VOTE ] 15 s. Stand on a pad. Standing is voting.` | B |
| 48 | `sys.mimic.caught` | Mimic jarred | `[ MIMIC CAUGHT ] It was Maud. It always blinks sideways.` | B |

**Keeper, Landings, meta and session**

| # | Key | Trigger | Line | Tag |
|---|---|---|---|---|
| 49 | `sys.partyrank` | Keeper or Warden | `[ PARTY RANK UP ] Everyone gets a reroll. The Tower refuses to pick favourites.` | A |
| 50 | `sys.towerrank` | Rank up | `[ RANK E ] Up from F. The Tower has noticed you exist.` (later ranks: D "is taking notes", C "has started to worry", B "has cleared its schedule", A "is nervous", S "saw you leave") | A |
| 51 | `sys.quest` | Secret quest, owner-only banner | `[ HIDDEN CONDITION DETECTED ]` (FO) | B |
| 52 | `sys.away` | G13 | `[ AWAY ] Pip's frog is on autopilot. It's doing its best.` | A |
| 53 | `sys.break` | 90 min of play | `[ THE TOWER WILL WAIT ] Your door is saved.` (FO) | A |
| 54 | `sys.star1` | ★1 (01 times it) | `[ WELCOME, FROG ] That was the tutorial.` (WORLD's line, re-homed) | B |

The Heart-door lines in §8 (`SHARED`, `DUET`, `SWALLOWED`, `DOUBLE SWALLOW`, `QUORUM`, `WRONG FROG`, `NO VERDICT`, `HIDDEN CLEAR` for Two Pads) belong to the same table. 05 adds each room's enter, clear and fail lines in this voice.

---

## 15. The audience layer [LATER, capped prototype]

DEC §7 keeps "the Watchers audience layer" as LATER. RR rank 8 and FO §7 frame it as a **capped prototype from layer 2**. It is not in the slice. It is specified here so that nothing in the slice blocks it.

- **Reveal.** It switches on in **the Sky** (doors 21+), never in the Well. It is revealed by ★1, where the painted stars turn out to be lanterns held over your well (01 owns that choreography). This copies Dungeon Crawler Carl's floor-2 audience reveal (RR). There is no on-screen noun: "a lantern leaned in".
- **What earns a tip:** only room-rule events.
  - a hidden clear;
  - a knocked-out spot caught in mid-air;
  - a Trust Fall catch;
  - a Rematch cleared in under half its old time;
  - a first-attempt clear on Sealed.
- **What never earns a tip:** betrayal, Vengeance, falls, deaths, blame, emotes or votes. Drama must never pay (RR: "if drama pays, griefing pays too").
- **A tip is:** unbanked fireflies worth 10% of that door's clear bonus, rounded up.
- **Caps:** 1 per frog per door; 5 per frog per climb; 15 per lobby per climb. Rivals can earn tips under the same caps, which gives a rivalry beat ("the lantern likes Ines").
- **Presentation:** a lantern above leans in, one chime sounds and 3 fireflies drift down. P3 line: `[ A LANTERN LEANED IN ] +3 fireflies. Somebody up there liked that.`
- **Never shown:** viewer counts, follower numbers, sponsors, boxes or chat. Those would be invented numbers ("the System never lies").
- **Kill rule:** run it as an A/B against off. It ships only if "Worth it?" and clean exits don't drop and griefing reports don't rise (FO §8.5).

---

## 16. The Rivals

### 16.1 What a Rival is [MUST-A]

- **A Rival is a frog.** It is a host-owned NetworkObject on the same prefab and code path as a human frog (UT; FO §9.2).
  - A `RivalBrain` writes the same `FrogInput` struct that a human's Input System writes, into the same `FrogController`.
  - It gets no special physics, no teleports and no hidden knowledge.
  - Rivals are therefore also the automated QA: the 7-bot soak (DEC §7).
- **The rules** (FO §5.3):
  - Rivals perceive like players and react on human timing.
  - They use the same tables and caps.
  - They carry a bot badge.
  - They **never betray without the full tell, and never outside Heart doors.**
  - They **never enter a door without a human**, except when parked offstage (DEC §8.2 #11). No Rival-only room is ever simulated.
- **They are onlookers.** The growth fantasy needs witnesses, so Rivals gasp, sneer and cheer at *your* growth (FO §5.3; RR). Research caveat: no hit in the research gets its comedy from bots, so this is an A/B item (FO §9.3).

### 16.2 Four archetype families

| Family | Rivals | Job in the comedy | Betrayal threshold θ |
|---|---|---|---|
| **Helpers** | Moss, Brother Brass, Pip | Rescue, carry, catch, offer Knots. The "somebody's got you" warmth. | 1.5 (never, in practice) |
| **Schemers** | Vex, Maud, Gutter | Temptation, and the Heart-door punchline | 0.45 / 0.50 / 0.60 |
| **Showboats** | Kestrel, Ines | Slapstick, risk and speed. The laughs. | 0.90 / 0.75 |
| **Thinkers** | Pell, Lumen | Read rooms, demonstrate during Theorise (§18), take E doors | 1.00 / 0.80 |

### 16.3 The roster: the 10 Rivals as frogs

The GDD §8.2 cast is kept, with its archetypes, stats and signature lines (FO §5.3), and redrawn as frogs:
- **Species** are art references for 09, never player-facing.
- **Colours** are body-skin references, and 09 owns the final hexes. Every hue stays at least 15° from betrayal crimson (≈ 347°). Maud moves from the GDD's rose (341°, a CRIT #6 violation) to orchid.
- **Loadout items** must exist in 08's earned catalogue, so every Rival look is earnable in the Mirror (CRIT #27).
- **Stats** (0–100): **G**reed, **L**oyalty, **N**erve, **H**onesty, **W**it, **S**pite. They are bot-internal.

**Looks and personality**

| Rival | Family · archetype | Frog (art ref) | Body colour | Loadout (08 items) | Croak f0 |
|---|---|---|---|---|---|
| **Moss** | Helper · the Sherpa | Mossy frog, lichen bumps | `#9BE07A` (101°) | Moss Cap hat; Vine tongue trail | 220 Hz |
| **Brother Brass** | Helper · the Captain | Bullfrog | `#FFC45C` (39°) | Bell Cowl hat | 150 Hz |
| **Pip Fizzwick** | Helper · the Tagalong | Teal reed frog with oversized eyes | `#6FF0D6` (168°) | Party Hat; Confetti door-entrance | 420 Hz |
| **Vex Sulphur** | Schemer · the Opportunist | Yellow-banded dart frog | `#E8F24A` (64°) | Matchstick hat | 300 Hz |
| **Maud Tallow** | Schemer · the Charming Liar | Orchid painted reed frog | `#D77FE0` (294°) | Pearl String hat; Velvet croak voice | 280 Hz |
| **Gutter** | Schemer · the Grudge | Scarred cane toad | `#B5673A` (22°) | Eyepatch hat | 170 Hz |
| **Kestrel** | Showboat · the Show-off | Red-eyed tree frog | `#FF8A3D` (24°) | Feather Crest hat; Racing Stripe skin | 340 Hz |
| **Ines the Taper** | Showboat · the Speedrunner | Lanky cream tree frog | `#FFF1C9` (45°) | Sweatband hat | 320 Hz |
| **Pell** | Thinker · the Scholar | Blue dart frog | `#6AA8FF` (215°) | Round Specs hat | 260 Hz |
| **Lumen** | Thinker · the Lone Wolf | Lavender leaf frog | `#C7B6FF` (254°) | Leaf Hood hat | 240 Hz |

**Stats, door taste and lines**

| Rival | G | L | N | H | W | S | θ | Door taste | Signature lines |
|---|---|---|---|---|---|---|---|---|---|
| **Moss** | 10 | 90 | 60 | 90 | 50 | 10 | 1.5 | ♣ > ♠ > ♥ | "Got it!" · "Here." · "Nobody falls today." |
| **Brother Brass** | 15 | 95 | 75 | 85 | 55 | 5 | 1.5 | ♠ > ♥ > ♣ | "I can carry that." · "On three." · "Go. I'll hold." |
| **Pip Fizzwick** | 20 | 80 | 30 | 85 | 40 | 10 | 1.5 | Follows its highest-Trust frog | "Help!" · "Thanks!" · "I'll follow you!" |
| **Vex Sulphur** | 85 | 20 | 70 | 30 | 60 | 50 | 0.45 | ♥ > ♠ > E | "Worth it." · "Nothing personal." · "You'd have done it too." |
| **Maud Tallow** | 70 | 40 | 50 | 15 | 80 | 40 | 0.50 | ♦ > ♥ > ♠ | "Trust me." · "Would I lie?" · "Oh, sweetie." |
| **Gutter** | 50 | 20 | 70 | 40 | 50 | 85 | 0.60 | Its top grudge's door; else ♥ > ♠ > E | "Not sorry." · "Remember me?" · "You. Again." |
| **Kestrel** | 55 | 50 | 95 | 60 | 35 | 25 | 0.90 | ♠ > ♣ > E | "Watch this!" · "Nice!" · "That was on purpose." |
| **Ines the Taper** | 65 | 35 | 85 | 60 | 65 | 20 | 0.75 | ♣ > E > ♠ | "Go!" · "Keep up." · "Personal best." |
| **Pell** | 40 | 50 | 30 | 80 | 90 | 20 | 1.00 | ♦ > E > ♠ | "Interesting." · "Follow me." · "I have a theory." |
| **Lumen** | 60 | 25 | 80 | 60 | 70 | 30 | 0.80 | E > ♦ > ♣ | "Go on without me." · "I work alone." · "Fine. Together." |

**Quirks**
- Moss's GDD line "Brace!" became "Got it!", because Brace is cut and the catch is Moss's job.
- Maud accepts every Knot offer.
- Pip mirrors its highest-Trust frog's door, which is usually the human's.
- Gutter hunts grudges (§21).
- **Classes, from climb 2** (when classes become selectable, DEC §5):
  - Brother Brass starts as a **Bullfrog**, Vex as a **Dart Frog** and Kestrel as a **Tree Frog**. The three open classes are then visible on others before the player picks one.
  - Rivals can unlock secret classes at half the human rate (04).

### 16.4 Who sits in the party

**Climb 1 (authored, identical on every profile).** Rival seats fill in this order: **Kestrel, Moss, Vex, Maud, Brother Brass, Pip, Pell**. With h humans, the first 8 − h Rivals take seats. The order puts the beat carriers first (§22.5).

**Seeded climbs.** Draw 8 − h Rivals from the 10, using the climb seed:
- when there are 3 or more Rival seats, include at least 1 Helper, 1 Schemer and 1 Showboat;
- weight Gutter ×3 if the Rival Register says any human in the lobby betrayed Gutter in their last climb together (GDD §8.2);
- weight ×0.7 any Rival seated in both of the previous 2 climbs, for variety.

**Scope**
- [MUST-A] ships the climb-1 seven.
- [MUST-B] adds Lumen, Ines and Gutter (DEC §7).

### 16.5 Rookie Rivals [MUST-A]

- **The label.** For the newest human's first 5 climbs, every Rival is labelled Rookie: the name tag reads `ROOKIE MOSS`, and the badge adds a sprout icon.
  - It replaces "tuned to lose like Fall Guys", which is an **unverified rumour** (FO §5.3, §10.5).
  - The label is **always shown** while it applies.
- **The Rookie factor** is `f = min(1, max(0, (10 − c) / 5))`.
  - c is the lowest climb count among the humans in the lobby, counting the current climb. Failed climbs count.
  - So f = 1 up to climb 5, then 0.8, 0.6, 0.4, 0.2, and 0 at climb 10.
- **Scaled by f:**
  - cue reaction +0.25 f s;
  - action error rate ×(1 + 0.5 f);
  - the canonical mistake is 1.5× as likely during Explore (§18);
  - slapstick bark weight ×(1 + 0.5 f);
  - a Rookie traitor waits to be tagged for Vengeance (§11.6).

---

## 17. The Rival brain [MUST-A]

### 17.1 Loop

- `RivalBrain` runs on the host only.
- It **thinks** at 10 Hz, with each seat staggered by 10 ms.
- It **steers** every FixedUpdate.
- It **outputs** a `FrogInput`.

### 17.2 Perception (`BotPerception`)

- **Sight:**
  - a line-of-sight raycast within 25 m, with a 150° field of view;
  - in dark rule rooms, 12 m, except for **self-lit** objects (tells, plaques, frogs), which stay visible at 25 m. Self-lit tells are the point (FO §2.2).
- **Hearing:** through the NoiseBus, using 05's noise model (croaks, splashes, stomps).
- **Reads only replicated public state.** It never reads a hidden role, offer or quest (T-SOC-06).
- **Budget:** at most 8 raycasts per think per Rival.

### 17.3 Reaction time

`r = 0.60 − 0.35 × (W + N) / 200` s, plus 0.25 f for Rookies, plus N(0, 0.05) jitter.

| Rival | Base | Rookie (f = 1) |
|---|---|---|
| Kestrel | 0.37 s | 0.62 s |
| Pell | 0.39 s | 0.64 s |
| Pip | 0.48 s | 0.73 s |
| Brass | 0.37 s | 0.62 s |

### 17.4 Mistakes

**Error rate** `e = 0.05 + 0.15 × (1 − W/100)`, ×(1 + 0.5 f) for Rookies.

**Error types:**
- a missed tongue grab;
- a hop mistimed by 0.2–0.4 s;
- a dropped carry;
- a croak at the wrong moment, only where the room's `canonicalMistake` allows it.

**Personal extras:**
- **Kestrel:** +0.10 "show-off risk". He tries a lane above his rank and says "Watch this!".
- **Pip:** +0.05 tongue misses.

### 17.5 Roles

Each `RoomDef.botPlan` (05) defines **roles** as goal graphs built from kit actions: `goTo`, `hop`, `tongue(target)`, `carry`, `croak`, `hold`, `freeze`, `ping`, `say`.

| Role | Assigned to (stat fit) |
|---|---|
| Ringer | Highest Wit |
| Carrier | Highest Loyalty |
| Catcher | Helpers first |
| Lure / Bait / Volunteer | Loyalty ≥ 80 or Nerve ≥ 80 |
| Lookout | Highest Wit, except the Ringer |
| Hauler | Helpers |
| Caller | Brass if present |

- Roles are assigned at room start and refilled when a Rival goes Dark.
- **Gating (§18) filters which goals may run.**

### 17.6 Navigation

- Unity AI Navigation 2.0 NavMesh, baked per room shell (10).
- Hop **NavMeshLinks** record the Hop rank they need, and a Rival uses a link only at that rank.
- Rafts and moving platforms carry their own local NavMesh surface.

### 17.7 Helping (always on, above role goals, never gated)

| Help | Who does it |
|---|---|
| **Catch:** tongue a knocked-out spot back to its owner | Helpers always; others if their Trust toward the owner is ≥ 0 |
| **Revive:** a Dark frog within 15 m, not in immediate danger, with a 2 s croak hold | Helpers always; others at Trust ≥ 20 |
| **Haul:** grip wall, rescue rope, Trust Fall | Helpers always; others at Trust > −30 |
| **Stay with a Knot partner** within 10 m, where the room allows | Every Knotted Rival |

### 17.8 Rival mischief

- Rivals do mischief only in toys and Landings: sumo, Frog Stack and Jar Tag.
- They never do it in rule rooms, and never to a frog during a monster cue.

### 17.9 Budget

- 7 brains must take ≤ 1.5 ms of host CPU per frame on the dev PC. That sits inside DEC §12's ≤ 8 ms host-simulation budget.
- The soak asserts it.

---

## 18. Explore → Theorise → Execute: Rivals never solve a room for a first-timer [MUST-A]

**The problem (CRIT #2).** A BotPlan that hard-codes the answer lets a first-time solo player simply follow Pell, and the "one monster, one rule, one weird way out" pillar dies.

**The fix:** every gated room runs a three-stage gate on the Rivals.

**What 05 tags in every BotPlan**

| Field | Meaning | Example (`bell_golem`) |
|---|---|---|
| `keyActions[]` | Actions that make clear progress | Ring bell 1, 2, 3 |
| `finalKeyAction` | The key action that completes the clear | Ring the third bell |
| `hiddenClearActions[]` | Steps on the hidden-clear path | 05 |
| `canonicalMistake` | One authored wrong move | Ring a bell while the eyes glow |
| `survivalActions[]` | Always allowed | Freeze on the cue |
| `startStage` | Stage at room start | Explore (default). Keeper: Theorise. Rematch and Warden phase 1: Execute. |

**When the gate is on.** It is on when **any human in the room lacks this room's Cleared stamp** (Bestiary, 04). Breathers and toys are never gated. With no first-timer present, Rivals start in Execute.

| Stage | Rivals may | Rivals may not | Moves on when |
|---|---|---|---|
| **Explore** | Wander to kit props; poke non-key props; do survival actions; make the `canonicalMistake` once each (at most 2 Rivals per room); bark B03/B04 | Any key action, any hidden-clear action, any rank-III/IV lane | A human completes a key action, or a human pings a key object, or 30 s pass (45 s when the rule text is redacted) |
| **Theorise** | Key actions, but the Rivals' total may never exceed **the humans' key actions + 1**. They prefer to demonstrate within 10 m and in a human's view. Pell may bark a hint that only **restates the plain rule** ("It only hits what moves. So... don't?"). | The `finalKeyAction` within the first **90 s** of a first-timer's time in the room; hidden-clear actions | Any human says "Go!" or "Help!"; or 90 s pass in the room; or every human present has the Cleared stamp |
| **Execute** | The full plan, including the final key action. Human reaction times and errors still apply. | Hidden-clear actions, unless every human present has this room's Hidden-clear stamp or pings the hidden-clear object | — |

**Rules**
- **"Go!" is the override.** A player who wants to be carried says so, and the Rivals switch to Execute at once.
- **Hidden clears stay human discoveries.** Rivals never perform or hint at one until every human present has that page's Hidden-clear stamp. They may gasp when a human finds one (B07).
- **Rank lanes** (rank III/IV) are used by Rivals only in Execute, or after a human has used that lane in this room.
- **Rookie Rivals** in Explore make the canonical mistake 1.5× as often. That is the Kestrel joke.
- **Hell and Sealed:** Rivals know nothing a human can't read.

**Acceptance**
- **M-A gate** (CRIT #2's fix), in first-time solo sessions:
  - the human performs the room's first key action in **≥ 60%** of rule doors;
  - the human performs the final key action in **≥ 50%**;
  - measured by telemetry `key_discovery_by_human`.
- **T-SOC-08:**
  - a `SoakHuman(newcomer)` soak: no Rival performs a final key action in the first 90 s;
  - a `SoakHuman(veteran)` soak: at least 90% of 50 seeds clear within the hard caps (DEC §7 gate).

---

## 19. Doors, forks and offstage Rivals

### 19.1 Door choice [MUST-A]

**Rivals never count in the walk vote** (FO §3.3). They lobby for a door, then follow the humans.

**Taste score** for a door d:

`s(d) = taste(suit) + 0.5 × prizeWant(prize) − 0.3 × skulls × (1 − N/100) + N(0, 0.2)`

- `taste` = 1.0 / 0.6 / 0.3 for the Rival's 1st / 2nd / 3rd suit, and 0 otherwise.
- `prizeWant`:
  - 1.0 for a jar or gold if Greed ≥ 60;
  - 1.0 for a Boon if Wit ≥ 70;
  - 1.0 for a window for Lumen and Pip;
  - 0.5 otherwise.

**Lobbying**
- When a pair appears, up to 2 Rivals whose best door beats the other by ≥ 0.3 walk to that door's threshold and bark once (B02). The Director may pick which.
- They **never step into the doorway**, so they never start or sway the 4 s vote.

**Following**
- When the first human steps into a doorway, every Rival heads for the door currently winning the human vote, staggered 0.5–1.5 s, and re-targets if the lead changes.
- When the door opens, all Rivals go through with the humans.

**Solo:** the human alone decides. The Rivals lobby, then follow.

### 19.2 Forks [MUST-B]

E doors hold 1 or 2 frogs (SOLO or DUO).

**Rivals stay with humans.** They join whichever side holds the most humans. A Rival enters an E door only if:
- the E door is DUO, and a human there pings it with "Help!" or "Go!", or is its Knot partner; or
- it is offstage (§19.3).

**The offstage rule** (DEC §8.2 #11). When no human takes a side, Rivals take it offstage:
- **An E side:** 1 Rival (SOLO) or 2 (DUO), by highest E taste (Lumen > Pell > Ines > the rest). The Director may override.
- **A group side:** every Rival not already with a human.

### 19.3 Offstage Rivals [MUST-B]

- **Parked, not simulated.** Their frogs are hidden (NetworkObject visibility off) at an anchor. The outcome is fixed: the side is always cleared. This is not the retired Ghost Sim: there is no physics and no dice.
- **Return:** they reappear at the Meeting Door at the humans' clear time + U(5, 20) s (seeded), carrying the missing key, and one of them gives **one** reunion bark (B22).
  - If the humans' side fails, they arrive at the fail time + U(5, 20) s.
  - So the 45 s rescue rope never fires for an offstage side.
- **Pay:** they bank a rule door's clear bonus (18 + 2d each), get no hidden clear, and pick a Boon at the Meeting Door like everyone else.
- **Stamps:** they add nothing to any human's Bestiary or Rival Register, because no human saw the room.
- **T-SOC-12:** every assignment of 8 seats to fork sides, including sides with 0 humans, opens the Meeting Door within the humans' time + 20 s. No soft-locks.

---

## 20. Trust and Knots, Rival side [MUST-B]

**Trust** is a bot-internal value from −100 to 100 toward every frog. It has no UI (FO §7 "bot-internal AI values only"). It starts from the Rival Register's memory, capped at ±20 (§24).

| Event (by the frog, toward this Rival) | ΔTrust |
|---|---|
| Revived me | +30 |
| Caught my spot, hauled me, or caught me in the Trust Fall | +25 |
| Kept our Knot through a whole floor | +10 |
| Said "Thanks!" or "Sorry!" to me (once per door) | +2 |
| Mischief on me (shove, tug); at most −9 per door | −3 |
| Voted to jar me when I was a frog | −15 |
| Yanked me in a Heart door | −20 |
| Tagged me for Vengeance | −10 |
| Betrayed my Knot partner | −25 |
| **Betrayed me** (any betrayal event) | **−60**. At Trust ≤ −30 it becomes a **grudge**. |

**Knot offers**
- At each Landing, each unknotted Rival with Loyalty ≥ 50 offers once, to its highest-Trust unknotted frog with Trust ≥ 20. It walks to the Knot spot and barks a B18 offer.
- The Director guarantees every human at least one offer per climb: the highest-Trust Helper offers even at Trust ≥ 0.

**Knot answers**
- A Rival accepts at Trust ≥ 50, or at Trust ≥ 20 with Loyalty ≥ 40.
- Exceptions: Maud accepts every offer; Lumen needs Trust ≥ 50; Gutter never accepts a frog it holds a grudge against.
- A declining Rival barks a B18 decline line.

**The Cut.** Rivals never Cut outside Heart doors (FO §5.3). Inside one, the Cut is simply one of the betrayal windows (§21).

**A Knotted Rival:**
- stays within 10 m of its partner where it can;
- revives its partner first;
- follows its partner into a fork side;
- slings its partner with a Duo Frog Sling when the partner says "Go!".

---

## 21. The betrayal decision model [MUST-B]

**Where it runs.** Only inside a Heart door's authored `betrayalWindows`, never elsewhere (FO §5.3). The host evaluates it **once per window per Rival**, against that Rival's best target.

**Utility**

`U = 0.9·g·gain + 0.8·s·grudge + w_room − 0.8·l·bond − 0.4·h`

| Term | Meaning |
|---|---|
| g, s, l, h | Greed, Spite, Loyalty and Honesty, each ÷ 100 |
| `gain` | `min(1, stake / 30)`. The stake is what the Rival would take: the target's share of unbanked fireflies for a push or Cut, or J in Split or Swallow. |
| `grudge` | 1 if the Rival's Trust toward the target is ≤ −30, else 0 |
| `w_room` | The RoomDef's temptation weight: `heart_two_pads` 0.12, `heart_split_swallow` 0.20, `heart_tied_bridge` 0.15 |
| `bond` | 1.0 for the Rival's Knot partner, 0.6 at Trust ≥ 30, 0.2 otherwise |

**Probability**

`P = 1 / (1 + e^(−10·(U − θ_eff)))`, where `θ_eff = θ + d`.
- d is the Director's nudge, from −0.3 to +0.5 (§22).
- **Hard blocks** (mercy, budget, `CanBetray` false) skip the roll entirely.
- The same model runs for every Rival. This fixes CRIT #3, where the GDD's live and ghost bots used two models that disagreed; ghost bots no longer exist.

**Randomness.** The roll is seeded from the climb seed ⊕ door ⊕ seat ⊕ window index, so a replayed seed reproduces every decision.

**Target choice.** Among the frogs in the window's reach, the Rival picks the highest `gain × (1 − bond) + grudge`. Ties go to the nearest frog. The Director may name the target for a staged beat.

**Execution**
1. The full tell (1.5 s).
2. The cold-feet check (§7.3).
3. The action.

If the action misses physically, nothing is taken, so no event is logged: it was only mischief.

**Budget override.** If more Rivals roll "betray" in one window than the budget allows (§22.3 L5), the host keeps the highest-P rolls. The rest never start a tell.

**Worked examples: `heart_two_pads`** (stake 18 → gain 0.6; no grudge; bond 0.2; w_room 0.12)

| Rival | U | θ | P, no Director | P, Director −0.3 |
|---|---|---|---|---|
| Vex | 0.427 | 0.45 | 0.44 | 0.94 |
| Maud | 0.374 | 0.50 | 0.22 | 0.85 |
| Gutter, no grudge | 0.198 | 0.60 | 0.02 | 0.27 |
| Gutter, grudge | 0.878 | 0.60 | 0.94 | 1.00 |
| Kestrel | 0.097 | 0.90 | 0.0003 | 0.007 |
| Moss | −0.330 | 1.50 | ≈ 0 | ≈ 0 |

**Worked examples: `heart_split_swallow`** (J = 28 → gain 0.93, shown as 0.9; w_room 0.20; bond 0.2)

| Rival | U | P |
|---|---|---|
| Vex | 0.74 | 0.95 |
| Maud | 0.64 | 0.81 |
| Kestrel | 0.33 | 0.003 |
| Pip | −0.11 | ≈ 0 |

**Reading the tables.** Vex nearly always swallows and Maud usually does. That is a learnable personality: never share a booth with Vex. Helpers never betray. Gutter is harmless until you wrong him. The Director's budget caps the totals.

---

## 22. The Drama Director

[MUST-A] for the climb-1 beats up to door 10. [MUST-B] for everything else.

### 22.1 What it is

The Drama Director is a host-only system that stages Rival beats, so that every climb holds:
- a rescue;
- regular laughs;
- a readable betrayal;
- a Vengeance that somebody sees.

It is **on** in Solo and Public, and a host option (default On) in Friends/Private.

### 22.2 Targets per climb (FO §5.3, retuned)

| # | Target |
|---|---|
| T1 | A Rival rescues a human by door 6 |
| T2 | At least one funny Rival failure every 5 doors |
| T3 | The first Heart door a human sees contains a **visible** Rival betrayal. Visible means the traitor is inside that human's camera frustum during the full tell. |
| T4 | Every human gets at least 1 Knot offer (climb 1: at Landing 3; seeded climbs: from Landing 1) |
| T5 | Every Vengeance owed to a Rival victim lands in front of a human when possible, so the payoff is seen |
| T6 | An onlooker chorus of 1–3 Rivals at every human Awakening, class reveal and Crown glow |

### 22.3 Limits (hard)

| # | Limit |
|---|---|
| L1 | At most **1** Rival betrayal against each human per floor (5 doors) |
| L2 | **Mercy:** no Rival betrays a human who is on 1 spot during floors 1–2 (doors 1–10) |
| L3 | Never skip or shorten a tell |
| L4 | Never force a room failure. A staged funny failure may only cost a Rival's own spot, or cause a recoverable wobble (for example, the raft tilting past 18° for less than 1.5 s). |
| L5 | At most **3** Rival betrayals per climb, and at most **2** per Heart door |
| L6 | Never target the same human in two Heart doors in a row |
| L7 | A staged beat never completes a human's action for them. The Kestrel beat waits for the human's tongue. |

### 22.4 Levers

The Director can:
- nudge θ (−0.3 to +0.5);
- add positioning bias ("stand near X") inside a Rival's role goal;
- choose which Rivals lobby at doors, which Rival offers the Knot and which Rival goes offstage;
- pick the Mimic seat in Spot the Mimic;
- raise bark priority.

### 22.5 Staged first-climb beats (`director_climb1.json`)

These beats assume solo play with the 7 Rookie Rivals. When more humans play and a beat's Rival isn't seated, the beat is skipped unless a fallback is listed.

| ID | Door | Actors | Trigger | What happens | Fallback | Tag |
|---|---|---|---|---|---|---|
| DD-00 | 0 `hatch_pond` (~0:25) | Kestrel | The human reaches pad 3 | Kestrel stands on a wobbly pad: "Watch this!" A prompt appears: Tongue Kestrel. The 1 m tug dunks him (the hatch pond's water is safe, not a `HazardEdge`, so the tug is allowed), and he belly-flops: "That was on purpose." **First laugh ≤ 0:30** (FO §3.5). | Public lobby, or tongue-on-player cut: the prompt targets a pot stack that topples onto Kestrel | A |
| DD-01 | 1 `br_shove_door` | Moss | The human is within 8 m of the door | Moss walks up and pushes with the human. `DOOR 1` slams. If the human waits 6 s, Moss says "It's a two-frog door. I'm one frog." | Any Helper | A |
| DD-02 | 2 `bell_golem` | Moss | The human's first knocked-out spot | Moss is held within 6 m of the human (positioning bias) and tongues the spot back within 1.5 s: "Got it!" (T1) | No hit at door 2: any Helper catches the human's first spot or fall in doors 3–6 | A |
| DD-03 | 3C `lily_raft` | Kestrel | 20 s into the room | Kestrel hops to the low side once, and the raft tips: "That was on purpose." (T2) | 3A `heron_shadow`: Kestrel stands in the shadow's path, gets plucked and dropped: "I meant to do that." | A |
| DD-04 | 4 `br_window` | Pip | Window reached | "It goes up forever?!" | — | A |
| DD-05 | 5C `snapper_crossing` | Brother Brass | Egg picked up | "I can carry that." He fumbles it once, from 1.0 m, which is below the crack height. (T2) | 5B `fog_stair`: Pip glows too bright and the eel lunges at Pip: "Physics is a lie!" | A |
| DD-L1 | Landing 1 | Kestrel | Frog Stack starts | Kestrel insists on going on top, and the stack collapses | — | A |
| DD-07 | 7 | Any 3 Rivals | The human's first Awakening | Onlooker chorus: "Since when does your tongue do *that*?" (FO) (T6) | — | A |
| DD-09 | 9 `br_gold` | Pip, Vex | Room entered | Pip: "Is it all for us?!" Vex: "Gold. Finally, a door with manners." | — | A |
| DD-10 | 10 `keeper_bell_raft` | Brother Brass | The Chorus moment | Brass calls "On three." The Rivals croak on his count, so the human's croak completes the Chorus. | — | A |
| DD-L2 | Keeper Landing | Vex, Moss | Rank F → E | Vex: "E-rank now? Look who grew up." Moss: "Told you." | — | A |
| DD-11 | 11 `heart_two_pads` | Vex → Moss | The first pad's last 5 s, with Vex in the human's view | Vex plays the full tell beside Moss, then shoves Moss off. Moss swims, and Vex's cheeks glow crimson. The Cam and WANTED follow, and Moss gets a Vengeance quest. **The first betrayal the player sees is Rival-on-Rival** (plan_1). (T3) | Fewer than 2 Rivals: Vex targets the human holding the most unbanked fireflies, within mercy. No Rivals: skipped. | B |
| DD-12 | 12 (fork) / `meeting_room` | Moss → Vex | The first room holding Moss, Vex and a human | Moss tags Vex within 20 s, with a human within 12 m and facing them: "Hi, Vex." Vex, slimed: "Worth it." (T5) | The human took 12E alone: both Rivals are offstage, and Moss lands it in the Meeting room during Jar Tag | B |
| DD-14 | 14 `doppelfrog` (Spot the Mimic) | Maud (the Mimic), Pell | Room start | Maud tags the human once, with the full tell, where Pell can see it. That makes the **first betrayal aimed at the human**, and honest evidence exists. Pell points: "I saw Maud tag you." Maud: "Would I lie?" | Human Mimic variant: the Director picks no one, and Maud simply plays | B |
| DD-15 | 15 `sp_grip_wall` | Pip | Pip passes 60% of the wall height | Pip's grip runs out and Pip hangs from one hold: "Help!" The human can tongue-haul Pip up (+25 Trust). | — | B |
| DD-L3 | Landing 3 | The highest-Trust Helper (Moss by default) | Landing arrival | Moss walks to the Knot spot: "Knot?" (T4) | — | B |
| DD-17 | 17 | Kestrel | The human holds Frog Sling | Kestrel begs: "Sling me! Watch this!" If slung, he over-rotates and lands in a sprawl, with no spot lost. | — | B |
| DD-18 | 18 Rematch | Chorus | The clear | "Old time 1:12. New time... oh no." | — | B |
| DD-19 | 19 `br_sleeping_toad` | Kestrel, Pip | Mid-room | Kestrel's sac starts to swell for a croak. Pip holds his mouth shut with her tongue. The toad stirs, but sleeps on. | — | B |
| DD-20 | 20 `warden_the_jar`, phase 3 | Brass, Pip | The Trust Fall | Brass catches the human: "I've got you." Then Pip falls, and needs the human's catch. | — | B |
| DD-★1 | ★1 → the Rim | All | The reveal ends | Chorus B29 on the Rim | — | B |

### 22.6 The Director in seeded climbs

The Director evaluates its targets at every room start and every 5 s. It draws beats from pools keyed to the room's shared-fate kind:

| Beat pool | Examples |
|---|---|
| Funny failures | `TipRaft`: a hop to the wrong side. `FragileCarry`: a fumble. `NoiseShared`: an accidental croak. `ChorusLock`: a late croak. `Tether`: an out-of-step hop. `LightLure`: too shiny. |
| Rescues | Catch, haul, revive (§17.7) |
| Betrayals | Only inside Heart doors, through θ (§21) |
| Knot offers | At Landings (§20) |
| Vengeance | A Rival victim's hunt, steered into a human's view |

It always picks the seated Rival with the best personality fit (a funny failure goes to Showboats first, a rescue to Helpers first).

---

## 23. Barks

Barks are the cheapest fun per minute in the game: text plus babble, no voice acting (plan_1 §6). They are how a solo player gets a full lobby (FO §2.2 pillar 5).

### 23.1 Delivery [MUST-A]

**The bubble**
- A world-space bubble above the Rival's name tag: localized text plus croak-babble at the Rival's f0.
  - Each syllable lasts 70–110 ms, and the pitch contour follows the line type: questions rise, "Help!" is high and sharp, "Sorry!" falls (GDD §15.3, re-homed; 09 owns the synthesis).
- It lasts 2.0 s + 40 ms per character. Its border is the Rival's body colour.
- It reads within 25 m (15 m in dark rule rooms). A bark from a Rival within 25 m but off-screen shows as a small edge chip with the Rival's name.

**Rate limits**
- At most 1 bark may start every 2.5 s per room, and each Rival may bark at most once per 10 s.
- **Chorus exemption:** up to 3 Rivals within 1.2 s, for T6 milestones, betrayals and Vengeance.

**Priority**

| Level | Barks |
|---|---|
| P0 | Staged Director beats, betrayal, Vengeance |
| P1 | Onlooker milestones, rescues |
| P2 | Cue warnings, door lobbying, mischief reactions |
| P3 | Idle chatter |

A lower-priority bark is dropped rather than queued for more than 3 s.

**Cue silence.** During a monster cue window, only B04 warnings may play, and they fire at the Rival's reaction time after the cue starts. Nothing talks over a tell.

**Picking a line**
- Each line has a speaker filter (one Rival, a family, or `any`), a weight and an optional condition.
- A Rival-specific line wins a tie.
- A line never repeats one of the last 3 used in its category this session.

**Strings.** String table `Barks`, keys `bark.<category>.<nn>`. The `barks.json` sidecar holds the filters, weights, priorities and conditions (§25).

**Special modes**
- **Masked Rivals:** named and signature lines are off.
- **Rookies:** B31 plays only while f > 0.

### 23.2 Lines by situation (33 categories, 5+ lines each)

`any` means any seated Rival. Conditions are in brackets.

**B01 Climb start** (P3; hatch pond, door 1)
1. Brass: "Everybody out of the water!"
2. Ines: "First one to the door gets nothing. Go!"
3. Moss: "Stay close. The well is hungry."
4. Vex: "I hatched a minute ago and I'm already bored."
5. Pip: "Is it always this dark? Is it always this big?"
6. Lumen: "Don't wait for me."

**B02 Door lobbying** (P2; when a pair appears)
1. Moss [♣]: "Club door! Teamwork! Hugs!"
2. Brass [♠]: "Spade door. Legs day."
3. Pell [♦]: "Diamond door. I brought my brain."
4. Vex [♥]: "The heart one. Obviously the heart one."
5. Pip [jar prize]: "That one has a jar. I like jars."
6. Kestrel [2+ skulls]: "More skulls, more glory!"
7. Lumen [E]: "I'll take the lonely door."
8. Ines [any]: "Whichever is shorter. Go."

**B03 Entering a rule door** (P3)
1. Pip: "Oh, I don't like this one."
2. Moss: "Nobody croak."
3. Pell: "Read the rule. Then read it again."
4. Gutter: "I've seen worse. I've *been* worse."
5. Kestrel: "It's fine. It's fine. It's looking at me."
6. Vex: "Smells like a trap. Smells like profit."

**B04 Cue warnings** (P2; at reaction time after the cue. 05 adds room-specific `cueBarks`.)
1. any: "Here it comes!"
2. any [`GazeShared`]: "Eyes! Freeze!"
3. any [shadow cue]: "Shadow! Get under something!"
4. any [`NoiseShared`]: "Shh. It heard that."
5. Moss: "Don't move. Don't move. Don't— okay, you moved."
6. Kestrel: "I'm not scared. You're scared."

**B05 Rank tease** (P3; the first rule door of a climb, keyed to the human's Tower Rank)
1. Vex [F]: "An F-rank? Adorable." (FO)
2. Gutter [F]: "F-rank. Fresh. Crunchy."
3. Ines [F–D]: "Everybody starts at F. Some of us stay there."
4. Moss [F]: "Don't listen to them. F is a great letter."
5. Maud [any]: "Oh, sweetie. You'll do fine. Probably."
6. Vex [E, at the Keeper Landing]: "E-rank now? Look who grew up."
7. Lumen [S+]: "S-rank. Don't let it go to your head. It will."

**B06 Onlooker: growth** (P1. A level-up gets a bark 35% of the time; Awakenings and the Crown glow always get a chorus.)
1. any [Tongue III]: "Since when does your tongue do *that*?" (FO)
2. any [Hop III]: "Wait. You can hop on AIR now?"
3. any [Croak III]: "Two bells with one croak? Rude."
4. Vex [level-up]: "Brighter. Annoyingly brighter."
5. Moss [level-up]: "Look at you, little lantern."
6. Pip [Crown glow]: "You have a HALO?!"
7. Kestrel [any]: "Teach me. No. Don't. I'll be jealous."

**B07 Onlooker: big clear** (P1; a 3-skull clear, a hidden clear, or `[ NOTED ]`)
1. any: "An {rank}-rank cleared a three-skull door?!" (FO)
2. any: "That was not how you're supposed to do it. Do it again."
3. Pell: "The Tower is going to write that down."
4. Pip: "I'm telling everyone!"
5. Lumen: "Fine. That was good. Don't make it weird."
6. Ines: "Personal best. For you."

**B08 Onlooker: class reveal** (P1, chorus)
1. any: "Wait. {name} was an {class} this whole time?" (FO)
2. Pip: "I knew it. I didn't know it. I KNEW it."
3. Kestrel: "Secret frog! Secret frog!"
4. Pell: "Interesting. Very interesting. Mildly threatening."
5. Vex: "Congratulations. I hate it."

**B09 Rescue given** (P1; a Rival catches, hauls or revives someone)
1. Moss: "Got it!"
2. any: "Here. Yours, I think."
3. any: "Up you come."
4. Brass: "I've got you."
5. Pip: "Caught it! Did everyone see? I caught it!"
6. Vex: "You owe me. Just saying."

**B10 Gratitude** (P1; a human rescued or thanked this Rival)
1. Pip: "Thanks!"
2. Kestrel: "My hero. Don't let it go to your head."
3. Gutter: "...I'll remember that."
4. any: "Anytime. Well. Most times."
5. Moss: "Nobody falls today."
6. Ines: "Efficient. I approve."

**B11 Rival slapstick** (P1 when staged, else P2)
1. Kestrel: "That was on purpose."
2. any: "I meant to do that. Mostly."
3. any: "Nobody saw that."
4. Pip: "Physics is a lie!"
5. any: "Wrong pad. Wrong pad!"
6. Brass: "My legs have a mind of their own. It's a bad mind."

**B12 Mischief received, or blamed** (P2; at most 1 per 10 s per Rival)
1. any: "Hey!"
2. Maud: "Rude. Accurate, but rude."
3. Pell: "I'm telling the Tower."
4. Vex: "You're lucky this isn't a Heart door."
5. any [croak-scare]: "AAH— oh. It's you."
6. Gutter: "Remember me? You will."

**B13 Entering a Heart door** (P2)
1. Moss: "Heart door. Everyone keep your tongues where I can see them."
2. Vex: "Finally. Something interesting."
3. Maud: "I would never. Probably."
4. Pip: "Can we all just... not?"
5. Pell: "Read the rule twice. Rules are sneaky."
6. Gutter [holds a grudge against someone present]: "You. Again."

**B14 The traitor, afterwards** (P0)
1. Vex: "Nothing personal."
2. Vex: "Worth it."
3. Vex: "You'd have done it too."
4. Maud: "Oh, sweetie."
5. Gutter: "Not sorry."
6. any Schemer: "It seemed like a good idea for one whole second."

**B15 The victim, afterwards** (P0)
1. any: "...Really?"
2. Moss: "I trusted you. Out loud. In front of everyone."
3. any: "Oh, it's ON."
4. Pell: "I'm not angry. I'm writing it down."
5. Kestrel: "Remember this face. It's the face of revenge."
6. Pip: "Help! Traitor! Help!"

**B16 Witnesses** (P1 chorus; at the Cam and the WANTED poster)
1. any: "Ooooh."
2. any: "Did everybody see that?"
3. any: "Cold. Ice cold."
4. Kestrel: "That's going on a poster. Oh. It IS a poster."
5. Pip: "Somebody get the slime!"
6. Ines: "I'm not even mad. I'm impressed."

**B17 Vengeance landed** (P0)
1. victim: "Hi, {traitor}."
2. victim: "Tag. You're slimed."
3. Pip: "Justice! Sticky justice!"
4. Vex [traitor]: "Worth it."
5. any [traitor]: "Fair. That's fair."
6. Brass: "And that's that. Onward."

**B18 Knots** (P1)

| Offer | Accept | Decline |
|---|---|---|
| any: "Knot?" | any: "Knotted. Don't let go." | any: "Maybe next Landing." |
| Moss: "You and me? Just to the top." | Lumen: "Fine. Together." | Lumen: "I work alone." |
| Lumen: "I could use a partner. Don't make it weird." | Vex: "Deal. Probably." | Gutter [grudge]: "Not after last time." |
| Maud: "Knot? I'm very trustworthy." | Pip: "Yes! Best day!" | Ines: "I've seen your tongue. No." |
| Pip: "Partners! Please! Please?" | Brass: "On three, we're partners. Three." | Vex: "Pass. Nothing personal." |

**B19 Cut held on** (P1)

| The cutter | The one who held on |
|---|---|
| any: "It slipped!" | any: "Not today!" |
| Maud: "I was checking the knot. For safety." | Moss: "I'm holding ON." |
| Vex: "Worth a try." | Pip: "Nope nope nope nope." |
| any: "Okay. You win this one." | Brass: "This knot holds." |
| Gutter: "Next time." | Kestrel: "Reflexes!" |

**B20 Doppelfrog pointing** (P1)

| Honest Rivals (evidence ≥ 3 only; always "I saw") | A Rival Mimic's lies (never "I saw") |
|---|---|
| "I saw {name} blink sideways." | "{name} has been acting weird." |
| "I saw {name} tag {victim}." | "I've got a bad feeling about {name}." |
| "I saw {name}'s eyes do the sideways thing." | Maud: "Would I lie?" |
| Pell: "I saw it. {name}. Sideways. I'm certain." | "Vote {name}. Trust me." |
| [evidence < 3] "I didn't see anything. I'm skipping." | "Me? I'm the frog-iest frog in here." |

**B21 Vote result** (P1)
1. any [Mimic caught]: "Knew it!"
2. any [wrong frog]: "Oops. Sorry, {name}."
3. Kestrel: "Jarred! Ha!"
4. any [wrong frog]: "That was a frog. That was definitely a frog."
5. Maud [caught]: "Oh, sweetie. Obviously."
6. Gutter [no verdict]: "Nobody? Cowards."

**B22 Offstage reunion** (P2; exactly one per Meeting Door)
1. [Kestrel was offstage] "Kestrel fell in twice." (FO)
2. any: "We had a moment in there. You missed it."
3. Lumen: "Did it alone. As usual."
4. Pip: "I cried. Happy tears. Mostly."
5. Vex: "Brought your key. You're welcome."
6. Kestrel: "The monster says hi."

**B23 Landing idle** (P3)
1. Moss: "Look up. It got bigger."
2. Kestrel: "Anyone want to stack? I'll be on top."
3. Pip: "The stall has hats. I need all of them."
4. Ines: "Forty seconds. Use them."
5. Lumen: "Warm. I forgot what warm was."
6. Maud [the Knot spot is unlocked]: "The Knot spot is open. Just saying."

**B24 Keeper and Warden** (P1)
1. Brass: "On three."
2. any: "Big one. Everybody croak together!"
3. Kestrel [Keeper]: "It's the golem from door 2. It's been working out."
4. any [Trust Fall]: "Catch me. CATCH ME."
5. Pip [Warden]: "That jar is the size of my future."
6. Brass [Trust Fall]: "I've got you. I've always got you."

**B25 A Team Life lost, or a room failed** (P1)
1. Moss: "We'll get the next one."
2. Pip: "Nobody panic. I'm panicking."
3. any: "Well. That happened."
4. Ines: "Next door. Faster."
5. Brass: "The Tower moves on. So do we."
6. Vex [blamed]: "Don't look at me. Okay, look at me a little."

**B26 Revives** (P1)
1. [reviving] any: "Come back! Come back come back!"
2. [reviving] any: "Hold still, tadpole."
3. [reviving] Brass: "Up you get."
4. [revived] any: "Being a tadpole was humbling."
5. [revived] any: "I saw a light. It was a firefly."
6. [revived] any: "Thanks. I owe you one."

**B27 Rematch** (P1)
1. any: "Old time {old}. New time... oh no."
2. any: "It remembers you. It looks scared."
3. Kestrel: "Did it get smaller? It got smaller."
4. Brass: "That's what doors are for."
5. Ines: "SPEEDRUN!"

**B28 Gold door** (P1)
1. Pip: "Is it all for us?!"
2. Vex: "Gold. Finally, a door with manners."
3. any: "Gulp everything. Ask questions never."
4. Maud: "I'm keeping the shiny one."
5. Kestrel: "Treasure! Don't trip—" (he trips)

**B29 ★1, on the Rim** (P1)
1. any: "...It's so big."
2. Pip: "The sky was a HOLE?"
3. Pell: "Those stars. Are they... lanterns?"
4. Lumen: "Nobody told me there was more."
5. Moss: "We did it. We actually did it."
6. Vex: "Great. More doors."

**B30 Rival Register callbacks** (P3; at the hub or Landing 1; at most 1 per session)
1. [you betrayed this Rival at `heart_two_pads`] "Last time, you left me on the pad."
2. [rescuesByYou ≥ 2] "You caught me {n} times last climb. I counted."
3. Gutter [you betrayed Gutter]: "You. Again."
4. Moss [knotsKept ≥ 1]: "Same frog, same Knot?"
5. Kestrel [any]: "I've been practising. Mostly falling."
6. any [bestDoorTogether ≥ 10]: "Door {best}. We got there together. Remember?"

**B31 Rookie Rivals** (P3; only while f > 0)
1. "I'm new here too. Obviously."
2. "Which way is up? It's up, right?"
3. "Rookie mistake. I'm a rookie. It checks out."
4. "They gave me a label. It says Rookie. I love it."
5. "Is it bad that I don't know what I'm doing?"

**B32 Cold feet** (P1)
1. any: "Sorry!"
2. any: "I was just... admiring your pad."
3. any: "Nope. Never mind."
4. Maud: "Not now. Later. Maybe never."
5. Vex: "You have a very trustworthy face. Ugh."

**B33 Hunted** (P2; the traitor, during its Vengeance room)
1. [Rookie] any: "Fine. Get it over with."
2. Vex: "Catch me if you— okay, fair."
3. Maud: "Sweetie, let's talk about this."
4. Gutter: "Come and try."
5. any: "I can feel you glaring."

**The full tell's bubble** is always the wordless "…" (§7.3). It is not a category and ignores the rate limits.

---

## 24. The Rival Register [MUST-B]

The Register is the Rivals' memory of you, which gives hub callbacks (FO §5.3; GDD §8.8).

**Storage**
- In the local profile save: `profile/rivals.json` under `Application.persistentDataPath`.
- Updated at every Landing save and at the results screen.
- A reset button lives in Settings.

**Per-Rival fields**

| Field | Shown to the player |
|---|---|
| `climbsTogether`, `rescuesByYou`, `rescuesByThem`, `knotsKept`, `bestDoorTogether` | Yes |
| `lastCallbackKey` | Yes (the line itself) |
| `betrayalsByYou`, `betrayalsByThem`, `vengeanceByYou`, `vengeanceByThem`, `lastSeenClimb` | **Never.** Internal only (G10). |

**Effects**
- **Starting Trust** toward you: `min(20, max(−20, 5·knotsKept + 5·rescuesByYou − 10·betrayalsByYou))` (GDD §8.8).
- **One callback bark per session** (B30), at the hub or Landing 1. It picks the most notable event: you betrayed this Rival > you rescued it 2+ times > a Knot kept > 5+ climbs together.
- **Gutter weighting** in party picks (§16.4).

**Display**
- A page labelled **RIVALS** (a plain word, so no new noun), reachable from the hub wall (07 places it) and from pause.
- It shows 10 portraits; Rivals you haven't met are silhouettes.
- Each met Rival shows climbs together, rescues both ways, Knots kept, best door together and its last callback line.

**Multiplayer**
- Each human's Register stays local.
- At join, the client sends only its 10 starting-Trust seeds to the host.
- Forging them gains nothing, because Trust gates no reward (FO §10.4 #6).

---

## 25. Data and code map

Assemblies follow DEC §12. Agents write JSON; generators build the ScriptableObjects (UT).

| Class | Assembly | Job |
|---|---|---|
| `LobbyRules`, `FairnessCaps` | Game.Core | Lobby type, toggles, `CanBetray`, caps (from `lobby_rules.json` and `social_caps.json`) |
| `RivalRegister` | Game.Core | Persistence (§24) |
| `KnotService`, `BetrayalService`, `VengeanceService`, `VoteService`, `BlameTracker` | Net (host only) | §6–§11, §5 |
| `ISharedFate` and its 13 kinds, `MimicRole` | Rooms | §4, §8.5 |
| `ReplayBuffer`, `BetrayalCamDirector`, `FallReplayPip` | UI (client) | §5.2, §9 |
| `SystemWindowQueue`, `BarkBubble`, `BlameTag`, `WantedPoster`, `WheelMenu`, `VoteBoard` | UI | §5, §9, §13, §14, §23 |
| `RivalDef`, `RivalBrain`, `BotPerception`, `BotGate`, `BetrayalModel`, `TrustTable`, `DoorLobbyist`, `OffstageParty`, `DramaDirector`, `BarkDirector` | Bots | §16–§23 |
| `HeartDoorValidator`, `BotPlanValidator`, `BarkValidator`, `SystemLineValidator` | Editor | §26 |

**Data files**

| File | Holds |
|---|---|
| `Data/social/lobby_rules.json` | The §2 table |
| `Data/social/social_caps.json` | Tug 1.0 m, shove 6 m/s, the throttle, ledge margins, Cut and yank timings |
| `Data/social/rivals.json` | §16.3 |
| `Data/social/director.json` | Targets, limits, beat pools |
| `Data/social/director_climb1.json` | §22.5 |
| `Data/social/barks.json` + the `Barks` string table | §23 |
| `Data/social/system_lines.json` + the `System` string table | §14 |
| RoomDef `heart{}` and `botPlan{}` blocks | 05 fills them, using this file's schema |

**`rivals.json` entry**

```json
{
  "id": "vex",
  "nameKey": "rival.vex.name",
  "family": "schemer",
  "archetype": "opportunist",
  "bodyHex": "#E8F24A",
  "loadout": { "hat": "hat_matchstick" },
  "croakF0": 300,
  "stats": { "greed": 85, "loyalty": 20, "nerve": 70, "honesty": 30, "wit": 60, "spite": 50 },
  "theta": 0.45,
  "doorTaste": ["heart", "spade", "enigma"],
  "signatureBarks": ["bark.sig.vex.01", "bark.sig.vex.02", "bark.sig.vex.03"],
  "milestone": "A",
  "climb1SeatOrder": 3,
  "startClassFromClimb2": "dart_frog"
}
```

**RoomDef `heart{}` block** (`heart_two_pads`, climb 1)

```json
"heart": {
  "verbs": ["Shove"],
  "temptationWeight": 0.12,
  "coopAnswerIsHiddenClear": true,
  "stake": { "kind": "unbankedFraction", "fraction": 0.5, "autoGulp": true },
  "betrayalWindows": [
    { "id": "pad_depart", "from": "padDeparture-5.0", "to": "padDeparture-1.0", "reach": "onOrBesidePad" }
  ],
  "enterLine": "sys.heart.two_pads.enter"
}
```

**RoomDef `botPlan{}` gating fields** (`bell_golem`)

```json
"botPlan": {
  "startStage": "Explore",
  "keyActions": ["ring_bell_1", "ring_bell_2", "ring_bell_3"],
  "finalKeyAction": "ring_bell_3",
  "hiddenClearActions": ["see_05"],
  "canonicalMistake": "ring_while_gazed",
  "survivalActions": ["freeze_on_gaze"],
  "roles": ["Ringer", "Lookout", "Catcher"],
  "cueBarks": ["bark.room.bell_golem.cue.01", "bark.room.bell_golem.cue.02"]
}
```

**`barks.json` entry**

```json
{ "key": "bark.b06.01", "category": "B06", "speaker": "any", "weight": 1.0, "priority": 1,
  "when": { "event": "awakening", "verb": "tongue" } }
```

---

## 26. Tests and telemetry

### 26.1 Tests (EditMode unless marked; all MUST-A unless the feature is MUST-B)

**T-FAIR-01 to 08:** see §12.2.

| Test | Asserts |
|---|---|
| T-SOC-01 | A 50-seed soak logs no `BetrayalEvent` outside a Heart RoomDef |
| T-SOC-02 | Fireflies are conserved (unbanked + escrow + banked) across Cut, push, swallow, Mimic tag and Vengeance (property test) |
| T-SOC-03 | Vengeance returns exactly `Taken`; the +1 card is granted at most once per climb per victim |
| T-SOC-04 | No Team Life is spent in a Heart door (H4) |
| T-SOC-05 | Director limits over 1,000 simulated seeded climbs: L1, L2, L5, L6. PlayMode, 20 samples: every Rival betrayal is preceded by a full tell of at least 1.5 s. |
| T-SOC-06 | `BotPerception` and `BetrayalModel` reference no `HiddenRole`, `BoonOffer` or `SecretQuest` type (reflection) |
| T-SOC-07 | No betrayal counter exists in the results, titles, Register view model or Steam stats; blame tags never spawn in Public |
| T-SOC-08 | Gating, with newcomer and veteran soaks (§18) |
| T-SOC-09 | Every number in the System and bark tables is a `{key}`; `%` is always bound (FO §8.6); System bodies are 90 characters or fewer; every localization key resolves |
| T-SOC-10 | `HeartDoorValidator`: a rule of 14 words or fewer, non-empty `heart.verbs`, `coopAnswerIsHiddenClear`, at least one betrayal window, an entry line, and `HazardEdge` areas present |
| T-SOC-11 | Bark rate limits hold through a 30-minute soak |
| T-SOC-12 | Forks never soft-lock, for every side assignment (§19.3) |
| T-SOC-13 | Escrow never banks before its Vengeance chance resolves |
| T-SOC-14 | The Doppelfrog variant matrix (lobby type × human count × toggle) picks correctly; Rivals never vote in Spot the Mimic; the quorum rule fires below 5 living voters |

### 26.2 Telemetry

Telemetry is opt-in and carries no personal data; 10 owns the transport.

**Events**
- `heart_enter`;
- `betrayal {kind, actorIsHuman, victimIsHuman, lobbyType}`;
- `cut_attempt`, `cut_held`;
- `knot_offer {fromRival}`, `knot_formed`;
- `vengeance {landed | expired}`;
- `mimic_vote {correct}`;
- `key_discovery_by_human {room, first | final}`;
- `gate_stage {room, from, to, reason}`;
- `blame_tag_shown`.

**"Worth it?"** (FO §8.5) is split by lobby type and by whether the player was betrayed this climb.

### 26.3 A/B tests owned here (FO §9.3)

1. Rival-only betrayal (Public rules) vs friend betrayal.
2. Secret quests on vs off in Heart doors (suspicion).
3. Tongue-on-player on vs off, run with the M0 proof of concept.
4. Rookie fade on vs off: "Worth it?" across climbs 1–10.
5. The audience layer on vs off [LATER].

**Fix triggers** (greybox hypotheses)
- **Betrayed players dislike it:** "Worth it?" is below 50% Yes among players betrayed this climb while others are at 60% or more. Raise every Rival's θ by 0.10 and re-test.
- **Rivals discover too much:** the human's first-key-action discovery is under 60%. Lengthen Explore by 10 s.
- **Vengeance goes unseen:** fewer than 70% of Vengeances land. Widen the tongue-tag hurtbox by 0.3 m.

---

## 27. Open questions

1. **H4: Heart doors cost no Team Life.** FO §3.7 and DEC §4 exempt only E doors. I added Heart doors, because a life is shared and betrayal must move only unbanked loot (FO §5.4 #3). Without H4, a Rival's betrayal could spend a solo player's life. This needs sign-off, and 04 must mirror it.
2. **Consent by walking.** I made every seeded ♥ door one side of a pair, so a lobby can walk away from betrayal. DEC §5 doesn't say. 05 owns placement.
3. **A name collision.** "The Watchers audience layer" (DEC §7 LATER) clashes with the Beyond Warden, "the Watcher". I kept the layer nameless on screen ("a lantern leaned in"). Please rename one.
4. **Rival loadouts.** 08's earned catalogue must contain the items listed in §16.3 (Moss Cap, Bell Cowl, Matchstick, Pearl String, Eyepatch, Feather Crest, Racing Stripe, Sweatband, Round Specs, Leaf Hood, Party Hat, Confetti, the Vine trail, the Velvet voice), or 08 and this file must agree on substitutes.
5. **Split or Swallow numbers.** The jar value J = 2 × (8 + d), and the Duet counting as the hidden clear, need 04's agreement on yields.
6. **Tongue holds.** The full yank (0.6 s), the hold-on (0.4 s) and the Mimic tag all use Tongue holds. 02 must confirm they don't clash with "hold Tongue to carry". My proposal: holding Tongue on a *frog* means yank or tag, and on a *prop* means carry.
7. **"At least 3 humans" is counted in the room, not the lobby,** because a fork can split the humans. Confirm.
8. **Masked Rivals** are FO lobby-table content, but DEC gives them no milestone tag. I tagged them [SHOULD].
9. **Vex swallows about 95% of the time** in Split or Swallow. I intend that as a learnable personality ("never share a booth with Vex"), but playtests may want his θ at 0.55.
