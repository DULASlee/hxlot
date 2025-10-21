using System;
using System.ComponentModel.DataAnnotations;

namespace SmartAbp.PermissionManagement.Application.Contracts.Tenants.Dtos;

/// <summary>
/// 更新租户DTO
/// </summary>
public class UpdateTenantDto
{
    /// <summary>
    /// 租户显示名称
    /// </summary>
    [StringLength(256)]
    public string? DisplayName { get; set; }

    /// <summary>
    /// 租户编码（业务编码）
    /// </summary>
    [StringLength(64)]
    public string? Code { get; set; }

    /// <summary>
    /// 是否启用
    /// </summary>
    public bool IsActive { get; set; }

    /// <summary>
    /// 租户类型
    /// </summary>
    public TenantType TenantType { get; set; }

    /// <summary>
    /// 父租户ID（集团组织架构）
    /// </summary>
    public Guid? ParentTenantId { get; set; }
}

