using System.Collections.Generic;
using System.Threading.Tasks;
using SmartAbp.CodeGenerator.Services.V9;

namespace SmartAbp.CodeGenerator.Core
{
    public interface IArchitectureGenerator
    {
        Task<Dictionary<string, string>> GenerateAsync(ModuleMetadataDto metadata, string solutionRoot);
    }
}
