using System.Collections.Generic;

namespace SmartAbp.CodeGenerator.ABP
{
    /// <summary>
    /// ABP设置管理生成参数
    /// </summary>
    public class AbpSettingsGenerationArgs
    {
        /// <summary>
        /// 命名空间
        /// </summary>
        public string Namespace { get; set; } = null!;

        /// <summary>
        /// 设置组名称
        /// </summary>
        public string SettingsGroupName { get; set; } = null!;

        /// <summary>
        /// 设置组描述
        /// </summary>
        public string? Description { get; set; }

        /// <summary>
        /// 设置定义列表
        /// </summary>
        public List<SettingDefinition> Settings { get; set; } = new();

        /// <summary>
        /// 是否支持多租户
        /// </summary>
        public bool IsMultiTenant { get; set; } = true;

        /// <summary>
        /// 是否支持用户级设置
        /// </summary>
        public bool SupportUserLevel { get; set; } = true;

        /// <summary>
        /// 是否支持全局设置
        /// </summary>
        public bool SupportGlobalLevel { get; set; } = true;

        /// <summary>
        /// 是否加密敏感设置
        /// </summary>
        public bool EncryptSensitiveSettings { get; set; } = true;

        /// <summary>
        /// 设置缓存过期时间（分钟）
        /// </summary>
        public int CacheExpirationMinutes { get; set; } = 60;

        /// <summary>
        /// 是否启用设置变更事件
        /// </summary>
        public bool EnableChangeEvents { get; set; } = true;

        /// <summary>
        /// 是否生成管理界面
        /// </summary>
        public bool GenerateManagementUI { get; set; } = true;

        /// <summary>
        /// UI框架（Vue/React/Angular）
        /// </summary>
        public string UIFramework { get; set; } = "Vue";
    }

    /// <summary>
    /// 设置定义
    /// </summary>
    public class SettingDefinition
    {
        /// <summary>
        /// 设置名称
        /// </summary>
        public string Name { get; set; } = null!;

        /// <summary>
        /// 显示名称
        /// </summary>
        public string DisplayName { get; set; } = null!;

        /// <summary>
        /// 描述
        /// </summary>
        public string? Description { get; set; }

        /// <summary>
        /// 设置类型（String/Int/Bool/Decimal/Enum）
        /// </summary>
        public string ValueType { get; set; } = "String";

        /// <summary>
        /// 默认值
        /// </summary>
        public string? DefaultValue { get; set; }

        /// <summary>
        /// 是否必填
        /// </summary>
        public bool IsRequired { get; set; } = false;

        /// <summary>
        /// 是否敏感数据
        /// </summary>
        public bool IsSensitive { get; set; } = false;

        /// <summary>
        /// 是否继承
        /// </summary>
        public bool IsInherited { get; set; } = true;

        /// <summary>
        /// 设置范围（Global/Tenant/User）
        /// </summary>
        public List<string> Scopes { get; set; } = new();

        /// <summary>
        /// 验证规则
        /// </summary>
        public List<SettingValidationRule>? ValidationRules { get; set; }

        /// <summary>
        /// UI控件类型（TextBox/CheckBox/Select/Number）
        /// </summary>
        public string UIControlType { get; set; } = "TextBox";

        /// <summary>
        /// 枚举选项（当ValueType为Enum时使用）
        /// </summary>
        public List<EnumOption>? EnumOptions { get; set; }
    }

    /// <summary>
    /// 设置验证规则
    /// </summary>
    public class SettingValidationRule
    {
        /// <summary>
        /// 规则类型（Required/MinLength/MaxLength/Range/Regex/Custom）
        /// </summary>
        public string RuleType { get; set; } = null!;

        /// <summary>
        /// 规则值
        /// </summary>
        public string? RuleValue { get; set; }

        /// <summary>
        /// 错误消息
        /// </summary>
        public string? ErrorMessage { get; set; }
    }

    /// <summary>
    /// 枚举选项
    /// </summary>
    public class EnumOption
    {
        /// <summary>
        /// 选项值
        /// </summary>
        public string Value { get; set; } = null!;

        /// <summary>
        /// 选项标签
        /// </summary>
        public string Label { get; set; } = null!;
    }
}
