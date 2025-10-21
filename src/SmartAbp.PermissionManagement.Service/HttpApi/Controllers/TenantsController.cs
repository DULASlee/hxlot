using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.AspNetCore.Mvc;
using SmartAbp.PermissionManagement.Application.Contracts.Tenants;
using SmartAbp.PermissionManagement.Application.Contracts.Tenants.Dtos;

namespace SmartAbp.PermissionManagement.HttpApi.Controllers;

/// <summary>
/// 租户管理API控制器
/// </summary>
[RemoteService(Name = "PermissionManagement")]
[Area("permissionManagement")]
[Route("api/permission-management/tenants")]
public class TenantsController : AbpControllerBase
{
    private readonly ITenantAppService _tenantAppService;

    public TenantsController(ITenantAppService tenantAppService)
    {
        _tenantAppService = tenantAppService;
    }

    /// <summary>
    /// 获取租户列表（分页）
    /// </summary>
    [HttpGet]
    public async Task<PagedResultDto<TenantDto>> GetListAsync([FromQuery] GetTenantsInput input)
    {
        return await _tenantAppService.GetListAsync(input);
    }

    /// <summary>
    /// 根据ID获取租户详情
    /// </summary>
    [HttpGet("{id}")]
    public async Task<TenantDto> GetAsync(Guid id)
    {
        return await _tenantAppService.GetAsync(id);
    }

    /// <summary>
    /// 创建租户
    /// </summary>
    [HttpPost]
    public async Task<TenantDto> CreateAsync([FromBody] CreateTenantDto input)
    {
        return await _tenantAppService.CreateAsync(input);
    }

    /// <summary>
    /// 更新租户信息
    /// </summary>
    [HttpPut("{id}")]
    public async Task<TenantDto> UpdateAsync(Guid id, [FromBody] UpdateTenantDto input)
    {
        return await _tenantAppService.UpdateAsync(id, input);
    }

    /// <summary>
    /// 删除租户
    /// </summary>
    [HttpDelete("{id}")]
    public async Task DeleteAsync(Guid id)
    {
        await _tenantAppService.DeleteAsync(id);
    }

    /// <summary>
    /// 根据租户名称查找租户
    /// </summary>
    [HttpGet("by-name/{name}")]
    public async Task<TenantDto?> FindByNameAsync(string name)
    {
        return await _tenantAppService.FindByNameAsync(name);
    }

    /// <summary>
    /// 获取租户的子租户列表
    /// </summary>
    [HttpGet("{parentTenantId}/children")]
    public async Task<ListResultDto<TenantDto>> GetChildTenantsAsync(Guid parentTenantId)
    {
        return await _tenantAppService.GetChildTenantsAsync(parentTenantId);
    }

    /// <summary>
    /// 获取租户组织架构树
    /// </summary>
    [HttpGet("organization-tree")]
    public async Task<ListResultDto<TenantDto>> GetOrganizationTreeAsync([FromQuery] Guid? rootTenantId = null)
    {
        return await _tenantAppService.GetOrganizationTreeAsync(rootTenantId);
    }
}

