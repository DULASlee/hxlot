using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using SmartAbp.Application.Contracts.Equipment;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.AspNetCore.Mvc;

namespace SmartAbp.Controllers
{
    [RemoteService(Name = "Default")]
    [Area("app")]
    [Route("api/app/equipment")]
    public class EquipmentController : AbpController
    {
        private readonly IEquipmentAppService _equipmentAppService;

        public EquipmentController(IEquipmentAppService equipmentAppService)
        {
            _equipmentAppService = equipmentAppService;
        }

        [HttpGet]
        public async Task<PagedResultDto<EquipmentDto>> GetListAsync([FromQuery] GetEquipmentListInput input)
        {
            return await _equipmentAppService.GetListAsync(input);
        }

        [HttpGet("{id}")]
        public async Task<EquipmentDto> GetAsync(Guid id)
        {
            return await _equipmentAppService.GetAsync(id);
        }

        [HttpPost]
        public async Task<EquipmentDto> CreateAsync([FromBody] CreateEquipmentDto input)
        {
            return await _equipmentAppService.CreateAsync(input);
        }

        [HttpPut("{id}")]
        public async Task<EquipmentDto> UpdateAsync(Guid id, [FromBody] UpdateEquipmentDto input)
        {
            return await _equipmentAppService.UpdateAsync(id, input);
        }

        [HttpDelete("{id}")]
        public async Task DeleteAsync(Guid id)
        {
            await _equipmentAppService.DeleteAsync(id);
        }
    }
}

