using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

namespace SmartAbp.Domain.Entities.LowCode
{
    /// <summary>
    /// 🔥🔥🔥 低代码属性实体（Phase 1 核心表 - 最重要）
    /// 对应表名: LC_Properties
    /// 用途: 定义实体的属性+UI配置（属性定义 + UI控件配置合一）
    /// 核心特性: UIConfig JSON字段存储控件类型、验证规则、显示配置等
    /// 架构决策: 后端SSOT，通过NSwag生成前端TypeScript类型
    /// </summary>
    [Table("LC_Properties")]
    public class LowCodeProperty : AuditedEntity<Guid>, IMultiTenant
    {
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 外键关系
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 所属实体ID
        /// </summary>
        public Guid EntityId { get; set; }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 基础信息（后端Entity定义）
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 属性名称（PascalCase，如：UserName, Email）
        /// </summary>
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = default!;

        /// <summary>
        /// 显示名称（中文，如：用户名、邮箱）
        /// </summary>
        [Required]
        [MaxLength(200)]
        public string DisplayName { get; set; } = default!;

        /// <summary>
        /// 属性描述
        /// </summary>
        [MaxLength(500)]
        public string? Description { get; set; }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 类型定义
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// C#类型（string, int, Guid, DateTime, bool, decimal, enum）
        /// </summary>
        [Required]
        [MaxLength(50)]
        public string Type { get; set; } = default!;

        /// <summary>
        /// 是否可空
        /// </summary>
        public bool IsNullable { get; set; }

        /// <summary>
        /// 默认值（如："admin", "0", "true"）
        /// </summary>
        [MaxLength(200)]
        public string? DefaultValue { get; set; }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 数据库映射
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 数据库列名（如：UserName, Email）
        /// </summary>
        [Required]
        [MaxLength(100)]
        public string ColumnName { get; set; } = default!;

        /// <summary>
        /// 数据库列类型（如：nvarchar(100), int, uniqueidentifier）
        /// </summary>
        [Required]
        [MaxLength(50)]
        public string ColumnType { get; set; } = default!;

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 约束
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 是否主键
        /// </summary>
        public bool IsKey { get; set; }

        /// <summary>
        /// 是否必填
        /// </summary>
        public bool IsRequired { get; set; }

        /// <summary>
        /// 是否唯一
        /// </summary>
        public bool IsUnique { get; set; }

        /// <summary>
        /// 是否外键
        /// </summary>
        public bool IsForeignKey { get; set; }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 字符串/数值约束
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 最大长度（字符串）
        /// </summary>
        public int? MaxLength { get; set; }

        /// <summary>
        /// 最小长度（字符串）
        /// </summary>
        public int? MinLength { get; set; }

        /// <summary>
        /// 最小值（数值）
        /// </summary>
        public decimal? MinValue { get; set; }

        /// <summary>
        /// 最大值（数值）
        /// </summary>
        public decimal? MaxValue { get; set; }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 🔥 JSON配置（强类型DTO）⭐⭐⭐ 核心
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// UI配置（JSON存储，包含控件类型、显示配置、数据源等）
        /// </summary>
        public PropertyUIConfig? UIConfig { get; set; }

        /// <summary>
        /// 验证规则列表（JSON存储）
        /// </summary>
        public List<ValidationRuleConfig>? ValidationRules { get; set; }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 显示顺序和状态
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 显示顺序
        /// </summary>
        public int DisplayOrder { get; set; }

        /// <summary>
        /// 租户ID（多租户支持）
        /// </summary>
        public Guid? TenantId { get; set; }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 导航属性
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 所属实体
        /// </summary>
        public virtual LowCodeEntity Entity { get; set; } = default!;

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 构造函数
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        protected LowCodeProperty()
        {
            // EF Core需要无参构造函数
        }

