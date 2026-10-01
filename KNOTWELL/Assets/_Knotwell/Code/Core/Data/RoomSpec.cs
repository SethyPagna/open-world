using System;
using System.Collections.Generic;
using Newtonsoft.Json.Linq;

namespace Game.Core.Data
{
    /// <summary>
    /// One room: the serialised RoomDef contract (glossary #30), mirroring <c>Data/rooms/&lt;id&gt;.json</c>
    /// one-to-one. 10_UNITY_TECH §4.3 fixes the serialised form; 05_ROOMS_SLICE §1.1 owns what each field means.
    /// Fields 10 §4.3 names keep 10's names; fields only 05 (or 03 §25) lists are added with their names.
    /// Where the two disagree on a name, 10 wins: <c>length</c> (05 <c>lengthSec</c>), <c>monsterId</c> +
    /// <c>monsterBrain</c> + <c>bestiaryPageId</c> (05 <c>monster{id, brain, bestiaryId}</c>), <c>obviousClear</c>
    /// (05 <c>clear</c>), <c>gimmickKitId</c> (05 <c>gimmick</c>), <c>layout</c> as a placement array with the shell
    /// in <c>shell</c> (05 <c>layout{shell, placements}</c>), <c>capacity</c> as an enum (05 <c>{mode}</c>).
    /// Optional blocks are null when absent; arrays are empty when absent.
    /// </summary>
    [Serializable]
    public sealed class RoomSpec : IDefinition
    {
        /// <summary>DECISIONS §6 id, e.g. <c>bell_golem</c>. Must equal the file name.</summary>
        public string id;
        /// <summary>Localisation keys (05 §1.1): all player text goes through the <c>Rooms</c> table.</summary>
        public string nameKey;
        /// <summary>The plain rule, ≤ 14 English words (10 §10.7).</summary>
        public string ruleKey;
        public string fantasyKey;
        public RoomKind kind;
        public Suit suit;
        /// <summary>1–3 base skulls; Hard adds 1 at runtime.</summary>
        public byte skulls;
        public Capacity capacity;
        /// <summary>Layer id, e.g. <c>well</c>.</summary>
        public string layer;
        /// <summary>[min, max] door numbers the seeded planner may place it at (05 §4.3). Empty = anywhere legal.</summary>
        public int[] band = Array.Empty<int>();
        /// <summary>True for ≤ 55 s rooms (door-5 candidates, 05 §4.2).</summary>
        public bool @short;
        /// <summary>Target, soft cap (90) and hard cap (≤ 150) in seconds.</summary>
        public LengthSpec length;
        /// <summary>The one MonsterBrain's id; null for rooms without a threat.</summary>
        public string monsterId;
        /// <summary>The MonsterBrain class name, e.g. <c>BellGolemBrain</c> (05 §1.1 <c>monster.brain</c>).</summary>
        public string monsterBrain;
        public CueSpec cue;
        /// <summary>Word indices left visible when Sealed or Hell redact the rule (05 §3.6).</summary>
        public int[] sealedKeep = Array.Empty<int>();
        public ClearSpec obviousClear;
        /// <summary>Pays ×2, a Bestiary stamp, +5 RP and always fires <c>[ NOTED ]</c>.</summary>
        public ClearSpec hiddenClear;
        /// <summary>Fail condition (05 §1.1 <c>fail</c>), e.g. <c>{"type":"any","of":["hard_timer","all_dark"]}</c>.</summary>
        public ClearSpec fail;
        /// <summary>Exactly 2 for rule doors, set pieces and the Keeper; targets must be dynamic kit ids.</summary>
        public TwistSpec[] twists = Array.Empty<TwistSpec>();
        /// <summary>Rank-II and rank-III/IV lanes per verb (02 §7.10; 10 §10.7).</summary>
        public LaneSpec[] lanes = Array.Empty<LaneSpec>();
        public MiteSpec mites;
        /// <summary>Loose fireflies per frog (05 §1.1; FO §4.1).</summary>
        public LooseSpec loose;
        /// <summary>Kit id of the one shared-fate gimmick.</summary>
        public string gimmickKitId;
        /// <summary>Heart doors only (05 §1.1): the betrayal window and verb. Null elsewhere.</summary>
        public BetrayalSpec betrayal;
        /// <summary>Heart doors only: 03 §25's <c>heart{}</c> block. Null elsewhere.</summary>
        public HeartSpec heart;
        public Prize prize;
        public BoonFamily boonFamily;
        /// <summary>Bestiary page id, e.g. <c>bst_bell_golem</c> (04 §9.1). Rule monsters, Keeper, Warden only.</summary>
        public string bestiaryPageId;
        /// <summary>Death tip, hidden-clear hint and entry keys (05 §1.1 <c>bestiary</c>).</summary>
        public BestiaryKeys bestiary;
        public BotPlanSpec botPlan;
        public SystemLineKeys system;
        public RoomAudioSpec audio;
        /// <summary>DECISIONS §8.2 #28 tag vocabularies (05 §1.4).</summary>
        public string[] wish = Array.Empty<string>();
        public string[] homage = Array.Empty<string>();
        public Budget budget;
        public Status status;
        /// <summary>Static, baked shell prefab id, e.g. <c>shell_belfry_r12</c>.</summary>
        public string shell;
        /// <summary>Kit placements in cell-local metres.</summary>
        public KitPlacement[] layout = Array.Empty<KitPlacement>();
        /// <summary>Entry and exit pads, cell-local metres (origin at floor level in the room centre, +z entry → exit).</summary>
        public Vec3 entry;
        public Vec3 exit;
        /// <summary>0: ≤ 40 m, 1: ≤ 80 m, 2: ≤ 120 m footprint (10 §5.3).</summary>
        public byte sizeClass;
        /// <summary>Auto-solve modes and soak seeds (05 §8.2).</summary>
        public RoomTestsSpec tests;

