using System.Threading.Tasks;
using SmartAbp.Application.Contracts.LowCode.Dtos;
using Volo.Abp.Application.Services;

namespace SmartAbp.CodeGenerator.LowCode
{
    public interface IIndustryTemplateAppService : IApplicationService
    {
        Task<IndustryTemplateGenerationResultDto> GenerateAsync(IndustryTemplateConfigDto input);
    }
}

