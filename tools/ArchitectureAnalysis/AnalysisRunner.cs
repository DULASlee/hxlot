using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Text.Json;

namespace SmartAbp.Tools.ArchitectureAnalysis
{
    /// <summary>
    /// 🚀 SmartAbp架构分析执行器
    /// 执行3天架构深度分析计划
    /// </summary>
    public class AnalysisRunner
    {
        private readonly string _projectPath;
        private readonly string _outputPath;

        public AnalysisRunner(string projectPath, string? outputPath = null)
        {
            _projectPath = projectPath;
            _outputPath = outputPath ?? Path.Combine(projectPath, "docs", "ArchitectureAnalysis");
            
            // 确保输出目录存在
            Directory.CreateDirectory(_outputPath);
        }

        /// <summary>
        /// 执行第1天分析：元数据模型与代码生成耦合分析
        /// </summary>
        public async Task<bool> ExecuteDay1AnalysisAsync()
        {
            Console.WriteLine("🔥 === 第1天架构分析：元数据模型与代码生成耦合分析 ===");
            Console.WriteLine($"📁 项目路径: {_projectPath}");
            Console.WriteLine($"📄 输出路径: {_outputPath}");
            Console.WriteLine($"⏰ 开始时间: {DateTime.Now:yyyy-MM-dd HH:mm:ss}");
            Console.WriteLine();

            try
            {
                // 1. 元数据模型分析
                var modelAnalyzer = new MetadataModelAnalyzer(_projectPath);
                var modelResult = await modelAnalyzer.AnalyzeAsync();

                if (!modelResult.Success)
                {
                    Console.WriteLine($"❌ 元数据模型分析失败: {modelResult.ErrorMessage}");
                    return false;
                }

                // 2. 生成分析报告
                await GenerateDay1ReportAsync(modelResult);

                // 3. 保存原始数据
                await SaveAnalysisDataAsync("day1-metadata-analysis.json", modelResult);

                Console.WriteLine();
                Console.WriteLine("✅ === 第1天分析完成 ===");
                Console.WriteLine($"📊 总耦合度评分: {modelResult.CouplingAnalysis.OverallCouplingScore:F3}");
                Console.WriteLine($"🔧 发现技术依赖: {modelResult.TechnologyDependencies.Count} 个");
                Console.WriteLine($"📋 扫描模型总数: {modelResult.EntityModels.Count + modelResult.DtoModels.Count + modelResult.ServiceModels.Count} 个");
                
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ 第1天分析执行失败: {ex.Message}");
                Console.WriteLine($"📍 错误详情: {ex.StackTrace}");
                return false;
            }
        }

        /// <summary>
        /// 生成第1天分析报告
        /// </summary>
        private async Task GenerateDay1ReportAsync(MetadataAnalysisResult result)
        {
            Console.WriteLine("📝 生成第1天分析报告...");

            var reportPath = Path.Combine(_outputPath, "第1天-元数据模型耦合分析报告.md");
            
            var report = GenerateMarkdownReport(result);
            await File.WriteAllTextAsync(reportPath, report);

            Console.WriteLine($"📄 报告已生成: {reportPath}");
        }

