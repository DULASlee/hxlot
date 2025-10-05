using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Volo.Abp.DependencyInjection;

namespace SmartAbp.CodeGenerator.Core.Templates;

/// <summary>
/// 🏢 企业版特性：内嵌模板资源提取器实现
/// 支持容器化环境零配置部署，自动提取和缓存模板文件
/// 兼容Docker、Kubernetes等容器化部署环境
/// </summary>
public class EmbeddedTemplateExtractor : IEmbeddedTemplateExtractor, ITransientDependency
{
    private readonly ILogger<EmbeddedTemplateExtractor> _logger;
    private readonly System.Reflection.Assembly _assembly;
    private readonly string _temporaryPath;
    private readonly ConcurrentDictionary<string, string> _extractedTemplates;
    private readonly object _extractionLock = new();

    // 内嵌资源前缀
    private const string EMBEDDED_RESOURCE_PREFIX = "SmartAbp.CodeGenerator.Templates.";

    public EmbeddedTemplateExtractor(ILogger<EmbeddedTemplateExtractor> logger)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _assembly = System.Reflection.Assembly.GetExecutingAssembly();
        _temporaryPath = Path.Combine(Path.GetTempPath(), "SmartAbp", "Templates", Guid.NewGuid().ToString("N")[..8]);
        _extractedTemplates = new ConcurrentDictionary<string, string>();
        
