using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SmartAbp.OpsManagement.Contracts.Metrics;
using SmartAbp.OpsManagement.Entities;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace SmartAbp.OpsManagement.Services;

/// <summary>
/// 性能指标应用服务
/// </summary>
public class MetricsAppService : ApplicationService, IMetricsAppService
{
    private readonly IPrometheusService _prometheusService;
    private readonly IPerformanceMetricRepository _metricRepository;

    public MetricsAppService(
        IPrometheusService prometheusService,
        IPerformanceMetricRepository metricRepository)
    {
        _prometheusService = prometheusService;
        _metricRepository = metricRepository;
    }

    /// <summary>
    /// 获取实时性能指标
    /// </summary>
    public async Task<MetricDataDto> GetRealtimeMetricsAsync(MetricQueryDto input)
    {
        // 构建Prometheus查询
        var query = BuildPromQuery(input);

        // 查询Prometheus
        var result = await _prometheusService.QueryAsync(query);

        // 转换为DTO
        return new MetricDataDto
        {
            ServiceName = input.ServiceName,
            MetricType = input.MetricType,
            Timestamp = DateTime.UtcNow,
            Value = result.Value,
            Labels = result.Labels
        };
    }

    /// <summary>
    /// 获取历史性能指标
    /// </summary>
    public async Task<PagedResultDto<MetricDataDto>> GetHistoryMetricsAsync(
        DateTime startTime,
        DateTime endTime,
        string serviceName,
        MetricType metricType,
        int skipCount = 0,
        int maxResultCount = 100)
    {
        // 从数据库查询历史指标
        var query = await _metricRepository.GetQueryableAsync();
        
        var filteredQuery = query
            .Where(m => m.Timestamp >= startTime && m.Timestamp <= endTime)
            .Where(m => m.ServiceName == serviceName)
            .Where(m => m.Type == metricType)
            .OrderByDescending(m => m.Timestamp);

        var totalCount = filteredQuery.Count();
        var items = filteredQuery
            .Skip(skipCount)
            .Take(maxResultCount)
            .ToList();

        var dtos = items.Select(m => new MetricDataDto
        {
            ServiceName = m.ServiceName,
            MetricType = m.Type.ToString(),
            Timestamp = m.Timestamp,
            Value = m.Value,
            Labels = new Dictionary<string, string>
            {
                { "instance", m.InstanceId }
            }
        }).ToList();

        return new PagedResultDto<MetricDataDto>(totalCount, dtos);
    }

    /// <summary>
    /// 获取服务性能摘要
    /// </summary>
    public async Task<ServiceMetricsSummaryDto> GetServiceSummaryAsync(string serviceName)
    {
        var now = DateTime.UtcNow;
        var last5Minutes = now.AddMinutes(-5);

        // 查询最近5分钟的指标
        var metrics = await _metricRepository.GetListAsync(
            m => m.ServiceName == serviceName && m.Timestamp >= last5Minutes);

        // 计算摘要
        var summary = new ServiceMetricsSummaryDto
        {
            ServiceName = serviceName,
            CpuUsage = CalculateAverage(metrics, MetricType.CpuUsage),
            MemoryUsage = CalculateAverage(metrics, MetricType.MemoryUsage),
            RequestCount = CalculateSum(metrics, MetricType.RequestCount),
            ErrorRate = CalculateAverage(metrics, MetricType.ErrorRate),
            AvgResponseTime = CalculateAverage(metrics, MetricType.ApiResponseTime),
            LastUpdateTime = now
        };

        return summary;
    }

    private string BuildPromQuery(MetricQueryDto input)
    {
        // 根据指标类型构建PromQL查询
        return input.MetricType.ToLower() switch
        {
            "cpuusage" => $"rate(process_cpu_seconds_total{{service=\"{input.ServiceName}\"}}[5m]) * 100",
            "memoryusage" => $"process_working_set_bytes{{service=\"{input.ServiceName}\"}} / 1024 / 1024",
            "requestcount" => $"rate(http_requests_total{{service=\"{input.ServiceName}\"}}[5m])",
            "errorrate" => $"rate(http_requests_errors_total{{service=\"{input.ServiceName}\"}}[5m]) / rate(http_requests_total{{service=\"{input.ServiceName}\"}}[5m]) * 100",
            _ => $"{input.MetricType}{{service=\"{input.ServiceName}\"}}"
        };
    }

    private double CalculateAverage(List<PerformanceMetric> metrics, MetricType type)
    {
        var filtered = metrics.Where(m => m.Type == type).ToList();
        return filtered.Any() ? filtered.Average(m => m.Value) : 0;
    }

    private double CalculateSum(List<PerformanceMetric> metrics, MetricType type)
    {
        return metrics.Where(m => m.Type == type).Sum(m => m.Value);
    }
}

/// <summary>
/// 性能指标应用服务接口
/// </summary>
public interface IMetricsAppService : IApplicationService
{
    Task<MetricDataDto> GetRealtimeMetricsAsync(MetricQueryDto input);
    Task<PagedResultDto<MetricDataDto>> GetHistoryMetricsAsync(DateTime startTime, DateTime endTime, string serviceName, MetricType metricType, int skipCount = 0, int maxResultCount = 100);
    Task<ServiceMetricsSummaryDto> GetServiceSummaryAsync(string serviceName);
}

/// <summary>
/// Prometheus服务接口
/// </summary>
public interface IPrometheusService
{
    Task<PrometheusQueryResult> QueryAsync(string query);
}

/// <summary>
/// 性能指标仓储接口
/// </summary>
public interface IPerformanceMetricRepository : Volo.Abp.Domain.Repositories.IRepository<PerformanceMetric, Guid>
{
}

/// <summary>
/// Prometheus查询结果
/// </summary>
public class PrometheusQueryResult
{
    public double Value { get; set; }
    public Dictionary<string, string> Labels { get; set; } = new();
}

