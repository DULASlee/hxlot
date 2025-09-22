using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SmartAbp.CodeGenerator.Core.Generation.Crud;
using SmartAbp.CodeGenerator.Services.V9;
using Volo.Abp.DependencyInjection;

namespace SmartAbp.CodeGenerator.Core
{
    public class CrudArchitectureGenerator : IArchitectureGenerator, ITransientDependency
    {
        private readonly DomainGenerator _domainGenerator;
        private readonly EntityFrameworkCoreGenerator _efCoreGenerator;
        private readonly ApplicationContractsGenerator _applicationContractsGenerator;
        private readonly ApplicationGenerator _applicationGenerator;
        private readonly ProjectFileGenerator _projectFileGenerator;

        public CrudArchitectureGenerator(
            DomainGenerator domainGenerator,
            EntityFrameworkCoreGenerator efCoreGenerator,
            ApplicationContractsGenerator applicationContractsGenerator,
            ApplicationGenerator applicationGenerator,
            ProjectFileGenerator projectFileGenerator)
        {
            _domainGenerator = domainGenerator;
            _efCoreGenerator = efCoreGenerator;
            _applicationContractsGenerator = applicationContractsGenerator;
            _applicationGenerator = applicationGenerator;
            _projectFileGenerator = projectFileGenerator;
        }

        public async Task<Dictionary<string, string>> GenerateAsync(ModuleMetadataDto metadata, string solutionRoot)
        {
            var generatedFiles = new Dictionary<string, string>();

            // 使用更高效的方式合并字典，避免多次ToList和ForEach
            await AddGeneratedFilesAsync(_domainGenerator.Generate(metadata, solutionRoot), generatedFiles);
            await AddGeneratedFilesAsync(_efCoreGenerator.Generate(metadata, solutionRoot), generatedFiles);
            await AddGeneratedFilesAsync(_applicationContractsGenerator.Generate(metadata, solutionRoot), generatedFiles);
            await AddGeneratedFilesAsync(_applicationGenerator.Generate(metadata, solutionRoot), generatedFiles);
            await AddGeneratedFilesAsync(_projectFileGenerator.Generate(metadata, solutionRoot), generatedFiles);

            return generatedFiles;
        }

        private async Task AddGeneratedFilesAsync(Task<Dictionary<string, string>> generationTask, Dictionary<string, string> targetDictionary)
        {
            var files = await generationTask.ConfigureAwait(false);
            foreach (var file in files)
            {
                targetDictionary[file.Key] = file.Value;
            }
        }
    }
}
