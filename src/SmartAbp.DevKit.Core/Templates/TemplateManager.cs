using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.DevKit.Core.Abstractions;
using Template = SmartAbp.DevKit.Core.Abstractions.Template;

namespace SmartAbp.DevKit.Core.Templates;

/// <summary>
/// 模板管理器（负责管理所有模板的加载、注册和渲染）
/// </summary>
public class TemplateManager
{
    private readonly ILogger<TemplateManager> _logger;
    private readonly ITemplateEngine _templateEngine;
    private readonly ConcurrentDictionary<string, TemplateMetadata> _templateRegistry;
    private readonly string _templateBasePath;

    public TemplateManager(
        ILogger<TemplateManager> logger,
        ITemplateEngine templateEngine,
        string? templateBasePath = null)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _templateEngine = templateEngine ?? throw new ArgumentNullException(nameof(templateEngine));
        _templateBasePath = templateBasePath ?? "templates";
        _templateRegistry = new ConcurrentDictionary<string, TemplateMetadata>();

        _logger.LogInformation("TemplateManager initialized. Base path: {Path}", _templateBasePath);
    }

    /// <summary>
    /// 发现并注册模板（扫描模板目录）
    /// </summary>
    /// <returns>注册的模板数量</returns>
    public async Task<int> DiscoverAndRegisterTemplatesAsync()
    {
        try
        {
            _logger.LogInformation("Discovering templates from: {Path}", _templateBasePath);

            if (!Directory.Exists(_templateBasePath))
            {
                _logger.LogWarning("Template base path not found: {Path}", _templateBasePath);
                Directory.CreateDirectory(_templateBasePath);
                return 0;
            }

            var count = 0;

            // 扫描所有层级目录
            var layerDirs = new[]
            {
                "backend/domain",
                "backend/application",
                "backend/httpapi",
                "frontend/views",
                "frontend/components",
                "shared/partials"
            };

            foreach (var layerDir in layerDirs)
            {
                var fullPath = Path.Combine(_templateBasePath, layerDir);
                if (Directory.Exists(fullPath))
                {
                    count += await RegisterTemplatesFromDirectoryAsync(layerDir, fullPath);
                }
            }

            // 加载Partials
            var partialsPath = Path.Combine(_templateBasePath, "shared", "partials");
            if (Directory.Exists(partialsPath))
            {
                if (_templateEngine is HandlebarsTemplateEngine handlebarsEngine)
                {
                    await handlebarsEngine.LoadPartialsAsync("shared/partials");
                }
            }

            _logger.LogInformation(
                "Template discovery completed. Registered {Count} templates",
                count);

            return count;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to discover and register templates");
            throw;
        }
    }

    /// <summary>
    /// 从目录注册模板
    /// </summary>
    private async Task<int> RegisterTemplatesFromDirectoryAsync(string category, string directory)
    {
        var count = 0;

        try
        {
            var templateFiles = Directory.GetFiles(directory, "*.hbs", SearchOption.AllDirectories);

            foreach (var filePath in templateFiles)
            {
                var templateName = Path.GetFileNameWithoutExtension(filePath);
                var relativePath = Path.GetRelativePath(_templateBasePath, filePath);

                var metadata = new TemplateMetadata
                {
                    Name = templateName,
                    Category = category,
                    Path = relativePath,
                    FullPath = filePath,
                    LastModified = File.GetLastWriteTimeUtc(filePath),
                    FileSize = new FileInfo(filePath).Length
                };

                if (_templateRegistry.TryAdd(templateName, metadata))
                {
                    _logger.LogDebug(
                        "Registered template: {Name} ({Category})",
                        templateName,
                        category);
                    count++;
                }
                else
                {
                    _logger.LogWarning(
                        "Template already registered: {Name} ({Category})",
                        templateName,
                        category);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Failed to register templates from directory: {Directory}",
                directory);
        }

        return count;
    }

    /// <summary>
    /// 根据名称获取模板
    /// </summary>
    /// <param name="templateName">模板名称</param>
    /// <returns>模板元数据</returns>
    public TemplateMetadata? GetTemplate(string templateName)
    {
        return _templateRegistry.TryGetValue(templateName, out var metadata)
            ? metadata
            : null;
    }

    /// <summary>
    /// 获取指定类别的所有模板
    /// </summary>
    /// <param name="category">类别</param>
    /// <returns>模板列表</returns>
    public List<TemplateMetadata> GetTemplatesByCategory(string category)
    {
        return _templateRegistry.Values
            .Where(t => t.Category.Equals(category, StringComparison.OrdinalIgnoreCase))
            .OrderBy(t => t.Name)
            .ToList();
    }

    /// <summary>
    /// 渲染模板
    /// </summary>
    /// <param name="templateName">模板名称</param>
    /// <param name="data">数据对象</param>
    /// <returns>渲染后的内容</returns>
    public async Task<string> RenderTemplateAsync(string templateName, object data)
    {
        try
        {
            var metadata = GetTemplate(templateName);

            if (metadata == null)
            {
                throw new InvalidOperationException($"Template not found: {templateName}");
            }

            _logger.LogDebug("Rendering template: {Name}", templateName);

            // 加载模板对象
            var template = await _templateEngine.LoadTemplateAsync(metadata.Path);

            // 渲染模板
            var result = await _templateEngine.RenderAsync(template, data);

            _logger.LogDebug(
                "Template rendered successfully: {Name}, Output size: {Size} bytes",
                templateName,
                result.Length);

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to render template: {Name}", templateName);
            throw;
        }
    }

    /// <summary>
    /// 批量渲染模板
    /// </summary>
    /// <param name="requests">渲染请求列表</param>
    /// <returns>渲染结果列表</returns>
    public async Task<List<TemplateRenderResult>> RenderBatchAsync(
        List<TemplateRenderRequest> requests)
    {
        var results = new List<TemplateRenderResult>();

        _logger.LogInformation("Rendering {Count} templates in batch", requests.Count);

        // 并行渲染（提升性能）
        var tasks = requests.Select(async request =>
        {
            try
            {
                var content = await RenderTemplateAsync(request.TemplateName, request.Data);
                return new TemplateRenderResult
                {
                    TemplateName = request.TemplateName,
                    OutputPath = request.OutputPath,
                    Content = content,
                    IsSuccess = true
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Failed to render template: {Name}",
                    request.TemplateName);

                return new TemplateRenderResult
                {
                    TemplateName = request.TemplateName,
                    OutputPath = request.OutputPath,
                    IsSuccess = false,
                    ErrorMessage = ex.Message
                };
            }
        });

        results = (await Task.WhenAll(tasks)).ToList();

        var successCount = results.Count(r => r.IsSuccess);
        _logger.LogInformation(
            "Batch rendering completed. Success: {SuccessCount}/{TotalCount}",
            successCount,
            requests.Count);

        return results;
    }

    /// <summary>
    /// 写入渲染结果到文件
    /// </summary>
    /// <param name="results">渲染结果列表</param>
    /// <param name="overwriteExisting">是否覆盖已存在的文件</param>
    /// <returns>写入的文件数量</returns>
    public async Task<int> WriteResultsToFilesAsync(
        List<TemplateRenderResult> results,
        bool overwriteExisting = false)
    {
        var count = 0;

        foreach (var result in results.Where(r => r.IsSuccess))
        {
            try
            {
                if (string.IsNullOrEmpty(result.OutputPath))
                {
                    _logger.LogWarning(
                        "Output path not specified for template: {Name}",
                        result.TemplateName);
                    continue;
                }

                // 检查文件是否已存在
                if (File.Exists(result.OutputPath) && !overwriteExisting)
                {
                    _logger.LogWarning(
                        "File already exists (skipping): {Path}",
                        result.OutputPath);
                    continue;
                }

                // 确保目录存在
                var directory = Path.GetDirectoryName(result.OutputPath);
                if (!string.IsNullOrEmpty(directory))
                {
                    Directory.CreateDirectory(directory);
                }

                // 写入文件
                await File.WriteAllTextAsync(result.OutputPath, result.Content);
                count++;

                _logger.LogDebug("File written: {Path}", result.OutputPath);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Failed to write file: {Path}",
                    result.OutputPath);
            }
        }

        _logger.LogInformation("Wrote {Count} files successfully", count);
        return count;
    }

    /// <summary>
    /// 重新加载模板（当模板文件被修改时）
    /// </summary>
    /// <param name="templateName">模板名称</param>
    public async Task ReloadTemplateAsync(string templateName)
    {
        var metadata = GetTemplate(templateName);

        if (metadata == null)
        {
            throw new InvalidOperationException($"Template not found: {templateName}");
        }

        // 更新最后修改时间
        metadata.LastModified = File.GetLastWriteTimeUtc(metadata.FullPath);

        // 清空引擎缓存（如果是HandlebarsTemplateEngine）
        if (_templateEngine is HandlebarsTemplateEngine handlebarsEngine)
        {
            handlebarsEngine.ClearCache();
        }

        _logger.LogInformation("Template reloaded: {Name}", templateName);
        await Task.CompletedTask;
    }

    /// <summary>
    /// 获取所有模板
    /// </summary>
    /// <returns>所有模板元数据列表</returns>
    public List<TemplateMetadata> GetAllTemplates()
    {
        return _templateRegistry.Values
            .OrderBy(t => t.Category)
            .ThenBy(t => t.Name)
            .ToList();
    }

    /// <summary>
    /// 注册Helpers（兼容性包装 - 委托给ITemplateEngine）
    /// </summary>
    /// <param name="name">Helper名称</param>
    /// <param name="helper">Helper委托</param>
    public void RegisterHelper(string name, Delegate helper)
    {
        _templateEngine.RegisterHelper(name, helper);
    }

    /// <summary>
    /// 批量注册Helpers（兼容性包装）
    /// </summary>
    public void RegisterHelpers(Dictionary<string, Delegate>? helpers = null)
    {
        // 如果没有传入helpers，则使用默认的helpers
        if (helpers == null || helpers.Count == 0)
        {
            // 默认helpers已在HandlebarsTemplateEngine的构造函数中注册
            // 这里不需要做任何事情
            return;
        }

        foreach (var kvp in helpers)
        {
            RegisterHelper(kvp.Key, kvp.Value);
        }
    }

    /// <summary>
    /// 编译模板（兼容性包装 - 委托给HandlebarsTemplateEngine）
    /// </summary>
    /// <param name="templateContent">模板内容</param>
    /// <param name="templateName">模板名称</param>
    /// <returns>编译后的模板函数</returns>
    public Func<object, string> CompileTemplate(string templateContent, string? templateName = null)
    {
        if (_templateEngine is HandlebarsTemplateEngine handlebarsEngine)
        {
            var compiledTemplate = handlebarsEngine.CompileTemplate(templateContent, templateName);
            return (data) => compiledTemplate(data);
        }

        throw new NotSupportedException("CompileTemplate is only supported for HandlebarsTemplateEngine");
    }
}

