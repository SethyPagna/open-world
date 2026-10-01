using System;
using Newtonsoft.Json.Linq;

namespace Game.Core.Data
{
    /// <summary>
    /// A room's bot plan: roles, key actions and one goal graph per stage (10_UNITY_TECH §4.3 BotPlanSpec, §12.3;
    /// 05 §1.3; gating fields from 03_SOCIAL_AND_BOTS §25 <c>botPlan{}</c>). Rivals never perform a key action in a
    /// first-visit human's first 90 s unless a human pings "Go!".
    /// </summary>
    [Serializable]
    public sealed class BotPlanSpec
    {
        public BotStage startStage;
        /// <summary>Goal ids whose completion fires <c>clear</c> (the actions the 90 s lock guards).</summary>
        public string[] keyActions = Array.Empty<string>();
        public string finalKeyAction;
        public string[] hiddenClearActions = Array.Empty<string>();
        /// <summary>The room's canonical funny mistake, made in Explore.</summary>
        public string canonicalMistake;
        public string[] survivalActions = Array.Empty<string>();
        /// <summary>Role names, e.g. <c>Ringer</c>, <c>Caller</c>, <c>Catcher</c>.</summary>
        public string[] roles = Array.Empty<string>();
        /// <summary>Bark keys the Rivals may use on the cue.</summary>
        public string[] cueBarks = Array.Empty<string>();
        public BotStageSpec explore;
        public BotStageSpec theorise;
        public BotStageSpec execute;
    }

    /// <summary>One stage's goal graph (10_UNITY_TECH §12.1 "goal graph for the current stage").</summary>
    [Serializable]
    public sealed class BotStageSpec
    {
        public BotGoalSpec[] goals = Array.Empty<BotGoalSpec>();
    }

    /// <summary>A goal-graph node: a role runs an action on a target once the goals in <c>after</c> are done.</summary>
    [Serializable]
    public sealed class BotGoalSpec
    {
        /// <summary>Unique in the plan; <see cref="BotPlanSpec.keyActions"/> refers to it.</summary>
        public string id;
        /// <summary>Role name from <see cref="BotPlanSpec.roles"/>; null means any Rival.</summary>
        public string role;
        public BotAction action;
        /// <summary>Kit id, seat alias or bark key, depending on the action.</summary>
        public string target;
        /// <summary>Goal ids that must complete first.</summary>
        public string[] after = Array.Empty<string>();
        /// <summary>Action arguments, e.g. <c>{"charge": 1.0}</c> for a hop or <c>{"sustain": true}</c> for a croak.</summary>
        public JObject @params;
    }
}
