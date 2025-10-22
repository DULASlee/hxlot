// 生产线 Repository Implementation
using Volo.Abp.Domain.Repositories.EntityFrameworkCore;
using Volo.Abp.EntityFrameworkCore;

namespace .Infrastructure.Repositories
{
    public class ProductionLineRepository : EfCoreRepository<MESDbContext, ProductionLine, Guid>, IProductionLineRepository
    {
        public ProductionLineRepository(IDbContextProvider<MESDbContext> dbContextProvider)
            : base(dbContextProvider)
        {
        }
    }
}