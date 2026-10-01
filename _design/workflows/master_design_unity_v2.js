export const meta = {
  name: 'master-design-unity-v2',
  description: 'Unity master design: name research (web), integration plans, judges + chair DECISIONS.md, 11 parallel writers, 8 checkers each refuted, revisers, final gate + README',
  phases: [
    { title: 'Explore', detail: 'name research with web collision checks + 3 integration planners' },
    { title: 'Judge', detail: '3 judges, chair writes DECISIONS.md' },
    { title: 'Write', detail: '11 writers produce the master design set' },
    { title: 'Verify', detail: '8 checkers, each refuted by an independent skeptic' },
    { title: 'Revise', detail: 'per-file revisers apply confirmed issues' },
    { title: 'Gate', detail: 'cross-file gate + README coverage table' },
  ],
}

async function run(prompt, opts, tries = 3) {
  for (let i = 1; i <= tries; i++) {
    const p = i === 1 ? prompt : prompt + '\n\n(Retry ' + i + ': a previous attempt died mid-way; inspect any files you were writing before acting, and continue rather than restart.)'
    const r = await agent(p, i === 1 ? opts : { ...opts, label: opts.label + '#' + i })
    if (r) return r
    log(opts.label + ' failed (attempt ' + i + '/' + tries + ')')
  }
  return null
}

const ROOT = 'C:/Users/mrkl6/Downloads/Projects/Team CO-OP/make me a name'
const D = `${ROOT}/_design`
const M = `${D}/master`

const USER = `
# WHAT THE USER ASKED FOR (verbatim, typos kept) — the ultimate acceptance criteria
1: "I don't know a great name for this folder and project so name it for me. i want to make a game with this folder as a reference there are quite a few ideas already but the concept is to combine all those amazing team games, mafia, among us, chained, peak, etc... many of this CO-OP games modes and time and so on. with various skins (to make it unqiue and possibly make some money) so that and shop and so on. so design and make a game with some of these ideas in mind. MAke it soemthing unqiue out of them. also an idea i thought of was a maze dungeon as in many levels levels are randomized players all play and they can meet in different levels as they go like 1a 1e 1b etc... options with door every levels and they have to complete challenges or beat puzzles or kill challenging monsters that have weird clearing conditions (not traditional fighting cause they might have different skills etc...) and they can icnrease there powers or soemthing this idea is based on a korean light novel [The Tutorial Is Too Hard: lone protagonist, barely a few teams, brutal, players can sabotage, team up] there are so many great ideas tower etc... the design has to be top tier etc... the visuals the aniamtion and so on. get creative with it. ... so this is the main game and mini sidegames to lighten up etc... be creative"
2: "you can maximize agents, though make sure it doesn't go astray. and verification and refute and so on multiple layers. also other skills. also it can be tower design, dungeon design we can build multiple, can also be maze with dungeons basically layerz upon layers from center to outwards circle. it is like frog in a well, comes out of well sees the sky, then go to sky sees space, then space see more bigger scenese etc.... anywayhs some cconcepts for reference that's all."
3: "the game doesn't feel fun or addicting or attractive, do some research and analyze those related genre, korean, english light novels" / "it should feel immersive and addicting and fun, feel progress etc.."
4: "doing unity based game is smarter, continue"
Reference folder TEAMBOUND_13 (user's previous physics co-op game): modes Summit, Chained ascent, One Body, Echo Chamber, Downstream raft, Deep Dive, Delivery, Tower of Babel.
`

