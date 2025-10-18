using System;
using System.Collections.Generic;

namespace SmartAbp.DevKit.Core.Helpers;

/// <summary>
/// 类型映射工具类
/// 提供C#、TypeScript、SQL、Vue等类型之间的转换
/// </summary>
public static class TypeMapper
{
    // C# → TypeScript 类型映射
    private static readonly Dictionary<string, string> CSharpToTypeScriptMap = new()
    {
        { "string", "string" },
        { "String", "string" },
        { "int", "number" },
        { "Int32", "number" },
        { "long", "number" },
        { "Int64", "number" },
        { "decimal", "number" },
        { "Decimal", "number" },
        { "double", "number" },
        { "Double", "number" },
        { "float", "number" },
        { "Single", "number" },
        { "bool", "boolean" },
        { "Boolean", "boolean" },
        { "DateTime", "string" }, // ISO 8601格式
        { "DateTimeOffset", "string" },
        { "Guid", "string" },
        { "byte[]", "string" }, // Base64
        { "object", "any" },
        { "Object", "any" }
    };

    // C# → SQL 类型映射
    private static readonly Dictionary<string, string> CSharpToSQLMap = new()
    {
        { "string", "NVARCHAR(MAX)" },
        { "String", "NVARCHAR(MAX)" },
        { "int", "INT" },
        { "Int32", "INT" },
        { "long", "BIGINT" },
        { "Int64", "BIGINT" },
        { "decimal", "DECIMAL(18,2)" },
        { "Decimal", "DECIMAL(18,2)" },
        { "double", "FLOAT" },
        { "Double", "FLOAT" },
        { "float", "REAL" },
        { "Single", "REAL" },
        { "bool", "BIT" },
        { "Boolean", "BIT" },
        { "DateTime", "DATETIME2" },
        { "DateTimeOffset", "DATETIMEOFFSET" },
        { "Guid", "UNIQUEIDENTIFIER" },
        { "byte[]", "VARBINARY(MAX)" }
    };

    // TypeScript → Vue Prop Type 映射
    private static readonly Dictionary<string, string> TypeScriptToVueMap = new()
    {
        { "string", "String" },
        { "number", "Number" },
        { "boolean", "Boolean" },
        { "any", "Object" },
        { "object", "Object" },
        { "Array", "Array" },
        { "Function", "Function" },
        { "Date", "Date" }
    };

    /// <summary>
    /// C# 类型 → TypeScript 类型
    /// 示例: "string" → "string", "int" → "number"
    /// </summary>
    public static string CSharpToTypeScript(string csharpType)
    {
        if (string.IsNullOrWhiteSpace(csharpType))
            return "any";

        // 处理可空类型 (int? → number | null)
        if (csharpType.EndsWith("?"))
        {
            var baseType = csharpType.TrimEnd('?');
            var tsType = CSharpToTypeScript(baseType);
            return $"{tsType} | null";
        }

        // 处理数组类型 (string[] → string[])
        if (csharpType.EndsWith("[]"))
        {
            var baseType = csharpType.Substring(0, csharpType.Length - 2);
            var tsType = CSharpToTypeScript(baseType);
            return $"{tsType}[]";
        }

        // 处理泛型类型 (List<string> → string[])
        if (csharpType.StartsWith("List<") || csharpType.StartsWith("IEnumerable<"))
        {
            var match = System.Text.RegularExpressions.Regex.Match(csharpType, @"<(.+)>");
            if (match.Success)
            {
                var itemType = match.Groups[1].Value;
                var tsType = CSharpToTypeScript(itemType);
                return $"{tsType}[]";
            }
        }

        // 查找映射表
        if (CSharpToTypeScriptMap.TryGetValue(csharpType, out var mappedType))
        {
            return mappedType;
        }

        // 默认保持原样（可能是自定义类型）
        return csharpType;
    }

    /// <summary>
    /// C# 类型 → SQL 类型
    /// 示例: "string" → "NVARCHAR(MAX)", "int" → "INT"
    /// </summary>
    public static string CSharpToSQL(string csharpType, int? maxLength = null)
    {
        if (string.IsNullOrWhiteSpace(csharpType))
            return "NVARCHAR(MAX)";

        // 处理可空类型
        var baseType = csharpType.TrimEnd('?');

        // 查找映射表
        if (CSharpToSQLMap.TryGetValue(baseType, out var mappedType))
        {
            // 如果是字符串且指定了长度
            if (baseType == "string" || baseType == "String")
            {
                if (maxLength.HasValue && maxLength.Value > 0)
                {
                    return $"NVARCHAR({maxLength.Value})";
                }
            }

            return mappedType;
        }

        return "NVARCHAR(MAX)";
    }

