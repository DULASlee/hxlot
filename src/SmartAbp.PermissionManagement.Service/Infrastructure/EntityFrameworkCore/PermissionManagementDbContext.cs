using Microsoft.EntityFrameworkCore;
using Volo.Abp.Data;
using Volo.Abp.EntityFrameworkCore;
using Volo.Abp.Identity;
using Volo.Abp.Identity.EntityFrameworkCore;
using Volo.Abp.PermissionManagement;
using Volo.Abp.PermissionManagement.EntityFrameworkCore;
using Volo.Abp.TenantManagement;
using Volo.Abp.TenantManagement.EntityFrameworkCore;

namespace SmartAbp.PermissionManagement.Infrastructure.EntityFrameworkCore;

/// <summary>
/// 权限管理数据库上下文
/// 集成ABP Identity + PermissionManagement + TenantManagement（多租户）
/// 支持多租户数据隔离（Shared Database, Separate Schema策略）
/// </summary>
[ConnectionStringName("PermissionManagement")]
public class PermissionManagementDbContext : AbpDbContext<PermissionManagementDbContext>,
    IIdentityDbContext,
    IPermissionManagementDbContext,
    ITenantManagementDbContext
{
    // ABP Identity实体集
    public DbSet<IdentityUser> Users { get; set; }
    public DbSet<IdentityRole> Roles { get; set; }
    public DbSet<IdentityClaimType> ClaimTypes { get; set; }
    public DbSet<OrganizationUnit> OrganizationUnits { get; set; }
    public DbSet<IdentitySecurityLog> SecurityLogs { get; set; }
    public DbSet<IdentityLinkUser> LinkUsers { get; set; }
    public DbSet<IdentityUserDelegation> UserDelegations { get; set; }
    public DbSet<IdentitySession> Sessions { get; set; }

    // ABP PermissionManagement实体集
    public DbSet<PermissionGrant> PermissionGrants { get; set; }
    public DbSet<PermissionGroupDefinitionRecord> PermissionGroups { get; set; }
    public DbSet<PermissionDefinitionRecord> Permissions { get; set; }

    // ABP TenantManagement实体集（多租户）
    public DbSet<Tenant> Tenants { get; set; }
    public DbSet<TenantConnectionString> TenantConnectionStrings { get; set; }

    public PermissionManagementDbContext(DbContextOptions<PermissionManagementDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // 配置ABP Identity模块
        builder.ConfigureIdentity();

        // 配置ABP PermissionManagement模块
        builder.ConfigurePermissionManagement();

        // 配置ABP TenantManagement模块（多租户）
        builder.ConfigureTenantManagement();

        // 配置自定义实体
        builder.ConfigurePermissionManagementService();
    }
}

/// <summary>
/// PermissionManagement数据库模型配置扩展
/// </summary>
public static class PermissionManagementDbContextModelCreatingExtensions
{
    public static void ConfigurePermissionManagementService(this ModelBuilder builder)
    {
        // 在此配置自定义实体映射
        // 例如：builder.Entity<CustomEntity>(b => { ... });
    }
}

