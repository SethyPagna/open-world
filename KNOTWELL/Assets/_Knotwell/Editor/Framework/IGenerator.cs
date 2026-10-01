using System;
using System.Collections.Generic;
using System.IO;
using UnityEngine;

namespace Game.Editor
{
    /// <summary>
    /// A generator: reads <c>Data/*.json</c> (and other inputs) and writes assets under <c>Generated/</c>
    /// (10_UNITY_TECH §4.1, §4.4). Declare it on a class with <see cref="GeneratorAttribute"/> and a public
    /// parameterless constructor; <see cref="GeneratorRunner"/> finds, orders and skips it.
    /// <para>
    /// Skipping: the runner hashes the files named by <see cref="Inputs"/> (plus the attribute's id and version) and
    /// records the hash in <c>Generated/gen_manifest.json</c>. An unchanged hash skips the generator unless
    /// <c>--force</c> is given. A generator that builds items one by one (rooms) can also skip per item through
    /// <see cref="GenerateContext.IsUpToDate"/> and <see cref="GenerateContext.MarkGenerated"/>.
    /// </para>
    /// </summary>
    public interface IGenerator
    {
        /// <summary>
        /// Project-relative paths (files or folders, '/' separators, e.g. <c>Assets/_Knotwell/Data/rooms</c>) whose
        /// bytes decide whether this generator must run. Folders are read recursively, <c>.meta</c> files excluded;
        /// a missing path hashes as missing, so creating it triggers a run.
        /// </summary>
        IEnumerable<string> Inputs(GenerateContext context);

        /// <summary>
        /// Does the work and returns a summary. Throws on failure (<see cref="KwCommandException"/> for expected
        /// failures); the runner then records nothing and stops. Return <see cref="GenerateResult.Partial"/> when only
        /// part of the output was rebuilt (a <c>--id</c> filter), so the whole-generator hash is not recorded.
        /// </summary>
        GenerateResult Generate(GenerateContext context);
    }

    /// <summary>
    /// Declares a generator's id and its place in the pipeline order of 10_UNITY_TECH §4.4 (lower runs first; use
    /// <see cref="GeneratorOrder"/>). The attribute is the single source of both, so they cannot disagree.
    /// </summary>
    [AttributeUsage(AttributeTargets.Class, AllowMultiple = false, Inherited = false)]
    public sealed class GeneratorAttribute : Attribute
    {
        /// <summary>Declares a generator.</summary>
        /// <param name="id">Stable lower-case id and manifest key, e.g. <c>defs</c>, <c>rooms</c>, <c>layer_well</c>.</param>
        /// <param name="order">Pipeline position; see <see cref="GeneratorOrder"/>.</param>
        public GeneratorAttribute(string id, int order)
        {
            Id = id;
            Order = order;
        }

        /// <summary>Stable id and manifest key.</summary>
        public string Id { get; }

        /// <summary>Pipeline position (lower runs first; ties run in id order).</summary>
        public int Order { get; }

        /// <summary>Bump when the generator's code changes its output, so every hash changes and it re-runs.</summary>
        public int Version { get; set; } = 1;

        /// <summary>One line for listings.</summary>
        public string Description { get; set; } = "";
    }

    /// <summary>The pipeline slots of 10_UNITY_TECH §4.4, spaced so new generators can sit between them.</summary>
    public static class GeneratorOrder
    {
        /// <summary>Step 0: project settings, tags and layers (§2.3), before anything is generated.</summary>
        public const int ProjectSettings = 0;

        /// <summary>Step 1: <c>kw_generate_defs</c> (JSON → records → ScriptableObjects, registry, strings, input asset).</summary>
        public const int Defs = 100;

        /// <summary>Between defs and rooms: hero prefab, network prefab list and other prefabs rooms may instance.</summary>
        public const int Prefabs = 150;

        /// <summary>Step 2: <c>kw_build_rooms</c> (RoomSpec layout + kit → room prefabs, cells).</summary>
        public const int Rooms = 200;

        /// <summary>Step 3: <c>kw_build_layer</c> (<c>Well.unity</c>).</summary>
        public const int Layer = 300;

        /// <summary>Step 4: <c>kw_bake</c> (APV, NavMesh; GPU desktop only).</summary>
        public const int Bake = 400;
    }

    /// <summary>What a generator returns.</summary>
    public readonly struct GenerateResult
    {
        /// <summary>One line, e.g. <c>built 3 room(s)</c>.</summary>
        public readonly string Summary;

        /// <summary>False when only part of the output was rebuilt; the runner then keeps the old manifest hash.</summary>
        public readonly bool Complete;

        /// <summary>A result.</summary>
        public GenerateResult(string summary, bool complete = true)
        {
            Summary = summary ?? "";
            Complete = complete;
        }

        /// <summary>A full rebuild.</summary>
        public static GenerateResult Done(string summary) => new GenerateResult(summary, true);

        /// <summary>A filtered rebuild (for example <c>--id bell_golem</c>).</summary>
        public static GenerateResult Partial(string summary) => new GenerateResult(summary, false);
    }

    /// <summary>What a generator can see while it runs.</summary>
    public sealed class GenerateContext
    {
        readonly Action<LogType, string> log;

        /// <summary>Creates a context (the runner does this).</summary>
        public GenerateContext(string projectRoot, IReadOnlyDictionary<string, string> args, bool force, GenManifest manifest, Action<LogType, string> log)
        {
            ProjectRoot = Path.GetFullPath(projectRoot ?? throw new ArgumentNullException(nameof(projectRoot)));
            Args = args ?? KwArgs.Empty;
            Force = force;
            Manifest = manifest ?? throw new ArgumentNullException(nameof(manifest));
            this.log = log ?? KwLog.UnitySink;
        }

        /// <summary>The Unity project root (the folder holding <c>Assets/</c>).</summary>
        public string ProjectRoot { get; }

        /// <summary>The command's arguments (e.g. <c>--id</c>).</summary>
        public IReadOnlyDictionary<string, string> Args { get; }

        /// <summary><c>--force</c>: ignore every recorded hash.</summary>
        public bool Force { get; }

        /// <summary>The manifest being updated.</summary>
        public GenManifest Manifest { get; }

        /// <summary>Absolute path of a project-relative path.</summary>
        public string FullPath(string projectRelative) => Path.GetFullPath(Path.Combine(ProjectRoot, projectRelative ?? ""));

        /// <summary>The content hash of project-relative inputs (see <see cref="InputHasher"/>).</summary>
        public ulong HashInputs(IEnumerable<string> projectRelativePaths) => InputHasher.Hash(ProjectRoot, projectRelativePaths);

        /// <summary>True when <paramref name="key"/> was generated from exactly <paramref name="hash"/> and --force is off.</summary>
        public bool IsUpToDate(string key, ulong hash) => !Force && Manifest.Matches(key, hash);

        /// <summary>Records that <paramref name="key"/> (e.g. <c>rooms/bell_golem</c>) was generated from <paramref name="hash"/>.</summary>
        public void MarkGenerated(string key, ulong hash, string summary) => Manifest.Record(key, hash, summary, DateTime.UtcNow);

        /// <summary>Writes a <c>[KNOTWELL]</c> progress line.</summary>
        public void Log(string message) => log(LogType.Log, message);

        /// <summary>Writes a <c>[KNOTWELL]</c> warning line.</summary>
        public void Warn(string message) => log(LogType.Warning, message);
    }
}
