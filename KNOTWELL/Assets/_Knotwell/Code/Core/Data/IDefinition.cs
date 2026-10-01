namespace Game.Core.Data
{
    /// <summary>
    /// A top-level definition with a string id: the key <c>DefRegistry</c> sorts to assign net ids
    /// (10_UNITY_TECH §4.5). Records implement it explicitly, so the id stays a plain <c>id</c> field in JSON.
    /// </summary>
    public interface IDefinition
    {
        /// <summary>The definition's id (snake_case, unique across every definition in the build).</summary>
        string Id { get; }
    }
}
