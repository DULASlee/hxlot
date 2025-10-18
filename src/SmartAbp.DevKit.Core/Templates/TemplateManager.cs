using System;
using System.Collections.Concurrent;
using System.IO;
using System.Reflection;
using HandlebarsDotNet;
using Volo.Abp.DependencyInjection;

namespace SmartAbp.DevKit.Core.Templates;

/// <summary>
/// 模板管理器
/// 统一管理、加载和缓存Handlebars模板
/// </summary>
public class TemplateManager : ISingletonDependency
{
    private readonly ConcurrentDictionary<string, HandlebarsTemplate<object, object>> _templateCache = new();
    private readonly string _templateDirectory;

    public TemplateManager()
    {
        // 默认模板目录
        _templateDirectory = Path.Combine(AppContext.BaseDirectory, "Templates");
    }

    /// <summary>
    /// 注册自定义Helper
    /// </summary>
    public void RegisterHelpers()
    {
        // 字符串处理Helper
        HandlebarsDotNet.Handlebars.RegisterHelper("pascalCase", (writer, context, parameters) =>
        {
            var input = context.ToString();
            if (!string.IsNullOrEmpty(input))
            {
                writer.WriteSafeString(Helpers.StringHelper.ToPascalCase(input));
            }
        });

        HandlebarsDotNet.Handlebars.RegisterHelper("camelCase", (writer, context, parameters) =>
        {
            var input = context.ToString();
            if (!string.IsNullOrEmpty(input))
            {
                writer.WriteSafeString(Helpers.StringHelper.ToCamelCase(input));
            }
        });

        HandlebarsDotNet.Handlebars.RegisterHelper("snakeCase", (writer, context, parameters) =>
        {
            var input = context.ToString();
            if (!string.IsNullOrEmpty(input))
            {
                writer.WriteSafeString(Helpers.StringHelper.ToSnakeCase(input));
            }
        });

        HandlebarsDotNet.Handlebars.RegisterHelper("kebabCase", (writer, context, parameters) =>
        {
            var input = context.ToString();
            if (!string.IsNullOrEmpty(input))
            {
                writer.WriteSafeString(Helpers.StringHelper.ToKebabCase(input));
            }
        });

        HandlebarsDotNet.Handlebars.RegisterHelper("pluralize", (writer, context, parameters) =>
        {
            var input = context.ToString();
            if (!string.IsNullOrEmpty(input))
            {
                writer.WriteSafeString(Helpers.StringHelper.Pluralize(input));
            }
        });

        HandlebarsDotNet.Handlebars.RegisterHelper("singularize", (writer, context, parameters) =>
        {
            var input = context.ToString();
            if (!string.IsNullOrEmpty(input))
            {
                writer.WriteSafeString(Helpers.StringHelper.Singularize(input));
            }
        });

        // 类型映射Helper
        HandlebarsDotNet.Handlebars.RegisterHelper("toTypeScript", (writer, context, parameters) =>
        {
            var input = context.ToString();
            if (!string.IsNullOrEmpty(input))
            {
                writer.WriteSafeString(Helpers.TypeMapper.CSharpToTypeScript(input));
            }
        });

        HandlebarsDotNet.Handlebars.RegisterHelper("toSQL", (writer, context, parameters) =>
        {
            var input = context.ToString();
            if (!string.IsNullOrEmpty(input))
            {
                writer.WriteSafeString(Helpers.TypeMapper.CSharpToSQL(input));
            }
        });

        HandlebarsDotNet.Handlebars.RegisterHelper("defaultValue", (writer, context, parameters) =>
        {
            var input = context.ToString();
            if (!string.IsNullOrEmpty(input))
            {
                writer.WriteSafeString(Helpers.TypeMapper.GetCSharpDefaultValue(input));
            }
        });

        // 日期时间Helper
        HandlebarsDotNet.Handlebars.RegisterHelper("now", (writer, context, parameters) =>
        {
            writer.WriteSafeString(DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"));
        });

        HandlebarsDotNet.Handlebars.RegisterHelper("year", (writer, context, parameters) =>
        {
            writer.WriteSafeString(DateTime.Now.Year.ToString());
        });

        // 条件判断Helper
        HandlebarsDotNet.Handlebars.RegisterHelper("eq", (writer, context, arguments) =>
        {
            if (arguments.Length >= 2 && arguments[0]?.ToString() == arguments[1]?.ToString())
            {
                writer.WriteSafeString("true");
            }
        });

        HandlebarsDotNet.Handlebars.RegisterHelper("ne", (writer, context, arguments) =>
        {
            if (arguments.Length >= 2 && arguments[0]?.ToString() != arguments[1]?.ToString())
            {
                writer.WriteSafeString("true");
            }
        });
    }

    /// <summary>
    /// 加载模板（优先从缓存获取）
    /// </summary>
    public HandlebarsTemplate<object, object> LoadTemplate(string templateName)
    {
        if (_templateCache.TryGetValue(templateName, out var cachedTemplate))
        {
            return cachedTemplate;
        }

        var templatePath = Path.Combine(_templateDirectory, $"{templateName}.hbs");
        if (!File.Exists(templatePath))
        {
            throw new FileNotFoundException($"Template not found: {templatePath}");
        }

        var templateSource = File.ReadAllText(templatePath);
        var compiledTemplate = HandlebarsDotNet.Handlebars.Compile(templateSource);

        _templateCache.TryAdd(templateName, compiledTemplate);

        return compiledTemplate;
    }

    /// <summary>
    /// 编译内嵌模板
    /// </summary>
    public HandlebarsTemplate<object, object> CompileTemplate(string templateSource)
    {
        if (string.IsNullOrWhiteSpace(templateSource))
        {
            throw new ArgumentException("Template source cannot be empty", nameof(templateSource));
        }

        return HandlebarsDotNet.Handlebars.Compile(templateSource);
    }

    /// <summary>
    /// 从嵌入资源加载模板
    /// </summary>
    public HandlebarsTemplate<object, object> LoadEmbeddedTemplate(string resourceName)
    {
        if (_templateCache.TryGetValue(resourceName, out var cachedTemplate))
        {
            return cachedTemplate;
        }

        var assembly = Assembly.GetExecutingAssembly();
        using var stream = assembly.GetManifestResourceStream(resourceName);

        if (stream == null)
        {
            throw new InvalidOperationException($"Embedded resource not found: {resourceName}");
        }

        using var reader = new StreamReader(stream);
        var templateSource = reader.ReadToEnd();
        var compiledTemplate = HandlebarsDotNet.Handlebars.Compile(templateSource);

        _templateCache.TryAdd(resourceName, compiledTemplate);

        return compiledTemplate;
    }

    /// <summary>
    /// 清除缓存
    /// </summary>
    public void ClearCache()
    {
        _templateCache.Clear();
    }

    /// <summary>
    /// 移除指定模板缓存
    /// </summary>
    public void RemoveTemplate(string templateName)
    {
        _templateCache.TryRemove(templateName, out _);
    }

    /// <summary>
    /// 获取所有已缓存的模板名称
    /// </summary>
    public string[] GetCachedTemplateNames()
    {
        return _templateCache.Keys.ToArray();
    }

    /// <summary>
    /// 获取缓存统计信息
    /// </summary>
    public TemplateCacheStats GetCacheStats()
    {
        return new TemplateCacheStats
        {
            TotalCachedTemplates = _templateCache.Count,
            CachedTemplateNames = _templateCache.Keys.ToList()
        };
    }
}

/// <summary>
/// 模板缓存统计信息
/// </summary>
public class TemplateCacheStats
{
    public int TotalCachedTemplates { get; set; }
    public List<string> CachedTemplateNames { get; set; } = new();
}

