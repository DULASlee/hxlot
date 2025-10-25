using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Logging;
using SmartAbp.DevKit.Core.Abstractions;
using SmartAbp.DevKit.Core.Config;
using SmartAbp.DevKit.Core.Flow;
using SmartAbp.DevKit.Core.Metadata;
using SmartAbp.DevKit.Core.Monitoring;
using SmartAbp.DevKit.Core.Quality;
using SmartAbp.DevKit.Core.Templates;
using SmartAbp.DevKit.Core.Workstations;
using Volo.Abp;
using Volo.Abp.Autofac;
using Volo.Abp.Modularity;

namespace SmartAbp.DevKit.Core;

/// <summary>
/// SmartAbp DevKit核心模块
/// 提供代码生成和AI流水线服务
///
/// 核心功能：
/// - AI流水线控制器（AIFlowController）
/// - 模板管理器（TemplateManager - Handlebars.Net）
/// - 质量门禁执行器（QualityGateEnforcer）
/// - 后端工位（BackendWorkstation）
/// - 前端工位（FrontendWorkstation）
/// - 统一元数据SDK（UnifiedMetadataSDK）
/// - 性能监控（MetricsCollector）
/// </summary>
[DependsOn(
    typeof(AbpAutofacModule)
)]
public class SmartAbpDevKitCoreModule : AbpModule
{
    public override void PreConfigureServices(ServiceConfigurationContext context)
    {
        // 预配置
        Console.WriteLine("🔧 [DevKit] PreConfigureServices: 开始配置DevKit核心模块...");
    }

    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        var services = context.Services;
        var configuration = context.Services.GetConfiguration();

        Console.WriteLine("🚀 [DevKit] ConfigureServices: 注册核心服务...");

        // ==================== 核心服务注册 ====================

        // 1. 配置管理
        services.TryAddSingleton<DevKitConfig>(sp =>
        {
            var config = DevKitConfig.Load("devkit.config.json");
            Console.WriteLine($"✅ [DevKit] DevKitConfig已加载: Namespace={config.NamespacePrefix}");
            return config;
        });

        // 2. 内存缓存（用于TemplateManager）
        services.TryAddSingleton<IMemoryCache>(sp =>
        {
            var memoryCache = new MemoryCache(new MemoryCacheOptions
            {
                SizeLimit = 1000 // LRU缓存大小
            });
            Console.WriteLine("✅ [DevKit] IMemoryCache已注册（LRU缓存）");
            return memoryCache;
        });

        // 3. 模板管理器（单例）
        services.TryAddSingleton<TemplateManager>(sp =>
        {
            var logger = sp.GetRequiredService<ILogger<TemplateManager>>();
            var templateEngine = sp.GetRequiredService<ITemplateEngine>();
            var templateManager = new Templates.TemplateManager(logger, templateEngine, "templates");

            // 注册Handlebars Helpers（默认helpers已在HandlebarsTemplateEngine中注册）
            templateManager.RegisterHelpers();

            Console.WriteLine("✅ [DevKit] TemplateManager已注册并初始化Helpers");
            return templateManager;
        });

        // 4. 统一元数据SDK（单例）
        services.TryAddSingleton<UnifiedMetadataSDK>();

        // ==================== 新架构代码生成器注册（v3.0） ====================

        // 4.5.1 生成器工厂（单例 - 依赖倒置原则核心）
        services.AddSingleton<SmartAbp.DevKit.Abstractions.Generation.IGeneratorFactory, Generator.DefaultGeneratorFactory>();
        Console.WriteLine("✅ [DevKit] IGeneratorFactory已注册（DefaultGeneratorFactory）");

        // 4.5.2 超级编排器（瞬态 - 只依赖工厂接口）
        services.AddTransient<SmartAbp.DevKit.Abstractions.Generation.ICodeGenerator, Generator.GeneratorOrchestratorV2>();
        Console.WriteLine("✅ [DevKit] ICodeGenerator已注册（GeneratorOrchestratorV2）");

        // 4.5.3 分层代码生成器（瞬态 - 实现ILayerGenerator接口）
        services.AddTransient<SmartAbp.DevKit.Abstractions.Generation.ILayerGenerator, Generator.Implementations.AppServiceLayerGenerator>();
        services.AddTransient<SmartAbp.DevKit.Abstractions.Generation.ILayerGenerator, Generator.Implementations.ControllerLayerGenerator>();
        services.AddTransient<SmartAbp.DevKit.Abstractions.Generation.ILayerGenerator, Generator.Implementations.EntityDtoLayerGenerator>();
        services.AddTransient<SmartAbp.DevKit.Abstractions.Generation.ILayerGenerator, Generator.Implementations.VueCrudPageLayerGenerator>();
        Console.WriteLine("✅ [DevKit] 4个LayerGenerator已注册（AppService, Controller, EntityDto, VueCrudPage）");

