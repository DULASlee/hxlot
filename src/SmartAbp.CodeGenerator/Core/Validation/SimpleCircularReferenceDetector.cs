using Microsoft.Extensions.Logging;
using SmartAbp.CodeGenerator.Services.V9;

namespace SmartAbp.CodeGenerator.Core.Validation;

/// <summary>
/// 简单循环引用检测器
/// 修复自检发现的致命缺陷：完全没有循环引用处理
/// 使用深度优先搜索算法检测实体间的循环依赖关系
/// </summary>
public class SimpleCircularReferenceDetector
{
    private readonly ILogger<SimpleCircularReferenceDetector> _logger;

    public SimpleCircularReferenceDetector(ILogger<SimpleCircularReferenceDetector> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// 检测模块中的循环引用
    /// </summary>
    /// <param name="entities">实体列表</param>
    /// <returns>检测结果</returns>
    public CircularReferenceDetectionResult DetectCircularReferences(List<EnhancedEntityModelDto> entities)
    {
        var result = new CircularReferenceDetectionResult();

        try
        {
            _logger.LogInformation("开始检测循环引用，实体数量: {EntityCount}", entities.Count);

            // 1. 构建实体依赖图
            var dependencyGraph = BuildEntityDependencyGraph(entities);
            _logger.LogDebug("构建依赖图完成，依赖关系数: {DependencyCount}", 
                dependencyGraph.Sum(kvp => kvp.Value.Count));

            // 2. 使用深度优先搜索检测循环
            var allVisited = new HashSet<string>();

            foreach (var entity in entities)
            {
                if (!allVisited.Contains(entity.Name))
                {
                    var visited = new HashSet<string>();
                    var recursionStack = new HashSet<string>();
                    var currentPath = new List<string>();

                    if (HasCircularReference(entity.Name, dependencyGraph, visited, recursionStack, currentPath))
                    {
                        result.HasCircularReference = true;
                        result.CircularReferencePaths.Add(new CircularReferencePath
                        {
                            PathEntities = new List<string>(currentPath),
                            Description = $"循环路径: {string.Join(" → ", currentPath)} → {currentPath[0]}"
                        });
                        
                        result.ProblematicEntities.AddRange(currentPath);
                    }

                    allVisited.UnionWith(visited);
                }
            }

            // 3. 生成详细分析
            result.TotalEntities = entities.Count;
            result.TotalDependencies = dependencyGraph.Sum(kvp => kvp.Value.Count);
            result.ProblematicEntities = result.ProblematicEntities.Distinct().ToList();

            if (result.HasCircularReference)
            {
                result.RecommendedActions = GenerateRecommendedActions(result.CircularReferencePaths);
            }

            _logger.LogInformation("循环引用检测完成: {Status}, 发现循环 {CircularCount}, 问题实体 {ProblematicCount}",
                result.HasCircularReference ? "❌发现循环" : "✅无循环",
                result.CircularReferencePaths.Count,
                result.ProblematicEntities.Count);

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "循环引用检测过程发生异常");
            result.HasError = true;
            result.ErrorMessage = ex.Message;
            return result;
        }
    }

