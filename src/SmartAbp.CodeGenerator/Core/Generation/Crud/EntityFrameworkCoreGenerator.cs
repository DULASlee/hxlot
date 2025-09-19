using System.Collections.Generic;
using System.IO;
using System.Linq;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using SmartAbp.CodeGenerator.Services.V9;
using Volo.Abp.DependencyInjection;
using static Microsoft.CodeAnalysis.CSharp.SyntaxFactory;
using static SmartAbp.CodeGenerator.Core.RoslynSyntaxFactory;
using Pluralize.NET;

namespace SmartAbp.CodeGenerator.Core.Generation.Crud
{
    public class EntityFrameworkCoreGenerator : ITransientDependency
    {
        private readonly Pluralizer _pluralizer;

        public EntityFrameworkCoreGenerator()
        {
            _pluralizer = new Pluralizer();
        }

        public Dictionary<string, string> Generate(ModuleMetadataDto metadata, string solutionRoot)
        {
            var generatedFiles = new Dictionary<string, string>();
            var systemName = metadata.SystemName;
            var moduleName = metadata.Name;
            var efProjectRoot = Path.Combine(solutionRoot, $"src/SmartAbp.{systemName}.{moduleName}.EntityFrameworkCore");

            generatedFiles.Add(
                Path.Combine(efProjectRoot, $"I{moduleName}DbContext.cs"),
                GenerateDbContextInterface(metadata)
            );

            generatedFiles.Add(
                Path.Combine(efProjectRoot, $"{moduleName}DbContext.cs"),
                GenerateDbContext(metadata)
            );

            generatedFiles.Add(
                Path.Combine(efProjectRoot, $"{moduleName}DbContextModelCreatingExtensions.cs"),
                GenerateModelCreatingExtensions(metadata)
            );

            generatedFiles.Add(
                Path.Combine(efProjectRoot, $"{moduleName}EntityFrameworkCoreModule.cs"),
                GenerateEntityFrameworkCoreModule(metadata)
            );

            return generatedFiles;
        }

        private string GenerateDbContextInterface(ModuleMetadataDto metadata)
        {
            var systemName = metadata.SystemName;
            var moduleName = metadata.Name;

            var usings = new[]
            {
                CreateUsing($"SmartAbp.{systemName}.{moduleName}.Entities"),
                CreateUsing("Microsoft.EntityFrameworkCore"),
                CreateUsing("Volo.Abp.Data"),
                CreateUsing("Volo.Abp.EntityFrameworkCore"),
            };

            var interfaceName = $"I{moduleName}DbContext";
            var dbContextInterface = InterfaceDeclaration(interfaceName)
                .AddModifiers(Token(SyntaxKind.PublicKeyword))
                .AddBaseListTypes(
                    SimpleBaseType(ParseTypeName("IEfCoreDbContext")),
                    SimpleBaseType(ParseTypeName("IDataSeeder"))
                )
                .AddAttributeLists(
                    AttributeList(SingletonSeparatedList(
                        Attribute(IdentifierName("ConnectionStringName"))
                        .WithArgumentList(AttributeArgumentList(SingletonSeparatedList(
                            AttributeArgument(LiteralExpression(SyntaxKind.StringLiteralExpression, Literal(metadata.DatabaseInfo.ConnectionStringName ?? "Default")))
                        )))
                    ))
                );

            var dbSetProperties = metadata.Entities
                .Select(e => (PropertyDeclarationSyntax)CreateProperty(e.Name, $"DbSet<{e.Name}>"))
                .ToArray();

            dbContextInterface = dbContextInterface.AddMembers(dbSetProperties);

            var ns = CreateNamespace($"SmartAbp.{systemName}.{moduleName}.EntityFrameworkCore");
            ns = ns.AddMembers(dbContextInterface);

            var cu = CreateCompilationUnit(usings);
            cu = cu.AddMembers(ns);

            return FormatCode(cu);
        }

