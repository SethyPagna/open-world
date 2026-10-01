using System;
using System.Collections.Generic;
using System.Text;

namespace Game.Editor
{
    /// <summary>One command to run: its name and its arguments.</summary>
    public readonly struct KwInvocation
    {
        /// <summary>The command name, e.g. <c>kw_build_rooms</c>.</summary>
        public readonly string Name;

        /// <summary>The command's arguments (shared <c>-kwArgs</c> merged under any inline ones).</summary>
        public readonly KwArgs Args;

        /// <summary>Creates an invocation.</summary>
        public KwInvocation(string name, KwArgs args)
        {
            Name = name;
            Args = args ?? KwArgs.Empty;
        }

        /// <summary>The invocation as it would be typed: <c>kw_build_rooms --id bell_golem</c>.</summary>
        public override string ToString() => Args.Count == 0 ? Name : Name + " " + Args;
    }

    /// <summary>
    /// Reads the batchmode command line of <c>Game.Editor.Cli.Main</c> (10_UNITY_TECH §17):
    /// <list type="bullet">
    /// <item><c>-kwCommand &lt;name&gt; [-kwArgs "&lt;json or --key value pairs&gt;"]</c> runs one command;</item>
    /// <item><c>-kwCommands "a;b --id x;c" [-kwArgs "..."]</c> runs several in one Unity launch, in order. Each
    /// entry may carry its own <c>--key value</c> arguments, which override the shared <c>-kwArgs</c>.</item>
    /// </list>
    /// Every Unity launch costs minutes, so batching matters. Flag names are matched case-insensitively.
    /// </summary>
    public static class KwCommandLine
    {
        /// <summary>The single-command flag.</summary>
        public const string CommandFlag = "-kwCommand";

        /// <summary>The multi-command flag; entries are separated by ';'.</summary>
        public const string CommandsFlag = "-kwCommands";

        /// <summary>The shared-arguments flag.</summary>
        public const string ArgsFlag = "-kwArgs";

        /// <summary>One-line usage shown when the command line is wrong.</summary>
        public const string Usage =
            "Usage: -executeMethod Game.Editor.Cli.Main -kwCommand <name> [-kwArgs \"<json or --key value pairs>\"] " +
            "| -kwCommands \"<name> [--key value];<name>...\" [-kwArgs \"...\"]";

        /// <summary>
        /// Extracts the invocations from a full argv (Unity's own flags are ignored). Throws
        /// <see cref="KwArgsException"/> when no command is given, when both command flags are given, when a flag
        /// lacks its value, or when arguments are malformed.
        /// </summary>
        public static IReadOnlyList<KwInvocation> Parse(IReadOnlyList<string> argv)
        {
            if (argv == null) throw new KwArgsException("No command line. " + Usage);
            string single = null, multi = null, shared = null;
            for (int i = 0; i < argv.Count; i++)
            {
                string a = argv[i];
                if (Is(a, CommandFlag)) single = ValueAfter(argv, ref i, CommandFlag, single);
                else if (Is(a, CommandsFlag)) multi = ValueAfter(argv, ref i, CommandsFlag, multi);
                else if (Is(a, ArgsFlag)) shared = ValueAfter(argv, ref i, ArgsFlag, shared);
            }
            if (single != null && multi != null) throw new KwArgsException($"Give {CommandFlag} or {CommandsFlag}, not both. {Usage}");
            if (single == null && multi == null) throw new KwArgsException($"No command given. {Usage}");

            KwArgs sharedArgs = KwArgs.Parse(shared);
            var result = new List<KwInvocation>();
            IEnumerable<string> entries = single != null ? new[] { single } : SplitEntries(multi);
            foreach (string entry in entries)
            {
                List<string> tokens = KwArgs.Tokenize(entry);
                if (tokens.Count == 0) continue;
                string name = tokens[0];
                if (name.StartsWith("-", StringComparison.Ordinal))
                    throw new KwArgsException($"Command entry \"{entry.Trim()}\" must start with a command name. {Usage}");
                tokens.RemoveAt(0);
                result.Add(new KwInvocation(name, sharedArgs.With(KwArgs.FromTokens(tokens))));
            }
            if (result.Count == 0) throw new KwArgsException($"{CommandsFlag} lists no commands. {Usage}");
            return result;
        }

        /// <summary>Splits a <c>-kwCommands</c> value on ';' outside quotes.</summary>
        public static List<string> SplitEntries(string commands)
        {
            var entries = new List<string>();
            if (commands == null) return entries;
            var current = new StringBuilder();
            char quote = '\0';
            foreach (char c in commands)
            {
                if (quote != '\0')
                {
                    if (c == quote) quote = '\0';
                }
                else if (c == '"' || c == '\'') quote = c;
                else if (c == ';')
                {
                    if (current.ToString().Trim().Length > 0) entries.Add(current.ToString());
                    current.Clear();
                    continue;
                }
                current.Append(c);
            }
            if (current.ToString().Trim().Length > 0) entries.Add(current.ToString());
            return entries;
        }

        static bool Is(string arg, string flag) => string.Equals(arg, flag, StringComparison.OrdinalIgnoreCase);

        static string ValueAfter(IReadOnlyList<string> argv, ref int i, string flag, string previous)
        {
            if (previous != null) throw new KwArgsException($"{flag} is given twice. {Usage}");
            if (i + 1 >= argv.Count) throw new KwArgsException($"{flag} needs a value. {Usage}");
            return argv[++i];
        }
    }
}
