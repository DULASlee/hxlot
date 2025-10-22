// 设备 Repository Implementation
using Volo.Abp.Domain.Repositories.EntityFrameworkCore;
using Volo.Abp.EntityFrameworkCore;

namespace .Infrastructure.Repositories
{
    public class EquipmentRepository : EfCoreRepository<MESDbContext, Equipment, Guid>, IEquipmentRepository
    {
        public EquipmentRepository(IDbContextProvider<MESDbContext> dbContextProvider)
            : base(dbContextProvider)
        {
        }
    }
}