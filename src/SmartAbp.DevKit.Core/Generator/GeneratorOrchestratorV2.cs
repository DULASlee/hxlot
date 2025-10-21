using SmartAbp.DevKit.Abstractions.Metadata;
using SmartAbp.DevKit.Abstractions.Generation;
using SmartAbp.DevKit.Abstractions.Configuration;
using Microsoft.Extensions.Logging;
using System.Diagnostics;

namespace SmartAbp.DevKit.Core.Generator;

/// <summary>
/// 代码生成器超级编排器（企业级架构 v3.0）
///
/// 架构原则：
/// ✅ 依赖倒置原则（DIP）：只依赖抽象接口（IGeneratorFactory），不依赖具体生成器
/// ✅ 单一职责原则（SRP）：只负责编排和结果聚合，不关心具体生成逻辑
/// ✅ 开闭原则（OCP）：对扩展开放（新增生成器），对修改关闭（不需修改此类）
/// ✅ 接口隔离原则（ISP）：通过ILayerGenerator统一接口，各生成器独立实现
///
/// 工作流程：
/// 1. 从工厂获取生成器 → 2. 按层级和优先级排序 → 3. 并行执行 → 4. 聚合结果
/// </summary>
public class GeneratorOrchestratorV2 : ICodeGenerator
{
    private readonly IGeneratorFactory _generatorFactory;
    private readonly IMetadataProvider _metadataProvider;
    private readonly IConfigurationProvider _configProvider;
    private readonly ILogger<GeneratorOrchestratorV2> _logger;

