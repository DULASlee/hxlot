using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SmartAbp.CodeGenerator.Services.V9;

namespace SmartAbp.CodeGenerator.Services.TechStackGenerators
{
    /// <summary>
    /// 🚀 Minimal API + Dapper 轻量级技术栈生成器
    /// 为性能优先场景提供轻量级、高性能的代码生成
    /// </summary>
    public class MinimalApiDapperGenerator : ISimpleCodeGenerator
    {
        public SupportedTechStack Stack => SupportedTechStack.MinimalApiDapper;

        public async Task<SimpleGeneratedCode> GenerateAsync(EnhancedEntityModelDto entity)
        {
            await Task.CompletedTask;
            
            var result = new SimpleGeneratedCode
            {
                TechStack = "Minimal API + Dapper",
                Success = true
            };

            // 生成轻量级实体（POCO）
            result.Files[$"Models/{entity.Name}.cs"] = GeneratePocoEntity(entity);
            
            // 生成Dapper仓储
            result.Files[$"Repositories/{entity.Name}Repository.cs"] = GenerateDapperRepository(entity);
            
            // 生成Minimal API端点
            result.Files[$"Endpoints/{entity.Name}Endpoints.cs"] = GenerateMinimalApiEndpoints(entity);
            
            // 生成DTO类
            result.Files[$"Dtos/{entity.Name}Dtos.cs"] = GenerateDtos(entity);
            
            result.Dependencies.AddRange(new[]
            {
                "Dapper",
                "Microsoft.Data.SqlClient",
                "Microsoft.AspNetCore.OpenApi",
                "Swashbuckle.AspNetCore"
            });

            return result;
        }

        public bool CanHandle(EnhancedEntityModelDto entity)
        {
            // 轻量级栈适合简单实体，不支持复杂的业务规则
            var hasComplexRules = entity.BusinessRules?.Count > 10;
            var hasComplexRelations = entity.Relationships?.Count > 5;
            
            return !hasComplexRules && !hasComplexRelations;
        }

        private string GeneratePocoEntity(EnhancedEntityModelDto entity)
        {
            return $@"using System;

namespace SmartAbp.Models
{{
    /// <summary>
    /// {entity.DisplayName ?? entity.Name} POCO实体 - Minimal API + Dapper
    /// 轻量级实体，无ORM依赖，高性能
    /// </summary>
    public class {entity.Name}
    {{
{GenerateProperties(entity)}

        public {entity.Name}()
        {{
            Id = Guid.NewGuid();
            CreatedAt = DateTime.UtcNow;
        }}

        public {entity.Name}({GenerateConstructorParams(entity)})
        {{
            Id = Guid.NewGuid();
{GenerateConstructorBody(entity)}
            CreatedAt = DateTime.UtcNow;
        }}
    }}
}}";
        }

