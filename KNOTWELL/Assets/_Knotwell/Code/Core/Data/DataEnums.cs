using System.Runtime.Serialization;

// Every enum that appears in Data/*.json. Values are explicit and append-only (net ids, saves and plan hashes
// depend on them). The JSON spelling of each value is its [EnumMember] name; Game.Core.Json accepts only that
// exact spelling (no integers, no other casing).
namespace Game.Core.Data
{
    /// <summary>What a room is (05_ROOMS_SLICE §1.1 <c>kind</c>; 10_UNITY_TECH §4.3 RoomSpec.kind).</summary>
    public enum RoomKind : byte
    {
        [EnumMember(Value = "hub")] Hub = 0,
        [EnumMember(Value = "onboarding")] Onboarding = 1,
        [EnumMember(Value = "breather")] Breather = 2,
        [EnumMember(Value = "toy")] Toy = 3,
        [EnumMember(Value = "rule")] Rule = 4,
        [EnumMember(Value = "set_piece")] SetPiece = 5,
        [EnumMember(Value = "heart")] Heart = 6,
        [EnumMember(Value = "keeper")] Keeper = 7,
        [EnumMember(Value = "warden")] Warden = 8,
        /// <summary>10_UNITY_TECH §4.3 lists it; DECISIONS §6 files <c>meeting_room</c> as a hub.</summary>
        [EnumMember(Value = "meeting")] Meeting = 9,
        /// <summary>05 §1.1 lists <c>gold</c> (the gold breather, <c>br_gold</c>).</summary>
        [EnumMember(Value = "gold")] Gold = 10,
        /// <summary>DECISIONS §6 row 10 (<c>landing_well</c>) is typed "Landing".</summary>
        [EnumMember(Value = "landing")] Landing = 11,
    }

    /// <summary>Plaque suit (05 §3.2–3.3; 10_UNITY_TECH §4.3): ♠ A Body, ♦ B Mind, ♣ C Together, ♥ Heart, E Enigma.</summary>
    public enum Suit : byte
    {
        [EnumMember(Value = "none")] None = 0,
        [EnumMember(Value = "spade")] Spade = 1,
        [EnumMember(Value = "diamond")] Diamond = 2,
        [EnumMember(Value = "club")] Club = 3,
        [EnumMember(Value = "heart")] Heart = 4,
        [EnumMember(Value = "enigma")] Enigma = 5,
    }

    /// <summary>Who may enter (10_UNITY_TECH §4.3 Capacity; spellings from 05 §1.1 <c>capacity.mode</c>).</summary>
    public enum Capacity : byte
    {
        [EnumMember(Value = "group")] Group = 0,
        [EnumMember(Value = "solo")] Solo = 1,
        [EnumMember(Value = "duo")] Duo = 2,
        [EnumMember(Value = "solo_duo")] SoloOrDuo = 3,
    }

    /// <summary>The plaque's prize icon (05 §3.2 field 3; 04 §6.1 "the plaque's prize icon changes the Boon").</summary>
    public enum Prize : byte
    {
        [EnumMember(Value = "none")] None = 0,
        [EnumMember(Value = "boon")] Boon = 1,
        [EnumMember(Value = "jar")] Jar = 2,
        [EnumMember(Value = "gold")] Gold = 3,
        [EnumMember(Value = "key")] Key = 4,
        [EnumMember(Value = "window")] Window = 5,
        /// <summary>The Rematch hourglass (05 §1.1).</summary>
        [EnumMember(Value = "rematch")] Rematch = 6,
    }

    /// <summary>Boon family a door offers from (04 §6.1: ♠ Body, ♦ Sight, ♣ Chorus, ♥ Risk; Keeper and E doors: any).</summary>
    public enum BoonFamily : byte
    {
        [EnumMember(Value = "none")] None = 0,
        [EnumMember(Value = "body")] Body = 1,
        [EnumMember(Value = "sight")] Sight = 2,
        [EnumMember(Value = "chorus")] Chorus = 3,
        [EnumMember(Value = "risk")] Risk = 4,
        [EnumMember(Value = "any")] Any = 5,
    }

    /// <summary>Build budget (DECISIONS §6): S = monster + kit, M = + one custom kit piece, L = phases or a generator.</summary>
    public enum Budget : byte
    {
        [EnumMember(Value = "S")] S = 0,
        [EnumMember(Value = "M")] M = 1,
        [EnumMember(Value = "L")] L = 2,
    }

    /// <summary>Scope tag (DECISIONS §6–7). A build places only the statuses its milestone allows (10_UNITY_TECH §6.3 #11).</summary>
    public enum Status : byte
    {
        [EnumMember(Value = "MUST-A")] MustA = 0,
        [EnumMember(Value = "MUST-B")] MustB = 1,
        [EnumMember(Value = "SHOULD")] Should = 2,
        [EnumMember(Value = "LATER")] Later = 3,
    }

    /// <summary>Which milestone a build is (10_UNITY_TECH §6.2 <c>PlannerInputs.buildMilestone</c>).</summary>
    public enum BuildMilestone : byte
    {
        [EnumMember(Value = "A")] A = 0,
        [EnumMember(Value = "B")] B = 1,
    }

