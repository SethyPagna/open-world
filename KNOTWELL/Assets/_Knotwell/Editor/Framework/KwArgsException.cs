using System;

namespace Game.Editor
{
    /// <summary>
    /// A malformed command line or command argument (10_UNITY_TECH §17). The CLI prints only its message, no stack,
    /// because the fix is always in the invocation, not in the code.
    /// </summary>
    public sealed class KwArgsException : FormatException
    {
        /// <summary>Creates the exception with a message that names the offending argument.</summary>
        public KwArgsException(string message) : base(message) { }
    }

    /// <summary>
    /// An expected command failure (validation errors, a missing input file). Commands throw it so batchmode exits
    /// non-zero (10_UNITY_TECH §17); the CLI prints its message without a stack trace. Any other exception type is
    /// treated as a bug and printed with its stack.
    /// </summary>
    public sealed class KwCommandException : Exception
    {
        /// <summary>Creates the exception with the one-line reason the command failed.</summary>
        public KwCommandException(string message) : base(message) { }

        /// <summary>Creates the exception wrapping the underlying cause.</summary>
        public KwCommandException(string message, Exception inner) : base(message, inner) { }
    }
}
