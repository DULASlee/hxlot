using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Identity;
using SmartAbp.PermissionManagement.Application.Contracts.Organizations;
using SmartAbp.PermissionManagement.Application.Contracts.Organizations.Dtos;

namespace SmartAbp.PermissionManagement.Application.Organizations;

/// <summary>
/// 组织架构管理应用服务
/// 实现集团公司多级组织架构管理
/// </summary>
public class OrganizationAppService : ApplicationService, IOrganizationAppService
{
    private readonly IOrganizationUnitRepository _ouRepository;
    private readonly OrganizationUnitManager _ouManager;

    public OrganizationAppService(
        IOrganizationUnitRepository ouRepository,
        OrganizationUnitManager ouManager)
    {
        _ouRepository = ouRepository;
        _ouManager = ouManager;
    }

    /// <summary>
    /// 获取所有组织单元（树形结构）
    /// </summary>
    public async Task<ListResultDto<OrganizationUnitDto>> GetListAsync()
    {
        var ous = await _ouRepository.GetListAsync();
        var dtos = ous.Select(MapToDto).OrderBy(ou => ou.Code).ToList();
        return new ListResultDto<OrganizationUnitDto>(dtos);
    }

    /// <summary>
    /// 根据ID获取组织单元
    /// </summary>
    public async Task<OrganizationUnitDto> GetAsync(Guid id)
    {
        var ou = await _ouRepository.GetAsync(id);
        return MapToDto(ou);
    }

    /// <summary>
    /// 创建组织单元
    /// </summary>
    public async Task<OrganizationUnitDto> CreateAsync(CreateOrganizationUnitDto input)
    {
        var ou = new OrganizationUnit(
            GuidGenerator.Create(),
            input.DisplayName,
            input.ParentId,
            CurrentTenant.Id
        );

        await _ouManager.CreateAsync(ou);
        await _ouRepository.InsertAsync(ou, autoSave: true);

        return MapToDto(ou);
    }

    /// <summary>
    /// 更新组织单元
    /// </summary>
    public async Task<OrganizationUnitDto> UpdateAsync(Guid id, UpdateOrganizationUnitDto input)
    {
        var ou = await _ouRepository.GetAsync(id);
        ou.DisplayName = input.DisplayName;

        await _ouManager.UpdateAsync(ou);
        await _ouRepository.UpdateAsync(ou, autoSave: true);

        return MapToDto(ou);
    }

    /// <summary>
    /// 删除组织单元
    /// </summary>
    public async Task DeleteAsync(Guid id)
    {
        var ou = await _ouRepository.GetAsync(id);

        // 检查是否有子节点
        var children = await _ouRepository.GetChildrenAsync(id);
        if (children.Any())
        {
            throw new UserFriendlyException("不能删除包含子节点的组织单元，请先删除或移动子节点");
        }

        await _ouManager.DeleteAsync(id);
    }

    /// <summary>
    /// 移动组织单元到新的父节点
    /// </summary>
    public async Task MoveAsync(Guid id, Guid? newParentId)
    {
        await _ouManager.MoveAsync(id, newParentId);
    }

    /// <summary>
    /// 获取子组织单元列表
    /// </summary>
    public async Task<ListResultDto<OrganizationUnitDto>> GetChildrenAsync(Guid? parentId)
    {
        List<OrganizationUnit> children;

        if (parentId.HasValue)
        {
            children = await _ouRepository.GetChildrenAsync(parentId.Value);
        }
        else
        {
            // 获取根级组织单元
            var allOus = await _ouRepository.GetListAsync();
            children = allOus.Where(ou => ou.ParentId == null).ToList();
        }

        var dtos = children.Select(MapToDto).OrderBy(ou => ou.Code).ToList();
        return new ListResultDto<OrganizationUnitDto>(dtos);
    }

    /// <summary>
    /// 映射到DTO
    /// </summary>
    private OrganizationUnitDto MapToDto(OrganizationUnit ou)
    {
        return new OrganizationUnitDto
        {
            Id = ou.Id,
            Code = ou.Code,
            DisplayName = ou.DisplayName,
            ParentId = ou.ParentId,
            TenantId = ou.TenantId,
            MemberCount = 0, // TODO: 需要单独查询成员数量
            RoleCount = 0, // TODO: 需要单独查询角色数量
            CreationTime = ou.CreationTime
        };
    }
}

