using System;
using System.Linq;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Options;
using SmartAbp.Permissions.Alerting;
using SmartAbp.Permissions.Analytics;
using SmartAbp.Permissions.BackgroundServices;
using SmartAbp.Permissions.Cache;
using SmartAbp.Permissions.Configuration;
using SmartAbp.Permissions.Documentation;
using SmartAbp.Permissions.Health;
using SmartAbp.Permissions.Integration;
using SmartAbp.Permissions.Memory;
using SmartAbp.Permissions.Performance;
using SmartAbp.Permissions.Security;
using SmartAbp.Permissions.Testing;
using Volo.Abp.DistributedLocking;
using Volo.Abp.Modularity;

namespace SmartAbp.Permissions.DependencyInjection
{
    /// <summary>
    /// 企业级权限服务依赖注入扩展
    /// </summary>
    public static class EnterpriseServiceExtensions
    {
        /// <summary>
        /// 添加企业级权限服务
        /// </summary>
        /// <param name="services">服务集合</param>
        /// <returns>服务集合</returns>
        public static IServiceCollection AddEnterprisePermissionServices(this IServiceCollection services)
        {
            // 分布式锁服务
            services.AddSingleton<IAbpDistributedPermissionCacheLock, AbpDistributedPermissionCacheLock>();
            
            // 性能监控服务
            services.AddSingleton<IPermissionPerformanceMonitor, PermissionPerformanceMonitor>();
            
            // 内存管理服务
            services.AddSingleton<IMemoryManagementService, MemoryManagementService>();
            
            // 配置管理服务
            services.Configure<PermissionConfigurationOptions>(options =>
            {
                // 默认配置
                options.EnableDynamicConfiguration = true;
                options.ConfigurationUpdateIntervalSeconds = 300;
                options.ConfigurationCacheExpirationMinutes = 60;
                options.ConfigurationValidationIntervalSeconds = 3600;
                options.EnableConfigurationHotReload = true;
                options.NotificationType = ConfigurationNotificationType.Log;
                options.StorageType = ConfigurationStorageType.File;
            });
            services.AddSingleton<IPermissionConfigurationService, PermissionConfigurationService>();
            
            // 告警服务
            services.Configure<AlertNotificationOptions>(options =>
            {
                // 默认配置
                options.EnableEmailNotification = true;
                options.EnableWebhookNotification = false;
                options.EnableSmsNotification = false;
                options.AlertSuppressionMinutes = 5;
                options.MaxRepeatCount = 10;
                options.NotificationLevelThreshold = AlertLevel.Warning;
            });
            services.AddSingleton<IPermissionAlertingService, PermissionAlertingService>();
            
            // 集成服务
            services.AddSingleton<IEnterpriseIntegrationService, EnterpriseIntegrationService>();
            
            return services;
        }

        /// <summary>
        /// 配置分布式锁服务
        /// </summary>
        private static void ConfigureDistributedLocking(IServiceCollection services, IConfiguration configuration)
        {
            // 注册基于ABP的分布式权限缓存锁
            services.TryAddTransient<IAbpDistributedPermissionCacheLock, AbpDistributedPermissionCacheLock>();
            
            // 注册基于Redis的分布式权限缓存锁（作为备选方案）
            services.TryAddTransient<IDistributedPermissionCacheLock, RedisDistributedPermissionCacheLock>();

            // 注册分布式锁服务扩展
            services.AddDistributedPermissionCacheLock();
        }

        /// <summary>
        /// 配置性能监控服务
        /// </summary>
        private static void ConfigurePerformanceMonitoring(IServiceCollection services, IConfiguration configuration)
        {
            // 注册性能监控服务
            services.TryAddTransient<IPermissionPerformanceMonitor, PermissionPerformanceMonitor>();
            
            // 配置性能监控日志
            services.AddLogging(builder =>
            {
                builder.AddFilter("SmartAbp.Permissions.Performance", LogLevel.Information);
            });
        }