    /// <summary>
    /// 检测单个实体的循环引用
    /// </summary>
    /// <param name="entityName">实体名称</param>
    /// <param name="entities">所有实体</param>
    /// <returns>是否存在循环引用</returns>
    public bool HasCircularReferenceForEntity(string entityName, List<EnhancedEntityModelDto> entities)
    {
        try
        {
            var dependencyGraph = BuildEntityDependencyGraph(entities);
            var visited = new HashSet<string>();
            var recursionStack = new HashSet<string>();
            var currentPath = new List<string>();

            return HasCircularReference(entityName, dependencyGraph, visited, recursionStack, currentPath);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "检测实体 {EntityName} 的循环引用时发生异常", entityName);
            return false;
        }
    }

    /// <summary>
    /// 构建实体依赖图
    /// </summary>
    /// <param name="entities">实体列表</param>
    /// <returns>依赖图：键为实体名，值为该实体依赖的其他实体列表</returns>
    private Dictionary<string, List<string>> BuildEntityDependencyGraph(List<EnhancedEntityModelDto> entities)
    {
        var graph = new Dictionary<string, List<string>>();
        var entityNames = entities.Select(e => e.Name).ToHashSet();

        foreach (var entity in entities)
        {
            graph[entity.Name] = new List<string>();

            if (entity.Properties != null)
            {
                foreach (var property in entity.Properties)
                {
                    // 检查属性类型是否引用其他实体
                    var referencedEntities = ExtractReferencedEntities(property.Type, entityNames);
                    graph[entity.Name].AddRange(referencedEntities);
                }
            }

            // 去重
            graph[entity.Name] = graph[entity.Name].Distinct().ToList();

            _logger.LogDebug("实体 {EntityName} 依赖: [{Dependencies}]", 
                entity.Name, string.Join(", ", graph[entity.Name]));
        }

        return graph;
    }

    /// <summary>
    /// 从属性类型中提取引用的实体名称
    /// </summary>
    /// <param name="propertyType">属性类型</param>
    /// <param name="entityNames">所有实体名称集合</param>
    /// <returns>引用的实体名称列表</returns>
    private List<string> ExtractReferencedEntities(string? propertyType, HashSet<string> entityNames)
    {
        var referencedEntities = new List<string>();

        if (string.IsNullOrEmpty(propertyType))
        {
            return referencedEntities;
        }

        var cleanType = propertyType.Trim();

        // 1. 直接类型匹配
        if (entityNames.Contains(cleanType))
        {
            referencedEntities.Add(cleanType);
        }

        // 2. 可空类型: EntityName?
        if (cleanType.EndsWith("?"))
        {
            var baseType = cleanType.Substring(0, cleanType.Length - 1);
            if (entityNames.Contains(baseType))
            {
                referencedEntities.Add(baseType);
            }
        }

        // 3. 集合类型: List<EntityName>, ICollection<EntityName>
        var genericMatch = System.Text.RegularExpressions.Regex.Match(
            cleanType, @"(?:List|ICollection|IEnumerable|HashSet)<(\w+)>");
        if (genericMatch.Success)
        {
            var innerType = genericMatch.Groups[1].Value;
            if (entityNames.Contains(innerType))
            {
                referencedEntities.Add(innerType);
            }
        }

        // 4. 数组类型: EntityName[]
        if (cleanType.EndsWith("[]"))
        {
            var elementType = cleanType.Substring(0, cleanType.Length - 2);
            if (entityNames.Contains(elementType))
            {
                referencedEntities.Add(elementType);
            }
        }

        // 5. 字典类型: Dictionary<string, EntityName>
        var dictMatch = System.Text.RegularExpressions.Regex.Match(
            cleanType, @"(?:Dictionary|IDictionary)<\w+,\s*(\w+)>");
        if (dictMatch.Success)
        {
            var valueType = dictMatch.Groups[1].Value;
            if (entityNames.Contains(valueType))
            {
                referencedEntities.Add(valueType);
            }
        }

        return referencedEntities;
    }

    /// <summary>
    /// 使用深度优先搜索检测循环引用
    /// </summary>
    /// <param name="entityName">当前检查的实体</param>
    /// <param name="graph">依赖图</param>
    /// <param name="visited">已访问的实体</param>
    /// <param name="recursionStack">递归栈</param>
    /// <param name="currentPath">当前路径</param>
    /// <returns>是否存在循环引用</returns>
    private bool HasCircularReference(
        string entityName,
        Dictionary<string, List<string>> graph,
        HashSet<string> visited,
        HashSet<string> recursionStack,
        List<string> currentPath)
    {
        // 如果当前实体在递归栈中，说明找到了循环
        if (recursionStack.Contains(entityName))
        {
            // 记录循环路径
            var cycleStartIndex = currentPath.IndexOf(entityName);
            if (cycleStartIndex >= 0)
            {
                currentPath = currentPath.Skip(cycleStartIndex).ToList();
            }
            currentPath.Add(entityName);

            _logger.LogWarning("发现循环引用: {CyclePath}", string.Join(" → ", currentPath));
            return true;
        }

        // 如果已经访问过，且不在递归栈中，说明这条路径安全
        if (visited.Contains(entityName))
        {
            return false;
        }

        // 标记为已访问，并加入递归栈
        visited.Add(entityName);
        recursionStack.Add(entityName);
        currentPath.Add(entityName);

        // 检查所有依赖的实体
        if (graph.ContainsKey(entityName))
        {
            foreach (var dependency in graph[entityName])
            {
                if (HasCircularReference(dependency, graph, visited, recursionStack, currentPath))
                {
                    return true;
                }
            }
        }

        // 从递归栈中移除（回溯）
        recursionStack.Remove(entityName);
        if (currentPath.Count > 0 && currentPath.Last() == entityName)
        {
            currentPath.RemoveAt(currentPath.Count - 1);
        }

        return false;
    }

    /// <summary>
    /// 生成推荐的解决方案
    /// </summary>
    /// <param name="circularPaths">循环路径列表</param>
    /// <returns>推荐操作列表</returns>
    private List<string> GenerateRecommendedActions(List<CircularReferencePath> circularPaths)
    {
        var actions = new List<string>();

        if (!circularPaths.Any())
        {
            return actions;
        }

        actions.Add("🔧 推荐的循环引用解决方案：");
        actions.Add("");

        for (int i = 0; i < circularPaths.Count; i++)
        {
            var path = circularPaths[i];
            actions.Add($"📋 循环 {i + 1}: {path.Description}");
            actions.Add("   解决方案选择：");
            actions.Add("   1. 🔗 使用导航属性：将一个方向设为虚拟导航属性");
            actions.Add("   2. ❓ 设为可选引用：将一个方向的外键设为可空");
            actions.Add("   3. 🔄 引入中间实体：创建关联表来打破直接循环");
            actions.Add("   4. 📦 拆分实体：考虑是否可以将复杂实体拆分为多个独立实体");
            actions.Add("");
        }

        actions.Add("💡 具体实施建议：");
        actions.Add("   - 分析业务逻辑，确定哪个方向的引用是主要的");
        actions.Add("   - 考虑使用 [ForeignKey] 和 [InverseProperty] 特性明确关系");
        actions.Add("   - 评估是否需要使用延迟加载 (Lazy Loading)");
        actions.Add("   - 考虑实现自定义的数据加载策略");

        return actions;
    }

    /// <summary>
    /// 分析依赖图的复杂度
    /// </summary>
    /// <param name="entities">实体列表</param>
    /// <returns>依赖复杂度分析结果</returns>
    public DependencyComplexityAnalysis AnalyzeDependencyComplexity(List<EnhancedEntityModelDto> entities)
    {
        var analysis = new DependencyComplexityAnalysis();

        try
        {
            var graph = BuildEntityDependencyGraph(entities);

            analysis.TotalEntities = entities.Count;
            analysis.TotalDependencies = graph.Sum(kvp => kvp.Value.Count);

            // 计算每个实体的入度和出度
            var inDegree = new Dictionary<string, int>();
            var outDegree = new Dictionary<string, int>();

            foreach (var entity in entities)
            {
                inDegree[entity.Name] = 0;
                outDegree[entity.Name] = graph.ContainsKey(entity.Name) ? graph[entity.Name].Count : 0;
            }

            foreach (var kvp in graph)
            {
                foreach (var dependency in kvp.Value)
                {
                    if (inDegree.ContainsKey(dependency))
                    {
                        inDegree[dependency]++;
                    }
                }
            }

            // 分析统计
            analysis.AverageDependenciesPerEntity = entities.Count > 0 ? 
                (double)analysis.TotalDependencies / entities.Count : 0;

            analysis.MaxOutDegree = outDegree.Values.DefaultIfEmpty(0).Max();
            analysis.MaxInDegree = inDegree.Values.DefaultIfEmpty(0).Max();

            analysis.EntitiesWithNoDependencies = outDegree.Count(kvp => kvp.Value == 0);
            analysis.EntitiesWithHighDependencies = outDegree.Count(kvp => kvp.Value > 3);

            // 复杂度评级
            analysis.ComplexityLevel = DetermineComplexityLevel(analysis);

            _logger.LogInformation("依赖复杂度分析: 实体 {Entities}, 依赖 {Dependencies}, 平均 {Average:F2}, 复杂度 {Level}",
                analysis.TotalEntities, analysis.TotalDependencies, 
                analysis.AverageDependenciesPerEntity, analysis.ComplexityLevel);

            return analysis;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "依赖复杂度分析失败");
            analysis.HasError = true;
            analysis.ErrorMessage = ex.Message;
            return analysis;
        }
    }

    /// <summary>
    /// 确定复杂度级别
    /// </summary>
    private string DetermineComplexityLevel(DependencyComplexityAnalysis analysis)
    {
        if (analysis.TotalEntities == 0) return "无实体";
        if (analysis.AverageDependenciesPerEntity == 0) return "无依赖";
        if (analysis.AverageDependenciesPerEntity <= 1) return "简单";
        if (analysis.AverageDependenciesPerEntity <= 2) return "中等";
        if (analysis.AverageDependenciesPerEntity <= 3) return "复杂";
        return "高度复杂";
    }
}

