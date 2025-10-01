using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Serilog;
using Serilog.Events;
using SmartAbp.OpsManagement.Host;

namespace SmartAbp.OpsManagement.Host;

/// <summary>
/// 运维管理微服务主机程序
/// 支持 Dapr + Aspire + 结构化日志 + 健康检查
/// </summary>
public class Program
{
    public async static Task<int> Main(string[] args)
    {
        // 解析日志根目录 (默认 ./log，可通过 LOG_ROOT 环境变量覆盖)
        var defaultLogRoot = System.IO.Path.Combine(AppContext.BaseDirectory, "log");
        var logRoot = Environment.GetEnvironmentVariable("LOG_ROOT") ?? defaultLogRoot;
        var opsLogDir = System.IO.Path.Combine(logRoot, "ops-management");
        System.IO.Directory.CreateDirectory(opsLogDir);
        var bootstrapLogPath = System.IO.Path.Combine(opsLogDir, "bootstrap.json");

        // 配置启动日志
        Log.Logger = new LoggerConfiguration()
            .MinimumLevel.Debug()
            .Enrich.FromLogContext()
            .WriteTo.Async(c => c.File(
                path: bootstrapLogPath,
                rollingInterval: RollingInterval.Day,
                retainedFileCountLimit: 7,
                formatter: new Serilog.Formatting.Compact.CompactJsonFormatter()))
            .WriteTo.Async(c => c.Console())
            .CreateBootstrapLogger();

        try
        {
            Log.Information("启动运维管理微服务主机...");
            var builder = WebApplication.CreateBuilder(args);

            // 绑定强类型配置选项
            builder.Services.AddOptions<OpsManagementOptions>()
                .Bind(builder.Configuration.GetSection("OpsManagement"))
                .ValidateDataAnnotations()
                .ValidateOnStart();

            // 配置主机
            builder.Host
                .UseAutofac()
                .UseSerilog((context, services, loggerConfiguration) =>
                {
                    // 解析日志根目录：环境变量 → 配置 → 默认路径
                    var configuredRoot = Environment.GetEnvironmentVariable("LOG_ROOT");
                    var configuredRootFromConfig = context.Configuration.GetSection("OpsManagement")["LogRoot"];
                    if (string.IsNullOrWhiteSpace(configuredRoot))
                    {
                        configuredRoot = configuredRootFromConfig;
                    }
                    var contentRoot = context.HostingEnvironment.ContentRootPath;
                    var resolvedLogRoot = configuredRoot ?? System.IO.Path.Combine(contentRoot, "log");
                    var effectiveOpsLogDir = System.IO.Path.Combine(resolvedLogRoot, "ops-management");
                    System.IO.Directory.CreateDirectory(effectiveOpsLogDir);

                    loggerConfiguration
                    #if DEBUG
                        .MinimumLevel.Debug()
                    #else
                        .MinimumLevel.Information()
                    #endif
                        .MinimumLevel.Override("Microsoft", LogEventLevel.Information)
                        .MinimumLevel.Override("Microsoft.EntityFrameworkCore", LogEventLevel.Warning)
                        .MinimumLevel.Override("Dapr", LogEventLevel.Information)
                        .Enrich.FromLogContext()
                        .Enrich.WithProperty("Application", "SmartAbp.OpsManagement")
                        .Enrich.WithProperty("Service", "OpsManagement")
                        
                        // 应用日志 (info+)
                        .WriteTo.Async(c => c.File(
                            path: System.IO.Path.Combine(effectiveOpsLogDir, "app.log.json"),
                            rollingInterval: RollingInterval.Day,
                            retainedFileCountLimit: 14,
                            fileSizeLimitBytes: 50_000_000,
                            rollOnFileSizeLimit: true,
                            formatter: new Serilog.Formatting.Compact.CompactJsonFormatter(),
                            restrictedToMinimumLevel: LogEventLevel.Information))
                        
                        // 警告日志
                        .WriteTo.Async(c => c.File(
                            path: System.IO.Path.Combine(effectiveOpsLogDir, "warn.log.json"),
                            rollingInterval: RollingInterval.Day,
                            retainedFileCountLimit: 21,
                            fileSizeLimitBytes: 50_000_000,
                            rollOnFileSizeLimit: true,
                            formatter: new Serilog.Formatting.Compact.CompactJsonFormatter(),
                            restrictedToMinimumLevel: LogEventLevel.Warning))
                        
                        // 错误日志
                        .WriteTo.Async(c => c.File(
                            path: System.IO.Path.Combine(effectiveOpsLogDir, "error.log.json"),
                            rollingInterval: RollingInterval.Day,
                            retainedFileCountLimit: 30,
                            fileSizeLimitBytes: 50_000_000,
                            rollOnFileSizeLimit: true,
                            formatter: new Serilog.Formatting.Compact.CompactJsonFormatter(),
                            restrictedToMinimumLevel: LogEventLevel.Error))
                        
                        // 性能监控日志 (专用)
                        .WriteTo.Async(c => c.File(
                            path: System.IO.Path.Combine(effectiveOpsLogDir, "metrics.log.json"),
                            rollingInterval: RollingInterval.Hour,
                            retainedFileCountLimit: 48,
                            fileSizeLimitBytes: 100_000_000,
                            rollOnFileSizeLimit: true,
                            formatter: new Serilog.Formatting.Compact.CompactJsonFormatter()))
                        
                        .WriteTo.Async(c => c.Console());
                });

            // 添加 ABP 应用程序
            await builder.AddApplicationAsync<OpsManagementHostModule>();
            var app = builder.Build();

            // 中间件管道
            app.UseMiddleware<CorrelationIdMiddleware>();
            app.UseSerilogRequestLogging(options =>
            {
                options.MessageTemplate = "HTTP {RequestMethod} {RequestPath} responded {StatusCode} in {Elapsed:0.0000} ms";
                options.GetLevel = (httpContext, elapsed, ex) => ex != null ? LogEventLevel.Error : LogEventLevel.Information;
                options.EnrichDiagnosticContext = (diagnosticContext, httpContext) =>
                {
                    diagnosticContext.Set("RequestHost", httpContext.Request.Host.Value);
                    diagnosticContext.Set("RequestScheme", httpContext.Request.Scheme);
                    diagnosticContext.Set("UserAgent", httpContext.Request.Headers["User-Agent"].FirstOrDefault());
                };
            });

            // 初始化应用程序
            await app.InitializeApplicationAsync();

            Log.Information("运维管理微服务启动成功，监听端口: {Urls}", string.Join(", ", app.Urls));
            await app.RunAsync();
            return 0;
        }
        catch (Exception ex)
        {
            Log.Fatal(ex, "运维管理微服务启动失败！");
            return 1;
        }
        finally
        {
            Log.CloseAndFlush();
        }
    }
}

