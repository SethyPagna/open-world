namespace Game.Core.Random
{
    /// <summary>SplitMix64 (Steele, Lea, Flood 2014). Used to derive well-spread seeds for <see cref="Pcg32"/> streams.</summary>
    public static class SplitMix64
    {
        public const ulong Gamma = 0x9E3779B97F4A7C15UL;

        /// <summary>One SplitMix64 output for the given input (stateless mix).</summary>
        public static ulong Mix(ulong x)
        {
            ulong z = x + Gamma;
            z = (z ^ (z >> 30)) * 0xBF58476D1CE4E5B9UL;
            z = (z ^ (z >> 27)) * 0x94D049BB133111EBUL;
            return z ^ (z >> 31);
        }

        /// <summary>Advances <paramref name="state"/> and returns the next output.</summary>
        public static ulong Next(ref ulong state)
        {
            ulong z = state += Gamma;
            z = (z ^ (z >> 30)) * 0xBF58476D1CE4E5B9UL;
            z = (z ^ (z >> 27)) * 0x94D049BB133111EBUL;
            return z ^ (z >> 31);
        }
    }
}
