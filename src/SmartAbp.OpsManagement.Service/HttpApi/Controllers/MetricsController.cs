using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using SmartAbp.OpsManagement.Contracts.Metrics;
using Volo.Abp;
using Volo.Abp.AspNetCore.Mvc;

namespace SmartAbp.OpsManagement.HttpApi.Controllers
{
    [Route("api/ops/metrics")]
    public class MetricsController : AbpController
    {
        private readonly IMetricsAppService _metricsAppService;

        public MetricsController(IMetricsAppService metricsAppService)
        {
            _metricsAppService = metricsAppService;
        }

        [HttpPost("realtime")] 
        public Task<MetricDataDto> GetRealtime([FromBody] MetricQueryDto input)
        {
            return _metricsAppService.GetRealtimeMetricsAsync(input);
        }

        [HttpGet("history")] 
        public Task<Volo.Abp.Application.Dtos.PagedResultDto<MetricDataDto>> GetHistory(
            DateTime startTime,
            DateTime endTime,
            string serviceName,
            string metricType,
            int skipCount = 0,
            int maxResultCount = 100)
        {
            return _metricsAppService.GetHistoryMetricsAsync(startTime, endTime, serviceName, metricType, skipCount, maxResultCount);
        }

        [HttpGet("summary/{serviceName}")] 
        public Task<ServiceMetricsSummaryDto> GetSummary(string serviceName)
        {
            return _metricsAppService.GetServiceSummaryAsync(serviceName);
        }
    }
}
