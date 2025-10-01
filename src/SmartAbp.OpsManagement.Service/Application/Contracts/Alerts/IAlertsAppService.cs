using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace SmartAbp.OpsManagement.Contracts.Alerts;

/// <summary>
/// 告警规则管理应用服务接口
/// </summary>
public interface IAlertsAppService : IApplicationService
{
    /// <summary>
    /// 获取告警规则列表
    /// </summary>
    Task<PagedResultDto<AlertRuleDto>> GetListAsync(GetAlertRulesInput input);

    /// <summary>
    /// 获取告警规则详情
    /// </summary>
    Task<AlertRuleDto> GetAsync(Guid id);

    /// <summary>
    /// 创建告警规则
    /// </summary>
    Task<AlertRuleDto> CreateAsync(CreateAlertRuleDto input);

    /// <summary>
    /// 更新告警规则
    /// </summary>
    Task<AlertRuleDto> UpdateAsync(Guid id, UpdateAlertRuleDto input);

    /// <summary>
    /// 删除告警规则
    /// </summary>
    Task DeleteAsync(Guid id);

    /// <summary>
    /// 启用/禁用告警规则
    /// </summary>
    Task ToggleAsync(Guid id, bool isEnabled);
}

