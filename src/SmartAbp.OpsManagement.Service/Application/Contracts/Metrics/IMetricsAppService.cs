using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace SmartAbp.OpsManagement.Contracts.Metrics;

/// <summary>
/// 指标服务接口
/// </summary>
public interface IMetricsAppService : IApplicationService
{
    /// <summary>
    /// 获取实时指标
    /// </summary>
    Task<MetricDataDto> GetRealtimeMetricsAsync(MetricQueryDto input);

    /// <summary>
    /// 获取历史指标
    /// </summary>
    Task<PagedResultDto<MetricDataDto>> GetHistoryMetricsAsync(
        DateTime startTime,
        DateTime endTime,
        string serviceName,
        string metricType,
        int skipCount = 0,
        int maxResultCount = 100);

    /// <summary>
    /// 获取服务性能摘要
    /// </summary>
    Task<ServiceMetricsSummaryDto> GetServiceSummaryAsync(string serviceName);
}

