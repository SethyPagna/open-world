# Research: UI and UX organization for a game that must feel simple

Researcher: ui-organization · Written 2026-09-30 · For: KNOTWELL v2 (Firefly Frog open world, MMO feel, 8-player Steam lobbies, NGO host mode, Unity 6000.3.25f1 URP)

Pillars this file serves most: **P1 Clear**, **P4 Easy to start**, **P5 Organized** (every feature within 2 inputs of play), **P6 Open world, together**.

## How to read this file

- **Strength labels** (game-design-method rule 5):
  - **Strong:** I read the primary page this session.
  - **Supported:** a web search summary of a named page; I did not open the page itself.
  - **[unverified]:** from memory, or the page could not be opened. Confirm it before any design doc cites it as fact.
- **Coverage gap.** The web tools hit an account session limit at 02:15 (UTC+8) on 2026-09-30, after 9 primary pages had been read. So the accessibility half of this file is Strong. Much of the cozy-MMO, radial-menu and diegetic-UI material is Supported or [unverified]. A short follow-up pass should confirm the [unverified] rows (list in §9) before they become design premises.
- **One correction to carry forward.** A search summary said XAG 101's console minimum is 28 px. The primary page says **26 px at 1080p** for console. The 28 px figure is Amazon's TV guideline, which the Game Accessibility Guidelines quote. Do not cite 28 px as the XAG number.
- **Internal context.** I read these files for context only; none of them was changed:
  - v1's UI spec, [_design/master/09_ART_UI_AUDIO.md](../../../master/09_ART_UI_AUDIO.md);
  - the v1 complexity diagnosis, [research_notes/.../our_design_diagnosis.md](../../../../research_notes/Addictive%20tower%20game%20design%20research/our_design_diagnosis.md).

---

## 1. Menu depth and "one step away"

**F1.1 Start the game without climbing through menus (Strong).** The Game Accessibility Guidelines (GAG) list "Allow the game to be started without the need to navigate through multiple levels of menus" as a Basic-tier cognitive item. Their reason: deep menus are a barrier for players with dyspraxia or short-term memory impairment. Their example of good practice is Civilization V's quick-start option.
- https://gameaccessibilityguidelines.com/allow-the-game-to-be-started-without-the-need-to-navigate-through-multiple-levels-of-menus/
- https://gameaccessibilityguidelines.com/basic/

**F1.2 Always offer a way back, and more than one way to find things (Strong).** XAG 112 (UI navigation) asks for four things:
- every submenu keeps a persistent way back to the main or first interactive screen; Sea of Thieves shows "B: Back" bottom-left on every screen;
- large information sets (quest logs, bestiaries, big inventories) get more than one way to find an item; Minecraft has category tabs plus a search tab;
- a zoomed map gets a text list of points of interest; in Halo Infinite, picking a mission in the list moves the map focus to that mission;
- scaled text never forces scrolling in two directions.
- https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/112

**F1.3 Keep the same controls on every screen (Strong).** XAG 112 describes Sea of Thieves as keeping one interaction grammar on every menu: A select, B back, LT/RT pages, LB/RB tabs. It also keeps the prompts in the same screen corner and the same relative order. It warns that changing interaction methods between screens "would be very disorienting" for players.
- https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/112

**F1.4 Put the settings first, then stay out of the way (Strong).** XAG 112 recommends one of two approaches:
- a first-launch settings prompt; Minecraft Dungeons opens with text-to-speech, subtitles, enemy outline colour and chat-wheel type on the first screen;
- meeting every XAG by default at first launch.
- https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/112

**F1.5 Broad and shallow usually beats narrow and deep ([unverified]).** Nielsen Norman Group's "Flat vs. Deep Website Hierarchies" argues that flat (broad) structures are generally easier to use than deep ones, as long as each level stays scannable. The Hick–Hyman law says decision time grows with the log of the number of equal choices. That is a reason to keep each level short, but not a reason to add levels.
- https://www.nngroup.com/articles/flat-vs-deep-hierarchy/ [unverified]

**F1.6 v1 baseline (internal).** v1 already did two things right:
- diegetic hub stations with "a list as backup";
- an Esc/Start column with 9 entries.

But v1's first run asked a new player to learn about 22 bound verbs, 3 currencies and about 45 systems. The problem was never menu depth alone. It was how much there was to learn.
- 09_ART_UI_AUDIO §13.2
- our_design_diagnosis §1

