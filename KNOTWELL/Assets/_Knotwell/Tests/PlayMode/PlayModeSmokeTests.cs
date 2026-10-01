using System.Collections;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.TestTools;

namespace Game.Tests.PlayMode
{
    public class PlayModeSmokeTests
    {
        [UnityTest]
        public IEnumerator PlayerLoopTicks()
        {
            int start = Time.frameCount;
            yield return null;
            yield return null;
            Assert.Greater(Time.frameCount, start);
        }
    }
}
