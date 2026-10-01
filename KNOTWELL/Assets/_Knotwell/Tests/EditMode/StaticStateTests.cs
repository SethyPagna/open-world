using System;
using System.Linq;
using System.Reflection;
using System.Runtime.CompilerServices;
using NUnit.Framework;
using UnityEngine;

namespace Game.Tests.EditMode
{
    /// <summary>
    /// Domain reload is off (Enter Play Mode Options), so a mutable static survives between play sessions.
    /// 10_UNITY_TECH §3.2 rule 5: every static field in a runtime Game.* assembly is readonly or const, or its
    /// declaring type has a [RuntimeInitializeOnLoadMethod(SubsystemRegistration)] reset method.
    /// </summary>
    public class StaticStateTests
    {
        [Test]
        public void MutableStatics_HaveASubsystemRegistrationReset()
        {
            const BindingFlags Flags = BindingFlags.Static | BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.DeclaredOnly;
            var offenders = AppDomain.CurrentDomain.GetAssemblies()
                .Where(IsRuntimeGameAssembly)
                .SelectMany(a => a.GetTypes())
                .Where(t => !t.IsDefined(typeof(CompilerGeneratedAttribute), false))
                .SelectMany(t => t.GetFields(Flags).Select(f => (type: t, field: f)))
                .Where(x => !x.field.IsLiteral && !x.field.IsInitOnly && !x.field.IsDefined(typeof(CompilerGeneratedAttribute), false))
                .Where(x => !HasReset(x.type))
                .Select(x => $"{x.type.FullName}.{x.field.Name}")
                .ToList();
            Assert.IsEmpty(offenders, "Mutable statics without a SubsystemRegistration reset:\n" + string.Join("\n", offenders));
        }

        [Test]
        public void AllRuntimeLayersAreLoaded()
        {
            var names = AppDomain.CurrentDomain.GetAssemblies().Select(a => a.GetName().Name).ToHashSet();
            foreach (var layer in new[] { "Core", "Content", "Platform", "Net", "Hero", "Rooms", "Bots", "Tower", "UI" })
                Assert.That(names, Does.Contain("Game." + layer));
        }

        static bool IsRuntimeGameAssembly(Assembly a)
        {
            string n = a.GetName().Name;
            return n.StartsWith("Game.") && !n.StartsWith("Game.Tests") && n != "Game.Editor";
        }

        static bool HasReset(Type t) => t.GetMethods(BindingFlags.Static | BindingFlags.Public | BindingFlags.NonPublic)
            .Any(m => m.GetCustomAttribute<RuntimeInitializeOnLoadMethodAttribute>() is { } a
                      && a.loadType == RuntimeInitializeLoadType.SubsystemRegistration);
    }
}
