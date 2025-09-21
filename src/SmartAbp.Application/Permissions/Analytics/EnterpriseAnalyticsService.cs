using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SmartAbp.Permissions.Alerting;
using SmartAbp.Permissions.Cache;
using SmartAbp.Permissions.Models;
using SmartAbp.Permissions.Performance;
using Volo.Abp.DependencyInjection;

namespace SmartAbp.Permissions.Analytics
{
    /// <summary>
    /// 企业级分析选项
    /// </summary>
    public class EnterpriseAnalyticsOptions
    {
        /// <summary>
        /// 是否启用使用分析
        /// </summary>
        public bool EnableUsageAnalytics { get; set; } = true;

        /// <summary>
        /// 是否启用性能分析
        /// </summary>
        public bool EnablePerformanceAnalytics { get; set; } = true;

        /// <summary>
        /// 是否启用趋势分析
        /// </summary>
        public bool EnableTrendAnalysis { get; set; } = true;

        /// <summary>
        /// 是否启用预测分析
        /// </summary>
        public bool EnablePredictiveAnalytics { get; set; } = true;

        /// <summary>
        /// 是否启用异常检测
        /// </summary>
        public bool EnableAnomalyDetection { get; set; } = true;

        /// <summary>
        /// 分析数据保留天数
        /// </summary>
        public int DataRetentionDays { get; set; } = 365;

        /// <summary>
        /// 聚合间隔（分钟）
        /// </summary>
        public int AggregationIntervalMinutes { get; set; } = 5;

        /// <summary>
        /// 趋势分析窗口（小时）
        /// </summary>
        public int TrendAnalysisWindowHours { get; set; } = 24;

        /// <summary>
        /// 异常检测阈值
        /// </summary>
        public double AnomalyDetectionThreshold { get; set; } = 2.0;

        /// <summary>
        /// 预测分析置信度
        /// </summary>
        public double PredictiveConfidence { get; set; } = 0.8;

        /// <summary>
        /// 是否启用实时分析
        /// </summary>
        public bool EnableRealTimeAnalytics { get; set; } = true;

        /// <summary>
        /// 实时分析间隔（秒）
        /// </summary>
        public int RealTimeAnalyticsIntervalSeconds { get; set; } = 30;

        /// <summary>
        /// 是否发送通知
        /// </summary>
        public bool SendNotification { get; set; } = true;
    }

    /// <summary>
    /// 使用分析数据模型
    /// </summary>
    public class UsageAnalyticsData
    {
        /// <summary>
        /// 数据ID
        /// </summary>
        public string DataId { get; set; } = Guid.NewGuid().ToString();

        /// <summary>
        /// 用户ID
        /// </summary>
        public string UserId { get; set; }

        /// <summary>
        /// 资源名称
        /// </summary>
        public string ResourceName { get; set; }

        /// <summary>
        /// 操作类型
        /// </summary>
        public string ActionType { get; set; }

        /// <summary>
        /// 使用次数
        /// </summary>
        public int UsageCount { get; set; }

        /// <summary>
        /// 平均响应时间
        /// </summary>
        public double AverageResponseTimeMs { get; set; }

        /// <summary>
        /// 成功率
        /// </summary>
        public double SuccessRate { get; set; }

