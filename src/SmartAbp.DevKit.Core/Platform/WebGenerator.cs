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
/// Web平台生成器（Vue3 + Element Plus）
/// </summary>
/// <remarks>
/// 【职责】
/// WebGenerator负责生成标准Web应用的前端代码，包括：
/// - CRUD列表页面（ListPage.vue）
/// - 表单弹窗组件（FormDialog.vue）
/// - 详情弹窗组件（DetailDialog.vue）
/// - API客户端（api-client.ts）
/// - Pinia状态管理（pinia-store.ts）
/// - TypeScript类型定义（types.ts）
/// 
/// 【技术栈】
/// - Vue 3 Composition API + `<script setup>`
/// - Element Plus UI组件库
/// - TypeScript类型安全
/// - Pinia状态管理
/// - Axios HTTP客户端
/// 
/// 【生成流程】
/// 1. 验证实体元数据完整性
/// 2. 构建Web平台特定的模板数据
/// 3. 使用PlatformAdapter批量生成代码
/// 4. 更新路由配置（可选后处理）
/// </remarks>
public class WebGenerator : BaseFrontendGenerator
{
    private readonly ILogger<WebGenerator> _logger;

    /// <summary>
    /// 目标平台：Web
    /// </summary>
    protected override TargetPlatform Platform => TargetPlatform.Web;

    /// <summary>
    /// 生成器名称
    /// </summary>
    public override string Name => "WebGenerator";

    /// <summary>
    /// 生成器描述
    /// </summary>
    public override string Description => "Generate Vue3 + Element Plus web frontend code (List/Form/Detail/API/Store)";

    /// <summary>
    /// 优先级：Web生成器优先级为60（高于通用前端生成器）
    /// </summary>
    public override int Priority => 60;

