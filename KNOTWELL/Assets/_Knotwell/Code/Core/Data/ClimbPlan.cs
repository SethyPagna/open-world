using System;
using System.Runtime.InteropServices;

namespace Game.Core.Data
{
    /// <summary>
    /// Everything the climb planner reads, replicated in <c>ClimbState</c> (10_UNITY_TECH §6.2; ≤ 40 bytes).
    /// Every client rebuilds the plan from these inputs and compares <c>planHash</c> (§6.4).
    /// </summary>
    [Serializable]
    [StructLayout(LayoutKind.Sequential)]
    public struct PlannerInputs
    {
        /// <summary>Host <c>RandomNumberGenerator</c> value taken when the entrance door opens.</summary>
        public ulong climbSeed;
        /// <summary>0 = Well.</summary>
        public byte layer;
        /// <summary><see cref="Difficulty"/> 0–3: Easy, Normal, Hard, Hell (never Sealed).</summary>
        public byte difficulty;
        /// <summary>Sealed redaction on repeat visits.</summary>
        public bool sealedOptIn;
        /// <summary>True → the layer's authored <see cref="ClimbTemplate"/>, no randomness in the plan.</summary>
        public bool authoredClimb;
        /// <summary>Bit i set: no human has a Seen stamp for <see cref="ClimbContent.RuleMonsters"/>[i].</summary>
        public ulong unmetByAll;
        /// <summary>Bit i set: at least one human lacks the Seen stamp for <see cref="ClimbContent.RuleMonsters"/>[i].</summary>
        public ulong unmetByAny;
        /// <summary><see cref="BuildMilestone"/>: which statuses may be placed (A plans doors 1–10 only).</summary>
        public byte buildMilestone;
        /// <summary><see cref="PlannerLobbyFlags"/> bits.</summary>
        public ushort lobbyFlags;
    }

    /// <summary>Bits of <see cref="PlannerInputs.lobbyFlags"/> (10_UNITY_TECH §6.2).</summary>
    [Flags]
    public enum PlannerLobbyFlags : ushort
    {
        None = 0,
        /// <summary>Talents are active (Rank Sync off).</summary>
        TalentsActive = 1 << 0,
        /// <summary>Gold chance 7% (the rank-B talent) instead of 5%.</summary>
        GoldChanceRankB = 1 << 1,
        /// <summary>SSS talent: two Rematch overlays in doors 15–19.</summary>
        SssDoubleRematch = 1 << 2,
    }

    /// <summary>
    /// The planner's output (10_UNITY_TECH §6.2): one <see cref="DoorSlot"/> per door, ordered by door number,
    /// door 0 (<c>hatch_pond</c>) excluded. A Full Climb has 20 slots; an A build plans doors 1–10.
    /// <c>ClimbPlanner.PlanHash</c> hashes its canonical JSON.
    /// </summary>
    [Serializable]
    public sealed class ClimbPlan
    {
        public byte layer;
        public BuildMilestone milestone;
        /// <summary>Built from the authored <see cref="ClimbTemplate"/>.</summary>
        public bool authored;
        /// <summary>Which <c>plan:attempt</c> re-roll succeeded (0–63); 0 for an authored plan.</summary>
        public int attempt;
        /// <summary>True if the fixed fallback template was used. <c>ClimbPlannerTests</c> fails if this is ever true.</summary>
        public bool fallback;
        public DoorSlot[] slots = Array.Empty<DoorSlot>();
    }

    /// <summary>
    /// One door slot (10_UNITY_TECH §6.2): door number, slot type, door kind, overlay and one side per door on the
    /// plaque wall. A pair with a ♥ side has <c>kind = rule</c> and <c>overlay = heart</c>; a single Heart door
    /// has <c>kind = heart</c>. The same record is the authored template's slot.
    /// </summary>
    [Serializable]
    public sealed class DoorSlot
    {
        /// <summary>0–20 (0 only in a template).</summary>
        public byte door;
        public SlotType slotType;
        public DoorKind kind;
        public Overlay overlay;
        /// <summary>The gold roll happens at door time (10 §6.2): true if this slot may turn into <c>br_gold</c>.</summary>
        public bool goldEligible;
        /// <summary>1 side for a single door, 2 for a pair or fork (the group side first, the E side second).</summary>
        public DoorSide[] sides = Array.Empty<DoorSide>();
    }

    /// <summary>One door of a slot: the room it leads to and what its plaque shows (05 §3.2), plus its Twist seeds.</summary>
    [Serializable]
    public sealed class DoorSide
    {
        public RoomRef room;
        public PlaqueLetter letter;
        /// <summary>Base skulls from the room (Hard's +1 is added at runtime).</summary>
        public byte skulls;
        public Prize prize;
        /// <summary>Seeds for the room's Twist A and Twist B (fixed in the authored climb).</summary>
        public uint twistSeedA;
        public uint twistSeedB;
        /// <summary>Which Twists are live (climb 1: none).</summary>
        public TwistMask activeTwists;
    }

    /// <summary>
    /// A reference to a room that may resolve at runtime (10_UNITY_TECH §6.2–6.3): a fixed id,
    /// <c>UnchosenOf(door)</c> (the side the party did not take at that door), or <c>ClearedEarlier</c> (the Rematch
    /// pick: the best-cleared room with the longest old time).
    /// </summary>
    [Serializable]
    public sealed class RoomRef : IEquatable<RoomRef>
    {
        public RoomRefKind kind;
        /// <summary>Set for <see cref="RoomRefKind.Room"/>.</summary>
        public string roomId;
        /// <summary>Set for <see cref="RoomRefKind.UnchosenOf"/>: the earlier slot's door number.</summary>
        public byte door;

        public static RoomRef Room(string roomId) => new RoomRef { kind = RoomRefKind.Room, roomId = roomId };
        public static RoomRef UnchosenOf(byte door) => new RoomRef { kind = RoomRefKind.UnchosenOf, door = door };
        public static RoomRef ClearedEarlier() => new RoomRef { kind = RoomRefKind.ClearedEarlier };

        public bool Equals(RoomRef other) =>
            other != null && kind == other.kind && string.Equals(roomId, other.roomId, StringComparison.Ordinal) && door == other.door;

        public override bool Equals(object obj) => Equals(obj as RoomRef);
        public override int GetHashCode() => HashCode.Combine(kind, roomId, door);

        public override string ToString() => kind switch
        {
            RoomRefKind.Room => roomId,
            RoomRefKind.UnchosenOf => "UnchosenOf(" + door + ")",
            _ => "ClearedEarlier",
        };
    }
}
