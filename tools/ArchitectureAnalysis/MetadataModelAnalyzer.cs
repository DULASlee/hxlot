using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using System.Text.Json;
using Microsoft.CodeAnalysis.Text;

namespace SmartAbp.Tools.ArchitectureAnalysis
{
    /// <summary>
    /// 🔍 SmartAbp低代码引擎元数据模型分析器
    /// 深度分析模型定义和代码生成的耦合关系
    /// </summary>
    public class MetadataModelAnalyzer
    {
        private readonly string _projectPath;
        private readonly List<string> _excludeDirectories;

        public MetadataModelAnalyzer(string projectPath)
        {
            _projectPath = projectPath;
            _excludeDirectories = new List<string> { "bin", "obj", "node_modules", ".git" };
        }

        /// <summary>
        /// 执行完整的元数据模型分析
        /// </summary>
        public async Task<MetadataAnalysisResult> AnalyzeAsync()
        {
            Console.WriteLine("🔍 开始SmartAbp低代码引擎元数据模型分析...");
            
            var result = new MetadataAnalysisResult
            {
                AnalysisStartTime = DateTime.Now,
                ProjectPath = _projectPath
            };

            try
            {
                // 1. 扫描所有模型定义文件
                result.EntityModels = await ScanEntityModelsAsync();
                result.DtoModels = await ScanDtoModelsAsync();
                result.ServiceModels = await ScanServiceModelsAsync();
                result.GeneratorModels = await ScanCodeGeneratorsAsync();

                // 2. 分析模型-代码生成器的耦合度
                result.CouplingAnalysis = AnalyzeModelCodeCoupling(result);

                // 3. 识别硬编码的技术栈依赖
                result.TechnologyDependencies = await FindTechnologyDependenciesAsync();

                // 4. 分析模型转换规则
                result.ModelMappings = AnalyzeModelMappings();

                result.AnalysisEndTime = DateTime.Now;
                result.Success = true;

                Console.WriteLine($"✅ 分析完成！耗时: {(result.AnalysisEndTime - result.AnalysisStartTime).TotalSeconds:F1}秒");
                PrintAnalysisSummary(result);

                return result;
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.ErrorMessage = ex.Message;
                Console.WriteLine($"❌ 分析失败: {ex.Message}");
                return result;
            }
        }

