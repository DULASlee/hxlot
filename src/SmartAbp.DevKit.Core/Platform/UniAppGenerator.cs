using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.DevKit.Core.Abstractions;
using SmartAbp.DevKit.Core.Models;
using SmartAbp.DevKit.Abstractions.Models;

namespace SmartAbp.DevKit.Core.Platform;

/// <summary>
/// UniApp平台生成器（移动端APP）
/// </summary>
/// <remarks>
/// 【职责】
/// UniAppGenerator负责生成UniApp移动端应用的前端代码，包括：
/// - 列表页面（ListPage.vue）
/// - 详情页面（DetailPage.vue）
/// - 表单页面（FormPage.vue）
/// - API客户端（api-client.ts）
/// - Pinia Store（store.ts）
/// - 页面配置（pages.json）
/// - 应用配置（manifest.json）
/// 
/// 【技术栈】
/// - Vue 3 Composition API + `<script setup>`
/// - UniApp API（uni.request、uni.navigateTo、uni.showToast等）
/// - Pinia 状态管理
/// - TypeScript 类型安全
/// - uni-ui 组件库
/// - 离线数据同步（Storage API）
/// 
/// 【数据流架构】
/// API Server → API Client (uni.request) → Pinia Store → UniApp Pages
///                                              ↓
///                                       Offline Storage（离线缓存）
///                                              ↓
///                                       Sync Manager（数据同步）
/// 
/// 【生成流程】
/// 1. 验证实体元数据完整性
/// 2. 构建UniApp平台特定的模板数据（页面路由、API配置、Storage配置）
/// 3. 使用PlatformAdapter批量生成代码
/// 4. 配置pages.json和manifest.json（后处理）
/// </remarks>
public class UniAppGenerator : BaseFrontendGenerator
{
    private readonly ILogger<UniAppGenerator> _logger;
    private readonly ComponentLibraryConfig _componentLibrary;

    /// <summary>
    /// 目标平台：UniApp
    /// </summary>
    protected override TargetPlatform Platform => TargetPlatform.UniApp;

    /// <summary>
    /// 生成器名称
    /// </summary>
    public override string Name => "UniAppGenerator";

    /// <summary>
    /// 生成器描述
    /// </summary>
    public override string Description => "Generate UniApp mobile APP code based on uView UI/Wot Design (Pages/API/Store/Config)";

    /// <summary>
    /// 优先级：UniApp生成器优先级为60（低于Dashboard，高于Web）
    /// </summary>
    public override int Priority => 60;

