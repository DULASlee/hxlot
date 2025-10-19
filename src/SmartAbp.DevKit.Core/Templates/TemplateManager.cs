using System;
using System.Collections.Concurrent;
using System.IO;
using System.Reflection;
using System.Security.Cryptography;
using System.Text;
using HandlebarsDotNet;
using Microsoft.Extensions.Caching.Memory;
using Volo.Abp.DependencyInjection;

namespace SmartAbp.DevKit.Core.Templates;

/// <summary>
/// 模板管理器
/// 统一管理、加载和缓存Handlebars模板
/// ⭐ D爷建议：硬伤2修复 - 使用MemoryCache替代无限缓存
/// </summary>
public class TemplateManager : ISingletonDependency
{
    private readonly IMemoryCache _templateCache;
    private readonly string _templateDirectory;
    private readonly MemoryCacheEntryOptions _cacheOptions;

    public TemplateManager(IMemoryCache? memoryCache = null)
    {
        // 默认模板目录
        _templateDirectory = Path.Combine(AppContext.BaseDirectory, "Templates");
        
        // ⭐ D爷建议：硬伤2修复 - 使用LRU缓存机制
        _templateCache = memoryCache ?? new MemoryCache(new MemoryCacheOptions
        {
            SizeLimit = 1000 // 最多缓存1000个模板
        });
        
        _cacheOptions = new MemoryCacheEntryOptions
        {
            Size = 1, // 每个条目占用1个单位
            SlidingExpiration = TimeSpan.FromHours(1), // 1小时滑动过期
            AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(24) // 24小时绝对过期
        };
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
    /// ⭐ D爷建议：硬伤2修复 - 使用MemoryCache
    /// </summary>
    public HandlebarsTemplate<object, object> LoadTemplate(string templateName)
    {
        // 尝试从缓存获取
        if (_templateCache.TryGetValue(templateName, out HandlebarsTemplate<object, object>? cachedTemplate))
        {
            return cachedTemplate!;
        }

        var templatePath = Path.Combine(_templateDirectory, $"{templateName}.hbs");
        if (!File.Exists(templatePath))
        {
            throw new FileNotFoundException($"Template not found: {templatePath}");
        }

        var templateSource = File.ReadAllText(templatePath);
        var compiledTemplate = HandlebarsDotNet.Handlebars.Compile(templateSource);

        // 添加到缓存（带过期时间）
        _templateCache.Set(templateName, compiledTemplate, _cacheOptions);

        return compiledTemplate;
    }

    /// <summary>
    /// 编译内嵌模板
    /// ⭐ D爷建议：硬伤2修复 - 使用SHA256哈希作为缓存键
    /// </summary>
    public HandlebarsTemplate<object, object> CompileTemplate(string templateSource)
    {
        if (string.IsNullOrWhiteSpace(templateSource))
        {
            throw new ArgumentException("Template source cannot be empty", nameof(templateSource));
        }

        // 生成缓存键（使用SHA256哈希）
        var cacheKey = GenerateCacheKey(templateSource);

        // 尝试从缓存获取
        if (_templateCache.TryGetValue(cacheKey, out HandlebarsTemplate<object, object>? cachedTemplate))
        {
            return cachedTemplate!;
        }

        // 编译模板
        var compiledTemplate = HandlebarsDotNet.Handlebars.Compile(templateSource);

        // 添加到缓存
        _templateCache.Set(cacheKey, compiledTemplate, _cacheOptions);

        return compiledTemplate;
    }

    /// <summary>
    /// 生成缓存键（使用SHA256哈希，避免哈希冲突）
    /// ⭐ D爷建议：硬伤2修复 - 使用可靠的哈希算法
    /// </summary>
    private static string GenerateCacheKey(string source)
    {
        using var sha256 = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(source);
        var hash = sha256.ComputeHash(bytes);
        return Convert.ToBase64String(hash);
    }

    /// <summary>
    /// 从嵌入资源加载模板
    /// ⭐ D爷建议：硬伤2修复 - 使用MemoryCache
    /// </summary>
    public HandlebarsTemplate<object, object> LoadEmbeddedTemplate(string resourceName)
    {
        // 尝试从缓存获取
        if (_templateCache.TryGetValue(resourceName, out HandlebarsTemplate<object, object>? cachedTemplate))
        {
            return cachedTemplate!;
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

        // 添加到缓存
        _templateCache.Set(resourceName, compiledTemplate, _cacheOptions);

        return compiledTemplate;
    }

    /// <summary>
    /// 清除所有缓存（慎用）
    /// </summary>
    public void ClearCache()
    {
        if (_templateCache is MemoryCache memCache)
        {
            memCache.Compact(1.0); // 压缩100%（清空）
        }
    }

    /// <summary>
    /// 移除指定模板缓存
    /// </summary>
    public void RemoveTemplate(string templateName)
    {
        _templateCache.Remove(templateName);
    }
}

