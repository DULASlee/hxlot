using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Runtime;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SmartAbp.Permissions.Cache;
using SmartAbp.Permissions.Models;
using StackExchange.Redis;

namespace SmartAbp.Permissions.Health
{
    /// <summary>
    /// 权限缓存健康检查
    /// </summary>
    public class PermissionHealthCheck : IHealthCheck
    {
        private readonly IPermissionCacheService _cacheService;
        private readonly IConnectionMultiplexer _redis;
        private readonly ILogger<PermissionHealthCheck> _logger;
        private readonly PermissionCacheOptions _options;

        public PermissionHealthCheck(
            IPermissionCacheService cacheService,
            IConnectionMultiplexer redis,
            ILogger<PermissionHealthCheck> logger,
            IOptions<PermissionCacheOptions> options)
        {
            _cacheService = cacheService ?? throw new ArgumentNullException(nameof(cacheService));
            _redis = redis ?? throw new ArgumentNullException(nameof(redis));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _options = options?.Value ?? throw new ArgumentNullException(nameof(options));
        }

        public async Task<Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
        {
            try
            {
                // 检查Redis连接
                var database = _redis.GetDatabase();
                var pingResult = await database.PingAsync();
                
                if (pingResult == TimeSpan.Zero)
                {
                    return Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Unhealthy("Redis connection failed - ping returned zero");
                }

                // 检查缓存服务基本功能
                var testUserId = $"healthcheck_{Guid.NewGuid()}";
                var testTenantId = "healthcheck";
                var testPermissions = new UserPermissionSet
                {
                    UserId = testUserId,
                    TenantId = testTenantId,
                    Permissions = new List<Permission>
                    {
                        new Permission 
                        { 
                            Name = "HealthCheck.Test", 
                            Resource = "HealthCheck", 
                            IsGranted = true 
                        }
                    },
                    ExpiresAt = DateTime.UtcNow.AddMinutes(5)
                };

                // 测试设置缓存
                var setResult = await _cacheService.SetUserPermissionsAsync(testUserId, testTenantId, testPermissions);
                if (!setResult)
                {
                    return Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Unhealthy("Failed to set test permissions in cache");
                }

                // 测试获取缓存
                var getResult = await _cacheService.GetUserPermissionsAsync(testUserId, testTenantId);
                if (getResult == null)
                {
                    return Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Unhealthy("Failed to get test permissions from cache");
                }

                // 测试移除缓存
                var removeResult = await _cacheService.RemoveUserPermissionsAsync(testUserId, testTenantId);
                if (!removeResult)
                {
                    return Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Unhealthy("Failed to remove test permissions from cache");
                }

                // 验证最终状态
                var finalResult = await _cacheService.GetUserPermissionsAsync(testUserId, testTenantId);
                if (finalResult != null)
                {
                    return Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Unhealthy("Cache cleanup failed - test permissions still exist");
                }

                return Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Healthy($"Permission cache health check passed - Redis latency: {pingResult.TotalMilliseconds}ms");
            }
            catch (RedisConnectionException ex)
            {
                _logger.LogError(ex, "Redis connection failed during health check");
                return Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Unhealthy($"Redis connection failed: {ex.Message}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Permission cache health check failed");
                return Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Unhealthy($"Permission cache health check failed: {ex.Message}");
            }
        }
    }

    /// <summary>
    /// 权限性能健康检查
    /// </summary>
    public class PermissionPerformanceHealthCheck : IHealthCheck
    {
        private readonly IPermissionCacheService _cacheService;
        private readonly ILogger<PermissionPerformanceHealthCheck> _logger;
        private readonly PermissionPerformanceMonitorOptions _options;

