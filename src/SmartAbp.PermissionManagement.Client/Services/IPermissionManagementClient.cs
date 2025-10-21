using SmartAbp.PermissionManagement.Client.Models;

namespace SmartAbp.PermissionManagement.Client.Services;

/// <summary>
/// Permission Management Client接口
/// 提供对Permission Management微服务的HTTP调用封装
/// </summary>
public interface IPermissionManagementClient
{
    /// <summary>
    /// 获取角色的权限列表
    /// </summary>
    Task<List<PermissionDto>> GetRolePermissionsAsync(string roleName, CancellationToken cancellationToken = default);

    /// <summary>
    /// 更新角色权限
    /// </summary>
    Task UpdateRolePermissionsAsync(string roleName, UpdatePermissionsDto input, CancellationToken cancellationToken = default);

    /// <summary>
    /// 获取用户的权限列表
    /// </summary>
    Task<List<PermissionDto>> GetUserPermissionsAsync(Guid userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// 更新用户权限
    /// </summary>
    Task UpdateUserPermissionsAsync(Guid userId, UpdatePermissionsDto input, CancellationToken cancellationToken = default);

    /// <summary>
    /// 获取组织单元的权限列表
    /// </summary>
    Task<List<PermissionDto>> GetOrganizationUnitPermissionsAsync(Guid ouId, CancellationToken cancellationToken = default);

    /// <summary>
    /// 更新组织单元权限
    /// </summary>
    Task UpdateOrganizationUnitPermissionsAsync(Guid ouId, UpdatePermissionsDto input, CancellationToken cancellationToken = default);

    /// <summary>
    /// 验证用户是否拥有指定权限
    /// </summary>
    Task<bool> CheckPermissionAsync(Guid userId, string permissionName, CancellationToken cancellationToken = default);

    /// <summary>
    /// 批量验证用户权限
    /// </summary>
    Task<Dictionary<string, bool>> CheckPermissionsAsync(Guid userId, List<string> permissionNames, CancellationToken cancellationToken = default);
}

