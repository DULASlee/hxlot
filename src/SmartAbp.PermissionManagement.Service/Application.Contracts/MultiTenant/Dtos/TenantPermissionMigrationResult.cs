namespace SmartAbp.PermissionManagement.Application.Contracts.MultiTenant.Dtos;

/// <summary>
/// 租户权限迁移结果
/// </summary>
public class TenantPermissionMigrationResult
{
    /// <summary>
    /// 是否成功
    /// </summary>
    public bool IsSuccess { get; set; }

    /// <summary>
    /// 源租户权限数量
    /// </summary>
    public int SourcePermissionCount { get; set; }

    /// <summary>
    /// 迁移的权限数量
    /// </summary>
    public int MigratedPermissionCount { get; set; }

    /// <summary>
    /// 跳过的权限数量
    /// </summary>
    public int SkippedPermissionCount { get; set; }

    /// <summary>
    /// 错误消息
    /// </summary>
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// 迁移开始时间
    /// </summary>
    public DateTime StartTime { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// 迁移结束时间
    /// </summary>
    public DateTime? EndTime { get; set; }

    /// <summary>
    /// 耗时（秒）
    /// </summary>
    public double DurationSeconds => EndTime.HasValue
        ? (EndTime.Value - StartTime).TotalSeconds
        : 0;
}

