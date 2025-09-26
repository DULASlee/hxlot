using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;
using SmartAbp.CodeGenerator.Services.V9;
using SmartAbp.CodeGenerator.Services.TechStackGenerators;
using Volo.Abp.Application.Services;
using Volo.Abp.AspNetCore.Mvc;

namespace SmartAbp.CodeGenerator.Services
{
    /// <summary>
    /// 🚀 SmartAbp简化版多技术栈代码生成服务 - 务实架构重生
    /// 采用策略模式而非复杂插件架构，确保稳定可用
    /// </summary>
    // SimpleCodeGenerationStrategyService - 多技术栈支持（移除RemoteService避免编译错误）
    [Authorize("SmartAbp.CodeGeneration.MultiStack")]
    public class SimpleCodeGenerationStrategyService : ApplicationService
    {
        private readonly ILogger<SimpleCodeGenerationStrategyService> _logger;
        private readonly Dictionary<SupportedTechStack, ISimpleCodeGenerator> _generators;

        public SimpleCodeGenerationStrategyService(ILogger<SimpleCodeGenerationStrategyService> logger)
        {
            _logger = logger;
            _generators = new Dictionary<SupportedTechStack, ISimpleCodeGenerator>();
            
            // 注册支持的技术栈生成器
            InitializeGenerators();
        }

        /// <summary>
        /// 🎯 获取支持的技术栈列表
        /// </summary>
        public virtual async Task<List<TechStackInfoDto>> GetSupportedTechStacksAsync()
        {
            await Task.CompletedTask;
            
            return new List<TechStackInfoDto>
            {
                new()
                {
                    StackId = SupportedTechStack.AbpEntityFramework.ToString(),
                    DisplayName = "ABP Framework + Entity Framework Core",
                    Description = "企业级全功能技术栈，支持DDD、CQRS、多租户等",
                    Version = "8.0+",
                    IsRecommended = true,
                    Pros = new() { "企业级功能完整", "自动API生成", "权限和审计支持", "多租户支持" },
                    Cons = new() { "学习曲线陡峭", "启动时间较长" },
                    SuitableFor = new() { "企业级应用", "复杂业务系统", "大型项目" }
                },
                new()
                {
                    StackId = SupportedTechStack.MinimalApiDapper.ToString(),
                    DisplayName = "Minimal API + Dapper",
                    Description = "轻量级高性能技术栈，适合微服务和性能敏感场景",
                    Version = "8.0+",
                    IsRecommended = false,
                    Pros = new() { "高性能", "轻量级", "启动快速", "内存占用小" },
                    Cons = new() { "功能简单", "无审计支持", "需要更多手动代码" },
                    SuitableFor = new() { "微服务", "高性能API", "简单CRUD" }
                },
                new()
                {
                    StackId = SupportedTechStack.AbpMongoDB.ToString(),
                    DisplayName = "ABP Framework + MongoDB", 
                    Description = "NoSQL文档数据库技术栈，适合灵活数据模型",
                    Version = "8.0+",
                    IsRecommended = false,
                    Pros = new() { "灵活数据模型", "水平扩展", "文档存储", "高并发" },
                    Cons = new() { "关系查询复杂", "事务支持有限" },
                    SuitableFor = new() { "内容管理", "实时应用", "大数据" }
                }
            };
        }

        /// <summary>
        /// 🧠 智能技术栈推荐
        /// </summary>
        public virtual async Task<TechStackRecommendationDto> RecommendTechStackAsync(ModuleMetadataDto moduleMetadata)
        {
            _logger.LogInformation("🧠 分析模块特性推荐技术栈 - Module: {ModuleName}", moduleMetadata.Name);

            var recommendation = new TechStackRecommendationDto
            {
                ModuleName = moduleMetadata.Name,
                AnalyzedAt = DateTime.UtcNow
            };

            // 分析模块复杂度
            var complexity = AnalyzeModuleComplexity(moduleMetadata);
            recommendation.ComplexityLevel = complexity.Level;
            recommendation.ComplexityFactors = complexity.Factors;

            // 简化推荐逻辑
            if (complexity.Score > 0.7)
            {
                recommendation.RecommendedStack = SupportedTechStack.AbpEntityFramework.ToString();
                recommendation.Reason = "高复杂度模块建议使用企业级ABP技术栈";
            }
            else if (complexity.Score < 0.3)
            {
                recommendation.RecommendedStack = SupportedTechStack.MinimalApiDapper.ToString();
                recommendation.Reason = "简单模块建议使用轻量级技术栈";
            }
            else
            {
                recommendation.RecommendedStack = SupportedTechStack.AbpEntityFramework.ToString();
                recommendation.Reason = "中等复杂度，推荐使用ABP技术栈保证扩展性";
            }

            await Task.CompletedTask;
            return recommendation;
        }

