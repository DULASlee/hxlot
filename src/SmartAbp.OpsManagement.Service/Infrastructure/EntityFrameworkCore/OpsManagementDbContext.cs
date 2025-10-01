using Microsoft.EntityFrameworkCore;
using SmartAbp.OpsManagement.Entities;
using Volo.Abp.Data;
using Volo.Abp.EntityFrameworkCore;

namespace SmartAbp.OpsManagement.Infrastructure.EntityFrameworkCore;

/// <summary>
/// 运维管理数据库上下文
/// </summary>
[ConnectionStringName("OpsManagement")]
public class OpsManagementDbContext : AbpDbContext<OpsManagementDbContext>
{
    public DbSet<PerformanceMetric> PerformanceMetrics { get; set; }
    public DbSet<K8sResourceSnapshot> K8sResourceSnapshots { get; set; }
    public DbSet<AlertRule> AlertRules { get; set; }
    public DbSet<LogEntry> LogEntries { get; set; }

    public OpsManagementDbContext(DbContextOptions<OpsManagementDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.ConfigureOpsManagement();
    }
}

/// <summary>
/// 数据库模型配置扩展
/// </summary>
public static class OpsManagementDbContextModelCreatingExtensions
{
    public static void ConfigureOpsManagement(this ModelBuilder builder)
    {
        // PerformanceMetric配置
        builder.Entity<PerformanceMetric>(b =>
        {
            b.ToTable("PerformanceMetrics");
            b.HasKey(x => x.Id);
            
            b.Property(x => x.ServiceName).IsRequired().HasMaxLength(128);
            b.Property(x => x.InstanceId).IsRequired().HasMaxLength(128);
            b.Property(x => x.Tags).HasMaxLength(4000);
            
            // 索引优化查询性能
            b.HasIndex(x => new { x.ServiceName, x.Timestamp });
            b.HasIndex(x => x.Type);
        });

        // K8sResourceSnapshot配置
        builder.Entity<K8sResourceSnapshot>(b =>
        {
            b.ToTable("K8sResourceSnapshots");
            b.HasKey(x => x.Id);
            
            b.Property(x => x.ClusterName).IsRequired().HasMaxLength(128);
            b.Property(x => x.Namespace).IsRequired().HasMaxLength(128);
            b.Property(x => x.ResourceType).IsRequired().HasMaxLength(64);
            b.Property(x => x.ResourceName).IsRequired().HasMaxLength(256);
            b.Property(x => x.Status).HasMaxLength(64);
            b.Property(x => x.Labels).HasMaxLength(4000);
            
            // 索引
            b.HasIndex(x => new { x.ClusterName, x.Namespace, x.ResourceType });
            b.HasIndex(x => x.Timestamp);
        });

        // AlertRule配置
        builder.Entity<AlertRule>(b =>
        {
            b.ToTable("AlertRules");
            b.HasKey(x => x.Id);
            
            b.Property(x => x.RuleName).IsRequired().HasMaxLength(256);
            b.Property(x => x.MetricType).IsRequired().HasMaxLength(64);
            b.Property(x => x.Operator).IsRequired().HasMaxLength(16);
            b.Property(x => x.Severity).IsRequired().HasMaxLength(32);
            b.Property(x => x.TargetResource).HasMaxLength(256);
            b.Property(x => x.NotificationChannels).HasMaxLength(1000);
            
            // 索引
            b.HasIndex(x => x.IsEnabled);
            b.HasIndex(x => x.MetricType);
        });

        // LogEntry配置
        builder.Entity<LogEntry>(b =>
        {
            b.ToTable("LogEntries");
            b.HasKey(x => x.Id);
            
            b.Property(x => x.Timestamp).IsRequired();
            b.Property(x => x.Level).IsRequired().HasMaxLength(20);
            b.Property(x => x.Message).IsRequired();
            b.Property(x => x.ServiceName).IsRequired().HasMaxLength(100);
            b.Property(x => x.InstanceId).HasMaxLength(100);
            b.Property(x => x.Source).HasMaxLength(500);
            b.Property(x => x.TraceId).HasMaxLength(100);
            b.Property(x => x.RequestPath).HasMaxLength(500);
            b.Property(x => x.UserId).HasMaxLength(100);
            b.Property(x => x.ElasticsearchDocId).HasMaxLength(100);
            
            // 索引优化
            b.HasIndex(x => x.Timestamp);
            b.HasIndex(x => new { x.ServiceName, x.Timestamp });
            b.HasIndex(x => x.Level);
            b.HasIndex(x => x.TraceId);
            b.HasIndex(x => x.IsIndexed);
            b.HasIndex(x => x.ExpiresAt);
        });
    }
}