        // 🔧 确保临时目录存在
        Directory.CreateDirectory(_temporaryPath);
        _logger.LogInformation("📁 内嵌模板提取器初始化: {TempPath}", _temporaryPath);
    }

    /// <summary>
    /// 提取指定的内嵌模板资源到临时目录
    /// 🔥 同步方法修复：移除不必要的async（遵循BUG修复铁律）
    /// </summary>
    public Task<string?> ExtractTemplateAsync(string templateRelativePath)
    {
        if (string.IsNullOrWhiteSpace(templateRelativePath))
        {
            _logger.LogWarning("模板相对路径为空，跳过提取");
            return Task.FromResult<string?>(null);
        }

        try
        {
            // 🔍 检查是否已提取过
            if (_extractedTemplates.TryGetValue(templateRelativePath, out var existingPath))
            {
                if (File.Exists(existingPath))
                {
                    _logger.LogDebug("📋 使用已提取的模板: {TemplatePath}", templateRelativePath);
                    return Task.FromResult<string?>(existingPath);
                }
                // 如果文件不存在，从缓存中移除
                _extractedTemplates.TryRemove(templateRelativePath, out _);
            }

            // 🔧 构建内嵌资源名称
            var resourceName = BuildEmbeddedResourceName(templateRelativePath);
            
            // 🔍 检查资源是否存在
            if (!IsResourceAvailable(resourceName))
            {
                _logger.LogDebug("❌ 内嵌资源不存在: {ResourceName}", resourceName);
                return Task.FromResult<string?>(null);
            }

            // 🚀 提取资源到临时文件（修复lock+await冲突）
            string? extractedPath;
            lock (_extractionLock)
            {
                // 🔥 同步提取：避免lock语句中的await（遵循BUG修复铁律）
                extractedPath = ExtractResourceToFileAsync(resourceName, templateRelativePath).GetAwaiter().GetResult();
            }
            
            if (extractedPath != null)
            {
                _extractedTemplates.TryAdd(templateRelativePath, extractedPath);
                _logger.LogInformation("✅ 内嵌模板提取成功: {TemplatePath} → {ExtractedPath}", 
                    templateRelativePath, extractedPath);
            }
            return Task.FromResult(extractedPath);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ 内嵌模板提取失败: {TemplatePath}", templateRelativePath);
            return Task.FromResult<string?>(null);
        }
    }

    /// <summary>
    /// 批量提取所有内嵌模板资源
    /// </summary>
    public async Task<int> ExtractAllTemplatesAsync()
    {
        _logger.LogInformation("🚀 开始批量提取所有内嵌模板资源");

        try
        {
            var resourceNames = GetAllEmbeddedTemplateResources();
            var extractedCount = 0;

            var extractionTasks = resourceNames.Select(async resourceName =>
            {
                try
                {
                    var templatePath = ConvertResourceNameToPath(resourceName);
                    var extracted = await ExtractTemplateAsync(templatePath);
                    return extracted != null ? 1 : 0;
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "单个模板提取失败: {ResourceName}", resourceName);
                    return 0;
                }
            });

            var results = await Task.WhenAll(extractionTasks);
            extractedCount = results.Sum();

            _logger.LogInformation("✅ 批量提取完成: {ExtractedCount}/{TotalCount} 个模板", 
                extractedCount, resourceNames.Count);

            return extractedCount;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ 批量提取内嵌模板失败");
            return 0;
        }
    }

    /// <summary>
    /// 获取内嵌模板的临时提取目录
    /// </summary>
    public string GetTemporaryExtractionPath()
    {
        return _temporaryPath;
    }

    /// <summary>
    /// 清理临时提取的模板文件
    /// </summary>
    public async Task<int> CleanupTemporaryFilesAsync()
    {
        try
        {
            if (!Directory.Exists(_temporaryPath))
            {
                _logger.LogDebug("临时目录不存在，无需清理: {TempPath}", _temporaryPath);
                return 0;
            }

            var files = Directory.GetFiles(_temporaryPath, "*", SearchOption.AllDirectories);
            var deletedCount = 0;

            foreach (var file in files)
            {
                try
                {
                    File.Delete(file);
                    deletedCount++;
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "删除临时文件失败: {FilePath}", file);
                }
            }

            // 尝试删除空目录
            try
            {
                Directory.Delete(_temporaryPath, true);
                _logger.LogInformation("🧹 临时目录清理完成: {DeletedCount} 个文件", deletedCount);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "删除临时目录失败: {TempPath}", _temporaryPath);
            }

            _extractedTemplates.Clear();
            return await Task.FromResult(deletedCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ 清理临时文件失败");
            return 0;
        }
    }

    /// <summary>
    /// 检查指定模板是否存在于内嵌资源中
    /// </summary>
    public bool IsTemplateEmbedded(string templateRelativePath)
    {
        var resourceName = BuildEmbeddedResourceName(templateRelativePath);
        return IsResourceAvailable(resourceName);
    }

    /// <summary>
    /// 获取所有可用的内嵌模板列表
    /// </summary>
    public async Task<List<string>> GetAvailableTemplatesAsync()
    {
        try
        {
            var resourceNames = GetAllEmbeddedTemplateResources();
            var templatePaths = resourceNames
                .Select(ConvertResourceNameToPath)
                .Where(path => !string.IsNullOrEmpty(path))
                .ToList();

            _logger.LogDebug("📋 发现内嵌模板: {TemplateCount} 个", templatePaths.Count);
            return await Task.FromResult(templatePaths);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ 获取内嵌模板列表失败");
            return new List<string>();
        }
    }

    /// <summary>
    /// 🔧 构建内嵌资源名称
    /// </summary>
    private string BuildEmbeddedResourceName(string templateRelativePath)
    {
        // 将路径分隔符转换为点号，构建资源名称
        var normalizedPath = templateRelativePath.Replace('/', '.').Replace('\\', '.');
        return $"{EMBEDDED_RESOURCE_PREFIX}{normalizedPath}";
    }

    /// <summary>
    /// 🔍 检查资源是否可用
    /// </summary>
    private bool IsResourceAvailable(string resourceName)
    {
        var resourceNames = _assembly.GetManifestResourceNames();
        return resourceNames.Contains(resourceName);
    }

    /// <summary>
    /// 🚀 提取资源到文件
    /// </summary>
    private async Task<string?> ExtractResourceToFileAsync(string resourceName, string templateRelativePath)
    {
        try
        {
            using var stream = _assembly.GetManifestResourceStream(resourceName);
            if (stream == null)
            {
                _logger.LogWarning("❌ 无法获取内嵌资源流: {ResourceName}", resourceName);
                return null;
            }

            // 🔧 构建目标文件路径
            var relativePath = templateRelativePath.Replace('/', Path.DirectorySeparatorChar);
            var targetPath = Path.Combine(_temporaryPath, relativePath);

            // 确保目标目录存在
            var targetDir = Path.GetDirectoryName(targetPath);
            if (!string.IsNullOrEmpty(targetDir))
            {
                Directory.CreateDirectory(targetDir);
            }

            // 🔥 安全写入文件（原子性操作）
            using var fileStream = new FileStream(targetPath, FileMode.Create, FileAccess.Write);
            await stream.CopyToAsync(fileStream);

            _logger.LogDebug("📄 资源提取完成: {ResourceName} → {TargetPath}", resourceName, targetPath);
            return targetPath;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ 提取资源到文件失败: {ResourceName}", resourceName);
            return null;
        }
    }

    /// <summary>
    /// 🔍 获取所有内嵌模板资源名称
    /// </summary>
    private List<string> GetAllEmbeddedTemplateResources()
    {
        var resourceNames = _assembly.GetManifestResourceNames();
        return resourceNames
            .Where(name => name.StartsWith(EMBEDDED_RESOURCE_PREFIX))
            .ToList();
    }

    /// <summary>
    /// 🔧 将资源名称转换回模板路径
    /// </summary>
    private string ConvertResourceNameToPath(string resourceName)
    {
        if (!resourceName.StartsWith(EMBEDDED_RESOURCE_PREFIX))
        {
            return string.Empty;
        }

        // 移除前缀，并转换点号为路径分隔符
        var pathPart = resourceName[EMBEDDED_RESOURCE_PREFIX.Length..];
        
        // 🔧 智能路径重建：处理文件扩展名中的点号
        var segments = pathPart.Split('.');
        
        // 查找最后一个可能的扩展名
        for (int i = segments.Length - 2; i >= 0; i--)
        {
            var possibleExtension = string.Join(".", segments[i..]);
            if (IsValidTemplateExtension(possibleExtension))
            {
                var pathSegments = segments[..i];
                var fileName = possibleExtension;
                return Path.Combine(pathSegments.Concat(new[] { fileName }).ToArray())
                    .Replace('\\', '/'); // 规范化为Unix风格路径
            }
        }

        // 兜底：直接转换点号为路径分隔符
        return pathPart.Replace('.', '/');
    }

    /// <summary>
    /// 🔍 验证是否为有效的模板文件扩展名
    /// </summary>
    private static bool IsValidTemplateExtension(string extension)
    {
        var validExtensions = new[]
        {
            "template.cs", "template.vue", "template.ts", "template.js",
            "template.json", "template.yml", "template.yaml",
            "meta.yml", "meta.yaml", "json", "md"
        };

        return validExtensions.Any(ext => extension.EndsWith(ext, StringComparison.OrdinalIgnoreCase));
    }
}
