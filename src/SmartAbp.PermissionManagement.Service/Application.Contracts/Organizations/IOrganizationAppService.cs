using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using SmartAbp.PermissionManagement.Application.Contracts.Organizations.Dtos;

namespace SmartAbp.PermissionManagement.Application.Contracts.Organizations;

/// <summary>
/// 组织架构管理应用服务接口
/// 支持集团公司多级组织架构
/// </summary>
public interface IOrganizationAppService : IApplicationService
{
    /// <summary>
    /// 获取所有组织单元（树形结构）
    /// </summary>
    Task<ListResultDto<OrganizationUnitDto>> GetListAsync();

    /// <summary>
    /// 根据ID获取组织单元
    /// </summary>
    Task<OrganizationUnitDto> GetAsync(Guid id);

    /// <summary>
    /// 创建组织单元
    /// </summary>
    Task<OrganizationUnitDto> CreateAsync(CreateOrganizationUnitDto input);

    /// <summary>
    /// 更新组织单元
    /// </summary>
    Task<OrganizationUnitDto> UpdateAsync(Guid id, UpdateOrganizationUnitDto input);

    /// <summary>
    /// 删除组织单元
    /// </summary>
    Task DeleteAsync(Guid id);

    /// <summary>
    /// 移动组织单元到新的父节点
    /// </summary>
    Task MoveAsync(Guid id, Guid? newParentId);

    /// <summary>
    /// 获取子组织单元列表
    /// </summary>
    Task<ListResultDto<OrganizationUnitDto>> GetChildrenAsync(Guid? parentId);
}

