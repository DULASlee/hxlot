using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using SmartAbp.DevKit.Core.Flow;
using SmartAbp.DevKit.Core.Types;
using Volo.Abp;
using Volo.Abp.Autofac;
using Volo.Abp.Modularity;
using Volo.Abp.Testing;
using Xunit;

namespace SmartAbp.DevKit.Core.Tests.Integration;

/// <summary>
/// ABP集成测试
/// 验证DevKit在ABP模块系统中的正确运行
/// </summary>
public class AbpIntegrationTests : AbpIntegratedTest<SmartAbpDevKitCoreTestModule>
{
    private readonly IServiceProvider _serviceProvider;

    public AbpIntegrationTests()
    {
        _serviceProvider = GetRequiredService<IServiceProvider>();
    }

    [Fact]
    public void DevKitCoreModule_Should_Load_Successfully()
    {
        // Arrange & Act
        var flowController = _serviceProvider.GetService<AIFlowController>();

        // Assert
        Assert.NotNull(flowController);
    }

    [Fact]
    public void DevKitCommandService_Should_Be_Registered()
    {
        // Arrange & Act
        var commandService = _serviceProvider.GetService<DevKitCommandService>();

        // Assert
        Assert.NotNull(commandService);
    }

    [Fact]
    public async Task AIFlowController_Should_Generate_Code_Successfully()
    {
        // Arrange
        var flowController = _serviceProvider.GetRequiredService<AIFlowController>();

        var context = new GenerationContext
        {
            EntitySchema = new EntitySchema
            {
                Name = "Product",
                DisplayName = "产品",
                Properties = new List<PropertySchema>
                {
                    new PropertySchema
                    {
                        Name = "Name",
                        DisplayName = "名称",
                        Type = "string",
                        IsRequired = true
                    },
                    new PropertySchema
                    {
                        Name = "Price",
                        DisplayName = "价格",
                        Type = "decimal",
                        IsRequired = true
                    }
                }
            }
        };

        // Act
        var result = await flowController.StartFlowAsync(context);

        // Assert
        Assert.NotNull(result);
        Assert.True(result.Success, "代码生成应该成功");
        Assert.NotEmpty(result.Code);
        Assert.Contains("Product", result.Code);
    }

    [Fact]
    public void All_Core_Services_Should_Be_Registered()
    {
        // Arrange & Act
        var templateManager = _serviceProvider.GetService<SmartAbp.DevKit.Core.Templates.TemplateManager>();
        var qualityGate = _serviceProvider.GetService<SmartAbp.DevKit.Core.Quality.QualityGateEnforcer>();
        var metricsCollector = _serviceProvider.GetService<SmartAbp.DevKit.Core.Monitoring.MetricsCollector>();
        var backendWorkstation = _serviceProvider.GetService<SmartAbp.DevKit.Core.Workstations.BackendWorkstation>();
        var frontendWorkstation = _serviceProvider.GetService<SmartAbp.DevKit.Core.Workstations.FrontendWorkstation>();

        // Assert
        Assert.NotNull(templateManager);
        Assert.NotNull(qualityGate);
        Assert.NotNull(metricsCollector);
        Assert.NotNull(backendWorkstation);
        Assert.NotNull(frontendWorkstation);
    }

    protected override void SetAbpApplicationCreationOptions(AbpApplicationCreationOptions options)
    {
        options.UseAutofac();
    }
}

/// <summary>
/// 测试模块
/// </summary>
[DependsOn(typeof(AbpAutofacModule), typeof(SmartAbpDevKitCoreModule))]
public class SmartAbpDevKitCoreTestModule : AbpModule
{
    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        // 测试配置
    }
}