const SOURCES = `
# SOURCES (read with Read; long files in chunks with offset/limit; Grep for headings)
BINDING (override everything older where they conflict):
- ${D}/FUN_OVERHAUL.md — the binding design direction (diagnosis, fantasy + hero, core loop timings, power curve, felt meta progression, social design, first 10 minutes, KEEP/CUT/SIMPLIFY/ADD, monetization, top-15 changes). READ FULLY FIRST.
- ${ROOT}/reports/Addictive tower game design research.md — fact-checked research behind it.
- ${ROOT}/reports/Unity co-op party game tech stack.md — the binding tech stack: Unity 6.3 LTS (6000.3.25f1, installed), URP 17, NGO 2.x host mode + Facepunch Steam transport, host-owned bots, agent-owned HLSL toon shader, Shuriken particles, PrimeTween, Cinemachine 3, Animation Rigging, CC0 libraries (Quaternius/KayKit/Kenney), data + generators + seeds, Unity CLI for compile/test/build/screenshots.
RAW MATERIAL (re-home, re-theme, cut per the overhaul):
- ${D}/GDD.md (older "KNOTSPIRE" design: candle Wicks, 12 rooms + boss with full specs, bots, traits, minigames, 60 cosmetics, art/UI/audio) and ${D}/GDD_CRITIQUE.md.
- ${D}/WORLD_STRUCTURE.md (concentric Well -> Sky -> Space -> Beyond world, reveals, ring map).
- ${D}/inputs/ (saved name study with web collision checks; hero debate: candle vs frog vs glow-frog).
- ${ROOT}/research_notes/ (the fact-checked notes behind both reports).
`