        /// <summary>
        /// 生成Markdown格式的分析报告
        /// </summary>
        private string GenerateMarkdownReport(MetadataAnalysisResult result)
        {
            var report = $@"# 🔍 SmartAbp低代码引擎架构分析报告 - 第1天

## 📋 执行摘要

**分析时间**: {result.AnalysisStartTime:yyyy-MM-dd HH:mm:ss} - {result.AnalysisEndTime:yyyy-MM-dd HH:mm:ss}  
**分析耗时**: {(result.AnalysisEndTime - result.AnalysisStartTime).TotalMinutes:F1} 分钟  
**项目路径**: {result.ProjectPath}  
**分析状态**: {(result.Success ? "✅ 成功" : "❌ 失败")}

---

## 🎯 核心发现

### 🚨 关键风险指标

| 指标 | 当前值 | 风险等级 | 建议措施 |
|------|--------|----------|----------|
| **总体耦合度** | {result.CouplingAnalysis.OverallCouplingScore:F3} | {GetRiskLevel(result.CouplingAnalysis.OverallCouplingScore)} | {GetCouplingRecommendation(result.CouplingAnalysis.OverallCouplingScore)} |
| **技术栈依赖** | {result.TechnologyDependencies.Count} 个 | {GetTechDependencyRisk(result.TechnologyDependencies.Count)} | 建立抽象层解耦 |
| **硬编码引用** | {result.CouplingAnalysis.HardCodedReferences.Count} 处 | {GetHardCodeRisk(result.CouplingAnalysis.HardCodedReferences.Count)} | 配置化重构 |

---

## 📊 模型统计分析

### 📈 模型分布
- **实体模型**: {result.EntityModels.Count} 个
- **DTO模型**: {result.DtoModels.Count} 个  
- **服务模型**: {result.ServiceModels.Count} 个
- **代码生成器**: {result.GeneratorModels.Count} 个

### 📋 实体模型详情
{GenerateEntityModelTable(result.EntityModels)}

### 📋 DTO模型详情
{GenerateDtoModelTable(result.DtoModels)}

### 📋 服务模型详情
{GenerateServiceModelTable(result.ServiceModels)}

### 📋 代码生成器详情
{GenerateGeneratorModelTable(result.GeneratorModels)}

---

## 🔗 耦合度分析

### 总体耦合度评估
**评分**: {result.CouplingAnalysis.OverallCouplingScore:F3}/1.0 {GetCouplingEmoji(result.CouplingAnalysis.OverallCouplingScore)}

### 耦合类型分布
- **直接依赖耦合**: {result.CouplingAnalysis.DirectDependencies.Count} 处
- **硬编码引用耦合**: {result.CouplingAnalysis.HardCodedReferences.Count} 处  
- **类型系统耦合**: {result.CouplingAnalysis.TypeSystemCoupling:F3}

{GenerateCouplingAnalysisDetail(result.CouplingAnalysis)}

---

## 🔧 技术栈依赖分析

{GenerateTechnologyDependencyAnalysis(result.TechnologyDependencies)}

---

## 🎯 优先级建议

### 🔥 立即处理（高优先级）
{GenerateHighPriorityRecommendations(result)}

### 🟡 计划处理（中优先级）  
{GenerateMediumPriorityRecommendations(result)}

### 🟢 技术债务（低优先级）
{GenerateLowPriorityRecommendations(result)}

---

## 📈 下一步行动

1. **立即启动**: {GetImmediateAction(result)}
2. **第2天重点**: ABP框架集成分析和运行时扩展性评估
3. **风险缓解**: {GetRiskMitigation(result)}

---

*报告生成时间: {DateTime.Now:yyyy-MM-dd HH:mm:ss}*  
*分析工具: SmartAbp架构分析器 v1.0*
";
            return report;
        }

        /// <summary>
        /// 保存分析数据为JSON格式
        /// </summary>
        private async Task SaveAnalysisDataAsync(string fileName, object data)
        {
            var filePath = Path.Combine(_outputPath, fileName);
            var options = new JsonSerializerOptions 
            { 
                WriteIndented = true,
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };
            
            var json = JsonSerializer.Serialize(data, options);
            await File.WriteAllTextAsync(filePath, json);
            
            Console.WriteLine($"💾 数据已保存: {filePath}");
        }

        // 报告生成辅助方法
        private string GetRiskLevel(double score)
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

        private string GetCouplingRecommendation(double score)
        {
            return score switch
            {
                >= 0.8 => "立即重构，引入抽象层",
                >= 0.6 => "优先重构耦合点",
                >= 0.4 => "计划重构，建立边界",
                _ => "保持当前架构"
            };
        }

        private string GetTechDependencyRisk(int count)
        {
            return count switch
            {
                >= 10 => "🔴 高风险",
                >= 6 => "🟡 中风险", 
                >= 3 => "🟢 可接受",
                _ => "✅ 优秀"
            };
        }

        private string GetHardCodeRisk(int count)
        {
            return count switch
            {
                >= 20 => "🔴 严重",
                >= 10 => "🟡 警告",
                >= 5 => "🟠 注意",
                _ => "✅ 良好"
            };
        }

        private string GetCouplingEmoji(double score)
        {
            return score switch
            {
                >= 0.8 => "💀",
                >= 0.6 => "⚠️",
                >= 0.4 => "🟡", 
                >= 0.2 => "🟢",
                _ => "✅"
            };
        }

