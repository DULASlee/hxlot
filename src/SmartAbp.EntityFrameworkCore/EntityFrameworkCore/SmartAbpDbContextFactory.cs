using System;
using System.IO;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace SmartAbp.EntityFrameworkCore;

/* This class is needed for EF Core console commands
 * (like Add-Migration and Update-Database commands) */
public class SmartAbpDbContextFactory : IDesignTimeDbContextFactory<SmartAbpDbContext>
{
    public SmartAbpDbContext CreateDbContext(string[] args)
    {
        var configuration = BuildConfiguration();
        
        SmartAbpEfCoreEntityExtensionMappings.Configure();

        var builder = new DbContextOptionsBuilder<SmartAbpDbContext>();
        
        // 使用MultiDatabaseMigrationManager智能检测数据库类型和连接字符串
        var databaseType = MultiDatabaseMigrationManager.GetDatabaseType(configuration);
        var connectionString = MultiDatabaseMigrationManager.GetConnectionString(configuration);

        switch (databaseType)
        {
            case DatabaseType.SQLite:
                builder.UseSqlite(connectionString);
                break;
            case DatabaseType.SqlServer:
                builder.UseSqlServer(connectionString);
                break;
            case DatabaseType.PostgreSQL:
                builder.UseNpgsql(connectionString);
                break;
            default:
                // 默认使用SQLite
                builder.UseSqlite(connectionString);
                break;
        }
        
        return new SmartAbpDbContext(builder.Options);
    }

    private static IConfigurationRoot BuildConfiguration()
    {
        var builder = new ConfigurationBuilder()
            .SetBasePath(Path.Combine(Directory.GetCurrentDirectory(), "../SmartAbp.DbMigrator/"))
            .AddJsonFile("appsettings.json", optional: false);

        return builder.Build();
    }
}
