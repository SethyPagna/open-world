using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Runtime.ExceptionServices;
using UnityEditor;

namespace Game.Editor
{
    /// <summary>A resolved <see cref="KwCommandAttribute"/> method (10_UNITY_TECH §17).</summary>
    public sealed class KwCommand
    {
        readonly bool takesArgs;

        internal KwCommand(string name, string description, MethodInfo method, bool takesArgs)
        {
            Name = name;
            Description = description ?? "";
            Method = method;
            this.takesArgs = takesArgs;
        }

        /// <summary>The command name, e.g. <c>kw_build_rooms</c>.</summary>
        public string Name { get; }

        /// <summary>The one-line help text.</summary>
        public string Description { get; }

        /// <summary>The static method that runs it.</summary>
        public MethodInfo Method { get; }

        /// <summary>Where it is declared, for error messages (<c>Namespace.Type.Method</c>).</summary>
        public string Location => $"{Method.DeclaringType?.FullName}.{Method.Name}";

        /// <summary>
        /// Runs the command and returns its summary (empty for <c>void</c> commands). The command's own exception is
        /// rethrown unwrapped, with its original stack.
        /// </summary>
        public string Invoke(IReadOnlyDictionary<string, string> args)
        {
            object[] parameters = takesArgs ? new object[] { args as KwArgs ?? KwArgs.Empty.With(args) } : Array.Empty<object>();
            try
            {
                object result = Method.Invoke(null, parameters);
                return result as string ?? "";
            }
            catch (TargetInvocationException e) when (e.InnerException != null)
            {
                ExceptionDispatchInfo.Capture(e.InnerException).Throw();
                throw; // unreachable: Throw() always throws
            }
        }
    }

    /// <summary>
    /// Finds every <see cref="KwCommandAttribute"/> method by reflection (10_UNITY_TECH §17) and checks it: the name
    /// pattern, the signature and uniqueness. Broken declarations are left out and listed in <see cref="Problems"/>,
    /// so one bad command never hides the others; <c>kw_help</c> and the framework tests report them.
    /// </summary>
    public sealed class KwCommandRegistry
    {
        readonly Dictionary<string, KwCommand> byName;

        KwCommandRegistry(Dictionary<string, KwCommand> byName, List<string> problems)
        {
            this.byName = byName;
            Commands = byName.Values.OrderBy(c => c.Name, StringComparer.Ordinal).ToArray();
            Problems = problems;
        }

        /// <summary>Every valid command, sorted by name.</summary>
        public IReadOnlyList<KwCommand> Commands { get; }

        /// <summary>Declarations that were rejected, one human-readable line each.</summary>
        public IReadOnlyList<string> Problems { get; }

        /// <summary>
        /// The live registry: every command in the editor domain except those declared in test assemblies (test
        /// fixtures declare commands to exercise this class and must never be runnable from the CLI).
        /// </summary>
        public static KwCommandRegistry FromLoadedAssemblies() =>
            FromMethods(TypeCache.GetMethodsWithAttribute<KwCommandAttribute>().Where(m => !IsTestAssembly(m.DeclaringType?.Assembly)));

        /// <summary>A registry over the commands declared on the given types only (tests and tools).</summary>
        public static KwCommandRegistry FromTypes(params Type[] types) =>
            FromMethods(types.SelectMany(t => t.GetMethods(BindingFlags.Static | BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.DeclaredOnly))
                .Where(m => m.IsDefined(typeof(KwCommandAttribute), false)));

        /// <summary>Builds a registry from candidate methods, validating each one.</summary>
        public static KwCommandRegistry FromMethods(IEnumerable<MethodInfo> methods)
        {
            var problems = new List<string>();
            var candidates = new List<KwCommand>();
            foreach (MethodInfo m in methods)
            {
                var attr = m.GetCustomAttribute<KwCommandAttribute>(false);
                if (attr == null) continue;
                string where = $"{m.DeclaringType?.FullName}.{m.Name}";
                if (attr.Name == null || !KwCommandAttribute.NamePattern.IsMatch(attr.Name))
                {
                    problems.Add($"{where}: command name \"{attr.Name}\" must match {KwCommandAttribute.NamePattern}.");
                    continue;
                }
                if (!TryCheckSignature(m, out bool takesArgs, out string why))
                {
                    problems.Add($"{where} ({attr.Name}): {why}");
                    continue;
                }
                candidates.Add(new KwCommand(attr.Name, attr.Description, m, takesArgs));
            }

            var byName = new Dictionary<string, KwCommand>(StringComparer.Ordinal);
            foreach (var group in candidates.GroupBy(c => c.Name, StringComparer.Ordinal))
            {
                if (group.Count() == 1)
                {
                    byName.Add(group.Key, group.First());
                    continue;
                }
                problems.Add($"Command \"{group.Key}\" is declared {group.Count()} times: " +
                             string.Join(", ", group.Select(c => c.Location).OrderBy(s => s, StringComparer.Ordinal)) + ". It is disabled until one is removed.");
            }
            problems.Sort(StringComparer.Ordinal);
            return new KwCommandRegistry(byName, problems);
        }