## 2. Radial and single-screen menus

**F2.1 Radial "wheels" are standard for chat and quick picks, and they need readable labels (Strong).**
- XAG 101 treats the chat wheel as a primary communication tool: "For some, selecting text messages by using the chat wheel is more accessible than typing text messages". Its example is Sea of Thieves' wheel.
- The same guideline says wheel text must meet the minimum text size.
- https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/101

**F2.2 A radial needs a digital path too (Strong).** XAG 107 lays down three rules:
- every UI must work with digital input and single, non-simultaneous presses;
- players should not need two analog sticks to finish a mechanic;
- any gesture or path-based input needs another way to do the same thing.

A radial driven only by a stick flick needs a D-pad or list alternative that does the same job.
- https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/107

**F2.3 Pie menus are faster than lists, up to about 8 slices ([unverified]).**
- Callahan et al. (CHI 1988) found pie menus faster, with fewer errors, than linear menus for 8 items.
- Kurtenbach and Buxton's marking-menu studies (CHI 1993) found selection stays reliable up to about 8 items per ring, and gets error-prone past that, especially when rings are nested.
- https://dl.acm.org/doi/10.1145/57167.57182 [unverified]
- https://dl.acm.org/doi/10.1145/169059.169426 [unverified]

**F2.4 v1 baseline (internal).** v1's "Wheel" was a 360 px radial with 8 line slices plus an inner ring of 4 emotes. Each slice had an icon and a label.
- 09_ART_UI_AUDIO §13 (The Wheel)

## 3. Controller-first navigation

**F3.1 Every screen fully usable with digital input alone (Strong).** XAG 112 requires three things:
- every UI can be navigated with keyboard or controller digital input alone;
- focus order follows the visual layout;
- if the mouse can move focus onto an element, the same input can move it off.
- https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/112

**F3.2 Wrap-around rule (Strong).** In a linear menu (up/down only, or left/right only), moving past the last item returns to the first, and back again. Grids that move in all four directions should not wrap. XAG 112 also encourages a player option to turn looping on or off.
- https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/112

**F3.3 No holding a button just to keep focus (Strong).** XAG 107 points to Minecraft: sliders work with a single tap of A, then D-pad or stick. Some other games make you hold A while moving a slider, and the guideline flags that as a barrier.
- https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/107

**F3.4 Activate on release (Strong).** For pointer and touch input, XAG 107 says to activate on the up event, not the down event. A player can then slide off a button to cancel a mis-click. If there is no cancel, there must be an undo.
- https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/107

## 4. HUD minimalism and diegetic UI

**F4.1 Palia: the UI is a quiet frame, with a compass instead of a minimap (Supported).** Search summaries (pages not opened) report four points:
- Palia's UI aims to support the game content without overpowering the art, using flat graphics and soft gradients;
- a compass strip at the top replaces a minimap;
- a time-of-day widget sits at the top right;
- the UI team came from Riot, Blizzard and Boss Fight.
- https://www.tammydraws.com/palia (Supported)
- https://beginplay.warstellar.space/first-ui-screenshots-of-palia-the-cozy-mmo/ (Supported)

**F4.2 Palia's design pillar is pick-up-and-play (Supported).** A 2023 interview summary reports that pick-up-and-play and self-paced play were core pillars from the start. The aim was to welcome both core gamers and people with "15 minutes to unwind".
- https://massivelyop.com/2023/08/02/singularity-6-interview-palia-stakes-its-claim-as-the-cozy-cottagecore-sandbox-to-beat/ (Supported)

**F4.3 HUD text needs an outline or a plate, because the world behind it keeps changing (Strong).** XAG 101 and XAG 102 give four examples:
- Immortals Fenyx Rising outlines in-world prompt text ("Y Collect") in black;
- The Outer Worlds puts HUD text on opaque plates;
- For Honor uses a double outline, black then white, so icons read on both light and dark ground;
- Minecraft lets the player set the chat-background opacity.

Contrast over a changing background is measured against its lowest-contrast area.
- https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/101
- https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/102

**F4.4 A diegetic cue must be paired with a second channel (Strong).** XAG 103 says anything critical to gameplay or story that is shown visually needs at least one other sense, such as sound or haptics. Two examples:
- Grounded plays a sound when a new objective appears;
- Assassin's Creed Valhalla's scan pairs a gold ring with a spatial audio cue.

