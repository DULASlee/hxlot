using System;
using Volo.Abp.Application.Dtos;

namespace SmartAbp.PermissionManagement.Application.Contracts.Roles.Dtos;

/// <summary>
/// 角色DTO
/// </summary>
public class RoleDto : EntityDto<Guid>
{
    /// <summary>
    /// 角色名称（唯一标识）
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// 是否默认角色
    /// </summary>
    public bool IsDefault { get; set; }

    /// <summary>
    /// 是否公开角色
    /// </summary>
    public bool IsPublic { get; set; }

    /// <summary>
    /// 是否静态角色（不可删除）
    /// </summary>
    public bool IsStatic { get; set; }

    /// <summary>
    /// 租户ID
    /// </summary>
    public Guid? TenantId { get; set; }

    /// <summary>
    /// 创建时间
    /// </summary>
    public DateTime CreationTime { get; set; }
}

