using System;
using System.Collections.Generic;

namespace SmartAbp.Permissions.Security
{
    /// <summary>
    /// 权限速率限制选项
    /// </summary>
    public class PermissionRateLimitOptions
    {
        /// <summary>
        /// 是否启用速率限制
        /// </summary>
        public bool EnableRateLimiting { get; set; } = true;

        /// <summary>
        /// 默认速率限制（每秒请求数）
        /// </summary>
        public int DefaultRateLimitPerSecond { get; set; } = 100;

        /// <summary>
        /// 用户级别速率限制（每秒请求数）
        /// </summary>
        public int UserRateLimitPerSecond { get; set; } = 10;

        /// <summary>
        /// 租户级别速率限制（每秒请求数）
        /// </summary>
        public int TenantRateLimitPerSecond { get; set; } = 50;

        /// <summary>
        /// IP地址级别速率限制（每秒请求数）
        /// </summary>
        public int IpRateLimitPerSecond { get; set; } = 5;

        /// <summary>
        /// 速率限制窗口大小（秒）
        /// </summary>
        public int RateLimitWindowSeconds { get; set; } = 1;

        /// <summary>
        /// 速率限制违规惩罚时间（秒）
        /// </summary>
        public int RateLimitPenaltySeconds { get; set; } = 60;

        /// <summary>
        /// 是否启用IP白名单
        /// </summary>
        public bool EnableIpWhitelist { get; set; } = true;

        /// <summary>
        /// IP白名单
        /// </summary>
        public List<string> IpWhitelist { get; set; } = new List<string>();

        /// <summary>
        /// 是否启用IP黑名单
        /// </summary>
        public bool EnableIpBlacklist { get; set; } = true;

        /// <summary>
        /// IP黑名单
        /// </summary>
        public List<string> IpBlacklist { get; set; } = new List<string>();

        /// <summary>
        /// 速率限制存储类型（Memory、Redis、Database）
        /// </summary>
        public string RateLimitStorageType { get; set; } = "Memory";

        /// <summary>
        /// 速率限制Redis连接字符串
        /// </summary>
        public string RateLimitRedisConnectionString { get; set; } = "localhost:6379";

        /// <summary>
        /// 速率限制数据库连接字符串
        /// </summary>
        public string RateLimitDatabaseConnectionString { get; set; } = string.Empty;

        /// <summary>
        /// 是否记录速率限制违规
        /// </summary>
        public bool LogRateLimitViolations { get; set; } = true;

        /// <summary>
        /// 速率限制违规日志级别
        /// </summary>
        public string RateLimitViolationLogLevel { get; set; } = "Warning";

        /// <summary>
        /// 是否启用速率限制告警
        /// </summary>
        public bool EnableRateLimitAlerts { get; set; } = true;

        /// <summary>
        /// 速率限制告警阈值（连续违规次数）
        /// </summary>
        public int RateLimitAlertThreshold { get; set; } = 5;

        /// <summary>
        /// 特殊权限的速率限制配置
        /// </summary>
        public Dictionary<string, int> SpecialPermissionRateLimits { get; set; } = new Dictionary<string, int>();

        /// <summary>
        /// 是否启用动态速率限制
        /// </summary>
        public bool EnableDynamicRateLimiting { get; set; } = true;

        /// <summary>
        /// 动态速率限制调整间隔（分钟）
        /// </summary>
        public int DynamicRateLimitAdjustmentIntervalMinutes { get; set; } = 5;

        /// <summary>
        /// 动态速率限制最大调整比例
        /// </summary>
        public double DynamicRateLimitMaxAdjustmentRatio { get; set; } = 0.5;
    }
}