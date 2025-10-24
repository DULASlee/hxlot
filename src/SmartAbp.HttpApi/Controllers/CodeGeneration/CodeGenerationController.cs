using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using SmartAbp.CodeGeneration.Dtos;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.AspNetCore.Mvc;

namespace SmartAbp.Controllers.CodeGeneration
{
    /// <summary>
    /// 代码生成控制器
    /// </summary>
    [Area("app")]
    [Route("api/code-generation")]
    [RemoteService(Name = "Default")]
    public class CodeGenerationController : AbpControllerBase
    {
        private readonly ICodeGenerationAppService _codeGenerationAppService;

        public CodeGenerationController(ICodeGenerationAppService codeGenerationAppService)
        {
            _codeGenerationAppService = codeGenerationAppService;
        }

        /// <summary>
        /// 获取任务列表
        /// </summary>
        [HttpGet]
        [Route("tasks")]
        public async Task<PagedResultDto<CodeGenerationTaskDto>> GetListAsync([FromQuery] PagedAndSortedResultRequestDto input)
        {
            return await _codeGenerationAppService.GetListAsync(input);
        }

        /// <summary>
        /// 获取单个任务
        /// </summary>
        [HttpGet]
        [Route("tasks/{id}")]
        public async Task<CodeGenerationTaskDto> GetAsync(Guid id)
        {
            return await _codeGenerationAppService.GetAsync(id);
        }

        /// <summary>
        /// 生成MES大屏
        /// </summary>
        [HttpPost]
        [Route("generate/mes-dashboard")]
        public async Task<CodeGenerationResultDto> GenerateMESDashboardAsync([FromBody] MESGeneratorConfigDto config)
        {
            return await _codeGenerationAppService.GenerateMESDashboardAsync(config);
        }

        /// <summary>
        /// 生成UniApp移动应用
        /// </summary>
        [HttpPost]
        [Route("generate/uniapp")]
        public async Task<CodeGenerationResultDto> GenerateUniAppAsync([FromBody] UniAppGeneratorConfigDto config)
        {
            return await _codeGenerationAppService.GenerateUniAppAsync(config);
        }

        /// <summary>
        /// 删除任务
        /// </summary>
        [HttpDelete]
        [Route("tasks/{id}")]
        public async Task DeleteAsync(Guid id)
        {
            await _codeGenerationAppService.DeleteAsync(id);
        }
    }
}

