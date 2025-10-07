using System;
using Volo.Abp.Auditing;
using Volo.Abp.Domain.Entities;

namespace SmartAbp.Domain.BusinessRules
{
    /// <summary>
    /// 业务规则版本实体
    /// 用于追踪规则的变更历史
    /// </summary>
    public class BusinessRuleVersion : Entity<Guid>, IHasCreationTime, ICreationAuditedObject
    {
        /// <summary>
        /// 业务规则ID
        /// </summary>
        public Guid BusinessRuleId { get; set; }

        /// <summary>
        /// 版本号
        /// </summary>
        public int Version { get; set; }

        /// <summary>
        /// 规则名称（快照）
        /// </summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// 实体名称（快照）
        /// </summary>
        public string EntityName { get; set; } = string.Empty;

        /// <summary>
        /// 描述（快照）
        /// </summary>
        public string Description { get; set; } = string.Empty;

        /// <summary>
        /// 规则类型（快照）
        /// </summary>
        public string Type { get; set; } = string.Empty;

        /// <summary>
        /// 优先级（快照）
        /// </summary>
        public int Priority { get; set; }

        /// <summary>
        /// 是否激活（快照）
        /// </summary>
        public bool IsActive { get; set; }

        /// <summary>
        /// 条件配置JSON（快照）
        /// </summary>
        public string Conditions { get; set; } = string.Empty;

        /// <summary>
        /// 动作配置JSON（快照）
        /// </summary>
        public string Actions { get; set; } = string.Empty;

        /// <summary>
        /// 执行时机JSON（快照）
        /// </summary>
        public string ExecutionTiming { get; set; } = string.Empty;

        /// <summary>
        /// 变更类型
        /// </summary>
        public BusinessRuleChangeType ChangeType { get; set; }

        /// <summary>
        /// 变更说明
        /// </summary>
        public string ChangeDescription { get; set; } = string.Empty;

        /// <summary>
        /// 变更原因
        /// </summary>
        public string ChangeReason { get; set; } = string.Empty;

        /// <summary>
        /// 是否为当前版本
        /// </summary>
        public bool IsCurrent { get; set; }

        /// <summary>
        /// 创建时间
        /// </summary>
        public DateTime CreationTime { get; set; }

        /// <summary>
        /// 创建者ID
        /// </summary>
        public Guid? CreatorId { get; set; }

        /// <summary>
        /// 业务规则导航属性
        /// </summary>
        public virtual BusinessRule BusinessRule { get; set; } = null!;

        /// <summary>
        /// 构造函数
        /// </summary>
        protected BusinessRuleVersion()
        {
        }

        /// <summary>
        /// 构造函数
        /// </summary>
        public BusinessRuleVersion(
            Guid id,
            Guid businessRuleId,
            int version,
            BusinessRule rule,
            BusinessRuleChangeType changeType,
            string changeDescription = "",
            string changeReason = "") : base(id)
        {
            BusinessRuleId = businessRuleId;
            Version = version;
            ChangeType = changeType;
            ChangeDescription = changeDescription;
            ChangeReason = changeReason;
            IsCurrent = true;
            CreationTime = DateTime.UtcNow;

            // 创建规则快照
            CreateSnapshot(rule);
        }

        /// <summary>
        /// 创建规则快照
        /// </summary>
        private void CreateSnapshot(BusinessRule rule)
        {
            Name = rule.Name;
            EntityName = rule.EntityName;
            Description = rule.Description;
            Type = rule.Type;
            Priority = rule.Priority;
            IsActive = rule.IsActive;
            Conditions = rule.Conditions;
            Actions = rule.Actions;
            ExecutionTiming = rule.ExecutionTiming;
        }

        /// <summary>
        /// 标记为非当前版本
        /// </summary>
        public void MarkAsNotCurrent()
        {
            IsCurrent = false;
        }
    }

    /// <summary>
    /// 业务规则变更类型
    /// </summary>
    public enum BusinessRuleChangeType
    {
        /// <summary>
        /// 创建
        /// </summary>
        Created = 1,

        /// <summary>
        /// 更新
        /// </summary>
        Updated = 2,

        /// <summary>
        /// 激活
        /// </summary>
        Activated = 3,

        /// <summary>
        /// 停用
        /// </summary>
        Deactivated = 4,

        /// <summary>
        /// 删除
        /// </summary>
        Deleted = 5,

        /// <summary>
        /// 恢复
        /// </summary>
        Restored = 6,

        /// <summary>
        /// 复制
        /// </summary>
        Duplicated = 7
    }
}
