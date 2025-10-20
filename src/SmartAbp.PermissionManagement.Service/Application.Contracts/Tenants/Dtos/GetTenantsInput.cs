using System;
using Volo.Abp.Application.Dtos;

namespace SmartAbp.PermissionManagement.Application.Contracts.Tenants.Dtos;

/// <summary>
/// 查询租户输入DTO
/// </summary>
public class GetTenantsInput : PagedAndSortedResultRequestDto
{
    /// <summary>
    /// 租户名称（模糊搜索）
    /// </summary>
    public string? Filter { get; set; }

    /// <summary>
    /// 是否启用（null表示查询全部）
    /// </summary>
    public bool? IsActive { get; set; }

    /// <summary>
    /// 租户类型（null表示查询全部）
    /// </summary>
    public TenantType? TenantType { get; set; }

    /// <summary>
    /// 父租户ID（查询子租户，null表示查询顶级租户）
    /// </summary>
    public Guid? ParentTenantId { get; set; }

    public GetTenantsInput()
    {
        MaxResultCount = 20;
        Sorting = "CreationTime DESC";
    }
}

