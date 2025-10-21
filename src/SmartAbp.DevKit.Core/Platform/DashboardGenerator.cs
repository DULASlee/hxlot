using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.DevKit.Core.Abstractions;
using SmartAbp.DevKit.Core.Models;

namespace SmartAbp.DevKit.Core.Platform;

/// <summary>
/// Dashboard平台生成器（数字大屏）
/// </summary>
/// <remarks>
/// 【职责】
/// DashboardGenerator负责生成数字大屏应用的前端代码，包括：
/// - Dashboard布局页面（DashboardLayout.vue）
/// - KPI指标卡片（KPICard.vue）
/// - 实时图表组件（RealtimeChart.vue）
/// - WebSocket客户端（websocket-client.ts）
/// - 实时数据Store（realtime-store.ts）
/// - 数据聚合器（data-aggregator.ts）
/// 
/// 【技术栈】
/// - Vue 3 Composition API + `<script setup>`
/// - ECharts 数据可视化（实时图表、大屏组件）
/// - WebSocket 实时数据通信（SignalR或原生WebSocket）
/// - Pinia 实时状态管理（响应式数据流）
/// - TypeScript 类型安全
/// - CSS Grid/Flexbox 大屏布局（自适应设计）
/// 
/// 【数据流架构】
/// WebSocket Server → WebSocket Client → Realtime Store → Dashboard Components
///                                              ↓
///                                       Data Aggregator（数据聚合、计算）
///                                              ↓
///                                       ECharts Reactive Update（图表实时更新）
/// 
/// 【生成流程】
/// 1. 验证实体元数据完整性
/// 2. 构建Dashboard平台特定的模板数据（KPI配置、图表配置、WebSocket端点）
/// 3. 使用PlatformAdapter批量生成代码
/// 4. 配置WebSocket连接（可选后处理）
/// </remarks>
public class DashboardGenerator : BaseFrontendGenerator
{
    private readonly ILogger<DashboardGenerator> _logger;

    /// <summary>
    /// 目标平台：Dashboard
    /// </summary>
    protected override TargetPlatform Platform => TargetPlatform.Dashboard;

    /// <summary>
    /// 生成器名称
    /// </summary>
    public override string Name => "DashboardGenerator";

    /// <summary>
    /// 生成器描述
    /// </summary>
    public override string Description => "Generate Digital Dashboard frontend code (Layout/KPI/Charts/WebSocket/Realtime)";

    /// <summary>
    /// 优先级：Dashboard生成器优先级为65（高于Web生成器）
    /// </summary>
    public override int Priority => 65;

