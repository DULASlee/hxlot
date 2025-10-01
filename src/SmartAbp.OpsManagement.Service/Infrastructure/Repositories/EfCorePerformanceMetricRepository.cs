using System;
using SmartAbp.OpsManagement.Entities;
using SmartAbp.OpsManagement.Infrastructure.EntityFrameworkCore;
using Volo.Abp.Domain.Repositories.EntityFrameworkCore;
using Volo.Abp.EntityFrameworkCore;

namespace SmartAbp.OpsManagement.Infrastructure.Repositories;

/// <summary>
/// 性能指标仓储实现
/// </summary>
public class EfCorePerformanceMetricRepository 
    : EfCoreRepository<OpsManagementDbContext, PerformanceMetric, Guid>, 
      IPerformanceMetricRepository
{
    public EfCorePerformanceMetricRepository(
        IDbContextProvider<OpsManagementDbContext> dbContextProvider)
        : base(dbContextProvider)
    {
    }
}

