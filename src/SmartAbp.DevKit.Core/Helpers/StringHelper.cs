using System;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;

namespace SmartAbp.DevKit.Core.Helpers;

/// <summary>
/// 字符串转换工具类
/// 提供各种命名风格转换功能
/// </summary>
public static class StringHelper
{
    /// <summary>
    /// 转换为PascalCase（大驼峰）
    /// 示例: "user_name" → "UserName"
    /// </summary>
    public static string ToPascalCase(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return input;

        // 处理多种分隔符：下划线、连字符、空格
        var words = Regex.Split(input, @"[\s_-]+")
            .Where(w => !string.IsNullOrEmpty(w))
            .Select(w => char.ToUpper(w[0]) + w.Substring(1).ToLower());

        return string.Join("", words);
    }

    /// <summary>
    /// 转换为camelCase（小驼峰）
    /// 示例: "UserName" → "userName"
    /// </summary>
    public static string ToCamelCase(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return input;

        var pascalCase = ToPascalCase(input);
        return char.ToLower(pascalCase[0]) + pascalCase.Substring(1);
    }

    /// <summary>
    /// 转换为snake_case（蛇形命名）
    /// 示例: "UserName" → "user_name"
    /// </summary>
    public static string ToSnakeCase(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return input;

        // 在大写字母前插入下划线
        var result = Regex.Replace(input, @"([a-z0-9])([A-Z])", "$1_$2");
        return result.ToLower();
    }

    /// <summary>
    /// 转换为kebab-case（短横线命名）
    /// 示例: "UserName" → "user-name"
    /// </summary>
    public static string ToKebabCase(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return input;

        var snakeCase = ToSnakeCase(input);
        return snakeCase.Replace('_', '-');
    }

    /// <summary>
    /// 转换为SCREAMING_SNAKE_CASE（常量命名）
    /// 示例: "userName" → "USER_NAME"
    /// </summary>
    public static string ToScreamingSnakeCase(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return input;

        return ToSnakeCase(input).ToUpper();
    }

    /// <summary>
    /// 复数化（简单实现）
    /// 示例: "User" → "Users"
    /// </summary>
    public static string Pluralize(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return input;

        // 简单规则
        if (input.EndsWith("s", StringComparison.OrdinalIgnoreCase) ||
            input.EndsWith("x", StringComparison.OrdinalIgnoreCase) ||
            input.EndsWith("ch", StringComparison.OrdinalIgnoreCase) ||
            input.EndsWith("sh", StringComparison.OrdinalIgnoreCase))
        {
            return input + "es";
        }

        if (input.EndsWith("y", StringComparison.OrdinalIgnoreCase) &&
            input.Length > 1 &&
            !IsVowel(input[input.Length - 2]))
        {
            return input.Substring(0, input.Length - 1) + "ies";
        }

        return input + "s";
    }

    /// <summary>
    /// 单数化（简单实现）
    /// 示例: "Users" → "User"
    /// </summary>
    public static string Singularize(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return input;

        if (input.EndsWith("ies", StringComparison.OrdinalIgnoreCase) && input.Length > 3)
        {
            return input.Substring(0, input.Length - 3) + "y";
        }

        if (input.EndsWith("es", StringComparison.OrdinalIgnoreCase) && input.Length > 2)
        {
            return input.Substring(0, input.Length - 2);
        }

        if (input.EndsWith("s", StringComparison.OrdinalIgnoreCase) && input.Length > 1)
        {
            return input.Substring(0, input.Length - 1);
        }

        return input;
    }

    /// <summary>
    /// 首字母大写
    /// 示例: "hello" → "Hello"
    /// </summary>
    public static string Capitalize(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return input;

        return char.ToUpper(input[0]) + input.Substring(1);
    }

    /// <summary>
    /// 首字母小写
    /// 示例: "Hello" → "hello"
    /// </summary>
    public static string Uncapitalize(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return input;

        return char.ToLower(input[0]) + input.Substring(1);
    }

    /// <summary>
    /// 移除前缀
    /// 示例: RemovePrefix("IUserService", "I") → "UserService"
    /// </summary>
    public static string RemovePrefix(string input, string prefix)
    {
        if (string.IsNullOrWhiteSpace(input) || string.IsNullOrWhiteSpace(prefix))
            return input;

        if (input.StartsWith(prefix, StringComparison.Ordinal))
        {
            return input.Substring(prefix.Length);
        }

        return input;
    }

    /// <summary>
    /// 移除后缀
    /// 示例: RemoveSuffix("UserService", "Service") → "User"
    /// </summary>
    public static string RemoveSuffix(string input, string suffix)
    {
        if (string.IsNullOrWhiteSpace(input) || string.IsNullOrWhiteSpace(suffix))
            return input;

        if (input.EndsWith(suffix, StringComparison.Ordinal))
        {
            return input.Substring(0, input.Length - suffix.Length);
        }

        return input;
    }

    /// <summary>
    /// 添加前缀（如果不存在）
    /// 示例: EnsurePrefix("UserService", "I") → "IUserService"
    /// </summary>
    public static string EnsurePrefix(string input, string prefix)
    {
        if (string.IsNullOrWhiteSpace(input))
            return input;

        if (input.StartsWith(prefix, StringComparison.Ordinal))
            return input;

        return prefix + input;
    }

    /// <summary>
    /// 添加后缀（如果不存在）
    /// 示例: EnsureSuffix("User", "Dto") → "UserDto"
    /// </summary>
    public static string EnsureSuffix(string input, string suffix)
    {
        if (string.IsNullOrWhiteSpace(input))
            return input;

        if (input.EndsWith(suffix, StringComparison.Ordinal))
            return input;

        return input + suffix;
    }

    /// <summary>
    /// 截断字符串
    /// 示例: Truncate("HelloWorld", 5) → "Hello..."
    /// </summary>
    public static string Truncate(string input, int maxLength, string ellipsis = "...")
    {
        if (string.IsNullOrWhiteSpace(input) || input.Length <= maxLength)
            return input;

        return input.Substring(0, maxLength - ellipsis.Length) + ellipsis;
    }

    // 辅助方法
    private static bool IsVowel(char c)
    {
        return "aeiouAEIOU".Contains(c);
    }
}

