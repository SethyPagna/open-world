using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;

namespace Game.Editor
{
    /// <summary>
    /// The arguments of one command (10_UNITY_TECH §17): a case-insensitive string → string map. Built from either
    /// a JSON object (<c>{"id":"bell_golem","force":true}</c>) or <c>--key value</c> pairs
    /// (<c>--id bell_golem --force</c>; a bare <c>--flag</c> means <c>true</c>; <c>--key=value</c> also works).
    /// Commands receive it as <see cref="IReadOnlyDictionary{TKey,TValue}"/> and read it with
    /// <see cref="KwArgsExtensions"/>.
    /// </summary>
    public sealed class KwArgs : IReadOnlyDictionary<string, string>
    {
        /// <summary>No arguments.</summary>
        public static readonly KwArgs Empty = new KwArgs(new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase));

        readonly Dictionary<string, string> values;

        KwArgs(Dictionary<string, string> values) => this.values = values;

        /// <summary>
        /// Parses <paramref name="text"/>: a JSON object when it starts with <c>{</c>, otherwise <c>--key value</c>
        /// pairs. Null or blank text gives <see cref="Empty"/>. Throws <see cref="KwArgsException"/> when malformed.
        /// </summary>
        public static KwArgs Parse(string text)
        {
            if (string.IsNullOrWhiteSpace(text)) return Empty;
            string trimmed = text.Trim();
            if (trimmed[0] == '{') return new KwArgs(KwJson.ParseFlatObject(trimmed));
            return FromTokens(Tokenize(trimmed));
        }

        /// <summary>
        /// Builds arguments from already split tokens (<c>--key</c>, <c>value</c>, <c>--flag</c>, <c>--key=value</c>).
        /// A token that is not a key and does not follow one is an error, and so is a key given twice.
        /// </summary>
        public static KwArgs FromTokens(IEnumerable<string> tokens)
        {
            var map = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            string pendingKey = null;
            foreach (string token in tokens)
            {
                if (IsKey(token))
                {
                    if (pendingKey != null) Add(map, pendingKey, "true");
                    string body = token.Substring(2);
                    int eq = body.IndexOf('=');
                    if (eq >= 0)
                    {
                        Add(map, body.Substring(0, eq), body.Substring(eq + 1));
                        pendingKey = null;
                    }
                    else pendingKey = body;
                    continue;
                }
                if (pendingKey == null)
                    throw new KwArgsException($"Unexpected argument \"{token}\": values must follow a --key (for example --id {token}).");
                Add(map, pendingKey, token);
                pendingKey = null;
            }
            if (pendingKey != null) Add(map, pendingKey, "true");
            return map.Count == 0 ? Empty : new KwArgs(map);
        }

        /// <summary>
        /// Splits a command-line fragment into tokens on whitespace, honouring "double" and 'single' quotes and
        /// backslash-escaped quotes inside double quotes. An unterminated quote is an error.
        /// </summary>
        public static List<string> Tokenize(string text)
        {
            var tokens = new List<string>();
            if (string.IsNullOrEmpty(text)) return tokens;
            var current = new StringBuilder();
            bool inToken = false;
            char quote = '\0';
            for (int i = 0; i < text.Length; i++)
            {
                char c = text[i];
                if (quote != '\0')
                {
                    if (c == quote) quote = '\0';
                    else if (c == '\\' && quote == '"' && i + 1 < text.Length && (text[i + 1] == '"' || text[i + 1] == '\\'))
                        current.Append(text[++i]);
                    else current.Append(c);
                    continue;
                }
                if (char.IsWhiteSpace(c))
                {
                    if (inToken) tokens.Add(current.ToString());
                    current.Clear();
                    inToken = false;
                    continue;
                }
                inToken = true;
                if (c == '"' || c == '\'') quote = c;
                else current.Append(c);
            }
            if (quote != '\0') throw new KwArgsException($"Unterminated {quote} quote in arguments: {text}");
            if (inToken) tokens.Add(current.ToString());
            return tokens;
        }

        /// <summary>Returns these arguments with every key of <paramref name="overrides"/> replacing its value here.</summary>
        public KwArgs With(IReadOnlyDictionary<string, string> overrides)
        {
            if (overrides == null || overrides.Count == 0) return this;
            if (Count == 0 && overrides is KwArgs k) return k;
            var map = new Dictionary<string, string>(values, StringComparer.OrdinalIgnoreCase);
            foreach (var pair in overrides) map[pair.Key] = pair.Value;
            return new KwArgs(map);
        }

        /// <summary>Renders the arguments as <c>--key value</c> pairs in key order, quoting values that need it.</summary>
        public override string ToString()
        {
            var sb = new StringBuilder();
            foreach (var pair in values.OrderBy(p => p.Key, StringComparer.OrdinalIgnoreCase))
            {
                if (sb.Length > 0) sb.Append(' ');
                sb.Append("--").Append(pair.Key);
                if (pair.Value == "true") continue;
                sb.Append(' ');
                bool needsQuotes = pair.Value.Length == 0 || pair.Value.Any(ch => char.IsWhiteSpace(ch) || ch == '"' || ch == '\'') || IsKey(pair.Value);
                sb.Append(needsQuotes ? KwJson.Quote(pair.Value) : pair.Value);
            }
            return sb.ToString();
        }

