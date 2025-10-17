using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

namespace SmartAbp.Domain.Entities.LowCode
{
    /// <summary>
    /// 🔥🔥🔥 低代码页面配置聚合根（Phase 1 核心表 - 最核心）
    /// 对应表名: LC_PageConfigs
    /// 用途: 存储完整的页面配置（form-create规则 + 列表配置 + 详情配置）
    /// 核心特性: PageConfig JSON字段存储完整页面配置，与form-create完全对齐
    /// 架构决策: 后端SSOT，通过NSwag生成前端TypeScript类型
    /// </summary>
    [Table("LC_PageConfigs")]
    public class LowCodePageConfig : AuditedAggregateRoot<Guid>, IMultiTenant
    {
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 外键关系
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 所属实体ID
        /// </summary>
        public Guid EntityId { get; set; }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 基础信息
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 页面配置名称（如：UserFormConfig, UserListConfig）
        /// </summary>
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = default!;

        /// <summary>
        /// 显示名称（如：用户表单配置）
        /// </summary>
        [Required]
        [MaxLength(200)]
        public string DisplayName { get; set; } = default!;

        /// <summary>
        /// 页面类型（list | form | detail | custom）
        /// </summary>
        [Required]
        [MaxLength(50)]
        public string PageType { get; set; } = default!;

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 🔥🔥🔥 完整的页面配置（JSON）⭐⭐⭐
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 页面配置（JSON存储，包含form-create规则、列表配置、详情配置等）
        /// </summary>
        [Required]
        [Column(TypeName = "nvarchar(max)")]
        public PageConfigDto PageConfig { get; set; } = default!;

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 版本管理
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 版本号
        /// </summary>
        public int Version { get; set; } = 1;

        /// <summary>
        /// 是否已发布
        /// </summary>
        public bool IsPublished { get; set; }

        /// <summary>
        /// 发布时间
        /// </summary>
        public DateTime? PublishedAt { get; set; }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 状态管理
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 状态（Draft | Published | Archived）
        /// </summary>
        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Draft";

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

        protected LowCodePageConfig()
        {
            // EF Core需要无参构造函数
        }

