using System;
using System.Threading.Tasks;
using SmartAbp.CodeGenerator.Services.V9;
using Volo.Abp.Application.Services;

namespace SmartAbp.CodeGenerator.Services
{
    public interface IMetadataAppService : IApplicationService
    {
        Task<ModuleMetadataDto> GetAsync(string moduleName);
        Task<ModuleMetadataDto> CreateAsync(ModuleMetadataDto input);
        Task<ModuleMetadataDto> UpdateAsync(ModuleMetadataDto input);
        Task DeleteAsync(string moduleName);
    }
}
