using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Volo.Abp.Application.Services;
using Volo.Abp.Data;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Identity;
using Volo.Abp.MultiTenancy;
using Volo.Abp.PermissionManagement;
using Volo.Abp.TenantManagement;
using Volo.Abp.Uow;
using SmartAbp.PermissionManagement.Application.Contracts.MultiTenant;
using SmartAbp.PermissionManagement.Application.Contracts.MultiTenant.Dtos;

namespace SmartAbp.PermissionManagement.Application.MultiTenant;

/// <summary>
/// 多租户权限隔离服务
/// 提供租户权限隔离验证、迁移等高级功能
/// </summary>
public class MultiTenantPermissionService : ApplicationService, IMultiTenantPermissionService
{
    private readonly IPermissionGrantRepository _permissionGrantRepository;
    private readonly IIdentityUserRepository _userRepository;
    private readonly IIdentityRoleRepository _roleRepository;
    private readonly IOrganizationUnitRepository _ouRepository;
    private readonly ITenantRepository _tenantRepository;
    private readonly IDataFilter _dataFilter;
    private readonly ILogger<MultiTenantPermissionService> _logger;

    public MultiTenantPermissionService(
        IPermissionGrantRepository permissionGrantRepository,
        IIdentityUserRepository userRepository,
        IIdentityRoleRepository roleRepository,
        IOrganizationUnitRepository ouRepository,
        ITenantRepository tenantRepository,
        IDataFilter dataFilter,
        ILogger<MultiTenantPermissionService> logger)
    {
        _permissionGrantRepository = permissionGrantRepository;
        _userRepository = userRepository;
        _roleRepository = roleRepository;
        _ouRepository = ouRepository;
        _tenantRepository = tenantRepository;
        _dataFilter = dataFilter;
        _logger = logger;
    }

    /// <summary>
    /// 验证租户权限完全隔离
    /// </summary>
    [UnitOfWork]
    public async Task<TenantPermissionIsolationResult> ValidateTenantPermissionIsolationAsync(Guid tenantId)
    {
        var result = new TenantPermissionIsolationResult
        {
            TenantId = tenantId
        };

        using (_dataFilter.Disable<IMultiTenant>())
        {
            // 1. 获取租户所有权限（使用ABP的GetListAsync）
            var allPermissions = await _permissionGrantRepository.GetListAsync(
                providerName: null,
                providerKey: null
            );
            
            var tenantPermissions = allPermissions.Where(g => g.TenantId == tenantId).ToList();
            result.TotalPermissionCount = tenantPermissions.Count;

            // 2. 检查跨租户权限（理论上应该为0）
            var crossTenantPermissions = allPermissions
                .Where(g => g.TenantId != tenantId && g.TenantId != null)
                .Where(g => g.ProviderName == "User" || g.ProviderName == "Role")
                .ToList();

            result.CrossTenantPermissionCount = crossTenantPermissions.Count;

            if (crossTenantPermissions.Any())
            {
                result.ValidationDetails.Add($"发现{crossTenantPermissions.Count}个跨租户权限（严重问题）");
            }

            // 3. 统计孤立权限（Provider已删除）
            var orphanedCount = await CountOrphanedPermissionsInMemoryAsync(tenantId, tenantPermissions);
            result.OrphanedPermissionCount = orphanedCount;

            if (orphanedCount > 0)
            {
                result.ValidationDetails.Add($"发现{orphanedCount}个孤立权限（Provider已删除）");
            }

            // 4. 验证用户权限
            var userPermissions = tenantPermissions.Where(p => p.ProviderName == "User").ToList();
            var userIds = userPermissions.Select(p => Guid.Parse(p.ProviderKey)).Distinct().ToList();
            var existingUserIds = new List<Guid>();
            
            foreach (var userId in userIds)
            {
                var user = await _userRepository.FindAsync(userId);
                if (user != null && user.TenantId == tenantId)
                {
                    existingUserIds.Add(userId);
                }
            }

            var orphanedUserPermissions = userPermissions.Count(p => !existingUserIds.Contains(Guid.Parse(p.ProviderKey)));
            if (orphanedUserPermissions > 0)
            {
                result.ValidationDetails.Add($"用户权限中有{orphanedUserPermissions}个孤立记录");
            }

            // 5. 验证角色权限
            var rolePermissions = tenantPermissions.Where(p => p.ProviderName == "Role").ToList();
            var roleNames = rolePermissions.Select(p => p.ProviderKey).Distinct().ToList();
            var existingRoleNames = new List<string>();
            
            foreach (var roleName in roleNames)
            {
                var role = await _roleRepository.FindByNormalizedNameAsync(roleName.ToUpperInvariant());
                if (role != null && role.TenantId == tenantId)
                {
                    existingRoleNames.Add(role.Name);
                }
            }

            var orphanedRolePermissions = rolePermissions.Count(p => !existingRoleNames.Contains(p.ProviderKey));
            if (orphanedRolePermissions > 0)
            {
                result.ValidationDetails.Add($"角色权限中有{orphanedRolePermissions}个孤立记录");
            }
        }

        result.IsFullyIsolated = result.CrossTenantPermissionCount == 0 && result.OrphanedPermissionCount == 0;

        _logger.LogInformation(
            "租户权限隔离验证完成: TenantId={TenantId}, IsFullyIsolated={IsFullyIsolated}, TotalCount={TotalCount}, CrossTenant={CrossTenant}, Orphaned={Orphaned}",
            tenantId, result.IsFullyIsolated, result.TotalPermissionCount, result.CrossTenantPermissionCount, result.OrphanedPermissionCount
        );

        return result;
    }