        // 4.5.4 增强生成器（P0阶段 - 租户管理代码生成通道）
        services.AddTransient<SmartAbp.DevKit.Abstractions.Generation.ILayerGenerator, Generator.EnhancedGenerators.EnumGenerator>();
        services.AddTransient<SmartAbp.DevKit.Abstractions.Generation.ILayerGenerator, Generator.EnhancedGenerators.TypeScriptTypeGenerator>();
        services.AddTransient<SmartAbp.DevKit.Abstractions.Generation.ILayerGenerator, Generator.EnhancedGenerators.ApiClientGenerator>();
        services.AddTransient<SmartAbp.DevKit.Abstractions.Generation.ILayerGenerator, Generator.EnhancedGenerators.PiniaStoreGenerator>();
        Console.WriteLine("✅ [DevKit] 4个EnhancedGenerator已注册（Enum, TypeScript, ApiClient, PiniaStore）");

        // 4.5.5 P1阶段生成器（核心功能增强）
        services.AddTransient<SmartAbp.DevKit.Abstractions.Generation.ILayerGenerator, Generator.EnhancedGenerators.VueFormComponentGenerator>();
        services.AddTransient<SmartAbp.DevKit.Abstractions.Generation.ILayerGenerator, Generator.EnhancedGenerators.TreeStructureGenerator>();
        Console.WriteLine("✅ [DevKit] 2个P1Generator已注册（VueForm, TreeStructure）");

        // 4.5.6 P2阶段生成器（高级功能）
        services.AddTransient<SmartAbp.DevKit.Abstractions.Generation.ILayerGenerator, Generator.EnhancedGenerators.BatchOperationGenerator>();
        services.AddTransient<SmartAbp.DevKit.Abstractions.Generation.ILayerGenerator, Generator.EnhancedGenerators.ImportExportGenerator>();
        Console.WriteLine("✅ [DevKit] 2个P2Generator已注册（Batch, ImportExport）");

        // 4.5.4 旧版生成器（保留用于兼容性）
        services.AddTransient<Generator.AspireHostGenerator>();
        Console.WriteLine("✅ [DevKit] AspireHostGenerator已注册（兼容旧版）");

        // 5. 性能监控收集器（单例）
        services.TryAddSingleton<MetricsCollector>();

        // 6. 质量门禁执行器（单例）
        services.TryAddSingleton<QualityGateEnforcer>();

        // 7. AI流水线控制器（单例）
        services.TryAddSingleton<AIFlowController>(sp =>
        {
            var logger = sp.GetRequiredService<Microsoft.Extensions.Logging.ILogger<AIFlowController>>();
            var metricsCollector = sp.GetRequiredService<MetricsCollector>();
            var flowController = new AIFlowController(logger, metricsCollector);

            Console.WriteLine("✅ [DevKit] AIFlowController已创建");

            // 注册默认工位
            var templateManager = sp.GetRequiredService<TemplateManager>();
            var metadataSDK = sp.GetRequiredService<UnifiedMetadataSDK>();

            // 后端工位
            var backendWorkstation = new BackendWorkstation(
                sp.GetRequiredService<Microsoft.Extensions.Logging.ILogger<BackendWorkstation>>(),
                templateManager,
                metadataSDK
            );

            flowController.RegisterWorkstation(new Types.WorkstationConfig
            {
                Id = "backend",
                Name = "后端代码生成工位",
                Type = Types.WorkstationType.Backend,
                Handler = async (input) => await backendWorkstation.ExecuteAsync(input, CancellationToken.None)
            });

            Console.WriteLine("  ✅ 后端工位已注册");

            // 前端工位
            var frontendWorkstation = new FrontendWorkstation(
                sp.GetRequiredService<Microsoft.Extensions.Logging.ILogger<FrontendWorkstation>>()
            );

            flowController.RegisterWorkstation(new Types.WorkstationConfig
            {
                Id = "frontend",
                Name = "前端代码生成工位",
                Type = Types.WorkstationType.Frontend,
                Handler = async (input) => await frontendWorkstation.ExecuteAsync(input, CancellationToken.None)
            });

            Console.WriteLine("  ✅ 前端工位已注册");

            return flowController;
        });

