using System;
using System.ComponentModel.DataAnnotations;

namespace SmartAbp.PermissionManagement.Application.Contracts.Organizations.Dtos;

/// <summary>
/// 创建组织单元DTO
/// </summary>
public class CreateOrganizationUnitDto
{
    /// <summary>
    /// 显示名称
    /// </summary>
    [Required]
    [StringLength(128)]
    public string DisplayName { get; set; } = string.Empty;

    /// <summary>
    /// 父组织单元ID（null表示根级组织）
    /// </summary>
    public Guid? ParentId { get; set; }
}

