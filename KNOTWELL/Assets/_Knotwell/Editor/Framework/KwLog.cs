using System;
using System.Text;
using UnityEngine;

namespace Game.Editor
{
    /// <summary>
    /// Writes result lines for the gate (10_UNITY_TECH §17, §19): every line starts with <c>[KNOTWELL] </c>, which
    /// <c>Tools/unity_gate.mjs</c> collects into its summary, and carries no stack trace so the log stays readable.
    /// Code that must be testable takes an <c>Action&lt;LogType, string&gt;</c> sink instead and defaults to
    /// <see cref="UnitySink"/>.
    /// </summary>
    public static class KwLog
    {
        /// <summary>The gate's line prefix, including the trailing space.</summary>
        public const string Prefix = "[KNOTWELL] ";

        /// <summary>The Unity console/log-file sink, as a delegate for code that takes a sink.</summary>
        public static readonly Action<LogType, string> UnitySink = Write;

        /// <summary>Logs an informational result line (or several, one per line of <paramref name="message"/>).</summary>
        public static void Info(string message) => Write(LogType.Log, message);

        /// <summary>Logs a warning line.</summary>
        public static void Warn(string message) => Write(LogType.Warning, message);

        /// <summary>Logs an error line. In EditMode tests an error log fails the test, so tests use a sink.</summary>
        public static void Error(string message) => Write(LogType.Error, message);

        /// <summary>Logs <paramref name="message"/> with the prefix on every line and no stack trace.</summary>
        public static void Write(LogType type, string message) =>
            Debug.LogFormat(type, LogOption.NoStacktrace, null, "{0}", Format(message));

        /// <summary>
        /// Prefixes every line of <paramref name="message"/> with <see cref="Prefix"/> (lines that already carry it
        /// are left alone), so a multi-line result still reaches the gate summary line by line.
        /// </summary>
        public static string Format(string message)
        {
            if (string.IsNullOrEmpty(message)) return Prefix.TrimEnd();
            string[] lines = message.Replace("\r\n", "\n").Split('\n');
            var sb = new StringBuilder(message.Length + lines.Length * Prefix.Length);
            for (int i = 0; i < lines.Length; i++)
            {
                if (i > 0) sb.Append('\n');
                if (!lines[i].StartsWith(Prefix.TrimEnd(), StringComparison.Ordinal)) sb.Append(Prefix);
                sb.Append(lines[i]);
            }
            return sb.ToString();
        }
    }
}
