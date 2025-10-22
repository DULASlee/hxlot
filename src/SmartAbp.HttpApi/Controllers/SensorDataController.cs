using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using SmartAbp.Application.Contracts.SensorData;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.AspNetCore.Mvc;

namespace SmartAbp.Controllers
{
    [RemoteService(Name = "Default")]
    [Area("app")]
    [Route("api/app/sensor-data")]
    public class SensorDataController : AbpController
    {
        private readonly ISensorDataAppService _sensorDataAppService;

        public SensorDataController(ISensorDataAppService sensorDataAppService)
        {
            _sensorDataAppService = sensorDataAppService;
        }

        [HttpGet]
        public async Task<PagedResultDto<SensorDataDto>> GetListAsync([FromQuery] GetSensorDataListInput input)
        {
            return await _sensorDataAppService.GetListAsync(input);
        }

        [HttpGet("{id}")]
        public async Task<SensorDataDto> GetAsync(Guid id)
        {
            return await _sensorDataAppService.GetAsync(id);
        }

        [HttpPost]
        public async Task<SensorDataDto> CreateAsync([FromBody] CreateSensorDataDto input)
        {
            return await _sensorDataAppService.CreateAsync(input);
        }

        [HttpPut("{id}")]
        public async Task<SensorDataDto> UpdateAsync(Guid id, [FromBody] UpdateSensorDataDto input)
        {
            return await _sensorDataAppService.UpdateAsync(id, input);
        }

        [HttpDelete("{id}")]
        public async Task DeleteAsync(Guid id)
        {
            await _sensorDataAppService.DeleteAsync(id);
        }
    }
}

