using Volo.Abp.Account;
using Volo.Abp.AutoMapper;
using Volo.Abp.Modularity;
using Volo.Abp.PermissionManagement;
using Volo.Abp.SettingManagement;
using Volo.Abp.FeatureManagement;
using Volo.Abp.Identity;
using Volo.Abp.TenantManagement;
using SmartAbp.DevKit.Integration;

namespace SmartAbp;

[DependsOn(
    typeof(SmartAbpDomainModule),
    typeof(SmartAbpApplicationContractsModule),
    typeof(SmartAbpDevKitModule), // 添加DevKit模块依赖
    typeof(AbpAutoMapperModule),
    typeof(AbpFeatureManagementApplicationModule),
    typeof(AbpSettingManagementApplicationModule),
    typeof(AbpIdentityApplicationModule),
    typeof(AbpAccountApplicationModule),
    typeof(AbpTenantManagementApplicationModule),
    typeof(AbpPermissionManagementApplicationModule)
)]
public class SmartAbpApplicationModule : AbpModule
{
    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        Configure<AbpAutoMapperOptions>(options =>
        {
            options.AddMaps<SmartAbpApplicationModule>();
        });
    }
}
