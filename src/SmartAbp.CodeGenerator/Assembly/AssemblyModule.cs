using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Logging;
using Volo.Abp;
using Volo.Abp.Modularity;

namespace SmartAbp.CodeGenerator.Assembly
{
    /// <summary>
    /// 装配件核心模块 - 统一管理所有装配件
    /// </summary>
    [DependsOn(
        // 根据实际项目依赖调整
        // typeof(AbpDddDomainModule)
    )]
    public class AssemblyModule : AbpModule
    {
        public override void ConfigureServices(ServiceConfigurationContext context)
        {
            var configuration = context.Services.GetConfiguration();

            // 注册装配件管理器
            context.Services.AddSingleton<IAssemblyManager, AssemblyManager>();

            // 配置装配件选项
            context.Services.Configure<AssemblyOptions>(options =>
            {
                // 从配置文件中读取装配件配置
                var assemblySection = configuration.GetSection("Assemblies");
                foreach (var assemblyConfig in assemblySection.GetChildren())
                {
                    options.Assemblies[assemblyConfig.Key] = new AssemblyConfig
                    {
                        Enabled = assemblyConfig.GetValue<bool>("Enabled", true),
                        Version = assemblyConfig.GetValue<string>("Version", "1.0.0")
                    };
                }
            });

            // 注册装配件健康检查
            // context.Services.AddHealthChecks()
            //     .AddCheck<AssemblyHealthCheck>("assemblies");

            // 注册装配件事件处理器
            context.Services.AddTransient<IAssemblyEventHandler, AssemblyEventHandler>();
        }

        public override void OnApplicationInitialization(ApplicationInitializationContext context)
        {
            var assemblyManager = context.ServiceProvider.GetRequiredService<IAssemblyManager>();

            // 初始化所有启用的装配件
            var configuration = context.ServiceProvider.GetRequiredService<IConfiguration>();
            var assemblySection = configuration.GetSection("Assemblies");

            foreach (var assemblyConfig in assemblySection.GetChildren())
            {
                if (assemblyConfig.GetValue<bool>("Enabled", true))
                {
                    assemblyManager.InitializeAssembly(assemblyConfig.Key).GetAwaiter().GetResult();
                }
            }
        }
    }

    /// <summary>
    /// 装配件健康检查
    /// </summary>
    public class AssemblyHealthCheck : IHealthCheck
    {
        private readonly IAssemblyManager _assemblyManager;

        public AssemblyHealthCheck(IAssemblyManager assemblyManager)
        {
            _assemblyManager = assemblyManager;
        }

        public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
        {
            var loadedAssemblies = _assemblyManager.GetLoadedAssemblies();
            var unhealthyAssemblies = new List<string>();

            foreach (var assemblyName in loadedAssemblies)
            {
                var healthStatus = await _assemblyManager.GetAssemblyHealthAsync(assemblyName);
                if (healthStatus != AssemblyHealthStatus.Healthy)
                {
                    unhealthyAssemblies.Add(assemblyName);
                }
            }

            if (unhealthyAssemblies.Any())
            {
                return new HealthCheckResult(
                    Microsoft.Extensions.Diagnostics.HealthChecks.HealthStatus.Unhealthy,
                    $"Unhealthy assemblies: {string.Join(", ", unhealthyAssemblies)}",
                    data: new Dictionary<string, object>
                    {
                        ["unhealthy_assemblies"] = unhealthyAssemblies,
                        ["total_assemblies"] = loadedAssemblies.Count
                    });
            }

            return new HealthCheckResult(
                Microsoft.Extensions.Diagnostics.HealthChecks.HealthStatus.Healthy,
                $"All {loadedAssemblies.Count} assemblies are healthy",
                data: new Dictionary<string, object>
                {
                    ["total_assemblies"] = loadedAssemblies.Count
                });
        }
    }

    /// <summary>
    /// 装配件事件处理器接口
    /// </summary>
    public interface IAssemblyEventHandler
    {
        Task HandleAssemblyEventAsync(AssemblyEventArgs args);
    }

    /// <summary>
    /// 装配件事件处理器实现
    /// </summary>
    public class AssemblyEventHandler : IAssemblyEventHandler
    {
        private readonly ILogger<AssemblyEventHandler> _logger;

        public AssemblyEventHandler(ILogger<AssemblyEventHandler> logger)
        {
            _logger = logger;
        }

        public async Task HandleAssemblyEventAsync(AssemblyEventArgs args)
        {
            switch (args.EventType)
            {
                case AssemblyEventType.Loaded:
                    _logger.LogInformation("Assembly {AssemblyName} loaded successfully", args.AssemblyName);
                    break;
                case AssemblyEventType.Unloaded:
                    _logger.LogInformation("Assembly {AssemblyName} unloaded", args.AssemblyName);
                    break;
                case AssemblyEventType.Error:
                    _logger.LogError("Error in assembly {AssemblyName}: {Data}", args.AssemblyName, args.Data);
                    break;
                case AssemblyEventType.ConfigurationChanged:
                    _logger.LogInformation("Configuration changed for assembly {AssemblyName}", args.AssemblyName);
                    break;
                case AssemblyEventType.HealthStatusChanged:
                    _logger.LogWarning("Health status changed for assembly {AssemblyName}: {Data}", args.AssemblyName, args.Data);
                    break;
            }

            await Task.CompletedTask;
        }
    }
}