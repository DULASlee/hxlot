using System.ComponentModel.DataAnnotations;

namespace SmartAbp.PermissionManagement.Application.Contracts.Roles.Dtos;

/// <summary>
/// 创建角色DTO
/// </summary>
public class CreateRoleDto
{
    /// <summary>
    /// 角色名称（唯一标识）
    /// </summary>
    [Required]
    [StringLength(256)]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// 是否默认角色（新用户自动分配）
    /// </summary>
    public bool IsDefault { get; set; } = false;

    /// <summary>
    /// 是否公开角色（所有用户可见）
    /// </summary>
    public bool IsPublic { get; set; } = false;
}