    /// <summary>
    /// 迁移租户权限
    /// </summary>
    [UnitOfWork]
    public async Task<TenantPermissionMigrationResult> MigrateTenantPermissionsAsync(
        Guid sourceTenantId,
        Guid targetTenantId,
        TenantPermissionMigrationOptions options)
    {
        var result = new TenantPermissionMigrationResult
        {
            StartTime = DateTime.UtcNow
        };

        using (var uow = UnitOfWorkManager.Begin(requiresNew: true, isTransactional: true))
        {
            try
            {
                using (_dataFilter.Disable<IMultiTenant>())
                {
                    // 1. 获取源租户权限
                    var allPermissions = await _permissionGrantRepository.GetListAsync(null, null);
                    var sourcePermissions = allPermissions.Where(g => g.TenantId == sourceTenantId).ToList();

                    // 根据选项过滤
                    if (!options.MigrateUserPermissions)
                    {
                        sourcePermissions = sourcePermissions.Where(g => g.ProviderName != "User").ToList();
                    }
                    if (!options.MigrateRolePermissions)
                    {
                        sourcePermissions = sourcePermissions.Where(g => g.ProviderName != "Role").ToList();
                    }
                    if (!options.MigrateOrganizationUnitPermissions)
                    {
                        sourcePermissions = sourcePermissions.Where(g => g.ProviderName != "OrganizationUnit").ToList();
                    }

                    // 权限名称过滤
                    if (options.PermissionNameFilters != null && options.PermissionNameFilters.Any())
                    {
                        sourcePermissions = sourcePermissions.Where(g => options.PermissionNameFilters.Contains(g.Name)).ToList();
                    }

                    result.SourcePermissionCount = sourcePermissions.Count;

                    // 2. 获取目标租户已有权限（用于判断是否覆盖）
                    var targetExistingPermissions = allPermissions
                        .Where(g => g.TenantId == targetTenantId)
                        .Select(g => new { g.Name, g.ProviderName, g.ProviderKey })
                        .ToList();

                    var targetPermissionKeys = targetExistingPermissions
                        .Select(p => $"{p.Name}:{p.ProviderName}:{p.ProviderKey}")
                        .ToHashSet();

                    // 3. 转换为目标租户权限
                    var skippedCount = 0;

                    foreach (var sourcePermission in sourcePermissions)
                    {
                        var permissionKey = $"{sourcePermission.Name}:{sourcePermission.ProviderName}:{sourcePermission.ProviderKey}";

                        // 如果目标已存在且不覆盖，则跳过
                        if (targetPermissionKeys.Contains(permissionKey) && !options.OverrideExisting)
                        {
                            skippedCount++;
                            continue;
                        }

                        // 映射ProviderKey（将源租户的用户ID/角色名映射到目标租户）
                        var mappedProviderKey = await MapProviderKeyAsync(
                            sourcePermission.ProviderName,
                            sourcePermission.ProviderKey,
                            sourceTenantId,
                            targetTenantId
                        );

                        if (mappedProviderKey == null)
                        {
                            skippedCount++;
                            continue; // 无法映射，跳过
                        }

                        // 创建或更新目标租户权限
                        var existingGrant = await _permissionGrantRepository.FindAsync(
                            sourcePermission.Name,
                            sourcePermission.ProviderName,
                            mappedProviderKey
                        );

                        if (existingGrant != null)
                        {
                            if (options.OverrideExisting)
                            {
                                // 更新已有权限
                                await _permissionGrantRepository.DeleteAsync(existingGrant);
                                await _permissionGrantRepository.InsertAsync(
                                    new PermissionGrant(
                                        GuidGenerator.Create(),
                                        sourcePermission.Name,
                                        sourcePermission.ProviderName,
                                        mappedProviderKey,
                                        targetTenantId
                                    )
                                );
                            }
                            else
                            {
                                skippedCount++;
                            }
                        }
                        else
                        {
                            // 插入新权限
                            await _permissionGrantRepository.InsertAsync(
                                new PermissionGrant(
                                    GuidGenerator.Create(),
                                    sourcePermission.Name,
                                    sourcePermission.ProviderName,
                                    mappedProviderKey,
                                    targetTenantId
                                )
                            );
                        }
                    }

                    result.MigratedPermissionCount = sourcePermissions.Count - skippedCount;
                    result.SkippedPermissionCount = skippedCount;
                }

                await uow.CompleteAsync();

                result.IsSuccess = true;
                result.EndTime = DateTime.UtcNow;

                _logger.LogInformation(
                    "租户权限迁移成功: Source={Source}, Target={Target}, Migrated={Migrated}, Skipped={Skipped}",
                    sourceTenantId, targetTenantId, result.MigratedPermissionCount, result.SkippedPermissionCount
                );
            }
            catch (Exception ex)
            {
                result.IsSuccess = false;
                result.ErrorMessage = ex.Message;
                result.EndTime = DateTime.UtcNow;

                _logger.LogError(ex, "租户权限迁移失败: Source={Source}, Target={Target}", sourceTenantId, targetTenantId);

                await uow.RollbackAsync();
            }
        }

        return result;
    }

