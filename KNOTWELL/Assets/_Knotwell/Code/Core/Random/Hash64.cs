namespace Game.Core.Random
{
    /// <summary>
    /// Stable 64-bit hash (FNV-1a, then a SplitMix64 finaliser). Unlike string.GetHashCode it is identical on every
    /// machine and run, so it is safe for seeds, content hashes and network checks.
    /// </summary>
    public static class Hash64
    {
        const ulong Offset = 0xCBF29CE484222325UL;
        const ulong Prime = 0x100000001B3UL;

        /// <summary>Hashes the UTF-16 code units of <paramref name="s"/> (null hashes like the empty string).</summary>
        public static ulong Of(string s)
        {
            ulong h = Offset;
            if (s != null)
                for (int i = 0; i < s.Length; i++)
                {
                    char c = s[i];
                    h = (h ^ (byte)c) * Prime;
                    h = (h ^ (byte)(c >> 8)) * Prime;
                }
            return SplitMix64.Mix(h);
        }

        public static ulong Of(byte[] data)
        {
            ulong h = Offset;
            if (data != null)
                for (int i = 0; i < data.Length; i++) h = (h ^ data[i]) * Prime;
            return SplitMix64.Mix(h);
        }

        /// <summary>Order-dependent combination of two hashes.</summary>
        public static ulong Combine(ulong a, ulong b) => SplitMix64.Mix(a ^ (b + SplitMix64.Gamma + (a << 6) + (a >> 2)));
    }
}