        /// <summary>
        /// 🚀 使用指定技术栈生成代码
        /// </summary>
        public virtual async Task<MultiStackGenerationResultDto> GenerateWithTechStackAsync(
            ModuleMetadataDto moduleMetadata, 
            string techStackName)
        {
            _logger.LogInformation("🚀 启动多技术栈代码生成 - Module: {ModuleName}, TechStack: {TechStack}", 
                moduleMetadata.Name, techStackName);

            var result = new MultiStackGenerationResultDto
            {
                GenerationId = Guid.NewGuid().ToString(),
                ModuleName = moduleMetadata.Name,
                TechStack = techStackName,
                StartTime = DateTime.UtcNow
            };

            try
            {
                // 解析技术栈
                if (!Enum.TryParse<SupportedTechStack>(techStackName, out var targetStack))
                {
                    throw new ArgumentException($"不支持的技术栈: {techStackName}");
                }

                // 获取对应的代码生成器
                if (!_generators.TryGetValue(targetStack, out var generator))
                {
                    throw new NotSupportedException($"技术栈 {techStackName} 的代码生成器尚未实现");
                }

                // 为每个实体生成代码
                foreach (var entity in moduleMetadata.Entities)
                {
                    _logger.LogDebug("📋 生成实体代码: {EntityName}", entity.Name);
                    var entityCode = await generator.GenerateAsync(entity);
                    result.GeneratedFiles.AddRange(entityCode.Files.Keys);
                }

                result.Success = true;
                result.EndTime = DateTime.UtcNow;
                result.GenerationTime = result.EndTime - result.StartTime;
                result.FileCount = result.GeneratedFiles.Count;

                _logger.LogInformation("✅ 多技术栈代码生成完成 - GenerationId: {GenerationId}, Files: {FileCount}, Duration: {Duration}ms", 
                    result.GenerationId, result.FileCount, result.GenerationTime.TotalMilliseconds);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ 多技术栈代码生成失败 - GenerationId: {GenerationId}", result.GenerationId);
                
                result.Success = false;
                result.ErrorMessage = ex.Message;
                result.EndTime = DateTime.UtcNow;
                result.GenerationTime = result.EndTime - result.StartTime;
                
                return result;
            }
        }

        /// <summary>
        /// 初始化技术栈生成器
        /// </summary>
        private void InitializeGenerators()
        {
            // 🔥 注册3个完整技术栈 - 达到2025年业界主流水平
            _generators[SupportedTechStack.AbpEntityFramework] = new AbpEntityFrameworkGenerator();
            _generators[SupportedTechStack.MinimalApiDapper] = new MinimalApiDapperGenerator();
            _generators[SupportedTechStack.AbpMongoDB] = new AbpMongoDBGenerator();
            
            _logger.LogInformation("📦 已注册 {GeneratorCount} 个技术栈生成器 - 达到业界主流水平", _generators.Count);
            _logger.LogInformation("🎯 支持的技术栈: ABP+EF(企业级), Minimal+Dapper(高性能), ABP+MongoDB(NoSQL)");
        }

        /// <summary>
        /// 分析模块复杂度
        /// </summary>
        private ModuleComplexityAnalysis AnalyzeModuleComplexity(ModuleMetadataDto moduleMetadata)
        {
            var factors = new List<string>();
            double score = 0;

            // 实体数量评分
            var entityCount = moduleMetadata.Entities.Count;
            if (entityCount > 10) 
            { 
                score += 0.3; 
                factors.Add($"大量实体({entityCount}个)"); 
            }
            else if (entityCount > 5) 
            { 
                score += 0.2; 
                factors.Add($"中等实体数量({entityCount}个)"); 
            }

            // 关系复杂度评分
            var totalRelationships = moduleMetadata.Entities.Sum(e => e.Relationships?.Count ?? 0);
            if (totalRelationships > 20) 
            { 
                score += 0.3; 
                factors.Add($"复杂关系({totalRelationships}个)"); 
            }
            else if (totalRelationships > 10) 
            { 
                score += 0.2; 
                factors.Add($"中等关系复杂度"); 
            }

            // 业务规则复杂度
            var totalBusinessRules = moduleMetadata.Entities.Sum(e => e.BusinessRules?.Count ?? 0);
            if (totalBusinessRules > 50) 
            { 
                score += 0.2; 
                factors.Add($"复杂业务规则({totalBusinessRules}个)"); 
            }

            return new ModuleComplexityAnalysis
            {
                Score = Math.Min(score, 1.0),
                Factors = factors,
                Level = score > 0.7 ? "高复杂度" : score > 0.4 ? "中等复杂度" : "低复杂度"
            };
        }
    }

