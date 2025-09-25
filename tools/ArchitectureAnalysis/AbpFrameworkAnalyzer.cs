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

namespace SmartAbp.Tools.ArchitectureAnalysis
{
    /// <summary>
    /// 🔍 SmartAbp ABP框架集成分析器
    /// 深度分析ABP框架特性利用和运行时扩展性
    /// </summary>
    public class AbpFrameworkAnalyzer
    {
        private readonly string _projectPath;
        private readonly List<string> _excludeDirectories;

        public AbpFrameworkAnalyzer(string projectPath)
        {
            _projectPath = projectPath;
            _excludeDirectories = new List<string> { "bin", "obj", "node_modules", ".git" };
        }

        /// <summary>
        /// 执行ABP框架集成分析
        /// </summary>
        public async Task<AbpAnalysisResult> AnalyzeAbpIntegrationAsync()
        {
            Console.WriteLine("🔍 开始ABP框架集成分析...");
            
            var result = new AbpAnalysisResult
            {
                AnalysisStartTime = DateTime.Now,
                ProjectPath = _projectPath
            };

            try
            {
                // 1. ABP模块架构分析
                result.ModuleAnalysis = await AnalyzeAbpModulesAsync();
                
                // 2. ABP服务特性利用分析
                result.ServiceFeatureAnalysis = await AnalyzeAbpServiceFeaturesAsync();
                
                // 3. 依赖注入配置分析
                result.DependencyInjectionAnalysis = await AnalyzeDependencyInjectionAsync();
                
                // 4. 运行时扩展性分析
                result.ExtensibilityAnalysis = await AnalyzeRuntimeExtensibilityAsync();
                
                // 5. ABP特性利用率评估
                result.FeatureUtilizationScore = CalculateAbpFeatureUtilization(result);
                
                result.AnalysisEndTime = DateTime.Now;
                result.Success = true;

                Console.WriteLine($"✅ ABP分析完成！耗时: {(result.AnalysisEndTime - result.AnalysisStartTime).TotalSeconds:F1}秒");
                PrintAbpAnalysisSummary(result);

                return result;
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.ErrorMessage = ex.Message;
                Console.WriteLine($"❌ ABP分析失败: {ex.Message}");
                return result;
            }
        }

        /// <summary>
        /// 分析ABP模块架构
        /// </summary>
        private async Task<ModuleAnalysis> AnalyzeAbpModulesAsync()
        {
            Console.WriteLine("📋 分析ABP模块架构...");
            
            var modules = new List<AbpModuleInfo>();
            var moduleFiles = FindSourceFiles("*Module.cs");

            foreach (var file in moduleFiles)
            {
                try
                {
                    var content = await File.ReadAllTextAsync(file);
                    var syntaxTree = CSharpSyntaxTree.ParseText(content);
                    var root = syntaxTree.GetRoot();

                    var classes = root.DescendantNodes().OfType<ClassDeclarationSyntax>();
                    foreach (var cls in classes)
                    {
                        if (IsAbpModule(cls))
                        {
                            modules.Add(ExtractAbpModuleInfo(cls, file));
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"⚠️  解析模块文件失败 {file}: {ex.Message}");
                }
            }

            var analysis = new ModuleAnalysis
            {
                TotalModules = modules.Count,
                Modules = modules,
                CohesionScore = CalculateModuleCohesion(modules),
                CouplingScore = CalculateModuleCoupling(modules),
                DependencyDepth = CalculateDependencyDepth(modules)
            };

            Console.WriteLine($"📊 发现 {modules.Count} 个ABP模块");
            return analysis;
        }

        /// <summary>
        /// 分析ABP服务特性利用
        /// </summary>
        private async Task<ServiceFeatureAnalysis> AnalyzeAbpServiceFeaturesAsync()
        {
            Console.WriteLine("🔧 分析ABP服务特性利用...");
            
            var services = new List<AbpServiceInfo>();
            var serviceFiles = FindSourceFiles("*Service.cs", "*AppService.cs");

            var abpFeatures = new Dictionary<string, int>
            {
                ["ApplicationService"] = 0,
                ["DomainService"] = 0,
                ["RemoteService"] = 0,
                ["ITransientDependency"] = 0,
                ["ISingletonDependency"] = 0,
                ["IScopedDependency"] = 0,
                ["IRepository"] = 0,
                ["AutoMapperProfile"] = 0,
                ["EventHandler"] = 0,
                ["BackgroundJob"] = 0
            };

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
                        if (IsAbpService(cls))
                        {
                            var serviceInfo = ExtractAbpServiceInfo(cls, file);
                            services.Add(serviceInfo);
                            
                            // 统计ABP特性使用
                            foreach (var feature in serviceInfo.UsedAbpFeatures)
                            {
                                if (abpFeatures.ContainsKey(feature))
                                {
                                    abpFeatures[feature]++;
                                }
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"⚠️  解析服务文件失败 {file}: {ex.Message}");
                }
            }

            var analysis = new ServiceFeatureAnalysis
            {
                TotalServices = services.Count,
                Services = services,
                FeatureUsageStatistics = abpFeatures,
                UtilizationScore = CalculateFeatureUtilization(abpFeatures),
                MissingFeatures = FindMissingAbpFeatures(abpFeatures)
            };

            Console.WriteLine($"📊 分析 {services.Count} 个ABP服务");
            return analysis;
        }

