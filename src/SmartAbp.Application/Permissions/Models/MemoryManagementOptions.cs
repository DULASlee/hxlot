using System;

namespace SmartAbp.Permissions.Models
{
    /// <summary>
    /// 内存管理选项
    /// </summary>
    public class MemoryManagementOptions
    {
        /// <summary>
        /// 是否启用内存监控
        /// </summary>
        public bool EnableMemoryMonitoring { get; set; } = true;

        /// <summary>
        /// 内存使用率阈值（百分比，超过此阈值时触发告警）
        /// </summary>
        public double MemoryThreshold { get; set; } = 80.0;

        /// <summary>
        /// 内存检查间隔（默认30秒）
        /// </summary>
        public TimeSpan MemoryCheckInterval { get; set; } = TimeSpan.FromSeconds(30);

        /// <summary>
        /// 内存清理阈值（百分比，超过此阈值时触发清理）
        /// </summary>
        public double MemoryCleanupThreshold { get; set; } = 90.0;

        /// <summary>
        /// 是否启用内存清理
        /// </summary>
        public bool EnableMemoryCleanup { get; set; } = true;

        /// <summary>
        /// 内存清理间隔（默认5分钟）
        /// </summary>
        public TimeSpan MemoryCleanupInterval { get; set; } = TimeSpan.FromMinutes(5);

        /// <summary>
        /// 最大缓存项数（超过此数量时触发清理）
        /// </summary>
        public long MaxCacheItems { get; set; } = 100000;

        /// <summary>
        /// 缓存项过期时间（默认1小时）
        /// </summary>
        public TimeSpan CacheItemExpiration { get; set; } = TimeSpan.FromHours(1);

        /// <summary>
        /// 是否启用内存压缩
        /// </summary>
        public bool EnableMemoryCompression { get; set; } = false;

        /// <summary>
        /// 内存压缩阈值（百分比，超过此阈值时触发压缩）
        /// </summary>
        public double MemoryCompressionThreshold { get; set; } = 85.0;

        /// <summary>
        /// 是否启用内存池
        /// </summary>
        public bool EnableMemoryPool { get; set; } = true;

        /// <summary>
        /// 内存池大小（MB）
        /// </summary>
        public int MemoryPoolSize { get; set; } = 100;

        /// <summary>
        /// 是否启用内存泄漏检测
        /// </summary>
        public bool EnableMemoryLeakDetection { get; set; } = false;

        /// <summary>
        /// 内存泄漏检测间隔（默认10分钟）
        /// </summary>
        public TimeSpan MemoryLeakDetectionInterval { get; set; } = TimeSpan.FromMinutes(10);

        /// <summary>
        /// 内存泄漏阈值（MB，超过此阈值时触发告警）
        /// </summary>
        public int MemoryLeakThreshold { get; set; } = 500;

        /// <summary>
        /// 验证配置
        /// </summary>
        public void Validate()
        {
            if (MemoryThreshold <= 0 || MemoryThreshold > 100)
            {
                throw new ArgumentException("MemoryThreshold must be between 0 and 100", nameof(MemoryThreshold));
            }

            if (MemoryCheckInterval <= TimeSpan.Zero)
            {
                throw new ArgumentException("MemoryCheckInterval must be greater than zero", nameof(MemoryCheckInterval));
            }

            if (MemoryCleanupThreshold <= 0 || MemoryCleanupThreshold > 100)
            {
                throw new ArgumentException("MemoryCleanupThreshold must be between 0 and 100", nameof(MemoryCleanupThreshold));
            }

            if (MemoryCleanupInterval <= TimeSpan.Zero)
            {
                throw new ArgumentException("MemoryCleanupInterval must be greater than zero", nameof(MemoryCleanupInterval));
            }

            if (MaxCacheItems <= 0)
            {
                throw new ArgumentException("MaxCacheItems must be greater than zero", nameof(MaxCacheItems));
            }

            if (CacheItemExpiration <= TimeSpan.Zero)
            {
                throw new ArgumentException("CacheItemExpiration must be greater than zero", nameof(CacheItemExpiration));
            }

            if (MemoryCompressionThreshold <= 0 || MemoryCompressionThreshold > 100)
            {
                throw new ArgumentException("MemoryCompressionThreshold must be between 0 and 100", nameof(MemoryCompressionThreshold));
            }

            if (MemoryPoolSize <= 0)
            {
                throw new ArgumentException("MemoryPoolSize must be greater than zero", nameof(MemoryPoolSize));
            }

            if (MemoryLeakDetectionInterval <= TimeSpan.Zero)
            {
                throw new ArgumentException("MemoryLeakDetectionInterval must be greater than zero", nameof(MemoryLeakDetectionInterval));
            }

            if (MemoryLeakThreshold <= 0)
            {
                throw new ArgumentException("MemoryLeakThreshold must be greater than zero", nameof(MemoryLeakThreshold));
            }

            // 验证阈值关系
            if (MemoryCleanupThreshold <= MemoryThreshold)
            {
                throw new ArgumentException("MemoryCleanupThreshold must be greater than MemoryThreshold", nameof(MemoryCleanupThreshold));
            }

            if (MemoryCompressionThreshold <= MemoryThreshold)
            {
                throw new ArgumentException("MemoryCompressionThreshold must be greater than MemoryThreshold", nameof(MemoryCompressionThreshold));
            }

            if (MemoryCompressionThreshold >= MemoryCleanupThreshold)
            {
                throw new ArgumentException("MemoryCompressionThreshold must be less than MemoryCleanupThreshold", nameof(MemoryCompressionThreshold));
            }
        }
    }
}