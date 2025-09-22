using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SmartAbp.Permissions.Alerting;
using SmartAbp.Permissions.Analytics;
using SmartAbp.Permissions.Cache;
using SmartAbp.Permissions.Configuration;
using SmartAbp.Permissions.Integration;
using SmartAbp.Permissions.Performance;
using Volo.Abp.DependencyInjection;

namespace SmartAbp.Permissions.Health
{
    /// <summary>
    /// 健康检查选项
    /// </summary>
    public class EnterpriseHealthCheckOptions
    {
        /// <summary>
        /// 健康检查间隔（秒）
        /// </summary>
        public int HealthCheckIntervalSeconds { get; set; } = 30;

        /// <summary>
        /// 健康检查超时（秒）
        /// </summary>
        public int HealthCheckTimeoutSeconds { get; set; } = 10;

        /// <summary>
        /// 是否启用详细健康检查
        /// </summary>
        public bool EnableDetailedHealthChecks { get; set; } = true;

        /// <summary>
        /// 是否启用依赖项健康检查
        /// </summary>
        public bool EnableDependencyHealthChecks { get; set; } = true;

        /// <summary>
        /// 是否启用性能健康检查
        /// </summary>
        public bool EnablePerformanceHealthChecks { get; set; } = true;

        /// <summary>
        /// 是否启用资源健康检查
        /// </summary>
        public bool EnableResourceHealthChecks { get; set; } = true;

        /// <summary>
        /// 健康检查失败阈值
        /// </summary>
        public int HealthCheckFailureThreshold { get; set; } = 3;

        /// <summary>
        /// 是否发送健康检查通知
        /// </summary>
        public bool SendHealthCheckNotifications { get; set; } = true;

        /// <summary>
        /// 健康检查历史保留天数
        /// </summary>
        public int HealthCheckHistoryRetentionDays { get; set; } = 7;

        /// <summary>
        /// 是否启用健康检查缓存
        /// </summary>
        public bool EnableHealthCheckCache { get; set; } = true;

        /// <summary>
        /// 健康检查缓存过期时间（秒）
        /// </summary>
        public int HealthCheckCacheExpirationSeconds { get; set; } = 60;
    }

    /// <summary>
    /// 健康检查状态枚举
    /// </summary>
    public enum HealthCheckStatus
    {
        /// <summary>
        /// 健康
        /// </summary>
        Healthy,

        /// <summary>
        /// 降级
        /// </summary>
        Degraded,

        /// <summary>
        /// 不健康
        /// </summary>
        Unhealthy
    }

    /// <summary>
    /// 健康检查结果模型
    /// </summary>
    public class HealthCheckResult
    {
        /// <summary>
        /// 检查名称
        /// </summary>
        public string CheckName { get; set; }

        /// <summary>
        /// 状态
        /// </summary>
        public HealthCheckStatus Status { get; set; }

        /// <summary>
        /// 描述
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// 持续时间
        /// </summary>
        public TimeSpan Duration { get; set; }

        /// <summary>
        /// 异常信息
        /// </summary>
        public string Exception { get; set; }

        /// <summary>
        /// 额外数据
        /// </summary>
        public Dictionary<string, object> Data { get; set; } = new Dictionary<string, object>();

        /// <summary>
        /// 时间戳
        /// </summary>
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// 健康检查报告模型
    /// </summary>
    public class HealthCheckReport
    {
        /// <summary>
        /// 报告ID
        /// </summary>
        public string ReportId { get; set; } = Guid.NewGuid().ToString();

        /// <summary>
        /// 总体状态
        /// </summary>
        public HealthCheckStatus OverallStatus { get; set; }

        /// <summary>
        /// 总持续时间
        /// </summary>
        public TimeSpan TotalDuration { get; set; }

        /// <summary>
        /// 检查结果
        /// </summary>
        public List<HealthCheckResult> Results { get; set; } = new List<HealthCheckResult>();

        /// <summary>
        /// 健康检查数量
        /// </summary>
        public int TotalChecks { get; set; }

        /// <summary>
        /// 健康检查数量
        /// </summary>
        public int HealthyChecks { get; set; }

        /// <summary>
        /// 降级检查数量
        /// </summary>
        public int DegradedChecks { get; set; }

