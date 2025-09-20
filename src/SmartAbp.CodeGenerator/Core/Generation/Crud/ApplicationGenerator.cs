using System.Collections.Generic;
using System.IO;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using SmartAbp.CodeGenerator.Services.V9;
using Volo.Abp.DependencyInjection;
using static Microsoft.CodeAnalysis.CSharp.SyntaxFactory;
using static SmartAbp.CodeGenerator.Core.RoslynSyntaxFactory;

namespace SmartAbp.CodeGenerator.Core.Generation.Crud
{
    public class ApplicationGenerator : ITransientDependency
    {
        public Dictionary<string, string> Generate(ModuleMetadataDto metadata, string solutionRoot)
        {
            var generatedFiles = new Dictionary<string, string>();
            var systemName = metadata.SystemName;
            var moduleName = metadata.Name;
            var appProjectRoot = Path.Combine(solutionRoot, $"src/SmartAbp.{systemName}.{moduleName}.Application");

            foreach (var entity in metadata.Entities)
            {
                generatedFiles.Add(
                    Path.Combine(appProjectRoot, "Services", $"{entity.Name}AppService.cs"),
                    GenerateAppService(entity, systemName, moduleName, metadata.FeatureManagement.DefaultPolicy)
                );
            }

            generatedFiles.Add(
                Path.Combine(appProjectRoot, $"{moduleName}ApplicationAutoMapperProfile.cs"),
                GenerateAutoMapperProfile(metadata)
            );

            generatedFiles.Add(
                Path.Combine(appProjectRoot, $"{moduleName}ApplicationModule.cs"),
                GenerateApplicationModule(metadata)
            );

            return generatedFiles;
        }

        private string GenerateAppService(EnhancedEntityModelDto entity, string systemName, string moduleName, string readPolicyName = null, string writePolicyName = null)
        {
            var usings = new[]
            {
                CreateUsing("System"),
                CreateUsing($"SmartAbp.{systemName}.{moduleName}.Permissions"),
                CreateUsing($"SmartAbp.{systemName}.{moduleName}.Dtos"),
                CreateUsing($"SmartAbp.{systemName}.{moduleName}.Entities"),
                CreateUsing("Microsoft.AspNetCore.Authorization"),
                CreateUsing("Volo.Abp.Application.Services"),
                CreateUsing("Volo.Abp.Domain.Repositories"),
            };

            var className = $"{entity.Name}AppService";
            var baseClass = $"CrudAppService< {entity.Name}, {entity.Name}Dto, Guid, Get{entity.Name}ListDto, Create{entity.Name}Dto, Update{entity.Name}Dto >";
            var serviceInterface = $"I{entity.Name}AppService";

            var appServiceClass = CreateClass(className, baseClass, new[] { SyntaxKind.PublicKeyword, SyntaxKind.PartialKeyword }, new[] { serviceInterface });

            // Policies
            // Prefer generated permission constants; if user passed raw string (DefaultPolicy), wrap as string literal
            string ToAuthorizeArgument(string? policyCandidate, string fallbackExpression)
            {
                if (string.IsNullOrWhiteSpace(policyCandidate)) return fallbackExpression;
                // If contains dot or unsafe chars, treat as string literal
                var needsStringLiteral = true;
                foreach (var ch in policyCandidate)
                {
                    if (!(char.IsLetterOrDigit(ch) || ch == '_' || ch == ':')) { needsStringLiteral = true; break; }
                    needsStringLiteral = false;
                }
                return needsStringLiteral ? $"\"{policyCandidate}\"" : fallbackExpression;
            }

            var readPolicyExpr = $"{moduleName}Permissions.{entity.Name}.Default";
            var createPolicyExpr = $"{moduleName}Permissions.{entity.Name}.Create";
            var updatePolicyExpr = $"{moduleName}Permissions.{entity.Name}.Update";
            var deletePolicyExpr = $"{moduleName}Permissions.{entity.Name}.Delete";

            var readPolicy = ToAuthorizeArgument(readPolicyName, readPolicyExpr);
            var createPolicy = ToAuthorizeArgument(writePolicyName, createPolicyExpr);
            var updatePolicy = ToAuthorizeArgument(writePolicyName, updatePolicyExpr);
            var deletePolicy = ToAuthorizeArgument(writePolicyName, deletePolicyExpr);

            appServiceClass = appServiceClass
                .AddAttributeLists(CreateAttribute("Authorize", readPolicy));

            var constructor = CreateConstructor(className, new[] { SyntaxKind.PublicKeyword },
                new[] { CreateParameter("repository", $"IRepository<{entity.Name}, Guid>") },
                body: Block(
                    ParseStatement($"GetPolicyName = {readPolicy};"),
                    ParseStatement($"GetListPolicyName = {readPolicy};"),
                    ParseStatement($"CreatePolicyName = {createPolicy};"),
                    ParseStatement($"UpdatePolicyName = {updatePolicy};"),
                    ParseStatement($"DeletePolicyName = {deletePolicy};")
                ),
                baseInitializer: CreateBaseConstructorInitializer("repository")
            );

            appServiceClass = appServiceClass.AddMembers(constructor);

            var ns = CreateNamespace($"SmartAbp.{systemName}.{moduleName}.Services");
            ns = ns.AddMembers(appServiceClass);

            var cu = CreateCompilationUnit(usings);
            cu = cu.AddMembers(ns);

            // Hybrid output: generated + manual partial
            var code = FormatCode(cu);
            // caller will use CodeWriterService.WriteHybridCodeAsync to persist; here返回代码文本
            return code;
        }

