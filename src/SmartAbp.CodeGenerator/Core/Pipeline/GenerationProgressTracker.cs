using Microsoft.Extensions.Logging;
using System.Collections.Concurrent;

namespace SmartAbp.CodeGenerator.Core.Pipeline;

/// <summary>
/// 生成进度跟踪器
/// 修复自检发现的致命缺陷：缺少进度跟踪和状态监控
/// 提供实时的生成进度跟踪、状态监控和性能统计
/// </summary>
public class GenerationProgressTracker
{
    private readonly ILogger<GenerationProgressTracker> _logger;
    private readonly ConcurrentDictionary<string, GenerationProgress> _progressMap;
    private readonly ConcurrentDictionary<string, List<ProgressEvent>> _eventHistory;

    public GenerationProgressTracker(ILogger<GenerationProgressTracker> logger)
    {
        _logger = logger;
        _progressMap = new ConcurrentDictionary<string, GenerationProgress>();
        _eventHistory = new ConcurrentDictionary<string, List<ProgressEvent>>();
    }

    /// <summary>
    /// 初始化生成进度跟踪
    /// </summary>
    /// <param name="generationId">生成ID</param>
    /// <param name="request">生成请求</param>
    /// <returns></returns>
    public async Task InitializeAsync(string generationId, StableGenerationRequest request)
    {
        try
        {
            var progress = new GenerationProgress
            {
                GenerationId = generationId,
                ModuleName = request.ModuleMetadata.Name,
                StartTime = DateTime.UtcNow,
                CurrentStage = GenerationStage.PreProcessing,
                StageProgress = 0,
                OverallProgress = 0,
                Status = GenerationStatus.Running,
                TotalEntities = request.ModuleMetadata.Entities?.Count ?? 0,
                EstimatedDurationMinutes = EstimateGenerationDuration(request)
            };

            _progressMap[generationId] = progress;
            _eventHistory[generationId] = new List<ProgressEvent>();

            await RecordEventAsync(generationId, ProgressEventType.Started, "生成流水线启动");

            _logger.LogInformation("📈 初始化生成进度跟踪: {GenerationId}, 模块: {ModuleName}, 预计耗时: {EstimatedMinutes}分钟",
                generationId, progress.ModuleName, progress.EstimatedDurationMinutes);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "初始化生成进度跟踪失败: {GenerationId}", generationId);
            throw;
        }
    }

    /// <summary>
    /// 更新阶段进度
    /// </summary>
    /// <param name="generationId">生成ID</param>
    /// <param name="stage">当前阶段</param>
    /// <param name="stageProgress">阶段进度百分比 (0-100)</param>
    /// <returns></returns>
    public async Task UpdateStageAsync(string generationId, GenerationStage stage, int stageProgress)
    {
        try
        {
            if (!_progressMap.TryGetValue(generationId, out var progress))
            {
                _logger.LogWarning("未找到生成进度记录: {GenerationId}", generationId);
                return;
            }

            var previousStage = progress.CurrentStage;
            var previousOverallProgress = progress.OverallProgress;

            progress.CurrentStage = stage;
            progress.StageProgress = Math.Clamp(stageProgress, 0, 100);
            progress.OverallProgress = CalculateOverallProgress(stage, stageProgress);
            progress.LastUpdated = DateTime.UtcNow;

            // 阶段切换时记录事件
            if (previousStage != stage)
            {
                await RecordEventAsync(generationId, ProgressEventType.StageChanged, 
                    $"阶段切换: {previousStage} → {stage}");
            }

            // 重要进度点记录
            if (progress.OverallProgress - previousOverallProgress >= 10)
            {
                await RecordEventAsync(generationId, ProgressEventType.ProgressMilestone,
                    $"进度达到 {progress.OverallProgress}%");
            }

            _logger.LogDebug("📊 更新生成进度: {GenerationId}, 阶段: {Stage} ({StageProgress}%), 总体: {OverallProgress}%",
                generationId, stage, stageProgress, progress.OverallProgress);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "更新生成进度失败: {GenerationId}", generationId);
        }
    }

    /// <summary>
    /// 更新详细状态信息
    /// </summary>
    /// <param name="generationId">生成ID</param>
    /// <param name="currentFile">当前处理的文件</param>
    /// <param name="filesProcessed">已处理文件数</param>
    /// <param name="totalFiles">总文件数</param>
    /// <returns></returns>
    /// 🔥 同步方法修复：移除不必要的async（遵循BUG修复铁律）
    public Task UpdateDetailedStatusAsync(
        string generationId, 
        string currentFile, 
        int filesProcessed, 
        int totalFiles)
    {
        try
        {
            if (!_progressMap.TryGetValue(generationId, out var progress))
            {
                return Task.CompletedTask; // 🔥 async修复：返回完成的任务
            }

            progress.CurrentFile = currentFile;
            progress.FilesProcessed = filesProcessed;
            progress.TotalFiles = totalFiles;
            progress.LastUpdated = DateTime.UtcNow;

            // 计算文件处理速度
            var elapsed = DateTime.UtcNow - progress.StartTime;
            if (elapsed.TotalMinutes > 0 && filesProcessed > 0)
            {
                progress.FilesPerMinute = filesProcessed / elapsed.TotalMinutes;
                
                // 更新预计剩余时间
                if (totalFiles > filesProcessed && progress.FilesPerMinute > 0)
                {
                    var remainingFiles = totalFiles - filesProcessed;
                    progress.EstimatedRemainingMinutes = remainingFiles / progress.FilesPerMinute;
                }
            }

            _logger.LogDebug("📄 更新文件处理进度: {GenerationId}, 当前: {CurrentFile}, 进度: {Processed}/{Total}",
                generationId, Path.GetFileName(currentFile), filesProcessed, totalFiles);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "更新详细状态失败: {GenerationId}", generationId);
        }
        
        // 🔥 async修复：返回完成的任务（遵循BUG修复铁律）
        return Task.CompletedTask;
    }

    /// <summary>
    /// 记录错误或警告
    /// </summary>
    /// <param name="generationId">生成ID</param>
    /// <param name="level">错误级别</param>
    /// <param name="message">错误消息</param>
    /// <param name="exception">异常对象</param>
    /// <returns></returns>
    public async Task RecordIssueAsync(
        string generationId, 
        IssueLevel level, 
        string message, 
        Exception? exception = null)
    {
        try
        {
            if (!_progressMap.TryGetValue(generationId, out var progress))
            {
                return;
            }

            var issue = new GenerationIssue
            {
                Level = level,
                Message = message,
                Exception = exception?.ToString(),
                Timestamp = DateTime.UtcNow,
                Stage = progress.CurrentStage,
                CurrentFile = progress.CurrentFile
            };

            progress.Issues.Add(issue);

            // 更新统计
            switch (level)
            {
                case IssueLevel.Error:
                    progress.ErrorCount++;
                    break;
                case IssueLevel.Warning:
                    progress.WarningCount++;
                    break;
                case IssueLevel.Info:
                    progress.InfoCount++;
                    break;
            }

            await RecordEventAsync(generationId, ProgressEventType.IssueRecorded, 
                $"{level}: {message}");

            _logger.LogDebug("📝 记录生成问题: {GenerationId}, 级别: {Level}, 消息: {Message}",
                generationId, level, message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "记录生成问题失败: {GenerationId}", generationId);
        }
    }

    /// <summary>
    /// 完成生成跟踪
    /// </summary>
    /// <param name="generationId">生成ID</param>
    /// <param name="result">生成结果</param>
    /// <returns></returns>
    public async Task FinalizeAsync(string generationId, StableGenerationResult result)
    {
        try
        {
            if (!_progressMap.TryGetValue(generationId, out var progress))
            {
                _logger.LogWarning("完成跟踪时未找到进度记录: {GenerationId}", generationId);
                return;
            }

            progress.EndTime = DateTime.UtcNow;
            progress.TotalDuration = progress.EndTime - progress.StartTime;
            progress.Status = result.IsSuccess ? GenerationStatus.Completed : GenerationStatus.Failed;
            progress.OverallProgress = 100;
            progress.FinalResult = result;

            await RecordEventAsync(generationId, 
                result.IsSuccess ? ProgressEventType.Completed : ProgressEventType.Failed,
                result.IsSuccess ? "生成成功完成" : $"生成失败: {result.FinalError}");

            // 生成性能统计
            progress.PerformanceMetrics = GeneratePerformanceMetrics(progress);

            _logger.LogInformation("🏁 完成生成跟踪: {GenerationId}, 状态: {Status}, 耗时: {Duration}, 错误: {Errors}, 警告: {Warnings}",
                generationId, progress.Status, progress.TotalDuration, progress.ErrorCount, progress.WarningCount);

            // 可选：清理过期的进度记录（保留最近100个）
            await CleanupOldProgressRecordsAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "完成生成跟踪失败: {GenerationId}", generationId);
        }
    }

    /// <summary>
    /// 获取生成进度
    /// </summary>
    /// <param name="generationId">生成ID</param>
    /// <returns>生成进度，如果不存在返回null</returns>
    public GenerationProgress? GetProgress(string generationId)
    {
        return _progressMap.TryGetValue(generationId, out var progress) ? progress : null;
    }

    /// <summary>
    /// 获取所有活跃的生成进度
    /// </summary>
    /// <returns>活跃的生成进度列表</returns>
    public List<GenerationProgress> GetActiveGenerations()
    {
        return _progressMap.Values
            .Where(p => p.Status == GenerationStatus.Running || p.Status == GenerationStatus.Paused)
            .OrderByDescending(p => p.StartTime)
            .ToList();
    }

    /// <summary>
    /// 获取生成事件历史
    /// </summary>
    /// <param name="generationId">生成ID</param>
    /// <returns>事件历史列表</returns>
    public List<ProgressEvent> GetEventHistory(string generationId)
    {
        return _eventHistory.TryGetValue(generationId, out var events) ? events.ToList() : new List<ProgressEvent>();
    }

    /// <summary>
    /// 获取生成统计摘要
    /// </summary>
    /// <param name="fromDate">起始日期</param>
    /// <returns>统计摘要</returns>
    public GenerationStatistics GetStatisticsSummary(DateTime? fromDate = null)
    {
        var cutoff = fromDate ?? DateTime.UtcNow.AddDays(-7); // 默认最近7天
        var relevantProgress = _progressMap.Values
            .Where(p => p.StartTime >= cutoff)
            .ToList();

        return new GenerationStatistics
        {
            TotalGenerations = relevantProgress.Count,
            SuccessfulGenerations = relevantProgress.Count(p => p.Status == GenerationStatus.Completed),
            FailedGenerations = relevantProgress.Count(p => p.Status == GenerationStatus.Failed),
            AverageDurationMinutes = relevantProgress.Where(p => p.TotalDuration.TotalMinutes > 0)
                .Select(p => p.TotalDuration.TotalMinutes).DefaultIfEmpty().Average(),
            TotalFilesGenerated = relevantProgress.Sum(p => p.TotalFiles),
            TotalErrors = relevantProgress.Sum(p => p.ErrorCount),
            TotalWarnings = relevantProgress.Sum(p => p.WarningCount),
            FromDate = cutoff,
            ToDate = DateTime.UtcNow
        };
    }

    #region 私有辅助方法

    /// <summary>
    /// 估算生成持续时间
    /// </summary>
    private double EstimateGenerationDuration(StableGenerationRequest request)
    {
        var entityCount = request.ModuleMetadata.Entities?.Count ?? 0;
        var baseMinutes = 0.5; // 基础时间
        var perEntityMinutes = 0.2; // 每个实体额外时间
        
        var estimated = baseMinutes + (entityCount * perEntityMinutes);
        
        // 根据生成选项调整
        if (request.GenerateBackend) estimated *= 1.5;
        if (request.GenerateFrontend) estimated *= 1.3;
        if (request.EnableCompilationCheck) estimated *= 1.2;
        
        return Math.Max(estimated, 0.1); // 最少0.1分钟
    }

    /// <summary>
    /// 计算总体进度
    /// </summary>
    private int CalculateOverallProgress(GenerationStage stage, int stageProgress)
    {
        var stageWeights = new Dictionary<GenerationStage, (int Start, int Weight)>
        {
            { GenerationStage.PreProcessing, (0, 10) },
            { GenerationStage.CodeGeneration, (10, 50) },
            { GenerationStage.FileWriting, (60, 20) },
            { GenerationStage.QualityCheck, (80, 15) },
            { GenerationStage.PostProcessing, (95, 5) }
        };

        if (!stageWeights.TryGetValue(stage, out var weight))
        {
            return 0;
        }

        var stageContribution = (stageProgress * weight.Weight) / 100;
        return weight.Start + stageContribution;
    }

    /// <summary>
    /// 记录进度事件
    /// </summary>
    private async Task RecordEventAsync(string generationId, ProgressEventType eventType, string message)
    {
        try
        {
            if (!_eventHistory.TryGetValue(generationId, out var events))
            {
                events = new List<ProgressEvent>();
                _eventHistory[generationId] = events;
            }

            var progressEvent = new ProgressEvent
            {
                EventType = eventType,
                Message = message,
                Timestamp = DateTime.UtcNow
            };

            events.Add(progressEvent);

            // 限制事件历史长度
            if (events.Count > 1000)
            {
                events.RemoveRange(0, events.Count - 1000);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "记录进度事件失败: {GenerationId}", generationId);
        }

        await Task.CompletedTask;
    }

    /// <summary>
    /// 生成性能指标
    /// </summary>
    private GenerationPerformanceMetrics GeneratePerformanceMetrics(GenerationProgress progress)
    {
        return new GenerationPerformanceMetrics
        {
            TotalDurationMinutes = progress.TotalDuration.TotalMinutes,
            FilesPerMinute = progress.FilesPerMinute,
            AverageFileProcessingTimeMs = progress.FilesProcessed > 0 && progress.TotalDuration.TotalMilliseconds > 0
                ? progress.TotalDuration.TotalMilliseconds / progress.FilesProcessed
                : 0,
            MemoryUsageMB = GC.GetTotalMemory(false) / (1024 * 1024), // 简单的内存使用估算
            CpuTimePercentage = 0, // 需要更复杂的实现来获取CPU时间
            ThroughputFilesPerSecond = progress.FilesProcessed > 0 && progress.TotalDuration.TotalSeconds > 0
                ? progress.FilesProcessed / progress.TotalDuration.TotalSeconds
                : 0
        };
    }

    /// <summary>
    /// 清理过期的进度记录
    /// </summary>
    private async Task CleanupOldProgressRecordsAsync()
    {
        try
        {
            if (_progressMap.Count <= 100) return;

            var cutoffTime = DateTime.UtcNow.AddHours(-24); // 保留24小时内的记录
            var expiredKeys = _progressMap
                .Where(kvp => kvp.Value.StartTime < cutoffTime && 
                            kvp.Value.Status != GenerationStatus.Running && 
                            kvp.Value.Status != GenerationStatus.Paused)
                .Select(kvp => kvp.Key)
                .Take(_progressMap.Count - 100) // 保留最近100个
                .ToList();

            foreach (var key in expiredKeys)
            {
                _progressMap.TryRemove(key, out _);
                _eventHistory.TryRemove(key, out _);
            }

            if (expiredKeys.Any())
            {
                _logger.LogDebug("清理了 {Count} 个过期的进度记录", expiredKeys.Count);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "清理过期进度记录失败");
        }

        await Task.CompletedTask;
    }

    #endregion
}

