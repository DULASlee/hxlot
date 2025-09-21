using System;
using System.Collections.Generic;

namespace SmartAbp.Permissions.Performance
{
    /// <summary>
    /// 权限性能监控选项
    /// </summary>
    public class PermissionPerformanceMonitorOptions
    {
        /// <summary>
        /// 性能阈值（毫秒）
        /// </summary>
        public double PerformanceThresholdMs { get; set; } = 1.0;

        /// <summary>
        /// 是否启用告警
        /// </summary>
        public bool EnableAlerts { get; set; } = true;

        /// <summary>
        /// 缓存命中率阈值
        /// </summary>
        public double CacheHitRateThreshold { get; set; } = 0.98;

        /// <summary>
        /// 最大响应时间记录数
        /// </summary>
        public int MaxResponseTimeRecords { get; set; } = 10000;

        /// <summary>
        /// 性能监控间隔（秒）
        /// </summary>
        public int MonitoringIntervalSeconds { get; set; } = 60;

        /// <summary>
        /// 是否启用趋势分析
        /// </summary>
        public bool EnableTrendAnalysis { get; set; } = true;

        /// <summary>
        /// 趋势分析时间窗口（小时）
        /// </summary>
        public int TrendAnalysisWindowHours { get; set; } = 24;

        /// <summary>
        /// 告警冷却时间（分钟）
        /// </summary>
        public int AlertCooldownMinutes { get; set; } = 5;

        /// <summary>
        /// 最大告警次数（每分钟）
        /// </summary>
        public int MaxAlertsPerMinute { get; set; } = 10;

        /// <summary>
        /// 性能指标过期时间（小时）
        /// </summary>
        public int MetricsExpirationHours { get; set; } = 24;

        /// <summary>
        /// 是否启用P99响应时间计算
        /// </summary>
        public bool EnableP99Calculation { get; set; } = true;

        /// <summary>
        /// 慢查询阈值（毫秒）
        /// </summary>
        public double SlowQueryThresholdMs { get; set; } = 5.0;

        /// <summary>
        /// 错误率阈值
        /// </summary>
        public double ErrorRateThreshold { get; set; } = 0.01;

        /// <summary>
        /// 监控的操作类型列表
        /// </summary>
        public List<string> MonitoredOperationTypes { get; set; } = new List<string>
        {
            "PermissionCheck",
            "RolePermissionCheck",
            "UserPermissionCheck",
            "PermissionCacheHit",
            "PermissionCacheMiss"
        };

        /// <summary>
        /// 是否启用内存监控
        /// </summary>
        public bool EnableMemoryMonitoring { get; set; } = true;

        /// <summary>
        /// 内存警告阈值（MB）
        /// </summary>
        public long MemoryWarningThresholdMB { get; set; } = 512;

        /// <summary>
        /// 内存关键阈值（MB）
        /// </summary>
        public long MemoryCriticalThresholdMB { get; set; } = 1024;
    }
}