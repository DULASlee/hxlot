using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartAbp.Domain.Entities.LowCode;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using System.Text.Json;
using Volo.Abp.EntityFrameworkCore.Modeling;

namespace SmartAbp.EntityFrameworkCore.Configurations
{
    /// <summary>
    /// 低代码属性实体配置（核心）
    /// </summary>
    public class LowCodePropertyConfiguration : IEntityTypeConfiguration<LowCodeProperty>
    {
        public void Configure(EntityTypeBuilder<LowCodeProperty> builder)
        {
            builder.ToTable("LC_Properties");

            builder.ConfigureByConvention(); // ABP通用配置

            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // JSON字段配置（值转换）⭐核心
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

            var jsonOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = false,
                DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
            };

            builder.Property(e => e.UIConfig)
                .HasConversion(
                    v => v == null ? null : JsonSerializer.Serialize(v, jsonOptions),
                    v => string.IsNullOrEmpty(v) ? null : JsonSerializer.Deserialize<PropertyUIConfig>(v, jsonOptions));

            builder.Property(e => e.ValidationRules)
                .HasConversion(
                    v => v == null || v.Count == 0 ? null : JsonSerializer.Serialize(v, jsonOptions),
                    v => string.IsNullOrEmpty(v) ? new List<ValidationRuleConfig>() : JsonSerializer.Deserialize<List<ValidationRuleConfig>>(v, jsonOptions))
                .Metadata.SetValueComparer(new ValueComparer<List<ValidationRuleConfig>>(
                    (c1, c2) => JsonSerializer.Serialize(c1 ?? new(), jsonOptions) == JsonSerializer.Serialize(c2 ?? new(), jsonOptions),
                    c => JsonSerializer.Serialize(c ?? new(), jsonOptions).GetHashCode(),
                    c => c == null ? new List<ValidationRuleConfig>() : new List<ValidationRuleConfig>(c)));

            // 数值精度（与迁移一致，避免SQL Server截断警告）
            builder.Property(e => e.MinValue).HasPrecision(18, 4);
            builder.Property(e => e.MaxValue).HasPrecision(18, 4);

            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // 索引
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

            builder.HasIndex(e => new { e.EntityId, e.Name })
                .IsUnique()
                .HasDatabaseName("IX_LC_Properties_EntityId_Name");

            builder.HasIndex(e => e.DisplayOrder)
                .HasDatabaseName("IX_LC_Properties_DisplayOrder");

            builder.HasIndex(e => e.IsKey)
                .HasDatabaseName("IX_LC_Properties_IsKey");

            builder.HasIndex(e => e.IsForeignKey)
                .HasDatabaseName("IX_LC_Properties_IsForeignKey");

            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // 关系
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

            builder.HasOne(e => e.Entity)
                .WithMany(e => e.Properties)
                .HasForeignKey(e => e.EntityId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}

