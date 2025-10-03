using System;
using Microsoft.Extensions.Configuration;

namespace SmartAbp.EntityFrameworkCore;

/// <summary>
/// 企业级多数据库迁移管理器
/// 根据配置智能选择正确的迁移文件夹
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
    /// 获取数据库类型
    /// </summary>
    public static DatabaseType GetDatabaseType(IConfiguration configuration)
    {
        var dbType = configuration["Database:Type"] ?? "SqlServer";
        
        return dbType.ToLowerInvariant() switch
        {
            "sqlite" => DatabaseType.SQLite,
            "postgresql" or "postgres" => DatabaseType.PostgreSQL,
            "mysql" => DatabaseType.MySQL,
            "sqlserver" or "mssql" => DatabaseType.SqlServer,
            _ => DatabaseType.SqlServer
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

