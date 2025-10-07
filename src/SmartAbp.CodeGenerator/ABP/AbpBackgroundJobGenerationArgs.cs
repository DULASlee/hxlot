using System.Collections.Generic;

namespace SmartAbp.CodeGenerator.ABP
{
    /// <summary>
    /// ABP后台作业生成参数
    /// </summary>
    public class AbpBackgroundJobGenerationArgs
    {
        /// <summary>
        /// 命名空间
        /// </summary>
        public string Namespace { get; set; } = null!;

        /// <summary>
        /// 作业名称
        /// </summary>
        public string JobName { get; set; } = null!;

        /// <summary>
        /// 作业描述
        /// </summary>
        public string? Description { get; set; }

        /// <summary>
        /// 作业参数类型（用于序列化）
        /// </summary>
        public string? ArgsType { get; set; }

        /// <summary>
        /// 是否支持重试
        /// </summary>
        public bool EnableRetry { get; set; } = true;

        /// <summary>
        /// 最大重试次数
        /// </summary>
        public int MaxRetryCount { get; set; } = 3;

        /// <summary>
        /// 作业优先级（Normal/Low/High）
        /// </summary>
        public string Priority { get; set; } = "Normal";

        /// <summary>
        /// Cron表达式（用于定时作业）
        /// </summary>
        public string? CronExpression { get; set; }

        /// <summary>
        /// 是否启用日志记录
        /// </summary>
        public bool EnableLogging { get; set; } = true;

        /// <summary>
        /// 作业超时时间（秒）
        /// </summary>
        public int TimeoutSeconds { get; set; } = 3600;

        /// <summary>
        /// 作业类型（DataSync/ReportGeneration/EmailSending/ScheduledTask/Custom）
        /// </summary>
        public string JobType { get; set; } = "Custom";

        /// <summary>
        /// 是否启用分布式锁
        /// </summary>
        public bool EnableDistributedLock { get; set; } = false;

        /// <summary>
        /// 自定义Execute方法实现代码
        /// </summary>
        public string? CustomExecuteCode { get; set; }

        /// <summary>
        /// 依赖的服务接口列表
        /// </summary>
        public List<ServiceDependency>? ServiceDependencies { get; set; }
    }

    /// <summary>
    /// 服务依赖定义
    /// </summary>
    public class ServiceDependency
    {
        /// <summary>
        /// 服务接口类型
        /// </summary>
        public string InterfaceType { get; set; } = null!;

        /// <summary>
        /// 服务字段名称
        /// </summary>
        public string FieldName { get; set; } = null!;

        /// <summary>
        /// 是否只读
        /// </summary>
        public bool IsReadonly { get; set; } = true;
    }
}

