using System;
using Volo.Abp.Application.Dtos;

namespace SmartAbp.PermissionManagement.Application.Contracts.Tenants.Dtos;

/// <summary>
/// 租户DTO
/// </summary>
public class TenantDto : EntityDto<Guid>
{
    /// <summary>
    /// 租户名称（唯一标识）
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// 租户显示名称
    /// </summary>
    public string? DisplayName { get; set; }

    /// <summary>
    /// 租户编码（业务编码）
    /// </summary>
    public string? Code { get; set; }

    /// <summary>
    /// 是否启用
    /// </summary>
    public bool IsActive { get; set; }

    /// <summary>
    /// 数据库Schema名称
    /// </summary>
    public string? SchemaName { get; set; }

    /// <summary>
    /// 租户类型（集团/子公司/部门）
    /// </summary>
    public TenantType TenantType { get; set; }

    /// <summary>
    /// 父租户ID（集团组织架构）
    /// </summary>
    public Guid? ParentTenantId { get; set; }

    /// <summary>
    /// 创建时间
    /// </summary>
    public DateTime CreationTime { get; set; }

    /// <summary>
    /// 最后修改时间
    /// </summary>
    public DateTime? LastModificationTime { get; set; }
}

/// <summary>
/// 租户类型枚举
/// </summary>
public enum TenantType
{
    /// <summary>
    /// 集团公司（顶级租户）
    /// </summary>
    Group = 0,

    /// <summary>
    /// 子公司
    /// </summary>
    Subsidiary = 1,

    /// <summary>
    /// 部门
    /// </summary>
    Department = 2,

    /// <summary>
    /// 独立租户（非集团架构）
    /// </summary>
    Independent = 3
}

