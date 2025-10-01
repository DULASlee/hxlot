using System;
using System.Collections.Generic;

namespace SmartAbp.OpsManagement.Contracts.Metrics;

/// <summary>
/// 指标查询DTO
/// </summary>
public class MetricQueryDto
{
    /// <summary>
    /// 服务名称
    /// </summary>
    public string ServiceName { get; set; } = string.Empty;

    /// <summary>
    /// 指标类型
    /// </summary>
    public string MetricType { get; set; } = string.Empty;

    /// <summary>
    /// 时间范围（分钟）
    /// </summary>
    public int TimeRangeMinutes { get; set; } = 5;
}

/// <summary>
/// 指标数据DTO
/// </summary>
public class MetricDataDto
{
    /// <summary>
    /// 服务名称
    /// </summary>
    public string ServiceName { get; set; } = string.Empty;

    /// <summary>
    /// 指标类型
    /// </summary>
    public string MetricType { get; set; } = string.Empty;

    /// <summary>
    /// 时间戳
    /// </summary>
    public DateTime Timestamp { get; set; }

    /// <summary>
    /// 指标值
    /// </summary>
    public double Value { get; set; }

    /// <summary>
    /// 标签
    /// </summary>
    public Dictionary<string, string> Labels { get; set; } = new();
}

/// <summary>
/// 服务性能摘要DTO
/// </summary>
public class ServiceMetricsSummaryDto
{
    /// <summary>
    /// 服务名称
    /// </summary>
    public string ServiceName { get; set; } = string.Empty;

    /// <summary>
    /// 统计周期
    /// </summary>
    public string Period { get; set; } = string.Empty;

    /// <summary>
    /// 平均CPU使用率（%）
    /// </summary>
    public double AverageCpu { get; set; }

    /// <summary>
    /// 平均内存使用（MB）
    /// </summary>
    public double AverageMemory { get; set; }

    /// <summary>
    /// 总请求数
    /// </summary>
    public long TotalRequests { get; set; }

    /// <summary>
    /// 错误率（%）
    /// </summary>
    public double ErrorRate { get; set; }

    /// <summary>
    /// CPU使用率（%）
    /// </summary>
    public double CpuUsage { get; set; }

    /// <summary>
    /// 内存使用（MB）
    /// </summary>
    public double MemoryUsage { get; set; }

    /// <summary>
    /// 请求数量
    /// </summary>
    public double RequestCount { get; set; }

    /// <summary>
    /// 平均响应时间（ms）
    /// </summary>
    public double AvgResponseTime { get; set; }

    /// <summary>
    /// 最后更新时间
    /// </summary>
    public DateTime LastUpdateTime { get; set; }
}

