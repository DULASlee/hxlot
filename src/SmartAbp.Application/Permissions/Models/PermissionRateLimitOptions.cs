using System;
using System.Collections.Generic;

namespace SmartAbp.Permissions.Models
{
    /// <summary>
    /// 权限速率限制选项
    /// </summary>
    public class PermissionRateLimitOptions
    {
        /// <summary>
        /// 是否启用速率限制
        /// </summary>
        public bool Enabled { get; set; } = true;

        /// <summary>
        /// 时间窗口大小（默认1分钟）
        /// </summary>
        public TimeSpan WindowSize { get; set; } = TimeSpan.FromMinutes(1);

        /// <summary>
        /// 默认速率限制（每分钟请求数）
        /// </summary>
        public int DefaultRateLimit { get; set; } = 100;

        /// <summary>
        /// 读取操作的速率限制（每分钟请求数）
        /// </summary>
        public int ReadRateLimit { get; set; } = 200;

        /// <summary>
        /// 写入操作的速率限制（每分钟请求数）
        /// </summary>
        public int WriteRateLimit { get; set; } = 50;

        /// <summary>
        /// 管理员操作的速率限制（每分钟请求数）
        /// </summary>
        public int AdminRateLimit { get; set; } = 20;

        /// <summary>
        /// 惩罚持续时间（用户被限制时的重试等待时间）
        /// </summary>
        public TimeSpan PenaltyDuration { get; set; } = TimeSpan.FromMinutes(5);

        /// <summary>
        /// 黑名单（用户ID列表，格式：tenantId:userId）
        /// </summary>
        public HashSet<string> Blacklist { get; set; } = new HashSet<string>();

        /// <summary>
        /// 是否启用内存监控
        /// </summary>
        public bool EnableMemoryMonitoring { get; set; } = true;

        /// <summary>
        /// 内存使用率阈值（百分比，超过此阈值时触发告警）
        /// </summary>
        public double MemoryThreshold { get; set; } = 80.0;

        /// <summary>
        /// 是否启用性能监控
        /// </summary>
        public bool EnablePerformanceMonitoring { get; set; } = true;

        /// <summary>
        /// 性能阈值（毫秒，超过此值时触发告警）
        /// </summary>
        public double PerformanceThreshold { get; set; } = 100.0;

        /// <summary>
        /// 是否启用异常监控
        /// </summary>
        public bool EnableExceptionMonitoring { get; set; } = true;

        /// <summary>
        /// 异常率阈值（百分比，超过此值时触发告警）
        /// </summary>
        public double ExceptionThreshold { get; set; } = 5.0;

        /// <summary>
        /// 验证配置
        /// </summary>
        public void Validate()
        {
            if (WindowSize <= TimeSpan.Zero)
            {
                throw new ArgumentException("WindowSize must be greater than zero", nameof(WindowSize));
            }

            if (DefaultRateLimit <= 0)
            {
                throw new ArgumentException("DefaultRateLimit must be greater than zero", nameof(DefaultRateLimit));
            }

            if (ReadRateLimit <= 0)
            {
                throw new ArgumentException("ReadRateLimit must be greater than zero", nameof(ReadRateLimit));
            }

            if (WriteRateLimit <= 0)
            {
                throw new ArgumentException("WriteRateLimit must be greater than zero", nameof(WriteRateLimit));
            }

            if (AdminRateLimit <= 0)
            {
                throw new ArgumentException("AdminRateLimit must be greater than zero", nameof(AdminRateLimit));
            }

            if (PenaltyDuration <= TimeSpan.Zero)
            {
                throw new ArgumentException("PenaltyDuration must be greater than zero", nameof(PenaltyDuration));
            }

            if (MemoryThreshold <= 0 || MemoryThreshold > 100)
            {
                throw new ArgumentException("MemoryThreshold must be between 0 and 100", nameof(MemoryThreshold));
            }

            if (PerformanceThreshold <= 0)
            {
                throw new ArgumentException("PerformanceThreshold must be greater than zero", nameof(PerformanceThreshold));
            }

            if (ExceptionThreshold < 0 || ExceptionThreshold > 100)
            {
                throw new ArgumentException("ExceptionThreshold must be between 0 and 100", nameof(ExceptionThreshold));
            }
        }
    }
}