        private string GenerateDapperRepository(EnhancedEntityModelDto entity)
        {
            return $@"using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace SmartAbp.Repositories
{{
    /// <summary>
    /// {entity.DisplayName ?? entity.Name} Dapper仓储 - 高性能数据访问
    /// </summary>
    public interface I{entity.Name}Repository
    {{
        Task<{entity.Name}?> GetByIdAsync(Guid id);
        Task<List<{entity.Name}>> GetAllAsync();
        Task<List<{entity.Name}>> GetPagedAsync(int skip, int take);
        Task<int> GetCountAsync();
        Task<Guid> InsertAsync({entity.Name} entity);
        Task<bool> UpdateAsync({entity.Name} entity);
        Task<bool> DeleteAsync(Guid id);
    }}

    public class {entity.Name}Repository : I{entity.Name}Repository
    {{
        private readonly string _connectionString;

        public {entity.Name}Repository(IConfiguration configuration)
        {{
            _connectionString = configuration.GetConnectionString(""Default"") 
                ?? throw new InvalidOperationException(""Connection string not found"");
        }}

        public async Task<{entity.Name}?> GetByIdAsync(Guid id)
        {{
            using var connection = new SqlConnection(_connectionString);
            const string sql = ""SELECT * FROM {entity.TableName ?? entity.Name} WHERE Id = @Id"";
            return await connection.QuerySingleOrDefaultAsync<{entity.Name}>(sql, new {{ Id = id }});
        }}

        public async Task<List<{entity.Name}>> GetAllAsync()
        {{
            using var connection = new SqlConnection(_connectionString);
            const string sql = ""SELECT * FROM {entity.TableName ?? entity.Name}"";
            var result = await connection.QueryAsync<{entity.Name}>(sql);
            return result.ToList();
        }}

        public async Task<List<{entity.Name}>> GetPagedAsync(int skip, int take)
        {{
            using var connection = new SqlConnection(_connectionString);
            const string sql = @""
                SELECT * FROM {entity.TableName ?? entity.Name}
                ORDER BY CreatedAt DESC
                OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY"";
            var result = await connection.QueryAsync<{entity.Name}>(sql, new {{ Skip = skip, Take = take }});
            return result.ToList();
        }}

        public async Task<int> GetCountAsync()
        {{
            using var connection = new SqlConnection(_connectionString);
            const string sql = ""SELECT COUNT(*) FROM {entity.TableName ?? entity.Name}"";
            return await connection.QuerySingleAsync<int>(sql);
        }}

        public async Task<Guid> InsertAsync({entity.Name} entity)
        {{
            using var connection = new SqlConnection(_connectionString);
            const string sql = @""
                INSERT INTO {entity.TableName ?? entity.Name} 
                ({GenerateInsertColumns(entity)})
                VALUES ({GenerateInsertValues(entity)})"";
            
            await connection.ExecuteAsync(sql, entity);
            return entity.Id;
        }}

        public async Task<bool> UpdateAsync({entity.Name} entity)
        {{
            using var connection = new SqlConnection(_connectionString);
            entity.UpdatedAt = DateTime.UtcNow;
            const string sql = @""
                UPDATE {entity.TableName ?? entity.Name}
                SET {GenerateUpdateSet(entity)}
                WHERE Id = @Id"";
            
            var rowsAffected = await connection.ExecuteAsync(sql, entity);
            return rowsAffected > 0;
        }}

        public async Task<bool> DeleteAsync(Guid id)
        {{
            using var connection = new SqlConnection(_connectionString);
            const string sql = ""DELETE FROM {entity.TableName ?? entity.Name} WHERE Id = @Id"";
            var rowsAffected = await connection.ExecuteAsync(sql, new {{ Id = id }});
            return rowsAffected > 0;
        }}
    }}
}}";
        }

        private string GenerateMinimalApiEndpoints(EnhancedEntityModelDto entity)
        {
            var entityLower = entity.Name.ToLowerInvariant();
            
            return $@"using Microsoft.AspNetCore.Mvc;

namespace SmartAbp.Endpoints
{{
    /// <summary>
    /// {entity.DisplayName ?? entity.Name} Minimal API端点 - 高性能轻量级API
    /// </summary>
    public static class {entity.Name}Endpoints
    {{
        public static void Map{entity.Name}Endpoints(this IEndpointRouteBuilder endpoints)
        {{
            var group = endpoints.MapGroup(""/api/{entityLower}"")
                .WithTags(""{entity.Name}"")
                .WithOpenApi();

            // GET /api/{entityLower}
            group.MapGet(""/"", async (I{entity.Name}Repository repository) =>
            {{
                var entities = await repository.GetAllAsync();
                return Results.Ok(entities);
            }})
            .WithName(""Get{entity.Name}List"")
            .WithSummary(""获取{entity.DisplayName ?? entity.Name}列表"")
            .Produces<List<{entity.Name}>>();

            // GET /api/{entityLower}/{{id}}
            group.MapGet(""{{id:guid}}"", async (Guid id, I{entity.Name}Repository repository) =>
            {{
                var entity = await repository.GetByIdAsync(id);
                return entity != null ? Results.Ok(entity) : Results.NotFound();
            }})
            .WithName(""Get{entity.Name}"")
            .WithSummary(""获取{entity.DisplayName ?? entity.Name}详情"")
            .Produces<{entity.Name}>()
            .Produces(404);

            // POST /api/{entityLower}
            group.MapPost(""/"", async ([FromBody] Create{entity.Name}Request request, I{entity.Name}Repository repository) =>
            {{
                var entity = new {entity.Name}({GenerateCreateParams(entity)});
                var id = await repository.InsertAsync(entity);
                return Results.Created($""/api/{entityLower}/{{id}}"", entity);
            }})
            .WithName(""Create{entity.Name}"")
            .WithSummary(""创建{entity.DisplayName ?? entity.Name}"")
            .Produces<{entity.Name}>(201);

            // PUT /api/{entityLower}/{{id}}
            group.MapPut(""{{id:guid}}"", async (Guid id, [FromBody] Update{entity.Name}Request request, I{entity.Name}Repository repository) =>
            {{
                var entity = await repository.GetByIdAsync(id);
                if (entity == null) return Results.NotFound();
                
                {GenerateUpdateLogic(entity)}
                var updated = await repository.UpdateAsync(entity);
                return updated ? Results.Ok(entity) : Results.BadRequest();
            }})
            .WithName(""Update{entity.Name}"")
            .WithSummary(""更新{entity.DisplayName ?? entity.Name}"")
            .Produces<{entity.Name}>()
            .Produces(404);

            // DELETE /api/{entityLower}/{{id}}
            group.MapDelete(""{{id:guid}}"", async (Guid id, I{entity.Name}Repository repository) =>
            {{
                var deleted = await repository.DeleteAsync(id);
                return deleted ? Results.NoContent() : Results.NotFound();
            }})
            .WithName(""Delete{entity.Name}"")
            .WithSummary(""删除{entity.DisplayName ?? entity.Name}"")
            .Produces(204)
            .Produces(404);
        }}
    }}
}}";
        }

