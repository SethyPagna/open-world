using System;
using System.Collections.Generic;
using System.Linq;
using UnityEditor;
using UnityEngine;

namespace Game.Editor
{
    /// <summary>
    /// Finds and runs <see cref="IValidator"/>s for <c>kw_validate</c> (10_UNITY_TECH §4.4 step 5, §18). A validator
    /// that throws becomes one error entry (rule <c>crash</c>) and the others still run, so one bug never hides the
    /// rest of the report.
    /// </summary>
    public static class ValidatorRunner
    {
        /// <summary>Every concrete validator in the editor domain (test assemblies excluded), sorted by id.</summary>
        public static IReadOnlyList<IValidator> DiscoverAll() =>
            FromTypes(TypeCache.GetTypesDerivedFrom<IValidator>().Where(t => !IsTestAssembly(t)));

        /// <summary>
        /// Instantiates the concrete <see cref="IValidator"/> types among <paramref name="types"/>; throws
        /// <see cref="KwCommandException"/> for a validator without a public parameterless constructor or with a
        /// duplicate id.
        /// </summary>
        public static IReadOnlyList<IValidator> FromTypes(IEnumerable<Type> types)
        {
            var list = new List<IValidator>();
            var bad = new List<string>();
            foreach (Type t in types)
            {
                if (t.IsAbstract || t.IsInterface || !typeof(IValidator).IsAssignableFrom(t)) continue;
                if (t.GetConstructor(Type.EmptyTypes) == null)
                {
                    bad.Add($"{t.FullName} has no public parameterless constructor");
                    continue;
                }
                list.Add((IValidator)Activator.CreateInstance(t));
            }
            foreach (var dup in list.GroupBy(v => v.Id, StringComparer.Ordinal).Where(g => g.Count() > 1))
                bad.Add($"validator id \"{dup.Key}\" is used by {string.Join(", ", dup.Select(v => v.GetType().FullName))}");
            if (bad.Count > 0) throw new KwCommandException("Invalid validators: " + string.Join("; ", bad));
            return list.OrderBy(v => v.Id, StringComparer.Ordinal).ToArray();
        }

        /// <summary>
        /// Runs <paramref name="validators"/> (only the ids in <paramref name="only"/> when it is non-empty) and
        /// returns the report. An unknown id in <paramref name="only"/> throws <see cref="KwCommandException"/>.
        /// </summary>
        public static ValidationReport Run(IReadOnlyList<IValidator> validators, ValidationContext context, IReadOnlyList<string> only = null)
        {
            if (validators == null) throw new ArgumentNullException(nameof(validators));
            if (context == null) throw new ArgumentNullException(nameof(context));
            if (only != null && only.Count > 0)
            {
                string unknown = only.FirstOrDefault(id => validators.All(v => v.Id != id));
                if (unknown != null) throw new KwCommandException($"Unknown validator \"{unknown}\" (known: {string.Join(", ", validators.Select(v => v.Id))}).");
            }

            var report = new ValidationReport { startedUtc = ValidationReport.Now() };
            foreach (IValidator v in validators)
            {
                if (only != null && only.Count > 0 && !only.Contains(v.Id)) continue;
                report.validators.Add(v.Id);
                var sink = new ValidationSink(report, v.Id);
                try
                {
                    v.Validate(context, sink);
                }
                catch (Exception e)
                {
                    sink.Error(v.GetType().FullName, "crash", $"{e.GetType().Name}: {e.Message}");
                }
            }
            report.finishedUtc = ValidationReport.Now();
            return report;
        }

        /// <summary>
        /// Logs the report as <c>[KNOTWELL]</c> lines: a count line, then up to <paramref name="maxLines"/> errors and
        /// warnings (errors first).
        /// </summary>
        public static void LogReport(ValidationReport report, Action<LogType, string> log, int maxLines = 40)
        {
            log ??= KwLog.UnitySink;
            log(report.Passed ? LogType.Log : LogType.Error,
                $"validate: {report.validators.Count} validator(s), {report.errorCount} error(s), {report.warningCount} warning(s)");
            foreach (ValidationEntry e in report.entries
                         .Where(e => e.Severity != ValidationSeverity.Info)
                         .OrderByDescending(e => e.Severity)
                         .Take(maxLines))
                log(e.Severity == ValidationSeverity.Error ? LogType.Error : LogType.Warning, "  " + e);
            int hidden = report.entries.Count(e => e.Severity != ValidationSeverity.Info) - maxLines;
            if (hidden > 0) log(LogType.Log, $"  ... {hidden} more in the JSON report");
        }

        static bool IsTestAssembly(Type t)
        {
            string n = t.Assembly.GetName().Name;
            return n.StartsWith("Game.Tests", StringComparison.Ordinal) || n.IndexOf(".Tests", StringComparison.Ordinal) >= 0;
        }
    }
}
