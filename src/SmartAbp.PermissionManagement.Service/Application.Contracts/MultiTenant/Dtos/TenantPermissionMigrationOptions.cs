namespace SmartAbp.PermissionManagement.Application.Contracts.MultiTenant.Dtos;

/// <summary>
/// 租户权限迁移选项
/// </summary>
public class TenantPermissionMigrationOptions
{
    /// <summary>
    /// 是否迁移用户权限
    /// </summary>
    public bool MigrateUserPermissions { get; set; } = true;

    /// <summary>
    /// 是否迁移角色权限
    /// </summary>
    public bool MigrateRolePermissions { get; set; } = true;

    /// <summary>
    /// 是否迁移组织单元权限
    /// </summary>
    public bool MigrateOrganizationUnitPermissions { get; set; } = true;

    /// <summary>
    /// 是否覆盖已存在的权限
    /// </summary>
    public bool OverrideExisting { get; set; } = false;

    /// <summary>
    /// 权限名称过滤（可选，为空则迁移所有）
    /// </summary>
    public List<string>? PermissionNameFilters { get; set; }

    /// <summary>
    /// 是否保留过期时间
    /// </summary>
    public bool PreserveExpirationTime { get; set; } = true;
}

