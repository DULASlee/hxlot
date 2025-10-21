using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.DevKit.Core.Metadata;
using SmartAbp.DevKit.Core.Templates;
using SmartAbp.DevKit.Core.Models;
using SmartAbp.DevKit.Core.Config;
using SmartAbp.DevKit.Core.Incremental;
using SmartAbp.DevKit.Core.CodeMerge;

namespace SmartAbp.DevKit.Core.Generator;

/// <summary>
/// Generator编排器
/// DevKit v2.0核心组件 - 协调所有Generator的执行
///
/// 核心职责:
/// 1. 加载LowCodeConfig
/// 2. 按序执行Domain → Application → HttpApi → Frontend
/// 3. 汇总生成结果
/// 4. 返回GenerationResult
/// </summary>
public class GeneratorOrchestrator
{
    private readonly ILogger<GeneratorOrchestrator> _logger;
    private readonly ConfigLoader _configLoader;
    private readonly UnifiedMetadataSDK _metadataSDK;
    private readonly TemplateManager _templateManager;
    private readonly PartialClassManager _partialClassManager;

    // ✅ 真实Generator（按执行顺序）
    private readonly DomainGenerator _domainGenerator;
    private readonly ApplicationGenerator _applicationGenerator;
    private readonly VueCrudPageGenerator _frontendGenerator;

    public GeneratorOrchestrator(
        ILogger<GeneratorOrchestrator> logger,
        ConfigLoader configLoader,
        UnifiedMetadataSDK metadataSDK,
        TemplateManager templateManager,
        PartialClassManager partialClassManager)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _configLoader = configLoader ?? throw new ArgumentNullException(nameof(configLoader));
        _metadataSDK = metadataSDK ?? throw new ArgumentNullException(nameof(metadataSDK));
        _templateManager = templateManager ?? throw new ArgumentNullException(nameof(templateManager));
        _partialClassManager = partialClassManager ?? throw new ArgumentNullException(nameof(partialClassManager));

        // 初始化Generators
        var domainLogger = Microsoft.Extensions.Logging.Abstractions.NullLoggerFactory.Instance.CreateLogger<DomainGenerator>();
        _domainGenerator = new DomainGenerator(domainLogger, metadataSDK, templateManager);

        var appLogger = Microsoft.Extensions.Logging.Abstractions.NullLoggerFactory.Instance.CreateLogger<ApplicationGenerator>();
        _applicationGenerator = new ApplicationGenerator(appLogger, metadataSDK, templateManager);

