using System;
using Volo.Abp.Application.Dtos;

namespace SmartAbp.OpsManagement.Contracts.Alerts;

/// <summary>
/// 告警规则DTO
/// </summary>
public class AlertRuleDto : EntityDto<Guid>
{
    public string RuleName { get; set; } = string.Empty;
    public string MetricType { get; set; } = string.Empty;
    public double Threshold { get; set; }
    public string Operator { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty;
    public string TargetResource { get; set; } = string.Empty;
    public string NotificationChannels { get; set; } = string.Empty;
    public bool IsEnabled { get; set; }
    public DateTime CreationTime { get; set; }
}

/// <summary>
/// 创建告警规则DTO
/// </summary>
public class CreateAlertRuleDto
{
    public string RuleName { get; set; } = string.Empty;
    public string MetricType { get; set; } = string.Empty;
    public double Threshold { get; set; }
    public string Operator { get; set; } = ">";
    public string Severity { get; set; } = "Warning";
    public string? TargetResource { get; set; }
    public string? NotificationChannels { get; set; }
    public bool IsEnabled { get; set; } = true;
}

/// <summary>
/// 更新告警规则DTO
/// </summary>
public class UpdateAlertRuleDto
{
    public string? RuleName { get; set; }
    public double? Threshold { get; set; }
    public string? Operator { get; set; }
    public string? Severity { get; set; }
    public string? TargetResource { get; set; }
    public string? NotificationChannels { get; set; }
    public bool? IsEnabled { get; set; }
}

/// <summary>
/// 获取告警规则列表输入
/// </summary>
public class GetAlertRulesInput : PagedAndSortedResultRequestDto
{
    public string? MetricType { get; set; }
    public bool? IsEnabled { get; set; }
}

/// <summary>
/// 启用/禁用告警规则请求
/// </summary>
public class ToggleAlertRuleDto
{
    public bool IsEnabled { get; set; }
}

