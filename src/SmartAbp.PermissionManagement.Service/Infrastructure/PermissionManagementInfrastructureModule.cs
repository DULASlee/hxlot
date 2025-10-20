using Microsoft.Extensions.DependencyInjection;
using Volo.Abp.Caching;
using Volo.Abp.EntityFrameworkCore;
using Volo.Abp.EntityFrameworkCore.PostgreSql;
using Volo.Abp.Identity.EntityFrameworkCore;
using Volo.Abp.Modularity;
using Volo.Abp.PermissionManagement.EntityFrameworkCore;
using Volo.Abp.TenantManagement.EntityFrameworkCore;
using SmartAbp.PermissionManagement.Domain;
using SmartAbp.PermissionManagement.Infrastructure.EntityFrameworkCore;
using SmartAbp.PermissionManagement.Infrastructure.MultiTenancy;

namespace SmartAbp.PermissionManagement.Infrastructure;

/// <summary>
/// 权限管理基础设施层模块
/// 实现数据访问、仓储、外部服务集成等
/// 集成PostgreSQL + Redis + ABP Identity + ABP PermissionManagement + TenantManagement（多租户）
/// </summary>
[DependsOn(
    typeof(AbpEntityFrameworkCoreModule),
    typeof(AbpEntityFrameworkCorePostgreSqlModule),
    typeof(AbpIdentityEntityFrameworkCoreModule),
    typeof(AbpPermissionManagementEntityFrameworkCoreModule),
    typeof(AbpTenantManagementEntityFrameworkCoreModule),
    typeof(AbpCachingModule),
    typeof(PermissionManagementDomainModule)
)]
public class PermissionManagementInfrastructureModule : AbpModule
{
    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        var configuration = context.Services.GetConfiguration();

        // 配置EF Core
        context.Services.AddAbpDbContext<EntityFrameworkCore.PermissionManagementDbContext>(options =>
        {
            options.AddDefaultRepositories(includeAllEntities: true);
        });

        // 配置PostgreSQL + 多租户Schema拦截器
        Configure<AbpDbContextOptions>(options =>
        {
            options.Configure<EntityFrameworkCore.PermissionManagementDbContext>(dbContextOptions =>
            {
                dbContextOptions.UseNpgsql(npgsqlOptions =>
                {
                    // PostgreSQL特定配置
                });

                // 注册EF Core拦截器
                dbContextOptions.DbContextOptions.AddInterceptors(
                    context.Services.BuildServiceProvider()
                        .GetRequiredService<TenantSchemaConnectionInterceptor>()
                );
            });
        });

        // 注册租户Schema解析器、拦截器和管理器
        context.Services.AddTransient<ITenantSchemaResolver, TenantSchemaResolver>();
        context.Services.AddTransient<TenantSchemaConnectionInterceptor>();
        context.Services.AddTransient<ITenantSchemaManager, TenantSchemaManager>();

        // 配置Redis分布式缓存
        Configure<AbpDistributedCacheOptions>(options =>
        {
            options.KeyPrefix = "PermissionManagement:";
        });
    }
}

