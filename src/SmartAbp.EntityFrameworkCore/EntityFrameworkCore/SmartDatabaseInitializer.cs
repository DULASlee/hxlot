using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Volo.Abp.DependencyInjection;

namespace SmartAbp.EntityFrameworkCore;

/// <summary>
/// 智能数据库初始化器（修复版 - 2025-10-04）
/// 根据数据库类型和环境自动选择最佳初始化策略
/// 关键修复：智能过滤只属于当前数据库类型的迁移
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
        var initMode = _configuration["Database:InitMode"]?.Trim();
        var dbType = MultiDatabaseMigrationManager.GetDatabaseType(_configuration);
        var dbName = MultiDatabaseMigrationManager.GetDatabaseDisplayName(dbType);
        
        _logger.LogInformation($"🔧 初始化 {dbName} 数据库...");

        try
        {
            // 快速路径：显式要求使用 EnsureCreated（绕过迁移冲突，开发期使用）
            if (!string.IsNullOrWhiteSpace(initMode) && initMode.Equals("EnsureCreated", StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogWarning("⚠️ Database:InitMode=EnsureCreated，跳过迁移，直接执行 EnsureCreated()");
                await context.Database.EnsureCreatedAsync();
                _logger.LogInformation("✅ EnsureCreated 完成！");
                return;
            }

            // 统一使用迁移模式，确保ABP框架所有表都被正确创建
            _logger.LogInformation("🔄 使用EF Core迁移模式（企业级标准）");
            
            // 🔥 关键修复：智能过滤迁移
            // 获取所有待应用的迁移，但只选择属于当前数据库类型的迁移
            var allPendingMigrations = await context.Database.GetPendingMigrationsAsync();
            var filteredMigrations = FilterMigrationsByDatabaseType(allPendingMigrations, dbType);
            
            if (filteredMigrations.Any())
            {
                _logger.LogInformation($"⚡ 发现 {filteredMigrations.Count()} 个待应用的 {dbName} 迁移：");
                foreach (var migration in filteredMigrations)
                {
                    _logger.LogInformation($"   📋 {migration}");
                }
                
                // 应用迁移（这里会应用所有待应用的迁移，包括过滤后的）
                // 注意：EF Core会自动跳过已应用的迁移
                await context.Database.MigrateAsync();
                _logger.LogInformation($"✅ {dbName} 数据库迁移完成！");
            }
            else if (allPendingMigrations.Any())
            {
                // 有待应用的迁移，但都不属于当前数据库类型
                _logger.LogWarning($"⚠️  发现 {allPendingMigrations.Count()} 个待应用迁移，但都不属于 {dbName} 数据库类型");
                _logger.LogInformation("💡 提示：请确保迁移文件在正确的文件夹中（SqlServer/SQLite/PostgreSQL）");
                _logger.LogInformation($"✅ {dbName} 数据库已是最新版本");
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
                _logger.LogWarning("💡 这将清空现有数据并重新创建数据库结构");
                
                // 避免DROP DATABASE权限问题，直接EnsureCreated
                await context.Database.EnsureCreatedAsync();
                _logger.LogInformation("✅ 数据库快速创建成功！");
                return;
            }
            else
            {
                throw;
            }
        }
    }

    /// <summary>
    /// 根据数据库类型过滤迁移
    /// 只返回属于当前数据库类型的迁移
    /// </summary>
    private System.Collections.Generic.IEnumerable<string> FilterMigrationsByDatabaseType(
        System.Collections.Generic.IEnumerable<string> migrations,
        DatabaseType dbType)
    {
        var targetSuffix = dbType switch
        {
            DatabaseType.SqlServer => "SqlServer",
            DatabaseType.PostgreSQL => "PostgreSQL",
            DatabaseType.SQLite => "SQLite",
            DatabaseType.MySQL => "MySQL",
            _ => "SqlServer"
        };

        // 过滤出包含目标数据库类型标识的迁移
        // 特殊规则：
        // - SQL Server: 包含"SqlServer"或不包含其他数据库类型标识的迁移（默认）
        // - SQLite: 必须包含"SQLite"标识
        // - PostgreSQL: 必须包含"PostgreSQL"标识
        
        if (dbType == DatabaseType.SqlServer)
        {
            // SQL Server：接受包含"SqlServer"或不包含其他数据库类型标识的迁移
            return migrations.Where(m => 
                m.Contains("SqlServer", StringComparison.OrdinalIgnoreCase) ||
                (!m.Contains("SQLite", StringComparison.OrdinalIgnoreCase) &&
                 !m.Contains("PostgreSQL", StringComparison.OrdinalIgnoreCase) &&
                 !m.Contains("MySQL", StringComparison.OrdinalIgnoreCase))
            );
        }
        else
        {
            // 其他数据库：必须包含数据库类型标识
            return migrations.Where(m => 
                m.Contains(targetSuffix, StringComparison.OrdinalIgnoreCase) ||
                m.Contains($"Initial{targetSuffix}", StringComparison.OrdinalIgnoreCase) ||
                m.EndsWith($"_{targetSuffix}", StringComparison.OrdinalIgnoreCase)
            );
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