        private string GenerateAutoMapperProfile(ModuleMetadataDto metadata)
        {
            var systemName = metadata.SystemName;
            var moduleName = metadata.Name;
            
            var usings = new[]
            {
                CreateUsing($"SmartAbp.{systemName}.{moduleName}.Dtos"),
                CreateUsing($"SmartAbp.{systemName}.{moduleName}.Entities"),
                CreateUsing("AutoMapper"),
            };

            var profileClass = CreateClass($"{moduleName}ApplicationAutoMapperProfile", "Profile");

            var constructorBody = metadata.Entities.SelectMany(entity => new[]
            {
                ParseStatement($"CreateMap<{entity.Name}, {entity.Name}Dto>();"),
                ParseStatement($"CreateMap<Create{entity.Name}Dto, {entity.Name}>();"),
                ParseStatement($"CreateMap<Update{entity.Name}Dto, {entity.Name}>();"),
            }).ToArray();

            var constructor = CreateConstructor($"{moduleName}ApplicationAutoMapperProfile", new[] { SyntaxKind.PublicKeyword }, null, Block(constructorBody));
            profileClass = profileClass.AddMembers(constructor);

            var ns = CreateNamespace($"SmartAbp.{systemName}.{moduleName}");
            ns = ns.AddMembers(profileClass);

            var cu = CreateCompilationUnit(usings);
            cu = cu.AddMembers(ns);
            
            return FormatCode(cu);
        }
        
        private string GenerateApplicationModule(ModuleMetadataDto metadata)
        {
            var systemName = metadata.SystemName;
            var moduleName = metadata.Name;

            var usings = new[]
            {
                CreateUsing($"SmartAbp.{systemName}.{moduleName}.Domain"),
                CreateUsing($"SmartAbp.{systemName}.{moduleName}.Application.Contracts"),
                CreateUsing("Volo.Abp.AutoMapper"),
                CreateUsing("Volo.Abp.Modularity"),
            };

            var moduleClass = CreateClass($"{moduleName}ApplicationModule", "AbpModule")
                .AddAttributeLists(
                    AttributeList(SingletonSeparatedList(
                        Attribute(IdentifierName("DependsOn"))
                            .WithArgumentList(AttributeArgumentList(SeparatedList<AttributeArgumentSyntax>(new[]
                            {
                                AttributeArgument(TypeOfExpression(IdentifierName($"{moduleName}DomainModule"))),
                                AttributeArgument(TypeOfExpression(IdentifierName($"{moduleName}ApplicationContractsModule"))),
                                AttributeArgument(TypeOfExpression(IdentifierName("AbpAutoMapperModule")))
                            })))
                    ))
                );

            var configureServicesMethod = MethodDeclaration(ParseTypeName("void"), "ConfigureServices")
                .AddModifiers(Token(SyntaxKind.PublicKeyword), Token(SyntaxKind.OverrideKeyword))
                .AddParameterListParameters(
                    Parameter(Identifier("context")).WithType(ParseTypeName("ServiceConfigurationContext"))
                )
                .WithBody(Block(
                    ParseStatement("Configure<AbpAutoMapperOptions>(options => { options.AddMaps<" + $"{moduleName}ApplicationModule>(validate: true); }});")
                ));
                
            moduleClass = moduleClass.AddMembers(configureServicesMethod);

            var ns = CreateNamespace($"SmartAbp.{systemName}.{moduleName}");
            ns = ns.AddMembers(moduleClass);

            var cu = CreateCompilationUnit(usings);
            cu = cu.AddMembers(ns);

            return FormatCode(cu);
        }
    }
}
