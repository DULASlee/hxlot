using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.DevKit.Core.Abstractions;
using SmartAbp.DevKit.Core.Models;

namespace SmartAbp.DevKit.Core.Platform;

/// <summary>
/// 前端生成器基类（Web、Dashboard、UniApp的共同基础）
/// </summary>
/// <remarks>
/// 【设计理念】
/// BaseFrontendGenerator实现了所有前端生成器的通用逻辑，包括：
/// - 平台适配器管理（PlatformAdapter）
/// - 模板加载与渲染（统一使用Handlebars模板引擎）
/// - 文件生成与写入（统一的文件管理）
/// - 错误处理与日志记录（统一的异常处理）
///
/// 【继承关系】
/// BaseFrontendGenerator (抽象基类)
///   ├─ WebGenerator (Web平台：Vue3 + Element Plus)
///   ├─ DashboardGenerator (Dashboard平台：数字大屏)
///   └─ UniAppGenerator (UniApp平台：移动端APP)
///
/// 【职责划分】
/// 基类职责：
/// - 提供通用的生成流程框架
/// - 管理平台适配器（模板路径、文件类型）
/// - 提供模板渲染的通用方法
/// - 处理文件写入和路径管理
///
/// 子类职责：
/// - 实现平台特定的生成逻辑
/// - 定义平台特定的模板列表
/// - 构建平台特定的元数据
/// - 覆盖平台特定的生成方法
/// </remarks>
public abstract class BaseFrontendGenerator : ICodeGenerator
{
    protected readonly ILogger Logger;
    protected readonly PlatformAdapter PlatformAdapter;
    protected readonly ITemplateEngine TemplateEngine;

    /// <summary>
    /// 目标平台（由子类指定）
    /// </summary>
    protected abstract TargetPlatform Platform { get; }

    /// <summary>
    /// 生成器名称（由子类实现）
    /// </summary>
    public abstract string Name { get; }

    /// <summary>
    /// 生成器描述（由子类实现）
    /// </summary>
    public abstract string Description { get; }

    /// <summary>
    /// 支持的目标层级（前端生成器通常支持Layer2）
    /// </summary>
    public virtual TargetLayer SupportedLayer => TargetLayer.Layer2;

    /// <summary>
    /// 生成器优先级（前端生成器默认优先级为50）
    /// </summary>
    public virtual int Priority => 50;

    /// <summary>
    /// 是否启用（默认启用）
    /// </summary>
    public virtual bool IsEnabled => true;

    /// <summary>
    /// 构造函数
    /// </summary>
    protected BaseFrontendGenerator(
        ILogger logger,
        ITemplateEngine templateEngine,
        PlatformAdapter platformAdapter)
    {
        Logger = logger ?? throw new ArgumentNullException(nameof(logger));
        TemplateEngine = templateEngine ?? throw new ArgumentNullException(nameof(templateEngine));
        PlatformAdapter = platformAdapter ?? throw new ArgumentNullException(nameof(platformAdapter));
    }

    /// <summary>
    /// 生成代码（核心方法 - 模板方法模式）
    /// </summary>
    public async Task<GenerationResult> GenerateAsync(
        GenerationContext context,
        CancellationToken cancellationToken = default)
    {
        var result = new GenerationResult();

        try
        {
            Logger.LogInformation(
                "Starting {Platform} frontend code generation for module: {ModuleName}",
                Platform,
                context.Config.ModuleName);

            // 步骤1: 验证平台模板完整性
            var validationResult = PlatformAdapter.ValidatePlatformTemplates(Platform);
            if (!validationResult.IsValid)
            {
                result.IsSuccess = false;
                result.ErrorMessage = $"Template validation failed: {string.Join(", ", validationResult.Errors)}";
                return result;
            }

            // 步骤2: 构建平台特定的元数据（由子类实现）
            var metadata = await BuildMetadataAsync(context, cancellationToken);

            // 步骤3: 获取需要生成的模板列表（由子类实现）
            var templateTasks = GetGenerationTemplates(context);

            // 步骤4: 批量生成代码
            var generatedFiles = await PlatformAdapter.GenerateFrontendCodeBatchAsync(
                Platform,
                templateTasks);

            // 步骤5: 处理生成结果
            result.GeneratedFiles.AddRange(generatedFiles);

            // 步骤6: 执行平台特定的后处理（由子类可选实现）
            await PostGenerateAsync(context, result, cancellationToken);

            result.IsSuccess = true;

            Logger.LogInformation(
                "Successfully generated {FileCount} files for {Platform} platform",
                result.GeneratedFiles.Count,
                Platform);
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "Failed to generate {Platform} frontend code", Platform);
            result.IsSuccess = false;
            result.ErrorMessage = $"{Platform} generation failed: {ex.Message}";
        }

