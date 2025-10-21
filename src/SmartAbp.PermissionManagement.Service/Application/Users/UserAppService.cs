using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Identity;
using SmartAbp.PermissionManagement.Application.Contracts.Users;
using SmartAbp.PermissionManagement.Application.Contracts.Users.Dtos;

namespace SmartAbp.PermissionManagement.Application.Users;

/// <summary>
/// 用户管理应用服务
/// 实现租户级用户管理（自动租户过滤）
/// </summary>
public class UserAppService : ApplicationService, IUserAppService
{
    private readonly IIdentityUserRepository _userRepository;
    private readonly IdentityUserManager _userManager;
    private readonly IOrganizationUnitRepository _ouRepository;

    public UserAppService(
        IIdentityUserRepository userRepository,
        IdentityUserManager userManager,
        IOrganizationUnitRepository ouRepository)
    {
        _userRepository = userRepository;
        _userManager = userManager;
        _ouRepository = ouRepository;
    }

    /// <summary>
    /// 获取用户列表（分页，自动租户过滤）
    /// </summary>
    public async Task<PagedResultDto<UserDto>> GetListAsync(GetUsersInput input)
    {
        // ABP会自动根据CurrentTenant过滤用户
        var users = await _userRepository.GetListAsync(
            input.Sorting ?? "CreationTime DESC",
            input.MaxResultCount,
            input.SkipCount,
            input.Filter
        );

        var totalCount = await _userRepository.GetCountAsync(input.Filter);

        var dtos = users.Select(MapToDto).ToList();

        return new PagedResultDto<UserDto>(totalCount, dtos);
    }

    /// <summary>
    /// 根据ID获取用户
    /// </summary>
    public async Task<UserDto> GetAsync(Guid id)
    {
        var user = await _userRepository.GetAsync(id);
        return MapToDto(user);
    }

    /// <summary>
    /// 创建用户（在当前租户下）
    /// </summary>
    public async Task<UserDto> CreateAsync(CreateIdentityUserDto input)
    {
        // 检查用户名是否已存在
        var existingUser = await _userRepository.FindByNormalizedUserNameAsync(
            _userManager.NormalizeName(input.UserName)
        );
        if (existingUser != null)
        {
            throw new UserFriendlyException($"用户名 '{input.UserName}' 已存在");
        }

        // 创建用户（自动关联当前租户）
        var user = new Volo.Abp.Identity.IdentityUser(
            GuidGenerator.Create(),
            input.UserName,
            input.Email,
            CurrentTenant.Id // 自动设置当前租户ID
        )
        {
            Name = input.Name,
            Surname = input.Surname
        };

        // 设置密码
        var result = await _userManager.CreateAsync(user, input.Password);
        if (!result.Succeeded)
        {
            throw new UserFriendlyException(
                string.Join(", ", result.Errors.Select(e => e.Description))
            );
        }

        // 设置手机号
        if (!string.IsNullOrWhiteSpace(input.PhoneNumber))
        {
            await _userManager.SetPhoneNumberAsync(user, input.PhoneNumber);
        }

        // 分配角色
        if (input.RoleIds.Length > 0)
        {
            await _userManager.SetRolesAsync(user, input.RoleIds.Select(id => id.ToString()).ToArray());
        }

        // 分配组织单元
        if (input.OrganizationUnitIds.Length > 0)
        {
            foreach (var ouId in input.OrganizationUnitIds)
            {
                await _userManager.AddToOrganizationUnitAsync(user.Id, ouId);
            }
        }

        return MapToDto(user);
    }

    /// <summary>
    /// 更新用户信息
    /// </summary>
    public async Task<UserDto> UpdateAsync(Guid id, UpdateIdentityUserDto input)
    {
        var user = await _userRepository.GetAsync(id);

        user.Name = input.Name;
        user.Surname = input.Surname;
        // 设置邮箱
        if (user.Email != input.Email)
        {
            await _userManager.SetEmailAsync(user, input.Email);
        }
        // 设置手机号
        if (user.PhoneNumber != input.PhoneNumber)
        {
            await _userManager.SetPhoneNumberAsync(user, input.PhoneNumber);
        }

        // TODO: IsActive属性为protected，需要通过自定义方法设置
        // 临时解决方案：通过锁定来实现激活/停用
        if (!input.IsActive && !user.LockoutEnd.HasValue)
        {
            // 停用用户：设置锁定
            await _userManager.SetLockoutEndDateAsync(user, DateTimeOffset.MaxValue);
        }
        else if (input.IsActive && user.LockoutEnd.HasValue)
        {
            // 激活用户：取消锁定
            await _userManager.SetLockoutEndDateAsync(user, null);
        }

        await _userManager.UpdateAsync(user);

        // 更新角色
        if (input.RoleIds.Length > 0)
        {
            await _userManager.SetRolesAsync(user, input.RoleIds.Select(id => id.ToString()).ToArray());
        }

        // 更新组织单元
        var currentOUs = await _userManager.GetOrganizationUnitsAsync(user);
        foreach (var ou in currentOUs)
        {
            await _userManager.RemoveFromOrganizationUnitAsync(user, ou);
        }

        foreach (var ouId in input.OrganizationUnitIds)
        {
            await _userManager.AddToOrganizationUnitAsync(user.Id, ouId);
        }

        return MapToDto(user);
    }

    /// <summary>
    /// 删除用户
    /// </summary>
    public async Task DeleteAsync(Guid id)
    {
        var user = await _userRepository.GetAsync(id);
        await _userManager.DeleteAsync(user);
    }

    /// <summary>
    /// 重置用户密码
    /// </summary>
    public async Task ResetPasswordAsync(Guid id, string newPassword)
    {
        var user = await _userRepository.GetAsync(id);
        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        await _userManager.ResetPasswordAsync(user, token, newPassword);
    }

    /// <summary>
    /// 锁定/解锁用户
    /// </summary>
    public async Task SetLockoutEnabledAsync(Guid id, bool enabled)
    {
        var user = await _userRepository.GetAsync(id);
        
        if (enabled)
        {
            // 锁定用户直到2099年
            await _userManager.SetLockoutEndDateAsync(user, DateTimeOffset.MaxValue);
        }
        else
        {
            // 解锁用户
            await _userManager.SetLockoutEndDateAsync(user, null);
        }
    }

    /// <summary>
    /// 映射到DTO
    /// </summary>
    private static UserDto MapToDto(Volo.Abp.Identity.IdentityUser user)
    {
        return new UserDto
        {
            Id = user.Id,
            UserName = user.UserName!,
            Name = user.Name,
            Surname = user.Surname,
            Email = user.Email!,
            EmailConfirmed = user.EmailConfirmed,
            PhoneNumber = user.PhoneNumber,
            PhoneNumberConfirmed = user.PhoneNumberConfirmed,
            IsActive = user.IsActive,
            LockoutEnd = user.LockoutEnd,
            TenantId = user.TenantId,
            CreationTime = user.CreationTime
        };
    }
}

