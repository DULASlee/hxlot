using System;
using System.Collections.Generic;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

namespace SmartAbp.Domain.CodeGeneration
{
    /// <summary>
    /// 代码生成任务实体
    /// 用于保存用户的代码生成配置和任务状态
    /// </summary>
    public class CodeGenerationTask : FullAuditedAggregateRoot<Guid>, IMultiTenant
    {
        /// <summary>
        /// 租户ID
        /// </summary>
        public Guid? TenantId { get; set; }

        /// <summary>
        /// 任务名称
        /// </summary>
        public string TaskName { get; set; }

        /// <summary>
        /// 生成器类型：MES大屏、UniApp移动应用
        /// </summary>
        public CodeGeneratorType GeneratorType { get; set; }

        /// <summary>
        /// 配置JSON（存储用户的完整配置）
        /// </summary>
        public string ConfigurationJson { get; set; }

        /// <summary>
        /// 任务状态
        /// </summary>
        public TaskStatus Status { get; set; }

        /// <summary>
        /// 生成结果（文件路径、下载链接等）
        /// </summary>
        public string ResultJson { get; set; }

        /// <summary>
        /// 错误信息（如果生成失败）
        /// </summary>
        public string ErrorMessage { get; set; }

        /// <summary>
        /// 生成开始时间
        /// </summary>
        public DateTime? StartTime { get; set; }

        /// <summary>
        /// 生成完成时间
        /// </summary>
        public DateTime? CompletedTime { get; set; }

        /// <summary>
        /// 输出目录
        /// </summary>
        public string OutputDirectory { get; set; }

        protected CodeGenerationTask()
        {
        }

        public CodeGenerationTask(
            Guid id,
            string taskName,
            CodeGeneratorType generatorType,
            string configurationJson,
            string outputDirectory = null
        ) : base(id)
        {
            TaskName = taskName;
            GeneratorType = generatorType;
            ConfigurationJson = configurationJson;
            OutputDirectory = outputDirectory ?? $"output/{taskName}_{DateTime.Now:yyyyMMddHHmmss}";
            Status = TaskStatus.Pending;
        }

        /// <summary>
        /// 开始生成
        /// </summary>
        public void StartGeneration()
        {
            Status = TaskStatus.Running;
            StartTime = DateTime.Now;
        }

        /// <summary>
        /// 标记为成功
        /// </summary>
        public void MarkAsSucceeded(string resultJson)
        {
            Status = TaskStatus.Succeeded;
            ResultJson = resultJson;
            CompletedTime = DateTime.Now;
        }

        /// <summary>
        /// 标记为失败
        /// </summary>
        public void MarkAsFailed(string errorMessage)
        {
            Status = TaskStatus.Failed;
            ErrorMessage = errorMessage;
            CompletedTime = DateTime.Now;
        }
    }

    /// <summary>
    /// 代码生成器类型
    /// </summary>
    public enum CodeGeneratorType
    {
        /// <summary>
        /// MES数字大屏
        /// </summary>
        MESDashboard = 1,

        /// <summary>
        /// UniApp移动应用
        /// </summary>
        UniAppMobile = 2,

        /// <summary>
        /// Web后台管理
        /// </summary>
        WebAdmin = 3,

        /// <summary>
        /// 微服务API
        /// </summary>
        MicroserviceAPI = 4
    }

    /// <summary>
    /// 任务状态
    /// </summary>
    public enum TaskStatus
    {
        /// <summary>
        /// 待处理
        /// </summary>
        Pending = 0,

        /// <summary>
        /// 运行中
        /// </summary>
        Running = 1,

        /// <summary>
        /// 成功
        /// </summary>
        Succeeded = 2,

        /// <summary>
        /// 失败
        /// </summary>
        Failed = 3,

        /// <summary>
        /// 已取消
        /// </summary>
        Cancelled = 4
    }
}

