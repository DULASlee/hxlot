using Volo.Abp.Modularity;

namespace SmartAbp;

[DependsOn(
    typeof(SmartAbpDomainModule),
    typeof(SmartAbpTestBaseModule)
)]
public class SmartAbpDomainTestModule : AbpModule
{

}
