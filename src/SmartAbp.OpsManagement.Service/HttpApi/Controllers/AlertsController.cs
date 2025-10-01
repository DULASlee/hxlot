using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using SmartAbp.OpsManagement.Contracts.Alerts;
using Volo.Abp.Application.Dtos;
using Volo.Abp.AspNetCore.Mvc;

namespace SmartAbp.OpsManagement.HttpApi.Controllers
{
    [Route("api/ops/alerts")]
    public class AlertsController : AbpController
    {
        private readonly IAlertsAppService _alertsAppService;

        public AlertsController(IAlertsAppService alertsAppService)
        {
            _alertsAppService = alertsAppService;
        }

        [HttpGet]
        public Task<PagedResultDto<AlertRuleDto>> GetListAsync([FromQuery] GetAlertRulesInput input)
        {
            return _alertsAppService.GetListAsync(input);
        }

        [HttpGet("{id}")]
        public Task<AlertRuleDto> GetAsync(Guid id)
        {
            return _alertsAppService.GetAsync(id);
        }

        [HttpPost]
        public Task<AlertRuleDto> CreateAsync([FromBody] CreateAlertRuleDto input)
        {
            return _alertsAppService.CreateAsync(input);
        }

        [HttpPut("{id}")]
        public Task<AlertRuleDto> UpdateAsync(Guid id, [FromBody] UpdateAlertRuleDto input)
        {
            return _alertsAppService.UpdateAsync(id, input);
        }

        [HttpDelete("{id}")]
        public Task DeleteAsync(Guid id)
        {
            return _alertsAppService.DeleteAsync(id);
        }

        [HttpPost("{id}/toggle")]
        public Task ToggleAsync(Guid id, [FromBody] ToggleAlertRuleDto input)
        {
            return _alertsAppService.ToggleAsync(id, input.IsEnabled);
        }
    }
}