        public LowCodeProperty(
            Guid id,
            Guid entityId,
            string name,
            string displayName,
            string type,
            string columnName,
            string columnType) : base(id)
        {
            EntityId = entityId;
            Name = name;
            DisplayName = displayName;
            Type = type;
            ColumnName = columnName;
            ColumnType = columnType;
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 强类型DTO（JSON配置）⭐⭐⭐ 核心
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /// <summary>
    /// 属性UI配置（JSON存储）
    /// Phase 1A 调整：保留在 Domain 层，通过 NSwag 配置扫描
    /// </summary>
    public class PropertyUIConfig
    {
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 显示控制
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 列表页是否显示
        /// </summary>
        public bool ListVisible { get; set; } = true;

        /// <summary>
        /// 表单页是否显示
        /// </summary>
        public bool FormVisible { get; set; } = true;

        /// <summary>
        /// 详情页是否显示
        /// </summary>
        public bool DetailVisible { get; set; } = true;

        /// <summary>
        /// 是否可搜索
        /// </summary>
        public bool Searchable { get; set; } = true;

        /// <summary>
        /// 是否可排序
        /// </summary>
        public bool Sortable { get; set; } = true;

        /// <summary>
        /// 是否可筛选
        /// </summary>
        public bool Filterable { get; set; } = true;

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 控件类型和配置
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 控件类型（input, select, date, datetime, textarea, switch, radio, checkbox, upload, editor）
        /// </summary>
        [Required]
        public string ControlType { get; set; } = "input";

        /// <summary>
        /// 控件属性配置（如：{placeholder: "请输入", disabled: false}）
        /// </summary>
        public Dictionary<string, object>? ControlProps { get; set; }

        /// <summary>
        /// 数据源配置（下拉框、单选框等需要）
        /// </summary>
        public DataSourceConfig? DataSource { get; set; }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 列表配置
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 列表列配置
        /// </summary>
        public ListFieldConfig? List { get; set; }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 表单配置
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 表单字段配置
        /// </summary>
        public FormFieldConfig? Form { get; set; }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 显示格式化
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 显示格式化（如：{date} -> YYYY-MM-DD）
        /// </summary>
        public string? DisplayFormat { get; set; }

        /// <summary>
        /// 前缀（如：¥、$）
        /// </summary>
        public string? Prefix { get; set; }

        /// <summary>
        /// 后缀（如：元、美元）
        /// </summary>
        public string? Suffix { get; set; }
    }

    /// <summary>
    /// 数据源配置
    /// </summary>
    public class DataSourceConfig
    {
        /// <summary>
        /// 数据源类型（static | api | dict）
        /// </summary>
        public string Type { get; set; } = "static";

        /// <summary>
        /// API URL（type=api时）
        /// </summary>
        public string? Url { get; set; }

        /// <summary>
        /// 显示字段名（如：name, title）
        /// </summary>
        public string LabelField { get; set; } = "name";

        /// <summary>
        /// 值字段名（如：id, value）
        /// </summary>
        public string ValueField { get; set; } = "id";

        /// <summary>
        /// 请求参数
        /// </summary>
        public Dictionary<string, object>? Params { get; set; }
    }

    /// <summary>
    /// 列表列配置
    /// </summary>
    public class ListFieldConfig
    {
        /// <summary>
        /// 列宽度（px）
        /// </summary>
        public int? Width { get; set; }

        /// <summary>
        /// 对齐方式（left | center | right）
        /// </summary>
        public string Align { get; set; } = "left";

        /// <summary>
        /// 固定列（left | right）
        /// </summary>
        public string? Fixed { get; set; }

        /// <summary>
        /// 格式化器（函数名称）
        /// </summary>
        public string? Formatter { get; set; }
    }

    /// <summary>
    /// 表单字段配置
    /// </summary>
    public class FormFieldConfig
    {
        /// <summary>
        /// 占用列数（1-24，基于24栅格系统）
        /// </summary>
        public int Col { get; set; } = 12;

        /// <summary>
        /// 占用行数
        /// </summary>
        public int Row { get; set; } = 1;

        /// <summary>
        /// 是否必填
        /// </summary>
        public bool Required { get; set; }

        /// <summary>
        /// 是否禁用
        /// </summary>
        public bool Disabled { get; set; }

        /// <summary>
        /// 是否只读
        /// </summary>
        public bool Readonly { get; set; }
    }

    /// <summary>
    /// 验证规则配置（UI控件验证规则，非DTO）
    /// Phase 1A: 重命名避免与 ValidationRuleDto 冲突
    /// </summary>
    public class ValidationRuleConfig
    {
        /// <summary>
        /// 验证类型（required | pattern | min | max | email | phone | async）
        /// </summary>
        [Required]
        public string Type { get; set; } = default!;

        /// <summary>
        /// 验证值（如：pattern的正则表达式，min的最小值）
        /// </summary>
        public string? Value { get; set; }

        /// <summary>
        /// 错误提示信息
        /// </summary>
        [Required]
        public string Message { get; set; } = default!;

        /// <summary>
        /// 自定义验证器名称（type=async时）
        /// </summary>
        public string? Validator { get; set; }
    }
}