        string IDefinition.Id => id;
    }

    /// <summary>Room length in seconds (10_UNITY_TECH §4.3 LengthSpec; 05 §1.1 <c>lengthSec</c>; FO §3.2).</summary>
    [Serializable]
    public sealed class LengthSpec
    {
        public float targetSec;
        public float softCapSec;
        public float hardCapSec;
    }

    /// <summary>
    /// The self-lit cue (10_UNITY_TECH §4.3 CueSpec; 05 §1.1 <c>cue</c>). Lead 2–5 s before danger; Hard and Hell
    /// multiply it by the difficulty's tell multiplier. Every cue has a visual twin (TellLight).
    /// </summary>
    [Serializable]
    public sealed class CueSpec
    {
        public float leadSec;
        /// <summary>Kit id of the emissive TellLight placement.</summary>
        public string visualKitId;
        /// <summary>Positional audio cue id (05's <c>sfx</c>), e.g. <c>sfx.golem.hum_rise</c>.</summary>
        public string audioCueId;
        /// <summary>What the tell is, e.g. <c>eyes_glow</c>.</summary>
        public string what;
        /// <summary>Tell colour, <c>#RRGGBB</c>.</summary>
        public string hex;
    }

    /// <summary>
    /// A host-evaluated predicate (10_UNITY_TECH §4.3 ClearSpec; 05 §1.1 <c>clear</c>, <c>fail</c>,
    /// <c>hiddenClear</c>). <c>id</c> names the predicate the room script evaluates; the other fields carry its
    /// arguments in 05's condition-object form.
    /// </summary>
    [Serializable]
    public sealed class ClearSpec
    {
        /// <summary>Predicate id, e.g. <c>golem_one_croak</c>.</summary>
        public string id;
        /// <summary>Condition type, e.g. <c>flags_all</c>, <c>any</c>, <c>cross</c>.</summary>
        public string type;
        /// <summary>Flag names for flag conditions (<c>flags_all</c>).</summary>
        public string[] flags = Array.Empty<string>();
        /// <summary>Sub-predicate ids for combinators (<c>any</c>, <c>all</c>).</summary>
        public string[] of = Array.Empty<string>();
        /// <summary>Hidden clears: the named trigger, e.g. <c>EchoSpot.gold_circle</c>.</summary>
        public string trigger;
        /// <summary>Hidden clears: the hint shown by the Rank A talent.</summary>
        public string hintKey;
        /// <summary>Free-form extra arguments; the room script reads them.</summary>
        public JObject @params;
    }

    /// <summary>A seeded Twist (10_UNITY_TECH §4.3 TwistSpec; 05 §4.2 #10). It may touch only dynamic kit ids.</summary>
    [Serializable]
    public sealed class TwistSpec
    {
        /// <summary>Twist id, e.g. <c>crooked_bell</c>. Twist A is <c>twists[0]</c>, B is <c>twists[1]</c>.</summary>
        public string id;
        /// <summary>Kit ids it changes; each must be a dynamic placement (validator, 10 §5.3).</summary>
        public string[] targets = Array.Empty<string>();
        public JObject @params;
    }

    /// <summary>A rank lane (10_UNITY_TECH §4.3 LaneSpec; 05 §1.1 <c>lanes</c>; numbers from 02 §7.10).</summary>
    [Serializable]
    public sealed class LaneSpec
    {
        /// <summary>Hop, Tongue or Croak.</summary>
        public Verb verb;
        /// <summary>2–4 (rank II, III or IV).</summary>
        public byte rank;
        /// <summary>Kit id of the RankLedge, RankGap, Anchor or toll target that forms the lane.</summary>
        public string kitId;
        public Vec3 position;
        /// <summary>Gauge key from <see cref="VerbRankTable.gauges"/>, e.g. <c>ledge.II</c>.</summary>
        public string gauge;
        /// <summary>Designer note, e.g. "gallery bell".</summary>
        public string what;
    }

    /// <summary>Mites (10_UNITY_TECH §4.3 MiteSpec; 05 §1.1 <c>mites</c>). Each pops into 1 loose firefly.</summary>
    [Serializable]
    public sealed class MiteSpec
    {
        /// <summary>Mite kind (05's <c>type</c>): <c>moth</c>, <c>bell_beetle</c>, <c>strider</c>, <c>grub</c>.</summary>
        public string kind;
        public int countPerFrog;
        /// <summary>At most 12 alive at once (10 §8.4).</summary>
        public int maxAlive;
        public float respawnSec;
    }

