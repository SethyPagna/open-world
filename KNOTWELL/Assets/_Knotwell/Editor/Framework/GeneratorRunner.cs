using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Game.Core.Random;
using UnityEditor;
using UnityEngine;

namespace Game.Editor
{
    /// <summary>A discovered generator: its declaration plus an instance.</summary>
    public sealed class GeneratorInfo
    {
        /// <summary>Pairs a declaration with its instance.</summary>
        public GeneratorInfo(GeneratorAttribute declaration, IGenerator instance)
        {
            Declaration = declaration ?? throw new ArgumentNullException(nameof(declaration));
            Instance = instance ?? throw new ArgumentNullException(nameof(instance));
        }

        /// <summary>The attribute (id, order, version).</summary>
        public GeneratorAttribute Declaration { get; }

        /// <summary>The generator.</summary>
        public IGenerator Instance { get; }

        /// <summary>Shorthand for <see cref="GeneratorAttribute.Id"/>.</summary>
        public string Id => Declaration.Id;

        /// <summary>Shorthand for <see cref="GeneratorAttribute.Order"/>.</summary>
        public int Order => Declaration.Order;
    }

    /// <summary>What happened to one generator in a run.</summary>
    public enum GeneratorStatus
    {
        /// <summary>Ran and recorded its hash.</summary>
        Generated,

        /// <summary>Ran a filtered subset; the whole-generator hash was not recorded.</summary>
        GeneratedPartially,

        /// <summary>Inputs unchanged since the recorded run.</summary>
        UpToDate,

        /// <summary>Threw; nothing recorded.</summary>
        Failed,

        /// <summary>Not run because an earlier generator failed.</summary>
        NotRun,
    }

    /// <summary>One generator's outcome.</summary>
    public readonly struct GeneratorOutcome
    {
        /// <summary>Generator id.</summary>
        public readonly string Id;

        /// <summary>What happened.</summary>
        public readonly GeneratorStatus Status;

        /// <summary>Summary or failure message.</summary>
        public readonly string Message;

        /// <summary>Creates an outcome.</summary>
        public GeneratorOutcome(string id, GeneratorStatus status, string message)
        {
            Id = id;
            Status = status;
            Message = message ?? "";
        }
    }

    /// <summary>
    /// Runs generators in 10_UNITY_TECH §4.4 order with <c>gen_manifest.json</c> skipping. Arguments it reads:
    /// <c>--force</c> (ignore recorded hashes) and <c>--only a,b</c> (run just these ids, still in order); every
    /// other argument is passed to the generators. It stops at the first failure and saves the manifest after every
    /// success, so a later failure never loses earlier progress. Generator commands (<c>kw_generate_defs</c>,
    /// <c>kw_build_rooms</c> ...) call <see cref="RunOrThrow"/>.
    /// </summary>
    public sealed class GeneratorRunner
    {
        readonly IReadOnlyList<GeneratorInfo> generators;
        readonly string projectRoot;
        readonly string manifestPath;
        readonly Action<LogType, string> log;

        /// <summary>Creates a runner over explicit generators (tests and tools).</summary>
        public GeneratorRunner(IEnumerable<GeneratorInfo> generators, string projectRoot, string manifestPath, Action<LogType, string> log)
        {
            var list = (generators ?? throw new ArgumentNullException(nameof(generators))).ToList();
            string dup = list.GroupBy(g => g.Id, StringComparer.Ordinal).Where(g => g.Count() > 1).Select(g => g.Key).FirstOrDefault();
            if (dup != null) throw new KwCommandException($"Generator id \"{dup}\" is declared more than once.");
            this.generators = list.OrderBy(g => g.Order).ThenBy(g => g.Id, StringComparer.Ordinal).ToArray();
            this.projectRoot = Path.GetFullPath(projectRoot ?? throw new ArgumentNullException(nameof(projectRoot)));
            this.manifestPath = manifestPath ?? Path.Combine(this.projectRoot, GenManifest.ProjectPath);
            this.log = log ?? KwLog.UnitySink;
        }

