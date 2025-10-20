using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.AspNetCore.Mvc;
using SmartAbp.PermissionManagement.Application.Contracts.Roles;
using SmartAbp.PermissionManagement.Application.Contracts.Roles.Dtos;

namespace SmartAbp.PermissionManagement.HttpApi.Controllers;

/// <summary>
/// 角色管理API控制器
/// </summary>
[RemoteService(Name = "PermissionManagement")]
[Area("permissionManagement")]
[Route("api/permission-management/roles")]
public class RolesController : AbpControllerBase
{
    private readonly IRoleAppService _roleAppService;

    public RolesController(IRoleAppService roleAppService)
    {
        _roleAppService = roleAppService;
    }

    [HttpGet]
    public async Task<PagedResultDto<RoleDto>> GetListAsync([FromQuery] GetRolesInput input)
    {
        return await _roleAppService.GetListAsync(input);
    }

    [HttpGet("all")]
    public async Task<ListResultDto<RoleDto>> GetAllListAsync()
    {
        return await _roleAppService.GetAllListAsync();
    }

    [HttpGet("{id}")]
    public async Task<RoleDto> GetAsync(Guid id)
    {
        return await _roleAppService.GetAsync(id);
    }

    [HttpPost]
    public async Task<RoleDto> CreateAsync([FromBody] CreateRoleDto input)
    {
        return await _roleAppService.CreateAsync(input);
    }

    [HttpPut("{id}")]
    public async Task<RoleDto> UpdateAsync(Guid id, [FromBody] UpdateRoleDto input)
    {
        return await _roleAppService.UpdateAsync(id, input);
    }

    [HttpDelete("{id}")]
    public async Task DeleteAsync(Guid id)
    {
        await _roleAppService.DeleteAsync(id);
    }
}

