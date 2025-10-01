using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace SmartAbp.OpsManagement.Entities;

/// <summary>
/// 告警规则实体
/// </summary>
public class AlertRule : FullAuditedAggregateRoot<Guid>
{
    /// <summary>
    /// 规则名称
    /// </summary>
    public string RuleName { get; set; } = string.Empty;
    
    /// <summary>
    /// 服务名称过滤器
    /// </summary>
    public string ServiceFilter { get; set; } = string.Empty;
    
    /// <summary>
    /// 指标类型
    /// </summary>
    public MetricType MetricType { get; set; }
    
    /// <summary>
    /// 告警条件（阈值）
    /// </summary>
    public double Threshold { get; set; }
    
    /// <summary>
    /// 告警级别
    /// </summary>
    public AlertLevel Level { get; set; }
    
    /// <summary>
    /// 是否启用
    /// </summary>
    public bool IsEnabled { get; set; } = true;
    
    protected AlertRule()
    {
    }
    
    public AlertRule(Guid id, string ruleName, MetricType metricType, double threshold, AlertLevel level)
        : base(id)
    {
        RuleName = ruleName;
        MetricType = metricType;
        Threshold = threshold;
        Level = level;
    }
}

public enum AlertLevel
{
    Info = 1,
    Warning = 2,
    Error = 3,
    Critical = 4
}

