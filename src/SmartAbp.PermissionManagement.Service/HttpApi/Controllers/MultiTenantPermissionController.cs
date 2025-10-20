using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp.AspNetCore.Mvc;
using SmartAbp.PermissionManagement.Application.Contracts.MultiTenant;
using SmartAbp.PermissionManagement.Application.Contracts.MultiTenant.Dtos;

namespace SmartAbp.PermissionManagement.HttpApi.Controllers;

/// <summary>
/// 多租户权限管理API控制器
/// </summary>
[Route("api/permission-management/multi-tenant")]
[ApiController]
public class MultiTenantPermissionController : AbpControllerBase
{
    private readonly IMultiTenantPermissionService _multiTenantPermissionService;

    public MultiTenantPermissionController(IMultiTenantPermissionService multiTenantPermissionService)
    {
        _multiTenantPermissionService = multiTenantPermissionService;
    }

    /// <summary>
    /// 验证租户权限隔离
    /// </summary>
    [HttpGet("validate/{tenantId}")]
    public async Task<TenantPermissionIsolationResult> ValidateIsolationAsync(Guid tenantId)
    {
        return await _multiTenantPermissionService.ValidateTenantPermissionIsolationAsync(tenantId);
    }

    /// <summary>
    /// 迁移租户权限
    /// </summary>
    [HttpPost("migrate")]
    public async Task<TenantPermissionMigrationResult> MigratePermissionsAsync(
        [FromQuery] Guid sourceTenantId,
        [FromQuery] Guid targetTenantId,
        [FromBody] TenantPermissionMigrationOptions options)
    {
        return await _multiTenantPermissionService.MigrateTenantPermissionsAsync(
            sourceTenantId,
            targetTenantId,
            options
        );
    }

    /// <summary>
    /// 清理孤立权限
    /// </summary>
    [HttpDelete("cleanup-orphaned/{tenantId}")]
    public async Task<int> CleanupOrphanedPermissionsAsync(Guid tenantId)
    {
        return await _multiTenantPermissionService.CleanupOrphanedPermissionsAsync(tenantId);
    }

    /// <summary>
    /// 获取租户权限统计
    /// </summary>
    [HttpGet("statistics/{tenantId}")]
    public async Task<TenantPermissionStatistics> GetStatisticsAsync(Guid tenantId)
    {
        return await _multiTenantPermissionService.GetTenantPermissionStatisticsAsync(tenantId);
    }
}

