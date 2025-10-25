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

                // ✅ 安全模式：检查数据库是否存在，如果存在则不删除
                if (await dbContext.Database.CanConnectAsync())
                {
                    logger.LogInformation("✅ 数据库已存在且可连接，跳过初始化");
                    logger.LogInformation("💡 如需重新初始化，请手动删除数据库或设置环境变量 FORCE_DB_RESET=true");
                    return;
                }

                logger.LogInformation("💡 数据库不存在或不可连接，创建新数据库结构...");

                // 只有在数据库不存在时才创建
                var created = await dbContext.Database.EnsureCreatedAsync();

                if (created)
                {
                    logger.LogInformation("✅ 数据库结构创建成功！");
                }
                else
                {
                    logger.LogInformation("⚠️ 数据库已存在或创建失败");
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

