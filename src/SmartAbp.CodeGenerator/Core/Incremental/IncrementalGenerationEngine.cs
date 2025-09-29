using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using SmartAbp.CodeGenerator.Core.Pipeline;

namespace SmartAbp.CodeGenerator.Core.Incremental;

/// <summary>
/// 增量代码生成引擎
/// 实现智能的增量生成逻辑，避免重复生成未变更的文件
/// </summary>
public class IncrementalGenerationEngine
{
    private readonly ILogger<IncrementalGenerationEngine> _logger;
    private readonly GenerationStateManager _stateManager;
    private readonly InputHashCalculator _hashCalculator;
    private readonly StableGenerationPipeline _pipeline;

    public IncrementalGenerationEngine(
        ILogger<IncrementalGenerationEngine> logger,
        GenerationStateManager stateManager,
        InputHashCalculator hashCalculator,
        StableGenerationPipeline pipeline)
    {
        _logger = logger;
        _stateManager = stateManager;
        _hashCalculator = hashCalculator;
        _pipeline = pipeline;
    }

    /// <summary>
    /// 执行增量代码生成
    /// </summary>
    /// <param name="request">生成请求</param>
    /// <returns>增量生成结果</returns>
    public async Task<IncrementalGenerationResult> ExecuteAsync(IncrementalGenerationRequest request)
    {
        var result = new IncrementalGenerationResult
        {
            GenerationId = Guid.NewGuid().ToString("N"),
            StartTime = DateTime.UtcNow,
            Request = request
        };

        try
        {
            _logger.LogInformation("开始增量代码生成 {GenerationId}", result.GenerationId);

            // 1. 加载上次生成状态
            var previousState = await _stateManager.LoadStateAsync(request.OutputPath);
            _logger.LogDebug("加载上次生成状态: {HasPreviousState}", previousState != null);

            // 2. 计算当前输入哈希
            var currentInputs = await AnalyzeInputsAsync(request);
            _logger.LogDebug("分析到 {InputCount} 个输入项", currentInputs.Count);

            // 3. 确定需要重新生成的文件
            var changedInputs = DetermineChangedInputs(currentInputs, previousState);
            _logger.LogInformation("检测到 {ChangedCount}/{TotalCount} 个输入发生变更", 
                changedInputs.Count, currentInputs.Count);

            // 4. 执行增量生成
            if (changedInputs.Any())
            {
                var generationRequest = CreateGenerationRequest(request, changedInputs);
                var generationResult = await _pipeline.ExecuteAsync(generationRequest);
                
                // 转换字典格式的生成文件到GeneratedFileInfo对象
                foreach (var (relativePath, content) in generationResult.GeneratedFiles)
                {
                    var absolutePath = Path.Combine(request.OutputPath, relativePath);
                    result.GeneratedFiles.Add(new GeneratedFileInfo
                    {
                        RelativePath = relativePath,
                        AbsolutePath = absolutePath,
                        Content = content,
                        Size = content?.Length ?? 0,
                        Type = DetermineFileType(relativePath)
                    });
                }
                
                // 检查是否生成失败并添加错误信息
                if (!generationResult.IsSuccess)
                {
                    result.Errors.Add(new GenerationError
                    {
                        Type = GenerationErrorType.SystemError,
                        Message = generationResult.FinalError ?? "代码生成失败",
                        Details = generationResult.GenerationSummary
                    });
                }
            }
            else
            {
                _logger.LogInformation("无变更检测到，跳过代码生成");
                result.SkippedReason = "无输入变更";
            }

            // 5. 更新生成状态
            var newState = new GenerationState
            {
                GenerationId = result.GenerationId,
                Timestamp = result.StartTime,
                InputHashes = currentInputs.ToDictionary(i => i.Key, i => i.Hash),
                GeneratedFiles = result.GeneratedFiles.Select(f => f.RelativePath).ToList()
            };
            await _stateManager.SaveStateAsync(request.OutputPath, newState);

            result.Success = true;
            result.EndTime = DateTime.UtcNow;
            result.Duration = result.EndTime - result.StartTime;

            _logger.LogInformation("增量代码生成完成 {GenerationId}, 耗时 {Duration}ms, 生成文件 {FileCount}", 
                result.GenerationId, result.Duration.TotalMilliseconds, result.GeneratedFiles.Count);

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "增量代码生成失败 {GenerationId}", result.GenerationId);
            result.Success = false;
            result.Errors.Add(new GenerationError
            {
                Type = GenerationErrorType.SystemError,
                Message = $"增量生成引擎异常: {ex.Message}",
                Details = ex.ToString()
            });
            result.EndTime = DateTime.UtcNow;
            return result;
        }
    }

    /// <summary>
    /// 分析生成输入项
    /// </summary>
    private async Task<List<GenerationInput>> AnalyzeInputsAsync(IncrementalGenerationRequest request)
    {
        var inputs = new List<GenerationInput>();

        // 分析模板文件
        if (Directory.Exists(request.TemplatesPath))
        {
            var templateFiles = Directory.GetFiles(request.TemplatesPath, "*", SearchOption.AllDirectories);
            foreach (var templateFile in templateFiles)
            {
                var content = await File.ReadAllTextAsync(templateFile, Encoding.UTF8);
                var hash = _hashCalculator.ComputeFileHash(content);
                inputs.Add(new GenerationInput
                {
                    Key = $"template:{Path.GetRelativePath(request.TemplatesPath, templateFile)}",
                    Type = GenerationInputType.Template,
                    SourcePath = templateFile,
                    Hash = hash
                });
            }
        }

        // 分析元数据
        if (!string.IsNullOrEmpty(request.MetadataJson))
        {
            var hash = _hashCalculator.ComputeStringHash(request.MetadataJson);
            inputs.Add(new GenerationInput
            {
                Key = "metadata:primary",
                Type = GenerationInputType.Metadata,
                Hash = hash
            });
        }

        // 分析配置文件
        if (!string.IsNullOrEmpty(request.ConfigurationPath) && File.Exists(request.ConfigurationPath))
        {
            var content = await File.ReadAllTextAsync(request.ConfigurationPath, Encoding.UTF8);
            var hash = _hashCalculator.ComputeFileHash(content);
            inputs.Add(new GenerationInput
            {
                Key = "config:primary",
                Type = GenerationInputType.Configuration,
                SourcePath = request.ConfigurationPath,
                Hash = hash
            });
        }

        return inputs;
    }

    /// <summary>
    /// 确定发生变更的输入项
    /// </summary>
    private List<GenerationInput> DetermineChangedInputs(
        List<GenerationInput> currentInputs, 
        GenerationState? previousState)
    {
        if (previousState == null)
        {
            _logger.LogDebug("首次生成，所有输入都需要处理");
            return currentInputs;
        }

        var changedInputs = new List<GenerationInput>();
        
        foreach (var input in currentInputs)
        {
            if (!previousState.InputHashes.TryGetValue(input.Key, out var previousHash) || 
                previousHash != input.Hash)
            {
                changedInputs.Add(input);
                _logger.LogDebug("输入变更检测: {InputKey} - {ChangeType}", 
                    input.Key, 
                    previousState.InputHashes.ContainsKey(input.Key) ? "修改" : "新增");
            }
        }

        // 检查已删除的输入
        var removedInputs = previousState.InputHashes.Keys
            .Where(k => !currentInputs.Any(i => i.Key == k))
            .ToList();

        if (removedInputs.Any())
        {
            _logger.LogDebug("检测到已删除的输入: {RemovedInputs}", string.Join(", ", removedInputs));
            // 如果有输入被删除，需要重新生成相关文件
            return currentInputs; // 简化处理：全量重新生成
        }

        return changedInputs;
    }

    /// <summary>
    /// 创建生成请求
    /// </summary>
    private StableGenerationRequest CreateGenerationRequest(
        IncrementalGenerationRequest request, 
        List<GenerationInput> changedInputs)
    {
        return new StableGenerationRequest
        {
            OutputPath = request.OutputPath,
            TemplatesPath = request.TemplatesPath,
            MetadataJson = request.MetadataJson,
            ConfigurationPath = request.ConfigurationPath,
            EnableValidation = request.EnableValidation,
            EnableOptimization = request.EnableOptimization,
            // 增量模式特定标记
            IncrementalMode = true,
            ChangedInputKeys = changedInputs.Select(i => i.Key).ToList()
        };
    }

    /// <summary>
    /// 根据文件路径确定文件类型
    /// </summary>
    private static GeneratedFileType DetermineFileType(string filePath)
    {
        var extension = Path.GetExtension(filePath).ToLowerInvariant();
        var fileName = Path.GetFileName(filePath).ToLowerInvariant();

        return extension switch
        {
            ".cs" => GeneratedFileType.Source,
            ".ts" => GeneratedFileType.Source,
            ".js" => GeneratedFileType.Source,
            ".vue" => GeneratedFileType.Source,
            ".json" => GeneratedFileType.Configuration,
            ".xml" => GeneratedFileType.Configuration,
            ".yaml" or ".yml" => GeneratedFileType.Configuration,
            ".md" => GeneratedFileType.Documentation,
            ".txt" => GeneratedFileType.Documentation,
            ".sql" => GeneratedFileType.Script,
            ".ps1" => GeneratedFileType.Script,
            ".sh" => GeneratedFileType.Script,
            ".bat" => GeneratedFileType.Script,
            ".css" => GeneratedFileType.Resource,
            ".scss" => GeneratedFileType.Resource,
            ".png" or ".jpg" or ".jpeg" or ".gif" or ".svg" => GeneratedFileType.Resource,
            _ when fileName.Contains("test") || fileName.Contains("spec") => GeneratedFileType.Test,
            _ => GeneratedFileType.Source
        };
    }
}

