using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;
using SmartAbp.PermissionManagement.Application.Contracts.MultiTenant.Dtos;

namespace SmartAbp.PermissionManagement.Application.Contracts.MultiTenant;

/// <summary>
/// 多租户权限隔离服务接口
/// 提供租户权限隔离验证、迁移等高级功能
/// </summary>
public interface IMultiTenantPermissionService : IApplicationService
{
    /// <summary>
    /// 验证租户权限完全隔离
    /// </summary>
    /// <param name="tenantId">租户ID</param>
    /// <returns>隔离验证结果</returns>
    Task<TenantPermissionIsolationResult> ValidateTenantPermissionIsolationAsync(Guid tenantId);

    /// <summary>
    /// 迁移租户权限
    /// </summary>
    /// <param name="sourceTenantId">源租户ID</param>
    /// <param name="targetTenantId">目标租户ID</param>
    /// <param name="options">迁移选项</param>
    /// <returns>迁移结果</returns>
    Task<TenantPermissionMigrationResult> MigrateTenantPermissionsAsync(
        Guid sourceTenantId,
        Guid targetTenantId,
        TenantPermissionMigrationOptions options);

    /// <summary>
    /// 清理租户孤立权限（Provider已删除但权限仍存在）
    /// </summary>
    /// <param name="tenantId">租户ID</param>
    /// <returns>清理的权限数量</returns>
    Task<int> CleanupOrphanedPermissionsAsync(Guid tenantId);

    /// <summary>
    /// 获取租户权限统计
    /// </summary>
    /// <param name="tenantId">租户ID</param>
    /// <returns>权限统计信息</returns>
    Task<TenantPermissionStatistics> GetTenantPermissionStatisticsAsync(Guid tenantId);
}