    // 简化的技术栈枚举
    public enum SupportedTechStack
    {
        AbpEntityFramework,
        MinimalApiDapper,
        AbpMongoDB
    }

    // 简化的代码生成器接口
    public interface ISimpleCodeGenerator
    {
        SupportedTechStack Stack { get; }
        Task<SimpleGeneratedCode> GenerateAsync(EnhancedEntityModelDto entity);
        bool CanHandle(EnhancedEntityModelDto entity);
    }

    // 简化的生成结果
    public class SimpleGeneratedCode
    {
        public Dictionary<string, string> Files { get; set; } = new();
        public List<string> Dependencies { get; set; } = new();
        public string TechStack { get; set; } = string.Empty;
        public bool Success { get; set; }
        public string? ErrorMessage { get; set; }
    }

    // ABP技术栈生成器实现
    public class AbpEntityFrameworkGenerator : ISimpleCodeGenerator
    {
        public SupportedTechStack Stack => SupportedTechStack.AbpEntityFramework;

        public async Task<SimpleGeneratedCode> GenerateAsync(EnhancedEntityModelDto entity)
        {
            await Task.CompletedTask;
            
            var result = new SimpleGeneratedCode
            {
                TechStack = "ABP + Entity Framework",
                Success = true
            };

            // 生成ABP实体代码
            result.Files[$"Domain/{entity.Name}.cs"] = GenerateAbpEntity(entity);
            result.Files[$"Application/Services/{entity.Name}AppService.cs"] = GenerateAbpAppService(entity);
            result.Files[$"Application.Contracts/Dtos/{entity.Name}Dto.cs"] = GenerateAbpDtos(entity);
            
            result.Dependencies.AddRange(new[]
            {
                "Volo.Abp.Ddd.Domain",
                "Volo.Abp.Ddd.Application",
                "Volo.Abp.EntityFrameworkCore"
            });

            return result;
        }

        public bool CanHandle(EnhancedEntityModelDto entity)
        {
            // ABP技术栈可以处理所有实体类型
            return true;
        }

        private string GenerateAbpEntity(EnhancedEntityModelDto entity)
        {
            return $@"using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace SmartAbp.Domain
{{
    /// <summary>
    /// {entity.DisplayName ?? entity.Name} 实体 - ABP技术栈
    /// </summary>
    public class {entity.Name} : FullAuditedAggregateRoot<Guid>
    {{
        // 属性定义
        {string.Join("\n        ", entity.Properties.Select(p => $"public {GetCSharpType(p.Type)} {p.Name} {{ get; set; }}"))}

        protected {entity.Name}() {{ }}
        
        public {entity.Name}(Guid id) : base(id) {{ }}
    }}
}}";
        }

