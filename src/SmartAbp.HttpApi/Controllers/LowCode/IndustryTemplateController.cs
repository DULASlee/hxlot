using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using SmartAbp.CodeGenerator.LowCode;
using SmartAbp.Application.Contracts.LowCode.Dtos;
using Volo.Abp.AspNetCore.Mvc;

namespace SmartAbp.HttpApi.Controllers.LowCode
{
    [ApiController]
    [Route("api/lowcode/industry-templates")]
    public class IndustryTemplateController : AbpControllerBase
    {
        private readonly IIndustryTemplateAppService _industryTemplateAppService;

        public IndustryTemplateController(IIndustryTemplateAppService industryTemplateAppService)
        {
            _industryTemplateAppService = industryTemplateAppService;
        }

        [HttpPost("generate")]
        public async Task<IndustryTemplateGenerationResultDto> GenerateAsync(IndustryTemplateConfigDto input)
        {
            return await _industryTemplateAppService.GenerateAsync(input);
        }
    }
}
