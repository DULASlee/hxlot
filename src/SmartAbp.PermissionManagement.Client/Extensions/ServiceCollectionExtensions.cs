using Microsoft.Extensions.DependencyInjection;
using SmartAbp.PermissionManagement.Client.Configuration;
using SmartAbp.PermissionManagement.Client.Services;
using Polly;
using Polly.Extensions.Http;

namespace SmartAbp.PermissionManagement.Client.Extensions;

/// <summary>
/// Permission Management Client集成扩展方法
/// </summary>
public static class ServiceCollectionExtensions
{
    /// <summary>
    /// 添加Permission Management Client SDK
    /// </summary>
    /// <param name="services">服务集合</param>
    /// <param name="configureOptions">配置选项</param>
    /// <returns></returns>
    public static IServiceCollection AddPermissionManagementClient(
        this IServiceCollection services,
        Action<PermissionManagementClientOptions> configureOptions)
    {
        // 注册配置选项
        services.Configure(configureOptions);

        // 获取配置选项
        var options = new PermissionManagementClientOptions();
        configureOptions(options);

        // 注册HttpClient（带重试和断路器策略）
        var httpClientBuilder = services.AddHttpClient<IPermissionManagementClient, PermissionManagementClient>()
            .ConfigureHttpClient(client =>
            {
                client.BaseAddress = new Uri(options.BaseUrl);
                client.Timeout = TimeSpan.FromSeconds(options.TimeoutSeconds);

                if (!string.IsNullOrEmpty(options.AuthenticationToken))
                {
                    client.DefaultRequestHeaders.Add("Authorization", $"Bearer {options.AuthenticationToken}");
                }
            });

        // 添加重试策略
        if (options.EnableRetry)
        {
            httpClientBuilder.AddPolicyHandler(GetRetryPolicy(options.RetryCount));
        }

        // 添加断路器策略
        if (options.EnableCircuitBreaker)
        {
            httpClientBuilder.AddPolicyHandler(GetCircuitBreakerPolicy());
        }

        return services;
    }

    /// <summary>
    /// 获取重试策略
    /// </summary>
    private static IAsyncPolicy<HttpResponseMessage> GetRetryPolicy(int retryCount)
    {
        return HttpPolicyExtensions
            .HandleTransientHttpError()
            .OrResult(msg => msg.StatusCode == System.Net.HttpStatusCode.NotFound)
            .WaitAndRetryAsync(
                retryCount,
                retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)), // 指数退避
                onRetry: (outcome, timespan, retryAttempt, context) =>
                {
                    Console.WriteLine($"Permission Management Client重试: Attempt {retryAttempt}, Delay {timespan.TotalSeconds}s");
                });
    }

    /// <summary>
    /// 获取断路器策略
    /// </summary>
    private static IAsyncPolicy<HttpResponseMessage> GetCircuitBreakerPolicy()
    {
        return HttpPolicyExtensions
            .HandleTransientHttpError()
            .CircuitBreakerAsync(
                handledEventsAllowedBeforeBreaking: 5, // 5次失败后断开
                durationOfBreak: TimeSpan.FromSeconds(30), // 断开30秒
                onBreak: (outcome, duration) =>
                {
                    Console.WriteLine($"Permission Management Client断路器打开: Duration {duration.TotalSeconds}s");
                },
                onReset: () =>
                {
                    Console.WriteLine("Permission Management Client断路器重置");
                });
    }
}

