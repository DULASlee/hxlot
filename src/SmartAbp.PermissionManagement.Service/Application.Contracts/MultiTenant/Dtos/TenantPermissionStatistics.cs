namespace SmartAbp.PermissionManagement.Application.Contracts.MultiTenant.Dtos;

/// <summary>
/// 租户权限统计
/// </summary>
public class TenantPermissionStatistics
{
    /// <summary>
    /// 租户ID
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// 租户名称
    /// </summary>
    public string? TenantName { get; set; }

    /// <summary>
    /// 总权限数量
    /// </summary>
    public int TotalPermissionCount { get; set; }

    /// <summary>
    /// 用户权限数量
    /// </summary>
    public int UserPermissionCount { get; set; }

    /// <summary>
    /// 角色权限数量
    /// </summary>
    public int RolePermissionCount { get; set; }

    /// <summary>
    /// 组织单元权限数量
    /// </summary>
    public int OrganizationUnitPermissionCount { get; set; }

    /// <summary>
    /// 永久权限数量
    /// </summary>
    public int PermanentPermissionCount { get; set; }

    /// <summary>
    /// 临时权限数量
    /// </summary>
    public int TemporaryPermissionCount { get; set; }

    /// <summary>
    /// 已过期权限数量
    /// </summary>
    public int ExpiredPermissionCount { get; set; }

    /// <summary>
    /// 条件权限数量
    /// </summary>
    public int ConditionalPermissionCount { get; set; }

    /// <summary>
    /// 统计时间
    /// </summary>
    public DateTime StatisticsTime { get; set; } = DateTime.UtcNow;
}

