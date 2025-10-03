using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Volo.Abp.DependencyInjection;

namespace SmartAbp.EntityFrameworkCore;

/// <summary>
/// 智能数据库初始化器
/// 根据数据库类型和环境自动选择最佳初始化策略
/// </summary>
public class SmartDatabaseInitializer : ITransientDependency
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<SmartDatabaseInitializer> _logger;

    public SmartDatabaseInitializer(
        IConfiguration configuration,
        ILogger<SmartDatabaseInitializer> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    /// <summary>
    /// 智能初始化数据库
    /// </summary>
    public async Task InitializeAsync(DbContext context)
    {
        var dbType = MultiDatabaseMigrationManager.GetDatabaseType(_configuration);
        var dbName = MultiDatabaseMigrationManager.GetDatabaseDisplayName(dbType);
        
        _logger.LogInformation($"🔧 初始化 {dbName} 数据库...");

        try
        {
            // 统一使用迁移模式，确保ABP框架所有表都被正确创建
            _logger.LogInformation("🔄 使用EF Core迁移模式（企业级标准）");
            
            // 检查是否有待应用的迁移
            var pendingMigrations = await context.Database.GetPendingMigrationsAsync();
            var hasPendingMigrations = false;
            foreach (var migration in pendingMigrations)
            {
                hasPendingMigrations = true;
                _logger.LogInformation($"   📋 待应用迁移: {migration}");
            }

            if (hasPendingMigrations)
            {
                _logger.LogInformation("⚡ 开始应用数据库迁移...");
                await context.Database.MigrateAsync();
                _logger.LogInformation($"✅ {dbName} 数据库迁移完成！");
            }
            else
            {
                _logger.LogInformation($"✅ {dbName} 数据库已是最新版本");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"❌ 数据库初始化失败: {ex.Message}");
            
            // 如果迁移失败，尝试快速创建（仅开发环境）
            if (IsDevEnvironment())
            {
                _logger.LogWarning("⚠️  迁移失败，尝试快速创建模式...");
                await context.Database.EnsureCreatedAsync();
                _logger.LogInformation("✅ 数据库快速创建成功！");
            }
            else
            {
                throw;
            }
        }
    }

    private bool IsDevEnvironment()
    {
        var env = _configuration["ASPNETCORE_ENVIRONMENT"] ?? 
                  _configuration["Environment"] ?? 
                  "Production";
        return env.Equals("Development", StringComparison.OrdinalIgnoreCase);
    }
}

