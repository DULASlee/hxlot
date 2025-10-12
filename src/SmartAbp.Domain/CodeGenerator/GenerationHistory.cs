using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace SmartAbp.CodeGenerator
{
    /// <summary>
    /// 代码生成历史记录
    /// </summary>
    public class GenerationHistory : CreationAuditedAggregateRoot<Guid>
    {
        /// <summary>
        /// 用户ID
        /// </summary>
        public virtual Guid UserId { get; set; }
        
        /// <summary>
        /// 生成模式
        /// </summary>
        public virtual string Mode { get; set; }
        
        /// <summary>
        /// 模板名称
        /// </summary>
        public virtual string TemplateName { get; set; }
        
        /// <summary>
        /// 项目名称
        /// </summary>
        public virtual string ProjectName { get; set; }
        
        /// <summary>
        /// 实体数量
        /// </summary>
        public virtual int EntityCount { get; set; }
        
        /// <summary>
        /// 生成文件数量
        /// </summary>
        public virtual int GeneratedFileCount { get; set; }
        
        /// <summary>
        /// 生成耗时（秒）
        /// </summary>
        public virtual int GenerationDuration { get; set; }
        
        /// <summary>
        /// 状态
        /// </summary>
        public virtual string Status { get; set; }
        
        /// <summary>
        /// 错误信息
        /// </summary>
        public virtual string ErrorMessage { get; set; }
        
        /// <summary>
        /// 元数据（JSON格式）
        /// </summary>
        public virtual string Metadata { get; set; }
        
        protected GenerationHistory() 
        {
            Mode = string.Empty;
            TemplateName = string.Empty;
            ProjectName = string.Empty;
            Status = string.Empty;
            ErrorMessage = string.Empty;
            Metadata = string.Empty;
        }
        
        public GenerationHistory(
            Guid id,
            Guid userId,
            string mode,
            string projectName,
            int entityCount,
            int fileCount,
            int duration,
            string status
        ) : base(id)
        {
            UserId = userId;
            Mode = mode;
            ProjectName = projectName;
            EntityCount = entityCount;
            GeneratedFileCount = fileCount;
            GenerationDuration = duration;
            Status = status;
        }
    }
}