/// <summary>
/// 增量生成请求
/// </summary>
public class IncrementalGenerationRequest
{
    /// <summary>
    /// 输出路径
    /// </summary>
    public required string OutputPath { get; set; }

    /// <summary>
    /// 模板路径
    /// </summary>
    public required string TemplatesPath { get; set; }

    /// <summary>
    /// 元数据JSON
    /// </summary>
    public string? MetadataJson { get; set; }

    /// <summary>
    /// 配置文件路径
    /// </summary>
    public string? ConfigurationPath { get; set; }

    /// <summary>
    /// 启用验证
    /// </summary>
    public bool EnableValidation { get; set; } = true;

    /// <summary>
    /// 启用优化
    /// </summary>
    public bool EnableOptimization { get; set; } = true;
}

/// <summary>
/// 增量生成结果
/// </summary>
public class IncrementalGenerationResult
{
    /// <summary>
    /// 生成ID
    /// </summary>
    public required string GenerationId { get; set; }

    /// <summary>
    /// 生成请求
    /// </summary>
    public required IncrementalGenerationRequest Request { get; set; }

    /// <summary>
    /// 是否成功
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// 开始时间
    /// </summary>
    public DateTime StartTime { get; set; }

    /// <summary>
    /// 结束时间
    /// </summary>
    public DateTime EndTime { get; set; }

    /// <summary>
    /// 持续时间
    /// </summary>
    public TimeSpan Duration { get; set; }

    /// <summary>
    /// 生成的文件
    /// </summary>
    public List<GeneratedFileInfo> GeneratedFiles { get; set; } = new();

    /// <summary>
    /// 错误列表
    /// </summary>
    public List<GenerationError> Errors { get; set; } = new();

    /// <summary>
    /// 跳过原因
    /// </summary>
    public string? SkippedReason { get; set; }
}

/// <summary>
/// 生成输入项
/// </summary>
public class GenerationInput
{
    /// <summary>
    /// 输入键
    /// </summary>
    public required string Key { get; set; }

    /// <summary>
    /// 输入类型
    /// </summary>
    public GenerationInputType Type { get; set; }

    /// <summary>
    /// 源文件路径
    /// </summary>
    public string? SourcePath { get; set; }

    /// <summary>
    /// 内容哈希
    /// </summary>
    public required string Hash { get; set; }
}

/// <summary>
/// 生成输入类型
/// </summary>
public enum GenerationInputType
{
    Template,
    Metadata,
    Configuration
}
