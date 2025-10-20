using System.ComponentModel.DataAnnotations;

namespace SmartAbp.PermissionManagement.Application.Contracts.Roles.Dtos;

/// <summary>
/// 更新角色DTO
/// </summary>
public class UpdateRoleDto
{
    /// <summary>
    /// 角色名称
    /// </summary>
    [Required]
    [StringLength(256)]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// 是否默认角色
    /// </summary>
    public bool IsDefault { get; set; }

    /// <summary>
    /// 是否公开角色
    /// </summary>
    public bool IsPublic { get; set; }
}

