using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.DevKit.Core.Abstractions;
using SmartAbp.DevKit.Core.Models;

namespace SmartAbp.DevKit.Core;

/// <summary>
/// 代码生成引擎（核心编排类，负责协调所有生成器）
/// </summary>
public class CodeGeneratorEngine
{
    private readonly ILogger<CodeGeneratorEngine> _logger;
    private readonly ITemplateEngine _templateEngine;
    private readonly IConfigurationManager _configManager;
    private readonly IPerformanceProfiler _profiler;
    private readonly List<ICodeGenerator> _generators;

    public CodeGeneratorEngine(
        ILogger<CodeGeneratorEngine> logger,
        ITemplateEngine templateEngine,
        IConfigurationManager configManager,
        IPerformanceProfiler profiler)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _templateEngine = templateEngine ?? throw new ArgumentNullException(nameof(templateEngine));
        _configManager = configManager ?? throw new ArgumentNullException(nameof(configManager));
        _profiler = profiler ?? throw new ArgumentNullException(nameof(profiler));
        _generators = new List<ICodeGenerator>();
    }

    /// <summary>
    /// 注册代码生成器
    /// </summary>
    /// <param name="generator">生成器实例</param>
    public void RegisterGenerator(ICodeGenerator generator)
    {
        if (generator == null)
            throw new ArgumentNullException(nameof(generator));

        _generators.Add(generator);
        _logger.LogInformation(
            "Registered generator: {GeneratorName} (Layer: {Layer}, Priority: {Priority})",
            generator.Name,
            generator.SupportedLayer,
            generator.Priority);
    }

    /// <summary>
    /// 注册多个生成器
    /// </summary>
    /// <param name="generators">生成器列表</param>
    public void RegisterGenerators(IEnumerable<ICodeGenerator> generators)
    {
        foreach (var generator in generators)
        {
            RegisterGenerator(generator);
        }
    }

    /// <summary>
    /// 生成代码（主入口方法）
    /// </summary>
    /// <param name="module">低代码模块配置</param>
    /// <param name="outputPath">输出路径</param>
    /// <param name="options">生成选项</param>
    /// <param name="cancellationToken">取消令牌</param>
    /// <returns>生成报告</returns>
    public async Task<Result<GenerationReport>> GenerateAsync(
        LowCodeConfig module,
        string outputPath,
        GenerationOptions? options = null,
        CancellationToken cancellationToken = default)
    {
        return await GenerateAsync(module, outputPath, targetPlatform: null, options, cancellationToken);
    }

    /// <summary>
    /// 生成代码（支持多平台选择）
    /// </summary>
    /// <param name="module">低代码模块配置</param>
    /// <param name="outputPath">输出路径</param>
    /// <param name="targetPlatform">目标平台（可选，null表示所有平台）</param>
    /// <param name="options">生成选项</param>
    /// <param name="cancellationToken">取消令牌</param>
    /// <returns>生成报告</returns>
    public async Task<Result<GenerationReport>> GenerateAsync(
        LowCodeConfig module,
        string outputPath,
        Platform.TargetPlatform? targetPlatform,
        GenerationOptions? options = null,
        CancellationToken cancellationToken = default)
    {
        var stopwatch = Stopwatch.StartNew();
        var report = new GenerationReport
        {
            StartTime = DateTime.UtcNow,
            ModuleName = module.ModuleName,
            TargetLayer = module.CurrentLayer,
            TargetPlatform = targetPlatform
        };

        try
        {
            _logger.LogInformation(
                "Starting code generation for module: {ModuleName}, Layer: {Layer}",
                module.ModuleName,
                module.CurrentLayer);

            // 步骤1: 验证配置
            using (_profiler.BeginScope("ValidateConfiguration"))
            {
                var validationResult = _configManager.Validate(module);
                if (!validationResult.IsValid)
                {
                    var errorMessage = $"Configuration validation failed: {string.Join(", ", validationResult.Errors)}";
                    _logger.LogError(errorMessage);
                    return Result<GenerationReport>.Failure(errorMessage);
                }
            }

            // 步骤2: 创建生成上下文
            var context = new GenerationContext
            {
                Config = module,
                OutputPath = outputPath,
                TargetLayer = module.CurrentLayer,
                GenerationMode = GenerationMode.Create,
                Options = options ?? new GenerationOptions()
            };

            // 步骤3: 选择并排序生成器（支持平台过滤）
            var selectedGenerators = SelectAndSortGenerators(module.CurrentLayer, targetPlatform);
            _logger.LogInformation(
                "Selected {Count} generators for Layer {Layer}, Platform: {Platform}",
                selectedGenerators.Count,
                module.CurrentLayer,
                targetPlatform?.ToString() ?? "All");

            // 步骤4: 验证所有生成器
            foreach (var generator in selectedGenerators)
            {
                var validationResult = await generator.ValidateAsync(context);
                if (!validationResult.IsValid)
                {
                    var errorMessage = $"Generator {generator.Name} validation failed: {string.Join(", ", validationResult.Errors)}";
                    _logger.LogError(errorMessage);
                    return Result<GenerationReport>.Failure(errorMessage);
                }
            }

            // 步骤5: 执行代码生成（串行或并行）
            List<GeneratedFile> allGeneratedFiles;
            if (context.Options.UseParallelGeneration)
            {
                allGeneratedFiles = await GenerateParallelAsync(selectedGenerators, context, cancellationToken);
            }
            else
            {
                allGeneratedFiles = await GenerateSerialAsync(selectedGenerators, context, cancellationToken);
            }

            // 步骤6: 汇总结果
            report.GeneratedFiles = allGeneratedFiles;
            report.EndTime = DateTime.UtcNow;
            report.DurationMs = stopwatch.ElapsedMilliseconds;
            report.Statistics = new GenerationStatistics
            {
                FileCount = allGeneratedFiles.Count,
                LineCount = allGeneratedFiles.Sum(f => f.Content.Split('\n').Length),
                DurationMs = stopwatch.ElapsedMilliseconds,
                MemoryUsageBytes = GC.GetTotalMemory(false)
            };

            _logger.LogInformation(
                "Code generation completed successfully. Generated {FileCount} files in {DurationMs}ms",
                report.Statistics.FileCount,
                report.Statistics.DurationMs);

            return Result<GenerationReport>.Success(report);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Code generation failed with exception");
            report.EndTime = DateTime.UtcNow;
            report.DurationMs = stopwatch.ElapsedMilliseconds;
            return Result<GenerationReport>.Failure($"Generation failed: {ex.Message}");
        }
    }

    /// <summary>
    /// 选择并排序生成器（根据目标层级、平台和依赖关系）
    /// </summary>
    /// <param name="targetLayer">目标层级</param>
    /// <param name="targetPlatform">目标平台（可选，null表示所有平台）</param>
    /// <returns>排序后的生成器列表</returns>
    private List<ICodeGenerator> SelectAndSortGenerators(
        TargetLayer targetLayer,
        Platform.TargetPlatform? targetPlatform = null)
    {
        // 选择支持目标层级的生成器
        var selectedGenerators = _generators
            .Where(g => g.IsEnabled && g.SupportedLayer == targetLayer)
            .ToList();

        // 如果指定了目标平台，进一步过滤前端生成器
        if (targetPlatform.HasValue && targetLayer == TargetLayer.Layer2)
        {
            // 只保留符合目标平台的前端生成器
            selectedGenerators = selectedGenerators
                .Where(g =>
                {
                    // 判断生成器是否为前端生成器（BaseFrontendGenerator的子类）
                    if (g is Platform.BaseFrontendGenerator frontendGen)
                    {
                        // 通过生成器名称判断平台（简单实现）
                        return g.Name.StartsWith(targetPlatform.Value.ToString(), StringComparison.OrdinalIgnoreCase);
                    }
                    // 非前端生成器保留（如后端生成器）
                    return true;
                })
                .ToList();
        }

        // 按优先级排序（优先级高的先执行）
        selectedGenerators.Sort((a, b) => b.Priority.CompareTo(a.Priority));

        // TODO: 后续实现依赖关系排序（拓扑排序）

        return selectedGenerators;
    }

    /// <summary>
    /// 串行生成代码
    /// </summary>
    private async Task<List<GeneratedFile>> GenerateSerialAsync(
        List<ICodeGenerator> generators,
        GenerationContext context,
        CancellationToken cancellationToken)
    {
        var allGeneratedFiles = new List<GeneratedFile>();

        foreach (var generator in generators)
        {
            using (_profiler.BeginScope($"Generate_{generator.Name}"))
            {
                _logger.LogDebug("Generating with {GeneratorName}...", generator.Name);

                var result = await generator.GenerateAsync(context, cancellationToken);

                if (result.IsSuccess)
                {
                    allGeneratedFiles.AddRange(result.GeneratedFiles);
                    _logger.LogDebug(
                        "Generator {GeneratorName} completed. Generated {FileCount} files",
                        generator.Name,
                        result.GeneratedFiles.Count);
                }
                else
                {
                    _logger.LogWarning(
                        "Generator {GeneratorName} failed: {ErrorMessage}",
                        generator.Name,
                        result.ErrorMessage);
                }
            }
        }

        return allGeneratedFiles;
    }

    /// <summary>
    /// 并行生成代码
    /// </summary>
    private async Task<List<GeneratedFile>> GenerateParallelAsync(
        List<ICodeGenerator> generators,
        GenerationContext context,
        CancellationToken cancellationToken)
    {
        // 使用信号量限制并发数
        var semaphore = new SemaphoreSlim(context.Options.MaxConcurrency);
        var tasks = new List<Task<GenerationResult>>();

        foreach (var generator in generators)
        {
            tasks.Add(GenerateWithSemaphoreAsync(generator, context, semaphore, cancellationToken));
        }

        var results = await Task.WhenAll(tasks);

        // 合并所有生成的文件
        var allGeneratedFiles = results
            .Where(r => r.IsSuccess)
            .SelectMany(r => r.GeneratedFiles)
            .ToList();

        // 记录失败的生成器
        var failedGenerators = results
            .Where(r => !r.IsSuccess)
            .ToList();

        if (failedGenerators.Any())
        {
            _logger.LogWarning(
                "{Count} generators failed during parallel generation",
                failedGenerators.Count);
        }

        return allGeneratedFiles;
    }

    /// <summary>
    /// 使用信号量控制并发的生成方法
    /// </summary>
    private async Task<GenerationResult> GenerateWithSemaphoreAsync(
        ICodeGenerator generator,
        GenerationContext context,
        SemaphoreSlim semaphore,
        CancellationToken cancellationToken)
    {
        await semaphore.WaitAsync(cancellationToken);
        try
        {
            using (_profiler.BeginScope($"Generate_{generator.Name}"))
            {
                _logger.LogDebug("Generating with {GeneratorName} (parallel)...", generator.Name);
                var result = await generator.GenerateAsync(context, cancellationToken);

                if (result.IsSuccess)
                {
                    _logger.LogDebug(
                        "Generator {GeneratorName} completed. Generated {FileCount} files",
                        generator.Name,
                        result.GeneratedFiles.Count);
                }

                return result;
            }
        }
        finally
        {
            semaphore.Release();
        }
    }
}

