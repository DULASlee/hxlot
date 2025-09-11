/// <AI_TEMPLATE_INFO>
/// 模板类型: ABP实体DTO
/// 适用场景: 实体数据传输对象定义
/// 依赖项: Volo.Abp.Application.Dtos
/// 生成规则: 
///   - EntityName: 实体名称（PascalCase）
///   - 继承合适的基类（EntityDto, AuditedEntityDto等）
///   - 包含必要的属性和验证
/// </AI_TEMPLATE_INFO>

using System;
using System.ComponentModel.DataAnnotations;
using Volo.Abp.Application.Dtos;

namespace SmartAbp.{{ModuleName}};

/// <summary>
/// {{EntityName}} 数据传输对象
/// </summary>
public class {{EntityName}}Dto : AuditedEntityDto<Guid>
{
    /// <summary>
    /// 名称
    /// </summary>
    [Required]
    [StringLength({{EntityName}}Consts.MaxNameLength)]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// 显示名称
    /// </summary>
    [StringLength({{EntityName}}Consts.MaxDisplayNameLength)]
    public string? DisplayName { get; set; }

    /// <summary>
    /// 描述
    /// </summary>
    [StringLength({{EntityName}}Consts.MaxDescriptionLength)]
    public string? Description { get; set; }

    /// <summary>
    /// 是否启用
    /// </summary>
    public bool IsEnabled { get; set; } = true;

    /// <summary>
    /// 排序号
    /// </summary>
    public int Sort { get; set; }

    // TODO: 根据实际业务需求添加其他属性
    // 示例属性：
    // public string? Code { get; set; }
    // public decimal? Price { get; set; }
    // public DateTime? ExpireDate { get; set; }
    // public Guid? CategoryId { get; set; }
    // public string? CategoryName { get; set; }
}