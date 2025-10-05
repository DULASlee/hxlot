using System;
using System.Collections.Generic;

namespace SmartAbp.CodeGenerator.Assembly
{
    /// <summary>
    /// 装配件健康状态
    /// </summary>
    public class AssemblyHealth
    {
        public AssemblyHealthStatus Status { get; set; }
        public DateTime LastCheckTime { get; set; }
        public string Message { get; set; } = string.Empty;
        public Dictionary<string, object>? Details { get; set; }
        public Exception? Error { get; set; }
    }

    /// <summary>
    /// 系统健康状态
    /// </summary>
    public class SystemHealth
    {
        public AssemblyHealthStatus Status { get; set; }
        public string Message { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public Dictionary<string, AssemblyHealth> AssemblyHealth { get; set; } = new();
        public object? Details { get; set; }
    }

    /// <summary>
    /// 依赖关系图
    /// </summary>
    public class DependencyGraph
    {
        private readonly Dictionary<string, List<string>> _dependencies = new();

        public void AddNode(string nodeName, List<string> dependencies)
        {
            _dependencies[nodeName] = dependencies ?? new List<string>();
        }

        public List<string> GetDependencies(string nodeName)
        {
            return _dependencies.TryGetValue(nodeName, out var deps) ? deps : new List<string>();
        }

        public bool HasCycles(string startNode)
        {
            var visited = new HashSet<string>();
            var recursionStack = new HashSet<string>();
            return HasCyclesHelper(startNode, visited, recursionStack);
        }

        private bool HasCyclesHelper(string node, HashSet<string> visited, HashSet<string> recursionStack)
        {
            if (recursionStack.Contains(node))
                return true;

            if (visited.Contains(node))
                return false;

            visited.Add(node);
            recursionStack.Add(node);

            foreach (var dependency in GetDependencies(node))
            {
                if (HasCyclesHelper(dependency, visited, recursionStack))
                    return true;
            }

            recursionStack.Remove(node);
            return false;
        }
    }
}