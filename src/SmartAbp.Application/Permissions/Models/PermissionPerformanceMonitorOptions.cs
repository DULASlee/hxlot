using System;

namespace SmartAbp.Permissions.Models
{
    /// <summary>
    /// 权限性能监控选项
    /// </summary>
    public class PermissionPerformanceMonitorOptions
    {
        /// <summary>
        /// 是否启用性能监控
        /// </summary>
        public bool Enabled { get; set; } = true;

        /// <summary>
        /// 性能阈值（毫秒，超过此值时触发告警）
        /// </summary>
        public double PerformanceThreshold { get; set; } = 100.0;

        /// <summary>
        /// 性能阈值毫秒（与PerformanceThreshold相同，用于兼容性）
        /// </summary>
        public double PerformanceThresholdMs => PerformanceThreshold;

        /// <summary>
        /// 监控窗口大小（默认5分钟）
        /// </summary>
        public TimeSpan MonitoringWindow { get; set; } = TimeSpan.FromMinutes(5);

        /// <summary>
        /// 采样率（0.0-1.0，1.0表示100%采样）
        /// </summary>
        public double SamplingRate { get; set; } = 1.0;

        /// <summary>
        /// 是否记录慢查询
        /// </summary>
        public bool EnableSlowQueryLogging { get; set; } = true;

        /// <summary>
        /// 慢查询阈值（毫秒）
        /// </summary>
        public double SlowQueryThreshold { get; set; } = 50.0;

        /// <summary>
        /// 是否启用性能分析
        /// </summary>
        public bool EnableProfiling { get; set; } = false;

        /// <summary>
        /// 性能分析采样间隔（毫秒）
        /// </summary>
        public int ProfilingInterval { get; set; } = 1000;

        /// <summary>
        /// 验证配置
        /// </summary>
        public void Validate()
        {
            if (PerformanceThreshold <= 0)
            {
                throw new ArgumentException("PerformanceThreshold must be greater than zero", nameof(PerformanceThreshold));
            }

            if (MonitoringWindow <= TimeSpan.Zero)
            {
                throw new ArgumentException("MonitoringWindow must be greater than zero", nameof(MonitoringWindow));
            }

            if (SamplingRate < 0 || SamplingRate > 1)
            {
                throw new ArgumentException("SamplingRate must be between 0 and 1", nameof(SamplingRate));
            }

            if (SlowQueryThreshold <= 0)
            {
                throw new ArgumentException("SlowQueryThreshold must be greater than zero", nameof(SlowQueryThreshold));
            }

            if (ProfilingInterval <= 0)
            {
                throw new ArgumentException("ProfilingInterval must be greater than zero", nameof(ProfilingInterval));
            }
        }
    }
}