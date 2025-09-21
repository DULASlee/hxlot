using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SmartAbp.Permissions.Models;
using StackExchange.Redis;

namespace SmartAbp.Permissions.Cache
{
    /// <summary>
    /// Redis权限缓存服务 - 企业级实现
    /// </summary>
    public class RedisPermissionCacheService : IPermissionCacheService
    {
        private readonly IConnectionMultiplexer _redis;
        private readonly IMemoryCache _memoryCache;
        private readonly ILogger<RedisPermissionCacheService> _logger;
        private readonly PermissionCacheOptions _options;
        private readonly IDatabase _database;

        public RedisPermissionCacheService(
            IConnectionMultiplexer redis,
            IMemoryCache memoryCache,
            ILogger<RedisPermissionCacheService> logger,
            IOptions<PermissionCacheOptions> options)
        {
            _redis = redis ?? throw new ArgumentNullException(nameof(redis));
            _memoryCache = memoryCache ?? throw new ArgumentNullException(nameof(memoryCache));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _options = options?.Value ?? throw new ArgumentNullException(nameof(options));
            _database = _redis.GetDatabase();
        }

        /// <summary>
        /// 获取用户权限集合
        /// </summary>
        public async Task<UserPermissionSet> GetUserPermissionsAsync(string userId, string tenantId)
        {
            if (string.IsNullOrEmpty(userId))
                throw new ArgumentException("User ID cannot be null or empty", nameof(userId));
            if (string.IsNullOrEmpty(tenantId))
                throw new ArgumentException("Tenant ID cannot be null or empty", nameof(tenantId));

            var cacheKey = GenerateCacheKey(userId, tenantId);
            
            try
            {
                // 先检查内存缓存 (L1缓存)
                if (_memoryCache.TryGetValue(cacheKey, out UserPermissionSet cachedPermissions))
                {
                    _logger.LogDebug("Cache hit in memory cache for user {UserId} in tenant {TenantId}", userId, tenantId);
                    return cachedPermissions;
                }

                // 再检查Redis缓存 (L2缓存)
                var redisValue = await _database.StringGetAsync(cacheKey);
                if (redisValue.HasValue)
                {
                    var permissions = System.Text.Json.JsonSerializer.Deserialize<UserPermissionSet>(redisValue);
                    
                    // 设置内存缓存
                    var memoryCacheOptions = new MemoryCacheEntryOptions
                    {
                        AbsoluteExpirationRelativeToNow = _options.SlidingExpiration,
                        SlidingExpiration = _options.SlidingExpiration
                    };
                    _memoryCache.Set(cacheKey, permissions, memoryCacheOptions);

                    _logger.LogDebug("Cache hit in Redis for user {UserId} in tenant {TenantId}", userId, tenantId);
                    return permissions;
                }

                _logger.LogDebug("Cache miss for user {UserId} in tenant {TenantId}", userId, tenantId);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting permissions from cache for user {UserId} in tenant {TenantId}", userId, tenantId);
                return null;
            }
        }

        /// <summary>
        /// 设置用户权限集合
        /// </summary>
        public async Task<bool> SetUserPermissionsAsync(string userId, string tenantId, UserPermissionSet permissions)
        {
            if (string.IsNullOrEmpty(userId))
                throw new ArgumentException("User ID cannot be null or empty", nameof(userId));
            if (string.IsNullOrEmpty(tenantId))
                throw new ArgumentException("Tenant ID cannot be null or empty", nameof(tenantId));
            if (permissions == null)
                throw new ArgumentNullException(nameof(permissions));

            var cacheKey = GenerateCacheKey(userId, tenantId);
            
            try
            {
                var serializedPermissions = System.Text.Json.JsonSerializer.Serialize(permissions);
                var expiry = _options.DefaultExpiration;

                // 设置Redis缓存 (L2缓存)
                var redisSuccess = await _database.StringSetAsync(cacheKey, serializedPermissions, expiry);
                
                // 设置内存缓存 (L1缓存)
                var memoryCacheOptions = new MemoryCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = expiry,
                    SlidingExpiration = _options.SlidingExpiration
                };
                _memoryCache.Set(cacheKey, permissions, memoryCacheOptions);

                _logger.LogDebug("Successfully cached permissions for user {UserId} in tenant {TenantId}", userId, tenantId);
                return redisSuccess;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting permissions in cache for user {UserId} in tenant {TenantId}", userId, tenantId);
                return false;
            }
        }

        /// <summary>
        /// 移除用户权限缓存
        /// </summary>
        public async Task<bool> RemoveUserPermissionsAsync(string userId, string tenantId)
        {
            if (string.IsNullOrEmpty(userId))
                throw new ArgumentException("User ID cannot be null or empty", nameof(userId));
            if (string.IsNullOrEmpty(tenantId))
                throw new ArgumentException("Tenant ID cannot be null or empty", nameof(tenantId));

            var cacheKey = GenerateCacheKey(userId, tenantId);
            
            try
            {
                // 移除Redis缓存
                var redisRemoved = await _database.KeyDeleteAsync(cacheKey);
                
                // 移除内存缓存
                _memoryCache.Remove(cacheKey);

                _logger.LogDebug("Successfully removed permissions from cache for user {UserId} in tenant {TenantId}", userId, tenantId);
                return redisRemoved;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing permissions from cache for user {UserId} in tenant {TenantId}", userId, tenantId);
                return false;
            }
        }

        /// <summary>
        /// 刷新用户权限缓存
        /// </summary>
        public async Task<bool> RefreshUserPermissionsAsync(string userId, string tenantId)
        {
            if (string.IsNullOrEmpty(userId))
                throw new ArgumentException("User ID cannot be null or empty", nameof(userId));
            if (string.IsNullOrEmpty(tenantId))
                throw new ArgumentException("Tenant ID cannot be null or empty", nameof(tenantId));

            try
            {
                // 获取当前缓存的权限
                var currentPermissions = await GetUserPermissionsAsync(userId, tenantId);
                
                if (currentPermissions != null)
                {
                    // 更新过期时间
                    currentPermissions.ExpiresAt = DateTime.UtcNow.Add(_options.DefaultExpiration);
                    
                    // 重新设置缓存
                    return await SetUserPermissionsAsync(userId, tenantId, currentPermissions);
                }

                _logger.LogDebug("No permissions found in cache to refresh for user {UserId} in tenant {TenantId}", userId, tenantId);
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error refreshing permissions in cache for user {UserId} in tenant {TenantId}", userId, tenantId);
                return false;
            }
        }

        /// <summary>
        /// 生成缓存键
        /// </summary>
        private string GenerateCacheKey(string userId, string tenantId)
        {
            return $"permissions:{tenantId}:{userId}";
        }
    }
}