Haptics must never be the only extra channel.
- https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/103

**F4.5 The four kinds of game UI ([unverified]).** Fagerholt and Lorentzon's thesis *Beyond the HUD* (Chalmers, 2009) sorts game UI into 4 kinds:
- **diegetic:** exists in the world and the character can see it;
- **non-diegetic:** a classic overlay;
- **spatial:** placed in the 3D scene but not part of the fiction;
- **meta:** part of the fiction but not in 3D space, like blood on the screen.

Dead Space is the usual example of diegetic UI: health sits on the suit's spine.
- https://odr.chalmers.se/handle/20.500.12380/111921 [unverified]

**F4.6 Guide the player through the world, not with markers ([unverified]).** Ghost of Tsushima's "Guiding Wind" points to the chosen objective by blowing grass and leaves, instead of showing a big waypoint marker. Birds and foxes lead the player to points of interest. Sucker Punch talks about this in their GDC talks. Journey and Sky are also often cited for guiding players with light and landscape, with almost no HUD.
- https://www.gdcvault.com/ (search "Ghost of Tsushima") [unverified]

## 5. Inventory simplification

**F5.1 More than one way to find a thing (Strong).** XAG 112 wants big inventories to have more than one way to find an item. Its example is Minecraft: 4 filter tabs plus a search tab.
- https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/112

**F5.2 Pair every icon with text; show "missing" in more than one way (Strong).** XAG 103's Grounded crafting example uses four cues together:
- each category tab pairs an icon with its text label (a hammer for Tools, a plus for Health);
- a missing ingredient shows a red count;
- a caution triangle marks the item;
- the words "x0 Available" spell it out.
- https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/103

**F5.3 Automate small chores (Strong).** XAG 107 cites two examples of simpler controls:
- Diablo Immortal's auto pick-up, per rarity tier;
- Call of Duty: Mobile's "simple" fire mode.

The guideline's general point: offer simplified control schemes that cut the number of inputs needed.
- https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/107

**F5.4 Locked is not only grey (Strong).** Sea of Thieves shows locked shop items greyed out and chained, with a lock symbol. Forza Horizon adds the words "Not available" and a lock. Inactive text still needs a contrast of 3:1.
- https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/103
- https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/102

**F5.5 Cozy-game inventories grow with the player ([unverified]).** Animal Crossing: New Horizons starts with a small pocket and sells pocket upgrades through Nook Miles. Items stack. There is no weight or durability math on clothes or furniture. (Tools do break.)
- https://www.animal-crossing.com/new-horizons/ [unverified]

## 6. Readable text sizes and contrast

**F6.1 Minimum default text sizes, XAG 101 (Strong).** Size means body height, from the lowest descender to the highest ascender.

| Platform | Minimum default size |
|---|---|
| Console | 26 px at 1080p, 52 px at 4K |
| PC/VR | 18 px at 1080p, 36 px at 4K |
| Mobile and game streaming | 18 px at 100 DPI, 36 px at 200 DPI, 72 px at 400 DPI (scale with DPI) |

Two more rules:
- Text inside glyphs (the "X" inside a button icon) must also meet the minimum.
- Icons scale with text up to 200%.

Platform magnifiers do not count as a fix.
- https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/101

**F6.2 Scaling, spacing, case (Strong).**
- **Scaling:** text scales up to 200% of the minimum with no loss of content. Headers stay visibly different from body text.
- **Fonts:** at least one sans-serif option.
- **Spacing,** when the player cannot adjust it:

| Measure | Rule |
|---|---|
| Line width | ≤ 80 characters (≤ 40 for CJK) |
| Line spacing | ≥ 1.5 |
| Paragraph spacing | ≥ 2× the line spacing |
| Letter spacing | ≥ 0.12× the font size |
| Word spacing | ≥ 0.16× the font size |

- **Case and alignment:** lines of text in sentence case, not all caps. Left-aligned, not centred or justified.
- https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/101

**F6.3 The TV figure (Strong).** GAG's font-size guideline quotes Amazon's TV guideline: 28 px minimum on a 1080p screen, "as a minimum rather than a target".
- https://gameaccessibilityguidelines.com/use-an-easily-readable-default-font-size/

