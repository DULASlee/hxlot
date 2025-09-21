using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.Permissions.Models;

namespace SmartAbp.Permissions.Performance
{
    /// <summary>
    /// 权限性能监控服务 - 企业级实现
    /// 实时监控权限检查性能，支持2025年业界领先标准
    /// </summary>
    public class PermissionPerformanceMonitor : IPermissionPerformanceMonitor
    {
        private readonly ILogger<PermissionPerformanceMonitor> _logger;
        private readonly ConcurrentDictionary<string, PerformanceMetric> _metrics;
        private readonly ConcurrentQueue<ResponseTimeRecord> _responseTimeQueue;
        private readonly object _lockObject = new object();
        
        private const int MAX_RESPONSE_TIME_RECORDS = 10000;
        private const double CACHE_HIT_RATE_THRESHOLD = 0.98; // 98%缓存命中率
        private const double RESPONSE_TIME_THRESHOLD_MS = 1.0; // 1ms响应时间阈值

        public PermissionPerformanceMonitor(ILogger<PermissionPerformanceMonitor> logger)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _metrics = new ConcurrentDictionary<string, PerformanceMetric>();
            _responseTimeQueue = new ConcurrentQueue<ResponseTimeRecord>();
        }

        /// <summary>
        /// 记录权限检查操作
        /// </summary>
        public void RecordPermissionCheck(string operationId, string userId, string tenantId, 
            bool isCacheHit, long responseTimeMs, bool isSuccess)
        {
            if (string.IsNullOrEmpty(operationId))
                throw new ArgumentException("Operation ID cannot be null or empty", nameof(operationId));
            
            if (string.IsNullOrEmpty(userId))
                throw new ArgumentException("User ID cannot be null or empty", nameof(userId));

            try
            {
                var metric = _metrics.GetOrAdd(operationId, _ => new PerformanceMetric
                {
                    OperationId = operationId,
                    UserId = userId,
                    TenantId = tenantId,
                    StartTime = DateTime.UtcNow
                });

                lock (_lockObject)
                {
                    metric.TotalRequests++;
                    
                    if (isCacheHit)
                        metric.CacheHitCount++;
                    
                    if (isSuccess)
                        metric.SuccessCount++;
                    else
                        metric.ErrorCount++;

                    metric.TotalResponseTimeMs += responseTimeMs;
                    metric.LastUpdated = DateTime.UtcNow;

                    // 记录响应时间用于P99计算
                    var record = new ResponseTimeRecord
                    {
                        OperationId = operationId,
                        ResponseTimeMs = responseTimeMs,
                        Timestamp = DateTime.UtcNow
                    };

                    _responseTimeQueue.Enqueue(record);

                    // 保持队列大小在限制范围内
                    while (_responseTimeQueue.Count > MAX_RESPONSE_TIME_RECORDS)
                    {
                        _responseTimeQueue.TryDequeue(out _);
                    }
                }

                // 检查性能阈值并记录警告
                CheckPerformanceThresholds(operationId, isCacheHit, responseTimeMs, isSuccess);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error recording permission check for operation {OperationId}", operationId);
            }
        }

