// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MES生产线监控系统表初始化器
// 用途: 在应用启动时检查并创建MES相关数据库表
// 创建日期: 2025-10-21
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using SmartAbp.EntityFrameworkCore;

namespace SmartAbp.Seeders
{
    /// <summary>
    /// MES表初始化器
    /// </summary>
    public class MESTableInitializer : IDataSeedContributor, ITransientDependency
    {
        private readonly SmartAbpDbContext _dbContext;
        private readonly ILogger<MESTableInitializer> _logger;

        public MESTableInitializer(
            SmartAbpDbContext dbContext,
            ILogger<MESTableInitializer> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task SeedAsync(DataSeedContext context)
        {
            try
            {
                _logger.LogInformation("[MESTableInitializer] 开始检查MES表是否存在...");

                // 检查ProductionLines表是否存在
                var productionLineExists = await TableExistsAsync("AppProductionLines");

                if (!productionLineExists)
                {
                    _logger.LogInformation("[MESTableInitializer] MES表不存在，开始执行创建脚本...");

                    // 读取SQL脚本
                    var scriptPath = Path.Combine(
                        AppContext.BaseDirectory,
                        "..", "..", "..", "..", // 向上导航到src目录
                        "SmartAbp.EntityFrameworkCore",
                        "Migrations",
                        "SqlServer",
                        "20251021_CreateMESTables.sql"
                    );

                    if (File.Exists(scriptPath))
                    {
                        var sql = await File.ReadAllTextAsync(scriptPath);

                        // 执行SQL脚本（分批执行，按GO分割）
                        var batches = sql.Split(new[] { "\r\nGO\r\n", "\nGO\n" }, StringSplitOptions.RemoveEmptyEntries);

                        foreach (var batch in batches)
                        {
                            if (!string.IsNullOrWhiteSpace(batch))
                            {
                                await _dbContext.Database.ExecuteSqlRawAsync(batch);
                            }
                        }

                        _logger.LogInformation("[MESTableInitializer] ✅ MES表创建成功！");
                    }
                    else
                    {
                        _logger.LogWarning("[MESTableInitializer] ⚠️ SQL脚本文件不存在: {ScriptPath}", scriptPath);
                    }
                }
                else
                {
                    _logger.LogInformation("[MESTableInitializer] ✅ MES表已存在，跳过创建。");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[MESTableInitializer] ❌ MES表初始化失败！");
                throw;
            }
        }

        /// <summary>
        /// 检查表是否存在
        /// </summary>
        private async Task<bool> TableExistsAsync(string tableName)
        {
            var sql = $@"
                SELECT CASE WHEN EXISTS (
                    SELECT * FROM INFORMATION_SCHEMA.TABLES 
                    WHERE TABLE_NAME = '{tableName}'
                ) THEN 1 ELSE 0 END AS TableExists";

            try
            {
                var result = await _dbContext.Database.ExecuteSqlRawAsync(sql);
                return result > 0;
            }
            catch
            {
                return false;
            }
        }
    }
}

