using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.Linq;
using UnityEngine;

namespace Game.Editor
{
    /// <summary>What happened to one invocation in a CLI run.</summary>
    public enum KwCommandStatus
    {
        /// <summary>Ran and returned normally.</summary>
        Succeeded,

        /// <summary>Threw, or was not found.</summary>
        Failed,

        /// <summary>Not run because an earlier command in the same launch failed.</summary>
        Skipped,
    }

    /// <summary>The outcome of one invocation.</summary>
    public readonly struct KwCommandOutcome
    {
        /// <summary>The invocation as typed.</summary>
        public readonly KwInvocation Invocation;

        /// <summary>Whether it ran, failed or was skipped.</summary>
        public readonly KwCommandStatus Status;

        /// <summary>The command's summary, or the failure message.</summary>
        public readonly string Message;

        /// <summary>Wall time in milliseconds (0 when skipped).</summary>
        public readonly long Milliseconds;

        /// <summary>Creates an outcome.</summary>
        public KwCommandOutcome(KwInvocation invocation, KwCommandStatus status, string message, long milliseconds)
        {
            Invocation = invocation;
            Status = status;
            Message = message ?? "";
            Milliseconds = milliseconds;
        }
    }

    /// <summary>The outcome of a whole <c>Cli.Main</c> launch (10_UNITY_TECH §17).</summary>
    public sealed class KwCliResult
    {
        internal KwCliResult(IReadOnlyList<KwCommandOutcome> outcomes, string usageError)
        {
            Outcomes = outcomes;
            UsageError = usageError;
        }

        /// <summary>One entry per parsed invocation, in order.</summary>
        public IReadOnlyList<KwCommandOutcome> Outcomes { get; }

        /// <summary>Set when the command line itself could not be parsed; then nothing ran.</summary>
        public string UsageError { get; }

        /// <summary>True when the command line parsed and every command succeeded.</summary>
        public bool Succeeded => UsageError == null && Outcomes.Count > 0 && Outcomes.All(o => o.Status == KwCommandStatus.Succeeded);

        /// <summary>One line naming what failed, for the exception that makes batchmode exit non-zero.</summary>
        public string FailureSummary =>
            UsageError ?? (Succeeded
                ? "all commands succeeded"
                : "failed: " + string.Join(", ", Outcomes.Where(o => o.Status == KwCommandStatus.Failed).Select(o => $"{o.Invocation.Name} ({o.Message})")));
    }

    /// <summary>
    /// Runs parsed invocations against a registry and reports each as <c>[KNOTWELL]</c> lines
    /// (10_UNITY_TECH §17). It stops at the first failure, because later commands in a batch depend on earlier
    /// ones (generate → build → validate), and marks the rest skipped. It never throws for a command failure;
    /// <see cref="Cli.Main"/> turns a failed result into an exception.
    /// </summary>
    public static class KwCliRun
    {
        /// <summary>
        /// Parses <paramref name="argv"/> and runs every invocation in order.
        /// </summary>
        /// <param name="argv">The full command line (Unity's own flags are ignored).</param>
        /// <param name="registry">Where commands are looked up.</param>
        /// <param name="log">Receives each line (without the prefix; <see cref="KwLog.Format"/> is applied by the Unity sink).</param>
        /// <param name="afterEachSuccess">Optional hook after each successful command (the Unity entry point saves assets).</param>
        public static KwCliResult Run(IReadOnlyList<string> argv, KwCommandRegistry registry, Action<LogType, string> log, Action afterEachSuccess = null)
        {
            if (registry == null) throw new ArgumentNullException(nameof(registry));
            log ??= KwLog.UnitySink;

            IReadOnlyList<KwInvocation> invocations;
            try
            {
                invocations = KwCommandLine.Parse(argv);
            }
            catch (KwArgsException e)
            {
                log(LogType.Error, "cli: " + e.Message);
                return new KwCliResult(Array.Empty<KwCommandOutcome>(), e.Message);
            }

            foreach (string problem in registry.Problems) log(LogType.Warning, "cli: rejected command declaration: " + problem);

            var outcomes = new List<KwCommandOutcome>(invocations.Count);
            var total = Stopwatch.StartNew();
            bool failed = false;
            foreach (KwInvocation inv in invocations)
            {
                if (failed)
                {
                    outcomes.Add(new KwCommandOutcome(inv, KwCommandStatus.Skipped, "an earlier command failed", 0));
                    log(LogType.Log, $"{inv.Name} SKIPPED (an earlier command failed)");
                    continue;
                }
                KwCommandOutcome outcome = RunOne(inv, registry, log);
                outcomes.Add(outcome);
                if (outcome.Status == KwCommandStatus.Failed) failed = true;
                else afterEachSuccess?.Invoke();
            }

            int ok = outcomes.Count(o => o.Status == KwCommandStatus.Succeeded);
            int bad = outcomes.Count(o => o.Status == KwCommandStatus.Failed);
            int skipped = outcomes.Count - ok - bad;
            string secs = (total.ElapsedMilliseconds / 1000.0).ToString("0.0", CultureInfo.InvariantCulture);
            log(failed ? LogType.Error : LogType.Log, $"cli: {outcomes.Count} command(s): {ok} ok, {bad} failed, {skipped} skipped in {secs} s");
            return new KwCliResult(outcomes, null);
        }

        static KwCommandOutcome RunOne(KwInvocation inv, KwCommandRegistry registry, Action<LogType, string> log)
        {
            var sw = Stopwatch.StartNew();
            try
            {
                KwCommand command = registry.Get(inv.Name);
                log(LogType.Log, "> " + inv);
                string summary = command.Invoke(inv.Args);
                long ms = sw.ElapsedMilliseconds;
                log(LogType.Log, string.IsNullOrEmpty(summary) ? $"{inv.Name} OK ({ms} ms)" : $"{inv.Name} OK ({ms} ms): {summary}");
                return new KwCommandOutcome(inv, KwCommandStatus.Succeeded, summary, ms);
            }
            catch (Exception e) when (e is KwCommandException || e is KwArgsException)
            {
                long ms = sw.ElapsedMilliseconds;
                log(LogType.Error, $"{inv.Name} FAILED ({ms} ms): {e.Message}");
                return new KwCommandOutcome(inv, KwCommandStatus.Failed, e.Message, ms);
            }
            catch (Exception e)
            {
                long ms = sw.ElapsedMilliseconds;
                log(LogType.Error, $"{inv.Name} FAILED ({ms} ms): {e.GetType().Name}: {e.Message}\n{TopFrames(e, 8)}");
                return new KwCommandOutcome(inv, KwCommandStatus.Failed, $"{e.GetType().Name}: {e.Message}", ms);
            }
        }

        /// <summary>The first <paramref name="count"/> stack frames, indented; the full trace stays in the Unity log.</summary>
        static string TopFrames(Exception e, int count)
        {
            string[] frames = (e.StackTrace ?? "").Replace("\r\n", "\n").Split('\n');
            IEnumerable<string> kept = frames.Where(f => f.Trim().Length > 0).Take(count).Select(f => "    " + f.Trim());
            string text = string.Join("\n", kept);
            return frames.Length > count ? text + "\n    ..." : text;
        }
    }
}
