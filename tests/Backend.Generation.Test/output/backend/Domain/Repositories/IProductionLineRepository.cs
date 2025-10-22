// 生产线 Repository Interface
using Volo.Abp.Domain.Repositories;

namespace .Domain.Repositories
{
    public interface IProductionLineRepository : IRepository<ProductionLine, Guid>
    {
    }
}