using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.AspNetCore.Mvc;
using SmartAbp.PermissionManagement.Application.Contracts.Users;
using SmartAbp.PermissionManagement.Application.Contracts.Users.Dtos;

namespace SmartAbp.PermissionManagement.HttpApi.Controllers;

/// <summary>
/// 用户管理API控制器
/// </summary>
[RemoteService(Name = "PermissionManagement")]
[Area("permissionManagement")]
[Route("api/permission-management/users")]
public class UsersController : AbpControllerBase
{
    private readonly IUserAppService _userAppService;

    public UsersController(IUserAppService userAppService)
    {
        _userAppService = userAppService;
    }

    [HttpGet]
    public async Task<PagedResultDto<UserDto>> GetListAsync([FromQuery] GetUsersInput input)
    {
        return await _userAppService.GetListAsync(input);
    }

    [HttpGet("{id}")]
    public async Task<UserDto> GetAsync(Guid id)
    {
        return await _userAppService.GetAsync(id);
    }

    [HttpPost]
    public async Task<UserDto> CreateAsync([FromBody] CreateIdentityUserDto input)
    {
        return await _userAppService.CreateAsync(input);
    }

    [HttpPut("{id}")]
    public async Task<UserDto> UpdateAsync(Guid id, [FromBody] UpdateIdentityUserDto input)
    {
        return await _userAppService.UpdateAsync(id, input);
    }

    [HttpDelete("{id}")]
    public async Task DeleteAsync(Guid id)
    {
        await _userAppService.DeleteAsync(id);
    }

    [HttpPost("{id}/reset-password")]
    public async Task ResetPasswordAsync(Guid id, [FromBody] string newPassword)
    {
        await _userAppService.ResetPasswordAsync(id, newPassword);
    }

    [HttpPost("{id}/lockout")]
    public async Task SetLockoutEnabledAsync(Guid id, [FromBody] bool enabled)
    {
        await _userAppService.SetLockoutEnabledAsync(id, enabled);
    }
}

