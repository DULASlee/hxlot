using System;
using Volo.Abp.Domain.Entities;

namespace SmartAbp.Domain.Entities.LowCode
{
    /// <summary>
    /// 🔥 验证规则
    /// 对应前端: ValidationRule (entityModeling.ts)
    /// 用途: 实体字段的验证规则
    /// </summary>
    public class ValidationRule : Entity<Guid>
    {
        /// <summary>
        /// 所属实体ID
        /// </summary>
        public Guid EntityDefinitionId { get; set; }

        /// <summary>
        /// 字段名称
        /// </summary>
        public string FieldName { get; set; }

        /// <summary>
        /// 规则类型：length, range, regex, unique, custom
        /// </summary>
        public string RuleType { get; set; }

        /// <summary>
        /// 规则值（如：长度范围、正则表达式、自定义表达式）
        /// </summary>
        public string RuleValue { get; set; }

        /// <summary>
        /// 错误消息
        /// </summary>
        public string ErrorMessage { get; set; }

        /// <summary>
        /// 规则描述
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// 是否启用
        /// </summary>
        public bool IsEnabled { get; set; }

        /// <summary>
        /// 优先级（数字越小优先级越高）
        /// </summary>
        public int Priority { get; set; }

        /// <summary>
        /// 导航属性：所属实体
        /// </summary>
        public virtual EntityDefinition EntityDefinition { get; set; }

        /// <summary>
        /// 构造函数（EF Core需要）
        /// </summary>
        public ValidationRule()
        {
        }

        /// <summary>
        /// 创建验证规则
        /// </summary>
        public ValidationRule(
            Guid id,
            Guid entityDefinitionId,
            string fieldName,
            string ruleType,
            string ruleValue,
            string errorMessage,
            string description = null,
            bool isEnabled = true,
            int priority = 0)
            : base(id)
        {
            EntityDefinitionId = entityDefinitionId;
            FieldName = fieldName;
            RuleType = ruleType;
            RuleValue = ruleValue;
            ErrorMessage = errorMessage;
            Description = description;
            IsEnabled = isEnabled;
            Priority = priority;
        }
    }
}

