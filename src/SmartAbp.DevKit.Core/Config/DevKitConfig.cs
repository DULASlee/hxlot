using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;

namespace SmartAbp.DevKit.Core.Config;

/// <summary>
/// DevKit配置类
/// 提供代码生成的配置选项
/// </summary>
public class DevKitConfig
{
    /// <summary>
    /// 配置文件默认路径
    /// </summary>
    public const string DefaultConfigPath = "devkit.config.json";

    /// <summary>
    /// 项目命名空间前缀
    /// </summary>
    public string NamespacePrefix { get; set; } = "SmartAbp";

    /// <summary>
    /// 后端项目路径
    /// </summary>
    public BackendConfig Backend { get; set; } = new();

    /// <summary>
    /// 前端项目路径
    /// </summary>
    public FrontendConfig Frontend { get; set; } = new();

    /// <summary>
    /// 模板配置
    /// </summary>
    public TemplateConfig Templates { get; set; } = new();

    /// <summary>
    /// 输出配置
    /// </summary>
    public OutputConfig Output { get; set; } = new();

    /// <summary>
    /// AI流水线配置 ⭐ D爷建议：统一配置管理
    /// </summary>
    public AIFlowConfigSection AIFlow { get; set; } = new();

    /// <summary>
    /// 模板引擎配置 ⭐ D爷建议：统一配置管理
    /// </summary>
    public TemplateEngineConfigSection TemplateEngine { get; set; } = new();

    /// <summary>
    /// 质量门禁配置 ⭐ D爷建议：统一配置管理
    /// </summary>
    public QualityGateConfigSection QualityGate { get; set; } = new();

    /// <summary>
    /// 性能监控配置 ⭐ D爷建议：统一配置管理
    /// </summary>
    public PerformanceConfigSection Performance { get; set; } = new();

    /// <summary>
    /// 从JSON文件加载配置
    /// </summary>
    public static DevKitConfig Load(string configPath = DefaultConfigPath)
    {
        if (!File.Exists(configPath))
        {
            // 返回默认配置
            return new DevKitConfig();
        }

        var json = File.ReadAllText(configPath);
        return JsonSerializer.Deserialize<DevKitConfig>(json, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            WriteIndented = true
        }) ?? new DevKitConfig();
    }

    /// <summary>
    /// 保存配置到JSON文件
    /// </summary>
    public void Save(string configPath = DefaultConfigPath)
    {
        var json = JsonSerializer.Serialize(this, new JsonSerializerOptions
        {
            WriteIndented = true
        });
        File.WriteAllText(configPath, json);
    }

    /// <summary>
    /// 创建默认配置文件
    /// </summary>
    public static void CreateDefault(string configPath = DefaultConfigPath)
    {
        var defaultConfig = new DevKitConfig();
        defaultConfig.Save(configPath);
    }
}

/// <summary>
/// 后端配置
/// </summary>
public class BackendConfig
{
    /// <summary>
    /// 应用服务层命名空间
    /// </summary>
    public string ApplicationNamespace { get; set; } = "Application";

    /// <summary>
    /// 应用服务契约层命名空间
    /// </summary>
    public string ContractsNamespace { get; set; } = "Application.Contracts";

    /// <summary>
    /// 领域层命名空间
    /// </summary>
    public string DomainNamespace { get; set; } = "Domain.Entities";

    /// <summary>
    /// HTTP API层命名空间
    /// </summary>
    public string HttpApiNamespace { get; set; } = "HttpApi.Controllers";

    /// <summary>
    /// 单元测试命名空间
    /// </summary>
    public string TestsNamespace { get; set; } = "Application.Tests";

    /// <summary>
    /// 输出路径配置
    /// </summary>
    public Dictionary<string, string> OutputPaths { get; set; } = new()
    {
        { "Application", "src/{NamespacePrefix}.Application" },
        { "Contracts", "src/{NamespacePrefix}.Application.Contracts" },
        { "HttpApi", "src/{NamespacePrefix}.HttpApi" },
        { "Tests", "src/{NamespacePrefix}.Application.Tests" }
    };
}

/// <summary>
/// 前端配置
/// </summary>
public class FrontendConfig
{
    /// <summary>
    /// 前端项目根路径
    /// </summary>
    public string RootPath { get; set; } = "src/{NamespacePrefix}.Vue";

    /// <summary>
    /// 视图文件路径
    /// </summary>
    public string ViewsPath { get; set; } = "src/views";

    /// <summary>
    /// API客户端路径
    /// </summary>
    public string ApiPath { get; set; } = "src/api";

    /// <summary>
    /// 类型定义路径
    /// </summary>
    public string TypesPath { get; set; } = "src/types";

    /// <summary>
    /// API基础路径前缀
    /// </summary>
    public string ApiBaseUrl { get; set; } = "/api/app";
}

/// <summary>
/// 模板配置
/// </summary>
public class TemplateConfig
{
    /// <summary>
    /// 模板根路径
    /// </summary>
    public string RootPath { get; set; } = "Templates";

    /// <summary>
    /// 后端模板路径
    /// </summary>
    public string BackendPath { get; set; } = "Templates/Backend";

    /// <summary>
    /// 前端模板路径
    /// </summary>
    public string FrontendPath { get; set; } = "Templates/Frontend";

    /// <summary>
    /// 是否使用自定义模板
    /// </summary>
    public bool UseCustomTemplates { get; set; } = false;

