var builder = DistributedApplication.CreateBuilder(args);

// ======================================
// 基础设施资源
// ======================================

// PostgreSQL数据库
var postgres = builder.AddPostgres("postgres")
    .WithDataVolume()
    .WithPgAdmin();

var opsDb = postgres.AddDatabase("opsmanagement-db", "SmartAbp_OpsManagement");
var mainDb = postgres.AddDatabase("main-db", "SmartAbp");

// Redis缓存
var redis = builder.AddRedis("redis")
    .WithDataVolume()
    .WithRedisCommander();

// RabbitMQ消息队列
var rabbitmq = builder.AddRabbitMQ("rabbitmq")
    .WithDataVolume()
    .WithManagementPlugin();

// Elasticsearch（用于ELK日志存储）
var elasticsearch = builder.AddElasticsearch("elasticsearch")
    .WithDataVolume();

// Prometheus（用于APM监控）
var prometheus = builder.AddContainer("prometheus", "prom/prometheus", "latest")
    .WithBindMount("./prometheus", "/etc/prometheus")
    .WithHttpEndpoint(port: 9090, targetPort: 9090, name: "http");

// Grafana（用于可视化）
var grafana = builder.AddContainer("grafana", "grafana/grafana", "latest")
    .WithBindMount("./grafana", "/var/lib/grafana")
    .WithHttpEndpoint(port: 3000, targetPort: 3000, name: "http")
    .WithEnvironment("GF_SECURITY_ADMIN_PASSWORD", "admin123")
    .WithEnvironment("GF_SECURITY_ADMIN_USER", "admin");

// ======================================
// SmartAbp微服务
// ======================================

// 运维监控微服务
var opsMonitoring = builder.AddProject<Projects.SmartAbp_OpsManagement_Host>("ops-monitoring")
    .WithReference(opsDb)
    .WithReference(redis)
    .WithReference(rabbitmq)
    .WithReference(elasticsearch)
    .WithReference(prometheus)
    .WithEnvironment("ASPNETCORE_ENVIRONMENT", "Development")
    .WithEnvironment("ASPNETCORE_URLS", "http://+:8080")
    .WithHttpEndpoint(port: 8080, targetPort: 8080, name: "http")
    .WithHttpsEndpoint(port: 8443, targetPort: 8443, name: "https");

// 主Web应用
var webApp = builder.AddProject<Projects.SmartAbp_Web>("web-app")
    .WithReference(mainDb)
    .WithReference(redis)
    .WithReference(rabbitmq)
    .WithReference(opsMonitoring) // 依赖运维监控微服务
    .WithEnvironment("ASPNETCORE_ENVIRONMENT", "Development")
    .WithEnvironment("ASPNETCORE_URLS", "http://+:9002;https://+:9003")
    .WithHttpEndpoint(port: 9002, targetPort: 9002, name: "http")
    .WithHttpsEndpoint(port: 9003, targetPort: 9003, name: "https");

// 代码生成器微服务
var codeGenerator = builder.AddProject<Projects.SmartAbp_CodeGenerator>("code-generator")
    .WithReference(mainDb)
    .WithReference(redis)
    .WithReference(rabbitmq)
    .WithEnvironment("ASPNETCORE_ENVIRONMENT", "Development")
    .WithEnvironment("ASPNETCORE_URLS", "http://+:6000")
    .WithHttpEndpoint(port: 6000, targetPort: 6000, name: "http");

// ======================================
// Vue前端应用
// ======================================

var vueApp = builder.AddNpmApp("vue-frontend", "../SmartAbp.Vue", "dev")
    .WithHttpEndpoint(port: 9001, targetPort: 9001, name: "http")
    .WithEnvironment("VITE_API_BASE_URL", "http://localhost:9002")
    .WithEnvironment("VITE_OPS_API_BASE_URL", "http://localhost:8080")
    .WithReference(webApp)
    .WithReference(opsMonitoring);

// ======================================
// Dapr Sidecars（用于微服务通信）
// ======================================

if (builder.Environment.IsDevelopment())
{
    // 为运维监控微服务添加Dapr Sidecar
    opsMonitoring.WithDaprSidecar(new DaprSidecarOptions
    {
        AppId = "smartabp-ops-monitoring",
        AppPort = 8080,
        DaprHttpPort = 3500,
        DaprGrpcPort = 50001,
        EnableApiLogging = true,
        LogLevel = "info"
    });

    // 为主Web应用添加Dapr Sidecar
    webApp.WithDaprSidecar(new DaprSidecarOptions
    {
        AppId = "smartabp-web",
        AppPort = 9002,
        DaprHttpPort = 3501,
        DaprGrpcPort = 50002,
        EnableApiLogging = true,
        LogLevel = "info"
    });

    // 为代码生成器添加Dapr Sidecar
    codeGenerator.WithDaprSidecar(new DaprSidecarOptions
    {
        AppId = "smartabp-codegen",
        AppPort = 6000,
        DaprHttpPort = 3502,
        DaprGrpcPort = 50003,
        EnableApiLogging = true,
        LogLevel = "info"
    });
}

// ======================================
// 健康检查与监控配置
// ======================================

// 配置健康检查端点
builder.Services.AddHealthChecks()
    .AddUrlGroup(new Uri("http://localhost:8080/health"), "OpsMonitoring")
    .AddUrlGroup(new Uri("http://localhost:9002/health"), "WebApp")
    .AddUrlGroup(new Uri("http://localhost:6000/health"), "CodeGenerator");

// 构建并运行
var app = builder.Build();

app.Run();

/// <summary>
/// Dapr Sidecar配置选项
/// </summary>
public class DaprSidecarOptions
{
    public string AppId { get; set; } = string.Empty;
    public int AppPort { get; set; }
    public int DaprHttpPort { get; set; } = 3500;
    public int DaprGrpcPort { get; set; } = 50001;
    public bool EnableApiLogging { get; set; }
    public string LogLevel { get; set; } = "info";
}

/// <summary>
/// Dapr Sidecar扩展方法
/// </summary>
public static class DaprExtensions
{
    public static IResourceBuilder<T> WithDaprSidecar<T>(
        this IResourceBuilder<T> builder,
        DaprSidecarOptions options) where T : IResource
    {
        return builder
            .WithEnvironment("DAPR_HTTP_PORT", options.DaprHttpPort.ToString())
            .WithEnvironment("DAPR_GRPC_PORT", options.DaprGrpcPort.ToString())
            .WithEnvironment("DAPR_APP_ID", options.AppId)
            .WithEnvironment("DAPR_APP_PORT", options.AppPort.ToString())
            .WithAnnotation(new DaprSidecarAnnotation(options));
    }
}

/// <summary>
/// Dapr Sidecar注解
/// </summary>
public class DaprSidecarAnnotation : IResourceAnnotation
{
    public DaprSidecarAnnotation(DaprSidecarOptions options)
    {
        Options = options;
    }

    public DaprSidecarOptions Options { get; }
}

