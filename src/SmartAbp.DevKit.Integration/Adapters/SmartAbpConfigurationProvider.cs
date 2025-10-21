using SmartAbp.DevKit.Abstractions.Configuration;
using Volo.Abp.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace SmartAbp.DevKit.Integration.Adapters;

/// <summary>
/// SmartAbp配置提供者，提供SmartAbp项目特定的DevKit配置
/// </summary>
public class SmartAbpConfigurationProvider : IConfigurationProvider, ITransientDependency
{
    private readonly ILogger<SmartAbpConfigurationProvider> _logger;

    public SmartAbpConfigurationProvider(ILogger<SmartAbpConfigurationProvider> logger)
    {
        _logger = logger;
    }

    public Task<DevKitConfiguration> GetConfigurationAsync()
    {
        _logger.LogDebug("获取SmartAbp DevKit配置");

        var configuration = new DevKitConfiguration
        {
            NamespacePrefix = "SmartAbp",
            DomainOutputPath = "src/SmartAbp.Domain/Entities",
            ApplicationOutputPath = "src/SmartAbp.Application",
            FrontendOutputPath = "src/SmartAbp.Vue/src/views",
            CustomSettings = new Dictionary<string, string>
            {
                ["ProjectRoot"] = Directory.GetCurrentDirectory(),
                ["TemplateBasePath"] = "templates/",
                ["ContractsOutputPath"] = "src/SmartAbp.Application.Contracts",
                ["HttpApiOutputPath"] = "src/SmartAbp.HttpApi/Controllers",

                // SmartAbp特定配置
                ["EntityNamespace"] = "SmartAbp.Domain.Entities",
                ["AppServiceNamespace"] = "SmartAbp.Application.Services",
                ["ControllerNamespace"] = "SmartAbp.HttpApi.Controllers",
                ["DtoNamespace"] = "SmartAbp.Application.Contracts.Dtos",

                // 前端特定配置
                ["VueApiPath"] = "src/SmartAbp.Vue/src/api",
                ["VueTypesPath"] = "src/SmartAbp.Vue/src/types",
                ["VueComponentsPath"] = "src/SmartAbp.Vue/src/views",

                // 包名配置
                ["PackageNamespace"] = "@smartabp/lowcode",
                ["PackageVersion"] = "1.0.0"
            }
        };

        _logger.LogDebug("SmartAbp DevKit配置获取完成: NamespacePrefix={NamespacePrefix}",
            configuration.NamespacePrefix);

        return Task.FromResult(configuration);
    }
}