        private string GenerateEntityModelTable(List<EntityModel> entities)
        {
            if (entities.Count == 0) return "*未发现实体模型*";

            var table = "| 实体名称 | 命名空间 | 属性数量 | 代码行数 | 基类 |\n|----------|----------|----------|----------|------|\n";
            
            foreach (var entity in entities.Take(10)) // 只显示前10个
            {
                table += $"| {entity.Name} | {entity.Namespace} | {entity.Properties.Count} | {entity.LineCount} | {entity.BaseClass ?? "无"} |\n";
            }
            
            if (entities.Count > 10)
            {
                table += $"\n*...还有 {entities.Count - 10} 个实体模型*";
            }
            
            return table;
        }

        private string GenerateDtoModelTable(List<DtoModel> dtos)
        {
            if (dtos.Count == 0) return "*未发现DTO模型*";

            var table = "| DTO名称 | 命名空间 | 用途 | 属性数量 | 代码行数 |\n|---------|----------|------|----------|----------|\n";
            
            foreach (var dto in dtos.Take(10))
            {
                table += $"| {dto.Name} | {dto.Namespace} | {dto.Purpose} | {dto.Properties.Count} | {dto.LineCount} |\n";
            }
            
            if (dtos.Count > 10)
            {
                table += $"\n*...还有 {dtos.Count - 10} 个DTO模型*";
            }
            
            return table;
        }

        private string GenerateServiceModelTable(List<ServiceModel> services)
        {
            if (services.Count == 0) return "*未发现服务模型*";

            var table = "| 服务名称 | 命名空间 | 方法数量 | 接口数量 | 代码行数 |\n|----------|----------|----------|----------|----------|\n";
            
            foreach (var service in services.Take(10))
            {
                table += $"| {service.Name} | {service.Namespace} | {service.Methods.Count} | {service.Interfaces.Count} | {service.LineCount} |\n";
            }
            
            if (services.Count > 10)
            {
                table += $"\n*...还有 {services.Count - 10} 个服务模型*";
            }
            
            return table;
        }

        private string GenerateGeneratorModelTable(List<CodeGeneratorModel> generators)
        {
            if (generators.Count == 0) return "*未发现代码生成器*";

            var table = "| 生成器名称 | 命名空间 | 依赖数量 | 技术引用 | 代码行数 |\n|------------|----------|----------|----------|----------|\n";
            
            foreach (var generator in generators.Take(10))
            {
                table += $"| {generator.Name} | {generator.Namespace} | {generator.Dependencies.Count} | {generator.TechnologyReferences.Count} | {generator.LineCount} |\n";
            }
            
            return table;
        }

        private string GenerateCouplingAnalysisDetail(CouplingAnalysis coupling)
        {
            var detail = "### 🔗 详细耦合分析\n\n";
            
            if (coupling.DirectDependencies.Count > 0)
            {
                detail += "#### 直接依赖关系\n";
                foreach (var dep in coupling.DirectDependencies.Take(5))
                {
                    detail += $"- **{dep.Source}** → **{dep.Target}** ({dep.Type})\n";
                }
                if (coupling.DirectDependencies.Count > 5)
                {
                    detail += $"- *...还有 {coupling.DirectDependencies.Count - 5} 个依赖关系*\n";
                }
                detail += "\n";
            }

            if (coupling.HardCodedReferences.Count > 0)
            {
                detail += "#### 硬编码引用\n";
                foreach (var hardcode in coupling.HardCodedReferences.Take(5))
                {
                    detail += $"- **{Path.GetFileName(hardcode.File)}**:{hardcode.LineNumber} - `{hardcode.Reference}`\n";
                }
                if (coupling.HardCodedReferences.Count > 5)
                {
                    detail += $"- *...还有 {coupling.HardCodedReferences.Count - 5} 个硬编码引用*\n";
                }
            }

            return detail;
        }