    /// <summary>
    /// 清理租户孤立权限
    /// </summary>
    [UnitOfWork]
    public async Task<int> CleanupOrphanedPermissionsAsync(Guid tenantId)
    {
        var deletedCount = 0;

        using (_dataFilter.Disable<IMultiTenant>())
        {
            var allPermissions = await _permissionGrantRepository.GetListAsync(null, null);
            
            // 1. 清理用户权限（用户已删除）
            var userPermissions = allPermissions.Where(g => g.TenantId == tenantId && g.ProviderName == "User").ToList();
            var orphanedUserPermissions = new List<PermissionGrant>();
            
            foreach (var perm in userPermissions)
            {
                var userId = Guid.Parse(perm.ProviderKey);
                var user = await _userRepository.FindAsync(userId);
                if (user == null || user.TenantId != tenantId)
                {
                    orphanedUserPermissions.Add(perm);
                }
            }

            if (orphanedUserPermissions.Any())
            {
                await _permissionGrantRepository.DeleteManyAsync(orphanedUserPermissions);
                deletedCount += orphanedUserPermissions.Count;
            }

            // 2. 清理角色权限（角色已删除）
            var rolePermissions = allPermissions.Where(g => g.TenantId == tenantId && g.ProviderName == "Role").ToList();
            var orphanedRolePermissions = new List<PermissionGrant>();
            
            foreach (var perm in rolePermissions)
            {
                var role = await _roleRepository.FindByNormalizedNameAsync(perm.ProviderKey.ToUpperInvariant());
                if (role == null || role.TenantId != tenantId)
                {
                    orphanedRolePermissions.Add(perm);
                }
            }

            if (orphanedRolePermissions.Any())
            {
                await _permissionGrantRepository.DeleteManyAsync(orphanedRolePermissions);
                deletedCount += orphanedRolePermissions.Count;
            }

            // 3. 清理组织单元权限（OU已删除）
            var ouPermissions = allPermissions.Where(g => g.TenantId == tenantId && g.ProviderName == "OrganizationUnit").ToList();
            var orphanedOUPermissions = new List<PermissionGrant>();
            
            foreach (var perm in ouPermissions)
            {
                var ouId = Guid.Parse(perm.ProviderKey);
                var ou = await _ouRepository.FindAsync(ouId);
                if (ou == null || ou.TenantId != tenantId)
                {
                    orphanedOUPermissions.Add(perm);
                }
            }

            if (orphanedOUPermissions.Any())
            {
                await _permissionGrantRepository.DeleteManyAsync(orphanedOUPermissions);
                deletedCount += orphanedOUPermissions.Count;
            }
        }

        _logger.LogInformation("清理租户孤立权限完成: TenantId={TenantId}, DeletedCount={DeletedCount}", tenantId, deletedCount);

        return deletedCount;
    }

