using Microsoft.EntityFrameworkCore;
using SmartAbp.DevKit.Core.Logging.Models;

namespace SmartAbp.DevKit.Core.Logging.Data;

/// <summary>
/// DevKit数据库上下文（支持SQL Server LocalDB和PostgreSQL）
/// </summary>
public class DevKitDbContext : DbContext
{
    /// <summary>
    /// 日志表
    /// </summary>
    public DbSet<LogEntry> Logs { get; set; } = null!;

    /// <summary>
    /// 性能日志表
    /// </summary>
    public DbSet<PerformanceLogEntry> PerformanceLogs { get; set; } = null!;

    /// <summary>
    /// 升级历史表
    /// </summary>
    public DbSet<UpgradeHistoryEntry> UpgradeHistory { get; set; } = null!;

    /// <summary>
    /// 文件哈希表
    /// </summary>
    public DbSet<FileHashEntry> FileHashes { get; set; } = null!;

    public DevKitDbContext(DbContextOptions<DevKitDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // 配置日志表
        modelBuilder.Entity<LogEntry>(entity =>
        {
            entity.HasIndex(e => e.Timestamp)
                .HasDatabaseName("IX_DevKit_Logs_Timestamp");

            entity.HasIndex(e => e.Level)
                .HasDatabaseName("IX_DevKit_Logs_Level");

            entity.HasIndex(e => e.Category)
                .HasDatabaseName("IX_DevKit_Logs_Category");

            entity.HasIndex(e => e.OperationId)
                .HasDatabaseName("IX_DevKit_Logs_OperationId");
        });

        // 配置性能日志表
        modelBuilder.Entity<PerformanceLogEntry>(entity =>
        {
            entity.HasIndex(e => e.Timestamp)
                .HasDatabaseName("IX_DevKit_PerformanceLogs_Timestamp");

            entity.HasIndex(e => e.OperationName)
                .HasDatabaseName("IX_DevKit_PerformanceLogs_OperationName");

            entity.HasIndex(e => e.OperationId)
                .HasDatabaseName("IX_DevKit_PerformanceLogs_OperationId");
        });

        // 配置升级历史表
        modelBuilder.Entity<UpgradeHistoryEntry>(entity =>
        {
            entity.HasIndex(e => e.UpgradeTime)
                .HasDatabaseName("IX_DevKit_UpgradeHistory_UpgradeTime");

            entity.HasIndex(e => e.ModuleName)
                .HasDatabaseName("IX_DevKit_UpgradeHistory_ModuleName");
        });

        // 配置文件哈希表
        modelBuilder.Entity<FileHashEntry>(entity =>
        {
            entity.HasIndex(e => e.LastModified)
                .HasDatabaseName("IX_DevKit_FileHashes_LastModified");
        });
    }
}

/// <summary>
/// 数据库提供程序类型
/// </summary>
public enum DatabaseProvider
{
    /// <summary>
    /// SQL Server LocalDB
    /// </summary>
    SqlServerLocalDb,

    /// <summary>
    /// SQL Server
    /// </summary>
    SqlServer,

    /// <summary>
    /// PostgreSQL
    /// </summary>
    PostgreSql
}

/// <summary>
/// DevKit数据库配置
/// </summary>
public class DevKitDbConfiguration
{
    /// <summary>
    /// 数据库提供程序
    /// </summary>
    public DatabaseProvider Provider { get; set; } = DatabaseProvider.SqlServerLocalDb;

    /// <summary>
    /// 连接字符串
    /// </summary>
    public string ConnectionString { get; set; } = string.Empty;

    /// <summary>
    /// 是否自动迁移数据库
    /// </summary>
    public bool AutoMigrate { get; set; } = true;

    /// <summary>
    /// 是否启用日志记录
    /// </summary>
    public bool EnableLogging { get; set; } = true;

    /// <summary>
    /// 日志保留天数（超过此天数的日志将被清理）
    /// </summary>
    public int LogRetentionDays { get; set; } = 30;

    /// <summary>
    /// 模板基础路径（用于模板引擎）
    /// </summary>
    public string? TemplateBasePath { get; set; } = "templates";

    /// <summary>
    /// 获取默认的SQL Server LocalDB配置
    /// </summary>
    public static DevKitDbConfiguration GetDefaultSqlServerLocalDb()
    {
        return new DevKitDbConfiguration
        {
            Provider = DatabaseProvider.SqlServerLocalDb,
            ConnectionString = @"Server=(localdb)\mssqllocaldb;Database=SmartAbp_DevKit;Trusted_Connection=True;MultipleActiveResultSets=true",
            AutoMigrate = true,
            EnableLogging = true,
            LogRetentionDays = 30
        };
    }

    /// <summary>
    /// 获取默认的PostgreSQL配置
    /// </summary>
    public static DevKitDbConfiguration GetDefaultPostgreSql()
    {
        return new DevKitDbConfiguration
        {
            Provider = DatabaseProvider.PostgreSql,
            ConnectionString = "Host=localhost;Port=5432;Database=smartabp_devkit;Username=postgres;Password=postgres",
            AutoMigrate = true,
            EnableLogging = true,
            LogRetentionDays = 30
        };
    }
}

