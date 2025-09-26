using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Reflection;

namespace SmartAbp.CodeGenerator.Core.Templates;

/// <summary>
/// 务实的模板路径解析器 - 多路径查找策略
/// 解决硬编码路径问题，确保在开发、生产、容器化环境都能正确工作
/// </summary>
public class ReliableTemplatePathResolver
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<ReliableTemplatePathResolver> _logger;
    private readonly IEmbeddedTemplateExtractor _embeddedTemplateExtractor; // 🏢 企业版：内嵌模板提取器
    
    public ReliableTemplatePathResolver(
        IConfiguration configuration,
        ILogger<ReliableTemplatePathResolver> logger,
        IEmbeddedTemplateExtractor embeddedTemplateExtractor) // 🔥 注入内嵌模板提取器
    {
        _configuration = configuration;
        _logger = logger;
        _embeddedTemplateExtractor = embeddedTemplateExtractor;
    }

    /// <summary>
    /// 获取模板文件路径 - 多路径查找策略
    /// </summary>
    /// <param name="templateName">模板文件名，如 "Entity.template.cs"</param>
    /// <returns>找到的模板文件完整路径</returns>
    public string GetTemplatePath(string templateName)
    {
        if (string.IsNullOrEmpty(templateName))
        {
            throw new ArgumentException("模板名称不能为空", nameof(templateName));
        }

        _logger.LogDebug("开始查找模板文件: {TemplateName}", templateName);

        // 策略1: 配置路径（生产环境优先）
        var configPath = TryGetTemplateFromConfig(templateName);
        if (configPath != null)
        {
            _logger.LogDebug("在配置路径中找到模板: {TemplatePath}", configPath);
            return configPath;
        }

        // 策略2: 相对路径（开发环境）
        var relativePath = TryGetTemplateFromRelativePath(templateName);
        if (relativePath != null)
        {
            _logger.LogDebug("在相对路径中找到模板: {TemplatePath}", relativePath);
            return relativePath;
        }

        // 策略3: 解决方案根目录查找
        var solutionPath = TryGetTemplateFromSolutionRoot(templateName);
        if (solutionPath != null)
        {
            _logger.LogDebug("在解决方案根目录中找到模板: {TemplatePath}", solutionPath);
            return solutionPath;
        }

        // 策略4: 内嵌资源（容器化环境兜底）
        var embeddedPath = TryGetEmbeddedTemplate(templateName);
        if (embeddedPath != null)
        {
            _logger.LogDebug("使用内嵌资源模板: {TemplateName}", templateName);
            return embeddedPath;
        }

        // 所有策略都失败
        var errorMessage = $"无法找到模板文件 '{templateName}'。已尝试的路径：\n" +
                          $"1. 配置路径: {_configuration["CodeGeneration:TemplateRootPath"] ?? "未配置"}\n" +
                          $"2. 相对路径: ./templates/{templateName}\n" +
                          $"3. 解决方案根目录: {FindSolutionRoot()}/templates/{templateName}\n" +
                          $"4. 内嵌资源: 未找到对应的内嵌模板";

        _logger.LogError("模板文件查找失败: {ErrorMessage}", errorMessage);
        throw new FileNotFoundException(errorMessage);
    }

    /// <summary>
    /// 策略1: 从配置路径查找模板
    /// </summary>
    private string? TryGetTemplateFromConfig(string templateName)
    {
        var configPath = _configuration["CodeGeneration:TemplateRootPath"];
        if (string.IsNullOrEmpty(configPath))
        {
            return null;
        }

        var fullPath = Path.Combine(configPath, templateName);
        return File.Exists(fullPath) ? fullPath : null;
    }

    /// <summary>
    /// 策略2: 从相对路径查找模板
    /// </summary>
    private string? TryGetTemplateFromRelativePath(string templateName)
    {
        var relativePath = Path.Combine("templates", templateName);
        if (File.Exists(relativePath))
        {
            return Path.GetFullPath(relativePath);
        }

        // 也尝试当前目录
        var currentDirPath = Path.Combine(Directory.GetCurrentDirectory(), "templates", templateName);
        return File.Exists(currentDirPath) ? currentDirPath : null;
    }

    /// <summary>
    /// 策略3: 从解决方案根目录查找模板
    /// </summary>
    private string? TryGetTemplateFromSolutionRoot(string templateName)
    {
        var solutionRoot = FindSolutionRoot();
        if (solutionRoot == null)
        {
            return null;
        }

        var solutionTemplatePath = Path.Combine(solutionRoot, "templates", templateName);
        return File.Exists(solutionTemplatePath) ? solutionTemplatePath : null;
    }

    /// <summary>
    /// 查找解决方案根目录
    /// </summary>
    private string? FindSolutionRoot()
    {
        var currentDir = new DirectoryInfo(Directory.GetCurrentDirectory());

        while (currentDir != null)
        {
            // 查找 .sln 文件或特定标记文件
            if (currentDir.GetFiles("*.sln").Length > 0 ||
                currentDir.GetFiles("SmartAbp.sln").Length > 0 ||
                Directory.Exists(Path.Combine(currentDir.FullName, "templates")))
            {
                return currentDir.FullName;
            }

            currentDir = currentDir.Parent;
        }

        return null;
    }

    /// <summary>
    /// 策略4: 从内嵌资源获取模板（🏢 企业版特性实现）
    /// </summary>
    private string? TryGetEmbeddedTemplate(string templateName)
    {
        // 🏢 企业版特性：内嵌模板资源提取 - 容器化环境零配置部署
        
        try
        {
            _logger.LogDebug("🔍 尝试从内嵌资源获取模板: {TemplateName}", templateName);
            
            // 🔧 检查模板是否内嵌
            if (!_embeddedTemplateExtractor.IsTemplateEmbedded(templateName))
            {
                _logger.LogDebug("❌ 模板未内嵌到程序集中: {TemplateName}", templateName);
                return null;
            }

            // 🚀 异步提取模板到临时目录
            var extractedPath = _embeddedTemplateExtractor.ExtractTemplateAsync(templateName).GetAwaiter().GetResult();
            
            if (extractedPath != null && File.Exists(extractedPath))
            {
                _logger.LogInformation("✅ 内嵌模板提取成功: {TemplateName} → {ExtractedPath}", templateName, extractedPath);
                return extractedPath;
            }
            else
            {
                _logger.LogWarning("❌ 内嵌模板提取失败或文件不存在: {TemplateName}", templateName);
                return null;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ 内嵌模板提取过程发生异常: {TemplateName}", templateName);
            return null;
        }
    }

    /// <summary>
    /// 获取所有可用的模板文件列表
    /// </summary>
    public List<string> GetAvailableTemplates()
    {
        var templates = new HashSet<string>();

        // 从各个路径收集可用模板
        CollectTemplatesFromPath(_configuration["CodeGeneration:TemplateRootPath"], templates);
        CollectTemplatesFromPath("templates", templates);

        var solutionRoot = FindSolutionRoot();
        if (solutionRoot != null)
        {
            CollectTemplatesFromPath(Path.Combine(solutionRoot, "templates"), templates);
        }

        // 🏢 企业版特性：添加内嵌资源模板列表
        try
        {
            var embeddedTemplates = _embeddedTemplateExtractor.GetAvailableTemplatesAsync().GetAwaiter().GetResult();
            foreach (var template in embeddedTemplates)
            {
                templates.Add(template);
            }
            _logger.LogDebug("📋 发现内嵌模板: {EmbeddedCount} 个", embeddedTemplates.Count);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "⚠️ 获取内嵌模板列表失败，跳过内嵌资源");
        }

        return templates.OrderBy(t => t).ToList();
    }

    /// <summary>
    /// 从指定路径收集模板文件
    /// </summary>
    private void CollectTemplatesFromPath(string? path, HashSet<string> templates)
    {
        if (string.IsNullOrEmpty(path) || !Directory.Exists(path))
        {
            return;
        }

        try
        {
            var templateFiles = Directory.GetFiles(path, "*.template.*", SearchOption.AllDirectories);
            foreach (var file in templateFiles)
            {
                templates.Add(Path.GetFileName(file));
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "收集模板文件失败: {Path}", path);
        }
    }

    /// <summary>
    /// 验证模板路径解析器配置
    /// </summary>
    public TemplatePathValidationResult ValidateConfiguration()
    {
        var result = new TemplatePathValidationResult();

        // 检查配置路径
        var configPath = _configuration["CodeGeneration:TemplateRootPath"];
        result.ConfigPathExists = !string.IsNullOrEmpty(configPath) && Directory.Exists(configPath);

        // 检查相对路径
        result.RelativePathExists = Directory.Exists("templates");

        // 检查解决方案路径
        var solutionRoot = FindSolutionRoot();
        result.SolutionPathExists = solutionRoot != null && Directory.Exists(Path.Combine(solutionRoot, "templates"));

        // 检查内嵌资源
        result.EmbeddedResourcesAvailable = CheckEmbeddedTemplatesAvailable();

        result.IsValid = result.ConfigPathExists || result.RelativePathExists || 
                        result.SolutionPathExists || result.EmbeddedResourcesAvailable;

        return result;
    }

    /// <summary>
    /// 检查是否有可用的内嵌模板资源
    /// </summary>
    private bool CheckEmbeddedTemplatesAvailable()
    {
        try
        {
            var assembly = Assembly.GetExecutingAssembly();
            var resourceNames = assembly.GetManifestResourceNames();
            return resourceNames.Any(name => name.Contains("Templates") && name.Contains("template"));
        }
        catch
        {
            return false;
        }
    }
}

/// <summary>
/// 模板路径验证结果
/// </summary>
public class TemplatePathValidationResult
{
    public bool ConfigPathExists { get; set; }
    public bool RelativePathExists { get; set; }
    public bool SolutionPathExists { get; set; }
    public bool EmbeddedResourcesAvailable { get; set; }
    public bool IsValid { get; set; }

    public string GetValidationSummary()
    {
        var summary = new List<string>();

        if (ConfigPathExists) summary.Add("✅ 配置路径可用");
        else summary.Add("❌ 配置路径不可用");

        if (RelativePathExists) summary.Add("✅ 相对路径可用");
        else summary.Add("❌ 相对路径不可用");

        if (SolutionPathExists) summary.Add("✅ 解决方案路径可用");
        else summary.Add("❌ 解决方案路径不可用");

        if (EmbeddedResourcesAvailable) summary.Add("✅ 内嵌资源可用");
        else summary.Add("❌ 内嵌资源不可用");

        summary.Add($"总体状态: {(IsValid ? "✅ 有效" : "❌ 无效")}");

        return string.Join("\n", summary);
    }
}