        private string GenerateDtos(EnhancedEntityModelDto entity)
        {
            return $@"using System;
using System.ComponentModel.DataAnnotations;

namespace SmartAbp.Dtos
{{
    /// <summary>
    /// {entity.DisplayName ?? entity.Name} DTO定义 - Minimal API
    /// </summary>
    
    public record Create{entity.Name}Request(
{GenerateCreateRecordParams(entity)}
    );

    public record Update{entity.Name}Request(
{GenerateUpdateRecordParams(entity)}
    );

    public record {entity.Name}Response(
        Guid Id,
{GenerateResponseRecordParams(entity)}
        DateTime CreatedAt,
        DateTime? UpdatedAt
    );
}}";
        }

        // 辅助方法
        private string GenerateProperties(EnhancedEntityModelDto entity)
        {
            var properties = new List<string>
            {
                "        public Guid Id { get; set; }",
                "        public DateTime CreatedAt { get; set; }",
                "        public DateTime? UpdatedAt { get; set; }"
            };
            
            properties.AddRange(entity.Properties.Select(p => 
                $"        public {GetCSharpType(p.Type)}{(p.IsRequired ? "" : "?")} {p.Name} {{ get; set; }}"));
            
            return string.Join("\n", properties);
        }

        private string GenerateConstructorParams(EnhancedEntityModelDto entity)
        {
            var required = entity.Properties.Where(p => p.IsRequired && p.Name != "Id");
            return string.Join(", ", required.Select(p => $"{GetCSharpType(p.Type)} {ToCamelCase(p.Name)}"));
        }

        private string GenerateConstructorBody(EnhancedEntityModelDto entity)
        {
            var required = entity.Properties.Where(p => p.IsRequired && p.Name != "Id");
            return string.Join("\n", required.Select(p => $"            {p.Name} = {ToCamelCase(p.Name)};"));
        }

        private string GenerateInsertColumns(EnhancedEntityModelDto entity)
        {
            var columns = new[] { "Id", "CreatedAt" }
                .Concat(entity.Properties.Select(p => p.Name));
            return string.Join(", ", columns);
        }

        private string GenerateInsertValues(EnhancedEntityModelDto entity)
        {
            var values = new[] { "@Id", "@CreatedAt" }
                .Concat(entity.Properties.Select(p => $"@{p.Name}"));
            return string.Join(", ", values);
        }

        private string GenerateUpdateSet(EnhancedEntityModelDto entity)
        {
            var updateColumns = entity.Properties.Select(p => $"{p.Name} = @{p.Name}")
                .Append("UpdatedAt = @UpdatedAt");
            return string.Join(", ", updateColumns);
        }

        private string GenerateCreateParams(EnhancedEntityModelDto entity)
        {
            var required = entity.Properties.Where(p => p.IsRequired && p.Name != "Id");
            return string.Join(", ", required.Select(p => $"request.{p.Name}"));
        }

        private string GenerateCreateRecordParams(EnhancedEntityModelDto entity)
        {
            var required = entity.Properties.Where(p => p.IsRequired && p.Name != "Id");
            return string.Join(",\n", required.Select(p => 
                $"        [Required] {GetCSharpType(p.Type)} {p.Name}"));
        }

        private string GenerateUpdateRecordParams(EnhancedEntityModelDto entity)
        {
            var updateable = entity.Properties.Where(p => p.Name != "Id");
            return string.Join(",\n", updateable.Select(p => 
                $"        {GetCSharpType(p.Type)} {p.Name}"));
        }

        private string GenerateResponseRecordParams(EnhancedEntityModelDto entity)
        {
            return string.Join(",\n", entity.Properties.Select(p => 
                $"        {GetCSharpType(p.Type)} {p.Name}"));
        }

        private string GenerateUpdateLogic(EnhancedEntityModelDto entity)
        {
            var updateable = entity.Properties.Where(p => p.Name != "Id");
            return string.Join("\n                ", updateable.Select(p => $"entity.{p.Name} = request.{p.Name};"));
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
