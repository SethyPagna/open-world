using System;

namespace Game.Core.Data
{
    /// <summary>
    /// Root of <c>Data/progression/difficulty.json</c>: the five difficulty definitions (10_UNITY_TECH §4.2
    /// "DifficultyDef × 5"; 04 §11.1).
    /// </summary>
    [Serializable]
    public sealed class DifficultyTable : IDefinition
    {
        /// <summary><c>difficulty</c>.</summary>
        public string id;
        public DifficultyDef[] difficulties = Array.Empty<DifficultyDef>();

        string IDefinition.Id => id;
    }

    /// <summary>
    /// One difficulty (10_UNITY_TECH §4.3 DifficultyDef: Team Lives, spots, tell multiplier, skulls +, yield ×,
    /// redaction flag, unlock rule, <c>enabledInBuild</c>; values owned by 04 §11.1). Hard ships in A as a data
    /// flag (DECISIONS §7, §8.2 #26).
    /// </summary>
    [Serializable]
    public sealed class DifficultyDef : IDefinition
    {
        /// <summary><c>easy</c>, <c>normal</c>, <c>hard</c>, <c>hell</c>, <c>sealed</c>.</summary>
        public string id;
        public Difficulty difficulty;
        public string nameKey;
        /// <summary>Shared Team Lives (Normal 3, Hard 2, Hell 1). Ignored when <see cref="unlimitedLives"/>.</summary>
        public int teamLives;
        /// <summary>Easy: the climb ends only when every human is Dark at once.</summary>
        public bool unlimitedLives;
        /// <summary>Spots per frog (Easy 4, else 3).</summary>
        public int spots;
        /// <summary>Rule monsters' tell lengths are multiplied by this (Hard and Hell 0.7).</summary>
        public float tellMultiplier;
        /// <summary>Added to every plaque's skulls (Hard +1).</summary>
        public int skullsAdd;
        /// <summary>Fireflies (Hard 1.5, Hell 2, Sealed 1.5).</summary>
        public float yieldMultiplier;
        /// <summary>Rank points ("Fireflies and RP" column: same as fireflies).</summary>
        public float rankPointMultiplier;
        /// <summary>Hell always redacts the rule; Sealed redacts rooms every human has stamped Cleared.</summary>
        public bool redactRules;
        /// <summary>Twists live per room instance in seeded climbs (05 §4.2 #10: one; Hell both).</summary>
        public int twistsPerRoom;
        public UnlockRule unlock;
        /// <summary>The chain tag's real condition, e.g. "Clear a Keeper to unlock".</summary>
        public string unlockTagKey;
        public bool enabledInBuild;
        public Status status;

        string IDefinition.Id => id;
    }
}