const FILES = [
  { f: '00_OVERVIEW.md', about: 'Final name + tagline + rationale and 3 runner-ups (with collision evidence), elevator pitch (one sentence + one paragraph), pillars (each about fun/progress/immersion), what is unique vs inspirations (table), the hero in one paragraph, the core loop at every scale with timings (first laugh, first reward, first power spike, room, floor, run, session), glossary (<= 30 player-facing terms), the VERTICAL SLICE checklist (MUST/SHOULD/LATER) and build order with milestones and playtest gates (e.g. the 10-minute greybox feel test). ~3-4k words.' },
  { f: '01_WORLD.md', about: 'The concentric layered world (frog in a well): layer table (name, theme, format tower/dungeon/maze, new movement power + new room types + new social rule per layer, palette hex, music), how floors/landings/doors work, door plaques (reward icon, suit/type, difficulty number, rare gold doors, hidden rooms), seeded generation algorithm with parameters and pseudo-code, how players and bots meet in sub-levels (1A/1B/1E) in solo and multiplayer, layer crowns/bosses, the steerable scale-reveal moments (shot-by-shot, how to fake scale in Unity URP: nested skyboxes, shells, fog, floating origin), and the map UI.' },
  { f: '02_HERO_AND_CONTROLS.md', about: 'The hero (final decision): proportions in metres, how it is built (Blender-python or procedural mesh, minimal rig, attach points), face/expression system, the fragile-health axis AND the growing power axis shown on the body (silhouette grows with power), every verb with exact numbers (<= 8 context-sensitive verbs; speeds, jump heights, cooldowns, stamina if any), keyboard/mouse + gamepad bindings, health/down/revive/fall/respawn rules, full animation list (CC0 clips + procedural layers: squash/stretch, spring bones, IK) with timings.' },
  { f: '03_SOCIAL_AND_BOTS.md', about: 'Co-op by default, betrayal as spice: the one/two betrayal verbs, tells, betrayal cam replay, contained costs, the victim ghost + guaranteed Vengeance quest, heart/betrayal rooms whose rules announce betrayal, votes (>=5 voters, bots fill), shared-fate gimmicks, blame tags/replays, anti-griefing guard rails; the System voice (sarcastic, 30+ sample lines by situation) and the capped audience/watcher layer if kept; bots: 4+ personality archetypes, named roster with signature lines, door choice, bark lines per situation (5+ per category), betrayal decision model, and Explore/Theorise/Execute gating so bots never solve rooms for a first-time human.' },
  { f: '04_PROGRESSION_ECONOMY.md', about: 'In-run power curve with numbers per room/floor (pick-1-of-3 at every clear, in-room pickups, power level visible on the body, duo/team synergies), trait list (20+ with exact effects, stacking, synergies), per-player hidden classes with odd unlock conditions, felt meta progression (Tower Rank F->SSS ceremony, small permanent talent tree, codex/bestiary), results ceremony (every death pays: meters in order), currencies (one run + one meta + mocked premium), earn rates, prices, sinks, and a balance sanity table.' },
  { f: '05_ROOMS_SLICE.md', about: 'Full specs for every room in the vertical slice (typically Layer 1 plus a taste of Layer 2) and the slice crown/boss. For EACH: id (snake_case), door suit/type, difficulty number, display name, fantasy line, arena layout (metres, prop positions, ASCII map), the DOORS-style cue + one rule monster or puzzle, CLEAR condition (plain first time; optional decode-for-bonus on repeats), fail condition, hidden clear + its bonus, shared-fate gimmick, betrayal hook (if any), power display moment (what feels great to do with your powers here), solo vs group scaling, bot plan (explore/theorise/execute), rewards, codex entry, System lines on entry/clear/death, SFX/music cues, Unity implementation notes (prefab pieces, components, NetworkVariables, test hook for auto-solve).' },
  { f: '06_ROOMS_LATER.md', about: 'One-paragraph concepts for 20+ further rooms across all layers (Well, Sky, Space, Beyond) and their crowns, grouped by layer and suit, keeping the user\'s favourite monsters (Echo Golem, Chrono-Slime, Mimic, Karmic Executioner, Weight of Guilt, Glitched Watcher, Harmony Sentinel, Liar\'s Banquet, Paradox Mirror) and TEAMBOUND mode homages (chained ascent, one body, raft, dive, Tower of Babel).' },
  { f: '07_HUB_AND_MINIGAMES.md', about: 'The landing/hub between floors and the lobby: layout, stations (shop, wardrobe mirror, trait altar if any, door hall), pacing (never idle waiting), and 4 minigames that lighten the mood with precise rules, controls, scoring, rewards, bot behaviour and which reference modes they homage.' },
  { f: '08_COSMETICS_SHOP.md', about: 'Cosmetic slots for the hero, a catalogue of ~60 items (id, name, slot, rarity, price or unlock, precise visual description buildable from primitives/Blender/CC0), rarities, daily rotation, bundles, the non-expiring season pass (free + premium tracks), earned-only prestige items (loyalty/betrayal/rank), ethics rules (cosmetic only, no paid randomness, generous earn rates), store/capsule notes.' },
  { f: '09_ART_UI_AUDIO.md', about: 'Art direction per layer (palette hex, lighting recipes in URP terms, toon shader params: ramp, rim, outline, SSAO, bloom, LUT; fog; skies), character rendering, readability rules (bright pushed colours, self-lit tells), VFX list (Shuriken), camera behaviour (Cinemachine 3), juice rules (hitstop ms, shake, squash); UI language (System windows) with every screen wireframed (title, lobby, map, landing HUD, room HUD, door plaque, results ceremony, shop, wardrobe, codex, settings, pause) and the UI tech (UI Toolkit or uGUI, fonts); audio: music per state/layer, SFX list with sources (Kenney CC0 / synthesized), mixer rules.' },
  { f: '10_UNITY_TECH.md', about: 'The Unity architecture that maps the design to code: project layout and assemblies (Game.Core, Game.Tower, Game.Rooms, Game.Bots, Game.Net, Game.UI, Game.Editor, tests), bootstrap scene + data-driven prefabs, ScriptableObject definitions (rooms, traits, cosmetics, bots), the seeded generator, NGO host topology (what is a NetworkVariable/RPC, authority rules, hidden info only to owners), bots as host-owned NetworkObjects, character controller + physics approach (kinematic controller, server props, cosmetic client ragdoll), the room framework contract (IRoom lifecycle, clear/fail, auto-solve test hooks), content generation via editor scripts ([CliCommand]/batchmode), the agent verification loop (unity recompile/test/build/screenshot gates), performance budgets, the NGO-vs-FishNet physics proof of concept, and a milestone plan with acceptance gates.' },
]

const NAME_SCHEMA = { type: 'object', properties: {
  candidates: { type: 'array', items: { type: 'object', properties: {
    name: { type: 'string' }, meaning: { type: 'string' }, fit_concept: { type: 'number' }, memorability: { type: 'number' }, capsule_readability: { type: 'number' },
    collisions: { type: 'string' }, search_evidence: { type: 'string' }, tagline: { type: 'string' } },
    required: ['name', 'meaning', 'fit_concept', 'memorability', 'capsule_readability', 'collisions', 'search_evidence', 'tagline'] } },
  top_pick: { type: 'string' }, reasoning: { type: 'string' },
}, required: ['candidates', 'top_pick', 'reasoning'] }

