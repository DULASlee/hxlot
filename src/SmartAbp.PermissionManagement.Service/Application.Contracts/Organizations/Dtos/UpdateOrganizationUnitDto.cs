using System.ComponentModel.DataAnnotations;

namespace SmartAbp.PermissionManagement.Application.Contracts.Organizations.Dtos;

/// <summary>
/// 更新组织单元DTO
/// </summary>
public class UpdateOrganizationUnitDto
{
    /// <summary>
    /// 显示名称
    /// </summary>
    [Required]
    [StringLength(128)]
    public string DisplayName { get; set; } = string.Empty;
}

