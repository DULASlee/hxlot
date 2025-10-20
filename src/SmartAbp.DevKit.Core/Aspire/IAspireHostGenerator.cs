using SmartAbp.DevKit.Core.Abstractions;
using SmartAbp.DevKit.Core.Models;

namespace SmartAbp.DevKit.Core.Aspire;

/// <summary>
/// Aspire AppHost生成器接口
/// 负责生成Aspire编排项目的AppHost代码
/// </summary>
public interface IAspireHostGenerator : ICodeGenerator
{
    /// <summary>
    /// 生成AppHost项目结构
    /// </summary>
    /// <param name="context">生成上下文</param>
    /// <param name="cancellationToken">取消令牌</param>
    /// <returns>AppHost项目生成结果</returns>
    Task<AspireHostResult> GenerateAppHostProjectAsync(
        GenerationContext context,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// 生成ServiceDefaults项目（Aspire共享配置）
    /// </summary>
    /// <param name="context">生成上下文</param>
    /// <param name="cancellationToken">取消令牌</param>
    /// <returns>ServiceDefaults项目生成结果</returns>
    Task<ServiceDefaultsResult> GenerateServiceDefaultsAsync(
        GenerationContext context,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// 添加微服务到AppHost
    /// </summary>
    /// <param name="appHostPath">AppHost项目路径</param>
    /// <param name="serviceName">服务名称</param>
    /// <param name="serviceType">服务类型（WebApi, Worker, Blazor等）</param>
    /// <param name="cancellationToken">取消令牌</param>
    /// <returns>是否成功添加</returns>
    Task<bool> AddMicroserviceAsync(
        string appHostPath,
        string serviceName,
        AspireServiceType serviceType,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// 配置服务依赖关系
    /// </summary>
    /// <param name="appHostPath">AppHost项目路径</param>
    /// <param name="dependencies">服务依赖配置</param>
    /// <param name="cancellationToken">取消令牌</param>
    /// <returns>是否成功配置</returns>
    Task<bool> ConfigureDependenciesAsync(
        string appHostPath,
        AspireServiceDependencies dependencies,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Aspire服务类型枚举
/// </summary>
public enum AspireServiceType
{
    /// <summary>
    /// Web API服务
    /// </summary>
    WebApi,

    /// <summary>
    /// Worker服务（后台任务）
    /// </summary>
    Worker,

    /// <summary>
    /// Blazor服务（前端UI）
    /// </summary>
    Blazor,

    /// <summary>
    /// gRPC服务
    /// </summary>
    GrpcService,

    /// <summary>
    /// 数据库（PostgreSQL, Redis等）
    /// </summary>
    Database,

    /// <summary>
    /// 消息队列（RabbitMQ, Kafka等）
    /// </summary>
    MessageQueue
}

/// <summary>
/// Aspire AppHost生成结果
/// </summary>
public class AspireHostResult
{
    /// <summary>
    /// 是否成功
    /// </summary>
    public bool IsSuccess { get; set; } = true;

    /// <summary>
    /// AppHost项目路径
    /// </summary>
    public string AppHostProjectPath { get; set; } = string.Empty;

    /// <summary>
    /// 生成的文件列表
    /// </summary>
    public List<GeneratedFile> GeneratedFiles { get; set; } = new();

    /// <summary>
    /// 错误消息
    /// </summary>
    public string? ErrorMessage { get; set; }
}

/// <summary>
/// ServiceDefaults生成结果
/// </summary>
public class ServiceDefaultsResult
{
    /// <summary>
    /// 是否成功
    /// </summary>
    public bool IsSuccess { get; set; } = true;

    /// <summary>
    /// ServiceDefaults项目路径
    /// </summary>
    public string ServiceDefaultsProjectPath { get; set; } = string.Empty;

    /// <summary>
    /// 生成的文件列表
    /// </summary>
    public List<GeneratedFile> GeneratedFiles { get; set; } = new();

    /// <summary>
    /// 错误消息
    /// </summary>
    public string? ErrorMessage { get; set; }
}

/// <summary>
/// Aspire服务依赖配置
/// </summary>
public class AspireServiceDependencies
{
    /// <summary>
    /// 服务名称
    /// </summary>
    public required string ServiceName { get; set; }

    /// <summary>
    /// 依赖的服务列表
    /// </summary>
    public List<string> DependsOn { get; set; } = new();

    /// <summary>
    /// 环境变量配置
    /// </summary>
    public Dictionary<string, string> EnvironmentVariables { get; set; } = new();

    /// <summary>
    /// 连接字符串配置
    /// </summary>
    public Dictionary<string, string> ConnectionStrings { get; set; } = new();
}

