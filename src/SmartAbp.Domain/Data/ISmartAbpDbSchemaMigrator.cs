using System.Threading.Tasks;

namespace SmartAbp.Data;

public interface ISmartAbpDbSchemaMigrator
{
    Task MigrateAsync();
}
