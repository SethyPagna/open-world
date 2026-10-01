using System;

namespace Game.Core.Data
{
    /// <summary>
    /// The Glow curve and firefly yields, mirroring <c>Data/progression/growth.json</c> (10_UNITY_TECH §4.2–4.3
    /// GrowthTable; values owned by 04_PROGRESSION_ECONOMY §2.1–2.4). Total banked for level n is
    /// k·(n−1)(n+2)/2 with k = 15. Nothing but difficulty, Sealed, hidden clears, gold and capped Boons changes a
    /// yield (04 §2.2 "Nothing else").
    /// </summary>
    [Serializable]
    public sealed class GrowthTable : IDefinition
    {
        /// <summary><c>growth</c>.</summary>
        public string id;
        /// <summary>Curve constant (15).</summary>
        public int k;
        /// <summary>10.</summary>
        public int maxLevel;
        /// <summary>One row per <see cref="YieldKind"/> except <see cref="YieldKind.Gold"/>, which derives from the rule row.</summary>
        public DoorYieldSpec[] yields = Array.Empty<DoorYieldSpec>();
        /// <summary>A gold door pays this × the rule row's clear bonus and no loose (3).</summary>
        public float goldClearMultiplier;
        /// <summary>A hidden clear multiplies the door total (2).</summary>
        public float hiddenClearMultiplier;
        /// <summary>A Sealed room multiplies fireflies (1.5; not in Hell).</summary>
        public float sealedMultiplier;
        /// <summary>A failed room pays this share of its clear bonus (0.5).</summary>
        public float failClearFraction;
        /// <summary>A hit spills this share of unbanked fireflies, rounded up (0.2).</summary>
        public float spillFraction;
        /// <summary>Boon yield multipliers combined are capped at this (3.0, 04 §6.3).</summary>
        public float boonMultiplierCap;
        public CrownSpec crown;

        string IDefinition.Id => id;
    }

    /// <summary>One yield row (04 §2.2): clear bonus = <c>clearBase + clearPerDoor·d</c> per frog, plus <c>loose</c>.</summary>
    [Serializable]
    public sealed class DoorYieldSpec
    {
        public YieldKind kind;
        public int clearBase;
        /// <summary>Multiplied by the door number d (1–20).</summary>
        public int clearPerDoor;
        /// <summary>Typical loose fireflies gulped per frog.</summary>
        public int loose;
    }

    /// <summary>After Lv10 (04 §2.4): every <c>sparkEvery</c> fireflies past the Lv10 total add a Crown spark and coins.</summary>
    [Serializable]
    public sealed class CrownSpec
    {
        public int sparkEvery;
        public int maxSparks;
        public int coinsPerSpark;
    }
}
