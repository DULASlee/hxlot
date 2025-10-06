using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp.AspNetCore.Mvc;
using SmartAbp.Application.CodeGenerator;
using SmartAbp.CodeGenerator.Dtos;

namespace SmartAbp.HttpApi.Controllers
{
    /// <summary>
    /// 代码生成统计API
    /// </summary>
    [Route("api/code-gen/stats")]
    [ApiController]
    public class CodeGenStatsController : AbpControllerBase
    {
        private readonly CodeGenStatsAppService _statsAppService;
        
        public CodeGenStatsController(CodeGenStatsAppService statsAppService)
        {
            _statsAppService = statsAppService;
        }
        
        /// <summary>
        /// 获取当前用户统计数据
        /// </summary>
        [HttpGet("my")]
        public async Task<CodeGenStatsDto> GetMyStats()
        {
            return await _statsAppService.GetMyStatsAsync();
        }
    }
}