        private string GenerateTechnologyDependencyAnalysis(List<TechnologyDependency> dependencies)
        {
            if (dependencies.Count == 0) return "*未发现明显的技术栈依赖*";

            var analysis = "### 📊 技术栈使用统计\n\n";
            analysis += "| 技术栈 | 使用次数 | 耦合程度 | 影响文件数 |\n|--------|----------|----------|------------|\n";

            foreach (var dep in dependencies.OrderByDescending(d => d.UsageCount))
            {
                analysis += $"| {dep.TechnologyName} | {dep.UsageCount} | {dep.CouplingLevel} | {dep.Files.Count} |\n";
            }

            // 分析最高耦合的技术栈
            var highCouplingTech = dependencies.Where(d => d.CouplingLevel == "High").ToList();
            if (highCouplingTech.Count > 0)
            {
                analysis += $"\n⚠️  **高耦合技术栈**: {string.Join(", ", highCouplingTech.Select(t => t.TechnologyName))}\n";
                analysis += "**建议**: 优先对这些技术栈建立抽象层，降低直接依赖。\n";
            }

            return analysis;
        }

        private string GenerateHighPriorityRecommendations(MetadataAnalysisResult result)
        {
            var recommendations = "";
            
            if (result.CouplingAnalysis.OverallCouplingScore >= 0.7)
            {
                recommendations += "1. **🚨 立即解耦代码生成器**: 耦合度过高，建立技术无关的元模型抽象层\n";
            }
            
            var highCouplingTech = result.TechnologyDependencies.Where(d => d.UsageCount > 10).ToList();
            if (highCouplingTech.Count > 0)
            {
                recommendations += $"2. **🔧 技术栈抽象**: 对 {string.Join(", ", highCouplingTech.Select(t => t.TechnologyName))} 建立抽象接口\n";
            }
            
            if (result.CouplingAnalysis.HardCodedReferences.Count > 15)
            {
                recommendations += "3. **⚙️ 配置化改造**: 消除硬编码引用，建立配置管理系统\n";
            }

            return string.IsNullOrEmpty(recommendations) ? "*当前架构相对健康，暂无高优先级问题*" : recommendations;
        }

        private string GenerateMediumPriorityRecommendations(MetadataAnalysisResult result)
        {
            var recommendations = "";
            
            if (result.DtoModels.Count > 50)
            {
                recommendations += "1. **📋 DTO重构**: DTO数量过多，建议按模块拆分和抽象基类\n";
            }
            
            if (result.GeneratorModels.Count > 10)
            {
                recommendations += "2. **🏭 生成器整合**: 代码生成器较多，建议建立统一的生成器框架\n";
            }

            return string.IsNullOrEmpty(recommendations) ? "*暂无中优先级建议*" : recommendations;
        }

        private string GenerateLowPriorityRecommendations(MetadataAnalysisResult result)
        {
            return "1. **📝 文档完善**: 为核心模型和生成器添加详细文档\n" +
                   "2. **🧪 测试覆盖**: 提高代码生成器的单元测试覆盖率\n" +
                   "3. **🔍 代码审查**: 定期审查模型设计的合理性";
        }

        private string GetImmediateAction(MetadataAnalysisResult result)
        {
            if (result.CouplingAnalysis.OverallCouplingScore >= 0.8)
            {
                return "暂停大规模开发，优先解决架构耦合问题";
            }
            else if (result.CouplingAnalysis.OverallCouplingScore >= 0.6)
            {
                return "启动渐进式解耦重构，建立抽象层";
            }
            else
            {
                return "继续执行第2天分析，深入评估ABP集成";
            }
        }

        private string GetRiskMitigation(MetadataAnalysisResult result)
        {
            return result.CouplingAnalysis.OverallCouplingScore >= 0.7 
                ? "建立特性开关，支持新旧架构并行运行"
                : "采用增量重构策略，逐步改善架构质量";
        }

