// 传感器数据 Controller
using Microsoft.AspNetCore.Mvc;
using Volo.Abp.AspNetCore.Mvc;

namespace .HttpApi.Controllers
{
    [ApiController]
    [Route("api/mes/sensor-data")]
    public class SensorDataController : AbpController
    {
        private readonly ISensorDataAppService _service;

        public SensorDataController(ISensorDataAppService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<PagedResultDto<SensorDataDto>> GetListAsync([FromQuery] PagedAndSortedResultRequestDto input)
        {
            return await _service.GetListAsync(input);
        }

        [HttpGet("{guid}")]
        public async Task<SensorDataDto> GetAsync(Guid id)
        {
            return await _service.GetAsync(id);
        }

        [HttpPost]
        public async Task<SensorDataDto> CreateAsync(CreateSensorDataDto input)
        {
            return await _service.CreateAsync(input);
        }

        [HttpPut("{guid}")]
        public async Task<SensorDataDto> UpdateAsync(Guid id, UpdateSensorDataDto input)
        {
            return await _service.UpdateAsync(id, input);
        }

        [HttpDelete("{guid}")]
        public async Task DeleteAsync(Guid id)
        {
            await _service.DeleteAsync(id);
        }
    }
}