        /// <summary>
        /// 时间戳
        /// </summary>
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// 额外数据
        /// </summary>
        public Dictionary<string, object> ExtraData { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>
    /// 性能分析数据模型
    /// </summary>
    public class PerformanceAnalyticsData
    {
        /// <summary>
        /// 数据ID
        /// </summary>
        public string DataId { get; set; } = Guid.NewGuid().ToString();

        /// <summary>
        /// 服务名称
        /// </summary>
        public string ServiceName { get; set; }

        /// <summary>
        /// 平均响应时间
        /// </summary>
        public double AverageResponseTimeMs { get; set; }

        /// <summary>
        /// P95响应时间
        /// </summary>
        public double P95ResponseTimeMs { get; set; }

        /// <summary>
        /// P99响应时间
        /// </summary>
        public double P99ResponseTimeMs { get; set; }

        /// <summary>
        /// 吞吐量
        /// </summary>
        public double ThroughputRPS { get; set; }

        /// <summary>
        /// 错误率
        /// </summary>
        public double ErrorRate { get; set; }

        /// <summary>
        /// 内存使用量
        /// </summary>
        public double MemoryUsageMB { get; set; }

        /// <summary>
        /// CPU使用率
        /// </summary>
        public double CpuUsagePercent { get; set; }

        /// <summary>
        /// 时间戳
        /// </summary>
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// 趋势分析结果模型
    /// </summary>
    public class TrendAnalysisResult
    {
        /// <summary>
        /// 趋势类型
        /// </summary>
        public string TrendType { get; set; }

        /// <summary>
        /// 趋势方向
        /// </summary>
        public string TrendDirection { get; set; }

        /// <summary>
        /// 趋势强度
        /// </summary>
        public double TrendStrength { get; set; }

        /// <summary>
        /// 置信度
        /// </summary>
        public double Confidence { get; set; }

        /// <summary>
        /// 预测值
        /// </summary>
        public double PredictedValue { get; set; }

        /// <summary>
        /// 历史数据点
        /// </summary>
        public List<DataPoint> HistoricalData { get; set; } = new List<DataPoint>();

        /// <summary>
        /// 分析时间
        /// </summary>
        public DateTime AnalysisTime { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// 数据点模型
    /// </summary>
    public class DataPoint
    {
        /// <summary>
        /// 时间戳
        /// </summary>
        public DateTime Timestamp { get; set; }

        /// <summary>
        /// 值
        /// </summary>
        public double Value { get; set; }

        /// <summary>
        /// 标签
        /// </summary>
        public string Label { get; set; }
    }

    /// <summary>
    /// 异常检测结果模型
    /// </summary>
    public class AnomalyDetectionResult
    {
        /// <summary>
        /// 是否检测到异常
        /// </summary>
        public bool IsAnomaly { get; set; }

        /// <summary>
        /// 异常分数
        /// </summary>
        public double AnomalyScore { get; set; }

        /// <summary>
        /// 异常类型
        /// </summary>
        public string AnomalyType { get; set; }

        /// <summary>
        /// 异常描述
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// 置信度
        /// </summary>
        public double Confidence { get; set; }

        /// <summary>
        /// 检测时间
        /// </summary>
        public DateTime DetectionTime { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// 相关数据点
        /// </summary>
        public List<DataPoint> RelatedDataPoints { get; set; } = new List<DataPoint>();
    }

    /// <summary>
    /// 预测分析结果模型
    /// </summary>
    public class PredictiveAnalyticsResult
    {
        /// <summary>
        /// 预测类型
        /// </summary>
        public string PredictionType { get; set; }

        /// <summary>
        /// 预测值
        /// </summary>
        public double PredictedValue { get; set; }

        /// <summary>
        /// 置信度
        /// </summary>
        public double Confidence { get; set; }

        /// <summary>
        /// 预测时间范围
        /// </summary>
        public TimeSpan PredictionHorizon { get; set; }

        /// <summary>
        /// 影响因素
        /// </summary>
        public List<string> InfluencingFactors { get; set; } = new List<string>();

        /// <summary>
        /// 历史准确性
        /// </summary>
        public double HistoricalAccuracy { get; set; }

        /// <summary>
        /// 预测时间
        /// </summary>
        public DateTime PredictionTime { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// 企业级分析服务接口
    /// </summary>
    public interface IEnterpriseAnalyticsService
    {
        /// <summary>
        /// 记录使用数据
        /// </summary>
        /// <param name="data">使用数据</param>
        /// <returns>任务</returns>
        Task RecordUsageDataAsync(UsageAnalyticsData data);

        /// <summary>
        /// 记录性能数据
        /// </summary>
        /// <param name="data">性能数据</param>
        /// <returns>任务</returns>
        Task RecordPerformanceDataAsync(PerformanceAnalyticsData data);

        /// <summary>
        /// 获取使用分析
        /// </summary>
        /// <param name="userId">用户ID</param>
        /// <param name="timeRange">时间范围</param>
        /// <returns>使用分析数据</returns>
        Task<List<UsageAnalyticsData>> GetUsageAnalyticsAsync(string? userId = null, TimeSpan? timeRange = null);

        /// <summary>
        /// 获取性能分析
        /// </summary>
        /// <param name="serviceName">服务名称</param>
        /// <param name="timeRange">时间范围</param>
        /// <returns>性能分析数据</returns>
        Task<List<PerformanceAnalyticsData>> GetPerformanceAnalyticsAsync(string? serviceName = null, TimeSpan? timeRange = null);

        /// <summary>
        /// 执行趋势分析
        /// </summary>
        /// <param name="dataType">数据类型</param>
        /// <param name="metric">指标</param>
        /// <param name="timeRange">时间范围</param>
        /// <returns>趋势分析结果</returns>
        Task<TrendAnalysisResult> PerformTrendAnalysisAsync(string dataType, string metric, TimeSpan? timeRange = null);

        /// <summary>
        /// 执行异常检测
        /// </summary>
        /// <param name="dataType">数据类型</param>
        /// <param name="metric">指标</param>
        /// <param name="dataPoints">数据点</param>
        /// <returns>异常检测结果</returns>
        Task<AnomalyDetectionResult> PerformAnomalyDetectionAsync(string dataType, string metric, List<DataPoint>? dataPoints = null);

        /// <summary>
        /// 执行预测分析
        /// </summary>
        /// <param name="predictionType">预测类型</param>
        /// <param name="metric">指标</param>
        /// <param name="predictionHorizon">预测时间范围</param>
        /// <returns>预测分析结果</returns>
        Task<PredictiveAnalyticsResult> PerformPredictiveAnalysisAsync(string predictionType, string metric, TimeSpan predictionHorizon);

        /// <summary>
        /// 获取实时分析
        /// </summary>
        /// <returns>实时分析结果</returns>
        Task<RealTimeAnalyticsResult> GetRealTimeAnalyticsAsync();

        /// <summary>
        /// 生成分析报告
        /// </summary>
        /// <param name="reportType">报告类型</param>
        /// <param name="timeRange">时间范围</param>
        /// <returns>分析报告</returns>
        Task<AnalyticsReport> GenerateAnalyticsReportAsync(string reportType, TimeSpan? timeRange = null);

        /// <summary>
        /// 清理过期数据
        /// </summary>
        /// <returns>清理结果</returns>
        Task<CleanupResult> CleanupOldDataAsync();
    }

    /// <summary>
    /// 实时分析结果模型
    /// </summary>
    public class RealTimeAnalyticsResult
    {
        /// <summary>
        /// 当前使用量
        /// </summary>
        public double CurrentUsage { get; set; }

        /// <summary>
        /// 当前性能指标
        /// </summary>
        public double CurrentPerformance { get; set; }

        /// <summary>
        /// 异常检测结果
        /// </summary>
        public List<AnomalyDetectionResult> Anomalies { get; set; } = new List<AnomalyDetectionResult>();

        /// <summary>
        /// 趋势指示器
        /// </summary>
        public string TrendIndicator { get; set; }

        /// <summary>
        /// 警报状态
        /// </summary>
        public bool HasAlerts { get; set; }

        /// <summary>
        /// 更新时间
        /// </summary>
        public DateTime UpdateTime { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// 分析报告模型
    /// </summary>
    public class AnalyticsReport
    {
        /// <summary>
        /// 报告ID
        /// </summary>
        public string ReportId { get; set; } = Guid.NewGuid().ToString();

        /// <summary>
        /// 报告类型
        /// </summary>
        public string ReportType { get; set; }

        /// <summary>
        /// 生成时间
        /// </summary>
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// 时间范围
        /// </summary>
        public TimeSpan TimeRange { get; set; }

        /// <summary>
        /// 使用分析
        /// </summary>
        public List<UsageAnalyticsData> UsageAnalytics { get; set; } = new List<UsageAnalyticsData>();

        /// <summary>
        /// 性能分析
        /// </summary>
        public List<PerformanceAnalyticsData> PerformanceAnalytics { get; set; } = new List<PerformanceAnalyticsData>();

        /// <summary>
        /// 趋势分析
        /// </summary>
        public List<TrendAnalysisResult> TrendAnalysis { get; set; } = new List<TrendAnalysisResult>();

        /// <summary>
        /// 异常检测
        /// </summary>
        public List<AnomalyDetectionResult> AnomalyDetection { get; set; } = new List<AnomalyDetectionResult>();

        /// <summary>
        /// 预测分析
        /// </summary>
        public List<PredictiveAnalyticsResult> PredictiveAnalysis { get; set; } = new List<PredictiveAnalyticsResult>();

        /// <summary>
        /// 关键指标
        /// </summary>
        public Dictionary<string, double> KeyMetrics { get; set; } = new Dictionary<string, double>();

        /// <summary>
        /// 建议
        /// </summary>
        public List<string> Recommendations { get; set; } = new List<string>();
    }

    /// <summary>
    /// 清理结果模型
    /// </summary>
    public class CleanupResult
    {
        /// <summary>
        /// 清理的数据量
        /// </summary>
        public long CleanedRecords { get; set; }

        /// <summary>
        /// 释放的存储空间（字节）
        /// </summary>
        public long FreedStorageBytes { get; set; }

        /// <summary>
        /// 清理时间
        /// </summary>
        public DateTime CleanupTime { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// 清理状态
        /// </summary>
        public string Status { get; set; }
    }

    /// <summary>
    /// 企业级分析服务实现
    /// </summary>
    public class EnterpriseAnalyticsService : IEnterpriseAnalyticsService, ISingletonDependency
    {
        private readonly EnterpriseAnalyticsOptions _options;
        private readonly ILogger<EnterpriseAnalyticsService> _logger;
        private readonly IPermissionPerformanceMonitor _performanceMonitor;
        private readonly IPermissionAlertingService _alertingService;
        private readonly IDistributedPermissionCacheLock _distributedLock;
        
        private readonly ConcurrentQueue<UsageAnalyticsData> _usageDataQueue = new ConcurrentQueue<UsageAnalyticsData>();
        private readonly ConcurrentQueue<PerformanceAnalyticsData> _performanceDataQueue = new ConcurrentQueue<PerformanceAnalyticsData>();
        private readonly ConcurrentDictionary<string, List<DataPoint>> _historicalData = new ConcurrentDictionary<string, List<DataPoint>>();
        private readonly ConcurrentDictionary<string, DateTime> _lastAlertTime = new ConcurrentDictionary<string, DateTime>();

        public EnterpriseAnalyticsService(
            IOptions<EnterpriseAnalyticsOptions> options,
            ILogger<EnterpriseAnalyticsService> logger,
            IPermissionPerformanceMonitor performanceMonitor,
            IPermissionAlertingService alertingService,
            IDistributedPermissionCacheLock distributedLock)
        {
            _options = options?.Value ?? new EnterpriseAnalyticsOptions();
            _logger = logger;
            _performanceMonitor = performanceMonitor;
            _alertingService = alertingService;
            _distributedLock = distributedLock;
        }

        public async Task RecordUsageDataAsync(UsageAnalyticsData data)
        {
            try
            {
                if (!_options.EnableUsageAnalytics)
                {
                    return;
                }

                _usageDataQueue.Enqueue(data);
                
                // 实时异常检测
                if (_options.EnableAnomalyDetection)
                {
                    await PerformRealTimeAnomalyDetection(data);
                }

                _logger.LogDebug("Recorded usage data for user {UserId}, resource {ResourceName}, action {ActionType}",
                    data.UserId, data.ResourceName, data.ActionType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error recording usage data");
                throw;
            }
        }

        public async Task RecordPerformanceDataAsync(PerformanceAnalyticsData data)
        {
            try
            {
                if (!_options.EnablePerformanceAnalytics)
                {
                    return;
                }

                _performanceDataQueue.Enqueue(data);
                
                // 存储历史数据用于趋势分析
                var key = $"performance:{data.ServiceName}";
                var historicalData = _historicalData.GetOrAdd(key, _ => new List<DataPoint>());
                
                lock (historicalData)
                {
                    historicalData.Add(new DataPoint
                    {
                        Timestamp = data.Timestamp,
                        Value = data.AverageResponseTimeMs,
                        Label = "ResponseTime"
                    });
                    
                    // 保持最近的数据点
                    var cutoff = DateTime.UtcNow.AddHours(-_options.TrendAnalysisWindowHours);
                    historicalData.RemoveAll(dp => dp.Timestamp < cutoff);
                }

                _logger.LogDebug("Recorded performance data for service {ServiceName}, avg response time: {AvgResponseTime}ms",
                    data.ServiceName, data.AverageResponseTimeMs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error recording performance data");
                throw;
            }
        }

        public async Task<List<UsageAnalyticsData>> GetUsageAnalyticsAsync(string? userId = null, TimeSpan? timeRange = null)
        {
            try
            {
                var range = timeRange ?? TimeSpan.FromHours(24);
                var cutoff = DateTime.UtcNow.Add(-range);
                
                var usageData = new List<UsageAnalyticsData>();
                
                // 从队列中获取数据
                var tempQueue = new ConcurrentQueue<UsageAnalyticsData>();
                while (_usageDataQueue.TryDequeue(out var data))
                {
                    if (data.Timestamp >= cutoff && (string.IsNullOrEmpty(userId) || data.UserId == userId))
                    {
                        usageData.Add(data);
                    }
                    tempQueue.Enqueue(data);
                }
                
                // 将数据放回队列
                while (tempQueue.TryDequeue(out var data))
                {
                    _usageDataQueue.Enqueue(data);
                }

                // 聚合数据
                var aggregatedData = usageData
                    .GroupBy(d => new { d.UserId, d.ResourceName, d.ActionType })
                    .Select(g => new UsageAnalyticsData
                    {
                        UserId = g.Key.UserId,
                        ResourceName = g.Key.ResourceName,
                        ActionType = g.Key.ActionType,
                        UsageCount = g.Sum(d => d.UsageCount),
                        AverageResponseTimeMs = g.Average(d => d.AverageResponseTimeMs),
                        SuccessRate = g.Average(d => d.SuccessRate),
                        Timestamp = g.Max(d => d.Timestamp)
                    })
                    .ToList();

                return aggregatedData;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting usage analytics");
                return new List<UsageAnalyticsData>();
            }
        }

        public async Task<List<PerformanceAnalyticsData>> GetPerformanceAnalyticsAsync(string? serviceName = null, TimeSpan? timeRange = null)
        {
            try
            {
                var range = timeRange ?? TimeSpan.FromHours(24);
                var cutoff = DateTime.UtcNow.Add(-range);
                
                var performanceData = new List<PerformanceAnalyticsData>();
                
                // 从队列中获取数据
                var tempQueue = new ConcurrentQueue<PerformanceAnalyticsData>();
                while (_performanceDataQueue.TryDequeue(out var data))
                {
                    if (data.Timestamp >= cutoff && (string.IsNullOrEmpty(serviceName) || data.ServiceName == serviceName))
                    {
                        performanceData.Add(data);
                    }
                    tempQueue.Enqueue(data);
                }
                
                // 将数据放回队列
                while (tempQueue.TryDequeue(out var data))
                {
                    _performanceDataQueue.Enqueue(data);
                }

                return performanceData;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting performance analytics");
                return new List<PerformanceAnalyticsData>();
            }
        }

        public async Task<TrendAnalysisResult> PerformTrendAnalysisAsync(string dataType, string metric, TimeSpan? timeRange = null)
        {
            try
            {
                if (!_options.EnableTrendAnalysis)
                {
                    return new TrendAnalysisResult();
                }

                var key = $"{dataType}:{metric}";
                if (!_historicalData.TryGetValue(key, out var historicalData))
                {
                    return new TrendAnalysisResult { TrendType = "No Data" };
                }

                List<DataPoint> dataPoints;
                lock (historicalData)
                {
                    var range = timeRange ?? TimeSpan.FromHours(_options.TrendAnalysisWindowHours);
                    var cutoff = DateTime.UtcNow.Add(-range);
                    dataPoints = historicalData.Where(dp => dp.Timestamp >= cutoff).ToList();
                }

                if (dataPoints.Count < 3)
                {
                    return new TrendAnalysisResult { TrendType = "Insufficient Data" };
                }

                // 简单的线性趋势分析
                var trendResult = AnalyzeLinearTrend(dataPoints);
                
                _logger.LogInformation("Trend analysis for {DataType}/{Metric}: {TrendDirection} trend with strength {TrendStrength:F2}",
                    dataType, metric, trendResult.TrendDirection, trendResult.TrendStrength);

                return trendResult;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error performing trend analysis");
                return new TrendAnalysisResult();
            }
        }

        public async Task<AnomalyDetectionResult> PerformAnomalyDetectionAsync(string dataType, string metric, List<DataPoint>? dataPoints = null)
        {
            try
            {
                if (!_options.EnableAnomalyDetection)
                {
                    return new AnomalyDetectionResult { IsAnomaly = false };
                }

                var key = $"{dataType}:{metric}";
                if (dataPoints == null && !_historicalData.TryGetValue(key, out dataPoints))
                {
                    return new AnomalyDetectionResult { IsAnomaly = false, Description = "No historical data available" };
                }

                if (dataPoints.Count < 10)
                {
                    return new AnomalyDetectionResult { IsAnomaly = false, Description = "Insufficient data for anomaly detection" };
                }

                // 简单的统计异常检测
                var anomalyResult = DetectStatisticalAnomaly(dataPoints);
                
                if (anomalyResult.IsAnomaly)
                {
                    await HandleAnomalyDetected(dataType, metric, anomalyResult);
                }

                return anomalyResult;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error performing anomaly detection");
                return new AnomalyDetectionResult();
            }
        }

        public async Task<PredictiveAnalyticsResult> PerformPredictiveAnalysisAsync(string predictionType, string metric, TimeSpan predictionHorizon)
        {
            try
            {
                if (!_options.EnablePredictiveAnalytics)
                {
                    return new PredictiveAnalyticsResult();
                }

                var key = $"performance:{metric}";
                if (!_historicalData.TryGetValue(key, out var historicalData))
                {
                    return new PredictiveAnalyticsResult { PredictionType = "No Data" };
                }

                List<DataPoint> dataPoints;
                lock (historicalData)
                {
                    dataPoints = new List<DataPoint>(historicalData);
                }

                if (dataPoints.Count < 20)
                {
                    return new PredictiveAnalyticsResult { PredictionType = "Insufficient Data" };
                }

                // 简单的时间序列预测
                var predictionResult = PerformTimeSeriesPrediction(dataPoints, predictionHorizon);
                
                _logger.LogInformation("Predictive analysis for {PredictionType}/{Metric}: predicted value {PredictedValue:F2} with confidence {Confidence:F2}",
                    predictionType, metric, predictionResult.PredictedValue, predictionResult.Confidence);

                return predictionResult;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error performing predictive analysis");
                return new PredictiveAnalyticsResult();
            }
        }

        public async Task<RealTimeAnalyticsResult> GetRealTimeAnalyticsAsync()
        {
            try
            {
                if (!_options.EnableRealTimeAnalytics)
                {
                    return new RealTimeAnalyticsResult();
                }

                var currentMetrics = _performanceMonitor.GetCurrentMetrics();
                var usageData = await GetUsageAnalyticsAsync(null, TimeSpan.FromMinutes(5));
                var performanceData = await GetPerformanceAnalyticsAsync(null, TimeSpan.FromMinutes(5));

                var result = new RealTimeAnalyticsResult
                {
                    CurrentUsage = usageData.Sum(d => d.UsageCount),
                    CurrentPerformance = currentMetrics.AverageResponseTimeMs,
                    TrendIndicator = GetTrendIndicator(currentMetrics),
                    HasAlerts = currentMetrics.AverageResponseTimeMs > 1000 || currentMetrics.ErrorRate > 5
                };

                // 实时异常检测
                if (_options.EnableAnomalyDetection)
                {
                    var recentData = performanceData.Select(d => new DataPoint
                    {
                        Timestamp = d.Timestamp,
                        Value = d.AverageResponseTimeMs,
                        Label = "RealTime"
                    }).ToList();

                    if (recentData.Count >= 5)
                    {
                        var anomalyResult = await PerformAnomalyDetectionAsync("realtime", "response_time", recentData);
                        if (anomalyResult.IsAnomaly)
                        {
                            result.Anomalies.Add(anomalyResult);
                        }
                    }
                }

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting real-time analytics");
                return new RealTimeAnalyticsResult();
            }
        }

        public async Task<AnalyticsReport> GenerateAnalyticsReportAsync(string reportType, TimeSpan? timeRange = null)
        {
            try
            {
                var range = timeRange ?? TimeSpan.FromHours(24);
                var report = new AnalyticsReport
                {
                    ReportType = reportType,
                    TimeRange = range
                };

                // 获取使用分析
                if (_options.EnableUsageAnalytics)
                {
                    report.UsageAnalytics = await GetUsageAnalyticsAsync(null, range);
                }

                // 获取性能分析
                if (_options.EnablePerformanceAnalytics)
                {
                    report.PerformanceAnalytics = await GetPerformanceAnalyticsAsync(null, range);
                }

                // 执行趋势分析
                if (_options.EnableTrendAnalysis)
                {
                    report.TrendAnalysis = new List<TrendAnalysisResult>();
                    var trendResult = await PerformTrendAnalysisAsync("performance", "response_time", range);
                    if (trendResult != null)
                    {
                        report.TrendAnalysis.Add(trendResult);
                    }
                }

                // 执行异常检测
                if (_options.EnableAnomalyDetection)
                {
                    report.AnomalyDetection = new List<AnomalyDetectionResult>();
                    var anomalyResult = await PerformAnomalyDetectionAsync("performance", "response_time");
                    if (anomalyResult != null)
                    {
                        report.AnomalyDetection.Add(anomalyResult);
                    }
                }

                // 执行预测分析
                if (_options.EnablePredictiveAnalytics)
                {
                    report.PredictiveAnalysis = new List<PredictiveAnalyticsResult>();
                    var predictionResult = await PerformPredictiveAnalysisAsync("performance", "response_time", TimeSpan.FromHours(1));
                    if (predictionResult != null)
                    {
                        report.PredictiveAnalysis.Add(predictionResult);
                    }
                }

                // 生成关键指标
                report.KeyMetrics = GenerateKeyMetrics(report);

                // 生成建议
                report.Recommendations = GenerateRecommendations(report);

                _logger.LogInformation("Generated analytics report: {ReportType} with {UsageCount} usage records and {PerformanceCount} performance records",
                    reportType, report.UsageAnalytics.Count, report.PerformanceAnalytics.Count);

                return report;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating analytics report");
                return new AnalyticsReport { ReportType = reportType };
            }
        }

        public async Task<CleanupResult> CleanupOldDataAsync()
        {
            try
            {
                var cutoff = DateTime.UtcNow.AddDays(-_options.DataRetentionDays);
                long cleanedRecords = 0;
                long freedStorageBytes = 0;

                // 清理使用数据
                var usageDataToRemove = new List<UsageAnalyticsData>();
                var tempUsageQueue = new ConcurrentQueue<UsageAnalyticsData>();
                while (_usageDataQueue.TryDequeue(out var data))
                {
                    if (data.Timestamp >= cutoff)
                    {
                        tempUsageQueue.Enqueue(data);
                    }
                    else
                    {
                        cleanedRecords++;
                        freedStorageBytes += EstimateDataSize(data);
                    }
                }
                
                while (tempUsageQueue.TryDequeue(out var data))
                {
                    _usageDataQueue.Enqueue(data);
                }

                // 清理性能数据
                var performanceDataToRemove = new List<PerformanceAnalyticsData>();
                var tempPerformanceQueue = new ConcurrentQueue<PerformanceAnalyticsData>();
                while (_performanceDataQueue.TryDequeue(out var data))
                {
                    if (data.Timestamp >= cutoff)
                    {
                        tempPerformanceQueue.Enqueue(data);
                    }
                    else
                    {
                        cleanedRecords++;
                        freedStorageBytes += EstimateDataSize(data);
                    }
                }
                
                while (tempPerformanceQueue.TryDequeue(out var data))
                {
                    _performanceDataQueue.Enqueue(data);
                }

                // 清理历史数据
                foreach (var kvp in _historicalData)
                {
                    lock (kvp.Value)
                    {
                        var oldCount = kvp.Value.Count;
                        kvp.Value.RemoveAll(dp => dp.Timestamp < cutoff);
                        cleanedRecords += oldCount - kvp.Value.Count;
                    }
                }

                var result = new CleanupResult
                {
                    CleanedRecords = cleanedRecords,
                    FreedStorageBytes = freedStorageBytes,
                    Status = "Success"
                };

                _logger.LogInformation("Cleanup completed: {CleanedRecords} records cleaned, {FreedStorageBytes} bytes freed",
                    cleanedRecords, freedStorageBytes);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during cleanup");
                return new CleanupResult { Status = "Error: " + ex.Message };
            }
        }

        private async Task PerformRealTimeAnomalyDetection(UsageAnalyticsData data)
        {
            try
            {
                // 简单的异常检测逻辑
                if (data.AverageResponseTimeMs > 5000 || data.SuccessRate < 0.5)
                {
                    var alertKey = $"anomaly:{data.UserId}:{data.ResourceName}:{data.ActionType}";
                    var lastAlertTime = _lastAlertTime.GetOrAdd(alertKey, DateTime.MinValue);
                    
                    if (DateTime.UtcNow - lastAlertTime > TimeSpan.FromMinutes(15))
                    {
                        await _alertingService.CreateAlertAsync(
                            AlertLevel.Warning,
                            AlertType.Analytics,
                            "Usage Anomaly Detected",
                            $"Anomaly detected for user {data.UserId}: response time {data.AverageResponseTimeMs:F2}ms, success rate {data.SuccessRate:F2}%",
                            "EnterpriseAnalyticsService",
                            new Dictionary<string, object>
                            {
                                ["UserId"] = data.UserId,
                                ["ResourceName"] = data.ResourceName,
                                ["ActionType"] = data.ActionType,
                                ["ResponseTimeMs"] = data.AverageResponseTimeMs,
                                ["SuccessRate"] = data.SuccessRate
                            }
                        );
                        
                        _lastAlertTime[alertKey] = DateTime.UtcNow;
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error performing real-time anomaly detection");
            }
        }

        private async Task HandleAnomalyDetected(string dataType, string metric, AnomalyDetectionResult anomalyResult)
        {
            try
            {
                if (_options.SendNotification)
                {
                    await _alertingService.CreateAlertAsync(
                        AlertLevel.Warning,
                        AlertType.Analytics,
                        "Anomaly Detected",
                        $"Anomaly detected in {dataType}/{metric}: {anomalyResult.Description}",
                        "EnterpriseAnalyticsService",
                        new Dictionary<string, object>
                        {
                            ["DataType"] = dataType,
                            ["Metric"] = metric,
                            ["AnomalyScore"] = anomalyResult.AnomalyScore,
                            ["Confidence"] = anomalyResult.Confidence
                        }
                    );
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error handling anomaly detection");
            }
        }

        private TrendAnalysisResult AnalyzeLinearTrend(List<DataPoint> dataPoints)
        {
            if (dataPoints.Count < 3)
            {
                return new TrendAnalysisResult { TrendType = "Insufficient Data" };
            }

            // 简单的线性回归
            var n = dataPoints.Count;
            var sumX = dataPoints.Select((dp, i) => (double)i).Sum();
            var sumY = dataPoints.Sum(dp => dp.Value);
            var sumXY = dataPoints.Select((dp, i) => (double)i * dp.Value).Sum();
            var sumX2 = dataPoints.Select((dp, i) => (double)i * i).Sum();

            var slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
            var intercept = (sumY - slope * sumX) / n;

            // 计算趋势强度
            var avgY = sumY / n;
            var totalSumSquares = dataPoints.Sum(dp => Math.Pow(dp.Value - avgY, 2));
            var residualSumSquares = dataPoints.Select((dp, i) => Math.Pow(dp.Value - (slope * i + intercept), 2)).Sum();
            var rSquared = 1 - (residualSumSquares / totalSumSquares);

            var trendDirection = slope > 0.01 ? "Increasing" : slope < -0.01 ? "Decreasing" : "Stable";
            var predictedValue = slope * (n + 10) + intercept; // 预测10个时间单位后的值

            return new TrendAnalysisResult
            {
                TrendType = "Linear",
                TrendDirection = trendDirection,
                TrendStrength = Math.Abs(slope),
                Confidence = rSquared,
                PredictedValue = predictedValue,
                HistoricalData = dataPoints
            };
        }

        private AnomalyDetectionResult DetectStatisticalAnomaly(List<DataPoint> dataPoints)
        {
            if (dataPoints.Count < 10)
            {
                return new AnomalyDetectionResult { IsAnomaly = false, Description = "Insufficient data" };
            }

            // 计算统计指标
            var values = dataPoints.Select(dp => dp.Value).ToList();
            var mean = values.Average();
            var stdDev = Math.Sqrt(values.Sum(v => Math.Pow(v - mean, 2)) / values.Count);

            // 检查最新数据点是否为异常
            var latestValue = values.Last();
            var zScore = stdDev > 0 ? Math.Abs(latestValue - mean) / stdDev : 0;

            var isAnomaly = zScore > _options.AnomalyDetectionThreshold;
            var description = isAnomaly 
                ? $"Anomaly detected: value {latestValue:F2} is {zScore:F2} standard deviations from mean {mean:F2}"
                : "No anomaly detected";

            return new AnomalyDetectionResult
            {
                IsAnomaly = isAnomaly,
                AnomalyScore = zScore,
                AnomalyType = "Statistical",
                Description = description,
                Confidence = Math.Min(1.0, zScore / _options.AnomalyDetectionThreshold),
                RelatedDataPoints = dataPoints.TakeLast(10).ToList()
            };
        }

        private PredictiveAnalyticsResult PerformTimeSeriesPrediction(List<DataPoint> dataPoints, TimeSpan predictionHorizon)
        {
            if (dataPoints.Count < 20)
            {
                return new PredictiveAnalyticsResult { PredictionType = "Insufficient Data" };
            }

            // 简单的时间序列预测（移动平均）
            var recentValues = dataPoints.TakeLast(10).Select(dp => dp.Value).ToList();
            var predictedValue = recentValues.Average();
            
            // 计算历史准确性
            var actualValues = dataPoints.SkipLast(10).Select(dp => dp.Value).ToList();
            var predictedValues = new List<double>();
            for (int i = 10; i < dataPoints.Count; i++)
            {
                var window = dataPoints.Skip(i - 10).Take(10).Select(dp => dp.Value).ToList();
                predictedValues.Add(window.Average());
            }

            var errors = actualValues.Zip(predictedValues, (actual, predicted) => Math.Abs(actual - predicted)).ToList();
            var historicalAccuracy = errors.Count > 0 ? 1.0 - (errors.Average() / actualValues.Average()) : 0.5;

            return new PredictiveAnalyticsResult
            {
                PredictionType = "Time Series",
                PredictedValue = predictedValue,
                Confidence = Math.Min(1.0, historicalAccuracy),
                PredictionHorizon = predictionHorizon,
                InfluencingFactors = new List<string> { "Historical data", "Trend analysis" },
                HistoricalAccuracy = historicalAccuracy
            };
        }

        private string GetTrendIndicator(PermissionPerformanceMetrics metrics)
        {
            if (metrics.AverageResponseTimeMs > 1000)
                return "📈 Performance Degrading";
            if (metrics.CacheHitRate < 90)
                return "📉 Cache Issues";
            return "✅ Normal";
        }

        private Dictionary<string, double> GenerateKeyMetrics(AnalyticsReport report)
        {
            var metrics = new Dictionary<string, double>();

            if (report.UsageAnalytics.Any())
            {
                metrics["TotalUsage"] = report.UsageAnalytics.Sum(d => d.UsageCount);
                metrics["AverageSuccessRate"] = report.UsageAnalytics.Average(d => d.SuccessRate);
                metrics["AverageResponseTime"] = report.UsageAnalytics.Average(d => d.AverageResponseTimeMs);
            }

            if (report.PerformanceAnalytics.Any())
            {
                metrics["AverageThroughput"] = report.PerformanceAnalytics.Average(d => d.ThroughputRPS);
                metrics["AverageErrorRate"] = report.PerformanceAnalytics.Average(d => d.ErrorRate);
                metrics["AverageMemoryUsage"] = report.PerformanceAnalytics.Average(d => d.MemoryUsageMB);
            }

            return metrics;
        }

        private List<string> GenerateRecommendations(AnalyticsReport report)
        {
            var recommendations = new List<string>();

            if (report.KeyMetrics.TryGetValue("AverageResponseTime", out var avgResponseTime) && avgResponseTime > 1000)
            {
                recommendations.Add("Consider optimizing performance - average response time is above 1 second");
            }

            if (report.KeyMetrics.TryGetValue("AverageSuccessRate", out var avgSuccessRate) && avgSuccessRate < 0.95)
            {
                recommendations.Add("Investigate low success rate - consider error handling improvements");
            }

            if (report.AnomalyDetection?.Any(a => a.IsAnomaly) == true)
            {
                recommendations.Add("Anomalies detected - review system behavior and investigate root causes");
            }

            if (report.TrendAnalysis?.Any(t => t.TrendDirection == "Increasing" && t.PredictedValue > 1000) == true)
            {
                recommendations.Add("Performance trend indicates potential issues - consider scaling or optimization");
            }

            if (!recommendations.Any())
            {
                recommendations.Add("System performance appears normal - continue monitoring");
            }

            return recommendations;
        }

        private long EstimateDataSize(object data)
        {
            // 简化的数据大小估算
            return 1024; // 假设每个数据点约1KB
        }
    }

    /// <summary>
    /// 企业级分析服务扩展
    /// </summary>
    public static class EnterpriseAnalyticsServiceExtensions
    {
        /// <summary>
        /// 添加企业级分析服务
        /// </summary>
        /// <param name="services">服务集合</param>
        /// <returns>服务集合</returns>
        public static IServiceCollection AddEnterpriseAnalyticsService(this IServiceCollection services)
        {
            services.Configure<EnterpriseAnalyticsOptions>(options =>
            {
                options.EnableUsageAnalytics = true;
                options.EnablePerformanceAnalytics = true;
                options.EnableTrendAnalysis = true;
                options.EnablePredictiveAnalytics = true;
                options.EnableAnomalyDetection = true;
                options.EnableRealTimeAnalytics = true;
                options.DataRetentionDays = 365;
                options.AnomalyDetectionThreshold = 2.0;
                options.PredictiveConfidence = 0.8;
                options.SendNotification = true;
            });
            
            services.AddSingleton<IEnterpriseAnalyticsService, EnterpriseAnalyticsService>();
            return services;
        }

        /// <summary>
        /// 添加企业级分析服务（带配置）
        /// </summary>
        /// <param name="services">服务集合</param>
        /// <param name="configure">配置操作</param>
        /// <returns>服务集合</returns>
        public static IServiceCollection AddEnterpriseAnalyticsService(
            this IServiceCollection services,
            Action<EnterpriseAnalyticsOptions> configure)
        {
            services.Configure(configure);
            services.AddSingleton<IEnterpriseAnalyticsService, EnterpriseAnalyticsService>();
            return services;
        }
    }
}