    /// <summary>
    /// The frog verbs (02_HERO_AND_CONTROLS §7). Hop, Tongue and Croak are the ranked verbs (ranks I–IV) and come
    /// first, so <c>(int)verb &lt; 3</c> means "ranked".
    /// </summary>
    public enum Verb : byte
    {
        [EnumMember(Value = "hop")] Hop = 0,
        [EnumMember(Value = "tongue")] Tongue = 1,
        [EnumMember(Value = "croak")] Croak = 2,
        [EnumMember(Value = "shove")] Shove = 3,
        [EnumMember(Value = "power")] Power = 4,
    }

    /// <summary>Bot plan stages (05 §1.3; 10_UNITY_TECH §12.3).</summary>
    public enum BotStage : byte
    {
        [EnumMember(Value = "explore")] Explore = 0,
        [EnumMember(Value = "theorise")] Theorise = 1,
        [EnumMember(Value = "execute")] Execute = 2,
    }

    /// <summary>Goal-graph actions a Rival can run (10_UNITY_TECH §12.1).</summary>
    public enum BotAction : byte
    {
        [EnumMember(Value = "go_to")] GoTo = 0,
        [EnumMember(Value = "tongue")] Tongue = 1,
        [EnumMember(Value = "carry")] Carry = 2,
        [EnumMember(Value = "spit")] Spit = 3,
        [EnumMember(Value = "hop")] Hop = 4,
        [EnumMember(Value = "croak")] Croak = 5,
        [EnumMember(Value = "shove")] Shove = 6,
        [EnumMember(Value = "hold")] Hold = 7,
        [EnumMember(Value = "wait")] Wait = 8,
        [EnumMember(Value = "ping")] Ping = 9,
        [EnumMember(Value = "bark")] Bark = 10,
        [EnumMember(Value = "follow")] Follow = 11,
        [EnumMember(Value = "vote")] Vote = 12,
    }

    /// <summary>
    /// Difficulty chosen at the entrance (04 §11.1; 10_UNITY_TECH §4.2 "Easy, Normal, Hard, Hell, Sealed").
    /// <see cref="Sealed"/> is the opt-in modifier, never a <c>PlannerInputs.difficulty</c> value (that uses 0–3).
    /// </summary>
    public enum Difficulty : byte
    {
        [EnumMember(Value = "easy")] Easy = 0,
        [EnumMember(Value = "normal")] Normal = 1,
        [EnumMember(Value = "hard")] Hard = 2,
        [EnumMember(Value = "hell")] Hell = 3,
        [EnumMember(Value = "sealed")] Sealed = 4,
    }

    /// <summary>What unlocks a difficulty for a lobby (04 §11.1 "Unlocked by (per lobby)").</summary>
    public enum UnlockRule : byte
    {
        [EnumMember(Value = "always")] Always = 0,
        [EnumMember(Value = "cleared_keeper")] ClearedKeeper = 1,
        [EnumMember(Value = "cleared_warden_on_hard")] ClearedWardenOnHard = 2,
    }

    /// <summary>
    /// A climb slot's door kind (10_UNITY_TECH §6.2). Toy doors and the gold door are breathers; door 0
    /// (<c>hatch_pond</c>) is <see cref="Onboarding"/> and appears only in a <see cref="ClimbTemplate"/>.
    /// </summary>
    public enum DoorKind : byte
    {
        [EnumMember(Value = "breather")] Breather = 0,
        [EnumMember(Value = "rule")] Rule = 1,
        [EnumMember(Value = "heart")] Heart = 2,
        [EnumMember(Value = "set_piece")] SetPiece = 3,
        [EnumMember(Value = "keeper")] Keeper = 4,
        [EnumMember(Value = "warden")] Warden = 5,
        [EnumMember(Value = "onboarding")] Onboarding = 6,
    }

    /// <summary>How many doors a slot shows (10_UNITY_TECH §6.2): one, a walk-vote pair, or a fork the party may split on.</summary>
    public enum SlotType : byte
    {
        [EnumMember(Value = "single")] Single = 0,
        [EnumMember(Value = "pair")] Pair = 1,
        [EnumMember(Value = "fork")] Fork = 2,
    }

    /// <summary>Slot overlay (10_UNITY_TECH §6.2; 05 §3.5).</summary>
    public enum Overlay : byte
    {
        [EnumMember(Value = "none")] None = 0,
        [EnumMember(Value = "gold")] Gold = 1,
        [EnumMember(Value = "rematch")] Rematch = 2,
        [EnumMember(Value = "heart")] Heart = 3,
    }

    /// <summary>The three forms of <see cref="RoomRef"/> (10_UNITY_TECH §6.2–6.3).</summary>
    public enum RoomRefKind : byte
    {
        /// <summary>A fixed room id.</summary>
        [EnumMember(Value = "room")] Room = 0,
        /// <summary>The side of an earlier slot the party did not choose (DECISIONS §5 pool rule).</summary>
        [EnumMember(Value = "unchosen_of")] UnchosenOf = 1,
        /// <summary>The Rematch pick: best-cleared room with the longest old time (10_UNITY_TECH §6.3 #6).</summary>
        [EnumMember(Value = "cleared_earlier")] ClearedEarlier = 2,
    }