/// <summary>
/// 生成报告
/// </summary>
public class GenerationReport
{
    /// <summary>
    /// 报告ID
    /// </summary>
    public Guid ReportId { get; set; } = Guid.NewGuid();

    /// <summary>
    /// 模块名称
    /// </summary>
    public string ModuleName { get; set; } = string.Empty;

    /// <summary>
    /// 目标层级
    /// </summary>
    public TargetLayer TargetLayer { get; set; }

    /// <summary>
    /// 目标平台（可选，null表示所有平台）
    /// </summary>
    public Platform.TargetPlatform? TargetPlatform { get; set; }

    /// <summary>
    /// 开始时间
    /// </summary>
    public DateTime StartTime { get; set; }

    /// <summary>
    /// 结束时间
    /// </summary>
    public DateTime? EndTime { get; set; }

    /// <summary>
    /// 总耗时（毫秒）
    /// </summary>
    public long DurationMs { get; set; }

    /// <summary>
    /// 生成的文件列表
    /// </summary>
    public List<GeneratedFile> GeneratedFiles { get; set; } = new();

    /// <summary>
    /// 统计信息
    /// </summary>
    public GenerationStatistics Statistics { get; set; } = new();

    /// <summary>
    /// 警告消息列表
    /// </summary>
    public List<string> Warnings { get; set; } = new();
}

