using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using UnityEngine;

namespace Game.Editor
{
    /// <summary>
    /// One build validator run by <c>kw_validate</c> (10_UNITY_TECH §4.4 step 5, §10.7, §18): it inspects data or
    /// generated assets and adds entries to the report. Declare it as a concrete class with a public parameterless
    /// constructor; <see cref="ValidatorRunner"/> finds it by type. It must not modify anything.
    /// </summary>
    public interface IValidator
    {
        /// <summary>Stable lower-case id used in the report and by <c>--only</c>, e.g. <c>room_defs</c>.</summary>
        string Id { get; }

        /// <summary>Checks everything this validator owns and reports problems through <paramref name="sink"/>.</summary>
        void Validate(ValidationContext context, ValidationSink sink);
    }

    /// <summary>How bad an entry is. Only <see cref="Error"/> fails <c>kw_validate</c>.</summary>
    public enum ValidationSeverity
    {
        /// <summary>For the record only.</summary>
        Info,

        /// <summary>Worth fixing; does not fail the build.</summary>
        Warning,

        /// <summary>Fails the build.</summary>
        Error,
    }

    /// <summary>
    /// One line of the <c>kw_validate</c> JSON report (10_UNITY_TECH §17). Field names are the JSON keys; keep them
    /// stable, since tools and agents read the report.
    /// </summary>
    [Serializable]
    public sealed class ValidationEntry
    {
        /// <summary>The validator's <see cref="IValidator.Id"/>.</summary>
        public string validator;

        /// <summary><c>error</c>, <c>warning</c> or <c>info</c>.</summary>
        public string severity;

        /// <summary>What is wrong: a room id, an asset path or a data file, e.g. <c>Data/rooms/bell_golem.json</c>.</summary>
        public string target;

        /// <summary>Which rule, e.g. <c>§10.7.twists</c> or <c>T-05</c>, so the fix can be looked up.</summary>
        public string rule;

        /// <summary>The problem in one sentence.</summary>
        public string message;

        /// <summary>The severity as an enum (unknown text reads as <see cref="ValidationSeverity.Error"/>).</summary>
        public ValidationSeverity Severity =>
            severity == "info" ? ValidationSeverity.Info : severity == "warning" ? ValidationSeverity.Warning : ValidationSeverity.Error;

        /// <summary>The severity's JSON spelling.</summary>
        public static string SeverityText(ValidationSeverity s) => s == ValidationSeverity.Info ? "info" : s == ValidationSeverity.Warning ? "warning" : "error";

        /// <summary><c>error room_defs bell_golem [§10.7.twists]: ...</c></summary>
        public override string ToString() => $"{severity} {validator} {target} [{rule}]: {message}";
    }

    /// <summary>
    /// The whole <c>kw_validate</c> report, serialised with <see cref="JsonUtility"/>:
    /// <c>{ schemaVersion, startedUtc, finishedUtc, validators[], errorCount, warningCount, entries[] }</c>.
    /// </summary>
    [Serializable]
    public sealed class ValidationReport
    {
        /// <summary>The schema this code writes.</summary>
        public const int CurrentSchema = 1;

        /// <summary>Report schema version.</summary>
        public int schemaVersion = CurrentSchema;

        /// <summary>ISO-8601 UTC start time.</summary>
        public string startedUtc = "";

        /// <summary>ISO-8601 UTC finish time.</summary>
        public string finishedUtc = "";

        /// <summary>Ids of the validators that ran, in order.</summary>
        public List<string> validators = new List<string>();

        /// <summary>Number of error entries.</summary>
        public int errorCount;

        /// <summary>Number of warning entries.</summary>
        public int warningCount;

        /// <summary>Every entry, in the order reported.</summary>
        public List<ValidationEntry> entries = new List<ValidationEntry>();

        /// <summary>True when no entry is an error.</summary>
        public bool Passed => errorCount == 0;

        /// <summary>Adds an entry and updates the counts.</summary>
        public void Add(string validator, ValidationSeverity severity, string target, string rule, string message)
        {
            entries.Add(new ValidationEntry
            {
                validator = validator ?? "",
                severity = ValidationEntry.SeverityText(severity),
                target = target ?? "",
                rule = rule ?? "",
                message = message ?? "",
            });
            if (severity == ValidationSeverity.Error) errorCount++;
            else if (severity == ValidationSeverity.Warning) warningCount++;
        }

        /// <summary>The report as pretty-printed JSON.</summary>
        public string ToJson() => JsonUtility.ToJson(this, true);

        /// <summary>Reads a report back (tools and tests).</summary>
        public static ValidationReport FromJson(string json) => JsonUtility.FromJson<ValidationReport>(json);

        internal static string Now() => DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ", CultureInfo.InvariantCulture);
    }

    /// <summary>What a validator reports into; bound to one validator id so entries can't be misattributed.</summary>
    public sealed class ValidationSink
    {
        readonly ValidationReport report;

        internal ValidationSink(ValidationReport report, string validatorId)
        {
            this.report = report;
            ValidatorId = validatorId;
        }

        /// <summary>The id entries are attributed to.</summary>
        public string ValidatorId { get; }

        /// <summary>Reports a build-failing problem.</summary>
        public void Error(string target, string rule, string message) => report.Add(ValidatorId, ValidationSeverity.Error, target, rule, message);

        /// <summary>Reports a non-failing problem.</summary>
        public void Warning(string target, string rule, string message) => report.Add(ValidatorId, ValidationSeverity.Warning, target, rule, message);

        /// <summary>Records a fact (e.g. "checked 18 rooms").</summary>
        public void Info(string target, string rule, string message) => report.Add(ValidatorId, ValidationSeverity.Info, target, rule, message);
    }

    /// <summary>What a validator can see.</summary>
    public sealed class ValidationContext
    {
        readonly Action<LogType, string> log;

        /// <summary>Creates a context.</summary>
        public ValidationContext(string projectRoot, IReadOnlyDictionary<string, string> args, Action<LogType, string> log)
        {
            ProjectRoot = Path.GetFullPath(projectRoot ?? throw new ArgumentNullException(nameof(projectRoot)));
            Args = args ?? KwArgs.Empty;
            this.log = log ?? KwLog.UnitySink;
        }

        /// <summary>The Unity project root.</summary>
        public string ProjectRoot { get; }

        /// <summary>The <c>kw_validate</c> arguments.</summary>
        public IReadOnlyDictionary<string, string> Args { get; }

        /// <summary>Absolute path of a project-relative path.</summary>
        public string FullPath(string projectRelative) => Path.GetFullPath(Path.Combine(ProjectRoot, projectRelative ?? ""));

        /// <summary>Writes a <c>[KNOTWELL]</c> progress line.</summary>
        public void Log(string message) => log(LogType.Log, message);
    }
}
