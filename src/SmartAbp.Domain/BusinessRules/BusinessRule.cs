using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using Volo.Abp.Domain.Entities.Auditing;

namespace SmartAbp.Domain.BusinessRules
{
    /// <summary>
    /// 业务规则实体
    /// 企业级业务规则引擎的核心实体，支持条件配置、动作定义、执行监控
    /// </summary>
    public class BusinessRule : FullAuditedEntity<Guid>
    {
        /// <summary>
        /// 规则名称
        /// </summary>
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// 关联实体名称
        /// </summary>
        [Required]
        [MaxLength(100)]
        public string EntityName { get; set; } = string.Empty;

        /// <summary>
        /// 规则描述
        /// </summary>
        [MaxLength(1000)]
        public string Description { get; set; } = string.Empty;

        /// <summary>
        /// 规则类型：validation | business | calculation | workflow
        /// </summary>
        [Required]
        [MaxLength(50)]
        public string Type { get; set; } = string.Empty;

        /// <summary>
        /// 优先级 (1-100)
        /// </summary>
        public int Priority { get; set; } = 50;

        /// <summary>
        /// 是否激活
        /// </summary>
        public bool IsActive { get; set; } = true;

        /// <summary>
        /// 是否有错误
        /// </summary>
        public bool HasError { get; set; } = false;

        /// <summary>
        /// 规则条件 (JSON格式存储)
        /// </summary>
        public string Conditions { get; set; } = "[]";

        /// <summary>
        /// 规则动作 (JSON格式存储)
        /// </summary>
        public string Actions { get; set; } = "[]";

        /// <summary>
        /// 执行时机：创建前、创建后、更新前、更新后、删除前
        /// </summary>
        public string ExecutionTiming { get; set; } = "[]";

        /// <summary>
        /// 最后执行结果 (JSON格式)
        /// </summary>
        public string? LastExecutionResult { get; set; }

        /// <summary>
        /// 最后执行时间
        /// </summary>
        public DateTime? LastExecutionTime { get; set; }

        /// <summary>
        /// 执行次数
        /// </summary>
        public int ExecutionCount { get; set; } = 0;

        /// <summary>
        /// 成功次数
        /// </summary>
        public int SuccessCount { get; set; } = 0;

        /// <summary>
        /// 失败次数
        /// </summary>
        public int FailureCount { get; set; } = 0;

        /// <summary>
        /// 平均执行时间 (毫秒)
        /// </summary>
        public decimal AverageExecutionTime { get; set; } = 0;

        /// <summary>
        /// 规则版本
        /// </summary>
        public int Version { get; set; } = 1;

        /// <summary>
        /// 规则创建者用户ID
        /// </summary>
        public Guid? CreatorUserId { get; set; }

        /// <summary>
        /// 规则所属租户ID
        /// </summary>
        public Guid? TenantId { get; set; }

        /// <summary>
        /// 版本历史导航属性
        /// </summary>
        public virtual ICollection<BusinessRuleVersion> Versions { get; set; } = new List<BusinessRuleVersion>();

        /// <summary>
        /// 构造函数
        /// </summary>
        public BusinessRule()
        {
        }

        /// <summary>
        /// 带参数构造函数
        /// </summary>
        public BusinessRule(
            Guid id,
            string name,
            string entityName,
            string type,
            int priority = 50) : base(id)
        {
            Name = name;
            EntityName = entityName;
            Type = type;
            Priority = priority;
        }

        /// <summary>
        /// 更新执行统计
        /// </summary>
        public void UpdateExecutionStats(bool success, decimal executionTime)
        {
            ExecutionCount++;
            
            if (success)
            {
                SuccessCount++;
            }
            else
            {
                FailureCount++;
            }

            // 计算平均执行时间
            AverageExecutionTime = ((AverageExecutionTime * (ExecutionCount - 1)) + executionTime) / ExecutionCount;
            
            LastExecutionTime = DateTime.UtcNow;
        }

        /// <summary>
        /// 计算成功率
        /// </summary>
        public decimal GetSuccessRate()
        {
            if (ExecutionCount == 0)
                return 0;
            
            return Math.Round((decimal)SuccessCount / ExecutionCount * 100, 2);
        }

        /// <summary>
        /// 验证规则完整性
        /// </summary>
        public bool IsValid()
        {
            if (string.IsNullOrWhiteSpace(Name))
                return false;
            
            if (string.IsNullOrWhiteSpace(EntityName))
                return false;
            
            if (string.IsNullOrWhiteSpace(Type))
                return false;
            
            if (Priority < 1 || Priority > 100)
                return false;
            
            return true;
        }

        /// <summary>
        /// 创建新版本
        /// </summary>
        public BusinessRuleVersion CreateVersion(BusinessRuleChangeType changeType, string changeDescription = "", string changeReason = "")
        {
            // 将当前所有版本标记为非当前版本
            foreach (var version in Versions)
            {
                version.MarkAsNotCurrent();
            }

            // 增加版本号
            Version++;

            // 创建新版本
            var newVersion = new BusinessRuleVersion(
                Guid.NewGuid(),
                Id,
                Version,
                this,
                changeType,
                changeDescription,
                changeReason);

            Versions.Add(newVersion);
            return newVersion;
        }

        /// <summary>
        /// 获取当前版本
        /// </summary>
        public BusinessRuleVersion? GetCurrentVersion()
        {
            return Versions.FirstOrDefault(v => v.IsCurrent);
        }

        /// <summary>
        /// 获取版本历史
        /// </summary>
        public IEnumerable<BusinessRuleVersion> GetVersionHistory()
        {
            return Versions.OrderByDescending(v => v.Version);
        }

        /// <summary>
        /// 恢复到指定版本
        /// </summary>
        public void RestoreToVersion(BusinessRuleVersion targetVersion)
        {
            if (targetVersion.BusinessRuleId != Id)
                throw new ArgumentException("版本不属于当前规则");

            // 恢复规则内容
            Name = targetVersion.Name;
            EntityName = targetVersion.EntityName;
            Description = targetVersion.Description;
            Type = targetVersion.Type;
            Priority = targetVersion.Priority;
            IsActive = targetVersion.IsActive;
            Conditions = targetVersion.Conditions;
            Actions = targetVersion.Actions;
            ExecutionTiming = targetVersion.ExecutionTiming;

            // 创建恢复版本记录
            CreateVersion(BusinessRuleChangeType.Restored, $"恢复到版本 {targetVersion.Version}", "用户手动恢复");
        }
    }
}
