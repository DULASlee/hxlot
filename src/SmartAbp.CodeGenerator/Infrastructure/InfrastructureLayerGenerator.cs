using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.CodeGenerator.Core;

namespace SmartAbp.CodeGenerator.Infrastructure
{
    /// <summary>
    /// Advanced Infrastructure layer generator with EF Core and enterprise patterns
    /// </summary>
    public sealed class InfrastructureLayerGenerator
    {
        private readonly ILogger<InfrastructureLayerGenerator> _logger;
        private readonly AdvancedMemoryManager _memoryManager;
        
        public InfrastructureLayerGenerator(
            ILogger<InfrastructureLayerGenerator> logger,
            AdvancedMemoryManager memoryManager)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _memoryManager = memoryManager ?? throw new ArgumentNullException(nameof(memoryManager));
        }
        
        /// <summary>
        /// Generates complete infrastructure layer
        /// </summary>
        public async Task<GeneratedInfrastructureLayer> GenerateInfrastructureLayerAsync(InfrastructureDefinition definition)
        {
            _logger.LogInformation("Generating infrastructure layer for {ModuleName}", definition.ModuleName);
            
            var files = new Dictionary<string, string>();
            
            try
            {
                // 1. Generate DbContext
                var dbContextCode = await GenerateDbContextAsync(definition);
                files[$"EntityFrameworkCore/{definition.ModuleName}DbContext.cs"] = dbContextCode;
                
                // 2. Generate Entity Configurations
                foreach (var entity in definition.Entities ?? Enumerable.Empty<EntityDefinition>())
                {
                    var configCode = await GenerateEntityConfigurationAsync(entity, definition.Namespace);
                    files[$"EntityFrameworkCore/Configurations/{entity.Name}Configuration.cs"] = configCode;
                }
                
                // 3. Generate Repository Implementations
                foreach (var repo in definition.Repositories ?? Enumerable.Empty<RepositoryDefinition>())
                {
                    var repoCode = await GenerateRepositoryImplementationAsync(repo, definition.Namespace);
                    files[$"Repositories/{repo.EntityName}Repository.cs"] = repoCode;
                }
                
                // 4. Generate Infrastructure Module
                var moduleCode = await GenerateInfrastructureModuleAsync(definition);
                files[$"{definition.ModuleName}InfrastructureModule.cs"] = moduleCode;
                
                // 5. Generate Migration Helper
                var migrationCode = await GenerateMigrationHelperAsync(definition);
                files[$"EntityFrameworkCore/{definition.ModuleName}MigrationHelper.cs"] = migrationCode;
                
                _logger.LogInformation("Successfully generated {FileCount} infrastructure files", files.Count);
                
                return new GeneratedInfrastructureLayer
                {
                    ModuleName = definition.ModuleName,
                    Files = files,
                    EntityCount = definition.Entities?.Count ?? 0,
                    RepositoryCount = definition.Repositories?.Count ?? 0,
                    GeneratedAt = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate infrastructure layer for {ModuleName}", definition.ModuleName);
                throw;
            }
        }
        
        /// <summary>
        /// Generates high-performance DbContext with enterprise features
        /// </summary>
        private async Task<string> GenerateDbContextAsync(InfrastructureDefinition definition)
        {
            using var code = _memoryManager.GetStringBuilder();
            var sb = code.StringBuilder;
            
            sb.AppendLine("using System;");
            sb.AppendLine("using Microsoft.EntityFrameworkCore;");
            sb.AppendLine("using Volo.Abp.Data;");
            sb.AppendLine("using Volo.Abp.EntityFrameworkCore;");
            sb.AppendLine();
            
            sb.AppendLine($"namespace {definition.Namespace}.EntityFrameworkCore");
            sb.AppendLine("{");
            
            sb.AppendLine("    /// <summary>");
            sb.AppendLine($"    /// High-performance DbContext for {definition.ModuleName}");
            sb.AppendLine("    /// Implements enterprise patterns and optimizations");
            sb.AppendLine("    /// </summary>");
            sb.AppendLine($"    [ConnectionStringName(\"{definition.ModuleName}\")]");
            sb.AppendLine($"    public class {definition.ModuleName}DbContext : AbpDbContext<{definition.ModuleName}DbContext>");
            sb.AppendLine("    {");
            
            // DbSet properties
            foreach (var entity in definition.Entities ?? Enumerable.Empty<EntityDefinition>())
            {
                sb.AppendLine($"        public DbSet<{entity.Name}> {entity.Name}s {{ get; set; }}");
            }
            
            sb.AppendLine();
            sb.AppendLine($"        public {definition.ModuleName}DbContext(DbContextOptions<{definition.ModuleName}DbContext> options)");
            sb.AppendLine("            : base(options)");
            sb.AppendLine("        {");
            sb.AppendLine("        }");
            sb.AppendLine();
            
            sb.AppendLine("        protected override void OnModelCreating(ModelBuilder builder)");
            sb.AppendLine("        {");
            sb.AppendLine("            base.OnModelCreating(builder);");
            sb.AppendLine();
            sb.AppendLine($"            builder.ConfigureModule();");
            sb.AppendLine();
            
            // Apply configurations
            foreach (var entity in definition.Entities ?? Enumerable.Empty<EntityDefinition>())
            {
                sb.AppendLine($"            builder.ApplyConfiguration(new {entity.Name}Configuration());");
            }
            
            sb.AppendLine("        }");
            sb.AppendLine("    }");
            sb.AppendLine("}");
            
            return await Task.FromResult(sb.ToString());
        }
        
        /// <summary>
        /// Generates entity configuration with enterprise optimizations
        /// </summary>
        private async Task<string> GenerateEntityConfigurationAsync(EntityDefinition entity, string rootNamespace)
        {
            using var code = _memoryManager.GetStringBuilder();
            var sb = code.StringBuilder;
            
            sb.AppendLine("using Microsoft.EntityFrameworkCore;");
            sb.AppendLine("using Microsoft.EntityFrameworkCore.Metadata.Builders;");
            sb.AppendLine("using Volo.Abp.EntityFrameworkCore.Modeling;");
            sb.AppendLine();
            
            sb.AppendLine($"namespace {rootNamespace}.EntityFrameworkCore.Configurations");
            sb.AppendLine("{");
            
            sb.AppendLine("    /// <summary>");
            sb.AppendLine($"    /// Entity configuration for {entity.Name} with performance optimizations");
            sb.AppendLine("    /// </summary>");
            sb.AppendLine($"    public class {entity.Name}Configuration : IEntityTypeConfiguration<{entity.Name}>");
            sb.AppendLine("    {");
            
            sb.AppendLine($"        public void Configure(EntityTypeBuilder<{entity.Name}> builder)");
            sb.AppendLine("        {");
            sb.AppendLine($"            builder.ToTable(\"{entity.Name}s\");");
            sb.AppendLine();
            sb.AppendLine("            builder.ConfigureByConvention();");
            sb.AppendLine();
            
            // Configure properties
            foreach (var property in entity.Properties ?? Enumerable.Empty<PropertyDefinition>())
            {
                GeneratePropertyConfiguration(sb, property);
            }
            
            // Configure indexes
            if (entity.Indexes != null)
            {
                foreach (var index in entity.Indexes)
                {
                    sb.AppendLine($"            builder.HasIndex(x => x.{index.PropertyName})");
                    if (index.IsUnique)
                    {
                        sb.AppendLine("                .IsUnique()");
                    }
                    sb.AppendLine($"                .HasDatabaseName(\"IX_{entity.Name}_{index.PropertyName}\");");
                    sb.AppendLine();
                }
            }
            
            sb.AppendLine("        }");
            sb.AppendLine("    }");
            sb.AppendLine("}");
            
            return await Task.FromResult(sb.ToString());
        }
        
        /// <summary>
        /// Generates repository implementation with advanced querying
        /// </summary>
        private async Task<string> GenerateRepositoryImplementationAsync(RepositoryDefinition repo, string rootNamespace)
        {
            using var code = _memoryManager.GetStringBuilder();
            var sb = code.StringBuilder;
            
            sb.AppendLine("using System;");
            sb.AppendLine("using System.Collections.Generic;");
            sb.AppendLine("using System.Linq;");
            sb.AppendLine("using System.Threading;");
            sb.AppendLine("using System.Threading.Tasks;");
            sb.AppendLine("using Microsoft.EntityFrameworkCore;");
            sb.AppendLine("using Volo.Abp.Domain.Repositories.EntityFrameworkCore;");
            sb.AppendLine("using Volo.Abp.EntityFrameworkCore;");
            sb.AppendLine();
            
            sb.AppendLine($"namespace {rootNamespace}.Repositories");
            sb.AppendLine("{");
            
            sb.AppendLine("    /// <summary>");
            sb.AppendLine($"    /// High-performance repository implementation for {repo.EntityName}");
            sb.AppendLine("    /// </summary>");
            sb.AppendLine($"    public class {repo.EntityName}Repository : EfCoreRepository<{repo.DbContextName}, {repo.EntityName}, Guid>, I{repo.EntityName}Repository");
            sb.AppendLine("    {");
            
            sb.AppendLine($"        public {repo.EntityName}Repository(IDbContextProvider<{repo.DbContextName}> dbContextProvider)");
            sb.AppendLine("            : base(dbContextProvider)");
            sb.AppendLine("        {");
            sb.AppendLine("        }");
            sb.AppendLine();
            
            // Generate custom query methods
            foreach (var method in repo.CustomMethods ?? Enumerable.Empty<RepositoryMethodDefinition>())
            {
                GenerateRepositoryMethod(sb, method, repo.EntityName);
            }
            
            sb.AppendLine("    }");
            sb.AppendLine("}");
            
            return await Task.FromResult(sb.ToString());
        }
        
        // Helper methods
        private void GeneratePropertyConfiguration(StringBuilder sb, PropertyDefinition property)
        {
            sb.AppendLine($"            builder.Property(x => x.{property.Name})");
            
            if (property.IsRequired)
            {
                sb.AppendLine("                .IsRequired()");
            }
            
            if (property.MaxLength.HasValue)
            {
                sb.AppendLine($"                .HasMaxLength({property.MaxLength.Value})");
            }
            
            if (!string.IsNullOrEmpty(property.DefaultValue))
            {
                sb.AppendLine($"                .HasDefaultValue({property.DefaultValue})");
            }
            
            sb.AppendLine("                ;");
            sb.AppendLine();
        }
        
        private void GenerateRepositoryMethod(StringBuilder sb, RepositoryMethodDefinition method, string entityName)
        {
            var parameters = method.Parameters?.Select(p => $"{p.Type} {p.Name}") ?? Enumerable.Empty<string>();
            var paramStr = parameters.Any() ? string.Join(", ", parameters) : "";
            
            sb.AppendLine($"        public async Task<{method.ReturnType}> {method.Name}Async({paramStr})");
            sb.AppendLine("        {");
            sb.AppendLine("            var queryable = await GetQueryableAsync();");
            sb.AppendLine("            // TODO: Implement custom query logic");
            sb.AppendLine($"            throw new NotImplementedException(\"Custom repository method {method.Name} needs implementation\");");
            sb.AppendLine("        }");
            sb.AppendLine();
        }
        
        // Additional method stubs
        private async Task<string> GenerateInfrastructureModuleAsync(InfrastructureDefinition definition) => await Task.FromResult("// Infrastructure module implementation");
        private async Task<string> GenerateMigrationHelperAsync(InfrastructureDefinition definition) => await Task.FromResult("// Migration helper implementation");
    }
    
