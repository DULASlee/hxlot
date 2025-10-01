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
    /// 指标类型
    /// </summary>
    public string MetricType { get; set; } = string.Empty;
    
    /// <summary>
    /// 阈值
    /// </summary>
    public double Threshold { get; set; }
    
    /// <summary>
    /// 操作符（>、<、>=、<=、==）
    /// </summary>
    public string Operator { get; set; } = ">";
    
    /// <summary>
    /// 严重级别
    /// </summary>
    public string Severity { get; set; } = "Warning";
    
    /// <summary>
    /// 目标资源
    /// </summary>
    public string TargetResource { get; set; } = string.Empty;
    
    /// <summary>
    /// 通知渠道（JSON格式）
    /// </summary>
    public string NotificationChannels { get; set; } = "[]";
    
    /// <summary>
    /// 是否启用
    /// </summary>
    public bool IsEnabled { get; set; } = true;
    
    protected AlertRule()
    {
    }
    
    public AlertRule(
        Guid id, 
        string ruleName, 
        string metricType, 
        double threshold, 
        string @operator = ">", 
        string severity = "Warning")
        : base(id)
    {
        RuleName = ruleName;
        MetricType = metricType;
        Threshold = threshold;
        Operator = @operator;
        Severity = severity;
    }
}

