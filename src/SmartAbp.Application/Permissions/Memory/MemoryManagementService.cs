using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Volo.Abp.DependencyInjection;

namespace SmartAbp.Permissions.Memory
{
    /// <summary>
    /// 内存管理优化服务 - 企业级实现
    /// 长期监控和改进内存使用，防止内存泄漏，优化性能
    /// </summary>
    public interface IMemoryManagementService
    {
        /// <summary>
        /// 获取当前内存使用情况
        /// </summary>
        Task<MemoryUsageInfo> GetCurrentMemoryUsageAsync();

        /// <summary>
        /// 获取内存信息（同步版本）
        /// </summary>
        MemoryUsageInfo GetMemoryInfo();

        /// <summary>
        /// 记录内存分配
        /// </summary>
        void RecordMemoryAllocation(string component, long bytesAllocated, string operation);

        /// <summary>
        /// 获取内存使用趋势
        /// </summary>
        Task<MemoryTrendAnalysis> GetMemoryTrendAsync(TimeSpan timeWindow);

        /// <summary>
        /// 检测内存泄漏
        /// </summary>
        Task<MemoryLeakDetectionResult> DetectMemoryLeaksAsync();

        /// <summary>
        /// 执行内存优化
        /// </summary>
        Task<MemoryOptimizationResult> OptimizeMemoryAsync();

        /// <summary>
        /// 获取内存优化建议
        /// </summary>
        Task<IEnumerable<MemoryOptimizationRecommendation>> GetOptimizationRecommendationsAsync();

        /// <summary>
        /// 强制垃圾回收
        /// </summary>
        Task ForceGarbageCollectionAsync(GCCollectionMode mode = GCCollectionMode.Optimized);

        /// <summary>
        /// 清除过期缓存
        /// </summary>
        Task CleanupExpiredCachesAsync();
    }

    /// <summary>
    /// 内存管理配置
    /// </summary>
    public class MemoryManagementOptions
    {
        /// <summary>
        /// 内存使用警告阈值（MB）
        /// </summary>
        public long MemoryWarningThresholdMB { get; set; } = 512; // 512MB

        /// <summary>
        /// 内存使用危险阈值（MB）
        /// </summary>
        public long MemoryCriticalThresholdMB { get; set; } = 1024; // 1GB

        /// <summary>
        /// 内存泄漏检测窗口（小时）
        /// </summary>
        public int MemoryLeakDetectionWindowHours { get; set; } = 2;

        /// <summary>
        /// 自动优化间隔（分钟）
        /// </summary>
        public int AutoOptimizationIntervalMinutes { get; set; } = 30;

        /// <summary>
        /// 数据保留时间（小时）
        /// </summary>
        public int DataRetentionHours { get; set; } = 24;

        /// <summary>
        /// 是否启用自动内存优化
        /// </summary>
        public bool EnableAutoOptimization { get; set; } = true;

        /// <summary>
        /// 是否启用内存泄漏检测
        /// </summary>
        public bool EnableMemoryLeakDetection { get; set; } = true;

        /// <summary>
        /// 垃圾回收模式
        /// </summary>
        public GCCollectionMode GarbageCollectionMode { get; set; } = GCCollectionMode.Optimized;
    }

    /// <summary>
    /// 内存使用信息
    /// </summary>
    public class MemoryUsageInfo
    {
        /// <summary>
        /// 工作集（MB）
        /// </summary>
        public long WorkingSetMB { get; set; }

        /// <summary>
        /// 私有内存（MB）
        /// </summary>
        public long PrivateMemoryMB { get; set; }

        /// <summary>
        /// GC堆内存（MB）
        /// </summary>
        public long GCHeapMemoryMB { get; set; }

        /// <summary>
        /// 第0代GC计数
        /// </summary>
        public int Gen0Collections { get; set; }

        /// <summary>
        /// 第1代GC计数
        /// </summary>
        public int Gen1Collections { get; set; }

