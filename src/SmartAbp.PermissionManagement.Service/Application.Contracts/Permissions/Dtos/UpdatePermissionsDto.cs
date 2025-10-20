using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace SmartAbp.PermissionManagement.Application.Contracts.Permissions.Dtos;

/// <summary>
/// 更新权限DTO
/// </summary>
public class UpdatePermissionsDto
{
    /// <summary>
    /// 权限列表（权限名称 => 是否授予）
    /// </summary>
    [Required]
    public Dictionary<string, bool> Permissions { get; set; } = new();
}