        /// <summary>
        /// 执行第2天分析：ABP框架集成与运行时扩展性分析
        /// </summary>
        public async Task<bool> ExecuteDay2AnalysisAsync()
        {
            Console.WriteLine("🔥 === 第2天架构分析：ABP框架集成与运行时扩展性分析 ===");
            Console.WriteLine($"📁 项目路径: {_projectPath}");
            Console.WriteLine($"📄 输出路径: {_outputPath}");
            Console.WriteLine($"⏰ 开始时间: {DateTime.Now:yyyy-MM-dd HH:mm:ss}");
            Console.WriteLine();

            try
            {
                // 1. ABP框架集成分析
                var abpAnalyzer = new AbpFrameworkAnalyzer(_projectPath);
                var abpResult = await abpAnalyzer.AnalyzeAbpIntegrationAsync();

                if (!abpResult.Success)
                {
                    Console.WriteLine($"❌ ABP框架分析失败: {abpResult.ErrorMessage}");
                    return false;
                }

                // 2. 生成第2天分析报告
                await GenerateDay2ReportAsync(abpResult);

                // 3. 保存原始数据
                await SaveAnalysisDataAsync("day2-abp-analysis.json", abpResult);

                Console.WriteLine();
                Console.WriteLine("✅ === 第2天分析完成 ===");
                Console.WriteLine($"📊 ABP特性利用率: {abpResult.FeatureUtilizationScore:F3}");
                Console.WriteLine($"🏗️ ABP模块数量: {abpResult.ModuleAnalysis.TotalModules}");
                Console.WriteLine($"🔌 扩展点数量: {abpResult.ExtensibilityAnalysis.ExtensionPoints.Count}");
                
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ 第2天分析执行失败: {ex.Message}");
                Console.WriteLine($"📍 错误详情: {ex.StackTrace}");
                return false;
            }
        }

        /// <summary>
        /// 生成第2天分析报告
        /// </summary>
        private async Task GenerateDay2ReportAsync(AbpAnalysisResult result)
        {
            Console.WriteLine("📝 生成第2天分析报告...");

            var reportPath = Path.Combine(_outputPath, "第2天-ABP框架集成分析报告.md");
            
            var report = GenerateAbpAnalysisReport(result);
            await File.WriteAllTextAsync(reportPath, report);

            Console.WriteLine($"📄 报告已生成: {reportPath}");
        }

        /// <summary>
        /// 生成ABP分析报告
        /// </summary>
        private string GenerateAbpAnalysisReport(AbpAnalysisResult result)
        {
            var report = $@"# 🏗️ SmartAbp ABP框架集成分析报告 - 第2天

## 📋 执行摘要

**分析时间**: {result.AnalysisStartTime:yyyy-MM-dd HH:mm:ss} - {result.AnalysisEndTime:yyyy-MM-dd HH:mm:ss}  
**分析耗时**: {(result.AnalysisEndTime - result.AnalysisStartTime).TotalMinutes:F1} 分钟  
**项目路径**: {result.ProjectPath}  
**分析状态**: {(result.Success ? "✅ 成功" : "❌ 失败")}

---

## 🎯 核心发现

### 🚨 ABP框架集成评估

| 指标 | 当前值 | 评估等级 | 建议措施 |
|------|--------|----------|----------|
| **ABP特性利用率** | {result.FeatureUtilizationScore:F3} | {GetAbpUtilizationLevel(result.FeatureUtilizationScore)} | {GetAbpUtilizationRecommendation(result.FeatureUtilizationScore)} |
| **模块内聚性** | {result.ModuleAnalysis.CohesionScore:F3} | {GetCohesionLevel(result.ModuleAnalysis.CohesionScore)} | 优化模块职责边界 |
| **模块耦合度** | {result.ModuleAnalysis.CouplingScore:F3} | {GetCouplingLevel(result.ModuleAnalysis.CouplingScore)} | 减少模块间依赖 |
| **扩展点质量** | {result.ExtensibilityAnalysis.ExtensionPoints.Count} 个 | {GetExtensionPointLevel(result.ExtensibilityAnalysis.ExtensionPoints.Count)} | 增强插件化架构 |

---

## 🏗️ ABP模块架构分析

### 📊 模块统计
- **总模块数**: {result.ModuleAnalysis.TotalModules} 个
- **内聚性评分**: {result.ModuleAnalysis.CohesionScore:F3}/1.0
- **耦合度评分**: {result.ModuleAnalysis.CouplingScore:F3}/1.0
- **依赖深度**: {result.ModuleAnalysis.DependencyDepth} 层

{GenerateModuleDetailsTable(result.ModuleAnalysis.Modules)}

---

## 🔧 ABP服务特性分析

### 📈 服务统计
- **总服务数**: {result.ServiceFeatureAnalysis.TotalServices} 个
- **特性利用率**: {result.ServiceFeatureAnalysis.UtilizationScore:F3}/1.0

### 📊 ABP特性使用分布
{GenerateFeatureUsageTable(result.ServiceFeatureAnalysis.FeatureUsageStatistics)}

### ⚠️ 缺失的ABP特性
{GenerateMissingFeaturesSection(result.ServiceFeatureAnalysis.MissingFeatures)}

---

## 💉 依赖注入分析

### 📊 DI配置统计
- **服务注册总数**: {result.DependencyInjectionAnalysis.TotalRegistrations} 个
- **配置方法数量**: {result.DependencyInjectionAnalysis.ConfigureMethods.Count} 个
- **注册复杂度**: {result.DependencyInjectionAnalysis.RegistrationComplexity:F3}/1.0
- **循环依赖风险**: {(result.DependencyInjectionAnalysis.CircularDependencyRisk ? "🔴 存在" : "✅ 无")}

---

## 🔌 运行时扩展性分析

### 📊 扩展性评估
- **扩展点数量**: {result.ExtensibilityAnalysis.ExtensionPoints.Count} 个
- **插件化支持**: {(result.ExtensibilityAnalysis.PluginSupport.PluginSupported ? "✅ 支持" : "❌ 不支持")}
- **动态配置**: {(result.ExtensibilityAnalysis.DynamicConfigurationSupport.HasDynamicConfiguration ? "✅ 支持" : "❌ 不支持")}
- **运行时注册**: {(result.ExtensibilityAnalysis.RuntimeServiceRegistration.HasRuntimeRegistration ? "✅ 支持" : "❌ 不支持")}
- **热重载能力**: {(result.ExtensibilityAnalysis.HotReloadCapabilities.HasHotReloadSupport ? "✅ 支持" : "❌ 不支持")}

{GenerateExtensionPointsTable(result.ExtensibilityAnalysis.ExtensionPoints)}

---

## 🎯 关键问题识别

### 🔥 严重问题
{GenerateCriticalIssues(result)}

### 🟡 改进机会
{GenerateImprovementOpportunities(result)}

---

## 📈 下一步行动

1. **立即优化**: {GetImmediateAbpAction(result)}
2. **第3天重点**: 架构决策制定和最终重构路线图
3. **风险控制**: {GetAbpRiskMitigation(result)}

---

*报告生成时间: {DateTime.Now:yyyy-MM-dd HH:mm:ss}*  
*分析工具: SmartAbp ABP框架分析器 v1.0*
";
            return report;
        }

