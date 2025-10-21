using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.AspNetCore.Mvc;
using SmartAbp.PermissionManagement.Application.Contracts.Organizations;
using SmartAbp.PermissionManagement.Application.Contracts.Organizations.Dtos;

namespace SmartAbp.PermissionManagement.HttpApi.Controllers;

/// <summary>
/// 组织架构管理API控制器
/// </summary>
[RemoteService(Name = "PermissionManagement")]
[Area("permissionManagement")]
[Route("api/permission-management/organization-units")]
public class OrganizationUnitsController : AbpControllerBase
{
    private readonly IOrganizationAppService _organizationAppService;

    public OrganizationUnitsController(IOrganizationAppService organizationAppService)
    {
        _organizationAppService = organizationAppService;
    }

    [HttpGet]
    public async Task<ListResultDto<OrganizationUnitDto>> GetListAsync()
    {
        return await _organizationAppService.GetListAsync();
    }

    [HttpGet("{id}")]
    public async Task<OrganizationUnitDto> GetAsync(Guid id)
    {
        return await _organizationAppService.GetAsync(id);
    }

    [HttpPost]
    public async Task<OrganizationUnitDto> CreateAsync([FromBody] CreateOrganizationUnitDto input)
    {
        return await _organizationAppService.CreateAsync(input);
    }

    [HttpPut("{id}")]
    public async Task<OrganizationUnitDto> UpdateAsync(Guid id, [FromBody] UpdateOrganizationUnitDto input)
    {
        return await _organizationAppService.UpdateAsync(id, input);
    }

    [HttpDelete("{id}")]
    public async Task DeleteAsync(Guid id)
    {
        await _organizationAppService.DeleteAsync(id);
    }

    [HttpPost("{id}/move")]
    public async Task MoveAsync(Guid id, [FromBody] Guid? newParentId)
    {
        await _organizationAppService.MoveAsync(id, newParentId);
    }

    [HttpGet("children")]
    public async Task<ListResultDto<OrganizationUnitDto>> GetChildrenAsync([FromQuery] Guid? parentId = null)
    {
        return await _organizationAppService.GetChildrenAsync(parentId);
    }
}