        /// <summary>
        /// 扫描所有实体模型定义
        /// </summary>
        private async Task<List<EntityModel>> ScanEntityModelsAsync()
        {
            Console.WriteLine("📋 扫描实体模型定义...");
            
            var entities = new List<EntityModel>();
            var modelFiles = FindSourceFiles("*Model*.cs", "*Entity*.cs", "*Dto*.cs");

            foreach (var file in modelFiles)
            {
                try
                {
                    var content = await File.ReadAllTextAsync(file);
                    var syntaxTree = CSharpSyntaxTree.ParseText(content);
                    var root = syntaxTree.GetRoot();

                    var classes = root.DescendantNodes().OfType<ClassDeclarationSyntax>();
                    foreach (var cls in classes)
                    {
                        if (IsEntityModel(cls))
                        {
                            entities.Add(ExtractEntityModel(cls, file));
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"⚠️  解析文件失败 {file}: {ex.Message}");
                }
            }

            Console.WriteLine($"📊 发现 {entities.Count} 个实体模型");
            return entities;
        }

        /// <summary>
        /// 扫描所有DTO模型定义
        /// </summary>
        private async Task<List<DtoModel>> ScanDtoModelsAsync()
        {
            Console.WriteLine("📋 扫描DTO模型定义...");
            
            var dtos = new List<DtoModel>();
            var dtoFiles = FindSourceFiles("*Dto*.cs", "*Input*.cs", "*Output*.cs");

            foreach (var file in dtoFiles)
            {
                try
                {
                    var content = await File.ReadAllTextAsync(file);
                    var syntaxTree = CSharpSyntaxTree.ParseText(content);
                    var root = syntaxTree.GetRoot();

                    var classes = root.DescendantNodes().OfType<ClassDeclarationSyntax>();
                    foreach (var cls in classes)
                    {
                        if (IsDtoModel(cls))
                        {
                            dtos.Add(ExtractDtoModel(cls, file));
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"⚠️  解析DTO文件失败 {file}: {ex.Message}");
                }
            }

            Console.WriteLine($"📊 发现 {dtos.Count} 个DTO模型");
            return dtos;
        }

        /// <summary>
        /// 扫描所有服务模型定义
        /// </summary>
        private async Task<List<ServiceModel>> ScanServiceModelsAsync()
        {
            Console.WriteLine("📋 扫描服务模型定义...");
            
            var services = new List<ServiceModel>();
            var serviceFiles = FindSourceFiles("*Service*.cs", "*AppService*.cs", "*Manager*.cs");

            foreach (var file in serviceFiles)
            {
                try
                {
                    var content = await File.ReadAllTextAsync(file);
                    var syntaxTree = CSharpSyntaxTree.ParseText(content);
                    var root = syntaxTree.GetRoot();

                    var classes = root.DescendantNodes().OfType<ClassDeclarationSyntax>();
                    foreach (var cls in classes)
                    {
                        if (IsServiceModel(cls))
                        {
                            services.Add(ExtractServiceModel(cls, file));
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"⚠️  解析服务文件失败 {file}: {ex.Message}");
                }
            }

            Console.WriteLine($"📊 发现 {services.Count} 个服务模型");
            return services;
        }

        /// <summary>
        /// 扫描所有代码生成器
        /// </summary>
        private async Task<List<CodeGeneratorModel>> ScanCodeGeneratorsAsync()
        {
            Console.WriteLine("📋 扫描代码生成器定义...");
            
            var generators = new List<CodeGeneratorModel>();
            var generatorFiles = FindSourceFiles("*Generator*.cs", "*Builder*.cs");

            foreach (var file in generatorFiles)
            {
                try
                {
                    var content = await File.ReadAllTextAsync(file);
                    var syntaxTree = CSharpSyntaxTree.ParseText(content);
                    var root = syntaxTree.GetRoot();

                    var classes = root.DescendantNodes().OfType<ClassDeclarationSyntax>();
                    foreach (var cls in classes)
                    {
                        if (IsCodeGenerator(cls))
                        {
                            generators.Add(ExtractCodeGeneratorModel(cls, file));
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"⚠️  解析生成器文件失败 {file}: {ex.Message}");
                }
            }

            Console.WriteLine($"📊 发现 {generators.Count} 个代码生成器");
            return generators;
        }

        /// <summary>
        /// 分析模型与代码生成的耦合关系
        /// </summary>
        private CouplingAnalysis AnalyzeModelCodeCoupling(MetadataAnalysisResult result)
        {
            Console.WriteLine("🔗 分析模型-代码生成耦合关系...");

            var coupling = new CouplingAnalysis();

            // 计算直接依赖耦合度
            foreach (var generator in result.GeneratorModels)
            {
                var dependencies = ExtractGeneratorDependencies(generator);
                coupling.DirectDependencies.AddRange(dependencies);
            }

            // 计算字符串硬编码耦合度
            coupling.HardCodedReferences = FindHardCodedReferences(result);

            // 计算类型系统耦合度
            coupling.TypeSystemCoupling = CalculateTypeSystemCoupling(result);

            // 综合计算耦合度评分 (0-1, 1最高)
            coupling.OverallCouplingScore = CalculateOverallCouplingScore(coupling);

            Console.WriteLine($"📊 耦合度分析完成，总评分: {coupling.OverallCouplingScore:F2}");
            
            return coupling;
        }

        /// <summary>
        /// 识别技术栈依赖
        /// </summary>
        private async Task<List<TechnologyDependency>> FindTechnologyDependenciesAsync()
        {
            Console.WriteLine("🔍 识别技术栈依赖...");

            var dependencies = new List<TechnologyDependency>();
            var allFiles = FindSourceFiles("*.cs");

            var knownTechnologies = new Dictionary<string, string>
            {
                { "EntityFrameworkCore", "EF Core" },
                { "Volo.Abp", "ABP Framework" },
                { "Microsoft.AspNetCore", "ASP.NET Core" },
                { "AutoMapper", "AutoMapper" },
                { "MediatR", "MediatR" },
                { "FluentValidation", "FluentValidation" },
                { "Serilog", "Serilog" },
                { "Redis", "Redis" },
                { "SqlServer", "SQL Server" },
                { "PostgreSql", "PostgreSQL" },
                { "MongoDB", "MongoDB" }
            };

            foreach (var file in allFiles)
            {
                try
                {
                    var content = await File.ReadAllTextAsync(file);
                    
                    foreach (var (pattern, techName) in knownTechnologies)
                    {
                        if (content.Contains(pattern))
                        {
                            var existing = dependencies.FirstOrDefault(d => d.TechnologyName == techName);
                            if (existing != null)
                            {
                                existing.UsageCount++;
                                existing.Files.Add(file);
                            }
                            else
                            {
                                dependencies.Add(new TechnologyDependency
                                {
                                    TechnologyName = techName,
                                    Pattern = pattern,
                                    UsageCount = 1,
                                    Files = new List<string> { file },
                                    CouplingLevel = DetermineCouplingLevel(pattern, content)
                                });
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"⚠️  扫描技术依赖失败 {file}: {ex.Message}");
                }
            }

            Console.WriteLine($"📊 发现 {dependencies.Count} 个技术栈依赖");
            return dependencies;
        }

        // 辅助方法实现...
        private string[] FindSourceFiles(params string[] patterns)
        {
            var files = new List<string>();
            
            foreach (var pattern in patterns)
            {
                var foundFiles = Directory.GetFiles(_projectPath, pattern, SearchOption.AllDirectories)
                    .Where(f => !_excludeDirectories.Any(dir => f.Contains(dir)))
                    .ToArray();
                files.AddRange(foundFiles);
            }
            
            return files.Distinct().ToArray();
        }

        private bool IsEntityModel(ClassDeclarationSyntax cls)
        {
            var className = cls.Identifier.Text;
            return className.EndsWith("Model") || 
                   className.EndsWith("Entity") ||
                   (className.EndsWith("Dto") && cls.Members.OfType<PropertyDeclarationSyntax>().Count() > 2);
        }

        private bool IsDtoModel(ClassDeclarationSyntax cls)
        {
            var className = cls.Identifier.Text;
            return className.EndsWith("Dto") || 
                   className.EndsWith("Input") || 
                   className.EndsWith("Output") ||
                   className.EndsWith("Request") ||
                   className.EndsWith("Response");
        }

        private bool IsServiceModel(ClassDeclarationSyntax cls)
        {
            var className = cls.Identifier.Text;
            return className.EndsWith("Service") || 
                   className.EndsWith("AppService") || 
                   className.EndsWith("Manager");
        }

        private bool IsCodeGenerator(ClassDeclarationSyntax cls)
        {
            var className = cls.Identifier.Text;
            return className.EndsWith("Generator") || 
                   className.EndsWith("Builder") ||
                   className.Contains("CodeGen");
        }

        private EntityModel ExtractEntityModel(ClassDeclarationSyntax cls, string filePath)
        {
            return new EntityModel
            {
                Name = cls.Identifier.Text,
                FilePath = filePath,
                Properties = cls.Members.OfType<PropertyDeclarationSyntax>()
                    .Select(p => new PropertyInfo
                    {
                        Name = p.Identifier.Text,
                        Type = p.Type.ToString(),
                        IsPublic = p.Modifiers.Any(m => m.IsKind(SyntaxKind.PublicKeyword))
                    }).ToList(),
                BaseClass = cls.BaseList?.Types.FirstOrDefault()?.ToString(),
                Namespace = GetNamespace(cls),
                LineCount = cls.GetText().Lines.Count
            };
        }

        private DtoModel ExtractDtoModel(ClassDeclarationSyntax cls, string filePath)
        {
            return new DtoModel
            {
                Name = cls.Identifier.Text,
                FilePath = filePath,
                Properties = cls.Members.OfType<PropertyDeclarationSyntax>()
                    .Select(p => new PropertyInfo
                    {
                        Name = p.Identifier.Text,
                        Type = p.Type.ToString(),
                        IsPublic = p.Modifiers.Any(m => m.IsKind(SyntaxKind.PublicKeyword))
                    }).ToList(),
                Purpose = DetermineDtoPurpose(cls.Identifier.Text),
                Namespace = GetNamespace(cls),
                LineCount = cls.GetText().Lines.Count
            };
        }

        private ServiceModel ExtractServiceModel(ClassDeclarationSyntax cls, string filePath)
        {
            return new ServiceModel
            {
                Name = cls.Identifier.Text,
                FilePath = filePath,
                Methods = cls.Members.OfType<MethodDeclarationSyntax>()
                    .Where(m => m.Modifiers.Any(mod => mod.IsKind(SyntaxKind.PublicKeyword)))
                    .Select(m => new MethodInfo
                    {
                        Name = m.Identifier.Text,
                        ReturnType = m.ReturnType.ToString(),
                        Parameters = m.ParameterList.Parameters.Select(p => 
                            new ParameterInfo 
                            { 
                                Name = p.Identifier.Text, 
                                Type = p.Type.ToString() 
                            }).ToList()
                    }).ToList(),
                BaseClass = cls.BaseList?.Types.FirstOrDefault()?.ToString(),
                Interfaces = cls.BaseList?.Types.Skip(1).Select(t => t.ToString()).ToList() ?? new List<string>(),
                Namespace = GetNamespace(cls),
                LineCount = cls.GetText().Lines.Count
            };
        }

        private CodeGeneratorModel ExtractCodeGeneratorModel(ClassDeclarationSyntax cls, string filePath)
        {
            return new CodeGeneratorModel
            {
                Name = cls.Identifier.Text,
                FilePath = filePath,
                GeneratedArtifacts = ExtractGeneratedArtifacts(cls),
                Dependencies = ExtractClassDependencies(cls),
                TemplateUsage = ExtractTemplateUsage(cls),
                TechnologyReferences = ExtractTechnologyReferences(cls),
                Namespace = GetNamespace(cls),
                LineCount = cls.GetText().Lines.Count
            };
        }

        private string GetNamespace(ClassDeclarationSyntax cls)
        {
            var namespaceDecl = cls.Ancestors().OfType<NamespaceDeclarationSyntax>().FirstOrDefault();
            return namespaceDecl?.Name.ToString() ?? "Unknown";
        }

        private string DetermineDtoPurpose(string dtoName)
        {
            if (dtoName.Contains("Create")) return "Create";
            if (dtoName.Contains("Update")) return "Update";
            if (dtoName.Contains("Input")) return "Input";
            if (dtoName.Contains("Output")) return "Output";
            if (dtoName.Contains("List")) return "List";
            return "Data Transfer";
        }

        private void PrintAnalysisSummary(MetadataAnalysisResult result)
        {
            Console.WriteLine("\n📊 === SmartAbp元数据模型分析摘要 ===");
            Console.WriteLine($"📋 实体模型: {result.EntityModels.Count} 个");
            Console.WriteLine($"📋 DTO模型: {result.DtoModels.Count} 个");
            Console.WriteLine($"📋 服务模型: {result.ServiceModels.Count} 个");
            Console.WriteLine($"📋 代码生成器: {result.GeneratorModels.Count} 个");
            Console.WriteLine($"🔗 耦合度评分: {result.CouplingAnalysis.OverallCouplingScore:F2}/1.0 {GetCouplingLevel(result.CouplingAnalysis.OverallCouplingScore)}");
            Console.WriteLine($"🔧 技术依赖: {result.TechnologyDependencies.Count} 个");
            Console.WriteLine($"⏱️  分析耗时: {(result.AnalysisEndTime - result.AnalysisStartTime).TotalSeconds:F1}秒");
            
            if (result.CouplingAnalysis.OverallCouplingScore > 0.7)
            {
                Console.WriteLine("⚠️  警告: 检测到高耦合度，建议优先重构！");
            }
        }

        private string GetCouplingLevel(double score)
        {
            return score switch
            {
                >= 0.8 => "🔴 极高风险",
                >= 0.6 => "🟡 高风险", 
                >= 0.4 => "🟠 中等风险",
                >= 0.2 => "🟢 低风险",
                _ => "✅ 健康"
            };
        }

        // 更多辅助方法的实现...
        private List<string> ExtractGeneratedArtifacts(ClassDeclarationSyntax cls)
        {
            var artifacts = new List<string>();
            // 分析类中的字符串字面量，识别生成的文件模式
            var literals = cls.DescendantNodes().OfType<LiteralExpressionSyntax>()
                .Where(l => l.IsKind(SyntaxKind.StringLiteralExpression))
                .Select(l => l.Token.ValueText);
            
            foreach (var literal in literals)
            {
                if (literal.EndsWith(".cs") || literal.EndsWith(".vue") || literal.EndsWith(".ts"))
                {
                    artifacts.Add(literal);
                }
            }
            return artifacts;
        }
        
        private List<string> ExtractClassDependencies(ClassDeclarationSyntax cls)
        {
            var dependencies = new List<string>();
            
            // 分析构造函数参数
            var constructors = cls.Members.OfType<ConstructorDeclarationSyntax>();
            foreach (var ctor in constructors)
            {
                dependencies.AddRange(ctor.ParameterList.Parameters
                    .Select(p => p.Type?.ToString() ?? "Unknown"));
            }
            
            return dependencies.Where(d => !string.IsNullOrEmpty(d)).Distinct().ToList();
        }
        
        private List<string> ExtractTemplateUsage(ClassDeclarationSyntax cls)
        {
            var templates = new List<string>();
            var literals = cls.DescendantNodes().OfType<LiteralExpressionSyntax>()
                .Where(l => l.IsKind(SyntaxKind.StringLiteralExpression))
                .Select(l => l.Token.ValueText);
                
            foreach (var literal in literals)
            {
                if (literal.Contains("template") || literal.Contains(".template"))
                {
                    templates.Add(literal);
                }
            }
            return templates;
        }
        
        private List<string> ExtractTechnologyReferences(ClassDeclarationSyntax cls)
        {
            var techRefs = new List<string>();
            var identifiers = cls.DescendantNodes().OfType<IdentifierNameSyntax>()
                .Select(i => i.Identifier.ValueText);
                
            var knownTechPatterns = new[] { "EntityFramework", "ABP", "AutoMapper", "MediatR", "Redis", "SQL" };
            
            foreach (var identifier in identifiers)
            {
                foreach (var pattern in knownTechPatterns)
                {
                    if (identifier.Contains(pattern))
                    {
                        techRefs.Add(pattern);
                    }
                }
            }
            
            return techRefs.Distinct().ToList();
        }
        
        private List<ModelMapping> AnalyzeModelMappings()
        {
            // 简化实现，返回空列表
            return new List<ModelMapping>();
        }
        
        private List<DependencyInfo> ExtractGeneratorDependencies(CodeGeneratorModel generator)
        {
            return generator.Dependencies.Select(dep => new DependencyInfo
            {
                Source = generator.Name,
                Target = dep,
                Type = "Dependency"
            }).ToList();
        }
        
        private List<HardCodedReference> FindHardCodedReferences(MetadataAnalysisResult result)
        {
            var hardCoded = new List<HardCodedReference>();
            
            // 在代码生成器中查找硬编码引用
            foreach (var generator in result.GeneratorModels)
            {
                foreach (var techRef in generator.TechnologyReferences)
                {
                    hardCoded.Add(new HardCodedReference
                    {
                        File = generator.FilePath,
                        Reference = techRef,
                        LineNumber = 0 // 简化实现
                    });
                }
            }
            
            return hardCoded;
        }
        
        private double CalculateTypeSystemCoupling(MetadataAnalysisResult result)
        {
            if (result.EntityModels.Count == 0) return 0.0;
            
            // 计算类型重复度
            var allTypes = new List<string>();
            foreach (var entity in result.EntityModels)
            {
                allTypes.AddRange(entity.Properties.Select(p => p.Type));
            }
            
            var uniqueTypes = allTypes.Distinct().Count();
            var totalTypes = allTypes.Count;
            
            return totalTypes > 0 ? 1.0 - (double)uniqueTypes / totalTypes : 0.0;
        }
        
        private double CalculateOverallCouplingScore(CouplingAnalysis coupling)
        {
            var directWeight = Math.Min(coupling.DirectDependencies.Count / 20.0, 1.0);
            var hardCodedWeight = Math.Min(coupling.HardCodedReferences.Count / 30.0, 1.0);
            var typeWeight = coupling.TypeSystemCoupling;
            
            return (directWeight * 0.3 + hardCodedWeight * 0.4 + typeWeight * 0.3);
        }
        
        private string DetermineCouplingLevel(string pattern, string content)
        {
            var occurrences = content.Split(pattern).Length - 1;
            return occurrences switch
            {
                >= 10 => "High",
                >= 5 => "Medium",
                _ => "Low"
            };
        }
    }

    // 数据模型定义...
    public class MetadataAnalysisResult
    {
        public DateTime AnalysisStartTime { get; set; }
        public DateTime AnalysisEndTime { get; set; }
        public string ProjectPath { get; set; }
        public bool Success { get; set; }
        public string ErrorMessage { get; set; }
        
        public List<EntityModel> EntityModels { get; set; } = new();
        public List<DtoModel> DtoModels { get; set; } = new();
        public List<ServiceModel> ServiceModels { get; set; } = new();
        public List<CodeGeneratorModel> GeneratorModels { get; set; } = new();
        
        public CouplingAnalysis CouplingAnalysis { get; set; } = new();
        public List<TechnologyDependency> TechnologyDependencies { get; set; } = new();
        public List<ModelMapping> ModelMappings { get; set; } = new();
    }

    public class EntityModel
    {
        public string Name { get; set; }
        public string FilePath { get; set; }
        public string Namespace { get; set; }
        public string BaseClass { get; set; }
        public List<PropertyInfo> Properties { get; set; } = new();
        public int LineCount { get; set; }
    }

    public class DtoModel
    {
        public string Name { get; set; }
        public string FilePath { get; set; }
        public string Namespace { get; set; }
        public string Purpose { get; set; }
        public List<PropertyInfo> Properties { get; set; } = new();
        public int LineCount { get; set; }
    }

    public class ServiceModel
    {
        public string Name { get; set; }
        public string FilePath { get; set; }
        public string Namespace { get; set; }
        public string BaseClass { get; set; }
        public List<string> Interfaces { get; set; } = new();
        public List<MethodInfo> Methods { get; set; } = new();
        public int LineCount { get; set; }
    }

    public class CodeGeneratorModel
    {
        public string Name { get; set; }
        public string FilePath { get; set; }
        public string Namespace { get; set; }
        public List<string> GeneratedArtifacts { get; set; } = new();
        public List<string> Dependencies { get; set; } = new();
        public List<string> TemplateUsage { get; set; } = new();
        public List<string> TechnologyReferences { get; set; } = new();
        public int LineCount { get; set; }
    }

    public class PropertyInfo
    {
        public string Name { get; set; }
        public string Type { get; set; }
        public bool IsPublic { get; set; }
    }

    public class MethodInfo
    {
        public string Name { get; set; }
        public string ReturnType { get; set; }
        public List<ParameterInfo> Parameters { get; set; } = new();
    }

    public class ParameterInfo
    {
        public string Name { get; set; }
        public string Type { get; set; }
    }

    public class CouplingAnalysis
    {
        public double OverallCouplingScore { get; set; }
        public List<DependencyInfo> DirectDependencies { get; set; } = new();
        public List<HardCodedReference> HardCodedReferences { get; set; } = new();
        public double TypeSystemCoupling { get; set; }
    }

    public class TechnologyDependency
    {
        public string TechnologyName { get; set; }
        public string Pattern { get; set; }
        public int UsageCount { get; set; }
        public List<string> Files { get; set; } = new();
        public string CouplingLevel { get; set; }
    }

    public class DependencyInfo
    {
        public string Source { get; set; }
        public string Target { get; set; }
        public string Type { get; set; }
    }

    public class HardCodedReference
    {
        public string File { get; set; }
        public string Reference { get; set; }
        public int LineNumber { get; set; }
    }

    public class ModelMapping
    {
        public string SourceModel { get; set; }
        public string TargetModel { get; set; }
        public string MappingType { get; set; }
    }
}
