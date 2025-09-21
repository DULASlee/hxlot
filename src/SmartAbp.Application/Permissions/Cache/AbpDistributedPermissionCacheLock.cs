using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Volo.Abp.DependencyInjection;
using Volo.Abp.DistributedLocking;

namespace SmartAbp.Permissions.Cache
{
    /// <summary>
    /// 基于ABP框架分布式锁的权限缓存锁实现
    /// 集成Volo.Abp.DistributedLocking，提供更可靠的分布式锁服务
    /// </summary>
    public interface IAbpDistributedPermissionCacheLock
    {
        /// <summary>
        /// 获取分布式锁
        /// </summary>
        /// <param name="resource">资源标识</param>
        /// <param name="ttl">锁的过期时间</param>
        /// <param name="cancellationToken">取消令牌</param>
        /// <returns>锁对象，获取失败返回null</returns>
        Task<IAbpDistributedLock> AcquireAsync(string resource, TimeSpan ttl, CancellationToken cancellationToken = default);

        /// <summary>
        /// 尝试获取分布式锁
        /// </summary>
        /// <param name="resource">资源标识</param>
        /// <param name="ttl">锁的过期时间</param>
        /// <param name="timeout">获取锁的超时时间</param>
        /// <param name="cancellationToken">取消令牌</param>
        /// <returns>锁对象，获取失败返回null</returns>
        Task<IAbpDistributedLock> TryAcquireAsync(string resource, TimeSpan ttl, TimeSpan timeout, CancellationToken cancellationToken = default);
    }

    /// <summary>
    /// ABP分布式锁对象
    /// </summary>
    public interface IAbpDistributedLock : IDisposable
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
    /// 基于ABP框架的分布式锁实现
    /// </summary>
    public class AbpDistributedPermissionCacheLock : IAbpDistributedPermissionCacheLock, ITransientDependency
    {
        private readonly IAbpDistributedLock _distributedLock;
        private readonly ILogger<AbpDistributedPermissionCacheLock> _logger;
        private readonly string _keyPrefix = "permission:cache:lock:";

        public AbpDistributedPermissionCacheLock(
            IAbpDistributedLock distributedLock,
            ILogger<AbpDistributedPermissionCacheLock> logger)
        {
            _distributedLock = distributedLock ?? throw new ArgumentNullException(nameof(distributedLock));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<IAbpDistributedLock> AcquireAsync(string resource, TimeSpan ttl, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(resource))
                throw new ArgumentException("Resource cannot be null or empty", nameof(resource));

            if (ttl <= TimeSpan.Zero)
                throw new ArgumentException("TTL must be positive", nameof(ttl));

            var lockKey = _keyPrefix + resource;
            var lockId = Guid.NewGuid().ToString();

            try
            {
                // 使用ABP分布式锁获取锁
                var abpLockHandle = await _distributedLock.TryAcquireAsync(
                    lockKey, 
                    ttl, 
                    cancellationToken: cancellationToken);

                if (abpLockHandle != null)
                {
                    _logger.LogDebug("ABP distributed lock acquired for resource: {Resource}, LockId: {LockId}", resource, lockId);
                    return new AbpDistributedLock(abpLockHandle, lockKey, lockId, resource, _logger);
                }

                _logger.LogDebug("Failed to acquire ABP distributed lock for resource: {Resource}", resource);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error acquiring ABP distributed lock for resource: {Resource}", resource);
                return null;
            }
        }

        public async Task<IAbpDistributedLock> TryAcquireAsync(string resource, TimeSpan ttl, TimeSpan timeout, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(resource))
                throw new ArgumentException("Resource cannot be null or empty", nameof(resource));

            if (ttl <= TimeSpan.Zero)
                throw new ArgumentException("TTL must be positive", nameof(ttl));

            var lockKey = _keyPrefix + resource;
            var lockId = Guid.NewGuid().ToString();

            try
            {
                using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
                cts.CancelAfter(timeout);

                // 使用ABP分布式锁获取锁，支持超时
                var abpLockHandle = await _distributedLock.TryAcquireAsync(
                    lockKey, 
                    ttl, 
                    cancellationToken: cts.Token);

                if (abpLockHandle != null)
                {
                    _logger.LogDebug("ABP distributed lock acquired for resource: {Resource}, LockId: {LockId}, Timeout: {Timeout}", resource, lockId, timeout);
                    return new AbpDistributedLock(abpLockHandle, lockKey, lockId, resource, _logger);
                }

                _logger.LogDebug("Failed to acquire ABP distributed lock for resource: {Resource} within timeout: {Timeout}", resource, timeout);
                return null;
            }
            catch (OperationCanceledException)
            {
                _logger.LogWarning("Timeout acquiring ABP distributed lock for resource: {Resource}, Timeout: {Timeout}", resource, timeout);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error acquiring ABP distributed lock for resource: {Resource}", resource);
                return null;
            }
        }
    }

    /// <summary>
    /// ABP分布式锁包装器
    /// </summary>
    public class AbpDistributedLock : IAbpDistributedLock
    {
        private readonly IDisposable _abpLockHandle;
        private readonly ILogger _logger;
        private bool _disposed;

        public string Resource { get; }
        public string LockId { get; }
        public bool IsValid => !_disposed && _abpLockHandle != null;
        public bool IsAcquired => !_disposed && _abpLockHandle != null;

        public AbpDistributedLock(IDisposable abpLockHandle, string lockKey, string lockId, string resource, ILogger logger)
        {
            _abpLockHandle = abpLockHandle ?? throw new ArgumentNullException(nameof(abpLockHandle));
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
                _abpLockHandle?.Dispose();
                _logger.LogDebug("ABP distributed lock released for resource: {Resource}, LockId: {LockId}", Resource, LockId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error releasing ABP distributed lock for resource: {Resource}, LockId: {LockId}", Resource, LockId);
                return false;
            }
        }

        public void Dispose()
        {
            if (!_disposed)
            {
                try
                {
                    _abpLockHandle?.Dispose();
                    _logger.LogDebug("ABP distributed lock disposed for resource: {Resource}, LockId: {LockId}", Resource, LockId);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error disposing ABP distributed lock for resource: {Resource}", Resource);
                }
                finally
                {
                    _disposed = true;
                }
            }
        }
    }

    /// <summary>
    /// ABP分布式锁扩展配置
    /// </summary>
    public static class AbpDistributedLockServiceExtensions
    {
        public static void AddAbpDistributedPermissionCacheLock(this IServiceCollection services)
        {
            services.AddTransient<IAbpDistributedPermissionCacheLock, AbpDistributedPermissionCacheLock>();
        }
    }
}