        return result;
    }

    /// <summary>
    /// 验证生成前的配置（基础验证）
    /// </summary>
    public virtual Task<ValidationResult> ValidateAsync(GenerationContext context)
    {
        var result = new ValidationResult { IsValid = true };

        // 验证模块名称
        if (string.IsNullOrWhiteSpace(context.Config.ModuleName))
        {
            result.IsValid = false;
            result.Errors.Add("Module name is required");
        }

        // 验证实体列表
        if (context.Config.Entities == null || !context.Config.Entities.Any())
        {
            result.IsValid = false;
            result.Errors.Add("At least one entity is required");
        }

        // 验证输出路径
        if (string.IsNullOrWhiteSpace(context.OutputPath))
        {
            result.IsValid = false;
            result.Errors.Add("Output path is required");
        }

        // 验证平台模板
        var templateValidation = PlatformAdapter.ValidatePlatformTemplates(Platform);
        if (!templateValidation.IsValid)
        {
            result.IsValid = false;
            result.Errors.AddRange(templateValidation.Errors);
        }

        return Task.FromResult(result);
    }

    /// <summary>
    /// 获取生成器依赖（前端生成器通常依赖后端生成器）
    /// </summary>
    public virtual string[] GetDependencies()
    {
        return new[]
        {
            "EntityDtoGenerator",    // 需要先生成DTO类型
            "AppServiceGenerator",   // 需要先生成AppService
            "ControllerGenerator"    // 需要先生成Controller
        };
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 抽象方法（由子类必须实现）
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /// <summary>
    /// 构建平台特定的元数据（由子类实现）
    /// </summary>
    /// <remarks>
    /// 不同平台需要的元数据不同：
    /// - Web平台：需要表单字段、表格列、验证规则等
    /// - Dashboard平台：需要KPI指标、图表配置、WebSocket端点等
    /// - UniApp平台：需要页面路由、API配置、离线存储设置等
    /// </remarks>
    protected abstract Task<object> BuildMetadataAsync(
        GenerationContext context,
        CancellationToken cancellationToken);

    /// <summary>
    /// 获取需要生成的模板列表（由子类实现）
    /// </summary>
    /// <remarks>
    /// 不同平台生成的文件不同：
    /// - Web平台：ListPage、FormDialog、DetailDialog、ApiClient、Store
    /// - Dashboard平台：DashboardLayout、KPICard、RealtimeChart、WebSocketClient
    /// - UniApp平台：ListPage、DetailPage、FormPage、PagesJson、Manifest
    /// </remarks>
    protected abstract List<(string TemplateType, object Metadata, string OutputPath)> GetGenerationTemplates(
        GenerationContext context);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 虚方法（子类可选覆盖）
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /// <summary>
    /// 生成后的后处理（子类可选覆盖）
    /// </summary>
    /// <remarks>
    /// 用于平台特定的后处理逻辑，例如：
    /// - Web平台：更新路由配置、注册组件
    /// - Dashboard平台：配置WebSocket连接
    /// - UniApp平台：更新pages.json、manifest.json
    /// </remarks>
    protected virtual Task PostGenerateAsync(
        GenerationContext context,
        GenerationResult result,
        CancellationToken cancellationToken)
    {
        // 默认不做任何后处理
        return Task.CompletedTask;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 辅助方法（供子类使用）
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /// <summary>
    /// 获取平台输出路径
    /// </summary>
    protected string GetPlatformOutputPath(GenerationContext context)
    {
        return PlatformAdapter.GetPlatformOutputPath(Platform, context.OutputPath);
    }

    /// <summary>
    /// 构建模块级别的输出路径
    /// </summary>
    protected string BuildModuleOutputPath(GenerationContext context, string fileName)
    {
        var platformPath = GetPlatformOutputPath(context);
        var modulePath = Path.Combine(platformPath, context.Config.ModuleName.ToLowerInvariant());

        // 确保目录存在
        if (!Directory.Exists(modulePath))
        {
            Directory.CreateDirectory(modulePath);
        }

        return Path.Combine(modulePath, fileName);
    }

    /// <summary>
    /// 将实体属性转换为前端字段配置
    /// </summary>
    protected List<FrontendFieldConfig> MapEntityPropertiesToFields(List<SmartAbp.DevKit.Abstractions.Models.GeneralEntityField> properties)
    {
        return properties.Select(prop => new FrontendFieldConfig
        {
            Name = prop.Name,
            Type = MapCSharpTypeToFrontendType(prop.DataType),
            Label = ConvertToLabel(prop.Name),
            IsRequired = prop.IsRequired,
            MaxLength = prop.MaxLength,
            DefaultValue = prop.DefaultValue,
            DisplayOrder = prop.DisplayOrder
        }).ToList();
    }

    /// <summary>
    /// 映射C#类型到前端类型
    /// </summary>
    protected string MapCSharpTypeToFrontendType(string csharpType)
    {
        return csharpType.ToLowerInvariant() switch
        {
            "string" => "string",
            "int" or "long" or "short" or "byte" => "number",
            "decimal" or "double" or "float" => "number",
            "bool" or "boolean" => "boolean",
            "datetime" or "datetimeoffset" => "Date",
            "guid" => "string",
            _ => "string"
        };
    }

    /// <summary>
    /// 转换属性名为显示标签
    /// </summary>
    protected string ConvertToLabel(string propertyName)
    {
        // 简单实现：将PascalCase转换为带空格的标签
        // 例如：UserName -> User Name
        var result = System.Text.RegularExpressions.Regex.Replace(
            propertyName,
            "([A-Z])",
            " $1").Trim();

        return char.ToUpper(result[0]) + result.Substring(1);
    }

    /// <summary>
    /// 日志记录：生成文件信息
    /// </summary>
    protected void LogGeneratedFile(string filePath, string templateType)
    {
        Logger.LogDebug(
            "Generated {TemplateType} file: {FilePath}",
            templateType,
            filePath);
    }
}

/// <summary>
/// 前端字段配置（用于模板渲染）
/// </summary>
public class FrontendFieldConfig
{
    /// <summary>
    /// 字段名称（camelCase）
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// 前端类型（string、number、boolean、Date等）
    /// </summary>
    public string Type { get; set; } = string.Empty;

    /// <summary>
    /// 显示标签
    /// </summary>
    public string Label { get; set; } = string.Empty;

    /// <summary>
    /// 是否必填
    /// </summary>
    public bool IsRequired { get; set; }

    /// <summary>
    /// 是否必填（别名，用于兼容性）
    /// </summary>
    public bool Required
    {
        get => IsRequired;
        set => IsRequired = value;
    }

    /// <summary>
    /// 显示顺序
    /// </summary>
    public int DisplayOrder { get; set; }

    /// <summary>
    /// 最大长度（用于string类型）
    /// </summary>
    public int? MaxLength { get; set; }

    /// <summary>
    /// 默认值
    /// </summary>
    public string? DefaultValue { get; set; }

    /// <summary>
    /// 控件类型（input、select、datepicker等）
    /// </summary>
    public string ControlType { get; set; } = "input";

    /// <summary>
    /// 是否在列表中显示
    /// </summary>
    public bool ShowInList { get; set; } = true;

    /// <summary>
    /// 是否在表单中显示
    /// </summary>
    public bool ShowInForm { get; set; } = true;

    /// <summary>
    /// 是否可搜索
    /// </summary>
    public bool IsSearchable { get; set; } = false;

    /// <summary>
    /// 是否可排序
    /// </summary>
    public bool IsSortable { get; set; } = true;

    /// <summary>
    /// 显示顺序
    /// </summary>
    public int DisplayOrder { get; set; }
}

