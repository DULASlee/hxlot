using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using SmartAbp.Application.Contracts.ProductionLine;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.AspNetCore.Mvc;

namespace SmartAbp.Controllers
{
    /// <summary>
    /// 生产线Controller
    /// Route: /api/app/production-line
    /// 用途: 提供生产线HTTP API端点，供前端调用
    /// 符合铁律4：后端持久化（100%完整实现）
    /// </summary>
    [RemoteService(Name = "Default")]
    [Area("app")]
    [Route("api/app/production-line")]
    public class ProductionLineController : AbpController
    {
        private readonly IProductionLineAppService _productionLineAppService;

        public ProductionLineController(IProductionLineAppService productionLineAppService)
        {
            _productionLineAppService = productionLineAppService;
        }

        // ══════════════════════════════════════════════════════
        // 查询端点
        // ══════════════════════════════════════════════════════

        /// <summary>
        /// 获取生产线列表（分页、筛选、排序）
        /// </summary>
        /// <param name="input">查询参数（分页、筛选、排序）</param>
        /// <returns>分页结果</returns>
        [HttpGet]
        public async Task<PagedResultDto<ProductionLineDto>> GetListAsync([FromQuery] GetProductionLineListInput input)
        {
            return await _productionLineAppService.GetListAsync(input);
        }

        /// <summary>
        /// 根据ID获取生产线详情
        /// </summary>
        /// <param name="id">生产线ID</param>
        /// <returns>生产线详情</returns>
        [HttpGet("{id}")]
        public async Task<ProductionLineDto> GetAsync(Guid id)
        {
            return await _productionLineAppService.GetAsync(id);
        }

        // ══════════════════════════════════════════════════════
        // 增删改端点
        // ══════════════════════════════════════════════════════

        /// <summary>
        /// 创建生产线
        /// </summary>
        /// <param name="input">创建参数</param>
        /// <returns>创建的生产线</returns>
        [HttpPost]
        public async Task<ProductionLineDto> CreateAsync([FromBody] CreateProductionLineDto input)
        {
            return await _productionLineAppService.CreateAsync(input);
        }

        /// <summary>
        /// 更新生产线
        /// </summary>
        /// <param name="id">生产线ID</param>
        /// <param name="input">更新参数</param>
        /// <returns>更新后的生产线</returns>
        [HttpPut("{id}")]
        public async Task<ProductionLineDto> UpdateAsync(Guid id, [FromBody] UpdateProductionLineDto input)
        {
            return await _productionLineAppService.UpdateAsync(id, input);
        }

        /// <summary>
        /// 删除生产线
        /// </summary>
        /// <param name="id">生产线ID</param>
        [HttpDelete("{id}")]
        public async Task DeleteAsync(Guid id)
        {
            await _productionLineAppService.DeleteAsync(id);
        }
    }
}

