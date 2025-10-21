namespace SmartAbp.PermissionManagement.Application.Contracts.MultiTenant.Dtos;

/// <summary>
/// 租户权限隔离验证结果
/// </summary>
public class TenantPermissionIsolationResult
{
    /// <summary>
    /// 租户ID
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// 是否完全隔离
    /// </summary>
    public bool IsFullyIsolated { get; set; }

    /// <summary>
    /// 租户权限总数
    /// </summary>
    public int TotalPermissionCount { get; set; }

    /// <summary>
    /// 跨租户权限数量（异常情况）
    /// </summary>
    public int CrossTenantPermissionCount { get; set; }

    /// <summary>
    /// 孤立权限数量（Provider不存在）
    /// </summary>
    public int OrphanedPermissionCount { get; set; }

    /// <summary>
    /// 验证时间
    /// </summary>
    public DateTime ValidationTime { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// 验证详情
    /// </summary>
    public List<string> ValidationDetails { get; set; } = new();
}

