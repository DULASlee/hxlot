namespace SmartAbp.PermissionManagement.Client.Configuration;

/// <summary>
/// Permission Management Client配置选项
/// </summary>
public class PermissionManagementClientOptions
{
    /// <summary>
    /// Permission Management微服务的基础URL
    /// </summary>
    public string BaseUrl { get; set; } = "http://localhost:5001";

    /// <summary>
    /// API版本
    /// </summary>
    public string ApiVersion { get; set; } = "v1";

    /// <summary>
    /// HTTP请求超时时间（秒）
    /// </summary>
    public int TimeoutSeconds { get; set; } = 30;

    /// <summary>
    /// 是否启用重试策略
    /// </summary>
    public bool EnableRetry { get; set; } = true;

    /// <summary>
    /// 重试次数
    /// </summary>
    public int RetryCount { get; set; } = 3;

    /// <summary>
    /// 是否启用断路器
    /// </summary>
    public bool EnableCircuitBreaker { get; set; } = true;

    /// <summary>
    /// 认证Token（可选，用于服务间调用）
    /// </summary>
    public string? AuthenticationToken { get; set; }
}

