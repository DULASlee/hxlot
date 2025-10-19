using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace SmartAbp.DevKit.Core.Logging.Data;

/// <summary>
/// 数据库初始化器（自动创建数据库和表）
/// </summary>
public class DbInitializer
{
    private readonly IDbContextFactory<DevKitDbContext> _contextFactory;
    private readonly ILogger<DbInitializer> _logger;

    public DbInitializer(
        IDbContextFactory<DevKitDbContext> contextFactory,
        ILogger<DbInitializer> logger)
    {
        _contextFactory = contextFactory ?? throw new ArgumentNullException(nameof(contextFactory));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// 初始化数据库（创建数据库和表）
    /// </summary>
    /// <returns>是否成功初始化</returns>
    public async Task<bool> InitializeAsync()
    {
        try
        {
            await using var context = await _contextFactory.CreateDbContextAsync();

            _logger.LogInformation("Initializing DevKit database...");

            // 检查数据库是否存在
            var isNewDatabase = !await context.Database.CanConnectAsync();

            if (isNewDatabase)
            {
                _logger.LogInformation("Database does not exist. Creating database...");
            }

            // 应用所有挂起的迁移（如果使用Code First Migrations）
            // 或直接创建数据库（如果使用EnsureCreated）
            await context.Database.MigrateAsync();

            if (isNewDatabase)
            {
                _logger.LogInformation("Database created successfully");
            }
            else
            {
                _logger.LogInformation("Database already exists");
            }

            // 验证表是否创建成功
            await ValidateTablesAsync(context);

            _logger.LogInformation("DevKit database initialized successfully");
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to initialize DevKit database");
            return false;
        }
    }

    /// <summary>
    /// 验证表是否创建成功
    /// </summary>
    private async Task ValidateTablesAsync(DevKitDbContext context)
    {
        // 尝试查询每个表，确保表存在
        var logsCount = await context.Logs.CountAsync();
        _logger.LogDebug("DevKit_Logs table exists. Current count: {Count}", logsCount);

        var perfLogsCount = await context.PerformanceLogs.CountAsync();
        _logger.LogDebug("DevKit_PerformanceLogs table exists. Current count: {Count}", perfLogsCount);

        var upgradeHistoryCount = await context.UpgradeHistory.CountAsync();
        _logger.LogDebug("DevKit_UpgradeHistory table exists. Current count: {Count}", upgradeHistoryCount);

        var fileHashesCount = await context.FileHashes.CountAsync();
        _logger.LogDebug("DevKit_FileHashes table exists. Current count: {Count}", fileHashesCount);
    }

    /// <summary>
    /// 清空所有表数据（慎用！）
    /// </summary>
    public async Task ClearAllDataAsync()
    {
        try
        {
            await using var context = await _contextFactory.CreateDbContextAsync();

            _logger.LogWarning("Clearing all DevKit database data...");

            // 使用ExecuteDelete批量删除（EF Core 7.0+高性能特性）
            await context.Logs.ExecuteDeleteAsync();
            await context.PerformanceLogs.ExecuteDeleteAsync();
            await context.UpgradeHistory.ExecuteDeleteAsync();
            await context.FileHashes.ExecuteDeleteAsync();

            _logger.LogWarning("All DevKit database data cleared");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to clear DevKit database data");
            throw;
        }
    }

    /// <summary>
    /// 备份数据库（SQL Server专用）
    /// </summary>
    /// <param name="backupPath">备份文件路径</param>
    public async Task BackupDatabaseAsync(string backupPath)
    {
        try
        {
            await using var context = await _contextFactory.CreateDbContextAsync();

            _logger.LogInformation("Backing up DevKit database to: {Path}", backupPath);

            // SQL Server备份命令
            var databaseName = context.Database.GetDbConnection().Database;
            var sql = $"BACKUP DATABASE [{databaseName}] TO DISK = '{backupPath}' WITH FORMAT, INIT";

            await context.Database.ExecuteSqlRawAsync(sql);

            _logger.LogInformation("Database backup completed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to backup DevKit database");
            throw;
        }
    }

    /// <summary>
    /// 恢复数据库（SQL Server专用）
    /// </summary>
    /// <param name="backupPath">备份文件路径</param>
    public async Task RestoreDatabaseAsync(string backupPath)
    {
        try
        {
            await using var context = await _contextFactory.CreateDbContextAsync();

            _logger.LogInformation("Restoring DevKit database from: {Path}", backupPath);

            // SQL Server恢复命令
            var databaseName = context.Database.GetDbConnection().Database;
            var sql = $"RESTORE DATABASE [{databaseName}] FROM DISK = '{backupPath}' WITH REPLACE";

            await context.Database.ExecuteSqlRawAsync(sql);

            _logger.LogInformation("Database restore completed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to restore DevKit database");
            throw;
        }
    }

    /// <summary>
    /// 获取数据库连接信息
    /// </summary>
    public async Task<DatabaseInfo> GetDatabaseInfoAsync()
    {
        try
        {
            await using var context = await _contextFactory.CreateDbContextAsync();

            var connection = context.Database.GetDbConnection();

            return new DatabaseInfo
            {
                DatabaseName = connection.Database,
                ServerName = connection.DataSource,
                ProviderName = context.Database.ProviderName ?? "Unknown",
                IsConnected = await context.Database.CanConnectAsync()
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get database info");
            throw;
        }
    }
}

/// <summary>
/// 数据库信息
/// </summary>
public class DatabaseInfo
{
    /// <summary>
    /// 数据库名称
    /// </summary>
    public string DatabaseName { get; set; } = string.Empty;

    /// <summary>
    /// 服务器名称
    /// </summary>
    public string ServerName { get; set; } = string.Empty;

    /// <summary>
    /// 提供程序名称
    /// </summary>
    public string ProviderName { get; set; } = string.Empty;

    /// <summary>
    /// 是否已连接
    /// </summary>
    public bool IsConnected { get; set; }
}

