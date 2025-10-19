using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using SmartAbp.DevKit.Core.Abstractions;
using SmartAbp.DevKit.Core.Logging;
using SmartAbp.DevKit.Core.Logging.Data;
using SmartAbp.DevKit.Core.Logging.Storage;
using SmartAbp.DevKit.Core.Upgrade;

namespace SmartAbp.DevKit.Core.Extensions;

/// <summary>
/// ServiceCollection扩展方法（注册DevKit服务）
/// </summary>
public static class ServiceCollectionExtensions
{
    /// <summary>
    /// 添加DevKit核心服务
    /// </summary>
    /// <param name="services">服务集合</param>
    /// <param name="dbConfiguration">数据库配置（可选，默认使用SQL Server LocalDB）</param>
    /// <returns>服务集合</returns>
    public static IServiceCollection AddDevKitCore(
        this IServiceCollection services,
        DevKitDbConfiguration? dbConfiguration = null)
    {
        // 使用默认配置（SQL Server LocalDB）
        dbConfiguration ??= DevKitDbConfiguration.GetDefaultSqlServerLocalDb();

        // 注册数据库上下文
        services.AddDbContextFactory<DevKitDbContext>(options =>
        {
            switch (dbConfiguration.Provider)
            {
                case DatabaseProvider.SqlServerLocalDb:
                case DatabaseProvider.SqlServer:
                    options.UseSqlServer(
                        dbConfiguration.ConnectionString,
                        sqlOptions =>
                        {
                            sqlOptions.EnableRetryOnFailure(
                                maxRetryCount: 3,
                                maxRetryDelay: TimeSpan.FromSeconds(30),
                                errorNumbersToAdd: null);
                        });
                    break;

                case DatabaseProvider.PostgreSql:
                    options.UseNpgsql(
                        dbConfiguration.ConnectionString,
                        npgsqlOptions =>
                        {
                            npgsqlOptions.EnableRetryOnFailure(
                                maxRetryCount: 3,
                                maxRetryDelay: TimeSpan.FromSeconds(30),
                                errorCodesToAdd: null);
                        });
                    break;

                default:
                    throw new ArgumentException(
                        $"Unsupported database provider: {dbConfiguration.Provider}");
            }

            // 开发环境启用敏感数据日志
#if DEBUG
            options.EnableSensitiveDataLogging();
            options.EnableDetailedErrors();
#endif
        });

        // 注册日志存储
        services.AddSingleton<ILogStorage, EfCoreLogStorage>();
        services.AddSingleton<IPerformanceLogStorage, EfCorePerformanceLogStorage>();

        // 注册日志通道（单例，全局共享）
        services.AddSingleton(sp =>
        {
            var storage = sp.GetRequiredService<ILogStorage>();
            var logger = sp.GetRequiredService<ILogger<LogChannel>>();
            return new LogChannel(storage, logger);
        });

        // 注册性能分析器（瞬态，每次使用创建新实例）
        services.AddTransient<IPerformanceProfiler>(sp =>
        {
            var storage = sp.GetRequiredService<IPerformanceLogStorage>();
            var logger = sp.GetRequiredService<ILogger<PerformanceProfiler>>();
            return new PerformanceProfiler(storage, logger);
        });

        // 注册数据库初始化器
        services.AddSingleton<DbInitializer>();

        // 注册核心引擎
        services.AddSingleton<CodeGeneratorEngine>();

        // 注册备份管理器
        services.AddSingleton<IBackupManager, BackupManager>();

        // 注册升级管理器
        services.AddSingleton<IUpgradeManager, UpgradeManager>();

        // 注册配置管理器（待实现）
        // services.AddSingleton<IConfigurationManager, ConfigurationManager>();

        // 注册模板引擎
        services.AddSingleton<ITemplateEngine>(sp =>
        {
            var logger = sp.GetRequiredService<ILogger<Templates.HandlebarsTemplateEngine>>();
            var templateBasePath = dbConfiguration.TemplateBasePath ?? "templates";
            return new Templates.HandlebarsTemplateEngine(logger, templateBasePath);
        });

        // 注册模板管理器
        services.AddSingleton<Templates.TemplateManager>();

        // 如果启用了日志记录，添加到LoggingBuilder
        if (dbConfiguration.EnableLogging)
        {
            services.AddLogging(builder =>
            {
                var logChannel = services.BuildServiceProvider().GetRequiredService<LogChannel>();
                builder.AddDevKitLogger(logChannel, LogLevel.Information);
            });
        }

        return services;
    }

    /// <summary>
    /// 初始化DevKit数据库（应用启动时调用）
    /// </summary>
    /// <param name="serviceProvider">服务提供程序</param>
    /// <returns>是否成功初始化</returns>
    public static async Task<bool> InitializeDevKitDatabaseAsync(this IServiceProvider serviceProvider)
    {
        var initializer = serviceProvider.GetRequiredService<DbInitializer>();
        return await initializer.InitializeAsync();
    }

    /// <summary>
    /// 添加DevKit服务（使用SQL Server LocalDB）
    /// </summary>
    public static IServiceCollection AddDevKitWithSqlServer(
        this IServiceCollection services,
        string connectionString)
    {
        var config = new DevKitDbConfiguration
        {
            Provider = DatabaseProvider.SqlServer,
            ConnectionString = connectionString,
            AutoMigrate = true,
            EnableLogging = true
        };

        return services.AddDevKitCore(config);
    }

    /// <summary>
    /// 添加DevKit服务（使用PostgreSQL）
    /// </summary>
    public static IServiceCollection AddDevKitWithPostgreSql(
        this IServiceCollection services,
        string connectionString)
    {
        var config = new DevKitDbConfiguration
        {
            Provider = DatabaseProvider.PostgreSql,
            ConnectionString = connectionString,
            AutoMigrate = true,
            EnableLogging = true
        };

        return services.AddDevKitCore(config);
    }
}

/// <summary>
/// LoggingBuilder扩展方法（添加DevKit日志记录器）
/// </summary>
public static class LoggingBuilderExtensions
{
    /// <summary>
    /// 添加DevKit日志记录器
    /// </summary>
    public static ILoggingBuilder AddDevKitLogger(
        this ILoggingBuilder builder,
        LogChannel logChannel,
        LogLevel minimumLevel = LogLevel.Information)
    {
        builder.Services.AddSingleton<ILoggerProvider>(sp =>
            new DevKitLoggerProvider(logChannel, minimumLevel));

        return builder;
    }
}