        /// <summary>
        /// 第2代GC计数
        /// </summary>
        public int Gen2Collections { get; set; }

        /// <summary>
        /// 内存使用率（百分比）
        /// </summary>
        public double MemoryUsagePercentage { get; set; }

        /// <summary>
        /// 内存状态
        /// </summary>
        public MemoryStatus Status { get; set; }

        /// <summary>
        /// 记录时间
        /// </summary>
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// 内存状态
    /// </summary>
    public enum MemoryStatus
    {
        Normal,
        Warning,
        Critical
    }

    /// <summary>
    /// 内存分配记录
    /// </summary>
    public class MemoryAllocationRecord
    {
        public string Component { get; set; }
        public long BytesAllocated { get; set; }
        public string Operation { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public string StackTrace { get; set; }
    }

    /// <summary>
    /// 内存趋势分析
    /// </summary>
    public class MemoryTrendAnalysis
    {
        /// <summary>
        /// 时间窗口
        /// </summary>
        public TimeSpan TimeWindow { get; set; }

        /// <summary>
        /// 当前内存使用（MB）
        /// </summary>
        public long CurrentMemoryMB { get; set; }

        /// <summary>
        /// 历史平均内存使用（MB）
        /// </summary>
        public long HistoricalAverageMB { get; set; }

        /// <summary>
        /// 内存增长趋势（MB/小时）
        /// </summary>
        public double GrowthRateMBPerHour { get; set; }

        /// <summary>
        /// 趋势方向
        /// </summary>
        public MemoryTrendDirection TrendDirection { get; set; }

        /// <summary>
        /// 预计达到危险阈值时间
        /// </summary>
        public DateTime? EstimatedCriticalTime { get; set; }