const DECISION_SCHEMA = { type: 'object', properties: {
  name: { type: 'string' }, tagline: { type: 'string' }, name_reasoning: { type: 'string' },
  hero: { type: 'string' }, hero_reasoning: { type: 'string' },
  fantasy_sentence: { type: 'string' },
  integration_base: { type: 'string' }, grafts: { type: 'array', items: { type: 'string' } }, cuts: { type: 'array', items: { type: 'string' } },
  slice_scope: { type: 'string' }, slice_rooms: { type: 'array', items: { type: 'string' } }, notes: { type: 'string' },
}, required: ['name', 'tagline', 'name_reasoning', 'hero', 'hero_reasoning', 'fantasy_sentence', 'integration_base', 'grafts', 'cuts', 'slice_scope', 'slice_rooms', 'notes'] }

const ISSUE_SCHEMA = { type: 'object', properties: {
  issues: { type: 'array', items: { type: 'object', properties: {
    id: { type: 'string' }, severity: { type: 'string', enum: ['critical', 'major', 'minor'] }, file: { type: 'string' }, where: { type: 'string' },
    problem: { type: 'string' }, fix: { type: 'string' } }, required: ['id', 'severity', 'file', 'where', 'problem', 'fix'] } },
  summary: { type: 'string' },
}, required: ['issues', 'summary'] }

const REFUTE_SCHEMA = { type: 'object', properties: {
  verdicts: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, real: { type: 'boolean' }, reason: { type: 'string' }, better_fix: { type: 'string' } }, required: ['id', 'real', 'reason'] } },
}, required: ['verdicts'] }

// ------------------------------------------------------------------ Explore
phase('Explore')
// The explore phase already ran in an earlier session; its outputs are saved on disk.
log('explore: reusing saved name studies and integration plans from _design/inputs/master_explore')
const EXPLORE_DIR = `${D}/inputs/master_explore`
const BUNDLE = `

THE EXPLORE PHASE ALREADY RAN. Read its saved outputs (Read tool) before deciding:
- ${EXPLORE_DIR}/name_0.md and name_1.md: two name studies with real WebSearch collision evidence (top picks SKYFLOOR and KNOTWELL).
- ${EXPLORE_DIR}/plan_0.md (fidelity-first), plan_1.md (fun-first), plan_2.md (Unity-buildability-first): integration plans.
- ${EXPLORE_DIR}/judge_2.md: the creative-director judge's decision from the earlier run (name KNOTWELL, Firefly Frog, 31 slice rooms).
The Unity project folder will be named after the final title (currently KNOTWELL/ in the project root).`

// ------------------------------------------------------------------ Judge
phase('Judge')
const JUDGES = [
  'a veteran player, streamer and Korean-manhwa fan who weighs FUN, addiction, felt progress, clip-ability and faithfulness to the user\'s words most heavily',
  'an executive producer + Unity technical director who weighs buildability of a top-tier slice by AI agents in Unity, scope risk, commercial strength (Steam capsule, skins, price) and name availability (collision evidence) most heavily',
  'a creative director who weighs coherence of fiction + mechanics + art, uniqueness, an iconic hero silhouette, and how every system serves the fun engine and the layered world most heavily',
]
const decisions = (await parallel(JUDGES.slice(0, 2).map((j, i) => () => run(`You are a judge: ${j}.\n${USER}\n${SOURCES}\nDecide: final NAME (+ tagline), HERO (FUN_OVERHAUL recommends the Firefly Frog behind two human playtest gates; no human testers exist yet, so the build commits to the Firefly Frog now and keeps the Wick-with-Flame-axis as a documented fallback — deviate only with a decisive reason), the one-sentence fantasy, the integration base plan + grafts + cuts, slice scope, and slice room ids. The user's own words outrank any panel. Be decisive and specific.${BUNDLE}`, { label: `judge:${i}`, phase: 'Judge', schema: DECISION_SCHEMA })))).filter(Boolean)