    // Supporting definitions for infrastructure layer
    public sealed class InfrastructureDefinition
    {
        public string ModuleName { get; set; } = string.Empty;
        public string Namespace { get; set; } = string.Empty;
        public IList<EntityDefinition> Entities { get; set; } = new List<EntityDefinition>();
        public IList<RepositoryDefinition> Repositories { get; set; } = new List<RepositoryDefinition>();
    }
    
    public sealed class RepositoryDefinition
    {
        public string EntityName { get; set; } = string.Empty;
        public string DbContextName { get; set; } = string.Empty;
        public IList<RepositoryMethodDefinition> CustomMethods { get; set; } = new List<RepositoryMethodDefinition>();
    }
    
    public sealed class RepositoryMethodDefinition
    {
        public string Name { get; set; } = string.Empty;
        public string ReturnType { get; set; } = string.Empty;
        public IList<ParameterDefinition> Parameters { get; set; } = new List<ParameterDefinition>();
    }
    
    public sealed class IndexDefinition
    {
        public string PropertyName { get; set; } = string.Empty;
        public bool IsUnique { get; set; } = false;
    }
    
    public sealed class GeneratedInfrastructureLayer
    {
        public string ModuleName { get; set; } = string.Empty;
        public IDictionary<string, string> Files { get; set; } = new Dictionary<string, string>();
        public int EntityCount { get; set; }
        public int RepositoryCount { get; set; }
        public DateTime GeneratedAt { get; set; }
    }
}