using Microsoft.EntityFrameworkCore;
using Volo.Abp.Data;
using Volo.Abp.EntityFrameworkCore;

namespace SmartAbp.PermissionManagement.Infrastructure.EntityFrameworkCore;

/// <summary>
/// 权限管理数据库上下文
/// </summary>
[ConnectionStringName("PermissionManagement")]
public class PermissionManagementDbContext : AbpDbContext<PermissionManagementDbContext>
{
    public PermissionManagementDbContext(DbContextOptions<PermissionManagementDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // 配置表名前缀
        builder.ConfigurePermissionManagement();
    }
}

/// <summary>
/// PermissionManagement数据库模型配置扩展
/// </summary>
public static class PermissionManagementDbContextModelCreatingExtensions
{
    public static void ConfigurePermissionManagement(this ModelBuilder builder)
    {
        // 在此配置实体映射
        // 例如：builder.Entity<User>(b => { ... });
    }
}

