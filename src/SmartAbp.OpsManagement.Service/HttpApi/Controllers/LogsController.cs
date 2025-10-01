using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using SmartAbp.OpsManagement.Contracts.Logs;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.AspNetCore.Mvc;

namespace SmartAbp.OpsManagement.HttpApi.Controllers
{
    [Route("api/ops/logs")]
    public class LogsController : AbpController
    {
        private readonly ILogsAppService _logsAppService;

        public LogsController(ILogsAppService logsAppService)
        {
            _logsAppService = logsAppService;
        }

        [HttpPost("search")] 
        public Task<PagedResultDto<LogEntryDto>> Search([FromBody] LogSearchRequest input)
        {
            return _logsAppService.SearchLogsAsync(input);
        }

        [HttpGet("stats")] 
        public Task<LogStatisticsDto> Stats(DateTime startTime, DateTime endTime, string? serviceName = null)
        {
            return _logsAppService.GetLogStatisticsAsync(startTime, endTime, serviceName);
        }

        [HttpPost("index")] 
        public Task<bool> Index([FromBody] LogEntryDocument log)
        {
            return _logsAppService.IndexLogAsync(log);
        }

        [HttpPost("bulk-index")] 
        public Task<bool> BulkIndex([FromBody] List<LogEntryDocument> logs)
        {
            return _logsAppService.BulkIndexLogsAsync(logs);
        }
    }
}
