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
    
    // 🔥 低代码引擎实体建模
    public DbSet<EntityDefinition> EntityDefinitions { get; set; }
    public DbSet<EntityField> EntityFields { get; set; }
    public DbSet<EntityRelation> EntityRelations { get; set; }
    public DbSet<ValidationRule> ValidationRules { get; set; }


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
    }
}
