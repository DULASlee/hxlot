using System;

namespace SmartAbp.DevKit.Core.Abstractions;

/// <summary>
/// 性能分析器接口（负责性能监控和追踪）
/// </summary>
public interface IPerformanceProfiler
{
    /// <summary>
    /// 开始性能追踪作用域
    /// </summary>
    /// <param name="operationName">操作名称</param>
    /// <returns>性能作用域（Dispose时自动记录性能）</returns>
    IDisposable BeginScope(string operationName);

    /// <summary>
    /// 记录性能指标
    /// </summary>
    /// <param name="operationName">操作名称</param>
    /// <param name="durationMs">耗时（毫秒）</param>
    /// <param name="metadata">额外元数据</param>
    void RecordMetrics(string operationName, long durationMs, object? metadata = null);

    /// <summary>
    /// 获取性能报告
    /// </summary>
    /// <returns>性能报告</returns>
    PerformanceReport GetReport();
}

/// <summary>
/// 性能报告
/// </summary>
public class PerformanceReport
{
    /// <summary>
    /// 总操作数
    /// </summary>
    public int TotalOperations { get; set; }

    /// <summary>
    /// 总耗时（毫秒）
    /// </summary>
    public long TotalDurationMs { get; set; }

    /// <summary>
    /// 平均耗时（毫秒）
    /// </summary>
    public double AverageDurationMs => TotalOperations > 0
        ? (double)TotalDurationMs / TotalOperations
        : 0;

    /// <summary>
    /// 操作明细列表
    /// </summary>
    public List<PerformanceMetric> Metrics { get; set; } = new();
}

/// <summary>
/// 性能指标
/// </summary>
public class PerformanceMetric
{
    /// <summary>
    /// 操作名称
    /// </summary>
    public required string OperationName { get; set; }

    /// <summary>
    /// 耗时（毫秒）
    /// </summary>
    public long DurationMs { get; set; }

    /// <summary>
    /// 记录时间
    /// </summary>
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// 额外元数据
    /// </summary>
    public Dictionary<string, object> Metadata { get; set; } = new();
}

