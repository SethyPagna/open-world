using System.Runtime.CompilerServices;

// Tests and editor tooling may see internals. Never add Game.Bots or Game.UI here (10_UNITY_TECH §3.2 rule 3).
[assembly: InternalsVisibleTo("Game.Editor")]
[assembly: InternalsVisibleTo("Game.Tests.EditMode")]
[assembly: InternalsVisibleTo("Game.Tests.PlayMode")]
