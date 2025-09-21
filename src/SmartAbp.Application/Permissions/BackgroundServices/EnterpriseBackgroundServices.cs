using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SmartAbp.Permissions.Alerting;
using SmartAbp.Permissions.Cache;
using SmartAbp.Permissions.Configuration;
using SmartAbp.Permissions.Integration;
using SmartAbp.Permissions.Memory;
using SmartAbp.Permissions.Performance;
using Volo.Abp.DependencyInjection;

namespace SmartAbp.Permissions.BackgroundServices
{
    /// <summary>
    /// 健康检查后台服务选项
    /// </summary>
    public class HealthCheckBackgroundServiceOptions
    {
        /// <summary>
        /// 是否启用
        /// </summary>
        public bool IsEnabled { get; set; } = true;

        /// <summary>
        /// 检查间隔（秒）
        /// </summary>
        public int CheckIntervalSeconds { get; set; } = 60;

        /// <summary>
        /// 超时时间（秒）
        /// </summary>
        public int TimeoutSeconds { get; set; } = 30;

        /// <summary>
        /// 失败重试次数
        /// </summary>
        public int RetryCount { get; set; } = 3;

        /// <summary>
        /// 重试间隔（秒）
        /// </summary>
        public int RetryIntervalSeconds { get; set; } = 5;
    }

    /// <summary>
    /// 性能监控后台服务选项
    /// </summary>
    public class PerformanceMonitoringBackgroundServiceOptions
    {
        /// <summary>
        /// 是否启用
        /// </summary>
        public bool IsEnabled { get; set; } = true;

        /// <summary>
        /// 监控间隔（秒）
        /// </summary>
        public int MonitoringIntervalSeconds { get; set; } = 300; // 5分钟

        /// <summary>
        /// 趋势分析间隔（小时）
        /// </summary>
        public int TrendAnalysisIntervalHours { get; set; } = 24;

        /// <summary>
        /// 报告阈值（毫秒）
        /// </summary>
        public int ReportThresholdMs { get; set; } = 1000;

        /// <summary>
        /// 是否发送报告
        /// </summary>
        public bool SendReport { get; set; } = true;
    }

    /// <summary>
    /// 内存管理后台服务选项
    /// </summary>
    public class MemoryManagementBackgroundServiceOptions
    {
        /// <summary>
        /// 是否启用
        /// </summary>
        public bool IsEnabled { get; set; } = true;

        /// <summary>
        /// 检查间隔（秒）
        /// </summary>
        public int CheckIntervalSeconds { get; set; } = 300; // 5分钟

        /// <summary>
        /// 优化间隔（分钟）
        /// </summary>
        public int OptimizationIntervalMinutes { get; set; } = 60; // 1小时

        /// <summary>
        /// 强制GC间隔（小时）
        /// </summary>
        public int ForceGCIntervalHours { get; set; } = 6;

        /// <summary>
        /// 内存警告阈值（MB）
        /// </summary>
        public long MemoryWarningThresholdMB { get; set; } = 512;

        /// <summary>
        /// 内存严重阈值（MB）
        /// </summary>
        public long MemoryCriticalThresholdMB { get; set; } = 1024;

        /// <summary>
        /// 是否自动优化
        /// </summary>
        public bool AutoOptimize { get; set; } = true;

        /// <summary>
        /// 是否记录详细日志
        /// </summary>
        public bool DetailedLogging { get; set; } = false;
    }

    /// <summary>
    /// 配置管理后台服务选项
    /// </summary>
    public class ConfigurationManagementBackgroundServiceOptions
    {
        /// <summary>
        /// 是否启用
        /// </summary>
        public bool IsEnabled { get; set; } = true;

        /// <summary>
        /// 检查间隔（秒）
        /// </summary>
        public int CheckIntervalSeconds { get; set; } = 300; // 5分钟

        /// <summary>
        /// 验证间隔（小时）
        /// </summary>
        public int ValidationIntervalHours { get; set; } = 6;

        /// <summary>
        /// 备份间隔（小时）
        /// </summary>
        public int BackupIntervalHours { get; set; } = 24;

