using SmartAbp.EntityFrameworkCore;
using Volo.Abp.Autofac;
using Volo.Abp.Modularity;

namespace SmartAbp.DbMigrator;

[DependsOn(
    typeof(AbpAutofacModule),
    typeof(SmartAbpEntityFrameworkCoreModule),
    typeof(SmartAbpApplicationContractsModule)
)]
public class SmartAbpDbMigratorModule : AbpModule
{
}
