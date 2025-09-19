using System.Collections.Generic;
using System.IO;
using System.Linq;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using static Microsoft.CodeAnalysis.CSharp.SyntaxFactory;
using SmartAbp.CodeGenerator.Services.V9;
using Volo.Abp.DependencyInjection;
using static SmartAbp.CodeGenerator.Core.RoslynSyntaxFactory;

namespace SmartAbp.CodeGenerator.Core.Generation.Crud
{
    public class ApplicationContractsGenerator : ITransientDependency
    {
        public Dictionary<string, string> Generate(ModuleMetadataDto metadata, string solutionRoot)
        {
            var generatedFiles = new Dictionary<string, string>();
            var systemName = metadata.SystemName;
            var moduleName = metadata.Name;
            var contractsProjectRoot = Path.Combine(solutionRoot, $"src/SmartAbp.{systemName}.{moduleName}.Application.Contracts");

            foreach (var entity in metadata.Entities)
            {
                var dtosPath = Path.Combine(contractsProjectRoot, "Dtos");
                var servicesPath = Path.Combine(contractsProjectRoot, "Services");

                generatedFiles.Add(Path.Combine(dtosPath, $"{entity.Name}Dto.cs"), GenerateEntityDto(entity, systemName, moduleName));
                generatedFiles.Add(Path.Combine(dtosPath, $"Create{entity.Name}Dto.cs"), GenerateCreateUpdateDto(entity, systemName, moduleName, isUpdate: false));
                generatedFiles.Add(Path.Combine(dtosPath, $"Update{entity.Name}Dto.cs"), GenerateCreateUpdateDto(entity, systemName, moduleName, isUpdate: true));
                generatedFiles.Add(Path.Combine(dtosPath, $"Get{entity.Name}ListDto.cs"), GenerateGetListDto(entity, systemName, moduleName));
                generatedFiles.Add(Path.Combine(servicesPath, $"I{entity.Name}AppService.cs"), GenerateServiceInterface(entity, systemName, moduleName));
            }

            var permissionsPath = Path.Combine(contractsProjectRoot, "Permissions");
            generatedFiles.Add(Path.Combine(permissionsPath, $"{moduleName}Permissions.cs"), GeneratePermissions(metadata));
            generatedFiles.Add(Path.Combine(permissionsPath, $"{moduleName}PermissionDefinitionProvider.cs"), GeneratePermissionDefinitionProvider(metadata));

            return generatedFiles;
        }

        private string GenerateEntityDto(EnhancedEntityModelDto entity, string systemName, string moduleName)
        {
            var usings = new[] { CreateUsing("System"), CreateUsing("Volo.Abp.Application.Dtos") };
            var dtoClass = CreateClass($"{entity.Name}Dto", "AuditedEntityDto<Guid>");
            var properties = entity.Properties.Select(p => CreateProperty(p.Name, GetCSharpType(p.Type))).ToArray();
            dtoClass = dtoClass.AddMembers(properties);
            var ns = CreateNamespace($"SmartAbp.{systemName}.{moduleName}.Dtos").AddMembers(dtoClass);
            var cu = CreateCompilationUnit(usings).AddMembers(ns);
            return FormatCode(cu);
        }

        private string GenerateCreateUpdateDto(EnhancedEntityModelDto entity, string systemName, string moduleName, bool isUpdate)
        {
            var className = isUpdate ? $"Update{entity.Name}Dto" : $"Create{entity.Name}Dto";
            var usings = new[] { CreateUsing("System.ComponentModel.DataAnnotations") };
            var dtoClass = CreateClass(className);
            var properties = entity.Properties.Select(p =>
            {
                var prop = CreateProperty(p.Name, GetCSharpType(p.Type));
                if (p.IsRequired) prop = prop.AddAttributeLists(CreateAttribute("Required"));
                if (p.MaxLength.HasValue) prop = prop.AddAttributeLists(CreateAttribute("MaxLength", p.MaxLength.Value.ToString()));
                return prop;
            }).ToArray();
            dtoClass = dtoClass.AddMembers(properties);
            var ns = CreateNamespace($"SmartAbp.{systemName}.{moduleName}.Dtos").AddMembers(dtoClass);
            var cu = CreateCompilationUnit(usings).AddMembers(ns);
            return FormatCode(cu);
        }