        /// <summary>The live runner: every [Generator] in the editor domain (test assemblies excluded), this project, the standard manifest.</summary>
        public static GeneratorRunner CreateDefault() =>
            new GeneratorRunner(Discover(TypeCache.GetTypesWithAttribute<GeneratorAttribute>().Where(t => !IsTestAssembly(t))),
                ProjectRoot, Path.Combine(ProjectRoot, GenManifest.ProjectPath), KwLog.UnitySink);

        /// <summary>The Unity project root (parent of <c>Assets/</c>).</summary>
        public static string ProjectRoot => Path.GetFullPath(Path.Combine(Application.dataPath, ".."));

        /// <summary>Generators in run order.</summary>
        public IReadOnlyList<GeneratorInfo> Generators => generators;

        /// <summary>
        /// Instantiates every type that has <see cref="GeneratorAttribute"/>, implements <see cref="IGenerator"/>
        /// and has a public parameterless constructor; throws <see cref="KwCommandException"/> listing the types
        /// that don't.
        /// </summary>
        public static IReadOnlyList<GeneratorInfo> Discover(IEnumerable<Type> types)
        {
            var found = new List<GeneratorInfo>();
            var bad = new List<string>();
            foreach (Type t in types)
            {
                var attr = (GeneratorAttribute)Attribute.GetCustomAttribute(t, typeof(GeneratorAttribute), false);
                if (attr == null) continue;
                if (t.IsAbstract || !typeof(IGenerator).IsAssignableFrom(t) || t.GetConstructor(Type.EmptyTypes) == null)
                {
                    bad.Add($"{t.FullName} (needs to be a concrete IGenerator with a public parameterless constructor)");
                    continue;
                }
                if (string.IsNullOrWhiteSpace(attr.Id))
                {
                    bad.Add($"{t.FullName} (empty generator id)");
                    continue;
                }
                found.Add(new GeneratorInfo(attr, (IGenerator)Activator.CreateInstance(t)));
            }
            if (bad.Count > 0) throw new KwCommandException("Invalid generator declarations: " + string.Join("; ", bad));
            return found;
        }

        /// <summary>
        /// Runs the generators selected by <paramref name="ids"/> (all when empty, further filtered by
        /// <c>--only</c>) and returns each outcome. Never throws for a generator failure.
        /// </summary>
        public IReadOnlyList<GeneratorOutcome> Run(IReadOnlyDictionary<string, string> args, params string[] ids)
        {
            args ??= KwArgs.Empty;
            bool force = args.GetBool("force");
            HashSet<string> selected = Select(ids, args.GetList("only"));
            GenManifest manifest = GenManifest.Load(manifestPath, out bool discarded);
            if (discarded) log(LogType.Warning, $"gen: {GenManifest.ProjectPath} was unreadable or another schema; every generator runs once.");

            var context = new GenerateContext(projectRoot, args, force, manifest, log);
            var outcomes = new List<GeneratorOutcome>();
            bool failed = false;
            foreach (GeneratorInfo g in generators.Where(g => selected == null || selected.Contains(g.Id)))
            {
                if (failed)
                {
                    outcomes.Add(new GeneratorOutcome(g.Id, GeneratorStatus.NotRun, "an earlier generator failed"));
                    continue;
                }
                GeneratorOutcome outcome = RunOne(g, context, manifest);
                outcomes.Add(outcome);
                failed = outcome.Status == GeneratorStatus.Failed;
            }
            return outcomes;
        }

