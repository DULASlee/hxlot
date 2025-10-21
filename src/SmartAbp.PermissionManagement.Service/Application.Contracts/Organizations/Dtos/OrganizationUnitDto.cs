using System;
using Volo.Abp.Application.Dtos;

namespace SmartAbp.PermissionManagement.Application.Contracts.Organizations.Dtos;

/// <summary>
/// 组织单元DTO
/// </summary>
public class OrganizationUnitDto : EntityDto<Guid>
{
    /// <summary>
    /// 组织单元编码（层级编码，如：00001.00002.00003）
    /// </summary>
    public string Code { get; set; } = string.Empty;

    /// <summary>
    /// 显示名称
    /// </summary>
    public string DisplayName { get; set; } = string.Empty;

    /// <summary>
    /// 父组织单元ID
    /// </summary>
    public Guid? ParentId { get; set; }

    /// <summary>
    /// 租户ID
    /// </summary>
    public Guid? TenantId { get; set; }

    /// <summary>
    /// 成员数量
    /// </summary>
    public int MemberCount { get; set; }

    /// <summary>
    /// 角色数量
    /// </summary>
    public int RoleCount { get; set; }

    /// <summary>
    /// 创建时间
    /// </summary>
    public DateTime CreationTime { get; set; }
}

