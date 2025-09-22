using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;

namespace SmartAbp.Permissions.Cache
{
    /// <summary>
    /// 分布式权限缓存锁 - 防止缓存击穿
    /// 基于Redis Redlock算法实现
    /// </summary>
    public interface IDistributedPermissionCacheLock
    {
        /// <summary>
        /// 获取分布式锁
        /// </summary>
        /// <param name="resource">资源标识</param>
        /// <param name="ttl">锁的过期时间</param>
        /// <param name="cancellationToken">取消令牌</param>
        /// <returns>锁对象，获取失败返回null</returns>
        Task<IDistributedLock> AcquireAsync(string resource, TimeSpan ttl, CancellationToken cancellationToken = default);
    }

    /// <summary>
    /// 分布式锁对象
    /// </summary>
    public interface IDistributedLock : IDisposable
    {
        /// <summary>
        /// 锁资源标识
        /// </summary>
        string Resource { get; }

        /// <summary>
        /// 锁的唯一标识
        /// </summary>
        string LockId { get; }

        /// <summary>
        /// 是否仍然有效
        /// </summary>
        bool IsValid { get; }

        /// <summary>
        /// 是否已获取锁
        /// </summary>
        bool IsAcquired { get; }

        /// <summary>
        /// 释放锁
        /// </summary>
        Task<bool> ReleaseAsync();
    }

    /// <summary>
    /// 基于Redis的分布式锁实现 - Redlock算法
    /// </summary>
    public class RedisDistributedPermissionCacheLock : IDistributedPermissionCacheLock
    {
        private readonly IConnectionMultiplexer _redis;
        private readonly ILogger<RedisDistributedPermissionCacheLock> _logger;
        private readonly string _keyPrefix = "permission:lock:";

        public RedisDistributedPermissionCacheLock(
            IConnectionMultiplexer redis,
            ILogger<RedisDistributedPermissionCacheLock> logger)
        {
            _redis = redis ?? throw new ArgumentNullException(nameof(redis));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<IDistributedLock> AcquireAsync(string resource, TimeSpan ttl, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(resource))
                throw new ArgumentException("Resource cannot be null or empty", nameof(resource));

            if (ttl <= TimeSpan.Zero)
                throw new ArgumentException("TTL must be positive", nameof(ttl));

            var lockId = Guid.NewGuid().ToString();
            var lockKey = _keyPrefix + resource;
            var database = _redis.GetDatabase();

            try
            {
                // 使用SET命令的NX(不存在才设置)和PX(过期时间)参数实现原子性
                var acquired = await database.StringSetAsync(
                    lockKey, 
                    lockId, 
                    ttl, 
                    When.NotExists, 
                    CommandFlags.DemandMaster);

                if (acquired)
                {
                    _logger.LogDebug("Distributed lock acquired for resource: {Resource}, LockId: {LockId}", resource, lockId);
                    return new RedisDistributedLock(database, lockKey, lockId, resource, _logger);
                }

                _logger.LogDebug("Failed to acquire distributed lock for resource: {Resource}", resource);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error acquiring distributed lock for resource: {Resource}", resource);
                return null;
            }
        }
    }

    /// <summary>
    /// Redis分布式锁实现
    /// </summary>
    public class RedisDistributedLock : IDistributedLock
    {
        private readonly IDatabase _database;
        private readonly string _lockKey;
        private readonly ILogger _logger;
        private bool _disposed;

        public string Resource { get; }
        public string LockId { get; }
        public bool IsValid => !_disposed;
        public bool IsAcquired => !_disposed;

        public RedisDistributedLock(IDatabase database, string lockKey, string lockId, string resource, ILogger logger)
        {
            _database = database ?? throw new ArgumentNullException(nameof(database));
            _lockKey = lockKey ?? throw new ArgumentNullException(nameof(lockKey));
            LockId = lockId ?? throw new ArgumentNullException(nameof(lockId));
            Resource = resource ?? throw new ArgumentNullException(nameof(resource));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<bool> ReleaseAsync()
        {
            if (_disposed)
                return false;

            try
            {
                // 使用Lua脚本确保原子性：只有锁的持有者才能释放锁
                var script = @"
                    if redis.call('get', KEYS[1]) == ARGV[1] then
                        return redis.call('del', KEYS[1])
                    else
                        return 0
                    end";

                var result = await _database.ScriptEvaluateAsync(script, 
                    new StackExchange.Redis.RedisKey[] { _lockKey }, 
                    new StackExchange.Redis.RedisValue[] { LockId });
                var released = (long)result == 1;

                if (released)
                {
                    _logger.LogDebug("Distributed lock released for resource: {Resource}, LockId: {LockId}", Resource, LockId);
                }
                else
                {
                    _logger.LogWarning("Failed to release distributed lock for resource: {Resource}, LockId: {LockId}. Lock may have expired or been taken by another process.", Resource, LockId);
                }

                return released;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error releasing distributed lock for resource: {Resource}, LockId: {LockId}", Resource, LockId);
                return false;
            }
        }

        public void Dispose()
        {
            if (!_disposed)
            {
                try
                {
                    // 异步释放锁，但不等待完成
                    var _ = ReleaseAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error disposing distributed lock for resource: {Resource}", Resource);
                }
                finally
                {
                    _disposed = true;
                }
            }
        }
    }

    /// <summary>
    /// 分布式锁扩展配置
    /// </summary>
    public static class DistributedLockServiceExtensions
    {
        public static void AddDistributedPermissionCacheLock(this IServiceCollection services)
        {
            services.AddSingleton<IDistributedPermissionCacheLock, RedisDistributedPermissionCacheLock>();
        }
    }
}