        /// <summary>
        /// 获取当前性能指标
        /// </summary>
        public PermissionPerformanceMetrics GetCurrentMetrics()
        {
            try
            {
                var allMetrics = _metrics.Values.ToList();
                
                if (!allMetrics.Any())
                {
                    return new PermissionPerformanceMetrics
                    {
                        CacheHitCount = 0,
                        CacheMissCount = 0,
                        AverageResponseTimeMs = 0,
                        P99ResponseTimeMs = 0,
                        TotalRequests = 0,
                        LastUpdated = DateTime.UtcNow
                    };
                }

                var totalRequests = allMetrics.Sum(m => m.TotalRequests);
                var totalCacheHits = allMetrics.Sum(m => m.CacheHitCount);
                var totalResponseTime = allMetrics.Sum(m => m.TotalResponseTimeMs);
                var allResponseTimes = _responseTimeQueue.Select(r => r.ResponseTimeMs).ToList();

                var p99ResponseTime = CalculateP99ResponseTime(allResponseTimes);
                var averageResponseTime = totalRequests > 0 ? totalResponseTime / (double)totalRequests : 0;

                return new PermissionPerformanceMetrics
                {
                    CacheHitCount = totalCacheHits,
                    CacheMissCount = totalRequests - totalCacheHits,
                    AverageResponseTimeMs = averageResponseTime,
                    P99ResponseTimeMs = p99ResponseTime,
                    TotalRequests = totalRequests,
                    LastUpdated = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting current performance metrics");
                throw;
            }
        }

        /// <summary>
        /// 获取性能趋势分析
        /// </summary>
        public PerformanceTrendAnalysis GetPerformanceTrend(TimeSpan timeWindow)
        {
            try
            {
                var cutoffTime = DateTime.UtcNow - timeWindow;
                var recentRecords = _responseTimeQueue.Where(r => r.Timestamp >= cutoffTime).ToList();
                var recentMetrics = _metrics.Values.Where(m => m.StartTime >= cutoffTime).ToList();

                if (!recentRecords.Any() || !recentMetrics.Any())
                {
                    return new PerformanceTrendAnalysis
                    {
                        TimeWindow = timeWindow,
                        TrendDirection = PerformanceTrend.Stable,
                        CacheHitRateTrend = PerformanceTrend.Stable,
                        ResponseTimeTrend = PerformanceTrend.Stable,
                        ErrorRateTrend = PerformanceTrend.Stable,
                        AnalysisTimestamp = DateTime.UtcNow
                    };
                }

                var currentMetrics = GetCurrentMetrics();
                var historicalMetrics = CalculateHistoricalMetrics(recentMetrics, cutoffTime);

                var trendAnalysis = new PerformanceTrendAnalysis
                {
                    TimeWindow = timeWindow,
                    CurrentCacheHitRate = currentMetrics.CacheHitRate,
                    CurrentAverageResponseTime = currentMetrics.AverageResponseTimeMs,
                    CurrentErrorRate = recentMetrics.Any() ? recentMetrics.Sum(m => m.ErrorCount) / (double)recentMetrics.Sum(m => m.TotalRequests) : 0,
                    HistoricalCacheHitRate = historicalMetrics.CacheHitRate,
                    HistoricalAverageResponseTime = historicalMetrics.AverageResponseTimeMs,
                    HistoricalErrorRate = historicalMetrics.ErrorRate,
                    AnalysisTimestamp = DateTime.UtcNow
                };

                // 计算趋势方向
                trendAnalysis.TrendDirection = CalculateOverallTrend(trendAnalysis);
                trendAnalysis.CacheHitRateTrend = CalculateCacheHitRateTrend(trendAnalysis);
                trendAnalysis.ResponseTimeTrend = CalculateResponseTimeTrend(trendAnalysis);
                trendAnalysis.ErrorRateTrend = CalculateErrorRateTrend(trendAnalysis);

                return trendAnalysis;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting performance trend analysis");
                throw;
            }
        }

        /// <summary>
        /// 识别性能瓶颈
        /// </summary>
        public List<PerformanceBottleneck> IdentifyBottlenecks()
        {
            var bottlenecks = new List<PerformanceBottleneck>();
            var currentMetrics = GetCurrentMetrics();

            try
            {
                // 检查缓存命中率
                if (currentMetrics.CacheHitRate < CACHE_HIT_RATE_THRESHOLD)
                {
                    bottlenecks.Add(new PerformanceBottleneck
                    {
                        Type = BottleneckType.CacheHitRate,
                        Severity = CalculateSeverity(currentMetrics.CacheHitRate, CACHE_HIT_RATE_THRESHOLD),
                        Description = $"Cache hit rate {currentMetrics.CacheHitRate:P2} is below threshold {CACHE_HIT_RATE_THRESHOLD:P2}",
                        Recommendation = "Consider increasing cache size or optimizing cache key strategy",
                        ImpactLevel = ImpactLevel.High,
                        DetectedAt = DateTime.UtcNow
                    });
                }

                // 检查响应时间
                if (currentMetrics.AverageResponseTimeMs > RESPONSE_TIME_THRESHOLD_MS)
                {
                    bottlenecks.Add(new PerformanceBottleneck
                    {
                        Type = BottleneckType.ResponseTime,
                        Severity = CalculateSeverity(RESPONSE_TIME_THRESHOLD_MS, currentMetrics.AverageResponseTimeMs),
                        Description = $"Average response time {currentMetrics.AverageResponseTimeMs}ms exceeds threshold {RESPONSE_TIME_THRESHOLD_MS}ms",
                        Recommendation = "Consider optimizing database queries or cache implementation",
                        ImpactLevel = ImpactLevel.High,
                        DetectedAt = DateTime.UtcNow
                    });
                }

                // 检查P99响应时间
                if (currentMetrics.P99ResponseTimeMs > RESPONSE_TIME_THRESHOLD_MS * 2)
                {
                    bottlenecks.Add(new PerformanceBottleneck
                    {
                        Type = BottleneckType.P99ResponseTime,
                        Severity = CalculateSeverity(RESPONSE_TIME_THRESHOLD_MS * 2, currentMetrics.P99ResponseTimeMs),
                        Description = $"P99 response time {currentMetrics.P99ResponseTimeMs}ms indicates performance outliers",
                        Recommendation = "Investigate slow requests and optimize critical paths",
                        ImpactLevel = ImpactLevel.Medium,
                        DetectedAt = DateTime.UtcNow
                    });
                }

                return bottlenecks;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error identifying performance bottlenecks");
                return bottlenecks;
            }
        }

        /// <summary>
        /// 重置性能指标
        /// </summary>
        public void ResetMetrics()
        {
            try
            {
                lock (_lockObject)
                {
                    _metrics.Clear();
                    _responseTimeQueue.Clear();
                }

                _logger.LogInformation("Performance metrics have been reset");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resetting performance metrics");
                throw;
            }
        }

        #region Private Methods

        private void CheckPerformanceThresholds(string operationId, bool isCacheHit, long responseTimeMs, bool isSuccess)
        {
            if (!isSuccess)
            {
                _logger.LogWarning("Permission check failed for operation {OperationId}", operationId);
                return;
            }

            if (!isCacheHit && responseTimeMs > RESPONSE_TIME_THRESHOLD_MS)
            {
                _logger.LogWarning(
                    "Cache miss with slow response for operation {OperationId}: {ResponseTime}ms (threshold: {Threshold}ms)",
                    operationId, responseTimeMs, RESPONSE_TIME_THRESHOLD_MS);
            }

            if (isCacheHit && responseTimeMs > RESPONSE_TIME_THRESHOLD_MS / 2)
            {
                _logger.LogWarning(
                    "Cache hit with slow response for operation {OperationId}: {ResponseTime}ms (threshold: {Threshold}ms)",
                    operationId, responseTimeMs, RESPONSE_TIME_THRESHOLD_MS / 2);
            }
        }

        private double CalculateP99ResponseTime(List<long> responseTimes)
        {
            if (!responseTimes.Any()) return 0;

            var sortedTimes = responseTimes.OrderBy(t => t).ToList();
            var p99Index = (int)Math.Ceiling(sortedTimes.Count * 0.99) - 1;
            return sortedTimes[Math.Max(0, p99Index)];
        }

        private HistoricalMetrics CalculateHistoricalMetrics(List<PerformanceMetric> recentMetrics, DateTime cutoffTime)
        {
            var totalRequests = recentMetrics.Sum(m => m.TotalRequests);
            var totalCacheHits = recentMetrics.Sum(m => m.CacheHitCount);
            var totalResponseTime = recentMetrics.Sum(m => m.TotalResponseTimeMs);
            var totalErrors = recentMetrics.Sum(m => m.ErrorCount);

            return new HistoricalMetrics
            {
                CacheHitRate = totalRequests > 0 ? totalCacheHits / (double)totalRequests : 0,
                AverageResponseTimeMs = totalRequests > 0 ? totalResponseTime / (double)totalRequests : 0,
                ErrorRate = totalRequests > 0 ? totalErrors / (double)totalRequests : 0
            };
        }

        private PerformanceTrend CalculateOverallTrend(PerformanceTrendAnalysis analysis)
        {
            var trends = new[] 
            { 
                analysis.CacheHitRateTrend, 
                analysis.ResponseTimeTrend, 
                analysis.ErrorRateTrend 
            };

            if (trends.All(t => t == PerformanceTrend.Improving)) return PerformanceTrend.Improving;
            if (trends.All(t => t == PerformanceTrend.Degrading)) return PerformanceTrend.Degrading;
            return PerformanceTrend.Stable;
        }

        private PerformanceTrend CalculateCacheHitRateTrend(PerformanceTrendAnalysis analysis)
        {
            var difference = analysis.CurrentCacheHitRate - analysis.HistoricalCacheHitRate;
            if (Math.Abs(difference) < 0.01) return PerformanceTrend.Stable;
            return difference > 0 ? PerformanceTrend.Improving : PerformanceTrend.Degrading;
        }

        private PerformanceTrend CalculateResponseTimeTrend(PerformanceTrendAnalysis analysis)
        {
            var difference = analysis.CurrentAverageResponseTime - analysis.HistoricalAverageResponseTime;
            if (Math.Abs(difference) < 0.1) return PerformanceTrend.Stable;
            return difference < 0 ? PerformanceTrend.Improving : PerformanceTrend.Degrading;
        }

        private PerformanceTrend CalculateErrorRateTrend(PerformanceTrendAnalysis analysis)
        {
            var difference = analysis.CurrentErrorRate - analysis.HistoricalErrorRate;
            if (Math.Abs(difference) < 0.001) return PerformanceTrend.Stable;
            return difference < 0 ? PerformanceTrend.Improving : PerformanceTrend.Degrading;
        }

        private SeverityLevel CalculateSeverity(double actualValue, double thresholdValue)
        {
            var ratio = actualValue / thresholdValue;
            if (ratio >= 2.0) return SeverityLevel.Critical;
            if (ratio >= 1.5) return SeverityLevel.High;
            if (ratio >= 1.2) return SeverityLevel.Medium;
            return SeverityLevel.Low;
        }

        #endregion
    }

