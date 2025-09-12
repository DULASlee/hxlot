using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SmartAbp.CodeGenerator.ApplicationServices;
using SmartAbp.CodeGenerator.Aspire;
using SmartAbp.CodeGenerator.Caching;
using SmartAbp.CodeGenerator.Core;
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
            
            // Application service
            services.AddScoped<CodeGenerationAppService>();
            
            // Configure code generator options
            services.Configure<CodeGeneratorOptions>(options =>
            {
                options.OutputPath = configuration["CodeGenerator:OutputPath"] ?? "./Generated";
                options.TemplatesPath = configuration["CodeGenerator:TemplatesPath"] ?? "./templates";
                options.EnableOptimizations = configuration.GetValue<bool>("CodeGenerator:EnableOptimizations", true);
                options.EnableTelemetry = configuration.GetValue<bool>("CodeGenerator:EnableTelemetry", true);
                options.EnableQualityGates = configuration.GetValue<bool>("CodeGenerator:EnableQualityGates", true);
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