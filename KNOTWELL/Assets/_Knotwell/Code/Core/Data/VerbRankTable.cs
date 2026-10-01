using System;

namespace Game.Core.Data
{
    /// <summary>
    /// Verb ranks I–IV for Hop, Tongue and Croak, mirroring <c>Data/hero/verb_ranks.json</c>
    /// (10_UNITY_TECH §4.2–4.3 VerbRankTable; numbers owned by 02_HERO_AND_CONTROLS §7.2.3, §7.3.3, §7.4.1, §7.9;
    /// usage weights and tie order by 04 §3). Each per-verb array has 4 entries, index = rank − 1. Rooms place
    /// <c>RankLedge</c> and <c>Anchor</c> from <see cref="gauges"/>, so retuning moves every lane at once.
    /// </summary>
    [Serializable]
    public sealed class VerbRankTable : IDefinition
    {
        /// <summary><c>verb_ranks</c>.</summary>
        public string id;
        public HopRank[] hop = Array.Empty<HopRank>();
        public TongueRank[] tongue = Array.Empty<TongueRank>();
        public CroakRank[] croak = Array.Empty<CroakRank>();
        public VerbUsageSpec usage;
        /// <summary>Lane gauges rooms are built against (05 §2.1; ranges from 02 §7.10).</summary>
        public GaugeSpec[] gauges = Array.Empty<GaugeSpec>();
        public LaneMarginSpec laneMargins;
        /// <summary>After any stagger ends the monster is immune for this long (02 §7.4.1 stagger cap, law): 4.0 s.</summary>
        public float staggerImmunitySec;
        /// <summary>The M0 fallback switch (02 §7.11 #9). False: the tongue ignores frogs except catch and haul.</summary>
        public bool tongueOnFrogs = true;

        string IDefinition.Id => id;
    }

    /// <summary>One Hop rank (02 §7.2.3). Take-off speed is computed as √(2·g·apex), never stored.</summary>
    [Serializable]
    public sealed class HopRank
    {
        /// <summary>1–4.</summary>
        public byte rank;
        /// <summary>System-line name key, e.g. the Air Hop Awakening at III.</summary>
        public string nameKey;
        public float tapApexM;
        public float chargedApexM;
        /// <summary>H_rank: horizontal speed at a full-charge release with move input.</summary>
        public float horizontalMps;
        /// <summary>Longest flat gap at full speed.</summary>
        public float maxGapM;
        /// <summary>Highest ledge reachable (apex + scramble margin, with Air Hop where the rank has it).</summary>
        public float reachM;
        /// <summary>Air Hops per airborne phase (1 from III).</summary>
        public byte airHops;
        /// <summary>IV: a charged landing pops mites within this radius (0 = no stomp).</summary>
        public float stompRadiusM;
    }

    /// <summary>One Tongue rank (02 §7.3.3).</summary>
    [Serializable]
    public sealed class TongueRank
    {
        public byte rank;
        public string nameKey;
        public float rangeM;
        /// <summary>Heaviest prop it pulls (20 kg).</summary>
        public float pullMassKg;
        /// <summary>Things held at once (2 from III, Long Tongue).</summary>
        public byte targets;
        /// <summary>Anchors pull you (from II).</summary>
        public bool grapple;
        /// <summary>Snatch a monster projectile and spit it back (from III).</summary>
        public bool snatch;
        /// <summary>IV: anchors per airborne phase in a chain grapple (0 = no chain).</summary>
        public byte chainAnchors;
        /// <summary>IV: greatest distance between chained anchors.</summary>
        public float chainSpacingM;
    }

    /// <summary>One Croak rank (02 §7.4.1).</summary>
    [Serializable]
    public sealed class CroakRank
    {
        public byte rank;
        public string nameKey;
        public float radiusM;
        /// <summary>Toll targets rung per pulse (2 from III, Twin Toll).</summary>
        public byte bellsPerPulse;
        public MiteEffect miteEffect;
        public float miteStunSec;
        public float miteKnockbackM;
        /// <summary>Stagger on small monsters (from II).</summary>
        public float smallMonsterStaggerSec;
        /// <summary>Stagger on rule monsters (IV, Thunder Croak: 2 s, never a kill).</summary>
        public float ruleMonsterStaggerSec;
        public bool shattersPots;
        public float cooldownSec;
    }

    /// <summary>
    /// How the verb that ranks up is picked (04 §3): the most-used verb since the last level-up, no verb more than
    /// <see cref="maxLeadOverLowest"/> ranks ahead of the lowest, ties broken in <see cref="tieOrder"/>.
    /// </summary>
    [Serializable]
    public sealed class VerbUsageSpec
    {
        public float hopWeight;
        public float tongueWeight;
        public float croakWeight;
        /// <summary>Tongue &gt; Hop &gt; Croak.</summary>
        public Verb[] tieOrder = Array.Empty<Verb>();
        public byte maxLeadOverLowest;
    }

    /// <summary>
    /// A lane gauge (05 §2.1): the size a <c>RankLedge</c>, <c>RankGap</c>, <c>Anchor</c> or toll distance is
    /// built at for one verb rank, with the legal band from 02 §7.10.
    /// </summary>
    [Serializable]
    public sealed class GaugeSpec
    {
        /// <summary><c>ledge.II</c>, <c>gap.III</c>, <c>anchor.II</c>, <c>croak.IV</c> …</summary>
        public string key;
        public Verb verb;
        public byte rank;
        /// <summary>The size generators build at.</summary>
        public float nominalM;
        public float minM;
        public float maxM;
    }

    /// <summary>The lane rule's margins (02 §7.10): a rank-N lane sits beyond rank N−1's reach and within rank N's.</summary>
    [Serializable]
    public sealed class LaneMarginSpec
    {
        /// <summary>≥ 0.20 m beyond rank N−1's reach (ledges, tongue, bells).</summary>
        public float beyondPreviousM;
        /// <summary>≥ 0.40 m beyond rank N−1's reach (gaps).</summary>
        public float beyondPreviousGapM;
        /// <summary>≤ rank N's reach − 0.10 m.</summary>
        public float underReachM;
        /// <summary>≤ rank N's gap − 0.30 m.</summary>
        public float underReachGapM;
        /// <summary>Tongue effective reach = range + 0.25 m tip tolerance.</summary>
        public float tongueTipToleranceM;
        /// <summary>Croak effective reach for a bell = radius + 0.3 m.</summary>
        public float bellRadiusM;
    }
}
