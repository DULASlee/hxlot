using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace SmartAbp.Domain.Shared.LowCode
{
    /// <summary>
    /// 页面配置DTO（JSON存储）- 后端SSOT
    /// 架构决策: 定义在Domain.Shared层，所有层都可引用，符合ABP最佳实践
    /// </summary>
    public class PageConfigDto
    {
        /// <summary>
        /// 表单配置（form-create完整规则）
        /// </summary>
        public FormConfigDto? Form { get; set; }

        /// <summary>
        /// 列表配置
        /// </summary>
        public ListConfigDto? List { get; set; }

        /// <summary>
        /// 详情配置
        /// </summary>
        public DetailConfigDto? Detail { get; set; }

        /// <summary>
        /// 页面事件配置
        /// </summary>
        public Dictionary<string, EventConfigDto>? Events { get; set; }

        /// <summary>
        /// 布局配置
        /// </summary>
        public LayoutConfigDto? Layout { get; set; }
    }

    /// <summary>
    /// 表单配置（form-create完整规则）
    /// </summary>
    public class FormConfigDto
    {
        /// <summary>
        /// form-create rules数组
        /// </summary>
        public List<FormCreateRuleDto> Rules { get; set; } = new List<FormCreateRuleDto>();

        /// <summary>
        /// 全局配置
        /// </summary>
        public FormGlobalConfigDto Config { get; set; } = new FormGlobalConfigDto();

        /// <summary>
        /// 字段联动规则
        /// </summary>
        public List<FieldEffectDto> Effects { get; set; } = new List<FieldEffectDto>();
    }

    /// <summary>
    /// form-create规则（与form-create完全对齐）
    /// </summary>
    public class FormCreateRuleDto
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
        public List<ValidationRuleConfigDto>? Validate { get; set; }

        /// <summary>
        /// 栅格配置
        /// </summary>
        public Dictionary<string, object>? Col { get; set; }
    }

    /// <summary>
    /// 表单全局配置
    /// </summary>
    public class FormGlobalConfigDto
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
    public class FieldEffectDto
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
    public class ListConfigDto
    {
        /// <summary>
        /// 列定义
        /// </summary>
        public List<ColumnDefinitionDto> Columns { get; set; } = new List<ColumnDefinitionDto>();

        /// <summary>
        /// 分页配置
        /// </summary>
        public PaginationConfigDto Pagination { get; set; } = new PaginationConfigDto();

        /// <summary>
        /// 操作按钮配置
        /// </summary>
        public List<ActionConfigDto> Actions { get; set; } = new List<ActionConfigDto>();
    }

    /// <summary>
    /// 列定义
    /// </summary>
    public class ColumnDefinitionDto
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
    public class PaginationConfigDto
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
    public class ActionConfigDto
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
    public class DetailConfigDto
    {
        /// <summary>
        /// 布局方式（vertical | horizontal）
        /// </summary>
        public string Layout { get; set; } = "vertical";

        /// <summary>
        /// 详情区段
        /// </summary>
        public List<DetailSectionDto> Sections { get; set; } = new List<DetailSectionDto>();
    }

    /// <summary>
    /// 详情区段
    /// </summary>
    public class DetailSectionDto
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
    public class EventConfigDto
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
        public EventConfigDto? Then { get; set; }

        /// <summary>
        /// 成功后的事件
        /// </summary>
        public EventConfigDto? AfterSuccess { get; set; }
    }

    /// <summary>
    /// 布局配置
    /// </summary>
    public class LayoutConfigDto
    {
        /// <summary>
        /// 布局类型（grid | flex）
        /// </summary>
        public string Type { get; set; } = "grid";

        /// <summary>
        /// 栅格列数（24栅格系统）
        /// </summary>
        public int Cols { get; set; } = 24;

        /// <summary>
        /// 间距（px）
        /// </summary>
        public int Gutter { get; set; } = 16;
    }

    /// <summary>
    /// 验证规则配置
    /// </summary>
    public class ValidationRuleConfigDto
    {
        /// <summary>
        /// 规则类型（required | min | max | pattern | email | ...）
        /// </summary>
        [Required]
        public string Type { get; set; } = default!;

        /// <summary>
        /// 错误提示信息
        /// </summary>
        public string? Message { get; set; }

        /// <summary>
        /// 规则值（如min规则的最小值）
        /// </summary>
        public object? Value { get; set; }

        /// <summary>
        /// 触发时机（change | blur）
        /// </summary>
        public string Trigger { get; set; } = "blur";
    }
}

