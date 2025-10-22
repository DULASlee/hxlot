// 设备 Controller
using Microsoft.AspNetCore.Mvc;
using Volo.Abp.AspNetCore.Mvc;

namespace .HttpApi.Controllers
{
    [ApiController]
    [Route("api/mes/equipment")]
    public class EquipmentController : AbpController
    {
        private readonly IEquipmentAppService _service;

        public EquipmentController(IEquipmentAppService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<PagedResultDto<EquipmentDto>> GetListAsync([FromQuery] PagedAndSortedResultRequestDto input)
        {
            return await _service.GetListAsync(input);
        }

        [HttpGet("{guid}")]
        public async Task<EquipmentDto> GetAsync(Guid id)
        {
            return await _service.GetAsync(id);
        }

        [HttpPost]
        public async Task<EquipmentDto> CreateAsync(CreateEquipmentDto input)
        {
            return await _service.CreateAsync(input);
        }

        [HttpPut("{guid}")]
        public async Task<EquipmentDto> UpdateAsync(Guid id, UpdateEquipmentDto input)
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