await run(`You are the CHAIR of the design council. Resolve the three judges' decisions into ONE set (majority wins; if split three ways, the stronger argument; the user's own words and FUN_OVERHAUL.md outrank the panels). Create the folder ${M}/ and write ${M}/DECISIONS.md with the Write tool: final name + tagline + one-paragraph rationale citing collision evidence + 3 runner-ups; final hero + rationale; the one-sentence fantasy; the unified structure summary (~600 words); the slice room roster table (id, display name, layer, suit/type, difficulty, one-line fantasy, status MUST/SHOULD/LATER, source: GDD room / re-themed / new); systems kept/changed/cut; the file plan (${FILES.map((x) => x.f).join(', ')}) with one line each; and a glossary (<= 30 terms) all writers must use. Return the full text of DECISIONS.md.\n${USER}\n${SOURCES}\n\nJUDGE DECISIONS:\n${JSON.stringify(decisions, null, 1)}${BUNDLE}`, { label: 'chair', phase: 'Judge' })

// ------------------------------------------------------------------ Write
phase('Write')
const WRITE_RULES = `You are one of ${FILES.length} writers producing the MASTER DESIGN SET in ${M}/ for the UNITY game. FIRST read ${M}/DECISIONS.md completely — its decisions (name, hero, fantasy, terms, roster, scope) are binding; use its glossary terms exactly. Then read FUN_OVERHAUL.md fully and the relevant parts of the other sources, and re-home/re-theme their content to the decisions. You write ONLY your file (Write tool; for a long file create it then append sections with Edit). Be precise and buildable: numbers, ids, metres, seconds, hex colours, exact rules. Every section must serve fun, felt progress, immersion and attraction; do not reintroduce bureaucracy the overhaul cut. No "TBD" unless marked LATER. If you believe a decision is wrong, follow it anyway and add a short "Open questions" section at the end.\n${USER}\n${SOURCES}`
const written = await parallel(FILES.map((F) => () => run(`${WRITE_RULES}\n\nYOUR FILE: ${M}/${F.f}\nMUST CONTAIN: ${F.about}\n\nReturn a 150-word summary and any open questions.`, { label: `write:${F.f}`, phase: 'Write' })))
log(`writers done: ${written.filter(Boolean).length}/${FILES.length}`)

