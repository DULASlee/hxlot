using Volo.Abp.Modularity;

namespace SmartAbp;

/* Inherit from this class for your domain layer tests. */
public abstract class SmartAbpDomainTestBase<TStartupModule> : SmartAbpTestBase<TStartupModule>
    where TStartupModule : IAbpModule
{

}
