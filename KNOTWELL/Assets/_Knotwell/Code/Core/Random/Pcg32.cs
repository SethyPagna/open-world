namespace Game.Core.Random
{
    /// <summary>
    /// PCG-XSH-RR: 32-bit output, 64-bit state (M. E. O'Neill, pcg-random.org). The only RNG gameplay code may use
    /// (10_UNITY_TECH §6.1). It is a struct: copy it to fork a sequence, pass it by ref to advance it.
    /// </summary>
    public struct Pcg32
    {
        const ulong Multiplier = 6364136223846793005UL;

        ulong state;
        readonly ulong inc;

        /// <summary>Same seeding as the reference <c>pcg32_srandom_r(initState, initSeq)</c>.</summary>
        public Pcg32(ulong initState, ulong initSeq)
        {
            state = 0UL;
            inc = (initSeq << 1) | 1UL;
            NextUInt();
            state += initState;
            NextUInt();
        }

        /// <summary>A named, independent stream: <c>Stream(seed, purpose, index)</c> from 10_UNITY_TECH §6.1.</summary>
        public static Pcg32 Stream(ulong seed, string purpose, ulong index = 0)
        {
            ulong key = SplitMix64.Mix(seed ^ Hash64.Of(purpose) ^ (index * SplitMix64.Gamma));
            return new Pcg32(key, SplitMix64.Mix(key));
        }

        public uint NextUInt()
        {
            ulong old = state;
            state = old * Multiplier + inc;
            uint xorShifted = (uint)(((old >> 18) ^ old) >> 27);
            int rot = (int)(old >> 59);
            return (xorShifted >> rot) | (xorShifted << ((-rot) & 31));
        }

        /// <summary>Uniform integer in [0, bound) without modulo bias. A bound of 0 returns 0.</summary>
        public uint NextUInt(uint bound)
        {
            if (bound == 0) return 0;
            uint threshold = unchecked(0u - bound) % bound;
            for (;;)
            {
                uint r = NextUInt();
                if (r >= threshold) return r % bound;
            }
        }

        /// <summary>Uniform integer in [minInclusive, maxExclusive).</summary>
        public int Range(int minInclusive, int maxExclusive)
        {
            if (maxExclusive <= minInclusive) return minInclusive;
            return minInclusive + (int)NextUInt((uint)(maxExclusive - minInclusive));
        }

        /// <summary>Uniform float in [0, 1) with 24 bits of precision.</summary>
        public float NextFloat() => (NextUInt() >> 8) * (1f / 16777216f);

        /// <summary>Uniform float in [min, max).</summary>
        public float Range(float min, float max) => min + (max - min) * NextFloat();

        /// <summary>True with probability <paramref name="p"/> (0..1).</summary>
        public bool Chance(float p) => NextFloat() < p;
    }
}
