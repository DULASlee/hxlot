using System.Collections.Generic;

namespace SmartAbp.CodeGenerator.ABP
{
    /// <summary>
    /// ABP审计日志生成参数
    /// </summary>
    public class AbpAuditLoggingGenerationArgs
    {
        /// <summary>
        /// 命名空间
        /// </summary>
        public string Namespace { get; set; } = null!;

        /// <summary>
        /// 实体名称
        /// </summary>
        public string EntityName { get; set; } = null!;

        /// <summary>
        /// 实体描述
        /// </summary>
        public string? Description { get; set; }

        /// <summary>
        /// 是否启用软删除审计
        /// </summary>
        public bool EnableSoftDeleteAudit { get; set; } = true;

        /// <summary>
        /// 是否启用创建审计
        /// </summary>
        public bool EnableCreationAudit { get; set; } = true;

        /// <summary>
        /// 是否启用修改审计
        /// </summary>
        public bool EnableModificationAudit { get; set; } = true;

        /// <summary>
        /// 是否启用删除审计
        /// </summary>
        public bool EnableDeletionAudit { get; set; } = true;

        /// <summary>
        /// 是否多租户
        /// </summary>
        public bool IsMultiTenant { get; set; } = false;

        /// <summary>
        /// 审计作用域（Controller/Service/Application/All）
        /// </summary>
        public string AuditScope { get; set; } = "All";

        /// <summary>
        /// 自定义审计字段
        /// </summary>
        public List<CustomAuditField>? CustomAuditFields { get; set; }

        /// <summary>
        /// 审计日志保留天数
        /// </summary>
        public int LogRetentionDays { get; set; } = 365;

        /// <summary>
        /// 是否启用详细错误记录
        /// </summary>
        public bool EnableDetailedErrorLogging { get; set; } = true;

        /// <summary>
        /// 审计日志存储提供者（Database/File/EventBus）
        /// </summary>
        public string LogStorageProvider { get; set; } = "Database";

        /// <summary>
        /// 是否启用性能监控
        /// </summary>
        public bool EnablePerformanceMonitoring { get; set; } = false;

        /// <summary>
        /// 性能阈值（毫秒）
        /// </summary>
        public int PerformanceThresholdMs { get; set; } = 1000;

        /// <summary>
        /// 审计日志级别（Info/Warning/Error/Debug）
        /// </summary>
        public string LogLevel { get; set; } = "Info";

        /// <summary>
        /// 是否启用敏感数据过滤
        /// </summary>
        public bool EnableSensitiveDataFilter { get; set; } = true;

        /// <summary>
        /// 敏感数据字段列表
        /// </summary>
        public List<string>? SensitiveFields { get; set; }
    }

    /// <summary>
    /// 自定义审计字段
    /// </summary>
    public class CustomAuditField
    {
        /// <summary>
        /// 字段名称
        /// </summary>
        public string FieldName { get; set; } = null!;

        /// <summary>
        /// 字段类型
        /// </summary>
        public string FieldType { get; set; } = null!;

        /// <summary>
        /// 字段描述
        /// </summary>
        public string? Description { get; set; }

        /// <summary>
        /// 是否必填
        /// </summary>
        public bool IsRequired { get; set; } = false;

        /// <summary>
        /// 最大长度
        /// </summary>
        public int? MaxLength { get; set; }
    }
}
