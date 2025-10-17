using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartAbp.Domain.Entities.LowCode;
using System.Text.Json;
using Volo.Abp.EntityFrameworkCore.Modeling;

namespace SmartAbp.EntityFrameworkCore.Configurations
{
    /// <summary>
    /// 低代码模块实体配置
    /// </summary>
    public class LowCodeModuleConfiguration : IEntityTypeConfiguration<LowCodeModule>
    {
        public void Configure(EntityTypeBuilder<LowCodeModule> builder)
        {
            builder.ToTable("LC_Modules");

            builder.ConfigureByConvention(); // ABP通用配置

            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // JSON字段配置（值转换）
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

            var jsonOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = false
            };

            builder.Property(e => e.ArchitectureConfig)
                .HasConversion(
                    v => v == null ? null : JsonSerializer.Serialize(v, jsonOptions),
                    v => string.IsNullOrEmpty(v) ? null : JsonSerializer.Deserialize<ModuleArchitectureConfig>(v, jsonOptions));

            builder.Property(e => e.FrontendConfig)
                .HasConversion(
                    v => v == null ? null : JsonSerializer.Serialize(v, jsonOptions),
                    v => string.IsNullOrEmpty(v) ? null : JsonSerializer.Deserialize<ModuleFrontendConfig>(v, jsonOptions));

            builder.Property(e => e.CodeGenOptions)
                .HasConversion(
                    v => v == null ? null : JsonSerializer.Serialize(v, jsonOptions),
                    v => string.IsNullOrEmpty(v) ? null : JsonSerializer.Deserialize<ModuleCodeGenOptions>(v, jsonOptions));

            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // 索引
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

            builder.HasIndex(e => new { e.SystemName, e.ModuleName, e.TenantId })
                .IsUnique()
                .HasDatabaseName("IX_LC_Modules_SystemName_ModuleName");

            builder.HasIndex(e => e.Status)
                .HasDatabaseName("IX_LC_Modules_Status");

            builder.HasIndex(e => e.IsActive)
                .HasDatabaseName("IX_LC_Modules_IsActive");

            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // 关系
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

            builder.HasMany(e => e.Entities)
                .WithOne(e => e.Module)
                .HasForeignKey(e => e.ModuleId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}

