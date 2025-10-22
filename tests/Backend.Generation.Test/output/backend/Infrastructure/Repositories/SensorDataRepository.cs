// 传感器数据 Repository Implementation
using Volo.Abp.Domain.Repositories.EntityFrameworkCore;
using Volo.Abp.EntityFrameworkCore;

namespace .Infrastructure.Repositories
{
    public class SensorDataRepository : EfCoreRepository<MESDbContext, SensorData, Guid>, ISensorDataRepository
    {
        public SensorDataRepository(IDbContextProvider<MESDbContext> dbContextProvider)
            : base(dbContextProvider)
        {
        }
    }
}