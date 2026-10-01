using System;
using System.Text.RegularExpressions;

namespace Game.Editor
{
    /// <summary>
    /// Marks a static method as a KNOTWELL editor command (10_UNITY_TECH §17), reachable in plain batchmode through
    /// <c>node Tools/unity_gate.mjs exec Game.Editor.Cli.Main -- -kwCommand &lt;name&gt;</c>.
    /// <para>
    /// The method must be <c>static</c>, take either no parameters or one
    /// <c>IReadOnlyDictionary&lt;string, string&gt;</c> (read it with <see cref="KwArgsExtensions"/>), and return
    /// <c>void</c> or a <c>string</c> one-line summary. It reports failure by throwing
    /// (<see cref="KwCommandException"/> for expected failures), so batchmode exits non-zero.
    /// </para>
    /// <example><code>
    /// [KwCommand("kw_build_rooms", "Build room shell prefabs from Data/rooms/*.json")]
    /// public static string BuildRooms(IReadOnlyDictionary&lt;string, string&gt; args) =&gt; ...;
    /// </code></example>
    /// </summary>
    [AttributeUsage(AttributeTargets.Method, AllowMultiple = false, Inherited = false)]
    public sealed class KwCommandAttribute : Attribute
    {
        /// <summary>Command names are <c>kw_</c> + lower snake case, as in 10_UNITY_TECH §17.</summary>
        public static readonly Regex NamePattern = new Regex("^kw_[a-z][a-z0-9_]*$", RegexOptions.CultureInvariant);

        /// <summary>Declares a command.</summary>
        /// <param name="name">The command name, e.g. <c>kw_build_rooms</c>.</param>
        /// <param name="description">One line for <c>kw_help</c>, including the arguments it reads.</param>
        public KwCommandAttribute(string name, string description)
        {
            Name = name;
            Description = description;
        }

        /// <summary>The command name.</summary>
        public string Name { get; }

        /// <summary>The one-line help text.</summary>
        public string Description { get; }
    }
}