        // 8. 命令服务（Transient - 每次调用创建新实例）
        services.AddTransient<DevKitCommandService>();

        Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        Console.WriteLine("✅ [DevKit] 核心模块配置完成！（v4.0架构 - P0/P1/P2生成器全集成）");
        Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        Console.WriteLine("   🏗️  新架构代码生成器（v3.1 - 符合SOLID原则）:");
        Console.WriteLine("      • IGeneratorFactory - 工厂接口");
        Console.WriteLine("      • DefaultGeneratorFactory - 工厂实现");
        Console.WriteLine("      • GeneratorOrchestratorV2 - 超级编排器");
        Console.WriteLine("      【基础生成器】");
        Console.WriteLine("      • AppServiceLayerGenerator - 应用服务生成器");
        Console.WriteLine("      • ControllerLayerGenerator - 控制器生成器");
        Console.WriteLine("      • EntityDtoLayerGenerator - DTO生成器");
        Console.WriteLine("      • VueCrudPageLayerGenerator - Vue页面生成器");
        Console.WriteLine("      【🔥增强生成器 - P0阶段】");
        Console.WriteLine("      • EnumGenerator - 枚举类型生成器（C# + TypeScript）");
        Console.WriteLine("      • TypeScriptTypeGenerator - TS类型定义生成器");
        Console.WriteLine("      • ApiClientGenerator - 前端API服务生成器");
        Console.WriteLine("      • PiniaStoreGenerator - Pinia状态管理生成器");
        Console.WriteLine("      【⭐P1阶段生成器 - 核心功能增强】");
        Console.WriteLine("      • VueFormComponentGenerator - Vue表单生成器（支持字段分组）");
        Console.WriteLine("      • TreeStructureGenerator - 树形结构生成器（递归查询 + el-tree）");
        Console.WriteLine("      【🚀P2阶段生成器 - 高级功能】");
        Console.WriteLine("      • BatchOperationGenerator - 批量操作生成器（删除/启用/禁用）");
        Console.WriteLine("      • ImportExportGenerator - 导入导出生成器（Excel）");
        Console.WriteLine("   📋 核心服务:");
        Console.WriteLine("      • AIFlowController - AI流水线");
        Console.WriteLine("      • TemplateManager - 模板管理");
        Console.WriteLine("      • QualityGateEnforcer - 质量门禁");
        Console.WriteLine("      • BackendWorkstation - 后端工位");
        Console.WriteLine("      • FrontendWorkstation - 前端工位");
        Console.WriteLine("      • MetricsCollector - 性能监控");
        Console.WriteLine("      • UnifiedMetadataSDK - 元数据SDK");
        Console.WriteLine("      • DevKitCommandService - 命令服务");
        Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    }

    public override void OnApplicationInitialization(ApplicationInitializationContext context)
    {
        Console.WriteLine("🚀 [DevKit] OnApplicationInitialization: DevKit模块已启动！");

        // 验证核心服务是否正确注册
        var serviceProvider = context.ServiceProvider;

        try
        {
            var flowController = serviceProvider.GetService<AIFlowController>();
            var templateManager = serviceProvider.GetService<TemplateManager>();
            var qualityGate = serviceProvider.GetService<QualityGateEnforcer>();

            if (flowController != null && templateManager != null && qualityGate != null)
            {
                Console.WriteLine("✅ [DevKit] 核心服务验证成功！");
            }
            else
            {
                Console.WriteLine("⚠️ [DevKit] 警告：部分核心服务未能正确注册");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ [DevKit] 错误：服务验证失败 - {ex.Message}");
        }
    }

    public override void OnApplicationShutdown(ApplicationShutdownContext context)
    {
        Console.WriteLine("🛑 [DevKit] OnApplicationShutdown: DevKit模块正在关闭...");

        // 清理资源
        var memoryCache = context.ServiceProvider.GetService<IMemoryCache>();
        if (memoryCache is IDisposable disposable)
        {
            disposable.Dispose();
            Console.WriteLine("✅ [DevKit] IMemoryCache已释放");
        }
    }
}

/// <summary>
/// DevKit命令服务
/// 提供代码生成的命令行接口
///
/// 使用方式：
/// var commandService = serviceProvider.GetRequiredService<DevKitCommandService>();
/// await commandService.GenerateEntityAsync("Product", "产品");
/// </summary>
public class DevKitCommandService
{
    private readonly AIFlowController _flowController;
    private readonly UnifiedMetadataSDK _metadataSDK;
    private readonly Microsoft.Extensions.Logging.ILogger<DevKitCommandService> _logger;

