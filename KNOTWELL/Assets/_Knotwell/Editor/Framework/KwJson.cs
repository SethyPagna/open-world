using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;

namespace Game.Editor
{
    /// <summary>
    /// The small JSON surface the command line needs (10_UNITY_TECH §17 <c>-kwArgs "&lt;json&gt;"</c>): read one flat
    /// object into string values, and quote strings for reports. Nested objects and arrays are kept as their raw JSON
    /// text so a command can parse them itself. Full data files are read by the data pipeline, not by this class.
    /// </summary>
    public static class KwJson
    {
        /// <summary>
        /// Parses a JSON object whose values become strings: strings unescaped, numbers and booleans as written,
        /// objects and arrays as raw JSON. <c>null</c> values are omitted. Throws <see cref="KwArgsException"/> on
        /// malformed input or a duplicate key.
        /// </summary>
        public static Dictionary<string, string> ParseFlatObject(string json)
        {
            if (json == null) throw new KwArgsException("JSON arguments are null.");
            var reader = new Reader(json);
            var result = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            reader.SkipWhitespace();
            reader.Expect('{');
            reader.SkipWhitespace();
            if (reader.TryConsume('}'))
            {
                reader.ExpectEnd();
                return result;
            }
            for (;;)
            {
                reader.SkipWhitespace();
                string key = reader.ReadString();
                reader.SkipWhitespace();
                reader.Expect(':');
                reader.SkipWhitespace();
                string value = reader.ReadValueAsText(out bool isNull);
                if (result.ContainsKey(key)) throw reader.Error($"duplicate key \"{key}\"");
                if (!isNull) result.Add(key, value);
                reader.SkipWhitespace();
                if (reader.TryConsume(',')) continue;
                reader.Expect('}');
                reader.ExpectEnd();
                return result;
            }
        }

        /// <summary>Returns <paramref name="s"/> as a JSON string literal (quotes included; null becomes <c>null</c>).</summary>
        public static string Quote(string s)
        {
            if (s == null) return "null";
            var sb = new StringBuilder(s.Length + 2);
            sb.Append('"');
            foreach (char c in s)
            {
                switch (c)
                {
                    case '"': sb.Append("\\\""); break;
                    case '\\': sb.Append("\\\\"); break;
                    case '\n': sb.Append("\\n"); break;
                    case '\r': sb.Append("\\r"); break;
                    case '\t': sb.Append("\\t"); break;
                    case '\b': sb.Append("\\b"); break;
                    case '\f': sb.Append("\\f"); break;
                    default:
                        if (c < 0x20) sb.Append("\\u").Append(((int)c).ToString("x4", CultureInfo.InvariantCulture));
                        else sb.Append(c);
                        break;
                }
            }
            sb.Append('"');
            return sb.ToString();
        }

        struct Reader
        {
            readonly string text;
            int pos;

            public Reader(string text)
            {
                this.text = text;
                pos = 0;
            }

            public KwArgsException Error(string what) => new KwArgsException($"Malformed JSON arguments at character {pos}: {what}.");

            public void SkipWhitespace()
            {
                while (pos < text.Length && char.IsWhiteSpace(text[pos])) pos++;
            }

            public bool TryConsume(char c)
            {
                if (pos < text.Length && text[pos] == c)
                {
                    pos++;
                    return true;
                }
                return false;
            }

            public void Expect(char c)
            {
                if (!TryConsume(c)) throw Error(pos < text.Length ? $"expected '{c}' but found '{text[pos]}'" : $"expected '{c}' but the text ended");
            }

            public void ExpectEnd()
            {
                SkipWhitespace();
                if (pos != text.Length) throw Error("unexpected text after the closing '}'");
            }

            public string ReadString()
            {
                Expect('"');
                var sb = new StringBuilder();
                while (pos < text.Length)
                {
                    char c = text[pos++];
                    if (c == '"') return sb.ToString();
                    if (c != '\\')
                    {
                        sb.Append(c);
                        continue;
                    }
                    if (pos >= text.Length) break;
                    char e = text[pos++];
                    switch (e)
                    {
                        case '"': sb.Append('"'); break;
                        case '\\': sb.Append('\\'); break;
                        case '/': sb.Append('/'); break;
                        case 'b': sb.Append('\b'); break;
                        case 'f': sb.Append('\f'); break;
                        case 'n': sb.Append('\n'); break;
                        case 'r': sb.Append('\r'); break;
                        case 't': sb.Append('\t'); break;
                        case 'u':
                            if (pos + 4 > text.Length ||
                                !ushort.TryParse(text.Substring(pos, 4), NumberStyles.AllowHexSpecifier, CultureInfo.InvariantCulture, out ushort code))
                                throw Error("bad \\u escape");
                            sb.Append((char)code);
                            pos += 4;
                            break;
                        default: throw Error($"unknown escape '\\{e}'");
                    }
                }
                throw Error("unterminated string");
            }

            public string ReadValueAsText(out bool isNull)
            {
                isNull = false;
                if (pos >= text.Length) throw Error("expected a value but the text ended");
                char c = text[pos];
                if (c == '"') return ReadString();
                if (c == '{' || c == '[')
                {
                    int start = pos;
                    SkipComposite();
                    return text.Substring(start, pos - start);
                }
                if (TryWord("true")) return "true";
                if (TryWord("false")) return "false";
                if (TryWord("null"))
                {
                    isNull = true;
                    return null;
                }
                return ReadNumber();
            }

            bool TryWord(string word)
            {
                if (string.CompareOrdinal(text, pos, word, 0, word.Length) != 0) return false;
                int end = pos + word.Length;
                if (end < text.Length && char.IsLetterOrDigit(text[end])) return false;
                pos = end;
                return true;
            }

            string ReadNumber()
            {
                int start = pos;
                while (pos < text.Length && "+-0123456789.eE".IndexOf(text[pos]) >= 0) pos++;
                string number = text.Substring(start, pos - start);
                if (number.Length == 0 ||
                    !double.TryParse(number, NumberStyles.Float, CultureInfo.InvariantCulture, out _))
                    throw Error("expected a string, number, true, false, null, object or array");
                return number;
            }

            void SkipComposite()
            {
                var closers = new Stack<char>();
                do
                {
                    char c = text[pos];
                    if (c == '"')
                    {
                        ReadString();
                        continue;
                    }
                    if (c == '{') closers.Push('}');
                    else if (c == '[') closers.Push(']');
                    else if (c == '}' || c == ']')
                    {
                        if (closers.Count == 0 || closers.Pop() != c) throw Error($"mismatched '{c}'");
                    }
                    pos++;
                } while (closers.Count > 0 && pos < text.Length);
                if (closers.Count > 0) throw Error("unterminated object or array");
            }
        }
    }
}
