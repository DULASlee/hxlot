/// <AI_TEMPLATE_INFO>
/// 模板类型: ABP查询实体列表DTO
/// 适用场景: 查询实体列表时的参数对象
/// 依赖项: Volo.Abp.Application.Dtos
/// 生成规则: 
///   - EntityName: 实体名称（PascalCase）
///   - ModuleName: 模块名称
///   - 继承分页和排序基类
///   - 包含常用的查询条件
/// </AI_TEMPLATE_INFO>

using Volo.Abp.Application.Dtos;

namespace SmartAbp.{{ModuleName}};

/// <summary>
/// 获取{{EntityName}}列表的查询参数
/// </summary>
public class Get{{EntityName}}ListDto : PagedAndSortedResultRequestDto
{
    /// <summary>
    /// 搜索关键字（支持名称、显示名称模糊搜索）
    /// </summary>
    public string? Filter { get; set; }

    /// <summary>
    /// 是否启用状态筛选
    /// </summary>
    public bool? IsEnabled { get; set; }

    // TODO: 根据实际业务需求添加其他查询条件
    // 示例查询条件：
    // /// <summary>
    // /// 分类ID筛选
    // /// </summary>
    // public Guid? CategoryId { get; set; }
    
    // /// <summary>
    // /// 创建时间范围筛选 - 开始时间
    // /// </summary>
    // public DateTime? CreationTimeStart { get; set; }
    
    // /// <summary>
    // /// 创建时间范围筛选 - 结束时间
    // /// </summary>
    // public DateTime? CreationTimeEnd { get; set; }
    
    // /// <summary>
    // /// 价格范围筛选 - 最小值
    // /// </summary>
    // public decimal? MinPrice { get; set; }
    
    // /// <summary>
    // /// 价格范围筛选 - 最大值
    // /// </summary>
    // public decimal? MaxPrice { get; set; }
}