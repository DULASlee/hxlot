using Volo.Abp.Modularity;

namespace SmartAbp;

[DependsOn(
    typeof(SmartAbpApplicationModule),
    typeof(SmartAbpDomainTestModule)
)]
public class SmartAbpApplicationTestModule : AbpModule
{

}
