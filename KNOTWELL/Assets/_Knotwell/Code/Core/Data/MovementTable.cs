using System;

namespace Game.Core.Data
{
    /// <summary>
    /// The motor's numbers, mirroring <c>Data/hero/movement.json</c> (10_UNITY_TECH §4.2 MovementTable, §8.2;
    /// every value owned by 02_HERO_AND_CONTROLS §7.1–7.2 and §7.3.2). Rank-dependent hop numbers live in
    /// <see cref="VerbRankTable"/>; this table holds everything that does not change with rank.
    /// </summary>
    [Serializable]
    public sealed class MovementTable : IDefinition
    {
        /// <summary><c>movement</c>.</summary>
        public string id;
        public CapsuleSpec capsule;
        public GroundMoveSpec ground;
        public AirMoveSpec air;
        public GravitySpec gravity;
        /// <summary>0.12 s (FO §6.2).</summary>
        public float coyoteSec;
        /// <summary>0.10 s (FO §6.2).</summary>
        public float jumpBufferSec;
        public HopMoveSpec hop;
        public AirHopSpec airHop;
        public ScrambleSpec scramble;
        public SpeedModifierSpec speeds;
        public PushSpec push;
        public WaterMoveSpec water;
        public GripSpec grip;
        public GlideSpec glide;
        public GrappleSpec grapple;
        public LandingImpactSpec landing;

        string IDefinition.Id => id;
    }

    /// <summary>The one frog hitbox, identical for every frog, level, class and cosmetic (DECISIONS §2; 10 §8.2).</summary>
    [Serializable]
    public sealed class CapsuleSpec
    {
        public float radiusM;
        public float heightM;
        public float skinM;
        /// <summary>25 kg: counts toward raft torque and the landing impulse (02 §7.1, §7.2.9).</summary>
        public float massKg;
    }

    /// <summary>Ground movement (02 §7.1). There is no sprint.</summary>
    [Serializable]
    public sealed class GroundMoveSpec
    {
        public float speedMps;
        public float accelMps2;
        public float decelMps2;
        public float turnRateDegPerSec;
        public float stepOffsetM;
        public float slopeLimitDeg;
        /// <summary>Steeper slopes slide you down at this speed.</summary>
        public float slopeSlideMps;
        /// <summary>Ground snap distance (10_UNITY_TECH §8.2, GH; 02 gives none).</summary>
        public float groundSnapM;
    }

    /// <summary>Air control (02 §7.1): 40% acceleration, drag only without input.</summary>
    [Serializable]
    public sealed class AirMoveSpec
    {
        public float accelMps2;
        public float noInputDecelMps2;
    }

    /// <summary>Gravity (02 §7.2.1): rise and fall differ for a snappy fall.</summary>
    [Serializable]
    public sealed class GravitySpec
    {
        public float riseMps2;
        public float fallMps2;
        public float terminalMps;
    }

    /// <summary>The one hop rule, "move to hop, stand to leap" (02 §7.2.2).</summary>
    [Serializable]
    public sealed class HopMoveSpec
    {
        /// <summary>Stick magnitude that counts as move input (0.2).</summary>
        public float moveInputThreshold;
        /// <summary>Releases before this are tap hops (0.10 s).</summary>
        public float chargeStartSec;
        /// <summary>Full charge (0.45 s).</summary>
        public float chargeFullSec;
        /// <summary>Crouch-shuffle while charging (1.2 m/s).</summary>
        public float chargeShuffleMps;
        /// <summary>Horizontal speed of a leap with no move input, along the facing (0.8 m/s).</summary>
        public float standingLeapMps;
        /// <summary>Charged-leap horizontal speed at c = 0 (2.0 m/s); it rises to the rank's H at c = 1.</summary>
        public float leapBaseHorizontalMps;
        /// <summary>The arc preview appears after this much charging (0.15 s).</summary>
        public float arcPreviewDelaySec;
        /// <summary>Carrying 5–20 kg multiplies every apex by this (0.7).</summary>
        public float carryApexMultiplier;
    }

