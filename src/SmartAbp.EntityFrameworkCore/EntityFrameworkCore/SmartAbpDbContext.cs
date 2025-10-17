using Microsoft.EntityFrameworkCore;
using Volo.Abp.AuditLogging.EntityFrameworkCore;
using Volo.Abp.BackgroundJobs.EntityFrameworkCore;
using Volo.Abp.BlobStoring.Database.EntityFrameworkCore;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.EntityFrameworkCore;
using Volo.Abp.EntityFrameworkCore.Modeling;
using Volo.Abp.FeatureManagement.EntityFrameworkCore;
using Volo.Abp.Identity;
using Volo.Abp.Identity.EntityFrameworkCore;
using Volo.Abp.PermissionManagement.EntityFrameworkCore;
using Volo.Abp.SettingManagement.EntityFrameworkCore;
using Volo.Abp.OpenIddict.EntityFrameworkCore;
using Volo.Abp.TenantManagement;
using Volo.Abp.TenantManagement.EntityFrameworkCore;
using SmartAbp.CodeGenerator.Domain;
using SmartAbp.Domain.Entities.LowCode;
using SmartAbp.Domain.BusinessRules;

namespace SmartAbp.EntityFrameworkCore;

[ReplaceDbContext(typeof(IIdentityDbContext))]
[ReplaceDbContext(typeof(ITenantManagementDbContext))]
[ConnectionStringName("Default")]
public class SmartAbpDbContext :
    AbpDbContext<SmartAbpDbContext>,
    ITenantManagementDbContext,
    IIdentityDbContext
{
    /* Add DbSet properties for your Aggregate Roots / Entities here. */

    public DbSet<MetadataStore> MetadataStores { get; set; }

    // 🔥 低代码引擎实体建模（旧）
    public DbSet<EntityDefinition> EntityDefinitions { get; set; }
    public DbSet<EntityField> EntityFields { get; set; }
    public DbSet<EntityRelation> EntityRelations { get; set; }
    public DbSet<ValidationRule> ValidationRules { get; set; }

    // 🔥🔥🔥 低代码引擎Phase 1核心表（新）
    public DbSet<LowCodeModule> LowCodeModules { get; set; }
    public DbSet<LowCodeEntity> LowCodeEntities { get; set; }
    public DbSet<LowCodeProperty> LowCodeProperties { get; set; }
    public DbSet<LowCodePageConfig> LowCodePageConfigs { get; set; }

    // 🔥 业务规则引擎
    public DbSet<BusinessRule> BusinessRules { get; set; }
    public DbSet<BusinessRuleVersion> BusinessRuleVersions { get; set; }

    // 🔥 代码生成器统计和配置
    public DbSet<SmartAbp.CodeGenerator.CodeGenStat> CodeGenStats { get; set; }
    public DbSet<SmartAbp.CodeGenerator.UserProfile> UserProfiles { get; set; }
    public DbSet<SmartAbp.CodeGenerator.GenerationHistory> GenerationHistories { get; set; }


    #region Entities from the modules

    /* Notice: We only implemented IIdentityProDbContext and ISaasDbContext
     * and replaced them for this DbContext. This allows you to perform JOIN
     * queries for the entities of these modules over the repositories easily. You
     * typically don't need that for other modules. But, if you need, you can
     * implement the DbContext interface of the needed module and use ReplaceDbContext
     * attribute just like IIdentityProDbContext and ISaasDbContext.
     *
     * More info: Replacing a DbContext of a module ensures that the related module
     * uses this DbContext on runtime. Otherwise, it will use its own DbContext class.
     */

    // Identity
    public DbSet<IdentityUser> Users { get; set; }
    public DbSet<IdentityRole> Roles { get; set; }
    public DbSet<IdentityClaimType> ClaimTypes { get; set; }
    public DbSet<OrganizationUnit> OrganizationUnits { get; set; }
    public DbSet<IdentitySecurityLog> SecurityLogs { get; set; }
    public DbSet<IdentityLinkUser> LinkUsers { get; set; }
    public DbSet<IdentityUserDelegation> UserDelegations { get; set; }
    public DbSet<IdentitySession> Sessions { get; set; }

    // Tenant Management
    public DbSet<Tenant> Tenants { get; set; }
    public DbSet<TenantConnectionString> TenantConnectionStrings { get; set; }

    #endregion

    public SmartAbpDbContext(DbContextOptions<SmartAbpDbContext> options)
        : base(options)
    {

    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        /* Include modules to your migration db context */

        builder.ConfigurePermissionManagement();
        builder.ConfigureSettingManagement();
        builder.ConfigureBackgroundJobs();
        builder.ConfigureAuditLogging();
        builder.ConfigureFeatureManagement();
        builder.ConfigureIdentity();
        builder.ConfigureOpenIddict();
        builder.ConfigureTenantManagement();
        builder.ConfigureBlobStoring();

        /* Configure your own tables/entities inside here */

        builder.Entity<MetadataStore>(b =>
        {
            b.ToTable(SmartAbpConsts.DbTablePrefix + "MetadataStores", SmartAbpConsts.DbSchema);
            b.ConfigureByConvention();
            b.Property(x => x.ModuleName).IsRequired().HasMaxLength(256);
            b.Property(x => x.MetadataJson).IsRequired();
            b.HasIndex(x => x.ModuleName);
        });

        // 🔥🔥🔥 Phase 1核心表配置（使用Fluent API Configuration）
        builder.ApplyConfiguration(new SmartAbp.EntityFrameworkCore.Configurations.LowCodeModuleConfiguration());
        builder.ApplyConfiguration(new SmartAbp.EntityFrameworkCore.Configurations.LowCodeEntityConfiguration());
        builder.ApplyConfiguration(new SmartAbp.EntityFrameworkCore.Configurations.LowCodePropertyConfiguration());
        builder.ApplyConfiguration(new SmartAbp.EntityFrameworkCore.Configurations.LowCodePageConfigConfiguration());

        // 🔥 低代码引擎实体建模配置
        builder.Entity<EntityDefinition>(b =>
        {
            b.ToTable(SmartAbpConsts.DbTablePrefix + "EntityDefinitions", SmartAbpConsts.DbSchema);
            b.ConfigureByConvention();

            // 属性配置
            b.Property(x => x.Name).IsRequired().HasMaxLength(128);
            b.Property(x => x.TableName).IsRequired().HasMaxLength(128);
            b.Property(x => x.DisplayName).IsRequired().HasMaxLength(256);
            b.Property(x => x.Description).HasMaxLength(1000);
            b.Property(x => x.Category).IsRequired().HasMaxLength(64);
            b.Property(x => x.Module).IsRequired().HasMaxLength(128);

            // 索引
            b.HasIndex(x => x.Name);
            b.HasIndex(x => x.Module);
            b.HasIndex(x => x.Category);

            // 关系配置
            b.HasMany(x => x.Fields)
                .WithOne(x => x.EntityDefinition)
                .HasForeignKey(x => x.EntityDefinitionId)
                .OnDelete(DeleteBehavior.Cascade);

            b.HasMany(x => x.ValidationRules)
                .WithOne(x => x.EntityDefinition)
                .HasForeignKey(x => x.EntityDefinitionId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<EntityField>(b =>
        {
            b.ToTable(SmartAbpConsts.DbTablePrefix + "EntityFields", SmartAbpConsts.DbSchema);
            b.ConfigureByConvention();

            // 属性配置
            b.Property(x => x.Name).IsRequired().HasMaxLength(128);
            b.Property(x => x.DisplayName).IsRequired().HasMaxLength(256);
            b.Property(x => x.Type).IsRequired().HasMaxLength(64);
            b.Property(x => x.DefaultValue).HasMaxLength(256);
            b.Property(x => x.Description).HasMaxLength(500);

            // 索引
            b.HasIndex(x => x.EntityDefinitionId);
            b.HasIndex(x => new { x.EntityDefinitionId, x.Name });
        });

        builder.Entity<EntityRelation>(b =>
        {
            b.ToTable(SmartAbpConsts.DbTablePrefix + "EntityRelations", SmartAbpConsts.DbSchema);
            b.ConfigureByConvention();

            // 属性配置
            b.Property(x => x.FromEntity).IsRequired().HasMaxLength(128);
            b.Property(x => x.ToEntity).IsRequired().HasMaxLength(128);
            b.Property(x => x.RelationType).IsRequired().HasMaxLength(64);
            b.Property(x => x.ForeignKey).IsRequired().HasMaxLength(128);
            b.Property(x => x.NavigationProperty).HasMaxLength(128);
            b.Property(x => x.Description).HasMaxLength(500);

            // 索引
            b.HasIndex(x => x.FromEntity);
            b.HasIndex(x => x.ToEntity);
            b.HasIndex(x => new { x.FromEntity, x.ToEntity });
        });

        builder.Entity<ValidationRule>(b =>
        {
            b.ToTable(SmartAbpConsts.DbTablePrefix + "ValidationRules", SmartAbpConsts.DbSchema);
            b.ConfigureByConvention();

            // 属性配置
            b.Property(x => x.FieldName).IsRequired().HasMaxLength(128);
            b.Property(x => x.RuleType).IsRequired().HasMaxLength(64);
            b.Property(x => x.RuleValue).IsRequired().HasMaxLength(500);
            b.Property(x => x.ErrorMessage).IsRequired().HasMaxLength(500);
            b.Property(x => x.Description).HasMaxLength(500);

            // 索引
            b.HasIndex(x => x.EntityDefinitionId);
            b.HasIndex(x => new { x.EntityDefinitionId, x.FieldName });
        });

        // 🔥 业务规则引擎实体配置
        builder.Entity<BusinessRule>(b =>
        {
            b.ToTable(SmartAbpConsts.DbTablePrefix + "BusinessRules", SmartAbpConsts.DbSchema);
            b.ConfigureByConvention();

            // 属性配置
            b.Property(x => x.Name).IsRequired().HasMaxLength(256);
            b.Property(x => x.EntityName).IsRequired().HasMaxLength(128);
            b.Property(x => x.Type).IsRequired().HasMaxLength(64);
            b.Property(x => x.Description).HasMaxLength(1000);
            b.Property(x => x.Conditions).IsRequired();
            b.Property(x => x.Actions).IsRequired();
            b.Property(x => x.ExecutionTiming).IsRequired();
            b.Property(x => x.LastExecutionResult).HasMaxLength(4000);

            // 索引
            b.HasIndex(x => x.EntityName);
            b.HasIndex(x => x.Type);
            b.HasIndex(x => x.IsActive);
            b.HasIndex(x => x.Priority);
            b.HasIndex(x => new { x.EntityName, x.IsActive });
            b.HasIndex(x => new { x.Type, x.IsActive });
        });

        // 🔥 业务规则版本配置
        builder.Entity<BusinessRuleVersion>(b =>
        {
            b.ToTable(SmartAbpConsts.DbTablePrefix + "BusinessRuleVersions", SmartAbpConsts.DbSchema);
            b.ConfigureByConvention();

            // 属性配置
            b.Property(x => x.Name).IsRequired().HasMaxLength(256);
            b.Property(x => x.EntityName).IsRequired().HasMaxLength(128);
            b.Property(x => x.Description).HasMaxLength(1000);
            b.Property(x => x.Type).IsRequired().HasMaxLength(64);
            b.Property(x => x.Conditions).IsRequired();
            b.Property(x => x.Actions).IsRequired();
            b.Property(x => x.ExecutionTiming).IsRequired();
            b.Property(x => x.ChangeDescription).HasMaxLength(1000);
            b.Property(x => x.ChangeReason).HasMaxLength(500);

            // 外键关系
            b.HasOne(x => x.BusinessRule)
             .WithMany(x => x.Versions)
             .HasForeignKey(x => x.BusinessRuleId)
             .OnDelete(DeleteBehavior.Cascade);

            // 索引
            b.HasIndex(x => x.BusinessRuleId);
            b.HasIndex(x => x.Version);
            b.HasIndex(x => x.IsCurrent);
            b.HasIndex(x => x.ChangeType);
            b.HasIndex(x => new { x.BusinessRuleId, x.Version });
            b.HasIndex(x => new { x.BusinessRuleId, x.IsCurrent });
        });

        // 🔥 配置CodeGenStat实体
        builder.Entity<SmartAbp.CodeGenerator.CodeGenStat>(b =>
        {
            b.ToTable(SmartAbpConsts.DbTablePrefix + "CodeGenStats", SmartAbpConsts.DbSchema);
            b.ConfigureByConvention();

            b.Property(x => x.UserId).IsRequired();
            b.Property(x => x.TotalProjects).IsRequired();
            b.Property(x => x.MonthlyGenerations).IsRequired();
            b.Property(x => x.SavedHours).IsRequired();
            b.Property(x => x.QualityScore).IsRequired().HasPrecision(5, 2);
            b.Property(x => x.LastUpdated).IsRequired();

            b.HasIndex(x => x.UserId).IsUnique();
        });

        // 🔥 配置UserProfile实体
        builder.Entity<SmartAbp.CodeGenerator.UserProfile>(b =>
        {
            b.ToTable(SmartAbpConsts.DbTablePrefix + "UserProfiles", SmartAbpConsts.DbSchema);
            b.ConfigureByConvention();

            b.Property(x => x.UserId).IsRequired();
            b.Property(x => x.Industry).HasMaxLength(64);
            b.Property(x => x.CompanyName).HasMaxLength(256);
            b.Property(x => x.CompanySize).HasMaxLength(32);
            b.Property(x => x.LastUsedMode).HasMaxLength(32);
            b.Property(x => x.IsFirstVisit).IsRequired();
            b.Property(x => x.Preferences).HasMaxLength(2000);

            b.HasIndex(x => x.UserId).IsUnique();
            b.HasIndex(x => x.Industry);
        });

        // 🔥 配置GenerationHistory实体
        builder.Entity<SmartAbp.CodeGenerator.GenerationHistory>(b =>
        {
            b.ToTable(SmartAbpConsts.DbTablePrefix + "GenerationHistories", SmartAbpConsts.DbSchema);
            b.ConfigureByConvention();

            b.Property(x => x.UserId).IsRequired();
            b.Property(x => x.Mode).IsRequired().HasMaxLength(32);
            b.Property(x => x.TemplateName).HasMaxLength(128);
            b.Property(x => x.ProjectName).IsRequired().HasMaxLength(256);
            b.Property(x => x.EntityCount).IsRequired();
            b.Property(x => x.GeneratedFileCount).IsRequired();
            b.Property(x => x.GenerationDuration).IsRequired();
            b.Property(x => x.Status).IsRequired().HasMaxLength(32);
            b.Property(x => x.ErrorMessage).HasMaxLength(2000);
            b.Property(x => x.Metadata).HasMaxLength(4000);

            b.HasIndex(x => x.UserId);
            b.HasIndex(x => x.Status);
            b.HasIndex(x => x.Mode);
            b.HasIndex(x => new { x.UserId, x.Status });
            b.HasIndex(x => new { x.UserId, x.CreationTime });
        });
    }
}
