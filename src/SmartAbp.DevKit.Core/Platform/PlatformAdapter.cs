using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.DevKit.Core.Abstractions;
using SmartAbp.DevKit.Core.Models;

namespace SmartAbp.DevKit.Core.Platform;

/// <summary>
/// 平台适配器（管理平台特定的模板路径和配置）
/// </summary>
/// <remarks>
/// 【核心设计理念】
/// PlatformAdapter是多平台架构的核心，负责：
/// 1. 管理不同平台的模板路径（Web/Dashboard/UniApp）
/// 2. 提供平台特定的代码生成逻辑
/// 3. 协调模板引擎进行代码渲染
/// 
/// 【三平台模板路径结构】
/// templates/
/// ├─ web/              # Web平台模板（Vue3 + Element Plus）
/// │  ├─ list-page.hbs
/// │  ├─ form-dialog.hbs
/// │  ├─ detail-dialog.hbs
/// │  ├─ api-client.hbs
/// │  └─ pinia-store.hbs
/// ├─ dashboard/        # Dashboard平台模板（数字大屏）
/// │  ├─ layout.hbs
/// │  ├─ kpi-card.hbs
/// │  ├─ realtime-chart.hbs
/// │  ├─ websocket-client.hbs
/// │  └─ realtime-store.hbs
/// └─ uniapp/           # UniApp平台模板（移动端）
///    ├─ list-page.hbs
///    ├─ detail-page.hbs
///    ├─ form-page.hbs
///    ├─ api-client.hbs
///    ├─ pinia-store.hbs
///    └─ pages.json.hbs
/// </remarks>
public class PlatformAdapter
{
    private readonly ITemplateEngine _templateEngine;
    private readonly ILogger<PlatformAdapter> _logger;
    private readonly Dictionary<TargetPlatform, TemplatePaths> _platformTemplates;
    private readonly string _templateRootPath;

    public PlatformAdapter(
        ITemplateEngine templateEngine,
        ILogger<PlatformAdapter> logger,
        string? templateRootPath = null)
    {
        _templateEngine = templateEngine ?? throw new ArgumentNullException(nameof(templateEngine));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        
        // 默认模板根路径：templates/
        _templateRootPath = templateRootPath ?? Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "templates");
        
        // 初始化平台模板路径
        _platformTemplates = InitializePlatformTemplates();
        
