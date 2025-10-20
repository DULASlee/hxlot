using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace SmartAbp.PermissionManagement.Infrastructure.EntityFrameworkCore;

/// <summary>
/// 权限管理数据库上下文工厂
/// 用于EF Core迁移工具（Add-Migration, Update-Database等）
/// </summary>
public class PermissionManagementDbContextFactory : IDesignTimeDbContextFactory<PermissionManagementDbContext>
{
    public PermissionManagementDbContext CreateDbContext(string[] args)
    {
        // 构建配置
        var configuration = BuildConfiguration();

        // 创建DbContextOptionsBuilder
        var builder = new DbContextOptionsBuilder<PermissionManagementDbContext>()
            .UseNpgsql(
                configuration.GetConnectionString("PermissionManagement"),
                b => b.MigrationsHistoryTable("__EFMigrationsHistory", "public")
            );

        return new PermissionManagementDbContext(builder.Options);
    }

    private static IConfigurationRoot BuildConfiguration()
    {
        var builder = new ConfigurationBuilder()
            .SetBasePath(Path.Combine(Directory.GetCurrentDirectory(), "../Host/"))
            .AddJsonFile("appsettings.json", optional: false)
            .AddJsonFile("appsettings.Development.json", optional: true);

        return builder.Build();
    }
}

