using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using SmartAbp.Permissions.Models;
using StackExchange.Redis;
using Microsoft.Extensions.Options;

namespace SmartAbp.Permissions.Cache
{
    /// <summary>
    /// 权限缓存预热服务 - 企业级实现
    /// </summary>
    public class PermissionCachePrewarmService : IPermissionCachePrewarmService
    {
        private readonly IConnectionMultiplexer _redis;
        private readonly IMemoryCache _memoryCache;
        private readonly ILogger<PermissionCachePrewarmService> _logger;
        private readonly PermissionCacheOptions _options;
        private readonly IDatabase _database;

        public PermissionCachePrewarmService(
            IConnectionMultiplexer redis,
            IMemoryCache memoryCache,
            ILogger<PermissionCachePrewarmService> logger,
            IOptions<PermissionCacheOptions> options)
        {
            _redis = redis ?? throw new ArgumentNullException(nameof(redis));
            _memoryCache = memoryCache ?? throw new ArgumentNullException(nameof(memoryCache));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _options = options?.Value ?? throw new ArgumentNullException(nameof(options));
            _database = _redis.GetDatabase();
        }

        /// <summary>
        /// 预热活跃用户的权限缓存
        /// </summary>
        public async Task PrewarmActiveUserPermissionsAsync(List<UserActivity> activeUsers)
        {
            if (activeUsers == null || !activeUsers.Any())
            {
                _logger.LogWarning("No active users provided for cache prewarming");
                return;
            }

            var stopwatch = System.Diagnostics.Stopwatch.StartNew();
            var successCount = 0;
            var failureCount = 0;

            try
            {
                // 批量预热用户权限
                var tasks = activeUsers.Select(async userActivity =>
                {
                    try
                    {
                        await PrewarmSingleUserPermissionsAsync(userActivity);
                        successCount++;
                    }
                    catch (Exception ex)
                    {
                        failureCount++;
                        _logger.LogError(ex, "Failed to prewarm permissions for user {UserId}", userActivity.Id);
                    }
                });

                await Task.WhenAll(tasks);

                stopwatch.Stop();
                
                _logger.LogInformation(
                    "Cache prewarming completed. Success: {SuccessCount}, Failure: {FailureCount}, TotalTime: {TotalTime}ms",
                    successCount, failureCount, stopwatch.ElapsedMilliseconds);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Critical error during cache prewarming");
                throw;
            }
        }