#region 数据传输对象

/// <summary>
/// 循环引用检测结果
/// </summary>
public class CircularReferenceDetectionResult
{
    public bool HasCircularReference { get; set; }
    public bool HasError { get; set; }
    public string? ErrorMessage { get; set; }
    public int TotalEntities { get; set; }
    public int TotalDependencies { get; set; }
    public List<CircularReferencePath> CircularReferencePaths { get; set; } = new();
    public List<string> ProblematicEntities { get; set; } = new();
    public List<string> RecommendedActions { get; set; } = new();

    public string GetSummary()
    {
        if (HasError)
        {
            return $"❌ 循环引用检测失败: {ErrorMessage}";
        }

        if (!HasCircularReference)
        {
            return $"✅ 无循环引用 (检查了 {TotalEntities} 个实体，{TotalDependencies} 个依赖关系)";
        }

        var lines = new List<string>
        {
            $"❌ 发现循环引用问题:",
            $"   检查实体数: {TotalEntities}",
            $"   依赖关系数: {TotalDependencies}",
            $"   循环路径数: {CircularReferencePaths.Count}",
            $"   问题实体数: {ProblematicEntities.Count}",
            ""
        };

        foreach (var path in CircularReferencePaths)
        {
            lines.Add($"🔄 {path.Description}");
        }

        if (RecommendedActions.Any())
        {
            lines.Add("");
            lines.AddRange(RecommendedActions);
        }

        return string.Join("\n", lines);
    }
}

