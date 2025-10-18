using System;
using System.Collections.Generic;
using System.Text;

namespace SmartAbp.DevKit.Core.Helpers;

/// <summary>
/// 验证规则生成工具类
/// 生成C#验证特性、TypeScript验证规则、Vue表单验证等
/// </summary>
public static class ValidationHelper
{
    /// <summary>
    /// 生成C#验证特性
    /// 示例: GenerateCSharpValidation("Name", "string", true, 100) → "[Required][StringLength(100)]"
    /// </summary>
    public static string GenerateCSharpValidation(
        string propertyName,
        string propertyType,
        bool isRequired = false,
        int? maxLength = null,
        int? minLength = null,
        object? min = null,
        object? max = null,
        string? regexPattern = null)
    {
        var attributes = new List<string>();

        // Required特性
        if (isRequired)
        {
            attributes.Add("[Required]");
        }

        // StringLength特性
        if (TypeMapper.IsStringType(propertyType))
        {
            if (maxLength.HasValue)
            {
                if (minLength.HasValue && minLength.Value > 0)
                {
                    attributes.Add($"[StringLength({maxLength.Value}, MinimumLength = {minLength.Value})]");
                }
                else
                {
                    attributes.Add($"[StringLength({maxLength.Value})]");
                }
            }
        }

        // Range特性（数值类型）
        if (TypeMapper.IsNumericType(propertyType))
        {
            if (min != null && max != null)
            {
                attributes.Add($"[Range({min}, {max})]");
            }
            else if (min != null)
            {
                attributes.Add($"[Range({min}, {GetMaxValueForType(propertyType)})]");
            }
            else if (max != null)
            {
                attributes.Add($"[Range({GetMinValueForType(propertyType)}, {max})]");
            }
        }

        // RegularExpression特性
        if (!string.IsNullOrWhiteSpace(regexPattern))
        {
            attributes.Add($"[RegularExpression(@\"{regexPattern}\")]");
        }

        // EmailAddress特性（如果属性名包含Email）
        if (propertyName.Contains("Email", StringComparison.OrdinalIgnoreCase) &&
            TypeMapper.IsStringType(propertyType))
        {
            attributes.Add("[EmailAddress]");
        }

        // Url特性（如果属性名包含Url）
        if (propertyName.Contains("Url", StringComparison.OrdinalIgnoreCase) &&
            TypeMapper.IsStringType(propertyType))
        {
            attributes.Add("[Url]");
        }

        // Phone特性（如果属性名包含Phone）
        if (propertyName.Contains("Phone", StringComparison.OrdinalIgnoreCase) &&
            TypeMapper.IsStringType(propertyType))
        {
            attributes.Add("[Phone]");
        }

        return string.Join(" ", attributes);
    }

    /// <summary>
    /// 生成TypeScript验证规则
    /// 示例: GenerateTypeScriptValidation("name", "string", true, 100)
    /// </summary>
    public static string GenerateTypeScriptValidation(
        string propertyName,
        string propertyType,
        bool isRequired = false,
        int? maxLength = null,
        int? minLength = null,
        object? min = null,
        object? max = null,
        string? pattern = null)
    {
        var rules = new List<string>();

        if (isRequired)
        {
            rules.Add("{ required: true, message: '此字段为必填项', trigger: 'blur' }");
        }

        if (propertyType == "string")
        {
            if (maxLength.HasValue && minLength.HasValue)
            {
                rules.Add($"{{ min: {minLength.Value}, max: {maxLength.Value}, message: '长度在 {minLength.Value} 到 {maxLength.Value} 个字符', trigger: 'blur' }}");
            }
            else if (maxLength.HasValue)
            {
                rules.Add($"{{ max: {maxLength.Value}, message: '最多 {maxLength.Value} 个字符', trigger: 'blur' }}");
            }
            else if (minLength.HasValue)
            {
                rules.Add($"{{ min: {minLength.Value}, message: '至少 {minLength.Value} 个字符', trigger: 'blur' }}");
            }
        }

        if (propertyType == "number" && (min != null || max != null))
        {
            var minVal = min ?? int.MinValue;
            var maxVal = max ?? int.MaxValue;
            rules.Add($"{{ type: 'number', min: {minVal}, max: {maxVal}, message: '值应在 {minVal} 到 {maxVal} 之间', trigger: 'blur' }}");
        }

        if (!string.IsNullOrWhiteSpace(pattern))
        {
            rules.Add($"{{ pattern: /{pattern}/, message: '格式不正确', trigger: 'blur' }}");
        }

        // Email验证
        if (propertyName.Contains("email", StringComparison.OrdinalIgnoreCase))
        {
            rules.Add("{ type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }");
        }

        // URL验证
        if (propertyName.Contains("url", StringComparison.OrdinalIgnoreCase))
        {
            rules.Add("{ type: 'url', message: '请输入有效的URL', trigger: 'blur' }");
        }

        if (rules.Count == 0)
            return "[]";

        return $"[\n  {string.Join(",\n  ", rules)}\n]";
    }

