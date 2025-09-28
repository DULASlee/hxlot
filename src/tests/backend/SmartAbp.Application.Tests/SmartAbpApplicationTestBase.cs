using Volo.Abp.Modularity;

namespace SmartAbp;

public abstract class SmartAbpApplicationTestBase<TStartupModule> : SmartAbpTestBase<TStartupModule>
    where TStartupModule : IAbpModule
{

}
