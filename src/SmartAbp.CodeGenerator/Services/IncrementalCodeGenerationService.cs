using Microsoft.Extensions.Logging;
using SmartAbp.CodeGenerator.Core.Incremental;
using SmartAbp.CodeGenerator.Core.Pipeline;

namespace SmartAbp.CodeGenerator.Services;

/// <summary>
/// 增量代码生成服务
/// 对外提供增量代码生成的高级接口
/// </summary>
public interface IIncrementalCodeGenerationService
{
    /// <summary>
    /// 执行增量代码生成
    /// </summary>
    /// <param name="request">增量生成请求</param>
    /// <returns>增量生成结果</returns>
    Task<IncrementalCodeGenerationResult> GenerateAsync(IncrementalCodeGenerationRequest request);

    /// <summary>
    /// 强制全量重新生成
    /// </summary>
    /// <param name="request">增量生成请求</param>
    /// <returns>增量生成结果</returns>
    Task<IncrementalCodeGenerationResult> ForceRegenerateAsync(IncrementalCodeGenerationRequest request);

    /// <summary>
    /// 清除生成缓存
    /// </summary>
    /// <param name="outputPath">输出路径</param>
    Task ClearCacheAsync(string outputPath);

    /// <summary>
    /// 检查是否需要重新生成
    /// </summary>
    /// <param name="request">增量生成请求</param>
    /// <returns>是否需要重新生成</returns>
    Task<bool> IsRegenerationNeededAsync(IncrementalCodeGenerationRequest request);
}

/// <summary>
/// 增量代码生成服务实现
/// </summary>
public class IncrementalCodeGenerationService : IIncrementalCodeGenerationService
{
    private readonly ILogger<IncrementalCodeGenerationService> _logger;
    private readonly IncrementalGenerationEngine _incrementalEngine;
    private readonly StableGenerationPipeline _stableEngine;
    private readonly GenerationStateManager _stateManager;

    public IncrementalCodeGenerationService(
        ILogger<IncrementalCodeGenerationService> logger,
        IncrementalGenerationEngine incrementalEngine,
        StableGenerationPipeline stableEngine,
        GenerationStateManager stateManager)
    {
        _logger = logger;
        _incrementalEngine = incrementalEngine;
        _stableEngine = stableEngine;
        _stateManager = stateManager;
    }

