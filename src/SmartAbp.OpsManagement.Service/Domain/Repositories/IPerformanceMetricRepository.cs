using System;
using SmartAbp.OpsManagement.Entities;
using Volo.Abp.Domain.Repositories;

namespace SmartAbp.OpsManagement;

/// <summary>
/// 性能指标仓储接口
/// </summary>
public interface IPerformanceMetricRepository : IRepository<PerformanceMetric, Guid>
{
}

