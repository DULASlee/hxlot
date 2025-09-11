/// <AI_TEMPLATE_INFO>
/// 模板类型: ABP更新实体DTO
/// 适用场景: 更新实体时的数据传输对象
/// 依赖项: System.ComponentModel.DataAnnotations
/// 生成规则: 
///   - EntityName: 实体名称（PascalCase）
///   - ModuleName: 模块名称
///   - 包含更新时需要的属性和验证
/// </AI_TEMPLATE_INFO>

using System.ComponentModel.DataAnnotations;

namespace SmartAbp.{{ModuleName}};

/// <summary>
/// 更新{{EntityName}}的DTO
/// </summary>
public class Update{{EntityName}}Dto
{
    /// <summary>
    /// 名称
    /// </summary>
    [Required(ErrorMessage = "名称不能为空")]
    [StringLength({{EntityName}}Consts.MaxNameLength, ErrorMessage = "名称长度不能超过{1}个字符")]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// 显示名称
    /// </summary>
    [StringLength({{EntityName}}Consts.MaxDisplayNameLength, ErrorMessage = "显示名称长度不能超过{1}个字符")]
    public string? DisplayName { get; set; }

    /// <summary>
    /// 描述
    /// </summary>
    [StringLength({{EntityName}}Consts.MaxDescriptionLength, ErrorMessage = "描述长度不能超过{1}个字符")]
    public string? Description { get; set; }

    /// <summary>
    /// 排序号
    /// </summary>
    [Range(0, int.MaxValue, ErrorMessage = "排序号必须大于等于0")]
    public int Sort { get; set; }

    /// <summary>
    /// 是否启用
    /// </summary>
    public bool IsEnabled { get; set; } = true;

    // TODO: 根据实际业务需求添加其他属性
    // 示例属性：
    // [StringLength(50)]
    // public string? Code { get; set; }
    
    // [Range(0, double.MaxValue)]
    // public decimal? Price { get; set; }
    
    // public DateTime? ExpireDate { get; set; }
    
    // public Guid? CategoryId { get; set; }
}