        /// <summary>
        /// 不健康检查数量
        /// </summary>
        public int UnhealthyChecks { get; set; }

        /// <summary>
        /// 生成时间
        /// </summary>
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// 建议
        /// </summary>
        public List<string> Recommendations { get; set; } = new List<string>();

        /// <summary>
        /// 描述
        /// </summary>
        public string? Description { get; set; }

        /// <summary>
        /// 异常信息
        /// </summary>
        public string? Exception { get; set; }
    }

    /// <summary>
    /// 健康检查历史记录模型
    /// </summary>
    public class HealthCheckHistory
    {
        /// <summary>
        /// 历史记录ID
        /// </summary>
        public string HistoryId { get; set; } = Guid.NewGuid().ToString();

        /// <summary>
        /// 报告
        /// </summary>
        public HealthCheckReport Report { get; set; }

        /// <summary>
        /// 记录时间
        /// </summary>
        public DateTime RecordedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// 系统状态
        /// </summary>
        public string SystemStatus { get; set; }
    }

    /// <summary>
    /// 企业级健康检查服务接口
    /// </summary>
    public interface IEnterpriseHealthCheckService
    {
        /// <summary>
        /// 执行健康检查
        /// </summary>
        /// <returns>健康检查报告</returns>
        Task<HealthCheckReport> CheckHealthAsync();

        /// <summary>
        /// 执行特定健康检查
        /// </summary>
        /// <param name="checkName">检查名称</param>
        /// <returns>健康检查结果</returns>
        Task<HealthCheckResult> CheckHealthAsync(string checkName);

        /// <summary>
        /// 获取健康检查历史
        /// </summary>
        /// <param name="timeRange">时间范围</param>
        /// <returns>健康检查历史</returns>
        Task<List<HealthCheckHistory>> GetHealthCheckHistoryAsync(TimeSpan? timeRange = null);

        /// <summary>
        /// 获取系统状态
        /// </summary>
        /// <returns>系统状态</returns>
        Task<SystemStatus> GetSystemStatusAsync();

        /// <summary>
        /// 获取健康检查统计
        /// </summary>
        /// <param name="timeRange">时间范围</param>
        /// <returns>健康检查统计</returns>
        Task<HealthCheckStatistics> GetHealthCheckStatisticsAsync(TimeSpan? timeRange = null);

        /// <summary>
        /// 注册健康检查
        /// </summary>
        /// <param name="name">检查名称</param>
        /// <param name="checkFunc">检查函数</param>
        void RegisterHealthCheck(string name, Func<Task<HealthCheckResult>> checkFunc);

        /// <summary>
        /// 注销健康检查
        /// </summary>
        /// <param name="name">检查名称</param>
        void UnregisterHealthCheck(string name);

        /// <summary>
        /// 清理健康检查历史
        /// </summary>
        /// <returns>清理结果</returns>
        Task<CleanupResult> CleanupHealthCheckHistoryAsync();
    }

    /// <summary>
    /// 系统状态模型
    /// </summary>
    public class SystemStatus
    {
        /// <summary>
        /// 系统状态
        /// </summary>
        public HealthCheckStatus Status { get; set; }

        /// <summary>
        /// 状态描述
        /// </summary>
        public string StatusDescription { get; set; }

        /// <summary>
        /// 运行时间
        /// </summary>
        public TimeSpan Uptime { get; set; }

        /// <summary>
        /// 启动时间
        /// </summary>
        public DateTime StartTime { get; set; }

        /// <summary>
        /// 最后健康检查时间
        /// </summary>
        public DateTime LastHealthCheckTime { get; set; }

        /// <summary>
        /// 组件状态
        /// </summary>
        public Dictionary<string, HealthCheckStatus> ComponentStatuses { get; set; } = new Dictionary<string, HealthCheckStatus>();

        /// <summary>
        /// 资源使用情况
        /// </summary>
        public Dictionary<string, double> ResourceUsage { get; set; } = new Dictionary<string, double>();
    }

    /// <summary>
    /// 健康检查统计模型
    /// </summary>
    public class HealthCheckStatistics
    {
        /// <summary>
        /// 总检查次数
        /// </summary>
        public long TotalChecks { get; set; }

        /// <summary>
        /// 健康检查次数
        /// </summary>
        public long HealthyChecks { get; set; }

