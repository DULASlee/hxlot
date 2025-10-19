using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using HandlebarsDotNet;
using Microsoft.Extensions.Logging;
using SmartAbp.DevKit.Core.Abstractions;

namespace SmartAbp.DevKit.Core.Templates;

/// <summary>
/// Handlebars模板引擎实现（基于Handlebars.Net）
/// </summary>
public class HandlebarsTemplateEngine : ITemplateEngine
{
    private readonly ILogger<HandlebarsTemplateEngine> _logger;
    private readonly IHandlebars _handlebars;
    private readonly ConcurrentDictionary<string, HandlebarsTemplate<object, object>> _compiledTemplateCache;
    private readonly ConcurrentDictionary<string, string> _partialCache;
    private readonly string _templateBasePath;

    public HandlebarsTemplateEngine(
        ILogger<HandlebarsTemplateEngine> logger,
        string? templateBasePath = null)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _templateBasePath = templateBasePath ?? "templates";
        _compiledTemplateCache = new ConcurrentDictionary<string, HandlebarsTemplate<object, object>>();
        _partialCache = new ConcurrentDictionary<string, string>();

        // 创建Handlebars实例
        _handlebars = HandlebarsDotNet.Handlebars.Create(new HandlebarsConfiguration
        {
            ThrowOnUnresolvedBindingExpression = false,  // 不抛出未解析绑定异常
            NoEscape = false  // 默认转义HTML
        });

        // 注册内置Helpers
        RegisterBuiltInHelpers();

