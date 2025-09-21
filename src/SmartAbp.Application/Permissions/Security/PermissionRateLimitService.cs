using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SmartAbp.Permissions.Models;

namespace SmartAbp.Permissions.Security
{
    /// <summary>
    /// 权限速率限制服务接口
    /// </summary>
    public interface IPermissionRateLimitService
    {
        /// <summary>
        /// 检查是否允许访问
        /// </summary>
        /// <param name="userId">用户ID</param>
        /// <param name="tenantId">租户ID</param>
        /// <param name="permissionName">权限名称</param>
        /// <returns>速率限制结果</returns>
        Task<RateLimitResult> IsAllowedAsync(string userId, string tenantId, string permissionName);

        /// <summary>
        /// 记录成功的权限检查
        /// </summary>
        /// <param name="userId">用户ID</param>
        /// <param name="tenantId">租户ID</param>
        /// <param name="permissionName">权限名称</param>
        /// <param name="responseTimeMs">响应时间（毫秒）</param>
        Task RecordSuccessAsync(string userId, string tenantId, string permissionName, long responseTimeMs);

        /// <summary>
        /// 记录失败的权限检查
        /// </summary>
        /// <param name="userId">用户ID</param>
        /// <param name="tenantId">租户ID</param>
        /// <param name="permissionName">权限名称</param>
        /// <param name="reason">失败原因</param>
        Task RecordFailureAsync(string userId, string tenantId, string permissionName, string reason);

        /// <summary>
        /// 获取速率限制统计信息
        /// </summary>
        /// <returns>速率限制统计信息</returns>
        Task<RateLimitStatistics> GetStatisticsAsync();

        /// <summary>
        /// 重置用户的速率限制
        /// </summary>
        /// <param name="userId">用户ID</param>
        /// <param name="tenantId">租户ID</param>
        Task ResetUserRateLimitAsync(string userId, string tenantId);
    }

    /// <summary>
    /// 速率限制结果
    /// </summary>
    public class RateLimitResult
    {
        public bool IsAllowed { get; set; }
        public int CurrentCount { get; set; }
        public int Limit { get; set; }
        public TimeSpan TimeWindow { get; set; }
        public TimeSpan? RetryAfter { get; set; }
        public string Reason { get; set; }
    }

    /// <summary>
    /// 速率限制统计信息
    /// </summary>
    public class RateLimitStatistics
    {
        public long TotalRequests { get; set; }
        public long AllowedRequests { get; set; }
        public long BlockedRequests { get; set; }
        public double BlockRate => TotalRequests > 0 ? (double)BlockedRequests / TotalRequests : 0;
        public Dictionary<string, long> RequestsByPermission { get; set; } = new Dictionary<string, long>();
        public Dictionary<string, long> BlockedByPermission { get; set; } = new Dictionary<string, long>();
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// 权限速率限制服务 - 企业级实现
    /// </summary>
    public class PermissionRateLimitService : IPermissionRateLimitService
    {
        private readonly ILogger<PermissionRateLimitService> _logger;
        private readonly PermissionRateLimitOptions _options;
        private readonly ConcurrentDictionary<string, RateLimitCounter> _counters;
        private readonly Timer _cleanupTimer;
        private readonly RateLimitStatistics _statistics;
        private readonly object _statisticsLock = new object();

        public PermissionRateLimitService(
            ILogger<PermissionRateLimitService> logger,
            IOptions<PermissionRateLimitOptions> options)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _options = options?.Value ?? throw new ArgumentNullException(nameof(options));
            _counters = new ConcurrentDictionary<string, RateLimitCounter>();
            _statistics = new RateLimitStatistics();

            // 启动清理定时器（每5分钟清理一次过期数据）
            _cleanupTimer = new Timer(CleanupExpiredCounters, null, TimeSpan.FromMinutes(5), TimeSpan.FromMinutes(5));
        }

