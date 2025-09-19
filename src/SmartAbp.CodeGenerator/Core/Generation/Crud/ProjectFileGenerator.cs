using System.Collections.Generic;
using System.IO;
using Microsoft.Build.Construction;
using SmartAbp.CodeGenerator.Services.V9;
using Volo.Abp.DependencyInjection;

namespace SmartAbp.CodeGenerator.Core.Generation.Crud
{
    public class ProjectFileGenerator : ITransientDependency
    {
        public Dictionary<string, string> Generate(ModuleMetadataDto metadata, string solutionRoot)
        {
            var generatedFiles = new Dictionary<string, string>();
            var systemName = metadata.SystemName;
            var moduleName = metadata.Name;

            // Define project paths
            var domainProjectRoot = Path.Combine(solutionRoot, $"src/SmartAbp.{systemName}.{moduleName}.Domain");
            var efProjectRoot = Path.Combine(solutionRoot, $"src/SmartAbp.{systemName}.{moduleName}.EntityFrameworkCore");
            var contractsProjectRoot = Path.Combine(solutionRoot, $"src/SmartAbp.{systemName}.{moduleName}.Application.Contracts");
            var appProjectRoot = Path.Combine(solutionRoot, $"src/SmartAbp.{systemName}.{moduleName}.Application");

            // Add csproj files to the generation list
            generatedFiles.Add(Path.Combine(domainProjectRoot, $"SmartAbp.{systemName}.{moduleName}.Domain.csproj"), GenerateDomainCsProj(systemName, moduleName));
            generatedFiles.Add(Path.Combine(contractsProjectRoot, $"SmartAbp.{systemName}.{moduleName}.Application.Contracts.csproj"), GenerateContractsCsProj(systemName, moduleName));
            generatedFiles.Add(Path.Combine(appProjectRoot, $"SmartAbp.{systemName}.{moduleName}.Application.csproj"), GenerateApplicationCsProj(systemName, moduleName));
            generatedFiles.Add(Path.Combine(efProjectRoot, $"SmartAbp.{systemName}.{moduleName}.EntityFrameworkCore.csproj"), GenerateEfCoreCsProj(systemName, moduleName));

            return generatedFiles;
        }

        private string GenerateDomainCsProj(string systemName, string moduleName)
        {
            var projectName = $"SmartAbp.{systemName}.{moduleName}";
            var project = ProjectRootElement.Create();
            project.Sdk = "Microsoft.NET.Sdk";

            project.AddImport(@"..\..\..\..\common.props");

            var propertyGroup = project.AddPropertyGroup();
            propertyGroup.AddProperty("TargetFramework", "net9.0");
            propertyGroup.AddProperty("RootNamespace", projectName);

            var itemGroup1 = project.AddItemGroup();
            itemGroup1.AddItem("ProjectReference", $@"..\SmartAbp.{systemName}.Domain.Shared\SmartAbp.{systemName}.Domain.Shared.csproj");

            var itemGroup2 = project.AddItemGroup();
            itemGroup2.AddItem("PackageReference", "Volo.Abp.Ddd.Domain").AddMetadata("Version", "9.0.0");
            
            return SaveProjectToString(project);
        }

        private string GenerateContractsCsProj(string systemName, string moduleName)
        {
            var projectName = $"SmartAbp.{systemName}.{moduleName}";
            var project = ProjectRootElement.Create();
            project.Sdk = "Microsoft.NET.Sdk";

            project.AddImport(@"..\..\..\..\common.props");

            var propertyGroup = project.AddPropertyGroup();
            propertyGroup.AddProperty("TargetFramework", "net9.0");
            propertyGroup.AddProperty("RootNamespace", projectName);
            
            var itemGroup1 = project.AddItemGroup();
            itemGroup1.AddItem("ProjectReference", $@"..\SmartAbp.{systemName}.Domain.Shared\SmartAbp.{systemName}.Domain.Shared.csproj");

            var itemGroup2 = project.AddItemGroup();
            itemGroup2.AddItem("PackageReference", "Volo.Abp.Ddd.Application.Contracts").AddMetadata("Version", "9.0.0");
            itemGroup2.AddItem("PackageReference", "Volo.Abp.Authorization").AddMetadata("Version", "9.0.0");
            
            return SaveProjectToString(project);
        }

        private string GenerateApplicationCsProj(string systemName, string moduleName)
        {
            var projectName = $"SmartAbp.{systemName}.{moduleName}";
            var project = ProjectRootElement.Create();
            project.Sdk = "Microsoft.NET.Sdk";

            project.AddImport(@"..\..\..\..\common.props");

            var propertyGroup = project.AddPropertyGroup();
            propertyGroup.AddProperty("TargetFramework", "net9.0");
            propertyGroup.AddProperty("RootNamespace", projectName);

            var itemGroup1 = project.AddItemGroup();
            itemGroup1.AddItem("ProjectReference", $@"..\{projectName}.Domain\{projectName}.Domain.csproj");
            itemGroup1.AddItem("ProjectReference", $@"..\{projectName}.Application.Contracts\{projectName}.Application.Contracts.csproj");

            var itemGroup2 = project.AddItemGroup();
            itemGroup2.AddItem("PackageReference", "Volo.Abp.Ddd.Application").AddMetadata("Version", "9.0.0");
            itemGroup2.AddItem("PackageReference", "Volo.Abp.AutoMapper").AddMetadata("Version", "9.0.0");
            
            return SaveProjectToString(project);
        }

        private string GenerateEfCoreCsProj(string systemName, string moduleName)
        {
            var projectName = $"SmartAbp.{systemName}.{moduleName}";
            var project = ProjectRootElement.Create();
            project.Sdk = "Microsoft.NET.Sdk";

            project.AddImport(@"..\..\..\..\common.props");

            var propertyGroup = project.AddPropertyGroup();
            propertyGroup.AddProperty("TargetFramework", "net9.0");
            propertyGroup.AddProperty("RootNamespace", projectName);

            var itemGroup1 = project.AddItemGroup();
            itemGroup1.AddItem("ProjectReference", $@"..\{projectName}.Domain\{projectName}.Domain.csproj");

            var itemGroup2 = project.AddItemGroup();
            itemGroup2.AddItem("PackageReference", "Volo.Abp.EntityFrameworkCore").AddMetadata("Version", "9.0.0");
            
            return SaveProjectToString(project);
        }

        private string SaveProjectToString(ProjectRootElement project)
        {
            using (var sw = new StringWriter())
            {
                project.Save(sw);
                return sw.ToString();
            }
        }
    }
}
