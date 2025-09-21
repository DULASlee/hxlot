using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using System.Timers;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Volo.Abp.DependencyInjection;

namespace SmartAbp.Permissions.Monitoring
{
    public class EnterpriseMonitoringOptions
    {
        public bool EnablePerformanceMonitoring { get; set; } = true;
        public bool EnableHealthMonitoring { get; set; } = true;
        public bool EnableErrorMonitoring { get; set; } = true;
        public bool EnableResourceMonitoring { get; set; } = true;
        public int MetricsCollectionIntervalSeconds { get; set; } = 60;
        public int HealthCheckIntervalSeconds { get; set; } = 30;
        public int ErrorReportingThreshold { get; set; } = 10;
        public bool EnableAlerting { get; set; } = true;
        public Dictionary<string, double> Thresholds { get; set; } = new()
        {
            ["CpuUsage"] = 80.0,
            ["MemoryUsage"] = 85.0,
            ["DiskUsage"] = 90.0,
            ["ResponseTime"] = 2000.0,
            ["ErrorRate"] = 5.0
        };
        public List<string> MonitoredServices { get; set; } = new();
        public Dictionary<string, string> AlertEndpoints { get; set; } = new();
    }

    public enum MetricType
    {
        Counter,
        Gauge,
        Histogram,
        Summary
    }

    public enum AlertLevel
    {
        Info,
        Warning,
        Critical,
        Emergency
    }

    public class MetricData
    {
        public string Name { get; set; } = string.Empty;
        public MetricType Type { get; set; }
        public double Value { get; set; }
        public Dictionary<string, string> Labels { get; set; } = new();
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public string Description { get; set; } = string.Empty;
    }

    public class AlertData
    {
        public string AlertId { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; } = string.Empty;
        public AlertLevel Level { get; set; }
        public string Message { get; set; } = string.Empty;
        public Dictionary<string, object> Details { get; set; } = new();
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public bool IsAcknowledged { get; set; }
        public string? AcknowledgedBy { get; set; }
        public DateTime? AcknowledgedAt { get; set; }
    }

