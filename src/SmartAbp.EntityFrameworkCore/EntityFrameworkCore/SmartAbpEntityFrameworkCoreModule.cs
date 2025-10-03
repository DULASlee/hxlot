using System;
using Microsoft.Extensions.DependencyInjection;
using Volo.Abp.Uow;
using Volo.Abp.AuditLogging.EntityFrameworkCore;
using Volo.Abp.BackgroundJobs.EntityFrameworkCore;
using Volo.Abp.EntityFrameworkCore;
using Volo.Abp.EntityFrameworkCore.PostgreSql;
using Volo.Abp.EntityFrameworkCore.SqlServer;
using Volo.Abp.EntityFrameworkCore.Sqlite;
using Microsoft.Extensions.Configuration;
using Volo.Abp.FeatureManagement.EntityFrameworkCore;
using Volo.Abp.Identity.EntityFrameworkCore;
using Volo.Abp.OpenIddict.EntityFrameworkCore;
using Volo.Abp.Modularity;
using Volo.Abp.PermissionManagement.EntityFrameworkCore;
using Volo.Abp.SettingManagement.EntityFrameworkCore;
using Volo.Abp.BlobStoring.Database.EntityFrameworkCore;
using Volo.Abp.TenantManagement.EntityFrameworkCore;
using Volo.Abp.Studio;
using Volo.Abp.Timing;
using Microsoft.EntityFrameworkCore;

namespace SmartAbp.EntityFrameworkCore;

[DependsOn(
    typeof(SmartAbpDomainModule),
    typeof(AbpPermissionManagementEntityFrameworkCoreModule),
    typeof(AbpSettingManagementEntityFrameworkCoreModule),
    typeof(AbpEntityFrameworkCorePostgreSqlModule),
    typeof(AbpEntityFrameworkCoreSqlServerModule),
    typeof(AbpEntityFrameworkCoreSqliteModule),
    typeof(AbpBackgroundJobsEntityFrameworkCoreModule),
    typeof(AbpAuditLoggingEntityFrameworkCoreModule),
    typeof(AbpFeatureManagementEntityFrameworkCoreModule),
    typeof(AbpIdentityEntityFrameworkCoreModule),
    typeof(AbpOpenIddictEntityFrameworkCoreModule),
    typeof(AbpTenantManagementEntityFrameworkCoreModule),
    typeof(BlobStoringDatabaseEntityFrameworkCoreModule)
    )]
public class SmartAbpEntityFrameworkCoreModule : AbpModule
{
    public override void PreConfigureServices(ServiceConfigurationContext context)
    {

        SmartAbpEfCoreEntityExtensionMappings.Configure();
    }

    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        // Configure ABP Clock to use UTC
        Configure<AbpClockOptions>(options =>
        {
            options.Kind = DateTimeKind.Utc;
        });

        context.Services.AddAbpDbContext<SmartAbpDbContext>(options =>
        {
                /* Remove "includeAllEntities: true" to create
                 * default repositories only for aggregate roots */
            options.AddDefaultRepositories(includeAllEntities: true);
        });

        if (AbpStudioAnalyzeHelper.IsInAnalyzeMode)
        {
            return;
        }

        Configure<AbpDbContextOptions>(options =>
        {
            /* 🔥 SmartAbp多数据库支持（修复版 - 2025-10-04）
             * 支持：SQLite（默认）, SQL Server LocalDB, PostgreSQL
             * 配置方式：appsettings.json -> Database:Type
             * 关键修复：为不同数据库类型使用独立的迁移文件夹 */

            var configuration = context.Services.GetConfiguration();
            var databaseType = MultiDatabaseMigrationManager.GetDatabaseType(configuration);

            // 注册按数据库类型过滤的迁移程序集
            options.Configure(contextDbOpts =>
            {
                contextDbOpts.DbContextOptions.ReplaceService<Microsoft.EntityFrameworkCore.Migrations.IMigrationsAssembly, FilteringMigrationsAssembly>();
            });

            switch (databaseType)
            {
                case DatabaseType.SQLite:
                    options.UseSqlite(sqliteOptions =>
                    {
                        sqliteOptions.MigrationsHistoryTable("__EFMigrationsHistory_SQLite");
                        sqliteOptions.MigrationsAssembly("SmartAbp.EntityFrameworkCore");
                        // 指定SQLite专用的迁移文件夹
                        sqliteOptions.UseRelationalNulls();
                    });
                    break;
                    
                case DatabaseType.SqlServer:
                    options.UseSqlServer(sqlServerOptions =>
                    {
                        sqlServerOptions.MigrationsHistoryTable("__EFMigrationsHistory_SqlServer");
                        sqlServerOptions.MigrationsAssembly("SmartAbp.EntityFrameworkCore");
                        // SQL Server使用默认的SqlServer文件夹
                    });
                    break;
                    
                case DatabaseType.PostgreSQL:
                    options.UseNpgsql(npgsqlOptions =>
                    {
                        npgsqlOptions.MigrationsHistoryTable("__EFMigrationsHistory_PostgreSQL");
                        npgsqlOptions.MigrationsAssembly("SmartAbp.EntityFrameworkCore");
                        // PostgreSQL使用专用的迁移文件夹
                    });
                    break;
                    
                default:
                    // 默认使用SQLite（轻量级，无需安装服务器）
                    options.UseSqlite(sqliteOptions =>
                    {
                        sqliteOptions.MigrationsHistoryTable("__EFMigrationsHistory_SQLite");
                        sqliteOptions.MigrationsAssembly("SmartAbp.EntityFrameworkCore");
                        sqliteOptions.UseRelationalNulls();
                    });
                    break;
            }
        });
        
    }
}