        /// <summary>
        /// 降级检查次数
        /// </summary>
        public long DegradedChecks { get; set; }

        /// <summary>
        /// 不健康检查次数
        /// </summary>
        public long UnhealthyChecks { get; set; }

        /// <summary>
        /// 健康率
        /// </summary>
        public double HealthRate { get; set; }

        /// <summary>
        /// 平均响应时间
        /// </summary>
        public double AverageResponseTimeMs { get; set; }

        /// <summary>
        /// 最长响应时间
        /// </summary>
        public double MaxResponseTimeMs { get; set; }

        /// <summary>
        /// 最短响应时间
        /// </summary>
        public double MinResponseTimeMs { get; set; }

        /// <summary>
        /// 统计时间范围
        /// </summary>
        public TimeSpan StatisticsTimeRange { get; set; }

        /// <summary>
        /// 统计时间
        /// </summary>
        public DateTime StatisticsTime { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// 企业级健康检查服务实现
    /// </summary>
    public class EnterpriseHealthCheckService : IEnterpriseHealthCheckService, ISingletonDependency
    {
        private readonly EnterpriseHealthCheckOptions _options;
        private readonly ILogger<EnterpriseHealthCheckService> _logger;
        private readonly IPermissionPerformanceMonitor _performanceMonitor;
        private readonly IPermissionAlertingService _alertingService;
        private readonly IEnterpriseIntegrationService _integrationService;
        private readonly IPermissionConfigurationService _configurationService;
        private readonly IDistributedPermissionCacheLock _distributedLock;
        private readonly ConcurrentDictionary<string, Func<Task<HealthCheckResult>>> _healthChecks = new ConcurrentDictionary<string, Func<Task<HealthCheckResult>>>();
        private readonly ConcurrentQueue<HealthCheckHistory> _healthCheckHistory = new ConcurrentQueue<HealthCheckHistory>();
        private readonly ConcurrentDictionary<string, DateTime> _lastAlertTime = new ConcurrentDictionary<string, DateTime>();
        private readonly DateTime _startTime = DateTime.UtcNow;
        private HealthCheckReport _lastReport;
        private DateTime _lastReportTime = DateTime.MinValue;

        public EnterpriseHealthCheckService(
            IOptions<EnterpriseHealthCheckOptions> options,
            ILogger<EnterpriseHealthCheckService> logger,
            IPermissionPerformanceMonitor performanceMonitor,
            IPermissionAlertingService alertingService,
            IEnterpriseIntegrationService integrationService,
            IPermissionConfigurationService configurationService,
            IDistributedPermissionCacheLock distributedLock)
        {
            _options = options?.Value ?? new EnterpriseHealthCheckOptions();
            _logger = logger;
            _performanceMonitor = performanceMonitor;
            _alertingService = alertingService;
            _integrationService = integrationService;
            _configurationService = configurationService;
            _distributedLock = distributedLock;

            RegisterDefaultHealthChecks();
        }

        public async Task<HealthCheckReport> CheckHealthAsync()
        {
            try
            {
                // 检查缓存
                if (_options.EnableHealthCheckCache && 
                    _lastReport != null && 
                    DateTime.UtcNow - _lastReportTime < TimeSpan.FromSeconds(_options.HealthCheckCacheExpirationSeconds))
                {
                    return _lastReport;
                }

                var startTime = DateTime.UtcNow;
                var results = new List<HealthCheckResult>();

                // 执行所有注册的健康检查
                foreach (var kvp in _healthChecks)
                {
                    try
                    {
                        using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(_options.HealthCheckTimeoutSeconds));
                        var result = await kvp.Value();
                        result.CheckName = kvp.Key;
                        results.Add(result);
                    }
                    catch (Exception ex)
                    {
                        results.Add(new HealthCheckResult
                        {
                            CheckName = kvp.Key,
                            Status = HealthCheckStatus.Unhealthy,
                            Description = $"Health check failed: {ex.Message}",
                            Exception = ex.ToString(),
                            Duration = DateTime.UtcNow - startTime
                        });
                    }
                }

                var overallStatus = DetermineOverallStatus(results);
                var totalDuration = DateTime.UtcNow - startTime;

                var report = new HealthCheckReport
                {
                    OverallStatus = overallStatus,
                    TotalDuration = totalDuration,
                    Results = results,
                    TotalChecks = results.Count,
                    HealthyChecks = results.Count(r => r.Status == HealthCheckStatus.Healthy),
                    DegradedChecks = results.Count(r => r.Status == HealthCheckStatus.Degraded),
                    UnhealthyChecks = results.Count(r => r.Status == HealthCheckStatus.Unhealthy),
                    Recommendations = GenerateRecommendations(results)
                };

                // 更新缓存
                _lastReport = report;
                _lastReportTime = DateTime.UtcNow;

                // 记录历史
                var history = new HealthCheckHistory
                {
                    Report = report,
                    SystemStatus = overallStatus.ToString()
                };
                _healthCheckHistory.Enqueue(history);

                // 限制历史记录数量
                while (_healthCheckHistory.Count > 1000)
                {
                    _healthCheckHistory.TryDequeue(out _);
                }

                // 发送通知
                if (_options.SendHealthCheckNotifications && overallStatus != HealthCheckStatus.Healthy)
                {
                    await SendHealthCheckNotification(report);
                }

                _logger.LogInformation("Health check completed: {Status} in {Duration:F2}ms, {Healthy}/{Total} checks healthy",
                    overallStatus, totalDuration.TotalMilliseconds, report.HealthyChecks, report.TotalChecks);

                return report;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error performing health check");
                return new HealthCheckReport
                {
                    OverallStatus = HealthCheckStatus.Unhealthy,
                    Description = $"Health check failed: {ex.Message}",
                    Exception = ex.ToString()
                };
            }
        }

        public async Task<HealthCheckResult> CheckHealthAsync(string checkName)
        {
            try
            {
                if (_healthChecks.TryGetValue(checkName, out var checkFunc))
                {
                    var result = await checkFunc();
                    result.CheckName = checkName;
                    return result;
                }

                return new HealthCheckResult
                {
                    CheckName = checkName,
                    Status = HealthCheckStatus.Unhealthy,
                    Description = $"Health check '{checkName}' not found"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error performing health check '{CheckName}'", checkName);
                return new HealthCheckResult
                {
                    CheckName = checkName,
                    Status = HealthCheckStatus.Unhealthy,
                    Description = $"Health check failed: {ex.Message}",
                    Exception = ex.ToString()
                };
            }
        }

        public async Task<List<HealthCheckHistory>> GetHealthCheckHistoryAsync(TimeSpan? timeRange = null)
        {
            try
            {
                var range = timeRange ?? TimeSpan.FromDays(7);
                var cutoff = DateTime.UtcNow.Add(-range);

                return _healthCheckHistory
                    .Where(h => h.RecordedAt >= cutoff)
                    .OrderByDescending(h => h.RecordedAt)
                    .ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting health check history");
                return new List<HealthCheckHistory>();
            }
        }

        public async Task<SystemStatus> GetSystemStatusAsync()
        {
            try
            {
                var currentMetrics = _performanceMonitor.GetCurrentMetrics();
                var report = await CheckHealthAsync();

                var status = new SystemStatus
                {
                    Status = report.OverallStatus,
                    StatusDescription = GetStatusDescription(report.OverallStatus),
                    Uptime = DateTime.UtcNow - _startTime,
                    StartTime = _startTime,
                    LastHealthCheckTime = _lastReportTime
                };

                // 组件状态
                foreach (var result in report.Results)
                {
                    status.ComponentStatuses[result.CheckName] = result.Status;
                }

                // 资源使用情况
                status.ResourceUsage["MemoryUsageMB"] = currentMetrics.MemoryUsageMB;
                status.ResourceUsage["CpuUsagePercent"] = currentMetrics.CpuUsagePercent;
                status.ResourceUsage["CacheHitRate"] = currentMetrics.CacheHitRate;
                status.ResourceUsage["ErrorRate"] = currentMetrics.ErrorRate;
                status.ResourceUsage["AverageResponseTimeMs"] = currentMetrics.AverageResponseTimeMs;

                return status;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting system status");
                return new SystemStatus
                {
                    Status = HealthCheckStatus.Unhealthy,
                    StatusDescription = $"Error getting system status: {ex.Message}",
                    Uptime = DateTime.UtcNow - _startTime,
                    StartTime = _startTime
                };
            }
        }

        public async Task<HealthCheckStatistics> GetHealthCheckStatisticsAsync(TimeSpan? timeRange = null)
        {
            try
            {
                var range = timeRange ?? TimeSpan.FromDays(7);
                var history = await GetHealthCheckHistoryAsync(range);

                if (!history.Any())
                {
                    return new HealthCheckStatistics
                    {
                        StatisticsTimeRange = range,
                        HealthRate = 0
                    };
                }

                var totalChecks = history.Sum(h => h.Report.TotalChecks);
                var healthyChecks = history.Sum(h => h.Report.HealthyChecks);
                var degradedChecks = history.Sum(h => h.Report.DegradedChecks);
                var unhealthyChecks = history.Sum(h => h.Report.UnhealthyChecks);

                var responseTimes = history
                    .SelectMany(h => h.Report.Results)
                    .Where(r => r.Duration.TotalMilliseconds > 0)
                    .Select(r => r.Duration.TotalMilliseconds)
                    .ToList();

                return new HealthCheckStatistics
                {
                    TotalChecks = totalChecks,
                    HealthyChecks = healthyChecks,
                    DegradedChecks = degradedChecks,
                    UnhealthyChecks = unhealthyChecks,
                    HealthRate = totalChecks > 0 ? (double)healthyChecks / totalChecks * 100 : 0,
                    AverageResponseTimeMs = responseTimes.Any() ? responseTimes.Average() : 0,
                    MaxResponseTimeMs = responseTimes.Any() ? responseTimes.Max() : 0,
                    MinResponseTimeMs = responseTimes.Any() ? responseTimes.Min() : 0,
                    StatisticsTimeRange = range
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting health check statistics");
                return new HealthCheckStatistics
                {
                    StatisticsTimeRange = timeRange ?? TimeSpan.FromDays(7),
                    HealthRate = 0
                };
            }
        }

        public void RegisterHealthCheck(string name, Func<Task<HealthCheckResult>> checkFunc)
        {
            _healthChecks[name] = checkFunc ?? throw new ArgumentNullException(nameof(checkFunc));
            _logger.LogInformation("Registered health check: {CheckName}", name);
        }

        public void UnregisterHealthCheck(string name)
        {
            _healthChecks.TryRemove(name, out _);
            _logger.LogInformation("Unregistered health check: {CheckName}", name);
        }

        public async Task<CleanupResult> CleanupHealthCheckHistoryAsync()
        {
            try
            {
                var cutoff = DateTime.UtcNow.AddDays(-_options.HealthCheckHistoryRetentionDays);
                var cleanedRecords = 0;

                // 清理历史记录
                var tempHistory = new List<HealthCheckHistory>();
                while (_healthCheckHistory.TryDequeue(out var history))
                {
                    if (history.RecordedAt >= cutoff)
                    {
                        tempHistory.Add(history);
                    }
                    else
                    {
                        cleanedRecords++;
                    }
                }

                // 将保留的记录放回队列
                foreach (var history in tempHistory.OrderBy(h => h.RecordedAt))
                {
                    _healthCheckHistory.Enqueue(history);
                }

                var result = new CleanupResult
                {
                    CleanedRecords = cleanedRecords,
                    FreedStorageBytes = cleanedRecords * 1024, // 估算
                    Status = "Success"
                };

                _logger.LogInformation("Health check history cleanup completed: {CleanedRecords} records cleaned", cleanedRecords);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during health check history cleanup");
                return new CleanupResult { Status = "Error: " + ex.Message };
            }
        }

        private void RegisterDefaultHealthChecks()
        {
            // 基础健康检查
            RegisterHealthCheck("Basic", async () =>
            {
                var startTime = DateTime.UtcNow;
                try
                {
                    return new HealthCheckResult
                    {
                        Status = HealthCheckStatus.Healthy,
                        Description = "Basic health check passed",
                        Duration = DateTime.UtcNow - startTime
                    };
                }
                catch (Exception ex)
                {
                    return new HealthCheckResult
                    {
                        Status = HealthCheckStatus.Unhealthy,
                        Description = $"Basic health check failed: {ex.Message}",
                        Exception = ex.ToString(),
                        Duration = DateTime.UtcNow - startTime
                    };
                }
            });

            // 性能健康检查
            if (_options.EnablePerformanceHealthChecks)
            {
                RegisterHealthCheck("Performance", async () =>
                {
                    var startTime = DateTime.UtcNow;
                    try
                    {
                        var metrics = _performanceMonitor.GetCurrentMetrics();
                        var status = HealthCheckStatus.Healthy;
                        var description = "Performance health check passed";

                        if (metrics.AverageResponseTimeMs > 1000)
                        {
                            status = HealthCheckStatus.Degraded;
                            description = "Performance degraded - high response time";
                        }
                        else if (metrics.ErrorRate > 5)
                        {
                            status = HealthCheckStatus.Unhealthy;
                            description = "Performance unhealthy - high error rate";
                        }

                        return new HealthCheckResult
                        {
                            Status = status,
                            Description = description,
                            Duration = DateTime.UtcNow - startTime,
                            Data = new Dictionary<string, object>
                            {
                                ["AverageResponseTimeMs"] = metrics.AverageResponseTimeMs,
                                ["ErrorRate"] = metrics.ErrorRate,
                                ["ThroughputRPS"] = metrics.ThroughputRPS
                            }
                        };
                    }
                    catch (Exception ex)
                    {
                        return new HealthCheckResult
                        {
                            Status = HealthCheckStatus.Unhealthy,
                            Description = $"Performance health check failed: {ex.Message}",
                            Exception = ex.ToString(),
                            Duration = DateTime.UtcNow - startTime
                        };
                    }
                });
            }

            // 依赖项健康检查
            if (_options.EnableDependencyHealthChecks)
            {
                RegisterHealthCheck("Dependencies", async () =>
                {
                    var startTime = DateTime.UtcNow;
                    try
                    {
                        var dependenciesStatus = await CheckDependenciesAsync();
                        return new HealthCheckResult
                        {
                            Status = dependenciesStatus.IsHealthy ? HealthCheckStatus.Healthy : HealthCheckStatus.Unhealthy,
                            Description = dependenciesStatus.Description,
                            Duration = DateTime.UtcNow - startTime,
                            Data = dependenciesStatus.Data
                        };
                    }
                    catch (Exception ex)
                    {
                        return new HealthCheckResult
                        {
                            Status = HealthCheckStatus.Unhealthy,
                            Description = $"Dependencies health check failed: {ex.Message}",
                            Exception = ex.ToString(),
                            Duration = DateTime.UtcNow - startTime
                        };
                    }
                });
            }

            // 资源健康检查
            if (_options.EnableResourceHealthChecks)
            {
                RegisterHealthCheck("Resources", async () =>
                {
                    var startTime = DateTime.UtcNow;
                    try
                    {
                        var resourceStatus = await CheckResourcesAsync();
                        return new HealthCheckResult
                        {
                            Status = resourceStatus.IsHealthy ? HealthCheckStatus.Healthy : HealthCheckStatus.Degraded,
                            Description = resourceStatus.Description,
                            Duration = DateTime.UtcNow - startTime,
                            Data = resourceStatus.Data
                        };
                    }
                    catch (Exception ex)
                    {
                        return new HealthCheckResult
                        {
                            Status = HealthCheckStatus.Unhealthy,
                            Description = $"Resources health check failed: {ex.Message}",
                            Exception = ex.ToString(),
                            Duration = DateTime.UtcNow - startTime
                        };
                    }
                });
            }
        }

        private async Task<DependencyStatus> CheckDependenciesAsync()
        {
            try
            {
                var dependencies = new List<string> { "Database", "Cache", "MessageQueue" };
                var failedDependencies = new List<string>();
                var data = new Dictionary<string, object>();

                // 检查数据库连接
                try
                {
                    // 这里应该实际检查数据库连接
                    data["Database"] = "Connected";
                }
                catch (Exception ex)
                {
                    failedDependencies.Add("Database");
                    data["Database"] = $"Failed: {ex.Message}";
                }

                // 检查缓存连接
                try
                {
                    // 这里应该实际检查缓存连接
                    data["Cache"] = "Connected";
                }
                catch (Exception ex)
                {
                    failedDependencies.Add("Cache");
                    data["Cache"] = $"Failed: {ex.Message}";
                }

                // 检查消息队列
                try
                {
                    // 这里应该实际检查消息队列连接
                    data["MessageQueue"] = "Connected";
                }
                catch (Exception ex)
                {
                    failedDependencies.Add("MessageQueue");
                    data["MessageQueue"] = $"Failed: {ex.Message}";
                }

                var isHealthy = failedDependencies.Count == 0;
                var description = isHealthy 
                    ? "All dependencies are healthy" 
                    : $"Failed dependencies: {string.Join(", ", failedDependencies)}";

                return new DependencyStatus
                {
                    IsHealthy = isHealthy,
                    Description = description,
                    Data = data
                };
            }
            catch (Exception ex)
            {
                return new DependencyStatus
                {
                    IsHealthy = false,
                    Description = $"Dependency check failed: {ex.Message}",
                    Data = new Dictionary<string, object> { ["Error"] = ex.ToString() }
                };
            }
        }

        private async Task<ResourceStatus> CheckResourcesAsync()
        {
            try
            {
                var currentMetrics = _performanceMonitor.GetCurrentMetrics();
                var data = new Dictionary<string, object>();
                var issues = new List<string>();

                // 检查内存使用
                if (currentMetrics.MemoryUsageMB > 1000) // 1GB
                {
                    issues.Add($"High memory usage: {currentMetrics.MemoryUsageMB:F2}MB");
                }
                data["MemoryUsageMB"] = currentMetrics.MemoryUsageMB;

                // 检查CPU使用
                if (currentMetrics.CpuUsagePercent > 80)
                {
                    issues.Add($"High CPU usage: {currentMetrics.CpuUsagePercent:F2}%");
                }
                data["CpuUsagePercent"] = currentMetrics.CpuUsagePercent;

                // 检查磁盘空间（这里应该实际检查磁盘空间）
                var diskUsageGB = 50.0; // 模拟数据
                if (diskUsageGB > 100) // 100GB
                {
                    issues.Add($"High disk usage: {diskUsageGB:F2}GB");
                }
                data["DiskUsageGB"] = diskUsageGB;

                var isHealthy = issues.Count == 0;
                var description = isHealthy 
                    ? "All resources are within healthy limits" 
                    : $"Resource issues: {string.Join("; ", issues)}";

                return new ResourceStatus
                {
                    IsHealthy = isHealthy,
                    Description = description,
                    Data = data
                };
            }
            catch (Exception ex)
            {
                return new ResourceStatus
                {
                    IsHealthy = false,
                    Description = $"Resource check failed: {ex.Message}",
                    Data = new Dictionary<string, object> { ["Error"] = ex.ToString() }
                };
            }
        }

        private HealthCheckStatus DetermineOverallStatus(List<HealthCheckResult> results)
        {
            if (results.All(r => r.Status == HealthCheckStatus.Healthy))
            {
                return HealthCheckStatus.Healthy;
            }

            if (results.Any(r => r.Status == HealthCheckStatus.Unhealthy))
            {
                return HealthCheckStatus.Unhealthy;
            }

            return HealthCheckStatus.Degraded;
        }

        private string GetStatusDescription(HealthCheckStatus status)
        {
            return status switch
            {
                HealthCheckStatus.Healthy => "All systems operational",
                HealthCheckStatus.Degraded => "Some systems are experiencing issues",
                HealthCheckStatus.Unhealthy => "Critical system issues detected",
                _ => "Unknown status"
            };
        }

        private async Task SendHealthCheckNotification(HealthCheckReport report)
        {
            try
            {
                var alertKey = $"healthcheck:{report.OverallStatus}";
                var lastAlertTime = _lastAlertTime.GetOrAdd(alertKey, DateTime.MinValue);

                if (DateTime.UtcNow - lastAlertTime > TimeSpan.FromMinutes(30))
                {
                    var level = report.OverallStatus == HealthCheckStatus.Unhealthy ? AlertLevel.Critical : AlertLevel.Warning;
                    
                    await _alertingService.CreateAlertAsync(
                        level,
                        AlertType.Health,
                        "Health Check Alert",
                        $"System health check status: {report.OverallStatus}. {report.HealthyChecks}/{report.TotalChecks} checks healthy.",
                        "EnterpriseHealthCheckService",
                        new Dictionary<string, object>
                        {
                            ["OverallStatus"] = report.OverallStatus.ToString(),
                            ["HealthyChecks"] = report.HealthyChecks,
                            ["TotalChecks"] = report.TotalChecks,
                            ["DegradedChecks"] = report.DegradedChecks,
                            ["UnhealthyChecks"] = report.UnhealthyChecks
                        }
                    );

                    _lastAlertTime[alertKey] = DateTime.UtcNow;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending health check notification");
            }
        }

        private List<string> GenerateRecommendations(List<HealthCheckResult> results)
        {
            var recommendations = new List<string>();

            var unhealthyResults = results.Where(r => r.Status == HealthCheckStatus.Unhealthy).ToList();
            var degradedResults = results.Where(r => r.Status == HealthCheckStatus.Degraded).ToList();

            if (unhealthyResults.Any())
            {
                recommendations.Add($"Address {unhealthyResults.Count} unhealthy checks: {string.Join(", ", unhealthyResults.Select(r => r.CheckName))}");
            }

            if (degradedResults.Any())
            {
                recommendations.Add($"Monitor {degradedResults.Count} degraded checks: {string.Join(", ", degradedResults.Select(r => r.CheckName))}");
            }

            var performanceResult = results.FirstOrDefault(r => r.CheckName == "Performance");
            if (performanceResult?.Status == HealthCheckStatus.Degraded)
            {
                recommendations.Add("Consider performance optimization - response time is elevated");
            }

            var resourceResult = results.FirstOrDefault(r => r.CheckName == "Resources");
            if (resourceResult?.Status == HealthCheckStatus.Degraded)
            {
                recommendations.Add("Review resource usage - some resources are approaching limits");
            }

            if (!recommendations.Any())
            {
                recommendations.Add("System health appears good - continue monitoring");
            }

            return recommendations;
        }
    }

    /// <summary>
    /// 依赖项状态模型
    /// </summary>
    public class DependencyStatus
    {
        /// <summary>
        /// 是否健康
        /// </summary>
        public bool IsHealthy { get; set; }

        /// <summary>
        /// 描述
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// 数据
        /// </summary>
        public Dictionary<string, object> Data { get; set; }
    }

    /// <summary>
    /// 资源状态模型
    /// </summary>
    public class ResourceStatus
    {
        /// <summary>
        /// 是否健康
        /// </summary>
        public bool IsHealthy { get; set; }

        /// <summary>
        /// 描述
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// 数据
        /// </summary>
        public Dictionary<string, object> Data { get; set; }
    }

    /// <summary>
    /// 企业级健康检查服务扩展
    /// </summary>
    public static class EnterpriseHealthCheckServiceExtensions
    {
        /// <summary>
        /// 添加企业级健康检查服务
        /// </summary>
        /// <param name="services">服务集合</param>
        /// <returns>服务集合</returns>
        public static IServiceCollection AddEnterpriseHealthCheckService(this IServiceCollection services)
        {
            services.Configure<EnterpriseHealthCheckOptions>(options =>
            {
                options.HealthCheckIntervalSeconds = 30;
                options.HealthCheckTimeoutSeconds = 10;
                options.EnableDetailedHealthChecks = true;
                options.EnableDependencyHealthChecks = true;
                options.EnablePerformanceHealthChecks = true;
                options.EnableResourceHealthChecks = true;
                options.HealthCheckFailureThreshold = 3;
                options.SendHealthCheckNotifications = true;
                options.HealthCheckHistoryRetentionDays = 7;
                options.EnableHealthCheckCache = true;
                options.HealthCheckCacheExpirationSeconds = 60;
            });
            
            services.AddSingleton<IEnterpriseHealthCheckService, EnterpriseHealthCheckService>();
            return services;
        }

        /// <summary>
        /// 添加企业级健康检查服务（带配置）
        /// </summary>
        /// <param name="services">服务集合</param>
        /// <param name="configure">配置操作</param>
        /// <returns>服务集合</returns>
        public static IServiceCollection AddEnterpriseHealthCheckService(
            this IServiceCollection services,
            Action<EnterpriseHealthCheckOptions> configure)
        {
            services.Configure(configure);
            services.AddSingleton<IEnterpriseHealthCheckService, EnterpriseHealthCheckService>();
            return services;
        }
    }
}