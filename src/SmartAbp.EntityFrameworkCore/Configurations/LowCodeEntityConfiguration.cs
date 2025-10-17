using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartAbp.Domain.Entities.LowCode;
using System.Text.Json;
using Volo.Abp.EntityFrameworkCore.Modeling;

namespace SmartAbp.EntityFrameworkCore.Configurations
{
    /// <summary>
    /// 低代码实体配置
    /// </summary>
    public class LowCodeEntityConfiguration : IEntityTypeConfiguration<LowCodeEntity>
    {
        public void Configure(EntityTypeBuilder<LowCodeEntity> builder)
        {
            builder.ToTable("LC_Entities");

            builder.ConfigureByConvention(); // ABP通用配置

            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // JSON字段配置（值转换）
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

            var jsonOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = false
            };

            builder.Property(e => e.EntityConfig)
                .HasConversion(
                    v => v == null ? null : JsonSerializer.Serialize(v, jsonOptions),
                    v => string.IsNullOrEmpty(v) ? null : JsonSerializer.Deserialize<EntityConfig>(v, jsonOptions));

            builder.Property(e => e.UIConfig)
                .HasConversion(
                    v => v == null ? null : JsonSerializer.Serialize(v, jsonOptions),
                    v => string.IsNullOrEmpty(v) ? null : JsonSerializer.Deserialize<EntityUIConfig>(v, jsonOptions));

            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // 索引
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

            builder.HasIndex(e => new { e.ModuleId, e.Name, e.TenantId })
                .IsUnique()
                .HasDatabaseName("IX_LC_Entities_ModuleId_Name");

            builder.HasIndex(e => e.DisplayOrder)
                .HasDatabaseName("IX_LC_Entities_DisplayOrder");

            builder.HasIndex(e => e.IsActive)
                .HasDatabaseName("IX_LC_Entities_IsActive");

            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // 关系
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

            builder.HasOne(e => e.Module)
                .WithMany(e => e.Entities)
                .HasForeignKey(e => e.ModuleId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(e => e.Properties)
                .WithOne(e => e.Entity)
                .HasForeignKey(e => e.EntityId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(e => e.PageConfigs)
                .WithOne(e => e.Entity)
                .HasForeignKey(e => e.EntityId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}