        /// <summary>
        /// 配置内存管理服务
        /// </summary>
        private static void ConfigureMemoryManagement(IServiceCollection services, IConfiguration configuration)
        {
            // 配置内存管理选项
            services.Configure<MemoryManagementOptions>(options =>
            {
                configuration.GetSection("MemoryManagement").Bind(options);
                
                // 设置默认值
                options.MemoryWarningThresholdMB = configuration.GetValue("MemoryManagement:MemoryWarningThresholdMB", 512L);
                options.MemoryCriticalThresholdMB = configuration.GetValue("MemoryManagement:MemoryCriticalThresholdMB", 1024L);
                options.MemoryLeakDetectionWindowHours = configuration.GetValue("MemoryManagement:MemoryLeakDetectionWindowHours", 2);
                options.AutoOptimizationIntervalMinutes = configuration.GetValue("MemoryManagement:AutoOptimizationIntervalMinutes", 30);
                options.DataRetentionHours = configuration.GetValue("MemoryManagement:DataRetentionHours", 24);
                options.EnableAutoOptimization = configuration.GetValue("MemoryManagement:EnableAutoOptimization", true);
                options.EnableMemoryLeakDetection = configuration.GetValue("MemoryManagement:EnableMemoryLeakDetection", true);
                options.GarbageCollectionMode = configuration.GetValue("MemoryManagement:GarbageCollectionMode", GCCollectionMode.Optimized);
            });

            // 注册内存管理服务
            services.TryAddTransient<IMemoryManagementService, MemoryManagementService>();
            
            // 注册内存管理后台服务
            services.AddHostedService<MemoryManagementService>();

            // 配置内存管理日志
            services.AddLogging(builder =>
            {
                builder.AddFilter("SmartAbp.Permissions.Memory", LogLevel.Information);
            });
        }

        /// <summary>
        /// 配置高级缓存服务
        /// </summary>
        private static void ConfigureAdvancedCaching(IServiceCollection services, IConfiguration configuration)
        {
            // 配置缓存选项
            services.Configure<PermissionCacheOptions>(options =>
            {
                configuration.GetSection("PermissionCaching").Bind(options);
                
                // 设置默认值
                options.CacheExpirationMinutes = configuration.GetValue("PermissionCaching:CacheExpirationMinutes", 60);
                options.CacheSlidingExpirationMinutes = configuration.GetValue("PermissionCaching:CacheSlidingExpirationMinutes", 15);
                options.EnableDistributedCache = configuration.GetValue("PermissionCaching:EnableDistributedCache", true);
                options.EnableMemoryCache = configuration.GetValue("PermissionCaching:EnableMemoryCache", true);
                options.MaxCacheSizeMB = configuration.GetValue("PermissionCaching:MaxCacheSizeMB", 100);
                options.CacheKeyPrefix = configuration.GetValue("PermissionCaching:CacheKeyPrefix", "SmartAbp:Permissions:");
            });

            // 注册高级缓存服务
            services.TryAddTransient<IPermissionCacheService, PermissionCacheService>();
            
            // 注册缓存预热服务
            services.TryAddTransient<IPermissionCachePrewarmService, PermissionCachePrewarmService>();

            // 配置Redis缓存（如果使用分布式缓存）
            if (configuration.GetValue("PermissionCaching:EnableDistributedCache", true))
            {
                services.AddStackExchangeRedisCache(options =>
                {
                    options.Configuration = configuration.GetConnectionString("Redis") ?? "localhost:6379";
                    options.InstanceName = configuration.GetValue("PermissionCaching:RedisInstanceName", "SmartAbp");
                });
            }
        }

        /// <summary>
        /// 配置企业级监控和告警集成
        /// </summary>
        public static IServiceCollection AddEnterpriseMonitoring(this IServiceCollection services, IConfiguration configuration)
        {
            // 配置健康检查
            services.AddHealthChecks()
                .AddCheck<PermissionHealthCheck>("permission_cache")
                .AddCheck<PermissionHealthCheck>("permission_performance")
                .AddCheck<PermissionHealthCheck>("permission_memory");

            // 配置应用洞察（如果使用Azure）
            if (!string.IsNullOrEmpty(configuration["ApplicationInsights:InstrumentationKey"]))
            {
                // 注意：需要安装Microsoft.ApplicationInsights.AspNetCore包
                // services.AddApplicationInsightsTelemetry(configuration["ApplicationInsights:InstrumentationKey"]);
            }

            // 配置Prometheus监控（如果使用）
            if (configuration.GetValue("Monitoring:EnablePrometheus", false))
            {
                // 注意：需要安装相应的Prometheus包
                // services.AddSingleton<PermissionMetricsCollector>();
                // services.AddHostedService<PermissionMetricsExporter>();
            }

            return services;
        }

