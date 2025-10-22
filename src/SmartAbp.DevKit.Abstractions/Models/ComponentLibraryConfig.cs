/**
 * UniApp组件库配置
 * 
 * @author SmartAbp DevKit Low-Code Engine
 * @since 2025-10-21
 * @description 支持多组件库集成配置（uView UI、Wot Design Uni等）
 */

namespace SmartAbp.DevKit.Abstractions.Models;

/// <summary>
/// UniApp组件库配置
/// </summary>
public class ComponentLibraryConfig
{
    /// <summary>
    /// 组件库类型
    /// </summary>
    public ComponentLibraryType Type { get; set; } = ComponentLibraryType.UView;

    /// <summary>
    /// 组件库名称
    /// </summary>
    public string Name => Type.ToString();

    /// <summary>
    /// 组件库版本
    /// </summary>
    public string Version { get; set; } = "3.2.7";

    /// <summary>
    /// NPM包名
    /// </summary>
    public string PackageName => Type switch
    {
        ComponentLibraryType.UView => "uview-plus",
        ComponentLibraryType.WotDesign => "wot-design-uni",
        ComponentLibraryType.UniUI => "@dcloudio/uni-ui",
        _ => "uview-plus"
    };

    /// <summary>
    /// 字段类型到组件映射
    /// </summary>
    public Dictionary<string, string> FieldTypeMapping { get; set; } = new();

    /// <summary>
    /// 验证规则映射
    /// </summary>
    public Dictionary<string, ValidationRuleMapping> ValidationMapping { get; set; } = new();

    /// <summary>
    /// 是否启用暗黑模式
    /// </summary>
    public bool EnableDarkMode { get; set; } = false;

    /// <summary>
    /// 主题配置
    /// </summary>
    public ThemeConfig? Theme { get; set; }

    /// <summary>
    /// 获取默认uView配置
    /// </summary>
    public static ComponentLibraryConfig GetDefaultUViewConfig()
    {
        return new ComponentLibraryConfig
        {
            Type = ComponentLibraryType.UView,
            Version = "3.2.7",
            FieldTypeMapping = new Dictionary<string, string>
            {
                { "string", "u-input" },
                { "int", "u-number-box" },
                { "long", "u-number-box" },
                { "decimal", "u-number-box" },
                { "double", "u-number-box" },
                { "DateTime", "u-datetime-picker" },
                { "bool", "u-switch" },
                { "enum", "u-select" },
                { "Guid", "u-input" },
                { "file", "u-upload" },
                { "image", "u-upload" },
                { "richtext", "u-editor" },
                { "color", "u-color-picker" },
                { "rate", "u-rate" },
                { "slider", "u-slider" }
            },
            ValidationMapping = new Dictionary<string, ValidationRuleMapping>
            {
                { 
                    "required", 
                    new ValidationRuleMapping 
                    { 
                        Type = "required", 
                        UViewRule = "{ required: true, message: '{message}', trigger: 'blur' }" 
                    } 
                },
                { 
                    "minLength", 
                    new ValidationRuleMapping 
                    { 
                        Type = "minLength", 
                        UViewRule = "{ min: {value}, message: '{message}', trigger: 'blur' }" 
                    } 
                },
                { 
                    "maxLength", 
                    new ValidationRuleMapping 
                    { 
                        Type = "maxLength", 
                        UViewRule = "{ max: {value}, message: '{message}', trigger: 'blur' }" 
                    } 
                },
                { 
                    "pattern", 
                    new ValidationRuleMapping 
                    { 
                        Type = "pattern", 
                        UViewRule = "{ pattern: {value}, message: '{message}', trigger: 'blur' }" 
                    } 
                },
                { 
                    "email", 
                    new ValidationRuleMapping 
                    { 
                        Type = "pattern", 
                        UViewRule = "{ pattern: /^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$/, message: '{message}', trigger: 'blur' }" 
                    } 
                },
                { 
                    "phone", 
                    new ValidationRuleMapping 
                    { 
                        Type = "pattern", 
                        UViewRule = "{ pattern: /^1[3-9]\\d{9}$/, message: '{message}', trigger: 'blur' }" 
                    } 
                }
            }
        };
    }

    /// <summary>
    /// 获取默认Wot Design配置
    /// </summary>
    public static ComponentLibraryConfig GetDefaultWotDesignConfig()
    {
        return new ComponentLibraryConfig
        {
            Type = ComponentLibraryType.WotDesign,
            Version = "1.0.0",
            EnableDarkMode = true,
            FieldTypeMapping = new Dictionary<string, string>
            {
                { "string", "wd-input" },
                { "int", "wd-input-number" },
                { "long", "wd-input-number" },
                { "decimal", "wd-input-number" },
                { "double", "wd-input-number" },
                { "DateTime", "wd-datetime-picker" },
                { "bool", "wd-switch" },
                { "enum", "wd-select" },
                { "Guid", "wd-input" },
                { "file", "wd-upload" },
                { "image", "wd-upload" },
                { "richtext", "wd-editor" },
                { "color", "wd-color-picker" },
                { "rate", "wd-rate" },
                { "slider", "wd-slider" }
            },
            ValidationMapping = new Dictionary<string, ValidationRuleMapping>
            {
                { 
                    "required", 
                    new ValidationRuleMapping 
                    { 
                        Type = "required", 
                        WotDesignRule = "{ required: true, message: '{message}' }" 
                    } 
                }
            }
        };
    }
}

/// <summary>
/// 组件库类型
/// </summary>
public enum ComponentLibraryType
{
    /// <summary>
    /// uView UI 2.0 (推荐，70+组件，全面兼容nvue)
    /// </summary>
    UView = 0,

    /// <summary>
    /// Wot Design Uni (Vue3 + TypeScript，暗黑模式)
    /// </summary>
    WotDesign = 1,

    /// <summary>
    /// uni-ui (官方组件库)
    /// </summary>
    UniUI = 2,

    /// <summary>
    /// 自定义组件库
    /// </summary>
    Custom = 99
}

/// <summary>
/// 验证规则映射
/// </summary>
public class ValidationRuleMapping
{
    /// <summary>
    /// 验证类型
    /// </summary>
    public string Type { get; set; } = string.Empty;

    /// <summary>
    /// uView验证规则
    /// </summary>
    public string? UViewRule { get; set; }

    /// <summary>
    /// Wot Design验证规则
    /// </summary>
    public string? WotDesignRule { get; set; }

    /// <summary>
    /// 自定义验证函数
    /// </summary>
    public string? CustomValidator { get; set; }
}

/// <summary>
/// 主题配置
/// </summary>
public class ThemeConfig
{
    /// <summary>
    /// 主色调
    /// </summary>
    public string PrimaryColor { get; set; } = "#2979ff";

    /// <summary>
    /// 成功色
    /// </summary>
    public string SuccessColor { get; set; } = "#19be6b";

    /// <summary>
    /// 警告色
    /// </summary>
    public string WarningColor { get; set; } = "#ff9900";

    /// <summary>
    /// 错误色
    /// </summary>
    public string ErrorColor { get; set; } = "#fa3534";

    /// <summary>
    /// 信息色
    /// </summary>
    public string InfoColor { get; set; } = "#909399";

    /// <summary>
    /// 自定义CSS变量
    /// </summary>
    public Dictionary<string, string> CustomVariables { get; set; } = new();
}

