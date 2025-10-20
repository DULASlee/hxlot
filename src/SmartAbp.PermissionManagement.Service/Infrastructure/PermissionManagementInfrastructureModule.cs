using Microsoft.Extensions.DependencyInjection;
using Volo.Abp.EntityFrameworkCore;
using Volo.Abp.Modularity;
using SmartAbp.PermissionManagement.Domain;
using SmartAbp.PermissionManagement.Infrastructure.EntityFrameworkCore;

namespace SmartAbp.PermissionManagement.Infrastructure;

/// <summary>
/// 权限管理基础设施层模块
/// 实现数据访问、仓储、外部服务集成等
/// </summary>
[DependsOn(
    typeof(AbpEntityFrameworkCoreModule),
    typeof(PermissionManagementDomainModule)
)]
public class PermissionManagementInfrastructureModule : AbpModule
{
    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        // 配置EF Core
        context.Services.AddAbpDbContext<PermissionManagementDbContext>(options =>
        {
            options.AddDefaultRepositories(includeAllEntities: true);
        });
    }
}

