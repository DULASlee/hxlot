using Volo.Abp.Modularity;
using Volo.Abp.DependencyInjection;
using Microsoft.Extensions.DependencyInjection;
using SmartAbp.DevKit.Abstractions.Metadata;
using SmartAbp.DevKit.Abstractions.Configuration;
using SmartAbp.DevKit.Abstractions.Generation;
using SmartAbp.DevKit.Integration.Adapters;
using SmartAbp.DevKit.Core.Generator;

namespace SmartAbp.DevKit.Integration;

/// <summary>
/// SmartAbp DevKit集成模块
/// 负责将DevKit抽象层与SmartAbp业务层进行适配集成
/// </summary>
[DependsOn(
    // DevKit.Core模块将在这里自动依赖
)]
public class SmartAbpDevKitModule : AbpModule
{
    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        var services = context.Services;

        // 注册SmartAbp适配器
        services.AddTransient<IMetadataProvider, SmartAbpMetadataProvider>();
        services.AddTransient<IConfigurationProvider, SmartAbpConfigurationProvider>();

        // 注册DevKit核心实现
        services.AddTransient<ICodeGenerator, GeneratorOrchestratorV2>();

        // 可选：如果需要特定的模板引擎实现
        // services.AddTransient<ITemplateEngine, HandlebarsTemplateEngine>();

        // 注册其他DevKit服务
        ConfigureDevKitServices(services);
    }

    private void ConfigureDevKitServices(IServiceCollection services)
    {
        // 这里可以添加其他DevKit相关服务的注册
        // 例如：缓存、文件管理、模板管理等

        // 添加内存缓存支持（用于元数据缓存）
        services.AddMemoryCache();

        // 添加日志记录
        services.AddLogging();
    }
}
