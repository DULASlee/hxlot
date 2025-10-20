using System;
using Volo.Abp.Application.Dtos;

namespace SmartAbp.PermissionManagement.Application.Contracts.Users.Dtos;

/// <summary>
/// 查询用户输入DTO
/// </summary>
public class GetUsersInput : PagedAndSortedResultRequestDto
{
    /// <summary>
    /// 搜索关键词（用户名/姓名/邮箱）
    /// </summary>
    public string? Filter { get; set; }

    /// <summary>
    /// 角色ID过滤
    /// </summary>
    public Guid? RoleId { get; set; }

    /// <summary>
    /// 组织单元ID过滤
    /// </summary>
    public Guid? OrganizationUnitId { get; set; }

    /// <summary>
    /// 是否启用（null表示查询全部）
    /// </summary>
    public bool? IsActive { get; set; }

    public GetUsersInput()
    {
        MaxResultCount = 20;
        Sorting = "CreationTime DESC";
    }
}