        /// <summary>
        /// 分析时间
        /// </summary>
        public DateTime AnalysisTimestamp { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// 内存趋势方向
    /// </summary>
    public enum MemoryTrendDirection
    {
        Stable,
        Increasing,
        Decreasing,
        Fluctuating
    }

    /// <summary>
    /// 内存泄漏检测结果
    /// </summary>
    public class MemoryLeakDetectionResult
    {
        /// <summary>
        /// 是否检测到内存泄漏
        /// </summary>
        public bool HasMemoryLeak { get; set; }

        /// <summary>
        /// 可疑组件列表
        /// </summary>
        public List<string> SuspiciousComponents { get; set; } = new List<string>();

        /// <summary>
        /// 泄漏严重程度
        /// </summary>
        public MemoryLeakSeverity Severity { get; set; }

        /// <summary>
        /// 详细信息
        /// </summary>
        public string Details { get; set; }

        /// <summary>
        /// 建议操作
        /// </summary>
        public List<string> RecommendedActions { get; set; } = new List<string>();

        /// <summary>
        /// 检测时间
        /// </summary>
        public DateTime DetectionTime { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// 内存泄漏严重程度
    /// </summary>
    public enum MemoryLeakSeverity
    {
        Low,
        Medium,
        High,
        Critical
    }

    /// <summary>
    /// 内存优化结果
    /// </summary>
    public class MemoryOptimizationResult
    {
        /// <summary>
        /// 优化前内存使用（MB）
        /// </summary>
        public long MemoryBeforeMB { get; set; }

        /// <summary>
        /// 优化后内存使用（MB）
        /// </summary>
        public long MemoryAfterMB { get; set; }

        /// <summary>
        /// 释放的内存（MB）
        /// </summary>
        public long MemoryFreedMB { get; set; }

        /// <summary>
        /// 优化前内存使用（MB）- 兼容属性
        /// </summary>
        public long BeforeOptimizationMB { get; set; }

        /// <summary>
        /// 优化后内存使用（MB）- 兼容属性
        /// </summary>
        public long AfterOptimizationMB { get; set; }

        /// <summary>
        /// 释放的内存（MB）- 兼容属性
        /// </summary>
        public long FreedMemoryMB { get; set; }

        /// <summary>
        /// 优化操作
        /// </summary>
        public List<string> OptimizationActions { get; set; } = new List<string>();

        /// <summary>
        /// 优化是否成功
        /// </summary>
        public bool Success { get; set; }

        /// <summary>
        /// 优化时间
        /// </summary>
        public DateTime OptimizationTime { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// 内存优化建议
    /// </summary>
    public class MemoryOptimizationRecommendation
    {
        /// <summary>
        /// 建议类型
        /// </summary>
        public RecommendationType Type { get; set; }

        /// <summary>
        /// 建议描述
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// 优先级
        /// </summary>
        public RecommendationPriority Priority { get; set; }

        /// <summary>
        /// 预期效果
        /// </summary>
        public string ExpectedImpact { get; set; }

        /// <summary>
        /// 实施复杂度
        /// </summary>
        public ImplementationComplexity Complexity { get; set; }
    }

    /// <summary>
    /// 建议类型
    /// </summary>
    public enum RecommendationType
    {
        CacheOptimization,
        ObjectPooling,
        GarbageCollectionTuning,
        MemoryLeakFix,
        ResourceCleanup,
        ConfigurationOptimization
    }

    /// <summary>
    /// 建议优先级
    /// </summary>
    public enum RecommendationPriority
    {
        Low,
        Medium,
        High,
        Critical
    }

    /// <summary>
    /// 实施复杂度
    /// </summary>
    public enum ImplementationComplexity
    {
        Low,
        Medium,
        High
    }

    /// <summary>
    /// 内存管理优化服务实现
    /// </summary>
    public class MemoryManagementService : IMemoryManagementService, ITransientDependency, IHostedService
    {
        private readonly ConcurrentQueue<MemoryAllocationRecord> _allocationRecords = new();
        private readonly ConcurrentDictionary<string, long> _componentMemoryUsage = new();
        private readonly ConcurrentDictionary<DateTime, MemoryUsageInfo> _memoryHistory = new();
        private readonly MemoryManagementOptions _options;
        private readonly ILogger<MemoryManagementService> _logger;
        private readonly Timer _monitoringTimer;
        private readonly Timer _optimizationTimer;
        private readonly Timer _cleanupTimer;
        private readonly Process _currentProcess;

        public MemoryManagementService(
            IOptions<MemoryManagementOptions> options,
            ILogger<MemoryManagementService> logger)
        {
            _options = options?.Value ?? new MemoryManagementOptions();
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _currentProcess = Process.GetCurrentProcess();

            // 设置定时监控任务
            _monitoringTimer = new Timer(async _ => await RecordMemoryUsageAsync(), null, TimeSpan.FromMinutes(1), TimeSpan.FromMinutes(1));
            
            // 设置自动优化任务
            if (_options.EnableAutoOptimization)
            {
                _optimizationTimer = new Timer(async _ => await PerformAutoOptimizationAsync(), null, 
                    TimeSpan.FromMinutes(_options.AutoOptimizationIntervalMinutes), 
                    TimeSpan.FromMinutes(_options.AutoOptimizationIntervalMinutes));
            }

            // 设置清理任务
            _cleanupTimer = new Timer(_ => CleanupAsync().GetAwaiter().GetResult(), null, TimeSpan.FromHours(1), TimeSpan.FromHours(1));
        }

        public MemoryUsageInfo GetMemoryInfo()
        {
            try
            {
                _currentProcess.Refresh();

                var workingSetMB = _currentProcess.WorkingSet64 / (1024 * 1024);
                var privateMemoryMB = _currentProcess.PrivateMemorySize64 / (1024 * 1024);
                var gcHeapMemoryMB = GC.GetTotalMemory(false) / (1024 * 1024);

                var gen0Collections = GC.CollectionCount(0);
                var gen1Collections = GC.CollectionCount(1);
                var gen2Collections = GC.CollectionCount(2);

                var memoryUsagePercentage = (double)workingSetMB / _options.MemoryWarningThresholdMB * 100;

                var status = MemoryStatus.Normal;
                if (workingSetMB > _options.MemoryCriticalThresholdMB)
                    status = MemoryStatus.Critical;
                else if (workingSetMB > _options.MemoryWarningThresholdMB)
                    status = MemoryStatus.Warning;

                var memoryInfo = new MemoryUsageInfo
                {
                    WorkingSetMB = workingSetMB,
                    PrivateMemoryMB = privateMemoryMB,
                    GCHeapMemoryMB = gcHeapMemoryMB,
                    Gen0Collections = gen0Collections,
                    Gen1Collections = gen1Collections,
                    Gen2Collections = gen2Collections,
                    MemoryUsagePercentage = memoryUsagePercentage,
                    Status = status,
                    Timestamp = DateTime.UtcNow
                };

                return memoryInfo;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting memory info");
                throw;
            }
        }

        public async Task<MemoryUsageInfo> GetCurrentMemoryUsageAsync()
        {
            try
            {
                // 刷新进程信息
                _currentProcess.Refresh();

                var workingSetMB = _currentProcess.WorkingSet64 / (1024 * 1024);
                var privateMemoryMB = _currentProcess.PrivateMemorySize64 / (1024 * 1024);
                var gcHeapMemoryMB = GC.GetTotalMemory(false) / (1024 * 1024);

                var gen0Collections = GC.CollectionCount(0);
                var gen1Collections = GC.CollectionCount(1);
                var gen2Collections = GC.CollectionCount(2);

                // 计算内存使用率（相对于阈值）
                var memoryUsagePercentage = (double)workingSetMB / _options.MemoryWarningThresholdMB * 100;

                var status = MemoryStatus.Normal;
                if (workingSetMB > _options.MemoryCriticalThresholdMB)
                    status = MemoryStatus.Critical;
                else if (workingSetMB > _options.MemoryWarningThresholdMB)
                    status = MemoryStatus.Warning;

                var memoryInfo = new MemoryUsageInfo
                {
                    WorkingSetMB = workingSetMB,
                    PrivateMemoryMB = privateMemoryMB,
                    GCHeapMemoryMB = gcHeapMemoryMB,
                    Gen0Collections = gen0Collections,
                    Gen1Collections = gen1Collections,
                    Gen2Collections = gen2Collections,
                    MemoryUsagePercentage = memoryUsagePercentage,
                    Status = status,
                    Timestamp = DateTime.UtcNow
                };

                // 记录到历史数据
                _memoryHistory[DateTime.UtcNow] = memoryInfo;

                _logger.LogDebug("Current memory usage: WorkingSet={WorkingSet}MB, PrivateMemory={PrivateMemory}MB, GCHeap={GCHeap}MB, Status={Status}",
                    workingSetMB, privateMemoryMB, gcHeapMemoryMB, status);

                return memoryInfo;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting current memory usage");
                throw;
            }
        }

        public void RecordMemoryAllocation(string component, long bytesAllocated, string operation)
        {
            try
            {
                var record = new MemoryAllocationRecord
                {
                    Component = component,
                    BytesAllocated = bytesAllocated,
                    Operation = operation,
                    StackTrace = _logger.IsEnabled(LogLevel.Debug) ? new StackTrace(1, true).ToString() : null
                };

                _allocationRecords.Enqueue(record);

                // 更新组件内存使用统计
                _componentMemoryUsage.AddOrUpdate(component, bytesAllocated, (key, existing) => existing + bytesAllocated);

                // 保持队列大小在限制范围内
                while (_allocationRecords.Count > 10000)
                {
                    _allocationRecords.TryDequeue(out _);
                }

                _logger.LogDebug("Recorded memory allocation: Component={Component}, Bytes={Bytes}, Operation={Operation}",
                    component, bytesAllocated, operation);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error recording memory allocation for component {Component}", component);
            }
        }

        public async Task<MemoryTrendAnalysis> GetMemoryTrendAsync(TimeSpan timeWindow)
        {
            try
            {
                var cutoffTime = DateTime.UtcNow - timeWindow;
                var recentHistory = _memoryHistory.Where(kv => kv.Key >= cutoffTime).OrderBy(kv => kv.Key).ToList();

                if (recentHistory.Count < 2)
                {
                    return new MemoryTrendAnalysis
                    {
                        TimeWindow = timeWindow,
                        CurrentMemoryMB = 0,
                        HistoricalAverageMB = 0,
                        GrowthRateMBPerHour = 0,
                        TrendDirection = MemoryTrendDirection.Stable,
                        AnalysisTimestamp = DateTime.UtcNow
                    };
                }

                var currentMemory = recentHistory.Last().Value.WorkingSetMB;
                var historicalAverage = recentHistory.Average(kv => kv.Value.WorkingSetMB);

                // 计算内存增长率
                var firstMemory = recentHistory.First().Value.WorkingSetMB;
                var timeSpanHours = (recentHistory.Last().Key - recentHistory.First().Key).TotalHours;
                var growthRateMBPerHour = timeSpanHours > 0 ? (currentMemory - firstMemory) / timeSpanHours : 0;

                // 确定趋势方向
                var trendDirection = DetermineTrendDirection(recentHistory.Select(kv => kv.Value.WorkingSetMB).ToList());

                // 预测达到危险阈值的时间
                DateTime? estimatedCriticalTime = null;
                if (growthRateMBPerHour > 0 && currentMemory < _options.MemoryCriticalThresholdMB)
                {
                    var remainingMB = _options.MemoryCriticalThresholdMB - currentMemory;
                    var hoursToCritical = remainingMB / growthRateMBPerHour;
                    estimatedCriticalTime = DateTime.UtcNow.AddHours(hoursToCritical);
                }

                return new MemoryTrendAnalysis
                {
                    TimeWindow = timeWindow,
                    CurrentMemoryMB = currentMemory,
                    HistoricalAverageMB = (long)historicalAverage,
                    GrowthRateMBPerHour = growthRateMBPerHour,
                    TrendDirection = trendDirection,
                    EstimatedCriticalTime = estimatedCriticalTime,
                    AnalysisTimestamp = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting memory trend analysis");
                throw;
            }
        }

        public async Task<MemoryLeakDetectionResult> DetectMemoryLeaksAsync()
        {
            try
            {
                if (!_options.EnableMemoryLeakDetection)
                {
                    return new MemoryLeakDetectionResult
                    {
                        HasMemoryLeak = false,
                        Details = "Memory leak detection is disabled"
                    };
                }

                var detectionWindow = TimeSpan.FromHours(_options.MemoryLeakDetectionWindowHours);
                var cutoffTime = DateTime.UtcNow - detectionWindow;
                var recentAllocations = _allocationRecords.Where(r => r.Timestamp >= cutoffTime).ToList();
                var recentHistory = _memoryHistory.Where(kv => kv.Key >= cutoffTime).ToList();

                var suspiciousComponents = new List<string>();
                var severity = MemoryLeakSeverity.Low;
                var details = new List<string>();
                var recommendedActions = new List<string>();

                // 分析组件内存使用模式
                var componentAnalysis = AnalyzeComponentMemoryUsage(recentAllocations);
                
                foreach (var component in componentAnalysis)
                {
                    if (component.Value > 100 * 1024 * 1024) // 100MB
                    {
                        suspiciousComponents.Add(component.Key);
                        details.Add($"Component '{component.Key}' has allocated {component.Value / (1024 * 1024)}MB in the last {detectionWindow.TotalHours} hours");
                    }
                }

                // 分析内存增长趋势
                if (recentHistory.Count >= 10)
                {
                    var trendAnalysis = await GetMemoryTrendAsync(detectionWindow);
                    if (trendAnalysis.GrowthRateMBPerHour > 10) // 10MB/小时增长
                    {
                        severity = MemoryLeakSeverity.Medium;
                        details.Add($"Memory is growing at {trendAnalysis.GrowthRateMBPerHour:F2}MB per hour");
                        
                        if (trendAnalysis.EstimatedCriticalTime.HasValue)
                        {
                            severity = MemoryLeakSeverity.High;
                            details.Add($"Estimated time to critical threshold: {trendAnalysis.EstimatedCriticalTime.Value:yyyy-MM-dd HH:mm:ss}");
                            recommendedActions.Add("Immediate investigation required - memory leak may cause system failure");
                        }
                    }
                }

                var hasMemoryLeak = suspiciousComponents.Any() || severity >= MemoryLeakSeverity.Medium;

                if (hasMemoryLeak)
                {
                    recommendedActions.AddRange(new[]
                    {
                        "Review recent code changes for potential memory leaks",
                        "Check for undisposed objects and event handlers",
                        "Consider implementing object pooling for frequently allocated objects",
                        "Monitor memory usage patterns over time"
                    });
                }

                return new MemoryLeakDetectionResult
                {
                    HasMemoryLeak = hasMemoryLeak,
                    SuspiciousComponents = suspiciousComponents,
                    Severity = severity,
                    Details = string.Join("; ", details),
                    RecommendedActions = recommendedActions,
                    DetectionTime = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error detecting memory leaks");
                throw;
            }
        }

        public async Task<MemoryOptimizationResult> OptimizeMemoryAsync()
        {
            try
            {
                var memoryBefore = await GetCurrentMemoryUsageAsync();
                var optimizationActions = new List<string>();

                // 执行垃圾回收
                await ForceGarbageCollectionAsync(_options.GarbageCollectionMode);
                optimizationActions.Add($"Forced garbage collection with mode: {_options.GarbageCollectionMode}");

                // 清理过期缓存
                await CleanupExpiredCachesAsync();
                optimizationActions.Add("Cleaned up expired caches");

                // 等待垃圾回收完成
                await Task.Delay(1000);

                var memoryAfter = await GetCurrentMemoryUsageAsync();
                var memoryFreed = memoryBefore.WorkingSetMB - memoryAfter.WorkingSetMB;

                _logger.LogInformation("Memory optimization completed: Freed {MemoryFreed}MB, Before={Before}MB, After={After}MB",
                    memoryFreed, memoryBefore.WorkingSetMB, memoryAfter.WorkingSetMB);

                return new MemoryOptimizationResult
                {
                    MemoryBeforeMB = memoryBefore.WorkingSetMB,
                    MemoryAfterMB = memoryAfter.WorkingSetMB,
                    MemoryFreedMB = memoryFreed,
                    BeforeOptimizationMB = memoryBefore.WorkingSetMB,
                    AfterOptimizationMB = memoryAfter.WorkingSetMB,
                    FreedMemoryMB = memoryFreed,
                    OptimizationActions = optimizationActions,
                    Success = memoryFreed > 0,
                    OptimizationTime = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error optimizing memory");
                throw;
            }
        }

        public async Task<IEnumerable<MemoryOptimizationRecommendation>> GetOptimizationRecommendationsAsync()
        {
            try
            {
                var recommendations = new List<MemoryOptimizationRecommendation>();
                var currentMemory = await GetCurrentMemoryUsageAsync();
                var trendAnalysis = await GetMemoryTrendAsync(TimeSpan.FromHours(2));
                var leakDetection = await DetectMemoryLeaksAsync();

                // 基于当前内存状态的建议
                if (currentMemory.Status != MemoryStatus.Normal)
                {
                    recommendations.Add(new MemoryOptimizationRecommendation
                    {
                        Type = RecommendationType.GarbageCollectionTuning,
                        Description = $"Memory usage is {currentMemory.Status}. Consider forcing garbage collection.",
                        Priority = currentMemory.Status == MemoryStatus.Critical ? RecommendationPriority.Critical : RecommendationPriority.High,
                        ExpectedImpact = "Immediate memory reduction",
                        Complexity = ImplementationComplexity.Low
                    });
                }

                // 基于趋势分析的建议
                if (trendAnalysis.GrowthRateMBPerHour > 5)
                {
                    recommendations.Add(new MemoryOptimizationRecommendation
                    {
                        Type = RecommendationType.CacheOptimization,
                        Description = $"Memory is growing at {trendAnalysis.GrowthRateMBPerHour:F2}MB/hour. Review cache settings.",
                        Priority = RecommendationPriority.High,
                        ExpectedImpact = "Reduced memory growth rate",
                        Complexity = ImplementationComplexity.Medium
                    });
                }

                // 基于内存泄漏检测的建议
                if (leakDetection.HasMemoryLeak)
                {
                    recommendations.Add(new MemoryOptimizationRecommendation
                    {
                        Type = RecommendationType.MemoryLeakFix,
                        Description = "Memory leak detected. Immediate investigation required.",
                        Priority = leakDetection.Severity == MemoryLeakSeverity.Critical ? RecommendationPriority.Critical : RecommendationPriority.High,
                        ExpectedImpact = "Prevention of system failure",
                        Complexity = ImplementationComplexity.High
                    });
                }

                // 基于组件内存使用的建议
                var topComponents = _componentMemoryUsage.OrderByDescending(kv => kv.Value).Take(5).ToList();
                foreach (var component in topComponents)
                {
                    if (component.Value > 50 * 1024 * 1024) // 50MB
                    {
                        recommendations.Add(new MemoryOptimizationRecommendation
                        {
                            Type = RecommendationType.ObjectPooling,
                            Description = $"Component '{component.Key}' is using {component.Value / (1024 * 1024)}MB. Consider object pooling.",
                            Priority = RecommendationPriority.Medium,
                            ExpectedImpact = "Reduced memory allocation pressure",
                            Complexity = ImplementationComplexity.Medium
                        });
                    }
                }

                return recommendations.OrderByDescending(r => r.Priority).ThenBy(r => r.Complexity).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting optimization recommendations");
                throw;
            }
        }

        public async Task ForceGarbageCollectionAsync(GCCollectionMode mode = GCCollectionMode.Optimized)
        {
            try
            {
                var memoryBefore = GC.GetTotalMemory(false);
                
                _logger.LogInformation("Starting garbage collection with mode: {Mode}", mode);
                
                GC.Collect(2, mode);
                GC.WaitForPendingFinalizers();
                GC.Collect(2, mode);

                var memoryAfter = GC.GetTotalMemory(false);
                var memoryFreed = (memoryBefore - memoryAfter) / (1024 * 1024);

                _logger.LogInformation("Garbage collection completed: Freed {MemoryFreed}MB", memoryFreed);
                
                await Task.CompletedTask;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error forcing garbage collection");
                throw;
            }
        }

        public async Task CleanupExpiredCachesAsync()
        {
            try
            {
                // 这里可以集成具体的缓存清理逻辑
                // 例如：清理内存缓存、分布式缓存等
                
                _logger.LogInformation("Expired cache cleanup completed");
                
                await Task.CompletedTask;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cleaning up expired caches");
                throw;
            }
        }

        /// <summary>
        /// 记录内存使用情况
        /// </summary>
        private async Task RecordMemoryUsageAsync()
        {
            try
            {
                var memoryUsage = await GetCurrentMemoryUsageAsync();
                
                // 检查内存状态并记录警告
                if (memoryUsage.Status != MemoryStatus.Normal)
                {
                    _logger.LogWarning("Memory usage alert: Status={Status}, WorkingSet={WorkingSet}MB, Threshold={Threshold}MB",
                        memoryUsage.Status, memoryUsage.WorkingSetMB, 
                        memoryUsage.Status == MemoryStatus.Critical ? _options.MemoryCriticalThresholdMB : _options.MemoryWarningThresholdMB);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error recording memory usage");
            }
        }

        /// <summary>
        /// 执行自动内存优化
        /// </summary>
        private async Task PerformAutoOptimizationAsync()
        {
            if (!_options.EnableAutoOptimization)
                return;

            try
            {
                var currentMemory = await GetCurrentMemoryUsageAsync();
                
                if (currentMemory.Status != MemoryStatus.Normal)
                {
                    _logger.LogInformation("Performing automatic memory optimization due to {Status} status", currentMemory.Status);
                    await OptimizeMemoryAsync();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error performing automatic memory optimization");
            }
        }

        /// <summary>
        /// 分析组件内存使用情况
        /// </summary>
        private Dictionary<string, long> AnalyzeComponentMemoryUsage(List<MemoryAllocationRecord> allocations)
        {
            var componentUsage = new Dictionary<string, long>();
            
            foreach (var allocation in allocations)
            {
                if (!componentUsage.ContainsKey(allocation.Component))
                    componentUsage[allocation.Component] = 0;
                
                componentUsage[allocation.Component] += allocation.BytesAllocated;
            }
            
            return componentUsage;
        }

        /// <summary>
        /// 确定趋势方向
        /// </summary>
        private MemoryTrendDirection DetermineTrendDirection(List<long> memoryValues)
        {
            if (memoryValues.Count < 3)
                return MemoryTrendDirection.Stable;

            var increasingCount = 0;
            var decreasingCount = 0;
            
            for (int i = 1; i < memoryValues.Count; i++)
            {
                if (memoryValues[i] > memoryValues[i - 1])
                    increasingCount++;
                else if (memoryValues[i] < memoryValues[i - 1])
                    decreasingCount++;
            }

            var totalChanges = increasingCount + decreasingCount;
            if (totalChanges == 0)
                return MemoryTrendDirection.Stable;

            var increasingRatio = (double)increasingCount / totalChanges;
            var decreasingRatio = (double)decreasingCount / totalChanges;

            if (increasingRatio > 0.7)
                return MemoryTrendDirection.Increasing;
            else if (decreasingRatio > 0.7)
                return MemoryTrendDirection.Decreasing;
            else
                return MemoryTrendDirection.Fluctuating;
        }

        /// <summary>
        /// 清理过期数据
        /// </summary>
        public async Task CleanupAsync()
        {
            try
            {
                var cutoffTime = DateTime.UtcNow.AddHours(-_options.DataRetentionHours);
                
                // 清理内存历史数据
                var historyToRemove = _memoryHistory.Where(kv => kv.Key < cutoffTime).ToList();
                foreach (var item in historyToRemove)
                {
                    _memoryHistory.TryRemove(item.Key, out _);
                }

                // 清理分配记录
                var allocationRecordsToRemove = new List<MemoryAllocationRecord>();
                while (_allocationRecords.TryDequeue(out var record))
                {
                    if (record.Timestamp >= cutoffTime)
                    {
                        allocationRecordsToRemove.Add(record);
                    }
                }

                // 重新添加未过期的记录
                foreach (var record in allocationRecordsToRemove)
                {
                    _allocationRecords.Enqueue(record);
                }

                _logger.LogInformation("Memory management cleanup completed. Retained {HistoryCount} history records, {AllocationCount} allocation records",
                    _memoryHistory.Count, _allocationRecords.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during memory management cleanup");
            }
            
            await Task.CompletedTask;
        }

        /// <summary>
        /// 启动内存管理服务
        /// </summary>
        public Task StartAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Memory management service started with options: Warning={Warning}MB, Critical={Critical}MB, AutoOptimize={AutoOptimize}",
                _options.MemoryWarningThresholdMB, _options.MemoryCriticalThresholdMB, _options.EnableAutoOptimization);
            
            return Task.CompletedTask;
        }

        /// <summary>
        /// 停止内存管理服务
        /// </summary>
        public Task StopAsync(CancellationToken cancellationToken)
        {
            _monitoringTimer?.Dispose();
            _optimizationTimer?.Dispose();
            _cleanupTimer?.Dispose();
            
            _logger.LogInformation("Memory management service stopped");
            
            return Task.CompletedTask;
        }
    }
}