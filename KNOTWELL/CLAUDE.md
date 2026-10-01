# KNOTWELL — Unity project rules for agents

Unity 6.3 LTS (6000.3.25f1), URP 17.3, NGO 2.13.3 host mode, C# 9. Design is binding and lives in
`../_design/master/` (authority: `DECISIONS.md` first, then the numbered files). Architecture:
`../_design/master/10_UNITY_TECH.md`. If code and design disagree, the design wins. Report the conflict; don't
invent a third answer.

## Verify through the gate, never by launching Unity yourself

Only one Unity process may open this project. Every agent goes through `Tools/unity_gate.mjs`, which queues on a
lock and prints a short summary (full logs in `Logs/gate_*.log`, NUnit XML in `TestResults/`).

| Command (run from `KNOTWELL/`) | Time | Use |
|---|---|---|
| `node Tools/unity_gate.mjs check` | ~20 s | Type-check all of `Assets/_Knotwell` against Unity's DLLs. Run after every edit. |
| `node Tools/unity_gate.mjs core [filter]` | ~30 s | `Game.Core` + `Tests/EditMode/Core` under plain .NET (no Unity). |
| `node Tools/unity_gate.mjs compile` | 4–8 min | Real Unity import + compile (asmdef boundaries, ILPP, NGO codegen). |
| `node Tools/unity_gate.mjs test editmode [filter]` | 4–8 min | EditMode tests. `filter` = test name / namespace / regex. |
| `node Tools/unity_gate.mjs test playmode [filter]` | 5–10 min | PlayMode tests. |
| `node Tools/unity_gate.mjs exec Game.Editor.Cli.<Method> [-- args]` | 4–8 min | Run an editor command (generators, validators, screenshots). |

- `check` and `core` are cheap: run them constantly. Unity runs are slow and serialized, so batch them: finish a
  unit of work, get `check` green, then run one Unity gate.
- `check` compiles everything as ONE assembly, so it cannot see asmdef boundary violations or
  `noEngineReferences`. `core` catches UnityEngine in Core; `compile` catches the rest.
- Exit code 0 = green. `BLOCKED` means a human has the Editor open; stop and report it. Don't kill it.
- Unity sometimes crashes on shutdown after finishing its work. The gate knows this and ignores it.

## Layout (10_UNITY_TECH §3)

```
Assets/_Knotwell/
  Code/<Layer>/Game.<Layer>.asmdef   Core ◄ Content ◄ Platform ◄ Net ◄ Hero ◄ Rooms ◄ Bots ◄ Tower ◄ UI
  Editor/        Game.Editor         generators, validators, Cli entry points (batchmode: Game.Editor.Cli.*)
  Tests/EditMode Game.Tests.EditMode (Tests/EditMode/Core/** must be pure .NET: no UnityEngine)
  Tests/PlayMode Game.Tests.PlayMode
  Data/          JSON source of truth (agents edit)
  Generated/     generator output only (NEVER hand-edit; re-run the generator)
```

A layer may reference only layers to its left. Namespace = assembly (`Game.Rooms.Monsters.BellGolem`).

## Code rules

1. **Game.Core has no UnityEngine** (`noEngineReferences`). Pure rules, maths, RNG, planner, records. Keep
   logic here whenever it doesn't need the engine, because it is testable in seconds.
2. **RNG:** only `Game.Core.Random.Pcg32` streams (`Pcg32.Stream(seed, "purpose", index)`). Never
   `UnityEngine.Random` or `System.Random` in gameplay. Never `string.GetHashCode()` for anything persistent or
   networked: use `Hash64.Of`.
3. **Statics:** domain reload is off. Every mutable static needs a
   `[RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]` reset on its type.
   `StaticStateTests` enforces it.
4. **Hidden information** (secret offers, quests, mimic identity) lives in `Game.Tower` as `internal`. Never add
   `InternalsVisibleTo` for `Game.Bots` or `Game.UI`.
5. **Fairness caps** are `const` in `Game.Core.FairnessCaps`, not data.
6. **Networking:** the host is authoritative for game state; owners are authoritative for their own frog's
   movement. Bots are host-owned NetworkObjects that drive the *same* input path as players.
7. **Generated assets:** prefabs, scenes, ScriptableObjects and the input asset come from editor generators
   reading `Data/*.json`. Write the generator, not the asset. Move or delete assets only through
   `AssetDatabase` in an editor command, never with `mv` or `rm` (it breaks `.meta` GUIDs).
8. Match the surrounding code: 4-space indent, `PascalCase` types and methods, `camelCase` fields,
   `[SerializeField] private` over public fields, XML doc comments on public types, no dead code.
9. Every feature ships with a test. Logic → Core test (dotnet). Unity wiring → EditMode test. Netcode, physics,
   rooms → PlayMode test. Log lines meant for the gate summary start with `[KNOTWELL]`.
10. Don't `git commit` or push; the human decides that. Don't touch `ProjectSettings/` by hand; settings are
    applied by an editor command.

## Machine notes

- Editor: `C:\Program Files\Unity\Hub\Editor\6000.3.25f1\Editor\Unity.exe`. .NET SDK 9.0.313. Node 22+.
- Never use `-nographics` for anything that renders or bakes.
- Unity Personal license (ULF) expires 2026-11-04. The human renews it by signing in to Unity Hub.