        private string GenerateGetListDto(EnhancedEntityModelDto entity, string systemName, string moduleName)
        {
            var usings = new[] { CreateUsing("Volo.Abp.Application.Dtos") };
            var dtoListClass = CreateClass($"Get{entity.Name}ListDto", "PagedAndSortedResultRequestDto");
            var ns = CreateNamespace($"SmartAbp.{systemName}.{moduleName}.Dtos").AddMembers(dtoListClass);
            var cu = CreateCompilationUnit(usings).AddMembers(ns);
            return FormatCode(cu);
        }

        private string GenerateServiceInterface(EnhancedEntityModelDto entity, string systemName, string moduleName)
        {
            var usings = new[]
            {
                CreateUsing("System"),
                CreateUsing($"SmartAbp.{systemName}.{moduleName}.Dtos"),
                CreateUsing("Volo.Abp.Application.Services"),
            };
            var interfaceName = $"I{entity.Name}AppService";
            var baseInterface = $"ICrudAppService< {entity.Name}Dto, Guid, Get{entity.Name}ListDto, Create{entity.Name}Dto, Update{entity.Name}Dto >";
            var serviceInterface = InterfaceDeclaration(interfaceName)
                .AddModifiers(Token(SyntaxKind.PublicKeyword))
                .AddBaseListTypes(SimpleBaseType(ParseTypeName(baseInterface)));
            var ns = CreateNamespace($"SmartAbp.{systemName}.{moduleName}.Services").AddMembers(serviceInterface);
            var cu = CreateCompilationUnit(usings).AddMembers(ns);
            return FormatCode(cu);
        }

        private string GeneratePermissions(ModuleMetadataDto metadata)
        {
            var systemName = metadata.SystemName;
            var moduleName = metadata.Name;

            var permissionsClass = CreateClass($"{moduleName}Permissions", null, new[] { SyntaxKind.PublicKeyword, SyntaxKind.StaticKeyword });

            var groupNameField = FieldDeclaration(
                VariableDeclaration(ParseTypeName("const string"))
                    .AddVariables(VariableDeclarator("GroupName").WithInitializer(EqualsValueClause(LiteralExpression(SyntaxKind.StringLiteralExpression, Literal(moduleName)))))
            ).AddModifiers(Token(SyntaxKind.PublicKeyword));

            permissionsClass = permissionsClass.AddMembers(groupNameField);

            foreach (var entity in metadata.Entities)
            {
                var entityPermissionsClass = CreateClass(entity.Name, null, new[] { SyntaxKind.PublicKeyword, SyntaxKind.StaticKeyword });
                
                var defaultPermission = FieldDeclaration(
                    VariableDeclaration(ParseTypeName("const string"))
                        .AddVariables(VariableDeclarator("Default").WithInitializer(EqualsValueClause(ParseExpression($"GroupName + \".{entity.Name}\""))))
                ).AddModifiers(Token(SyntaxKind.PublicKeyword));
                
                var createPermission = FieldDeclaration(
                    VariableDeclaration(ParseTypeName("const string"))
                        .AddVariables(VariableDeclarator("Create").WithInitializer(EqualsValueClause(ParseExpression($"Default + \".Create\""))))
                ).AddModifiers(Token(SyntaxKind.PublicKeyword));

                var updatePermission = FieldDeclaration(
                    VariableDeclaration(ParseTypeName("const string"))
                        .AddVariables(VariableDeclarator("Update").WithInitializer(EqualsValueClause(ParseExpression($"Default + \".Update\""))))
                ).AddModifiers(Token(SyntaxKind.PublicKeyword));
                
                var deletePermission = FieldDeclaration(
                    VariableDeclaration(ParseTypeName("const string"))
                        .AddVariables(VariableDeclarator("Delete").WithInitializer(EqualsValueClause(ParseExpression($"Default + \".Delete\""))))
                ).AddModifiers(Token(SyntaxKind.PublicKeyword));

                entityPermissionsClass = entityPermissionsClass.AddMembers(defaultPermission, createPermission, updatePermission, deletePermission);
                permissionsClass = permissionsClass.AddMembers(entityPermissionsClass);
            }

            // custom actions
            if (metadata.PermissionConfig != null && metadata.PermissionConfig.CustomActions != null)
            {
                foreach (var action in metadata.PermissionConfig.CustomActions)
                {
                    var constName = $"{action.EntityName}{action.ActionKey}";
                    var constField = FieldDeclaration(
                        VariableDeclaration(ParseTypeName("const string"))
                            .AddVariables(VariableDeclarator(constName)
                                .WithInitializer(EqualsValueClause(ParseExpression($"GroupName + \".{action.EntityName}.{action.ActionKey}\""))))
                    ).AddModifiers(Token(SyntaxKind.PublicKeyword));
                    permissionsClass = permissionsClass.AddMembers(constField);
                }
            }
            
            var ns = CreateNamespace($"SmartAbp.{systemName}.{moduleName}.Permissions").AddMembers(permissionsClass);
            var cu = CreateCompilationUnit(null).AddMembers(ns);
            return FormatCode(cu);
        }