**F6.4 Contrast ratios, XAG 102 (Strong).**

| Element | Minimum contrast |
|---|---|
| Standard text and important visual elements | 4.5:1 |
| Large text (console 52 px, PC 36 px at 1080p) | 3:1 |
| Inactive-element text | 3:1 |
| Placeholder and input text | 4.5:1 (3:1 if large) |
| Everything, in high-contrast mode | 7:1 |

More rules from the same page:
- Measure against the lowest-contrast part of a busy background.
- Keep text out of images. Text should be a live UI element, so it can be re-coloured, scaled and read by narration.
- Read the platform's high-contrast setting at launch.
- https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/102

**F6.5 v1 baseline (internal).** Several v1 sizes fall below the XAG console floor of 26 px:
- the smallest text allowed anywhere was 16 px, below even the PC floor of 18 px;
- body text was 20 px;
- the pinned rule chip was 16 px;
- name tags were 22 px;
- world prompts were 28 px, which passes.
- 09_ART_UI_AUDIO §12.4, §13.5, §14

## 7. Colour-blind safety

**F7.1 Prevalence and approach (Strong).** GAG says difficulty with red or green affects about 8–10% of males. Its advice:
- use colour only as backup to text, symbols, patterns or shapes;
- offer presets for deuteranopia, protanopia and tritanopia, plus custom colour choice;
- orange against blue works across the three common types;
- avoid full-screen colour filters, which "typically receive negative feedback".

It cites games including Destiny, FTL, For Honor, RuneScape and Splatoon.
- https://gameaccessibilityguidelines.com/ensure-no-essential-information-is-conveyed-by-a-fixed-colour-alone/

**F7.2 If colour carries the meaning, the player can change it (Strong).** XAG 103 cites Call of Duty: Black Ops Cold War, where map-triangle colours are player-chosen for self, allies, enemies and party. Battlefield 2042 (in XAG 102) has presets plus a custom picker, with a preview in dark, midtone and bright scenes. XAG 103 also notes that cataracts, which also affect colour perception, are more common than colour blindness.
- https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/103
- https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/102

**F7.3 A known colour-blind-safe set: Okabe–Ito ([unverified] this session).** Okabe and Ito's "Color Universal Design" palette has 8 colours:

| Name | Hex |
|---|---|
| black | #000000 |
| orange | #E69F00 |
| sky blue | #56B4E9 |
| bluish green | #009E73 |
| yellow | #F0E442 |
| blue | #0072B2 |
| vermillion | #D55E00 |
| reddish purple | #CC79A7 |

- https://jfly.uni-koeln.de/color/ [unverified]

Colour Blind Awareness gives about 1 in 12 men and 1 in 200 women.
- https://www.colourblindawareness.org/colour-blindness/ [unverified]

**F7.4 The four most common complaints (Strong).** GAG: "The four most commonly complained about accessibility issues are remapping, text size, colorblindness, and subtitle presentation."
- https://gameaccessibilityguidelines.com/basic/

## 8. Remapping and input load

**F8.1 In-game remapping even when the platform offers it (Strong).** XAG 107 says players should be able to remap all controls inside the game, whatever the platform offers. That includes:
- analog and digital controls;
- per-stick X and Y inversion;
- PC's Esc key.

Ideally players remap *actions*, not just swap buttons. Hints, tips and tutorials must show the new binding. For KNOTWELL this means Steam Input alone is not enough.
- https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/107

**F8.2 Holds, mashing and chords (Strong).** XAG 107 flags three kinds of input as barriers:
- holding an input for about 2–3 s or more;
- quick-time events and mashing;
- pressing two buttons at once.

When they cannot be avoided, it wants a less demanding alternative, or a way to skip. Examples:
- The Long Dark's "accessible interactions" turns every hold into a press;
- Gears 5 lets players choose between tap and hold;
- Minecraft offers auto-jump.

Analog sensitivity should adjust by at least ±50%.
- https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/107

**F8.3 The GAG Basic list is short and cheap (Strong).** Motor Basic items include:
- remappable controls;
- adjustable sensitivity;
- "controls as simple as possible";
- all UI reachable with the same input as gameplay.

Cognitive Basic items include:
- interactive tutorials;
- simple clear language;
- text at the player's own pace;
- starting without deep menus.