        // 报告生成辅助方法
        private string GetAbpUtilizationLevel(double score)
        {
            return score switch
            {
                >= 0.8 => "🟢 优秀",
                >= 0.6 => "🟡 良好",
                >= 0.4 => "🟠 一般",
                _ => "🔴 较差"
            };
        }

        private string GetAbpUtilizationRecommendation(double score)
        {
            return score switch
            {
                >= 0.8 => "保持当前ABP特性使用水平",
                >= 0.6 => "增强ABP高级特性使用",
                >= 0.4 => "全面集成ABP核心特性",
                _ => "立即重构，深度集成ABP框架"
            };
        }

        private string GetCohesionLevel(double score)
        {
            return score switch
            {
                >= 0.8 => "🟢 优秀",
                >= 0.6 => "🟡 良好",
                >= 0.4 => "🟠 一般",
                _ => "🔴 较差"
            };
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

        private string GetExtensionPointLevel(int count)
        {
            return count switch
            {
                >= 10 => "🟢 丰富",
                >= 5 => "🟡 适中",
                >= 2 => "🟠 基础",
                _ => "🔴 缺失"
            };
        }

        private string GenerateModuleDetailsTable(List<AbpModuleInfo> modules)
        {
            if (modules.Count == 0) return "*未发现ABP模块*";

            var table = "| 模块名称 | 依赖数量 | 配置方法 | 代码行数 |\n|----------|----------|----------|----------|\n";
            
            foreach (var module in modules.Take(10))
            {
                var configMethods = new List<string>();
                if (module.HasConfigureServices) configMethods.Add("Configure");
                if (module.HasPreConfigureServices) configMethods.Add("Pre");
                if (module.HasPostConfigureServices) configMethods.Add("Post");
                
                table += $"| {module.Name} | {module.Dependencies.Count} | {string.Join(",", configMethods)} | {module.LineCount} |\n";
            }
            
            return table;
        }

        private string GenerateFeatureUsageTable(Dictionary<string, int> features)
        {
            var table = "| ABP特性 | 使用次数 | 利用状态 |\n|---------|----------|----------|\n";
            
            foreach (var feature in features.OrderByDescending(f => f.Value))
            {
                var status = feature.Value > 0 ? "✅ 使用中" : "❌ 未使用";
                table += $"| {feature.Key} | {feature.Value} | {status} |\n";
            }
            
            return table;
        }

        private string GenerateMissingFeaturesSection(List<string> missingFeatures)
        {
            if (missingFeatures.Count == 0) return "✅ 所有ABP特性都有使用";
            
            var section = "以下ABP特性尚未使用，建议考虑集成：\n\n";
            foreach (var feature in missingFeatures)
            {
                section += $"- **{feature}**: {GetFeatureDescription(feature)}\n";
            }
            
            return section;
        }

        private string GenerateExtensionPointsTable(List<ExtensionPoint> extensionPoints)
        {
            if (extensionPoints.Count == 0) return "*未发现明显的扩展点*";

            var table = "| 扩展点名称 | 类型 | 方法数量 | 实现数量 |\n|------------|------|----------|----------|\n";
            
            foreach (var ep in extensionPoints.Take(10))
            {
                table += $"| {ep.Name} | {ep.ExtensionType} | {ep.MethodCount} | {ep.Implementations.Count} |\n";
            }
            
            return table;
        }

        private string GenerateCriticalIssues(AbpAnalysisResult result)
        {
            var issues = new List<string>();
            
            if (result.FeatureUtilizationScore < 0.5)
            {
                issues.Add("1. **🚨 ABP特性利用严重不足**: 大量ABP框架能力未使用，存在重复造轮子风险");
            }
            
            if (result.ModuleAnalysis.CouplingScore > 0.7)
            {
                issues.Add("2. **🔗 模块耦合度过高**: 模块间依赖复杂，违反低耦合原则");
            }
            
            if (result.ExtensibilityAnalysis.ExtensionPoints.Count < 5)
            {
                issues.Add("3. **🔌 扩展性不足**: 扩展点设计缺失，无法支持灵活的业务定制");
            }
            
            return issues.Count > 0 ? string.Join("\n", issues) : "*未发现严重问题*";
        }

        private string GenerateImprovementOpportunities(AbpAnalysisResult result)
        {
            var opportunities = new List<string>();
            
            if (result.ServiceFeatureAnalysis.MissingFeatures.Count > 0)
            {
                opportunities.Add($"1. **集成缺失的ABP特性**: {string.Join(", ", result.ServiceFeatureAnalysis.MissingFeatures.Take(3))}等");
            }
            
            if (!result.ExtensibilityAnalysis.PluginSupport.PluginSupported)
            {
                opportunities.Add("2. **建立插件化架构**: 支持第三方扩展和业务定制");
            }
            
            if (result.DependencyInjectionAnalysis.RegistrationComplexity > 0.7)
            {
                opportunities.Add("3. **简化DI配置**: 使用ABP的自动注册特性减少手动配置");
            }
            
            return opportunities.Count > 0 ? string.Join("\n", opportunities) : "*架构相对优秀*";
        }

        private string GetImmediateAbpAction(AbpAnalysisResult result)
        {
            if (result.FeatureUtilizationScore < 0.4)
            {
                return "立即启动ABP特性集成计划，停止重复造轮子";
            }
            else if (result.ExtensibilityAnalysis.ExtensionPoints.Count < 3)
            {
                return "优先设计扩展点架构，支持低代码引擎的灵活扩展";
            }
            else
            {
                return "继续第3天分析，制定最终重构路线图";
            }
        }

        private string GetAbpRiskMitigation(AbpAnalysisResult result)
        {
            return result.ModuleAnalysis.CouplingScore > 0.7 
                ? "建立模块解耦策略，采用事件驱动架构"
                : "保持当前架构，渐进式增强ABP特性使用";
        }

        private string GetFeatureDescription(string feature)
        {
            return feature switch
            {
                "RemoteService" => "自动API生成，减少Controller重复代码",
                "EventHandler" => "事件驱动架构，解耦业务逻辑",
                "BackgroundJob" => "后台任务处理，支持异步操作",
                "IRepository" => "仓储模式，标准化数据访问",
                "AutoMapperProfile" => "对象映射，减少手动转换代码",
                _ => "提升代码质量和开发效率"
            };
        }
    }
}
