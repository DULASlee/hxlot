using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp.AspNetCore.Mvc;
using SmartAbp.Application.CodeGenerator;
using SmartAbp.CodeGenerator.Dtos;

namespace SmartAbp.HttpApi.Controllers
{
    /// <summary>
    /// 生成历史API
    /// </summary>
    [Route("api/code-gen/generation-history")]
    [ApiController]
    public class GenerationHistoryController : AbpControllerBase
    {
        private readonly GenerationHistoryAppService _historyAppService;
        
        public GenerationHistoryController(GenerationHistoryAppService historyAppService)
        {
            _historyAppService = historyAppService;
        }
        
        /// <summary>
        /// 获取最近的项目列表
        /// </summary>
        [HttpGet("recent")]
        public async Task<List<GenerationHistoryDto>> GetRecent([FromQuery] int limit = 5)
        {
            return await _historyAppService.GetRecentProjectsAsync(limit);
        }
        
        /// <summary>
        /// 获取所有项目列表（分页）
        /// </summary>
        [HttpGet("all")]
        public async Task<List<GenerationHistoryDto>> GetAll(
            [FromQuery] int skipCount = 0, 
            [FromQuery] int maxResultCount = 20)
        {
            return await _historyAppService.GetAllProjectsAsync(skipCount, maxResultCount);
        }
        
        /// <summary>
        /// 创建生成历史记录
        /// </summary>
        [HttpPost]
        public async Task<GenerationHistoryDto> Create([FromBody] CreateGenerationHistoryDto input)
        {
            return await _historyAppService.CreateAsync(input);
        }
        
        /// <summary>
        /// 删除项目历史
        /// </summary>
        [HttpDelete("{id}")]
        public async Task Delete(Guid id)
        {
            await _historyAppService.DeleteAsync(id);
        }
    }
}

