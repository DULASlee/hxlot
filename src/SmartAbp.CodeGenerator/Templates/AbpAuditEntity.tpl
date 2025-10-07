using System;
using System.ComponentModel.DataAnnotations;
using Volo.Abp.Auditing;
using Volo.Abp.Domain.Entities;
using Volo.Abp.MultiTenancy;

namespace {{Namespace}}.Entities
{
    /// <summary>
    /// {{Description}}
    /// </summary>
    public class {{EntityName}} : Entity<Guid>{{AuditInterfaces}}{{TenantInterface}}
    {
        /// <summary>
        /// 操作名称
        /// </summary>
        [Required]
        [MaxLength(256)]
        public string OperationName { get; set; } = null!;

        /// <summary>
        /// 操作描述
        /// </summary>
        [MaxLength(1000)]
        public string? OperationDescription { get; set; }

        /// <summary>
        /// 实体类型
        /// </summary>
        [Required]
        [MaxLength(256)]
        public string EntityType { get; set; } = null!;

        /// <summary>
        /// 实体ID
        /// </summary>
        [MaxLength(128)]
        public string? EntityId { get; set; }

        /// <summary>
        /// 操作结果（Success/Failed/Warning）
        /// </summary>
        [Required]
        [MaxLength(50)]
        public string OperationResult { get; set; } = "Success";

        /// <summary>
        /// 执行持续时间（毫秒）
        /// </summary>
        public int ExecutionDuration { get; set; }

        /// <summary>
        /// IP地址
        /// </summary>
        [MaxLength(45)]
        public string? IpAddress { get; set; }

        /// <summary>
        /// 用户代理
        /// </summary>
        [MaxLength(500)]
        public string? UserAgent { get; set; }

        /// <summary>
        /// HTTP方法
        /// </summary>
        [MaxLength(10)]
        public string? HttpMethod { get; set; }

        /// <summary>
        /// 请求URL
        /// </summary>
        [MaxLength(1000)]
        public string? RequestUrl { get; set; }

        /// <summary>
        /// 异常信息
        /// </summary>
        public string? Exception { get; set; }

        /// <summary>
        /// 备注信息
        /// </summary>
        [MaxLength(2000)]
        public string? Comments { get; set; }
{{CustomFields}}

        protected {{EntityName}}()
        {
        }

        public {{EntityName}}(
            Guid id,
            string operationName,
            string entityType,
            string? operationDescription = null,
            string? entityId = null) : base(id)
        {
            OperationName = Check.NotNullOrEmpty(operationName, nameof(operationName));
            EntityType = Check.NotNullOrEmpty(entityType, nameof(entityType));
            OperationDescription = operationDescription;
            EntityId = entityId;
        }

        /// <summary>
        /// 设置操作结果
        /// </summary>
        public void SetResult(string result, int executionDuration, string? exception = null)
        {
            OperationResult = Check.NotNullOrEmpty(result, nameof(result));
            ExecutionDuration = executionDuration;
            Exception = exception;
        }

        /// <summary>
        /// 设置HTTP上下文信息
        /// </summary>
        public void SetHttpContext(string? ipAddress, string? userAgent, string? httpMethod, string? requestUrl)
        {
            IpAddress = ipAddress;
            UserAgent = userAgent;
            HttpMethod = httpMethod;
            RequestUrl = requestUrl;
        }
    }
}