        /// <summary>
        /// <see cref="Run"/>, then a one-line summary for the command's result, or a
        /// <see cref="KwCommandException"/> when any generator failed or a requested id does not exist.
        /// </summary>
        public string RunOrThrow(IReadOnlyDictionary<string, string> args, params string[] ids)
        {
            IReadOnlyList<GeneratorOutcome> outcomes = Run(args, ids);
            if (outcomes.Count == 0)
                throw new KwCommandException($"No generator matched [{string.Join(", ", ids ?? Array.Empty<string>())}] (known: {string.Join(", ", generators.Select(g => g.Id))}).");
            GeneratorOutcome[] failures = outcomes.Where(o => o.Status == GeneratorStatus.Failed).ToArray();
            string summary = string.Join("; ", outcomes.Select(o => $"{o.Id}: {Describe(o)}"));
            if (failures.Length > 0) throw new KwCommandException(summary);
            return summary;
        }

        GeneratorOutcome RunOne(GeneratorInfo g, GenerateContext context, GenManifest manifest)
        {
            ulong hash;
            try
            {
                ulong identity = Hash64.Of($"generator:{g.Id}:v{g.Declaration.Version}");
                hash = Hash64.Combine(identity, context.HashInputs(g.Instance.Inputs(context) ?? Enumerable.Empty<string>()));
            }
            catch (Exception e)
            {
                log(LogType.Error, $"gen {g.Id}: could not hash inputs: {e.Message}");
                return new GeneratorOutcome(g.Id, GeneratorStatus.Failed, "could not hash inputs: " + e.Message);
            }

            if (context.IsUpToDate(g.Id, hash))
            {
                log(LogType.Log, $"gen {g.Id}: up to date");
                return new GeneratorOutcome(g.Id, GeneratorStatus.UpToDate, "up to date");
            }

            try
            {
                GenerateResult result = g.Instance.Generate(context);
                if (result.Complete) manifest.Record(g.Id, hash, result.Summary, DateTime.UtcNow);
                manifest.Save(manifestPath);
                log(LogType.Log, $"gen {g.Id}: {(result.Complete ? "generated" : "generated (partial)")}: {result.Summary}");
                return new GeneratorOutcome(g.Id, result.Complete ? GeneratorStatus.Generated : GeneratorStatus.GeneratedPartially, result.Summary);
            }
            catch (Exception e)
            {
                string msg = e is KwCommandException || e is KwArgsException ? e.Message : $"{e.GetType().Name}: {e.Message}";
                log(LogType.Error, $"gen {g.Id}: FAILED: {msg}");
                return new GeneratorOutcome(g.Id, GeneratorStatus.Failed, msg);
            }
        }

        HashSet<string> Select(string[] ids, IReadOnlyList<string> only)
        {
            HashSet<string> set = null;
            if (ids != null && ids.Length > 0) set = new HashSet<string>(ids, StringComparer.Ordinal);
            if (only.Count > 0) set = set == null ? new HashSet<string>(only, StringComparer.Ordinal) : new HashSet<string>(set.Intersect(only, StringComparer.Ordinal), StringComparer.Ordinal);
            if (set == null) return null;
            string unknown = set.FirstOrDefault(id => generators.All(g => g.Id != id));
            if (unknown != null) throw new KwCommandException($"Unknown generator \"{unknown}\" (known: {string.Join(", ", generators.Select(g => g.Id))}).");
            return set;
        }

        static string Describe(GeneratorOutcome o)
        {
            switch (o.Status)
            {
                case GeneratorStatus.Generated: return o.Message.Length > 0 ? o.Message : "generated";
                case GeneratorStatus.GeneratedPartially: return "partial: " + o.Message;
                case GeneratorStatus.UpToDate: return "up to date";
                case GeneratorStatus.Failed: return "FAILED: " + o.Message;
                default: return "not run";
            }
        }

        static bool IsTestAssembly(Type t)
        {
            string n = t.Assembly.GetName().Name;
            return n.StartsWith("Game.Tests", StringComparison.Ordinal) || n.IndexOf(".Tests", StringComparison.Ordinal) >= 0;
        }
    }
}