        _logger.LogInformation(
            "HandlebarsTemplateEngine initialized. Template base path: {Path}",
            _templateBasePath);
    }

    /// <summary>
    /// 加载模板文件
    /// </summary>
    /// <param name="templatePath">模板路径（相对于templateBasePath）</param>
    /// <returns>模板对象</returns>
    public async Task<Template> LoadTemplateAsync(string templatePath)
    {
        try
        {
            // 构建完整路径
            var fullPath = Path.Combine(_templateBasePath, templatePath);

            if (!File.Exists(fullPath))
            {
                throw new FileNotFoundException($"Template not found: {fullPath}");
            }

            _logger.LogDebug("Loading template from: {Path}", fullPath);

            // 读取模板内容
            var content = await File.ReadAllTextAsync(fullPath);

            // 计算哈希值（用于缓存验证）
            var hash = ComputeHash(content);

            // 创建模板对象
            var template = new Template
            {
                Path = templatePath,
                Content = content,
                Hash = hash
            };

            _logger.LogDebug(
                "Template loaded successfully. Size: {Size} bytes",
                content.Length);

            return template;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to load template: {Path}", templatePath);
            throw;
        }
    }

    /// <summary>
    /// 编译模板（会缓存编译结果）
    /// </summary>
    /// <param name="templateContent">模板内容</param>
    /// <param name="templateName">模板名称（用于缓存键）</param>
    /// <returns>编译后的模板函数</returns>
    public HandlebarsTemplate<object, object> CompileTemplate(
        string templateContent,
        string? templateName = null)
    {
        try
        {
            // 如果提供了模板名称，检查缓存
            if (!string.IsNullOrEmpty(templateName))
            {
                if (_compiledTemplateCache.TryGetValue(templateName, out var cachedTemplate))
                {
                    _logger.LogDebug("Using cached compiled template: {Name}", templateName);
                    return cachedTemplate;
                }
            }

            _logger.LogDebug("Compiling template: {Name}", templateName ?? "anonymous");

            // 编译模板
            var compiledTemplate = _handlebars.Compile(templateContent);

            // 缓存编译结果
            if (!string.IsNullOrEmpty(templateName))
            {
                _compiledTemplateCache.TryAdd(templateName, compiledTemplate);
                _logger.LogDebug("Cached compiled template: {Name}", templateName);
            }

            return compiledTemplate;
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Failed to compile template: {Name}",
                templateName ?? "anonymous");
            throw;
        }
    }

    /// <summary>
    /// 渲染模板
    /// </summary>
    /// <param name="template">模板对象</param>
    /// <param name="data">数据对象</param>
    /// <returns>渲染后的内容</returns>
    public Task<string> RenderAsync(Template template, object data)
    {
        try
        {
            _logger.LogDebug("Rendering template with data type: {Type}", data.GetType().Name);

            // 编译并渲染（优先使用已编译的模板）
            HandlebarsTemplate<object, object> compiledTemplate;

            if (template.CompiledTemplate is HandlebarsTemplate<object, object> cached)
            {
                compiledTemplate = cached;
            }
            else
            {
                compiledTemplate = CompileTemplate(template.Content, template.Path);
                template.CompiledTemplate = compiledTemplate;
            }

            var result = compiledTemplate(data);

            _logger.LogDebug("Template rendered successfully. Output size: {Size} bytes", result.Length);

            return Task.FromResult(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to render template");
            throw;
        }
    }

    /// <summary>
    /// 注册Partial模板
    /// </summary>
    /// <param name="name">Partial名称</param>
    /// <param name="content">Partial内容</param>
    public void RegisterPartial(string name, string content)
    {
        try
        {
            _logger.LogDebug("Registering partial: {Name}", name);

            // 注册到Handlebars
            _handlebars.RegisterTemplate(name, content);

            // 缓存Partial内容
            _partialCache.TryAdd(name, content);

            _logger.LogDebug("Partial registered successfully: {Name}", name);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to register partial: {Name}", name);
            throw;
        }
    }

    /// <summary>
    /// 注册Helper函数
    /// </summary>
    /// <param name="name">Helper名称</param>
    /// <param name="helper">Helper委托</param>
    public void RegisterHelper(string name, Delegate helper)
    {
        try
        {
            _logger.LogDebug("Registering helper: {Name}", name);

            // 转换为HandlebarsHelper
            if (helper is HandlebarsHelper handlebarsHelper)
            {
                _handlebars.RegisterHelper(name, handlebarsHelper);
            }
            else if (helper is HandlebarsBlockHelper blockHelper)
            {
                _handlebars.RegisterHelper(name, blockHelper);
            }
            else if (helper is HandlebarsReturnHelper returnHelper)
            {
                _handlebars.RegisterHelper(name, returnHelper);
            }
            else
            {
                throw new ArgumentException($"Unsupported helper type: {helper.GetType().Name}", nameof(helper));
            }

            _logger.LogDebug("Helper registered successfully: {Name}", name);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to register helper: {Name}", name);
            throw;
        }
    }

    /// <summary>
    /// 批量加载和注册Partial模板
    /// </summary>
    /// <param name="partialDirectory">Partial目录路径</param>
    public async Task LoadPartialsAsync(string partialDirectory)
    {
        try
        {
            var fullPath = Path.Combine(_templateBasePath, partialDirectory);

            if (!Directory.Exists(fullPath))
            {
                _logger.LogWarning("Partial directory not found: {Path}", fullPath);
                return;
            }

            _logger.LogInformation("Loading partials from: {Path}", fullPath);

            // 查找所有 .hbs 文件
            var partialFiles = Directory.GetFiles(fullPath, "*.hbs", SearchOption.AllDirectories);

            _logger.LogDebug("Found {Count} partial files", partialFiles.Length);

            foreach (var filePath in partialFiles)
            {
                // 使用相对路径作为partial名称（不包含扩展名）
                var relativePath = Path.GetRelativePath(fullPath, filePath);
                var partialName = Path.ChangeExtension(relativePath, null)
                    .Replace(Path.DirectorySeparatorChar, '/');  // 统一使用 / 分隔符

                // 读取并注册partial
                var content = await File.ReadAllTextAsync(filePath);
                RegisterPartial(partialName, content);
            }

            _logger.LogInformation(
                "Loaded {Count} partials successfully",
                partialFiles.Length);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to load partials from: {Path}", partialDirectory);
            throw;
        }
    }

    /// <summary>
    /// 清空模板缓存
    /// </summary>
    public void ClearCache()
    {
        _compiledTemplateCache.Clear();
        _partialCache.Clear();
        _logger.LogInformation("Template cache cleared");
    }

    /// <summary>
    /// 获取缓存统计信息
    /// </summary>
    public TemplateCacheStatistics GetCacheStatistics()
    {
        return new TemplateCacheStatistics
        {
            CompiledTemplateCount = _compiledTemplateCache.Count,
            PartialCount = _partialCache.Count,
            TotalCacheSize = EstimateCacheSize()
        };
    }

    #region Private Methods

    /// <summary>
    /// 计算内容哈希值（用于缓存验证）
    /// </summary>
    private static string ComputeHash(string content)
    {
        using var sha256 = System.Security.Cryptography.SHA256.Create();
        var bytes = System.Text.Encoding.UTF8.GetBytes(content);
        var hash = sha256.ComputeHash(bytes);
        return Convert.ToBase64String(hash);
    }

    /// <summary>
    /// 注册内置Helpers
    /// </summary>
    private void RegisterBuiltInHelpers()
    {
        // Helper: {{pascalCase name}}
        _handlebars.RegisterHelper("pascalCase", (writer, context, parameters) =>
        {
            if (parameters.Length > 0 && parameters[0] is string str)
            {
                writer.WriteSafeString(ToPascalCase(str));
            }
        });

        // Helper: {{camelCase name}}
        _handlebars.RegisterHelper("camelCase", (writer, context, parameters) =>
        {
            if (parameters.Length > 0 && parameters[0] is string str)
            {
                writer.WriteSafeString(ToCamelCase(str));
            }
        });

        // Helper: {{pluralize name}}
        _handlebars.RegisterHelper("pluralize", (writer, context, parameters) =>
        {
            if (parameters.Length > 0 && parameters[0] is string str)
            {
                writer.WriteSafeString(Pluralize(str));
            }
        });

        // Helper: {{lowercase name}}
        _handlebars.RegisterHelper("lowercase", (writer, context, parameters) =>
        {
            if (parameters.Length > 0 && parameters[0] is string str)
            {
                writer.WriteSafeString(str.ToLowerInvariant());
            }
        });

        // Helper: {{uppercase name}}
        _handlebars.RegisterHelper("uppercase", (writer, context, parameters) =>
        {
            if (parameters.Length > 0 && parameters[0] is string str)
            {
                writer.WriteSafeString(str.ToUpperInvariant());
            }
        });

        // Helper: {{kebabCase name}}
        _handlebars.RegisterHelper("kebabCase", (writer, context, parameters) =>
        {
            if (parameters.Length > 0 && parameters[0] is string str)
            {
                writer.WriteSafeString(ToKebabCase(str));
            }
        });

        // Helper: {{snakeCase name}}
        _handlebars.RegisterHelper("snakeCase", (writer, context, parameters) =>
        {
            if (parameters.Length > 0 && parameters[0] is string str)
            {
                writer.WriteSafeString(ToSnakeCase(str));
            }
        });

        // Helper: {{add x y}} - 数字相加
        _handlebars.RegisterHelper("add", (writer, context, parameters) =>
        {
            if (parameters.Length >= 2)
            {
                var sum = 0;
                foreach (var param in parameters)
                {
                    if (param is int intVal)
                    {
                        sum += intVal;
                    }
                    else if (int.TryParse(param?.ToString(), out var parsed))
                    {
                        sum += parsed;
                    }
                }
                writer.WriteSafeString(sum.ToString());
            }
        });

        // Helper: {{guid}} - 生成新GUID
        _handlebars.RegisterHelper("guid", (writer, context, parameters) =>
        {
            writer.WriteSafeString(Guid.NewGuid().ToString("N")); // 无连字符的GUID
        });

        _logger.LogDebug("Built-in helpers registered: pascalCase, camelCase, pluralize, lowercase, uppercase, kebabCase, snakeCase, add, guid");
    }

    /// <summary>
    /// 转换为PascalCase
    /// </summary>
    private static string ToPascalCase(string str)
    {
        if (string.IsNullOrEmpty(str))
        {
            return str;
        }

        // 分割单词（按大写字母、下划线、连字符）
        var words = System.Text.RegularExpressions.Regex
            .Split(str, @"(?<!^)(?=[A-Z])|[_-]")
            .Where(w => !string.IsNullOrEmpty(w))
            .Select(w => char.ToUpperInvariant(w[0]) + w.Substring(1).ToLowerInvariant());

        return string.Concat(words);
    }

    /// <summary>
    /// 转换为camelCase
    /// </summary>
    private static string ToCamelCase(string str)
    {
        var pascalCase = ToPascalCase(str);

        if (string.IsNullOrEmpty(pascalCase))
        {
            return pascalCase;
        }

        return char.ToLowerInvariant(pascalCase[0]) + pascalCase.Substring(1);
    }

    /// <summary>
    /// 转换为kebab-case
    /// </summary>
    private static string ToKebabCase(string str)
    {
        if (string.IsNullOrEmpty(str))
        {
            return str;
        }

        return System.Text.RegularExpressions.Regex
            .Replace(str, @"(?<!^)(?=[A-Z])", "-")
            .ToLowerInvariant();
    }

    /// <summary>
    /// 转换为snake_case
    /// </summary>
    private static string ToSnakeCase(string str)
    {
        if (string.IsNullOrEmpty(str))
        {
            return str;
        }

        return System.Text.RegularExpressions.Regex
            .Replace(str, @"(?<!^)(?=[A-Z])", "_")
            .ToLowerInvariant();
    }

    /// <summary>
    /// 简单的复数形式转换
    /// </summary>
    private static string Pluralize(string str)
    {
        if (string.IsNullOrEmpty(str))
        {
            return str;
        }

        // 简单规则（实际项目中应该使用Humanizer.Core等库）
        if (str.EndsWith("y", StringComparison.OrdinalIgnoreCase))
        {
            return str.Substring(0, str.Length - 1) + "ies";
        }

        if (str.EndsWith("s", StringComparison.OrdinalIgnoreCase) ||
            str.EndsWith("x", StringComparison.OrdinalIgnoreCase) ||
            str.EndsWith("ch", StringComparison.OrdinalIgnoreCase) ||
            str.EndsWith("sh", StringComparison.OrdinalIgnoreCase))
        {
            return str + "es";
        }

        return str + "s";
    }

    /// <summary>
    /// 估算缓存大小（字节）
    /// </summary>
    private long EstimateCacheSize()
    {
        long size = 0;

        // 估算编译模板缓存大小（每个模板约1KB）
        size += _compiledTemplateCache.Count * 1024;

        // 估算Partial缓存大小
        foreach (var partial in _partialCache.Values)
        {
            size += partial.Length * 2;  // C# string是UTF-16，每个字符2字节
        }

        return size;
    }

    #endregion
}

