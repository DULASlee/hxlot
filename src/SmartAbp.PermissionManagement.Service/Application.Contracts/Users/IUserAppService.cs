using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using SmartAbp.PermissionManagement.Application.Contracts.Users.Dtos;

namespace SmartAbp.PermissionManagement.Application.Contracts.Users;

/// <summary>
/// 用户管理应用服务接口
/// 提供租户级用户管理功能（自动租户过滤）
/// </summary>
public interface IUserAppService : IApplicationService
{
    /// <summary>
    /// 获取用户列表（分页，自动租户过滤）
    /// </summary>
    Task<PagedResultDto<UserDto>> GetListAsync(GetUsersInput input);

    /// <summary>
    /// 根据ID获取用户详情
    /// </summary>
    Task<UserDto> GetAsync(Guid id);

    /// <summary>
    /// 创建用户（在当前租户下）
    /// </summary>
    Task<UserDto> CreateAsync(CreateIdentityUserDto input);

    /// <summary>
    /// 更新用户信息
    /// </summary>
    Task<UserDto> UpdateAsync(Guid id, UpdateIdentityUserDto input);

    /// <summary>
    /// 删除用户
    /// </summary>
    Task DeleteAsync(Guid id);

    /// <summary>
    /// 重置用户密码
    /// </summary>
    Task ResetPasswordAsync(Guid id, string newPassword);

    /// <summary>
    /// 锁定/解锁用户
    /// </summary>
    Task SetLockoutEnabledAsync(Guid id, bool enabled);
}

