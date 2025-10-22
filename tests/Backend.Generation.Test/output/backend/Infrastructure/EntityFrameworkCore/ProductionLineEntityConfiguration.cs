// 生产线 EF Core Configuration
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace .Infrastructure.EntityFrameworkCore
{
    public class ProductionLineEntityConfiguration : IEntityTypeConfiguration<ProductionLine>
    {
        public void Configure(EntityTypeBuilder<ProductionLine> builder)
        {
            builder.ToTable("MES_ProductionLines");

            builder.ConfigureByConvention();

            // Configure properties
            // ...
        }
    }
}