/// <summary>
/// 模板缓存统计信息
/// </summary>
public class TemplateCacheStatistics
{
    /// <summary>
    /// 已编译模板数量
    /// </summary>
    public int CompiledTemplateCount { get; set; }

    /// <summary>
    /// Partial数量
    /// </summary>
    public int PartialCount { get; set; }

    /// <summary>
    /// 总缓存大小（字节）
    /// </summary>
    public long TotalCacheSize { get; set; }

    /// <summary>
    /// 缓存大小（MB）
    /// </summary>
    public double TotalCacheSizeMB => TotalCacheSize / 1024.0 / 1024.0;
}

/// <summary>
/// 模板引擎扩展方法
/// </summary>
public static class TemplateEngineExtensions
{
    /// <summary>
    /// 从文件加载、编译并渲染模板（一步完成）
    /// </summary>
    public static async Task<string> RenderFileAsync(
        this ITemplateEngine engine,
        string templatePath,
        object data)
    {
        var template = await engine.LoadTemplateAsync(templatePath);
        return await engine.RenderAsync(template, data);
    }

    /// <summary>
    /// 批量加载Partial（从目录）
    /// </summary>
    public static async Task RegisterPartialsFromDirectoryAsync(
        this HandlebarsTemplateEngine engine,
        string partialDirectory)
    {
        await engine.LoadPartialsAsync(partialDirectory);
    }
}

