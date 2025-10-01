using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SmartAbp.OpsManagement.Services;

/// <summary>
/// Prometheus服务接口
/// </summary>
public interface IPrometheusService
{
    Task<PrometheusQueryResult> QueryAsync(string query);
    Task<List<PrometheusDataPoint>> QueryRangeAsync(string query, DateTime start, DateTime end, string step = "15s");
}

/// <summary>
/// Prometheus查询结果
/// </summary>
public class PrometheusQueryResult
{
    public double Value { get; set; }
    public Dictionary<string, string> Labels { get; set; } = new();
}

/// <summary>
/// Prometheus数据点
/// </summary>
public class PrometheusDataPoint
{
    public DateTime Timestamp { get; set; }
    public double Value { get; set; }
}