        _logger.LogInformation(
            "PlatformAdapter initialized with template root: {TemplateRoot}",
            _templateRootPath);
    }

    /// <summary>
    /// 初始化平台模板路径映射
    /// </summary>
    private Dictionary<TargetPlatform, TemplatePaths> InitializePlatformTemplates()
    {
        return new Dictionary<TargetPlatform, TemplatePaths>
        {
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // Web平台模板路径（Vue3 + Element Plus）
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            [TargetPlatform.Web] = new TemplatePaths
            {
                Platform = TargetPlatform.Web,
                BasePath = Path.Combine(_templateRootPath, "web"),
                Templates = new Dictionary<string, string>
                {
                    ["ListPage"] = "list-page.hbs",
                    ["FormDialog"] = "form-dialog.hbs",
                    ["DetailDialog"] = "detail-dialog.hbs",
                    ["ApiClient"] = "api-client.hbs",
                    ["Store"] = "pinia-store.hbs",
                    ["Types"] = "types.hbs",
                    ["Router"] = "router.hbs"
                }
            },

            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // Dashboard平台模板路径（数字大屏）
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            [TargetPlatform.Dashboard] = new TemplatePaths
            {
                Platform = TargetPlatform.Dashboard,
                BasePath = Path.Combine(_templateRootPath, "dashboard"),
                Templates = new Dictionary<string, string>
                {
                    ["DashboardLayout"] = "layout.hbs",
                    ["KPICard"] = "kpi-card.hbs",
                    ["RealtimeChart"] = "realtime-chart.hbs",
                    ["WebSocketClient"] = "websocket-client.hbs",
                    ["Store"] = "realtime-store.hbs",
                    ["Types"] = "types.hbs",
                    
                    // MES行业模板
                    ["PLCMonitor"] = "mes/plc-monitor.hbs",
                    ["ProductionLine"] = "mes/production-line.hbs",
                    ["EquipmentStatus"] = "mes/equipment-status.hbs",
                    
                    // 智慧工地行业模板
                    ["VideoSurveillance"] = "construction/video-surveillance.hbs",
                    ["TowerCrane"] = "construction/tower-crane.hbs",
                    ["Elevator"] = "construction/elevator.hbs",
                    ["DustMonitoring"] = "construction/dust-monitoring.hbs"
                }
            },

            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // UniApp平台模板路径（移动端APP）
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            [TargetPlatform.UniApp] = new TemplatePaths
            {
                Platform = TargetPlatform.UniApp,
                BasePath = Path.Combine(_templateRootPath, "uniapp"),
                Templates = new Dictionary<string, string>
                {
                    ["ListPage"] = "list-page.hbs",
                    ["DetailPage"] = "detail-page.hbs",
                    ["FormPage"] = "form-page.hbs",
                    ["ApiClient"] = "api-client.hbs",
                    ["Store"] = "pinia-store.hbs",
                    ["PagesJson"] = "pages.json.hbs",
                    ["ManifestJson"] = "manifest.json.hbs",
                    ["Types"] = "types.hbs",
                    
                    // UniApp专用组件
                    ["EmptyView"] = "components/empty-view.hbs",
                    ["LoadMore"] = "components/load-more.hbs"
                }
            }
        };
    }

    /// <summary>
    /// 生成前端代码（核心方法）
    /// </summary>
    /// <param name="platform">目标平台</param>
    /// <param name="templateType">模板类型（如："ListPage"、"KPICard"等）</param>
    /// <param name="metadata">元数据对象（用于模板渲染）</param>
    /// <returns>生成的代码内容</returns>
    public async Task<string> GenerateFrontendCodeAsync(
        TargetPlatform platform,
        string templateType,
        object metadata)
    {
        // 1. 获取模板路径
        var templatePath = GetTemplatePath(platform, templateType);
        
        _logger.LogDebug(
            "Generating frontend code: Platform={Platform}, TemplateType={TemplateType}, TemplatePath={TemplatePath}",
            platform,
            templateType,
            templatePath);

        // 2. 验证模板文件是否存在
        if (!File.Exists(templatePath))
        {
            var errorMessage = $"Template not found: {templatePath}";
            _logger.LogError(errorMessage);
            throw new FileNotFoundException(errorMessage, templatePath);
        }

        // 3. 使用模板引擎渲染代码
        try
        {
            var content = await _templateEngine.RenderAsync(templatePath, metadata);
            
            _logger.LogDebug(
                "Successfully generated frontend code: Platform={Platform}, TemplateType={TemplateType}, ContentLength={Length}",
                platform,
                templateType,
                content.Length);
            
            return content;
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Failed to generate frontend code: Platform={Platform}, TemplateType={TemplateType}",
                platform,
                templateType);
            throw;
        }
    }

    /// <summary>
    /// 批量生成前端代码
    /// </summary>
    public async Task<List<GeneratedFile>> GenerateFrontendCodeBatchAsync(
        TargetPlatform platform,
        List<(string TemplateType, object Metadata, string OutputPath)> generationTasks)
    {
        var generatedFiles = new List<GeneratedFile>();

        foreach (var (templateType, metadata, outputPath) in generationTasks)
        {
            try
            {
                var content = await GenerateFrontendCodeAsync(platform, templateType, metadata);
                
                generatedFiles.Add(new GeneratedFile
                {
                    Path = outputPath,
                    Content = content,
                    FileType = GetFileTypeByPlatform(platform),
                    OverwriteIfExists = false
                });
            }
            catch (Exception ex)
            {
                _logger.LogWarning(
                    ex,
                    "Failed to generate file: Platform={Platform}, TemplateType={TemplateType}, OutputPath={OutputPath}",
                    platform,
                    templateType,
                    outputPath);
                
                // 继续处理其他文件
                continue;
            }
        }

        return generatedFiles;
    }

    /// <summary>
    /// 获取模板完整路径
    /// </summary>
    public string GetTemplatePath(TargetPlatform platform, string templateType)
    {
        if (!_platformTemplates.TryGetValue(platform, out var templatePaths))
        {
            throw new ArgumentException($"Unsupported platform: {platform}", nameof(platform));
        }

        if (!templatePaths.Templates.TryGetValue(templateType, out var templateFileName))
        {
            throw new ArgumentException(
                $"Template type '{templateType}' not found for platform '{platform}'",
                nameof(templateType));
        }

        return Path.Combine(templatePaths.BasePath, templateFileName);
    }

    /// <summary>
    /// 获取平台支持的所有模板类型
    /// </summary>
    public List<string> GetSupportedTemplateTypes(TargetPlatform platform)
    {
        if (!_platformTemplates.TryGetValue(platform, out var templatePaths))
        {
            return new List<string>();
        }

        return templatePaths.Templates.Keys.ToList();
    }

    /// <summary>
    /// 验证平台模板完整性
    /// </summary>
    public ValidationResult ValidatePlatformTemplates(TargetPlatform platform)
    {
        var result = new ValidationResult { IsValid = true };

        if (!_platformTemplates.TryGetValue(platform, out var templatePaths))
        {
            result.IsValid = false;
            result.Errors.Add($"Platform {platform} not configured");
            return result;
        }

        // 检查基础路径是否存在
        if (!Directory.Exists(templatePaths.BasePath))
        {
            result.Warnings.Add($"Template directory not found: {templatePaths.BasePath}");
            
            // 尝试创建目录
            try
            {
                Directory.CreateDirectory(templatePaths.BasePath);
                _logger.LogInformation("Created template directory: {Path}", templatePaths.BasePath);
            }
            catch (Exception ex)
            {
                result.IsValid = false;
                result.Errors.Add($"Failed to create template directory: {ex.Message}");
                return result;
            }
        }

        // 检查每个模板文件是否存在
        foreach (var (templateType, templateFileName) in templatePaths.Templates)
        {
            var templatePath = Path.Combine(templatePaths.BasePath, templateFileName);
            
            if (!File.Exists(templatePath))
            {
                result.Warnings.Add($"Template file not found: {templateType} -> {templatePath}");
            }
        }

        return result;
    }

    /// <summary>
    /// 获取平台特定的文件类型
    /// </summary>
    private FileType GetFileTypeByPlatform(TargetPlatform platform)
    {
        return platform switch
        {
            TargetPlatform.Web => FileType.Vue,
            TargetPlatform.Dashboard => FileType.DashboardVue,
            TargetPlatform.UniApp => FileType.UniAppVue,
            _ => FileType.Other
        };
    }

    /// <summary>
    /// 获取平台输出路径
    /// </summary>
    public string GetPlatformOutputPath(TargetPlatform platform, string baseOutputPath)
    {
        return platform switch
        {
            TargetPlatform.Web => Path.Combine(baseOutputPath, "src/SmartAbp.Vue/src/views"),
            TargetPlatform.Dashboard => Path.Combine(baseOutputPath, "src/SmartAbp.Vue/src/views/dashboard"),
            TargetPlatform.UniApp => Path.Combine(baseOutputPath, "src/SmartAbp.UniApp/pages"),
            _ => baseOutputPath
        };
    }
}

/// <summary>
/// 模板路径配置
/// </summary>
public class TemplatePaths
{
    /// <summary>
    /// 平台类型
    /// </summary>
    public TargetPlatform Platform { get; set; }

    /// <summary>
    /// 基础路径（如：templates/web、templates/dashboard、templates/uniapp）
    /// </summary>
    public string BasePath { get; set; } = string.Empty;

    /// <summary>
    /// 模板映射（模板类型 → 模板文件名）
    /// </summary>
    /// <remarks>
    /// 示例：
    /// - Web平台: ["ListPage" => "list-page.hbs", "FormDialog" => "form-dialog.hbs"]
    /// - Dashboard平台: ["DashboardLayout" => "layout.hbs", "KPICard" => "kpi-card.hbs"]
    /// - UniApp平台: ["ListPage" => "list-page.hbs", "PagesJson" => "pages.json.hbs"]
    /// </remarks>
    public Dictionary<string, string> Templates { get; set; } = new();
}

