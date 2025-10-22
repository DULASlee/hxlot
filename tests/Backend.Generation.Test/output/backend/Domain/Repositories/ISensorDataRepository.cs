// 传感器数据 Repository Interface
using Volo.Abp.Domain.Repositories;

namespace .Domain.Repositories
{
    public interface ISensorDataRepository : IRepository<SensorData, Guid>
    {
    }
}