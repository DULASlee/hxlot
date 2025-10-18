using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartAbp.Domain.Entities.LowCode;
using SmartAbp.Domain.Shared.LowCode; // PageConfigDto定义
using System.Text.Json;
using Volo.Abp.EntityFrameworkCore.Modeling;

namespace SmartAbp.EntityFrameworkCore.Configurations
{
    /// <summary>
    /// 低代码页面配置实体配置（核心）
    /// </summary>
    public class LowCodePageConfigConfiguration : IEntityTypeConfiguration<LowCodePageConfig>
    {
        public void Configure(EntityTypeBuilder<LowCodePageConfig> builder)
        {
            builder.ToTable("LC_PageConfigs");

            builder.ConfigureByConvention(); // ABP通用配置

            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // JSON字段配置（值转换）⭐⭐⭐ 核心
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

            var jsonOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = false,
                DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
            };

            builder.Property(e => e.PageConfig)
                .IsRequired()
                .HasConversion(
                    v => JsonSerializer.Serialize(v, jsonOptions),
                    v => JsonSerializer.Deserialize<PageConfigDto>(v, jsonOptions)!);

            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // 索引
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

            builder.HasIndex(e => new { e.EntityId, e.PageType, e.TenantId })
                .IsUnique()
                .HasDatabaseName("IX_LC_PageConfigs_EntityId_PageType");

            builder.HasIndex(e => e.Status)
                .HasDatabaseName("IX_LC_PageConfigs_Status");

            builder.HasIndex(e => e.IsPublished)
                .HasDatabaseName("IX_LC_PageConfigs_IsPublished");

            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // 关系
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

            builder.HasOne(e => e.Entity)
                .WithMany(e => e.PageConfigs)
                .HasForeignKey(e => e.EntityId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}

