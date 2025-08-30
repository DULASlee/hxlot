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

        var builder = new DbContextOptionsBuilder<SmartAbpDbContext>()
            .UseSqlServer(configuration.GetConnectionString("Default"));
        
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
