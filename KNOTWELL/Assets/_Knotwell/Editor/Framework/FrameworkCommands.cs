using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;

namespace Game.Editor
{
    /// <summary>
    /// The commands the framework itself provides (10_UNITY_TECH §17): <c>kw_help</c>, <c>kw_ping</c> and
    /// <c>kw_validate</c>. Validators plug into <c>kw_validate</c> by implementing <see cref="IValidator"/>; no other
    /// file may declare these names.
    /// </summary>
    public static class FrameworkCommands
    {
        /// <summary>Default <c>kw_validate</c> report location, relative to the project root.</summary>
        public const string DefaultValidateReport = "Artifacts/validate/kw_validate.json";

        /// <summary>Lists every command, generator and validator, plus any rejected command declaration.</summary>
        [KwCommand("kw_help", "List every kw_ command, generator and validator (and rejected declarations).")]
        public static string Help()
        {
            KwCommandRegistry registry = KwCommandRegistry.FromLoadedAssemblies();
            var sb = new StringBuilder();
            sb.Append("commands:");
            foreach (KwCommand c in registry.Commands) sb.Append("\n  ").Append(c.Name).Append(" - ").Append(c.Description);
            try
            {
                GeneratorRunner runner = GeneratorRunner.CreateDefault();
                sb.Append("\ngenerators (run order):");
                foreach (GeneratorInfo g in runner.Generators) sb.Append($"\n  {g.Order,4} {g.Id} v{g.Declaration.Version} - {g.Declaration.Description}");
            }
            catch (KwCommandException e)
            {
                sb.Append("\ngenerators: ").Append(e.Message);
            }
            try
            {
                sb.Append("\nvalidators: ").Append(string.Join(", ", ValidatorRunner.DiscoverAll().Select(v => v.Id)));
            }
            catch (KwCommandException e)
            {
                sb.Append("\nvalidators: ").Append(e.Message);
            }
            foreach (string p in registry.Problems) sb.Append("\nREJECTED ").Append(p);
            KwLog.Info(sb.ToString());
            return $"{registry.Commands.Count} command(s), {registry.Problems.Count} rejected";
        }

        /// <summary>Proves the whole <c>Cli.Main</c> path (argument parsing, lookup, logging) works in batchmode.</summary>
        [KwCommand("kw_ping", "Echo the parsed arguments; proves Cli.Main end to end.")]
        public static string Ping(IReadOnlyDictionary<string, string> args) =>
            args.Count == 0 ? "pong" : "pong " + string.Join(" ", args.OrderBy(p => p.Key).Select(p => $"{p.Key}={p.Value}"));

        /// <summary>
        /// Runs every <see cref="IValidator"/>, writes the JSON report and throws when any entry is an error
        /// (10_UNITY_TECH §17). Arguments: <c>--out &lt;file&gt;</c> (default <see cref="DefaultValidateReport"/>),
        /// <c>--only id1,id2</c>.
        /// </summary>
        [KwCommand("kw_validate", "Run every validator; --out <file> (default Artifacts/validate/kw_validate.json), --only a,b. Fails on any error.")]
        public static string Validate(IReadOnlyDictionary<string, string> args)
        {
            var context = new ValidationContext(GeneratorRunner.ProjectRoot, args, KwLog.UnitySink);
            ValidationReport report = ValidatorRunner.Run(ValidatorRunner.DiscoverAll(), context, args.GetList("only"));
            string outPath = context.FullPath(args.GetString("out", DefaultValidateReport));
            string dir = Path.GetDirectoryName(outPath);
            if (!string.IsNullOrEmpty(dir)) Directory.CreateDirectory(dir);
            File.WriteAllText(outPath, report.ToJson() + "\n");
            ValidatorRunner.LogReport(report, KwLog.UnitySink);
            string summary = $"{report.validators.Count} validator(s), {report.errorCount} error(s), {report.warningCount} warning(s); report {outPath}";
            if (!report.Passed) throw new KwCommandException(summary);
            return summary;
        }
    }
}
