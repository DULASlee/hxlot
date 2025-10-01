using System;
using System.Collections.Generic;
using Volo.Abp.Domain.Entities.Auditing;

namespace SmartAbp.OpsManagement.Entities;

/// <summary>
/// 性能指标实体
/// </summary>
public class PerformanceMetric : AuditedAggregateRoot<Guid>
{
    /// <summary>
    /// 服务名称
    /// </summary>
    public string ServiceName { get; set; } = string.Empty;
    
    /// <summary>
    /// 实例ID
    /// </summary>
    public string InstanceId { get; set; } = string.Empty;
    
    /// <summary>
    /// 时间戳
    /// </summary>
    public DateTime Timestamp { get; set; }
    
    /// <summary>
    /// 指标类型
    /// </summary>
    public MetricType Type { get; set; }
    
    /// <summary>
    /// 指标值
    /// </summary>
    public double Value { get; set; }
    
    /// <summary>
    /// 标签（JSON格式）
    /// </summary>
    public string Tags { get; set; } = "{}";
    
    /// <summary>
    /// 构造函数
    /// </summary>
    protected PerformanceMetric()
    {
    }
    
    /// <summary>
    /// 创建性能指标
    /// </summary>
    public PerformanceMetric(
        Guid id,
        string serviceName,
        string instanceId,
        MetricType type,
        double value)
        : base(id)
    {
        ServiceName = serviceName;
        InstanceId = instanceId;
        Type = type;
        Value = value;
        Timestamp = DateTime.UtcNow;
    }
    
    /// <summary>
    /// 判断是否异常（根据告警规则）
    /// </summary>
    public bool IsAbnormal(double threshold)
    {
        return Value > threshold;
    }
}

/// <summary>
/// 指标类型枚举
/// </summary>
public enum MetricType
{
    /// <summary>
    /// CPU使用率
    /// </summary>
    CpuUsage = 1,
    
    /// <summary>
    /// 内存使用率
    /// </summary>
    MemoryUsage = 2,
    
    /// <summary>
    /// GC次数
    /// </summary>
    GcCount = 3,
    
    /// <summary>
    /// API响应时间
    /// </summary>
    ApiResponseTime = 4,
    
    /// <summary>
    /// 请求数量
    /// </summary>
    RequestCount = 5,
    
    /// <summary>
    /// 错误率
    /// </summary>
    ErrorRate = 6
}

