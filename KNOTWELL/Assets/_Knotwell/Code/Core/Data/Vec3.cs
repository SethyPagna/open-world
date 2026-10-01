using System;
using System.Globalization;

namespace Game.Core.Data
{
    /// <summary>
    /// Game.Core's own 3-vector (10_UNITY_TECH §3.2: Core has no UnityEngine, so records carry their own Vec3).
    /// Metres, +Y up. In JSON it is a 3-number array <c>[x, y, z]</c> (05 §1.2 <c>"pos": [0, 0, 5.5]</c>).
    /// Game.Content converts it with <c>new Vector3(v.x, v.y, v.z)</c>.
    /// </summary>
    [Serializable]
    public struct Vec3 : IEquatable<Vec3>
    {
        public float x;
        public float y;
        public float z;

        public Vec3(float x, float y, float z)
        {
            this.x = x;
            this.y = y;
            this.z = z;
        }

        public static Vec3 Zero => default;

        public bool Equals(Vec3 other) => x.Equals(other.x) && y.Equals(other.y) && z.Equals(other.z);
        public override bool Equals(object obj) => obj is Vec3 other && Equals(other);
        public override int GetHashCode() => HashCode.Combine(x, y, z);
        public static bool operator ==(Vec3 a, Vec3 b) => a.Equals(b);
        public static bool operator !=(Vec3 a, Vec3 b) => !a.Equals(b);

        public override string ToString() =>
            string.Format(CultureInfo.InvariantCulture, "[{0}, {1}, {2}]", x, y, z);
    }
}
