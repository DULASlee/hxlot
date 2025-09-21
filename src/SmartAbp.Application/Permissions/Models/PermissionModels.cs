using System;
using System.Collections.Generic;

namespace SmartAbp.Permissions.Models
{
    /// <summary>
    /// 用户权限集合
    /// </summary>
    public class UserPermissionSet
    {
        public string UserId { get; set; }
        public string TenantId { get; set; }
        public List<Permission> Permissions { get; set; } = new List<Permission>();
        public DateTime ExpiresAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// 权限实体
    /// </summary>
    public class Permission
    {
        public string Name { get; set; }
        public string Resource { get; set; }
        public bool IsGranted { get; set; }
        public string Description { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// 角色实体
    /// </summary>
    public class Role
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string DisplayName { get; set; }
        public string Description { get; set; }
        public bool IsStatic { get; set; }
        public bool IsDefault { get; set; }
        public bool IsPublic { get; set; }
        public List<Permission> Permissions { get; set; } = new List<Permission>();
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// 用户活动信息 (用于缓存预热)
    /// </summary>
    public class UserActivity
    {
        public string Id { get; set; }
        public string TenantId { get; set; }
        public DateTime LastActivityTime { get; set; }
        public int PermissionCount { get; set; }
        public bool IsActive => DateTime.UtcNow - LastActivityTime < TimeSpan.FromHours(24);
    }

    /// <summary>
    /// 权限缓存配置
    /// </summary>
    public class PermissionCacheOptions
    {
        public TimeSpan DefaultExpiration { get; set; } = TimeSpan.FromMinutes(30);
        public TimeSpan SlidingExpiration { get; set; } = TimeSpan.FromMinutes(15);
        public int MaxRetryAttempts { get; set; } = 3;
        public TimeSpan RetryDelay { get; set; } = TimeSpan.FromSeconds(1);
        public bool EnableCompression { get; set; } = true;
        public bool EnableEncryption { get; set; } = true;
    }

    /// <summary>
    /// 权限计算结果
    /// </summary>
    public class PermissionCalculationResult
    {
        public bool IsGranted { get; set; }
        public string PermissionName { get; set; }
        public string Resource { get; set; }
        public PermissionSource Source { get; set; }
        public DateTime CalculatedAt { get; set; } = DateTime.UtcNow;
        public long CalculationTimeMs { get; set; }
    }

    /// <summary>
    /// 权限来源枚举
    /// </summary>
    public enum PermissionSource
    {
        Direct = 1,      // 直接权限
        Role = 2,        // 角色权限  
        Inheritance = 3,   // 继承权限
        Organization = 4 // 组织权限
    }

    /// <summary>
    /// 权限性能指标
    /// </summary>
    public class PermissionPerformanceMetrics
    {
        public long CacheHitCount { get; set; }
        public long CacheMissCount { get; set; }
        public double CacheHitRate => CacheHitCount / (double)(CacheHitCount + CacheMissCount);
        public double AverageResponseTimeMs { get; set; }
        public double P99ResponseTimeMs { get; set; }
        public long TotalRequests { get; set; }
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
        
        // 新增属性以满足构建需求
        public double ErrorRate { get; set; }
        public double MemoryUsageMB { get; set; }
        public double CpuUsagePercent { get; set; }
        public double ThroughputRPS { get; set; }
        public double P95ResponseTimeMs { get; set; }
    }
}