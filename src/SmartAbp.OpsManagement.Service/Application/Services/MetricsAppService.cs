using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.OpsManagement.Contracts.Metrics;
using SmartAbp.OpsManagement.Entities;
using Volo.Abp;
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
    private readonly ILogger<MetricsAppService> _logger;

    public MetricsAppService(
        IPrometheusService prometheusService,
        IPerformanceMetricRepository metricRepository,
        ILogger<MetricsAppService> logger)
    {
        _prometheusService = prometheusService;
        _metricRepository = metricRepository;
        _logger = logger;
    }

    /// <summary>
    /// 获取实时性能指标
    /// </summary>
    public async Task<MetricDataDto> GetRealtimeMetricsAsync(MetricQueryDto input)
    {
        Check.NotNull(input, nameof(input));
        Check.NotNullOrWhiteSpace(input.ServiceName, nameof(input.ServiceName));
        Check.NotNullOrWhiteSpace(input.MetricType, nameof(input.MetricType));

        try
        {
            var query = BuildPromQuery(input);
            var result = await _prometheusService.QueryAsync(query);

            return new MetricDataDto
            {
                ServiceName = input.ServiceName,
                MetricType = input.MetricType,
                Timestamp = DateTime.UtcNow,
                Value = result.Value,
                Labels = result.Labels
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get realtime metrics");
            throw new BusinessException(
                OpsManagementErrorCodes.MetricsQueryFailed,
                "Failed to get realtime metrics.");
        }
    }

    /// <summary>
    /// 获取历史性能指标
    /// </summary>
    public async Task<PagedResultDto<MetricDataDto>> GetHistoryMetricsAsync(
        DateTime startTime,
        DateTime endTime,
        string serviceName,
        string metricType,
        int skipCount = 0,
        int maxResultCount = 100)
    {
        try
        {
            // 将字符串转换为MetricType枚举
            if (!Enum.TryParse<MetricType>(metricType, out var metricTypeEnum))
            {
                throw new ArgumentException($"Invalid metric type: {metricType}", nameof(metricType));
            }

            var query = await _metricRepository.GetQueryableAsync();

            var filteredQuery = query
                .Where(m => m.Timestamp >= startTime && m.Timestamp <= endTime)
                .Where(m => m.ServiceName == serviceName)
                .Where(m => m.Type == metricTypeEnum)
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
                Labels = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, string>>(m.Tags) ?? new()
            }).ToList();

            return new PagedResultDto<MetricDataDto>(totalCount, dtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get history metrics");
            throw new BusinessException(
                OpsManagementErrorCodes.MetricsQueryFailed,
                "Failed to get history metrics.");
        }
    }

    /// <summary>
    /// 获取服务性能摘要
    /// </summary>
    public async Task<ServiceMetricsSummaryDto> GetServiceSummaryAsync(string serviceName)
    {
        Check.NotNullOrWhiteSpace(serviceName, nameof(serviceName));

        try
        {
            var query = await _metricRepository.GetQueryableAsync();
            var last24Hours = DateTime.UtcNow.AddHours(-24);

            var metrics = query
                .Where(m => m.ServiceName == serviceName && m.Timestamp >= last24Hours)
                .ToList();

            var summary = new ServiceMetricsSummaryDto
            {
                ServiceName = serviceName,
                Period = "24h",
                AverageCpu = CalculateAverage(metrics, MetricType.CpuUsage),
                AverageMemory = CalculateAverage(metrics, MetricType.MemoryUsage),
                TotalRequests = (long)CalculateSum(metrics, MetricType.RequestCount),
                ErrorRate = CalculateAverage(metrics, MetricType.ErrorRate)
            };

            return summary;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get service summary");
            throw new BusinessException(
                OpsManagementErrorCodes.MetricsQueryFailed,
                "Failed to get service summary.");
        }
    }

    private string BuildPromQuery(MetricQueryDto input)
    {
        return $"{input.MetricType}{{service=\"{input.ServiceName}\"}}";
    }

    private double CalculateAverage(List<PerformanceMetric> metrics, MetricType type)
    {
        var typeMetrics = metrics.Where(m => m.Type == type).ToList();
        return typeMetrics.Any() ? typeMetrics.Average(m => m.Value) : 0;
    }

    private double CalculateSum(List<PerformanceMetric> metrics, MetricType type)
    {
        return metrics.Where(m => m.Type == type).Sum(m => m.Value);
    }
}