    /// <summary>
    /// 构造函数
    /// </summary>
    public WebGenerator(
        ILogger<WebGenerator> logger,
        ITemplateEngine templateEngine,
        PlatformAdapter platformAdapter)
        : base(logger, templateEngine, platformAdapter)
    {
        _logger = logger;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 抽象方法实现（必须实现）
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /// <summary>
    /// 构建Web平台特定的元数据
    /// </summary>
    protected override Task<object> BuildMetadataAsync(
        GenerationContext context,
        CancellationToken cancellationToken)
    {
        _logger.LogDebug("Building Web platform metadata for module: {ModuleName}", context.Config.ModuleName);

        // 获取主实体（第一个实体作为主实体）
        var mainEntity = context.Config.Entities.FirstOrDefault()
            ?? throw new InvalidOperationException("No entities found in configuration");

        // 转换属性为前端字段配置
        var fields = MapEntityPropertiesToFields(mainEntity.Fields);

        // 构建Web特定的元数据
        var metadata = new WebViewMetadata
        {
            ModuleName = context.Config.ModuleName,
            EntityName = mainEntity.Name,
            EntityNamePlural = Pluralize(mainEntity.Name),
            EntityNameCamel = ToCamelCase(mainEntity.Name),
            EntityNameKebab = ToKebabCase(mainEntity.Name),
            
            PrimaryKeyType = mainEntity.PrimaryKeyType ?? "Guid",
            PrimaryKeyTypeScript = MapCSharpTypeToTypeScript(mainEntity.PrimaryKeyType ?? "Guid"),
            
            Fields = fields,
            
            // 表单字段（排除系统字段）
            FormFields = fields
                .Where(f => !IsSystemField(f.Name))
                .ToList(),
            
            // 表格列（用于列表页）
            TableColumns = fields
                .Where(f => f.ShowInList)
                .ToList(),
            
            // 搜索字段（可搜索的字段）
            SearchableFields = fields
                .Where(f => f.IsSearchable)
                .ToList(),
            
            // API路由
            ApiPath = $"/api/app/{ToKebabCase(Pluralize(mainEntity.Name))}",
            
            // 路由配置
            RoutePath = $"/{ToKebabCase(Pluralize(mainEntity.Name))}",
            RouteComponent = $"{mainEntity.Name}List",
            
            // 时间戳
            GeneratedTime = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"),
            Year = DateTime.Now.Year
        };

        return Task.FromResult<object>(metadata);
    }

    /// <summary>
    /// 获取需要生成的Web模板列表
    /// </summary>
    protected override List<(string TemplateType, object Metadata, string OutputPath)> GetGenerationTemplates(
        GenerationContext context)
    {
        var metadata = BuildMetadataAsync(context, CancellationToken.None).Result;
        var webMetadata = (WebViewMetadata)metadata;

        var templates = new List<(string TemplateType, object Metadata, string OutputPath)>();

        // 1. 列表页面（ListPage.vue）
        var listPagePath = BuildModuleOutputPath(context, $"{webMetadata.EntityName}List.vue");
        templates.Add(("ListPage", metadata, listPagePath));
        LogGeneratedFile(listPagePath, "ListPage");

        // 2. 表单弹窗（FormDialog.vue）
        var formDialogPath = BuildModuleOutputPath(context, $"{webMetadata.EntityName}FormDialog.vue");
        templates.Add(("FormDialog", metadata, formDialogPath));
        LogGeneratedFile(formDialogPath, "FormDialog");

        // 3. 详情弹窗（DetailDialog.vue）
        var detailDialogPath = BuildModuleOutputPath(context, $"{webMetadata.EntityName}DetailDialog.vue");
        templates.Add(("DetailDialog", metadata, detailDialogPath));
        LogGeneratedFile(detailDialogPath, "DetailDialog");

        // 4. API Client（api-client.ts）
        var apiClientPath = BuildModuleOutputPath(context, "api-client.ts");
        templates.Add(("ApiClient", metadata, apiClientPath));
        LogGeneratedFile(apiClientPath, "ApiClient");

        // 5. Pinia Store（pinia-store.ts）
        var storePath = BuildModuleOutputPath(context, "store.ts");
        templates.Add(("Store", metadata, storePath));
        LogGeneratedFile(storePath, "Store");

        _logger.LogInformation(
            "Prepared {Count} Web templates for entity: {EntityName}",
            templates.Count,
            webMetadata.EntityName);

        return templates;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 可选的后处理逻辑
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /// <summary>
    /// Web生成后的后处理：更新路由配置
    /// </summary>
    protected override async Task PostGenerateAsync(
        GenerationContext context,
        GenerationResult result,
        CancellationToken cancellationToken)
    {
        _logger.LogDebug("Executing post-generation tasks for Web platform");

        try
        {
            // TODO: 可选的后处理任务
            // 1. 更新路由配置（router/index.ts）
            // 2. 更新菜单配置（menus.ts）
            // 3. 注册全局组件（如需要）

            _logger.LogInformation("Web platform post-generation completed");

            await Task.CompletedTask;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Web platform post-generation encountered issues");
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 辅助方法
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /// <summary>
    /// 判断是否为系统字段（不需要在表单中显示）
    /// </summary>
    private bool IsSystemField(string fieldName)
    {
        var systemFields = new[]
        {
            "Id", "id",
            "CreationTime", "creationTime",
            "CreatorId", "creatorId",
            "LastModificationTime", "lastModificationTime",
            "LastModifierId", "lastModifierId",
            "DeletionTime", "deletionTime",
            "DeleterId", "deleterId",
            "IsDeleted", "isDeleted",
            "ConcurrencyStamp", "concurrencyStamp",
            "ExtraProperties", "extraProperties"
        };

        return systemFields.Contains(fieldName);
    }

    /// <summary>
    /// 复数化实体名称（简单实现）
    /// </summary>
    private string Pluralize(string entityName)
    {
        // 简单的英文复数化规则
        if (entityName.EndsWith("y", StringComparison.OrdinalIgnoreCase))
        {
            return entityName.Substring(0, entityName.Length - 1) + "ies";
        }
        else if (entityName.EndsWith("s", StringComparison.OrdinalIgnoreCase) ||
                 entityName.EndsWith("x", StringComparison.OrdinalIgnoreCase) ||
                 entityName.EndsWith("ch", StringComparison.OrdinalIgnoreCase) ||
                 entityName.EndsWith("sh", StringComparison.OrdinalIgnoreCase))
        {
            return entityName + "es";
        }
        else
        {
            return entityName + "s";
        }
    }

    /// <summary>
    /// 转换为camelCase
    /// </summary>
    private string ToCamelCase(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return value;

        return char.ToLower(value[0]) + value.Substring(1);
    }

    /// <summary>
    /// 转换为kebab-case
    /// </summary>
    private string ToKebabCase(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return value;

        return System.Text.RegularExpressions.Regex.Replace(
            value,
            "([a-z])([A-Z])",
            "$1-$2").ToLower();
    }

    /// <summary>
    /// 映射C#类型到TypeScript类型
    /// </summary>
    private string MapCSharpTypeToTypeScript(string csharpType)
    {
        return csharpType.ToLowerInvariant() switch
        {
            "string" => "string",
            "int" or "long" or "short" or "byte" => "number",
            "decimal" or "double" or "float" => "number",
            "bool" or "boolean" => "boolean",
            "datetime" or "datetimeoffset" => "Date",
            "guid" => "string",
            _ => "any"
        };
    }
}

/// <summary>
/// Web视图元数据（用于模板渲染）
/// </summary>
public class WebViewMetadata
{
    /// <summary>
    /// 模块名称
    /// </summary>
    public string ModuleName { get; set; } = string.Empty;

    /// <summary>
    /// 实体名称（PascalCase）
    /// </summary>
    public string EntityName { get; set; } = string.Empty;

    /// <summary>
    /// 实体名称复数形式
    /// </summary>
    public string EntityNamePlural { get; set; } = string.Empty;

    /// <summary>
    /// 实体名称（camelCase）
    /// </summary>
    public string EntityNameCamel { get; set; } = string.Empty;

    /// <summary>
    /// 实体名称（kebab-case）
    /// </summary>
    public string EntityNameKebab { get; set; } = string.Empty;

    /// <summary>
    /// 主键类型（C#）
    /// </summary>
    public string PrimaryKeyType { get; set; } = "Guid";

    /// <summary>
    /// 主键类型（TypeScript）
    /// </summary>
    public string PrimaryKeyTypeScript { get; set; } = "string";

    /// <summary>
    /// 所有字段配置
    /// </summary>
    public List<FrontendFieldConfig> Fields { get; set; } = new();

    /// <summary>
    /// 表单字段（排除系统字段）
    /// </summary>
    public List<FrontendFieldConfig> FormFields { get; set; } = new();

    /// <summary>
    /// 表格列（用于列表页）
    /// </summary>
    public List<FrontendFieldConfig> TableColumns { get; set; } = new();

    /// <summary>
    /// 可搜索字段
    /// </summary>
    public List<FrontendFieldConfig> SearchableFields { get; set; } = new();

    /// <summary>
    /// API路由路径
    /// </summary>
    public string ApiPath { get; set; } = string.Empty;

    /// <summary>
    /// 前端路由路径
    /// </summary>
    public string RoutePath { get; set; } = string.Empty;

    /// <summary>
    /// 路由组件名
    /// </summary>
    public string RouteComponent { get; set; } = string.Empty;

    /// <summary>
    /// 生成时间
    /// </summary>
    public string GeneratedTime { get; set; } = string.Empty;

    /// <summary>
    /// 年份（用于版权信息）
    /// </summary>
    public int Year { get; set; }
}