    #region Supporting Classes

    public class PerformanceMetric
    {
        public string OperationId { get; set; }
        public string UserId { get; set; }
        public string TenantId { get; set; }
        public long TotalRequests { get; set; }
        public long CacheHitCount { get; set; }
        public long SuccessCount { get; set; }
        public long ErrorCount { get; set; }
        public double TotalResponseTimeMs { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime LastUpdated { get; set; }
    }

    public class ResponseTimeRecord
    {
        public string OperationId { get; set; }
        public long ResponseTimeMs { get; set; }
        public DateTime Timestamp { get; set; }
    }

    public class PerformanceTrendAnalysis
    {
        public TimeSpan TimeWindow { get; set; }
        public PerformanceTrend TrendDirection { get; set; }
        public PerformanceTrend CacheHitRateTrend { get; set; }
        public PerformanceTrend ResponseTimeTrend { get; set; }
        public PerformanceTrend ErrorRateTrend { get; set; }
        public double CurrentCacheHitRate { get; set; }
        public double HistoricalCacheHitRate { get; set; }
        public double CurrentAverageResponseTime { get; set; }
        public double HistoricalAverageResponseTime { get; set; }
        public double CurrentErrorRate { get; set; }
        public double HistoricalErrorRate { get; set; }
        public DateTime AnalysisTimestamp { get; set; }
    }