        private string GenerateDbContext(ModuleMetadataDto metadata)
        {
            var systemName = metadata.SystemName;
            var moduleName = metadata.Name;

            var usings = new[]
            {
                CreateUsing($"SmartAbp.{systemName}.{moduleName}.Entities"),
                CreateUsing("Microsoft.EntityFrameworkCore"),
                CreateUsing("Volo.Abp.Data"),
                CreateUsing("Volo.Abp.EntityFrameworkCore"),
                CreateUsing("Volo.Abp.EntityFrameworkCore.Modeling"),
            };

            var className = $"{moduleName}DbContext";
            var baseClass = $"AbpDbContext<{className}>";
            var interfaceName = $"I{moduleName}DbContext";

            var dbContextClass = CreateClass(className, baseClass, new[] { SyntaxKind.PublicKeyword, SyntaxKind.PartialKeyword }, new[] { interfaceName });

            var dbSetProperties = metadata.Entities
                .Select(e => (MemberDeclarationSyntax)CreateProperty(e.Name, $"DbSet<{e.Name}>", new[] { SyntaxKind.PublicKeyword }))
                .ToArray();
            
            var constructor = CreateConstructor(className, null,
                new[] { CreateParameter("options", $"DbContextOptions<{className}>") },
                body: null,
                baseInitializer: CreateBaseConstructorInitializer("options")
            );

            var onModelCreatingMethod = MethodDeclaration(ParseTypeName("void"), "OnModelCreating")
                .AddModifiers(Token(SyntaxKind.ProtectedKeyword), Token(SyntaxKind.OverrideKeyword))
                .AddParameterListParameters(CreateParameter("builder", "ModelBuilder"))
                .WithBody(
                    Block(
                        ParseStatement("base.OnModelCreating(builder);"),
                        ParseStatement($"builder.Configure{moduleName}(builder);")
                    )
                );
            
            dbContextClass = dbContextClass.AddMembers(dbSetProperties)
                                           .AddMembers(constructor)
                                           .AddMembers(onModelCreatingMethod);

            var ns = CreateNamespace($"SmartAbp.{systemName}.{moduleName}.EntityFrameworkCore");
            ns = ns.AddMembers(dbContextClass);
            
            var cu = CreateCompilationUnit(usings);
            cu = cu.AddMembers(ns);
            
            return FormatCode(cu);
        }

        private string GenerateModelCreatingExtensions(ModuleMetadataDto metadata)
        {
             var systemName = metadata.SystemName;
            var moduleName = metadata.Name;

            var usings = new[]
            {
                CreateUsing("Microsoft.EntityFrameworkCore"),
                CreateUsing("Volo.Abp"),
                CreateUsing("Volo.Abp.EntityFrameworkCore.Modeling"),
            };

            var className = $"{moduleName}DbContextModelCreatingExtensions";
            var extensionsClass = CreateClass(className, null, new[] { SyntaxKind.PublicKeyword, SyntaxKind.StaticKeyword });

            var configureMethod = MethodDeclaration(ParseTypeName("void"), $"Configure{moduleName}")
                .AddModifiers(Token(SyntaxKind.PublicKeyword), Token(SyntaxKind.StaticKeyword))
                .AddParameterListParameters(
                    Parameter(Identifier("builder")).WithType(ParseTypeName("ModelBuilder")).AddModifiers(Token(SyntaxKind.ThisKeyword))
                )
                .WithBody(Block(
                    ParseStatement("Check.NotNull(builder, nameof(builder));")
                ));

            var entityConfigStatements = new List<StatementSyntax>();
            foreach (var entity in metadata.Entities)
            {
                var tableName = _pluralizer.Pluralize(entity.Name);
                var lambdaIdentifier = "b";
                var lambdaBodyStatements = new List<StatementSyntax>
                {
                    ParseStatement($"{lambdaIdentifier}.ToTable(AbpCommonDbProperties.DbTablePrefix + \"{tableName}\", \"{metadata.DatabaseInfo.Schema}\");"),
                    ParseStatement($"{lambdaIdentifier}.ConfigureByConvention();")
                };

                foreach (var prop in entity.Properties)
                {
                    if (prop.Type.ToLower() == "string" && prop.MaxLength.HasValue && prop.MaxLength > 0)
                    {
                        var propConfig = ParseStatement($"{lambdaIdentifier}.Property(e => e.{prop.Name}).HasMaxLength({prop.MaxLength});");
                        lambdaBodyStatements.Add(propConfig);
                    }
                    if (prop.IsRequired)
                    {
                        var propConfig = ParseStatement($"{lambdaIdentifier}.Property(e => e.{prop.Name}).IsRequired();");
                        lambdaBodyStatements.Add(propConfig);
                    }
                }

                var lambda = SimpleLambdaExpression(
                    Parameter(Identifier(lambdaIdentifier)),
                    Block(lambdaBodyStatements)
                );
                
                var entityConfigStatement = ExpressionStatement(
                    InvocationExpression(
                        MemberAccessExpression(
                            SyntaxKind.SimpleMemberAccessExpression,
                            IdentifierName("builder"),
                            GenericName(Identifier("Entity"))
                                .WithTypeArgumentList(
                                    TypeArgumentList(SingletonSeparatedList<TypeSyntax>(IdentifierName(entity.Name)))
                                )
                        )
                    ).WithArgumentList(ArgumentList(SingletonSeparatedList(Argument(lambda))))
                );
                entityConfigStatements.Add(entityConfigStatement);

                // Relationship configurations
                if (entity.Relationships != null && entity.Relationships.Count > 0)
                {
                    foreach (var rel in entity.Relationships)
                    {
                        var targetEntity = string.IsNullOrWhiteSpace(rel.TargetEntity) ? "object" : rel.TargetEntity;
                        var navProp = string.IsNullOrWhiteSpace(rel.SourceNavigationProperty) ? targetEntity : rel.SourceNavigationProperty;
                        var fkProp = string.IsNullOrWhiteSpace(rel.ForeignKeyProperty) ? ($"{targetEntity}Id") : rel.ForeignKeyProperty;
                        var isReq = rel.IsForeignKeyRequired ? "true" : "false";
                        var delBehavior = rel.OnDeleteBehavior.ToString();
                        var relStmt = ParseStatement(
                            $"builder.Entity<{entity.Name}>(b => {{ b.HasOne<{targetEntity}>(e => e.{navProp}).WithMany().HasForeignKey(e => e.{fkProp}).IsRequired({isReq}).OnDelete(DeleteBehavior.{delBehavior}); }});");
                        entityConfigStatements.Add(relStmt);
                    }
                }
            }

            configureMethod = configureMethod.AddBodyStatements(entityConfigStatements.ToArray());

            extensionsClass = extensionsClass.AddMembers(configureMethod);

            var ns = CreateNamespace($"SmartAbp.{systemName}.{moduleName}.EntityFrameworkCore");
            ns = ns.AddMembers(extensionsClass);

            var cu = CreateCompilationUnit(usings).AddMembers(ns);
            return FormatCode(cu);
        }