        /// <summary>
        /// 分析依赖注入配置
        /// </summary>
        private async Task<DependencyInjectionAnalysis> AnalyzeDependencyInjectionAsync()
        {
            Console.WriteLine("💉 分析依赖注入配置...");
            
            var diFiles = FindSourceFiles("*Module.cs", "*Extensions.cs");
            var registrations = new List<ServiceRegistration>();
            var configureMethods = new List<ConfigureMethodInfo>();

            foreach (var file in diFiles)
            {
                try
                {
                    var content = await File.ReadAllTextAsync(file);
                    var syntaxTree = CSharpSyntaxTree.ParseText(content);
                    var root = syntaxTree.GetRoot();

                    // 查找ConfigureServices方法
                    var methods = root.DescendantNodes().OfType<MethodDeclarationSyntax>()
                        .Where(m => m.Identifier.Text.Contains("Configure"));

                    foreach (var method in methods)
                    {
                        configureMethods.Add(new ConfigureMethodInfo
                        {
                            MethodName = method.Identifier.Text,
                            FilePath = file,
                            ParameterCount = method.ParameterList.Parameters.Count,
                            LineCount = method.Body?.Statements.Count ?? 0
                        });

                        // 查找服务注册调用
                        var invocations = method.DescendantNodes().OfType<InvocationExpressionSyntax>();
                        foreach (var invocation in invocations)
                        {
                            if (IsServiceRegistration(invocation))
                            {
                                registrations.Add(ExtractServiceRegistration(invocation, file));
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"⚠️  解析DI配置失败 {file}: {ex.Message}");
                }
            }

            var analysis = new DependencyInjectionAnalysis
            {
                TotalRegistrations = registrations.Count,
                ServiceRegistrations = registrations,
                ConfigureMethods = configureMethods,
                RegistrationComplexity = CalculateRegistrationComplexity(registrations),
                CircularDependencyRisk = DetectCircularDependencyRisk(registrations)
            };

            Console.WriteLine($"📊 发现 {registrations.Count} 个服务注册");
            return analysis;
        }

        /// <summary>
        /// 分析运行时扩展性
        /// </summary>
        private async Task<ExtensibilityAnalysis> AnalyzeRuntimeExtensibilityAsync()
        {
            Console.WriteLine("🔧 分析运行时扩展性...");
            
            var analysis = new ExtensibilityAnalysis();
            
            // 1. 扫描扩展点接口
            analysis.ExtensionPoints = await FindExtensionPointsAsync();
            
            // 2. 分析插件化支持
            analysis.PluginSupport = AnalyzePluginSupport();
            
            // 3. 检查动态配置能力
            analysis.DynamicConfigurationSupport = AnalyzeDynamicConfigurationSupport();
            
            // 4. 评估运行时服务注册
            analysis.RuntimeServiceRegistration = AnalyzeRuntimeServiceRegistration();
            
            // 5. 检查热重载能力
            analysis.HotReloadCapabilities = AnalyzeHotReloadCapabilities();

            Console.WriteLine($"📊 发现 {analysis.ExtensionPoints.Count} 个扩展点");
            return analysis;
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

        private bool IsAbpModule(ClassDeclarationSyntax cls)
        {
            return cls.Identifier.Text.EndsWith("Module") &&
                   cls.BaseList?.Types.Any(t => t.ToString().Contains("AbpModule")) == true;
        }

        private bool IsAbpService(ClassDeclarationSyntax cls)
        {
            var baseTypes = cls.BaseList?.Types.Select(t => t.ToString()) ?? Enumerable.Empty<string>();
            return baseTypes.Any(bt => bt.Contains("ApplicationService") || 
                                      bt.Contains("DomainService") ||
                                      bt.Contains("ITransientDependency") ||
                                      bt.Contains("ISingletonDependency"));
        }

        private AbpModuleInfo ExtractAbpModuleInfo(ClassDeclarationSyntax cls, string filePath)
        {
            var dependsOnAttr = cls.AttributeLists
                .SelectMany(al => al.Attributes)
                .FirstOrDefault(a => a.Name.ToString().Contains("DependsOn"));

            var dependencies = new List<string>();
            if (dependsOnAttr?.ArgumentList != null)
            {
                dependencies = dependsOnAttr.ArgumentList.Arguments
                    .Select(arg => arg.ToString())
                    .ToList();
            }

            return new AbpModuleInfo
            {
                Name = cls.Identifier.Text,
                FilePath = filePath,
                Dependencies = dependencies,
                LineCount = cls.GetText().Lines.Count,
                HasConfigureServices = cls.Members.OfType<MethodDeclarationSyntax>()
                    .Any(m => m.Identifier.Text == "ConfigureServices"),
                HasPreConfigureServices = cls.Members.OfType<MethodDeclarationSyntax>()
                    .Any(m => m.Identifier.Text == "PreConfigureServices"),
                HasPostConfigureServices = cls.Members.OfType<MethodDeclarationSyntax>()
                    .Any(m => m.Identifier.Text == "PostConfigureServices")
            };
        }

        private AbpServiceInfo ExtractAbpServiceInfo(ClassDeclarationSyntax cls, string filePath)
        {
            var baseTypes = cls.BaseList?.Types.Select(t => t.ToString()).ToList() ?? new List<string>();
            var usedFeatures = new List<string>();

            // 检测使用的ABP特性
            if (baseTypes.Any(bt => bt.Contains("ApplicationService")))
                usedFeatures.Add("ApplicationService");
            if (baseTypes.Any(bt => bt.Contains("DomainService")))
                usedFeatures.Add("DomainService");
            if (baseTypes.Any(bt => bt.Contains("ITransientDependency")))
                usedFeatures.Add("ITransientDependency");
            if (baseTypes.Any(bt => bt.Contains("ISingletonDependency")))
                usedFeatures.Add("ISingletonDependency");

            // 检查RemoteService特性
            var hasRemoteService = cls.AttributeLists
                .SelectMany(al => al.Attributes)
                .Any(a => a.Name.ToString().Contains("RemoteService"));
            
            if (hasRemoteService)
                usedFeatures.Add("RemoteService");

            return new AbpServiceInfo
            {
                Name = cls.Identifier.Text,
                FilePath = filePath,
                BaseTypes = baseTypes,
                UsedAbpFeatures = usedFeatures,
                MethodCount = cls.Members.OfType<MethodDeclarationSyntax>().Count(),
                HasAutoApi = hasRemoteService,
                HasPermissionCheck = HasPermissionCheck(cls),
                HasValidation = HasValidation(cls),
                HasAuditing = HasAuditing(cls),
                LineCount = cls.GetText().Lines.Count
            };
        }

        private async Task<List<ExtensionPoint>> FindExtensionPointsAsync()
        {
            var extensionPoints = new List<ExtensionPoint>();
            var interfaceFiles = FindSourceFiles("I*.cs");

            foreach (var file in interfaceFiles)
            {
                try
                {
                    var content = await File.ReadAllTextAsync(file);
                    var syntaxTree = CSharpSyntaxTree.ParseText(content);
                    var root = syntaxTree.GetRoot();

                    var interfaces = root.DescendantNodes().OfType<InterfaceDeclarationSyntax>();
                    foreach (var iface in interfaces)
                    {
                        if (IsExtensionPoint(iface))
                        {
                            extensionPoints.Add(new ExtensionPoint
                            {
                                Name = iface.Identifier.Text,
                                FilePath = file,
                                MethodCount = iface.Members.OfType<MethodDeclarationSyntax>().Count(),
                                Implementations = await FindImplementationsAsync(iface.Identifier.Text),
                                ExtensionType = DetermineExtensionType(iface.Identifier.Text)
                            });
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"⚠️  解析接口文件失败 {file}: {ex.Message}");
                }
            }

            return extensionPoints;
        }

        private bool IsExtensionPoint(InterfaceDeclarationSyntax iface)
        {
            var name = iface.Identifier.Text;
            return name.Contains("Plugin") ||
                   name.Contains("Provider") ||
                   name.Contains("Strategy") ||
                   name.Contains("Factory") ||
                   name.Contains("Builder") ||
                   name.Contains("Generator") ||
                   name.Contains("Handler");
        }

        private async Task<List<string>> FindImplementationsAsync(string interfaceName)
        {
            var implementations = new List<string>();
            var allFiles = FindSourceFiles("*.cs");

            foreach (var file in allFiles)
            {
                try
                {
                    var content = await File.ReadAllTextAsync(file);
                    if (content.Contains($": {interfaceName}") || content.Contains($": I{interfaceName}"))
                    {
                        var fileName = Path.GetFileNameWithoutExtension(file);
                        implementations.Add(fileName);
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"⚠️  查找实现失败 {file}: {ex.Message}");
                }
            }

            return implementations;
        }

        private PluginSupportInfo AnalyzePluginSupport()
        {
            // 分析插件化架构支持
            var pluginFiles = FindSourceFiles("*Plugin*.cs", "*Extension*.cs");
            
            return new PluginSupportInfo
            {
                HasPluginInterface = pluginFiles.Any(f => f.Contains("IPlugin")),
                HasPluginLoader = pluginFiles.Any(f => f.Contains("PluginLoader")),
                HasPluginRegistry = pluginFiles.Any(f => f.Contains("PluginRegistry")),
                PluginFiles = pluginFiles.ToList(),
                PluginSupported = pluginFiles.Length > 0
            };
        }

        private DynamicConfigurationInfo AnalyzeDynamicConfigurationSupport()
        {
            var configFiles = FindSourceFiles("*Config*.cs", "*Options*.cs", "*Settings*.cs");
            
            var hasOptionsPattern = configFiles.Any(f =>
            {
                try
                {
                    var content = File.ReadAllText(f);
                    return content.Contains("IOptions<") || content.Contains("IConfiguration");
                }
                catch
                {
                    return false;
                }
            });

            return new DynamicConfigurationInfo
            {
                ConfigurationFiles = configFiles.ToList(),
                HasOptionsPattern = hasOptionsPattern,
                HasDynamicConfiguration = hasOptionsPattern,
                ConfigurationComplexity = configFiles.Length > 10 ? "High" : configFiles.Length > 5 ? "Medium" : "Low"
            };
        }

        private RuntimeServiceInfo AnalyzeRuntimeServiceRegistration()
        {
            var moduleFiles = FindSourceFiles("*Module.cs");
            var hasRuntimeRegistration = false;
            var registrationMethods = new List<string>();

            foreach (var file in moduleFiles)
            {
                try
                {
                    var content = File.ReadAllText(file);
                    if (content.Contains("AddTransient") || 
                        content.Contains("AddScoped") || 
                        content.Contains("AddSingleton"))
                    {
                        hasRuntimeRegistration = true;
                        registrationMethods.Add(Path.GetFileName(file));
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"⚠️  分析运行时注册失败 {file}: {ex.Message}");
                }
            }

            return new RuntimeServiceInfo
            {
                HasRuntimeRegistration = hasRuntimeRegistration,
                RegistrationMethods = registrationMethods,
                SupportsConditionalRegistration = hasRuntimeRegistration // 简化检测
            };
        }

        private HotReloadInfo AnalyzeHotReloadCapabilities()
        {
            // 检查热重载相关文件和配置
            var hotReloadFiles = FindSourceFiles("*HotReload*.cs", "*Live*.cs");
            
            return new HotReloadInfo
            {
                HasHotReloadSupport = hotReloadFiles.Length > 0,
                HotReloadFiles = hotReloadFiles.ToList(),
                SupportsConfigurationReload = File.Exists(Path.Combine(_projectPath, "appsettings.json")),
                SupportsCodeReload = hotReloadFiles.Any(f => f.Contains("CodeReload"))
            };
        }

        // 计算方法
        private double CalculateModuleCohesion(List<AbpModuleInfo> modules)
        {
            if (modules.Count == 0) return 1.0;
            
            var avgDependencies = modules.Average(m => m.Dependencies.Count);
            return Math.Max(0, 1.0 - (avgDependencies / 10.0)); // 假设10个依赖为高耦合
        }

        private double CalculateModuleCoupling(List<AbpModuleInfo> modules)
        {
            if (modules.Count <= 1) return 0.0;
            
            var totalDependencies = modules.Sum(m => m.Dependencies.Count);
            var maxPossibleDependencies = modules.Count * (modules.Count - 1);
            
            return maxPossibleDependencies > 0 ? (double)totalDependencies / maxPossibleDependencies : 0.0;
        }

        private int CalculateDependencyDepth(List<AbpModuleInfo> modules)
        {
            // 简化计算：找到最大依赖数量作为深度
            return modules.Any() ? modules.Max(m => m.Dependencies.Count) : 0;
        }

        private double CalculateFeatureUtilization(Dictionary<string, int> features)
        {
            var totalFeatures = features.Count;
            var usedFeatures = features.Count(f => f.Value > 0);
            
            return totalFeatures > 0 ? (double)usedFeatures / totalFeatures : 0.0;
        }

        private List<string> FindMissingAbpFeatures(Dictionary<string, int> features)
        {
            return features.Where(f => f.Value == 0).Select(f => f.Key).ToList();
        }

        private double CalculateAbpFeatureUtilization(AbpAnalysisResult result)
        {
            var utilizationScores = new[]
            {
                result.ModuleAnalysis.CohesionScore,
                1.0 - result.ModuleAnalysis.CouplingScore, // 耦合度越低越好
                result.ServiceFeatureAnalysis.UtilizationScore,
                result.ExtensibilityAnalysis.ExtensionPoints.Count > 5 ? 0.8 : 0.4 // 扩展点数量评估
            };

            return utilizationScores.Average();
        }

        private void PrintAbpAnalysisSummary(AbpAnalysisResult result)
        {
            Console.WriteLine("\n📊 === ABP框架集成分析摘要 ===");
            Console.WriteLine($"🏗️ ABP模块: {result.ModuleAnalysis.TotalModules} 个");
            Console.WriteLine($"🔧 ABP服务: {result.ServiceFeatureAnalysis.TotalServices} 个");
            Console.WriteLine($"💉 服务注册: {result.DependencyInjectionAnalysis.TotalRegistrations} 个");
            Console.WriteLine($"🔌 扩展点: {result.ExtensibilityAnalysis.ExtensionPoints.Count} 个");
            Console.WriteLine($"📊 ABP特性利用率: {result.FeatureUtilizationScore:F2}/1.0 {GetUtilizationLevel(result.FeatureUtilizationScore)}");
            
            if (result.FeatureUtilizationScore < 0.6)
            {
                Console.WriteLine("⚠️  警告: ABP框架特性利用不足，建议深度集成！");
            }
        }

        private string GetUtilizationLevel(double score)
        {
            return score switch
            {
                >= 0.8 => "🟢 优秀",
                >= 0.6 => "🟡 良好", 
                >= 0.4 => "🟠 一般",
                _ => "🔴 较差"
            };
        }

        // 简化的检测方法
        private bool HasPermissionCheck(ClassDeclarationSyntax cls) => 
            cls.DescendantNodes().OfType<IdentifierNameSyntax>()
               .Any(i => i.Identifier.ValueText.Contains("Permission"));

        private bool HasValidation(ClassDeclarationSyntax cls) => 
            cls.DescendantNodes().OfType<IdentifierNameSyntax>()
               .Any(i => i.Identifier.ValueText.Contains("Valid"));

        private bool HasAuditing(ClassDeclarationSyntax cls) => 
            cls.DescendantNodes().OfType<IdentifierNameSyntax>()
               .Any(i => i.Identifier.ValueText.Contains("Audit"));

        private bool IsServiceRegistration(InvocationExpressionSyntax invocation)
        {
            var memberAccess = invocation.Expression as MemberAccessExpressionSyntax;
            return memberAccess?.Name.Identifier.ValueText.StartsWith("Add") == true;
        }

        private ServiceRegistration ExtractServiceRegistration(InvocationExpressionSyntax invocation, string filePath)
        {
            var memberAccess = invocation.Expression as MemberAccessExpressionSyntax;
            return new ServiceRegistration
            {
                RegistrationMethod = memberAccess?.Name.Identifier.ValueText ?? "Unknown",
                FilePath = filePath,
                ServiceType = "Unknown", // 简化实现
                Lifetime = DetermineLifetime(memberAccess?.Name.Identifier.ValueText ?? "")
            };
        }

        private string DetermineLifetime(string methodName)
        {
            if (methodName.Contains("Transient")) return "Transient";
            if (methodName.Contains("Scoped")) return "Scoped";
            if (methodName.Contains("Singleton")) return "Singleton";
            return "Unknown";
        }

        private double CalculateRegistrationComplexity(List<ServiceRegistration> registrations)
        {
            // 简化：根据注册数量评估复杂度
            return Math.Min(registrations.Count / 50.0, 1.0);
        }

        private bool DetectCircularDependencyRisk(List<ServiceRegistration> registrations)
        {
            // 简化：如果注册数量过多，认为有循环依赖风险
            return registrations.Count > 100;
        }

        private string DetermineExtensionType(string interfaceName)
        {
            if (interfaceName.Contains("Generator")) return "CodeGeneration";
            if (interfaceName.Contains("Provider")) return "DataProvider";
            if (interfaceName.Contains("Handler")) return "EventHandler";
            if (interfaceName.Contains("Strategy")) return "Strategy";
            return "Generic";
        }
    }

    // 数据模型定义
    public class AbpAnalysisResult
    {
        public DateTime AnalysisStartTime { get; set; }
        public DateTime AnalysisEndTime { get; set; }
        public string ProjectPath { get; set; } = string.Empty;
        public bool Success { get; set; }
        public string? ErrorMessage { get; set; }
        
        public ModuleAnalysis ModuleAnalysis { get; set; } = new();
        public ServiceFeatureAnalysis ServiceFeatureAnalysis { get; set; } = new();
        public DependencyInjectionAnalysis DependencyInjectionAnalysis { get; set; } = new();
        public ExtensibilityAnalysis ExtensibilityAnalysis { get; set; } = new();
        public double FeatureUtilizationScore { get; set; }
    }

    public class ModuleAnalysis
    {
        public int TotalModules { get; set; }
        public List<AbpModuleInfo> Modules { get; set; } = new();
        public double CohesionScore { get; set; }
        public double CouplingScore { get; set; }
        public int DependencyDepth { get; set; }
    }

    public class ServiceFeatureAnalysis
    {
        public int TotalServices { get; set; }
        public List<AbpServiceInfo> Services { get; set; } = new();
        public Dictionary<string, int> FeatureUsageStatistics { get; set; } = new();
        public double UtilizationScore { get; set; }
        public List<string> MissingFeatures { get; set; } = new();
    }

    public class DependencyInjectionAnalysis
    {
        public int TotalRegistrations { get; set; }
        public List<ServiceRegistration> ServiceRegistrations { get; set; } = new();
        public List<ConfigureMethodInfo> ConfigureMethods { get; set; } = new();
        public double RegistrationComplexity { get; set; }
        public bool CircularDependencyRisk { get; set; }
    }

    public class ExtensibilityAnalysis
    {
        public List<ExtensionPoint> ExtensionPoints { get; set; } = new();
        public PluginSupportInfo PluginSupport { get; set; } = new();
        public DynamicConfigurationInfo DynamicConfigurationSupport { get; set; } = new();
        public RuntimeServiceInfo RuntimeServiceRegistration { get; set; } = new();
        public HotReloadInfo HotReloadCapabilities { get; set; } = new();
    }

    public class AbpModuleInfo
    {
        public string Name { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public List<string> Dependencies { get; set; } = new();
        public int LineCount { get; set; }
        public bool HasConfigureServices { get; set; }
        public bool HasPreConfigureServices { get; set; }
        public bool HasPostConfigureServices { get; set; }
    }

    public class AbpServiceInfo
    {
        public string Name { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public List<string> BaseTypes { get; set; } = new();
        public List<string> UsedAbpFeatures { get; set; } = new();
        public int MethodCount { get; set; }
        public bool HasAutoApi { get; set; }
        public bool HasPermissionCheck { get; set; }
        public bool HasValidation { get; set; }
        public bool HasAuditing { get; set; }
        public int LineCount { get; set; }
    }

    public class ExtensionPoint
    {
        public string Name { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public int MethodCount { get; set; }
        public List<string> Implementations { get; set; } = new();
        public string ExtensionType { get; set; } = string.Empty;
    }

    public class PluginSupportInfo
    {
        public bool HasPluginInterface { get; set; }
        public bool HasPluginLoader { get; set; }
        public bool HasPluginRegistry { get; set; }
        public List<string> PluginFiles { get; set; } = new();
        public bool PluginSupported { get; set; }
    }

    public class DynamicConfigurationInfo
    {
        public List<string> ConfigurationFiles { get; set; } = new();
        public bool HasOptionsPattern { get; set; }
        public bool HasDynamicConfiguration { get; set; }
        public string ConfigurationComplexity { get; set; } = string.Empty;
    }

    public class RuntimeServiceInfo
    {
        public bool HasRuntimeRegistration { get; set; }
        public List<string> RegistrationMethods { get; set; } = new();
        public bool SupportsConditionalRegistration { get; set; }
    }

    public class HotReloadInfo
    {
        public bool HasHotReloadSupport { get; set; }
        public List<string> HotReloadFiles { get; set; } = new();
        public bool SupportsConfigurationReload { get; set; }
        public bool SupportsCodeReload { get; set; }
    }

    public class ServiceRegistration
    {
        public string RegistrationMethod { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public string ServiceType { get; set; } = string.Empty;
        public string Lifetime { get; set; } = string.Empty;
    }

    public class ConfigureMethodInfo
    {
        public string MethodName { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public int ParameterCount { get; set; }
        public int LineCount { get; set; }
    }
}
