using System;
using System.ComponentModel.DataAnnotations;

namespace SmartAbp.PermissionManagement.Application.Contracts.Users.Dtos;

/// <summary>
/// 更新用户DTO
/// </summary>
public class UpdateIdentityUserDto
{
    /// <summary>
    /// 姓名
    /// </summary>
    [StringLength(64)]
    public string? Name { get; set; }

    /// <summary>
    /// 姓
    /// </summary>
    [StringLength(64)]
    public string? Surname { get; set; }

    /// <summary>
    /// 邮箱
    /// </summary>
    [Required]
    [EmailAddress]
    [StringLength(256)]
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// 手机号
    /// </summary>
    [Phone]
    [StringLength(16)]
    public string? PhoneNumber { get; set; }

    /// <summary>
    /// 是否启用
    /// </summary>
    public bool IsActive { get; set; }

    /// <summary>
    /// 是否锁定
    /// </summary>
    public bool LockoutEnabled { get; set; }

    /// <summary>
    /// 角色ID列表
    /// </summary>
    public Guid[] RoleIds { get; set; } = Array.Empty<Guid>();

    /// <summary>
    /// 组织单元ID列表
    /// </summary>
    public Guid[] OrganizationUnitIds { get; set; } = Array.Empty<Guid>();
}