        private string GenerateEntityFrameworkCoreModule(ModuleMetadataDto metadata)
        {
            var systemName = metadata.SystemName;
            var moduleName = metadata.Name;
            var dbContextName = $"{moduleName}DbContext";

            var usings = new[]
            {
                CreateUsing($"SmartAbp.{systemName}.{moduleName}.Domain"),
                CreateUsing("Microsoft.Extensions.DependencyInjection"),
                CreateUsing("Volo.Abp.EntityFrameworkCore"),
                CreateUsing("Volo.Abp.Modularity"),
            };

            var moduleClass = CreateClass($"{moduleName}EntityFrameworkCoreModule", "AbpModule")
                .AddAttributeLists(
                    AttributeList(SingletonSeparatedList(
                        Attribute(IdentifierName("DependsOn"))
                            .WithArgumentList(AttributeArgumentList(SeparatedList<AttributeArgumentSyntax>(new[]
                            {
                                AttributeArgument(TypeOfExpression(IdentifierName($"{moduleName}DomainModule"))),
                                AttributeArgument(TypeOfExpression(IdentifierName("AbpEntityFrameworkCoreModule")))
                            })))
                    ))
                );

            var configureServicesMethod = MethodDeclaration(ParseTypeName("void"), "ConfigureServices")
                .AddModifiers(Token(SyntaxKind.PublicKeyword), Token(SyntaxKind.OverrideKeyword))
                .AddParameterListParameters(
                    Parameter(Identifier("context")).WithType(ParseTypeName("ServiceConfigurationContext"))
                )
                .WithBody(Block(
                    ParseStatement($"context.Services.AddAbpDbContext<{dbContextName}>(options => {{ options.AddDefaultRepositories(includeAllEntities: true); }});")
                ));

            moduleClass = moduleClass.AddMembers(configureServicesMethod);

            var ns = CreateNamespace($"SmartAbp.{systemName}.{moduleName}.EntityFrameworkCore");
            ns = ns.AddMembers(moduleClass);

            var cu = CreateCompilationUnit(usings);
            cu = cu.AddMembers(ns);

            return FormatCode(cu);
        }
    }
}