        public async Task<RateLimitResult> IsAllowedAsync(string userId, string tenantId, string permissionName)
        {
            if (!_options.Enabled)
            {
                return new RateLimitResult
                {
                    IsAllowed = true,
                    CurrentCount = 0,
                    Limit = 0,
                    TimeWindow = TimeSpan.Zero,
                    Reason = "Rate limiting disabled"
                };
            }

            try
            {
                var key = GenerateRateLimitKey(userId, tenantId, permissionName);
                var now = DateTime.UtcNow;
                var window = _options.WindowSize;
                var limit = GetRateLimitForPermission(permissionName);

                // 获取或创建计数器
                var counter = _counters.GetOrAdd(key, k => new RateLimitCounter
                {
                    Key = k,
                    Requests = new List<DateTime>(),
                    CreatedAt = now
                });

                // 清理过期请求
                counter.Requests = counter.Requests.Where(r => now - r < window).ToList();

                // 检查是否在黑名单中
                if (IsInBlacklist(userId, tenantId))
                {
                    return new RateLimitResult
                    {
                        IsAllowed = false,
                        CurrentCount = counter.Requests.Count,
                        Limit = limit,
                        TimeWindow = window,
                        RetryAfter = _options.PenaltyDuration,
                        Reason = "User is in blacklist"
                    };
                }

                // 检查速率限制
                if (counter.Requests.Count >= limit)
                {
                    var oldestRequest = counter.Requests.Min();
                    var retryAfter = window - (now - oldestRequest);

                    // 记录阻塞统计
                    UpdateStatistics(permissionName, false);

                    return new RateLimitResult
                    {
                        IsAllowed = false,
                        CurrentCount = counter.Requests.Count,
                        Limit = limit,
                        TimeWindow = window,
                        RetryAfter = retryAfter > TimeSpan.Zero ? retryAfter : TimeSpan.FromSeconds(1),
                        Reason = "Rate limit exceeded"
                    };
                }

                // 添加当前请求
                counter.Requests.Add(now);
                counter.LastAccessedAt = now;

                // 记录成功统计
                UpdateStatistics(permissionName, true);

                return new RateLimitResult
                {
                    IsAllowed = true,
                    CurrentCount = counter.Requests.Count,
                    Limit = limit,
                    TimeWindow = window,
                    Reason = "Request allowed"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking rate limit for user {UserId}, permission {PermissionName}", userId, permissionName);
                
                // 出错时允许请求，但记录错误
                return new RateLimitResult
                {
                    IsAllowed = true,
                    CurrentCount = 0,
                    Limit = 0,
                    TimeWindow = TimeSpan.Zero,
                    Reason = $"Rate limit check failed: {ex.Message}"
                };
            }
        }

        public Task RecordSuccessAsync(string userId, string tenantId, string permissionName, long responseTimeMs)
        {
            // 可以在这里添加更详细的记录逻辑
            _logger.LogDebug("Permission check success: user={UserId}, permission={PermissionName}, responseTime={ResponseTimeMs}ms", 
                userId, permissionName, responseTimeMs);
            return Task.CompletedTask;
        }

        public Task RecordFailureAsync(string userId, string tenantId, string permissionName, string reason)
        {
            // 可以在这里添加更详细的记录逻辑
            _logger.LogWarning("Permission check failure: user={UserId}, permission={PermissionName}, reason={Reason}", 
                userId, permissionName, reason);
            return Task.CompletedTask;
        }

        public Task<RateLimitStatistics> GetStatisticsAsync()
        {
            lock (_statisticsLock)
            {
                return Task.FromResult(new RateLimitStatistics
                {
                    TotalRequests = _statistics.TotalRequests,
                    AllowedRequests = _statistics.AllowedRequests,
                    BlockedRequests = _statistics.BlockedRequests,
                    RequestsByPermission = new Dictionary<string, long>(_statistics.RequestsByPermission),
                    BlockedByPermission = new Dictionary<string, long>(_statistics.BlockedByPermission),
                    LastUpdated = _statistics.LastUpdated
                });
            }
        }

        public Task ResetUserRateLimitAsync(string userId, string tenantId)
        {
            try
            {
                var keysToRemove = new List<string>();
                var prefix = $"{tenantId}:{userId}:";

                foreach (var key in _counters.Keys)
                {
                    if (key.StartsWith(prefix))
                    {
                        keysToRemove.Add(key);
                    }
                }

                foreach (var key in keysToRemove)
                {
                    _counters.TryRemove(key, out _);
                }

                _logger.LogInformation("Reset rate limit for user {UserId} in tenant {TenantId}", userId, tenantId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resetting rate limit for user {UserId}", userId);
            }

            return Task.CompletedTask;
        }

        private int GetRateLimitForPermission(string permissionName)
        {
            // 根据权限名称返回不同的速率限制
            // 这里可以实现更复杂的逻辑，比如从配置中读取
            
            if (permissionName.Contains("Admin") || permissionName.Contains("Critical"))
            {
                return _options.AdminRateLimit;
            }
            
            if (permissionName.Contains("Read"))
            {
                return _options.ReadRateLimit;
            }
            
            if (permissionName.Contains("Write"))
            {
                return _options.WriteRateLimit;
            }

            return _options.DefaultRateLimit;
        }

        private bool IsInBlacklist(string userId, string tenantId)
        {
            // 检查用户是否在黑名单中
            var key = $"{tenantId}:{userId}";
            return _options.Blacklist?.Contains(key) == true;
        }

        private void UpdateStatistics(string permissionName, bool isAllowed)
        {
            lock (_statisticsLock)
            {
                _statistics.TotalRequests++;
                
                if (isAllowed)
                {
                    _statistics.AllowedRequests++;
                }
                else
                {
                    _statistics.BlockedRequests++;
                    
                    // 更新按权限的阻塞统计
                    if (!_statistics.BlockedByPermission.ContainsKey(permissionName))
                    {
                        _statistics.BlockedByPermission[permissionName] = 0;
                    }
                    _statistics.BlockedByPermission[permissionName]++;
                }

                // 更新按权限的请求统计
                if (!_statistics.RequestsByPermission.ContainsKey(permissionName))
                {
                    _statistics.RequestsByPermission[permissionName] = 0;
                }
                _statistics.RequestsByPermission[permissionName]++;
                
                _statistics.LastUpdated = DateTime.UtcNow;
            }
        }

        private string GenerateRateLimitKey(string userId, string tenantId, string permissionName)
        {
            return $"{tenantId}:{userId}:{permissionName}";
        }

        private void CleanupExpiredCounters(object state)
        {
            try
            {
                var now = DateTime.UtcNow;
                var expiredKeys = new List<string>();

                foreach (var kvp in _counters)
                {
                    var counter = kvp.Value;
                    
                    // 清理过期请求
                    counter.Requests = counter.Requests.Where(r => now - r < _options.WindowSize).ToList();
                    
                    // 如果计数器长时间未使用，则标记为删除
                    if (counter.Requests.Count == 0 && now - counter.LastAccessedAt > TimeSpan.FromHours(1))
                    {
                        expiredKeys.Add(kvp.Key);
                    }
                }

                // 移除过期计数器
                foreach (var key in expiredKeys)
                {
                    _counters.TryRemove(key, out _);
                }

                _logger.LogDebug("Cleaned up {ExpiredCount} expired rate limit counters", expiredKeys.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during rate limit cleanup");
            }
        }

        public void Dispose()
        {
            _cleanupTimer?.Dispose();
        }
    }

    /// <summary>
    /// 速率限制计数器
    /// </summary>
    internal class RateLimitCounter
    {
        public string Key { get; set; }
        public List<DateTime> Requests { get; set; } = new List<DateTime>();
        public DateTime CreatedAt { get; set; }
        public DateTime LastAccessedAt { get; set; }
    }
}