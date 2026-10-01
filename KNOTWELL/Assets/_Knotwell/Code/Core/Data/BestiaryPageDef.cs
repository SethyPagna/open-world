using System;

namespace Game.Core.Data
{
    /// <summary>
    /// Root of <c>Data/progression/bestiary.json</c> (10_UNITY_TECH §4.2 "BestiaryPageDef × 14"; 04 §9.1).
    /// M0 scope: the record and loader exist so <c>RoomDefAsset.bestiaryPage</c> can be wired; stamps and
    /// death tips are the progression unit's.
    /// </summary>
    [Serializable]
    public sealed class BestiaryTable : IDefinition
    {
        /// <summary><c>bestiary</c>.</summary>
        public string id;
        public BestiaryPageDef[] pages = Array.Empty<BestiaryPageDef>();

        string IDefinition.Id => id;
    }

    /// <summary>One Bestiary page, one per monster (04 §9.1: 12 rule monsters + Keeper + Warden).</summary>
    [Serializable]
    public sealed class BestiaryPageDef : IDefinition
    {
        /// <summary>E.g. <c>bst_bell_golem</c>; RoomSpec.bestiaryPageId refers to it.</summary>
        public string id;
        public string nameKey;
        /// <summary>Rooms where the monster is met (the golem is also met in the Keeper, the Rematch and the Warden).</summary>
        public string[] roomIds = Array.Empty<string>();
        public Suit suit;
        public Status status;

        string IDefinition.Id => id;
    }
}
