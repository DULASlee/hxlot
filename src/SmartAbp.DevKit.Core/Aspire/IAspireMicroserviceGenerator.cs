using SmartAbp.DevKit.Core.Abstractions;
using SmartAbp.DevKit.Core.Models;

namespace SmartAbp.DevKit.Core.Aspire;

/// <summary>
/// Aspire微服务生成器接口
/// 负责生成符合Aspire标准的微服务项目
/// </summary>
public interface IAspireMicroserviceGenerator : ICodeGenerator
{
    /// <summary>
    /// 生成微服务项目
    /// </summary>
    /// <param name="context">生成上下文</param>
    /// <param name="serviceConfig">微服务配置</param>
    /// <param name="cancellationToken">取消令牌</param>
    /// <returns>微服务项目生成结果</returns>
    Task<MicroserviceResult> GenerateMicroserviceAsync(
        GenerationContext context,
        MicroserviceConfig serviceConfig,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// 生成API Gateway（API网关）
    /// </summary>
    /// <param name="context">生成上下文</param>
    /// <param name="gatewayConfig">网关配置</param>
    /// <param name="cancellationToken">取消令牌</param>
    /// <returns>API Gateway生成结果</returns>
    Task<ApiGatewayResult> GenerateApiGatewayAsync(
        GenerationContext context,
        ApiGatewayConfig gatewayConfig,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// 添加健康检查端点
    /// </summary>
    /// <param name="servicePath">服务项目路径</param>
    /// <param name="healthCheckConfig">健康检查配置</param>
    /// <param name="cancellationToken">取消令牌</param>
    /// <returns>是否成功添加</returns>
    Task<bool> AddHealthCheckAsync(
        string servicePath,
        HealthCheckConfig healthCheckConfig,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// 添加OpenTelemetry遥测
    /// </summary>
    /// <param name="servicePath">服务项目路径</param>
    /// <param name="telemetryConfig">遥测配置</param>
    /// <param name="cancellationToken">取消令牌</param>
    /// <returns>是否成功添加</returns>
    Task<bool> AddOpenTelemetryAsync(
        string servicePath,
        TelemetryConfig telemetryConfig,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// 微服务配置
/// </summary>
public class MicroserviceConfig
{
    /// <summary>
    /// 服务名称
    /// </summary>
    public required string ServiceName { get; set; }

    /// <summary>
    /// 服务类型
    /// </summary>
    public AspireServiceType ServiceType { get; set; } = AspireServiceType.WebApi;

    /// <summary>
    /// 监听端口
    /// </summary>
    public int Port { get; set; } = 5000;

    /// <summary>
    /// 是否启用HTTPS
    /// </summary>
    public bool EnableHttps { get; set; } = true;

    /// <summary>
    /// 是否启用健康检查
    /// </summary>
    public bool EnableHealthCheck { get; set; } = true;

    /// <summary>
    /// 是否启用OpenTelemetry
    /// </summary>
    public bool EnableOpenTelemetry { get; set; } = true;

    /// <summary>
    /// 依赖的数据库列表
    /// </summary>
    public List<DatabaseDependency> Databases { get; set; } = new();

    /// <summary>
    /// 依赖的其他服务列表
    /// </summary>
    public List<string> DependentServices { get; set; } = new();
}

/// <summary>
/// 数据库依赖
/// </summary>
public class DatabaseDependency
{
    /// <summary>
    /// 数据库名称
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// 数据库类型
    /// </summary>
    public DatabaseType Type { get; set; } = DatabaseType.PostgreSQL;

    /// <summary>
    /// 连接字符串名称
    /// </summary>
    public string ConnectionStringName { get; set; } = "DefaultConnection";
}

/// <summary>
/// 数据库类型枚举
/// </summary>
public enum DatabaseType
{
    PostgreSQL,
    SqlServer,
    MySQL,
    Redis,
    MongoDB
}

/// <summary>
/// API网关配置
/// </summary>
public class ApiGatewayConfig
{
    /// <summary>
    /// 网关名称
    /// </summary>
    public required string GatewayName { get; set; }

    /// <summary>
    /// 监听端口
    /// </summary>
    public int Port { get; set; } = 8080;

    /// <summary>
    /// 路由规则列表
    /// </summary>
    public List<RouteRule> Routes { get; set; } = new();

    /// <summary>
    /// 是否启用限流
    /// </summary>
    public bool EnableRateLimiting { get; set; } = true;

    /// <summary>
    /// 是否启用负载均衡
    /// </summary>
    public bool EnableLoadBalancing { get; set; } = true;
}

/// <summary>
/// 路由规则
/// </summary>
public class RouteRule
{
    /// <summary>
    /// 路径匹配模式（如：/api/users）
    /// </summary>
    public required string Path { get; set; }

    /// <summary>
    /// 目标服务名称
    /// </summary>
    public required string TargetService { get; set; }

    /// <summary>
    /// HTTP方法（GET, POST, PUT, DELETE等）
    /// </summary>
    public List<string> Methods { get; set; } = new() { "GET", "POST", "PUT", "DELETE" };
}

/// <summary>
/// 健康检查配置
/// </summary>
public class HealthCheckConfig
{
    /// <summary>
    /// 健康检查端点路径
    /// </summary>
    public string Endpoint { get; set; } = "/health";

    /// <summary>
    /// 检查间隔（秒）
    /// </summary>
    public int IntervalSeconds { get; set; } = 30;

    /// <summary>
    /// 超时时间（秒）
    /// </summary>
    public int TimeoutSeconds { get; set; } = 10;

    /// <summary>
    /// 是否检查数据库连接
    /// </summary>
    public bool CheckDatabase { get; set; } = true;

    /// <summary>
    /// 是否检查依赖服务
    /// </summary>
    public bool CheckDependencies { get; set; } = true;
}

/// <summary>
/// 遥测配置
/// </summary>
public class TelemetryConfig
{
    /// <summary>
    /// 是否启用日志
    /// </summary>
    public bool EnableLogging { get; set; } = true;

    /// <summary>
    /// 是否启用指标（Metrics）
    /// </summary>
    public bool EnableMetrics { get; set; } = true;

    /// <summary>
    /// 是否启用追踪（Tracing）
    /// </summary>
    public bool EnableTracing { get; set; } = true;

    /// <summary>
    /// OTLP导出端点（OpenTelemetry Protocol）
    /// </summary>
    public string OtlpEndpoint { get; set; } = "http://localhost:4317";

    /// <summary>
    /// 采样率（0.0-1.0，1.0表示100%采样）
    /// </summary>
    public double SamplingRate { get; set; } = 1.0;
}

/// <summary>
/// 微服务生成结果
/// </summary>
public class MicroserviceResult
{
    /// <summary>
    /// 是否成功
    /// </summary>
    public bool IsSuccess { get; set; } = true;

    /// <summary>
    /// 服务项目路径
    /// </summary>
    public string ServiceProjectPath { get; set; } = string.Empty;

    /// <summary>
    /// 生成的文件列表
    /// </summary>
    public List<GeneratedFile> GeneratedFiles { get; set; } = new();

    /// <summary>
    /// 错误消息
    /// </summary>
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// 服务URL（用于AppHost配置）
    /// </summary>
    public string ServiceUrl { get; set; } = string.Empty;
}

/// <summary>
/// API网关生成结果
/// </summary>
public class ApiGatewayResult
{
    /// <summary>
    /// 是否成功
    /// </summary>
    public bool IsSuccess { get; set; } = true;

    /// <summary>
    /// 网关项目路径
    /// </summary>
    public string GatewayProjectPath { get; set; } = string.Empty;

    /// <summary>
    /// 生成的文件列表
    /// </summary>
    public List<GeneratedFile> GeneratedFiles { get; set; } = new();

    /// <summary>
    /// 错误消息
    /// </summary>
    public string? ErrorMessage { get; set; }
}

