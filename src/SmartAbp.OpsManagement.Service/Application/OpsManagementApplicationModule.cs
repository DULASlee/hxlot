using Volo.Abp.Application;
using Volo.Abp.AutoMapper;
using Volo.Abp.Modularity;
using SmartAbp.OpsManagement.Domain;
using SmartAbp.OpsManagement.Application.Contracts;

namespace SmartAbp.OpsManagement.Application;

/// <summary>
/// 运维管理应用层模块
/// </summary>
[DependsOn(
    typeof(OpsManagementDomainModule),
    typeof(OpsManagementApplicationContractsModule),
    typeof(AbpDddApplicationModule),
    typeof(AbpAutoMapperModule)
)]
public class OpsManagementApplicationModule : AbpModule
{
    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        Configure<AbpAutoMapperOptions>(options =>
        {
            options.AddMaps<OpsManagementApplicationModule>();
        });
    }
}
