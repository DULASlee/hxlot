using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using SmartAbp.PermissionManagement.Application.Contracts.Permissions.Dtos;

namespace SmartAbp.PermissionManagement.Application.Contracts.Permissions;

/// <summary>
/// 权限管理应用服务接口
/// 支持角色权限、用户权限、组织权限管理
/// </summary>
public interface IPermissionAppService : IApplicationService
{
    /// <summary>
    /// 获取角色的权限列表
    /// </summary>
    Task<ListResultDto<PermissionDto>> GetRolePermissionsAsync(string roleName);

    /// <summary>
    /// 更新角色权限
    /// </summary>
    Task UpdateRolePermissionsAsync(string roleName, UpdatePermissionsDto input);

    /// <summary>
    /// 获取用户的权限列表
    /// </summary>
    Task<ListResultDto<PermissionDto>> GetUserPermissionsAsync(Guid userId);

    /// <summary>
    /// 更新用户权限
    /// </summary>
    Task UpdateUserPermissionsAsync(Guid userId, UpdatePermissionsDto input);

    /// <summary>
    /// 获取组织单元的权限列表
    /// </summary>
    Task<ListResultDto<PermissionDto>> GetOrganizationUnitPermissionsAsync(Guid ouId);

    /// <summary>
    /// 更新组织单元权限
    /// </summary>
    Task UpdateOrganizationUnitPermissionsAsync(Guid ouId, UpdatePermissionsDto input);
}

