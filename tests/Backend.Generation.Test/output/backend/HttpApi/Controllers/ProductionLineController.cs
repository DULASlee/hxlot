// 生产线 Controller
using Microsoft.AspNetCore.Mvc;
using Volo.Abp.AspNetCore.Mvc;

namespace .HttpApi.Controllers
{
    [ApiController]
    [Route("api/mes/production-line")]
    public class ProductionLineController : AbpController
    {
        private readonly IProductionLineAppService _service;

        public ProductionLineController(IProductionLineAppService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<PagedResultDto<ProductionLineDto>> GetListAsync([FromQuery] PagedAndSortedResultRequestDto input)
        {
            return await _service.GetListAsync(input);
        }

        [HttpGet("{guid}")]
        public async Task<ProductionLineDto> GetAsync(Guid id)
        {
            return await _service.GetAsync(id);
        }

        [HttpPost]
        public async Task<ProductionLineDto> CreateAsync(CreateProductionLineDto input)
        {
            return await _service.CreateAsync(input);
        }

        [HttpPut("{guid}")]
        public async Task<ProductionLineDto> UpdateAsync(Guid id, UpdateProductionLineDto input)
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