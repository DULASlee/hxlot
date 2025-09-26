using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SmartAbp.CodeGenerator.Services.V9;

namespace SmartAbp.CodeGenerator.Services.TechStackGenerators
{
    /// <summary>
    /// 🗄️ ABP Framework + MongoDB 技术栈生成器
    /// 为灵活数据模型提供NoSQL文档数据库支持
    /// </summary>
    public class AbpMongoDBGenerator : ISimpleCodeGenerator
    {
        public SupportedTechStack Stack => SupportedTechStack.AbpMongoDB;

        public async Task<SimpleGeneratedCode> GenerateAsync(EnhancedEntityModelDto entity)
        {
            await Task.CompletedTask;
            
            var result = new SimpleGeneratedCode
            {
                TechStack = "ABP Framework + MongoDB",
                Success = true
            };

            // 生成MongoDB文档实体
            result.Files[$"Domain/{entity.Name}.cs"] = GenerateMongoEntity(entity);
            
            // 生成MongoDB仓储
            result.Files[$"MongoDB/Repositories/{entity.Name}MongoRepository.cs"] = GenerateMongoRepository(entity);
            
            // 生成ABP应用服务（支持MongoDB）
            result.Files[$"Application/Services/{entity.Name}AppService.cs"] = GenerateMongoAppService(entity);
            
            // 生成MongoDB配置
            result.Files[$"MongoDB/{entity.Name}MongoDbContext.cs"] = GenerateMongoDbContext(entity);
            
            result.Dependencies.AddRange(new[]
            {
                "Volo.Abp.MongoDB",
                "MongoDB.Driver",
                "Volo.Abp.Ddd.Application",
                "Volo.Abp.AspNetCore.Mvc"
            });

            return result;
        }

        public bool CanHandle(EnhancedEntityModelDto entity)
        {
            // MongoDB适合有灵活字段或嵌套结构的实体
            var hasFlexibleFields = entity.Properties.Any(p => 
                p.Type.Contains("Json") || p.Type.Contains("Dynamic") || p.Type.Contains("Object"));
            
            var hasComplexNesting = entity.Relationships?.Any(r => r.Type == "Embedded") == true;
            
            return hasFlexibleFields || hasComplexNesting || entity.Properties.Count > 20;
        }

        private string GenerateMongoEntity(EnhancedEntityModelDto entity)
        {
            return $@"using System;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Volo.Abp.Domain.Entities;
using Volo.Abp.Domain.Entities.Auditing;

namespace SmartAbp.Domain
{{
    /// <summary>
    /// {entity.DisplayName ?? entity.Name} MongoDB文档实体
    /// 支持灵活的文档结构和嵌套数据
    /// </summary>
    public class {entity.Name} : FullAuditedAggregateRoot<Guid>
    {{
        [BsonId]
        [BsonRepresentation(BsonType.String)]
        public override Guid Id {{ get; set; }}

{GenerateMongoProperties(entity)}

        protected {entity.Name}() {{ }}

        public {entity.Name}(Guid id{GenerateMongoConstructorParams(entity)}) : base(id)
        {{
{GenerateMongoConstructorBody(entity)}
        }}

        // MongoDB特有的查询方法
        public BsonDocument ToBsonDocument()
        {{
            return this.ToBsonDocument();
        }}

        public static {entity.Name} FromBsonDocument(BsonDocument document)
        {{
            return BsonSerializer.Deserialize<{entity.Name}>(document);
        }}
    }}
}}";
        }

        private string GenerateMongoRepository(EnhancedEntityModelDto entity)
        {
            return $@"using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MongoDB.Driver;
using MongoDB.Driver.Linq;
using Volo.Abp.Domain.Repositories.MongoDB;
using Volo.Abp.MongoDB;

namespace SmartAbp.MongoDB.Repositories
{{
    /// <summary>
    /// {entity.DisplayName ?? entity.Name} MongoDB仓储
    /// 提供高性能的文档数据库操作
    /// </summary>
    public interface I{entity.Name}MongoRepository : IMongoDbRepository<{entity.Name}, Guid>
    {{
        Task<List<{entity.Name}>> GetByNameAsync(string name, CancellationToken cancellationToken = default);
        Task<List<{entity.Name}>> SearchAsync(string keyword, CancellationToken cancellationToken = default);
        Task<long> GetCountByConditionAsync(FilterDefinition<{entity.Name}> filter, CancellationToken cancellationToken = default);
    }}

    public class {entity.Name}MongoRepository : MongoDbRepository<{entity.Name}DbContext, {entity.Name}, Guid>, I{entity.Name}MongoRepository
    {{
        public {entity.Name}MongoRepository(IMongoDbContextProvider<{entity.Name}DbContext> dbContextProvider)
            : base(dbContextProvider)
        {{
        }}

        public async Task<List<{entity.Name}>> GetByNameAsync(string name, CancellationToken cancellationToken = default)
        {{
            var queryable = await GetMongoQueryableAsync(cancellationToken);
            return await queryable
                .Where(x => x.Name != null && x.Name.Contains(name))
                .ToListAsync(cancellationToken);
        }}

        public async Task<List<{entity.Name}>> SearchAsync(string keyword, CancellationToken cancellationToken = default)
        {{
            var collection = await GetCollectionAsync(cancellationToken);
            
            // MongoDB文本搜索
            var filter = Builders<{entity.Name}>.Filter.Text(keyword);
            return await collection.Find(filter).ToListAsync(cancellationToken);
        }}

        public async Task<long> GetCountByConditionAsync(FilterDefinition<{entity.Name}> filter, CancellationToken cancellationToken = default)
        {{
            var collection = await GetCollectionAsync(cancellationToken);
            return await collection.CountDocumentsAsync(filter, cancellationToken: cancellationToken);
        }}
    }}
}}";
        }

