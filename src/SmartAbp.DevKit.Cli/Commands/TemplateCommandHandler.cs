using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace SmartAbp.DevKit.Cli.Commands;

/// <summary>
/// 模板管理命令处理器
/// 支持list/add/remove/update模板操作
/// </summary>
public class TemplateCommandHandler : ICommandHandler
{
    private readonly ILogger<TemplateCommandHandler> _logger;
    private readonly string _action;
    private readonly string? _templateName;
    private readonly string? _templatePath;

    private const string TemplateDirectory = "./Templates";

    public TemplateCommandHandler(
        ILogger<TemplateCommandHandler> logger,
        string action,
        string? templateName = null,
        string? templatePath = null)
    {
        _logger = logger;
        _action = action;
        _templateName = templateName;
        _templatePath = templatePath;
    }

    public async Task<int> ExecuteAsync()
    {
        try
        {
            _logger.LogInformation("🎨 DevKit模板管理");

            return _action.ToLower() switch
            {
                "list" => await ListTemplatesAsync(),
                "add" => await AddTemplateAsync(),
                "remove" => await RemoveTemplateAsync(),
                "show" => await ShowTemplateAsync(),
                "validate" => await ValidateTemplateAsync(),
                _ => InvalidAction()
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"❌ 模板管理失败: {ex.Message}");
            return 1;
        }
    }

    /// <summary>
    /// 列出所有模板
    /// </summary>
    private async Task<int> ListTemplatesAsync()
    {
        _logger.LogInformation("📋 可用模板列表:\n");

        if (!Directory.Exists(TemplateDirectory))
        {
            _logger.LogWarning($"⚠️ 模板目录不存在: {TemplateDirectory}");
            return 1;
        }

        var templates = Directory.GetFiles(TemplateDirectory, "*.hbs", SearchOption.AllDirectories);

        if (templates.Length == 0)
        {
            _logger.LogInformation("  (暂无模板)");
            return 0;
        }

        var grouped = templates
            .GroupBy(t => Path.GetDirectoryName(t))
            .OrderBy(g => g.Key);

        foreach (var group in grouped)
        {
            var category = Path.GetRelativePath(TemplateDirectory, group.Key ?? TemplateDirectory);
            _logger.LogInformation($"\n📁 {category}/");

            foreach (var template in group.OrderBy(t => t))
            {
                var name = Path.GetFileName(template);
                var size = new FileInfo(template).Length;
                var lastModified = File.GetLastWriteTime(template);

                _logger.LogInformation($"  - {name}");
                _logger.LogInformation($"    大小: {size} bytes, 修改: {lastModified:yyyy-MM-dd HH:mm}");
            }
        }

        _logger.LogInformation($"\n总计: {templates.Length} 个模板");

        return 0;
    }

    /// <summary>
    /// 添加模板
    /// </summary>
    private async Task<int> AddTemplateAsync()
    {
        if (string.IsNullOrEmpty(_templateName) || string.IsNullOrEmpty(_templatePath))
        {
            _logger.LogError("❌ 缺少参数: --name 和 --path 是必需的");
            _logger.LogInformation("用法: devkit template add --name Entity.hbs --path ./my-template.hbs");
            return 1;
        }

        if (!File.Exists(_templatePath))
        {
            _logger.LogError($"❌ 模板文件不存在: {_templatePath}");
            return 1;
        }

        var targetPath = Path.Combine(TemplateDirectory, _templateName);
        var targetDir = Path.GetDirectoryName(targetPath);

        if (!string.IsNullOrEmpty(targetDir) && !Directory.Exists(targetDir))
        {
            Directory.CreateDirectory(targetDir);
            _logger.LogInformation($"📁 创建目录: {targetDir}");
        }

        if (File.Exists(targetPath))
        {
            _logger.LogWarning($"⚠️ 模板已存在: {targetPath}");
            _logger.LogInformation("提示: 使用 --force 参数覆盖现有模板");
            return 1;
        }

        // 复制模板文件
        File.Copy(_templatePath, targetPath);

        _logger.LogInformation($"✅ 模板已添加: {targetPath}");

        // 验证模板
        var content = await File.ReadAllTextAsync(targetPath);
        _logger.LogInformation($"📄 模板大小: {content.Length} 字符");

        return 0;
    }