    /// <summary>
    /// 获取租户权限统计
    /// </summary>
    [UnitOfWork]
    public async Task<TenantPermissionStatistics> GetTenantPermissionStatisticsAsync(Guid tenantId)
    {
        var statistics = new TenantPermissionStatistics
        {
            TenantId = tenantId
        };

        // 获取租户名称
        var tenant = await _tenantRepository.GetAsync(tenantId);
        statistics.TenantName = tenant.Name;

        using (_dataFilter.Disable<IMultiTenant>())
        {
            var allPermissions = await _permissionGrantRepository.GetListAsync(null, null);
            var permissions = allPermissions.Where(g => g.TenantId == tenantId).ToList();

            statistics.TotalPermissionCount = permissions.Count;
            statistics.UserPermissionCount = permissions.Count(p => p.ProviderName == "User");
            statistics.RolePermissionCount = permissions.Count(p => p.ProviderName == "Role");
            statistics.OrganizationUnitPermissionCount = permissions.Count(p => p.ProviderName == "OrganizationUnit");
            statistics.PermanentPermissionCount = permissions.Count; // ABP 8.3可能没有过期时间
        }

        return statistics;
    }

    /// <summary>
    /// 统计孤立权限数量（内存版本）
    /// </summary>
    private async Task<int> CountOrphanedPermissionsInMemoryAsync(Guid tenantId, List<PermissionGrant> tenantPermissions)
    {
        var orphanedCount = 0;

        // 1. 统计用户权限孤立
        var userPermissions = tenantPermissions.Where(g => g.ProviderName == "User").ToList();
        foreach (var perm in userPermissions)
        {
            var userId = Guid.Parse(perm.ProviderKey);
            var user = await _userRepository.FindAsync(userId);
            if (user == null || user.TenantId != tenantId)
            {
                orphanedCount++;
            }
        }

        // 2. 统计角色权限孤立
        var rolePermissions = tenantPermissions.Where(g => g.ProviderName == "Role").ToList();
        foreach (var perm in rolePermissions)
        {
            var role = await _roleRepository.FindByNormalizedNameAsync(perm.ProviderKey.ToUpperInvariant());
            if (role == null || role.TenantId != tenantId)
            {
                orphanedCount++;
            }
        }

        return orphanedCount;
    }

    /// <summary>
    /// 映射ProviderKey（从源租户到目标租户）
    /// </summary>
    private async Task<string?> MapProviderKeyAsync(
        string providerName,
        string providerKey,
        Guid sourceTenantId,
        Guid targetTenantId)
    {
        switch (providerName)
        {
            case "User":
                // 用户权限迁移：需要找到目标租户中对应的用户
                // 这里简化处理：假设用户名相同
                var sourceUser = await _userRepository.GetAsync(Guid.Parse(providerKey));
                var targetUsers = await _userRepository.GetListAsync();
                var targetUser = targetUsers.FirstOrDefault(u => u.UserName == sourceUser.UserName && u.TenantId == targetTenantId);
                return targetUser?.Id.ToString();

            case "Role":
                // 角色权限迁移：假设目标租户有同名角色
                var targetRoles = await _roleRepository.GetListAsync();
                var targetRole = targetRoles.FirstOrDefault(r => r.Name == providerKey && r.TenantId == targetTenantId);
                return targetRole?.Name;

            case "OrganizationUnit":
                // OU权限迁移：假设目标租户有同名OU
                // 这里简化处理，实际可能需要更复杂的映射逻辑
                return null; // 暂不支持OU迁移

            default:
                return providerKey; // 其他类型直接返回
        }
    }
}
