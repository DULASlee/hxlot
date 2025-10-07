using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SmartAbp.CodeGenerator.ApplicationServices;
using SmartAbp.CodeGenerator.Aspire;
using SmartAbp.CodeGenerator.Caching;
using SmartAbp.CodeGenerator.Core;
using SmartAbp.CodeGenerator.Core.FileOperations;
using SmartAbp.CodeGenerator.Core.Pipeline;
using SmartAbp.CodeGenerator.Core.Generation.Frontend; // 🔥 增强前端生成器
using SmartAbp.CodeGenerator.Core.Templates;
using SmartAbp.CodeGenerator.Core.Types;
using SmartAbp.CodeGenerator.Core.Validation;
using SmartAbp.CodeGenerator.CQRS;
using SmartAbp.CodeGenerator.DDD;
using SmartAbp.CodeGenerator.Hubs;
using SmartAbp.CodeGenerator.Services;
using SmartAbp.CodeGenerator.Infrastructure;
using SmartAbp.CodeGenerator.Messaging;
using SmartAbp.CodeGenerator.Quality;
using SmartAbp.CodeGenerator.Telemetry;
using SmartAbp.CodeGenerator.Testing;
using Volo.Abp;
using Volo.Abp.AutoMapper;
using Volo.Abp.Modularity;
using SmartAbp.CodeGenerator.ABP;

namespace SmartAbp.CodeGenerator
{
    /// <summary>
    /// SmartAbp Code Generator Module
    /// Provides enterprise-grade code generation capabilities
    /// </summary>
    [DependsOn(
        typeof(AbpAutoMapperModule)
    )]
    public class SmartAbpCodeGeneratorModule : AbpModule
    {
        public override void ConfigureServices(ServiceConfigurationContext context)
        {
            var services = context.Services;
            var configuration = context.Services.GetConfiguration();
            
            // Core code generation services
            services.AddSingleton<AdvancedMemoryManager>();
            services.AddSingleton<PerformanceCounters>();
            services.AddScoped<RoslynCodeEngine>();
            
            // Pattern generators
            services.AddScoped<CqrsPatternGenerator>();
            services.AddScoped<DomainDrivenDesignGenerator>();
            
            // Progress tracking
            services.AddSingleton<CodeGenerationProgressService>();
            
            // SignalR Hub
            services.AddSignalR();
            
                // 🔥 务实模板系统 - 修复自检发现的致命缺陷
                services.AddScoped<ReliableTemplatePathResolver>();
                services.AddScoped<SimpleVariableReplacer>();
                services.AddScoped<PragmaticTemplateService>();
                
                // 🏢 企业版特性：内嵌模板资源提取器
                services.AddScoped<IEmbeddedTemplateExtractor, EmbeddedTemplateExtractor>();
            
            // 🔥 完整类型映射系统 - 支持现代C#所有类型
            services.AddScoped<CompleteTypeMapper>();
            
            // 🔥 循环引用检测系统 - 防止复杂模型生成器崩溃
            services.AddScoped<SimpleCircularReferenceDetector>();
            
            // 🔥 增强模型处理器 - 集成类型映射和循环引用检测
            services.AddScoped<EnhancedModelProcessor>();
            
            // 🔥 增强C#语法验证器 - 协助请求2：基础语法错误检测
            services.AddScoped<EnhancedCSharpSyntaxValidator>();
            
            // 🔥 安全文件操作系统 - 原子性写入和冲突解决
            services.AddScoped<FileConflictResolver>();
            services.AddScoped<AtomicFileWriter>();
            
            // 🔥 稳定生成流水线系统 - 异常恢复和进度监控
            services.AddScoped<GenerationProgressTracker>();
            services.AddScoped<GenerationQualityChecker>();
            services.AddScoped<StableGenerationPipeline>();
            
            // 🔥 增强前端生成器 - Vue3模板驱动实现
            services.AddScoped<EnhancedFrontendGenerator>();
            
            // 🎨 Vue3组件订制优化器 - 协助请求3：业务逻辑扩展点
            services.AddScoped<Vue3ComponentCustomizer>();
            
            // ABP Integration
            services.AddScoped<AbpModuleGenerator>();
            services.AddTransient<ITemplateService, FileBasedTemplateService>();

            // Application services - 正确注册接口和实现映射
            services.AddScoped<ICodeGenerationAppService, CodeGenerationAppService>();
            services.AddScoped<DefaultUIConfigGenerator>();
            services.AddScoped<FrontendIntegrationService>();
            
            // Configure code generator options
            services.Configure<CodeGeneratorOptions>(options =>
            {
                options.OutputPath = configuration["CodeGenerator:OutputPath"] ?? "./Generated";
                options.TemplatesPath = configuration["CodeGenerator:TemplatesPath"] ?? "./templates";
                options.EnableOptimizations = configuration.GetValue<bool>("CodeGenerator:EnableOptimizations", true);
                options.EnableTelemetry = configuration.GetValue<bool>("CodeGenerator:EnableTelemetry", true);
                options.EnableQualityGates = configuration.GetValue<bool>("CodeGenerator:EnableQualityGates", true);
            });
            
            // 🔥 务实模板系统配置 - 支持多环境模板路径
            services.Configure<TemplateConfiguration>(options =>
            {
                options.TemplateRootPath = configuration["CodeGeneration:TemplateRootPath"];
                options.FallbackTemplatePath = configuration["CodeGeneration:FallbackTemplatePath"] ?? "./embedded-templates";
                options.EnableEmbeddedTemplates = configuration.GetValue<bool>("CodeGeneration:EnableEmbeddedTemplates", true);
                options.EnableTemplateValidation = configuration.GetValue<bool>("CodeGeneration:EnableTemplateValidation", true);
            });
            
            // Configure AutoMapper
            Configure<AbpAutoMapperOptions>(options =>
            {
                options.AddMaps<SmartAbpCodeGeneratorModule>();
            });
        }
        
        public override void OnApplicationInitialization(ApplicationInitializationContext context)
        {
            // Initialize performance counters
            var performanceCounters = context.ServiceProvider.GetRequiredService<PerformanceCounters>();
            performanceCounters.Initialize();
            
            // Warm up the Roslyn code engine
            var codeEngine = context.ServiceProvider.GetRequiredService<RoslynCodeEngine>();
            _ = Task.Run(async () =>
            {
                try
                {
                    // Perform JIT warmup in background
                    await codeEngine.WarmupAsync();
                }
                catch
                {
                    // Ignore warmup errors during startup
                }
            });
        }
        
        public override void OnApplicationShutdown(ApplicationShutdownContext context)
        {
            // Cleanup resources
            var memoryManager = context.ServiceProvider.GetService<AdvancedMemoryManager>();
            memoryManager?.Dispose();
            
            var codeEngine = context.ServiceProvider.GetService<RoslynCodeEngine>();
            codeEngine?.Dispose();
        }
    }
    
    /// <summary>
    /// Configuration options for the code generator
    /// </summary>
    public class CodeGeneratorOptions
    {
        public string OutputPath { get; set; } = "./Generated";
        public string TemplatesPath { get; set; } = "./templates";
        public bool EnableOptimizations { get; set; } = true;
        public bool EnableTelemetry { get; set; } = true;
        public bool EnableQualityGates { get; set; } = true;
        public int MaxConcurrentGenerations { get; set; } = Environment.ProcessorCount;
        public TimeSpan GenerationTimeout { get; set; } = TimeSpan.FromMinutes(5);
        public bool EnableIncrementalGeneration { get; set; } = true;
        public bool EnableTemplateValidation { get; set; } = true;
    }
}