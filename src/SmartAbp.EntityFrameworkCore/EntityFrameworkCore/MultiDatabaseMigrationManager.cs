using System;
using System.Runtime.InteropServices;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace SmartAbp.EntityFrameworkCore;

/// <summary>
/// 企业级多数据库迁移管理器
/// 根据配置智能选择正确的迁移文件夹
/// 支持自动检测操作系统并选择合适的数据库
/// </summary>
public static class MultiDatabaseMigrationManager
{
    /// <summary>
    /// 获取当前数据库类型对应的迁移程序集名称
    /// </summary>
    public static string GetMigrationsAssembly(IConfiguration configuration)
    {
        var databaseType = GetDatabaseType(configuration);
        
        return databaseType switch
        {
            DatabaseType.SqlServer => "SmartAbp.EntityFrameworkCore",
            DatabaseType.PostgreSQL => "SmartAbp.EntityFrameworkCore.PostgreSQL",
            DatabaseType.SQLite => "SmartAbp.EntityFrameworkCore.SQLite",
            DatabaseType.MySQL => "SmartAbp.EntityFrameworkCore.MySQL",
            _ => "SmartAbp.EntityFrameworkCore" // 默认SQL Server
        };
    }

    /// <summary>
    /// 获取数据库类型（支持Auto自动检测模式）
    /// </summary>
    public static DatabaseType GetDatabaseType(IConfiguration configuration, ILogger? logger = null)
    {
        var dbType = configuration["Database:Type"] ?? "Auto";
        
        // Auto模式：根据操作系统自动选择
        if (string.Equals(dbType, "Auto", StringComparison.OrdinalIgnoreCase))
        {
            var autoType = GetDatabaseTypeByOS();
            logger?.LogInformation("🔍 自动检测模式: OS={OS}, 选择数据库={DbType}", 
                GetOSName(), GetDatabaseDisplayName(autoType));
            return autoType;
        }
        
        return dbType.ToLowerInvariant() switch
        {
            "sqlite" => DatabaseType.SQLite,
            "postgresql" or "postgres" => DatabaseType.PostgreSQL,
            "mysql" => DatabaseType.MySQL,
            "sqlserver" or "mssql" or "localdb" => DatabaseType.SqlServer,
            _ => DatabaseType.SqlServer
        };
    }
    
    /// <summary>
    /// 根据操作系统自动选择数据库类型
    /// </summary>
    private static DatabaseType GetDatabaseTypeByOS()
    {
        if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
        {
            // Windows: 使用SQL Server LocalDB
            return DatabaseType.SqlServer;
        }
        else if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
        {
            // macOS: 使用PostgreSQL (Mac不支持SQL Server LocalDB)
            return DatabaseType.PostgreSQL;
        }
        else if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
        {
            // Linux: 使用PostgreSQL
            return DatabaseType.PostgreSQL;
        }
        
        // 默认使用SQLite（跨平台）
        return DatabaseType.SQLite;
    }
    
    /// <summary>
    /// 获取当前操作系统名称
    /// </summary>
    public static string GetOSName()
    {
        if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            return "Windows";
        if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
            return "macOS";
        if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
            return "Linux";
        
        return "Unknown";
    }
    
    /// <summary>
    /// 获取数据库连接字符串（支持Auto模式）
    /// </summary>
    public static string GetConnectionString(IConfiguration configuration, ILogger? logger = null)
    {
        var databaseType = GetDatabaseType(configuration, logger);
        var dbTypeString = GetConnectionStringKey(databaseType);
        
        // 优先从具名连接字符串获取
        var connectionString = configuration.GetConnectionString(dbTypeString);
        
        // 如果没有找到具名连接字符串，使用Default
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            connectionString = configuration.GetConnectionString("Default");
        }
        
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException(
                $"未找到数据库连接字符串: Type={dbTypeString}, OS={GetOSName()}");
        }
        
        return connectionString;
    }
    
    /// <summary>
    /// 根据数据库类型获取连接字符串键名
    /// </summary>
    private static string GetConnectionStringKey(DatabaseType type)
    {
        return type switch
        {
            DatabaseType.SqlServer => "LocalDb",
            DatabaseType.PostgreSQL => "PostgreSQL",
            DatabaseType.SQLite => "Sqlite",
            DatabaseType.MySQL => "MySQL",
            _ => "Default"
        };
    }

    /// <summary>
    /// 获取友好的数据库名称
    /// </summary>
    public static string GetDatabaseDisplayName(DatabaseType type)
    {
        return type switch
        {
            DatabaseType.SqlServer => "SQL Server",
            DatabaseType.PostgreSQL => "PostgreSQL",
            DatabaseType.SQLite => "SQLite",
            DatabaseType.MySQL => "MySQL",
            _ => "Unknown"
        };
    }
}

/// <summary>
/// 支持的数据库类型
/// </summary>
public enum DatabaseType
{
    SqlServer,
    PostgreSQL,
    SQLite,
    MySQL
}