/// <summary>
/// 循环引用路径
/// </summary>
public class CircularReferencePath
{
    public List<string> PathEntities { get; set; } = new();
    public string Description { get; set; } = string.Empty;
}

/// <summary>
/// 依赖复杂度分析结果
/// </summary>
public class DependencyComplexityAnalysis
{
    public bool HasError { get; set; }
    public string? ErrorMessage { get; set; }
    public int TotalEntities { get; set; }
    public int TotalDependencies { get; set; }
    public double AverageDependenciesPerEntity { get; set; }
    public int MaxOutDegree { get; set; }
    public int MaxInDegree { get; set; }
    public int EntitiesWithNoDependencies { get; set; }
    public int EntitiesWithHighDependencies { get; set; }
    public string ComplexityLevel { get; set; } = string.Empty;

    public string GetAnalysisSummary()
    {
        if (HasError)
        {
            return $"❌ 复杂度分析失败: {ErrorMessage}";
        }

        return $@"📊 依赖复杂度分析:
   复杂度级别: {ComplexityLevel}
   实体总数: {TotalEntities}
   依赖关系总数: {TotalDependencies}
   平均每实体依赖数: {AverageDependenciesPerEntity:F2}
   最大出度: {MaxOutDegree}
   最大入度: {MaxInDegree}
   无依赖实体: {EntitiesWithNoDependencies}
   高依赖实体 (>3): {EntitiesWithHighDependencies}";
    }
}

#endregion