General items include "all settings saved". GAG says these serve the most players at the lowest cost.
- https://gameaccessibilityguidelines.com/basic/

**F8.4 Unity implementation path ([unverified] this session).** Unity's Input System supports interactive rebinding (`PerformInteractiveRebinding`). It can save and load overrides as JSON (`SaveBindingOverridesAsJson` / `LoadBindingOverridesFromJson`), and it ships a "Rebinding UI" sample. `InputControlPath`/binding display strings let on-screen prompts follow the remap.
- https://docs.unity3d.com/Packages/com.unity.inputsystem@1.11/manual/ActionBindings.html [unverified]

## 9. How cozy MMO-lite games keep social and shop features one step away

**F9.1 Palia (Supported / [unverified]).** From the search summaries in §4:
- a compass-plus-clock HUD;
- a pick-up-and-play pillar;
- no combat at all.

From memory, [unverified]:
- the premium cosmetic shop is a tab in the main menu;
- in-world stores are NPC stalls in the village;
- each world instance holds a modest number of players (about 25).
- https://www.mmorpg.com/previews/preview-palia-brings-the-cozy-vibes-with-its-community-sim-mmo-2000128604 (Supported)
- https://en.wikipedia.org/wiki/Palia [unverified]

**F9.2 Animal Crossing: New Horizons ([unverified]).** Every personal feature is 1 button away: ZL opens the NookPhone, a single grid of apps (camera, Nook Miles, DIY recipes, map, chat log, and more).
- The main shop is a building in town. The terminal (Nook Stop) is in the town hall.
- Online play starts at a diegetic place, the airport. Up to **8 players** can be on one island online, the same cap as KNOTWELL's lobbies.
- https://www.animal-crossing.com/new-horizons/ [unverified]

**F9.3 Sky: Children of the Light ([unverified]).** Other players first appear as anonymous, featureless figures. You light a candle toward one to start a friendship. Holding hands, emotes and, later, text chat unlock step by step along a friendship tree. So the social tools arrive one at a time, not all on day one. The game teaches almost entirely without words.
- https://en.wikipedia.org/wiki/Sky:_Children_of_the_Light [unverified]
- https://www.gdcvault.com/ (thatgamecompany talks on Sky) [unverified]

**F9.4 The shared pattern (my synthesis, not a sourced claim).** All three put the same features in two places:
- **in the world:** a shop in town, a place for friends (airport, candle, plaza);
- **on one personal button:** NookPhone, menu tab, emote ring.

Players who explore find the place. Players in a hurry press the button. Nothing lives only in a menu, and nothing lives only in the world.

### Claims to confirm before citing (the "do not re-cite yet" list)

F1.5, F2.3, F4.5, F4.6, F5.5, F7.3, F8.4, F9.1 (memory parts), F9.2, F9.3. Do not quote 28 px as an XAG number (see "One correction to carry forward" above).

---

## Design implications for KNOTWELL v2

These are proposals for the synthesis. Numbers are hypotheses until a greybox playtest measures them.

**1. Make "2 inputs from play" literal, with one ring and one book.**
- **Controller:** hold one button to open an 8-slice ring. Flicking to a slot is the second input.
  - The slots: Journal, Map, Bag, Friends, Wardrobe & Shop, Emotes, Photo, Settings.
  - 8 slices is the upper bound for a reliable ring (F2.3).
- **Keyboard:** each slot also gets a direct key, which is 1 input.
- **For D-pad-only and switch players:** the same 8 entries exist as tabs in one full-screen book. LB/RB move between tabs and wrap, because tabs are a linear list (F2.2, F3.2).
- **Enforce it:** add an acceptance test that walks the UI graph and fails if any feature is more than 2 inputs from gameplay.

**2. One button grammar everywhere.**
- A / Space / Enter confirms, B / Esc goes back, LB/RB change tabs.
- The prompts always sit bottom-left, in the same order (F1.3).
- From any screen, Back returns to play in at most 2 presses (F1.2).
- No screen needs a held button to keep focus (F3.3).
- Mouse clicks fire on release (F3.4).

**3. A 4-element default HUD, with the world doing the rest.**
- **Default HUD:**
  - one objective line, ≤ 10 words, top-left, always on (P1);
  - a compass strip at the top with the tracked quest, party-member pips and town icons, instead of a minimap (F4.1);
  - a context prompt when something can be used;
  - a small toast area.
