using Volo.Abp.Application;
using Volo.Abp.AutoMapper;
using Volo.Abp.Modularity;
using SmartAbp.PermissionManagement.Domain;
using SmartAbp.PermissionManagement.Application.Contracts;

namespace SmartAbp.PermissionManagement.Application;

/// <summary>
/// 权限管理应用服务层模块
/// 实现应用服务、命令处理、查询处理等
/// </summary>
[DependsOn(
    typeof(AbpDddApplicationModule),
    typeof(AbpAutoMapperModule),
    typeof(PermissionManagementDomainModule),
    typeof(PermissionManagementApplicationContractsModule)
)]
public class PermissionManagementApplicationModule : AbpModule
{
    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        // 配置AutoMapper
        Configure<AbpAutoMapperOptions>(options =>
        {
            options.AddMaps<PermissionManagementApplicationModule>();
        });
    }
}

