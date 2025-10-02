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
        var databaseType = configuration["Database:Type"] ?? "SqlServer";
        var connectionString = configuration.GetConnectionString("Default");

        switch (databaseType.ToLowerInvariant())
        {
            case "postgresql":
            case "postgres":
                builder.UseNpgsql(connectionString);
                break;
            case "sqlserver":
            case "mssql":
            default:
                builder.UseSqlServer(connectionString);
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