    /// <summary>
    /// 构造函数（依赖抽象，而非具体实现）
    /// </summary>
    public GeneratorOrchestratorV2(
        IGeneratorFactory generatorFactory,
        IMetadataProvider metadataProvider,
        IConfigurationProvider configProvider,
        ILogger<GeneratorOrchestratorV2> logger)
    {
        _generatorFactory = generatorFactory ?? throw new ArgumentNullException(nameof(generatorFactory));
        _metadataProvider = metadataProvider ?? throw new ArgumentNullException(nameof(metadataProvider));
        _configProvider = configProvider ?? throw new ArgumentNullException(nameof(configProvider));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<GenerationResult> GenerateAsync(GenerationInput input)
    {
        var stopwatch = Stopwatch.StartNew();

        try
        {
            _logger.LogInformation("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            _logger.LogInformation("🚀 开始代码生成编排: EntityId={EntityId}", input.EntityId);
            _logger.LogInformation("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

            // 1. 获取所有适用的生成器（依赖抽象工厂）
            var generators = GetApplicableGenerators(input.Options);
            _logger.LogInformation("📋 已加载 {Count} 个生成器", generators.Count);

            // 2. 验证生成器输入
            await ValidateGeneratorsAsync(input, generators);

            // 3. 按优先级排序生成器
            var sortedGenerators = generators
                .OrderBy(g => g.Priority)
                .ThenBy(g => g.Layer)
                .ToList();

            _logger.LogInformation("📊 生成器执行顺序:");
            foreach (var gen in sortedGenerators)
            {
                _logger.LogInformation("  • {Priority} - {Layer} - {Name}",
                    gen.Priority, gen.Layer, gen.Name);
            }

            // 4. 并行执行生成器
            var generationTasks = sortedGenerators.Select(g => ExecuteGeneratorAsync(g, input));
            var layerResults = await Task.WhenAll(generationTasks);

            // 5. 聚合所有生成结果
            var finalResult = AggregateResults(layerResults);
            finalResult.Success = true;

            stopwatch.Stop();
            _logger.LogInformation("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            _logger.LogInformation("✅ 代码生成完成: 文件数={FileCount}, 耗时={Elapsed}ms",
                finalResult.GeneratedFiles.Count, stopwatch.ElapsedMilliseconds);
            _logger.LogInformation("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

            return finalResult;
        }
        catch (Exception ex)
        {
            stopwatch.Stop();
            _logger.LogError(ex, "❌ 代码生成失败: EntityId={EntityId}, 耗时={Elapsed}ms",
                input.EntityId, stopwatch.ElapsedMilliseconds);

            return new GenerationResult
            {
                Success = false,
                Errors = { $"代码生成异常: {ex.Message}" }
            };
        }
    }

    /// <summary>
    /// 获取适用的生成器（依赖倒置原则 - 通过工厂获取）
    /// </summary>
    private List<ILayerGenerator> GetApplicableGenerators(GenerationOptions options)
    {
        var generators = new List<ILayerGenerator>();
        var targetLayers = TargetLayer.None;

        if (options.GenerateDomain)
            targetLayers |= TargetLayer.Domain;

        if (options.GenerateApplication)
            targetLayers |= TargetLayer.Application;

        if (options.GenerateFrontend)
            targetLayers |= TargetLayer.Frontend;

        // TODO: 等待GenerationOptions添加GenerateTests属性
        // if (options.GenerateTests)
        //     targetLayers |= TargetLayer.Tests;

        // ✅ 通过工厂获取生成器，而不是直接依赖具体类
        generators.AddRange(_generatorFactory.GetGenerators(targetLayers));

        return generators;
    }

    /// <summary>
    /// 验证所有生成器的输入参数
    /// </summary>
    private async Task ValidateGeneratorsAsync(GenerationInput input, List<ILayerGenerator> generators)
    {
        _logger.LogInformation("🔍 开始验证生成器输入...");

        var validationTasks = generators.Select(g => g.ValidateAsync(input));
        var validationResults = await Task.WhenAll(validationTasks);

        var failedValidations = validationResults.Where(r => !r.IsValid).ToList();
        if (failedValidations.Any())
        {
            var errors = failedValidations.SelectMany(v => v.Errors);
            throw new InvalidOperationException($"生成器验证失败: {string.Join(", ", errors)}");
        }

        _logger.LogInformation("✅ 所有生成器验证通过");
    }

    /// <summary>
    /// 执行单个生成器（带错误隔离）
    /// </summary>
    private async Task<LayerGenerationResult> ExecuteGeneratorAsync(ILayerGenerator generator, GenerationInput input)
    {
        var stopwatch = Stopwatch.StartNew();

        try
        {
            _logger.LogInformation("🔨 执行生成器: {Name} ({Layer})", generator.Name, generator.Layer);

            var result = await generator.GenerateAsync(input);
            result.ElapsedMilliseconds = stopwatch.ElapsedMilliseconds;

            if (result.Success)
            {
                _logger.LogInformation("  ✅ {Name} 完成: {FileCount} 个文件, 耗时 {Elapsed}ms",
                    generator.Name, result.GeneratedFiles.Count, result.ElapsedMilliseconds);
            }
            else
            {
                _logger.LogWarning("  ⚠️ {Name} 失败: {Errors}",
                    generator.Name, string.Join(", ", result.Errors));
            }

            return result;
        }
        catch (Exception ex)
        {
            stopwatch.Stop();
            _logger.LogError(ex, "  ❌ {Name} 异常: {Error}", generator.Name, ex.Message);

            return new LayerGenerationResult
            {
                Success = false,
                Errors = { $"{generator.Name} 执行异常: {ex.Message}" },
                ElapsedMilliseconds = stopwatch.ElapsedMilliseconds
            };
        }
    }

    /// <summary>
    /// 聚合所有生成结果
    /// </summary>
    private GenerationResult AggregateResults(LayerGenerationResult[] layerResults)
    {
        var finalResult = new GenerationResult();

        foreach (var layerResult in layerResults)
        {
            // 聚合文件
            foreach (var file in layerResult.GeneratedFiles)
            {
                finalResult.GeneratedFiles[file.Key] = file.Value;
            }

            // 聚合错误
            finalResult.Errors.AddRange(layerResult.Errors);

            // 聚合警告
            if (layerResult.Warnings.Any())
            {
                finalResult.Errors.AddRange(layerResult.Warnings.Select(w => $"⚠️ {w}"));
            }
        }

        return finalResult;
    }
}