        /// <inheritdoc/>
        public int Count => values.Count;

        /// <inheritdoc/>
        public string this[string key] => values[key];

        /// <inheritdoc/>
        public IEnumerable<string> Keys => values.Keys;

        /// <inheritdoc/>
        public IEnumerable<string> Values => values.Values;

        /// <inheritdoc/>
        public bool ContainsKey(string key) => key != null && values.ContainsKey(key);

        /// <inheritdoc/>
        public bool TryGetValue(string key, out string value)
        {
            if (key == null)
            {
                value = null;
                return false;
            }
            return values.TryGetValue(key, out value);
        }

        /// <inheritdoc/>
        public IEnumerator<KeyValuePair<string, string>> GetEnumerator() => values.GetEnumerator();

        IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();

        static bool IsKey(string token) => token.Length > 2 && token[0] == '-' && token[1] == '-' && token[2] != '-';

        static void Add(Dictionary<string, string> map, string key, string value)
        {
            if (key.Length == 0) throw new KwArgsException("An argument key is empty (a lone \"--\" or \"--=value\").");
            if (map.ContainsKey(key)) throw new KwArgsException($"Argument --{key} is given twice.");
            map.Add(key, value);
        }
    }

    /// <summary>
    /// Typed readers over a command's string arguments (10_UNITY_TECH §17). Every reader throws
    /// <see cref="KwArgsException"/> naming the key when a value is present but malformed; a missing key returns the
    /// fallback.
    /// </summary>
    public static class KwArgsExtensions
    {
        /// <summary>The value of <paramref name="key"/>, or <paramref name="fallback"/> when absent.</summary>
        public static string GetString(this IReadOnlyDictionary<string, string> args, string key, string fallback = null) =>
            args != null && args.TryGetValue(key, out string v) && v != null ? v : fallback;

        /// <summary>The value of <paramref name="key"/>; throws when it is absent or empty.</summary>
        public static string Require(this IReadOnlyDictionary<string, string> args, string key)
        {
            string v = args.GetString(key);
            if (string.IsNullOrEmpty(v)) throw new KwArgsException($"Missing required argument --{key}.");
            return v;
        }

        /// <summary>True when <paramref name="key"/> is present at all (flags).</summary>
        public static bool Has(this IReadOnlyDictionary<string, string> args, string key) => args != null && args.ContainsKey(key);

        /// <summary>A 32-bit integer (invariant culture).</summary>
        public static int GetInt(this IReadOnlyDictionary<string, string> args, string key, int fallback = 0)
        {
            string v = args.GetString(key);
            if (v == null) return fallback;
            if (int.TryParse(v, NumberStyles.Integer, CultureInfo.InvariantCulture, out int r)) return r;
            throw new KwArgsException($"Argument --{key} must be an integer, not \"{v}\".");
        }

        /// <summary>An unsigned 64-bit integer, decimal or <c>0x</c> hex (seeds).</summary>
        public static ulong GetULong(this IReadOnlyDictionary<string, string> args, string key, ulong fallback = 0)
        {
            string v = args.GetString(key);
            if (v == null) return fallback;
            bool ok = v.StartsWith("0x", StringComparison.OrdinalIgnoreCase)
                ? ulong.TryParse(v.Substring(2), NumberStyles.AllowHexSpecifier, CultureInfo.InvariantCulture, out ulong r)
                : ulong.TryParse(v, NumberStyles.None, CultureInfo.InvariantCulture, out r);
            if (ok) return r;
            throw new KwArgsException($"Argument --{key} must be an unsigned integer (decimal or 0x hex), not \"{v}\".");
        }

        /// <summary>A float (invariant culture, so <c>1.5</c> works on every locale).</summary>
        public static float GetFloat(this IReadOnlyDictionary<string, string> args, string key, float fallback = 0f)
        {
            string v = args.GetString(key);
            if (v == null) return fallback;
            if (float.TryParse(v, NumberStyles.Float, CultureInfo.InvariantCulture, out float r)) return r;
            throw new KwArgsException($"Argument --{key} must be a number, not \"{v}\".");
        }

        /// <summary>A boolean: true/false, 1/0, yes/no, on/off (case-insensitive). A bare <c>--flag</c> is true.</summary>
        public static bool GetBool(this IReadOnlyDictionary<string, string> args, string key, bool fallback = false)
        {
            string v = args.GetString(key);
            if (v == null) return fallback;
            switch (v.Trim().ToLowerInvariant())
            {
                case "true": case "1": case "yes": case "on": return true;
                case "false": case "0": case "no": case "off": return false;
                default: throw new KwArgsException($"Argument --{key} must be true or false, not \"{v}\".");
            }
        }

        /// <summary>A comma-separated list with blanks removed; empty when absent.</summary>
        public static IReadOnlyList<string> GetList(this IReadOnlyDictionary<string, string> args, string key)
        {
            string v = args.GetString(key);
            if (string.IsNullOrWhiteSpace(v)) return Array.Empty<string>();
            return v.Split(',').Select(s => s.Trim()).Where(s => s.Length > 0).ToArray();
        }
    }
}