        public LowCodePageConfig(
            Guid id,
            Guid entityId,
            string name,
            string displayName,
            string pageType,
            PageConfigDto pageConfig) : base(id)
        {
            EntityId = entityId;
            Name = name;
            DisplayName = displayName;
            PageType = pageType;
            PageConfig = pageConfig;
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 强类型DTO（JSON配置）⭐⭐⭐ 核心
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /// <summary>
    /// 页面配置DTO（JSON存储）
    /// </summary>
    public class PageConfigDto
    {
        /// <summary>
        /// 表单配置（form-create完整规则）
        /// </summary>
        public FormConfig? Form { get; set; }

        /// <summary>
        /// 列表配置
        /// </summary>
        public ListConfig? List { get; set; }

        /// <summary>
        /// 详情配置
        /// </summary>
        public DetailConfig? Detail { get; set; }

        /// <summary>
        /// 页面事件配置
        /// </summary>
        public Dictionary<string, EventConfig>? Events { get; set; }

        /// <summary>
        /// 布局配置
        /// </summary>
        public LayoutConfig? Layout { get; set; }
    }

    /// <summary>
    /// 表单配置（form-create完整规则）
    /// </summary>
    public class FormConfig
    {
        /// <summary>
        /// form-create rules数组
        /// </summary>
        public List<FormCreateRule> Rules { get; set; } = new List<FormCreateRule>();

        /// <summary>
        /// 全局配置
        /// </summary>
        public FormGlobalConfig Config { get; set; } = new FormGlobalConfig();

        /// <summary>
        /// 字段联动规则
        /// </summary>
        public List<FieldEffect> Effects { get; set; } = new List<FieldEffect>();
    }

    /// <summary>
    /// form-create规则（与form-create完全对齐）
    /// </summary>
    public class FormCreateRule
    {
        /// <summary>
        /// 控件类型（input | select | date | ...）
        /// </summary>
        [Required]
        public string Type { get; set; } = default!;

        /// <summary>
        /// 字段名称
        /// </summary>
        [Required]
        public string Field { get; set; } = default!;

        /// <summary>
        /// 字段标题
        /// </summary>
        [Required]
        public string Title { get; set; } = default!;

        /// <summary>
        /// 默认值
        /// </summary>
        public object? Value { get; set; }

        /// <summary>
        /// 控件属性
        /// </summary>
        public Dictionary<string, object>? Props { get; set; }

        /// <summary>
        /// 验证规则
        /// </summary>
        public List<SmartAbp.Domain.Entities.LowCode.ValidationRuleConfig>? Validate { get; set; }

        /// <summary>
        /// 栅格配置
        /// </summary>
        public Dictionary<string, object>? Col { get; set; }
    }

    /// <summary>
    /// 表单全局配置
    /// </summary>
    public class FormGlobalConfig
    {
        /// <summary>
        /// 表单尺寸（default | small | large）
        /// </summary>
        public string Size { get; set; } = "default";

        /// <summary>
        /// 标签位置（right | left | top）
        /// </summary>
        public string LabelPosition { get; set; } = "right";

        /// <summary>
        /// 标签宽度（px）
        /// </summary>
        public int LabelWidth { get; set; } = 100;

        /// <summary>
        /// 是否行内表单
        /// </summary>
        public bool Inline { get; set; }

        /// <summary>
        /// 是否显示重置按钮
        /// </summary>
        public bool ShowResetButton { get; set; } = true;

        /// <summary>
        /// 是否显示提交按钮
        /// </summary>
        public bool ShowSubmitButton { get; set; } = true;

        /// <summary>
        /// 提交按钮文本
        /// </summary>
        public string SubmitButtonText { get; set; } = "提交";

        /// <summary>
        /// 重置按钮文本
        /// </summary>
        public string ResetButtonText { get; set; } = "重置";
    }

    /// <summary>
    /// 字段联动效果
    /// </summary>
    public class FieldEffect
    {
        /// <summary>
        /// 源字段（触发联动的字段）
        /// </summary>
        [Required]
        public string Source { get; set; } = default!;

        /// <summary>
        /// 目标字段（被联动的字段）
        /// </summary>
        [Required]
        public string Target { get; set; } = default!;

        /// <summary>
        /// 触发事件（change | blur | focus）
        /// </summary>
        [Required]
        public string Event { get; set; } = "change";

        /// <summary>
        /// 联动效果（show | hide | enable | disable | setValue | options）
        /// </summary>
        [Required]
        public string Effect { get; set; } = default!;

        /// <summary>
        /// 条件表达式（如：value === 'admin'）
        /// </summary>
        public string? Condition { get; set; }

        /// <summary>
        /// 联动配置
        /// </summary>
        public Dictionary<string, object>? Config { get; set; }
    }

    /// <summary>
    /// 列表配置
    /// </summary>
    public class ListConfig
    {
        /// <summary>
        /// 列定义
        /// </summary>
        public List<ColumnDefinition> Columns { get; set; } = new List<ColumnDefinition>();

        /// <summary>
        /// 分页配置
        /// </summary>
        public PaginationConfig Pagination { get; set; } = new PaginationConfig();

        /// <summary>
        /// 操作按钮配置
        /// </summary>
        public List<ActionConfig> Actions { get; set; } = new List<ActionConfig>();
    }

    /// <summary>
    /// 列定义
    /// </summary>
    public class ColumnDefinition
    {
        /// <summary>
        /// 列属性名
        /// </summary>
        [Required]
        public string Prop { get; set; } = default!;

        /// <summary>
        /// 列标签
        /// </summary>
        [Required]
        public string Label { get; set; } = default!;

        /// <summary>
        /// 列宽度（px）
        /// </summary>
        public int? Width { get; set; }

        /// <summary>
        /// 是否可排序
        /// </summary>
        public bool Sortable { get; set; }

        /// <summary>
        /// 是否可筛选
        /// </summary>
        public bool Filterable { get; set; }

        /// <summary>
        /// 是否可搜索
        /// </summary>
        public bool Searchable { get; set; }

        /// <summary>
        /// 格式化器（函数名称）
        /// </summary>
        public string? Formatter { get; set; }
    }

    /// <summary>
    /// 分页配置
    /// </summary>
    public class PaginationConfig
    {
        /// <summary>
        /// 每页显示数量
        /// </summary>
        public int PageSize { get; set; } = 20;

        /// <summary>
        /// 每页显示数量选项
        /// </summary>
        public List<int> PageSizes { get; set; } = new List<int> { 10, 20, 50, 100 };
    }

    /// <summary>
    /// 操作按钮配置
    /// </summary>
    public class ActionConfig
    {
        /// <summary>
        /// 按钮类型（create | edit | delete | custom）
        /// </summary>
        [Required]
        public string Type { get; set; } = default!;

        /// <summary>
        /// 按钮标签
        /// </summary>
        [Required]
        public string Label { get; set; } = default!;

        /// <summary>
        /// 按钮图标
        /// </summary>
        public string? Icon { get; set; }

        /// <summary>
        /// 按钮动作（openDialog | api | navigate）
        /// </summary>
        public string? Action { get; set; }

        /// <summary>
        /// 显示条件（表达式）
        /// </summary>
        public string? Condition { get; set; }

        /// <summary>
        /// 按钮配置
        /// </summary>
        public Dictionary<string, object>? Config { get; set; }
    }

    /// <summary>
    /// 详情配置
    /// </summary>
    public class DetailConfig
    {
        /// <summary>
        /// 布局方式（vertical | horizontal）
        /// </summary>
        public string Layout { get; set; } = "vertical";

        /// <summary>
        /// 详情区段
        /// </summary>
        public List<DetailSection> Sections { get; set; } = new List<DetailSection>();
    }

    /// <summary>
    /// 详情区段
    /// </summary>
    public class DetailSection
    {
        /// <summary>
        /// 区段标题
        /// </summary>
        [Required]
        public string Title { get; set; } = default!;

        /// <summary>
        /// 区段类型（fields | table）
        /// </summary>
        public string Type { get; set; } = "fields";

        /// <summary>
        /// 显示字段列表
        /// </summary>
        public List<string>? Fields { get; set; }

        /// <summary>
        /// 数据源字段名（type=table时）
        /// </summary>
        public string? Data { get; set; }
    }

    /// <summary>
    /// 事件配置
    /// </summary>
    public class EventConfig
    {
        /// <summary>
        /// 事件类型（api | navigate | dialog | validate）
        /// </summary>
        [Required]
        public string Type { get; set; } = default!;

        /// <summary>
        /// API URL（type=api时）
        /// </summary>
        public string? Url { get; set; }

        /// <summary>
        /// HTTP方法（GET | POST | PUT | DELETE）
        /// </summary>
        public string? Method { get; set; }

        /// <summary>
        /// 请求参数
        /// </summary>
        public Dictionary<string, object>? Params { get; set; }

        /// <summary>
        /// 成功提示信息
        /// </summary>
        public string? SuccessMessage { get; set; }

        /// <summary>
        /// 后续事件（链式调用）
        /// </summary>
        public EventConfig? Then { get; set; }

        /// <summary>
        /// 成功后的事件
        /// </summary>
        public EventConfig? AfterSuccess { get; set; }
    }

    /// <summary>
    /// 布局配置
    /// </summary>
    public class LayoutConfig
    {
        /// <summary>
        /// 布局类型（grid | flex）
        /// </summary>
        public string Type { get; set; } = "grid";

        /// <summary>
        /// 栅格列数（24栅格系统）
        /// </summary>
        public int Columns { get; set; } = 24;

        /// <summary>
        /// 栅格间距（px）
        /// </summary>
        public int Gutter { get; set; } = 20;
    }
}

