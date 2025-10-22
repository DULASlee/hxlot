// 设备 EF Core Configuration
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace .Infrastructure.EntityFrameworkCore
{
    public class EquipmentEntityConfiguration : IEntityTypeConfiguration<Equipment>
    {
        public void Configure(EntityTypeBuilder<Equipment> builder)
        {
            builder.ToTable("MES_Equipment");

            builder.ConfigureByConvention();

            // Configure properties
            // ...
        }
    }
}