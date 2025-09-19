using System.Collections.Generic;
using System.IO;
using System.Linq;
using SmartAbp.CodeGenerator.Services.V9;
using Volo.Abp.DependencyInjection;
using static SmartAbp.CodeGenerator.Core.RoslynSyntaxFactory;

namespace SmartAbp.CodeGenerator.Core.Generation.Crud
{
    public class DomainGenerator : ITransientDependency
    {
        public Dictionary<string, string> Generate(ModuleMetadataDto metadata, string solutionRoot)
        {
            var generatedFiles = new Dictionary<string, string>();
            var systemName = metadata.SystemName;
            var moduleName = metadata.Name;
            
            var domainProjectRoot = Path.Combine(solutionRoot, $"src/SmartAbp.{systemName}.{moduleName}.Domain");

            foreach (var entity in metadata.Entities)
            {
                generatedFiles.Add(
                    Path.Combine(domainProjectRoot, "Entities", $"{entity.Name}.cs"),
                    GenerateEntity(entity, systemName, moduleName)
                );
            }

            return generatedFiles;
        }

        private string GenerateEntity(EnhancedEntityModelDto entity, string systemName, string moduleName)
        {
            var usings = new[]
            {
                CreateUsing("System"),
                CreateUsing("Volo.Abp.Domain.Entities.Auditing"),
            };

            var entityClass = CreateClass(entity.Name, "AuditedAggregateRoot<Guid>");

            var properties = entity.Properties
                .Select(p => CreateProperty(p.Name, GetCSharpType(p.Type)))
                .ToArray();
            entityClass = entityClass.AddMembers(properties);

            var ns = CreateNamespace($"SmartAbp.{systemName}.{moduleName}.Entities");
            ns = ns.AddMembers(entityClass);

            var cu = CreateCompilationUnit(usings);
            cu = cu.AddMembers(ns);

            return FormatCode(cu);
        }

        private string GetCSharpType(string type)
        {
            return type.ToLower() switch
            {
                "string" => "string",
                "text" => "string",
                "int" => "int",
                "long" => "long",
                "decimal" => "decimal",
                "double" => "double",
                "float" => "float",
                "bool" => "bool",
                "boolean" => "bool",
                "datetime" => "DateTime",
                "date" => "DateTime",
                "guid" => "Guid",
                _ => "string" 
            };
        }
    }
}
