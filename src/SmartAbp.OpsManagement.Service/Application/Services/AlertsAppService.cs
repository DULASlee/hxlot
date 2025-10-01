using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.OpsManagement.Contracts.Alerts;
using SmartAbp.OpsManagement.Entities;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace SmartAbp.OpsManagement.Services;

/// <summary>
/// 告警规则管理应用服务
/// </summary>
public class AlertsAppService : ApplicationService, IAlertsAppService
{
    private readonly IRepository<AlertRule, Guid> _alertRuleRepository;
    private readonly ILogger<AlertsAppService> _logger;

    public AlertsAppService(
        IRepository<AlertRule, Guid> alertRuleRepository,
        ILogger<AlertsAppService> logger)
    {
        _alertRuleRepository = alertRuleRepository;
        _logger = logger;
    }

    /// <summary>
    /// 获取告警规则列表
    /// </summary>
    public async Task<PagedResultDto<AlertRuleDto>> GetListAsync(GetAlertRulesInput input)
    {
        var query = await _alertRuleRepository.GetQueryableAsync();

        if (input.IsEnabled.HasValue)
        {
            query = query.Where(r => r.IsEnabled == input.IsEnabled.Value);
        }

        if (!string.IsNullOrWhiteSpace(input.MetricType))
        {
            query = query.Where(r => r.MetricType == input.MetricType);
        }

        var totalCount = query.Count();
        var items = query
            .OrderByDescending(r => r.CreationTime)
            .Skip(input.SkipCount)
            .Take(input.MaxResultCount)
            .ToList();

        var dtos = items.Select(MapToDto).ToList();

        return new PagedResultDto<AlertRuleDto>(totalCount, dtos);
    }

    /// <summary>
    /// 获取告警规则详情
    /// </summary>
    public async Task<AlertRuleDto> GetAsync(Guid id)
    {
        var rule = await _alertRuleRepository.GetAsync(id);
        return MapToDto(rule);
    }

    /// <summary>
    /// 创建告警规则
    /// </summary>
    public async Task<AlertRuleDto> CreateAsync(CreateAlertRuleDto input)
    {
        Check.NotNull(input, nameof(input));
        Check.NotNullOrWhiteSpace(input.RuleName, nameof(input.RuleName));
        Check.NotNullOrWhiteSpace(input.MetricType, nameof(input.MetricType));

        var rule = new AlertRule(
            GuidGenerator.Create(),
            input.RuleName,
            input.MetricType,
            input.Threshold,
            input.Operator,
            input.Severity
        )
        {
            TargetResource = input.TargetResource ?? string.Empty,
            NotificationChannels = input.NotificationChannels ?? "[]",
            IsEnabled = input.IsEnabled
        };

        await _alertRuleRepository.InsertAsync(rule);

        _logger.LogInformation("Created alert rule: {RuleName}", input.RuleName);

        return MapToDto(rule);
    }

    /// <summary>
    /// 更新告警规则
    /// </summary>
    public async Task<AlertRuleDto> UpdateAsync(Guid id, UpdateAlertRuleDto input)
    {
        Check.NotNull(input, nameof(input));

        var rule = await _alertRuleRepository.GetAsync(id);

        if (!string.IsNullOrWhiteSpace(input.RuleName))
        {
            rule.RuleName = input.RuleName;
        }

        if (input.Threshold.HasValue)
        {
            rule.Threshold = input.Threshold.Value;
        }

        if (!string.IsNullOrWhiteSpace(input.Operator))
        {
            rule.Operator = input.Operator;
        }

        if (!string.IsNullOrWhiteSpace(input.Severity))
        {
            rule.Severity = input.Severity;
        }

        if (input.TargetResource != null)
        {
            rule.TargetResource = input.TargetResource;
        }

        if (input.NotificationChannels != null)
        {
            rule.NotificationChannels = input.NotificationChannels;
        }

        if (input.IsEnabled.HasValue)
        {
            rule.IsEnabled = input.IsEnabled.Value;
        }

        await _alertRuleRepository.UpdateAsync(rule);

        _logger.LogInformation("Updated alert rule: {Id}", id);

        return MapToDto(rule);
    }

    /// <summary>
    /// 删除告警规则
    /// </summary>
    public async Task DeleteAsync(Guid id)
    {
        await _alertRuleRepository.DeleteAsync(id);
        _logger.LogInformation("Deleted alert rule: {Id}", id);
    }

    /// <summary>
    /// 启用/禁用告警规则
    /// </summary>
    public async Task ToggleAsync(Guid id, bool isEnabled)
    {
        var rule = await _alertRuleRepository.GetAsync(id);
        rule.IsEnabled = isEnabled;
        await _alertRuleRepository.UpdateAsync(rule);

        _logger.LogInformation("Toggled alert rule {Id}: IsEnabled={IsEnabled}", id, isEnabled);
    }

    private static AlertRuleDto MapToDto(AlertRule rule)
    {
        return new AlertRuleDto
        {
            Id = rule.Id,
            RuleName = rule.RuleName,
            MetricType = rule.MetricType,
            Threshold = rule.Threshold,
            Operator = rule.Operator,
            Severity = rule.Severity,
            TargetResource = rule.TargetResource,
            NotificationChannels = rule.NotificationChannels,
            IsEnabled = rule.IsEnabled,
            CreationTime = rule.CreationTime
        };
    }
}