    /// <summary>
    /// 生成Vue form-create验证规则
    /// </summary>
    public static Dictionary<string, object> GenerateFormCreateValidation(
        string propertyName,
        string propertyType,
        bool isRequired = false,
        int? maxLength = null,
        int? minLength = null,
        object? min = null,
        object? max = null)
    {
        var validate = new List<Dictionary<string, object>>();

        if (isRequired)
        {
            validate.Add(new Dictionary<string, object>
            {
                { "required", true },
                { "message", "此字段为必填项" },
                { "trigger", "blur" }
            });
        }

        if (propertyType == "string" && maxLength.HasValue)
        {
            validate.Add(new Dictionary<string, object>
            {
                { "max", maxLength.Value },
                { "message", $"最多{maxLength.Value}个字符" },
                { "trigger", "blur" }
            });
        }

        if (propertyType == "number" && (min != null || max != null))
        {
            var rule = new Dictionary<string, object>
            {
                { "type", "number" },
                { "trigger", "blur" }
            };

            if (min != null)
            {
                rule["min"] = min;
                rule["message"] = $"值不能小于{min}";
            }

            if (max != null)
            {
                rule["max"] = max;
                rule["message"] = $"值不能大于{max}";
            }

            validate.Add(rule);
        }

        return new Dictionary<string, object>
        {
            { "validate", validate }
        };
    }

    /// <summary>
    /// 生成SQL CHECK约束
    /// </summary>
    public static string GenerateSQLCheckConstraint(
        string tableName,
        string columnName,
        string dataType,
        object? min = null,
        object? max = null,
        int? maxLength = null)
    {
        var constraints = new List<string>();

        // 数值范围约束
        if (min != null && max != null)
        {
            constraints.Add($"ALTER TABLE [{tableName}] ADD CONSTRAINT CK_{tableName}_{columnName}_Range CHECK ([{columnName}] >= {min} AND [{columnName}] <= {max})");
        }

        // 字符串长度约束
        if (maxLength.HasValue && (dataType.StartsWith("NVARCHAR") || dataType.StartsWith("VARCHAR")))
        {
            constraints.Add($"ALTER TABLE [{tableName}] ADD CONSTRAINT CK_{tableName}_{columnName}_Length CHECK (LEN([{columnName}]) <= {maxLength.Value})");
        }

        return string.Join(";\n", constraints);
    }

    /// <summary>
    /// 生成常用正则表达式
    /// </summary>
    public static class CommonPatterns
    {
        public const string Email = @"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$";
        public const string Phone = @"^1[3-9]\d{9}$"; // 中国手机号
        public const string Url = @"^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$";
        public const string ZipCode = @"^\d{6}$"; // 中国邮政编码
        public const string IdCard = @"^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$"; // 身份证号
        public const string IPAddress = @"^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$";
        public const string Alphanumeric = @"^[a-zA-Z0-9]+$";
        public const string AlphanumericWithUnderscore = @"^[a-zA-Z0-9_]+$";
        public const string ChineseCharacters = @"^[\u4e00-\u9fa5]+$";
        public const string Username = @"^[a-zA-Z0-9_]{4,16}$"; // 4-16位字母、数字、下划线
        public const string StrongPassword = @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"; // 至少8位,包含大小写字母、数字、特殊字符
    }

    // 辅助方法
    private static string GetMaxValueForType(string type)
    {
        return type switch
        {
            "int" or "Int32" => int.MaxValue.ToString(),
            "long" or "Int64" => long.MaxValue.ToString(),
            "decimal" or "Decimal" => decimal.MaxValue.ToString(),
            "double" or "Double" => double.MaxValue.ToString(),
            _ => "0"
        };
    }

    private static string GetMinValueForType(string type)
    {
        return type switch
        {
            "int" or "Int32" => int.MinValue.ToString(),
            "long" or "Int64" => long.MinValue.ToString(),
            "decimal" or "Decimal" => decimal.MinValue.ToString(),
            "double" or "Double" => double.MinValue.ToString(),
            _ => "0"
        };
    }
}