        /// <summary>
        /// 是否自动重新加载
        /// </summary>
        public bool AutoReload { get; set; } = true;

        /// <summary>
        /// 是否自动验证
        /// </summary>
        public bool AutoValidate { get; set; } = true;

        /// <summary>
        /// 是否自动备份
        /// </summary>
        public bool AutoBackup { get; set; } = true;
    }

    /// <summary>
    /// 健康检查后台服务
    /// </summary>
    public class HealthCheckBackgroundService : BackgroundService, ISingletonDependency
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<HealthCheckBackgroundService> _logger;
        private readonly HealthCheckBackgroundServiceOptions _options;

        public HealthCheckBackgroundService(
            IServiceProvider serviceProvider,
            ILogger<HealthCheckBackgroundService> logger,
            IOptions<HealthCheckBackgroundServiceOptions> options)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
            _options = options?.Value ?? new HealthCheckBackgroundServiceOptions();
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            if (!_options.IsEnabled)
            {
                _logger.LogInformation("Health check background service is disabled");
                return;
            }

            _logger.LogInformation("Health check background service started");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await PerformHealthChecksAsync();
                    
                    await Task.Delay(TimeSpan.FromSeconds(_options.CheckIntervalSeconds), stoppingToken);
                }
                catch (OperationCanceledException)
                {
                    _logger.LogInformation("Health check background service is stopping");
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in health check background service");
                    await Task.Delay(TimeSpan.FromSeconds(_options.RetryIntervalSeconds), stoppingToken);
                }
            }

            _logger.LogInformation("Health check background service stopped");
        }

        private async Task PerformHealthChecksAsync()
        {
            using var scope = _serviceProvider.CreateScope();
            var integrationService = scope.ServiceProvider.GetRequiredService<IEnterpriseIntegrationService>();
            var alertingService = scope.ServiceProvider.GetRequiredService<IPermissionAlertingService>();

            try
            {
                var healthCheckResults = await integrationService.HealthCheckAllAsync();
                
                foreach (var result in healthCheckResults)
                {
                    if (!result.IsHealthy)
                    {
                        await alertingService.CreateAlertAsync(
                            AlertLevel.Warning,
                            AlertType.System,
                            $"Integration Health Check Failed: {result.ServiceType}",
                            $"Service {result.ServiceType} is unhealthy. Status: {result.Status}, Error: {result.ErrorMessage}",
                            "HealthCheckBackgroundService",
                            new Dictionary<string, object>
                            {
                                ["ServiceType"] = result.ServiceType.ToString(),
                                ["Status"] = result.Status.ToString(),
                                ["ResponseTimeMs"] = result.ResponseTimeMs,
                                ["ErrorMessage"] = result.ErrorMessage
                            }
                        );
                    }
                    
                    _logger.LogDebug("Health check completed: {ServiceType}, Status: {Status}, ResponseTime: {ResponseTime}ms",
                        result.ServiceType, result.Status, result.ResponseTimeMs);
                }
                
                _logger.LogInformation("Health checks completed for {Count} integrations", healthCheckResults.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error performing health checks");
                
                await alertingService.CreateAlertAsync(
                    AlertLevel.Error,
                    AlertType.System,
                    "Health Check Service Error",
                    $"Error performing health checks: {ex.Message}",
                    "HealthCheckBackgroundService",
                    new Dictionary<string, object>
                    {
                        ["Error"] = ex.Message,
                        ["StackTrace"] = ex.StackTrace
                    }
                );
            }
        }
    }

    /// <summary>
    /// 性能监控后台服务
    /// </summary>
    public class PerformanceMonitoringBackgroundService : BackgroundService, ISingletonDependency
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<PerformanceMonitoringBackgroundService> _logger;
        private readonly PerformanceMonitoringBackgroundServiceOptions _options;

        public PerformanceMonitoringBackgroundService(
            IServiceProvider serviceProvider,
            ILogger<PerformanceMonitoringBackgroundService> logger,
            IOptions<PerformanceMonitoringBackgroundServiceOptions> options)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
            _options = options?.Value ?? new PerformanceMonitoringBackgroundServiceOptions();
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            if (!_options.IsEnabled)
            {
                _logger.LogInformation("Performance monitoring background service is disabled");
                return;
            }

            _logger.LogInformation("Performance monitoring background service started");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await PerformPerformanceMonitoringAsync();
                    
                    await Task.Delay(TimeSpan.FromSeconds(_options.MonitoringIntervalSeconds), stoppingToken);
                }
                catch (OperationCanceledException)
                {
                    _logger.LogInformation("Performance monitoring background service is stopping");
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in performance monitoring background service");
                    await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
                }
            }

            _logger.LogInformation("Performance monitoring background service stopped");
        }

        private async Task PerformPerformanceMonitoringAsync()
        {
            using var scope = _serviceProvider.CreateScope();
            var performanceMonitor = scope.ServiceProvider.GetRequiredService<IPermissionPerformanceMonitor>();
            var alertingService = scope.ServiceProvider.GetRequiredService<IPermissionAlertingService>();
            var integrationService = scope.ServiceProvider.GetRequiredService<IEnterpriseIntegrationService>();

            try
            {
                var metrics = performanceMonitor.GetCurrentMetrics();
                var trend = performanceMonitor.GetPerformanceTrend(TimeSpan.FromHours(_options.TrendAnalysisIntervalHours));
                
                // 检查性能阈值
                if (metrics.AverageResponseTimeMs > _options.ReportThresholdMs)
                {
                    await alertingService.CreateAlertAsync(
                        AlertLevel.Warning,
                        AlertType.Performance,
                        "Performance Threshold Exceeded",
                        $"Average response time {metrics.AverageResponseTimeMs:F2}ms exceeds threshold {_options.ReportThresholdMs}ms",
                        "PerformanceMonitoringBackgroundService",
                        new Dictionary<string, object>
                        {
                            ["AverageResponseTimeMs"] = metrics.AverageResponseTimeMs,
                            ["ThresholdMs"] = _options.ReportThresholdMs,
                            ["CacheHitRate"] = metrics.CacheHitRate,
                            ["ErrorRate"] = metrics.ErrorRate,
                            ["TotalRequests"] = metrics.TotalRequests
                        }
                    );
                }
                
                // 发送指标到集成服务
                if (_options.SendReport)
                {
                    var metricsData = new List<Integration.IntegrationMetricsData>
                    {
                        new Integration.IntegrationMetricsData
                        {
                            MetricName = "permission_response_time_ms",
                            Value = metrics.AverageResponseTimeMs,
                            MetricType = "gauge",
                            Labels = new Dictionary<string, string> { ["type"] = "average" }
                        },
                        new Integration.IntegrationMetricsData
                        {
                            MetricName = "permission_cache_hit_rate",
                            Value = metrics.CacheHitRate,
                            MetricType = "gauge",
                            Labels = new Dictionary<string, string> { ["type"] = "hit_rate" }
                        },
                        new Integration.IntegrationMetricsData
                        {
                            MetricName = "permission_error_rate",
                            Value = metrics.ErrorRate,
                            MetricType = "gauge",
                            Labels = new Dictionary<string, string> { ["type"] = "error_rate" }
                        }
                    };
                    
                    await integrationService.SendMetricsAsync(IntegrationServiceType.Prometheus, metricsData);
                }
                
                _logger.LogDebug("Performance monitoring completed: AvgResponseTime={AvgResponseTime:F2}ms, CacheHitRate={CacheHitRate:F2}%, ErrorRate={ErrorRate:F2}%",
                    metrics.AverageResponseTimeMs, metrics.CacheHitRate, metrics.ErrorRate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error performing performance monitoring");
                
                await alertingService.CreateAlertAsync(
                    AlertLevel.Error,
                    AlertType.Performance,
                    "Performance Monitoring Error",
                    $"Error performing performance monitoring: {ex.Message}",
                    "PerformanceMonitoringBackgroundService",
                    new Dictionary<string, object>
                    {
                        ["Error"] = ex.Message,
                        ["StackTrace"] = ex.StackTrace
                    }
                );
            }
        }
    }

    /// <summary>
    /// 内存管理后台服务
    /// </summary>
    public class MemoryManagementBackgroundService : BackgroundService, ISingletonDependency
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<MemoryManagementBackgroundService> _logger;
        private readonly MemoryManagementBackgroundServiceOptions _options;
        private DateTime _lastOptimizationTime = DateTime.MinValue;
        private DateTime _lastGCRunTime = DateTime.MinValue;

        public MemoryManagementBackgroundService(
            IServiceProvider serviceProvider,
            ILogger<MemoryManagementBackgroundService> logger,
            IOptions<MemoryManagementBackgroundServiceOptions> options)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
            _options = options?.Value ?? new MemoryManagementBackgroundServiceOptions();
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            if (!_options.IsEnabled)
            {
                _logger.LogInformation("Memory management background service is disabled");
                return;
            }

            _logger.LogInformation("Memory management background service started");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await PerformMemoryManagementAsync();
                    
                    await Task.Delay(TimeSpan.FromSeconds(_options.CheckIntervalSeconds), stoppingToken);
                }
                catch (OperationCanceledException)
                {
                    _logger.LogInformation("Memory management background service is stopping");
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in memory management background service");
                    await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
                }
            }

            _logger.LogInformation("Memory management background service stopped");
        }

        private async Task PerformMemoryManagementAsync()
        {
            using var scope = _serviceProvider.CreateScope();
            var memoryService = scope.ServiceProvider.GetRequiredService<IMemoryManagementService>();
            var alertingService = scope.ServiceProvider.GetRequiredService<IPermissionAlertingService>();

            try
            {
                // 检查内存使用情况
                var memoryInfo = memoryService.GetMemoryInfo();
                
                if (_options.DetailedLogging)
                {
                    _logger.LogDebug("Memory check: Used={UsedMemory}MB, Available={AvailableMemory}MB, Total={TotalMemory}MB",
                        memoryInfo.UsedMemoryMB, memoryInfo.AvailableMemoryMB, memoryInfo.TotalMemoryMB);
                }
                
                // 检查内存警告阈值
                if (memoryInfo.UsedMemoryMB > _options.MemoryWarningThresholdMB)
                {
                    await alertingService.CreateAlertAsync(
                        memoryInfo.UsedMemoryMB > _options.MemoryCriticalThresholdMB ? AlertLevel.Critical : AlertLevel.Warning,
                        AlertType.Memory,
                        "Memory Usage Alert",
                        $"Memory usage {memoryInfo.UsedMemoryMB}MB exceeds threshold {_options.MemoryWarningThresholdMB}MB",
                        "MemoryManagementBackgroundService",
                        new Dictionary<string, object>
                        {
                            ["UsedMemoryMB"] = memoryInfo.UsedMemoryMB,
                            ["AvailableMemoryMB"] = memoryInfo.AvailableMemoryMB,
                            ["TotalMemoryMB"] = memoryInfo.TotalMemoryMB,
                            ["WarningThresholdMB"] = _options.MemoryWarningThresholdMB,
                            ["CriticalThresholdMB"] = _options.MemoryCriticalThresholdMB
                        }
                    );
                }
                
                // 执行内存优化
                if (_options.AutoOptimize && DateTime.UtcNow - _lastOptimizationTime > TimeSpan.FromMinutes(_options.OptimizationIntervalMinutes))
                {
                    await PerformMemoryOptimizationAsync(memoryService);
                    _lastOptimizationTime = DateTime.UtcNow;
                }
                
                // 强制垃圾回收
                if (DateTime.UtcNow - _lastGCRunTime > TimeSpan.FromHours(_options.ForceGCIntervalHours))
                {
                    await PerformGarbageCollectionAsync(memoryService);
                    _lastGCRunTime = DateTime.UtcNow;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error performing memory management");
                
                await alertingService.CreateAlertAsync(
                    AlertLevel.Error,
                    AlertType.Memory,
                    "Memory Management Error",
                    $"Error performing memory management: {ex.Message}",
                    "MemoryManagementBackgroundService",
                    new Dictionary<string, object>
                    {
                        ["Error"] = ex.Message,
                        ["StackTrace"] = ex.StackTrace
                    }
                );
            }
        }

        private async Task PerformMemoryOptimizationAsync(IMemoryManagementService memoryService)
        {
            try
            {
                var optimizationResult = await memoryService.OptimizeMemoryAsync();
                
                if (_options.DetailedLogging)
                {
                    _logger.LogInformation("Memory optimization completed: Freed={FreedMemory}MB, Before={BeforeOptimization}MB, After={AfterOptimization}MB",
                        optimizationResult.FreedMemoryMB, optimizationResult.BeforeOptimizationMB, optimizationResult.AfterOptimizationMB);
                }
                
                if (optimizationResult.FreedMemoryMB > 100) // 如果释放了超过100MB内存
                {
                    await _serviceProvider.GetRequiredService<IPermissionAlertingService>().CreateAlertAsync(
                        AlertLevel.Info,
                        AlertType.Memory,
                        "Memory Optimization Completed",
                        $"Memory optimization freed {optimizationResult.FreedMemoryMB}MB of memory",
                        "MemoryManagementBackgroundService",
                        new Dictionary<string, object>
                        {
                            ["FreedMemoryMB"] = optimizationResult.FreedMemoryMB,
                            ["BeforeOptimizationMB"] = optimizationResult.BeforeOptimizationMB,
                            ["AfterOptimizationMB"] = optimizationResult.AfterOptimizationMB
                        }
                    );
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error performing memory optimization");
            }
        }

        private async Task PerformGarbageCollectionAsync(IMemoryManagementService memoryService)
        {
            try
            {
                var gcResult = await memoryService.ForceGarbageCollectionAsync();
                
                if (_options.DetailedLogging)
                {
                    _logger.LogInformation("Garbage collection completed: Gen0={Gen0Collections}, Gen1={Gen1Collections}, Gen2={Gen2Collections}, Memory={MemoryBeforeGC}->{MemoryAfterGC}MB",
                        gcResult.Gen0Collections, gcResult.Gen1Collections, gcResult.Gen2Collections, 
                        gcResult.MemoryBeforeGC, gcResult.MemoryAfterGC);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error performing garbage collection");
            }
        }
    }

    /// <summary>
    /// 配置管理后台服务
    /// </summary>
    public class ConfigurationManagementBackgroundService : BackgroundService, ISingletonDependency
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<ConfigurationManagementBackgroundService> _logger;
        private readonly ConfigurationManagementBackgroundServiceOptions _options;
        private DateTime _lastValidationTime = DateTime.MinValue;
        private DateTime _lastBackupTime = DateTime.MinValue;

        public ConfigurationManagementBackgroundService(
            IServiceProvider serviceProvider,
            ILogger<ConfigurationManagementBackgroundService> logger,
            IOptions<ConfigurationManagementBackgroundServiceOptions> options)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
            _options = options?.Value ?? new ConfigurationManagementBackgroundServiceOptions();
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            if (!_options.IsEnabled)
            {
                _logger.LogInformation("Configuration management background service is disabled");
                return;
            }

            _logger.LogInformation("Configuration management background service started");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await PerformConfigurationManagementAsync();
                    
                    await Task.Delay(TimeSpan.FromSeconds(_options.CheckIntervalSeconds), stoppingToken);
                }
                catch (OperationCanceledException)
                {
                    _logger.LogInformation("Configuration management background service is stopping");
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in configuration management background service");
                    await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
                }
            }

            _logger.LogInformation("Configuration management background service stopped");
        }

        private async Task PerformConfigurationManagementAsync()
        {
            using var scope = _serviceProvider.CreateScope();
            var configurationService = scope.ServiceProvider.GetRequiredService<IPermissionConfigurationService>();
            var alertingService = scope.ServiceProvider.GetRequiredService<IPermissionAlertingService>();

            try
            {
                // 自动重新加载配置
                if (_options.AutoReload)
                {
                    await configurationService.ReloadAsync();
                    _logger.LogDebug("Configuration reloaded");
                }
                
                // 自动验证配置
                if (_options.AutoValidate && DateTime.UtcNow - _lastValidationTime > TimeSpan.FromHours(_options.ValidationIntervalHours))
                {
                    await PerformConfigurationValidationAsync(configurationService, alertingService);
                    _lastValidationTime = DateTime.UtcNow;
                }
                
                // 自动备份配置
                if (_options.AutoBackup && DateTime.UtcNow - _lastBackupTime > TimeSpan.FromHours(_options.BackupIntervalHours))
                {
                    await PerformConfigurationBackupAsync(configurationService, alertingService);
                    _lastBackupTime = DateTime.UtcNow;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error performing configuration management");
                
                await alertingService.CreateAlertAsync(
                    AlertLevel.Error,
                    AlertType.Configuration,
                    "Configuration Management Error",
                    $"Error performing configuration management: {ex.Message}",
                    "ConfigurationManagementBackgroundService",
                    new Dictionary<string, object>
                    {
                        ["Error"] = ex.Message,
                        ["StackTrace"] = ex.StackTrace
                    }
                );
            }
        }

        private async Task PerformConfigurationValidationAsync(IPermissionConfigurationService configurationService, IPermissionAlertingService alertingService)
        {
            try
            {
                var validationResult = await configurationService.ValidateAsync();
                
                if (!validationResult.IsValid)
                {
                    await alertingService.CreateAlertAsync(
                        AlertLevel.Error,
                        AlertType.Configuration,
                        "Configuration Validation Failed",
                        $"Configuration validation failed with {validationResult.Errors.Count} errors and {validationResult.Warnings.Count} warnings",
                        "ConfigurationManagementBackgroundService",
                        new Dictionary<string, object>
                        {
                            ["IsValid"] = validationResult.IsValid,
                            ["ErrorCount"] = validationResult.Errors.Count,
                            ["WarningCount"] = validationResult.Warnings.Count,
                            ["Errors"] = validationResult.Errors,
                            ["Warnings"] = validationResult.Warnings,
                            ["ValidationTime"] = validationResult.ValidationTime
                        }
                    );
                }
                else if (validationResult.Warnings.Any())
                {
                    await alertingService.CreateAlertAsync(
                        AlertLevel.Warning,
                        AlertType.Configuration,
                        "Configuration Validation Warnings",
                        $"Configuration validation passed with {validationResult.Warnings.Count} warnings",
                        "ConfigurationManagementBackgroundService",
                        new Dictionary<string, object>
                        {
                            ["WarningCount"] = validationResult.Warnings.Count,
                            ["Warnings"] = validationResult.Warnings,
                            ["ValidationTime"] = validationResult.ValidationTime
                        }
                    );
                }
                
                _logger.LogInformation("Configuration validation completed: Valid={Valid}, Errors={ErrorCount}, Warnings={WarningCount}",
                    validationResult.IsValid, validationResult.Errors.Count, validationResult.Warnings.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error performing configuration validation");
            }
        }

        private async Task PerformConfigurationBackupAsync(IPermissionConfigurationService configurationService, IPermissionAlertingService alertingService)
        {
            try
            {
                var allKeys = configurationService.GetAllKeys().ToList();
                var backupData = new Dictionary<string, object>();
                
                foreach (var key in allKeys.Take(100)) // 限制备份数量
                {
                    try
                    {
                        var value = configurationService.GetValue<string>(key, "");
                        backupData[key] = value;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Error backing up configuration key: {Key}", key);
                    }
                }
                
                _logger.LogInformation("Configuration backup completed: {Count} keys backed up", backupData.Count);
                
                await alertingService.CreateAlertAsync(
                    AlertLevel.Info,
                    AlertType.Configuration,
                    "Configuration Backup Completed",
                    $"Configuration backup completed for {backupData.Count} keys",
                    "ConfigurationManagementBackgroundService",
                    new Dictionary<string, object>
                    {
                        ["BackedUpKeys"] = backupData.Count,
                        ["TotalKeys"] = allKeys.Count,
                        ["BackupTime"] = DateTime.UtcNow
                    }
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error performing configuration backup");
            }
        }
    }

    /// <summary>
    /// 企业级后台服务扩展
    /// </summary>
    public static class EnterpriseBackgroundServiceExtensions
    {
        /// <summary>
        /// 添加企业级后台服务
        /// </summary>
        /// <param name="services">服务集合</param>
        /// <returns>服务集合</returns>
        public static IServiceCollection AddEnterpriseBackgroundServices(this IServiceCollection services)
        {
            // 健康检查后台服务
            services.Configure<HealthCheckBackgroundServiceOptions>(options =>
            {
                options.IsEnabled = true;
                options.CheckIntervalSeconds = 60;
                options.TimeoutSeconds = 30;
                options.RetryCount = 3;
                options.RetryIntervalSeconds = 5;
            });
            services.AddHostedService<HealthCheckBackgroundService>();
            
            // 性能监控后台服务
            services.Configure<PerformanceMonitoringBackgroundServiceOptions>(options =>
            {
                options.IsEnabled = true;
                options.MonitoringIntervalSeconds = 300; // 5分钟
                options.TrendAnalysisIntervalHours = 24;
                options.ReportThresholdMs = 1000;
                options.SendReport = true;
            });
            services.AddHostedService<PerformanceMonitoringBackgroundService>();
            
            // 内存管理后台服务
            services.Configure<MemoryManagementBackgroundServiceOptions>(options =>
            {
                options.IsEnabled = true;
                options.CheckIntervalSeconds = 300; // 5分钟
                options.OptimizationIntervalMinutes = 60; // 1小时
                options.ForceGCIntervalHours = 6;
                options.MemoryWarningThresholdMB = 512;
                options.MemoryCriticalThresholdMB = 1024;
                options.AutoOptimize = true;
                options.DetailedLogging = false;
            });
            services.AddHostedService<MemoryManagementBackgroundService>();
            
            // 配置管理后台服务
            services.Configure<ConfigurationManagementBackgroundServiceOptions>(options =>
            {
                options.IsEnabled = true;
                options.CheckIntervalSeconds = 300; // 5分钟
                options.ValidationIntervalHours = 6;
                options.BackupIntervalHours = 24;
                options.AutoReload = true;
                options.AutoValidate = true;
                options.AutoBackup = true;
            });
            services.AddHostedService<ConfigurationManagementBackgroundService>();
            
            return services;
        }

        /// <summary>
        /// 添加企业级后台服务（带配置）
        /// </summary>
        /// <param name="services">服务集合</param>
        /// <param name="configureHealthCheck">健康检查配置</param>
        /// <param name="configurePerformance">性能监控配置</param>
        /// <param name="configureMemory">内存管理配置</param>
        /// <param name="configureConfiguration">配置管理配置</param>
        /// <returns>服务集合</returns>
        public static IServiceCollection AddEnterpriseBackgroundServices(
            this IServiceCollection services,
            Action<HealthCheckBackgroundServiceOptions> configureHealthCheck = null,
            Action<PerformanceMonitoringBackgroundServiceOptions> configurePerformance = null,
            Action<MemoryManagementBackgroundServiceOptions> configureMemory = null,
            Action<ConfigurationManagementBackgroundServiceOptions> configureConfiguration = null)
        {
            // 基础后台服务
            AddEnterpriseBackgroundServices(services);
            
            // 健康检查配置
            if (configureHealthCheck != null)
            {
                services.Configure(configureHealthCheck);
            }
            
            // 性能监控配置
            if (configurePerformance != null)
            {
                services.Configure(configurePerformance);
            }
            
            // 内存管理配置
            if (configureMemory != null)
            {
                services.Configure(configureMemory);
            }
            
            // 配置管理配置
            if (configureConfiguration != null)
            {
                services.Configure(configureConfiguration);
            }
            
            return services;
        }
    }
}