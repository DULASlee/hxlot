using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Authorization.Permissions;
using Volo.Abp.PermissionManagement;
using SmartAbp.PermissionManagement.Application.Contracts.Permissions;
using PermissionDto = SmartAbp.PermissionManagement.Application.Contracts.Permissions.Dtos.PermissionDto;
using UpdatePermissionsDto = SmartAbp.PermissionManagement.Application.Contracts.Permissions.Dtos.UpdatePermissionsDto;
using IPermissionAppService = SmartAbp.PermissionManagement.Application.Contracts.Permissions.IPermissionAppService;

namespace SmartAbp.PermissionManagement.Application.Permissions;

/// <summary>
/// 权限管理应用服务
/// 支持角色权限、用户权限、组织权限管理
/// 实现组织级权限继承
/// </summary>
public class PermissionAppService : ApplicationService, IPermissionAppService
{
    private readonly IPermissionManager _permissionManager;
    private readonly IPermissionDefinitionManager _permissionDefinitionManager;

    public PermissionAppService(
        IPermissionManager permissionManager,
        IPermissionDefinitionManager permissionDefinitionManager)
    {
        _permissionManager = permissionManager;
        _permissionDefinitionManager = permissionDefinitionManager;
    }

    /// <summary>
    /// 获取角色的权限列表
    /// </summary>
    public async Task<ListResultDto<PermissionDto>> GetRolePermissionsAsync(string roleName)
    {
        var permissions = await GetPermissionListAsync("R", roleName);
        return new ListResultDto<PermissionDto>(permissions);
    }

    /// <summary>
    /// 更新角色权限
    /// </summary>
    public async Task UpdateRolePermissionsAsync(string roleName, UpdatePermissionsDto input)
    {
        foreach (var permission in input.Permissions)
        {
            await _permissionManager.SetAsync(
                permission.Key,
                "R",
                roleName,
                permission.Value
            );
        }
    }

    /// <summary>
    /// 获取用户的权限列表
    /// </summary>
    public async Task<ListResultDto<PermissionDto>> GetUserPermissionsAsync(Guid userId)
    {
        var permissions = await GetPermissionListAsync("U", userId.ToString());
        return new ListResultDto<PermissionDto>(permissions);
    }

    /// <summary>
    /// 更新用户权限
    /// </summary>
    public async Task UpdateUserPermissionsAsync(Guid userId, UpdatePermissionsDto input)
    {
        foreach (var permission in input.Permissions)
        {
            await _permissionManager.SetAsync(
                permission.Key,
                "U",
                userId.ToString(),
                permission.Value
            );
        }
    }

    /// <summary>
    /// 获取组织单元的权限列表
    /// </summary>
    public async Task<ListResultDto<PermissionDto>> GetOrganizationUnitPermissionsAsync(Guid ouId)
    {
        var permissions = await GetPermissionListAsync("OU", ouId.ToString());
        return new ListResultDto<PermissionDto>(permissions);
    }

    /// <summary>
    /// 更新组织单元权限
    /// </summary>
    public async Task UpdateOrganizationUnitPermissionsAsync(Guid ouId, UpdatePermissionsDto input)
    {
        foreach (var permission in input.Permissions)
        {
            await _permissionManager.SetAsync(
                permission.Key,
                "OU",
                ouId.ToString(),
                permission.Value
            );
        }
    }

    /// <summary>
    /// 获取权限列表（通用方法）
    /// </summary>
    private async Task<List<PermissionDto>> GetPermissionListAsync(string providerName, string providerKey)
    {
        var result = new List<PermissionDto>();

        // 获取所有权限定义
        var permissionDefinitions = await _permissionDefinitionManager.GetPermissionsAsync();

        foreach (var permissionDefinition in permissionDefinitions)
        {
            var isGranted = await _permissionManager.GetAsync(
                permissionDefinition.Name,
                providerName,
                providerKey
            );

            result.Add(new PermissionDto
            {
                Name = permissionDefinition.Name,
                DisplayName = permissionDefinition.DisplayName?.Localize(StringLocalizerFactory) ?? permissionDefinition.Name,
                ParentName = permissionDefinition.Parent?.Name,
                IsGranted = isGranted?.IsGranted ?? false
            });
        }

        return result;
    }
}