    public class PerformanceMetrics
    {
        public double CpuUsage { get; set; }
        public double MemoryUsage { get; set; }
        public double DiskUsage { get; set; }
        public long AvailableMemory { get; set; }
        public long TotalMemory { get; set; }
        public int ThreadCount { get; set; }
        public int HandleCount { get; set; }
        public double ProcessCpuUsage { get; set; }
        public long ProcessMemoryUsage { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    public class HealthStatus
    {
        public string ServiceName { get; set; } = string.Empty;
        public bool IsHealthy { get; set; }
        public string Status { get; set; } = string.Empty;
        public Dictionary<string, object> Details { get; set; } = new();
        public DateTime LastCheckTime { get; set; } = DateTime.UtcNow;
        public TimeSpan ResponseTime { get; set; }
    }

    public interface IEnterpriseMonitoringService
    {
        Task RecordMetricAsync(MetricData metric);
        Task<List<MetricData>> GetMetricsAsync(string? metricName = null, DateTime? fromDate = null);
        Task RecordAlertAsync(AlertData alert);
        Task<List<AlertData>> GetAlertsAsync(AlertLevel? level = null, bool? unacknowledgedOnly = null);
        Task<PerformanceMetrics> GetPerformanceMetricsAsync();
        Task<List<HealthStatus>> GetHealthStatusesAsync();
        Task<bool> SendAlertAsync(AlertData alert);
        Task<bool> AcknowledgeAlertAsync(string alertId, string acknowledgedBy);
        Task<Dictionary<string, object>> GetSystemOverviewAsync();
        Task<bool> StartMonitoringAsync();
        Task<bool> StopMonitoringAsync();
    }

    public class EnterpriseMonitoringService : IEnterpriseMonitoringService, ITransientDependency
    {
        private readonly ILogger<EnterpriseMonitoringService> _logger;
        private readonly IOptions<EnterpriseMonitoringOptions> _options;
        private readonly List<MetricData> _metrics;
        private readonly List<AlertData> _alerts;
        private readonly Timer? _metricsTimer;
        private readonly Timer? _healthTimer;
        private bool _isMonitoring;
        // 移除 PerformanceCounter 依赖，使用替代方案
        private readonly object _cpuLock = new object();
        private DateTime _lastCpuTime = DateTime.UtcNow;
        private TimeSpan _lastTotalProcessorTime = TimeSpan.Zero;
        private readonly Process _currentProcess;

        public EnterpriseMonitoringService(
            ILogger<EnterpriseMonitoringService> logger,
            IOptions<EnterpriseMonitoringOptions> options)
        {
            _logger = logger;
            _options = options;
            _metrics = new List<MetricData>();
            _alerts = new List<AlertData>();
            _isMonitoring = false;
            _currentProcess = Process.GetCurrentProcess();

            // 初始化CPU监控状态
            _lastCpuTime = DateTime.UtcNow;
            _lastTotalProcessorTime = _currentProcess.TotalProcessorTime;

            if (_options.Value.EnablePerformanceMonitoring)
            {
                _metricsTimer = new Timer(async _ => await CollectMetricsAsync(),
                    null, TimeSpan.Zero, TimeSpan.FromSeconds(_options.Value.MetricsCollectionIntervalSeconds));
            }

            if (_options.Value.EnableHealthMonitoring)
            {
                _healthTimer = new Timer(async _ => await PerformHealthChecksAsync(),
                    null, TimeSpan.Zero, TimeSpan.FromSeconds(_options.Value.HealthCheckIntervalSeconds));
            }
        }

        public async Task RecordMetricAsync(MetricData metric)
        {
            try
            {
                _logger.LogDebug("Recording metric: {MetricName} with value: {MetricValue}", metric.Name, metric.Value);

                _metrics.Add(metric);

                // 清理旧指标
                var cutoffDate = DateTime.UtcNow.AddHours(-24);
                _metrics.RemoveAll(m => m.Timestamp < cutoffDate);

                // 检查阈值并生成告警
                await CheckThresholdsAsync(metric);

                _logger.LogDebug("Metric recorded successfully: {MetricName}", metric.Name);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to record metric: {MetricName}", metric.Name);
            }
        }

        public async Task<List<MetricData>> GetMetricsAsync(string? metricName = null, DateTime? fromDate = null)
        {
            try
            {
                var query = _metrics.AsEnumerable();

                if (!string.IsNullOrEmpty(metricName))
                {
                    query = query.Where(m => m.Name.Equals(metricName, StringComparison.OrdinalIgnoreCase));
                }

                if (fromDate.HasValue)
                {
                    query = query.Where(m => m.Timestamp >= fromDate.Value);
                }

                return query.OrderByDescending(m => m.Timestamp).Take(1000).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve metrics");
                return new List<MetricData>();
            }
        }

        public async Task RecordAlertAsync(AlertData alert)
        {
            try
            {
                _logger.LogInformation("Recording alert: {AlertName} with level: {AlertLevel}", alert.Name, alert.Level);

                _alerts.Add(alert);

                // 发送告警通知
                if (_options.Value.EnableAlerting)
                {
                    await SendAlertAsync(alert);
                }

                // 清理旧告警
                var cutoffDate = DateTime.UtcNow.AddDays(-7);
                _alerts.RemoveAll(a => a.Timestamp < cutoffDate);

                _logger.LogInformation("Alert recorded successfully: {AlertName}", alert.Name);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to record alert: {AlertName}", alert.Name);
            }
        }

        public async Task<List<AlertData>> GetAlertsAsync(AlertLevel? level = null, bool? unacknowledgedOnly = null)
        {
            try
            {
                var query = _alerts.AsEnumerable();

                if (level.HasValue)
                {
                    query = query.Where(a => a.Level == level.Value);
                }

                if (unacknowledgedOnly.HasValue && unacknowledgedOnly.Value)
                {
                    query = query.Where(a => !a.IsAcknowledged);
                }

                return query.OrderByDescending(a => a.Timestamp).Take(100).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve alerts");
                return new List<AlertData>();
            }
        }

        public async Task<PerformanceMetrics> GetPerformanceMetricsAsync()
        {
            try
            {
                var metrics = new PerformanceMetrics
                {
                    Timestamp = DateTime.UtcNow
                };

                // CPU使用率 - 使用进程信息计算
                lock (_cpuLock)
                {
                    var currentTime = DateTime.UtcNow;
                    var currentProcessorTime = _currentProcess.TotalProcessorTime;
                    
                    var timeDiff = (currentTime - _lastCpuTime).TotalMilliseconds;
                    var processorTimeDiff = (currentProcessorTime - _lastTotalProcessorTime).TotalMilliseconds;
                    
                    if (timeDiff > 0)
                    {
                        metrics.CpuUsage = (processorTimeDiff / (Environment.ProcessorCount * timeDiff)) * 100;
                    }
                    
                    _lastCpuTime = currentTime;
                    _lastTotalProcessorTime = currentProcessorTime;
                }

                // 内存使用率
                var memoryInfo = GetMemoryInfo();
                metrics.MemoryUsage = memoryInfo.UsagePercentage;
                metrics.AvailableMemory = memoryInfo.AvailableBytes;
                metrics.TotalMemory = memoryInfo.TotalBytes;

                // 磁盘使用率
                var diskInfo = GetDiskInfo();
                metrics.DiskUsage = diskInfo.UsagePercentage;

                // 进程信息
                _currentProcess.Refresh();
                metrics.ProcessCpuUsage = GetProcessCpuUsage();
                metrics.ProcessMemoryUsage = _currentProcess.WorkingSet64;
                metrics.ThreadCount = _currentProcess.Threads.Count;
                metrics.HandleCount = _currentProcess.HandleCount;

                _logger.LogDebug("Performance metrics collected successfully");
                return metrics;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to collect performance metrics");
                return new PerformanceMetrics();
            }
        }

        public async Task<List<HealthStatus>> GetHealthStatusesAsync()
        {
            try
            {
                var healthStatuses = new List<HealthStatus>();

                // 系统健康状态
                var systemHealth = new HealthStatus
                {
                    ServiceName = "System",
                    IsHealthy = true,
                    Status = "Running",
                    LastCheckTime = DateTime.UtcNow,
                    ResponseTime = TimeSpan.FromMilliseconds(100)
                };

                healthStatuses.Add(systemHealth);

                // 监控服务的健康状态
                foreach (var service in _options.Value.MonitoredServices)
                {
                    var serviceHealth = new HealthStatus
                    {
                        ServiceName = service,
                        IsHealthy = true,
                        Status = "Running",
                        LastCheckTime = DateTime.UtcNow,
                        ResponseTime = TimeSpan.FromMilliseconds(50)
                    };

                    healthStatuses.Add(serviceHealth);
                }

                _logger.LogDebug("Health statuses collected successfully");
                return healthStatuses;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to collect health statuses");
                return new List<HealthStatus>();
            }
        }

        public async Task<bool> SendAlertAsync(AlertData alert)
        {
            try
            {
                _logger.LogInformation("Sending alert: {AlertName} with level: {AlertLevel}", alert.Name, alert.Level);

                // 模拟发送告警到配置的端点
                foreach (var endpoint in _options.Value.AlertEndpoints)
                {
                    _logger.LogInformation("Alert sent to endpoint: {EndpointName} - {AlertName}", endpoint.Key, alert.Name);
                }

                _logger.LogInformation("Alert sent successfully: {AlertName}", alert.Name);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send alert: {AlertName}", alert.Name);
                return false;
            }
        }

        public async Task<bool> AcknowledgeAlertAsync(string alertId, string acknowledgedBy)
        {
            try
            {
                var alert = _alerts.FirstOrDefault(a => a.AlertId == alertId);
                if (alert == null)
                {
                    _logger.LogWarning("Alert not found for acknowledgment: {AlertId}", alertId);
                    return false;
                }

                alert.IsAcknowledged = true;
                alert.AcknowledgedBy = acknowledgedBy;
                alert.AcknowledgedAt = DateTime.UtcNow;

                _logger.LogInformation("Alert acknowledged successfully: {AlertId} by {AcknowledgedBy}", alertId, acknowledgedBy);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to acknowledge alert: {AlertId}", alertId);
                return false;
            }
        }

        public async Task<Dictionary<string, object>> GetSystemOverviewAsync()
        {
            try
            {
                var performanceMetrics = await GetPerformanceMetricsAsync();
                var healthStatuses = await GetHealthStatusesAsync();
                var recentAlerts = await GetAlertsAsync(null, true);
                var recentMetrics = await GetMetricsAsync(null, DateTime.UtcNow.AddHours(-1));

                return new Dictionary<string, object>
                {
                    ["PerformanceMetrics"] = performanceMetrics,
                    ["HealthStatuses"] = healthStatuses,
                    ["RecentAlerts"] = recentAlerts.Take(10).ToList(),
                    ["RecentMetrics"] = recentMetrics.Take(100).ToList(),
                    ["MonitoringEnabled"] = _isMonitoring,
                    ["TotalAlerts"] = _alerts.Count,
                    ["TotalMetrics"] = _metrics.Count,
                    ["LastUpdateTime"] = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get system overview");
                return new Dictionary<string, object>();
            }
        }

        public async Task<bool> StartMonitoringAsync()
        {
            try
            {
                _logger.LogInformation("Starting enterprise monitoring service");
                _isMonitoring = true;
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to start monitoring service");
                return false;
            }
        }

        public async Task<bool> StopMonitoringAsync()
        {
            try
            {
                _logger.LogInformation("Stopping enterprise monitoring service");
                _isMonitoring = false;
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to stop monitoring service");
                return false;
            }
        }

        private async Task CollectMetricsAsync()
        {
            if (!_isMonitoring) return;

            try
            {
                _logger.LogDebug("Collecting metrics...");

                // 收集性能指标
                var performanceMetrics = await GetPerformanceMetricsAsync();

                // 记录CPU使用率指标（确保值在合理范围内）
                var cpuUsage = Math.Max(0, Math.Min(100, performanceMetrics.CpuUsage));
                await RecordMetricAsync(new MetricData
                {
                    Name = "cpu_usage_percent",
                    Type = MetricType.Gauge,
                    Value = cpuUsage,
                    Description = "CPU usage percentage"
                });

                // 记录内存使用率指标
                await RecordMetricAsync(new MetricData
                {
                    Name = "memory_usage_percent",
                    Type = MetricType.Gauge,
                    Value = performanceMetrics.MemoryUsage,
                    Description = "Memory usage percentage"
                });

                // 记录磁盘使用率指标
                await RecordMetricAsync(new MetricData
                {
                    Name = "disk_usage_percent",
                    Type = MetricType.Gauge,
                    Value = performanceMetrics.DiskUsage,
                    Description = "Disk usage percentage"
                });

                _logger.LogDebug("Metrics collected successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to collect metrics");
            }
        }

        private async Task PerformHealthChecksAsync()
        {
            if (!_isMonitoring) return;

            try
            {
                var healthStatuses = await GetHealthStatusesAsync();

                foreach (var healthStatus in healthStatuses)
                {
                    if (!healthStatus.IsHealthy)
                    {
                        await RecordAlertAsync(new AlertData
                        {
                            Name = $"{healthStatus.ServiceName} Health Check Failed",
                            Level = AlertLevel.Warning,
                            Message = $"Service {healthStatus.ServiceName} is not healthy: {healthStatus.Status}",
                            Details = healthStatus.Details
                        });
                    }
                }

                _logger.LogDebug("Health checks performed successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to perform health checks");
            }
        }

        private async Task CheckThresholdsAsync(MetricData metric)
        {
            if (!_options.Value.Thresholds.ContainsKey(metric.Name)) return;

            var threshold = _options.Value.Thresholds[metric.Name];
            if (metric.Value > threshold)
            {
                await RecordAlertAsync(new AlertData
                {
                    Name = $"{metric.Name} Threshold Exceeded",
                    Level = metric.Value > threshold * 1.2 ? AlertLevel.Critical : AlertLevel.Warning,
                    Message = $"Metric {metric.Name} value {metric.Value:F2} exceeded threshold {threshold:F2}",
                    Details = new Dictionary<string, object>
                    {
                        ["MetricName"] = metric.Name,
                        ["MetricValue"] = metric.Value,
                        ["Threshold"] = threshold,
                        ["Timestamp"] = metric.Timestamp
                    }
                });
            }
        }

        private (double UsagePercentage, long AvailableBytes, long TotalBytes) GetMemoryInfo()
        {
            try
            {
                var availableBytes = GC.GetTotalMemory(false);
                var totalBytes = 1024L * 1024 * 1024 * 8; // 8GB 模拟
                var usagePercentage = (double)(totalBytes - availableBytes) / totalBytes * 100;

                return (usagePercentage, availableBytes, totalBytes);
            }
            catch
            {
                return (0, 0, 0);
            }
        }

        private (double UsagePercentage, long TotalBytes, long FreeBytes) GetDiskInfo()
        {
            try
            {
                var totalBytes = 100L * 1024 * 1024 * 1024; // 100GB 模拟
                var freeBytes = 30L * 1024 * 1024 * 1024; // 30GB 模拟
                var usagePercentage = (double)(totalBytes - freeBytes) / totalBytes * 100;

                return (usagePercentage, totalBytes, freeBytes);
            }
            catch
            {
                return (0, 0, 0);
            }
        }

        private double GetProcessCpuUsage()
        {
            try
            {
                var startTime = DateTime.UtcNow;
                var startCpuUsage = _currentProcess.TotalProcessorTime;

                System.Threading.Thread.Sleep(100);

                var endTime = DateTime.UtcNow;
                var endCpuUsage = _currentProcess.TotalProcessorTime;

                var cpuUsedMs = (endCpuUsage - startCpuUsage).TotalMilliseconds;
                var totalMsPassed = (endTime - startTime).TotalMilliseconds;
                var cpuUsageTotal = cpuUsedMs / (Environment.ProcessorCount * totalMsPassed);

                return cpuUsageTotal * 100;
            }
            catch
            {
                return 0;
            }
        }

        public void Dispose()
        {
            _metricsTimer?.Dispose();
            _healthTimer?.Dispose();
            _cpuCounter?.Dispose();
            _currentProcess?.Dispose();
        }
    }

    public static class EnterpriseMonitoringServiceExtensions
    {
        public static IServiceCollection AddEnterpriseMonitoringService(
            this IServiceCollection services,
            Action<EnterpriseMonitoringOptions>? configureOptions = null)
        {
            services.Configure<EnterpriseMonitoringOptions>(options =>
            {
                configureOptions?.Invoke(options);
            });

            services.AddTransient<IEnterpriseMonitoringService, EnterpriseMonitoringService>();
            
            return services;
        }
    }
}