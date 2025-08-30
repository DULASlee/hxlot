using System.Threading.Tasks;
using Volo.Abp.DependencyInjection;

namespace SmartAbp.Data;

/* This is used if database provider does't define
 * ISmartAbpDbSchemaMigrator implementation.
 */
public class NullSmartAbpDbSchemaMigrator : ISmartAbpDbSchemaMigrator, ITransientDependency
{
    public Task MigrateAsync()
    {
        return Task.CompletedTask;
    }
}
