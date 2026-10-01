using System;

namespace Game.Core.Data
{
    /// <summary>
    /// The seeded-climb rules of the Well, mirroring <c>Data/climb/well_rules.json</c> (10_UNITY_TECH §4.2 "DECISIONS
    /// §5 Seeded climbs", §6.3; slot template, pools and constraints from 05 §4.2–4.3). The planner applies the
    /// constraints in 10 §6.3's order; this record holds only their numbers and lists.
    /// </summary>
    [Serializable]
    public sealed class WellRules : IDefinition
    {
        /// <summary><c>well_rules</c>.</summary>
        public string id;
        public string layer;
        /// <summary>20.</summary>
        public byte doorCount;
        public string hatchRoomId;
        public string landingRoomId;
        public string meetingRoomId;
        /// <summary>The Meeting room's toy (<c>toy_jar_tag</c>).</summary>
        public string meetingToyRoomId;
        public string keeperRoomId;
        public string wardenRoomId;
        /// <summary>The room a gold roll turns a breather slot into (<c>br_gold</c>).</summary>
        public string goldRoomId;
        public byte keeperDoor;
        public byte wardenDoor;
        /// <summary>Landings follow these doors (5, 10, 15).</summary>
        public int[] landingsAfter = Array.Empty<int>();
        /// <summary>Fork doors (7, 12, 17) [MUST-B].</summary>
        public int[] forkDoors = Array.Empty<int>();
        /// <summary>The slot template, doors 1–20 (05 §4.2).</summary>
        public SlotRuleSpec[] slots = Array.Empty<SlotRuleSpec>();
        public DoorMixSpec mix;
        public HeartRuleSpec hearts;
        public SetPieceRuleSpec setPieces;
        public DebutRuleSpec debut;
        public RematchRuleSpec rematch;
        public GoldRuleSpec gold;
        /// <summary>No suit more than this many times in a row across consecutive non-breather slots (2).</summary>
        public byte maxSuitRun;
        /// <summary>Room pools the planner draws from (05 §4.3). Bands come from each RoomSpec.</summary>
        public RoomPoolSpec[] pools = Array.Empty<RoomPoolSpec>();
        /// <summary>Re-rolls on the <c>plan:attempt</c> sub-stream before the fallback (64).</summary>
        public int maxAttempts;
        /// <summary>An A build plans doors 1 to this (10).</summary>
        public byte milestoneADoorLimit;

        string IDefinition.Id => id;
    }

    /// <summary>One door of the slot template (05 §4.2 table).</summary>
    [Serializable]
    public sealed class SlotRuleSpec
    {
        public byte door;
        public SlotType slotType;
        public DoorKind kind;
        /// <summary>A room that always fills the slot (<c>br_window</c> at 4, the Keeper, the Warden), or null.</summary>
        public string fixedRoomId;
        /// <summary>Prefer <c>short</c> rooms (door 5).</summary>
        public bool preferShort;
        /// <summary>Prefer a toy door (door 16).</summary>
        public bool preferToy;
        /// <summary>The gold roll may turn this breather into <c>br_gold</c>.</summary>
        public bool goldEligible;
        /// <summary>Default Rematch slot (18).</summary>
        public bool rematchDefault;
        /// <summary>The slot may instead be a pair with a ♥ side (door 6).</summary>
        public bool heartAllowed;
        /// <summary>The slot may instead be a set piece (door 15).</summary>
        public bool setPieceAllowed;
    }

    /// <summary>Door mix per Full Climb (10 §6.3 #3): 8 breathers, 8 rule/Heart doors, 2 set pieces, Keeper and Warden.</summary>
    [Serializable]
    public sealed class DoorMixSpec
    {
        public byte breathers;
        public byte ruleOrHeart;
        public byte setPieces;
    }

    /// <summary>Heart doors (10 §6.3 #4): 1–2 per climb from door 6, from the ♥ pool [MUST-B].</summary>
    [Serializable]
    public sealed class HeartRuleSpec
    {
        public byte min;
        public byte max;
        public byte fromDoor;
        /// <summary>Id of the pool in <see cref="WellRules.pools"/> to draw from.</summary>
        public string poolId;
    }

    /// <summary>Set pieces: one in each half of the climb (05 §4.2 #5; 10 §6.3 #3).</summary>
    [Serializable]
    public sealed class SetPieceRuleSpec
    {
        public byte perClimb;
        /// <summary>The door ranges ("halves") that each hold one.</summary>
        public DoorRange[] halves = Array.Empty<DoorRange>();
        public string poolId;
    }

    /// <summary>Debut rule (10 §6.3 #5): up to 2 never-met monsters before door 10, preferring <c>unmetByAll</c>.</summary>
    [Serializable]
    public sealed class DebutRuleSpec
    {
        public byte maxDebuts;
        /// <summary>Debuts go in doors below this (10).</summary>
        public byte beforeDoor;
    }

    /// <summary>Rematch overlay (10 §6.3 #6): one in doors 15–19, two with the SSS talent.</summary>
    [Serializable]
    public sealed class RematchRuleSpec
    {
        public byte count;
        public byte sssCount;
        public byte fromDoor;
        public byte toDoor;
    }

    /// <summary>Gold doors (10 §6.3 #10; 05 §3.5), rolled at door time on <c>Stream(seed, "gold", door)</c>.</summary>
    [Serializable]
    public sealed class GoldRuleSpec
    {
        /// <summary>0.05 per eligible slot.</summary>
        public float chance;
        /// <summary>0.07 with the rank-B talent.</summary>
        public float rankBChance;
        /// <summary>Lucky Belly multiplies the chance (×2).</summary>
        public float luckyBellyMultiplier;
        /// <summary>If no gold door has appeared by this door (15) …</summary>
        public byte forceIfNoneByDoor;
        /// <summary>… the first breather slot in this range is forced gold (16–19).</summary>
        public DoorRange forceRange;
        /// <summary>Never gold (10, 20); forks and the Rematch slot are excluded by rule, not listed.</summary>
        public int[] excludedDoors = Array.Empty<int>();
    }

    /// <summary>An inclusive range of door numbers.</summary>
    [Serializable]
    public sealed class DoorRange
    {
        public byte from;
        public byte to;

        public bool Contains(int door) => door >= from && door <= to;
    }

    /// <summary>A named pool of room ids (05 §4.3), e.g. <c>spade_rule</c>, <c>heart</c>, <c>enigma</c>, <c>breather</c>.</summary>
    [Serializable]
    public sealed class RoomPoolSpec
    {
        public string id;
        public string[] roomIds = Array.Empty<string>();
    }
}
