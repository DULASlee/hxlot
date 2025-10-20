using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using SmartAbp.PermissionManagement.Application.Contracts.Roles.Dtos;

namespace SmartAbp.PermissionManagement.Application.Contracts.Roles;

/// <summary>
/// 角色管理应用服务接口
/// 提供租户级角色管理功能（自动租户过滤）
/// </summary>
public interface IRoleAppService : IApplicationService
{
    /// <summary>
    /// 获取角色列表（分页，自动租户过滤）
    /// </summary>
    Task<PagedResultDto<RoleDto>> GetListAsync(GetRolesInput input);

    /// <summary>
    /// 根据ID获取角色详情
    /// </summary>
    Task<RoleDto> GetAsync(Guid id);

    /// <summary>
    /// 创建角色（在当前租户下）
    /// </summary>
    Task<RoleDto> CreateAsync(CreateRoleDto input);

    /// <summary>
    /// 更新角色信息
    /// </summary>
    Task<RoleDto> UpdateAsync(Guid id, UpdateRoleDto input);

    /// <summary>
    /// 删除角色
    /// </summary>
    Task DeleteAsync(Guid id);

    /// <summary>
    /// 获取所有可用角色（不分页）
    /// </summary>
    Task<ListResultDto<RoleDto>> GetAllListAsync();
}