        public PermissionPerformanceHealthCheck(
            IPermissionCacheService cacheService,
            ILogger<PermissionPerformanceHealthCheck> logger,
            IOptions<PermissionPerformanceMonitorOptions> options)
        {
            _cacheService = cacheService ?? throw new ArgumentNullException(nameof(cacheService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _options = options?.Value ?? throw new ArgumentNullException(nameof(options));
        }

        public async Task<Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
        {
            try
            {
                var stopwatch = System.Diagnostics.Stopwatch.StartNew();
                
                // 执行性能测试
                var testUserId = $"perf_test_{Guid.NewGuid()}";
                var testTenantId = "performance_test";
                var testPermissions = new UserPermissionSet
                {
                    UserId = testUserId,
                    TenantId = testTenantId,
                    Permissions = new List<Permission>
                    {
                        new Permission { Name = "Performance.Test", Resource = "Test", IsGranted = true }
                    },
                    ExpiresAt = DateTime.UtcNow.AddMinutes(5)
                };

                // 测试缓存设置性能
                await _cacheService.SetUserPermissionsAsync(testUserId, testTenantId, testPermissions);
                var setTime = stopwatch.ElapsedMilliseconds;

                // 测试缓存获取性能
                stopwatch.Restart();
                var result = await _cacheService.GetUserPermissionsAsync(testUserId, testTenantId);
                var getTime = stopwatch.ElapsedMilliseconds;

                // 清理测试数据
                await _cacheService.RemoveUserPermissionsAsync(testUserId, testTenantId);

                // 性能检查
                if (setTime > _options.PerformanceThresholdMs)
                {
                    return Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Degraded($"Cache set performance degraded: {setTime}ms (threshold: {_options.PerformanceThresholdMs}ms)");
                }

                if (getTime > _options.PerformanceThresholdMs)
                {
                    return Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Degraded($"Cache get performance degraded: {getTime}ms (threshold: {_options.PerformanceThresholdMs}ms)");
                }

                return Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Healthy($"Permission cache performance healthy - Set: {setTime}ms, Get: {getTime}ms");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Permission performance health check failed");
                return Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Unhealthy($"Permission performance health check failed: {ex.Message}");
            }
        }
    }

    /// <summary>
    /// 权限内存健康检查
    /// </summary>
    public class PermissionMemoryHealthCheck : IHealthCheck
    {
        private readonly ILogger<PermissionMemoryHealthCheck> _logger;
        private readonly MemoryManagementOptions _options;

        public PermissionMemoryHealthCheck(
            ILogger<PermissionMemoryHealthCheck> logger,
            IOptions<MemoryManagementOptions> options)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _options = options?.Value ?? throw new ArgumentNullException(nameof(options));
        }

        public async Task<Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
        {
            try
            {
                var process = Process.GetCurrentProcess();
                var totalMemory = process.WorkingSet64;
                var privateMemory = process.PrivateMemorySize64;
                var gcMemory = GC.GetTotalMemory(false);
                
                var memoryInfo = new Dictionary<string, object>
                {
                    ["TotalMemory"] = FormatBytes(totalMemory),
                    ["PrivateMemory"] = FormatBytes(privateMemory),
                    ["GCMemory"] = FormatBytes(gcMemory),
                    ["GCGen0Collections"] = GC.CollectionCount(0),
                    ["GCGen1Collections"] = GC.CollectionCount(1),
                    ["GCGen2Collections"] = GC.CollectionCount(2),
                    ["GCLatencyMode"] = GCSettings.LatencyMode.ToString()
                };

                // 检查内存使用率
                var totalPhysicalMemory = GetTotalPhysicalMemory();
                var memoryUsagePercentage = totalPhysicalMemory > 0 ? (double)totalMemory / totalPhysicalMemory * 100 : 0;

                if (memoryUsagePercentage > _options.MemoryThreshold)
                {
                    _logger.LogWarning("Memory usage is high: {MemoryUsagePercentage:F1}% (threshold: {Threshold:F1}%)", 
                        memoryUsagePercentage, _options.MemoryThreshold);
                    
                    return Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Degraded(
                        $"Memory usage is high: {memoryUsagePercentage:F1}%", 
                        data: memoryInfo);
                }

                _logger.LogDebug("Memory health check passed: {MemoryUsagePercentage:F1}%", memoryUsagePercentage);
                
                return Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Healthy(
                    $"Memory usage is normal: {memoryUsagePercentage:F1}%", 
                    memoryInfo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Memory health check failed");
                return Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Unhealthy("Memory health check failed", ex);
            }
        }

        private static string FormatBytes(long bytes)
        {
            string[] suffixes = { "B", "KB", "MB", "GB", "TB" };
            int counter = 0;
            decimal number = bytes;
            while (Math.Round(number / 1024) >= 1)
            {
                number = number / 1024;
                counter++;
            }
            return string.Format("{0:n1} {1}", number, suffixes[counter]);
        }

        private static long GetTotalPhysicalMemory()
        {
            try
            {
                // 这里可以实现获取总物理内存的逻辑
                // 暂时返回0，表示无法获取
                return 0;
            }
            catch
            {
                return 0;
            }
        }
    }
}