    /// <summary>
    /// TypeScript 类型 → Vue Prop Type
    /// 示例: "string" → "String", "number" → "Number"
    /// </summary>
    public static string TypeScriptToVue(string tsType)
    {
        if (string.IsNullOrWhiteSpace(tsType))
            return "Object";

        // 移除 null/undefined 联合类型
        tsType = tsType.Replace(" | null", "").Replace(" | undefined", "").Trim();

        // 处理数组类型
        if (tsType.EndsWith("[]"))
        {
            return "Array";
        }

        // 查找映射表
        if (TypeScriptToVueMap.TryGetValue(tsType, out var mappedType))
        {
            return mappedType;
        }

        return "Object";
    }

    /// <summary>
    /// 获取C#类型的默认值
    /// 示例: "string" → "\"\"", "int" → "0"
    /// </summary>
    public static string GetCSharpDefaultValue(string csharpType)
    {
        if (string.IsNullOrWhiteSpace(csharpType))
            return "null";

        // 可空类型默认值为null
        if (csharpType.EndsWith("?"))
            return "null";

        var defaultValues = new Dictionary<string, string>
        {
            { "string", "string.Empty" },
            { "String", "string.Empty" },
            { "int", "0" },
            { "Int32", "0" },
            { "long", "0L" },
            { "Int64", "0L" },
            { "decimal", "0M" },
            { "Decimal", "0M" },
            { "double", "0.0" },
            { "Double", "0.0" },
            { "float", "0.0f" },
            { "Single", "0.0f" },
            { "bool", "false" },
            { "Boolean", "false" },
            { "DateTime", "DateTime.MinValue" },
            { "DateTimeOffset", "DateTimeOffset.MinValue" },
            { "Guid", "Guid.Empty" }
        };

        if (defaultValues.TryGetValue(csharpType, out var defaultValue))
        {
            return defaultValue;
        }

        // 数组类型
        if (csharpType.EndsWith("[]"))
            return "Array.Empty<>()";

        // 泛型集合
        if (csharpType.StartsWith("List<"))
            return $"new {csharpType}()";

        // 引用类型默认为null
        return "null";
    }

    /// <summary>
    /// 获取TypeScript类型的默认值
    /// 示例: "string" → "''", "number" → "0"
    /// </summary>
    public static string GetTypeScriptDefaultValue(string tsType)
    {
        if (string.IsNullOrWhiteSpace(tsType))
            return "null";

        // 移除 null/undefined 联合类型
        tsType = tsType.Replace(" | null", "").Replace(" | undefined", "").Trim();

        var defaultValues = new Dictionary<string, string>
        {
            { "string", "''" },
            { "number", "0" },
            { "boolean", "false" },
            { "any", "null" },
            { "object", "null" }
        };

        if (defaultValues.TryGetValue(tsType, out var defaultValue))
        {
            return defaultValue;
        }

        // 数组类型
        if (tsType.EndsWith("[]"))
            return "[]";

        return "null";
    }

    /// <summary>
    /// 判断是否为值类型
    /// </summary>
    public static bool IsValueType(string csharpType)
    {
        if (string.IsNullOrWhiteSpace(csharpType))
            return false;

        // 可空值类型
        if (csharpType.EndsWith("?"))
            return false;

        var valueTypes = new HashSet<string>
        {
            "int", "Int32", "long", "Int64", "short", "Int16",
            "byte", "Byte", "sbyte", "SByte",
            "uint", "UInt32", "ulong", "UInt64", "ushort", "UInt16",
            "decimal", "Decimal", "double", "Double", "float", "Single",
            "bool", "Boolean", "char", "Char",
            "DateTime", "DateTimeOffset", "TimeSpan", "Guid"
        };

        return valueTypes.Contains(csharpType);
    }

    /// <summary>
    /// 判断是否为数值类型
    /// </summary>
    public static bool IsNumericType(string csharpType)
    {
        if (string.IsNullOrWhiteSpace(csharpType))
            return false;

        var baseType = csharpType.TrimEnd('?');

        var numericTypes = new HashSet<string>
        {
            "int", "Int32", "long", "Int64", "short", "Int16",
            "byte", "Byte", "sbyte", "SByte",
            "uint", "UInt32", "ulong", "UInt64", "ushort", "UInt16",
            "decimal", "Decimal", "double", "Double", "float", "Single"
        };

        return numericTypes.Contains(baseType);
    }

    /// <summary>
    /// 判断是否为字符串类型
    /// </summary>
    public static bool IsStringType(string csharpType)
    {
        return csharpType == "string" || csharpType == "String";
    }

    /// <summary>
    /// 判断是否为布尔类型
    /// </summary>
    public static bool IsBooleanType(string csharpType)
    {
        var baseType = csharpType?.TrimEnd('?');
        return baseType == "bool" || baseType == "Boolean";
    }

    /// <summary>
    /// 判断是否为日期时间类型
    /// </summary>
    public static bool IsDateTimeType(string csharpType)
    {
        var baseType = csharpType?.TrimEnd('?');
        return baseType == "DateTime" || baseType == "DateTimeOffset";
    }
}