    /// <summary>
    /// 构造函数
    /// </summary>
    public DashboardGenerator(
        ILogger<DashboardGenerator> logger,
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
    /// 构建Dashboard平台特定的元数据
    /// </summary>
    protected override Task<object> BuildMetadataAsync(
        GenerationContext context,
        CancellationToken cancellationToken)
    {
        _logger.LogDebug("Building Dashboard platform metadata for module: {ModuleName}", context.Config.ModuleName);

        // 获取主实体（第一个实体作为主实体）
        var mainEntity = context.Config.Entities.FirstOrDefault()
            ?? throw new InvalidOperationException("No entities found in configuration");

        // 转换属性为前端字段配置
        var fields = MapEntityPropertiesToFields(mainEntity.Fields);

        // 识别KPI字段（数值类型字段）
        var kpiFields = fields
            .Where(f => f.Type == "number")
            .ToList();

        // 识别时间序列字段（用于实时图表）
        var timeSeriesFields = fields
            .Where(f => f.Type == "Date" || f.Name.Contains("Time", StringComparison.OrdinalIgnoreCase))
            .ToList();

        // 构建Dashboard特定的元数据
        var metadata = new DashboardViewMetadata
        {
            ModuleName = context.Config.ModuleName,
            EntityName = mainEntity.Name,
            EntityNamePlural = Pluralize(mainEntity.Name),
            EntityNameCamel = ToCamelCase(mainEntity.Name),
            EntityNameKebab = ToKebabCase(mainEntity.Name),

            PrimaryKeyType = mainEntity.PrimaryKeyType ?? "Guid",
            PrimaryKeyTypeScript = MapCSharpTypeToTypeScript(mainEntity.PrimaryKeyType ?? "Guid"),

            // 所有字段
            Fields = fields,

            // KPI指标字段（用于KPI卡片）
            KpiFields = kpiFields.Take(6).ToList(), // 最多显示6个KPI

            // 时间序列字段（用于实时图表）
            TimeSeriesFields = timeSeriesFields,

            // 实时数据字段（用于实时更新）
            RealtimeFields = fields
                .Where(f => !IsSystemField(f.Name))
                .ToList(),

            // WebSocket配置
            WebSocketEndpoint = $"/hubs/{ToKebabCase(mainEntity.Name)}",
            WebSocketNamespace = $"{mainEntity.Name}Hub",

            // API路由
            ApiPath = $"/api/app/{ToKebabCase(Pluralize(mainEntity.Name))}",

            // 大屏布局配置
            DashboardConfig = new DashboardLayoutConfig
            {
                GridColumns = 24, // 24列栅格系统
                GridRows = 12,    // 12行栅格系统
                RefreshInterval = 5000, // 5秒刷新间隔
                EnableAutoRefresh = true,
                EnableFullscreen = true,
                Theme = "dark" // 大屏默认使用暗色主题
            },

            // 图表配置
            ChartConfigs = BuildChartConfigs(kpiFields, timeSeriesFields),

            // 时间戳
            GeneratedTime = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"),
            Year = DateTime.Now.Year
        };

        return Task.FromResult<object>(metadata);
    }

    /// <summary>
    /// 获取需要生成的Dashboard模板列表
    /// </summary>
    protected override List<(string TemplateType, object Metadata, string OutputPath)> GetGenerationTemplates(
        GenerationContext context)
    {
        var metadata = BuildMetadataAsync(context, CancellationToken.None).Result;
        var dashboardMetadata = (DashboardViewMetadata)metadata;

        var templates = new List<(string TemplateType, object Metadata, string OutputPath)>();

        // 1. Dashboard布局页面（DashboardLayout.vue）
        var layoutPath = BuildModuleOutputPath(context, $"{dashboardMetadata.EntityName}Dashboard.vue");
        templates.Add(("DashboardLayout", metadata, layoutPath));
        LogGeneratedFile(layoutPath, "DashboardLayout");

        // 2. KPI卡片组件（KPICard.vue）
        var kpiCardPath = BuildModuleOutputPath(context, $"{dashboardMetadata.EntityName}KPICard.vue");
        templates.Add(("KPICard", metadata, kpiCardPath));
        LogGeneratedFile(kpiCardPath, "KPICard");

        // 3. 实时图表组件（RealtimeChart.vue）
        var chartPath = BuildModuleOutputPath(context, $"{dashboardMetadata.EntityName}RealtimeChart.vue");
        templates.Add(("RealtimeChart", metadata, chartPath));
        LogGeneratedFile(chartPath, "RealtimeChart");

        // 4. WebSocket客户端（websocket-client.ts）
        var wsClientPath = BuildModuleOutputPath(context, "websocket-client.ts");
        templates.Add(("WebSocketClient", metadata, wsClientPath));
        LogGeneratedFile(wsClientPath, "WebSocketClient");

        // 5. 实时数据Store（realtime-store.ts）
        var storePath = BuildModuleOutputPath(context, "realtime-store.ts");
        templates.Add(("Store", metadata, storePath));
        LogGeneratedFile(storePath, "RealtimeStore");

        // 6. 数据聚合器（data-aggregator.ts）
        var aggregatorPath = BuildModuleOutputPath(context, "data-aggregator.ts");
        templates.Add(("DataAggregator", metadata, aggregatorPath));
        LogGeneratedFile(aggregatorPath, "DataAggregator");

        _logger.LogInformation(
            "Prepared {Count} Dashboard templates for entity: {EntityName}",
            templates.Count,
            dashboardMetadata.EntityName);

        return templates;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 可选的后处理逻辑
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /// <summary>
    /// Dashboard生成后的后处理：配置WebSocket连接
    /// </summary>
    protected override async Task PostGenerateAsync(
        GenerationContext context,
        GenerationResult result,
        CancellationToken cancellationToken)
    {
        _logger.LogDebug("Executing post-generation tasks for Dashboard platform");

        try
        {
            // TODO: 可选的后处理任务
            // 1. 更新WebSocket Hub注册（后端SignalR配置）
            // 2. 更新路由配置（router/dashboard.ts）
            // 3. 配置大屏主题（theme.scss）
            // 4. 生成大屏访问URL配置

            _logger.LogInformation("Dashboard platform post-generation completed");

            await Task.CompletedTask;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Dashboard platform post-generation encountered issues");
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Dashboard特有辅助方法
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /// <summary>
    /// 构建图表配置
    /// </summary>
    private List<ChartConfig> BuildChartConfigs(
        List<FrontendFieldConfig> kpiFields,
        List<FrontendFieldConfig> timeSeriesFields)
    {
        var configs = new List<ChartConfig>();

        // 为每个KPI字段生成实时折线图配置
        foreach (var kpiField in kpiFields)
        {
            configs.Add(new ChartConfig
            {
                ChartId = $"chart_{ToCamelCase(kpiField.Name)}",
                ChartType = "line",
                Title = kpiField.Label,
                DataField = kpiField.Name,
                XAxisType = "time",
                YAxisType = "value",
                IsRealtime = true,
                MaxDataPoints = 50, // 最多显示50个数据点
                UpdateInterval = 1000 // 1秒更新一次
            });
        }

        // 如果有多个KPI，生成综合对比图
        if (kpiFields.Count > 1)
        {
            configs.Add(new ChartConfig
            {
                ChartId = "chart_overview",
                ChartType = "bar",
                Title = "综合数据对比",
                DataFields = kpiFields.Select(f => f.Name).ToList(),
                XAxisType = "category",
                YAxisType = "value",
                IsRealtime = true,
                MaxDataPoints = 10,
                UpdateInterval = 5000 // 5秒更新一次
            });
        }

        return configs;
    }

    /// <summary>
    /// 判断是否为系统字段（不需要在大屏中显示）
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
/// Dashboard视图元数据（用于模板渲染）
/// </summary>
public class DashboardViewMetadata
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
    /// KPI指标字段（用于KPI卡片）
    /// </summary>
    public List<FrontendFieldConfig> KpiFields { get; set; } = new();

    /// <summary>
    /// 时间序列字段（用于实时图表）
    /// </summary>
    public List<FrontendFieldConfig> TimeSeriesFields { get; set; } = new();

    /// <summary>
    /// 实时数据字段（用于实时更新）
    /// </summary>
    public List<FrontendFieldConfig> RealtimeFields { get; set; } = new();

    /// <summary>
    /// WebSocket端点
    /// </summary>
    public string WebSocketEndpoint { get; set; } = string.Empty;

    /// <summary>
    /// WebSocket命名空间
    /// </summary>
    public string WebSocketNamespace { get; set; } = string.Empty;

    /// <summary>
    /// API路由路径
    /// </summary>
    public string ApiPath { get; set; } = string.Empty;

    /// <summary>
    /// Dashboard布局配置
    /// </summary>
    public DashboardLayoutConfig DashboardConfig { get; set; } = new();

    /// <summary>
    /// 图表配置列表
    /// </summary>
    public List<ChartConfig> ChartConfigs { get; set; } = new();

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
/// Dashboard布局配置
/// </summary>
public class DashboardLayoutConfig
{
    /// <summary>
    /// 栅格列数
    /// </summary>
    public int GridColumns { get; set; } = 24;

    /// <summary>
    /// 栅格行数
    /// </summary>
    public int GridRows { get; set; } = 12;

    /// <summary>
    /// 刷新间隔（毫秒）
    /// </summary>
    public int RefreshInterval { get; set; } = 5000;

    /// <summary>
    /// 是否启用自动刷新
    /// </summary>
    public bool EnableAutoRefresh { get; set; } = true;

    /// <summary>
    /// 是否启用全屏模式
    /// </summary>
    public bool EnableFullscreen { get; set; } = true;

    /// <summary>
    /// 主题（dark/light）
    /// </summary>
    public string Theme { get; set; } = "dark";
}

/// <summary>
/// 图表配置
/// </summary>
public class ChartConfig
{
    /// <summary>
    /// 图表ID
    /// </summary>
    public string ChartId { get; set; } = string.Empty;

    /// <summary>
    /// 图表类型（line/bar/pie/gauge等）
    /// </summary>
    public string ChartType { get; set; } = "line";

    /// <summary>
    /// 图表标题
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// 数据字段（单个字段）
    /// </summary>
    public string DataField { get; set; } = string.Empty;

    /// <summary>
    /// 数据字段列表（多个字段）
    /// </summary>
    public List<string> DataFields { get; set; } = new();

    /// <summary>
    /// X轴类型（time/category/value）
    /// </summary>
    public string XAxisType { get; set; } = "time";

    /// <summary>
    /// Y轴类型
    /// </summary>
    public string YAxisType { get; set; } = "value";

    /// <summary>
    /// 是否实时更新
    /// </summary>
    public bool IsRealtime { get; set; } = true;

    /// <summary>
    /// 最大数据点数
    /// </summary>
    public int MaxDataPoints { get; set; } = 50;

    /// <summary>
    /// 更新间隔（毫秒）
    /// </summary>
    public int UpdateInterval { get; set; } = 1000;
}