    public class HistoricalMetrics
    {
        public double CacheHitRate { get; set; }
        public double AverageResponseTimeMs { get; set; }
        public double ErrorRate { get; set; }
    }

    public class PerformanceBottleneck
    {
        public BottleneckType Type { get; set; }
        public SeverityLevel Severity { get; set; }
        public string Description { get; set; }
        public string Recommendation { get; set; }
        public ImpactLevel ImpactLevel { get; set; }
        public DateTime DetectedAt { get; set; }
    }

    public enum PerformanceTrend
    {
        Improving,
        Degrading,
        Stable
    }

    public enum BottleneckType
    {
        CacheHitRate,
        ResponseTime,
        P99ResponseTime,
        MemoryUsage,
        DatabaseConnection,
        NetworkLatency
    }

    public enum SeverityLevel
    {
        Low,
        Medium,
        High,
        Critical
    }

    public enum ImpactLevel
    {
        Low,
        Medium,
        High,
        Critical
    }

    public interface IPermissionPerformanceMonitor
    {
        void RecordPermissionCheck(string operationId, string userId, string tenantId, bool isCacheHit, long responseTimeMs, bool isSuccess);
        PermissionPerformanceMetrics GetCurrentMetrics();
        PerformanceTrendAnalysis GetPerformanceTrend(TimeSpan timeWindow);
        List<PerformanceBottleneck> IdentifyBottlenecks();
        void ResetMetrics();
    }

    #endregion
}