    /// <summary>
    /// Plaque letter (05 §3.3; DECISIONS §5 "plaque letters always match the suit"). <see cref="None"/> for breathers,
    /// the Keeper and the Warden, and for an <c>UnchosenOf</c> side whose letter is derived from the resolved room.
    /// </summary>
    public enum PlaqueLetter : byte
    {
        [EnumMember(Value = "none")] None = 0,
        [EnumMember(Value = "A")] A = 1,
        [EnumMember(Value = "B")] B = 2,
        [EnumMember(Value = "C")] C = 3,
        [EnumMember(Value = "E")] E = 4,
    }

    /// <summary>Which of a room's two Twists are live in a slot (05 §4.2 #10: one, both in Hell, none in climb 1).</summary>
    public enum TwistMask : byte
    {
        [EnumMember(Value = "none")] None = 0,
        [EnumMember(Value = "a")] A = 1,
        [EnumMember(Value = "b")] B = 2,
        [EnumMember(Value = "both")] Both = 3,
    }

    /// <summary>Rows of the firefly yield table (04 §2.2; 10_UNITY_TECH §4.3 GrowthTable).</summary>
    public enum YieldKind : byte
    {
        /// <summary>Door 0, <c>hatch_pond</c>: one 30-firefly cloud.</summary>
        [EnumMember(Value = "hatch")] Hatch = 0,
        [EnumMember(Value = "breather")] Breather = 1,
        /// <summary>Rule, Heart, E and Rematch doors.</summary>
        [EnumMember(Value = "rule")] Rule = 2,
        [EnumMember(Value = "set_piece")] SetPiece = 3,
        [EnumMember(Value = "keeper")] Keeper = 4,
        [EnumMember(Value = "warden")] Warden = 5,
        /// <summary>Gold door: <see cref="GrowthTable.goldClearMultiplier"/> × the rule row's clear bonus, no loose.</summary>
        [EnumMember(Value = "gold")] Gold = 6,
    }

    /// <summary>How the authored climb hands out a Boon at a door (04 §6.1 grant plan).</summary>
    public enum GrantKind : byte
    {
        /// <summary>A named Boon (Shatter Croak at 2, Moon Hop at 9).</summary>
        [EnumMember(Value = "fixed")] Fixed = 0,
        /// <summary>A new Common from the door's suit family, matching the most-used verb.</summary>
        [EnumMember(Value = "new")] New = 1,
        /// <summary>The lowest-rank Boon of the door's family (else lowest overall) goes up a rank.</summary>
        [EnumMember(Value = "upgrade")] Upgrade = 2,
    }

    /// <summary>What a croak does to mites at a rank (02 §7.4.1).</summary>
    public enum MiteEffect : byte
    {
        [EnumMember(Value = "stun")] Stun = 0,
        [EnumMember(Value = "knockback")] Knockback = 1,
        [EnumMember(Value = "shatter")] Shatter = 2,
    }

    /// <summary>The 8 bindings plus Pause, which is not counted (02 §6; FO §3.9).</summary>
    public enum FrogAction : byte
    {
        [EnumMember(Value = "move")] Move = 0,
        [EnumMember(Value = "camera")] Camera = 1,
        [EnumMember(Value = "hop")] Hop = 2,
        [EnumMember(Value = "tongue")] Tongue = 3,
        [EnumMember(Value = "croak")] Croak = 4,
        [EnumMember(Value = "shove")] Shove = 5,
        [EnumMember(Value = "power")] Power = 6,
        [EnumMember(Value = "wheel")] Wheel = 7,
        [EnumMember(Value = "pause")] Pause = 8,
    }

    /// <summary>Input System action type for a binding (02 §6 "Input implementation").</summary>
    public enum InputActionKind : byte
    {
        [EnumMember(Value = "value")] Value = 0,
        [EnumMember(Value = "button")] Button = 1,
    }

    /// <summary>The stops on the Braid (01_WORLD §3.2, §4.3; 10_UNITY_TECH §5.2).</summary>
    public enum StopKind : byte
    {
        /// <summary>Strand 1 top: <c>hub_well_bottom</c> and the hatch pond.</summary>
        [EnumMember(Value = "foot")] Foot = 0,
        [EnumMember(Value = "landing")] Landing = 1,
        /// <summary>Landing 2, after the Keeper: the Quick Climb's save point.</summary>
        [EnumMember(Value = "keeper_landing")] KeeperLanding = 2,
        /// <summary>The bucket on strand 5: <c>warden_the_jar</c>.</summary>
        [EnumMember(Value = "warden_arena")] WardenArena = 3,
        /// <summary>The lip at y 180: <c>rim_surface</c>.</summary>
        [EnumMember(Value = "rim")] Rim = 4,
    }
}