    public DevKitCommandService(
        AIFlowController flowController,
        UnifiedMetadataSDK metadataSDK,
        Microsoft.Extensions.Logging.ILogger<DevKitCommandService> logger)
    {
        _flowController = flowController;
        _metadataSDK = metadataSDK;
        _logger = logger;
    }

    /// <summary>
    /// 生成实体代码（完整CRUD）
    /// </summary>
    /// <param name="entityName">实体名称（英文）</param>
    /// <param name="displayName">显示名称（中文）</param>
    /// <param name="properties">属性列表</param>
    /// <returns>生成结果</returns>
    public async Task<Types.GenerationResult> GenerateEntityAsync(
        string entityName,
        string displayName,
        List<Types.PropertySchema>? properties = null)
    {
        _logger.LogInformation("🚀 [DevKitCommand] 开始生成实体: {EntityName} ({DisplayName})", entityName, displayName);

        try
        {
            // 创建默认属性（如果未提供）
            properties ??= new List<Types.PropertySchema>
            {
                new Types.PropertySchema
                {
                    Id = Guid.NewGuid(),
                    Name = "Id",
                    DisplayName = "ID",
                    Type = "Guid",
                    IsKey = true,
                    IsRequired = true
                },
                new Types.PropertySchema
                {
                    Id = Guid.NewGuid(),
                    Name = "Name",
                    DisplayName = "名称",
                    Type = "string",
                    IsRequired = true
                }
            };

            // 创建实体Schema
            var entitySchema = new Types.EntitySchema
            {
                Id = Guid.NewGuid(),
                Name = entityName,
                DisplayName = displayName,
                Properties = properties,
                Relationships = new List<Types.RelationshipSchema>()
            };

            // 创建生成上下文
            var context = new Types.GenerationContext
            {
                EntitySchema = entitySchema,
                TargetFramework = "fullstack",
                TemplateEngine = "handlebars"
            };

            // 执行AI流水线
            var result = await _flowController.StartFlowAsync(context);

            if (result.Success)
            {
                _logger.LogInformation("✅ [DevKitCommand] 实体生成成功: {EntityName}", entityName);
            }
            else
            {
                _logger.LogError("❌ [DevKitCommand] 实体生成失败: {EntityName} - {Errors}",
                    entityName, string.Join(", ", result.Errors));
            }

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ [DevKitCommand] 实体生成异常: {EntityName}", entityName);
            throw;
        }
    }

    /// <summary>
    /// 生成模块代码（包含多个实体）
    /// </summary>
    /// <param name="moduleName">模块名称</param>
    /// <param name="entities">实体列表</param>
    /// <returns>生成结果列表</returns>
    public async Task<List<Types.GenerationResult>> GenerateModuleAsync(
        string moduleName,
        List<Types.EntitySchema> entities)
    {
        _logger.LogInformation("🚀 [DevKitCommand] 开始生成模块: {ModuleName} (包含{Count}个实体)",
            moduleName, entities.Count);

        var results = new List<Types.GenerationResult>();

        foreach (var entity in entities)
        {
            var context = new Types.GenerationContext
            {
                EntitySchema = entity,
                TargetFramework = "fullstack",
                TemplateEngine = "handlebars"
            };

            var result = await _flowController.StartFlowAsync(context);
            results.Add(result);

            _logger.LogInformation("  ✅ 实体生成完成: {EntityName}", entity.Name);
        }

        _logger.LogInformation("✅ [DevKitCommand] 模块生成完成: {ModuleName} (成功{Success}/{Total})",
            moduleName, results.Count(r => r.Success), results.Count);

        return results;
    }

    /// <summary>
    /// 获取性能指标报告
    /// </summary>
    public MetricsReport GetPerformanceReport()
    {
        var metricsCollector = _flowController.GetType()
            .GetProperty("MetricsCollector", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)
            ?.GetValue(_flowController) as MetricsCollector;

        if (metricsCollector == null)
        {
            _logger.LogWarning("⚠️ 性能指标收集器未启用");
            return new MetricsReport
            {
                GeneratedAt = DateTime.Now,
                TotalExecutions = 0,
                TotalErrors = 0,
                WorkstationMetrics = new List<WorkstationMetrics>()
            };
        }

        return metricsCollector.GenerateReport();
    }

    /// <summary>
    /// 重置性能指标
    /// </summary>
    public void ResetMetrics()
    {
        var metricsCollector = _flowController.GetType()
            .GetProperty("MetricsCollector", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)
            ?.GetValue(_flowController) as MetricsCollector;

        metricsCollector?.Reset();
        _logger.LogInformation("🔄 [DevKitCommand] 性能指标已重置");
    }
}

