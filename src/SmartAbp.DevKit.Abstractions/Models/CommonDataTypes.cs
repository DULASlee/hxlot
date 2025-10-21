using System;
using System.Collections.Generic;

namespace SmartAbp.DevKit.Abstractions.Models;

/// <summary>
/// 通用实体定义（企业级完整版）
/// </summary>
public class GeneralEntityDefinition
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? PluralName { get; set; } // 新增：复数名称
    public string TableName { get; set; } = string.Empty;
    public string Schema { get; set; } = "dbo"; // 新增：数据库Schema
    public string NamespacePrefix { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreationTime { get; set; }
    public List<GeneralEntityField> Fields { get; set; } = new();
    public List<GeneralEntityRelation> Relations { get; set; } = new();
    public Guid ModuleId { get; set; }
    public string ModuleName { get; set; } = string.Empty;
    public string Namespace { get; set; } = string.Empty;
    public string PrimaryKeyType { get; set; } = "Guid";

    // SmartAbp特有属性
    public string? GroupName { get; set; } // 新增：分组名称
    public int DisplayOrder { get; set; } // 新增：显示顺序
    public Guid? TenantId { get; set; } // 新增：租户ID

    // 配置JSON（保持SmartAbp配置完整性）
    public string? EntityConfigJson { get; set; } // 新增：实体配置JSON
    public string? UIConfigJson { get; set; } // 新增：UI配置JSON

    /// <summary>
    /// 向后兼容：实体名称（指向Name）
    /// </summary>
    public string EntityName => Name;

    /// <summary>
    /// 扩展属性，用于存储特定业务的额外信息
    /// </summary>
    public Dictionary<string, object> ExtensionData { get; set; } = new();
}

/// <summary>
/// 通用实体字段（企业级完整版 - 增强映射）
/// </summary>
public class GeneralEntityField
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty; // 新增：属性描述
    public string DataType { get; set; } = string.Empty;
    public int? Length { get; set; }
    public bool IsRequired { get; set; }
    public bool IsNullable { get; set; }
    public bool IsUnique { get; set; }
    public bool IsIndexed { get; set; }
    public bool IsKey { get; set; }
    public bool IsForeignKey { get; set; } // 新增：是否外键
    public string DefaultValue { get; set; } = string.Empty;
    public string ValidationRules { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;

    // 数据库映射信息
    public string ColumnName { get; set; } = string.Empty; // 新增：数据库列名
    public string ColumnType { get; set; } = string.Empty; // 新增：数据库列类型

    // 长度和数值约束
    public int? MaxLength { get; set; } // 新增：最大长度
    public int? MinLength { get; set; } // 新增：最小长度
    public decimal? MinValue { get; set; } // 新增：最小值
    public decimal? MaxValue { get; set; } // 新增：最大值

    // 关系属性
    public string? ForeignKeyEntity { get; set; } // 新增：外键指向的实体
    public string? ForeignKeyProperty { get; set; } // 新增：外键指向的属性

    /// <summary>
    /// 向后兼容：字段类型（指向DataType）
    /// </summary>
    public string Type => DataType;

    /// <summary>
    /// UI配置JSON（保持SmartAbp UIConfig完整性）
    /// </summary>
    public string? UIConfigJson { get; set; } // 新增：UI配置JSON

    /// <summary>
    /// 扩展属性，用于存储特定业务的额外信息
    /// </summary>
    public Dictionary<string, object> ExtensionData { get; set; } = new();
}

/// <summary>
/// 通用实体关系定义
/// </summary>
public class GeneralEntityRelation
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string TargetEntityName { get; set; } = string.Empty;
    public string RelationType { get; set; } = string.Empty; // e.g., OneToOne, OneToMany, ManyToMany
    public string ForeignKey { get; set; } = string.Empty;
    public string InverseProperty { get; set; } = string.Empty;
    public bool IsRequired { get; set; }
    public bool IsActive { get; set; } = true;
}

/// <summary>
/// 通用模块定义（企业级完整版）
/// </summary>
public class GeneralModuleDefinition
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Version { get; set; } = "1.0.0";
    public string Namespace { get; set; } = string.Empty;
    public string OutputPath { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public List<GeneralEntityDefinition> Entities { get; set; } = new();

    /// <summary>
    /// 扩展属性，用于存储特定业务的额外信息
    /// </summary>
    public Dictionary<string, object> ExtensionData { get; set; } = new();
}

/// <summary>
/// 目标层枚举（替换业务特定的TargetLayer）
/// </summary>
public enum GeneralTargetLayer
{
    None = 0,
    Domain = 1,
    Application = 2,
    HttpApi = 4,
    Frontend = 8,
    Tests = 16,
    All = Domain | Application | HttpApi | Frontend | Tests
}

/// <summary>
/// 模板配置（通用版本）
/// </summary>
public class GeneralTemplateConfig
{
    public string TemplatePath { get; set; } = string.Empty;
    public string TemplateDirectory { get; set; } = "templates";
    public string TemplateExtension { get; set; } = ".template";
    public string BackendTemplatePath { get; set; } = "templates/backend";
    public string FrontendTemplatePath { get; set; } = "templates/frontend";
    public Dictionary<string, string> CustomPaths { get; set; } = new();
}

/// <summary>
/// 输出路径配置（通用版本）
/// </summary>
public class GeneralOutputPathConfig
{
    public string BasePath { get; set; } = string.Empty;
    public string DomainPath { get; set; } = "src/Domain/Entities";
    public string ApplicationPath { get; set; } = "src/Application";
    public string HttpApiPath { get; set; } = "src/HttpApi";
    public string FrontendPath { get; set; } = "src/Frontend";
    public string TestsPath { get; set; } = "tests";
    public Dictionary<string, string> CustomPaths { get; set; } = new();
}
