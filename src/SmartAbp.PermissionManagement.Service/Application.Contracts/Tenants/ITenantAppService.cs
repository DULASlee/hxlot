using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using SmartAbp.PermissionManagement.Application.Contracts.Tenants.Dtos;

namespace SmartAbp.PermissionManagement.Application.Contracts.Tenants;

/// <summary>
/// 租户管理应用服务接口
/// 提供租户的创建、查询、更新、删除功能
/// 支持集团公司多级组织架构
/// </summary>
public interface ITenantAppService : IApplicationService
{
    /// <summary>
    /// 获取租户列表（分页）
    /// </summary>
    Task<PagedResultDto<TenantDto>> GetListAsync(GetTenantsInput input);

    /// <summary>
    /// 根据ID获取租户详情
    /// </summary>
    Task<TenantDto> GetAsync(Guid id);

    /// <summary>
    /// 创建租户
    /// 自动创建租户Schema、默认管理员账号
    /// </summary>
    Task<TenantDto> CreateAsync(CreateTenantDto input);

    /// <summary>
    /// 更新租户信息
    /// </summary>
    Task<TenantDto> UpdateAsync(Guid id, UpdateTenantDto input);

    /// <summary>
    /// 删除租户（软删除）
    /// 同时删除租户Schema和所有数据
    /// </summary>
    Task DeleteAsync(Guid id);

    /// <summary>
    /// 根据租户名称查找租户
    /// </summary>
    Task<TenantDto?> FindByNameAsync(string name);

    /// <summary>
    /// 获取租户的子租户列表（集团组织架构）
    /// </summary>
    Task<ListResultDto<TenantDto>> GetChildTenantsAsync(Guid parentTenantId);

    /// <summary>
    /// 获取租户的完整组织架构树
    /// </summary>
    Task<ListResultDto<TenantDto>> GetOrganizationTreeAsync(Guid? rootTenantId = null);
}