#region 数据传输对象

/// <summary>
/// 生成进度
/// </summary>
public class GenerationProgress
{
    public string GenerationId { get; set; } = string.Empty;
    public string ModuleName { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public DateTime LastUpdated { get; set; }
    public TimeSpan TotalDuration { get; set; }
    public GenerationStatus Status { get; set; }
    
    public GenerationStage CurrentStage { get; set; }
    public int StageProgress { get; set; } // 0-100
    public int OverallProgress { get; set; } // 0-100
    
    public string CurrentFile { get; set; } = string.Empty;
    public int FilesProcessed { get; set; }
    public int TotalFiles { get; set; }
    public int TotalEntities { get; set; }
    
    public double EstimatedDurationMinutes { get; set; }
    public double EstimatedRemainingMinutes { get; set; }
    public double FilesPerMinute { get; set; }
    
    public int ErrorCount { get; set; }
    public int WarningCount { get; set; }
    public int InfoCount { get; set; }
    
    public List<GenerationIssue> Issues { get; set; } = new();
    public StableGenerationResult? FinalResult { get; set; }
    public GenerationPerformanceMetrics? PerformanceMetrics { get; set; }

    public bool IsCompleted => Status == GenerationStatus.Completed || Status == GenerationStatus.Failed;
    public bool IsRunning => Status == GenerationStatus.Running;
    public double CompletionPercentage => OverallProgress;
}

/// <summary>
/// 生成状态
/// </summary>
public enum GenerationStatus
{
    /// <summary>运行中</summary>
    Running,
    /// <summary>暂停</summary>
    Paused,
    /// <summary>已完成</summary>
    Completed,
    /// <summary>失败</summary>
    Failed,
    /// <summary>已取消</summary>
    Cancelled
}

/// <summary>
/// 问题级别
/// </summary>
public enum IssueLevel
{
    Info,
    Warning,
    Error
}

/// <summary>
/// 生成问题
/// </summary>
public class GenerationIssue
{
    public IssueLevel Level { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? Exception { get; set; }
    public DateTime Timestamp { get; set; }
    public GenerationStage Stage { get; set; }
    public string? CurrentFile { get; set; }
}

/// <summary>
/// 进度事件类型
/// </summary>
public enum ProgressEventType
{
    Started,
    StageChanged,
    ProgressMilestone,
    IssueRecorded,
    Completed,
    Failed,
    Cancelled
}

/// <summary>
/// 进度事件
/// </summary>
public class ProgressEvent
{
    public ProgressEventType EventType { get; set; }
    public string Message { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}

/// <summary>
/// 生成统计
/// </summary>
public class GenerationStatistics
{
    public int TotalGenerations { get; set; }
    public int SuccessfulGenerations { get; set; }
    public int FailedGenerations { get; set; }
    public double AverageDurationMinutes { get; set; }
    public int TotalFilesGenerated { get; set; }
    public int TotalErrors { get; set; }
    public int TotalWarnings { get; set; }
    public DateTime FromDate { get; set; }
    public DateTime ToDate { get; set; }

    public double SuccessRate => TotalGenerations > 0 ? (double)SuccessfulGenerations / TotalGenerations * 100 : 0;
}

/// <summary>
/// 生成性能指标
/// </summary>
public class GenerationPerformanceMetrics
{
    public double TotalDurationMinutes { get; set; }
    public double FilesPerMinute { get; set; }
    public double AverageFileProcessingTimeMs { get; set; }
    public long MemoryUsageMB { get; set; }
    public double CpuTimePercentage { get; set; }
    public double ThroughputFilesPerSecond { get; set; }
}

#endregion
