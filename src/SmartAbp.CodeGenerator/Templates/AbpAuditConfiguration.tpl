using Microsoft.Extensions.DependencyInjection;
using Volo.Abp.Auditing;
using Volo.Abp.Modularity;

namespace {{Namespace}}.Configuration
{
    /// <summary>
    /// {{EntityName}} 审计日志配置
    /// </summary>
    public static class {{EntityName}}AuditingConfiguration
    {
        /// <summary>
        /// 配置审计日志
        /// </summary>
        public static void Configure{{EntityName}}Auditing(this ServiceConfigurationContext context)
        {
            Configure<AbpAuditingOptions>(options =>
            {
{{AuditConfiguration}}{{SensitiveDataConfiguration}}{{PerformanceConfiguration}}
                
                // 日志保留策略
                options.EntityHistorySelectors.Add(
                    new NamedTypeSelector(
                        "{{EntityName}}",
                        type => type == typeof({{EntityName}})
                    )
                );

                // 审计日志清理配置
                // 保留天数: {{LogRetentionDays}} 天
                options.Contributors.Add(new AspNetCoreAuditLogContributor());
            });

            // 配置审计日志存储
            context.Services.Configure<AbpAuditingOptions>(options =>
            {
                options.HideErrors = false;
                options.IsEnabledForAnonymousUsers = false;
                options.ApplicationName = "{{EntityName}}App";
            });

            // 注册自定义审计服务
            context.Services.AddTransient<{{EntityName}}AuditService>();

            // 配置实体历史记录
            context.Services.Configure<AbpEntityHistoryOptions>(options =>
            {
                options.Selectors.Add(
                    new NamedTypeSelector(
                        "{{EntityName}}",
                        type => type.Namespace != null && type.Namespace.Contains("{{Namespace}}")
                    )
                );
            });
        }

        /// <summary>
        /// 配置审计日志中间件
        /// </summary>
        public static void Use{{EntityName}}Auditing(this IApplicationBuilder app)
        {
            app.UseAuditing();
        }
    }

    /// <summary>
    /// {{EntityName}} 审计日志选项
    /// </summary>
    public class {{EntityName}}AuditingOptions
    {
        /// <summary>
        /// 是否启用审计日志
        /// </summary>
        public bool IsEnabled { get; set; } = true;

        /// <summary>
        /// 审计范围
        /// </summary>
        public string AuditScope { get; set; } = "{{AuditScope}}";

        /// <summary>
        /// 日志保留天数
        /// </summary>
        public int LogRetentionDays { get; set; } = {{LogRetentionDays}};

        /// <summary>
        /// 是否启用敏感数据过滤
        /// </summary>
        public bool EnableSensitiveDataFilter { get; set; } = true;

        /// <summary>
        /// 是否启用性能监控
        /// </summary>
        public bool EnablePerformanceMonitoring { get; set; } = false;

        /// <summary>
        /// 性能监控阈值（毫秒）
        /// </summary>
        public int PerformanceThresholdMs { get; set; } = 1000;

        /// <summary>
        /// 审计日志存储提供者
        /// </summary>
        public string LogStorageProvider { get; set; } = "Database";

        /// <summary>
        /// 是否记录详细错误信息
        /// </summary>
        public bool EnableDetailedErrorLogging { get; set; } = true;
    }
}
