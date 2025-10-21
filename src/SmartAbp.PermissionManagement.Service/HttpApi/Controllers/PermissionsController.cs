using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.AspNetCore.Mvc;
using SmartAbp.PermissionManagement.Application.Contracts.Permissions;
using SmartAbp.PermissionManagement.Application.Contracts.Permissions.Dtos;

namespace SmartAbp.PermissionManagement.HttpApi.Controllers;

/// <summary>
/// 权限管理API控制器
/// </summary>
[RemoteService(Name = "PermissionManagement")]
[Area("permissionManagement")]
[Route("api/permission-management/permissions")]
public class PermissionsController : AbpControllerBase
{
    private readonly IPermissionAppService _permissionAppService;

    public PermissionsController(IPermissionAppService permissionAppService)
    {
        _permissionAppService = permissionAppService;
    }

    /// <summary>
    /// 获取角色权限
    /// </summary>
    [HttpGet("role/{roleName}")]
    public async Task<ListResultDto<PermissionDto>> GetRolePermissionsAsync(string roleName)
    {
        return await _permissionAppService.GetRolePermissionsAsync(roleName);
    }

    /// <summary>
    /// 更新角色权限
    /// </summary>
    [HttpPut("role/{roleName}")]
    public async Task UpdateRolePermissionsAsync(string roleName, [FromBody] UpdatePermissionsDto input)
    {
        await _permissionAppService.UpdateRolePermissionsAsync(roleName, input);
    }

    /// <summary>
    /// 获取用户权限
    /// </summary>
    [HttpGet("user/{userId}")]
    public async Task<ListResultDto<PermissionDto>> GetUserPermissionsAsync(Guid userId)
    {
        return await _permissionAppService.GetUserPermissionsAsync(userId);
    }

    /// <summary>
    /// 更新用户权限
    /// </summary>
    [HttpPut("user/{userId}")]
    public async Task UpdateUserPermissionsAsync(Guid userId, [FromBody] UpdatePermissionsDto input)
    {
        await _permissionAppService.UpdateUserPermissionsAsync(userId, input);
    }

    /// <summary>
    /// 获取组织单元权限
    /// </summary>
    [HttpGet("organization-unit/{ouId}")]
    public async Task<ListResultDto<PermissionDto>> GetOrganizationUnitPermissionsAsync(Guid ouId)
    {
        return await _permissionAppService.GetOrganizationUnitPermissionsAsync(ouId);
    }

    /// <summary>
    /// 更新组织单元权限
    /// </summary>
    [HttpPut("organization-unit/{ouId}")]
    public async Task UpdateOrganizationUnitPermissionsAsync(Guid ouId, [FromBody] UpdatePermissionsDto input)
    {
        await _permissionAppService.UpdateOrganizationUnitPermissionsAsync(ouId, input);
    }
}

