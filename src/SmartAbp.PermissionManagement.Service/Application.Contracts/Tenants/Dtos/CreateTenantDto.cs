using System;
using System.ComponentModel.DataAnnotations;

namespace SmartAbp.PermissionManagement.Application.Contracts.Tenants.Dtos;

/// <summary>
/// 创建租户DTO
/// </summary>
public class CreateTenantDto
{
    /// <summary>
    /// 租户名称（唯一标识，用于登录）
    /// </summary>
    [Required]
    [StringLength(64)]
    public string Name { get; set; } = string.Empty;

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
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// 租户类型
    /// </summary>
    public TenantType TenantType { get; set; } = TenantType.Independent;

    /// <summary>
    /// 父租户ID（集团组织架构）
    /// 如果是集团顶级租户，则为null
    /// </summary>
    public Guid? ParentTenantId { get; set; }

    /// <summary>
    /// 管理员邮箱（用于创建默认管理员账号）
    /// </summary>
    [Required]
    [EmailAddress]
    [StringLength(256)]
    public string AdminEmail { get; set; } = string.Empty;

    /// <summary>
    /// 管理员密码（用于创建默认管理员账号）
    /// </summary>
    [Required]
    [StringLength(128, MinimumLength = 6)]
    public string AdminPassword { get; set; } = string.Empty;
}