    /// <summary>Loose fireflies per frog (05 §1.1 <c>loose</c>): breather 4, rule/Heart 8, set piece 10, Keeper/Warden 10.</summary>
    [Serializable]
    public sealed class LooseSpec
    {
        public int perFrog;
    }

    /// <summary>What betrayal a Heart door allows (05 §1.1 <c>betrayal</c>, §3.8).</summary>
    [Serializable]
    public sealed class BetrayalSpec
    {
        /// <summary>Betrayal window id (matches a <see cref="BetrayalWindowSpec.id"/>).</summary>
        public string window;
        public Verb verb;
    }

    /// <summary>A Heart door's rules (03_SOCIAL_AND_BOTS §25 <c>heart{}</c> block; 10_UNITY_TECH §10.4 IHeartRoom).</summary>
    [Serializable]
    public sealed class HeartSpec
    {
        /// <summary>Verbs that may betray here.</summary>
        public Verb[] verbs = Array.Empty<Verb>();
        public float temptationWeight;
        public bool coopAnswerIsHiddenClear;
        /// <summary>The CoopAnswer predicate (10 §10.7: a Heart door without one fails validation).</summary>
        public ClearSpec coopAnswer;
        public HeartStakeSpec stake;
        public BetrayalWindowSpec[] betrayalWindows = Array.Empty<BetrayalWindowSpec>();
        /// <summary>System line key on entry.</summary>
        public string enterLine;
    }

    /// <summary>What a Heart-door betrayal moves (03 §25): only unbanked loot (FO §5.4 #3).</summary>
    [Serializable]
    public sealed class HeartStakeSpec
    {
        /// <summary>E.g. <c>unbankedFraction</c>.</summary>
        public string kind;
        public float fraction;
        public bool autoGulp;
    }

    /// <summary>When a betrayal verb is legal (03 §25 <c>betrayalWindows</c>).</summary>
    [Serializable]
    public sealed class BetrayalWindowSpec
    {
        public string id;
        /// <summary>Window start and end as room-script time expressions, e.g. <c>padDeparture-5.0</c>.</summary>
        public string from;
        public string to;
        /// <summary>Where the victim must be, e.g. <c>onOrBesidePad</c>.</summary>
        public string reach;
    }

    /// <summary>The room's Bestiary page texts (05 §1.1 <c>bestiary</c>; 04 §9.3).</summary>
    [Serializable]
    public sealed class BestiaryKeys
    {
        public string tipKey;
        public string hiddenHintKey;
        public string entryKey;
    }

    /// <summary>System window line keys (10_UNITY_TECH §4.3 SystemLineKeys; 05 §1.1 <c>system</c>).</summary>
    [Serializable]
    public sealed class SystemLineKeys
    {
        public string enter;
        public string clear;
        public string fail;
        /// <summary>The <c>[ NOTED ]</c> line on a hidden or unintended clear (DECISIONS §8.2 #25).</summary>
        public string noted;
        public string dark;
        public string hidden;
        /// <summary>Room extras by name, e.g. <c>"bell": "sys.room.bell_golem.bell"</c>.</summary>
        public Dictionary<string, string> extra = new Dictionary<string, string>();
    }

    /// <summary>Room audio keys (05 §1.1 <c>audio</c>): the monster motif and the music state. The cue sound is <see cref="CueSpec.audioCueId"/>.</summary>
    [Serializable]
    public sealed class RoomAudioSpec
    {
        public string motif;
        public string music;
    }

    /// <summary>
    /// One kit piece in the room (10_UNITY_TECH §4.3 KitPlacement; 05 §1.2 <c>placements</c>; kit list in 10 §10.3).
    /// <c>kit</c> is the component type; <c>kitId</c> is this placement's id, unique in the room, which cues,
    /// Twists, lanes and the gimmick refer to.
    /// </summary>
    [Serializable]
    public sealed class KitPlacement
    {
        /// <summary>Kit component, e.g. <c>Bell</c>, <c>EchoSpot</c>, <c>Anchor</c>.</summary>
        public string kit;
        /// <summary>Placement id, e.g. <c>gold_circle</c>, <c>bell_s0</c>.</summary>
        public string kitId;
        /// <summary>Optional named socket in the shell, e.g. <c>s0</c>.</summary>
        public string socket;
        /// <summary>Cell-local metres.</summary>
        public Vec3 position;
        /// <summary>Euler angles in degrees.</summary>
        public Vec3 rotation;
        /// <summary>Free-form per-kit parameters (e.g. <c>{"radius": 1.2}</c>); the kit component reads them.</summary>
        public JObject @params;
    }

    /// <summary>Test settings for the room (05 §1.1 <c>tests</c>, §8.2).</summary>
    [Serializable]
    public sealed class RoomTestsSpec
    {
        /// <summary>Auto-solve modes, e.g. <c>obvious</c>, <c>hidden</c>, <c>fail</c>.</summary>
        public string[] autoSolve = Array.Empty<string>();
        public int soakSeeds;
    }
}