    /// <summary>
    /// 执行增量代码生成
    /// </summary>
    public async Task<IncrementalCodeGenerationResult> GenerateAsync(IncrementalCodeGenerationRequest request)
    {
        _logger.LogInformation("开始增量代码生成: {ModuleName}, 输出路径: {OutputPath}", 
            request.ModuleName, request.OutputPath);

        try
        {
            // 转换为内部增量请求
            var internalRequest = ConvertToInternalRequest(request);
            
            // 执行增量生成
            var internalResult = await _incrementalEngine.ExecuteAsync(internalRequest);
            
            // 转换结果
            var result = ConvertToPublicResult(internalResult, request);
            
            _logger.LogInformation("增量代码生成完成: {GenerationId}, 耗时: {Duration}ms, 成功: {Success}", 
                result.GenerationId, result.Duration.TotalMilliseconds, result.Success);
                
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "增量代码生成失败: {ModuleName}", request.ModuleName);
            return new IncrementalCodeGenerationResult
            {
                GenerationId = Guid.NewGuid().ToString("N"),
                ModuleName = request.ModuleName,
                Success = false,
                ErrorMessage = $"增量代码生成失败: {ex.Message}",
                StartTime = DateTime.UtcNow,
                EndTime = DateTime.UtcNow
            };
        }
    }

    /// <summary>
    /// 强制全量重新生成
    /// </summary>
    public async Task<IncrementalCodeGenerationResult> ForceRegenerateAsync(IncrementalCodeGenerationRequest request)
    {
        _logger.LogInformation("开始强制全量重新生成: {ModuleName}", request.ModuleName);

        try
        {
            // 清除状态缓存
            await _stateManager.ClearStateAsync(request.OutputPath);
            
            // 执行增量生成（此时会进行全量生成）
            return await GenerateAsync(request);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "强制全量重新生成失败: {ModuleName}", request.ModuleName);
            throw;
        }
    }

    /// <summary>
    /// 清除生成缓存
    /// </summary>
    public async Task ClearCacheAsync(string outputPath)
    {
        _logger.LogInformation("清除生成缓存: {OutputPath}", outputPath);
        
        try
        {
            await _stateManager.ClearStateAsync(outputPath);
            _logger.LogInformation("成功清除生成缓存: {OutputPath}", outputPath);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "清除生成缓存失败: {OutputPath}", outputPath);
            throw;
        }
    }

    /// <summary>
    /// 检查是否需要重新生成
    /// </summary>
    public async Task<bool> IsRegenerationNeededAsync(IncrementalCodeGenerationRequest request)
    {
        try
        {
            // 检查状态文件是否存在
            if (!_stateManager.StateExists(request.OutputPath))
            {
                _logger.LogDebug("状态文件不存在，需要生成: {OutputPath}", request.OutputPath);
                return true;
            }

            // 简化检查：加载状态并比较时间戳
            var state = await _stateManager.LoadStateAsync(request.OutputPath);
            if (state == null)
            {
                _logger.LogDebug("无法加载状态，需要生成: {OutputPath}", request.OutputPath);
                return true;
            }

            // 可以添加更复杂的检查逻辑，比如检查输入文件的修改时间
            _logger.LogDebug("状态检查完成，上次生成时间: {Timestamp}", state.Timestamp);
            return false; // 简化逻辑：假设不需要重新生成
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "检查重新生成需求时出错，默认需要生成: {OutputPath}", request.OutputPath);
            return true;
        }
    }

    /// <summary>
    /// 转换为内部增量请求
    /// </summary>
    private IncrementalGenerationRequest ConvertToInternalRequest(IncrementalCodeGenerationRequest request)
    {
        return new IncrementalGenerationRequest
        {
            OutputPath = request.OutputPath,
            TemplatesPath = request.TemplatesPath,
            MetadataJson = request.MetadataJson,
            ConfigurationPath = request.ConfigurationPath,
            EnableValidation = request.EnableValidation,
            EnableOptimization = request.EnableOptimization
        };
    }

    /// <summary>
    /// 转换为公共结果
    /// </summary>
    private IncrementalCodeGenerationResult ConvertToPublicResult(
        IncrementalGenerationResult internalResult, 
        IncrementalCodeGenerationRequest request)
    {
        return new IncrementalCodeGenerationResult
        {
            GenerationId = internalResult.GenerationId,
            ModuleName = request.ModuleName,
            Success = internalResult.Success,
            StartTime = internalResult.StartTime,
            EndTime = internalResult.EndTime,
            Duration = internalResult.Duration,
            GeneratedFilesCount = internalResult.GeneratedFiles.Count,
            ErrorMessage = internalResult.Errors.FirstOrDefault()?.Message,
            SkippedReason = internalResult.SkippedReason,
            GeneratedFiles = internalResult.GeneratedFiles.Select(f => f.RelativePath).ToList()
        };
    }
}

/// <summary>
/// 增量代码生成请求
/// </summary>
public class IncrementalCodeGenerationRequest
{
    /// <summary>
    /// 模块名称
    /// </summary>
    public required string ModuleName { get; set; }

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
/// 增量代码生成结果
/// </summary>
public class IncrementalCodeGenerationResult
{
    /// <summary>
    /// 生成ID
    /// </summary>
    public required string GenerationId { get; set; }

    /// <summary>
    /// 模块名称
    /// </summary>
    public required string ModuleName { get; set; }

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
    /// 生成文件数量
    /// </summary>
    public int GeneratedFilesCount { get; set; }

    /// <summary>
    /// 生成的文件列表
    /// </summary>
    public List<string> GeneratedFiles { get; set; } = new();

    /// <summary>
    /// 错误消息
    /// </summary>
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// 跳过原因
    /// </summary>
    public string? SkippedReason { get; set; }
}
