namespace SmartAbp.CodeGenerator.Core.Templates;

/// <summary>
/// 务实模板系统配置
/// 支持多环境部署的模板路径配置
/// </summary>
public class TemplateConfiguration
{
    /// <summary>
    /// 模板根路径 - 优先级最高
    /// 生产环境可配置为绝对路径，如 "/app/templates"
    /// </summary>
    public string? TemplateRootPath { get; set; }

    /// <summary>
    /// 备用模板路径
    /// 用于容器化环境，默认为 "./embedded-templates"
    /// </summary>
    public string FallbackTemplatePath { get; set; } = "./embedded-templates";

    /// <summary>
    /// 是否启用内嵌模板资源
    /// 容器化环境的兜底方案
    /// </summary>
    public bool EnableEmbeddedTemplates { get; set; } = true;

    /// <summary>
    /// 是否启用模板验证
    /// 开发环境建议开启，生产环境可关闭以提高性能
    /// </summary>
    public bool EnableTemplateValidation { get; set; } = true;

    /// <summary>
    /// 模板缓存时间（分钟）
    /// 0 表示不缓存，适合开发环境
    /// </summary>
    public int TemplateCacheMinutes { get; set; } = 30;

    /// <summary>
    /// 是否启用模板热重载
    /// 仅在开发环境建议开启
    /// </summary>
    public bool EnableTemplateHotReload { get; set; } = false;

    /// <summary>
    /// 最大模板文件大小（KB）
    /// 防止过大的模板文件影响性能
    /// </summary>
    public int MaxTemplateFileSizeKB { get; set; } = 1024; // 1MB

    /// <summary>
    /// 模板文件编码
    /// 默认为 UTF-8
    /// </summary>
    public string TemplateEncoding { get; set; } = "UTF-8";

    /// <summary>
    /// 获取配置摘要
    /// </summary>
    public string GetConfigurationSummary()
    {
        var lines = new List<string>
        {
            "📋 务实模板系统配置摘要:",
            $"   模板根路径: {TemplateRootPath ?? "未配置"}",
            $"   备用路径: {FallbackTemplatePath}",
            $"   内嵌模板: {(EnableEmbeddedTemplates ? "✅启用" : "❌禁用")}",
            $"   模板验证: {(EnableTemplateValidation ? "✅启用" : "❌禁用")}",
            $"   缓存时间: {TemplateCacheMinutes}分钟",
            $"   热重载: {(EnableTemplateHotReload ? "✅启用" : "❌禁用")}",
            $"   文件大小限制: {MaxTemplateFileSizeKB}KB",
            $"   文件编码: {TemplateEncoding}"
        };

        return string.Join("\n", lines);
    }

    /// <summary>
    /// 验证配置合理性
    /// </summary>
    public TemplateConfigurationValidationResult ValidateConfiguration()
    {
        var result = new TemplateConfigurationValidationResult();
        var issues = new List<string>();

        // 验证缓存时间
        if (TemplateCacheMinutes < 0)
        {
            issues.Add("模板缓存时间不能为负数");
        }

        // 验证文件大小限制
        if (MaxTemplateFileSizeKB <= 0)
        {
            issues.Add("模板文件大小限制必须大于0");
        }

        // 验证编码
        if (string.IsNullOrEmpty(TemplateEncoding))
        {
            issues.Add("模板文件编码不能为空");
        }

        // 开发环境建议
        var suggestions = new List<string>();
        if (TemplateCacheMinutes > 0 && EnableTemplateHotReload)
        {
            suggestions.Add("开发环境建议将缓存时间设为0或禁用热重载");
        }

        if (!EnableTemplateValidation)
        {
            suggestions.Add("生产环境可以考虑禁用模板验证以提高性能");
        }

        result.IsValid = issues.Count == 0;
        result.Issues = issues;
        result.Suggestions = suggestions;

        return result;
    }
}

/// <summary>
/// 模板配置验证结果
/// </summary>
public class TemplateConfigurationValidationResult
{
    public bool IsValid { get; set; }
    public List<string> Issues { get; set; } = new();
    public List<string> Suggestions { get; set; } = new();

    public string GetValidationSummary()
    {
        var lines = new List<string>();

        lines.Add($"配置验证结果: {(IsValid ? "✅ 有效" : "❌ 无效")}");

        if (Issues.Any())
        {
            lines.Add("\n❌ 配置问题:");
            Issues.ForEach(issue => lines.Add($"   - {issue}"));
        }

        if (Suggestions.Any())
        {
            lines.Add("\n💡 优化建议:");
            Suggestions.ForEach(suggestion => lines.Add($"   - {suggestion}"));
        }

        return string.Join("\n", lines);
    }
}
