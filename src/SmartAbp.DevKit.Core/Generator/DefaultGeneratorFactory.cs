using SmartAbp.DevKit.Abstractions.Generation;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace SmartAbp.DevKit.Core.Generator;

/// <summary>
/// 默认代码生成器工厂实现（依赖注入容器模式）
///
/// 架构原则：
/// ✅ 依赖注入：使用IServiceProvider动态获取生成器实例
/// ✅ 单一职责：只负责生成器的创建和管理
/// ✅ 开闭原则：新增生成器只需在DI容器注册，无需修改此类
/// </summary>
public class DefaultGeneratorFactory : IGeneratorFactory
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<DefaultGeneratorFactory> _logger;
    private readonly Dictionary<string, Type> _generatorTypes = new();

    public DefaultGeneratorFactory(
        IServiceProvider serviceProvider,
        ILogger<DefaultGeneratorFactory> logger)
    {
        _serviceProvider = serviceProvider ?? throw new ArgumentNullException(nameof(serviceProvider));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));

        // 自动发现所有已注册的生成器
        DiscoverGenerators();
    }

    public IEnumerable<ILayerGenerator> GetGenerators(TargetLayer layer)
    {
        _logger.LogDebug("🔍 获取目标层级的生成器: {Layer}", layer);

        var allGenerators = GetAllGenerators().ToList();
        var filteredGenerators = allGenerators
            .Where(g => (g.Layer & layer) != 0)
            .OrderBy(g => g.Priority)
            .ToList();

        _logger.LogDebug("  ✅ 找到 {Count} 个生成器", filteredGenerators.Count);

        return filteredGenerators;
    }

    public IEnumerable<ILayerGenerator> GetAllGenerators()
    {
        _logger.LogDebug("🔍 获取所有已注册的生成器");

        var generators = _serviceProvider.GetServices<ILayerGenerator>().ToList();

        _logger.LogDebug("  ✅ 共有 {Count} 个生成器", generators.Count);

        return generators;
    }

    public ILayerGenerator? GetGeneratorByName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentNullException(nameof(name));

        _logger.LogDebug("🔍 根据名称获取生成器: {Name}", name);

        var generator = GetAllGenerators().FirstOrDefault(g =>
            g.Name.Equals(name, StringComparison.OrdinalIgnoreCase));

        if (generator != null)
        {
            _logger.LogDebug("  ✅ 找到生成器: {Name}", generator.Name);
        }
        else
        {
            _logger.LogWarning("  ⚠️ 未找到生成器: {Name}", name);
        }

        return generator;
    }

    public void RegisterGenerator(ILayerGenerator generator)
    {
        if (generator == null)
            throw new ArgumentNullException(nameof(generator));

        _logger.LogInformation("📝 注册生成器: {Name} ({Layer})", generator.Name, generator.Layer);

        var generatorType = generator.GetType();
        _generatorTypes[generator.Name] = generatorType;
    }

    /// <summary>
    /// 自动发现所有已注册的生成器类型
    /// </summary>
    private void DiscoverGenerators()
    {
        _logger.LogInformation("🔍 开始自动发现生成器...");

        var generators = GetAllGenerators().ToList();

        foreach (var generator in generators)
        {
            var generatorType = generator.GetType();
            _generatorTypes[generator.Name] = generatorType;

            _logger.LogInformation("  • 发现生成器: {Name} ({Type}) - {Layer} - 优先级:{Priority}",
                generator.Name, generatorType.Name, generator.Layer, generator.Priority);
        }

        _logger.LogInformation("✅ 生成器发现完成，共 {Count} 个", generators.Count);
    }
}