    /// <summary>
    /// 删除模板
    /// </summary>
    private async Task<int> RemoveTemplateAsync()
    {
        if (string.IsNullOrEmpty(_templateName))
        {
            _logger.LogError("❌ 缺少参数: --name 是必需的");
            _logger.LogInformation("用法: devkit template remove --name Entity.hbs");
            return 1;
        }

        var targetPath = Path.Combine(TemplateDirectory, _templateName);

        if (!File.Exists(targetPath))
        {
            _logger.LogError($"❌ 模板不存在: {targetPath}");
            return 1;
        }

        // 删除文件
        File.Delete(targetPath);

        _logger.LogInformation($"✅ 模板已删除: {targetPath}");

        return 0;
    }

    /// <summary>
    /// 显示模板内容
    /// </summary>
    private async Task<int> ShowTemplateAsync()
    {
        if (string.IsNullOrEmpty(_templateName))
        {
            _logger.LogError("❌ 缺少参数: --name 是必需的");
            return 1;
        }

        var targetPath = Path.Combine(TemplateDirectory, _templateName);

        if (!File.Exists(targetPath))
        {
            _logger.LogError($"❌ 模板不存在: {targetPath}");
            return 1;
        }

        var content = await File.ReadAllTextAsync(targetPath);

        _logger.LogInformation($"\n📄 模板: {_templateName}");
        _logger.LogInformation($"路径: {Path.GetFullPath(targetPath)}");
        _logger.LogInformation($"大小: {content.Length} 字符\n");
        _logger.LogInformation("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        Console.WriteLine(content);
        _logger.LogInformation("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        return 0;
    }

    /// <summary>
    /// 验证模板语法
    /// </summary>
    private async Task<int> ValidateTemplateAsync()
    {
        if (string.IsNullOrEmpty(_templateName))
        {
            _logger.LogError("❌ 缺少参数: --name 是必需的");
            return 1;
        }

        var targetPath = Path.Combine(TemplateDirectory, _templateName);

        if (!File.Exists(targetPath))
        {
            _logger.LogError($"❌ 模板不存在: {targetPath}");
            return 1;
        }

        _logger.LogInformation($"🔍 验证模板: {_templateName}");

        var content = await File.ReadAllTextAsync(targetPath);

        // 基础语法检查
        var errors = new List<string>();

        // 检查Handlebars语法
        var openBraces = content.Count(c => c == '{');
        var closeBraces = content.Count(c => c == '}');

        if (openBraces != closeBraces)
        {
            errors.Add($"花括号不匹配: {{ = {openBraces}, }} = {closeBraces}");
        }

        // 检查常见的Handlebars表达式
        if (content.Contains("{{#each"))
        {
            var eachCount = System.Text.RegularExpressions.Regex.Matches(content, @"\{\{#each").Count;
            var endEachCount = System.Text.RegularExpressions.Regex.Matches(content, @"\{\{/each\}\}").Count;

            if (eachCount != endEachCount)
            {
                errors.Add($"#each 块不匹配: 开始 = {eachCount}, 结束 = {endEachCount}");
            }
        }

        if (errors.Count > 0)
        {
            _logger.LogError("❌ 模板验证失败:");
            foreach (var error in errors)
            {
                _logger.LogError($"  - {error}");
            }
            return 1;
        }

        _logger.LogInformation("✅ 模板验证通过");
        _logger.LogInformation($"  - 文件大小: {content.Length} 字符");
        _logger.LogInformation($"  - 行数: {content.Split('\n').Length}");

        return 0;
    }

    private int InvalidAction()
    {
        _logger.LogError($"❌ 无效的操作: {_action}");
        _logger.LogInformation("可用操作: list, add, remove, show, validate");
        _logger.LogInformation("\n用法示例:");
        _logger.LogInformation("  devkit template list");
        _logger.LogInformation("  devkit template add --name Entity.hbs --path ./my-template.hbs");
        _logger.LogInformation("  devkit template remove --name Entity.hbs");
        _logger.LogInformation("  devkit template show --name Entity.hbs");
        _logger.LogInformation("  devkit template validate --name Entity.hbs");
        return 1;
    }
}

