using System;
using UnityEditor;

namespace Game.Editor
{
    /// <summary>
    /// Batchmode entry points (10_UNITY_TECH §17): <c>node Tools/unity_gate.mjs exec Game.Editor.Cli.&lt;Method&gt;</c>.
    /// <see cref="Main"/> is the plain-batchmode fallback that runs any <see cref="KwCommandAttribute"/> command.
    /// </summary>
    public static class Cli
    {
        /// <summary>Gate smoke test: proves executeMethod reaches the editor assembly.</summary>
        public static void Ping() => UnityEngine.Debug.Log("[KNOTWELL] ping ok");

        /// <summary>
        /// Runs the commands named on the command line and throws when any fails, so batchmode exits non-zero:
        /// <code>
        /// node Tools/unity_gate.mjs exec Game.Editor.Cli.Main -- -kwCommand kw_build_rooms -kwArgs "--id bell_golem"
        /// node Tools/unity_gate.mjs exec Game.Editor.Cli.Main -- -kwCommands "kw_generate_defs;kw_build_rooms;kw_validate"
        /// </code>
        /// <c>-kwArgs</c> takes a JSON object or <c>--key value</c> pairs; with <c>-kwCommands</c> it is shared by every
        /// entry, and an entry's own <c>--key value</c> pairs override it. Every launch costs minutes, so batch.
        /// </summary>
        public static void Main()
        {
            KwCliResult result = KwCliRun.Run(Environment.GetCommandLineArgs(), KwCommandRegistry.FromLoadedAssemblies(), KwLog.UnitySink, AssetDatabase.SaveAssets);
            if (!result.Succeeded) throw new KwCommandException("[KNOTWELL] cli " + result.FailureSummary);
        }
    }
}
