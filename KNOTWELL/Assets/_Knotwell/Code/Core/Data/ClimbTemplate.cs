using System;
using Newtonsoft.Json.Linq;

namespace Game.Core.Data
{
    /// <summary>
    /// The authored climb, mirroring <c>Data/climb/well_climb1.json</c> (10_UNITY_TECH §4.2–4.3 ClimbTemplate:
    /// 21 slots with rooms, overlays, fixed Twist seeds and Drama beats; the door list is DECISIONS §5 and
    /// 05 §5; the grant plan is 04 §6.1; the beats are 03 §22.5). Every profile's first climb is identical.
    /// </summary>
    [Serializable]
    public sealed class ClimbTemplate : IDefinition
    {
        /// <summary><c>well_climb1</c>.</summary>
        public string id;
        /// <summary>Layer id, e.g. <c>well</c>.</summary>
        public string layer;
        /// <summary>Doors 0–20 in order (door 0 = <c>hatch_pond</c>).</summary>
        public DoorSlot[] slots = Array.Empty<DoorSlot>();
        /// <summary>The stops after doors 5, 10 and 15 with their toys.</summary>
        public ClimbStopSpec[] landings = Array.Empty<ClimbStopSpec>();
        /// <summary>The first climb's auto-granted Boons (doors 2–9).</summary>
        public BoonGrantSpec[] grants = Array.Empty<BoonGrantSpec>();
        /// <summary>The Drama Director's staged beats.</summary>
        public DramaBeat[] beats = Array.Empty<DramaBeat>();

        string IDefinition.Id => id;
    }

    /// <summary>A Landing in the authored climb (DECISIONS §5: L1 with <c>toy_frog_stack</c>, the Keeper Landing, L3).</summary>
    [Serializable]
    public sealed class ClimbStopSpec
    {
        public byte afterDoor;
        /// <summary><c>landing_well</c>.</summary>
        public string roomId;
        /// <summary>The Landing's toy, or null.</summary>
        public string toyRoomId;
    }

    /// <summary>One entry of the first climb's grant plan (04 §6.1).</summary>
    [Serializable]
    public sealed class BoonGrantSpec
    {
        public byte door;
        public GrantKind kind;
        /// <summary>Set for <see cref="GrantKind.Fixed"/>, e.g. <c>shatter_croak</c>, <c>moon_hop</c>.</summary>
        public string boonId;
        /// <summary>The System line key for the grant.</summary>
        public string lineKey;
    }

    /// <summary>
    /// A staged Drama Director beat (10_UNITY_TECH §12.5: <c>{door, trigger, actor Rival, goal, bark key}</c>;
    /// rows in 03 §22.5). It is injected as the top-priority goal of its actor's plan.
    /// </summary>
    [Serializable]
    public sealed class DramaBeat
    {
        /// <summary>03's id, e.g. <c>DD-02</c>.</summary>
        public string id;
        public byte door;
        /// <summary>True: the beat plays at the Landing after <see cref="door"/>.</summary>
        public bool atLanding;
        /// <summary>Rival ids (<c>moss</c>, <c>vex</c> …); <c>any_helper</c> or <c>any</c> for a role.</summary>
        public string[] actors = Array.Empty<string>();
        /// <summary>Trigger id, e.g. <c>human_first_spot_knocked</c>.</summary>
        public string trigger;
        /// <summary>Goal id injected into the actor's plan, e.g. <c>catch_spot</c>.</summary>
        public string goal;
        public string barkKey;
        /// <summary>Id of the beat that runs instead when this one can't (03's Fallback column), or null.</summary>
        public string fallback;
        public Status status;
        public JObject @params;
    }
}
