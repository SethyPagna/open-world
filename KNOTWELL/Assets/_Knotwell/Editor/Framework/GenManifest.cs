using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using Game.Core.Random;
using UnityEngine;

namespace Game.Editor
{
    /// <summary>
    /// Hashes generator inputs (10_UNITY_TECH §4.4): the sorted project-relative paths and the bytes of every file
    /// under them, with <see cref="Hash64"/>, so the hash is identical on every machine for identical bytes.
    /// </summary>
    public static class InputHasher
    {
        const string Domain = "kw-gen-inputs-v1";

        /// <summary>
        /// Hashes the files named by <paramref name="projectRelativePaths"/> under <paramref name="projectRoot"/>.
        /// Folders are expanded recursively (<c>.meta</c> files excluded); a missing path contributes a "missing"
        /// marker. Order and duplicates in the input list do not matter.
        /// </summary>
        public static ulong Hash(string projectRoot, IEnumerable<string> projectRelativePaths)
        {
            string root = Path.GetFullPath(projectRoot);
            var files = new SortedDictionary<string, string>(StringComparer.Ordinal);
            var missing = new SortedSet<string>(StringComparer.Ordinal);
            foreach (string raw in projectRelativePaths ?? Enumerable.Empty<string>())
            {
                if (string.IsNullOrWhiteSpace(raw)) continue;
                string rel = Normalize(raw);
                string full = Path.GetFullPath(Path.Combine(root, rel));
                if (File.Exists(full)) files[rel] = full;
                else if (Directory.Exists(full))
                {
                    foreach (string f in Directory.GetFiles(full, "*", SearchOption.AllDirectories))
                    {
                        if (f.EndsWith(".meta", StringComparison.OrdinalIgnoreCase)) continue;
                        files[Normalize(Relative(root, f))] = f;
                    }
                }
                else missing.Add(rel);
            }

            ulong h = Hash64.Of(Domain);
            foreach (var pair in files)
            {
                h = Hash64.Combine(h, Hash64.Of(pair.Key));
                h = Hash64.Combine(h, Hash64.Of(File.ReadAllBytes(pair.Value)));
            }
            foreach (string rel in missing)
            {
                h = Hash64.Combine(h, Hash64.Of(rel));
                h = Hash64.Combine(h, Hash64.Of("<missing>"));
            }
            return h;
        }

        /// <summary>Forward slashes, no leading "./", no trailing slash.</summary>
        public static string Normalize(string path)
        {
            string p = path.Replace('\\', '/').Trim();
            while (p.StartsWith("./", StringComparison.Ordinal)) p = p.Substring(2);
            return p.TrimEnd('/');
        }

        static string Relative(string root, string full)
        {
            string r = root.EndsWith(Path.DirectorySeparatorChar.ToString(), StringComparison.Ordinal) ? root : root + Path.DirectorySeparatorChar;
            return full.StartsWith(r, StringComparison.OrdinalIgnoreCase) ? full.Substring(r.Length) : full;
        }
    }

    /// <summary>One manifest row: what was generated from which input hash, and when.</summary>
    [Serializable]
    public sealed class GenManifestEntry
    {
        /// <summary>Generator id, or a per-item key such as <c>rooms/bell_golem</c>.</summary>
        public string key;

        /// <summary>The input hash as 16 lower-case hex digits (JSON cannot carry a ulong safely).</summary>
        public string inputsHash;

        /// <summary>ISO-8601 UTC time of the run.</summary>
        public string generatedUtc;

        /// <summary>The generator's summary line.</summary>
        public string summary;
    }

    /// <summary>
    /// <c>Assets/_Knotwell/Generated/gen_manifest.json</c> (10_UNITY_TECH §4.4): the input hash each generator (or
    /// item) last ran from. Only generators write it. Entries are kept sorted by key so the file diffs cleanly.
    /// </summary>
    [Serializable]
    public sealed class GenManifest
    {
        /// <summary>The project-relative location of the manifest.</summary>
        public const string ProjectPath = "Assets/_Knotwell/Generated/gen_manifest.json";

        /// <summary>The schema this code writes.</summary>
        public const int CurrentSchema = 1;

        [SerializeField] int schemaVersion = CurrentSchema;
        [SerializeField] List<GenManifestEntry> entries = new List<GenManifestEntry>();

        /// <summary>Every entry, sorted by key.</summary>
        public IReadOnlyList<GenManifestEntry> Entries => entries;

        /// <summary>The schema version read from disk.</summary>
        public int SchemaVersion => schemaVersion;

        /// <summary>
        /// Loads the manifest at <paramref name="fullPath"/>. A missing file is an empty manifest; an unreadable
        /// file or another schema is also treated as empty (<paramref name="discarded"/> set), which only makes
        /// every generator run once.
        /// </summary>
        public static GenManifest Load(string fullPath, out bool discarded)
        {
            discarded = false;
            if (!File.Exists(fullPath)) return new GenManifest();
            try
            {
                GenManifest m = JsonUtility.FromJson<GenManifest>(File.ReadAllText(fullPath));
                if (m == null || m.schemaVersion != CurrentSchema)
                {
                    discarded = true;
                    return new GenManifest();
                }
                m.entries ??= new List<GenManifestEntry>();
                m.entries.RemoveAll(e => e == null || string.IsNullOrEmpty(e.key));
                m.Sort();
                return m;
            }
            catch (ArgumentException)
            {
                discarded = true;
                return new GenManifest();
            }
        }

        /// <summary>Writes the manifest atomically (temp file, then replace), creating the folder if needed.</summary>
        public void Save(string fullPath)
        {
            Sort();
            string dir = Path.GetDirectoryName(fullPath);
            if (!string.IsNullOrEmpty(dir)) Directory.CreateDirectory(dir);
            string tmp = fullPath + ".tmp";
            File.WriteAllText(tmp, JsonUtility.ToJson(this, true) + "\n");
            if (File.Exists(fullPath)) File.Delete(fullPath);
            File.Move(tmp, fullPath);
        }

        /// <summary>True when <paramref name="key"/> was last generated from <paramref name="hash"/>.</summary>
        public bool Matches(string key, ulong hash)
        {
            GenManifestEntry e = Find(key);
            return e != null && string.Equals(e.inputsHash, Hex(hash), StringComparison.Ordinal);
        }

        /// <summary>Records (or replaces) the entry for <paramref name="key"/>.</summary>
        public void Record(string key, ulong hash, string summary, DateTime utc)
        {
            if (string.IsNullOrEmpty(key)) throw new ArgumentException("A manifest key is required.", nameof(key));
            GenManifestEntry e = Find(key);
            if (e == null)
            {
                e = new GenManifestEntry { key = key };
                entries.Add(e);
            }
            e.inputsHash = Hex(hash);
            e.generatedUtc = utc.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ", CultureInfo.InvariantCulture);
            e.summary = summary ?? "";
            Sort();
        }

        /// <summary>Removes the entry for <paramref name="key"/>, forcing its next run. Returns whether one existed.</summary>
        public bool Forget(string key) => entries.RemoveAll(e => string.Equals(e.key, key, StringComparison.Ordinal)) > 0;

        /// <summary>The entry for <paramref name="key"/>, or null.</summary>
        public GenManifestEntry Find(string key) => entries.FirstOrDefault(e => string.Equals(e.key, key, StringComparison.Ordinal));

        /// <summary>16 lower-case hex digits.</summary>
        public static string Hex(ulong hash) => hash.ToString("x16", CultureInfo.InvariantCulture);

        void Sort() => entries.Sort((a, b) => string.CompareOrdinal(a.key, b.key));
    }
}
