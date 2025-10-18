using System;
using System.Linq;
using System.Threading.Tasks;
using HandlebarsDotNet;
using SmartAbp.DevKit.Core.Metadata;
using SmartAbp.DevKit.Core.Templates;
using SmartAbp.DevKit.Core.Helpers;

namespace SmartAbp.DevKit.Core.Generator;

/// <summary>
/// 数据库迁移生成器
/// Phase 2核心组件 - 生成EF Core数据库配置和迁移代码
/// </summary>
public class DbMigrationGenerator : CodeGeneratorFramework<Guid, DbMigrationGeneratorOutput>
{
    private readonly UnifiedMetadataSDK _metadataSDK;
    private readonly TemplateManager _templateManager;

    public DbMigrationGenerator(
        UnifiedMetadataSDK metadataSDK,
        TemplateManager templateManager)
    {
        _metadataSDK = metadataSDK;
        _templateManager = templateManager;
        
        // 注册自定义Helpers
        _templateManager.RegisterHelpers();
    }

    public override async Task<DbMigrationGeneratorOutput> GenerateAsync(Guid entityId)
    {
        // 1. 验证输入
        var validation = await ValidateInputAsync(entityId);
        if (!validation.IsValid)
        {
            throw new InvalidOperationException($"输入验证失败: {validation.ErrorMessage}");
        }

        // 2. 获取元数据
        var entity = _metadataSDK.GetEntity(entityId);
        if (entity == null)
            throw new InvalidOperationException($"Entity {entityId} not found");

        var properties = _metadataSDK.GetProperties(entityId);
        var primaryKeyType = _metadataSDK.GetPrimaryKeyType(entityId);

        // 3. 准备模板数据
        var templateData = PrepareTemplateData(entity, properties, primaryKeyType);

        // 4. 生成代码
        var entityConfiguration = GenerateEntityConfiguration(templateData);
        var dbContextConfiguration = GenerateDbContextConfiguration(templateData);

        return new DbMigrationGeneratorOutput
        {
            EntityConfigurationCode = entityConfiguration,
            DbContextConfigurationCode = dbContextConfiguration,
            TableName = $"App{StringHelper.Pluralize(entity.Name)}",
            EntityName = entity.Name
        };
    }

    public override Task<ValidationResult> ValidateInputAsync(Guid entityId)
    {
        if (_metadataSDK.GetEntity(entityId) == null)
        {
            return Task.FromResult(ValidationResult.Fail($"Entity with ID {entityId} not found."));
        }
        return Task.FromResult(ValidationResult.Success());
    }

    /// <summary>
    /// 准备模板数据
    /// </summary>
    private object PrepareTemplateData(dynamic entity, dynamic properties, string primaryKeyType)
    {
        var entityName = entity.Name;
        var tableName = $"App{StringHelper.Pluralize(entityName)}";

        // 分析属性映射
        var propertyMappings = ((IEnumerable<dynamic>)properties).Select(p => new
        {
            Name = p.Name,
            Type = p.Type,
            SqlType = TypeMapper.CSharpToSQL(p.Type, p.Length),
            IsRequired = p.IsRequired ?? false,
            MaxLength = p.Length ?? 0,
            HasMaxLength = (p.Length ?? 0) > 0,
            IsString = TypeMapper.IsStringType(p.Type),
            IsDecimal = p.Type == "decimal" || p.Type == "Decimal"
        }).ToList();

        return new
        {
            EntityName = entityName,
            TableName = tableName,
            PrimaryKeyType = primaryKeyType,
            
            // 命名空间
            Namespace = "SmartAbp.EntityFrameworkCore.EntityConfigurations",
            DomainNamespace = $"SmartAbp.Domain.Entities.{entityName}",
            
            // 属性映射
            Properties = propertyMappings,
            
            // 时间戳
            GeneratedTime = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"),
            Year = DateTime.Now.Year
        };
    }

    /// <summary>
    /// 生成实体配置代码
    /// </summary>
    private string GenerateEntityConfiguration(object templateData)
    {
        var templateSource = @"using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using {{DomainNamespace}};
using Volo.Abp.EntityFrameworkCore.Modeling;

namespace {{Namespace}}
{
    /// <summary>
    /// {{EntityName}}实体配置
    /// 生成时间: {{GeneratedTime}}
    /// </summary>
    public class {{EntityName}}Configuration : IEntityTypeConfiguration<{{EntityName}}>
    {
        public void Configure(EntityTypeBuilder<{{EntityName}}> builder)
        {
            // 配置表名
            builder.ToTable(""{{TableName}}"");

            // 配置主键
            builder.HasKey(x => x.Id);

            // 配置属性
{{#each Properties}}
{{#if IsString}}
{{#if HasMaxLength}}
            builder.Property(x => x.{{Name}})
                .IsRequired({{IsRequired}})
                .HasMaxLength({{MaxLength}});
{{else}}
            builder.Property(x => x.{{Name}})
                .IsRequired({{IsRequired}});
{{/if}}
{{else if IsDecimal}}
            builder.Property(x => x.{{Name}})
                .IsRequired({{IsRequired}})
                .HasColumnType(""{{SqlType}}"");
{{else}}
            builder.Property(x => x.{{Name}})
                .IsRequired({{IsRequired}});
{{/if}}

{{/each}}
            // 配置索引（根据需要添加）
            // builder.HasIndex(x => x.Name);
            // builder.HasIndex(x => new { x.Property1, x.Property2 });

            // 配置关系（根据需要添加）
            // builder.HasOne(x => x.RelatedEntity)
            //     .WithMany()
            //     .HasForeignKey(x => x.RelatedEntityId);
        }
    }
}
";

        var template = _templateManager.CompileTemplate(templateSource);
        return template(templateData);
    }

    /// <summary>
    /// 生成DbContext配置代码
    /// </summary>
    private string GenerateDbContextConfiguration(object templateData)
    {
        var templateSource = @"// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 添加到SmartAbpDbContext.cs的OnModelCreating方法中
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// {{EntityName}}实体配置
builder.Entity<{{EntityName}}>(b =>
{
    b.ToTable(""{{TableName}}"");
    b.ConfigureByConvention(); // ABP约定配置
    
    // 应用自定义配置
    b.ApplyConfiguration(new {{EntityName}}Configuration());
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 添加到SmartAbpDbContext.cs的DbSet属性中
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

public DbSet<{{EntityName}}> {{pluralize EntityName}} { get; set; }
";

        var template = _templateManager.CompileTemplate(templateSource);
        return template(templateData);
    }
}

/// <summary>
/// 数据库迁移生成器输出
/// </summary>
public class DbMigrationGeneratorOutput
{
    /// <summary>
    /// 实体配置代码
    /// </summary>
    public string EntityConfigurationCode { get; set; } = default!;

    /// <summary>
    /// DbContext配置代码
    /// </summary>
    public string DbContextConfigurationCode { get; set; } = default!;

    /// <summary>
    /// 表名
    /// </summary>
    public string TableName { get; set; } = default!;

    /// <summary>
    /// 实体名称
    /// </summary>
    public string EntityName { get; set; } = default!;
}