        private string GenerateMongoAppService(EnhancedEntityModelDto entity)
        {
            return $@"using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Application.Services;
using Volo.Abp.Application.Dtos;

namespace SmartAbp.Application.Services
{{
    /// <summary>
    /// {entity.DisplayName ?? entity.Name} MongoDB应用服务
    /// 利用ABP + MongoDB提供灵活的文档数据操作
    /// </summary>
    [Authorize(""SmartAbp.{entity.Name}"")]
    public class {entity.Name}AppService : ApplicationService
    {{
        private readonly I{entity.Name}MongoRepository _repository;

        public {entity.Name}AppService(I{entity.Name}MongoRepository repository)
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
            var entities = await _repository.GetPagedListAsync(input.SkipCount, input.MaxResultCount);
            
            return new PagedResultDto<{entity.Name}Dto>(
                totalCount,
                ObjectMapper.Map<List<{entity.Name}>, List<{entity.Name}Dto>>(entities)
            );
        }}

        public virtual async Task<List<{entity.Name}Dto>> SearchAsync(string keyword)
        {{
            var entities = await _repository.SearchAsync(keyword);
            return ObjectMapper.Map<List<{entity.Name}>, List<{entity.Name}Dto>>(entities);
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

        private string GenerateMongoDbContext(EnhancedEntityModelDto entity)
        {
            return $@"using MongoDB.Driver;
using Volo.Abp.Data;
using Volo.Abp.MongoDB;

namespace SmartAbp.MongoDB
{{
    /// <summary>
    /// {entity.DisplayName ?? entity.Name} MongoDB数据库上下文
    /// </summary>
    [ConnectionStringName(""MongoDB"")]
    public class {entity.Name}DbContext : AbpMongoDbContext
    {{
        public IMongoCollection<{entity.Name}> {entity.Name} => Collection<{entity.Name}>();

        protected override void CreateModel(IMongoModelBuilder modelBuilder)
        {{
            base.CreateModel(modelBuilder);

            modelBuilder.Entity<{entity.Name}>(e =>
            {{
                e.CollectionName = ""{entity.TableName ?? entity.Name}"";
                
                // 创建索引
{GenerateMongoIndexes(entity)}
            }});
        }}
    }}
}}";
        }

        private string GenerateMongoProperties(EnhancedEntityModelDto entity)
        {
            var properties = entity.Properties.Select(p =>
            {
                var attributes = new List<string>();
                
                if (p.IsRequired)
                    attributes.Add("[BsonRequired]");
                
                var defaultValueStr = p.DefaultValue?.ToString();
                if (!string.IsNullOrEmpty(defaultValueStr))
                    attributes.Add($"[BsonDefaultValue(\"{defaultValueStr}\")]");

                var attributeStr = attributes.Any() ? "\n        " + string.Join("\n        ", attributes) : "";
                
                return $"{attributeStr}\n        public {GetCSharpType(p.Type)}{(p.IsRequired ? "" : "?")} {p.Name} {{ get; set; }}";
            });

            return string.Join("\n", properties);
        }

        private string GenerateMongoConstructorParams(EnhancedEntityModelDto entity)
        {
            var required = entity.Properties.Where(p => p.IsRequired && p.Name != "Id");
            return required.Any() ? ", " + string.Join(", ", required.Select(p => $"{GetCSharpType(p.Type)} {ToCamelCase(p.Name)}")) : "";
        }

        private string GenerateMongoConstructorBody(EnhancedEntityModelDto entity)
        {
            var required = entity.Properties.Where(p => p.IsRequired && p.Name != "Id");
            return string.Join("\n", required.Select(p => $"            {p.Name} = {ToCamelCase(p.Name)};"));
        }

        private string GenerateMongoIndexes(EnhancedEntityModelDto entity)
        {
            var indexes = entity.Properties
                .Where(p => p.IsUnique || p.Name.Contains("Name") || p.Name.Contains("Code"))
                .Select(p => $"                e.HasIndex(x => x.{p.Name});");
            
            return string.Join("\n", indexes);
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

        private string ToCamelCase(string input)
        {
            if (string.IsNullOrEmpty(input)) return input;
            return char.ToLowerInvariant(input[0]) + input.Substring(1);
        }
    }
}
