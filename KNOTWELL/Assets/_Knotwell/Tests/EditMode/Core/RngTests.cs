using Game.Core.Random;
using NUnit.Framework;

// Tests under Tests/EditMode/Core must not use UnityEngine: they also run under `dotnet test Tools/CoreTests`.
namespace Game.Tests.EditMode.Core
{
    public class RngTests
    {
        [Test]
        public void Pcg32_MatchesReferenceVector()
        {
            // pcg32-demo: pcg32_srandom_r(&rng, 42u, 54u), first six outputs.
            var rng = new Pcg32(42UL, 54UL);
            uint[] expected = { 0xa15c02b7u, 0x7b47f409u, 0xba1d3330u, 0x83d2f293u, 0xbfa4784bu, 0xcbed606eu };
            foreach (var e in expected) Assert.AreEqual(e, rng.NextUInt());
        }

        [Test]
        public void Stream_IsDeterministicAndPurposeSeparated()
        {
            var a = Pcg32.Stream(1234UL, "plan");
            var b = Pcg32.Stream(1234UL, "plan");
            var c = Pcg32.Stream(1234UL, "gold");
            var d = Pcg32.Stream(1234UL, "plan", 1);
            uint a0 = a.NextUInt();
            Assert.AreEqual(a0, b.NextUInt());
            Assert.AreNotEqual(a0, c.NextUInt());
            Assert.AreNotEqual(a0, d.NextUInt());
        }

        [Test]
        public void BoundedValues_StayInRangeAndCoverIt()
        {
            var rng = Pcg32.Stream(7UL, "test");
            var seen = new bool[6];
            for (int i = 0; i < 10000; i++)
            {
                int v = rng.Range(0, 6);
                Assert.That(v, Is.InRange(0, 5));
                seen[v] = true;
                float f = rng.NextFloat();
                Assert.That(f, Is.GreaterThanOrEqualTo(0f).And.LessThan(1f));
            }
            Assert.That(seen, Is.All.True);
        }

        [Test]
        public void Hash64_IsStable()
        {
            Assert.AreEqual(Hash64.Of("bell_golem"), Hash64.Of("bell_golem"));
            Assert.AreNotEqual(Hash64.Of("bell_golem"), Hash64.Of("bell_golen"));
        }
    }
}