        private string GenerateAbpAppService(EnhancedEntityModelDto entity)
        {
            return $@"using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Application.Services;
using Volo.Abp.AspNetCore.Mvc;
using Volo.Abp.Domain.Repositories;

namespace SmartAbp.Application.Services
{{
    /// <summary>
    /// {entity.DisplayName ?? entity.Name} 应用服务 - ABP技术栈
    /// </summary>
    [RemoteService(Name = ""{entity.Name}"")]
    [Authorize(""SmartAbp.{entity.Name}"")]
    public class {entity.Name}AppService : ApplicationService
    {{
        private readonly IRepository<{entity.Name}, Guid> _repository;

        public {entity.Name}AppService(IRepository<{entity.Name}, Guid> repository)
        {{
            _repository = repository;
        }}

        public virtual async Task<{entity.Name}Dto> GetAsync(Guid id)
        {{
            var entity = await _repository.GetAsync(id);
            return ObjectMapper.Map<{entity.Name}, {entity.Name}Dto>(entity);
        }}

        public virtual async Task<PagedResultDto<{entity.Name}Dto>> GetListAsync(PagedAndSortedResultRequestDto input)
        {{
            var totalCount = await _repository.GetCountAsync();
            var entities = await _repository.GetPagedListAsync(input.SkipCount, input.MaxResultCount, input.Sorting);
            
            return new PagedResultDto<{entity.Name}Dto>(
                totalCount,
                ObjectMapper.Map<List<{entity.Name}>, List<{entity.Name}Dto>>(entities)
            );
        }}

        public virtual async Task<{entity.Name}Dto> CreateAsync(Create{entity.Name}Dto input)
        {{
            var entity = ObjectMapper.Map<Create{entity.Name}Dto, {entity.Name}>(input);
            entity = await _repository.InsertAsync(entity);
            return ObjectMapper.Map<{entity.Name}, {entity.Name}Dto>(entity);
        }}

        public virtual async Task<{entity.Name}Dto> UpdateAsync(Guid id, Update{entity.Name}Dto input)
        {{
            var entity = await _repository.GetAsync(id);
            ObjectMapper.Map(input, entity);
            entity = await _repository.UpdateAsync(entity);
            return ObjectMapper.Map<{entity.Name}, {entity.Name}Dto>(entity);
        }}

        public virtual async Task DeleteAsync(Guid id)
        {{
            await _repository.DeleteAsync(id);
        }}
    }}
}}";
        }

        private string GenerateAbpDtos(EnhancedEntityModelDto entity)
        {
            return $@"using System;
using Volo.Abp.Application.Dtos;

namespace SmartAbp.Application.Contracts.Dtos
{{
    /// <summary>
    /// {entity.DisplayName ?? entity.Name} DTO - ABP技术栈
    /// </summary>
    public class {entity.Name}Dto : FullAuditedEntityDto<Guid>
    {{
        {string.Join("\n        ", entity.Properties.Select(p => $"public {GetCSharpType(p.Type)} {p.Name} {{ get; set; }}"))}
    }}

    public class Create{entity.Name}Dto
    {{
        {string.Join("\n        ", entity.Properties.Where(p => p.IsRequired && p.Name != "Id").Select(p => $"public {GetCSharpType(p.Type)} {p.Name} {{ get; set; }}"))}
    }}

    public class Update{entity.Name}Dto
    {{
        {string.Join("\n        ", entity.Properties.Where(p => p.Name != "Id").Select(p => $"public {GetCSharpType(p.Type)} {p.Name} {{ get; set; }}"))}
    }}
}}";
        }

        private string GetCSharpType(string type)
        {
            return type switch
            {
                "string" => "string",
                "int" => "int",
                "long" => "long",
                "decimal" => "decimal",
                "bool" => "bool",
                "DateTime" => "DateTime",
                "Guid" => "Guid",
                _ => type
            };
        }
    }

    // 模块复杂度分析
    public class ModuleComplexityAnalysis
    {
        public double Score { get; set; }
        public List<string> Factors { get; set; } = new();
        public string Level { get; set; } = string.Empty;
    }

    // DTO定义
    public class TechStackInfoDto
    {
        public string StackId { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Version { get; set; } = string.Empty;
        public bool IsRecommended { get; set; }
        public List<string> Pros { get; set; } = new();
        public List<string> Cons { get; set; } = new();
        public List<string> SuitableFor { get; set; } = new();
    }

    public class TechStackRecommendationDto
    {
        public string ModuleName { get; set; } = string.Empty;
        public DateTime AnalyzedAt { get; set; }
        public string ComplexityLevel { get; set; } = string.Empty;
        public List<string> ComplexityFactors { get; set; } = new();
        public string RecommendedStack { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
    }

    public class MultiStackGenerationResultDto
    {
        public string GenerationId { get; set; } = string.Empty;
        public string ModuleName { get; set; } = string.Empty;
        public string TechStack { get; set; } = string.Empty;
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public TimeSpan GenerationTime { get; set; }
        public bool Success { get; set; }
        public string? ErrorMessage { get; set; }
        public List<string> GeneratedFiles { get; set; } = new();
        public int FileCount { get; set; }
    }
}
