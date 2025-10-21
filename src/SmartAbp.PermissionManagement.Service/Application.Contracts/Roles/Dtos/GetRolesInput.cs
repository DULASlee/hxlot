using Volo.Abp.Application.Dtos;

namespace SmartAbp.PermissionManagement.Application.Contracts.Roles.Dtos;

/// <summary>
/// 查询角色输入DTO
/// </summary>
public class GetRolesInput : PagedAndSortedResultRequestDto
{
    /// <summary>
    /// 搜索关键词（角色名称）
    /// </summary>
    public string? Filter { get; set; }

    public GetRolesInput()
    {
        MaxResultCount = 20;
        Sorting = "Name ASC";
    }
}