- **Everything else shows only on change:** currency on gain, hotbar on tool use.
- **Frog status is diegetic:** the frog's firefly glow brightens and dims.
- **The rule from F4.4:** every diegetic cue also has a sound, and a text or icon twin in the Journal. The world can show the story, but it can never be the only place the player can learn what to do.

**4. Let fireflies do the waypoint job, in-fiction.**
- A "Guide" press sends a small trail of fireflies toward the tracked objective, for about 6 s. This follows Ghost of Tsushima's wind (F4.6, [unverified]).
- The trail is paired with a soft chime that pans toward the goal (F4.4).
- This serves P1 (what next) and P2 (the guide is part of the frog world, not a floating arrow).

**5. Raise the text floor to the console standard.**
- Steam Big Picture and TV play are in scope, so use XAG's console number: **26 px at 1080p minimum for all read text**. That covers name tags, quest text, prompts and chat. Body text is 28 px.
- Text scales 100–200% with icons (F6.1), and there is a sans-serif font.
- Sentence case for any line of text. All caps is fine only for 1–2 word labels.
- Lines ≤ 80 characters, line spacing ≥ 1.5 (F6.2).
- v1's 16 px minimum, 16 px rule chip and 22 px name tags all fail this and should not carry over (F6.5).
- Steam Deck is a handheld at about 216 DPI. Check it against XAG's mobile scale (about 39 px at that DPI). That figure is my own calculation from F6.1's formula.

**6. Contrast by construction, not by luck.**
- All HUD and world-prompt text sits on a plate or gets a 2-tone outline (F4.3). It must reach 4.5:1 against the lightest part of the scene behind it.
- A high-contrast mode reaches 7:1 (F6.4).
- No text baked into sprites. Agents build all text as live UI Toolkit labels, so they scale, localize and re-colour.
- Reuse v1's golden-screenshot contrast test idea, with the XAG thresholds.

**7. Never let colour carry meaning alone. Give the 8 players shape + colour.**
- Each of the 8 lobby slots gets a colour *and* a glyph. v1 already had seat glyphs, so keep them.
- Quest types differ by icon shape as well as tint. For example, a story quest could be a firefly jar and a town favour a lily pad.
- Build the player and quest palette from Okabe–Ito-style hues ([unverified] F7.3), leaving out black, which does not read in a dark well.
- Offer deuteranopia, protanopia and tritanopia presets plus custom colours, with a live preview. No full-screen filter (F7.1, F7.2).

**8. At most 6 verbs to start, and every one of them remappable.**
- **Target:** controlling a frog within 60 s (P4) with these verbs only: move, camera, jump, tongue (use/grab/talk), croak (call/emote), and the ring. Compare v1's 22 verbs (F1.6).
- **Unlock order:** new verbs unlock one at a time through story quests, each taught by doing (F8.3).
- **Remapping:** full remapping of actions in the game, saved as JSON through Unity's Input System, with prompts that update (F8.1, F8.4).
- **Input load:** no chords, no mashing. Every hold over 1 s has a toggle or tap option (F8.2).

**9. First launch: one settings card, then the world.**
- First launch shows a single card: text size, subtitles, colour mode, and the controller or keyboard layout picture. It follows Minecraft Dungeons (F1.4).
- Every later launch opens with "Continue" focused, so 1 input puts you back in the world (F1.1).
- Invites and joining a friend go through the Steam overlay and the Friends tab. A join-in-progress friend hatches next to the host, so no menu screens stand between an invite and play.

**10. Social and shop, both in the world and on one button.** This is the F9.4 pattern.
- **Friends:**
  - a plaza or well-mouth gathering place in each town;
  - the Friends ring slot, which lists the 8 lobby frogs with where they are, "go to" and "invite";
  - the emote ring on the croak button.
- **Social tools unlock in stages, following Sky ([unverified] F9.3):**
  - wave and emote from minute 1;
  - quick phrases after the first town;
  - free text chat opt-in in Settings.
- **Shop:**
  - a real stall keeper in the first town (a character, per P3);
  - the same stock in the Wardrobe & Shop slot, with live try-on;
  - one visible currency, no nested bundles, and a lock icon plus text on items you cannot buy yet (F5.4).
- **Party-game hook:** the archived party-game side mode, if it ever returns, gets only a town noticeboard entry. It gets no ring slot.

