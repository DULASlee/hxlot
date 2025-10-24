using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using SmartAbp.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace SmartAbp.Web
{
    /// <summary>
    /// 数据库初始化助手 - 专门用于SQLite环境
    /// </summary>
    public static class DatabaseInitializer
    {
        public static async Task InitializeDatabaseAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<SmartAbpDbContext>();
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
            var configuration = scope.ServiceProvider.GetRequiredService<Microsoft.Extensions.Configuration.IConfiguration>();

            try
            {
                logger.LogInformation("🔥 开始数据库初始化...");

                // 获取当前数据库类型
                var dbType = SmartAbp.EntityFrameworkCore.MultiDatabaseMigrationManager.GetDatabaseType(configuration, logger);
                logger.LogInformation("📊 数据库类型: {DatabaseType}", dbType);

                // 🔥 统一行为：所有数据库类型都先删除再创建（确保表结构最新）
                logger.LogInformation("💡 删除旧数据库（如存在）...");
                await dbContext.Database.EnsureDeletedAsync();
                logger.LogInformation("✅ 旧数据库已删除");

                // 使用EnsureCreated创建所有表（基于当前DbContext配置）
                logger.LogInformation("💡 创建新数据库结构...");
                var created = await dbContext.Database.EnsureCreatedAsync();
                
                if (created)
                {
                    logger.LogInformation("✅ 数据库结构创建成功！");
                }
                else
                {
                    logger.LogWarning("⚠️ 数据库创建失败（不应该发生）");
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "❌ 数据库初始化失败: {Message}", ex.Message);
                throw;
            }
        }
    }
}