/// <summary>
/// 运维管理配置选项
/// </summary>
public class OpsManagementOptions
{
    /// <summary>
    /// 日志根目录
    /// </summary>
    public string? LogRoot { get; set; }

    /// <summary>
    /// Prometheus 端点
    /// </summary>
    public string PrometheusEndpoint { get; set; } = "http://localhost:9090";

    /// <summary>
    /// Elasticsearch 端点
    /// </summary>
    public string ElasticsearchEndpoint { get; set; } = "http://localhost:9200";

    /// <summary>
    /// Kubernetes API 端点
    /// </summary>
    public string? KubernetesEndpoint { get; set; }

    /// <summary>
    /// 数据保留天数
    /// </summary>
    public int DataRetentionDays { get; set; } = 30;
}

/// <summary>
/// 关联ID中间件
/// </summary>
public class CorrelationIdMiddleware
{
    private readonly RequestDelegate _next;
    private const string CorrelationIdHeaderName = "X-Correlation-ID";

    public CorrelationIdMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var correlationId = context.Request.Headers[CorrelationIdHeaderName].FirstOrDefault() 
                           ?? Guid.NewGuid().ToString();

        context.Response.Headers[CorrelationIdHeaderName] = correlationId;
        
        using (Serilog.Context.LogContext.PushProperty("CorrelationId", correlationId))
        {
            await _next(context);
        }
    }
}