        /// <summary>Finds a command by exact name.</summary>
        public bool TryGet(string name, out KwCommand command)
        {
            command = null;
            return name != null && byName.TryGetValue(name, out command);
        }

        /// <summary>
        /// Finds a command by exact name, or throws <see cref="KwCommandException"/> naming the closest known
        /// commands (and any rejected declaration of that name).
        /// </summary>
        public KwCommand Get(string name)
        {
            if (TryGet(name, out KwCommand command)) return command;
            string rejected = Problems.FirstOrDefault(p => name != null && p.Contains("\"" + name + "\""));
            if (rejected != null) throw new KwCommandException($"Command \"{name}\" is declared but rejected: {rejected}");
            IReadOnlyList<string> near = Suggest(name);
            string hint = near.Count > 0 ? $" Did you mean {string.Join(" or ", near)}?" : "";
            throw new KwCommandException($"Unknown command \"{name}\".{hint} Known: {string.Join(", ", Commands.Select(c => c.Name))}.");
        }

        /// <summary>Up to three known names closest to <paramref name="name"/> (prefix match or edit distance ≤ 3).</summary>
        public IReadOnlyList<string> Suggest(string name)
        {
            if (string.IsNullOrEmpty(name)) return Array.Empty<string>();
            return Commands
                .Select(c => (c.Name, d: c.Name.StartsWith(name, StringComparison.Ordinal) ? 0 : EditDistance(name, c.Name)))
                .Where(x => x.d <= 3)
                .OrderBy(x => x.d).ThenBy(x => x.Name, StringComparer.Ordinal)
                .Take(3)
                .Select(x => x.Name)
                .ToArray();
        }

        static bool TryCheckSignature(MethodInfo m, out bool takesArgs, out string why)
        {
            takesArgs = false;
            why = null;
            if (!m.IsStatic)
            {
                why = "commands must be static methods.";
                return false;
            }
            if (m.ContainsGenericParameters)
            {
                why = "commands cannot be generic.";
                return false;
            }
            if (m.ReturnType != typeof(void) && m.ReturnType != typeof(string))
            {
                why = $"commands return void or string, not {m.ReturnType.Name}.";
                return false;
            }
            ParameterInfo[] ps = m.GetParameters();
            if (ps.Length == 0) return true;
            if (ps.Length == 1 && !ps[0].ParameterType.IsByRef && ps[0].ParameterType.IsAssignableFrom(typeof(KwArgs)) &&
                typeof(IReadOnlyDictionary<string, string>).IsAssignableFrom(ps[0].ParameterType))
            {
                takesArgs = true;
                return true;
            }
            why = "commands take no parameters or one IReadOnlyDictionary<string, string>.";
            return false;
        }

        static bool IsTestAssembly(Assembly a)
        {
            if (a == null) return false;
            string n = a.GetName().Name;
            return n.StartsWith("Game.Tests", StringComparison.Ordinal) || n.IndexOf(".Tests", StringComparison.Ordinal) >= 0;
        }

        static int EditDistance(string a, string b)
        {
            var prev = new int[b.Length + 1];
            var cur = new int[b.Length + 1];
            for (int j = 0; j <= b.Length; j++) prev[j] = j;
            for (int i = 1; i <= a.Length; i++)
            {
                cur[0] = i;
                for (int j = 1; j <= b.Length; j++)
                {
                    int cost = a[i - 1] == b[j - 1] ? 0 : 1;
                    cur[j] = Math.Min(Math.Min(cur[j - 1] + 1, prev[j] + 1), prev[j - 1] + cost);
                }
                (prev, cur) = (cur, prev);
            }
            return prev[b.Length];
        }
    }
}