/// <summary>
/// 模板元数据
/// </summary>
public class TemplateMetadata
{
    /// <summary>
    /// 模板名称
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// 模板类别（如：backend/domain, frontend/views）
    /// </summary>
    public string Category { get; set; } = string.Empty;

    /// <summary>
    /// 模板相对路径（相对于templateBasePath）
    /// </summary>
    public string Path { get; set; } = string.Empty;

    /// <summary>
    /// 模板完整路径
    /// </summary>
    public string FullPath { get; set; } = string.Empty;

    /// <summary>
    /// 最后修改时间
    /// </summary>
    public DateTime LastModified { get; set; }

    /// <summary>
    /// 文件大小（字节）
    /// </summary>
    public long FileSize { get; set; }

    /// <summary>
    /// 模板描述
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// 模板标签
    /// </summary>
    public List<string> Tags { get; set; } = new();
}

/// <summary>
/// 模板渲染请求
/// </summary>
public class TemplateRenderRequest
{
    /// <summary>
    /// 模板名称
    /// </summary>
    public string TemplateName { get; set; } = string.Empty;

    /// <summary>
    /// 数据对象
    /// </summary>
    public object Data { get; set; } = new();

    /// <summary>
    /// 输出路径
    /// </summary>
    public string OutputPath { get; set; } = string.Empty;
}

/// <summary>
/// 模板渲染结果
/// </summary>
public class TemplateRenderResult
{
    /// <summary>
    /// 模板名称
    /// </summary>
    public string TemplateName { get; set; } = string.Empty;

    /// <summary>
    /// 输出路径
    /// </summary>
    public string OutputPath { get; set; } = string.Empty;

    /// <summary>
    /// 渲染后的内容
    /// </summary>
    public string Content { get; set; } = string.Empty;

    /// <summary>
    /// 是否成功
    /// </summary>
    public bool IsSuccess { get; set; }

    /// <summary>
    /// 错误消息
    /// </summary>
    public string? ErrorMessage { get; set; }
}
