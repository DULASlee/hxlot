using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.DevKit.Core.Abstractions;
using SmartAbp.DevKit.Core.Helpers;
using SmartAbp.DevKit.Core.Models;
using SmartAbp.DevKit.Core.Templates;

namespace SmartAbp.DevKit.Core.Generator;

/// <summary>
/// Aspire编排项目生成器（生成.AppHost项目）
/// Phase 2核心组件 - 生成Aspire微服务编排基础设施
/// </summary>
public class AspireHostGenerator : CodeGeneratorFramework<GenerationContext, Dictionary<string, string>>
{
    private readonly ILogger<AspireHostGenerator> _logger;
    private readonly TemplateManager _templateManager;

    public AspireHostGenerator(
        ILogger<AspireHostGenerator> logger,
        TemplateManager templateManager)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _templateManager = templateManager ?? throw new ArgumentNullException(nameof(templateManager));

        _logger.LogInformation("AspireHostGenerator initialized.");
    }

    public override async Task<Dictionary<string, string>> GenerateAsync(GenerationContext input)
    {
        // 1. 验证输入
        var validation = await ValidateInputAsync(input);
        if (!validation.IsValid)
        {
            throw new InvalidOperationException($"输入验证失败: {validation.ErrorMessage}");
        }

        // 2. 确保是微服务模式
        if (!input.Config.IsMicroservice)
        {
            _logger.LogWarning("当前配置不是微服务模式，跳过Aspire Host生成。");
            return new Dictionary<string, string>();
        }

        var generatedFiles = new Dictionary<string, string>();

        _logger.LogInformation(
            "开始生成Aspire Host项目: {ModuleName}",
            input.Config.ModuleName);

        // 3. 生成.csproj项目文件
        var projectFile = await GenerateProjectFileAsync(input.Config);
        var projectPath = GetProjectFilePath(input.Config);
        generatedFiles[projectPath] = projectFile;

        // 4. 生成Program.cs（Aspire编排入口）
        var programFile = await GenerateProgramFileAsync(input.Config);
        var programPath = GetProgramFilePath(input.Config);
        generatedFiles[programPath] = programFile;

        // 5. 生成appsettings.json（Aspire配置）
        var appSettingsFile = await GenerateAppSettingsFileAsync(input.Config);
        var appSettingsPath = GetAppSettingsFilePath(input.Config);
        generatedFiles[appSettingsPath] = appSettingsFile;

        // 6. 生成Properties/launchSettings.json（启动配置）
        var launchSettingsFile = await GenerateLaunchSettingsFileAsync(input.Config);
        var launchSettingsPath = GetLaunchSettingsFilePath(input.Config);
        generatedFiles[launchSettingsPath] = launchSettingsFile;

        _logger.LogInformation(
            "Aspire Host项目生成完成，共生成 {Count} 个文件",
            generatedFiles.Count);

        return generatedFiles;
    }

    public override Task<ValidationResult> ValidateInputAsync(GenerationContext input)
    {
        if (input.Config == null)
        {
            return Task.FromResult(ValidationResult.Fail("配置对象不能为空"));
        }

        if (string.IsNullOrWhiteSpace(input.Config.ModuleName))
        {
            return Task.FromResult(ValidationResult.Fail("模块名称不能为空"));
        }

        // 如果是微服务模式，必须有微服务配置
        if (input.Config.IsMicroservice && input.Config.MicroserviceConfig == null)
        {
            return Task.FromResult(
                ValidationResult.Fail("微服务模式下，MicroserviceConfig不能为空"));
        }

        return Task.FromResult(ValidationResult.Success());
    }

    #region 生成各个文件

    /// <summary>
    /// 生成.csproj项目文件
    /// </summary>
    private async Task<string> GenerateProjectFileAsync(LowCodeConfig config)
    {
        var templateData = new
        {
            ProjectName = GetAspireHostProjectName(config),
            TargetFramework = "net8.0",
            AspireVersion = "8.0.0",
            Services = GetServiceReferences(config),
            HasServices = GetServiceReferences(config).Any()
        };

        return await _templateManager.RenderTemplateAsync("AspireHostProject", templateData);
    }

    /// <summary>
    /// 生成Program.cs（Aspire编排入口）
    /// </summary>
    private async Task<string> GenerateProgramFileAsync(LowCodeConfig config)
    {
        var aspireConfig = config.MicroserviceConfig!.AspireConfig;
        var serviceName = config.MicroserviceConfig.ServiceName;

        var templateData = new
        {
            ProjectName = GetAspireHostProjectName(config),
            ServiceName = serviceName,
            HttpPort = config.MicroserviceConfig.HttpPort,
            GrpcPort = config.MicroserviceConfig.GrpcPort,

            // Aspire资源配置
            EnableRedis = aspireConfig.EnableRedis,
            EnableRabbitMQ = aspireConfig.EnableRabbitMQ,
            EnablePostgreSQL = aspireConfig.EnablePostgreSQL,
            EnableSqlServer = aspireConfig.EnableSqlServer,
            EnableSeq = aspireConfig.EnableSeq,

            // 容器编排配置
            Replicas = aspireConfig.Replicas,
            HasCpuLimit = aspireConfig.CpuLimit.HasValue,
            CpuLimit = aspireConfig.CpuLimit ?? 0,
            HasMemoryLimit = aspireConfig.MemoryLimit.HasValue,
            MemoryLimit = aspireConfig.MemoryLimit ?? 0,

            // 依赖服务
            DependentServices = config.MicroserviceConfig.DependentServices,
            HasDependentServices = config.MicroserviceConfig.DependentServices.Any(),

            // 服务发现和追踪
            EnableServiceDiscovery = config.MicroserviceConfig.EnableServiceDiscovery,
            EnableDistributedTracing = config.MicroserviceConfig.EnableDistributedTracing,
            EnableHealthChecks = config.MicroserviceConfig.EnableHealthChecks,

            // API Gateway
            IsApiGateway = config.MicroserviceConfig.IsApiGateway
        };

        return await _templateManager.RenderTemplateAsync("AspireHostProgram", templateData);
    }

    /// <summary>
    /// 生成appsettings.json（Aspire配置）
    /// </summary>
    private async Task<string> GenerateAppSettingsFileAsync(LowCodeConfig config)
    {
        var aspireConfig = config.MicroserviceConfig!.AspireConfig;

        var templateData = new
        {
            ServiceName = config.MicroserviceConfig.ServiceName,

            // 日志配置
            LogLevel = new
            {
                Default = "Information",
                Microsoft = "Warning",
                MicrosoftHostingLifetime = "Information",
                AspireHosting = "Information"
            },

            // Aspire配置
            Aspire = new
            {
                Resources = new
                {
                    Redis = aspireConfig.EnableRedis ? new { Enabled = true } : null,
                    RabbitMQ = aspireConfig.EnableRabbitMQ ? new { Enabled = true } : null,
                    PostgreSQL = aspireConfig.EnablePostgreSQL ? new { Enabled = true } : null,
                    SqlServer = aspireConfig.EnableSqlServer ? new { Enabled = true } : null,
                    Seq = aspireConfig.EnableSeq ? new { Enabled = true } : null
                },
                Container = new
                {
                    Replicas = aspireConfig.Replicas,
                    CpuLimit = aspireConfig.CpuLimit,
                    MemoryLimit = aspireConfig.MemoryLimit
                }
            },

            // 服务发现配置
            ServiceDiscovery = config.MicroserviceConfig.EnableServiceDiscovery ? new
            {
                Enabled = true,
                Consul = new
                {
                    Host = "localhost",
                    Port = 8500
                }
            } : null,

            // 分布式追踪配置
            DistributedTracing = config.MicroserviceConfig.EnableDistributedTracing ? new
            {
                Enabled = true,
                OpenTelemetry = new
                {
                    ServiceName = config.MicroserviceConfig.ServiceName,
                    Endpoint = "http://localhost:4317"
                }
            } : null
        };

        return await _templateManager.RenderTemplateAsync("AspireHostAppSettings", templateData);
    }

    /// <summary>
    /// 生成launchSettings.json（启动配置）
    /// </summary>
    private async Task<string> GenerateLaunchSettingsFileAsync(LowCodeConfig config)
    {
        var templateData = new
        {
            ProjectName = GetAspireHostProjectName(config),
            HttpPort = 5000,
            HttpsPort = 5001,
            DashboardPort = 18888 // Aspire Dashboard端口
        };

        return await _templateManager.RenderTemplateAsync("AspireHostLaunchSettings", templateData);
    }

    #endregion

    #region 辅助方法

    /// <summary>
    /// 获取Aspire Host项目名称
    /// </summary>
    private string GetAspireHostProjectName(LowCodeConfig config)
    {
        return $"SmartAbp.{config.ModuleName}.AspireHost";
    }

    /// <summary>
    /// 获取服务引用列表
    /// </summary>
    private List<ServiceReference> GetServiceReferences(LowCodeConfig config)
    {
        var references = new List<ServiceReference>();

        // 主服务
        references.Add(new ServiceReference
        {
            ServiceName = config.MicroserviceConfig!.ServiceName,
            ProjectPath = $"../services/{config.MicroserviceConfig.ServiceName}/{config.MicroserviceConfig.ServiceName}.csproj"
        });

        // 依赖服务
        foreach (var dependentService in config.MicroserviceConfig.DependentServices)
        {
            references.Add(new ServiceReference
            {
                ServiceName = dependentService,
                ProjectPath = $"../services/{dependentService}/{dependentService}.csproj"
            });
        }

        return references;
    }

    /// <summary>
    /// 获取项目文件路径
    /// </summary>
    private string GetProjectFilePath(LowCodeConfig config)
    {
        return Path.Combine(
            config.OutputPaths.AspireHostPath,
            $"{GetAspireHostProjectName(config)}.csproj");
    }

    /// <summary>
    /// 获取Program.cs文件路径
    /// </summary>
    private string GetProgramFilePath(LowCodeConfig config)
    {
        return Path.Combine(
            config.OutputPaths.AspireHostPath,
            "Program.cs");
    }

    /// <summary>
    /// 获取appsettings.json文件路径
    /// </summary>
    private string GetAppSettingsFilePath(LowCodeConfig config)
    {
        return Path.Combine(
            config.OutputPaths.AspireHostPath,
            "appsettings.json");
    }

    /// <summary>
    /// 获取launchSettings.json文件路径
    /// </summary>
    private string GetLaunchSettingsFilePath(LowCodeConfig config)
    {
        return Path.Combine(
            config.OutputPaths.AspireHostPath,
            "Properties",
            "launchSettings.json");
    }

    #endregion
}

/// <summary>
/// 服务引用
/// </summary>
public class ServiceReference
{
    /// <summary>
    /// 服务名称
    /// </summary>
    public required string ServiceName { get; set; }

    /// <summary>
    /// 项目路径（相对路径）
    /// </summary>
    public required string ProjectPath { get; set; }
}