        // VueCrudPageGenerator只需要2个参数（没有ILogger）
        _frontendGenerator = new VueCrudPageGenerator(metadataSDK, templateManager);
    }

    /// <summary>
    /// 执行完整的代码生成流程（支持增量生成）
    /// </summary>
    /// <param name="projectPath">项目路径（包含.lowcode/目录）</param>
    /// <param name="enableIncremental">是否启用增量生成（默认true）</param>
    /// <returns>生成结果</returns>
    public async Task<GeneratorOrchestratorResult> GenerateAsync(string projectPath, bool enableIncremental = true)
    {
        var stopwatch = Stopwatch.StartNew();

        try
        {
            _logger.LogInformation("📦 开始代码生成: {ProjectPath} (增量模式: {Incremental})",
                projectPath, enableIncremental ? "✅" : "❌");

            // Step 1: 加载配置
            var config = await _configLoader.LoadConfigAsync(projectPath);
            _logger.LogInformation("✅ 配置加载成功: 模块={ModuleName}, 实体数={EntityCount}",
                config.ModuleName, config.Entities.Count);

            // Step 2: 初始化增量哈希缓存
            IncrementalHashCache? hashCache = null;
            if (enableIncremental)
            {
                var hashCacheLogger = Microsoft.Extensions.Logging.Abstractions.NullLoggerFactory.Instance
                    .CreateLogger<IncrementalHashCache>();
                hashCache = new IncrementalHashCache(hashCacheLogger, projectPath);
                await hashCache.LoadHashesAsync();
            }

            var allGeneratedFiles = new Dictionary<string, string>();
            var errors = new List<string>();

            // Step 3: 执行Domain层生成
            _logger.LogInformation("🔨 正在生成Domain层代码...");
            var domainInput = new DomainGeneratorInput { Config = config };
            var domainOutput = await _domainGenerator.GenerateAsync(domainInput);
            MergeFiles(allGeneratedFiles, domainOutput.GeneratedFiles);
            _logger.LogInformation("✅ Domain层生成完成: {FileCount}个文件", domainOutput.GeneratedFiles.Count);

            // Step 4: 执行Application层生成
            _logger.LogInformation("🔨 正在生成Application层代码...");
            var appInput = new ApplicationGeneratorInput { Config = config };
            var appOutput = await _applicationGenerator.GenerateAsync(appInput);
            MergeFiles(allGeneratedFiles, appOutput.GeneratedFiles);
            _logger.LogInformation("✅ Application层生成完成: {FileCount}个文件", appOutput.GeneratedFiles.Count);

            // Step 5: 执行Frontend层生成（并行优化 - DevKit v2.0性能优化）
            _logger.LogInformation("🔨 正在生成Frontend层代码（并行模式）...");
            var frontendFileCount = 0;

            // 筛选需要生成的实体
            var entitiesToGenerate = config.Entities
                .Where(e => (e.CodeGeneration?.GenerateCrud ?? true) && e.Id != Guid.Empty)
                .ToList();

            if (entitiesToGenerate.Count > 0)
            {
                // ✅ 并行生成优化：使用Task.WhenAll并行生成所有实体
                // 使用SemaphoreSlim限制并发数（避免资源耗尽）
                var maxConcurrency = Math.Min(Environment.ProcessorCount * 2, 10); // 最多10个并发
                var semaphore = new SemaphoreSlim(maxConcurrency);
                var frontendFiles = new ConcurrentDictionary<string, string>();

                _logger.LogDebug("并行生成配置: 实体数={Count}, 最大并发={MaxConcurrency}",
                    entitiesToGenerate.Count, maxConcurrency);

                var tasks = entitiesToGenerate.Select(async entity =>
                {
                    await semaphore.WaitAsync();
                    try
                    {
                        var entityId = entity.Id;
                        var frontendOutput = await _frontendGenerator.GenerateAsync(entityId);

                        // 将VueCrudPageGeneratorOutput转换为GeneratedFiles字典
                        var files = ConvertVueOutputToFiles(frontendOutput, entity, config);

                        // 线程安全地合并文件
                        foreach (var (path, code) in files)
                        {
                            frontendFiles.TryAdd(path, code);
                        }

                        _logger.LogDebug("✅ 实体 {EntityName} 前端代码生成完成（并行）", entity.Name);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "❌ 实体 {EntityName} 前端代码生成失败", entity.Name);
                        errors.Add($"实体 {entity.Name} 生成失败: {ex.Message}");
                    }
                    finally
                    {
                        semaphore.Release();
                    }
                });

                // 等待所有任务完成
                await Task.WhenAll(tasks);

                // 合并到总文件集合
                foreach (var (path, code) in frontendFiles)
                {
                    allGeneratedFiles[path] = code;
                }

                frontendFileCount = frontendFiles.Count;
                _logger.LogInformation("✅ Frontend层生成完成: {FileCount}个文件（并行加速）", frontendFileCount);
            }
            else
            {
                _logger.LogWarning("⚠️  没有需要生成前端代码的实体");
            }

            // Step 6: 增量生成过滤（DevKit v2.0核心优化）
            var filesToWrite = allGeneratedFiles;
            var skippedFileCount = 0;

            if (enableIncremental && hashCache != null)
            {
                _logger.LogInformation("🔍 开始增量检查...");
                filesToWrite = hashCache.FilterChangedFiles(allGeneratedFiles);
                skippedFileCount = allGeneratedFiles.Count - filesToWrite.Count;

                if (skippedFileCount > 0)
                {
                    _logger.LogInformation(
                        "⚡ 增量优化: 跳过 {SkippedCount}/{TotalCount} 个未变更文件，节省 {Ratio:P0}",
                        skippedFileCount,
                        allGeneratedFiles.Count,
                        skippedFileCount / (double)allGeneratedFiles.Count);
                }
            }

            // Step 7: 更新哈希缓存
            if (enableIncremental && hashCache != null && filesToWrite.Count > 0)
            {
                hashCache.UpdateMultipleHashes(filesToWrite);
                await hashCache.SaveHashesAsync();
            }

            stopwatch.Stop();

            // Step 8: 返回结果
            _logger.LogInformation(
                "🎉 代码生成完成！总文件={Total}, 写入={Written}, 跳过={Skipped}, 耗时={ElapsedMs}ms",
                allGeneratedFiles.Count,
                filesToWrite.Count,
                skippedFileCount,
                stopwatch.ElapsedMilliseconds);

            return new GeneratorOrchestratorResult
            {
                Success = true,
                GeneratedFiles = filesToWrite, // 返回需要写入的文件
                AllGeneratedFiles = allGeneratedFiles, // 返回所有生成的文件（包含跳过的）
                Errors = errors,
                DomainFileCount = domainOutput.GeneratedFiles.Count,
                ApplicationFileCount = appOutput.GeneratedFiles.Count,
                FrontendFileCount = frontendFileCount,
                SkippedFileCount = skippedFileCount,
                ElapsedMilliseconds = stopwatch.ElapsedMilliseconds
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ 代码生成失败");

            return new GeneratorOrchestratorResult
            {
                Success = false,
                GeneratedFiles = new Dictionary<string, string>(),
                Errors = new List<string> { ex.Message },
                ElapsedMilliseconds = stopwatch.ElapsedMilliseconds
            };
        }
    }

    /// <summary>
    /// 将VueCrudPageGeneratorOutput转换为GeneratedFiles字典
    /// </summary>
    /// <param name="output">Vue生成器输出</param>
    /// <param name="entity">实体定义DTO（用于获取实体名称）</param>
    /// <param name="config">低代码配置</param>
    /// <returns>生成的文件字典（路径→内容）</returns>
    private Dictionary<string, string> ConvertVueOutputToFiles(
        VueCrudPageGeneratorOutput output,
        SmartAbp.Application.Contracts.LowCode.Dtos.EntityDefinitionDto entity,
        Models.LowCodeConfig config)
    {
        var files = new Dictionary<string, string>();

        // ✅ 使用EntityDefinitionDto.Name作为实体名称
        var entityName = entity.Name;
        var frontendBasePath = config.OutputPaths?.FrontendPath ?? "src/SmartAbp.Vue/src/views";

        // 列表页面: views/{EntityName}/index.vue
        var listPagePath = System.IO.Path.Combine(frontendBasePath, entityName, "index.vue");
        files[listPagePath] = output.ListPageCode;

        // 表单弹窗: views/{EntityName}/components/FormDialog.vue
        var formDialogPath = System.IO.Path.Combine(frontendBasePath, entityName, "components", "FormDialog.vue");
        files[formDialogPath] = output.FormDialogCode;

        // API Client: api/{entityName}.ts
        var apiBasePath = config.OutputPaths?.FrontendPath?.Replace("/views", "/api")
            ?? "src/SmartAbp.Vue/src/api";
        var apiClientPath = System.IO.Path.Combine(apiBasePath, $"{entityName.ToLowerInvariant()}.ts");
        files[apiClientPath] = output.ApiClientCode;

        // TypeScript类型定义: types/{entityName}.ts
        var typesBasePath = config.OutputPaths?.FrontendPath?.Replace("/views", "/types")
            ?? "src/SmartAbp.Vue/src/types";
        var typeDefPath = System.IO.Path.Combine(typesBasePath, $"{entityName.ToLowerInvariant()}.ts");
        files[typeDefPath] = output.TypeDefinitionsCode;

        _logger.LogDebug("✅ 转换前端文件: {EntityName} → {FileCount}个文件", entityName, files.Count);

        return files;
    }

    /// <summary>
    /// 合并生成的文件
    /// </summary>
    private void MergeFiles(Dictionary<string, string> target, Dictionary<string, string> source)
    {
        foreach (var (path, code) in source)
        {
            if (target.ContainsKey(path))
            {
                _logger.LogWarning("⚠️  文件冲突，跳过: {FilePath}", path);
                continue;
            }
            target[path] = code;
        }
    }
}

/// <summary>
/// Generator编排器结果
/// </summary>
public class GeneratorOrchestratorResult
{
    /// <summary>
    /// 是否成功
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// 实际需要写入的文件（增量生成后过滤的结果）
    /// </summary>
    public Dictionary<string, string> GeneratedFiles { get; set; } = new();

    /// <summary>
    /// 所有生成的文件（包含跳过的未变更文件）
    /// </summary>
    public Dictionary<string, string> AllGeneratedFiles { get; set; } = new();

    /// <summary>
    /// 错误列表
    /// </summary>
    public List<string> Errors { get; set; } = new();

    /// <summary>
    /// Domain层文件数
    /// </summary>
    public int DomainFileCount { get; set; }

    /// <summary>
    /// Application层文件数
    /// </summary>
    public int ApplicationFileCount { get; set; }

    /// <summary>
    /// Frontend层文件数
    /// </summary>
    public int FrontendFileCount { get; set; }

    /// <summary>
    /// 跳过的文件数（增量生成优化）
    /// </summary>
    public int SkippedFileCount { get; set; }

    /// <summary>
    /// 总耗时（毫秒）
    /// </summary>
    public long ElapsedMilliseconds { get; set; }
}

