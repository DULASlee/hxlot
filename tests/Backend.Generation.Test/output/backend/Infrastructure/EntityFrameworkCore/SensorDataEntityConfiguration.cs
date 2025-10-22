// 传感器数据 EF Core Configuration
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace .Infrastructure.EntityFrameworkCore
{
    public class SensorDataEntityConfiguration : IEntityTypeConfiguration<SensorData>
    {
        public void Configure(EntityTypeBuilder<SensorData> builder)
        {
            builder.ToTable("MES_SensorData");

            builder.ConfigureByConvention();

            // Configure properties
            // ...
        }
    }
}