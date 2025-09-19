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

        public Task<Dictionary<string, string>> GenerateAsync(ModuleMetadataDto metadata, string solutionRoot)
        {
            var generatedFiles = new Dictionary<string, string>();

            _domainGenerator.Generate(metadata, solutionRoot)
                .ToList().ForEach(x => generatedFiles.Add(x.Key, x.Value));
            
            _efCoreGenerator.Generate(metadata, solutionRoot)
                .ToList().ForEach(x => generatedFiles.Add(x.Key, x.Value));

            _applicationContractsGenerator.Generate(metadata, solutionRoot)
                .ToList().ForEach(x => generatedFiles.Add(x.Key, x.Value));

            _applicationGenerator.Generate(metadata, solutionRoot)
                .ToList().ForEach(x => generatedFiles.Add(x.Key, x.Value));

            _projectFileGenerator.Generate(metadata, solutionRoot)
                .ToList().ForEach(x => generatedFiles.Add(x.Key, x.Value));

            return Task.FromResult(generatedFiles);
        }
    }
}
