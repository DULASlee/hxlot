using System;
using Volo.Abp.Application.Dtos;

namespace SmartAbp.Application.Contracts.LowCode.Dtos
{
    /// <summary>
    /// 🔥 验证规则DTO
    /// 对应前端: ValidationRule (entityModeling.ts)
    /// 对应后端: ValidationRule (Domain)
    /// </summary>
    public class ValidationRuleDto : EntityDto<Guid>
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
    }
}

