using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using SmartAbp.Application.Contracts.LowCode.Dtos;
using SmartAbp.Application.LowCode;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.AspNetCore.Mvc;

namespace SmartAbp.Controllers.LowCode
{
    /// <summary>
    /// 🔥 低代码模块Controller（Phase 2A）
    /// Route: /api/lowcode/modules
    /// 用途: 提供模块HTTP API端点，通过Swagger生成前端类型
    /// </summary>
    [RemoteService(Name = "LowCode")]
    [Area("lowcode")]
    [Route("api/lowcode/modules")]
    public class ModuleController : AbpController
    {
        private readonly ModuleAppService _moduleAppService;

        public ModuleController(ModuleAppService moduleAppService)
        {
            _moduleAppService = moduleAppService;
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 查询端点
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 获取模块列表（分页）
        /// </summary>
        [HttpGet]
        public async Task<PagedResultDto<ModuleDto>> GetListAsync([FromQuery] GetModulesInput input)
        {
            return await _moduleAppService.GetListAsync(input);
        }

        /// <summary>
        /// 根据ID获取模块（包含完整实体列表）
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ModuleDto> GetAsync(Guid id)
        {
            return await _moduleAppService.GetAsync(id);
        }

        /// <summary>
        /// 根据系统名称获取模块
        /// </summary>
        [HttpGet("by-system-name/{systemName}")]
        public async Task<ModuleDto> GetBySystemNameAsync(string systemName)
        {
            return await _moduleAppService.GetBySystemNameAsync(systemName);
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 增删改端点
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 创建模块
        /// </summary>
        [HttpPost]
        public async Task<ModuleDto> CreateAsync([FromBody] CreateOrUpdateModuleDto input)
        {
            return await _moduleAppService.CreateAsync(input);
        }

        /// <summary>
        /// 更新模块
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ModuleDto> UpdateAsync(Guid id, [FromBody] CreateOrUpdateModuleDto input)
        {
            return await _moduleAppService.UpdateAsync(id, input);
        }

        /// <summary>
        /// 删除模块
        /// </summary>
        [HttpDelete("{id}")]
        public async Task DeleteAsync(Guid id)
        {
            await _moduleAppService.DeleteAsync(id);
        }
    }
}

