using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using SmartAbp.Data;
using Volo.Abp.DependencyInjection;

namespace SmartAbp.EntityFrameworkCore;

/// <summary>
/// 企业级数据库架构迁移器 - 支持多数据库智能切换
/// </summary>
public class EntityFrameworkCoreSmartAbpDbSchemaMigrator
    : ISmartAbpDbSchemaMigrator, ITransientDependency
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<EntityFrameworkCoreSmartAbpDbSchemaMigrator> _logger;

    public EntityFrameworkCoreSmartAbpDbSchemaMigrator(
        IServiceProvider serviceProvider,
        ILogger<EntityFrameworkCoreSmartAbpDbSchemaMigrator> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public async Task MigrateAsync()
    {
        /* We intentionally resolving the SmartAbpDbContext
         * from IServiceProvider (instead of directly injecting it)
         * to properly get the connection string of the current tenant in the
         * current scope.
         */

        var context = _serviceProvider.GetRequiredService<SmartAbpDbContext>();
        var initializer = _serviceProvider.GetRequiredService<SmartDatabaseInitializer>();

        _logger.LogInformation("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        _logger.LogInformation("🚀 SmartAbp 企业级多数据库初始化系统");
        _logger.LogInformation("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        await initializer.InitializeAsync(context);
    }
}