        /// <summary>
        /// 配置企业级安全特性
        /// </summary>
        public static IServiceCollection AddEnterpriseSecurity(this IServiceCollection services, IConfiguration configuration)
        {
            // 配置数据保护
            services.AddDataProtection()
                .SetApplicationName("SmartAbp")
                .PersistKeysToFileSystem(new System.IO.DirectoryInfo(@"shared\dataprotection-keys\"));

            // 配置速率限制
            services.Configure<PermissionRateLimitOptions>(options =>
            {
                configuration.GetSection("PermissionRateLimiting").Bind(options);
            });

            // 注册速率限制服务
            services.TryAddTransient<IPermissionRateLimitService, PermissionRateLimitService>();

            return services;
        }

        /// <summary>
        /// 配置企业级配置管理
        /// </summary>
        public static IServiceCollection AddEnterpriseConfiguration(this IServiceCollection services, IConfiguration configuration)
        {
            // 配置动态配置更新
            services.Configure<PermissionConfigurationOptions>(options =>
            {
                configuration.GetSection("PermissionConfiguration").Bind(options);
                options.EnableDynamicConfiguration = configuration.GetValue("PermissionConfiguration:EnableDynamicConfiguration", true);
                options.ConfigurationUpdateIntervalSeconds = configuration.GetValue("PermissionConfiguration:ConfigurationUpdateIntervalSeconds", 300);
            });

            // 注册配置服务
            services.TryAddTransient<IPermissionConfigurationService, PermissionConfigurationService>();

            return services;
        }

        /// <summary>
        /// 验证企业级服务配置
        /// </summary>
        public static void ValidateEnterpriseConfiguration(IServiceProvider serviceProvider)
        {
            var logger = serviceProvider.GetRequiredService<ILogger<EnterpriseServiceExtensions>>();
            
            try
            {
                // 验证分布式锁配置
                var distributedLockOptions = serviceProvider.GetRequiredService<IOptions<AbpDistributedLockOptions>>().Value;
                logger.LogInformation("Distributed locking configured with timeout: {Timeout}s", distributedLockOptions.Timeout);

                // 验证性能监控配置
                var performanceOptions = serviceProvider.GetRequiredService<IOptions<PermissionPerformanceMonitorOptions>>().Value;
                logger.LogInformation("Performance monitoring configured with threshold: {Threshold}ms, alerts: {Alerts}", 
                    performanceOptions.PerformanceThresholdMs, performanceOptions.EnableAlerts);

                // 验证内存管理配置
                var memoryOptions = serviceProvider.GetRequiredService<IOptions<MemoryManagementOptions>>().Value;
                logger.LogInformation("Memory management configured with warning: {Warning}MB, critical: {Critical}MB, auto-optimize: {AutoOptimize}", 
                    memoryOptions.MemoryWarningThresholdMB, memoryOptions.MemoryCriticalThresholdMB, memoryOptions.EnableAutoOptimization);

                logger.LogInformation("Enterprise permission services configuration validated successfully");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error validating enterprise permission services configuration");
                throw;
            }
        }
        /// <summary>
        /// 添加企业级后台服务
        /// </summary>
        /// <param name="services">服务集合</param>
        /// <returns>服务集合</returns>
        public static IServiceCollection AddEnterpriseBackgroundServices(this IServiceCollection services)
        {
            services.AddEnterpriseBackgroundServices();
            return services;
        }

        /// <summary>
        /// 添加企业级后台服务（带配置）
        /// </summary>
        /// <param name="services">服务集合</param>
        /// <param name="configureHealthCheck">健康检查配置</param>
        /// <param name="configurePerformance">性能监控配置</param>
        /// <param name="configureMemory">内存管理配置</param>
        /// <param name="configureConfiguration">配置管理配置</param>
        /// <returns>服务集合</returns>
        public static IServiceCollection AddEnterpriseBackgroundServices(
            this IServiceCollection services,
            Action<BackgroundServices.HealthCheckBackgroundServiceOptions>? configureHealthCheck = null,
            Action<BackgroundServices.PerformanceMonitoringBackgroundServiceOptions>? configurePerformance = null,
            Action<BackgroundServices.MemoryManagementBackgroundServiceOptions>? configureMemory = null,
            Action<BackgroundServices.ConfigurationManagementBackgroundServiceOptions>? configureConfiguration = null)
        {
            services.AddEnterpriseBackgroundServices(
                configureHealthCheck,
                configurePerformance,
                configureMemory,
                configureConfiguration
            );
            return services;
        }

        /// <summary>
        /// 添加企业级权限服务（ABP模块扩展方法）
        /// </summary>
        /// <param name="context">服务配置上下文</param>
        /// <returns>服务配置上下文</returns>
        public static ServiceConfigurationContext AddEnterprisePermissionServices(this ServiceConfigurationContext context)
        {
            context.Services.AddEnterprisePermissionServices();
            return context;
        }

        /// <summary>
        /// 添加企业级权限服务（ABP模块扩展方法，带配置）
        /// </summary>
        /// <param name="context">服务配置上下文</param>
        /// <param name="configureDistributedLock">分布式锁配置</param>
        /// <param name="configurePerformance">性能监控配置</param>
        /// <param name="configureMemory">内存管理配置</param>
        /// <param name="configureAlerting">告警服务配置</param>
        /// <param name="configureIntegration">集成服务配置</param>
        /// <param name="configureHealthCheck">健康检查配置</param>
        /// <param name="configureConfiguration">配置管理配置</param>
        /// <param name="configureTesting">测试框架配置</param>
        /// <param name="configureDocumentation">文档生成器配置</param>
        /// <param name="configureSecurity">安全服务配置</param>
        /// <param name="configureAnalytics">分析服务配置</param>
        /// <param name="configureMonitoring">监控服务配置</param>
        /// <param name="configureLogging">日志服务配置</param>
        /// <returns>服务集合</returns>
        public static ServiceConfigurationContext AddEnterprisePermissionServices(
            this ServiceConfigurationContext context,
            Action<Volo.Abp.DistributedLocking.AbpDistributedLockOptions>? configureDistributedLock = null,
            Action<Memory.MemoryManagementOptions>? configureMemory = null,
            Action<Alerting.AlertNotificationOptions>? configureAlerting = null,
            Action<Integration.IntegrationConfiguration>? configureIntegration = null,
            Action<Health.EnterpriseHealthCheckOptions>? configureHealthCheck = null,
            Action<Configuration.PermissionConfigurationOptions>? configureConfiguration = null,
            Action<Testing.EnterpriseTestingOptions>? configureTesting = null,
            Action<Documentation.EnterpriseDocumentationOptions>? configureDocumentation = null,
            Action<Security.EnterpriseSecurityOptions>? configureSecurity = null,
            Action<Analytics.EnterpriseAnalyticsOptions>? configureAnalytics = null,
            Action<Monitoring.EnterpriseMonitoringOptions>? configureMonitoring = null,
            Action<Logging.EnterpriseLoggingOptions>? configureLogging = null)
        {
            context.Services.AddEnterprisePermissionServices(
                configureDistributedLock,
                configureMemory,
                configureAlerting,
                configureIntegration
            );
            
            context.Services.AddEnterpriseBackgroundServices(
                configureHealthCheck,
                null,
                null,
                configureConfiguration
            );
            
            context.Services.AddEnterpriseTestingFramework(configureTesting);
            context.Services.AddEnterpriseDocumentationGenerator(configureDocumentation);
            context.Services.AddEnterpriseSecurityService(configureSecurity);
            context.Services.AddEnterpriseAnalyticsService(configureAnalytics);
            context.Services.AddEnterpriseHealthCheckService(configureHealthCheck);
            context.Services.AddEnterpriseIntegrationService(configureIntegration);
            context.Services.AddEnterpriseMonitoringService(configureMonitoring);
            context.Services.AddEnterpriseAlertingService(configureAlerting);
            context.Services.AddEnterpriseLoggingService(configureLogging);
            
            configureAnalytics?.Invoke(new Analytics.EnterpriseAnalyticsOptions());
            configureHealthCheck?.Invoke(new Health.EnterpriseHealthCheckOptions());
            configureIntegration?.Invoke(new Integration.IntegrationConfiguration());
            configureMonitoring?.Invoke(new Monitoring.EnterpriseMonitoringOptions());
            configureAlerting?.Invoke(new Alerting.AlertNotificationOptions());
            configureLogging?.Invoke(new Logging.EnterpriseLoggingOptions());
            
            return context;
        }
    }
}