    /// <summary>
    /// 自定义模板路径
    /// </summary>
    public string? CustomTemplatePath { get; set; }
}

/// <summary>
/// 输出配置
/// </summary>
public class OutputConfig
{
    /// <summary>
    /// 是否覆盖已存在的文件
    /// </summary>
    public bool OverwriteExistingFiles { get; set; } = false;

    /// <summary>
    /// 是否生成备份
    /// </summary>
    public bool CreateBackups { get; set; } = true;

    /// <summary>
    /// 备份路径
    /// </summary>
    public string BackupPath { get; set; } = ".backup";

    /// <summary>
    /// 是否格式化生成的代码
    /// </summary>
    public bool FormatGeneratedCode { get; set; } = true;

    /// <summary>
    /// 生成时添加的版权声明
    /// </summary>
    public string? CopyrightHeader { get; set; }

    /// <summary>
    /// 生成日志级别
    /// </summary>
    public LogLevel LogLevel { get; set; } = LogLevel.Information;
}

/// <summary>
/// 日志级别
/// </summary>
public enum LogLevel
{
    Debug,
    Information,
    Warning,
    Error
}

/// <summary>
/// AI流水线配置节 ⭐ D爷建议
/// </summary>
public class AIFlowConfigSection
{
    /// <summary>
    /// 工位执行超时时间（秒）
    /// </summary>
    public int TimeoutSeconds { get; set; } = 30;

    /// <summary>
    /// 最大重试次数
    /// </summary>
    public int MaxRetries { get; set; } = 3;

    /// <summary>
    /// 断路器失败阈值
    /// </summary>
    public int CircuitBreakerFailureThreshold { get; set; } = 5;

    /// <summary>
    /// 断路器重置超时时间（秒）
    /// </summary>
    public int CircuitBreakerResetTimeoutSeconds { get; set; } = 30;

    /// <summary>
    /// 启用中间件管道
    /// </summary>
    public bool EnableMiddlewarePipeline { get; set; } = true;

    /// <summary>
    /// 启用日志中间件
    /// </summary>
    public bool EnableLoggingMiddleware { get; set; } = true;

    /// <summary>
    /// 启用性能监控中间件
    /// </summary>
    public bool EnablePerformanceMiddleware { get; set; } = true;

    /// <summary>
    /// 启用错误处理中间件
    /// </summary>
    public bool EnableErrorHandlingMiddleware { get; set; } = true;

    /// <summary>
    /// 启用验证中间件
    /// </summary>
    public bool EnableValidationMiddleware { get; set; } = true;

    /// <summary>
    /// 启用缓存中间件
    /// </summary>
    public bool EnableCachingMiddleware { get; set; } = false;
}

/// <summary>
/// 模板引擎配置节 ⭐ D爷建议
/// </summary>
public class TemplateEngineConfigSection
{
    /// <summary>
    /// 模板缓存大小（LRU）
    /// </summary>
    public int CacheSize { get; set; } = 1000;

    /// <summary>
    /// 模板缓存TTL（分钟）
    /// </summary>
    public int CacheTTLMinutes { get; set; } = 60;

    /// <summary>
    /// 启用模板预编译
    /// </summary>
    public bool EnablePrecompilation { get; set; } = true;

    /// <summary>
    /// 模板根目录
    /// </summary>
    public string TemplateRootDirectory { get; set; } = "./Templates";
}

/// <summary>
/// 质量门禁配置节 ⭐ D爷建议
/// </summary>
public class QualityGateConfigSection
{
    /// <summary>
    /// 是否启用质量门禁
    /// </summary>
    public bool Enabled { get; set; } = true;

    /// <summary>
    /// 是否启用严格模式（任何警告都会失败）
    /// </summary>
    public bool StrictMode { get; set; } = false;

    /// <summary>
    /// 元数据一致性检查
    /// </summary>
    public bool EnableMetadataConsistencyCheck { get; set; } = true;

    /// <summary>
    /// 类型一致性检查
    /// </summary>
    public bool EnableTypeConsistencyCheck { get; set; } = true;

    /// <summary>
    /// 模板输出检查
    /// </summary>
    public bool EnableTemplateOutputCheck { get; set; } = true;

    /// <summary>
    /// 编译检查
    /// </summary>
    public bool EnableCompilationCheck { get; set; } = true;

    /// <summary>
    /// 架构约束检查
    /// </summary>
    public bool EnableArchitectureConstraintsCheck { get; set; } = true;
}

/// <summary>
/// 性能监控配置节 ⭐ D爷建议
/// </summary>
public class PerformanceConfigSection
{
    /// <summary>
    /// 是否启用性能指标收集
    /// </summary>
    public bool EnableMetrics { get; set; } = true;

    /// <summary>
    /// 性能警告阈值（毫秒）
    /// </summary>
    public int WarningThresholdMs { get; set; } = 5000;

    /// <summary>
    /// 性能错误阈值（毫秒）
    /// </summary>
    public int ErrorThresholdMs { get; set; } = 10000;

    /// <summary>
    /// 启用OpenTelemetry集成
    /// </summary>
    public bool EnableOpenTelemetry { get; set; } = false;

    /// <summary>
    /// OpenTelemetry端点
    /// </summary>
    public string OpenTelemetryEndpoint { get; set; } = "http://localhost:4317";
}