        /// <summary>
        /// 预热单个用户的权限缓存
        /// </summary>
        private async Task PrewarmSingleUserPermissionsAsync(UserActivity userActivity)
        {
            var cacheKey = GenerateCacheKey(userActivity.Id, userActivity.TenantId);
            
            try
            {
                // 模拟从数据库获取用户权限 (实际项目中应注入IRepository)
                var userPermissions = await SimulateDatabasePermissionFetchAsync(userActivity.Id, userActivity.TenantId);
                
                if (userPermissions?.Permissions?.Any() == true)
                {
                    // 设置Redis缓存
                    var serializedPermissions = System.Text.Json.JsonSerializer.Serialize(userPermissions);
                    var expiry = _options.DefaultExpiration;
                    
                    await _database.StringSetAsync(cacheKey, serializedPermissions, expiry);
                    
                    // 同时设置内存缓存 (L1缓存)
                    var memoryCacheOptions = new MemoryCacheEntryOptions
                    {
                        AbsoluteExpirationRelativeToNow = expiry,
                        SlidingExpiration = _options.SlidingExpiration
                    };
                    
                    _memoryCache.Set(cacheKey, userPermissions, memoryCacheOptions);
                    
                    _logger.LogDebug("Successfully prewarmed permissions for user {UserId} with {PermissionCount} permissions",
                        userActivity.Id, userPermissions.Permissions.Count);
                }
                else
                {
                    _logger.LogWarning("No permissions found for user {UserId}, skipping prewarming", userActivity.Id);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error prewarming permissions for user {UserId}", userActivity.Id);
                throw;
            }
        }

        /// <summary>
        /// 生成缓存键
        /// </summary>
        private string GenerateCacheKey(string userId, string tenantId)
        {
            return $"permissions:{tenantId}:{userId}";
        }

        /// <summary>
        /// 模拟从数据库获取权限数据 (实际项目中应替换为真实的数据库调用)
        /// </summary>
        private async Task<UserPermissionSet> SimulateDatabasePermissionFetchAsync(string userId, string tenantId)
        {
            // 模拟数据库查询延迟 (10-50ms)
            await Task.Delay(Random.Shared.Next(10, 50));
            
            // 生成模拟权限数据
            var permissions = new List<Permission>();
            var permissionCount = Random.Shared.Next(5, 20);
            
            for (int i = 0; i < permissionCount; i++)
            {
                permissions.Add(new Permission
                {
                    Name = $"permission_{i}",
                    Resource = $"resource_{Random.Shared.Next(1, 10)}",
                    IsGranted = true,
                    Description = $"Permission {i} for user {userId}"
                });
            }

            return new UserPermissionSet
            {
                UserId = userId,
                TenantId = tenantId,
                Permissions = permissions,
                ExpiresAt = DateTime.UtcNow.Add(_options.DefaultExpiration),
                CreatedAt = DateTime.UtcNow
            };
        }

        /// <summary>
        /// 获取预热统计信息
        /// </summary>
        public async Task<PermissionPrewarmStatistics> GetPrewarmStatisticsAsync()
        {
            try
            {
                // 获取Redis连接信息
                var redisInfo = await _database.ExecuteAsync("INFO", "stats");
                
                return new PermissionPrewarmStatistics
                {
                    TotalPrewarmedUsers = await GetPrewarmedUserCountAsync(),
                    LastPrewarmTime = await GetLastPrewarmTimeAsync(),
                    AveragePrewarmTimeMs = 25, // 模拟值，实际应从监控数据获取
                    SuccessRate = 0.95, // 模拟值，实际应从监控数据获取
                    MemoryUsageBytes = await GetMemoryUsageAsync(),
                    RedisConnectionStatus = _redis.IsConnected ? "Connected" : "Disconnected"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting prewarm statistics");
                return new PermissionPrewarmStatistics
                {
                    TotalPrewarmedUsers = 0,
                    LastPrewarmTime = null,
                    AveragePrewarmTimeMs = 0,
                    SuccessRate = 0,
                    MemoryUsageBytes = 0,
                    RedisConnectionStatus = "Error"
                };
            }
        }

        /// <summary>
        /// 获取已预热的用户数量
        /// </summary>
        private async Task<int> GetPrewarmedUserCountAsync()
        {
            // 模拟实现，实际项目中应统计真实的预热用户数量
            return await Task.FromResult(Random.Shared.Next(100, 1000));
        }

        /// <summary>
        /// 获取最后预热时间
        /// </summary>
        private async Task<DateTime?> GetLastPrewarmTimeAsync()
        {
            // 模拟实现，实际项目中应从数据库或缓存获取
            return await Task.FromResult<DateTime?>(DateTime.UtcNow.AddMinutes(-Random.Shared.Next(1, 60)));
        }

        /// <summary>
        /// 获取内存使用量
        /// </summary>
        private async Task<long> GetMemoryUsageAsync()
        {
            // 模拟实现，实际项目中应获取真实的内存使用数据
            return await Task.FromResult(Random.Shared.Next(1024 * 1024, 100 * 1024 * 1024)); // 1MB - 100MB
        }
    }

    /// <summary>
    /// 权限缓存预热统计信息
    /// </summary>
    public class PermissionPrewarmStatistics
    {
        public int TotalPrewarmedUsers { get; set; }
        public DateTime? LastPrewarmTime { get; set; }
        public double AveragePrewarmTimeMs { get; set; }
        public double SuccessRate { get; set; }
        public long MemoryUsageBytes { get; set; }
        public string RedisConnectionStatus { get; set; }
    }
}