    /// <summary>
    /// 构造函数
    /// </summary>
    public UniAppGenerator(
        ILogger<UniAppGenerator> logger,
        ITemplateEngine templateEngine,
        PlatformAdapter platformAdapter,
        ComponentLibraryConfig? componentLibrary = null)
        : base(logger, templateEngine, platformAdapter)
    {
        _logger = logger;
        _componentLibrary = componentLibrary ?? ComponentLibraryConfig.GetDefaultUViewConfig();
        
        _logger.LogInformation(
            "UniAppGenerator initialized with {ComponentLibrary} {Version}", 
            _componentLibrary.Name, 
            _componentLibrary.Version);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 抽象方法实现（必须实现）
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /// <summary>
    /// 构建UniApp平台特定的元数据
    /// </summary>
    protected override Task<object> BuildMetadataAsync(
        GenerationContext context,
        CancellationToken cancellationToken)
    {
        _logger.LogDebug("Building UniApp platform metadata for module: {ModuleName}", context.Config.ModuleName);

        // 获取主实体（第一个实体作为主实体）
        var mainEntity = context.Config.Entities.FirstOrDefault()
            ?? throw new InvalidOperationException("No entities found in configuration");

        // 转换属性为前端字段配置
        var fields = MapEntityPropertiesToFields(mainEntity.Fields);

        // 识别列表页面显示字段（前5个非系统字段）
        var listFields = fields
            .Where(f => !IsSystemField(f.Name))
            .Take(5)
            .ToList();

        // 识别表单字段（排除系统字段）并映射到uView组件
        var formFields = fields
            .Where(f => !IsSystemField(f.Name))
            .Select(f => new FrontendFieldConfigWithComponent
            {
                Name = f.Name,
                Label = f.Label,
                Type = f.Type,
                Required = f.IsRequired,
                MaxLength = f.MaxLength,
                DisplayOrder = f.DisplayOrder,
                
                // 🎯 核心：映射字段类型到uView组件
                Component = MapToComponentLibrary(f.Type),
                
                // 映射验证规则到uView格式
                ValidationRules = MapValidationRules(f.IsRequired, f.MaxLength, f.Type)
            })
            .ToList();

        // 识别搜索字段（字符串类型字段）
        var searchFields = fields
            .Where(f => f.Type == "string" && !IsSystemField(f.Name))
            .Take(3)
            .ToList();

        // 构建UniApp特定的元数据
        var metadata = new UniAppViewMetadata
        {
            ModuleName = context.Config.ModuleName,
            EntityName = mainEntity.Name,
            EntityNamePlural = Pluralize(mainEntity.Name),
            EntityNameCamel = ToCamelCase(mainEntity.Name),
            EntityNameKebab = ToKebabCase(mainEntity.Name),

            PrimaryKeyType = mainEntity.PrimaryKeyType ?? "Guid",
            PrimaryKeyTypeScript = MapCSharpTypeToTypeScript(mainEntity.PrimaryKeyType ?? "Guid"),

            // 🎯 组件库信息（新增）
            ComponentLibrary = _componentLibrary.Name,
            ComponentLibraryVersion = _componentLibrary.Version,
            ComponentLibraryPackage = _componentLibrary.PackageName,

            // 所有字段
            Fields = fields,

            // 列表页面显示字段
            ListFields = listFields,

            // 表单字段（带组件映射）
            FormFields = formFields,

            // 搜索字段
            SearchFields = searchFields,

            // API路由
            ApiPath = $"/api/app/{ToKebabCase(Pluralize(mainEntity.Name))}",

            // 页面路由配置
            PageRoutes = new UniAppPageRoutes
            {
                ListPage = $"/pages/{ToKebabCase(mainEntity.Name)}/list",
                DetailPage = $"/pages/{ToKebabCase(mainEntity.Name)}/detail",
                FormPage = $"/pages/{ToKebabCase(mainEntity.Name)}/form"
            },

            // UniApp配置
            UniAppConfig = new UniAppConfig
            {
                EnablePullDownRefresh = true,
                EnableReachBottom = true,
                BackgroundColor = "#f8f8f8",
                NavigationBarTitleText = $"{mainEntity.Name}管理",
                NavigationBarBackgroundColor = "#007aff",
                NavigationBarTextStyle = "white"
            },

            // 离线同步配置
            OfflineConfig = new OfflineConfig
            {
                EnableOfflineCache = true,
                CacheDuration = 3600, // 1小时
                SyncStrategy = "auto", // auto/manual
                MaxCacheSize = 100 // 最多缓存100条数据
            },

            // 时间戳
            GeneratedTime = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"),
            Year = DateTime.Now.Year
        };

        return Task.FromResult<object>(metadata);
    }

    /// <summary>
    /// 获取需要生成的UniApp模板列表
    /// </summary>
    protected override List<(string TemplateType, object Metadata, string OutputPath)> GetGenerationTemplates(
        GenerationContext context)
    {
        var metadata = BuildMetadataAsync(context, CancellationToken.None).Result;
        var uniappMetadata = (UniAppViewMetadata)metadata;

        var templates = new List<(string TemplateType, object Metadata, string OutputPath)>();

        // 🎯 根据组件库类型选择模板后缀
        var templateSuffix = _componentLibrary.Type switch
        {
            ComponentLibraryType.UView => "-uView",
            ComponentLibraryType.WotDesign => "-WotDesign",
            ComponentLibraryType.UniUI => "-UniUI",
            _ => "-uView" // 默认使用uView
        };

        _logger.LogDebug(
            "Using {ComponentLibrary} templates with suffix: {Suffix}",
            _componentLibrary.Name,
            templateSuffix);

        // 1. 列表页面（ListPage-uView.vue）
        var listPagePath = BuildModuleOutputPath(context, $"pages/{uniappMetadata.EntityNameKebab}/list.vue");
        templates.Add(($"ListPage{templateSuffix}", metadata, listPagePath));
        LogGeneratedFile(listPagePath, $"ListPage{templateSuffix}");

        // 2. 详情页面（DetailPage-uView.vue）
        var detailPagePath = BuildModuleOutputPath(context, $"pages/{uniappMetadata.EntityNameKebab}/detail.vue");
        templates.Add(($"DetailPage{templateSuffix}", metadata, detailPagePath));
        LogGeneratedFile(detailPagePath, $"DetailPage{templateSuffix}");

        // 3. 表单页面（FormPage-uView.vue）
        var formPagePath = BuildModuleOutputPath(context, $"pages/{uniappMetadata.EntityNameKebab}/form.vue");
        templates.Add(($"FormPage{templateSuffix}", metadata, formPagePath));
        LogGeneratedFile(formPagePath, $"FormPage{templateSuffix}");

        // 4. API客户端（api-client.ts）- 组件库无关
        var apiClientPath = BuildModuleOutputPath(context, $"api/{uniappMetadata.EntityNameKebab}-api.ts");
        templates.Add(("ApiClient", metadata, apiClientPath));
        LogGeneratedFile(apiClientPath, "ApiClient");

        // 5. Pinia Store（store.ts）- 组件库无关
        var storePath = BuildModuleOutputPath(context, $"stores/{uniappMetadata.EntityNameKebab}-store.ts");
        templates.Add(("Store", metadata, storePath));
        LogGeneratedFile(storePath, "Store");

        // 6. TypeScript类型定义（types.ts）- 组件库无关
        var typesPath = BuildModuleOutputPath(context, $"types/{uniappMetadata.EntityNameKebab}.types.ts");
        templates.Add(("types", metadata, typesPath));
        LogGeneratedFile(typesPath, "types");

        _logger.LogInformation(
            "Prepared {Count} UniApp templates for entity: {EntityName} using {ComponentLibrary}",
            templates.Count,
            uniappMetadata.EntityName,
            _componentLibrary.Name);

        return templates;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 可选的后处理逻辑
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /// <summary>
    /// UniApp生成后的后处理：更新pages.json配置
    /// </summary>
    protected override async Task PostGenerateAsync(
        GenerationContext context,
        GenerationResult result,
        CancellationToken cancellationToken)
    {
        _logger.LogDebug("Executing post-generation tasks for UniApp platform");

        try
        {
            // TODO: 可选的后处理任务
            // 1. 更新pages.json（添加新页面路由）
            // 2. 更新manifest.json（更新权限配置）
            // 3. 生成API接口文档
            // 4. 配置离线同步策略

            _logger.LogInformation("UniApp platform post-generation completed");

            await Task.CompletedTask;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "UniApp platform post-generation encountered issues");
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // UniApp特有辅助方法
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /// <summary>
    /// 映射字段类型到组件库组件
    /// </summary>
    /// <param name="fieldType">字段类型（string/int/DateTime等）</param>
    /// <returns>组件库组件名称（u-input/u-number-box等）</returns>
    private string MapToComponentLibrary(string fieldType)
    {
        // 优先从配置中查找映射
        if (_componentLibrary.FieldTypeMapping.TryGetValue(fieldType, out var component))
        {
            return component;
        }

        // 降级到默认映射
        return fieldType.ToLowerInvariant() switch
        {
            "string" => _componentLibrary.Type == ComponentLibraryType.UView ? "u-input" : "wd-input",
            "int" or "long" or "decimal" or "double" => 
                _componentLibrary.Type == ComponentLibraryType.UView ? "u-number-box" : "wd-input-number",
            "datetime" => 
                _componentLibrary.Type == ComponentLibraryType.UView ? "u-datetime-picker" : "wd-datetime-picker",
            "bool" => 
                _componentLibrary.Type == ComponentLibraryType.UView ? "u-switch" : "wd-switch",
            "enum" => 
                _componentLibrary.Type == ComponentLibraryType.UView ? "u-select" : "wd-select",
            _ => _componentLibrary.Type == ComponentLibraryType.UView ? "u-input" : "wd-input"
        };
    }

    /// <summary>
    /// 映射验证规则到uView/Wot Design格式
    /// </summary>
    private List<string> MapValidationRules(bool required, int? maxLength, string fieldType)
    {
        var rules = new List<string>();

        // Required规则
        if (required)
        {
            if (_componentLibrary.ValidationMapping.TryGetValue("required", out var requiredRule))
            {
                var rule = _componentLibrary.Type == ComponentLibraryType.UView 
                    ? requiredRule.UViewRule 
                    : requiredRule.WotDesignRule;
                    
                if (!string.IsNullOrEmpty(rule))
                {
                    rules.Add(rule.Replace("{message}", "此字段为必填项"));
                }
            }
        }

        // MaxLength规则
        if (maxLength.HasValue && maxLength.Value > 0)
        {
            if (_componentLibrary.ValidationMapping.TryGetValue("maxLength", out var maxLengthRule))
            {
                var rule = _componentLibrary.Type == ComponentLibraryType.UView 
                    ? maxLengthRule.UViewRule 
                    : maxLengthRule.WotDesignRule;
                    
                if (!string.IsNullOrEmpty(rule))
                {
                    rules.Add(rule
                        .Replace("{value}", maxLength.Value.ToString())
                        .Replace("{message}", $"最大长度为{maxLength.Value}"));
                }
            }
        }

        // Email规则
        if (fieldType.Equals("email", StringComparison.OrdinalIgnoreCase))
        {
            if (_componentLibrary.ValidationMapping.TryGetValue("email", out var emailRule))
            {
                var rule = _componentLibrary.Type == ComponentLibraryType.UView 
                    ? emailRule.UViewRule 
                    : emailRule.WotDesignRule;
                    
                if (!string.IsNullOrEmpty(rule))
                {
                    rules.Add(rule.Replace("{message}", "请输入有效的邮箱地址"));
                }
            }
        }

        // Phone规则
        if (fieldType.Equals("phone", StringComparison.OrdinalIgnoreCase))
        {
            if (_componentLibrary.ValidationMapping.TryGetValue("phone", out var phoneRule))
            {
                var rule = _componentLibrary.Type == ComponentLibraryType.UView 
                    ? phoneRule.UViewRule 
                    : phoneRule.WotDesignRule;
                    
                if (!string.IsNullOrEmpty(rule))
                {
                    rules.Add(rule.Replace("{message}", "请输入有效的手机号"));
                }
            }
        }

        return rules;
    }

    /// <summary>
    /// 判断是否为系统字段（不需要在移动端显示）
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
/// UniApp视图元数据（用于模板渲染）
/// </summary>
public class UniAppViewMetadata
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

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎯 组件库信息（新增）
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /// <summary>
    /// 组件库名称（uView/WotDesign）
    /// </summary>
    public string ComponentLibrary { get; set; } = "uView";

    /// <summary>
    /// 组件库版本
    /// </summary>
    public string ComponentLibraryVersion { get; set; } = "2.0.0";

    /// <summary>
    /// 组件库NPM包名
    /// </summary>
    public string ComponentLibraryPackage { get; set; } = "uview-ui";

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 字段配置
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /// <summary>
    /// 所有字段配置
    /// </summary>
    public List<FrontendFieldConfig> Fields { get; set; } = new();

    /// <summary>
    /// 列表页面显示字段
    /// </summary>
    public List<FrontendFieldConfig> ListFields { get; set; } = new();

    /// <summary>
    /// 表单字段（带组件映射）
    /// </summary>
    public List<FrontendFieldConfigWithComponent> FormFields { get; set; } = new();

    /// <summary>
    /// 搜索字段
    /// </summary>
    public List<FrontendFieldConfig> SearchFields { get; set; } = new();

    /// <summary>
    /// API路由路径
    /// </summary>
    public string ApiPath { get; set; } = string.Empty;

    /// <summary>
    /// 页面路由配置
    /// </summary>
    public UniAppPageRoutes PageRoutes { get; set; } = new();

    /// <summary>
    /// UniApp配置
    /// </summary>
    public UniAppConfig UniAppConfig { get; set; } = new();

    /// <summary>
    /// 离线同步配置
    /// </summary>
    public OfflineConfig OfflineConfig { get; set; } = new();

    /// <summary>
    /// 生成时间
    /// </summary>
    public string GeneratedTime { get; set; } = string.Empty;

    /// <summary>
    /// 年份（用于版权信息）
    /// </summary>
    public int Year { get; set; }
}

/// <summary>
/// UniApp页面路由配置
/// </summary>
public class UniAppPageRoutes
{
    /// <summary>
    /// 列表页面路径
    /// </summary>
    public string ListPage { get; set; } = string.Empty;

    /// <summary>
    /// 详情页面路径
    /// </summary>
    public string DetailPage { get; set; } = string.Empty;

    /// <summary>
    /// 表单页面路径
    /// </summary>
    public string FormPage { get; set; } = string.Empty;
}

/// <summary>
/// UniApp配置
/// </summary>
public class UniAppConfig
{
    /// <summary>
    /// 是否启用下拉刷新
    /// </summary>
    public bool EnablePullDownRefresh { get; set; } = true;

    /// <summary>
    /// 是否启用上拉加载
    /// </summary>
    public bool EnableReachBottom { get; set; } = true;

    /// <summary>
    /// 背景颜色
    /// </summary>
    public string BackgroundColor { get; set; } = "#f8f8f8";

    /// <summary>
    /// 导航栏标题
    /// </summary>
    public string NavigationBarTitleText { get; set; } = string.Empty;

    /// <summary>
    /// 导航栏背景颜色
    /// </summary>
    public string NavigationBarBackgroundColor { get; set; } = "#007aff";

    /// <summary>
    /// 导航栏文字样式（white/black）
    /// </summary>
    public string NavigationBarTextStyle { get; set; } = "white";
}

/// <summary>
/// 离线同步配置
/// </summary>
public class OfflineConfig
{
    /// <summary>
    /// 是否启用离线缓存
    /// </summary>
    public bool EnableOfflineCache { get; set; } = true;

    /// <summary>
    /// 缓存时长（秒）
    /// </summary>
    public int CacheDuration { get; set; } = 3600;

    /// <summary>
    /// 同步策略（auto/manual）
    /// </summary>
    public string SyncStrategy { get; set; } = "auto";

    /// <summary>
    /// 最大缓存数量
    /// </summary>
    public int MaxCacheSize { get; set; } = 100;
}

/// <summary>
/// 前端字段配置（带组件映射）
/// </summary>
public class FrontendFieldConfigWithComponent
{
    /// <summary>
    /// 字段名称
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// 字段标签
    /// </summary>
    public string Label { get; set; } = string.Empty;

    /// <summary>
    /// 字段类型
    /// </summary>
    public string Type { get; set; } = string.Empty;

    /// <summary>
    /// 是否必填
    /// </summary>
    public bool Required { get; set; }

    /// <summary>
    /// 最大长度
    /// </summary>
    public int? MaxLength { get; set; }

    /// <summary>
    /// 显示顺序
    /// </summary>
    public int DisplayOrder { get; set; }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎯 组件映射（新增）
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /// <summary>
    /// 映射的组件名称（u-input/u-number-box/wd-input等）
    /// </summary>
    public string Component { get; set; } = string.Empty;

    /// <summary>
    /// 验证规则列表（uView/Wot Design格式）
    /// </summary>
    public List<string> ValidationRules { get; set; } = new();
}