**11. One bag, no chores.**
- **The bag:** auto-stack and auto-sort, with at most 5 category tabs, each with icon + word.
- **No bookkeeping:** no weight, no durability.
- **Quest items:** they live in the Journal, never in the bag.
- **Search:** once the bag or a vendor list passes about 40 entries, add a text search or filter (F5.1).
- **New items:** a "new" dot marks each one and clears when you look at it.
- **Crafting shortfalls:** show missing items with a count, an icon and words, not red alone (F5.2).

**12. Map and Journal are one system with two views.**
- Choosing a quest in the Journal centres the Map on it. Choosing a pin on the Map opens its Journal entry.
- The Map has a text list of places beside it, like Halo Infinite (F1.2), so a player never has to scan a big map to find a town.
- Tracked quest = compass marker = firefly guide target. This is one source of truth, which also serves P1.

---

## Numbers worth using

| # | Number | What it is for | Source | Strength |
|---|---|---|---|---|
| N1 | **26 px** at 1080p (52 px at 4K), console | Minimum default text (body height); use for all KNOTWELL read text | https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/101 | Strong |
| N2 | **18 px** at 1080p (36 px at 4K), PC | PC-only floor; below what TV play needs | same | Strong |
| N3 | 18 / 36 / 72 px at 100 / 200 / 400 DPI | Handheld scale; about 39 px on a ~216 DPI Steam Deck (my calculation) | same | Strong (calc: mine) |
| N4 | Scale text and icons to **200%** | Text-size setting range | same | Strong |
| N5 | Line ≤ **80** characters (40 CJK); line spacing ≥ **1.5**; paragraph ≥ **2×** line; letter ≥ **0.12×**; word ≥ **0.16×** | Journal, dialogue and quest text layout | same | Strong |
| N6 | **28 px** at 1080p TV "as a minimum rather than a target" | Amazon TV figure quoted by GAG | https://gameaccessibilityguidelines.com/use-an-easily-readable-default-font-size/ | Strong |
| N7 | **4.5:1** standard; **3:1** large (52 px console / 36 px PC) and inactive; **7:1** high-contrast mode | Contrast rows for golden-screenshot tests | https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/102 | Strong |
| N8 | Include a pixel in the size measurement only if it is > **2:1** against the background | How to measure outlined text | https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/101 | Strong |
| N9 | **8–10%** of males have red/green difficulty | Why colour must never carry meaning alone | https://gameaccessibilityguidelines.com/ensure-no-essential-information-is-conveyed-by-a-fixed-colour-alone/ | Strong |
| N10 | 1 in **12** men, 1 in **200** women | Colour-blind prevalence | https://www.colourblindawareness.org/colour-blindness/ | [unverified] |
| N11 | Holds of **2–3 s** or more are a barrier; long press **< 3 s**; sensitivity **±50%** | Input rows: hold-to-toggle, sensitivity slider range | https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/107 | Strong |
| N12 | **4** most-complained issues: remapping, text size, colour blindness, subtitles | Priority order for the accessibility slice | https://gameaccessibilityguidelines.com/basic/ | Strong |
| N13 | Linear menus wrap; 4-direction grids do not | Focus rules | https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/112 | Strong |
| N14 | **1** extra sense for every critical visual or audio cue (haptics never alone) | Cue design rule | https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/103 | Strong |
| N15 | ≤ **8** items per radial ring | Size of the ring and emote wheel | https://dl.acm.org/doi/10.1145/169059.169426 | [unverified] |
| N16 | **8** players online on one island | Cozy precedent for an 8-player shared world | https://www.animal-crossing.com/new-horizons/ | [unverified] |
| N17 | "**15 minutes** to unwind" session framing | Palia's pick-up-and-play target; a hint for KNOTWELL session length | https://massivelyop.com/2023/08/02/singularity-6-interview-palia-stakes-its-claim-as-the-cozy-cottagecore-sandbox-to-beat/ | Supported |
| N18 | v1: **22** bound verbs; **16 px** minimum text; **9**-entry Esc column | Internal baseline to beat (target: ≤ 6 starting verbs, 26 px floor, 8 ring slots) | our_design_diagnosis §1; 09_ART_UI_AUDIO §12.4, §13.2 | Internal |

<!-- END -->
