using SmartAbp.DevKit.Core;
using SmartAbp.EntityFrameworkCore;
using Volo.Abp.Autofac;
using Volo.Abp.Modularity;

namespace SmartAbp.DbMigrator;

[DependsOn(
    typeof(AbpAutofacModule),
    typeof(SmartAbpEntityFrameworkCoreModule),
    typeof(SmartAbpApplicationContractsModule),
    typeof(SmartAbpDevKitCoreModule) // Week 4-5: DevKit集成
)]
public class SmartAbpDbMigratorModule : AbpModule
{
}