        private string GeneratePermissionDefinitionProvider(ModuleMetadataDto metadata)
        {
            var systemName = metadata.SystemName;
            var moduleName = metadata.Name;
            
            var usings = new[]
            {
                CreateUsing($"SmartAbp.{systemName}.{moduleName}.Localization"),
                CreateUsing("Volo.Abp.Authorization.Permissions"),
                CreateUsing("Volo.Abp.Localization"),
            };

            var providerClass = CreateClass($"{moduleName}PermissionDefinitionProvider", "PermissionDefinitionProvider");
            
            var defineMethod = MethodDeclaration(ParseTypeName("void"), "Define")
                .AddModifiers(Token(SyntaxKind.PublicKeyword), Token(SyntaxKind.OverrideKeyword))
                .AddParameterListParameters(Parameter(Identifier("context")).WithType(ParseTypeName("IPermissionDefinitionContext")));
            
            var statements = new List<StatementSyntax>
            {
                ParseStatement($"var myGroup = context.AddGroup({moduleName}Permissions.GroupName, L(\"Permission:{moduleName}\"));")
            };

            foreach (var entity in metadata.Entities)
            {
                var entityPermission = ParseStatement(
                    $"var {entity.Name.ToLower()}Permission = myGroup.AddPermission({moduleName}Permissions.{entity.Name}.Default, L(\"Permission:{entity.Name}\"));");

                var createPermission = ParseStatement(
                    $"{entity.Name.ToLower()}Permission.AddChild({moduleName}Permissions.{entity.Name}.Create, L(\"Permission:Create\"));");
                
                var updatePermission = ParseStatement(
                    $"{entity.Name.ToLower()}Permission.AddChild({moduleName}Permissions.{entity.Name}.Update, L(\"Permission:Update\"));");
                
                var deletePermission = ParseStatement(
                    $"{entity.Name.ToLower()}Permission.AddChild({moduleName}Permissions.{entity.Name}.Delete, L(\"Permission:Delete\"));");

                statements.Add(entityPermission);
                statements.Add(createPermission);
                statements.Add(updatePermission);
                statements.Add(deletePermission);
            }
            
            var getstringMethod = MethodDeclaration(ParseTypeName("LocalizableString"), "L")
                .AddModifiers(Token(SyntaxKind.PrivateKeyword), Token(SyntaxKind.StaticKeyword))
                .AddParameterListParameters(Parameter(Identifier("name")).WithType(ParseTypeName("string")))
                .WithBody(Block(
                    ParseStatement($"return LocalizableString.Create<{moduleName}Resource>(name);")
                ));

            defineMethod = defineMethod.WithBody(Block(statements));
            providerClass = providerClass.AddMembers(defineMethod, getstringMethod);

            var ns = CreateNamespace($"SmartAbp.{systemName}.{moduleName}.Permissions").AddMembers(providerClass);
            var cu = CreateCompilationUnit(usings).AddMembers(ns);
            return FormatCode(cu);
        }

        private string GetCSharpType(string type)
        {
            return type.ToLower() switch
            {
                "string" => "string", "text" => "string", "int" => "int", "long" => "long",
                "decimal" => "decimal", "double" => "double", "float" => "float", "bool" => "bool",
                "boolean" => "bool", "datetime" => "DateTime", "date" => "DateTime", "guid" => "Guid",
                _ => "string"
            };
        }
    }
}