// ------------------------------------------------------------------ Verify
phase('Verify')
const CHECKERS = [
  { key: 'consistency-a', lens: 'CROSS-FILE CONSISTENCY (files 00-05 vs each other and DECISIONS.md): contradictions in numbers, ids, names, terms, rules, scope.' },
  { key: 'consistency-b', lens: 'CROSS-FILE CONSISTENCY (files 05-10 vs each other and 00/DECISIONS.md): contradictions; room ids referenced but never specified; systems referenced but never defined.' },
  { key: 'fidelity', lens: 'FIDELITY TO THE USER: go through EVERY wish in messages 1-4 (name; mashup of team games incl. Mafia, Among Us, Chained, PEAK, and "time" modes; unique; skins + shop + monetization; maze dungeon; randomized levels; players meet in sub-levels 1A/1E/1B; doors every level; challenges, puzzles, weird-clear-condition monsters; power growth; Tutorial-Is-Too-Hard tone with sabotage/team-up/lone-wolf; top-tier visuals + animation; minigames; frog-in-a-well concentric layers; tower/dungeon/maze variety; fun, addictive, immersive, felt progress; Unity). Mark each covered / partial / missing with file+section evidence; report partial/missing as issues.' },
  { key: 'fun-overhaul', lens: 'FUN OVERHAUL COMPLIANCE: every item of FUN_OVERHAUL.md (loop timings, power curve, felt meta, CUT/SIMPLIFY list, first 10 minutes, hero, monetization) is faithfully applied; flag anything that reintroduces cut bureaucracy or delays the first laugh, first reward or first power spike.' },
  { key: 'first-session', lens: 'FIRST SESSION SIMULATION: simulate, minute by minute, (a) a first-time solo player\'s first 20 minutes with bots and (b) a 4-friend Discord session\'s first run. Where is it confusing, slow, unfair, boring, or not funny? Where is progress not felt? Where is the scale reveal weak?' },
  { key: 'buildability', lens: 'UNITY BUILDABILITY: act as the Unity engineer implementing each slice room and system from the text with NGO host authority, bots and the tech report stack. List ambiguities, missing numbers, impossible physics, network sync traps (hidden info, physics props), bot-AI gaps, soft-locks, perf traps.' },
  { key: 'economy', lens: 'ECONOMY, PROGRESSION & ETHICS: exploits, dead currencies, grind walls, pay-to-win leaks, predatory patterns (paid randomness, FOMO timers that split friend groups), power-curve breakpoints that trivialise multiplayer fairness.' },
  { key: 'critique', lens: 'CRITIQUE FOLLOW-THROUGH: every item in GDD_CRITIQUE.md that still applies to surviving systems is fixed or explicitly rejected with reason; every diagnosis bullet in the research report is addressed.' },
]
const confirmed = (await pipeline(
  CHECKERS,
  (c) => run(`You are a design verifier. Lens: ${c.lens}\nRead ${M}/DECISIONS.md and the master files in ${M}/ (${FILES.map((x) => x.f).join(', ')}); consult sources when needed.\n${USER}\n${SOURCES}\nReport concrete issues with ids (${c.key}-1, ...), severity, file, exact location, problem and a concrete fix. Do not edit files. Default to skepticism but only report what you can point to.`, { label: `check:${c.key}`, phase: 'Verify', schema: ISSUE_SCHEMA }),
  (res, c) => res && res.issues.length ? run(`You are an adversarial REFUTER. Another verifier (lens: ${c.lens}) reported the issues below about the master design in ${M}/. For each, open the cited file/location and decide whether it is REAL (the text really has the problem and it matters) or NOT (misread, handled elsewhere — cite where, or harmless). If real but the fix is poor, give a better fix. Default to "not real" when the evidence does not hold up.\nISSUES:\n${JSON.stringify(res.issues, null, 1)}`, { label: `refute:${c.key}`, phase: 'Verify', schema: REFUTE_SCHEMA }).then((v) => {
    const map = new Map((v ? v.verdicts : []).map((x) => [x.id, x]))
    return res.issues.filter((i) => !map.has(i.id) || map.get(i.id).real).map((i) => ({ ...i, fix: (map.get(i.id) && map.get(i.id).better_fix) || i.fix, checker: c.key }))
  }) : [],
)).filter(Boolean).flat()
log(`confirmed issues: ${confirmed.length} (${confirmed.filter((i) => i.severity === 'critical').length} critical, ${confirmed.filter((i) => i.severity === 'major').length} major)`)

// ------------------------------------------------------------------ Revise
phase('Revise')
const byFile = {}
for (const i of confirmed) {
  const f = (FILES.find((F) => (i.file || '').includes(F.f.replace('.md', ''))) || { f: 'DECISIONS.md' }).f
  ;(byFile[f] = byFile[f] || []).push(i)
}
const revised = await parallel(Object.entries(byFile).map(([f, issues]) => () => run(`You are revising ${M}/${f} in place (Read, then Edit). Apply every issue below (verified by an independent refuter). Stay consistent with ${M}/DECISIONS.md and the other master files (read the sections you touch elsewhere; if a fix needs a change in ANOTHER file, do not edit it — list it in your answer). Return: applied issue ids, cross-file changes still needed (file + exact change).\nISSUES:\n${JSON.stringify(issues, null, 1)}\n${USER}`, { label: `revise:${f}`, phase: 'Revise' })))

// ------------------------------------------------------------------ Gate
phase('Gate')
const gate = await run(`You are the FINAL GATE for the master design set in ${M}/. (1) Apply the cross-file changes the revisers still need (below); you may edit any master file. (2) Re-check the set end to end: contradictions between files, every user wish covered, every slice room fully specified (clear condition, bot plan, test hook), glossary terms consistent, overhaul honoured. Fix what you find. (3) Write ${M}/README.md: a reading guide, the final name/tagline/hero/fantasy in 4 lines, and a coverage table of the user's wishes -> where they live. Return a summary (<= 400 words): name, tagline, hero, fantasy, slice layers and room ids, open questions.\n${USER}\n\nREVISER NOTES:\n${revised.filter(Boolean).join('\n\n')}`, { label: 'gate', phase: 'Gate' })
return { gate, confirmedIssues: confirmed.length }