    /// <summary>Air Hop, the Hop III Awakening (02 §7.2.4).</summary>
    [Serializable]
    public sealed class AirHopSpec
    {
        /// <summary>6.32 m/s: +1.0 m above the trigger point.</summary>
        public float vyMps;
        /// <summary>Redirected horizontal speed is at least this (2.0 m/s).</summary>
        public float minRedirectMps;
        /// <summary>A press is buffered instead when ground contact is predicted within this (0.10 s).</summary>
        public float landingPredictSec;
        public float flipSec;
    }

    /// <summary>The ledge grab (02 §7.2.5).</summary>
    [Serializable]
    public sealed class ScrambleSpec
    {
        /// <summary>The ledge top may be at most this above your feet (0.10 m).</summary>
        public float marginM;
        /// <summary>Your centre must be within this of the edge (0.35 m).</summary>
        public float edgeReachM;
        public float durationSec;
    }

    /// <summary>Speed modifiers (02 §7.1 table; co-carry from §7.3.2).</summary>
    [Serializable]
    public sealed class SpeedModifierSpec
    {
        /// <summary>Carrying up to this is full speed (5 kg).</summary>
        public float carryLightMaxKg;
        /// <summary>Heaviest single carry (20 kg).</summary>
        public float carryHeavyMaxKg;
        public float carryHeavyMps;
        /// <summary>Two tongues on one prop (40 kg) move at this.</summary>
        public float coCarryMps;
        public float croakSustainMps;
        public float shallowWaterMps;
        public float swimMps;
        public float ghostMps;
    }

    /// <summary>Walking into props (02 §7.1 "Pushing and platforms").</summary>
    [Serializable]
    public sealed class PushSpec
    {
        public float forceN;
        /// <summary>Props up to this slide when pushed.</summary>
        public float slideMaxKg;
    }

    /// <summary>Water (02 §7.2.7). Water is safe by default.</summary>
    [Serializable]
    public sealed class WaterMoveSpec
    {
        /// <summary>Wading depth limit (0.5 m); deeper water is swum.</summary>
        public float shallowDepthM;
        public float swimPitchDeg;
        /// <summary>Water hop: 1.0 m above the surface.</summary>
        public float waterHopVyMps;
    }

    /// <summary>Grip surfaces, the PEAK layer, per frog (02 §7.2.6) [MUST-B].</summary>
    [Serializable]
    public sealed class GripSpec
    {
        public float start;
        public float clingDrainPerSec;
        public float climbDrainPerSec;
        public float climbMps;
        public float wallHopCost;
        public float groundRefillPerSec;
        /// <summary>Standing on a ledge at least this deep refills grip.</summary>
        public float refillLedgeDepthM;
        public float emptySlideMps;
        public float emptySlideSec;
        public float wallHopUpApexM;
        public float wallHopNeutralApexM;
        public float wallHopAwayApexM;
        public float wallHopAwayMps;
        /// <summary>Hold the stick away from the wall this long to drop.</summary>
        public float letGoHoldSec;
    }

    /// <summary>Glide, the Glider molt's numbers (02 §7.2.8) [MUST-B for the Rim]. Gravity is not changed.</summary>
    [Serializable]
    public sealed class GlideSpec
    {
        public float fallCapMps;
        public float accelMps2;
        public float topSpeedMps;
        public float turnRateDegPerSec;
        /// <summary>Per airborne phase (2.0 s).</summary>
        public float durationSec;
    }

    /// <summary>Grapple zip to an anchor (02 §7.3.2), from Tongue II.</summary>
    [Serializable]
    public sealed class GrappleSpec
    {
        public float zipMps;
        /// <summary>Velocity kept on release is capped at this.</summary>
        public float releaseCapMps;
        /// <summary>Arriving within this pops you up so you land on top.</summary>
        public float arriveM;
        public float popVyMps;
    }

    /// <summary>Landings and fall damage (02 §7.2.9, §8.6).</summary>
    [Serializable]
    public sealed class LandingImpactSpec
    {
        /// <summary>Splat: 0.25 s recovery, no damage (3 m).</summary>
        public float splatDropM;
        /// <summary>Splat and −1 spot (6 m).</summary>
        public float damageDropM;
        public float splatRecoverySec;
        /// <summary>Raft/platform landing impulse = frog mass × landing speed × this (0.5).</summary>
        public float platformImpulseFactor;
    }
}
